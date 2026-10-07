// src/components/admin/CommunityAnalyticsDashboard.tsx
"use client";

import React, { useState } from "react";
import {
  Users,
  Activity,
  TrendingUp,
  Award,
  DollarSign,
  Download,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  Zap,
  BarChart3,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CommunityAnalyticsMetrics } from "@/server/analytics/community-service";

interface Props {
  metrics: CommunityAnalyticsMetrics;
}

type TabType = "EXECUTIVE" | "AUDIENCE" | "LEADERSHIP" | "COMMERCIAL";

export function CommunityAnalyticsDashboard({ metrics }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("EXECUTIVE");

  const downloadCsvReport = () => {
    const rows = [
      ["Metric Name", "Current Value", "Benchmark / Context"],
      [
        "Community Health Index",
        `${metrics.summary.communityHealthScore}/100`,
        "Composite Diagnostic",
      ],
      [
        "Monthly Active Community Members (MAU)",
        metrics.mau.current30d,
        `${metrics.mau.growthPct}% MoM Growth`,
      ],
      [
        "Total Event Registrations (Lifetime)",
        metrics.registrations.totalLifetime,
        `${metrics.registrations.last30Days} in last 30d`,
      ],
      [
        "Paid Ticket Conversion Rate",
        `${metrics.paidConversion.conversionRate}%`,
        `₹${metrics.paidConversion.totalCapturedRevenue.toLocaleString("en-IN")} Captured`,
      ],
      [
        "Repeat Attendee Rate",
        `${metrics.repeatAttendees.repeatAttendanceRate}%`,
        `${metrics.repeatAttendees.repeatAttendeesCount} repeat builders`,
      ],
      [
        "Workshop & Tech-Talk Participation",
        metrics.workshopTalkParticipation.combinedAttendees,
        `${metrics.workshopTalkParticipation.avgAttendeesPerSession} avg/session`,
      ],
      [
        "Campus Lead Activation Rate",
        `${metrics.leadApplications.campus.activationRate}%`,
        `${metrics.leadApplications.campus.active} active across ${metrics.leadApplications.campus.uniqueColleges} colleges`,
      ],
      [
        "State Lead Coverage",
        `${metrics.stateCoverage.coveragePct}%`,
        `${metrics.stateCoverage.coveredCount}/36 Indian States & UTs`,
      ],
      [
        "Collaboration Leads Conversion",
        `${metrics.collaborationLeads.conversionRate}%`,
        `${metrics.collaborationLeads.wonCount} won partnerships`,
      ],
      [
        "Sponsor Deal Conversion Rate",
        `${metrics.sponsorConversion.conversionRate}%`,
        `₹${metrics.sponsorConversion.closedWonValue.toLocaleString("en-IN")} won revenue`,
      ],
      [
        "Event Profitability Margin",
        `${metrics.profitability.profitMarginPct}%`,
        `₹${metrics.profitability.netProfit.toLocaleString("en-IN")} Net P&L`,
      ],
      [
        "Certificate Delivery Rate",
        `${metrics.certificates.deliveryRatePct}%`,
        `${metrics.certificates.totalClaimedOrVerified}/${metrics.certificates.totalIssued} Claimed`,
      ],
      [
        "Attendees Progression to Community Role",
        `${metrics.roleProgression.progressionRatePct}%`,
        `${metrics.roleProgression.attendeesWithCommunityRole} builders progressed to leads`,
      ],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `kailshiansx_community_metrics_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      {/* ─── TOP HERO COCKPIT ──────────────────────────────────────────────── */}
      <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="border-primary/30 bg-muted text-accent-text inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold">
              <Zap className="h-3.5 w-3.5" />
              <span>Executive Intelligence</span>
            </div>
            <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
              Community Analytics & Success Metrics
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Real-time telemetry across the 12 core community KPIs: from builder acquisition and
              repeat attendance to geographic coverage, financial health, and leadership
              progression.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={downloadCsvReport}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="text-primary h-4 w-4" />
              <span>Export CSV Report</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-border mt-8 flex flex-wrap gap-2 border-t pt-6">
          <button
            onClick={() => setActiveTab("EXECUTIVE")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === "EXECUTIVE"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>12 Core Success Metrics ()</span>
          </button>

          <button
            onClick={() => setActiveTab("AUDIENCE")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === "AUDIENCE"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Audience, MAU & Retention</span>
          </button>

          <button
            onClick={() => setActiveTab("LEADERSHIP")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === "LEADERSHIP"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>State & Campus Expansion</span>
          </button>

          <button
            onClick={() => setActiveTab("COMMERCIAL")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === "COMMERCIAL"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Commercial & P&L Health</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: EXECUTIVE 12 SUCCESS METRICS SCORECARD ─────────────────── */}
      {activeTab === "EXECUTIVE" && (
        <div className="space-y-6">
          {/* North Star Health Gauge */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
            <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-6">
              <span className="text-muted-foreground font-mono text-xs font-bold tracking-wider uppercase">
                Community Health Index
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-foreground text-5xl font-black tracking-tight">
                  {metrics.summary.communityHealthScore}
                </span>
                <span className="text-primary text-sm font-bold">/ 100</span>
              </div>
              <p className="text-muted-foreground mt-3 text-xs">
                Composite diagnostic evaluating retention, conversion, regional reach, and
                leadership progression.
              </p>
            </div>

            <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
              <span className="text-muted-foreground font-mono text-xs font-bold tracking-wider uppercase">
                1. Monthly Active Builders (MAU)
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-foreground text-3xl font-black">
                  {metrics.mau.current30d.toLocaleString()}
                </span>
                <span className="text-success text-xs font-bold">
                  {metrics.mau.growthPct >= 0
                    ? `+${metrics.mau.growthPct}%`
                    : `${metrics.mau.growthPct}%`}{" "}
                  MoM
                </span>
              </div>
              <p className="text-muted-foreground mt-3 text-xs">
                Avg ~{metrics.mau.dailyEngagementAvg} daily active builder touchpoints.
              </p>
            </div>

            <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
              <span className="text-muted-foreground font-mono text-xs font-bold tracking-wider uppercase">
                4. Repeat Attendee Rate
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-foreground text-3xl font-black">
                  {metrics.repeatAttendees.repeatAttendanceRate}%
                </span>
                <span className="text-primary text-xs font-bold">
                  ({metrics.repeatAttendees.repeatAttendeesCount} builders)
                </span>
              </div>
              <p className="text-muted-foreground mt-3 text-xs">
                {metrics.repeatAttendees.loyaltyTiers.fourPlus} super-builders with &ge; 4 events.
              </p>
            </div>

            <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
              <span className="text-muted-foreground font-mono text-xs font-bold tracking-wider uppercase">
                12. Role Progression Rate ()
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-foreground text-3xl font-black">
                  {metrics.roleProgression.progressionRatePct}%
                </span>
                <span className="text-primary text-xs font-bold">
                  ({metrics.roleProgression.attendeesWithCommunityRole} leaders)
                </span>
              </div>
              <p className="text-muted-foreground mt-3 text-xs">
                Attendees progressing to campus, state, mentor, or chapter leadership.
              </p>
            </div>
          </div>

          {/* 12 Metric Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Metric 2: Registrations */}
            <div className="border-border bg-card rounded-2xl border p-5">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span className="font-bold">2. Event Registrations</span>
                <Calendar className="text-primary h-4 w-4" />
              </div>
              <p className="text-foreground mt-2 text-2xl font-bold">
                {metrics.registrations.totalLifetime.toLocaleString()}
              </p>
              <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                <span>Last 30 Days:</span>
                <strong className="text-success font-bold">
                  +{metrics.registrations.last30Days}
                </strong>
              </div>
              <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                <span>Confirmed Attendees:</span>
                <span className="text-foreground font-medium">
                  {metrics.registrations.totalConfirmed}
                </span>
              </div>
            </div>

            {/* Metric 3: Paid Conversion */}
            <div className="border-border bg-card rounded-2xl border p-5">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span className="font-bold">3. Paid Ticket Conversion</span>
                <Percent className="text-success h-4 w-4" />
              </div>
              <p className="text-foreground mt-2 text-2xl font-bold">
                {metrics.paidConversion.conversionRate}%
              </p>
              <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                <span>Paid Passes Sold:</span>
                <span className="text-foreground font-medium">
                  {metrics.paidConversion.paidTickets} / {metrics.paidConversion.totalTickets}
                </span>
              </div>
              <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                <span>Total Ticket Revenue:</span>
                <strong className="text-success font-bold">
                  ₹{metrics.paidConversion.totalCapturedRevenue.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            {/* Metric 5: Workshop & Talk Participation */}
            <div className="border-border bg-card rounded-2xl border p-5">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span className="font-bold">5. Workshop & Talk Attendance</span>
                <Activity className="text-primary h-4 w-4" />
              </div>
              <p className="text-foreground mt-2 text-2xl font-bold">
                {metrics.workshopTalkParticipation.combinedAttendees.toLocaleString()}
              </p>
              <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                <span>Workshops: {metrics.workshopTalkParticipation.totalWorkshops}</span>
                <span>Tech Talks: {metrics.workshopTalkParticipation.totalTechTalks}</span>
              </div>
              <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                <span>Average Attendance:</span>
                <span className="text-foreground font-medium">
                  ~{metrics.workshopTalkParticipation.avgAttendeesPerSession} / session
                </span>
              </div>
            </div>

            {/* Metric 6: Campus Lead Activation */}
            <div className="border-border bg-card rounded-2xl border p-5">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span className="font-bold">6. Campus Lead Activation</span>
                <Building2 className="text-primary h-4 w-4" />
              </div>
              <p className="text-foreground mt-2 text-2xl font-bold">
                {metrics.leadApplications.campus.activationRate}%
              </p>
              <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                <span>Active Leads:</span>
                <strong className="text-success font-bold">
                  {metrics.leadApplications.campus.active} active
                </strong>
              </div>
              <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                <span>Colleges Represented:</span>
                <span className="text-foreground font-medium">
                  {metrics.leadApplications.campus.uniqueColleges} colleges
                </span>
              </div>
            </div>

            {/* Metric 7: State Lead Coverage */}
            <div className="border-border bg-card rounded-2xl border p-5">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span className="font-bold">7. State Lead Coverage</span>
                <MapPin className="text-destructive h-4 w-4" />
              </div>
              <p className="text-foreground mt-2 text-2xl font-bold">
                {metrics.stateCoverage.coveragePct}%
              </p>
              <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                <span>Covered Territories:</span>
                <strong className="text-foreground font-bold">
                  {metrics.stateCoverage.coveredCount} / {metrics.stateCoverage.totalStatesAndUTs}{" "}
                  States & UTs
                </strong>
              </div>
              <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                <span>Active State Executives:</span>
                <span className="text-foreground font-medium">
                  {metrics.leadApplications.state.active} leads
                </span>
              </div>
            </div>

            {/* Metric 8: Collaboration Leads */}
            <div className="border-border bg-card rounded-2xl border p-5">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span className="font-bold">8. Inbound Collaboration Leads</span>
                <Users className="text-primary h-4 w-4" />
              </div>
              <p className="text-foreground mt-2 text-2xl font-bold">
                {metrics.collaborationLeads.conversionRate}%
              </p>
              <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                <span>Total Inbound Leads:</span>
                <span className="text-foreground font-medium">
                  {metrics.collaborationLeads.total}
                </span>
              </div>
              <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                <span>Confirmed / Won:</span>
                <strong className="text-success font-bold">
                  {metrics.collaborationLeads.wonCount} partnerships
                </strong>
              </div>
            </div>

            {/* Metric 9: Sponsor Deal Conversion */}
            <div className="border-border bg-card rounded-2xl border p-5">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span className="font-bold">9. Sponsor Conversion</span>
                <DollarSign className="text-success h-4 w-4" />
              </div>
              <p className="text-foreground mt-2 text-2xl font-bold">
                {metrics.sponsorConversion.conversionRate}%
              </p>
              <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                <span>Deals Won:</span>
                <strong className="text-foreground font-medium">
                  {metrics.sponsorConversion.wonDeals} / {metrics.sponsorConversion.totalDeals}
                </strong>
              </div>
              <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                <span>Closed Sponsor Revenue:</span>
                <strong className="text-success font-bold">
                  ₹{metrics.sponsorConversion.closedWonValue.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            {/* Metric 10: Event Profitability */}
            <div className="border-border bg-card rounded-2xl border p-5">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span className="font-bold">10. Event P&L Profit Margin</span>
                <TrendingUp className="text-success h-4 w-4" />
              </div>
              <p
                className={`mt-2 text-2xl font-bold ${metrics.profitability.profitMarginPct >= 0 ? "text-success" : "text-destructive"}`}
              >
                {metrics.profitability.profitMarginPct}%
              </p>
              <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                <span>Net P&L:</span>
                <strong
                  className={`font-bold ${metrics.profitability.netProfit >= 0 ? "text-success" : "text-destructive"}`}
                >
                  ₹{metrics.profitability.netProfit.toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                <span>Profitable Events Ratio:</span>
                <span className="text-foreground font-medium">
                  {metrics.profitability.profitableEventsRatio}%
                </span>
              </div>
            </div>

            {/* Metric 11: Certificate Delivery Rate */}
            <div className="border-border bg-card rounded-2xl border p-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground font-bold">11. Certificate Delivery Rate</span>
                <Award className="text-primary h-4 w-4" />
              </div>
              <p className="text-foreground mt-2 text-2xl font-bold">
                {metrics.certificates.deliveryRatePct}%
              </p>
              <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                <span className="text-foreground">Certificates Generated:</span>
                <span className="text-foreground font-medium">
                  {metrics.certificates.totalIssued}
                </span>
              </div>
              <div className="text-muted-foreground mt-1 flex justify-between text-xs">
                <span className="text-foreground">Claimed / Verified:</span>
                <strong className="text-success font-bold">
                  {metrics.certificates.totalClaimedOrVerified} verified
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: AUDIENCE, MAU & RETENTION ──────────────────────────────── */}
      {activeTab === "AUDIENCE" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Format Breakdown */}
            <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
              <h2 className="text-foreground flex items-center gap-2 text-lg font-bold">
                <Calendar className="text-primary h-5 w-5" />
                Registrations by Event Format
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Breakdown across KailshiansX community properties.
              </p>

              <div className="mt-6 space-y-3">
                {Object.entries(metrics.registrations.byFormat).map(([format, count]) => {
                  const pct =
                    metrics.registrations.totalLifetime > 0
                      ? Math.round((count / metrics.registrations.totalLifetime) * 100)
                      : 0;
                  return (
                    <div key={format} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground font-bold">{format}</span>
                        <span className="text-muted-foreground">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="bg-background h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Repeat Attendee Cohorts */}
            <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
              <h2 className="text-foreground flex items-center gap-2 text-lg font-bold">
                <Users className="text-primary h-5 w-5" />
                Builder Loyalty Cohorts
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Multi-event retention and builder progression.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="border-border bg-background rounded-2xl border p-4 text-center">
                  <span className="text-muted-foreground text-xs">1 Event</span>
                  <p className="text-foreground mt-1 text-2xl font-bold">
                    {metrics.repeatAttendees.loyaltyTiers.singleEvent}
                  </p>
                  <span className="text-muted-foreground text-xs">First-Time Attendees</span>
                </div>

                <div className="border-primary/30 bg-primary/5 rounded-2xl border p-4 text-center">
                  <span className="text-primary text-xs">2-3 Events</span>
                  <p className="text-primary mt-1 text-2xl font-bold">
                    {metrics.repeatAttendees.loyaltyTiers.twoToThree}
                  </p>
                  <span className="text-primary/80 text-xs">Active Builders</span>
                </div>

                <div className="border-primary/30 bg-primary/5 rounded-2xl border p-4 text-center">
                  <span className="text-primary text-xs">4+ Events</span>
                  <p className="text-primary mt-1 text-2xl font-bold">
                    {metrics.repeatAttendees.loyaltyTiers.fourPlus}
                  </p>
                  <span className="text-primary/80 text-xs">Super-Builders</span>
                </div>
              </div>

              <div className="border-border bg-background text-muted-foreground mt-6 space-y-1 rounded-2xl border p-4 text-xs">
                <div className="flex justify-between">
                  <span>Total Unique Attendees:</span>
                  <strong className="text-foreground">
                    {metrics.repeatAttendees.uniqueAttendees}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Overall Repeat Rate:</span>
                  <strong className="text-success">
                    {metrics.repeatAttendees.repeatAttendanceRate}%
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: STATE & CAMPUS EXPANSION ───────────────────────────────── */}
      {activeTab === "LEADERSHIP" && (
        <div className="space-y-6">
          <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <MapPin className="text-destructive h-5 w-5" />
                  State Lead Territorial Coverage ({metrics.stateCoverage.coveredCount}/36)
                </h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  Active expansion across all 28 Indian States & 8 Union Territories per .
                </p>
              </div>
              <div className="text-right">
                <span className="text-success text-2xl font-black">
                  {metrics.stateCoverage.coveragePct}%
                </span>
                <span className="text-muted-foreground block text-xs">Coverage Ratio</span>
              </div>
            </div>

            {/* Covered States Grid */}
            <div className="mt-6">
              <span className="text-muted-foreground mb-3 block font-mono text-xs font-bold tracking-wider uppercase">
                Covered Regions with Active State Leads:
              </span>
              <div className="flex flex-wrap gap-2">
                {metrics.stateCoverage.coveredStates.map((st) => (
                  <span
                    key={st}
                    className="border-success/30 bg-success/10 text-success inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {st}
                  </span>
                ))}
              </div>
            </div>

            {/* Priority Uncovered States */}
            <div className="border-border mt-6 border-t pt-6">
              <span className="text-primary mb-3 block font-mono text-xs font-bold tracking-wider uppercase">
                Priority Regions for Next Outreach:
              </span>
              <div className="flex flex-wrap gap-2">
                {metrics.stateCoverage.priorityUncoveredStates.map((st) => (
                  <span
                    key={st}
                    className="border-border bg-background text-muted-foreground inline-flex items-center gap-1 rounded-xl border px-3 py-1 text-xs font-medium"
                  >
                    {st}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Campus Lead Stats */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="border-border bg-card rounded-2xl border p-5">
              <span className="text-muted-foreground text-xs font-bold uppercase">
                Campus Applications
              </span>
              <p className="text-foreground mt-2 text-2xl font-bold">
                {metrics.leadApplications.campus.totalApplications}
              </p>
              <span className="text-muted-foreground mt-1 block text-xs">
                Inbound student dossiers
              </span>
            </div>

            <div className="border-border bg-card rounded-2xl border p-5">
              <span className="text-muted-foreground text-xs font-bold uppercase">
                Active Campus Leads
              </span>
              <p className="text-success mt-2 text-2xl font-bold">
                {metrics.leadApplications.campus.active}
              </p>
              <span className="text-muted-foreground mt-1 block text-xs">
                {metrics.leadApplications.campus.activationRate}% activation from selected
              </span>
            </div>

            <div className="border-border bg-card rounded-2xl border p-5">
              <span className="text-muted-foreground text-xs font-bold uppercase">
                Collegiate Presence
              </span>
              <p className="text-primary mt-2 text-2xl font-bold">
                {metrics.leadApplications.campus.uniqueColleges}
              </p>
              <span className="text-muted-foreground mt-1 block text-xs">
                Campuses represented across India
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: COMMERCIAL & P&L HEALTH ─────────────────────────────────── */}
      {activeTab === "COMMERCIAL" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* P&L Statement Rollup */}
            <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
              <h2 className="text-foreground flex items-center gap-2 text-lg font-bold">
                <DollarSign className="text-success h-5 w-5" />
                Event P&L Financial Rollup ()
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Combined ticket gate + corporate sponsor revenue.
              </p>

              <div className="mt-6 space-y-3">
                <div className="bg-background flex justify-between rounded-xl p-3 text-xs">
                  <span className="text-muted-foreground">Paid Ticket Sales:</span>
                  <span className="text-foreground font-bold">
                    ₹{metrics.profitability.ticketRevenue.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="bg-background flex justify-between rounded-xl p-3 text-xs">
                  <span className="text-muted-foreground">Sponsor Invoices (Paid):</span>
                  <span className="text-foreground font-bold">
                    ₹{metrics.profitability.sponsorRevenue.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="bg-background flex justify-between rounded-xl p-3 text-xs">
                  <span className="text-muted-foreground">Total Expenses:</span>
                  <span className="text-destructive font-bold">
                    ₹{metrics.profitability.totalExpenses.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="border-primary/30 bg-primary/10 flex justify-between rounded-xl border p-3 text-xs font-bold">
                  <span className="text-primary">Net Community P&L:</span>
                  <span
                    className={
                      metrics.profitability.netProfit >= 0 ? "text-success" : "text-destructive"
                    }
                  >
                    ₹{metrics.profitability.netProfit.toLocaleString("en-IN")} (
                    {metrics.profitability.profitMarginPct}% Margin)
                  </span>
                </div>
              </div>
            </div>

            {/* Sponsor Pipeline */}
            <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
              <h2 className="text-foreground flex items-center gap-2 text-lg font-bold">
                <TrendingUp className="text-primary h-5 w-5" />
                Sponsor Pipeline & Conversions
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Contract value and brand conversion rate.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="border-border bg-background rounded-2xl border p-4">
                  <span className="text-muted-foreground text-xs">Total Pipeline Value</span>
                  <p className="text-foreground mt-1 text-xl font-bold">
                    ₹{metrics.sponsorConversion.totalPipelineValue.toLocaleString("en-IN")}
                  </p>
                  <span className="text-muted-foreground text-xs">
                    {metrics.sponsorConversion.totalDeals} total deals
                  </span>
                </div>

                <div className="border-success/30 bg-success/5 rounded-2xl border p-4">
                  <span className="text-success text-xs">Closed Won Revenue</span>
                  <p className="text-success mt-1 text-xl font-bold">
                    ₹{metrics.sponsorConversion.closedWonValue.toLocaleString("en-IN")}
                  </p>
                  <span className="text-success/80 text-xs">
                    {metrics.sponsorConversion.conversionRate}% conversion rate
                  </span>
                </div>
              </div>

              {/* Collaboration Leads */}
              <div className="border-border text-muted-foreground mt-6 space-y-2 border-t pt-4 text-xs">
                <span className="text-foreground block font-bold">
                  Collaboration Leads Pipeline:
                </span>
                <div className="flex justify-between">
                  <span>Inbound Leads: {metrics.collaborationLeads.total}</span>
                  <span>
                    Won / Confirmed:{" "}
                    <strong className="text-success">{metrics.collaborationLeads.wonCount}</strong>
                  </span>
                  <span>
                    Win Rate:{" "}
                    <strong className="text-primary">
                      {metrics.collaborationLeads.conversionRate}%
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
