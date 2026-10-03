import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

import {
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
} from "../src/server/payments/razorpay";
import {
  signQrPayload,
  verifyQrPayload,
  generateRegistrationCode,
  type QrTicketPayload,
} from "../src/server/events/registration";

describe("Signature Verification & QR Token Cryptography", () => {
  const secretKey = "test_razorpay_secret_key_12345";
  const webhookSecret = "test_razorpay_webhook_secret_67890";

  describe("Razorpay Client Payment Signature", () => {
    it("should accept valid HMAC-SHA256 signature for orderId + paymentId", () => {
      const orderId = "order_Oq7Jk8Lm9Np";
      const paymentId = "pay_Pq123456789";

      const validSignature = crypto
        .createHmac("sha256", secretKey)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const result = verifyRazorpaySignature({
        orderId,
        paymentId,
        signature: validSignature,
        secret: secretKey,
      });

      assert.equal(result, true, "Valid signature must be verified successfully");
    });

    it("should reject tampered or invalid payment signature", () => {
      const orderId = "order_Oq7Jk8Lm9Np";
      const paymentId = "pay_Pq123456789";
      const tamperedSignature = "0000000000000000000000000000000000000000000000000000000000000000";

      const result = verifyRazorpaySignature({
        orderId,
        paymentId,
        signature: tamperedSignature,
        secret: secretKey,
      });

      assert.equal(result, false, "Tampered signature must be rejected");
    });

    it("should reject signature when payment ID is altered", () => {
      const orderId = "order_Oq7Jk8Lm9Np";
      const paymentId = "pay_Pq123456789";

      const validSignature = crypto
        .createHmac("sha256", secretKey)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const result = verifyRazorpaySignature({
        orderId,
        paymentId: "pay_DIFFERENT_ATTACKER_ID",
        signature: validSignature,
        secret: secretKey,
      });

      assert.equal(result, false, "Signature for different paymentId must fail");
    });
  });

  describe("Razorpay Webhook Signature Verification", () => {
    it("should accept valid webhook signature computed over raw body", () => {
      const rawBody = JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: { entity: { id: "pay_987", order_id: "order_654" } },
        },
      });

      const validWebhookSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      const result = verifyRazorpayWebhookSignature({
        rawBody,
        signature: validWebhookSig,
        secret: webhookSecret,
      });

      assert.equal(result, true, "Webhook signature matching raw body must be verified");
    });

    it("should reject webhook when raw body is tampered by even 1 character", () => {
      const rawBody = JSON.stringify({ event: "order.paid", amount: 500 });
      const validWebhookSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      const tamperedBody = JSON.stringify({ event: "order.paid", amount: 501 });

      const result = verifyRazorpayWebhookSignature({
        rawBody: tamperedBody,
        signature: validWebhookSig,
        secret: webhookSecret,
      });

      assert.equal(result, false, "Webhook with tampered payload must be rejected");
    });
  });

  describe("QR Ticket Token Generation & HMAC Verification", () => {
    const samplePayload: QrTicketPayload = {
      registrationCode: "KX-PADH-0001",
      eventId: "cuid_event_123",
      ticketTypeId: "cuid_tier_456",
      email: "builder@kailshians.org",
      issuedAt: 1775200000000,
    };

    it("should sign payload and successfully verify it", () => {
      const token = signQrPayload(samplePayload);
      assert.ok(token.includes("."), "Token must be in format <dataB64>.<sig>");

      const verification = verifyQrPayload(token);
      assert.equal(verification.valid, true);
      assert.ok(verification.payload);
      assert.equal(verification.payload?.registrationCode, "KX-PADH-0001");
      assert.equal(verification.payload?.email, "builder@kailshians.org");
      assert.equal(verification.payload?.eventId, "cuid_event_123");
    });

    it("should reject tampered payload in QR token", () => {
      const token = signQrPayload(samplePayload);
      const [, signature] = token.split(".");

      // Tamper with payload (change email inside base64)
      const tamperedJson = JSON.stringify({
        ...samplePayload,
        email: "hacker@evil.com",
      });
      const tamperedB64 = Buffer.from(tamperedJson).toString("base64url");
      const forgedToken = `${tamperedB64}.${signature}`;

      const verification = verifyQrPayload(forgedToken);
      assert.equal(verification.valid, false, "Tampered payload token must fail verification");
      assert.match(verification.error || "", /Invalid ticket signature/i);
    });

    it("should reject malformed or non-token strings", () => {
      assert.equal(verifyQrPayload("").valid, false);
      assert.equal(verifyQrPayload("not-a-token").valid, false);
      assert.equal(verifyQrPayload("abc.").valid, false);
    });

    it("should generate formatted human-readable code: KX-<EVENTCODE>-<NNNN>", () => {
      const code1 = generateRegistrationCode("padharox-01", 1);
      assert.equal(code1, "KX-PA01-0001");

      const code2 = generateRegistrationCode("nirmanx-2026", 42);
      assert.equal(code2, "KX-NI20-0042");

      const code3 = generateRegistrationCode("summit", 999);
      assert.equal(code3, "KX-SUMM-0999");
    });
  });
});
