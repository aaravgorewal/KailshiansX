"use client";

import * as React from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Check } from "lucide-react";

import { registrationFormSchema, type RegistrationFormData } from "@/lib/validations/registration";
import { initiateRegistration, verifyPaymentAndComplete } from "@/server/events/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

export interface PrefilledUser {
  name: string;
  email: string;
  phone: string;
  college: string;
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
  prefilledUser?: PrefilledUser;
}

/**
 * Format Indian phone input to +91 XXXXX XXXXX or standard 10-digit format
 */
export function formatIndianPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    const trimmed = digits.slice(1);
    return `+91 ${trimmed.slice(0, 5)} ${trimmed.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    const trimmed = digits.slice(2);
    return `+91 ${trimmed.slice(0, 5)} ${trimmed.slice(5)}`;
  }
  return raw.trim();
}

/**
 * Validate Indian mobile phone number
 */
export function validateIndianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return "Phone number is required.";
  }
  let local10 = digits;
  if (digits.length === 11 && digits.startsWith("0")) {
    local10 = digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith("91")) {
    local10 = digits.slice(2);
  }
  if (local10.length !== 10 || !/^[6-9]/.test(local10)) {
    return "Please enter a valid 10-digit Indian phone number.";
  }
  return null;
}

export function RegistrationFormClient({
  eventId,
  eventSlug,
  ticketTypes,
  preselectedTierId,
  prefilledUser,
}: RegistrationFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [duplicateTicketUrl, setDuplicateTicketUrl] = React.useState<string | null>(null);

  const storageKey = `kailshiansx_reg_${eventSlug}`;

  // Default preselected tier if valid
  const defaultTierId =
    ticketTypes.find((t) => t.id === preselectedTierId)?.id || ticketTypes[0]?.id || "";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      ticketTypeId: defaultTierId,
      name: prefilledUser?.name || "",
      email: prefilledUser?.email || "",
      phone: prefilledUser?.phone ? formatIndianPhoneInput(prefilledUser.phone) : "",
      college: prefilledUser?.college || "",
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

  // Restore form state from sessionStorage
  React.useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.ticketTypeId && ticketTypes.some((t) => t.id === parsed.ticketTypeId)) {
          setValue("ticketTypeId", parsed.ticketTypeId);
        }
        if (parsed.name && !prefilledUser?.name) setValue("name", parsed.name);
        if (parsed.email && !prefilledUser?.email) setValue("email", parsed.email);
        if (parsed.phone && !prefilledUser?.phone) setValue("phone", parsed.phone);
        if (parsed.college && !prefilledUser?.college) setValue("college", parsed.college);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, [storageKey, setValue, ticketTypes, prefilledUser]);

  // Persist form state to sessionStorage
  React.useEffect(() => {
    try {
      const dataToSave = {
        ticketTypeId: selectedTierId,
        name: watchedName,
        email: watchedEmail,
        phone: watchedPhone,
        college: watchedCollege,
      };
      sessionStorage.setItem(storageKey, JSON.stringify(dataToSave));
    } catch {
      // sessionStorage unavailable
    }
  }, [storageKey, selectedTierId, watchedName, watchedEmail, watchedPhone, watchedCollege]);

  // Blur handler for phone formatting & validation
  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw.trim()) {
      return;
    }
    const formatted = formatIndianPhoneInput(raw);
    setValue("phone", formatted, { shouldValidate: false });

    const phoneError = validateIndianPhone(formatted);
    if (phoneError) {
      setError("phone", { type: "manual", message: phoneError });
    } else {
      clearErrors("phone");
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    if (data.website_url_hp) {
      return;
    }

    // Explicit phone check
    const phoneErr = validateIndianPhone(data.phone);
    if (phoneErr) {
      setError("phone", { type: "manual", message: phoneErr });
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setServerError(null);
    setDuplicateTicketUrl(null);

    try {
      // 1. Initialize registration (atomic quota reservation)
      const initRes = await initiateRegistration(eventId, data);

      if (!initRes.success) {
        if (initRes.errorCode === "DUPLICATE_REGISTRATION") {
          const existingRef = initRes.existingRegistrationId || initRes.existingRegistrationCode;
          if (existingRef) {
            setDuplicateTicketUrl(`/registration/${existingRef}`);
          }
          setServerError(
            initRes.error || "You are already registered for this event with this email."
          );
        } else {
          setServerError(initRes.error || "Failed to initiate registration.");
        }
        setIsSubmitting(false);
        return;
      }

      // 2. Free Tier Flow: Immediate success
      if (initRes.isFree || initRes.redirectUrl) {
        try {
          sessionStorage.removeItem(storageKey);
        } catch {
          // ignore
        }
        const targetUrl =
          initRes.redirectUrl ||
          `/registration/${initRes.registrationId || initRes.registrationCode}`;
        router.push(targetUrl);
        return;
      }

      // 3. Paid Tier Flow: Launch Razorpay standard checkout
      if (initRes.razorpayOrder) {
        if (!window.Razorpay) {
          setServerError(
            "Payment gateway could not be loaded. Please check your connection and retry."
          );
          setIsSubmitting(false);
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
            color: primaryColor || undefined,
          },
          handler: async (response: RazorpayResponse) => {
            try {
              const verifyRes = await verifyPaymentAndComplete({
                registrationId: initRes.registrationId!,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                try {
                  sessionStorage.removeItem(storageKey);
                } catch {
                  // ignore
                }
                const redirectId =
                  verifyRes.registrationId || initRes.registrationId || verifyRes.registrationCode;
                router.push(`/registration/${redirectId}`);
              } else {
                setServerError(
                  verifyRes.error ||
                    "Payment verification encountered an issue. Please contact support or try again."
                );
                setIsSubmitting(false);
              }
            } catch {
              setServerError("Payment confirmation error. Please try again.");
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
              setServerError("Payment not completed — try again");
            },
          },
        };

        interface RazorpayFailedPayload {
          error?: {
            description?: string;
            code?: string;
          };
        }

        interface ExtendedRazorpayInstance {
          open: () => void;
          on?: (event: string, handler: (payload: RazorpayFailedPayload) => void) => void;
        }

        const rzp = new window.Razorpay(options) as unknown as ExtendedRazorpayInstance;
        rzp.on?.("payment.failed", (res: RazorpayFailedPayload) => {
          setIsSubmitting(false);
          setServerError(
            res?.error?.description ||
              "Payment failed. Please try again or use another payment method."
          );
        });
        rzp.open();
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left" noValidate>
        {/* Hidden Honeypot */}
        <input
          type="text"
          {...register("website_url_hp")}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        {/* 1. Ticket choice (Radio rows, only if >1 ticket type) */}
        {ticketTypes.length > 1 && (
          <fieldset className="space-y-3">
            <legend className="text-foreground text-sm font-semibold">Select Ticket Tier</legend>
            <div role="radiogroup" className="space-y-2">
              {ticketTypes.map((tier) => {
                const isSelected = selectedTierId === tier.id;
                const isSoldOut = tier.quota > 0 && tier.soldCount >= tier.quota;

                return (
                  <label
                    key={tier.id}
                    htmlFor={`tier-${tier.id}`}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors select-none",
                      isSelected
                        ? "border-primary bg-card ring-primary ring-1"
                        : "border-border bg-card hover:bg-muted/30",
                      isSoldOut && "pointer-events-none opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <input
                        type="radio"
                        id={`tier-${tier.id}`}
                        value={tier.id}
                        {...register("ticketTypeId")}
                        disabled={isSoldOut}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "flex size-4 items-center justify-center rounded-full border transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/40 bg-background"
                        )}
                        aria-hidden="true"
                      >
                        {isSelected && <Check className="size-2.5 stroke-[3]" />}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-foreground text-sm font-semibold">{tier.name}</div>
                        {tier.description && (
                          <div className="text-muted-foreground line-clamp-1 text-xs">
                            {tier.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-foreground font-mono text-sm font-bold">
                        {tier.price === 0 ? "Free" : `₹${tier.price}`}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* 2. Four Fields: Full name, Email, Phone, College/Organisation */}
        <div className="space-y-4">
          <Input
            id="reg-name"
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Aarav Sharma"
            error={errors.name?.message}
            {...register("name", {
              onBlur: () => trigger("name"),
            })}
          />

          <Input
            id="reg-email"
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@example.com"
            error={errors.email?.message}
            {...register("email", {
              onBlur: () => trigger("email"),
            })}
          />

          <Input
            id="reg-phone"
            label="Phone (WhatsApp)"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            error={errors.phone?.message}
            {...register("phone")}
            onBlur={handlePhoneBlur}
          />

          <Input
            id="reg-college"
            label="College / Organisation"
            type="text"
            autoComplete="organization"
            placeholder="e.g. MNIT Jaipur or Razorpay"
            error={errors.college?.message}
            {...register("college", {
              onBlur: () => trigger("college"),
            })}
          />
        </div>

        {/* 3. Order Summary in a quiet bordered block */}
        <div className="border-border bg-card space-y-2.5 rounded-xl border p-4 text-sm">
          <div className="text-muted-foreground flex items-center justify-between">
            <span>Ticket</span>
            <span className="text-foreground font-medium">
              {selectedTier?.name || "General Pass"}
            </span>
          </div>
          <div className="text-muted-foreground flex items-center justify-between">
            <span>Price</span>
            <span className="text-foreground font-mono">
              {selectedTier?.price === 0 ? "Free" : `₹${selectedTier?.price}`}
            </span>
          </div>
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Taxes &amp; platform fees</span>
            <span className="font-mono">Included</span>
          </div>
          <div className="border-border flex items-center justify-between border-t pt-2.5">
            <span className="text-foreground font-semibold">Total</span>
            <span className="text-foreground font-mono text-base font-bold">
              {selectedTier?.price === 0 ? "Free" : `₹${selectedTier?.price}`}
            </span>
          </div>
        </div>

        {/* 4. Feedback Banners (Duplicate, Dismissed, Failure) */}
        {duplicateTicketUrl ? (
          <div
            role="alert"
            id="duplicate-registration-alert"
            className="border-border bg-card text-foreground space-y-2 rounded-xl border p-4 text-sm"
          >
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="text-foreground size-4 shrink-0" aria-hidden="true" />
              <span>You are already registered for this event.</span>
            </div>
            <p className="text-muted-foreground text-xs">
              A registration pass was already issued for {watchedEmail || "this email"}.
            </p>
            <div>
              <Link
                href={duplicateTicketUrl}
                className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-4 hover:opacity-80"
              >
                <span>View your existing ticket</span>
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : serverError ? (
          <div
            role="alert"
            id="registration-server-error"
            className={cn(
              "flex items-start gap-2.5 rounded-xl border p-4 text-sm",
              serverError.includes("Payment not completed")
                ? "border-border bg-muted/40 text-foreground"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            )}
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div className="flex-1 space-y-0.5">
              <p className="font-medium">{serverError}</p>
              <p className="text-xs opacity-85">
                {serverError.includes("Payment not completed")
                  ? "Your form data is saved. You can try again whenever ready."
                  : "Please check your inputs and try again."}
              </p>
            </div>
          </div>
        ) : null}

        {/* 5. Primary Action Button */}
        <Button
          type="submit"
          size="lg"
          variant="primary"
          disabled={isSubmitting}
          className="w-full text-base font-medium"
        >
          {isSubmitting
            ? "Processing..."
            : isFreeTier
              ? "Register — Free"
              : `Pay ₹${selectedTier?.price}`}
        </Button>
      </form>
    </>
  );
}
