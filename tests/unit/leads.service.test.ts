// tests/unit/leads.service.test.ts
// Unit tests for Campus Lead and State Lead Data Engine per :
// 1. Performance Scoring: Bronze, Silver, Gold, Platinum tiers and max component score capping.
// 2. Campus & State Lead Dashboards: Role-scoped metrics, aggregations, activities, reports.
// 3. Activity Logging & Verification: Status transitions, score recalculations.
// 4. Monthly Reports: Submission & review.
// 5. Automated Email Sequences: Onboarding, inactivity nudges, post-event feedback + CTAs.

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculatePerformanceScore,
  getCampusLeadDashboard,
  getStateLeadDashboard,
  logLeadActivity,
  verifyLeadActivity,
  deleteLeadActivity,
  submitMonthlyReport,
  reviewMonthlyReport,
} from "@/server/leads/service";
import {
  sendLeadOnboardingEmail,
  checkAndSendInactivityNudges,
  sendPostEventFeedbackAndNextSteps,
} from "@/server/leads/email-automation";
import { db } from "@/lib/db";
import { enqueueEmail } from "@/server/email/queue";
import {
  LeadActivityType,
  MonthlyReportStatus,
  EmailTemplate,
  RegistrationStatus,
} from "@prisma/client";

vi.mock("@/lib/db", () => ({
  db: {
    campusLead: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    stateLead: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    college: {
      count: vi.fn(),
    },
    city: {
      count: vi.fn(),
    },
    leadActivity: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    leadMonthlyReport: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    campusLeadEvent: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    stateLeadEvent: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    event: {
      findUnique: vi.fn(),
    },
    registration: {
      findMany: vi.fn(),
    },
    emailLog: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/server/email/queue", () => ({
  enqueueEmail: vi.fn(),
}));

describe("Campus & State Leads: Performance Scoring", () => {
  it("calculates Bronze tier for low scores (< 50)", () => {
    const res = calculatePerformanceScore({
      referrals: 10, // 5 pts
      eventsSupported: 1, // 10 pts
      activitiesCount: 2, // 10 pts
      reportsCount: 1, // 5 pts
    });

    expect(res.score).toBe(30);
    expect(res.tier).toBe("BRONZE");
    expect(res.tierLabel).toBe("Emerging Builder");
  });

  it("calculates Silver tier for mid-range scores (50 - 69)", () => {
    const res = calculatePerformanceScore({
      referrals: 30, // 15 pts
      eventsSupported: 2, // 20 pts
      activitiesCount: 3, // 15 pts
      reportsCount: 1, // 5 pts
    });

    expect(res.score).toBe(55);
    expect(res.tier).toBe("SILVER");
    expect(res.tierLabel).toBe("Active Chapter Lead");
  });

  it("calculates Gold tier for high scores (70 - 84)", () => {
    const res = calculatePerformanceScore({
      referrals: 50, // 25 pts
      eventsSupported: 2, // 20 pts
      activitiesCount: 4, // 20 pts
      reportsCount: 2, // 10 pts
    });

    expect(res.score).toBe(75);
    expect(res.tier).toBe("GOLD");
    expect(res.tierLabel).toBe("Growth Catalyst");
  });

  it("calculates Platinum tier for elite scores (>= 85)", () => {
    const res = calculatePerformanceScore({
      referrals: 70, // 35 pts (cap)
      eventsSupported: 3, // 30 pts (cap)
      activitiesCount: 5, // 25 pts (cap)
      reportsCount: 2, // 10 pts (cap)
    });

    expect(res.score).toBe(100);
    expect(res.tier).toBe("PLATINUM");
    expect(res.tierLabel).toBe("Campus / State Champion");
  });

  it("caps breakdown metrics properly when inputs exceed maximums", () => {
    const res = calculatePerformanceScore({
      referrals: 1000, // max 35
      eventsSupported: 50, // max 30
      activitiesCount: 100, // max 25
      reportsCount: 20, // max 10
    });

    expect(res.breakdown.referralsScore).toBe(35);
    expect(res.breakdown.eventsScore).toBe(30);
    expect(res.breakdown.activitiesScore).toBe(25);
    expect(res.breakdown.reportsScore).toBe(10);
    expect(res.score).toBe(100);
  });
});

describe("Campus Lead Dashboard Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null if campus lead does not exist", async () => {
    vi.mocked(db.campusLead.findFirst).mockResolvedValue(null);

    const result = await getCampusLeadDashboard("nonexistent");
    expect(result).toBeNull();
  });

  it("returns populated scoped dashboard for an active campus lead", async () => {
    const mockLead = {
      id: "camp-1",
      userId: "user-1",
      collegeId: "col-1",
      cityId: "city-1",
      status: "ACTIVE" as const,
      startDate: new Date("2026-01-01"),
      tenureEnd: null,
      referrals: 24,
      eventsSupported: 2,
      referralCode: "KX-CAMP-TEST1",
      performanceScore: 42,
      adminNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: "user-1",
        name: "Aayush Negi",
        email: "aayush@geu.ac.in",
        phone: "+919876543210",
        image: null,
      },
      college: {
        id: "col-1",
        name: "Graphic Era University",
        state: "Uttarakhand",
        slug: "geu",
      },
      city: {
        id: "city-1",
        name: "Dehradun",
        state: "Uttarakhand",
      },
      activities: [
        {
          id: "act-1",
          type: LeadActivityType.WORKSHOP_HOSTING,
          title: "Intro to Web3",
          description: "Hands-on session for 50 students",
          attendeesCount: 50,
          hoursSpent: 3,
          date: new Date(),
          verifiedByAdmin: true,
          adminFeedback: "Approved by Admin",
          proofUrls: ["https://example.com/photos"],
          createdAt: new Date(),
          eventId: null,
        },
      ],
      monthlyReports: [
        {
          id: "rep-1",
          year: 2026,
          month: 9,
          status: MonthlyReportStatus.SUBMITTED,
          summary: "Monthly recap for Sept",
          highlights: "Conducted 2 workshops",
          challenges: "Venue permissions",
          nextMonthPlans: "Host hackathon booth",
          newSignupsCount: 20,
          eventsOrganizedCount: 1,
          swagDistributedCount: 15,
          performanceScore: null,
          adminFeedback: null,
          submittedAt: new Date(),
          reviewedAt: null,
          createdAt: new Date(),
        },
      ],
      supportedEvents: [
        {
          id: "cle-1",
          eventId: "evt-1",
          role: "VOLUNTEER_COORDINATOR",
          notes: "Lead team of 10 volunteers",
          createdAt: new Date(),
          event: {
            id: "evt-1",
            title: "KailshiansX Summit Dehradun",
            slug: "kailshiansx-summit-dehradun",
            startDate: new Date("2026-10-15"),
            city: { name: "Dehradun" },
          },
        },
      ],
    };

    vi.mocked(db.campusLead.findFirst).mockResolvedValue(mockLead as unknown as never);
    vi.mocked(db.campusLead.update).mockResolvedValue({} as unknown as never);

    const dashboard = await getCampusLeadDashboard("camp-1");
    expect(dashboard).not.toBeNull();
    expect(dashboard?.name).toBe("Aayush Negi");
    expect(dashboard?.collegeName).toBe("Graphic Era University");
    expect(dashboard?.cityName).toBe("Dehradun");
    expect(dashboard?.referralLink).toContain("KX-CAMP-TEST1");
    expect(dashboard?.activities).toHaveLength(1);
    expect(dashboard?.monthlyReports).toHaveLength(1);
    expect(dashboard?.supportedEvents).toHaveLength(1);
    expect(dashboard?.performance.score).toBeGreaterThan(0);
  });
});

