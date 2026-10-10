import { test as base, expect, type Page } from "@playwright/test";
import { UpdateServer } from "./server";

const test = base.extend<{ deployment: { server: UpdateServer; url: string } }>({
  // eslint-disable-next-line no-empty-pattern -- This server has no browser fixture dependency.
  deployment: async ({}, use) => {
    const server = new UpdateServer();
    const url = await server.start();
    try {
      await use({ server, url });
    } finally {
      await server.close();
    }
  }
});

async function openInstalled(page: Page, url: string, build = "A") {
  await page.goto(url);
  await expect(page.getByTestId("build")).toHaveText(build);
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))))
    await page.reload();
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);
}

async function discover(page: Page, server: UpdateServer, release = "B") {
  server.release = release;
  // Boot the old cached page against a newer deployment, as in the reported loop.
  await page.reload();
  await expect(page.getByRole("button", { name: "Update", exact: true })).toBeVisible();
}

function navigations(page: Page) {
  const urls: string[] = [];
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame())
      urls.push(request.url());
  });
  return urls;
}

async function expectUpdated(page: Page, build = "B") {
  await expect(page.getByTestId("build")).toHaveText(build);
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect.poll(() => new URL(page.url()).searchParams.has("__arcane_update")).toBe(false);
}

test("slow installation waits past the former timeout; repeated clicks navigate once and preserve a pending draft", async ({
  page,
  deployment
}) => {
  const { server, url } = deployment;
  await openInstalled(page, url);
  server.holdAsset = true;
  await discover(page, server);
  await page.evaluate(() => window.stageUpdateDraft("unsaved character edit"));
  const urls = navigations(page);
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expect.poll(() => server.heldRequests).toBeGreaterThan(0);
  // Deliberately exceed the old five-second fallback, while installation is held.
  await page.waitForTimeout(6_000);
  await expect(page.getByRole("button", { name: "Updating", exact: true })).toBeDisabled();
  await page.evaluate(() => {
    for (let i = 0; i < 5; i++) void window.runAppUpdate();
  });
  expect(urls).toHaveLength(0);
  server.releaseAssets();
  await expectUpdated(page);
  expect(urls).toHaveLength(1);
  expect(await page.evaluate(() => localStorage.getItem("update-journey-draft"))).toBe(
    "unsaved character edit"
  );
  await page.reload();
  await expectUpdated(page);
});

test("failed precache download keeps the old page and recovers on retry", async ({
  page,
  deployment
}) => {
  const { server, url } = deployment;
  await openInstalled(page, url);
  server.failAsset = true;
  await discover(page, server);
  const urls = navigations(page);
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expect(page.getByRole("button", { name: "Try again" })).toBeEnabled();
  expect(urls).toHaveLength(0);
  await expect(page.getByTestId("build")).toHaveText("A");
  server.failAsset = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expectUpdated(page);
  expect(urls).toHaveLength(1);
});

test("offline update fails without navigation and succeeds after reconnection", async ({
  page,
  context,
  deployment
}) => {
  const { server, url } = deployment;
  await openInstalled(page, url);
  server.failWorker = true;
  await discover(page, server);
  await context.setOffline(true);
  const urls = navigations(page);
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expect(page.getByRole("button", { name: "Try again" })).toBeEnabled();
  expect(urls).toHaveLength(0);
  server.failWorker = false;
  await context.setOffline(false);
  await page.getByRole("button", { name: "Try again" }).click();
  await expectUpdated(page);
});

test("activation timeout and an unrelated controller event cannot cause a reload", async ({
  page,
  deployment
}) => {
  const { server, url } = deployment;
  await openInstalled(page, url);
  await discover(page, server);
  await expect
    .poll(() =>
      page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration())?.waiting))
    )
    .toBe(true);
  await page.evaluate(() => {
    const original = ServiceWorker.prototype.postMessage;
    ServiceWorker.prototype.postMessage = function (
      message: unknown,
      options?: Transferable[] | StructuredSerializeOptions
    ) {
      if ((message as { type?: string })?.type !== "SKIP_WAITING")
        Reflect.apply(original, this, [message, options]);
    };
    (window as unknown as { restoreWorkerMessages: () => void }).restoreWorkerMessages = () => {
      ServiceWorker.prototype.postMessage = original;
    };
  });
  await page.clock.install();
  const urls = navigations(page);
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expect(page.getByRole("button", { name: "Updating", exact: true })).toBeDisabled();
  await expect(page.getByRole("status")).toHaveText("Applying the update. Keep this window open.");
  await page.evaluate(() => navigator.serviceWorker.dispatchEvent(new Event("controllerchange")));
  await page.clock.runFor(45_100);
  await expect(page.getByRole("button", { name: "Try again" })).toBeEnabled();
  expect(urls).toHaveLength(0);
  await page.evaluate(() =>
    (window as unknown as { restoreWorkerMessages: () => void }).restoreWorkerMessages()
  );
  await page.getByRole("button", { name: "Try again" }).click();
  await expectUpdated(page);
});

test("another tab can activate the update without reloading a tab with pending edits", async ({
  page,
  context,
  deployment
}) => {
  const { server, url } = deployment;
  await openInstalled(page, url);
  const other = await context.newPage();
  await openInstalled(other, url);
  await other.evaluate(() => window.stageUpdateDraft("other tab draft"));
  const otherUrls = navigations(other);
  await discover(page, server);
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expectUpdated(page);
  await expect(other.getByTestId("build")).toHaveText("A");
  await expect(other.getByRole("button", { name: "Update", exact: true })).toBeVisible();
  expect(otherUrls).toHaveLength(0);
  await other.getByRole("button", { name: "Update", exact: true }).click();
  await expectUpdated(other);
  expect(otherUrls).toHaveLength(1);
  expect(await other.evaluate(() => localStorage.getItem("update-journey-draft"))).toBe(
    "other tab draft"
  );
});

