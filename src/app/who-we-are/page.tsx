// src/app/who-we-are/page.tsx
// Who We Are: Mission, Vision, Values, Pillars, and Kailshians Web Services charter (PRD §17)

import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WhoWeAreClient } from "@/components/about/WhoWeAreClient";
import { getWhoWeArePageData } from "@/server/cms/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Who We Are | KailshiansX",
  description:
    "KailshiansX is the developer events and community initiative of Kailshians Web Services. Discover our mission, vision, constitutional values, and platform pillars.",
  alternates: {
    canonical: "https://kailshiansx.com/who-we-are",
  },
  openGraph: {
    title: "Who We Are | KailshiansX",
    description:
      "The developer events and community initiative of Kailshians Web Services powering hackathons, regional chapters, and engineering masterclasses.",
    url: "https://kailshiansx.com/who-we-are",
    siteName: "KailshiansX",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "About KailshiansX" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Who We Are | KailshiansX",
    description:
      "Developer events & community initiative of Kailshians Web Services. Mission, vision, and values.",
    images: ["/og-image.png"],
  },
};

export default async function WhoWeArePage() {
  const content = await getWhoWeArePageData();

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
            badge={content.badge}
            title={content.title}
            highlight="KailshiansX"
            description={content.introDescription}
            align="center"
          />

          <div className="text-surface-400 mt-8 flex flex-wrap items-center justify-center gap-6 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-brand-400 size-2 rounded-full" />
              <span>Kailshians Web Services Wing</span>
            </div>
            <span className="text-surface-700">•</span>
            <div>Zero Commercial Fluff</div>
            <span className="text-surface-700">•</span>
            <div>Autonomous Flywheel</div>
          </div>
        </div>
      </section>

      {/* ─── MAIN WHO WE ARE CONTENT ─────────────────────────────────────── */}
      <main className="container-page mt-12">
        <WhoWeAreClient content={content} />
      </main>
    </div>
  );
}
