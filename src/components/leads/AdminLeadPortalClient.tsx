"use client";

// src/components/leads/AdminLeadPortalClient.tsx
// Admin Lead Portal: Allows admins to select and inspect any Campus or State Lead's scope.

import * as React from "react";
import Link from "next/link";
import { GraduationCap, MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  campusLeads: Array<{
    id: string;
    name: string;
    college: string;
    city: string;
    state: string;
    referrals: number;
    performanceScore: number;
    status: string;
  }>;
  stateLeads: Array<{
    id: string;
    name: string;
    state: string;
    referrals: number;
    performanceScore: number;
    status: string;
  }>;
}

export function AdminLeadPortalClient({ campusLeads, stateLeads }: Props) {
  const [leadMode, setLeadMode] = React.useState<"CAMPUS" | "STATE">("CAMPUS");

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Admin Scope Header */}
      <div className="bg-surface-900/80 border-surface-800 flex flex-col justify-between gap-6 rounded-3xl border p-6 shadow-xl backdrop-blur-md sm:p-8 md:flex-row md:items-center">
        <div>
          <div className="bg-brand-500/10 border-brand-500/20 text-brand-400 mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>PRD §11 & §12 · Leadership Control Room</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Campus & State Lead Intelligence Hub
          </h1>
          <p className="text-surface-400 mt-1 max-w-2xl text-xs sm:text-sm">
            Inspect role-gated scopes, referrals generated, events supported, activities logged, and
            monthly reports submitted across all regional leaders.
          </p>
        </div>

        {/* Lead Mode Switcher */}
        <div className="bg-surface-950 border-surface-800 flex items-center gap-1.5 self-start rounded-2xl border p-1.5 md:self-auto">
          <button
            id="btn-admin-campus-mode"
            onClick={() => setLeadMode("CAMPUS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              leadMode === "CAMPUS"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-surface-400 hover:text-white"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Campus Leads ({campusLeads.length})</span>
          </button>
          <button
            id="btn-admin-state-mode"
            onClick={() => setLeadMode("STATE")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              leadMode === "STATE"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "text-surface-400 hover:text-white"
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>State Leads ({stateLeads.length})</span>
          </button>
        </div>
      </div>

      {/* ─── CAMPUS LEADS GRID ────────────────────────────────────────────── */}
      {leadMode === "CAMPUS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-surface-400 text-sm font-bold tracking-wider uppercase">
              Active Campus Chapters
            </h3>
            <span className="text-surface-400 text-xs">
              Select a chapter to inspect its full activity log & score
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campusLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-surface-900/80 border-surface-800 hover:border-surface-700 flex flex-col justify-between space-y-4 rounded-2xl border p-5 shadow-sm transition-all"
              >
                <div>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-400 uppercase">
                      {lead.city}, {lead.state}
                    </span>
                    <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400">
                      Score: {lead.performanceScore}/100
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white">{lead.name}</h4>
                  <div className="text-surface-300 mt-0.5 text-xs font-medium">{lead.college}</div>
                </div>

                <div className="border-surface-800/80 flex items-center justify-between border-t pt-3">
                  <div className="text-surface-400 text-xs">
                    <strong className="font-mono text-white">{lead.referrals}</strong> referrals
                  </div>
                  <Link href={`/lead/campus?leadId=${lead.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <span>Inspect Scope</span>
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── STATE LEADS GRID ─────────────────────────────────────────────── */}
      {leadMode === "STATE" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-surface-400 text-sm font-bold tracking-wider uppercase">
              Active State Chapters
            </h3>
            <span className="text-surface-400 text-xs">
              Select a state to inspect statewide chapter roster & activities
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stateLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-surface-900/80 border-surface-800 hover:border-surface-700 flex flex-col justify-between space-y-4 rounded-2xl border p-5 shadow-sm transition-all"
              >
                <div>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-purple-400 uppercase">
                      State Jurisdiction
                    </span>
                    <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400">
                      Score: {lead.performanceScore}/100
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white">{lead.name}</h4>
                  <div className="mt-0.5 text-xs font-semibold text-purple-300">
                    State of {lead.state}
                  </div>
                </div>

                <div className="border-surface-800/80 flex items-center justify-between border-t pt-3">
                  <div className="text-surface-400 text-xs">
                    <strong className="font-mono text-white">{lead.referrals}</strong> statewide
                    referrals
                  </div>
                  <Link href={`/lead/state?leadId=${lead.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <span>Inspect Scope</span>
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
