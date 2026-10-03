import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { Search } from "lucide-react";

import { db } from "@/lib/db";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard, type EventType, type EventStatus } from "@/components/ui/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { EventsFilterBar } from "@/components/events/EventsFilterBar";
import { EventsPagination } from "@/components/events/EventsPagination";

export const revalidate = 60;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Developer Events, Hackathons & Tech Talks | KailshiansX",
  description:
    "Discover hackathons, engineering meetups, hands-on workshops, and architecture deep dives across India. Filter by city, format, or date.",
  keywords: [
    "developer events India",
    "hackathons Delhi Jaipur",
    "tech meetups",
    "workshops",
    "systems engineering talks",
    "PadharoX",
    "NirmanX",
    "KailshiansX",
  ],
  alternates: {
    canonical: `${APP_URL}/events`,
  },
  openGraph: {
    title: "Developer Events, Hackathons & Tech Talks | KailshiansX",
    description:
      "Verified developer gatherings across India. From intensive 36h hackathons to deep-dive architecture talks.",
    url: `${APP_URL}/events`,
    siteName: "KailshiansX",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Events & Hackathons | KailshiansX",
    description: "Browse verified developer gatherings, build-a-thons, and workshops across India.",
    images: ["/og-image.png"],
  },
};

interface EventsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const now = new Date();

  const q = typeof params.q === "string" ? params.q.trim() : "";
  const timeline =
    params.timeline === "past" || params.timeline === "all" ? params.timeline : "upcoming";
  const type = typeof params.type === "string" ? params.type : "ALL";
  const city = typeof params.city === "string" ? params.city : "ALL";
  const page = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1", 10) || 1);
  const pageSize = 8;

  // Build Prisma Where Clause
  const where: Prisma.EventWhereInput = {
    status: "PUBLISHED",
    deletedAt: null,
  };

  // Timeline Filter
  if (timeline === "upcoming") {
    where.startDate = { gte: now };
  } else if (timeline === "past") {
    where.startDate = { lt: now };
  }

  // Type Filter
  if (type !== "ALL") {
    where.type = type as Prisma.EnumEventTypeFilter["equals"];
  }

  // City Filter
  if (city !== "ALL") {
    where.city = {
      name: { equals: city, mode: "insensitive" },
    };
  }

  // Search Filter
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { overview: { contains: q, mode: "insensitive" } },
      { venue: { contains: q, mode: "insensitive" } },
      { city: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  // Run Queries in Parallel
  const [events, totalResults, upcomingCount, pastCount, citiesRaw] = await Promise.all([
    db.event.findMany({
      where,
      orderBy: timeline === "past" ? { startDate: "desc" } : { startDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        city: true,
        ticketTypes: true,
        _count: {
          select: { registrations: true, speakers: true },
        },
      },
    }),
    db.event.count({ where }),
    db.event.count({
      where: { status: "PUBLISHED", deletedAt: null, startDate: { gte: now } },
    }),
    db.event.count({
      where: { status: "PUBLISHED", deletedAt: null, startDate: { lt: now } },
    }),
    db.city.findMany({
      where: {
        events: { some: { status: "PUBLISHED", deletedAt: null } },
      },
      include: {
        _count: {
          select: {
            events: { where: { status: "PUBLISHED", deletedAt: null } },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalResults / pageSize);

  const cityOptions = citiesRaw.map((c) => ({
    name: c.name,
    count: c._count.events,
  }));

  return (
    <div className="bg-surface-950 min-h-screen pb-24">
      {/* Hero Header Banner */}
      <section className="from-surface-900 to-surface-950 border-surface-800 relative overflow-hidden border-b bg-gradient-to-b pt-16 pb-12">
        <div
          className="bg-grid pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
        />

        <div className="container-page relative z-10 text-center">
          <SectionHeader
            badge="Verified Gathering Schedule"
            title="Discover KailshiansX Gatherings"
            highlight="KailshiansX Gatherings"
            description="From flagship 36-hour hackathons and citywide summits to hands-on distributed systems masterclasses. Find your next stage."
            align="center"
          />
        </div>
      </section>

      {/* Main Events Catalog Area */}
      <main className="container-page pt-10">
        {/* Dynamic Interactive Filter Bar */}
        <div className="border-surface-800 bg-surface-900/50 mb-10 rounded-2xl border p-6 shadow-xl backdrop-blur-sm">
          <EventsFilterBar
            initialSearch={q}
            initialTimeline={timeline}
            initialType={type}
            initialCity={city}
            cities={cityOptions}
            totalResults={totalResults}
            upcomingCount={upcomingCount}
            pastCount={pastCount}
          />
        </div>

        {/* Events Grid or Empty State */}
        {events.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {events.map((event) => {
                const isFree =
                  event.ticketTypes.length === 0 ||
                  event.ticketTypes.some((t) => Number(t.price) === 0);
                const lowestPrice =
                  event.ticketTypes.length > 0
                    ? Math.min(...event.ticketTypes.map((t) => Number(t.price)))
                    : 0;

                const tags = [
                  event.type === "HACKATHON"
                    ? "Hackathon"
                    : event.type === "WORKSHOP"
                      ? "Workshop"
                      : event.type === "TECH_TALK"
                        ? "Tech Talk"
                        : "Meetup",
                  event.attendanceMode === "IN_PERSON" ? "In-Person" : "Virtual",
                ];

                return (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    slug={event.slug}
                    type={event.type as EventType}
                    status={event.status as EventStatus}
                    startDate={event.startDate}
                    endDate={event.endDate || undefined}
                    venue={event.venue || undefined}
                    city={event.city?.name || undefined}
                    coverUrl={event.coverImage || undefined}
                    isFree={isFree}
                    price={isFree ? 0 : lowestPrice}
                    attendeeCount={event._count.registrations}
                    speakerCount={event._count.speakers}
                    tags={tags}
                  />
                );
              })}
            </div>

            {/* Server-side Pagination */}
            {totalPages > 1 && (
              <div className="border-surface-800/80 border-t pt-6">
                <EventsPagination currentPage={page} totalPages={totalPages} />
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<Search className="text-surface-500 size-10" />}
            title="No Gatherings Found"
            description={
              q || type !== "ALL" || city !== "ALL" || timeline !== "upcoming"
                ? "No events match your current filter selection. Try resetting your search or exploring past archives."
                : "No upcoming events scheduled right now. Check back soon for the next cohort announcement!"
            }
            action={
              q || type !== "ALL" || city !== "ALL" || timeline !== "upcoming"
                ? {
                    label: "Reset All Filters",
                    href: "/events",
                  }
                : {
                    label: "View Past Archives",
                    href: "/events?timeline=past",
                  }
            }
          />
        )}
      </main>
    </div>
  );
}
