import { test, expect, portableSheet } from "./fixtures";

test("sign in, edit a cloud character, and retrieve the change from the real API", async ({
  page
}) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("browser@example.test");
  await page.getByLabel("Password", { exact: true }).fill("Synthetic-password-847!");
  await page.getByRole("button", { name: /log in|sign in/i }).click();
  await expect(page).not.toHaveURL(/\/login$/);
  const clientId = `browser-${test.info().project.name}`;
  const sheet = portableSheet();
  const response = await page.request.post("http://127.0.0.1:4176/api/v1/characters/import", {
    data: { records: [{ clientId, sheet }] }
  });
  expect(response.status()).toBe(201);
  const {
    characters: [cloud]
  } = await response.json();
  try {
    await page.goto("/characters");
    await page.getByRole("link", { name: "View Test Adventurer" }).click();
    await page.getByRole("button", { name: "Deal 1 hit points", exact: true }).click();
    await expect
      .poll(
        async () => {
          const result = await page.request.get(
            `http://127.0.0.1:4176/api/v1/characters/${cloud.id}`
          );
          return (await result.json()).character.sheet.vitals.currentHitPoints;
        },
        { timeout: 35000 }
      )
      .toBe(29);
    await page.reload();
    await expect(page.getByText("29/30 HP", { exact: true })).toBeVisible();
  } finally {
    await page.request.delete(`http://127.0.0.1:4176/api/v1/characters/${cloud.id}`);
  }
});
