import type { Metadata } from "next";
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
    <div className="bg-background text-foreground min-h-screen pb-20">
      {/* ─── Hero Header Banner ────────────────────────────────────────────── */}
      <section className="border-border border-b pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Core Team Recruitment
          </p>

          <h1 className="text-foreground mt-3 max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">
            Build the Infrastructure for India&apos;s Developers
          </h1>

          <p className="text-muted-foreground mt-4 max-w-2xl text-base">
            We are not just hosting events — we are constructing a durable, developer-owned
            ecosystem. Join the core team shaping national hackathons, technical masterclasses, and
            campus chapters.
          </p>

          {/* Value Props Row */}
          <div className="text-muted-foreground mt-8 flex flex-wrap items-center gap-6 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-primary size-2 rounded-full" />
              <span>11 Functional Domains</span>
            </div>
            <span>•</span>
            <div>5-Stage Transparent Pipeline</div>
            <span>•</span>
            <div>High-Impact Responsibility</div>
          </div>
        </div>
      </section>

      {/* ─── Main Content: Openings & Application Form ─────────────────────── */}
      <main className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        <JoinTeamClient />
      </main>
    </div>
  );
}
