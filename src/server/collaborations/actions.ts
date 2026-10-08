"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/server/security/rate-limit";
import {
  collegeCollaborationSchema,
  communityCollaborationSchema,
  venueCollaborationSchema,
  sponsorCollaborationSchema,
  partnerInquirySchema,
} from "@/lib/validations/collaborations";
import {
  sendCollaborationAcknowledgementEmail,
  sendCollaborationInternalNotificationEmail,
} from "@/server/email/confirmation";

export type CollaborationActionResult = {
  success: boolean;
  leadId?: string;
  referenceCode?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Helper to resolve or create a City record
 */
async function resolveCity(cityName: string, stateName?: string | null) {
  try {
    const trimmedCity = cityName.trim();
    let cityRecord = await db.city.findFirst({
      where: { name: { equals: trimmedCity, mode: "insensitive" } },
    });

    if (!cityRecord && trimmedCity) {
      cityRecord = await db.city.create({
        data: {
          name: trimmedCity,
          state: stateName?.trim() || "India",
        },
      });
    }
    return cityRecord;
  } catch (err) {
    console.error("City resolution fallback:", err);
    return null;
  }
}

/**
 * Path 1: College Collaboration ()
 * For universities, engineering colleges, faculties, and student councils
 */
export async function submitCollegeCollaboration(
  rawInput: unknown
): Promise<CollaborationActionResult> {
  // 1. Early anti-spam honeypot verification
  if (
    rawInput &&
    typeof rawInput === "object" &&
    "honeypot" in rawInput &&
    rawInput.honeypot &&
    String(rawInput.honeypot).trim().length > 0
  ) {
    return { success: false, error: "Bot detected. Submission rejected." };
  }

  // 2. Validate input schema
  const parsed = collegeCollaborationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please complete all required fields correctly.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const cityRecord = await resolveCity(data.city, data.state);

    const contactWithRole = `${data.contactPerson.trim()} (${data.roleDesignation.trim()})`;
    const proposedScope = `[Audience Reach: ${data.expectedStudentReach} students]\n${data.proposedEvent.trim()}`;
    const resourcesDesc = `Campus Facilities Offered:\n${data.resourcesOffered.trim()}`;

    const lead = await db.collaborationLead.create({
      data: {
        type: "COLLEGE",
        stage: "LEAD",
        organisation: data.organisation.trim(),
        contactPerson: contactWithRole,
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        website: data.website?.trim() || null,
        cityName: data.city.trim(),
        cityId: cityRecord?.id || null,
        proposedEvent: proposedScope,
        resourcesOffered: resourcesDesc,
        message: data.message?.trim() || null,
        adminNotes: `Submitted via /collaborations College form on ${new Date().toISOString()}`,
      },
    });

    const refCode = `KX-COLLAB-${lead.id.slice(-6).toUpperCase()}`;

    // 3. Send auto-acknowledgement and team alerts
    await Promise.allSettled([
      sendCollaborationAcknowledgementEmail({
        email: data.email.toLowerCase().trim(),
        name: data.contactPerson.trim(),
        organisation: data.organisation.trim(),
        type: "COLLEGE",
        leadId: lead.id,
        city: data.city.trim(),
        phone: data.phone.trim(),
        website: data.website?.trim() || null,
        proposedEvent: proposedScope,
        resourcesOffered: resourcesDesc,
        message: data.message?.trim() || null,
      }),
      sendCollaborationInternalNotificationEmail({
        email: data.email.toLowerCase().trim(),
        name: contactWithRole,
        organisation: data.organisation.trim(),
        type: "COLLEGE",
        leadId: lead.id,
        city: data.city.trim(),
        phone: data.phone.trim(),
        website: data.website?.trim() || null,
        proposedEvent: proposedScope,
        resourcesOffered: resourcesDesc,
        message: data.message?.trim() || null,
      }),
    ]);

    return {
      success: true,
      leadId: lead.id,
      referenceCode: refCode,
    };
  } catch (error) {
    console.error("Failed to submit college collaboration:", error);
    return {
      success: false,
      error:
        "An unexpected error occurred while saving your collaboration inquiry. Please try again.",
    };
  }
}

