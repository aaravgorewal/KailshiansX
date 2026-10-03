"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  startChapterSchema,
  mentorSpeakerInquirySchema,
  type StartChapterInput,
  type MentorSpeakerInquiryInput,
} from "@/lib/validations/community-leads";
import { submitStartChapterInquiry, submitMentorSpeakerInquiry } from "@/server/community/actions";

interface CommunityModalsClientProps {
  initialOpenModal?: "chapter" | "mentor" | "speaker" | null;
}

export function CommunityModalsClient({ initialOpenModal = null }: CommunityModalsClientProps) {
  const [activeModal, setActiveModal] = React.useState<"chapter" | "mentor" | "speaker" | null>(
    initialOpenModal
  );

  // Expose trigger hooks via global window event or trigger buttons
  React.useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvt = e as CustomEvent<"chapter" | "mentor" | "speaker">;
      setActiveModal(customEvt.detail);
    };
    window.addEventListener("open-community-modal", handleOpen);
    return () => window.removeEventListener("open-community-modal", handleOpen);
  }, []);

  return (
    <>
      {activeModal === "chapter" && <StartChapterModal onClose={() => setActiveModal(null)} />}
      {(activeModal === "mentor" || activeModal === "speaker") && (
        <MentorSpeakerModal
          initialRole={activeModal === "mentor" ? "MENTOR" : "SPEAKER"}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}

// ─── Start a Chapter Modal ───────────────────────────────────────────────────
function StartChapterModal({ onClose }: { onClose: () => void }) {
  const [success, setSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StartChapterInput>({
    resolver: zodResolver(startChapterSchema),
    defaultValues: {
      collegeName: "",
      city: "",
      state: "",
      applicantName: "",
      applicantRole: "Student President / Club Lead",
      email: "",
      phone: "",
      estimatedStudents: "100-300 Students",
      message: "",
      honeypot: "",
    },
  });

  const onSubmit = async (values: StartChapterInput) => {
    setServerError(null);
    try {
      const res = await submitStartChapterInquiry(values);
      if (res.success) {
        setSuccess(true);
        reset();
      } else {
        setServerError(res.error || "Failed to submit chapter inquiry.");
      }
    } catch {
      setServerError("An unexpected network error occurred.");
    }
  };

  return (
    <div className="bg-surface-950/80 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 backdrop-blur-md">
      <div className="border-surface-800 bg-surface-900 relative my-8 w-full max-w-lg space-y-6 rounded-3xl border p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          className="text-surface-400 hover:bg-surface-800 absolute top-5 right-5 rounded-full p-2 transition hover:text-white"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        {success ? (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="size-7" />
            </div>
            <h3 className="text-surface-50 text-xl font-bold">Chapter Inquiry Submitted!</h3>
            <p className="text-surface-300 mx-auto max-w-sm text-xs">
              Our College Partnerships & Chapter team will review your proposal and get in touch
              within 48 hours to schedule a kickoff call.
            </p>
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Badge variant="brand" className="font-mono text-[10px]">
                College Chapters
              </Badge>
              <h3 className="text-surface-50 text-lg font-bold">Start a KailshiansX Chapter</h3>
              <p className="text-surface-400 text-xs">
                Bring official workshops, hackathon tracks, and founder sessions to your campus.
              </p>
            </div>

            {serverError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="size-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <input type="text" {...register("honeypot")} className="hidden" aria-hidden="true" />

            <div className="space-y-3">
              <div>
                <label className="text-surface-200 text-xs font-semibold">
                  College / University Name *
                </label>
                <input
                  type="text"
                  {...register("collegeName")}
                  placeholder="e.g. Graphic Era Hill University"
                  className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                />
                {errors.collegeName && (
                  <p className="mt-0.5 text-[10px] text-rose-400">{errors.collegeName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-200 text-xs font-semibold">City *</label>
                  <input
                    type="text"
                    {...register("city")}
                    placeholder="e.g. Dehradun"
                    className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                  {errors.city && (
                    <p className="mt-0.5 text-[10px] text-rose-400">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-surface-200 text-xs font-semibold">State *</label>
                  <input
                    type="text"
                    {...register("state")}
                    placeholder="e.g. Uttarakhand"
                    className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                  {errors.state && (
                    <p className="mt-0.5 text-[10px] text-rose-400">{errors.state.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-200 text-xs font-semibold">Your Name *</label>
                  <input
                    type="text"
                    {...register("applicantName")}
                    placeholder="Full Name"
                    className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                  {errors.applicantName && (
                    <p className="mt-0.5 text-[10px] text-rose-400">
                      {errors.applicantName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-surface-200 text-xs font-semibold">Your Role *</label>
                  <input
                    type="text"
                    {...register("applicantRole")}
                    placeholder="Student Lead / Faculty"
                    className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-200 text-xs font-semibold">Email *</label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="name@college.edu"
                    className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                  {errors.email && (
                    <p className="mt-0.5 text-[10px] text-rose-400">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-surface-200 text-xs font-semibold">Phone *</label>
                  <input
                    type="tel"
                    {...register("phone")}
                    placeholder="+91 9876543210"
                    className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                  {errors.phone && (
                    <p className="mt-0.5 text-[10px] text-rose-400">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-surface-200 text-xs font-semibold">
                  Estimated Student Audience *
                </label>
                <select
                  {...register("estimatedStudents")}
                  className="bg-surface-950 border-surface-800 text-surface-100 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="50-100 Students">50–100 Students</option>
                  <option value="100-300 Students">100–300 Students</option>
                  <option value="300-600 Students">300–600 Students</option>
                  <option value="600+ Students">600+ Students</option>
                </select>
              </div>

              <div>
                <label className="text-surface-200 text-xs font-semibold">
                  Chapter Vision & Message *
                </label>
                <textarea
                  rows={3}
                  {...register("message")}
                  placeholder="Share a short note about the coding culture at your campus and why a KailshiansX chapter will help."
                  className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full resize-none rounded-xl border p-3 text-xs focus:outline-none"
                />
                {errors.message && (
                  <p className="mt-0.5 text-[10px] text-rose-400">{errors.message.message}</p>
                )}
              </div>
            </div>

            <div className="border-surface-800 flex items-center justify-end gap-3 border-t pt-3">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5 size-3.5" />
                    Submit Chapter Proposal
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Mentor & Speaker Modal ──────────────────────────────────────────────────
function MentorSpeakerModal({
  initialRole,
  onClose,
}: {
  initialRole: "MENTOR" | "SPEAKER";
  onClose: () => void;
}) {
  const [success, setSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MentorSpeakerInquiryInput>({
    resolver: zodResolver(mentorSpeakerInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      roleType: initialRole === "MENTOR" ? "MENTOR" : "SPEAKER",
      designation: "",
      organisation: "",
      city: "",
      linkedin: "",
      github: "",
      expertiseAreas: "",
      talkTopicsOrMentorshipFocus: "",
      honeypot: "",
    },
  });

  const onSubmit = async (values: MentorSpeakerInquiryInput) => {
    setServerError(null);
    try {
      const res = await submitMentorSpeakerInquiry(values);
      if (res.success) {
        setSuccess(true);
        reset();
      } else {
        setServerError(res.error || "Submission failed. Please check form.");
      }
    } catch {
      setServerError("An unexpected error occurred.");
    }
  };

  return (
    <div className="bg-surface-950/80 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 backdrop-blur-md">
      <div className="border-surface-800 bg-surface-900 relative my-8 w-full max-w-lg space-y-6 rounded-3xl border p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          className="text-surface-400 hover:bg-surface-800 absolute top-5 right-5 rounded-full p-2 transition hover:text-white"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        {success ? (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/20 text-indigo-400">
              <CheckCircle2 className="size-7" />
            </div>
            <h3 className="text-surface-50 text-xl font-bold">Profile Submitted!</h3>
            <p className="text-surface-300 mx-auto max-w-sm text-xs">
              Thank you for sharing your expertise. Our speaker & mentor network leads will reach
              out for upcoming meetups, hackathons, and tech talks.
            </p>
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Badge
                variant="surface"
                className="border-indigo-500/30 font-mono text-[10px] text-indigo-400"
              >
                {initialRole === "MENTOR" ? "Mentorship Network" : "Speaker Bureau"}
              </Badge>
              <h3 className="text-surface-50 text-lg font-bold">
                {initialRole === "MENTOR"
                  ? "Become a KailshiansX Mentor"
                  : "Become a Featured Speaker"}
              </h3>
              <p className="text-surface-400 text-xs">
                Empower ambitious developers at hackathons, workshops, and flagship community
                conferences.
              </p>
            </div>

            {serverError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="size-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <input type="text" {...register("honeypot")} className="hidden" aria-hidden="true" />

            <div className="space-y-3">
              <div>
                <label className="text-surface-200 text-xs font-semibold">
                  I want to contribute as *
                </label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  <label className="border-surface-800 text-surface-300 hover:border-surface-600 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-500/10 has-[:checked]:text-brand-300 cursor-pointer rounded-xl border p-2 text-center text-xs font-semibold">
                    <input
                      type="radio"
                      value="MENTOR"
                      {...register("roleType")}
                      className="hidden"
                    />
                    Mentor
                  </label>
                  <label className="border-surface-800 text-surface-300 hover:border-surface-600 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-500/10 has-[:checked]:text-brand-300 cursor-pointer rounded-xl border p-2 text-center text-xs font-semibold">
                    <input
                      type="radio"
                      value="SPEAKER"
                      {...register("roleType")}
                      className="hidden"
                    />
                    Speaker
                  </label>
                  <label className="border-surface-800 text-surface-300 hover:border-surface-600 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-500/10 has-[:checked]:text-brand-300 cursor-pointer rounded-xl border p-2 text-center text-xs font-semibold">
                    <input type="radio" value="BOTH" {...register("roleType")} className="hidden" />
                    Both
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-200 text-xs font-semibold">Full Name *</label>
                  <input
                    type="text"
                    {...register("name")}
                    placeholder="Your Name"
                    className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                  {errors.name && (
                    <p className="mt-0.5 text-[10px] text-rose-400">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-surface-200 text-xs font-semibold">City *</label>
                  <input
                    type="text"
                    {...register("city")}
                    placeholder="e.g. Bengaluru, Dehradun"
                    className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-200 text-xs font-semibold">
                    Current Title / Role *
                  </label>
                  <input
                    type="text"
                    {...register("designation")}
                    placeholder="e.g. Senior Backend Engineer"
                    className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                  {errors.designation && (
                    <p className="mt-0.5 text-[10px] text-rose-400">{errors.designation.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-surface-200 text-xs font-semibold">Company / Org *</label>
                  <input
                    type="text"
                    {...register("organisation")}
                    placeholder="e.g. Google, Microsoft, Startup"
                    className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                  {errors.organisation && (
                    <p className="mt-0.5 text-[10px] text-rose-400">
                      {errors.organisation.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-200 text-xs font-semibold">Email *</label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="you@company.com"
                    className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                  {errors.email && (
                    <p className="mt-0.5 text-[10px] text-rose-400">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-surface-200 text-xs font-semibold">Phone *</label>
                  <input
                    type="tel"
                    {...register("phone")}
                    placeholder="+91 9876543210"
                    className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                  {errors.phone && (
                    <p className="mt-0.5 text-[10px] text-rose-400">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-200 text-xs font-semibold">
                    LinkedIn Profile *
                  </label>
                  <input
                    type="text"
                    {...register("linkedin")}
                    placeholder="linkedin.com/in/..."
                    className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                  {errors.linkedin && (
                    <p className="mt-0.5 text-[10px] text-rose-400">{errors.linkedin.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-surface-200 text-xs font-semibold">
                    GitHub / Portfolio
                  </label>
                  <input
                    type="text"
                    {...register("github")}
                    placeholder="github.com/..."
                    className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-surface-200 text-xs font-semibold">
                  Core Expertise Areas *
                </label>
                <input
                  type="text"
                  {...register("expertiseAreas")}
                  placeholder="e.g. Distributed Systems, Rust, AI Agents, Next.js, Solana"
                  className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                />
                {errors.expertiseAreas && (
                  <p className="mt-0.5 text-[10px] text-rose-400">
                    {errors.expertiseAreas.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-surface-200 text-xs font-semibold">
                  Talk Topics or Mentorship Vision *
                </label>
                <textarea
                  rows={3}
                  {...register("talkTopicsOrMentorshipFocus")}
                  placeholder="Describe technical topics you would like to present or areas you can mentor student builders in."
                  className="bg-surface-950 border-surface-800 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 mt-1 w-full resize-none rounded-xl border p-3 text-xs focus:outline-none"
                />
                {errors.talkTopicsOrMentorshipFocus && (
                  <p className="mt-0.5 text-[10px] text-rose-400">
                    {errors.talkTopicsOrMentorshipFocus.message}
                  </p>
                )}
              </div>
            </div>

            <div className="border-surface-800 flex items-center justify-end gap-3 border-t pt-3">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5 size-3.5" />
                    Join Speaker / Mentor Roster
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Global helper to open modal from anywhere on page
export function triggerCommunityModal(type: "chapter" | "mentor" | "speaker") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-community-modal", { detail: type }));
  }
}
