import {
  CONDITION_NAME,
  EFFECT_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusEntry,
  type CharacterStatusSpellTarget
} from "../../../../types";
import { getAbilityModifierForCharacter } from "../../abilities";
import { swapTemporaryHitPointsAssignment } from "../../shared";
import { getSpellcastingAbilityForCharacterSpell } from "../../shared/spellcastingAbility";
import { normalizeCharacterStatusEntries } from "../../statusEntries";
import type {
  SpellImplementationCastOption,
  SpellImplementationStatusOptionsContext
} from "./types";

export const heroismSpellId = "spell-heroism";
export const heroismStatusValue = "Heroism";
export const heroismTargetOptionId = "heroismTarget";
export const heroismFrightenedImmunityStatusSourceId =
  "spell-heroism-self-frightened-immunity";
export const heroismTemporaryHitPointsSource = heroismStatusValue;

const selfOrOtherTargetChoices = [
  { value: "self", label: "Myself" },
  { value: "other", label: "Another" }
];

export function getHeroismCastOptions(): SpellImplementationCastOption[] {
  return [
    {
      id: heroismTargetOptionId,
      label: "Target",
      defaultValue: "self",
      choices: selfOrOtherTargetChoices
    }
  ];
}

export function getHeroismTargetFromOptions(
  context: SpellImplementationStatusOptionsContext
): CharacterStatusSpellTarget {
  return context.options[heroismTargetOptionId] === "other" ? "other" : "self";
}

function isSelfHeroismStatusEntry(entry: CharacterStatusEntry): boolean {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceSpellId === heroismSpellId &&
    entry.value === EFFECT_NAME.CONCENTRATION &&
    entry.sourceSpellTarget === "self" &&
    entry.disabled !== true
  );
}

export function hasSelfHeroismStatus(statusEntries: Character["statusEntries"]): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some(isSelfHeroismStatusEntry);
}

function getHeroismTemporaryHitPointsForCharacter(character: Character): number {
  const spellcastingAbility = getSpellcastingAbilityForCharacterSpell(character, heroismSpellId);

  if (!spellcastingAbility) {
    return 0;
  }

  return Math.max(0, getAbilityModifierForCharacter(character, spellcastingAbility));
}

export function applyHeroismRoundStartTemporaryHitPointsForCharacter(
  character: Character
): Character {
  if (!hasSelfHeroismStatus(character.statusEntries)) {
    return character;
  }

  const temporaryHitPoints = getHeroismTemporaryHitPointsForCharacter(character);

  if (temporaryHitPoints <= 0) {
    return character;
  }

  const nextTemporaryHitPointsAssignment = swapTemporaryHitPointsAssignment(
    character.temporaryHitPoints,
    character.temporaryHitPointsSource,
    temporaryHitPoints,
    heroismTemporaryHitPointsSource
  );

  if (
    nextTemporaryHitPointsAssignment.temporaryHitPoints === character.temporaryHitPoints &&
    nextTemporaryHitPointsAssignment.temporaryHitPointsSource ===
      character.temporaryHitPointsSource
  ) {
    return character;
  }

  return {
    ...character,
    ...nextTemporaryHitPointsAssignment
  };
}

export function getHeroismSpellDerivedStatusEntriesForCharacter(
  character: Pick<Character, "statusEntries">
): CharacterStatusEntry[] {
  if (!hasSelfHeroismStatus(character.statusEntries)) {
    return [];
  }

  return [
    {
      id: heroismFrightenedImmunityStatusSourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: CONDITION_NAME.FRIGHTENED,
      source: heroismStatusValue,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      sourceId: heroismFrightenedImmunityStatusSourceId,
      description: "For the duration, you are immune to the Frightened condition."
    }
  ];
}
