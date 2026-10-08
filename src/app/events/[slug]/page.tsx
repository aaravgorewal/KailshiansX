import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import { formatDate, formatTime, formatTimeRange } from "@/lib/format-date";

export const revalidate = 60;

export async function generateStaticParams() {
  const events = await db.event.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    select: { slug: true },
  });
  return events.map((e) => ({ slug: e.slug }));
}

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

// ─── Dynamic SEO Metadata ─────────────────────────────────────────────────────
export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await db.event.findUnique({
    where: { slug },
    include: { city: true },
  });

  if (!event || event.status === "DRAFT" || event.deletedAt) {
    return {
      title: "Event Not Found | KailshiansX",
    };
  }

  const title = `${event.title} | KailshiansX`;
  const description =
    event.overview ||
    `Join ${event.title} organized by Kailshians Web Services developer community.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_CONFIG.url}/events/${event.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_CONFIG.url}/events/${event.slug}`,
      siteName: SITE_CONFIG.name,
      type: "website",
      images: [
        {
          url: `${SITE_CONFIG.url}/events/${event.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_CONFIG.url}/events/${event.slug}/opengraph-image`],
    },
  };
}

// ─── Event Detail Page ────────────────────────────────────────────────────────
export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const now = new Date();

  const event = await db.event.findUnique({
    where: { slug },
    include: {
      city: true,
      ticketTypes: {
        orderBy: [{ price: "asc" }, { sortOrder: "asc" }],
      },
      scheduleItems: {
        orderBy: [{ sortOrder: "asc" }, { startTime: "asc" }],
      },
      speakers: {
        include: { speaker: true },
        orderBy: { sortOrder: "asc" },
      },
      faqs: {
        orderBy: { sortOrder: "asc" },
      },
      galleryAlbums: {
        where: { isPublished: true },
        take: 1,
        select: { id: true },
      },
      _count: {
        select: { registrations: true },
      },
    },
  });

  if (!event || event.status === "DRAFT" || event.deletedAt) {
    notFound();
  }

  const isPast = event.startDate < now;

  // Format meta line via src/lib/format-date.ts
  const dateStr = formatDate(event.startDate);
  const timeStr = formatTimeRange(event.startDate, event.endDate);
  const metaParts = [dateStr, timeStr, event.venue, event.city?.name].filter(Boolean);
  const metaLine = metaParts.join(" · ");

  // Calculate pricing
  const isFree =
    event.ticketTypes.length === 0 ||
    event.ticketTypes.some((t) => t.isFree || Number(t.price) === 0);

  const minPrice =
    event.ticketTypes.length > 0 ? Math.min(...event.ticketTypes.map((t) => Number(t.price))) : 0;

  const priceLabel = isFree ? "Free" : `₹${minPrice.toLocaleString("en-IN")}`;

  // Calculate seats left (only low if <= 25 and > 0)
  const totalSeats =
    event.ticketTypes.reduce((acc, t) => acc + (t.quota || 0), 0) || event.maxCapacity || 0;
  const bookedSeats = event._count.registrations;
  const seatsLeft = totalSeats > 0 ? Math.max(0, totalSeats - bookedSeats) : null;
  const isSeatsLow = seatsLeft !== null && seatsLeft > 0 && seatsLeft <= 25;

  // Gallery album for past events
  const galleryAlbumId = event.galleryAlbums?.[0]?.id || null;

  // JSON-LD Schema
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.startDate.toISOString(),
    endDate: (event.endDate || event.startDate).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      event.attendanceMode === "VIRTUAL"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : event.attendanceMode === "HYBRID"
          ? "https://schema.org/MixedEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue || "Venue",
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city?.name || "India",
        addressCountry: "IN",
      },
    },
    image: event.coverImage ? [event.coverImage] : undefined,
    description: event.overview || event.title,
    offers: {
      "@type": "Offer",
      price: isFree ? 0 : minPrice,
      priceCurrency: "INR",
      availability: isPast
        ? "https://schema.org/Discontinued"
        : seatsLeft === 0
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      url: `${SITE_CONFIG.url}/events/${event.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      <article className="py-12 pb-28 md:py-20 lg:pb-20">
        <div className="container-page">
          {/* ─── Hero ────────────────────────────────────────────────────────── */}
          <header className="max-w-4xl">
            {/* Title (.display smaller) */}
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {event.title}
            </h1>

            {/* Meta line: date · time IST · venue · city */}
            <p className="text-muted-foreground mt-3 text-sm font-medium sm:text-base">
              {metaLine}
            </p>
          </header>

          {/* Large cover photo (rounded-2xl; if none, no image block at all) */}
          {event.coverImage && (
            <div className="bg-muted relative mt-8 aspect-video max-h-[500px] w-full overflow-hidden rounded-2xl">
              <Image
                src={event.coverImage}
                alt={event.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1280px"
                className="object-cover"
              />
            </div>
          )}

          {/* ─── Two-Column Layout ───────────────────────────────────────────── */}
          <div className="mt-12 grid grid-cols-1 items-start gap-12 md:mt-16 lg:grid-cols-3 lg:gap-16">
            {/* Left: Overview, Schedule, Speakers, FAQs */}
            <div className="space-y-12 md:space-y-16 lg:col-span-2">
              {/* 1. Overview */}
              {event.overview && (
                <section aria-labelledby="overview-heading">
                  <h2 id="overview-heading" className="h2 text-foreground mb-4">
                    Overview
                  </h2>
                  <div className="text-muted-foreground text-base leading-relaxed whitespace-pre-line sm:text-lg">
                    {event.overview}
                  </div>
                </section>
              )}

              {/* 2. Schedule (Simple table) */}
              {event.scheduleItems.length > 0 && (
                <section aria-labelledby="schedule-heading">
                  <h2 id="schedule-heading" className="h2 text-foreground mb-6">
                    Schedule
                  </h2>
                  <div className="border-border overflow-x-auto border-t">
                    <table className="w-full text-left text-sm">
                      <thead className="border-border text-muted-foreground border-b font-mono text-xs uppercase">
                        <tr>
                          <th scope="col" className="py-3 pr-6 font-semibold">
                            Time
                          </th>
                          <th scope="col" className="py-3 pr-6 font-semibold">
                            Session
                          </th>
                          <th scope="col" className="py-3 font-semibold">
                            Speaker
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-border divide-y">
                        {event.scheduleItems.map((item) => {
                          const timeLabel = item.endTime
                            ? formatTimeRange(item.startTime, item.endTime)
                            : formatTime(item.startTime);
                          const speaker = event.speakers.find(
                            (s) => s.speakerId === item.speakerId
                          );

                          return (
                            <tr key={item.id} className="py-4">
                              <td className="text-muted-foreground py-4 pr-6 align-top font-mono whitespace-nowrap">
                                {timeLabel}
                              </td>
                              <td className="py-4 pr-6 align-top">
                                <span className="text-foreground block font-semibold">
                                  {item.title}
                                </span>
                                {item.description && (
                                  <span className="text-muted-foreground mt-1 block text-xs">
                                    {item.description}
                                  </span>
                                )}
                              </td>
                              <td className="text-muted-foreground py-4 align-top whitespace-nowrap">
                                {speaker?.speaker?.name || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* 3. Speakers (Name, role, small round photo) */}
              {event.speakers.length > 0 && (
                <section aria-labelledby="speakers-heading">
                  <h2 id="speakers-heading" className="h2 text-foreground mb-6">
                    Speakers
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {event.speakers.map(({ speaker }) => {
                      const roleDetails = [speaker.designation, speaker.organisation]
                        .filter(Boolean)
                        .join(" · ");

                      return (
                        <div
                          key={speaker.id}
                          className="border-border bg-card flex items-center gap-4 rounded-xl border p-4"
                        >
                          {speaker.photo ? (
                            <div className="bg-muted relative size-12 shrink-0 overflow-hidden rounded-full">
                              <Image
                                src={speaker.photo}
                                alt={speaker.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="bg-muted text-foreground flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                              {speaker.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="text-foreground truncate text-base font-semibold">
                              {speaker.name}
                            </h3>
                            {roleDetails && (
                              <p className="text-muted-foreground truncate text-xs">
                                {roleDetails}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 4. FAQs only if present (plain details/summary) */}
              {event.faqs.length > 0 && (
                <section aria-labelledby="faqs-heading">
                  <h2 id="faqs-heading" className="h2 text-foreground mb-6">
                    Frequently Asked Questions
                  </h2>
                  <div className="divide-border border-border divide-y border-y">
                    {event.faqs.map((faq) => (
                      <details key={faq.id} className="group py-4">
                        <summary className="text-foreground hover:text-accent-text flex cursor-pointer list-none items-center justify-between text-base font-medium transition-colors">
                          <span>{faq.question}</span>
                          <span
                            aria-hidden="true"
                            className="text-muted-foreground ml-4 font-mono text-lg transition-transform duration-150 group-open:rotate-45"
                          >
                            +
                          </span>
                        </summary>
                        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right: Sticky Card (Desktop) */}
            <aside className="hidden lg:col-span-1 lg:block">
              <div className="border-border bg-card sticky top-24 space-y-6 rounded-2xl border p-6 sm:p-8">
                <div>
                  <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
                    Admission
                  </span>
                  <div className="text-foreground mt-1 font-mono text-3xl font-bold">
                    {priceLabel}
                  </div>

                  {/* Seats left ONLY if low (render count only when > 0, never {n && ...}) */}
                  {!isPast && isSeatsLow && seatsLeft !== null && seatsLeft > 0 ? (
                    <p className="text-destructive mt-1.5 font-mono text-xs font-medium">
                      Only {seatsLeft} seats remaining
                    </p>
                  ) : null}
                </div>

                {/* Primary Action Button */}
                {!isPast ? (
                  <Button asChild size="lg" variant="primary" className="w-full">
                    <Link href={`/events/${event.slug}/register`}>Register</Link>
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button disabled size="lg" variant="secondary" className="w-full">
                      Event ended
                    </Button>
                    {galleryAlbumId && (
                      <Button asChild size="lg" variant="primary" className="w-full">
                        <Link href={`/gallery/${galleryAlbumId}`}>View event photos</Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* ─── Mobile Sticky Bottom Bar ────────────────────────────────────────── */}
      <div className="border-border bg-background/95 fixed inset-x-0 bottom-0 z-20 flex items-center justify-between border-t p-4 backdrop-blur-sm lg:hidden">
        <div>
          <div className="text-foreground font-mono text-xl leading-none font-bold">
            {priceLabel}
          </div>
          {!isPast && isSeatsLow && seatsLeft !== null && seatsLeft > 0 ? (
            <p className="text-destructive mt-1 font-mono text-xs font-medium">
              {seatsLeft} seats left
            </p>
          ) : null}
        </div>

        <div>
          {!isPast ? (
            <Button asChild size="md" variant="primary">
              <Link href={`/events/${event.slug}/register`}>Register</Link>
            </Button>
          ) : galleryAlbumId ? (
            <Button asChild size="md" variant="primary">
              <Link href={`/gallery/${galleryAlbumId}`}>View photos</Link>
            </Button>
          ) : (
            <Button disabled size="md" variant="secondary">
              Event ended
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
