import type { Character } from "../../types";
import { getEffectiveHitPointMaximumForCharacter } from "./traits";

export type BloodiedCharacterContext = Partial<
  Pick<
    Character,
    | "className"
    | "currentHitPoints"
    | "customSpecies"
    | "feats"
    | "hitPoints"
    | "inventoryItems"
    | "level"
    | "species"
    | "statusEntries"
    | "subclassId"
  >
>;

export function isCharacterBloodied(character: BloodiedCharacterContext): boolean {
  if (
    typeof character.className !== "string" ||
    typeof character.currentHitPoints !== "number" ||
    typeof character.hitPoints !== "number" ||
    character.currentHitPoints <= 0
  ) {
    return false;
  }

  const effectiveHitPointMaximum = getEffectiveHitPointMaximumForCharacter({
    className: character.className,
    customSpecies: character.customSpecies,
    feats: character.feats,
    hitPoints: character.hitPoints,
    inventoryItems: character.inventoryItems,
    level: character.level,
    species: character.species,
    statusEntries: character.statusEntries ?? [],
    subclassId: character.subclassId
  });

  return character.currentHitPoints <= effectiveHitPointMaximum * 0.5;
}
