"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import { writeAudit } from "@/server/auth/audit";
import { refundRazorpayPayment } from "@/server/payments/razorpay";
import { Prisma } from "@prisma/client";

export interface RefundInput {
  paymentId: string; // Internal Payment.id or razorpayPaymentId
  amountInRupees?: number; // Optional: If omitted, full refund is issued
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  message?: string;
  error?: string;
  refundId?: string;
  refundAmount?: number;
  paymentStatus?: string;
  registrationStatus?: string;
}

/**
 * Admin action to process full or partial refund for a registration payment
 */
export async function processAdminRefund({
  paymentId,
  amountInRupees,
  reason,
}: RefundInput): Promise<RefundResult> {
  const session = await requireAdmin();

  // Find payment record
  const payment = await db.payment.findFirst({
    where: {
      OR: [{ id: paymentId }, { razorpayPaymentId: paymentId }, { razorpayOrderId: paymentId }],
    },
    include: {
      registration: {
        include: {
          event: true,
          ticketType: true,
        },
      },
    },
  });

  if (!payment) {
    return { success: false, error: "Payment record not found." };
  }

  if (payment.status !== "CAPTURED" && payment.status !== "PARTIALLY_REFUNDED") {
    return {
      success: false,
      error: `Cannot refund payment in '${payment.status}' status. Only captured payments can be refunded.`,
    };
  }

  if (!payment.razorpayPaymentId) {
    return {
      success: false,
      error: "Missing Razorpay Payment ID on record.",
    };
  }

  const originalAmount = Number(payment.amount);
  const alreadyRefunded = Number(payment.refundAmount || 0);
  const remainingRefundable = originalAmount - alreadyRefunded;

  if (remainingRefundable <= 0) {
    return {
      success: false,
      error: "Payment has already been fully refunded.",
    };
  }

  // Determine requested refund amount
  const refundAmount =
    amountInRupees !== undefined && amountInRupees > 0
      ? Math.min(amountInRupees, remainingRefundable)
      : remainingRefundable;

  const isFullRefund = refundAmount >= remainingRefundable;
  const newTotalRefunded = alreadyRefunded + refundAmount;

  try {
    // 1. Call Razorpay API (or mock in test/development)
    const razorpayRefund = await refundRazorpayPayment({
      paymentId: payment.razorpayPaymentId,
      amountInRupees: refundAmount,
      notes: {
        reason: reason || "Admin requested refund via KailshiansX portal",
        adminUserId: session.user.id,
        adminUserEmail: session.user.email || "admin",
        registrationCode: payment.registration.registrationCode,
      },
    });

    // 2. Atomically persist changes to database
    const updated = await db.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          refundId: razorpayRefund.id,
          refundAmount: new Prisma.Decimal(newTotalRefunded),
          refundReason: reason || payment.refundReason,
          refundStatus: "PROCESSED",
          status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
        },
      });

      // If full refund, cancel registration and free up quota
      let updatedReg = payment.registration;
      if (isFullRefund) {
        updatedReg = await tx.registration.update({
          where: { id: payment.registration.id },
          data: {
            status: "CANCELLED",
          },
          include: {
            event: true,
            ticketType: true,
          },
        });
      }

      return { payment: updatedPayment, registration: updatedReg };
    });

    // 3. Write audit log
    await writeAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "Payment",
      entityId: payment.id,
      before: {
        status: payment.status,
        refundStatus: payment.refundStatus,
        refundAmount: payment.refundAmount,
      },
      after: {
        status: updated.payment.status,
        refundStatus: updated.payment.refundStatus,
        refundAmount: updated.payment.refundAmount,
        refundId: razorpayRefund.id,
        registrationCancelled: isFullRefund,
      },
    });

    return {
      success: true,
      message: isFullRefund
        ? `Full refund of ₹${refundAmount} processed. Pass ${payment.registration.registrationCode} cancelled.`
        : `Partial refund of ₹${refundAmount} processed. Total refunded: ₹${newTotalRefunded}.`,
      refundId: razorpayRefund.id,
      refundAmount,
      paymentStatus: updated.payment.status,
      registrationStatus: updated.registration.status,
    };
  } catch (error: unknown) {
    console.error("Admin refund processing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process refund with Razorpay.",
    };
  }
}
