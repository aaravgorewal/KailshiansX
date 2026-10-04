import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, ArrowRight } from "lucide-react";
import { getSeriesBySlug } from "@/server/events/series";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  HackathonSeriesClient,
  type SerializedHackathonEdition,
  type SerializedHackathonDetail,
} from "./HackathonSeriesClient";

export const dynamic = "force-dynamic";

interface HackathonSeriesDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: HackathonSeriesDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSeriesBySlug(slug);

  if (!data || !data.series) {
    return { title: "Hackathon Series Not Found | KailshiansX" };
  }

  const { series } = data;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansX.com";
  const ogImage = series.coverImage || "/og-image.png";

  return {
    title: `${series.name} — 36-Hour Hackathon Series | KailshiansX`,
    description:
      series.tagline ||
      series.purpose ||
      `Explore problem statements, prizes, and rules for ${series.name} by KailshiansX.`,
    alternates: {
      canonical: `${APP_URL}/hackathon-series/${series.slug}`,
    },
    openGraph: {
      title: `${series.name} — National Hackathon Series`,
      description: series.purpose || "36-hour product hackathon by KailshiansX.",
      url: `${APP_URL}/hackathon-series/${series.slug}`,
      siteName: "KailshiansX",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: series.name,
      description: series.tagline || series.purpose || "Hackathon series by KailshiansX.",
      images: [ogImage],
    },
  };
}

export default async function HackathonSeriesDetailPage({
  params,
  searchParams,
}: HackathonSeriesDetailPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const data = await getSeriesBySlug(slug);

  if (!data || !data.series || data.series.kind !== "HACKATHON") {
    notFound();
  }

  const { series, editions, stats, nextEdition } = data;

  // Determine initial edition number
  const requestedEdition = Number(sParams.edition);
  const initialEditionNo =
    requestedEdition && editions.some((e) => e.editionNo === requestedEdition)
      ? requestedEdition
      : nextEdition?.editionNo || editions[editions.length - 1]?.editionNo || 1;

  // Serialize editions for Client Component
  const serializedEditions: SerializedHackathonEdition[] = editions.map((ed) => ({
    id: ed.id,
    editionNo: ed.editionNo,
    theme: ed.theme,
    event: {
      id: ed.event.id,
      slug: ed.event.slug,
      title: ed.event.title,
      overview: ed.event.overview,
      startDate: ed.event.startDate.toISOString(),
      endDate: ed.event.endDate ? ed.event.endDate.toISOString() : null,
      venue: ed.event.venue,
      city: ed.event.city ? { name: ed.event.city.name, state: ed.event.city.state } : null,
      tracks: ed.event.tracks.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        color: t.color,
      })),
      scheduleItems: ed.event.scheduleItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        startTime: item.startTime.toISOString(),
        endTime: item.endTime ? item.endTime.toISOString() : null,
      })),
      speakers: ed.event.speakers.map((s) => ({
        role: s.role,
        speaker: {
          id: s.speaker.id,
          name: s.speaker.name,
          designation: s.speaker.designation,
          organisation: s.speaker.organisation,
          photo: s.speaker.photo,
          bio: s.speaker.bio,
          linkedin: s.speaker.linkedin,
          github: s.speaker.github,
        },
      })),
      partners: ed.event.partners.map((p) => ({
        tier: p.tier,
        partner: {
          id: p.partner.id,
          name: p.partner.name,
          logo: p.partner.logo,
          website: p.partner.website,
        },
      })),
      ticketTypes: ed.event.ticketTypes.map((t) => ({
        id: t.id,
        name: t.name,
        price: Number(t.price),
        quota: t.quota,
      })),
      galleryAlbums: ed.event.galleryAlbums.map((album) => ({
        title: album.title,
        images: album.images.map((img) => ({
          id: img.id,
          url: img.url,
          caption: img.caption,
        })),
      })),
      hackathonDetail: ed.event.hackathonDetail
        ? {
            minTeamSize: ed.event.hackathonDetail.minTeamSize,
            maxTeamSize: ed.event.hackathonDetail.maxTeamSize,
            rules: ed.event.hackathonDetail.rules,
            submissionUrl: ed.event.hackathonDetail.submissionUrl,
            submissionDeadline: ed.event.hackathonDetail.submissionDeadline
              ? ed.event.hackathonDetail.submissionDeadline.toISOString()
              : null,
            prizes:
              (ed.event.hackathonDetail.prizes as SerializedHackathonDetail["prizes"]) ?? null,
            problemStatements:
              (ed.event.hackathonDetail
                .problemStatements as SerializedHackathonDetail["problemStatements"]) ?? null,
            results:
              (ed.event.hackathonDetail.results as SerializedHackathonDetail["results"]) ?? null,
          }
        : null,
    },
  }));

  return (
    <div className="bg-background text-foreground min-h-screen pb-24">
      {/* Top Breadcrumbs */}
      <div className="border-border bg-background border-b py-3.5">
        <div className="mx-auto max-w-5xl px-4 text-xs">
          <Link
            href="/hackathon-series"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Hackathon Series</span>
          </Link>
        </div>
      </div>

      {/* Series Hero Section */}
      <section className="border-border bg-background border-b py-10 sm:py-14">
        <div className="mx-auto max-w-5xl space-y-6 px-4">
          {/* Identity & Badges */}
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="border-border bg-muted text-foreground flex size-16 shrink-0 items-center justify-center rounded-lg border text-2xl font-bold sm:size-20">
                {series.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">Hackathon Series</Badge>
                  {series.region && <Badge variant="neutral">{series.region}</Badge>}
                </div>

                <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-4xl">
                  {series.name}
                </h1>

                {series.city && (
                  <p className="text-muted-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                    <MapPin className="size-3.5 shrink-0" />
                    <span>Hosted in {series.city}, India</span>
                  </p>
                )}
              </div>
            </div>

            {nextEdition && (
              <Button asChild variant="primary" size="md">
                <Link href={`/events/${nextEdition.event.slug}/register`}>
                  <span>Register Season {nextEdition.editionNo}</span>
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Tagline & Description */}
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

          {/* Plain Stat Row */}
          <div className="flex flex-wrap items-center gap-6 pt-2 sm:gap-10">
            {stats.totalEditions > 0 && (
              <div>
                <span className="text-foreground text-2xl font-bold">{stats.totalEditions}</span>
                <span className="text-muted-foreground ml-2 text-xs">Completed Seasons</span>
              </div>
            )}
            {stats.totalAttendees > 0 && (
              <div>
                <span className="text-foreground text-2xl font-bold">{stats.totalAttendees}+</span>
                <span className="text-muted-foreground ml-2 text-xs">Hackers Hosted</span>
              </div>
            )}
            {stats.totalSpeakers > 0 && (
              <div>
                <span className="text-foreground text-2xl font-bold">{stats.totalSpeakers}+</span>
                <span className="text-muted-foreground ml-2 text-xs">Judges & Mentors</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Hackathon Editions Viewer */}
      <section className="mx-auto max-w-5xl px-4 pt-10">
        <HackathonSeriesClient
          series={{
            id: series.id,
            slug: series.slug,
            name: series.name,
            tagline: series.tagline,
            description: series.description,
            purpose: series.purpose,
            city: series.city,
            region: series.region,
          }}
          editions={serializedEditions}
          initialEditionNo={initialEditionNo}
        />
      </section>
    </div>
  );
}
