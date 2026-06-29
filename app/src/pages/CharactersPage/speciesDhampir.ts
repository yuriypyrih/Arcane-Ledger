import { getSpeciesEntryByName } from "../../codex/entries";
import type { Character } from "../../types";
import type { FeatureSpeedBonus } from "./classFeatures/types";

const dhampirSpeciesId = "species-dhampir-rhw";

export function isDhampirSpecies(species: string): boolean {
  return getSpeciesEntryByName(species.trim())?.id === dhampirSpeciesId;
}

export function getDhampirSpeedBonusesForCharacter(
  character: Pick<Character, "species">
): FeatureSpeedBonus[] {
  if (!isDhampirSpecies(character.species)) {
    return [];
  }

  return [
    {
      label: "Spider Climb",
      value: 0,
      movementType: "climb",
      setBaseFromWalkMultiplier: 1
    }
  ];
}
