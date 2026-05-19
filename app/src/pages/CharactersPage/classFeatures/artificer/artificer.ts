import type { Character, CharacterArtificerFeatureState } from "../../../../types";
import type { SpellSourceMap } from "../types";
import {
  hasArtificerTinkersMagicFeature,
  normalizeArtificerTinkersMagicState,
  restoreArtificerTinkersMagicOnLongRest
} from "./tinkersMagic";

export {
  addArtificerTinkersMagicItemToInventory,
  artificerTinkersMagicActionKey,
  consumeArtificerTinkersMagicUse,
  getArtificerFeatureActionOptions,
  getArtificerFeatureActions,
  getArtificerTinkersMagicItemOptionByKey,
  getArtificerTinkersMagicUsesRemaining,
  getArtificerTinkersMagicUsesTotal,
  restoreArtificerTinkersMagicOnLongRest
} from "./tinkersMagic";

const mendingSpellId = "spell-mending";
const tinkersMagicSource = "Tinker's Magic";

type ArtificerRuntimeCharacter = Pick<Character, "className"> & Partial<Pick<Character, "level">>;

export function normalizeArtificerFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "statusEntries">>
): CharacterArtificerFeatureState {
  return normalizeArtificerTinkersMagicState(value, character);
}

export function getArtificerAlwaysPreparedSpellIds(
  character: ArtificerRuntimeCharacter
): string[] {
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

export function applyLongRestToArtificerFeatures(character: Character): Character {
  return restoreArtificerTinkersMagicOnLongRest(character);
}
