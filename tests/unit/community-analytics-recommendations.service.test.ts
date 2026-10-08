// tests/unit/community-analytics-recommendations.service.test.ts
// Unit tests for Community Analytics and Personalized Recommendations Engine

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCommunityAnalyticsOverview } from "@/server/analytics/community-service";
import { getPersonalizedRecommendations } from "@/server/recommendations/service";
import { db } from "@/lib/db";
import { AttendanceMode, EventType } from "@prisma/client";

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      count: vi.fn(),
      findUnique: vi.fn(),
    },
    registration: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    payment: {
      findMany: vi.fn(),
    },
    attendance: {
      findMany: vi.fn(),
    },
    event: {
      findMany: vi.fn(),
    },
    campusLeadApplication: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    stateLeadApplication: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    collaborationLead: {
      findMany: vi.fn(),
    },
    sponsorDeal: {
      findMany: vi.fn(),
    },
    // Correct model name: eventExpenseItem (not eventExpense)
    eventExpenseItem: {
      findMany: vi.fn(),
    },
    sponsorInvoice: {
      findMany: vi.fn(),
    },
    certificate: {
      findMany: vi.fn(),
    },
    teamApplication: {
      findMany: vi.fn(),
    },
    speaker: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    chapter: {
      findMany: vi.fn(),
    },
    chapterMember: {
      findMany: vi.fn(),
    },
  },
}));

