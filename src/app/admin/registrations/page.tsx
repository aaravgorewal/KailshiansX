// src/app/admin/registrations/page.tsx
// Server component fetching registrations and events for AdminRegistrationsClient.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import {
  AdminRegistrationsClient,
  type RegistrationListItem,
} from "@/components/admin/AdminRegistrationsClient";

export const metadata: Metadata = {
  title: "Registrations Manager | KailshiansX Admin",
};

export default async function AdminRegistrationsPage() {
  await requireAdmin();

  const [registrations, events] = await Promise.all([
    db.registration.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        event: { select: { id: true, title: true } },
        ticketType: { select: { name: true, price: true } },
        attendance: true,
      },
    }),
    db.event.findMany({
      where: { deletedAt: null },
      orderBy: { startDate: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  const formatted: RegistrationListItem[] = registrations.map((r) => ({
    id: r.id,
    registrationCode: r.registrationCode,
    name: r.name,
    email: r.email,
    phone: r.phone,
    college: r.college,
    city: r.city,
    tshirtSize: r.tshirtSize,
    eventTitle: r.event.title,
    eventId: r.event.id,
    ticketTier: r.ticketType.name,
    ticketPrice: Number(r.ticketType.price),
    status: r.status,
    checkedIn: Boolean(r.attendance),
    checkedInAt: r.attendance ? r.attendance.checkedInAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  }));

  return <AdminRegistrationsClient initialRegistrations={formatted} events={events} />;
}
