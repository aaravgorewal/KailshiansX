"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Gavel,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  ArrowLeft,
  Sparkles,
  Sliders,
  MessageSquare,
  Lock,
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

export interface JudgeQueueSubmission {
  id: string;
  teamId: string;
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
  submittedAt: string | Date;
  team: {
    id: string;
    name: string;
    members: Array<{
      id: string;
      role: string;
      user: {
        name: string | null;
        email: string | null;
      };
    }>;
  };
  problemStatement?: {
    id: string;
    title: string;
  } | null;
  myScore?: {
    id: string;
    totalScore: number;
    criteriaScores: Record<string, number> | unknown;
    feedback: string | null;
    privateNotes: string | null;
  } | null;
}

export interface JudgeQueueData {
  event: {
    id: string;
    title: string;
    slug: string;
  };
  judge: {
    id: string;
    title: string | null;
    company: string | null;
    track: string | null;
    active: boolean;
  };
  rubrics: Array<{
    id: string;
    name: string;
    description: string | null;
    maxScore: number;
    weight: number;
    sortOrder: number;
  }>;
  submissions: JudgeQueueSubmission[];
}

export function JudgePortalClient({ initialData }: { initialData: JudgeQueueData }) {
  const [data, setData] = useState<JudgeQueueData>(initialData);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "EVALUATED">("ALL");
  const [selectedSub, setSelectedSub] = useState<JudgeQueueSubmission | null>(
    initialData.submissions[0] || null
  );

  // Grading form state
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initialScores: Record<string, number> = {};
    if (selectedSub?.myScore?.criteriaScores) {
      const stored = selectedSub.myScore.criteriaScores as Record<string, number>;
      return stored;
    }
    for (const r of initialData.rubrics) {
      initialScores[r.id] = Math.round(r.maxScore * 0.75);
    }
    return initialScores;
  });

  const [feedback, setFeedback] = useState<string>(selectedSub?.myScore?.feedback || "");
  const [privateNotes, setPrivateNotes] = useState<string>(
    selectedSub?.myScore?.privateNotes || ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Switch active submission
  const handleSelectSubmission = (sub: JudgeQueueSubmission) => {
    setSelectedSub(sub);
    setToastMessage(null);
    setFeedback(sub.myScore?.feedback || "");
    setPrivateNotes(sub.myScore?.privateNotes || "");

    const newScores: Record<string, number> = {};
    if (sub.myScore?.criteriaScores) {
      const stored = sub.myScore.criteriaScores as Record<string, number>;
      setScores(stored);
    } else {
      for (const r of data.rubrics) {
        newScores[r.id] = Math.round(r.maxScore * 0.75);
      }
      setScores(newScores);
    }
  };

  // Calculate live total
  const calculatedTotal = data.rubrics.reduce((acc, r) => {
    const scoreVal = scores[r.id] ?? 0;
    return acc + scoreVal * r.weight;
  }, 0);

  // Submit scoring
  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setSubmitting(true);
    setToastMessage(null);

    try {
      const res = await fetch("/api/hackathons/judging/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          criteriaScores: scores,
          feedback,
          privateNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit score");

      // Update local state
      setData((prev) => ({
        ...prev,
        submissions: prev.submissions.map((s) => {
          if (s.id === selectedSub.id) {
            return {
              ...s,
              status: "EVALUATED",
              myScore: json.data,
            };
          }
          return s;
        }),
      }));

      setSelectedSub((prev) =>
        prev
          ? {
              ...prev,
              status: "EVALUATED",
              myScore: json.data,
            }
          : null
      );

      setToastMessage({
        type: "success",
        text: `Evaluation saved for "${selectedSub.title}"! Composite Score: ${calculatedTotal.toFixed(1)}/100`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit score";
      setToastMessage({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubmissions = data.submissions.filter((sub) => {
    if (filter === "PENDING") return !sub.myScore;
    if (filter === "EVALUATED") return Boolean(sub.myScore);
    return true;
  });

  const evaluatedCount = data.submissions.filter((s) => Boolean(s.myScore)).length;
  const totalCount = data.submissions.length;
  const progressPercent = totalCount > 0 ? Math.round((evaluatedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-surface-950 text-surface-100 min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/events/${data.event.slug}`}
            className="text-surface-400 hover:text-brand-400 inline-flex items-center gap-2 text-xs font-semibold transition-colors sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {data.event.title}
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-purple-800/40 bg-purple-950/30 px-3 py-1 font-mono text-xs text-purple-400">
            <Gavel className="h-3.5 w-3.5" />
            <span>Judge Portal &bull; Track: {data.judge.track || "ALL"}</span>
          </div>
        </div>

        {/* Hero Header & Progress */}
        <div className="border-surface-800 bg-surface-900/60 relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-widest text-purple-400 uppercase">
                <ShieldCheck className="h-4 w-4" />
                Grand Jury Evaluation Cockpit
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                {data.event.title}
              </h1>
              <p className="text-surface-400 mt-1 text-xs sm:text-sm">
                Judge Profile:{" "}
                <span className="text-surface-200 font-semibold">
                  {data.judge.title || "Official Judge"}
                </span>
                {data.judge.company && ` @ ${data.judge.company}`}
              </p>
            </div>

            <div className="bg-surface-850 border-surface-800 min-w-[280px] rounded-2xl border p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                <span className="text-surface-400">Evaluation Progress</span>
                <span className="font-mono font-bold text-purple-400">
                  {evaluatedCount} / {totalCount} ({progressPercent}%)
                </span>
              </div>
              <div className="bg-surface-700/50 mb-2 h-2 w-full overflow-hidden rounded-full">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-surface-400 text-[11px]">
                {totalCount - evaluatedCount === 0
                  ? "All assigned submissions evaluated! Thank you."
                  : `${totalCount - evaluatedCount} projects awaiting your scoring review.`}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {toastMessage && (
          <div
            className={`flex items-center justify-between rounded-2xl p-4 text-xs font-semibold transition-all sm:text-sm ${
              toastMessage.type === "success"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border border-rose-500/30 bg-rose-500/10 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toastMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              )}
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-surface-400 px-2 py-1 text-xs hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main 2-Column Split: Submissions Queue + Active Grading Cockpit */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Column: Submissions Queue (5 cols) */}
          <div className="space-y-4 lg:col-span-5">
            <div className="flex items-center justify-between">
              <h2 className="text-surface-400 flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                <Filter className="h-3.5 w-3.5 text-purple-400" />
                Submissions ({data.submissions.length})
              </h2>

              <div className="bg-surface-900 border-surface-800 flex items-center gap-1 rounded-xl border p-1">
                {(["ALL", "PENDING", "EVALUATED"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      filter === tab
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-surface-400 hover:text-surface-200"
                    }`}
                  >
                    {tab === "ALL" ? "All" : tab === "PENDING" ? "Needs Review" : "Evaluated"}
                  </button>
                ))}
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="border-surface-800 bg-surface-900/40 rounded-2xl border p-8 text-center">
                <p className="text-surface-400 text-xs">
                  No submissions found matching this filter.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSubmissions.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  const isScored = Boolean(sub.myScore);

                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleSelectSubmission(sub)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "border-purple-500/50 bg-purple-950/20 shadow-md ring-1 ring-purple-500/30"
                          : "bg-surface-900/40 border-surface-800 hover:border-surface-700 hover:bg-surface-850/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-surface-400 bg-surface-800 rounded px-2 py-0.5 text-[10px] font-bold uppercase">
                              {sub.track}
                            </span>
                            {isScored ? (
                              <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                {sub.myScore?.totalScore.toFixed(1)} / 100
                              </span>
                            ) : (
                              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                                Pending Review
                              </span>
                            )}
                          </div>
                          <h3 className="truncate text-sm font-bold text-white">{sub.title}</h3>
                          <p className="text-surface-400 mt-0.5 line-clamp-1 text-xs">
                            Squad: <strong className="text-surface-200">{sub.team.name}</strong>
                          </p>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isSelected ? "translate-x-0.5 text-purple-400" : "text-surface-600"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Active Grading Cockpit & Artifacts (7 cols) */}
          <div className="lg:col-span-7">
            {selectedSub ? (
              <div className="space-y-6">
                {/* Submission Showcase Card */}
                <div className="border-surface-800 bg-surface-900/60 space-y-6 rounded-3xl border p-6 backdrop-blur-xl sm:p-7">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-md border border-purple-800/40 bg-purple-950/40 px-2.5 py-0.5 font-mono text-xs font-bold text-purple-400 uppercase">
                        Track: {selectedSub.track}
                      </span>
                      {selectedSub.problemStatement && (
                        <span className="text-surface-400 text-xs">
                          Problem:{" "}
                          <strong className="text-surface-200">
                            {selectedSub.problemStatement.title}
                          </strong>
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                      {selectedSub.title}
                    </h2>
                    {selectedSub.tagline && (
                      <p className="text-surface-300 mt-1 text-sm font-medium">
                        {selectedSub.tagline}
                      </p>
                    )}
                  </div>

                  <div className="bg-surface-950/60 border-surface-800/60 text-surface-300 rounded-2xl border p-4 text-xs leading-relaxed whitespace-pre-wrap sm:text-sm">
                    {selectedSub.description}
                  </div>

                  {/* Tech stack */}
                  {selectedSub.techStack.length > 0 && (
                    <div>
                      <h4 className="text-surface-400 mb-2 text-[11px] font-bold tracking-wider uppercase">
                        Tech Stack
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSub.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="bg-surface-800 border-surface-700 text-surface-200 rounded-lg border px-2.5 py-1 font-mono text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submission Deliverables & External Links */}
                  <div>
                    <h4 className="text-surface-400 mb-2.5 text-[11px] font-bold tracking-wider uppercase">
                      Deliverables &amp; Artifacts
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedSub.repoUrl} target="_blank" rel="noopener noreferrer">
                          <GithubIcon className="mr-1.5 h-4 w-4" />
                          GitHub Code Repo
                          <ExternalLink className="text-surface-500 ml-1 h-3 w-3" />
                        </a>
                      </Button>

                      {selectedSub.demoUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedSub.demoUrl} target="_blank" rel="noopener noreferrer">
                            <Sparkles className="mr-1.5 h-4 w-4 text-purple-400" />
                            Live Deployment
                            <ExternalLink className="text-surface-500 ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      )}

                      {selectedSub.deckUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedSub.deckUrl} target="_blank" rel="noopener noreferrer">
                            Pitch Deck
                            <ExternalLink className="text-surface-500 ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      )}

                      {selectedSub.videoUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedSub.videoUrl} target="_blank" rel="noopener noreferrer">
                            Demo Video
                            <ExternalLink className="text-surface-500 ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="border-surface-800 text-surface-400 flex items-center justify-between border-t pt-4 text-xs">
                    <div>
                      Squad: <strong className="text-white">{selectedSub.team.name}</strong> (
                      {selectedSub.team.members.length} builders)
                    </div>
                    <div className="font-mono text-[11px]">
                      Submitted{" "}
                      {new Date(selectedSub.submittedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {/* Multi-Criteria Rubric Scoring Form */}
                <form
                  onSubmit={handleSaveEvaluation}
                  className="border-surface-800 bg-surface-900/60 space-y-6 rounded-3xl border p-6 backdrop-blur-xl sm:p-7"
                >
                  <div className="border-surface-800 flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="flex items-center gap-2 text-base font-bold text-white">
                        <Sliders className="h-4 w-4 text-purple-400" />
                        Official Scoring Rubric
                      </h3>
                      <p className="text-surface-400 mt-0.5 text-xs">
                        Adjust criteria scores based on prototype execution and pitch quality.
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-2xl font-black text-purple-400">
                        {calculatedTotal.toFixed(1)}{" "}
                        <span className="text-surface-400 text-xs font-normal">/ 100</span>
                      </div>
                      <div className="text-surface-400 text-[10px] font-bold uppercase">
                        Composite Score
                      </div>
                    </div>
                  </div>

                  {/* Rubric Criteria Sliders */}
                  <div className="space-y-5">
                    {data.rubrics.map((criterion) => {
                      const currentVal =
                        scores[criterion.id] ?? Math.round(criterion.maxScore * 0.75);

                      return (
                        <div key={criterion.id} className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <div>
                              <span className="text-white">{criterion.name}</span>
                              {criterion.description && (
                                <span className="text-surface-400 ml-2 font-normal">
                                  &bull; {criterion.description}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-purple-400">
                              {currentVal} / {criterion.maxScore}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="0"
                              max={criterion.maxScore}
                              step="1"
                              value={currentVal}
                              onChange={(e) =>
                                setScores((prev) => ({
                                  ...prev,
                                  [criterion.id]: Number(e.target.value),
                                }))
                              }
                              className="bg-surface-800 h-2 w-full cursor-pointer rounded-lg accent-purple-500"
                            />
                            <input
                              type="number"
                              min="0"
                              max={criterion.maxScore}
                              value={currentVal}
                              onChange={(e) =>
                                setScores((prev) => ({
                                  ...prev,
                                  [criterion.id]: Math.min(
                                    criterion.maxScore,
                                    Math.max(0, Number(e.target.value))
                                  ),
                                }))
                              }
                              className="bg-surface-850 border-surface-700 w-16 rounded-xl border px-2.5 py-1 text-center font-mono text-xs text-white"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Qualitative Feedback */}
                  <div className="border-surface-800 space-y-4 border-t pt-4">
                    <div>
                      <label className="text-surface-300 mb-1.5 flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                        <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
                        Constructive Feedback (Shared with Builders)
                      </label>
                      <textarea
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="What was remarkable about this build? What could be improved for production readiness?"
                        className="bg-surface-950/60 border-surface-800 text-surface-200 placeholder:text-surface-500 w-full rounded-2xl border p-3 text-xs focus:border-purple-500 focus:outline-none sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-surface-400 mb-1.5 flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                        <Lock className="text-surface-500 h-3.5 w-3.5" />
                        Private Grand Jury Notes (Organizers Only)
                      </label>
                      <textarea
                        rows={2}
                        value={privateNotes}
                        onChange={(e) => setPrivateNotes(e.target.value)}
                        placeholder="Confidential thoughts, disqualification flags, or podium deliberations..."
                        className="bg-surface-950/60 border-surface-800 text-surface-300 placeholder:text-surface-600 focus:border-surface-600 w-full rounded-2xl border p-3 text-xs focus:outline-none sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-surface-400 text-xs">
                      {selectedSub.myScore
                        ? "Editing previously saved evaluation."
                        : "New evaluation."}
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-purple-600 font-bold text-white hover:bg-purple-500"
                    >
                      {submitting
                        ? "Saving..."
                        : selectedSub.myScore
                          ? "Update Evaluation"
                          : "Submit Evaluation"}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="border-surface-800 bg-surface-900/40 rounded-3xl border p-12 text-center">
                <p className="text-surface-400 text-sm">
                  Select a project submission on the left to grade.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
