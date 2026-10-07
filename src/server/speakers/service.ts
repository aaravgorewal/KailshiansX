// src/server/speakers/service.ts
// Mentor & Speaker Network service per :
// Manages mentor/speaker discovery, availability, and session booking lifecycle.

import { db } from "@/lib/db";
import {
  SpeakerAvailabilityStatus,
  BookingRequestStatus,
  AttendanceMode,
  Prisma,
} from "@prisma/client";

export interface CreateBookingRequestInput {
  speakerId: string;
  requesterId: string;
  chapterId?: string | null;
  title: string;
  topic: string;
  sessionType: string;
  description: string;
  preferredDate: Date | string;
  durationMinutes?: number;
  format?: AttendanceMode;
  meetingUrl?: string | null;
}

export interface UpdateAvailabilityInput {
  availabilityStatus?: SpeakerAvailabilityStatus;
  weeklyAvailabilityHours?: number;
  preferredCadence?: string;
  meetingPlatform?: string;
  calendlyUrl?: string;
  topics?: string[];
  sessionTypes?: string[];
  bio?: string;
  designation?: string;
  organisation?: string;
}

/**
 * Auto-syncs default verified mentors & speakers if table is sparse.
 */
export async function syncDefaultMentors(): Promise<void> {
  const count = await db.speaker.count({
    where: { isMentor: true },
  });
  if (count > 0) return;

  const sampleMentors = [
    {
      name: "Dr. Aris Thorne",
      slug: "dr-aris-thorne",
      designation: "Principal Distributed Systems Architect",
      organisation: "Decentralized Systems Foundation",
      bio: "15+ years architecting fault-tolerant microservices, high-throughput Paxos/Raft consensus engines, and Kubernetes operators.",
      topics: ["Distributed Systems", "Kubernetes Operators", "Go & Rust", "System Design"],
      sessionTypes: ["1:1 Mentorship", "System Architecture Review", "Tech Talk"],
      availabilityStatus: SpeakerAvailabilityStatus.AVAILABLE,
      weeklyAvailabilityHours: 6,
      preferredCadence: "Tuesdays & Thursdays (7:00 PM - 9:00 PM IST)",
      meetingPlatform: "Google Meet",
      rating: 4.95,
      totalSessionsConducted: 42,
    },
    {
      name: "Priya Sundaram",
      slug: "priya-sundaram",
      designation: "VP of Engineering & Open Source Fellow",
      organisation: "CloudScale India",
      bio: "Founding engineer at two unicorn scale-ups. Specializes in full-stack Next.js production deployments, database performance, and engineering leadership.",
      topics: [
        "Next.js & React 19",
        "PostgreSQL Performance",
        "Startup Engineering",
        "Career Transition",
      ],
      sessionTypes: ["1:1 Mentorship", "Hands-on Workshop", "Hackathon Judging"],
      availabilityStatus: SpeakerAvailabilityStatus.AVAILABLE,
      weeklyAvailabilityHours: 4,
      preferredCadence: "Saturday Mornings (10:00 AM - 1:00 PM IST)",
      meetingPlatform: "Google Meet",
      rating: 5.0,
      totalSessionsConducted: 29,
    },
    {
      name: "Karan Malhotra",
      slug: "karan-malhotra",
      designation: "Staff AI Research Scientist",
      organisation: "NeuralVector Labs",
      bio: "Focuses on Autonomous LLM agents, local model inference with vLLM, and real-time multimodal developer tooling.",
      topics: ["AI Agents", "LLM Inference", "Python", "Hackathon Mentoring"],
      sessionTypes: ["1:1 Mentorship", "Hackathon Judging", "Keynote Talk"],
      availabilityStatus: SpeakerAvailabilityStatus.AVAILABLE,
      weeklyAvailabilityHours: 5,
      preferredCadence: "Friday Evenings & Sundays",
      meetingPlatform: "Google Meet",
      rating: 4.88,
      totalSessionsConducted: 19,
    },
    {
      name: "Ananya Deshmukh",
      slug: "ananya-deshmukh",
      designation: "Head of Product & Community Angel",
      organisation: "VentureCraft Studio",
      bio: "Helps early-stage developers turn hackathon prototypes into fundable ventures. Pitch coach, product strategy, and dev community builder.",
      topics: ["Product Strategy", "Pitch Decks", "Fundraising 101", "Developer Marketing"],
      sessionTypes: ["1:1 Mentorship", "Pitch Deck Teardown", "Panel Discussion"],
      availabilityStatus: SpeakerAvailabilityStatus.LIMITED,
      weeklyAvailabilityHours: 2,
      preferredCadence: "Sunday Evenings (5:00 PM - 7:00 PM IST)",
      meetingPlatform: "Google Meet",
      rating: 4.92,
      totalSessionsConducted: 35,
    },
  ];

  for (const m of sampleMentors) {
    await db.speaker.upsert({
      where: { slug: m.slug },
      update: {
        isMentor: true,
        topics: m.topics,
        sessionTypes: m.sessionTypes,
        availabilityStatus: m.availabilityStatus,
        weeklyAvailabilityHours: m.weeklyAvailabilityHours,
        preferredCadence: m.preferredCadence,
        rating: m.rating,
        totalSessionsConducted: m.totalSessionsConducted,
      },
      create: {
        name: m.name,
        slug: m.slug,
        designation: m.designation,
        organisation: m.organisation,
        bio: m.bio,
        topics: m.topics,
        sessionTypes: m.sessionTypes,
        isMentor: true,
        isSpeaker: true,
        availabilityStatus: m.availabilityStatus,
        weeklyAvailabilityHours: m.weeklyAvailabilityHours,
        preferredCadence: m.preferredCadence,
        meetingPlatform: m.meetingPlatform,
        rating: m.rating,
        totalSessionsConducted: m.totalSessionsConducted,
      },
    });
  }
}

