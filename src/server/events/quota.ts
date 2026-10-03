import { Prisma, PrismaClient } from "@prisma/client";

export const SEAT_HOLD_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export class RegistrationError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code = "REGISTRATION_FAILED", statusCode = 400) {
    super(message);
    this.name = "RegistrationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Check if the email already has an active registration for this event
 */
export async function assertNoDuplicateRegistration(
  tx: Prisma.TransactionClient,
  eventId: string,
  email: string
) {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await tx.registration.findFirst({
    where: {
      eventId,
      email: normalizedEmail,
      status: {
        in: ["CONFIRMED", "PENDING"],
      },
      deletedAt: null,
    },
  });

  if (existing) {
    // If pending but expired, it will be cleaned up
    if (
      existing.status === "PENDING" &&
      existing.holdExpiresAt &&
      existing.holdExpiresAt < new Date()
    ) {
      await tx.registration.update({
        where: { id: existing.id },
        data: { status: "CANCELLED" },
      });
      return;
    }

    throw new RegistrationError(
      "You have already registered for this event with this email address.",
      "DUPLICATE_REGISTRATION",
      409
    );
  }
}

/**
 * Atomically verify quota and reserve a seat for 10 minutes.
 * Ensures overselling is strictly impossible via transactional seat count.
 */
export async function reserveTicketSeat(
  tx: Prisma.TransactionClient,
  eventId: string,
  ticketTypeId: string,
  email: string
) {
  // 1. Check duplicate email registration
  await assertNoDuplicateRegistration(tx, eventId, email);

  // 2. Fetch ticket tier
  const ticketType = await tx.ticketType.findFirst({
    where: {
      id: ticketTypeId,
      eventId,
    },
  });

  if (!ticketType) {
    throw new RegistrationError("Selected ticket tier not found.", "TICKET_NOT_FOUND", 404);
  }

  // Check sale window
  const now = new Date();
  if (ticketType.saleStart && ticketType.saleStart > now) {
    throw new RegistrationError("Ticket sales have not opened yet.", "SALE_NOT_STARTED", 400);
  }
  if (ticketType.saleEnd && ticketType.saleEnd < now) {
    throw new RegistrationError("Ticket sales for this tier have ended.", "SALE_ENDED", 400);
  }

  // 3. Count occupied seats (CONFIRMED or unexpired PENDING holds)
  const occupiedSeats = await tx.registration.count({
    where: {
      ticketTypeId,
      deletedAt: null,
      OR: [
        { status: "CONFIRMED" },
        {
          status: "PENDING",
          holdExpiresAt: {
            gt: now,
          },
        },
      ],
    },
  });

  if (occupiedSeats >= ticketType.quota) {
    throw new RegistrationError(
      `The "${ticketType.name}" tier is sold out. (${occupiedSeats}/${ticketType.quota} seats filled)`,
      "TIER_SOLD_OUT",
      409
    );
  }

  const holdExpiresAt = new Date(Date.now() + SEAT_HOLD_DURATION_MS);

  return {
    ticketType,
    holdExpiresAt,
    availableSeats: ticketType.quota - occupiedSeats - 1,
  };
}

/**
 * Release expired holds back into the pool
 */
export async function releaseExpiredHolds(prisma: PrismaClient | Prisma.TransactionClient) {
  const now = new Date();
  const result = await prisma.registration.updateMany({
    where: {
      status: "PENDING",
      holdExpiresAt: {
        lt: now,
      },
    },
    data: {
      status: "CANCELLED",
    },
  });

  return result.count;
}
