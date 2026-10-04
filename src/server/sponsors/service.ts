// src/server/sponsors/service.ts
// Comprehensive Sponsor CRM service:
// Manages partners/sponsors, deal stages, deliverables fulfillment, and invoice tracking,
// all linked directly to events and integrated with Event P&L revenue.

import { db } from "@/lib/db";
import {
  PartnerTier,
  SponsorDealStage,
  DeliverableStatus,
  InvoiceStatus,
  RevenueCategory,
  Prisma,
} from "@prisma/client";

export interface CreateOrUpdateDealInput {
  id?: string;
  title: string;
  sponsorId: string;
  eventId?: string | null;
  tier?: PartnerTier;
  stage?: SponsorDealStage;
  amount: number;
  currency?: string;
  confidence?: number;
  ownerName?: string | null;
  notes?: string | null;
  expectedCloseAt?: string | null;
  closedAt?: string | null;
}

export interface CreateOrUpdateDeliverableInput {
  id?: string;
  dealId: string;
  eventId?: string | null;
  title: string;
  description?: string | null;
  status?: DeliverableStatus;
  dueDate?: string | null;
  fulfilledAt?: string | null;
  proofUrl?: string | null;
  assignee?: string | null;
}

export interface CreateOrUpdateInvoiceInput {
  id?: string;
  invoiceNumber?: string;
  dealId: string;
  eventId?: string | null;
  amount: number;
  taxAmount?: number;
  status?: InvoiceStatus;
  issueDate?: string | null;
  dueDate?: string | null;
  paidAt?: string | null;
  paymentMethod?: string | null;
  transactionRef?: string | null;
  notes?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SPONSOR CRM OVERVIEW & DIRECTORY
// ─────────────────────────────────────────────────────────────────────────────

export async function getSponsorsWithStats() {
  const sponsors = await db.partner.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          eventPartners: true,
          deals: true,
        },
      },
      deals: {
        select: {
          id: true,
          stage: true,
          amount: true,
          eventId: true,
          event: {
            select: { id: true, title: true, slug: true },
          },
        },
      },
    },
  });

  return sponsors.map((s) => {
    const deals = s.deals || [];
    const wonDeals = deals.filter((d) => d.stage === SponsorDealStage.WON);
    const wonValue = wonDeals.reduce((sum, d) => sum + Number(d.amount), 0);
    const activeDeals = deals.filter(
      (d) => d.stage !== SponsorDealStage.WON && d.stage !== SponsorDealStage.LOST
    );

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      logo: s.logo,
      website: s.website,
      category: s.category,
      contactPerson: s.contactPerson,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      notes: s.notes,
      eventsCount: s._count.eventPartners,
      dealsCount: s._count.deals,
      activeDealsCount: activeDeals.length,
      wonDealsCount: wonDeals.length,
      totalWonValue: wonValue,
    };
  });
}

