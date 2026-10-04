// tests/unit/chapters-mentors-partners.service.test.ts
// Unit tests for Chapter Dashboards, Mentor/Speaker Network & Partner Portal

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  computeChapterHealth,
  getChaptersDirectory,
  createChapter,
  joinChapter,
  completeChapterEvent,
} from "@/server/chapters/service";
import {
  getMentorSpeakerNetwork,
  createBookingRequest,
  respondToBookingRequest,
  completeBookingRequest,
  updateSpeakerAvailability,
} from "@/server/speakers/service";
import {
  generatePartnerAccessCode,
  getPartnerPortalData,
  updateDeliverableProof,
  publishSponsorEventReport,
} from "@/server/partners/service";
import { db } from "@/lib/db";
import {
  ChapterType,
  ChapterStatus,
  ChapterMemberRole,
  ChapterMemberStatus,
  ChapterHealthStatus,
  ChapterEventStatus,
  SpeakerAvailabilityStatus,
  BookingRequestStatus,
  DeliverableStatus,
} from "@prisma/client";

vi.mock("@/lib/db", () => ({
  db: {
    city: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    chapter: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn().mockResolvedValue(5),
    },
    chapterMember: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    chapterEvent: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    chapterHealthMetric: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    speaker: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn().mockResolvedValue(5),
    },
    speakerBookingRequest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    partner: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn().mockResolvedValue(5),
    },
    sponsorDeliverable: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    sponsorEventReport: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    event: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  },
}));

