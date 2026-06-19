import { getSpellEntryById, type SpellEntry } from "../../../../codex/entries";
import {
  EFFECT_NAME,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusEntry,
  type CharacterStatusSpellTarget
} from "../../../../types";
import type {
  ArmorClassFeatureContext,
  FeatureActionCard,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureDamageBonus
} from "../../classFeatures";
import { createSourcedDescriptionEntries } from "../../actionModalDescriptions";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries,
  pruneLinkedStatusEntries
} from "../../statusEntries";
import type {
  SpellImplementationApplyContext,
  SpellImplementationCastOptionsContext,
  SpellImplementationStatusOptionsContext
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
export const armorOfAgathysSpellId = "spell-armor-of-agathys";
export const divineFavorSpellId = "spell-divine-favor";
export const divineFavorStatusValue = "Divine Favor";
export const expeditiousRetreatSpellId = "spell-expeditious-retreat";
export const expeditiousRetreatStatusValue = "Expeditious Retreat";
export const shieldSpellId = "spell-shield";
export const shieldStatusSourceId = "spell-shield-self";
export const shieldStatusValue = "Shield";
export const shieldOfFaithSpellId = "spell-shield-of-faith";
export const shieldOfFaithStatusValue = "Shield of Faith";
export const shieldOfFaithTargetOptionId = "shieldOfFaithTarget";
export const mageArmorCastOnSelfOptionId = "castOnSelf";
export const falseLifeMaximizeTemporaryHitPointsOptionId = "maximizeTemporaryHitPoints";

const armorOfAgathysTemporaryHitPointsPerSpellLevel = 5;
const commonActionDashActionKey = "common-action-dash";
const divineFavorDamageFormula = "1d4";
const divineFavorDamageLabel = "1d4 Radiant";
const shieldArmorClassBonus = 5;
const shieldOfFaithArmorClassBonus = 2;
const shieldOfFaithTargetChoices = [
  { value: "self", label: "Myself" },
  { value: "other", label: "Another" }
];

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
  spell: Pick<SpellEntry, "id" | "name" | "description">,
  sourceSpellSlotLevel: number | null
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
      sourceSpellSlotLevel,
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

  return applyMageArmorSelfCastForCharacter(
    context.character,
    context.spell,
    context.sourceSpellSlotLevel
  );
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

export function isShieldStatusEntry(
  entry: Pick<CharacterStatusEntry, "group" | "sourceId" | "sourceSpellId" | "value">
): boolean {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.sourceId === shieldStatusSourceId &&
    entry.sourceSpellId === shieldSpellId &&
    entry.value === shieldStatusValue
  );
}

export function hasShieldStatus(statusEntries: Character["statusEntries"]): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some(
    (entry) => isShieldStatusEntry(entry) && entry.disabled !== true
  );
}

function applyShieldSpellImplementation(context: SpellImplementationApplyContext): Character {
  const normalizedStatusEntries = normalizeCharacterStatusEntries(context.character.statusEntries);
  const nextStatusEntries = [
    ...normalizedStatusEntries.filter((entry) => !isShieldStatusEntry(entry)),
    createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: shieldStatusValue,
      source: context.spell.name,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: 1,
        tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
      },
      sourceId: shieldStatusSourceId,
      sourceSpellId: context.spell.id,
      sourceSpellSlotLevel: context.sourceSpellSlotLevel,
      description: context.spell.description.join("\n")
    })
  ];

  return {
    ...context.character,
    statusEntries: pruneLinkedStatusEntries(nextStatusEntries)
  };
}

const shieldSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: shieldSpellId,
    label: shieldStatusValue
  },
  spellId: shieldSpellId,
  applyOnCast: applyShieldSpellImplementation
};

function getShieldOfFaithCastOptions() {
  return [
    {
      id: shieldOfFaithTargetOptionId,
      label: "Target",
      defaultValue: "self",
      choices: shieldOfFaithTargetChoices
    }
  ];
}

function getShieldOfFaithTargetFromOptions(
  context: SpellImplementationStatusOptionsContext
): CharacterStatusSpellTarget {
  return context.options[shieldOfFaithTargetOptionId] === "other" ? "other" : "self";
}

function hasSelfShieldOfFaithStatus(statusEntries: Character["statusEntries"]): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceSpellId === shieldOfFaithSpellId &&
      entry.value === EFFECT_NAME.CONCENTRATION &&
      entry.sourceSpellTarget === "self" &&
      entry.disabled !== true
  );
}

const shieldOfFaithSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: shieldOfFaithSpellId,
    label: shieldOfFaithStatusValue
  },
  spellId: shieldOfFaithSpellId,
  getCastOptions: getShieldOfFaithCastOptions,
  getStatusOptions: (context: SpellImplementationStatusOptionsContext) => ({
    sourceSpellTarget: getShieldOfFaithTargetFromOptions(context)
  })
};

function normalizeArmorOfAgathysSpellSlotLevel(spellSlotLevel: unknown): number {
  const numericSpellSlotLevel = Number(spellSlotLevel);

  if (!Number.isFinite(numericSpellSlotLevel)) {
    return 1;
  }

  return Math.max(1, Math.floor(numericSpellSlotLevel));
}

export function getArmorOfAgathysTemporaryHitPoints(spellSlotLevel: unknown): number {
  return (
    normalizeArmorOfAgathysSpellSlotLevel(spellSlotLevel) *
    armorOfAgathysTemporaryHitPointsPerSpellLevel
  );
}

function applyArmorOfAgathysSpellImplementation(
  context: SpellImplementationApplyContext
): Character {
  return applyFalseLifeTemporaryHitPointsToCharacter(
    context.character,
    getArmorOfAgathysTemporaryHitPoints(context.spellSlotLevel),
    context.spell.name
  );
}

const armorOfAgathysSpellImplementationSpec = {
  source: {
    type: "spell" as const,
    id: armorOfAgathysSpellId,
    label: "Armor of Agathys"
  },
  spellId: armorOfAgathysSpellId,
  applyOnCast: applyArmorOfAgathysSpellImplementation
};

export function hasDivineFavorStatus(statusEntries: Character["statusEntries"]): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS && entry.sourceSpellId === divineFavorSpellId
  );
}

export function getDivineFavorWeaponDamageBonusesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): FeatureDamageBonus[] {
  if (!hasDivineFavorStatus(character.statusEntries)) {
    return [];
  }

  return [
    {
      label: divineFavorStatusValue,
      formula: divineFavorDamageFormula,
      displayLabel: divineFavorDamageLabel,
      breakdownLabel: divineFavorStatusValue
    }
  ];
}

export function hasExpeditiousRetreatStatus(
  statusEntries: Character["statusEntries"]
): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceSpellId === expeditiousRetreatSpellId
  );
}

export function hasExpeditiousRetreatDashBonusActionPath(
  character: Partial<Pick<Character, "statusEntries">>,
  actionKey: string
): boolean {
  return (
    actionKey === commonActionDashActionKey && hasExpeditiousRetreatStatus(character.statusEntries)
  );
}

function getExpeditiousRetreatDescriptionAddition() {
  const spell = getSpellEntryById(expeditiousRetreatSpellId);

  return spell
    ? createSourcedDescriptionEntries(spell.name, spell.description)
    : [];
}

export function getExpeditiousRetreatCommonActionForCharacter(
  character: Partial<Pick<Character, "statusEntries">>,
  action: FeatureActionCard
): FeatureActionCard {
  if (!hasExpeditiousRetreatDashBonusActionPath(character, action.key)) {
    return action;
  }

  return {
    ...action,
    detail: `${action.detail} Expeditious Retreat lets you take Dash as a Bonus Action while the spell lasts.`,
    breakdown: "Action or bonus Dash",
    descriptionAdditions: [
      ...(action.descriptionAdditions ?? []),
      getExpeditiousRetreatDescriptionAddition()
    ].filter((section) => section.length > 0)
  };
}

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

export function getSpellArmorClassBonusesForCharacter(
  character: Partial<Pick<Character, "statusEntries">>
): FeatureArmorClassBonus[] {
  const bonuses: FeatureArmorClassBonus[] = [];

  if (hasShieldStatus(character.statusEntries)) {
    bonuses.push({
      label: shieldStatusValue,
      value: shieldArmorClassBonus
    });
  }

  if (hasSelfShieldOfFaithStatus(character.statusEntries)) {
    bonuses.push({
      label: shieldOfFaithStatusValue,
      value: shieldOfFaithArmorClassBonus
    });
  }

  return bonuses;
}

export const spellImplementations1 = compileSpellImplementationContributions([
  mageArmorSpellImplementationSpec,
  armorOfAgathysSpellImplementationSpec,
  shieldSpellImplementationSpec,
  shieldOfFaithSpellImplementationSpec,
  falseLifeSpellImplementationSpec
]);
