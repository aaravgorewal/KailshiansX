import { db } from "@/lib/db";

export interface TechTalkFilterOptions {
  tab?: "all" | "upcoming" | "past";
  query?: string;
  category?: string;
}

export async function getTechTalks(options: TechTalkFilterOptions = {}) {
  const { tab = "all", query = "", category } = options;
  const now = new Date();
  const trimmed = query.trim();

  // If query is provided, execute Postgres Full-Text Search
  if (trimmed) {
    const searchPattern = `%${trimmed}%`;

    // Postgres Full-Text Search combined with ILIKE across topic, overview, speaker, host partner, and resource tags
    const matchingRows: Array<{ id: string }> = await db.$queryRaw`
      SELECT DISTINCT e.id
      FROM "Event" e
      LEFT JOIN "EventSpeaker" es ON es."eventId" = e.id
      LEFT JOIN "Speaker" s ON s.id = es."speakerId"
      LEFT JOIN "EventPartner" ep ON ep."eventId" = e.id
      LEFT JOIN "Partner" p ON p.id = ep."partnerId"
      LEFT JOIN "TechTalkResource" r ON r."eventId" = e.id
      WHERE e.type = 'TECH_TALK'
        AND e.status = 'PUBLISHED'
        AND e."deletedAt" IS NULL
        AND (
          to_tsvector('english', coalesce(e.title, '') || ' ' || coalesce(e.overview, '')) @@ plainto_tsquery('english', ${trimmed})
          OR e.title ILIKE ${searchPattern}
          OR e.overview ILIKE ${searchPattern}
          OR s.name ILIKE ${searchPattern}
          OR s.organisation ILIKE ${searchPattern}
          OR p.name ILIKE ${searchPattern}
          OR EXISTS (
            SELECT 1 FROM unnest(r.tags) AS tag WHERE tag ILIKE ${searchPattern}
          )
        )
      ORDER BY e.id
    `;

    const matchedIds = matchingRows.map((r) => r.id);
    if (matchedIds.length === 0) {
      return {
        talks: [],
        counts: {
          upcoming: 0,
          past: 0,
          total: 0,
        },
      };
    }

    const talks = await db.event.findMany({
      where: {
        id: { in: matchedIds },
        type: "TECH_TALK",
        status: "PUBLISHED",
        deletedAt: null,
        ...(tab === "upcoming" ? { startDate: { gte: now } } : {}),
        ...(tab === "past" ? { startDate: { lt: now } } : {}),
        ...(category && category !== "ALL" ? { category } : {}),
      },
      include: {
        city: true,
        speakers: { include: { speaker: true } },
        partners: { include: { partner: true } },
        ticketTypes: true,
        techTalkResource: { include: { speaker: true } },
      },
      orderBy: tab === "past" ? { startDate: "desc" } : { startDate: "asc" },
    });

    return {
      talks,
      counts: {
        upcoming: talks.filter((t) => t.startDate >= now).length,
        past: talks.filter((t) => t.startDate < now).length,
        total: talks.length,
      },
    };
  }

  // Standard listing without query
  const talks = await db.event.findMany({
    where: {
      type: "TECH_TALK",
      status: "PUBLISHED",
      deletedAt: null,
      ...(tab === "upcoming" ? { startDate: { gte: now } } : {}),
      ...(tab === "past" ? { startDate: { lt: now } } : {}),
      ...(category && category !== "ALL" ? { category } : {}),
    },
    include: {
      city: true,
      speakers: { include: { speaker: true } },
      partners: { include: { partner: true } },
      ticketTypes: true,
      techTalkResource: { include: { speaker: true } },
    },
    orderBy: tab === "past" ? { startDate: "desc" } : { startDate: "asc" },
  });

  const [upcomingCount, pastCount] = await Promise.all([
    db.event.count({
      where: {
        type: "TECH_TALK",
        status: "PUBLISHED",
        deletedAt: null,
        startDate: { gte: now },
      },
    }),
    db.event.count({
      where: {
        type: "TECH_TALK",
        status: "PUBLISHED",
        deletedAt: null,
        startDate: { lt: now },
      },
    }),
  ]);

  return {
    talks,
    counts: {
      upcoming: upcomingCount,
      past: pastCount,
      total: upcomingCount + pastCount,
    },
  };
}

export async function getTechTalkBySlug(slug: string) {
  const talk = await db.event.findUnique({
    where: { slug },
    include: {
      city: true,
      speakers: { include: { speaker: true } },
      partners: { include: { partner: true } },
      ticketTypes: true,
      techTalkResource: { include: { speaker: true } },
      galleryAlbums: {
        include: {
          images: {
            take: 8,
          },
        },
      },
    },
  });

  if (!talk || talk.type !== "TECH_TALK" || talk.deletedAt) {
    return null;
  }

  // Fetch 2-3 related tech talks
  const relatedTalks = await db.event.findMany({
    where: {
      type: "TECH_TALK",
      status: "PUBLISHED",
      deletedAt: null,
      id: { not: talk.id },
    },
    include: {
      speakers: { include: { speaker: true } },
      partners: { include: { partner: true } },
      techTalkResource: true,
    },
    take: 3,
    orderBy: { startDate: "desc" },
  });

  return {
    talk,
    relatedTalks,
  };
}
