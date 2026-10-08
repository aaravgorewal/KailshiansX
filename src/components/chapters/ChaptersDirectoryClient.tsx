// src/components/chapters/ChaptersDirectoryClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Calendar, MapPin, Award, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ChapterSummary {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  institution: string | null;
  cityName: string | null;
  state: string | null;
  status: string;
  meetingCadence: string | null;
  location: string | null;
  healthScore: number;
  healthStatus: string;
  activeMembersCount: number;
  totalEventsCount: number;
  nextEvent: {
    id: string;
    title: string;
    date: Date | string;
    venue: string | null;
  } | null;
}

export function ChaptersDirectoryClient({
  initialChapters,
}: {
  initialChapters: ChapterSummary[];
}) {
  const [chapters] = useState(initialChapters);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = chapters.filter((c) => {
    const matchesType = filterType === "ALL" || c.type === filterType;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.institution || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.cityName || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.state || "").toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="bg-background text-foreground min-h-screen pb-24">
      {/* Hero */}
      <section className="border-border bg-card relative overflow-hidden border-b py-16 sm:py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="border-primary/30 bg-primary/10 text-primary rounded-full border px-3.5 py-1 text-xs font-bold tracking-wider uppercase">
              Community Grassroots Network ()
            </span>

            <h1 className="text-foreground mt-4 text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Campus Chapters &amp; Regional Hubs
            </h1>

            <p className="text-muted-foreground mt-4 text-sm leading-relaxed sm:text-lg">
              Explore localized builder chapters across leading engineering colleges and
              Tier-1/Tier-2 cities. Empowered with automated health tracking, dedicated leads, and
              bi-weekly build sessions.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/community#start-chapter">
                <Button className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Start a Chapter
                </Button>
              </Link>
              <Link href="/community#lead">
                <Button
                  variant="outline"
                  className="border-border hover:bg-muted text-foreground font-bold"
                >
                  Campus Lead Program
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {/* Controls */}
        <div className="border-border bg-card flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: `All Chapters (${chapters.length})` },
              { id: "CAMPUS", label: "Campus Chapters" },
              { id: "REGIONAL_CITY", label: "Regional City Hubs" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`focus-visible:ring-ring rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-[background-color,color,opacity] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80 ${
                  filterType === f.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by college, city, or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-border bg-background placeholder:text-muted-foreground text-foreground focus:border-primary w-full rounded-lg border py-2 pr-3 pl-9 text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ch) => (
            <div
              key={ch.id}
              className="group border-border bg-card hover:border-muted-foreground flex h-full flex-col justify-between rounded-xl border p-6 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase">
                    {ch.type === "CAMPUS" ? "Campus Chapter" : "Regional City Hub"}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      ch.healthScore >= 80
                        ? "border-success/20 bg-success/10 text-success border"
                        : "border-primary/20 bg-primary/10 text-primary border"
                    }`}
                  >
                    Health: {ch.healthScore}/100
                  </span>
                </div>

                <h3
                  title={ch.name}
                  className="text-foreground group-hover:text-primary mt-4 text-xl font-bold transition-colors"
                >
                  {ch.name}
                </h3>

                {ch.institution && (
                  <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                    <Award className="text-primary h-3.5 w-3.5 shrink-0" />
                    <span title={ch.institution} className="truncate">
                      {ch.institution}
                    </span>
                  </p>
                )}

                {(ch.cityName || ch.state) && (
                  <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                    <MapPin className="text-primary h-3.5 w-3.5 shrink-0" />
                    <span>{[ch.cityName, ch.state].filter(Boolean).join(", ")}</span>
                  </p>
                )}

                {ch.description && (
                  <p
                    title={ch.description}
                    className="text-muted-foreground mt-3 line-clamp-2 text-xs leading-relaxed"
                  >
                    {ch.description}
                  </p>
                )}

                <div className="text-muted-foreground border-border mt-6 flex items-center gap-4 border-t pt-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Users className="text-primary h-3.5 w-3.5" />
                    <strong>{ch.activeMembersCount}</strong> builders
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="text-primary h-3.5 w-3.5" />
                    <strong>{ch.totalEventsCount}</strong> events
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 pt-2">
                <Link href={`/chapters/${ch.slug}`} className="flex-1">
                  <Button
                    variant="outline"
                    className="border-border hover:bg-muted text-foreground w-full text-xs font-bold"
                  >
                    Public Hub
                  </Button>
                </Link>
                <Link href={`/chapters/${ch.slug}/dashboard`} className="flex-1">
                  <Button className="bg-primary hover:bg-primary-hover text-primary-foreground w-full text-xs font-bold">
                    Dashboard →
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="border-border text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
            No chapters found matching your filter.
          </div>
        )}
      </div>
    </div>
  );
}
