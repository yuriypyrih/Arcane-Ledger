import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Uses the existing Playwright installation and synthetic saved-sheet fixture.
// Development render counts require ENABLE_RENDER_PROFILER_BY_DEFAULT_IN_DEV in a disposable copy.
const args = process.argv.slice(2);
const option = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const url = option("--url", "http://127.0.0.1:4181");
const output = option("--out", "/tmp/arcane-sheet-profile.json");
const offline = args.includes("--offline");
process.env.PLAYWRIGHT_BROWSERS_PATH ??= fileURLToPath(
  new URL("../../.cache/playwright", import.meta.url)
);
const { chromium, expect: baseExpect } = await import("@playwright/test");
const expect = baseExpect.configure({ timeout: 15000 });
const fixture = JSON.parse(
  await readFile(new URL("../../fixtures/characters/fighter.json", import.meta.url), "utf8")
);
const browser = await chromium.launch();
const results = [];
let activePage;
try {
  for (const kind of ["single", "multiclass"].filter(
    (kind) => !args.includes("--fixture") || kind === option("--fixture")
  )) {
    console.log(`Profiling ${kind}`);
    const sheet = structuredClone(fixture);
    sheet.progression = { className: "Wizard", subclassId: "wizard-evoker", level: 10, xp: 64000 };
    sheet.spellcasting = {
      cantripIds: ["spell-fire-bolt"],
      spellbookSpellIds: ["spell-detect-magic", "spell-mage-armor"],
      preparedSpellIds: ["spell-detect-magic", "spell-mage-armor"],
      spellSlotsExpended: Array(9).fill(0)
    };
    if (kind === "multiclass") {
      sheet.schemaVersion = 3;
      sheet.progression = {
        className: "Fighter",
        subclassId: "",
        level: 11,
        xp: 85000,
        multiclass: {
          startingClassId: "fighter",
          prerequisiteOverride: true,
          hitPointsAdjustment: 0,
          classes: [
            { id: "fighter", className: "Fighter", level: 2 },
            {
              id: "wizard",
              className: "Wizard",
              level: 6,
              subclassId: "wizard-bladesinger",
              ...sheet.spellcasting
            },
            { id: "ranger", className: "Ranger", level: 3, subclassId: "ranger-hunter" }
          ]
        }
      };
    }
    sheet.inventory.items = [
      {
        id: "profile-chain",
        item: {
          id: "profile-chain",
          key: "profile-chain",
          name: "Profile Chain Mail",
          category: { key: "heavy-armor", name: "Heavy Armor" },
          armor: {
            category: "heavy",
            ac_base: 16,
            ac_display: "16",
            ac_add_dexmod: false,
            ac_cap_dexmod: 0,
            grants_stealth_disadvantage: true,
            strength_score_required: 13
          }
        },
        quantity: 1,
        onHandQuantity: 0,
        worn: false
      }
    ];
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      serviceWorkers: offline ? "allow" : "block"
    });
    await context.route("**/*", (route) => {
      const requestUrl = new URL(route.request().url());
      if (!["127.0.0.1", "localhost"].includes(requestUrl.hostname)) return route.abort();
      if (requestUrl.pathname.startsWith("/api/"))
        return route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            error: { code: "UNAUTHENTICATED", message: "Synthetic guest session" }
          })
        });
      return route.continue();
    });
    const page = await context.newPage();
    activePage = page;
    const errors = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
      console.error(error.message);
    });
    await page.addInitScript((record) => {
      if (!localStorage.getItem("arcane-ledger.characters"))
        localStorage.setItem("arcane-ledger.characters", JSON.stringify([record]));
      localStorage.setItem("dad.characterRuntimeDebug", "1");
      window.__runtimeSamples = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (entry.name.startsWith("character-sheet:"))
            window.__runtimeSamples.push({ name: entry.name, duration: entry.duration });
      }).observe({ entryTypes: ["measure"] });
    }, sheet);
    await page.goto(`${url}/characters/${sheet.identity.localId}`);
    await expect(page.getByRole("button", { name: "Camp", exact: true })).toBeVisible();
    // Include queued HP persistence in counts, but keep settling time out of interaction latency.
    const settle = () => page.waitForTimeout(500);
    const collect = () =>
      page.evaluate(() => ({
        sections: window.arcaneLedgerCharacterSheetSectionProfiler?.getSummary() ?? [],
        runtime: window.__runtimeSamples ?? []
      }));
    await settle();
    const initial = await collect();
    if (!offline && !initial.sections.length)
      throw new Error(
        "Enable the existing render profiler in the disposable development source before profiling."
      );
    const initialAssets = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((entry) => ["script", "link"].includes(entry.initiatorType))
        .map((entry) => ({
          name: new URL(entry.name).pathname,
          decodedBytes: entry.decodedBodySize,
          transferBytes: entry.transferSize
        }))
    );
    const operations = [];
    async function capture(name, action) {
      await settle();
      const started = await page.evaluate(() => {
        window.arcaneLedgerCharacterSheetSectionProfiler?.clear();
        window.__runtimeSamples = [];
        return performance.now();
      });
      await action();
      const visibleUpdateMs = await page.evaluate(() => window.__hpVisibleUpdateMs ?? null);
      const elapsedMs = await page.evaluate((start) => performance.now() - start, started);
      await settle();
      operations.push({
        name,
        elapsedMs,
        ...(name === "HP damage" ? { visibleUpdateMs } : {}),
        ...(await collect())
      });
    }
    const stats = page
      .locator("article")
      .filter({ has: page.getByRole("button", { name: "Open character stats guide" }) });
    await stats.getByRole("button", { name: "Edit", exact: true }).click();
    await page.getByRole("spinbutton", { name: /^DEX/ }).fill("20");
    await capture("ability save", async () => {
      await page.getByRole("dialog").getByRole("button", { name: /Save/ }).click();
      await expect(page.getByLabel("DEX score 20", { exact: true })).toBeVisible();
    });
    await capture("HP damage", async () => {
      await page.getByText(/^30\/\d+ HP$/).evaluate((label) => {
        let started;
        document.addEventListener(
          "pointerdown",
          () => {
            started = performance.now();
          },
          { once: true, capture: true }
        );
        const observer = new MutationObserver(() => {
          if (label.textContent.startsWith("29/") && started !== undefined) {
            window.__hpVisibleUpdateMs = performance.now() - started;
            observer.disconnect();
          }
        });
        observer.observe(label, { childList: true, characterData: true, subtree: true });
      });
      await page.getByRole("button", { name: "Deal 1 hit points", exact: true }).click();
      await expect(page.getByText(/^29\/\d+ HP$/)).toBeVisible();
    });
    await page.getByText("Profile Chain Mail", { exact: true }).click();
    await capture("equip armor", async () => {
      await page.getByRole("button", { name: "DON", exact: true }).click();
      await expect(page.getByRole("button", { name: "Armor Class 16", exact: true })).toBeVisible();
    });
    await page.getByRole("button", { name: "Close item inspection" }).click();
    await capture("open spell drawer", async () => {
      await page.getByText("Detect Magic", { exact: true }).last().click();
      await expect(page.getByRole("button", { name: "Cast", exact: true })).toBeVisible();
    });
    await capture("cast spell", async () => {
      await page.getByRole("button", { name: "Cast", exact: true }).click();
      await expect(page.getByRole("button", { name: /^Concentration/ })).toBeVisible();
    });
    await page.getByRole("button", { name: "Camp", exact: true }).click();
    const camp = page.getByRole("dialog", { name: "Choose your rest" });
    await camp.getByText("Long Rest", { exact: true }).click();
    await capture("long rest", async () => {
      await camp.getByRole("button", { name: "Rest", exact: true }).click();
      await expect(camp).not.toBeVisible();
    });
    let offlineVerified = false;
    if (offline) {
      await page.evaluate(() => navigator.serviceWorker.ready);
      // Prompt-mode registration takes control on the next navigation after first installation.
      if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))))
        await page.reload();
      await expect
        .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
        .toBe(true);
      await context.setOffline(true);
      await page.reload();
      await expect(page.getByRole("button", { name: "Camp", exact: true })).toBeVisible();
      await expect(page.getByLabel("DEX score 20", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Armor Class 16", exact: true })).toBeVisible();
      await page.getByText("Detect Magic", { exact: true }).last().click();
      await page.getByRole("button", { name: "Cast", exact: true }).click();
      await expect(page.getByRole("button", { name: /^Concentration/ })).toBeVisible();
      offlineVerified = true;
    }
    expect(errors).toEqual([]);
    results.push({ kind, initial, initialAssets, operations, offlineVerified, errors });
    await context.close();
  }
  await writeFile(output, JSON.stringify({ url, developmentProfiler: !offline, results }, null, 2));
  console.log(`Saved ${results.length} fixture journeys to ${output}`);
} catch (error) {
  if (activePage && !activePage.isClosed())
    console.error(await activePage.locator("body").innerText());
  throw error;
} finally {
  await browser.close();
}
