// src/app/founder/page.tsx
// Founder Page: Origin story, philosophy, milestones, and personal message

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
    <div className="bg-background min-h-screen pb-24">
      {/* ─── HEADER BANNER ─────────────────────────────────────────────────── */}
      <section className="border-border border-b py-12">
        <div className="container-page">
          <SectionHeader
            title="Founder & Philosophy"
            description="The vision, philosophy, and milestones behind KailshiansX."
          />

          <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-6 font-mono text-xs">
            <div>Builder Manifesto</div>
            <span>•</span>
            <div>Zero Fluff Ecosystem</div>
            <span>•</span>
            <div>Autonomous Flywheel</div>
          </div>
        </div>
      </section>

      {/* ─── MAIN FOUNDER CONTENT ────────────────────────────────────────── */}
      <main className="container-page mt-10">
        <FounderClient founder={founderData} />
      </main>
    </div>
  );
}
