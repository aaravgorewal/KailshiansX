import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Zap, MapPin, ArrowRight } from "lucide-react";
import { getSeriesList } from "@/server/events/series";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hackathon Series | Build, Ship & Compete | KailshiansX",
  description:
    "Recurring high-stakes product hackathons by KailshiansX — NirmanX (National 36-Hour Hackathon), AarambhX (Rookie & Campus Hackathon) and more. Cash prizes, cloud credits, VC incubation, and real problem statements.",
  openGraph: {
    title: "KailshiansX Hackathon Series — 36-Hour Product Building",
    description:
      "Compete in India's most challenging builder hackathons. Cash prize pools, top mentors, and seed incubation backing.",
    url: "https://kailshiansx.com/hackathon-series",
  },
};

export default async function HackathonSeriesPage() {
  const seriesList = await getSeriesList("HACKATHON");

  const totalEditions = seriesList.reduce((acc, s) => acc + s.stats.totalEditions, 0);
  const totalHackers = seriesList.reduce((acc, s) => acc + s.stats.totalAttendees, 0);

  return (
    <div className="bg-surface-950 min-h-screen pb-28">
      {/* Hero Section */}
      <section className="border-surface-800/80 from-surface-900/80 via-surface-950 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b pt-16 pb-12 sm:pt-24 sm:pb-16">
        {/* Glow Effects */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "#7928ca" }}
        />

        <div className="container-page relative z-10 mx-auto max-w-5xl space-y-6 px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300">
            <Zap className="size-3.5 text-purple-400" />
            <span>PRD §9 — Recurring Hackathon Properties</span>
          </div>

          <h1 className="text-surface-50 text-3xl font-extrabold tracking-tight sm:text-5xl">
            High-Stakes 36-Hour Product Hackathons
          </h1>

          <p className="text-surface-300 mx-auto max-w-2xl text-sm leading-relaxed sm:text-base">
            KailshiansX Hackathon Series are high-velocity builder battlegrounds. We provide real
            industry problem statements, heavy cloud compute, direct mentor pairing, and over
            ₹10,00,000+ in annual prize pools and venture incubation.
          </p>

          {/* Aggregated Stats Bar */}
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 pt-6 sm:grid-cols-4">
            <div className="border-surface-800 bg-surface-900/80 rounded-2xl border p-4 backdrop-blur-sm">
              <span className="text-2xl font-black text-purple-400 sm:text-3xl">
                {seriesList.length}
              </span>
              <p className="text-surface-400 mt-1 text-[11px] font-medium tracking-wider uppercase">
                Hackathon Series
              </p>
            </div>

            <div className="border-surface-800 bg-surface-900/80 rounded-2xl border p-4 backdrop-blur-sm">
              <span className="text-surface-100 text-2xl font-black sm:text-3xl">
                {totalEditions}
              </span>
              <p className="text-surface-400 mt-1 text-[11px] font-medium tracking-wider uppercase">
                Completed Seasons
              </p>
            </div>

            <div className="border-surface-800 bg-surface-900/80 rounded-2xl border p-4 backdrop-blur-sm">
              <span className="text-2xl font-black text-emerald-400 sm:text-3xl">₹8,00,000+</span>
              <p className="text-surface-400 mt-1 text-[11px] font-medium tracking-wider uppercase">
                Prize Money Awarded
              </p>
            </div>

            <div className="border-surface-800 bg-surface-900/80 rounded-2xl border p-4 backdrop-blur-sm">
              <span className="text-2xl font-black text-amber-400 sm:text-3xl">
                {totalHackers}+
              </span>
              <p className="text-surface-400 mt-1 text-[11px] font-medium tracking-wider uppercase">
                Builders & Hackers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Series Grid */}
      <section className="container-page mx-auto max-w-5xl space-y-10 px-4 pt-14">
        <div className="border-surface-800 flex items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <h2 className="text-surface-100 text-xl font-bold">Recurring Hackathon Series</h2>
            <p className="text-surface-400 text-xs">
              National flagship hackathons and rookie campus builder challenges
            </p>
          </div>
          <Badge variant="surface" className="font-mono text-xs">
            {seriesList.length} Series
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {seriesList.map((series) => {
            const hasUpcoming = series.nextEdition !== null;

            return (
              <div
                key={series.id}
                className="group border-surface-800 from-surface-900 via-surface-900/90 to-surface-950 relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-b p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-500/50 sm:p-8"
              >
                {/* Background ambient glow */}
                <div className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-purple-500/10 blur-3xl transition-all group-hover:bg-purple-500/20" />

                <div className="relative z-10 space-y-6">
                  {/* Top Bar: Emblem & Status */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="border-surface-700 flex size-14 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 text-xl font-black text-white shadow-xl">
                        {series.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-surface-50 text-2xl font-bold transition-colors group-hover:text-purple-300">
                          {series.name}
                        </h3>
                        <div className="text-surface-400 flex items-center gap-1.5 text-xs">
                          <MapPin className="size-3 shrink-0 text-rose-400" />
                          <span>{series.region || series.city || "Pan-India"}</span>
                        </div>
                      </div>
                    </div>

                    {hasUpcoming ? (
                      <Badge variant="success" className="animate-pulse text-xs">
                        Registration Open
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-purple-500/40 text-xs text-purple-300"
                      >
                        {series.stats.totalEditions} Seasons
                      </Badge>
                    )}
                  </div>

                  {/* Tagline & Purpose */}
                  <div className="space-y-2">
                    {series.tagline && (
                      <p className="text-sm font-semibold text-purple-300">{series.tagline}</p>
                    )}
                    <p className="text-surface-300 line-clamp-3 text-xs leading-relaxed">
                      {series.purpose || series.description}
                    </p>
                  </div>

                  {/* Impact Stats Grid */}
                  <div className="border-surface-800/80 grid grid-cols-3 gap-3 border-y py-4 text-center">
                    <div className="bg-surface-950/60 border-surface-800/50 rounded-2xl border p-3">
                      <span className="text-surface-100 text-base font-bold">
                        {series.stats.totalEditions}
                      </span>
                      <span className="text-surface-500 block text-[10px] uppercase">Seasons</span>
                    </div>

                    <div className="bg-surface-950/60 border-surface-800/50 rounded-2xl border p-3">
                      <span className="text-base font-bold text-emerald-400">
                        {series.stats.totalAttendees}+
                      </span>
                      <span className="text-surface-500 block text-[10px] uppercase">Hackers</span>
                    </div>

                    <div className="bg-surface-950/60 border-surface-800/50 rounded-2xl border p-3">
                      <span className="text-base font-bold text-amber-400">
                        {series.slug === "nirmanx" ? "₹5L+" : "₹1.5L+"}
                      </span>
                      <span className="text-surface-500 block text-[10px] uppercase">Prizes</span>
                    </div>
                  </div>

                  {/* Upcoming or Latest Edition Notice */}
                  {series.nextEdition ? (
                    <div className="space-y-1.5 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                        <span className="inline-flex items-center gap-1.5">
                          <Trophy className="size-3.5 text-amber-400" />
                          Upcoming Edition {String(series.nextEdition.editionNo).padStart(2, "0")}
                        </span>
                        <span>
                          {new Date(series.nextEdition.startDate).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-surface-100 truncate text-sm font-bold">
                        {series.nextEdition.title}
                      </p>
                      {series.nextEdition.theme && (
                        <p className="text-xs text-purple-300">Theme: {series.nextEdition.theme}</p>
                      )}
                    </div>
                  ) : series.latestEdition ? (
                    <div className="border-surface-800 bg-surface-950/40 space-y-1 rounded-2xl border p-3.5">
                      <span className="text-surface-500 block text-[10px] tracking-wider uppercase">
                        Recent Season
                      </span>
                      <p className="text-surface-300 truncate text-xs font-medium">
                        Season {String(series.latestEdition.editionNo).padStart(2, "0")} •{" "}
                        {series.latestEdition.theme || "Winners & Results Published"}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Footer Action */}
                <div className="border-surface-800 relative z-10 mt-6 flex items-center justify-between gap-3 border-t pt-6">
                  <Button
                    asChild
                    variant="primary"
                    size="md"
                    className="w-full shadow-lg shadow-purple-500/20"
                  >
                    <Link href={`/hackathon-series/${series.slug}`}>
                      <span>View Hackathon Details & Editions</span>
                      <ArrowRight className="ml-2 size-4" />
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
