import { describe, it, expect } from "vitest";
import { sanitizeRichText } from "@/server/security/sanitize";
import { validateFileUpload } from "@/server/security/upload";
import { checkRateLimit } from "@/server/security/rate-limit";

describe("Security Services (Unit)", () => {
  describe("Rich Text Sanitization (sanitize.ts)", () => {
    it("should strip script tags and active executable contents", () => {
      const dirty = '<p>Welcome to <b>KailshiansX</b></p><script>alert("hacked")</script>';
      const clean = sanitizeRichText(dirty);
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain('alert("hacked")');
      expect(clean).toContain("<b>KailshiansX</b>");
    });

    it("should strip inline javascript event handlers", () => {
      const malicious =
        '<img src="x" onerror="window.stealCookies()" /><a href="javascript:void(0)">Click</a>';
      const clean = sanitizeRichText(malicious);
      expect(clean).not.toContain("onerror");
      expect(clean).not.toContain("stealCookies");
      expect(clean).not.toContain("javascript:");
    });

    it('should enforce rel="noopener noreferrer" on external anchor links', () => {
      const raw = '<a href="https://evil.com" target="_blank">External</a>';
      const clean = sanitizeRichText(raw);
      expect(clean).toContain('rel="noopener noreferrer"');
    });

    it("should handle undefined or null input safely", () => {
      expect(sanitizeRichText("")).toBe("");
      expect(sanitizeRichText(null)).toBe("");
      expect(sanitizeRichText(undefined)).toBe("");
    });
  });

  describe("File Upload Security Rules (upload.ts)", () => {
    it("should accept valid image types under 10MB", () => {
      const validWebP = validateFileUpload({
        filename: "banner.webp",
        sizeBytes: 2 * 1024 * 1024,
        contentType: "image/webp",
      });
      expect(validWebP.valid).toBe(true);

      const validPNG = validateFileUpload({
        filename: "photo.png",
        sizeBytes: 500 * 1024,
        contentType: "image/png",
      });
      expect(validPNG.valid).toBe(true);
    });

    it("should reject files exceeding the 10MB size limit", () => {
      const oversized = validateFileUpload({
        filename: "heavy.jpg",
        sizeBytes: 11 * 1024 * 1024,
        contentType: "image/jpeg",
      });
      expect(oversized.valid).toBe(false);
      expect(oversized.error).toContain("10MB");
    });

    it("should reject dangerous MIME types and executable extensions", () => {
      const executable = validateFileUpload({
        filename: "script.exe",
        sizeBytes: 1024,
        contentType: "application/x-msdownload",
      });
      expect(executable.valid).toBe(false);
      expect(executable.error).toContain("Invalid file type");

      const svgOrHtml = validateFileUpload({
        filename: "payload.html",
        sizeBytes: 1024,
        contentType: "text/html",
      });
      expect(svgOrHtml.valid).toBe(false);
    });
  });

  describe("Rate Limiting Engine (rate-limit.ts)", () => {
    it("should permit requests below the bucket threshold", async () => {
      const identifier = `test-vitest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const result = await checkRateLimit(identifier, "form");
      expect(result.success).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });

    it("should correctly rate limit when requests exhaust category quota", async () => {
      const identifier = `test-exhaust-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      // 'auth' allows 5 requests per 60s
      for (let i = 0; i < 5; i++) {
        await checkRateLimit(identifier, "auth");
      }
      const sixth = await checkRateLimit(identifier, "auth");
      expect(sixth.success).toBe(false);
      expect(sixth.remaining).toBe(0);
    });
  });
});