describe("State Lead Dashboard Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null if state lead does not exist", async () => {
    vi.mocked(db.stateLead.findFirst).mockResolvedValue(null);

    const result = await getStateLeadDashboard("nonexistent");
    expect(result).toBeNull();
  });

  it("aggregates data statewide across campus leads in the state", async () => {
    const mockStateLead = {
      id: "state-1",
      userId: "user-lead-1",
      state: "Uttarakhand",
      status: "ACTIVE" as const,
      startDate: new Date("2026-01-01"),
      tenureEnd: null,
      referrals: 10,
      eventsSupported: 1,
      referralCode: "KX-STATE-UK1",
      performanceScore: 50,
      adminNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: "user-lead-1",
        name: "Rahul Rawat",
        email: "rahul@uttarakhand.gov.in",
        phone: "+919876543211",
        image: null,
      },
      cities: [{ id: "city-1", name: "Dehradun" }],
      activities: [],
      monthlyReports: [],
      supportedEvents: [],
    };

    const mockCampusLeadsInState = [
      {
        id: "c-1",
        referrals: 20,
        eventsSupported: 2,
        user: { name: "Lead 1", email: "l1@example.com" },
        college: { name: "GEU", state: "Uttarakhand" },
        city: { name: "Dehradun", state: "Uttarakhand" },
      },
      {
        id: "c-2",
        referrals: 15,
        eventsSupported: 1,
        user: { name: "Lead 2", email: "l2@example.com" },
        college: { name: "IIT Roorkee", state: "Uttarakhand" },
        city: { name: "Roorkee", state: "Uttarakhand" },
      },
    ];

    vi.mocked(db.stateLead.findFirst).mockResolvedValue(mockStateLead as unknown as never);
    vi.mocked(db.campusLead.findMany).mockResolvedValue(mockCampusLeadsInState as unknown as never);
    vi.mocked(db.college.count).mockResolvedValue(12);
    vi.mocked(db.city.count).mockResolvedValue(4);
    vi.mocked(db.stateLead.update).mockResolvedValue({} as unknown as never);

    const dashboard = await getStateLeadDashboard("state-1");
    expect(dashboard).not.toBeNull();
    expect(dashboard?.state).toBe("Uttarakhand");
    expect(dashboard?.campusLeadsInState).toHaveLength(2);
    // Statewide referrals = 10 (own) + 20 + 15 = 45
    expect(dashboard?.stateAggregates.totalStatewideReferrals).toBe(45);
    // Statewide events = 1 (own) + 2 + 1 = 4
    expect(dashboard?.stateAggregates.totalStatewideEvents).toBe(4);
    expect(dashboard?.stateAggregates.totalCampusLeadsCount).toBe(2);
  });
});

