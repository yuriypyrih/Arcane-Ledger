import {
  CLASS_FEATURE,
  REACTION,
  type ReactionEntry,
  type SpellDescriptionEntry
} from "../../../../codex/entries";
import type { Character, CharacterArtificerFeatureState } from "../../../../types";
import { getAbilityModifierForCharacter } from "../../abilities";
import { getInventoryAttunementCount } from "../../inventoryItems";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";
import {
  getArtificerCartographerIngeniousMovementFlashOfGeniusDescriptionAdditions
} from "./subclasses/artificerCartographer";

export const artificerFlashOfGeniusReactionEntryId = "reaction-artificer-flash-of-genius";

type ArtificerFlashOfGeniusCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      "abilities" | "classFeatureState" | "inventoryItems" | "level" | "statusEntries"
    >
  >;

function normalizeUsesExpended(value: unknown, total: number): number {
  const parsedValue = Number(value);
  const normalizedValue = Number.isFinite(parsedValue) ? Math.floor(parsedValue) : 0;

  return Math.max(0, Math.min(total, normalizedValue));
}

export function hasArtificerFlashOfGeniusFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): boolean {
  return character.className === "Artificer" && (character.level ?? 0) >= 7;
}

export function hasArtificerFlashOfGeniusShortRestRecoveryFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level">>
): boolean {
  return character.className === "Artificer" && (character.level ?? 0) >= 14;
}

export function hasArtificerFlashOfGeniusFullShortRestRecovery(
  character: Pick<Character, "className"> & Partial<Pick<Character, "inventoryItems" | "level">>
): boolean {
  return (
    character.className === "Artificer" &&
    (character.level ?? 0) >= 20 &&
    getInventoryAttunementCount(character.inventoryItems ?? []) > 0
  );
}

export function getArtificerFlashOfGeniusUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "statusEntries">>
): number {
  const intelligenceModifier = getAbilityModifierForCharacter(
    {
      abilities: character.abilities,
      statusEntries: character.statusEntries
    },
    "INT"
  );

  return hasArtificerFlashOfGeniusFeature(character) ? Math.max(1, intelligenceModifier) : 0;
}

export function normalizeArtificerFlashOfGeniusState(
  value: unknown,
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "statusEntries">>
): Pick<CharacterArtificerFeatureState, "flashOfGeniusUsesExpended"> {
  if (!hasArtificerFlashOfGeniusFeature(character)) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterArtificerFeatureState>) : {};
  const usesTotal = getArtificerFlashOfGeniusUsesTotal(character);

  return {
    flashOfGeniusUsesExpended: normalizeUsesExpended(record.flashOfGeniusUsesExpended, usesTotal)
  };
}

export function getArtificerFlashOfGeniusUsesRemaining(
  character: ArtificerFlashOfGeniusCharacter
): number {
  const usesTotal = getArtificerFlashOfGeniusUsesTotal(character);

  if (usesTotal <= 0) {
    return 0;
  }

  const usesExpended = normalizeUsesExpended(
    character.classFeatureState?.artificer?.flashOfGeniusUsesExpended,
    usesTotal
  );

  return Math.max(0, usesTotal - usesExpended);
}

function getArtificerFlashOfGeniusDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  return getFeatureDescriptionForCharacter(
    {
      className: character.className,
      level: character.level ?? 0,
      subclassId: character.subclassId
    },
    CLASS_FEATURE.FLASH_OF_GENIUS
  );
}

function getArtificerFlashOfGeniusReactionEntry(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry {
  const descriptionAdditions =
    getArtificerCartographerIngeniousMovementFlashOfGeniusDescriptionAdditions(character);

  return {
    id: artificerFlashOfGeniusReactionEntryId,
    reaction: REACTION.FLASH_OF_GENIUS,
    name: "Flash of Genius",
    sourceType: "feature",
    sourceFeature: CLASS_FEATURE.FLASH_OF_GENIUS,
    sourceLabel: "Artificer",
    description: getArtificerFlashOfGeniusDescription(character),
    descriptionAdditions: descriptionAdditions.length > 0 ? descriptionAdditions : undefined
  };
}

export function getArtificerFlashOfGeniusReactionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): ReactionEntry[] {
  return hasArtificerFlashOfGeniusFeature(character)
    ? [getArtificerFlashOfGeniusReactionEntry(character)]
    : [];
}

export function consumeArtificerFlashOfGeniusUse(character: Character): Character {
  const usesTotal = getArtificerFlashOfGeniusUsesTotal(character);
  const usesRemaining = getArtificerFlashOfGeniusUsesRemaining(character);

  if (usesTotal <= 0 || usesRemaining <= 0) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};
  const flashOfGeniusState = normalizeArtificerFlashOfGeniusState(currentArtificerState, character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...flashOfGeniusState,
        flashOfGeniusUsesExpended: (flashOfGeniusState.flashOfGeniusUsesExpended ?? 0) + 1
      }
    }
  };
}

export function restoreArtificerFlashOfGeniusOnLongRest(character: Character): Character {
  if (!hasArtificerFlashOfGeniusFeature(character)) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};
  const flashOfGeniusState = normalizeArtificerFlashOfGeniusState(currentArtificerState, character);

  if ((flashOfGeniusState.flashOfGeniusUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...flashOfGeniusState,
        flashOfGeniusUsesExpended: 0
      }
    }
  };
}

export function restoreArtificerFlashOfGeniusOnShortRest(character: Character): Character {
  if (!hasArtificerFlashOfGeniusShortRestRecoveryFeature(character)) {
    return character;
  }

  const currentArtificerState = character.classFeatureState?.artificer ?? {};
  const flashOfGeniusState = normalizeArtificerFlashOfGeniusState(currentArtificerState, character);
  const usesExpended = flashOfGeniusState.flashOfGeniusUsesExpended ?? 0;

  if (usesExpended <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      artificer: {
        ...currentArtificerState,
        ...flashOfGeniusState,
        flashOfGeniusUsesExpended: hasArtificerFlashOfGeniusFullShortRestRecovery(character)
          ? 0
          : Math.max(0, usesExpended - 1)
      }
    }
  };
}