describe("Chapter Engine & Health Scoring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.chapter.count).mockResolvedValue(5);
    vi.mocked(db.speaker.count).mockResolvedValue(5);
    vi.mocked(db.partner.findMany).mockResolvedValue([]);
  });

  describe("computeChapterHealth algorithm", () => {
    it("returns CRITICAL health when cadence adherence is 0 and no active members or leads", () => {
      const health = computeChapterHealth({
        activeMembersCount: 0,
        recentEventsCount: 0,
        avgAttendance: 0,
        hasLead: false,
        cadenceAdherencePct: 0,
      });

      expect(health.score).toBeLessThan(40);
      expect(health.status).toBe(ChapterHealthStatus.CRITICAL);
      expect(health.breakdown.cadenceScore).toBe(0);
      expect(health.breakdown.memberScore).toBe(0);
      expect(health.breakdown.leadershipScore).toBe(0);
    });

    it("returns EXCELLENT health when regular cadence, 25+ builders, and strong attendance", () => {
      const health = computeChapterHealth({
        activeMembersCount: 30,
        recentEventsCount: 3,
        avgAttendance: 45,
        hasLead: true,
        cadenceAdherencePct: 100,
      });

      expect(health.score).toBeGreaterThanOrEqual(80);
      expect(health.status).toBe(ChapterHealthStatus.EXCELLENT);
      expect(health.breakdown.cadenceScore).toBe(30);
      expect(health.breakdown.memberScore).toBe(30);
      expect(health.breakdown.leadershipScore).toBe(10);
    });
  });

  describe("getChaptersDirectory", () => {
    it("returns transformed chapters list with health and counts", async () => {
      const mockChapter = {
        id: "ch-1",
        name: "IIT Delhi Chapter",
        slug: "iit-delhi",
        type: ChapterType.CAMPUS,
        status: ChapterStatus.ACTIVE,
        institution: "IIT Delhi",
        city: { name: "New Delhi", state: "Delhi" },
        state: "Delhi",
        logoUrl: null,
        description: "Official IIT Delhi Chapter",
        healthScore: 92,
        healthStatus: ChapterHealthStatus.EXCELLENT,
        meetingCadence: "Bi-weekly Saturdays",
        lead: {
          id: "u-1",
          name: "Aarav Saini",
          email: "aarav@example.com",
          image: null,
          headline: "Lead",
        },
        members: [{ id: "m-1" }, { id: "m-2" }],
        events: [{ id: "ev-1" }],
        _count: {
          members: 2,
          events: 1,
        },
      };

      vi.mocked(db.chapter.findMany).mockResolvedValue([mockChapter as never]);

      const chapters = await getChaptersDirectory();
      expect(chapters).toHaveLength(1);
      expect(chapters[0].slug).toBe("iit-delhi");
      expect(chapters[0].healthScore).toBe(92);
      expect(chapters[0].healthStatus).toBe(ChapterHealthStatus.EXCELLENT);
      expect(chapters[0].activeMembersCount).toBe(2);
      expect(chapters[0].totalEventsCount).toBe(1);
    });
  });

  describe("createChapter", () => {
    it("creates a chapter and registers founding member as Chapter LEAD", async () => {
      const mockCreated = {
        id: "ch-2",
        name: "BITS Pilani Chapter",
        slug: "bits-pilani",
        type: ChapterType.CAMPUS,
        institution: "BITS Pilani",
        state: "Rajasthan",
        leadId: "user-lead-1",
      };

      vi.mocked(db.chapter.findUnique).mockResolvedValue(null);
      vi.mocked(db.chapter.create).mockResolvedValue(mockCreated as never);
      vi.mocked(db.chapterMember.create).mockResolvedValue({
        id: "m-new",
        chapterId: "ch-2",
        userId: "user-lead-1",
        role: ChapterMemberRole.LEAD,
        status: ChapterMemberStatus.ACTIVE,
      } as never);
      vi.mocked(db.user.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(db.chapterHealthMetric.create).mockResolvedValue({ id: "hm-1" } as never);

      const result = await createChapter({
        name: "BITS Pilani Chapter",
        slug: "bits-pilani",
        type: ChapterType.CAMPUS,
        institution: "BITS Pilani",
        state: "Rajasthan",
        leadId: "user-lead-1",
      });

      expect(result.slug).toBe("bits-pilani");
      expect(db.chapter.create).toHaveBeenCalled();
      expect(db.chapterMember.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          chapterId: "ch-2",
          userId: "user-lead-1",
          role: ChapterMemberRole.LEAD,
        }),
      });
      expect(db.chapterHealthMetric.create).toHaveBeenCalled();
    });
  });

  describe("joinChapter", () => {
    it("is idempotent: returns existing membership if already active", async () => {
      vi.mocked(db.chapterMember.findUnique).mockResolvedValue({
        id: "m-existing",
        chapterId: "ch-1",
        userId: "u-1",
        status: ChapterMemberStatus.ACTIVE,
      } as never);

      const membership = await joinChapter("ch-1", "u-1");
      expect(membership.id).toBe("m-existing");
      expect(membership.status).toBe(ChapterMemberStatus.ACTIVE);
    });

    it("creates a new member record and refreshes health metric if joining for the first time", async () => {
      vi.mocked(db.chapterMember.findUnique).mockResolvedValue(null);
      vi.mocked(db.chapterMember.create).mockResolvedValue({
        id: "m-new-2",
        chapterId: "ch-1",
        userId: "u-builder",
        role: ChapterMemberRole.MEMBER,
        status: ChapterMemberStatus.ACTIVE,
      } as never);

      vi.mocked(db.chapter.findUnique).mockResolvedValue({
        id: "ch-1",
        leadId: "u-lead",
        members: [{ id: "m-1" }, { id: "m-2" }],
        events: [],
      } as never);
      vi.mocked(db.chapter.update).mockResolvedValue({} as never);
      vi.mocked(db.chapterHealthMetric.create).mockResolvedValue({ id: "hm-2" } as never);

      const membership = await joinChapter("ch-1", "u-builder");
      expect(membership.id).toBe("m-new-2");
      expect(db.chapterMember.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          chapterId: "ch-1",
          userId: "u-builder",
          role: ChapterMemberRole.MEMBER,
        }),
      });
      expect(db.chapterHealthMetric.create).toHaveBeenCalled();
    });
  });

  describe("completeChapterEvent", () => {
    it("marks event completed, logs attendee count, and triggers health recalculation", async () => {
      vi.mocked(db.chapterEvent.update).mockResolvedValue({
        id: "ev-1",
        chapterId: "ch-1",
        status: ChapterEventStatus.COMPLETED,
        attendanceCount: 50,
      } as never);

      vi.mocked(db.chapter.findUnique).mockResolvedValue({
        id: "ch-1",
        leadId: "u-lead",
        members: [{ id: "m-1" }],
        events: [
          {
            id: "ev-1",
            date: new Date(),
            status: ChapterEventStatus.COMPLETED,
            attendanceCount: 50,
          },
        ],
      } as never);
      vi.mocked(db.chapter.update).mockResolvedValue({} as never);
      vi.mocked(db.chapterHealthMetric.create).mockResolvedValue({
        id: "hm-1",
        healthScore: 85,
      } as never);

      const updated = await completeChapterEvent("ev-1", 50, "Great turnout!");
      expect(updated.status).toBe(ChapterEventStatus.COMPLETED);
      expect(updated.attendanceCount).toBe(50);
      expect(db.chapter.update).toHaveBeenCalled();
      expect(db.chapterHealthMetric.create).toHaveBeenCalled();
    });
  });
});