/**
 * Path 2: Community Partner ()
 * For developer meetup groups, tech user groups, and open-source collectives
 */
export async function submitCommunityCollaboration(
  rawInput: unknown
): Promise<CollaborationActionResult> {
  // 1. Early anti-spam honeypot verification
  if (
    rawInput &&
    typeof rawInput === "object" &&
    "honeypot" in rawInput &&
    rawInput.honeypot &&
    String(rawInput.honeypot).trim().length > 0
  ) {
    return { success: false, error: "Bot detected. Submission rejected." };
  }

  // 2. Validate input schema
  const parsed = communityCollaborationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please complete all required fields correctly.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const cityRecord = await resolveCity(data.city, data.state);

    const proposedScope = `[Focus: ${data.techFocus} | Size: ${data.communitySize} active devs]\n${data.proposedEvent.trim()}`;
    const resourcesDesc = `Community Co-promotion & Resources:\n${data.resourcesOffered.trim()}`;

    const lead = await db.collaborationLead.create({
      data: {
        type: "COMMUNITY",
        stage: "LEAD",
        organisation: data.organisation.trim(),
        contactPerson: data.contactPerson.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        website: data.website?.trim() || null,
        cityName: data.city.trim(),
        cityId: cityRecord?.id || null,
        proposedEvent: proposedScope,
        resourcesOffered: resourcesDesc,
        message: data.message?.trim() || null,
        adminNotes: `Submitted via /collaborations Community form on ${new Date().toISOString()}`,
      },
    });

    const refCode = `KX-COLLAB-${lead.id.slice(-6).toUpperCase()}`;

    // 3. Send emails
    await Promise.allSettled([
      sendCollaborationAcknowledgementEmail({
        email: data.email.toLowerCase().trim(),
        name: data.contactPerson.trim(),
        organisation: data.organisation.trim(),
        type: "COMMUNITY",
        leadId: lead.id,
        city: data.city.trim(),
        phone: data.phone.trim(),
        website: data.website?.trim() || null,
        proposedEvent: proposedScope,
        resourcesOffered: resourcesDesc,
        message: data.message?.trim() || null,
      }),
      sendCollaborationInternalNotificationEmail({
        email: data.email.toLowerCase().trim(),
        name: data.contactPerson.trim(),
        organisation: data.organisation.trim(),
        type: "COMMUNITY",
        leadId: lead.id,
        city: data.city.trim(),
        phone: data.phone.trim(),
        website: data.website?.trim() || null,
        proposedEvent: proposedScope,
        resourcesOffered: resourcesDesc,
        message: data.message?.trim() || null,
      }),
    ]);

    return {
      success: true,
      leadId: lead.id,
      referenceCode: refCode,
    };
  } catch (error) {
    console.error("Failed to submit community collaboration:", error);
    return {
      success: false,
      error:
        "An unexpected error occurred while saving your collaboration inquiry. Please try again.",
    };
  }
}

/**
 * Path 3: Venue Partner ()
 * For coworking spaces, technology parks, auditoriums, and startup incubators
 */
