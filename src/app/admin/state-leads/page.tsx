// src/app/admin/state-leads/page.tsx
// Server component fetching state lead applications for AdminStateLeadsClient.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import {
  AdminStateLeadsClient,
  type StateLeadAppItem,
} from "@/components/admin/AdminStateLeadsClient";

export const metadata: Metadata = {
  title: "State Leads Pipeline | KailshiansX Admin",
};

export default async function AdminStateLeadsPage() {
  await requireAdmin();

  const applications = await db.stateLeadApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formatted: StateLeadAppItem[] = applications.map((a) => ({
    id: a.id,
    title: a.name,
    name: a.name,
    email: a.email,
    phone: a.phone,
    state: a.state,
    city: a.city,
    citiesCovered: a.citiesCovered,
    currentRole: a.currentRole,
    linkedin: a.linkedin,
    experience: a.experience,
    leadershipEvidence: a.leadershipEvidence,
    communityVision: a.communityVision,
    whyKailshiansX: a.whyKailshiansX,
    availabilityHours: a.availabilityHours,
    status: a.status,
    currentStatus: a.status,
    adminNotes: a.adminNotes,
    createdAt: a.createdAt.toISOString(),
  }));

  return <AdminStateLeadsClient initialApplications={formatted} />;
}
