"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Crown,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Send,
  Loader2,
  Clock,
  ArrowRight,
  Briefcase,
  Globe,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  stateLeadApplicationSchema,
  type StateLeadApplicationInput,
} from "@/lib/validations/community-leads";
import { applyStateLead } from "@/server/community/actions";

export function StateLeadFormClient() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successAppId, setSuccessAppId] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StateLeadApplicationInput>({
    resolver: zodResolver(stateLeadApplicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      state: "",
      city: "",
      citiesCovered: "",
      currentRole: "",
      linkedin: "",
      experience: "",
      leadershipEvidence: "",
      communityVision: "",
      whyKailshiansX: "",
      availabilityHours: "8-12 hours/week",
      honeypot: "",
    },
  });

  const onSubmit = async (values: StateLeadApplicationInput) => {
    setServerError(null);
    try {
      const res = await applyStateLead(values);
      if (res.success && res.applicationId) {
        setSuccessAppId(res.applicationId);
        reset();
      } else {
        setServerError(res.error || "Unable to submit application. Please review your entries.");
      }
    } catch {
      setServerError("An unexpected network error occurred. Please try again.");
    }
  };

  if (successAppId) {
    return (
      <div className="space-y-6 rounded-3xl border border-purple-500/30 bg-purple-950/20 p-8 text-center shadow-2xl backdrop-blur-md sm:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/20 text-purple-400">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold tracking-wider text-purple-400 uppercase">
            Stage 1: Executive Dossier Logged
          </span>
          <h3 className="text-surface-50 text-2xl font-bold">State Lead Application Received</h3>
          <p className="text-surface-300 mx-auto max-w-lg text-sm">
            Your leadership submission has entered executive review. A formal confirmation receipt
            has been sent to your email.
          </p>
        </div>

        <div className="bg-surface-950/80 border-surface-800 mx-auto max-w-md space-y-2 rounded-2xl border p-4 text-left">
          <div className="text-surface-400 text-[11px] font-semibold tracking-wider uppercase">
            Executive Dossier Reference
          </div>
          <div className="font-mono text-base font-bold text-purple-300 select-all">
            {successAppId}
          </div>
        </div>

        <div className="border-surface-800/80 bg-surface-900/60 mx-auto max-w-lg space-y-3 rounded-2xl border p-5 text-left">
          <p className="text-surface-200 text-xs font-semibold">
            Executive Selection Roadmap (PRD §12)
          </p>
          <div className="text-surface-400 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-medium text-purple-400">
              <CheckCircle2 className="size-3.5 shrink-0" />
              <span>1. Application Registered (Under Review)</span>
            </div>
            <div className="text-surface-300 flex items-center gap-2">
              <Clock className="text-brand-400 size-3.5 shrink-0" />
              <span>2. Executive Background & Ecosystem Screening (3–5 business days)</span>
            </div>
            <div className="text-surface-400 flex items-center gap-2">
              <ArrowRight className="text-surface-600 size-3.5 shrink-0" />
              <span>3. Strategic Vision Interview with Founder & Steering Committee</span>
            </div>
            <div className="text-surface-400 flex items-center gap-2">
              <ArrowRight className="text-surface-600 size-3.5 shrink-0" />
              <span>4. State Jurisdiction Charter, Budget Allocation & Lead Access</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSuccessAppId(null)}
          className="text-xs"
        >
          Submit Another Application
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border-surface-800 bg-surface-900/90 space-y-8 rounded-3xl border p-6 shadow-2xl backdrop-blur-sm sm:p-10"
    >
      <div className="border-surface-800 border-b pb-5">
        <h3 className="text-surface-50 flex items-center gap-2.5 text-xl font-bold">
          <Crown className="size-5 text-purple-400" />
          State Lead Executive Application
        </h3>
        <p className="text-surface-400 mt-1 text-xs">
          State Leads require proven experience leading technical communities, event production, or
          regional developer networks.
        </p>
      </div>

      {serverError && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Honeypot Spam Trap (Hidden) */}
      <input
        type="text"
        {...register("honeypot")}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {/* Section 1: Leadership Profile */}
      <div className="space-y-4">
        <h4 className="text-surface-200 text-xs font-bold tracking-wider uppercase">
          1. Leadership Profile
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-surface-200 text-xs font-semibold">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Rahul Rawat"
              className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 w-full rounded-xl border px-3.5 py-2.5 text-xs transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
            />
            {errors.name && <p className="text-[11px] text-rose-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-surface-200 text-xs font-semibold">
              Email Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="rahul@example.com"
              className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 w-full rounded-xl border px-3.5 py-2.5 text-xs transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
            />
            {errors.email && <p className="text-[11px] text-rose-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-surface-200 text-xs font-semibold">
              Phone / WhatsApp Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="tel"
              {...register("phone")}
              placeholder="+91 9876543210"
              className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 w-full rounded-xl border px-3.5 py-2.5 text-xs transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
            />
            {errors.phone && <p className="text-[11px] text-rose-400">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-surface-200 text-xs font-semibold">
              Current Role / Affiliation <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Briefcase className="text-surface-500 pointer-events-none absolute top-2.5 left-3 size-4" />
              <input
                type="text"
                {...register("currentRole")}
                placeholder="e.g. Lead SDE, Startup Founder, Tech Community Organizer"
                className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 w-full rounded-xl border py-2.5 pr-3.5 pl-9 text-xs transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
              />
            </div>
            {errors.currentRole && (
              <p className="text-[11px] text-rose-400">{errors.currentRole.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-surface-200 text-xs font-semibold">
            LinkedIn / Professional Portfolio <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            {...register("linkedin")}
            placeholder="https://linkedin.com/in/username"
            className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 w-full rounded-xl border px-3.5 py-2.5 text-xs transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
          />
          {errors.linkedin && (
            <p className="text-[11px] text-rose-400">{errors.linkedin.message}</p>
          )}
        </div>
      </div>

      {/* Section 2: Regional State & City Jurisdiction */}
      <div className="space-y-4">
        <h4 className="text-surface-200 text-xs font-bold tracking-wider uppercase">
          2. Regional Territory & Jurisdiction
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-surface-200 text-xs font-semibold">
              State / Region Applying For <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Globe className="text-surface-500 pointer-events-none absolute top-2.5 left-3 size-4" />
              <input
                type="text"
                {...register("state")}
                placeholder="e.g. Uttarakhand, Rajasthan, Punjab & Chandigarh, Delhi NCR"
                className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 w-full rounded-xl border py-2.5 pr-3.5 pl-9 text-xs transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
              />
            </div>
            {errors.state && <p className="text-[11px] text-rose-400">{errors.state.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-surface-200 text-xs font-semibold">
              Headquarters City <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="text-surface-500 pointer-events-none absolute top-2.5 left-3 size-4" />
              <input
                type="text"
                {...register("city")}
                placeholder="e.g. Dehradun or Jaipur"
                className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 w-full rounded-xl border py-2.5 pr-3.5 pl-9 text-xs transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
              />
            </div>
            {errors.city && <p className="text-[11px] text-rose-400">{errors.city.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-surface-200 text-xs font-semibold">
              Key Cities You Can Coordinate Across <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              {...register("citiesCovered")}
              placeholder="e.g. Dehradun, Haridwar, Roorkee, Rishikesh"
              className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 w-full rounded-xl border px-3.5 py-2.5 text-xs transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
            />
            {errors.citiesCovered && (
              <p className="text-[11px] text-rose-400">{errors.citiesCovered.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-surface-200 text-xs font-semibold">
              Weekly Leadership Commitment <span className="text-rose-400">*</span>
            </label>
            <select
              {...register("availabilityHours")}
              className="bg-surface-950 border-surface-800 text-surface-100 w-full rounded-xl border px-3.5 py-2.5 text-xs transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
            >
              <option value="8-12 hours/week">8–12 hours / week (Recommended)</option>
              <option value="12-16 hours/week">12–16 hours / week</option>
              <option value="16+ hours/week">16+ hours / week (Heavy dedication)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Leadership Record & State Vision */}
      <div className="space-y-4">
        <h4 className="text-surface-200 text-xs font-bold tracking-wider uppercase">
          3. Track Record & State Growth Vision
        </h4>

        <div className="space-y-1.5">
          <label className="text-surface-200 text-xs font-semibold">
            Engineering & Professional Background <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            {...register("experience")}
            placeholder="Share your engineering journey, software stacks built, work history, or notable open-source contributions."
            className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 w-full resize-none rounded-xl border p-3.5 text-xs transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
          />
          {errors.experience && (
            <p className="text-[11px] text-rose-400">{errors.experience.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-surface-200 text-xs font-semibold">
            Leadership & Community Organizing Track Record <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            {...register("leadershipEvidence")}
            placeholder="What technical communities, developer meetups, conferences, or student hackathons have you organized or scaled in the past? Detail numbers and impact."
            className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 w-full resize-none rounded-xl border p-3.5 text-xs transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
          />
          {errors.leadershipEvidence && (
            <p className="text-[11px] text-rose-400">{errors.leadershipEvidence.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-surface-200 text-xs font-semibold">
            Strategic Vision for KailshiansX in Your State <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            {...register("communityVision")}
            placeholder="How will you activate campus leads, partner with colleges, foster flagship meetup series, and create a regional developer powerhouse over the next 12 months?"
            className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 w-full resize-none rounded-xl border p-3.5 text-xs transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
          />
          {errors.communityVision && (
            <p className="text-[11px] text-rose-400">{errors.communityVision.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-surface-200 text-xs font-semibold">
            Why KailshiansX? <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={2}
            {...register("whyKailshiansX")}
            placeholder="What attracts you to KailshiansX and our builder-first developer mission?"
            className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 w-full resize-none rounded-xl border p-3.5 text-xs transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
          />
          {errors.whyKailshiansX && (
            <p className="text-[11px] text-rose-400">{errors.whyKailshiansX.message}</p>
          )}
        </div>
      </div>

      <div className="border-surface-800 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
        <p className="text-surface-400 flex items-center gap-1.5 text-[11px]">
          <Sparkles className="size-3.5 shrink-0 text-purple-400" />
          <span>
            State Lead appointments are vetted directly by the Founder & Steering Committee.
          </span>
        </p>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full min-w-[220px] bg-purple-600 hover:bg-purple-500 sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Submitting Executive Dossier...
            </>
          ) : (
            <>
              <Send className="mr-2 size-4" />
              Submit State Lead Application
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
