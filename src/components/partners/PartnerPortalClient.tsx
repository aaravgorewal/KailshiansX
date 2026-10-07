/* eslint-disable @next/next/no-img-element */
// src/components/partners/PartnerPortalClient.tsx
"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Download,
  Eye,
  FileText,
  DollarSign,
  BarChart3,
} from "lucide-react";

interface PartnerPayload {
  partner: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    website: string | null;
    category: string | null;
    portalAccessCode: string | null;
    contactPerson: string | null;
    contactEmail: string | null;
  };
  aggregates: {
    totalDealsCount: number;
    totalCommittedValue: number;
    allDeliverablesCount: number;
    fulfilledDeliverablesCount: number;
    deliverableFulfillmentRate: number;
    totalImpressions: number;
    totalAttendeesReached: number;
  };
  deals: Array<{
    id: string;
    title: string;
    tier: string;
    stage: string;
    amount: number;
    currency: string;
    notes: string | null;
    event: {
      id: string;
      title: string;
      slug: string;
      venue: string | null;
      cityName: string;
      startDate: string;
      coverImage: string | null;
      registrationsCount: number;
    } | null;
    deliverablesProgress: {
      total: number;
      fulfilled: number;
      percentage: number;
    };
    deliverables: Array<{
      id: string;
      title: string;
      description: string | null;
      status: string;
      dueDate: string | null;
      fulfilledAt: string | null;
      proofUrl: string | null;
      assignee: string | null;
    }>;
    invoices: Array<{
      id: string;
      invoiceNumber: string;
      amount: number;
      taxAmount: number;
      totalAmount: number;
      status: string;
      issueDate: string;
      dueDate: string | null;
      paidAt: string | null;
      transactionRef: string | null;
    }>;
    reports: Array<{
      id: string;
      title: string;
      executiveSummary: string;
      totalImpressions: number;
      totalAttendees: number;
      boothFootfall: number;
      trackParticipants: number;
      clickThroughRate: number;
      leadCapturesCount: number;
      mediaGalleryUrls: string[];
      recapDeckUrl: string | null;
      npsScore: number;
      publishedAt: string;
    }>;
  }>;
}

