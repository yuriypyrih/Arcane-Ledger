import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  REACTION,
  type ReactionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import { getSubclassEntryById } from "../../../../../codex/subclasses";
import type { Character, CharacterStatusEntry } from "../../../../../types";
import {
  CONDITION_NAME,
  EFFECT_NAME,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import {
  appendDescriptionAddition,
  appendFeatureSourcedDescriptionAddition,
  descriptionValueSomeText
} from "../../../actionModalDescriptions";
import type { WeaponAction } from "../../../gameplay";
import {
  formatFormulaCell,
  formatFormulaTerms,
  formatSignedFormulaTerm
} from "../../../shared/formulas";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries,
  removeCharacterConditionsForImmunities
} from "../../../statusEntries";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  createDefaultFeatureActionDescription,
  getPreparedSpellIdsByLevel,
  resolveSpellIdsByName,
  type SubclassRuntimeResolver
} from "../../subclassRuntime";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionFact,
  FeatureDamageBonus
} from "../../types";
import { getRangerFeatAdjustedWisdomModifier } from "../abilityModifiers";

export const winterWalkerSubclassId = "ranger-winter-walker";
export const rangerWinterWalkerBitingColdStatusSourceId =
  "feature-ranger-winter-walker-biting-cold";
export const rangerWinterWalkerColdResistanceSourceId =
  "feature-ranger-winter-walker-cold-resistance";
export const fortifyingSoulActionKey = "ranger-winter-walker-fortifying-soul";
export const chillingRetributionReactionId = "reaction-ranger-chilling-retribution";
export const rangerWinterWalkerFrozenHauntStatusSourceId =
  "feature-ranger-winter-walker-frozen-haunt";

const favoredEnemyActionKey = "ranger-favored-enemy";
const huntersMarkSpellId = "spell-hunters-mark";
const bitingColdName = "Biting Cold";
const chillingRetributionReactionName = "Chilling Retribution";
const frozenHauntName = "Frozen Haunt";
const frostResistanceName = "Frost Resistance";
const fortifyingSoulActionName = "Fortifying Soul";
const huntersRimeSource = "Hunter's Rime";
const polarStrikesLabel = "Polar Strikes";
const frozenHauntFallbackSpellSlotMinimumLevel = 4;
const winterWalkerSubclassEntry = getSubclassEntryById(winterWalkerSubclassId);
const winterWalkerSpellIdsByLevel = {
  3: resolveSpellIdsByName(["Ice Knife"]),
  5: resolveSpellIdsByName(["Hold Person"]),
  9: resolveSpellIdsByName(["Remove Curse"]),
  13: resolveSpellIdsByName(["Ice Storm"]),
  17: resolveSpellIdsByName(["Cone of Cold"])
} as const;

type RangerWinterWalkerCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "abilities" | "classFeatureState" | "feats" | "level" | "subclassId">>;

type PolarStrikesAction = Pick<WeaponAction, "attackKind">;

export type RangerWinterWalkerPolarStrikesOptionState = {
  damageBonus: FeatureDamageBonus;
  disabled: boolean;
  disabledReason?: string;
};

export type RangerWinterWalkerFrozenHauntSpellOptionState = {
  usesRemaining: number;
  usesTotal: number;
  fallbackSpellSlotLevels: number[];
  disabled: boolean;
  disabledReason?: string;
};

