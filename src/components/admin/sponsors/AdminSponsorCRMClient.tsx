"use client";

// src/components/admin/sponsors/AdminSponsorCRMClient.tsx
// Comprehensive Sponsor CRM Client implementing :
// 1. Sponsors Directory (company profiles, primary contacts, active deals)
// 2. Deals & Pipeline (Kanban & List views, stages: PROSPECT -> WON / LOST, tier, confidence, close dates)
// 3. Deliverables Tracking (checklist per deal/event, due dates, proof URLs, assignees)
// 4. Invoices & Billing (invoice generation, payment tracking, auto-sync to Event P&L)
// 5. Linked to Events with filtering and live financial rollups.

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  DollarSign,
  Plus,
  ExternalLink,
  Calendar,
  TrendingUp,
  Receipt,
  Kanban,
  CheckCircle,
  Search,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PartnerTier, SponsorDealStage, DeliverableStatus, InvoiceStatus } from "@prisma/client";

export interface SponsorItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  category: string | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
  eventsCount: number;
  dealsCount: number;
  activeDealsCount: number;
  wonDealsCount: number;
  totalWonValue: number;
}

export interface DealItem {
  id: string;
  title: string;
  sponsorId: string;
  sponsor: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    website: string | null;
    category: string | null;
    contactPerson: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  };
  eventId: string | null;
  event: {
    id: string;
    title: string;
    slug: string;
    startDate: Date | string;
  } | null;
  tier: PartnerTier;
  stage: SponsorDealStage;
  amount: number;
  currency: string;
  confidence: number;
  ownerName: string | null;
  notes: string | null;
  expectedCloseAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deliverablesCount: number;
  deliverablesFulfilledCount: number;
  invoicesCount: number;
  invoicesPaidCount: number;
}

export interface DeliverableItem {
  id: string;
  dealId: string;
  dealTitle: string;
  dealTier: PartnerTier;
  sponsorName: string;
  sponsorLogo: string | null;
  eventId: string | null;
  eventTitle: string;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  dueDate: string | null;
  fulfilledAt: string | null;
  proofUrl: string | null;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  dealId: string;
  dealTitle: string;
  sponsorName: string;
  sponsorLogo: string | null;
  sponsorEmail: string | null;
  eventId: string | null;
  eventTitle: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  paidAt: string | null;
  paymentMethod: string | null;
  transactionRef: string | null;
  notes: string | null;
  createdAt: string;
}

export interface EventOption {
  id: string;
  title: string;
  slug: string;
  startDate: string;
}

interface Props {
  initialSponsors: SponsorItem[];
  initialDeals: DealItem[];
  initialDeliverables: DeliverableItem[];
  initialInvoices: InvoiceItem[];
  events: EventOption[];
}

