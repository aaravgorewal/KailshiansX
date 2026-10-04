import { db } from "@/lib/db";

export interface CollaborationOverviewData {
  stats: {
    totalColleges: number;
    totalPartners: number;
    totalVenues: number;
    totalSponsors: number;
    activeCities: number;
  };
  featuredPartners: Array<{
    id: string;
    name: string;
    category: string | null;
    logo: string | null;
    website: string | null;
  }>;
}

export async function getCollaborationOverview(): Promise<CollaborationOverviewData> {
  try {
    const [collegesCount, partnersCount, venuesCount, sponsorsCount, citiesCount, partners] =
      await Promise.all([
        db.college.count(),
        db.partner.count(),
        db.collaborationLead.count({ where: { type: "VENUE" } }),
        db.collaborationLead.count({ where: { type: "SPONSOR" } }),
        db.city.count(),
        db.partner.findMany({
          take: 12,
          select: {
            id: true,
            name: true,
            category: true,
            logo: true,
            website: true,
          },
        }),
      ]);

    return {
      stats: {
        totalColleges: collegesCount,
        totalPartners: partnersCount,
        totalVenues: venuesCount,
        totalSponsors: sponsorsCount,
        activeCities: citiesCount,
      },
      featuredPartners: partners,
    };
  } catch (error) {
    console.error("Failed to load collaboration overview:", error);
    return {
      stats: {
        totalColleges: 0,
        totalPartners: 0,
        totalVenues: 0,
        totalSponsors: 0,
        activeCities: 0,
      },
      featuredPartners: [],
    };
  }
}
