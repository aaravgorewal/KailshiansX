import { db } from "@/lib/db";

export interface CommunityStats {
  totalBuilders: number;
  totalCities: number;
  totalCampusLeads: number;
  totalStateLeads: number;
  totalColleges: number;
  totalEventsHosted: number;
}

export interface StateLeadItem {
  id: string;
  name: string;
  state: string;
  city: string | null;
  citiesCovered: string | null;
  image: string | null;
  status: string;
  startDate: Date;
}

export interface CampusLeadItem {
  id: string;
  name: string;
  collegeName: string;
  cityName: string;
  image: string | null;
  status: string;
  eventsSupported: number;
  referrals: number;
}

export interface CityHubItem {
  id: string;
  name: string;
  state: string;
  collegesCount: number;
  eventsCount: number;
}

export interface CommunityOverviewData {
  stats: CommunityStats;
  stateLeads: StateLeadItem[];
  campusLeads: CampusLeadItem[];
  cityHubs: CityHubItem[];
}

export async function getCommunityOverview(): Promise<CommunityOverviewData> {
  const [
    totalRegistrations,
    totalUsers,
    citiesCount,
    campusLeadsCount,
    stateLeadsCount,
    collegesCount,
    eventsCount,
    rawStateLeads,
    rawCampusLeads,
    rawCities,
  ] = await Promise.all([
    db.registration.count({ where: { status: "CONFIRMED" } }),
    db.user.count(),
    db.city.count(),
    db.campusLead.count({ where: { status: "ACTIVE" } }),
    db.stateLead.count({ where: { status: "ACTIVE" } }),
    db.college.count(),
    db.event.count({ where: { status: "PUBLISHED" } }),

    db.stateLead.findMany({
      where: { status: "ACTIVE" },
      include: {
        user: { select: { name: true, image: true } },
        application: {
          select: { name: true, city: true, citiesCovered: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    db.campusLead.findMany({
      where: { status: "ACTIVE" },
      include: {
        user: { select: { name: true, image: true } },
        college: { select: { name: true } },
        city: { select: { name: true } },
        application: { select: { name: true, college: true, city: true } },
      },
      orderBy: { eventsSupported: "desc" },
    }),

    db.city.findMany({
      include: {
        _count: {
          select: {
            colleges: true,
            events: true,
          },
        },
      },
      orderBy: { name: "asc" },
      take: 12,
    }),
  ]);

  const stateLeads: StateLeadItem[] = rawStateLeads.map((sl) => ({
    id: sl.id,
    name: sl.application.name || sl.user.name || "State Lead",
    state: sl.state,
    city: sl.application.city || null,
    citiesCovered: sl.application.citiesCovered || null,
    image: sl.user.image,
    status: sl.status,
    startDate: sl.startDate,
  }));

  const campusLeads: CampusLeadItem[] = rawCampusLeads.map((cl) => ({
    id: cl.id,
    name: cl.application.name || cl.user.name || "Campus Lead",
    collegeName: cl.college?.name || cl.application.college || "Campus Chapter",
    cityName: cl.city?.name || cl.application.city || "City Hub",
    image: cl.user.image,
    status: cl.status,
    eventsSupported: cl.eventsSupported,
    referrals: cl.referrals,
  }));

  const cityHubs: CityHubItem[] = rawCities.map((c) => ({
    id: c.id,
    name: c.name,
    state: c.state,
    collegesCount: c._count.colleges,
    eventsCount: c._count.events,
  }));

  return {
    stats: {
      totalBuilders: totalRegistrations + totalUsers,
      totalCities: citiesCount,
      totalCampusLeads: campusLeadsCount,
      totalStateLeads: stateLeadsCount,
      totalColleges: collegesCount,
      totalEventsHosted: eventsCount,
    },
    stateLeads,
    campusLeads,
    cityHubs,
  };
}
