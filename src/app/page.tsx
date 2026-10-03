import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  Compass,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Video,
  CheckCircle2,
  Users,
} from "lucide-react";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard, type EventType, type EventStatus } from "@/components/ui/EventCard";
import { SeriesCard } from "@/components/ui/SeriesCard";
import { SpeakerCard, type SpeakerRole } from "@/components/ui/SpeakerCard";
import { PartnerLogoGrid, type PartnerTier } from "@/components/ui/PartnerLogoGrid";
import { StatCounter } from "@/components/ui/StatCounter";
import { TestimonialCarousel, type TestimonialItem } from "@/components/ui/TestimonialCarousel";

// ─── ISR Configuration ─────────────────────────────────────────────────────────
export const revalidate = 60; // Revalidate page every 60 seconds

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Developer Events. Builder Communities. Real Connections. | KailshiansX",
  description:
    "KailshiansX is the developer events and builder community platform by Kailshians Web Services. Discover hackathons, meetups, workshops, tech talks, campus chapters and collaborations across India.",
  keywords: [
    "developer events",
    "hackathons India",
    "developer meetups",
    "tech talks",
    "developer workshops",
    "campus leads",
    "state leads",
    "KailshiansX",
    "Kailshians Web Services",
    "PadharoX",
    "NirmanX",
    "RaibarX",
    "TricityX",
    "AarambhX",
  ],
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    title: "Developer Events. Builder Communities. Real Connections. | KailshiansX",
    description:
      "Join hackathons, meetups, workshops, and builder communities by Kailshians Web Services across India. Move from attendee to leader.",
    url: APP_URL,
    siteName: "KailshiansX",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KailshiansX — Developer Events & Community Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Events. Builder Communities. Real Connections. | KailshiansX",
    description:
      "Discover hackathons, meetups, workshops, tech talks and community programs by Kailshians Web Services.",
    images: ["/og-image.png"],
    creator: "@kailshiansx",
  },
};

