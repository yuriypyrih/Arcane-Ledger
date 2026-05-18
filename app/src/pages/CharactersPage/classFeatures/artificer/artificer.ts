import type { Character, CharacterArtificerFeatureState } from "../../../../types";
import type { SpellSourceMap } from "../types";

const mendingSpellId = "spell-mending";
const tinkersMagicSource = "Tinker's Magic";

type ArtificerRuntimeCharacter = Pick<Character, "className"> & Partial<Pick<Character, "level">>;

export function normalizeArtificerFeatureState(): CharacterArtificerFeatureState {
  return {};
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

function hasArtificerTinkersMagicFeature(character: ArtificerRuntimeCharacter): boolean {
  return character.className === "Artificer" && (character.level ?? 0) >= 1;
}
