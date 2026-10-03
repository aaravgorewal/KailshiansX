// src/app/admin/team-applications/page.tsx
// Dedicated Team Applications Recruitment Pipeline Page

import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth/require-role";
import { getTeamApplications } from "@/server/applications/team";
import { getCoreTeamData, getFounderPageData, getWhoWeArePageData } from "@/server/cms/content";
import { AdminCmsClient } from "@/components/admin/AdminCmsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team Applications Pipeline | KailshiansX Admin",
};

export default async function AdminTeamApplicationsPage() {
  await requireAdmin();

  const [applicationsData, membersData, founderData, whoWeAreData] = await Promise.all([
    getTeamApplications({}),
    getCoreTeamData(true),
    getFounderPageData(),
    getWhoWeArePageData(),
  ]);

  const serializedApps = applicationsData.applications.map((app) => ({
    id: app.id,
    name: app.name,
    email: app.email,
    phone: app.phone,
    area: app.area,
    roleApplied: app.roleApplied,
    linkedin: app.linkedin,
    portfolio: app.portfolio,
    resumeUrl: app.resumeUrl,
    experience: app.experience,
    motivation: app.motivation,
    status: app.status,
    adminNotes: app.adminNotes,
    createdAt: app.createdAt.toISOString(),
  }));

  const serializedMembers = membersData.map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    role: m.role,
    category: m.category,
    bio: m.bio,
    photo: m.photo,
    linkedin: m.linkedin,
    twitter: m.twitter,
    github: m.github,
    website: m.website,
    email: m.email,
    sortOrder: m.sortOrder,
    isActive: m.isActive,
  }));

  const serializedFounder = {
    founderName: founderData.founderName,
    tagline: founderData.tagline ?? "",
    message: founderData.message ?? "",
    philosophy: founderData.philosophy ?? "",
    photo: founderData.photo ?? null,
    linkedin: founderData.linkedin ?? null,
    twitter: founderData.twitter ?? null,
    milestones: founderData.milestones ?? [],
  };

  return (
    <AdminCmsClient
      initialApplications={serializedApps}
      initialMembers={serializedMembers}
      initialFounder={serializedFounder}
      initialWhoWeAre={whoWeAreData}
      defaultTab="applications"
    />
  );
}
