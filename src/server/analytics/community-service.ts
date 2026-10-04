// src/server/analytics/community-service.ts
// Domain service computing the 12 Success Metrics for PRD §29:
// 1. Monthly Active Community Members (MAU)
// 2. Event Registrations & Format Distribution
// 3. Paid Ticket Conversion Rate
// 4. Repeat Attendees & Builder Retention Cohorts
// 5. Workshop & Tech-Talk Participation
// 6. Campus Lead Applications & Activation Rate
// 7. State Lead Coverage (36 Indian States & UTs)
// 8. Collaboration Leads Pipeline & Conversion
// 9. Sponsor Deal Pipeline & Revenue Conversion
// 10. Event Profitability & Net P&L Margin
// 11. Certificate Delivery & Verification Rate
// 12. Percentage of Attendees Who Take a Community Role (PRD §30 Progression)

import { db } from "@/lib/db";
import { EventType, EmailJobStatus } from "@prisma/client";

export const INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export interface CommunityAnalyticsMetrics {
  summary: {
    communityHealthScore: number; // 0 - 100 composite index
    totalBuilders: number;
    totalActiveThisMonth: number;
    mauGrowthPct: number;
    roleProgressionRate: number;
    repeatAttendanceRate: number;
    paidConversionRate: number;
    stateCoveragePct: number;
  };

  // 1. MAU
  mau: {
    current30d: number;
    previous30d: number;
    growthPct: number;
    dailyEngagementAvg: number;
  };

  // 2. Registrations
  registrations: {
    totalLifetime: number;
    totalConfirmed: number;
    last30Days: number;
    byFormat: Record<EventType, number>;
  };

  // 3. Paid Conversion
  paidConversion: {
    totalTickets: number;
    freeTickets: number;
    paidTickets: number;
    conversionRate: number; // percentage
    totalCapturedRevenue: number;
  };

  // 4. Repeat Attendees
  repeatAttendees: {
    uniqueAttendees: number;
    repeatAttendeesCount: number;
    repeatAttendanceRate: number; // percentage
    loyaltyTiers: {
      singleEvent: number;
      twoToThree: number;
      fourPlus: number;
    };
  };

  // 5. Workshop & Tech-Talk Participation
  workshopTalkParticipation: {
    totalWorkshops: number;
    workshopAttendees: number;
    totalTechTalks: number;
    techTalkAttendees: number;
    combinedAttendees: number;
    avgAttendeesPerSession: number;
  };

  // 6. Lead Applications & Activation
  leadApplications: {
    campus: {
      totalApplications: number;
      selected: number;
      active: number;
      activationRate: number; // active / selected %
      uniqueColleges: number;
    };
    state: {
      totalApplications: number;
      selected: number;
      active: number;
    };
  };

  // 7. State Lead Coverage
  stateCoverage: {
    totalStatesAndUTs: number;
    coveredCount: number;
    coveragePct: number;
    coveredStates: string[];
    priorityUncoveredStates: string[];
  };

  // 8. Collaboration Leads
  collaborationLeads: {
    total: number;
    byStage: Record<string, number>;
    wonCount: number;
    conversionRate: number; // percentage
  };

  // 9. Sponsor Conversion
  sponsorConversion: {
    totalDeals: number;
    wonDeals: number;
    totalPipelineValue: number;
    closedWonValue: number;
    conversionRate: number; // percentage
  };

  // 10. Event Profitability
  profitability: {
    totalRevenue: number;
    ticketRevenue: number;
    sponsorRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMarginPct: number;
    profitableEventsRatio: number;
  };

  // 11. Certificate Delivery
  certificates: {
    totalIssued: number;
    totalClaimedOrVerified: number;
    deliveryRatePct: number;
  };

  // 12. Percentage of Attendees Who Take a Community Role (PRD §30)
  roleProgression: {
    totalUniqueAttendees: number;
    attendeesWithCommunityRole: number;
    progressionRatePct: number;
    roleBreakdown: {
      campusLeads: number;
      stateLeads: number;
      coreTeam: number;
      mentorsSpeakers: number;
      chapterLeads: number;
    };
  };
}

/**
 * Computes all 12 Success Metrics for PRD §29.
 */
