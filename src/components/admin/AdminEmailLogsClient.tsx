// src/components/admin/AdminEmailLogsClient.tsx
// Comprehensive Email Log & Queue management console.
// Telemetry stats, live search, multi-filters, iframe email preview, forensic JSON diff modal, manual retry, and CSV export.

"use client";

import * as React from "react";
import { RotateCcw, Eye, FileCode, Send, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { AdminDataTable, type ColumnDef, type FilterConfig } from "./AdminDataTable";
import { AdminModal } from "./AdminModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { retryAdminEmailLog, processAdminEmailQueue } from "@/server/admin/actions";
import { EmailJobStatus, EmailTemplate } from "@prisma/client";
import { formatDate } from "@/lib/utils";

export interface EmailLogListItem {
  id: string;
  template: EmailTemplate;
  recipient: string;
  subject: string;
  status: EmailJobStatus;
  attempts: number;
  maxAttempts: number;
  payload: unknown;
  html: string | null;
  error: string | null;
  messageId: string | null;
  scheduledFor: string;
  sentAt: string | null;
  failedAt: string | null;
  createdAt: string;
}

interface StatsProps {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  processing: number;
  deliveryRate: number;
}

interface AdminEmailLogsClientProps {
  initialLogs: EmailLogListItem[];
  initialStats: StatsProps;
}

const TEMPLATE_LABELS: Record<EmailTemplate, { label: string; color: string }> = {
  REGISTRATION_CONFIRMATION: { label: "Pass Confirmation", color: "#10b981" },
  PAYMENT_FAILED: { label: "Payment Failed", color: "#ef4444" },
  REFUND_PROCESSED: { label: "Refund Processed", color: "#34d399" },
  APPLICATION_RECEIVED: { label: "App Received", color: "#06b6d4" },
  STATUS_CHANGE: { label: "Status Update", color: "#8b5cf6" },
  COLLABORATION_ACK: { label: "Collab Auto-Ack", color: "#38bdf8" },
  EVENT_REMINDER_24H: { label: "24h Event Countdown", color: "#f59e0b" },
  CERTIFICATE_ISSUED: { label: "Certificate Issued", color: "#38bdf8" },
};

export function AdminEmailLogsClient({ initialLogs, initialStats }: AdminEmailLogsClientProps) {
  const [logs, setLogs] = React.useState<EmailLogListItem[]>(initialLogs);
  const [stats, setStats] = React.useState<StatsProps>(initialStats);
  const [previewLog, setPreviewLog] = React.useState<EmailLogListItem | null>(null);
  const [detailsLog, setDetailsLog] = React.useState<EmailLogListItem | null>(null);
  const [isProcessingQueue, setIsProcessingQueue] = React.useState(false);
  const [retryingId, setRetryingId] = React.useState<string | null>(null);

  const handleRetry = async (logId: string) => {
    try {
      setRetryingId(logId);
      const res = await retryAdminEmailLog(logId);
      if (res.success) {
        setLogs((prev) =>
          prev.map((l) =>
            l.id === logId
              ? {
                  ...l,
                  status: EmailJobStatus.SENT,
                  error: null,
                  sentAt: new Date().toISOString(),
                }
              : l
          )
        );
        setStats((prev) => ({
          ...prev,
          sent: prev.sent + 1,
          failed: Math.max(0, prev.failed - 1),
          deliveryRate: Math.round(((prev.sent + 1) / prev.total) * 100),
        }));
        alert("Email retried successfully and marked as SENT!");
      } else {
        alert(`Retry failed: ${res.error || "Unknown error"}`);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Retry action failed");
    } finally {
      setRetryingId(null);
    }
  };

  const handleProcessQueue = async () => {
    try {
      setIsProcessingQueue(true);
      const res = await processAdminEmailQueue();
      alert(
        `Queue sweep finished! Processed: ${res.processed}, Succeeded: ${res.succeeded}, Failed: ${res.failed}`
      );
      window.location.reload();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Queue processing failed");
    } finally {
      setIsProcessingQueue(false);
    }
  };

  const getStatusBadge = (status: EmailJobStatus) => {
    switch (status) {
      case EmailJobStatus.SENT:
        return (
          <Badge
            variant="surface"
            size="sm"
            className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          >
            SENT
          </Badge>
        );
      case EmailJobStatus.FAILED:
        return (
          <Badge variant="destructive" size="sm">
            FAILED
          </Badge>
        );
      case EmailJobStatus.PROCESSING:
        return (
          <Badge variant="brand" size="sm">
            PROCESSING
          </Badge>
        );
      case EmailJobStatus.PENDING:
      default:
        return (
          <Badge variant="warning" size="sm">
            PENDING
          </Badge>
        );
    }
  };

  const columns: ColumnDef<EmailLogListItem>[] = [
    {
      header: "Recipient & Template",
      accessorKey: "recipient",
      sortable: true,
      cell: (item) => {
        const meta = TEMPLATE_LABELS[item.template] || {
          label: item.template,
          color: "#94a3b8",
        };
        return (
          <div className="space-y-1">
            <p className="text-surface-100 font-mono text-xs font-semibold tracking-tight sm:text-sm">
              {item.recipient}
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className="rounded border px-2 py-0.5 font-mono text-[10px] font-bold"
                style={{
                  color: meta.color,
                  backgroundColor: `${meta.color}15`,
                  borderColor: `${meta.color}30`,
                }}
              >
                {meta.label}
              </span>
              {item.messageId && (
                <span
                  className="text-surface-500 max-w-[120px] truncate font-mono text-[10px]"
                  title={item.messageId}
                >
                  {item.messageId}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Subject",
      accessorKey: "subject",
      sortable: true,
      cell: (item) => (
        <div className="max-w-xs truncate sm:max-w-sm">
          <p className="text-surface-200 truncate text-xs font-medium" title={item.subject}>
            {item.subject}
          </p>
          {item.error && (
            <p className="mt-0.5 truncate text-[11px] text-red-400" title={item.error}>
              Error: {item.error}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (item) => getStatusBadge(item.status),
    },
    {
      header: "Attempts",
      accessorKey: "attempts",
      sortable: true,
      cell: (item) => (
        <span
          className={`rounded px-2 py-0.5 font-mono text-xs ${
            item.attempts >= item.maxAttempts
              ? "border border-red-500/20 bg-red-500/10 text-red-400"
              : item.attempts > 0
                ? "bg-amber-500/10 text-amber-400"
                : "text-surface-400"
          }`}
        >
          {item.attempts} / {item.maxAttempts}
        </span>
      ),
    },
    {
      header: "Created / Sent",
      accessorKey: "createdAt",
      sortable: true,
      cell: (item) => (
        <div className="text-surface-400 space-y-0.5 text-[11px]">
          <p title="Enqueued At">Enqueued: {formatDate(item.createdAt)}</p>
          {item.sentAt ? (
            <p className="text-emerald-400" title="Dispatched At">
              Sent: {formatDate(item.sentAt)}
            </p>
          ) : (
            <p className="text-amber-400" title="Scheduled For">
              Scheduled: {formatDate(item.scheduledFor)}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (item) => {
        const isRetrying = retryingId === item.id;
        return (
          <div className="flex items-center justify-end gap-1.5">
            {item.html && (
              <Button
                variant="ghost"
                size="sm"
                className="text-surface-300 h-7 px-2 text-[11px] hover:text-white"
                onClick={() => setPreviewLog(item)}
                title="Preview Rendered Email"
              >
                <Eye className="mr-1 h-3.5 w-3.5" />
                <span>Preview</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-surface-300 h-7 px-2 text-[11px] hover:text-white"
              onClick={() => setDetailsLog(item)}
              title="Inspect JSON Payload & Error Details"
            >
              <FileCode className="mr-1 h-3.5 w-3.5" />
              <span>Details</span>
            </Button>
            {item.status !== EmailJobStatus.SENT && (
              <Button
                variant="secondary"
                size="sm"
                className="bg-brand-600/20 text-brand-300 hover:bg-brand-600 border-brand-500/30 h-7 border px-2.5 text-[11px] hover:text-white"
                onClick={() => handleRetry(item.id)}
                disabled={isRetrying}
                title="Retry Send Now"
              >
                <RotateCcw className={`mr-1 h-3 w-3 ${isRetrying ? "animate-spin" : ""}`} />
                <span>{isRetrying ? "Retrying..." : "Retry"}</span>
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const filters: FilterConfig<EmailLogListItem>[] = [
    {
      key: "status",
      label: "Delivery Status",
      options: [
        { label: "All Statuses", value: "ALL" },
        { label: "Sent", value: EmailJobStatus.SENT },
        { label: "Failed", value: EmailJobStatus.FAILED },
        { label: "Pending", value: EmailJobStatus.PENDING },
        { label: "Processing", value: EmailJobStatus.PROCESSING },
      ],
    },
    {
      key: "template",
      label: "Template Type",
      options: [
        { label: "All Templates", value: "ALL" },
        { label: "Registration Pass", value: EmailTemplate.REGISTRATION_CONFIRMATION },
        { label: "Payment Failed", value: EmailTemplate.PAYMENT_FAILED },
        { label: "Refund Processed", value: EmailTemplate.REFUND_PROCESSED },
        { label: "Application Received", value: EmailTemplate.APPLICATION_RECEIVED },
        { label: "Status Update", value: EmailTemplate.STATUS_CHANGE },
        { label: "Collaboration Ack", value: EmailTemplate.COLLABORATION_ACK },
        { label: "24h Event Countdown", value: EmailTemplate.EVENT_REMINDER_24H },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-surface-800 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="bg-brand-500/10 text-brand-400 border-brand-500/20 rounded border px-2 py-0.5 font-mono text-[10px] font-bold">
              PRD §22 Control Room
            </span>
            <span className="text-surface-500 text-xs">·</span>
            <span className="text-surface-400 font-mono text-xs">
              Email Queue &amp; Delivery Logs
            </span>
          </div>
          <h1 className="text-surface-50 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Email Delivery &amp; Job Queue
          </h1>
          <p className="text-surface-400 mt-1 text-xs sm:text-sm">
            Centralized React Email delivery pipeline with automated retries, forensic audit logs,
            and rendered email inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleProcessQueue}
            disabled={isProcessingQueue}
            className="bg-surface-800 hover:bg-surface-700 text-surface-100 border-surface-700 border text-xs"
          >
            <Send className={`mr-1.5 h-3.5 w-3.5 ${isProcessingQueue ? "animate-pulse" : ""}`} />
            <span>{isProcessingQueue ? "Processing Sweep..." : "Run Queue Sweep"}</span>
          </Button>
        </div>
      </div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="bg-surface-900/60 border-surface-800 rounded-xl border p-4">
          <div className="text-surface-400 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase">Total Enqueued</span>
            <Send className="text-surface-400 h-4 w-4" />
          </div>
          <p className="text-surface-100 font-mono text-2xl font-black">
            {stats.total.toLocaleString()}
          </p>
        </div>

        <div className="bg-surface-900/60 rounded-xl border border-emerald-500/20 p-4">
          <div className="mb-2 flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold tracking-wider uppercase">Delivered</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="font-mono text-2xl font-black text-emerald-400">
            {stats.sent.toLocaleString()}
          </p>
        </div>

        <div className="bg-surface-900/60 rounded-xl border border-red-500/20 p-4">
          <div className="mb-2 flex items-center justify-between text-red-400">
            <span className="text-[11px] font-bold tracking-wider uppercase">Failed</span>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <p className="font-mono text-2xl font-black text-red-400">
            {stats.failed.toLocaleString()}
          </p>
        </div>

        <div className="bg-surface-900/60 rounded-xl border border-amber-500/20 p-4">
          <div className="mb-2 flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-bold tracking-wider uppercase">Pending / Queued</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="font-mono text-2xl font-black text-amber-400">
            {stats.pending.toLocaleString()}
          </p>
        </div>

        <div className="bg-surface-900/60 border-brand-500/20 col-span-2 rounded-xl border p-4 sm:col-span-1">
          <div className="text-brand-400 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase">Success Rate</span>
            <span className="font-mono text-xs font-bold">{stats.deliveryRate}%</span>
          </div>
          <div className="bg-surface-800 mt-3 h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-brand-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.deliveryRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <AdminDataTable
        data={logs}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search recipient email, subject, or message ID..."
        exportFilename="kailshiansx-email-delivery-logs"
        defaultSort={{ key: "createdAt", direction: "desc" }}
      />

      {/* 1. Modal: Live Email Preview in iframe */}
      <AdminModal
        isOpen={Boolean(previewLog)}
        onClose={() => setPreviewLog(null)}
        title={previewLog ? `Email Preview: ${previewLog.subject}` : "Email Preview"}
        description={
          previewLog
            ? `Recipient: ${previewLog.recipient} • Template: ${previewLog.template}`
            : undefined
        }
        maxWidth="2xl"
      >
        {previewLog && (
          <div className="space-y-4">
            <div className="bg-surface-950 border-surface-800 flex items-center justify-between rounded-lg border px-3 py-2 text-xs">
              <span className="text-surface-400">
                Subject: <strong className="text-surface-200">{previewLog.subject}</strong>
              </span>
              <span className="text-surface-500 font-mono">{previewLog.recipient}</span>
            </div>

            {previewLog.html ? (
              <div className="border-surface-800 h-[520px] w-full overflow-hidden rounded-xl border bg-[#07090e]">
                <iframe
                  title="Rendered Email HTML"
                  srcDoc={previewLog.html}
                  className="h-full w-full border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              <div className="text-surface-400 bg-surface-950 border-surface-800 rounded-xl border p-8 text-center">
                <p>HTML has not been pre-rendered for this log yet.</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* 2. Modal: Detailed JSON Payload and Error Trace */}
      <AdminModal
        isOpen={Boolean(detailsLog)}
        onClose={() => setDetailsLog(null)}
        title={detailsLog ? `Job Details (${detailsLog.id})` : "Job Details"}
        description={
          detailsLog
            ? `Status: ${detailsLog.status} • Attempts: ${detailsLog.attempts}/${detailsLog.maxAttempts}`
            : undefined
        }
        maxWidth="xl"
      >
        {detailsLog && (
          <div className="space-y-4">
            {detailsLog.error && (
              <div className="space-y-1 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
                <p className="flex items-center gap-1.5 font-bold text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Delivery Error:</span>
                </p>
                <p className="font-mono break-all">{detailsLog.error}</p>
              </div>
            )}

            <div className="bg-surface-950 border-surface-800 grid grid-cols-2 gap-3 rounded-lg border p-3.5 text-xs">
              <div>
                <span className="text-surface-400">Message ID:</span>
                <p className="text-surface-200 truncate font-mono">
                  {detailsLog.messageId || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-surface-400">Template:</span>
                <p className="text-surface-200 font-mono">{detailsLog.template}</p>
              </div>
              <div>
                <span className="text-surface-400">Scheduled For:</span>
                <p className="text-surface-200">{formatDate(detailsLog.scheduledFor)}</p>
              </div>
              <div>
                <span className="text-surface-400">Sent At:</span>
                <p className="text-surface-200">
                  {detailsLog.sentAt ? formatDate(detailsLog.sentAt) : "Not Sent"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-surface-400 mb-1.5 text-xs font-bold tracking-wider uppercase">
                Template Data Payload (JSON)
              </p>
              <pre className="bg-surface-950 border-surface-800 max-h-64 overflow-y-auto rounded-lg border p-3 font-mono text-[11px] break-all whitespace-pre-wrap text-cyan-300">
                {JSON.stringify(detailsLog.payload, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
