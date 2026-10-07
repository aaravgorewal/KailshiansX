import { test, expect } from "@playwright/test";

test.describe("Theme Toggle Suite", () => {
  test("toggle Light -> Dark -> System via mouse", async ({ page }) => {
    await page.goto("/");
    const toggleButton = page.locator('button[aria-label="Change theme"]');
    await expect(toggleButton).toBeVisible();

    // 1. Toggle to Light
    await toggleButton.click();
    const lightOption = page.locator('button[role="menuitem"]:has-text("Light")');
    await expect(lightOption).toBeVisible();
    await lightOption.click();

    await expect(page.locator("html")).not.toHaveClass(/dark/);
    const themeInStorage1 = await page.evaluate(() => localStorage.getItem("theme"));
    expect(themeInStorage1).toBe("light");

    // 2. Toggle to Dark
    await toggleButton.click();
    const darkOption = page.locator('button[role="menuitem"]:has-text("Dark")');
    await expect(darkOption).toBeVisible();
    await darkOption.click();

    await expect(page.locator("html")).toHaveClass(/dark/);
    const themeInStorage2 = await page.evaluate(() => localStorage.getItem("theme"));
    expect(themeInStorage2).toBe("dark");

    // 3. Toggle to System
    await toggleButton.click();
    const systemOption = page.locator('button[role="menuitem"]:has-text("System")');
    await expect(systemOption).toBeVisible();
    await systemOption.click();

    const themeInStorage3 = await page.evaluate(() => localStorage.getItem("theme"));
    expect(themeInStorage3).toBe("system");
  });

  test("toggle Light -> Dark -> System via keyboard", async ({ page }) => {
    await page.goto("/");
    const toggleButton = page.locator('button[aria-label="Change theme"]');
    await expect(toggleButton).toBeVisible();

    // Focus toggle button and open menu via Enter
    await toggleButton.focus();
    await page.keyboard.press("Enter");

    // Select Dark option using ArrowDown and Enter
    const darkOption = page.locator('button[role="menuitem"]:has-text("Dark")');
    await expect(darkOption).toBeVisible();
    await darkOption.focus();
    await page.keyboard.press("Enter");

    await expect(page.locator("html")).toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");

    // Open again via Enter, focus Light, press Enter
    await toggleButton.focus();
    await page.keyboard.press("Enter");
    const lightOption = page.locator('button[role="menuitem"]:has-text("Light")');
    await expect(lightOption).toBeVisible();
    await lightOption.focus();
    await page.keyboard.press("Enter");

    await expect(page.locator("html")).not.toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");

    // Open again, select System
    await toggleButton.focus();
    await page.keyboard.press("Enter");
    const systemOption = page.locator('button[role="menuitem"]:has-text("System")');
    await expect(systemOption).toBeVisible();
    await systemOption.focus();
    await page.keyboard.press("Enter");

    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("system");
  });

  test("assert theme persistence after page reload", async ({ page }) => {
    await page.goto("/");
    const toggleButton = page.locator('button[aria-label="Change theme"]');

    // Switch to dark
    await toggleButton.click();
    await page.locator('button[role="menuitem"]:has-text("Dark")').click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Reload and assert dark remains
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");

    // Switch to light
    await toggleButton.click();
    await page.locator('button[role="menuitem"]:has-text("Light")').click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    // Reload and assert light remains
    await page.reload();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");
  });

  test("assert no flash of unstyled theme on initial load and verify inline theme script in head", async ({
    page,
  }) => {
    // 1. Verify inline theme script exists in <head> to prevent FOUC
    await page.goto("/");
    const hasThemeScript = await page.evaluate(() => {
      const scripts = Array.from(document.head.querySelectorAll("script"));
      return scripts.some(
        (s) =>
          s.innerHTML.includes("classList") &&
          (s.innerHTML.includes("dark") || s.innerHTML.includes("color-scheme"))
      );
    });
    expect(hasThemeScript).toBe(true);

    // 2. Emulate dark colorScheme and verify very first paint state
    const darkContext = await page.context().browser()!.newContext({
      colorScheme: "dark",
    });
    const darkPage = await darkContext.newPage();

    // Verify before/upon DOMContentLoaded that dark theme is applied
    await darkPage.goto("/", { waitUntil: "domcontentloaded" });
    const isDarkAtLoad = await darkPage.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(isDarkAtLoad).toBe(true);

    const initialBg = await darkPage.evaluate(
      () => window.getComputedStyle(document.documentElement).backgroundColor
    );
    expect(initialBg).toBe("rgb(11, 11, 12)");

    await darkContext.close();
  });

  test("assert System theme follows emulated colorScheme changes live", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    // Set to System theme
    const toggleButton = page.locator('button[aria-label="Change theme"]');
    await toggleButton.click();
    await page.locator('button[role="menuitem"]:has-text("System")').click();

    // When system is dark, html must have dark class
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Switch live to light colorScheme
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    // Switch live back to dark colorScheme
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
