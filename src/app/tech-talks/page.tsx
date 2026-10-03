import type { Metadata } from "next";
import { Suspense } from "react";
import { Radio } from "lucide-react";

import { getTechTalks } from "@/server/events/tech-talks";
import { TechTalksSearchClient } from "./TechTalksSearchClient";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Tech Talks & Engineering Archive | KailshiansX",
  description:
    "Expert technical sessions and searchable knowledge archive. Deep-dives on Distributed Systems, AI, Postgres internals, Rust, and Next.js with slides and video recordings.",
  alternates: {
    canonical: `${APP_URL}/tech-talks`,
  },
  openGraph: {
    title: "KailshiansX Tech Talks — Engineering Knowledge Archive",
    description:
      "Expert tech talks from leading engineers. Watch past recordings, download slides, and review key takeaways.",
    url: `${APP_URL}/tech-talks`,
    siteName: "KailshiansX",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KailshiansX Tech Talks — Engineering Knowledge Archive",
    description: "Expert tech talks from leading engineers with slides and video recordings.",
    images: ["/og-image.png"],
  },
};

interface TechTalksPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TechTalksPage({ searchParams }: TechTalksPageProps) {
  const sParams = await searchParams;

  const tab =
    sParams.tab === "upcoming" || sParams.tab === "past"
      ? (sParams.tab as "upcoming" | "past")
      : "all";
  const query = typeof sParams.q === "string" ? sParams.q : "";

  const { talks, counts } = await getTechTalks({
    tab,
    query,
  });

  const serializedTalks = talks.map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    overview: t.overview,
    category: t.category,
    attendanceMode: t.attendanceMode,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate ? t.endDate.toISOString() : null,
    venue: t.venue,
    venueAddress: t.venueAddress,
    city: t.city ? { name: t.city.name, state: t.city.state } : null,
    speakers: t.speakers.map((s) => ({
      speaker: {
        id: s.speaker.id,
        name: s.speaker.name,
        designation: s.speaker.designation,
        organisation: s.speaker.organisation,
        avatar: s.speaker.photo,
      },
    })),
    partners: t.partners.map((p) => ({
      partner: {
        id: p.partner.id,
        name: p.partner.name,
        category: p.partner.category,
        logo: p.partner.logo,
      },
    })),
    techTalkResource: t.techTalkResource
      ? {
          id: t.techTalkResource.id,
          slideUrl: t.techTalkResource.slideUrl,
          videoUrl: t.techTalkResource.videoUrl,
          repoUrl: t.techTalkResource.repoUrl,
          keyTakeaways: t.techTalkResource.keyTakeaways,
          tags: t.techTalkResource.tags,
        }
      : null,
  }));

  return (
    <div className="bg-surface-950 min-h-screen pb-28">
      {/* Hero Header */}
      <section className="border-surface-800/80 from-surface-900/80 via-surface-950 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "#4f46e5" }}
        />

        <div className="container-page relative z-10 mx-auto max-w-4xl space-y-6 px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md">
            <Radio className="size-3.5 animate-pulse text-emerald-400" />
            <span>PRD §7 Expert Knowledge Archive</span>
          </div>

          <h1 className="text-surface-50 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Tech Talks &amp;{" "}
            <span className="via-brand-300 to-accent-400 bg-gradient-to-r from-indigo-400 bg-clip-text text-transparent">
              Searchable Knowledge Archive.
            </span>
          </h1>

          <p className="text-surface-300 mx-auto max-w-2xl text-sm leading-relaxed sm:text-base">
            Focused, zero-fluff technical deep dives hosted across premier Indian engineering
            colleges. Access video recordings, slide decks, and code repos for past talks.
          </p>

          {/* Quick Metrics */}
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 pt-6 sm:grid-cols-4">
            <div className="border-surface-800 bg-surface-900/50 rounded-2xl border p-3.5 backdrop-blur-xs">
              <span className="text-surface-100 block text-xl font-bold sm:text-2xl">
                {counts.total}
              </span>
              <span className="text-surface-400 text-[11px] tracking-wider uppercase">
                Expert Talks
              </span>
            </div>
            <div className="border-surface-800 bg-surface-900/50 rounded-2xl border p-3.5 backdrop-blur-xs">
              <span className="block text-xl font-bold text-indigo-400 sm:text-2xl">
                Postgres FTS
              </span>
              <span className="text-surface-400 text-[11px] tracking-wider uppercase">
                Searchable Archive
              </span>
            </div>
            <div className="border-surface-800 bg-surface-900/50 rounded-2xl border p-3.5 backdrop-blur-xs">
              <span className="block text-xl font-bold text-emerald-400 sm:text-2xl">
                Free Open
              </span>
              <span className="text-surface-400 text-[11px] tracking-wider uppercase">
                Community Access
              </span>
            </div>
            <div className="border-surface-800 bg-surface-900/50 rounded-2xl border p-3.5 backdrop-blur-xs">
              <span className="text-surface-100 block text-xl font-bold sm:text-2xl">
                {counts.past}
              </span>
              <span className="text-surface-400 text-[11px] tracking-wider uppercase">
                Resource Decks
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Search & Listing Section */}
      <section className="container-page px-4 pt-10">
        <Suspense
          fallback={
            <div className="text-surface-500 py-20 text-center text-sm">Loading tech talks...</div>
          }
        >
          <TechTalksSearchClient
            talks={serializedTalks}
            counts={counts}
            initialTab={tab}
            initialQuery={query}
          />
        </Suspense>
      </section>
    </div>
  );
}
