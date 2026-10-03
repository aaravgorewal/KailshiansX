import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, Sparkles, ArrowRight, Building } from "lucide-react";
import { getSeriesBySlug } from "@/server/events/series";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

interface MeetupSeriesDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: MeetupSeriesDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSeriesBySlug(slug);

  if (!data || !data.series) {
    return { title: "Meetup Series Not Found | KailshiansX" };
  }

  const { series } = data;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";
  const ogImage = series.coverImage || "/og-image.png";

  return {
    title: `${series.name} — Developer Meetup Series | KailshiansX`,
    description:
      series.tagline ||
      series.purpose ||
      `Explore past and upcoming editions of ${series.name} by KailshiansX.`,
    alternates: {
      canonical: `${APP_URL}/meetup-series/${series.slug}`,
    },
    openGraph: {
      title: `${series.name} — ${series.region || series.city || "Developer Meetup"}`,
      description: series.purpose || `Developer events, talks, and community by KailshiansX.`,
      url: `${APP_URL}/meetup-series/${series.slug}`,
      siteName: "KailshiansX",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: series.name,
      description: series.tagline || series.purpose || `Meetup series by KailshiansX.`,
      images: [ogImage],
    },
  };
}

export default async function MeetupSeriesDetailPage({ params }: MeetupSeriesDetailPageProps) {
  const { slug } = await params;
  const data = await getSeriesBySlug(slug);

  if (!data || !data.series || data.series.kind !== "MEETUP") {
    notFound();
  }

  const { series, editions, stats, nextEdition, allSpeakers, allPartners, allGalleryImages } = data;

  return (
    <div className="bg-surface-950 min-h-screen pb-28">
      {/* Top Breadcrumb Header */}
      <div className="border-surface-800 bg-surface-950/60 border-b backdrop-blur-md">
        <div className="container-page mx-auto max-w-5xl px-4 py-3">
          <Link
            href="/meetup-series"
            className="text-surface-400 hover:text-surface-100 inline-flex items-center gap-1.5 text-xs font-semibold transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Meetup Series</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="border-surface-800/80 from-surface-900/80 via-surface-950 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b pt-12 pb-14 sm:pt-20 sm:pb-20">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 size-[500px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "#3d61fc" }}
        />

        <div className="container-page relative z-10 mx-auto max-w-5xl space-y-8 px-4">
          {/* Identity & Badges */}
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="from-brand-600 to-accent-600 border-surface-700 flex size-20 shrink-0 items-center justify-center rounded-3xl border-2 bg-gradient-to-tr via-indigo-600 text-3xl font-black text-white shadow-2xl sm:size-24">
                {series.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand" className="text-xs">
                    Meetup Brand Property
                  </Badge>
                  {series.region && (
                    <Badge
                      variant="outline"
                      className="border-surface-700 text-surface-300 text-xs"
                    >
                      {series.region}
                    </Badge>
                  )}
                </div>

                <h1 className="text-surface-50 text-3xl font-extrabold tracking-tight sm:text-5xl">
                  {series.name}
                </h1>

                {series.city && (
                  <p className="text-surface-400 flex items-center gap-1.5 text-xs font-medium sm:text-sm">
                    <MapPin className="size-3.5 shrink-0 text-rose-400" />
                    <span>Anchored in {series.city}, India</span>
                  </p>
                )}
              </div>
            </div>

            {nextEdition && (
              <Button asChild variant="primary" size="md" className="shadow-brand-500/20 shadow-lg">
                <Link href={`/events/${nextEdition.event.slug}/register`}>
                  <span>RSVP for Edition {nextEdition.editionNo}</span>
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Tagline & Deep Purpose Narrative */}
          <div className="border-surface-800 bg-surface-900/60 space-y-4 rounded-3xl border p-6 backdrop-blur-md sm:p-8">
            {series.tagline && (
              <h2 className="text-brand-300 text-lg font-bold">{series.tagline}</h2>
            )}
            <p className="text-surface-300 max-w-4xl text-xs leading-relaxed sm:text-sm">
              {series.purpose || series.description}
            </p>
          </div>

          {/* Impact Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="border-surface-800 bg-surface-900/40 rounded-2xl border p-4">
              <span className="text-brand-400 text-2xl font-black sm:text-3xl">
                {stats.totalEditions}
              </span>
              <p className="text-surface-400 mt-0.5 text-[11px] font-medium tracking-wider uppercase">
                Editions Held
              </p>
            </div>

            <div className="border-surface-800 bg-surface-900/40 rounded-2xl border p-4">
              <span className="text-2xl font-black text-emerald-400 sm:text-3xl">
                {stats.totalAttendees}+
              </span>
              <p className="text-surface-400 mt-0.5 text-[11px] font-medium tracking-wider uppercase">
                Builders Engaged
              </p>
            </div>

            <div className="border-surface-800 bg-surface-900/40 rounded-2xl border p-4">
              <span className="text-2xl font-black text-indigo-400 sm:text-3xl">
                {stats.totalSpeakers}
              </span>
              <p className="text-surface-400 mt-0.5 text-[11px] font-medium tracking-wider uppercase">
                Speakers Featured
              </p>
            </div>

            <div className="border-surface-800 bg-surface-900/40 rounded-2xl border p-4">
              <span className="text-surface-100 text-2xl font-black sm:text-3xl">
                {stats.totalPartners}
              </span>
              <p className="text-surface-400 mt-0.5 text-[11px] font-medium tracking-wider uppercase">
                Ecosystem Partners
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container-page mx-auto max-w-5xl space-y-16 px-4 pt-14">
        {/* Next Edition Highlight Card */}
        {nextEdition ? (
          <section className="border-brand-500/40 from-surface-900 via-surface-900/90 to-brand-950/20 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-2xl sm:p-9">
            <div className="bg-brand-500/10 pointer-events-none absolute -right-10 -bottom-10 size-52 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="gap-1.5 py-1">
                  <Sparkles className="size-3" />
                  <span>
                    Next Gathering — Edition {String(nextEdition.editionNo).padStart(2, "0")}
                  </span>
                </Badge>
                <Badge variant="success">Registrations Open</Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-surface-50 text-2xl font-bold sm:text-3xl">
                  {nextEdition.event.title}
                </h3>
                {nextEdition.theme && (
                  <p className="text-brand-300 text-xs font-semibold">Theme: {nextEdition.theme}</p>
                )}
                {nextEdition.event.overview && (
                  <p className="text-surface-300 max-w-3xl text-xs leading-relaxed sm:text-sm">
                    {nextEdition.event.overview}
                  </p>
                )}
              </div>

              {/* Date, Time & Venue */}
              <div className="text-surface-300 flex flex-wrap items-center gap-6 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="text-brand-400 size-4" />
                  <span>
                    {new Date(nextEdition.event.startDate).toLocaleDateString("en-IN", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="text-surface-400 size-4" />
                  <span>
                    {new Date(nextEdition.event.startDate).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-rose-400" />
                  <span>
                    {nextEdition.event.venue || "Community Space"},{" "}
                    {nextEdition.event.city?.name || "India"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Button asChild variant="primary" size="md">
                  <Link href={`/events/${nextEdition.event.slug}/register`}>
                    <span>Claim Your Free Pass</span>
                    <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>

                <Button asChild variant="secondary" size="md">
                  <Link href={`/events/${nextEdition.event.slug}`}>
                    <span>View Agenda & Speakers</span>
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <section className="border-surface-800 bg-surface-900/40 space-y-3 rounded-3xl border p-8 text-center">
            <h3 className="text-surface-100 text-base font-bold">Next Edition in Planning</h3>
            <p className="text-surface-400 mx-auto max-w-md text-xs">
              Our community team is curating the agenda and venue for the upcoming edition. Want to
              propose a tech talk or host this series at your college auditorium?
            </p>
            <div className="pt-2">
              <Button asChild variant="secondary" size="sm">
                <Link href="/collaborations">
                  <span>Propose a Session / Partner With Us</span>
                </Link>
              </Button>
            </div>
          </section>
        )}

        {/* Editions Timeline (PRD §8) */}
        <section className="space-y-6">
          <div className="border-surface-800 flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-surface-100 text-xl font-bold">Editions Timeline</h2>
              <p className="text-surface-400 text-xs">
                The chronological history of {series.name} gatherings
              </p>
            </div>
            <span className="text-surface-500 font-mono text-xs">
              {editions.length} Recorded Editions
            </span>
          </div>

          <div className="border-surface-800 relative space-y-8 border-l pl-6 sm:pl-8">
            {editions.map((edition) => {
              const startDate = new Date(edition.event.startDate);
              const dateStr = startDate.toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const isPast = startDate < new Date();

              return (
                <div key={edition.id} className="group relative">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute top-1.5 -left-[31px] size-4 rounded-full border-2 transition-all sm:-left-[39px] ${
                      isPast
                        ? "bg-surface-950 border-surface-600 group-hover:border-brand-500"
                        : "bg-brand-500 border-surface-950 shadow-brand-500/50 shadow-md"
                    }`}
                  />

                  <div className="border-surface-800 bg-surface-900/60 group-hover:border-surface-700 space-y-4 rounded-3xl border p-6 backdrop-blur-sm transition-all sm:p-7">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="surface" className="font-mono text-xs">
                          Edition {String(edition.editionNo).padStart(2, "0")}
                        </Badge>
                        {edition.theme && (
                          <Badge variant="outline" className="border-brand-500/30 text-brand-300">
                            {edition.theme}
                          </Badge>
                        )}
                        {!isPast && <Badge variant="success">Upcoming</Badge>}
                      </div>

                      <span className="text-surface-400 text-xs font-medium">{dateStr}</span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-surface-100 group-hover:text-brand-300 text-lg font-bold transition-colors">
                        {edition.event.title}
                      </h3>
                      {edition.event.overview && (
                        <p className="text-surface-400 line-clamp-2 text-xs leading-relaxed">
                          {edition.event.overview}
                        </p>
                      )}
                    </div>

                    {/* Venue & Speaker Teasers */}
                    <div className="border-surface-800/80 text-surface-400 flex flex-wrap items-center justify-between gap-4 border-t pt-2 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="size-3.5 shrink-0 text-rose-400" />
                        <span className="truncate">
                          {edition.event.venue || "Campus Lab"},{" "}
                          {edition.event.city?.name || "India"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-surface-500">
                          {edition.event.speakers.length} Speakers
                        </span>
                        <Link
                          href={`/events/${edition.event.slug}`}
                          className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-1 font-semibold"
                        >
                          <span>{isPast ? "View Recap & Slides" : "View Agenda"}</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Speakers Pool Across Editions */}
        {allSpeakers.length > 0 && (
          <section className="space-y-6">
            <div className="border-surface-800 border-b pb-3">
              <h2 className="text-surface-100 text-xl font-bold">Featured Series Speakers</h2>
              <p className="text-surface-400 text-xs">
                Practitioners and engineers who have shared knowledge at {series.name}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {allSpeakers.map((speaker) => (
                <div
                  key={speaker.id}
                  className="border-surface-800 bg-surface-900/60 flex flex-col justify-between space-y-3 rounded-2xl border p-4"
                >
                  <div className="space-y-3">
                    <div className="from-brand-600 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr to-indigo-600 text-sm font-bold text-white shadow-inner">
                      {speaker.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <h4 className="text-surface-100 text-sm font-bold">{speaker.name}</h4>
                      <p className="text-brand-300 truncate text-xs">
                        {speaker.designation}{" "}
                        {speaker.organisation ? `@ ${speaker.organisation}` : ""}
                      </p>
                    </div>

                    {speaker.bio && (
                      <p className="text-surface-400 line-clamp-2 text-[11px] leading-relaxed">
                        {speaker.bio}
                      </p>
                    )}
                  </div>

                  <div className="border-surface-800 flex items-center gap-2 border-t pt-2">
                    {speaker.linkedin && (
                      <a
                        href={speaker.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-surface-400 hover:text-brand-400 text-[11px] transition"
                      >
                        LinkedIn
                      </a>
                    )}
                    {speaker.github && (
                      <a
                        href={speaker.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-surface-400 hover:text-brand-400 text-[11px] transition"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Partners & Sponsors */}
        {allPartners.length > 0 && (
          <section className="space-y-6">
            <div className="border-surface-800 border-b pb-3">
              <h2 className="text-surface-100 text-xl font-bold">Series Partners & Supporters</h2>
              <p className="text-surface-400 text-xs">
                Companies and communities supporting {series.name} editions
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {allPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="border-surface-800 bg-surface-900/40 flex flex-col items-center justify-center space-y-1.5 rounded-2xl border p-4 text-center"
                >
                  <Building className="text-surface-500 size-6" />
                  <span className="text-surface-200 text-xs font-bold">{partner.name}</span>
                  <Badge variant="surface" className="text-[9px]">
                    {partner.tier || "Partner"}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Photo Gallery Highlights */}
        {allGalleryImages.length > 0 && (
          <section className="space-y-6">
            <div className="border-surface-800 border-b pb-3">
              <h2 className="text-surface-100 text-xl font-bold">Moments & Highlights</h2>
              <p className="text-surface-400 text-xs">
                Recap gallery from across all {series.name} editions
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {allGalleryImages.map((img) => (
                <div
                  key={img.id}
                  className="group border-surface-800 bg-surface-900 relative aspect-video overflow-hidden rounded-2xl border shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.caption || "Meetup moment"}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-3.5">
                    <span className="text-brand-300 font-mono text-[10px]">
                      Edition {String(img.editionNo).padStart(2, "0")}
                    </span>
                    {img.caption && (
                      <p className="truncate text-xs font-medium text-white">{img.caption}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
