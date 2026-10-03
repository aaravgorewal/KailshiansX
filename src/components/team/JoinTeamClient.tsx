// src/components/team/JoinTeamClient.tsx
// Interactive client for exploring team openings, viewing the 5-stage selection workflow, and applying

"use client";

import * as React from "react";
import { Clock, MapPin, CheckCircle2, ArrowRight, Send, ChevronDown, Check } from "lucide-react";
import {
  OPENINGS,
  TEAM_AREAS,
  TeamArea,
  TeamOpening,
  STATUS_CONFIG,
  TEAM_APPLICATION_STATUSES,
} from "@/lib/team-constants";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/useToast";
import { cn } from "@/lib/utils";
import { trackApplicationSubmit } from "@/lib/analytics";

export function JoinTeamClient() {
  const [selectedArea, setSelectedArea] = React.useState<string>("ALL");
  const formRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Form State
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    area: "Technology" as TeamArea,
    roleApplied: "",
    linkedin: "",
    portfolio: "",
    resumeUrl: "",
    experience: "",
    motivation: "",
    honeypot: "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionSuccess, setSubmissionSuccess] = React.useState<{
    id: string;
    message: string;
  } | null>(null);

  // Filter openings
  const filteredOpenings = React.useMemo(() => {
    if (selectedArea === "ALL") return OPENINGS;
    return OPENINGS.filter((o) => o.area.toLowerCase() === selectedArea.toLowerCase());
  }, [selectedArea]);

  const handleApplyClick = (opening: TeamOpening) => {
    setFormData((prev) => ({
      ...prev,
      area: opening.area,
      roleApplied: opening.title,
    }));

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/applications/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSubmissionSuccess({
        id: data.id,
        message: data.message,
      });

      trackApplicationSubmit({
        type: "team",
        roleOrTrack: `${formData.roleApplied} (${formData.area})`,
      });

      toast({
        title: "Application Submitted!",
        description: "Your application has been received and entered our review queue.",
      });
    } catch (err: unknown) {
      toast({
        title: "Submission Error",
        description:
          err instanceof Error ? err.message : "Failed to submit. Please check required fields.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-20">
      {/* ─── 1. ROLE-WISE OPENINGS DIRECTORY (PRD §14) ────────────────────── */}
      <section className="space-y-8" id="openings">
        <div>
          <h2 className="text-surface-50 text-2xl font-bold tracking-tight sm:text-3xl">
            Open Core Volunteer & Leadership Positions
          </h2>
          <p className="text-surface-400 mt-2 max-w-3xl text-sm">
            We are actively recruiting passionate builders across 11 functional domains. Whether you
            want to write platform code, host 500-person summits, or orchestrate university
            partnerships, there is an ownership seat waiting for you.
          </p>
        </div>

        {/* Filter Pills across 11 Areas */}
        <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setSelectedArea("ALL")}
            className={cn(
              "shrink-0 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-200",
              selectedArea === "ALL"
                ? "border-brand-500/80 bg-brand-500/15 text-brand-300 font-semibold"
                : "border-surface-800 bg-surface-900/60 text-surface-400 hover:border-surface-700 hover:text-surface-200"
            )}
          >
            All Areas ({OPENINGS.length})
          </button>
          {TEAM_AREAS.map((area) => {
            const count = OPENINGS.filter((o) => o.area === area).length;
            const isSelected = selectedArea === area;
            return (
              <button
                key={area}
                type="button"
                onClick={() => setSelectedArea(area)}
                className={cn(
                  "shrink-0 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-200",
                  isSelected
                    ? "border-brand-500/80 bg-brand-500/15 text-brand-300 font-semibold"
                    : "border-surface-800 bg-surface-900/60 text-surface-400 hover:border-surface-700 hover:text-surface-200"
                )}
              >
                <span>{area}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "py-0.2 ml-1.5 rounded-full px-1.5 font-mono text-[10px]",
                      isSelected
                        ? "bg-brand-500/30 text-brand-200"
                        : "bg-surface-800 text-surface-400"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Openings Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredOpenings.map((opening) => (
            <article
              key={opening.id}
              className="border-surface-800 bg-surface-900/60 hover:border-brand-500/40 hover:bg-surface-900/80 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="brand" size="sm">
                      {opening.area}
                    </Badge>
                    <Badge variant="surface" size="sm">
                      {opening.type}
                    </Badge>
                  </div>
                  <div className="text-surface-400 flex items-center gap-3 font-mono text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="text-surface-500 size-3" />
                      {opening.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="text-brand-400 size-3" />
                      {opening.commitment}
                    </span>
                  </div>
                </div>

                {/* Title & Summary */}
                <div>
                  <h3 className="text-surface-50 text-xl font-bold">{opening.title}</h3>
                  <p className="text-surface-300 mt-2 text-xs leading-relaxed">{opening.summary}</p>
                </div>

                {/* What You'll Do */}
                <div className="border-surface-800/80 space-y-2 border-t pt-3">
                  <h4 className="text-surface-400 font-mono text-[11px] font-semibold tracking-wider uppercase">
                    Key Responsibilities
                  </h4>
                  <ul className="text-surface-300 space-y-1.5 text-xs">
                    {opening.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="text-brand-400 mt-0.5 size-3.5 shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div className="border-surface-800/80 space-y-2 border-t pt-3">
                  <h4 className="text-surface-400 font-mono text-[11px] font-semibold tracking-wider uppercase">
                    What We Look For
                  </h4>
                  <ul className="text-surface-400 space-y-1.5 text-xs">
                    {opening.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="bg-surface-500 mt-1.5 size-1 shrink-0 rounded-full" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="border-surface-800/80 mt-6 border-t pt-4">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => handleApplyClick(opening)}
                  rightIcon={<ArrowRight className="size-4" />}
                >
                  Apply for this Role
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── 2. 5-STAGE SELECTION WORKFLOW TIMELINE (PRD §14) ─────────────── */}
      <section className="border-surface-800 bg-surface-900/40 space-y-8 rounded-3xl border p-8 sm:p-10">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <Badge variant="accent" size="default">
            Transparent Workflow
          </Badge>
          <h2 className="text-surface-50 text-2xl font-black tracking-tight sm:text-3xl">
            Our 5-Stage Selection Pipeline
          </h2>
          <p className="text-surface-400 text-xs leading-relaxed">
            Every candidate is respected with honest timelines and feedback. We review applications
            weekly in structured batches.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TEAM_APPLICATION_STATUSES.map((statusKey, index) => {
            const config = STATUS_CONFIG[statusKey];
            return (
              <div
                key={statusKey}
                className="border-surface-800 bg-surface-950/60 relative flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-sm"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-brand-400 font-mono text-xs font-bold">
                      Step {index + 1}
                    </span>
                    <Badge variant={config.variant} size="sm">
                      {statusKey}
                    </Badge>
                  </div>
                  <h4 className="text-surface-100 text-sm font-bold">{config.label}</h4>
                  <p className="text-surface-400 mt-2 text-xs leading-relaxed">
                    {config.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 3. APPLICATION FORM (PRD §14) ─────────────────────────────────── */}
      <section
        ref={formRef}
        className="border-surface-800 bg-surface-900/70 space-y-8 rounded-3xl border p-8 sm:p-12"
      >
        <div>
          <Badge variant="brand" size="default">
            Application Portal
          </Badge>
          <h2 className="text-surface-50 mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Submit Your Core Team Application
          </h2>
          <p className="text-surface-400 mt-1 text-xs">
            Tell us about your background, projects you have shipped, and where you want to make an
            impact.
          </p>
        </div>

        {submissionSuccess ? (
          <div className="animate-in fade-in space-y-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-emerald-300">Application Received!</h3>
            <p className="text-surface-300 mx-auto max-w-md text-xs leading-relaxed">
              {submissionSuccess.message}
            </p>
            <div className="text-surface-400 font-mono text-xs">
              Application Reference:{" "}
              <span className="text-surface-100">{submissionSuccess.id}</span>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmissionSuccess(null);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    area: "Technology",
                    roleApplied: "",
                    linkedin: "",
                    portfolio: "",
                    resumeUrl: "",
                    experience: "",
                    motivation: "",
                    honeypot: "",
                  });
                }}
              >
                Submit Another Application
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot Spam Trap (Hidden) */}
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-surface-200 text-xs font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-surface-700/80 bg-surface-950 text-surface-100 placeholder:text-surface-600 focus:border-brand-500 w-full rounded-xl border px-4 py-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-surface-200 text-xs font-semibold">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="aarav@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-surface-700/80 bg-surface-950 text-surface-100 placeholder:text-surface-600 focus:border-brand-500 w-full rounded-xl border px-4 py-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Row 2: Phone & Area */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-surface-200 text-xs font-semibold">Phone (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-surface-700/80 bg-surface-950 text-surface-100 placeholder:text-surface-600 focus:border-brand-500 w-full rounded-xl border px-4 py-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-surface-200 text-xs font-semibold">Functional Area *</label>
                <div className="relative">
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value as TeamArea })}
                    className="border-surface-700/80 bg-surface-950 text-surface-100 focus:border-brand-500 w-full cursor-pointer appearance-none rounded-xl border px-4 py-2.5 text-xs focus:outline-none"
                  >
                    {TEAM_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="text-surface-400 pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Row 3: Role Applied */}
            <div className="space-y-2">
              <label className="text-surface-200 text-xs font-semibold">
                Specific Role / Position Applied For *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Platform Engineer, Stage Producer, Campus Chapter Lead..."
                value={formData.roleApplied}
                onChange={(e) => setFormData({ ...formData, roleApplied: e.target.value })}
                className="border-surface-700/80 bg-surface-950 text-surface-100 placeholder:text-surface-600 focus:border-brand-500 w-full rounded-xl border px-4 py-2.5 text-xs focus:outline-none"
              />
            </div>

            {/* Row 4: Links (LinkedIn, Portfolio / GitHub, Resume) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-surface-200 text-xs font-semibold">LinkedIn Profile</label>
                <input
                  type="text"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="border-surface-700/80 bg-surface-950 text-surface-100 placeholder:text-surface-600 focus:border-brand-500 w-full rounded-xl border px-4 py-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-surface-200 text-xs font-semibold">
                  GitHub / Portfolio URL
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/username"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  className="border-surface-700/80 bg-surface-950 text-surface-100 placeholder:text-surface-600 focus:border-brand-500 w-full rounded-xl border px-4 py-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-surface-200 text-xs font-semibold">Resume / CV Link</label>
                <input
                  type="text"
                  placeholder="Google Drive / Notion public link"
                  value={formData.resumeUrl}
                  onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                  className="border-surface-700/80 bg-surface-950 text-surface-100 placeholder:text-surface-600 focus:border-brand-500 w-full rounded-xl border px-4 py-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Row 5: Experience */}
            <div className="space-y-2">
              <label className="text-surface-200 text-xs font-semibold">
                Your Relevant Experience & Projects Shipped *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Detail technical stacks used, events organized, communities managed, or campaigns executed. Focus on tangible results."
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="border-surface-700/80 bg-surface-950 text-surface-100 placeholder:text-surface-600 focus:border-brand-500 w-full rounded-xl border p-4 text-xs focus:outline-none"
              />
            </div>

            {/* Row 6: Motivation */}
            <div className="space-y-2">
              <label className="text-surface-200 text-xs font-semibold">
                Why KailshiansX? What Drives You to Build Here? *
              </label>
              <textarea
                required
                rows={4}
                placeholder="What excites you about our mission? What unique perspective or commitment will you bring to the core team?"
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                className="border-surface-700/80 bg-surface-950 text-surface-100 placeholder:text-surface-600 focus:border-brand-500 w-full rounded-xl border p-4 text-xs focus:outline-none"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="default"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<Send className="size-4" />}
              >
                {isSubmitting ? "Submitting Application..." : "Submit Application"}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
