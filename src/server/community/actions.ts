"use server";

import { db } from "@/lib/db";
import {
  campusLeadApplicationSchema,
  stateLeadApplicationSchema,
  startChapterSchema,
  mentorSpeakerInquirySchema,
  type CampusLeadApplicationInput,
  type StateLeadApplicationInput,
  type StartChapterInput,
  type MentorSpeakerInquiryInput,
} from "@/lib/validations/community-leads";
import {
  sendCampusLeadConfirmationEmail,
  sendStateLeadConfirmationEmail,
} from "@/server/email/confirmation";

export interface CommunityActionResult {
  success: boolean;
  applicationId?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Submit Campus Lead Application ()
 * Workflow: APPLIED -> SCREENING -> INTERVIEW -> SELECTED -> ACTIVE -> ALUMNI/INACTIVE
 */
export async function applyCampusLead(
  rawInput: CampusLeadApplicationInput
): Promise<CommunityActionResult> {
  // Spam protection check before schema validation
  if (rawInput.honeypot && rawInput.honeypot.trim().length > 0) {
    return { success: false, error: "Bot detected. Submission rejected." };
  }

  const result = campusLeadApplicationSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      success: false,
      error: "Please correct the highlighted form errors.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;

  try {
    // Check if duplicate pending application exists
    const existing = await db.campusLeadApplication.findFirst({
      where: {
        email: data.email.toLowerCase().trim(),
        status: { in: ["APPLIED", "SCREENING", "INTERVIEW"] },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "An application with this email address is already under active review.",
      };
    }

    // Try finding or creating City
    let cityRecord = await db.city.findFirst({
      where: { name: { equals: data.city.trim(), mode: "insensitive" } },
    });

    if (!cityRecord) {
      cityRecord = await db.city.create({
        data: {
          name: data.city.trim(),
          state: "India",
        },
      });
    }

    // Create CampusLeadApplication with APPLIED status
    const application = await db.campusLeadApplication.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim(),
        college: data.college.trim(),
        city: data.city.trim(),
        cityId: cityRecord.id,
        courseYear: data.courseYear.trim(),
        linkedin: data.linkedin.trim(),
        experience: data.experience.trim(),
        communityInvolvement: data.communityInvolvement.trim(),
        whyKailshiansX: data.whyKailshiansX.trim(),
        availability: data.availability.trim(),
        referredBy: data.referredBy?.trim() || null,
        status: "APPLIED",
      },
    });

    // Send confirmation email asynchronously
    void sendCampusLeadConfirmationEmail({
      email: application.email,
      name: application.name,
      college: application.college,
      city: application.city || data.city,
      applicationId: application.id,
    });

    return {
      success: true,
      applicationId: application.id,
    };
  } catch (error) {
    console.error("Campus Lead application error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while saving your application. Please try again.",
    };
  }
}

/**
 * Submit State Lead Application ()
 * Workflow: APPLIED -> SCREENING -> INTERVIEW -> SELECTED -> ACTIVE -> ALUMNI/INACTIVE
 */
export async function applyStateLead(
  rawInput: StateLeadApplicationInput
): Promise<CommunityActionResult> {
  // Spam protection early check
  if (rawInput.honeypot && rawInput.honeypot.trim().length > 0) {
    return { success: false, error: "Bot detected. Submission rejected." };
  }

  const result = stateLeadApplicationSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      success: false,
      error: "Please correct the highlighted form errors.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;

  try {
    const existing = await db.stateLeadApplication.findFirst({
      where: {
        email: data.email.toLowerCase().trim(),
        status: { in: ["APPLIED", "SCREENING", "INTERVIEW"] },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "A state lead application with this email address is already under review.",
      };
    }

    const application = await db.stateLeadApplication.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim(),
        state: data.state.trim(),
        city: data.city.trim(),
        citiesCovered: data.citiesCovered.trim(),
        currentRole: data.currentRole.trim(),
        linkedin: data.linkedin.trim(),
        experience: data.experience.trim(),
        leadershipEvidence: data.leadershipEvidence.trim(),
        communityVision: data.communityVision.trim(),
        whyKailshiansX: data.whyKailshiansX.trim(),
        availabilityHours: data.availabilityHours.trim(),
        status: "APPLIED",
      },
    });

    void sendStateLeadConfirmationEmail({
      email: application.email,
      name: application.name,
      state: application.state,
      city: application.city || data.city,
      applicationId: application.id,
    });

    return {
      success: true,
      applicationId: application.id,
    };
  } catch (error) {
    console.error("State Lead application error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while saving your application. Please try again.",
    };
  }
}

