import { useEffect, useRef } from "react";
import { isRenderProfilerEnabled, roundTiming, type RenderProfilerDetails } from "./renderProfiler";

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
