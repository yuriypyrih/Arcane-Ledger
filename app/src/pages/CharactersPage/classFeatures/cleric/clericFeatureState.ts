import { getProgressionRow } from "../../../../codex/progression";
import { getUnlockedProgressionFeatures } from "../../../../codex/progression";
import { hasCharacterClass, getClassLevel } from "../../multiclassState";
import { clericFeatures, type ClericFeatureClassObj } from "../../../../codex/classes/cleric";
import { CLASS_FEATURE } from "../../../../codex/entries/enums";
import type { Character, CharacterClericFeatureState } from "../../../../types";

export function getClericFeatureRow(level: number): ClericFeatureClassObj | null {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return getProgressionRow(clericFeatures, normalizedLevel);
}

function getUnlockedClericFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return getUnlockedProgressionFeatures(clericFeatures, normalizedLevel);
}

export function hasClericFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (!hasCharacterClass(character, "Cleric")) {
    return false;
  }

  return getUnlockedClericFeatures(getClassLevel(character, "Cleric")).has(feature);
}

export function normalizeClericBaseFeatureState(
  value: unknown,
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "savingThrowProficiencies">>
): CharacterClericFeatureState {
  const normalizedCharacter = {
    ...character,
    level: getClassLevel(character, "Cleric") ?? 1
  };
  const hasDivineOrder = hasClericFeature(normalizedCharacter, CLASS_FEATURE.DIVINE_ORDER);
  const hasBlessedStrikes = hasClericFeature(normalizedCharacter, CLASS_FEATURE.BLESSED_STRIKES);
  const hasChannelDivinity = hasClericFeature(normalizedCharacter, CLASS_FEATURE.CHANNEL_DIVINITY);
  const hasDivineIntervention = hasClericFeature(
    normalizedCharacter,
    CLASS_FEATURE.DIVINE_INTERVENTION
  );

  if (!hasDivineOrder && !hasBlessedStrikes && !hasChannelDivinity && !hasDivineIntervention) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterClericFeatureState>) : {};
  const channelDivinityTotal = hasChannelDivinity
    ? (getClericFeatureRow(getClassLevel(normalizedCharacter, "Cleric"))?.channelDivinity ?? 0)
    : 0;

  return {
    divineOrderChoice:
      hasDivineOrder &&
      (record.divineOrderChoice === "protector" || record.divineOrderChoice === "thaumaturge")
        ? record.divineOrderChoice
        : undefined,
    blessedStrikesChoice:
      hasBlessedStrikes &&
      (record.blessedStrikesChoice === "blessed-strike" ||
        record.blessedStrikesChoice === "potent-spellcasting")
        ? record.blessedStrikesChoice
        : undefined,
    blessedStrikeUsedThisTurn: hasBlessedStrikes
      ? Boolean(record.blessedStrikeUsedThisTurn)
      : undefined,
    channelDivinityUsesExpended: hasChannelDivinity
      ? Math.max(
          0,
          Math.min(
            channelDivinityTotal,
            Number.isFinite(Number(record.channelDivinityUsesExpended))
              ? Math.floor(Number(record.channelDivinityUsesExpended))
              : 0
          )
        )
      : undefined,
    divineInterventionUsed: hasDivineIntervention
      ? Boolean(record.divineInterventionUsed)
      : undefined
  };
}
