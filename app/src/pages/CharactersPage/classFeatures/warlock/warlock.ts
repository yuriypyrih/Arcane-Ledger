import {
  FEAT_CATEGORY,
  SPELL_LIST_CLASS,
  CLASS_FEATURE,
  ELDRITCH_INVOCATION,
  WEAPON_COMBAT_TYPE,
  getEldritchInvocationEntryById,
  getSpellEntryById,
  type EldritchInvocationEntry,
  type FEATS,
  type SpellEntry,
  type WEAPON_BASE
} from "../../../../codex/entries";
import { getWeaponEntries } from "../../../../codex/selectors";
import {
  getSpellEntriesForClassName,
  warlockFeatures,
  type WarlockFeatureClassObj
} from "../../../../codex/classes";
import {
  ACTION_CATEGORY,
  ECONOMY_TYPE,
  getRoundTrackerResourceForEconomyType
} from "../../actionEconomy";
import {
  createFeatureSourcedDescriptionEntries,
  createSourcedDescriptionEntries
} from "../../actionModalDescriptions";
import {
  getAbilityModifierBreakdownForCharacter,
  getAbilityModifierForCharacter
} from "../../abilities";
import {
  getHitDiceRemainingForCharacter,
  getHitDiceTotalForCharacter,
  getHitDieFormulaForClass
} from "../../hitDice";
import { getFeatDefinitionsByCategory } from "../../feats";
import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterWarlockFeatureState
} from "../../../../types";
import type { ItemRecord } from "../../../../types";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../spellcasting";
import { mageArmorSpellId } from "../../characterRuntime/spellImplementations";
import type { WeaponAction } from "../../gameplay";
import {
  addConjuredPactOfTheBladeInventoryItem,
  clearPactOfTheBladeInventoryTags,
  findInventoryItemStackById,
  getInventoryItemStackIdFromCopyId,
  isConjuredInventoryItem,
  isPactOfTheBladeInventoryItem,
  setPactOfTheBladeInventoryItemById
} from "../../inventoryItems";
import { getOfficial2024BackendItemKeyForWeaponBase } from "../../../../utils/items/weaponBaseItemKeys";
import { formatFormulaCell, formatSignedFormulaTerm } from "../../shared/formulas";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../../combat";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureDamageBonus,
  SpellFeatureContext,
  WeaponAttackConsumptionContext
} from "../types";
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
const levitateSpellId = "spell-levitate";
const devilsSightStatusSourceId = "warlock-invocation-devils-sight";
const pactBladeOwnedSelectionPrefix = "owned:";
const pactBladeConjuredSelectionPrefix = "conjured:";
const pactOfTheBladeDamageTypeLabel = "Necrotic/Psychic/Radiant";
const mysticArcanumActionSummary = "Cast your chosen arcanum spells without spell slots.";
const mysticArcanumActionDetail =
  "Open your chosen Mystic Arcanum spells and cast each of them once per Long Rest.";
const pactOfTheBladeAttackDamageDescription =
  "Whenever you attack with the bonded weapon, you can use your Charisma modifier for the attack and damage rolls instead of using Strength or Dexterity, and you can cause the weapon to deal Necrotic, Psychic, or Radiant damage or its normal damage type.";

export const magicalCunningActionKey = "warlock-magical-cunning";
export const ascendantStepActionKey = "warlock-ascendant-step";
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

type SetWarlockInvocationSelectionIdsOptions = {
  pactBladeConjuredItem?: ItemRecord | null;
};

export type WarlockEldritchSmiteWeaponOptionState = {
  damageBonus: FeatureDamageBonus;
  disabled: boolean;
  disabledReason: string | null;
  pactMagicSlotLevel: number;
  pactMagicSlotsRemaining: number;
  pactMagicSlotsTotal: number;
};

export type WarlockLifedrinkerWeaponOptionState = {
  damageBonus: FeatureDamageBonus;
  disabled: boolean;
  disabledReason: string | null;
  healFormula: string;
  healFormulaDisplay: string;
  healFormulaPresentation: {
    label: string;
    value: string;
    breakdown?: string;
  };
  hitDiceRemaining: number;
  hitDiceTotal: number;
};

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
  selectionGroup?: string | null;
  requirementLabel: string;
  isQualified: boolean;
  isPlaceholder: boolean;
};

export type WarlockEldritchInvocationEditorTabKey = "general" | "pacts";

type WarlockEldritchInvocationEditorGroupDefinition = {
  key: string;
  label: string | null;
  invocationIds: readonly ELDRITCH_INVOCATION[];
};

type WarlockEldritchInvocationEditorTabDefinition = {
  key: WarlockEldritchInvocationEditorTabKey;
  label: string;
  groups: readonly WarlockEldritchInvocationEditorGroupDefinition[];
};

