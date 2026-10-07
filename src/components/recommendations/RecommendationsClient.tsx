// src/components/recommendations/RecommendationsClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
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
          className: "bg-primary/10 text-primary border-primary/20",
        };
      case "TECH_TALK":
        return {
          label: "Tech Talk",
          className: "bg-primary/10 text-primary border-primary/20",
        };
      case "HACKATHON":
        return {
          label: "Hackathon",
          className: "bg-primary/10 text-primary border-border",
        };
      default:
        return {
          label: "Community Meetup",
          className: "bg-success/10 text-success border-success/20",
        };
    }
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      {/* ─── HERO HEADER ──────────────────────────────────────────────────────── */}
      <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold">
              <Zap className="h-3.5 w-3.5" />
              <span>Personalized Recommendation Engine</span>
            </div>
            <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
              Recommended For You
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Curated opportunities tailored to your builder journey, attendance track record, and
              regional presence.
            </p>

            {/* Context pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              {userContext.city && (
                <span className="border-border bg-card text-muted-foreground flex items-center gap-1 rounded-lg border px-2.5 py-1">
                  <MapPin className="text-primary h-3.5 w-3.5" />
                  City: <strong className="text-foreground">{userContext.city}</strong>
                </span>
              )}
              {userContext.college && (
                <span className="border-border bg-card text-muted-foreground flex items-center gap-1 rounded-lg border px-2.5 py-1">
                  <Building2 className="text-primary h-3.5 w-3.5" />
                  Campus: <strong className="text-foreground">{userContext.college}</strong>
                </span>
              )}
              <span className="border-border bg-card text-muted-foreground flex items-center gap-1 rounded-lg border px-2.5 py-1">
                <Users className="text-success h-3.5 w-3.5" />
                Events Attended:{" "}
                <strong className="text-foreground">{userContext.eventsAttendedCount}</strong>
              </span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="border-border bg-background flex items-center gap-1.5 self-start rounded-2xl border p-1 md:self-auto">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                activeFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setActiveFilter("EVENTS")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                activeFilter === "EVENTS"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Events ({recommendedEvents.length})
            </button>
            <button
              onClick={() => setActiveFilter("ROLES")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                activeFilter === "ROLES"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
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
            <h2 className="text-foreground flex items-center gap-2 text-xl font-bold">
              <Calendar className="text-primary h-5 w-5" />
              Upcoming Events Aligned With Your Interests
            </h2>
            <Link
              href="/events"
              className="text-primary hover:text-primary flex items-center gap-1 text-xs font-bold transition-colors"
            >
              Browse All Events <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recommendedEvents.length === 0 ? (
            <div className="border-border bg-card rounded-3xl border p-8 text-center">
              <Compass className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
              <p className="text-muted-foreground text-sm font-semibold">
                You&apos;re already registered for all upcoming events!
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
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
                    className="group border-border bg-card hover:border-primary/50 hover: relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 backdrop-blur-md transition-all duration-300 hover:shadow-xl"
                  >
                    <div>
                      {/* Top Bar: Match Score & Format */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <div className="border-success/30 bg-success/10 text-success flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-extrabold">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{evt.matchScore}% Match</span>
                        </div>
                      </div>

                      {/* Event Title */}
                      <h3 className="group-hover:text-primary text-foreground mt-3 line-clamp-2 text-lg font-bold transition-colors">
                        {evt.title}
                      </h3>

                      {/* Date & Location */}
                      <div className="text-muted-foreground mt-3 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-primary h-3.5 w-3.5 shrink-0" />
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
                            <Video className="text-primary h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <MapPin className="text-primary h-3.5 w-3.5 shrink-0" />
                          )}
                          <span className="truncate">{evt.cityName}</span>
                        </div>
                      </div>

                      {/* Why You Match pills */}
                      <div className="border-border mt-4 space-y-1.5 border-t pt-3">
                        <span className="text-muted-foreground font-mono text-xs font-bold tracking-wider uppercase">
                          Why this matches:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {evt.matchReasons.map((reason, idx) => (
                            <span
                              key={idx}
                              className="border-primary/20 bg-primary/5 text-primary rounded-md border px-2 py-0.5 text-xs font-medium"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="border-border mt-5 border-t pt-3">
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

      {/* ─── SECTION 2: RECOMMENDED COMMUNITY PROGRESSION ROLES () ──── */}
      {(activeFilter === "ALL" || activeFilter === "ROLES") && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground flex items-center gap-2 text-xl font-bold">
              <Crown className="text-primary h-5 w-5" />
              Community Progression Ladder ()
            </h2>
            <span className="text-muted-foreground font-mono text-xs">
              Attendee &rarr; Member &rarr; Lead &rarr; Mentor
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {recommendedRoles.map((role) => (
              <div
                key={role.roleId}
                className="group border-border bg-card hover:border-border relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 backdrop-blur-md transition-all duration-300 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="border-border bg-primary/10 text-primary rounded-full border px-3 py-1 text-xs font-bold">
                      {role.badgeText}
                    </span>
                    <div className="border-success/30 bg-success/10 text-success flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-extrabold">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{role.matchScore}% Match</span>
                    </div>
                  </div>

                  <h3 className="text-foreground group-hover:text-primary mt-3 text-xl font-bold transition-colors">
                    {role.title}
                  </h3>

                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                    {role.description}
                  </p>

                  <div className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
                    <Clock className="text-muted-foreground h-3.5 w-3.5" />
                    <span>
                      Time Commitment:{" "}
                      <strong className="text-foreground">{role.commitment}</strong>
                    </span>
                  </div>

                  {/* Match Rationale */}
                  <div className="border-border mt-4 space-y-1.5 border-t pt-3">
                    <span className="text-muted-foreground font-mono text-xs font-bold tracking-wider uppercase">
                      Recommended because:
                    </span>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      {role.matchReasons.map((r, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-border mt-6 border-t pt-4">
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
