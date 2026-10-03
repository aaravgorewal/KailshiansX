// src/app/admin/events/[id]/edit/page.tsx
// Edit Event Page with full sub-resources preloaded into EventEditorClient.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import { EventEditorClient } from "@/components/admin/EventEditorClient";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditEventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    select: { title: true },
  });

  return {
    title: event ? `Edit ${event.title} | KailshiansX Admin` : "Edit Event",
  };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  await requireAdmin();
  const { id } = await params;

  const [event, cities, speakers, partners] = await Promise.all([
    db.event.findUnique({
      where: { id },
      include: {
        scheduleItems: { orderBy: { sortOrder: "asc" } },
        speakers: { orderBy: { sortOrder: "asc" } },
        tracks: { orderBy: { sortOrder: "asc" } },
        ticketTypes: { orderBy: { sortOrder: "asc" } },
        partners: { orderBy: { sortOrder: "asc" } },
        faqs: { orderBy: { sortOrder: "asc" } },
      },
    }),
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

  if (!event) {
    notFound();
  }

  const initialEvent = {
    id: event.id,
    title: event.title,
    slug: event.slug,
    type: event.type,
    status: event.status,
    category: event.category,
    overview: event.overview,
    coverImage: event.coverImage,
    cityId: event.cityId,
    venue: event.venue,
    venueAddress: event.venueAddress,
    venueMapUrl: event.venueMapUrl,
    attendanceMode: event.attendanceMode,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : null,
    registrationDeadline: event.registrationDeadline
      ? event.registrationDeadline.toISOString()
      : null,
    maxCapacity: event.maxCapacity,
    isFeatured: event.isFeatured,
    scheduleItems: event.scheduleItems.map((s) => ({
      id: s.id,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime ? s.endTime.toISOString() : null,
      title: s.title,
      description: s.description,
      speakerId: s.speakerId,
      sortOrder: s.sortOrder,
    })),
    speakers: event.speakers.map((sp) => ({
      speakerId: sp.speakerId,
      role: sp.role,
    })),
    tracks: event.tracks.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      color: t.color,
      sortOrder: t.sortOrder,
    })),
    ticketTypes: event.ticketTypes.map((tt) => ({
      id: tt.id,
      name: tt.name,
      description: tt.description,
      price: Number(tt.price),
      quota: tt.quota,
      isFree: tt.isFree,
    })),
    partners: event.partners.map((p) => ({
      partnerId: p.partnerId,
      tier: p.tier,
    })),
    faqs: event.faqs.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder,
    })),
  };

  return (
    <EventEditorClient
      initialEvent={initialEvent}
      cities={cities}
      speakersPool={speakers}
      partnersPool={partners}
    />
  );
}
