import { CLASS_FEATURE } from "../../../../codex/entries";
import { paladinFeatures } from "../../../../codex/classes";
import type { Character } from "../../../../types";
import { CONDITION_NAME } from "../../../../types";
import { hasStatusCondition } from "../../statusEntries";

export function getPaladinFeatureRow(level: number) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = paladinFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;
}

function getUnlockedPaladinFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return paladinFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

export function hasPaladinFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Paladin") {
    return false;
  }

  return getUnlockedPaladinFeatures(character.level).has(feature);
}

export function getPaladinChannelDivinityUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasPaladinFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return 0;
  }

  return getPaladinFeatureRow(character.level)?.channelDivinity ?? 0;
}

export function getPaladinChannelDivinityUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getPaladinChannelDivinityUsesTotal(character);
  const rawUsesExpended = Number(
    character.classFeatureState?.paladin?.channelDivinityUsesExpended ?? 0
  );
  const usesExpended = Number.isFinite(rawUsesExpended)
    ? Math.max(0, Math.min(totalUses, Math.floor(rawUsesExpended)))
    : 0;

  return Math.max(0, totalUses - usesExpended);
}

export function expendPaladinChannelDivinityUse(character: Character): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return character;
  }

  const totalUses = getPaladinChannelDivinityUsesTotal(character);
  const rawUsesExpended = Number(
    character.classFeatureState?.paladin?.channelDivinityUsesExpended ?? 0
  );
  const usesExpended = Number.isFinite(rawUsesExpended)
    ? Math.max(0, Math.min(totalUses, Math.floor(rawUsesExpended)))
    : 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...character.classFeatureState?.paladin,
        channelDivinityUsesExpended: usesExpended + 1
      }
    }
  };
}

export function hasActivePaladinAuraOfProtection(
  character: Pick<Character, "className" | "level" | "statusEntries">
): boolean {
  return (
    hasPaladinFeature(character, CLASS_FEATURE.AURA_OF_PROTECTION) &&
    !hasStatusCondition(character.statusEntries, CONDITION_NAME.INCAPACITATED)
  );
}
