import { z } from "zod";

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;

/**
 * Path 1: College Collaboration Schema (PRD §13)
 * For universities, engineering colleges, polytechnics, and department faculties
 */
export const collegeCollaborationSchema = z.object({
  organisation: z
    .string()
    .min(3, "College or university name must be at least 3 characters")
    .max(150, "Name is too long"),
  contactPerson: z
    .string()
    .min(3, "Contact person name must be at least 3 characters")
    .max(100, "Name is too long"),
  roleDesignation: z
    .string()
    .min(2, "Designation / Role is required (e.g. Dean, HOD, Club Lead, TPO)")
    .max(100, "Designation is too long"),
  email: z.string().email("Please enter a valid official/institutional email address"),
  phone: z.string().regex(phoneRegex, "Please enter a valid phone or WhatsApp number"),
  website: z
    .string()
    .url("Please enter a valid website URL (including https://)")
    .optional()
    .or(z.literal("")),
  city: z.string().min(2, "City name must be at least 2 characters").max(100),
  state: z.string().optional().or(z.literal("")),
  expectedStudentReach: z.enum(["100-250", "250-500", "500-1000", "1000+"], {
    message: "Please select expected student audience reach",
  }),
  proposedEvent: z
    .string()
    .min(10, "Please briefly describe the proposed event or initiative (min 10 characters)")
    .max(1500, "Description is too long"),
  resourcesOffered: z
    .string()
    .min(5, "Please list facilities offered (e.g. Auditorium, Computer Lab, LAN, Faculty Support)")
    .max(1500, "Facilities description is too long"),
  message: z
    .string()
    .max(2000, "Message cannot exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  honeypot: z.string().max(0, "Bot detected").optional().or(z.literal("")),
});

export type CollegeCollaborationInput = z.infer<typeof collegeCollaborationSchema>;

/**
 * Path 2: Community Partner Schema (PRD §13)
 * For developer meetups, user groups, tech clubs, and open source collectives
 */
export const communityCollaborationSchema = z.object({
  organisation: z
    .string()
    .min(3, "Community name must be at least 3 characters")
    .max(150, "Name is too long"),
  contactPerson: z
    .string()
    .min(3, "Lead / Organiser name must be at least 3 characters")
    .max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(phoneRegex, "Please enter a valid phone or WhatsApp number"),
  website: z
    .string()
    .url("Please enter a valid community website, Meetup, Discord, or X link")
    .optional()
    .or(z.literal("")),
  city: z.string().min(2, "City / Region must be at least 2 characters").max(100),
  state: z.string().optional().or(z.literal("")),
  communitySize: z.enum(["100-500", "500-2000", "2000-5000", "5000+"], {
    message: "Please select active community member size",
  }),
  techFocus: z.enum(
    [
      "AI & Machine Learning",
      "Web & Full Stack",
      "Cloud, DevOps & Systems",
      "Open Source",
      "Mobile Development",
      "Web3 & Blockchain",
      "Cybersecurity",
      "General Developer Hub",
    ],
    { message: "Please select primary technical focus" }
  ),
  proposedEvent: z
    .string()
    .min(10, "Please describe the joint meetup, hackathon co-host, or cross-promotion initiative")
    .max(1500),
  resourcesOffered: z
    .string()
    .min(
      5,
      "Please specify resources to share (e.g. Member outreach, co-branding, volunteer crew, speakers)"
    )
    .max(1500),
  message: z.string().max(2000).optional().or(z.literal("")),
  honeypot: z.string().max(0, "Bot detected").optional().or(z.literal("")),
});

export type CommunityCollaborationInput = z.infer<typeof communityCollaborationSchema>;

/**
 * Path 3: Venue Partner Schema (PRD §13)
 * For coworking spaces, auditoriums, tech campuses, and incubator spaces
 */
export const venueCollaborationSchema = z.object({
  organisation: z
    .string()
    .min(3, "Venue or space name must be at least 3 characters")
    .max(150, "Name is too long"),
  contactPerson: z
    .string()
    .min(3, "Venue / Community Manager name must be at least 3 characters")
    .max(100, "Name is too long"),
  email: z.string().email("Please enter a valid contact email address"),
  phone: z.string().regex(phoneRegex, "Please enter a valid phone or WhatsApp number"),
  website: z
    .string()
    .url("Please enter a valid website or location link")
    .optional()
    .or(z.literal("")),
  city: z.string().min(2, "City must be at least 2 characters").max(100),
  address: z
    .string()
    .min(5, "Please provide the complete street address or prominent landmark")
    .max(250),
  facilityType: z.enum(
    [
      "Coworking Space",
      "University / College Auditorium",
      "Corporate Tech Campus",
      "Startup Incubator / Hub",
      "Conference Center",
      "Other",
    ],
    { message: "Please select the facility type" }
  ),
  seatingCapacity: z.enum(["50-100", "100-250", "250-500", "500+"], {
    message: "Please specify seating capacity",
  }),
  amenities: z.array(z.string()).min(1, "Please select at least one available amenity"),
  proposedEvent: z
    .string()
    .min(
      5,
      "Please specify event formats supported (e.g. Weekend Hackathons, Evening Meetups, Workshops)"
    )
    .max(1500),
  resourcesOffered: z
    .string()
    .min(5, "Please mention hosting terms, AV setup, Wi-Fi bandwidth, or parking availability")
    .max(1500),
  message: z.string().max(2000).optional().or(z.literal("")),
  honeypot: z.string().max(0, "Bot detected").optional().or(z.literal("")),
});

export type VenueCollaborationInput = z.infer<typeof venueCollaborationSchema>;

/**
 * Path 4: Sponsor / Brand Partner Schema (PRD §13)
 * For developer tooling companies, cloud providers, hiring sponsors, and consumer brands
 */
export const sponsorCollaborationSchema = z.object({
  organisation: z
    .string()
    .min(2, "Company or brand name must be at least 2 characters")
    .max(150, "Name is too long"),
  contactPerson: z
    .string()
    .min(3, "Contact name must be at least 3 characters")
    .max(100, "Name is too long"),
  roleDesignation: z
    .string()
    .min(2, "Designation / Title is required (e.g. DevRel Lead, Head of Marketing, Founder)")
    .max(100),
  email: z.string().email("Please enter your official work email"),
  phone: z.string().regex(phoneRegex, "Please enter a direct phone number"),
  website: z.string().url("Please enter company website URL (e.g. https://company.com)"),
  city: z.string().min(2, "Headquarters or primary operating city").max(100),
  targetAudience: z.enum(
    [
      "College Students & New Grads",
      "Working Software Engineers & Tech Leads",
      "AI / ML Researchers & Builders",
      "Founders & Early-stage Builders",
      "Broad Developer Ecosystem",
    ],
    { message: "Please specify target developer persona" }
  ),
  sponsorshipScope: z.enum(
    [
      "Hackathon Title Sponsor",
      "Hackathon Track / Bounty Sponsor",
      "Meetup Series Title / Annual Partner",
      "Workshop & Masterclass Series Partner",
      "Swag & Community Merchandise Partner",
      "Cloud Credits / API Grant Partner",
      "Custom / Multi-City Partnership",
    ],
    { message: "Please select sponsorship format" }
  ),
  budgetTier: z.enum(
    [
      "Under ₹50,000",
      "₹50,000 – ₹1,50,000",
      "₹1,50,000 – ₹5,00,000",
      "₹5,00,000+",
      "In-Kind / API Credits / Product Licences",
    ],
    { message: "Please select budget tier" }
  ),
  proposedEvent: z
    .string()
    .min(10, "Please describe the desired campaign, problem track, or sponsorship goals")
    .max(1500),
  resourcesOffered: z
    .string()
    .min(
      5,
      "Please mention contributions (Cash grant, Cloud credits, Mentors, Swag kits, Hiring spots)"
    )
    .max(1500),
  message: z.string().max(2000).optional().or(z.literal("")),
  honeypot: z.string().max(0, "Bot detected").optional().or(z.literal("")),
});

export type SponsorCollaborationInput = z.infer<typeof sponsorCollaborationSchema>;
