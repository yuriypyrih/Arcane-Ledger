import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

async function checkBothPaginators(page: Page) {
  const top = page.getByRole("navigation", { name: /pagination \(top\)$/ });
  const bottom = page.getByRole("navigation", { name: /pagination \(bottom\)$/ });
  await expect(top.getByText(/Page 1 of/)).toBeVisible();
  await expect(bottom.getByText(/Page 1 of/)).toBeVisible();
  await expect(top.getByRole("button", { name: "Previous" })).toBeDisabled();
  await expect(bottom.getByRole("button", { name: "Previous" })).toBeDisabled();
  await bottom.getByRole("button", { name: "Next" }).click();
  await expect(top.getByText(/Page 2 of/)).toBeVisible();
  await expect(bottom.getByText(/Page 2 of/)).toBeVisible();
  await top.getByRole("button", { name: "Previous" }).click();
  await expect(top.getByText(/Page 1 of/)).toBeVisible();
  await expect(bottom.getByText(/Page 1 of/)).toBeVisible();
}

test("spell compendium paginators above and below the list stay synchronized", async ({ page }) => {
  await page.goto("/compendium?category=SPELLS");
  await checkBothPaginators(page);
  const top = page.getByRole("navigation", { name: /pagination \(top\)$/ });
  const bottom = page.getByRole("navigation", { name: /pagination \(bottom\)$/ });
  const list = page.getByRole("region", { name: "Spells Entries" });
  expect((await top.boundingBox())!.y).toBeLessThan((await list.boundingBox())!.y);
  expect((await bottom.boundingBox())!.y).toBeGreaterThan((await list.boundingBox())!.y);
});

for (const kind of ["items", "monsters"] as const) {
  test(`${kind} compendium paginators share page state and disable next on the last page`, async ({
    page
  }) => {
    await page.route(`**/api/v1/${kind}?*`, (route) => {
      const currentPage = Number(new URL(route.request().url()).searchParams.get("page") ?? 1);
      const results = Array.from({ length: currentPage === 1 ? 50 : 1 }, (_, index) => {
        const id = (currentPage - 1) * 50 + index + 1;
        return kind === "items"
          ? {
              id: String(id),
              key: `test-item-${id}`,
              name: `Test Item ${id}`,
              rarityKey: null,
              rarityName: null,
              categoryKey: "gear",
              categoryName: "Gear",
              weight: "1",
              weightUnit: "lb",
              cost: "1",
              sourceKey: "test",
              sourceTitle: "Test"
            }
          : {
              id: String(id),
              key: `test-monster-${id}`,
              name: `Test Monster ${id}`,
              typeKey: "beast",
              typeName: "Beast",
              challengeRating: 1,
              sourceKey: "test",
              sourceTitle: "Test",
              imageUrl: null
            };
      });
      return route.fulfill({ json: { count: 51, page: currentPage, limit: 50, results } });
    });
    await page.goto(`/compendium?category=${kind.toUpperCase()}`);
    await checkBothPaginators(page);
    await page
      .getByRole("navigation", { name: /pagination \(bottom\)$/ })
      .getByRole("button", { name: "Next" })
      .click();
    await expect(
      page.getByRole("cell", {
        name: kind === "items" ? "Test Item 51" : "Test Monster 51",
        exact: true
      })
    ).toBeVisible();
    for (const position of ["top", "bottom"]) {
      await expect(
        page
          .getByRole("navigation", { name: new RegExp(`pagination \\(${position}\\)$`) })
          .getByRole("button", { name: "Next" })
      ).toBeDisabled();
    }
  });
}

test("administration defaults to recent activity, keeps sort arrows beside labels and shares pagination", async ({
  page
}, testInfo) => {
  const queries: URLSearchParams[] = [];
  await page.route("**/api/v1/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/auth/me"))
      return route.fulfill({
        json: {
          user: {
            id: "pagination-admin",
            nickname: "Test Admin",
            email: "admin@example.test",
            role: "admin",
            emailVerifiedAt: "2026-01-01T00:00:00.000Z",
            createdAt: "2026-01-01T00:00:00.000Z",
            lastFeedback: null
          }
        }
      });
    if (url.pathname.endsWith("/auth/preferences"))
      return route.fulfill({
        json: {
          preferences: {
            themeMode: "light",
            broadLayout: false,
            diceRollerBehavior: "full_manual"
          }
        }
      });
    if (url.pathname.includes("/characters"))
      return route.fulfill({ json: { characters: [], count: 0, limit: 20 } });
    if (url.pathname.endsWith("/administration/users")) {
      queries.push(url.searchParams);
      const currentPage = Number(url.searchParams.get("page") ?? 1);
      const results = Array.from({ length: currentPage === 1 ? 20 : 1 }, (_, index) => {
        const id = (currentPage - 1) * 20 + index + 1;
        return {
          id: String(id),
          nickname: `Player ${id}`,
          email: `player${id}@example.test`,
          role: "user",
          createdAt: "2026-01-01T00:00:00.000Z",
          lastActive: new Date(Date.UTC(2026, 8, 22 - id)).toISOString()
        };
      });
      return route.fulfill({ json: { count: 21, page: currentPage, limit: 20, results } });
    }
    return route.abort();
  });
  await page.goto("/administration");
  await expect(page.getByRole("cell", { name: "Player 1", exact: true })).toBeVisible();
  expect(queries[0].get("ordering")).toBe("-lastActive");
  const activeHeader = page.getByRole("columnheader", { name: "Last Active", exact: true });
  await expect(activeHeader).toHaveAttribute("aria-sort", "descending");
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    const color = await activeHeader
      .locator("svg")
      .evaluate((icon) => getComputedStyle(icon).color);
    const [red, green, blue] = color.match(/\d+/g)!.map(Number);
    expect(green).toBeGreaterThan(red);
    expect(green).toBeGreaterThan(blue);
    for (const label of ["Nickname", "Email", "Role", "Created", "Last Active"]) {
      const button = page
        .getByRole("columnheader", { name: label, exact: true })
        .getByRole("button");
      const text = (await button.locator("span").boundingBox())!;
      const icon = (await button.locator("svg").boundingBox())!;
      expect(icon.x - text.x - text.width).toBeGreaterThan(0);
      expect(icon.x - text.x - text.width).toBeLessThan(9);
    }
  }
  await page.screenshot({ path: testInfo.outputPath("administration-dark.png"), fullPage: true });
  await checkBothPaginators(page);
  await page
    .getByRole("navigation", { name: "Users pagination (bottom)" })
    .getByRole("button", { name: "Next" })
    .click();
  await expect(page.getByRole("cell", { name: "Player 21", exact: true })).toBeVisible();
  await activeHeader.getByRole("button").click();
  await expect(activeHeader).toHaveAttribute("aria-sort", "ascending");
  await expect(
    page.getByRole("navigation", { name: "Users pagination (top)" }).getByText("Page 1 of 2")
  ).toBeVisible();
  await expect.poll(() => queries.at(-1)?.get("ordering")).toBe("lastActive");
  await page.getByRole("button", { name: "Nickname", exact: true }).click();
  await expect(activeHeader).toHaveAttribute("aria-sort", "none");
  await expect(page.getByRole("columnheader", { name: "Nickname", exact: true })).toHaveAttribute(
    "aria-sort",
    "ascending"
  );
});