export function PartnerPortalClient({ data }: { data: PartnerPayload }) {
  const [activeTab, setActiveTab] = useState<"deliverables" | "reach" | "reports" | "invoices">(
    "deliverables"
  );
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  const { partner, aggregates, deals } = data;
  const primaryDeal = deals[0];

  return (
    <div className="bg-background text-foreground min-h-screen pb-24">
      {/* Executive Header Banner */}
      <section className="border-border bg-card relative overflow-hidden border-b py-12 sm:py-20">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="border-primary/30 bg-primary/10 text-primary rounded-full border px-3.5 py-1 text-xs font-bold tracking-wider uppercase">
                  Executive Partner Portal ()
                </span>
                <span className="border-success/30 bg-success/10 text-success rounded-full border px-3 py-1 text-xs font-bold">
                  Access Code: {partner.portalAccessCode}
                </span>
              </div>

              <h1 className="text-foreground mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                {partner.name}
              </h1>

              <p className="text-muted-foreground mt-2 max-w-2xl text-xs sm:text-sm">
                Real-time dashboard for deliverables fulfillment, audience reach telemetry,
                high-resolution branding assets, and post-event ROI impact reports.
              </p>
            </div>

            {partner.website && (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="border-border bg-card hover:bg-muted text-foreground focus-visible:ring-ring inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-[background-color,opacity] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80"
              >
                <span>Visit {partner.name}</span>
                <ExternalLink className="text-muted-foreground h-4 w-4" />
              </a>
            )}
          </div>

          {/* KPI Summary Cards */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-border bg-card flex h-full flex-col justify-between rounded-xl border p-5">
              <span className="text-muted-foreground text-xs font-semibold uppercase">
                Deliverables Fulfillment
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-foreground text-3xl font-black">
                  {aggregates.deliverableFulfillmentRate}%
                </span>
                <span className="text-muted-foreground text-xs font-bold">
                  ({aggregates.fulfilledDeliverablesCount}/{aggregates.allDeliverablesCount})
                </span>
              </div>
              <div className="bg-muted mt-2 h-1.5 rounded-full">
                <div
                  className="bg-success h-full rounded-full"
                  style={{ width: `${aggregates.deliverableFulfillmentRate}%` }}
                />
              </div>
            </div>

            <div className="border-border bg-card flex h-full flex-col justify-between rounded-xl border p-5">
              <span className="text-muted-foreground text-xs font-semibold uppercase">
                Audience Reach
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-foreground text-3xl font-black">
                  {aggregates.totalAttendeesReached.toLocaleString()}
                </span>
                <span className="text-success text-xs font-bold">verified builders</span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Confirmed attendees across events
              </p>
            </div>

            <div className="border-border bg-card flex h-full flex-col justify-between rounded-xl border p-5">
              <span className="text-muted-foreground text-xs font-semibold uppercase">
                Brand Impressions
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-primary text-3xl font-black">
                  {aggregates.totalImpressions.toLocaleString()}+
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Stage, banners, and digital portal reach
              </p>
            </div>

            <div className="border-border bg-card flex h-full flex-col justify-between rounded-xl border p-5">
              <span className="text-muted-foreground text-xs font-semibold uppercase">
                Sponsorship Tier
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-primary text-2xl font-black">
                  {primaryDeal?.tier || "PLATINUM"}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">Active Partnership Contract</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-border mt-10 flex gap-2 border-b">
            {[
              {
                id: "deliverables",
                label: `Deliverables (${aggregates.allDeliverablesCount})`,
                icon: CheckCircle2,
              },
              { id: "reach", label: "Reach & Demographics", icon: BarChart3 },
              { id: "reports", label: "Event Reports & Media", icon: FileText },
              { id: "invoices", label: "Invoices & Billing", icon: DollarSign },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-partner-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`focus-visible:ring-ring inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-[color,border-color,opacity] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80 sm:text-sm ${
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
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        {/* TAB 1: DELIVERABLES TRACKER */}
        {activeTab === "deliverables" && (
          <div className="space-y-8">
            {deals.map((deal) => (
              <div key={deal.id} className="border-border bg-card rounded-xl border p-6">
                <div className="border-border flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/20 text-primary rounded px-2 py-0.5 text-xs font-bold">
                        {deal.tier}
                      </span>
                      <h3 className="text-foreground text-xl font-bold">{deal.title}</h3>
                    </div>
                    {deal.event && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        Linked Event: <strong>{deal.event.title}</strong> ({deal.event.cityName})
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-success text-xs font-bold">
                      {deal.deliverablesProgress.fulfilled} / {deal.deliverablesProgress.total}{" "}
                      Complete
                    </span>
                    <div className="bg-muted mt-1 h-2 w-32 rounded-full">
                      <div
                        className="bg-success h-full rounded-full"
                        style={{ width: `${deal.deliverablesProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Deliverables List */}
                <div className="mt-6 space-y-4">
                  {deal.deliverables.map((d) => (
                    <div
                      key={d.id}
                      className="border-border bg-background hover:border-muted-foreground flex flex-col justify-between gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              d.status === "FULFILLED"
                                ? "border-success/20 bg-success/10 text-success border"
                                : d.status === "IN_PROGRESS"
                                  ? "border-border bg-primary/10 text-primary border"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {d.status}
                          </span>
                          <h4 className="text-foreground text-sm font-bold">{d.title}</h4>
                        </div>
                        {d.description && (
                          <p className="text-muted-foreground text-xs">{d.description}</p>
                        )}
                        {d.fulfilledAt && (
                          <p className="text-muted-foreground text-xs">
                            Verified on {new Date(d.fulfilledAt).toLocaleDateString("en-IN")}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        {d.proofUrl ? (
                          <button
                            onClick={() => setSelectedProofUrl(d.proofUrl)}
                            className="border-border bg-card hover:bg-muted text-primary hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-[background-color,color,opacity] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Proof
                          </button>
                        ) : (
                          <span className="text-muted-foreground text-xs">Proof pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: AUDIENCE REACH & DEMOGRAPHICS */}
        {activeTab === "reach" && (
          <div className="space-y-8">
            <div className="border-border bg-card rounded-xl border p-6">
              <h3 className="text-foreground text-xl font-bold">
                Audience Reach &amp; Developer Demographics
              </h3>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                Telemetry captured across registrations, check-in gates, and hackathon builder
                teams.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="border-border bg-background rounded-xl border p-5">
                  <span className="text-muted-foreground text-xs font-bold uppercase">
                    Audience Composition
                  </span>
                  <div className="mt-4 space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold">
                        <span className="text-foreground">Undergraduate / College Builders</span>
                        <span className="text-primary">58%</span>
                      </div>
                      <div className="bg-muted mt-1.5 h-2 rounded-full">
                        <div className="bg-primary h-full rounded-full" style={{ width: "58%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold">
                        <span className="text-foreground">Working Software Engineers</span>
                        <span className="text-primary">32%</span>
                      </div>
                      <div className="bg-muted mt-1.5 h-2 rounded-full">
                        <div className="bg-primary h-full rounded-full" style={{ width: "32%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold">
                        <span className="text-foreground">Startup Founders &amp; Architects</span>
                        <span className="text-success">10%</span>
                      </div>
                      <div className="bg-muted mt-1.5 h-2 rounded-full">
                        <div className="bg-success h-full rounded-full" style={{ width: "10%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-border bg-background rounded-xl border p-5">
                  <span className="text-muted-foreground text-xs font-bold uppercase">
                    Top Tech Stack Affinity
                  </span>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      "Next.js",
                      "Python / LLMs",
                      "Go & Kubernetes",
                      "PostgreSQL",
                      "Docker",
                      "Rust",
                    ].map((st) => (
                      <span
                        key={st}
                        className="border-border bg-card text-foreground rounded-lg border px-2.5 py-1 text-xs font-medium"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-4 text-xs">
                    Based on verified project submission repositories.
                  </p>
                </div>

                <div className="border-border bg-background rounded-xl border p-5">
                  <span className="text-muted-foreground text-xs font-bold uppercase">
                    Sponsor Track Engagement
                  </span>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Booth Visitors:</span>
                      <span className="text-foreground font-bold">310+ builders</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Track Submissions:</span>
                      <span className="text-primary font-bold">145 teams</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Digital CTR:</span>
                      <span className="text-success font-bold">4.8% Click-Through</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EVENT REPORTS & MEDIA */}
        {activeTab === "reports" && (
          <div className="space-y-8">
            {deals
              .flatMap((d) => d.reports)
              .map((rep) => (
                <div key={rep.id} className="border-border bg-card space-y-6 rounded-xl border p-6">
                  <div className="border-border flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-center">
                    <div>
                      <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-3 py-0.5 text-xs font-bold">
                        Official Executive Report
                      </span>
                      <h3 className="text-foreground mt-2 text-2xl font-black">{rep.title}</h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Published on {new Date(rep.publishedAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    {rep.recapDeckUrl && (
                      <a
                        href={rep.recapDeckUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-ring inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-[background-color,opacity] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80"
                      >
                        <Download className="h-4 w-4" />
                        Download Executive Deck (PDF)
                      </a>
                    )}
                  </div>

                  {/* Executive Summary */}
                  <div className="border-border bg-background rounded-xl border p-5">
                    <h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                      Executive Summary
                    </h4>
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed whitespace-pre-line sm:text-sm">
                      {rep.executiveSummary}
                    </p>
                  </div>

                  {/* Report Key Stats */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="border-border bg-background rounded-xl border p-4">
                      <span className="text-muted-foreground text-xs">Total Impressions</span>
                      <div className="text-foreground mt-1 text-xl font-black">
                        {rep.totalImpressions.toLocaleString()}+
                      </div>
                    </div>
                    <div className="border-border bg-background rounded-xl border p-4">
                      <span className="text-muted-foreground text-xs">Verified Turnout</span>
                      <div className="text-foreground mt-1 text-xl font-black">
                        {rep.totalAttendees.toLocaleString()} builders
                      </div>
                    </div>
                    <div className="border-border bg-background rounded-xl border p-4">
                      <span className="text-muted-foreground text-xs">Booth Footfall</span>
                      <div className="text-success mt-1 text-xl font-black">
                        {rep.boothFootfall}+ visitors
                      </div>
                    </div>
                    <div className="border-border bg-background rounded-xl border p-4">
                      <span className="text-muted-foreground text-xs">Attendee NPS</span>
                      <div className="text-primary mt-1 text-xl font-black">
                        {rep.npsScore} / 10
                      </div>
                    </div>
                  </div>

                  {/* High-res Media Gallery */}
                  {rep.mediaGalleryUrls && rep.mediaGalleryUrls.length > 0 && (
                    <div>
                      <h4 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
                        High-Resolution Branding &amp; Stage Captures
                      </h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {rep.mediaGalleryUrls.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedProofUrl(url)}
                            className="group border-border bg-background hover:border-primary relative aspect-video cursor-pointer overflow-hidden rounded-xl border transition-colors"
                          >
                            <img
                              src={url}
                              alt={`Event Photo ${idx + 1}`}
                              className="group- h-full w-full object-cover transition-transform"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                                <Eye className="h-4 w-4" /> Expand
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {deals.flatMap((d) => d.reports).length === 0 && (
              <div className="border-border text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
                Official post-event impact report is currently being compiled by the organizing
                committee.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: INVOICES & BILLING */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            <div className="border-border bg-card rounded-xl border p-6">
              <h3 className="text-foreground text-xl font-bold">
                Sponsorship Invoices &amp; Contract Receipts
              </h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Official GST-compliant invoice documentation with transaction reference numbers.
              </p>

              <div className="border-border mt-6 overflow-hidden rounded-xl border">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-border bg-background text-muted-foreground border-b text-xs tracking-wider uppercase">
                    <tr>
                      <th className="px-6 py-4">Invoice #</th>
                      <th className="px-6 py-4">Issue Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Transaction Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {deals
                      .flatMap((d) => d.invoices)
                      .map((inv) => (
                        <tr key={inv.id} className="hover:bg-muted">
                          <td className="text-foreground px-6 py-4 font-bold">
                            {inv.invoiceNumber}
                          </td>
                          <td className="text-muted-foreground px-6 py-4">
                            {new Date(inv.issueDate).toLocaleDateString("en-IN")}
                          </td>
                          <td className="text-foreground px-6 py-4 font-black">
                            ₹{inv.totalAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                inv.status === "PAID"
                                  ? "border-success/20 bg-success/10 text-success border"
                                  : "border-border bg-primary/10 text-primary border"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="text-muted-foreground px-6 py-4 font-mono text-xs">
                            {inv.transactionRef || "Bank Transfer Pending"}
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

      {/* PROOF LIGHTBOX MODAL */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="border-border bg-background relative w-full max-w-4xl overflow-hidden rounded-xl border">
            <div className="border-border flex items-center justify-between border-b p-4">
              <h4 className="text-foreground text-sm font-bold">
                Proof of Deliverable Fulfillment
              </h4>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded text-xs font-bold focus-visible:ring-2 focus-visible:outline-none active:opacity-80"
              >
                Close (ESC)
              </button>
            </div>
            <div className="flex max-h-[75vh] items-center justify-center p-4">
              <img
                src={selectedProofUrl}
                alt="Proof"
                className="max-h-[70vh] w-auto rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
