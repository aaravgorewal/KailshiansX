"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  DollarSign,
  Gavel,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

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

export interface AdminHackathonData {
  event: {
    id: string;
    title: string;
    slug: string;
  };
  detail: {
    id: string;
    eventId: string;
    isResultsPublished: boolean;
    resultsPublishedAt: string | null;
  };
  teams: Array<{
    id: string;
    name: string;
    track: string | null;
    status: string;
    inviteCode: string;
    members: Array<{
      id: string;
      role: string;
      user: {
        name: string | null;
        email: string | null;
      };
    }>;
  }>;
  submissions: Array<{
    id: string;
    teamId: string;
    teamName: string;
    title: string;
    track: string;
    repoUrl: string;
    demoUrl: string | null;
    deckUrl: string | null;
    videoUrl: string | null;
    normalizedScore: number | null;
    rank: number | null;
    isWinner: boolean;
    winnerTier: string | null;
    evaluationsCount: number;
    submittedAt: string;
  }>;
  judges: Array<{
    id: string;
    title: string | null;
    company: string | null;
    track: string | null;
    active: boolean;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }>;
  prizes: Array<{
    id: string;
    title: string;
    track: string | null;
    rank: number | null;
    cashAmount: number;
    currency: string;
    disbursementStatus: "PENDING" | "IN_REVIEW" | "PROCESSING" | "DISBURSED";
    disbursedAt: string | null;
    transactionRef: string | null;
    winningTeam: {
      id: string;
      name: string;
    } | null;
  }>;
}

