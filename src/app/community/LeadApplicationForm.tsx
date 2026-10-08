"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  leadApplicationFormSchema,
  type LeadApplicationFormInput,
} from "@/lib/validations/community-leads";
import { submitLeadApplication } from "@/server/community/actions";
import { cn } from "@/lib/utils";

interface LeadApplicationFormProps {
  initialUser?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    linkedin?: string | null;
  };
}

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

export function LeadApplicationForm({ initialUser }: LeadApplicationFormProps) {
  const [applyingFor, setApplyingFor] = useState<"campus" | "state">("campus");
  const [name, setName] = useState(initialUser?.name || "");
  const [email, setEmail] = useState(initialUser?.email || "");
  const [phone, setPhone] = useState(initialUser?.phone || "");
  const [college, setCollege] = useState("");
  const [city, setCity] = useState("");
  const [courseYear, setCourseYear] = useState("");
  const [linkedin, setLinkedin] = useState(initialUser?.linkedin || "");
  const [whyLead, setWhyLead] = useState("");
  const [availability, setAvailability] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateField = (field: keyof LeadApplicationFormInput, value: string) => {
    const currentPayload: LeadApplicationFormInput = {
      applyingFor,
      name: field === "name" ? value : name,
      email: field === "email" ? value : email,
      phone: field === "phone" ? value : phone,
      college: field === "college" ? value : college,
      city: field === "city" ? value : city,
      courseYear: field === "courseYear" ? value : courseYear,
      linkedin: field === "linkedin" ? value : linkedin,
      whyLead: field === "whyLead" ? value : whyLead,
      availability: field === "availability" ? value : availability,
      honeypot,
    };

    const res = leadApplicationFormSchema.safeParse(currentPayload);
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

    const payload: LeadApplicationFormInput = {
      applyingFor,
      name,
      email,
      phone,
      college,
      city,
      courseYear,
      linkedin,
      whyLead,
      availability,
      honeypot,
    };

    const validation = leadApplicationFormSchema.safeParse(payload);
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
      const res = await submitLeadApplication(payload);
      if (res.success) {
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
      console.error("[LeadApplicationForm Error]:", err);
      setServerError("Network error. Please try submitting again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        id="lead-success-state"
        className="border-border bg-card space-y-4 rounded-2xl border p-8 text-center sm:p-10"
      >
        <div className="border-border bg-muted/30 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs">
          <CheckCircle2 className="text-foreground size-3.5" aria-hidden="true" />
          <span>Application Submitted</span>
        </div>
        <h3 className="font-display text-foreground text-2xl font-bold tracking-tight">
          Thank you for applying
        </h3>
        <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed">
          We have received your application for{" "}
          <span className="text-foreground font-medium">
            {applyingFor === "campus" ? "Campus Lead" : "State Lead"}
          </span>
          . A confirmation email has been sent to{" "}
          <span className="text-foreground font-mono">{email}</span>. Our team reviews applications
          on a rolling basis and will reach out soon.
        </p>
      </div>
    );
  }

  return (
    <form
      id="lead-application-form"
      onSubmit={handleSubmit}
      className="border-border bg-card space-y-6 rounded-2xl border p-6 sm:p-8"
      noValidate
    >
      {/* Honeypot hidden input */}
      <input
        type="text"
        name="honeypot"
        id="lead-honeypot"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
      />

      {/* Role Selection Radio */}
      <fieldset className="space-y-2">
        <legend className="text-foreground text-sm font-medium select-none">Applying for:</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label
            htmlFor="applying-campus"
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
              applyingFor === "campus"
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-card hover:bg-muted/30 text-muted-foreground"
            )}
          >
            <input
              type="radio"
              id="applying-campus"
              name="applyingFor"
              value="campus"
              checked={applyingFor === "campus"}
              onChange={() => {
                setApplyingFor("campus");
                setServerError(null);
              }}
              className="text-primary border-border focus:ring-primary size-4"
            />
            <div>
              <div className="text-foreground text-sm font-medium">Campus Lead</div>
              <div className="text-muted-foreground text-xs">For college & university students</div>
            </div>
          </label>

          <label
            htmlFor="applying-state"
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
              applyingFor === "state"
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-card hover:bg-muted/30 text-muted-foreground"
            )}
          >
            <input
              type="radio"
              id="applying-state"
              name="applyingFor"
              value="state"
              checked={applyingFor === "state"}
              onChange={() => {
                setApplyingFor("state");
                setServerError(null);
              }}
              className="text-primary border-border focus:ring-primary size-4"
            />
            <div>
              <div className="text-foreground text-sm font-medium">State Lead</div>
              <div className="text-muted-foreground text-xs">
                For regional coordinators & organizers
              </div>
            </div>
          </label>
        </div>
      </fieldset>

      {/* Form Fields: Name, Email, Phone, College, City, Year/Course, LinkedIn, Why Lead, Availability */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Full Name */}
        <Input
          id="lead-name"
          name="name"
          label="Full name"
          placeholder="Aarav Sharma"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => validateField("name", name)}
          error={errors.name}
          required
        />

        {/* Email */}
        <Input
          id="lead-email"
          name="email"
          type="email"
          label="Email address"
          placeholder="aarav@example.com"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => validateField("email", email)}
          error={errors.email}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Phone */}
        <Input
          id="lead-phone"
          name="phone"
          type="tel"
          label="Phone (WhatsApp)"
          placeholder="+91 98765 43210"
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => {
            const formatted = formatIndianPhone(phone);
            setPhone(formatted);
            validateField("phone", formatted);
          }}
          error={errors.phone}
          required
        />

        {/* College / Organisation */}
        <Input
          id="lead-college"
          name="college"
          label="College / Organisation"
          placeholder="e.g. MNIT Jaipur"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          onBlur={() => validateField("college", college)}
          error={errors.college}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* City */}
        <Input
          id="lead-city"
          name="city"
          label="City"
          placeholder="e.g. Jaipur"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onBlur={() => validateField("city", city)}
          error={errors.city}
          required
        />

        {/* Year / Course */}
        <Input
          id="lead-course-year"
          name="courseYear"
          label="Year / Course"
          placeholder="e.g. 3rd Year, B.Tech CSE"
          value={courseYear}
          onChange={(e) => setCourseYear(e.target.value)}
          onBlur={() => validateField("courseYear", courseYear)}
          error={errors.courseYear}
          required
        />
      </div>

      {/* LinkedIn */}
      <Input
        id="lead-linkedin"
        name="linkedin"
        label="LinkedIn profile"
        placeholder="https://linkedin.com/in/username"
        value={linkedin}
        onChange={(e) => setLinkedin(e.target.value)}
        onBlur={() => validateField("linkedin", linkedin)}
        error={errors.linkedin}
        required
      />

      {/* Why do you want to lead? */}
      <Textarea
        id="lead-why"
        name="whyLead"
        label="Why do you want to lead?"
        placeholder="Tell us what motivates you to lead KailshiansX and any previous experience organizing communities or tech events (min 20 characters)..."
        rows={4}
        value={whyLead}
        onChange={(e) => setWhyLead(e.target.value)}
        onBlur={() => validateField("whyLead", whyLead)}
        error={errors.whyLead}
        required
      />

      {/* Availability */}
      <Input
        id="lead-availability"
        name="availability"
        label="Availability"
        placeholder="e.g. 5-10 hours/week"
        value={availability}
        onChange={(e) => setAvailability(e.target.value)}
        onBlur={() => validateField("availability", availability)}
        error={errors.availability}
        required
      />

      {/* Server error banner */}
      {serverError && (
        <div
          id="lead-server-error"
          className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl border p-4 text-xs font-medium"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        id="lead-submit-btn"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            <span>Submitting...</span>
          </>
        ) : (
          <span>Submit application</span>
        )}
      </Button>
    </form>
  );
}
