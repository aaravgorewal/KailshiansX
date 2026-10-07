// src/server/leads/service.ts
// Comprehensive Campus Lead and State Lead Data Engine per .
// Manages: Scope, Referrals, Events Supported, Activities Log, Performance Scoring, and Monthly Reports.

import { db } from "@/lib/db";
import {
  type CampusLeadStatus,
  type StateLeadStatus,
  type LeadActivityType,
  type MonthlyReportStatus,
} from "@prisma/client";

export type LeadershipTier = "PLATINUM" | "GOLD" | "SILVER" | "BRONZE";

export interface PerformanceScoreResult {
  score: number; // 0 - 100
  tier: LeadershipTier;
  tierLabel: string;
  tierColor: string;
  breakdown: {
    referralsScore: number; // Max 35
    eventsScore: number; // Max 30
    activitiesScore: number; // Max 25
    reportsScore: number; // Max 10
  };
}

/**
 * Calculates a standardized 0-100 Performance Score for Campus & State Leads.
 * Weighted across:
 * - Referrals generated (0.5 pts per referral, up to 35 pts)
 * - Events supported / organized (10 pts per event, up to 30 pts)
 * - Activities logged & verified (5 pts per activity, up to 25 pts)
 * - Monthly reports filed (5 pts per report, up to 10 pts)
 */
export function calculatePerformanceScore(params: {
  referrals: number;
  eventsSupported: number;
  activitiesCount: number;
  reportsCount: number;
}): PerformanceScoreResult {
  const referralsScore = Math.min(35, Math.round(params.referrals * 0.5));
  const eventsScore = Math.min(30, params.eventsSupported * 10);
  const activitiesScore = Math.min(25, params.activitiesCount * 5);
  const reportsScore = Math.min(10, params.reportsCount * 5);

  const score = Math.min(
    100,
    Math.max(0, referralsScore + eventsScore + activitiesScore + reportsScore)
  );

  let tier: LeadershipTier = "BRONZE";
  let tierLabel = "Emerging Builder";
  let tierColor = "#cd7f32";

  if (score >= 85) {
    tier = "PLATINUM";
    tierLabel = "Campus / State Champion";
    tierColor = "#a78bfa";
  } else if (score >= 70) {
    tier = "GOLD";
    tierLabel = "Growth Catalyst";
    tierColor = "#f59e0b";
  } else if (score >= 50) {
    tier = "SILVER";
    tierLabel = "Active Chapter Lead";
    tierColor = "#94a3b8";
  }

  return {
    score,
    tier,
    tierLabel,
    tierColor,
    breakdown: {
      referralsScore,
      eventsScore,
      activitiesScore,
      reportsScore,
    },
  };
}

export interface CampusLeadDashboardData {
  leadId: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  collegeId: string | null;
  collegeName: string;
  cityId: string | null;
  cityName: string;
  state: string;
  status: CampusLeadStatus;
  startDate: string;
  referrals: number;
  referralCode: string;
  referralLink: string;
  eventsSupported: number;
  performance: PerformanceScoreResult;
  adminNotes: string | null;
  activities: Array<{
    id: string;
    title: string;
    type: LeadActivityType;
    description: string;
    date: string;
    hoursSpent: number;
    attendeesCount: number;
    proofUrls: string[];
    verifiedByAdmin: boolean;
    adminFeedback: string | null;
    createdAt: string;
  }>;
  monthlyReports: Array<{
    id: string;
    month: number;
    year: number;
    status: MonthlyReportStatus;
    summary: string;
    highlights: string | null;
    challenges: string | null;
    nextMonthPlans: string | null;
    newSignupsCount: number;
    eventsOrganizedCount: number;
    swagDistributedCount: number;
    performanceScore: number | null;
    adminFeedback: string | null;
    submittedAt: string;
    reviewedAt: string | null;
  }>;
  supportedEvents: Array<{
    id: string;
    eventId: string;
    title: string;
    slug: string;
    startDate: string;
    role: string;
    notes: string | null;
  }>;
}

