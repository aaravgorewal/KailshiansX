import crypto from "crypto";
import Razorpay from "razorpay";

const KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "kws_test_rzp_secret_2026";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "kws_rzp_webhook_secret_dev_2026";

const isTestEnv =
  process.env.NODE_ENV === "test" || KEY_ID.includes("dummy") || KEY_ID === "rzp_test_your_key_id";

// Initialize Razorpay instance if keys are real
let razorpayInstance: Razorpay | null = null;
try {
  if (!isTestEnv) {
    razorpayInstance = new Razorpay({
      key_id: KEY_ID,
      key_secret: KEY_SECRET,
    });
  }
} catch {
  razorpayInstance = null;
}

export interface CreateOrderParams {
  amount: number; // in INR (Rupees)
  receipt: string;
  notes?: Record<string, string>;
  currency?: string;
}

export interface RazorpayOrderResult {
  id: string;
  amount: number; // in paise
  currency: string;
  receipt: string;
}

/**
 * Create a server-side Razorpay order
 */
export async function createRazorpayOrder(params: CreateOrderParams): Promise<RazorpayOrderResult> {
  const amountInPaise = Math.round(params.amount * 100);
  const currency = params.currency || "INR";

  if (isTestEnv || !razorpayInstance) {
    // Deterministic mock order for tests & local dev
    return {
      id: `order_mock_${params.receipt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}_${Date.now()}`,
      amount: amountInPaise,
      currency,
      receipt: params.receipt,
    };
  }

  const order = await razorpayInstance.orders.create({
    amount: amountInPaise,
    currency,
    receipt: params.receipt,
    notes: params.notes,
  });

  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    receipt: order.receipt || params.receipt,
  };
}

/**
 * Verify client payment signature from Razorpay Checkout modal
 * signature = HMAC_SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyRazorpayPaymentSignature({
  orderId,
  paymentId,
  signature,
  secret = KEY_SECRET,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret?: string;
}): boolean {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

export const verifyRazorpaySignature = verifyRazorpayPaymentSignature;

/**
 * Verify Razorpay Webhook signature
 * signature = HMAC_SHA256(raw_body, webhook_secret)
 */
export function verifyRazorpayWebhookSignature({
  rawBody,
  signature,
  secret = WEBHOOK_SECRET,
}: {
  rawBody: string;
  signature: string;
  secret?: string;
}): boolean {
  if (!rawBody || !signature) {
    return false;
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Process a full or partial refund
 */
export async function refundRazorpayPayment({
  paymentId,
  amountInRupees,
  notes,
}: {
  paymentId: string;
  amountInRupees?: number;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; status: string }> {
  const amountInPaise = amountInRupees ? Math.round(amountInRupees * 100) : undefined;

  if (isTestEnv || !razorpayInstance) {
    return {
      id: `rfnd_mock_${Date.now()}`,
      amount: amountInPaise || 10000,
      status: "processed",
    };
  }

  const refund = await razorpayInstance.payments.refund(paymentId, {
    ...(amountInPaise ? { amount: amountInPaise } : {}),
    notes,
  });

  return {
    id: refund.id,
    amount: Number(refund.amount),
    status: refund.status || "processed",
  };
}
