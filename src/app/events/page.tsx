import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import { EventsFilterBar } from "@/components/events/EventsFilterBar";
import { EventRow } from "@/components/events/EventRow";
import { LoadMoreButton } from "@/components/events/LoadMoreButton";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Events | KailshiansX",
  description:
    "Discover developer meetups, hackathons, workshops, and architecture deep dives across India.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/events`,
  },
  openGraph: {
    title: "Events | KailshiansX",
    description:
      "Discover developer meetups, hackathons, workshops, and architecture deep dives across India.",
    url: `${SITE_CONFIG.url}/events`,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Events | KailshiansX",
    description:
      "Discover developer meetups, hackathons, workshops, and architecture deep dives across India.",
  },
};

interface EventsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PAGE_SIZE = 8;

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const now = new Date();

  const rawType = typeof params.type === "string" ? params.type.toLowerCase() : "all";
  const city = typeof params.city === "string" ? params.city : "all";
  const when = params.when === "past" ? "past" : "upcoming";
  const limit = Math.max(
    PAGE_SIZE,
    parseInt(typeof params.limit === "string" ? params.limit : String(PAGE_SIZE), 10) || PAGE_SIZE
  );

  const TYPE_MAP: Record<string, Prisma.EnumEventTypeFilter["equals"]> = {
    meetup: "MEETUP",
    hackathon: "HACKATHON",
    workshop: "WORKSHOP",
    talk: "TECH_TALK",
  };

  const where: Prisma.EventWhereInput = {
    status: "PUBLISHED",
    deletedAt: null,
  };

  // 1. Timeline filter (upcoming / past)
  if (when === "past") {
    where.startDate = { lt: now };
  } else {
    where.startDate = { gte: now };
  }

  // 2. Type filter
  if (rawType !== "all" && TYPE_MAP[rawType]) {
    where.type = TYPE_MAP[rawType];
  }

  // 3. City filter
  if (city && city !== "all") {
    where.city = {
      name: { equals: city, mode: "insensitive" },
    };
  }

  // Execute database queries in parallel
  const [events, totalCount, cities] = await Promise.all([
    db.event.findMany({
      where,
      orderBy: when === "past" ? { startDate: "desc" } : { startDate: "asc" },
      take: limit,
      include: {
        city: true,
        ticketTypes: true,
        seriesEdition: {
          include: {
            series: { select: { name: true } },
          },
        },
        galleryAlbums: {
          where: { isPublished: true },
          take: 1,
          select: { id: true },
        },
        techTalkResource: {
          select: { videoUrl: true },
        },
      },
    }),
    db.event.count({ where }),
    db.city.findMany({
      where: {
        events: { some: { status: "PUBLISHED", deletedAt: null } },
      },
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const cityNames = cities.map((c) => c.name);

  return (
    <div className="py-12 md:py-20">
      <div className="container-page">
        {/* H1 "Events" (.display, smaller clamp) */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Events
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Developer meetups, hackathons, workshops, and technical gatherings across India.
          </p>
        </div>

        {/* One-line filter bar */}
        <div className="mb-8 sm:mb-12">
          <EventsFilterBar cities={cityNames} />
        </div>

        {/* Results */}
        {events.length > 0 ? (
          <div>
            <div className="divide-border border-border divide-y border-y">
              {events.map((event) => (
                <EventRow
                  key={event.id}
                  id={event.id}
                  slug={event.slug}
                  title={event.title}
                  startDate={event.startDate}
                  city={event.city?.name}
                  seriesName={event.seriesEdition?.series?.name}
                  ticketTypes={event.ticketTypes}
                  isPast={when === "past"}
                  recordingUrl={event.techTalkResource?.videoUrl}
                  galleryAlbumId={event.galleryAlbums?.[0]?.id}
                />
              ))}
            </div>

            {/* Pagination = Load more button */}
            <LoadMoreButton currentLimit={limit} totalCount={totalCount} pageSize={PAGE_SIZE} />
          </div>
        ) : (
          /* Empty state with "Clear filters" */
          <div className="border-border bg-card my-8 rounded-2xl border p-12 text-center">
            <h2 className="text-foreground text-lg font-semibold">
              No events found matching your filters.
            </h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
              Try selecting another type or city, or switch to view upcoming developer gatherings.
            </p>
            <div className="mt-6 flex justify-center">
              <Button asChild variant="secondary" size="md">
                <Link href="/events">Clear filters</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
