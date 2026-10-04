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
import { Card } from "@/components/ui/Card";
import { formatDate, formatTime } from "@/lib/format-date";

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

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";
  const ogImage = talk.coverImage || "/og-image.png";

  return {
    title: `${talk.title} ${speakerName ? `— ${speakerName}` : ""} | Tech Talks | KailshiansX`,
    description:
      talk.overview || `Expert tech talk on ${talk.title}. Watch recordings and access slides.`,
    alternates: {
      canonical: `${APP_URL}/tech-talks/${talk.slug}`,
    },
    openGraph: {
      title: talk.title,
      description: talk.overview || "KailshiansX expert session knowledge archive.",
      url: `${APP_URL}/tech-talks/${talk.slug}`,
      siteName: "KailshiansX",
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: talk.title,
      description: talk.overview || "KailshiansX expert session knowledge archive.",
      images: [ogImage],
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
  const isUpcoming = new Date(talk.startDate) >= new Date();
  const dateStr = formatDate(talk.startDate);
  const timeStr = `${formatTime(talk.startDate)}${
    talk.endDate ? ` – ${formatTime(talk.endDate)}` : ""
  }`;

  const primarySpeaker = talk.speakers[0]?.speaker;
  const hostPartner = talk.partners[0]?.partner;
  const resource = talk.techTalkResource;
  const keyTakeaways = Array.isArray(resource?.keyTakeaways)
    ? (resource.keyTakeaways as string[])
    : [];

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
    <div className="bg-background text-foreground min-h-screen pb-24">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Breadcrumb Header */}
      <div className="border-border bg-background border-b py-3.5">
        <div className="mx-auto max-w-5xl px-4 text-xs">
          <Link
            href="/tech-talks"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Tech Talks</span>
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <section className="border-border bg-background border-b py-10 sm:py-14">
        <div className="mx-auto max-w-5xl space-y-5 px-4">
          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-2">
            {hostPartner && (
              <Badge variant="neutral" className="gap-1.5">
                <School className="text-muted-foreground size-3.5" />
                <span>{hostPartner.name}</span>
              </Badge>
            )}

            <span className="text-muted-foreground text-xs font-medium">
              {isUpcoming ? "Upcoming Session" : "Archived Session"}
            </span>

            {talk.category && <Badge variant="neutral">{talk.category}</Badge>}
          </div>

          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-4xl">
            {talk.title}
          </h1>

          {talk.overview && (
            <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed sm:text-base">
              {talk.overview}
            </p>
          )}

          {/* Quick Date, Time & Venue Bar */}
          <div className="text-muted-foreground flex flex-wrap items-center gap-6 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 shrink-0" />
              <span className="text-foreground font-medium">{dateStr}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="size-4 shrink-0" />
              <span>{timeStr}</span>
            </div>

            <div className="flex items-center gap-2 truncate">
              <MapPin className="size-4 shrink-0" />
              <span>
                {talk.attendanceMode === "VIRTUAL"
                  ? "Virtual Livestream"
                  : `${talk.venue || "Campus Venue"}, ${talk.city?.name || "India"}`}
              </span>
            </div>
          </div>

          {/* Main Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            {isUpcoming ? (
              <Button asChild variant="primary" size="md">
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
                      <span>Download Slides</span>
                    </a>
                  </Button>
                )}
                {resource?.repoUrl && (
                  <Button asChild variant="secondary" size="md">
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
      <div className="mx-auto max-w-5xl space-y-10 px-4 pt-10">
        {/* Speaker Profile Spotlight */}
        {primarySpeaker && (
          <Card className="space-y-4 p-6 sm:p-8">
            <div className="text-muted-foreground text-xs font-medium">Featured Speaker</div>

            <div className="flex flex-col items-start gap-5 sm:flex-row">
              <div className="border-border bg-muted text-foreground flex size-16 shrink-0 items-center justify-center rounded-lg border text-xl font-semibold sm:size-20">
                {primarySpeaker.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <h2 className="text-foreground text-lg font-bold">{primarySpeaker.name}</h2>
                  <p className="text-muted-foreground text-xs">
                    {primarySpeaker.designation}
                    {primarySpeaker.organisation ? ` @ ${primarySpeaker.organisation}` : ""}
                  </p>
                </div>

                {primarySpeaker.bio && (
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {primarySpeaker.bio}
                  </p>
                )}

                {/* Speaker Social Links */}
                <div className="text-muted-foreground flex items-center gap-3 pt-1">
                  {primarySpeaker.linkedin && (
                    <a
                      href={primarySpeaker.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
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
                      className="hover:text-foreground transition-colors"
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
                      className="hover:text-foreground transition-colors"
                      aria-label="Speaker GitHub"
                    >
                      <GithubIcon className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Post-Event Knowledge Archive */}
        {resource && (
          <div className="space-y-8">
            {/* Embedded Video Recording */}
            <div id="recording" className="space-y-3">
              <div className="flex items-center gap-2">
                <Video className="text-muted-foreground size-4" />
                <h2 className="text-foreground text-lg font-bold">Session Recording</h2>
              </div>

              {embedUrl ? (
                <div className="border-border bg-background aspect-video w-full overflow-hidden rounded-lg border">
                  <iframe
                    src={embedUrl}
                    title={talk.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                </div>
              ) : resource.videoUrl ? (
                <Card className="space-y-4 p-8 text-center">
                  <div className="border-border bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-lg border">
                    <Video className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-sm font-semibold">External Video Stream</h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                      The recording for this session is hosted externally.
                    </p>
                  </div>
                  <Button asChild variant="primary" size="sm">
                    <a href={resource.videoUrl} target="_blank" rel="noopener noreferrer">
                      <span>Open Recording on YouTube</span>
                      <ExternalLink className="ml-1.5 size-3.5" />
                    </a>
                  </Button>
                </Card>
              ) : null}
            </div>

            {/* Key Takeaways */}
            {keyTakeaways.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="text-muted-foreground size-4" />
                  <h2 className="text-foreground text-lg font-bold">Key Takeaways</h2>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {keyTakeaways.map((point, idx) => (
                    <Card key={idx} className="space-y-1.5 p-4">
                      <div className="flex items-center gap-2">
                        <span className="border-border bg-muted text-foreground flex size-5 items-center justify-center rounded border text-xs font-semibold">
                          {idx + 1}
                        </span>
                        <span className="text-foreground text-xs font-medium">
                          Takeaway #{idx + 1}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">{point}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Downloads & GitHub */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {resource.slideUrl && (
                <Card className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <div className="border-border bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg border">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-foreground text-xs font-semibold">Presentation Slides</h3>
                      <p className="text-muted-foreground text-xs">
                        PDF deck with diagrams and notes
                      </p>
                    </div>
                  </div>

                  <Button asChild variant="secondary" size="sm">
                    <a href={resource.slideUrl} target="_blank" rel="noopener noreferrer">
                      <span>Download</span>
                      <ExternalLink className="ml-1 size-3.5" />
                    </a>
                  </Button>
                </Card>
              )}

              {resource.repoUrl && (
                <Card className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <div className="border-border bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg border">
                      <GithubIcon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-foreground text-xs font-semibold">Code Repository</h3>
                      <p className="text-muted-foreground text-xs">Clone and run the samples</p>
                    </div>
                  </div>

                  <Button asChild variant="secondary" size="sm">
                    <a href={resource.repoUrl} target="_blank" rel="noopener noreferrer">
                      <span>GitHub</span>
                      <ExternalLink className="ml-1 size-3.5" />
                    </a>
                  </Button>
                </Card>
              )}
            </div>

            {/* Knowledge Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Tag className="size-3" />
                  <span>Topics:</span>
                </span>
                {resource.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tech-talks?q=${encodeURIComponent(tag)}`}
                    className="border-border bg-muted/50 text-muted-foreground hover:border-primary hover:text-foreground rounded border px-2 py-0.5 text-xs transition-colors"
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
          <section className="border-border space-y-4 border-t pt-8">
            <h2 className="text-foreground text-lg font-bold">Related Sessions</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {relatedTalks.map((rt) => (
                <Card
                  key={rt.id}
                  className="hover:border-muted-foreground flex flex-col justify-between space-y-3 p-5 transition-[border-color] duration-150"
                >
                  <div className="space-y-1.5">
                    <span className="text-muted-foreground text-xs">
                      {rt.partners[0]?.partner.name || "KailshiansX"}
                    </span>
                    <Link
                      href={`/tech-talks/${rt.slug}`}
                      className="text-foreground hover:text-primary line-clamp-2 block text-sm font-semibold transition-colors"
                    >
                      {rt.title}
                    </Link>
                    {rt.overview && (
                      <p className="text-muted-foreground line-clamp-2 text-xs">{rt.overview}</p>
                    )}
                  </div>

                  <div className="border-border text-muted-foreground flex items-center justify-between border-t pt-3 text-xs">
                    <span>{rt.speakers[0]?.speaker.name}</span>
                    <Link
                      href={`/tech-talks/${rt.slug}`}
                      className="text-foreground hover:text-primary inline-flex items-center gap-1 font-medium transition-colors"
                    >
                      <span>View</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