describe("Community Analytics Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates all 12 Success Metrics accurately with active data", async () => {
    // 1. Users
    vi.mocked(db.user.count)
      .mockResolvedValueOnce(1200) // totalUsers
      .mockResolvedValueOnce(350) // active30d
      .mockResolvedValueOnce(280); // activePrev30d

    // 2. Registrations — use correct field name `ticketTypeId`
    const mockRegistrations = [
      {
        id: "r-1",
        userId: "u-1",
        status: "CONFIRMED",
        ticketTypeId: "tier-1",
        createdAt: new Date(),
        eventId: "e-1",
        event: { id: "e-1", type: EventType.WORKSHOP },
        payment: { amount: 500, status: "CAPTURED" },
      },
      {
        id: "r-2",
        userId: "u-1", // repeat attendee
        status: "CONFIRMED",
        ticketTypeId: "tier-free",
        createdAt: new Date(),
        eventId: "e-2",
        event: { id: "e-2", type: EventType.TECH_TALK },
        payment: null,
      },
      {
        id: "r-3",
        userId: "u-2",
        status: "CONFIRMED",
        ticketTypeId: "tier-free",
        createdAt: new Date(),
        eventId: "e-3",
        event: { id: "e-3", type: EventType.HACKATHON },
        payment: null,
      },
    ];
    vi.mocked(db.registration.findMany).mockResolvedValue(mockRegistrations as never);
    vi.mocked(db.registration.count).mockResolvedValue(2);

    // 3. Captured Payments
    vi.mocked(db.payment.findMany).mockResolvedValue([{ amount: 500 }] as never);

    // 4. Attendances
    vi.mocked(db.attendance.findMany).mockResolvedValue([
      {
        id: "a-1",
        registration: { id: "r-1", userId: "u-1", user: { id: "u-1", email: "u1@test.com" } },
      },
      {
        id: "a-2",
        registration: { id: "r-2", userId: "u-1", user: { id: "u-1", email: "u1@test.com" } },
      },
      {
        id: "a-3",
        registration: { id: "r-3", userId: "u-2", user: { id: "u-2", email: "u2@test.com" } },
      },
    ] as never);

    // 5. Events — _count only has `registrations` (no attendances relation)
    vi.mocked(db.event.findMany).mockResolvedValue([
      { id: "e-1", type: EventType.WORKSHOP, _count: { registrations: 45 } },
      { id: "e-2", type: EventType.TECH_TALK, _count: { registrations: 60 } },
      { id: "e-3", type: EventType.HACKATHON, _count: { registrations: 120 } },
    ] as never);

    // 6. Leads — use correct field `college` (not campusName)
    vi.mocked(db.campusLeadApplication.findMany).mockResolvedValue([
      { id: "c-1", status: "ACTIVE", college: "IIT Delhi", userId: "u-1" },
      { id: "c-2", status: "SELECTED", college: "BITS Pilani", userId: "u-3" },
    ] as never);

    vi.mocked(db.stateLeadApplication.findMany).mockResolvedValue([
      { id: "s-1", status: "ACTIVE", state: "Rajasthan", userId: "u-1" },
      { id: "s-2", status: "ACTIVE", state: "Delhi", userId: "u-4" },
    ] as never);

    // 7. Collaborations
    vi.mocked(db.collaborationLead.findMany).mockResolvedValue([
      { id: "cl-1", stage: "WON" },
      { id: "cl-2", stage: "IN_REVIEW" },
    ] as never);

    // 8. Sponsor Deals
    vi.mocked(db.sponsorDeal.findMany).mockResolvedValue([
      { id: "sd-1", stage: "WON", amount: 250000 },
      { id: "sd-2", stage: "QUALIFICATION", amount: 500000 },
    ] as never);

    // 9. Expenses & Invoices — correct model name: eventExpenseItem
    vi.mocked(db.eventExpenseItem.findMany).mockResolvedValue([
      { id: "exp-1", amount: 50000, eventId: "e-1" },
    ] as never);

    vi.mocked(db.sponsorInvoice.findMany).mockResolvedValue([
      { id: "inv-1", totalAmount: 250000 },
    ] as never);

    // 10. Certificates — use `deliveryStatus` (EmailJobStatus enum), not `status`
    vi.mocked(db.certificate.findMany).mockResolvedValue([
      { id: "cert-1", deliveryStatus: "SENT", participantEmail: "u1@test.com" },
      { id: "cert-2", deliveryStatus: "PENDING", participantEmail: "u2@test.com" },
    ] as never);

    // 11. Team, Speakers & Chapters
    vi.mocked(db.teamApplication.findMany).mockResolvedValue([
      { id: "t-1", email: "core@test.com" },
    ] as never);
    vi.mocked(db.speaker.findMany).mockResolvedValue([
      { id: "sp-1", userId: "u-1", isMentor: true, isSpeaker: true },
    ] as never);
    vi.mocked(db.chapter.findMany).mockResolvedValue([
      {
        id: "ch-1",
        members: [{ id: "cm-1", userId: "u-1", role: "LEAD" }],
      },
    ] as never);

    const metrics = await getCommunityAnalyticsOverview();

    // Verify MAU
    expect(metrics.mau.current30d).toBe(350);
    expect(metrics.mau.previous30d).toBe(280);
    expect(metrics.mau.growthPct).toBe(25);

    // Verify Paid Conversion
    expect(metrics.paidConversion.totalCapturedRevenue).toBe(500);
    expect(metrics.paidConversion.conversionRate).toBe(33); // 1 paid out of 3 confirmed = 33%

    // Verify Repeat Attendees
    expect(metrics.repeatAttendees.uniqueAttendees).toBe(2);
    expect(metrics.repeatAttendees.repeatAttendeesCount).toBe(1); // u-1 has 2 events
    expect(metrics.repeatAttendees.repeatAttendanceRate).toBe(50); // 1 out of 2 = 50%

    // Verify Workshop & Tech Talk Attendance
    expect(metrics.workshopTalkParticipation.totalWorkshops).toBe(1);
    expect(metrics.workshopTalkParticipation.totalTechTalks).toBe(1);
    expect(metrics.workshopTalkParticipation.combinedAttendees).toBe(105); // 45 + 60

    // Verify Campus Lead Activation
    expect(metrics.leadApplications.campus.activationRate).toBe(50); // 1 active out of 2 selected = 50%
    expect(metrics.leadApplications.campus.uniqueColleges).toBe(2);

    // Verify State Lead Coverage (2 covered out of 36)
    expect(metrics.stateCoverage.totalStatesAndUTs).toBe(36);
    expect(metrics.stateCoverage.coveredCount).toBe(2);
    expect(metrics.stateCoverage.coveragePct).toBe(6);
    expect(metrics.stateCoverage.coveredStates).toContain("Rajasthan");
    expect(metrics.stateCoverage.coveredStates).toContain("Delhi");

    // Verify Collaboration Leads
    expect(metrics.collaborationLeads.total).toBe(2);
    expect(metrics.collaborationLeads.wonCount).toBe(1);
    expect(metrics.collaborationLeads.conversionRate).toBe(50);

    // Verify Sponsor Conversion
    expect(metrics.sponsorConversion.totalDeals).toBe(2);
    expect(metrics.sponsorConversion.wonDeals).toBe(1);
    expect(metrics.sponsorConversion.closedWonValue).toBe(250000);
    expect(metrics.sponsorConversion.conversionRate).toBe(50);

    // Verify Event Profitability
    expect(metrics.profitability.ticketRevenue).toBe(500);
    expect(metrics.profitability.sponsorRevenue).toBe(250000);
    expect(metrics.profitability.totalRevenue).toBe(250500);
    expect(metrics.profitability.totalExpenses).toBe(50000);
    expect(metrics.profitability.netProfit).toBe(200500);
    expect(metrics.profitability.profitMarginPct).toBe(80);

    // Verify Certificate Delivery — "SENT" = delivered
    expect(metrics.certificates.totalIssued).toBe(2);
    expect(metrics.certificates.totalClaimedOrVerified).toBe(1);
    expect(metrics.certificates.deliveryRatePct).toBe(50);

    // Verify % Attendees Who Take a Community Role ()
    // u-1 attended events and is a Campus Lead, State Lead, Chapter Lead & Mentor
    expect(metrics.roleProgression.attendeesWithCommunityRole).toBe(1);
    expect(metrics.roleProgression.progressionRatePct).toBe(50); // 1 out of 2 unique attendees = 50%
  });

  it("handles zero/empty database states gracefully without NaN or errors", async () => {
    vi.mocked(db.user.count).mockResolvedValue(0);
    vi.mocked(db.registration.findMany).mockResolvedValue([]);
    vi.mocked(db.registration.count).mockResolvedValue(0);
    vi.mocked(db.payment.findMany).mockResolvedValue([]);
    vi.mocked(db.attendance.findMany).mockResolvedValue([]);
    vi.mocked(db.event.findMany).mockResolvedValue([]);
    vi.mocked(db.campusLeadApplication.findMany).mockResolvedValue([]);
    vi.mocked(db.stateLeadApplication.findMany).mockResolvedValue([]);
    vi.mocked(db.collaborationLead.findMany).mockResolvedValue([]);
    vi.mocked(db.sponsorDeal.findMany).mockResolvedValue([]);
    vi.mocked(db.eventExpenseItem.findMany).mockResolvedValue([]);
    vi.mocked(db.sponsorInvoice.findMany).mockResolvedValue([]);
    vi.mocked(db.certificate.findMany).mockResolvedValue([]);
    vi.mocked(db.teamApplication.findMany).mockResolvedValue([]);
    vi.mocked(db.speaker.findMany).mockResolvedValue([]);
    vi.mocked(db.chapter.findMany).mockResolvedValue([]);

    const metrics = await getCommunityAnalyticsOverview();

    expect(metrics.summary.communityHealthScore).toBeGreaterThanOrEqual(20);
    expect(metrics.paidConversion.conversionRate).toBe(0);
    expect(metrics.repeatAttendees.repeatAttendanceRate).toBe(0);
    expect(metrics.stateCoverage.coveragePct).toBe(0);
    expect(metrics.roleProgression.progressionRatePct).toBe(0);
    expect(metrics.profitability.profitMarginPct).toBe(0);
  });
});