export async function getSponsorCRMOverview(eventId?: string) {
  const whereDeal: Prisma.SponsorDealWhereInput = eventId ? { eventId } : {};
  const whereDeliverable: Prisma.SponsorDeliverableWhereInput = eventId ? { eventId } : {};
  const whereInvoice: Prisma.SponsorInvoiceWhereInput = eventId ? { eventId } : {};

  const [deals, deliverables, invoices] = await Promise.all([
    db.sponsorDeal.findMany({
      where: whereDeal,
      select: { stage: true, amount: true },
    }),
    db.sponsorDeliverable.findMany({
      where: whereDeliverable,
      select: { status: true },
    }),
    db.sponsorInvoice.findMany({
      where: whereInvoice,
      select: { status: true, totalAmount: true },
    }),
  ]);

  let totalPipelineValue = 0;
  let wonValue = 0;
  const stageCounts: Record<string, { count: number; totalAmount: number }> = {};

  for (const deal of deals) {
    const amt = Number(deal.amount);
    totalPipelineValue += amt;
    if (deal.stage === SponsorDealStage.WON) {
      wonValue += amt;
    }
    if (!stageCounts[deal.stage]) {
      stageCounts[deal.stage] = { count: 0, totalAmount: 0 };
    }
    stageCounts[deal.stage].count += 1;
    stageCounts[deal.stage].totalAmount += amt;
  }

  const deliverablesStats = {
    total: deliverables.length,
    pending: deliverables.filter((d) => d.status === DeliverableStatus.PENDING).length,
    inProgress: deliverables.filter((d) => d.status === DeliverableStatus.IN_PROGRESS).length,
    fulfilled: deliverables.filter((d) => d.status === DeliverableStatus.FULFILLED).length,
    waived: deliverables.filter((d) => d.status === DeliverableStatus.WAIVED).length,
  };

  const invoiceStats = {
    totalInvoices: invoices.length,
    paidAmount: invoices
      .filter((i) => i.status === InvoiceStatus.PAID)
      .reduce((sum, i) => sum + Number(i.totalAmount), 0),
    unpaidAmount: invoices
      .filter((i) => i.status !== InvoiceStatus.PAID && i.status !== InvoiceStatus.CANCELLED)
      .reduce((sum, i) => sum + Number(i.totalAmount), 0),
    paidCount: invoices.filter((i) => i.status === InvoiceStatus.PAID).length,
    unpaidCount: invoices.filter(
      (i) => i.status !== InvoiceStatus.PAID && i.status !== InvoiceStatus.CANCELLED
    ).length,
  };

  return {
    totalPipelineValue,
    wonValue,
    totalDeals: deals.length,
    stageCounts,
    deliverablesStats,
    invoiceStats,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DEALS & PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

export async function getSponsorDeals(filter?: {
  eventId?: string;
  stage?: string;
  sponsorId?: string;
}) {
  const where: Prisma.SponsorDealWhereInput = {};
  if (filter?.eventId && filter.eventId !== "ALL") where.eventId = filter.eventId;
  if (filter?.stage && filter.stage !== "ALL") where.stage = filter.stage as SponsorDealStage;
  if (filter?.sponsorId && filter.sponsorId !== "ALL") where.sponsorId = filter.sponsorId;

  const deals = await db.sponsorDeal.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      sponsor: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          website: true,
          category: true,
          contactPerson: true,
          contactEmail: true,
          contactPhone: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          startDate: true,
        },
      },
      _count: {
        select: {
          deliverables: true,
          invoices: true,
        },
      },
      deliverables: {
        select: { id: true, status: true },
      },
      invoices: {
        select: { id: true, status: true, totalAmount: true },
      },
    },
  });

  return deals.map((d) => {
    const fulfilledCount = d.deliverables.filter(
      (del) => del.status === DeliverableStatus.FULFILLED
    ).length;
    const paidInvoicesCount = d.invoices.filter((inv) => inv.status === InvoiceStatus.PAID).length;

    return {
      id: d.id,
      title: d.title,
      sponsorId: d.sponsorId,
      sponsor: d.sponsor,
      eventId: d.eventId,
      event: d.event,
      tier: d.tier,
      stage: d.stage,
      amount: Number(d.amount),
      currency: d.currency,
      confidence: d.confidence,
      ownerName: d.ownerName,
      notes: d.notes,
      expectedCloseAt: d.expectedCloseAt?.toISOString() || null,
      closedAt: d.closedAt?.toISOString() || null,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      deliverablesCount: d._count.deliverables,
      deliverablesFulfilledCount: fulfilledCount,
      invoicesCount: d._count.invoices,
      invoicesPaidCount: paidInvoicesCount,
    };
  });
}

export async function createOrUpdateDeal(data: CreateOrUpdateDealInput) {
  const isWon = data.stage === SponsorDealStage.WON;
  const closedAtDate = isWon
    ? data.closedAt
      ? new Date(data.closedAt)
      : new Date()
    : data.closedAt
      ? new Date(data.closedAt)
      : null;

  const payload: Prisma.SponsorDealCreateInput = {
    title: data.title.trim(),
    sponsor: { connect: { id: data.sponsorId } },
    tier: data.tier || PartnerTier.COMMUNITY,
    stage: data.stage || SponsorDealStage.PROSPECT,
    amount: new Prisma.Decimal(data.amount),
    currency: data.currency || "INR",
    confidence: data.confidence !== undefined ? data.confidence : 50,
    ownerName: data.ownerName?.trim() || null,
    notes: data.notes?.trim() || null,
    expectedCloseAt: data.expectedCloseAt ? new Date(data.expectedCloseAt) : null,
    closedAt: closedAtDate,
    ...(data.eventId ? { event: { connect: { id: data.eventId } } } : {}),
  };

  let deal;
  if (data.id) {
    deal = await db.sponsorDeal.update({
      where: { id: data.id },
      data: {
        title: data.title.trim(),
        sponsorId: data.sponsorId,
        eventId: data.eventId || null,
        tier: data.tier,
        stage: data.stage,
        amount: new Prisma.Decimal(data.amount),
        currency: data.currency || "INR",
        confidence: data.confidence,
        ownerName: data.ownerName?.trim() || null,
        notes: data.notes?.trim() || null,
        expectedCloseAt: data.expectedCloseAt ? new Date(data.expectedCloseAt) : null,
        closedAt: closedAtDate,
      },
      include: { sponsor: true, event: true },
    });
  } else {
    deal = await db.sponsorDeal.create({
      data: payload,
      include: { sponsor: true, event: true },
    });
  }

  // If deal is linked to an event, ensure EventPartner link exists
  if (deal.eventId) {
    await db.eventPartner
      .upsert({
        where: {
          eventId_partnerId: {
            eventId: deal.eventId,
            partnerId: deal.sponsorId,
          },
        },
        update: { tier: deal.tier },
        create: {
          eventId: deal.eventId,
          partnerId: deal.sponsorId,
          tier: deal.tier,
        },
      })
      .catch((err) => console.error("EventPartner link error:", err));
  }

  return deal;
}

