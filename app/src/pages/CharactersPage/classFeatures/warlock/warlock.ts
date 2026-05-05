import {
  FEAT_CATEGORY,
  SPELL_LIST_CLASS,
  CLASS_FEATURE,
  ELDRITCH_INVOCATION,
  getEldritchInvocationEntries,
  getEldritchInvocationEntryById,
  getSpellEntryById,
  type EldritchInvocationEntry,
  type FEATS,
  type SpellEntry
} from "../../../../codex/entries";
import {
  getSpellEntriesForClassName,
  warlockFeatures,
  type WarlockFeatureClassObj
} from "../../../../codex/classes";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import { createFeatureSourcedDescriptionEntries } from "../../actionModalDescriptions";
import { getAbilityModifierForCharacter } from "../../abilities";
import { getFeatDefinitionsByCategory } from "../../feats";
import type { Character, CharacterWarlockFeatureState } from "../../../../types";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../spellcasting";
import { mageArmorSpellId } from "../../characterRuntime/spellImplementations";
import type { FeatureActionCard, FeatureDamageBonus, SpellFeatureContext } from "../types";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";
import {
  beguilingDefenseReactionId,
  consumeWarlockArchfeyPatronBeguilingDefenseUse,
  getWarlockArchfeyPatronBeguilingDefenseUsesRemaining,
  getWarlockArchfeyPatronBeguilingDefenseUsesTotal,
  consumeWarlockArchfeyPatronStepsOfTheFeyUse,
  getWarlockArchfeyPatronFeatureReactionSpellDefinition,
  getWarlockArchfeyPatronStepsOfTheFeyUsesRemaining,
  getWarlockArchfeyPatronStepsOfTheFeyUsesTotal,
  restoreWarlockArchfeyPatronBeguilingDefenseOnLongRest,
  restoreWarlockArchfeyPatronStepsOfTheFeyOnLongRest
} from "./subclasses/warlockArchfeyPatron";
import {
  advanceWarlockCelestialPatronFeaturesForNewRound,
  applyWarlockCelestialPatronCelestialResilienceTemporaryHitPoints,
  applyWarlockCelestialPatronFeaturesAfterSpellCast,
  applyWarlockCelestialPatronFeaturesOnLongRest,
  applyWarlockCelestialPatronFeaturesOnShortRest,
  consumeWarlockCelestialPatronSearingVengeanceUse,
  expendWarlockCelestialPatronHealingLightDie,
  getWarlockCelestialPatronCelestialResilienceTemporaryHitPoints,
  getWarlockCelestialPatronHealingLightDiceRemaining,
  getWarlockCelestialPatronHealingLightDiceTotal,
  getWarlockCelestialPatronHealingLightMaxSpend,
  getWarlockCelestialPatronSearingVengeanceUsesRemaining,
  getWarlockCelestialPatronSearingVengeanceUsesTotal,
  restoreAllWarlockCelestialPatronHealingLightDice,
  restoreWarlockCelestialPatronHealingLightDie,
  restoreWarlockCelestialPatronHealingLightOnLongRest,
  restoreWarlockCelestialPatronSearingVengeanceOnLongRest,
  searingVengeanceActionKey,
  spendWarlockCelestialPatronHealingLightDice
} from "./subclasses/warlockCelestialPatron";
import {
  applyWarlockFiendPatronDarkOnesBlessing,
  consumeWarlockFiendPatronDarkOnesOwnLuckUse,
  consumeWarlockFiendPatronHurlThroughHellUse,
  darkOnesBlessingActionKey,
  darkOnesOwnLuckActionKey,
  getWarlockFiendPatronFiendishResilienceDamageTypeSelection,
  getWarlockFiendPatronDarkOnesOwnLuckUsesRemaining,
  getWarlockFiendPatronDarkOnesOwnLuckUsesTotal,
  getWarlockFiendPatronHurlThroughHellUsesRemaining,
  getWarlockFiendPatronHurlThroughHellUsesTotal,
  hurlThroughHellActionKey,
  restoreWarlockFiendPatronDarkOnesOwnLuckOnLongRest,
  restoreWarlockFiendPatronHurlThroughHellOnLongRest,
  setWarlockFiendPatronFiendishResilienceDamageTypeSelection,
  warlockFiendPatronFiendishResilienceDamageTypeOptions
} from "./subclasses/warlockFiendPatron";
import {
  activateWarlockGreatOldOnePatronAwakenedMind,
  getWarlockGreatOldOnePatronClairvoyantCombatantUsesRemaining,
  getWarlockGreatOldOnePatronClairvoyantCombatantUsesTotal,
  restoreWarlockGreatOldOnePatronClairvoyantCombatantOnLongRest,
  restoreWarlockGreatOldOnePatronClairvoyantCombatantOnShortRest,
  type ActivateWarlockGreatOldOnePatronAwakenedMindOptions
} from "./subclasses/warlockGreatOldOnePatron";
import {
  activateWarlockSubclassFeatureAction,
  normalizeWarlockSubclassFeatureState,
  restoreWarlockSubclassFeaturesOnShortRest,
  restoreWarlockSubclassFeaturesOnLongRest
} from "./subclasses";

const invocationSelectionSeparator = "::";
const placeholderSelectionSuffix = "placeholder";
const magicalCunningUsesTotal = 1;
const contactPatronUsesTotal = 1;
const contactOtherPlaneSpellId = "spell-contact-other-plane";
const mysticArcanumActionSummary = "Cast your chosen arcanum spells without spell slots.";
const mysticArcanumActionDetail =
  "Open your chosen Mystic Arcanum spells and cast each of them once per Long Rest.";

export const magicalCunningActionKey = "warlock-magical-cunning";
export const armorOfShadowsActionKey = "warlock-armor-of-shadows";
export const contactPatronActionKey = "warlock-contact-patron";
export const mysticArcanumActionKey = "warlock-mystic-arcanum";
export {
  darkOnesBlessingActionKey,
  darkOnesOwnLuckActionKey,
  hurlThroughHellActionKey,
  searingVengeanceActionKey
};
export { warlockFiendPatronFiendishResilienceDamageTypeOptions };

export type MysticArcanumLevel = 6 | 7 | 8 | 9;