export async function submitVenueCollaboration(
  rawInput: unknown
): Promise<CollaborationActionResult> {
  // 1. Early anti-spam honeypot verification
  if (
    rawInput &&
    typeof rawInput === "object" &&
    "honeypot" in rawInput &&
    rawInput.honeypot &&
    String(rawInput.honeypot).trim().length > 0
  ) {
    return { success: false, error: "Bot detected. Submission rejected." };
  }

  // 2. Validate input schema
  const parsed = venueCollaborationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please complete all required fields correctly.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const cityRecord = await resolveCity(data.city);

    const proposedScope = `[Facility: ${data.facilityType} | Capacity: ${data.seatingCapacity} seats]\nAddress: ${data.address.trim()}\nEvent Formats: ${data.proposedEvent.trim()}`;
    const resourcesDesc = `Amenities: ${data.amenities.join(", ")}\nHosting Details: ${data.resourcesOffered.trim()}`;

    const lead = await db.collaborationLead.create({
      data: {
        type: "VENUE",
        stage: "LEAD",
        organisation: data.organisation.trim(),
        contactPerson: data.contactPerson.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        website: data.website?.trim() || null,
        cityName: data.city.trim(),
        cityId: cityRecord?.id || null,
        proposedEvent: proposedScope,
        resourcesOffered: resourcesDesc,
        message: data.message?.trim() || null,
        adminNotes: `Submitted via /collaborations Venue form on ${new Date().toISOString()}`,
      },
    });

    const refCode = `KX-COLLAB-${lead.id.slice(-6).toUpperCase()}`;

    // 3. Send emails
    await Promise.allSettled([
      sendCollaborationAcknowledgementEmail({
        email: data.email.toLowerCase().trim(),
        name: data.contactPerson.trim(),
        organisation: data.organisation.trim(),
        type: "VENUE",
        leadId: lead.id,
        city: data.city.trim(),
        phone: data.phone.trim(),
        website: data.website?.trim() || null,
        proposedEvent: proposedScope,
        resourcesOffered: resourcesDesc,
        message: data.message?.trim() || null,
      }),
      sendCollaborationInternalNotificationEmail({
        email: data.email.toLowerCase().trim(),
        name: data.contactPerson.trim(),
        organisation: data.organisation.trim(),
        type: "VENUE",
        leadId: lead.id,
        city: data.city.trim(),
        phone: data.phone.trim(),
        website: data.website?.trim() || null,
        proposedEvent: proposedScope,
        resourcesOffered: resourcesDesc,
        message: data.message?.trim() || null,
      }),
    ]);

    return {
      success: true,
      leadId: lead.id,
      referenceCode: refCode,
    };
  } catch (error) {
    console.error("Failed to submit venue collaboration:", error);
    return {
      success: false,
      error:
        "An unexpected error occurred while saving your collaboration inquiry. Please try again.",
    };
  }
}

/**
 * Path 4: Sponsor / Brand Partner ()
 * For tech firms, cloud platforms, dev tooling brands, and hiring sponsors
 */
export async function submitSponsorCollaboration(
  rawInput: unknown
): Promise<CollaborationActionResult> {
  // 1. Early anti-spam honeypot verification
  if (
    rawInput &&
    typeof rawInput === "object" &&
    "honeypot" in rawInput &&
    rawInput.honeypot &&
    String(rawInput.honeypot).trim().length > 0
  ) {
    return { success: false, error: "Bot detected. Submission rejected." };
  }

  // 2. Validate input schema
  const parsed = sponsorCollaborationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please complete all required fields correctly.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const cityRecord = await resolveCity(data.city);

    const contactWithRole = `${data.contactPerson.trim()} (${data.roleDesignation.trim()})`;
    const proposedScope = `[Sponsorship Scope: ${data.sponsorshipScope} | Budget: ${data.budgetTier} | Audience: ${data.targetAudience}]\nCampaign Vision: ${data.proposedEvent.trim()}`;
    const resourcesDesc = `Sponsorship Resources Offered:\n${data.resourcesOffered.trim()}`;

    const lead = await db.collaborationLead.create({
      data: {
        type: "SPONSOR",
        stage: "LEAD",
        organisation: data.organisation.trim(),
        contactPerson: contactWithRole,
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        website: data.website.trim(),
        cityName: data.city.trim(),
        cityId: cityRecord?.id || null,
        proposedEvent: proposedScope,
        resourcesOffered: resourcesDesc,
        message: data.message?.trim() || null,
        adminNotes: `Submitted via /collaborations Sponsor form on ${new Date().toISOString()}`,
      },
    });

    const refCode = `KX-COLLAB-${lead.id.slice(-6).toUpperCase()}`;

    // 3. Send emails
    await Promise.allSettled([
      sendCollaborationAcknowledgementEmail({
        email: data.email.toLowerCase().trim(),
        name: data.contactPerson.trim(),
        organisation: data.organisation.trim(),
        type: "SPONSOR",
        leadId: lead.id,
        city: data.city.trim(),
        phone: data.phone.trim(),
        website: data.website.trim(),
        proposedEvent: proposedScope,
        resourcesOffered: resourcesDesc,
        message: data.message?.trim() || null,
      }),
      sendCollaborationInternalNotificationEmail({
        email: data.email.toLowerCase().trim(),
        name: contactWithRole,
        organisation: data.organisation.trim(),
        type: "SPONSOR",
        leadId: lead.id,
        city: data.city.trim(),
        phone: data.phone.trim(),
        website: data.website.trim(),
        proposedEvent: proposedScope,
        resourcesOffered: resourcesDesc,
        message: data.message?.trim() || null,
      }),
    ]);

    return {
      success: true,
      leadId: lead.id,
      referenceCode: refCode,
    };
  } catch (error) {
    console.error("Failed to submit sponsor collaboration:", error);
    return {
      success: false,
      error:
        "An unexpected error occurred while saving your collaboration inquiry. Please try again.",
    };
  }
}