function getRangerWinterWalkerFeatureDescriptionEntries(feature: CLASS_FEATURE): string[] {
  const featureRow = winterWalkerSubclassEntry?.features.find((row) =>
    row.classFeatures.includes(feature)
  );

  return (featureRow?.featureOverrides?.[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

function extractFeatureDescriptionSection(
  description: readonly string[],
  heading: string
): string[] {
  const startIndex = description.findIndex((entry) => entry.includes(heading));

  if (startIndex < 0) {
    return [];
  }

  const section: string[] = [];

  for (let index = startIndex; index < description.length; index += 1) {
    const entry = description[index]!;

    if (index > startIndex && entry.startsWith("<strong>")) {
      break;
    }

    section.push(entry);
  }

  return section;
}

const frigidExplorerDescription = getRangerWinterWalkerFeatureDescriptionEntries(
  CLASS_FEATURE.FRIGID_EXPLORER
);
const huntersRimeDescription = getRangerWinterWalkerFeatureDescriptionEntries(
  CLASS_FEATURE.HUNTERS_RIME
);
const fortifyingSoulDescription = getRangerWinterWalkerFeatureDescriptionEntries(
  CLASS_FEATURE.FORTIFYING_SOUL
);
const chillingRetributionDescription = getRangerWinterWalkerFeatureDescriptionEntries(
  CLASS_FEATURE.CHILLING_RETRIBUTION
);
const frozenHauntDescription = getRangerWinterWalkerFeatureDescriptionEntries(
  CLASS_FEATURE.FROZEN_HAUNT
);
const bitingColdDescription = extractFeatureDescriptionSection(
  frigidExplorerDescription,
  "<strong>Biting Cold.</strong>"
);
const bitingColdHunterMarkDescription = bitingColdDescription.slice(0, 1);
const polarStrikesDescription = extractFeatureDescriptionSection(
  frigidExplorerDescription,
  "<strong>Polar Strikes.</strong>"
);
const chillingRetributionReactionEntry: ReactionEntry = {
  id: chillingRetributionReactionId,
  reaction: REACTION.CHILLING_RETRIBUTION,
  name: chillingRetributionReactionName,
  sourceType: "feature",
  sourceFeature: CLASS_FEATURE.CHILLING_RETRIBUTION,
  sourceLabel: "Winter Walker",
  description: [...chillingRetributionDescription]
};
const frozenHauntImmunityValues = [
  DAMAGE_TYPE.COLD,
  CONDITION_NAME.GRAPPLED,
  CONDITION_NAME.PRONE,
  CONDITION_NAME.RESTRAINED
] as const;

function isRangerWinterWalker(character: RangerWinterWalkerCharacter): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === winterWalkerSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function getWisdomModifier(
  character: Partial<Pick<Character, "abilities" | "feats" | "level">>
): number {
  return getRangerFeatAdjustedWisdomModifier(character);
}

function getFortifyingSoulTargetCount(character: RangerWinterWalkerCharacter): number {
  return Math.max(1, getWisdomModifier(character));
}

function getPolarStrikesDamageFormula(character: RangerWinterWalkerCharacter): string | null {
  if (!hasRangerWinterWalkerFrigidExplorerFeature(character)) {
    return null;
  }

  return (character.level ?? 0) >= 11 ? "1d6" : "1d4";
}

function createPolarStrikesDamageBonus(
  character: RangerWinterWalkerCharacter
): FeatureDamageBonus | null {
  const damageFormula = getPolarStrikesDamageFormula(character);

  if (damageFormula === null) {
    return null;
  }

  return {
    label: polarStrikesLabel,
    formula: damageFormula,
    displayLabel: `${damageFormula} Cold`
  };
}

function appendPolarStrikesDescription(action: WeaponAction): WeaponAction {
  if (
    action.attackKind !== "weapon" ||
    polarStrikesDescription.length <= 0 ||
    descriptionValueSomeText(action, (entry) => entry.includes("<strong>Polar Strikes.</strong>"))
  ) {
    return action;
  }

  return appendDescriptionAddition(action, polarStrikesDescription);
}

function appendBitingColdWeaponDescription(action: WeaponAction): WeaponAction {
  if (
    action.attackKind !== "weapon" ||
    bitingColdDescription.length <= 0 ||
    descriptionValueSomeText(action, (entry) => entry.includes("<strong>Biting Cold.</strong>"))
  ) {
    return action;
  }

  return appendDescriptionAddition(action, bitingColdDescription);
}

function appendBitingColdSpellDescription(
  character: RangerWinterWalkerCharacter,
  spell: SpellEntry
): SpellEntry {
  if (spell.id !== huntersMarkSpellId || bitingColdHunterMarkDescription.length <= 0) {
    return spell;
  }

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.FRIGID_EXPLORER,
    bitingColdHunterMarkDescription,
    bitingColdName
  );
}

function hasPolarStrikesAction(action: PolarStrikesAction | null): boolean {
  return action?.attackKind === "weapon";
}

function getRangerWinterWalkerDerivedStatusEntries(
  character: RangerWinterWalkerCharacter
): DerivedFeatureStatusEntry[] {
  if (!hasRangerWinterWalkerFrigidExplorerFeature(character)) {
    return [];
  }

  return [
    {
      id: rangerWinterWalkerColdResistanceSourceId,
      sourceId: rangerWinterWalkerColdResistanceSourceId,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.COLD,
      source: frostResistanceName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    },
    {
      id: rangerWinterWalkerBitingColdStatusSourceId,
      sourceId: rangerWinterWalkerBitingColdStatusSourceId,
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: bitingColdName,
      source: bitingColdName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

export function hasRangerWinterWalkerFrigidExplorerFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return isRangerWinterWalker(character);
}

export function hasRangerWinterWalkerHuntersRimeFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return isRangerWinterWalker(character);
}

export function getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormula(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string | null {
  if (!hasRangerWinterWalkerHuntersRimeFeature(character)) {
    return null;
  }

  return `1d10 + ${Math.max(1, character.level ?? 0)}`;
}

export function getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplay(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string | null {
  if (!hasRangerWinterWalkerHuntersRimeFeature(character)) {
    return null;
  }

  return formatFormulaTerms([
    "1d10",
    formatSignedFormulaTerm(Math.max(1, character.level ?? 0), "Ranger level")
  ]);
}

export function getRangerWinterWalkerHuntersRimeTemporaryHitPointsFacts(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): FeatureActionFact[] {
  const formula = getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormula(character);
  const formulaDisplay =
    getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplay(character);

  if (!formula || !formulaDisplay) {
    return [];
  }

  const formulaCell = formatFormulaCell({
    formula,
    displayTerms: [formulaDisplay],
    resultLabel: "Temp HP",
    minimumValue: 1
  });

  return [
    {
      label: "Temporary Hit Points Formula",
      value: formulaCell.value,
      breakdown: formulaCell.breakdown,
      fullWidth: true
    }
  ];
}

export function getRangerWinterWalkerFortifyingSoulHealingFormula(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string | null {
  if (!hasRangerWinterWalkerFortifyingSoulFeature(character)) {
    return null;
  }

  return `1d10 + ${Math.max(1, character.level ?? 0)}`;
}

export function getRangerWinterWalkerFortifyingSoulHealingFormulaDisplay(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): string | null {
  if (!hasRangerWinterWalkerFortifyingSoulFeature(character)) {
    return null;
  }

  return formatFormulaTerms([
    "1d10",
    formatSignedFormulaTerm(Math.max(1, character.level ?? 0), "Ranger level")
  ]);
}

export function getRangerWinterWalkerFortifyingSoulHealingFacts(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): FeatureActionFact[] {
  const formula = getRangerWinterWalkerFortifyingSoulHealingFormula(character);
  const formulaDisplay = getRangerWinterWalkerFortifyingSoulHealingFormulaDisplay(character);

  if (!formula || !formulaDisplay) {
    return [];
  }

  const formulaCell = formatFormulaCell({
    formula,
    displayTerms: [formulaDisplay],
    resultLabel: "Heal",
    minimumValue: 1
  });

  return [
    {
      label: "Healing Formula",
      value: formulaCell.value,
      breakdown: formulaCell.breakdown,
      fullWidth: true
    }
  ];
}

function hasRangerWinterWalkerSpellsFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return isRangerWinterWalker(character);
}

export function hasRangerWinterWalkerFortifyingSoulFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === winterWalkerSubclassId &&
    (character.level ?? 0) >= 7
  );
}

export function hasRangerWinterWalkerChillingRetributionFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === winterWalkerSubclassId &&
    (character.level ?? 0) >= 11
  );
}

export function hasRangerWinterWalkerFrozenHauntFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Ranger" &&
    character.subclassId === winterWalkerSubclassId &&
    (character.level ?? 0) >= 15
  );
}

