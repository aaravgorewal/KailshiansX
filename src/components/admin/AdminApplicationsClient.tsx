// src/components/admin/AdminApplicationsClient.tsx
"use client";

import * as React from "react";
import { Search, Mail, Phone, Download, X, ChevronRight, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusCell } from "@/components/admin/StatusCell";
import { formatDate } from "@/lib/format-date";
import {
  updateUnifiedApplicationStatus,
  type UnifiedApplicationType,
} from "@/server/admin/actions";

export type ApplicationType = UnifiedApplicationType;

export interface UnifiedApplicationItem {
  id: string;
  type: ApplicationType;
  name: string;
  email: string;
  phone: string | null;
  details: string;
  status: string;
  createdAt: string;
  adminNotes?: string | null;
  specifics?: Record<string, string | null | undefined>;
}

interface AdminApplicationsClientProps {
  initialItems: UnifiedApplicationItem[];
}

const TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "All Types", value: "ALL" },
  { label: "Campus Lead", value: "CAMPUS_LEAD" },
  { label: "State Lead", value: "STATE_LEAD" },
  { label: "Team", value: "TEAM" },
  { label: "Partner", value: "PARTNER" },
];

const STATUS_MAP: Record<ApplicationType, string[]> = {
  CAMPUS_LEAD: ["APPLIED", "SCREENING", "INTERVIEW", "SELECTED", "ACTIVE", "ALUMNI", "INACTIVE"],
  STATE_LEAD: ["APPLIED", "SCREENING", "INTERVIEW", "SELECTED", "ACTIVE", "ALUMNI", "INACTIVE"],
  TEAM: ["NEW", "REVIEWING", "INTERVIEW", "SELECTED", "REJECTED"],
  PARTNER: [
    "LEAD",
    "NEW",
    "CONTACTED",
    "MEETING",
    "NEGOTIATING",
    "CONFIRMED",
    "WON",
    "DECLINED",
    "LOST",
    "COMPLETED",
  ],
};