/**
 * Submit Start a Chapter Inquiry ()
 * Feeds CollaborationLead pipeline as COLLEGE partner
 */
export async function submitStartChapterInquiry(
  rawInput: StartChapterInput
): Promise<CommunityActionResult> {
  if (rawInput.honeypot && rawInput.honeypot.trim().length > 0) {
    return { success: false, error: "Bot detected." };
  }

  const result = startChapterSchema.safeParse(rawInput);
  if (!result.success) {
    return {
      success: false,
      error: "Please correct the form fields.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;

  try {
    let cityRecord = await db.city.findFirst({
      where: { name: { equals: data.city.trim(), mode: "insensitive" } },
    });

    if (!cityRecord) {
      cityRecord = await db.city.create({
        data: {
          name: data.city.trim(),
          state: data.state.trim(),
        },
      });
    }

    const lead = await db.collaborationLead.create({
      data: {
        type: "COLLEGE",
        stage: "LEAD",
        organisation: data.collegeName.trim(),
        contactPerson: `${data.applicantName.trim()} (${data.applicantRole.trim()})`,
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim(),
        cityId: cityRecord.id,
        proposedEvent: `College Chapter: ${data.collegeName.trim()} (${data.city.trim()}, ${data.state.trim()})`,
        resourcesOffered: `Estimated Student Audience: ${data.estimatedStudents}`,
        message: `Chapter Vision:\n${data.message.trim()}`,
        adminNotes: `Submitted via /community Start a Chapter modal on ${new Date().toISOString()}`,
      },
    });

    return {
      success: true,
      applicationId: lead.id,
    };
  } catch (error) {
    console.error("Chapter inquiry submission error:", error);
    return {
      success: false,
      error: "Could not submit chapter inquiry. Please try again.",
    };
  }
}

/**
 * Submit Mentor or Speaker Inquiry ()
 * Feeds CollaborationLead pipeline as COMMUNITY partner
 */
export async function submitMentorSpeakerInquiry(
  rawInput: MentorSpeakerInquiryInput
): Promise<CommunityActionResult> {
  if (rawInput.honeypot && rawInput.honeypot.trim().length > 0) {
    return { success: false, error: "Bot detected." };
  }

  const result = mentorSpeakerInquirySchema.safeParse(rawInput);
  if (!result.success) {
    return {
      success: false,
      error: "Please correct the form fields.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;

  try {
    let cityRecord = await db.city.findFirst({
      where: { name: { equals: data.city.trim(), mode: "insensitive" } },
    });

    if (!cityRecord) {
      cityRecord = await db.city.create({
        data: {
          name: data.city.trim(),
          state: "India",
        },
      });
    }

    const lead = await db.collaborationLead.create({
      data: {
        type: "COMMUNITY",
        stage: "LEAD",
        organisation: `${data.designation.trim()} at ${data.organisation.trim()}`,
        contactPerson: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim(),
        website: data.linkedin.trim(),
        cityId: cityRecord.id,
        proposedEvent: `Community ${data.roleType === "MENTOR" ? "Mentorship" : data.roleType === "SPEAKER" ? "Speaker" : "Speaker & Mentor"} Roster`,
        resourcesOffered: `Expertise Areas: ${data.expertiseAreas.trim()}\nLinkedIn: ${data.linkedin.trim()}${data.github ? `\nGitHub: ${data.github.trim()}` : ""}`,
        message: `Role Focus: ${data.roleType}\n\nTopics / Mentorship Vision:\n${data.talkTopicsOrMentorshipFocus.trim()}`,
        adminNotes: `Submitted via /community Mentor/Speaker modal on ${new Date().toISOString()}`,
      },
    });

    return {
      success: true,
      applicationId: lead.id,
    };
  } catch (error) {
    console.error("Mentor/Speaker inquiry error:", error);
    return {
      success: false,
      error: "Could not submit inquiry. Please try again.",
    };
  }
}
