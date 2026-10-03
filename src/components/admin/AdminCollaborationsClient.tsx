// src/components/admin/AdminCollaborationsClient.tsx
// Collaborations Pipeline with Table & Kanban views, stage changes, create modal, and CSV export.

"use client";

import * as React from "react";
import { LayoutGrid, List, Plus, Eye } from "lucide-react";
import { AdminDataTable, type ColumnDef, type FilterConfig } from "./AdminDataTable";
import { AdminKanban, type KanbanColumn, type KanbanItemProps } from "./AdminKanban";
import { AdminModal } from "./AdminModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { updateCollaborationStage, createCollaborationLead } from "@/server/admin/actions";
import { CollaborationStage, CollaborationType } from "@prisma/client";
import { formatDate } from "@/lib/utils";

export interface CollaborationListItem extends KanbanItemProps {
  id: string;
  type: CollaborationType;
  stage: CollaborationStage;
  organisation: string;
  contactPerson: string;
  email: string;
  phone: string | null;
  website: string | null;
  cityName: string | null;
  proposedEvent: string | null;
  resourcesOffered: string | null;
  message: string | null;
  adminNotes: string | null;
  createdAt: string;
}

const STAGE_OPTIONS = [
  { label: "New Lead", value: CollaborationStage.NEW },
  { label: "Contacted", value: CollaborationStage.CONTACTED },
  { label: "Meeting Scheduled", value: CollaborationStage.MEETING },
  { label: "Negotiating", value: CollaborationStage.NEGOTIATION },
  { label: "Confirmed", value: CollaborationStage.CONFIRMED },
  { label: "Won / Active", value: CollaborationStage.WON },
  { label: "Declined", value: CollaborationStage.DECLINED },
];

const TYPE_OPTIONS = [
  { label: "Collegiate Partner", value: CollaborationType.COLLEGE },
  { label: "Community Chapter", value: CollaborationType.COMMUNITY },
  { label: "Venue Partner", value: CollaborationType.VENUE },
  { label: "Corporate Sponsor", value: CollaborationType.SPONSOR },
];

interface AdminCollaborationsClientProps {
  initialLeads: CollaborationListItem[];
}