describe("Mentor / Speaker Network & Booking Lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.speaker.count).mockResolvedValue(5);
  });

  describe("getMentorSpeakerNetwork", () => {
    it("filters network by search topic and availability", async () => {
      const mockSpeaker = {
        id: "sp-1",
        name: "Dr. Ananya Sharma",
        slug: "ananya-sharma",
        role: "Staff AI Engineer",
        company: "Google DeepMind",
        bio: "AI researcher focusing on large language models.",
        topics: ["AI / ML", "LLMs", "Transformers"],
        sessionTypes: ["1-on-1 Mentorship", "Technical Keynote"],
        availabilityStatus: SpeakerAvailabilityStatus.AVAILABLE,
        isMentor: true,
        isSpeaker: true,
        rating: 4.95,
        totalSessionsConducted: 42,
        user: { name: "Ananya", email: "ananya@example.com", image: null },
        _count: { eventSpeakers: 3 },
      };

      vi.mocked(db.speaker.findMany).mockResolvedValue([mockSpeaker as never]);

      const result = await getMentorSpeakerNetwork({
        topic: "AI / ML",
        availability: SpeakerAvailabilityStatus.AVAILABLE,
      });

      expect(result.speakers).toHaveLength(1);
      expect(result.speakers[0].name).toBe("Dr. Ananya Sharma");
      expect(result.speakers[0].rating).toBe(4.95);
    });
  });

  describe("createBookingRequest", () => {
    it("disallows booking yourself as a mentor", async () => {
      vi.mocked(db.speaker.findUnique).mockResolvedValue({
        id: "sp-1",
        userId: "user-same",
        name: "Self Mentor",
      } as never);

      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: "user-same",
        name: "Self",
        email: "self@example.com",
      } as never);

      await expect(
        createBookingRequest({
          speakerId: "sp-1",
          requesterId: "user-same",
          title: "Career guidance",
          sessionType: "1-on-1 Mentorship",
          topic: "AI",
          preferredDate: new Date().toISOString(),
          durationMinutes: 45,
          description: "Career guidance",
        })
      ).rejects.toThrow("Cannot book a mentorship session with yourself.");
    });

    it("generates a Google Meet link and saves PENDING booking", async () => {
      vi.mocked(db.speaker.findUnique).mockResolvedValue({
        id: "sp-1",
        userId: "user-mentor",
        name: "Mentor Pro",
        user: { email: "mentor@example.com", name: "Mentor Pro" },
      } as never);

      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: "user-builder",
        name: "Builder",
        email: "builder@example.com",
      } as never);

      const mockBooking = {
        id: "b-1",
        speakerId: "sp-1",
        userId: "user-builder",
        sessionType: "1-on-1 Mentorship",
        topic: "Web3 Architecture",
        status: BookingRequestStatus.PENDING,
        meetingUrl: "https://meet.google.com/kx-mentor-session",
      };

      vi.mocked(db.speakerBookingRequest.create).mockResolvedValue(mockBooking as never);

      const created = await createBookingRequest({
        speakerId: "sp-1",
        requesterId: "user-builder",
        title: "Web3 Session",
        sessionType: "1-on-1 Mentorship",
        topic: "Web3 Architecture",
        preferredDate: new Date().toISOString(),
        durationMinutes: 45,
        description: "Need feedback on zero-knowledge circuit design.",
        meetingUrl: "https://meet.google.com/kx-mentor-session",
      });

      expect(created.status).toBe(BookingRequestStatus.PENDING);
      expect(created.meetingUrl).toContain("meet.google.com");
    });
  });

  describe("respondToBookingRequest", () => {
    it("updates status to ACCEPTED with mentor response note", async () => {
      vi.mocked(db.speakerBookingRequest.findUnique).mockResolvedValue({
        id: "b-1",
        speakerId: "sp-1",
        status: BookingRequestStatus.PENDING,
        speaker: {
          id: "sp-1",
          userId: "user-mentor",
        },
      } as never);

      vi.mocked(db.speakerBookingRequest.update).mockResolvedValue({
        id: "b-1",
        status: BookingRequestStatus.ACCEPTED,
        mentorNotes: "Looking forward to it!",
      } as never);

      const updated = await respondToBookingRequest({
        bookingId: "b-1",
        userId: "user-mentor",
        action: "ACCEPT",
        mentorNotes: "Looking forward to it!",
      });

      expect(updated.status).toBe(BookingRequestStatus.ACCEPTED);
      expect(updated.mentorNotes).toBe("Looking forward to it!");
    });
  });

  describe("completeBookingRequest & rating computation", () => {
    it("updates booking to COMPLETED, records rating, and recalculates mentor aggregate rating", async () => {
      const mockBooking = {
        id: "b-1",
        speakerId: "sp-1",
        requesterId: "user-builder",
        status: BookingRequestStatus.ACCEPTED,
      };

      vi.mocked(db.speakerBookingRequest.findUnique).mockResolvedValue(mockBooking as never);
      vi.mocked(db.speakerBookingRequest.update).mockResolvedValue({
        id: "b-1",
        status: BookingRequestStatus.COMPLETED,
        rating: 5,
        reviewNotes: "Incredible guidance!",
      } as never);

      // Past completed bookings for speaker
      vi.mocked(db.speakerBookingRequest.findMany).mockResolvedValue([
        { rating: 5 },
        { rating: 4 },
        { rating: 5 },
      ] as never);

      vi.mocked(db.speaker.update).mockResolvedValue({} as never);

      const completed = await completeBookingRequest({
        bookingId: "b-1",
        requesterId: "user-builder",
        rating: 5,
        feedback: "Incredible guidance!",
      });

      expect(completed.status).toBe(BookingRequestStatus.COMPLETED);
      expect(db.speaker.update).toHaveBeenCalledWith({
        where: { id: "sp-1" },
        data: {
          rating: 4.67,
          totalSessionsConducted: { increment: 1 },
        },
      });
    });
  });

  describe("updateSpeakerAvailability", () => {
    it("updates mentor availability status, weekly hours, and cadence", async () => {
      vi.mocked(db.speaker.findUnique).mockResolvedValue({
        id: "sp-1",
        userId: "user-mentor",
      } as never);

      vi.mocked(db.speaker.update).mockResolvedValue({
        id: "sp-1",
        availabilityStatus: SpeakerAvailabilityStatus.AVAILABLE,
        weeklyAvailabilityHours: 6,
        preferredCadence: "Weekends 2-6 PM IST",
      } as never);

      const updated = await updateSpeakerAvailability("sp-1", "user-mentor", {
        availabilityStatus: SpeakerAvailabilityStatus.AVAILABLE,
        weeklyAvailabilityHours: 6,
        preferredCadence: "Weekends 2-6 PM IST",
      });

      expect(updated.weeklyAvailabilityHours).toBe(6);
      expect(updated.availabilityStatus).toBe(SpeakerAvailabilityStatus.AVAILABLE);
    });
  });
});