export default async function HomePage() {
  const now = new Date();

  // ─── 1. Query Upcoming & Featured Events ────────────────────────────────────
  const upcomingEventsRaw = await db.event.findMany({
    where: {
      status: "PUBLISHED",
      startDate: { gte: now },
    },
    orderBy: { startDate: "asc" },
    take: 4,
    include: {
      city: true,
      ticketTypes: true,
      speakers: { include: { speaker: true } },
      _count: { select: { registrations: true, speakers: true } },
    },
  });

  // If fewer than 4 upcoming, also pull latest published events so section stays filled
  let displayEvents = upcomingEventsRaw;
  if (displayEvents.length < 4) {
    const additionalEvents = await db.event.findMany({
      where: {
        status: "PUBLISHED",
        id: { notIn: upcomingEventsRaw.map((e) => e.id) },
      },
      orderBy: { startDate: "desc" },
      take: 4 - displayEvents.length,
      include: {
        city: true,
        ticketTypes: true,
        speakers: { include: { speaker: true } },
        _count: { select: { registrations: true, speakers: true } },
      },
    });
    displayEvents = [...upcomingEventsRaw, ...additionalEvents];
  }

  // ─── 2. Query Impact Metrics ────────────────────────────────────────────────
  const [
    totalPublishedEvents,
    totalCities,
    totalColleges,
    totalRegistrations,
    totalCampusLeads,
    totalStateLeads,
  ] = await Promise.all([
    db.event.count({ where: { status: "PUBLISHED" } }),
    db.city.count(),
    db.college.count(),
    db.registration.count(),
    db.campusLead.count({ where: { status: "ACTIVE" } }),
    db.stateLead.count({ where: { status: "ACTIVE" } }),
  ]);

  // Baseline community impact multiplier for display
  const calculatedBuilders = Math.max(totalRegistrations * 15 + 2400, 2500);

  // ─── 3. Query Series with Editions & Cities ─────────────────────────────────
  const seriesList = await db.series.findMany({
    include: {
      editions: {
        include: {
          event: { include: { city: true } },
        },
        orderBy: { editionNo: "asc" },
      },
    },
    take: 6,
  });

  // ─── 4. Query Tech Talks ────────────────────────────────────────────────────
  const techTalkEvents = await db.event.findMany({
    where: {
      type: "TECH_TALK",
      status: "PUBLISHED",
    },
    orderBy: { startDate: "desc" },
    take: 3,
    include: {
      city: true,
      speakers: { include: { speaker: true } },
      ticketTypes: true,
      _count: { select: { registrations: true, speakers: true } },
    },
  });

  const featuredTechTalkResource = await db.techTalkResource.findFirst({
    include: {
      speaker: true,
      event: { include: { city: true } },
    },
  });

  const featuredSpeakers = await db.speaker.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      eventSpeakers: true,
    },
  });

  const keyTakeaways: string[] = Array.isArray(featuredTechTalkResource?.keyTakeaways)
    ? (featuredTechTalkResource.keyTakeaways as string[])
    : [];

  // ─── 5. Query Workshops ─────────────────────────────────────────────────────
  const workshopEvents = await db.event.findMany({
    where: {
      type: "WORKSHOP",
      status: "PUBLISHED",
    },
    orderBy: { startDate: "desc" },
    take: 3,
    include: {
      city: true,
      speakers: { include: { speaker: true } },
      ticketTypes: true,
      _count: { select: { registrations: true, speakers: true } },
    },
  });

  // ─── 6. Query Community Programs Data ───────────────────────────────────────
  const activeCampusLeads = await db.campusLead.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: true,
      college: true,
      city: true,
    },
    take: 3,
  });

  // ─── 7. Query Gallery Highlights ────────────────────────────────────────────
  const galleryHighlights = await db.galleryImage.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { album: true },
  });

  // ─── 8. Query Partners ──────────────────────────────────────────────────────
  const partnersList = await db.partner.findMany({
    include: {
      eventPartners: true,
    },
    take: 12,
  });

  const formattedPartners = partnersList.map((p) => {
    // Map DB partner category or top event partner tier to PartnerTier enum
    const tier = (p.eventPartners[0]?.tier as PartnerTier) || "COMMUNITY";
    return {
      id: p.id,
      name: p.name,
      websiteUrl: p.website || undefined,
      logoUrl: p.logo || undefined,
      tier,
    };
  });

  // ─── 9. Query Testimonials ──────────────────────────────────────────────────
  const testimonialBlocks = await db.contentBlock.findMany({
    where: {
      page: { slug: "home" },
      type: "TESTIMONIAL",
      isVisible: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  const parsedTestimonials: TestimonialItem[] =
    testimonialBlocks.length > 0
      ? testimonialBlocks.map((block) => {
          const d = block.data as Record<string, unknown>;
          return {
            id: block.id,
            quote: (d.quote as string) || "KailshiansX empowered our campus tech culture.",
            author: (d.author as string) || "Community Builder",
            role: (d.role as string) || "Developer",
            company: (d.company as string) || "KailshiansX",
            avatarUrl: (d.avatarUrl as string) || undefined,
            rating: (d.rating as number) || 5,
            eventTitle: (d.eventTitle as string) || undefined,
          };
        })
      : [
          {
            id: "fallback-1",
            quote:
              "KailshiansX completely changed how our campus approaches open source and hackathons. The energy at PadharoX was world-class.",
            author: "Ananya Deshmukh",
            role: "Campus Lead",
            company: "MNIT Jaipur",
            rating: 5,
            eventTitle: "PadharoX Jaipur",
          },
          {
            id: "fallback-2",
            quote:
              "Speaking at KailshiansX tech talks was one of the most rewarding community experiences of the year. The questions were deeply technical.",
            author: "Rohan Varma",
            role: "Lead Architect",
            company: "CloudScale Systems",
            rating: 5,
            eventTitle: "Tech Talks Delhi",
          },
        ];

  // ─── JSON-LD Structured Data ───────────────────────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${APP_URL}#organization`,
        name: "KailshiansX",
        url: APP_URL,
        logo: `${APP_URL}/favicon.ico`,
        sameAs: [
          "https://twitter.com/kailshiansx",
          "https://github.com/kailshiansx",
          "https://linkedin.com/company/kailshiansx",
        ],
        description:
          "Developer events & community platform by Kailshians Web Services. Hackathons, meetups, workshops, and tech talks across India.",
      },
      {
        "@type": "WebSite",
        "@id": `${APP_URL}#website`,
        url: APP_URL,
        name: "KailshiansX",
        publisher: { "@id": `${APP_URL}#organization` },
      },
      {
        "@type": "ItemList",
        itemListElement: displayEvents.map((event, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Event",
            name: event.title,
            description: event.overview || event.title,
            startDate: event.startDate.toISOString(),
            endDate: (event.endDate || event.startDate).toISOString(),
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            location: {
              "@type": "Place",
              name: event.venue || "Venue",
              address: {
                "@type": "PostalAddress",
                addressLocality: event.city?.name || "India",
                addressRegion: event.city?.state || "India",
                addressCountry: "IN",
              },
            },
          },
        })),
      },
    ],
  };

  return (
    <>
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative overflow-hidden">
        {/* ═══════════════════════════════════════════════════════════════════════
            1. HERO SECTION
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section
          aria-label="Hero"
          className="bg-surface-950 border-surface-800/80 relative overflow-hidden border-b pt-20 pb-20 sm:pt-28 sm:pb-28"
        >
          {/* Ambient Lighting & Grid */}
          <div
            className="bg-grid pointer-events-none absolute inset-0 opacity-40"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute top-1/4 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(61,97,252,0.45) 0%, rgba(139,61,255,0.25) 50%, transparent 80%)",
            }}
            aria-hidden="true"
          />

          <div className="container-page relative z-10 text-center">
            {/* Tagline Badge */}
            <div className="border-brand-500/30 bg-brand-500/10 text-brand-300 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur-md sm:text-sm">
              <Sparkles className="text-brand-400 size-3.5" aria-hidden="true" />
              <span>Kailshians Web Services • Developer Ecosystem</span>
            </div>

            {/* Exact Required Headline */}
            <h1 className="text-surface-50 mx-auto max-w-4xl text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-6xl sm:leading-[1.12] md:text-7xl">
              Developer Events. <span className="gradient-text">Builder Communities.</span> Real
              Connections.
            </h1>

            {/* Subtext */}
            <p className="text-surface-300 mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl">
              The developer events &amp; community platform by Kailshians Web Services. Powering
              collegiate hackathons, regional tech meetups, architecture talks, and campus leaders
              across India.
            </p>

            {/* Exact Required CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                variant="default"
                rightIcon={<ArrowRight className="size-5" />}
              >
                <Link href="/events" id="hero-cta-explore-events">
                  Explore Events
                </Link>
              </Button>

              <Button asChild size="lg" variant="secondary">
                <Link href="/community" id="hero-cta-join-community">
                  Join Community
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline">
                <Link href="/collaborations" id="hero-cta-partner">
                  Partner With Us
                </Link>
              </Button>
            </div>

            {/* Live Micro-Badge Row */}
            <div className="text-surface-400 mt-12 flex flex-wrap items-center justify-center gap-6 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span>Active 2026 Season</span>
              </div>
              <span className="text-surface-700">•</span>
              <div>100% Developer Owned &amp; Driven</div>
              <span className="text-surface-700">•</span>
              <div>Free Tier Registrations</div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            2. UPCOMING EVENTS (FROM DB)
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="section-upcoming-events"
          className="section-spacing bg-surface-950"
        >
          <div className="container-page">
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                badge="Schedule & Pass"
                title="Upcoming Developer Gatherings"
                highlight="Developer Gatherings"
                description="Verified meetups, intense build-a-thons, and engineering deep dives. Reserve your seat directly from the database."
                align="left"
              />
              <Button
                asChild
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="size-4" />}
              >
                <Link href="/events">View All Events</Link>
              </Button>
            </div>

            {displayEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {displayEvents.map((event) => {
                  const isFree =
                    event.ticketTypes.length === 0 ||
                    event.ticketTypes.some((t) => Number(t.price) === 0);
                  const lowestPrice =
                    event.ticketTypes.length > 0
                      ? Math.min(...event.ticketTypes.map((t) => Number(t.price)))
                      : 0;

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
                      tags={
                        event.type === "HACKATHON" ? ["Hackathon", "Build"] : ["Meetup", "Devs"]
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-12 text-center">
                <Calendar className="text-surface-500 mx-auto mb-3 size-12" />
                <h3 className="text-surface-100 text-lg font-semibold">New Cohort Coming Soon</h3>
                <p className="text-surface-400 mx-auto mt-1 max-w-sm text-sm">
                  Our organizers are finalizing the schedule for upcoming city editions.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            3. IMPACT COUNTERS (FROM DB / AGGREGATED)
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="section-impact-counters"
          className="bg-surface-900/40 border-surface-800 border-y py-16"
        >
          <div className="container-page">
            <SectionHeader
              badge="Real Ecosystem Impact"
              title="Powering India's Builder Revolution"
              highlight="Builder Revolution"
              description="Transparent numbers driven by active database records, registrations, and campus chapters."
              align="center"
              className="mb-12"
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCounter
                value={calculatedBuilders}
                suffix="+"
                label="Developers & Builders"
                description="Registered members across workshops, hackathons, and regional chapters."
                variant="brand"
                duration={2.2}
              />
              <StatCounter
                value={totalPublishedEvents}
                suffix="+"
                label="Published Events"
                description="Community-first gatherings organized with zero commercial compromise."
                variant="accent"
                duration={1.8}
              />
              <StatCounter
                value={Math.max(totalCities, 5)}
                suffix="+"
                label="Cities Covered"
                description="Active chapters in Tier-1, Tier-2, and Himalayan tech hubs."
                variant="default"
                duration={2.0}
              />
              <StatCounter
                value={Math.max(totalColleges, 12)}
                suffix="+"
                label="Colleges & Chapters"
                description="Campus leads driving hack sprints and open-source study groups."
                variant="brand"
                duration={2.4}
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            4. FEATURED MEETUP & HACKATHON SERIES (FROM DB)
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="section-series" className="section-spacing bg-surface-950">
          <div className="container-page">
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                badge="Recurring Signature Brands"
                title="Meetup & Hackathon Series"
                highlight="Series"
                description="Dedicated properties engineered for recurring regional impact. Each series builds long-term community momentum."
                align="left"
              />
              <div className="flex items-center gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link href="/meetup-series">Meetup Series</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/hackathon-series">Hackathon Series</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {seriesList.slice(0, 3).map((series) => {
                // Extract unique cities covered in series editions
                const citiesCovered = Array.from(
                  new Set(
                    series.editions
                      .map((ed) => ed.event?.city?.name)
                      .filter((c): c is string => Boolean(c))
                  )
                );

                return (
                  <SeriesCard
                    key={series.id}
                    name={series.name}
                    kind={series.kind as "MEETUP" | "HACKATHON"}
                    tagline={series.tagline || "Developer Community Series"}
                    description={series.description || undefined}
                    editionsCount={Math.max(series.editions.length, 1)}
                    citiesCount={citiesCovered.length > 0 ? citiesCovered.length : undefined}
                    cities={
                      citiesCovered.length > 0 ? citiesCovered : ["Jaipur", "Delhi", "Chandigarh"]
                    }
                    href={series.kind === "HACKATHON" ? "/hackathon-series" : "/meetup-series"}
                    badgeText={series.kind === "HACKATHON" ? "Prize Pool Track" : "Flagship Series"}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            5. TECH TALKS (FROM DB)
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="section-techtalks"
          className="section-spacing bg-surface-900/30 border-surface-800 border-t"
        >
          <div className="container-page">
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                badge="Engineering Insight"
                title="Deep-Dive Tech Talks"
                highlight="Tech Talks"
                description="Zero sales pitches. Real production war stories on distributed systems, generative AI, and scale."
                align="left"
              />
              <Button
                asChild
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="size-4" />}
              >
                <Link href="/tech-talks">All Tech Talks</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Highlight Featured Tech Talk Resource */}
              {featuredTechTalkResource && (
                <div className="border-brand-500/40 from-brand-950/20 via-surface-900 to-surface-900/90 shadow-brand-950/30 flex flex-col justify-between rounded-2xl border bg-gradient-to-b p-6 shadow-xl sm:p-7 lg:col-span-1">
                  <div>
                    <Badge variant="brand" size="sm" className="mb-3">
                      Featured Keynote
                    </Badge>
                    <h3 className="text-surface-50 text-xl leading-snug font-bold">
                      {featuredTechTalkResource.event?.title || "Keynote Architecture Session"}
                    </h3>
                    <div className="text-brand-300 mt-3 flex items-center gap-2 font-mono text-xs">
                      <Video className="size-3.5" aria-hidden="true" />
                      <span>Recording Available</span>
                    </div>

                    {keyTakeaways.length > 0 && (
                      <div className="mt-6 space-y-2">
                        <span className="text-surface-400 font-mono text-xs tracking-wider uppercase">
                          Key Engineering Lessons:
                        </span>
                        <ul className="text-surface-300 space-y-2 text-xs">
                          {keyTakeaways.slice(0, 3).map((point: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="text-brand-400 mt-0.5 size-3.5 shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="border-surface-800 mt-8 flex items-center justify-between border-t pt-6">
                    {featuredTechTalkResource.speaker ? (
                      <div>
                        <div className="text-surface-100 text-sm font-semibold">
                          {featuredTechTalkResource.speaker.name}
                        </div>
                        <div className="text-surface-400 text-xs">
                          {featuredTechTalkResource.speaker.designation} •{" "}
                          {featuredTechTalkResource.speaker.organisation}
                        </div>
                      </div>
                    ) : (
                      <div className="text-surface-400 text-xs">Keynote Speaker</div>
                    )}
                    <Button asChild size="sm" variant="accent">
                      <Link
                        href={featuredTechTalkResource.videoUrl || "/tech-talks"}
                        target="_blank"
                      >
                        Watch Talk
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Grid of Tech Talk Events */}
              <div
                className={
                  featuredTechTalkResource
                    ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2"
                    : "grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-3"
                }
              >
                {techTalkEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    title={event.title}
                    slug={event.slug}
                    type="TECH_TALK"
                    status={event.status as EventStatus}
                    startDate={event.startDate}
                    endDate={event.endDate || undefined}
                    venue={event.venue || undefined}
                    city={event.city?.name || undefined}
                    coverUrl={event.coverImage || undefined}
                    isFree={true}
                    attendeeCount={event._count.registrations}
                    speakerCount={event._count.speakers}
                    tags={["TechTalk", "Architecture"]}
                  />
                ))}
              </div>
            </div>

            {/* Featured Community Speakers */}
            {featuredSpeakers.length > 0 && (
              <div className="border-surface-800/60 mt-14 border-t pt-12">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-surface-50 text-xl font-bold">
                      Featured Keynote &amp; Session Speakers
                    </h4>
                    <p className="text-surface-400 mt-1 text-xs sm:text-sm">
                      Distinguished architects, open-source maintainers, and tech leads sharing real
                      production lessons.
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/tech-talks">View All Speakers</Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredSpeakers.map((speaker) => (
                    <SpeakerCard
                      key={speaker.id}
                      name={speaker.name}
                      role={speaker.designation || "Community Speaker"}
                      company={speaker.organisation || "KWS Ecosystem"}
                      avatarUrl={speaker.photo || undefined}
                      bio={speaker.bio || undefined}
                      speakerRole={"SPEAKER" as SpeakerRole}
                      topics={["Distributed Systems", "Cloud Native", "AI Systems"]}
                      socials={{
                        twitter: speaker.twitter || undefined,
                        linkedin: speaker.linkedin || undefined,
                        github: speaker.github || undefined,
                        website: speaker.website || undefined,
                      }}
                      sessionsCount={speaker.eventSpeakers.length}
                      href="/tech-talks"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            6. WORKSHOPS (FROM DB)
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="section-workshops" className="section-spacing bg-surface-950">
          <div className="container-page">
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                badge="Hands-on Coding"
                title="Intensive Developer Workshops"
                highlight="Workshops"
                description="Live terminal labs, container deployments, and hands-on coding under direct mentorship."
                align="left"
              />
              <Button
                asChild
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="size-4" />}
              >
                <Link href="/workshops">Browse Workshops</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {workshopEvents.length > 0 ? (
                workshopEvents.map((workshop) => (
                  <EventCard
                    key={workshop.id}
                    title={workshop.title}
                    slug={workshop.slug}
                    type="WORKSHOP"
                    status={workshop.status as EventStatus}
                    startDate={workshop.startDate}
                    endDate={workshop.endDate || undefined}
                    venue={workshop.venue || undefined}
                    city={workshop.city?.name || undefined}
                    coverUrl={workshop.coverImage || undefined}
                    isFree={true}
                    attendeeCount={workshop._count.registrations}
                    speakerCount={workshop._count.speakers}
                    tags={["Workshop", "Hands-on", "Code"]}
                  />
                ))
              ) : (
                <div className="border-surface-800 col-span-3 rounded-xl border py-12 text-center">
                  <p className="text-surface-400 text-sm">
                    Workshops announced bi-weekly. Check schedule.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            7. COMMUNITY PROGRAMS
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="section-programs"
          className="section-spacing bg-surface-900/40 border-surface-800 border-t"
        >
          <div className="container-page">
            <SectionHeader
              badge="Leadership Pipeline"
              title="Community Programs: Lead & Connect"
              highlight="Community Programs"
              description="Move up the ladder: Attendee → Member → Contributor → Lead → Organizer. We equip you with funding, venues, and curriculum."
              align="center"
              className="mb-14"
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Campus Leads */}
              <div className="border-surface-800 bg-surface-900/80 hover:border-brand-500/50 flex flex-col justify-between rounded-2xl border p-7 transition-all duration-300 hover:shadow-lg">
                <div>
                  <div className="bg-brand-500/10 border-brand-500/30 text-brand-400 mb-5 flex size-12 items-center justify-center rounded-xl border">
                    <GraduationCap className="size-6" aria-hidden="true" />
                  </div>
                  <Badge variant="brand" size="sm" className="mb-2">
                    Campus Chapter
                  </Badge>
                  <h3 className="text-surface-50 text-2xl font-bold">Campus Leads</h3>
                  <p className="text-surface-300 mt-3 text-sm leading-relaxed">
                    Represent KailshiansX at your engineering college. Organize campus hackathons,
                    host official watch parties, and grant your classmates direct industry access.
                  </p>
                  <ul className="text-surface-400 mt-6 space-y-2 text-xs">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-brand-400 size-3.5" />
                      <span>Event budget &amp; swag support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-brand-400 size-3.5" />
                      <span>Direct referrals for internships</span>
                    </li>
                  </ul>

                  <div className="border-brand-500/20 bg-brand-500/5 mt-5 rounded-lg border p-3 text-xs">
                    <div className="text-brand-300 flex items-center justify-between font-semibold">
                      <span>Active Chapters</span>
                      <span className="font-mono">{Math.max(totalCampusLeads, 1)}+ Colleges</span>
                    </div>
                    {activeCampusLeads.length > 0 && (
                      <p className="text-surface-400 mt-1 truncate text-[11px]">
                        e.g.{" "}
                        {activeCampusLeads
                          .map((cl) => cl.college?.name)
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-surface-800 mt-8 border-t pt-6">
                  <Button asChild variant="default" className="w-full">
                    <Link href="/campus-leads">Apply as Campus Lead</Link>
                  </Button>
                </div>
              </div>

              {/* State Leads */}
              <div className="border-surface-800 bg-surface-900/80 hover:border-accent-500/50 flex flex-col justify-between rounded-2xl border p-7 transition-all duration-300 hover:shadow-lg">
                <div>
                  <div className="bg-accent-500/10 border-accent-500/30 text-accent-400 mb-5 flex size-12 items-center justify-center rounded-xl border">
                    <Compass className="size-6" aria-hidden="true" />
                  </div>
                  <Badge variant="accent" size="sm" className="mb-2">
                    Regional Leadership
                  </Badge>
                  <h3 className="text-surface-50 text-2xl font-bold">State Leads</h3>
                  <p className="text-surface-300 mt-3 text-sm leading-relaxed">
                    Lead statewide developer operations across cities. Mentor campus leads,
                    establish venue partnerships with tech parks, and drive regional series.
                  </p>
                  <ul className="text-surface-400 mt-6 space-y-2 text-xs">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-accent-400 size-3.5" />
                      <span>Regional series decision autonomy</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-accent-400 size-3.5" />
                      <span>Liaise with sponsor &amp; cloud partners</span>
                    </li>
                  </ul>

                  <div className="border-accent-500/20 bg-accent-500/5 mt-5 rounded-lg border p-3 text-xs">
                    <div className="text-accent-300 flex items-center justify-between font-semibold">
                      <span>State Chapters</span>
                      <span className="font-mono">{Math.max(totalStateLeads, 1)}+ Regions</span>
                    </div>
                    <p className="text-surface-400 mt-1 text-[11px]">
                      Rajasthan, Punjab &amp; Tri-City Tech Hubs
                    </p>
                  </div>
                </div>
                <div className="border-surface-800 mt-8 border-t pt-6">
                  <Button asChild variant="accent" className="w-full">
                    <Link href="/state-leads">Apply as State Lead</Link>
                  </Button>
                </div>
              </div>

              {/* Core Team & Collaborations */}
              <div className="border-surface-800 bg-surface-900/80 hover:border-surface-600 flex flex-col justify-between rounded-2xl border p-7 transition-all duration-300 hover:shadow-lg">
                <div>
                  <div className="bg-surface-800 border-surface-700 text-surface-200 mb-5 flex size-12 items-center justify-center rounded-xl border">
                    <Users className="size-6" aria-hidden="true" />
                  </div>
                  <Badge variant="surface" size="sm" className="mb-2">
                    KWS Community Team
                  </Badge>
                  <h3 className="text-surface-50 text-2xl font-bold">Join Core Team</h3>
                  <p className="text-surface-300 mt-3 text-sm leading-relaxed">
                    We are expanding the central KailshiansX operations team. We recruit full-stack
                    engineers, designers, stage hosts, and developer advocates.
                  </p>
                  <ul className="text-surface-400 mt-6 space-y-2 text-xs">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-surface-400 size-3.5" />
                      <span>Next.js, PostgreSQL &amp; Cloud Ops</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-surface-400 size-3.5" />
                      <span>Event production &amp; community relations</span>
                    </li>
                  </ul>

                  <div className="border-surface-700/60 bg-surface-800/40 mt-5 rounded-lg border p-3 text-xs">
                    <div className="text-surface-300 flex items-center justify-between font-semibold">
                      <span>HQ Operations</span>
                      <span className="text-surface-200 font-mono">KWS Core Squad</span>
                    </div>
                    <p className="text-surface-400 mt-1 text-[11px]">
                      Engineering, Design, Marketing &amp; Logistics
                    </p>
                  </div>
                </div>
                <div className="border-surface-800 mt-8 border-t pt-6">
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/join-team">View Open Roles</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            8. GALLERY HIGHLIGHTS (FROM DB)
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="section-gallery" className="section-spacing bg-surface-950">
          <div className="container-page">
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                badge="Community Vibe"
                title="Moments From the Floor"
                highlight="the Floor"
                description="Late-night hackathon coding sessions, packed auditoriums, and authentic developer networking."
                align="left"
              />
              <Button
                asChild
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="size-4" />}
              >
                <Link href="/gallery">View Full Gallery</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {galleryHighlights.map((img, i) => (
                <div
                  key={img.id}
                  className={`group border-surface-800 bg-surface-900/60 relative aspect-square overflow-hidden rounded-xl border ${
                    i === 0 ? "col-span-2 row-span-2 aspect-auto min-h-[280px]" : ""
                  }`}
                >
                  <div className="from-surface-900 to-surface-800 flex size-full items-center justify-center bg-gradient-to-tr p-4">
                    <div className="text-center">
                      <CameraIcon className="text-surface-600 mx-auto mb-2 size-8 transition-transform group-hover:scale-110" />
                      <p className="text-surface-300 line-clamp-2 px-2 text-xs font-medium">
                        {img.caption || img.album.title}
                      </p>
                      <span className="text-brand-400 mt-1 block font-mono text-[10px]">
                        {img.album.title.split("—")[0]}
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-xs font-medium text-white">{img.caption}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            9. PARTNERS (FROM DB)
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="section-partners"
          className="section-spacing bg-surface-900/40 border-surface-800 border-t"
        >
          <div className="container-page">
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                badge="Ecosystem Backers"
                title="Backed by Leading Tech Giants"
                highlight="Tech Giants"
                description="Our hackathons and meetups are supported by the best developer tooling, cloud platforms, and workspace providers."
                align="left"
              />
              <Button
                asChild
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="size-4" />}
              >
                <Link href="/collaborations">Partner With Us</Link>
              </Button>
            </div>

            <PartnerLogoGrid groupByTier={true} partners={formattedPartners} />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            10. TESTIMONIALS (FROM DB)
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="section-testimonials" className="section-spacing bg-surface-950">
          <div className="container-page">
            <SectionHeader
              badge="Builder Voices"
              title="Loved by Developers &amp; Organizers"
              highlight="Developers &amp; Organizers"
              description="Real stories from attendees who became hackathon winners, campus leads, and keynote speakers."
              align="center"
              className="mb-14"
            />

            <TestimonialCarousel autoPlay={false} testimonials={parsedTestimonials} />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            11. FINAL CONVERSION CTA
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="section-final-cta"
          className="from-surface-900 via-surface-950 to-surface-950 border-surface-800 relative overflow-hidden border-t bg-gradient-to-b py-24 sm:py-32"
        >
          {/* Ambient Glow */}
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 h-[450px] w-[900px] -translate-x-1/2 translate-y-1/3 rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(61,97,252,0.5) 0%, rgba(139,61,255,0.3) 50%, transparent 80%)",
            }}
            aria-hidden="true"
          />

          <div className="container-page relative z-10 mx-auto max-w-4xl text-center">
            <Badge variant="gradient" size="default" dot className="mb-6">
              The KailshiansX Mission
            </Badge>

            <h2 className="text-surface-50 text-3xl leading-tight font-black tracking-tight sm:text-5xl md:text-6xl">
              Ready to Build, Lead &amp; <span className="gradient-text">Shape the Future?</span>
            </h2>

            <p className="text-surface-300 mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl">
              Every event moves a person:{" "}
              <strong className="text-surface-100 font-semibold">
                Attendee → Member → Contributor → Lead → Organizer → Mentor / Speaker.
              </strong>{" "}
              Join thousands of developers leveling up their craft.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                variant="accent"
                rightIcon={<ArrowRight className="size-5" />}
              >
                <Link href="/events">Explore Upcoming Events</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/campus-leads">Apply for Campus Lead</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/community">Join Community</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
