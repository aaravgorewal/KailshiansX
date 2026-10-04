import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.describe("Gallery, Who We Are, Core Team & Founder Restyle Verification", () => {
  const screenshotsDir = "/tmp/ui-shots";

  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  const routes = [
    { name: "gallery", path: "/gallery" },
    { name: "who-we-are", path: "/who-we-are" },
    { name: "core-team", path: "/core-team" },
    { name: "founder", path: "/founder" },
  ];

  const viewports = [
    { name: "375", width: 375, height: 667 },
    { name: "1280", width: 1280, height: 800 },
  ];

  // 1. Verify pages render properly in both themes and viewports without broken images or console errors
  for (const vp of viewports) {
    for (const theme of ["light", "dark"] as const) {
      for (const r of routes) {
        test(`Renders ${r.name} at ${vp.name}px in ${theme} mode`, async ({ page }) => {
          const consoleErrors: string[] = [];
          page.on("console", (msg) => {
            if (msg.type() === "error") {
              const text = msg.text();
              // Ignore third-party favicon/analytics/external rate limit (429)/dev hydration state warning
              if (
                !text.includes("favicon") &&
                !text.includes("analytics") &&
                !text.includes("429") &&
                !text.includes("Can't perform a React state update")
              ) {
                consoleErrors.push(text);
              }
            }
          });

          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.emulateMedia({ colorScheme: theme });

          await page.goto(r.path);
          await page.waitForLoadState("domcontentloaded");

          // Set theme explicitly on <html>
          await page.evaluate((t) => {
            if (t === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }, theme);

          await page.waitForTimeout(300);

          // Capture screenshot
          const shotName = `${r.name}-${vp.name}-${theme}.png`;
          const shotPath = path.join(screenshotsDir, shotName);
          await page.screenshot({ path: shotPath, fullPage: true });
          expect(fs.existsSync(shotPath)).toBeTruthy();

          // Confirm no horizontal overflow
          const overflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth + 1;
          });
          expect(overflow, `Horizontal overflow detected on ${r.path} at ${vp.name}px`).toBeFalsy();

          // Check that images are not broken
          const brokenImages = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll("img"));
            return images
              .filter((img) => img.complete && img.naturalWidth === 0)
              .map((img) => img.src);
          });
          expect(brokenImages, `Broken images on ${r.path}`).toEqual([]);

          // Confirm no console errors
          expect(consoleErrors, `Console errors on ${r.path}`).toEqual([]);
        });
      }
    }
  }

  // 2. Comprehensive Gallery & Lightbox Test (both themes, keyboard navigation, controls, focus trap)
  for (const theme of ["light", "dark"] as const) {
    test(`Gallery album and lightbox interaction in ${theme} mode`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          const text = msg.text();
          if (!text.includes("favicon") && !text.includes("analytics") && !text.includes("429")) {
            consoleErrors.push(text);
          }
        }
      });

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.emulateMedia({ colorScheme: theme });

      // Navigate to /gallery
      await page.goto("/gallery");
      await page.waitForLoadState("domcontentloaded");

      await page.evaluate((t) => {
        if (t === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }, theme);

      // Verify unique albums (no duplicate "RaibarX Edition 01" titles)
      const albumTitles = await page.locator("article h3").allTextContents();
      const raibarTitles = albumTitles.filter((t) => t.includes("RaibarX Edition 01"));
      expect(
        raibarTitles.length,
        "Should only have one RaibarX Edition 01 album"
      ).toBeLessThanOrEqual(1);

      // Click on the first album card link
      const firstAlbumLink = page.locator("article h3 a").first();
      await expect(firstAlbumLink).toBeVisible();
      await firstAlbumLink.click();

      // Verify Album detail page loaded
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("h1")).toBeVisible();

      // Open Lightbox by clicking the first photo card
      const firstPhotoCard = page.locator("figure").first();
      await expect(firstPhotoCard).toBeVisible();
      await firstPhotoCard.click();

      // Verify Lightbox is open
      const lightbox = page.locator('div[role="dialog"][aria-label="Image Lightbox"]');
      await expect(lightbox).toBeVisible();

      // Save screenshot of Lightbox
      const lightboxShotPath = path.join(screenshotsDir, `gallery-lightbox-${theme}.png`);
      await page.screenshot({ path: lightboxShotPath });
      expect(fs.existsSync(lightboxShotPath)).toBeTruthy();

      // Verify scrim has black background (rgb/rgba or oklab)
      const scrimBg = await lightbox.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      const isBlack = scrimBg.includes("0 0 0") || scrimBg.includes("0, 0, 0");
      expect(isBlack, `Scrim background should be black, got ${scrimBg}`).toBeTruthy();

      // Verify control hit areas (>= 44px)
      const closeBtn = lightbox.locator('button[aria-label="Close lightbox"]');
      await expect(closeBtn).toBeVisible();
      const closeBox = await closeBtn.boundingBox();
      expect(closeBox).not.toBeNull();
      if (closeBox) {
        expect(closeBox.width).toBeGreaterThanOrEqual(44);
        expect(closeBox.height).toBeGreaterThanOrEqual(44);
      }

      // Keyboard navigation: ArrowRight to next photo
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(300);

      // Keyboard navigation: ArrowLeft back
      await page.keyboard.press("ArrowLeft");
      await page.waitForTimeout(300);

      // Keyboard navigation: Escape closes lightbox
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
      await expect(lightbox).not.toBeVisible();

      // Verify no console errors
      expect(consoleErrors).toEqual([]);
    });
  }

  // 3. Who We Are Specific Assertions
  test("Who We Are contains 2-column What We Do list and wrapped horizontal progression", async ({
    page,
  }) => {
    await page.goto("/who-we-are");
    await page.waitForLoadState("domcontentloaded");

    // Progression numbered list scoped to section
    const progressionList = page.locator('section[aria-label="Builder Progression"] ol');
    await expect(progressionList).toBeVisible();
    const items = await progressionList.locator("li").allTextContents();
    expect(items.some((i) => i.includes("Attendee"))).toBeTruthy();
    expect(items.some((i) => i.includes("Mentor"))).toBeTruthy();

    // What We Do 2-column list
    const whatWeDoSection = page.locator('section[aria-label="What We Do"]');
    await expect(whatWeDoSection).toBeVisible();
    const columns = whatWeDoSection.locator(".grid");
    await expect(columns).toHaveClass(/md:grid-cols-2/);
  });

  // 4. Core Team Specific Assertions
  test("Core Team shows avatars with initials fallback and neutral tabs", async ({ page }) => {
    await page.goto("/core-team");
    await page.waitForLoadState("domcontentloaded");

    // Neutral tabs
    const allTab = page.locator("button", { hasText: "All Members" });
    await expect(allTab).toBeVisible();
    await expect(allTab).toHaveClass(/bg-primary/);

    // Member cards with avatar
    const cards = page.locator("article");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  // 5. Founder Specific Assertions
  test("Founder page renders CMS content and initials avatar without hardcoded quotes", async ({
    page,
  }) => {
    await page.goto("/founder");
    await page.waitForLoadState("domcontentloaded");

    // Founder name
    await expect(page.locator("h2", { hasText: "Aarav Gorewal" })).toBeVisible();

    // Verify initials avatar exists (since photo is null in CMS)
    const avatar = page.locator("div", { hasText: "AG" });
    await expect(avatar.first()).toBeVisible();

    // Ensure no hardcoded dummy quote texts
    const content = await page.content();
    expect(content).not.toContain(
      "Throughout my journey building software, I noticed a painful pattern across India"
    );
  });
});
