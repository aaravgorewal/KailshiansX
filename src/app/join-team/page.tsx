// src/app/join-team/page.tsx
// Public Join Team page with role-wise openings across 11 areas & application workflow (PRD §14)

import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { JoinTeamClient } from "@/components/team/JoinTeamClient";

export const metadata: Metadata = {
  title: "Join the Core Team | KailshiansX",
  description:
    "Join the KailshiansX core team. Active openings across Technology, Events, Operations, Community, Partnerships, Sponsorship, Marketing, Design, Content, Social Media, and DevRel.",
  alternates: {
    canonical: `https://kailshiansx.com/join-team`,
  },
  openGraph: {
    title: "Join the Core Team | KailshiansX",
    description:
      "Help build India's premier developer events and community ecosystem. Open volunteer and leadership roles.",
    url: "https://kailshiansx.com/join-team",
    siteName: "KailshiansX",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Join KailshiansX" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the Core Team | KailshiansX",
    description: "Open roles across 11 domains at KailshiansX.",
    images: ["/og-image.png"],
  },
};

export default function JoinTeamPage() {
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
            badge="Core Team Recruitment"
            title="Build the Infrastructure for India's Developers"
            highlight="India's Developers"
            description="We are not just hosting events — we are constructing a durable, developer-owned ecosystem. Join the core team shaping national hackathons, technical masterclasses, and campus chapters."
            align="center"
          />

          {/* Value Props Row */}
          <div className="text-surface-400 mt-8 flex flex-wrap items-center justify-center gap-6 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>11 Functional Domains</span>
            </div>
            <span className="text-surface-700">•</span>
            <div>5-Stage Transparent Pipeline</div>
            <span className="text-surface-700">•</span>
            <div>High-Impact Responsibility</div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT: OPENINGS & APPLICATION FORM ─────────────────────── */}
      <main className="container-page mt-12">
        <JoinTeamClient />
      </main>
    </div>
  );
}
