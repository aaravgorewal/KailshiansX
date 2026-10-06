// src/components/admin/AdminCmsClient.tsx
// Unified Admin CMS Client for managing:
// 1. Team Applications & Status Workflow (New -> Reviewing -> Interview -> Selected -> Rejected)
// 2. Core Team Profiles & Categorization
// 3. Founder Content & Milestones
// 4. Who We Are Content, Values & Platform Pillars

"use client";

import * as React from "react";
import Image from "next/image";
import {
  Users,
  Briefcase,
  FileText,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Building2,
  Globe,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/social-icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  TEAM_AREAS,
  TEAM_APPLICATION_STATUSES,
  CORE_TEAM_CATEGORIES,
  STATUS_CONFIG,
  type TeamApplicationStatus,
} from "@/lib/team-constants";
import type { WhoWeAreContent } from "@/server/cms/content";

interface TeamApp {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  area: string;
  roleApplied?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  resumeUrl?: string | null;
  experience?: string | null;
  motivation?: string | null;
  status: TeamApplicationStatus;
  adminNotes?: string | null;
  createdAt: string;
}

interface CoreMember {
  id: string;
  name: string;
  slug: string;
  role: string;
  category: string;
  bio?: string | null;
  photo?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  github?: string | null;
  website?: string | null;
  email?: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Milestone {
  year: string | number;
  title: string;
  description: string;
}

interface FounderData {
  founderName: string;
  tagline: string;
  message: string;
  philosophy: string;
  photo?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  milestones: Milestone[];
}

interface AdminCmsClientProps {
  initialApplications: TeamApp[];
  initialMembers: CoreMember[];
  initialFounder: FounderData;
  initialWhoWeAre: WhoWeAreContent;
  defaultTab?: "applications" | "core-team" | "founder" | "who-we-are";
}

export function AdminCmsClient({
  initialApplications,
  initialMembers,
  initialFounder,
  initialWhoWeAre,
  defaultTab = "applications",
}: AdminCmsClientProps) {
  const [activeTab, setActiveTab] = React.useState<
    "applications" | "core-team" | "founder" | "who-we-are"
  >(defaultTab);

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 1: APPLICATIONS WORKFLOW STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [applications, setApplications] = React.useState<TeamApp[]>(initialApplications);
  const [appSearch, setAppSearch] = React.useState("");
  const [appStatusFilter, setAppStatusFilter] = React.useState<string>("ALL");
  const [appAreaFilter, setAppAreaFilter] = React.useState<string>("ALL");
  const [selectedApp, setSelectedApp] = React.useState<TeamApp | null>(null);
  const [adminNotes, setAdminNotes] = React.useState("");
  const [updatingAppId, setUpdatingAppId] = React.useState<string | null>(null);
  const [appSuccessMessage, setAppSuccessMessage] = React.useState<string | null>(null);

  const filteredApps = React.useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !appSearch ||
        app.name.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.email.toLowerCase().includes(appSearch.toLowerCase()) ||
        (app.roleApplied && app.roleApplied.toLowerCase().includes(appSearch.toLowerCase()));

      const matchesStatus = appStatusFilter === "ALL" || app.status === appStatusFilter;
      const matchesArea = appAreaFilter === "ALL" || app.area === appAreaFilter;

      return matchesSearch && matchesStatus && matchesArea;
    });
  }, [applications, appSearch, appStatusFilter, appAreaFilter]);

  const handleUpdateStatus = async (
    id: string,
    newStatus: TeamApplicationStatus,
    notes?: string
  ) => {
    setUpdatingAppId(id);
    try {
      const res = await fetch("/api/admin/applications/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: newStatus,
          adminNotes: notes !== undefined ? notes : adminNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update application");

      setApplications((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: newStatus,
                adminNotes: notes !== undefined ? notes : adminNotes,
              }
            : a
        )
      );

      if (selectedApp && selectedApp.id === id) {
        setSelectedApp((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                adminNotes: notes !== undefined ? notes : adminNotes,
              }
            : null
        );
      }

      setAppSuccessMessage(`Updated application status to ${newStatus}`);
      setTimeout(() => setAppSuccessMessage(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update application status");
    } finally {
      setUpdatingAppId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 2: CORE TEAM STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [members, setMembers] = React.useState<CoreMember[]>(initialMembers);
  const [isEditingMember, setIsEditingMember] = React.useState(false);
  const [memberFormData, setMemberFormData] = React.useState<Partial<CoreMember>>({
    name: "",
    role: "",
    category: "technology",
    bio: "",
    photo: "",
    linkedin: "",
    twitter: "",
    github: "",
    website: "",
    sortOrder: 0,
    isActive: true,
  });
  const [memberLoading, setMemberLoading] = React.useState(false);
  const [memberSuccessMsg, setMemberSuccessMsg] = React.useState<string | null>(null);

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberLoading(true);
    try {
      const isUpdate = !!memberFormData.id;
      const res = await fetch("/api/admin/cms/core-team", {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberFormData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save core team member");

      if (isUpdate) {
        setMembers((prev) =>
          prev.map((m) => (m.id === memberFormData.id ? { ...m, ...json.member } : m))
        );
      } else {
        setMembers((prev) => [...prev, json.member]);
      }

      setIsEditingMember(false);
      setMemberFormData({
        name: "",
        role: "",
        category: "technology",
        bio: "",
        photo: "",
        linkedin: "",
        twitter: "",
        github: "",
        website: "",
        sortOrder: 0,
        isActive: true,
      });
      setMemberSuccessMsg(isUpdate ? "Member updated successfully" : "Member added successfully");
      setTimeout(() => setMemberSuccessMsg(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save member");
    } finally {
      setMemberLoading(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member from Core Team?")) return;
    try {
      const res = await fetch(`/api/admin/cms/core-team?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete member");

      setMembers((prev) => prev.filter((m) => m.id !== id));
      setMemberSuccessMsg("Member removed from active directory");
      setTimeout(() => setMemberSuccessMsg(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete member");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 3: FOUNDER STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [founderForm, setFounderForm] = React.useState<FounderData>(initialFounder);
  const [founderLoading, setFounderLoading] = React.useState(false);
  const [founderSuccessMsg, setFounderSuccessMsg] = React.useState<string | null>(null);

  const handleSaveFounder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFounderLoading(true);
    try {
      const res = await fetch("/api/admin/cms/founder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(founderForm),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update founder content");

      setFounderSuccessMsg("Founder page content saved successfully!");
      setTimeout(() => setFounderSuccessMsg(null), 3500);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save founder content");
    } finally {
      setFounderLoading(false);
    }
  };

  const handleAddMilestone = () => {
    setFounderForm((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { year: new Date().getFullYear().toString(), title: "New Milestone", description: "" },
      ],
    }));
  };

  const handleRemoveMilestone = (index: number) => {
    setFounderForm((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, idx) => idx !== index),
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB 4: WHO WE ARE STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [whoWeAreForm, setWhoWeAreForm] = React.useState<WhoWeAreContent>(initialWhoWeAre);
  const [whoWeAreLoading, setWhoWeAreLoading] = React.useState(false);
  const [whoWeAreSuccessMsg, setWhoWeAreSuccessMsg] = React.useState<string | null>(null);

  const handleSaveWhoWeAre = async (e: React.FormEvent) => {
    e.preventDefault();
    setWhoWeAreLoading(true);
    try {
      const res = await fetch("/api/admin/cms/who-we-are", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(whoWeAreForm),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update Who We Are content");

      setWhoWeAreSuccessMsg("Who We Are page CMS content saved successfully!");
      setTimeout(() => setWhoWeAreSuccessMsg(null), 3500);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save Who We Are content");
    } finally {
      setWhoWeAreLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── TABS HEADER ────────────────────────────────────────────────────── */}
      <div className="border-border flex flex-wrap items-center gap-2 border-b pb-3">
        <button
          onClick={() => setActiveTab("applications")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
            activeTab === "applications"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Briefcase className="size-4" />
          <span>Team Applications</span>
          <span
            className={cn(
              "ml-1.5 rounded-full px-2 py-0.5 font-mono text-xs",
              activeTab === "applications"
                ? "border-primary-foreground/30 text-primary-foreground border"
                : "bg-muted text-muted-foreground"
            )}
          >
            {applications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("core-team")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
            activeTab === "core-team"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Users className="size-4" />
          <span>Core Team Directory</span>
          <span
            className={cn(
              "ml-1.5 rounded-full px-2 py-0.5 font-mono text-xs",
              activeTab === "core-team"
                ? "border-primary-foreground/30 text-primary-foreground border"
                : "bg-muted text-muted-foreground"
            )}
          >
            {members.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("founder")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
            activeTab === "founder"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <FileText className="size-4" />
          <span>Founder Content</span>
        </button>

        <button
          onClick={() => setActiveTab("who-we-are")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
            activeTab === "who-we-are"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Building2 className="size-4" />
          <span>Who We Are CMS</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 1. TEAM APPLICATIONS TAB                                              */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          {appSuccessMessage && (
            <div className="border-success/30 bg-success/10 text-success flex items-center gap-2 rounded-xl border p-3 text-xs">
              <CheckCircle2 className="size-4" />
              <span>{appSuccessMessage}</span>
            </div>
          )}

          {/* Filters & Search */}
          <div className="bg-card border-border flex flex-col items-stretch gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates by name, email, or role..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-xl border py-2 pr-4 pl-9 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="bg-background border-border text-foreground focus:border-primary rounded-xl border px-3 py-2 text-xs focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                {TEAM_APPLICATION_STATUSES.map((statusKey) => (
                  <option key={statusKey} value={statusKey}>
                    {STATUS_CONFIG[statusKey].label}
                  </option>
                ))}
              </select>

              <select
                value={appAreaFilter}
                onChange={(e) => setAppAreaFilter(e.target.value)}
                className="bg-background border-border text-foreground focus:border-primary rounded-xl border px-3 py-2 text-xs focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                {TEAM_AREAS.map((areaName) => (
                  <option key={areaName} value={areaName}>
                    {areaName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Applications List */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              <div className="text-muted-foreground flex items-center justify-between px-1 font-mono text-xs">
                <span>{filteredApps.length} Candidates Found</span>
                <span>Workflow: New → Reviewing → Interview → Selected → Rejected</span>
              </div>

              {filteredApps.length === 0 ? (
                <div className="border-border bg-card text-muted-foreground rounded-2xl border p-8 text-center text-xs">
                  No applications match your filter criteria.
                </div>
              ) : (
                filteredApps.map((app) => {
                  const statusInfo = STATUS_CONFIG[app.status] || STATUS_CONFIG.NEW;
                  const isSelected = selectedApp?.id === app.id;

                  return (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        setAdminNotes(app.adminNotes || "");
                      }}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border bg-card hover:border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-foreground text-sm font-bold">{app.name}</h4>
                            <span className="bg-muted text-muted-foreground border-border rounded-full border px-2 py-0.5 font-mono text-xs">
                              {app.area}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {app.email} • {app.roleApplied || "Open Opening"}
                          </p>
                        </div>

                        <Badge variant={statusInfo.variant} size="sm">
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <div className="text-muted-foreground border-border mt-3 flex items-center justify-between border-t pt-2 text-xs">
                        <span className="max-w-[280px] truncate">
                          {app.experience
                            ? app.experience.slice(0, 50) + "..."
                            : "No experience notes"}
                        </span>
                        <span className="shrink-0 font-mono text-xs">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Candidate Detail & Workflow Actions Drawer */}
            <div className="lg:col-span-1">
              {selectedApp ? (
                <div className="border-border bg-card sticky top-6 space-y-5 rounded-2xl border p-5">
                  <div className="border-border flex items-start justify-between gap-3 border-b pb-3">
                    <div>
                      <h3 className="text-foreground text-base font-bold">{selectedApp.name}</h3>
                      <p className="text-muted-foreground text-xs">{selectedApp.email}</p>
                      {selectedApp.phone && (
                        <p className="text-muted-foreground text-xs">{selectedApp.phone}</p>
                      )}
                    </div>
                    <Badge
                      variant={STATUS_CONFIG[selectedApp.status]?.variant || "surface"}
                      size="sm"
                    >
                      {STATUS_CONFIG[selectedApp.status]?.label || selectedApp.status}
                    </Badge>
                  </div>

                  {/* Candidate Dossier */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-muted-foreground font-mono text-xs uppercase">
                        Functional Area &amp; Position
                      </span>
                      <p className="text-foreground font-semibold">
                        {selectedApp.area} • {selectedApp.roleApplied || "General Volunteer"}
                      </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedApp.resumeUrl && (
                        <a
                          href={selectedApp.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-muted text-primary hover:text-primary-hover border-border flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
                        >
                          <FileText className="size-3" />
                          <span>Resume</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      )}
                      {selectedApp.portfolio && (
                        <a
                          href={selectedApp.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-muted text-foreground border-border hover:text-foreground flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
                        >
                          <Globe className="size-3" />
                          <span>Portfolio / GitHub</span>
                        </a>
                      )}
                      {selectedApp.linkedin && (
                        <a
                          href={selectedApp.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-muted text-foreground border-border hover:text-foreground flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
                        >
                          <LinkedinIcon className="size-3" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>

                    {selectedApp.experience && (
                      <div>
                        <span className="text-muted-foreground font-mono text-xs uppercase">
                          Relevant Experience
                        </span>
                        <p className="bg-background border-border text-muted-foreground mt-1 max-h-32 overflow-y-auto rounded-xl border p-2.5 text-xs leading-relaxed whitespace-pre-wrap">
                          {selectedApp.experience}
                        </p>
                      </div>
                    )}

                    {selectedApp.motivation && (
                      <div>
                        <span className="text-muted-foreground font-mono text-xs uppercase">
                          Why KailshiansX?
                        </span>
                        <p className="bg-background border-border text-muted-foreground mt-1 max-h-32 overflow-y-auto rounded-xl border p-2.5 text-xs leading-relaxed whitespace-pre-wrap">
                          {selectedApp.motivation}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Progression Workflow */}
                  <div className="border-border space-y-3 border-t pt-3">
                    <span className="text-muted-foreground block font-mono text-xs tracking-wider uppercase">
                      Workflow Actions
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant={selectedApp.status === "REVIEWING" ? "default" : "secondary"}
                        disabled={updatingAppId === selectedApp.id}
                        onClick={() => handleUpdateStatus(selectedApp.id, "REVIEWING")}
                      >
                        Reviewing
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedApp.status === "INTERVIEW" ? "default" : "secondary"}
                        disabled={updatingAppId === selectedApp.id}
                        onClick={() => handleUpdateStatus(selectedApp.id, "INTERVIEW")}
                      >
                        Interview
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedApp.status === "SELECTED" ? "default" : "outline"}
                        disabled={updatingAppId === selectedApp.id}
                        onClick={() => handleUpdateStatus(selectedApp.id, "SELECTED")}
                        className="border-success/40 text-success hover:bg-success/10"
                      >
                        Select
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedApp.status === "REJECTED" ? "default" : "outline"}
                        disabled={updatingAppId === selectedApp.id}
                        onClick={() => handleUpdateStatus(selectedApp.id, "REJECTED")}
                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                      >
                        Reject
                      </Button>
                    </div>

                    {/* Admin Notes */}
                    <div className="space-y-2 pt-2">
                      <label className="text-muted-foreground font-mono text-xs">
                        Internal Reviewer Notes:
                      </label>
                      <textarea
                        rows={3}
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add review feedback, interview impressions, or domain fit notes..."
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-xl border p-2.5 text-xs focus:outline-none"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        disabled={updatingAppId === selectedApp.id}
                        onClick={() =>
                          handleUpdateStatus(selectedApp.id, selectedApp.status, adminNotes)
                        }
                      >
                        <Save className="mr-1.5 size-3.5" />
                        Save Notes
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-border bg-card text-muted-foreground rounded-2xl border p-8 text-center text-xs">
                  Select a candidate from the left to view dossier and advance through workflow.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 2. CORE TEAM DIRECTORY TAB                                            */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "core-team" && (
        <div className="space-y-6">
          {memberSuccessMsg && (
            <div className="border-success/30 bg-success/10 text-success flex items-center gap-2 rounded-xl border p-3 text-xs">
              <CheckCircle2 className="size-4" />
              <span>{memberSuccessMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-foreground text-base font-bold">Core Team Directory</h3>
              <p className="text-muted-foreground text-xs">
                Organized across 7 categories with role, ownership bio, photo, and links.
              </p>
            </div>

            <Button
              size="sm"
              variant="default"
              onClick={() => {
                setMemberFormData({
                  name: "",
                  role: "",
                  category: "technology",
                  bio: "",
                  photo: "",
                  linkedin: "",
                  twitter: "",
                  github: "",
                  website: "",
                  sortOrder: members.length,
                  isActive: true,
                });
                setIsEditingMember(true);
              }}
            >
              <Plus className="mr-1.5 size-4" />
              Add Member
            </Button>
          </div>

          {/* Member Form Modal / Inline Editor */}
          {isEditingMember && (
            <form
              onSubmit={handleSaveMember}
              className="border-primary/40 bg-card space-y-4 rounded-2xl border p-6 backdrop-blur-md"
            >
              <div className="border-border flex items-center justify-between border-b pb-3">
                <h4 className="text-foreground text-sm font-bold">
                  {memberFormData.id ? "Edit Team Member" : "Add Core Team Member"}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingMember(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XCircle className="size-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={memberFormData.name || ""}
                    onChange={(e) => setMemberFormData((p) => ({ ...p, name: e.target.value }))}
                    className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Systems Architect"
                    value={memberFormData.role || ""}
                    onChange={(e) => setMemberFormData((p) => ({ ...p, role: e.target.value }))}
                    className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">Category *</label>
                  <select
                    value={memberFormData.category || "technology"}
                    onChange={(e) => setMemberFormData((p) => ({ ...p, category: e.target.value }))}
                    className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                  >
                    {CORE_TEAM_CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">Photo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={memberFormData.photo || ""}
                    onChange={(e) => setMemberFormData((p) => ({ ...p, photo: e.target.value }))}
                    className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Bio &amp; Scope of Ownership
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detail core responsibilities, engineering ownership, and background..."
                    value={memberFormData.bio || ""}
                    onChange={(e) => setMemberFormData((p) => ({ ...p, bio: e.target.value }))}
                    className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={memberFormData.linkedin || ""}
                    onChange={(e) => setMemberFormData((p) => ({ ...p, linkedin: e.target.value }))}
                    className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    value={memberFormData.twitter || ""}
                    onChange={(e) => setMemberFormData((p) => ({ ...p, twitter: e.target.value }))}
                    className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">GitHub URL</label>
                  <input
                    type="url"
                    value={memberFormData.github || ""}
                    onChange={(e) => setMemberFormData((p) => ({ ...p, github: e.target.value }))}
                    className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">Sort Order</label>
                  <input
                    type="number"
                    value={memberFormData.sortOrder ?? 0}
                    onChange={(e) =>
                      setMemberFormData((p) => ({
                        ...p,
                        sortOrder: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-border flex items-center justify-end gap-3 border-t pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditingMember(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="sm" disabled={memberLoading}>
                  {memberLoading ? "Saving..." : "Save Member"}
                </Button>
              </div>
            </form>
          )}

          {/* Members Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => {
              const categoryObj = CORE_TEAM_CATEGORIES.find((c) => c.key === m.category);
              const categoryTitle = categoryObj?.label || m.category;

              return (
                <div
                  key={m.id}
                  className="border-border bg-card group relative space-y-3 rounded-2xl border p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-muted border-border relative size-12 shrink-0 overflow-hidden rounded-xl border">
                      {m.photo ? (
                        <Image
                          src={m.photo}
                          alt={m.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground flex size-full items-center justify-center text-xs font-bold">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-foreground truncate text-sm font-bold">{m.name}</h4>
                      <p className="text-primary truncate text-xs">{m.role}</p>
                      <Badge variant="surface" size="sm" className="mt-1">
                        {categoryTitle}
                      </Badge>
                    </div>
                  </div>

                  {m.bio && (
                    <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                      {m.bio}
                    </p>
                  )}

                  <div className="border-border flex items-center justify-between border-t pt-2 text-xs">
                    <span className="text-muted-foreground font-mono text-xs">
                      Order: {m.sortOrder}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setMemberFormData(m);
                          setIsEditingMember(true);
                        }}
                        className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5"
                        title="Edit member"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(m.id)}
                        className="text-destructive hover:bg-destructive/10 rounded-lg p-1.5"
                        title="Delete member"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 3. FOUNDER CONTENT TAB                                                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "founder" && (
        <form onSubmit={handleSaveFounder} className="space-y-6">
          {founderSuccessMsg && (
            <div className="border-success/30 bg-success/10 text-success flex items-center gap-2 rounded-xl border p-3 text-xs">
              <CheckCircle2 className="size-4" />
              <span>{founderSuccessMsg}</span>
            </div>
          )}

          <div className="border-border bg-card space-y-4 rounded-2xl border p-6">
            <h3 className="text-foreground text-base font-bold">Founder Profile &amp; Story</h3>
            <p className="text-muted-foreground text-xs">
              : Message, why it was created, philosophy, milestones, and links (not a resume).
            </p>

            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div>
                <label className="text-muted-foreground mb-1 block font-medium">Founder Name</label>
                <input
                  type="text"
                  required
                  value={founderForm.founderName}
                  onChange={(e) => setFounderForm((p) => ({ ...p, founderName: e.target.value }))}
                  className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">Tagline</label>
                <input
                  type="text"
                  required
                  value={founderForm.tagline}
                  onChange={(e) => setFounderForm((p) => ({ ...p, tagline: e.target.value }))}
                  className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">Photo URL</label>
                <input
                  type="url"
                  value={founderForm.photo || ""}
                  onChange={(e) => setFounderForm((p) => ({ ...p, photo: e.target.value }))}
                  className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">LinkedIn URL</label>
                <input
                  type="url"
                  value={founderForm.linkedin || ""}
                  onChange={(e) => setFounderForm((p) => ({ ...p, linkedin: e.target.value }))}
                  className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-muted-foreground mb-1 block font-medium">
                  Personal Letter / Founder Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={founderForm.message}
                  onChange={(e) => setFounderForm((p) => ({ ...p, message: e.target.value }))}
                  className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 leading-relaxed focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-muted-foreground mb-1 block font-medium">
                  Community Philosophy
                </label>
                <textarea
                  rows={3}
                  required
                  value={founderForm.philosophy}
                  onChange={(e) => setFounderForm((p) => ({ ...p, philosophy: e.target.value }))}
                  className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Milestones Editor */}
          <div className="border-border bg-card space-y-4 rounded-2xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-foreground text-sm font-bold">Milestones Timeline</h4>
                <p className="text-muted-foreground text-xs">
                  Chronological progression of KailshiansX milestones.
                </p>
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={handleAddMilestone}>
                <Plus className="mr-1 size-3.5" />
                Add Milestone
              </Button>
            </div>

            <div className="space-y-3">
              {founderForm.milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="border-border bg-background space-y-2 rounded-xl border p-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Year"
                      value={m.year}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFounderForm((p) => ({
                          ...p,
                          milestones: p.milestones.map((item, i) =>
                            i === idx ? { ...item, year: val } : item
                          ),
                        }));
                      }}
                      className="bg-card border-border text-foreground w-24 rounded-lg border p-2 font-mono text-xs"
                    />

                    <input
                      type="text"
                      placeholder="Milestone Title"
                      value={m.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFounderForm((p) => ({
                          ...p,
                          milestones: p.milestones.map((item, i) =>
                            i === idx ? { ...item, title: val } : item
                          ),
                        }));
                      }}
                      className="bg-card border-border text-foreground flex-1 rounded-lg border p-2 text-xs font-bold"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-destructive p-1.5 hover:opacity-80"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Milestone description..."
                    value={m.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFounderForm((p) => ({
                        ...p,
                        milestones: p.milestones.map((item, i) =>
                          i === idx ? { ...item, description: val } : item
                        ),
                      }));
                    }}
                    className="bg-card border-border text-foreground w-full rounded-lg border p-2 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="default" size="default" disabled={founderLoading}>
              <Save className="mr-2 size-4" />
              {founderLoading ? "Saving Founder Content..." : "Save Founder Content"}
            </Button>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 4. WHO WE ARE CMS TAB                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "who-we-are" && (
        <form onSubmit={handleSaveWhoWeAre} className="space-y-6">
          {whoWeAreSuccessMsg && (
            <div className="border-success/30 bg-success/10 text-success flex items-center gap-2 rounded-xl border p-3 text-xs">
              <CheckCircle2 className="size-4" />
              <span>{whoWeAreSuccessMsg}</span>
            </div>
          )}

          {/* Core Mandate & Positioning */}
          <div className="border-border bg-card space-y-4 rounded-2xl border p-6">
            <h3 className="text-foreground text-base font-bold">
              Ecosystem Mandate &amp; KWS Charter
            </h3>
            <p className="text-muted-foreground text-xs">
              : Positions KailshiansX as the developer events &amp; community initiative of
              Kailshians Web Services.
            </p>

            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div>
                <label className="text-muted-foreground mb-1 block font-medium">Page Title</label>
                <input
                  type="text"
                  required
                  value={whoWeAreForm.title}
                  onChange={(e) => setWhoWeAreForm((p) => ({ ...p, title: e.target.value }))}
                  className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">Badge</label>
                <input
                  type="text"
                  required
                  value={whoWeAreForm.badge}
                  onChange={(e) => setWhoWeAreForm((p) => ({ ...p, badge: e.target.value }))}
                  className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-muted-foreground mb-1 block font-medium">
                  Initiative Notice (Kailshians Web Services Charter)
                </label>
                <textarea
                  rows={3}
                  required
                  value={whoWeAreForm.initiativeNotice}
                  onChange={(e) =>
                    setWhoWeAreForm((p) => ({ ...p, initiativeNotice: e.target.value }))
                  }
                  className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 leading-relaxed focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-muted-foreground mb-1 block font-medium">
                  Intro Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={whoWeAreForm.introDescription}
                  onChange={(e) =>
                    setWhoWeAreForm((p) => ({ ...p, introDescription: e.target.value }))
                  }
                  className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 leading-relaxed focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">
                  Mission Statement
                </label>
                <textarea
                  rows={3}
                  required
                  value={whoWeAreForm.mission}
                  onChange={(e) => setWhoWeAreForm((p) => ({ ...p, mission: e.target.value }))}
                  className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 leading-relaxed focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">
                  Vision Statement
                </label>
                <textarea
                  rows={3}
                  required
                  value={whoWeAreForm.vision}
                  onChange={(e) => setWhoWeAreForm((p) => ({ ...p, vision: e.target.value }))}
                  className="bg-background border-border text-foreground focus:border-primary w-full rounded-xl border p-2.5 leading-relaxed focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Constitutional Values */}
          <div className="border-border bg-card space-y-4 rounded-2xl border p-6">
            <h4 className="text-foreground text-sm font-bold">Constitutional Values</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {whoWeAreForm.values.map((v, idx) => (
                <div
                  key={idx}
                  className="border-border bg-background space-y-2 rounded-xl border p-3 text-xs"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Title"
                      value={v.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWhoWeAreForm((p) => ({
                          ...p,
                          values: p.values.map((item, i) =>
                            i === idx ? { ...item, title: val } : item
                          ),
                        }));
                      }}
                      className="bg-card border-border text-foreground w-1/2 rounded-lg border p-2 font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Subtitle"
                      value={v.subtitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWhoWeAreForm((p) => ({
                          ...p,
                          values: p.values.map((item, i) =>
                            i === idx ? { ...item, subtitle: val } : item
                          ),
                        }));
                      }}
                      className="bg-card border-border text-muted-foreground w-1/2 rounded-lg border p-2 font-mono text-xs"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={v.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setWhoWeAreForm((p) => ({
                        ...p,
                        values: p.values.map((item, i) =>
                          i === idx ? { ...item, description: val } : item
                        ),
                      }));
                    }}
                    className="bg-card border-border text-foreground w-full rounded-lg border p-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Operational Pillars */}
          <div className="border-border bg-card space-y-4 rounded-2xl border p-6">
            <h4 className="text-foreground text-sm font-bold">Operational Pillars (What We Do)</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {whoWeAreForm.pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="border-border bg-background space-y-2 rounded-xl border p-3 text-xs"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Pillar Title"
                      value={pillar.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWhoWeAreForm((p) => ({
                          ...p,
                          pillars: p.pillars.map((item, i) =>
                            i === idx ? { ...item, title: val } : item
                          ),
                        }));
                      }}
                      className="bg-card border-border text-foreground flex-1 rounded-lg border p-2 font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Badge"
                      value={pillar.badge}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWhoWeAreForm((p) => ({
                          ...p,
                          pillars: p.pillars.map((item, i) =>
                            i === idx ? { ...item, badge: val } : item
                          ),
                        }));
                      }}
                      className="bg-card border-border text-muted-foreground w-24 rounded-lg border p-2 font-mono text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Tagline"
                    value={pillar.tagline}
                    onChange={(e) => {
                      const val = e.target.value;
                      setWhoWeAreForm((p) => ({
                        ...p,
                        pillars: p.pillars.map((item, i) =>
                          i === idx ? { ...item, tagline: val } : item
                        ),
                      }));
                    }}
                    className="bg-card border-border text-muted-foreground w-full rounded-lg border p-2 font-mono text-xs"
                  />
                  <textarea
                    rows={2}
                    value={pillar.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setWhoWeAreForm((p) => ({
                        ...p,
                        pillars: p.pillars.map((item, i) =>
                          i === idx ? { ...item, description: val } : item
                        ),
                      }));
                    }}
                    className="bg-card border-border text-foreground w-full rounded-lg border p-2"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="default" size="default" disabled={whoWeAreLoading}>
              <Save className="mr-2 size-4" />
              {whoWeAreLoading ? "Saving Who We Are..." : "Save Who We Are Content"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
