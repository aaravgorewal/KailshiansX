// src/components/admin/AdminRegistrationsClient.tsx
// Data table view for attendee registrations with status changes, manual check-in, and CSV export.

"use client";

import * as React from "react";
import { UserCheck } from "lucide-react";
import { AdminDataTable, type ColumnDef, type FilterConfig } from "./AdminDataTable";
import { updateRegistrationStatus, toggleAttendanceCheckin } from "@/server/admin/actions";
import { RegistrationStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";

export interface RegistrationListItem {
  id: string;
  registrationCode: string;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  city: string | null;
  tshirtSize: string | null;
  eventTitle: string;
  eventId: string;
  ticketTier: string;
  ticketPrice: number;
  status: RegistrationStatus;
  checkedIn: boolean;
  checkedInAt: string | null;
  createdAt: string;
}

interface AdminRegistrationsClientProps {
  initialRegistrations: RegistrationListItem[];
  events: { id: string; title: string }[];
}

export function AdminRegistrationsClient({
  initialRegistrations,
  events,
}: AdminRegistrationsClientProps) {
  const [registrations, setRegistrations] =
    React.useState<RegistrationListItem[]>(initialRegistrations);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: RegistrationStatus) => {
    try {
      setLoadingId(id);
      await updateRegistrationStatus(id, newStatus);
      setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update registration status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleCheckin = async (id: string) => {
    try {
      setLoadingId(id);
      const res = await toggleAttendanceCheckin(id);
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                checkedIn: res.checkedIn,
                checkedInAt: res.checkedIn ? new Date().toISOString() : null,
              }
            : r
        )
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to toggle check-in");
    } finally {
      setLoadingId(null);
    }
  };

  const columns: ColumnDef<RegistrationListItem>[] = [
    {
      header: "Code",
      accessorKey: "registrationCode",
      sortable: true,
      cell: (item) => (
        <span className="text-brand-300 font-mono text-xs font-bold">{item.registrationCode}</span>
      ),
    },
    {
      header: "Attendee",
      accessorKey: "name",
      sortable: true,
      cell: (item) => (
        <div>
          <p className="text-surface-100 font-semibold">{item.name}</p>
          <div className="text-surface-400 mt-0.5 flex items-center gap-2 text-[11px]">
            <span>{item.email}</span>
            {item.phone && (
              <>
                <span>·</span>
                <span>{item.phone}</span>
              </>
            )}
          </div>
          {item.college && (
            <p className="text-surface-500 max-w-[200px] truncate text-[10px]">{item.college}</p>
          )}
        </div>
      ),
    },
    {
      header: "Event",
      accessorKey: "eventTitle",
      sortable: true,
      cell: (item) => (
        <span className="text-surface-200 block max-w-[220px] truncate text-xs font-medium">
          {item.eventTitle}
        </span>
      ),
    },
    {
      header: "Tier & Price",
      accessorKey: "ticketTier",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="text-surface-200 text-xs font-semibold">{item.ticketTier}</span>
          <p className="text-surface-400 font-mono text-[11px]">
            {item.ticketPrice > 0 ? `₹${item.ticketPrice}` : "Free Pass"}
          </p>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (item) => {
        const isBusy = loadingId === item.id;

        return (
          <select
            value={item.status}
            disabled={isBusy}
            onChange={(e) => handleStatusChange(item.id, e.target.value as RegistrationStatus)}
            className="bg-surface-900 border-surface-700 text-surface-200 focus:border-brand-500 rounded border px-2 py-1 text-xs focus:outline-none disabled:opacity-50"
          >
            <option value={RegistrationStatus.CONFIRMED}>CONFIRMED</option>
            <option value={RegistrationStatus.PENDING}>PENDING</option>
            <option value={RegistrationStatus.CANCELLED}>CANCELLED</option>
            <option value={RegistrationStatus.WAITLISTED}>WAITLISTED</option>
          </select>
        );
      },
    },
    {
      header: "Check-in",
      accessorKey: "checkedIn",
      sortable: true,
      cell: (item) => {
        const isBusy = loadingId === item.id;

        return (
          <button
            onClick={() => handleToggleCheckin(item.id)}
            disabled={isBusy}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              item.checkedIn
                ? "border border-emerald-800 bg-emerald-950/60 text-emerald-300"
                : "bg-surface-800 text-surface-400 hover:text-surface-200 hover:bg-surface-700"
            }`}
            title={item.checkedIn ? "Click to revoke check-in" : "Click to mark checked-in"}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>{item.checkedIn ? "Checked In" : "Not Checked In"}</span>
          </button>
        );
      },
    },
    {
      header: "Registered",
      accessorKey: "createdAt",
      sortable: true,
      sortAccessor: (item) => new Date(item.createdAt).getTime(),
      cell: (item) => (
        <span className="text-surface-400 text-xs">{formatDate(item.createdAt)}</span>
      ),
    },
  ];

  const filters: FilterConfig<RegistrationListItem>[] = [
    {
      label: "Status",
      key: "status",
      options: [
        { label: "Confirmed", value: RegistrationStatus.CONFIRMED },
        { label: "Pending", value: RegistrationStatus.PENDING },
        { label: "Cancelled", value: RegistrationStatus.CANCELLED },
        { label: "Waitlisted", value: RegistrationStatus.WAITLISTED },
      ],
    },
    {
      label: "Event",
      key: "eventId",
      options: events.map((e) => ({ label: e.title, value: e.id })),
    },
    {
      label: "Attendance",
      key: (item) => (item.checkedIn ? "CHECKED_IN" : "NOT_CHECKED_IN"),
      options: [
        { label: "Checked In", value: "CHECKED_IN" },
        { label: "Not Checked In", value: "NOT_CHECKED_IN" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-surface-50 text-2xl font-bold">Registrations & Passes</h1>
        <p className="text-surface-400 mt-0.5 text-xs sm:text-sm">
          Audited roster of attendee passes, payment status, and gate attendance.
        </p>
      </div>

      <AdminDataTable
        data={registrations}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search attendee name, email, code, college..."
        exportFilename="kailshiansx_registrations.csv"
        pageSize={20}
        emptyMessage="No registrations found matching criteria."
      />
    </div>
  );
}
