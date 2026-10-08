import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SectionHeader } from "@/components/common/SectionHeader";
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

  const title = `Register: ${event.title} | KailshiansX`;
  const description = `Claim your pass for ${event.title}. Verified developer gatherings across India.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: event.coverImage ? [{ url: event.coverImage }] : undefined,
    },
  };
}

export default async function EventRegisterPage({ params, searchParams }: EventRegisterPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const preselectedTierId = typeof sParams.tier === "string" ? sParams.tier : undefined;

  const [event, session] = await Promise.all([
    db.event.findUnique({
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
    }),
    auth(),
  ]);

  if (!event || event.status === "DRAFT" || event.deletedAt) {
    notFound();
  }

  // Prefill from signed-in user if available
  let prefilledUser: { name: string; email: string; phone: string; college: string } | undefined;
  if (session?.user?.id) {
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        registrations: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { college: true, phone: true },
        },
      },
    });

    if (dbUser) {
      prefilledUser = {
        name: dbUser.name || session.user.name || "",
        email: dbUser.email || session.user.email || "",
        phone: dbUser.phone || dbUser.registrations[0]?.phone || "",
        college: dbUser.registrations[0]?.college || "",
      };
    }
  } else if (session?.user) {
    prefilledUser = {
      name: session.user.name || "",
      email: session.user.email || "",
      phone: "",
      college: "",
    };
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
            prefilledUser={prefilledUser}
          />
        </div>
      </main>
    </div>
  );
}
