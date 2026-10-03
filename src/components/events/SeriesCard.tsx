import * as React from "react";
import Link from "next/link";
import { ArrowRight, Layers, MapPin, Trophy } from "lucide-react";
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
  coverUrl,
  href = `/series/${name.toLowerCase()}`,
  badgeText,
  className,
}: SeriesCardProps) {
  const isHackathon = kind === "HACKATHON";

  return (
    <div
      className={cn(
        "group border-surface-800 bg-surface-900/80 hover:border-accent-500/50 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 backdrop-blur-sm transition-[border-color,transform] duration-200 hover:-translate-y-1 sm:p-7",
        className
      )}
    >
      {coverUrl && (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity transition-opacity duration-300 group-hover:opacity-20"
          style={{ backgroundImage: `url(${coverUrl})` }}
          aria-hidden="true"
        />
      )}
      {/* Background glow orb */}
      <div
        className={cn(
          "pointer-events-none absolute -top-16 -right-16 size-48 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-30",
          isHackathon ? "bg-accent-500" : "bg-brand-500"
        )}
      />

      <div>
        {/* Top badges */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <Badge
            variant={isHackathon ? "accent" : "brand"}
            size="sm"
            icon={isHackathon ? <Trophy className="size-3" /> : <Layers className="size-3" />}
          >
            {isHackathon ? "Hackathon Series" : "Meetup Series"}
          </Badge>

          {badgeText && (
            <span className="text-surface-400 bg-surface-800/80 border-surface-700/60 rounded-full border px-2 py-0.5 font-mono text-[11px]">
              {badgeText}
            </span>
          )}
        </div>

        {/* Series Name & Tagline */}
        <h3 className="text-surface-50 group-hover:text-accent-300 text-2xl font-extrabold tracking-tight transition-colors sm:text-3xl">
          <Link href={href} className="focus-visible:underline focus-visible:outline-none">
            {name}
          </Link>
        </h3>

        <p className="text-brand-300/90 mt-1 font-mono text-sm font-medium">{tagline}</p>

        {description && (
          <p className="text-surface-300 mt-3 line-clamp-3 text-xs leading-relaxed sm:text-sm">
            {description}
          </p>
        )}

        {/* Cities footprint */}
        {cities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {cities.map((city) => (
              <span
                key={city}
                className="bg-surface-800/70 border-surface-700/50 text-surface-300 inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px]"
              >
                <MapPin className="text-surface-500 size-2.5" aria-hidden="true" />
                {city}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer statistics and link */}
      <div className="border-surface-800/80 mt-6 flex items-center justify-between border-t pt-4">
        <div className="text-surface-400 flex items-center gap-4 font-mono text-xs">
          <div>
            <span className="text-surface-100 font-bold">{editionsCount}</span>{" "}
            {editionsCount === 1 ? "Edition" : "Editions"}
          </div>
          {citiesCount && (
            <div>
              <span className="text-surface-100 font-bold">{citiesCount}</span> Cities
            </div>
          )}
          {attendeesCount && (
            <div className="hidden sm:block">
              <span className="text-surface-100 font-bold">{attendeesCount}+</span> Builders
            </div>
          )}
        </div>

        <Link
          href={href}
          aria-label={`Explore ${name} series`}
          className="bg-surface-800/80 text-surface-200 border-surface-700 hover:bg-brand-600 hover:border-brand-500 focus-visible:ring-brand-500 inline-flex size-9 items-center justify-center rounded-xl border transition-[background-color,border-color] duration-200 hover:text-white focus-visible:ring-2"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
