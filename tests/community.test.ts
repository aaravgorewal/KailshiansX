import test from "node:test";
import assert from "node:assert/strict";
import { db } from "../src/lib/db";
import {
  applyCampusLead,
  applyStateLead,
  submitStartChapterInquiry,
  submitMentorSpeakerInquiry,
} from "../src/server/community/actions";
import { getCommunityOverview } from "../src/server/community/queries";

test("Community, Campus Leads & State Leads (PRD §10, §11, §12)", async (t) => {
  const timestamp = Date.now();
  const testEmailCampus = `campus.test.${timestamp}@testcollege.edu`;
  const testEmailState = `state.test.${timestamp}@teststate.org`;

  await t.test("Campus Lead Application Validation & Submission (PRD §11)", async (t2) => {
    await t2.test("should reject bot submissions when honeypot is populated", async () => {
      const result = await applyCampusLead({
        name: "Bot Applicant",
        email: "bot@college.edu",
        phone: "+91 9999999999",
        college: "Bot Institute",
        city: "Bot City",
        courseYear: "B.Tech CSE - 1st Year",
        linkedin: "https://linkedin.com/in/bot",
        experience: "Building automated bots for testing platforms across web.",
        communityInvolvement: "Part of several automated bot societies and clubs.",
        whyKailshiansX: "Testing automated responses and honeypot spam protection.",
        availability: "5-10 hours/week",
        honeypot: "spam_detected",
      });

      assert.equal(result.success, false);
      assert.match(result.error ?? "", /Bot detected|Spam/i);
    });

    await t2.test(
      "should validate and persist valid Campus Lead application with APPLIED status",
      async () => {
        const result = await applyCampusLead({
          name: "Abhishek Joshi",
          email: testEmailCampus,
          phone: "+91 9876543210",
          college: "Govt Engineering College Pantnagar",
          city: "Pantnagar",
          courseYear: "B.Tech CSE - 3rd Year",
          linkedin: "https://linkedin.com/in/abhishek-joshi",
          experience:
            "Full stack engineering in Next.js, TypeScript, PostgreSQL and Docker with multiple hackathon projects.",
          communityInvolvement:
            "Co-lead of college Open Source Club with 120 members; organized Git workshops.",
          whyKailshiansX:
            "I want to connect Pantnagar students with national level hackathons like NirmanX.",
          availability: "10-15 hours/week",
          honeypot: "",
        });

        assert.equal(result.success, true);
        assert.ok(result.applicationId, "Expected applicationId to be returned");

        const savedApp = await db.campusLeadApplication.findUnique({
          where: { id: result.applicationId },
        });

        assert.ok(savedApp, "Application should exist in DB");
        assert.equal(savedApp?.email, testEmailCampus);
        assert.equal(savedApp?.college, "Govt Engineering College Pantnagar");
        assert.equal(savedApp?.status, "APPLIED");
      }
    );

    await t2.test("should prevent duplicate pending applications for same email", async () => {
      const duplicateResult = await applyCampusLead({
        name: "Abhishek Joshi Duplicate",
        email: testEmailCampus,
        phone: "+91 9876543210",
        college: "Govt Engineering College Pantnagar",
        city: "Pantnagar",
        courseYear: "B.Tech CSE - 3rd Year",
        linkedin: "https://linkedin.com/in/abhishek-joshi",
        experience: "Full stack engineering with multiple hackathon projects.",
        communityInvolvement: "Co-lead of college Open Source Club with 120 members.",
        whyKailshiansX: "Duplicate submission check.",
        availability: "10-15 hours/week",
        honeypot: "",
      });

      assert.equal(duplicateResult.success, false);
      assert.match(duplicateResult.error ?? "", /already under active review/i);
    });
  });

  await t.test("State Lead Application Validation & Submission (PRD §12)", async (t2) => {
    await t2.test("should reject bot submissions for State Lead", async () => {
      const result = await applyStateLead({
        name: "State Bot",
        email: "statebot@org.com",
        phone: "+91 9876543210",
        state: "Haryana",
        city: "Gurgaon",
        citiesCovered: "Gurgaon, Faridabad",
        currentRole: "Bot Manager",
        linkedin: "https://linkedin.com/in/statebot",
        experience: "Building automated bots for testing platforms across web.",
        leadershipEvidence: "Ran automated bot campaigns across several state platforms.",
        communityVision: "Expand bots to every server across the region.",
        whyKailshiansX: "Honeypot test.",
        availabilityHours: "8-12 hours/week",
        honeypot: "spam_bot_attack",
      });

      assert.equal(result.success, false);
      assert.match(result.error ?? "", /Bot detected|Spam/i);
    });

    await t2.test(
      "should validate and persist valid State Lead application with APPLIED status",
      async () => {
        const result = await applyStateLead({
          name: "Pooja Singhal",
          email: testEmailState,
          phone: "+91 9123456780",
          state: "Haryana",
          city: "Gurgaon",
          citiesCovered: "Gurgaon, Faridabad, Rohtak, Panipat",
          currentRole: "Lead Cloud Architect & Tech Community Organizer",
          linkedin: "https://linkedin.com/in/pooja-singhal",
          experience:
            "10+ years in distributed microservices, Kubernetes, and enterprise cloud architecture at leading tech firms.",
          leadershipEvidence:
            "Founder of NCR Cloud Native Meetup (2,200 active members); organized 6 regional tech conferences.",
          communityVision:
            "Connect corporate tech hubs in Cyber City with engineering colleges across Haryana to foster deep-tech builders.",
          whyKailshiansX:
            "KailshiansX has the authentic, builder-first DNA needed to empower grassroots developer communities.",
          availabilityHours: "8-12 hours/week",
          honeypot: "",
        });

        assert.equal(result.success, true);
        assert.ok(result.applicationId, "Expected applicationId to be returned");

        const savedApp = await db.stateLeadApplication.findUnique({
          where: { id: result.applicationId },
        });

        assert.ok(savedApp, "State Lead application should exist in DB");
        assert.equal(savedApp?.state, "Haryana");
        assert.equal(savedApp?.status, "APPLIED");
      }
    );
  });

  await t.test("Start a Chapter & Mentor/Speaker Inquiries (PRD §10)", async (t2) => {
    await t2.test(
      "should submit Start a Chapter into CollaborationLead pipeline with COLLEGE type",
      async () => {
        const result = await submitStartChapterInquiry({
          collegeName: "DIT University",
          city: "Dehradun",
          state: "Uttarakhand",
          applicantName: "Gaurav Bhatt",
          applicantRole: "President, Coding Club",
          email: `chapter.inquiry.${timestamp}@dit.edu`,
          phone: "+91 9988776655",
          estimatedStudents: "300-600 Students",
          message:
            "We have an active student developer club and would like to officially partner as a KailshiansX College Chapter.",
          honeypot: "",
        });

        assert.equal(result.success, true);
        assert.ok(result.applicationId);

        const lead = await db.collaborationLead.findUnique({
          where: { id: result.applicationId },
        });

        assert.ok(lead);
        assert.equal(lead?.type, "COLLEGE");
        assert.equal(lead?.stage, "LEAD");
        assert.match(lead?.resourcesOffered ?? "", /Estimated Student Audience: 300-600/);
      }
    );

    await t2.test(
      "should submit Mentor/Speaker into CollaborationLead pipeline with COMMUNITY type",
      async () => {
        const result = await submitMentorSpeakerInquiry({
          name: "Devendra Negi",
          email: `mentor.${timestamp}@gmail.com`,
          phone: "+91 9876543299",
          roleType: "BOTH",
          designation: "Staff SRE",
          organisation: "Postman",
          city: "Bengaluru",
          linkedin: "https://linkedin.com/in/devendra-negi",
          expertiseAreas: "OpenTelemetry, Rust, Distributed Observability",
          talkTopicsOrMentorshipFocus:
            "I would love to mentor student hackathon teams on building fault-tolerant backend architectures and present a Tech Talk on Distributed Tracing.",
          honeypot: "",
        });

        assert.equal(result.success, true);
        assert.ok(result.applicationId);

        const lead = await db.collaborationLead.findUnique({
          where: { id: result.applicationId },
        });

        assert.ok(lead);
        assert.equal(lead?.type, "COMMUNITY");
        assert.equal(lead?.contactPerson, "Devendra Negi");
        assert.match(lead?.resourcesOffered ?? "", /OpenTelemetry/);
      }
    );
  });

  await t.test("Community Overview Query & Hierarchy Directory (PRD §10)", async () => {
    const data = await getCommunityOverview();

    assert.ok(data.stats, "Expected stats object");
    assert.ok(data.stats.totalBuilders >= 1000, "Expected at least 1000 builders");
    assert.ok(data.stats.totalCities >= 4, "Expected multiple active cities");
    assert.ok(data.stats.totalCampusLeads >= 1, "Expected active campus leads");
    assert.ok(data.stats.totalStateLeads >= 1, "Expected active state leads");

    assert.ok(Array.isArray(data.stateLeads), "Expected stateLeads array");
    assert.ok(data.stateLeads.length > 0, "Expected at least one active state lead");
    assert.ok(
      data.stateLeads.some(
        (sl) => sl.state.includes("Uttarakhand") || sl.state.includes("Rajasthan")
      )
    );

    assert.ok(Array.isArray(data.campusLeads), "Expected campusLeads array");
    assert.ok(data.campusLeads.length > 0, "Expected at least one active campus lead");
    assert.ok(
      data.campusLeads.some(
        (cl) => cl.collegeName.includes("Graphic Era") || cl.collegeName.includes("MNIT")
      )
    );

    assert.ok(Array.isArray(data.cityHubs), "Expected cityHubs array");
  });

  // Cleanup test records
  await db.campusLeadApplication.deleteMany({
    where: { email: { in: [testEmailCampus, `chapter.inquiry.${timestamp}@dit.edu`] } },
  });
  await db.stateLeadApplication.deleteMany({
    where: { email: testEmailState },
  });
});
