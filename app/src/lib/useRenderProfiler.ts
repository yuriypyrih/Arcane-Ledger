import { useEffect, useRef } from "react";

const renderProfilerStorageKey = "arcane-ledger:render-profiler";
const renderProfilerSearchParam = "renderProfiler";

type RenderProfilerDetails = Record<string, unknown>;

function roundTiming(value: number): number {
  return Math.round(value * 10) / 10;
}

function isRenderProfilerEnabled(): boolean {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(renderProfilerStorageKey) === "1" ||
      new URLSearchParams(window.location.search).has(renderProfilerSearchParam)
    );
  } catch {
    return false;
  }
}

export function useRenderProfiler(label: string, details?: RenderProfilerDetails): void {
  const renderCountRef = useRef(0);
  const lastRenderAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRenderProfilerEnabled()) {
      return;
    }

    const now = window.performance.now();
    const previousRenderAt = lastRenderAtRef.current;
    renderCountRef.current += 1;
    lastRenderAtRef.current = now;

    console.debug(`[Arcane Ledger render] ${label}`, {
      count: renderCountRef.current,
      sinceLastMs: previousRenderAt === null ? null : roundTiming(now - previousRenderAt),
      ...details
    });
  });
}
