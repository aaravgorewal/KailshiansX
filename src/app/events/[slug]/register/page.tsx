import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";

import { db } from "@/lib/db";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDate } from "@/lib/format-date";
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

  const dateStr = formatDate(event.startDate);

  return (
    <div className="bg-background min-h-screen pb-28">
      {/* Top Breadcrumb Header */}
      <div className="border-border bg-card/40 border-b py-3.5">
        <div className="container-page text-muted-foreground flex items-center justify-between text-xs">
          <Link
            href={`/events/${event.slug}`}
            className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>Back to event details</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <Shield className="text-foreground size-3.5" aria-hidden="true" />
            <span>Encrypted reservation</span>
          </div>
        </div>
      </div>

      <main className="container-page pt-8">
        <div className="mx-auto max-w-xl space-y-6">
          {/* Header Summary */}
          <div className="text-center">
            <SectionHeader
              title="Claim Your Pass"
              description={`${event.title} · ${dateStr} · ${event.venue || "Venue"}${event.city ? `, ${event.city.name}` : ""}`}
              align="center"
            />
          </div>

          {/* Single Column Registration Form */}
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
