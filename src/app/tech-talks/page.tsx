import type { Metadata } from "next";
import { Suspense } from "react";

import { getTechTalks } from "@/server/events/tech-talks";
import { TechTalksSearchClient } from "./TechTalksSearchClient";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Tech Talks & Engineering Archive | KailshiansX",
  description:
    "Expert technical sessions and searchable knowledge archive with slides and video recordings.",
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
    <div className="bg-background text-foreground min-h-screen pb-24">
      {/* Hero Header */}
      <section className="border-border bg-background border-b py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              Tech Talks
            </h1>
            <p className="text-muted-foreground text-base">
              Technical deep dives and knowledge archive with slides, code, and recorded sessions.
            </p>

            {/* Plain Stat Row */}
            <div className="flex flex-wrap items-center gap-6 pt-2 sm:gap-10">
              {counts.total > 0 && (
                <div>
                  <span className="text-foreground text-2xl font-bold">{counts.total}</span>
                  <span className="text-muted-foreground ml-2 text-xs">Total Talks</span>
                </div>
              )}
              {counts.upcoming > 0 && (
                <div>
                  <span className="text-foreground text-2xl font-bold">{counts.upcoming}</span>
                  <span className="text-muted-foreground ml-2 text-xs">Upcoming</span>
                </div>
              )}
              {counts.past > 0 && (
                <div>
                  <span className="text-foreground text-2xl font-bold">{counts.past}</span>
                  <span className="text-muted-foreground ml-2 text-xs">Archive Recordings</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Search & Listing Section */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="text-muted-foreground py-20 text-center text-sm">
              Loading tech talks...
            </div>
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
