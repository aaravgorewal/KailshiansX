"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, MapPin, Check, ArrowRight, AlertCircle } from "lucide-react";
import {
  OPENINGS,
  TEAM_AREAS,
  TeamOpening,
  STATUS_CONFIG,
  TEAM_APPLICATION_STATUSES,
} from "@/lib/team-constants";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/forms";
import {
  teamApplicationSchema,
  type TeamApplicationFormData,
} from "@/lib/validations/team-application";
import { trackApplicationSubmit } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function JoinTeamClient() {
  const [selectedArea, setSelectedArea] = React.useState<string>("ALL");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = React.useState<{
    id: string;
    message: string;
  } | null>(null);
  const formRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<TeamApplicationFormData>({
    resolver: zodResolver(teamApplicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      area: "Technology",
      roleApplied: "",
      linkedin: "",
      portfolio: "",
      resumeUrl: "",
      experience: "",
      motivation: "",
      honeypot: "",
    },
  });

  // Filter openings
  const filteredOpenings = React.useMemo(() => {
    if (selectedArea === "ALL") return OPENINGS;
    return OPENINGS.filter((o) => o.area.toLowerCase() === selectedArea.toLowerCase());
  }, [selectedArea]);

  const handleApplyClick = (opening: TeamOpening) => {
    form.setValue("area", opening.area);
    form.setValue("roleApplied", opening.title);

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const onSubmit = async (values: TeamApplicationFormData) => {
    setServerError(null);
    try {
      const res = await fetch("/api/applications/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSubmissionSuccess({
        id: data.id,
        message: data.message || "Application submitted successfully.",
      });

      trackApplicationSubmit({
        type: "team",
        roleOrTrack: `${values.roleApplied} (${values.area})`,
      });

      form.reset();
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "Failed to submit. Please check required fields."
      );
    }
  };

  return (
    <div className="space-y-16">
      {/* ─── 1. Role-Wise Openings Directory ──────────────────────────────── */}
      <section className="space-y-8" id="openings">
        <div>
          <h2 className="text-foreground text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            Open Core Volunteer & Leadership Positions
          </h2>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
            We are actively recruiting passionate builders across 11 functional domains. Whether you
            want to write platform code, host summits, or orchestrate university partnerships, there
            is an ownership seat waiting for you.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setSelectedArea("ALL")}
            className={cn(
              "focus-visible:ring-ring shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-[border-color,background-color,opacity] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80",
              selectedArea === "ALL"
                ? "border-primary bg-primary text-primary-foreground font-semibold"
                : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground"
            )}
          >
            All Areas ({OPENINGS.length})
          </button>
          {TEAM_AREAS.map((area) => {
            const count = OPENINGS.filter((o) => o.area === area).length;
            const isSelected = selectedArea === area;
            return (
              <button
                key={area}
                type="button"
                onClick={() => setSelectedArea(area)}
                className={cn(
                  "focus-visible:ring-ring shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-[border-color,background-color,opacity] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground font-semibold"
                    : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                )}
              >
                <span>{area}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "ml-1.5 rounded-full px-1.5 py-0.5 font-mono text-xs",
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Openings Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredOpenings.map((opening) => (
            <Card key={opening.id} className="flex h-full flex-col justify-between p-6">
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="sm">
                      {opening.area}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      {opening.type}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-3 font-mono text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="text-muted-foreground size-3" />
                      {opening.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="text-muted-foreground size-3" />
                      {opening.commitment}
                    </span>
                  </div>
                </div>

                {/* Title & Summary */}
                <div>
                  <h3 title={opening.title} className="text-foreground text-lg font-bold">
                    {opening.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                    {opening.summary}
                  </p>
                </div>

                {/* Key Responsibilities */}
                <div className="border-border space-y-2 border-t pt-3">
                  <h4 className="text-muted-foreground font-mono text-xs font-semibold uppercase">
                    Key Responsibilities
                  </h4>
                  <ul className="text-muted-foreground space-y-1.5 text-xs">
                    {opening.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div className="border-border space-y-2 border-t pt-3">
                  <h4 className="text-muted-foreground font-mono text-xs font-semibold uppercase">
                    What We Look For
                  </h4>
                  <ul className="text-muted-foreground space-y-1.5 text-xs">
                    {opening.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="border-border mt-6 border-t pt-4">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => handleApplyClick(opening)}
                >
                  <span>Apply for this Role</span>
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── 2. 5-Stage Selection Workflow Timeline ────────────────────────── */}
      <section className="border-border bg-card -mx-4 border-y px-4 py-16 sm:-mx-6 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Pipeline
            </p>
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Our 5-Stage Selection Pipeline
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Every candidate is respected with honest timelines and feedback. We review
              applications weekly in structured batches.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {TEAM_APPLICATION_STATUSES.map((statusKey, index) => {
              const config = STATUS_CONFIG[statusKey];
              return (
                <Card key={statusKey} className="flex flex-col justify-between p-5">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-primary font-mono text-xs font-bold">
                        Step {index + 1}
                      </span>
                      <span className="text-muted-foreground text-xs font-medium">{statusKey}</span>
                    </div>
                    <h4 className="text-foreground text-sm font-semibold">{config.label}</h4>
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                      {config.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 3. Application Form ───────────────────────────────────────────── */}
      <section ref={formRef} className="space-y-6">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Application Portal
          </p>
          <h2 className="text-foreground mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Submit Your Core Team Application
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Tell us about your background, projects you have shipped, and where you want to make an
            impact.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          {submissionSuccess ? (
            <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-8 text-center">
              <div className="border-border bg-background text-success mx-auto flex size-12 items-center justify-center rounded-full border">
                <Check className="size-6" />
              </div>
              <h3 className="text-foreground text-lg font-bold">Application Received!</h3>
              <p className="text-muted-foreground mx-auto max-w-md text-xs leading-relaxed">
                {submissionSuccess.message}
              </p>
              <div className="border-border bg-background text-foreground mx-auto max-w-sm rounded-md border p-3 font-mono text-xs select-all">
                Application Reference: {submissionSuccess.id}
              </div>
              <div className="pt-2">
                <Button variant="secondary" size="sm" onClick={() => setSubmissionSuccess(null)}>
                  Submit Another Application
                </Button>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {serverError && (
                  <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-xs">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                <input
                  type="text"
                  {...form.register("honeypot")}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Full Name</FormLabel>
                        <FormControl>
                          <FormInput placeholder="e.g. Aarav Sharma" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Email Address</FormLabel>
                        <FormControl>
                          <FormInput type="email" placeholder="aarav@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (WhatsApp)</FormLabel>
                        <FormControl>
                          <FormInput placeholder="+91 98765 43210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Functional Area</FormLabel>
                        <FormControl>
                          <FormSelect
                            options={TEAM_AREAS.map((a) => ({ value: a, label: a }))}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="roleApplied"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Role / Position Applied For</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="e.g. Platform Engineer, Stage Producer, Campus Chapter Lead"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Profile</FormLabel>
                        <FormControl>
                          <FormInput placeholder="https://linkedin.com/in/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="portfolio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub / Portfolio URL</FormLabel>
                        <FormControl>
                          <FormInput placeholder="https://github.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resumeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resume / CV Link</FormLabel>
                        <FormControl>
                          <FormInput placeholder="Public Google Drive or Notion link" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Relevant Experience & Projects Shipped</FormLabel>
                      <FormControl>
                        <FormTextarea
                          placeholder="Detail technical stacks used, events organized, communities managed, or campaigns executed..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motivation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        Why KailshiansX? What Drives You to Build Here?
                      </FormLabel>
                      <FormControl>
                        <FormTextarea
                          placeholder="What excites you about our mission? What unique commitment will you bring to the core team?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button type="submit" variant="primary" isLoading={form.formState.isSubmitting}>
                    Submit Application
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </Card>
      </section>
    </div>
  );
}
