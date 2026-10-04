import { describe, it, expect } from "vitest";
import { EmailTemplate } from "@prisma/client";
import { renderEmailTemplate } from "@/server/email/renderer";

describe("Email Renderer Services (Unit)", () => {
  it("should render RegistrationConfirmationEmail with ticket pass details", async () => {
    const { html, defaultSubject } = await renderEmailTemplate(
      EmailTemplate.REGISTRATION_CONFIRMATION,
      {
        name: "Aarav Saini",
        eventTitle: "KWS DevCon 2026",
        eventSlug: "kws-devcon-2026",
        eventDate: "2026-11-14T09:00:00Z",
        venue: "KWS Innovation Center, Bangalore",
        cityName: "Bangalore",
        ticketTierName: "VIP Pass",
        registrationCode: "KX-DEVC-0001",
      }
    );

    expect(defaultSubject).toContain("KX-DEVC-0001");
    expect(defaultSubject).toContain("KWS DevCon 2026");
    expect(html).toContain("Aarav Saini");
    expect(html).toContain("KX-DEVC-0001");
    expect(html).toContain("VIP Pass");
    expect(html).toContain("KWS Innovation Center, Bangalore");
  });

  it("should render ApplicationReceivedEmail with reference ID", async () => {
    const { html, defaultSubject } = await renderEmailTemplate(EmailTemplate.APPLICATION_RECEIVED, {
      name: "Sneha Patel",
      applicationType: "CAMPUS_LEAD",
      roleOrJurisdiction: "NIT Surat",
      referenceId: "APP-CL-9921",
    });

    expect(defaultSubject).toContain("APP-CL-9921");
    expect(defaultSubject).toContain("Campus Lead");
    expect(html).toContain("Sneha Patel");
    expect(html).toContain("NIT Surat");
  });

  it("should render PaymentFailedEmail with retry instructions", async () => {
    const { html, defaultSubject } = await renderEmailTemplate(EmailTemplate.PAYMENT_FAILED, {
      name: "Rohan Sharma",
      eventTitle: "Cloud Summit",
      eventSlug: "cloud-summit",
      amount: 99900,
      orderId: "order_failed_test_1",
    });

    expect(defaultSubject).toContain("Payment Incomplete");
    expect(html).toContain("999.00");
    expect(html).toContain("order_failed_test_1");
  });

  it("should render StatusChangeEmail with the updated stage", async () => {
    const { html, defaultSubject } = await renderEmailTemplate(EmailTemplate.STATUS_CHANGE, {
      name: "Karan Mehra",
      applicationType: "TEAM",
      roleOrJurisdiction: "Developer Relations Specialist",
      newStatus: "INTERVIEW",
      referenceId: "APP-TM-404",
      reviewNotes: "Your round 1 interview has been scheduled.",
    });

    expect(defaultSubject).toContain("INTERVIEW");
    expect(html).toContain("Interview Scheduled");
    expect(html).toContain("Your round 1 interview has been scheduled.");
  });
});