describe("Personalized Recommendations Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("recommends events scored by user city and past attended format, and suggests Campus Lead role", async () => {
    // User profile — city/college/state are NOT on User; we only need skills & role
    const mockUser = {
      id: "u-builder-1",
      name: "Aarav Saini",
      email: "aarav@iitd.ac.in",
      skills: ["Rust", "Distributed Systems", "Next.js"],
      role: "MEMBER",
    };

    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as never);

    // User previously registered for a Workshop in Delhi
    // city & college come from Registration fields, not User
    vi.mocked(db.registration.findMany).mockResolvedValue([
      {
        id: "r-old",
        eventId: "evt-old",
        city: "New Delhi", // Registration.city ← location source
        college: "IIT Delhi", // Registration.college ← college source
        event: {
          id: "evt-old",
          type: EventType.WORKSHOP,
          title: "Rust Core Workshop",
          category: "Rust", // Event.category replaces tags
          city: { name: "New Delhi", state: "Delhi" },
        },
      },
    ] as never);

    vi.mocked(db.chapterMember.findMany).mockResolvedValue([]);
    vi.mocked(db.campusLeadApplication.findFirst).mockResolvedValue(null);
    vi.mocked(db.stateLeadApplication.findFirst).mockResolvedValue(null);
    vi.mocked(db.speaker.findFirst).mockResolvedValue(null);

    // Upcoming events — use attendanceMode (AttendanceMode enum), not isVirtual boolean
    const mockUpcomingEvents = [
      {
        id: "evt-delhi-workshop",
        title: "Hands-on Rust Concurrency Workshop",
        slug: "rust-concurrency-delhi",
        type: EventType.WORKSHOP,
        coverImage: null,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        venue: "IIT Delhi Seminar Hall",
        attendanceMode: AttendanceMode.IN_PERSON,
        category: "Rust",
        city: { name: "New Delhi", state: "Delhi" },
        _count: { registrations: 35 },
      },
      {
        id: "evt-mumbai-meetup",
        title: "Mumbai Web3 Meetup",
        slug: "mumbai-web3-01",
        type: EventType.MEETUP,
        coverImage: null,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        venue: "BKC Center",
        attendanceMode: AttendanceMode.IN_PERSON,
        category: "Web3",
        city: { name: "Mumbai", state: "Maharashtra" },
        _count: { registrations: 10 },
      },
    ];

    vi.mocked(db.event.findMany).mockResolvedValue(mockUpcomingEvents as never);

    const recs = await getPersonalizedRecommendations("u-builder-1");

    expect(recs.userContext.city).toBe("New Delhi");
    expect(recs.userContext.college).toBe("IIT Delhi");
    expect(recs.recommendedEvents.length).toBeGreaterThanOrEqual(1);

    // The Delhi Rust Workshop should have higher match score than Mumbai Meetup
    const topEvent = recs.recommendedEvents[0];
    expect(topEvent.id).toBe("evt-delhi-workshop");
    expect(topEvent.matchScore).toBeGreaterThanOrEqual(85);
    expect(topEvent.matchReasons.some((r) => r.includes("New Delhi") || r.includes("city"))).toBe(
      true
    );

    // Campus Lead role should be recommended because user has college and is not a lead
    const campusRole = recs.recommendedRoles.find((r) => r.roleId === "campus-lead");
    expect(campusRole).toBeDefined();
    expect(campusRole?.ctaLink).toBe("/community#lead");
    expect(campusRole?.matchReasons.some((r) => r.includes("IIT Delhi"))).toBe(true);
  });
});
