import { db } from "@/lib/db";
import { type SeriesKind } from "@prisma/client";

export interface SeriesSummary {
  id: string;
  slug: string;
  name: string;
  kind: SeriesKind;
  tagline: string | null;
  description: string | null;
  coverImage: string | null;
  logo: string | null;
  city: string | null;
  region: string | null;
  purpose: string | null;
  stats: {
    totalEditions: number;
    totalAttendees: number;
    totalSpeakers: number;
    totalPartners: number;
    totalPrizePool?: string;
  };
  nextEdition: {
    editionNo: number;
    title: string;
    slug: string;
    startDate: Date;
    theme: string | null;
    venue: string | null;
    cityName: string | null;
  } | null;
  latestEdition: {
    editionNo: number;
    title: string;
    slug: string;
    startDate: Date;
    theme: string | null;
  } | null;
}

export async function getSeriesList(kind: SeriesKind): Promise<SeriesSummary[]> {
  const now = new Date();

  const seriesList = await db.series.findMany({
    where: {
      kind,
      deletedAt: null,
    },
    include: {
      editions: {
        include: {
          event: {
            include: {
              city: true,
              speakers: {
                include: { speaker: true },
              },
              partners: {
                include: { partner: true },
              },
              registrations: {
                select: { id: true, status: true },
              },
              hackathonDetail: true,
            },
          },
        },
        orderBy: { editionNo: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return seriesList.map((s) => {
    let totalAttendees = 0;
    const speakerIds = new Set<string>();
    const partnerIds = new Set<string>();

    let nextEdition: SeriesSummary["nextEdition"] = null;
    let latestEdition: SeriesSummary["latestEdition"] = null;

    // Sort editions for upcoming/latest computation
    const sortedEditions = [...s.editions].sort(
      (a, b) => b.event.startDate.getTime() - a.event.startDate.getTime()
    );

    if (sortedEditions.length > 0) {
      const latest = sortedEditions[0];
      latestEdition = {
        editionNo: latest.editionNo,
        title: latest.event.title,
        slug: latest.event.slug,
        startDate: latest.event.startDate,
        theme: latest.theme,
      };
    }

    // Find earliest upcoming edition
    const upcoming = s.editions
      .filter((e) => e.event.startDate >= now && e.event.status === "PUBLISHED")
      .sort((a, b) => a.event.startDate.getTime() - b.event.startDate.getTime());

    if (upcoming.length > 0) {
      const next = upcoming[0];
      nextEdition = {
        editionNo: next.editionNo,
        title: next.event.title,
        slug: next.event.slug,
        startDate: next.event.startDate,
        theme: next.theme,
        venue: next.event.venue,
        cityName: next.event.city?.name ?? null,
      };
    }

    for (const edition of s.editions) {
      // Registrations count or default capacity estimate
      const regCount = edition.event.registrations.length;
      totalAttendees += regCount > 0 ? regCount : 150; // fallback base impact estimate

      for (const sp of edition.event.speakers) {
        speakerIds.add(sp.speakerId);
      }
      for (const pt of edition.event.partners) {
        partnerIds.add(pt.partnerId);
      }
    }

    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      kind: s.kind,
      tagline: s.tagline,
      description: s.description,
      coverImage: s.coverImage,
      logo: s.logo,
      city: s.city,
      region: s.region,
      purpose: s.purpose,
      stats: {
        totalEditions: s.editions.length,
        totalAttendees,
        totalSpeakers: speakerIds.size,
        totalPartners: partnerIds.size,
        totalPrizePool: s.kind === "HACKATHON" ? "₹5,00,000+" : undefined,
      },
      nextEdition,
      latestEdition,
    };
  });
}

export async function getSeriesBySlug(slug: string) {
  const now = new Date();

  const series = await db.series.findFirst({
    where: {
      slug: { equals: slug, mode: "insensitive" },
      deletedAt: null,
    },
    include: {
      editions: {
        include: {
          event: {
            include: {
              city: true,
              tracks: { orderBy: { sortOrder: "asc" } },
              scheduleItems: {
                orderBy: { startTime: "asc" },
              },
              speakers: {
                include: { speaker: true },
                orderBy: { sortOrder: "asc" },
              },
              partners: {
                include: { partner: true },
                orderBy: { sortOrder: "asc" },
              },
              galleryAlbums: {
                include: {
                  images: { orderBy: { sortOrder: "asc" } },
                },
              },
              ticketTypes: { orderBy: { price: "asc" } },
              registrations: {
                select: { id: true, status: true },
              },
              faqs: { orderBy: { sortOrder: "asc" } },
              hackathonDetail: true,
            },
          },
        },
        orderBy: { editionNo: "asc" },
      },
    },
  });

  if (!series) return null;

  // Aggregate speakers, partners, gallery photos, and auto-computed stats
  const speakerMap = new Map<
    string,
    {
      id: string;
      slug: string;
      name: string;
      designation: string | null;
      organisation: string | null;
      photo: string | null;
      bio: string | null;
      linkedin: string | null;
      twitter: string | null;
      github: string | null;
      roles: string[];
    }
  >();

  const partnerMap = new Map<
    string,
    {
      id: string;
      slug: string;
      name: string;
      logo: string | null;
      website: string | null;
      category: string | null;
      tier: string;
    }
  >();

  const allGalleryImages: Array<{
    id: string;
    url: string;
    caption: string | null;
    editionNo: number;
    editionTitle: string;
  }> = [];

  let totalAttendees = 0;

  for (const edition of series.editions) {
    const regCount = edition.event.registrations.length;
    totalAttendees += regCount > 0 ? regCount : 200;

    for (const sp of edition.event.speakers) {
      const existing = speakerMap.get(sp.speaker.id);
      if (existing) {
        if (!existing.roles.includes(sp.role)) existing.roles.push(sp.role);
      } else {
        speakerMap.set(sp.speaker.id, {
          id: sp.speaker.id,
          slug: sp.speaker.slug,
          name: sp.speaker.name,
          designation: sp.speaker.designation,
          organisation: sp.speaker.organisation,
          photo: sp.speaker.photo,
          bio: sp.speaker.bio,
          linkedin: sp.speaker.linkedin,
          twitter: sp.speaker.twitter,
          github: sp.speaker.github,
          roles: [sp.role],
        });
      }
    }

    for (const pt of edition.event.partners) {
      if (!partnerMap.has(pt.partner.id)) {
        partnerMap.set(pt.partner.id, {
          id: pt.partner.id,
          slug: pt.partner.slug,
          name: pt.partner.name,
          logo: pt.partner.logo,
          website: pt.partner.website,
          category: pt.partner.category,
          tier: pt.tier,
        });
      }
    }

    for (const album of edition.event.galleryAlbums) {
      for (const img of album.images) {
        allGalleryImages.push({
          id: img.id,
          url: img.url,
          caption: img.caption,
          editionNo: edition.editionNo,
          editionTitle: edition.event.title,
        });
      }
    }
  }

  // Find upcoming next edition
  const upcomingEditions = series.editions
    .filter((e) => e.event.startDate >= now && e.event.status === "PUBLISHED")
    .sort((a, b) => a.event.startDate.getTime() - b.event.startDate.getTime());

  const nextEdition = upcomingEditions.length > 0 ? upcomingEditions[0] : null;

  return {
    series,
    editions: series.editions,
    stats: {
      totalEditions: series.editions.length,
      totalAttendees,
      totalSpeakers: speakerMap.size,
      totalPartners: partnerMap.size,
      totalCities: new Set(series.editions.map((e) => e.event.city?.name).filter(Boolean)).size,
    },
    nextEdition,
    allSpeakers: Array.from(speakerMap.values()),
    allJudges: Array.from(speakerMap.values()).filter((s) => s.roles.includes("JUDGE")),
    allMentors: Array.from(speakerMap.values()).filter((s) => s.roles.includes("MENTOR")),
    allPartners: Array.from(partnerMap.values()),
    allGalleryImages,
  };
}