type MysticArcanumSpellIdMap = Partial<Record<MysticArcanumLevel, string>>;

export type WarlockMysticArcanumSelection = {
  spellLevel: MysticArcanumLevel;
  spellId: string | null;
  spell: SpellEntry | null;
  expended: boolean;
};

const mysticArcanumDefinitions = [
  { warlockLevel: 11, spellLevel: 6 },
  { warlockLevel: 13, spellLevel: 7 },
  { warlockLevel: 15, spellLevel: 8 },
  { warlockLevel: 17, spellLevel: 9 }
] as const;

export type WarlockEldritchInvocationOption = {
  selectionId: string;
  invocation: EldritchInvocationEntry;
  displayName: string;
  displaySubtitle: string | null;
  requirementLabel: string;
  isQualified: boolean;
  isPlaceholder: boolean;
};

export type WarlockEldritchInvocationInputStatus = {
  hasInputRequired: boolean;
  selectedCount: number;
  limit: number;
  message: string | null;
};

type WarlockInvocationCharacter = Pick<Character, "className" | "level"> &
  Partial<
    Pick<Character, "abilities" | "cantripIds" | "classFeatureState" | "feats" | "subclassId">
  >;

function isMysticArcanumLevel(value: number): value is MysticArcanumLevel {
  return value === 6 || value === 7 || value === 8 || value === 9;
}

function clampWarlockLevel(level: number): number {
  return Math.max(1, Math.min(20, Math.floor(level)));
}

function getWarlockFeatureRow(level: number): WarlockFeatureClassObj | null {
  const normalizedLevel = clampWarlockLevel(level);
  const matchingRows = warlockFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? (matchingRows[matchingRows.length - 1] ?? null) : null;
}

function getUnlockedWarlockFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = clampWarlockLevel(level);

  return warlockFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

function createSelectionId(invocationId: ELDRITCH_INVOCATION, choiceValue?: string): string {
  return choiceValue
    ? `${invocationId}${invocationSelectionSeparator}${choiceValue}`
    : invocationId;
}

function parseSelectionId(selectionId: string): {
  invocationId: ELDRITCH_INVOCATION | null;
  choiceValue: string | null;
} {
  const [rawInvocationId, rawChoiceValue] = selectionId.split(invocationSelectionSeparator);

  if (!rawInvocationId || !getEldritchInvocationEntryById(rawInvocationId)) {
    return {
      invocationId: null,
      choiceValue: null
    };
  }

  return {
    invocationId: rawInvocationId as ELDRITCH_INVOCATION,
    choiceValue: rawChoiceValue ?? null
  };
}

function getWarlockFeatureState(
  character: WarlockInvocationCharacter
): CharacterWarlockFeatureState {
  return normalizeWarlockFeatureState(character.classFeatureState?.warlock, character);
}

function getUnlockedMysticArcanumLevels(
  character: Pick<Character, "className" | "level">
): MysticArcanumLevel[] {
  if (!hasWarlockFeature(character, CLASS_FEATURE.MYSTIC_ARCANUM)) {
    return [];
  }

  return mysticArcanumDefinitions
    .filter((definition) => clampWarlockLevel(character.level) >= definition.warlockLevel)
    .map((definition) => definition.spellLevel);
}

function getWarlockPactMagicSlotLevel(character: Pick<Character, "className" | "level">): number {
  if (!hasWarlockFeature(character, CLASS_FEATURE.PACT_MAGIC)) {
    return 0;
  }

  return getWarlockFeatureRow(character.level)?.slotLevel ?? 0;
}

export function getWarlockPactMagicSlotTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasWarlockFeature(character, CLASS_FEATURE.PACT_MAGIC)) {
    return 0;
  }

  const slotLevel = getWarlockPactMagicSlotLevel(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  return slotLevel > 0 ? (spellSlotTotals[slotLevel - 1] ?? 0) : 0;
}

export function getWarlockPactMagicSlotsExpended(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): number {
  const slotLevel = getWarlockPactMagicSlotLevel(character);

  if (slotLevel <= 0) {
    return 0;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );

  return spellSlotsExpended[slotLevel - 1] ?? 0;
}

function getWarlockKnownCantripEntries(
  character: Partial<Pick<Character, "cantripIds">>
): SpellEntry[] {
  const rawIds = Array.isArray(character.cantripIds)
    ? character.cantripIds.filter((entry): entry is string => typeof entry === "string")
    : [];

  return [...new Set(rawIds)]
    .map((spellId) => getSpellEntryById(spellId))
    .filter(
      (spell): spell is SpellEntry =>
        spell !== null &&
        spell.spellLevel === 0 &&
        spell.spellLists.includes(SPELL_LIST_CLASS.WARLOCK)
    );
}

