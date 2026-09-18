// Initialize the public rules barrel before leaf imports: Vite SSR export-star
// evaluation otherwise observes partial exports in the existing cyclic rules graph.
import "../src/pages/CharactersPage/feats/runtime";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// Only external observability is replaced; rules, Redux, and persistence stay real.
vi.mock("../src/lib/sentry", () => ({ captureAppError: vi.fn() }));
vi.mock("../src/lib/analytics", () => ({ trackAnalyticsEvent: vi.fn() }));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new Error("Unexpected network request in a unit/component test")))
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  );
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