describe("Lead Activity Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs an activity for a campus lead and updates performance score", async () => {
    const mockActivity = {
      id: "act-new",
      campusLeadId: "camp-1",
      stateLeadId: null,
      type: LeadActivityType.INFO_SESSION,
      title: "Campus Orientation",
      description: "Introductory seminar for freshman students",
      attendeesCount: 120,
      hoursSpent: 2,
      date: new Date(),
      verifiedByAdmin: false,
      adminFeedback: null,
      proofUrls: [],
      eventId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(db.leadActivity.create).mockResolvedValue(mockActivity as unknown as never);
    vi.mocked(db.campusLead.findUnique).mockResolvedValue({
      id: "camp-1",
      referrals: 20,
      eventsSupported: 2,
      activities: [{ id: "act-new" }],
      monthlyReports: [],
    } as unknown as never);
    vi.mocked(db.campusLead.update).mockResolvedValue({} as unknown as never);

    const result = await logLeadActivity({
      leadId: "camp-1",
      leadType: "CAMPUS",
      type: LeadActivityType.INFO_SESSION,
      title: "Campus Orientation",
      description: "Introductory seminar for freshman students",
      attendeesCount: 120,
      hoursSpent: 2,
    });

    expect(result.id).toBe("act-new");
    expect(db.leadActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          campusLeadId: "camp-1",
          title: "Campus Orientation",
          type: LeadActivityType.INFO_SESSION,
        }),
      })
    );
    expect(db.campusLead.update).toHaveBeenCalled();
  });

  it("verifies an activity and recalculates the lead performance score", async () => {
    const existing = {
      id: "act-1",
      campusLeadId: "camp-1",
      stateLeadId: null,
      type: LeadActivityType.WORKSHOP_HOSTING,
      title: "Tech Workshop",
      description: "Code lab",
      verifiedByAdmin: false,
    };

    vi.mocked(db.leadActivity.update).mockResolvedValue({
      ...existing,
      verifiedByAdmin: true,
      adminFeedback: "Verified by lead reviewer",
    } as unknown as never);
    vi.mocked(db.campusLead.findUnique).mockResolvedValue({
      id: "camp-1",
      referrals: 20,
      eventsSupported: 2,
      activities: [{ id: "act-1" }],
      monthlyReports: [],
    } as unknown as never);
    vi.mocked(db.campusLead.update).mockResolvedValue({} as unknown as never);

    const updated = await verifyLeadActivity("act-1", true, "Verified by lead reviewer");

    expect(updated.verifiedByAdmin).toBe(true);
    expect(db.leadActivity.update).toHaveBeenCalled();
    expect(db.campusLead.update).toHaveBeenCalled();
  });

  it("deletes an activity and adjusts performance score", async () => {
    const existing = {
      id: "act-1",
      campusLeadId: "camp-1",
      stateLeadId: null,
    };

    vi.mocked(db.leadActivity.delete).mockResolvedValue(existing as unknown as never);
    vi.mocked(db.campusLead.findUnique).mockResolvedValue({
      id: "camp-1",
      referrals: 10,
      eventsSupported: 1,
      activities: [],
      monthlyReports: [],
    } as unknown as never);
    vi.mocked(db.campusLead.update).mockResolvedValue({} as unknown as never);

    const deleted = await deleteLeadActivity("act-1");
    expect(deleted.id).toBe("act-1");
    expect(db.leadActivity.delete).toHaveBeenCalledWith({ where: { id: "act-1" } });
  });
});

