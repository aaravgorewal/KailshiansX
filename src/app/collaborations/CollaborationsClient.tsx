"use client";

import React, { useState, useTransition } from "react";
import {
  GraduationCap,
  Users,
  Building2,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import type {
  CollegeCollaborationInput,
  CommunityCollaborationInput,
  VenueCollaborationInput,
  SponsorCollaborationInput,
} from "@/lib/validations/collaborations";
import {
  submitCollegeCollaboration,
  submitCommunityCollaboration,
  submitVenueCollaboration,
  submitSponsorCollaboration,
  type CollaborationActionResult,
} from "@/server/collaborations/actions";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type CollaborationPath = "college" | "community" | "venue" | "sponsor";

interface CollaborationsClientProps {
  initialPath?: CollaborationPath;
}

export function CollaborationsClient({ initialPath = "college" }: CollaborationsClientProps) {
  const [activePath, setActivePath] = useState<CollaborationPath>(initialPath);
  const [isPending, startTransition] = useTransition();

  // Submission outcome state
  const [submissionResult, setSubmissionResult] = useState<{
    path: CollaborationPath;
    leadId: string;
    referenceCode: string;
    organisation: string;
    email: string;
  } | null>(null);

  // Errors state
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // ─── 1. College Form State ──────────────────────────────────────────────────
  const [collegeData, setCollegeData] = useState<CollegeCollaborationInput>({
    organisation: "",
    contactPerson: "",
    roleDesignation: "",
    email: "",
    phone: "",
    website: "",
    city: "",
    state: "",
    expectedStudentReach: "250-500",
    proposedEvent: "",
    resourcesOffered: "",
    message: "",
    honeypot: "",
  });

  // ─── 2. Community Form State ────────────────────────────────────────────────
  const [communityData, setCommunityData] = useState<CommunityCollaborationInput>({
    organisation: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    city: "",
    state: "",
    communitySize: "500-2000",
    techFocus: "AI & Machine Learning",
    proposedEvent: "",
    resourcesOffered: "",
    message: "",
    honeypot: "",
  });

  // ─── 3. Venue Form State ────────────────────────────────────────────────────
  const [venueData, setVenueData] = useState<VenueCollaborationInput>({
    organisation: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    city: "",
    address: "",
    facilityType: "Coworking Space",
    seatingCapacity: "100-250",
    amenities: ["High-speed WiFi", "Projector & Screen", "AV & Mics", "Air Conditioning"],
    proposedEvent: "",
    resourcesOffered: "",
    message: "",
    honeypot: "",
  });

  // ─── 4. Sponsor Form State ──────────────────────────────────────────────────
  const [sponsorData, setSponsorData] = useState<SponsorCollaborationInput>({
    organisation: "",
    contactPerson: "",
    roleDesignation: "",
    email: "",
    phone: "",
    website: "",
    city: "",
    targetAudience: "Broad Developer Ecosystem",
    sponsorshipScope: "Hackathon Title Sponsor",
    budgetTier: "₹1,50,000 – ₹5,00,000",
    proposedEvent: "",
    resourcesOffered: "",
    message: "",
    honeypot: "",
  });

  // Toggle venue amenities
  const toggleAmenity = (item: string) => {
    setVenueData((prev) => {
      const exists = prev.amenities.includes(item);
      if (exists) {
        return { ...prev, amenities: prev.amenities.filter((a) => a !== item) };
      } else {
        return { ...prev, amenities: [...prev.amenities, item] };
      }
    });
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    startTransition(async () => {
      let res: CollaborationActionResult;

      if (activePath === "college") {
        res = await submitCollegeCollaboration(collegeData);
        if (res.success && res.leadId && res.referenceCode) {
          setSubmissionResult({
            path: "college",
            leadId: res.leadId,
            referenceCode: res.referenceCode,
            organisation: collegeData.organisation,
            email: collegeData.email,
          });
        }
      } else if (activePath === "community") {
        res = await submitCommunityCollaboration(communityData);
        if (res.success && res.leadId && res.referenceCode) {
          setSubmissionResult({
            path: "community",
            leadId: res.leadId,
            referenceCode: res.referenceCode,
            organisation: communityData.organisation,
            email: communityData.email,
          });
        }
      } else if (activePath === "venue") {
        res = await submitVenueCollaboration(venueData);
        if (res.success && res.leadId && res.referenceCode) {
          setSubmissionResult({
            path: "venue",
            leadId: res.leadId,
            referenceCode: res.referenceCode,
            organisation: venueData.organisation,
            email: venueData.email,
          });
        }
      } else {
        res = await submitSponsorCollaboration(sponsorData);
        if (res.success && res.leadId && res.referenceCode) {
          setSubmissionResult({
            path: "sponsor",
            leadId: res.leadId,
            referenceCode: res.referenceCode,
            organisation: sponsorData.organisation,
            email: sponsorData.email,
          });
        }
      }

      if (!res.success) {
        setFormError(res.error || "Submission failed. Please check the fields below.");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      }
    });
  };

  const resetForm = () => {
    setSubmissionResult(null);
    setFormError(null);
    setFieldErrors({});
  };

  return (
    <div className="space-y-12">
      {/* ─── Track Path Selector ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Path 1: College */}
        <button
          type="button"
          onClick={() => {
            setActivePath("college");
            resetForm();
          }}
          className={`relative rounded-2xl border p-5 text-left transition-all duration-300 ${
            activePath === "college"
              ? "border-indigo-500/80 bg-slate-900 shadow-lg ring-1 shadow-indigo-500/10 ring-indigo-500/50"
              : "border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/40"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-indigo-400/90 uppercase">
              Colleges
            </span>
          </div>
          <h3 className="text-base font-bold text-white">College Partner</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Co-host hackathons, workshops, and charter student chapters on your campus.
          </p>
        </button>

        {/* Path 2: Community */}
        <button
          type="button"
          onClick={() => {
            setActivePath("community");
            resetForm();
          }}
          className={`relative rounded-2xl border p-5 text-left transition-all duration-300 ${
            activePath === "community"
              ? "border-cyan-500/80 bg-slate-900 shadow-lg ring-1 shadow-cyan-500/10 ring-cyan-500/50"
              : "border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/40"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <Users className="h-5 w-5" />
            </div>
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-cyan-400/90 uppercase">
              Communities
            </span>
          </div>
          <h3 className="text-base font-bold text-white">Community Partner</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Cross-promote events, co-organize city meetups, and share speaker pools.
          </p>
        </button>

        {/* Path 3: Venue */}
        <button
          type="button"
          onClick={() => {
            setActivePath("venue");
            resetForm();
          }}
          className={`relative rounded-2xl border p-5 text-left transition-all duration-300 ${
            activePath === "venue"
              ? "border-amber-500/80 bg-slate-900 shadow-lg ring-1 shadow-amber-500/10 ring-amber-500/50"
              : "border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/40"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-amber-400/90 uppercase">
              Venues
            </span>
          </div>
          <h3 className="text-base font-bold text-white">Venue Partner</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Host high-energy tech meetups, hackathons, and bootcamps at your space.
          </p>
        </button>

        {/* Path 4: Sponsor */}
        <button
          type="button"
          onClick={() => {
            setActivePath("sponsor");
            resetForm();
          }}
          className={`relative rounded-2xl border p-5 text-left transition-all duration-300 ${
            activePath === "sponsor"
              ? "border-emerald-500/80 bg-slate-900 shadow-lg ring-1 shadow-emerald-500/10 ring-emerald-500/50"
              : "border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/40"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-emerald-400/90 uppercase">
              Sponsors
            </span>
          </div>
          <h3 className="text-base font-bold text-white">Sponsor / Brand</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Sponsor hackathon tracks, launch bounties, and connect with top builder talent.
          </p>
        </button>
      </div>

      {/* ─── Form Container or Submission Success View ──────────────────────── */}
      {submissionResult ? (
        <Card className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl sm:p-12">
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <Badge variant="outline" className="mb-3 border-cyan-500/30 bg-cyan-500/5 text-cyan-400">
            Partnership Inquiry Lodged
          </Badge>

          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Collaboration Dossier Created
          </h2>

          <div className="my-6 inline-block w-full max-w-md rounded-xl border border-slate-800/80 bg-slate-950 p-4 text-left">
            <div className="mb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Partnership Reference ID
            </div>
            <div className="font-mono text-lg font-bold text-cyan-400">
              {submissionResult.referenceCode}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-2 text-xs text-slate-400">
              <span>
                Organisation: <strong>{submissionResult.organisation}</strong>
              </span>
              <span className="font-medium text-emerald-400">Pipeline: NEW</span>
            </div>
          </div>

          <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-300">
            An auto-acknowledgement and copy of your proposal have been emailed to{" "}
            <span className="font-medium text-cyan-400">{submissionResult.email}</span>. Our
            ecosystem partnerships lead has been notified and will contact you within{" "}
            <strong>24–48 hours</strong> to schedule an initial discovery call.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              onClick={resetForm}
              variant="outline"
              className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 sm:w-auto"
            >
              Submit Another Inquiry
            </Button>
            <a
              href="mailto:partnerships@kailshiansx.com"
              className="inline-flex items-center justify-center text-xs text-slate-400 transition-colors hover:text-white"
            >
              Urgent query? Email partnerships@kailshiansx.com
            </a>
          </div>
        </Card>
      ) : (
        <Card className="relative rounded-3xl border-slate-800/80 bg-slate-900/60 p-6 sm:p-10">
          {/* Honeypot Spam Trap (Hidden) */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="hp_field">Do not fill this field</label>
            <input
              id="hp_field"
              type="text"
              name="honeypot"
              tabIndex={-1}
              autoComplete="off"
              value={
                activePath === "college"
                  ? collegeData.honeypot
                  : activePath === "community"
                    ? communityData.honeypot
                    : activePath === "venue"
                      ? venueData.honeypot
                      : sponsorData.honeypot
              }
              onChange={(e) => {
                const val = e.target.value;
                if (activePath === "college") setCollegeData({ ...collegeData, honeypot: val });
                else if (activePath === "community")
                  setCommunityData({ ...communityData, honeypot: val });
                else if (activePath === "venue") setVenueData({ ...venueData, honeypot: val });
                else setSponsorData({ ...sponsorData, honeypot: val });
              }}
            />
          </div>

          {/* Form Header */}
          <div className="mb-8 border-b border-slate-800/80 pb-6">
            <div className="mb-2 flex items-center gap-3">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-400" />
              <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                PRD §13 Collaboration Funnel
              </span>
            </div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              {activePath === "college" && "College & University Partnership Form"}
              {activePath === "community" && "Community & Dev Group Co-Host Form"}
              {activePath === "venue" && "Venue & Space Provider Partnership Form"}
              {activePath === "sponsor" && "Brand & Event Sponsorship Form"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {activePath === "college" &&
                "Partner with KailshiansX to bring hackathons, bootcamps, and a student developer chapter to your campus."}
              {activePath === "community" &&
                "Unite developer audiences. Co-brand meetups, share high-profile tech speakers, and cross-promote events."}
              {activePath === "venue" &&
                "Open your doors to 100+ passionate software developers, startup founders, and students in your city."}
              {activePath === "sponsor" &&
                "Showcase your dev tools, APIs, and cloud services directly to thousands of active builders across India."}
            </p>
          </div>

          {/* Error Alert */}
          {formError && (
            <div className="mb-8 flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div>
                <p className="font-semibold text-red-300">{formError}</p>
                {Object.keys(fieldErrors).length > 0 && (
                  <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs text-red-300/80">
                    {Object.entries(fieldErrors).map(([field, errs]) => (
                      <li key={field}>
                        <strong className="capitalize">{field}:</strong> {errs.join(", ")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ─── PATH 1: COLLEGE ────────────────────────────────────────── */}
            {activePath === "college" && (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      College / University Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Graphic Era Hill University"
                      value={collegeData.organisation}
                      onChange={(e) =>
                        setCollegeData({ ...collegeData, organisation: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      College Website / Portal
                    </label>
                    <input
                      type="url"
                      placeholder="https://college.edu.in"
                      value={collegeData.website}
                      onChange={(e) => setCollegeData({ ...collegeData, website: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Contact Person Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prof. Rohit Sharma or Aman Verma"
                      value={collegeData.contactPerson}
                      onChange={(e) =>
                        setCollegeData({ ...collegeData, contactPerson: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Designation / Club Role <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dean Academics, HOD CSE, Coding Club Lead"
                      value={collegeData.roleDesignation}
                      onChange={(e) =>
                        setCollegeData({ ...collegeData, roleDesignation: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Official Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contact@college.edu.in"
                      value={collegeData.email}
                      onChange={(e) => setCollegeData({ ...collegeData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Phone / WhatsApp Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={collegeData.phone}
                      onChange={(e) => setCollegeData({ ...collegeData, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      City <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dehradun"
                      value={collegeData.city}
                      onChange={(e) => setCollegeData({ ...collegeData, city: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Expected Student Audience Reach <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={collegeData.expectedStudentReach}
                      onChange={(e) =>
                        setCollegeData({
                          ...collegeData,
                          expectedStudentReach: e.target
                            .value as CollegeCollaborationInput["expectedStudentReach"],
                        })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="100-250">100 – 250 students</option>
                      <option value="250-500">250 – 500 students</option>
                      <option value="500-1000">500 – 1,000 students</option>
                      <option value="1000+">1,000+ students</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Proposed Event or Collaboration Scope (PRD §13){" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. 24-hour National Hackathon edition, AI/ML Bootcamp for 3rd-year CS students, or launching an official KailshiansX Campus Chapter."
                    value={collegeData.proposedEvent}
                    onChange={(e) =>
                      setCollegeData({ ...collegeData, proposedEvent: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Campus Facilities / Resources Offered <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. 400-seat Main Auditorium, 2 Computer Labs with 150 workstations, High-Speed Wi-Fi, Campus Security, Student Volunteer Team."
                    value={collegeData.resourcesOffered}
                    onChange={(e) =>
                      setCollegeData({ ...collegeData, resourcesOffered: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Additional Message / Preferred Months
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mention tentative event dates, department approvals status, or any questions."
                    value={collegeData.message}
                    onChange={(e) => setCollegeData({ ...collegeData, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* ─── PATH 2: COMMUNITY ──────────────────────────────────────── */}
            {activePath === "community" && (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Community Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dehradun Developers Club or Rust Chandigarh"
                      value={communityData.organisation}
                      onChange={(e) =>
                        setCommunityData({ ...communityData, organisation: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Community Link (Website, Meetup, Discord, X)
                    </label>
                    <input
                      type="url"
                      placeholder="https://discord.gg/your-community"
                      value={communityData.website}
                      onChange={(e) =>
                        setCommunityData({ ...communityData, website: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Community Lead / Organiser Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={communityData.contactPerson}
                      onChange={(e) =>
                        setCommunityData({ ...communityData, contactPerson: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Contact Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="organiser@devcommunity.org"
                      value={communityData.email}
                      onChange={(e) =>
                        setCommunityData({ ...communityData, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Phone / WhatsApp Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={communityData.phone}
                      onChange={(e) =>
                        setCommunityData({ ...communityData, phone: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Base City / Region <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jaipur, Chandigarh, Delhi NCR"
                      value={communityData.city}
                      onChange={(e) => setCommunityData({ ...communityData, city: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Community Size <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={communityData.communitySize}
                      onChange={(e) =>
                        setCommunityData({
                          ...communityData,
                          communitySize: e.target
                            .value as CommunityCollaborationInput["communitySize"],
                        })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="100-500">100 – 500 members</option>
                      <option value="500-2000">500 – 2,000 members</option>
                      <option value="2000-5000">2,000 – 5,000 members</option>
                      <option value="5000+">5,000+ members</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Technical Focus <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={communityData.techFocus}
                      onChange={(e) =>
                        setCommunityData({
                          ...communityData,
                          techFocus: e.target.value as CommunityCollaborationInput["techFocus"],
                        })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="Web & Full Stack">Web & Full Stack</option>
                      <option value="Cloud, DevOps & Systems">Cloud, DevOps & Systems</option>
                      <option value="Open Source">Open Source</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="General Developer Hub">General Developer Hub</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Proposed Joint Event / Collaboration Idea (PRD §13){" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Co-hosting the next RaibarX meetup edition, setting up a community track in NirmanX hackathon, or co-branded speaker session."
                    value={communityData.proposedEvent}
                    onChange={(e) =>
                      setCommunityData({ ...communityData, proposedEvent: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Resources & Reach to Share <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Direct WhatsApp/Discord announcement to 1,200 devs, Volunteer crew for event day, speaker recommendations from industry."
                    value={communityData.resourcesOffered}
                    onChange={(e) =>
                      setCommunityData({ ...communityData, resourcesOffered: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Additional Message
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any upcoming timeline, joint initiative goals or past collaborative events."
                    value={communityData.message}
                    onChange={(e) =>
                      setCommunityData({ ...communityData, message: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* ─── PATH 3: VENUE ──────────────────────────────────────────── */}
            {activePath === "venue" && (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Venue / Facility Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Innov8 Coworking or TechHub Auditorium"
                      value={venueData.organisation}
                      onChange={(e) => setVenueData({ ...venueData, organisation: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Venue Website / Photos Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourspace.com"
                      value={venueData.website}
                      onChange={(e) => setVenueData({ ...venueData, website: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Contact Person (Manager / In-charge) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Joshi"
                      value={venueData.contactPerson}
                      onChange={(e) =>
                        setVenueData({ ...venueData, contactPerson: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="events@venuehub.in"
                      value={venueData.email}
                      onChange={(e) => setVenueData({ ...venueData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={venueData.phone}
                      onChange={(e) => setVenueData({ ...venueData, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      City <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dehradun, Chandigarh, Gurgaon"
                      value={venueData.city}
                      onChange={(e) => setVenueData({ ...venueData, city: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Facility Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={venueData.facilityType}
                      onChange={(e) =>
                        setVenueData({
                          ...venueData,
                          facilityType: e.target.value as VenueCollaborationInput["facilityType"],
                        })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="Coworking Space">Coworking Space</option>
                      <option value="University / College Auditorium">
                        University / College Auditorium
                      </option>
                      <option value="Corporate Tech Campus">Corporate Tech Campus</option>
                      <option value="Startup Incubator / Hub">Startup Incubator / Hub</option>
                      <option value="Conference Center">Conference Center</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Seating Capacity <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={venueData.seatingCapacity}
                      onChange={(e) =>
                        setVenueData({
                          ...venueData,
                          seatingCapacity: e.target
                            .value as VenueCollaborationInput["seatingCapacity"],
                        })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="50-100">50 – 100 seats</option>
                      <option value="100-250">100 – 250 seats</option>
                      <option value="250-500">250 – 500 seats</option>
                      <option value="500+">500+ seats</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Address / Landmark <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Floor, Building, Road, Landmark, Pin code"
                    value={venueData.address}
                    onChange={(e) => setVenueData({ ...venueData, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Amenities Checkboxes */}
                <div>
                  <label className="mb-3 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Available Amenities <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      "High-speed WiFi",
                      "Projector & Screen",
                      "AV & Mics",
                      "Air Conditioning",
                      "Dedicated Stage",
                      "Power Outlets for Laptops",
                      "Parking Facility",
                      "Cafeteria / Coffee Area",
                      "Security & Access Control",
                    ].map((amenity) => {
                      const selected = venueData.amenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-medium transition-all ${
                            selected
                              ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                          }`}
                        >
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                              selected
                                ? "border-amber-500 bg-amber-500 text-black"
                                : "border-slate-700 bg-slate-900"
                            }`}
                          >
                            {selected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{amenity}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Event Formats Supported & Availability (PRD §13){" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Saturdays full day (9 AM – 6 PM), Weekday evening meetups (5 PM – 8 PM). Open to 24-hr weekend hackathons."
                    value={venueData.proposedEvent}
                    onChange={(e) => setVenueData({ ...venueData, proposedEvent: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Hosting Terms & Resources Offered <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Community sponsorship (free for open dev meetups in exchange for venue branding), subsidized commercial rate, or barter model."
                    value={venueData.resourcesOffered}
                    onChange={(e) =>
                      setVenueData({ ...venueData, resourcesOffered: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Additional Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any specific building entry guidelines, Metro proximity, or restrictions."
                    value={venueData.message}
                    onChange={(e) => setVenueData({ ...venueData, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* ─── PATH 4: SPONSOR ────────────────────────────────────────── */}
            {activePath === "sponsor" && (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Company / Brand Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Neon, Supabase, AWS, Cloudflare, Postman"
                      value={sponsorData.organisation}
                      onChange={(e) =>
                        setSponsorData({ ...sponsorData, organisation: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Company Website <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://company.com"
                      value={sponsorData.website}
                      onChange={(e) => setSponsorData({ ...sponsorData, website: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Representative Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Siddharth Mehra"
                      value={sponsorData.contactPerson}
                      onChange={(e) =>
                        setSponsorData({ ...sponsorData, contactPerson: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Designation / Role <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Head of DevRel, VP Marketing, Talent Lead"
                      value={sponsorData.roleDesignation}
                      onChange={(e) =>
                        setSponsorData({ ...sponsorData, roleDesignation: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Work Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="partner@company.com"
                      value={sponsorData.email}
                      onChange={(e) => setSponsorData({ ...sponsorData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={sponsorData.phone}
                      onChange={(e) => setSponsorData({ ...sponsorData, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Headquarters / Operating City <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bengaluru, San Francisco, Delhi NCR"
                      value={sponsorData.city}
                      onChange={(e) => setSponsorData({ ...sponsorData, city: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Target Audience Persona <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={sponsorData.targetAudience}
                      onChange={(e) =>
                        setSponsorData({
                          ...sponsorData,
                          targetAudience: e.target
                            .value as SponsorCollaborationInput["targetAudience"],
                        })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="Broad Developer Ecosystem">Broad Developer Ecosystem</option>
                      <option value="College Students & New Grads">
                        College Students & New Grads
                      </option>
                      <option value="Working Software Engineers & Tech Leads">
                        Working Software Engineers & Tech Leads
                      </option>
                      <option value="AI / ML Researchers & Builders">
                        AI / ML Researchers & Builders
                      </option>
                      <option value="Founders & Early-stage Builders">
                        Founders & Early-stage Builders
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Sponsorship Format / Scope <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={sponsorData.sponsorshipScope}
                      onChange={(e) =>
                        setSponsorData({
                          ...sponsorData,
                          sponsorshipScope: e.target
                            .value as SponsorCollaborationInput["sponsorshipScope"],
                        })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="Hackathon Title Sponsor">Hackathon Title Sponsor</option>
                      <option value="Hackathon Track / Bounty Sponsor">
                        Hackathon Track / Bounty Sponsor
                      </option>
                      <option value="Meetup Series Title / Annual Partner">
                        Meetup Series Title / Annual Partner
                      </option>
                      <option value="Workshop & Masterclass Series Partner">
                        Workshop & Masterclass Series Partner
                      </option>
                      <option value="Swag & Community Merchandise Partner">
                        Swag & Community Merchandise Partner
                      </option>
                      <option value="Cloud Credits / API Grant Partner">
                        Cloud Credits / API Grant Partner
                      </option>
                      <option value="Custom / Multi-City Partnership">
                        Custom / Multi-City Partnership
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Budget / Contribution Range <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={sponsorData.budgetTier}
                      onChange={(e) =>
                        setSponsorData({
                          ...sponsorData,
                          budgetTier: e.target.value as SponsorCollaborationInput["budgetTier"],
                        })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="₹1,50,000 – ₹5,00,000">₹1,50,000 – ₹5,00,000</option>
                      <option value="₹50,000 – ₹1,50,000">₹50,000 – ₹1,50,000</option>
                      <option value="₹5,00,000+">₹5,00,000+ (Platinum / Title)</option>
                      <option value="Under ₹50,000">Under ₹50,000</option>
                      <option value="In-Kind / API Credits / Product Licences">
                        In-Kind / API Credits / Product Licences
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Campaign Vision & Objectives (PRD §13) <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Drive adoption of our open-source vector DB, sponsor a ₹1,00,000 track bounty at NirmanX hackathon, conduct an expert session, and hire 2 interns."
                    value={sponsorData.proposedEvent}
                    onChange={(e) =>
                      setSponsorData({ ...sponsorData, proposedEvent: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Resources / Sponsorship Offered <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Cash grant of ₹2,00,000 + $500 cloud credits for all participants + 3 mentors from our engineering team + custom hoodies."
                    value={sponsorData.resourcesOffered}
                    onChange={(e) =>
                      setSponsorData({ ...sponsorData, resourcesOffered: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Additional Message / Timelines
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any specific target cities or upcoming quarterly marketing launch dates."
                    value={sponsorData.message}
                    onChange={(e) => setSponsorData({ ...sponsorData, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-6 sm:flex-row">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Protected with honeypot verification & CRM pipeline automation</span>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-500 sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Lodge Dossier...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Collaboration Proposal</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