describe("Partner Portal & Sponsor Telemetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.partner.findMany).mockResolvedValue([]);
  });

  describe("generatePartnerAccessCode", () => {
    it("generates a formatted KX-SPN-XXXXXX portal code", () => {
      const code1 = generatePartnerAccessCode();
      const code2 = generatePartnerAccessCode();

      expect(code1).toHaveLength(13);
      expect(code2).toHaveLength(13);
      expect(code1).toMatch(/^KX-SPN-[A-F0-9]{6}$/);
      expect(code1).not.toBe(code2);
    });
  });

  describe("getPartnerPortalData", () => {
    it("returns comprehensive sponsor analytics, reach telemetry, and deliverable progress", async () => {
      const mockPartner = {
        id: "pt-1",
        name: "DevRel Labs Global",
        slug: "devrel-labs",
        portalAccessCode: "DEVREL26",
        contactEmail: "partners@devrel.io",
        contactPerson: "Sarah Connor",
        logo: null,
        website: "https://devrel.io",
        category: "CLOUD_AI",
        deals: [
          {
            id: "deal-1",
            title: "Kailash Summer Summit 2026",
            tier: "TITLE",
            stage: "CLOSED_WON",
            amount: 500000,
            currency: "INR",
            notes: "Exclusive title sponsor",
            deliverables: [
              {
                id: "del-1",
                title: "Keynote Speaking Slot (20 mins)",
                status: DeliverableStatus.FULFILLED,
                proofUrl: "https://youtube.com/watch?v=mock-keynote",
              },
              {
                id: "del-2",
                title: "Branded Hackathon Prize Track ($5k)",
                status: DeliverableStatus.PENDING,
                proofUrl: null,
              },
            ],
            eventReports: [
              {
                id: "rep-1",
                title: "Summer Summit 2026 Post-Event Recap",
                executiveSummary: "Exceeded all developer engagement benchmarks.",
                totalAttendees: 1250,
                totalImpressions: 85000,
                boothFootfall: 420,
                trackParticipants: 180,
                clickThroughRate: 4.8,
                leadCapturesCount: 95,
                mediaGalleryUrls: [],
                recapDeckUrl: "https://kailshiansx.com/reports/summer2026.pdf",
                npsScore: 92,
                publishedAt: new Date(),
              },
            ],
            invoices: [
              {
                id: "inv-1",
                invoiceNumber: "INV-2026-001",
                totalAmount: 500000,
                status: "PAID",
                issueDate: new Date(),
                paidAt: new Date(),
                pdfUrl: null,
              },
            ],
            event: {
              id: "ev-1",
              title: "Kailash Summer Summit 2026",
              slug: "summer-summit-2026",
              startDate: new Date(),
              venue: "Convention Center",
              city: { name: "Jaipur" },
              coverImage: null,
              _count: { registrations: 1400 },
            },
          },
        ],
      };

      vi.mocked(db.partner.findFirst).mockResolvedValue(mockPartner as never);
      vi.mocked(db.partner.update).mockResolvedValue({} as never);

      const data = await getPartnerPortalData("DEVREL26");

      expect(data).not.toBeNull();
      if (!data) return;

      expect(data.partner.name).toBe("DevRel Labs Global");
      expect(data.aggregates.allDeliverablesCount).toBe(2);
      expect(data.aggregates.fulfilledDeliverablesCount).toBe(1);
      expect(data.aggregates.deliverableFulfillmentRate).toBe(50);
      expect(data.aggregates.totalAttendeesReached).toBe(1400);
      expect(data.aggregates.totalImpressions).toBe(85000);
      expect(data.deals).toHaveLength(1);
    });

    it("returns null if the access code is invalid", async () => {
      vi.mocked(db.partner.findFirst).mockResolvedValue(null);

      const data = await getPartnerPortalData("NONEXISTENT");
      expect(data).toBeNull();
    });
  });

  describe("updateDeliverableProof", () => {
    it("updates deliverable proof URL and marked status", async () => {
      vi.mocked(db.sponsorDeliverable.update).mockResolvedValue({
        id: "del-1",
        proofUrl: "https://cdn.kailshiansx.com/proof/banner.png",
        status: DeliverableStatus.FULFILLED,
      } as never);

      const updated = await updateDeliverableProof({
        deliverableId: "del-1",
        proofUrl: "https://cdn.kailshiansx.com/proof/banner.png",
        status: DeliverableStatus.FULFILLED,
      });

      expect(updated.status).toBe(DeliverableStatus.FULFILLED);
      expect(updated.proofUrl).toBe("https://cdn.kailshiansx.com/proof/banner.png");
    });
  });

  describe("publishSponsorEventReport", () => {
    it("creates post-event sponsor report with impressions and attendee metrics", async () => {
      vi.mocked(db.sponsorEventReport.create).mockResolvedValue({
        id: "rep-new",
        dealId: "deal-1",
        title: "Autumn Tech Conference Recap",
        totalAttendees: 800,
        totalImpressions: 50000,
      } as never);

      const report = await publishSponsorEventReport({
        partnerId: "pt-1",
        dealId: "deal-1",
        eventId: "ev-1",
        title: "Autumn Tech Conference Recap",
        executiveSummary: "High engagement with college developer chapters.",
        totalAttendees: 800,
        totalImpressions: 50000,
      });

      expect(report.id).toBe("rep-new");
      expect(report.totalAttendees).toBe(800);
      expect(report.totalImpressions).toBe(50000);
    });
  });
});
