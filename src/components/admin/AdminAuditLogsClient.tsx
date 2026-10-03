// src/components/admin/AdminAuditLogsClient.tsx
// Audit Log Viewer with before/after state diff modal and CSV export.

"use client";

import * as React from "react";
import { Eye } from "lucide-react";
import { AdminDataTable, type ColumnDef, type FilterConfig } from "./AdminDataTable";
import { AdminModal } from "./AdminModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export interface AuditLogListItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  userName: string;
  userEmail: string;
  before: unknown;
  after: unknown;
  ipAddress: string | null;
  createdAt: string;
}

interface AdminAuditLogsClientProps {
  initialLogs: AuditLogListItem[];
}

export function AdminAuditLogsClient({ initialLogs }: AdminAuditLogsClientProps) {
  const [logs] = React.useState<AuditLogListItem[]>(initialLogs);
  const [selectedLog, setSelectedLog] = React.useState<AuditLogListItem | null>(null);

  const columns: ColumnDef<AuditLogListItem>[] = [
    {
      header: "Action",
      accessorKey: "action",
      sortable: true,
      cell: (item) => (
        <Badge
          variant={
            item.action === "CREATE" || item.action === "PUBLISH"
              ? "success"
              : item.action === "DELETE"
                ? "destructive"
                : "warning"
          }
          size="sm"
        >
          {item.action}
        </Badge>
      ),
    },
    {
      header: "Target Entity",
      accessorKey: "entityType",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="text-surface-100 text-xs font-semibold">{item.entityType}</span>
          {item.entityId && (
            <span className="text-surface-500 block max-w-[150px] truncate font-mono text-[10px]">
              ID: {item.entityId}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Operator",
      accessorKey: "userName",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="text-surface-200 block text-xs font-medium">{item.userName}</span>
          <span className="text-surface-500 text-[11px]">{item.userEmail}</span>
        </div>
      ),
    },
    {
      header: "Timestamp",
      accessorKey: "createdAt",
      sortable: true,
      sortAccessor: (item) => new Date(item.createdAt).getTime(),
      cell: (item) => (
        <div>
          <span className="text-surface-300 block text-xs">{formatDate(item.createdAt)}</span>
          <span className="text-surface-500 text-[10px]">
            {new Date(item.createdAt).toLocaleTimeString()}
          </span>
        </div>
      ),
    },
    {
      header: "Audit Snapshot",
      cell: (item) => (
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedLog(item)}
            className="border-surface-700 bg-surface-900 text-surface-200 flex items-center gap-1 text-xs"
          >
            <Eye className="h-3.5 w-3.5" /> Diff
          </Button>
        </div>
      ),
    },
  ];

  const filters: FilterConfig<AuditLogListItem>[] = [
    {
      label: "Action",
      key: "action",
      options: [
        { label: "Create", value: "CREATE" },
        { label: "Update", value: "UPDATE" },
        { label: "Delete", value: "DELETE" },
        { label: "Publish", value: "PUBLISH" },
        { label: "Archive", value: "ARCHIVE" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-surface-50 text-2xl font-bold">Audit Trail & Forensic Logs</h1>
        <p className="text-surface-400 mt-0.5 text-xs sm:text-sm">
          Immutable ledger recording all administrative mutations, publish actions, and role
          upgrades.
        </p>
      </div>

      <AdminDataTable
        data={logs}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search action, entity type, user email, ID..."
        exportFilename="kailshiansx_audit_trail.csv"
        pageSize={20}
        emptyMessage="No audit logs recorded."
      />

      {/* Snapshot Diff Modal */}
      <AdminModal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title={
          selectedLog
            ? `${selectedLog.action} ${selectedLog.entityType} — Snapshot Diff`
            : "Audit Snapshot"
        }
        description={`Executed by ${selectedLog?.userEmail} on ${selectedLog ? new Date(selectedLog.createdAt).toLocaleString() : ""}`}
        maxWidth="2xl"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-surface-400 mb-1 text-xs font-bold uppercase">
                  Before Mutation
                </h4>
                <div className="bg-surface-950 border-surface-800 text-surface-300 max-h-80 overflow-y-auto rounded-xl border p-3 font-mono text-[11px]">
                  {selectedLog.before ? (
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.before, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-surface-600 italic">None (New Record Creation)</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="mb-1 text-xs font-bold text-emerald-400 uppercase">
                  After Mutation
                </h4>
                <div className="bg-surface-950 border-surface-800 max-h-80 overflow-y-auto rounded-xl border p-3 font-mono text-[11px] text-emerald-300">
                  {selectedLog.after ? (
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.after, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-surface-600 italic">None (Record Deleted)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-surface-800 flex justify-end border-t pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