export function getRangerWinterWalkerFortifyingSoulUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasRangerWinterWalkerFortifyingSoulFeature(character) ? 1 : 0;
}

export function getRangerWinterWalkerFortifyingSoulUsesRemaining(
  character: RangerWinterWalkerCharacter
): number {
  const usesTotal = getRangerWinterWalkerFortifyingSoulUsesTotal(character);
  const usesExpended = character.classFeatureState?.ranger?.fortifyingSoulUsesExpended ?? 0;

  return Math.max(0, usesTotal - usesExpended);
}

export function getRangerWinterWalkerChillingRetributionUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "feats" | "level" | "subclassId">>
): number {
  return hasRangerWinterWalkerChillingRetributionFeature(character)
    ? Math.max(1, getWisdomModifier(character))
    : 0;
}

export function getRangerWinterWalkerChillingRetributionUsesRemaining(
  character: RangerWinterWalkerCharacter
): number {
  const usesTotal = getRangerWinterWalkerChillingRetributionUsesTotal(character);
  const usesExpended = character.classFeatureState?.ranger?.chillingRetributionUsesExpended ?? 0;

  return Math.max(0, usesTotal - usesExpended);
}

export function getRangerWinterWalkerFrozenHauntUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasRangerWinterWalkerFrozenHauntFeature(character) ? 1 : 0;
}

