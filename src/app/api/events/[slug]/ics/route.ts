import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateIcs } from "@/lib/calendar";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await db.event.findUnique({
    where: { slug },
    include: { city: true },
  });

  if (!event || event.status === "DRAFT" || event.deletedAt) {
    return new NextResponse("Event not found", { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

  const icsContent = generateIcs({
    title: event.title,
    description: event.overview,
    slug: event.slug,
    startDate: event.startDate,
    endDate: event.endDate,
    venue: event.venue,
    venueAddress: event.venueAddress,
    cityName: event.city?.name,
    appUrl,
  });

  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
