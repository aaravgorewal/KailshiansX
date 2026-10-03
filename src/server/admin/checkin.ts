"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import { writeAudit } from "@/server/auth/audit";
import { verifyQrPayload } from "@/server/events/registration";

export interface CheckinResult {
  success: boolean;
  message?: string;
  error?: string;
  alreadyCheckedIn?: boolean;
  attendee?: {
    id: string;
    registrationCode: string;
    name: string;
    email: string;
    phone?: string | null;
    college?: string | null;
    city?: string | null;
    ticketTier: string;
    eventTitle: string;
    eventId: string;
    status: string;
    checkedInAt?: string;
    checkedInBy?: string | null;
    method?: string;
  };
}

/**
 * Server action to verify signed QR code or code and mark Attendance
 */
export async function checkinAttendee({
  qrTokenOrCode,
  eventId,
  method = "QR",
}: {
  qrTokenOrCode: string;
  eventId?: string;
  method?: "QR" | "MANUAL";
}): Promise<CheckinResult> {
  const session = await requireAdmin();
  const trimmed = qrTokenOrCode.trim();

  if (!trimmed) {
    return { success: false, error: "No QR code or registration code provided." };
  }

  let targetCode = trimmed;
  let verifiedEventId: string | undefined = undefined;

  // Check if it's a signed QR payload token (format: <b64>.<signature>)
  if (trimmed.includes(".")) {
    const verified = verifyQrPayload(trimmed);
    if (!verified.valid || !verified.payload) {
      return {
        success: false,
        error: verified.error || "Tampered or invalid QR code signature.",
      };
    }
    targetCode = verified.payload.registrationCode;
    verifiedEventId = verified.payload.eventId;
  }

  // Find registration in database
  const registration = await db.registration.findFirst({
    where: {
      OR: [{ registrationCode: targetCode }, { id: targetCode }],
      deletedAt: null,
    },
    include: {
      event: true,
      ticketType: true,
      attendance: true,
    },
  });

  if (!registration) {
    return {
      success: false,
      error: `Pass not found in database (${targetCode}).`,
    };
  }

  // Validate event context
  if (eventId && registration.eventId !== eventId) {
    return {
      success: false,
      error: `Wrong Event: This pass is for "${registration.event.title}", not the selected event.`,
    };
  }

  if (verifiedEventId && verifiedEventId !== registration.eventId) {
    return {
      success: false,
      error:
        "Security Mismatch: The event embedded in the QR signature does not match database records.",
    };
  }

  // Check ticket status
  if (registration.status === "CANCELLED") {
    return {
      success: false,
      error:
        "Pass Void: This registration was CANCELLED or refunded and is not eligible for entry.",
    };
  }

  if (registration.status === "PENDING") {
    return {
      success: false,
      error: "Payment Incomplete: This registration is still PENDING payment.",
    };
  }

  // Check duplicate attendance
  if (registration.attendance) {
    return {
      success: false,
      alreadyCheckedIn: true,
      error: `Already Checked In at ${new Date(
        registration.attendance.checkedInAt
      ).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`,
      attendee: {
        id: registration.id,
        registrationCode: registration.registrationCode,
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        college: registration.college,
        city: registration.city,
        ticketTier: registration.ticketType.name,
        eventTitle: registration.event.title,
        eventId: registration.eventId,
        status: registration.status,
        checkedInAt: registration.attendance.checkedInAt.toISOString(),
        checkedInBy: registration.attendance.checkedInBy,
        method: registration.attendance.method,
      },
    };
  }

  // Create attendance record atomically
  const staffIdentifier = session.user.name || session.user.email || session.user.id;
  const attendance = await db.attendance.create({
    data: {
      registrationId: registration.id,
      checkedInBy: staffIdentifier,
      method,
    },
  });

  // Write audit log
  await writeAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Attendance",
    entityId: attendance.id,
    after: {
      registrationId: registration.id,
      registrationCode: registration.registrationCode,
      attendeeName: registration.name,
      checkedInBy: staffIdentifier,
      method,
    },
  });

  return {
    success: true,
    message: "Check-in successful! Welcome to the event.",
    attendee: {
      id: registration.id,
      registrationCode: registration.registrationCode,
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      college: registration.college,
      city: registration.city,
      ticketTier: registration.ticketType.name,
      eventTitle: registration.event.title,
      eventId: registration.eventId,
      status: registration.status,
      checkedInAt: attendance.checkedInAt.toISOString(),
      checkedInBy: attendance.checkedInBy,
      method: attendance.method,
    },
  };
}

/**
 * Search attendee list manually by query (name, email, phone, code)
 */
export async function lookupRegistrations({
  search,
  eventId,
}: {
  search: string;
  eventId?: string;
}) {
  await requireAdmin();
  const q = search.trim();
  if (!q) return [];

  const registrations = await db.registration.findMany({
    where: {
      deletedAt: null,
      ...(eventId ? { eventId } : {}),
      OR: [
        { registrationCode: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ],
    },
    include: {
      event: { select: { id: true, title: true, slug: true } },
      ticketType: { select: { id: true, name: true, price: true } },
      attendance: true,
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  return registrations.map((r) => ({
    id: r.id,
    registrationCode: r.registrationCode,
    name: r.name,
    email: r.email,
    phone: r.phone,
    college: r.college,
    city: r.city,
    status: r.status,
    eventTitle: r.event.title,
    eventId: r.event.id,
    ticketTier: r.ticketType.name,
    isCheckedIn: Boolean(r.attendance),
    checkedInAt: r.attendance?.checkedInAt.toISOString(),
  }));
}

/**
 * Get recent check-ins for the event
 */
export async function getRecentCheckins(eventId?: string) {
  await requireAdmin();

  const checkins = await db.attendance.findMany({
    where: {
      ...(eventId ? { registration: { eventId } } : {}),
    },
    include: {
      registration: {
        include: {
          event: { select: { title: true } },
          ticketType: { select: { name: true } },
        },
      },
    },
    take: 15,
    orderBy: { checkedInAt: "desc" },
  });

  return checkins.map((c) => ({
    id: c.id,
    attendeeName: c.registration.name,
    email: c.registration.email,
    registrationCode: c.registration.registrationCode,
    eventTitle: c.registration.event.title,
    ticketTier: c.registration.ticketType.name,
    checkedInAt: c.checkedInAt.toISOString(),
    checkedInBy: c.checkedInBy,
    method: c.method,
  }));
}
