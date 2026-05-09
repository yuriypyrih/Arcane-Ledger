import { FEATS, type SpellDescriptionEntry } from "../../codex/entries";
import type { Character } from "../../types";
import { createSourcedDescriptionEntries } from "./actionModalDescriptions";
import { hasFeatForCharacter } from "./feats/runtime";

type DeathSaveTrackState = {
  successes: number;
  failures: number;
};

export const deathSaveDescription: SpellDescriptionEntry[] = [
  "When you start your turn with 0 Hit Points, make a Death Saving Throw. A result of 10 or higher marks one success; a result below 10 marks one failure.",
  "Track successes and failures until either track reaches three. Three successes stabilize you; three failures mean you die."
];

export function getDeathSaveStatusLabel(
  currentHitPoints: number,
  maxHitPoints: number,
  deathSaves: DeathSaveTrackState
): string {
  if (currentHitPoints <= 0) {
    if (deathSaves.failures >= 3) {
      return "Dead";
    }

    if (deathSaves.successes >= 3) {
      return "Stable";
    }

    return "Unconscious";
  }

  return currentHitPoints > maxHitPoints * 0.5 ? "Healthy" : "Blooded";
}

export function hasDeathSaveAdvantageForCharacter(character: Character): boolean {
  return hasFeatForCharacter(character, FEATS.DURABLE);
}

export function getDeathSaveDescriptionAdditionsForCharacter(
  character: Character
): SpellDescriptionEntry[][] {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];

  if (hasDeathSaveAdvantageForCharacter(character)) {
    descriptionAdditions.push(
      createSourcedDescriptionEntries("Durable: Defy Death", [
        "You have Advantage on Death Saving Throws."
      ])
    );
  }

  return descriptionAdditions;
}
