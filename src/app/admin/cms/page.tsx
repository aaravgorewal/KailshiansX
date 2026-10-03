// src/app/admin/cms/page.tsx
// Comprehensive Admin CMS for Team Applications, Core Team, Founder & Who We Are

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sliders, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/server/auth/require-role";
import { getTeamApplications } from "@/server/applications/team";
import { getCoreTeamData, getFounderPageData, getWhoWeArePageData } from "@/server/cms/content";
import { AdminCmsClient } from "@/components/admin/AdminCmsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Content & Team CMS | KailshiansX Admin",
  description:
    "Manage recruitment pipeline, core team profiles, founder story, and Who We Are content.",
};

interface AdminCmsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminCmsPage({ searchParams }: AdminCmsPageProps) {
  await requireAdmin();
  const resolvedParams = await searchParams;
  const tab = resolvedParams.tab as
    "applications" | "core-team" | "founder" | "who-we-are" | undefined;

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

  return (
    <div className="bg-surface-950 min-h-screen pb-28">
      {/* ─── TOP HEADER ─────────────────────────────────────────────────── */}
      <div className="border-surface-800 bg-surface-900/60 border-b py-4">
        <div className="container-page flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="border-surface-700 bg-surface-800 text-surface-300 hover:text-surface-100 inline-flex size-8 items-center justify-center rounded-lg border transition-colors"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="text-brand-400 size-5" />
                <h1 className="text-surface-50 text-lg font-bold">
                  Ecosystem Content &amp; Team CMS
                </h1>
              </div>
              <p className="text-surface-400 text-xs">
                Direct editing for recruitment applications, core profiles, founder manifesto, and
                KWS charter.
              </p>
            </div>
          </div>

          <div className="border-surface-800 bg-surface-950 text-surface-400 flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs">
            <ShieldCheck className="text-brand-400 size-4" />
            <span>Admin Clearance Verified</span>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ───────────────────────────────────────────────── */}
      <div className="container-page pt-8">
        <AdminCmsClient
          initialApplications={serializedApps}
          initialMembers={serializedMembers}
          initialFounder={founderData}
          initialWhoWeAre={whoWeAreData}
          defaultTab={
            tab && ["applications", "core-team", "founder", "who-we-are"].includes(tab)
              ? tab
              : "applications"
          }
        />
      </div>
    </div>
  );
}