function getSpellRangeFeet(spell: Pick<SpellEntry, "range">): number | null {
  const match = spell.range.match(/(\d+)\s*feet\b/i);

  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function getEligibleWarlockCantripEntries(
  character: Partial<Pick<Character, "cantripIds">>,
  rule: "damaging" | "damaging-range-10" | "damaging-attack-roll"
): SpellEntry[] {
  return getWarlockKnownCantripEntries(character).filter((spell) => {
    const dealsDamage = spell.damage.length > 0;

    if (!dealsDamage) {
      return false;
    }

    if (rule === "damaging") {
      return true;
    }

    if (rule === "damaging-range-10") {
      return (getSpellRangeFeet(spell) ?? 0) >= 10;
    }

    return spell.isAttackSpell === true;
  });
}

function getRequirementLabels(invocation: EldritchInvocationEntry): string[] {
  const requirementLabels = (invocation.prerequisites ?? []).map((requirement) => {
    if (requirement.type === "warlock-level") {
      return `Level ${requirement.minimumLevel}+ Warlock`;
    }

    return getEldritchInvocationEntryById(requirement.invocation)?.name ?? "Missing invocation";
  });

  if (invocation.selection?.kind === "warlock-cantrip") {
    if (invocation.selection.rule === "damaging") {
      requirementLabels.push("Damaging Warlock cantrip");
    } else if (invocation.selection.rule === "damaging-range-10") {
      requirementLabels.push("Damaging Warlock cantrip, 10+ ft");
    } else {
      requirementLabels.push("Warlock cantrip via attack roll");
    }
  }

  if (invocation.selection?.kind === "origin-feat") {
    requirementLabels.push("Origin feat choice");
  }

  return requirementLabels.length > 0 ? requirementLabels : ["No prerequisite"];
}

function getSelectedInvocationBaseCounts(selectionIds: string[]): Map<ELDRITCH_INVOCATION, number> {
  return selectionIds.reduce((counts, selectionId) => {
    const { invocationId } = parseSelectionId(selectionId);

    if (!invocationId) {
      return counts;
    }

    counts.set(invocationId, (counts.get(invocationId) ?? 0) + 1);
    return counts;
  }, new Map<ELDRITCH_INVOCATION, number>());
}

function meetsInvocationPrerequisites(
  invocation: EldritchInvocationEntry,
  character: Pick<Character, "level">,
  selectedBaseInvocations: Set<ELDRITCH_INVOCATION>
): boolean {
  return (invocation.prerequisites ?? []).every((requirement) => {
    if (requirement.type === "warlock-level") {
      return clampWarlockLevel(character.level) >= requirement.minimumLevel;
    }

    return selectedBaseInvocations.has(requirement.invocation);
  });
}

function getChoiceLabelForSpell(spell: SpellEntry): string {
  return spell.name;
}

function getChoiceLabelForOriginFeat(feat: { label: string }): string {
  return `Origin feat: ${feat.label}`;
}

function getOriginFeatDefinitions() {
  return getFeatDefinitionsByCategory()[FEAT_CATEGORY.ORIGIN];
}

function createPlaceholderOption(
  invocation: EldritchInvocationEntry,
  subtitle: string
): WarlockEldritchInvocationOption {
  return {
    selectionId: createSelectionId(invocation.id, placeholderSelectionSuffix),
    invocation,
    displayName: invocation.name,
    displaySubtitle: subtitle,
    requirementLabel: getRequirementLabels(invocation).join(" • "),
    isQualified: false,
    isPlaceholder: true
  };
}

function getInvocationDependencyDepth(
  invocationId: ELDRITCH_INVOCATION,
  visitedInvocationIds = new Set<ELDRITCH_INVOCATION>()
): number {
  if (visitedInvocationIds.has(invocationId)) {
    return 0;
  }

  const invocation = getEldritchInvocationEntryById(invocationId);
  const dependencyIds = (invocation?.prerequisites ?? [])
    .map((requirement) => (requirement.type === "invocation" ? requirement.invocation : null))
    .filter((dependencyId): dependencyId is ELDRITCH_INVOCATION => dependencyId !== null);

  if (dependencyIds.length === 0) {
    return 0;
  }

  const nextVisitedInvocationIds = new Set(visitedInvocationIds).add(invocationId);

  return Math.max(
    ...dependencyIds.map(
      (dependencyId) => 1 + getInvocationDependencyDepth(dependencyId, nextVisitedInvocationIds)
    )
  );
}

function sortSelectionIdsForNormalization(selectionIds: string[]): string[] {
  return selectionIds
    .map((selectionId, index) => {
      const { invocationId } = parseSelectionId(selectionId);
      const dependencyDepth = invocationId ? getInvocationDependencyDepth(invocationId) : 0;

      return {
        selectionId,
        dependencyDepth,
        index
      };
    })
    .sort((left, right) =>
      left.dependencyDepth === right.dependencyDepth
        ? left.index - right.index
        : left.dependencyDepth - right.dependencyDepth
    )
    .map((entry) => entry.selectionId);
}

function normalizeWarlockInvocationSelectionIdsForState(
  character: WarlockInvocationCharacter,
  selectionIds: string[]
): string[] {
  const limit = getWarlockEldritchInvocationLimit(character);
  const candidateSelectionIds = [...new Set(sortSelectionIdsForNormalization(selectionIds))];
  const optionMap = new Map(
    getWarlockInvocationOptions(character, candidateSelectionIds).map((option) => [
      option.selectionId,
      option
    ])
  );
  const acceptedSelectionIds: string[] = [];
  const acceptedBaseInvocationIds = new Set<ELDRITCH_INVOCATION>();

  for (const selectionId of candidateSelectionIds) {
    if (acceptedSelectionIds.length >= limit) {
      break;
    }

    const option = optionMap.get(selectionId);
    const { invocationId } = parseSelectionId(selectionId);

    if (!option || !invocationId || option.isPlaceholder || !option.isQualified) {
      continue;
    }

    if (!meetsInvocationPrerequisites(option.invocation, character, acceptedBaseInvocationIds)) {
      continue;
    }

    acceptedSelectionIds.push(selectionId);
    acceptedBaseInvocationIds.add(invocationId);
  }

  return acceptedSelectionIds;
}

export function hasWarlockFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Warlock") {
    return false;
  }

  return getUnlockedWarlockFeatures(character.level).has(feature);
}

export function getWarlockEldritchInvocationLimit(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasWarlockFeature(character, CLASS_FEATURE.ELDRITCH_INVOCATIONS)) {
    return 0;
  }

  return Math.max(0, getWarlockFeatureRow(character.level)?.eldritchInvocations ?? 0);
}

export function getWarlockInvocationSelectionIds(character: WarlockInvocationCharacter): string[] {
  return getWarlockFeatureState(character).eldritchInvocationIds ?? [];
}

export function normalizeWarlockInvocationSelectionIds(
  character: WarlockInvocationCharacter,
  selectionIds: string[]
): string[] {
  if (character.className !== "Warlock") {
    return [];
  }

  return normalizeWarlockInvocationSelectionIdsForState(character, selectionIds);
}