describe("Monthly Report Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits a monthly report and recalculates performance score", async () => {
    const mockReport = {
      id: "rep-1",
      campusLeadId: "camp-1",
      year: 2026,
      month: 10,
      status: MonthlyReportStatus.SUBMITTED,
      summary: "Completed 3 college seminars",
      highlights: "Conducted 3 college seminars",
      challenges: "None",
      nextMonthPlans: "Onboard 50 new members",
      newSignupsCount: 30,
      eventsOrganizedCount: 2,
      swagDistributedCount: 20,
    };

    vi.mocked(db.leadMonthlyReport.upsert).mockResolvedValue(mockReport as unknown as never);
    vi.mocked(db.campusLead.findUnique).mockResolvedValue({
      id: "camp-1",
      referrals: 20,
      eventsSupported: 2,
      activities: [],
      monthlyReports: [{ id: "rep-1" }],
    } as unknown as never);
    vi.mocked(db.campusLead.update).mockResolvedValue({} as unknown as never);

    const res = await submitMonthlyReport({
      leadId: "camp-1",
      leadType: "CAMPUS",
      year: 2026,
      month: 10,
      summary: "Completed 3 college seminars",
      highlights: "Conducted 3 college seminars",
      challenges: "None",
      nextMonthPlans: "Onboard 50 new members",
      newSignupsCount: 30,
      eventsOrganizedCount: 2,
      swagDistributedCount: 20,
    });

    expect(res.id).toBe("rep-1");
    expect(res.status).toBe(MonthlyReportStatus.SUBMITTED);
    expect(db.leadMonthlyReport.upsert).toHaveBeenCalled();
  });

  it("allows admin to review and add notes to monthly report", async () => {
    const existing = {
      id: "rep-1",
      campusLeadId: "camp-1",
      stateLeadId: null,
      status: MonthlyReportStatus.SUBMITTED,
    };

    vi.mocked(db.leadMonthlyReport.update).mockResolvedValue({
      ...existing,
      status: MonthlyReportStatus.REVIEWED,
      performanceScore: 90,
      adminFeedback: "Outstanding work on community engagement!",
    } as unknown as never);
    vi.mocked(db.campusLead.findUnique).mockResolvedValue({
      id: "camp-1",
      referrals: 20,
      eventsSupported: 2,
      activities: [],
      monthlyReports: [{ id: "rep-1" }],
    } as unknown as never);
    vi.mocked(db.campusLead.update).mockResolvedValue({} as unknown as never);

    const res = await reviewMonthlyReport("rep-1", 90, "Outstanding work on community engagement!");

    expect(res.status).toBe(MonthlyReportStatus.REVIEWED);
    expect(db.leadMonthlyReport.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "rep-1" },
        data: expect.objectContaining({
          status: "REVIEWED",
          performanceScore: 90,
          adminFeedback: "Outstanding work on community engagement!",
        }),
      })
    );
  });
});