export function getRangerWinterWalkerFrozenHauntUsesRemaining(
  character: RangerWinterWalkerCharacter
): number {
  const usesTotal = getRangerWinterWalkerFrozenHauntUsesTotal(character);
  const usesExpended = character.classFeatureState?.ranger?.frozenHauntUsesExpended ?? 0;

  return Math.max(0, usesTotal - usesExpended);
}

function canRangerWinterWalkerFrozenHauntModifySpell(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: Pick<SpellEntry, "id"> | null
): boolean {
  return hasRangerWinterWalkerFrozenHauntFeature(character) && spell?.id === huntersMarkSpellId;
}

export function getRangerWinterWalkerFrozenHauntFallbackSpellSlotLevels(
  spellSlotTotals: readonly number[],
  spellSlotsExpended: readonly number[]
): number[] {
  return Array.from(
    { length: Math.max(0, 10 - frozenHauntFallbackSpellSlotMinimumLevel) },
    (_, index) => {
      const slotLevel = index + frozenHauntFallbackSpellSlotMinimumLevel;
      const total = spellSlotTotals[slotLevel - 1] ?? 0;
      const expended = spellSlotsExpended[slotLevel - 1] ?? 0;

      return total - expended > 0 ? slotLevel : null;
    }
  ).filter((slotLevel): slotLevel is number => slotLevel !== null);
}

export function getRangerWinterWalkerFrozenHauntSpellOptionState(
  character: RangerWinterWalkerCharacter,
  spell: Pick<SpellEntry, "id"> | null,
  spellSlotTotals: readonly number[],
  spellSlotsExpended: readonly number[]
): RangerWinterWalkerFrozenHauntSpellOptionState | null {
  if (!canRangerWinterWalkerFrozenHauntModifySpell(character, spell)) {
    return null;
  }

  const usesTotal = getRangerWinterWalkerFrozenHauntUsesTotal(character);
  const usesRemaining = getRangerWinterWalkerFrozenHauntUsesRemaining(character);
  const fallbackSpellSlotLevels =
    usesRemaining > 0
      ? []
      : getRangerWinterWalkerFrozenHauntFallbackSpellSlotLevels(
          spellSlotTotals,
          spellSlotsExpended
        );
  const disabled = usesRemaining <= 0 && fallbackSpellSlotLevels.length <= 0;

  return {
    usesRemaining,
    usesTotal,
    fallbackSpellSlotLevels,
    disabled,
    disabledReason: disabled
      ? `No level ${frozenHauntFallbackSpellSlotMinimumLevel}+ spell slots remain for Frozen Haunt.`
      : undefined
  };
}

export function applyRangerWinterWalkerFrozenHauntStatusEntries(
  value: unknown
): CharacterStatusEntry[] {
  const frozenHauntEffectDuration = {
    kind: STATUS_DURATION_KIND.LINKED as const,
    linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
    linkedValue: EFFECT_NAME.CONCENTRATION
  };
  const frozenHauntImmunityDuration = {
    kind: STATUS_DURATION_KIND.LINKED as const,
    linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
    linkedValue: frozenHauntName
  };
  const nextEntries = [
    ...normalizeCharacterStatusEntries(value).filter(
      (entry) => entry.sourceId !== rangerWinterWalkerFrozenHauntStatusSourceId
    ),
    createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: frozenHauntName,
      source: frozenHauntName,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: frozenHauntEffectDuration,
      sourceId: rangerWinterWalkerFrozenHauntStatusSourceId
    }),
    ...frozenHauntImmunityValues.map((value) =>
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.IMMUNITIES,
        value,
        source: frozenHauntName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: frozenHauntImmunityDuration,
        sourceId: rangerWinterWalkerFrozenHauntStatusSourceId
      })
    )
  ];

  return removeCharacterConditionsForImmunities(
    nextEntries,
    nextEntries.filter((entry) => entry.group === STATUS_ENTRY_GROUP.IMMUNITIES)
  );
}

export function consumeRangerWinterWalkerFortifyingSoulUse(character: Character): Character {
  if (!hasRangerWinterWalkerFortifyingSoulFeature(character)) {
    return character;
  }

  const rangerState = character.classFeatureState?.ranger ?? {};
  const usesTotal = getRangerWinterWalkerFortifyingSoulUsesTotal(character);
  const usesExpended = rangerState.fortifyingSoulUsesExpended ?? 0;

  if (usesExpended >= usesTotal) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        fortifyingSoulUsesExpended: usesExpended + 1
      }
    }
  };
}

