// src/components/admin/AdminPaymentsClient.tsx
// Data table view for payments with status tracking, refund processing, and CSV export.

"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { AdminDataTable, type ColumnDef, type FilterConfig } from "./AdminDataTable";
import { AdminModal } from "./AdminModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { processAdminRefund } from "@/server/admin/refund";
import { PaymentStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";

export interface PaymentListItem {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amount: number;
  status: PaymentStatus;
  refundStatus: string;
  attendeeName: string;
  attendeeEmail: string;
  registrationCode: string;
  eventTitle: string;
  createdAt: string;
}

interface AdminPaymentsClientProps {
  initialPayments: PaymentListItem[];
}

export function AdminPaymentsClient({ initialPayments }: AdminPaymentsClientProps) {
  const [payments, setPayments] = React.useState<PaymentListItem[]>(initialPayments);
  const [selectedForRefund, setSelectedForRefund] = React.useState<PaymentListItem | null>(null);
  const [refundReason, setRefundReason] = React.useState("");
  const [refundAmount, setRefundAmount] = React.useState<string>("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleOpenRefund = (payment: PaymentListItem) => {
    setSelectedForRefund(payment);
    setRefundReason("");
    setRefundAmount(String(payment.amount));
    setFeedback(null);
  };

  const handleExecuteRefund = async () => {
    if (!selectedForRefund) return;
    try {
      setIsProcessing(true);
      setFeedback(null);
      const res = await processAdminRefund({
        paymentId: selectedForRefund.id,
        amountInRupees: refundAmount ? Number(refundAmount) : undefined,
        reason: refundReason.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Refund failed");
      }

      setPayments((prev) =>
        prev.map((p) =>
          p.id === selectedForRefund.id
            ? {
                ...p,
                status: PaymentStatus.REFUNDED,
                refundStatus: "PROCESSED",
              }
            : p
        )
      );

      setSelectedForRefund(null);
      alert("Refund processed successfully!");
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Failed to execute refund");
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: ColumnDef<PaymentListItem>[] = [
    {
      header: "Order / Payment ID",
      accessorKey: "razorpayOrderId",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="text-surface-200 block font-mono text-xs font-semibold">
            {item.razorpayOrderId}
          </span>
          {item.razorpayPaymentId && (
            <span className="text-surface-500 block font-mono text-[11px]">
              Pay: {item.razorpayPaymentId}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Attendee",
      accessorKey: "attendeeName",
      sortable: true,
      cell: (item) => (
        <div>
          <p className="text-surface-100 font-semibold">{item.attendeeName}</p>
          <p className="text-surface-500 text-[11px]">{item.attendeeEmail}</p>
          <span className="text-brand-400 font-mono text-[10px]">{item.registrationCode}</span>
        </div>
      ),
    },
    {
      header: "Event",
      accessorKey: "eventTitle",
      sortable: true,
      cell: (item) => (
        <span className="text-surface-300 block max-w-[200px] truncate text-xs">
          {item.eventTitle}
        </span>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount",
      sortable: true,
      cell: (item) => (
        <span className="text-surface-100 font-mono text-xs font-bold">
          ₹{item.amount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (item) => (
        <Badge
          variant={
            item.status === PaymentStatus.CAPTURED
              ? "success"
              : item.status === PaymentStatus.REFUNDED
                ? "destructive"
                : item.status === PaymentStatus.FAILED
                  ? "destructive"
                  : "warning"
          }
          size="sm"
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      sortable: true,
      sortAccessor: (item) => new Date(item.createdAt).getTime(),
      cell: (item) => (
        <span className="text-surface-400 text-xs">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      header: "Actions",
      cell: (item) => {
        const canRefund = item.status === PaymentStatus.CAPTURED;

        return (
          <div className="flex items-center justify-end">
            {canRefund ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenRefund(item)}
                className="border-surface-700 bg-surface-900 flex items-center gap-1 text-xs text-amber-300 hover:bg-amber-950/30"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Refund
              </Button>
            ) : item.status === PaymentStatus.REFUNDED ? (
              <span className="text-surface-500 text-[11px] italic">Refunded</span>
            ) : (
              <span className="text-surface-500 text-[11px]">—</span>
            )}
          </div>
        );
      },
    },
  ];

  const filters: FilterConfig<PaymentListItem>[] = [
    {
      label: "Status",
      key: "status",
      options: [
        { label: "Captured", value: PaymentStatus.CAPTURED },
        { label: "Pending", value: PaymentStatus.PENDING },
        { label: "Refunded", value: PaymentStatus.REFUNDED },
        { label: "Failed", value: PaymentStatus.FAILED },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-surface-50 text-2xl font-bold">Payments & Gateway</h1>
        <p className="text-surface-400 mt-0.5 text-xs sm:text-sm">
          Razorpay capture logs, transaction verification, and atomic refund processing.
        </p>
      </div>

      <AdminDataTable
        data={payments}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search order ID, payment ID, attendee, registration code..."
        exportFilename="kailshiansx_payments.csv"
        pageSize={20}
        emptyMessage="No payment records found."
      />

      {/* Refund Modal */}
      <AdminModal
        isOpen={Boolean(selectedForRefund)}
        onClose={() => setSelectedForRefund(null)}
        title="Process Payment Refund"
        description={`Refund transaction for ${selectedForRefund?.attendeeName} (${selectedForRefund?.registrationCode})`}
        maxWidth="md"
      >
        {selectedForRefund && (
          <div className="space-y-4">
            {feedback && (
              <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-xs font-semibold text-red-300">
                {feedback}
              </div>
            )}

            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">
                Refund Amount (₹ INR)
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={selectedForRefund.amount}
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2.5 font-mono text-xs"
              />
              <p className="text-surface-500 mt-1 text-[10px]">
                Original amount: ₹{selectedForRefund.amount}. Leave blank or equal for full refund.
              </p>
            </div>

            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">
                Reason for Refund
              </label>
              <textarea
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Event date rescheduled / attendee emergency withdrawal"
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2.5 text-xs"
              />
            </div>

            <div className="border-surface-800 flex justify-end gap-2 border-t pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedForRefund(null)}
                disabled={isProcessing}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteRefund}
                disabled={isProcessing}
                className="bg-red-600 text-xs font-bold text-white hover:bg-red-500"
              >
                {isProcessing ? "Processing..." : "Confirm & Issue Refund"}
              </Button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