/**
 * Path 5: Unified Partner Inquiry (/partner)
 * Short form writing to CollaborationLead table with the type from radio
 */
export async function submitPartnerInquiry(rawInput: unknown): Promise<CollaborationActionResult> {
  // 1. Rate limiting check
  try {
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const rl = await checkRateLimit(ip, "form");
    if (!rl.success) {
      return {
        success: false,
        error: "Too many requests. Please wait a few moments before trying again.",
      };
    }
  } catch {
    // Non-request context (e.g. tests)
  }

  // 2. Anti-spam honeypot check
  if (
    rawInput &&
    typeof rawInput === "object" &&
    "honeypot" in rawInput &&
    rawInput.honeypot &&
    String(rawInput.honeypot).trim().length > 0
  ) {
    return { success: false, error: "Bot detected. Submission rejected." };
  }

  // 3. Schema validation
  const parsed = partnerInquirySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please complete all required fields correctly.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const cityRecord = await resolveCity(data.city);

    const lead = await db.collaborationLead.create({
      data: {
        type: data.type,
        stage: "LEAD",
        organisation: data.organisation.trim(),
        contactPerson: data.contactPerson.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        website: data.website?.trim() || null,
        cityName: data.city.trim(),
        cityId: cityRecord?.id || null,
        proposedEvent: data.message.trim(),
        resourcesOffered: `Partnership Inquiry (${data.type})`,
        message: data.message.trim(),
        adminNotes: `Submitted via /partner on ${new Date().toISOString()}`,
      },
    });

    const refCode = `KX-COLLAB-${lead.id.slice(-6).toUpperCase()}`;

    // 4. Trigger auto-acknowledgement and internal team notifications asynchronously
    await Promise.allSettled([
      sendCollaborationAcknowledgementEmail({
        email: data.email.toLowerCase().trim(),
        name: data.contactPerson.trim(),
        organisation: data.organisation.trim(),
        type: data.type,
        leadId: lead.id,
        city: data.city.trim(),
        phone: data.phone.trim(),
        website: data.website?.trim() || null,
        proposedEvent: data.message.trim(),
        resourcesOffered: `Partnership Inquiry (${data.type})`,
        message: data.message.trim(),
      }),
      sendCollaborationInternalNotificationEmail({
        email: data.email.toLowerCase().trim(),
        name: data.contactPerson.trim(),
        organisation: data.organisation.trim(),
        type: data.type,
        leadId: lead.id,
        city: data.city.trim(),
        phone: data.phone.trim(),
        website: data.website?.trim() || null,
        proposedEvent: data.message.trim(),
        resourcesOffered: `Partnership Inquiry (${data.type})`,
        message: data.message.trim(),
      }),
    ]);

    return {
      success: true,
      leadId: lead.id,
      referenceCode: refCode,
    };
  } catch (error) {
    console.error("Failed to submit partner inquiry:", error);
    return {
      success: false,
      error: "An unexpected error occurred while saving your inquiry. Please try again.",
    };
  }
}
