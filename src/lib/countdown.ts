export type CountdownPhase = "upcoming" | "live" | "ended";

export interface CountdownSnapshot {
  phase: CountdownPhase;
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function toMs(input: Date | string | number): number {
  const t = typeof input === "number" ? input : new Date(input).getTime();
  return Number.isNaN(t) ? NaN : t;
}

function splitRemaining(ms: number, phase: CountdownPhase): CountdownSnapshot {
  const totalMs = Math.max(0, ms);
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return { phase, totalMs, days, hours, minutes, seconds };
}

/**
 * Split time until the next event boundary.
 * Upcoming → remaining until start. Live → remaining until end (if known).
 */
export function getCountdown(
  nowInput: Date | string | number,
  startInput: Date | string | number,
  endInput?: Date | string | number | null
): CountdownSnapshot {
  const now = toMs(nowInput);
  const start = toMs(startInput);
  const end =
    endInput === null || endInput === undefined || endInput === "" ? null : toMs(endInput);

  if (Number.isNaN(now) || Number.isNaN(start) || (end !== null && Number.isNaN(end))) {
    return splitRemaining(0, "ended");
  }

  if (now < start) {
    return splitRemaining(start - now, "upcoming");
  }

  if (end === null || now < end) {
    return splitRemaining(end === null ? 0 : end - now, "live");
  }

  return splitRemaining(0, "ended");
}

export function padCountdownUnit(value: number): string {
  return String(Math.max(0, value)).padStart(2, "0");
}

/** Screen-reader label without seconds, so it does not chatter every tick. */
export function getCountdownAccessibleLabel(snapshot: CountdownSnapshot): string {
  const { phase, days, hours, minutes } = snapshot;

  if (phase === "ended") return "This event has ended";
  if (phase === "live" && snapshot.totalMs === 0) return "This event is happening now";

  const prefix = phase === "upcoming" ? "Starts in" : "Ends in";

  if (days > 0)
    return `${prefix} ${days} day${days === 1 ? "" : "s"} and ${hours} hour${hours === 1 ? "" : "s"}`;
  if (hours > 0)
    return `${prefix} ${hours} hour${hours === 1 ? "" : "s"} and ${minutes} minute${minutes === 1 ? "" : "s"}`;
  if (minutes > 0) return `${prefix} ${minutes} minute${minutes === 1 ? "" : "s"}`;
  return phase === "upcoming" ? "Starts in less than a minute" : "Ends in less than a minute";
}

export function getCountdownHeadline(phase: CountdownPhase, hasEndRemaining: boolean): string {
  if (phase === "ended") return "Event ended";
  if (phase === "live" && !hasEndRemaining) return "Happening now";
  if (phase === "live") return "Ends in";
  return "Starts in";
}
