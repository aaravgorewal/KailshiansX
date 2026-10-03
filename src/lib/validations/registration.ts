import { z } from "zod";

export const registrationFormSchema = z.object({
  ticketTypeId: z.string().min(1, "Please select a ticket tier."),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be under 100 characters.")
    .regex(/^[a-zA-Z\s.'-]+$/, "Name contains invalid characters."),
  email: z.string().email("Please provide a valid email address.").toLowerCase().trim(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits.")
    .max(15, "Phone number is too long.")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number."),
  college: z.string().max(150, "College/Organization must be under 150 characters.").optional(),
  city: z.string().max(80, "City must be under 80 characters.").optional(),
  tshirtSize: z.enum(["S", "M", "L", "XL", "2XL"]).optional(),
  dietaryPref: z.enum(["VEG", "NON_VEG", "VEGAN", "JAIN"]).optional(),
  github: z.string().max(100).optional(),
  linkedin: z.string().max(150).optional(),
  teamName: z.string().max(100).optional(),
  projectIdea: z.string().max(500).optional(),
  // Honeypot spam check (must remain empty for human submissions)
  website_url_hp: z.string().max(0, "Bot submission detected.").optional(),
});

export type RegistrationFormData = z.infer<typeof registrationFormSchema>;
