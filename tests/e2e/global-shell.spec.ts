import { test, expect } from "@playwright/test";

test.describe("Global Shell, Fonts, Navbar & Footer", () => {
  test("1. Font family: body and headings render sans-serif (no serif)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Inspect computed font-family on body
    const bodyFont = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });

    // Inspect computed font-family on headings
    const headingFont = await page.evaluate(() => {
      const heading = document.querySelector("h1, h2, h3");
      return heading ? window.getComputedStyle(heading).fontFamily : "";
    });

    const isSansSerif = (font: string) => {
      const lower = font.toLowerCase();
      // Must include sans-serif or geist or system sans
      const hasSans =
        lower.includes("sans-serif") ||
        lower.includes("geist") ||
        lower.includes("system-ui") ||
        lower.includes("apple-system");
      // Must NOT contain standalone serif
      const withoutSansSerif = lower.replace(/sans-serif/g, "");
      const hasSerif = withoutSansSerif.includes("serif");
      return hasSans && !hasSerif;
    };

    expect(isSansSerif(bodyFont)).toBeTruthy();
    if (headingFont) {
      expect(isSansSerif(headingFont)).toBeTruthy();
    }
  });

  const viewports = [
    { name: "mobile-375", width: 375, height: 667 },
    { name: "tablet-768", width: 768, height: 1024 },
    { name: "desktop-1280", width: 1280, height: 800 },
  ];

  for (const vp of viewports) {
    for (const theme of ["light", "dark"] as const) {
      test(`2. Layout at ${vp.name} (${theme}): no horizontal scroll, header visible`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.emulateMedia({ colorScheme: theme });
        await page.goto("/");
        await page.waitForLoadState("domcontentloaded");

        // Set theme class on html if needed
        await page.evaluate((t) => {
          if (t === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }, theme);

        // Check horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBeFalsy();

        // Check header is visible
        const header = page.locator("header");
        await expect(header).toBeVisible();

        // Wordmark "KailshiansX" visible
        const wordmark = header.locator("text=KailshiansX").first();
        await expect(wordmark).toBeVisible();
      });
    }
  }

  test("3. Desktop Navbar: dropdown menu interactions & readability", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Center links visible
    const nav = page.locator("header nav[aria-label='Primary navigation']");
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("button", { name: /events/i })).toBeVisible();
    await expect(nav.getByRole("button", { name: /community/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /gallery/i })).toBeVisible();

    // Right CTAs
    await expect(page.locator("header a#nav-signin-btn")).toBeVisible();
    await expect(page.locator("header a", { hasText: "Explore Events" })).toBeVisible();

    // Hover/click Events dropdown
    const eventsBtn = nav.getByRole("button", { name: /events/i });
    await eventsBtn.click();

    const dropdownMenu = page.locator("header [role='menu']");
    await expect(dropdownMenu).toBeVisible();

    // Verify dropdown items
    await expect(dropdownMenu.getByRole("menuitem", { name: /all events/i })).toBeVisible();
    await expect(dropdownMenu.getByRole("menuitem", { name: /workshops/i })).toBeVisible();
    await expect(dropdownMenu.getByRole("menuitem", { name: /hackathon series/i })).toBeVisible();

    // Check dropdown styling: bg-card, border border-border, no shadow
    const dropdownStyles = await dropdownMenu.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        boxShadow: style.boxShadow,
        borderRadius: style.borderRadius,
      };
    });
    // Box shadow should be none or negligible
    expect(
      dropdownStyles.boxShadow === "none" ||
        dropdownStyles.boxShadow === "rgba(0, 0, 0, 0) 0px 0px 0px 0px"
    ).toBeTruthy();
  });

  test("4. Mobile Navbar: compact Events button, drawer focus trap & escape close", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Compact "Events" button visible before hamburger
    const compactEventsBtn = page.locator("header a", { hasText: /^Events$/ });
    await expect(compactEventsBtn).toBeVisible();

    // Hamburger button visible
    const hamburger = page.locator("header button[aria-label='Open navigation menu']");
    await expect(hamburger).toBeVisible();

    // Open drawer
    await hamburger.click();

    const drawer = page.locator("[role='dialog'][aria-label='Navigation menu']");
    await expect(drawer).toBeVisible();

    // Body scroll locked
    const isScrollLocked = await page.evaluate(() => {
      return document.body.style.overflow === "hidden";
    });
    expect(isScrollLocked).toBeTruthy();

    // Close button should be focused
    const closeBtn = drawer.locator("button[aria-label='Close navigation']");
    await expect(closeBtn).toBeFocused();

    // Press Escape -> drawer closes
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();

    // Body scroll unlocked
    const isScrollUnlocked = await page.evaluate(() => {
      return document.body.style.overflow !== "hidden";
    });
    expect(isScrollUnlocked).toBeTruthy();
  });

  test("5. Footer: 3 link columns, brand blurb, legal links work", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // 3 link column headings
    await expect(footer.getByRole("heading", { name: "Events" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Community" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "About" })).toBeVisible();

    // Brand blurb
    await expect(footer.locator("text=Developer events & community platform")).toBeVisible();

    // 4 Legal links
    const legalRoutes = [
      { text: "Privacy Policy", href: "/privacy" },
      { text: "Terms of Service", href: "/terms" },
      { text: "Refund & Cancellation", href: "/refunds" },
      { text: "Contact", href: "/contact" },
    ];

    for (const { text, href } of legalRoutes) {
      const link = footer.getByRole("link", { name: text });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", href);
    }
  });

  test("6. Legal pages load with real generic content (no placeholders)", async ({ page }) => {
    const pages = [
      { path: "/privacy", heading: "Privacy Policy" },
      { path: "/terms", heading: "Terms of Service" },
      { path: "/refunds", heading: "Refund & Cancellation Policy" },
      { path: "/contact", heading: "Contact Us" },
    ];

    for (const p of pages) {
      const response = await page.goto(p.path);
      expect(response?.status()).toBe(200);

      // Verify h1 heading exists
      await expect(page.getByRole("heading", { level: 1, name: p.heading })).toBeVisible();

      // Ensure no PlaceholderPage text
      const pageText = await page.textContent("body");
      expect(pageText).not.toContain("Coming Soon");
      expect(pageText).not.toContain("");
    }
  });
});
