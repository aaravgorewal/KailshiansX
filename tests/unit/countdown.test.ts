import { describe, it, expect } from "vitest";
import {
  getCountdown,
  getCountdownAccessibleLabel,
  getCountdownHeadline,
  padCountdownUnit,
} from "@/lib/countdown";

describe("Event countdown math", () => {
  const start = new Date("2026-10-18T09:30:00.000Z").getTime();
  const end = new Date("2026-10-18T17:30:00.000Z").getTime();

  it("splits remaining time for an upcoming event", () => {
    const now = start - (2 * 86_400_000 + 5 * 3_600_000 + 7 * 60_000 + 9 * 1000);
    const snapshot = getCountdown(now, start, end);

    expect(snapshot.phase).toBe("upcoming");
    expect(snapshot.days).toBe(2);
    expect(snapshot.hours).toBe(5);
    expect(snapshot.minutes).toBe(7);
    expect(snapshot.seconds).toBe(9);
  });

  it("treats time between start and end as live with remaining until end", () => {
    const now = start + 90 * 60_000;
    const snapshot = getCountdown(now, start, end);

    expect(snapshot.phase).toBe("live");
    expect(snapshot.hours).toBe(6);
    expect(snapshot.minutes).toBe(30);
  });

  it("marks the event ended after endDate", () => {
    const snapshot = getCountdown(end + 1_000, start, end);
    expect(snapshot.phase).toBe("ended");
    expect(snapshot.totalMs).toBe(0);
    expect(snapshot.seconds).toBe(0);
  });

  it("stays live with zero remaining when there is no endDate", () => {
    const snapshot = getCountdown(start + 1_000, start, null);
    expect(snapshot.phase).toBe("live");
    expect(snapshot.totalMs).toBe(0);
    expect(getCountdownHeadline(snapshot.phase, snapshot.totalMs > 0)).toBe("Happening now");
  });

  it("pads units so the UI never renders a stray 0", () => {
    expect(padCountdownUnit(0)).toBe("00");
    expect(padCountdownUnit(4)).toBe("04");
    expect(padCountdownUnit(12)).toBe("12");
  });

  it("builds a seconds-free accessible label", () => {
    const snapshot = getCountdown(start - (1 * 86_400_000 + 2 * 3_600_000), start, end);
    expect(getCountdownAccessibleLabel(snapshot)).toBe("Starts in 1 day and 2 hours");
    expect(getCountdownAccessibleLabel({ ...snapshot, phase: "ended", totalMs: 0 })).toBe(
      "This event has ended"
    );
  });
});
