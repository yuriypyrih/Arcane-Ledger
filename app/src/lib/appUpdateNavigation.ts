const TARGET_PARAMETER = "__arcane_update";
const SOURCE_PARAMETER = "__arcane_update_from";

export type AppUpdateNavigation = { fromBuildId: string; targetBuildId: string };

// Keep the receipt in the navigation itself: it survives a reload even when
// sessionStorage is unavailable. It is never evidence that installation succeeded.
export function readAppUpdateNavigation(url: URL): AppUpdateNavigation | null {
  const fromBuildId = url.searchParams.get(SOURCE_PARAMETER);
  const targetBuildId = url.searchParams.get(TARGET_PARAMETER);
  return fromBuildId && targetBuildId ? { fromBuildId, targetBuildId } : null;
}

export function clearAppUpdateNavigation(url: URL) {
  url.searchParams.delete(TARGET_PARAMETER);
  url.searchParams.delete(SOURCE_PARAMETER);
  return url;
}

export function createAppUpdateNavigation(url: URL, fromBuildId: string, targetBuildId: string) {
  const previous = readAppUpdateNavigation(url);
  if (previous?.targetBuildId === targetBuildId) {
    throw new Error(
      "The new version did not load. Close and reopen the app, or try again when another update is available."
    );
  }
  url.searchParams.set(TARGET_PARAMETER, targetBuildId);
  url.searchParams.set(SOURCE_PARAMETER, fromBuildId);
  return url;
}

export function navigateToAppUpdate(destination: URL, onFailure: () => void) {
  // A browser can reject navigation asynchronously, leaving the old page open.
  // Restore a usable retry state in that case, without another navigation.
  const cancelNavigationWatch = () => {
    window.clearTimeout(navigationTimeout);
    window.removeEventListener("pagehide", cancelNavigationWatch);
  };
  const navigationTimeout = window.setTimeout(() => {
    cancelNavigationWatch();
    onFailure();
  }, 10_000);
  window.addEventListener("pagehide", cancelNavigationWatch, { once: true });
  try {
    window.location.replace(destination.href);
  } catch (error) {
    cancelNavigationWatch();
    throw error;
  }
}
