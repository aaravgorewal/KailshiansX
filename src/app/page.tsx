import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Compass,
  ArrowRight,
  GraduationCap,
  Video,
  CheckCircle2,
  Users,
} from "lucide-react";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard, type EventType, type EventStatus } from "@/components/ui/EventCard";
import { SeriesCard } from "@/components/ui/SeriesCard";
import { SpeakerCard, type SpeakerRole } from "@/components/ui/SpeakerCard";
import { PartnerLogoGrid, type PartnerTier } from "@/components/ui/PartnerLogoGrid";
import { StatCounter } from "@/components/ui/StatCounter";
import { TestimonialCarousel, type TestimonialItem } from "@/components/ui/TestimonialCarousel";
import { cn } from "@/lib/utils";

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

  const showImpactCounters =
    totalRegistrations > 0 || totalPublishedEvents > 0 || totalCities > 0 || totalColleges > 0;

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

  const activeStateLeads = await db.stateLead.findMany({
    where: { status: "ACTIVE" },
    select: { state: true },
    take: 4,
  });
  const stateRegions = Array.from(
    new Set(activeStateLeads.map((s) => s.state).filter(Boolean) as string[])
  );

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
    const tier = (p.eventPartners[0]?.tier as PartnerTier) || "COMMUNITY";
    return {
      id: p.id,
      name: p.name,
      websiteUrl: p.website || undefined,
      logoUrl: p.logo || undefined,
      tier,
    };
  });

  // ─── 9. Query Testimonials (Only Published records from DB) ─────────────────
  const testimonialBlocks = await db.contentBlock.findMany({
    where: {
      page: { slug: "home", isPublished: true },
      type: "TESTIMONIAL",
      isVisible: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  const parsedTestimonials: TestimonialItem[] = testimonialBlocks.map((block) => {
    const d = block.data as Record<string, unknown>;
    return {
      id: block.id,
      quote: (d.quote as string) || "",
      author: (d.author as string) || "Developer",
      role: (d.role as string) || "",
      company: (d.company as string) || "",
      avatarUrl: (d.avatarUrl as string) || undefined,
      rating: (d.rating as number) || 5,
      eventTitle: (d.eventTitle as string) || undefined,
    };
  });

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

      <div className="relative">
        {/* ═══════════════════════════════════════════════════════════════════════
            1. HERO SECTION
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section
          aria-label="Hero"
          className="border-border bg-background border-b pt-20 pb-20 sm:pt-28 sm:pb-28"
        >
          <div className="container-page relative z-10 text-center lg:text-left">
            {/* Eyebrow Badge (Hero only) */}
            <Badge variant="neutral" className="mb-6">
              Kailshians Web Services • Developer Ecosystem
            </Badge>

            {/* Exact Required Headline */}
            <h1 className="text-foreground max-w-4xl text-4xl font-extrabold tracking-tight [overflow-wrap:anywhere] sm:text-6xl sm:leading-[1.12] md:text-7xl">
              Developer Events. Builder Communities. Real Connections.
            </h1>

            {/* Subtext */}
            <p className="text-muted-foreground mt-6 max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl">
              The developer events &amp; community platform by Kailshians Web Services. Powering
              collegiate hackathons, regional tech meetups, architecture talks, and campus leaders
              across India.
            </p>

            {/* Exact Required CTAs: primary, secondary, ghost (stack on mobile) */}
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4 lg:justify-start">
              <Button asChild size="lg" variant="primary">
                <Link href="/events" id="hero-cta-explore-events">
                  Explore Events
                </Link>
              </Button>

              <Button asChild size="lg" variant="secondary">
                <Link href="/community" id="hero-cta-join-community">
                  Join Community
                </Link>
              </Button>

              <Button asChild size="lg" variant="ghost">
                <Link href="/collaborations" id="hero-cta-partner">
                  Partner With Us
                </Link>
              </Button>
            </div>

            {/* Live Micro-Badge Row */}
            <div className="text-muted-foreground mt-10 flex flex-wrap items-center justify-center gap-4 font-mono text-xs lg:justify-start">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="bg-success relative inline-flex size-2 rounded-full" />
                </span>
                <span>Active 2026 Season</span>
              </div>
              <span>•</span>
              <div>100% Developer Owned &amp; Driven</div>
              <span>•</span>
              <div>Free Tier Registrations</div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            2. UPCOMING EVENTS (FROM DB)
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="section-upcoming-events" className="bg-background py-16 sm:py-20">
          <div className="container-page">
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                title="Upcoming Developer Gatherings"
                description="Verified meetups, intense build-a-thons, and engineering deep dives. Reserve your seat directly from the database."
                align="left"
              />
              <Button
                asChild
                variant="secondary"
                size="sm"
                rightIcon={<ArrowRight className="size-4" />}
              >
                <Link href="/events">View All Events</Link>
              </Button>
            </div>

            {displayEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {displayEvents.map((event, index) => {
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
                      priority={index === 0}
                      tags={
                        event.type === "HACKATHON" ? ["Hackathon", "Build"] : ["Meetup", "Devs"]
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="text-muted-foreground mx-auto mb-3 size-12" />
                <h3 className="text-foreground text-lg font-semibold">New Cohort Coming Soon</h3>
                <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
                  Our organizers are finalizing the schedule for upcoming city editions.
                </p>
              </Card>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            3. IMPACT COUNTERS (py-12, plain numbers, muted labels, border-y)
        ═══════════════════════════════════════════════════════════════════════════ */}
        {showImpactCounters && (
          <section
            aria-labelledby="section-impact-counters"
            className="border-border bg-card border-y py-12"
          >
            <div className="container-page">
              <SectionHeader
                title="Powering India's Builder Revolution"
                description="Transparent numbers driven by active database records, registrations, and campus chapters."
                align="center"
                className="mb-10"
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {totalRegistrations > 0 && (
                  <StatCounter
                    value={totalRegistrations}
                    suffix="+"
                    label="Registrations"
                    description="Registered participants across workshops, hackathons, and regional chapters."
                    duration={2.2}
                  />
                )}
                {totalPublishedEvents > 0 && (
                  <StatCounter
                    value={totalPublishedEvents}
                    suffix="+"
                    label="Published Events"
                    description="Community-first gatherings organized with zero commercial compromise."
                    duration={1.8}
                  />
                )}
                {totalCities > 0 && (
                  <StatCounter
                    value={totalCities}
                    suffix="+"
                    label="Cities Covered"
                    description="Active chapters in Tier-1, Tier-2, and regional tech hubs."
                    duration={2.0}
                  />
                )}
                {totalColleges > 0 && (
                  <StatCounter
                    value={totalColleges}
                    suffix="+"
                    label="Colleges & Chapters"
                    description="Campus leads driving hack sprints and open-source study groups."
                    duration={2.4}
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            4. FEATURED MEETUP & HACKATHON SERIES (FROM DB)
        ═══════════════════════════════════════════════════════════════════════════ */}
        {seriesList.length > 0 && (
          <section aria-labelledby="section-series" className="bg-background py-16 sm:py-20">
            <div className="container-page">
              <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <SectionHeader
                  title="Meetup & Hackathon Series"
                  description="Dedicated properties engineered for recurring regional impact. Each series builds long-term community momentum."
                  align="left"
                />
                <div className="flex items-center gap-3">
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/meetup-series">Meetup Series</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/hackathon-series">Hackathon Series</Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {seriesList.slice(0, 3).map((series) => {
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
                      editionsCount={series.editions.length}
                      citiesCount={citiesCovered.length > 0 ? citiesCovered.length : undefined}
                      cities={citiesCovered}
                      href={series.kind === "HACKATHON" ? "/hackathon-series" : "/meetup-series"}
                      badgeText={
                        series.kind === "HACKATHON" ? "Prize Pool Track" : "Flagship Series"
                      }
                    />
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            5. TECH TALKS (FROM DB)
        ═══════════════════════════════════════════════════════════════════════════ */}
        {(techTalkEvents.length > 0 || featuredTechTalkResource) && (
          <section
            aria-labelledby="section-techtalks"
            className="border-border bg-card/40 border-t py-16 sm:py-20"
          >
            <div className="container-page">
              <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <SectionHeader
                  title="Deep-Dive Tech Talks"
                  description="Zero sales pitches. Real production war stories on distributed systems, generative AI, and scale."
                  align="left"
                />
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  rightIcon={<ArrowRight className="size-4" />}
                >
                  <Link href="/tech-talks">All Tech Talks</Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Highlight Featured Tech Talk Resource */}
                {featuredTechTalkResource && (
                  <Card className="flex flex-col justify-between p-6 sm:p-7 lg:col-span-1">
                    <div>
                      <Badge variant="neutral" size="sm" className="mb-3">
                        Featured Keynote
                      </Badge>
                      <h3 className="text-foreground text-xl leading-snug font-bold">
                        {featuredTechTalkResource.event?.title || "Keynote Architecture Session"}
                      </h3>
                      <div className="text-muted-foreground mt-3 flex items-center gap-2 font-mono text-xs">
                        <Video className="text-foreground size-3.5" aria-hidden="true" />
                        <span>Recording Available</span>
                      </div>

                      {keyTakeaways.length > 0 && (
                        <div className="mt-6 space-y-2">
                          <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
                            Key Engineering Lessons:
                          </span>
                          <ul className="text-muted-foreground space-y-2 text-xs">
                            {keyTakeaways.slice(0, 3).map((point: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="text-foreground mt-0.5 size-3.5 shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="border-border mt-8 flex items-center justify-between border-t pt-6">
                      {featuredTechTalkResource.speaker ? (
                        <div>
                          <div className="text-foreground text-sm font-semibold">
                            {featuredTechTalkResource.speaker.name}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {featuredTechTalkResource.speaker.designation} •{" "}
                            {featuredTechTalkResource.speaker.organisation}
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-xs">Keynote Speaker</div>
                      )}
                      <Button asChild size="sm" variant="secondary">
                        <Link
                          href={featuredTechTalkResource.videoUrl || "/tech-talks"}
                          target="_blank"
                        >
                          Watch Talk
                        </Link>
                      </Button>
                    </div>
                  </Card>
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
                <div className="border-border mt-14 border-t pt-12">
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-foreground text-xl font-bold">
                        Featured Keynote &amp; Session Speakers
                      </h4>
                      <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                        Distinguished architects, open-source maintainers, and tech leads sharing
                        real production lessons.
                      </p>
                    </div>
                    <Button asChild variant="secondary" size="sm">
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
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            6. WORKSHOPS (FROM DB)
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="section-workshops" className="bg-background py-16 sm:py-20">
          <div className="container-page">
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeader
                title="Intensive Developer Workshops"
                description="Live terminal labs, container deployments, and hands-on coding under direct mentorship."
                align="left"
              />
              <Button
                asChild
                variant="secondary"
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
                <Card className="col-span-3 py-12 text-center">
                  <p className="text-muted-foreground text-sm">
                    Workshops announced bi-weekly. Check schedule.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            7. COMMUNITY PROGRAMS (Campus, State, Core Team using shared Card)
        ═══════════════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="section-programs"
          className="border-border bg-card/40 border-t py-16 sm:py-20"
        >
          <div className="container-page">
            <SectionHeader
              title="Community Programs: Lead & Connect"
              description="Move up the ladder: Attendee → Member → Contributor → Lead → Organizer. We equip you with funding, venues, and curriculum."
              align="center"
              className="mb-14"
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Campus Leads */}
              <Card className="flex flex-col justify-between p-6 sm:p-7">
                <div>
                  <div className="border-border bg-muted text-foreground mb-5 flex size-12 items-center justify-center rounded-lg border">
                    <GraduationCap className="size-6" aria-hidden="true" />
                  </div>
                  <Badge variant="neutral" size="sm" className="mb-2">
                    Campus Chapter
                  </Badge>
                  <h3 className="text-foreground text-2xl font-bold">Campus Leads</h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    Represent KailshiansX at your engineering college. Organize campus hackathons,
                    host official watch parties, and grant your classmates direct industry access.
                  </p>
                  <ul className="text-muted-foreground mt-6 space-y-2 text-xs">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-foreground size-3.5" />
                      <span>Event budget &amp; swag support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-foreground size-3.5" />
                      <span>Direct referrals for internships</span>
                    </li>
                  </ul>

                  <div className="border-border bg-muted mt-5 rounded-lg border p-3 text-xs">
                    <div className="text-foreground flex items-center justify-between font-semibold">
                      <span>Active Chapters</span>
                      <span className="text-muted-foreground font-mono">
                        {totalCampusLeads > 0
                          ? `${totalCampusLeads}+ Colleges`
                          : "Applications Open"}
                      </span>
                    </div>
                    {activeCampusLeads.length > 0 ? (
                      <p className="text-muted-foreground mt-1 truncate text-xs">
                        e.g.{" "}
                        {activeCampusLeads
                          .map((cl) => cl.college?.name)
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    ) : (
                      <p className="text-muted-foreground mt-1 text-xs">
                        New campus chapters opening soon
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-border mt-8 border-t pt-6">
                  <Button asChild variant="primary" className="w-full">
                    <Link href="/campus-leads">Apply as Campus Lead</Link>
                  </Button>
                </div>
              </Card>

              {/* State Leads */}
              <Card className="flex flex-col justify-between p-6 sm:p-7">
                <div>
                  <div className="border-border bg-muted text-foreground mb-5 flex size-12 items-center justify-center rounded-lg border">
                    <Compass className="size-6" aria-hidden="true" />
                  </div>
                  <Badge variant="neutral" size="sm" className="mb-2">
                    Regional Leadership
                  </Badge>
                  <h3 className="text-foreground text-2xl font-bold">State Leads</h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    Lead statewide developer operations across cities. Mentor campus leads,
                    establish venue partnerships with tech parks, and drive regional series.
                  </p>
                  <ul className="text-muted-foreground mt-6 space-y-2 text-xs">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-foreground size-3.5" />
                      <span>Regional series decision autonomy</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-foreground size-3.5" />
                      <span>Liaise with sponsor &amp; cloud partners</span>
                    </li>
                  </ul>

                  <div className="border-border bg-muted mt-5 rounded-lg border p-3 text-xs">
                    <div className="text-foreground flex items-center justify-between font-semibold">
                      <span>State Chapters</span>
                      <span className="text-muted-foreground font-mono">
                        {totalStateLeads > 0 ? `${totalStateLeads}+ Regions` : "Applications Open"}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {stateRegions.length > 0
                        ? `${stateRegions.join(", ")} Chapters`
                        : "Regional chapters opening nationwide"}
                    </p>
                  </div>
                </div>
                <div className="border-border mt-8 border-t pt-6">
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/state-leads">Apply as State Lead</Link>
                  </Button>
                </div>
              </Card>

              {/* Core Team & Collaborations */}
              <Card className="flex flex-col justify-between p-6 sm:p-7">
                <div>
                  <div className="border-border bg-muted text-foreground mb-5 flex size-12 items-center justify-center rounded-lg border">
                    <Users className="size-6" aria-hidden="true" />
                  </div>
                  <Badge variant="neutral" size="sm" className="mb-2">
                    KWS Community Team
                  </Badge>
                  <h3 className="text-foreground text-2xl font-bold">Join Core Team</h3>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    We are expanding the central KailshiansX operations team. We recruit full-stack
                    engineers, designers, stage hosts, and developer advocates.
                  </p>
                  <ul className="text-muted-foreground mt-6 space-y-2 text-xs">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-foreground size-3.5" />
                      <span>Next.js, PostgreSQL &amp; Cloud Ops</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="text-foreground size-3.5" />
                      <span>Event production &amp; community relations</span>
                    </li>
                  </ul>

                  <div className="border-border bg-muted mt-5 rounded-lg border p-3 text-xs">
                    <div className="text-foreground flex items-center justify-between font-semibold">
                      <span>HQ Operations</span>
                      <span className="text-muted-foreground font-mono">KWS Core Squad</span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Engineering, Design, Marketing &amp; Logistics
                    </p>
                  </div>
                </div>
                <div className="border-border mt-8 border-t pt-6">
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/join-team">View Open Roles</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            8. GALLERY HIGHLIGHTS (pt-12 pb-20, hide if empty, first tile 2x2 sm+)
        ═══════════════════════════════════════════════════════════════════════ */}
        {galleryHighlights.length > 0 && (
          <section aria-labelledby="section-gallery" className="bg-background pt-12 pb-20">
            <div className="container-page">
              <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <SectionHeader
                  title="Moments From the Floor"
                  description="Late-night hackathon coding sessions, packed auditoriums, and authentic developer networking."
                  align="left"
                />
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  rightIcon={<ArrowRight className="size-4" />}
                >
                  <Link href="/gallery">View Full Gallery</Link>
                </Button>
              </div>

              <div className="grid [grid-template-columns:repeat(1,minmax(0,1fr))] gap-4 sm:[grid-template-columns:repeat(3,minmax(0,1fr))] lg:[grid-template-columns:repeat(4,minmax(0,1fr))]">
                {galleryHighlights.map((img, i) => (
                  <div
                    key={img.id}
                    className={cn(
                      "group border-border bg-card relative min-w-0 overflow-hidden rounded-lg border",
                      i === 0
                        ? "col-span-1 aspect-auto min-h-[280px] sm:col-span-2 sm:row-span-2"
                        : "aspect-square"
                    )}
                  >
                    {img.url ? (
                      <Image
                        src={img.url}
                        alt={img.caption || img.album.title || "Community photo"}
                        fill
                        sizes={
                          i === 0
                            ? "(max-width: 640px) 100vw, 66vw"
                            : "(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                        }
                        className="object-cover transition-opacity duration-150 group-hover:opacity-90"
                      />
                    ) : (
                      <div className="bg-muted flex size-full items-center justify-center p-4">
                        <CameraIcon className="text-muted-foreground size-8" />
                      </div>
                    )}
                    <div className="border-border bg-card/90 absolute inset-x-0 bottom-0 border-t p-3 backdrop-blur-sm">
                      <p className="text-foreground line-clamp-1 text-xs font-medium">
                        {img.caption || img.album.title}
                      </p>
                      <span className="text-muted-foreground mt-0.5 block font-mono text-xs">
                        {img.album.title.split("—")[0].trim()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            9. PARTNERS (FROM DB — Render ONLY if real records exist)
        ═══════════════════════════════════════════════════════════════════════ */}
        {formattedPartners.length > 0 && (
          <section
            aria-labelledby="section-partners"
            className="border-border bg-card/40 border-t py-16 sm:py-20"
          >
            <div className="container-page">
              <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <SectionHeader
                  title="Backed by Leading Tech Giants"
                  description="Our hackathons and meetups are supported by the best developer tooling, cloud platforms, and workspace providers."
                  align="left"
                />
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  rightIcon={<ArrowRight className="size-4" />}
                >
                  <Link href="/collaborations">Partner With Us</Link>
                </Button>
              </div>

              <PartnerLogoGrid groupByTier={true} partners={formattedPartners} />
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            10. TESTIMONIALS (FROM DB — Render ONLY if real records exist)
        ═══════════════════════════════════════════════════════════════════════ */}
        {parsedTestimonials.length > 0 && (
          <section aria-labelledby="section-testimonials" className="bg-background py-16 sm:py-20">
            <div className="container-page">
              <SectionHeader
                title="Loved by Developers &amp; Organizers"
                description="Real stories from attendees who became hackathon winners, campus leads, and keynote speakers."
                align="center"
                className="mb-14"
              />

              <TestimonialCarousel autoPlay={false} testimonials={parsedTestimonials} />
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            11. FINAL CONVERSION CTA (py-24, simple bordered block, primary + secondary)
        ═══════════════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="section-final-cta"
          className="border-border bg-background border-t py-24"
        >
          <div className="container-page mx-auto max-w-4xl">
            <div className="border-border bg-card rounded-lg border p-8 text-center sm:p-12">
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-4xl">
                Ready to Build, Lead &amp; Shape the Future?
              </h2>

              <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed">
                Every event moves a person:{" "}
                <strong className="text-foreground font-semibold">
                  Attendee → Member → Contributor → Lead → Organizer → Mentor / Speaker.
                </strong>{" "}
                Join thousands of developers leveling up their craft.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="primary"
                  rightIcon={<ArrowRight className="size-5" />}
                >
                  <Link href="/events">Explore Upcoming Events</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/community">Join Community</Link>
                </Button>
              </div>
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
