"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Check, AlertCircle } from "lucide-react";
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
} from "@/components/forms";
import {
  startChapterSchema,
  mentorSpeakerInquirySchema,
  type StartChapterInput,
  type MentorSpeakerInquiryInput,
} from "@/lib/validations/community-leads";
import { submitStartChapterInquiry, submitMentorSpeakerInquiry } from "@/server/community/actions";

interface CommunityModalsClientProps {
  initialOpenModal?: "chapter" | "mentor" | "speaker" | null;
}

export function triggerCommunityModal(modalType: "chapter" | "mentor" | "speaker") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-community-modal", { detail: modalType }));
  }
}

export function CommunityModalsClient({ initialOpenModal = null }: CommunityModalsClientProps) {
  const [activeModal, setActiveModal] = React.useState<"chapter" | "mentor" | "speaker" | null>(
    initialOpenModal
  );

  React.useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvt = e as CustomEvent<"chapter" | "mentor" | "speaker">;
      setActiveModal(customEvt.detail);
    };
    window.addEventListener("open-community-modal", handleOpen);
    return () => window.removeEventListener("open-community-modal", handleOpen);
  }, []);

  return (
    <>
      {activeModal === "chapter" && <StartChapterModal onClose={() => setActiveModal(null)} />}
      {(activeModal === "mentor" || activeModal === "speaker") && (
        <MentorSpeakerModal
          initialRole={activeModal === "mentor" ? "MENTOR" : "SPEAKER"}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}

// ─── Start a Chapter Modal ───────────────────────────────────────────────────
function StartChapterModal({ onClose }: { onClose: () => void }) {
  const [success, setSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<StartChapterInput>({
    resolver: zodResolver(startChapterSchema),
    defaultValues: {
      collegeName: "",
      city: "",
      state: "",
      applicantName: "",
      applicantRole: "Student President / Club Lead",
      email: "",
      phone: "",
      estimatedStudents: "100-300 Students",
      message: "",
      honeypot: "",
    },
  });

  const onSubmit = async (values: StartChapterInput) => {
    setServerError(null);
    try {
      const res = await submitStartChapterInquiry(values);
      if (res.success) {
        setSuccess(true);
        form.reset();
      } else {
        setServerError(res.error || "Failed to submit chapter inquiry.");
      }
    } catch {
      setServerError("An unexpected network error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="border-border bg-card relative my-8 w-full max-w-lg space-y-6 rounded-lg border p-6 shadow-xl sm:p-8">
        <button
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 rounded-md p-1.5"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        {success ? (
          <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-6 text-center">
            <div className="border-border bg-background text-success mx-auto flex size-12 items-center justify-center rounded-full border">
              <Check className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-foreground text-lg font-semibold">Chapter Inquiry Submitted</h3>
              <p className="text-success text-sm font-medium">
                Our campus team will review your proposal within 48 hours.
              </p>
            </div>
            <p className="text-muted-foreground mx-auto max-w-sm text-xs">
              A kickoff discovery call will be scheduled to align on workshops, hackathons, and
              chapter chartering.
            </p>
            <div className="pt-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-semibold uppercase">
                  College Chapters
                </span>
                <h3 className="text-foreground text-lg font-bold">Start a KailshiansX Chapter</h3>
                <p className="text-muted-foreground text-xs">
                  Bring official workshops, hackathon tracks, and founder sessions to your campus.
                </p>
              </div>

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

              <FormField
                control={form.control}
                name="collegeName"
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      <FormLabel required>State</FormLabel>
                      <FormControl>
                        <FormInput placeholder="e.g. Uttarakhand" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="applicantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Your Full Name</FormLabel>
                      <FormControl>
                        <FormInput placeholder="Aarav Sharma" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Your Role</FormLabel>
                      <FormControl>
                        <FormInput placeholder="e.g. Club Lead, Faculty" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Official Email</FormLabel>
                      <FormControl>
                        <FormInput type="email" placeholder="student@college.edu" {...field} />
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
              </div>

              <FormField
                control={form.control}
                name="estimatedStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Estimated Active Students</FormLabel>
                    <FormControl>
                      <FormSelect
                        options={[
                          { value: "50-100 Students", label: "50–100 Students" },
                          { value: "100-300 Students", label: "100–300 Students" },
                          { value: "300-600 Students", label: "300–600 Students" },
                          { value: "600+ Students", label: "600+ Students" },
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
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Why do you want to start this chapter?</FormLabel>
                    <FormControl>
                      <FormTextarea
                        placeholder="Tell us about existing coding clubs, hackathon participation, and what support your campus needs..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={form.formState.isSubmitting}
                >
                  Submit Chapter Inquiry
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}

// ─── Mentor / Speaker Modal ──────────────────────────────────────────────────
function MentorSpeakerModal({
  initialRole = "MENTOR",
  onClose,
}: {
  initialRole?: "MENTOR" | "SPEAKER" | "BOTH";
  onClose: () => void;
}) {
  const [success, setSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<MentorSpeakerInquiryInput>({
    resolver: zodResolver(mentorSpeakerInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      roleType: initialRole,
      designation: "",
      organisation: "",
      city: "",
      linkedin: "",
      github: "",
      expertiseAreas: "",
      talkTopicsOrMentorshipFocus: "",
      honeypot: "",
    },
  });

  const onSubmit = async (values: MentorSpeakerInquiryInput) => {
    setServerError(null);
    try {
      const res = await submitMentorSpeakerInquiry(values);
      if (res.success) {
        setSuccess(true);
        form.reset();
      } else {
        setServerError(res.error || "Failed to submit profile.");
      }
    } catch {
      setServerError("An unexpected network error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="border-border bg-card relative my-8 w-full max-w-lg space-y-6 rounded-lg border p-6 shadow-xl sm:p-8">
        <button
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 rounded-md p-1.5"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        {success ? (
          <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-6 text-center">
            <div className="border-border bg-background text-success mx-auto flex size-12 items-center justify-center rounded-full border">
              <Check className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-foreground text-lg font-semibold">Profile Received</h3>
              <p className="text-success text-sm font-medium">
                Thank you for offering your knowledge to India&apos;s builder ecosystem.
              </p>
            </div>
            <p className="text-muted-foreground mx-auto max-w-sm text-xs">
              Our developer relations and hackathon operations team will reach out with upcoming
              opportunities that match your technical profile.
            </p>
            <div className="pt-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-semibold uppercase">
                  Community Network
                </span>
                <h3 className="text-foreground text-lg font-bold">Join as a Mentor or Speaker</h3>
                <p className="text-muted-foreground text-xs">
                  Guide student hackathon teams, conduct masterclasses, or deliver keynotes at our
                  regional meetup series.
                </p>
              </div>

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
                name="roleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Contribution Interest</FormLabel>
                    <FormControl>
                      <FormSelect
                        options={[
                          { value: "MENTOR", label: "Hackathon Mentor" },
                          { value: "SPEAKER", label: "Meetup / Tech Talk Speaker" },
                          { value: "BOTH", label: "Both Mentor & Speaker" },
                        ]}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Designation / Role</FormLabel>
                      <FormControl>
                        <FormInput placeholder="e.g. Senior Backend Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organisation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Company / College</FormLabel>
                      <FormControl>
                        <FormInput placeholder="e.g. Swiggy, Microsoft" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Email Address</FormLabel>
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
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>City</FormLabel>
                      <FormControl>
                        <FormInput placeholder="e.g. Bengaluru, Dehradun" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>LinkedIn Profile</FormLabel>
                      <FormControl>
                        <FormInput placeholder="https://linkedin.com/in/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub / Personal Website (Optional)</FormLabel>
                    <FormControl>
                      <FormInput placeholder="https://github.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expertiseAreas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Technical Expertise</FormLabel>
                    <FormControl>
                      <FormInput
                        placeholder="e.g. Distributed Systems, Rust, LLMs, Next.js"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="talkTopicsOrMentorshipFocus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Proposed Topics or Mentorship Focus</FormLabel>
                    <FormControl>
                      <FormTextarea
                        placeholder="Detail topics you can present on, or what sprint challenges you can mentor students through..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={form.formState.isSubmitting}
                >
                  Submit Profile
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
