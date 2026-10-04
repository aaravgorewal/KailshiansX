import { describe, it, expect, vi } from "vitest";
import {
  RegistrationError,
  SEAT_HOLD_DURATION_MS,
  assertNoDuplicateRegistration,
  reserveTicketSeat,
} from "@/server/events/quota";

describe("Event & Quota Services (Unit)", () => {
  it("should initialize RegistrationError with correct code and status", () => {
    const error = new RegistrationError("Test error message", "CUSTOM_CODE", 418);
    expect(error.name).toBe("RegistrationError");
    expect(error.message).toBe("Test error message");
    expect(error.code).toBe("CUSTOM_CODE");
    expect(error.statusCode).toBe(418);
  });

  it("should define a 10-minute seat hold window", () => {
    expect(SEAT_HOLD_DURATION_MS).toBe(10 * 60 * 1000);
  });

  it("should throw DUPLICATE_REGISTRATION when active registration exists", async () => {
    const mockTx = {
      registration: {
        findFirst: vi.fn().mockResolvedValue({
          id: "reg_existing",
          status: "CONFIRMED",
        }),
      },
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    await expect(
      assertNoDuplicateRegistration(mockTx, "evt_1", "user@example.com")
    ).rejects.toThrow("already registered for this event");
  });

  it("should allow registration if existing pending registration is expired", async () => {
    const pastDate = new Date(Date.now() - 10000);
    const mockTx = {
      registration: {
        findFirst: vi.fn().mockResolvedValue({
          id: "reg_expired",
          status: "PENDING",
          holdExpiresAt: pastDate,
        }),
        update: vi.fn().mockResolvedValue({ id: "reg_expired", status: "CANCELLED" }),
      },
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    await expect(
      assertNoDuplicateRegistration(mockTx, "evt_1", "user@example.com")
    ).resolves.toBeUndefined();

    expect(mockTx.registration.update).toHaveBeenCalledWith({
      where: { id: "reg_expired" },
      data: { status: "CANCELLED" },
    });
  });

  it("should throw TIER_SOLD_OUT when occupied seats meet or exceed quota", async () => {
    const mockTx = {
      registration: {
        findFirst: vi.fn().mockResolvedValue(null),
        count: vi.fn().mockResolvedValue(100),
      },
      ticketType: {
        findFirst: vi.fn().mockResolvedValue({
          id: "tkt_tier_1",
          eventId: "evt_1",
          name: "General Admission",
          quota: 100,
          saleStart: null,
          saleEnd: null,
        }),
      },
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    await expect(
      reserveTicketSeat(mockTx, "evt_1", "tkt_tier_1", "newuser@example.com")
    ).rejects.toThrow("sold out");
  });

  it("should successfully reserve a seat and calculate remaining seats when capacity allows", async () => {
    const mockTx = {
      registration: {
        findFirst: vi.fn().mockResolvedValue(null),
        count: vi.fn().mockResolvedValue(20),
      },
      ticketType: {
        findFirst: vi.fn().mockResolvedValue({
          id: "tkt_tier_1",
          eventId: "evt_1",
          name: "VIP Pass",
          quota: 50,
          saleStart: null,
          saleEnd: null,
        }),
      },
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    const reservation = await reserveTicketSeat(
      mockTx,
      "evt_1",
      "tkt_tier_1",
      "vipuser@example.com"
    );

    expect(reservation.ticketType.name).toBe("VIP Pass");
    expect(reservation.availableSeats).toBe(29); // 50 - 20 - 1
    expect(reservation.holdExpiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});