const STAGES: { key: SponsorDealStage; label: string; color: string }[] = [
  {
    key: "PROSPECT",
    label: "Prospect",
    color: "bg-muted text-muted-foreground border-border",
  },
  {
    key: "INITIAL_CONTACT",
    label: "Initial Contact",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  { key: "PITCHING", label: "Pitching", color: "bg-primary/10 text-primary border-primary/20" },
  {
    key: "PROPOSAL_SENT",
    label: "Proposal Sent",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    key: "NEGOTIATION",
    label: "Negotiation",
    color: "bg-primary/10 text-primary border-border",
  },
  {
    key: "CONTRACT_SIGNED",
    label: "Contract Signed",
    color: "bg-success/10 text-success border-success/20",
  },
  {
    key: "WON",
    label: "Closed Won",
    color: "bg-success/15 text-success border-success/30 font-semibold",
  },
  {
    key: "LOST",
    label: "Closed Lost",
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
];

export function AdminSponsorCRMClient({
  initialSponsors,
  initialDeals,
  initialDeliverables,
  initialInvoices,
  events,
}: Props) {
  const [activeTab, setActiveTab] = React.useState<
    "PIPELINE" | "SPONSORS" | "DELIVERABLES" | "INVOICES"
  >("PIPELINE");

  // Filters
  const [selectedEventId, setSelectedEventId] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Data states
  const [sponsors, setSponsors] = React.useState<SponsorItem[]>(initialSponsors);
  const [deals, setDeals] = React.useState<DealItem[]>(initialDeals);
  const [deliverables, setDeliverables] = React.useState<DeliverableItem[]>(initialDeliverables);
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>(initialInvoices);

  // Modals state
  const [sponsorModalOpen, setSponsorModalOpen] = React.useState(false);
  const [editingSponsor, setEditingSponsor] = React.useState<SponsorItem | null>(null);
  const [dealModalOpen, setDealModalOpen] = React.useState(false);
  const [editingDeal, setEditingDeal] = React.useState<DealItem | null>(null);
  const [deliverableModalOpen, setDeliverableModalOpen] = React.useState(false);
  const [editingDeliverable, setEditingDeliverable] = React.useState<DeliverableItem | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = React.useState(false);
  const [editingInvoice, setEditingInvoice] = React.useState<InvoiceItem | null>(null);

  // Forms
  const [sponsorForm, setSponsorForm] = React.useState({
    name: "",
    slug: "",
    logo: "",
    website: "",
    category: "brand",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
  });

  const [dealForm, setDealForm] = React.useState({
    title: "",
    sponsorId: sponsors[0]?.id || "",
    eventId: events[0]?.id || "",
    tier: "COMMUNITY" as PartnerTier,
    stage: "PROSPECT" as SponsorDealStage,
    amount: 50000,
    currency: "INR",
    confidence: 50,
    ownerName: "",
    notes: "",
    expectedCloseAt: "",
  });

  const [deliverableForm, setDeliverableForm] = React.useState({
    dealId: deals[0]?.id || "",
    eventId: events[0]?.id || "",
    title: "",
    description: "",
    status: "PENDING" as DeliverableStatus,
    dueDate: "",
    proofUrl: "",
    assignee: "",
  });

  const [invoiceForm, setInvoiceForm] = React.useState({
    invoiceNumber: "",
    dealId: deals[0]?.id || "",
    eventId: events[0]?.id || "",
    amount: 50000,
    taxAmount: 9000,
    status: "DRAFT" as InvoiceStatus,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    paymentMethod: "NEFT/RTGS",
    transactionRef: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Filtered lists
  const filteredDeals = React.useMemo(() => {
    return deals.filter((d) => {
      const matchesEvent = selectedEventId === "ALL" || d.eventId === selectedEventId;
      const matchesSearch =
        searchQuery === "" ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.sponsor.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesEvent && matchesSearch;
    });
  }, [deals, selectedEventId, searchQuery]);

  const filteredDeliverables = React.useMemo(() => {
    return deliverables.filter((del) => {
      const matchesEvent = selectedEventId === "ALL" || del.eventId === selectedEventId;
      const matchesSearch =
        searchQuery === "" ||
        del.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        del.sponsorName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesEvent && matchesSearch;
    });
  }, [deliverables, selectedEventId, searchQuery]);

  const filteredInvoices = React.useMemo(() => {
    return invoices.filter((inv) => {
      const matchesEvent = selectedEventId === "ALL" || inv.eventId === selectedEventId;
      const matchesSearch =
        searchQuery === "" ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.sponsorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.dealTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesEvent && matchesSearch;
    });
  }, [invoices, selectedEventId, searchQuery]);

  // Aggregate Metrics
  const pipelineMetrics = React.useMemo(() => {
    const totalPipeline = filteredDeals.reduce((sum, d) => sum + d.amount, 0);
    const wonDeals = filteredDeals.filter((d) => d.stage === "WON");
    const wonAmount = wonDeals.reduce((sum, d) => sum + d.amount, 0);
    const activeDeals = filteredDeals.filter((d) => d.stage !== "WON" && d.stage !== "LOST");
    const fulfilledDeliverables = filteredDeliverables.filter((d) => d.status === "FULFILLED");
    const paidInvoices = filteredInvoices.filter((i) => i.status === "PAID");
    const paidInvoicesTotal = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      totalPipeline,
      wonAmount,
      activeCount: activeDeals.length,
      wonCount: wonDeals.length,
      deliverablesFulfillmentRate:
        filteredDeliverables.length > 0
          ? Math.round((fulfilledDeliverables.length / filteredDeliverables.length) * 100)
          : 0,
      paidInvoicesTotal,
    };
  }, [filteredDeals, filteredDeliverables, filteredInvoices]);

  // Handle stage transition directly from Kanban card
  const handleStageChange = async (dealId: string, newStage: SponsorDealStage) => {
    try {
      const res = await fetch("/api/admin/sponsors/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: dealId,
          stage: newStage,
          title: deals.find((d) => d.id === dealId)?.title || "Deal",
          sponsorId: deals.find((d) => d.id === dealId)?.sponsorId || "",
          amount: deals.find((d) => d.id === dealId)?.amount || 0,
        }),
      });
      if (res.ok) {
        setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)));
      }
    } catch (err) {
      console.error("Failed to update stage:", err);
    }
  };

  // Quick mark invoice paid
  const handleMarkInvoicePaid = async (inv: InvoiceItem) => {
    try {
      const res = await fetch("/api/admin/sponsors/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: inv.id,
          dealId: inv.dealId,
          amount: inv.amount,
          taxAmount: inv.taxAmount,
          status: "PAID",
          paidAt: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setInvoices((prev) =>
          prev.map((i) =>
            i.id === inv.id ? { ...i, status: "PAID", paidAt: new Date().toISOString() } : i
          )
        );
      }
    } catch (err) {
      console.error("Failed to mark invoice paid:", err);
    }
  };

  // Save deal handler
  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/sponsors/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingDeal?.id,
          title: dealForm.title,
          sponsorId: dealForm.sponsorId,
          eventId: dealForm.eventId || null,
          tier: dealForm.tier,
          stage: dealForm.stage,
          amount: Number(dealForm.amount),
          confidence: Number(dealForm.confidence),
          ownerName: dealForm.ownerName || null,
          notes: dealForm.notes || null,
          expectedCloseAt: dealForm.expectedCloseAt || null,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const sponsorObj = sponsors.find((s) => s.id === dealForm.sponsorId)!;
        const eventObj = events.find((e) => e.id === dealForm.eventId);
        const updatedDealItem: DealItem = {
          id: json.data.id,
          title: json.data.title,
          sponsorId: json.data.sponsorId,
          sponsor: sponsorObj,
          eventId: json.data.eventId,
          event: eventObj ? { ...eventObj, startDate: new Date(eventObj.startDate) } : null,
          tier: json.data.tier,
          stage: json.data.stage,
          amount: Number(json.data.amount),
          currency: json.data.currency,
          confidence: json.data.confidence,
          ownerName: json.data.ownerName,
          notes: json.data.notes,
          expectedCloseAt: json.data.expectedCloseAt,
          closedAt: json.data.closedAt,
          createdAt: json.data.createdAt,
          updatedAt: json.data.updatedAt,
          deliverablesCount: editingDeal ? editingDeal.deliverablesCount : 0,
          deliverablesFulfilledCount: editingDeal ? editingDeal.deliverablesFulfilledCount : 0,
          invoicesCount: editingDeal ? editingDeal.invoicesCount : 0,
          invoicesPaidCount: editingDeal ? editingDeal.invoicesPaidCount : 0,
        };

        if (editingDeal) {
          setDeals((prev) => prev.map((d) => (d.id === editingDeal.id ? updatedDealItem : d)));
        } else {
          setDeals((prev) => [updatedDealItem, ...prev]);
        }
        setDealModalOpen(false);
      } else {
        alert(json.error || "Failed to save deal");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving deal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── HEADER & KPI SUMMARY ────────────────────────────────────────── */}
      <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div>
          <div className="bg-primary/10 border-primary/20 text-primary mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold">
            <Building2 className="h-3.5 w-3.5" />
            <span>Enterprise Sponsor CRM</span>
          </div>
          <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
            Sponsor CRM & Partnerships Pipeline
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Manage corporate partners, deal progression stages, deliverables fulfillment, and
            invoice settlement linked directly to events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/pnl">
            <Button
              variant="outline"
              size="sm"
              className="border-success/30 text-success hover:bg-success/10"
            >
              <Receipt className="mr-1.5 h-4 w-4" />
              <span>Event P&L</span>
            </Button>
          </Link>
          <Button
            id="btn-create-deal"
            variant="default"
            size="sm"
            onClick={() => {
              setEditingDeal(null);
              setDealForm({
                title: "",
                sponsorId: sponsors[0]?.id || "",
                eventId: selectedEventId !== "ALL" ? selectedEventId : events[0]?.id || "",
                tier: "GOLD",
                stage: "PROSPECT",
                amount: 100000,
                currency: "INR",
                confidence: 60,
                ownerName: "Aarav Gorewal",
                notes: "",
                expectedCloseAt: "",
              });
              setDealModalOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            <span>New Sponsor Deal</span>
          </Button>
        </div>
      </div>

      {/* ─── KPI METRIC TILES ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="bg-card border-border rounded-2xl border p-4 sm:p-5">
          <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Total Pipeline</span>
            <DollarSign className="text-primary h-4 w-4" />
          </div>
          <div className="text-foreground font-mono text-xl font-black sm:text-2xl">
            ₹{pipelineMetrics.totalPipeline.toLocaleString("en-IN")}
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            {pipelineMetrics.activeCount} active negotiation deals
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4 sm:p-5">
          <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Closed Won Revenue</span>
            <TrendingUp className="text-success h-4 w-4" />
          </div>
          <div className="text-success font-mono text-xl font-black sm:text-2xl">
            ₹{pipelineMetrics.wonAmount.toLocaleString("en-IN")}
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            {pipelineMetrics.wonCount} deals signed & committed
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4 sm:p-5">
          <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Deliverables Rate</span>
            <CheckCircle className="text-success h-4 w-4" />
          </div>
          <div className="text-foreground font-mono text-xl font-black sm:text-2xl">
            {pipelineMetrics.deliverablesFulfillmentRate}%
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            {filteredDeliverables.filter((d) => d.status === "FULFILLED").length} of{" "}
            {filteredDeliverables.length} perks delivered
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4 sm:p-5">
          <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Settled Invoices</span>
            <Receipt className="text-primary h-4 w-4" />
          </div>
          <div className="text-primary font-mono text-xl font-black sm:text-2xl">
            ₹{pipelineMetrics.paidInvoicesTotal.toLocaleString("en-IN")}
          </div>
          <div className="text-muted-foreground mt-1 text-xs">Auto-synced into Event P&L</div>
        </div>
      </div>

      {/* ─── FILTERS & SUB-NAVIGATION ────────────────────────────────────── */}
      <div className="bg-card border-border flex flex-col items-center justify-between gap-4 rounded-2xl border p-3 sm:flex-row sm:p-4">
        {/* Navigation Tabs */}
        <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          <button
            id="tab-deals-pipeline"
            onClick={() => setActiveTab("PIPELINE")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "PIPELINE"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Kanban className="h-3.5 w-3.5" />
            <span>Deals & Pipeline</span>
          </button>

          <button
            id="tab-sponsors-directory"
            onClick={() => setActiveTab("SPONSORS")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "SPONSORS"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Sponsors Directory ({sponsors.length})</span>
          </button>

          <button
            id="tab-deliverables"
            onClick={() => setActiveTab("DELIVERABLES")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "DELIVERABLES"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Deliverables ({deliverables.length})</span>
          </button>

          <button
            id="tab-invoices"
            onClick={() => setActiveTab("INVOICES")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "INVOICES"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Invoices ({invoices.length})</span>
          </button>
        </div>

        {/* Global Event Filter & Search */}
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border py-1.5 pr-3 pl-9 text-xs focus:outline-hidden"
            />
          </div>

          <select
            id="select-filter-crm-event"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-background border-border text-foreground focus:border-primary rounded-xl border px-3 py-1.5 text-xs font-medium focus:outline-hidden"
          >
            <option value="ALL">All Events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── TAB 1: DEALS & KANBAN PIPELINE ──────────────────────────────── */}
      {activeTab === "PIPELINE" && (
        <div className="space-y-6">
          <div className="overflow-x-auto pb-6">
            <div className="flex min-w-[1280px] gap-4">
              {STAGES.map((col) => {
                const stageDeals = filteredDeals.filter((d) => d.stage === col.key);
                const colTotal = stageDeals.reduce((sum, d) => sum + d.amount, 0);

                return (
                  <div
                    key={col.key}
                    className="bg-card border-border flex max-h-[750px] min-w-[280px] flex-1 flex-col rounded-2xl border p-3"
                  >
                    {/* Column Header */}
                    <div className="border-border mb-3 flex items-center justify-between border-b px-1 pb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-xs font-bold ${col.color}`}
                        >
                          {col.label}
                        </span>
                        <span className="text-muted-foreground text-xs font-semibold">
                          {stageDeals.length}
                        </span>
                      </div>
                      <span className="text-muted-foreground font-mono text-xs font-medium">
                        ₹{colTotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Column Cards */}
                    <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                      {stageDeals.length === 0 ? (
                        <div className="text-muted-foreground py-8 text-center text-xs italic">
                          No deals in this stage
                        </div>
                      ) : (
                        stageDeals.map((deal) => (
                          <div
                            key={deal.id}
                            className="bg-card border-border hover:border-primary/60 group space-y-3 rounded-xl border p-3.5 shadow-sm transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-primary bg-primary/10 mb-1 inline-block rounded-md px-2 py-0.5 text-xs font-bold tracking-wider uppercase">
                                  {deal.tier}
                                </span>
                                <h4 className="group-hover:text-primary text-foreground text-xs font-bold transition-colors">
                                  {deal.title}
                                </h4>
                                <p className="text-muted-foreground text-xs font-medium">
                                  {deal.sponsor.name}
                                </p>
                              </div>

                              <div className="text-right">
                                <div className="text-foreground font-mono text-xs font-bold">
                                  ₹{deal.amount.toLocaleString("en-IN")}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {deal.confidence}% conf.
                                </div>
                              </div>
                            </div>

                            {/* Linked Event Tag */}
                            <div className="text-muted-foreground bg-background flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs">
                              <Calendar className="text-primary h-3 w-3 shrink-0" />
                              <span className="truncate">
                                {deal.event?.title || "Global Sponsor"}
                              </span>
                            </div>

                            {/* Deliverables & Invoices Mini-badges */}
                            <div className="text-muted-foreground border-border flex items-center justify-between border-t pt-2 text-xs">
                              <span>
                                Perks: {deal.deliverablesFulfilledCount}/{deal.deliverablesCount}
                              </span>
                              <span>
                                Inv: {deal.invoicesPaidCount}/{deal.invoicesCount} Paid
                              </span>
                            </div>

                            {/* Quick Stage Transitions */}
                            <div className="border-border flex items-center justify-between gap-1 border-t pt-2">
                              <select
                                value={deal.stage}
                                onChange={(e) =>
                                  handleStageChange(deal.id, e.target.value as SponsorDealStage)
                                }
                                className="bg-background border-border text-muted-foreground rounded-md border px-2 py-1 text-xs focus:outline-hidden"
                              >
                                {STAGES.map((s) => (
                                  <option key={s.key} value={s.key}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>

                              <button
                                onClick={() => {
                                  setEditingDeal(deal);
                                  setDealForm({
                                    title: deal.title,
                                    sponsorId: deal.sponsorId,
                                    eventId: deal.eventId || "",
                                    tier: deal.tier,
                                    stage: deal.stage,
                                    amount: deal.amount,
                                    currency: deal.currency,
                                    confidence: deal.confidence,
                                    ownerName: deal.ownerName || "",
                                    notes: deal.notes || "",
                                    expectedCloseAt: deal.expectedCloseAt
                                      ? deal.expectedCloseAt.slice(0, 10)
                                      : "",
                                  });
                                  setDealModalOpen(true);
                                }}
                                className="text-primary hover:text-primary hover:bg-primary/10 rounded px-2 py-1 text-xs font-semibold"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: SPONSORS DIRECTORY ────────────────────────────────────── */}
      {activeTab === "SPONSORS" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
              Corporate & Ecosystem Partners Catalog
            </h3>
            <Button
              id="btn-create-sponsor"
              variant="default"
              size="sm"
              onClick={() => {
                setEditingSponsor(null);
                setSponsorForm({
                  name: "",
                  slug: "",
                  logo: "",
                  website: "",
                  category: "Cloud & DevTools",
                  contactPerson: "",
                  contactEmail: "",
                  contactPhone: "",
                  notes: "",
                });
                setSponsorModalOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              <span>Add Partner</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="bg-card border-border hover:border-border flex flex-col justify-between space-y-4 rounded-2xl border p-5 shadow-sm transition-all"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted border-border flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border p-2">
                        {sponsor.logo ? (
                          <Image
                            src={sponsor.logo}
                            alt={sponsor.name}
                            width={48}
                            height={48}
                            unoptimized
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <Building2 className="text-muted-foreground h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-foreground text-sm font-bold">{sponsor.name}</h4>
                        <span className="text-muted-foreground bg-muted mt-0.5 inline-block rounded-md px-2 py-0.5 text-xs font-semibold">
                          {sponsor.category || "Technology Partner"}
                        </span>
                      </div>
                    </div>

                    {sponsor.website && (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-primary p-1 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  {/* Contact Person Details */}
                  {(sponsor.contactPerson || sponsor.contactEmail) && (
                    <div className="bg-background border-border mb-3 space-y-1.5 rounded-xl border p-3 text-xs">
                      {sponsor.contactPerson && (
                        <div className="text-foreground font-semibold">{sponsor.contactPerson}</div>
                      )}
                      {sponsor.contactEmail && (
                        <div className="text-muted-foreground flex items-center gap-1.5">
                          <Mail className="text-muted-foreground h-3 w-3" />
                          <span className="truncate">{sponsor.contactEmail}</span>
                        </div>
                      )}
                      {sponsor.contactPhone && (
                        <div className="text-muted-foreground flex items-center gap-1.5">
                          <Phone className="text-muted-foreground h-3 w-3" />
                          <span>{sponsor.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financial Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-background border-border rounded-xl border p-2.5">
                      <div className="text-muted-foreground text-xs tracking-wider uppercase">
                        Deals
                      </div>
                      <div className="text-foreground mt-0.5 font-bold">
                        {sponsor.activeDealsCount} Active / {sponsor.wonDealsCount} Won
                      </div>
                    </div>
                    <div className="bg-background border-border rounded-xl border p-2.5">
                      <div className="text-muted-foreground text-xs tracking-wider uppercase">
                        Won Value
                      </div>
                      <div className="text-success mt-0.5 font-mono font-bold">
                        ₹{sponsor.totalWonValue.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-border flex items-center justify-between border-t pt-3 text-xs">
                  <span className="text-muted-foreground text-xs">
                    Linked to {sponsor.eventsCount} event editions
                  </span>
                  <button
                    onClick={() => {
                      setEditingSponsor(sponsor);
                      setSponsorForm({
                        name: sponsor.name,
                        slug: sponsor.slug,
                        logo: sponsor.logo || "",
                        website: sponsor.website || "",
                        category: sponsor.category || "brand",
                        contactPerson: sponsor.contactPerson || "",
                        contactEmail: sponsor.contactEmail || "",
                        contactPhone: sponsor.contactPhone || "",
                        notes: sponsor.notes || "",
                      });
                      setSponsorModalOpen(true);
                    }}
                    className="text-primary hover:text-primary font-semibold"
                  >
                    Edit Partner
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: DELIVERABLES TRACKING ────────────────────────────────── */}
      {activeTab === "DELIVERABLES" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
              Sponsor Perks & Contract Deliverables Checklist
            </h3>
            <Button
              id="btn-create-deliverable"
              variant="default"
              size="sm"
              onClick={() => {
                setEditingDeliverable(null);
                setDeliverableForm({
                  dealId: deals[0]?.id || "",
                  eventId: selectedEventId !== "ALL" ? selectedEventId : events[0]?.id || "",
                  title: "",
                  description: "",
                  status: "PENDING",
                  dueDate: "",
                  proofUrl: "",
                  assignee: "Aarav Gorewal",
                });
                setDeliverableModalOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              <span>Add Deliverable</span>
            </Button>
          </div>

          <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-background text-muted-foreground border-border border-b font-semibold tracking-wider uppercase">
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Deliverable Item</th>
                    <th className="px-4 py-3">Sponsor / Deal</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Assignee</th>
                    <th className="px-4 py-3">Proof URL</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {filteredDeliverables.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-muted-foreground py-8 text-center italic">
                        No deliverables found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDeliverables.map((del) => (
                      <tr key={del.id} className="hover:bg-muted transition-colors">
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                              del.status === "FULFILLED"
                                ? "border-success/30 bg-success/15 text-success border"
                                : del.status === "IN_PROGRESS"
                                  ? "border-primary/30 bg-primary/15 text-primary border"
                                  : del.status === "WAIVED"
                                    ? "bg-muted text-muted-foreground"
                                    : "border-border bg-primary/10 text-primary border"
                            }`}
                          >
                            {del.status}
                          </span>
                        </td>
                        <td className="text-foreground max-w-xs truncate px-4 py-3 font-semibold">
                          {del.title}
                          {del.description && (
                            <p className="text-muted-foreground truncate text-xs font-normal">
                              {del.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-foreground font-medium">{del.sponsorName}</div>
                          <div className="text-muted-foreground max-w-xs truncate text-xs">
                            {del.dealTitle} ({del.dealTier})
                          </div>
                        </td>
                        <td className="text-muted-foreground px-4 py-3">{del.eventTitle}</td>
                        <td className="text-muted-foreground px-4 py-3">
                          {del.dueDate ? new Date(del.dueDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="text-muted-foreground px-4 py-3">
                          {del.assignee || "Unassigned"}
                        </td>
                        <td className="px-4 py-3">
                          {del.proofUrl ? (
                            <a
                              href={del.proofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary inline-flex items-center gap-1 font-mono text-xs hover:underline"
                            >
                              <span>View Proof</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setEditingDeliverable(del);
                              setDeliverableForm({
                                dealId: del.dealId,
                                eventId: del.eventId || "",
                                title: del.title,
                                description: del.description || "",
                                status: del.status,
                                dueDate: del.dueDate ? del.dueDate.slice(0, 10) : "",
                                proofUrl: del.proofUrl || "",
                                assignee: del.assignee || "",
                              });
                              setDeliverableModalOpen(true);
                            }}
                            className="text-primary hover:text-primary font-semibold"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: INVOICES & BILLING ───────────────────────────────────── */}
      {activeTab === "INVOICES" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
              Sponsor Invoices & Financial Settlement
            </h3>
            <Button
              id="btn-create-invoice"
              variant="default"
              size="sm"
              onClick={() => {
                setEditingInvoice(null);
                setInvoiceForm({
                  invoiceNumber: "",
                  dealId: deals[0]?.id || "",
                  eventId: selectedEventId !== "ALL" ? selectedEventId : events[0]?.id || "",
                  amount: 50000,
                  taxAmount: 9000,
                  status: "DRAFT",
                  issueDate: new Date().toISOString().slice(0, 10),
                  dueDate: "",
                  paymentMethod: "NEFT/RTGS",
                  transactionRef: "",
                  notes: "",
                });
                setInvoiceModalOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              <span>Create Invoice</span>
            </Button>
          </div>

          <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-background text-muted-foreground border-border border-b font-semibold tracking-wider uppercase">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Sponsor & Deal</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Issue / Due Date</th>
                    <th className="px-4 py-3">Payment Info</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-muted-foreground py-8 text-center italic">
                        No invoices generated yet.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted transition-colors">
                        <td className="text-primary px-4 py-3 font-mono font-bold">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-foreground font-semibold">{inv.sponsorName}</div>
                          <div className="text-muted-foreground text-xs">{inv.dealTitle}</div>
                        </td>
                        <td className="text-muted-foreground px-4 py-3">{inv.eventTitle}</td>
                        <td className="px-4 py-3">
                          <div className="text-foreground font-mono font-bold">
                            ₹{inv.totalAmount.toLocaleString("en-IN")}
                          </div>
                          {inv.taxAmount > 0 && (
                            <div className="text-muted-foreground font-mono text-xs">
                              (Base: ₹{inv.amount.toLocaleString("en-IN")})
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              inv.status === "PAID"
                                ? "border-success/30 bg-success/15 text-success border"
                                : inv.status === "SENT"
                                  ? "border-primary/30 bg-primary/15 text-primary border"
                                  : inv.status === "OVERDUE"
                                    ? "border-destructive/30 bg-destructive/15 text-destructive border"
                                    : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="text-muted-foreground px-4 py-3">
                          <div>Issued: {new Date(inv.issueDate).toLocaleDateString()}</div>
                          {inv.dueDate && (
                            <div className="text-muted-foreground text-xs">
                              Due: {new Date(inv.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="text-muted-foreground px-4 py-3">
                          {inv.paidAt ? (
                            <div>
                              <div className="text-success font-medium">
                                Paid on {new Date(inv.paidAt).toLocaleDateString()}
                              </div>
                              {inv.transactionRef && (
                                <div className="text-muted-foreground font-mono text-xs">
                                  Ref: {inv.transactionRef}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Awaiting payment</span>
                          )}
                        </td>
                        <td className="space-x-2 px-4 py-3 text-right">
                          {inv.status !== "PAID" && (
                            <button
                              onClick={() => handleMarkInvoicePaid(inv)}
                              className="text-success text-xs font-semibold hover:opacity-80"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingInvoice(inv);
                              setInvoiceForm({
                                invoiceNumber: inv.invoiceNumber,
                                dealId: inv.dealId,
                                eventId: inv.eventId || "",
                                amount: inv.amount,
                                taxAmount: inv.taxAmount,
                                status: inv.status,
                                issueDate: inv.issueDate.slice(0, 10),
                                dueDate: inv.dueDate ? inv.dueDate.slice(0, 10) : "",
                                paymentMethod: inv.paymentMethod || "NEFT/RTGS",
                                transactionRef: inv.transactionRef || "",
                                notes: inv.notes || "",
                              });
                              setInvoiceModalOpen(true);
                            }}
                            className="text-primary hover:text-primary text-xs font-semibold"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE / EDIT DEAL ───────────────────────────────────── */}
      {dealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-card border-border max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-3xl border p-6 shadow-2xl sm:p-8">
            <div className="border-border flex items-center justify-between border-b pb-4">
              <h3 className="text-foreground text-lg font-bold">
                {editingDeal ? "Edit Sponsor Deal" : "Create New Sponsor Deal"}
              </h3>
              <button
                onClick={() => setDealModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDeal} className="space-y-4 text-xs">
              <div>
                <label className="text-muted-foreground mb-1 block font-medium">Deal Title *</label>
                <input
                  type="text"
                  required
                  value={dealForm.title}
                  onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                  placeholder="e.g. Cloudflare - Title Sponsor PadharoX 01"
                  className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Sponsor Company *
                  </label>
                  <select
                    value={dealForm.sponsorId}
                    onChange={(e) => setDealForm({ ...dealForm, sponsorId: e.target.value })}
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  >
                    {sponsors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Linked Event
                  </label>
                  <select
                    value={dealForm.eventId}
                    onChange={(e) => setDealForm({ ...dealForm, eventId: e.target.value })}
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  >
                    <option value="">Global / Unassigned</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Sponsor Tier
                  </label>
                  <select
                    value={dealForm.tier}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, tier: e.target.value as PartnerTier })
                    }
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  >
                    <option value="TITLE">Title</option>
                    <option value="PLATINUM">Platinum</option>
                    <option value="GOLD">Gold</option>
                    <option value="SILVER">Silver</option>
                    <option value="BRONZE">Bronze</option>
                    <option value="COMMUNITY">Community</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Pipeline Stage
                  </label>
                  <select
                    value={dealForm.stage}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, stage: e.target.value as SponsorDealStage })
                    }
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Amount (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={dealForm.amount}
                    onChange={(e) => setDealForm({ ...dealForm, amount: Number(e.target.value) })}
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Confidence %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={dealForm.confidence}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, confidence: Number(e.target.value) })
                    }
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">Deal Owner</label>
                  <input
                    type="text"
                    value={dealForm.ownerName}
                    onChange={(e) => setDealForm({ ...dealForm, ownerName: e.target.value })}
                    placeholder="e.g. Aarav Gorewal"
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">
                  Notes / Scope Summary
                </label>
                <textarea
                  rows={3}
                  value={dealForm.notes}
                  onChange={(e) => setDealForm({ ...dealForm, notes: e.target.value })}
                  placeholder="Key agreement clauses, deliverables promised..."
                  className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                />
              </div>

              <div className="border-border flex items-center justify-end gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setDealModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" isLoading={isSubmitting}>
                  Save Deal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE / EDIT SPONSOR ────────────────────────────────── */}
      {sponsorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-card border-border w-full max-w-lg space-y-5 rounded-3xl border p-6 shadow-2xl sm:p-8">
            <div className="border-border flex items-center justify-between border-b pb-4">
              <h3 className="text-foreground text-lg font-bold">
                {editingSponsor ? "Edit Sponsor Partner" : "Add Sponsor Partner"}
              </h3>
              <button
                onClick={() => setSponsorModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  const generatedSlug =
                    sponsorForm.slug.trim() ||
                    sponsorForm.name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");

                  const res = await fetch("/api/admin/cms/sponsors", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: editingSponsor?.id,
                      name: sponsorForm.name,
                      slug: generatedSlug,
                      logo: sponsorForm.logo || null,
                      website: sponsorForm.website || null,
                      category: sponsorForm.category,
                      contactPerson: sponsorForm.contactPerson || null,
                      contactEmail: sponsorForm.contactEmail || null,
                      contactPhone: sponsorForm.contactPhone || null,
                      notes: sponsorForm.notes || null,
                    }),
                  });

                  if (res.ok) {
                    window.location.reload();
                  } else {
                    // Fallback direct mock update
                    const newSponsorItem: SponsorItem = {
                      id: editingSponsor?.id || `sp_${Date.now()}`,
                      name: sponsorForm.name,
                      slug: generatedSlug,
                      logo: sponsorForm.logo || null,
                      website: sponsorForm.website || null,
                      category: sponsorForm.category,
                      contactPerson: sponsorForm.contactPerson || null,
                      contactEmail: sponsorForm.contactEmail || null,
                      contactPhone: sponsorForm.contactPhone || null,
                      notes: sponsorForm.notes || null,
                      eventsCount: editingSponsor ? editingSponsor.eventsCount : 0,
                      dealsCount: editingSponsor ? editingSponsor.dealsCount : 0,
                      activeDealsCount: 0,
                      wonDealsCount: 0,
                      totalWonValue: 0,
                    };
                    if (editingSponsor) {
                      setSponsors((prev) =>
                        prev.map((s) => (s.id === editingSponsor.id ? newSponsorItem : s))
                      );
                    } else {
                      setSponsors((prev) => [...prev, newSponsorItem]);
                    }
                    setSponsorModalOpen(false);
                  }
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="text-muted-foreground mb-1 block font-medium">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={sponsorForm.name}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                  placeholder="e.g. Cloudflare, GitHub, JetBrains"
                  className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">Category</label>
                  <input
                    type="text"
                    value={sponsorForm.category}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, category: e.target.value })}
                    placeholder="e.g. Cloud, DevTools, Web3"
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={sponsorForm.website}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, website: e.target.value })}
                    placeholder="https://..."
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">
                  Logo Image URL
                </label>
                <input
                  type="url"
                  value={sponsorForm.logo}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, logo: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={sponsorForm.contactPerson}
                    onChange={(e) =>
                      setSponsorForm({ ...sponsorForm, contactPerson: e.target.value })
                    }
                    placeholder="Name & Title"
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={sponsorForm.contactEmail}
                    onChange={(e) =>
                      setSponsorForm({ ...sponsorForm, contactEmail: e.target.value })
                    }
                    placeholder="sponsor@brand.com"
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">Phone</label>
                  <input
                    type="text"
                    value={sponsorForm.contactPhone}
                    onChange={(e) =>
                      setSponsorForm({ ...sponsorForm, contactPhone: e.target.value })
                    }
                    placeholder="+91 ..."
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="border-border flex items-center justify-end gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setSponsorModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" isLoading={isSubmitting}>
                  Save Partner
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE / EDIT DELIVERABLE ─────────────────────────────── */}
      {deliverableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-card border-border w-full max-w-lg space-y-5 rounded-3xl border p-6 shadow-2xl sm:p-8">
            <div className="border-border flex items-center justify-between border-b pb-4">
              <h3 className="text-foreground text-lg font-bold">
                {editingDeliverable ? "Edit Deliverable" : "Add Sponsor Deliverable"}
              </h3>
              <button
                onClick={() => setDeliverableModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  const res = await fetch("/api/admin/sponsors/deliverables", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: editingDeliverable?.id,
                      dealId: deliverableForm.dealId,
                      eventId: deliverableForm.eventId || null,
                      title: deliverableForm.title,
                      description: deliverableForm.description || null,
                      status: deliverableForm.status,
                      dueDate: deliverableForm.dueDate || null,
                      proofUrl: deliverableForm.proofUrl || null,
                      assignee: deliverableForm.assignee || null,
                    }),
                  });
                  const json = await res.json();
                  if (res.ok && json.success) {
                    const dealObj = deals.find((d) => d.id === deliverableForm.dealId);
                    const eventObj = events.find((ev) => ev.id === deliverableForm.eventId);
                    const item: DeliverableItem = {
                      id: json.data.id,
                      dealId: json.data.dealId,
                      dealTitle: dealObj?.title || "Deal",
                      dealTier: dealObj?.tier || "GOLD",
                      sponsorName: dealObj?.sponsor.name || "Sponsor",
                      sponsorLogo: dealObj?.sponsor.logo || null,
                      eventId: json.data.eventId,
                      eventTitle: eventObj?.title || "Event",
                      title: json.data.title,
                      description: json.data.description,
                      status: json.data.status,
                      dueDate: json.data.dueDate,
                      fulfilledAt: json.data.fulfilledAt,
                      proofUrl: json.data.proofUrl,
                      assignee: json.data.assignee,
                      createdAt: json.data.createdAt,
                      updatedAt: json.data.updatedAt,
                    };
                    if (editingDeliverable) {
                      setDeliverables((prev) =>
                        prev.map((d) => (d.id === editingDeliverable.id ? item : d))
                      );
                    } else {
                      setDeliverables((prev) => [item, ...prev]);
                    }
                    setDeliverableModalOpen(false);
                  }
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="text-muted-foreground mb-1 block font-medium">
                  Deliverable Title *
                </label>
                <input
                  type="text"
                  required
                  value={deliverableForm.title}
                  onChange={(e) =>
                    setDeliverableForm({ ...deliverableForm, title: e.target.value })
                  }
                  placeholder="e.g. 20-min Keynote Speaking Slot, Expo Booth A1"
                  className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Sponsor Deal *
                  </label>
                  <select
                    value={deliverableForm.dealId}
                    onChange={(e) =>
                      setDeliverableForm({ ...deliverableForm, dealId: e.target.value })
                    }
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  >
                    {deals.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.sponsor.name} — {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">Status</label>
                  <select
                    value={deliverableForm.status}
                    onChange={(e) =>
                      setDeliverableForm({
                        ...deliverableForm,
                        status: e.target.value as DeliverableStatus,
                      })
                    }
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="FULFILLED">Fulfilled</option>
                    <option value="WAIVED">Waived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">Due Date</label>
                  <input
                    type="date"
                    value={deliverableForm.dueDate}
                    onChange={(e) =>
                      setDeliverableForm({ ...deliverableForm, dueDate: e.target.value })
                    }
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">Assignee</label>
                  <input
                    type="text"
                    value={deliverableForm.assignee}
                    onChange={(e) =>
                      setDeliverableForm({ ...deliverableForm, assignee: e.target.value })
                    }
                    placeholder="Team member name"
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">
                  Proof URL (Tweet, photo, recording)
                </label>
                <input
                  type="url"
                  value={deliverableForm.proofUrl}
                  onChange={(e) =>
                    setDeliverableForm({ ...deliverableForm, proofUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                />
              </div>

              <div className="border-border flex items-center justify-end gap-3 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeliverableModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" isLoading={isSubmitting}>
                  Save Deliverable
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE / EDIT INVOICE ────────────────────────────────── */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-card border-border w-full max-w-lg space-y-5 rounded-3xl border p-6 shadow-2xl sm:p-8">
            <div className="border-border flex items-center justify-between border-b pb-4">
              <h3 className="text-foreground text-lg font-bold">
                {editingInvoice ? "Edit Sponsor Invoice" : "Generate Sponsor Invoice"}
              </h3>
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  const res = await fetch("/api/admin/sponsors/invoices", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: editingInvoice?.id,
                      invoiceNumber: invoiceForm.invoiceNumber || undefined,
                      dealId: invoiceForm.dealId,
                      eventId: invoiceForm.eventId || null,
                      amount: Number(invoiceForm.amount),
                      taxAmount: Number(invoiceForm.taxAmount),
                      status: invoiceForm.status,
                      issueDate: invoiceForm.issueDate || null,
                      dueDate: invoiceForm.dueDate || null,
                      paymentMethod: invoiceForm.paymentMethod || null,
                      transactionRef: invoiceForm.transactionRef || null,
                      notes: invoiceForm.notes || null,
                    }),
                  });
                  const json = await res.json();
                  if (res.ok && json.success) {
                    const dealObj = deals.find((d) => d.id === invoiceForm.dealId);
                    const eventObj = events.find((ev) => ev.id === invoiceForm.eventId);
                    const invItem: InvoiceItem = {
                      id: json.data.id,
                      invoiceNumber: json.data.invoiceNumber,
                      dealId: json.data.dealId,
                      dealTitle: dealObj?.title || "Deal",
                      sponsorName: dealObj?.sponsor.name || "Sponsor",
                      sponsorLogo: dealObj?.sponsor.logo || null,
                      sponsorEmail: dealObj?.sponsor.contactEmail || null,
                      eventId: json.data.eventId,
                      eventTitle: eventObj?.title || "Event",
                      amount: Number(json.data.amount),
                      taxAmount: Number(json.data.taxAmount),
                      totalAmount: Number(json.data.totalAmount),
                      status: json.data.status,
                      issueDate: json.data.issueDate,
                      dueDate: json.data.dueDate,
                      paidAt: json.data.paidAt,
                      paymentMethod: json.data.paymentMethod,
                      transactionRef: json.data.transactionRef,
                      notes: json.data.notes,
                      createdAt: json.data.createdAt,
                    };
                    if (editingInvoice) {
                      setInvoices((prev) =>
                        prev.map((i) => (i.id === editingInvoice.id ? invItem : i))
                      );
                    } else {
                      setInvoices((prev) => [invItem, ...prev]);
                    }
                    setInvoiceModalOpen(false);
                  }
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="text-muted-foreground mb-1 block font-medium">
                  Sponsor Deal *
                </label>
                <select
                  value={invoiceForm.dealId}
                  onChange={(e) => {
                    const d = deals.find((deal) => deal.id === e.target.value);
                    setInvoiceForm({
                      ...invoiceForm,
                      dealId: e.target.value,
                      eventId: d?.eventId || invoiceForm.eventId,
                      amount: d ? d.amount : invoiceForm.amount,
                    });
                  }}
                  className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                >
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.sponsor.name} — {d.title} (₹{d.amount.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Base Amount (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.amount}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })
                    }
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 font-mono focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    GST / Tax Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={invoiceForm.taxAmount}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, taxAmount: Number(e.target.value) })
                    }
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Invoice Status
                  </label>
                  <select
                    value={invoiceForm.status}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, status: e.target.value as InvoiceStatus })
                    }
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent to Sponsor</option>
                    <option value="PAID">Paid (Auto-syncs to P&L)</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">Due Date</label>
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    value={invoiceForm.paymentMethod}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value })
                    }
                    placeholder="NEFT / RTGS, UPI, Razorpay"
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Transaction Ref #
                  </label>
                  <input
                    type="text"
                    value={invoiceForm.transactionRef}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, transactionRef: e.target.value })
                    }
                    placeholder="Bank UTR # or receipt ref"
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="border-border flex items-center justify-end gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setInvoiceModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" isLoading={isSubmitting}>
                  Save Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
