// src/components/chapters/ChapterPublicClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Activity,
  MapPin,
  Clock,
  Award,
  ArrowRight,
  Shield,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ChapterPublicData {
  chapter: {
    id: string;
    name: string;
    slug: string;
    type: string;
    description: string | null;
    institution: string | null;
    cityName: string | null;
    state: string | null;
    lead: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      username: string | null;
      headline: string | null;
      bio: string | null;
    } | null;
    status: string;
    bannerImage: string | null;
    logo: string | null;
    meetingCadence: string | null;
    location: string | null;
    healthScore: number;
    healthStatus: string;
    socialLinks: Record<string, string>;
    foundedAt: string;
    createdAt: string;
  };
  members: Array<{
    id: string;
    role: string;
    joinedAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      username: string | null;
      headline: string | null;
      skills: string[];
    };
  }>;
  events: Array<{
    id: string;
    title: string;
    description: string | null;
    date: string;
    venue: string | null;
    attendanceCount: number;
    rsvpsCount: number;
    status: string;
    recapNotes: string | null;
  }>;
  currentUser: {
    membership: { id: string; role: string; joinedAt: string } | null;
    isLead: boolean;
  };
}

export function ChapterPublicClient({ data: initialData }: { data: ChapterPublicData }) {
  const [data, setData] = useState(initialData);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(Boolean(initialData.currentUser.membership));

  const { chapter, members, events } = data;

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const res = await fetch(`/api/chapters/${chapter.slug}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.success) {
        setHasJoined(true);
        // Reload chapter state
        const reloadRes = await fetch(`/api/chapters/${chapter.slug}`);
        const reloadJson = await reloadRes.json();
        if (reloadJson.success) setData(reloadJson.data);
      } else {
        alert(json.error || "Please sign in to join chapter.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen pb-24">
      {/* Hero Section */}
      <section className="border-border bg-card relative overflow-hidden border-b py-16 sm:py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="border-primary/30 bg-primary/10 text-primary rounded-full border px-3.5 py-1 text-xs font-bold tracking-wider uppercase">
              {chapter.type === "CAMPUS" ? "Official Campus Chapter" : "Regional Builder Hub"}
            </span>
            <span className="border-success/30 bg-success/10 text-success inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold">
              <Activity className="h-3.5 w-3.5" />
              Health: {chapter.healthScore}/100 ({chapter.healthStatus})
            </span>
          </div>

          <h1 className="text-foreground mt-4 text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {chapter.name}
          </h1>

          <p className="text-muted-foreground mt-4 max-w-3xl text-sm leading-relaxed sm:text-lg">
            {chapter.description ||
              "Decentralized builder chapter connecting student engineers, founders, and researchers through bi-weekly build sessions, open-source sprints, and hackathons."}
          </p>

          <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-6 text-xs sm:text-sm">
            {chapter.institution && (
              <span className="flex items-center gap-2">
                <Award className="text-primary h-4 w-4" />
                {chapter.institution}
              </span>
            )}
            {(chapter.cityName || chapter.state) && (
              <span className="flex items-center gap-2">
                <MapPin className="text-primary h-4 w-4" />
                {[chapter.cityName, chapter.state].filter(Boolean).join(", ")}
              </span>
            )}
            {chapter.meetingCadence && (
              <span className="flex items-center gap-2">
                <Clock className="text-primary h-4 w-4" />
                {chapter.meetingCadence}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Users className="text-primary h-4 w-4" />
              {members.length} Active Builders
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {hasJoined ? (
              <Button
                disabled
                className="border-success/40 bg-success/20 text-success border font-bold"
              >
                <CheckCircle2 className="text-success mr-2 h-4 w-4" />
                Active Chapter Member
              </Button>
            ) : (
              <Button
                id="btn-join-chapter"
                onClick={handleJoin}
                disabled={isJoining}
                className="bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-2.5 font-bold shadow-sm"
              >
                {isJoining ? "Joining..." : "Join Chapter"}
              </Button>
            )}

            <Link href={`/chapters/${chapter.slug}/dashboard`}>
              <Button
                variant="outline"
                className="border-border hover:bg-muted text-foreground font-bold"
              >
                Chapter Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Main Column: Meetups & Projects */}
          <div className="space-y-12 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-foreground text-2xl font-bold">
                    Upcoming &amp; Past Meetups
                  </h2>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Grassroots engineering gatherings and study circles organized by this chapter.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="border-border bg-card hover:border-border flex flex-col justify-between gap-4 rounded-3xl border p-6 backdrop-blur-md transition-all sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            ev.status === "COMPLETED"
                              ? "border-success/20 bg-success/10 text-success border"
                              : "border-primary/20 bg-primary/10 text-primary border"
                          }`}
                        >
                          {ev.status}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(ev.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="text-foreground text-lg font-bold">{ev.title}</h3>
                      {ev.description && (
                        <p className="text-muted-foreground text-xs">{ev.description}</p>
                      )}
                      <p className="text-muted-foreground text-xs">
                        Venue: {ev.venue || chapter.location || "Campus Lab"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      {ev.status === "COMPLETED" ? (
                        <div>
                          <span className="text-foreground text-xs font-bold">
                            {ev.attendanceCount} verified attendees
                          </span>
                          <p className="text-muted-foreground text-xs">Database Record</p>
                        </div>
                      ) : (
                        <Button size="sm" className="bg-primary hover:bg-primary text-xs font-bold">
                          RSVP to Attend
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {events.length === 0 && (
                  <div className="border-border text-muted-foreground rounded-3xl border border-dashed py-12 text-center text-sm">
                    No scheduled meetups at the moment.
                  </div>
                )}
              </div>
            </div>

            {/* Chapter Roster Preview */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-foreground text-2xl font-bold">
                  Active Members &amp; Builders
                </h2>
                <Link
                  href={`/chapters/${chapter.slug}/dashboard`}
                  className="text-primary hover:text-primary inline-flex items-center gap-1 text-xs font-bold"
                >
                  View Full Roster ({members.length})
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {members.slice(0, 6).map((m) => (
                  <div
                    key={m.id}
                    className="border-border bg-card flex items-center gap-3 rounded-2xl border p-4"
                  >
                    <div className="border-primary/20 bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border font-bold">
                      {m.user.name ? m.user.name.slice(0, 2).toUpperCase() : "U"}
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground truncate text-sm font-bold">
                          {m.user.name || "Anonymous Builder"}
                        </span>
                        {m.role !== "MEMBER" && (
                          <span className="bg-primary/20 text-primary rounded px-1.5 py-0.5 text-xs font-bold">
                            {m.role}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground truncate text-xs">
                        {m.user.headline || "Full-stack Developer"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Leadership & Details */}
          <div className="space-y-6">
            <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
              <h3 className="text-foreground text-base font-bold">Designated Chapter Lead</h3>
              {chapter.lead ? (
                <div className="border-border bg-background mt-4 flex items-center gap-3 rounded-2xl border p-4">
                  <div className="border-primary/20 bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border font-bold">
                    {chapter.lead.name ? chapter.lead.name.slice(0, 2).toUpperCase() : "LD"}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-foreground truncate text-sm font-bold">
                        {chapter.lead.name}
                      </h4>
                      <Shield className="text-primary h-3.5 w-3.5" />
                    </div>
                    <p className="text-muted-foreground truncate text-xs">
                      {chapter.lead.headline || "Campus Leader"}
                    </p>
                    {chapter.lead.username && (
                      <Link
                        href={`/passport/${chapter.lead.username}`}
                        className="text-primary text-xs hover:underline"
                      >
                        View Passport →
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground mt-4 text-xs">
                  Chapter leadership is currently coordinated by the regional state council.
                </div>
              )}
            </div>

            <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
              <h3 className="text-foreground text-base font-bold">Meeting Venue &amp; Time</h3>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cadence:</span>
                  <span className="text-foreground font-bold">
                    {chapter.meetingCadence || "Bi-weekly"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Campus Hub:</span>
                  <span className="text-foreground max-w-[180px] truncate text-right font-bold">
                    {chapter.location || "Auditorium Lab"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-success font-bold">Verified Active Chapter</span>
                </div>
              </div>
            </div>

            {/* Social channels */}
            {chapter.socialLinks && Object.keys(chapter.socialLinks).length > 0 && (
              <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
                <h3 className="text-foreground text-base font-bold">Connect with Chapter</h3>
                <div className="mt-4 flex flex-col gap-2 text-xs">
                  {chapter.socialLinks.discord && (
                    <a
                      href={chapter.socialLinks.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-border bg-background text-primary hover:text-primary flex items-center justify-between rounded-xl border p-3 font-bold"
                    >
                      <span>Join Chapter Discord</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {chapter.socialLinks.whatsapp && (
                    <a
                      href={chapter.socialLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-border bg-background text-success flex items-center justify-between rounded-xl border p-3 font-bold hover:opacity-80"
                    >
                      <span>WhatsApp Group</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
