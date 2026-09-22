import { test, expect, openLocalSheet, portableSheet } from "./fixtures";

test("action headers keep their title readable while charges and alternatives wrap", async ({
  page
}, testInfo) => {
  await openLocalSheet(
    page,
    portableSheet({
      progression: {
        className: "Druid",
        subclassId: "druid-circle-of-the-moon",
        level: 10,
        xp: 64000
      },
      abilities: {
        ...portableSheet().abilities,
        scores: { ...portableSheet().abilities.scores, WIS: 20 }
      },
      features: { classFeatureState: {}, feats: [] },
      spellcasting: {}
    })
  );
  await page.getByRole("button", { name: /^Moonlight Step Charges/ }).click();
  const drawer = page.getByRole("dialog", { name: "Moonlight Step", exact: true });
  const title = drawer.getByRole("heading", { name: "Moonlight Step", exact: true });
  const eyebrow = drawer.getByText("SUBCLASS: CIRCLE OF THE MOON", { exact: true });
  const charges = drawer.getByText("Charges", { exact: true });
  const alternative = drawer.getByText("instead", { exact: true });
  const close = drawer.getByRole("button", { name: "Close Moonlight Step", exact: true });
  await expect(charges).toBeVisible();
  await expect(alternative).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  for (const width of [320, 390, 599, 600, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(
        async () => {
          const heading = await title.boundingBox();
          const source = await eyebrow.boundingBox();
          const dismiss = await close.boundingBox();
          const charge = await charges.boundingBox();
          const fallback = await alternative.boundingBox();
          const titleLineHeight = await title.evaluate((element) =>
            parseFloat(getComputedStyle(element).lineHeight)
          );
          const eyebrowLineHeight = await eyebrow.evaluate((element) =>
            parseFloat(getComputedStyle(element).lineHeight)
          );
          return {
            titleFitsOneLine: heading!.height <= titleLineHeight + 1,
            eyebrowFitsTwoLines: source!.height <= eyebrowLineHeight * 2 + 1,
            closeBesideHeading: dismiss!.x >= heading!.x + heading!.width,
            closeAtTop: Math.abs(dismiss!.y - source!.y) <= 1,
            tagsBelowOnPhone:
              width > 599 || Math.min(charge!.y, fallback!.y) >= heading!.y + heading!.height,
            tagsBesideOnDesktop: width < 1280 || charge!.x > heading!.x + heading!.width,
            noHorizontalOverflow: await drawer.evaluate(
              (element) => element.scrollWidth <= element.clientWidth
            )
          };
        },
        { message: `Header layout at ${width}px` }
      )
      .toEqual({
        titleFitsOneLine: true,
        eyebrowFitsTwoLines: true,
        closeBesideHeading: true,
        closeAtTop: true,
        tagsBelowOnPhone: true,
        tagsBesideOnDesktop: true,
        noHorizontalOverflow: true
      });
    if ([320, 390, 600, 1280].includes(width)) {
      await drawer.screenshot({ path: testInfo.outputPath(`moonlight-step-${width}.png`) });
    }
  }

  await close.click();
  await expect(drawer).toBeHidden();
});
