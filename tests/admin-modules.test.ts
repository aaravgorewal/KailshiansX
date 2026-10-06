// tests/admin-modules.test.ts
// Test suite for Admin Control Room: Events, Pipelines, Data Mutations, and Audit Logs

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../src/lib/db";
import { writeAudit } from "../src/server/auth/audit";
import {
  EventType,
  EventStatus,
  AttendanceMode,
  CampusLeadStatus,
  StateLeadStatus,
  CollaborationStage,
  CollaborationType,
  SeriesKind,
} from "@prisma/client";

describe("Admin Control Room & Modules ()", () => {
  let testEventId: string;
  let testCityId: string;
  let testPartnerId: string;
  let testSeriesId: string;
  let testLeadId: string;

  before(async () => {
    // Ensure test city exists
    const city = await db.city.upsert({
      where: { name: "AdminTestCity" },
      update: {},
      create: { name: "AdminTestCity", state: "Rajasthan" },
    });
    testCityId = city.id;
  });

  after(async () => {
    // Cleanup
    if (testEventId) {
      await db.eventScheduleItem.deleteMany({ where: { eventId: testEventId } });
      await db.ticketType.deleteMany({ where: { eventId: testEventId } });
      await db.event.delete({ where: { id: testEventId } }).catch(() => {});
    }
    if (testPartnerId) {
      await db.partner.delete({ where: { id: testPartnerId } }).catch(() => {});
    }
    if (testSeriesId) {
      await db.series.delete({ where: { id: testSeriesId } }).catch(() => {});
    }
    if (testLeadId) {
      await db.collaborationLead.delete({ where: { id: testLeadId } }).catch(() => {});
    }
    await db.city.delete({ where: { id: testCityId } }).catch(() => {});
  });

  describe("Event Lifecycle & No-Code Sub-resources", () => {
    it("should create an event with schedule, tracks, and tickets", async () => {
      const slug = `admin-test-event-${Date.now()}`;
      const event = await db.$transaction(async (tx) => {
        const created = await tx.event.create({
          data: {
            title: "Admin Test Hackathon",
            slug,
            type: EventType.HACKATHON,
            status: EventStatus.DRAFT,
            category: "System Design",
            cityId: testCityId,
            attendanceMode: AttendanceMode.IN_PERSON,
            startDate: new Date(),
            maxCapacity: 100,
          },
        });

        await tx.ticketType.create({
          data: {
            eventId: created.id,
            name: "Free Pass",
            price: 0,
            quota: 50,
            isFree: true,
          },
        });

        await tx.eventScheduleItem.create({
          data: {
            eventId: created.id,
            title: "Opening Ceremony",
            startTime: new Date(),
            sortOrder: 0,
          },
        });

        return created;
      });

      testEventId = event.id;
      assert.ok(testEventId);

      const found = await db.event.findUnique({
        where: { id: testEventId },
        include: { ticketTypes: true, scheduleItems: true },
      });

      assert.equal(found?.status, EventStatus.DRAFT);
      assert.equal(found?.ticketTypes.length, 1);
      assert.equal(found?.scheduleItems.length, 1);
    });

    it("should toggle publish status between DRAFT and PUBLISHED", async () => {
      const updated = await db.event.update({
        where: { id: testEventId },
        data: { status: EventStatus.PUBLISHED },
      });
      assert.equal(updated.status, EventStatus.PUBLISHED);

      const reverted = await db.event.update({
        where: { id: testEventId },
        data: { status: EventStatus.DRAFT },
      });
      assert.equal(reverted.status, EventStatus.DRAFT);
    });

    it("should duplicate an event with unique slug and DRAFT status", async () => {
      const src = await db.event.findUniqueOrThrow({
        where: { id: testEventId },
        include: { ticketTypes: true, scheduleItems: true },
      });

      const copySlug = `${src.slug}-copy-test`;
      const copy = await db.event.create({
        data: {
          title: `${src.title} (Copy)`,
          slug: copySlug,
          type: src.type,
          status: EventStatus.DRAFT,
          startDate: src.startDate,
          cityId: src.cityId,
        },
      });

      assert.ok(copy.id);
      assert.equal(copy.title, "Admin Test Hackathon (Copy)");
      assert.equal(copy.status, EventStatus.DRAFT);

      // Clean up copy
      await db.event.delete({ where: { id: copy.id } });
    });
  });

  describe("Pipeline Status Transitions & Kanban Stages", () => {
    it("should transition Campus Lead through workflow stages", async () => {
      const app = await db.campusLeadApplication.create({
        data: {
          name: "Test Campus Leader",
          email: `campus-${Date.now()}@test.edu`,
          college: "IIT Test",
          status: CampusLeadStatus.APPLIED,
        },
      });

      const screened = await db.campusLeadApplication.update({
        where: { id: app.id },
        data: { status: CampusLeadStatus.SCREENING },
      });
      assert.equal(screened.status, CampusLeadStatus.SCREENING);

      const active = await db.campusLeadApplication.update({
        where: { id: app.id },
        data: { status: CampusLeadStatus.ACTIVE },
      });
      assert.equal(active.status, CampusLeadStatus.ACTIVE);

      await db.campusLeadApplication.delete({ where: { id: app.id } });
    });

    it("should transition State Lead through workflow stages", async () => {
      const app = await db.stateLeadApplication.create({
        data: {
          name: "Test State Leader",
          email: `state-${Date.now()}@test.org`,
          state: "Punjab",
          status: StateLeadStatus.APPLIED,
        },
      });

      const interview = await db.stateLeadApplication.update({
        where: { id: app.id },
        data: { status: StateLeadStatus.INTERVIEW },
      });
      assert.equal(interview.status, StateLeadStatus.INTERVIEW);

      await db.stateLeadApplication.delete({ where: { id: app.id } });
    });

    it("should create and advance a Collaboration Lead through pipeline stages", async () => {
      const lead = await db.collaborationLead.create({
        data: {
          type: CollaborationType.COLLEGE,
          stage: CollaborationStage.NEW,
          organisation: "NIT Test Community",
          contactPerson: "Prof. Sharma",
          email: `collab-${Date.now()}@nit.edu`,
        },
      });
      testLeadId = lead.id;

      const confirmed = await db.collaborationLead.update({
        where: { id: lead.id },
        data: { stage: CollaborationStage.CONFIRMED },
      });
      assert.equal(confirmed.stage, CollaborationStage.CONFIRMED);
    });
  });

  describe("Sponsors & Series Global Catalog", () => {
    it("should create a global partner record", async () => {
      const partner = await db.partner.create({
        data: {
          name: "Admin Sponsor Test",
          slug: `admin-sponsor-${Date.now()}`,
          category: "brand",
          website: "https://admintest.com",
        },
      });
      testPartnerId = partner.id;

      assert.ok(partner.id);
      assert.equal(partner.name, "Admin Sponsor Test");
    });

    it("should create a series record", async () => {
      const series = await db.series.create({
        data: {
          name: "Admin Series Test",
          slug: `admin-series-${Date.now()}`,
          kind: SeriesKind.MEETUP,
          tagline: "Testing meetup series",
        },
      });
      testSeriesId = series.id;

      assert.ok(series.id);
      assert.equal(series.kind, SeriesKind.MEETUP);
    });
  });

  describe("Audit Trail Logging", () => {
    it("should record an immutable AuditLog entry without errors", async () => {
      await writeAudit({
        action: "CREATE",
        entityType: "AdminTestEntity",
        entityId: "test-id-123",
        after: { test: true, role: "ADMIN" },
      });

      const log = await db.auditLog.findFirst({
        where: { entityType: "AdminTestEntity", entityId: "test-id-123" },
      });

      assert.ok(log);
      assert.equal(log?.action, "CREATE");

      // Cleanup
      await db.auditLog.delete({ where: { id: log.id } });
    });
  });
});
