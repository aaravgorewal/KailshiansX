"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface EventsFilterBarProps {
  cities: string[];
}

const TYPE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Meetups", value: "meetup" },
  { label: "Hackathons", value: "hackathon" },
  { label: "Workshops", value: "workshop" },
  { label: "Talks", value: "talk" },
];

export function EventsFilterBar({ cities }: EventsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "all";
  const currentCity = searchParams.get("city") || "all";
  const currentWhen = searchParams.get("when") || "upcoming";

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("limit"); // reset pagination on filter change

    if (!value || value === "all" || (key === "when" && value === "upcoming")) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const qs = params.toString();
    router.push(qs ? `/events?${qs}` : "/events", { scroll: false });
  };

  return (
    <div className="border-border flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
      {/* 1. Type Pills as Plain Text Buttons */}
      <div className="no-scrollbar flex items-center gap-4 overflow-x-auto sm:gap-6">
        {TYPE_OPTIONS.map((opt) => {
          const isSelected =
            currentType.toLowerCase() === opt.value.toLowerCase() ||
            (opt.value === "all" && !searchParams.get("type"));

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateParam("type", opt.value)}
              className={cn(
                "cursor-pointer text-sm font-medium whitespace-nowrap transition-colors",
                isSelected
                  ? "text-foreground underline decoration-2 underline-offset-8"
                  : "text-muted-foreground hover:text-foreground no-underline"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 2. City Select & Upcoming/Past Toggle */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* City Select */}
        <div className="relative">
          <select
            aria-label="Filter by city"
            value={currentCity}
            onChange={(e) => updateParam("city", e.target.value)}
            className="border-input bg-card text-foreground focus-visible:ring-ring flex h-9 cursor-pointer appearance-none rounded-lg border px-3 py-1 pr-8 text-sm outline-none focus-visible:ring-2"
          >
            <option value="all">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <div className="text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Upcoming / Past Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateParam("when", "upcoming")}
            className={cn(
              "cursor-pointer text-sm font-medium transition-colors",
              currentWhen === "upcoming"
                ? "text-foreground underline decoration-2 underline-offset-8"
                : "text-muted-foreground hover:text-foreground no-underline"
            )}
          >
            Upcoming
          </button>
          <span className="text-muted-foreground text-xs select-none">/</span>
          <button
            type="button"
            onClick={() => updateParam("when", "past")}
            className={cn(
              "cursor-pointer text-sm font-medium transition-colors",
              currentWhen === "past"
                ? "text-foreground underline decoration-2 underline-offset-8"
                : "text-muted-foreground hover:text-foreground no-underline"
            )}
          >
            Past
          </button>
        </div>
      </div>
    </div>
  );
}
