// src/components/recommendations/RecommendationsClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  MapPin,
  ArrowRight,
  Crown,
  Video,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { UserRecommendationsPayload } from "@/server/recommendations/service";

interface Props {
  initialData: UserRecommendationsPayload;
}

export function RecommendationsClient({ initialData }: Props) {
  const { userContext, recommendedEvents, recommendedRoles } = initialData;
  const [activeFilter, setActiveFilter] = useState<"ALL" | "EVENTS" | "ROLES">("ALL");

  const getFormatBadge = (type: string) => {
    switch (type) {
      case "WORKSHOP":
        return {
          label: "Hands-on Workshop",
          className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        };
      case "TECH_TALK":
        return {
          label: "Tech Talk",
          className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        };
      case "HACKATHON":
        return {
          label: "Hackathon",
          className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        };
      default:
        return {
          label: "Community Meetup",
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };
    }
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      {/* ─── HERO HEADER ──────────────────────────────────────────────────────── */}
      <div className="border-brand-500/30 from-brand-950/40 via-surface-900 to-surface-950 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 backdrop-blur-xl sm:p-8">
        <div className="bg-brand-500/10 pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="border-brand-400/30 bg-brand-500/10 text-brand-400 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Personalized Recommendation Engine</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Recommended For You
            </h1>
            <p className="text-surface-300 max-w-2xl text-sm leading-relaxed">
              Curated opportunities tailored to your builder journey, attendance track record, and
              regional presence.
            </p>

            {/* Context pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              {userContext.city && (
                <span className="border-surface-800 bg-surface-900 text-surface-300 flex items-center gap-1 rounded-lg border px-2.5 py-1">
                  <MapPin className="text-brand-400 h-3.5 w-3.5" />
                  City: <strong className="text-white">{userContext.city}</strong>
                </span>
              )}
              {userContext.college && (
                <span className="border-surface-800 bg-surface-900 text-surface-300 flex items-center gap-1 rounded-lg border px-2.5 py-1">
                  <Building2 className="h-3.5 w-3.5 text-purple-400" />
                  Campus: <strong className="text-white">{userContext.college}</strong>
                </span>
              )}
              <span className="border-surface-800 bg-surface-900 text-surface-300 flex items-center gap-1 rounded-lg border px-2.5 py-1">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                Events Attended:{" "}
                <strong className="text-white">{userContext.eventsAttendedCount}</strong>
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="border-surface-800 bg-surface-950/80 flex items-center gap-1.5 self-start rounded-2xl border p-1 md:self-auto">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                activeFilter === "ALL"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-surface-400 hover:text-white"
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setActiveFilter("EVENTS")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                activeFilter === "EVENTS"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-surface-400 hover:text-white"
              }`}
            >
              Events ({recommendedEvents.length})
            </button>
            <button
              onClick={() => setActiveFilter("ROLES")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                activeFilter === "ROLES"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-surface-400 hover:text-white"
              }`}
            >
              Roles ({recommendedRoles.length})
            </button>
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: RECOMMENDED EVENTS ──────────────────────────────────── */}
      {(activeFilter === "ALL" || activeFilter === "EVENTS") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Calendar className="text-brand-400 h-5 w-5" />
              Upcoming Events Aligned With Your Interests
            </h2>
            <Link
              href="/events"
              className="text-brand-400 hover:text-brand-300 flex items-center gap-1 text-xs font-bold transition-colors"
            >
              Browse All Events <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recommendedEvents.length === 0 ? (
            <div className="border-surface-800 bg-surface-900/40 rounded-3xl border p-8 text-center">
              <Compass className="text-surface-500 mx-auto mb-3 h-10 w-10" />
              <p className="text-surface-300 text-sm font-semibold">
                You&apos;re already registered for all upcoming events!
              </p>
              <p className="text-surface-500 mt-1 text-xs">
                Check back soon as new city meetups and hackathons are published.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {recommendedEvents.map((evt) => {
                const badge = getFormatBadge(evt.type);
                return (
                  <div
                    key={evt.id}
                    className="group border-surface-800 bg-surface-900/70 hover:border-brand-500/50 hover:shadow-brand-500/5 relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 backdrop-blur-md transition-all duration-300 hover:shadow-xl"
                  >
                    <div>
                      {/* Top Bar: Match Score & Format */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-extrabold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{evt.matchScore}% Match</span>
                        </div>
                      </div>

                      {/* Event Title */}
                      <h3 className="group-hover:text-brand-300 mt-3 line-clamp-2 text-lg font-bold text-white transition-colors">
                        {evt.title}
                      </h3>

                      {/* Date & Location */}
                      <div className="text-surface-400 mt-3 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-brand-400 h-3.5 w-3.5 shrink-0" />
                          <span>
                            {new Date(evt.startDate).toLocaleDateString("en-IN", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {evt.isVirtual ? (
                            <Video className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                          ) : (
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                          )}
                          <span className="truncate">{evt.cityName}</span>
                        </div>
                      </div>

                      {/* Why You Match pills */}
                      <div className="border-surface-800/80 mt-4 space-y-1.5 border-t pt-3">
                        <span className="text-surface-400 font-mono text-[10px] font-bold tracking-wider uppercase">
                          Why this matches:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {evt.matchReasons.map((reason, idx) => (
                            <span
                              key={idx}
                              className="border-brand-500/20 bg-brand-500/5 text-brand-300 rounded-md border px-2 py-0.5 text-[11px] font-medium"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="border-surface-800 mt-5 border-t pt-3">
                      <Link href={`/events/${evt.slug}`}>
                        <Button variant="outline" size="sm" className="w-full justify-between">
                          <span>View Details & Register</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── SECTION 2: RECOMMENDED COMMUNITY PROGRESSION ROLES (PRD §30) ──── */}
      {(activeFilter === "ALL" || activeFilter === "ROLES") && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Crown className="h-5 w-5 text-amber-400" />
              Community Progression Ladder (PRD §30)
            </h2>
            <span className="text-surface-400 font-mono text-xs">
              Attendee &rarr; Member &rarr; Lead &rarr; Mentor
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {recommendedRoles.map((role) => (
              <div
                key={role.roleId}
                className="group border-surface-800 bg-surface-900/70 relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 backdrop-blur-md transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                      {role.badgeText}
                    </span>
                    <div className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-extrabold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{role.matchScore}% Match</span>
                    </div>
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-white transition-colors group-hover:text-amber-300">
                    {role.title}
                  </h3>

                  <p className="text-surface-300 mt-2 text-xs leading-relaxed">
                    {role.description}
                  </p>

                  <div className="text-surface-400 mt-4 flex items-center gap-2 text-xs">
                    <Clock className="text-surface-500 h-3.5 w-3.5" />
                    <span>
                      Time Commitment: <strong className="text-white">{role.commitment}</strong>
                    </span>
                  </div>

                  {/* Match Rationale */}
                  <div className="border-surface-800/80 mt-4 space-y-1.5 border-t pt-3">
                    <span className="text-surface-400 font-mono text-[10px] font-bold tracking-wider uppercase">
                      Recommended because:
                    </span>
                    <ul className="text-surface-300 space-y-1 text-xs">
                      {role.matchReasons.map((r, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-surface-800 mt-6 border-t pt-4">
                  <Link href={role.ctaLink}>
                    <Button variant="default" className="w-full justify-between">
                      <span>{role.ctaText}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
