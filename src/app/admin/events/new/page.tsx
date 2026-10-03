// src/app/admin/events/new/page.tsx
// Create New Event Page using the visual no-code EventEditorClient.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import { EventEditorClient } from "@/components/admin/EventEditorClient";

export const metadata: Metadata = {
  title: "Create Event | KailshiansX Admin",
};

export default async function NewEventPage() {
  await requireAdmin();

  const [cities, speakers, partners] = await Promise.all([
    db.city.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, state: true },
    }),
    db.speaker.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        designation: true,
        organisation: true,
        photo: true,
      },
    }),
    db.partner.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        category: true,
      },
    }),
  ]);

  return <EventEditorClient cities={cities} speakersPool={speakers} partnersPool={partners} />;
}
