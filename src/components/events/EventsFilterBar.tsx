"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Calendar, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface CityOption {
  name: string;
  count: number;
}

export interface EventsFilterBarProps {
  initialSearch?: string;
  initialTimeline?: string;
  initialType?: string;
  initialCity?: string;
  cities: CityOption[];
  totalResults: number;
  upcomingCount: number;
  pastCount: number;
  className?: string;
}

const TYPE_OPTIONS = [
  { id: "ALL", label: "All types" },
  { id: "MEETUP", label: "Meetup" },
  { id: "HACKATHON", label: "Hackathon" },
  { id: "WORKSHOP", label: "Workshop" },
  { id: "TECH_TALK", label: "Tech talk" },
];

export function EventsFilterBar({
  initialSearch = "",
  initialTimeline = "upcoming",
  initialType = "ALL",
  initialCity = "ALL",
  cities = [],
  totalResults,
  upcomingCount,
  pastCount,
  className,
}: EventsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchVal, setSearchVal] = React.useState(initialSearch);
  const [prevInitialSearch, setPrevInitialSearch] = React.useState(initialSearch);

  if (prevInitialSearch !== initialSearch) {
    setPrevInitialSearch(initialSearch);
    setSearchVal(initialSearch);
  }

  const updateFilters = React.useCallback(
    (updates: Record<string, string | null>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(updates).forEach(([key, val]) => {
        if (!val || val === "ALL" || (key === "timeline" && val === "upcoming") || val === "") {
          current.delete(key);
        } else {
          current.set(key, val);
        }
      });

      // Always reset to page 1 on filter modification
      current.delete("page");

      const query = current.toString();
      const targetUrl = query ? `${pathname}?${query}` : pathname;
      router.push(targetUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchVal.trim() });
  };

  const handleClearSearch = () => {
    setSearchVal("");
    updateFilters({ q: null });
  };

  const hasActiveFilters = Boolean(
    (searchParams.get("q") && searchParams.get("q") !== "") ||
    (searchParams.get("timeline") && searchParams.get("timeline") !== "upcoming") ||
    (searchParams.get("type") && searchParams.get("type") !== "ALL") ||
    (searchParams.get("city") && searchParams.get("city") !== "ALL")
  );

  const clearAllFilters = () => {
    setSearchVal("");
    router.push(pathname, { scroll: false });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input & Timeline Segmented Control */}
      <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-lg flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search events, cities, topics, venues..."
            aria-label="Search events"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring h-10 w-full rounded-md border pr-9 pl-10 text-sm focus:ring-1 focus:outline-none"
          />
          {searchVal && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 transition-colors"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </form>

        {/* Upcoming/Past/All Segmented Control */}
        <div className="border-border bg-muted inline-flex items-center self-start rounded-lg border p-1 md:self-auto">
          <button
            type="button"
            onClick={() => updateFilters({ timeline: "upcoming" })}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              initialTimeline === "upcoming"
                ? "bg-background text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calendar className="size-3.5" aria-hidden="true" />
            <span>Upcoming</span>
            {Boolean(upcomingCount && upcomingCount > 0) && (
              <span className="bg-muted py-0.2 text-foreground rounded px-1.5 font-mono text-xs">
                {upcomingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => updateFilters({ timeline: "past" })}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              initialTimeline === "past"
                ? "bg-background text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Past</span>
            {Boolean(pastCount && pastCount > 0) && (
              <span className="bg-muted py-0.2 text-foreground rounded px-1.5 font-mono text-xs">
                {pastCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => updateFilters({ timeline: "all" })}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              initialTimeline === "all"
                ? "bg-background text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>All</span>
          </button>
        </div>
      </div>

      {/* Type & City Filter Chips */}
      <div className="flex flex-col gap-3 pt-1">
        {/* Format / Type Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">Format:</span>
          {TYPE_OPTIONS.map((opt) => {
            const active = initialType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateFilters({ type: opt.id })}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors select-none",
                  active
                    ? "border-primary bg-primary/10 text-foreground font-semibold"
                    : "border-border bg-card text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* City Filter Chips */}
        {cities.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium">City:</span>
            <button
              type="button"
              onClick={() => updateFilters({ city: "ALL" })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors select-none",
                initialCity === "ALL"
                  ? "border-primary bg-primary/10 text-foreground font-semibold"
                  : "border-border bg-card text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              All cities
            </button>
            {cities.map((city) => {
              const active = initialCity.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => updateFilters({ city: city.name })}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors select-none",
                    active
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border bg-card text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  <span>{city.name}</span>
                  {Boolean(city.count && city.count > 0) && (
                    <span className="text-muted-foreground font-mono text-xs">({city.count})</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Status Summary & Clear Filters */}
      <div className="border-border text-muted-foreground flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs">
        <div>
          Showing <span className="text-foreground font-semibold">{totalResults}</span>{" "}
          {totalResults === 1 ? "event" : "events"}
          {initialCity !== "ALL" && (
            <span>
              {" "}
              in <strong className="text-foreground font-medium">{initialCity}</strong>
            </span>
          )}
          {initialType !== "ALL" && (
            <span>
              {" "}
              matching <strong className="text-foreground font-medium">{initialType}</strong>
            </span>
          )}
          {initialSearch && (
            <span>
              {" "}
              for &ldquo;<strong className="text-foreground font-medium">{initialSearch}</strong>
              &rdquo;
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-foreground hover:bg-muted h-7 gap-1.5 text-xs"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            <span>Clear filters</span>
          </Button>
        )}
      </div>
    </div>
  );
}
