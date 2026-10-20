import { CLASS_FEATURE } from "../../../../../codex/entries/enums";
import type { Character, CharacterRangerFeatureState } from "../../../../../types";
import { createFeatureSourcedDescriptionEntries } from "../../../actionModalDescriptions";
import { normalizeDeathSaveTrack } from "../../../deathSaves";
import { getClassLevel } from "../../../multiclassState";
import { getCharacterSpellSlotPools, setSlotPoolExpended } from "../../../multiclassSpellcasting";
import {
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../../../traits";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { replaceClassFeatureState } from "../../shared/resourceState";
import type { SubclassRuntimeCharacter } from "../../subclassRuntime";
import { hasActiveWrathOfTheWild, hasHollowWardenFeatures } from "./rangerHollowWarden";

export function hasRangerPersistentWrath(character: SubclassRuntimeCharacter): boolean {
  return hasHollowWardenFeatures(character, 15);
}

export function normalizeRangerPersistentWrathState(
  state: Partial<CharacterRangerFeatureState>,
  character: SubclassRuntimeCharacter
): Partial<CharacterRangerFeatureState> {
  return {
    persistentWrathUsesExpended: hasRangerPersistentWrath(character)
      ? Math.min(1, Math.max(0, Math.floor(Number(state.persistentWrathUsesExpended) || 0)))
      : undefined
  };
}

export function getRangerPersistentWrathUsesRemaining(character: SubclassRuntimeCharacter): number {
  if (!hasRangerPersistentWrath(character)) return 0;
  return (
    1 -
    (normalizeRangerPersistentWrathState(character.classFeatureState?.ranger ?? {}, character)
      .persistentWrathUsesExpended ?? 0)
  );
}

export function getRangerAncientMightLedgerDescriptionAdditions(character: Character) {
  if (!hasRangerPersistentWrath(character)) return [];
  return [
    createFeatureSourcedDescriptionEntries(
      character,
      CLASS_FEATURE.ANCIENT_MIGHT,
      getFeatureDescriptionForCharacter(character, CLASS_FEATURE.ANCIENT_MIGHT).slice(1)
    )
  ];
}

export function getRangerPersistentWrathFallbackSlot(character: Character) {
  if (!hasRangerPersistentWrath(character) || getRangerPersistentWrathUsesRemaining(character) > 0)
    return null;
  const pools = getCharacterSpellSlotPools(character);
  return (
    pools
      .flatMap((pool) =>
        pool.totals.flatMap((total, index) =>
          index >= 3 && total > (pool.expended[index] ?? 0) ? [{ pool, level: index + 1 }] : []
        )
      )
      .sort((left, right) => left.level - right.level)[0] ?? null
  );
}

export function isRangerPersistentWrathRelevant(character: Character): boolean {
  const deathSaves = normalizeDeathSaveTrack(character.deathSaves);
  return (
    hasRangerPersistentWrath(character) &&
    character.currentHitPoints === 0 &&
    deathSaves.resolution !== "instant-death" &&
    deathSaves.failures < 3 &&
    deathSaves.successes < 3 &&
    hasActiveWrathOfTheWild(character)
  );
}

export function isRangerPersistentWrathAvailable(character: Character): boolean {
  return (
    isRangerPersistentWrathRelevant(character) &&
    (getRangerPersistentWrathUsesRemaining(character) > 0 ||
      getRangerPersistentWrathFallbackSlot(character) !== null)
  );
}

export function applyRangerPersistentWrath(character: Character): Character {
  if (!isRangerPersistentWrathAvailable(character)) return character;
  let nextCharacter = character;
  if (getRangerPersistentWrathUsesRemaining(character) <= 0) {
    const fallback = getRangerPersistentWrathFallbackSlot(character);
    if (!fallback) return character;
    const expended = [...fallback.pool.expended];
    expended[fallback.level - 1] = (expended[fallback.level - 1] ?? 0) + 1;
    nextCharacter = setSlotPoolExpended(character, fallback.pool.id, expended);
  }
  nextCharacter = replaceClassFeatureState(nextCharacter, "ranger", {
    ...nextCharacter.classFeatureState?.ranger,
    persistentWrathUsesExpended: 1
  });
  return reconcileCharacterStatusConsequences({
    ...nextCharacter,
    currentHitPoints: Math.min(
      getEffectiveHitPointMaximumForCharacter(nextCharacter),
      2 * getClassLevel(nextCharacter, "Ranger")
    ),
    deathSaves: { successes: 0, failures: 0 }
  });
}

export function restoreRangerPersistentWrathOnLongRest(character: Character): Character {
  if (!hasRangerPersistentWrath(character) || getRangerPersistentWrathUsesRemaining(character) > 0)
    return character;
  return replaceClassFeatureState(character, "ranger", {
    ...character.classFeatureState?.ranger,
    persistentWrathUsesExpended: 0
  });
}
