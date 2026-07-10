import {
  DAMAGE_TYPE,
  REACTION,
  WEAPON_COMBAT_TYPE,
  getSpellEntryById,
  type ReactionEntry
} from "../../../../codex/entries";
import {
  EFFECT_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusEntry
} from "../../../../types";
import type { FeatureDamageBonus } from "../../classFeatures/types";
import { normalizeCharacterStatusEntries } from "../../statusEntries";

export const fountOfMoonlightSpellId = "spell-fount-of-moonlight";
export const fountOfMoonlightStatusValue = "Fount of Moonlight";
export const fountOfMoonlightReactionEntryId = "reaction-fount-of-moonlight";
export const fountOfMoonlightRadiantResistanceStatusSourceId =
  "spell-fount-of-moonlight-radiant-resistance";

const fountOfMoonlightDamageFormula = "2d6";
const fountOfMoonlightDamageLabel = "2d6 Radiant";
const fallbackFountOfMoonlightReactionDescription = [
  "In addition, immediately after you take damage from a creature you can see within 60 feet of yourself, you can take a Reaction to force the creature to make a Constitution saving throw. On a failed save, the creature has the Blinded condition until the end of your next turn."
];

export function isActiveFountOfMoonlightStatusEntry(
  entry: CharacterStatusEntry | null | undefined
): entry is CharacterStatusEntry {
  return (
    entry?.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceSpellId === fountOfMoonlightSpellId &&
    entry.value === EFFECT_NAME.CONCENTRATION &&
    entry.disabled !== true
  );
}

export function hasActiveFountOfMoonlightStatus(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    isActiveFountOfMoonlightStatusEntry
  );
}

export function getFountOfMoonlightWeaponDamageBonusesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>,
  context: {
    attackKind: "weapon" | "unarmed";
    combatType?: WEAPON_COMBAT_TYPE | null;
  }
): FeatureDamageBonus[] {
  if (
    !hasActiveFountOfMoonlightStatus(character) ||
    context.combatType !== WEAPON_COMBAT_TYPE.MELEE
  ) {
    return [];
  }

  return [
    {
      label: fountOfMoonlightStatusValue,
      formula: fountOfMoonlightDamageFormula,
      displayLabel: fountOfMoonlightDamageLabel,
      breakdownLabel: fountOfMoonlightStatusValue,
      formulaSourceLabel: fountOfMoonlightStatusValue
    }
  ];
}

export function getFountOfMoonlightSpellDerivedStatusEntriesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): CharacterStatusEntry[] {
  if (!hasActiveFountOfMoonlightStatus(character)) {
    return [];
  }

  return [
    {
      id: fountOfMoonlightRadiantResistanceStatusSourceId,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.RADIANT,
      source: fountOfMoonlightStatusValue,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.CONCENTRATION
      },
      sourceId: fountOfMoonlightRadiantResistanceStatusSourceId,
      sourceSpellId: fountOfMoonlightSpellId,
      description:
        "While Fount of Moonlight is active, you have Resistance to Radiant damage."
    }
  ];
}

function getFountOfMoonlightReactionDescription(): ReactionEntry["description"] {
  return (
    getSpellEntryById(fountOfMoonlightSpellId)?.description.slice(-1) ??
    fallbackFountOfMoonlightReactionDescription
  );
}

export function getFountOfMoonlightReactionEntriesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): ReactionEntry[] {
  if (!hasActiveFountOfMoonlightStatus(character)) {
    return [];
  }

  return [
    {
      id: fountOfMoonlightReactionEntryId,
      reaction: REACTION.FOUNT_OF_MOONLIGHT,
      name: fountOfMoonlightStatusValue,
      sourceType: "feature",
      sourceLabel: fountOfMoonlightStatusValue,
      description: getFountOfMoonlightReactionDescription()
    }
  ];
}

export const fountOfMoonlightSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: fountOfMoonlightSpellId,
    label: fountOfMoonlightStatusValue
  },
  spellId: fountOfMoonlightSpellId
};
