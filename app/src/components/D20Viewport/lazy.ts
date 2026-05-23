let d20ViewportPromise: Promise<typeof import("./D20Viewport")> | null = null;

export function loadD20Viewport() {
  if (!d20ViewportPromise) {
    d20ViewportPromise = import("./D20Viewport").catch((error) => {
      d20ViewportPromise = null;
      throw error;
    });
  }

  return d20ViewportPromise;
}

export function preloadD20Viewport() {
  return loadD20Viewport().then(() => undefined);
}
