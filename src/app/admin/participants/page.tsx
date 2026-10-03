// src/app/admin/participants/page.tsx
// Server component fetching users / participants for AdminParticipantsClient.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import {
  AdminParticipantsClient,
  type ParticipantListItem,
} from "@/components/admin/AdminParticipantsClient";

export const metadata: Metadata = {
  title: "Participants Manager | KailshiansX Admin",
};

export default async function AdminParticipantsPage() {
  await requireAdmin();

  const users = await db.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { registrations: true },
      },
    },
  });

  const formatted: ParticipantListItem[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    registrationsCount: u._count.registrations,
    createdAt: u.createdAt.toISOString(),
  }));

  return <AdminParticipantsClient initialParticipants={formatted} />;
}
