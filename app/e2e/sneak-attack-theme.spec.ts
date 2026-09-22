import { test, expect, openLocalSheet, portableSheet } from "./fixtures";

test("Cunning Strike text follows the theme before and after selecting an effect", async ({
  page
}, testInfo) => {
  await openLocalSheet(
    page,
    portableSheet({
      progression: { className: "Rogue", subclassId: "rogue-thief", level: 5, xp: 6500 },
      features: { classFeatureState: {}, feats: [] },
      spellcasting: {}
    })
  );
  await page.getByRole("button", { name: /^Sneak Attack .*Damage/ }).click();
  const drawer = page.getByRole("dialog");
  const options = drawer.locator("label").filter({ has: page.getByRole("checkbox") });
  await expect(options).toHaveCount(3);
  const poison = options.filter({ hasText: "Poison" });
  const formula = drawer.getByText("3~18 Damage = 3d6", { exact: true });
  const spent = drawer.getByText("0d6 spent", { exact: true });

  await page.evaluate(() => {
    document.documentElement.dataset.theme = "light";
  });
  const lightColors = await poison
    .locator("p, strong")
    .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).color));
  const lightFormulaColor = await formula.evaluate((element) => getComputedStyle(element).color);
  const lightSpendColor = await spent.evaluate((element) => getComputedStyle(element).color);

  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  const darkColors = await poison
    .locator("p, strong")
    .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).color));
  expect(darkColors).not.toEqual(lightColors);
  expect(await formula.evaluate((element) => getComputedStyle(element).color)).not.toBe(
    lightFormulaColor
  );
  expect(await spent.evaluate((element) => getComputedStyle(element).color)).not.toBe(
    lightSpendColor
  );

  // Allow the theme's background transition to settle before checking text against the panel fill.
  async function expectReadableOptions() {
    await expect
      .poll(async () => {
        const contrastRatios = await options.locator("p, strong").evaluateAll((elements) => {
          function luminance(color: string) {
            const channels = color
              .match(/[\d.]+/g)!
              .slice(0, 3)
              .map(Number)
              .map((value) => {
                const channel = value / 255;
                return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
              });
            return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
          }
          return elements.map((element) => {
            const text = luminance(getComputedStyle(element).color);
            const background = luminance(
              getComputedStyle(element.closest("label")!).backgroundColor
            );
            return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
          });
        });
        expect(contrastRatios.length).toBeGreaterThan(0);
        return Math.min(...contrastRatios);
      })
      .toBeGreaterThanOrEqual(4.5);
  }
  await expectReadableOptions();
  await poison.getByRole("checkbox").check();
  await expect(poison.getByRole("checkbox")).toBeChecked();
  await expect(drawer.getByText("1d6 spent", { exact: true })).toBeVisible();
  await expect(drawer.getByText("2~12 Damage = 2d6", { exact: true })).toBeVisible();
  await expectReadableOptions();
  await page.screenshot({ path: testInfo.outputPath("cunning-strike-dark.png") });
  await poison.getByRole("checkbox").uncheck();
  await expect(spent).toBeVisible();

  await page.evaluate(() => {
    document.documentElement.dataset.theme = "light";
  });
  expect(
    await poison
      .locator("p, strong")
      .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).color))
  ).toEqual(lightColors);
});
