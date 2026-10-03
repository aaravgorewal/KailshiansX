// src/lib/analytics.ts — Google Analytics 4 (GA4) & Internal Event Telemetry

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

export type AnalyticsEventType =
  "page_view" | "register_click" | "payment_success" | "application_submit" | (string & {});

export interface RegisterClickPayload {
  eventSlug: string;
  eventTitle: string;
  ticketTier?: string;
  price?: number;
  [key: string]: unknown;
}

export interface PaymentSuccessPayload {
  orderId: string;
  paymentId: string;
  amount: number;
  eventSlug?: string;
  [key: string]: unknown;
}

export interface ApplicationSubmitPayload {
  type: "team" | "campus_lead" | "state_lead" | "collaboration";
  roleOrTrack?: string;
  [key: string]: unknown;
}

export interface PageViewPayload {
  url: string;
  title?: string;
  [key: string]: unknown;
}

/**
 * Dispatches event to Google Analytics 4 (GA4) if initialized.
 */
function sendToGA4(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

/**
 * Sends event to internal analytics telemetry endpoint.
 */
async function sendToInternalTelemetry(eventName: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  try {
    const body = JSON.stringify({
      event: eventName,
      payload,
      pathname: window.location.pathname,
      referrer: document.referrer || null,
      timestamp: new Date().toISOString(),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/events", body);
    } else {
      await fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch (err) {
    // Non-blocking telemetry failure
    console.debug("[Analytics Telemetry Warning]:", err);
  }
}

/**
 * Main tracking function for GA4 and internal tracking.
 */
export function trackEvent(eventName: AnalyticsEventType, payload: Record<string, unknown> = {}) {
  sendToGA4(eventName, payload);
  sendToInternalTelemetry(eventName, payload);
}

/**
 * Convenience helper: Track Page View
 */
export function trackPageView(url: string, title?: string) {
  trackEvent("page_view", {
    url,
    title: title || (typeof document !== "undefined" ? document.title : undefined),
  });
}

/**
 * Convenience helper: Track Register CTA Click
 */
export function trackRegisterClick(payload: RegisterClickPayload) {
  trackEvent("register_click", payload);
}

/**
 * Convenience helper: Track Successful Payment
 */
export function trackPaymentSuccess(payload: PaymentSuccessPayload) {
  trackEvent("payment_success", payload);
}

/**
 * Convenience helper: Track Application Submission (Team, Leads, Collaborations)
 */
export function trackApplicationSubmit(payload: ApplicationSubmitPayload) {
  trackEvent("application_submit", payload);
}
