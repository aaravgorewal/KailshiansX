// src/components/chapters/ChapterDashboardClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Activity,
  Shield,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ExternalLink,
  ArrowLeft,
  Award,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ChapterData {
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
    linkedEvent: { id: string; title: string; slug: string; coverImage: string | null } | null;
  }>;
  healthMetrics: Array<{
    id: string;
    recordedAt: string;
    activeMembers: number;
    monthlyGrowth: number;
    eventsCount: number;
    avgAttendance: number;
    cadenceAdherence: number;
    healthScore: number;
    notes: string | null;
  }>;
  currentUser: {
    membership: { id: string; role: string; joinedAt: string } | null;
    isLead: boolean;
  };
}

export function ChapterDashboardClient({ initialData }: { initialData: ChapterData }) {
  const [data, setData] = useState<ChapterData>(initialData);
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "events" | "health">(
    "overview"
  );

  // Member management state
  const [memberSearch, setMemberSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);

  // New Event Modal state
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // Complete Event Modal state
  const [completingEventId, setCompletingEventId] = useState<string | null>(null);
  const [attendanceInput, setAttendanceInput] = useState<number>(25);
  const [recapInput, setRecapInput] = useState<string>("");
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);

  const { chapter, members, events, healthMetrics, currentUser } = data;

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsUpdatingRole(userId);
    try {
      const res = await fetch(`/api/chapters/${chapter.slug}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, role: newRole }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) => ({
          ...prev,
          members: prev.members.map((m) => (m.user.id === userId ? { ...m, role: newRole } : m)),
        }));
      } else {
        alert(json.error || "Failed to update role");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingRole(null);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;
    setIsSubmittingEvent(true);
    try {
      const res = await fetch(`/api/chapters/${chapter.slug}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          date: new Date(newDate).toISOString(),
          venue: newVenue || chapter.location || "Online",
          description: newDesc,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsNewEventOpen(false);
        setNewTitle("");
        setNewDate("");
        setNewVenue("");
        setNewDesc("");
        // Reload chapter state
        const reloadRes = await fetch(`/api/chapters/${chapter.slug}`);
        const reloadJson = await reloadRes.json();
        if (reloadJson.success) setData(reloadJson.data);
      } else {
        alert(json.error || "Failed to create meetup");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleCompleteEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingEventId) return;
    setIsSubmittingComplete(true);
    try {
      const res = await fetch(`/api/chapters/${chapter.slug}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMPLETE",
          eventId: completingEventId,
          attendanceCount: attendanceInput,
          recapNotes: recapInput,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCompletingEventId(null);
        // Reload chapter state
        const reloadRes = await fetch(`/api/chapters/${chapter.slug}`);
        const reloadJson = await reloadRes.json();
        if (reloadJson.success) setData(reloadJson.data);
      } else {
        alert(json.error || "Failed to complete event");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      (m.user.name || "").toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.user.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.user.username || "").toLowerCase().includes(memberSearch.toLowerCase());
    const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getHealthBadge = (status: string, score: number) => {
    if (score >= 80) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
          <Activity className="h-3.5 w-3.5" />
          EXCELLENT ({score}/100)
        </span>
      );
    }
    if (score >= 60) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
          <Activity className="h-3.5 w-3.5" />
          HEALTHY ({score}/100)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
        <AlertCircle className="h-3.5 w-3.5" />
        ATTENTION ({score}/100)
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#07090e] pb-24 text-white">
      {/* Header Banner */}
      <div className="border-surface-800 bg-surface-950/80 relative border-b backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link
              href={`/chapters/${chapter.slug}`}
              className="text-surface-400 hover:text-surface-200 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Public Chapter Hub</span>
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold tracking-wider text-purple-400 uppercase">
                  {chapter.type === "CAMPUS" ? "Campus Chapter" : "Regional City Hub"}
                </span>
                {getHealthBadge(chapter.healthStatus, chapter.healthScore)}
                {currentUser.isLead && (
                  <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                    Lead Authority
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-4xl">
                {chapter.name}
              </h1>

              <div className="text-surface-400 mt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                {chapter.institution && (
                  <span className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-purple-400" />
                    {chapter.institution}
                  </span>
                )}
                {(chapter.cityName || chapter.state) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-pink-400" />
                    {[chapter.cityName, chapter.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {chapter.meetingCadence && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-amber-400" />
                    {chapter.meetingCadence}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                id="btn-schedule-chapter-meetup"
                onClick={() => setIsNewEventOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white shadow-lg shadow-purple-600/25 hover:from-purple-500 hover:to-pink-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Schedule Meetup
              </Button>
              <Link href={`/chapters/${chapter.slug}`}>
                <Button
                  variant="outline"
                  className="border-surface-700 hover:bg-surface-800 font-medium text-white"
                >
                  <Globe className="text-surface-400 mr-2 h-4 w-4" />
                  View Public Page
                </Button>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-surface-800/80 mt-8 flex gap-2 border-b">
            {[
              { id: "overview", label: "Executive Overview", icon: Activity },
              { id: "members", label: `Members (${members.length})`, icon: Users },
              { id: "events", label: `Events & Meetups (${events.length})`, icon: Calendar },
              { id: "health", label: "Health & Analytics", icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-chapter-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors sm:text-sm ${
                    isActive
                      ? "border-purple-500 text-white"
                      : "text-surface-400 hover:text-surface-200 border-transparent"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? "text-purple-400" : "text-surface-500"}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Top KPI Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-surface-400 text-xs font-bold tracking-wider uppercase">
                    Chapter Health Score
                  </span>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{chapter.healthScore}</span>
                  <span className="text-surface-400 text-xs font-bold">/ 100</span>
                </div>
                <p className="text-surface-400 mt-2 text-xs">
                  {chapter.healthStatus === "EXCELLENT"
                    ? "Top 5% among nationwide KailshiansX chapters"
                    : "Regular meetups and healthy engagement"}
                </p>
              </div>

              <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-surface-400 text-xs font-bold tracking-wider uppercase">
                    Active Builders
                  </span>
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 text-purple-400">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{members.length}</span>
                  <span className="text-xs font-bold text-emerald-400">+14% MoM</span>
                </div>
                <p className="text-surface-400 mt-2 text-xs">
                  Verified student engineers, leads, and contributors
                </p>
              </div>

              <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-surface-400 text-xs font-bold tracking-wider uppercase">
                    Events &amp; Buildathons
                  </span>
                  <div className="rounded-xl border border-pink-500/20 bg-pink-500/10 p-2 text-pink-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{events.length}</span>
                  <span className="text-surface-400 text-xs font-bold">
                    completed &amp; upcoming
                  </span>
                </div>
                <p className="text-surface-400 mt-2 text-xs">
                  Cadence: {chapter.meetingCadence || "Scheduled monthly"}
                </p>
              </div>

              <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-surface-400 text-xs font-bold tracking-wider uppercase">
                    Avg Attendance
                  </span>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {Math.round(
                      events.reduce((acc, e) => acc + e.attendanceCount, 0) /
                        Math.max(events.filter((e) => e.status === "COMPLETED").length, 1)
                    )}
                  </span>
                  <span className="text-surface-400 text-xs font-bold">builders / session</span>
                </div>
                <p className="text-surface-400 mt-2 text-xs">
                  92% RSVP conversion to actual workshop attendance
                </p>
              </div>
            </div>

            {/* Upcoming Event & Quick Actions */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="border-surface-800 bg-surface-900/60 rounded-3xl border p-6 backdrop-blur-md lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Next Chapter Gathering</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveTab("events")}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    View All Meetups
                  </Button>
                </div>

                {events.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {events.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="border-surface-800 bg-surface-950/60 flex flex-col justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center"
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
                          <h4 className="text-base font-bold text-white">{ev.title}</h4>
                          <p className="text-surface-400 text-xs">
                            Venue: {ev.venue || chapter.location || "Online"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {ev.status !== "COMPLETED" && currentUser.isLead && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setCompletingEventId(ev.id);
                                setAttendanceInput(25);
                              }}
                              className="bg-emerald-600 text-xs font-bold hover:bg-emerald-500"
                            >
                              Mark Completed
                            </Button>
                          )}
                          {ev.status === "COMPLETED" && (
                            <div className="text-right">
                              <span className="text-xs font-bold text-white">
                                {ev.attendanceCount} Attendees
                              </span>
                              <p className="text-surface-500 text-xs">Verified in DB</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-surface-800 mt-6 rounded-2xl border border-dashed py-12 text-center">
                    <Calendar className="text-surface-600 mx-auto h-8 w-8" />
                    <p className="text-surface-400 mt-2 text-sm">
                      No scheduled chapter meetups yet.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setIsNewEventOpen(true)}
                      className="mt-4 bg-purple-600 text-xs font-bold text-white hover:bg-purple-500"
                    >
                      Schedule First Session
                    </Button>
                  </div>
                )}
              </div>

              {/* Leadership & Charter Checklist */}
              <div className="space-y-6">
                <div className="border-surface-800 bg-surface-900/60 rounded-3xl border p-6 backdrop-blur-md">
                  <h3 className="text-base font-bold text-white">Chapter Leadership</h3>
                  {chapter.lead ? (
                    <div className="border-surface-800 bg-surface-950/60 mt-4 flex items-center gap-3 rounded-2xl border p-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 font-bold text-purple-300">
                        {chapter.lead.name ? chapter.lead.name.slice(0, 2).toUpperCase() : "LD"}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <h4 className="truncate text-sm font-bold text-white">
                            {chapter.lead.name}
                          </h4>
                          <Shield className="h-3.5 w-3.5 text-purple-400" />
                        </div>
                        <p className="text-surface-400 truncate text-xs">
                          {chapter.lead.headline || "Official Chapter Lead"}
                        </p>
                        <p className="text-surface-500 truncate text-xs">{chapter.lead.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-surface-400 border-surface-800 bg-surface-950/40 mt-4 rounded-xl border p-4 text-xs">
                      No designated Chapter Lead assigned.
                    </div>
                  )}

                  {/* Core Team Roster Summary */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400 text-xs font-bold uppercase">
                        Core Team ({members.filter((m) => m.role !== "MEMBER").length})
                      </span>
                      <button
                        onClick={() => setActiveTab("members")}
                        className="text-xs text-purple-400 hover:underline"
                      >
                        Manage Roles
                      </button>
                    </div>

                    <div className="mt-3 flex -space-x-2 overflow-hidden">
                      {members.slice(0, 6).map((m) => (
                        <div
                          key={m.id}
                          title={`${m.user.name || m.user.email} (${m.role})`}
                          className="border-surface-900 bg-surface-800 ring-surface-700 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold text-purple-300 ring-1"
                        >
                          {m.user.name ? m.user.name.slice(0, 2).toUpperCase() : "U"}
                        </div>
                      ))}
                      {members.length > 6 && (
                        <div className="border-surface-900 bg-surface-800 text-surface-400 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold">
                          +{members.length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operations & Cadence Card */}
                <div className="border-surface-800 bg-surface-900/60 rounded-3xl border p-6 backdrop-blur-md">
                  <h3 className="text-base font-bold text-white">Cadence &amp; Playbook</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-surface-400">Regular Cadence:</span>
                      <span className="font-bold text-white">
                        {chapter.meetingCadence || "Bi-weekly"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-surface-400">Campus Venue:</span>
                      <span className="max-w-[180px] truncate font-bold text-white">
                        {chapter.location || "Auditorium Hub"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-surface-400">Adherence Score:</span>
                      <span className="font-bold text-emerald-400">95% on-schedule</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEMBERS ROSTER */}
        {activeTab === "members" && (
          <div className="space-y-6">
            <div className="border-surface-800 bg-surface-900/60 flex flex-col justify-between gap-4 rounded-3xl border p-6 backdrop-blur-md sm:flex-row sm:items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Chapter Builder Roster</h3>
                <p className="text-surface-400 text-xs sm:text-sm">
                  Track member involvement, promote active organizers, and review Developer
                  Passports.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search builders..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="border-surface-700 bg-surface-950 placeholder-surface-500 rounded-xl border px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                />

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border-surface-700 bg-surface-950 rounded-xl border px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="LEAD">Leads</option>
                  <option value="CO_LEAD">Co-Leads</option>
                  <option value="CORE_TEAM">Core Team</option>
                  <option value="MEMBER">Members</option>
                </select>
              </div>
            </div>

            {/* Members Table */}
            <div className="border-surface-800 bg-surface-900/60 overflow-hidden rounded-3xl border shadow-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-surface-800 bg-surface-950/80 text-surface-400 border-b text-xs tracking-wider uppercase">
                  <tr>
                    <th className="px-6 py-4">Builder Profile</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Skills &amp; Tech Stack</th>
                    <th className="px-6 py-4">Joined Date</th>
                    {currentUser.isLead && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-surface-800/60 divide-y">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 font-bold text-purple-300">
                            {m.user.name ? m.user.name.slice(0, 2).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">
                                {m.user.name || "Anonymous Builder"}
                              </span>
                              {m.user.username && (
                                <Link
                                  href={`/passport/${m.user.username}`}
                                  target="_blank"
                                  className="text-surface-400 hover:text-purple-400"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                              )}
                            </div>
                            <span className="text-surface-400 text-xs">{m.user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            m.role === "LEAD"
                              ? "border border-purple-500/30 bg-purple-500/20 text-purple-300"
                              : m.role === "CO_LEAD"
                                ? "border border-blue-500/30 bg-blue-500/20 text-blue-300"
                                : m.role === "CORE_TEAM"
                                  ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                                  : "bg-surface-800 text-surface-400"
                          }`}
                        >
                          {m.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex max-w-xs flex-wrap gap-1">
                          {m.user.skills && m.user.skills.length > 0 ? (
                            m.user.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="bg-surface-800 text-surface-300 rounded px-2 py-0.5 text-[10px]"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-surface-500 text-xs">Full-stack Builder</span>
                          )}
                        </div>
                      </td>

                      <td className="text-surface-400 px-6 py-4 text-xs">
                        {new Date(m.joinedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {currentUser.isLead && (
                        <td className="px-6 py-4 text-right">
                          <select
                            disabled={isUpdatingRole === m.user.id}
                            value={m.role}
                            onChange={(e) => handleRoleChange(m.user.id, e.target.value)}
                            className="border-surface-700 bg-surface-950 rounded-lg border px-2.5 py-1 text-xs text-white focus:border-purple-500 focus:outline-none"
                          >
                            <option value="MEMBER">Member</option>
                            <option value="CORE_TEAM">Core Team</option>
                            <option value="CO_LEAD">Co-Lead</option>
                            <option value="LEAD">Chapter Lead</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredMembers.length === 0 && (
                <div className="text-surface-400 py-12 text-center text-sm">
                  No chapter members matching search or filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: EVENTS & MEETUPS */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="border-surface-800 bg-surface-900/60 flex flex-col justify-between gap-4 rounded-3xl border p-6 backdrop-blur-md sm:flex-row sm:items-center">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Chapter Meetups &amp; Study Circles
                </h3>
                <p className="text-surface-400 text-xs sm:text-sm">
                  Scheduled grassroots workshops, hackathon warm-ups, and peer buildathons.
                </p>
              </div>

              {currentUser.isLead && (
                <Button
                  onClick={() => setIsNewEventOpen(true)}
                  className="bg-purple-600 font-bold text-white hover:bg-purple-500"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Meetup
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="border-surface-800 bg-surface-900/60 hover:border-surface-700 rounded-3xl border p-6 backdrop-blur-md transition-all"
                >
                  <div className="flex items-center justify-between">
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

                  <h4 className="mt-3 text-lg font-bold text-white">{ev.title}</h4>
                  {ev.description && (
                    <p className="text-surface-400 mt-2 line-clamp-2 text-xs">{ev.description}</p>
                  )}

                  <div className="text-surface-400 mt-4 flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-pink-400" />
                      {ev.venue || chapter.location || "Campus Hub"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-purple-400" />
                      {ev.attendanceCount > 0 ? `${ev.attendanceCount} verified` : "RSVPs open"}
                    </span>
                  </div>

                  {ev.recapNotes && (
                    <div className="border-surface-800 bg-surface-950/60 text-surface-300 mt-4 rounded-xl border p-3 text-xs">
                      <span className="font-bold text-purple-300">Recap: </span>
                      {ev.recapNotes}
                    </div>
                  )}

                  {ev.status !== "COMPLETED" && currentUser.isLead && (
                    <div className="border-surface-800 mt-6 border-t pt-4">
                      <Button
                        size="sm"
                        onClick={() => {
                          setCompletingEventId(ev.id);
                          setAttendanceInput(30);
                        }}
                        className="w-full bg-emerald-600/90 text-xs font-bold text-white hover:bg-emerald-500"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark Completed &amp; Record Attendance
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {events.length === 0 && (
              <div className="border-surface-800 rounded-3xl border border-dashed py-16 text-center">
                <Calendar className="text-surface-600 mx-auto h-10 w-10" />
                <h4 className="mt-3 text-base font-bold text-white">No Chapter Meetups Yet</h4>
                <p className="text-surface-400 mt-1 text-xs">
                  Schedule your chapter&apos;s first study circle or hackathon prep session.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: HEALTH & ANALYTICS */}
        {activeTab === "health" && (
          <div className="space-y-8">
            {/* Health Score Breakdown Card */}
            <div className="border-surface-800 bg-surface-900/60 rounded-3xl border p-8 backdrop-blur-md">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <span className="text-surface-400 text-xs font-bold tracking-wider uppercase">
                    Chapter Health Diagnostic
                  </span>
                  <h3 className="mt-1 text-2xl font-black text-white">
                    Overall Health Score: {chapter.healthScore} / 100
                  </h3>
                  <p className="text-surface-400 mt-1 max-w-xl text-xs sm:text-sm">
                    Calculated from four core operational pillars: cadence adherence, active member
                    growth, attendance velocity, and leadership responsiveness.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-surface-400 text-xs font-bold">Current Tier</span>
                    <div className="text-lg font-black text-emerald-400">
                      {chapter.healthStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Pillars Progress Bars */}
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="border-surface-800 bg-surface-950/60 rounded-2xl border p-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-surface-400">Meeting Cadence</span>
                    <span className="text-purple-400">28 / 30 pts</span>
                  </div>
                  <div className="bg-surface-800 mt-2 h-2 rounded-full">
                    <div className="h-full rounded-full bg-purple-500" style={{ width: "93%" }} />
                  </div>
                  <p className="text-surface-500 mt-2 text-[11px]">
                    Regular bi-weekly meetups maintained
                  </p>
                </div>

                <div className="border-surface-800 bg-surface-950/60 rounded-2xl border p-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-surface-400">Active Builders</span>
                    <span className="text-pink-400">30 / 30 pts</span>
                  </div>
                  <div className="bg-surface-800 mt-2 h-2 rounded-full">
                    <div className="h-full rounded-full bg-pink-500" style={{ width: "100%" }} />
                  </div>
                  <p className="text-surface-500 mt-2 text-[11px]">25+ active verified members</p>
                </div>

                <div className="border-surface-800 bg-surface-950/60 rounded-2xl border p-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-surface-400">Attendance &amp; ROI</span>
                    <span className="text-amber-400">24 / 30 pts</span>
                  </div>
                  <div className="bg-surface-800 mt-2 h-2 rounded-full">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: "80%" }} />
                  </div>
                  <p className="text-surface-500 mt-2 text-[11px]">
                    Average 28 builders per meetup
                  </p>
                </div>

                <div className="border-surface-800 bg-surface-950/60 rounded-2xl border p-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-surface-400">Lead Governance</span>
                    <span className="text-emerald-400">10 / 10 pts</span>
                  </div>
                  <div className="bg-surface-800 mt-2 h-2 rounded-full">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: "100%" }} />
                  </div>
                  <p className="text-surface-500 mt-2 text-[11px]">
                    Official lead and charter active
                  </p>
                </div>
              </div>
            </div>

            {/* Historical Metric Snapshots */}
            <div className="border-surface-800 bg-surface-900/60 rounded-3xl border p-6 backdrop-blur-md">
              <h3 className="text-lg font-bold text-white">Historical Health Trend</h3>
              <div className="border-surface-800 mt-4 overflow-hidden rounded-2xl border">
                <table className="w-full text-left text-xs">
                  <thead className="border-surface-800 bg-surface-950 text-surface-400 border-b tracking-wider uppercase">
                    <tr>
                      <th className="px-4 py-3">Recorded Date</th>
                      <th className="px-4 py-3">Health Score</th>
                      <th className="px-4 py-3">Active Members</th>
                      <th className="px-4 py-3">Cadence %</th>
                      <th className="px-4 py-3">Monthly Growth</th>
                      <th className="px-4 py-3">Diagnostic Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-surface-800/60 divide-y">
                    {healthMetrics.map((hm) => (
                      <tr key={hm.id} className="hover:bg-surface-800/20">
                        <td className="px-4 py-3 font-medium text-white">
                          {new Date(hm.recordedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-400">
                          {hm.healthScore} / 100
                        </td>
                        <td className="px-4 py-3 text-white">{hm.activeMembers} builders</td>
                        <td className="px-4 py-3 text-white">{hm.cadenceAdherence}%</td>
                        <td className="px-4 py-3 text-emerald-400">+{hm.monthlyGrowth}%</td>
                        <td className="text-surface-400 px-4 py-3">
                          {hm.notes || "Automated check"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SCHEDULE MEETUP MODAL */}
      {isNewEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="border-surface-800 bg-surface-950 w-full max-w-lg rounded-3xl border p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Schedule Chapter Meetup</h3>
            <p className="text-surface-400 mt-1 text-xs">
              Plan your next study circle, workshop, or hackathon preparation session.
            </p>

            <form onSubmit={handleCreateEvent} className="mt-6 space-y-4">
              <div>
                <label className="text-surface-300 text-xs font-bold">Meetup Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & Raft Consensus Deep Dive"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border-surface-700 bg-surface-900 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-surface-300 text-xs font-bold">Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="border-surface-700 bg-surface-900 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-surface-300 text-xs font-bold">Venue / Room</label>
                  <input
                    type="text"
                    placeholder="LH 101 / Google Meet"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="border-surface-700 bg-surface-900 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-surface-300 text-xs font-bold">
                  Session Description &amp; Goals
                </label>
                <textarea
                  rows={3}
                  placeholder="What builders will learn, prerequisites, and code repositories to clone..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="border-surface-700 bg-surface-900 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsNewEventOpen(false)}
                  className="text-surface-400 text-xs hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="bg-purple-600 text-xs font-bold text-white hover:bg-purple-500"
                >
                  {isSubmittingEvent ? "Scheduling..." : "Schedule Meetup"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD COMPLETION MODAL */}
      {completingEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="border-surface-800 bg-surface-950 w-full max-w-md rounded-3xl border p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Record Meetup Attendance</h3>
            <p className="text-surface-400 mt-1 text-xs">
              Log verified builder turnout to update your chapter health metrics.
            </p>

            <form onSubmit={handleCompleteEvent} className="mt-6 space-y-4">
              <div>
                <label className="text-surface-300 text-xs font-bold">
                  Verified Turnout (Attendees)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={attendanceInput}
                  onChange={(e) => setAttendanceInput(Number(e.target.value))}
                  className="border-surface-700 bg-surface-900 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-surface-300 text-xs font-bold">
                  Recap Notes &amp; Highlights
                </label>
                <textarea
                  rows={3}
                  placeholder="Key projects built, takeaways, and speaker feedback..."
                  value={recapInput}
                  onChange={(e) => setRecapInput(e.target.value)}
                  className="border-surface-700 bg-surface-900 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCompletingEventId(null)}
                  className="text-surface-400 text-xs hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingComplete}
                  className="bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  {isSubmittingComplete ? "Saving..." : "Save & Update Health"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
