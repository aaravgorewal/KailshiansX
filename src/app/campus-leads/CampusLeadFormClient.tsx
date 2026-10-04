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
  campusLeadApplicationSchema,
  type CampusLeadApplicationInput,
} from "@/lib/validations/community-leads";
import { applyCampusLead } from "@/server/community/actions";

export function CampusLeadFormClient() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successAppId, setSuccessAppId] = React.useState<string | null>(null);

  const form = useForm<CampusLeadApplicationInput>({
    resolver: zodResolver(campusLeadApplicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      college: "",
      city: "",
      courseYear: "",
      linkedin: "",
      experience: "",
      communityInvolvement: "",
      whyKailshiansX: "",
      availability: "5-10 hours/week",
      referredBy: "",
      honeypot: "",
    },
  });

  const onSubmit = async (values: CampusLeadApplicationInput) => {
    setServerError(null);
    try {
      const res = await applyCampusLead(values);
      if (res.success && res.applicationId) {
        trackApplicationSubmit({
          type: "campus_lead",
          roleOrTrack: values.college,
        });
        setSuccessAppId(res.applicationId);
        form.reset();
      } else {
        setServerError(res.error || "Unable to submit application. Please check your inputs.");
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
            Stage 1: Application Logged
          </p>
          <h3 className="text-foreground text-xl font-bold">You&apos;re in the Pipeline!</h3>
          <p className="text-success text-sm font-medium">
            Your Campus Lead application has been registered.
          </p>
        </div>

        <div className="border-border bg-muted mx-auto max-w-md space-y-1 rounded-md border p-4 text-left">
          <div className="text-muted-foreground text-xs font-medium uppercase">
            Application Reference
          </div>
          <div className="text-foreground font-mono text-sm font-bold select-all">
            {successAppId}
          </div>
        </div>

        <div className="border-border bg-muted/40 text-muted-foreground mx-auto max-w-md space-y-2 rounded-md border p-4 text-left text-xs">
          <p className="text-foreground font-semibold">What Happens Next?</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Application Received (Logged)</li>
            <li>Profile & Campus Standing Screening (2–3 business days)</li>
            <li>1:1 Video Interview with Community Core Team</li>
            <li>Final Selection, Induction Kit & Lead Badge</li>
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
            <h3 className="text-foreground text-lg font-bold">Campus Lead Application Form</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Fill out all fields thoughtfully. We evaluate builder passion, club involvement, and
              leadership initiative.
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
                    <FormInput type="email" placeholder="aarav@college.edu" {...field} />
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
              name="college"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>College / University</FormLabel>
                  <FormControl>
                    <FormInput placeholder="e.g. Graphic Era Hill University" {...field} />
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
              name="courseYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Course & Year of Study</FormLabel>
                  <FormControl>
                    <FormInput placeholder="e.g. B.Tech CSE - 3rd Year" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>LinkedIn Profile</FormLabel>
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
                <FormLabel required>Technical Background & Projects Shipped</FormLabel>
                <FormControl>
                  <FormTextarea
                    placeholder="Describe your tech stack, hackathons built, open-source repositories, or apps deployed..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="communityInvolvement"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Campus Club & Community Involvement</FormLabel>
                <FormControl>
                  <FormTextarea
                    placeholder="Mention any existing tech club leadership, volunteer work, or workshops organized..."
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
                <FormLabel required>Why do you want to lead KailshiansX at your campus?</FormLabel>
                <FormControl>
                  <FormTextarea
                    placeholder="What vision do you have for the student developers in your college? How will you build the culture?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Weekly Time Commitment</FormLabel>
                  <FormControl>
                    <FormSelect
                      options={[
                        { value: "3-5 hours/week", label: "3–5 hours / week" },
                        { value: "5-10 hours/week", label: "5–10 hours / week (Recommended)" },
                        { value: "10+ hours/week", label: "10+ hours / week" },
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
              name="referredBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral Code / Member Name (Optional)</FormLabel>
                  <FormControl>
                    <FormInput placeholder="Who referred you to this program?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" isLoading={form.formState.isSubmitting}>
              Submit Campus Lead Application
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
