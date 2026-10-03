import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { db } from "../src/lib/db";
import { getWorkshops } from "../src/server/events/workshops";
import { getTechTalks, getTechTalkBySlug } from "../src/server/events/tech-talks";
import { submitHostWorkshop, submitCollegeWorkshopRequest } from "../src/server/workshops/actions";
import {
  hostWorkshopSchema,
  requestCollegeWorkshopSchema,
} from "../src/lib/validations/workshop-forms";

describe("Workshops & Tech Talks (PRD §6 & §7)", () => {
  describe("Workshops Queries & Category Filtering", () => {
    it("should fetch upcoming workshops successfully", async () => {
      const res = await getWorkshops({ tab: "upcoming" });
      assert.ok(Array.isArray(res.workshops));
      assert.ok(res.counts.total > 0);
      assert.ok(res.workshops.every((w) => w.type === "WORKSHOP"));
    });

    it("should fetch past workshops successfully", async () => {
      const res = await getWorkshops({ tab: "past" });
      assert.ok(Array.isArray(res.workshops));
      assert.ok(res.workshops.every((w) => w.type === "WORKSHOP"));
    });

    it("should filter workshops by technical category (e.g. MERN, AI, DevOps)", async () => {
      const mernRes = await getWorkshops({ category: "MERN" });
      assert.ok(Array.isArray(mernRes.workshops));
      assert.ok(
        mernRes.workshops.every(
          (w) =>
            w.category === "MERN" ||
            w.title.includes("MERN") ||
            (w.overview && w.overview.includes("MERN"))
        )
      );

      const aiRes = await getWorkshops({ category: "AI" });
      assert.ok(Array.isArray(aiRes.workshops));
      assert.ok(
        aiRes.workshops.every(
          (w) =>
            w.category === "AI" ||
            w.title.includes("AI") ||
            (w.overview && w.overview.includes("AI"))
        )
      );
    });
  });

  describe("Host a Workshop & College Request Pipeline Submissions", () => {
    it("should validate and submit 'Host a Workshop' proposal into CollaborationLead pipeline", async () => {
      const input = {
        name: "Devendra Singh",
        email: "devendra.test@kailshians.org",
        phone: "+919876543210",
        linkedin: "https://linkedin.com/in/devendra-test",
        github: "https://github.com/devendra-test",
        topic: "Advanced Kafka Stream Processing in Go",
        category: "Backend" as const,
        audienceLevel: "INTERMEDIATE" as const,
        format: "IN_PERSON" as const,
        expectedDuration: "Full Day (6 hours)",
        city: "Jaipur",
        curriculum:
          "Module 1: Kafka Cluster Setup; Module 2: Consumer Groups; Module 3: Exact-once Semantics; Module 4: Production Tuning.",
        experience: "Senior Backend Lead with 7 years experience at fintech unicorn.",
        honeypot: "",
      };

      // 1. Zod validation check
      const validation = hostWorkshopSchema.safeParse(input);
      assert.equal(validation.success, true);

      // 2. Action execution
      const res = await submitHostWorkshop(input);
      assert.equal(res.success, true);
      assert.ok(res.leadId);

      // 3. Verify lead entered database in CollaborationLead pipeline
      const lead = await db.collaborationLead.findUnique({
        where: { id: res.leadId },
      });
      assert.equal(lead?.type, "COMMUNITY");
      assert.equal(lead?.stage, "LEAD");
      assert.equal(lead?.contactPerson, "Devendra Singh");
      assert.match(lead?.proposedEvent || "", /Kafka Stream Processing/);

      // Cleanup
      await db.collaborationLead.delete({ where: { id: res.leadId } });
    });

    it("should reject bot submissions when honeypot is populated", async () => {
      const spamInput = {
        name: "Bot Spammer",
        email: "bot@spam.com",
        phone: "+919876543210",
        linkedin: "linkedin.com/in/spam",
        topic: "Spam Topic",
        category: "AI" as const,
        audienceLevel: "ALL_LEVELS" as const,
        format: "VIRTUAL" as const,
        expectedDuration: "2 hours",
        curriculum: "Spam curriculum outline that has at least thirty characters long.",
        experience: "Spam experience that is at least ten characters.",
        honeypot: "I am an automated bot",
      };

      const res = await submitHostWorkshop(spamInput);
      assert.equal(res.success, false);
      assert.match(res.error || "", /Spam/i);
    });

    it("should submit 'Request a Workshop at Your College' into CollaborationLead pipeline", async () => {
      const input = {
        collegeName: "NIT Kurukshetra",
        contactPerson: "Arnav Gupta",
        role: "President, Coding Society",
        email: "arnav@nitkkr.ac.in",
        phone: "+919988776655",
        city: "Kurukshetra",
        preferredCategory: "System Design" as const,
        expectedAttendance: "100-250" as const,
        preferredTimeline: "November 2026",
        facilities: "Main College Auditorium (350 seating), Wi-Fi, Projectors, Audio System",
        message: "Looking forward to hosting KailshiansX mentors for our annual technical fest.",
        honeypot: "",
      };

      const validation = requestCollegeWorkshopSchema.safeParse(input);
      assert.equal(validation.success, true);

      const res = await submitCollegeWorkshopRequest(input);
      assert.equal(res.success, true);
      assert.ok(res.leadId);

      const lead = await db.collaborationLead.findUnique({
        where: { id: res.leadId },
      });
      assert.equal(lead?.type, "COLLEGE");
      assert.equal(lead?.stage, "LEAD");
      assert.equal(lead?.organisation, "NIT Kurukshetra");
      assert.match(lead?.resourcesOffered || "", /Main College Auditorium/);

      // Cleanup
      await db.collaborationLead.delete({ where: { id: res.leadId } });
    });
  });

  describe("Tech Talks Postgres Full-Text Search & Post-Event Knowledge Archive", () => {
    it("should search tech talks using Postgres full-text search across topic and content", async () => {
      const res = await getTechTalks({ query: "PostgreSQL" });
      assert.ok(Array.isArray(res.talks));
      assert.ok(res.talks.length > 0, "Should match Postgres internals talk via full-text search");
      assert.match(res.talks[0].title, /PostgreSQL|Database/i);
    });

    it("should search tech talks by speaker name or institution via search query", async () => {
      const res = await getTechTalks({ query: "IIT Delhi" });
      assert.ok(Array.isArray(res.talks));
      assert.ok(res.talks.length > 0, "Should match talk hosted at IIT Delhi");
    });

    it("should search tech talks by technical keywords (e.g. Next.js, ZKP)", async () => {
      const res = await getTechTalks({ query: "Next.js" });
      assert.ok(Array.isArray(res.talks));
      assert.ok(res.talks.length > 0, "Should match Next.js talk");
    });

    it("should fetch complete talk detail page data including post-event knowledge resources", async () => {
      const data = await getTechTalkBySlug("techtalk-nextjs-internals");
      assert.ok(data);
      assert.ok(data?.talk);
      assert.equal(data?.talk.slug, "techtalk-nextjs-internals");

      // Verify post-event resources
      const resource = data?.talk.techTalkResource;
      assert.ok(resource, "Tech talk must have associated knowledge resource");
      assert.ok(resource?.slideUrl, "Must have slide deck URL");
      assert.ok(resource?.videoUrl, "Must have video recording URL");
      assert.ok(resource?.repoUrl, "Must have source code repository URL");
      assert.ok(Array.isArray(resource?.keyTakeaways), "Must have structured key takeaways array");
      assert.ok((resource?.keyTakeaways as string[]).length > 0);

      // Verify related talks
      assert.ok(Array.isArray(data?.relatedTalks));
    });
  });
});
