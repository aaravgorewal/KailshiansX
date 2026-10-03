"use server";

import { db } from "@/lib/db";
import { writeAudit } from "@/server/auth/audit";
import {
  hostWorkshopSchema,
  requestCollegeWorkshopSchema,
  type HostWorkshopInput,
  type RequestCollegeWorkshopInput,
} from "@/lib/validations/workshop-forms";

export interface FormSubmissionResult {
  success: boolean;
  message?: string;
  error?: string;
  leadId?: string;
}

/**
 * Host a Workshop: Developer/Mentor submission feeding CollaborationLead pipeline
 */
export async function submitHostWorkshop(
  rawInput: HostWorkshopInput
): Promise<FormSubmissionResult> {
  const parsed = hostWorkshopSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Validation failed";
    return { success: false, error: errorMsg };
  }

  const data = parsed.data;

  // Spam Honeypot Protection
  if (data.honeypot && data.honeypot.length > 0) {
    return { success: false, error: "Spam submission detected" };
  }

  try {
    // Attempt city lookup
    let cityId: string | undefined = undefined;
    if (data.city) {
      const city = await db.city.findFirst({
        where: { name: { equals: data.city.trim(), mode: "insensitive" } },
      });
      if (city) cityId = city.id;
    }

    const lead = await db.collaborationLead.create({
      data: {
        type: "COMMUNITY",
        stage: "LEAD",
        organisation: `${data.name} (Independent Mentor / Speaker)`,
        contactPerson: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        website: data.linkedin.trim(),
        cityId,
        proposedEvent: `Workshop: ${data.topic} [${data.category}] - ${data.format} (${data.expectedDuration}) - Level: ${data.audienceLevel}`,
        resourcesOffered: `Curriculum Outline:\n${data.curriculum}\n\nExperience:\n${data.experience}\nGitHub: ${data.github || "N/A"}\nCity: ${data.city || "Not specified"}`,
        message: `Proposed Workshop: ${data.topic} (${data.category})`,
        adminNotes: `Submitted via /workshops "Host a Workshop" funnel on ${new Date().toISOString()}`,
      },
    });

    await writeAudit({
      action: "CREATE",
      entityType: "CollaborationLead",
      entityId: lead.id,
      after: {
        type: lead.type,
        stage: lead.stage,
        email: lead.email,
        organisation: lead.organisation,
      },
    });

    return {
      success: true,
      message:
        "Workshop proposal received! Our developer ecosystem team will review your outline and get in touch within 48 hours.",
      leadId: lead.id,
    };
  } catch (error) {
    console.error("Host workshop submission error:", error);
    return {
      success: false,
      error: "Could not save your proposal. Please try again or reach out on hello@kailshiansx.com",
    };
  }
}

/**
 * Request a Workshop at Your College: Campus lead/faculty submission feeding CollaborationLead pipeline
 */
export async function submitCollegeWorkshopRequest(
  rawInput: RequestCollegeWorkshopInput
): Promise<FormSubmissionResult> {
  const parsed = requestCollegeWorkshopSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Validation failed";
    return { success: false, error: errorMsg };
  }

  const data = parsed.data;

  // Spam Honeypot Protection
  if (data.honeypot && data.honeypot.length > 0) {
    return { success: false, error: "Spam submission detected" };
  }

  try {
    let cityId: string | undefined = undefined;
    if (data.city) {
      const city = await db.city.findFirst({
        where: { name: { equals: data.city.trim(), mode: "insensitive" } },
      });
      if (city) cityId = city.id;
    }

    const lead = await db.collaborationLead.create({
      data: {
        type: "COLLEGE",
        stage: "LEAD",
        organisation: data.collegeName.trim(),
        contactPerson: `${data.contactPerson.trim()} (${data.role.trim()})`,
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        cityId,
        proposedEvent: `College Workshop: [${data.preferredCategory}] - Expected Students: ${data.expectedAttendance} - Preferred Timeline: ${data.preferredTimeline}`,
        resourcesOffered: `Campus Infrastructure:\n${data.facilities}\nCity: ${data.city}`,
        message: data.message ? data.message.trim() : `Workshop request for ${data.collegeName}`,
        adminNotes: `Submitted via /workshops "Request a Workshop at Your College" funnel on ${new Date().toISOString()}`,
      },
    });

    await writeAudit({
      action: "CREATE",
      entityType: "CollaborationLead",
      entityId: lead.id,
      after: {
        type: lead.type,
        stage: lead.stage,
        email: lead.email,
        organisation: lead.organisation,
      },
    });

    return {
      success: true,
      message:
        "College workshop request submitted! Our campus partnerships lead will reach out to schedule an onboarding call.",
      leadId: lead.id,
    };
  } catch (error) {
    console.error("College workshop request error:", error);
    return {
      success: false,
      error: "Could not save your request. Please try again or contact us directly.",
    };
  }
}
