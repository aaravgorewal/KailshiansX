import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  createRazorpayOrder,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "@/server/payments/razorpay";
import {
  generateRegistrationCode,
  signQrPayload,
  verifyQrPayload,
} from "@/server/events/registration";

describe("Payment & Ticket Cryptography Services (Unit)", () => {
  const secretKey = "test_secret_for_vitest";

  describe("Razorpay Signature Verification (razorpay.ts)", () => {
    it("should generate and verify valid payment signature correctly", () => {
      const orderId = "order_test_123456";
      const paymentId = "pay_test_987654";
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const isValid = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature,
        secret: secretKey,
      });

      expect(isValid).toBe(true);
    });

    it("should reject tampered payment signatures", () => {
      const orderId = "order_test_123456";
      const paymentId = "pay_test_987654";
      const badSignature = "0000000000000000000000000000000000000000000000000000000000000000";

      const isValid = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: badSignature,
        secret: secretKey,
      });

      expect(isValid).toBe(false);
    });

    it("should verify webhook raw payload signature", () => {
      const webhookSecret = "test_webhook_secret_vitest";
      const rawPayload = JSON.stringify({
        event: "payment.captured",
        payload: { payment: { entity: { id: "pay_123", amount: 49900 } } },
      });

      const signature = crypto.createHmac("sha256", webhookSecret).update(rawPayload).digest("hex");

      const isValid = verifyRazorpayWebhookSignature({
        rawBody: rawPayload,
        signature,
        secret: webhookSecret,
      });

      expect(isValid).toBe(true);
    });

    it("should generate simulated order in test mode", async () => {
      const order = await createRazorpayOrder({
        amount: 499,
        receipt: "rcpt_vitest_unit_01",
      });

      expect(order.id).toBeDefined();
      expect(order.amount).toBe(49900);
      expect(order.currency).toBe("INR");
      expect(order.receipt).toBe("rcpt_vitest_unit_01");
    });
  });

  describe("QR Ticket Cryptography & Registration Codes (registration.ts)", () => {
    it("should generate structured registration codes KX-<SLUG>-<SEQ>", () => {
      const code1 = generateRegistrationCode("dev-summit", 42);
      expect(code1).toBe("KX-DESU-0042");

      const code2 = generateRegistrationCode("padharo-01", 7);
      expect(code2).toBe("KX-PA01-0007");
    });

    it("should sign and verify valid ticket payloads", () => {
      const payload = {
        registrationCode: "KX-DESU-0001",
        eventId: "evt-test-123",
        ticketTypeId: "tkt-test-456",
        email: "attendee@example.com",
        issuedAt: Date.now(),
      };

      const token = signQrPayload(payload);
      expect(token).toContain(".");

      const result = verifyQrPayload(token);
      expect(result.valid).toBe(true);
      expect(result.payload?.registrationCode).toBe("KX-DESU-0001");
      expect(result.payload?.email).toBe("attendee@example.com");
    });

    it("should reject tampered ticket token signatures", () => {
      const payload = {
        registrationCode: "KX-DESU-0001",
        eventId: "evt-test-123",
        ticketTypeId: "tkt-test-456",
        email: "attendee@example.com",
        issuedAt: Date.now(),
      };

      const token = signQrPayload(payload);
      const [data] = token.split(".");
      const tamperedToken = `${data}.badsignaturedeadbeef1234567890abcdef1234567890abcdef1234567890abcdef`;

      const result = verifyQrPayload(tamperedToken);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid ticket signature");
    });
  });
});
