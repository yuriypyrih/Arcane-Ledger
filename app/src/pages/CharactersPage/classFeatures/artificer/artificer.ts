import type { Character, CharacterArtificerFeatureState } from "../../../../types";
import type { FeatureActionCard, SpellSourceMap } from "../types";
import {
  getArtificerTinkersMagicAction,
  hasArtificerTinkersMagicFeature,
  normalizeArtificerTinkersMagicState,
  restoreArtificerTinkersMagicOnLongRest
} from "./tinkersMagic";
import {
  getArtificerReplicateMagicItemAction,
  normalizeArtificerReplicateMagicItemPlanState
} from "./replicateMagicItem";

export {
  addArtificerTinkersMagicItemToInventory,
  artificerTinkersMagicActionKey,
  consumeArtificerTinkersMagicUse,
  getArtificerFeatureActionOptions,
  getArtificerTinkersMagicUsesRemaining,
  getArtificerTinkersMagicUsesTotal,
  restoreArtificerTinkersMagicOnLongRest
} from "./tinkersMagic";

export {
  addArtificerReplicateMagicItemToInventory,
  artificerReplicateMagicItemActionKey,
  getArtificerReplicateMagicItemCount,
  getArtificerReplicateMagicItemLimit,
  getArtificerReplicateMagicItemPlansKnown,
  getArtificerReplicateMagicItemAvailablePlanGroups,
  getArtificerReplicateMagicItemPlanKeysForCharacter,
  isArtificerReplicateMagicItemPlanSelectionInputRequired,
  setArtificerReplicateMagicItemPlanKeysForCharacter
} from "./replicateMagicItem";

const mendingSpellId = "spell-mending";
const tinkersMagicSource = "Tinker's Magic";

type ArtificerRuntimeCharacter = Pick<Character, "className"> & Partial<Pick<Character, "level">>;

export function normalizeArtificerFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "statusEntries">>
): CharacterArtificerFeatureState {
  return {
    ...normalizeArtificerTinkersMagicState(value, character),
    ...normalizeArtificerReplicateMagicItemPlanState(value, character)
  };
}

export function getArtificerAlwaysPreparedSpellIds(character: ArtificerRuntimeCharacter): string[] {
  return hasArtificerTinkersMagicFeature(character) ? [mendingSpellId] : [];
}

export function getArtificerAlwaysPreparedSpellSourceMap(
  character: ArtificerRuntimeCharacter
): SpellSourceMap {
  return hasArtificerTinkersMagicFeature(character)
    ? {
        [mendingSpellId]: [tinkersMagicSource]
      }
    : {};
}

export function getArtificerFeatureActions(
  character: Pick<Character, "className"> &
    Partial<
      Pick<
        Character,
        "abilities" | "classFeatureState" | "inventoryItems" | "level" | "statusEntries"
      >
    >
): FeatureActionCard[] {
  return [
    getArtificerTinkersMagicAction(character),
    getArtificerReplicateMagicItemAction(character)
  ].filter((action): action is FeatureActionCard => Boolean(action));
}

export function applyLongRestToArtificerFeatures(character: Character): Character {
  return restoreArtificerTinkersMagicOnLongRest(character);
}
