import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { getSeriesList } from "@/server/events/series";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format-date";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansX.com";

export const metadata: Metadata = {
  title: "Hackathon Series | Build, Ship & Compete | KailshiansX",
  description:
    "Recurring high-stakes product hackathons by KailshiansX. Direct mentorship, venture incubation, and builder community.",
  alternates: {
    canonical: `${APP_URL}/hackathon-series`,
  },
  openGraph: {
    title: "KailshiansX Hackathon Series — 36-Hour Product Building",
    description:
      "Compete in premier builder hackathons with mentorship, prize pools, and incubation.",
    url: `${APP_URL}/hackathon-series`,
    siteName: "KailshiansX",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KailshiansX Hackathon Series — Build, Ship & Compete",
    description: "Recurring high-stakes product hackathons by KailshiansX.",
    images: ["/og-image.png"],
  },
};

export default async function HackathonSeriesPage() {
  const seriesList = await getSeriesList("HACKATHON");

  const totalEditions = seriesList.reduce((acc, s) => acc + s.stats.totalEditions, 0);
  const totalHackers = seriesList.reduce((acc, s) => acc + s.stats.totalAttendees, 0);

  return (
    <div className="bg-background text-foreground min-h-screen pb-24">
      {/* Hero Section */}
      <section className="border-border bg-background border-b py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              Hackathon Series
            </h1>
            <p className="text-muted-foreground text-base">
              36-hour sprint hackathons with real-world problem statements, mentorship, and seed
              backing.
            </p>

            {/* Plain Stat Row */}
            <div className="flex flex-wrap items-center gap-6 pt-2 sm:gap-10">
              {seriesList.length > 0 && (
                <div>
                  <span className="text-foreground text-2xl font-bold">{seriesList.length}</span>
                  <span className="text-muted-foreground ml-2 text-xs">Series</span>
                </div>
              )}
              {totalEditions > 0 && (
                <div>
                  <span className="text-foreground text-2xl font-bold">{totalEditions}</span>
                  <span className="text-muted-foreground ml-2 text-xs">Seasons Completed</span>
                </div>
              )}
              {totalHackers > 0 && (
                <div>
                  <span className="text-foreground text-2xl font-bold">{totalHackers}+</span>
                  <span className="text-muted-foreground ml-2 text-xs">Hackers Hosted</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Series Grid */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="border-border mb-6 flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-foreground text-lg font-bold">Active Hackathon Properties</h2>
            <p className="text-muted-foreground text-xs">
              National flagship hackathons and student developer challenges
            </p>
          </div>
          <span className="text-muted-foreground text-xs">{seriesList.length} Series</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {seriesList.map((series) => {
            const hasUpcoming = series.nextEdition !== null;

            return (
              <Card
                key={series.id}
                className="hover:border-muted-foreground flex flex-col justify-between p-6 transition-[border-color] duration-150 sm:p-7"
              >
                <div className="space-y-4">
                  {/* Top Bar: Emblem & State Text */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="border-border bg-muted text-foreground flex size-12 shrink-0 items-center justify-center rounded-lg border text-base font-bold">
                        {series.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-foreground text-xl font-bold">{series.name}</h3>
                        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                          <MapPin className="size-3.5 shrink-0" />
                          <span>{series.region || series.city || "Pan-India"}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-muted-foreground shrink-0 text-xs font-medium">
                      {hasUpcoming ? "Registration open" : `${series.stats.totalEditions} seasons`}
                    </span>
                  </div>

                  {/* Tagline & Purpose */}
                  <div className="space-y-1.5">
                    {series.tagline && (
                      <p className="text-foreground text-xs font-semibold">{series.tagline}</p>
                    )}
                    <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
                      {series.purpose || series.description}
                    </p>
                  </div>

                  {/* Impact Stats Grid */}
                  <div className="border-border flex items-center justify-around border-y py-3 text-center">
                    {series.stats.totalEditions > 0 && (
                      <div>
                        <span className="text-foreground text-sm font-bold">
                          {series.stats.totalEditions}
                        </span>
                        <span className="text-muted-foreground block text-xs">Seasons</span>
                      </div>
                    )}

                    {series.stats.totalAttendees > 0 && (
                      <div>
                        <span className="text-foreground text-sm font-bold">
                          {series.stats.totalAttendees}+
                        </span>
                        <span className="text-muted-foreground block text-xs">Hackers</span>
                      </div>
                    )}
                  </div>

                  {/* Upcoming or Latest Season Notice */}
                  {series.nextEdition ? (
                    <div className="border-border bg-muted/50 space-y-1 rounded-md border p-3">
                      <div className="text-muted-foreground flex items-center justify-between text-xs">
                        <span>Season {String(series.nextEdition.editionNo).padStart(2, "0")}</span>
                        <span>{formatDate(series.nextEdition.startDate)}</span>
                      </div>
                      <p className="text-foreground truncate text-xs font-semibold">
                        {series.nextEdition.title}
                      </p>
                      {series.nextEdition.theme && (
                        <p className="text-muted-foreground text-xs">
                          Theme: {series.nextEdition.theme}
                        </p>
                      )}
                    </div>
                  ) : series.latestEdition ? (
                    <div className="border-border bg-muted/30 space-y-0.5 rounded-md border p-2.5">
                      <span className="text-muted-foreground block text-xs">
                        Recent: Season {String(series.latestEdition.editionNo).padStart(2, "0")}
                      </span>
                      <p className="text-foreground truncate text-xs font-medium">
                        {series.latestEdition.theme || "Winners & Results Published"}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Footer Action */}
                <div className="border-border mt-6 border-t pt-4">
                  <Button asChild variant="secondary" size="sm" className="w-full">
                    <Link href={`/hackathon-series/${series.slug}`}>
                      <span>View Hackathon Details</span>
                      <ArrowRight className="ml-1.5 size-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
