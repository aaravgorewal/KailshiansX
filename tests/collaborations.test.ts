import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../src/lib/db";
import {
  collegeCollaborationSchema,
  communityCollaborationSchema,
  venueCollaborationSchema,
  sponsorCollaborationSchema,
} from "../src/lib/validations/collaborations";
import {
  submitCollegeCollaboration,
  submitCommunityCollaboration,
  submitVenueCollaboration,
  submitSponsorCollaboration,
} from "../src/server/collaborations/actions";
import {
  sendCollaborationAcknowledgementEmail,
  sendCollaborationInternalNotificationEmail,
} from "../src/server/email/confirmation";

describe("Collaborations Funnel & Pipeline (PRD §13)", () => {
  const createdLeadIds: string[] = [];

  after(async () => {
    if (createdLeadIds.length > 0) {
      await db.collaborationLead.deleteMany({
        where: { id: { in: createdLeadIds } },
      });
    }
  });

  describe("Validation Schemas for All 4 Paths", () => {
    it("should validate a complete College Collaboration payload", () => {
      const validPayload = {
        organisation: "Graphic Era Hill University",
        contactPerson: "Dr. Arvind Kumar",
        roleDesignation: "Dean of Academics",
        email: "dean.academics@gehu.edu.in",
        phone: "+91 98765 43210",
        website: "https://gehu.ac.in",
        city: "Dehradun",
        state: "Uttarakhand",
        expectedStudentReach: "500-1000",
        proposedEvent:
          "National 24-hr Hackathon and Full-Stack Web Bootcamp for Engineering Students",
        resourcesOffered:
          "450-seat AC Auditorium, 2 Computer Labs with 120 systems, Wi-Fi LAN, Guest House",
        message: "We would like to host this during our annual tech fest in October.",
        honeypot: "",
      };

      const result = collegeCollaborationSchema.safeParse(validPayload);
      assert.equal(result.success, true);
    });

    it("should fail College schema when required fields are missing", () => {
      const invalidPayload = {
        organisation: "AB", // too short
        contactPerson: "",
        email: "not-an-email",
        phone: "123", // invalid phone
        city: "",
      };

      const result = collegeCollaborationSchema.safeParse(invalidPayload);
      assert.equal(result.success, false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        assert.ok(errors.organisation);
        assert.ok(errors.contactPerson);
        assert.ok(errors.email);
        assert.ok(errors.phone);
        assert.ok(errors.city);
      }
    });

    it("should validate a complete Community Partner payload", () => {
      const validPayload = {
        organisation: "Dehradun Developers Collective",
        contactPerson: "Aarav Sharma",
        email: "lead@dehradundevs.org",
        phone: "+91 98765 43211",
        website: "https://discord.gg/dehradundevs",
        city: "Dehradun",
        communitySize: "500-2000",
        techFocus: "AI & Machine Learning",
        proposedEvent:
          "Joint developer meetup featuring open-source AI models and system design workshops",
        resourcesOffered:
          "Member outreach across 1,400 devs on WhatsApp & Discord, 6 event day volunteers",
        message: "Excited to co-host the next RaibarX meetup!",
        honeypot: "",
      };

      const result = communityCollaborationSchema.safeParse(validPayload);
      assert.equal(result.success, true);
    });

    it("should validate a complete Venue Partner payload", () => {
      const validPayload = {
        organisation: "Innov8 Coworking Hub",
        contactPerson: "Neha Kapoor",
        email: "events@innov8hub.in",
        phone: "+91 98765 43212",
        website: "https://innov8.work",
        city: "Chandigarh",
        address: "Plot 12, Industrial Area Phase 1, Near Elante Mall",
        facilityType: "Coworking Space",
        seatingCapacity: "100-250",
        amenities: ["High-speed WiFi", "Projector & Screen", "AV & Mics", "Air Conditioning"],
        proposedEvent: "Weekend hackathons and monthly evening developer meetups",
        resourcesOffered:
          "Main event atrium free of charge on alternate Saturdays with projector & sound system",
        message: "Looking forward to hosting the developer community.",
        honeypot: "",
      };

      const result = venueCollaborationSchema.safeParse(validPayload);
      assert.equal(result.success, true);
    });

    it("should validate a complete Sponsor / Brand payload", () => {
      const validPayload = {
        organisation: "CloudScale Technologies",
        contactPerson: "Rohan Varma",
        roleDesignation: "Head of Developer Relations",
        email: "rohan@cloudscale.io",
        phone: "+91 98765 43213",
        website: "https://cloudscale.io",
        city: "Bengaluru",
        targetAudience: "Working Software Engineers & Tech Leads",
        sponsorshipScope: "Hackathon Track / Bounty Sponsor",
        budgetTier: "₹1,50,000 – ₹5,00,000",
        proposedEvent:
          "Sponsor ₹2,00,000 API bounty track at NirmanX hackathon and host a 45-minute keynote",
        resourcesOffered:
          "₹2,50,000 Cash Grant + $1000 Cloud API Credits for all participating teams + Mentors",
        message: "We want to hire backend engineers and promote our database API.",
        honeypot: "",
      };

      const result = sponsorCollaborationSchema.safeParse(validPayload);
      assert.equal(result.success, true);
    });
  });

  describe("Server Action Submissions & Pipeline Creation (PRD §13)", () => {
    it("should reject bot submissions when honeypot is populated", async () => {
      const botPayload = {
        organisation: "Bot Company",
        contactPerson: "Spam Bot",
        roleDesignation: "Bot",
        email: "spambot@spam.com",
        phone: "+91 98765 43210",
        city: "Nowhere",
        expectedStudentReach: "100-250",
        proposedEvent: "Buy spam products online cheap",
        resourcesOffered: "Nothing at all",
        honeypot: "I am a malicious bot",
      };

      const res = await submitCollegeCollaboration(botPayload);
      assert.equal(res.success, false);
      assert.match(res.error || "", /Bot detected/);
    });

    it("should submit College Collaboration, create CollaborationLead in NEW/LEAD pipeline, and generate ref code", async () => {
      const payload = {
        organisation: "IIT Roorkee Student Tech Council",
        contactPerson: "Aditya Verma",
        roleDesignation: "Technical Secretary",
        email: "aditya.verma@iitr.ac.in",
        phone: "+91 98765 43214",
        website: "https://iitr.ac.in",
        city: "Roorkee",
        state: "Uttarakhand",
        expectedStudentReach: "500-1000" as const,
        proposedEvent: "Annual Hackathon Track & Open-Source Cloud Workshop",
        resourcesOffered: "Mac Auditorium (600 seats), Central LAN, 15 Student Volunteers",
        message: "Looking forward to partnering for our annual symposium.",
        honeypot: "",
      };

      const res = await submitCollegeCollaboration(payload);
      assert.equal(res.success, true);
      assert.ok(res.leadId);
      assert.ok(res.referenceCode);
      assert.match(res.referenceCode || "", /^KX-COLLAB-/);

      createdLeadIds.push(res.leadId!);

      // Verify in DB
      const lead = await db.collaborationLead.findUnique({
        where: { id: res.leadId },
      });
      assert.ok(lead);
      assert.equal(lead.type, "COLLEGE");
      assert.equal(lead.stage, "LEAD"); // Initial stage in pipeline (NEW)
      assert.equal(lead.organisation, "IIT Roorkee Student Tech Council");
      assert.match(lead.contactPerson, /Aditya Verma/);
      assert.equal(lead.email, "aditya.verma@iitr.ac.in");
      assert.equal(lead.cityName, "Roorkee");
    });

    it("should submit Community Partner and create CollaborationLead", async () => {
      const payload = {
        organisation: "PyDelhi & Open Source Community",
        contactPerson: "Kavita Sengupta",
        email: "kavita@pydelhi.org",
        phone: "+91 98765 43215",
        website: "https://pydelhi.org",
        city: "Delhi",
        state: "Delhi",
        communitySize: "2000-5000" as const,
        techFocus: "Open Source" as const,
        proposedEvent: "Co-host Delhi edition of Python & DevOps Builder Meetup",
        resourcesOffered: "Community blast to 3,000 members and 4 industry speakers",
        message: "Can co-brand meetup under KailshiansX x PyDelhi banner.",
        honeypot: "",
      };

      const res = await submitCommunityCollaboration(payload);
      assert.equal(res.success, true);
      assert.ok(res.leadId);
      createdLeadIds.push(res.leadId!);

      const lead = await db.collaborationLead.findUnique({
        where: { id: res.leadId },
      });
      assert.ok(lead);
      assert.equal(lead.type, "COMMUNITY");
      assert.equal(lead.stage, "LEAD");
      assert.equal(lead.organisation, "PyDelhi & Open Source Community");
      assert.match(lead.proposedEvent || "", /Open Source/);
    });

    it("should submit Venue Partner and create CollaborationLead", async () => {
      const payload = {
        organisation: "WeWork DLF Forum",
        contactPerson: "Suresh Menon",
        email: "suresh.menon@wework.com",
        phone: "+91 98765 43216",
        website: "https://wework.com",
        city: "Gurgaon",
        address: "DLF Cyber City, Phase 3, Gurgaon",
        facilityType: "Coworking Space" as const,
        seatingCapacity: "100-250" as const,
        amenities: ["High-speed WiFi", "Projector & Screen", "AV & Mics", "Air Conditioning"],
        proposedEvent: "Monthly weekend tech meetups and founder roundtables",
        resourcesOffered:
          "Atrium seating for 120 guests on Saturdays, AV setup, and coffee lounge access",
        message: "Excited to support regional builders.",
        honeypot: "",
      };

      const res = await submitVenueCollaboration(payload);
      assert.equal(res.success, true);
      assert.ok(res.leadId);
      createdLeadIds.push(res.leadId!);

      const lead = await db.collaborationLead.findUnique({
        where: { id: res.leadId },
      });
      assert.ok(lead);
      assert.equal(lead.type, "VENUE");
      assert.equal(lead.stage, "LEAD");
      assert.match(lead.resourcesOffered || "", /High-speed WiFi/);
    });

    it("should submit Sponsor / Brand and create CollaborationLead", async () => {
      const payload = {
        organisation: "Neon Database",
        contactPerson: "Daniel Peters",
        roleDesignation: "Director of Developer Ecosystem",
        email: "daniel@neon.tech",
        phone: "+91 98765 43217",
        website: "https://neon.tech",
        city: "San Francisco",
        targetAudience: "Broad Developer Ecosystem" as const,
        sponsorshipScope: "Hackathon Title Sponsor" as const,
        budgetTier: "₹5,00,000+" as const,
        proposedEvent: "Title sponsor of NirmanX Hackathon with serverless Postgres track",
        resourcesOffered:
          "₹5,00,000 Title Grant, unlimited Postgres branching credits, 3 virtual engineering judges",
        message: "We want to empower Indian builders building AI apps.",
        honeypot: "",
      };

      const res = await submitSponsorCollaboration(payload);
      assert.equal(res.success, true);
      assert.ok(res.leadId);
      createdLeadIds.push(res.leadId!);

      const lead = await db.collaborationLead.findUnique({
        where: { id: res.leadId },
      });
      assert.ok(lead);
      assert.equal(lead.type, "SPONSOR");
      assert.equal(lead.stage, "LEAD");
      assert.equal(lead.organisation, "Neon Database");
      assert.match(lead.proposedEvent || "", /Hackathon Title Sponsor/);
    });
  });

  describe("Email Auto-Acknowledgement & Team Notification (PRD §13)", () => {
    it("should dispatch auto-acknowledgement email without error", async () => {
      const res = await sendCollaborationAcknowledgementEmail({
        email: "test.submitter@company.com",
        name: "Test Submitter",
        organisation: "Acme Cloud",
        type: "SPONSOR",
        leadId: "lead_test_123456",
        city: "Bengaluru",
        proposedEvent: "Title Sponsor of Hackathon",
        resourcesOffered: "Cash grant and cloud credits",
      });

      assert.equal(res.success, true);
      assert.ok(res.id);
    });

    it("should dispatch internal team alert email without error", async () => {
      const res = await sendCollaborationInternalNotificationEmail({
        email: "test.submitter@company.com",
        name: "Test Submitter (VP Tech)",
        organisation: "Acme Cloud",
        type: "SPONSOR",
        leadId: "lead_test_123456",
        city: "Bengaluru",
        phone: "+91 98765 43210",
        website: "https://acme.com",
        proposedEvent: "Title Sponsor of Hackathon",
        resourcesOffered: "Cash grant and cloud credits",
        message: "High-priority sponsor inquiry.",
      });

      assert.equal(res.success, true);
      assert.ok(res.id);
    });
  });
});
