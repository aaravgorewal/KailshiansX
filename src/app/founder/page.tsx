// src/app/founder/page.tsx
// Founder Page: Origin story, philosophy, milestones, and personal message (PRD §16)

import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FounderClient } from "@/components/founder/FounderClient";
import { getFounderPageData } from "@/server/cms/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Founder & Philosophy | KailshiansX",
  description:
    "The origin story, community philosophy, milestones, and foundational message behind KailshiansX by founder Aarav Gorewal.",
  alternates: {
    canonical: "https://kailshiansx.com/founder",
  },
  openGraph: {
    title: "Founder & Philosophy | KailshiansX",
    description:
      "Why KailshiansX was built: the intentional antidote to transactional tech events in India.",
    url: "https://kailshiansx.com/founder",
    siteName: "KailshiansX",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KailshiansX Founder" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Founder & Philosophy | KailshiansX",
    description: "The origin story, philosophy, and milestones behind KailshiansX.",
    images: ["/og-image.png"],
  },
};

export default async function FounderPage() {
  const founderData = await getFounderPageData();

  return (
    <div className="bg-surface-950 min-h-screen pb-28">
      {/* ─── HERO HEADER ─────────────────────────────────────────────────── */}
      <section className="border-surface-800 from-surface-900 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b pt-16 pb-14">
        <div
          className="bg-grid pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
        />

        <div className="container-page relative z-10 text-center">
          <SectionHeader
            badge="Origin & Convictions"
            title="The Vision Behind KailshiansX"
            highlight="KailshiansX"
            description="Why this platform was created, the community philosophy guiding every event, and the long-term compounding journey of India's developer flywheel."
            align="center"
          />

          <div className="text-surface-400 mt-8 flex flex-wrap items-center justify-center gap-6 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-brand-400 size-2 rounded-full" />
              <span>Not a Resume</span>
            </div>
            <span className="text-surface-700">•</span>
            <div>Builder Manifesto</div>
            <span className="text-surface-700">•</span>
            <div>Zero Fluff Ecosystem</div>
          </div>
        </div>
      </section>

      {/* ─── MAIN FOUNDER CONTENT ────────────────────────────────────────── */}
      <main className="container-page mt-12">
        <FounderClient founder={founderData} />
      </main>
    </div>
  );
}
