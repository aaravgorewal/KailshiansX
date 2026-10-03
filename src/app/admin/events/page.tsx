// src/app/admin/events/page.tsx
// Admin Events page listing all events with search, filter, and management actions.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import { AdminEventsClient, type EventListItem } from "@/components/admin/AdminEventsClient";

export const metadata: Metadata = {
  title: "Events Manager | KailshiansX Admin",
};

export default async function AdminEventsPage() {
  await requireAdmin();

  const events = await db.event.findMany({
    where: { deletedAt: null },
    orderBy: { startDate: "desc" },
    include: {
      city: { select: { name: true } },
      _count: {
        select: {
          registrations: true,
          ticketTypes: true,
        },
      },
    },
  });

  const formattedEvents: EventListItem[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    type: e.type,
    status: e.status,
    category: e.category,
    cityName: e.city?.name ?? "India (Online)",
    startDate: e.startDate.toISOString(),
    registrationsCount: e._count.registrations,
    ticketsCount: e._count.ticketTypes,
    isFeatured: e.isFeatured,
  }));

  return <AdminEventsClient initialEvents={formattedEvents} />;
}
