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
    <div className="min-h-screen bg-[#07090e] pb-24 text-white">
      {/* Hero Section */}
      <section className="border-surface-800 via-surface-950 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b from-purple-950/20 py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.15),rgba(255,255,255,0))]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold tracking-wider text-purple-400 uppercase">
              {chapter.type === "CAMPUS" ? "Official Campus Chapter" : "Regional Builder Hub"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
              <Activity className="h-3.5 w-3.5" />
              Health: {chapter.healthScore}/100 ({chapter.healthStatus})
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            {chapter.name}
          </h1>

          <p className="text-surface-300 mt-4 max-w-3xl text-sm leading-relaxed sm:text-lg">
            {chapter.description ||
              "Decentralized builder chapter connecting student engineers, founders, and researchers through bi-weekly build sessions, open-source sprints, and hackathons."}
          </p>

          <div className="text-surface-400 mt-6 flex flex-wrap items-center gap-6 text-xs sm:text-sm">
            {chapter.institution && (
              <span className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-400" />
                {chapter.institution}
              </span>
            )}
            {(chapter.cityName || chapter.state) && (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-pink-400" />
                {[chapter.cityName, chapter.state].filter(Boolean).join(", ")}
              </span>
            )}
            {chapter.meetingCadence && (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                {chapter.meetingCadence}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              {members.length} Active Builders
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {hasJoined ? (
              <Button
                disabled
                className="border border-emerald-500/50 bg-emerald-600/30 font-bold text-emerald-300"
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
                Active Chapter Member
              </Button>
            ) : (
              <Button
                id="btn-join-chapter"
                onClick={handleJoin}
                disabled={isJoining}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 font-bold text-white shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-pink-500"
              >
                {isJoining ? "Joining..." : "Join Chapter"}
              </Button>
            )}

            <Link href={`/chapters/${chapter.slug}/dashboard`}>
              <Button
                variant="outline"
                className="border-surface-700 hover:bg-surface-800 font-bold text-white"
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
                  <h2 className="text-2xl font-bold text-white">Upcoming &amp; Past Meetups</h2>
                  <p className="text-surface-400 text-xs sm:text-sm">
                    Grassroots engineering gatherings and study circles organized by this chapter.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="border-surface-800 bg-surface-900/60 hover:border-surface-700 flex flex-col justify-between gap-4 rounded-3xl border p-6 backdrop-blur-md transition-all sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            ev.status === "COMPLETED"
                              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : "border border-purple-500/20 bg-purple-500/10 text-purple-400"
                          }`}
                        >
                          {ev.status}
                        </span>
                        <span className="text-surface-400 text-xs">
                          {new Date(ev.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{ev.title}</h3>
                      {ev.description && (
                        <p className="text-surface-400 text-xs">{ev.description}</p>
                      )}
                      <p className="text-surface-500 text-xs">
                        Venue: {ev.venue || chapter.location || "Campus Lab"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      {ev.status === "COMPLETED" ? (
                        <div>
                          <span className="text-xs font-bold text-white">
                            {ev.attendanceCount} verified attendees
                          </span>
                          <p className="text-surface-500 text-[11px]">Database Record</p>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-purple-600 text-xs font-bold hover:bg-purple-500"
                        >
                          RSVP to Attend
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {events.length === 0 && (
                  <div className="border-surface-800 text-surface-400 rounded-3xl border border-dashed py-12 text-center text-sm">
                    No scheduled meetups at the moment.
                  </div>
                )}
              </div>
            </div>

            {/* Chapter Roster Preview */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Active Members &amp; Builders</h2>
                <Link
                  href={`/chapters/${chapter.slug}/dashboard`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300"
                >
                  View Full Roster ({members.length})
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {members.slice(0, 6).map((m) => (
                  <div
                    key={m.id}
                    className="border-surface-800 bg-surface-900/60 flex items-center gap-3 rounded-2xl border p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 font-bold text-purple-300">
                      {m.user.name ? m.user.name.slice(0, 2).toUpperCase() : "U"}
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-bold text-white">
                          {m.user.name || "Anonymous Builder"}
                        </span>
                        {m.role !== "MEMBER" && (
                          <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300">
                            {m.role}
                          </span>
                        )}
                      </div>
                      <p className="text-surface-400 truncate text-xs">
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
            <div className="border-surface-800 bg-surface-900/60 rounded-3xl border p-6 backdrop-blur-md">
              <h3 className="text-base font-bold text-white">Designated Chapter Lead</h3>
              {chapter.lead ? (
                <div className="border-surface-800 bg-surface-950/60 mt-4 flex items-center gap-3 rounded-2xl border p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 font-bold text-purple-300">
                    {chapter.lead.name ? chapter.lead.name.slice(0, 2).toUpperCase() : "LD"}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <h4 className="truncate text-sm font-bold text-white">{chapter.lead.name}</h4>
                      <Shield className="h-3.5 w-3.5 text-purple-400" />
                    </div>
                    <p className="text-surface-400 truncate text-xs">
                      {chapter.lead.headline || "Campus Leader"}
                    </p>
                    {chapter.lead.username && (
                      <Link
                        href={`/passport/${chapter.lead.username}`}
                        className="text-xs text-purple-400 hover:underline"
                      >
                        View Passport →
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-surface-400 mt-4 text-xs">
                  Chapter leadership is currently coordinated by the regional state council.
                </div>
              )}
            </div>

            <div className="border-surface-800 bg-surface-900/60 rounded-3xl border p-6 backdrop-blur-md">
              <h3 className="text-base font-bold text-white">Meeting Venue &amp; Time</h3>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-surface-400">Cadence:</span>
                  <span className="font-bold text-white">
                    {chapter.meetingCadence || "Bi-weekly"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-400">Campus Hub:</span>
                  <span className="max-w-[180px] truncate text-right font-bold text-white">
                    {chapter.location || "Auditorium Lab"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-400">Status:</span>
                  <span className="font-bold text-emerald-400">Verified Active Chapter</span>
                </div>
              </div>
            </div>

            {/* Social channels */}
            {chapter.socialLinks && Object.keys(chapter.socialLinks).length > 0 && (
              <div className="border-surface-800 bg-surface-900/60 rounded-3xl border p-6 backdrop-blur-md">
                <h3 className="text-base font-bold text-white">Connect with Chapter</h3>
                <div className="mt-4 flex flex-col gap-2 text-xs">
                  {chapter.socialLinks.discord && (
                    <a
                      href={chapter.socialLinks.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-surface-800 bg-surface-950 flex items-center justify-between rounded-xl border p-3 font-bold text-purple-400 hover:text-purple-300"
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
                      className="border-surface-800 bg-surface-950 flex items-center justify-between rounded-xl border p-3 font-bold text-emerald-400 hover:text-emerald-300"
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
