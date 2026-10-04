// src/lib/env.ts — Type-safe environment validation at boot
import { z } from "zod";

const envSchema = z.object({
  // App basics
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("KailshiansX"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Authentication
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_URL: z.string().url().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  // Transactional Email
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().default("hello@kailshiansx.com"),

  // Razorpay Gateway
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // Object Storage
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default("ap-south-1"),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().default("kailshiansx-media"),
  NEXT_PUBLIC_CDN_URL: z.string().url().optional(),

  // Rate Limiting (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Analytics & Cloudflare
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),

  // Error Tracking (Sentry)
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

let cachedEnv: ValidatedEnv | null = null;

/**
 * Validates process.env against the Zod schema.
 * Throws an explicit error in production if critical variables are missing.
 * In development and test, prints helpful warnings for optional integrations.
 */
export function validateEnv(): ValidatedEnv {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const isProduction = process.env.NODE_ENV === "production";
    const issues = result.error.issues
      .map((i) => ` - ${i.path.join(".")}: ${i.message}`)
      .join("\n");

    const message = `[FATAL] Environment validation failed at boot:\n${issues}`;
    if (isProduction) {
      console.error(message);
      throw new Error(message);
    } else {
      console.warn(
        `[WARN] Non-critical environment issues in ${process.env.NODE_ENV || "development"}:\n${issues}`
      );
      // Fallback with defaults for development/test
      cachedEnv = envSchema.parse({
        DATABASE_URL:
          process.env.DATABASE_URL ||
          "postgresql://kailshiansx:kailshiansx_dev@localhost:5432/kailshiansx",
        AUTH_SECRET: process.env.AUTH_SECRET || "dev_auth_secret_kailshiansx_dev_mode_32chars_min",
        ...process.env,
      });
      return cachedEnv;
    }
  }

  cachedEnv = result.data;
  return cachedEnv;
}

// Automatically validate on first import
export const env = validateEnv();
