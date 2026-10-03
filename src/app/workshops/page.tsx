import type { Metadata } from "next";
import { Suspense } from "react";
import { Terminal } from "lucide-react";

import { getWorkshops } from "@/server/events/workshops";
import { WorkshopsClient } from "./WorkshopsClient";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Workshops | Hands-On Engineering Masterclasses | KailshiansX",
  description:
    "Intensive technical workshops across MERN, Backend, System Design, DevOps, Cloud, AI, Blockchain, and Open Source. Lead by engineers from Google, Microsoft, and top startups.",
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
    <div className="bg-surface-950 min-h-screen pb-28">
      {/* Hero Header */}
      <section className="border-surface-800/80 from-surface-900/80 via-surface-950 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b pt-16 pb-12 sm:pt-24 sm:pb-16">
        {/* Glow Effects */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "#3d61fc" }}
        />

        <div className="container-page relative z-10 mx-auto max-w-4xl space-y-6 px-4 text-center">
          <div className="border-brand-500/30 bg-brand-500/10 text-brand-300 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
            <Terminal className="size-3.5" />
            <span>PRD §6 Technical Curriculum</span>
          </div>

          <h1 className="text-surface-50 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Hands-On Technical Workshops.{" "}
            <span className="from-brand-400 to-accent-400 bg-gradient-to-r via-indigo-300 bg-clip-text text-transparent">
              Built with Real Code.
            </span>
          </h1>

          <p className="text-surface-300 mx-auto max-w-2xl text-sm leading-relaxed sm:text-base">
            Move from passive tutorials to production engineering. Full-day deep-dives on MERN,
            Distributed Systems, AI Agents, DevOps, and Cloud led by practicing Tier-1 developers.
          </p>

          {/* Quick Metrics */}
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 pt-6 sm:grid-cols-4">
            <div className="border-surface-800 bg-surface-900/50 rounded-2xl border p-3.5 backdrop-blur-xs">
              <span className="text-surface-100 block text-xl font-bold sm:text-2xl">100%</span>
              <span className="text-surface-400 text-[11px] tracking-wider uppercase">
                Hands-on Labs
              </span>
            </div>
            <div className="border-surface-800 bg-surface-900/50 rounded-2xl border p-3.5 backdrop-blur-xs">
              <span className="text-brand-400 block text-xl font-bold sm:text-2xl">9 Tracks</span>
              <span className="text-surface-400 text-[11px] tracking-wider uppercase">
                Engineering Disciplines
              </span>
            </div>
            <div className="border-surface-800 bg-surface-900/50 rounded-2xl border p-3.5 backdrop-blur-xs">
              <span className="block text-xl font-bold text-emerald-400 sm:text-2xl">
                Campus Ready
              </span>
              <span className="text-surface-400 text-[11px] tracking-wider uppercase">
                Pan-India Colleges
              </span>
            </div>
            <div className="border-surface-800 bg-surface-900/50 rounded-2xl border p-3.5 backdrop-blur-xs">
              <span className="text-surface-100 block text-xl font-bold sm:text-2xl">
                {counts.total}
              </span>
              <span className="text-surface-400 text-[11px] tracking-wider uppercase">
                Total Bootcamps
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container-page px-4 pt-10">
        <Suspense
          fallback={
            <div className="text-surface-500 py-20 text-center text-sm">Loading workshops...</div>
          }
        >
          <WorkshopsClient
            workshops={serializedWorkshops}
            counts={counts}
            initialTab={tab}
            initialCategory={category}
          />
        </Suspense>
      </section>
    </div>
  );
}
