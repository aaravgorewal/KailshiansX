// src/app/core-team/page.tsx
// Public Core Team directory with categorized profile cards

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
    <div className="bg-background min-h-screen pb-24">
      {/* ─── HEADER BANNER ─────────────────────────────────────────────────── */}
      <section className="border-border border-b py-12">
        <div className="container-page">
          <SectionHeader
            title="Core Team & Leadership"
            description="The engineers, community organizers, and ecosystem architects building KailshiansX across India."
          />

          {/* Quick Metrics */}
          <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-6 font-mono text-xs">
            <div>
              <strong className="text-foreground font-semibold">{members.length}</strong> Active
              Members
            </div>
            <span>•</span>
            <div>100% Builder Driven</div>
            <span>•</span>
            <div>Zero Fluff Culture</div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main className="container-page mt-10">
        <CoreTeamClient members={serializedMembers} />
      </main>
    </div>
  );
}
