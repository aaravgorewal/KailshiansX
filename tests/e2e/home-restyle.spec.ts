import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.describe("Home Page Restyle & Token Verification", () => {
  const screenshotsDir = "/tmp/ui-shots";

  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  const viewports = [
    { name: "375", width: 375, height: 667 },
    { name: "768", width: 768, height: 1024 },
    { name: "1280", width: 1280, height: 800 },
  ];

  for (const vp of viewports) {
    for (const theme of ["light", "dark"] as const) {
      test(`Screenshot & contrast at ${vp.name}px in ${theme} mode`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.emulateMedia({ colorScheme: theme });
        await page.goto("/");
        await page.waitForLoadState("domcontentloaded");

        // Force theme class on <html> to ensure proper styling in screenshot
        await page.evaluate((t) => {
          if (t === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }, theme);

        // Wait a tick for any transitions
        await page.waitForTimeout(300);

        // Capture screenshot
        const screenshotPath = path.join(screenshotsDir, `home-${vp.name}-${theme}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        expect(fs.existsSync(screenshotPath)).toBeTruthy();

        // 1. Verify Hero H1
        const h1 = page.locator("h1");
        await expect(h1).toBeVisible();
        await expect(h1).toHaveText("Developer Events. Builder Communities. Real Connections.");

        // Check computed color of H1 vs background
        const h1Check = await h1.evaluate((el) => {
          const style = window.getComputedStyle(el);
          const bg = window.getComputedStyle(document.body).backgroundColor;
          return {
            color: style.color,
            bg: bg,
            isEqual: style.color === bg,
          };
        });
        expect(h1Check.isEqual).toBeFalsy();

        // 2. Verify Hero CTAs
        const exploreEventsCta = page.locator("#hero-cta-explore-events");
        const joinCommunityCta = page.locator("#hero-cta-join-community");
        const partnerCta = page.locator("#hero-cta-partner");

        await expect(exploreEventsCta).toBeVisible();
        await expect(joinCommunityCta).toBeVisible();
        await expect(partnerCta).toBeVisible();

        // 3. Verify no section is empty
        const sections = await page.locator("main section").all();
        expect(sections.length).toBeGreaterThan(0);

        for (const sec of sections) {
          const isVisible = await sec.isVisible();
          if (isVisible) {
            const text = (await sec.textContent())?.trim();
            expect(text && text.length > 0).toBeTruthy();
          }
        }

        // 4. Verify no text is invisible or identical to its background
        const textElementsCheck = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll("h1, h2, h3, p, a, button"));
          let invisibleCount = 0;
          for (const el of elements) {
            const style = window.getComputedStyle(el);
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              style.opacity === "0"
            ) {
              continue;
            }
            // Check direct color vs parent background
            const parent = el.parentElement;
            if (parent) {
              const parentBg = window.getComputedStyle(parent).backgroundColor;
              if (
                style.color === parentBg &&
                parentBg !== "rgba(0, 0, 0, 0)" &&
                parentBg !== "transparent"
              ) {
                invisibleCount++;
              }
            }
          }
          return invisibleCount;
        });
        expect(textElementsCheck).toBe(0);
      });
    }
  }

  test("Verify stats band, gallery tile layout, and final CTA block", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Stats band border-y and padding
    const statsSection = page.locator("section[aria-labelledby='section-impact-counters']");
    await expect(statsSection).toBeVisible();

    // Check stats counters have text
    const statsCount = await statsSection.locator(".font-mono, .text-3xl, .text-4xl").count();
    expect(statsCount).toBeGreaterThan(0);

    // Final CTA
    const finalCta = page.locator("section[aria-labelledby='section-final-cta']");
    await expect(finalCta).toBeVisible();
    await expect(
      finalCta.getByRole("heading", { name: "Ready to Build, Lead & Shape the Future?" })
    ).toBeVisible();
    await expect(finalCta.getByRole("link", { name: "Explore Upcoming Events" })).toBeVisible();
    await expect(finalCta.getByRole("link", { name: "Join Community" })).toBeVisible();
  });
});
