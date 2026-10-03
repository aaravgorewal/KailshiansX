import { db } from "@/lib/db";

export interface WorkshopFilterOptions {
  tab?: "upcoming" | "past";
  category?: string;
}

export async function getWorkshops(options: WorkshopFilterOptions = {}) {
  const { tab = "upcoming", category } = options;
  const now = new Date();

  const isPast = tab === "past";

  const workshops = await db.event.findMany({
    where: {
      type: "WORKSHOP",
      status: "PUBLISHED",
      deletedAt: null,
      ...(isPast ? { startDate: { lt: now } } : { startDate: { gte: now } }),
      ...(category && category !== "ALL"
        ? {
            category: { equals: category, mode: "insensitive" },
          }
        : {}),
    },
    include: {
      city: true,
      speakers: {
        include: {
          speaker: true,
        },
      },
      partners: {
        include: {
          partner: true,
        },
      },
      ticketTypes: {
        orderBy: { price: "asc" },
      },
    },
    orderBy: isPast ? { startDate: "desc" } : { startDate: "asc" },
  });

  // Calculate upcoming and past totals
  const [upcomingCount, pastCount] = await Promise.all([
    db.event.count({
      where: {
        type: "WORKSHOP",
        status: "PUBLISHED",
        deletedAt: null,
        startDate: { gte: now },
      },
    }),
    db.event.count({
      where: {
        type: "WORKSHOP",
        status: "PUBLISHED",
        deletedAt: null,
        startDate: { lt: now },
      },
    }),
  ]);

  return {
    workshops,
    counts: {
      upcoming: upcomingCount,
      past: pastCount,
      total: upcomingCount + pastCount,
    },
  };
}
