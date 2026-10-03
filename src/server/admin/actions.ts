// src/server/admin/actions.ts
// Comprehensive server actions for Admin operations across all PRD §22 modules
// Protected by requireAdmin() and logged with writeAudit()

"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import { writeAudit } from "@/server/auth/audit";
import { revalidatePath } from "next/cache";
import {
  EventType,
  EventStatus,
  AttendanceMode,
  SpeakerRole,
  PartnerTier,
  RegistrationStatus,
  CampusLeadStatus,
  StateLeadStatus,
  CollaborationStage,
  CollaborationType,
  UserRole,
  SeriesKind,
} from "@prisma/client";
import { queueStatusChangeEmail, retryEmailJob, processEmailQueue } from "@/server/email";

// ═══════════════════════════════════════════════════════════════════════════════
// 1. EVENT ACTIONS (CRUD, Duplicate, Publish Toggle)
// ═══════════════════════════════════════════════════════════════════════════════

export interface EventScheduleInput {
  startTime: string; // ISO string
  endTime?: string | null;
  title: string;
  description?: string | null;
  speakerId?: string | null;
  sortOrder?: number;
}

export interface EventSpeakerInput {
  speakerId: string;
  role: SpeakerRole;
}

export interface EventTrackInput {
  name: string;
  description?: string | null;
  color?: string | null;
  sortOrder?: number;
}

export interface EventTicketInput {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  quota: number;
  isFree: boolean;
}

export interface EventPartnerInput {
  partnerId: string;
  tier: PartnerTier;
}

export interface EventFaqInput {
  question: string;
  answer: string;
  sortOrder?: number;
}

export interface EventFormData {
  title: string;
  slug: string;
  type: EventType;
  status: EventStatus;
  category?: string | null;
  overview?: string | null;
  coverImage?: string | null;
  cityId?: string | null;
  venue?: string | null;
  venueAddress?: string | null;
  venueMapUrl?: string | null;
  attendanceMode: AttendanceMode;
  startDate: string; // ISO string
  endDate?: string | null;
  registrationDeadline?: string | null;
  maxCapacity?: number | null;
  isFeatured?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  // Sub-resources
  scheduleItems?: EventScheduleInput[];
  speakers?: EventSpeakerInput[];
  tracks?: EventTrackInput[];
  tickets?: EventTicketInput[];
  partners?: EventPartnerInput[];
  faqs?: EventFaqInput[];
}

export async function createEvent(data: EventFormData) {
  const session = await requireAdmin();

  const newEvent = await db.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        title: data.title,
        slug: data.slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]+/g, "-"),
        type: data.type,
        status: data.status || EventStatus.DRAFT,
        category: data.category || null,
        overview: data.overview || null,
        coverImage: data.coverImage || null,
        cityId: data.cityId || null,
        venue: data.venue || null,
        venueAddress: data.venueAddress || null,
        venueMapUrl: data.venueMapUrl || null,
        attendanceMode: data.attendanceMode || AttendanceMode.IN_PERSON,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        registrationDeadline: data.registrationDeadline
          ? new Date(data.registrationDeadline)
          : null,
        maxCapacity: data.maxCapacity ? Number(data.maxCapacity) : null,
        isFeatured: Boolean(data.isFeatured),
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
      },
    });

    // Schedule items
    if (data.scheduleItems && data.scheduleItems.length > 0) {
      await tx.eventScheduleItem.createMany({
        data: data.scheduleItems.map((item, idx) => ({
          eventId: event.id,
          startTime: new Date(item.startTime),
          endTime: item.endTime ? new Date(item.endTime) : null,
          title: item.title,
          description: item.description || null,
          speakerId: item.speakerId || null,
          sortOrder: item.sortOrder ?? idx,
        })),
      });
    }

    // Speakers
    if (data.speakers && data.speakers.length > 0) {
      await tx.eventSpeaker.createMany({
        data: data.speakers.map((sp, idx) => ({
          eventId: event.id,
          speakerId: sp.speakerId,
          role: sp.role,
          sortOrder: idx,
        })),
        skipDuplicates: true,
      });
    }

    // Tracks
    if (data.tracks && data.tracks.length > 0) {
      await tx.eventTrack.createMany({
        data: data.tracks.map((tr, idx) => ({
          eventId: event.id,
          name: tr.name,
          description: tr.description || null,
          color: tr.color || null,
          sortOrder: tr.sortOrder ?? idx,
        })),
      });
    }

    // Tickets
    if (data.tickets && data.tickets.length > 0) {
      await tx.ticketType.createMany({
        data: data.tickets.map((t, idx) => ({
          eventId: event.id,
          name: t.name,
          description: t.description || null,
          price: t.price,
          quota: t.quota,
          isFree: t.isFree || t.price === 0,
          sortOrder: idx,
        })),
      });
    }

    // Partners
    if (data.partners && data.partners.length > 0) {
      await tx.eventPartner.createMany({
        data: data.partners.map((p, idx) => ({
          eventId: event.id,
          partnerId: p.partnerId,
          tier: p.tier,
          sortOrder: idx,
        })),
        skipDuplicates: true,
      });
    }

    // FAQs
    if (data.faqs && data.faqs.length > 0) {
      await tx.eventFaq.createMany({
        data: data.faqs.map((f, idx) => ({
          eventId: event.id,
          question: f.question,
          answer: f.answer,
          sortOrder: f.sortOrder ?? idx,
        })),
      });
    }

    return event;
  });

  await writeAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Event",
    entityId: newEvent.id,
    after: newEvent,
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { success: true, eventId: newEvent.id };
}

