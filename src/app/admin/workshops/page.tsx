// src/app/admin/workshops/page.tsx
// Server component fetching events of type WORKSHOP for AdminWorkshopsClient.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import {
  AdminWorkshopsClient,
  type WorkshopListItem,
} from "@/components/admin/AdminWorkshopsClient";
import { EventType } from "@prisma/client";

export const metadata: Metadata = {
  title: "Workshops Manager | KailshiansX Admin",
};

export default async function AdminWorkshopsPage() {
  await requireAdmin();

  const workshops = await db.event.findMany({
    where: {
      type: EventType.WORKSHOP,
      deletedAt: null,
    },
    orderBy: { startDate: "desc" },
    include: {
      city: { select: { name: true } },
      speakers: {
        include: {
          speaker: { select: { name: true } },
        },
      },
      _count: {
        select: { registrations: true },
      },
    },
  });

  const formatted: WorkshopListItem[] = workshops.map((w) => ({
    id: w.id,
    title: w.title,
    slug: w.slug,
    status: w.status,
    category: w.category,
    cityName: w.city?.name ?? "India (Online)",
    startDate: w.startDate.toISOString(),
    registrationsCount: w._count.registrations,
    maxCapacity: w.maxCapacity,
    instructors: w.speakers.map((s) => s.speaker.name).join(", "),
  }));

  return <AdminWorkshopsClient initialWorkshops={formatted} />;
}
