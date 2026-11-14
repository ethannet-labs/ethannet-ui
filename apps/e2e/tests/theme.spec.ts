import { type Page, expect, test } from "@playwright/test";

// Colors are written out on purpose, like the copy in the other specs: these
// tests check what a visitor sees, so a wrong token value fails here.
const light = {
  page: "rgb(250, 250, 250)",
  surface: "rgb(255, 255, 255)",
  text: "rgb(26, 26, 26)",
  muted: "rgb(85, 85, 85)",
  border: "rgb(229, 229, 229)",
};
const dark = {
  page: "rgb(10, 10, 10)",
  surface: "rgb(23, 23, 23)",
  text: "rgb(237, 237, 237)",
  muted: "rgb(163, 163, 163)",
  border: "rgb(46, 46, 46)",
};

const header = (page: Page) => page.getByRole("banner");
const footer = (page: Page) => page.getByRole("contentinfo");

async function expectTheme(page: Page, colors: typeof light) {
  await expect(page.locator("body")).toHaveCSS("background-color", colors.page);
  await expect(header(page)).toHaveCSS("background-color", colors.surface);
  await expect(header(page)).toHaveCSS("color", colors.text);
  await expect(header(page)).toHaveCSS("border-bottom-color", colors.border);
  await expect(footer(page)).toHaveCSS("color", colors.muted);
  await expect(footer(page)).toHaveCSS("border-top-color", colors.border);
}

test.describe("with a light OS setting", () => {
  test.use({ colorScheme: "light" });

  test("header and footer use the light theme", async ({ page }) => {
    await page.goto("/");
    await expectTheme(page, light);
  });

  test("data-theme=dark forces the dark theme", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.dataset.theme = "dark";
    });
    await expectTheme(page, dark);
  });
});

test.describe("with a dark OS setting", () => {
  test.use({ colorScheme: "dark" });

  test("header and footer use the dark theme", async ({ page }) => {
    await page.goto("/");
    await expectTheme(page, dark);
  });

  test("data-theme=light forces the light theme", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.dataset.theme = "light";
    });
    await expectTheme(page, light);
  });

  test.describe("on a phone", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("the open mobile menu panel is dark", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Open menu" }).click();
      const panel = page.locator("#mobile-menu");
      await expect(panel).toBeVisible();
      await expect(panel).toHaveCSS("background-color", dark.surface);
      await expect(panel).toHaveCSS("color", dark.text);
    });
  });
});
