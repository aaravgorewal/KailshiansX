// tests/unit/passport.service.test.ts
// Unit tests for Member Profiles, Auto-linking, and Developer Passport progression engine.

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Prisma DB module
vi.mock("@/lib/db", () => {
  const mockDb = {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    registration: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    payment: {
      updateMany: vi.fn(),
    },
    certificate: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    teamApplication: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    campusLeadApplication: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    stateLeadApplication: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    campusLead: {
      findUnique: vi.fn(),
    },
    stateLead: {
      findUnique: vi.fn(),
    },
    speaker: {
      findFirst: vi.fn(),
    },
    coreTeamMember: {
      findFirst: vi.fn(),
    },
  };
  return { db: mockDb };
});

import { db } from "@/lib/db";
import { autoLinkUserRecords, ensureUserHasUsername } from "@/server/users/autolink";
import { getDeveloperPassportData } from "@/server/users/passport";

describe("Developer Passport & Auto-Link Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Auto-link Service (autolink.ts)", () => {
    it("should generate a clean username when user has none", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValueOnce(null); // no existing username
      vi.mocked(db.user.findUnique).mockResolvedValueOnce(null); // no conflict
      vi.mocked(db.user.update).mockResolvedValueOnce({
        id: "user_123",
        username: "aarav-saini",
      } as unknown as never);

      const username = await ensureUserHasUsername(
        "user_123",
        "Aarav Saini",
        "aarav@kailshiansx.com"
      );
      expect(username).toBe("aarav-saini");
      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: "user_123" },
        data: { username: "aarav-saini" },
      });
    });

    it("should link orphan registrations, payments, certificates, and applications by email", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({
        id: "user_123",
        username: "builder-123",
      } as unknown as never);

      vi.mocked(db.registration.findMany).mockResolvedValueOnce([
        { id: "reg_1" },
        { id: "reg_2" },
      ] as unknown as never);
      vi.mocked(db.registration.updateMany).mockResolvedValueOnce({ count: 2 });
      vi.mocked(db.payment.updateMany).mockResolvedValueOnce({ count: 1 });
      vi.mocked(db.certificate.updateMany).mockResolvedValueOnce({ count: 1 });
      vi.mocked(db.teamApplication.updateMany).mockResolvedValueOnce({ count: 1 });
      vi.mocked(db.campusLeadApplication.updateMany).mockResolvedValueOnce({ count: 0 });
      vi.mocked(db.stateLeadApplication.updateMany).mockResolvedValueOnce({ count: 0 });

      const result = await autoLinkUserRecords("user_123", "attendee@example.com");

      expect(result.registrationsLinked).toBe(2);
      expect(result.paymentsLinked).toBe(1);
      expect(result.certificatesLinked).toBe(1);
      expect(result.teamApplicationsLinked).toBe(1);
      expect(db.registration.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["reg_1", "reg_2"] } },
        data: { userId: "user_123" },
      });
    });
  });

  describe("Progression Engine & Badges (passport.ts)", () => {
    it("should compute Attendee progression when user has 1+ event registrations", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({
        id: "user_attendee",
        name: "Dev Attendee",
        username: "dev-attendee",
        email: "dev@kailshiansx.com",
        image: null,
        headline: null,
        bio: null,
        role: "MEMBER",
        github: null,
        linkedin: null,
        twitter: null,
        website: null,
        skills: ["TypeScript"],
        isPassportPublic: true,
        createdAt: new Date("2026-01-01"),
        registrations: [
          {
            id: "reg_1",
            registrationCode: "KX-PADH-0001",
            status: "CONFIRMED",
            createdAt: new Date("2026-02-01"),
            checkedInAt: new Date("2026-02-01"),
            ticketType: { name: "General Pass" },
            event: {
              id: "ev_1",
              title: "PadharoX 01",
              slug: "padharox-01",
              type: "MEETUP",
              category: "Cloud",
              city: { name: "Jaipur" },
              hackathonDetail: null,
              seriesEdition: null,
            },
          },
        ],
        certificates: [],
        campusLead: null,
        stateLead: null,
        teamApplications: [],
        campusLeadApplications: [],
        stateLeadApplications: [],
      } as unknown as never);

      vi.mocked(db.speaker.findFirst).mockResolvedValueOnce(null);
      vi.mocked(db.coreTeamMember.findFirst).mockResolvedValueOnce(null);

      const passport = await getDeveloperPassportData("user_attendee");
      expect(passport).not.toBeNull();
      expect(passport?.stats.eventsAttended).toBe(1);

      // Verify progression ladder: Attendee unlocked, others locked
      const attendeeStep = passport?.progression.find((p) => p.tier === "ATTENDEE");
      const leadStep = passport?.progression.find((p) => p.tier === "CAMPUS_LEAD");
      expect(attendeeStep?.unlocked).toBe(true);
      expect(leadStep?.unlocked).toBe(false);

      // Verify "First Step" badge is unlocked
      const firstStepBadge = passport?.badges.find((b) => b.id === "first-step");
      expect(firstStepBadge?.isUnlocked).toBe(true);

      // Verify timeline item created
      expect(passport?.timeline.length).toBe(1);
      expect(passport?.timeline[0].title).toBe("PadharoX 01");
    });

    it("should unlock Campus Lead tier for appointed campus leads", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({
        id: "user_lead",
        name: "Campus Lead User",
        username: "campus-lead",
        email: "lead@college.edu",
        image: null,
        headline: null,
        bio: null,
        role: "CAMPUS_LEAD",
        github: null,
        linkedin: null,
        twitter: null,
        website: null,
        skills: [],
        isPassportPublic: true,
        createdAt: new Date("2026-01-01"),
        registrations: [],
        certificates: [],
        campusLead: {
          id: "lead_1",
          startDate: new Date("2026-01-15"),
          college: { name: "BITS Pilani" },
          city: { name: "Pilani" },
        },
        stateLead: null,
        teamApplications: [],
        campusLeadApplications: [{ status: "SELECTED" }],
        stateLeadApplications: [],
      } as unknown as never);

      vi.mocked(db.speaker.findFirst).mockResolvedValueOnce(null);
      vi.mocked(db.coreTeamMember.findFirst).mockResolvedValueOnce(null);

      const passport = await getDeveloperPassportData("user_lead");
      expect(passport).not.toBeNull();
      expect(passport?.highestRank.tier).toBe("CAMPUS_LEAD");

      const leadStep = passport?.progression.find((p) => p.tier === "CAMPUS_LEAD");
      expect(leadStep?.unlocked).toBe(true);

      const campusBadge = passport?.badges.find((b) => b.id === "campus-pioneer");
      expect(campusBadge?.isUnlocked).toBe(true);
    });

    it("should unlock Organiser tier for Core Team members", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({
        id: "user_admin",
        name: "Admin User",
        username: "admin-user",
        email: "admin@kailshiansx.com",
        image: null,
        headline: null,
        bio: null,
        role: "ADMIN",
        github: null,
        linkedin: null,
        twitter: null,
        website: null,
        skills: [],
        isPassportPublic: true,
        createdAt: new Date("2026-01-01"),
        registrations: [],
        certificates: [],
        campusLead: null,
        stateLead: null,
        teamApplications: [],
        campusLeadApplications: [],
        stateLeadApplications: [],
      } as unknown as never);

      vi.mocked(db.speaker.findFirst).mockResolvedValueOnce(null);
      vi.mocked(db.coreTeamMember.findFirst).mockResolvedValueOnce({
        id: "core_1",
        joinedAt: new Date("2026-01-01"),
      } as unknown as never);

      const passport = await getDeveloperPassportData("user_admin");
      expect(passport).not.toBeNull();
      expect(passport?.highestRank.tier).toBe("ORGANISER");

      const organiserStep = passport?.progression.find((p) => p.tier === "ORGANISER");
      expect(organiserStep?.unlocked).toBe(true);

      const ecosystemBadge = passport?.badges.find((b) => b.id === "ecosystem-builder");
      expect(ecosystemBadge?.isUnlocked).toBe(true);
    });
  });
});
