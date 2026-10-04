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
    <div className="min-h-screen bg-[#07090e] pb-24 text-white">
      {/* Hero */}
      <section className="border-surface-800 via-surface-950 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b from-purple-950/20 py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.15),rgba(255,255,255,0))]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold tracking-wider text-purple-400 uppercase">
              Community Grassroots Network (PRD §10 &amp; §28)
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Campus Chapters &amp; Regional Hubs
            </h1>

            <p className="text-surface-300 mt-4 text-sm leading-relaxed sm:text-lg">
              Explore localized builder chapters across leading engineering colleges and
              Tier-1/Tier-2 cities. Empowered with automated health tracking, dedicated leads, and
              bi-weekly build sessions.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/community#start-chapter">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white shadow-xl shadow-purple-600/25 hover:from-purple-500 hover:to-pink-500">
                  <Plus className="mr-2 h-4 w-4" />
                  Start a Chapter
                </Button>
              </Link>
              <Link href="/campus-leads">
                <Button
                  variant="outline"
                  className="border-surface-700 hover:bg-surface-800 font-bold text-white"
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
        <div className="border-surface-800 bg-surface-900/60 flex flex-col justify-between gap-4 rounded-3xl border p-5 backdrop-blur-md sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: `All Chapters (${chapters.length})` },
              { id: "CAMPUS", label: "Campus Chapters" },
              { id: "REGIONAL_CITY", label: "Regional City Hubs" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  filterType === f.id
                    ? "bg-purple-600 text-white"
                    : "bg-surface-950 text-surface-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="text-surface-500 absolute top-2.5 left-3 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by college, city, or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-surface-700 bg-surface-950 placeholder-surface-500 w-full rounded-xl border py-2 pr-3 pl-9 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ch) => (
            <div
              key={ch.id}
              className="group border-surface-800 bg-surface-900/60 hover:border-surface-700 flex flex-col justify-between rounded-3xl border p-6 backdrop-blur-md transition-all hover:shadow-2xl hover:shadow-purple-950/20"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold text-purple-300 uppercase">
                    {ch.type === "CAMPUS" ? "Campus Chapter" : "Regional City Hub"}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      ch.healthScore >= 80
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border border-blue-500/20 bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    Health: {ch.healthScore}/100
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold text-white transition-colors group-hover:text-purple-300">
                  {ch.name}
                </h3>

                {ch.institution && (
                  <p className="text-surface-400 mt-1 flex items-center gap-1.5 text-xs">
                    <Award className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                    <span className="truncate">{ch.institution}</span>
                  </p>
                )}

                {(ch.cityName || ch.state) && (
                  <p className="text-surface-400 mt-1 flex items-center gap-1.5 text-xs">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-pink-400" />
                    <span>{[ch.cityName, ch.state].filter(Boolean).join(", ")}</span>
                  </p>
                )}

                {ch.description && (
                  <p className="text-surface-400 mt-3 line-clamp-2 text-xs leading-relaxed">
                    {ch.description}
                  </p>
                )}

                <div className="text-surface-400 border-surface-800/80 mt-6 flex items-center gap-4 border-t pt-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-purple-400" />
                    <strong>{ch.activeMembersCount}</strong> builders
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-pink-400" />
                    <strong>{ch.totalEventsCount}</strong> events
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 pt-2">
                <Link href={`/chapters/${ch.slug}`} className="flex-1">
                  <Button
                    variant="outline"
                    className="border-surface-700 hover:bg-surface-800 w-full text-xs font-bold text-white"
                  >
                    Public Hub
                  </Button>
                </Link>
                <Link href={`/chapters/${ch.slug}/dashboard`} className="flex-1">
                  <Button className="w-full bg-purple-600 text-xs font-bold text-white hover:bg-purple-500">
                    Dashboard →
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="border-surface-800 text-surface-400 rounded-3xl border border-dashed py-16 text-center text-sm">
            No chapters found matching your filter.
          </div>
        )}
      </div>
    </div>
  );
}