/**
 * Lists the mentor and speaker directory with filtering.
 */
export async function getMentorSpeakerNetwork(filters?: {
  role?: "MENTOR" | "SPEAKER" | "ALL";
  topic?: string;
  sessionType?: string;
  availability?: SpeakerAvailabilityStatus;
  search?: string;
}) {
  await syncDefaultMentors();

  const whereClause: Prisma.SpeakerWhereInput = {};

  if (filters?.role === "MENTOR") {
    whereClause.isMentor = true;
  } else if (filters?.role === "SPEAKER") {
    whereClause.isSpeaker = true;
  }

  if (filters?.availability) {
    whereClause.availabilityStatus = filters.availability;
  }

  if (filters?.topic) {
    whereClause.topics = { has: filters.topic };
  }

  if (filters?.sessionType) {
    whereClause.sessionTypes = { has: filters.sessionType };
  }

  if (filters?.search) {
    whereClause.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { bio: { contains: filters.search, mode: "insensitive" } },
      { organisation: { contains: filters.search, mode: "insensitive" } },
      { designation: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const speakers = await db.speaker.findMany({
    where: whereClause,
    orderBy: [{ rating: "desc" }, { totalSessionsConducted: "desc" }],
    include: {
      user: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
      _count: {
        select: {
          bookingRequests: true,
          eventSpeakers: true,
        },
      },
    },
  });

  // Extract all unique topics and session types for filter chips
  const allSpeakers = await db.speaker.findMany({
    select: { topics: true, sessionTypes: true },
  });

  const availableTopics = Array.from(new Set(allSpeakers.flatMap((s) => s.topics))).filter(Boolean);

  const availableSessionTypes = Array.from(
    new Set(allSpeakers.flatMap((s) => s.sessionTypes))
  ).filter(Boolean);

  return {
    speakers: speakers.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      bio: s.bio,
      photo: s.photo,
      designation: s.designation,
      organisation: s.organisation,
      linkedin: s.linkedin,
      twitter: s.twitter,
      github: s.github,
      website: s.website,
      isMentor: s.isMentor,
      isSpeaker: s.isSpeaker,
      topics: s.topics,
      sessionTypes: s.sessionTypes,
      availabilityStatus: s.availabilityStatus,
      weeklyAvailabilityHours: s.weeklyAvailabilityHours,
      preferredCadence: s.preferredCadence,
      meetingPlatform: s.meetingPlatform,
      rating: s.rating,
      totalSessionsConducted: s.totalSessionsConducted,
      linkedUser: s.user,
      totalEvents: s._count.eventSpeakers,
    })),
    filterOptions: {
      topics: availableTopics,
      sessionTypes: availableSessionTypes,
    },
  };
}

