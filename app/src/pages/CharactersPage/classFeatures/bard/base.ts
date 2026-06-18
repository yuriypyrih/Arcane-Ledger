import { bardFeatures } from "../../../../codex/classes";
import { CLASS_FEATURE, type DICE } from "../../../../codex/entries";
import type { BardFeatureClassObj, Character, CharacterBardFeatureState } from "../../../../types";
import { getBackgroundAbilityScoreBonusesForCharacter } from "../../backgrounds";
import { getFeatAbilityScoreBonusesForCharacter } from "../../feats/runtime/derivedSelectors";

export function getBardFeatureRow(level: number): BardFeatureClassObj | null {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = bardFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;
}

function getUnlockedBardFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return bardFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

export function hasBardFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Bard") {
    return false;
  }

  return getUnlockedBardFeatures(character.level).has(feature);
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
    .sort((left, right) => {
      const leftHasCap = left.maxScore !== null && left.maxScore !== undefined;
      const rightHasCap = right.maxScore !== null && right.maxScore !== undefined;

      if (leftHasCap !== rightHasCap) {
        return leftHasCap ? -1 : 1;
      }

      if (leftHasCap && rightHasCap && left.maxScore !== right.maxScore) {
        return (left.maxScore ?? Number.POSITIVE_INFINITY) - (right.maxScore ?? Number.POSITIVE_INFINITY);
      }

      const leftOrder = left.order ?? 0;
      const rightOrder = right.order ?? 0;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.label.localeCompare(right.label);
    })
    .forEach((bonus) => {
      const value = Math.floor(bonus.value);

      if (!Number.isFinite(value) || value === 0) {
        return;
      }

      if (bonus.maxScore === null || bonus.maxScore === undefined) {
        total += value;
        return;
      }

      if (value > 0) {
        total += Math.max(0, Math.min(value, bonus.maxScore - total));
        return;
      }

      total += value;
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

  return getBardFeatureRow(character.level)?.bardicDie ?? null;
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
  const currentExpended = getBardicInspirationResourceState(character).bardicInspirationUsesExpended ?? 0;

  if (currentExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      bard: {
        ...character.classFeatureState?.bard,
        bardicInspirationUsesExpended: currentExpended + 1
      }
    }
  };
}
