"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Building,
  MapPin,
  Send,
  Loader2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { trackApplicationSubmit } from "@/lib/analytics";
import {
  campusLeadApplicationSchema,
  type CampusLeadApplicationInput,
} from "@/lib/validations/community-leads";
import { applyCampusLead } from "@/server/community/actions";

export function CampusLeadFormClient() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successAppId, setSuccessAppId] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CampusLeadApplicationInput>({
    resolver: zodResolver(campusLeadApplicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      college: "",
      city: "",
      courseYear: "",
      linkedin: "",
      experience: "",
      communityInvolvement: "",
      whyKailshiansX: "",
      availability: "5-10 hours/week",
      referredBy: "",
      honeypot: "",
    },
  });

  const onSubmit = async (values: CampusLeadApplicationInput) => {
    setServerError(null);
    try {
      const res = await applyCampusLead(values);
      if (res.success && res.applicationId) {
        trackApplicationSubmit({
          type: "campus_lead",
          roleOrTrack: values.college,
        });
        setSuccessAppId(res.applicationId);
        reset();
      } else {
        setServerError(res.error || "Unable to submit application. Please check your inputs.");
      }
    } catch {
      setServerError("An unexpected network error occurred. Please try again.");
    }
  };

  if (successAppId) {
    return (
      <div className="space-y-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center shadow-2xl backdrop-blur-md sm:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
            Stage 1: Application Logged
          </span>
          <h3 className="text-surface-50 text-2xl font-bold">You&apos;re in the Pipeline!</h3>
          <p className="text-surface-300 mx-auto max-w-lg text-sm">
            Your Campus Lead application has been registered. A confirmation email has been
            dispatched to your inbox.
          </p>
        </div>

        <div className="bg-surface-950/80 border-surface-800 mx-auto max-w-md space-y-2 rounded-2xl border p-4 text-left">
          <div className="text-surface-400 text-[11px] font-semibold tracking-wider uppercase">
            Application Reference
          </div>
          <div className="text-brand-300 font-mono text-base font-bold select-all">
            {successAppId}
          </div>
        </div>

        {/* Workflow indicator */}
        <div className="border-surface-800/80 bg-surface-900/60 mx-auto max-w-lg space-y-3 rounded-2xl border p-5 text-left">
          <p className="text-surface-200 text-xs font-semibold">What Happens Next?</p>
          <div className="text-surface-400 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-medium text-emerald-400">
              <CheckCircle2 className="size-3.5 shrink-0" />
              <span>1. Application Received (Logged)</span>
            </div>
            <div className="text-surface-300 flex items-center gap-2">
              <Clock className="text-brand-400 size-3.5 shrink-0" />
              <span>2. Profile & Campus Standing Screening (2–3 days)</span>
            </div>
            <div className="text-surface-400 flex items-center gap-2">
              <ArrowRight className="text-surface-600 size-3.5 shrink-0" />
              <span>3. 1:1 Video Interview with Community Core Team</span>
            </div>
            <div className="text-surface-400 flex items-center gap-2">
              <ArrowRight className="text-surface-600 size-3.5 shrink-0" />
              <span>4. Final Selection, Induction Kit & Lead Badge</span>
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
          <GraduationCap className="text-brand-400 size-5" />
          Campus Lead Application Form
        </h3>
        <p className="text-surface-400 mt-1 text-xs">
          Fill out all fields thoughtfully. We evaluate genuine builder passion, club involvement,
          and leadership initiative.
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

      {/* Section 1: Personal Details */}
      <div className="space-y-4">
        <h4 className="text-surface-200 text-xs font-bold tracking-wider uppercase">
          1. Personal Information
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-surface-200 text-xs font-semibold">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Aayush Negi"
              className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border px-3.5 py-2.5 text-xs transition focus:ring-2 focus:outline-none"
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
              placeholder="aayush@geu.ac.in"
              className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border px-3.5 py-2.5 text-xs transition focus:ring-2 focus:outline-none"
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
              className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border px-3.5 py-2.5 text-xs transition focus:ring-2 focus:outline-none"
            />
            {errors.phone && <p className="text-[11px] text-rose-400">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-surface-200 text-xs font-semibold">
              LinkedIn Profile or GitHub <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              {...register("linkedin")}
              placeholder="linkedin.com/in/username"
              className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border px-3.5 py-2.5 text-xs transition focus:ring-2 focus:outline-none"
            />
            {errors.linkedin && (
              <p className="text-[11px] text-rose-400">{errors.linkedin.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: College & Campus Standing */}
      <div className="space-y-4">
        <h4 className="text-surface-200 text-xs font-bold tracking-wider uppercase">
          2. College & Academic Information
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-surface-200 text-xs font-semibold">
              College / University Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Building className="text-surface-500 pointer-events-none absolute top-2.5 left-3 size-4" />
              <input
                type="text"
                {...register("college")}
                placeholder="e.g. Graphic Era University"
                className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border py-2.5 pr-3.5 pl-9 text-xs transition focus:ring-2 focus:outline-none"
              />
            </div>
            {errors.college && (
              <p className="text-[11px] text-rose-400">{errors.college.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-surface-200 text-xs font-semibold">
              City <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="text-surface-500 pointer-events-none absolute top-2.5 left-3 size-4" />
              <input
                type="text"
                {...register("city")}
                placeholder="e.g. Dehradun"
                className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border py-2.5 pr-3.5 pl-9 text-xs transition focus:ring-2 focus:outline-none"
              />
            </div>
            {errors.city && <p className="text-[11px] text-rose-400">{errors.city.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-surface-200 text-xs font-semibold">
              Degree Course & Year <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              {...register("courseYear")}
              placeholder="e.g. B.Tech Computer Science - 3rd Year"
              className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border px-3.5 py-2.5 text-xs transition focus:ring-2 focus:outline-none"
            />
            {errors.courseYear && (
              <p className="text-[11px] text-rose-400">{errors.courseYear.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-surface-200 text-xs font-semibold">
              Weekly Availability <span className="text-rose-400">*</span>
            </label>
            <select
              {...register("availability")}
              className="bg-surface-950 border-surface-800 text-surface-100 focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border px-3.5 py-2.5 text-xs transition focus:ring-2 focus:outline-none"
            >
              <option value="5-10 hours/week">5–10 hours / week (Recommended)</option>
              <option value="10-15 hours/week">10–15 hours / week</option>
              <option value="15+ hours/week">15+ hours / week (Deep commitment)</option>
            </select>
            {errors.availability && (
              <p className="text-[11px] text-rose-400">{errors.availability.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Technical Background & Leadership */}
      <div className="space-y-4">
        <h4 className="text-surface-200 text-xs font-bold tracking-wider uppercase">
          3. Technical Background & Community Experience
        </h4>

        <div className="space-y-1.5">
          <label className="text-surface-200 text-xs font-semibold">
            Technical & Project Experience <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            {...register("experience")}
            placeholder="What technologies, stacks, or tools have you built with? (e.g. Next.js, Rust, Docker, Python AI models, etc.)"
            className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:ring-brand-500/20 w-full resize-none rounded-xl border p-3.5 text-xs transition focus:ring-2 focus:outline-none"
          />
          {errors.experience && (
            <p className="text-[11px] text-rose-400">{errors.experience.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-surface-200 text-xs font-semibold">
            Campus Club / Community Involvement <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            {...register("communityInvolvement")}
            placeholder="Have you led, organized, or participated in coding clubs, hackathons, or student societies?"
            className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:ring-brand-500/20 w-full resize-none rounded-xl border p-3.5 text-xs transition focus:ring-2 focus:outline-none"
          />
          {errors.communityInvolvement && (
            <p className="text-[11px] text-rose-400">{errors.communityInvolvement.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-surface-200 text-xs font-semibold">
            Why do you want to lead KailshiansX at your campus?{" "}
            <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            {...register("whyKailshiansX")}
            placeholder="What will you change about the developer culture at your college? What kind of hackathons and tech talks do you envision?"
            className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:ring-brand-500/20 w-full resize-none rounded-xl border p-3.5 text-xs transition focus:ring-2 focus:outline-none"
          />
          {errors.whyKailshiansX && (
            <p className="text-[11px] text-rose-400">{errors.whyKailshiansX.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-surface-200 text-xs font-semibold">Referred By (Optional)</label>
          <input
            type="text"
            {...register("referredBy")}
            placeholder="Name or email of current Lead or Core Team member (if applicable)"
            className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border px-3.5 py-2.5 text-xs transition focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      <div className="border-surface-800 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
        <p className="text-surface-400 flex items-center gap-1.5 text-[11px]">
          <Sparkles className="text-brand-400 size-3.5 shrink-0" />
          <span>Applications are screened on a rolling weekly basis.</span>
        </p>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full min-w-[200px] sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Submitting Application...
            </>
          ) : (
            <>
              <Send className="mr-2 size-4" />
              Submit Campus Lead Application
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