export interface StateLeadDashboardData {
  leadId: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  state: string;
  status: StateLeadStatus;
  startDate: string;
  referrals: number;
  referralCode: string;
  referralLink: string;
  eventsSupported: number;
  performance: PerformanceScoreResult;
  adminNotes: string | null;
  stateAggregates: {
    totalCitiesCount: number;
    totalCollegesCount: number;
    totalCampusLeadsCount: number;
    totalStatewideReferrals: number;
    totalStatewideEvents: number;
  };
  campusLeadsInState: Array<{
    id: string;
    name: string;
    email: string;
    collegeName: string;
    cityName: string;
    referrals: number;
    eventsSupported: number;
    performanceScore: number;
    status: CampusLeadStatus;
  }>;
  activities: Array<{
    id: string;
    title: string;
    type: LeadActivityType;
    description: string;
    date: string;
    hoursSpent: number;
    attendeesCount: number;
    proofUrls: string[];
    verifiedByAdmin: boolean;
    adminFeedback: string | null;
    createdAt: string;
  }>;
  monthlyReports: Array<{
    id: string;
    month: number;
    year: number;
    status: MonthlyReportStatus;
    summary: string;
    highlights: string | null;
    challenges: string | null;
    nextMonthPlans: string | null;
    newSignupsCount: number;
    eventsOrganizedCount: number;
    swagDistributedCount: number;
    performanceScore: number | null;
    adminFeedback: string | null;
    submittedAt: string;
    reviewedAt: string | null;
  }>;
  supportedEvents: Array<{
    id: string;
    eventId: string;
    title: string;
    slug: string;
    startDate: string;
    role: string;
    notes: string | null;
  }>;
}

/**
 * Retrieves the complete dashboard for a Campus Lead (by lead ID or user ID).
 */