export function getWarlockMysticArcanumSpellOptions(
  character: Pick<Character, "className" | "level">,
  spellLevel: MysticArcanumLevel
): SpellEntry[] {
  if (!getUnlockedMysticArcanumLevels(character).includes(spellLevel)) {
    return [];
  }

  return getSpellEntriesForClassName("Warlock")
    .filter((spell) => spell.spellLevel === spellLevel)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getWarlockMysticArcanumSpellId(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">,
  spellLevel: MysticArcanumLevel
): string | null {
  const spellId = getWarlockFeatureState(character).mysticArcanumSpellIds?.[spellLevel];
  return typeof spellId === "string" && spellId.length > 0 ? spellId : null;
}

export function getWarlockMysticArcanumSelections(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "cantripIds" | "feats">
): WarlockMysticArcanumSelection[] {
  const unlockedLevels = getUnlockedMysticArcanumLevels(character);
  const expendedLevels = new Set(
    getWarlockFeatureState(character).mysticArcanumExpendedLevels ?? []
  );

  return unlockedLevels.map((spellLevel) => {
    const spellId = getWarlockMysticArcanumSpellId(character, spellLevel);
    const spell = spellId ? getSpellEntryById(spellId) : null;

    return {
      spellLevel,
      spellId,
      spell,
      expended: expendedLevels.has(spellLevel)
    };
  });
}

export function getWarlockMagicalCunningUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  return hasWarlockFeature(character, CLASS_FEATURE.MAGICAL_CUNNING) ? magicalCunningUsesTotal : 0;
}

export function getWarlockMagicalCunningUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getWarlockMagicalCunningUsesTotal(character);

  if (totalUses <= 0) {
    return 0;
  }

  const usesExpended = getWarlockFeatureState(character).magicalCunningUsesExpended ?? 0;
  return Math.max(0, totalUses - usesExpended);
}

export function getContactPatronUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  return hasWarlockFeature(character, CLASS_FEATURE.CONTACT_PATRON) ? contactPatronUsesTotal : 0;
}

export function getContactPatronUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getContactPatronUsesTotal(character);

  if (totalUses <= 0) {
    return 0;
  }

  const usesExpended = getWarlockFeatureState(character).contactPatronUsesExpended ?? 0;
  return Math.max(0, totalUses - usesExpended);
}

export function getWarlockInvocationOptions(
  character: WarlockInvocationCharacter,
  selectedIds: string[] = getWarlockInvocationSelectionIds(character)
): WarlockEldritchInvocationOption[] {
  if (!hasWarlockFeature(character, CLASS_FEATURE.ELDRITCH_INVOCATIONS)) {
    return [];
  }

  const selectedBaseInvocations = new Set(
    selectedIds
      .map((selectionId) => parseSelectionId(selectionId).invocationId)
      .filter((invocationId): invocationId is ELDRITCH_INVOCATION => invocationId !== null)
  );

  return getEldritchInvocationEntries().flatMap((invocation) => {
    const baseQualified = meetsInvocationPrerequisites(
      invocation,
      character,
      selectedBaseInvocations
    );
    const requirementLabel = getRequirementLabels(invocation).join(" • ");

    if (invocation.selection?.kind === "warlock-cantrip") {
      const eligibleCantrips = getEligibleWarlockCantripEntries(
        character,
        invocation.selection.rule
      );

      if (eligibleCantrips.length === 0) {
        return [createPlaceholderOption(invocation, "No eligible Warlock cantrip known")];
      }

      return eligibleCantrips
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((spell) => ({
          selectionId: createSelectionId(invocation.id, spell.id),
          invocation,
          displayName: invocation.name,
          displaySubtitle: getChoiceLabelForSpell(spell),
          requirementLabel,
          isQualified: baseQualified,
          isPlaceholder: false
        }));
    }

    if (invocation.selection?.kind === "origin-feat") {
      return getOriginFeatDefinitions()
        .slice()
        .sort((left, right) => left.label.localeCompare(right.label))
        .map((definition) => ({
          selectionId: createSelectionId(invocation.id, definition.feat),
          invocation,
          displayName: invocation.name,
          displaySubtitle: getChoiceLabelForOriginFeat(definition),
          requirementLabel,
          isQualified: baseQualified,
          isPlaceholder: false
        }));
    }

    return [
      {
        selectionId: createSelectionId(invocation.id),
        invocation,
        displayName: invocation.name,
        displaySubtitle: null,
        requirementLabel,
        isQualified: baseQualified,
        isPlaceholder: false
      }
    ];
  });
}

export function getWarlockLearnedInvocationOptions(
  character: WarlockInvocationCharacter
): WarlockEldritchInvocationOption[] {
  const selectedIds = getWarlockInvocationSelectionIds(character);
  const optionMap = new Map(
    getWarlockInvocationOptions(character, selectedIds).map((option) => [
      option.selectionId,
      option
    ])
  );

  return selectedIds
    .map((selectionId) => optionMap.get(selectionId))
    .filter((option): option is WarlockEldritchInvocationOption => Boolean(option));
}

function getWarlockAgonizingBlastCantripIds(character: WarlockInvocationCharacter): Set<string> {
  return new Set(
    getWarlockInvocationSelectionIds(character)
      .map(parseSelectionId)
      .filter(
        (
          selection
        ): selection is {
          invocationId: typeof ELDRITCH_INVOCATION.AGONIZING_BLAST;
          choiceValue: string;
        } =>
          selection.invocationId === ELDRITCH_INVOCATION.AGONIZING_BLAST &&
          typeof selection.choiceValue === "string" &&
          selection.choiceValue.length > 0
      )
      .map((selection) => selection.choiceValue)
  );
}

export function getWarlockSpellDamageBonuses(
  character: WarlockInvocationCharacter,
  { spell }: SpellFeatureContext
): FeatureDamageBonus[] {
  if (
    character.className !== "Warlock" ||
    spell.spellLevel !== 0 ||
    spell.damage.length === 0 ||
    !getWarlockAgonizingBlastCantripIds(character).has(spell.id)
  ) {
    return [];
  }

  const charismaModifier = getAbilityModifierForCharacter(character, "CHA");

  return charismaModifier === 0
    ? []
    : [
        {
          label: "Agonizing Blast",
          value: charismaModifier,
          abilityModifierSource: "CHA"
        }
      ];
}

export function getWarlockEldritchInvocationInputStatus(
  character: WarlockInvocationCharacter
): WarlockEldritchInvocationInputStatus {
  const limit = getWarlockEldritchInvocationLimit(character);
  const selectedIds = getWarlockInvocationSelectionIds(character);
  const hasRemainingQualifiedInvocationOption =
    limit > 0 &&
    selectedIds.length < limit &&
    getWarlockInvocationOptions(character, selectedIds).some(
      (option) =>
        option.isQualified &&
        !option.isPlaceholder &&
        !selectedIds.includes(option.selectionId)
    );
  const hasInputRequired =
    limit > 0 && selectedIds.length < limit && hasRemainingQualifiedInvocationOption;
  const remainingCount = Math.max(0, limit - selectedIds.length);

  return {
    hasInputRequired,
    selectedCount: selectedIds.length,
    limit,
    message: hasInputRequired
      ? `Input required: choose ${remainingCount} more eldritch invocation${
          remainingCount === 1 ? "" : "s"
        }.`
      : null
  };
}

