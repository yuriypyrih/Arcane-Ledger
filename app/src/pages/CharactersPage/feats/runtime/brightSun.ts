import { FEATS, type SpellDescriptionEntry } from "../../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusEntry
} from "../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import type { FeatureActionCard } from "../../classFeatures/types";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../statusEntries";
import { getFeatDefinition } from "..";
import { normalizeCharacterFeats } from "../normalization";
import {
  boonOfBrightSunDaylightPresenceActionKey,
  boonOfBrightSunDaylightPresenceStatusSourceId
} from "./constants";
import {
  filterDescriptionEntries,
  isBoonOfBrightSunDaylightPresenceDescriptionEntry
} from "./descriptionMatchers";
import type { FeatRuntimeCharacter } from "./types";

export const boonOfBrightSunName = "Boon of the Bright Sun";
export const boonOfBrightSunDaylightPresenceName = "Daylight Presence";
export const boonOfBrightSunDaylightPresenceTemporaryHitPoints = 10;
export const boonOfBrightSunDaylightPresenceTemporaryHitPointsSource =
  boonOfBrightSunDaylightPresenceName;

export function getBoonOfBrightSunDaylightPresenceDescription(
  description: SpellDescriptionEntry[]
): SpellDescriptionEntry[] {
  return filterDescriptionEntries(
    description,
    isBoonOfBrightSunDaylightPresenceDescriptionEntry
  );
}

function hasBoonOfBrightSunForCharacter(character: FeatRuntimeCharacter): boolean {
  return normalizeCharacterFeats(character.feats, character.level ?? 1).some(
    (entry) => entry.feat === FEATS.BOON_OF_BRIGHT_SUN
  );
}

export function hasActiveBoonOfBrightSunDaylightPresenceStatus(
  statusEntries: Character["statusEntries"]
): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceId === boonOfBrightSunDaylightPresenceStatusSourceId &&
      entry.disabled !== true
  );
}

function clearBoonOfBrightSunDaylightPresenceStatuses(
  statusEntries: Character["statusEntries"]
): CharacterStatusEntry[] {
  return normalizeCharacterStatusEntries(statusEntries).filter(
    (entry) => entry.sourceId !== boonOfBrightSunDaylightPresenceStatusSourceId
  );
}

function getDefaultBoonOfBrightSunDaylightPresenceDescription(): SpellDescriptionEntry[] {
  return getBoonOfBrightSunDaylightPresenceDescription(
    getFeatDefinition(FEATS.BOON_OF_BRIGHT_SUN)?.description ?? []
  );
}

function createBoonOfBrightSunDaylightPresenceStatusEntry(
  description: SpellDescriptionEntry[] = getDefaultBoonOfBrightSunDaylightPresenceDescription()
): CharacterStatusEntry {
  return createCharacterStatusEntry({
    group: STATUS_ENTRY_GROUP.EFFECTS,
    value: boonOfBrightSunDaylightPresenceName,
    source: boonOfBrightSunName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
    duration: {
      kind: STATUS_DURATION_KIND.INFINITE
    },
    sourceId: boonOfBrightSunDaylightPresenceStatusSourceId,
    rangeFeet: 30,
    description: description
      .filter((entry): entry is string => typeof entry === "string")
      .join("\n")
  });
}

export function createBoonOfBrightSunDaylightPresenceAction(
  character: FeatRuntimeCharacter,
  description: SpellDescriptionEntry[]
): FeatureActionCard {
  const isActive = hasActiveBoonOfBrightSunDaylightPresenceStatus(character.statusEntries);
  const disabledReason = isActive ? "Daylight Presence is already active." : undefined;

  return {
    key: boonOfBrightSunDaylightPresenceActionKey,
    name: boonOfBrightSunDaylightPresenceName,
    actionSource: {
      type: "feat",
      name: boonOfBrightSunName
    },
    summary: "",
    detail: "Create a Daylight Presence trait in Traits & Conditions.",
    breakdown: isActive ? "Sunlight aura active" : "Create sunlight aura",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    isActive,
    disabled: isActive,
    disabledReason,
    description,
    drawer: {
      kind: "confirm",
      description,
      blockedReason: disabledReason
    },
    execute: {
      kind: "activate"
    }
  };
}

export function activateBoonOfBrightSunDaylightPresenceForCharacter(
  character: Character,
  actionKey: string
): Character {
  if (
    actionKey !== boonOfBrightSunDaylightPresenceActionKey ||
    !hasBoonOfBrightSunForCharacter(character) ||
    hasActiveBoonOfBrightSunDaylightPresenceStatus(character.statusEntries)
  ) {
    return character;
  }

  return {
    ...character,
    statusEntries: [
      ...clearBoonOfBrightSunDaylightPresenceStatuses(character.statusEntries),
      createBoonOfBrightSunDaylightPresenceStatusEntry()
    ]
  };
}
