// tests/email-system.test.ts
// Test suite for centralized email system: React Email templates, DB-backed job queue, and retries.

import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../src/lib/db";
import {
  renderEmailTemplate,
  enqueueEmail,
  processEmailQueue,
  retryEmailJob,
  getEmailLogStats,
  queueRegistrationConfirmationEmail,
  queuePaymentFailedEmail,
  queueRefundProcessedEmail,
  queueApplicationReceivedEmail,
  queueStatusChangeEmail,
  queueCollaborationAckEmail,
  queueEventReminderEmail,
} from "../src/server/email";
import { EmailJobStatus, EmailTemplate } from "@prisma/client";

describe("Centralized Email System with React Email & DB Queue", () => {
  const createdEmailLogIds: string[] = [];

  after(async () => {
    // Clean up created email logs
    if (createdEmailLogIds.length > 0) {
      await db.emailLog.deleteMany({
        where: { id: { in: createdEmailLogIds } },
      });
    }
  });

  describe("1. React Email Template Rendering", () => {
    it("should render registration confirmation template to valid HTML", async () => {
      const { html, defaultSubject } = await renderEmailTemplate(
        EmailTemplate.REGISTRATION_CONFIRMATION,
        {
          name: "Aarav Builder",
          eventTitle: "KailshiansX Summit 2026",
          eventSlug: "kailshiansx-summit-2026",
          eventDate: new Date("2026-11-15T10:00:00.000Z"),
          venue: "Tech Auditorium",
          cityName: "Bengaluru",
          ticketTierName: "VIP Pass",
          registrationCode: "KX-SUMMIT-0042",
          qrCodeDataUrl:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        }
      );

      assert.ok(html.includes("Aarav Builder"), "Includes recipient name");
      assert.ok(html.includes("KX-SUMMIT-0042"), "Includes registration pass code");
      assert.ok(html.includes("KailshiansX Summit 2026"), "Includes event title");
      assert.ok(html.includes("data:image/png;base64"), "Includes QR code image");
      assert.ok(defaultSubject.includes("KX-SUMMIT-0042"), "Subject contains pass code");
    });

    it("should render payment failed template to valid HTML", async () => {
      const { html, defaultSubject } = await renderEmailTemplate(EmailTemplate.PAYMENT_FAILED, {
        name: "Rohan Developer",
        eventTitle: "System Design Bootcamp",
        eventSlug: "system-design-bootcamp",
        amount: 149900,
        orderId: "order_KX_test_8877",
        failureReason: "Payment authorization timed out by issuing bank",
      });

      assert.ok(html.includes("Rohan Developer"), "Includes recipient name");
      assert.ok(html.includes("1,499.00"), "Includes formatted INR amount");
      assert.ok(html.includes("order_KX_test_8877"), "Includes order ID");
      assert.ok(html.includes("Payment authorization timed out"), "Includes failure reason");
      assert.ok(defaultSubject.includes("Action Required"), "Subject contains action required");
    });

    it("should render refund processed template to valid HTML", async () => {
      const { html, defaultSubject } = await renderEmailTemplate(EmailTemplate.REFUND_PROCESSED, {
        name: "Pooja Engineer",
        eventTitle: "AI Hackathon 2026",
        amount: 250000,
        refundId: "rfnd_KX_998877",
        paymentId: "pay_KX_3344",
        registrationCode: "KX-HACK-0101",
        reason: "Schedule conflict request",
      });

      assert.ok(html.includes("Pooja Engineer"), "Includes recipient name");
      assert.ok(html.includes("2,500.00"), "Includes formatted INR refund amount");
      assert.ok(html.includes("rfnd_KX_998877"), "Includes refund ID");
      assert.ok(html.includes("5–7 business days"), "Includes banking timeline");
      assert.ok(
        defaultSubject.includes("Refund Dispatched"),
        "Subject contains refund notification"
      );
    });

    it("should render application received template for all 3 categories", async () => {
      // 1. Campus Lead
      const campusRes = await renderEmailTemplate(EmailTemplate.APPLICATION_RECEIVED, {
        name: "Vikram Student",
        applicationType: "CAMPUS_LEAD",
        referenceId: "app_campus_123",
        roleOrJurisdiction: "IIT Delhi",
        city: "New Delhi",
      });
      assert.ok(campusRes.html.includes("IIT Delhi"), "Includes college name");
      assert.ok(campusRes.html.includes("app_campus_123"), "Includes reference ID");

      // 2. State Lead
      const stateRes = await renderEmailTemplate(EmailTemplate.APPLICATION_RECEIVED, {
        name: "Ananya Leader",
        applicationType: "STATE_LEAD",
        referenceId: "app_state_456",
        roleOrJurisdiction: "Karnataka",
        city: "Bengaluru",
      });
      assert.ok(stateRes.html.includes("Karnataka"), "Includes state name");

      // 3. Core Team
      const teamRes = await renderEmailTemplate(EmailTemplate.APPLICATION_RECEIVED, {
        name: "Dev Builder",
        applicationType: "TEAM",
        referenceId: "app_team_789",
        roleOrJurisdiction: "Fullstack Architecture (Technology)",
      });
      assert.ok(teamRes.html.includes("Technology"), "Includes role opening area");
    });

    it("should render status-change update template with stage guidance", async () => {
      const { html, defaultSubject } = await renderEmailTemplate(EmailTemplate.STATUS_CHANGE, {
        name: "Siddharth",
        applicationType: "CAMPUS_LEAD",
        referenceId: "app_campus_88",
        roleOrJurisdiction: "BITS Pilani (Pilani)",
        newStatus: "INTERVIEW",
        reviewNotes: "Strong open-source profile. Shortlisted for chapter interview.",
      });

      assert.ok(html.includes("Siddharth"), "Includes recipient name");
      assert.ok(
        html.includes("Interview Scheduled") || html.includes("INTERVIEW"),
        "Includes new status"
      );
      assert.ok(html.includes("BITS Pilani"), "Includes institution");
      assert.ok(html.includes("Strong open-source profile"), "Includes reviewer notes");
      assert.ok(defaultSubject.includes("INTERVIEW"), "Subject includes updated status");
    });

    it("should render collaboration acknowledgement template", async () => {
      const { html, defaultSubject } = await renderEmailTemplate(EmailTemplate.COLLABORATION_ACK, {
        name: "Dr. Sharma",
        organisation: "National Institute of Technology",
        type: "COLLEGE",
        referenceCode: "KX-COLLAB-NIT26",
        city: "Trichy",
        proposedScope: "2-Day Rust & WebAssembly Workshop",
        resourcesOffered: "Main campus auditorium with 300 capacity",
      });

      assert.ok(html.includes("National Institute of Technology"), "Includes organisation");
      assert.ok(html.includes("KX-COLLAB-NIT26"), "Includes reference code");
      assert.ok(html.includes("Rust") && html.includes("WebAssembly"), "Includes scope");
      assert.ok(
        defaultSubject.includes("National Institute of Technology"),
        "Subject contains org"
      );
    });

    it("should render 24-hour event reminder template", async () => {
      const { html, defaultSubject } = await renderEmailTemplate(EmailTemplate.EVENT_REMINDER_24H, {
        name: "Karan",
        eventTitle: "Microservices Masterclass",
        eventSlug: "microservices-masterclass",
        eventDate: new Date("2026-10-25T09:30:00.000Z"),
        venue: "Innovation Hub",
        venueAddress: "Plot 14, Electronic City",
        venueMapUrl: "https://maps.google.com/?q=innovation+hub",
        registrationCode: "KX-MICRO-9911",
        scheduleHighlights: [
          { time: "09:30 AM", title: "Registration & Breakfast" },
          { time: "10:30 AM", title: "Event Driven Architecture Deep Dive" },
        ],
      });

      assert.ok(html.includes("Karan"), "Includes attendee name");
      assert.ok(html.includes("Microservices Masterclass"), "Includes event title");
      assert.ok(html.includes("Plot 14, Electronic City"), "Includes venue address");
      assert.ok(html.includes("KX-MICRO-9911"), "Includes pass code");
      assert.ok(html.includes("Event Driven Architecture"), "Includes schedule highlight");
      assert.ok(defaultSubject.includes("KX-MICRO-9911"), "Subject contains pass code");
    });
  });

  describe("2. Database Job Queue & Dispatching", () => {
    it("should enqueue and immediately dispatch an email job", async () => {
      const job = await enqueueEmail({
        template: EmailTemplate.REGISTRATION_CONFIRMATION,
        recipient: "test-builder@kailshiansx.com",
        payload: {
          name: "Test Builder",
          eventTitle: "DevOps Days 2026",
          eventSlug: "devops-days-2026",
          eventDate: new Date("2026-11-20T10:00:00.000Z"),
          ticketTierName: "General Access",
          registrationCode: "KX-TEST-0001",
        },
        immediate: true,
      });

      createdEmailLogIds.push(job.id);

      assert.ok(job.id, "Generated job ID");
      assert.equal(job.recipient, "test-builder@kailshiansx.com");
      assert.equal(job.template, EmailTemplate.REGISTRATION_CONFIRMATION);
      // In mock mode (or with Resend configured), immediate dispatch completes
      assert.ok(
        job.status === EmailJobStatus.SENT || job.status === EmailJobStatus.PENDING,
        "Job status is valid"
      );
      assert.ok(job.html, "HTML was pre-rendered and saved");
    });

    it("should enqueue a scheduled email in PENDING state when date is in future", async () => {
      const futureDate = new Date(Date.now() + 86400000 * 2); // 2 days in future
      const job = await enqueueEmail({
        template: EmailTemplate.EVENT_REMINDER_24H,
        recipient: "future-attendee@kailshiansx.com",
        payload: {
          name: "Future Attendee",
          eventTitle: "Cloud Native Con",
          eventSlug: "cloud-native-con",
          eventDate: futureDate,
          registrationCode: "KX-FUTR-7777",
        },
        scheduledFor: futureDate,
        immediate: true, // Should not immediately dispatch because scheduledFor > now
      });

      createdEmailLogIds.push(job.id);

      assert.equal(
        job.status,
        EmailJobStatus.PENDING,
        "Job remains PENDING because it is in future"
      );
      assert.equal(job.attempts, 0, "Zero attempts so far");
    });

    it("should process the queue and dispatch overdue pending jobs", async () => {
      // Create a pending job scheduled with an oldest epoch timestamp so it guarantees precedence in sweep
      const pastDate = new Date(0);
      const pendingJob = await db.emailLog.create({
        data: {
          template: EmailTemplate.APPLICATION_RECEIVED,
          recipient: "sweep-applicant@kailshiansx.com",
          subject: "Application Received: Test",
          payload: {
            name: "Sweep Applicant",
            applicationType: "TEAM",
            referenceId: "app_sweep_1",
            roleOrJurisdiction: "Frontend (Technology)",
          },
          status: EmailJobStatus.PENDING,
          scheduledFor: pastDate,
          attempts: 0,
          maxAttempts: 3,
        },
      });

      createdEmailLogIds.push(pendingJob.id);

      // Run worker sweep
      const sweep = await processEmailQueue({ batchSize: 50 });
      assert.ok(sweep.processed >= 1, "Processed at least 1 job");

      const refreshed = await db.emailLog.findUnique({ where: { id: pendingJob.id } });
      assert.ok(refreshed, "Record exists");
      assert.equal(refreshed.status, EmailJobStatus.SENT, "Job transitioned to SENT");
      assert.ok(refreshed.sentAt, "Sent timestamp is recorded");
    });

    it("should handle manual retry from admin action", async () => {
      // Create a simulated failed job
      const failedJob = await db.emailLog.create({
        data: {
          template: EmailTemplate.PAYMENT_FAILED,
          recipient: "retry-target@kailshiansx.com",
          subject: "Action Required: Payment Issue",
          payload: {
            name: "Retry Target",
            eventTitle: "AI Summit",
            eventSlug: "ai-summit",
            amount: 99900,
            orderId: "order_retry_1",
          },
          status: EmailJobStatus.FAILED,
          attempts: 3,
          maxAttempts: 3,
          error: "Simulated network timeout",
        },
      });

      createdEmailLogIds.push(failedJob.id);

      // Trigger manual retry
      const retryResult = await retryEmailJob(failedJob.id);
      assert.equal(retryResult.success, true, "Retry succeeded");

      const rechecked = await db.emailLog.findUnique({ where: { id: failedJob.id } });
      assert.ok(rechecked, "Record exists");
      assert.equal(rechecked.status, EmailJobStatus.SENT, "Transitioned to SENT on retry");
      assert.equal(rechecked.error, null, "Error was cleared on successful retry");
    });

    it("should accurately compute stats for the admin email logs dashboard", async () => {
      const stats = await getEmailLogStats();
      assert.ok(typeof stats.total === "number", "Total is a number");
      assert.ok(typeof stats.sent === "number", "Sent is a number");
      assert.ok(typeof stats.failed === "number", "Failed is a number");
      assert.ok(typeof stats.pending === "number", "Pending is a number");
      assert.ok(typeof stats.deliveryRate === "number", "Delivery rate is a percentage number");
      assert.ok(stats.deliveryRate >= 0 && stats.deliveryRate <= 100, "Valid rate bounds");
    });
  });

  describe("3. High-Level Convenience Functions", () => {
    it("should queue all types without throwing errors", async () => {
      const p1 = await queueRegistrationConfirmationEmail("reg@test.com", {
        name: "User",
        eventTitle: "E1",
        eventSlug: "e1",
        eventDate: new Date(),
        ticketTierName: "Free",
        registrationCode: "KX-01",
      });
      createdEmailLogIds.push(p1.id);

      const p2 = await queuePaymentFailedEmail("pay@test.com", {
        name: "User",
        eventTitle: "E1",
        eventSlug: "e1",
        amount: 50000,
        orderId: "ord_1",
      });
      createdEmailLogIds.push(p2.id);

      const p3 = await queueRefundProcessedEmail("ref@test.com", {
        name: "User",
        eventTitle: "E1",
        amount: 50000,
        refundId: "rf_1",
      });
      createdEmailLogIds.push(p3.id);

      const p4 = await queueApplicationReceivedEmail("app@test.com", {
        name: "User",
        applicationType: "CAMPUS_LEAD",
        referenceId: "ref_1",
        roleOrJurisdiction: "College",
      });
      createdEmailLogIds.push(p4.id);

      const p5 = await queueStatusChangeEmail("status@test.com", {
        name: "User",
        applicationType: "TEAM",
        referenceId: "ref_1",
        roleOrJurisdiction: "Dev",
        newStatus: "SELECTED",
      });
      createdEmailLogIds.push(p5.id);

      const p6 = await queueCollaborationAckEmail("collab@test.com", {
        name: "User",
        organisation: "Org",
        type: "COMMUNITY",
        referenceCode: "KX-C1",
        city: "City",
        proposedScope: "Scope",
        resourcesOffered: "Resources",
      });
      createdEmailLogIds.push(p6.id);

      const p7 = await queueEventReminderEmail("rem@test.com", {
        name: "User",
        eventTitle: "E1",
        eventSlug: "e1",
        eventDate: new Date(),
        registrationCode: "KX-01",
      });
      createdEmailLogIds.push(p7.id);

      assert.equal(createdEmailLogIds.length >= 7, true);
    });
  });
});
