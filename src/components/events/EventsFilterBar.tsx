"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, MapPin, Calendar, Layers, RotateCcw } from "lucide-react";
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
  { id: "ALL", label: "All Types" },
  { id: "MEETUP", label: "Meetups" },
  { id: "HACKATHON", label: "Hackathons" },
  { id: "WORKSHOP", label: "Workshops" },
  { id: "TECH_TALK", label: "Tech Talks" },
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
    <div className={cn("space-y-6", className)}>
      {/* Search Bar & Timeline Tabs */}
      <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-lg flex-1">
          <Search className="text-surface-400 pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <input
            type="search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search events, cities, topics, venues..."
            aria-label="Search events"
            className="bg-surface-900 border-surface-700/80 text-surface-100 placeholder:text-surface-500 focus:ring-brand-500/50 focus:border-brand-500 h-11 w-full rounded-xl border pr-10 pl-10 text-sm shadow-inner transition-all focus:ring-2 focus:outline-none"
          />
          {searchVal && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="text-surface-400 hover:text-surface-200 absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1"
            >
              <X className="size-4" />
            </button>
          )}
        </form>

        {/* Timeline Switcher (Upcoming / Past / All) */}
        <div className="bg-surface-900 border-surface-800 inline-flex items-center self-start rounded-xl border p-1 md:self-auto">
          <button
            type="button"
            onClick={() => updateFilters({ timeline: "upcoming" })}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
              initialTimeline === "upcoming"
                ? "bg-brand-600 font-semibold text-white shadow-sm"
                : "text-surface-400 hover:text-surface-200"
            )}
          >
            <Calendar className="size-3.5" />
            <span>Upcoming</span>
            <span
              className={cn(
                "py-0.2 rounded-full px-1.5 font-mono text-[10px]",
                initialTimeline === "upcoming"
                  ? "bg-brand-700 text-white"
                  : "bg-surface-800 text-surface-400"
              )}
            >
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => updateFilters({ timeline: "past" })}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
              initialTimeline === "past"
                ? "bg-brand-600 font-semibold text-white shadow-sm"
                : "text-surface-400 hover:text-surface-200"
            )}
          >
            <span>Past Archive</span>
            <span
              className={cn(
                "py-0.2 rounded-full px-1.5 font-mono text-[10px]",
                initialTimeline === "past"
                  ? "bg-brand-700 text-white"
                  : "bg-surface-800 text-surface-400"
              )}
            >
              {pastCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => updateFilters({ timeline: "all" })}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
              initialTimeline === "all"
                ? "bg-brand-600 font-semibold text-white shadow-sm"
                : "text-surface-400 hover:text-surface-200"
            )}
          >
            <span>All</span>
          </button>
        </div>
      </div>

      {/* Type & City Filter Chips */}
      <div className="flex flex-col gap-3 pt-2">
        {/* Event Type Filter */}
        <div className="flex scrollbar-none items-center gap-2 overflow-x-auto py-1">
          <div className="text-surface-400 mr-1 flex shrink-0 items-center gap-1 text-xs font-medium">
            <Layers className="text-surface-500 size-3.5" />
            <span>Format:</span>
          </div>

          {TYPE_OPTIONS.map((opt) => {
            const active = initialType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateFilters({ type: opt.id })}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all select-none",
                  active
                    ? "border-brand-500/80 bg-brand-500/15 text-brand-300 font-semibold shadow-[0_0_12px_rgba(61,97,252,0.25)]"
                    : "border-surface-800 bg-surface-900/60 text-surface-300 hover:border-surface-700 hover:text-surface-100"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* City Filter */}
        {cities.length > 0 && (
          <div className="flex scrollbar-none items-center gap-2 overflow-x-auto py-1">
            <div className="text-surface-400 mr-1 flex shrink-0 items-center gap-1 text-xs font-medium">
              <MapPin className="text-surface-500 size-3.5" />
              <span>City:</span>
            </div>

            <button
              type="button"
              onClick={() => updateFilters({ city: "ALL" })}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all select-none",
                initialCity === "ALL"
                  ? "border-accent-500/80 bg-accent-500/15 text-accent-300 font-semibold shadow-[0_0_12px_rgba(139,61,255,0.25)]"
                  : "border-surface-800 bg-surface-900/60 text-surface-300 hover:border-surface-700 hover:text-surface-100"
              )}
            >
              All Cities
            </button>

            {cities.map((city) => {
              const active = initialCity.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => updateFilters({ city: city.name })}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all select-none",
                    active
                      ? "border-accent-500/80 bg-accent-500/15 text-accent-300 font-semibold shadow-[0_0_12px_rgba(139,61,255,0.25)]"
                      : "border-surface-800 bg-surface-900/60 text-surface-300 hover:border-surface-700 hover:text-surface-100"
                  )}
                >
                  <span>{city.name}</span>
                  <span
                    className={cn(
                      "py-0.2 rounded-full px-1.5 font-mono text-[10px]",
                      active
                        ? "bg-accent-500/30 text-accent-200"
                        : "bg-surface-800 text-surface-400"
                    )}
                  >
                    {city.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Status Summary & Reset Button */}
      <div className="border-surface-800/80 text-surface-400 flex items-center justify-between border-t pt-2 text-xs">
        <div>
          Showing <span className="text-surface-100 font-semibold">{totalResults}</span>{" "}
          {totalResults === 1 ? "gathering" : "gatherings"}
          {initialCity !== "ALL" && (
            <span>
              {" "}
              in <strong className="text-surface-200 font-medium">{initialCity}</strong>
            </span>
          )}
          {initialType !== "ALL" && (
            <span>
              {" "}
              matching <strong className="text-surface-200 font-medium">{initialType}</strong>
            </span>
          )}
          {initialSearch && (
            <span>
              {" "}
              for &ldquo;<strong className="text-surface-200 font-medium">{initialSearch}</strong>
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
            className="text-brand-400 hover:text-brand-300 h-8 gap-1.5 text-xs"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>
    </div>
  );
}
