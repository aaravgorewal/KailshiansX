// src/lib/validations/team-application.ts
// Zod schemas for team recruitment applications and admin status updates ()

import { z } from "zod";
import { TEAM_AREAS, TEAM_APPLICATION_STATUSES } from "@/lib/team-constants";

export const teamApplicationSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address").max(120),
  phone: z
    .string()
    .min(10, "Please provide a valid 10-digit phone number")
    .max(16)
    .regex(/^[+0-9\s-]+$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),
  area: z.enum(TEAM_AREAS, {
    message: "Please choose a valid functional area",
  }),
  roleApplied: z.string().min(2, "Please specify the role you are applying for").max(150),
  linkedin: z.string().max(200).optional().or(z.literal("")),
  portfolio: z.string().max(200).optional().or(z.literal("")),
  resumeUrl: z.string().max(300).optional().or(z.literal("")),
  experience: z.string().max(4000).optional().or(z.literal("")),
  motivation: z
    .string()
    .min(5, "Tell us why you want to join KailshiansX (min 5 characters)")
    .max(4000),
  honeypot: z.string().max(0, "Bot submission rejected").optional().or(z.literal("")),
});

export const aboutRoleApplicationSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address").max(120),
  phone: z
    .string()
    .min(10, "Please provide a valid 10-digit phone number")
    .max(16)
    .regex(/^[+0-9\s-]+$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),
  role: z.string().min(2, "Please specify the role you are applying for").max(150),
  area: z.string().optional().or(z.literal("")),
  link: z.string().max(300).optional().or(z.literal("")),
  whyYou: z.string().min(5, "Please tell us why you want to join (min 5 characters)").max(4000),
  honeypot: z.string().max(0, "Bot submission rejected").optional().or(z.literal("")),
});

export type AboutRoleApplicationInput = z.infer<typeof aboutRoleApplicationSchema>;
export type TeamApplicationFormData = z.infer<typeof teamApplicationSchema>;

export const updateApplicationStatusSchema = z.object({
  id: z.string().min(1, "Application ID is required"),
  status: z.enum(TEAM_APPLICATION_STATUSES),
  adminNotes: z.string().max(2000).optional().or(z.literal("")),
});

export type UpdateApplicationStatusData = z.infer<typeof updateApplicationStatusSchema>;

export const updateTeamApplicationStatusSchema = updateApplicationStatusSchema;
