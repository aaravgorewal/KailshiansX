"use client";

// src/components/profile/MemberDashboardClient.tsx
// Interactive Member Portal (/me) with tabs for Events, Tickets, Certificates,
// Workshops, Hackathons, Applications, and Community Role.

import React, { useState } from "react";
import {
  Ticket,
  Award,
  Code2,
  Flame,
  FileText,
  UserCheck,
  Settings,
  Sparkles,
  RefreshCw,
  Shield,
  Layers,
  Compass,
  ArrowRight,
} from "lucide-react";
import type { MemberDashboardData } from "@/server/users/profile";
import type { UserRecommendationsPayload } from "@/server/recommendations/service";
import { RecommendationsClient } from "@/components/recommendations/RecommendationsClient";
import { DeveloperPassportCard } from "./DeveloperPassportCard";
import { ProgressionLadder } from "./ProgressionLadder";
import { BadgesGrid } from "./BadgesGrid";
import { ParticipationTimeline } from "./ParticipationTimeline";
import { TicketsList } from "./TicketsList";
import { CertificatesList } from "./CertificatesList";
import { ApplicationsTracker } from "./ApplicationsTracker";
import { ProfileEditForm } from "./ProfileEditForm";
import { cn } from "@/lib/utils";

interface Props {
  initialData: MemberDashboardData;
  recommendations?: UserRecommendationsPayload;
}

type TabKey =
  | "OVERVIEW"
  | "RECOMMENDED"
  | "TICKETS"
  | "CERTIFICATES"
  | "WORKSHOPS"
  | "HACKATHONS"
  | "APPLICATIONS"
  | "ROLE"
  | "SETTINGS";

