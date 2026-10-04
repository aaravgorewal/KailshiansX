"use client";

// src/components/admin/sponsors/AdminSponsorCRMClient.tsx
// Comprehensive Sponsor CRM Client implementing PRD §22 & §23:
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
    color: "bg-surface-800 text-surface-300 border-surface-700",
  },
  {
    key: "INITIAL_CONTACT",
    label: "Initial Contact",
    color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  { key: "PITCHING", label: "Pitching", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  {
    key: "PROPOSAL_SENT",
    label: "Proposal Sent",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    key: "NEGOTIATION",
    label: "Negotiation",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    key: "CONTRACT_SIGNED",
    label: "Contract Signed",
    color: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  },
  {
    key: "WON",
    label: "Closed Won",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold",
  },
  { key: "LOST", label: "Closed Lost", color: "bg-red-500/10 text-red-400 border-red-500/20" },
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
      <div className="border-surface-800 flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div>
          <div className="bg-brand-500/10 border-brand-500/20 text-brand-400 mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold">
            <Building2 className="h-3.5 w-3.5" />
            <span>PRD §22 & §23 · Enterprise Sponsor CRM</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Sponsor CRM & Partnerships Pipeline
          </h1>
          <p className="text-surface-400 mt-1 text-xs sm:text-sm">
            Manage corporate partners, deal progression stages, deliverables fulfillment, and
            invoice settlement linked directly to events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/pnl">
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
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
        <div className="bg-surface-900/80 border-surface-800 rounded-2xl border p-4 sm:p-5">
          <div className="text-surface-400 mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Total Pipeline</span>
            <DollarSign className="text-brand-400 h-4 w-4" />
          </div>
          <div className="font-mono text-xl font-black text-white sm:text-2xl">
            ₹{pipelineMetrics.totalPipeline.toLocaleString("en-IN")}
          </div>
          <div className="text-surface-400 mt-1 text-[11px]">
            {pipelineMetrics.activeCount} active negotiation deals
          </div>
        </div>

        <div className="bg-surface-900/80 border-surface-800 rounded-2xl border p-4 sm:p-5">
          <div className="text-surface-400 mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Closed Won Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-mono text-xl font-black text-emerald-400 sm:text-2xl">
            ₹{pipelineMetrics.wonAmount.toLocaleString("en-IN")}
          </div>
          <div className="text-surface-400 mt-1 text-[11px]">
            {pipelineMetrics.wonCount} deals signed & committed
          </div>
        </div>

        <div className="bg-surface-900/80 border-surface-800 rounded-2xl border p-4 sm:p-5">
          <div className="text-surface-400 mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Deliverables Rate</span>
            <CheckCircle className="h-4 w-4 text-teal-400" />
          </div>
          <div className="font-mono text-xl font-black text-white sm:text-2xl">
            {pipelineMetrics.deliverablesFulfillmentRate}%
          </div>
          <div className="text-surface-400 mt-1 text-[11px]">
            {filteredDeliverables.filter((d) => d.status === "FULFILLED").length} of{" "}
            {filteredDeliverables.length} perks delivered
          </div>
        </div>

        <div className="bg-surface-900/80 border-surface-800 rounded-2xl border p-4 sm:p-5">
          <div className="text-surface-400 mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
            <span>Settled Invoices</span>
            <Receipt className="h-4 w-4 text-amber-400" />
          </div>
          <div className="font-mono text-xl font-black text-amber-400 sm:text-2xl">
            ₹{pipelineMetrics.paidInvoicesTotal.toLocaleString("en-IN")}
          </div>
          <div className="text-surface-400 mt-1 text-[11px]">Auto-synced into Event P&L</div>
        </div>
      </div>

      {/* ─── FILTERS & SUB-NAVIGATION ────────────────────────────────────── */}
      <div className="bg-surface-900/60 border-surface-800 flex flex-col items-center justify-between gap-4 rounded-2xl border p-3 sm:flex-row sm:p-4">
        {/* Navigation Tabs */}
        <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          <button
            id="tab-deals-pipeline"
            onClick={() => setActiveTab("PIPELINE")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "PIPELINE"
                ? "bg-brand-500 shadow-brand-500/20 text-white shadow-md"
                : "text-surface-400 hover:bg-surface-800/60 hover:text-white"
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
                ? "bg-brand-500 shadow-brand-500/20 text-white shadow-md"
                : "text-surface-400 hover:bg-surface-800/60 hover:text-white"
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
                ? "bg-brand-500 shadow-brand-500/20 text-white shadow-md"
                : "text-surface-400 hover:bg-surface-800/60 hover:text-white"
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
                ? "bg-brand-500 shadow-brand-500/20 text-white shadow-md"
                : "text-surface-400 hover:bg-surface-800/60 hover:text-white"
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Invoices ({invoices.length})</span>
          </button>
        </div>

        {/* Global Event Filter & Search */}
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="text-surface-500 pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface-950 border-surface-700/80 focus:border-brand-500 w-full rounded-xl border py-1.5 pr-3 pl-9 text-xs text-white focus:outline-hidden"
            />
          </div>

          <select
            id="select-filter-crm-event"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-surface-950 border-surface-700/80 text-surface-200 focus:border-brand-500 rounded-xl border px-3 py-1.5 text-xs font-medium focus:outline-hidden"
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
                    className="bg-surface-900/40 border-surface-800 flex max-h-[750px] min-w-[280px] flex-1 flex-col rounded-2xl border p-3"
                  >
                    {/* Column Header */}
                    <div className="border-surface-800/80 mb-3 flex items-center justify-between border-b px-1 pb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${col.color}`}
                        >
                          {col.label}
                        </span>
                        <span className="text-surface-400 text-xs font-semibold">
                          {stageDeals.length}
                        </span>
                      </div>
                      <span className="text-surface-400 font-mono text-[11px] font-medium">
                        ₹{colTotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Column Cards */}
                    <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                      {stageDeals.length === 0 ? (
                        <div className="text-surface-600 py-8 text-center text-xs italic">
                          No deals in this stage
                        </div>
                      ) : (
                        stageDeals.map((deal) => (
                          <div
                            key={deal.id}
                            className="bg-surface-900 border-surface-700/80 hover:border-brand-500/60 group space-y-3 rounded-xl border p-3.5 shadow-sm transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-brand-400 bg-brand-500/10 mb-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                  {deal.tier}
                                </span>
                                <h4 className="group-hover:text-brand-300 text-xs font-bold text-white transition-colors">
                                  {deal.title}
                                </h4>
                                <p className="text-surface-400 text-[11px] font-medium">
                                  {deal.sponsor.name}
                                </p>
                              </div>

                              <div className="text-right">
                                <div className="font-mono text-xs font-bold text-white">
                                  ₹{deal.amount.toLocaleString("en-IN")}
                                </div>
                                <div className="text-surface-500 text-[10px]">
                                  {deal.confidence}% conf.
                                </div>
                              </div>
                            </div>

                            {/* Linked Event Tag */}
                            <div className="text-surface-400 bg-surface-950 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px]">
                              <Calendar className="text-brand-400 h-3 w-3 shrink-0" />
                              <span className="truncate">
                                {deal.event?.title || "Global Sponsor"}
                              </span>
                            </div>

                            {/* Deliverables & Invoices Mini-badges */}
                            <div className="text-surface-400 border-surface-800/80 flex items-center justify-between border-t pt-2 text-[10px]">
                              <span>
                                Perks: {deal.deliverablesFulfilledCount}/{deal.deliverablesCount}
                              </span>
                              <span>
                                Inv: {deal.invoicesPaidCount}/{deal.invoicesCount} Paid
                              </span>
                            </div>

                            {/* Quick Stage Transitions */}
                            <div className="border-surface-800/60 flex items-center justify-between gap-1 border-t pt-2">
                              <select
                                value={deal.stage}
                                onChange={(e) =>
                                  handleStageChange(deal.id, e.target.value as SponsorDealStage)
                                }
                                className="bg-surface-950 border-surface-700 text-surface-300 rounded-md border px-2 py-1 text-[10px] focus:outline-hidden"
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
                                className="text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 rounded px-2 py-1 text-[10px] font-semibold"
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
            <h3 className="text-surface-400 text-sm font-bold tracking-wider uppercase">
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
                className="bg-surface-900 border-surface-800 hover:border-surface-700 flex flex-col justify-between space-y-4 rounded-2xl border p-5 shadow-sm transition-all"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-surface-800 border-surface-700 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border p-2">
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
                          <Building2 className="text-surface-500 h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{sponsor.name}</h4>
                        <span className="text-surface-400 bg-surface-800 mt-0.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold">
                          {sponsor.category || "Technology Partner"}
                        </span>
                      </div>
                    </div>

                    {sponsor.website && (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-surface-500 hover:text-brand-400 p-1 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  {/* Contact Person Details */}
                  {(sponsor.contactPerson || sponsor.contactEmail) && (
                    <div className="bg-surface-950 border-surface-800/80 mb-3 space-y-1.5 rounded-xl border p-3 text-xs">
                      {sponsor.contactPerson && (
                        <div className="text-surface-200 font-semibold">
                          {sponsor.contactPerson}
                        </div>
                      )}
                      {sponsor.contactEmail && (
                        <div className="text-surface-400 flex items-center gap-1.5">
                          <Mail className="text-surface-500 h-3 w-3" />
                          <span className="truncate">{sponsor.contactEmail}</span>
                        </div>
                      )}
                      {sponsor.contactPhone && (
                        <div className="text-surface-400 flex items-center gap-1.5">
                          <Phone className="text-surface-500 h-3 w-3" />
                          <span>{sponsor.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financial Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-surface-950/60 border-surface-800/60 rounded-xl border p-2.5">
                      <div className="text-surface-400 text-[10px] tracking-wider uppercase">
                        Deals
                      </div>
                      <div className="mt-0.5 font-bold text-white">
                        {sponsor.activeDealsCount} Active / {sponsor.wonDealsCount} Won
                      </div>
                    </div>
                    <div className="bg-surface-950/60 border-surface-800/60 rounded-xl border p-2.5">
                      <div className="text-surface-400 text-[10px] tracking-wider uppercase">
                        Won Value
                      </div>
                      <div className="mt-0.5 font-mono font-bold text-emerald-400">
                        ₹{sponsor.totalWonValue.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-surface-800 flex items-center justify-between border-t pt-3 text-xs">
                  <span className="text-surface-500 text-[11px]">
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
                    className="text-brand-400 hover:text-brand-300 font-semibold"
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
            <h3 className="text-surface-400 text-sm font-bold tracking-wider uppercase">
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

          <div className="bg-surface-900 border-surface-800 overflow-hidden rounded-2xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-950 text-surface-400 border-surface-800 border-b font-semibold tracking-wider uppercase">
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
                <tbody className="divide-surface-800 divide-y">
                  {filteredDeliverables.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-surface-500 py-8 text-center italic">
                        No deliverables found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDeliverables.map((del) => (
                      <tr key={del.id} className="hover:bg-surface-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              del.status === "FULFILLED"
                                ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                                : del.status === "IN_PROGRESS"
                                  ? "border border-sky-500/30 bg-sky-500/15 text-sky-400"
                                  : del.status === "WAIVED"
                                    ? "bg-surface-800 text-surface-400"
                                    : "border border-amber-500/30 bg-amber-500/15 text-amber-400"
                            }`}
                          >
                            {del.status}
                          </span>
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 font-semibold text-white">
                          {del.title}
                          {del.description && (
                            <p className="text-surface-400 truncate text-[11px] font-normal">
                              {del.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-surface-200 font-medium">{del.sponsorName}</div>
                          <div className="text-surface-400 max-w-xs truncate text-[10px]">
                            {del.dealTitle} ({del.dealTier})
                          </div>
                        </td>
                        <td className="text-surface-300 px-4 py-3">{del.eventTitle}</td>
                        <td className="text-surface-400 px-4 py-3">
                          {del.dueDate ? new Date(del.dueDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="text-surface-300 px-4 py-3">
                          {del.assignee || "Unassigned"}
                        </td>
                        <td className="px-4 py-3">
                          {del.proofUrl ? (
                            <a
                              href={del.proofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-400 inline-flex items-center gap-1 font-mono text-[11px] hover:underline"
                            >
                              <span>View Proof</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-surface-600">—</span>
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
                            className="text-brand-400 hover:text-brand-300 font-semibold"
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
            <h3 className="text-surface-400 text-sm font-bold tracking-wider uppercase">
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

          <div className="bg-surface-900 border-surface-800 overflow-hidden rounded-2xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-950 text-surface-400 border-surface-800 border-b font-semibold tracking-wider uppercase">
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
                <tbody className="divide-surface-800 divide-y">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-surface-500 py-8 text-center italic">
                        No invoices generated yet.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-surface-800/40 transition-colors">
                        <td className="text-brand-400 px-4 py-3 font-mono font-bold">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{inv.sponsorName}</div>
                          <div className="text-surface-400 text-[11px]">{inv.dealTitle}</div>
                        </td>
                        <td className="text-surface-300 px-4 py-3">{inv.eventTitle}</td>
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-white">
                            ₹{inv.totalAmount.toLocaleString("en-IN")}
                          </div>
                          {inv.taxAmount > 0 && (
                            <div className="text-surface-500 font-mono text-[10px]">
                              (Base: ₹{inv.amount.toLocaleString("en-IN")})
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              inv.status === "PAID"
                                ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                                : inv.status === "SENT"
                                  ? "border border-sky-500/30 bg-sky-500/15 text-sky-400"
                                  : inv.status === "OVERDUE"
                                    ? "border border-red-500/30 bg-red-500/15 text-red-400"
                                    : "bg-surface-800 text-surface-300"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="text-surface-400 px-4 py-3">
                          <div>Issued: {new Date(inv.issueDate).toLocaleDateString()}</div>
                          {inv.dueDate && (
                            <div className="text-surface-500 text-[11px]">
                              Due: {new Date(inv.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="text-surface-300 px-4 py-3">
                          {inv.paidAt ? (
                            <div>
                              <div className="font-medium text-emerald-400">
                                Paid on {new Date(inv.paidAt).toLocaleDateString()}
                              </div>
                              {inv.transactionRef && (
                                <div className="text-surface-500 font-mono text-[10px]">
                                  Ref: {inv.transactionRef}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-surface-500">Awaiting payment</span>
                          )}
                        </td>
                        <td className="space-x-2 px-4 py-3 text-right">
                          {inv.status !== "PAID" && (
                            <button
                              onClick={() => handleMarkInvoicePaid(inv)}
                              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
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
                            className="text-brand-400 hover:text-brand-300 text-xs font-semibold"
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
          <div className="bg-surface-900 border-surface-800 max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-3xl border p-6 shadow-2xl sm:p-8">
            <div className="border-surface-800 flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingDeal ? "Edit Sponsor Deal" : "Create New Sponsor Deal"}
              </h3>
              <button
                onClick={() => setDealModalOpen(false)}
                className="text-surface-500 text-lg font-bold hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDeal} className="space-y-4 text-xs">
              <div>
                <label className="text-surface-300 mb-1 block font-medium">Deal Title *</label>
                <input
                  type="text"
                  required
                  value={dealForm.title}
                  onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                  placeholder="e.g. Cloudflare - Title Sponsor PadharoX 01"
                  className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-300 mb-1 block font-medium">
                    Sponsor Company *
                  </label>
                  <select
                    value={dealForm.sponsorId}
                    onChange={(e) => setDealForm({ ...dealForm, sponsorId: e.target.value })}
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  >
                    {sponsors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Linked Event</label>
                  <select
                    value={dealForm.eventId}
                    onChange={(e) => setDealForm({ ...dealForm, eventId: e.target.value })}
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
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
                  <label className="text-surface-300 mb-1 block font-medium">Sponsor Tier</label>
                  <select
                    value={dealForm.tier}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, tier: e.target.value as PartnerTier })
                    }
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
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
                  <label className="text-surface-300 mb-1 block font-medium">Pipeline Stage</label>
                  <select
                    value={dealForm.stage}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, stage: e.target.value as SponsorDealStage })
                    }
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    value={dealForm.amount}
                    onChange={(e) => setDealForm({ ...dealForm, amount: Number(e.target.value) })}
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 font-mono text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Confidence %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={dealForm.confidence}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, confidence: Number(e.target.value) })
                    }
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Deal Owner</label>
                  <input
                    type="text"
                    value={dealForm.ownerName}
                    onChange={(e) => setDealForm({ ...dealForm, ownerName: e.target.value })}
                    placeholder="e.g. Aarav Gorewal"
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-surface-300 mb-1 block font-medium">
                  Notes / Scope Summary
                </label>
                <textarea
                  rows={3}
                  value={dealForm.notes}
                  onChange={(e) => setDealForm({ ...dealForm, notes: e.target.value })}
                  placeholder="Key agreement clauses, deliverables promised..."
                  className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                />
              </div>

              <div className="border-surface-800 flex items-center justify-end gap-3 border-t pt-4">
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
          <div className="bg-surface-900 border-surface-800 w-full max-w-lg space-y-5 rounded-3xl border p-6 shadow-2xl sm:p-8">
            <div className="border-surface-800 flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingSponsor ? "Edit Sponsor Partner" : "Add Sponsor Partner"}
              </h3>
              <button
                onClick={() => setSponsorModalOpen(false)}
                className="text-surface-500 text-lg font-bold hover:text-white"
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
                <label className="text-surface-300 mb-1 block font-medium">Company Name *</label>
                <input
                  type="text"
                  required
                  value={sponsorForm.name}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                  placeholder="e.g. Cloudflare, GitHub, JetBrains"
                  className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Category</label>
                  <input
                    type="text"
                    value={sponsorForm.category}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, category: e.target.value })}
                    placeholder="e.g. Cloud, DevTools, Web3"
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Website URL</label>
                  <input
                    type="url"
                    value={sponsorForm.website}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, website: e.target.value })}
                    placeholder="https://..."
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-surface-300 mb-1 block font-medium">Logo Image URL</label>
                <input
                  type="url"
                  value={sponsorForm.logo}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, logo: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Contact Person</label>
                  <input
                    type="text"
                    value={sponsorForm.contactPerson}
                    onChange={(e) =>
                      setSponsorForm({ ...sponsorForm, contactPerson: e.target.value })
                    }
                    placeholder="Name & Title"
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Contact Email</label>
                  <input
                    type="email"
                    value={sponsorForm.contactEmail}
                    onChange={(e) =>
                      setSponsorForm({ ...sponsorForm, contactEmail: e.target.value })
                    }
                    placeholder="sponsor@brand.com"
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Phone</label>
                  <input
                    type="text"
                    value={sponsorForm.contactPhone}
                    onChange={(e) =>
                      setSponsorForm({ ...sponsorForm, contactPhone: e.target.value })
                    }
                    placeholder="+91 ..."
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="border-surface-800 flex items-center justify-end gap-3 border-t pt-4">
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
          <div className="bg-surface-900 border-surface-800 w-full max-w-lg space-y-5 rounded-3xl border p-6 shadow-2xl sm:p-8">
            <div className="border-surface-800 flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingDeliverable ? "Edit Deliverable" : "Add Sponsor Deliverable"}
              </h3>
              <button
                onClick={() => setDeliverableModalOpen(false)}
                className="text-surface-500 text-lg font-bold hover:text-white"
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
                <label className="text-surface-300 mb-1 block font-medium">
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
                  className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Sponsor Deal *</label>
                  <select
                    value={deliverableForm.dealId}
                    onChange={(e) =>
                      setDeliverableForm({ ...deliverableForm, dealId: e.target.value })
                    }
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  >
                    {deals.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.sponsor.name} — {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Status</label>
                  <select
                    value={deliverableForm.status}
                    onChange={(e) =>
                      setDeliverableForm({
                        ...deliverableForm,
                        status: e.target.value as DeliverableStatus,
                      })
                    }
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
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
                  <label className="text-surface-300 mb-1 block font-medium">Due Date</label>
                  <input
                    type="date"
                    value={deliverableForm.dueDate}
                    onChange={(e) =>
                      setDeliverableForm({ ...deliverableForm, dueDate: e.target.value })
                    }
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Assignee</label>
                  <input
                    type="text"
                    value={deliverableForm.assignee}
                    onChange={(e) =>
                      setDeliverableForm({ ...deliverableForm, assignee: e.target.value })
                    }
                    placeholder="Team member name"
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-surface-300 mb-1 block font-medium">
                  Proof URL (Tweet, photo, recording)
                </label>
                <input
                  type="url"
                  value={deliverableForm.proofUrl}
                  onChange={(e) =>
                    setDeliverableForm({ ...deliverableForm, proofUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                />
              </div>

              <div className="border-surface-800 flex items-center justify-end gap-3 border-t pt-4">
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
          <div className="bg-surface-900 border-surface-800 w-full max-w-lg space-y-5 rounded-3xl border p-6 shadow-2xl sm:p-8">
            <div className="border-surface-800 flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingInvoice ? "Edit Sponsor Invoice" : "Generate Sponsor Invoice"}
              </h3>
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="text-surface-500 text-lg font-bold hover:text-white"
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
                <label className="text-surface-300 mb-1 block font-medium">Sponsor Deal *</label>
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
                  className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
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
                  <label className="text-surface-300 mb-1 block font-medium">
                    Base Amount (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.amount}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })
                    }
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 font-mono text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-surface-300 mb-1 block font-medium">
                    GST / Tax Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={invoiceForm.taxAmount}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, taxAmount: Number(e.target.value) })
                    }
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 font-mono text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Invoice Status</label>
                  <select
                    value={invoiceForm.status}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, status: e.target.value as InvoiceStatus })
                    }
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent to Sponsor</option>
                    <option value="PAID">Paid (Auto-syncs to P&L)</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Due Date</label>
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-surface-300 mb-1 block font-medium">Payment Method</label>
                  <input
                    type="text"
                    value={invoiceForm.paymentMethod}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value })
                    }
                    placeholder="NEFT / RTGS, UPI, Razorpay"
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-surface-300 mb-1 block font-medium">
                    Transaction Ref #
                  </label>
                  <input
                    type="text"
                    value={invoiceForm.transactionRef}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, transactionRef: e.target.value })
                    }
                    placeholder="Bank UTR # or receipt ref"
                    className="bg-surface-950 border-surface-700 focus:border-brand-500 w-full rounded-xl border px-3.5 py-2.5 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="border-surface-800 flex items-center justify-end gap-3 border-t pt-4">
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
