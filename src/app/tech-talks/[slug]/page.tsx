import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Video,
  FileText,
  Lightbulb,
  Radio,
  School,
  Tag,
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.46 1.46 0 1 0 0-2.92 1.46 1.46 0 0 0 0 2.92m1.37 9.74v-8.37H5.09v8.37z" />
    </svg>
  );
}

import { getTechTalkBySlug } from "@/server/events/tech-talks";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

interface TechTalkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TechTalkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTechTalkBySlug(slug);

  if (!data || !data.talk) {
    return { title: "Tech Talk Not Found | KailshiansX" };
  }

  const { talk } = data;
  const speakerName = talk.speakers[0]?.speaker.name;

  return {
    title: `${talk.title} ${speakerName ? `— ${speakerName}` : ""} | Tech Talks | KailshiansX`,
    description:
      talk.overview || `Expert tech talk on ${talk.title}. Watch recordings and access slides.`,
    openGraph: {
      title: talk.title,
      description: talk.overview || "KailshiansX expert session knowledge archive.",
      url: `https://kailshiansx.com/tech-talks/${talk.slug}`,
    },
  };
}

export default async function TechTalkDetailPage({ params }: TechTalkDetailPageProps) {
  const { slug } = await params;
  const data = await getTechTalkBySlug(slug);

  if (!data || !data.talk) {
    notFound();
  }

  const { talk, relatedTalks } = data;
  const startDate = new Date(talk.startDate);
  const isUpcoming = startDate >= new Date();

  const dateStr = startDate.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = `${startDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}${
    talk.endDate
      ? ` - ${new Date(talk.endDate).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`
      : ""
  }`;

  const primarySpeaker = talk.speakers[0]?.speaker;
  const hostPartner = talk.partners[0]?.partner;
  const resource = talk.techTalkResource;
  const keyTakeaways = Array.isArray(resource?.keyTakeaways)
    ? (resource.keyTakeaways as string[])
    : [];

  // Helper for YouTube embed
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes("youtube.com/watch?v=")) {
        const v = url.split("v=")[1]?.split("&")[0];
        return `https://www.youtube-nocookie.com/embed/${v}`;
      }
      if (url.includes("youtu.be/")) {
        const v = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube-nocookie.com/embed/${v}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const embedUrl = resource?.videoUrl ? getEmbedUrl(resource.videoUrl) : null;

  // Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: talk.title,
    description: talk.overview,
    startDate: talk.startDate.toISOString(),
    endDate: (talk.endDate || talk.startDate).toISOString(),
    eventStatus: isUpcoming
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventMovedOnline",
    location: {
      "@type": "Place",
      name: talk.venue || "Campus Hall",
      address: {
        "@type": "PostalAddress",
        streetAddress: talk.venueAddress || undefined,
        addressLocality: talk.city?.name || "India",
        addressRegion: talk.city?.state || "India",
        addressCountry: "IN",
      },
    },
    performer: primarySpeaker
      ? {
          "@type": "Person",
          name: primarySpeaker.name,
          jobTitle: primarySpeaker.designation,
          worksFor: primarySpeaker.organisation,
        }
      : undefined,
  };

  return (
    <div className="bg-surface-950 min-h-screen pb-28">
      {/* Inject SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Breadcrumb Header */}
      <div className="border-surface-800/80 bg-surface-900/60 border-b py-4">
        <div className="container-page text-surface-400 flex items-center justify-between px-4 text-xs">
          <Link
            href="/tech-talks"
            className="hover:text-surface-100 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Tech Talks Archive</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-surface-500">PRD §7 Knowledge Session</span>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <section className="border-surface-800 from-surface-900 via-surface-950 to-surface-950 relative border-b bg-gradient-to-b py-12 sm:py-16">
        <div className="container-page max-w-5xl space-y-6 px-4">
          {/* Institution & Status Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-brand-300 border-brand-500/40 gap-1.5 py-1">
              <School className="text-brand-400 size-3.5" />
              <span>{hostPartner?.name || "Kailshians Community"}</span>
            </Badge>

            <Badge variant={isUpcoming ? "brand" : "surface"} className="py-1">
              {isUpcoming ? (
                <span className="flex items-center gap-1.5">
                  <Radio className="size-3 animate-pulse text-emerald-400" />
                  Upcoming Live Session
                </span>
              ) : (
                "Knowledge Archive"
              )}
            </Badge>

            {talk.category && (
              <Badge variant="surface" className="text-surface-300">
                {talk.category}
              </Badge>
            )}
          </div>

          <h1 className="text-surface-50 text-2xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {talk.title}
          </h1>

          <p className="text-surface-300 max-w-3xl text-sm leading-relaxed sm:text-base">
            {talk.overview}
          </p>

          {/* Quick Date, Time & Venue Bar */}
          <div className="text-surface-300 flex flex-wrap items-center gap-6 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="text-brand-400 size-4 shrink-0" />
              <span className="text-surface-200 font-semibold">{dateStr}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="text-surface-400 size-4 shrink-0" />
              <span>{timeStr}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-rose-400" />
              <span>
                {talk.attendanceMode === "VIRTUAL"
                  ? "Virtual Livestream & Discord Stage"
                  : `${talk.venue || "Campus Venue"}, ${talk.city?.name || "India"}`}
              </span>
            </div>
          </div>

          {/* Main Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            {isUpcoming ? (
              <Button asChild variant="primary" size="lg">
                <Link href={`/events/${talk.slug}/register`}>
                  <span>Register Free Community Pass</span>
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            ) : (
              <>
                {resource?.videoUrl && (
                  <Button asChild variant="primary" size="md">
                    <a href="#recording">
                      <Video className="mr-2 size-4" />
                      <span>Watch Recording</span>
                    </a>
                  </Button>
                )}
                {resource?.slideUrl && (
                  <Button asChild variant="secondary" size="md">
                    <a href={resource.slideUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 size-4" />
                      <span>Download Slide Deck</span>
                    </a>
                  </Button>
                )}
                {resource?.repoUrl && (
                  <Button asChild variant="outline" size="md">
                    <a href={resource.repoUrl} target="_blank" rel="noopener noreferrer">
                      <GithubIcon className="mr-2 size-4" />
                      <span>Source Code</span>
                    </a>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container-page max-w-5xl space-y-12 px-4 pt-12">
        {/* Speaker Profile Spotlight */}
        {primarySpeaker && (
          <section className="border-surface-800 bg-surface-900/60 space-y-6 rounded-3xl border p-6 shadow-xl backdrop-blur-md sm:p-8">
            <div className="text-surface-400 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              <Badge variant="brand">Speaker Profile</Badge>
              <span>Featured Practitioner</span>
            </div>

            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <div className="from-brand-600 to-accent-600 border-surface-700 flex size-20 shrink-0 items-center justify-center rounded-2xl border-2 bg-gradient-to-tr via-indigo-600 text-2xl font-bold text-white shadow-xl sm:size-24">
                {primarySpeaker.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <h3 className="text-surface-50 text-xl font-bold">{primarySpeaker.name}</h3>
                  <p className="text-brand-300 text-xs font-medium">
                    {primarySpeaker.designation}{" "}
                    {primarySpeaker.organisation ? `@ ${primarySpeaker.organisation}` : ""}
                  </p>
                </div>

                {primarySpeaker.bio && (
                  <p className="text-surface-300 text-xs leading-relaxed">{primarySpeaker.bio}</p>
                )}

                {/* Speaker Social Links */}
                <div className="flex items-center gap-3 pt-1">
                  {primarySpeaker.linkedin && (
                    <a
                      href={primarySpeaker.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-400 hover:text-brand-400 transition"
                      aria-label="Speaker LinkedIn"
                    >
                      <LinkedinIcon className="size-4" />
                    </a>
                  )}
                  {primarySpeaker.twitter && (
                    <a
                      href={primarySpeaker.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-400 hover:text-brand-400 transition"
                      aria-label="Speaker Twitter"
                    >
                      <TwitterIcon className="size-4" />
                    </a>
                  )}
                  {primarySpeaker.github && (
                    <a
                      href={primarySpeaker.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-400 hover:text-brand-400 transition"
                      aria-label="Speaker GitHub"
                    >
                      <GithubIcon className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Post-Event Knowledge Archive */}
        {resource && (
          <div className="space-y-10 pt-4">
            {/* Embedded Video Recording */}
            <div id="recording" className="space-y-4">
              <div className="flex items-center gap-2">
                <Video className="size-5 text-rose-400" />
                <h3 className="text-surface-50 text-xl font-bold">Session Recording</h3>
              </div>

              {embedUrl ? (
                <div className="border-surface-800 aspect-video w-full overflow-hidden rounded-3xl border bg-black shadow-2xl">
                  <iframe
                    src={embedUrl}
                    title={talk.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                </div>
              ) : resource.videoUrl ? (
                <div className="border-surface-800 bg-surface-900/60 space-y-4 rounded-3xl border p-8 text-center">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
                    <Video className="size-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-surface-100 text-base font-bold">Watch Session Stream</h4>
                    <p className="text-surface-400 mx-auto max-w-md text-xs">
                      The recording for this session is hosted externally on our media channel.
                    </p>
                  </div>
                  <Button asChild variant="primary" size="md">
                    <a href={resource.videoUrl} target="_blank" rel="noopener noreferrer">
                      <span>Open Recording on YouTube</span>
                      <ExternalLink className="ml-2 size-4" />
                    </a>
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Key Takeaways Grid */}
            {keyTakeaways.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-5 text-amber-400" />
                  <h3 className="text-surface-50 text-xl font-bold">Core Key Takeaways</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {keyTakeaways.map((point, idx) => (
                    <div
                      key={idx}
                      className="border-surface-800 bg-surface-900/40 hover:border-surface-700 space-y-2 rounded-2xl border p-5 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 font-mono text-xs font-bold text-amber-400">
                          {idx + 1}
                        </span>
                        <span className="text-surface-200 text-xs font-semibold">
                          Takeaway Concept
                        </span>
                      </div>
                      <p className="text-surface-300 text-xs leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Downloads & GitHub */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {resource.slideUrl && (
                <div className="border-surface-800 bg-surface-900/60 flex items-center justify-between gap-4 rounded-2xl border p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                      <FileText className="size-6" />
                    </div>
                    <div>
                      <h4 className="text-surface-100 text-sm font-bold">
                        Official Presentation Deck
                      </h4>
                      <p className="text-surface-400 text-xs">
                        PDF slides with diagrams and code samples
                      </p>
                    </div>
                  </div>

                  <Button asChild variant="secondary" size="sm">
                    <a href={resource.slideUrl} target="_blank" rel="noopener noreferrer">
                      <span>Download</span>
                      <ExternalLink className="ml-1 size-3.5" />
                    </a>
                  </Button>
                </div>
              )}

              {resource.repoUrl && (
                <div className="border-surface-800 bg-surface-900/60 flex items-center justify-between gap-4 rounded-2xl border p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                      <GithubIcon className="size-6" />
                    </div>
                    <div>
                      <h4 className="text-surface-100 text-sm font-bold">Live Code Repository</h4>
                      <p className="text-surface-400 text-xs">Clone and reproduce the examples</p>
                    </div>
                  </div>

                  <Button asChild variant="secondary" size="sm">
                    <a href={resource.repoUrl} target="_blank" rel="noopener noreferrer">
                      <span>GitHub</span>
                      <ExternalLink className="ml-1 size-3.5" />
                    </a>
                  </Button>
                </div>
              )}
            </div>

            {/* Knowledge Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-surface-400 flex items-center gap-1 text-xs">
                  <Tag className="size-3" />
                  <span>Topics:</span>
                </span>
                {resource.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tech-talks?q=${encodeURIComponent(tag)}`}
                    className="bg-surface-900 border-surface-800 text-surface-300 hover:border-brand-500 hover:text-brand-300 rounded-lg border px-2.5 py-1 text-xs transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Related Tech Talks */}
        {relatedTalks.length > 0 && (
          <section className="border-surface-800 space-y-6 border-t pt-12">
            <h3 className="text-surface-50 text-xl font-bold">More Knowledge Sessions</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedTalks.map((rt) => (
                <div
                  key={rt.id}
                  className="border-surface-800 bg-surface-900/50 hover:border-surface-700 flex flex-col justify-between space-y-3 rounded-2xl border p-5 transition"
                >
                  <div className="space-y-2">
                    <span className="text-brand-400 text-[11px] font-semibold">
                      {rt.partners[0]?.partner.name || "KailshiansX"}
                    </span>
                    <Link
                      href={`/tech-talks/${rt.slug}`}
                      className="text-surface-100 hover:text-brand-300 line-clamp-2 block text-sm font-bold transition"
                    >
                      {rt.title}
                    </Link>
                    <p className="text-surface-400 line-clamp-2 text-xs">{rt.overview}</p>
                  </div>

                  <div className="border-surface-800 text-surface-400 flex items-center justify-between border-t pt-2 text-xs">
                    <span>{rt.speakers[0]?.speaker.name}</span>
                    <Link
                      href={`/tech-talks/${rt.slug}`}
                      className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-1 font-medium"
                    >
                      View <ArrowRight className="size-3" />
                    </Link>
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
