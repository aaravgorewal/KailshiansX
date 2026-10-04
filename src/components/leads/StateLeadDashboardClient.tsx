"use client";

// src/components/leads/StateLeadDashboardClient.tsx
// Comprehensive State Lead Dashboard implementing PRD §12:
// State scope, Cities covered, Campus leads under purview, Statewide referrals, Regional events, Activities log, Performance score, and Monthly reports.

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Users,
  Calendar,
  Award,
  Plus,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Share2,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { StateLeadDashboardData } from "@/server/leads/service";
import { LeadActivityType, type MonthlyReportStatus } from "@prisma/client";

interface Props {
  initialData: StateLeadDashboardData;
  isAdminViewing?: boolean;
}

export function StateLeadDashboardClient({ initialData, isAdminViewing = false }: Props) {
  const [data, setData] = React.useState<StateLeadDashboardData>(initialData);
  const [activeTab, setActiveTab] = React.useState<
    "CAMPUS_LEADS" | "ACTIVITIES" | "REPORTS" | "EVENTS"
  >("CAMPUS_LEADS");
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState(false);

  // Activity Filter State
  const [activityFilter, setActivityFilter] = React.useState<string>("ALL");

  // Activity Modal State
  const [activityModalOpen, setActivityModalOpen] = React.useState(false);
  const [submittingActivity, setSubmittingActivity] = React.useState(false);
  const [activityForm, setActivityForm] = React.useState({
    title: "",
    type: "PARTNERSHIP_MEETING" as LeadActivityType,
    description: "",
    date: new Date().toISOString().split("T")[0],
    hoursSpent: 2.0,
    attendeesCount: 50,
    proofUrl: "",
  });

  // Monthly Report Modal State
  const [reportModalOpen, setReportModalOpen] = React.useState(false);
  const [submittingReport, setSubmittingReport] = React.useState(false);
  const currentDate = new Date();
  const [reportForm, setReportForm] = React.useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    summary: "",
    highlights: "",
    challenges: "",
    nextMonthPlans: "",
    newSignupsCount: 50,
    eventsOrganizedCount: 2,
    swagDistributedCount: 60,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(data.referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(data.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Submit new state activity
  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingActivity(true);
    try {
      const res = await fetch("/api/leads/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: data.leadId,
          leadType: "STATE",
          title: activityForm.title,
          type: activityForm.type,
          description: activityForm.description,
          date: activityForm.date,
          hoursSpent: Number(activityForm.hoursSpent),
          attendeesCount: Number(activityForm.attendeesCount),
          proofUrls: activityForm.proofUrl ? [activityForm.proofUrl] : [],
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const newAct = json.data;
        setData((prev) => ({
          ...prev,
          activities: [
            {
              id: newAct.id,
              title: newAct.title,
              type: newAct.type,
              description: newAct.description,
              date: newAct.date,
              hoursSpent: newAct.hoursSpent,
              attendeesCount: newAct.attendeesCount,
              proofUrls: newAct.proofUrls || [],
              verifiedByAdmin: false,
              adminFeedback: null,
              createdAt: newAct.createdAt,
            },
            ...prev.activities,
          ],
          performance: {
            ...prev.performance,
            score: Math.min(100, prev.performance.score + 5),
          },
        }));

        setActivityModalOpen(false);
        setActivityForm({
          title: "",
          type: "PARTNERSHIP_MEETING",
          description: "",
          date: new Date().toISOString().split("T")[0],
          hoursSpent: 2.0,
          attendeesCount: 50,
          proofUrl: "",
        });
      } else {
        alert(json.error || "Failed to log activity");
      }
    } catch (err) {
      console.error(err);
      alert("Network error logging activity");
    } finally {
      setSubmittingActivity(false);
    }
  };

  // Submit monthly report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      const res = await fetch("/api/leads/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: data.leadId,
          leadType: "STATE",
          month: Number(reportForm.month),
          year: Number(reportForm.year),
          summary: reportForm.summary,
          highlights: reportForm.highlights,
          challenges: reportForm.challenges,
          nextMonthPlans: reportForm.nextMonthPlans,
          newSignupsCount: Number(reportForm.newSignupsCount),
          eventsOrganizedCount: Number(reportForm.eventsOrganizedCount),
          swagDistributedCount: Number(reportForm.swagDistributedCount),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const saved = json.data;
        setData((prev) => {
          const filtered = prev.monthlyReports.filter(
            (r) => !(r.month === saved.month && r.year === saved.year)
          );
          return {
            ...prev,
            monthlyReports: [
              {
                id: saved.id,
                month: saved.month,
                year: saved.year,
                status: saved.status as MonthlyReportStatus,
                summary: saved.summary,
                highlights: saved.highlights,
                challenges: saved.challenges,
                nextMonthPlans: saved.nextMonthPlans,
                newSignupsCount: saved.newSignupsCount,
                eventsOrganizedCount: saved.eventsOrganizedCount,
                swagDistributedCount: saved.swagDistributedCount,
                performanceScore: saved.performanceScore,
                adminFeedback: saved.adminFeedback,
                submittedAt: saved.submittedAt,
                reviewedAt: saved.reviewedAt,
              },
              ...filtered,
            ],
            performance: {
              ...prev.performance,
              score: Math.min(100, prev.performance.score + 5),
            },
          };
        });

        setReportModalOpen(false);
      } else {
        alert(json.error || "Failed to submit report");
      }
    } catch (err) {
      console.error(err);
      alert("Network error submitting report");
    } finally {
      setSubmittingReport(false);
    }
  };

  const filteredActivities = data.activities.filter((act) => {
    if (activityFilter === "ALL") return true;
    return act.type === activityFilter;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* ─── ADMIN SCOPE BANNER ───────────────────────────────────────────── */}
      {isAdminViewing && (
        <div className="flex items-center justify-between rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-purple-500/20 p-2 text-purple-400">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-bold tracking-wider text-purple-400 uppercase">
                Admin Impersonation Mode
              </div>
              <div className="text-sm font-semibold text-white">
                Viewing role-gated state scope for {data.name} ({data.state})
              </div>
            </div>
          </div>
          <Link href="/admin/state-leads">
            <Button variant="outline" size="sm">
              Back to State Pipeline →
            </Button>
          </Link>
        </div>
      )}

      {/* ─── STATE LEAD HEADER & JURISDICTION CARD ───────────────────────── */}
      <div className="bg-surface-900/80 border-surface-800 relative overflow-hidden rounded-3xl border p-6 shadow-xl backdrop-blur-md sm:p-8">
        <div className="pointer-events-none absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <div className="bg-surface-800 border-surface-700 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border">
              {data.image ? (
                <Image
                  src={data.image}
                  alt={data.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <MapPin className="h-8 w-8 text-purple-400" />
              )}
            </div>

            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>State Lead</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                  ● {data.status}
                </span>
                <span className="text-surface-500 text-xs">
                  Chartered {new Date(data.startDate).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                {data.name}
              </h1>

              <div className="text-surface-400 mt-1.5 flex flex-wrap items-center gap-4 text-xs font-medium">
                <span className="text-surface-200 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  <strong>State of {data.state}</strong>
                </span>
                <span className="text-surface-300 flex items-center gap-1">
                  <Building2 className="text-brand-400 h-3.5 w-3.5" />
                  {data.stateAggregates.totalCitiesCount} Cities ·{" "}
                  {data.stateAggregates.totalCollegesCount} Colleges
                </span>
                <span>{data.email}</span>
              </div>
            </div>
          </div>

          {/* Statewide Referral Code Box */}
          <div className="bg-surface-950/80 border-surface-700/80 w-full rounded-2xl border p-4 shadow-inner sm:p-5 lg:w-96">
            <div className="text-surface-400 mb-2 flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Share2 className="h-3.5 w-3.5" />
                <span>Statewide Referral Code</span>
              </span>
              <button
                id="btn-copy-code"
                onClick={handleCopyCode}
                className="text-surface-400 flex items-center gap-1 text-[11px] hover:text-white"
              >
                {copiedCode ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="bg-surface-900 border-surface-800 mb-3 flex items-center justify-between rounded-xl border px-3.5 py-2 font-mono text-sm font-bold text-white">
              <span>{data.referralCode}</span>
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400 uppercase">
                State Chapter
              </span>
            </div>

            <button
              id="btn-copy-referral-link"
              onClick={handleCopyLink}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-2 text-xs font-bold text-white shadow-sm shadow-purple-500/20 transition-all hover:bg-purple-500"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedLink ? "State Link Copied!" : "Copy Official State Invite Link"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 4 PRIMARY KPI METRIC CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Statewide Referrals */}
        <div className="bg-surface-900/80 border-surface-800 hover:border-surface-700 rounded-2xl border p-5 shadow-sm transition-all">
          <div className="text-surface-400 mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Statewide Referrals</span>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div className="font-mono text-3xl font-black text-white">
            {data.stateAggregates.totalStatewideReferrals.toLocaleString("en-IN")}
          </div>
          <div className="text-surface-400 mt-1 text-[11px]">
            Aggregated across all campus chapters in {data.state}
          </div>
        </div>

        {/* Card 2: Regional Events Supported */}
        <div className="bg-surface-900/80 border-surface-800 hover:border-surface-700 rounded-2xl border p-5 shadow-sm transition-all">
          <div className="text-surface-400 mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Regional Events</span>
            <Calendar className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-mono text-3xl font-black text-emerald-400">
            {data.stateAggregates.totalStatewideEvents}
          </div>
          <div className="text-surface-400 mt-1 text-[11px]">
            State meetups, hackathons, & university workshops
          </div>
        </div>

        {/* Card 3: Campus Leads in State */}
        <div className="bg-surface-900/80 border-surface-800 hover:border-surface-700 rounded-2xl border p-5 shadow-sm transition-all">
          <div className="text-surface-400 mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Active Campus Leads</span>
            <GraduationCap className="h-4 w-4 text-blue-400" />
          </div>
          <div className="font-mono text-3xl font-black text-blue-400">
            {data.stateAggregates.totalCampusLeadsCount}
          </div>
          <div className="text-surface-400 mt-1 text-[11px]">
            Student chapter leaders under your purview
          </div>
        </div>

        {/* Card 4: State Performance Score */}
        <div className="bg-surface-900/80 border-surface-800 hover:border-surface-700 rounded-2xl border p-5 shadow-sm transition-all">
          <div className="text-surface-400 mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Performance Score</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="font-mono text-3xl font-black"
              style={{ color: data.performance.tierColor }}
            >
              {data.performance.score}
            </span>
            <span className="text-surface-400 font-mono text-xs">/100</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
              style={{
                backgroundColor: `${data.performance.tierColor}20`,
                color: data.performance.tierColor,
                border: `1px solid ${data.performance.tierColor}40`,
              }}
            >
              {data.performance.tier} · {data.performance.tierLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION TABS & ACTIONS ────────────────────────────────────── */}
      <div className="border-surface-800 flex flex-col items-center justify-between gap-4 border-b pb-4 sm:flex-row">
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          <button
            id="tab-campus-leads"
            onClick={() => setActiveTab("CAMPUS_LEADS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "CAMPUS_LEADS"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-surface-400 hover:bg-surface-800 hover:text-white"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Campus Leads in State ({data.campusLeadsInState.length})</span>
          </button>

          <button
            id="tab-activities"
            onClick={() => setActiveTab("ACTIVITIES")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "ACTIVITIES"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-surface-400 hover:bg-surface-800 hover:text-white"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>State Activities ({data.activities.length})</span>
          </button>

          <button
            id="tab-reports"
            onClick={() => setActiveTab("REPORTS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "REPORTS"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-surface-400 hover:bg-surface-800 hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Monthly Reports ({data.monthlyReports.length})</span>
          </button>

          <button
            id="tab-events"
            onClick={() => setActiveTab("EVENTS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "EVENTS"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-surface-400 hover:bg-surface-800 hover:text-white"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Regional Events ({data.supportedEvents.length})</span>
          </button>
        </div>

        <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
          {activeTab === "ACTIVITIES" && (
            <Button
              id="btn-log-state-activity"
              variant="default"
              size="sm"
              onClick={() => setActivityModalOpen(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>Log State Activity</span>
            </Button>
          )}

          {activeTab === "REPORTS" && (
            <Button
              id="btn-submit-state-report"
              variant="default"
              size="sm"
              onClick={() => setReportModalOpen(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>Submit State Report</span>
            </Button>
          )}
        </div>
      </div>

      {/* ─── TAB 1: CAMPUS LEADS IN STATE ─────────────────────────────────── */}
      {activeTab === "CAMPUS_LEADS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-surface-400 text-sm font-bold tracking-wider uppercase">
              Campus Chapter Leaders Across {data.state}
            </h3>
            <span className="text-surface-400 text-xs">
              {data.campusLeadsInState.length} Chartered Chapters
            </span>
          </div>

          {data.campusLeadsInState.length === 0 ? (
            <div className="bg-surface-900/60 border-surface-800 rounded-2xl border p-12 text-center">
              <GraduationCap className="text-surface-600 mx-auto mb-3 h-12 w-12" />
              <h3 className="mb-1 text-base font-bold text-white">
                No campus leads chartered in {data.state} yet
              </h3>
              <p className="text-surface-400 mx-auto mb-5 max-w-sm text-xs">
                Identify proactive students across engineering colleges in {data.state} and nominate
                them for Campus Lead roles.
              </p>
              <Link href="/campus-leads">
                <Button size="sm">
                  <span>Share Campus Lead Application Link →</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-surface-900/80 border-surface-800 overflow-hidden rounded-2xl border shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-950 text-surface-400 border-surface-800 border-b font-semibold tracking-wider uppercase">
                    <tr>
                      <th className="px-4 py-3">Lead Name</th>
                      <th className="px-4 py-3">College</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Referrals</th>
                      <th className="px-4 py-3">Events</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-surface-800 divide-y">
                    {data.campusLeadsInState.map((cl) => (
                      <tr key={cl.id} className="hover:bg-surface-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{cl.name}</div>
                          <div className="text-surface-400 text-[11px]">{cl.email}</div>
                        </td>
                        <td className="text-surface-200 px-4 py-3 font-medium">{cl.collegeName}</td>
                        <td className="text-surface-300 px-4 py-3">{cl.cityName}</td>
                        <td className="text-brand-400 px-4 py-3 font-mono font-bold">
                          {cl.referrals}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                          {cl.eventsSupported}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-amber-400">
                          {cl.performanceScore}/100
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                            ● {cl.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: STATE ACTIVITIES ──────────────────────────────────────── */}
      {activeTab === "ACTIVITIES" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: "All Activities" },
              { id: "PARTNERSHIP_MEETING", label: "University Partnerships" },
              { id: "MEETUP_ORGANIZING", label: "City Meetups" },
              { id: "SPEAKER_INVITATION", label: "Speaker Outreach" },
              { id: "COLLEGE_OUTREACH", label: "Campus Coordination" },
              { id: "SOCIAL_CAMPAIGN", label: "Press & Social" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActivityFilter(cat.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activityFilter === cat.id
                    ? "bg-surface-700 text-white"
                    : "bg-surface-900 text-surface-400 hover:bg-surface-800 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {filteredActivities.length === 0 ? (
            <div className="bg-surface-900/60 border-surface-800 rounded-2xl border p-12 text-center">
              <CheckCircle2 className="text-surface-600 mx-auto mb-3 h-12 w-12" />
              <h3 className="mb-1 text-base font-bold text-white">
                No state activities logged yet
              </h3>
              <p className="text-surface-400 mx-auto mb-5 max-w-sm text-xs">
                Record your regional university partnerships, city meetup preparations, and
                state-level hackathon alliances.
              </p>
              <Button size="sm" onClick={() => setActivityModalOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Log First State Activity
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-surface-900/80 border-surface-800 hover:border-surface-700 flex flex-col justify-between space-y-4 rounded-2xl border p-5 transition-all"
                >
                  <div>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <span className="bg-surface-800 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider text-purple-400 uppercase">
                        {act.type.replace(/_/g, " ")}
                      </span>
                      {act.verifiedByAdmin ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                          <Clock className="h-3 w-3" />
                          Pending Review
                        </span>
                      )}
                    </div>

                    <h4 className="mb-1.5 text-sm font-bold text-white">{act.title}</h4>
                    <p className="text-surface-300 text-xs leading-relaxed">{act.description}</p>
                  </div>

                  <div className="border-surface-800/80 text-surface-400 flex items-center justify-between border-t pt-3 text-xs font-medium">
                    <div className="flex items-center gap-3">
                      <span>📅 {new Date(act.date).toLocaleDateString()}</span>
                      <span>⏱️ {act.hoursSpent} hrs</span>
                      <span>👥 {act.attendeesCount} leaders</span>
                    </div>

                    {act.proofUrls.length > 0 && (
                      <a
                        href={act.proofUrls[0]}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300"
                      >
                        <span>Proof Link</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: MONTHLY REPORTS ───────────────────────────────────────── */}
      {activeTab === "REPORTS" && (
        <div className="space-y-6">
          <div className="bg-surface-900/60 border-surface-800 flex flex-col items-center justify-between gap-4 rounded-2xl border p-5 sm:flex-row">
            <div>
              <h3 className="mb-0.5 text-sm font-bold text-white">
                State Chapter Retrospectives & Ecosystem Reports
              </h3>
              <p className="text-surface-400 text-xs">
                Submit state progress reviews detailing city activations, cross-college delegations,
                and regional community expansion.
              </p>
            </div>
            <Button size="sm" onClick={() => setReportModalOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>Submit State Report</span>
            </Button>
          </div>

          {data.monthlyReports.length === 0 ? (
            <div className="bg-surface-900/60 border-surface-800 rounded-2xl border p-12 text-center">
              <FileText className="text-surface-600 mx-auto mb-3 h-12 w-12" />
              <h3 className="mb-1 text-base font-bold text-white">No state reports filed yet</h3>
              <p className="text-surface-400 mx-auto mb-5 max-w-sm text-xs">
                Submit your monthly strategic recap covering regional meetups, campus lead health,
                and state growth metrics.
              </p>
              <Button size="sm" onClick={() => setReportModalOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Submit This Month’s Report
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {data.monthlyReports.map((rep) => {
                const monthName = new Date(rep.year, rep.month - 1).toLocaleString("en-US", {
                  month: "long",
                });

                return (
                  <div
                    key={rep.id}
                    className="bg-surface-900/80 border-surface-800 hover:border-surface-700 space-y-4 rounded-2xl border p-6 transition-all"
                  >
                    <div className="border-surface-800 flex flex-col justify-between gap-2 border-b pb-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-white">
                          State of {data.state} — {monthName} {rep.year} Review
                        </span>
                        <Badge
                          variant={rep.status === "REVIEWED" ? "success" : "warning"}
                          size="sm"
                        >
                          {rep.status}
                        </Badge>
                      </div>

                      <div className="text-surface-400 flex items-center gap-4 text-xs">
                        {rep.performanceScore !== null && (
                          <span className="rounded-md bg-amber-500/10 px-2.5 py-0.5 font-mono font-bold text-amber-400">
                            Score: {rep.performanceScore} / 100
                          </span>
                        )}
                        <span>Submitted {new Date(rep.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="bg-surface-950/60 grid grid-cols-3 gap-3 rounded-xl p-3 text-center text-xs">
                      <div>
                        <div className="text-surface-400 text-[10px] font-semibold uppercase">
                          State Signups
                        </div>
                        <div className="mt-0.5 font-mono text-base font-bold text-white">
                          {rep.newSignupsCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-surface-400 text-[10px] font-semibold uppercase">
                          Events Held
                        </div>
                        <div className="mt-0.5 font-mono text-base font-bold text-white">
                          {rep.eventsOrganizedCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-surface-400 text-[10px] font-semibold uppercase">
                          Swag Distributed
                        </div>
                        <div className="mt-0.5 font-mono text-base font-bold text-white">
                          {rep.swagDistributedCount}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-surface-300 mb-1 text-xs font-bold tracking-wider uppercase">
                        Executive Summary
                      </div>
                      <p className="text-surface-300 text-xs leading-relaxed">{rep.summary}</p>
                    </div>

                    {rep.highlights && (
                      <div>
                        <div className="mb-1 text-xs font-bold tracking-wider text-emerald-400 uppercase">
                          Key Regional Wins
                        </div>
                        <p className="text-surface-300 text-xs leading-relaxed">{rep.highlights}</p>
                      </div>
                    )}

                    {rep.challenges && (
                      <div>
                        <div className="mb-1 text-xs font-bold tracking-wider text-rose-400 uppercase">
                          State Challenges & Core Team Asks
                        </div>
                        <p className="text-surface-300 text-xs leading-relaxed">{rep.challenges}</p>
                      </div>
                    )}

                    {rep.nextMonthPlans && (
                      <div>
                        <div className="mb-1 text-xs font-bold tracking-wider text-purple-400 uppercase">
                          State Roadmap for Next Month
                        </div>
                        <p className="text-surface-300 text-xs leading-relaxed">
                          {rep.nextMonthPlans}
                        </p>
                      </div>
                    )}

                    {rep.adminFeedback && (
                      <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3.5">
                        <div className="mb-1 text-xs font-bold text-purple-400">
                          Core Leadership Feedback:
                        </div>
                        <p className="text-surface-200 text-xs">{rep.adminFeedback}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: REGIONAL EVENTS ───────────────────────────────────────── */}
      {activeTab === "EVENTS" && (
        <div className="space-y-4">
          {data.supportedEvents.length === 0 ? (
            <div className="bg-surface-900/60 border-surface-800 rounded-2xl border p-12 text-center">
              <Calendar className="text-surface-600 mx-auto mb-3 h-12 w-12" />
              <h3 className="mb-1 text-base font-bold text-white">No regional events linked yet</h3>
              <p className="text-surface-400 mx-auto max-w-sm text-xs">
                Coordinate with KailshiansX Event Managers to link regional tech summits and city
                meetup editions across {data.state}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.supportedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-surface-900/80 border-surface-800 hover:border-surface-700 flex items-center justify-between rounded-2xl border p-5 transition-all"
                >
                  <div>
                    <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-purple-400 uppercase">
                      Role: {ev.role}
                    </span>
                    <h4 className="mt-1.5 text-sm font-bold text-white">{ev.title}</h4>
                    <div className="text-surface-400 mt-0.5 text-xs">
                      📅 {new Date(ev.startDate).toLocaleDateString()}
                    </div>
                  </div>

                  <Link href={`/events/${ev.slug}`}>
                    <Button variant="outline" size="sm">
                      <span>View Event</span>
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL: LOG STATE ACTIVITY ────────────────────────────────────── */}
      {activityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-surface-900 border-surface-800 w-full max-w-md space-y-5 rounded-3xl border p-6 shadow-2xl">
            <div className="border-surface-800 flex items-center justify-between border-b pb-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                <span>Log State Activity</span>
              </h3>
              <button
                onClick={() => setActivityModalOpen(false)}
                className="text-surface-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitActivity} className="space-y-4">
              <div>
                <label className="text-surface-300 mb-1 block text-xs font-semibold">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Secured university lab partnership in Jaipur"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  className="bg-surface-950 border-surface-700 w-full rounded-xl border px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-300 mb-1 block text-xs font-semibold">
                    Activity Type
                  </label>
                  <select
                    value={activityForm.type}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        type: e.target.value as LeadActivityType,
                      })
                    }
                    className="bg-surface-950 border-surface-700 w-full rounded-xl border px-3 py-2 text-xs text-white"
                  >
                    <option value="PARTNERSHIP_MEETING">University Partnership</option>
                    <option value="MEETUP_ORGANIZING">City Meetup Organizing</option>
                    <option value="SPEAKER_INVITATION">Speaker Outreach</option>
                    <option value="COLLEGE_OUTREACH">Campus Lead Coordination</option>
                    <option value="SOCIAL_CAMPAIGN">Social Campaign / Press</option>
                    <option value="OTHER">Other Activity</option>
                  </select>
                </div>

                <div>
                  <label className="text-surface-300 mb-1 block text-xs font-semibold">Date</label>
                  <input
                    type="date"
                    required
                    value={activityForm.date}
                    onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                    className="bg-surface-950 border-surface-700 w-full rounded-xl border px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-300 mb-1 block text-xs font-semibold">
                    Hours Spent
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={activityForm.hoursSpent}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, hoursSpent: Number(e.target.value) })
                    }
                    className="bg-surface-950 border-surface-700 w-full rounded-xl border px-3 py-2 font-mono text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-surface-300 mb-1 block text-xs font-semibold">
                    Builders Reached
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={activityForm.attendeesCount}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, attendeesCount: Number(e.target.value) })
                    }
                    className="bg-surface-950 border-surface-700 w-full rounded-xl border px-3 py-2 font-mono text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-surface-300 mb-1 block text-xs font-semibold">
                  Description & Regional Impact
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail meeting outcomes, colleges involved, key decisions..."
                  value={activityForm.description}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, description: e.target.value })
                  }
                  className="bg-surface-950 border-surface-700 w-full rounded-xl border p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-surface-300 mb-1 block text-xs font-semibold">
                  Photo / Proof URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://photos.app.goo.gl/... or post link"
                  value={activityForm.proofUrl}
                  onChange={(e) => setActivityForm({ ...activityForm, proofUrl: e.target.value })}
                  className="bg-surface-950 border-surface-700 w-full rounded-xl border px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActivityModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="sm" disabled={submittingActivity}>
                  {submittingActivity ? "Logging..." : "Confirm & Log Activity"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: SUBMIT STATE REPORT ───────────────────────────────────── */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-surface-900 border-surface-800 max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-3xl border p-6 shadow-2xl">
            <div className="border-surface-800 flex items-center justify-between border-b pb-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <FileText className="h-4 w-4 text-purple-400" />
                <span>Submit State Retrospective</span>
              </h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-surface-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-300 mb-1 block text-xs font-semibold">Month</label>
                  <select
                    value={reportForm.month}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, month: Number(e.target.value) })
                    }
                    className="bg-surface-950 border-surface-700 w-full rounded-xl border px-3 py-2 text-xs text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {new Date(2026, m - 1).toLocaleString("en-US", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-surface-300 mb-1 block text-xs font-semibold">Year</label>
                  <input
                    type="number"
                    value={reportForm.year}
                    onChange={(e) => setReportForm({ ...reportForm, year: Number(e.target.value) })}
                    className="bg-surface-950 border-surface-700 w-full rounded-xl border px-3 py-2 font-mono text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-surface-300 mb-1 block text-xs font-semibold">
                    State Signups
                  </label>
                  <input
                    type="number"
                    value={reportForm.newSignupsCount}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, newSignupsCount: Number(e.target.value) })
                    }
                    className="bg-surface-950 border-surface-700 w-full rounded-xl border px-3 py-2 font-mono text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-surface-300 mb-1 block text-xs font-semibold">
                    Events Held
                  </label>
                  <input
                    type="number"
                    value={reportForm.eventsOrganizedCount}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        eventsOrganizedCount: Number(e.target.value),
                      })
                    }
                    className="bg-surface-950 border-surface-700 w-full rounded-xl border px-3 py-2 font-mono text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-surface-300 mb-1 block text-xs font-semibold">
                    Swag Given
                  </label>
                  <input
                    type="number"
                    value={reportForm.swagDistributedCount}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        swagDistributedCount: Number(e.target.value),
                      })
                    }
                    className="bg-surface-950 border-surface-700 w-full rounded-xl border px-3 py-2 font-mono text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-surface-300 mb-1 block text-xs font-semibold">
                  Executive Summary of State Chapter
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summarize state-level growth, campus activations, regional partnerships..."
                  value={reportForm.summary}
                  onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })}
                  className="bg-surface-950 border-surface-700 w-full rounded-xl border p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-surface-300 mb-1 block text-xs font-semibold">
                  Key Regional Wins & Milestones
                </label>
                <textarea
                  rows={2}
                  placeholder="New college chapters launched, prominent speakers locked..."
                  value={reportForm.highlights}
                  onChange={(e) => setReportForm({ ...reportForm, highlights: e.target.value })}
                  className="bg-surface-950 border-surface-700 w-full rounded-xl border p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-surface-300 mb-1 block text-xs font-semibold">
                  State Challenges & Core Team Asks
                </label>
                <textarea
                  rows={2}
                  placeholder="Regional venue hurdles, city lead hiring needs..."
                  value={reportForm.challenges}
                  onChange={(e) => setReportForm({ ...reportForm, challenges: e.target.value })}
                  className="bg-surface-950 border-surface-700 w-full rounded-xl border p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-surface-300 mb-1 block text-xs font-semibold">
                  Roadmap for Next Month
                </label>
                <textarea
                  rows={2}
                  placeholder="Upcoming city meetups, state hackathon delegations..."
                  value={reportForm.nextMonthPlans}
                  onChange={(e) => setReportForm({ ...reportForm, nextMonthPlans: e.target.value })}
                  className="bg-surface-950 border-surface-700 w-full rounded-xl border p-3 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReportModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="sm" disabled={submittingReport}>
                  {submittingReport ? "Submitting..." : "Submit State Retrospective"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
