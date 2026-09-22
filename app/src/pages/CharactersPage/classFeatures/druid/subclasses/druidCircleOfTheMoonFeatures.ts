import { hasCharacterClass, getClassLevel, getClassSubclassId } from "../../../multiclass";
import type { Character } from "../../../../../types";

type DruidCircleOfTheMoonCharacter = Partial<Pick<Character, "className" | "level" | "subclassId">>;

export const circleOfTheMoonSubclassId = "druid-circle-of-the-moon";

function getNormalizedDruidLevel(level: number | undefined): number {
  return Math.max(1, Math.min(20, Math.floor(level ?? 1)));
}

export function hasDruidCircleOfTheMoonSpellsFeature(
  character: DruidCircleOfTheMoonCharacter
): boolean {
  return (
    hasCharacterClass(character, "Druid") &&
    getClassSubclassId(character, "Druid") === circleOfTheMoonSubclassId &&
    getNormalizedDruidLevel(getClassLevel(character, "Druid")) >= 3
  );
}

export function hasDruidCircleFormsFeature(character: DruidCircleOfTheMoonCharacter): boolean {
  return (
    hasCharacterClass(character, "Druid") &&
    getClassSubclassId(character, "Druid") === circleOfTheMoonSubclassId &&
    getNormalizedDruidLevel(getClassLevel(character, "Druid")) >= 3
  );
}

export function hasDruidImprovedCircleFormsFeature(
  character: DruidCircleOfTheMoonCharacter
): boolean {
  return (
    hasCharacterClass(character, "Druid") &&
    getClassSubclassId(character, "Druid") === circleOfTheMoonSubclassId &&
    getNormalizedDruidLevel(getClassLevel(character, "Druid")) >= 6
  );
}

export function hasDruidMoonlightStepFeature(character: DruidCircleOfTheMoonCharacter): boolean {
  return (
    hasCharacterClass(character, "Druid") &&
    getClassSubclassId(character, "Druid") === circleOfTheMoonSubclassId &&
    getNormalizedDruidLevel(getClassLevel(character, "Druid")) >= 10
  );
}

export function hasDruidLunarFormFeature(character: DruidCircleOfTheMoonCharacter): boolean {
  return (
    hasCharacterClass(character, "Druid") &&
    getClassSubclassId(character, "Druid") === circleOfTheMoonSubclassId &&
    getNormalizedDruidLevel(getClassLevel(character, "Druid")) >= 14
  );
}
