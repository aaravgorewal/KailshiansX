/**
 * Single source of truth for date and time formatting across the application.
 * All formatting uses the "Asia/Kolkata" timezone and "en-IN" locale.
 * Example output: "Sat, 18 Oct 2026 · 3:00 PM IST"
 */

const TIME_ZONE = "Asia/Kolkata";
const LOCALE = "en-IN";

function toDate(input: string | Date | number | null | undefined): Date | null {
  if (input === null || input === undefined || input === "") return null;
  const d = typeof input === "object" ? input : new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

function getParts(d: Date, options: Intl.DateTimeFormatOptions) {
  const parts = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    ...options,
  }).formatToParts(d);
  return (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value || "";
}

/**
 * Full formatted event date and time:
 * e.g. "Sat, 18 Oct 2026 · 3:00 PM IST"
 */
export function formatDateTime(dateInput: string | Date | number | null | undefined): string {
  const d = toDate(dateInput);
  if (!d) return "—";

  const get = getParts(d, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const weekday = get("weekday");
  const day = get("day");
  const month = get("month");
  const year = get("year");
  const hour = get("hour");
  const minute = get("minute");
  const period = get("dayPeriod").toUpperCase();

  return `${weekday}, ${day} ${month} ${year} · ${hour}:${minute} ${period} IST`;
}

/**
 * Formatted event date without time:
 * e.g. "Sat, 18 Oct 2026"
 */
export function formatDate(dateInput: string | Date | number | null | undefined): string {
  const d = toDate(dateInput);
  if (!d) return "—";

  const get = getParts(d, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${get("weekday")}, ${get("day")} ${get("month")} ${get("year")}`;
}

/**
 * Short formatted event date:
 * e.g. "18 Oct 2026"
 */
export function formatDateShort(dateInput: string | Date | number | null | undefined): string {
  const d = toDate(dateInput);
  if (!d) return "—";

  const get = getParts(d, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${get("day")} ${get("month")} ${get("year")}`;
}

/**
 * Formatted event time with IST:
 * e.g. "3:00 PM IST"
 */
export function formatTime(dateInput: string | Date | number | null | undefined): string {
  const d = toDate(dateInput);
  if (!d) return "";

  const get = getParts(d, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const hour = get("hour");
  const minute = get("minute");
  const period = get("dayPeriod").toUpperCase();

  return `${hour}:${minute} ${period} IST`;
}

/**
 * Formatted short time without timezone suffix (useful in compact schedule lists):
 * e.g. "3:00 PM"
 */
export function formatTimeShort(dateInput: string | Date | number | null | undefined): string {
  const d = toDate(dateInput);
  if (!d) return "";

  const get = getParts(d, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const hour = get("hour");
  const minute = get("minute");
  const period = get("dayPeriod").toUpperCase();

  return `${hour}:${minute} ${period}`;
}

/**
 * Formatted time range:
 * e.g. "3:00 PM - 5:30 PM IST" or "3:00 PM IST"
 */
export function formatTimeRange(
  startInput: string | Date | number | null | undefined,
  endInput?: string | Date | number | null | undefined
): string {
  const start = toDate(startInput);
  if (!start) return "";
  const end = toDate(endInput);

  if (!end) {
    return formatTime(start);
  }

  const startStr = formatTimeShort(start);
  const endStr = formatTimeShort(end);

  return `${startStr} – ${endStr} IST`;
}

/**
 * Formatted event date & time range:
 * e.g. "Sat, 18 Oct 2026 · 3:00 PM – 5:30 PM IST"
 */
export function formatDateTimeRange(
  startInput: string | Date | number | null | undefined,
  endInput?: string | Date | number | null | undefined
): string {
  const start = toDate(startInput);
  if (!start) return "—";
  const dateStr = formatDate(start);
  const timeStr = formatTimeRange(start, endInput);

  return timeStr ? `${dateStr} · ${timeStr}` : dateStr;
}

/**
 * Day number in Asia/Kolkata timezone:
 * e.g. "18"
 */
export function formatDayNumber(dateInput: string | Date | number | null | undefined): string {
  const d = toDate(dateInput);
  if (!d) return "";
  const get = getParts(d, { day: "numeric" });
  return get("day");
}

/**
 * Month short abbreviation uppercase in Asia/Kolkata timezone:
 * e.g. "OCT"
 */
export function formatMonthShort(dateInput: string | Date | number | null | undefined): string {
  const d = toDate(dateInput);
  if (!d) return "";
  const get = getParts(d, { month: "short" });
  return get("month").toUpperCase();
}