/**
 * Gets a single mentor/speaker profile by slug.
 */
export async function getSpeakerProfileBySlug(slug: string) {
  await syncDefaultMentors();

  const speaker = await db.speaker.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          image: true,
          bio: true,
        },
      },
      eventSpeakers: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              type: true,
              startDate: true,
              city: true,
            },
          },
        },
      },
      techTalkResources: {
        include: {
          event: {
            select: { id: true, title: true, slug: true },
          },
        },
      },
      bookingRequests: {
        where: { status: BookingRequestStatus.COMPLETED, rating: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          sessionType: true,
          rating: true,
          feedback: true,
          createdAt: true,
          requester: {
            select: { name: true, image: true, username: true },
          },
        },
      },
    },
  });

  if (!speaker) return null;

  return {
    ...speaker,
    reviews: speaker.bookingRequests,
    pastEvents: speaker.eventSpeakers.map((es) => es.event),
  };
}

/**
 * Submits a new booking request to a mentor or speaker.
 */
export async function createBookingRequest(input: CreateBookingRequestInput) {
  const speaker = await db.speaker.findUnique({
    where: { id: input.speakerId },
  });

  if (!speaker) {
    throw new Error("Target mentor or speaker not found.");
  }

  const requester = await db.user.findUnique({
    where: { id: input.requesterId },
  });

  if (!requester) {
    throw new Error("Authenticated requester not found.");
  }

  if (speaker.userId && speaker.userId === input.requesterId) {
    throw new Error("Cannot book a mentorship session with yourself.");
  }

  const booking = await db.speakerBookingRequest.create({
    data: {
      speakerId: input.speakerId,
      requesterId: input.requesterId,
      chapterId: input.chapterId || null,
      title: input.title,
      topic: input.topic,
      sessionType: input.sessionType,
      description: input.description,
      preferredDate: new Date(input.preferredDate),
      durationMinutes: input.durationMinutes || 45,
      format: input.format || AttendanceMode.VIRTUAL,
      meetingUrl: input.meetingUrl || null,
      status: BookingRequestStatus.PENDING,
    },
    include: {
      speaker: { select: { name: true, slug: true, designation: true } },
      requester: { select: { name: true, email: true } },
      chapter: { select: { name: true, slug: true } },
    },
  });

  return booking;
}

/**
 * Mentor responds to an incoming booking request.
 */
export async function respondToBookingRequest(params: {
  bookingId: string;
  userId: string;
  action: "ACCEPT" | "DECLINE";
  meetingUrl?: string;
  declinedReason?: string;
  mentorNotes?: string;
  isAdmin?: boolean;
}) {
  const booking = await db.speakerBookingRequest.findUnique({
    where: { id: params.bookingId },
    include: { speaker: true },
  });

  if (!booking) {
    throw new Error("Booking request not found.");
  }

  // Authorization check: User must be linked speaker or admin
  const isAuthorized =
    params.isAdmin ||
    booking.speaker.userId === params.userId ||
    booking.speakerId === params.userId;

  if (!isAuthorized) {
    throw new Error("You are not authorized to respond to this booking request.");
  }

  if (params.action === "ACCEPT") {
    const updated = await db.speakerBookingRequest.update({
      where: { id: params.bookingId },
      data: {
        status: BookingRequestStatus.ACCEPTED,
        meetingUrl:
          params.meetingUrl ||
          booking.speaker.meetingPlatform ||
          "https://meet.google.com/kws-session",
        mentorNotes: params.mentorNotes,
      },
    });
    return updated;
  } else {
    const updated = await db.speakerBookingRequest.update({
      where: { id: params.bookingId },
      data: {
        status: BookingRequestStatus.DECLINED,
        declinedReason: params.declinedReason || "Schedule conflict",
        mentorNotes: params.mentorNotes,
      },
    });
    return updated;
  }
}

