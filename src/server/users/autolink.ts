// src/server/users/autolink.ts
// Service to automatically associate past registrations, payments, certificates,
// and applications with a user account matching their verified email address.

import { db } from "@/lib/db";

export interface AutoLinkResult {
  userId: string;
  email: string;
  registrationsLinked: number;
  paymentsLinked: number;
  certificatesLinked: number;
  teamApplicationsLinked: number;
  campusLeadApplicationsLinked: number;
  stateLeadApplicationsLinked: number;
}

/**
 * Derives a clean, URL-friendly unique username handle from name or email.
 */
export async function ensureUserHasUsername(
  userId: string,
  name?: string | null,
  email?: string
): Promise<string> {
  const existing = await db.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });

  if (existing?.username) {
    return existing.username;
  }

  // Generate base candidate
  let base = "";
  if (name) {
    base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  if (!base && email) {
    base = email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  }
  if (!base || base.length < 3) {
    base = `builder-${userId.slice(-6).toLowerCase()}`;
  }

  // Ensure uniqueness
  let candidate = base;
  let counter = 1;
  while (true) {
    const conflict = await db.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!conflict || conflict.id === userId) break;
    candidate = `${base}-${counter++}`;
  }

  await db.user.update({
    where: { id: userId },
    data: { username: candidate },
  });

  return candidate;
}

/**
 * Scans the database for unlinked or orphan records associated with the user's email
 * and associates them directly with the user's ID.
 */
export async function autoLinkUserRecords(userId: string, email: string): Promise<AutoLinkResult> {
  const normalizedEmail = email.trim().toLowerCase();

  // Ensure user has a unique username slug for their public Developer Passport
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, username: true },
  });
  if (!user?.username) {
    await ensureUserHasUsername(userId, user?.name, normalizedEmail);
  }

  // 1. Link Registrations
  const unlinkedRegistrations = await db.registration.findMany({
    where: {
      email: { equals: normalizedEmail, mode: "insensitive" },
      OR: [{ userId: null }, { userId: { not: userId } }],
    },
    select: { id: true },
  });

  let registrationsLinked = 0;
  if (unlinkedRegistrations.length > 0) {
    const regIds = unlinkedRegistrations.map((r) => r.id);
    const updateResult = await db.registration.updateMany({
      where: { id: { in: regIds } },
      data: { userId },
    });
    registrationsLinked = updateResult.count;
  }

  // 2. Link Payments associated with this user's registrations or orphan email
  const updatePaymentsResult = await db.payment.updateMany({
    where: {
      registration: { email: { equals: normalizedEmail, mode: "insensitive" } },
      OR: [{ userId: null }, { userId: { not: userId } }],
    },
    data: { userId },
  });
  const paymentsLinked = updatePaymentsResult.count;

  // 3. Link Certificates
  const updateCertsResult = await db.certificate.updateMany({
    where: {
      participantEmail: { equals: normalizedEmail, mode: "insensitive" },
      OR: [{ userId: null }, { userId: { not: userId } }],
    },
    data: { userId },
  });
  const certificatesLinked = updateCertsResult.count;

  // 4. Link Team Applications
  const updateTeamApps = await db.teamApplication.updateMany({
    where: {
      email: { equals: normalizedEmail, mode: "insensitive" },
      OR: [{ userId: null }, { userId: { not: userId } }],
    },
    data: { userId },
  });
  const teamApplicationsLinked = updateTeamApps.count;

  // 5. Link Campus Lead Applications
  const updateCampusApps = await db.campusLeadApplication.updateMany({
    where: {
      email: { equals: normalizedEmail, mode: "insensitive" },
      OR: [{ userId: null }, { userId: { not: userId } }],
    },
    data: { userId },
  });
  const campusLeadApplicationsLinked = updateCampusApps.count;

  // 6. Link State Lead Applications
  const updateStateApps = await db.stateLeadApplication.updateMany({
    where: {
      email: { equals: normalizedEmail, mode: "insensitive" },
      OR: [{ userId: null }, { userId: { not: userId } }],
    },
    data: { userId },
  });
  const stateLeadApplicationsLinked = updateStateApps.count;

  return {
    userId,
    email: normalizedEmail,
    registrationsLinked,
    paymentsLinked,
    certificatesLinked,
    teamApplicationsLinked,
    campusLeadApplicationsLinked,
    stateLeadApplicationsLinked,
  };
}