export async function getCommunityAnalyticsOverview(): Promise<CommunityAnalyticsMetrics> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Parallel database aggregation
  const [
    // 1. Users & MAU
    totalUsersCount,
    activeUsersCount30d,
    activeUsersCountPrev30d,

    // 2. Registrations
    registrationsAll,
    registrations30d,

    // 3. Payments
    capturedPayments,

    // 4. Attendance records
    attendancesAll,

    // 5. Events
    eventsAll,

    // 6. Leads
    campusAppsAll,
    stateAppsAll,

    // 7. Collaborations
    collabLeadsAll,

    // 8. Sponsors & Deals
    sponsorDealsAll,

    // 9. PnL Financials
    expensesAll,
    sponsorInvoicesAll,

    // 10. Certificates
    certificatesAll,

    // 11. Roles & Progression
    teamMembersSelected,
    speakersAll,
    chaptersAll,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { updatedAt: { gte: thirtyDaysAgo } } }),
    db.user.count({
      where: {
        updatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),

    db.registration.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        userId: true,
        status: true,
        ticketTypeId: true, // correct field name (not ticketTierId)
        createdAt: true,
        eventId: true,
        event: {
          select: { id: true, type: true },
        },
        payment: {
          select: { amount: true, status: true },
        },
      },
    }),

    db.registration.count({
      where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } },
    }),

    db.payment.findMany({
      where: { status: "CAPTURED" },
      select: { amount: true },
    }),

    db.attendance.findMany({
      select: {
        id: true,
        registration: {
          select: {
            id: true,
            userId: true,
            user: { select: { id: true, email: true } },
          },
        },
      },
    }),

    db.event.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        type: true,
        _count: {
          // `attendances` is not a direct count field on Event — use registrations only
          select: { registrations: true },
        },
      },
    }),

    db.campusLeadApplication.findMany({
      // `campusName` does not exist on model — field is `college`
      select: { id: true, status: true, college: true, userId: true },
    }),

    db.stateLeadApplication.findMany({
      select: { id: true, status: true, state: true, userId: true },
    }),

    db.collaborationLead.findMany({
      select: { id: true, stage: true },
    }),

    db.sponsorDeal.findMany({
      select: { id: true, stage: true, amount: true },
    }),

    // Correct table name: eventExpenseItem (not eventExpense)
    db.eventExpenseItem.findMany({
      select: { id: true, amount: true, eventId: true },
    }),

    db.sponsorInvoice.findMany({
      where: { status: "PAID" },
      select: { id: true, totalAmount: true },
    }),

    db.certificate.findMany({
      // Certificate uses `deliveryStatus: EmailJobStatus` — no `status` field
      select: { id: true, deliveryStatus: true, participantEmail: true },
    }),

    db.teamApplication.findMany({
      where: { status: "SELECTED" },
      select: { id: true, email: true },
    }),

    db.speaker.findMany({
      select: { id: true, userId: true, isMentor: true, isSpeaker: true },
    }),

    db.chapter.findMany({
      include: {
        members: { where: { status: "ACTIVE" } },
      },
    }),
  ]);

  // ─── 1. MAU CALCULATION ──────────────────────────────────────────────────
  const mauCurrent = Math.max(activeUsersCount30d, 1);
  const mauPrevious = Math.max(activeUsersCountPrev30d, 1);
  const mauGrowthPct = Math.round(((mauCurrent - mauPrevious) / mauPrevious) * 100);

  // ─── 2. REGISTRATIONS & FORMATS ──────────────────────────────────────────
  const totalLifetimeRegs = registrationsAll.length;
  const confirmedRegs = registrationsAll.filter((r) => r.status === "CONFIRMED");
  const byFormat: Record<EventType, number> = {
    MEETUP: 0,
    HACKATHON: 0,
    WORKSHOP: 0,
    TECH_TALK: 0,
    OTHER: 0,
  };

  registrationsAll.forEach((r) => {
    if (r.event?.type && byFormat[r.event.type] !== undefined) {
      byFormat[r.event.type]++;
    } else {
      byFormat.OTHER++;
    }
  });

  // ─── 3. PAID CONVERSION ──────────────────────────────────────────────────
  let totalCapturedRevenue = 0;
  capturedPayments.forEach((p) => {
    totalCapturedRevenue += Number(p.amount);
  });

  const paidTicketsCount = registrationsAll.filter(
    (r) => r.payment && r.payment.status === "CAPTURED"
  ).length;
  const freeTicketsCount = Math.max(0, confirmedRegs.length - paidTicketsCount);
  const paidConversionRate =
    confirmedRegs.length > 0 ? Math.round((paidTicketsCount / confirmedRegs.length) * 100) : 0;

  // ─── 4. REPEAT ATTENDEES & LOYALTY ───────────────────────────────────────
  const attendeeEventCounts = new Map<string, number>();

  attendancesAll.forEach((a) => {
    const key = a.registration.userId ?? a.registration.user?.email ?? a.registration.id;
    attendeeEventCounts.set(key, (attendeeEventCounts.get(key) ?? 0) + 1);
  });

  // Fallback to registrations if attendances count is sparse
  if (attendeeEventCounts.size === 0) {
    confirmedRegs.forEach((r) => {
      if (r.userId) {
        attendeeEventCounts.set(r.userId, (attendeeEventCounts.get(r.userId) ?? 0) + 1);
      }
    });
  }

  const uniqueAttendees = attendeeEventCounts.size;
  let singleEventCount = 0;
  let twoToThreeCount = 0;
  let fourPlusCount = 0;

  attendeeEventCounts.forEach((count) => {
    if (count === 1) singleEventCount++;
    else if (count <= 3) twoToThreeCount++;
    else fourPlusCount++;
  });

  const repeatAttendeesCount = twoToThreeCount + fourPlusCount;
  const repeatAttendanceRate =
    uniqueAttendees > 0 ? Math.round((repeatAttendeesCount / uniqueAttendees) * 100) : 0;

  // ─── 5. WORKSHOP & TECH-TALK PARTICIPATION ───────────────────────────────
  const workshops = eventsAll.filter((e) => e.type === EventType.WORKSHOP);
  const techTalks = eventsAll.filter((e) => e.type === EventType.TECH_TALK);

  const workshopAttendees = workshops.reduce(
    (acc: number, e: { _count: { registrations: number } }) => acc + e._count.registrations,
    0
  );
  const techTalkAttendees = techTalks.reduce(
    (acc: number, e: { _count: { registrations: number } }) => acc + e._count.registrations,
    0
  );
  const totalSessions = workshops.length + techTalks.length;
  const combinedAttendees = workshopAttendees + techTalkAttendees;
  const avgAttendeesPerSession =
    totalSessions > 0 ? Math.round(combinedAttendees / totalSessions) : 0;

  // ─── 6. LEAD APPLICATIONS & ACTIVATION ───────────────────────────────────
  const campusSelected = campusAppsAll.filter(
    (a) => a.status === "SELECTED" || a.status === "ACTIVE"
  ).length;
  const campusActive = campusAppsAll.filter((a) => a.status === "ACTIVE").length;
  const campusActivationRate =
    campusSelected > 0 ? Math.round((campusActive / campusSelected) * 100) : 0;

  // Use `college` field (the correct name on CampusLeadApplication)
  const uniqueColleges = new Set(campusAppsAll.map((a) => a.college.trim().toLowerCase())).size;

  const stateSelected = stateAppsAll.filter(
    (a) => a.status === "SELECTED" || a.status === "ACTIVE"
  ).length;
  const stateActive = stateAppsAll.filter((a) => a.status === "ACTIVE").length;

  // ─── 7. STATE LEAD COVERAGE ──────────────────────────────────────────────
  const coveredStatesSet = new Set<string>();
  stateAppsAll
    .filter((a) => a.status === "ACTIVE" || a.status === "SELECTED")
    .forEach((a) => {
      const match = INDIAN_STATES_AND_UTS.find(
        (s) => s.toLowerCase() === a.state.trim().toLowerCase()
      );
      if (match) coveredStatesSet.add(match);
      else if (a.state.trim().length > 0) coveredStatesSet.add(a.state.trim());
    });

  const coveredStates = Array.from(coveredStatesSet);
  const totalStatesAndUTs = INDIAN_STATES_AND_UTS.length; // 36
  const stateCoveragePct = Math.round((coveredStates.length / totalStatesAndUTs) * 100);
  const priorityUncoveredStates = INDIAN_STATES_AND_UTS.filter(
    (s) => !coveredStatesSet.has(s)
  ).slice(0, 10) as string[];

  // ─── 8. COLLABORATION LEADS ──────────────────────────────────────────────
  const collabStageCounts: Record<string, number> = {
    NEW: 0,
    CONTACTED: 0,
    IN_REVIEW: 0,
    WON: 0,
    REJECTED: 0,
  };

  collabLeadsAll.forEach((c) => {
    collabStageCounts[c.stage] = (collabStageCounts[c.stage] ?? 0) + 1;
  });

  const collabWonCount = (collabStageCounts.WON ?? 0) + (collabStageCounts.CONFIRMED ?? 0);
  const collabConversionRate =
    collabLeadsAll.length > 0 ? Math.round((collabWonCount / collabLeadsAll.length) * 100) : 0;

  // ─── 9. SPONSOR CONVERSION ───────────────────────────────────────────────
  let totalPipelineValue = 0;
  let closedWonValue = 0;
  let wonDealsCount = 0;

  sponsorDealsAll.forEach((d) => {
    const val = Number(d.amount);
    totalPipelineValue += val;
    if (d.stage === "WON") {
      closedWonValue += val;
      wonDealsCount++;
    }
  });

  const sponsorConversionRate =
    sponsorDealsAll.length > 0 ? Math.round((wonDealsCount / sponsorDealsAll.length) * 100) : 0;

  // ─── 10. EVENT PROFITABILITY ─────────────────────────────────────────────
  let totalSponsorInvoiceRevenue = 0;
  sponsorInvoicesAll.forEach((inv) => {
    totalSponsorInvoiceRevenue += Number(inv.totalAmount);
  });

  const aggregateTicketRevenue = totalCapturedRevenue;
  const aggregateRevenue = aggregateTicketRevenue + totalSponsorInvoiceRevenue;

  let totalExpenses = 0;
  const eventExpensesMap = new Map<string, number>();
  expensesAll.forEach((exp) => {
    const amt = Number(exp.amount);
    totalExpenses += amt;
    if (exp.eventId) {
      eventExpensesMap.set(exp.eventId, (eventExpensesMap.get(exp.eventId) ?? 0) + amt);
    }
  });

  const netProfit = aggregateRevenue - totalExpenses;
  const profitMarginPct =
    aggregateRevenue > 0 ? Math.round((netProfit / aggregateRevenue) * 100) : 0;

  // Profitable events count
  let profitableCount = 0;
  eventsAll.forEach((e) => {
    const exp = eventExpensesMap.get(e.id) ?? 0;
    // Estimate: if registrations > 0 and expenses low, or revenue recorded
    if (e._count.registrations * 200 > exp) {
      profitableCount++;
    }
  });

  const profitableEventsRatio =
    eventsAll.length > 0 ? Math.round((profitableCount / eventsAll.length) * 100) : 0;

  // ─── 11. CERTIFICATE DELIVERY RATE ───────────────────────────────────────
  const totalCertificatesIssued = certificatesAll.length;
  // Certificate uses `deliveryStatus: EmailJobStatus`; "SENT" means delivered
  const totalClaimedOrVerified = certificatesAll.filter(
    (c) => c.deliveryStatus === EmailJobStatus.SENT
  ).length;

  const certificateDeliveryRate =
    totalCertificatesIssued > 0
      ? Math.round((totalClaimedOrVerified / totalCertificatesIssued) * 100)
      : 100;

  // ─── 12. % ATTENDEES WHO TAKE A COMMUNITY ROLE (PRD §30) ──────────────────
  // Collect set of userIds / emails who are attendees
  const attendeeUserIds = new Set<string>();
  attendancesAll.forEach((a) => {
    if (a.registration.userId) attendeeUserIds.add(a.registration.userId);
  });
  confirmedRegs.forEach((r) => {
    if (r.userId) attendeeUserIds.add(r.userId);
  });

  // Track unique builders who took on community roles
  const roleBuilders = new Set<string>();
  let campusLeadsCount = 0;
  let stateLeadsCount = 0;
  let coreTeamCount = 0;
  let mentorsSpeakersCount = 0;
  let chapterLeadsCount = 0;

  campusAppsAll
    .filter((a) => a.status === "ACTIVE" || a.status === "SELECTED")
    .forEach((a) => {
      if (a.userId && attendeeUserIds.has(a.userId)) {
        roleBuilders.add(a.userId);
        campusLeadsCount++;
      }
    });

  stateAppsAll
    .filter((a) => a.status === "ACTIVE" || a.status === "SELECTED")
    .forEach((a) => {
      if (a.userId && attendeeUserIds.has(a.userId)) {
        roleBuilders.add(a.userId);
        stateLeadsCount++;
      }
    });

  speakersAll.forEach((s) => {
    if (s.userId && attendeeUserIds.has(s.userId)) {
      roleBuilders.add(s.userId);
      mentorsSpeakersCount++;
    }
  });

  chaptersAll.forEach((c) => {
    c.members.forEach((m) => {
      if (
        (m.role === "LEAD" || m.role === "CO_LEAD" || m.role === "CORE_TEAM") &&
        attendeeUserIds.has(m.userId)
      ) {
        roleBuilders.add(m.userId);
        chapterLeadsCount++;
      }
    });
  });

  coreTeamCount = teamMembersSelected.length;

  const attendeesWithCommunityRole = roleBuilders.size;
  const roleProgressionRate =
    attendeeUserIds.size > 0
      ? Math.round((attendeesWithCommunityRole / attendeeUserIds.size) * 100)
      : 0;

  // ─── COMPOSITE COMMUNITY HEALTH SCORE (0 - 100) ──────────────────────────
  // Weighted index across the 12 pillars
  const healthScore = Math.min(
    100,
    Math.max(
      20,
      Math.round(
        0.2 * Math.min(100, mauCurrent * 2) +
          0.15 * repeatAttendanceRate +
          0.15 * stateCoveragePct +
          0.15 * roleProgressionRate +
          0.15 * (profitMarginPct > 0 ? 80 : 40) +
          0.1 * paidConversionRate +
          0.1 * certificateDeliveryRate
      )
    )
  );

  return {
    summary: {
      communityHealthScore: healthScore,
      totalBuilders: totalUsersCount,
      totalActiveThisMonth: mauCurrent,
      mauGrowthPct,
      roleProgressionRate,
      repeatAttendanceRate,
      paidConversionRate,
      stateCoveragePct,
    },
    mau: {
      current30d: mauCurrent,
      previous30d: mauPrevious,
      growthPct: mauGrowthPct,
      dailyEngagementAvg: Math.round(mauCurrent / 30),
    },
    registrations: {
      totalLifetime: totalLifetimeRegs,
      totalConfirmed: confirmedRegs.length,
      last30Days: registrations30d,
      byFormat,
    },
    paidConversion: {
      totalTickets: confirmedRegs.length,
      freeTickets: freeTicketsCount,
      paidTickets: paidTicketsCount,
      conversionRate: paidConversionRate,
      totalCapturedRevenue,
    },
    repeatAttendees: {
      uniqueAttendees,
      repeatAttendeesCount,
      repeatAttendanceRate,
      loyaltyTiers: {
        singleEvent: singleEventCount,
        twoToThree: twoToThreeCount,
        fourPlus: fourPlusCount,
      },
    },
    workshopTalkParticipation: {
      totalWorkshops: workshops.length,
      workshopAttendees,
      totalTechTalks: techTalks.length,
      techTalkAttendees,
      combinedAttendees,
      avgAttendeesPerSession,
    },
    leadApplications: {
      campus: {
        totalApplications: campusAppsAll.length,
        selected: campusSelected,
        active: campusActive,
        activationRate: campusActivationRate,
        uniqueColleges,
      },
      state: {
        totalApplications: stateAppsAll.length,
        selected: stateSelected,
        active: stateActive,
      },
    },
    stateCoverage: {
      totalStatesAndUTs,
      coveredCount: coveredStates.length,
      coveragePct: stateCoveragePct,
      coveredStates,
      priorityUncoveredStates,
    },
    collaborationLeads: {
      total: collabLeadsAll.length,
      byStage: collabStageCounts,
      wonCount: collabWonCount,
      conversionRate: collabConversionRate,
    },
    sponsorConversion: {
      totalDeals: sponsorDealsAll.length,
      wonDeals: wonDealsCount,
      totalPipelineValue,
      closedWonValue,
      conversionRate: sponsorConversionRate,
    },
    profitability: {
      totalRevenue: aggregateRevenue,
      ticketRevenue: aggregateTicketRevenue,
      sponsorRevenue: totalSponsorInvoiceRevenue,
      totalExpenses,
      netProfit,
      profitMarginPct,
      profitableEventsRatio,
    },
    certificates: {
      totalIssued: totalCertificatesIssued,
      totalClaimedOrVerified,
      deliveryRatePct: certificateDeliveryRate,
    },
    roleProgression: {
      totalUniqueAttendees: attendeeUserIds.size,
      attendeesWithCommunityRole,
      progressionRatePct: roleProgressionRate,
      roleBreakdown: {
        campusLeads: campusLeadsCount,
        stateLeads: stateLeadsCount,
        coreTeam: coreTeamCount,
        mentorsSpeakers: mentorsSpeakersCount,
        chapterLeads: chapterLeadsCount,
      },
    },
  };
}
