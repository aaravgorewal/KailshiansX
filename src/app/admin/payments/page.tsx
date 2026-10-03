// src/app/admin/payments/page.tsx
// Server component fetching payments for AdminPaymentsClient.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import { AdminPaymentsClient, type PaymentListItem } from "@/components/admin/AdminPaymentsClient";

export const metadata: Metadata = {
  title: "Payments Manager | KailshiansX Admin",
};

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      registration: {
        select: {
          name: true,
          email: true,
          registrationCode: true,
          event: { select: { title: true } },
        },
      },
    },
  });

  const formatted: PaymentListItem[] = payments.map((p) => ({
    id: p.id,
    razorpayOrderId: p.razorpayOrderId,
    razorpayPaymentId: p.razorpayPaymentId,
    amount: Number(p.amount),
    status: p.status,
    refundStatus: p.refundStatus,
    attendeeName: p.registration?.name ?? "Unknown",
    attendeeEmail: p.registration?.email ?? "—",
    registrationCode: p.registration?.registrationCode ?? "—",
    eventTitle: p.registration?.event?.title ?? "—",
    createdAt: p.createdAt.toISOString(),
  }));

  return <AdminPaymentsClient initialPayments={formatted} />;
}
