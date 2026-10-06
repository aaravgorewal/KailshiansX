// src/components/admin/AdminWorkshopsClient.tsx
// Dedicated Workshops Manager client view with data table, category filter, and CSV export.

"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Edit2, ExternalLink } from "lucide-react";
import { AdminDataTable, type ColumnDef, type FilterConfig } from "./AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { EventStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";

export interface WorkshopListItem {
  id: string;
  title: string;
  slug: string;
  status: EventStatus;
  category: string | null;
  cityName: string;
  startDate: string;
  registrationsCount: number;
  maxCapacity: number | null;
  instructors: string;
}

interface AdminWorkshopsClientProps {
  initialWorkshops: WorkshopListItem[];
}

export function AdminWorkshopsClient({ initialWorkshops }: AdminWorkshopsClientProps) {
  const columns: ColumnDef<WorkshopListItem>[] = [
    {
      header: "Workshop Title",
      accessorKey: "title",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="text-foreground block text-xs font-bold">{item.title}</span>
          <span className="text-muted-foreground font-mono text-xs">/events/{item.slug}</span>
        </div>
      ),
    },
    {
      header: "Track / Category",
      accessorKey: "category",
      sortable: true,
      cell: (item) => (
        <span className="bg-muted text-primary rounded px-2 py-0.5 text-xs font-bold uppercase">
          {item.category ?? "Technical Lab"}
        </span>
      ),
    },
    {
      header: "Instructor(s)",
      accessorKey: "instructors",
      sortable: true,
      cell: (item) => (
        <span className="text-muted-foreground text-xs">{item.instructors || "TBA"}</span>
      ),
    },
    {
      header: "City",
      accessorKey: "cityName",
      sortable: true,
      cell: (item) => <span className="text-muted-foreground text-xs">{item.cityName}</span>,
    },
    {
      header: "Seats Filled",
      accessorKey: "registrationsCount",
      sortable: true,
      cell: (item) => (
        <span className="text-primary font-mono text-xs font-bold">
          {item.registrationsCount} / {item.maxCapacity ?? "∞"}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: "startDate",
      sortable: true,
      sortAccessor: (item) => new Date(item.startDate).getTime(),
      cell: (item) => (
        <span className="text-muted-foreground text-xs">{formatDate(item.startDate)}</span>
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
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/events/${item.id}/edit`}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded p-1"
            title="Edit workshop details"
          >
            <Edit2 className="h-4 w-4" />
          </Link>
          <Link
            href={`/events/${item.slug}`}
            target="_blank"
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded p-1"
            title="Preview public workshop page"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  const filters: FilterConfig<WorkshopListItem>[] = [
    {
      label: "Status",
      key: "status",
      options: [
        { label: "Published", value: EventStatus.PUBLISHED },
        { label: "Draft", value: EventStatus.DRAFT },
        { label: "Archived", value: EventStatus.ARCHIVED },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Workshops & Hands-on Labs</h1>
          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
            Practical engineering masterclasses (Rust, Distributed Systems, AI Agents,
            High-Concurrency).
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="bg-primary-hover hover:bg-primary text-primary-foreground flex items-center gap-1.5 self-start rounded-lg px-3.5 py-2 text-xs font-bold shadow-md transition-all sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Workshop</span>
        </Link>
      </div>

      <AdminDataTable
        data={initialWorkshops}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search workshops by topic, instructor, city..."
        exportFilename="kailshiansx_workshops.csv"
        pageSize={15}
        emptyMessage="No workshops found matching criteria."
      />
    </div>
  );
}
