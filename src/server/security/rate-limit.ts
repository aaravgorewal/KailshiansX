// src/server/security/rate-limit.ts — Dual Upstash Redis & In-Memory Rate Limiting
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in milliseconds
}

export type RateLimitCategory = "auth" | "form" | "registration" | "api";

interface BucketConfig {
  maxRequests: number;
  windowMs: number;
}

const CONFIGS: Record<RateLimitCategory, BucketConfig> = {
  auth: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 per min
  form: { maxRequests: 5, windowMs: 10 * 60 * 1000 }, // 5 per 10 mins
  registration: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per min
  api: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 per min
};

// In-Memory Token Bucket / Sliding Window Fallback
interface MemoryRecord {
  timestamps: number[];
}
const memoryStore = new Map<string, MemoryRecord>();

function memoryRateLimit(key: string, config: BucketConfig): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const record = memoryStore.get(key) || { timestamps: [] };
  // Filter timestamps within current window
  const activeTimestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (activeTimestamps.length >= config.maxRequests) {
    const oldestTimestamp = activeTimestamps[0] || now;
    const reset = oldestTimestamp + config.windowMs;
    memoryStore.set(key, { timestamps: activeTimestamps });
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset,
    };
  }

  activeTimestamps.push(now);
  memoryStore.set(key, { timestamps: activeTimestamps });

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - activeTimestamps.length,
    reset: now + config.windowMs,
  };
}

// Upstash Redis instances if configured
let redisClient: Redis | null = null;
const upstashLimiters = new Map<RateLimitCategory, Ratelimit>();

const isDummyUpstash =
  !process.env.UPSTASH_REDIS_REST_URL ||
  process.env.UPSTASH_REDIS_REST_URL.includes("your-upstash-url") ||
  process.env.UPSTASH_REDIS_REST_URL.includes("example.com") ||
  process.env.NODE_ENV === "test";

if (!isDummyUpstash && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    upstashLimiters.set(
      "auth",
      new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(5, "60 s"),
        prefix: "kx:rl:auth",
      })
    );

    upstashLimiters.set(
      "form",
      new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(5, "600 s"),
        prefix: "kx:rl:form",
      })
    );

    upstashLimiters.set(
      "registration",
      new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(10, "60 s"),
        prefix: "kx:rl:registration",
      })
    );

    upstashLimiters.set(
      "api",
      new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(60, "60 s"),
        prefix: "kx:rl:api",
      })
    );
  } catch (err) {
    console.warn("Failed to initialize Upstash Redis rate limiter, using in-memory fallback:", err);
  }
}

/**
 * Extract client IP from headers (supports Cloudflare, Vercel, Proxies)
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

/**
 * Checks rate limit for a given key and category.
 * Automatically falls back to in-memory window if Redis is not configured.
 */
export async function checkRateLimit(
  identifier: string,
  category: RateLimitCategory = "api"
): Promise<RateLimitResult> {
  const key = `${category}:${identifier}`;
  const upstashLimiter = upstashLimiters.get(category);

  if (upstashLimiter) {
    try {
      const res = await upstashLimiter.limit(identifier);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: res.reset,
      };
    } catch (err) {
      console.warn("Upstash rate limit check failed, falling back to in-memory:", err);
      return memoryRateLimit(key, CONFIGS[category]);
    }
  }

  return memoryRateLimit(key, CONFIGS[category]);
}

/**
 * Resets in-memory rate limit store (useful for tests)
 */
export function resetRateLimitStore(): void {
  memoryStore.clear();
}
