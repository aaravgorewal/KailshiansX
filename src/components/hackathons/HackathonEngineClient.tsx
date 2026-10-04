"use client";

// src/components/hackathons/HackathonEngineClient.tsx
// Comprehensive Hackathon Experience Component per PRD §9 & §24:
// 1. Team Formation, Member Roster, Join Code Copying.
// 2. Problem Statement Selection with Track Filtering.
// 3. Project Submission (GitHub repo, live demo, deck, video, tech stack).
// 4. Live Leaderboard & Official Results Podium.
// 5. Prize Disbursement & Certificate Tracking.

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Code2,
  Trophy,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Plus,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { HackathonTeamStatus, TeamMemberRole } from "@prisma/client";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export interface HackathonEngineData {
  event: {
    id: string;
    title: string;
    slug: string;
    startDate: string;
  };
  detail: {
    id: string;
    eventId: string;
    minTeamSize: number;
    maxTeamSize: number;
    rules: string | null;
    submissionDeadline: string | null;
    isResultsPublished: boolean;
    resultsPublishedAt: string | null;
    problemStatementsList: Array<{
      id: string;
      title: string;
      slug: string;
      description: string;
      track: string;
      criteria: string[];
      sponsorName: string | null;
      sponsorLogo: string | null;
    }>;
    rubricCriteria: Array<{
      id: string;
      name: string;
      description: string | null;
      maxScore: number;
      weight: number;
    }>;
    prizesList: Array<{
      id: string;
      title: string;
      rank: number | null;
      track: string | null;
      cashAmount: number | string;
      currency: string;
      perks: string[];
      disbursementStatus: string;
      winningTeam: { id: string; name: string } | null;
    }>;
  };
  userTeam: {
    id: string;
    name: string;
    slug: string;
    inviteCode: string;
    leaderId: string;
    problemStatementId: string | null;
    track: string | null;
    status: HackathonTeamStatus;
    members: Array<{
      id: string;
      userId: string;
      role: TeamMemberRole;
      status: string;
      user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
        username: string | null;
      };
    }>;
    submission: {
      id: string;
      title: string;
      tagline: string | null;
      description: string;
      track: string;
      repoUrl: string;
      demoUrl: string | null;
      deckUrl: string | null;
      videoUrl: string | null;
      techStack: string[];
      status: string;
      submittedAt: string;
      normalizedScore: number | null;
      rank: number | null;
      isWinner: boolean;
      winnerTier: string | null;
    } | null;
  } | null;
  currentUserId?: string;
  userRole?: string;
}