export function AdminCollaborationsClient({ initialLeads }: AdminCollaborationsClientProps) {
  const [leads, setLeads] = React.useState<CollaborationListItem[]>(initialLeads);
  const [viewMode, setViewMode] = React.useState<"table" | "kanban">("table");
  const [selectedLead, setSelectedLead] = React.useState<CollaborationListItem | null>(null);
  const [adminNotes, setAdminNotes] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  // New Lead Modal state
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newOrg, setNewOrg] = React.useState("");
  const [newContact, setNewContact] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [newWebsite, setNewWebsite] = React.useState("");
  const [newCity, setNewCity] = React.useState("");
  const [newType, setNewType] = React.useState<CollaborationType>(CollaborationType.COLLEGE);
  const [newMessage, setNewMessage] = React.useState("");

  const handleStageChange = async (id: string, newStage: string) => {
    try {
      setIsUpdating(true);
      await updateCollaborationStage(id, newStage as CollaborationStage);
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, stage: newStage as CollaborationStage, currentStatus: newStage } : l
        )
      );
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead((prev) =>
          prev ? { ...prev, stage: newStage as CollaborationStage } : null
        );
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update collaboration stage");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    try {
      setIsUpdating(true);
      await updateCollaborationStage(selectedLead.id, selectedLead.stage, adminNotes);
      setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? { ...l, adminNotes } : l)));
      setSelectedLead((prev) => (prev ? { ...prev, adminNotes } : null));
      alert("Notes saved successfully");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save notes");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateLead = async () => {
    if (!newOrg.trim() || !newContact.trim() || !newEmail.trim()) return;
    try {
      setIsUpdating(true);
      const res = await createCollaborationLead({
        type: newType,
        organisation: newOrg.trim(),
        contactPerson: newContact.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim() || undefined,
        website: newWebsite.trim() || undefined,
        cityName: newCity.trim() || undefined,
        message: newMessage.trim() || undefined,
      });

      setLeads((prev) => [
        {
          id: res.leadId,
          title: newOrg.trim(),
          organisation: newOrg.trim(),
          contactPerson: newContact.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim() || null,
          website: newWebsite.trim() || null,
          cityName: newCity.trim() || null,
          type: newType,
          stage: CollaborationStage.NEW,
          currentStatus: CollaborationStage.NEW,
          proposedEvent: null,
          resourcesOffered: null,
          message: newMessage.trim() || null,
          adminNotes: null,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setShowCreateModal(false);
      setNewOrg("");
      setNewContact("");
      setNewEmail("");
      setNewPhone("");
      setNewWebsite("");
      setNewCity("");
      setNewMessage("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setIsUpdating(false);
    }
  };

  const openReviewModal = (lead: CollaborationListItem) => {
    setSelectedLead(lead);
    setAdminNotes(lead.adminNotes || "");
  };

  const kanbanColumns: KanbanColumn<CollaborationListItem>[] = STAGE_OPTIONS.slice(0, 5).map(
    (opt) => ({
      id: opt.value,
      title: opt.label,
      items: leads
        .filter((l) => l.stage === opt.value)
        .map((l) => ({
          ...l,
          title: l.organisation,
          subtitle: `${l.contactPerson} (${l.type})`,
          tag: l.type,
          date: formatDate(l.createdAt),
          currentStatus: l.stage,
          details: [
            { label: "City", value: l.cityName },
            { label: "Email", value: l.email },
          ],
        })),
    })
  );

  const columns: ColumnDef<CollaborationListItem>[] = [
    {
      header: "Organisation & Contact",
      accessorKey: "organisation",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="text-surface-100 block text-xs font-bold">{item.organisation}</span>
          <div className="text-surface-400 flex items-center gap-1.5 text-[11px]">
            <span>{item.contactPerson}</span>
            <span>·</span>
            <span>{item.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      sortable: true,
      cell: (item) => (
        <Badge variant="outline" size="sm" className="text-[10px]">
          {item.type}
        </Badge>
      ),
    },
    {
      header: "City",
      accessorKey: "cityName",
      sortable: true,
      cell: (item) => (
        <span className="text-surface-300 text-xs">{item.cityName || "National"}</span>
      ),
    },
    {
      header: "Stage",
      accessorKey: "stage",
      sortable: true,
      cell: (item) => (
        <select
          value={item.stage}
          onChange={(e) => handleStageChange(item.id, e.target.value)}
          className="bg-surface-900 border-surface-700 text-surface-200 focus:border-brand-500 rounded border px-2 py-1 font-mono text-xs focus:outline-none"
        >
          {STAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: "Created",
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
            <Eye className="h-3.5 w-3.5" /> Dossier
          </Button>
        </div>
      ),
    },
  ];

  const filters: FilterConfig<CollaborationListItem>[] = [
    {
      label: "Stage",
      key: "stage",
      options: STAGE_OPTIONS,
    },
    {
      label: "Type",
      key: "type",
      options: TYPE_OPTIONS,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-surface-50 text-2xl font-bold">Collaborations & Partnerships</h1>
          <p className="text-surface-400 mt-0.5 text-xs sm:text-sm">
            Ecosystem pipeline for university venues, developer communities, and corporate sponsors.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View mode switcher */}
          <div className="bg-surface-900 border-surface-800 flex items-center rounded-lg border p-1">
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

          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="bg-brand-600 hover:bg-brand-500 shadow-brand-600/20 flex items-center gap-1.5 text-xs font-bold text-white shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>New Lead</span>
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <AdminDataTable
          data={leads}
          columns={columns}
          filters={filters}
          searchPlaceholder="Search organisation, contact person, email, city..."
          exportFilename="kailshiansx_collaborations.csv"
          pageSize={15}
          emptyMessage="No collaboration leads found."
        />
      ) : (
        <AdminKanban
          columns={kanbanColumns}
          statusOptions={STAGE_OPTIONS}
          onStatusChange={handleStageChange}
          onItemClick={(item) => openReviewModal(item)}
          isUpdating={isUpdating}
        />
      )}

      {/* Review Modal */}
      <AdminModal
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title={selectedLead ? `${selectedLead.organisation} — Proposal` : "Collaboration Review"}
        description={`${selectedLead?.contactPerson} (${selectedLead?.type})`}
        maxWidth="lg"
      >
        {selectedLead && (
          <div className="space-y-4">
            <div className="bg-surface-950 border-surface-800 grid grid-cols-2 gap-3 rounded-xl border p-3.5 text-xs">
              <div>
                <span className="text-surface-500 block font-semibold">Contact:</span>
                <span className="text-surface-200 font-medium">{selectedLead.contactPerson}</span>
              </div>
              <div>
                <span className="text-surface-500 block font-semibold">Email:</span>
                <span className="text-surface-200 font-medium">{selectedLead.email}</span>
              </div>
              <div>
                <span className="text-surface-500 block font-semibold">Phone:</span>
                <span className="text-surface-200 font-medium">{selectedLead.phone || "—"}</span>
              </div>
              <div>
                <span className="text-surface-500 block font-semibold">Website:</span>
                <span className="text-surface-200 font-medium">{selectedLead.website || "—"}</span>
              </div>
            </div>

            <div>
              <h4 className="text-surface-200 mb-1 text-xs font-bold uppercase">
                Proposed Event / Engagement
              </h4>
              <p className="text-surface-300 bg-surface-950 border-surface-800 rounded-lg border p-3 text-xs whitespace-pre-wrap">
                {selectedLead.proposedEvent || selectedLead.message || "No description provided."}
              </p>
            </div>

            {selectedLead.resourcesOffered && (
              <div>
                <h4 className="text-surface-200 mb-1 text-xs font-bold uppercase">
                  Resources Offered (Auditorium, AV, Catering, Budget)
                </h4>
                <p className="text-surface-300 bg-surface-950 border-surface-800 rounded-lg border p-3 text-xs whitespace-pre-wrap">
                  {selectedLead.resourcesOffered}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-surface-200 mb-1 text-xs font-bold uppercase">Internal Notes</h4>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Meeting summary, term sheet details, partnership commitments..."
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

      {/* New Lead Modal */}
      <AdminModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Collaboration Lead"
        description="Register a new partnership prospect or college host lead"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">
                Organisation <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newOrg}
                onChange={(e) => setNewOrg(e.target.value)}
                placeholder="e.g. BITS Pilani / AWS User Group"
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2 text-xs"
              />
            </div>
            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">Lead Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as CollaborationType)}
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2 text-xs"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">
                Contact Person <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                placeholder="Dr. Rajesh / Neha Sharma"
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2 text-xs"
              />
            </div>
            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="partner@college.edu.in"
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">
                Phone Number
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2 text-xs"
              />
            </div>
            <div>
              <label className="text-surface-300 mb-1 block text-xs font-semibold">
                City / Region
              </label>
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Pilani / Jaipur"
                className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-surface-300 mb-1 block text-xs font-semibold">
              Proposal / Discussion Notes
            </label>
            <textarea
              rows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Summary of mutual interests, requested event dates, or sponsorship tiers..."
              className="bg-surface-950 border-surface-700 text-surface-100 w-full rounded-lg border p-2 text-xs"
            />
          </div>

          <div className="border-surface-800 flex justify-end gap-2 border-t pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateLead}
              disabled={isUpdating}
              className="bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white"
            >
              {isUpdating ? "Saving..." : "Create Lead"}
            </Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