export function MemberDashboardClient({ initialData, recommendations }: Props) {
  const [data, setData] = useState<MemberDashboardData>(initialData);
  const [activeTab, setActiveTab] = useState<TabKey>("OVERVIEW");
  const [autoLinking, setAutoLinking] = useState(false);
  const [autoLinkMessage, setAutoLinkMessage] = useState<string | null>(null);

  const handleAutoLink = async () => {
    setAutoLinking(true);
    setAutoLinkMessage(null);
    try {
      const res = await fetch("/api/me/auto-link", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setAutoLinkMessage(json.message);
        // Refresh dashboard data
        const profileRes = await fetch("/api/me/profile");
        const profileJson = await profileRes.json();
        if (profileRes.ok && profileJson.data) {
          setData(profileJson.data);
        }
      }
    } catch (err) {
      console.error("Auto link error:", err);
    } finally {
      setAutoLinking(false);
      setTimeout(() => setAutoLinkMessage(null), 5000);
    }
  };

  const handleVisibilityChange = async (isPublic: boolean) => {
    const res = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPassportPublic: isPublic }),
    });
    if (res.ok) {
      setData((prev) => ({
        ...prev,
        user: { ...prev.user, isPassportPublic: isPublic },
        passport: {
          ...prev.passport,
          user: { ...prev.passport.user, isPassportPublic: isPublic },
        },
      }));
    }
  };

  const tabs: { key: TabKey; label: string; count?: number; icon: React.ElementType }[] = [
    { key: "OVERVIEW", label: "Passport & Overview", icon: Sparkles },
    ...(recommendations
      ? [
          {
            key: "RECOMMENDED" as TabKey,
            label: "Recommended For You",
            count:
              recommendations.recommendedEvents.length + recommendations.recommendedRoles.length,
            icon: Compass,
          },
        ]
      : []),
    { key: "TICKETS", label: "My Events & Tickets", count: data.stats.ticketsCount, icon: Ticket },
    {
      key: "CERTIFICATES",
      label: "Certificates",
      count: data.stats.certificatesCount,
      icon: Award,
    },
    { key: "WORKSHOPS", label: "Workshops", count: data.stats.workshopsCount, icon: Code2 },
    { key: "HACKATHONS", label: "Hackathons", count: data.stats.hackathonsCount, icon: Flame },
    {
      key: "APPLICATIONS",
      label: "Applications",
      count: data.stats.applicationsCount,
      icon: FileText,
    },
    { key: "ROLE", label: "Community Role", icon: Shield },
    { key: "SETTINGS", label: "Settings", icon: Settings },
  ];

  return (
    <div className="space-y-8">
      {/* Auto-link Past Registrations Notification Strip */}
      <div className="from-brand-950/40 via-surface-900/60 border-brand-500/20 flex flex-col justify-between gap-3 rounded-2xl border bg-gradient-to-r to-purple-950/40 p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="bg-brand-500/20 border-brand-500/30 text-brand-400 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border">
            <RefreshCw className={cn("h-4 w-4", autoLinking && "animate-spin")} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span>Automatic Email Record Sync</span>
              <span className="text-brand-400 bg-brand-500/10 border-brand-500/20 rounded-full border px-2 py-0.5 text-[10px]">
                Active
              </span>
            </div>
            <p className="text-surface-400 mt-0.5 text-xs">
              Tickets and certificates registered with{" "}
              <span className="text-surface-200 font-mono">{data.user.email}</span> are
              automatically linked.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {autoLinkMessage && (
            <span className="animate-in fade-in text-xs font-semibold text-emerald-400">
              {autoLinkMessage}
            </span>
          )}
          <button
            type="button"
            id="btn-sync-records"
            onClick={handleAutoLink}
            disabled={autoLinking}
            className="text-surface-200 bg-surface-800 hover:bg-surface-700 border-surface-700 flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors hover:text-white"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", autoLinking && "animate-spin")} />
            <span>{autoLinking ? "Syncing..." : "Re-sync Past Records"}</span>
          </button>
        </div>
      </div>

      {/* Main Developer Passport Card */}
      <DeveloperPassportCard
        passport={data.passport}
        isOwner={true}
        onVisibilityChange={handleVisibilityChange}
      />

      {/* Navigation Tabs Bar */}
      <div className="border-surface-800 no-scrollbar overflow-x-auto border-b pb-px">
        <div className="flex min-w-max items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                id={`tab-${tab.key.toLowerCase()}`}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative flex items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-semibold transition-all",
                  isActive
                    ? "text-brand-400 bg-surface-900 border-surface-700/80 border-x border-t shadow-md"
                    : "text-surface-400 hover:text-surface-200 hover:bg-surface-900/40"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-brand-400" : "text-surface-500")} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={cn(
                      "py-0.2 rounded-full px-1.5 text-[11px] font-bold",
                      isActive
                        ? "bg-brand-500/20 text-brand-300"
                        : "bg-surface-800 text-surface-400"
                    )}
                  >
                    {tab.count}
                  </span>
                )}

                {isActive && <span className="bg-brand-500 absolute inset-x-0 bottom-0 h-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="animate-in fade-in space-y-8 duration-200">
        {activeTab === "OVERVIEW" && (
          <div className="space-y-8">
            {recommendations && (
              <div className="border-brand-500/30 from-brand-950/40 via-surface-900/60 flex flex-col justify-between gap-4 rounded-3xl border bg-gradient-to-r to-purple-950/40 p-5 backdrop-blur-md sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-500/20 border-brand-500/30 text-brand-400 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {recommendations.recommendedEvents.length} Events &{" "}
                      {recommendations.recommendedRoles.length} Leadership Roles Recommended For You
                    </h4>
                    <p className="text-surface-400 mt-0.5 text-xs">
                      Tailored to your attendance history, skills, and city (
                      {recommendations.userContext.city || "your region"}).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-view-recommendations"
                  onClick={() => setActiveTab("RECOMMENDED")}
                  className="bg-brand-500 hover:bg-brand-400 inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition-colors"
                >
                  <span>Explore Matches</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <ProgressionLadder progression={data.passport.progression} />
            <BadgesGrid badges={data.passport.badges} />
            <ParticipationTimeline timeline={data.passport.timeline} />
          </div>
        )}

        {activeTab === "RECOMMENDED" && recommendations && (
          <RecommendationsClient initialData={recommendations} />
        )}

        {activeTab === "TICKETS" && (
          <div className="space-y-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <Ticket className="text-brand-400 h-5 w-5" />
                My Event Tickets & Access Passes
              </h3>
              <p className="text-surface-400 mt-1 text-sm">
                Show your unique QR pass at entry desks or download printable confirmations.
              </p>
            </div>
            <TicketsList events={data.myEvents} />
          </div>
        )}

        {activeTab === "CERTIFICATES" && (
          <div className="space-y-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <Award className="h-5 w-5 text-amber-400" />
                Verifiable Certificates
              </h3>
              <p className="text-surface-400 mt-1 text-sm">
                Authentic certificates issued by KailshiansX with public verification identifiers.
              </p>
            </div>
            <CertificatesList certificates={data.certificates} />
          </div>
        )}

        {activeTab === "WORKSHOPS" && (
          <div className="space-y-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <Code2 className="h-5 w-5 text-teal-400" />
                Technical Workshops
              </h3>
              <p className="text-surface-400 mt-1 text-sm">
                Hands-on coding bootcamps, architectural deep dives, and slide repositories.
              </p>
            </div>
            <TicketsList events={data.workshops} />
          </div>
        )}

        {activeTab === "HACKATHONS" && (
          <div className="space-y-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <Flame className="h-5 w-5 text-amber-400" />
                Hackathon Series (NirmanX & AarambhX)
              </h3>
              <p className="text-surface-400 mt-1 text-sm">
                Tracks, problem statements, and team registrations for regional hackathon editions.
              </p>
            </div>
            <TicketsList events={data.hackathons} />
          </div>
        )}

        {activeTab === "APPLICATIONS" && (
          <div className="space-y-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <FileText className="text-brand-400 h-5 w-5" />
                Applications Status Tracker
              </h3>
              <p className="text-surface-400 mt-1 text-sm">
                Real-time status updates on your core team, campus lead, and state lead submissions.
              </p>
            </div>
            <ApplicationsTracker applications={data.applications} />
          </div>
        )}

        {activeTab === "ROLE" && (
          <div className="border-surface-800 bg-surface-900/60 space-y-6 rounded-2xl border p-6 shadow-xl backdrop-blur-xl">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <Shield className="text-brand-400 h-5 w-5" />
                Community Leadership & Permissions
              </h3>
              <p className="text-surface-400 mt-1 text-sm">
                Your role, institutional affiliations, and governance privileges in the KailshiansX
                network.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-surface-950/70 border-surface-800 rounded-xl border p-5">
                <div className="text-surface-400 mb-1 text-xs font-semibold tracking-wider uppercase">
                  Platform Role
                </div>
                <div className="flex items-center gap-2 text-lg font-extrabold text-white">
                  <UserCheck className="text-brand-400 h-5 w-5" />
                  {data.communityRole.role.replace("_", " ")}
                </div>
                <p className="text-surface-400 mt-2 text-xs">
                  {data.communityRole.role === "SUPER_ADMIN"
                    ? "Full ecosystem administrative rights across all databases, audit logs, and finances."
                    : data.communityRole.role === "ADMIN"
                      ? "Administrative control across event listings, ticketing, and applications."
                      : data.communityRole.role === "EVENT_MANAGER"
                        ? "Check-in scanning and attendee management capabilities."
                        : data.communityRole.role === "CAMPUS_LEAD"
                          ? "University chapter leadership and community ambassador permissions."
                          : "Verified community member and builder profile."}
                </p>
              </div>

              <div className="bg-surface-950/70 border-surface-800 rounded-xl border p-5">
                <div className="text-surface-400 mb-1 text-xs font-semibold tracking-wider uppercase">
                  Leadership Chapter
                </div>
                <div className="flex items-center gap-2 text-lg font-extrabold text-white">
                  <Layers className="h-5 w-5 text-teal-400" />
                  {data.communityRole.isLead ? data.communityRole.leadTitle : "General Member"}
                </div>
                <p className="text-surface-400 mt-2 text-xs">
                  {data.communityRole.campusName
                    ? `Campus Lead for ${data.communityRole.campusName}`
                    : data.communityRole.stateName
                      ? `State Lead for ${data.communityRole.stateName}`
                      : "Interested in representing us? You can apply to become a Campus or State Lead anytime!"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "SETTINGS" && <ProfileEditForm user={data.user} />}
      </div>
    </div>
  );
}
