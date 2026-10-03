// src/components/admin/AdminStateLeadsClient.tsx
// State Leads Pipeline with Table & Kanban views, status transitions, review modal, and CSV export.

"use client";

import * as React from "react";
import { LayoutGrid, List, Eye, ExternalLink } from "lucide-react";
import { AdminDataTable, type ColumnDef, type FilterConfig } from "./AdminDataTable";
import { AdminKanban, type KanbanColumn, type KanbanItemProps } from "./AdminKanban";
import { AdminModal } from "./AdminModal";
import { Button } from "@/components/ui/Button";
import { updateStateLeadStatus } from "@/server/admin/actions";
import { StateLeadStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";

export interface StateLeadAppItem extends KanbanItemProps {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  state: string;
  city: string | null;
  citiesCovered: string | null;
  currentRole: string | null;
  linkedin: string | null;
  experience: string | null;
  leadershipEvidence: string | null;
  communityVision: string | null;
  whyKailshiansX: string | null;
  availabilityHours: string | null;
  status: StateLeadStatus;
  adminNotes: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { label: "Applied", value: StateLeadStatus.APPLIED },
  { label: "Screening", value: StateLeadStatus.SCREENING },
  { label: "Interview", value: StateLeadStatus.INTERVIEW },
  { label: "Selected", value: StateLeadStatus.SELECTED },
  { label: "Active Lead", value: StateLeadStatus.ACTIVE },
  { label: "Alumni", value: StateLeadStatus.ALUMNI },
  { label: "Inactive", value: StateLeadStatus.INACTIVE },
];

interface AdminStateLeadsClientProps {
  initialApplications: StateLeadAppItem[];
}

export function AdminStateLeadsClient({ initialApplications }: AdminStateLeadsClientProps) {
  const [apps, setApps] = React.useState<StateLeadAppItem[]>(initialApplications);
  const [viewMode, setViewMode] = React.useState<"table" | "kanban">("table");
  const [selectedApp, setSelectedApp] = React.useState<StateLeadAppItem | null>(null);
  const [adminNotes, setAdminNotes] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      await updateStateLeadStatus(id, newStatus as StateLeadStatus);
      setApps((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: newStatus as StateLeadStatus, currentStatus: newStatus } : a
        )
      );
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp((prev) => (prev ? { ...prev, status: newStatus as StateLeadStatus } : null));
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update state lead status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    try {
      setIsUpdating(true);
      await updateStateLeadStatus(selectedApp.id, selectedApp.status, adminNotes);
      setApps((prev) => prev.map((a) => (a.id === selectedApp.id ? { ...a, adminNotes } : a)));
      setSelectedApp((prev) => (prev ? { ...prev, adminNotes } : null));
      alert("Notes saved successfully");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save notes");
    } finally {
      setIsUpdating(false);
    }
  };

  const openReviewModal = (app: StateLeadAppItem) => {
    setSelectedApp(app);
    setAdminNotes(app.adminNotes || "");
  };

  const kanbanColumns: KanbanColumn<StateLeadAppItem>[] = STATUS_OPTIONS.slice(0, 5).map((opt) => ({
    id: opt.value,
    title: opt.label,
    items: apps
      .filter((a) => a.status === opt.value)
      .map((a) => ({
        ...a,
        title: a.name,
        subtitle: `${a.state} (${a.city ?? "Regional"})`,
        tag: a.currentRole ?? "Leader",
        date: formatDate(a.createdAt),
        currentStatus: a.status,
        details: [
          { label: "State", value: a.state },
          { label: "Email", value: a.email },
        ],
      })),
  }));

  const columns: ColumnDef<StateLeadAppItem>[] = [
    {
      header: "Applicant",
      accessorKey: "name",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="text-surface-100 text-xs font-bold">{item.name}</span>
          <div className="text-surface-400 flex items-center gap-1.5 text-[11px]">
            <span>{item.email}</span>
            {item.phone && <span>· {item.phone}</span>}
          </div>
        </div>
      ),
    },
    {
      header: "State & Cities Covered",
      accessorKey: "state",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="text-surface-200 block text-xs font-semibold">{item.state}</span>
          <span className="text-surface-400 text-[11px]">
            {item.citiesCovered || item.city || "Statewide"}
          </span>
        </div>
      ),
    },
    {
      header: "Current Role",
      accessorKey: "currentRole",
      sortable: true,
      cell: (item) => (
        <span className="text-surface-300 text-xs">{item.currentRole || "Professional"}</span>
      ),
    },
    {
      header: "Stage / Status",
      accessorKey: "status",
      sortable: true,
      cell: (item) => (
        <select
          value={item.status}
          onChange={(e) => handleStatusChange(item.id, e.target.value)}
          className="bg-surface-900 border-surface-700 text-surface-200 focus:border-brand-500 rounded border px-2 py-1 font-mono text-xs focus:outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
      cell: (item) => (
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openReviewModal(item)}
            className="border-surface-700 bg-surface-900 text-surface-200 flex items-center gap-1 text-xs"
          >
            <Eye className="h-3.5 w-3.5" /> Review
          </Button>
        </div>
      ),
    },
  ];

  const filters: FilterConfig<StateLeadAppItem>[] = [
    {
      label: "Stage",
      key: "status",
      options: STATUS_OPTIONS,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-surface-50 text-2xl font-bold">State Leads Pipeline</h1>
          <p className="text-surface-400 mt-0.5 text-xs sm:text-sm">
            Regional directors managing state ecosystem partnerships, venue budgets, and chapter
            growth.
          </p>
        </div>

        <div className="bg-surface-900 border-surface-800 flex items-center self-start rounded-lg border p-1 sm:self-auto">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              viewMode === "table"
                ? "bg-surface-800 text-surface-100 shadow-sm"
                : "text-surface-400 hover:text-surface-200"
            }`}
          >
            <List className="h-3.5 w-3.5" /> Table
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              viewMode === "kanban"
                ? "bg-surface-800 text-surface-100 shadow-sm"
                : "text-surface-400 hover:text-surface-200"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Kanban
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <AdminDataTable
          data={apps}
          columns={columns}
          filters={filters}
          searchPlaceholder="Search applicant, state, city, email..."
          exportFilename="kailshiansx_state_leads.csv"
          pageSize={15}
          emptyMessage="No state lead applications found."
        />
      ) : (
        <AdminKanban
          columns={kanbanColumns}
          statusOptions={STATUS_OPTIONS}
          onStatusChange={handleStatusChange}
          onItemClick={(item) => openReviewModal(item)}
          isUpdating={isUpdating}
        />
      )}

      {/* Review Modal */}
      <AdminModal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp ? `${selectedApp.name} — State Lead Dossier` : "Candidate Review"}
        description={`${selectedApp?.state} (${selectedApp?.citiesCovered ?? "Regional"})`}
        maxWidth="lg"
      >
        {selectedApp && (
          <div className="space-y-4">
            <div className="bg-surface-950 border-surface-800 grid grid-cols-2 gap-3 rounded-xl border p-3.5 text-xs">
              <div>
                <span className="text-surface-500 block font-semibold">Email:</span>
                <span className="text-surface-200 font-medium">{selectedApp.email}</span>
              </div>
              <div>
                <span className="text-surface-500 block font-semibold">Phone:</span>
                <span className="text-surface-200 font-medium">{selectedApp.phone || "—"}</span>
              </div>
              <div>
                <span className="text-surface-500 block font-semibold">Current Role:</span>
                <span className="text-surface-200 font-medium">
                  {selectedApp.currentRole || "—"}
                </span>
              </div>
              <div>
                <span className="text-surface-500 block font-semibold">Hours / Week:</span>
                <span className="text-surface-200 font-medium">
                  {selectedApp.availabilityHours || "—"}
                </span>
              </div>
            </div>

            {selectedApp.linkedin && (
              <div>
                <a
                  href={selectedApp.linkedin}
                  target="_blank"
                  className="text-brand-400 hover:text-brand-300 flex items-center gap-1 text-xs font-semibold"
                >
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            <div>
              <h4 className="text-surface-200 mb-1 text-xs font-bold uppercase">
                Leadership Evidence & Track Record
              </h4>
              <p className="text-surface-300 bg-surface-950 border-surface-800 rounded-lg border p-3 text-xs whitespace-pre-wrap">
                {selectedApp.leadershipEvidence || "No leadership evidence provided."}
              </p>
            </div>

            <div>
              <h4 className="text-surface-200 mb-1 text-xs font-bold uppercase">
                Community Vision for {selectedApp.state}
              </h4>
              <p className="text-surface-300 bg-surface-950 border-surface-800 rounded-lg border p-3 text-xs whitespace-pre-wrap">
                {selectedApp.communityVision || "No community vision statement provided."}
              </p>
            </div>

            <div>
              <h4 className="text-surface-200 mb-1 text-xs font-bold uppercase">Admin Notes</h4>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal interview notes, committee screening remarks..."
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2.5 text-xs"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                  className="text-xs"
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
