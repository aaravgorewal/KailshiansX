// tests/security-seo-analytics.test.ts
// Verifies Environment Boot Validation, Rate Limiting, Input Sanitisation,
// File Upload Security, Dynamic Robots/Sitemap, and Analytics Telemetry

import test, { describe } from "node:test";
import assert from "node:assert/strict";

import { validateEnv } from "../src/lib/env";
import { checkRateLimit, resetRateLimitStore } from "../src/server/security/rate-limit";
import { sanitizeRichText, sanitizePlainText } from "../src/server/security/sanitize";
import { validateFileUpload, MAX_UPLOAD_SIZE_BYTES } from "../src/server/security/upload";
import generateRobots from "../src/app/robots";
import generateSitemap from "../src/app/sitemap";
import {
  trackRegisterClick,
  trackPaymentSuccess,
  trackApplicationSubmit,
} from "../src/lib/analytics";

describe("Security, SEO, and Analytics Suite", () => {
  // ── 1. Boot Environment Validation ──────────────────────────────────────────
  describe("Boot Environment Validation", () => {
    test("should successfully validate environment in current development/test runtime", () => {
      const validated = validateEnv();
      assert.ok(validated);
      assert.ok(validated.DATABASE_URL);
      assert.ok(validated.AUTH_SECRET);
      assert.ok(validated.NEXT_PUBLIC_APP_URL);
    });
  });

  // ── 2. Rate Limiting ────────────────────────────────────────────────────────
  describe("Rate Limiting Engine", () => {
    test("should allow requests within category threshold and block when exceeded", async () => {
      resetRateLimitStore();
      const testIp = "192.168.1.100";

      // 'auth' limit is 5 per 60s
      for (let i = 0; i < 5; i++) {
        const res = await checkRateLimit(testIp, "auth");
        assert.equal(res.success, true, `Attempt ${i + 1} should succeed`);
        assert.equal(res.remaining, 4 - i);
      }

      // 6th attempt must be rejected
      const blockedRes = await checkRateLimit(testIp, "auth");
      assert.equal(blockedRes.success, false);
      assert.equal(blockedRes.remaining, 0);
      assert.ok(blockedRes.reset > Date.now());

      resetRateLimitStore();
    });

    test("should isolate rate limits across distinct categories", async () => {
      resetRateLimitStore();
      const testIp = "192.168.1.101";

      // Exhaust form limit (5 requests)
      for (let i = 0; i < 5; i++) {
        await checkRateLimit(testIp, "form");
      }
      const formBlocked = await checkRateLimit(testIp, "form");
      assert.equal(formBlocked.success, false);

      // 'api' category for the same IP must remain allowed (60 per min)
      const apiAllowed = await checkRateLimit(testIp, "api");
      assert.equal(apiAllowed.success, true);

      resetRateLimitStore();
    });
  });

  // ── 3. Rich Text & User Input Sanitisation ──────────────────────────────────
  describe("Rich Text Input Sanitisation", () => {
    test("should strip dangerous script tags, iframes, and onload event handlers", () => {
      const dirtyHtml = `
        <h3>Event Agenda</h3>
        <script>alert('xss');</script>
        <p onclick="stealCookies()">Welcome builders!</p>
        <iframe src="https://attacker.com/malicious"></iframe>
        <a href="javascript:alert('pwned')">Click here</a>
      `;

      const cleanHtml = sanitizeRichText(dirtyHtml);

      assert.ok(!cleanHtml.includes("<script>"));
      assert.ok(!cleanHtml.includes("<iframe>"));
      assert.ok(!cleanHtml.includes("onclick"));
      assert.ok(!cleanHtml.includes("javascript:"));
      assert.ok(cleanHtml.includes("<h3>Event Agenda</h3>"));
      assert.ok(cleanHtml.includes("<p>Welcome builders!</p>"));
    });

    test("should enforce secure attributes on external links", () => {
      const rawLink = '<a href="https://partner.com">Visit Partner</a>';
      const clean = sanitizeRichText(rawLink);

      assert.ok(clean.includes('rel="noopener noreferrer"'));
      assert.ok(clean.includes('target="_blank"'));
    });

    test("should strip all HTML tags in sanitizePlainText", () => {
      const mixed = "<div><strong>KailshiansX</strong> <em>Developer Platform</em></div>";
      const plain = sanitizePlainText(mixed);
      assert.equal(plain, "KailshiansX Developer Platform");
    });
  });

  // ── 4. File Upload Constraints ──────────────────────────────────────────────
  describe("File Upload Type & Size Security", () => {
    test("should accept legitimate image files under 10MB", () => {
      const valid = validateFileUpload({
        contentType: "image/png",
        sizeBytes: 2 * 1024 * 1024, // 2MB
        filename: "speaker-avatar.png",
      });

      assert.equal(valid.valid, true);
      assert.equal(valid.normalizedMimeType, "image/png");
    });

    test("should reject dangerous non-image file types (executable, scripts, pdf)", () => {
      const badMime = validateFileUpload({
        contentType: "application/x-sh",
        sizeBytes: 1024,
        filename: "script.sh",
      });
      assert.equal(badMime.valid, false);
      assert.ok(badMime.error?.includes("Invalid file type"));

      const badPdf = validateFileUpload({
        contentType: "application/pdf",
        sizeBytes: 5000,
        filename: "document.pdf",
      });
      assert.equal(badPdf.valid, false);
    });

    test("should reject files exceeding 10MB limit", () => {
      const oversized = validateFileUpload({
        contentType: "image/jpeg",
        sizeBytes: MAX_UPLOAD_SIZE_BYTES + 1024,
        filename: "huge-photo.jpg",
      });

      assert.equal(oversized.valid, false);
      assert.ok(oversized.error?.includes("exceeds the maximum limit"));
    });

    test("should detect mismatched file extension and content-type", () => {
      const mismatched = validateFileUpload({
        contentType: "image/png",
        sizeBytes: 1000,
        filename: "payload.jpg",
      });

      assert.equal(mismatched.valid, false);
      assert.ok(mismatched.error?.includes("does not match Content-Type"));
    });
  });

  // ── 5. SEO, Robots.txt & Dynamic Sitemap ────────────────────────────────────
  describe("Dynamic SEO, Robots.txt & Sitemap", () => {
    test("should produce compliant robots.txt with admin/api disallows and sitemap reference", () => {
      const robots = generateRobots();
      assert.ok(robots.sitemap);
      assert.ok(robots.sitemap.includes("/sitemap.xml"));

      const rules = Array.isArray(robots.rules) ? robots.rules : [robots.rules];
      const wildcardRule = rules.find((r) => r.userAgent === "*");
      assert.ok(wildcardRule);
      assert.equal(wildcardRule.allow, "/");

      const disallows = Array.isArray(wildcardRule.disallow)
        ? wildcardRule.disallow
        : [wildcardRule.disallow];
      assert.ok(disallows.includes("/admin/"));
      assert.ok(disallows.includes("/api/"));
    });

    test("should generate comprehensive dynamic sitemap entries including events and gallery", async () => {
      const sitemap = await generateSitemap();
      assert.ok(Array.isArray(sitemap));
      assert.ok(sitemap.length >= 8);

      const urls = sitemap.map((s) => s.url);
      assert.ok(urls.some((u) => u.endsWith("/")));
      assert.ok(urls.some((u) => u.endsWith("/events")));
      assert.ok(urls.some((u) => u.endsWith("/community")));
      assert.ok(urls.some((u) => u.endsWith("/gallery")));
      assert.ok(urls.some((u) => u.endsWith("/about")));
      assert.ok(urls.some((u) => u.endsWith("/partner")));
      assert.ok(urls.some((u) => u.endsWith("/privacy")));
      assert.ok(urls.some((u) => u.endsWith("/terms")));
    });
  });

  // ── 6. Analytics & Event Telemetry ──────────────────────────────────────────
  describe("Analytics & Telemetry Dispatchers", () => {
    test("should dispatch typed events gracefully without throwing errors in Node environment", () => {
      assert.doesNotThrow(() => {
        trackRegisterClick({
          eventSlug: "nirmanx-2026",
          eventTitle: "NirmanX Hackathon 2026",
          price: 0,
        });

        trackPaymentSuccess({
          orderId: "order_test_123",
          paymentId: "pay_test_456",
          amount: 500,
          eventSlug: "padharox-2026",
        });

        trackApplicationSubmit({
          type: "team",
          roleOrTrack: "Technology (Full Stack)",
        });
      });
    });
  });
});