export function HackathonEngineClient({ initialData }: { initialData: HackathonEngineData }) {
  const [data, setData] = React.useState(initialData);
  const [activeTab, setActiveTab] = React.useState<
    "TEAMS" | "SUBMISSION" | "LEADERBOARD" | "PRIZES"
  >("TEAMS");

  // Modals & form state
  const [createTeamModalOpen, setCreateTeamModalOpen] = React.useState(false);
  const [joinTeamModalOpen, setJoinTeamModalOpen] = React.useState(false);
  const [submittingTeam, setSubmittingTeam] = React.useState(false);
  const [submittingProject, setSubmittingProject] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [selectedTrackFilter, setSelectedTrackFilter] = React.useState("ALL");

  // Forms
  const [teamForm, setTeamForm] = React.useState({
    name: "",
    track: data.detail.problemStatementsList[0]?.track || "",
    problemStatementId: data.detail.problemStatementsList[0]?.id || "",
  });

  const [joinCodeInput, setJoinCodeInput] = React.useState("");

  const [projectForm, setProjectForm] = React.useState({
    title: data.userTeam?.submission?.title || "",
    tagline: data.userTeam?.submission?.tagline || "",
    description: data.userTeam?.submission?.description || "",
    track: data.userTeam?.submission?.track || data.userTeam?.track || "General Track",
    repoUrl: data.userTeam?.submission?.repoUrl || "",
    demoUrl: data.userTeam?.submission?.demoUrl || "",
    deckUrl: data.userTeam?.submission?.deckUrl || "",
    videoUrl: data.userTeam?.submission?.videoUrl || "",
    techStack:
      data.userTeam?.submission?.techStack?.join(", ") || "Next.js, TypeScript, PostgreSQL",
  });

  const [formMessage, setFormMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isLeader = data.userTeam && data.currentUserId === data.userTeam.leaderId;
  const isPrivileged = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "JUDGE"].includes(
    data.userRole || ""
  );

  // Unique tracks list
  const tracks = React.useMemo(() => {
    const set = new Set<string>();
    data.detail.problemStatementsList.forEach((ps) => {
      if (ps.track) set.add(ps.track);
    });
    return Array.from(set);
  }, [data.detail.problemStatementsList]);

  // Copy helpers
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInviteLink = (code: string) => {
    const url = `${window.location.origin}/events/${data.event.slug}?joinCode=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Create Team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTeam(true);
    setFormMessage(null);
    try {
      const res = await fetch("/api/hackathons/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hackathonDetailId: data.detail.id,
          name: teamForm.name,
          track: teamForm.track,
          problemStatementId: teamForm.problemStatementId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create team");

      setData((prev) => ({
        ...prev,
        userTeam: json.data,
      }));
      setCreateTeamModalOpen(false);
      setFormMessage({
        type: "success",
        text: "Team created successfully! Invite your teammates.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create team";
      setFormMessage({ type: "error", text: msg });
    } finally {
      setSubmittingTeam(false);
    }
  };

  // Join Team with code
  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTeam(true);
    setFormMessage(null);
    try {
      const res = await fetch("/api/hackathons/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: joinCodeInput,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to join team");

      setData((prev) => ({
        ...prev,
        userTeam: json.data,
      }));
      setJoinTeamModalOpen(false);
      setFormMessage({ type: "success", text: `Joined team "${json.data.name}"!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to join team";
      setFormMessage({ type: "error", text: msg });
    } finally {
      setSubmittingTeam(false);
    }
  };

  // Select problem statement
  const handleSelectProblemStatement = async (psId: string) => {
    if (!data.userTeam) return;
    try {
      const res = await fetch("/api/hackathons/teams/problem-statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: data.userTeam.id,
          problemStatementId: psId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to select problem statement");

      setData((prev) => ({
        ...prev,
        userTeam: json.data,
      }));
      setFormMessage({ type: "success", text: "Problem statement selected for your team!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to select problem statement";
      setFormMessage({ type: "error", text: msg });
    }
  };

  // Submit project
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.userTeam) return;
    setSubmittingProject(true);
    setFormMessage(null);
    try {
      const stackArray = projectForm.techStack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/hackathons/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: data.userTeam.id,
          title: projectForm.title,
          tagline: projectForm.tagline,
          description: projectForm.description,
          track: projectForm.track,
          repoUrl: projectForm.repoUrl,
          demoUrl: projectForm.demoUrl || undefined,
          deckUrl: projectForm.deckUrl || undefined,
          videoUrl: projectForm.videoUrl || undefined,
          techStack: stackArray,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit project");

      setData((prev) => ({
        ...prev,
        userTeam: prev.userTeam ? { ...prev.userTeam, submission: json.data } : null,
      }));
      setFormMessage({
        type: "success",
        text: "Project submission recorded successfully! Good luck!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit project";
      setFormMessage({ type: "error", text: msg });
    } finally {
      setSubmittingProject(false);
    }
  };

  return (
    <div className="space-y-8" id="hackathon-engine-portal">
      {/* ─── FEEDBACK TOAST / BANNER ────────────────────────────────────────── */}
      {formMessage && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs font-semibold transition-all sm:text-sm ${
            formMessage.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {formMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400" />
            )}
            <span>{formMessage.text}</span>
          </div>
          <button
            onClick={() => setFormMessage(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── HACKATHON NAVIGATION TABS ───────────────────────────────────────── */}
      <div className="bg-surface-900/80 border-surface-800 flex flex-wrap items-center gap-1.5 rounded-2xl border p-1.5 backdrop-blur-md">
        <button
          id="tab-hackathon-teams"
          onClick={() => setActiveTab("TEAMS")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
            activeTab === "TEAMS"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
              : "text-surface-400 hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Team & Problem Statement</span>
          {data.userTeam && (
            <span className="ml-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          id="tab-hackathon-submission"
          onClick={() => setActiveTab("SUBMISSION")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
            activeTab === "SUBMISSION"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
              : "text-surface-400 hover:text-white"
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>Project Submission</span>
          {data.userTeam?.submission && (
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">
              Submitted
            </span>
          )}
        </button>

        <button
          id="tab-hackathon-leaderboard"
          onClick={() => setActiveTab("LEADERBOARD")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
            activeTab === "LEADERBOARD"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
              : "text-surface-400 hover:text-white"
          }`}
        >
          <Trophy className="h-4 w-4 text-amber-400" />
          <span>Leaderboard & Results</span>
          {data.detail.isResultsPublished ? (
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
              Official
            </span>
          ) : (
            <span className="bg-surface-800 text-surface-400 rounded px-1.5 py-0.5 text-[10px]">
              Live
            </span>
          )}
        </button>

        <button
          id="tab-hackathon-prizes"
          onClick={() => setActiveTab("PRIZES")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
            activeTab === "PRIZES"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
              : "text-surface-400 hover:text-white"
          }`}
        >
          <Award className="h-4 w-4 text-rose-400" />
          <span>Prizes & Certificates</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: TEAMS & PROBLEM STATEMENT                                      */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "TEAMS" && (
        <div className="space-y-8">
          {/* User's Team Status */}
          {!data.userTeam ? (
            <div className="bg-surface-900/80 border-surface-800 flex flex-col justify-between gap-6 rounded-3xl border p-6 shadow-xl backdrop-blur-md sm:p-8 md:flex-row md:items-center">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400">
                  <Users className="h-3.5 w-3.5" />
                  <span>Team Formation Open</span>
                </div>
                <h3 className="text-xl font-black text-white sm:text-2xl">
                  Form or Join a Hackathon Squad
                </h3>
                <p className="text-surface-400 mt-1 max-w-xl text-xs sm:text-sm">
                  {data.detail.minTeamSize} to {data.detail.maxTeamSize} builders per squad. Form a
                  team to claim your project slot, select a challenge statement, and push code.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  id="btn-create-team"
                  variant="primary"
                  onClick={() => setCreateTeamModalOpen(true)}
                  className="bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  <span>Create Squad</span>
                </Button>
                <Button
                  id="btn-join-team-modal"
                  variant="outline"
                  onClick={() => setJoinTeamModalOpen(true)}
                >
                  <span>Join with Invite Code</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Active Team Card */
            <div className="bg-surface-900/90 space-y-6 rounded-3xl border border-purple-500/30 p-6 shadow-xl sm:p-8">
              <div className="border-surface-800 flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-center">
                <div>
                  <div className="mb-1.5 flex items-center gap-2.5">
                    <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold tracking-wider text-purple-400 uppercase">
                      Your Team
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                      ● Status: {data.userTeam.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {data.userTeam.name}
                  </h3>
                  <div className="text-surface-400 mt-1 text-xs">
                    Track:{" "}
                    <strong className="text-white">{data.userTeam.track || "General Track"}</strong>
                  </div>
                </div>

                {/* Invite Code Box */}
                <div className="bg-surface-950 border-surface-800 flex min-w-[280px] flex-col gap-2 rounded-2xl border p-4">
                  <div className="text-surface-400 flex items-center justify-between text-xs font-semibold">
                    <span>Squad Invite Code</span>
                    <button
                      id="btn-copy-team-code"
                      onClick={() => handleCopyCode(data.userTeam!.inviteCode)}
                      className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300"
                    >
                      {copiedCode ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                    </button>
                  </div>
                  <div className="bg-surface-900 border-surface-800 rounded-xl border px-3 py-1.5 font-mono text-base font-bold tracking-wider text-white">
                    {data.userTeam.inviteCode}
                  </div>
                  <button
                    id="btn-copy-team-invite-link"
                    onClick={() => handleCopyInviteLink(data.userTeam!.inviteCode)}
                    className="text-surface-400 mt-1 flex items-center gap-1.5 text-[11px] hover:text-white"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>
                      {copiedLink ? "Link copied to clipboard!" : "Copy 1-Click Invite Link"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Team Members Roster */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-surface-400 text-xs font-bold tracking-wider uppercase">
                    Roster ({data.userTeam.members.length} / {data.detail.maxTeamSize} Builders)
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {data.userTeam.members.map((m) => (
                    <div
                      key={m.id}
                      className="bg-surface-950 border-surface-800 flex items-center gap-3 rounded-2xl border p-3.5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/20 text-sm font-bold text-purple-300">
                        {m.user.name ? m.user.name.charAt(0) : "B"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold text-white">
                          {m.user.name || "Builder"}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className="py-0.2 rounded bg-purple-500/10 px-1.5 text-[10px] font-semibold text-purple-400 uppercase">
                            {m.role}
                          </span>
                          {m.userId === data.userTeam?.leaderId && (
                            <span className="text-[9px] font-bold text-amber-400">★ Lead</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Problem Statements Registry */}
          <div className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Problem Statements & Challenge Bounties
                </h3>
                <p className="text-surface-400 mt-0.5 text-xs">
                  Choose a challenge statement for your project submission
                </p>
              </div>

              {/* Track filter pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedTrackFilter("ALL")}
                  className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                    selectedTrackFilter === "ALL"
                      ? "bg-purple-600 text-white"
                      : "bg-surface-900 border-surface-800 text-surface-400 border hover:text-white"
                  }`}
                >
                  All Challenges ({data.detail.problemStatementsList.length})
                </button>
                {tracks.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTrackFilter(t)}
                    className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                      selectedTrackFilter === t
                        ? "bg-purple-600 text-white"
                        : "bg-surface-900 border-surface-800 text-surface-400 border hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.detail.problemStatementsList
                .filter((ps) => selectedTrackFilter === "ALL" || ps.track === selectedTrackFilter)
                .map((ps) => {
                  const isSelectedByTeam = data.userTeam?.problemStatementId === ps.id;

                  return (
                    <div
                      key={ps.id}
                      className={`bg-surface-900/80 flex flex-col justify-between space-y-4 rounded-3xl border p-6 shadow-sm transition-all ${
                        isSelectedByTeam
                          ? "border-emerald-500/50 bg-emerald-950/10 shadow-emerald-500/5"
                          : "border-surface-800 hover:border-surface-700"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-purple-400 uppercase">
                            {ps.track}
                          </span>
                          {isSelectedByTeam && (
                            <span className="flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                              <Check className="h-3 w-3" />
                              <span>Your Selection</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-base leading-snug font-bold text-white sm:text-lg">
                          {ps.title}
                        </h4>

                        <p className="text-surface-300 text-xs leading-relaxed">{ps.description}</p>

                        {ps.criteria.length > 0 && (
                          <div className="pt-2">
                            <div className="text-surface-400 mb-1 text-[11px] font-bold uppercase">
                              Key Evaluation Focus:
                            </div>
                            <ul className="space-y-1">
                              {ps.criteria.map((c, i) => (
                                <li
                                  key={i}
                                  className="text-surface-300 flex items-start gap-1.5 text-xs"
                                >
                                  <span className="font-bold text-purple-400">•</span>
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {data.userTeam && isLeader && (
                        <div className="border-surface-800/80 flex items-center justify-end border-t pt-3">
                          <Button
                            variant={isSelectedByTeam ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => handleSelectProblemStatement(ps.id)}
                            disabled={isSelectedByTeam}
                          >
                            <span>
                              {isSelectedByTeam ? "Active Challenge" : "Select Challenge"}
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: PROJECT SUBMISSION                                             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "SUBMISSION" && (
        <div className="space-y-8">
          {!data.userTeam ? (
            <div className="bg-surface-900 border-surface-800 rounded-3xl border p-12 text-center">
              <Users className="text-surface-600 mx-auto mb-3 h-12 w-12" />
              <h3 className="mb-1 text-base font-bold text-white">No Squad Formed Yet</h3>
              <p className="text-surface-400 mx-auto mb-4 max-w-sm text-xs">
                You must create or join a hackathon squad before submitting a project repository and
                demo.
              </p>
              <Button onClick={() => setActiveTab("TEAMS")} variant="primary">
                <span>Form Squad First</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Submission Form */}
              <div className="bg-surface-900/90 border-surface-800 space-y-6 rounded-3xl border p-6 shadow-xl sm:p-8 lg:col-span-2">
                <div>
                  <div className="bg-brand-500/10 border-brand-500/20 text-brand-400 mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold">
                    <Code2 className="h-3.5 w-3.5" />
                    <span>Engineering Deliverables</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">Project Submission Cockpit</h3>
                  <p className="text-surface-400 mt-1 text-xs sm:text-sm">
                    Submit code repository, live interactive demo, pitch deck, and architecture
                    overview.
                  </p>
                </div>

                <form onSubmit={handleSubmitProject} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-surface-300 text-xs font-bold tracking-wider uppercase">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ZK-Passport: Sovereign Identity Verification"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      className="bg-surface-950 border-surface-800 w-full rounded-xl border px-4 py-2.5 text-sm text-white transition-colors focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-surface-300 text-xs font-bold tracking-wider uppercase">
                      One-line Tagline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Zero-knowledge proof verification for developer credentials"
                      value={projectForm.tagline}
                      onChange={(e) => setProjectForm({ ...projectForm, tagline: e.target.value })}
                      className="bg-surface-950 border-surface-800 w-full rounded-xl border px-4 py-2.5 text-sm text-white transition-colors focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-surface-300 text-xs font-bold tracking-wider uppercase">
                      Project Overview & Architecture *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Describe what you built, technical challenges overcome, core architectural decisions, and why your solution matters."
                      value={projectForm.description}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, description: e.target.value })
                      }
                      className="bg-surface-950 border-surface-800 w-full rounded-xl border px-4 py-2.5 text-sm leading-relaxed text-white transition-colors focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-surface-300 text-xs font-bold tracking-wider uppercase">
                        GitHub Repository URL *
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://github.com/org/repo"
                        value={projectForm.repoUrl}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, repoUrl: e.target.value })
                        }
                        className="bg-surface-950 border-surface-800 w-full rounded-xl border px-4 py-2.5 font-mono text-sm text-xs text-white transition-colors focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-surface-300 text-xs font-bold tracking-wider uppercase">
                        Live Demo URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://yourdemo.app"
                        value={projectForm.demoUrl}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, demoUrl: e.target.value })
                        }
                        className="bg-surface-950 border-surface-800 w-full rounded-xl border px-4 py-2.5 font-mono text-sm text-xs text-white transition-colors focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-surface-300 text-xs font-bold tracking-wider uppercase">
                        Pitch Deck / Slides URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://pitch.com/deck or Google Slides"
                        value={projectForm.deckUrl}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, deckUrl: e.target.value })
                        }
                        className="bg-surface-950 border-surface-800 w-full rounded-xl border px-4 py-2.5 font-mono text-sm text-xs text-white transition-colors focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-surface-300 text-xs font-bold tracking-wider uppercase">
                        Demo Video URL (Loom / YouTube)
                      </label>
                      <input
                        type="url"
                        placeholder="https://loom.com/share/..."
                        value={projectForm.videoUrl}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, videoUrl: e.target.value })
                        }
                        className="bg-surface-950 border-surface-800 w-full rounded-xl border px-4 py-2.5 font-mono text-sm text-xs text-white transition-colors focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-surface-300 text-xs font-bold tracking-wider uppercase">
                      Tech Stack (Comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Next.js, TypeScript, PostgreSQL, Rust, Docker"
                      value={projectForm.techStack}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, techStack: e.target.value })
                      }
                      className="bg-surface-950 border-surface-800 w-full rounded-xl border px-4 py-2.5 font-mono text-sm text-xs text-white transition-colors focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="border-surface-800 flex items-center justify-between border-t pt-3">
                    <div className="text-surface-400 text-xs">
                      Squad: <strong className="text-white">{data.userTeam.name}</strong>
                    </div>
                    <Button
                      id="btn-submit-hackathon-project"
                      type="submit"
                      variant="primary"
                      disabled={submittingProject}
                      className="bg-purple-600 text-white hover:bg-purple-500"
                    >
                      {submittingProject ? (
                        <span>Pushed Deliverables...</span>
                      ) : (
                        <span>Save & Submit Deliverables</span>
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Sidebar with Rubrics & Deadlines */}
              <div className="space-y-5">
                {/* Deadline Card */}
                <div className="bg-surface-900/80 border-surface-800 space-y-3 rounded-3xl border p-6">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400 uppercase">
                    <Clock className="h-4 w-4" />
                    <span>Submission Deadline</span>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {data.detail.submissionDeadline
                      ? new Date(data.detail.submissionDeadline).toLocaleString("en-IN", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Open until Hackathon closing bell"}
                  </div>
                  <p className="text-surface-400 text-xs leading-relaxed">
                    Mentors and judges will begin scoring repositories immediately following the
                    deadline.
                  </p>
                </div>

                {/* Rubric Criteria Overview */}
                <div className="bg-surface-900/80 border-surface-800 space-y-4 rounded-3xl border p-6">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-purple-400 uppercase">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Official Scoring Rubric</span>
                  </div>
                  <div className="space-y-3">
                    {data.detail.rubricCriteria.map((c) => (
                      <div key={c.id} className="border-surface-800/80 border-b pb-2.5 text-xs">
                        <div className="mb-0.5 flex items-center justify-between font-bold text-white">
                          <span>{c.name}</span>
                          <span className="font-mono text-purple-400">Max {c.maxScore} pts</span>
                        </div>
                        {c.description && (
                          <p className="text-surface-400 text-[11px] leading-snug">
                            {c.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: LEADERBOARD & RESULTS                                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "LEADERBOARD" && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="bg-surface-900/80 border-surface-800 flex flex-col justify-between gap-6 rounded-3xl border p-6 shadow-xl backdrop-blur-md sm:p-8 md:flex-row md:items-center">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                <Trophy className="h-3.5 w-3.5" />
                <span>
                  {data.detail.isResultsPublished
                    ? "Official Champions Declared"
                    : "Judging Round Active"}
                </span>
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Hackathon Leaderboard
              </h3>
              <p className="text-surface-400 mt-1 max-w-2xl text-xs sm:text-sm">
                Composite scores computed across rubric criteria and normalized across panel judges.
              </p>
            </div>

            {isPrivileged && !data.detail.isResultsPublished && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
                Admin Mode: Viewing pre-published scores
              </div>
            )}
          </div>

          {/* Results Board / Submissions Table */}
          <div className="bg-surface-900/80 border-surface-800 overflow-hidden rounded-3xl border shadow-xl">
            <div className="border-surface-800 flex items-center justify-between border-b p-5">
              <h4 className="text-surface-400 text-xs font-bold tracking-wider uppercase">
                Ranked Submissions (
                {data.detail.isResultsPublished ? "Published" : "Live Standings"})
              </h4>
            </div>

            <div className="divide-surface-800/80 divide-y">
              {/* Default Mock or Seeded submissions view */}
              <div className="hover:bg-surface-850/50 flex flex-col justify-between gap-4 p-6 transition-colors sm:flex-row sm:items-center">
                <div className="flex items-start gap-4 sm:items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/20 font-mono text-lg font-black text-amber-300">
                    #1
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
                        1st Place Champion
                      </span>
                      <span className="text-surface-400 text-xs">Track: Distributed Systems</span>
                    </div>
                    <h5 className="text-base font-bold text-white">ConsensusStream Engine</h5>
                    <div className="text-surface-400 mt-0.5 text-xs">
                      Squad: <strong className="text-white">Apex Builders</strong> (4 builders)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono text-lg font-black text-emerald-400">
                      94.5 <span className="text-surface-400 text-xs font-normal">/ 100</span>
                    </div>
                    <div className="text-surface-400 text-[11px]">4 Judges Evaluated</div>
                  </div>
                  <div className="border-surface-800 flex items-center gap-1.5 border-l pl-3">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://github.com/kailshiansx"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <GithubIcon className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://kailshiansx.com" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Second Place */}
              <div className="hover:bg-surface-850/50 flex flex-col justify-between gap-4 p-6 transition-colors sm:flex-row sm:items-center">
                <div className="flex items-start gap-4 sm:items-center">
                  <div className="bg-surface-800 border-surface-700 text-surface-300 flex h-10 w-10 items-center justify-center rounded-2xl border font-mono text-lg font-black">
                    #2
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="bg-surface-800 border-surface-700 rounded border px-2 py-0.5 text-[10px] font-bold text-slate-300 uppercase">
                        1st Runner Up
                      </span>
                      <span className="text-surface-400 text-xs">Track: Autonomous AI</span>
                    </div>
                    <h5 className="text-base font-bold text-white">Sovereign-SRE Agent</h5>
                    <div className="text-surface-400 mt-0.5 text-xs">
                      Squad: <strong className="text-white">NeuralOps</strong> (3 builders)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono text-lg font-black text-emerald-400">
                      91.0 <span className="text-surface-400 text-xs font-normal">/ 100</span>
                    </div>
                    <div className="text-surface-400 text-[11px]">4 Judges Evaluated</div>
                  </div>
                  <div className="border-surface-800 flex items-center gap-1.5 border-l pl-3">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://github.com/kailshiansx"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <GithubIcon className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Third Place */}
              <div className="hover:bg-surface-850/50 flex flex-col justify-between gap-4 p-6 transition-colors sm:flex-row sm:items-center">
                <div className="flex items-start gap-4 sm:items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-900/30 bg-amber-900/20 font-mono text-lg font-black text-amber-500">
                    #3
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded border border-amber-600/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 uppercase">
                        2nd Runner Up
                      </span>
                      <span className="text-surface-400 text-xs">Track: Web Infrastructure</span>
                    </div>
                    <h5 className="text-base font-bold text-white">EdgeCRDT Cache Mesh</h5>
                    <div className="text-surface-400 mt-0.5 text-xs">
                      Squad: <strong className="text-white">MeshFlow</strong> (4 builders)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono text-lg font-black text-emerald-400">
                      87.8 <span className="text-surface-400 text-xs font-normal">/ 100</span>
                    </div>
                    <div className="text-surface-400 text-[11px]">4 Judges Evaluated</div>
                  </div>
                  <div className="border-surface-800 flex items-center gap-1.5 border-l pl-3">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://github.com/kailshiansx"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <GithubIcon className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: PRIZES & CERTIFICATES                                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "PRIZES" && (
        <div className="space-y-8">
          {/* Cash Bounties & Prize Pool */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white">Hackathon Bounty & Prize Pool</h3>
              <p className="text-surface-400 mt-0.5 text-xs">
                Cash rewards, cloud compute grants, and direct VC office hours
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.detail.prizesList.map((p) => {
                const isDisbursed = p.disbursementStatus === "DISBURSED";

                return (
                  <div
                    key={p.id}
                    className="bg-surface-900/80 border-surface-800 hover:border-surface-700 flex flex-col justify-between space-y-4 rounded-3xl border p-6 shadow-sm transition-all"
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                          <Trophy className="h-3.5 w-3.5" />
                          <span>Rank #{p.rank || 1}</span>
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                            isDisbursed
                              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : "bg-surface-800 text-surface-400"
                          }`}
                        >
                          {p.disbursementStatus}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-white">{p.title}</h4>
                      <div className="mt-1 font-mono text-2xl font-black text-emerald-400">
                        {p.currency === "INR" ? "₹" : "$"}
                        {Number(p.cashAmount).toLocaleString("en-IN")}
                      </div>

                      {p.perks.length > 0 && (
                        <div className="border-surface-800/80 mt-3 space-y-1 border-t pt-3">
                          <div className="text-surface-400 text-[10px] font-bold uppercase">
                            Included Perks:
                          </div>
                          {p.perks.map((perk, i) => (
                            <div
                              key={i}
                              className="text-surface-300 flex items-start gap-1 text-xs"
                            >
                              <span className="text-amber-400">✓</span>
                              <span>{perk}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {p.winningTeam && (
                      <div className="border-surface-800 text-surface-400 border-t pt-3 text-xs">
                        Awarded to: <strong className="text-white">{p.winningTeam.name}</strong>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificate Studio Section */}
          <div className="bg-surface-900/80 border-surface-800 flex flex-col justify-between gap-6 rounded-3xl border p-6 shadow-xl sm:flex-row sm:items-center sm:p-8">
            <div className="space-y-1">
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verifiable Cryptographic Proof</span>
              </div>
              <h4 className="text-xl font-bold text-white">Official Hackathon Credentials</h4>
              <p className="text-surface-400 max-w-xl text-xs sm:text-sm">
                Every team member who submits a verified project receives a digitally signed
                Certificate of Achievement with QR verification code.
              </p>
            </div>

            <Button variant="outline" asChild className="shrink-0">
              <Link href="/verify">
                <span>Verify Credentials</span>
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODALS: CREATE TEAM & JOIN TEAM                                       */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {createTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-surface-900 border-surface-800 w-full max-w-md space-y-5 rounded-3xl border p-6 shadow-2xl">
            <div className="border-surface-800 flex items-center justify-between border-b pb-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <Users className="h-4 w-4 text-purple-400" />
                <span>Create Hackathon Squad</span>
              </h3>
              <button
                onClick={() => setCreateTeamModalOpen(false)}
                className="text-surface-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-surface-300 text-xs font-bold tracking-wider uppercase">
                  Squad Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Devas"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="bg-surface-950 border-surface-800 w-full rounded-xl border px-3.5 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-surface-300 text-xs font-bold tracking-wider uppercase">
                  Primary Track
                </label>
                <select
                  value={teamForm.track}
                  onChange={(e) => setTeamForm({ ...teamForm, track: e.target.value })}
                  className="bg-surface-950 border-surface-800 w-full rounded-xl border px-3.5 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                >
                  {tracks.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-surface-800 flex items-center justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateTeamModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  id="btn-confirm-create-team"
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingTeam}
                  className="bg-purple-600 text-white hover:bg-purple-500"
                >
                  {submittingTeam ? "Creating..." : "Confirm & Launch Squad"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {joinTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-surface-900 border-surface-800 w-full max-w-md space-y-5 rounded-3xl border p-6 shadow-2xl">
            <div className="border-surface-800 flex items-center justify-between border-b pb-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <Key className="h-4 w-4 text-purple-400" />
                <span>Join Squad with Invite Code</span>
              </h3>
              <button
                onClick={() => setJoinTeamModalOpen(false)}
                className="text-surface-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJoinTeam} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-surface-300 text-xs font-bold tracking-wider uppercase">
                  Invite Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="KX-TEAM-ABC123"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="bg-surface-950 border-surface-800 w-full rounded-xl border px-3.5 py-2.5 font-mono text-base font-bold tracking-wider text-white uppercase focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="border-surface-800 flex items-center justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setJoinTeamModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  id="btn-confirm-join-team"
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingTeam}
                  className="bg-purple-600 text-white hover:bg-purple-500"
                >
                  {submittingTeam ? "Joining..." : "Join Squad"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Key(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  );
}
