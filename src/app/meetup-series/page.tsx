import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Sparkles, ArrowRight, Radio } from "lucide-react";
import { getSeriesList } from "@/server/events/series";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Meetup Series | Grassroots Developer Communities | KailshiansX",
  description:
    "Long-term city and community meetup brands by KailshiansX — RaibarX (Rajasthan), TricityX (Chandigarh Corridor), PadharoX (Sun City) and more. Consistent, high-trust developer gatherings.",
  alternates: {
    canonical: `${APP_URL}/meetup-series`,
  },
  openGraph: {
    title: "KailshiansX Meetup Series — Building Lasting Developer Communities",
    description:
      "Consistent, city-first developer meetup properties. Join Rajasthan's, Chandigarh's, and Western India's builder ecosystems.",
    url: `${APP_URL}/meetup-series`,
    siteName: "KailshiansX",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KailshiansX Meetup Series — Builder Communities",
    description: "Consistent, city-first developer meetup properties across India.",
    images: ["/og-image.png"],
  },
};

export default async function MeetupSeriesPage() {
  const seriesList = await getSeriesList("MEETUP");

  const totalEditions = seriesList.reduce((acc, s) => acc + s.stats.totalEditions, 0);
  const totalBuilders = seriesList.reduce((acc, s) => acc + s.stats.totalAttendees, 0);
  const totalSpeakers = seriesList.reduce((acc, s) => acc + s.stats.totalSpeakers, 0);

  return (
    <div className="bg-surface-950 min-h-screen pb-28">
      {/* Hero Section */}
      <section className="border-surface-800/80 from-surface-900/80 via-surface-950 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b pt-16 pb-12 sm:pt-24 sm:pb-16">
        {/* Glow Effects */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "#3d61fc" }}
        />

        <div className="container-page relative z-10 mx-auto max-w-5xl space-y-6 px-4 text-center">
          <div className="border-brand-500/30 bg-brand-500/10 text-brand-300 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold">
            <Radio className="text-brand-400 size-3.5 animate-pulse" />
            <span>PRD §8 — Long-Term City Meetup Properties</span>
          </div>

          <h1 className="text-surface-50 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Developer Communities Built to Last
          </h1>

          <p className="text-surface-300 mx-auto max-w-2xl text-sm leading-relaxed sm:text-base">
            KailshiansX Meetup Series are not one-off events. They are recurring, high-trust digital
            and in-person hubs anchored in specific cities and regions. Every edition builds on the
            momentum, relationships, and technical standards of the last.
          </p>

          {/* Aggregated Impact Stats Bar */}
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 pt-6 sm:grid-cols-4">
            <div className="border-surface-800 bg-surface-900/80 rounded-2xl border p-4 backdrop-blur-sm">
              <span className="text-brand-400 text-2xl font-black sm:text-3xl">
                {seriesList.length}
              </span>
              <p className="text-surface-400 mt-1 text-[11px] font-medium tracking-wider uppercase">
                Active Series
              </p>
            </div>

            <div className="border-surface-800 bg-surface-900/80 rounded-2xl border p-4 backdrop-blur-sm">
              <span className="text-surface-100 text-2xl font-black sm:text-3xl">
                {totalEditions}
              </span>
              <p className="text-surface-400 mt-1 text-[11px] font-medium tracking-wider uppercase">
                Editions Held
              </p>
            </div>

            <div className="border-surface-800 bg-surface-900/80 rounded-2xl border p-4 backdrop-blur-sm">
              <span className="text-2xl font-black text-emerald-400 sm:text-3xl">
                {totalBuilders}+
              </span>
              <p className="text-surface-400 mt-1 text-[11px] font-medium tracking-wider uppercase">
                Builders Hosted
              </p>
            </div>

            <div className="border-surface-800 bg-surface-900/80 rounded-2xl border p-4 backdrop-blur-sm">
              <span className="text-2xl font-black text-indigo-400 sm:text-3xl">
                {totalSpeakers}+
              </span>
              <p className="text-surface-400 mt-1 text-[11px] font-medium tracking-wider uppercase">
                Speakers Featured
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Series Grid */}
      <section className="container-page mx-auto max-w-5xl space-y-10 px-4 pt-14">
        <div className="border-surface-800 flex items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <h2 className="text-surface-100 text-xl font-bold">Featured Meetup Brands</h2>
            <p className="text-surface-400 text-xs">
              Explore past editions, speakers, and upcoming gatherings in each city
            </p>
          </div>
          <Badge variant="surface" className="font-mono text-xs">
            {seriesList.length} Properties
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {seriesList.map((series) => {
            const hasUpcoming = series.nextEdition !== null;

            return (
              <div
                key={series.id}
                className="group border-surface-800 from-surface-900 via-surface-900/90 to-surface-950 hover:border-brand-500/50 relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-b p-6 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
              >
                {/* Background ambient glow */}
                <div className="bg-brand-500/10 group-hover:bg-brand-500/20 pointer-events-none absolute -top-12 -right-12 size-36 rounded-full blur-2xl transition-all" />

                <div className="relative z-10 space-y-5">
                  {/* Top Bar: Region and Logo */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="from-brand-600 to-accent-600 border-surface-700 flex size-12 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-tr via-indigo-600 text-lg font-bold text-white shadow-lg">
                        {series.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-surface-50 group-hover:text-brand-300 text-xl font-bold transition-colors">
                          {series.name}
                        </h3>
                        <div className="text-surface-400 flex items-center gap-1.5 text-xs">
                          <MapPin className="size-3 shrink-0 text-rose-400" />
                          <span>{series.city || series.region || "India"}</span>
                        </div>
                      </div>
                    </div>

                    {hasUpcoming ? (
                      <Badge variant="success" className="animate-pulse text-[10px]">
                        Next Edition Live
                      </Badge>
                    ) : (
                      <Badge variant="surface" className="text-[10px]">
                        {series.stats.totalEditions} Editions
                      </Badge>
                    )}
                  </div>

                  {/* Tagline & Purpose */}
                  <div className="space-y-2">
                    {series.tagline && (
                      <p className="text-brand-300 text-xs font-semibold">{series.tagline}</p>
                    )}
                    <p className="text-surface-300 line-clamp-3 text-xs leading-relaxed">
                      {series.purpose || series.description}
                    </p>
                  </div>

                  {/* Impact Stats Pills */}
                  <div className="border-surface-800/80 grid grid-cols-3 gap-2 border-y py-3 text-center">
                    <div className="bg-surface-950/60 border-surface-800/50 rounded-xl border p-2">
                      <span className="text-surface-100 text-sm font-bold">
                        {series.stats.totalEditions}
                      </span>
                      <span className="text-surface-500 block text-[9px] uppercase">Editions</span>
                    </div>

                    <div className="bg-surface-950/60 border-surface-800/50 rounded-xl border p-2">
                      <span className="text-sm font-bold text-emerald-400">
                        {series.stats.totalAttendees}+
                      </span>
                      <span className="text-surface-500 block text-[9px] uppercase">Builders</span>
                    </div>

                    <div className="bg-surface-950/60 border-surface-800/50 rounded-xl border p-2">
                      <span className="text-sm font-bold text-indigo-400">
                        {series.stats.totalSpeakers}
                      </span>
                      <span className="text-surface-500 block text-[9px] uppercase">Speakers</span>
                    </div>
                  </div>

                  {/* Upcoming or Latest Edition Notice */}
                  {series.nextEdition ? (
                    <div className="border-brand-500/20 bg-brand-500/10 space-y-1 rounded-2xl border p-3.5">
                      <div className="text-brand-300 flex items-center justify-between text-[11px] font-semibold">
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="size-3" />
                          Edition {String(series.nextEdition.editionNo).padStart(2, "0")}
                        </span>
                        <span>
                          {new Date(series.nextEdition.startDate).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-surface-100 truncate text-xs font-bold">
                        {series.nextEdition.title}
                      </p>
                    </div>
                  ) : series.latestEdition ? (
                    <div className="border-surface-800 bg-surface-950/40 space-y-0.5 rounded-2xl border p-3">
                      <span className="text-surface-500 block text-[10px] tracking-wider uppercase">
                        Most Recent
                      </span>
                      <p className="text-surface-300 truncate text-xs font-medium">
                        Edition {String(series.latestEdition.editionNo).padStart(2, "0")} •{" "}
                        {series.latestEdition.theme || "Recap Available"}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Footer Action */}
                <div className="border-surface-800 relative z-10 mt-6 flex items-center justify-between gap-3 border-t pt-6">
                  <Button asChild variant="primary" size="sm" className="w-full">
                    <Link href={`/meetup-series/${series.slug}`}>
                      <span>Explore Series</span>
                      <ArrowRight className="ml-1.5 size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
