// src/app/admin/audit-logs/page.tsx
// Server component fetching audit logs for AdminAuditLogsClient.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import {
  AdminAuditLogsClient,
  type AuditLogListItem,
} from "@/components/admin/AdminAuditLogsClient";

export const metadata: Metadata = {
  title: "Audit Trail | KailshiansX Admin",
};

export default async function AdminAuditLogsPage() {
  await requireAdmin();

  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const formatted: AuditLogListItem[] = logs.map((l) => ({
    id: l.id,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    userName: l.user?.name ?? "System Operator",
    userEmail: l.user?.email ?? "system@kailshiansx.com",
    before: l.before,
    after: l.after,
    ipAddress: l.ipAddress,
    createdAt: l.createdAt.toISOString(),
  }));

  return <AdminAuditLogsClient initialLogs={formatted} />;
}
