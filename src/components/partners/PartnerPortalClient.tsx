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
    <div className="min-h-screen bg-[#07090e] pb-24 text-white">
      {/* Executive Header Banner */}
      <section className="border-surface-800 via-surface-950 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b from-purple-950/20 py-12 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.15),rgba(255,255,255,0))]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold tracking-wider text-purple-400 uppercase">
                  Executive Partner Portal (PRD §22 &amp; §28)
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                  Access Code: {partner.portalAccessCode}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
                {partner.name}
              </h1>

              <p className="text-surface-300 mt-2 max-w-2xl text-xs sm:text-sm">
                Real-time dashboard for deliverables fulfillment, audience reach telemetry,
                high-resolution branding assets, and post-event ROI impact reports.
              </p>
            </div>

            {partner.website && (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="border-surface-700 bg-surface-900/80 hover:bg-surface-800 inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold text-white transition-colors"
              >
                <span>Visit {partner.name}</span>
                <ExternalLink className="text-surface-400 h-4 w-4" />
              </a>
            )}
          </div>

          {/* KPI Summary Cards */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5 backdrop-blur-md">
              <span className="text-surface-400 text-xs font-bold uppercase">
                Deliverables Fulfillment
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  {aggregates.deliverableFulfillmentRate}%
                </span>
                <span className="text-surface-400 text-xs font-bold">
                  ({aggregates.fulfilledDeliverablesCount}/{aggregates.allDeliverablesCount})
                </span>
              </div>
              <div className="bg-surface-800 mt-2 h-1.5 rounded-full">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${aggregates.deliverableFulfillmentRate}%` }}
                />
              </div>
            </div>

            <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5 backdrop-blur-md">
              <span className="text-surface-400 text-xs font-bold uppercase">Audience Reach</span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  {aggregates.totalAttendeesReached.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-400">verified builders</span>
              </div>
              <p className="text-surface-500 mt-1 text-[11px]">Confirmed attendees across events</p>
            </div>

            <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5 backdrop-blur-md">
              <span className="text-surface-400 text-xs font-bold uppercase">
                Brand Impressions
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-400">
                  {aggregates.totalImpressions.toLocaleString()}+
                </span>
              </div>
              <p className="text-surface-500 mt-1 text-[11px]">
                Stage, banners, and digital portal reach
              </p>
            </div>

            <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5 backdrop-blur-md">
              <span className="text-surface-400 text-xs font-bold uppercase">Sponsorship Tier</span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-400">
                  {primaryDeal?.tier || "PLATINUM"}
                </span>
              </div>
              <p className="text-surface-500 mt-1 text-[11px]">Active Partnership Contract</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-surface-800/80 mt-10 flex gap-2 border-b">
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
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        {/* TAB 1: DELIVERABLES TRACKER */}
        {activeTab === "deliverables" && (
          <div className="space-y-8">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="border-surface-800 bg-surface-900/60 rounded-3xl border p-6 shadow-xl backdrop-blur-md"
              >
                <div className="border-surface-800 flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-300">
                        {deal.tier}
                      </span>
                      <h3 className="text-xl font-bold text-white">{deal.title}</h3>
                    </div>
                    {deal.event && (
                      <p className="text-surface-400 mt-1 text-xs">
                        Linked Event: <strong>{deal.event.title}</strong> ({deal.event.cityName})
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400">
                      {deal.deliverablesProgress.fulfilled} / {deal.deliverablesProgress.total}{" "}
                      Complete
                    </span>
                    <div className="bg-surface-800 mt-1 h-2 w-32 rounded-full">
                      <div
                        className="h-full rounded-full bg-emerald-500"
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
                      className="border-surface-800/80 bg-surface-950/60 hover:border-surface-700 flex flex-col justify-between gap-4 rounded-2xl border p-4 transition-all sm:flex-row sm:items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              d.status === "FULFILLED"
                                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                : d.status === "IN_PROGRESS"
                                  ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                                  : "bg-surface-800 text-surface-400"
                            }`}
                          >
                            {d.status}
                          </span>
                          <h4 className="text-sm font-bold text-white">{d.title}</h4>
                        </div>
                        {d.description && (
                          <p className="text-surface-400 text-xs">{d.description}</p>
                        )}
                        {d.fulfilledAt && (
                          <p className="text-surface-500 text-[11px]">
                            Verified on {new Date(d.fulfilledAt).toLocaleDateString("en-IN")}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        {d.proofUrl ? (
                          <button
                            onClick={() => setSelectedProofUrl(d.proofUrl)}
                            className="border-surface-700 bg-surface-900 hover:bg-surface-800 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold text-purple-300 transition-colors hover:text-white"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Proof
                          </button>
                        ) : (
                          <span className="text-surface-500 text-xs">Proof pending</span>
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
            <div className="border-surface-800 bg-surface-900/60 rounded-3xl border p-8 backdrop-blur-md">
              <h3 className="text-xl font-bold text-white">
                Audience Reach &amp; Developer Demographics
              </h3>
              <p className="text-surface-400 mt-1 text-xs sm:text-sm">
                Telemetry captured across registrations, check-in gates, and hackathon builder
                teams.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="border-surface-800 bg-surface-950/60 rounded-2xl border p-5">
                  <span className="text-surface-400 text-xs font-bold uppercase">
                    Audience Composition
                  </span>
                  <div className="mt-4 space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold">
                        <span className="text-white">Undergraduate / College Builders</span>
                        <span className="text-purple-400">58%</span>
                      </div>
                      <div className="bg-surface-800 mt-1.5 h-2 rounded-full">
                        <div
                          className="h-full rounded-full bg-purple-500"
                          style={{ width: "58%" }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold">
                        <span className="text-white">Working Software Engineers</span>
                        <span className="text-pink-400">32%</span>
                      </div>
                      <div className="bg-surface-800 mt-1.5 h-2 rounded-full">
                        <div className="h-full rounded-full bg-pink-500" style={{ width: "32%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold">
                        <span className="text-white">Startup Founders &amp; Architects</span>
                        <span className="text-emerald-400">10%</span>
                      </div>
                      <div className="bg-surface-800 mt-1.5 h-2 rounded-full">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: "10%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-surface-800 bg-surface-950/60 rounded-2xl border p-5">
                  <span className="text-surface-400 text-xs font-bold uppercase">
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
                        className="border-surface-800 bg-surface-900 text-surface-200 rounded-lg border px-2.5 py-1 text-xs font-medium"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                  <p className="text-surface-500 mt-4 text-[11px]">
                    Based on verified project submission repositories.
                  </p>
                </div>

                <div className="border-surface-800 bg-surface-950/60 rounded-2xl border p-5">
                  <span className="text-surface-400 text-xs font-bold uppercase">
                    Sponsor Track Engagement
                  </span>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-surface-400">Booth Visitors:</span>
                      <span className="font-bold text-white">310+ builders</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-400">Track Submissions:</span>
                      <span className="font-bold text-purple-400">145 teams</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-400">Digital CTR:</span>
                      <span className="font-bold text-emerald-400">4.8% Click-Through</span>
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
                <div
                  key={rep.id}
                  className="border-surface-800 bg-surface-900/60 space-y-6 rounded-3xl border p-8 shadow-xl backdrop-blur-md"
                >
                  <div className="border-surface-800 flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-center">
                    <div>
                      <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-0.5 text-xs font-bold text-purple-300">
                        Official Executive Report
                      </span>
                      <h3 className="mt-2 text-2xl font-black text-white">{rep.title}</h3>
                      <p className="text-surface-400 mt-1 text-xs">
                        Published on {new Date(rep.publishedAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    {rep.recapDeckUrl && (
                      <a
                        href={rep.recapDeckUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-purple-500"
                      >
                        <Download className="h-4 w-4" />
                        Download Executive Deck (PDF)
                      </a>
                    )}
                  </div>

                  {/* Executive Summary */}
                  <div className="border-surface-800 bg-surface-950/60 rounded-2xl border p-5">
                    <h4 className="text-surface-400 text-xs font-bold tracking-wider uppercase">
                      Executive Summary
                    </h4>
                    <p className="text-surface-300 mt-2 text-xs leading-relaxed whitespace-pre-line sm:text-sm">
                      {rep.executiveSummary}
                    </p>
                  </div>

                  {/* Report Key Stats */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="border-surface-800 bg-surface-950/40 rounded-2xl border p-4">
                      <span className="text-surface-500 text-xs">Total Impressions</span>
                      <div className="mt-1 text-xl font-black text-white">
                        {rep.totalImpressions.toLocaleString()}+
                      </div>
                    </div>
                    <div className="border-surface-800 bg-surface-950/40 rounded-2xl border p-4">
                      <span className="text-surface-500 text-xs">Verified Turnout</span>
                      <div className="mt-1 text-xl font-black text-white">
                        {rep.totalAttendees.toLocaleString()} builders
                      </div>
                    </div>
                    <div className="border-surface-800 bg-surface-950/40 rounded-2xl border p-4">
                      <span className="text-surface-500 text-xs">Booth Footfall</span>
                      <div className="mt-1 text-xl font-black text-emerald-400">
                        {rep.boothFootfall}+ visitors
                      </div>
                    </div>
                    <div className="border-surface-800 bg-surface-950/40 rounded-2xl border p-4">
                      <span className="text-surface-500 text-xs">Attendee NPS</span>
                      <div className="mt-1 text-xl font-black text-amber-400">
                        {rep.npsScore} / 10
                      </div>
                    </div>
                  </div>

                  {/* High-res Media Gallery */}
                  {rep.mediaGalleryUrls && rep.mediaGalleryUrls.length > 0 && (
                    <div>
                      <h4 className="text-surface-400 mb-3 text-xs font-bold tracking-wider uppercase">
                        High-Resolution Branding &amp; Stage Captures
                      </h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {rep.mediaGalleryUrls.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedProofUrl(url)}
                            className="group border-surface-800 bg-surface-950 relative aspect-video cursor-pointer overflow-hidden rounded-2xl border transition-colors hover:border-purple-500"
                          >
                            <img
                              src={url}
                              alt={`Event Photo ${idx + 1}`}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-white">
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
              <div className="border-surface-800 text-surface-400 rounded-3xl border border-dashed py-16 text-center text-sm">
                Official post-event impact report is currently being compiled by the organizing
                committee.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: INVOICES & BILLING */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            <div className="border-surface-800 bg-surface-900/60 rounded-3xl border p-6 backdrop-blur-md">
              <h3 className="text-xl font-bold text-white">
                Sponsorship Invoices &amp; Contract Receipts
              </h3>
              <p className="text-surface-400 mt-1 text-xs">
                Official GST-compliant invoice documentation with transaction reference numbers.
              </p>

              <div className="border-surface-800 mt-6 overflow-hidden rounded-2xl border">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-surface-800 bg-surface-950 text-surface-400 border-b text-xs tracking-wider uppercase">
                    <tr>
                      <th className="px-6 py-4">Invoice #</th>
                      <th className="px-6 py-4">Issue Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Transaction Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-surface-800/60 divide-y">
                    {deals
                      .flatMap((d) => d.invoices)
                      .map((inv) => (
                        <tr key={inv.id} className="hover:bg-surface-800/20">
                          <td className="px-6 py-4 font-bold text-white">{inv.invoiceNumber}</td>
                          <td className="text-surface-400 px-6 py-4">
                            {new Date(inv.issueDate).toLocaleDateString("en-IN")}
                          </td>
                          <td className="px-6 py-4 font-black text-white">
                            ₹{inv.totalAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                inv.status === "PAID"
                                  ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                  : "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="text-surface-400 px-6 py-4 font-mono text-xs">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="border-surface-800 bg-surface-950 relative w-full max-w-4xl overflow-hidden rounded-2xl border">
            <div className="border-surface-800 flex items-center justify-between border-b p-4">
              <h4 className="text-sm font-bold text-white">Proof of Deliverable Fulfillment</h4>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="text-surface-400 text-xs font-bold hover:text-white"
              >
                Close (ESC)
              </button>
            </div>
            <div className="flex max-h-[75vh] items-center justify-center p-4">
              <img
                src={selectedProofUrl}
                alt="Proof"
                className="max-h-[70vh] w-auto rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
