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
          <span className="text-foreground text-xs font-semibold">{item.entityType}</span>
          {item.entityId && (
            <span className="text-muted-foreground block max-w-[150px] truncate font-mono text-xs">
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
          <span className="text-foreground block text-xs font-medium">{item.userName}</span>
          <span className="text-muted-foreground text-xs">{item.userEmail}</span>
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
          <span className="text-muted-foreground block text-xs">{formatDate(item.createdAt)}</span>
          <span className="text-muted-foreground text-xs">
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
            className="border-border bg-card text-foreground flex items-center gap-1 text-xs"
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
        <h1 className="text-foreground text-2xl font-bold">Audit Trail & Forensic Logs</h1>
        <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
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
                <h4 className="text-muted-foreground mb-1 text-xs font-bold uppercase">
                  Before Mutation
                </h4>
                <div className="bg-background border-border text-muted-foreground max-h-80 overflow-y-auto rounded-xl border p-3 font-mono text-xs">
                  {selectedLog.before ? (
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.before, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-muted-foreground italic">None (New Record Creation)</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-success mb-1 text-xs font-bold uppercase">After Mutation</h4>
                <div className="bg-background border-border text-success max-h-80 overflow-y-auto rounded-xl border p-3 font-mono text-xs">
                  {selectedLog.after ? (
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.after, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-muted-foreground italic">None (Record Deleted)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-border flex justify-end border-t pt-2">
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