export function getWarlockInvocationBlockingSelectionNames(
  selectionId: string,
  selectedIds: string[]
): string[] {
  const { invocationId } = parseSelectionId(selectionId);

  if (!invocationId) {
    return [];
  }

  const selectedBaseCounts = getSelectedInvocationBaseCounts(selectedIds);

  if ((selectedBaseCounts.get(invocationId) ?? 0) > 1) {
    return [];
  }

  const blockedByNames = selectedIds
    .filter((currentSelectionId) => currentSelectionId !== selectionId)
    .map((currentSelectionId) => parseSelectionId(currentSelectionId).invocationId)
    .filter((currentInvocationId): currentInvocationId is ELDRITCH_INVOCATION =>
      Boolean(currentInvocationId)
    )
    .flatMap((currentInvocationId) => {
      const invocation = getEldritchInvocationEntryById(currentInvocationId);

      if (
        !invocation ||
        !(invocation.prerequisites ?? []).some(
          (requirement) =>
            requirement.type === "invocation" && requirement.invocation === invocationId
        )
      ) {
        return [];
      }

      return [invocation.name];
    });

  return [...new Set(blockedByNames)];
}

export function normalizeWarlockFeatureState(
  value: unknown,
  character: WarlockInvocationCharacter
): CharacterWarlockFeatureState {
  if (!hasWarlockFeature(character, CLASS_FEATURE.ELDRITCH_INVOCATIONS)) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterWarlockFeatureState>) : {};
  const rawSelectionIds = Array.isArray(record.eldritchInvocationIds)
    ? record.eldritchInvocationIds.filter(
        (selectionId): selectionId is string => typeof selectionId === "string"
      )
    : [];
  const normalizedSelectionIds = normalizeWarlockInvocationSelectionIdsForState(
    character,
    rawSelectionIds
  );

  const totalMagicalCunningUses = getWarlockMagicalCunningUsesTotal(character);
  const rawMagicalCunningUsesExpended = Number(record.magicalCunningUsesExpended);
  const magicalCunningUsesExpended =
    totalMagicalCunningUses > 0 && Number.isFinite(rawMagicalCunningUsesExpended)
      ? Math.max(0, Math.min(totalMagicalCunningUses, Math.floor(rawMagicalCunningUsesExpended)))
      : undefined;
  const totalContactPatronUses = getContactPatronUsesTotal(character);
  const rawContactPatronUsesExpended = Number(record.contactPatronUsesExpended);
  const contactPatronUsesExpended =
    totalContactPatronUses > 0 && Number.isFinite(rawContactPatronUsesExpended)
      ? Math.max(0, Math.min(totalContactPatronUses, Math.floor(rawContactPatronUsesExpended)))
      : undefined;
  const unlockedMysticArcanumLevels = getUnlockedMysticArcanumLevels(character);
  const rawMysticArcanumSpellIds =
    record.mysticArcanumSpellIds && typeof record.mysticArcanumSpellIds === "object"
      ? (record.mysticArcanumSpellIds as MysticArcanumSpellIdMap)
      : {};
  const mysticArcanumSpellIds = unlockedMysticArcanumLevels.reduce<MysticArcanumSpellIdMap>(
    (selectionMap, spellLevel) => {
      const spellId = rawMysticArcanumSpellIds[spellLevel];
      const isValidSpell = getWarlockMysticArcanumSpellOptions(character, spellLevel).some(
        (spell) => spell.id === spellId
      );

      if (isValidSpell && spellId) {
        selectionMap[spellLevel] = spellId;
      }

      return selectionMap;
    },
    {}
  );
  const rawMysticArcanumExpendedLevels = Array.isArray(record.mysticArcanumExpendedLevels)
    ? record.mysticArcanumExpendedLevels
        .map((entry) => Number(entry))
        .filter((entry): entry is MysticArcanumLevel => isMysticArcanumLevel(entry))
    : [];
  const mysticArcanumExpendedLevels = rawMysticArcanumExpendedLevels.filter((spellLevel) =>
    unlockedMysticArcanumLevels.includes(spellLevel)
  );

  return {
    eldritchInvocationIds: normalizedSelectionIds,
    magicalCunningUsesExpended,
    contactPatronUsesExpended,
    mysticArcanumSpellIds,
    mysticArcanumExpendedLevels,
    ...normalizeWarlockSubclassFeatureState(record, character)
  };
}

export function getWarlockStepsOfTheFeyUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return getWarlockArchfeyPatronStepsOfTheFeyUsesTotal(character);
}

export function getWarlockStepsOfTheFeyUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): number {
  return getWarlockArchfeyPatronStepsOfTheFeyUsesRemaining(character);
}

export function getWarlockHealingLightDiceTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return getWarlockCelestialPatronHealingLightDiceTotal(character);
}

export function getWarlockHealingLightDiceRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): number {
  return getWarlockCelestialPatronHealingLightDiceRemaining(character);
}

export function getWarlockHealingLightMaxSpend(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return getWarlockCelestialPatronHealingLightMaxSpend(character);
}

export function getWarlockCelestialResilienceTemporaryHitPoints(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): number {
  return getWarlockCelestialPatronCelestialResilienceTemporaryHitPoints(character);
}

export function applyWarlockCelestialResilienceTemporaryHitPoints(character: Character): Character {
  return applyWarlockCelestialPatronCelestialResilienceTemporaryHitPoints(character);
}

export function getWarlockBeguilingDefenseUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getWarlockArchfeyPatronBeguilingDefenseUsesTotal(character);
}

export function getWarlockBeguilingDefenseUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): number {
  return getWarlockArchfeyPatronBeguilingDefenseUsesRemaining(character);
}

export function getWarlockClairvoyantCombatantUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getWarlockGreatOldOnePatronClairvoyantCombatantUsesTotal(character);
}

export function getWarlockClairvoyantCombatantUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): number {
  return getWarlockGreatOldOnePatronClairvoyantCombatantUsesRemaining(character);
}

export function getWarlockDarkOnesOwnLuckUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return getWarlockFiendPatronDarkOnesOwnLuckUsesTotal(character);
}

export function getWarlockDarkOnesOwnLuckUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "classFeatureState" | "level" | "subclassId">>
): number {
  return getWarlockFiendPatronDarkOnesOwnLuckUsesRemaining(character);
}

export function getWarlockHurlThroughHellUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "spellSlotsExpended" | "subclassId">>
): number {
  return getWarlockFiendPatronHurlThroughHellUsesTotal(character);
}

export function getWarlockHurlThroughHellUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "spellSlotsExpended" | "subclassId">>
): number {
  return getWarlockFiendPatronHurlThroughHellUsesRemaining(character);
}

export function getWarlockFiendishResilienceDamageTypeSelection(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return getWarlockFiendPatronFiendishResilienceDamageTypeSelection(character);
}

export function getWarlockSearingVengeanceUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return getWarlockCelestialPatronSearingVengeanceUsesTotal(character);
}

export function getWarlockSearingVengeanceUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): number {
  return getWarlockCelestialPatronSearingVengeanceUsesRemaining(character);
}

export function getWarlockFeatureReactionSpellDefinition(reactionEntryId: string) {
  return getWarlockArchfeyPatronFeatureReactionSpellDefinition(reactionEntryId);
}

export function getWarlockPactMagicSlotsRemaining(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): number {
  return Math.max(
    0,
    getWarlockPactMagicSlotTotal(character) - getWarlockPactMagicSlotsExpended(character)
  );
}

export function getWarlockAlwaysPreparedSpellIds(
  character: Pick<Character, "className" | "level">
): string[] {
  if (!hasWarlockFeature(character, CLASS_FEATURE.CONTACT_PATRON)) {
    return [];
  }

  return [contactOtherPlaneSpellId];
}

export function setWarlockMysticArcanumSpellId(
  character: Character,
  spellLevel: MysticArcanumLevel,
  spellId: string | null
): Character {
  if (character.className !== "Warlock") {
    return character;
  }

  const nextWarlockState = normalizeWarlockFeatureState(
    {
      ...character.classFeatureState?.warlock,
      mysticArcanumSpellIds: {
        ...(character.classFeatureState?.warlock?.mysticArcanumSpellIds ?? {}),
        [spellLevel]: spellId ?? undefined
      }
    },
    character
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: nextWarlockState
    }
  };
}

export function setWarlockFiendishResilienceDamageTypeSelection(
  character: Character,
  damageType: Parameters<typeof setWarlockFiendPatronFiendishResilienceDamageTypeSelection>[1]
): Character {
  return setWarlockFiendPatronFiendishResilienceDamageTypeSelection(character, damageType);
}

export function setWarlockInvocationSelectionIds(
  character: Character,
  selectionIds: string[]
): Character {
  if (character.className !== "Warlock") {
    return character;
  }

  const nextWarlockState = normalizeWarlockFeatureState(
    {
      ...character.classFeatureState?.warlock,
      eldritchInvocationIds: selectionIds
    },
    character
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: nextWarlockState
    }
  };
}

export function getWarlockInvocationFeatChoice(selectionId: string): FEATS | null {
  const { invocationId, choiceValue } = parseSelectionId(selectionId);

  if (invocationId !== ELDRITCH_INVOCATION.LESSONS_OF_THE_FIRST_ONES || !choiceValue) {
    return null;
  }

  return choiceValue as FEATS;
}

