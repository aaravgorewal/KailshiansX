"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
import { trackApplicationSubmit } from "@/lib/analytics";
import {
  stateLeadApplicationSchema,
  type StateLeadApplicationInput,
} from "@/lib/validations/community-leads";
import { applyStateLead } from "@/server/community/actions";

export function StateLeadFormClient() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successAppId, setSuccessAppId] = React.useState<string | null>(null);

  const form = useForm<StateLeadApplicationInput>({
    resolver: zodResolver(stateLeadApplicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      state: "",
      city: "",
      citiesCovered: "",
      currentRole: "",
      linkedin: "",
      experience: "",
      leadershipEvidence: "",
      communityVision: "",
      whyKailshiansX: "",
      availabilityHours: "8-12 hours/week",
      honeypot: "",
    },
  });

  const onSubmit = async (values: StateLeadApplicationInput) => {
    setServerError(null);
    try {
      const res = await applyStateLead(values);
      if (res.success && res.applicationId) {
        trackApplicationSubmit({
          type: "state_lead",
          roleOrTrack: values.state,
        });
        setSuccessAppId(res.applicationId);
        form.reset();
      } else {
        setServerError(res.error || "Unable to submit application. Please review your entries.");
      }
    } catch {
      setServerError("An unexpected network error occurred. Please try again.");
    }
  };

  if (successAppId) {
    return (
      <Card className="space-y-6 p-8 text-center sm:p-12">
        <div className="border-border bg-muted text-success mx-auto flex size-14 items-center justify-center rounded-full border">
          <Check className="size-7" />
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-semibold uppercase">
            Stage 1: Executive Dossier Logged
          </p>
          <h3 className="text-foreground text-xl font-bold">State Lead Application Received</h3>
          <p className="text-success text-sm font-medium">
            Your leadership submission has entered executive review.
          </p>
        </div>

        <div className="border-border bg-muted mx-auto max-w-md space-y-1 rounded-md border p-4 text-left">
          <div className="text-muted-foreground text-xs font-medium uppercase">
            Executive Dossier Reference
          </div>
          <div className="text-foreground font-mono text-sm font-bold select-all">
            {successAppId}
          </div>
        </div>

        <div className="border-border bg-muted/40 text-muted-foreground mx-auto max-w-md space-y-2 rounded-md border p-4 text-left text-xs">
          <p className="text-foreground font-semibold">Executive Selection Roadmap</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Application Registered (Under Review)</li>
            <li>Executive Background & Ecosystem Screening (3–5 business days)</li>
            <li>Strategic Vision Interview with Founder & Steering Committee</li>
            <li>State Jurisdiction Charter, Budget Allocation & Lead Access</li>
          </ol>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSuccessAppId(null)}
          className="text-xs"
        >
          Submit Another Application
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="border-border border-b pb-4">
            <h3 className="text-foreground text-lg font-bold">State Lead Application Form</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Please provide complete details regarding your engineering leadership, community
              organizing experience, and expansion roadmap.
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
                  <FormLabel required>Phone Number (WhatsApp)</FormLabel>
                  <FormControl>
                    <FormInput placeholder="+91 98765 43210" {...field} />
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
                  <FormLabel required>State / Territory</FormLabel>
                  <FormControl>
                    <FormInput placeholder="e.g. Rajasthan, Uttarakhand, Punjab" {...field} />
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
                  <FormLabel required>Base City</FormLabel>
                  <FormControl>
                    <FormInput placeholder="e.g. Jaipur" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Current Role / Affiliation</FormLabel>
                  <FormControl>
                    <FormInput placeholder="e.g. Tech Lead, Community Organizer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="citiesCovered"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Key Cities in Jurisdiction</FormLabel>
                <FormControl>
                  <FormInput placeholder="e.g. Jaipur, Jodhpur, Udaipur, Kota" {...field} />
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
                <FormLabel required>LinkedIn or Professional Profile</FormLabel>
                <FormControl>
                  <FormInput placeholder="https://linkedin.com/in/username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Engineering & Professional Background</FormLabel>
                <FormControl>
                  <FormTextarea
                    placeholder="Outline your engineering background, companies worked with, open-source work, and key products built..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leadershipEvidence"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Proven Community Leadership & Organizing Experience</FormLabel>
                <FormControl>
                  <FormTextarea
                    placeholder="Detail tech meetups, hackathons, college clubs, or conferences you have led or organized..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="communityVision"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Strategic State Expansion Vision</FormLabel>
                <FormControl>
                  <FormTextarea
                    placeholder="How will you build campus chapters, recruit campus leads, and scale regional meetup brands across your state?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whyKailshiansX"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Why KailshiansX?</FormLabel>
                <FormControl>
                  <FormTextarea
                    placeholder="Why do you choose to lead with KailshiansX over other developer organizations?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availabilityHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Expected Weekly Commitment</FormLabel>
                <FormControl>
                  <FormSelect
                    options={[
                      { value: "5-8 hours/week", label: "5–8 hours / week" },
                      { value: "8-12 hours/week", label: "8–12 hours / week (Recommended)" },
                      { value: "12+ hours/week", label: "12+ hours / week" },
                    ]}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" isLoading={form.formState.isSubmitting}>
              Submit State Lead Application
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