/**
 * Completes a session and records requester rating & review.
 */
export async function completeBookingRequest(params: {
  bookingId: string;
  requesterId: string;
  rating: number;
  feedback?: string;
}) {
  const booking = await db.speakerBookingRequest.findUnique({
    where: { id: params.bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.requesterId !== params.requesterId) {
    throw new Error("Only the requester can rate and complete the session.");
  }

  const clampedRating = Math.max(1, Math.min(5, Math.round(params.rating)));

  const updated = await db.speakerBookingRequest.update({
    where: { id: params.bookingId },
    data: {
      status: BookingRequestStatus.COMPLETED,
      rating: clampedRating,
      feedback: params.feedback,
    },
  });

  // Update mentor stats
  const allRatings = await db.speakerBookingRequest.findMany({
    where: {
      speakerId: booking.speakerId,
      status: BookingRequestStatus.COMPLETED,
      rating: { not: null },
    },
    select: { rating: true },
  });

  const total = allRatings.length;
  const avg = total > 0 ? allRatings.reduce((sum, r) => sum + (r.rating || 5), 0) / total : 5.0;

  await db.speaker.update({
    where: { id: booking.speakerId },
    data: {
      rating: parseFloat(avg.toFixed(2)),
      totalSessionsConducted: { increment: 1 },
    },
  });

  return updated;
}

/**
 * Updates a mentor's availability profile.
 */
export async function updateSpeakerAvailability(
  speakerId: string,
  userId: string,
  data: UpdateAvailabilityInput,
  isAdmin = false
) {
  const speaker = await db.speaker.findUnique({
    where: { id: speakerId },
  });

  if (!speaker) {
    throw new Error("Speaker not found.");
  }

  if (!isAdmin && speaker.userId && speaker.userId !== userId) {
    throw new Error("Unauthorized to edit this mentor profile.");
  }

  const updated = await db.speaker.update({
    where: { id: speakerId },
    data: {
      userId: speaker.userId || userId,
      availabilityStatus: data.availabilityStatus,
      weeklyAvailabilityHours: data.weeklyAvailabilityHours,
      preferredCadence: data.preferredCadence,
      meetingPlatform: data.meetingPlatform,
      calendlyUrl: data.calendlyUrl,
      topics: data.topics,
      sessionTypes: data.sessionTypes,
      bio: data.bio,
      designation: data.designation,
      organisation: data.organisation,
    },
  });

  return updated;
}

/**
 * Gets bookings requested by a user.
 */
export async function getUserBookings(userId: string) {
  return db.speakerBookingRequest.findMany({
    where: { requesterId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      speaker: {
        select: {
          id: true,
          name: true,
          slug: true,
          photo: true,
          designation: true,
          organisation: true,
          meetingPlatform: true,
        },
      },
      chapter: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

/**
 * Gets incoming booking requests for a mentor.
 */
export async function getMentorIncomingBookings(userId: string) {
  const speaker = await db.speaker.findFirst({
    where: { userId },
  });

  if (!speaker) return [];

  return db.speakerBookingRequest.findMany({
    where: { speakerId: speaker.id },
    orderBy: { createdAt: "desc" },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          username: true,
          headline: true,
        },
      },
      chapter: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}
