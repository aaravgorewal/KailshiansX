// src/components/admin/AdminParticipantsClient.tsx
// Data table view for registered users / participants with role management and CSV export.

"use client";

import * as React from "react";
import { AdminDataTable, type ColumnDef, type FilterConfig } from "./AdminDataTable";
import { updateUserRole } from "@/server/admin/actions";
import { UserRole } from "@prisma/client";
import { formatDate } from "@/lib/utils";

export interface ParticipantListItem {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  registrationsCount: number;
  createdAt: string;
}

interface AdminParticipantsClientProps {
  initialParticipants: ParticipantListItem[];
}

export function AdminParticipantsClient({ initialParticipants }: AdminParticipantsClientProps) {
  const [participants, setParticipants] =
    React.useState<ParticipantListItem[]>(initialParticipants);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!confirm(`Change user role to ${newRole}?`)) return;
    try {
      setLoadingId(userId);
      await updateUserRole(userId, newRole);
      setParticipants((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to change role");
    } finally {
      setLoadingId(null);
    }
  };

  const columns: ColumnDef<ParticipantListItem>[] = [
    {
      header: "User",
      accessorKey: "name",
      sortable: true,
      cell: (item) => (
        <div>
          <p className="text-surface-100 font-semibold">{item.name || "Anonymous User"}</p>
          <p className="text-surface-400 text-[11px]">{item.email}</p>
        </div>
      ),
    },
    {
      header: "Role",
      accessorKey: "role",
      sortable: true,
      cell: (item) => {
        const isBusy = loadingId === item.id;

        return (
          <select
            value={item.role}
            disabled={isBusy}
            onChange={(e) => handleRoleChange(item.id, e.target.value as UserRole)}
            className="bg-surface-900 border-surface-700 text-surface-200 focus:border-brand-500 rounded border px-2 py-1 font-mono text-xs focus:outline-none"
          >
            <option value={UserRole.VIEWER}>VIEWER</option>
            <option value={UserRole.MEMBER}>MEMBER</option>
            <option value={UserRole.CAMPUS_LEAD}>CAMPUS_LEAD</option>
            <option value={UserRole.STATE_LEAD}>STATE_LEAD</option>
            <option value={UserRole.EVENT_MANAGER}>EVENT_MANAGER</option>
            <option value={UserRole.ADMIN}>ADMIN</option>
            <option value={UserRole.SUPER_ADMIN}>SUPER_ADMIN</option>
          </select>
        );
      },
    },
    {
      header: "Passes",
      accessorKey: "registrationsCount",
      sortable: true,
      cell: (item) => (
        <span className="text-brand-400 text-xs font-bold">{item.registrationsCount}</span>
      ),
    },
    {
      header: "Joined Date",
      accessorKey: "createdAt",
      sortable: true,
      sortAccessor: (item) => new Date(item.createdAt).getTime(),
      cell: (item) => (
        <span className="text-surface-400 text-xs">{formatDate(item.createdAt)}</span>
      ),
    },
  ];

  const filters: FilterConfig<ParticipantListItem>[] = [
    {
      label: "Role",
      key: "role",
      options: [
        { label: "Super Admin", value: UserRole.SUPER_ADMIN },
        { label: "Admin", value: UserRole.ADMIN },
        { label: "Event Manager", value: UserRole.EVENT_MANAGER },
        { label: "Campus Lead", value: UserRole.CAMPUS_LEAD },
        { label: "State Lead", value: UserRole.STATE_LEAD },
        { label: "Member", value: UserRole.MEMBER },
        { label: "Viewer", value: UserRole.VIEWER },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-surface-50 text-2xl font-bold">Participants & Access Control</h1>
        <p className="text-surface-400 mt-0.5 text-xs sm:text-sm">
          Directory of registered builders, community members, and administrative role assignments.
        </p>
      </div>

      <AdminDataTable
        data={participants}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search participant name, email..."
        exportFilename="kailshiansx_participants.csv"
        pageSize={20}
        emptyMessage="No participants found matching criteria."
      />
    </div>
  );
}
