// src/components/admin/AdminEventsClient.tsx
// Data table view for all events with search, filter, sort, pagination, CSV export, and quick actions.

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ExternalLink, Edit2, Copy, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { AdminDataTable, type ColumnDef, type FilterConfig } from "./AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { duplicateEvent, togglePublishEvent, deleteEvent } from "@/server/admin/actions";
import { EventStatus, EventType } from "@prisma/client";
import { formatDate } from "@/lib/utils";

export interface EventListItem {
  id: string;
  title: string;
  slug: string;
  type: EventType;
  status: EventStatus;
  category: string | null;
  cityName: string;
  startDate: string; // ISO
  registrationsCount: number;
  ticketsCount: number;
  isFeatured: boolean;
}

interface AdminEventsClientProps {
  initialEvents: EventListItem[];
}

export function AdminEventsClient({ initialEvents }: AdminEventsClientProps) {
  const router = useRouter();
  const [events, setEvents] = React.useState<EventListItem[]>(initialEvents);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const handleDuplicate = async (id: string) => {
    try {
      setLoadingId(id);
      const res = await duplicateEvent(id);
      router.push(`/admin/events/${res.duplicatedId}/edit`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to duplicate event");
      setLoadingId(null);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: EventStatus) => {
    try {
      setLoadingId(id);
      const target =
        currentStatus === EventStatus.PUBLISHED ? EventStatus.DRAFT : EventStatus.PUBLISHED;
      await togglePublishEvent(id, target);
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: target } : e)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to change event status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      setLoadingId(id);
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete event");
    } finally {
      setLoadingId(null);
    }
  };

  const columns: ColumnDef<EventListItem>[] = [
    {
      header: "Title & Slug",
      accessorKey: "title",
      sortable: true,
      cell: (item) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-foreground font-bold">{item.title}</span>
            {item.isFeatured && (
              <Badge variant="warning" size="sm" className="px-1 py-0 text-[9px]">
                Featured
              </Badge>
            )}
          </div>
          <span className="text-muted-foreground font-mono text-xs">/events/{item.slug}</span>
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      sortable: true,
      cell: (item) => (
        <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-bold uppercase">
          {item.type}
        </span>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      sortable: true,
      cell: (item) => (
        <span className="text-muted-foreground text-xs font-medium">
          {item.category ?? "General"}
        </span>
      ),
    },
    {
      header: "City",
      accessorKey: "cityName",
      sortable: true,
      cell: (item) => <span className="text-muted-foreground text-xs">{item.cityName}</span>,
    },
    {
      header: "Start Date",
      accessorKey: "startDate",
      sortable: true,
      sortAccessor: (item) => new Date(item.startDate).getTime(),
      cell: (item) => (
        <span className="text-muted-foreground text-xs">{formatDate(item.startDate)}</span>
      ),
    },
    {
      header: "Passes",
      accessorKey: "registrationsCount",
      sortable: true,
      cell: (item) => (
        <span className="text-primary text-xs font-bold">{item.registrationsCount}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (item) => (
        <Badge
          variant={
            item.status === EventStatus.PUBLISHED
              ? "success"
              : item.status === EventStatus.ARCHIVED
                ? "default"
                : "warning"
          }
          size="sm"
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: (item) => {
        const isBusy = loadingId === item.id;

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleTogglePublish(item.id, item.status)}
              disabled={isBusy}
              title={item.status === EventStatus.PUBLISHED ? "Unpublish event" : "Publish event"}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded p-1 disabled:opacity-40"
            >
              {item.status === EventStatus.PUBLISHED ? (
                <CheckCircle2 className="text-success h-4 w-4" />
              ) : (
                <XCircle className="text-primary h-4 w-4" />
              )}
            </button>

            <Link
              href={`/admin/events/${item.id}/edit`}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded p-1"
              title="Edit event"
            >
              <Edit2 className="h-4 w-4" />
            </Link>

            <button
              onClick={() => handleDuplicate(item.id)}
              disabled={isBusy}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded p-1 disabled:opacity-40"
              title="Duplicate event"
            >
              <Copy className="h-4 w-4" />
            </button>

            <Link
              href={`/events/${item.slug}`}
              target="_blank"
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded p-1"
              title="Open public page"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>

            <button
              onClick={() => handleDelete(item.id)}
              disabled={isBusy}
              className="text-destructive hover:bg-destructive/10 rounded p-1 disabled:opacity-40"
              title="Delete event"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const filters: FilterConfig<EventListItem>[] = [
    {
      label: "Status",
      key: "status",
      options: [
        { label: "Draft", value: EventStatus.DRAFT },
        { label: "Published", value: EventStatus.PUBLISHED },
        { label: "Archived", value: EventStatus.ARCHIVED },
      ],
    },
    {
      label: "Type",
      key: "type",
      options: [
        { label: "Meetup", value: EventType.MEETUP },
        { label: "Hackathon", value: EventType.HACKATHON },
        { label: "Workshop", value: EventType.WORKSHOP },
        { label: "Tech Talk", value: EventType.TECH_TALK },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Events Control</h1>
          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
            Manage meetups, hackathons, workshops, and tech talks across all Indian chapters.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="bg-primary-hover hover:bg-primary flex items-center gap-1.5 self-start rounded-lg px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create Event</span>
        </Link>
      </div>

      <AdminDataTable
        data={events}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search event title, slug, category, city..."
        exportFilename="kailshiansx_events.csv"
        pageSize={15}
        emptyMessage="No events found matching criteria."
      />
    </div>
  );
}
