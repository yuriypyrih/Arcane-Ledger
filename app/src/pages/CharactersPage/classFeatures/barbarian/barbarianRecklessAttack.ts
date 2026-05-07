import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusDuration,
  type CharacterStatusEntry
} from "../../../../types";
import { createFeatureSourcedDescriptionEntries } from "../../actionModalDescriptions";
import type { WeaponAction } from "../../gameplay";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../statusEntries";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";
import type { FeatureIndicator } from "../types";
import { getBarbarianPathOfTheBerserkerRecklessAttackDescriptionAdditions } from "./subclasses/barbarianPathOfTheBerserker";

export const barbarianRecklessAttackStatusSourceId = "feature-barbarian-reckless-attack";
export const barbarianRecklessAttackDurationRounds = 1;
export const barbarianRecklessAttackName = "Reckless Attack";

const recklessAttackAdvantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: barbarianRecklessAttackName
};

type BarbarianRecklessAttackCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "statusEntries" | "subclassId">>;

function isActiveStatusDuration(duration: CharacterStatusDuration): boolean {
  return duration.kind !== STATUS_DURATION_KIND.ROUNDS || duration.amount > 0;
}

export function hasBarbarianRecklessAttackFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Barbarian" &&
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.RECKLESS_ATTACK).length > 0
  );
}

export function isBarbarianRecklessAttackStatusEntry(
  entry: Pick<CharacterStatusEntry, "group" | "sourceId" | "sourceType">
): boolean {
  return (
    entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.FEATURE &&
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceId === barbarianRecklessAttackStatusSourceId
  );
}

export function hasActiveBarbarianRecklessAttackStatus(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) =>
      isBarbarianRecklessAttackStatusEntry(entry) &&
      entry.disabled !== true &&
      isActiveStatusDuration(entry.duration)
  );
}

export function createBarbarianRecklessAttackStatusEntry(): CharacterStatusEntry {
  return createCharacterStatusEntry({
    group: STATUS_ENTRY_GROUP.EFFECTS,
    value: barbarianRecklessAttackName,
    source: "Barbarian",
    sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
    duration: {
      kind: STATUS_DURATION_KIND.ROUNDS,
      amount: barbarianRecklessAttackDurationRounds,
      tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
    },
    sourceId: barbarianRecklessAttackStatusSourceId
  });
}

export function upsertBarbarianRecklessAttackStatusEntry(character: Character): Character {
  return {
    ...character,
    statusEntries: [
      ...normalizeCharacterStatusEntries(character.statusEntries).filter(
        (entry) => !isBarbarianRecklessAttackStatusEntry(entry)
      ),
      createBarbarianRecklessAttackStatusEntry()
    ]
  };
}

export function removeBarbarianRecklessAttackStatusEntries(
  statusEntries: unknown
): CharacterStatusEntry[] {
  return normalizeCharacterStatusEntries(statusEntries).filter(
    (entry) => !isBarbarianRecklessAttackStatusEntry(entry)
  );
}

export function isBarbarianRecklessAttackWeaponActionEligible(
  action: Pick<WeaponAction, "ability" | "attackKind"> | null | undefined
): boolean {
  return (
    action !== null &&
    action !== undefined &&
    action.ability === "STR" &&
    (action.attackKind === "weapon" || action.attackKind === "unarmed")
  );
}

export function applyBarbarianRecklessAttackIndicatorToWeaponAction(
  action: WeaponAction
): WeaponAction {
  if (!isBarbarianRecklessAttackWeaponActionEligible(action)) {
    return action;
  }

  return {
    ...action,
    indicators: [...action.indicators, recklessAttackAdvantageIndicator]
  };
}

export function transformBarbarianRecklessAttackWeaponAction(
  character: Partial<Pick<Character, "statusEntries">>,
  action: WeaponAction
): WeaponAction {
  return hasActiveBarbarianRecklessAttackStatus(character)
    ? applyBarbarianRecklessAttackIndicatorToWeaponAction(action)
    : action;
}

export type BarbarianRecklessAttackWeaponOptionState = {
  active: boolean;
  disabled: boolean;
  disabledReason: string | null;
};

export function getBarbarianRecklessAttackWeaponOptionState(
  character: BarbarianRecklessAttackCharacter,
  action: Pick<WeaponAction, "ability" | "attackKind"> | null | undefined
): BarbarianRecklessAttackWeaponOptionState | null {
  if (!hasBarbarianRecklessAttackFeature(character)) {
    return null;
  }

  const isEligible = isBarbarianRecklessAttackWeaponActionEligible(action);

  return {
    active: isEligible && hasActiveBarbarianRecklessAttackStatus(character),
    disabled: !isEligible,
    disabledReason: !isEligible
      ? "Reckless Attack only applies to Strength-based weapon and Unarmed Strike attacks."
      : null
  };
}

export function getBarbarianRecklessAttackWeaponActionDescriptionAdditions(
  character: BarbarianRecklessAttackCharacter
): SpellDescriptionEntry[][] {
  if (!hasBarbarianRecklessAttackFeature(character)) {
    return [];
  }

  const recklessAttackDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.RECKLESS_ATTACK
  );
  const recklessAttackSections =
    recklessAttackDescription.length > 0
      ? [
          createFeatureSourcedDescriptionEntries(
            character,
            CLASS_FEATURE.RECKLESS_ATTACK,
            recklessAttackDescription,
            barbarianRecklessAttackName
          )
        ]
      : [];

  return [
    ...recklessAttackSections,
    ...getBarbarianPathOfTheBerserkerRecklessAttackDescriptionAdditions(character)
  ];
}
