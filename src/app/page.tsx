import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { Reveal } from "@/components/ui/Reveal";

function ArrowRightIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export const revalidate = 60;

export const metadata: Metadata = {
  title: "KailshiansX — Developer Events. Builder Communities.",
  description:
    "The open developer network and gathering ground for engineers, architects, and technical builders across India.",
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    title: "KailshiansX — Developer Events. Builder Communities.",
    description:
      "The open developer network and gathering ground for engineers, architects, and technical builders across India.",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KailshiansX — Developer Events. Builder Communities.",
    description:
      "The open developer network and gathering ground for engineers, architects, and technical builders across India.",
  },
};

export default async function HomePage() {
  const now = new Date();

  // 1. Latest published album cover for Hero
  const latestAlbum = await db.galleryAlbum.findFirst({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        take: 1,
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const heroImageUrl = latestAlbum?.coverImage || latestAlbum?.images?.[0]?.url || null;
  const heroImageAlt = latestAlbum?.title || "Latest community gathering";

  // 2. Next 3 published events
  const upcomingEvents = await db.event.findMany({
    where: {
      status: "PUBLISHED",
      startDate: { gte: now },
    },
    orderBy: { startDate: "asc" },
    take: 3,
    include: {
      city: true,
      ticketTypes: true,
    },
  });

  // 3. Moments photos (>= 4 published gallery photos)
  const momentsPhotos = await db.galleryImage.findMany({
    where: {
      album: { isPublished: true },
      ...(heroImageUrl ? { url: { not: heroImageUrl } } : {}),
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {/* ─── 1. HERO ───────────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-24 md:pt-24 md:pb-32" aria-label="Hero">
        <div className="container-page">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              {/* Not wrapped in <Reveal> for immediate LCP paint */}
              <h1 className="display text-foreground max-w-xl">
                Developer events.
                <br className="hidden sm:inline" /> Builder communities.
              </h1>

              <p className="body-lg mt-6 max-w-lg">
                The open developer network and gathering ground for engineers, architects, and
                technical builders across India.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" variant="primary">
                  <Link href="/events">Browse events</Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/community">Join the community</Link>
                </Button>
              </div>
            </div>

            <div className="mx-auto w-full max-w-md lg:max-w-none">
              {heroImageUrl ? (
                <div className="bg-muted overflow-hidden rounded-2xl">
                  <Image
                    src={heroImageUrl}
                    alt={heroImageAlt}
                    width={480}
                    height={600}
                    priority
                    fetchPriority="high"
                    loading="eager"
                    decoding="sync"
                    sizes="(max-width: 640px) 380px, (max-width: 1024px) 50vw, 500px"
                    unoptimized={heroImageUrl.startsWith("/")}
                    className="aspect-[4/5] h-auto w-full object-cover"
                  />
                </div>
              ) : (
                <div className="bg-muted aspect-[4/5] w-full rounded-2xl" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. NEXT EVENTS ────────────────────────────────────────────────────── */}
      {upcomingEvents.length > 0 ? (
        <section
          className="border-border border-t py-24 md:py-32"
          aria-labelledby="upcoming-events-heading"
        >
          <div className="container-page">
            <Reveal>
              <div className="mb-8 flex items-baseline justify-between sm:mb-12">
                <h2 id="upcoming-events-heading" className="h2 text-foreground">
                  Coming up
                </h2>
                <TextLink href="/events">All events</TextLink>
              </div>

              <div className="divide-border border-border divide-y border-y">
                {upcomingEvents.map((event) => {
                  const dayNumber = event.startDate.toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "numeric",
                  });

                  const monthStr = event.startDate
                    .toLocaleDateString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      month: "short",
                    })
                    .toUpperCase();

                  const timeStr =
                    event.startDate.toLocaleTimeString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }) + " IST";

                  const locationTime = event.city?.name
                    ? `${event.city.name} • ${timeStr}`
                    : event.venue
                      ? `${event.venue} • ${timeStr}`
                      : timeStr;

                  const isFree =
                    event.ticketTypes.length === 0 ||
                    event.ticketTypes.some((t) => t.isFree || Number(t.price) === 0);

                  const minPrice =
                    event.ticketTypes.length > 0
                      ? Math.min(...event.ticketTypes.map((t) => Number(t.price)))
                      : 0;

                  const priceLabel = isFree ? "Free" : `₹${minPrice.toLocaleString("en-IN")}`;

                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="group hover:bg-muted/40 -mx-2 flex items-center justify-between gap-4 rounded-lg px-2 py-6 transition-colors sm:-mx-4 sm:gap-8 sm:px-4 sm:py-8"
                    >
                      <div className="flex min-w-0 items-center gap-4 sm:gap-8">
                        <div className="flex min-w-[3.25rem] shrink-0 flex-col items-start sm:min-w-[4.25rem]">
                          <span className="display text-foreground font-mono leading-none">
                            {dayNumber}
                          </span>
                          <span className="text-muted-foreground mt-1 font-mono text-xs tracking-wider uppercase">
                            {monthStr}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-foreground group-hover:text-accent-text line-clamp-2 text-base font-semibold transition-colors sm:text-lg md:text-xl">
                            {event.title}
                          </h3>
                          <p className="text-muted-foreground mt-1 truncate text-xs sm:text-sm">
                            {locationTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3 sm:gap-6">
                        <span className="text-foreground font-mono text-xs font-medium sm:text-sm">
                          {priceLabel}
                        </span>
                        <ArrowRightIcon className="text-muted-foreground group-hover:text-foreground size-4 transition-transform duration-150 group-hover:translate-x-1 sm:size-5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>
      ) : (
        <section className="border-border border-t py-24 md:py-32">
          <div className="container-page">
            <Reveal>
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <p className="text-foreground text-base sm:text-lg">
                  No events scheduled — join the community to hear first.
                </p>
                <Button asChild variant="primary">
                  <Link href="/community">Join the community</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ─── 3. WHAT WE DO ─────────────────────────────────────────────────────── */}
      <section
        className="border-border border-t py-24 md:py-32"
        aria-labelledby="what-we-do-heading"
      >
        <div className="container-page">
          <Reveal>
            <h2 id="what-we-do-heading" className="h2 text-foreground mb-8 sm:mb-12">
              What we do
            </h2>

            <div className="divide-border border-border divide-y border-y">
              <div className="flex flex-col justify-between gap-4 py-6 sm:flex-row sm:items-baseline sm:py-8">
                <div className="max-w-2xl">
                  <h3 className="text-foreground text-lg font-semibold sm:text-xl">Events</h3>
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Hands-on hackathons, intensive workshops, and architecture deep dives designed
                    for engineers.
                  </p>
                </div>
                <div className="shrink-0 pt-1 sm:pt-0">
                  <TextLink href="/events">Explore events</TextLink>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 py-6 sm:flex-row sm:items-baseline sm:py-8">
                <div className="max-w-2xl">
                  <h3 className="text-foreground text-lg font-semibold sm:text-xl">Community</h3>
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    A nationwide network of developers, builders, and founders sharing knowledge and
                    collaborating across tech stacks.
                  </p>
                </div>
                <div className="shrink-0 pt-1 sm:pt-0">
                  <TextLink href="/community">Join community</TextLink>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 py-6 sm:flex-row sm:items-baseline sm:py-8">
                <div className="max-w-2xl">
                  <h3 className="text-foreground text-lg font-semibold sm:text-xl">Leadership</h3>
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Empowering campus leads and regional organizers with resources, funding, and
                    mentorship.
                  </p>
                </div>
                <div className="shrink-0 pt-1 sm:pt-0">
                  <TextLink href="/community#lead">Lead a chapter</TextLink>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 4. MOMENTS ────────────────────────────────────────────────────────── */}
      {momentsPhotos.length >= 4 && (
        <section
          className="border-border border-t py-24 md:py-32"
          aria-labelledby="moments-heading"
        >
          <div className="container-page">
            <Reveal>
              <div className="mb-8 flex items-baseline justify-between sm:mb-12">
                <h2 id="moments-heading" className="h2 text-foreground">
                  Moments
                </h2>
                <TextLink href="/gallery">See all photos</TextLink>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {momentsPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-muted relative aspect-[4/3] w-full overflow-hidden rounded-xl"
                  >
                    <Image
                      src={photo.url}
                      alt={photo.altText || "Community moment"}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 380px, (max-width: 768px) 50vw, 33vw"
                      quality={60}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ─── 5. FINAL CTA ──────────────────────────────────────────────────────── */}
      <section
        className="border-border border-t py-24 md:py-32"
        aria-labelledby="final-cta-heading"
      >
        <div className="container-page">
          <Reveal>
            <div className="flex max-w-3xl flex-col items-start gap-6 sm:gap-8">
              <h2 id="final-cta-heading" className="h2 text-foreground">
                Build something with us.
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <Button asChild size="lg" variant="primary">
                  <a href={SITE_CONFIG.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    Join on WhatsApp
                  </a>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/partner">Partner with us</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
