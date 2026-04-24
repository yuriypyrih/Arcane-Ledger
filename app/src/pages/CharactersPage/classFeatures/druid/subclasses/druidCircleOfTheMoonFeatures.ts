import type { Character } from "../../../../../types";

type DruidCircleOfTheMoonCharacter = Partial<
  Pick<Character, "className" | "level" | "subclassId">
>;

export const circleOfTheMoonSubclassId = "druid-circle-of-the-moon";

function getNormalizedDruidLevel(level: number | undefined): number {
  return Math.max(1, Math.min(20, Math.floor(level ?? 1)));
}

export function hasDruidCircleOfTheMoonSpellsFeature(
  character: DruidCircleOfTheMoonCharacter
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheMoonSubclassId &&
    getNormalizedDruidLevel(character.level) >= 3
  );
}

export function hasDruidCircleFormsFeature(character: DruidCircleOfTheMoonCharacter): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheMoonSubclassId &&
    getNormalizedDruidLevel(character.level) >= 3
  );
}

export function hasDruidImprovedCircleFormsFeature(
  character: DruidCircleOfTheMoonCharacter
): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheMoonSubclassId &&
    getNormalizedDruidLevel(character.level) >= 6
  );
}

export function hasDruidMoonlightStepFeature(character: DruidCircleOfTheMoonCharacter): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheMoonSubclassId &&
    getNormalizedDruidLevel(character.level) >= 10
  );
}

export function hasDruidLunarFormFeature(character: DruidCircleOfTheMoonCharacter): boolean {
  return (
    character.className === "Druid" &&
    character.subclassId === circleOfTheMoonSubclassId &&
    getNormalizedDruidLevel(character.level) >= 14
  );
}