export function consumeRangerWinterWalkerChillingRetributionUse(character: Character): Character {
  if (!hasRangerWinterWalkerChillingRetributionFeature(character)) {
    return character;
  }

  const rangerState = character.classFeatureState?.ranger ?? {};
  const usesTotal = getRangerWinterWalkerChillingRetributionUsesTotal(character);
  const usesExpended = rangerState.chillingRetributionUsesExpended ?? 0;

  if (usesExpended >= usesTotal) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        chillingRetributionUsesExpended: usesExpended + 1
      }
    }
  };
}

export function consumeRangerWinterWalkerFrozenHauntUse(character: Character): Character {
  if (!hasRangerWinterWalkerFrozenHauntFeature(character)) {
    return character;
  }

  const rangerState = character.classFeatureState?.ranger ?? {};
  const usesTotal = getRangerWinterWalkerFrozenHauntUsesTotal(character);
  const usesExpended = rangerState.frozenHauntUsesExpended ?? 0;

  if (usesExpended >= usesTotal) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        frozenHauntUsesExpended: usesExpended + 1
      }
    }
  };
}

export function restoreRangerWinterWalkerFortifyingSoulOnLongRest(character: Character): Character {
  if (!hasRangerWinterWalkerFortifyingSoulFeature(character)) {
    return character;
  }

  const rangerState = character.classFeatureState?.ranger ?? {};

  if ((rangerState.fortifyingSoulUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        fortifyingSoulUsesExpended: 0
      }
    }
  };
}

export function restoreRangerWinterWalkerChillingRetributionOnLongRest(
  character: Character
): Character {
  if (!hasRangerWinterWalkerChillingRetributionFeature(character)) {
    return character;
  }

  const rangerState = character.classFeatureState?.ranger ?? {};

  if ((rangerState.chillingRetributionUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        chillingRetributionUsesExpended: 0
      }
    }
  };
}

export function restoreRangerWinterWalkerFrozenHauntOnLongRest(character: Character): Character {
  if (!hasRangerWinterWalkerFrozenHauntFeature(character)) {
    return character;
  }

  const rangerState = character.classFeatureState?.ranger ?? {};

  if ((rangerState.frozenHauntUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        frozenHauntUsesExpended: 0
      }
    }
  };
}

function getRangerWinterWalkerFeatureActions(
  character: RangerWinterWalkerCharacter
): FeatureActionCard[] {
  if (!hasRangerWinterWalkerFortifyingSoulFeature(character)) {
    return [];
  }

  const usesTotal = getRangerWinterWalkerFortifyingSoulUsesTotal(character);
  const usesRemaining = getRangerWinterWalkerFortifyingSoulUsesRemaining(character);
  const targetCount = getFortifyingSoulTargetCount(character);
  const healingFormula =
    getRangerWinterWalkerFortifyingSoulHealingFormulaDisplay(character) ??
    `1d10 + ${Math.max(1, character.level ?? 0)}`;
  const healingFacts = getRangerWinterWalkerFortifyingSoulHealingFacts(character);
  const creatureLabel = targetCount === 1 ? "creature" : "creatures";

  return [
    {
      key: fortifyingSoulActionKey,
      name: fortifyingSoulActionName,
      summary: `Heal up to ${targetCount} ${creatureLabel} and bolster them against fear.`,
      detail: `Choose up to ${targetCount} ${creatureLabel} you can see. Each regains ${healingFormula} Hit Points and gains Advantage on saves to avoid or end Frightened for 1 hour.`,
      breakdown: "Heal and bolster allies",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal,
      description: [...fortifyingSoulDescription],
      resources: [
        {
          kind: "tracker",
          label: "Uses",
          current: usesRemaining,
          total: usesTotal,
          supplementary: "Long Rest",
          cost: 1
        }
      ],
      drawer: {
        kind: "confirm",
        eyebrow: "Winter Walker",
        description: [...fortifyingSoulDescription],
        facts: healingFacts,
        factsSectionTitle: null,
        resources: [
          {
            kind: "tracker",
            label: "Uses",
            current: usesRemaining,
            total: usesTotal,
            supplementary: "Long Rest",
            cost: 1
          }
        ]
      },
      execute: {
        kind: "activate"
      },
      disabled: usesRemaining <= 0,
      disabledReason:
        usesRemaining <= 0 ? `${fortifyingSoulActionName} recharges on a Long Rest.` : undefined
    }
  ];
}

