// src/app/admin/email-logs/page.tsx
// Admin Email Log & Queue Console (PRD §22 Control Room).

import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth/require-role";
import { db } from "@/lib/db";
import { getEmailLogStats } from "@/server/email";
import {
  AdminEmailLogsClient,
  type EmailLogListItem,
} from "@/components/admin/AdminEmailLogsClient";

export const metadata: Metadata = {
  title: "Email Delivery Logs & Queue | KailshiansX Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminEmailLogsPage() {
  await requireAdmin();

  const [rawLogs, stats] = await Promise.all([
    db.emailLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    getEmailLogStats(),
  ]);

  const logs: EmailLogListItem[] = rawLogs.map((log) => ({
    id: log.id,
    template: log.template,
    recipient: log.recipient,
    subject: log.subject,
    status: log.status,
    attempts: log.attempts,
    maxAttempts: log.maxAttempts,
    payload: log.payload,
    html: log.html,
    error: log.error,
    messageId: log.messageId,
    scheduledFor: log.scheduledFor.toISOString(),
    sentAt: log.sentAt ? log.sentAt.toISOString() : null,
    failedAt: log.failedAt ? log.failedAt.toISOString() : null,
    createdAt: log.createdAt.toISOString(),
  }));

  return <AdminEmailLogsClient initialLogs={logs} initialStats={stats} />;
}
