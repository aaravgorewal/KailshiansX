/**
 * Calendar utilities for KailshiansX events
 * Generates iCalendar (.ics) files and Google Calendar URLs
 */

export interface CalendarEventData {
  title: string;
  description?: string | null;
  slug: string;
  startDate: Date;
  endDate?: Date | null;
  venue?: string | null;
  venueAddress?: string | null;
  cityName?: string | null;
  appUrl?: string;
}

function formatDateToICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Format string for ICS line folding and escaping special characters
 */
function escapeICS(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/**
 * Generate standard RFC 5545 iCalendar content string (.ics)
 */
export function generateIcs(event: CalendarEventData): string {
  const url = `${event.appUrl ?? "https://kailshiansx.com"}/events/${event.slug}`;
  const dtStart = formatDateToICS(event.startDate);
  // Default to 2 hours if no endDate provided
  const endDate = event.endDate ?? new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000);
  const dtEnd = formatDateToICS(endDate);
  const now = formatDateToICS(new Date());

  const locationParts = [event.venue, event.venueAddress, event.cityName].filter(Boolean);
  const location = escapeICS(locationParts.join(", "));
  const summary = escapeICS(event.title);
  const description = escapeICS(
    `${event.description ?? ""}\n\nEvent details & registration: ${url}`
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KailshiansX//Developer Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.slug}-${event.startDate.getTime()}@kailshiansx.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `URL:${url}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Generate Google Calendar direct web add URL
 */
export function getGoogleCalendarUrl(event: CalendarEventData): string {
  const url = `${event.appUrl ?? "https://kailshiansx.com"}/events/${event.slug}`;
  const dtStart = formatDateToICS(event.startDate);
  const endDate = event.endDate ?? new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000);
  const dtEnd = formatDateToICS(endDate);

  const locationParts = [event.venue, event.venueAddress, event.cityName].filter(Boolean);
  const location = locationParts.join(", ");
  const details = `${event.description ?? ""}\n\nEvent details & passes: ${url}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${dtStart}/${dtEnd}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
