"use client";

import * as React from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";

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
    control,
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

  const selectedTierId = useWatch({ control, name: "ticketTypeId" });
  const watchedName = useWatch({ control, name: "name" });
  const watchedEmail = useWatch({ control, name: "email" });
  const watchedPhone = useWatch({ control, name: "phone" });
  const watchedCollege = useWatch({ control, name: "college" });
  const selectedTier = ticketTypes.find((t) => t.id === selectedTierId) || ticketTypes[0];
  const isFreeTier = selectedTier ? selectedTier.price === 0 : true;

  // Multi-step validation triggers
  const handleNextStep = async () => {
    setServerError(null);

    if (step === 1) {
      if (selectedTierId) {
        setStep(2);
      } else {
        const valid = await trigger(["ticketTypeId"]);
        if (valid) setStep(2);
      }
    } else if (step === 2) {
      const valid = await trigger(["name", "email", "phone"]);
      if (valid) setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    setServerError(null);
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    // Honeypot bot protection check
    if (data.website_url_hp) {
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      // 1. Initialize registration (atomic quota reservation)
      const initRes = await initiateRegistration(eventId, data);

      if (!initRes.success) {
        setServerError(initRes.error || "Failed to initiate registration.");
        setIsSubmitting(false);
        return;
      }

      // 2. Free Tier Flow: Confirmation is immediate
      if (initRes.redirectUrl) {
        router.push(initRes.redirectUrl);
        return;
      }

      // 3. Paid Tier Flow: Launch Razorpay standard checkout
      if (initRes.razorpayOrder) {
        if (!window.Razorpay) {
          router.push(`/events/${eventSlug}/register/pay?regId=${initRes.registrationId}`);
          return;
        }

        const primaryColor =
          typeof window !== "undefined"
            ? getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()
            : "";

        const options = {
          key: initRes.razorpayOrder.keyId,
          amount: initRes.razorpayOrder.amount,
          currency: initRes.razorpayOrder.currency,
          name: "KailshiansX",
          description: initRes.razorpayOrder.description,
          order_id: initRes.razorpayOrder.id,
          prefill: initRes.razorpayOrder.prefill,
          theme: {
            color: primaryColor,
          },
          handler: async (response: RazorpayResponse) => {
            try {
              const verifyRes = await verifyPaymentAndComplete({
                registrationId: initRes.registrationId!,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.success && verifyRes.redirectUrl) {
                router.push(verifyRes.redirectUrl);
              } else {
                setServerError(
                  verifyRes.error ||
                    "Payment was processed, but signature verification encountered an issue. Please contact support."
                );
                setIsSubmitting(false);
              }
            } catch {
              setServerError("Payment confirmation error. Please check your inbox or ticket link.");
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
              router.push(`/events/${eventSlug}/register/pay?regId=${initRes.registrationId}`);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch {
      setServerError("An unexpected error occurred while processing your pass. Please try again.");
      setIsSubmitting(false);
    }
  };

  const stepsMeta = [
    { num: 1, label: "Pass Tier" },
    { num: 2, label: "Your Info" },
    { num: 3, label: "Details" },
    { num: 4, label: "Review & Pay" },
  ];

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="border-border bg-card rounded-lg border p-5 sm:p-7">
        {/* Step Progress Bar */}
        <div className="border-border mb-6 border-b pb-5">
          <div className="flex items-center justify-between">
            {stepsMeta.map((s, idx) => {
              const isActive = step === s.num;
              const isDone = step > s.num;

              return (
                <React.Fragment key={s.num}>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full font-mono text-xs font-semibold transition-colors",
                        isDone
                          ? "bg-primary text-primary-foreground"
                          : isActive
                            ? "border-primary bg-background text-foreground border-2"
                            : "border-border bg-muted text-muted-foreground border"
                      )}
                    >
                      {isDone ? <Check className="size-3.5" aria-hidden="true" /> : s.num}
                    </div>
                    <span
                      className={cn(
                        "hidden text-xs font-medium sm:inline",
                        isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {s.label}
                    </span>
                  </div>

                  {idx < stepsMeta.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 h-px flex-1 transition-colors",
                        step > s.num ? "bg-primary" : "bg-border"
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
          <div className="border-destructive/40 bg-destructive/10 text-destructive mb-6 flex items-start gap-2.5 rounded-md border p-3.5 text-xs">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <span className="font-medium">{serverError}</span>
              {serverError.includes("resume") && (
                <div className="mt-1.5">
                  <Link
                    href={`/events/${eventSlug}/register/pay`}
                    className="font-medium underline hover:opacity-80"
                  >
                    Resume pending payment here →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Hidden registered inputs */}
          <input type="hidden" {...register("ticketTypeId")} />
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
            <div className="space-y-5">
              <div>
                <h3 className="text-foreground text-lg font-bold">Select Your Pass Tier</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Choose your pass. All tiers include full event admittance and verified digital
                  certificates.
                </p>
              </div>

              <div className="space-y-3">
                {ticketTypes.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  const isSoldOut = tier.quota > 0 && tier.soldCount >= tier.quota;
                  const isFree = tier.price === 0;

                  return (
                    <div
                      key={tier.id}
                      onClick={() =>
                        !isSoldOut &&
                        setValue("ticketTypeId", tier.id, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      className={cn(
                        "flex cursor-pointer flex-col justify-between gap-3 rounded-lg border p-4 transition-colors select-none sm:flex-row sm:items-center",
                        isSelected
                          ? "border-primary bg-primary/5 ring-primary ring-1"
                          : "border-border bg-card hover:border-primary/50",
                        isSoldOut && "pointer-events-none cursor-not-allowed opacity-50"
                      )}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex size-4 items-center justify-center rounded-full border",
                              isSelected ? "border-primary bg-primary" : "border-border"
                            )}
                          >
                            {isSelected && (
                              <span className="bg-primary-foreground size-1.5 rounded-full" />
                            )}
                          </span>
                          <h4 className="text-foreground text-base font-bold">{tier.name}</h4>
                          <Badge variant="neutral" size="sm">
                            {isFree ? "Free" : "Paid"}
                          </Badge>
                          {isSoldOut && (
                            <Badge variant="destructive" size="sm">
                              Sold Out
                            </Badge>
                          )}
                        </div>

                        {tier.description && (
                          <p className="text-muted-foreground pl-6 text-xs">{tier.description}</p>
                        )}

                        <div className="text-muted-foreground pl-6 font-mono text-xs">
                          {isSoldOut ? "Quota full" : `${tier.quota} total capacity`}
                        </div>
                      </div>

                      <div className="pl-6 text-left sm:pl-0 sm:text-right">
                        <div className="text-foreground text-xl font-bold">
                          {isFree ? "Free" : `₹${tier.price}`}
                        </div>
                        <span className="text-muted-foreground font-mono text-xs">
                          {isFree ? "Sponsored RSVP" : "Inclusive of taxes"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors.ticketTypeId && (
                <p className="text-destructive text-xs">{errors.ticketTypeId.message}</p>
              )}

              <div className="flex justify-end pt-3">
                <Button
                  type="button"
                  onClick={handleNextStep}
                  variant="primary"
                  size="default"
                  className="gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              STEP 2: BUILDER PROFILE
          ═══════════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-foreground text-lg font-bold">Attendee Information</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Used for entrance check-in and verifiable digital credentials.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="reg-name"
                  className="text-foreground mb-1.5 block text-xs font-semibold"
                >
                  Full Name (as on ID) <span className="text-destructive">*</span>
                </label>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-destructive mt-1 text-xs">{errors.name.message}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="reg-email"
                  className="text-foreground mb-1.5 block text-xs font-semibold"
                >
                  Email Address <span className="text-destructive">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="aarav@example.com"
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-destructive mt-1 text-xs">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="reg-phone"
                  className="text-foreground mb-1.5 block text-xs font-semibold"
                >
                  Phone / WhatsApp <span className="text-destructive">*</span>
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-destructive mt-1 text-xs">{errors.phone.message}</p>
                )}
              </div>

              {/* College / Organization */}
              <div>
                <label
                  htmlFor="reg-college"
                  className="text-foreground mb-1.5 block text-xs font-semibold"
                >
                  College or Organization
                </label>
                <input
                  id="reg-college"
                  type="text"
                  placeholder="e.g. MNIT Jaipur or Startup Inc."
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
                  {...register("college")}
                />
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="reg-city"
                  className="text-foreground mb-1.5 block text-xs font-semibold"
                >
                  City
                </label>
                <input
                  id="reg-city"
                  type="text"
                  placeholder="e.g. Jaipur, Delhi, Bengaluru"
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
                  {...register("city")}
                />
              </div>

              <div className="border-border flex items-center justify-between border-t pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  onClick={handlePrevStep}
                  className="gap-1.5"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  <span>Back</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="default"
                  onClick={handleNextStep}
                  className="gap-1.5"
                >
                  <span>Next</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              STEP 3: PREFERENCES
          ═══════════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-foreground text-lg font-bold">Preferences</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Help organizers plan logistics, allocate swag, and organize discussions.
                </p>
              </div>

              {/* T-Shirt Size */}
              <div>
                <label
                  htmlFor="reg-tshirt"
                  className="text-foreground mb-1.5 block text-xs font-semibold"
                >
                  T-Shirt Size
                </label>
                <select
                  id="reg-tshirt"
                  className="border-input bg-background text-foreground focus:border-primary focus:ring-ring h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
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
              <div>
                <label
                  htmlFor="reg-diet"
                  className="text-foreground mb-1.5 block text-xs font-semibold"
                >
                  Dietary Preference
                </label>
                <select
                  id="reg-diet"
                  className="border-input bg-background text-foreground focus:border-primary focus:ring-ring h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
                  {...register("dietaryPref")}
                >
                  <option value="VEG">Vegetarian</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                  <option value="JAIN">Jain</option>
                </select>
              </div>

              {/* GitHub Handle */}
              <div>
                <label
                  htmlFor="reg-github"
                  className="text-foreground mb-1.5 block text-xs font-semibold"
                >
                  GitHub Profile
                </label>
                <input
                  id="reg-github"
                  type="text"
                  placeholder="github.com/username"
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
                  {...register("github")}
                />
              </div>

              {/* LinkedIn Profile */}
              <div>
                <label
                  htmlFor="reg-linkedin"
                  className="text-foreground mb-1.5 block text-xs font-semibold"
                >
                  LinkedIn Profile
                </label>
                <input
                  id="reg-linkedin"
                  type="text"
                  placeholder="linkedin.com/in/username"
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
                  {...register("linkedin")}
                />
              </div>

              {/* Team Name */}
              <div>
                <label
                  htmlFor="reg-team"
                  className="text-foreground mb-1.5 block text-xs font-semibold"
                >
                  Team Name (optional)
                </label>
                <input
                  id="reg-team"
                  type="text"
                  placeholder="e.g. ByteCraft Labs"
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
                  {...register("teamName")}
                />
              </div>

              {/* Project Idea / Interest */}
              <div>
                <label
                  htmlFor="reg-idea"
                  className="text-foreground mb-1.5 block text-xs font-semibold"
                >
                  What are you looking to build or learn?
                </label>
                <textarea
                  id="reg-idea"
                  rows={3}
                  placeholder="e.g. Distributed database systems, autonomous agent tool loops, networking with builders..."
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-ring w-full rounded-md border p-3 text-sm focus:ring-1 focus:outline-none"
                  {...register("projectIdea")}
                />
              </div>

              <div className="border-border flex items-center justify-between border-t pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  onClick={handlePrevStep}
                  className="gap-1.5"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  <span>Back</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="default"
                  onClick={handleNextStep}
                  className="gap-1.5"
                >
                  <span>Review Summary</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              STEP 4: REVIEW & CONFIRM / PAY
          ═══════════════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-foreground text-lg font-bold">Review &amp; Confirm</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Review your pass and registration summary before securing your seat.
                </p>
              </div>

              {/* Clear Price Summary Box */}
              <div className="border-border bg-muted/40 space-y-3 rounded-lg border p-5">
                <div className="border-border flex items-center justify-between border-b pb-3">
                  <div>
                    <div className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
                      Event
                    </div>
                    <div className="text-foreground text-base font-bold">{eventTitle}</div>
                    <div className="text-muted-foreground text-xs">
                      {eventDate} · {venueName || "Venue"}
                      {cityName ? `, ${cityName}` : ""}
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {selectedTier.name}
                  </Badge>
                </div>

                <div className="text-muted-foreground grid grid-cols-1 gap-2 py-1 text-xs sm:grid-cols-2">
                  <div>
                    <span>Attendee:</span>{" "}
                    <span className="text-foreground font-medium">{watchedName}</span>
                  </div>
                  <div>
                    <span>Email:</span>{" "}
                    <span className="text-foreground font-medium">{watchedEmail}</span>
                  </div>
                  <div>
                    <span>Phone:</span>{" "}
                    <span className="text-foreground font-medium">{watchedPhone}</span>
                  </div>
                  <div>
                    <span>College/Org:</span>{" "}
                    <span className="text-foreground font-medium">{watchedCollege || "—"}</span>
                  </div>
                </div>

                <div className="border-border flex items-center justify-between border-t pt-3">
                  <span className="text-foreground text-sm font-bold">Total Payable:</span>
                  <div className="text-right">
                    <span className="text-foreground text-2xl font-bold">
                      {isFreeTier ? "Free" : `₹${selectedTier.price}`}
                    </span>
                    {isFreeTier && (
                      <div className="text-muted-foreground font-mono text-xs">Free RSVP</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Security notice */}
              <div className="border-border bg-muted/30 text-muted-foreground flex items-center gap-2 rounded-md border p-3 text-xs">
                <ShieldCheck className="text-foreground size-4 shrink-0" aria-hidden="true" />
                <span>
                  Seat is held atomically in real time. Digital pass is generated instantly upon
                  confirmation.
                </span>
              </div>

              <div className="border-border flex items-center justify-between border-t pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                  className="gap-1.5"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  <span>Edit details</span>
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="primary"
                  size="default"
                  className="gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isFreeTier
                          ? "Complete Registration"
                          : `Pay ₹${selectedTier.price} & Register`}
                      </span>
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
