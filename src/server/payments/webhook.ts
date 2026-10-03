import { db } from "@/lib/db";
import { verifyRazorpayWebhookSignature } from "@/server/payments/razorpay";
import { signQrPayload, generateQrCodeDataUrl } from "@/server/events/registration";
import { sendRegistrationConfirmationEmail } from "@/server/email/confirmation";
import {
  queuePaymentFailedEmail,
  queueRefundProcessedEmail,
  queueEventReminderEmail,
} from "@/server/email";

export interface WebhookProcessResult {
  status: number;
  message: string;
  error?: string;
  processed?: boolean;
  duplicate?: boolean;
}

/**
 * Core business logic for processing Razorpay webhooks with idempotency
 */
export async function processRazorpayWebhook({
  rawBody,
  signature,
  secret,
}: {
  rawBody: string;
  signature?: string | null;
  secret?: string;
}): Promise<WebhookProcessResult> {
  if (!signature) {
    return {
      status: 400,
      message: "Missing webhook signature",
      error: "Missing webhook signature",
    };
  }

  const isValid = verifyRazorpayWebhookSignature({
    rawBody,
    signature,
    secret,
  });

  if (!isValid) {
    return { status: 400, message: "Invalid signature", error: "Invalid signature" };
  }

  interface RazorpayWebhookEvent {
    event: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          amount?: number;
        };
      };
      order?: {
        entity?: {
          id?: string;
        };
      };
      refund?: {
        entity?: {
          id?: string;
          payment_id?: string;
          amount?: number | string;
        };
      };
    };
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return { status: 400, message: "Malformed JSON payload", error: "Malformed JSON payload" };
  }

  const eventType = event.event;

  // 1. Payment Capture / Order Paid
  if (eventType === "payment.captured" || eventType === "order.paid") {
    const paymentEntity = event.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
    const paymentId = paymentEntity?.id;

    if (!orderId) {
      return {
        status: 400,
        message: "No order_id found in payload",
        error: "No order_id in webhook payload",
      };
    }

    const existingPayment = await db.payment.findUnique({
      where: { razorpayOrderId: orderId },
      include: {
        registration: {
          include: {
            event: { include: { city: true } },
            ticketType: true,
          },
        },
      },
    });

    if (!existingPayment) {
      // Return 200 so Razorpay does not endlessly retry unknown orders
      return { status: 200, message: "Order not recognized in local DB", processed: false };
    }

    // IDEMPOTENCY CHECK: If already captured and confirmed, exit safely
    if (
      existingPayment.status === "CAPTURED" &&
      existingPayment.registration.status === "CONFIRMED"
    ) {
      return {
        status: 200,
        message: "Already processed (Idempotent)",
        processed: false,
        duplicate: true,
      };
    }

    // Complete registration atomically inside transaction
    await db.$transaction(async (tx) => {
      const qrPayload = signQrPayload({
        registrationCode: existingPayment.registration.registrationCode,
        eventId: existingPayment.registration.eventId,
        ticketTypeId: existingPayment.registration.ticketTypeId,
        email: existingPayment.registration.email,
        issuedAt: Date.now(),
      });

      const qrDataUrl = await generateQrCodeDataUrl(qrPayload);

      await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "CAPTURED",
          razorpayPaymentId: paymentId || existingPayment.razorpayPaymentId,
        },
      });

      await tx.registration.update({
        where: { id: existingPayment.registration.id },
        data: {
          status: "CONFIRMED",
          holdExpiresAt: null,
          qrPayload,
          qrCodeUrl: qrDataUrl,
        },
      });

      // Send confirmation email asynchronously
      sendRegistrationConfirmationEmail({
        email: existingPayment.registration.email,
        name: existingPayment.registration.name,
        eventTitle: existingPayment.registration.event.title,
        eventSlug: existingPayment.registration.event.slug,
        eventDate: existingPayment.registration.event.startDate,
        venue: existingPayment.registration.event.venue,
        cityName: existingPayment.registration.event.city?.name,
        ticketTierName: existingPayment.registration.ticketType.name,
        registrationCode: existingPayment.registration.registrationCode,
        qrCodeDataUrl: qrDataUrl,
      }).catch((err) => console.error("Webhook email send failed:", err));

      // Schedule 24h event reminder if event starts in the future
      const eventStartDate = existingPayment.registration.event.startDate;
      const reminderTime = new Date(new Date(eventStartDate).getTime() - 24 * 60 * 60 * 1000);
      if (reminderTime.getTime() > Date.now()) {
        queueEventReminderEmail(
          existingPayment.registration.email,
          {
            name: existingPayment.registration.name,
            eventTitle: existingPayment.registration.event.title,
            eventSlug: existingPayment.registration.event.slug,
            eventDate: eventStartDate,
            venue: existingPayment.registration.event.venue,
            cityName: existingPayment.registration.event.city?.name,
            registrationCode: existingPayment.registration.registrationCode,
          },
          { scheduledFor: reminderTime, immediate: false }
        ).catch((err) => console.error("Webhook reminder schedule error:", err));
      }
    });

    return {
      status: 200,
      message: "Registration confirmed via webhook",
      processed: true,
      duplicate: false,
    };
  }

  // 2. Refunds Processed
  if (eventType === "refund.processed") {
    const refundEntity = event.payload?.refund?.entity;
    const paymentId = refundEntity?.payment_id;
    const refundAmount = refundEntity?.amount ? Number(refundEntity.amount) / 100 : undefined;

    if (paymentId) {
      const payment = await db.payment.findUnique({
        where: { razorpayPaymentId: paymentId },
        include: {
          registration: {
            include: { event: true },
          },
        },
      });

      if (payment) {
        // Idempotency: if already processed and matches refundId
        if (payment.refundStatus === "PROCESSED" && payment.refundId === refundEntity?.id) {
          return {
            status: 200,
            message: "Refund already processed (Idempotent)",
            processed: false,
            duplicate: true,
          };
        }

        const isFull = !refundAmount || refundAmount >= Number(payment.amount);

        await db.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: isFull ? "REFUNDED" : "PARTIALLY_REFUNDED",
              refundStatus: "PROCESSED",
              refundAmount: refundAmount ?? payment.amount,
              refundId: refundEntity?.id,
            },
          });

          if (isFull) {
            await tx.registration.update({
              where: { id: payment.registrationId },
              data: { status: "CANCELLED" },
            });
          }
        });

        // Queue refund processed email
        queueRefundProcessedEmail(payment.registration.email, {
          name: payment.registration.name,
          eventTitle: payment.registration.event.title,
          amount: Math.round(Number(refundAmount ?? payment.amount) * 100),
          refundId: refundEntity?.id || "refund_webhook",
          paymentId: payment.razorpayPaymentId,
          registrationCode: payment.registration.registrationCode,
        }).catch((err) => console.error("Webhook refund email error:", err));
      }
    }

    return { status: 200, message: "Refund processed via webhook", processed: true };
  }

  // 3. Payment Failed
  if (eventType === "payment.failed") {
    const paymentEntity = event.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
    if (orderId) {
      const payment = await db.payment.findUnique({
        where: { razorpayOrderId: orderId },
        include: {
          registration: {
            include: { event: true },
          },
        },
      });

      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        });

        queuePaymentFailedEmail(payment.registration.email, {
          name: payment.registration.name,
          eventTitle: payment.registration.event.title,
          eventSlug: payment.registration.event.slug,
          amount: Math.round(Number(payment.amount) * 100),
          orderId: payment.razorpayOrderId,
          failureReason:
            ((paymentEntity as Record<string, unknown> | undefined)?.error_description as
              string | undefined) || "Card or UPI transaction declined by issuing bank.",
        }).catch((err) => console.error("Webhook payment failed email error:", err));

        return {
          status: 200,
          message: "Payment failure recorded and email queued",
          processed: true,
        };
      }
    }

    return { status: 200, message: "Payment failure logged", processed: true };
  }

  return { status: 200, message: "Event ignored", processed: false };
}
