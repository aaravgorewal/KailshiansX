import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

import { db } from "../src/lib/db";
import { processRazorpayWebhook } from "../src/server/payments/webhook";

describe("Razorpay Webhook Processing & Idempotency", () => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret_kx_2026";
  let testEventId: string;
  let testTicketTypeId: string;
  let testRegId: string;
  const testOrderId = `order_test_${Date.now()}`;
  const testPaymentRzpId = `pay_test_${Date.now()}`;

  function createSignedWebhookPayload(eventObj: Record<string, unknown>) {
    const rawBody = JSON.stringify(eventObj);
    const signature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    return { rawBody, signature };
  }

  before(async () => {
    // 1. Create test event & ticket tier
    const event = await db.event.create({
      data: {
        title: "Webhook Idempotency Test Conference",
        slug: `webhook-test-${Date.now()}`,
        type: "MEETUP",
        status: "PUBLISHED",
        startDate: new Date(Date.now() + 86400000),
      },
    });
    testEventId = event.id;

    const ticketType = await db.ticketType.create({
      data: {
        eventId: testEventId,
        name: "Pro Pass",
        price: 499,
        quota: 50,
      },
    });
    testTicketTypeId = ticketType.id;

    // 2. Create pending registration
    const registration = await db.registration.create({
      data: {
        registrationCode: "KX-WHOK-0001",
        eventId: testEventId,
        ticketTypeId: testTicketTypeId,
        name: "Webhook Tester",
        email: "webhook.tester@kailshians.org",
        phone: "+919988776655",
        status: "PENDING",
        holdExpiresAt: new Date(Date.now() + 600000),
      },
    });
    testRegId = registration.id;

    // 3. Create pending payment record
    await db.payment.create({
      data: {
        registrationId: testRegId,
        razorpayOrderId: testOrderId,
        amount: 499,
        status: "PENDING",
      },
    });
  });

  after(async () => {
    await db.payment.deleteMany({
      where: { razorpayOrderId: testOrderId },
    });
    await db.registration.deleteMany({
      where: { eventId: testEventId },
    });
    await db.ticketType.deleteMany({
      where: { eventId: testEventId },
    });
    await db.event.delete({
      where: { id: testEventId },
    });
  });

  it("should reject webhook with missing signature", async () => {
    const result = await processRazorpayWebhook({
      rawBody: JSON.stringify({ event: "payment.captured" }),
      signature: null,
      secret: webhookSecret,
    });

    assert.equal(result.status, 400);
    assert.match(result.error || "", /Missing webhook signature/i);
  });

  it("should reject webhook with invalid signature", async () => {
    const result = await processRazorpayWebhook({
      rawBody: JSON.stringify({ event: "payment.captured" }),
      signature: "bad_signature_hex_12345",
      secret: webhookSecret,
    });

    assert.equal(result.status, 400);
    assert.match(result.error || "", /Invalid signature/i);
  });

  it("should successfully process payment.captured webhook and confirm registration", async () => {
    const payload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: testPaymentRzpId,
            order_id: testOrderId,
            amount: 49900,
            status: "captured",
          },
        },
      },
    };

    const { rawBody, signature } = createSignedWebhookPayload(payload);

    const result = await processRazorpayWebhook({
      rawBody,
      signature,
      secret: webhookSecret,
    });

    assert.equal(result.status, 200);
    assert.equal(result.processed, true);
    assert.equal(result.duplicate, false);

    // Verify DB was updated
    const updatedPayment = await db.payment.findUnique({
      where: { razorpayOrderId: testOrderId },
    });
    assert.equal(updatedPayment?.status, "CAPTURED");
    assert.equal(updatedPayment?.razorpayPaymentId, testPaymentRzpId);

    const updatedReg = await db.registration.findUnique({
      where: { id: testRegId },
    });
    assert.equal(updatedReg?.status, "CONFIRMED");
    assert.equal(updatedReg?.holdExpiresAt, null, "Seat hold must be cleared upon confirmation");
    assert.ok(updatedReg?.qrPayload, "QR payload must be generated");
    assert.ok(updatedReg?.qrCodeUrl, "QR Code Data URL must be generated");
  });

  it("should be strictly IDEMPOTENT when the exact same webhook is redelivered", async () => {
    // Deliver the exact same webhook event again
    const payload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: testPaymentRzpId,
            order_id: testOrderId,
            amount: 49900,
            status: "captured",
          },
        },
      },
    };

    const { rawBody, signature } = createSignedWebhookPayload(payload);

    const result = await processRazorpayWebhook({
      rawBody,
      signature,
      secret: webhookSecret,
    });

    // Must return 200 without reprocessing or throwing errors
    assert.equal(result.status, 200);
    assert.equal(result.processed, false);
    assert.equal(result.duplicate, true, "Must detect already-processed payment as duplicate");

    // Check DB state is still intact
    const payment = await db.payment.findUnique({
      where: { razorpayOrderId: testOrderId },
    });
    assert.equal(payment?.status, "CAPTURED");
  });

  it("should handle unknown order ID gracefully without throwing error", async () => {
    const payload = {
      event: "order.paid",
      payload: {
        order: {
          entity: {
            id: "order_UNKNOWN_UNRECOGNIZED_999",
            status: "paid",
          },
        },
      },
    };

    const { rawBody, signature } = createSignedWebhookPayload(payload);

    const result = await processRazorpayWebhook({
      rawBody,
      signature,
      secret: webhookSecret,
    });

    assert.equal(result.status, 200);
    assert.equal(result.processed, false);
    assert.match(result.message, /not recognized/i);
  });

  it("should handle refund.processed webhook and mark registration CANCELLED", async () => {
    const refundId = `rfnd_${Date.now()}`;
    const payload = {
      event: "refund.processed",
      payload: {
        refund: {
          entity: {
            id: refundId,
            payment_id: testPaymentRzpId,
            amount: 49900, // full refund
            status: "processed",
          },
        },
      },
    };

    const { rawBody, signature } = createSignedWebhookPayload(payload);

    const result = await processRazorpayWebhook({
      rawBody,
      signature,
      secret: webhookSecret,
    });

    assert.equal(result.status, 200);
    assert.equal(result.processed, true);

    const payment = await db.payment.findUnique({
      where: { razorpayOrderId: testOrderId },
    });
    assert.equal(payment?.status, "REFUNDED");
    assert.equal(payment?.refundStatus, "PROCESSED");
    assert.equal(payment?.refundId, refundId);

    const reg = await db.registration.findUnique({
      where: { id: testRegId },
    });
    assert.equal(
      reg?.status,
      "CANCELLED",
      "Full refund should cancel registration and release quota"
    );

    // Redelivery test for refund idempotency
    const redelivery = await processRazorpayWebhook({
      rawBody,
      signature,
      secret: webhookSecret,
    });
    assert.equal(redelivery.status, 200);
    assert.equal(redelivery.duplicate, true, "Refund redelivery must be recognized as idempotent");
  });
});