export async function deleteDeal(id: string) {
  return db.sponsorDeal.delete({
    where: { id },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DELIVERABLES TRACKING
// ─────────────────────────────────────────────────────────────────────────────

export async function getDeliverables(filter?: {
  dealId?: string;
  eventId?: string;
  status?: string;
}) {
  const where: Prisma.SponsorDeliverableWhereInput = {};
  if (filter?.dealId && filter.dealId !== "ALL") where.dealId = filter.dealId;
  if (filter?.eventId && filter.eventId !== "ALL") where.eventId = filter.eventId;
  if (filter?.status && filter.status !== "ALL") where.status = filter.status as DeliverableStatus;

  const deliverables = await db.sponsorDeliverable.findMany({
    where,
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    include: {
      deal: {
        select: {
          id: true,
          title: true,
          tier: true,
          sponsor: {
            select: { id: true, name: true, logo: true },
          },
        },
      },
      event: {
        select: { id: true, title: true, slug: true },
      },
    },
  });

  return deliverables.map((d) => ({
    id: d.id,
    dealId: d.dealId,
    dealTitle: d.deal.title,
    dealTier: d.deal.tier,
    sponsorName: d.deal.sponsor.name,
    sponsorLogo: d.deal.sponsor.logo,
    eventId: d.eventId,
    eventTitle: d.event?.title || "Global / Unassigned",
    title: d.title,
    description: d.description,
    status: d.status,
    dueDate: d.dueDate?.toISOString() || null,
    fulfilledAt: d.fulfilledAt?.toISOString() || null,
    proofUrl: d.proofUrl,
    assignee: d.assignee,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));
}

export async function createOrUpdateDeliverable(data: CreateOrUpdateDeliverableInput) {
  const isFulfilled = data.status === DeliverableStatus.FULFILLED;
  const fulfilledAtDate = isFulfilled
    ? data.fulfilledAt
      ? new Date(data.fulfilledAt)
      : new Date()
    : null;

  if (data.id) {
    return db.sponsorDeliverable.update({
      where: { id: data.id },
      data: {
        dealId: data.dealId,
        eventId: data.eventId || null,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        status: data.status || DeliverableStatus.PENDING,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        fulfilledAt: fulfilledAtDate,
        proofUrl: data.proofUrl?.trim() || null,
        assignee: data.assignee?.trim() || null,
      },
    });
  }

  return db.sponsorDeliverable.create({
    data: {
      deal: { connect: { id: data.dealId } },
      title: data.title.trim(),
      description: data.description?.trim() || null,
      status: data.status || DeliverableStatus.PENDING,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      fulfilledAt: fulfilledAtDate,
      proofUrl: data.proofUrl?.trim() || null,
      assignee: data.assignee?.trim() || null,
      ...(data.eventId ? { event: { connect: { id: data.eventId } } } : {}),
    },
  });
}

export async function deleteDeliverable(id: string) {
  return db.sponsorDeliverable.delete({
    where: { id },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. INVOICES & AUTOMATIC P&L REVENUE SYNC
// ─────────────────────────────────────────────────────────────────────────────

export async function generateInvoiceNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await db.sponsorInvoice.count();
  const sequence = String(count + 1).padStart(4, "0");
  return `KX-INV-${currentYear}-${sequence}`;
}

export async function getInvoices(filter?: { dealId?: string; eventId?: string; status?: string }) {
  const where: Prisma.SponsorInvoiceWhereInput = {};
  if (filter?.dealId && filter.dealId !== "ALL") where.dealId = filter.dealId;
  if (filter?.eventId && filter.eventId !== "ALL") where.eventId = filter.eventId;
  if (filter?.status && filter.status !== "ALL") where.status = filter.status as InvoiceStatus;

  const invoices = await db.sponsorInvoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      deal: {
        select: {
          id: true,
          title: true,
          sponsor: {
            select: { id: true, name: true, logo: true, contactEmail: true },
          },
        },
      },
      event: {
        select: { id: true, title: true, slug: true },
      },
    },
  });

  return invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    dealId: inv.dealId,
    dealTitle: inv.deal.title,
    sponsorName: inv.deal.sponsor.name,
    sponsorLogo: inv.deal.sponsor.logo,
    sponsorEmail: inv.deal.sponsor.contactEmail,
    eventId: inv.eventId,
    eventTitle: inv.event?.title || "General Sponsorship",
    amount: Number(inv.amount),
    taxAmount: Number(inv.taxAmount),
    totalAmount: Number(inv.totalAmount),
    status: inv.status,
    issueDate: inv.issueDate.toISOString(),
    dueDate: inv.dueDate?.toISOString() || null,
    paidAt: inv.paidAt?.toISOString() || null,
    paymentMethod: inv.paymentMethod,
    transactionRef: inv.transactionRef,
    notes: inv.notes,
    createdAt: inv.createdAt.toISOString(),
  }));
}

