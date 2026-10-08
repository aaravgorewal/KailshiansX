"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { partnerInquirySchema, type PartnerInquiryInput } from "@/lib/validations/collaborations";
import { submitPartnerInquiry } from "@/server/collaborations/actions";
import { cn } from "@/lib/utils";

const PARTNER_OPTIONS = [
  { id: "partner-type-college", value: "COLLEGE", label: "College" },
  { id: "partner-type-community", value: "COMMUNITY", label: "Community" },
  { id: "partner-type-venue", value: "VENUE", label: "Venue" },
  { id: "partner-type-sponsor", value: "SPONSOR", label: "Sponsor" },
] as const;

function formatIndianPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  let clean10 = digits;
  if (clean10.startsWith("91") && clean10.length === 12) {
    clean10 = clean10.slice(2);
  } else if (clean10.startsWith("0") && clean10.length === 11) {
    clean10 = clean10.slice(1);
  }
  if (clean10.length === 10) {
    return `+91 ${clean10.slice(0, 5)} ${clean10.slice(5)}`;
  }
  return value;
}

export function PartnerForm() {
  const [partnerType, setPartnerType] = useState<PartnerInquiryInput["type"]>("COLLEGE");
  const [organisation, setOrganisation] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedMeta, setSubmittedMeta] = useState<{
    organisation: string;
    email: string;
    type: string;
  } | null>(null);

  const validateField = (field: keyof PartnerInquiryInput, value: string) => {
    const currentPayload: PartnerInquiryInput = {
      type: partnerType,
      organisation: field === "organisation" ? value : organisation,
      contactPerson: field === "contactPerson" ? value : contactPerson,
      email: field === "email" ? value : email,
      phone: field === "phone" ? value : phone,
      city: field === "city" ? value : city,
      website: field === "website" ? value : website,
      message: field === "message" ? value : message,
      honeypot,
    };

    const res = partnerInquirySchema.safeParse(currentPayload);
    if (!res.success) {
      const fieldIssues = res.error.flatten().fieldErrors;
      const issue = fieldIssues[field]?.[0];
      if (issue) {
        setErrors((prev) => ({ ...prev, [field]: issue }));
        return;
      }
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const payload: PartnerInquiryInput = {
      type: partnerType,
      organisation,
      contactPerson,
      email,
      phone,
      city,
      website,
      message,
      honeypot,
    };

    const validation = partnerInquirySchema.safeParse(payload);
    if (!validation.success) {
      const fieldIssues = validation.error.flatten().fieldErrors;
      const formatted: Record<string, string> = {};
      for (const [k, v] of Object.entries(fieldIssues)) {
        if (v?.[0]) formatted[k] = v[0];
      }
      setErrors(formatted);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await submitPartnerInquiry(payload);
      if (res.success) {
        setSubmittedMeta({
          organisation: payload.organisation,
          email: payload.email,
          type: payload.type,
        });
        setIsSuccess(true);
      } else {
        if (res.fieldErrors) {
          const formatted: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.fieldErrors)) {
            if (v?.[0]) formatted[k] = v[0];
          }
          setErrors(formatted);
        }
        setServerError(res.error || "Submission failed. Please check the form and try again.");
      }
    } catch (err) {
      console.error("[PartnerForm Error]:", err);
      setServerError("Network error. Please try submitting again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && submittedMeta) {
    return (
      <div
        id="partner-success-state"
        className="border-border bg-card space-y-4 rounded-2xl border p-8 text-center sm:p-10"
      >
        <div className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs">
          <CheckCircle2 className="text-foreground size-3.5" aria-hidden="true" />
          <span>Inquiry Received</span>
        </div>
        <h3 className="font-display text-foreground text-2xl font-bold tracking-tight">
          Thank you for reaching out
        </h3>
        <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed">
          We have received your partnership inquiry for{" "}
          <span className="text-foreground font-semibold">{submittedMeta.organisation}</span>. An
          acknowledgement has been sent to{" "}
          <span className="text-foreground font-mono">{submittedMeta.email}</span>. Our team will
          review your proposal and get in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      id="partner-form"
      onSubmit={handleSubmit}
      className="border-border bg-card space-y-6 rounded-2xl border p-6 sm:p-8"
      noValidate
    >
      {/* Honeypot hidden input */}
      <input
        type="text"
        name="honeypot"
        id="partner-honeypot"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
      />

      {/* Role Selection Radio */}
      <fieldset className="space-y-2">
        <legend className="text-foreground text-sm font-medium select-none">I am a:</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PARTNER_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              htmlFor={opt.id}
              className={cn(
                "flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-center text-sm font-medium transition-colors",
                partnerType === opt.value
                  ? "border-primary bg-primary/10 text-foreground font-semibold"
                  : "border-border bg-card hover:bg-muted/30 text-muted-foreground"
              )}
            >
              <input
                type="radio"
                id={opt.id}
                name="partnerType"
                value={opt.value}
                checked={partnerType === opt.value}
                onChange={() => {
                  setPartnerType(opt.value);
                  validateField("type", opt.value);
                }}
                className="accent-primary size-4"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        {errors.type && (
          <p id="partner-type-error" className="text-destructive mt-1 text-xs">
            {errors.type}
          </p>
        )}
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Organisation */}
        <div className="space-y-1.5">
          <label
            htmlFor="partner-organisation"
            className="text-muted-foreground font-mono text-xs tracking-wider uppercase"
          >
            Organisation <span className="text-destructive">*</span>
          </label>
          <Input
            id="partner-organisation"
            name="organisation"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
            onBlur={() => validateField("organisation", organisation)}
            placeholder="e.g. MNIT Jaipur / GDG / AWS"
            aria-invalid={!!errors.organisation}
            aria-describedby={errors.organisation ? "partner-organisation-error" : undefined}
            required
          />
          {errors.organisation && (
            <p id="partner-organisation-error" className="text-destructive text-xs">
              {errors.organisation}
            </p>
          )}
        </div>

        {/* Contact Person */}
        <div className="space-y-1.5">
          <label
            htmlFor="partner-contact"
            className="text-muted-foreground font-mono text-xs tracking-wider uppercase"
          >
            Contact person <span className="text-destructive">*</span>
          </label>
          <Input
            id="partner-contact"
            name="contactPerson"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            onBlur={() => validateField("contactPerson", contactPerson)}
            placeholder="Full name"
            aria-invalid={!!errors.contactPerson}
            aria-describedby={errors.contactPerson ? "partner-contact-error" : undefined}
            required
          />
          {errors.contactPerson && (
            <p id="partner-contact-error" className="text-destructive text-xs">
              {errors.contactPerson}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="partner-email"
            className="text-muted-foreground font-mono text-xs tracking-wider uppercase"
          >
            Email <span className="text-destructive">*</span>
          </label>
          <Input
            id="partner-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => validateField("email", email)}
            placeholder="partner@organisation.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "partner-email-error" : undefined}
            required
          />
          {errors.email && (
            <p id="partner-email-error" className="text-destructive text-xs">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label
            htmlFor="partner-phone"
            className="text-muted-foreground font-mono text-xs tracking-wider uppercase"
          >
            Phone <span className="text-destructive">*</span>
          </label>
          <Input
            id="partner-phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => {
              const formatted = formatIndianPhone(phone);
              setPhone(formatted);
              validateField("phone", formatted);
            }}
            placeholder="+91 98765 43210"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "partner-phone-error" : undefined}
            required
          />
          {errors.phone && (
            <p id="partner-phone-error" className="text-destructive text-xs">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* City */}
        <div className="space-y-1.5">
          <label
            htmlFor="partner-city"
            className="text-muted-foreground font-mono text-xs tracking-wider uppercase"
          >
            City <span className="text-destructive">*</span>
          </label>
          <Input
            id="partner-city"
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={() => validateField("city", city)}
            placeholder="e.g. Jaipur, Bengaluru, Delhi"
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? "partner-city-error" : undefined}
            required
          />
          {errors.city && (
            <p id="partner-city-error" className="text-destructive text-xs">
              {errors.city}
            </p>
          )}
        </div>

        {/* Website or social link */}
        <div className="space-y-1.5">
          <label
            htmlFor="partner-website"
            className="text-muted-foreground font-mono text-xs tracking-wider uppercase"
          >
            Website or social link
          </label>
          <Input
            id="partner-website"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            onBlur={() => validateField("website", website)}
            placeholder="https://... or @handle"
            aria-invalid={!!errors.website}
            aria-describedby={errors.website ? "partner-website-error" : undefined}
          />
          {errors.website && (
            <p id="partner-website-error" className="text-destructive text-xs">
              {errors.website}
            </p>
          )}
        </div>
      </div>

      {/* Message Textarea */}
      <div className="space-y-1.5">
        <label
          htmlFor="partner-message"
          className="text-muted-foreground font-mono text-xs tracking-wider uppercase"
        >
          What would you like to do together? <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="partner-message"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => validateField("message", message)}
          placeholder="Tell us about your event format, sponsorship scope, venue space, or partnership idea..."
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "partner-message-error" : undefined}
          required
        />
        {errors.message && (
          <p id="partner-message-error" className="text-destructive text-xs">
            {errors.message}
          </p>
        )}
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div
          id="partner-server-error"
          className="border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl border p-3.5 text-sm"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          id="partner-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full font-mono text-xs tracking-wider uppercase sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-3.5 animate-spin" aria-hidden="true" />
              Submitting...
            </>
          ) : (
            "Submit partner request"
          )}
        </Button>
      </div>
    </form>
  );
}
