import { replaceClassFeatureState } from "../shared/resourceState";
import {
  getAppliedAbilityScoreBonus,
  compareLabeledAbilityScoreBonuses
} from "../../shared/abilityBonusMath";
import { getProgressionRow } from "../../../../codex/progression";
import { getUnlockedProgressionFeatures } from "../../../../codex/progression";
import { hasCharacterClass, getClassLevel } from "../../multiclassState";
import { bardFeatures } from "../../../../codex/classes";
import { CLASS_FEATURE, type DICE } from "../../../../codex/entries/enums";
import type { BardFeatureClassObj, Character, CharacterBardFeatureState } from "../../../../types";
import { getBackgroundAbilityScoreBonusesForCharacter } from "../../backgrounds";
import { getFeatAbilityScoreBonusesForCharacter } from "../../feats/runtime/derivedSelectors";

export function getBardFeatureRow(level: number): BardFeatureClassObj | null {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return getProgressionRow(bardFeatures, normalizedLevel);
}

function getUnlockedBardFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return getUnlockedProgressionFeatures(bardFeatures, normalizedLevel);
}

export function hasBardFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (!hasCharacterClass(character, "Bard")) {
    return false;
  }

  return getUnlockedBardFeatures(getClassLevel(character, "Bard")).has(feature);
}

function getBardCharismaModifier(
  character: Pick<Character, "abilities" | "level" | "feats"> &
    Partial<Pick<Character, "background" | "backgroundChoices">>
): number {
  let total = Math.max(1, Math.floor(character.abilities.CHA));

  [
    ...getBackgroundAbilityScoreBonusesForCharacter(character),
    ...getFeatAbilityScoreBonusesForCharacter(character)
  ]
    .filter((bonus) => bonus.ability === "CHA")
    .sort(compareLabeledAbilityScoreBonuses)
    .forEach((bonus) => {
      total += getAppliedAbilityScoreBonus(total, bonus);
    });

  return Math.floor((total - 10) / 2);
}

export function getBardicInspirationBaseUsesTotal(
  character: Pick<Character, "className" | "level" | "abilities" | "classFeatureState" | "feats">
): number {
  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return 0;
  }

  return Math.max(1, getBardCharismaModifier(character));
}

function getBardicInspirationResourceState(
  character: Pick<Character, "classFeatureState">
): Pick<
  CharacterBardFeatureState,
  "bardicInspirationUsesExpended" | "bardicInspirationTemporaryTotal"
> {
  const rawState = character.classFeatureState?.bard ?? {};
  const usesExpended = Number(rawState.bardicInspirationUsesExpended);
  const temporaryTotal = Number(rawState.bardicInspirationTemporaryTotal);

  return {
    bardicInspirationUsesExpended: Number.isFinite(usesExpended)
      ? Math.max(0, Math.floor(usesExpended))
      : 0,
    bardicInspirationTemporaryTotal: Number.isFinite(temporaryTotal)
      ? Math.max(0, Math.floor(temporaryTotal))
      : undefined
  };
}

export function getBardicInspirationDie(
  character: Pick<Character, "className" | "level">
): DICE | null {
  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return null;
  }

  return getBardFeatureRow(getClassLevel(character, "Bard"))?.bardicDie ?? null;
}

export function getBardicInspirationUsesTotal(
  character: Pick<Character, "className" | "level" | "abilities" | "classFeatureState" | "feats">
): number {
  const baseTotal = getBardicInspirationBaseUsesTotal(character);
  const bardState = getBardicInspirationResourceState(character);

  return Math.max(baseTotal, bardState.bardicInspirationTemporaryTotal ?? 0);
}

export function getBardicInspirationUsesRemaining(
  character: Pick<Character, "className" | "level" | "abilities" | "classFeatureState" | "feats">
): number {
  const totalUses = getBardicInspirationUsesTotal(character);
  const bardState = getBardicInspirationResourceState(character);
  return Math.max(0, totalUses - (bardState.bardicInspirationUsesExpended ?? 0));
}

export function expendBardicInspirationUse(character: Character): Character {
  if (!hasBardFeature(character, CLASS_FEATURE.BARDIC_INSPIRATION)) {
    return character;
  }

  const totalUses = getBardicInspirationUsesTotal(character);
  const currentExpended =
    getBardicInspirationResourceState(character).bardicInspirationUsesExpended ?? 0;

  if (currentExpended >= totalUses) {
    return character;
  }

  return replaceClassFeatureState(character, "bard", {
    ...character.classFeatureState?.bard,
    bardicInspirationUsesExpended: currentExpended + 1
  });
}
