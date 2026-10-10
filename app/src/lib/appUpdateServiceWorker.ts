const BUILD_ID_MESSAGE = "ARCANE_LEDGER_BUILD_ID";
const IDENTITY_TIMEOUT_MS = 2_000;

export function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      signal.removeEventListener("abort", abort);
      reject(new Error("The update could not finish. Check your connection and try again."));
    };
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", abort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", abort);
        reject(error);
      }
    );
  });
}

export function readWorkerBuildId(
  worker: ServiceWorker,
  signal: AbortSignal
): Promise<string | null> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const finish = (buildId: string | null) => {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      channel.port1.close();
      channel.port2.close();
      resolve(buildId);
    };
    const abort = () => finish(null);
    const timer = window.setTimeout(abort, IDENTITY_TIMEOUT_MS);
    signal.addEventListener("abort", abort, { once: true });
    channel.port1.onmessage = (event: MessageEvent<{ buildId?: unknown }>) => {
      const id = event.data?.buildId;
      finish(typeof id === "string" && id.length > 0 && id.length <= 180 ? id : null);
    };
    if (signal.aborted) {
      finish(null);
      return;
    }
    try {
      worker.postMessage({ type: BUILD_ID_MESSAGE }, [channel.port2]);
    } catch {
      finish(null);
    }
  });
}

// Events wake the waiter promptly; the short poll also reconciles registration
// slots assigned just after a worker's statechange event. Time never means success.
function waitForWorkerChange(registration: ServiceWorkerRegistration, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const workers = new Set([registration.installing, registration.waiting, registration.active]);
    const finish = () => {
      window.clearTimeout(timer);
      registration.removeEventListener("updatefound", finish);
      navigator.serviceWorker.removeEventListener("controllerchange", finish);
      signal.removeEventListener("abort", finish);
      workers.forEach((worker) => worker?.removeEventListener("statechange", finish));
      resolve();
    };
    const timer = window.setTimeout(finish, 250);
    registration.addEventListener("updatefound", finish);
    navigator.serviceWorker.addEventListener("controllerchange", finish);
    signal.addEventListener("abort", finish, { once: true });
    workers.forEach((worker) => worker?.addEventListener("statechange", finish));
    if (signal.aborted) finish();
  });
}

export type PreparedAppWorker = { worker: ServiceWorker; buildId: string };

export async function prepareAppWorker(
  registration: ServiceWorkerRegistration,
  currentBuildId: string,
  signal: AbortSignal,
  canRecoverCurrentBuild?: () => Promise<boolean>
): Promise<PreparedAppWorker> {
  const identities = new Map<ServiceWorker, string | null>();
  let installing = registration.installing;
  let updateError: unknown;
  let recoveryChecked = false;
  // An already installing/waiting worker is usable without another update job.
  // In particular, register()/update() may remain pending during installation.
  if (!registration.waiting && !registration.installing) {
    void registration.update().catch((error: unknown) => {
      updateError = error;
    });
  }
  while (!signal.aborted) {
    installing = registration.installing ?? installing;
    const candidates = new Set([
      registration.waiting,
      navigator.serviceWorker.controller,
      registration.active
    ]);
    for (const worker of candidates) {
      if (!worker || !["installed", "activating", "activated"].includes(worker.state)) continue;
      if (!identities.has(worker)) {
        identities.set(worker, await readWorkerBuildId(worker, signal));
      }
      const buildId = identities.get(worker);
      if (buildId && buildId !== currentBuildId && worker.state !== "redundant") {
        return { worker, buildId };
      }
      if (buildId === currentBuildId && canRecoverCurrentBuild && !recoveryChecked) {
        recoveryChecked = true;
        if (await canRecoverCurrentBuild()) return { worker, buildId };
      }
    }
    if (updateError || installing?.state === "redundant") {
      throw new Error("The update could not be downloaded. Check your connection and try again.");
    }
    await waitForWorkerChange(registration, signal);
  }
  throw new Error("The update is still unavailable. Check your connection and try again.");
}

export async function activateAppWorker(
  registration: ServiceWorkerRegistration,
  worker: ServiceWorker,
  signal: AbortSignal
) {
  if (worker.state === "installed") worker.postMessage({ type: "SKIP_WAITING" });
  while (!signal.aborted) {
    if (worker.state === "redundant") {
      throw new Error("Another update replaced this one. Try again to load the latest version.");
    }
    if (worker.state === "activated" && navigator.serviceWorker.controller === worker) return;
    await waitForWorkerChange(registration, signal);
  }
  throw new Error("The update could not take over. Please try again.");
}
