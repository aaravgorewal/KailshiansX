import type { Metadata } from "next";
import { Suspense } from "react";

import { getWorkshops } from "@/server/events/workshops";
import { WorkshopsClient } from "./WorkshopsClient";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Technical Workshops & Masterclasses | KailshiansX",
  description:
    "Intensive hands-on engineering workshops across MERN, Backend, System Design, DevOps, Cloud, AI, and Open Source led by practicing engineers.",
  alternates: {
    canonical: `${APP_URL}/workshops`,
  },
  openGraph: {
    title: "KailshiansX Workshops — Learn by Building",
    description:
      "Deep-dive hands-on boot camps across India. Host a workshop or request one at your college campus.",
    url: `${APP_URL}/workshops`,
    siteName: "KailshiansX",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KailshiansX Workshops — Hands-On Engineering",
    description: "Deep-dive hands-on boot camps across India.",
    images: ["/og-image.png"],
  },
};

interface WorkshopsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function WorkshopsPage({ searchParams }: WorkshopsPageProps) {
  const sParams = await searchParams;

  const tab = sParams.tab === "past" ? "past" : "upcoming";
  const category = typeof sParams.category === "string" ? sParams.category : "ALL";

  const { workshops, counts } = await getWorkshops({
    tab,
    category,
  });

  const serializedWorkshops = workshops.map((w) => ({
    id: w.id,
    slug: w.slug,
    title: w.title,
    overview: w.overview,
    category: w.category,
    attendanceMode: w.attendanceMode,
    startDate: w.startDate.toISOString(),
    endDate: w.endDate ? w.endDate.toISOString() : null,
    venue: w.venue,
    venueAddress: w.venueAddress,
    city: w.city ? { name: w.city.name, state: w.city.state } : null,
    speakers: w.speakers.map((s) => ({
      speaker: {
        id: s.speaker.id,
        name: s.speaker.name,
        designation: s.speaker.designation,
        organisation: s.speaker.organisation,
        avatar: s.speaker.photo,
      },
    })),
    ticketTypes: w.ticketTypes.map((t) => ({
      id: t.id,
      name: t.name,
      price: Number(t.price),
      quota: t.quota,
    })),
  }));

  return (
    <div className="bg-background min-h-screen pb-28">
      {/* Simple Left-Aligned Hero Block */}
      <section className="border-border bg-card/40 border-b py-12 sm:py-16">
        <div className="container-page">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Hands-On Technical Workshops
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
              Move from passive tutorials to production engineering with intensive, code-first
              masterclasses led by experienced practitioners.
            </p>

            {/* Plain Stat Row */}
            <div className="border-border flex flex-wrap items-center gap-6 border-t pt-4">
              {counts.total > 0 && (
                <div>
                  <span className="text-foreground text-2xl font-bold">{counts.total}</span>
                  <span className="text-muted-foreground ml-2 text-xs tracking-wider uppercase">
                    Total Workshops
                  </span>
                </div>
              )}
              {counts.upcoming > 0 && (
                <div>
                  <span className="text-foreground text-2xl font-bold">{counts.upcoming}</span>
                  <span className="text-muted-foreground ml-2 text-xs tracking-wider uppercase">
                    Upcoming
                  </span>
                </div>
              )}
              {counts.past > 0 && (
                <div>
                  <span className="text-foreground text-2xl font-bold">{counts.past}</span>
                  <span className="text-muted-foreground ml-2 text-xs tracking-wider uppercase">
                    Past Archive
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container-page pt-10">
        <Suspense
          fallback={
            <div className="text-muted-foreground py-12 text-center text-sm">
              Loading workshops...
            </div>
          }
        >
          <WorkshopsClient
            workshops={serializedWorkshops}
            counts={counts}
            initialTab={tab}
            initialCategory={category}
          />
        </Suspense>
      </main>
    </div>
  );
}
