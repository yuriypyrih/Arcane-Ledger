export function deferModalCommit(callback: () => void) {
  if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
    callback();
    return;
  }

  window.requestAnimationFrame(() => {
    window.setTimeout(callback, 0);
  });
}
