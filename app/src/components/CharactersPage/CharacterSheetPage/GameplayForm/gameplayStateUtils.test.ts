import { describe, expect, it } from "vitest";
import { swapTemporaryHitPoints } from "./gameplayStateUtils";

describe("swapTemporaryHitPoints", () => {
  it("uses the granted value when it is higher than the current value", () => {
    expect(swapTemporaryHitPoints(0, 10)).toBe(10);
    expect(swapTemporaryHitPoints(7, 20)).toBe(20);
  });

  it("keeps the current value when the granted value is lower", () => {
    expect(swapTemporaryHitPoints(5, 4)).toBe(5);
  });

  it("normalizes both values before comparing them", () => {
    expect(swapTemporaryHitPoints(-3, "12")).toBe(12);
    expect(swapTemporaryHitPoints(18.9, 18.2)).toBe(18);
  });
});
