export const ENABLE_RENDER_PROFILER_BY_DEFAULT_IN_DEV = false;

export type RenderProfilerDetails = Record<string, unknown>;

export function roundTiming(value: number): number {
  return Math.round(value * 10) / 10;
}

export function isRenderProfilerEnabled(): boolean {
  return import.meta.env.DEV && ENABLE_RENDER_PROFILER_BY_DEFAULT_IN_DEV;
}
