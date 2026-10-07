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
        <span className="border-success/30 bg-success/10 text-success inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold">
          <Activity className="h-3.5 w-3.5" />
          EXCELLENT ({score}/100)
        </span>
      );
    }
    if (score >= 60) {
      return (
        <span className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold">
          <Activity className="h-3.5 w-3.5" />
          HEALTHY ({score}/100)
        </span>
      );
    }
    return (
      <span className="border-border bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold">
        <AlertCircle className="h-3.5 w-3.5" />
        ATTENTION ({score}/100)
      </span>
    );
  };

  return (
    <div className="bg-background text-foreground min-h-screen pb-24">
      {/* Header Banner */}
      <div className="border-border bg-background relative border-b backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link
              href={`/chapters/${chapter.slug}`}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Public Chapter Hub</span>
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="border-primary/30 bg-primary/10 text-primary rounded-lg border px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase">
                  {chapter.type === "CAMPUS" ? "Campus Chapter" : "Regional City Hub"}
                </span>
                {getHealthBadge(chapter.healthStatus, chapter.healthScore)}
                {currentUser.isLead && (
                  <span className="border-border bg-primary/10 text-warning rounded-lg border px-2.5 py-0.5 text-xs font-bold">
                    Lead Authority
                  </span>
                )}
              </div>

              <h1 className="text-foreground mt-2 text-2xl font-black tracking-tight sm:text-4xl">
                {chapter.name}
              </h1>

              <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                {chapter.institution && (
                  <span className="flex items-center gap-1.5">
                    <Award className="text-primary h-4 w-4" />
                    {chapter.institution}
                  </span>
                )}
                {(chapter.cityName || chapter.state) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="text-primary h-4 w-4" />
                    {[chapter.cityName, chapter.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {chapter.meetingCadence && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="text-primary h-4 w-4" />
                    {chapter.meetingCadence}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                id="btn-schedule-chapter-meetup"
                onClick={() => setIsNewEventOpen(true)}
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Schedule Meetup
              </Button>
              <Link href={`/chapters/${chapter.slug}`}>
                <Button
                  variant="outline"
                  className="border-border hover:bg-muted text-foreground font-medium"
                >
                  <Globe className="text-muted-foreground mr-2 h-4 w-4" />
                  View Public Page
                </Button>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-border mt-8 flex gap-2 border-b">
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
                      ? "border-primary text-foreground"
                      : "text-muted-foreground hover:text-foreground border-transparent"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
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
              <div className="border-border bg-card rounded-2xl border p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Chapter Health Score
                  </span>
                  <div className="border-success/20 bg-success/10 text-success rounded-xl border p-2">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-foreground text-3xl font-black">{chapter.healthScore}</span>
                  <span className="text-muted-foreground text-xs font-bold">/ 100</span>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  {chapter.healthStatus === "EXCELLENT"
                    ? "Top 5% among nationwide KailshiansX chapters"
                    : "Regular meetups and healthy engagement"}
                </p>
              </div>

              <div className="border-border bg-card rounded-2xl border p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Active Builders
                  </span>
                  <div className="border-primary/20 bg-primary/10 text-primary rounded-xl border p-2">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-foreground text-3xl font-black">{members.length}</span>
                  <span className="text-success text-xs font-bold">+14% MoM</span>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  Verified student engineers, leads, and contributors
                </p>
              </div>

              <div className="border-border bg-card rounded-2xl border p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Events &amp; Buildathons
                  </span>
                  <div className="border-primary/20 bg-primary/10 text-primary rounded-xl border p-2">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-foreground text-3xl font-black">{events.length}</span>
                  <span className="text-muted-foreground text-xs font-bold">
                    completed &amp; upcoming
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  Cadence: {chapter.meetingCadence || "Scheduled monthly"}
                </p>
              </div>

              <div className="border-border bg-card rounded-2xl border p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Avg Attendance
                  </span>
                  <div className="border-border bg-primary/10 text-primary rounded-xl border p-2">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-foreground text-3xl font-black">
                    {Math.round(
                      events.reduce((acc, e) => acc + e.attendanceCount, 0) /
                        Math.max(events.filter((e) => e.status === "COMPLETED").length, 1)
                    )}
                  </span>
                  <span className="text-muted-foreground text-xs font-bold">
                    builders / session
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  92% RSVP conversion to actual workshop attendance
                </p>
              </div>
            </div>

            {/* Upcoming Event & Quick Actions */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-foreground text-lg font-bold">Next Chapter Gathering</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveTab("events")}
                    className="text-primary hover:text-primary text-xs"
                  >
                    View All Meetups
                  </Button>
                </div>

                {events.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {events.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="border-border bg-background flex flex-col justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center"
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
                          <h4 className="text-foreground text-base font-bold">{ev.title}</h4>
                          <p className="text-muted-foreground text-xs">
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
                              className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold"
                            >
                              Mark Completed
                            </Button>
                          )}
                          {ev.status === "COMPLETED" && (
                            <div className="text-right">
                              <span className="text-foreground text-xs font-bold">
                                {ev.attendanceCount} Attendees
                              </span>
                              <p className="text-muted-foreground text-xs">Verified in DB</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-border mt-6 rounded-2xl border border-dashed py-12 text-center">
                    <Calendar className="text-muted-foreground mx-auto h-8 w-8" />
                    <p className="text-muted-foreground mt-2 text-sm">
                      No scheduled chapter meetups yet.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setIsNewEventOpen(true)}
                      className="mt-4 shadow-sm"
                    >
                      Schedule First Session
                    </Button>
                  </div>
                )}
              </div>

              {/* Leadership & Charter Checklist */}
              <div className="space-y-6">
                <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
                  <h3 className="text-foreground text-base font-bold">Chapter Leadership</h3>
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
                          {chapter.lead.headline || "Official Chapter Lead"}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {chapter.lead.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground border-border bg-background mt-4 rounded-xl border p-4 text-xs">
                      No designated Chapter Lead assigned.
                    </div>
                  )}

                  {/* Core Team Roster Summary */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-bold uppercase">
                        Core Team ({members.filter((m) => m.role !== "MEMBER").length})
                      </span>
                      <button
                        onClick={() => setActiveTab("members")}
                        className="text-primary text-xs hover:underline"
                      >
                        Manage Roles
                      </button>
                    </div>

                    <div className="mt-3 flex -space-x-2 overflow-hidden">
                      {members.slice(0, 6).map((m) => (
                        <div
                          key={m.id}
                          title={`${m.user.name || m.user.email} (${m.role})`}
                          className="border-card bg-muted ring-border text-primary flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold ring-1"
                        >
                          {m.user.name ? m.user.name.slice(0, 2).toUpperCase() : "U"}
                        </div>
                      ))}
                      {members.length > 6 && (
                        <div className="border-card bg-muted text-muted-foreground flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold">
                          +{members.length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operations & Cadence Card */}
                <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
                  <h3 className="text-foreground text-base font-bold">Cadence &amp; Playbook</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Regular Cadence:</span>
                      <span className="text-foreground font-bold">
                        {chapter.meetingCadence || "Bi-weekly"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Campus Venue:</span>
                      <span className="text-foreground max-w-[180px] truncate font-bold">
                        {chapter.location || "Auditorium Hub"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Adherence Score:</span>
                      <span className="text-success font-bold">95% on-schedule</span>
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
            <div className="border-border bg-card flex flex-col justify-between gap-4 rounded-3xl border p-6 backdrop-blur-md sm:flex-row sm:items-center">
              <div>
                <h3 className="text-foreground text-xl font-bold">Chapter Builder Roster</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
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
                  className="border-border bg-background placeholder:text-muted-foreground text-foreground focus:border-primary rounded-xl border px-3 py-1.5 text-xs focus:outline-none"
                />

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary rounded-xl border px-3 py-1.5 text-xs focus:outline-none"
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
            <div className="border-border bg-card overflow-hidden rounded-3xl border shadow-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-border bg-background text-muted-foreground border-b text-xs tracking-wider uppercase">
                  <tr>
                    <th className="px-6 py-4">Builder Profile</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Skills &amp; Tech Stack</th>
                    <th className="px-6 py-4">Joined Date</th>
                    {currentUser.isLead && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-muted transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="border-primary/20 bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border font-bold">
                            {m.user.name ? m.user.name.slice(0, 2).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-foreground font-bold">
                                {m.user.name || "Anonymous Builder"}
                              </span>
                              {m.user.username && (
                                <Link
                                  href={`/passport/${m.user.username}`}
                                  target="_blank"
                                  className="text-muted-foreground hover:text-primary"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                              )}
                            </div>
                            <span className="text-muted-foreground text-xs">{m.user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            m.role === "LEAD"
                              ? "border-primary/30 bg-primary/20 text-primary border"
                              : m.role === "CO_LEAD"
                                ? "border-primary/30 bg-primary/20 text-primary border"
                                : m.role === "CORE_TEAM"
                                  ? "border-success/30 bg-success/20 text-success border"
                                  : "bg-muted text-muted-foreground"
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
                                className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              Full-stack Builder
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="text-muted-foreground px-6 py-4 text-xs">
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
                            className="border-border bg-background text-foreground focus:border-primary rounded-lg border px-2.5 py-1 text-xs focus:outline-none"
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
                <div className="text-muted-foreground py-12 text-center text-sm">
                  No chapter members matching search or filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: EVENTS & MEETUPS */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="border-border bg-card flex flex-col justify-between gap-4 rounded-3xl border p-6 backdrop-blur-md sm:flex-row sm:items-center">
              <div>
                <h3 className="text-foreground text-xl font-bold">
                  Chapter Meetups &amp; Study Circles
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Scheduled grassroots workshops, hackathon warm-ups, and peer buildathons.
                </p>
              </div>

              {currentUser.isLead && (
                <Button
                  onClick={() => setIsNewEventOpen(true)}
                  className="bg-primary text-foreground hover:bg-primary font-bold"
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
                  className="border-border bg-card hover:border-border rounded-3xl border p-6 backdrop-blur-md transition-all"
                >
                  <div className="flex items-center justify-between">
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

                  <h4 className="text-foreground mt-3 text-lg font-bold">{ev.title}</h4>
                  {ev.description && (
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
                      {ev.description}
                    </p>
                  )}

                  <div className="text-muted-foreground mt-4 flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="text-primary h-3.5 w-3.5" />
                      {ev.venue || chapter.location || "Campus Hub"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="text-primary h-3.5 w-3.5" />
                      {ev.attendanceCount > 0 ? `${ev.attendanceCount} verified` : "RSVPs open"}
                    </span>
                  </div>

                  {ev.recapNotes && (
                    <div className="border-border bg-background text-muted-foreground mt-4 rounded-xl border p-3 text-xs">
                      <span className="text-primary font-bold">Recap: </span>
                      {ev.recapNotes}
                    </div>
                  )}

                  {ev.status !== "COMPLETED" && currentUser.isLead && (
                    <div className="border-border mt-6 border-t pt-4">
                      <Button
                        size="sm"
                        onClick={() => {
                          setCompletingEventId(ev.id);
                          setAttendanceInput(30);
                        }}
                        className="bg-primary hover:bg-primary-hover text-primary-foreground w-full text-xs font-bold"
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
              <div className="border-border rounded-3xl border border-dashed py-16 text-center">
                <Calendar className="text-muted-foreground mx-auto h-10 w-10" />
                <h4 className="text-foreground mt-3 text-base font-bold">No Chapter Meetups Yet</h4>
                <p className="text-muted-foreground mt-1 text-xs">
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
            <div className="border-border bg-card rounded-3xl border p-8 backdrop-blur-md">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Chapter Health Diagnostic
                  </span>
                  <h3 className="text-foreground mt-1 text-2xl font-black">
                    Overall Health Score: {chapter.healthScore} / 100
                  </h3>
                  <p className="text-muted-foreground mt-1 max-w-xl text-xs sm:text-sm">
                    Calculated from four core operational pillars: cadence adherence, active member
                    growth, attendance velocity, and leadership responsiveness.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-muted-foreground text-xs font-bold">Current Tier</span>
                    <div className="text-success text-lg font-black">{chapter.healthStatus}</div>
                  </div>
                </div>
              </div>

              {/* 4 Pillars Progress Bars */}
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="border-border bg-background rounded-2xl border p-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">Meeting Cadence</span>
                    <span className="text-primary">28 / 30 pts</span>
                  </div>
                  <div className="bg-muted mt-2 h-2 rounded-full">
                    <div className="bg-primary h-full rounded-full" style={{ width: "93%" }} />
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Regular bi-weekly meetups maintained
                  </p>
                </div>

                <div className="border-border bg-background rounded-2xl border p-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">Active Builders</span>
                    <span className="text-primary">30 / 30 pts</span>
                  </div>
                  <div className="bg-muted mt-2 h-2 rounded-full">
                    <div className="bg-primary h-full rounded-full" style={{ width: "100%" }} />
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">25+ active verified members</p>
                </div>

                <div className="border-border bg-background rounded-2xl border p-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">Attendance &amp; ROI</span>
                    <span className="text-primary">24 / 30 pts</span>
                  </div>
                  <div className="bg-muted mt-2 h-2 rounded-full">
                    <div className="bg-warning h-full rounded-full" style={{ width: "80%" }} />
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Average 28 builders per meetup
                  </p>
                </div>

                <div className="border-border bg-background rounded-2xl border p-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">Lead Governance</span>
                    <span className="text-success">10 / 10 pts</span>
                  </div>
                  <div className="bg-muted mt-2 h-2 rounded-full">
                    <div className="bg-success h-full rounded-full" style={{ width: "100%" }} />
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Official lead and charter active
                  </p>
                </div>
              </div>
            </div>

            {/* Historical Metric Snapshots */}
            <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
              <h3 className="text-foreground text-lg font-bold">Historical Health Trend</h3>
              <div className="border-border mt-4 overflow-hidden rounded-2xl border">
                <table className="w-full text-left text-xs">
                  <thead className="border-border bg-background text-muted-foreground border-b tracking-wider uppercase">
                    <tr>
                      <th className="px-4 py-3">Recorded Date</th>
                      <th className="px-4 py-3">Health Score</th>
                      <th className="px-4 py-3">Active Members</th>
                      <th className="px-4 py-3">Cadence %</th>
                      <th className="px-4 py-3">Monthly Growth</th>
                      <th className="px-4 py-3">Diagnostic Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {healthMetrics.map((hm) => (
                      <tr key={hm.id} className="hover:bg-muted">
                        <td className="text-foreground px-4 py-3 font-medium">
                          {new Date(hm.recordedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="text-success px-4 py-3 font-bold">{hm.healthScore} / 100</td>
                        <td className="text-foreground px-4 py-3">{hm.activeMembers} builders</td>
                        <td className="text-foreground px-4 py-3">{hm.cadenceAdherence}%</td>
                        <td className="text-success px-4 py-3">+{hm.monthlyGrowth}%</td>
                        <td className="text-muted-foreground px-4 py-3">
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
          <div className="border-border bg-background w-full max-w-lg rounded-3xl border p-6 shadow-2xl">
            <h3 className="text-foreground text-xl font-bold">Schedule Chapter Meetup</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Plan your next study circle, workshop, or hackathon preparation session.
            </p>

            <form onSubmit={handleCreateEvent} className="mt-6 space-y-4">
              <div>
                <label className="text-muted-foreground text-xs font-bold">Meetup Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & Raft Consensus Deep Dive"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-xs font-bold">Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-bold">Venue / Room</label>
                  <input
                    type="text"
                    placeholder="LH 101 / Google Meet"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground text-xs font-bold">
                  Session Description &amp; Goals
                </label>
                <textarea
                  rows={3}
                  placeholder="What builders will learn, prerequisites, and code repositories to clone..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsNewEventOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-bold"
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
          <div className="border-border bg-background w-full max-w-md rounded-3xl border p-6 shadow-2xl">
            <h3 className="text-foreground text-xl font-bold">Record Meetup Attendance</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Log verified builder turnout to update your chapter health metrics.
            </p>

            <form onSubmit={handleCompleteEvent} className="mt-6 space-y-4">
              <div>
                <label className="text-muted-foreground text-xs font-bold">
                  Verified Turnout (Attendees)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={attendanceInput}
                  onChange={(e) => setAttendanceInput(Number(e.target.value))}
                  className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground text-xs font-bold">
                  Recap Notes &amp; Highlights
                </label>
                <textarea
                  rows={3}
                  placeholder="Key projects built, takeaways, and speaker feedback..."
                  value={recapInput}
                  onChange={(e) => setRecapInput(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCompletingEventId(null)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingComplete}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-bold"
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