export async function updateEvent(id: string, data: EventFormData) {
  const session = await requireAdmin();

  const originalEvent = await db.event.findUnique({
    where: { id },
    include: {
      scheduleItems: true,
      speakers: true,
      tracks: true,
      ticketTypes: true,
      partners: true,
      faqs: true,
    },
  });

  if (!originalEvent) {
    throw new Error("Event not found");
  }

  const updatedEvent = await db.$transaction(async (tx) => {
    const event = await tx.event.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]+/g, "-"),
        type: data.type,
        status: data.status,
        category: data.category || null,
        overview: data.overview || null,
        coverImage: data.coverImage || null,
        cityId: data.cityId || null,
        venue: data.venue || null,
        venueAddress: data.venueAddress || null,
        venueMapUrl: data.venueMapUrl || null,
        attendanceMode: data.attendanceMode,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        registrationDeadline: data.registrationDeadline
          ? new Date(data.registrationDeadline)
          : null,
        maxCapacity: data.maxCapacity ? Number(data.maxCapacity) : null,
        isFeatured: Boolean(data.isFeatured),
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
      },
    });

    // Replace schedule items
    if (data.scheduleItems !== undefined) {
      await tx.eventScheduleItem.deleteMany({ where: { eventId: id } });
      if (data.scheduleItems.length > 0) {
        await tx.eventScheduleItem.createMany({
          data: data.scheduleItems.map((item, idx) => ({
            eventId: id,
            startTime: new Date(item.startTime),
            endTime: item.endTime ? new Date(item.endTime) : null,
            title: item.title,
            description: item.description || null,
            speakerId: item.speakerId || null,
            sortOrder: item.sortOrder ?? idx,
          })),
        });
      }
    }

    // Replace speakers
    if (data.speakers !== undefined) {
      await tx.eventSpeaker.deleteMany({ where: { eventId: id } });
      if (data.speakers.length > 0) {
        await tx.eventSpeaker.createMany({
          data: data.speakers.map((sp, idx) => ({
            eventId: id,
            speakerId: sp.speakerId,
            role: sp.role,
            sortOrder: idx,
          })),
          skipDuplicates: true,
        });
      }
    }

    // Replace tracks
    if (data.tracks !== undefined) {
      await tx.eventTrack.deleteMany({ where: { eventId: id } });
      if (data.tracks.length > 0) {
        await tx.eventTrack.createMany({
          data: data.tracks.map((tr, idx) => ({
            eventId: id,
            name: tr.name,
            description: tr.description || null,
            color: tr.color || null,
            sortOrder: tr.sortOrder ?? idx,
          })),
        });
      }
    }

    // Update tickets
    if (data.tickets !== undefined) {
      // Find existing ticket types to avoid deleting ones that have registrations
      const existingTickets = await tx.ticketType.findMany({ where: { eventId: id } });
      const incomingIds = data.tickets.filter((t) => t.id).map((t) => t.id as string);

      // Delete tickets not in incoming list only if they have no registrations
      for (const et of existingTickets) {
        if (!incomingIds.includes(et.id)) {
          const regCount = await tx.registration.count({ where: { ticketTypeId: et.id } });
          if (regCount === 0) {
            await tx.ticketType.delete({ where: { id: et.id } });
          }
        }
      }

      for (let idx = 0; idx < data.tickets.length; idx++) {
        const t = data.tickets[idx];
        if (t.id && existingTickets.some((et) => et.id === t.id)) {
          await tx.ticketType.update({
            where: { id: t.id },
            data: {
              name: t.name,
              description: t.description || null,
              price: t.price,
              quota: t.quota,
              isFree: t.isFree || t.price === 0,
              sortOrder: idx,
            },
          });
        } else {
          await tx.ticketType.create({
            data: {
              eventId: id,
              name: t.name,
              description: t.description || null,
              price: t.price,
              quota: t.quota,
              isFree: t.isFree || t.price === 0,
              sortOrder: idx,
            },
          });
        }
      }
    }

    // Replace partners
    if (data.partners !== undefined) {
      await tx.eventPartner.deleteMany({ where: { eventId: id } });
      if (data.partners.length > 0) {
        await tx.eventPartner.createMany({
          data: data.partners.map((p, idx) => ({
            eventId: id,
            partnerId: p.partnerId,
            tier: p.tier,
            sortOrder: idx,
          })),
          skipDuplicates: true,
        });
      }
    }

    // Replace FAQs
    if (data.faqs !== undefined) {
      await tx.eventFaq.deleteMany({ where: { eventId: id } });
      if (data.faqs.length > 0) {
        await tx.eventFaq.createMany({
          data: data.faqs.map((f, idx) => ({
            eventId: id,
            question: f.question,
            answer: f.answer,
            sortOrder: f.sortOrder ?? idx,
          })),
        });
      }
    }

    return event;
  });

  await writeAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "Event",
    entityId: id,
    before: originalEvent,
    after: updatedEvent,
  });

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}/edit`);
  revalidatePath(`/events/${updatedEvent.slug}`);
  return { success: true };
}

export async function duplicateEvent(id: string) {
  const session = await requireAdmin();

  const srcEvent = await db.event.findUnique({
    where: { id },
    include: {
      scheduleItems: true,
      speakers: true,
      tracks: true,
      ticketTypes: true,
      partners: true,
      faqs: true,
    },
  });

  if (!srcEvent) {
    throw new Error("Event to duplicate not found");
  }

  // Generate unique copy slug
  const baseSlug = `${srcEvent.slug}-copy`;
  let uniqueSlug = baseSlug;
  let counter = 1;
  while (await db.event.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const duplicated = await db.$transaction(async (tx) => {
    const newEvent = await tx.event.create({
      data: {
        title: `${srcEvent.title} (Copy)`,
        slug: uniqueSlug,
        type: srcEvent.type,
        status: EventStatus.DRAFT,
        category: srcEvent.category,
        overview: srcEvent.overview,
        coverImage: srcEvent.coverImage,
        cityId: srcEvent.cityId,
        venue: srcEvent.venue,
        venueAddress: srcEvent.venueAddress,
        venueMapUrl: srcEvent.venueMapUrl,
        attendanceMode: srcEvent.attendanceMode,
        startDate: srcEvent.startDate,
        endDate: srcEvent.endDate,
        registrationDeadline: srcEvent.registrationDeadline,
        maxCapacity: srcEvent.maxCapacity,
        isFeatured: false,
        metaTitle: srcEvent.metaTitle ? `${srcEvent.metaTitle} (Copy)` : null,
        metaDescription: srcEvent.metaDescription,
      },
    });

    if (srcEvent.scheduleItems.length > 0) {
      await tx.eventScheduleItem.createMany({
        data: srcEvent.scheduleItems.map((s) => ({
          eventId: newEvent.id,
          startTime: s.startTime,
          endTime: s.endTime,
          title: s.title,
          description: s.description,
          speakerId: s.speakerId,
          sortOrder: s.sortOrder,
        })),
      });
    }

    if (srcEvent.speakers.length > 0) {
      await tx.eventSpeaker.createMany({
        data: srcEvent.speakers.map((sp) => ({
          eventId: newEvent.id,
          speakerId: sp.speakerId,
          role: sp.role,
          sortOrder: sp.sortOrder,
        })),
      });
    }

    if (srcEvent.tracks.length > 0) {
      await tx.eventTrack.createMany({
        data: srcEvent.tracks.map((t) => ({
          eventId: newEvent.id,
          name: t.name,
          description: t.description,
          color: t.color,
          sortOrder: t.sortOrder,
        })),
      });
    }

    if (srcEvent.ticketTypes.length > 0) {
      await tx.ticketType.createMany({
        data: srcEvent.ticketTypes.map((tt) => ({
          eventId: newEvent.id,
          name: tt.name,
          description: tt.description,
          price: tt.price,
          quota: tt.quota,
          isFree: tt.isFree,
          sortOrder: tt.sortOrder,
        })),
      });
    }

    if (srcEvent.partners.length > 0) {
      await tx.eventPartner.createMany({
        data: srcEvent.partners.map((p) => ({
          eventId: newEvent.id,
          partnerId: p.partnerId,
          tier: p.tier,
          sortOrder: p.sortOrder,
        })),
      });
    }

    if (srcEvent.faqs.length > 0) {
      await tx.eventFaq.createMany({
        data: srcEvent.faqs.map((f) => ({
          eventId: newEvent.id,
          question: f.question,
          answer: f.answer,
          sortOrder: f.sortOrder,
        })),
      });
    }

    return newEvent;
  });

  await writeAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Event",
    entityId: duplicated.id,
    after: duplicated,
  });

  revalidatePath("/admin/events");
  return { success: true, duplicatedId: duplicated.id };
}

export async function togglePublishEvent(id: string, status: EventStatus) {
  const session = await requireAdmin();

  const original = await db.event.findUnique({ where: { id } });
  if (!original) throw new Error("Event not found");

  const updated = await db.event.update({
    where: { id },
    data: { status },
  });

  await writeAudit({
    userId: session.user.id,
    action: status === EventStatus.PUBLISHED ? "PUBLISH" : "UPDATE",
    entityType: "Event",
    entityId: id,
    before: { status: original.status },
    after: { status: updated.status },
  });

  revalidatePath("/admin/events");
  revalidatePath(`/events/${updated.slug}`);
  return { success: true, status: updated.status };
}

export async function deleteEvent(id: string) {
  const session = await requireAdmin();

  const original = await db.event.findUnique({ where: { id } });
  if (!original) throw new Error("Event not found");

  // Soft delete
  await db.event.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await writeAudit({
    userId: session.user.id,
    action: "DELETE",
    entityType: "Event",
    entityId: id,
    before: original,
  });

  revalidatePath("/admin/events");
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. REGISTRATIONS & ATTENDANCE ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export async function updateRegistrationStatus(id: string, status: RegistrationStatus) {
  const session = await requireAdmin();

  const original = await db.registration.findUnique({ where: { id } });
  if (!original) throw new Error("Registration not found");

  const updated = await db.registration.update({
    where: { id },
    data: { status },
  });

  await writeAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "Registration",
    entityId: id,
    before: { status: original.status },
    after: { status: updated.status },
  });

  revalidatePath("/admin/registrations");
  return { success: true, status: updated.status };
}

export async function toggleAttendanceCheckin(registrationId: string) {
  const session = await requireAdmin();

  const reg = await db.registration.findUnique({
    where: { id: registrationId },
    include: { attendance: true },
  });

  if (!reg) throw new Error("Registration not found");

  if (reg.attendance) {
    // Un-checkin
    await db.attendance.delete({ where: { registrationId } });
    await db.registration.update({
      where: { id: registrationId },
      data: { checkedInAt: null },
    });

    await writeAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "Attendance",
      entityId: reg.attendance.id,
      before: { checkedIn: true },
      after: { checkedIn: false },
    });

    revalidatePath("/admin/registrations");
    return { success: true, checkedIn: false };
  } else {
    // Check in
    const att = await db.attendance.create({
      data: {
        registrationId,
        checkedInBy: session.user.id,
        method: "MANUAL",
      },
    });
    await db.registration.update({
      where: { id: registrationId },
      data: { checkedInAt: new Date() },
    });

    await writeAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "Attendance",
      entityId: att.id,
      after: { checkedIn: true, method: "MANUAL" },
    });

    revalidatePath("/admin/registrations");
    return { success: true, checkedIn: true };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. USER ROLE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export async function updateUserRole(userId: string, role: UserRole) {
  const session = await requireAdmin();

  const original = await db.user.findUnique({ where: { id: userId } });
  if (!original) throw new Error("User not found");

  const updated = await db.user.update({
    where: { id: userId },
    data: { role },
  });

  await writeAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "User",
    entityId: userId,
    before: { role: original.role },
    after: { role: updated.role },
  });

  revalidatePath("/admin/participants");
  return { success: true, role: updated.role };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PIPELINE ACTIONS (Campus Leads, State Leads, Collaborations)
// ═══════════════════════════════════════════════════════════════════════════════

export async function updateCampusLeadStatus(
  applicationId: string,
  status: CampusLeadStatus,
  adminNotes?: string
) {
  const session = await requireAdmin();

  const original = await db.campusLeadApplication.findUnique({
    where: { id: applicationId },
  });
  if (!original) throw new Error("Application not found");

  const updated = await db.campusLeadApplication.update({
    where: { id: applicationId },
    data: {
      status,
      ...(adminNotes !== undefined ? { adminNotes } : {}),
    },
  });

  await writeAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "CampusLeadApplication",
    entityId: applicationId,
    before: { status: original.status, notes: original.adminNotes },
    after: { status: updated.status, notes: updated.adminNotes },
  });

  // Queue status change update email
  if (original.status !== updated.status) {
    await queueStatusChangeEmail(updated.email, {
      name: updated.name,
      applicationType: "CAMPUS_LEAD",
      referenceId: updated.id,
      roleOrJurisdiction: `${updated.college} (${updated.city})`,
      newStatus: updated.status,
      reviewNotes: adminNotes || updated.adminNotes,
    }).catch((err) => console.error("Campus lead status email error:", err));
  }

  revalidatePath("/admin/campus-leads");
  return { success: true, status: updated.status };
}

export async function updateStateLeadStatus(
  applicationId: string,
  status: StateLeadStatus,
  adminNotes?: string
) {
  const session = await requireAdmin();

  const original = await db.stateLeadApplication.findUnique({
    where: { id: applicationId },
  });
  if (!original) throw new Error("Application not found");

  const updated = await db.stateLeadApplication.update({
    where: { id: applicationId },
    data: {
      status,
      ...(adminNotes !== undefined ? { adminNotes } : {}),
    },
  });

  await writeAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "StateLeadApplication",
    entityId: applicationId,
    before: { status: original.status, notes: original.adminNotes },
    after: { status: updated.status, notes: updated.adminNotes },
  });

  // Queue status change update email
  if (original.status !== updated.status) {
    await queueStatusChangeEmail(updated.email, {
      name: updated.name,
      applicationType: "STATE_LEAD",
      referenceId: updated.id,
      roleOrJurisdiction: `${updated.state} (${updated.city})`,
      newStatus: updated.status,
      reviewNotes: adminNotes || updated.adminNotes,
    }).catch((err) => console.error("State lead status email error:", err));
  }

  revalidatePath("/admin/state-leads");
  return { success: true, status: updated.status };
}

export async function updateCollaborationStage(
  leadId: string,
  stage: CollaborationStage,
  adminNotes?: string
) {
  const session = await requireAdmin();

  const original = await db.collaborationLead.findUnique({
    where: { id: leadId },
  });
  if (!original) throw new Error("Collaboration lead not found");

  const updated = await db.collaborationLead.update({
    where: { id: leadId },
    data: {
      stage,
      ...(adminNotes !== undefined ? { adminNotes } : {}),
    },
  });

  await writeAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "CollaborationLead",
    entityId: leadId,
    before: { stage: original.stage, notes: original.adminNotes },
    after: { stage: updated.stage, notes: updated.adminNotes },
  });

  revalidatePath("/admin/collaborations");
  return { success: true, stage: updated.stage };
}

export async function createCollaborationLead(data: {
  type: CollaborationType;
  organisation: string;
  contactPerson: string;
  email: string;
  phone?: string;
  website?: string;
  cityName?: string;
  proposedEvent?: string;
  resourcesOffered?: string;
  message?: string;
  adminNotes?: string;
}) {
  const session = await requireAdmin();

  const lead = await db.collaborationLead.create({
    data: {
      type: data.type,
      stage: CollaborationStage.NEW,
      organisation: data.organisation,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone || null,
      website: data.website || null,
      cityName: data.cityName || null,
      proposedEvent: data.proposedEvent || null,
      resourcesOffered: data.resourcesOffered || null,
      message: data.message || null,
      adminNotes: data.adminNotes || null,
      assignedTo: session.user.id,
    },
  });

  await writeAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "CollaborationLead",
    entityId: lead.id,
    after: lead,
  });

  revalidatePath("/admin/collaborations");
  return { success: true, leadId: lead.id };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SPEAKERS & SPONSORS / PARTNERS ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface SpeakerFormData {
  id?: string;
  name: string;
  slug: string;
  designation?: string | null;
  organisation?: string | null;
  bio?: string | null;
  photo?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  github?: string | null;
  website?: string | null;
}

export async function createOrUpdateSpeaker(data: SpeakerFormData) {
  const session = await requireAdmin();

  if (data.id) {
    const original = await db.speaker.findUnique({ where: { id: data.id } });
    const updated = await db.speaker.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]+/g, "-"),
        designation: data.designation || null,
        organisation: data.organisation || null,
        bio: data.bio || null,
        photo: data.photo || null,
        linkedin: data.linkedin || null,
        twitter: data.twitter || null,
        github: data.github || null,
        website: data.website || null,
      },
    });

    await writeAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "Speaker",
      entityId: data.id,
      before: original,
      after: updated,
    });

    return { success: true, speaker: updated };
  } else {
    const slug = data.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-");
    const created = await db.speaker.create({
      data: {
        name: data.name,
        slug,
        designation: data.designation || null,
        organisation: data.organisation || null,
        bio: data.bio || null,
        photo: data.photo || null,
        linkedin: data.linkedin || null,
        twitter: data.twitter || null,
        github: data.github || null,
        website: data.website || null,
      },
    });

    await writeAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "Speaker",
      entityId: created.id,
      after: created,
    });

    return { success: true, speaker: created };
  }
}

export async function deleteSpeaker(id: string) {
  const session = await requireAdmin();
  const original = await db.speaker.findUnique({ where: { id } });
  if (!original) throw new Error("Speaker not found");

  await db.speaker.delete({ where: { id } });

  await writeAudit({
    userId: session.user.id,
    action: "DELETE",
    entityType: "Speaker",
    entityId: id,
    before: original,
  });

  return { success: true };
}

export interface PartnerFormData {
  id?: string;
  name: string;
  slug: string;
  logo?: string | null;
  website?: string | null;
  category?: string | null;
}

export async function createOrUpdatePartner(data: PartnerFormData) {
  const session = await requireAdmin();

  if (data.id) {
    const original = await db.partner.findUnique({ where: { id: data.id } });
    const updated = await db.partner.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]+/g, "-"),
        logo: data.logo || null,
        website: data.website || null,
        category: data.category || null,
      },
    });

    await writeAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "Partner",
      entityId: data.id,
      before: original,
      after: updated,
    });

    revalidatePath("/admin/sponsors");
    return { success: true, partner: updated };
  } else {
    const created = await db.partner.create({
      data: {
        name: data.name,
        slug: data.slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]+/g, "-"),
        logo: data.logo || null,
        website: data.website || null,
        category: data.category || null,
      },
    });

    await writeAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "Partner",
      entityId: created.id,
      after: created,
    });

    revalidatePath("/admin/sponsors");
    return { success: true, partner: created };
  }
}

export async function deletePartner(id: string) {
  const session = await requireAdmin();
  const original = await db.partner.findUnique({ where: { id } });
  if (!original) throw new Error("Partner not found");

  await db.partner.delete({ where: { id } });

  await writeAudit({
    userId: session.user.id,
    action: "DELETE",
    entityType: "Partner",
    entityId: id,
    before: original,
  });

  revalidatePath("/admin/sponsors");
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. SERIES & COMMUNITY ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface SeriesFormData {
  id?: string;
  name: string;
  slug: string;
  kind: SeriesKind;
  tagline?: string | null;
  description?: string | null;
  coverImage?: string | null;
  logo?: string | null;
  city?: string | null;
  region?: string | null;
  purpose?: string | null;
}

export async function createOrUpdateSeries(data: SeriesFormData) {
  const session = await requireAdmin();

  if (data.id) {
    const original = await db.series.findUnique({ where: { id: data.id } });
    const updated = await db.series.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]+/g, "-"),
        kind: data.kind,
        tagline: data.tagline || null,
        description: data.description || null,
        coverImage: data.coverImage || null,
        logo: data.logo || null,
        city: data.city || null,
        region: data.region || null,
        purpose: data.purpose || null,
      },
    });

    await writeAudit({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "Series",
      entityId: data.id,
      before: original,
      after: updated,
    });

    revalidatePath(data.kind === "MEETUP" ? "/admin/meetup-series" : "/admin/hackathon-series");
    return { success: true, series: updated };
  } else {
    const created = await db.series.create({
      data: {
        name: data.name,
        slug: data.slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]+/g, "-"),
        kind: data.kind,
        tagline: data.tagline || null,
        description: data.description || null,
        coverImage: data.coverImage || null,
        logo: data.logo || null,
        city: data.city || null,
        region: data.region || null,
        purpose: data.purpose || null,
      },
    });

    await writeAudit({
      userId: session.user.id,
      action: "CREATE",
      entityType: "Series",
      entityId: created.id,
      after: created,
    });

    revalidatePath(data.kind === "MEETUP" ? "/admin/meetup-series" : "/admin/hackathon-series");
    return { success: true, series: created };
  }
}

export async function deleteSeries(id: string) {
  const session = await requireAdmin();
  const original = await db.series.findUnique({ where: { id } });
  if (!original) throw new Error("Series not found");

  await db.series.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await writeAudit({
    userId: session.user.id,
    action: "DELETE",
    entityType: "Series",
    entityId: id,
    before: original,
  });

  revalidatePath(original.kind === "MEETUP" ? "/admin/meetup-series" : "/admin/hackathon-series");
  return { success: true };
}

export async function createCity(name: string, state: string) {
  const session = await requireAdmin();

  const city = await db.city.upsert({
    where: { name },
    update: { state },
    create: { name, state },
  });

  await writeAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "City",
    entityId: city.id,
    after: city,
  });

  revalidatePath("/admin/community");
  return { success: true, city };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. TECH TALK & HACKATHON RESOURCE ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export async function updateTechTalkResource(
  eventId: string,
  data: {
    speakerId?: string | null;
    slideUrl?: string | null;
    videoUrl?: string | null;
    repoUrl?: string | null;
    keyTakeaways?: string[];
    tags?: string[];
  }
) {
  const session = await requireAdmin();

  const resource = await db.techTalkResource.upsert({
    where: { eventId },
    update: {
      speakerId: data.speakerId || null,
      slideUrl: data.slideUrl || null,
      videoUrl: data.videoUrl || null,
      repoUrl: data.repoUrl || null,
      keyTakeaways: data.keyTakeaways || [],
      tags: data.tags || [],
    },
    create: {
      eventId,
      speakerId: data.speakerId || null,
      slideUrl: data.slideUrl || null,
      videoUrl: data.videoUrl || null,
      repoUrl: data.repoUrl || null,
      keyTakeaways: data.keyTakeaways || [],
      tags: data.tags || [],
    },
  });

  await writeAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "TechTalkResource",
    entityId: resource.id,
    after: resource,
  });

  revalidatePath("/admin/tech-talks");
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. GALLERY ADMIN ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export async function createAlbum(data: {
  title: string;
  category: string;
  eventId?: string | null;
  coverImage?: string | null;
  isPublished?: boolean;
}) {
  const session = await requireAdmin();

  const album = await db.galleryAlbum.create({
    data: {
      title: data.title,
      category: data.category,
      eventId: data.eventId || null,
      coverImage: data.coverImage || null,
      isPublished: Boolean(data.isPublished),
    },
  });

  await writeAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "GalleryAlbum",
    entityId: album.id,
    after: album,
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true, albumId: album.id };
}

export async function toggleAlbumPublish(id: string, isPublished: boolean) {
  const session = await requireAdmin();

  const updated = await db.galleryAlbum.update({
    where: { id },
    data: { isPublished },
  });

  await writeAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "GalleryAlbum",
    entityId: id,
    after: { isPublished: updated.isPublished },
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true, isPublished: updated.isPublished };
}

export async function deleteAlbum(id: string) {
  const session = await requireAdmin();

  await db.galleryAlbum.delete({
    where: { id },
  });

  await writeAudit({
    userId: session.user.id,
    action: "DELETE",
    entityType: "GalleryAlbum",
    entityId: id,
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. EMAIL LOG & QUEUE ADMIN ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export async function retryAdminEmailLog(id: string) {
  const session = await requireAdmin();
  const res = await retryEmailJob(id);

  await writeAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "EmailLog",
    entityId: id,
    before: { action: "MANUAL_RETRY_INITIATED" },
    after: { success: res.success, error: res.error },
  });

  revalidatePath("/admin/email-logs");
  return res;
}

export async function processAdminEmailQueue() {
  await requireAdmin();
  const res = await processEmailQueue({ batchSize: 50 });
  revalidatePath("/admin/email-logs");
  return res;
}
