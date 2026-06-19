import {
  STATUS_ENTRY_GROUP,
  type Character,
  type CharacterStatusEntry,
  type CharacterStatusSpellTarget
} from "../../../../types";
import type { ArmorClassFeatureContext, FeatureArmorClassMode } from "../../classFeatures/types";
import { createDefaultDeathSaveTrack, normalizeDeathSaveTrack } from "../../deathSaves";
import { normalizeCharacterStatusEntries } from "../../statusEntries";
import {
  borrowedKnowledgeSpellId,
  borrowedKnowledgeStatusValue,
  getBorrowedKnowledgeCastOptions,
  getBorrowedKnowledgeSkillFromOptions
} from "./borrowedKnowledge";
import { compileSpellImplementationContributions } from "./contributions";
import {
  darkvisionSpellId,
  darkvisionStatusValue,
  getDarkvisionCastOptions,
  getDarkvisionTargetFromOptions
} from "./darkvision";
import type {
  SpellImplementationApplyContext,
  SpellImplementationStatusOptionsContext
} from "./types";

export const aidSpellId = "spell-aid";
export const aidStatusValue = "Aid";
export const aidTargetOptionId = "aidTarget";
export const barkskinSpellId = "spell-barkskin";
export const barkskinStatusValue = "Barkskin";
export const barkskinTargetOptionId = "barkskinTarget";

const aidBaseSpellLevel = 2;
const aidHitPointMaximumBonusPerSpellLevel = 5;
const selfOrOtherTargetChoices = [
  { value: "self", label: "Myself" },
  { value: "other", label: "Another" }
];
const barkskinArmorClass = 17;

function getAidCastOptions() {
  return [
    {
      id: aidTargetOptionId,
      label: "Target",
      defaultValue: "self",
      choices: selfOrOtherTargetChoices
    }
  ];
}

function getAidTargetFromOptions(
  context: SpellImplementationStatusOptionsContext
): CharacterStatusSpellTarget {
  return context.options[aidTargetOptionId] === "other" ? "other" : "self";
}

function getBarkskinCastOptions() {
  return [
    {
      id: barkskinTargetOptionId,
      label: "Target",
      defaultValue: "self",
      choices: selfOrOtherTargetChoices
    }
  ];
}

function getBarkskinTargetFromOptions(
  context: SpellImplementationStatusOptionsContext
): CharacterStatusSpellTarget {
  return context.options[barkskinTargetOptionId] === "other" ? "other" : "self";
}

function normalizeAidSourceSpellSlotLevel(sourceSpellSlotLevel: unknown): number {
  const numericSpellSlotLevel = Number(sourceSpellSlotLevel);

  if (!Number.isFinite(numericSpellSlotLevel)) {
    return aidBaseSpellLevel;
  }

  return Math.max(aidBaseSpellLevel, Math.floor(numericSpellSlotLevel));
}

function getAidHitPointIncreaseForSourceSpellSlotLevel(sourceSpellSlotLevel: unknown): number {
  const normalizedSourceSpellSlotLevel = normalizeAidSourceSpellSlotLevel(sourceSpellSlotLevel);

  return (
    aidHitPointMaximumBonusPerSpellLevel *
    Math.max(1, normalizedSourceSpellSlotLevel - aidBaseSpellLevel + 1)
  );
}

function getAidHitPointMaximumBonusForStatusEntry(entry: CharacterStatusEntry): number {
  return getAidHitPointIncreaseForSourceSpellSlotLevel(entry.sourceSpellSlotLevel);
}

function isSelfAidStatusEntry(entry: CharacterStatusEntry): boolean {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceSpellId === aidSpellId &&
    entry.value === aidStatusValue &&
    entry.sourceSpellTarget === "self" &&
    entry.disabled !== true
  );
}

export function getAidHitPointMaximumBonusForCharacter(
  character: Pick<Character, "statusEntries">
): number {
  return normalizeCharacterStatusEntries(character.statusEntries).reduce((maximumBonus, entry) => {
    if (!isSelfAidStatusEntry(entry)) {
      return maximumBonus;
    }

    return Math.max(maximumBonus, getAidHitPointMaximumBonusForStatusEntry(entry));
  }, 0);
}

function hasSelfBarkskinStatus(statusEntries: Character["statusEntries"]): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceSpellId === barkskinSpellId &&
      entry.value === barkskinStatusValue &&
      entry.sourceSpellTarget === "self" &&
      entry.disabled !== true
  );
}

export function getBarkskinArmorClassModes(
  character: Partial<Pick<Character, "statusEntries">>,
  _context: ArmorClassFeatureContext
): FeatureArmorClassMode[] {
  if (!hasSelfBarkskinStatus(character.statusEntries)) {
    return [];
  }

  return [
    {
      key: barkskinSpellId,
      label: barkskinStatusValue,
      baseValue: barkskinArmorClass,
      abilityModifiers: [],
      shieldAllowed: false,
      featureBonusesAllowed: false,
      isApplicable: true,
      detail: "Barkskin spell"
    }
  ];
}

const aidSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: aidSpellId,
    label: aidStatusValue
  },
  spellId: aidSpellId,
  getCastOptions: getAidCastOptions,
  applyOnCast: (context: SpellImplementationApplyContext) => {
    if (getAidTargetFromOptions(context) !== "self") {
      return context.character;
    }

    const healingAmount = getAidHitPointIncreaseForSourceSpellSlotLevel(
      context.sourceSpellSlotLevel
    );
    const nextCurrentHitPoints = Math.max(0, context.character.currentHitPoints) + healingAmount;

    if (nextCurrentHitPoints === context.character.currentHitPoints) {
      return context.character;
    }

    return {
      ...context.character,
      currentHitPoints: nextCurrentHitPoints,
      deathSaves:
        nextCurrentHitPoints > 0
          ? createDefaultDeathSaveTrack()
          : normalizeDeathSaveTrack(context.character.deathSaves)
    };
  },
  getStatusOptions: (context: SpellImplementationStatusOptionsContext) => ({
    sourceSpellTarget: getAidTargetFromOptions(context)
  })
};

const barkskinSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: barkskinSpellId,
    label: barkskinStatusValue
  },
  spellId: barkskinSpellId,
  getCastOptions: getBarkskinCastOptions,
  getStatusOptions: (context: SpellImplementationStatusOptionsContext) => ({
    sourceSpellTarget: getBarkskinTargetFromOptions(context)
  })
};

const borrowedKnowledgeSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: borrowedKnowledgeSpellId,
    label: borrowedKnowledgeStatusValue
  },
  spellId: borrowedKnowledgeSpellId,
  getCastOptions: getBorrowedKnowledgeCastOptions,
  getStatusOptions: (context: SpellImplementationStatusOptionsContext) => ({
    sourceSpellSkill: getBorrowedKnowledgeSkillFromOptions(context)
  })
};

const darkvisionSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: darkvisionSpellId,
    label: darkvisionStatusValue
  },
  spellId: darkvisionSpellId,
  getCastOptions: getDarkvisionCastOptions,
  getStatusOptions: (context: SpellImplementationStatusOptionsContext) => ({
    sourceSpellTarget: getDarkvisionTargetFromOptions(context)
  })
};

export const spellImplementations2 = compileSpellImplementationContributions([
  aidSpellImplementationSpec,
  barkskinSpellImplementationSpec,
  borrowedKnowledgeSpellImplementationSpec,
  darkvisionSpellImplementationSpec
]);
