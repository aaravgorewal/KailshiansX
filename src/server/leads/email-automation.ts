// src/server/leads/email-automation.ts
// Automated email sequences for Campus & State Leads and Post-Event attendee activation.

import { db } from "@/lib/db";
import { EmailTemplate } from "@prisma/client";
import { enqueueEmail } from "@/server/email/queue";

export interface SendOnboardingOptions {
  leadId: string;
  leadType: "CAMPUS_LEAD" | "STATE_LEAD";
  recipientEmail?: string;
  leadName?: string;
  collegeOrState?: string;
  referralCode?: string;
}

/**
 * Dispatches onboarding welcome sequence to a chartered lead.
 */
export async function sendLeadOnboardingEmail(options: SendOnboardingOptions) {
  let recipient = options.recipientEmail;
  let name = options.leadName;
  let collegeOrState = options.collegeOrState;
  let referralCode = options.referralCode;

  // Resolve lead from DB if details not directly supplied
  if (!recipient || !name || !collegeOrState || !referralCode) {
    if (options.leadType === "CAMPUS_LEAD") {
      const lead = await db.campusLead.findUnique({
        where: { id: options.leadId },
        include: { user: true, college: true, city: true },
      });
      if (!lead) throw new Error(`Campus lead not found: ${options.leadId}`);
      recipient = recipient || lead.user.email;
      name = name || lead.user.name || "Leader";
      collegeOrState = collegeOrState || lead.college?.name || lead.city?.name || "Campus";
      referralCode =
        referralCode || lead.referralCode || `KX-CAMP-${lead.id.slice(-6).toUpperCase()}`;
    } else {
      const lead = await db.stateLead.findUnique({
        where: { id: options.leadId },
        include: { user: true },
      });
      if (!lead) throw new Error(`State lead not found: ${options.leadId}`);
      recipient = recipient || lead.user.email;
      name = name || lead.user.name || "Leader";
      collegeOrState = collegeOrState || lead.state;
      referralCode =
        referralCode || lead.referralCode || `KX-STATE-${lead.id.slice(-6).toUpperCase()}`;
    }
  }

  const log = await enqueueEmail({
    template: EmailTemplate.LEAD_ONBOARDING,
    recipient,
    payload: {
      name,
      leadType: options.leadType,
      collegeOrState,
      referralCode,
      dashboardUrl: "https://kailshiansx.com/lead",
      handbookUrl: "https://kailshiansx.com/docs/lead-handbook",
      discordUrl: "https://discord.gg/kailshiansx",
    },
    immediate: true,
  });

  return { success: true, emailLogId: log.id, recipient };
}

/**
 * Scans all active Campus & State leads for inactivity (>30 days since last activity or monthly report).
 * Enqueues polite inactivity nudges.
 */
