export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536
} as const;

const maxWidthBelow = (breakpoint: number) => `${breakpoint - 1}px`;

// Default layout should remain desktop-first. Prefer xsOnly for phone overrides;
// use intermediate breakpoints only when a component truly needs that step.
export const MEDIA_QUERIES = {
  xsOnly: `(max-width: ${maxWidthBelow(BREAKPOINTS.sm)})`,
  mdDown: `(max-width: ${maxWidthBelow(BREAKPOINTS.md)})`,
  lgDown: `(max-width: ${maxWidthBelow(BREAKPOINTS.lg)})`,
  xlUp: `(min-width: ${BREAKPOINTS.xl}px)`
} as const;