export async function getCampusLeadDashboard(
  leadIdOrUserId: string
): Promise<CampusLeadDashboardData | null> {
  const lead = await db.campusLead.findFirst({
    where: {
      OR: [{ id: leadIdOrUserId }, { userId: leadIdOrUserId }],
    },
    include: {
      user: true,
      college: true,
      city: true,
      activities: {
        orderBy: { date: "desc" },
      },
      monthlyReports: {
        orderBy: [{ year: "desc" }, { month: "desc" }],
      },
      supportedEvents: {
        include: { event: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!lead) return null;

  const referralCode = lead.referralCode || `KX-CAMP-${lead.id.slice(-6).toUpperCase()}`;
  const referralLink = `https://kailshiansx.com/events?ref=${encodeURIComponent(referralCode)}`;

  const performance = calculatePerformanceScore({
    referrals: lead.referrals,
    eventsSupported: lead.eventsSupported,
    activitiesCount: lead.activities.length,
    reportsCount: lead.monthlyReports.length,
  });

  // Keep stored performanceScore in sync if differing
  if (lead.performanceScore !== performance.score) {
    await db.campusLead.update({
      where: { id: lead.id },
      data: { performanceScore: performance.score },
    });
  }

  return {
    leadId: lead.id,
    userId: lead.userId,
    name: lead.user.name || "Campus Lead",
    email: lead.user.email,
    phone: lead.user.phone,
    image: lead.user.image,
    collegeId: lead.collegeId,
    collegeName: lead.college?.name || "Campus Chapter",
    cityId: lead.cityId,
    cityName: lead.city?.name || lead.college?.state || "Regional City",
    state: lead.college?.state || lead.city?.state || "National",
    status: lead.status,
    startDate: lead.startDate.toISOString(),
    referrals: lead.referrals,
    referralCode,
    referralLink,
    eventsSupported: lead.eventsSupported,
    performance,
    adminNotes: lead.adminNotes,
    activities: lead.activities.map((a) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      description: a.description,
      date: a.date.toISOString(),
      hoursSpent: a.hoursSpent,
      attendeesCount: a.attendeesCount,
      proofUrls: a.proofUrls,
      verifiedByAdmin: a.verifiedByAdmin,
      adminFeedback: a.adminFeedback,
      createdAt: a.createdAt.toISOString(),
    })),
    monthlyReports: lead.monthlyReports.map((r) => ({
      id: r.id,
      month: r.month,
      year: r.year,
      status: r.status,
      summary: r.summary,
      highlights: r.highlights,
      challenges: r.challenges,
      nextMonthPlans: r.nextMonthPlans,
      newSignupsCount: r.newSignupsCount,
      eventsOrganizedCount: r.eventsOrganizedCount,
      swagDistributedCount: r.swagDistributedCount,
      performanceScore: r.performanceScore,
      adminFeedback: r.adminFeedback,
      submittedAt: r.submittedAt.toISOString(),
      reviewedAt: r.reviewedAt?.toISOString() || null,
    })),
    supportedEvents: lead.supportedEvents.map((se) => ({
      id: se.id,
      eventId: se.eventId,
      title: se.event.title,
      slug: se.event.slug,
      startDate: se.event.startDate.toISOString(),
      role: se.role,
      notes: se.notes,
    })),
  };
}

/**
 * Retrieves the complete dashboard for a State Lead (by lead ID or user ID),
 * aggregating all campus chapters, colleges, and cities within that state.
 */
export async function getStateLeadDashboard(
  leadIdOrUserId: string
): Promise<StateLeadDashboardData | null> {
  const lead = await db.stateLead.findFirst({
    where: {
      OR: [{ id: leadIdOrUserId }, { userId: leadIdOrUserId }],
    },
    include: {
      user: true,
      cities: true,
      activities: {
        orderBy: { date: "desc" },
      },
      monthlyReports: {
        orderBy: [{ year: "desc" }, { month: "desc" }],
      },
      supportedEvents: {
        include: { event: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!lead) return null;

  // Find all Campus Leads belonging to this state (via college state or city state)
  const campusLeads = await db.campusLead.findMany({
    where: {
      OR: [
        { college: { state: { equals: lead.state, mode: "insensitive" } } },
        { city: { state: { equals: lead.state, mode: "insensitive" } } },
      ],
    },
    include: {
      user: true,
      college: true,
      city: true,
    },
  });

  const totalCollegesInState = await db.college.count({
    where: { state: { equals: lead.state, mode: "insensitive" } },
  });

  const totalCitiesInState = await db.city.count({
    where: { state: { equals: lead.state, mode: "insensitive" } },
  });

  const campusReferralsSum = campusLeads.reduce((acc, c) => acc + c.referrals, 0);
  const totalStatewideReferrals = lead.referrals + campusReferralsSum;

  const campusEventsSum = campusLeads.reduce((acc, c) => acc + c.eventsSupported, 0);
  const totalStatewideEvents = lead.eventsSupported + campusEventsSum;

  const referralCode = lead.referralCode || `KX-STATE-${lead.state.slice(0, 4).toUpperCase()}`;
  const referralLink = `https://kailshiansx.com/events?ref=${encodeURIComponent(referralCode)}`;

  const performance = calculatePerformanceScore({
    referrals: totalStatewideReferrals,
    eventsSupported: totalStatewideEvents,
    activitiesCount: lead.activities.length,
    reportsCount: lead.monthlyReports.length,
  });

  if (lead.performanceScore !== performance.score) {
    await db.stateLead.update({
      where: { id: lead.id },
      data: { performanceScore: performance.score },
    });
  }

  return {
    leadId: lead.id,
    userId: lead.userId,
    name: lead.user.name || "State Lead",
    email: lead.user.email,
    phone: lead.user.phone,
    image: lead.user.image,
    state: lead.state,
    status: lead.status,
    startDate: lead.startDate.toISOString(),
    referrals: lead.referrals,
    referralCode,
    referralLink,
    eventsSupported: lead.eventsSupported,
    performance,
    adminNotes: lead.adminNotes,
    stateAggregates: {
      totalCitiesCount: totalCitiesInState,
      totalCollegesCount: totalCollegesInState,
      totalCampusLeadsCount: campusLeads.length,
      totalStatewideReferrals,
      totalStatewideEvents,
    },
    campusLeadsInState: campusLeads.map((cl) => ({
      id: cl.id,
      name: cl.user.name || "Campus Lead",
      email: cl.user.email,
      collegeName: cl.college?.name || "Campus",
      cityName: cl.city?.name || "City",
      referrals: cl.referrals,
      eventsSupported: cl.eventsSupported,
      performanceScore: cl.performanceScore,
      status: cl.status,
    })),
    activities: lead.activities.map((a) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      description: a.description,
      date: a.date.toISOString(),
      hoursSpent: a.hoursSpent,
      attendeesCount: a.attendeesCount,
      proofUrls: a.proofUrls,
      verifiedByAdmin: a.verifiedByAdmin,
      adminFeedback: a.adminFeedback,
      createdAt: a.createdAt.toISOString(),
    })),
    monthlyReports: lead.monthlyReports.map((r) => ({
      id: r.id,
      month: r.month,
      year: r.year,
      status: r.status,
      summary: r.summary,
      highlights: r.highlights,
      challenges: r.challenges,
      nextMonthPlans: r.nextMonthPlans,
      newSignupsCount: r.newSignupsCount,
      eventsOrganizedCount: r.eventsOrganizedCount,
      swagDistributedCount: r.swagDistributedCount,
      performanceScore: r.performanceScore,
      adminFeedback: r.adminFeedback,
      submittedAt: r.submittedAt.toISOString(),
      reviewedAt: r.reviewedAt?.toISOString() || null,
    })),
    supportedEvents: lead.supportedEvents.map((se) => ({
      id: se.id,
      eventId: se.eventId,
      title: se.event.title,
      slug: se.event.slug,
      startDate: se.event.startDate.toISOString(),
      role: se.role,
      notes: se.notes,
    })),
  };
}

/**
 * Returns an overview list of all Campus Leads for Admin views.
 */
export async function getAllCampusLeadsOverview() {
  const leads = await db.campusLead.findMany({
    orderBy: [{ performanceScore: "desc" }, { createdAt: "desc" }],
    include: {
      user: true,
      college: true,
      city: true,
      activities: { select: { id: true, verifiedByAdmin: true } },
      monthlyReports: { select: { id: true, status: true } },
    },
  });

  return leads.map((l) => ({
    id: l.id,
    userId: l.userId,
    name: l.user.name || "Leader",
    email: l.user.email,
    college: l.college?.name || "Campus",
    city: l.city?.name || "City",
    state: l.college?.state || l.city?.state || "State",
    status: l.status,
    startDate: l.startDate.toISOString(),
    referrals: l.referrals,
    referralCode: l.referralCode || `KX-CAMP-${l.id.slice(-6).toUpperCase()}`,
    eventsSupported: l.eventsSupported,
    performanceScore: l.performanceScore,
    totalActivities: l.activities.length,
    verifiedActivities: l.activities.filter((a) => a.verifiedByAdmin).length,
    totalReports: l.monthlyReports.length,
  }));
}

/**
 * Returns an overview list of all State Leads for Admin views.
 */
export async function getAllStateLeadsOverview() {
  const leads = await db.stateLead.findMany({
    orderBy: [{ performanceScore: "desc" }, { createdAt: "desc" }],
    include: {
      user: true,
      activities: { select: { id: true, verifiedByAdmin: true } },
      monthlyReports: { select: { id: true, status: true } },
    },
  });

  return leads.map((l) => ({
    id: l.id,
    userId: l.userId,
    name: l.user.name || "Leader",
    email: l.user.email,
    state: l.state,
    status: l.status,
    startDate: l.startDate.toISOString(),
    referrals: l.referrals,
    referralCode: l.referralCode || `KX-STATE-${l.id.slice(-6).toUpperCase()}`,
    eventsSupported: l.eventsSupported,
    performanceScore: l.performanceScore,
    totalActivities: l.activities.length,
    verifiedActivities: l.activities.filter((a) => a.verifiedByAdmin).length,
    totalReports: l.monthlyReports.length,
  }));
}

/**
 * Logs a new community activity for a Campus or State lead.
 */
export async function logLeadActivity(input: {
  leadId: string;
  leadType: "CAMPUS" | "STATE";
  title: string;
  type: LeadActivityType;
  description: string;
  date?: string | Date;
  hoursSpent?: number;
  attendeesCount?: number;
  proofUrls?: string[];
  eventId?: string;
}) {
  const activityDate = input.date ? new Date(input.date) : new Date();

  const activity = await db.leadActivity.create({
    data: {
      title: input.title,
      type: input.type,
      description: input.description,
      date: activityDate,
      hoursSpent: input.hoursSpent ?? 1.0,
      attendeesCount: input.attendeesCount ?? 0,
      proofUrls: input.proofUrls || [],
      campusLeadId: input.leadType === "CAMPUS" ? input.leadId : null,
      stateLeadId: input.leadType === "STATE" ? input.leadId : null,
      eventId: input.eventId || null,
      verifiedByAdmin: false,
    },
  });

  // Recalculate lead performance score
  await refreshLeadPerformanceScore(input.leadId, input.leadType);

  return activity;
}

/**
 * Admin verifies an activity and leaves feedback.
 */
export async function verifyLeadActivity(
  activityId: string,
  verified: boolean,
  adminFeedback?: string
) {
  const activity = await db.leadActivity.update({
    where: { id: activityId },
    data: {
      verifiedByAdmin: verified,
      adminFeedback: adminFeedback || null,
    },
  });

  if (activity.campusLeadId) {
    await refreshLeadPerformanceScore(activity.campusLeadId, "CAMPUS");
  } else if (activity.stateLeadId) {
    await refreshLeadPerformanceScore(activity.stateLeadId, "STATE");
  }

  return activity;
}

/**
 * Deletes a logged activity.
 */
export async function deleteLeadActivity(activityId: string) {
  const activity = await db.leadActivity.delete({
    where: { id: activityId },
  });

  if (activity.campusLeadId) {
    await refreshLeadPerformanceScore(activity.campusLeadId, "CAMPUS");
  } else if (activity.stateLeadId) {
    await refreshLeadPerformanceScore(activity.stateLeadId, "STATE");
  }

  return activity;
}

/**
 * Submits or updates a monthly retrospective report.
 */
export async function submitMonthlyReport(input: {
  leadId: string;
  leadType: "CAMPUS" | "STATE";
  month: number;
  year: number;
  summary: string;
  highlights?: string;
  challenges?: string;
  nextMonthPlans?: string;
  newSignupsCount?: number;
  eventsOrganizedCount?: number;
  swagDistributedCount?: number;
}) {
  const isCampus = input.leadType === "CAMPUS";

  const report = await db.leadMonthlyReport.upsert({
    where: isCampus
      ? {
          campusLeadId_month_year: {
            campusLeadId: input.leadId,
            month: input.month,
            year: input.year,
          },
        }
      : {
          stateLeadId_month_year: {
            stateLeadId: input.leadId,
            month: input.month,
            year: input.year,
          },
        },
    update: {
      summary: input.summary,
      highlights: input.highlights || null,
      challenges: input.challenges || null,
      nextMonthPlans: input.nextMonthPlans || null,
      newSignupsCount: input.newSignupsCount ?? 0,
      eventsOrganizedCount: input.eventsOrganizedCount ?? 0,
      swagDistributedCount: input.swagDistributedCount ?? 0,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
    create: {
      campusLeadId: isCampus ? input.leadId : null,
      stateLeadId: !isCampus ? input.leadId : null,
      month: input.month,
      year: input.year,
      summary: input.summary,
      highlights: input.highlights || null,
      challenges: input.challenges || null,
      nextMonthPlans: input.nextMonthPlans || null,
      newSignupsCount: input.newSignupsCount ?? 0,
      eventsOrganizedCount: input.eventsOrganizedCount ?? 0,
      swagDistributedCount: input.swagDistributedCount ?? 0,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  await refreshLeadPerformanceScore(input.leadId, input.leadType);
  return report;
}

/**
 * Admin reviews a monthly report, assigns an evaluation score and feedback.
 */
export async function reviewMonthlyReport(
  reportId: string,
  performanceScore: number,
  adminFeedback?: string
) {
  const report = await db.leadMonthlyReport.update({
    where: { id: reportId },
    data: {
      status: "REVIEWED",
      performanceScore,
      adminFeedback: adminFeedback || null,
      reviewedAt: new Date(),
    },
  });

  if (report.campusLeadId) {
    await refreshLeadPerformanceScore(report.campusLeadId, "CAMPUS");
  } else if (report.stateLeadId) {
    await refreshLeadPerformanceScore(report.stateLeadId, "STATE");
  }

  return report;
}

/**
 * Links an event as supported by a lead.
 */
export async function linkSupportedEvent(
  leadId: string,
  leadType: "CAMPUS" | "STATE",
  eventId: string,
  role = "ORGANIZER",
  notes?: string
) {
  if (leadType === "CAMPUS") {
    await db.campusLeadEvent.upsert({
      where: {
        campusLeadId_eventId: { campusLeadId: leadId, eventId },
      },
      update: { role, notes },
      create: { campusLeadId: leadId, eventId, role, notes },
    });

    const count = await db.campusLeadEvent.count({ where: { campusLeadId: leadId } });
    await db.campusLead.update({
      where: { id: leadId },
      data: { eventsSupported: count },
    });

    await refreshLeadPerformanceScore(leadId, "CAMPUS");
  } else {
    await db.stateLeadEvent.upsert({
      where: {
        stateLeadId_eventId: { stateLeadId: leadId, eventId },
      },
      update: { role, notes },
      create: { stateLeadId: leadId, eventId, role, notes },
    });

    const count = await db.stateLeadEvent.count({ where: { stateLeadId: leadId } });
    await db.stateLead.update({
      where: { id: leadId },
      data: { eventsSupported: count },
    });

    await refreshLeadPerformanceScore(leadId, "STATE");
  }
}

/**
 * Helper to recalculate and persist performance score.
 */
async function refreshLeadPerformanceScore(
  leadId: string,
  leadType: "CAMPUS" | "STATE"
): Promise<number> {
  if (leadType === "CAMPUS") {
    const lead = await db.campusLead.findUnique({
      where: { id: leadId },
      include: {
        activities: { select: { id: true } },
        monthlyReports: { select: { id: true } },
      },
    });
    if (!lead) return 0;
    const { score } = calculatePerformanceScore({
      referrals: lead.referrals,
      eventsSupported: lead.eventsSupported,
      activitiesCount: lead.activities.length,
      reportsCount: lead.monthlyReports.length,
    });
    await db.campusLead.update({
      where: { id: leadId },
      data: { performanceScore: score },
    });
    return score;
  } else {
    const lead = await db.stateLead.findUnique({
      where: { id: leadId },
      include: {
        activities: { select: { id: true } },
        monthlyReports: { select: { id: true } },
      },
    });
    if (!lead) return 0;
    const { score } = calculatePerformanceScore({
      referrals: lead.referrals,
      eventsSupported: lead.eventsSupported,
      activitiesCount: lead.activities.length,
      reportsCount: lead.monthlyReports.length,
    });
    await db.stateLead.update({
      where: { id: leadId },
      data: { performanceScore: score },
    });
    return score;
  }
}
