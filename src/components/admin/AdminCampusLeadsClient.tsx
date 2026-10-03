// src/components/admin/AdminCampusLeadsClient.tsx
// Campus Leads Pipeline with Table & Kanban views, status transitions, review modal, and CSV export.

"use client";

import * as React from "react";
import { LayoutGrid, List, Eye, ExternalLink } from "lucide-react";
import { AdminDataTable, type ColumnDef, type FilterConfig } from "./AdminDataTable";
import { AdminKanban, type KanbanColumn, type KanbanItemProps } from "./AdminKanban";
import { AdminModal } from "./AdminModal";
import { Button } from "@/components/ui/Button";
import { updateCampusLeadStatus } from "@/server/admin/actions";
import { CampusLeadStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";

export interface CampusLeadAppItem extends KanbanItemProps {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  college: string;
  city: string | null;
  courseYear: string | null;
  linkedin: string | null;
  experience: string | null;
  communityInvolvement: string | null;
  whyKailshiansX: string | null;
  availability: string | null;
  status: CampusLeadStatus;
  adminNotes: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { label: "Applied", value: CampusLeadStatus.APPLIED },
  { label: "Screening", value: CampusLeadStatus.SCREENING },
  { label: "Interview", value: CampusLeadStatus.INTERVIEW },
  { label: "Selected", value: CampusLeadStatus.SELECTED },
  { label: "Active Lead", value: CampusLeadStatus.ACTIVE },
  { label: "Alumni", value: CampusLeadStatus.ALUMNI },
  { label: "Inactive", value: CampusLeadStatus.INACTIVE },
];

interface AdminCampusLeadsClientProps {
  initialApplications: CampusLeadAppItem[];
}

export function AdminCampusLeadsClient({ initialApplications }: AdminCampusLeadsClientProps) {
  const [apps, setApps] = React.useState<CampusLeadAppItem[]>(initialApplications);
  const [viewMode, setViewMode] = React.useState<"table" | "kanban">("table");
  const [selectedApp, setSelectedApp] = React.useState<CampusLeadAppItem | null>(null);
  const [adminNotes, setAdminNotes] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      await updateCampusLeadStatus(id, newStatus as CampusLeadStatus);
      setApps((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: newStatus as CampusLeadStatus, currentStatus: newStatus }
            : a
        )
      );
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp((prev) =>
          prev ? { ...prev, status: newStatus as CampusLeadStatus } : null
        );
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update lead status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    try {
      setIsUpdating(true);
      await updateCampusLeadStatus(selectedApp.id, selectedApp.status, adminNotes);
      setApps((prev) => prev.map((a) => (a.id === selectedApp.id ? { ...a, adminNotes } : a)));
      setSelectedApp((prev) => (prev ? { ...prev, adminNotes } : null));
      alert("Notes saved successfully");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save notes");
    } finally {
      setIsUpdating(false);
    }
  };

  const openReviewModal = (app: CampusLeadAppItem) => {
    setSelectedApp(app);
    setAdminNotes(app.adminNotes || "");
  };

  // Prepare Kanban columns
  const kanbanColumns: KanbanColumn<CampusLeadAppItem>[] = STATUS_OPTIONS.slice(0, 5).map(
    (opt) => ({
      id: opt.value,
      title: opt.label,
      items: apps
        .filter((a) => a.status === opt.value)
        .map((a) => ({
          ...a,
          title: a.name,
          subtitle: a.college,
          tag: a.courseYear ?? "Student",
          date: formatDate(a.createdAt),
          currentStatus: a.status,
          details: [
            { label: "City", value: a.city },
            { label: "Email", value: a.email },
          ],
        })),
    })
  );

  const columns: ColumnDef<CampusLeadAppItem>[] = [
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
      header: "College & Year",
      accessorKey: "college",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="text-surface-200 block max-w-[200px] truncate text-xs font-medium">
            {item.college}
          </span>
          <span className="text-surface-400 text-[11px]">
            {item.courseYear || "Undergraduate"} {item.city ? `(${item.city})` : ""}
          </span>
        </div>
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
      header: "Applied Date",
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

  const filters: FilterConfig<CampusLeadAppItem>[] = [
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
          <h1 className="text-surface-50 text-2xl font-bold">Campus Leads Pipeline</h1>
          <p className="text-surface-400 mt-0.5 text-xs sm:text-sm">
            Evaluate collegiate leaders driving developer clubs and campus hackathon qualifiers.
          </p>
        </div>

        {/* View mode switcher */}
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
          searchPlaceholder="Search applicant, college, city, email..."
          exportFilename="kailshiansx_campus_leads.csv"
          pageSize={15}
          emptyMessage="No campus lead applications found."
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

      {/* Candidate Review Modal */}
      <AdminModal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp ? `${selectedApp.name} — Dossier` : "Candidate Review"}
        description={`${selectedApp?.college} (${selectedApp?.city ?? "India"})`}
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
                <span className="text-surface-500 block font-semibold">Course / Year:</span>
                <span className="text-surface-200 font-medium">
                  {selectedApp.courseYear || "—"}
                </span>
              </div>
              <div>
                <span className="text-surface-500 block font-semibold">Availability:</span>
                <span className="text-surface-200 font-medium">
                  {selectedApp.availability || "—"}
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
                Technical Experience & Background
              </h4>
              <p className="text-surface-300 bg-surface-950 border-surface-800 rounded-lg border p-3 text-xs whitespace-pre-wrap">
                {selectedApp.experience || "No experience summary provided."}
              </p>
            </div>

            <div>
              <h4 className="text-surface-200 mb-1 text-xs font-bold uppercase">
                Community Involvement
              </h4>
              <p className="text-surface-300 bg-surface-950 border-surface-800 rounded-lg border p-3 text-xs whitespace-pre-wrap">
                {selectedApp.communityInvolvement || "No previous community involvement details."}
              </p>
            </div>

            <div>
              <h4 className="text-surface-200 mb-1 text-xs font-bold uppercase">
                Why KailshiansX?
              </h4>
              <p className="text-surface-300 bg-surface-950 border-surface-800 rounded-lg border p-3 text-xs whitespace-pre-wrap">
                {selectedApp.whyKailshiansX || "No motivation statement provided."}
              </p>
            </div>

            <div>
              <h4 className="text-surface-200 mb-1 text-xs font-bold uppercase">Admin Notes</h4>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal interview notes, screening feedback..."
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
