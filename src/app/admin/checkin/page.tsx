import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, QrCode, ShieldCheck } from "lucide-react";

import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import { getRecentCheckins } from "@/server/admin/checkin";
import { CheckinScannerClient } from "./CheckinScannerClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Venue Check-in & Scanner | KailshiansX Admin",
  description: "Scan attendee QR code passes and manage on-site event entry.",
};

export default async function AdminCheckinPage() {
  await requireAdmin();

  // Load published events for filtering
  const events = await db.event.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      startDate: true,
      city: { select: { name: true } },
    },
    orderBy: { startDate: "desc" },
    take: 25,
  });

  const formattedEvents = events.map((ev) => ({
    id: ev.id,
    title: ev.title,
    slug: ev.slug,
    startDate: ev.startDate.toISOString(),
    city: ev.city?.name || null,
  }));

  const recentCheckins = await getRecentCheckins();

  return (
    <div className="bg-surface-950 min-h-screen pb-20">
      {/* Top Header */}
      <div className="border-surface-800 bg-surface-900/60 border-b py-4">
        <div className="container-page flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="border-surface-700 bg-surface-800 text-surface-300 hover:text-surface-100 inline-flex size-8 items-center justify-center rounded-lg border transition"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <QrCode className="text-brand-400 size-5" />
                <h1 className="text-surface-50 text-lg font-bold">On-Site Venue Check-in</h1>
              </div>
              <p className="text-surface-400 text-xs">
                Authorized gate scanner for KailshiansX community events
              </p>
            </div>
          </div>

          <div className="border-surface-800 bg-surface-950 text-surface-400 flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Staff Mode (Encrypted HMAC Signature Verification)</span>
          </div>
        </div>
      </div>

      <div className="container-page pt-8">
        <CheckinScannerClient events={formattedEvents} recentCheckins={recentCheckins} />
      </div>
    </div>
  );
}
