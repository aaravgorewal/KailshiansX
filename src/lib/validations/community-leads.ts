import { z } from "zod";

export const CAMPUS_LEAD_STATUSES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "SELECTED",
  "ACTIVE",
  "ALUMNI",
  "INACTIVE",
] as const;

export const STATE_LEAD_STATUSES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "SELECTED",
  "ACTIVE",
  "ALUMNI",
  "INACTIVE",
] as const;

// ─── Campus Lead Application Schema ──────────────────────────────────────────
export const campusLeadApplicationSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address").max(120),
  phone: z
    .string()
    .min(10, "Please provide a valid 10-digit phone number")
    .max(15)
    .regex(/^[+0-9\s-]+$/, "Invalid phone format"),
  college: z.string().min(3, "College or University name must be at least 3 characters").max(200),
  city: z.string().min(2, "City is required").max(100),
  courseYear: z
    .string()
    .min(2, "Please provide your course and year (e.g. B.Tech CSE - 3rd Year)")
    .max(100),
  linkedin: z.string().min(3, "LinkedIn profile link or handle is required").max(200),
  experience: z
    .string()
    .min(
      20,
      "Please share at least a few sentences about your technical/project experience (min 20 characters)"
    )
    .max(3000),
  communityInvolvement: z
    .string()
    .min(20, "Please detail your previous campus club or community involvement (min 20 characters)")
    .max(3000),
  whyKailshiansX: z
    .string()
    .min(20, "Tell us why you want to lead KailshiansX at your campus (min 20 characters)")
    .max(3000),
  availability: z
    .string()
    .min(2, "Please indicate your weekly time commitment (e.g. 5-10 hours/week)")
    .max(100),
  referredBy: z.string().max(100).optional().or(z.literal("")),
  honeypot: z.string().max(0, "Bot submission rejected").optional().or(z.literal("")),
});

export type CampusLeadApplicationInput = z.infer<typeof campusLeadApplicationSchema>;

// ─── State Lead Application Schema ────────────────────────────────────────────
export const stateLeadApplicationSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address").max(120),
  phone: z
    .string()
    .min(10, "Please provide a valid 10-digit phone number")
    .max(15)
    .regex(/^[+0-9\s-]+$/, "Invalid phone format"),
  state: z.string().min(2, "State / Region is required").max(100),
  city: z.string().min(2, "Base city is required").max(100),
  citiesCovered: z
    .string()
    .min(2, "Please list key cities you can coordinate across (e.g. Jaipur, Jodhpur, Udaipur)")
    .max(300),
  currentRole: z
    .string()
    .min(
      2,
      "Please share your current role or affiliation (e.g. Senior Student Lead, SDE-1, Tech Founder)"
    )
    .max(150),
  linkedin: z.string().min(3, "LinkedIn or professional portfolio profile is required").max(200),
  experience: z
    .string()
    .min(30, "Please outline your engineering and professional background (min 30 characters)")
    .max(4000),
  leadershipEvidence: z
    .string()
    .min(
      30,
      "Please detail proven evidence of organizing tech events, leading teams, or running communities (min 30 characters)"
    )
    .max(4000),
  communityVision: z
    .string()
    .min(
      30,
      "What is your strategic vision to expand KailshiansX across campuses and cities in your state? (min 30 characters)"
    )
    .max(4000),
  whyKailshiansX: z
    .string()
    .min(20, "Why KailshiansX over other developer networks? (min 20 characters)")
    .max(4000),
  availabilityHours: z
    .string()
    .min(2, "Please specify your expected weekly time commitment (e.g. 8-12 hours/week)")
    .max(100),
  honeypot: z.string().max(0, "Bot submission rejected").optional().or(z.literal("")),
});

export type StateLeadApplicationInput = z.infer<typeof stateLeadApplicationSchema>;

// ─── Start a Chapter / College Inquiry Schema ─────────────────────────────────
export const startChapterSchema = z.object({
  collegeName: z.string().min(3, "College or University name is required").max(200),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  applicantName: z.string().min(2, "Contact person name is required").max(100),
  applicantRole: z.string().min(2, "Role (e.g. Student President, Faculty Advisor)").max(100),
  email: z.string().email("Valid email is required").max(120),
  phone: z
    .string()
    .min(10, "Please provide a valid 10-digit phone number")
    .max(15)
    .regex(/^[+0-9\s-]+$/, "Invalid phone format"),
  estimatedStudents: z.string().min(1, "Please select estimated student community size"),
  message: z
    .string()
    .min(20, "Please describe your student developer club or vision for a chapter")
    .max(2000),
  honeypot: z.string().max(0, "Bot submission rejected").optional().or(z.literal("")),
});

export type StartChapterInput = z.infer<typeof startChapterSchema>;

// ─── Become a Mentor / Speaker Inquiry Schema ─────────────────────────────────
export const mentorSpeakerInquirySchema = z.object({
  name: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Valid email is required").max(120),
  phone: z
    .string()
    .min(10, "Please provide a valid 10-digit phone number")
    .max(15)
    .regex(/^[+0-9\s-]+$/, "Invalid phone format"),
  roleType: z.enum(["MENTOR", "SPEAKER", "BOTH"], {
    message: "Select whether you want to mentor, speak, or both",
  }),
  designation: z.string().min(2, "Current title/role is required").max(150),
  organisation: z.string().min(2, "Company or college is required").max(150),
  city: z.string().min(2, "City is required").max(100),
  linkedin: z.string().min(3, "LinkedIn profile is required").max(200),
  github: z.string().max(200).optional().or(z.literal("")),
  expertiseAreas: z
    .string()
    .min(5, "List your areas of expertise (e.g. Distributed Systems, Rust, AI Agents, Web3)")
    .max(300),
  talkTopicsOrMentorshipFocus: z
    .string()
    .min(
      20,
      "Describe your proposed talk topics or what you can mentor builders on (min 20 characters)"
    )
    .max(2000),
  honeypot: z.string().max(0, "Bot submission rejected").optional().or(z.literal("")),
});

export type MentorSpeakerInquiryInput = z.infer<typeof mentorSpeakerInquirySchema>;