export const warlockEldritchInvocationEditorTabs = [
  {
    key: "general",
    label: "General",
    groups: [
      {
        key: "general",
        label: null,
        invocationIds: [
          ELDRITCH_INVOCATION.ARMOR_OF_SHADOWS,
          ELDRITCH_INVOCATION.ELDRITCH_MIND,
          ELDRITCH_INVOCATION.AGONIZING_BLAST,
          ELDRITCH_INVOCATION.DEVILS_SIGHT,
          ELDRITCH_INVOCATION.ELDRITCH_SPEAR,
          ELDRITCH_INVOCATION.FIENDISH_VIGOR,
          ELDRITCH_INVOCATION.LESSONS_OF_THE_FIRST_ONES,
          ELDRITCH_INVOCATION.MASK_OF_MANY_FACES,
          ELDRITCH_INVOCATION.MISTY_VISIONS,
          ELDRITCH_INVOCATION.OTHERWORLDLY_LEAP,
          ELDRITCH_INVOCATION.REPELLING_BLAST,
          ELDRITCH_INVOCATION.ASCENDANT_STEP,
          ELDRITCH_INVOCATION.GAZE_OF_TWO_MINDS,
          ELDRITCH_INVOCATION.GIFT_OF_THE_DEPTHS,
          ELDRITCH_INVOCATION.MASTER_OF_MYRIAD_FORMS,
          ELDRITCH_INVOCATION.ONE_WITH_SHADOWS,
          ELDRITCH_INVOCATION.WHISPERS_OF_THE_GRAVE,
          ELDRITCH_INVOCATION.VISIONS_OF_DISTANT_REALMS,
          ELDRITCH_INVOCATION.WITCH_SIGHT
        ]
      }
    ]
  },
  {
    key: "pacts",
    label: "Pacts",
    groups: [
      {
        key: "pact-blade",
        label: "Pact of the Blade",
        invocationIds: [
          ELDRITCH_INVOCATION.PACT_OF_THE_BLADE,
          ELDRITCH_INVOCATION.ELDRITCH_SMITE,
          ELDRITCH_INVOCATION.THIRSTING_BLADE,
          ELDRITCH_INVOCATION.LIFEDRINKER,
          ELDRITCH_INVOCATION.DEVOURING_BLADE
        ]
      },
      {
        key: "pact-chain",
        label: "Pact of the Chain",
        invocationIds: [
          ELDRITCH_INVOCATION.PACT_OF_THE_CHAIN,
          ELDRITCH_INVOCATION.INVESTMENT_OF_THE_CHAIN_MASTER
        ]
      },
      {
        key: "pact-tome",
        label: "Pact of the Tome",
        invocationIds: [
          ELDRITCH_INVOCATION.PACT_OF_THE_TOME,
          ELDRITCH_INVOCATION.GIFT_OF_THE_PROTECTORS
        ]
      }
    ]
  }
] as const satisfies readonly WarlockEldritchInvocationEditorTabDefinition[];

const orderedWarlockEldritchInvocationIds = warlockEldritchInvocationEditorTabs.flatMap((tab) =>
  tab.groups.flatMap((group) => group.invocationIds)
);

export type WarlockEldritchInvocationInputStatus = {
  hasInputRequired: boolean;
  selectedCount: number;
  limit: number;
  message: string | null;
};

type WarlockInvocationCharacter = Pick<Character, "className" | "level"> &
  Partial<
    Pick<
      Character,
      | "abilities"
      | "cantripIds"
      | "classFeatureState"
      | "feats"
      | "hitDiceRemaining"
      | "inventoryItems"
      | "roundTracker"
      | "spellSlotsExpended"
      | "statusEntries"
      | "subclassId"
    >
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

function getPactBladeOwnedSelectionValue(stackId: string): string {
  return `${pactBladeOwnedSelectionPrefix}${getInventoryItemStackIdFromCopyId(stackId)}`;
}

function getPactBladeConjuredSelectionValue(baseWeapon: string): string {
  return `${pactBladeConjuredSelectionPrefix}${baseWeapon}`;
}

function getPactBladeOwnedStackIdFromChoice(choiceValue: string | null): string | null {
  if (!choiceValue?.startsWith(pactBladeOwnedSelectionPrefix)) {
    return null;
  }

  const stackId = choiceValue.slice(pactBladeOwnedSelectionPrefix.length).trim();
  return stackId.length > 0 ? stackId : null;
}

function getPactBladeConjuredBaseWeaponFromChoice(choiceValue: string | null): string | null {
  if (!choiceValue?.startsWith(pactBladeConjuredSelectionPrefix)) {
    return null;
  }

  const baseWeapon = choiceValue.slice(pactBladeConjuredSelectionPrefix.length).trim();
  return baseWeapon.length > 0 ? baseWeapon : null;
}