export async function checkAndSendInactivityNudges(): Promise<{
  campusNudgesSent: number;
  stateNudgesSent: number;
  totalNudges: number;
  nudgedLeads: Array<{
    id: string;
    name: string;
    email: string;
    leadType: string;
    daysInactive: number;
  }>;
}> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const nudgedLeads: Array<{
    id: string;
    name: string;
    email: string;
    leadType: string;
    daysInactive: number;
  }> = [];

  // 1. Scan Campus Leads
  const campusLeads = await db.campusLead.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: true,
      college: true,
      city: true,
      activities: { orderBy: { date: "desc" }, take: 1 },
      monthlyReports: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  for (const cl of campusLeads) {
    const lastActivity = cl.activities[0]?.date || cl.startDate;
    const lastReport = cl.monthlyReports[0]?.createdAt || cl.startDate;
    const latestTouchpoint = new Date(
      Math.max(new Date(lastActivity).getTime(), new Date(lastReport).getTime())
    );

    if (latestTouchpoint < thirtyDaysAgo) {
      // Check if a nudge was already sent to this email recently
      const recentNudge = await db.emailLog.findFirst({
        where: {
          recipient: cl.user.email.toLowerCase(),
          template: EmailTemplate.LEAD_INACTIVITY_NUDGE,
          createdAt: { gte: fourteenDaysAgo },
        },
      });

      if (!recentNudge) {
        const daysInactive = Math.floor(
          (Date.now() - latestTouchpoint.getTime()) / (1000 * 60 * 60 * 24)
        );
        await enqueueEmail({
          template: EmailTemplate.LEAD_INACTIVITY_NUDGE,
          recipient: cl.user.email,
          payload: {
            name: cl.user.name || "Campus Lead",
            leadType: "CAMPUS_LEAD",
            collegeOrState: cl.college?.name || cl.city?.name || "Campus",
            daysInactive,
            referralCode: cl.referralCode,
            dashboardUrl: "https://kailshiansx.com/lead/campus",
          },
          immediate: true,
        });

        nudgedLeads.push({
          id: cl.id,
          name: cl.user.name || "Leader",
          email: cl.user.email,
          leadType: "CAMPUS_LEAD",
          daysInactive,
        });
      }
    }
  }

  // 2. Scan State Leads
  const stateLeads = await db.stateLead.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: true,
      activities: { orderBy: { date: "desc" }, take: 1 },
      monthlyReports: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  for (const sl of stateLeads) {
    const lastActivity = sl.activities[0]?.date || sl.startDate;
    const lastReport = sl.monthlyReports[0]?.createdAt || sl.startDate;
    const latestTouchpoint = new Date(
      Math.max(new Date(lastActivity).getTime(), new Date(lastReport).getTime())
    );

    if (latestTouchpoint < thirtyDaysAgo) {
      const recentNudge = await db.emailLog.findFirst({
        where: {
          recipient: sl.user.email.toLowerCase(),
          template: EmailTemplate.LEAD_INACTIVITY_NUDGE,
          createdAt: { gte: fourteenDaysAgo },
        },
      });

      if (!recentNudge) {
        const daysInactive = Math.floor(
          (Date.now() - latestTouchpoint.getTime()) / (1000 * 60 * 60 * 24)
        );
        await enqueueEmail({
          template: EmailTemplate.LEAD_INACTIVITY_NUDGE,
          recipient: sl.user.email,
          payload: {
            name: sl.user.name || "State Lead",
            leadType: "STATE_LEAD",
            collegeOrState: sl.state,
            daysInactive,
            referralCode: sl.referralCode,
            dashboardUrl: "https://kailshiansx.com/lead/state",
          },
          immediate: true,
        });

        nudgedLeads.push({
          id: sl.id,
          name: sl.user.name || "Leader",
          email: sl.user.email,
          leadType: "STATE_LEAD",
          daysInactive,
        });
      }
    }
  }

  const campusNudgesSent = nudgedLeads.filter((l) => l.leadType === "CAMPUS_LEAD").length;
  const stateNudgesSent = nudgedLeads.filter((l) => l.leadType === "STATE_LEAD").length;

  return {
    campusNudgesSent,
    stateNudgesSent,
    totalNudges: nudgedLeads.length,
    nudgedLeads,
  };
}

/**
 * Triggers post-event feedback survey and "Next Step" CTAs (Volunteer / Campus Lead / State Lead / Speaker)
 * for all confirmed attendees of an event.
 */
export async function sendPostEventFeedbackAndNextSteps(eventId: string): Promise<{
  success: boolean;
  eventTitle: string;
  totalSent: number;
  recipientEmails: string[];
}> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, slug: true },
  });

  if (!event) {
    throw new Error(`Event not found: ${eventId}`);
  }

  const attendees = await db.registration.findMany({
    where: {
      eventId,
      status: "CONFIRMED",
    },
    include: {
      certificate: { select: { uniqueId: true } },
    },
  });

  const recipientEmails: string[] = [];

  for (const att of attendees) {
    // Check if post-event email was already sent
    const alreadySent = await db.emailLog.findFirst({
      where: {
        recipient: att.email.toLowerCase(),
        template: EmailTemplate.POST_EVENT_FEEDBACK_NEXT_STEP,
        subject: { contains: event.title },
      },
    });

    if (alreadySent) continue;

    const certUrl = att.certificate?.uniqueId
      ? `https://kailshiansx.com/verify?id=${encodeURIComponent(att.certificate.uniqueId)}`
      : null;

    await enqueueEmail({
      template: EmailTemplate.POST_EVENT_FEEDBACK_NEXT_STEP,
      recipient: att.email,
      payload: {
        attendeeName: att.name,
        eventTitle: event.title,
        eventSlug: event.slug,
        certificateUrl: certUrl,
        feedbackUrl: `https://kailshiansx.com/events/${event.slug}?feedback=1`,
        volunteerUrl: "https://kailshiansx.com/collaborations",
        campusLeadUrl: "https://kailshiansx.com/campus-leads",
        stateLeadUrl: "https://kailshiansx.com/state-leads",
        speakerUrl: "https://kailshiansx.com/collaborations",
      },
      immediate: true,
    });

    recipientEmails.push(att.email);
  }

  return {
    success: true,
    eventTitle: event.title,
    totalSent: recipientEmails.length,
    recipientEmails,
  };
}
