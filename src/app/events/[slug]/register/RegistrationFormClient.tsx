"use client";

import * as React from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Ticket,
  User,
  HelpCircle,
  CreditCard,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Building,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

import { registrationFormSchema, type RegistrationFormData } from "@/lib/validations/registration";
import { initiateRegistration, verifyPaymentAndComplete } from "@/server/events/actions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface TicketTypeOption {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quota: number;
  isFree: boolean;
  soldCount: number;
}

export interface RegistrationFormClientProps {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  eventDate: string;
  venueName?: string | null;
  cityName?: string | null;
  ticketTypes: TicketTypeOption[];
  preselectedTierId?: string;
}

export function RegistrationFormClient({
  eventId,
  eventSlug,
  eventTitle,
  eventDate,
  venueName,
  cityName,
  ticketTypes,
  preselectedTierId,
}: RegistrationFormClientProps) {
  const router = useRouter();
  const [, setScriptLoaded] = React.useState(false);
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Default preselected tier if valid
  const defaultTierId =
    ticketTypes.find((t) => t.id === preselectedTierId)?.id || ticketTypes[0]?.id || "";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      ticketTypeId: defaultTierId,
      name: "",
      email: "",
      phone: "",
      college: "",
      city: "",
      tshirtSize: "M",
      dietaryPref: "VEG",
      github: "",
      linkedin: "",
      teamName: "",
      projectIdea: "",
      website_url_hp: "",
    },
    mode: "onBlur",
  });

  const selectedTierId = watch("ticketTypeId");
  const selectedTier = ticketTypes.find((t) => t.id === selectedTierId) || ticketTypes[0];
  const isFreeTier = selectedTier ? selectedTier.price === 0 : true;

  // Multi-step validation triggers
  const handleNextStep = async () => {
    setServerError(null);

    if (step === 1) {
      const valid = await trigger(["ticketTypeId"]);
      if (valid) setStep(2);
    } else if (step === 2) {
      const valid = await trigger(["name", "email", "phone", "college", "city"]);
      if (valid) setStep(3);
    } else if (step === 3) {
      const valid = await trigger([
        "tshirtSize",
        "dietaryPref",
        "github",
        "linkedin",
        "teamName",
        "projectIdea",
      ]);
      if (valid) setStep(4);
    }
  };

  const handlePrevStep = () => {
    setServerError(null);
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  // Form submission: Free or Razorpay Checkout
  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await initiateRegistration(eventId, data);

      if (!res.success) {
        setServerError(res.error || "Failed to initiate registration.");
        setIsSubmitting(false);
        return;
      }

      // Free RSVP flow -> redirect to confirmation page immediately
      if (res.isFree && res.redirectUrl) {
        router.push(res.redirectUrl);
        return;
      }

      // Paid Ticket Flow -> launch Razorpay Modal
      if (res.razorpayOrder) {
        if (!window.Razorpay) {
          // If script not ready, send them to recovery payment route
          router.push(`/events/${eventSlug}/register/pay?regId=${res.registrationId}`);
          return;
        }

        const rzp = new window.Razorpay({
          key: res.razorpayOrder.keyId,
          amount: res.razorpayOrder.amount,
          currency: res.razorpayOrder.currency,
          name: res.razorpayOrder.name,
          description: res.razorpayOrder.description,
          order_id: res.razorpayOrder.id,
          prefill: res.razorpayOrder.prefill,
          theme: {
            color: "#3d61fc",
          },
          handler: async (paymentResponse: RazorpayResponse) => {
            try {
              const verifyRes = await verifyPaymentAndComplete({
                registrationId: res.registrationId!,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              });

              if (verifyRes.success && verifyRes.redirectUrl) {
                router.push(verifyRes.redirectUrl);
              } else {
                setServerError(
                  verifyRes.error ||
                    "Payment was received, but server verification is finalizing. Check your email or ticket page."
                );
                setIsSubmitting(false);
              }
            } catch {
              setServerError("Verification error. Your seat is safe; check your email shortly.");
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
              // Provide recovery path notice
              setServerError(
                "Payment was not finished. You can resume your 10-minute seat hold from the payment page."
              );
            },
          },
        });

        rzp.open();
      }
    } catch (err: unknown) {
      console.error(err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const stepsMeta = [
    { num: 1, label: "Pass Tier", icon: <Ticket className="size-4" /> },
    { num: 2, label: "Builder Profile", icon: <User className="size-4" /> },
    { num: 3, label: "Custom Details", icon: <HelpCircle className="size-4" /> },
    { num: 4, label: "Review & Pay", icon: <CreditCard className="size-4" /> },
  ];

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="space-y-8">
        {/* Progress Step Header */}
        <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-4 backdrop-blur-md sm:p-6">
          <div className="flex items-center justify-between">
            {stepsMeta.map((s, idx) => {
              const isActive = step === s.num;
              const isDone = step > s.num;

              return (
                <React.Fragment key={s.num}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full font-mono text-xs font-bold transition-all sm:size-9",
                        isDone
                          ? "bg-emerald-500 text-white shadow-sm"
                          : isActive
                            ? "bg-brand-600 ring-brand-500/50 text-white ring-2"
                            : "bg-surface-800 text-surface-400"
                      )}
                    >
                      {isDone ? <Check className="size-4" /> : s.num}
                    </div>
                    <div className="hidden md:block">
                      <div className="text-surface-200 text-xs font-semibold">{s.label}</div>
                      <div className="text-surface-500 text-[10px]">
                        {isDone ? "Completed" : isActive ? "Active" : "Upcoming"}
                      </div>
                    </div>
                  </div>

                  {idx < stepsMeta.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 h-0.5 flex-1 transition-colors sm:mx-4",
                        step > s.num ? "bg-emerald-500/60" : "bg-surface-800"
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-300 shadow-lg">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">{serverError}</span>
              {serverError.includes("resume") && (
                <div className="mt-2">
                  <Link
                    href={`/events/${eventSlug}/register/pay`}
                    className="font-semibold text-rose-200 underline"
                  >
                    Resume pending payment here →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Honeypot hidden input */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            {...register("website_url_hp")}
          />

          {/* ═══════════════════════════════════════════════════════════════════
              STEP 1: PASS SELECTION
          ═══════════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-surface-50 text-xl font-bold">Select Your Pass Tier</h3>
                <p className="text-surface-400 mt-1 text-xs">
                  Choose a ticket tier. All passes include verified event admittance, certificate,
                  and speaker access.
                </p>
              </div>

              <div className="space-y-3">
                {ticketTypes.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  const isSoldOut = tier.soldCount >= tier.quota;
                  const isFree = tier.price === 0;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => !isSoldOut && setValue("ticketTypeId", tier.id)}
                      className={cn(
                        "flex cursor-pointer flex-col justify-between gap-4 rounded-2xl border p-5 transition-all select-none sm:flex-row sm:items-center sm:p-6",
                        isSelected
                          ? "border-brand-500 bg-brand-500/10 ring-brand-500 shadow-[0_0_20px_rgba(61,97,252,0.15)] ring-1"
                          : "border-surface-800 bg-surface-900/60 hover:border-surface-700 hover:bg-surface-900",
                        isSoldOut && "pointer-events-none cursor-not-allowed opacity-50"
                      )}
                    >
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "flex size-4 items-center justify-center rounded-full border",
                              isSelected ? "border-brand-400 bg-brand-500" : "border-surface-600"
                            )}
                          >
                            {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                          </span>
                          <h4 className="text-surface-50 text-lg font-bold">{tier.name}</h4>
                          <Badge variant={isFree ? "success" : "brand"} size="sm">
                            {isFree ? "Free Pass" : "Paid Pass"}
                          </Badge>
                          {isSoldOut && (
                            <Badge variant="destructive" size="sm">
                              Sold Out
                            </Badge>
                          )}
                        </div>

                        {tier.description && (
                          <p className="text-surface-400 pl-6 text-xs leading-relaxed">
                            {tier.description}
                          </p>
                        )}

                        <div className="text-surface-500 pt-1 pl-6 font-mono text-[11px]">
                          {isSoldOut ? "Quota full" : `Seats available • ${tier.quota} total quota`}
                        </div>
                      </div>

                      <div className="pl-6 text-right sm:pl-0 sm:text-right">
                        <div className="text-surface-50 text-2xl font-black">
                          {isFree ? (
                            <span className="text-emerald-400">Free</span>
                          ) : (
                            `₹${tier.price}`
                          )}
                        </div>
                        <span className="text-surface-400 font-mono text-[10px]">
                          {isFree ? "100% Sponsored" : "Inclusive of taxes"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors.ticketTypeId && (
                <p className="text-xs text-rose-400">{errors.ticketTypeId.message}</p>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={handleNextStep}
                  size="lg"
                  rightIcon={<ArrowRight className="size-4" />}
                >
                  Continue to Builder Profile
                </Button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              STEP 2: BUILDER PROFILE
          ═══════════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-surface-50 text-xl font-bold">Builder Profile</h3>
                <p className="text-surface-400 mt-1 text-xs">
                  We use your details to print your personalized badge and issue verifiable digital
                  certificates.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Full Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-surface-200 text-xs font-semibold">
                    Full Name (as on ID) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="text-surface-500 absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Aarav Sharma"
                      className="bg-surface-900 border-surface-700/80 text-surface-100 placeholder:text-surface-500 focus:ring-brand-500/50 h-11 w-full rounded-xl border pr-3 pl-10 text-sm focus:ring-2 focus:outline-none"
                      {...register("name")}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-rose-400">{errors.name.message}</p>}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-surface-200 text-xs font-semibold">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="text-surface-500 absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="aarav@example.com"
                      className="bg-surface-900 border-surface-700/80 text-surface-100 placeholder:text-surface-500 focus:ring-brand-500/50 h-11 w-full rounded-xl border pr-3 pl-10 text-sm focus:ring-2 focus:outline-none"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-surface-200 text-xs font-semibold">
                    Phone / WhatsApp <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="text-surface-500 absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="bg-surface-900 border-surface-700/80 text-surface-100 placeholder:text-surface-500 focus:ring-brand-500/50 h-11 w-full rounded-xl border pr-3 pl-10 text-sm focus:ring-2 focus:outline-none"
                      {...register("phone")}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-rose-400">{errors.phone.message}</p>}
                </div>

                {/* College / Organization */}
                <div className="space-y-1.5">
                  <label className="text-surface-200 text-xs font-semibold">
                    College / Organization
                  </label>
                  <div className="relative">
                    <Building className="text-surface-500 absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. MNIT Jaipur or Startup Inc."
                      className="bg-surface-900 border-surface-700/80 text-surface-100 placeholder:text-surface-500 focus:ring-brand-500/50 h-11 w-full rounded-xl border pr-3 pl-10 text-sm focus:ring-2 focus:outline-none"
                      {...register("college")}
                    />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-surface-200 text-xs font-semibold">City</label>
                  <div className="relative">
                    <MapPin className="text-surface-500 absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Jaipur, Delhi, Bengaluru"
                      className="bg-surface-900 border-surface-700/80 text-surface-100 placeholder:text-surface-500 focus:ring-brand-500/50 h-11 w-full rounded-xl border pr-3 pl-10 text-sm focus:ring-2 focus:outline-none"
                      {...register("city")}
                    />
                  </div>
                </div>
              </div>

              <div className="border-surface-800 flex items-center justify-between border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  leftIcon={<ChevronLeft className="size-4" />}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  rightIcon={<ArrowRight className="size-4" />}
                >
                  Next: Event Details
                </Button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              STEP 3: CUSTOM QUESTIONS & SWAG
          ═══════════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-surface-50 text-xl font-bold">
                  Custom Preferences &amp; Profiles
                </h3>
                <p className="text-surface-400 mt-1 text-xs">
                  Help mentors tailor discussions, allocate swag sizes, and organize hacker teams.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* T-Shirt Size */}
                <div className="space-y-1.5">
                  <label className="text-surface-200 text-xs font-semibold">T-Shirt Size</label>
                  <select
                    className="bg-surface-900 border-surface-700/80 text-surface-100 focus:ring-brand-500/50 h-11 w-full rounded-xl border px-3 text-sm focus:ring-2 focus:outline-none"
                    {...register("tshirtSize")}
                  >
                    <option value="S">S (Small)</option>
                    <option value="M">M (Medium)</option>
                    <option value="L">L (Large)</option>
                    <option value="XL">XL (Extra Large)</option>
                    <option value="2XL">2XL (Double Large)</option>
                  </select>
                </div>

                {/* Dietary Preference */}
                <div className="space-y-1.5">
                  <label className="text-surface-200 text-xs font-semibold">
                    Dietary Preference
                  </label>
                  <select
                    className="bg-surface-900 border-surface-700/80 text-surface-100 focus:ring-brand-500/50 h-11 w-full rounded-xl border px-3 text-sm focus:ring-2 focus:outline-none"
                    {...register("dietaryPref")}
                  >
                    <option value="VEG">Vegetarian</option>
                    <option value="NON_VEG">Non-Vegetarian</option>
                    <option value="VEGAN">Vegan</option>
                    <option value="JAIN">Jain</option>
                  </select>
                </div>

                {/* GitHub Handle */}
                <div className="space-y-1.5">
                  <label className="text-surface-200 text-xs font-semibold">GitHub Profile</label>
                  <input
                    type="text"
                    placeholder="github.com/username"
                    className="bg-surface-900 border-surface-700/80 text-surface-100 placeholder:text-surface-500 focus:ring-brand-500/50 h-11 w-full rounded-xl border px-3 text-sm focus:ring-2 focus:outline-none"
                    {...register("github")}
                  />
                </div>

                {/* LinkedIn Profile */}
                <div className="space-y-1.5">
                  <label className="text-surface-200 text-xs font-semibold">LinkedIn Profile</label>
                  <input
                    type="text"
                    placeholder="linkedin.com/in/username"
                    className="bg-surface-900 border-surface-700/80 text-surface-100 placeholder:text-surface-500 focus:ring-brand-500/50 h-11 w-full rounded-xl border px-3 text-sm focus:ring-2 focus:outline-none"
                    {...register("linkedin")}
                  />
                </div>

                {/* Team Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-surface-200 text-xs font-semibold">
                    Team Name (if participating with team)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ByteCraft Labs"
                    className="bg-surface-900 border-surface-700/80 text-surface-100 placeholder:text-surface-500 focus:ring-brand-500/50 h-11 w-full rounded-xl border px-3 text-sm focus:ring-2 focus:outline-none"
                    {...register("teamName")}
                  />
                </div>

                {/* Project Idea / Interest */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-surface-200 text-xs font-semibold">
                    What are you looking to build or learn?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Distributed database caches, building autonomous multi-agent tool loops, meeting co-founders..."
                    className="bg-surface-900 border-surface-700/80 text-surface-100 placeholder:text-surface-500 focus:ring-brand-500/50 w-full rounded-xl border p-3 text-sm focus:ring-2 focus:outline-none"
                    {...register("projectIdea")}
                  />
                </div>
              </div>

              <div className="border-surface-800 flex items-center justify-between border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  leftIcon={<ChevronLeft className="size-4" />}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  rightIcon={<ArrowRight className="size-4" />}
                >
                  Review &amp; Finalize
                </Button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              STEP 4: REVIEW & CONFIRM / PAY
          ═══════════════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-surface-50 text-xl font-bold">
                  Review &amp; Confirm Registration
                </h3>
                <p className="text-surface-400 mt-1 text-xs">
                  Please review your pass and attendee summary before finalizing.
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="border-surface-800 bg-surface-950/70 space-y-4 rounded-2xl border p-6">
                <div className="border-surface-800 flex items-center justify-between border-b pb-3">
                  <div>
                    <div className="text-surface-400 font-mono text-xs tracking-wider uppercase">
                      Gathering
                    </div>
                    <div className="text-surface-100 mt-0.5 text-base font-bold">{eventTitle}</div>
                    <div className="text-surface-400 text-xs">
                      {eventDate} • {venueName || "Venue"}
                      {cityName ? `, ${cityName}` : ""}
                    </div>
                  </div>
                  <Badge variant="brand" size="sm">
                    {selectedTier.name}
                  </Badge>
                </div>

                <div className="text-surface-300 grid grid-cols-2 gap-3 py-1 text-xs">
                  <div>
                    <span className="text-surface-500">Attendee:</span>{" "}
                    <span className="text-surface-100 font-semibold">{watch("name")}</span>
                  </div>
                  <div>
                    <span className="text-surface-500">Email:</span>{" "}
                    <span className="text-surface-200 font-medium">{watch("email")}</span>
                  </div>
                  <div>
                    <span className="text-surface-500">Phone:</span>{" "}
                    <span className="text-surface-200 font-medium">{watch("phone")}</span>
                  </div>
                  <div>
                    <span className="text-surface-500">College/Org:</span>{" "}
                    <span className="text-surface-200 font-medium">{watch("college") || "—"}</span>
                  </div>
                </div>

                <div className="border-surface-800 flex items-center justify-between border-t pt-3 text-sm">
                  <span className="text-surface-200 font-bold">Total Payable:</span>
                  <div className="text-right">
                    <span className="text-surface-50 text-2xl font-black">
                      {isFreeTier ? (
                        <span className="text-emerald-400">Free</span>
                      ) : (
                        `₹${selectedTier.price}`
                      )}
                    </span>
                    {isFreeTier && (
                      <div className="text-surface-400 font-mono text-[10px]">100% Free RSVP</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="border-surface-800 bg-surface-900/50 text-surface-400 space-y-2 rounded-xl border p-4 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-brand-400 size-4 shrink-0" />
                  <span>Your seat is reserved in real-time with atomic quota allocation.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-accent-400 size-4 shrink-0" />
                  <span>Instant QR pass generation + confirmation email dispatched.</span>
                </div>
              </div>

              <div className="border-surface-800 flex items-center justify-between border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                  leftIcon={<ChevronLeft className="size-4" />}
                >
                  Edit Information
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="shadow-brand-500/25 shadow-xl"
                  leftIcon={
                    isSubmitting ? <RefreshCw className="size-4 animate-spin" /> : undefined
                  }
                  rightIcon={!isSubmitting ? <ArrowRight className="size-4" /> : undefined}
                >
                  {isSubmitting
                    ? "Securing Seat..."
                    : isFreeTier
                      ? "Complete Free Registration"
                      : `Pay ₹${selectedTier.price} & Complete Registration`}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