function getWarlockPactBladeConjuredWeaponOptions() {
  return getWeaponEntries()
    .filter(
      (weapon): weapon is ReturnType<typeof getWeaponEntries>[number] & { baseWeapon: WEAPON_BASE } =>
        Boolean(weapon.baseWeapon) &&
        weapon.type.combat === WEAPON_COMBAT_TYPE.MELEE &&
        getOfficial2024BackendItemKeyForWeaponBase(weapon.baseWeapon) !== null
    )
    .sort((left, right) => left.name.localeCompare(right.name));
}

function getSelectedPactBladeSelection(
  selectionIds: string[]
): { kind: "owned"; stackId: string } | { kind: "conjured"; baseWeapon: string } | null {
  const parsedSelection = selectionIds
    .map(parseSelectionId)
    .find((selection) => selection.invocationId === ELDRITCH_INVOCATION.PACT_OF_THE_BLADE);

  if (!parsedSelection) {
    return null;
  }

  const ownedStackId = getPactBladeOwnedStackIdFromChoice(parsedSelection.choiceValue);

  if (ownedStackId) {
    return {
      kind: "owned",
      stackId: ownedStackId
    };
  }

  const conjuredBaseWeapon = getPactBladeConjuredBaseWeaponFromChoice(parsedSelection.choiceValue);

  return conjuredBaseWeapon
    ? {
        kind: "conjured",
        baseWeapon: conjuredBaseWeapon
      }
    : null;
}

function getSelectedInvocationIdSetFromSelectionIds(
  selectionIds: string[]
): Set<ELDRITCH_INVOCATION> {
  return new Set(
    selectionIds
      .map((selectionId) => parseSelectionId(selectionId).invocationId)
      .filter((invocationId): invocationId is ELDRITCH_INVOCATION => invocationId !== null)
  );
}

