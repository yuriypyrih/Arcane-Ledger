import {
  ABILITY_TYPES,
  SPELL_LIST_CLASS,
  getSpellEntryById,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../codex/entries";
import {
  EFFECT_NAME,
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusEntry
} from "../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import type {
  FeatureActionCard,
  FeatureActionFact,
  FeatureSpeedBonus
} from "../../classFeatures/types";
import { getSpellcastingAbilityForCharacterSpell } from "../../shared/spellcastingAbility";
import { getSpellSaveFormulaCell } from "../../shared/spellFormulas";
import { normalizeCharacterStatusEntries } from "../../statusEntries";

export const draconicTransformationSpellId = "spell-draconic-transformation";
export const draconicTransformationStatusValue = "Draconic Transformation";
export const draconicTransformationBreathWeaponActionKey =
  "spell-draconic-transformation-breath-weapon";
export const draconicTransformationBlindsightStatusSourceId =
  "spell-draconic-transformation-blindsight";
export const draconicTransformationBlindsightRangeFeet = 30;
export const draconicTransformationFlySpeed = 60;

const draconicTransformationBreathWeaponFallbackDescription =
  "<strong>Breath Weapon.</strong> When you cast this spell, and as a Bonus Action on subsequent turns for the duration, you can exhale shimmering energy in a 60-foot cone. Each creature in that area must make a Dexterity saving throw, taking <strong>6d8</strong> Force damage on a failed save, or half as much damage on a successful one.";

type DraconicTransformationSpellFormulaEntry = Pick<
  SpellEntry,
  "isAttackSpell" | "isSavingThrowSpell" | "savingThrowAbility" | "spellLists"
> &
  Partial<Pick<SpellEntry, "description">>;

function getDraconicTransformationSpellEntry(): DraconicTransformationSpellFormulaEntry {
  return (
    getSpellEntryById(draconicTransformationSpellId) ?? {
      isAttackSpell: false,
      isSavingThrowSpell: true,
      savingThrowAbility: ABILITY_TYPES.DEX,
      spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD]
    }
  );
}

function getDraconicTransformationDescriptionSection(
  heading: string
): SpellDescriptionEntry[] {
  const spell = getDraconicTransformationSpellEntry();

  for (const entry of spell.description ?? []) {
    if (typeof entry === "string") {
      if (entry.includes(`<strong>${heading}.`)) {
        return [entry];
      }
      continue;
    }

    const matchingItem = entry.items.find((item) => item.includes(`<strong>${heading}.`));

    if (matchingItem) {
      return [matchingItem];
    }
  }

  return [draconicTransformationBreathWeaponFallbackDescription];
}

export function isActiveDraconicTransformationStatusEntry(
  entry: CharacterStatusEntry | null | undefined
): entry is CharacterStatusEntry {
  if (!entry) {
    return false;
  }

  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceSpellId === draconicTransformationSpellId &&
    entry.value === EFFECT_NAME.CONCENTRATION &&
    entry.disabled !== true
  );
}

export function hasActiveDraconicTransformationStatus(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    isActiveDraconicTransformationStatusEntry
  );
}

export function getDraconicTransformationSpeedBonusesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): FeatureSpeedBonus[] {
  if (!hasActiveDraconicTransformationStatus(character)) {
    return [];
  }

  return [
    {
      label: draconicTransformationStatusValue,
      value: 0,
      movementType: "fly",
      setTotal: draconicTransformationFlySpeed
    }
  ];
}

export function getDraconicTransformationSpellDerivedStatusEntriesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): CharacterStatusEntry[] {
  if (!hasActiveDraconicTransformationStatus(character)) {
    return [];
  }

  return [
    {
      id: draconicTransformationBlindsightStatusSourceId,
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.BLINDSIGHT,
      source: draconicTransformationStatusValue,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.CONCENTRATION
      },
      sourceId: draconicTransformationBlindsightStatusSourceId,
      rangeFeet: draconicTransformationBlindsightRangeFeet,
      description:
        "While Draconic Transformation is active, you have Blindsight with a range of 30 feet."
    }
  ];
}

function getDraconicTransformationBreathWeaponFacts(character: Character): FeatureActionFact[] {
  const spell = getDraconicTransformationSpellEntry();
  const spellcastingAbility = getSpellcastingAbilityForCharacterSpell(
    character,
    draconicTransformationSpellId
  );
  const spellDcFormulaCell = getSpellSaveFormulaCell(spell, character, spellcastingAbility);

  return spellDcFormulaCell
    ? [
        {
          label: spellDcFormulaCell.label,
          value: spellDcFormulaCell.content,
          breakdown: spellDcFormulaCell.breakdown,
          fullWidth: true
        }
      ]
    : [];
}

export function getDraconicTransformationActionsForCharacter(
  character: Character
): FeatureActionCard[] {
  if (!hasActiveDraconicTransformationStatus(character)) {
    return [];
  }

  const description = getDraconicTransformationDescriptionSection("Breath Weapon");
  const facts = getDraconicTransformationBreathWeaponFacts(character);

  return [
    {
      key: draconicTransformationBreathWeaponActionKey,
      name: "Breath Weapon",
      summary: "Exhale force in a cone.",
      detail: "Dexterity save for 6d8 Force damage.",
      breakdown: "60-foot cone",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.ATTACK,
      description,
      facts,
      drawer: {
        kind: "confirm",
        eyebrow: "SPELL: DRACONIC TRANSFORMATION",
        description,
        facts,
        factsSectionTitle: null,
        confirmLabel: "Use Breath Weapon"
      },
      execute: {
        kind: "activate",
        label: "Use Breath Weapon"
      }
    }
  ];
}

export const draconicTransformationSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: draconicTransformationSpellId,
    label: draconicTransformationStatusValue
  },
  spellId: draconicTransformationSpellId
};