function getRangerWinterWalkerReactionEntries(
  character: RangerWinterWalkerCharacter
): ReactionEntry[] {
  return hasRangerWinterWalkerChillingRetributionFeature(character)
    ? [chillingRetributionReactionEntry]
    : [];
}

function appendHuntersRimeToFeatureAction(
  character: RangerWinterWalkerCharacter,
  action: FeatureActionCard
): FeatureActionCard {
  if (action.key !== favoredEnemyActionKey || huntersRimeDescription.length <= 0) {
    return action;
  }

  const nextAction =
    action.description?.length && action.description.length > 0
      ? action
      : {
          ...action,
          description: createDefaultFeatureActionDescription(action)
        };

  return appendFeatureSourcedDescriptionAddition(
    nextAction,
    character,
    CLASS_FEATURE.HUNTERS_RIME,
    huntersRimeDescription,
    huntersRimeSource
  );
}

function appendHuntersRimeSpellDescription(
  character: RangerWinterWalkerCharacter,
  spell: SpellEntry
): SpellEntry {
  if (spell.id !== huntersMarkSpellId || huntersRimeDescription.length <= 0) {
    return spell;
  }

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.HUNTERS_RIME,
    huntersRimeDescription,
    huntersRimeSource
  );
}

function appendFrozenHauntSpellDescription(
  character: RangerWinterWalkerCharacter,
  spell: SpellEntry
): SpellEntry {
  if (spell.id !== huntersMarkSpellId || frozenHauntDescription.length <= 0) {
    return spell;
  }

  return appendFeatureSourcedDescriptionAddition(
    spell,
    character,
    CLASS_FEATURE.FROZEN_HAUNT,
    frozenHauntDescription,
    frozenHauntName
  );
}

export function getRangerWinterWalkerPolarStrikesOptionState(
  character: RangerWinterWalkerCharacter,
  action: PolarStrikesAction | null
): RangerWinterWalkerPolarStrikesOptionState | null {
  if (!hasRangerWinterWalkerFrigidExplorerFeature(character) || !hasPolarStrikesAction(action)) {
    return null;
  }

  const damageBonus = createPolarStrikesDamageBonus(character);

  if (!damageBonus) {
    return null;
  }

  const usedThisTurn =
    character.classFeatureState?.ranger?.winterWalkerPolarStrikesUsedThisTurn === true;
  const disabledReason = usedThisTurn ? "Polar Strikes was already used this turn." : undefined;

  return {
    damageBonus,
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

export function consumeRangerWinterWalkerPolarStrikesUse(character: Character): Character {
  if (!hasRangerWinterWalkerFrigidExplorerFeature(character)) {
    return character;
  }

  const rangerState = character.classFeatureState?.ranger ?? {};

  if (rangerState.winterWalkerPolarStrikesUsedThisTurn === true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        winterWalkerPolarStrikesUsedThisTurn: true
      }
    }
  };
}

export const getRangerWinterWalkerDerivedFeatureState: SubclassRuntimeResolver = (character) =>
  character.className === "Ranger" && character.subclassId === winterWalkerSubclassId
    ? {
        alwaysPreparedSpellIds: hasRangerWinterWalkerSpellsFeature(character)
          ? getPreparedSpellIdsByLevel(character.level ?? 0, winterWalkerSpellIdsByLevel)
          : [],
        featureActions: getRangerWinterWalkerFeatureActions(character),
        derivedStatusEntries: getRangerWinterWalkerDerivedStatusEntries(character),
        reactionEntries: getRangerWinterWalkerReactionEntries(character),
        transformFeatureAction: hasRangerWinterWalkerHuntersRimeFeature(character)
          ? (action) => appendHuntersRimeToFeatureAction(character, action)
          : undefined,
        transformSpellEntry: hasRangerWinterWalkerFrigidExplorerFeature(character)
          ? (spell) => {
              const nextSpell = appendHuntersRimeSpellDescription(
                character,
                appendBitingColdSpellDescription(character, spell)
              );

              return hasRangerWinterWalkerFrozenHauntFeature(character)
                ? appendFrozenHauntSpellDescription(character, nextSpell)
                : nextSpell;
            }
          : undefined,
        transformWeaponAction: hasRangerWinterWalkerFrigidExplorerFeature(character)
          ? (action) => appendPolarStrikesDescription(appendBitingColdWeaponDescription(action))
          : undefined
      }
    : {};
