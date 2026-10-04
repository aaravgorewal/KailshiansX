"use client";

import React, { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Users, Building2, BadgePercent, Check, AlertCircle } from "lucide-react";
import {
  collegeCollaborationSchema,
  communityCollaborationSchema,
  venueCollaborationSchema,
  sponsorCollaborationSchema,
  type CollegeCollaborationInput,
  type CommunityCollaborationInput,
  type VenueCollaborationInput,
  type SponsorCollaborationInput,
} from "@/lib/validations/collaborations";
import {
  submitCollegeCollaboration,
  submitCommunityCollaboration,
  submitVenueCollaboration,
  submitSponsorCollaboration,
} from "@/server/collaborations/actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
  FormCheckbox,
} from "@/components/forms";
import { trackApplicationSubmit } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type CollaborationPath = "college" | "community" | "venue" | "sponsor";

interface SubmissionSuccess {
  referenceCode: string;
  organisation: string;
  email: string;
}

export function CollaborationsClient({
  initialPath = "college",
}: {
  initialPath?: CollaborationPath;
}) {
  const [activePath, setActivePath] = useState<CollaborationPath>(initialPath);
  const [submissionResult, setSubmissionResult] = useState<SubmissionSuccess | null>(null);

  const handlePathChange = (path: CollaborationPath) => {
    setActivePath(path);
    setSubmissionResult(null);
  };

  return (
    <div className="space-y-8">
      {/* ─── 4-Path Radio-Style Cards Selector ───────────────────────────── */}
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        role="radiogroup"
        aria-label="Collaboration Path"
      >
        {/* Path 1: College */}
        <button
          type="button"
          role="radio"
          aria-checked={activePath === "college"}
          onClick={() => handlePathChange("college")}
          className={cn(
            "rounded-lg border p-5 text-left transition-[border-color,background-color] duration-150",
            activePath === "college"
              ? "border-primary bg-card ring-primary ring-1"
              : "border-border bg-card hover:border-muted-foreground"
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="border-border bg-muted text-foreground flex size-9 items-center justify-center rounded-md border">
              <GraduationCap className="size-4" />
            </div>
            <span className="text-muted-foreground text-xs font-semibold uppercase">Colleges</span>
          </div>
          <h3 className="text-foreground text-sm font-semibold">College Partner</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Co-host hackathons, workshops, and charter student chapters on your campus.
          </p>
        </button>

        {/* Path 2: Community */}
        <button
          type="button"
          role="radio"
          aria-checked={activePath === "community"}
          onClick={() => handlePathChange("community")}
          className={cn(
            "rounded-lg border p-5 text-left transition-[border-color,background-color] duration-150",
            activePath === "community"
              ? "border-primary bg-card ring-primary ring-1"
              : "border-border bg-card hover:border-muted-foreground"
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="border-border bg-muted text-foreground flex size-9 items-center justify-center rounded-md border">
              <Users className="size-4" />
            </div>
            <span className="text-muted-foreground text-xs font-semibold uppercase">
              Communities
            </span>
          </div>
          <h3 className="text-foreground text-sm font-semibold">Community Partner</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Cross-promote events, share speaker benches, and co-host regional developer meetups.
          </p>
        </button>

        {/* Path 3: Venue */}
        <button
          type="button"
          role="radio"
          aria-checked={activePath === "venue"}
          onClick={() => handlePathChange("venue")}
          className={cn(
            "rounded-lg border p-5 text-left transition-[border-color,background-color] duration-150",
            activePath === "venue"
              ? "border-primary bg-card ring-primary ring-1"
              : "border-border bg-card hover:border-muted-foreground"
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="border-border bg-muted text-foreground flex size-9 items-center justify-center rounded-md border">
              <Building2 className="size-4" />
            </div>
            <span className="text-muted-foreground text-xs font-semibold uppercase">Venues</span>
          </div>
          <h3 className="text-foreground text-sm font-semibold">Venue Host</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Provide coworking space, auditorium, or tech campus for workshops and hackathons.
          </p>
        </button>

        {/* Path 4: Sponsor */}
        <button
          type="button"
          role="radio"
          aria-checked={activePath === "sponsor"}
          onClick={() => handlePathChange("sponsor")}
          className={cn(
            "rounded-lg border p-5 text-left transition-[border-color,background-color] duration-150",
            activePath === "sponsor"
              ? "border-primary bg-card ring-primary ring-1"
              : "border-border bg-card hover:border-muted-foreground"
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="border-border bg-muted text-foreground flex size-9 items-center justify-center rounded-md border">
              <BadgePercent className="size-4" />
            </div>
            <span className="text-muted-foreground text-xs font-semibold uppercase">Sponsors</span>
          </div>
          <h3 className="text-foreground text-sm font-semibold">Brand Sponsor</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Sponsor hackathon tracks, offer API bounties, hire engineering talent, and demo
            products.
          </p>
        </button>
      </div>

      {/* ─── Form Container ──────────────────────────────────────────────── */}
      <Card className="p-6 sm:p-8">
        {submissionResult ? (
          <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-8 text-center">
            <div className="border-border bg-background text-success mx-auto flex size-12 items-center justify-center rounded-full border">
              <Check className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-foreground text-lg font-semibold">
                Proposal Submitted Successfully
              </h3>
              <p className="text-success text-sm font-medium">
                Your partnership inquiry has entered our review pipeline.
              </p>
            </div>
            <div className="border-border bg-background text-foreground mx-auto max-w-sm rounded-md border p-3 font-mono text-xs select-all">
              Reference: {submissionResult.referenceCode}
            </div>
            <p className="text-muted-foreground mx-auto max-w-md text-xs">
              An acknowledgement has been dispatched to {submissionResult.email}. Our ecosystem
              partnerships team will review your proposal and follow up within 24 to 48 business
              hours.
            </p>
            <div className="pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSubmissionResult(null)}>
                Submit Another Proposal
              </Button>
            </div>
          </div>
        ) : (
          <>
            {activePath === "college" && (
              <CollegeForm onSubmitted={(res) => setSubmissionResult(res)} />
            )}
            {activePath === "community" && (
              <CommunityForm onSubmitted={(res) => setSubmissionResult(res)} />
            )}
            {activePath === "venue" && (
              <VenueForm onSubmitted={(res) => setSubmissionResult(res)} />
            )}
            {activePath === "sponsor" && (
              <SponsorForm onSubmitted={(res) => setSubmissionResult(res)} />
            )}
          </>
        )}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. College Form
// ─────────────────────────────────────────────────────────────────────────────
function CollegeForm({ onSubmitted }: { onSubmitted: (res: SubmissionSuccess) => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CollegeCollaborationInput>({
    resolver: zodResolver(collegeCollaborationSchema),
    defaultValues: {
      organisation: "",
      contactPerson: "",
      roleDesignation: "",
      email: "",
      phone: "",
      website: "",
      city: "",
      state: "",
      expectedStudentReach: "250-500",
      proposedEvent: "",
      resourcesOffered: "",
      message: "",
      honeypot: "",
    },
  });

  const onSubmit = (values: CollegeCollaborationInput) => {
    setServerError(null);
    startTransition(async () => {
      const res = await submitCollegeCollaboration(values);
      if (res.success && res.referenceCode) {
        trackApplicationSubmit({ type: "collaboration", roleOrTrack: "college" });
        onSubmitted({
          referenceCode: res.referenceCode,
          organisation: values.organisation,
          email: values.email,
        });
      } else {
        setServerError(res.error || "Submission failed. Please check your fields.");
        if (res.fieldErrors) {
          Object.entries(res.fieldErrors).forEach(([field, msgs]) => {
            form.setError(field as keyof CollegeCollaborationInput, {
              type: "server",
              message: msgs[0],
            });
          });
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <input
          type="text"
          {...form.register("honeypot")}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        {serverError && (
          <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-xs">
            <AlertCircle className="size-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="organisation"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>College / University Name</FormLabel>
                <FormControl>
                  <FormInput placeholder="e.g. Graphic Era Hill University" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Contact Person Name</FormLabel>
                <FormControl>
                  <FormInput placeholder="Full name of representative" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roleDesignation"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Designation / Role</FormLabel>
                <FormControl>
                  <FormInput placeholder="e.g. Dean, HOD CSE, Club President" {...field} />
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
                <FormLabel required>Official Email Address</FormLabel>
                <FormControl>
                  <FormInput type="email" placeholder="faculty@university.edu.in" {...field} />
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
                <FormLabel required>Phone / WhatsApp</FormLabel>
                <FormControl>
                  <FormInput placeholder="+91 98765 43210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>College Website</FormLabel>
                <FormControl>
                  <FormInput placeholder="https://college.edu.in" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>City</FormLabel>
                <FormControl>
                  <FormInput placeholder="e.g. Dehradun" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State / Region</FormLabel>
                <FormControl>
                  <FormInput placeholder="e.g. Uttarakhand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expectedStudentReach"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Expected Student Reach</FormLabel>
              <FormControl>
                <FormSelect
                  options={[
                    { value: "100-250", label: "100–250 Students" },
                    { value: "250-500", label: "250–500 Students" },
                    { value: "500-1000", label: "500–1,000 Students" },
                    { value: "1000+", label: "1,000+ Campus-wide" },
                  ]}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="proposedEvent"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Proposed Event / Initiative</FormLabel>
              <FormControl>
                <FormTextarea
                  placeholder="Describe your initiative (e.g. 24-hr campus hackathon track, hands-on workshop, KailshiansX campus chapter launch)..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resourcesOffered"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Facilities & Resources Offered</FormLabel>
              <FormControl>
                <FormTextarea
                  placeholder="e.g. 500-seater Auditorium, High-speed LAN, Computer Labs, Faculty Event Clearance, Student Volunteers..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <FormTextarea
                  placeholder="Any specific timeline, MoU requirements, or questions..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" isLoading={isPending}>
            Submit College Proposal
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Community Form
// ─────────────────────────────────────────────────────────────────────────────
function CommunityForm({ onSubmitted }: { onSubmitted: (res: SubmissionSuccess) => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CommunityCollaborationInput>({
    resolver: zodResolver(communityCollaborationSchema),
    defaultValues: {
      organisation: "",
      contactPerson: "",
      email: "",
      phone: "",
      website: "",
      city: "",
      state: "",
      communitySize: "500-2000",
      techFocus: "AI & Machine Learning",
      proposedEvent: "",
      resourcesOffered: "",
      message: "",
      honeypot: "",
    },
  });

  const onSubmit = (values: CommunityCollaborationInput) => {
    setServerError(null);
    startTransition(async () => {
      const res = await submitCommunityCollaboration(values);
      if (res.success && res.referenceCode) {
        trackApplicationSubmit({ type: "collaboration", roleOrTrack: "community" });
        onSubmitted({
          referenceCode: res.referenceCode,
          organisation: values.organisation,
          email: values.email,
        });
      } else {
        setServerError(res.error || "Submission failed. Please check your fields.");
        if (res.fieldErrors) {
          Object.entries(res.fieldErrors).forEach(([field, msgs]) => {
            form.setError(field as keyof CommunityCollaborationInput, {
              type: "server",
              message: msgs[0],
            });
          });
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <input
          type="text"
          {...form.register("honeypot")}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        {serverError && (
          <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-xs">
            <AlertCircle className="size-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="organisation"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Community / Group Name</FormLabel>
                <FormControl>
                  <FormInput
                    placeholder="e.g. Dehradun Rustaceans, Jaipur AI Builders"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Lead / Organiser Name</FormLabel>
                <FormControl>
                  <FormInput placeholder="Full name of community lead" {...field} />
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
                <FormLabel required>Contact Email Address</FormLabel>
                <FormControl>
                  <FormInput type="email" placeholder="lead@community.dev" {...field} />
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
                <FormLabel required>Phone / WhatsApp</FormLabel>
                <FormControl>
                  <FormInput placeholder="+91 98765 43210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Community Link</FormLabel>
                <FormControl>
                  <FormInput placeholder="Meetup, Discord, or Website link" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>City / Region</FormLabel>
                <FormControl>
                  <FormInput placeholder="e.g. Chandigarh" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="communitySize"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Active Community Size</FormLabel>
                <FormControl>
                  <FormSelect
                    options={[
                      { value: "100-500", label: "100–500 Members" },
                      { value: "500-2000", label: "500–2,000 Members" },
                      { value: "2000-5000", label: "2,000–5,000 Members" },
                      { value: "5000+", label: "5,000+ Members" },
                    ]}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="techFocus"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Primary Technical Focus</FormLabel>
                <FormControl>
                  <FormSelect
                    options={[
                      { value: "AI & Machine Learning", label: "AI & Machine Learning" },
                      { value: "Web & Full Stack", label: "Web & Full Stack" },
                      { value: "Cloud, DevOps & Systems", label: "Cloud, DevOps & Systems" },
                      { value: "Open Source", label: "Open Source" },
                      { value: "Mobile Development", label: "Mobile Development" },
                      { value: "Web3 & Blockchain", label: "Web3 & Blockchain" },
                      { value: "Cybersecurity", label: "Cybersecurity" },
                      { value: "General Developer Hub", label: "General Developer Hub" },
                    ]}
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
          name="proposedEvent"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Joint Initiative Proposal</FormLabel>
              <FormControl>
                <FormTextarea
                  placeholder="Describe the joint meetup, hackathon co-host, or cross-promotion initiative..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resourcesOffered"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Resources Shared</FormLabel>
              <FormControl>
                <FormTextarea
                  placeholder="e.g. Member outreach across 1,000 devs, speakers, volunteer crew, co-branding..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <FormTextarea placeholder="Any specific timeline or expectations..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" isLoading={isPending}>
            Submit Community Proposal
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Venue Form
// ─────────────────────────────────────────────────────────────────────────────
const VENUE_AMENITY_OPTIONS = [
  "High-speed WiFi",
  "Projector & Screen",
  "AV & Mics",
  "Air Conditioning",
  "Power Backup & Charging",
  "Cafeteria / Refreshment Area",
];

function VenueForm({ onSubmitted }: { onSubmitted: (res: SubmissionSuccess) => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<VenueCollaborationInput>({
    resolver: zodResolver(venueCollaborationSchema),
    defaultValues: {
      organisation: "",
      contactPerson: "",
      email: "",
      phone: "",
      website: "",
      city: "",
      address: "",
      facilityType: "Coworking Space",
      seatingCapacity: "100-250",
      amenities: ["High-speed WiFi", "Projector & Screen"],
      proposedEvent: "",
      resourcesOffered: "",
      message: "",
      honeypot: "",
    },
  });

  const onSubmit = (values: VenueCollaborationInput) => {
    setServerError(null);
    startTransition(async () => {
      const res = await submitVenueCollaboration(values);
      if (res.success && res.referenceCode) {
        trackApplicationSubmit({ type: "collaboration", roleOrTrack: "venue" });
        onSubmitted({
          referenceCode: res.referenceCode,
          organisation: values.organisation,
          email: values.email,
        });
      } else {
        setServerError(res.error || "Submission failed. Please check your fields.");
        if (res.fieldErrors) {
          Object.entries(res.fieldErrors).forEach(([field, msgs]) => {
            form.setError(field as keyof VenueCollaborationInput, {
              type: "server",
              message: msgs[0],
            });
          });
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <input
          type="text"
          {...form.register("honeypot")}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        {serverError && (
          <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-xs">
            <AlertCircle className="size-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="organisation"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Venue / Space Name</FormLabel>
                <FormControl>
                  <FormInput placeholder="e.g. Innov8 Hub, Incubation Center" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Manager / Contact Name</FormLabel>
                <FormControl>
                  <FormInput placeholder="Full name of venue contact" {...field} />
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
                <FormLabel required>Contact Email</FormLabel>
                <FormControl>
                  <FormInput type="email" placeholder="manager@venue.com" {...field} />
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
                <FormLabel required>Phone / WhatsApp</FormLabel>
                <FormControl>
                  <FormInput placeholder="+91 98765 43210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>City</FormLabel>
                <FormControl>
                  <FormInput placeholder="e.g. Dehradun" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Full Street Address</FormLabel>
                <FormControl>
                  <FormInput placeholder="Floor, building, street, landmark" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facilityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Facility Type</FormLabel>
                <FormControl>
                  <FormSelect
                    options={[
                      { value: "Coworking Space", label: "Coworking Space" },
                      { value: "University / College Auditorium", label: "University Auditorium" },
                      { value: "Corporate Tech Campus", label: "Corporate Tech Campus" },
                      { value: "Startup Incubator / Hub", label: "Startup Incubator / Hub" },
                      { value: "Conference Center", label: "Conference Center" },
                      { value: "Other", label: "Other" },
                    ]}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seatingCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Seating Capacity</FormLabel>
                <FormControl>
                  <FormSelect
                    options={[
                      { value: "50-100", label: "50–100 Seats" },
                      { value: "100-250", label: "100–250 Seats" },
                      { value: "250-500", label: "250–500 Seats" },
                      { value: "500+", label: "500+ Seats" },
                    ]}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Available Amenities Multi-checkbox */}
        <FormField
          control={form.control}
          name="amenities"
          render={() => (
            <FormItem>
              <FormLabel required>Available Amenities</FormLabel>
              <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2 lg:grid-cols-3">
                {VENUE_AMENITY_OPTIONS.map((item) => (
                  <Controller
                    key={item}
                    control={form.control}
                    name="amenities"
                    render={({ field }) => {
                      const checked = field.value?.includes(item);
                      return (
                        <FormCheckbox
                          id={`amenity-${item.replace(/\s+/g, "-")}`}
                          label={item}
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...(field.value || []), item]
                              : (field.value || []).filter((v) => v !== item);
                            field.onChange(next);
                          }}
                        />
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="proposedEvent"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Event Formats Supported</FormLabel>
              <FormControl>
                <FormTextarea
                  placeholder="e.g. Weekend Hackathons (24-hr access), Evening Tech Meetups, Weekend Bootcamps..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resourcesOffered"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Hosting Terms & Resources</FormLabel>
              <FormControl>
                <FormTextarea
                  placeholder="Detail Wi-Fi speed, AV setup, power backup, parking availability, or rental terms..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" isLoading={isPending}>
            Submit Venue Proposal
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Sponsor Form
// ─────────────────────────────────────────────────────────────────────────────
function SponsorForm({ onSubmitted }: { onSubmitted: (res: SubmissionSuccess) => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SponsorCollaborationInput>({
    resolver: zodResolver(sponsorCollaborationSchema),
    defaultValues: {
      organisation: "",
      contactPerson: "",
      roleDesignation: "",
      email: "",
      phone: "",
      website: "",
      city: "",
      targetAudience: "Broad Developer Ecosystem",
      sponsorshipScope: "Hackathon Title Sponsor",
      budgetTier: "₹1,50,000 – ₹5,00,000",
      proposedEvent: "",
      resourcesOffered: "",
      message: "",
      honeypot: "",
    },
  });

  const onSubmit = (values: SponsorCollaborationInput) => {
    setServerError(null);
    startTransition(async () => {
      const res = await submitSponsorCollaboration(values);
      if (res.success && res.referenceCode) {
        trackApplicationSubmit({ type: "collaboration", roleOrTrack: "sponsor" });
        onSubmitted({
          referenceCode: res.referenceCode,
          organisation: values.organisation,
          email: values.email,
        });
      } else {
        setServerError(res.error || "Submission failed. Please check your fields.");
        if (res.fieldErrors) {
          Object.entries(res.fieldErrors).forEach(([field, msgs]) => {
            form.setError(field as keyof SponsorCollaborationInput, {
              type: "server",
              message: msgs[0],
            });
          });
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <input
          type="text"
          {...form.register("honeypot")}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        {serverError && (
          <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-xs">
            <AlertCircle className="size-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="organisation"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Company / Brand Name</FormLabel>
                <FormControl>
                  <FormInput placeholder="e.g. Vercel, Supabase, Razorpay" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Contact Person Name</FormLabel>
                <FormControl>
                  <FormInput placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roleDesignation"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Designation / Role</FormLabel>
                <FormControl>
                  <FormInput placeholder="e.g. Head of DevRel, VP Marketing" {...field} />
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
                <FormLabel required>Official Work Email</FormLabel>
                <FormControl>
                  <FormInput type="email" placeholder="name@company.com" {...field} />
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
                <FormLabel required>Phone Number</FormLabel>
                <FormControl>
                  <FormInput placeholder="+91 98765 43210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Company Website</FormLabel>
                <FormControl>
                  <FormInput placeholder="https://company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Operating City / HQ</FormLabel>
                <FormControl>
                  <FormInput placeholder="e.g. Bengaluru" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Target Developer Persona</FormLabel>
                <FormControl>
                  <FormSelect
                    options={[
                      {
                        value: "College Students & New Grads",
                        label: "College Students & New Grads",
                      },
                      {
                        value: "Working Software Engineers & Tech Leads",
                        label: "Working Software Engineers",
                      },
                      {
                        value: "AI / ML Researchers & Builders",
                        label: "AI / ML Researchers & Builders",
                      },
                      {
                        value: "Founders & Early-stage Builders",
                        label: "Founders & Early-stage Builders",
                      },
                      { value: "Broad Developer Ecosystem", label: "Broad Developer Ecosystem" },
                    ]}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sponsorshipScope"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Sponsorship Format</FormLabel>
                <FormControl>
                  <FormSelect
                    options={[
                      { value: "Hackathon Title Sponsor", label: "Hackathon Title Sponsor" },
                      {
                        value: "Hackathon Track / Bounty Sponsor",
                        label: "Hackathon Track / Bounty Sponsor",
                      },
                      {
                        value: "Meetup Series Title / Annual Partner",
                        label: "Meetup Series Title Partner",
                      },
                      {
                        value: "Workshop & Masterclass Series Partner",
                        label: "Workshop Series Partner",
                      },
                      { value: "Swag & Community Merchandise Partner", label: "Swag Partner" },
                      {
                        value: "Cloud Credits / API Grant Partner",
                        label: "Cloud Credits / API Grant",
                      },
                      { value: "Custom / Multi-City Partnership", label: "Custom Partnership" },
                    ]}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budgetTier"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Budget Tier</FormLabel>
                <FormControl>
                  <FormSelect
                    options={[
                      { value: "Under ₹50,000", label: "Under ₹50,000" },
                      { value: "₹50,000 – ₹1,50,000", label: "₹50,000 – ₹1,50,000" },
                      { value: "₹1,50,000 – ₹5,00,000", label: "₹1,50,000 – ₹5,00,000" },
                      { value: "₹5,00,000+", label: "₹5,00,000+" },
                      {
                        value: "In-Kind / API Credits / Product Licences",
                        label: "In-Kind / API Credits",
                      },
                    ]}
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
          name="proposedEvent"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Campaign & Track Goals</FormLabel>
              <FormControl>
                <FormTextarea
                  placeholder="Describe your desired campaign, problem statement, API bounty, or hiring goals..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resourcesOffered"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Contributions Offered</FormLabel>
              <FormControl>
                <FormTextarea
                  placeholder="Detail contributions (Cash grant, Cloud credits, Mentors, Swag kits, Hiring spots)..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" isLoading={isPending}>
            Submit Sponsor Proposal
          </Button>
        </div>
      </form>
    </Form>
  );
}
