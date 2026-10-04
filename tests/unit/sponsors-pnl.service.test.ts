// tests/unit/sponsors-pnl.service.test.ts
// Unit tests for Sponsor CRM and Event P&L per PRD §23:
// 1. Sponsor CRM: Deals, Deliverables, Invoices, Auto-syncing paid invoices to event revenue.
// 2. Event P&L: Ticket auto-sync, Revenue vs 9 Expense categories, Net Profit/Loss, Margin %, Series rollup, CSV & PDF export.

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSponsorCRMOverview,
  createOrUpdateInvoice,
  generateInvoiceNumber,
} from "@/server/sponsors/service";
import {
  syncTicketRevenue,
  getEventPnL,
  getSeriesPnL,
  generatePnLReportCsv,
  generatePnLReportPdf,
} from "@/server/pnl/service";
import { db } from "@/lib/db";
import {
  SponsorDealStage,
  DeliverableStatus,
  InvoiceStatus,
  RevenueCategory,
  ExpenseCategory,
  Prisma,
} from "@prisma/client";

vi.mock("@/lib/db", () => ({
  db: {
    partner: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    sponsorDeal: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    sponsorDeliverable: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    sponsorInvoice: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    eventPartner: {
      upsert: vi.fn(),
    },
    event: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    series: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    payment: {
      findMany: vi.fn(),
    },
    registration: {
      findMany: vi.fn(),
    },
    eventRevenueItem: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    eventExpenseItem: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("PRD §22 & §23: Sponsor CRM & Event P&L Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Sponsor CRM Service (sponsors/service.ts)", () => {
    it("should generate sequential invoice number with current year", async () => {
      vi.mocked(db.sponsorInvoice.count).mockResolvedValueOnce(5);
      const invNum = await generateInvoiceNumber();
      const currentYear = new Date().getFullYear();
      expect(invNum).toBe(`KX-INV-${currentYear}-0006`);
    });

    it("should calculate CRM pipeline overview metrics correctly", async () => {
      vi.mocked(db.sponsorDeal.findMany).mockResolvedValueOnce([
        { stage: SponsorDealStage.PROSPECT, amount: new Prisma.Decimal(50000) },
        { stage: SponsorDealStage.NEGOTIATION, amount: new Prisma.Decimal(100000) },
        { stage: SponsorDealStage.WON, amount: new Prisma.Decimal(200000) },
      ] as unknown as never);

      vi.mocked(db.sponsorDeliverable.findMany).mockResolvedValueOnce([
        { status: DeliverableStatus.PENDING },
        { status: DeliverableStatus.FULFILLED },
        { status: DeliverableStatus.FULFILLED },
      ] as unknown as never);

      vi.mocked(db.sponsorInvoice.findMany).mockResolvedValueOnce([
        { status: InvoiceStatus.PAID, totalAmount: new Prisma.Decimal(236000) },
        { status: InvoiceStatus.SENT, totalAmount: new Prisma.Decimal(118000) },
      ] as unknown as never);

      const overview = await getSponsorCRMOverview();
      expect(overview.totalPipelineValue).toBe(350000);
      expect(overview.wonValue).toBe(200000);
      expect(overview.totalDeals).toBe(3);
      expect(overview.deliverablesStats.fulfilled).toBe(2);
      expect(overview.deliverablesStats.pending).toBe(1);
      expect(overview.invoiceStats.paidAmount).toBe(236000);
      expect(overview.invoiceStats.unpaidAmount).toBe(118000);
    });

    it("should auto-sync paid invoice to EventRevenueItem when invoice is marked PAID", async () => {
      const mockInvoice = {
        id: "inv_123",
        invoiceNumber: "KX-INV-2026-0001",
        dealId: "deal_1",
        eventId: "event_1",
        amount: new Prisma.Decimal(100000),
        taxAmount: new Prisma.Decimal(18000),
        totalAmount: new Prisma.Decimal(118000),
        status: InvoiceStatus.PAID,
        paidAt: new Date("2026-10-04"),
        transactionRef: "UTR987654321",
        paymentMethod: "NEFT",
        deal: {
          sponsor: { name: "Cloudflare" },
        },
        event: { title: "PadharoX 01" },
      };

      vi.mocked(db.sponsorInvoice.create).mockResolvedValueOnce(mockInvoice as unknown as never);
      vi.mocked(db.eventRevenueItem.findFirst).mockResolvedValueOnce(null);
      vi.mocked(db.eventRevenueItem.create).mockResolvedValueOnce({
        id: "rev_1",
      } as unknown as never);

      await createOrUpdateInvoice({
        dealId: "deal_1",
        eventId: "event_1",
        amount: 100000,
        taxAmount: 18000,
        status: InvoiceStatus.PAID,
        transactionRef: "UTR987654321",
        paymentMethod: "NEFT",
      });

      expect(db.eventRevenueItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventId: "event_1",
            category: RevenueCategory.SPONSORSHIP,
            source: "KX-INV-2026-0001",
            isAutoSynced: true,
          }),
        })
      );
    });
  });

  describe("Event P&L Calculation Engine (pnl/service.ts)", () => {
    it("should auto-sync captured ticket payments into ticket revenue", async () => {
      vi.mocked(db.payment.findMany).mockResolvedValueOnce([
        { amount: new Prisma.Decimal(999), refundAmount: null },
        { amount: new Prisma.Decimal(1499), refundAmount: new Prisma.Decimal(200) },
      ] as unknown as never);

      vi.mocked(db.eventRevenueItem.findFirst).mockResolvedValueOnce(null);
      vi.mocked(db.eventRevenueItem.create).mockResolvedValueOnce({
        id: "rev_ticket",
      } as unknown as never);

      const netTicket = await syncTicketRevenue("event_1");
      // 999 + (1499 - 200) = 999 + 1299 = 2298
      expect(netTicket).toBe(2298);

      expect(db.eventRevenueItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventId: "event_1",
            category: RevenueCategory.TICKET,
            source: "AUTO_SYNC_TICKETS",
            isAutoSynced: true,
            amount: new Prisma.Decimal(2298),
          }),
        })
      );
    });

    it("should accurately compute Total Revenue, Total Expense, Net Profit, and Profit Margin", async () => {
      // Mock event with series edition, revenue items, and expense items
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({
        id: "event_padharo",
        title: "PadharoX 01",
        slug: "padharox-01",
        type: "HACKATHON",
        startDate: new Date("2026-10-15"),
        seriesEdition: {
          seriesId: "series_padharo",
          editionNo: 1,
          series: { name: "PadharoX" },
        },
        expenseItems: [
          {
            id: "exp_1",
            category: ExpenseCategory.VENUE,
            description: "Auditorium Rental",
            amount: new Prisma.Decimal(20000),
            payee: "University",
            paidAt: new Date("2026-10-01"),
          },
          {
            id: "exp_2",
            category: ExpenseCategory.FOOD,
            description: "Hackathon Catering",
            amount: new Prisma.Decimal(15000),
            payee: "Cafeteria",
            paidAt: new Date("2026-10-02"),
          },
          {
            id: "exp_3",
            category: ExpenseCategory.SWAG,
            description: "Hoodies & Badges",
            amount: new Prisma.Decimal(10000),
            payee: "Print Lab",
            paidAt: new Date("2026-10-03"),
          },
        ],
      } as unknown as never);

      // Mock syncTicketRevenue
      vi.mocked(db.payment.findMany).mockResolvedValueOnce([]);
      vi.mocked(db.registration.findMany).mockResolvedValueOnce([]);
      vi.mocked(db.eventRevenueItem.findFirst).mockResolvedValueOnce(null);

      // Mock revenue records: Ticket 30000, Sponsorship 50000, Other 5000 = Total 85000
      vi.mocked(db.eventRevenueItem.findMany).mockResolvedValueOnce([
        {
          id: "r1",
          category: RevenueCategory.TICKET,
          description: "Ticket Sales",
          amount: new Prisma.Decimal(30000),
          isAutoSynced: true,
          source: "AUTO_SYNC_TICKETS",
        },
        {
          id: "r2",
          category: RevenueCategory.SPONSORSHIP,
          description: "Title Sponsorship",
          amount: new Prisma.Decimal(50000),
          isAutoSynced: false,
          source: "Cloudflare",
        },
        {
          id: "r3",
          category: RevenueCategory.OTHER,
          description: "Merch Sales",
          amount: new Prisma.Decimal(5000),
          isAutoSynced: false,
          source: "Booth",
        },
      ] as unknown as never);

      const pnl = await getEventPnL("event_padharo", true);
      expect(pnl).toBeTruthy();

      // Total Revenue: 30000 + 50000 + 5000 = 85000
      expect(pnl!.revenue.totalRevenue).toBe(85000);
      expect(pnl!.revenue.ticketRevenue).toBe(30000);
      expect(pnl!.revenue.sponsorshipRevenue).toBe(50000);
      expect(pnl!.revenue.otherRevenue).toBe(5000);

      // Total Expenses: 20000 + 15000 + 10000 = 45000
      expect(pnl!.expenses.totalExpense).toBe(45000);
      expect(pnl!.expenses.categoryBreakdown.VENUE).toBe(20000);
      expect(pnl!.expenses.categoryBreakdown.FOOD).toBe(15000);
      expect(pnl!.expenses.categoryBreakdown.SWAG).toBe(10000);

      // Net Profit: 85000 - 45000 = 40000
      expect(pnl!.metrics.netProfitLoss).toBe(40000);
      expect(pnl!.metrics.isProfitable).toBe(true);

      // Profit Margin: (40000 / 85000) * 100 = 47.1%
      expect(pnl!.metrics.profitMargin).toBe(47.1);
    });

    it("should correctly aggregate Series P&L across all editions", async () => {
      vi.mocked(db.series.findUnique).mockResolvedValueOnce({
        id: "series_1",
        name: "RaibarX",
        slug: "raibarx",
        kind: "MEETUP",
        editions: [
          {
            editionNo: 1,
            event: {
              id: "ev_1",
              title: "RaibarX Dehradun 01",
              slug: "raibarx-01",
              startDate: new Date("2026-03-01"),
              revenueItems: [{ amount: new Prisma.Decimal(40000) }],
              expenseItems: [{ amount: new Prisma.Decimal(25000) }],
            },
          },
          {
            editionNo: 2,
            event: {
              id: "ev_2",
              title: "RaibarX Rishikesh 02",
              slug: "raibarx-02",
              startDate: new Date("2026-06-01"),
              revenueItems: [{ amount: new Prisma.Decimal(60000) }],
              expenseItems: [{ amount: new Prisma.Decimal(30000) }],
            },
          },
        ],
      } as unknown as never);

      const seriesSummary = await getSeriesPnL("series_1");
      expect(seriesSummary).toBeTruthy();
      expect(seriesSummary!.totalEditions).toBe(2);
      expect(seriesSummary!.seriesTotalRevenue).toBe(100000); // 40k + 60k
      expect(seriesSummary!.seriesTotalExpense).toBe(55000); // 25k + 30k
      expect(seriesSummary!.seriesNetProfitLoss).toBe(45000); // 100k - 55k
      // (45000 / 100000) * 100 = 45%
      expect(seriesSummary!.seriesProfitMargin).toBe(45);
      expect(seriesSummary!.isProfitable).toBe(true);
    });

    it("should generate CSV export containing revenue, expenses, and summary rows", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({
        id: "ev_test",
        title: "TricityX Tech Summit",
        slug: "tricityx-summit",
        type: "CONFERENCE",
        startDate: new Date("2026-08-20"),
        seriesEdition: null,
        expenseItems: [
          {
            id: "e1",
            category: ExpenseCategory.VENUE,
            description: "Convention Center",
            amount: new Prisma.Decimal(50000),
            payee: "City Hall",
            paidAt: new Date("2026-08-01"),
          },
        ],
      } as unknown as never);

      vi.mocked(db.payment.findMany).mockResolvedValueOnce([]);
      vi.mocked(db.registration.findMany).mockResolvedValueOnce([]);
      vi.mocked(db.eventRevenueItem.findFirst).mockResolvedValueOnce(null);
      vi.mocked(db.eventRevenueItem.findMany).mockResolvedValueOnce([
        {
          id: "r1",
          category: RevenueCategory.SPONSORSHIP,
          description: "Platinum Sponsor",
          amount: new Prisma.Decimal(120000),
          receivedAt: new Date("2026-08-05"),
          source: "KX-INV-2026-0002",
          isAutoSynced: true,
        },
      ] as unknown as never);

      const { filename, csv } = await generatePnLReportCsv({ eventId: "ev_test" });
      expect(filename).toContain("tricityx-summit");
      expect(csv).toContain("KAILSHIANSX FINANCIAL STATEMENT & EVENT P&L");
      expect(csv).toContain("Total Revenue (INR),120000.00");
      expect(csv).toContain("Total Expense (INR),50000.00");
      expect(csv).toContain("Net Profit/Loss (INR),70000.00");
      expect(csv).toContain("Convention Center");
      expect(csv).toContain("Platinum Sponsor");
    });

    it("should generate vector PDF financial report with pdf-lib", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({
        id: "ev_pdf",
        title: "NirmanX National Hackathon",
        slug: "nirmanx-2026",
        type: "HACKATHON",
        startDate: new Date("2026-11-10"),
        seriesEdition: null,
        expenseItems: [
          {
            id: "e1",
            category: ExpenseCategory.VENUE,
            description: "Indoor Stadium",
            amount: new Prisma.Decimal(75000),
          },
        ],
      } as unknown as never);

      vi.mocked(db.payment.findMany).mockResolvedValueOnce([]);
      vi.mocked(db.registration.findMany).mockResolvedValueOnce([]);
      vi.mocked(db.eventRevenueItem.findFirst).mockResolvedValueOnce(null);
      vi.mocked(db.eventRevenueItem.findMany).mockResolvedValueOnce([
        {
          id: "r1",
          category: RevenueCategory.SPONSORSHIP,
          description: "Dev Grants",
          amount: new Prisma.Decimal(150000),
        },
      ] as unknown as never);

      const { filename, buffer } = await generatePnLReportPdf({ eventId: "ev_pdf" });
      expect(filename).toContain("nirmanx-2026.pdf");
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.byteLength).toBeGreaterThan(1000);
      // Verify PDF magic header bytes (%PDF)
      const pdfHeader = Buffer.from(buffer.slice(0, 4)).toString("ascii");
      expect(pdfHeader).toBe("%PDF");
    });
  });
});
