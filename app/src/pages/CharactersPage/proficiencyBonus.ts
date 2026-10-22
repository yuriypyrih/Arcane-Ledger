import { getCharacterLevel } from "./multiclassState";
import { getStatOverride } from "./statOverrides";

/** Number inputs describe a progression table; character inputs include manual overrides. */
export function getProficiencyBonus(characterOrLevel: object | number): number {
  if (typeof characterOrLevel !== "number") {
    const override = getStatOverride(characterOrLevel, "proficiencyBonus");
    if (override !== null) return override;
  }
  const level =
    typeof characterOrLevel === "number" ? characterOrLevel : getCharacterLevel(characterOrLevel);
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}
