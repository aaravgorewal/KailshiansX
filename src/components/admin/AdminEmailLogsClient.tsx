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

const TEMPLATE_LABELS: Record<EmailTemplate, { label: string; className: string }> = {
  REGISTRATION_CONFIRMATION: {
    label: "Pass Confirmation",
    className: "border-success/30 bg-success/10 text-success",
  },
  PAYMENT_FAILED: {
    label: "Payment Failed",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  REFUND_PROCESSED: {
    label: "Refund Processed",
    className: "border-success/30 bg-success/10 text-success",
  },
  APPLICATION_RECEIVED: {
    label: "App Received",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  STATUS_CHANGE: {
    label: "Status Update",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  COLLABORATION_ACK: {
    label: "Collab Auto-Ack",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  EVENT_REMINDER_24H: {
    label: "24h Event Countdown",
    className: "border-warning/30 bg-warning/10 text-warning",
  },
  CERTIFICATE_ISSUED: {
    label: "Certificate Issued",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  LEAD_ONBOARDING: {
    label: "Lead Charter Onboarding",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  LEAD_INACTIVITY_NUDGE: {
    label: "Lead Inactivity Nudge",
    className: "border-warning/30 bg-warning/10 text-warning",
  },
  POST_EVENT_FEEDBACK_NEXT_STEP: {
    label: "Post-Event Next Step",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
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
            className="border-success/20 bg-success/10 text-success border"
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
          className: "border-border bg-muted text-muted-foreground",
        };
        return (
          <div className="space-y-1">
            <p className="text-foreground font-mono text-xs font-semibold tracking-tight sm:text-sm">
              {item.recipient}
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "rounded border px-2 py-0.5 font-mono text-xs font-bold",
                  meta.className
                )}
              >
                {meta.label}
              </span>
              {item.messageId && (
                <span
                  className="text-muted-foreground max-w-[120px] truncate font-mono text-xs"
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
          <p className="text-foreground truncate text-xs font-medium" title={item.subject}>
            {item.subject}
          </p>
          {item.error && (
            <p className="text-destructive mt-0.5 truncate text-xs" title={item.error}>
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
              ? "border-destructive/20 bg-destructive/10 text-destructive border"
              : item.attempts > 0
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
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
        <div className="text-muted-foreground space-y-0.5 text-xs">
          <p title="Enqueued At">Enqueued: {formatDate(item.createdAt)}</p>
          {item.sentAt ? (
            <p className="text-success" title="Dispatched At">
              Sent: {formatDate(item.sentAt)}
            </p>
          ) : (
            <p className="text-primary" title="Scheduled For">
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
                className="text-muted-foreground h-7 px-2 text-xs hover:text-white"
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
              className="text-muted-foreground h-7 px-2 text-xs hover:text-white"
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
                className="bg-primary-hover/20 text-primary hover:bg-primary-hover border-primary/30 h-7 border px-2.5 text-xs hover:text-white"
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
      <div className="border-border flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="bg-primary/10 text-primary border-primary/20 rounded border px-2 py-0.5 font-mono text-xs font-bold">
              Control Room
            </span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-muted-foreground font-mono text-xs">
              Email Queue &amp; Delivery Logs
            </span>
          </div>
          <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
            Email Delivery &amp; Job Queue
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
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
            className="bg-muted hover:bg-muted text-foreground border-border border text-xs"
          >
            <Send className={`mr-1.5 h-3.5 w-3.5 ${isProcessingQueue ? "animate-pulse" : ""}`} />
            <span>{isProcessingQueue ? "Processing Sweep..." : "Run Queue Sweep"}</span>
          </Button>
        </div>
      </div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="bg-card border-border rounded-xl border p-4">
          <div className="text-muted-foreground mb-2 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase">Total Enqueued</span>
            <Send className="text-muted-foreground h-4 w-4" />
          </div>
          <p className="text-foreground font-mono text-2xl font-black">
            {stats.total.toLocaleString()}
          </p>
        </div>

        <div className="bg-card border-success/20 rounded-xl border p-4">
          <div className="text-success mb-2 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase">Delivered</span>
            <CheckCircle2 className="text-success h-4 w-4" />
          </div>
          <p className="text-success font-mono text-2xl font-black">
            {stats.sent.toLocaleString()}
          </p>
        </div>

        <div className="bg-card border-destructive/20 rounded-xl border p-4">
          <div className="text-destructive mb-2 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase">Failed</span>
            <AlertTriangle className="text-destructive h-4 w-4" />
          </div>
          <p className="text-destructive font-mono text-2xl font-black">
            {stats.failed.toLocaleString()}
          </p>
        </div>

        <div className="bg-card border-border rounded-xl border p-4">
          <div className="text-primary mb-2 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase">Pending / Queued</span>
            <Clock className="text-primary h-4 w-4" />
          </div>
          <p className="text-primary font-mono text-2xl font-black">
            {stats.pending.toLocaleString()}
          </p>
        </div>

        <div className="bg-card border-primary/20 col-span-2 rounded-xl border p-4 sm:col-span-1">
          <div className="text-primary mb-2 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase">Success Rate</span>
            <span className="font-mono text-xs font-bold">{stats.deliveryRate}%</span>
          </div>
          <div className="bg-muted mt-3 h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
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
            <div className="bg-background border-border flex items-center justify-between rounded-lg border px-3 py-2 text-xs">
              <span className="text-muted-foreground">
                Subject: <strong className="text-foreground">{previewLog.subject}</strong>
              </span>
              <span className="text-muted-foreground font-mono">{previewLog.recipient}</span>
            </div>

            {previewLog.html ? (
              <div className="border-border bg-background h-[520px] w-full overflow-hidden rounded-xl border">
                <iframe
                  title="Rendered Email HTML"
                  srcDoc={previewLog.html}
                  className="h-full w-full border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              <div className="text-muted-foreground bg-background border-border rounded-xl border p-8 text-center">
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
              <div className="border-destructive/20 bg-destructive/10 text-destructive space-y-1 rounded-lg border p-3.5 text-xs">
                <p className="text-destructive flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Delivery Error:</span>
                </p>
                <p className="font-mono break-all">{detailsLog.error}</p>
              </div>
            )}

            <div className="bg-background border-border grid grid-cols-2 gap-3 rounded-lg border p-3.5 text-xs">
              <div>
                <span className="text-muted-foreground">Message ID:</span>
                <p className="text-foreground truncate font-mono">
                  {detailsLog.messageId || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Template:</span>
                <p className="text-foreground font-mono">{detailsLog.template}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Scheduled For:</span>
                <p className="text-foreground">{formatDate(detailsLog.scheduledFor)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Sent At:</span>
                <p className="text-foreground">
                  {detailsLog.sentAt ? formatDate(detailsLog.sentAt) : "Not Sent"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-1.5 text-xs font-bold tracking-wider uppercase">
                Template Data Payload (JSON)
              </p>
              <pre className="bg-background border-border text-primary max-h-64 overflow-y-auto rounded-lg border p-3 font-mono text-xs break-all whitespace-pre-wrap">
                {JSON.stringify(detailsLog.payload, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
