// tests/unit/certificates.service.test.ts
// Unit tests for PRD §21: Certificate PDF generation, bulk issuance, delivery tracking, and verification.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateCertificatePdf } from "@/server/certificates/pdf";
import {
  generateUniqueCertificateId,
  getCertificateDeliveryStats,
  verifyCertificate,
  bulkGenerateCertificates,
} from "@/server/certificates/service";
import { db } from "@/lib/db";
import { EmailJobStatus } from "@prisma/client";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    registration: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    certificateTemplate: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    certificate: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    emailLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/server/email/queue", () => ({
  enqueueEmail: vi.fn().mockResolvedValue({
    id: "log_123",
    status: "SENT",
  }),
}));

describe("PRD §21: Certificate Generation & Verification Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Cryptographic PDF Engine (pdf.ts)", () => {
    it("should generate a valid PDF byte buffer with standard PDF headers", async () => {
      const pdfBytes = await generateCertificatePdf({
        recipientName: "Aarav Sharma",
        eventTitle: "NirmanX 2026 National Hackathon",
        uniqueId: "KX-CERT-TEST-1234",
        issueDate: new Date("2026-10-04"),
        verificationUrl: "https://kailshiansx.com/verify?id=KX-CERT-TEST-1234",
      });

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(1000);

      // Verify PDF magic header %PDF-
      const header = Buffer.from(pdfBytes.slice(0, 5)).toString("utf-8");
      expect(header).toBe("%PDF-");
    });

    it("should apply customized coordinate offsets and field styles", async () => {
      const pdfBytes = await generateCertificatePdf({
        recipientName: "Priya Patel",
        eventTitle: "System Design Bootcamp",
        uniqueId: "KX-CERT-CUSTOM-9999",
        template: {
          fields: {
            recipientName: { x: 50, y: 40, fontSize: 36, color: "#f59e0b", align: "center" },
            eventTitle: { x: 50, y: 55, fontSize: 24, color: "#38bdf8", align: "center" },
            issueDate: { x: 30, y: 70, fontSize: 12, color: "#94a3b8", align: "left" },
            qrCode: { x: 70, y: 70, size: 80, align: "center" },
            uniqueId: { x: 50, y: 90, fontSize: 10, color: "#ffffff", align: "center" },
          },
        },
      });

      expect(pdfBytes.length).toBeGreaterThan(1000);
      const header = Buffer.from(pdfBytes.slice(0, 5)).toString("utf-8");
      expect(header).toBe("%PDF-");
    });
  });

  describe("Unique ID Generator", () => {
    it("should generate structured unique ID with event slug prefix and random hex", () => {
      const id1 = generateUniqueCertificateId("nirmanx-01");
      const id2 = generateUniqueCertificateId("nirmanx-01");

      expect(id1).toMatch(/^KX-NIRM-[A-F0-9]{8}$/);
      expect(id2).toMatch(/^KX-NIRM-[A-F0-9]{8}$/);
      expect(id1).not.toBe(id2);
    });

    it("should fallback to KX-CERT prefix when event slug is omitted", () => {
      const id = generateUniqueCertificateId();
      expect(id).toMatch(/^KX-CERT-[A-F0-9]{8}$/);
    });
  });

  describe("Delivery Rate Analytics", () => {
    it("should compute accurate delivery rates and handle zero division", async () => {
      vi.mocked(db.certificate.count)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(85) // sent
        .mockResolvedValueOnce(10) // pending
        .mockResolvedValueOnce(5); // failed

      const stats = await getCertificateDeliveryStats("event_123");
      expect(stats.totalIssued).toBe(100);
      expect(stats.sentCount).toBe(85);
      expect(stats.pendingCount).toBe(10);
      expect(stats.failedCount).toBe(5);
      expect(stats.deliveryRate).toBe(85);
    });

    it("should return 0.0 delivery rate when no certificates have been issued", async () => {
      vi.mocked(db.certificate.count)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const stats = await getCertificateDeliveryStats();
      expect(stats.totalIssued).toBe(0);
      expect(stats.deliveryRate).toBe(0);
    });
  });

  describe("Public Verification Service (verifyCertificate)", () => {
    it("should resolve verified certificate by uniqueId", async () => {
      vi.mocked(db.certificate.findFirst).mockResolvedValueOnce({
        id: "cert_1",
        uniqueId: "KX-CERT-TEST-4321",
        participantName: "Aryan Sharma",
        participantEmail: "aryan@example.com",
        issuedAt: new Date("2026-10-04"),
        event: {
          id: "event_1",
          title: "RaibarX 01 Meetup",
          slug: "raibarx-01",
          type: "MEETUP",
          startDate: new Date("2026-10-04"),
          city: { name: "Dehradun" },
          venue: "Graphic Era University",
        },
        template: {
          id: "tmpl_1",
          name: "Standard",
          templateUrl: null,
          fields: {},
        },
        registration: {
          registrationCode: "KX-RB01-0001",
        },
        user: {
          id: "user_1",
          username: "aryan-dev",
          image: null,
        },
      } as unknown as never);

      const cert = await verifyCertificate("KX-CERT-TEST-4321");
      expect(cert).not.toBeNull();
      expect(cert?.verified).toBe(true);
      expect(cert?.participantName).toBe("Aryan Sharma");
      expect(cert?.event.title).toBe("RaibarX 01 Meetup");
      expect(cert?.registrationCode).toBe("KX-RB01-0001");
      expect(cert?.user?.username).toBe("aryan-dev");
    });

    it("should return null for non-existent or tampered IDs", async () => {
      vi.mocked(db.certificate.findFirst).mockResolvedValueOnce(null);
      const cert = await verifyCertificate("KX-CERT-INVALID-FAKE");
      expect(cert).toBeNull();
    });
  });

  describe("Bulk Generation & Auto-Linking", () => {
    it("should issue certificates and auto-link user and registration accounts", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({
        id: "event_100",
        title: "AI Workshop",
        slug: "ai-workshop",
        startDate: new Date("2026-10-04"),
      } as unknown as never);

      vi.mocked(db.certificateTemplate.findFirst).mockResolvedValueOnce({
        id: "tmpl_default",
        fields: {},
        templateUrl: "",
      } as unknown as never);

      // Participant lookup: no existing cert
      vi.mocked(db.certificate.findFirst).mockResolvedValueOnce(null);

      // User match found
      vi.mocked(db.user.findUnique).mockResolvedValueOnce({
        id: "user_matched",
      } as unknown as never);

      // Registration match found
      vi.mocked(db.registration.findFirst).mockResolvedValueOnce({
        id: "reg_matched",
      } as unknown as never);

      // Created certificate
      vi.mocked(db.certificate.create).mockResolvedValueOnce({
        id: "cert_new_1",
        uniqueId: "KX-AIWO-12345678",
        participantName: "Rohan Verma",
        participantEmail: "rohan@example.com",
        deliveryStatus: EmailJobStatus.PENDING,
        issuedAt: new Date("2026-10-04"),
      } as unknown as never);

      vi.mocked(db.certificate.update).mockResolvedValueOnce({
        id: "cert_new_1",
        deliveryStatus: EmailJobStatus.SENT,
      } as unknown as never);

      const result = await bulkGenerateCertificates({
        eventId: "event_100",
        participants: [{ name: "Rohan Verma", email: "rohan@example.com" }],
        sendEmailNow: true,
      });

      expect(result.createdCount).toBe(1);
      expect(result.emailsQueued).toBe(1);
      expect(db.certificate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          participantName: "Rohan Verma",
          participantEmail: "rohan@example.com",
          userId: "user_matched",
          registrationId: "reg_matched",
        }),
      });
    });
  });
});
