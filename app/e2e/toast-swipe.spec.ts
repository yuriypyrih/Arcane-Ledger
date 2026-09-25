import { test, expect } from "./fixtures";

test("touch swipes dismiss top and bottom toasts toward their screen edge", async ({ page }) => {
  await page.goto("/");
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setTouchEmulationEnabled", { enabled: true });
  for (const position of ["top-middle", "bottom-middle"]) {
    await page.evaluate(
      async ({ position, modulePath }) => {
        const { store, showToast } = await import(modulePath);
        store.dispatch(showToast({ text: "Swipe test", position, dismissMs: 60000 }));
      },
      { position, modulePath: "/src/store/index.ts" }
    );
    const toast = page.getByRole("status").filter({ hasText: "Swipe test" });
    await expect(toast).toBeVisible();
    // Wait for entry animation before choosing a physical touch point.
    await toast.evaluate(async (element) => {
      await Promise.all(
        element.getAnimations({ subtree: true }).map((animation) => animation.finished)
      );
    });
    const box = (await toast.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = position.startsWith("top") ? box.y + box.height - 8 : box.y + 8;
    const direction = position.startsWith("top") ? -1 : 1;
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: y + direction * 20 }]
    });
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: y + direction * 40 }]
    });
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(toast).toHaveCount(0);
  }
  await client.detach();
});

test("whole toast supports click, keyboard dismissal, and hover feedback", async ({
  page
}, testInfo) => {
  await page.goto("/");
  for (const action of ["click", "Enter", "Space"]) {
    await page.evaluate(async (modulePath) => {
      const { store, showToast } = await import(modulePath);
      store.dispatch(showToast({ text: "Clickable toast", dismissMs: 60000 }));
    }, "/src/store/index.ts");
    const toast = page.getByRole("status").filter({ hasText: "Clickable toast" });
    const button = toast.getByRole("button", { name: "Dismiss info toast: Clickable toast" });
    await expect(toast.getByRole("button")).toHaveCount(1);
    await expect(button).toBeVisible();
    if (action === "click") {
      if (testInfo.project.name === "desktop") {
        await button.hover();
        await expect(button).toHaveCSS("filter", "brightness(1.12)");
      }
      await button.click();
    } else {
      await button.focus();
      await expect(button).toBeFocused();
      await button.press(action);
    }
    await expect(toast).toHaveCount(0);
  }
});
