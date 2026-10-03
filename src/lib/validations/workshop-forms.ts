import { z } from "zod";

export const WORKSHOP_CATEGORIES = [
  "MERN",
  "Backend",
  "System Design",
  "DevOps",
  "Cloud",
  "AI",
  "Blockchain",
  "Open Source",
  "Career",
] as const;

export type WorkshopCategory = (typeof WORKSHOP_CATEGORIES)[number];

export const hostWorkshopSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Valid email address is required").max(120),
  phone: z
    .string()
    .min(10, "Please provide a valid 10-digit phone number")
    .max(15)
    .regex(/^[+0-9\s-]+$/, "Invalid phone format"),
  linkedin: z.string().min(3, "LinkedIn profile or username is required").max(200),
  github: z.string().max(200).optional().or(z.literal("")),
  topic: z
    .string()
    .min(6, "Workshop topic must be at least 6 characters")
    .max(150, "Topic title is too long"),
  category: z.enum(WORKSHOP_CATEGORIES, {
    message: "Please choose a valid workshop category",
  }),
  audienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"], {
    message: "Select an audience level",
  }),
  format: z.enum(["IN_PERSON", "VIRTUAL", "HYBRID"], {
    message: "Select preferred workshop format",
  }),
  expectedDuration: z.string().min(2, "Please indicate expected duration (e.g. 3 hours, Full Day)"),
  city: z.string().max(80).optional().or(z.literal("")),
  curriculum: z
    .string()
    .min(30, "Please provide a brief outline or curriculum of the session (at least 30 characters)")
    .max(2000),
  experience: z
    .string()
    .min(10, "Please briefly share your prior speaking or engineering experience")
    .max(1000),
  honeypot: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type HostWorkshopInput = z.infer<typeof hostWorkshopSchema>;

export const requestCollegeWorkshopSchema = z.object({
  collegeName: z
    .string()
    .min(3, "College or University name must be at least 3 characters")
    .max(150),
  contactPerson: z.string().min(2, "Contact person name is required").max(100),
  role: z
    .string()
    .min(2, "Your role is required (e.g. Campus Lead, Student Lead, Faculty Coordinator)")
    .max(80),
  email: z.string().email("Valid institutional or personal email is required").max(120),
  phone: z
    .string()
    .min(10, "Valid 10-digit contact number is required")
    .max(15)
    .regex(/^[+0-9\s-]+$/, "Invalid phone format"),
  city: z.string().min(2, "City name is required").max(80),
  preferredCategory: z.enum([...WORKSHOP_CATEGORIES, "OTHER"] as const, {
    message: "Please select a preferred technical focus",
  }),
  expectedAttendance: z.enum(["50-100", "100-250", "250-500", "500+"], {
    message: "Please select expected student turnout",
  }),
  preferredTimeline: z
    .string()
    .min(3, "Indicate preferred dates or month (e.g. November 2026)")
    .max(100),
  facilities: z
    .string()
    .min(
      10,
      "Please mention available campus infrastructure (e.g. Auditorium, Wi-Fi labs, Projector)"
    )
    .max(1000),
  message: z.string().max(1000).optional().or(z.literal("")),
  honeypot: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type RequestCollegeWorkshopInput = z.infer<typeof requestCollegeWorkshopSchema>;
