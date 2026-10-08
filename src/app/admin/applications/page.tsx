// src/app/admin/applications/page.tsx
// Unified inbox for campus-lead, state-lead, team, partner submissions with type & status filtering.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import {
  AdminApplicationsClient,
  type UnifiedApplicationItem,
} from "@/components/admin/AdminApplicationsClient";

export const metadata: Metadata = {
  title: "Applications Inbox | KailshiansX Admin",
};

export default async function AdminApplicationsPage() {
  await requireAdmin();

  const [campusLeads, stateLeads, teamApps, collabLeads] = await Promise.all([
    db.campusLeadApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.stateLeadApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.teamApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.collaborationLead.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const items: UnifiedApplicationItem[] = [
    ...campusLeads.map((c) => ({
      id: c.id,
      type: "CAMPUS_LEAD" as const,
      name: c.name,
      email: c.email,
      phone: c.phone,
      details: `${c.college}${c.city ? ` (${c.city})` : ""}`,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      adminNotes: c.adminNotes,
      specifics: {
        College: c.college,
        City: c.city,
        "Course Year": c.courseYear,
        LinkedIn: c.linkedin,
        "Why KailshiansX": c.whyKailshiansX,
        Experience: c.experience,
        "Community Involvement": c.communityInvolvement,
      },
    })),
    ...stateLeads.map((s) => ({
      id: s.id,
      type: "STATE_LEAD" as const,
      name: s.name,
      email: s.email,
      phone: s.phone,
      details: `State: ${s.state}${s.citiesCovered ? ` • Cities: ${s.citiesCovered}` : ""}`,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      adminNotes: s.adminNotes,
      specifics: {
        State: s.state,
        City: s.city,
        "Cities Covered": s.citiesCovered,
        "Current Role": s.currentRole,
        LinkedIn: s.linkedin,
        Experience: s.experience,
        "Leadership Evidence": s.leadershipEvidence,
        "Community Vision": s.communityVision,
        "Why KailshiansX": s.whyKailshiansX,
      },
    })),
    ...teamApps.map((t) => ({
      id: t.id,
      type: "TEAM" as const,
      name: t.name,
      email: t.email,
      phone: t.phone,
      details: `Area: ${t.area}${t.roleApplied ? ` • Role: ${t.roleApplied}` : ""}`,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      adminNotes: t.adminNotes,
      specifics: {
        Area: t.area,
        "Role Applied": t.roleApplied,
        LinkedIn: t.linkedin,
        Portfolio: t.portfolio,
        Resume: t.resumeUrl,
        Experience: t.experience,
        Motivation: t.motivation,
      },
    })),
    ...collabLeads.map((collab) => ({
      id: collab.id,
      type: "PARTNER" as const,
      name: collab.contactPerson,
      email: collab.email,
      phone: collab.phone,
      details: `Org: ${collab.organisation} • Type: ${collab.type}`,
      status: collab.stage,
      createdAt: collab.createdAt.toISOString(),
      adminNotes: collab.adminNotes,
      specifics: {
        Organisation: collab.organisation,
        "Collaboration Type": collab.type,
        "Contact Person": collab.contactPerson,
        Website: collab.website,
        City: collab.cityName,
        "Proposed Event": collab.proposedEvent,
        "Resources Offered": collab.resourcesOffered,
        Message: collab.message,
      },
    })),
  ];

  // Sort unified list descending by createdAt
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return <AdminApplicationsClient initialItems={items} />;
}
