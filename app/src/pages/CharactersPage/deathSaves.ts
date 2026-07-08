import { CLASS_FEATURE, FEATS, type SpellDescriptionEntry } from "../../codex/entries";
import type { Character } from "../../types";
import {
  createFeatureSourcedDescriptionEntries,
  createSourcedDescriptionEntries
} from "./actionModalDescriptions";
import type { FeatureIndicator } from "./classFeatures";
import {
  getFighterChampionSurvivorDefyDeathDescription,
  hasFighterChampionSurvivorFeature
} from "./classFeatures/fighter/subclasses/fighterChampion";
import { hasFeatForCharacter } from "./feats/runtime";
import {
  getRebornDeathSaveDescriptionAdditionsForCharacter,
  hasRebornDeathSaveAdvantageForCharacter
} from "./speciesReborn";

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
  return getDeathSaveAdvantageSourcesForCharacter(character).length > 0;
}

export function getDeathSaveAdvantageSourcesForCharacter(character: Character): string[] {
  return [
    ...(hasFeatForCharacter(character, FEATS.DURABLE) ? ["Durable"] : []),
    ...(hasFighterChampionSurvivorFeature(character) ? ["Defy Death"] : []),
    ...(hasRebornDeathSaveAdvantageForCharacter(character) ? ["Escaped Death"] : [])
  ];
}

export function getDeathSaveNaturalTwentyBenefitMinimumForCharacter(
  character: Character
): number | null {
  return hasFighterChampionSurvivorFeature(character) ? 18 : null;
}

export function getDeathSaveRollIndicatorsForCharacter(character: Character): FeatureIndicator[] {
  const advantageSources = getDeathSaveAdvantageSourcesForCharacter(character);

  return advantageSources.length > 0
    ? [
        {
          label: "Advantage",
          tone: "advantage",
          source: advantageSources
        }
      ]
    : [];
}

export function getDeathSaveDescriptionAdditionsForCharacter(
  character: Character
): SpellDescriptionEntry[][] {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];

  if (hasFeatForCharacter(character, FEATS.DURABLE)) {
    descriptionAdditions.push(
      createSourcedDescriptionEntries("Durable: Defy Death", [
        "You have Advantage on Death Saving Throws."
      ])
    );
  }

  const championDefyDeathDescription = getFighterChampionSurvivorDefyDeathDescription(character);

  if (championDefyDeathDescription.length > 0) {
    descriptionAdditions.push(
      createFeatureSourcedDescriptionEntries(
        character,
        CLASS_FEATURE.SURVIVOR,
        championDefyDeathDescription
      )
    );
  }

  descriptionAdditions.push(...getRebornDeathSaveDescriptionAdditionsForCharacter(character));

  return descriptionAdditions;
}
