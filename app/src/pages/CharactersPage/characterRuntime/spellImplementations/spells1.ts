import type { SpellEntry } from "../../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusEntry
} from "../../../../types";
import type { ArmorClassFeatureContext, FeatureArmorClassMode } from "../../classFeatures";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries,
  pruneLinkedStatusEntries
} from "../../statusEntries";
import type {
  SpellImplementationApplyContext,
  SpellImplementationCastOptionsContext
} from "./types";
import { compileSpellImplementationContributions } from "./contributions";
import {
  applyFalseLifeTemporaryHitPointsToCharacter,
  falseLifeSpellId,
  fiendishVigorTemporaryHitPointsSource,
  getFalseLifeTemporaryHitPointsFormula,
  getFalseLifeTemporaryHitPointsFormulaDisplay,
  getFalseLifeTemporaryHitPointsFromRoll
} from "./falseLife";

export const mageArmorSpellId = "spell-mage-armor";
export const mageArmorStatusSourceId = "spell-mage-armor-self";
export const mageArmorStatusValue = "Mage Armor";
export const mageArmorCastOnSelfOptionId = "castOnSelf";
export const falseLifeMaximizeTemporaryHitPointsOptionId = "maximizeTemporaryHitPoints";

export function isMageArmorSelfStatusEntry(
  entry: Pick<CharacterStatusEntry, "group" | "sourceId" | "value">
): boolean {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceId === mageArmorStatusSourceId &&
    entry.value === mageArmorStatusValue
  );
}

export function hasMageArmorSelfStatus(statusEntries: Character["statusEntries"]): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some(isMageArmorSelfStatusEntry);
}

function applyMageArmorSelfCastForCharacter(
  character: Character,
  spell: Pick<SpellEntry, "id" | "name" | "description">
): Character {
  if (spell.id !== mageArmorSpellId) {
    return character;
  }

  const normalizedStatusEntries = normalizeCharacterStatusEntries(character.statusEntries);
  const nextStatusEntries = [
    ...normalizedStatusEntries.filter((entry) => !isMageArmorSelfStatusEntry(entry)),
    createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: mageArmorStatusValue,
      source: spell.name,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: {
        kind: STATUS_DURATION_KIND.HOURS,
        amount: 8
      },
      sourceId: mageArmorStatusSourceId,
      sourceSpellId: spell.id,
      description: spell.description.join("\n")
    })
  ];

  return {
    ...character,
    statusEntries: pruneLinkedStatusEntries(nextStatusEntries)
  };
}

function getMageArmorCastOptions(context: SpellImplementationCastOptionsContext) {
  const forceSelfCast = context.forcedOptions?.[mageArmorCastOnSelfOptionId] === true;

  return [
    {
      id: mageArmorCastOnSelfOptionId,
      label: "Cast on myself",
      defaultChecked: forceSelfCast,
      disabled: forceSelfCast
    }
  ];
}

export function applyMageArmorSpellImplementation(
  context: SpellImplementationApplyContext
): Character {
  if (context.options[mageArmorCastOnSelfOptionId] !== true) {
    return context.character;
  }

  return applyMageArmorSelfCastForCharacter(context.character, context.spell);
}

const mageArmorSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: mageArmorSpellId,
    label: mageArmorStatusValue
  },
  spellId: mageArmorSpellId,
  getCastOptions: getMageArmorCastOptions,
  applyOnCast: applyMageArmorSpellImplementation
};

function getFalseLifeCastOptions(context: SpellImplementationCastOptionsContext) {
  const forceMaximizedTemporaryHitPoints =
    context.forcedOptions?.[falseLifeMaximizeTemporaryHitPointsOptionId] === true;

  return forceMaximizedTemporaryHitPoints
    ? [
        {
          id: falseLifeMaximizeTemporaryHitPointsOptionId,
          label: "Maximize temporary hit points",
          defaultChecked: true,
          disabled: true
        }
      ]
    : [];
}

const falseLifeSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: falseLifeSpellId,
    label: "False Life"
  },
  spellId: falseLifeSpellId,
  getCastOptions: getFalseLifeCastOptions,
  getRollEffects: (context: SpellImplementationApplyContext) => {
    const maximizeDie =
      context.options[falseLifeMaximizeTemporaryHitPointsOptionId] === true;

    return [
      {
        id: "false-life-temporary-hit-points",
        title: maximizeDie ? "Fiendish Vigor" : context.spell.name,
        formula: getFalseLifeTemporaryHitPointsFormula({
          maximizeDie,
          spellSlotLevel: context.spellSlotLevel
        }),
        formulaDisplay: getFalseLifeTemporaryHitPointsFormulaDisplay(
          context.spellSlotLevel,
          { maximizeDie }
        ),
        description: maximizeDie
          ? "When you cast False Life with Fiendish Vigor, you gain Temporary Hit Points and treat the d4 as a 4."
          : `When you cast ${context.spell.name}, you gain Temporary Hit Points.`,
        applyResolvedResult: (character: Character, result: { total: number }) => {
          const temporaryHitPoints = maximizeDie
            ? result.total
            : getFalseLifeTemporaryHitPointsFromRoll(result.total, context.spellSlotLevel);
          const source = maximizeDie
            ? fiendishVigorTemporaryHitPointsSource
            : context.spell.name;

          return applyFalseLifeTemporaryHitPointsToCharacter(
            character,
            temporaryHitPoints,
            source
          );
        }
      }
    ];
  }
};

export function getMageArmorArmorClassModes(
  character: Partial<Pick<Character, "statusEntries">>,
  context: ArmorClassFeatureContext
): FeatureArmorClassMode[] {
  if (!hasMageArmorSelfStatus(character.statusEntries)) {
    return [];
  }

  return [
    {
      key: "spell-mage-armor",
      label: mageArmorStatusValue,
      baseValue: 13,
      abilityModifiers: ["DEX"],
      shieldAllowed: true,
      isApplicable: !context.hasWornBodyArmor,
      unavailableReason: context.hasWornBodyArmor
        ? "Requires you to wear no body armor."
        : undefined,
      detail: "Mage Armor spell"
    }
  ];
}

export const spellImplementations1 = compileSpellImplementationContributions([
  mageArmorSpellImplementationSpec,
  falseLifeSpellImplementationSpec
]);
