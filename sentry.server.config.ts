// sentry.server.config.ts — Server-side error tracking for Node.js runtime
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  debug: false,
  enabled: process.env.NODE_ENV === "production" && Boolean(SENTRY_DSN),
});
