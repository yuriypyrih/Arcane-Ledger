import { FEATS, type SpellDescriptionEntry } from "../../codex/entries";
import type { Character } from "../../types";
import { createSourcedDescriptionEntries } from "./actionModalDescriptions";
import { hasFeatForCharacter } from "./feats/runtime";

export type DeathSaveTrackState = {
  successes: number;
  failures: number;
  resolution?: "instant-death";
};

export const deathSaveDescription: SpellDescriptionEntry[] = [
  "When you start your turn with 0 Hit Points, make a Death Saving Throw. A result of 10 or higher marks one success; a result below 10 marks one failure.",
  "Track successes and failures until either track reaches three. Three successes stabilize you; three failures mean you die."
];

function normalizeDeathSaveCount(value: unknown): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.floor(Math.max(0, Math.min(3, parsedValue)));
}

export function createDefaultDeathSaveTrack(): DeathSaveTrackState {
  return {
    successes: 0,
    failures: 0
  };
}

export function normalizeDeathSaveTrack(value: unknown): DeathSaveTrackState {
  if (!value || typeof value !== "object") {
    return createDefaultDeathSaveTrack();
  }

  const record = value as Partial<DeathSaveTrackState>;
  const successes = normalizeDeathSaveCount(record.successes);
  const failures = normalizeDeathSaveCount(record.failures);

  return {
    successes,
    failures,
    ...(record.resolution === "instant-death" && failures >= 3
      ? { resolution: "instant-death" as const }
      : {})
  };
}

export function isDeathSaveTrackResolved(deathSaves: DeathSaveTrackState): boolean {
  return (
    deathSaves.resolution === "instant-death" ||
    deathSaves.successes >= 3 ||
    deathSaves.failures >= 3
  );
}

export function getDeathSaveStatusLabel(
  currentHitPoints: number,
  maxHitPoints: number,
  deathSaves: DeathSaveTrackState
): string {
  if (currentHitPoints <= 0) {
    if (deathSaves.resolution === "instant-death") {
      return "Instant Death";
    }

    if (deathSaves.failures >= 3) {
      return "Dead";
    }

    if (deathSaves.successes >= 3) {
      return "Stable";
    }

    return "Unconscious";
  }

  return currentHitPoints > maxHitPoints * 0.5 ? "Healthy" : "Bloodied";
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
