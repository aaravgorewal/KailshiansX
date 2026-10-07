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
      <div className="bg-card border-border flex flex-col justify-between gap-6 rounded-3xl border p-6 shadow-xl backdrop-blur-md sm:p-8 md:flex-row md:items-center">
        <div>
          <div className="bg-primary/10 border-primary/20 text-primary mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Leadership Control Room</span>
          </div>
          <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
            Campus & State Lead Intelligence Hub
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-xs sm:text-sm">
            Inspect role-gated scopes, referrals generated, events supported, activities logged, and
            monthly reports submitted across all regional leaders.
          </p>
        </div>

        {/* Lead Mode Switcher */}
        <div className="bg-background border-border flex items-center gap-1.5 self-start rounded-2xl border p-1.5 md:self-auto">
          <button
            id="btn-admin-campus-mode"
            onClick={() => setLeadMode("CAMPUS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              leadMode === "CAMPUS"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
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
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
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
            <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
              Active Campus Chapters
            </h3>
            <span className="text-muted-foreground text-xs">
              Select a chapter to inspect its full activity log & score
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campusLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-card border-border hover:border-border flex flex-col justify-between space-y-4 rounded-2xl border p-5 shadow-sm transition-all"
              >
                <div>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-bold tracking-wider uppercase">
                      {lead.city}, {lead.state}
                    </span>
                    <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 font-mono text-xs font-bold">
                      Score: {lead.performanceScore}/100
                    </span>
                  </div>

                  <h4 className="text-foreground text-base font-bold">{lead.name}</h4>
                  <div className="text-muted-foreground mt-0.5 text-xs font-medium">
                    {lead.college}
                  </div>
                </div>

                <div className="border-border flex items-center justify-between border-t pt-3">
                  <div className="text-muted-foreground text-xs">
                    <strong className="text-foreground font-mono">{lead.referrals}</strong>{" "}
                    referrals
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
            <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
              Active State Chapters
            </h3>
            <span className="text-muted-foreground text-xs">
              Select a state to inspect statewide chapter roster & activities
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stateLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-card border-border hover:border-border flex flex-col justify-between space-y-4 rounded-2xl border p-5 shadow-sm transition-all"
              >
                <div>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-bold tracking-wider uppercase">
                      State Jurisdiction
                    </span>
                    <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 font-mono text-xs font-bold">
                      Score: {lead.performanceScore}/100
                    </span>
                  </div>

                  <h4 className="text-foreground text-base font-bold">{lead.name}</h4>
                  <div className="text-primary mt-0.5 text-xs font-semibold">
                    State of {lead.state}
                  </div>
                </div>

                <div className="border-border flex items-center justify-between border-t pt-3">
                  <div className="text-muted-foreground text-xs">
                    <strong className="text-foreground font-mono">{lead.referrals}</strong>{" "}
                    statewide referrals
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
