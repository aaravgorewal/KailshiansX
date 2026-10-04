import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, ArrowRight, Building } from "lucide-react";
import { getSeriesBySlug } from "@/server/events/series";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate, formatTime } from "@/lib/format-date";

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
      description: series.purpose || "Developer events, talks, and community by KailshiansX.",
      url: `${APP_URL}/meetup-series/${series.slug}`,
      siteName: "KailshiansX",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: series.name,
      description: series.tagline || series.purpose || "Meetup series by KailshiansX.",
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
    <div className="bg-background text-foreground min-h-screen pb-24">
      {/* Top Breadcrumb Header */}
      <div className="border-border bg-background border-b py-3.5">
        <div className="mx-auto max-w-5xl px-4 text-xs">
          <Link
            href="/meetup-series"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Meetup Series</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="border-border bg-background border-b py-10 sm:py-14">
        <div className="mx-auto max-w-5xl space-y-6 px-4">
          {/* Identity & City */}
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="border-border bg-muted text-foreground flex size-16 shrink-0 items-center justify-center rounded-lg border text-2xl font-bold sm:size-20">
                {series.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">Meetup Series</Badge>
                  {series.region && <Badge variant="neutral">{series.region}</Badge>}
                </div>

                <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-4xl">
                  {series.name}
                </h1>

                {series.city && (
                  <p className="text-muted-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                    <MapPin className="size-3.5 shrink-0" />
                    <span>Anchored in {series.city}, India</span>
                  </p>
                )}
              </div>
            </div>

            {nextEdition && (
              <Button asChild variant="primary" size="md">
                <Link href={`/events/${nextEdition.event.slug}/register`}>
                  <span>RSVP for Edition {nextEdition.editionNo}</span>
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Tagline & Purpose */}
          <div className="space-y-2">
            {series.tagline && (
              <h2 className="text-foreground text-base font-semibold">{series.tagline}</h2>
            )}
            {series.purpose && (
              <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
                {series.purpose}
              </p>
            )}
          </div>

          {/* Impact Stats Grid (Plain Row) */}
          <div className="flex flex-wrap items-center gap-6 pt-2 sm:gap-10">
            {stats.totalEditions > 0 && (
              <div>
                <span className="text-foreground text-2xl font-bold">{stats.totalEditions}</span>
                <span className="text-muted-foreground ml-2 text-xs">Editions Held</span>
              </div>
            )}
            {stats.totalAttendees > 0 && (
              <div>
                <span className="text-foreground text-2xl font-bold">{stats.totalAttendees}+</span>
                <span className="text-muted-foreground ml-2 text-xs">Builders Engaged</span>
              </div>
            )}
            {stats.totalSpeakers > 0 && (
              <div>
                <span className="text-foreground text-2xl font-bold">{stats.totalSpeakers}</span>
                <span className="text-muted-foreground ml-2 text-xs">Speakers Featured</span>
              </div>
            )}
            {stats.totalPartners > 0 && (
              <div>
                <span className="text-foreground text-2xl font-bold">{stats.totalPartners}</span>
                <span className="text-muted-foreground ml-2 text-xs">Ecosystem Partners</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-5xl space-y-12 px-4 pt-10">
        {/* Next Edition Highlight Card */}
        {nextEdition ? (
          <Card className="space-y-4 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-2">
              <span className="text-foreground text-xs font-semibold">
                Next Gathering — Edition {String(nextEdition.editionNo).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground text-xs">Registrations Open</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-foreground text-xl font-bold sm:text-2xl">
                {nextEdition.event.title}
              </h3>
              {nextEdition.theme && (
                <p className="text-muted-foreground text-xs font-medium">
                  Theme: {nextEdition.theme}
                </p>
              )}
              {nextEdition.event.overview && (
                <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed sm:text-sm">
                  {nextEdition.event.overview}
                </p>
              )}
            </div>

            {/* Date, Time & Venue */}
            <div className="border-border text-muted-foreground flex flex-wrap items-center gap-6 border-t pt-3 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                <span>{formatDate(nextEdition.event.startDate)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="size-4" />
                <span>{formatTime(nextEdition.event.startDate)}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                <span>
                  {nextEdition.event.venue || "Community Space"},{" "}
                  {nextEdition.event.city?.name || "India"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild variant="primary" size="md">
                <Link href={`/events/${nextEdition.event.slug}/register`}>
                  <span>Register Free Pass</span>
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>

              <Button asChild variant="secondary" size="md">
                <Link href={`/events/${nextEdition.event.slug}`}>
                  <span>View Details & Agenda</span>
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="space-y-3 p-8 text-center">
            <h3 className="text-foreground text-sm font-semibold">Next Edition in Planning</h3>
            <p className="text-muted-foreground mx-auto max-w-md text-xs">
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
          </Card>
        )}

        {/* Editions List */}
        <section className="space-y-6">
          <div className="border-border flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-foreground text-lg font-bold">Editions List</h2>
              <p className="text-muted-foreground text-xs">
                Chronological history of {series.name} gatherings
              </p>
            </div>
            <span className="text-muted-foreground text-xs">
              {editions.length} Recorded Editions
            </span>
          </div>

          <div className="space-y-4">
            {editions.map((edition) => {
              const isPast = new Date(edition.event.startDate) < new Date();
              const dateStr = formatDate(edition.event.startDate);

              return (
                <Card
                  key={edition.id}
                  className="hover:border-muted-foreground space-y-3 p-5 transition-[border-color] duration-150 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-semibold">
                        Edition {String(edition.editionNo).padStart(2, "0")}
                      </span>
                      {edition.theme && (
                        <span className="text-muted-foreground">• {edition.theme}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{dateStr}</span>
                      <span className="text-muted-foreground font-medium">
                        {isPast ? "Completed" : "Upcoming"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-foreground text-base font-semibold">
                      {edition.event.title}
                    </h3>
                    {edition.event.overview && (
                      <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                        {edition.event.overview}
                      </p>
                    )}
                  </div>

                  <div className="border-border text-muted-foreground flex flex-wrap items-center justify-between gap-4 border-t pt-3 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {edition.event.venue || "Campus Lab"}, {edition.event.city?.name || "India"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {edition.event.speakers.length > 0 && (
                        <span>{edition.event.speakers.length} Speakers</span>
                      )}
                      <Link
                        href={`/events/${edition.event.slug}`}
                        className="text-foreground hover:text-primary inline-flex items-center gap-1 font-medium transition-colors"
                      >
                        <span>{isPast ? "View Recap" : "View Agenda"}</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Speakers Pool Across Editions */}
        {allSpeakers.length > 0 && (
          <section className="space-y-6">
            <div className="border-border border-b pb-3">
              <h2 className="text-foreground text-lg font-bold">Series Speakers</h2>
              <p className="text-muted-foreground text-xs">
                Engineers and practitioners who have presented at {series.name}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {allSpeakers.map((speaker) => (
                <Card key={speaker.id} className="flex flex-col justify-between space-y-3 p-4">
                  <div className="space-y-2">
                    <div className="border-border bg-muted text-foreground flex size-11 items-center justify-center rounded-lg border text-sm font-semibold">
                      {speaker.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <h3 className="text-foreground text-xs font-semibold">{speaker.name}</h3>
                      <p className="text-muted-foreground truncate text-xs">
                        {speaker.designation}
                        {speaker.organisation ? ` @ ${speaker.organisation}` : ""}
                      </p>
                    </div>

                    {speaker.bio && (
                      <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                        {speaker.bio}
                      </p>
                    )}
                  </div>

                  <div className="border-border text-muted-foreground flex items-center gap-3 border-t pt-2 text-xs">
                    {speaker.linkedin && (
                      <a
                        href={speaker.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                      >
                        LinkedIn
                      </a>
                    )}
                    {speaker.github && (
                      <a
                        href={speaker.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Partners & Supporters */}
        {allPartners.length > 0 && (
          <section className="space-y-6">
            <div className="border-border border-b pb-3">
              <h2 className="text-foreground text-lg font-bold">Series Partners & Supporters</h2>
              <p className="text-muted-foreground text-xs">
                Organizations supporting {series.name} editions
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {allPartners.map((partner) => (
                <Card
                  key={partner.id}
                  className="flex flex-col items-center justify-center space-y-1.5 p-4 text-center"
                >
                  <Building className="text-muted-foreground size-5" />
                  <span className="text-foreground text-xs font-semibold">{partner.name}</span>
                  <span className="text-muted-foreground text-xs">{partner.tier || "Partner"}</span>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Photo Gallery Highlights */}
        {allGalleryImages.length > 0 && (
          <section className="space-y-6">
            <div className="border-border border-b pb-3">
              <h2 className="text-foreground text-lg font-bold">Moments & Highlights</h2>
              <p className="text-muted-foreground text-xs">
                Recap gallery from across {series.name} editions
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {allGalleryImages.map((img) => (
                <div
                  key={img.id}
                  className="border-border bg-muted relative aspect-video overflow-hidden rounded-lg border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.caption || "Meetup moment"}
                    className="size-full object-cover"
                  />
                  <div className="bg-scrim absolute inset-0 flex flex-col justify-end p-3">
                    <span className="text-muted-foreground text-xs">
                      Edition {String(img.editionNo).padStart(2, "0")}
                    </span>
                    {img.caption && (
                      <p className="text-foreground truncate text-xs font-medium">{img.caption}</p>
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