function getWarlockPactBladeAdditionalAttackCountFromInvocationIds(
  selectedInvocationIds: Set<ELDRITCH_INVOCATION>
): number {
  if (!selectedInvocationIds.has(ELDRITCH_INVOCATION.PACT_OF_THE_BLADE)) {
    return 0;
  }

  if (selectedInvocationIds.has(ELDRITCH_INVOCATION.DEVOURING_BLADE)) {
    return 2;
  }

  return selectedInvocationIds.has(ELDRITCH_INVOCATION.THIRSTING_BLADE) ? 1 : 0;
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

  return orderedWarlockEldritchInvocationIds.flatMap((invocationId) => {
    const invocation = getEldritchInvocationEntryById(invocationId);

    if (!invocation) {
      return [];
    }

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

    if (invocation.selection?.kind === "pact-blade") {
      const inventoryItems = character.inventoryItems ?? [];
      const ownedWeaponOptions = inventoryItems
        .filter((entry) => Boolean(entry.item.weapon) && !isConjuredInventoryItem(entry))
        .slice()
        .sort((left, right) =>
          (left.item.name ?? left.item.key ?? "").localeCompare(
            right.item.name ?? right.item.key ?? ""
          )
        )
        .map((entry) => ({
          selectionId: createSelectionId(
            invocation.id,
            getPactBladeOwnedSelectionValue(entry.id)
          ),
          invocation,
          displayName: invocation.name,
          displaySubtitle: `Owned: ${entry.item.name ?? entry.item.key ?? "Weapon"}`,
          selectionGroup: "Owned weapons",
          requirementLabel,
          isQualified: baseQualified,
          isPlaceholder: false
        }));
      const conjuredWeaponOptions = getWarlockPactBladeConjuredWeaponOptions().map((weapon) => ({
        selectionId: createSelectionId(
          invocation.id,
          getPactBladeConjuredSelectionValue(weapon.baseWeapon)
        ),
        invocation,
        displayName: invocation.name,
        displaySubtitle: `Conjure: ${weapon.name}`,
        selectionGroup: "Conjured base weapons",
        requirementLabel,
        isQualified: baseQualified,
        isPlaceholder: false
      }));
      const availableSelectionIds = new Set(
        [...ownedWeaponOptions, ...conjuredWeaponOptions].map((option) => option.selectionId)
      );
      const missingSelectedWeaponOptions = selectedIds.flatMap((selectionId) => {
        const { invocationId, choiceValue } = parseSelectionId(selectionId);

        if (
          invocationId !== ELDRITCH_INVOCATION.PACT_OF_THE_BLADE ||
          availableSelectionIds.has(selectionId) ||
          (!getPactBladeOwnedStackIdFromChoice(choiceValue) &&
            !getPactBladeConjuredBaseWeaponFromChoice(choiceValue))
        ) {
          return [];
        }

        return [
          {
            selectionId,
            invocation,
            displayName: invocation.name,
            displaySubtitle: "Missing pact weapon",
            selectionGroup: "Missing saved choices",
            requirementLabel,
            isQualified: baseQualified,
            isPlaceholder: false
          }
        ];
      });

      return [...ownedWeaponOptions, ...conjuredWeaponOptions, ...missingSelectedWeaponOptions];
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

function getProficiencyBonusForLevel(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

function createSignedFormula(baseFormula: string, modifier: number): string {
  if (modifier === 0) {
    return baseFormula;
  }

  return `${baseFormula}${modifier > 0 ? "+" : ""}${modifier}`;
}

function createSignedDisplay(baseFormula: string, modifier: number): string {
  if (modifier === 0) {
    return baseFormula;
  }

  return `${baseFormula} ${modifier >= 0 ? "+" : ""}${modifier}`;
}

function getWeaponActionPactBladeInventoryStack(
  character: WarlockInvocationCharacter,
  action: WeaponAction
) {
  const stackId =
    action.inventoryStackId ??
    (action.key.startsWith("inventory-") ? action.key.replace(/^inventory-/, "") : null);

  return stackId ? findInventoryItemStackById(character.inventoryItems ?? [], stackId) : null;
}

function isPactBladeWeaponAction(
  character: WarlockInvocationCharacter,
  action: WeaponAction
): boolean {
  if (
    character.className !== "Warlock" ||
    action.attackKind !== "weapon" ||
    !getWarlockSelectedInvocationIds(character).has(ELDRITCH_INVOCATION.PACT_OF_THE_BLADE)
  ) {
    return false;
  }

  if ((action.inventoryFeatureTags ?? []).includes("pact-of-the-blade")) {
    return true;
  }

  return isPactOfTheBladeInventoryItem(getWeaponActionPactBladeInventoryStack(character, action));
}

function isPactBladeWeaponAttackContext(
  character: WarlockInvocationCharacter,
  action: WeaponAttackConsumptionContext
): boolean {
  if (
    character.className !== "Warlock" ||
    action.attackKind !== "weapon" ||
    !getWarlockSelectedInvocationIds(character).has(ELDRITCH_INVOCATION.PACT_OF_THE_BLADE)
  ) {
    return false;
  }

  if ((action.inventoryFeatureTags ?? []).includes("pact-of-the-blade")) {
    return true;
  }

  return action.inventoryStackId
    ? isPactOfTheBladeInventoryItem(
        findInventoryItemStackById(character.inventoryItems ?? [], action.inventoryStackId)
      )
    : false;
}

function appendPactOfTheBladeDescription(action: WeaponAction): WeaponAction {
  const descriptionAddition = createSourcedDescriptionEntries("Pact of the Blade", [
    pactOfTheBladeAttackDamageDescription
  ]);
  const hasExistingDescription = (action.descriptionAdditions ?? []).some((section) =>
    section.some(
      (entry) =>
        typeof entry === "string" &&
        entry.includes("Pact of the Blade") &&
        entry.includes("Charisma modifier")
    )
  );

  return hasExistingDescription
    ? action
    : {
        ...action,
        descriptionAdditions: [...(action.descriptionAdditions ?? []), descriptionAddition]
      };
}

function appendEldritchSmiteDescription(
  character: WarlockInvocationCharacter,
  action: WeaponAction
): WeaponAction {
  if (!getWarlockSelectedInvocationIds(character).has(ELDRITCH_INVOCATION.ELDRITCH_SMITE)) {
    return action;
  }

  const invocation = getEldritchInvocationEntryById(ELDRITCH_INVOCATION.ELDRITCH_SMITE);
  const sourceName = invocation?.name ?? "Eldritch Smite";
  const description = invocation?.description ?? [];
  const hasExistingDescription = (action.descriptionAdditions ?? []).some((section) =>
    section.some((entry) => typeof entry === "string" && entry.includes(sourceName))
  );

  if (hasExistingDescription || description.length === 0) {
    return action;
  }

  return {
    ...action,
    descriptionAdditions: [
      ...(action.descriptionAdditions ?? []),
      createSourcedDescriptionEntries(sourceName, description)
    ]
  };
}

function appendPactBladeExtraAttackInvocationDescription(
  character: WarlockInvocationCharacter,
  action: WeaponAction
): WeaponAction {
  const selectedInvocationIds = getWarlockSelectedInvocationIds(character);
  const invocationId = selectedInvocationIds.has(ELDRITCH_INVOCATION.DEVOURING_BLADE)
    ? ELDRITCH_INVOCATION.DEVOURING_BLADE
    : selectedInvocationIds.has(ELDRITCH_INVOCATION.THIRSTING_BLADE)
      ? ELDRITCH_INVOCATION.THIRSTING_BLADE
      : null;

  if (invocationId === null) {
    return action;
  }

  const invocation = getEldritchInvocationEntryById(invocationId);
  const sourceName =
    invocation?.name ??
    (invocationId === ELDRITCH_INVOCATION.DEVOURING_BLADE
      ? "Devouring Blade"
      : "Thirsting Blade");
  const description = invocation?.description ?? [];
  const hasExistingDescription = (action.descriptionAdditions ?? []).some((section) =>
    section.some((entry) => typeof entry === "string" && entry.includes(sourceName))
  );

  if (hasExistingDescription || description.length === 0) {
    return action;
  }

  return {
    ...action,
    descriptionAdditions: [
      ...(action.descriptionAdditions ?? []),
      createSourcedDescriptionEntries(sourceName, description)
    ]
  };
}

function appendLifedrinkerDescription(
  character: WarlockInvocationCharacter,
  action: WeaponAction
): WeaponAction {
  if (!getWarlockSelectedInvocationIds(character).has(ELDRITCH_INVOCATION.LIFEDRINKER)) {
    return action;
  }

  const invocation = getEldritchInvocationEntryById(ELDRITCH_INVOCATION.LIFEDRINKER);
  const sourceName = invocation?.name ?? "Lifedrinker";
  const description = invocation?.description ?? [];
  const hasExistingDescription = (action.descriptionAdditions ?? []).some((section) =>
    section.some((entry) => typeof entry === "string" && entry.includes(sourceName))
  );

  if (hasExistingDescription || description.length === 0) {
    return action;
  }

  return {
    ...action,
    descriptionAdditions: [
      ...(action.descriptionAdditions ?? []),
      createSourcedDescriptionEntries(sourceName, description)
    ]
  };
}

export function getWarlockWeaponAction(
  character: WarlockInvocationCharacter,
  action: WeaponAction
): WeaponAction {
  if (!isPactBladeWeaponAction(character, action)) {
    return action;
  }

  const charismaBreakdown = getAbilityModifierBreakdownForCharacter(character, "CHA");
  const shouldUseCharisma = charismaBreakdown.total >= action.abilityModifier;
  const proficiencyBonus =
    action.proficiencyBonus !== 0
      ? action.proficiencyBonus
      : getProficiencyBonusForLevel(character.level);
  const proficiencyLabel =
    action.proficiencyBonus !== 0 ? action.proficiencyLabel : "Pact of the Blade";
  const charismaAction = shouldUseCharisma
    ? {
        ...action,
        ability: "CHA" as const,
        abilityFormulaLabel: "CHA (Pact of the Blade)",
        cardBaseAbility: "CHA" as const,
        abilityModifierBaseValue: charismaBreakdown.baseValue,
        abilityModifier: charismaBreakdown.total,
        cardBaseAbilityModifier: charismaBreakdown.total,
        abilityModifierBonusEntries: charismaBreakdown.bonusEntries,
        damageAbility: "CHA" as const,
        damageAbilityFormulaLabel: "CHA (Pact of the Blade)",
        damageAbilityModifierBaseValue: charismaBreakdown.baseValue,
        damageAbilityModifier: charismaBreakdown.total,
        damageAbilityModifierBonusEntries: charismaBreakdown.bonusEntries
      }
    : action;
  const damageAbilityModifier =
    charismaAction.damageAbilityModifier ?? charismaAction.abilityModifier;
  const damageBonusTotal = charismaAction.damageBonusEntries.reduce(
    (total, entry) => total + (entry.value ?? 0),
    0
  );
  const totalModifier = damageAbilityModifier + damageBonusTotal;

  const pactAction = appendPactOfTheBladeDescription({
    ...charismaAction,
    damageLabel: replaceBaseWeaponDamageType(
      charismaAction.damageLabel,
      pactOfTheBladeDamageTypeLabel
    ),
    proficiencyBonus,
    proficiencyLabel,
    totalModifier,
    rollDisplay: createSignedDisplay(charismaAction.damageFormula, totalModifier),
    rollFormulaDisplay: createSignedFormula(charismaAction.damageFormula, totalModifier),
    rollFormula: createSignedFormula(charismaAction.damageFormula, totalModifier)
  });

  return appendPactBladeExtraAttackInvocationDescription(
    character,
    appendLifedrinkerDescription(character, appendEldritchSmiteDescription(character, pactAction))
  );
}

export function getWarlockEldritchSmiteWeaponOptionState(
  character: WarlockInvocationCharacter,
  action: WeaponAction | null
): WarlockEldritchSmiteWeaponOptionState | null {
  if (
    !action ||
    !isPactBladeWeaponAction(character, action) ||
    !getWarlockSelectedInvocationIds(character).has(ELDRITCH_INVOCATION.ELDRITCH_SMITE)
  ) {
    return null;
  }

  const pactMagicSlotLevel = getWarlockPactMagicSlotLevel(character);
  const pactMagicSlotsTotal = getWarlockPactMagicSlotTotal(character);
  const pactMagicSlotsRemaining = getWarlockPactMagicSlotsRemaining({
    className: character.className,
    level: character.level,
    spellSlotsExpended: character.spellSlotsExpended ?? []
  });
  const disabled =
    pactMagicSlotLevel <= 0 || pactMagicSlotsTotal <= 0 || pactMagicSlotsRemaining <= 0;
  const formula = `${Math.max(1, pactMagicSlotLevel)}d8`;

  return {
    damageBonus: {
      label: "Eldritch Smite",
      formula,
      displayLabel: `${formula} Force`
    },
    disabled,
    disabledReason: disabled ? "No Pact Magic spell slots remaining." : null,
    pactMagicSlotLevel,
    pactMagicSlotsRemaining,
    pactMagicSlotsTotal
  };
}

export function consumeWarlockEldritchSmitePactMagicSlot(character: Character): Character {
  if (character.className !== "Warlock") {
    return character;
  }

  const pactMagicSlotLevel = getWarlockPactMagicSlotLevel(character);
  const pactMagicSlotsTotal = getWarlockPactMagicSlotTotal(character);

  if (
    pactMagicSlotLevel <= 0 ||
    pactMagicSlotsTotal <= 0 ||
    getWarlockPactMagicSlotsRemaining(character) <= 0
  ) {
    return character;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const slotIndex = pactMagicSlotLevel - 1;
  const nextSpellSlotsExpended = [...spellSlotsExpended];

  nextSpellSlotsExpended[slotIndex] = Math.min(
    pactMagicSlotsTotal,
    (nextSpellSlotsExpended[slotIndex] ?? 0) + 1
  );

  return {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

export function getWarlockLifedrinkerWeaponOptionState(
  character: WarlockInvocationCharacter,
  action: WeaponAction | null
): WarlockLifedrinkerWeaponOptionState | null {
  if (
    !action ||
    !isPactBladeWeaponAction(character, action) ||
    !getWarlockSelectedInvocationIds(character).has(ELDRITCH_INVOCATION.LIFEDRINKER)
  ) {
    return null;
  }

  const hitDieFormula = getHitDieFormulaForClass(character.className);
  const constitutionBreakdown = getAbilityModifierBreakdownForCharacter(character, "CON");
  const healFormula = createSignedFormula(hitDieFormula, constitutionBreakdown.total);
  const constitutionDisplayTerm =
    constitutionBreakdown.total === 0
      ? null
      : formatSignedFormulaTerm(constitutionBreakdown.total, "CON");
  const healFormulaPresentation = formatFormulaCell({
    formula: healFormula,
    displayTerms: [hitDieFormula, constitutionDisplayTerm],
    resultLabel: "Heal",
    breakdownTerms: [
      constitutionBreakdown.baseValue === 0
        ? null
        : formatSignedFormulaTerm(constitutionBreakdown.baseValue, "CON"),
      ...constitutionBreakdown.bonusEntries.map((entry) =>
        formatSignedFormulaTerm(entry.value, entry.label)
      )
    ],
    minimumValue: 1,
    minimumLabel: "(MIN:1)"
  });
  const hitDiceRemaining = getHitDiceRemainingForCharacter(character);
  const hitDiceTotal = getHitDiceTotalForCharacter(character);
  const disabled = hitDiceRemaining <= 0;

  return {
    damageBonus: {
      label: "Lifedrinker",
      formula: "1d6",
      displayLabel: "1d6 Necrotic/Psychic/Radiant"
    },
    disabled,
    disabledReason: disabled ? "No Hit Point Dice remaining." : null,
    healFormula,
    healFormulaDisplay: healFormulaPresentation.value,
    healFormulaPresentation: {
      label: "Lifedrinker Heal",
      ...healFormulaPresentation
    },
    hitDiceRemaining,
    hitDiceTotal
  };
}

export function consumeWarlockLifedrinkerHitDie(character: Character): Character {
  if (character.className !== "Warlock") {
    return character;
  }

  const selectedInvocationIds = getWarlockSelectedInvocationIds(character);

  if (
    !selectedInvocationIds.has(ELDRITCH_INVOCATION.PACT_OF_THE_BLADE) ||
    !selectedInvocationIds.has(ELDRITCH_INVOCATION.LIFEDRINKER)
  ) {
    return character;
  }

  const hitDiceRemaining = getHitDiceRemainingForCharacter(character);

  if (hitDiceRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    hitDiceRemaining: hitDiceRemaining - 1
  };
}

function replaceBaseWeaponDamageType(damageLabel: string, damageTypeLabel: string): string {
  const [baseDamageLabel, ...bonusLabels] = damageLabel.split(" + ");
  const nextBaseDamageLabel = (baseDamageLabel ?? damageLabel).replace(
    /\s+[A-Za-z]+(?:\/[A-Za-z]+)*$/,
    ` ${damageTypeLabel}`
  );

  return [nextBaseDamageLabel, ...bonusLabels].join(" + ");
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
  const hasPactBladeSelected = selectedIds.some(
    (selectionId) =>
      parseSelectionId(selectionId).invocationId === ELDRITCH_INVOCATION.PACT_OF_THE_BLADE
  );
  const hasPactBladeInventoryTag = (character.inventoryItems ?? []).some((entry) =>
    isPactOfTheBladeInventoryItem(entry)
  );
  const hasMissingPactBladeWeapon = hasPactBladeSelected && !hasPactBladeInventoryTag;
  const remainingCount = Math.max(0, limit - selectedIds.length);

  return {
    hasInputRequired: hasInputRequired || hasMissingPactBladeWeapon,
    selectedCount: selectedIds.length,
    limit,
    message: hasMissingPactBladeWeapon
      ? "Input required: choose a Pact of the Blade weapon."
      : hasInputRequired
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
  const selectedInvocationIds = getSelectedInvocationIdSetFromSelectionIds(normalizedSelectionIds);
  const pactBladeAdditionalAttackCount =
    getWarlockPactBladeAdditionalAttackCountFromInvocationIds(selectedInvocationIds);
  const rawExtraAttacksRemainingThisTurn = Number(record.extraAttacksRemainingThisTurn);
  const extraAttacksRemainingThisTurn =
    pactBladeAdditionalAttackCount > 0
      ? Math.max(
          0,
          Math.min(
            pactBladeAdditionalAttackCount,
            Number.isFinite(rawExtraAttacksRemainingThisTurn)
              ? Math.floor(rawExtraAttacksRemainingThisTurn)
              : 0
          )
        )
      : undefined;

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
    extraAttacksRemainingThisTurn,
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
  selectionIds: string[],
  options: SetWarlockInvocationSelectionIdsOptions = {}
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
  const normalizedSelectionIds = nextWarlockState.eldritchInvocationIds ?? [];
  const pactBladeSelection = getSelectedPactBladeSelection(normalizedSelectionIds);
  const nextInventoryItems = (() => {
    if (!pactBladeSelection) {
      return clearPactOfTheBladeInventoryTags(character.inventoryItems);
    }

    if (pactBladeSelection.kind === "owned") {
      return setPactOfTheBladeInventoryItemById(
        character.inventoryItems,
        pactBladeSelection.stackId
      );
    }

    if (options.pactBladeConjuredItem) {
      const existingConjuredPactStack = character.inventoryItems.find(
        (entry) => isPactOfTheBladeInventoryItem(entry) && isConjuredInventoryItem(entry)
      );

      if (existingConjuredPactStack?.item.key === options.pactBladeConjuredItem.key) {
        return character.inventoryItems;
      }

      return addConjuredPactOfTheBladeInventoryItem(
        character.inventoryItems,
        options.pactBladeConjuredItem
      );
    }

    return clearPactOfTheBladeInventoryTags(character.inventoryItems);
  })();

  return {
    ...character,
    inventoryItems: nextInventoryItems,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: nextWarlockState
    }
  };
}

export function clearWarlockPactOfTheBladeInvocationSelection(character: Character): Character {
  if (character.className !== "Warlock") {
    return character;
  }

  const nextSelectionIds = getWarlockInvocationSelectionIds(character).filter(
    (selectionId) =>
      parseSelectionId(selectionId).invocationId !== ELDRITCH_INVOCATION.PACT_OF_THE_BLADE
  );

  return setWarlockInvocationSelectionIds(character, nextSelectionIds);
}

export function getWarlockPactOfTheBladeConjuredItemKeyFromSelectionIds(
  selectionIds: string[]
): string | null {
  const pactBladeSelection = getSelectedPactBladeSelection(selectionIds);

  if (pactBladeSelection?.kind !== "conjured") {
    return null;
  }

  return getOfficial2024BackendItemKeyForWeaponBase(pactBladeSelection.baseWeapon as WEAPON_BASE);
}

export function getWarlockInvocationFeatChoice(selectionId: string): FEATS | null {
  const { invocationId, choiceValue } = parseSelectionId(selectionId);

  if (invocationId !== ELDRITCH_INVOCATION.LESSONS_OF_THE_FIRST_ONES || !choiceValue) {
    return null;
  }

  return choiceValue as FEATS;
}

function getWarlockSelectedInvocationIds(
  character: WarlockInvocationCharacter
): Set<ELDRITCH_INVOCATION> {
  return getSelectedInvocationIdSetFromSelectionIds(getWarlockInvocationSelectionIds(character));
}

export function getWarlockPactBladeAdditionalAttackCount(
  character: WarlockInvocationCharacter
): number {
  return getWarlockPactBladeAdditionalAttackCountFromInvocationIds(
    getWarlockSelectedInvocationIds(character)
  );
}

export function hasWarlockPactBladeExtraAttackFeature(
  character: WarlockInvocationCharacter
): boolean {
  return getWarlockPactBladeAdditionalAttackCount(character) > 0;
}

export function getWarlockPactWeaponAttackMultiCount(
  character: WarlockInvocationCharacter
): number {
  if (!hasWarlockPactBladeExtraAttackFeature(character)) {
    return 0;
  }

  return getWarlockFeatureState(character).extraAttacksRemainingThisTurn ?? 0;
}

export function consumeWarlockPactWeaponAttack(
  character: Character,
  action: WeaponAttackConsumptionContext
): Character {
  const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);
  const consumeBaseAction = () =>
    roundTrackerResource &&
    isRoundTrackerResourceAvailable(character.roundTracker, roundTrackerResource)
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, roundTrackerResource)
        }
      : character;

  if (
    character.className !== "Warlock" ||
    action.economyType !== ECONOMY_TYPE.ACTION ||
    action.actionCategory !== ACTION_CATEGORY.ATTACK ||
    !isPactBladeWeaponAttackContext(character, action)
  ) {
    return consumeBaseAction();
  }

  const additionalAttackCount = getWarlockPactBladeAdditionalAttackCount(character);

  if (additionalAttackCount <= 0) {
    return consumeBaseAction();
  }

  const warlockState = getWarlockFeatureState(character);
  const extraAttacksRemaining = warlockState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable =
    roundTrackerResource !== null &&
    isRoundTrackerResourceAvailable(character.roundTracker, roundTrackerResource);

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, roundTrackerResource),
      classFeatureState: {
        ...character.classFeatureState,
        warlock: {
          ...warlockState,
          extraAttacksRemainingThisTurn: additionalAttackCount
        }
      }
    };
  }

  if (extraAttacksRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      warlock: {
        ...warlockState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
      }
    }
  };
}

export function getWarlockDerivedStatusEntries(
  character: WarlockInvocationCharacter
): DerivedFeatureStatusEntry[] {
  if (!getWarlockSelectedInvocationIds(character).has(ELDRITCH_INVOCATION.DEVILS_SIGHT)) {
    return [];
  }

  const invocation = getEldritchInvocationEntryById(ELDRITCH_INVOCATION.DEVILS_SIGHT);
  const name = invocation?.name ?? "Devil's Sight";
  const description = invocation?.description ?? [
    "You can see normally in Dim Light and Darkness, both magical and nonmagical, within 120 feet of yourself."
  ];

  return [
    {
      id: devilsSightStatusSourceId,
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DEVILS_SIGHT,
      source: name,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      sourceId: devilsSightStatusSourceId,
      rangeFeet: 120,
      description: description.join("\n")
    }
  ];
}

export function getWarlockFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellSlotsExpended">
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];
  const selectedInvocationIds = getWarlockSelectedInvocationIds(character);

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
        actionContextText: "Armor of Shadows is active.",
        actionAvailabilityText: "Cast without expending a spell slot.",
        actionConsumesSpellSlot: false
      }
    });
  }

  if (selectedInvocationIds.has(ELDRITCH_INVOCATION.ASCENDANT_STEP)) {
    const invocation = getEldritchInvocationEntryById(ELDRITCH_INVOCATION.ASCENDANT_STEP);
    const description = invocation?.description ?? [
      "You can cast Levitate on yourself without expending a spell slot."
    ];

    actions.push({
      key: ascendantStepActionKey,
      name: invocation?.name ?? "Ascendant Step",
      summary: "Cast Levitate without a spell slot.",
      detail: "Open Levitate and cast it without expending a spell slot.",
      breakdown: "Open Levitate",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      description,
      drawer: {
        kind: "confirm",
        eyebrow: "Eldritch Invocation",
        description,
        confirmLabel: "Open Levitate"
      },
      execute: {
        kind: "spell",
        spellSource: "fixed",
        effectKind: "ascendant-step",
        spellId: levitateSpellId,
        spellLevel: 2,
        label: "Open Levitate",
        actionContextText: "Ascendant Step is active.",
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
    actionKey === ascendantStepActionKey ||
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
  const warlockState = getWarlockFeatureState(character);
  const nextCharacter =
    (warlockState.extraAttacksRemainingThisTurn ?? 0) === 0
      ? character
      : {
          ...character,
          classFeatureState: {
            ...character.classFeatureState,
            warlock: {
              ...warlockState,
              extraAttacksRemainingThisTurn: 0
            }
          }
        };

  return advanceWarlockCelestialPatronFeaturesForNewRound(nextCharacter);
}

export const warlockBeguilingDefenseReactionId = beguilingDefenseReactionId;