export function AdminHackathonControlClient({ initialData }: { initialData: AdminHackathonData }) {
  const [data, setData] = useState<AdminHackathonData>(initialData);
  const [activeTab, setActiveTab] = useState<"SUBMISSIONS" | "PRIZES" | "JUDGES">("SUBMISSIONS");

  // Winner selections state for publishing
  const [rankAssignments, setRankAssignments] = useState<
    Record<string, { rank: number; winnerTier: string; isWinner: boolean }>
  >(() => {
    const map: Record<string, { rank: number; winnerTier: string; isWinner: boolean }> = {};
    for (const sub of initialData.submissions) {
      map[sub.id] = {
        rank: sub.rank || 0,
        winnerTier: sub.winnerTier || "PARTICIPANT",
        isWinner: sub.isWinner || false,
      };
    }
    return map;
  });

  // Action loaders and feedback
  const [publishing, setPublishing] = useState(false);
  const [issuingCerts, setIssuingCerts] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Prize editing modal state
  const [editingPrize, setEditingPrize] = useState<AdminHackathonData["prizes"][0] | null>(null);
  const [prizeStatus, setPrizeStatus] = useState<
    "PENDING" | "IN_REVIEW" | "PROCESSING" | "DISBURSED"
  >("PENDING");
  const [txnRef, setTxnRef] = useState("");
  const [savingPrize, setSavingPrize] = useState(false);

  // Add judge modal state
  const [addJudgeOpen, setAddJudgeOpen] = useState(false);
  const [judgeForm, setJudgeForm] = useState({ userId: "", title: "", company: "", track: "ALL" });
  const [savingJudge, setSavingJudge] = useState(false);

  // 1-Click Publish Results
  const handlePublishResults = async () => {
    if (
      !confirm(
        "Are you sure you want to officially publish hackathon results? The public leaderboard will reveal winners immediately."
      )
    ) {
      return;
    }

    setPublishing(true);
    setToast(null);

    try {
      const winnerSelections = Object.entries(rankAssignments)
        .filter(([, val]) => val.isWinner && val.rank > 0)
        .map(([submissionId, val]) => ({
          submissionId,
          rank: val.rank,
          winnerTier: val.winnerTier,
        }));

      const res = await fetch("/api/admin/hackathons/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hackathonDetailId: data.detail.id,
          winnerSelections,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to publish results");

      setData((prev) => ({
        ...prev,
        detail: {
          ...prev.detail,
          isResultsPublished: true,
          resultsPublishedAt: new Date().toISOString(),
        },
      }));

      setToast({
        type: "success",
        text: "Hackathon results published successfully! The public leaderboard has been unlocked.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish results";
      setToast({ type: "error", text: msg });
    } finally {
      setPublishing(false);
    }
  };

  // Mass Certificate Issuance
  const handleIssueCertificates = async (issueType: "ALL" | "WINNERS" | "PARTICIPANTS") => {
    if (
      !confirm(
        `Are you sure you want to mass-issue certificates to ${issueType.toLowerCase()}? Automated credential emails will be enqueued.`
      )
    ) {
      return;
    }

    setIssuingCerts(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/hackathons/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hackathonDetailId: data.detail.id,
          issueType,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to issue certificates");

      setToast({
        type: "success",
        text: `Issued ${json.data.issuedCount} certificates successfully! Verification links sent via email.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to issue certificates";
      setToast({ type: "error", text: msg });
    } finally {
      setIssuingCerts(false);
    }
  };

  // Update Prize Disbursement
  const handleUpdatePrize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrize) return;
    setSavingPrize(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/hackathons/prizes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prizeId: editingPrize.id,
          status: prizeStatus,
          transactionRef: txnRef || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update prize");

      setData((prev) => ({
        ...prev,
        prizes: prev.prizes.map((p) => (p.id === editingPrize.id ? { ...p, ...json.data } : p)),
      }));

      setEditingPrize(null);
      setToast({ type: "success", text: `Prize disbursement updated to ${prizeStatus}!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update prize";
      setToast({ type: "error", text: msg });
    } finally {
      setSavingPrize(false);
    }
  };

  // Add Official Judge
  const handleAddJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingJudge(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/hackathons/judges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hackathonDetailId: data.detail.id,
          userId: judgeForm.userId,
          title: judgeForm.title,
          company: judgeForm.company,
          track: judgeForm.track,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to assign judge");

      setData((prev) => ({
        ...prev,
        judges: [...prev.judges, json.data],
      }));

      setAddJudgeOpen(false);
      setJudgeForm({ userId: "", title: "", company: "", track: "ALL" });
      setToast({ type: "success", text: "Judge account assigned successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign judge";
      setToast({ type: "error", text: msg });
    } finally {
      setSavingJudge(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/events"
            className="text-surface-400 mb-2 inline-flex items-center gap-1.5 text-xs transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Events
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {data.event.title} &bull; Control Room
            </h1>
            {data.detail.isResultsPublished ? (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Results Published
              </span>
            ) : (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-400">
                Judging In Progress
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/events/${data.event.slug}`} target="_blank">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Public Event Page
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/events/${data.event.slug}/judge`}>
              <Gavel className="mr-1.5 h-3.5 w-3.5 text-purple-400" />
              Judge Cockpit
            </Link>
          </Button>

          <Button
            onClick={handlePublishResults}
            disabled={publishing}
            className="bg-brand-500 hover:bg-brand-600 font-bold text-white"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {publishing
              ? "Publishing..."
              : data.detail.isResultsPublished
                ? "Re-Publish Standings"
                : "Publish Official Results"}
          </Button>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs font-semibold transition-all sm:text-sm ${
            toast.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-surface-400 px-2 py-1 text-xs hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5 backdrop-blur-xl">
          <div className="text-surface-400 text-xs font-bold uppercase">Total Teams</div>
          <div className="mt-1 font-mono text-2xl font-black text-white">{data.teams.length}</div>
        </div>
        <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5 backdrop-blur-xl">
          <div className="text-surface-400 text-xs font-bold uppercase">Submissions</div>
          <div className="text-brand-400 mt-1 font-mono text-2xl font-black">
            {data.submissions.length}
          </div>
        </div>
        <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5 backdrop-blur-xl">
          <div className="text-surface-400 text-xs font-bold uppercase">Active Judges</div>
          <div className="mt-1 font-mono text-2xl font-black text-purple-400">
            {data.judges.length}
          </div>
        </div>
        <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5 backdrop-blur-xl">
          <div className="text-surface-400 text-xs font-bold uppercase">Prize Pool</div>
          <div className="mt-1 font-mono text-2xl font-black text-emerald-400">
            ₹{data.prizes.reduce((acc, p) => acc + p.cashAmount, 0).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-surface-800 flex items-center gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab("SUBMISSIONS")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
            activeTab === "SUBMISSIONS"
              ? "bg-surface-800 text-white"
              : "text-surface-400 hover:text-surface-200"
          }`}
        >
          Submissions &amp; Scoring Matrix ({data.submissions.length})
        </button>
        <button
          onClick={() => setActiveTab("PRIZES")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
            activeTab === "PRIZES"
              ? "bg-surface-800 text-white"
              : "text-surface-400 hover:text-surface-200"
          }`}
        >
          Prize Disbursement ({data.prizes.length})
        </button>
        <button
          onClick={() => setActiveTab("JUDGES")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
            activeTab === "JUDGES"
              ? "bg-surface-800 text-white"
              : "text-surface-400 hover:text-surface-200"
          }`}
        >
          Judge Roster ({data.judges.length})
        </button>
      </div>

      {/* TAB 1: SUBMISSIONS & SCORING MATRIX */}
      {activeTab === "SUBMISSIONS" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Project Submissions &amp; Standings</h2>
              <p className="text-surface-400 text-xs">
                Assign winner tiers and official ranks before triggering public results publishing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleIssueCertificates("ALL")}
                disabled={issuingCerts}
              >
                <Award className="text-brand-400 mr-1.5 h-3.5 w-3.5" />
                Issue All Certificates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleIssueCertificates("WINNERS")}
                disabled={issuingCerts}
              >
                <Trophy className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                Issue Winner Certificates
              </Button>
            </div>
          </div>

          <div className="border-surface-800 bg-surface-900/60 overflow-x-auto rounded-2xl border">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-surface-850/80 text-surface-400 border-surface-800 border-b font-mono text-[11px] uppercase">
                <tr>
                  <th className="px-4 py-3">Rank / Status</th>
                  <th className="px-4 py-3">Project &amp; Team</th>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3">Links</th>
                  <th className="px-4 py-3 text-center">Evaluations</th>
                  <th className="px-4 py-3 text-right">Score</th>
                  <th className="px-4 py-3 text-right">Award Tier</th>
                </tr>
              </thead>
              <tbody className="divide-surface-800 divide-y">
                {data.submissions.map((sub) => {
                  const assignment = rankAssignments[sub.id] || {
                    rank: 0,
                    winnerTier: "PARTICIPANT",
                    isWinner: false,
                  };

                  return (
                    <tr key={sub.id} className="hover:bg-surface-850/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={assignment.rank}
                            onChange={(e) =>
                              setRankAssignments((prev) => ({
                                ...prev,
                                [sub.id]: {
                                  ...prev[sub.id],
                                  rank: Number(e.target.value),
                                  isWinner: Number(e.target.value) > 0,
                                },
                              }))
                            }
                            className="bg-surface-800 border-surface-700 w-12 rounded-lg border p-1 text-center font-mono text-xs text-white"
                          />
                          {assignment.isWinner && (
                            <Trophy className="h-4 w-4 shrink-0 text-amber-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white">{sub.title}</div>
                        <div className="text-surface-400 text-xs">
                          Squad: <strong className="text-surface-200">{sub.teamName}</strong>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-surface-300 bg-surface-800 rounded px-2 py-0.5 text-[10px] font-bold uppercase">
                          {sub.track}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <a
                            href={sub.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-surface-400 hover:text-white"
                            title="GitHub"
                          >
                            <GithubIcon className="h-4 w-4" />
                          </a>
                          {sub.demoUrl && (
                            <a
                              href={sub.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-400 hover:text-brand-300"
                              title="Demo"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="text-surface-300 px-4 py-3.5 text-center font-mono text-xs">
                        {sub.evaluationsCount} judges
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">
                        {sub.normalizedScore ? sub.normalizedScore.toFixed(1) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <select
                          value={assignment.winnerTier}
                          onChange={(e) =>
                            setRankAssignments((prev) => ({
                              ...prev,
                              [sub.id]: {
                                ...prev[sub.id],
                                winnerTier: e.target.value,
                                isWinner: e.target.value !== "PARTICIPANT",
                              },
                            }))
                          }
                          className="bg-surface-800 border-surface-700 text-surface-200 rounded-lg border px-2 py-1 text-xs"
                        >
                          <option value="PARTICIPANT">Participant</option>
                          <option value="GRAND_PRIZE">🏆 Grand Prize (Winner)</option>
                          <option value="FIRST_RUNNER_UP">🥈 1st Runner Up</option>
                          <option value="SECOND_RUNNER_UP">🥉 2nd Runner Up</option>
                          <option value="TRACK_WINNER">⭐ Track Winner</option>
                          <option value="COMMUNITY_CHOICE">💡 Community Choice</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRIZE DISBURSEMENT TRACKER */}
      {activeTab === "PRIZES" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Prize Disbursement &amp; Payouts</h2>
            <p className="text-surface-400 text-xs">
              Track cash bounty transfers, transaction references, and disbursement statuses.
            </p>
          </div>

          <div className="border-surface-800 bg-surface-900/60 overflow-x-auto rounded-2xl border">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-surface-850/80 text-surface-400 border-surface-800 border-b font-mono text-[11px] uppercase">
                <tr>
                  <th className="px-4 py-3">Prize Title</th>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3">Cash Amount</th>
                  <th className="px-4 py-3">Winning Squad</th>
                  <th className="px-4 py-3">Disbursement Status</th>
                  <th className="px-4 py-3">Transaction Ref</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-surface-800 divide-y">
                {data.prizes.map((prize) => {
                  const statusColors = {
                    PENDING: "bg-surface-800 text-surface-300",
                    IN_REVIEW: "bg-amber-500/10 border-amber-500/20 text-amber-400",
                    PROCESSING: "bg-blue-500/10 border-blue-500/20 text-blue-400",
                    DISBURSED: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                  };

                  return (
                    <tr key={prize.id} className="hover:bg-surface-850/40 transition-colors">
                      <td className="flex items-center gap-2 px-4 py-3.5 font-bold text-white">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        {prize.title}
                      </td>
                      <td className="text-surface-400 px-4 py-3.5">{prize.track || "Overall"}</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                        ₹{prize.cashAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3.5">
                        {prize.winningTeam ? (
                          <strong className="text-white">{prize.winningTeam.name}</strong>
                        ) : (
                          <span className="text-surface-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            statusColors[prize.disbursementStatus]
                          }`}
                        >
                          {prize.disbursementStatus}
                        </span>
                      </td>
                      <td className="text-surface-300 px-4 py-3.5 font-mono text-xs">
                        {prize.transactionRef || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPrize(prize);
                            setPrizeStatus(prize.disbursementStatus);
                            setTxnRef(prize.transactionRef || "");
                          }}
                        >
                          Update Payout
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: JUDGE ROSTER */}
      {activeTab === "JUDGES" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Grand Jury &amp; Official Judges</h2>
              <p className="text-surface-400 text-xs">
                Jury members who have grading privileges for this hackathon.
              </p>
            </div>

            <Button
              onClick={() => setAddJudgeOpen(true)}
              className="bg-purple-600 font-bold text-white hover:bg-purple-500"
              size="sm"
            >
              <Gavel className="mr-1.5 h-3.5 w-3.5" />
              Assign Official Judge
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.judges.map((judge) => (
              <div
                key={judge.id}
                className="border-surface-800 bg-surface-900/60 space-y-3 rounded-2xl border p-5 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 font-bold text-purple-400">
                    <Gavel className="h-5 w-5" />
                  </div>
                  <span className="bg-surface-800 text-surface-300 rounded px-2 py-0.5 font-mono text-[10px] uppercase">
                    Track: {judge.track || "ALL"}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">
                    {judge.user.name || "Anonymous Judge"}
                  </h3>
                  <p className="text-surface-400 text-xs">{judge.user.email}</p>
                </div>

                <div className="border-surface-800 text-surface-400 border-t pt-2 text-xs">
                  <span>{judge.title || "Grand Jury Member"}</span>
                  {judge.company && ` @ ${judge.company}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prize Edit Modal */}
      {editingPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-surface-900 border-surface-800 w-full max-w-md space-y-5 rounded-3xl border p-6">
            <div>
              <h3 className="text-lg font-bold text-white">Update Prize Disbursement</h3>
              <p className="text-surface-400 mt-1 text-xs">
                {editingPrize.title} &bull; ₹{editingPrize.cashAmount.toLocaleString("en-IN")}
              </p>
            </div>

            <form onSubmit={handleUpdatePrize} className="space-y-4">
              <div>
                <label className="text-surface-300 mb-1 block text-xs font-bold uppercase">
                  Disbursement Status
                </label>
                <select
                  value={prizeStatus}
                  onChange={(e) =>
                    setPrizeStatus(
                      e.target.value as "PENDING" | "IN_REVIEW" | "PROCESSING" | "DISBURSED"
                    )
                  }
                  className="bg-surface-800 border-surface-700 w-full rounded-xl border p-2.5 text-xs text-white"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_REVIEW">IN_REVIEW</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="DISBURSED">DISBURSED</option>
                </select>
              </div>

              <div>
                <label className="text-surface-300 mb-1 block text-xs font-bold uppercase">
                  Transaction Reference (UPI / Bank Txn ID)
                </label>
                <input
                  type="text"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  placeholder="e.g. UPI-TXN-90283401928"
                  className="bg-surface-800 border-surface-700 w-full rounded-xl border p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPrize(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={savingPrize}
                  className="bg-emerald-600 font-bold text-white hover:bg-emerald-500"
                >
                  {savingPrize ? "Saving..." : "Save Disbursement"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Judge Modal */}
      {addJudgeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-surface-900 border-surface-800 w-full max-w-md space-y-5 rounded-3xl border p-6">
            <div>
              <h3 className="text-lg font-bold text-white">Assign Official Judge</h3>
              <p className="text-surface-400 mt-1 text-xs">
                Grant rubric evaluation privileges to an existing user account.
              </p>
            </div>

            <form onSubmit={handleAddJudge} className="space-y-4">
              <div>
                <label className="text-surface-300 mb-1 block text-xs font-bold uppercase">
                  User ID (CUID)
                </label>
                <input
                  type="text"
                  required
                  value={judgeForm.userId}
                  onChange={(e) => setJudgeForm({ ...judgeForm, userId: e.target.value })}
                  placeholder="e.g. cmur... or user ID"
                  className="bg-surface-800 border-surface-700 w-full rounded-xl border p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-300 mb-1 block text-xs font-bold uppercase">
                    Title / Role
                  </label>
                  <input
                    type="text"
                    value={judgeForm.title}
                    onChange={(e) => setJudgeForm({ ...judgeForm, title: e.target.value })}
                    placeholder="e.g. Principal Architect"
                    className="bg-surface-800 border-surface-700 w-full rounded-xl border p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-surface-300 mb-1 block text-xs font-bold uppercase">
                    Company
                  </label>
                  <input
                    type="text"
                    value={judgeForm.company}
                    onChange={(e) => setJudgeForm({ ...judgeForm, company: e.target.value })}
                    placeholder="e.g. Google Cloud"
                    className="bg-surface-800 border-surface-700 w-full rounded-xl border p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-surface-300 mb-1 block text-xs font-bold uppercase">
                  Assigned Track
                </label>
                <select
                  value={judgeForm.track}
                  onChange={(e) => setJudgeForm({ ...judgeForm, track: e.target.value })}
                  className="bg-surface-800 border-surface-700 w-full rounded-xl border p-2.5 text-xs text-white"
                >
                  <option value="ALL">All Tracks (Grand Jury)</option>
                  <option value="Autonomous AI Agents">Autonomous AI Agents</option>
                  <option value="Web Infrastructure">Web Infrastructure</option>
                  <option value="Developer Productivity">Developer Productivity</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddJudgeOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={savingJudge}
                  className="bg-purple-600 font-bold text-white hover:bg-purple-500"
                >
                  {savingJudge ? "Assigning..." : "Assign Judge"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
