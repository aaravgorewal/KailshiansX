"use client";

// src/components/admin/pnl/AdminPnLClient.tsx
// Complete Event P&L Dashboard implementing :
// 1. Revenue: Tickets (auto-synced), Sponsorship (CRM-synced), Other.
// 2. Expenses: Venue, Travel, Food, Swag, Marketing, Printing, Operations, Logistics, Other.
// 3. Financial Outputs: Total Revenue, Total Expense, Net Profit/Loss, Profit Margin (per event & across series).
// 4. Exports: One-click CSV and executive PDF statement exports.

import * as React from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RevenueCategory, ExpenseCategory } from "@prisma/client";
import type { EventPnLSummary, SeriesPnLSummary } from "@/server/pnl/service";

export interface EventOption {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  seriesId: string | null;
}

export interface SeriesOption {
  id: string;
  name: string;
  slug: string;
  kind: string;
}

interface Props {
  initialEventPnL: EventPnLSummary | null;
  events: EventOption[];
  seriesList: SeriesOption[];
}

export function AdminPnLClient({ initialEventPnL, events, seriesList }: Props) {
  // Mode: "EVENT" or "SERIES"
  const [viewMode, setViewMode] = React.useState<"EVENT" | "SERIES">("EVENT");
  const [selectedEventId, setSelectedEventId] = React.useState<string>(
    initialEventPnL?.eventId || events[0]?.id || ""
  );
  const [selectedSeriesId, setSelectedSeriesId] = React.useState<string>(seriesList[0]?.id || "");

  const [pnlData, setPnlData] = React.useState<EventPnLSummary | null>(initialEventPnL);
  const [seriesData, setSeriesData] = React.useState<SeriesPnLSummary | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [syncingTickets, setSyncingTickets] = React.useState(false);
  const [syncMessage, setSyncMessage] = React.useState<string | null>(null);

  // Active ledger tab
  const [activeLedger, setActiveLedger] = React.useState<"REVENUE" | "EXPENSES">("REVENUE");

  // Revenue Modal State
  const [revenueModalOpen, setRevenueModalOpen] = React.useState(false);
  const [editingRevenueId, setEditingRevenueId] = React.useState<string | null>(null);
  const [revenueForm, setRevenueForm] = React.useState({
    category: "SPONSORSHIP" as RevenueCategory,
    description: "",
    amount: 25000,
    receivedAt: new Date().toISOString().slice(0, 10),
    source: "Direct Sponsorship",
    notes: "",
  });

  // Expense Modal State
  const [expenseModalOpen, setExpenseModalOpen] = React.useState(false);
  const [editingExpenseId, setEditingExpenseId] = React.useState<string | null>(null);
  const [expenseForm, setExpenseForm] = React.useState({
    category: "VENUE" as ExpenseCategory,
    description: "",
    amount: 15000,
    paidAt: new Date().toISOString().slice(0, 10),
    payee: "",
    receiptUrl: "",
    referenceNo: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch Event P&L when selected event changes
  React.useEffect(() => {
    if (viewMode !== "EVENT" || !selectedEventId) return;
    let isCancelled = false;

    fetch(`/api/admin/pnl?eventId=${selectedEventId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isCancelled && json.success && json.data) {
          setPnlData(json.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedEventId, viewMode]);

  // Fetch Series P&L when series changes or series mode activated
  React.useEffect(() => {
    if (viewMode !== "SERIES" || !selectedSeriesId) return;
    let isCancelled = false;

    fetch(`/api/admin/pnl?seriesId=${selectedSeriesId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isCancelled && json.success && json.data) {
          setSeriesData(json.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedSeriesId, viewMode]);

  // Handle ticket auto-sync
  const handleSyncTickets = async () => {
    if (!selectedEventId) return;
    setSyncingTickets(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/admin/pnl/sync-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEventId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSyncMessage(json.message);
        // Refresh P&L
        const updated = await fetch(`/api/admin/pnl?eventId=${selectedEventId}`).then((r) =>
          r.json()
        );
        if (updated.success) setPnlData(updated.data);
      } else {
        alert(json.error || "Failed to sync ticket revenue");
      }
    } catch (err) {
      console.error(err);
      alert("Error syncing ticket revenue");
    } finally {
      setSyncingTickets(false);
    }
  };

  // Save Revenue Item
  const handleSaveRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/pnl/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingRevenueId || undefined,
          eventId: selectedEventId,
          category: revenueForm.category,
          description: revenueForm.description,
          amount: Number(revenueForm.amount),
          receivedAt: revenueForm.receivedAt || null,
          source: revenueForm.source || null,
          notes: revenueForm.notes || null,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setRevenueModalOpen(false);
        // Refresh P&L
        const updated = await fetch(`/api/admin/pnl?eventId=${selectedEventId}`).then((r) =>
          r.json()
        );
        if (updated.success) setPnlData(updated.data);
      } else {
        alert(json.error || "Failed to save revenue item");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Revenue Item
  const handleDeleteRevenue = async (id: string) => {
    if (!confirm("Are you sure you want to remove this revenue item?")) return;
    try {
      const res = await fetch(`/api/admin/pnl/revenue?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = await fetch(`/api/admin/pnl?eventId=${selectedEventId}`).then((r) =>
          r.json()
        );
        if (updated.success) setPnlData(updated.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Expense Item
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/pnl/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingExpenseId || undefined,
          eventId: selectedEventId,
          category: expenseForm.category,
          description: expenseForm.description,
          amount: Number(expenseForm.amount),
          paidAt: expenseForm.paidAt || null,
          payee: expenseForm.payee || null,
          receiptUrl: expenseForm.receiptUrl || null,
          referenceNo: expenseForm.referenceNo || null,
          notes: expenseForm.notes || null,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setExpenseModalOpen(false);
        // Refresh P&L
        const updated = await fetch(`/api/admin/pnl?eventId=${selectedEventId}`).then((r) =>
          r.json()
        );
        if (updated.success) setPnlData(updated.data);
      } else {
        alert(json.error || "Failed to save expense item");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Expense Item
  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to remove this expense item?")) return;
    try {
      const res = await fetch(`/api/admin/pnl/expenses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = await fetch(`/api/admin/pnl?eventId=${selectedEventId}`).then((r) =>
          r.json()
        );
        if (updated.success) setPnlData(updated.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── HEADER & CONTROLS ───────────────────────────────────────────── */}
      <div className="border-border flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div>
          <div className="border-success/20 bg-success/10 text-success mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold">
            <DollarSign className="h-3.5 w-3.5" />
            <span>· Event Profit & Loss Intelligence</span>
            {loading && <RefreshCw className="text-success h-3 w-3 animate-spin" />}
          </div>
          <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
            Revenue & Event P&L Control Room
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Track auto-synced ticket sales, corporate sponsorships, and 9 categories of operations
            expenses. Analyze margins per event and across series.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="bg-card border-border flex items-center gap-1 rounded-xl border p-1">
            <button
              id="mode-event-pnl"
              onClick={() => {
                if (viewMode !== "EVENT") {
                  setLoading(true);
                  setViewMode("EVENT");
                }
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "EVENT"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Event P&L
            </button>
            <button
              id="mode-series-pnl"
              onClick={() => {
                if (viewMode !== "SERIES") {
                  setLoading(true);
                  setViewMode("SERIES");
                }
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "SERIES"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Series Rollup
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <a
              id="btn-export-pnl-csv"
              href={`/api/admin/pnl/export/csv?${viewMode === "EVENT" ? `eventId=${selectedEventId}` : `seriesId=${selectedSeriesId}`}`}
              download
              className="bg-card hover:bg-muted border-border text-foreground hover:text-foreground flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors"
            >
              <FileSpreadsheet className="text-success h-3.5 w-3.5" />
              <span>CSV</span>
            </a>

            <a
              id="btn-export-pnl-pdf"
              href={`/api/admin/pnl/export/pdf?${viewMode === "EVENT" ? `eventId=${selectedEventId}` : `seriesId=${selectedSeriesId}`}`}
              download
              className="bg-primary-hover hover:bg-primary text-primary-foreground flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>PDF Statement</span>
            </a>
          </div>
        </div>
      </div>

      {/* ─── SELECTOR & SYNC BAR ─────────────────────────────────────────── */}
      <div className="bg-card border-border flex flex-col items-center justify-between gap-4 rounded-2xl border p-4 sm:flex-row">
        {viewMode === "EVENT" ? (
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <label className="text-muted-foreground text-xs font-semibold whitespace-nowrap">
              Select Event:
            </label>
            <select
              id="select-pnl-event"
              value={selectedEventId}
              onChange={(e) => {
                setLoading(true);
                setSelectedEventId(e.target.value);
              }}
              className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2 text-xs font-medium focus:outline-hidden sm:w-96"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({new Date(e.startDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <label className="text-muted-foreground text-xs font-semibold whitespace-nowrap">
              Select Series:
            </label>
            <select
              id="select-pnl-series"
              value={selectedSeriesId}
              onChange={(e) => {
                setLoading(true);
                setSelectedSeriesId(e.target.value);
              }}
              className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2 text-xs font-medium focus:outline-hidden sm:w-96"
            >
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.kind})
                </option>
              ))}
            </select>
          </div>
        )}

        {viewMode === "EVENT" && (
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            {syncMessage && (
              <span className="text-success max-w-xs truncate text-xs font-medium">
                {syncMessage}
              </span>
            )}
            <Button
              id="btn-sync-tickets"
              variant="outline"
              size="sm"
              isLoading={syncingTickets}
              onClick={handleSyncTickets}
              className="border-border text-foreground hover:text-foreground"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              <span>Sync Ticket Sales</span>
            </Button>
          </div>
        )}
      </div>

      {/* ─── EVENT MODE: P&L DASHBOARD ────────────────────────────────────── */}
      {viewMode === "EVENT" && pnlData && (
        <div className="space-y-8">
          {/* KPI CARDS */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* Total Revenue */}
            <div className="bg-card border-border rounded-2xl border p-5">
              <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
                <span>Total Revenue</span>
                <TrendingUp className="text-success h-4 w-4" />
              </div>
              <div className="text-foreground font-mono text-2xl font-black sm:text-3xl">
                ₹{pnlData.revenue.totalRevenue.toLocaleString("en-IN")}
              </div>
              <div className="text-muted-foreground mt-2 space-y-0.5 text-xs">
                <div>🎟️ Tickets: ₹{pnlData.revenue.ticketRevenue.toLocaleString("en-IN")}</div>
                <div>
                  🤝 Sponsorship: ₹{pnlData.revenue.sponsorshipRevenue.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-card border-border rounded-2xl border p-5">
              <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
                <span>Total Expenses</span>
                <TrendingDown className="text-destructive h-4 w-4" />
              </div>
              <div className="text-foreground font-mono text-2xl font-black sm:text-3xl">
                ₹{pnlData.expenses.totalExpense.toLocaleString("en-IN")}
              </div>
              <div className="text-muted-foreground mt-2 text-xs">
                Across {pnlData.expenses.items.length} verified expense receipts
              </div>
            </div>

            {/* Net Profit / Loss */}
            <div
              className={`rounded-2xl border p-5 ${
                pnlData.metrics.isProfitable
                  ? "border-success/30 bg-success/10"
                  : "border-destructive/30 bg-destructive/10"
              }`}
            >
              <div className="mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
                <span
                  className={pnlData.metrics.isProfitable ? "text-success" : "text-destructive"}
                >
                  Net {pnlData.metrics.isProfitable ? "Profit" : "Loss"}
                </span>
                {pnlData.metrics.isProfitable ? (
                  <CheckCircle2 className="text-success h-4 w-4" />
                ) : (
                  <AlertTriangle className="text-destructive h-4 w-4" />
                )}
              </div>
              <div
                className={`font-mono text-2xl font-black sm:text-3xl ${
                  pnlData.metrics.isProfitable ? "text-success" : "text-destructive"
                }`}
              >
                {pnlData.metrics.netProfitLoss >= 0 ? "+" : ""}₹
                {pnlData.metrics.netProfitLoss.toLocaleString("en-IN")}
              </div>
              <div className="mt-2 text-xs font-medium">
                {pnlData.metrics.isProfitable ? (
                  <span className="text-success">Positive operating margin</span>
                ) : (
                  <span className="text-destructive">Operating below break-even</span>
                )}
              </div>
            </div>

            {/* Profit Margin */}
            <div className="bg-card border-border rounded-2xl border p-5">
              <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-semibold tracking-wider uppercase">
                <span>Profit Margin</span>
                <span className="text-primary font-mono font-bold">%</span>
              </div>
              <div
                className={`font-mono text-2xl font-black sm:text-3xl ${
                  pnlData.metrics.profitMargin >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {pnlData.metrics.profitMargin.toFixed(1)}%
              </div>
              <div className="text-muted-foreground mt-2 text-xs">
                Break-even ratio: {pnlData.metrics.breakEvenRatio}x
              </div>
            </div>
          </div>

          {/* ─── EXPENSE CATEGORIES BREAKDOWN BARS ──────────────────────────── */}
          <div className="bg-card border-border space-y-4 rounded-2xl border p-6">
            <h3 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Budget Distribution by Category
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {(
                [
                  "VENUE",
                  "TRAVEL",
                  "FOOD",
                  "SWAG",
                  "MARKETING",
                  "PRINTING",
                  "OPERATIONS",
                  "LOGISTICS",
                  "OTHER",
                ] as ExpenseCategory[]
              ).map((cat) => {
                const amount = pnlData.expenses.categoryBreakdown[cat] || 0;
                const percentage =
                  pnlData.expenses.totalExpense > 0
                    ? Math.round((amount / pnlData.expenses.totalExpense) * 100)
                    : 0;

                return (
                  <div
                    key={cat}
                    className="bg-background border-border space-y-1.5 rounded-xl border p-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-semibold">{cat}</span>
                      <span className="text-muted-foreground font-mono text-xs">{percentage}%</span>
                    </div>
                    <div className="text-foreground font-mono text-sm font-bold">
                      ₹{amount.toLocaleString("en-IN")}
                    </div>
                    <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── LEDGER TABLES: REVENUE VS EXPENSES ───────────────────────── */}
          <div className="space-y-4">
            <div className="border-border flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <button
                  id="tab-revenue-ledger"
                  onClick={() => setActiveLedger("REVENUE")}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeLedger === "REVENUE"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Revenue Ledger ({pnlData.revenue.items.length})
                </button>
                <button
                  id="tab-expense-ledger"
                  onClick={() => setActiveLedger("EXPENSES")}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    activeLedger === "EXPENSES"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Expense Ledger ({pnlData.expenses.items.length})
                </button>
              </div>

              {activeLedger === "REVENUE" ? (
                <Button
                  id="btn-add-revenue"
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setEditingRevenueId(null);
                    setRevenueForm({
                      category: "SPONSORSHIP",
                      description: "",
                      amount: 25000,
                      receivedAt: new Date().toISOString().slice(0, 10),
                      source: "Direct Sponsorship",
                      notes: "",
                    });
                    setRevenueModalOpen(true);
                  }}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  <span>Add Revenue</span>
                </Button>
              ) : (
                <Button
                  id="btn-add-expense"
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setEditingExpenseId(null);
                    setExpenseForm({
                      category: "VENUE",
                      description: "",
                      amount: 15000,
                      paidAt: new Date().toISOString().slice(0, 10),
                      payee: "",
                      receiptUrl: "",
                      referenceNo: "",
                      notes: "",
                    });
                    setExpenseModalOpen(true);
                  }}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  <span>Add Expense</span>
                </Button>
              )}
            </div>

            {/* REVENUE TABLE */}
            {activeLedger === "REVENUE" && (
              <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-background text-muted-foreground border-border border-b font-semibold tracking-wider uppercase">
                      <tr>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Source / Origin</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Amount (INR)</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {pnlData.revenue.items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-muted-foreground py-8 text-center italic">
                            No revenue records found for this event.
                          </td>
                        </tr>
                      ) : (
                        pnlData.revenue.items.map((rev) => (
                          <tr key={rev.id} className="hover:bg-muted transition-colors">
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  rev.category === "TICKET"
                                    ? "border-success/30 bg-success/15 text-success border"
                                    : rev.category === "SPONSORSHIP"
                                      ? "border-primary/30 bg-primary/15 text-primary border"
                                      : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {rev.category}
                              </span>
                            </td>
                            <td className="text-foreground px-4 py-3 font-semibold">
                              {rev.description || "General Revenue"}
                              {rev.notes && (
                                <p className="text-muted-foreground text-xs font-normal">
                                  {rev.notes}
                                </p>
                              )}
                            </td>
                            <td className="text-muted-foreground px-4 py-3">
                              {rev.isAutoSynced ? (
                                <span className="text-primary inline-flex items-center gap-1 text-xs font-semibold">
                                  <RefreshCw className="h-3 w-3" />
                                  <span>{rev.source}</span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  {rev.source || "Manual Entry"}
                                </span>
                              )}
                            </td>
                            <td className="text-muted-foreground px-4 py-3">
                              {rev.receivedAt ? new Date(rev.receivedAt).toLocaleDateString() : "—"}
                            </td>
                            <td className="text-success px-4 py-3 font-mono font-bold">
                              ₹{rev.amount.toLocaleString("en-IN")}
                            </td>
                            <td className="space-x-2 px-4 py-3 text-right">
                              {!rev.isAutoSynced && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingRevenueId(rev.id);
                                      setRevenueForm({
                                        category: rev.category,
                                        description: rev.description || "",
                                        amount: rev.amount,
                                        receivedAt: rev.receivedAt
                                          ? rev.receivedAt.slice(0, 10)
                                          : "",
                                        source: rev.source || "",
                                        notes: rev.notes || "",
                                      });
                                      setRevenueModalOpen(true);
                                    }}
                                    className="text-primary hover:text-primary font-semibold"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRevenue(rev.id)}
                                    className="text-destructive font-semibold hover:opacity-80"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* EXPENSES TABLE */}
            {activeLedger === "EXPENSES" && (
              <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-background text-muted-foreground border-border border-b font-semibold tracking-wider uppercase">
                      <tr>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Payee / Vendor</th>
                        <th className="px-4 py-3">Bill / Ref #</th>
                        <th className="px-4 py-3">Paid Date</th>
                        <th className="px-4 py-3">Amount (INR)</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {pnlData.expenses.items.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-muted-foreground py-8 text-center italic">
                            No expenses logged yet.
                          </td>
                        </tr>
                      ) : (
                        pnlData.expenses.items.map((exp) => (
                          <tr key={exp.id} className="hover:bg-muted transition-colors">
                            <td className="px-4 py-3">
                              <span className="bg-muted text-muted-foreground border-border inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold">
                                {exp.category}
                              </span>
                            </td>
                            <td className="text-foreground px-4 py-3 font-semibold">
                              {exp.description || "General Expense"}
                              {exp.notes && (
                                <p className="text-muted-foreground text-xs font-normal">
                                  {exp.notes}
                                </p>
                              )}
                            </td>
                            <td className="text-muted-foreground px-4 py-3">{exp.payee || "—"}</td>
                            <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                              {exp.referenceNo ? (
                                exp.receiptUrl ? (
                                  <a
                                    href={exp.receiptUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary inline-flex items-center gap-1 hover:underline"
                                  >
                                    <span>{exp.referenceNo}</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : (
                                  exp.referenceNo
                                )
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="text-muted-foreground px-4 py-3">
                              {exp.paidAt ? new Date(exp.paidAt).toLocaleDateString() : "—"}
                            </td>
                            <td className="text-destructive px-4 py-3 font-mono font-bold">
                              ₹{exp.amount.toLocaleString("en-IN")}
                            </td>
                            <td className="space-x-2 px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  setEditingExpenseId(exp.id);
                                  setExpenseForm({
                                    category: exp.category,
                                    description: exp.description || "",
                                    amount: exp.amount,
                                    paidAt: exp.paidAt ? exp.paidAt.slice(0, 10) : "",
                                    payee: exp.payee || "",
                                    receiptUrl: exp.receiptUrl || "",
                                    referenceNo: exp.referenceNo || "",
                                    notes: exp.notes || "",
                                  });
                                  setExpenseModalOpen(true);
                                }}
                                className="text-primary hover:text-primary font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(exp.id)}
                                className="text-destructive font-semibold hover:opacity-80"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── SERIES ROLLUP VIEW ──────────────────────────────────────────── */}
      {viewMode === "SERIES" && seriesData && (
        <div className="space-y-8">
          {/* Series Cumulative KPI Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="bg-card border-border rounded-2xl border p-5">
              <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Series Total Revenue
              </div>
              <div className="text-foreground font-mono text-2xl font-black sm:text-3xl">
                ₹{seriesData.seriesTotalRevenue.toLocaleString("en-IN")}
              </div>
              <div className="text-muted-foreground mt-2 text-xs">
                Across {seriesData.totalEditions} editions
              </div>
            </div>

            <div className="bg-card border-border rounded-2xl border p-5">
              <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Series Total Expenses
              </div>
              <div className="text-foreground font-mono text-2xl font-black sm:text-3xl">
                ₹{seriesData.seriesTotalExpense.toLocaleString("en-IN")}
              </div>
              <div className="text-muted-foreground mt-2 text-xs">Cumulative operations spend</div>
            </div>

            <div
              className={`rounded-2xl border p-5 ${
                seriesData.isProfitable
                  ? "border-success/30 bg-success/10"
                  : "border-destructive/30 bg-destructive/10"
              }`}
            >
              <div className="mb-2 text-xs font-semibold tracking-wider uppercase">
                <span className={seriesData.isProfitable ? "text-success" : "text-destructive"}>
                  Cumulative Net {seriesData.isProfitable ? "Profit" : "Loss"}
                </span>
              </div>
              <div
                className={`font-mono text-2xl font-black sm:text-3xl ${
                  seriesData.isProfitable ? "text-success" : "text-destructive"
                }`}
              >
                {seriesData.seriesNetProfitLoss >= 0 ? "+" : ""}₹
                {seriesData.seriesNetProfitLoss.toLocaleString("en-IN")}
              </div>
              <div className="mt-2 text-xs font-medium">Overall series health</div>
            </div>

            <div className="bg-card border-border rounded-2xl border p-5">
              <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Series Profit Margin
              </div>
              <div
                className={`font-mono text-2xl font-black sm:text-3xl ${
                  seriesData.seriesProfitMargin >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {seriesData.seriesProfitMargin.toFixed(1)}%
              </div>
              <div className="text-muted-foreground mt-2 text-xs">
                Weighted return on investment
              </div>
            </div>
          </div>

          {/* Editions Comparison Table */}
          <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border border-b p-4">
              <h3 className="text-foreground text-sm font-bold">
                {seriesData.seriesName} ({seriesData.seriesKind}) — Editions Financial Comparison
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-background text-muted-foreground border-border border-b font-semibold tracking-wider uppercase">
                  <tr>
                    <th className="px-4 py-3">Edition #</th>
                    <th className="px-4 py-3">Event Title</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Revenue (INR)</th>
                    <th className="px-4 py-3">Expense (INR)</th>
                    <th className="px-4 py-3">Net Profit/Loss</th>
                    <th className="px-4 py-3">Margin %</th>
                    <th className="px-4 py-3 text-right">View Event P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {seriesData.editions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-muted-foreground py-8 text-center italic">
                        No editions recorded for this series.
                      </td>
                    </tr>
                  ) : (
                    seriesData.editions.map((ed) => (
                      <tr key={ed.eventId} className="hover:bg-muted transition-colors">
                        <td className="text-primary px-4 py-3 font-mono font-bold">
                          Edition {ed.editionNo}
                        </td>
                        <td className="text-foreground px-4 py-3 font-semibold">{ed.eventTitle}</td>
                        <td className="text-muted-foreground px-4 py-3">
                          {new Date(ed.eventDate).toLocaleDateString()}
                        </td>
                        <td className="text-success px-4 py-3 font-mono font-bold">
                          ₹{ed.revenue.toLocaleString("en-IN")}
                        </td>
                        <td className="text-destructive px-4 py-3 font-mono font-bold">
                          ₹{ed.expense.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold">
                          <span
                            className={ed.netProfitLoss >= 0 ? "text-success" : "text-destructive"}
                          >
                            {ed.netProfitLoss >= 0 ? "+" : ""}₹
                            {ed.netProfitLoss.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold">
                          <span
                            className={ed.profitMargin >= 0 ? "text-primary" : "text-destructive"}
                          >
                            {ed.profitMargin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setLoading(true);
                              setSelectedEventId(ed.eventId);
                              setViewMode("EVENT");
                            }}
                            className="text-primary hover:text-primary font-semibold"
                          >
                            Inspect P&L →
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

      {/* ─── MODAL: ADD / EDIT REVENUE ────────────────────────────────────── */}
      {revenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-card border-border w-full max-w-lg space-y-5 rounded-3xl border p-6 shadow-2xl sm:p-8">
            <div className="border-border flex items-center justify-between border-b pb-4">
              <h3 className="text-foreground text-lg font-bold">
                {editingRevenueId ? "Edit Revenue Item" : "Add Revenue Item"}
              </h3>
              <button
                onClick={() => setRevenueModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRevenue} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">Category *</label>
                  <select
                    value={revenueForm.category}
                    onChange={(e) =>
                      setRevenueForm({
                        ...revenueForm,
                        category: e.target.value as RevenueCategory,
                      })
                    }
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  >
                    <option value="SPONSORSHIP">Sponsorship</option>
                    <option value="TICKET">Ticket Sales (Manual)</option>
                    <option value="MERCH">Merch / Swag Sales</option>
                    <option value="OTHER">Other Income</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Amount (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={revenueForm.amount}
                    onChange={(e) =>
                      setRevenueForm({ ...revenueForm, amount: Number(e.target.value) })
                    }
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={revenueForm.description}
                  onChange={(e) => setRevenueForm({ ...revenueForm, description: e.target.value })}
                  placeholder="e.g. AWS Cloud Credits Sponsorship, On-spot Ticket Registrations"
                  className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Source / Payer
                  </label>
                  <input
                    type="text"
                    value={revenueForm.source}
                    onChange={(e) => setRevenueForm({ ...revenueForm, source: e.target.value })}
                    placeholder="e.g. Direct Wire, Cash, Grant"
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Date Received
                  </label>
                  <input
                    type="date"
                    value={revenueForm.receivedAt}
                    onChange={(e) => setRevenueForm({ ...revenueForm, receivedAt: e.target.value })}
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">Notes</label>
                <textarea
                  rows={2}
                  value={revenueForm.notes}
                  onChange={(e) => setRevenueForm({ ...revenueForm, notes: e.target.value })}
                  placeholder="Payment reference # or notes..."
                  className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                />
              </div>

              <div className="border-border flex items-center justify-end gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setRevenueModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" isLoading={isSubmitting}>
                  Save Revenue
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT EXPENSE ────────────────────────────────────── */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-card border-border w-full max-w-lg space-y-5 rounded-3xl border p-6 shadow-2xl sm:p-8">
            <div className="border-border flex items-center justify-between border-b pb-4">
              <h3 className="text-foreground text-lg font-bold">
                {editingExpenseId ? "Edit Expense Item" : "Add Expense Item"}
              </h3>
              <button
                onClick={() => setExpenseModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Category () *
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        category: e.target.value as ExpenseCategory,
                      })
                    }
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  >
                    <option value="VENUE">Venue & Auditorium</option>
                    <option value="TRAVEL">Travel & Lodging</option>
                    <option value="FOOD">Food & Catering</option>
                    <option value="SWAG">Swag & Merchandise</option>
                    <option value="MARKETING">Marketing & Campaigns</option>
                    <option value="PRINTING">Printing & Standees</option>
                    <option value="OPERATIONS">Operations & AV Rentals</option>
                    <option value="LOGISTICS">Logistics & Shipping</option>
                    <option value="OTHER">Other Costs</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Amount (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })
                    }
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block font-medium">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="e.g. Auditorium Hall Rental 8 Hours, Delegate Badges & Lanyards"
                  className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Payee / Vendor
                  </label>
                  <input
                    type="text"
                    value={expenseForm.payee}
                    onChange={(e) => setExpenseForm({ ...expenseForm, payee: e.target.value })}
                    placeholder="e.g. Campus Facilities Office"
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Bill / Invoice Reference #
                  </label>
                  <input
                    type="text"
                    value={expenseForm.referenceNo}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, referenceNo: e.target.value })
                    }
                    placeholder="e.g. INV-9872"
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">Date Paid</label>
                  <input
                    type="date"
                    value={expenseForm.paidAt}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paidAt: e.target.value })}
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block font-medium">
                    Receipt URL
                  </label>
                  <input
                    type="url"
                    value={expenseForm.receiptUrl}
                    onChange={(e) => setExpenseForm({ ...expenseForm, receiptUrl: e.target.value })}
                    placeholder="https://..."
                    className="bg-background border-border focus:border-primary text-foreground w-full rounded-xl border px-3.5 py-2.5 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="border-border flex items-center justify-end gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setExpenseModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" isLoading={isSubmitting}>
                  Save Expense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
