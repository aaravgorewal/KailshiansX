import * as React from "react";
import Link from "next/link";
import { ArrowRight, Layers, MapPin, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface SeriesCardProps {
  name: string;
  kind: "MEETUP" | "HACKATHON";
  tagline: string;
  description?: string;
  editionsCount: number;
  citiesCount?: number;
  cities?: string[];
  attendeesCount?: number;
  coverUrl?: string;
  href?: string;
  badgeText?: string;
  className?: string;
}

export function SeriesCard({
  name,
  kind,
  tagline,
  description,
  editionsCount,
  citiesCount,
  cities = [],
  attendeesCount,
  href = `/series/${name.toLowerCase()}`,
  badgeText,
  className,
}: SeriesCardProps) {
  const isHackathon = kind === "HACKATHON";

  return (
    <Card className={cn("group relative flex flex-col justify-between p-6 sm:p-7", className)}>
      <div>
        {/* Top badges */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <Badge
            variant="neutral"
            size="sm"
            icon={isHackathon ? <Trophy className="size-3" /> : <Layers className="size-3" />}
          >
            {isHackathon ? "Hackathon Series" : "Meetup Series"}
          </Badge>

          {badgeText && (
            <span className="border-border bg-muted text-muted-foreground rounded-full border px-2 py-0.5 font-mono text-xs">
              {badgeText}
            </span>
          )}
        </div>

        {/* Series Name & Tagline */}
        <h3 className="text-foreground hover:text-accent-text text-xl font-bold tracking-tight transition-colors sm:text-2xl">
          <Link href={href} className="focus-visible:underline focus-visible:outline-none">
            {name}
          </Link>
        </h3>

        <p className="text-muted-foreground mt-1 font-mono text-xs font-medium">{tagline}</p>

        {description && (
          <p className="text-muted-foreground mt-3 line-clamp-3 text-xs leading-relaxed sm:text-sm">
            {description}
          </p>
        )}

        {/* Cities footprint */}
        {cities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {cities.map((city) => (
              <span
                key={city}
                className="border-border bg-muted text-muted-foreground inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs"
              >
                <MapPin className="text-muted-foreground size-2.5" aria-hidden="true" />
                {city}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer statistics and link */}
      <div className="border-border mt-6 flex items-center justify-between border-t pt-4">
        <div className="text-muted-foreground flex items-center gap-4 font-mono text-xs">
          <div>
            <span className="text-foreground font-bold">{editionsCount}</span>{" "}
            {editionsCount === 1 ? "Edition" : "Editions"}
          </div>
          {Boolean(citiesCount && citiesCount > 0) && (
            <div>
              <span className="text-foreground font-bold">{citiesCount}</span> Cities
            </div>
          )}
          {Boolean(attendeesCount && attendeesCount > 0) && (
            <div className="hidden sm:block">
              <span className="text-foreground font-bold">{attendeesCount}+</span> Builders
            </div>
          )}
        </div>

        <Link
          href={href}
          aria-label={`Explore ${name} series`}
          className="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring inline-flex size-8 items-center justify-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
