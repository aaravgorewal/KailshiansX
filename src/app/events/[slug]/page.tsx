import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Users,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Tag,
  ChevronRight,
} from "lucide-react";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SpeakerCard } from "@/components/ui/SpeakerCard";
import { PartnerLogoGrid, type PartnerTier } from "@/components/ui/PartnerLogoGrid";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { EventCard, type EventType, type EventStatus } from "@/components/ui/EventCard";
import { EventStickyCta } from "@/components/events/EventStickyCta";
import { getGoogleCalendarUrl } from "@/lib/calendar";

export const revalidate = 60;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

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

  const title = event.metaTitle || `${event.title} | KailshiansX`;
  const description =
    event.metaDescription ||
    event.overview ||
    `Join ${event.title} organized by Kailshians Web Services developer community.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/events/${event.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/events/${event.slug}`,
      siteName: "KailshiansX",
      type: "website",
      images: [
        {
          url: `${APP_URL}/events/${event.slug}/opengraph-image`,
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
      images: [`${APP_URL}/events/${event.slug}/opengraph-image`],
    },
  };
}

// ─── Event Detail Page Component ──────────────────────────────────────────────
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
      tracks: {
        orderBy: { sortOrder: "asc" },
      },
      speakers: {
        include: { speaker: true },
        orderBy: { sortOrder: "asc" },
      },
      partners: {
        include: { partner: true },
        orderBy: { sortOrder: "asc" },
      },
      faqs: {
        orderBy: { sortOrder: "asc" },
      },
      galleryAlbums: {
        where: { isPublished: true },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { registrations: true, speakers: true },
      },
    },
  });

  if (!event || event.status === "DRAFT" || event.deletedAt) {
    notFound();
  }

  // Recommended other upcoming gatherings
  const recommendedEvents = await db.event.findMany({
    where: {
      id: { not: event.id },
      status: "PUBLISHED",
      deletedAt: null,
      startDate: { gte: now },
    },
    take: 3,
    orderBy: { startDate: "asc" },
    include: {
      city: true,
      ticketTypes: true,
      _count: { select: { registrations: true, speakers: true } },
    },
  });

  // Calculate pricing
  const isFree =
    event.ticketTypes.length === 0 || event.ticketTypes.some((t) => Number(t.price) === 0);
  const lowestPrice =
    event.ticketTypes.length > 0 ? Math.min(...event.ticketTypes.map((t) => Number(t.price))) : 0;
  const highestPrice =
    event.ticketTypes.length > 0 ? Math.max(...event.ticketTypes.map((t) => Number(t.price))) : 0;

  // Format dates
  const startDateStr = new Date(event.startDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const startTimeStr = new Date(event.startDate).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const endTimeStr = event.endDate
    ? new Date(event.endDate).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  const mapQueryUrl =
    event.venueMapUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      [event.venue, event.venueAddress, event.city?.name, "India"].filter(Boolean).join(", ")
    )}`;

  const googleCalUrl = getGoogleCalendarUrl({
    title: event.title,
    description: event.overview,
    slug: event.slug,
    startDate: event.startDate,
    endDate: event.endDate,
    venue: event.venue,
    venueAddress: event.venueAddress,
    cityName: event.city?.name,
    appUrl: APP_URL,
  });

  const icsDownloadUrl = `/api/events/${event.slug}/ics`;

  // Segment speakers by role
  const speakersList = event.speakers.filter((s) => s.role === "SPEAKER");
  const judgesList = event.speakers.filter((s) => s.role === "JUDGE");
  const mentorsList = event.speakers.filter((s) => s.role === "MENTOR");

  // Partners formatting
  const formattedPartners = event.partners.map((ep) => ({
    id: ep.partner.id,
    name: ep.partner.name,
    websiteUrl: ep.partner.website || undefined,
    logoUrl: ep.partner.logo || undefined,
    tier: (ep.tier as PartnerTier) || "COMMUNITY",
  }));

  // Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.overview || event.title,
    startDate: event.startDate.toISOString(),
    endDate: (event.endDate || event.startDate).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      event.attendanceMode === "VIRTUAL"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue || "Venue",
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venueAddress || undefined,
        addressLocality: event.city?.name || "India",
        addressRegion: event.city?.state || "India",
        addressCountry: "IN",
      },
    },
    image: event.coverImage || `${APP_URL}/events/${event.slug}/opengraph-image`,
    organizer: {
      "@type": "Organization",
      name: "KailshiansX",
      url: APP_URL,
    },
    offers: event.ticketTypes.map((ticket) => ({
      "@type": "Offer",
      name: ticket.name,
      price: Number(ticket.price),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      validFrom: ticket.saleStart ? ticket.saleStart.toISOString() : undefined,
    })),
    performer: event.speakers.map((sp) => ({
      "@type": "Person",
      name: sp.speaker.name,
      jobTitle: sp.speaker.designation || undefined,
      worksFor: sp.speaker.organisation
        ? { "@type": "Organization", name: sp.speaker.organisation }
        : undefined,
    })),
  };

  return (
    <>
      {/* Inject Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-surface-950 min-h-screen pb-28">
        {/* ─── Breadcrumb Bar ─────────────────────────────────────────────── */}
        <div className="border-surface-800/80 bg-surface-900/60 border-b py-3">
          <div className="container-page text-surface-400 flex items-center justify-between text-xs">
            <Link
              href="/events"
              className="hover:text-surface-100 inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to all events</span>
            </Link>

            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span>KailshiansX</span>
              <ChevronRight className="text-surface-600 size-3" />
              <span>Events</span>
              <ChevronRight className="text-surface-600 size-3" />
              <span className="text-surface-200 max-w-[200px] truncate">{event.slug}</span>
            </div>
          </div>
        </div>

        {/* ─── Event Hero Header ──────────────────────────────────────────── */}
        <section
          aria-label="Event Header"
          className="from-surface-900 via-surface-900/80 to-surface-950 border-surface-800 relative overflow-hidden border-b bg-gradient-to-b pt-10 pb-12"
        >
          {/* Ambient Lighting & Grid */}
          <div
            className="bg-grid pointer-events-none absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -top-20 left-1/2 h-[450px] w-[850px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(61,97,252,0.4) 0%, rgba(139,61,255,0.2) 60%, transparent 80%)",
            }}
            aria-hidden="true"
          />

          <div className="container-page relative z-10">
            <div className="max-w-4xl space-y-5">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="brand" size="default">
                  {event.type.replace("_", " ")}
                </Badge>
                <Badge
                  variant={event.status === "PUBLISHED" ? "success" : "surface"}
                  size="default"
                  dot
                >
                  {event.status === "PUBLISHED" ? "Confirmed" : event.status}
                </Badge>
                <Badge variant="outline" size="default">
                  {event.attendanceMode === "IN_PERSON" ? "In-Person Gathering" : "Virtual Stream"}
                </Badge>
                {event.city && (
                  <Badge variant="surface" size="default">
                    {event.city.name}, {event.city.state}
                  </Badge>
                )}
              </div>

              {/* Event Title */}
              <h1 className="text-surface-50 text-3xl leading-[1.12] font-black tracking-tight sm:text-5xl md:text-6xl">
                {event.title}
              </h1>

              {/* Overview / Subhead */}
              {event.overview && (
                <p className="text-surface-300 max-w-3xl text-base leading-relaxed sm:text-lg">
                  {event.overview}
                </p>
              )}

              {/* Quick Specs Badges */}
              <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 md:grid-cols-3">
                {/* Date & Time Card */}
                <div className="border-surface-800 bg-surface-900/60 flex items-start gap-3 rounded-xl border p-4">
                  <div className="bg-brand-500/10 text-brand-400 rounded-lg p-2">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <div className="text-surface-400 font-mono text-xs tracking-wider uppercase">
                      Date &amp; Time (IST)
                    </div>
                    <div className="text-surface-100 mt-0.5 text-sm font-semibold">
                      {startDateStr}
                    </div>
                    <div className="text-surface-400 mt-0.5 text-xs">
                      {startTimeStr} {endTimeStr ? `– ${endTimeStr}` : ""}
                    </div>
                  </div>
                </div>

                {/* Venue & Location Card */}
                <div className="border-surface-800 bg-surface-900/60 flex items-start gap-3 rounded-xl border p-4">
                  <div className="bg-accent-500/10 text-accent-400 rounded-lg p-2">
                    <MapPin className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-surface-400 font-mono text-xs tracking-wider uppercase">
                      Location
                    </div>
                    <div className="text-surface-100 mt-0.5 truncate text-sm font-semibold">
                      {event.venue || "Announced Shortly"}
                    </div>
                    {event.venueAddress && (
                      <div className="text-surface-400 mt-0.5 truncate text-xs">
                        {event.venueAddress}
                      </div>
                    )}
                    <a
                      href={mapQueryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-400 hover:text-brand-300 mt-1 inline-flex items-center gap-1 text-[11px] font-medium"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                </div>

                {/* Capacity & Format Card */}
                <div className="border-surface-800 bg-surface-900/60 flex items-start gap-3 rounded-xl border p-4 sm:col-span-2 md:col-span-1">
                  <div className="bg-surface-800 text-surface-300 rounded-lg p-2">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <div className="text-surface-400 font-mono text-xs tracking-wider uppercase">
                      Capacity
                    </div>
                    <div className="text-surface-100 mt-0.5 text-sm font-semibold">
                      {event.maxCapacity ? `${event.maxCapacity} Builders` : "Open Community RSVP"}
                    </div>
                    <div className="text-surface-400 mt-0.5 text-xs">
                      {event._count.registrations} registered so far
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Main Two-Column Layout ─────────────────────────────────────── */}
        <main className="container-page pt-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Left Column: Comprehensive Detail Sections */}
            <div className="space-y-16 lg:col-span-8">
              {/* 1. Overview & About */}
              <section aria-labelledby="section-overview">
                <SectionHeader
                  badge="About Gathering"
                  title="Event Overview"
                  highlight="Overview"
                  description="Curated by Kailshians Web Services to foster high-caliber engineering discussions and hands-on building."
                  align="left"
                  className="mb-6"
                />

                <div className="prose prose-invert text-surface-300 max-w-none space-y-4 text-sm leading-relaxed sm:text-base">
                  <p>
                    {event.overview ||
                      "Join software engineers, product architects, student builders, and open-source contributors for a day of technical deep dives, live code reviews, and networking."}
                  </p>
                  <p>
                    KailshiansX events are built on real technical merit: zero commercial pitches,
                    actionable system design lessons, and open-access mentorship from experienced
                    practitioners.
                  </p>
                </div>
              </section>

              {/* 2. Eligibility & Requirements */}
              {event.eligibility && (
                <section
                  aria-labelledby="section-eligibility"
                  className="border-surface-800 bg-surface-900/40 rounded-2xl border p-6 sm:p-8"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="bg-brand-500/10 text-brand-400 border-brand-500/20 flex size-10 items-center justify-center rounded-xl border">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <h3 id="section-eligibility" className="text-surface-100 text-xl font-bold">
                        Eligibility &amp; Prerequisites
                      </h3>
                      <p className="text-surface-400 text-xs">Review before confirming your pass</p>
                    </div>
                  </div>

                  <p className="text-surface-300 mb-6 text-sm leading-relaxed">
                    {event.eligibility}
                  </p>

                  <div className="text-surface-400 border-surface-800/80 grid grid-cols-1 gap-3 border-t pt-4 text-xs sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                      <span>Valid college or professional ID required at check-in</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                      <span>Bring your own laptop &amp; development charger</span>
                    </div>
                  </div>
                </section>
              )}

              {/* 3. Schedule / Agenda */}
              {event.scheduleItems.length > 0 && (
                <section aria-labelledby="section-schedule">
                  <SectionHeader
                    badge="Timeline &amp; Agenda"
                    title="Event Schedule"
                    highlight="Schedule"
                    description="Carefully planned sessions designed to maximize coding, learning, and peer networking."
                    align="left"
                    className="mb-8"
                  />

                  <div className="border-surface-800 relative ml-2 space-y-8 border-l-2 pl-6">
                    {event.scheduleItems.map((item, idx) => {
                      const itemStartStr = new Date(item.startTime).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      });
                      const itemEndStr = item.endTime
                        ? new Date(item.endTime).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : null;

                      // Associate speaker if present
                      const speakerMatch = event.speakers.find(
                        (s) => s.speakerId === item.speakerId
                      )?.speaker;

                      return (
                        <div key={item.id} className="group relative">
                          {/* Dot on timeline */}
                          <div className="border-brand-500 bg-surface-950 group-hover:bg-brand-500 absolute top-1.5 -left-[31px] size-3.5 rounded-full border-2 transition-colors" />

                          <div className="border-surface-800/80 bg-surface-900/60 group-hover:border-surface-700 rounded-xl border p-5 transition-all sm:p-6">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-brand-300 inline-flex items-center gap-1.5 font-mono text-xs font-medium">
                                <Clock className="size-3.5" />
                                <span>
                                  {itemStartStr} {itemEndStr ? `– ${itemEndStr}` : ""}
                                </span>
                              </span>
                              <Badge variant="surface" size="sm">
                                Slot {idx + 1}
                              </Badge>
                            </div>

                            <h4 className="text-surface-100 text-lg font-bold">{item.title}</h4>

                            {item.description && (
                              <p className="text-surface-400 mt-2 text-sm leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            {speakerMatch && (
                              <div className="border-surface-800 mt-4 flex items-center gap-3 border-t pt-3">
                                {speakerMatch.photo ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={speakerMatch.photo}
                                    alt={speakerMatch.name}
                                    className="border-surface-700 size-8 rounded-full border object-cover"
                                  />
                                ) : (
                                  <div className="bg-surface-800 text-surface-200 flex size-8 items-center justify-center rounded-full text-xs font-bold">
                                    {speakerMatch.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <div className="text-surface-200 text-xs font-semibold">
                                    {speakerMatch.name}
                                  </div>
                                  <div className="text-surface-400 text-[11px]">
                                    {speakerMatch.designation} • {speakerMatch.organisation}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 4. Tracks & Problem Statements (Hackathons & Workshops) */}
              {event.tracks.length > 0 && (
                <section aria-labelledby="section-tracks">
                  <SectionHeader
                    badge="Hack &amp; Build Tracks"
                    title="Tracks &amp; Problem Statements"
                    highlight="Tracks"
                    description="Choose your area of innovation. Multi-disciplinary tracks with focused sponsor APIs and mentorship."
                    align="left"
                    className="mb-8"
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {event.tracks.map((track) => (
                      <div
                        key={track.id}
                        className="border-surface-800 bg-surface-900/60 hover:border-surface-700 flex flex-col justify-between rounded-xl border p-6 transition-all hover:shadow-lg"
                      >
                        <div>
                          <div className="mb-3 flex items-center gap-2">
                            <span
                              className="size-3 shrink-0 rounded-full"
                              style={{ backgroundColor: track.color || "#3d61fc" }}
                            />
                            <h4 className="text-surface-100 text-lg font-bold">{track.name}</h4>
                          </div>
                          {track.description && (
                            <p className="text-surface-400 text-xs leading-relaxed sm:text-sm">
                              {track.description}
                            </p>
                          )}
                        </div>

                        <div className="border-surface-800/60 text-surface-500 mt-5 flex items-center justify-between border-t pt-3 font-mono text-[11px]">
                          <span>Track Focus</span>
                          <span>Open Submission</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 5. Speakers, Judges & Mentors */}
              {event.speakers.length > 0 && (
                <section aria-labelledby="section-speakers" className="space-y-10">
                  <SectionHeader
                    badge="Ecosystem Mentorship"
                    title="Speakers, Judges &amp; Mentors"
                    highlight="Mentors"
                    description="Learn directly from senior engineers, startup CTOs, and open source architects."
                    align="left"
                    className="mb-8"
                  />

                  {/* Keynote Speakers */}
                  {speakersList.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-surface-200 flex items-center gap-2 text-base font-semibold">
                        <Badge variant="brand" size="sm">
                          Speakers
                        </Badge>
                        <span>Keynote &amp; Session Speakers</span>
                      </h4>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {speakersList.map((es) => (
                          <SpeakerCard
                            key={es.id}
                            name={es.speaker.name}
                            role={es.speaker.designation || "Speaker"}
                            company={es.speaker.organisation || "Tech Community"}
                            avatarUrl={es.speaker.photo || undefined}
                            bio={es.speaker.bio || undefined}
                            speakerRole="SPEAKER"
                            socials={{
                              twitter: es.speaker.twitter || undefined,
                              linkedin: es.speaker.linkedin || undefined,
                              github: es.speaker.github || undefined,
                              website: es.speaker.website || undefined,
                            }}
                            sessionsCount={1}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Judges */}
                  {judgesList.length > 0 && (
                    <div className="border-surface-800/80 space-y-4 border-t pt-4">
                      <h4 className="text-surface-200 flex items-center gap-2 text-base font-semibold">
                        <Badge variant="accent" size="sm">
                          Judges
                        </Badge>
                        <span>Evaluation Jury</span>
                      </h4>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {judgesList.map((es) => (
                          <SpeakerCard
                            key={es.id}
                            name={es.speaker.name}
                            role={es.speaker.designation || "Judge"}
                            company={es.speaker.organisation || "Jury Board"}
                            avatarUrl={es.speaker.photo || undefined}
                            bio={es.speaker.bio || undefined}
                            speakerRole="JUDGE"
                            socials={{
                              twitter: es.speaker.twitter || undefined,
                              linkedin: es.speaker.linkedin || undefined,
                              github: es.speaker.github || undefined,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mentors */}
                  {mentorsList.length > 0 && (
                    <div className="border-surface-800/80 space-y-4 border-t pt-4">
                      <h4 className="text-surface-200 flex items-center gap-2 text-base font-semibold">
                        <Badge variant="success" size="sm">
                          Mentors
                        </Badge>
                        <span>Hands-On Mentors</span>
                      </h4>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {mentorsList.map((es) => (
                          <SpeakerCard
                            key={es.id}
                            name={es.speaker.name}
                            role={es.speaker.designation || "Mentor"}
                            company={es.speaker.organisation || "Mentor"}
                            avatarUrl={es.speaker.photo || undefined}
                            bio={es.speaker.bio || undefined}
                            speakerRole="MENTOR"
                            socials={{
                              twitter: es.speaker.twitter || undefined,
                              linkedin: es.speaker.linkedin || undefined,
                              github: es.speaker.github || undefined,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* 6. Ticket Options (#tickets) */}
              <section id="tickets" aria-labelledby="section-tickets" className="scroll-mt-24">
                <SectionHeader
                  badge="Pass Selection"
                  title="Ticket Options &amp; Passes"
                  highlight="Passes"
                  description="Choose your ticket tier. All passes include full event access, verifiable certificate, and partner swag."
                  align="left"
                  className="mb-8"
                />

                <div className="space-y-4">
                  {event.ticketTypes.length > 0 ? (
                    event.ticketTypes.map((ticket) => {
                      const isFreeTicket = Number(ticket.price) === 0;

                      return (
                        <div
                          key={ticket.id}
                          className="border-surface-800 bg-surface-900/70 hover:border-brand-500/50 flex flex-col items-start justify-between gap-6 rounded-2xl border p-6 transition-all hover:shadow-xl sm:flex-row sm:items-center"
                        >
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center gap-2.5">
                              <h4 className="text-surface-50 text-xl font-bold">{ticket.name}</h4>
                              <Badge variant={isFreeTicket ? "success" : "brand"} size="sm">
                                {isFreeTicket ? "Free Pass" : "Paid Pass"}
                              </Badge>
                            </div>

                            {ticket.description && (
                              <p className="text-surface-400 text-xs leading-relaxed sm:text-sm">
                                {ticket.description}
                              </p>
                            )}

                            <div className="text-surface-500 flex items-center gap-4 pt-1 font-mono text-xs">
                              <span>Quota: {ticket.quota} seats</span>
                              <span>•</span>
                              <span>Verifiable Certificate included</span>
                            </div>
                          </div>

                          <div className="border-surface-800/80 flex w-full items-center justify-between gap-3 border-t pt-3 sm:w-auto sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                            <div className="text-surface-100 text-2xl font-black">
                              {isFreeTicket ? (
                                <span className="text-emerald-400">Free</span>
                              ) : (
                                `₹${ticket.price}`
                              )}
                            </div>

                            <Button asChild size="default" variant="default" className="shadow-md">
                              <Link href={`/events/${event.slug}/register?tier=${ticket.id}`}>
                                Claim Pass
                              </Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-8 text-center">
                      <Tag className="text-surface-500 mx-auto mb-3 size-10" />
                      <h4 className="text-surface-200 text-lg font-bold">Open Community Entry</h4>
                      <p className="text-surface-400 mx-auto mt-1 max-w-sm text-xs">
                        This gathering is free for verified community members. RSVP below to confirm
                        your seat.
                      </p>
                      <Button asChild className="mt-5" variant="default">
                        <Link href={`/events/${event.slug}/register`}>RSVP Now</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </section>

              {/* 7. Partners & Sponsors */}
              {formattedPartners.length > 0 && (
                <section aria-labelledby="section-partners">
                  <SectionHeader
                    badge="Supporters &amp; Sponsors"
                    title="Supported by Industry Leaders"
                    highlight="Industry Leaders"
                    description="Cloud providers, developer toolmakers, and tech workspaces making this edition possible."
                    align="left"
                    className="mb-8"
                  />

                  <PartnerLogoGrid partners={formattedPartners} groupByTier={true} />
                </section>
              )}

              {/* 8. Frequently Asked Questions */}
              {event.faqs.length > 0 && (
                <section aria-labelledby="section-faqs">
                  <SectionHeader
                    badge="Common Questions"
                    title="Frequently Asked Questions"
                    highlight="Questions"
                    description="Everything you need to know about attendance, schedules, certificates, and check-in."
                    align="left"
                    className="mb-8"
                  />

                  <FAQAccordion
                    items={event.faqs.map((f) => ({
                      id: f.id,
                      question: f.question,
                      answer: f.answer,
                    }))}
                  />
                </section>
              )}

              {/* 9. Gallery Highlights */}
              {event.galleryAlbums.length > 0 && (
                <section aria-labelledby="section-gallery">
                  <SectionHeader
                    badge="Vibe &amp; Atmosphere"
                    title="Moments From Previous Editions"
                    highlight="Moments"
                    description="Snapshots from the floor, coding sprints, and keynote stages."
                    align="left"
                    className="mb-8"
                  />

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {event.galleryAlbums
                      .flatMap((a) => a.images)
                      .slice(0, 6)
                      .map((img) => (
                        <div
                          key={img.id}
                          className="group border-surface-800 bg-surface-900 relative aspect-video overflow-hidden rounded-xl border"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.altText || img.caption || "Event moment"}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          {img.caption && (
                            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="text-xs font-medium text-white">{img.caption}</span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Desktop Sticky Registration Box */}
            <aside className="hidden lg:col-span-4 lg:block">
              <EventStickyCta
                slug={event.slug}
                title={event.title}
                isFree={isFree}
                lowestPrice={lowestPrice}
                highestPrice={highestPrice}
                registrationDeadline={event.registrationDeadline}
                startDate={event.startDate}
                status={event.status}
                maxCapacity={event.maxCapacity}
                attendeeCount={event._count.registrations}
                googleCalendarUrl={googleCalUrl}
                icsDownloadUrl={icsDownloadUrl}
              />
            </aside>
          </div>

          {/* ─── Recommended Other Upcoming Events ──────────────────────────── */}
          {recommendedEvents.length > 0 && (
            <section
              aria-labelledby="section-related"
              className="border-surface-800 mt-24 border-t pt-16"
            >
              <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SectionHeader
                  badge="More Gatherings"
                  title="Explore Other Upcoming Events"
                  highlight="Upcoming Events"
                  description="Keep the momentum going. Register for upcoming summits, hack sprints, and workshops."
                  align="left"
                />
                <Button asChild variant="outline" size="sm">
                  <Link href="/events">View All Events</Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedEvents.map((ev) => {
                  const evIsFree =
                    ev.ticketTypes.length === 0 ||
                    ev.ticketTypes.some((t) => Number(t.price) === 0);
                  const evPrice =
                    ev.ticketTypes.length > 0
                      ? Math.min(...ev.ticketTypes.map((t) => Number(t.price)))
                      : 0;

                  return (
                    <EventCard
                      key={ev.id}
                      title={ev.title}
                      slug={ev.slug}
                      type={ev.type as EventType}
                      status={ev.status as EventStatus}
                      startDate={ev.startDate}
                      endDate={ev.endDate || undefined}
                      venue={ev.venue || undefined}
                      city={ev.city?.name || undefined}
                      coverUrl={ev.coverImage || undefined}
                      isFree={evIsFree}
                      price={evIsFree ? 0 : evPrice}
                      attendeeCount={ev._count.registrations}
                      speakerCount={ev._count.speakers}
                      tags={[ev.type.replace("_", " "), ev.city?.name || "India"]}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </main>

        {/* ─── Mobile Sticky Register CTA ─────────────────────────────────── */}
        <EventStickyCta
          slug={event.slug}
          title={event.title}
          isFree={isFree}
          lowestPrice={lowestPrice}
          highestPrice={highestPrice}
          registrationDeadline={event.registrationDeadline}
          startDate={event.startDate}
          status={event.status}
          maxCapacity={event.maxCapacity}
          attendeeCount={event._count.registrations}
          googleCalendarUrl={googleCalUrl}
          icsDownloadUrl={icsDownloadUrl}
          className="lg:hidden"
        />
      </div>
    </>
  );
}
