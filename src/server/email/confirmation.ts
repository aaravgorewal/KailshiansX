// src/server/email/confirmation.ts
// Compatibility layer routing through the centralized /src/server/email React Email queue.

import {
  queueRegistrationConfirmationEmail,
  queueApplicationReceivedEmail,
  queueCollaborationAckEmail,
  type SendRawEmailOptions,
  sendRawEmail,
} from "./index";

export interface SendConfirmationEmailParams {
  email: string;
  name: string;
  eventTitle: string;
  eventSlug: string;
  eventDate: Date;
  venue?: string | null;
  cityName?: string | null;
  ticketTierName: string;
  registrationCode: string;
  qrCodeDataUrl?: string | null;
}

export async function sendRegistrationConfirmationEmail(
  params: SendConfirmationEmailParams
): Promise<{ success: boolean; id?: string }> {
  try {
    const job = await queueRegistrationConfirmationEmail(params.email, {
      name: params.name,
      eventTitle: params.eventTitle,
      eventSlug: params.eventSlug,
      eventDate: params.eventDate,
      venue: params.venue,
      cityName: params.cityName,
      ticketTierName: params.ticketTierName,
      registrationCode: params.registrationCode,
      qrCodeDataUrl: params.qrCodeDataUrl,
    });

    return { success: true, id: job.messageId || job.id };
  } catch (err) {
    console.error("[sendRegistrationConfirmationEmail Error]:", err);
    return { success: false };
  }
}

export interface SendCampusLeadConfirmationParams {
  email: string;
  name: string;
  college: string;
  city: string;
  applicationId: string;
}

export async function sendCampusLeadConfirmationEmail(
  params: SendCampusLeadConfirmationParams
): Promise<{ success: boolean; id?: string }> {
  try {
    const job = await queueApplicationReceivedEmail(params.email, {
      name: params.name,
      applicationType: "CAMPUS_LEAD",
      referenceId: params.applicationId,
      roleOrJurisdiction: params.college,
      city: params.city,
    });

    return { success: true, id: job.messageId || job.id };
  } catch (err) {
    console.error("[sendCampusLeadConfirmationEmail Error]:", err);
    return { success: false };
  }
}

export interface SendStateLeadConfirmationParams {
  email: string;
  name: string;
  state: string;
  city: string;
  applicationId: string;
}

export async function sendStateLeadConfirmationEmail(
  params: SendStateLeadConfirmationParams
): Promise<{ success: boolean; id?: string }> {
  try {
    const job = await queueApplicationReceivedEmail(params.email, {
      name: params.name,
      applicationType: "STATE_LEAD",
      referenceId: params.applicationId,
      roleOrJurisdiction: params.state,
      city: params.city,
    });

    return { success: true, id: job.messageId || job.id };
  } catch (err) {
    console.error("[sendStateLeadConfirmationEmail Error]:", err);
    return { success: false };
  }
}

export interface SendCollaborationEmailParams {
  email: string;
  name: string;
  organisation: string;
  type: "COLLEGE" | "COMMUNITY" | "VENUE" | "SPONSOR";
  leadId: string;
  city: string;
  phone?: string | null;
  website?: string | null;
  proposedEvent: string;
  resourcesOffered: string;
  message?: string | null;
}

export async function sendCollaborationAcknowledgementEmail(
  params: SendCollaborationEmailParams
): Promise<{ success: boolean; id?: string }> {
  try {
    const refCode = `KX-COLLAB-${params.leadId.slice(-6).toUpperCase()}`;
    const job = await queueCollaborationAckEmail(params.email, {
      name: params.name,
      organisation: params.organisation,
      type: params.type,
      referenceCode: refCode,
      city: params.city,
      proposedScope: params.proposedEvent,
      resourcesOffered: params.resourcesOffered,
    });

    return { success: true, id: job.messageId || job.id };
  } catch (err) {
    console.error("[sendCollaborationAcknowledgementEmail Error]:", err);
    return { success: false };
  }
}

/**
 * Sends internal team alert on new collaboration lead
 */
export async function sendCollaborationInternalNotificationEmail(
  params: SendCollaborationEmailParams
): Promise<{ success: boolean; id?: string }> {
  const teamEmail =
    process.env.TEAM_NOTIFICATION_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    "partnerships@kailshiansx.com";

  const rawHtml = `
    <div style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 8px;">
      <h2>New Collaboration Lead: ${params.organisation}</h2>
      <p>Contact: ${params.name} (${params.email})</p>
      <p>Type: ${params.type}</p>
      <p>City: ${params.city}</p>
      <p>Proposed: ${params.proposedEvent}</p>
      <p>Resources: ${params.resourcesOffered}</p>
    </div>
  `;

  const options: SendRawEmailOptions = {
    to: teamEmail,
    subject: `[Lead Alert] ${params.organisation} (${params.type}) — ${params.city}`,
    html: rawHtml,
  };

  const res = await sendRawEmail(options);
  return { success: res.success, id: res.messageId };
}
