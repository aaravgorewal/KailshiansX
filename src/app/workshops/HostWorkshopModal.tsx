"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  Mail,
  Phone,
  BookOpen,
  MapPin,
  Clock,
  Layers,
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.46 1.46 0 1 0 0-2.92 1.46 1.46 0 0 0 0 2.92m1.37 9.74v-8.37H5.09v8.37z" />
    </svg>
  );
}
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  hostWorkshopSchema,
  WORKSHOP_CATEGORIES,
  type HostWorkshopInput,
} from "@/lib/validations/workshop-forms";
import { submitHostWorkshop } from "@/server/workshops/actions";

interface HostWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HostWorkshopModal({ isOpen, onClose }: HostWorkshopModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HostWorkshopInput>({
    resolver: zodResolver(hostWorkshopSchema),
    defaultValues: {
      category: "MERN",
      audienceLevel: "ALL_LEVELS",
      format: "IN_PERSON",
      expectedDuration: "Full Day (6 hours)",
      honeypot: "",
    },
  });

  const handleClose = () => {
    setIsSuccess(false);
    setServerError(null);
    onClose();
  };

  if (!isOpen) return null;

  const onSubmit = async (data: HostWorkshopInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await submitHostWorkshop(data);
      if (res.success) {
        setIsSuccess(true);
        setSuccessMessage(res.message || "Your proposal has been submitted.");
        reset();
      } else {
        setServerError(res.error || "Submission failed. Please try again.");
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md sm:p-6">
      <div className="border-surface-700/80 bg-surface-900 text-surface-100 relative my-8 w-full max-w-2xl rounded-3xl border p-6 shadow-2xl sm:p-9">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="text-surface-400 hover:text-surface-100 hover:bg-surface-800 absolute top-5 right-5 rounded-xl p-2 transition"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        {isSuccess ? (
          <div className="space-y-5 py-8 text-center">
            <div className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="space-y-2">
              <Badge variant="success">Proposal Submitted</Badge>
              <h2 className="text-surface-50 text-2xl font-bold tracking-tight">
                Thank You for Stepping Up!
              </h2>
              <p className="text-surface-300 mx-auto max-w-md text-sm">{successMessage}</p>
            </div>

            <div className="border-surface-800 bg-surface-950/60 text-surface-400 mx-auto max-w-md rounded-2xl border p-4 text-xs">
              Our Developer Relations team reviews all curriculum proposals and will coordinate
              speaker honorarium, venue setup, and participant outreach.
            </div>

            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1.5 pr-8">
              <div className="flex items-center gap-2">
                <Sparkles className="text-brand-400 size-4" />
                <Badge variant="brand">Speaker & Mentor Funnel</Badge>
              </div>
              <h2 className="text-surface-50 text-2xl font-bold tracking-tight">
                Host a Technical Workshop
              </h2>
              <p className="text-surface-400 text-xs">
                Share your engineering expertise with hundreds of hungry developers across India. We
                provide the venue, audience, equipment, and logistical support.
              </p>
            </div>

            {serverError && (
              <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                <AlertCircle className="size-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
            >
              {/* Anti-spam honeypot */}
              <input
                type="text"
                {...register("honeypot")}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">Your Full Name *</label>
                  <div className="relative">
                    <User className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <input
                      type="text"
                      {...register("name")}
                      placeholder="e.g. Rahul Sharma"
                      className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[11px] text-rose-400">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">Email Address *</label>
                  <div className="relative">
                    <Mail className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="you@company.com"
                      className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-400">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Contact & Profiles */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">
                    WhatsApp / Phone *
                  </label>
                  <div className="relative">
                    <Phone className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <input
                      type="tel"
                      {...register("phone")}
                      placeholder="+91 98765 43210"
                      className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-rose-400">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">
                    LinkedIn Profile *
                  </label>
                  <div className="relative">
                    <LinkedinIcon className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <input
                      type="text"
                      {...register("linkedin")}
                      placeholder="linkedin.com/in/username"
                      className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                    />
                  </div>
                  {errors.linkedin && (
                    <p className="text-[11px] text-rose-400">{errors.linkedin.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">
                    GitHub (Optional)
                  </label>
                  <div className="relative">
                    <GithubIcon className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <input
                      type="text"
                      {...register("github")}
                      placeholder="github.com/username"
                      className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Topic & Category */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">
                    Proposed Workshop Topic *
                  </label>
                  <div className="relative">
                    <BookOpen className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <input
                      type="text"
                      {...register("topic")}
                      placeholder="e.g. Distributed Caching with Redis & Go"
                      className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                    />
                  </div>
                  {errors.topic && (
                    <p className="text-[11px] text-rose-400">{errors.topic.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">Category *</label>
                  <div className="relative">
                    <Layers className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <select
                      {...register("category")}
                      className="border-surface-700 bg-surface-950 text-surface-100 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                    >
                      {WORKSHOP_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.category && (
                    <p className="text-[11px] text-rose-400">{errors.category.message}</p>
                  )}
                </div>
              </div>

              {/* Format, Audience & Duration */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">Format *</label>
                  <select
                    {...register("format")}
                    className="border-surface-700 bg-surface-950 text-surface-100 focus:border-brand-500 w-full rounded-xl border px-3 py-2.5 text-xs outline-none"
                  >
                    <option value="IN_PERSON">In-Person (Campus / Tech Park)</option>
                    <option value="VIRTUAL">Virtual Livestream</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">Audience Level *</label>
                  <select
                    {...register("audienceLevel")}
                    className="border-surface-700 bg-surface-950 text-surface-100 focus:border-brand-500 w-full rounded-xl border px-3 py-2.5 text-xs outline-none"
                  >
                    <option value="ALL_LEVELS">All Levels</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">Duration *</label>
                  <div className="relative">
                    <Clock className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <input
                      type="text"
                      {...register("expectedDuration")}
                      placeholder="e.g. 4 Hours / Half-Day"
                      className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                    />
                  </div>
                  {errors.expectedDuration && (
                    <p className="text-[11px] text-rose-400">{errors.expectedDuration.message}</p>
                  )}
                </div>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-surface-300 text-xs font-semibold">
                  Preferred City (If In-Person)
                </label>
                <div className="relative">
                  <MapPin className="text-surface-500 absolute top-3 left-3.5 size-4" />
                  <input
                    type="text"
                    {...register("city")}
                    placeholder="e.g. Jaipur, Chandigarh, Delhi NCR, Bangalore, or Remote"
                    className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Curriculum Outline */}
              <div className="space-y-1.5">
                <label className="text-surface-300 text-xs font-semibold">
                  Curriculum Outline & Hands-on Deliverables *
                </label>
                <textarea
                  rows={3}
                  {...register("curriculum")}
                  placeholder="Outline the modules, what project attendees will build, prerequisites, and key learning outcomes..."
                  className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border p-3 text-xs outline-none"
                />
                {errors.curriculum && (
                  <p className="text-[11px] text-rose-400">{errors.curriculum.message}</p>
                )}
              </div>

              {/* Prior Experience */}
              <div className="space-y-1.5">
                <label className="text-surface-300 text-xs font-semibold">
                  Prior Speaking or Engineering Background *
                </label>
                <textarea
                  rows={2}
                  {...register("experience")}
                  placeholder="Share a short bio, current role/company, or past talks/mentorship experience..."
                  className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border p-3 text-xs outline-none"
                />
                {errors.experience && (
                  <p className="text-[11px] text-rose-400">{errors.experience.message}</p>
                )}
              </div>

              <div className="border-surface-800 flex items-center justify-end gap-3 border-t pt-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Submitting Proposal...
                    </>
                  ) : (
                    "Submit Workshop Proposal"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