describe("Lead Email Automation Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enqueues onboarding email with custom referral code and links", async () => {
    vi.mocked(enqueueEmail).mockResolvedValue({
      id: "log-1",
      template: EmailTemplate.LEAD_ONBOARDING,
      recipient: "lead@college.edu",
    } as unknown as never);

    const res = await sendLeadOnboardingEmail({
      leadId: "camp-1",
      leadType: "CAMPUS_LEAD",
      recipientEmail: "lead@college.edu",
      leadName: "Aayush Negi",
      collegeOrState: "Graphic Era University",
      referralCode: "KX-CAMP-TEST1",
    });

    expect(enqueueEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        template: EmailTemplate.LEAD_ONBOARDING,
        recipient: "lead@college.edu",
        payload: expect.objectContaining({
          name: "Aayush Negi",
          leadType: "CAMPUS_LEAD",
          collegeOrState: "Graphic Era University",
          referralCode: "KX-CAMP-TEST1",
          dashboardUrl: "https://kailshiansx.com/lead",
        }),
      })
    );
    expect(res.success).toBe(true);
    expect(res.emailLogId).toBe("log-1");
  });

  it("scans and enqueues inactivity nudges for inactive leads", async () => {
    const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
    const mockInactiveLead = {
      id: "camp-inactive",
      status: "ACTIVE",
      startDate: thirtyFiveDaysAgo,
      referrals: 5,
      eventsSupported: 0,
      referralCode: "KX-CAMP-INACTIVE",
      performanceScore: 10,
      user: {
        name: "Inactive Lead",
        email: "inactive@college.edu",
      },
      college: {
        name: "Inactive University",
      },
      city: {
        name: "City",
      },
      activities: [
        {
          date: thirtyFiveDaysAgo,
        },
      ],
      monthlyReports: [],
    };

    vi.mocked(db.campusLead.findMany).mockResolvedValue([mockInactiveLead as unknown as never]);
    vi.mocked(db.stateLead.findMany).mockResolvedValue([]);
    vi.mocked(db.emailLog.findFirst).mockResolvedValue(null); // No recent nudge sent
    vi.mocked(enqueueEmail).mockResolvedValue({ id: "log-nudge" } as unknown as never);

    const summary = await checkAndSendInactivityNudges();
    expect(summary.totalNudges).toBe(1);
    expect(summary.campusNudgesSent).toBe(1);
    expect(summary.nudgedLeads[0].email).toBe("inactive@college.edu");
    expect(enqueueEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        template: EmailTemplate.LEAD_INACTIVITY_NUDGE,
        recipient: "inactive@college.edu",
        payload: expect.objectContaining({
          name: "Inactive Lead",
          daysInactive: expect.any(Number),
        }),
      })
    );
  });

  it("enqueues post-event feedback and 'Next Step' CTA emails to confirmed attendees", async () => {
    const mockEvent = {
      id: "evt-100",
      title: "KailshiansX Hackathon 2026",
      slug: "kx-hack-2026",
    };

    const mockRegistrations = [
      {
        id: "reg-1",
        name: "Priya Sharma",
        email: "priya@example.com",
        status: RegistrationStatus.CONFIRMED,
        certificate: { uniqueId: "CERT-PRIYA-100" },
      },
      {
        id: "reg-2",
        name: "Rohan Verma",
        email: "rohan@example.com",
        status: RegistrationStatus.CONFIRMED,
        certificate: null,
      },
    ];

    vi.mocked(db.event.findUnique).mockResolvedValue(mockEvent as unknown as never);
    vi.mocked(db.registration.findMany).mockResolvedValue(mockRegistrations as unknown as never);
    vi.mocked(db.emailLog.findFirst).mockResolvedValue(null);
    vi.mocked(enqueueEmail).mockResolvedValue({ id: "log-post-evt" } as unknown as never);

    const summary = await sendPostEventFeedbackAndNextSteps("evt-100");

    expect(summary.success).toBe(true);
    expect(summary.totalSent).toBe(2);
    expect(summary.recipientEmails).toContain("priya@example.com");
    expect(summary.recipientEmails).toContain("rohan@example.com");

    expect(enqueueEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        template: EmailTemplate.POST_EVENT_FEEDBACK_NEXT_STEP,
        recipient: "priya@example.com",
        payload: expect.objectContaining({
          attendeeName: "Priya Sharma",
          eventTitle: "KailshiansX Hackathon 2026",
          eventSlug: "kx-hack-2026",
          certificateUrl: "https://kailshiansx.com/verify?id=CERT-PRIYA-100",
          feedbackUrl: "https://kailshiansx.com/events/kx-hack-2026?feedback=1",
          volunteerUrl: "https://kailshiansx.com/collaborations",
          campusLeadUrl: "https://kailshiansx.com/campus-leads",
          stateLeadUrl: "https://kailshiansx.com/state-leads",
          speakerUrl: "https://kailshiansx.com/collaborations",
        }),
      })
    );
  });
});
