import type { Character } from "../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../statusEntries";
import type { FeatureActionCard } from "../types";

type TelepathicBondCharacter = Partial<Pick<Character, "level" | "statusEntries">>;

type TelepathicBondActionConfig = {
  actionKey: string;
  name: string;
  sourceId: string;
  eyebrow: string;
  description?: FeatureActionCard["description"];
};

type ActivateTelepathicBondConfig = Pick<TelepathicBondActionConfig, "name" | "sourceId"> & {
  source: string;
  durationMinutes: number;
};

export function getTelepathicBondDurationMinutes(level: number | undefined): number {
  return Math.max(1, Math.min(20, Math.floor(level ?? 0)));
}

export function hasActiveTelepathicBond(
  character: TelepathicBondCharacter,
  config: Pick<TelepathicBondActionConfig, "name" | "sourceId">
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.value === config.name &&
      entry.sourceId === config.sourceId
  );
}

export function createTelepathicBondFeatureAction(
  character: TelepathicBondCharacter,
  config: TelepathicBondActionConfig
): FeatureActionCard {
  const durationMinutes = getTelepathicBondDurationMinutes(character.level);
  const durationLabel = `${durationMinutes} minute${durationMinutes === 1 ? "" : "s"}`;

  return {
    key: config.actionKey,
    name: config.name,
    summary: "Form a telepathic connection with a creature you can see.",
    detail: `Create a telepathic connection for ${durationLabel}.`,
    breakdown: "Telepathic link",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    description: config.description,
    drawer: {
      kind: "confirm",
      eyebrow: config.eyebrow,
      description: config.description
    },
    execute: {
      kind: "activate"
    },
    isActive: hasActiveTelepathicBond(character, config)
  };
}

export function activateTelepathicBond(
  character: Character,
  config: ActivateTelepathicBondConfig
): Character {
  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== config.sourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: config.name,
        source: config.source,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: config.durationMinutes
        },
        sourceId: config.sourceId
      })
    ]
  };
}