export function getWarlockFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellSlotsExpended">
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];
  const selectedInvocationIds = new Set(
    getWarlockInvocationSelectionIds(character)
      .map((selectionId) => parseSelectionId(selectionId).invocationId)
      .filter((invocationId): invocationId is ELDRITCH_INVOCATION => invocationId !== null)
  );

  if (hasWarlockFeature(character, CLASS_FEATURE.MAGICAL_CUNNING)) {
    const usesRemaining = getWarlockMagicalCunningUsesRemaining(character);
    const usesTotal = getWarlockMagicalCunningUsesTotal(character);
    const expendedPactMagicSlots = getWarlockPactMagicSlotsExpended(character);
    const restoresAllPactMagicSlots = hasWarlockFeature(character, CLASS_FEATURE.ELDRITCH_MASTER);
    const eldritchMasterDescriptionAddition = restoresAllPactMagicSlots
      ? createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.ELDRITCH_MASTER,
          getFeatureDescriptionForCharacter(character, CLASS_FEATURE.ELDRITCH_MASTER),
          "Eldritch Master"
        )
      : [];
    const disabledReason =
      usesRemaining <= 0
        ? "Magical Cunning recharges on a Long Rest."
        : expendedPactMagicSlots <= 0
          ? "No Pact Magic spell slots to restore."
          : undefined;

    actions.push({
      key: magicalCunningActionKey,
      name: "Magical Cunning",
      sourceFeature: CLASS_FEATURE.MAGICAL_CUNNING,
      summary: restoresAllPactMagicSlots
        ? "Restore all your Pact Magic spell slots."
        : "Restore half your Pact Magic spell slots.",
      detail: restoresAllPactMagicSlots
        ? "Restore all of your expended Pact Magic spell slots."
        : "Restore half your maximum Pact Magic spell slots, rounded up.",
      breakdown: "Restore Pact slots",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal,
      descriptionAdditions:
        eldritchMasterDescriptionAddition.length > 0
          ? [eldritchMasterDescriptionAddition]
          : undefined,
      disabled: Boolean(disabledReason),
      disabledReason
    });
  }

  if (selectedInvocationIds.has(ELDRITCH_INVOCATION.ARMOR_OF_SHADOWS)) {
    const invocation = getEldritchInvocationEntryById(ELDRITCH_INVOCATION.ARMOR_OF_SHADOWS);
    const description = invocation?.description ?? [
      "You can cast Mage Armor on yourself without expending a spell slot."
    ];

    actions.push({
      key: armorOfShadowsActionKey,
      name: invocation?.name ?? "Armor of Shadows",
      summary: "Cast Mage Armor on yourself without a spell slot.",
      detail: "Open Mage Armor and cast it on yourself without expending a spell slot.",
      breakdown: "Open Mage Armor",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      description,
      drawer: {
        kind: "confirm",
        eyebrow: "Eldritch Invocation",
        description,
        confirmLabel: "Open Mage Armor"
      },
      execute: {
        kind: "spell",
        spellSource: "fixed",
        effectKind: "armor-of-shadows",
        spellId: mageArmorSpellId,
        spellLevel: 1,
        label: "Open Mage Armor",
        actionContextText: "Armor of Shadows won't cost a spell slot.",
        actionAvailabilityText: "Cast without expending a spell slot.",
        actionConsumesSpellSlot: false
      }
    });
  }

  if (hasWarlockFeature(character, CLASS_FEATURE.CONTACT_PATRON)) {
    const usesRemaining = getContactPatronUsesRemaining(character);

    actions.push({
      key: contactPatronActionKey,
      name: "Contact Patron",
      sourceFeature: CLASS_FEATURE.CONTACT_PATRON,
      summary: "Cast Contact Other Plane without a spell slot.",
      detail: "Open Contact Other Plane and cast it to contact your patron directly.",
      breakdown: "Auto-succeed on the saving throw",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal: contactPatronUsesTotal,
      drawer: {
        kind: "confirm",
        eyebrow: "Warlock",
        confirmLabel: "Open Contact Other Plane"
      },
      execute: {
        kind: "spell",
        spellSource: "fixed",
        effectKind: "contact-patron",
        spellId: contactOtherPlaneSpellId,
        spellLevel: 5,
        label: "Open Contact Other Plane",
        actionContextText: "Using Contact Patron",
        actionAvailabilityText: "Cast without expending a spell slot.",
        actionConsumesSpellSlot: false
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "Contact Patron recharges on a Long Rest." : undefined
    });
  }

  if (hasWarlockFeature(character, CLASS_FEATURE.MYSTIC_ARCANUM)) {
    const selectedArcanumSelections = getWarlockMysticArcanumSelections(character).filter(
      (selection) => selection.spell !== null
    );
    const selectedArcanumCount = selectedArcanumSelections.length;
    const remainingArcanumCount = selectedArcanumSelections.filter(
      (selection) => selection.expended === false
    ).length;

    actions.push({
      key: mysticArcanumActionKey,
      name: "Mystic Arcanum",
      summary: mysticArcanumActionSummary,
      detail: mysticArcanumActionDetail,
      breakdown: "Cast your arcanum spells",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining: remainingArcanumCount,
      usesTotal: selectedArcanumCount,
      drawer: {
        kind: "spell-list",
        eyebrow: "Warlock"
      },
      execute: {
        kind: "spell",
        spellSource: "mystic-arcanum",
        effectKind: "mystic-arcanum",
        label: "Open Arcanum"
      },
      disabled: selectedArcanumCount <= 0,
      disabledReason:
        selectedArcanumCount <= 0
          ? "Choose your Mystic Arcanum spells in Class Features & Feats first."
          : undefined
    });
  }

  return actions;
}

export function activateWarlockFeatureAction(
  character: Character,
  actionKey: string
): Character | null {
  if (actionKey === magicalCunningActionKey) {
    return activateWarlockMagicalCunning(character);
  }

  if (
    actionKey === armorOfShadowsActionKey ||
    actionKey === contactPatronActionKey ||
    actionKey === mysticArcanumActionKey
  ) {
    return character;
  }

  return activateWarlockSubclassFeatureAction(character, actionKey);
}

export function activateWarlockAwakenedMind(
  character: Character,
  options: ActivateWarlockGreatOldOnePatronAwakenedMindOptions = {}
): Character {
  return activateWarlockGreatOldOnePatronAwakenedMind(character, options);
}

export function activateWarlockMagicalCunning(character: Character): Character {
  if (!hasWarlockFeature(character, CLASS_FEATURE.MAGICAL_CUNNING)) {
    return character;
  }

  const usesRemaining = getWarlockMagicalCunningUsesRemaining(character);
  const pactMagicSlotLevel = getWarlockPactMagicSlotLevel(character);
  const pactMagicSlotTotal = getWarlockPactMagicSlotTotal(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const expendedSlots =
    pactMagicSlotLevel > 0 ? (spellSlotsExpended[pactMagicSlotLevel - 1] ?? 0) : 0;

  if (usesRemaining <= 0 || pactMagicSlotLevel <= 0 || expendedSlots <= 0) {
    return character;
  }

  const restoresAllPactMagicSlots = hasWarlockFeature(character, CLASS_FEATURE.ELDRITCH_MASTER);
  const slotsToRestore = restoresAllPactMagicSlots
    ? expendedSlots
    : Math.min(expendedSlots, Math.ceil(pactMagicSlotTotal / 2));

  if (slotsToRestore <= 0) {
    return character;
  }

  const nextSpellSlotsExpended = [...spellSlotsExpended];
  nextSpellSlotsExpended[pactMagicSlotLevel - 1] = Math.max(0, expendedSlots - slotsToRestore);
  const warlockState = getWarlockFeatureState(character);

  return applyWarlockCelestialPatronCelestialResilienceTemporaryHitPoints({
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        magicalCunningUsesExpended: (warlockState.magicalCunningUsesExpended ?? 0) + 1
      }
    }
  });
}

export function restoreWarlockPactMagicSpellSlots(character: Character): Character {
  if (!hasWarlockFeature(character, CLASS_FEATURE.PACT_MAGIC)) {
    return character;
  }

  const pactMagicSlotLevel = getWarlockPactMagicSlotLevel(character);

  if (pactMagicSlotLevel <= 0) {
    return character;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );

  if ((spellSlotsExpended[pactMagicSlotLevel - 1] ?? 0) <= 0) {
    return character;
  }

  const nextSpellSlotsExpended = [...spellSlotsExpended];
  nextSpellSlotsExpended[pactMagicSlotLevel - 1] = 0;

  return {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

export function consumeContactPatronUse(character: Character): Character {
  if (!hasWarlockFeature(character, CLASS_FEATURE.CONTACT_PATRON)) {
    return character;
  }

  const usesRemaining = getContactPatronUsesRemaining(character);

  if (usesRemaining <= 0) {
    return character;
  }

  const warlockState = getWarlockFeatureState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        contactPatronUsesExpended: (warlockState.contactPatronUsesExpended ?? 0) + 1
      }
    }
  };
}

