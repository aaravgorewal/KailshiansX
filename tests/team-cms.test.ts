// tests/team-cms.test.ts
// Test suite for /join-team, /core-team, /founder, /who-we-are, and Admin CMS (, , , )

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TEAM_AREAS,
  TEAM_APPLICATION_STATUSES,
  CORE_TEAM_CATEGORIES,
} from "../src/lib/team-constants";
import {
  teamApplicationSchema,
  updateTeamApplicationStatusSchema,
} from "../src/lib/validations/team-application";
import {
  submitTeamApplication,
  getTeamApplications,
  updateTeamApplicationStatus,
} from "../src/server/applications/team";
import {
  getCoreTeamData,
  getFounderPageData,
  getWhoWeArePageData,
} from "../src/server/cms/content";
import { db } from "../src/lib/db";

describe("Team, Founder, Who We Are & Admin CMS (, , , )", () => {
  describe("Team Areas & Openings Definition", () => {
    it("should include all 11 role-wise openings requested", () => {
      const expected = [
        "Technology",
        "Events",
        "Operations",
        "Community",
        "Partnerships",
        "Sponsorship",
        "Marketing",
        "Design",
        "Content",
        "Social Media",
        "Developer Relations",
      ];

      for (const exp of expected) {
        assert.ok((TEAM_AREAS as readonly string[]).includes(exp), `Must include opening: ${exp}`);
      }
      assert.equal(TEAM_AREAS.length, 11);
    });

    it("should define the complete 5-stage status workflow", () => {
      const statuses = [...TEAM_APPLICATION_STATUSES];
      assert.deepEqual(statuses, ["NEW", "REVIEWING", "INTERVIEW", "SELECTED", "REJECTED"]);
    });

    it("should define all 7 core team categories", () => {
      const catKeys = CORE_TEAM_CATEGORIES.map((c) => c.key);
      assert.ok(catKeys.includes("leadership"));
      assert.ok(catKeys.includes("technology"));
      assert.ok(catKeys.includes("community"));
      assert.ok(catKeys.includes("events"));
      assert.ok(catKeys.includes("partnerships"));
      assert.ok(catKeys.includes("marketing"));
      assert.ok(catKeys.includes("operations"));
    });
  });

  describe("Team Application Validations", () => {
    it("should validate a complete and legitimate application payload", () => {
      const validPayload = {
        name: "Aarav Sharma",
        email: "aarav.test@example.com",
        phone: "+91 9876543210",
        area: "Technology",
        roleApplied: "Full-Stack Platform Engineer",
        linkedin: "https://linkedin.com/in/aaravsharma",
        portfolio: "https://aarav.dev",
        resumeUrl: "https://drive.google.com/resume.pdf",
        experience:
          "Passionate full-stack developer with 2 years of experience shipping Next.js and PostgreSQL systems.",
        motivation:
          "I want to help engineer resilient developer infrastructure and scale KailshiansX across regional cities.",
        honeypot: "",
      };

      const result = teamApplicationSchema.safeParse(validPayload);
      assert.ok(result.success, "Valid application should pass Zod schema");
    });

    it("should reject applications with bot honeypot populated", () => {
      const botPayload = {
        name: "Bot Applicant",
        email: "bot@spammer.org",
        phone: "+91 9876543210",
        area: "Technology",
        roleApplied: "Platform Engineer",
        experience: "Automated test script running in bot mode across multiple forums.",
        motivation: "Automated spam payload designed to exploit web forms without validation.",
        honeypot: "http://spam.ru",
      };

      const result = teamApplicationSchema.safeParse(botPayload);
      assert.equal(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues.some((i) => i.path.includes("honeypot")));
      }
    });

    it("should validate status update payload", () => {
      const updatePayload = {
        id: "cm1234567890",
        status: "INTERVIEW",
        adminNotes: "Strong candidate for Tech lead; interview set for Saturday.",
      };

      const result = updateTeamApplicationStatusSchema.safeParse(updatePayload);
      assert.ok(result.success);
    });
  });

  describe("Application Submission & Status Workflow Queries", () => {
    let createdAppId: string;
    const testEmail = `builder-${Date.now()}@example.com`;

    it("should submit a team application to the database", async () => {
      const res = await submitTeamApplication({
        name: "Kailshian Contributor",
        email: testEmail,
        phone: "+91 9123456789",
        area: "Technology",
        roleApplied: "Platform Engineer",
        experience:
          "Built high-concurrency event registration service and led university coding guild.",
        motivation:
          "To architect scalable community infrastructure for regional hackathons and mentor peers.",
        honeypot: "",
      });

      assert.ok(res.success);
      assert.ok(res.applicationId);
      createdAppId = res.applicationId;

      // Verify in DB
      const appInDb = await db.teamApplication.findUnique({
        where: { id: createdAppId },
      });
      assert.ok(appInDb);
      assert.equal(appInDb.status, "NEW");
      assert.equal(appInDb.area, "Technology");
    });

    it("should fetch applications with filtering options (internal test scope)", async () => {
      const all = await getTeamApplications({}, true);
      assert.ok(Array.isArray(all.applications));
      assert.ok(all.totalCount > 0);

      const techOnly = await getTeamApplications({ area: "Technology" }, true);
      assert.ok(Array.isArray(techOnly.applications));
      for (const app of techOnly.applications) {
        assert.equal(app.area, "Technology");
      }
    });

    it("should update application through workflow stages (NEW -> REVIEWING -> INTERVIEW -> SELECTED)", async () => {
      if (!createdAppId) return;

      // 1. Move to REVIEWING
      const res1 = await updateTeamApplicationStatus(
        {
          id: createdAppId,
          status: "REVIEWING",
          adminNotes: "Reviewing resume & GitHub commits",
        },
        true
      );
      assert.ok(res1.success);
      assert.equal(res1.application?.status, "REVIEWING");

      // 2. Move to INTERVIEW
      const res2 = await updateTeamApplicationStatus(
        {
          id: createdAppId,
          status: "INTERVIEW",
          adminNotes: "Tech round scheduled",
        },
        true
      );
      assert.ok(res2.success);
      assert.equal(res2.application?.status, "INTERVIEW");

      // 3. Move to SELECTED
      const res3 = await updateTeamApplicationStatus(
        {
          id: createdAppId,
          status: "SELECTED",
          adminNotes: "Accepted into Technology division!",
        },
        true
      );
      assert.ok(res3.success);
      assert.equal(res3.application?.status, "SELECTED");
    });

    // Clean up
    it("should clean up test application", async () => {
      if (createdAppId) {
        await db.teamApplication.delete({
          where: { id: createdAppId },
        });
      }
    });
  });

  describe("Core Team, Founder, and Who We Are Queries", () => {
    it("should fetch core team members", async () => {
      const members = await getCoreTeamData(true);
      assert.ok(Array.isArray(members));
      assert.ok(members.length > 0, "Should have seeded core team members");
    });

    it("should fetch founder page data with milestones", async () => {
      const founderData = await getFounderPageData();
      assert.ok(founderData.founderName);
      assert.ok(founderData.tagline);
      assert.ok(founderData.message);
      assert.ok(founderData.philosophy);
      assert.ok(Array.isArray(founderData.milestones));
      assert.ok(founderData.milestones.length >= 3);
    });

    it("should fetch who-we-are content with mission, vision, values, pillars, and KWS charter", async () => {
      const content = await getWhoWeArePageData();
      assert.ok(content.title);
      assert.ok(content.badge);
      assert.ok(content.initiativeNotice);
      assert.ok(content.initiativeNotice.includes("Kailshians Web Services"));
      assert.ok(content.mission);
      assert.ok(content.vision);
      assert.ok(Array.isArray(content.values));
      assert.ok(content.values.length >= 5);
      assert.ok(Array.isArray(content.pillars));
      assert.equal(content.pillars.length, 6);
    });
  });
});