export function AdminApplicationsClient({ initialItems }: AdminApplicationsClientProps) {
  const [items, setItems] = React.useState<UnifiedApplicationItem[]>(initialItems);
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState<string>("");
  const [selectedItem, setSelectedItem] = React.useState<UnifiedApplicationItem | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  // Filter items
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== "ALL" && item.type !== typeFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          item.name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.details.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [items, typeFilter, search]);

  // Handle status update
  const handleStatusChange = async (item: UnifiedApplicationItem, newStatus: string) => {
    if (item.status === newStatus) return;
    setUpdatingId(item.id);
    try {
      await updateUnifiedApplicationStatus(item.type, item.id, newStatus);
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));
      if (selectedItem?.id === item.id) {
        setSelectedItem((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ["ID", "Type", "Name", "Email", "Phone", "Details", "Status", "Submitted At"];
    const rows = filteredItems.map((item) => [
      item.id,
      item.type,
      `"${item.name.replace(/"/g, '""')}"`,
      item.email,
      item.phone ?? "",
      `"${item.details.replace(/"/g, '""')}"`,
      item.status,
      item.createdAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `applications_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeLabel = (type: ApplicationType): string => {
    switch (type) {
      case "CAMPUS_LEAD":
        return "Campus Lead";
      case "STATE_LEAD":
        return "State Lead";
      case "TEAM":
        return "Team";
      case "PARTNER":
        return "Partner";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-foreground text-xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground text-xs">
          Manage pipeline across campus leads, state leads, core team applicants, and partner
          proposals.
        </p>
      </div>

      {/* Toolbar: search + one filter + CSV export */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative max-w-sm min-w-[200px] flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search applications…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-lg border py-1.5 pr-8 pl-9 text-xs focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Single Filter: Form Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border-input bg-background text-foreground focus:border-primary rounded-lg border py-1.5 pr-8 pl-3 text-xs focus:outline-none"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* CSV Export */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 text-xs font-semibold"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV ({filteredItems.length})
        </Button>
      </div>

      {/* Table: sticky header, row hover bg-muted, horizontal scroll on small screens */}
      <div className="border-border bg-card relative overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-border bg-card text-muted-foreground sticky top-0 z-10 border-b font-semibold tracking-wider uppercase">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Update Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-muted-foreground py-12 text-center text-xs">
                    No applications found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const allowedStatuses = STATUS_MAP[item.type] || [];
                  const isUpdating = updatingId === item.id;

                  return (
                    <tr
                      key={`${item.type}-${item.id}`}
                      onClick={() => setSelectedItem(item)}
                      className="hover:bg-muted cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-muted-foreground font-mono text-xs">
                          {getTypeLabel(item.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-foreground font-medium">{item.name}</div>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <span>{item.email}</span>
                          {item.phone && <span>· {item.phone}</span>}
                        </div>
                      </td>
                      <td className="text-muted-foreground max-w-xs truncate px-4 py-3">
                        {item.details}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusCell status={item.status} />
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5">
                          {isUpdating ? (
                            <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <select
                              aria-label={`Change status for ${item.name}`}
                              value={item.status}
                              onChange={(e) => handleStatusChange(item, e.target.value)}
                              className="border-input bg-background text-foreground rounded border px-2 py-1 text-xs focus:outline-none"
                            >
                              {allowedStatuses.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="text-muted-foreground px-4 py-3 font-mono text-xs whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                          }}
                          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-semibold"
                        >
                          <span>View</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel for details */}
      {selectedItem && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
            onClick={() => setSelectedItem(null)}
          />
          <div className="bg-card border-border fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l shadow-2xl">
            {/* Panel Header */}
            <div className="border-border flex items-center justify-between border-b px-5 py-4">
              <div>
                <span className="text-muted-foreground font-mono text-xs uppercase">
                  {getTypeLabel(selectedItem.type)}
                </span>
                <h2 className="text-foreground text-base font-bold">{selectedItem.name}</h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-muted-foreground hover:text-foreground rounded p-1"
                aria-label="Close details panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs">
              {/* Status Section */}
              <div className="border-border bg-background space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Current Status</span>
                  <StatusCell status={selectedItem.status} />
                </div>
                <div className="pt-1">
                  <label htmlFor="panel-status-select" className="text-muted-foreground mb-1 block">
                    Change Status
                  </label>
                  <select
                    id="panel-status-select"
                    value={selectedItem.status}
                    onChange={(e) => handleStatusChange(selectedItem, e.target.value)}
                    disabled={updatingId === selectedItem.id}
                    className="border-input bg-card text-foreground w-full rounded border p-1.5 text-xs focus:outline-none"
                  >
                    {(STATUS_MAP[selectedItem.type] || []).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <h3 className="text-muted-foreground font-semibold tracking-wider uppercase">
                  Contact
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="text-muted-foreground h-3.5 w-3.5" />
                    <a
                      href={`mailto:${selectedItem.email}`}
                      className="text-foreground hover:underline"
                    >
                      {selectedItem.email}
                    </a>
                  </div>
                  {selectedItem.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="text-muted-foreground h-3.5 w-3.5" />
                      <a
                        href={`tel:${selectedItem.phone}`}
                        className="text-foreground hover:underline"
                      >
                        {selectedItem.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                    <span className="text-muted-foreground">
                      Submitted {formatDate(selectedItem.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Specific application details */}
              {selectedItem.specifics && (
                <div className="space-y-3">
                  <h3 className="text-muted-foreground font-semibold tracking-wider uppercase">
                    Application Details
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(selectedItem.specifics).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <span className="text-muted-foreground font-medium">{key}</span>
                        <p className="text-foreground bg-muted/30 rounded p-2 text-xs leading-relaxed">
                          {val || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin notes */}
              {selectedItem.adminNotes && (
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Admin Notes</span>
                  <p className="text-foreground bg-muted/40 rounded p-2 text-xs italic">
                    {selectedItem.adminNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="border-border flex justify-end border-t p-4">
              <Button variant="secondary" size="sm" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