export function consumeMysticArcanumUse(
  character: Character,
  spellLevel: MysticArcanumLevel
): Character {
  if (!getUnlockedMysticArcanumLevels(character).includes(spellLevel)) {
    return character;
  }

  const currentSpellId = getWarlockMysticArcanumSpellId(character, spellLevel);

  if (!currentSpellId) {
    return character;
  }

  const warlockState = getWarlockFeatureState(character);
  const expendedLevels = warlockState.mysticArcanumExpendedLevels ?? [];

  if (expendedLevels.includes(spellLevel)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        mysticArcanumExpendedLevels: [...expendedLevels, spellLevel].sort(
          (left, right) => left - right
        )
      }
    }
  };
}

export function restoreWarlockMagicalCunningOnLongRest(character: Character): Character {
  if (!hasWarlockFeature(character, CLASS_FEATURE.MAGICAL_CUNNING)) {
    return character;
  }

  const warlockState = getWarlockFeatureState(character);

  if ((warlockState.magicalCunningUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        magicalCunningUsesExpended: 0
      }
    }
  };
}

export function restoreContactPatronOnLongRest(character: Character): Character {
  if (!hasWarlockFeature(character, CLASS_FEATURE.CONTACT_PATRON)) {
    return character;
  }

  const warlockState = getWarlockFeatureState(character);

  if ((warlockState.contactPatronUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        contactPatronUsesExpended: 0
      }
    }
  };
}

export function restoreMysticArcanumOnLongRest(character: Character): Character {
  if (!hasWarlockFeature(character, CLASS_FEATURE.MYSTIC_ARCANUM)) {
    return character;
  }

  const warlockState = getWarlockFeatureState(character);

  if ((warlockState.mysticArcanumExpendedLevels ?? []).length <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        mysticArcanumExpendedLevels: []
      }
    }
  };
}

export function consumeWarlockStepsOfTheFeyUse(character: Character): Character {
  return consumeWarlockArchfeyPatronStepsOfTheFeyUse(character);
}

export function consumeWarlockBeguilingDefenseUse(character: Character): Character {
  return consumeWarlockArchfeyPatronBeguilingDefenseUse(character);
}

export function restoreWarlockStepsOfTheFeyOnLongRest(character: Character): Character {
  return restoreWarlockArchfeyPatronStepsOfTheFeyOnLongRest(character);
}

export function restoreWarlockBeguilingDefenseOnLongRest(character: Character): Character {
  return restoreWarlockArchfeyPatronBeguilingDefenseOnLongRest(character);
}

export function restoreWarlockClairvoyantCombatantOnShortRest(character: Character): Character {
  return restoreWarlockGreatOldOnePatronClairvoyantCombatantOnShortRest(character);
}

export function restoreWarlockClairvoyantCombatantOnLongRest(character: Character): Character {
  return restoreWarlockGreatOldOnePatronClairvoyantCombatantOnLongRest(character);
}

export function spendWarlockHealingLightDice(character: Character, diceCount: number): Character {
  return spendWarlockCelestialPatronHealingLightDice(character, diceCount);
}

export function expendWarlockHealingLightDie(character: Character): Character {
  return expendWarlockCelestialPatronHealingLightDie(character);
}

export function restoreWarlockHealingLightDie(character: Character): Character {
  return restoreWarlockCelestialPatronHealingLightDie(character);
}

export function consumeWarlockSearingVengeanceUse(character: Character): Character {
  return consumeWarlockCelestialPatronSearingVengeanceUse(character);
}

export function activateWarlockDarkOnesBlessing(character: Character): Character {
  return applyWarlockFiendPatronDarkOnesBlessing(character);
}

export function consumeWarlockDarkOnesOwnLuckUse(character: Character): Character {
  return consumeWarlockFiendPatronDarkOnesOwnLuckUse(character);
}

export function consumeWarlockHurlThroughHellUse(character: Character): Character {
  return consumeWarlockFiendPatronHurlThroughHellUse(character);
}

export function restoreAllWarlockHealingLightDice(character: Character): Character {
  return restoreAllWarlockCelestialPatronHealingLightDice(character);
}

export function restoreWarlockHealingLightOnLongRest(character: Character): Character {
  return restoreWarlockCelestialPatronHealingLightOnLongRest(character);
}

export function restoreWarlockSearingVengeanceOnLongRest(character: Character): Character {
  return restoreWarlockCelestialPatronSearingVengeanceOnLongRest(character);
}

export function restoreWarlockDarkOnesOwnLuckOnLongRest(character: Character): Character {
  return restoreWarlockFiendPatronDarkOnesOwnLuckOnLongRest(character);
}

export function restoreWarlockHurlThroughHellOnLongRest(character: Character): Character {
  return restoreWarlockFiendPatronHurlThroughHellOnLongRest(character);
}

export function applyWarlockFeaturesAfterSpellCast(
  character: Character,
  spell: Pick<SpellEntry, "id">,
  options: { useRadiantSoul?: boolean } = {}
): Character {
  return applyWarlockCelestialPatronFeaturesAfterSpellCast(character, spell.id, options);
}

export function applyShortRestToWarlockFeatures(character: Character): Character {
  return applyWarlockCelestialPatronFeaturesOnShortRest(
    restoreWarlockPactMagicSpellSlots(restoreWarlockSubclassFeaturesOnShortRest(character))
  );
}

export function applyLongRestToWarlockFeatures(character: Character): Character {
  return applyWarlockCelestialPatronFeaturesOnLongRest(
    restoreContactPatronOnLongRest(
      restoreMysticArcanumOnLongRest(
        restoreWarlockMagicalCunningOnLongRest(restoreWarlockSubclassFeaturesOnLongRest(character))
      )
    )
  );
}

export function advanceWarlockFeaturesForNewRound(character: Character): Character {
  return advanceWarlockCelestialPatronFeaturesForNewRound(character);
}

export const warlockBeguilingDefenseReactionId = beguilingDefenseReactionId;
