import { test, expect } from "./fixtures";

const description =
  'First  line\n  Indented line\n\n\n    Second paragraph\n<img src=x onerror="window.descriptionExecuted=true">';

for (const kind of ["spells", "items", "bestiary"] as const) {
  test(`custom ${kind} preserve description formatting through save, preview, and reload`, async ({
    page
  }, testInfo) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill("browser@example.test");
    await page.getByLabel("Password", { exact: true }).fill("Synthetic-password-847!");
    const loginResponse = page.waitForResponse((response) =>
      new URL(response.url()).pathname.endsWith("/auth/login")
    );
    await page.getByRole("button", { name: /log in|sign in/i }).click();
    const login = await loginResponse;
    expect(login.ok()).toBe(true);
    await expect(page).not.toHaveURL(/\/login$/);
    const endpoint = new URL(`/api/v1/custom-${kind}`, login.url()).href;
    const name = `Formatting ${kind} ${testInfo.project.name}`;
    const input =
      kind === "spells"
        ? {
            name,
            castingTime: ["ACTION"],
            components: ["V"],
            description: ["Initial description"],
            duration: ["Instantaneous"],
            magicSchool: "EVOCATION",
            range: "Self",
            spellLevel: 0,
            spellLists: ["WIZARD"]
          }
        : kind === "items"
          ? {
              item: { id: "format-item", name, desc: "Initial description" },
              mods: {
                baseCategory: "general",
                isCustom: true,
                name,
                description: "Initial description"
              },
              settings: {}
            }
          : {
              monster: {
                id: "format-monster",
                name,
                desc: "Initial description",
                ability_scores: {}
              }
            };
    const created = await page.request.post(endpoint, { data: input });
    expect(created.status()).toBe(201);
    const envelope = await created.json();
    const record = envelope.customSpell ?? envelope.customItem ?? envelope.customCreature;
    try {
      await page.goto(`/gm-tools?tab=custom-${kind}`);
      await page.getByRole("button", { name: `Edit ${name}`, exact: true }).click();
      const editor = page.getByRole("dialog");
      await editor.getByRole("textbox", { name: "Description", exact: true }).fill(description);
      const saved = page.waitForResponse(
        (response) =>
          response.url() === `${endpoint}/${record.id}` && response.request().method() === "PUT"
      );
      await editor
        .getByRole("button", {
          name:
            kind === "spells" ? "Save Custom Spell" : kind === "items" ? "Save" : "Save creature",
          exact: true
        })
        .click();
      const savedResponse = await saved;
      expect(savedResponse.ok()).toBe(true);
      await expect(editor).not.toBeVisible();
      const expected =
        kind === "bestiary" ? description : description.replaceAll("<", "‹").replaceAll(">", "›");
      const persisted = await (await page.request.get(endpoint)).json();
      const records = persisted.customSpells ?? persisted.customItems ?? persisted.customBestiary;
      const stored = records.find((entry: { id: string }) => entry.id === record.id);
      expect(
        kind === "spells"
          ? stored.spell.description.join("\n\n")
          : kind === "items"
            ? stored.mods.description
            : stored.monster.desc
      ).toBe(expected);
      await page.reload();
      await page.getByRole("button", { name: `Preview ${name}`, exact: true }).click();
      const preview = page.getByRole("dialog");
      const paragraph = preview.locator("p").filter({ hasText: /First\s+line/ });
      await expect(paragraph).toHaveCount(1);
      expect(await paragraph.textContent()).toBe(expected);
      await expect(paragraph).toHaveCSS("white-space", "pre-wrap");
      await expect(preview.locator("script, img[onerror], iframe")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => (window as Window & { descriptionExecuted?: boolean }).descriptionExecuted
        )
      ).toBeUndefined();
      await page.screenshot({ path: testInfo.outputPath(`${kind}-description.png`) });
      await page.goto(`/gm-tools?tab=custom-${kind}`);
      await page.getByRole("button", { name: `Edit ${name}`, exact: true }).click();
      await expect(
        page.getByRole("dialog").getByRole("textbox", { name: "Description", exact: true })
      ).toHaveValue(expected);
    } finally {
      await page.request.delete(`${endpoint}/${record.id}`);
    }
  });
}
