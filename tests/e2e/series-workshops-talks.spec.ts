import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.describe("Series, Workshops & Tech Talks Restyle Verification", () => {
  const screenshotsDir = "/tmp/ui-shots";

  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  const routes = [
    { name: "workshops", path: "/workshops" },
    { name: "tech-talks", path: "/tech-talks" },
    { name: "tech-talks-detail", path: "/tech-talks/techtalk-scaling-10m" },
    { name: "meetup-series", path: "/meetup-series" },
    { name: "meetup-series-detail", path: "/meetup-series/raibarx" },
    { name: "hackathon-series", path: "/hackathon-series" },
    { name: "hackathon-series-detail", path: "/hackathon-series/nirmanx" },
  ];

  const viewports = [
    { name: "375", width: 375, height: 667 },
    { name: "1280", width: 1280, height: 800 },
  ];

  for (const vp of viewports) {
    for (const theme of ["light", "dark"] as const) {
      for (const r of routes) {
        test(`Renders ${r.name} at ${vp.name}px in ${theme} mode`, async ({ page }) => {
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

          // 1. Confirm no horizontal overflow
          const overflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth + 1;
          });
          expect(overflow, `Horizontal overflow detected on ${r.path} at ${vp.name}px`).toBeFalsy();

          // 2. Confirm no "" badges or labels anywhere in text
          const bodyText = await page.innerText("body");
          expect(bodyText).not.toContain("");
          expect(bodyText).not.toContain("Postgres FTS");
          expect(bodyText).not.toContain("Verified Gathering Schedule");

          // 3. Confirm no stray "0" elements
          const strayZeroCheck = await page.evaluate(() => {
            const allElements = Array.from(document.querySelectorAll("span, p, div, a, button"));
            const strayZeros = allElements.filter((el) => {
              if (el.children.length > 0) return false;
              const text = el.textContent?.trim();
              return text === "0";
            });
            return strayZeros.length;
          });
          expect(strayZeroCheck, `Stray '0' detected on ${r.path}`).toBe(0);

          // 4. Confirm text visibility (no invisible text where color matches background)
          const invisibleTextCount = await page.evaluate(() => {
            const headings = Array.from(document.querySelectorAll("h1, h2, h3, p, button, a"));
            let invisible = 0;
            for (const el of headings) {
              const text = el.textContent?.trim() || "";
              if (!text) continue;
              const style = window.getComputedStyle(el);
              if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                style.opacity === "0"
              ) {
                continue;
              }
              // Check if color is identical to background-color when background is non-transparent
              if (
                style.color &&
                style.backgroundColor &&
                style.backgroundColor !== "rgba(0, 0, 0, 0)" &&
                style.backgroundColor !== "transparent" &&
                style.color === style.backgroundColor
              ) {
                invisible++;
              }
            }
            return invisible;
          });
          expect(invisibleTextCount, `Invisible text detected on ${r.path}`).toBe(0);
        });
      }
    }
  }
});
