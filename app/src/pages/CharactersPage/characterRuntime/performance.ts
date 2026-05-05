const performanceDebugStorageKey = "dad.characterRuntimeDebug";

function isCharacterRuntimePerformanceDebugEnabled(): boolean {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(performanceDebugStorageKey) === "1";
  } catch {
    return false;
  }
}

export function measureCharacterRuntime<T>(name: string, callback: () => T): T {
  if (
    !isCharacterRuntimePerformanceDebugEnabled() ||
    typeof window.performance?.mark !== "function" ||
    typeof window.performance?.measure !== "function"
  ) {
    return callback();
  }

  const markerId =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  const startMark = `${name}:start:${markerId}`;
  const endMark = `${name}:end:${markerId}`;

  window.performance.mark(startMark);

  try {
    return callback();
  } finally {
    window.performance.mark(endMark);
    window.performance.measure(name, startMark, endMark);
    window.performance.clearMarks(startMark);
    window.performance.clearMarks(endMark);
    window.performance.clearMeasures(name);
  }
}
