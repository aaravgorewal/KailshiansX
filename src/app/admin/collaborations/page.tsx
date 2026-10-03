// src/app/admin/collaborations/page.tsx
// Server component fetching collaboration leads for AdminCollaborationsClient.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import {
  AdminCollaborationsClient,
  type CollaborationListItem,
} from "@/components/admin/AdminCollaborationsClient";

export const metadata: Metadata = {
  title: "Collaborations Manager | KailshiansX Admin",
};

export default async function AdminCollaborationsPage() {
  await requireAdmin();

  const leads = await db.collaborationLead.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const formatted: CollaborationListItem[] = leads.map((l) => ({
    id: l.id,
    title: l.organisation,
    organisation: l.organisation,
    contactPerson: l.contactPerson,
    email: l.email,
    phone: l.phone,
    website: l.website,
    cityName: l.cityName,
    type: l.type,
    stage: l.stage,
    currentStatus: l.stage,
    proposedEvent: l.proposedEvent,
    resourcesOffered: l.resourcesOffered,
    message: l.message,
    adminNotes: l.adminNotes,
    createdAt: l.createdAt.toISOString(),
  }));

  return <AdminCollaborationsClient initialLeads={formatted} />;
}