test("a newer deployment superseding the prompt loads its actual worker build", async ({
  page,
  deployment
}) => {
  const { server, url } = deployment;
  await openInstalled(page, url);
  await discover(page, server);
  await expect
    .poll(() =>
      page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration())?.waiting))
    )
    .toBe(true);
  server.release = "C";
  await page.evaluate(async () => {
    await (await navigator.serviceWorker.getRegistration())!.update();
  });
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expectUpdated(page, "C");
});

test("a version mismatch without an installed update times out without reloading", async ({
  page,
  deployment
}) => {
  const { server, url } = deployment;
  await openInstalled(page, url);
  server.version = "B";
  await page.reload();
  await expect(page.getByRole("button", { name: "Update", exact: true })).toBeVisible();
  await page.clock.install();
  const urls = navigations(page);
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await page.clock.runFor(45_100);
  await expect(page.getByRole("button", { name: "Try again" })).toBeEnabled();
  expect(urls).toHaveLength(0);
});

test("a wrong cached shell is detected after navigation and cannot form another reload loop", async ({
  page,
  deployment
}) => {
  const { server, url } = deployment;
  await openInstalled(page, url);
  server.staleShell = true;
  await discover(page, server);
  const urls = navigations(page);
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  await expect(page.getByTestId("build")).toHaveText("A");
  expect(urls).toHaveLength(1);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("status")).toContainText("Close and reopen");
  expect(urls).toHaveLength(1);
});

test("navigation verification works when session storage is blocked", async ({
  page,
  deployment
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new Error("Storage denied");
      }
    });
  });
  const { server, url } = deployment;
  await openInstalled(page, url);
  await discover(page, server);
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expectUpdated(page);
});

for (const mode of ["missing API", "registration denied"] as const) {
  test(`a browser with ${mode} verifies the network shell before navigating`, async ({
    page,
    deployment
  }) => {
    await page.addInitScript((mode) => {
      if (mode === "missing API")
        Object.defineProperty(navigator, "serviceWorker", { value: undefined });
      else
        navigator.serviceWorker.register = () =>
          Promise.reject(new Error("Registration disabled by browser policy"));
    }, mode);
    const { server, url } = deployment;
    server.version = "B";
    await page.goto(url);
    await expect(page.getByRole("button", { name: "Update", exact: true })).toBeVisible();
    const urls = navigations(page);
    await page.getByRole("button", { name: "Update", exact: true }).click();
    await expect(page.getByRole("button", { name: "Try again" })).toBeEnabled();
    expect(urls).toHaveLength(0);
    server.release = "B";
    await page.getByRole("button", { name: "Try again" }).click();
    await expectUpdated(page);
    expect(urls).toHaveLength(1);
  });
}

test("stale asset recovery uses the same verified update path", async ({ page, deployment }) => {
  const { server, url } = deployment;
  await openInstalled(page, url);
  server.release = "B";
  await page.evaluate(() => window.markUpdateAssetFailure());
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expectUpdated(page);
});

test("the deployed legacy updater can enter the fixed release, then update normally", async ({
  page,
  deployment
}) => {
  const { server, url } = deployment;
  server.release = "legacy";
  await openInstalled(page, url, "legacy");
  server.release = "B";
  await page.reload();
  await expect(page.getByRole("button", { name: "Reload", exact: true })).toBeVisible();
  // The old client cannot be retroactively fixed. Verify its supported transition
  // after installation, then exercise the next update through the new coordinator.
  await expect
    .poll(() =>
      page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration())?.waiting))
    )
    .toBe(true);
  await page.getByRole("button", { name: "Reload", exact: true }).click();
  await expectUpdated(page);
  await discover(page, server, "C");
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expectUpdated(page, "C");
});

test("a transient asset failure can recover the current build once without creating a reload loop", async ({
  page,
  deployment
}) => {
  await openInstalled(page, deployment.url);
  const urls = navigations(page);
  await page.evaluate(() => window.markUpdateAssetFailure());
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expect.poll(() => urls.length).toBe(1);
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(page.getByTestId("build")).toHaveText("A");
  await page.evaluate(() => window.markUpdateAssetFailure());
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expect(page.getByRole("button", { name: "Try again" })).toBeEnabled();
  expect(urls).toHaveLength(1);
});

test("downloaded updates apply offline or recover from WebKit's rejected navigation", async ({
  page,
  context,
  browserName,
  deployment
}) => {
  const { server, url } = deployment;
  await openInstalled(page, url);
  await discover(page, server);
  await expect
    .poll(() =>
      page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration())?.waiting))
    )
    .toBe(true);
  await context.setOffline(true);
  const urls = navigations(page);
  await page.getByRole("button", { name: "Update", exact: true }).click();
  if (browserName === "webkit") {
    // Playwright WebKit rejects this offline navigation with an internal error,
    // even after the new worker controls the page. Require bounded recovery.
    await expect(page.getByRole("button", { name: "Try again" })).toBeEnabled();
    await expect(page.getByRole("status")).toContainText("could not be opened");
    await expect(page.getByTestId("build")).toHaveText("A");
    expect(urls).toHaveLength(1);
    await context.setOffline(false);
    await page.getByRole("button", { name: "Try again" }).click();
    await expectUpdated(page);
    expect(urls).toHaveLength(2);
  } else {
    await expectUpdated(page);
    expect(urls).toHaveLength(1);
  }
});
