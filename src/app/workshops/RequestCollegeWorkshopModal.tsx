"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  School,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Layers,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  requestCollegeWorkshopSchema,
  WORKSHOP_CATEGORIES,
  type RequestCollegeWorkshopInput,
} from "@/lib/validations/workshop-forms";
import { submitCollegeWorkshopRequest } from "@/server/workshops/actions";

interface RequestCollegeWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RequestCollegeWorkshopModal({ isOpen, onClose }: RequestCollegeWorkshopModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestCollegeWorkshopInput>({
    resolver: zodResolver(requestCollegeWorkshopSchema),
    defaultValues: {
      preferredCategory: "AI",
      expectedAttendance: "100-250",
      role: "Campus Lead / Student Coordinator",
      honeypot: "",
    },
  });

  const handleClose = () => {
    setIsSuccess(false);
    setServerError(null);
    onClose();
  };

  if (!isOpen) return null;

  const onSubmit = async (data: RequestCollegeWorkshopInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await submitCollegeWorkshopRequest(data);
      if (res.success) {
        setIsSuccess(true);
        setSuccessMessage(res.message || "Your college workshop request has been received.");
        reset();
      } else {
        setServerError(res.error || "Submission failed. Please check form details.");
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
              <Badge variant="success">Campus Request Logged</Badge>
              <h2 className="text-surface-50 text-2xl font-bold tracking-tight">
                Let&apos;s Bring KailshiansX to Your Campus
              </h2>
              <p className="text-surface-300 mx-auto max-w-md text-sm">{successMessage}</p>
            </div>

            <div className="border-surface-800 bg-surface-950/60 text-surface-400 mx-auto max-w-md rounded-2xl border p-4 text-xs">
              We bring Tier-1 industry mentors, hands-on curriculum, swags, and hackathon roadshows
              directly to student communities.
            </div>

            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1.5 pr-8">
              <div className="flex items-center gap-2">
                <School className="text-brand-400 size-4" />
                <Badge variant="brand">College Collaboration Funnel</Badge>
              </div>
              <h2 className="text-surface-50 text-2xl font-bold tracking-tight">
                Request a Workshop at Your College
              </h2>
              <p className="text-surface-400 text-xs">
                Are you a Campus Lead, Student Society Head, or Faculty Coordinator? Bring an
                official KailshiansX hands-on boot camp to your campus auditorium or labs.
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
              <input
                type="text"
                {...register("honeypot")}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* College Name & City */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">
                    College / University Name *
                  </label>
                  <div className="relative">
                    <Building2 className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <input
                      type="text"
                      {...register("collegeName")}
                      placeholder="e.g. MNIT Jaipur / IIT Delhi / PEC"
                      className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                    />
                  </div>
                  {errors.collegeName && (
                    <p className="text-[11px] text-rose-400">{errors.collegeName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">
                    Campus City & State *
                  </label>
                  <div className="relative">
                    <MapPin className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <input
                      type="text"
                      {...register("city")}
                      placeholder="e.g. Jaipur, Rajasthan"
                      className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                    />
                  </div>
                  {errors.city && (
                    <p className="text-[11px] text-rose-400">{errors.city.message}</p>
                  )}
                </div>
              </div>

              {/* Point of Contact */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">Your Full Name *</label>
                  <div className="relative">
                    <User className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <input
                      type="text"
                      {...register("contactPerson")}
                      placeholder="e.g. Ananya Sen"
                      className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                    />
                  </div>
                  {errors.contactPerson && (
                    <p className="text-[11px] text-rose-400">{errors.contactPerson.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">
                    Your Role at College *
                  </label>
                  <input
                    type="text"
                    {...register("role")}
                    placeholder="e.g. Coding Club Lead / Faculty Sponsor"
                    className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none"
                  />
                  {errors.role && (
                    <p className="text-[11px] text-rose-400">{errors.role.message}</p>
                  )}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">
                    Official / Personal Email *
                  </label>
                  <div className="relative">
                    <Mail className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="ananya@college.edu.in"
                      className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-400">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">
                    Contact Number / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <input
                      type="tel"
                      {...register("phone")}
                      placeholder="+91 98765 12345"
                      className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-rose-400">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Topic Preference & Turnout */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">
                    Preferred Topic *
                  </label>
                  <div className="relative">
                    <Layers className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <select
                      {...register("preferredCategory")}
                      className="border-surface-700 bg-surface-950 text-surface-100 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3 pl-10 text-xs outline-none"
                    >
                      {WORKSHOP_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="OTHER">Other Technical Focus</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">
                    Expected Turnout *
                  </label>
                  <div className="relative">
                    <Users className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <select
                      {...register("expectedAttendance")}
                      className="border-surface-700 bg-surface-950 text-surface-100 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3 pl-10 text-xs outline-none"
                    >
                      <option value="50-100">50 – 100 Students</option>
                      <option value="100-250">100 – 250 Students</option>
                      <option value="250-500">250 – 500 Students</option>
                      <option value="500+">500+ Campus-Wide</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-surface-300 text-xs font-semibold">
                    Proposed Timeline *
                  </label>
                  <div className="relative">
                    <Calendar className="text-surface-500 absolute top-3 left-3.5 size-4" />
                    <input
                      type="text"
                      {...register("preferredTimeline")}
                      placeholder="e.g. November 2026"
                      className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border py-2.5 pr-3.5 pl-10 text-xs outline-none"
                    />
                  </div>
                  {errors.preferredTimeline && (
                    <p className="text-[11px] text-rose-400">{errors.preferredTimeline.message}</p>
                  )}
                </div>
              </div>

              {/* Infrastructure */}
              <div className="space-y-1.5">
                <label className="text-surface-300 text-xs font-semibold">
                  Campus Facilities Available *
                </label>
                <textarea
                  rows={2}
                  {...register("facilities")}
                  placeholder="Specify available venues: Main Auditorium (capacity), Computer Labs with Wi-Fi, Projectors, Audio setup, etc."
                  className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border p-3 text-xs outline-none"
                />
                {errors.facilities && (
                  <p className="text-[11px] text-rose-400">{errors.facilities.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-surface-300 text-xs font-semibold">
                  Message / Goals (Optional)
                </label>
                <textarea
                  rows={2}
                  {...register("message")}
                  placeholder="Any particular student goals or prerequisites you'd like our instructors to know..."
                  className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 w-full rounded-xl border p-3 text-xs outline-none"
                />
              </div>

              <div className="border-surface-800 flex items-center justify-end gap-3 border-t pt-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    "Submit Campus Request"
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