export async function createOrUpdateInvoice(data: CreateOrUpdateInvoiceInput) {
  const tax = data.taxAmount !== undefined ? data.taxAmount : 0;
  const total = Number(data.amount) + Number(tax);
  const isPaid = data.status === InvoiceStatus.PAID;
  const paidAtDate = isPaid ? (data.paidAt ? new Date(data.paidAt) : new Date()) : null;

  let invoice;
  if (data.id) {
    invoice = await db.sponsorInvoice.update({
      where: { id: data.id },
      data: {
        dealId: data.dealId,
        eventId: data.eventId || null,
        amount: new Prisma.Decimal(data.amount),
        taxAmount: new Prisma.Decimal(tax),
        totalAmount: new Prisma.Decimal(total),
        status: data.status || InvoiceStatus.DRAFT,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        paidAt: paidAtDate,
        paymentMethod: data.paymentMethod?.trim() || null,
        transactionRef: data.transactionRef?.trim() || null,
        notes: data.notes?.trim() || null,
      },
      include: { deal: { include: { sponsor: true } }, event: true },
    });
  } else {
    const invNum = data.invoiceNumber || (await generateInvoiceNumber());
    invoice = await db.sponsorInvoice.create({
      data: {
        invoiceNumber: invNum,
        deal: { connect: { id: data.dealId } },
        amount: new Prisma.Decimal(data.amount),
        taxAmount: new Prisma.Decimal(tax),
        totalAmount: new Prisma.Decimal(total),
        status: data.status || InvoiceStatus.DRAFT,
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        paidAt: paidAtDate,
        paymentMethod: data.paymentMethod?.trim() || null,
        transactionRef: data.transactionRef?.trim() || null,
        notes: data.notes?.trim() || null,
        ...(data.eventId ? { event: { connect: { id: data.eventId } } } : {}),
      },
      include: { deal: { include: { sponsor: true } }, event: true },
    });
  }

  // AUTO-SYNC TO P&L REVENUE:
  // If invoice is PAID and linked to an Event, sync into EventRevenueItem
  if (invoice.status === InvoiceStatus.PAID && invoice.eventId) {
    const revenueDescription = `Sponsorship: ${invoice.deal.sponsor.name} (${invoice.invoiceNumber})`;
    const existingRevItem = await db.eventRevenueItem.findFirst({
      where: {
        eventId: invoice.eventId,
        source: invoice.invoiceNumber,
      },
    });

    if (existingRevItem) {
      await db.eventRevenueItem.update({
        where: { id: existingRevItem.id },
        data: {
          amount: invoice.amount,
          receivedAt: invoice.paidAt || new Date(),
          description: revenueDescription,
          notes: `Payment Ref: ${invoice.transactionRef || "N/A"} • Method: ${invoice.paymentMethod || "NEFT"}`,
        },
      });
    } else {
      await db.eventRevenueItem.create({
        data: {
          eventId: invoice.eventId,
          category: RevenueCategory.SPONSORSHIP,
          description: revenueDescription,
          amount: invoice.amount,
          receivedAt: invoice.paidAt || new Date(),
          source: invoice.invoiceNumber,
          isAutoSynced: true,
          notes: `Payment Ref: ${invoice.transactionRef || "N/A"} • Method: ${invoice.paymentMethod || "NEFT"}`,
        },
      });
    }
  }

  return invoice;
}

export async function deleteInvoice(id: string) {
  const inv = await db.sponsorInvoice.findUnique({ where: { id } });
  if (inv?.invoiceNumber && inv.eventId) {
    // Clean up corresponding auto-synced revenue item if present
    await db.eventRevenueItem.deleteMany({
      where: {
        eventId: inv.eventId,
        source: inv.invoiceNumber,
      },
    });
  }
  return db.sponsorInvoice.delete({
    where: { id },
  });
}
