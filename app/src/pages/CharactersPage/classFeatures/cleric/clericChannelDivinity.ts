import { CLASS_FEATURE } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  getClericFeatureRow,
  hasClericFeature,
  normalizeClericBaseFeatureState
} from "./clericFeatureState";

export function getClericChannelDivinityUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasClericFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return 0;
  }

  return getClericFeatureRow(character.level)?.channelDivinity ?? 0;
}

export function getClericChannelDivinityUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getClericChannelDivinityUsesTotal(character);
  const clericState = normalizeClericBaseFeatureState(character.classFeatureState?.cleric, character);
  const usesExpended = clericState.channelDivinityUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function expendClericChannelDivinityUse(character: Character): Character {
  if (!hasClericFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return character;
  }

  const clericState = normalizeClericBaseFeatureState(character.classFeatureState?.cleric, character);
  const totalUses = getClericChannelDivinityUsesTotal(character);
  const usesExpended = clericState.channelDivinityUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        channelDivinityUsesExpended: usesExpended + 1
      }
    }
  };
}

export function restoreClericChannelDivinityOnShortRest(character: Character): Character {
  if (!hasClericFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return character;
  }

  const clericState = normalizeClericBaseFeatureState(character.classFeatureState?.cleric, character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        blessedStrikeUsedThisTurn: false,
        channelDivinityUsesExpended: Math.max(0, (clericState.channelDivinityUsesExpended ?? 0) - 1)
      }
    }
  };
}

export function restoreClericChannelDivinityOnLongRest(character: Character): Character {
  if (!hasClericFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return character;
  }

  const clericState = normalizeClericBaseFeatureState(character.classFeatureState?.cleric, character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      cleric: {
        ...clericState,
        blessedStrikeUsedThisTurn: false,
        channelDivinityUsesExpended: 0
      }
    }
  };
}
