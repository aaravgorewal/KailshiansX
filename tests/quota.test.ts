import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";

import { db } from "../src/lib/db";
import {
  reserveTicketSeat,
  assertNoDuplicateRegistration,
  RegistrationError,
} from "../src/server/events/quota";

describe("Ticket Quota & Atomic Concurrency Enforcement", () => {
  let testEventId: string;
  let testTicketTypeId: string;
  const testSlug = `quota-test-${Date.now()}`;

  before(async () => {
    // 1. Create a dedicated test event
    const event = await db.event.create({
      data: {
        title: "Quota Concurrency Test Summit",
        slug: testSlug,
        type: "MEETUP",
        status: "PUBLISHED",
        startDate: new Date(Date.now() + 86400000),
        venue: "Virtual Test Arena",
      },
    });
    testEventId = event.id;

    // 2. Create a ticket type with strict quota = 2
    const ticketType = await db.ticketType.create({
      data: {
        eventId: testEventId,
        name: "Limited Builder Pass",
        price: 0,
        quota: 2,
      },
    });
    testTicketTypeId = ticketType.id;
  });

  after(async () => {
    // Clean up all test registrations, tickets and event
    await db.registration.deleteMany({
      where: { eventId: testEventId },
    });
    await db.ticketType.deleteMany({
      where: { eventId: testEventId },
    });
    await db.event.delete({
      where: { id: testEventId },
    });
  });

  it("should reserve 1st seat and return a 10-minute hold window", async () => {
    const email = "builder1@kailshians.org";

    const res = await db.$transaction(async (tx) => {
      const reservation = await reserveTicketSeat(tx, testEventId, testTicketTypeId, email);

      // Create pending registration with the hold
      await tx.registration.create({
        data: {
          registrationCode: "KX-TEST-0001",
          eventId: testEventId,
          ticketTypeId: testTicketTypeId,
          name: "Builder One",
          email,
          phone: "+919876543210",
          status: "PENDING",
          holdExpiresAt: reservation.holdExpiresAt,
        },
      });

      return reservation;
    });

    assert.ok(res.holdExpiresAt);
    const holdRemainingMs = res.holdExpiresAt.getTime() - Date.now();
    assert.ok(
      holdRemainingMs > 9 * 60 * 1000 && holdRemainingMs <= 10 * 60 * 1000,
      "Hold expiration should be ~10 minutes from now"
    );
    assert.equal(res.availableSeats, 1, "Should have 1 seat remaining");
  });

  it("should reserve 2nd seat filling up the quota", async () => {
    const email = "builder2@kailshians.org";

    const res = await db.$transaction(async (tx) => {
      const reservation = await reserveTicketSeat(tx, testEventId, testTicketTypeId, email);

      await tx.registration.create({
        data: {
          registrationCode: "KX-TEST-0002",
          eventId: testEventId,
          ticketTypeId: testTicketTypeId,
          name: "Builder Two",
          email,
          phone: "+919876543211",
          status: "PENDING",
          holdExpiresAt: reservation.holdExpiresAt,
        },
      });

      return reservation;
    });

    assert.equal(res.availableSeats, 0, "All 2 seats should now be reserved");
  });

  it("should strictly reject 3rd seat reservation atomically with TIER_SOLD_OUT", async () => {
    const email = "builder3@kailshians.org";

    await assert.rejects(
      async () => {
        await db.$transaction(async (tx) => {
          await reserveTicketSeat(tx, testEventId, testTicketTypeId, email);
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof RegistrationError);
        assert.equal(err.code, "TIER_SOLD_OUT");
        assert.equal(err.statusCode, 409);
        assert.match(err.message, /sold out/i);
        return true;
      }
    );
  });

  it("should prevent duplicate registration for same email and event", async () => {
    // Attempt duplicate for builder1 (case-insensitive)
    await assert.rejects(
      async () => {
        await db.$transaction(async (tx) => {
          await assertNoDuplicateRegistration(tx, testEventId, "BUILDER1@KAILSHIANS.ORG");
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof RegistrationError);
        assert.equal(err.code, "DUPLICATE_REGISTRATION");
        assert.equal(err.statusCode, 409);
        return true;
      }
    );
  });

  it("should automatically recycle expired seat holds so new users can reserve", async () => {
    // Simulate expired hold for builder2 (set holdExpiresAt to 15 minutes in past)
    await db.registration.updateMany({
      where: {
        eventId: testEventId,
        email: "builder2@kailshians.org",
      },
      data: {
        holdExpiresAt: new Date(Date.now() - 15 * 60 * 1000),
      },
    });

    // Now builder3 attempts reservation - should succeed because builder2's hold expired
    const email3 = "builder3@kailshians.org";
    const res = await db.$transaction(async (tx) => {
      const reservation = await reserveTicketSeat(tx, testEventId, testTicketTypeId, email3);

      await tx.registration.create({
        data: {
          registrationCode: "KX-TEST-0003",
          eventId: testEventId,
          ticketTypeId: testTicketTypeId,
          name: "Builder Three",
          email: email3,
          phone: "+919876543212",
          status: "CONFIRMED", // Confirmed purchase
        },
      });

      return reservation;
    });

    assert.ok(res, "Reservation for builder 3 should succeed after hold expiry");
    assert.equal(res.availableSeats, 0);
  });
});
