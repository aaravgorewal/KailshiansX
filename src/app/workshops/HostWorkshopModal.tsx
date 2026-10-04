"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
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
    <div className="bg-scrim fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 backdrop-blur-sm sm:p-6">
      <div className="border-border bg-card text-foreground relative my-8 w-full max-w-2xl rounded-lg border p-6 sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-5 right-5 rounded-md p-1.5 transition"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        {isSuccess ? (
          <div className="space-y-5 py-8 text-center">
            <div className="border-border bg-muted text-success mx-auto inline-flex size-12 items-center justify-center rounded-lg border">
              <CheckCircle2 className="size-6" />
            </div>

            <div className="space-y-2">
              <Badge variant="neutral">Proposal Submitted</Badge>
              <h2 className="text-foreground text-2xl font-bold tracking-tight">
                Thank You for Stepping Up
              </h2>
              <p className="text-muted-foreground mx-auto max-w-md text-sm">{successMessage}</p>
            </div>

            <div className="border-border bg-muted/50 text-muted-foreground mx-auto max-w-md rounded-md border p-4 text-xs">
              Our team reviews all curriculum proposals and coordinates venue setup, materials, and
              participant outreach.
            </div>

            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1.5 pr-8">
              <Badge variant="neutral">Host a Workshop</Badge>
              <h2 className="text-foreground text-2xl font-bold tracking-tight">
                Propose a Technical Workshop
              </h2>
              <p className="text-muted-foreground text-xs">
                Share your engineering expertise with developers across India. We provide the venue,
                audience, and logistical support.
              </p>
            </div>

            {serverError && (
              <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-3 rounded-md border p-3 text-xs">
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
                  <label className="text-foreground text-xs font-medium">Your Full Name *</label>
                  <div className="relative">
                    <User className="text-muted-foreground absolute top-3 left-3 size-4" />
                    <input
                      type="text"
                      {...register("name")}
                      placeholder="e.g. Rahul Sharma"
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-md border py-2 pr-3 pl-9 text-xs focus:outline-none"
                    />
                  </div>
                  {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-medium">Email Address *</label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-3 left-3 size-4" />
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="you@company.com"
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-md border py-2 pr-3 pl-9 text-xs focus:outline-none"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-destructive text-xs">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Contact & Profiles */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-medium">WhatsApp / Phone *</label>
                  <div className="relative">
                    <Phone className="text-muted-foreground absolute top-3 left-3 size-4" />
                    <input
                      type="tel"
                      {...register("phone")}
                      placeholder="+91 98765 43210"
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-md border py-2 pr-3 pl-9 text-xs focus:outline-none"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-destructive text-xs">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-medium">LinkedIn Profile *</label>
                  <div className="relative">
                    <LinkedinIcon className="text-muted-foreground absolute top-3 left-3 size-4" />
                    <input
                      type="text"
                      {...register("linkedin")}
                      placeholder="linkedin.com/in/username"
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-md border py-2 pr-3 pl-9 text-xs focus:outline-none"
                    />
                  </div>
                  {errors.linkedin && (
                    <p className="text-destructive text-xs">{errors.linkedin.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-medium">GitHub (Optional)</label>
                  <div className="relative">
                    <GithubIcon className="text-muted-foreground absolute top-3 left-3 size-4" />
                    <input
                      type="text"
                      {...register("github")}
                      placeholder="github.com/username"
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-md border py-2 pr-3 pl-9 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Topic & Category */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-medium">
                    Proposed Workshop Topic *
                  </label>
                  <div className="relative">
                    <BookOpen className="text-muted-foreground absolute top-3 left-3 size-4" />
                    <input
                      type="text"
                      {...register("topic")}
                      placeholder="e.g. Distributed Caching with Redis & Go"
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-md border py-2 pr-3 pl-9 text-xs focus:outline-none"
                    />
                  </div>
                  {errors.topic && (
                    <p className="text-destructive text-xs">{errors.topic.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-medium">Category *</label>
                  <div className="relative">
                    <Layers className="text-muted-foreground absolute top-3 left-3 size-4" />
                    <select
                      {...register("category")}
                      className="border-input bg-background text-foreground focus:border-primary w-full rounded-md border py-2 pr-3 pl-9 text-xs focus:outline-none"
                    >
                      {WORKSHOP_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.category && (
                    <p className="text-destructive text-xs">{errors.category.message}</p>
                  )}
                </div>
              </div>

              {/* Format, Audience & Duration */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-medium">Format *</label>
                  <select
                    {...register("format")}
                    className="border-input bg-background text-foreground focus:border-primary w-full rounded-md border px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="IN_PERSON">In-Person (Campus / Tech Park)</option>
                    <option value="VIRTUAL">Virtual Livestream</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-medium">Audience Level *</label>
                  <select
                    {...register("audienceLevel")}
                    className="border-input bg-background text-foreground focus:border-primary w-full rounded-md border px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="ALL_LEVELS">All Levels</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-medium">Duration *</label>
                  <div className="relative">
                    <Clock className="text-muted-foreground absolute top-3 left-3 size-4" />
                    <input
                      type="text"
                      {...register("expectedDuration")}
                      placeholder="e.g. 4 Hours / Half-Day"
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-md border py-2 pr-3 pl-9 text-xs focus:outline-none"
                    />
                  </div>
                  {errors.expectedDuration && (
                    <p className="text-destructive text-xs">{errors.expectedDuration.message}</p>
                  )}
                </div>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-medium">
                  Preferred City (If In-Person)
                </label>
                <div className="relative">
                  <MapPin className="text-muted-foreground absolute top-3 left-3 size-4" />
                  <input
                    type="text"
                    {...register("city")}
                    placeholder="e.g. Jaipur, Chandigarh, Delhi NCR, Bangalore, or Remote"
                    className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-md border py-2 pr-3 pl-9 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Curriculum Outline */}
              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-medium">
                  Curriculum Outline & Hands-on Deliverables *
                </label>
                <textarea
                  rows={3}
                  {...register("curriculum")}
                  placeholder="Outline the modules, what project attendees will build, prerequisites, and key learning outcomes..."
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-md border p-3 text-xs focus:outline-none"
                />
                {errors.curriculum && (
                  <p className="text-destructive text-xs">{errors.curriculum.message}</p>
                )}
              </div>

              {/* Prior Experience */}
              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-medium">
                  Prior Speaking or Engineering Background *
                </label>
                <textarea
                  rows={2}
                  {...register("experience")}
                  placeholder="Share a short bio, current role/company, or past talks/mentorship experience..."
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-md border p-3 text-xs focus:outline-none"
                />
                {errors.experience && (
                  <p className="text-destructive text-xs">{errors.experience.message}</p>
                )}
              </div>

              <div className="border-border flex items-center justify-end gap-3 border-t pt-3">
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
