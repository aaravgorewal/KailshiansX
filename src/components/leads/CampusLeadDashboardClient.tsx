"use client";

// src/components/leads/CampusLeadDashboardClient.tsx
// Comprehensive Campus Lead Dashboard implementing :
// College scope, City, Referrals, Events supported, Activities log, Performance score, and Monthly reports.

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  MapPin,
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { CampusLeadDashboardData } from "@/server/leads/service";
import { LeadActivityType, type MonthlyReportStatus } from "@prisma/client";

interface Props {
  initialData: CampusLeadDashboardData;
  isAdminViewing?: boolean;
}

export function CampusLeadDashboardClient({ initialData, isAdminViewing = false }: Props) {
  const [data, setData] = React.useState<CampusLeadDashboardData>(initialData);
  const [activeTab, setActiveTab] = React.useState<"ACTIVITIES" | "REPORTS" | "EVENTS">(
    "ACTIVITIES"
  );
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState(false);

  // Activity Filter State
  const [activityFilter, setActivityFilter] = React.useState<string>("ALL");

  // Activity Modal State
  const [activityModalOpen, setActivityModalOpen] = React.useState(false);
  const [submittingActivity, setSubmittingActivity] = React.useState(false);
  const [activityForm, setActivityForm] = React.useState({
    title: "",
    type: "COLLEGE_OUTREACH" as LeadActivityType,
    description: "",
    date: new Date().toISOString().split("T")[0],
    hoursSpent: 1.5,
    attendeesCount: 25,
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
    newSignupsCount: 15,
    eventsOrganizedCount: 1,
    swagDistributedCount: 20,
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

  // Submit new activity
  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingActivity(true);
    try {
      const res = await fetch("/api/leads/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: data.leadId,
          leadType: "CAMPUS",
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
        // Optimistically add to activity list
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
          type: "COLLEGE_OUTREACH",
          description: "",
          date: new Date().toISOString().split("T")[0],
          hoursSpent: 1.5,
          attendeesCount: 25,
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
          leadType: "CAMPUS",
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
      {/* ─── ADMIN SCOPE BANNER (If admin viewing) ────────────────────────── */}
      {isAdminViewing && (
        <div className="bg-primary/10 border-primary/20 flex items-center justify-between rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <span className="bg-primary/20 text-primary rounded-xl p-2">
              <ShieldCheckIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-primary text-xs font-bold tracking-wider uppercase">
                Admin Impersonation Mode
              </div>
              <div className="text-foreground text-sm font-semibold">
                Viewing role-gated campus scope for {data.name} ({data.collegeName})
              </div>
            </div>
          </div>
          <Link href="/admin/campus-leads">
            <Button variant="outline" size="sm">
              Back to Campus Pipeline →
            </Button>
          </Link>
        </div>
      )}

      {/* ─── LEAD HEADER & JURISDICTION CARD ─────────────────────────────── */}
      <div className="bg-card border-border relative overflow-hidden rounded-3xl border p-6 shadow-xl backdrop-blur-md sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <div className="bg-muted border-border flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border">
              {data.image ? (
                <Image
                  src={data.image}
                  alt={data.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <GraduationCap className="text-primary h-8 w-8" />
              )}
            </div>

            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Campus Lead</span>
                </span>
                <span className="border-success/20 bg-success/10 text-success inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                  ● {data.status}
                </span>
                <span className="text-muted-foreground text-xs">
                  Chartered {new Date(data.startDate).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                {data.name}
              </h1>

              <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-4 text-xs font-medium">
                <span className="text-foreground flex items-center gap-1">
                  <GraduationCap className="text-primary h-3.5 w-3.5" />
                  <strong>{data.collegeName}</strong>
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="text-destructive h-3.5 w-3.5" />
                  {data.cityName}, {data.state}
                </span>
                <span>{data.email}</span>
              </div>
            </div>
          </div>

          {/* Referral Link & Code Box */}
          <div className="bg-background border-border w-full rounded-2xl border p-4 shadow-inner sm:p-5 lg:w-96">
            <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-bold">
              <span className="text-primary flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5" />
                <span>Your Referral Code</span>
              </span>
              <button
                id="btn-copy-code"
                onClick={handleCopyCode}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
              >
                {copiedCode ? (
                  <Check className="text-success h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="bg-card border-border text-foreground mb-3 flex items-center justify-between rounded-xl border px-3.5 py-2 font-mono text-sm font-bold">
              <span>{data.referralCode}</span>
              <span className="bg-success/10 text-success rounded-md px-2 py-0.5 text-xs font-semibold uppercase">
                +1 pt / ref
              </span>
            </div>

            <button
              id="btn-copy-referral-link"
              onClick={handleCopyLink}
              className="bg-primary hover:bg-primary-hover text-primary-foreground flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold shadow-sm transition-all"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedLink ? "Referral Link Copied!" : "Copy Official Invite Link"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 4 PRIMARY KPI METRIC CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Referrals */}
        <div className="bg-card border-border hover:border-border rounded-2xl border p-5 shadow-sm transition-all">
          <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Attendee Referrals</span>
            <Users className="text-primary h-4 w-4" />
          </div>
          <div className="text-foreground font-mono text-3xl font-black">
            {data.referrals.toLocaleString("en-IN")}
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            Registered builders via your invite code
          </div>
        </div>

        {/* Card 2: Events Supported */}
        <div className="bg-card border-border hover:border-border rounded-2xl border p-5 shadow-sm transition-all">
          <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Events Supported</span>
            <Calendar className="text-success h-4 w-4" />
          </div>
          <div className="text-success font-mono text-3xl font-black">{data.eventsSupported}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            Campus meetups, hackathons, & summits
          </div>
        </div>

        {/* Card 3: Activities Logged */}
        <div className="bg-card border-border hover:border-border rounded-2xl border p-5 shadow-sm transition-all">
          <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Activities Logged</span>
            <CheckCircle2 className="text-primary h-4 w-4" />
          </div>
          <div className="text-primary font-mono text-3xl font-black">{data.activities.length}</div>
          <div className="text-muted-foreground mt-1 text-xs">
            {data.activities.filter((a) => a.verifiedByAdmin).length} verified by KailshiansX Core
          </div>
        </div>

        {/* Card 4: Performance Score */}
        <div className="bg-card border-border hover:border-border rounded-2xl border p-5 shadow-sm transition-all">
          <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Performance Score</span>
            <Award className="text-primary h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="font-mono text-3xl font-black"
              style={{ color: data.performance.tierColor }}
            >
              {data.performance.score}
            </span>
            <span className="text-muted-foreground font-mono text-xs">/100</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className="rounded-md px-2 py-0.5 text-xs font-bold tracking-wider uppercase"
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
      <div className="border-border flex flex-col items-center justify-between gap-4 border-b pb-4 sm:flex-row">
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          <button
            id="tab-activities"
            onClick={() => setActiveTab("ACTIVITIES")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "ACTIVITIES"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Activities Log ({data.activities.length})</span>
          </button>

          <button
            id="tab-reports"
            onClick={() => setActiveTab("REPORTS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "REPORTS"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Supported Events ({data.supportedEvents.length})</span>
          </button>
        </div>

        <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
          {activeTab === "ACTIVITIES" && (
            <Button
              id="btn-log-activity"
              variant="default"
              size="sm"
              onClick={() => setActivityModalOpen(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>Log Campus Activity</span>
            </Button>
          )}

          {activeTab === "REPORTS" && (
            <Button
              id="btn-submit-monthly-report"
              variant="default"
              size="sm"
              onClick={() => setReportModalOpen(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>Submit Monthly Report</span>
            </Button>
          )}
        </div>
      </div>

      {/* ─── TAB 1: ACTIVITIES LOG ────────────────────────────────────────── */}
      {activeTab === "ACTIVITIES" && (
        <div className="space-y-6">
          {/* Activity Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: "All Activities" },
              { id: "COLLEGE_OUTREACH", label: "Outreach & Tabling" },
              { id: "WORKSHOP_HOSTING", label: "Workshops" },
              { id: "INFO_SESSION", label: "Info Sessions" },
              { id: "HACKATHON_BOOTH", label: "Hackathon Booths" },
              { id: "POSTER_DISTRIBUTION", label: "Flyers & Posters" },
              { id: "SOCIAL_CAMPAIGN", label: "Social Campaigns" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActivityFilter(cat.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activityFilter === cat.id
                    ? "bg-muted text-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Activities List */}
          {filteredActivities.length === 0 ? (
            <div className="bg-card border-border rounded-2xl border p-12 text-center">
              <CheckCircle2 className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
              <h3 className="text-foreground mb-1 text-base font-bold">No activities logged yet</h3>
              <p className="text-muted-foreground mx-auto mb-5 max-w-sm text-xs">
                Record your workshops, club meetups, info sessions, or flyer distributions to build
                your official leadership track record.
              </p>
              <Button size="sm" onClick={() => setActivityModalOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Log Your First Activity
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-card border-border hover:border-border flex flex-col justify-between space-y-4 rounded-2xl border p-5 transition-all"
                >
                  <div>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs font-bold tracking-wider uppercase">
                        {act.type.replace(/_/g, " ")}
                      </span>
                      {act.verifiedByAdmin ? (
                        <span className="bg-success/10 text-success inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium">
                          <Clock className="h-3 w-3" />
                          Pending Review
                        </span>
                      )}
                    </div>

                    <h4 className="text-foreground mb-1.5 text-sm font-bold">{act.title}</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  <div className="border-border text-muted-foreground flex items-center justify-between border-t pt-3 text-xs font-medium">
                    <div className="flex items-center gap-3">
                      <span>📅 {new Date(act.date).toLocaleDateString()}</span>
                      <span>⏱️ {act.hoursSpent} hrs</span>
                      <span>👥 {act.attendeesCount} builders</span>
                    </div>

                    {act.proofUrls.length > 0 && (
                      <a
                        href={act.proofUrls[0]}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:text-primary inline-flex items-center gap-1 text-xs font-semibold"
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

      {/* ─── TAB 2: MONTHLY REPORTS ───────────────────────────────────────── */}
      {activeTab === "REPORTS" && (
        <div className="space-y-6">
          <div className="bg-card border-border flex flex-col items-center justify-between gap-4 rounded-2xl border p-5 sm:flex-row">
            <div>
              <h3 className="text-foreground mb-0.5 text-sm font-bold">
                Monthly Retrospectives & Performance Evaluation
              </h3>
              <p className="text-muted-foreground text-xs">
                Submit monthly reports at the close of every month. KailshiansX Core evaluates these
                for leadership grants, community funding, and state lead promotions.
              </p>
            </div>
            <Button size="sm" onClick={() => setReportModalOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>Submit Monthly Report</span>
            </Button>
          </div>

          {data.monthlyReports.length === 0 ? (
            <div className="bg-card border-border rounded-2xl border p-12 text-center">
              <FileText className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
              <h3 className="text-foreground mb-1 text-base font-bold">
                No monthly reports filed yet
              </h3>
              <p className="text-muted-foreground mx-auto mb-5 max-w-sm text-xs">
                Submit your monthly progress recap covering community growth, student registrations,
                challenges, and upcoming initiatives.
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
                    className="bg-card border-border hover:border-border space-y-4 rounded-2xl border p-6 transition-all"
                  >
                    <div className="border-border flex flex-col justify-between gap-2 border-b pb-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-foreground text-sm font-black">
                          {monthName} {rep.year} Retrospective
                        </span>
                        <Badge
                          variant={rep.status === "REVIEWED" ? "success" : "warning"}
                          size="sm"
                        >
                          {rep.status}
                        </Badge>
                      </div>

                      <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        {rep.performanceScore !== null && (
                          <span className="bg-primary/10 text-primary rounded-md px-2.5 py-0.5 font-mono font-bold">
                            Score: {rep.performanceScore} / 100
                          </span>
                        )}
                        <span>Submitted {new Date(rep.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="bg-background grid grid-cols-3 gap-3 rounded-xl p-3 text-center text-xs">
                      <div>
                        <div className="text-muted-foreground text-xs font-semibold uppercase">
                          New Signups
                        </div>
                        <div className="text-foreground mt-0.5 font-mono text-base font-bold">
                          {rep.newSignupsCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs font-semibold uppercase">
                          Events Held
                        </div>
                        <div className="text-foreground mt-0.5 font-mono text-base font-bold">
                          {rep.eventsOrganizedCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs font-semibold uppercase">
                          Swag Distributed
                        </div>
                        <div className="text-foreground mt-0.5 font-mono text-base font-bold">
                          {rep.swagDistributedCount}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-muted-foreground mb-1 text-xs font-bold tracking-wider uppercase">
                        Executive Summary
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">{rep.summary}</p>
                    </div>

                    {rep.highlights && (
                      <div>
                        <div className="text-success mb-1 text-xs font-bold tracking-wider uppercase">
                          Key Highlights
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {rep.highlights}
                        </p>
                      </div>
                    )}

                    {rep.challenges && (
                      <div>
                        <div className="text-destructive mb-1 text-xs font-bold tracking-wider uppercase">
                          Challenges & Support Needed
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {rep.challenges}
                        </p>
                      </div>
                    )}

                    {rep.nextMonthPlans && (
                      <div>
                        <div className="text-primary mb-1 text-xs font-bold tracking-wider uppercase">
                          Goals for Next Month
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {rep.nextMonthPlans}
                        </p>
                      </div>
                    )}

                    {rep.adminFeedback && (
                      <div className="bg-primary/10 border-primary/20 rounded-xl border p-3.5">
                        <div className="text-primary mb-1 text-xs font-bold">
                          Core Leadership Feedback:
                        </div>
                        <p className="text-foreground text-xs">{rep.adminFeedback}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: SUPPORTED EVENTS ──────────────────────────────────────── */}
      {activeTab === "EVENTS" && (
        <div className="space-y-4">
          {data.supportedEvents.length === 0 ? (
            <div className="bg-card border-border rounded-2xl border p-12 text-center">
              <Calendar className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
              <h3 className="text-foreground mb-1 text-base font-bold">
                No supported events linked yet
              </h3>
              <p className="text-muted-foreground mx-auto max-w-sm text-xs">
                Coordinate with KailshiansX Event Managers to link hackathons, meetup series, and
                workshops that your campus chapter is co-organizing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.supportedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-card border-border hover:border-border flex items-center justify-between rounded-2xl border p-5 transition-all"
                >
                  <div>
                    <span className="text-primary bg-primary/10 rounded-md px-2 py-0.5 text-xs font-bold tracking-wider uppercase">
                      Role: {ev.role}
                    </span>
                    <h4 className="text-foreground mt-1.5 text-sm font-bold">{ev.title}</h4>
                    <div className="text-muted-foreground mt-0.5 text-xs">
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

      {/* ─── MODAL: LOG CAMPUS ACTIVITY ───────────────────────────────────── */}
      {activityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-card border-border w-full max-w-md space-y-5 rounded-3xl border p-6 shadow-2xl">
            <div className="border-border flex items-center justify-between border-b pb-3">
              <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
                <CheckCircle2 className="text-primary h-4 w-4" />
                <span>Log Campus Activity</span>
              </h3>
              <button
                onClick={() => setActivityModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitActivity} className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed 50 NirmanX flyers in CS Block"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  className="bg-background border-border text-foreground w-full rounded-xl border px-3.5 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold">
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
                    className="bg-background border-border text-foreground w-full rounded-xl border px-3 py-2 text-xs"
                  >
                    <option value="COLLEGE_OUTREACH">College Outreach</option>
                    <option value="WORKSHOP_HOSTING">Workshop Hosting</option>
                    <option value="INFO_SESSION">Info Session</option>
                    <option value="HACKATHON_BOOTH">Hackathon Booth</option>
                    <option value="POSTER_DISTRIBUTION">Poster Distribution</option>
                    <option value="MEETUP_ORGANIZING">Meetup Organizing</option>
                    <option value="SOCIAL_CAMPAIGN">Social Campaign</option>
                    <option value="SPEAKER_INVITATION">Speaker Outreach</option>
                    <option value="OTHER">Other Activity</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={activityForm.date}
                    onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                    className="bg-background border-border text-foreground w-full rounded-xl border px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold">
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
                    className="bg-background border-border text-foreground w-full rounded-xl border px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                    Builders Reached
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={activityForm.attendeesCount}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, attendeesCount: Number(e.target.value) })
                    }
                    className="bg-background border-border text-foreground w-full rounded-xl border px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                  Description & Impact
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail what was organized, key student questions, and next steps..."
                  value={activityForm.description}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, description: e.target.value })
                  }
                  className="bg-background border-border text-foreground w-full rounded-xl border p-3 text-xs"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                  Photo / Proof URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://photos.app.goo.gl/... or LinkedIn post link"
                  value={activityForm.proofUrl}
                  onChange={(e) => setActivityForm({ ...activityForm, proofUrl: e.target.value })}
                  className="bg-background border-border text-foreground w-full rounded-xl border px-3.5 py-2 text-xs"
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

      {/* ─── MODAL: SUBMIT MONTHLY REPORT ─────────────────────────────────── */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-card border-border max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-3xl border p-6 shadow-2xl">
            <div className="border-border flex items-center justify-between border-b pb-3">
              <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
                <FileText className="text-primary h-4 w-4" />
                <span>Submit Monthly Retrospective</span>
              </h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                    Month
                  </label>
                  <select
                    value={reportForm.month}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, month: Number(e.target.value) })
                    }
                    className="bg-background border-border text-foreground w-full rounded-xl border px-3 py-2 text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {new Date(2026, m - 1).toLocaleString("en-US", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                    Year
                  </label>
                  <input
                    type="number"
                    value={reportForm.year}
                    onChange={(e) => setReportForm({ ...reportForm, year: Number(e.target.value) })}
                    className="bg-background border-border text-foreground w-full rounded-xl border px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                    New Signups
                  </label>
                  <input
                    type="number"
                    value={reportForm.newSignupsCount}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, newSignupsCount: Number(e.target.value) })
                    }
                    className="bg-background border-border text-foreground w-full rounded-xl border px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold">
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
                    className="bg-background border-border text-foreground w-full rounded-xl border px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-semibold">
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
                    className="bg-background border-border text-foreground w-full rounded-xl border px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                  Executive Summary of Activities
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summarize main achievements, campus community reception, and overall momentum..."
                  value={reportForm.summary}
                  onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })}
                  className="bg-background border-border text-foreground w-full rounded-xl border p-3 text-xs"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                  Key Highlights & Wins (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Standout student projects, club partnerships, or campus milestones..."
                  value={reportForm.highlights}
                  onChange={(e) => setReportForm({ ...reportForm, highlights: e.target.value })}
                  className="bg-background border-border text-foreground w-full rounded-xl border p-3 text-xs"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                  Challenges & Blockers (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Any college permission friction, budget questions, or support needed from Core..."
                  value={reportForm.challenges}
                  onChange={(e) => setReportForm({ ...reportForm, challenges: e.target.value })}
                  className="bg-background border-border text-foreground w-full rounded-xl border p-3 text-xs"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                  Plans & Goals for Next Month
                </label>
                <textarea
                  rows={2}
                  placeholder="Upcoming workshops planned, hackathon delegations, study groups..."
                  value={reportForm.nextMonthPlans}
                  onChange={(e) => setReportForm({ ...reportForm, nextMonthPlans: e.target.value })}
                  className="bg-background border-border text-foreground w-full rounded-xl border p-3 text-xs"
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
                  {submittingReport ? "Submitting..." : "Submit Retrospective"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}
