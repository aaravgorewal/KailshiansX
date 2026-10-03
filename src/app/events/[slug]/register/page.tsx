import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";

import { db } from "@/lib/db";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RegistrationFormClient } from "./RegistrationFormClient";

export const dynamic = "force-dynamic";

interface EventRegisterPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: EventRegisterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await db.event.findUnique({
    where: { slug },
  });

  if (!event) return { title: "Register | KailshiansX" };

  return {
    title: `Register: ${event.title} | KailshiansX`,
    description: `Claim your pass for ${event.title}. Verified developer gatherings across India.`,
  };
}

export default async function EventRegisterPage({ params, searchParams }: EventRegisterPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const preselectedTierId = typeof sParams.tier === "string" ? sParams.tier : undefined;

  const event = await db.event.findUnique({
    where: { slug },
    include: {
      city: true,
      ticketTypes: {
        orderBy: [{ price: "asc" }, { sortOrder: "asc" }],
        include: {
          _count: {
            select: {
              registrations: {
                where: {
                  status: { in: ["CONFIRMED", "PENDING"] },
                  deletedAt: null,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!event || event.status === "DRAFT" || event.deletedAt) {
    notFound();
  }

  // Format serializable ticket tiers
  const formattedTiers = event.ticketTypes.map((tier) => ({
    id: tier.id,
    name: tier.name,
    description: tier.description,
    price: Number(tier.price),
    quota: tier.quota,
    isFree: Number(tier.price) === 0,
    soldCount: tier._count.registrations,
  }));

  const dateStr = new Date(event.startDate).toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-surface-950 min-h-screen pb-28">
      {/* Top Breadcrumb Header */}
      <div className="border-surface-800/80 bg-surface-900/60 border-b py-4">
        <div className="container-page text-surface-400 flex items-center justify-between text-xs">
          <Link
            href={`/events/${event.slug}`}
            className="hover:text-surface-100 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to event details</span>
          </Link>

          <div className="text-surface-400 flex items-center gap-2">
            <Shield className="size-3.5 text-emerald-400" />
            <span>256-bit Encrypted Reservation</span>
          </div>
        </div>
      </div>

      <main className="container-page pt-10">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Header Summary */}
          <div className="space-y-2 text-center">
            <SectionHeader
              badge="Official Registration"
              title="Claim Your Gathering Pass"
              highlight="Gathering Pass"
              description={`${event.title} • ${dateStr} • ${event.venue || "Venue"}${event.city ? `, ${event.city.name}` : ""}`}
              align="center"
            />
          </div>

          {/* Multi-Step Client Form */}
          <RegistrationFormClient
            eventId={event.id}
            eventSlug={event.slug}
            eventTitle={event.title}
            eventDate={dateStr}
            venueName={event.venue}
            cityName={event.city?.name}
            ticketTypes={formattedTiers}
            preselectedTierId={preselectedTierId}
          />
        </div>
      </main>
    </div>
  );
}
