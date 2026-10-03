// src/app/core-team/page.tsx
// Public Core Team directory with categorized profile cards (PRD §15)

import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CoreTeamClient } from "@/components/team/CoreTeamClient";
import { getCoreTeamData } from "@/server/cms/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Core Team & Leadership | KailshiansX",
  description:
    "Meet the builders behind KailshiansX across leadership, engineering, community chapters, events, and partnerships.",
  alternates: {
    canonical: "https://kailshiansx.com/core-team",
  },
  openGraph: {
    title: "Core Team & Leadership | KailshiansX",
    description:
      "The engineers, organizers, and community architects powering Kailshians Web Services developer ecosystem.",
    url: "https://kailshiansx.com/core-team",
    siteName: "KailshiansX",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KailshiansX Core Team" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Core Team & Leadership | KailshiansX",
    description: "Meet the team building KailshiansX.",
    images: ["/og-image.png"],
  },
};

export default async function CoreTeamPage() {
  const members = await getCoreTeamData(false);

  const serializedMembers = members.map((m) => ({
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
  }));

  return (
    <div className="bg-surface-950 min-h-screen pb-28">
      {/* ─── HERO HEADER BANNER ────────────────────────────────────────────── */}
      <section className="border-surface-800 from-surface-900 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b pt-16 pb-14">
        <div
          className="bg-grid pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
        />

        <div className="container-page relative z-10 text-center">
          <SectionHeader
            badge="Ecosystem Leadership"
            title="The Architects Behind KailshiansX"
            highlight="KailshiansX"
            description="A distributed team of engineers, community leaders, and event producers united by a single vision: making world-class developer experiences accessible across every tier of India."
            align="center"
          />

          {/* Quick Metrics */}
          <div className="text-surface-400 mt-8 flex flex-wrap items-center justify-center gap-6 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-brand-400 size-2 rounded-full" />
              <span>7 Domain Divisions</span>
            </div>
            <span className="text-surface-700">•</span>
            <div>100% Builder Driven</div>
            <span className="text-surface-700">•</span>
            <div>Zero Fluff Culture</div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main className="container-page mt-12">
        <CoreTeamClient members={serializedMembers} />
      </main>
    </div>
  );
}
