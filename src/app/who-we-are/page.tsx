// src/app/who-we-are/page.tsx
// Who We Are: Mission, Vision, Values, Pillars, and Kailshians Web Services charter

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
    <div className="bg-background min-h-screen pb-24">
      {/* ─── HEADER BANNER ─────────────────────────────────────────────────── */}
      <section className="border-border border-b py-12">
        <div className="container-page">
          <SectionHeader title={content.title} description={content.introDescription} />

          <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-6 font-mono text-xs">
            <div>Kailshians Web Services Wing</div>
            <span>•</span>
            <div>Zero Commercial Fluff</div>
            <span>•</span>
            <div>Autonomous Flywheel</div>
          </div>
        </div>
      </section>

      {/* ─── MAIN WHO WE ARE CONTENT ─────────────────────────────────────── */}
      <main className="container-page mt-10">
        <WhoWeAreClient content={content} />
      </main>
    </div>
  );
}
