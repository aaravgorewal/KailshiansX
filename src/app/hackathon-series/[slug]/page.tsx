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
  return {
    title: `${series.name} — 36-Hour Hackathon Series | KailshiansX`,
    description:
      series.tagline ||
      series.purpose ||
      `Explore problem statements, prizes, and rules for ${series.name} by KailshiansX.`,
    openGraph: {
      title: `${series.name} — National Hackathon Series`,
      description: series.purpose || `36-hour product hackathon by KailshiansX.`,
      url: `https://kailshiansx.com/hackathon-series/${series.slug}`,
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
    <div className="bg-surface-950 min-h-screen pb-28">
      {/* Top Breadcrumbs */}
      <div className="border-surface-800 bg-surface-950/60 border-b backdrop-blur-md">
        <div className="container-page mx-auto max-w-5xl px-4 py-3">
          <Link
            href="/hackathon-series"
            className="text-surface-400 hover:text-surface-100 inline-flex items-center gap-1.5 text-xs font-semibold transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Hackathon Series</span>
          </Link>
        </div>
      </div>

      {/* Series Hero Section */}
      <section className="border-surface-800/80 from-surface-900/80 via-surface-950 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b pt-12 pb-14 sm:pt-20 sm:pb-20">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 size-[500px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "#7928ca" }}
        />

        <div className="container-page relative z-10 mx-auto max-w-5xl space-y-8 px-4">
          {/* Identity & Scale */}
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="border-surface-700 flex size-20 shrink-0 items-center justify-center rounded-3xl border-2 bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 text-3xl font-black text-white shadow-2xl sm:size-24">
                {series.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand" className="text-xs">
                    Recurring Hackathon Property
                  </Badge>
                  {series.region && (
                    <Badge
                      variant="outline"
                      className="border-purple-500/40 text-xs text-purple-300"
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
                    <span>Hosted in {series.city}, India</span>
                  </p>
                )}
              </div>
            </div>

            {nextEdition && (
              <Button
                asChild
                variant="primary"
                size="md"
                className="shadow-lg shadow-purple-500/20"
              >
                <Link href={`/events/${nextEdition.event.slug}/register`}>
                  <span>Register Season {nextEdition.editionNo}</span>
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Purpose & Vision Narrative */}
          <div className="border-surface-800 bg-surface-900/60 space-y-4 rounded-3xl border p-6 backdrop-blur-md sm:p-8">
            {series.tagline && (
              <h2 className="text-lg font-bold text-purple-300">{series.tagline}</h2>
            )}
            <p className="text-surface-300 max-w-4xl text-xs leading-relaxed sm:text-sm">
              {series.purpose || series.description}
            </p>
          </div>

          {/* Auto-Computed Impact Metrics Bar */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="border-surface-800 bg-surface-900/40 rounded-2xl border p-4">
              <span className="text-2xl font-black text-purple-400 sm:text-3xl">
                {stats.totalEditions}
              </span>
              <p className="text-surface-400 mt-0.5 text-[11px] font-medium tracking-wider uppercase">
                Completed Seasons
              </p>
            </div>

            <div className="border-surface-800 bg-surface-900/40 rounded-2xl border p-4">
              <span className="text-2xl font-black text-emerald-400 sm:text-3xl">
                {stats.totalAttendees}+
              </span>
              <p className="text-surface-400 mt-0.5 text-[11px] font-medium tracking-wider uppercase">
                Hackers Hosted
              </p>
            </div>

            <div className="border-surface-800 bg-surface-900/40 rounded-2xl border p-4">
              <span className="text-2xl font-black text-amber-400 sm:text-3xl">
                {series.slug === "nirmanx" ? "₹5,00,000+" : "₹1,50,000+"}
              </span>
              <p className="text-surface-400 mt-0.5 text-[11px] font-medium tracking-wider uppercase">
                Prize Pool
              </p>
            </div>

            <div className="border-surface-800 bg-surface-900/40 rounded-2xl border p-4">
              <span className="text-2xl font-black text-indigo-400 sm:text-3xl">
                {stats.totalSpeakers}+
              </span>
              <p className="text-surface-400 mt-0.5 text-[11px] font-medium tracking-wider uppercase">
                Judges & Mentors
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Hackathon Editions Viewer (PRD §9) */}
      <section className="container-page mx-auto max-w-5xl px-4 pt-14">
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
