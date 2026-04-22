import {
  sorcererFeatureMap,
  sorcererFeatures,
  type SorcererFeatureClassObj
} from "../../../../codex/classes";
import { CLASS_FEATURE } from "../../../../codex/entries";
import type { Character, CharacterSorcererFeatureState } from "../../../../types";
import {
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../traits";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../spellcasting";
import {
  activateSorcererSubclassCrownOfSpellfire,
  activateSorcererSubclassFeatureAction,
  activateSorcererSubclassFeatureActionOption,
  activateSorcererSubclassFeatureActionOptions,
  getSorcererSubclassClockworkCavalcadeUsesTotal,
  getSorcererSubclassCrownOfSpellfireFallbackSorceryPointCost,
  getSorcererSubclassCrownOfSpellfireUsesRemaining,
  getSorcererSubclassCrownOfSpellfireUsesTotal,
  getSorcererSubclassDragonWingsUsesTotal,
  hasSorcererDraconicElementalAffinityFeature,
  getSorcererSubclassRestoreBalanceUsesTotal,
  getSorcererSubclassTamedSurgeUsesTotal,
  getSorcererSubclassTidesOfChaosUsesTotal,
  getSorcererSubclassTranceOfOrderUsesTotal,
  normalizeSorcererDraconicElementalAffinityDamageType,
  restoreSorcererSubclassFeaturesOnLongRest
} from "./subclasses";
import {
  createChargesAndUsageHeaderTags,
  createChargesCardUsage,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../cardUsage";
import type { FeatureActionCard, FeatureActionOptionCard } from "../types";

export const innateSorceryActionKey = "sorcerer-innate-sorcery";
export const fontOfMagicActionKey = "sorcerer-font-of-magic";
export const metamagicActionKey = "sorcerer-metamagic";

const sorcererInnateSorcerySource = "Innate Sorcery";
const sorcererInnateSorcerySourceId = "feature-sorcerer-innate-sorcery";
const sorcererInnateSorceryDurationRounds = 10;
const sorcererInnateSorceryUsesTotal = 2;
const sorcerousRestorationUsesTotal = 1;
const sorceryIncarnateInnateSorceryCost = 2;

export type SorcererMetamagicOptionKey =
  | "careful-spell"
  | "distant-spell"
  | "empowered-spell"
  | "extended-spell"
  | "heightened-spell"
  | "quickened-spell"
  | "seeking-spell"
  | "subtle-spell"
  | "transmuted-spell"
  | "twinned-spell";

export type SorcererMetamagicOptionDefinition = {
  key: SorcererMetamagicOptionKey;
  name: string;
  cost: number;
  summary: string;
  description: string[];
};

type SpellSlotCreationRule = {
  spellSlotLevel: 1 | 2 | 3 | 4 | 5;
  sorceryPointCost: number;
  minimumSorcererLevel: number;
};

const sorcererMetamagicDefinitions: SorcererMetamagicOptionDefinition[] = [
  {
    key: "careful-spell",
    name: "Careful Spell",
    cost: 1,
    summary: "Protect chosen creatures from a spell's save.",
    description: [
      "When you cast a spell that forces other creatures to make a saving throw, you can protect some of those creatures from the spell's full force.",
      "Choose a number of those creatures up to your Charisma modifier, minimum of one creature.",
      "A chosen creature automatically succeeds on its saving throw against the spell, and it takes no damage if it would normally take half damage on a successful save."
    ]
  },
  {
    key: "distant-spell",
    name: "Distant Spell",
    cost: 1,
    summary: "Extend a spell's range.",
    description: [
      "When you cast a spell that has a range of at least 5 feet, you can double the spell's range.",
      "Or when you cast a spell that has a range of Touch, you can make the spell's range 30 feet."
    ]
  },
  {
    key: "empowered-spell",
    name: "Empowered Spell",
    cost: 1,
    summary: "Reroll damage dice for a spell.",
    description: [
      "When you roll damage for a spell, you can reroll a number of the damage dice up to your Charisma modifier, minimum of one, and you must use the new rolls.",
      "You can use Empowered Spell even if you've already used a different Metamagic option during the casting of the spell."
    ]
  },
  {
    key: "extended-spell",
    name: "Extended Spell",
    cost: 1,
    summary: "Double a long spell duration.",
    description: [
      "When you cast a spell that has a duration of 1 minute or longer, you can double its duration to a maximum duration of 24 hours.",
      "If the affected spell requires Concentration, you have Advantage on any saving throw you make to maintain that Concentration."
    ]
  },
  {
    key: "heightened-spell",
    name: "Heightened Spell",
    cost: 2,
    summary: "Give one target Disadvantage on the spell's save.",
    description: [
      "When you cast a spell that forces a creature to make a saving throw, you can give one target of the spell Disadvantage on saves against the spell."
    ]
  },
  {
    key: "quickened-spell",
    name: "Quickened Spell",
    cost: 2,
    summary: "Turn an action spell into a Bonus Action spell.",
    description: [
      "When you cast a spell that has a casting time of an action, you can change the casting time to a Bonus Action for this casting.",
      "You can't modify a spell in this way if you've already cast a level 1+ spell on the current turn, nor can you cast a level 1+ spell on this turn after modifying a spell in this way."
    ]
  },
  {
    key: "seeking-spell",
    name: "Seeking Spell",
    cost: 1,
    summary: "Reroll a missed spell attack.",
    description: [
      "If you make an attack roll for a spell and miss, you can reroll the d20, and you must use the new roll.",
      "You can use Seeking Spell even if you've already used a different Metamagic option during the casting of the spell."
    ]
  },
  {
    key: "subtle-spell",
    name: "Subtle Spell",
    cost: 1,
    summary: "Cast without visible or audible components.",
    description: [
      "When you cast a spell, you can cast it without any Verbal, Somatic, or Material components, except Material components that are consumed by the spell or that have a cost specified in the spell."
    ]
  },
  {
    key: "transmuted-spell",
    name: "Transmuted Spell",
    cost: 1,
    summary: "Swap a qualifying spell's damage type.",
    description: [
      "When you cast a spell that deals Acid, Cold, Fire, Lightning, Poison, or Thunder damage, you can change that damage type to one of the other listed types."
    ]
  },
  {
    key: "twinned-spell",
    name: "Twinned Spell",
    cost: 1,
    summary: "Raise a spell's effective level to add another target.",
    description: [
      "When you cast a spell that can be cast with a higher-level spell slot to target an additional creature, you can increase the spell's effective level by 1."
    ]
  }
];

const sorcererMetamagicDefinitionsByKey = new Map(
  sorcererMetamagicDefinitions.map((definition) => [definition.key, definition])
);

const sorcererSpellSlotCreationRules: SpellSlotCreationRule[] = [
  {
    spellSlotLevel: 1,
    sorceryPointCost: 2,
    minimumSorcererLevel: 2
  },
  {
    spellSlotLevel: 2,
    sorceryPointCost: 3,
    minimumSorcererLevel: 3
  },
  {
    spellSlotLevel: 3,
    sorceryPointCost: 5,
    minimumSorcererLevel: 5
  },
  {
    spellSlotLevel: 4,
    sorceryPointCost: 6,
    minimumSorcererLevel: 7
  },
  {
    spellSlotLevel: 5,
    sorceryPointCost: 7,
    minimumSorcererLevel: 9
  }
];

function dedupe<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function getSorcererFeatureRow(level: number): SorcererFeatureClassObj | null {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = sorcererFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? (matchingRows[matchingRows.length - 1] ?? null) : null;
}

function getUnlockedSorcererFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return sorcererFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

function getSorcererFeatureState(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): CharacterSorcererFeatureState {
  return normalizeSorcererFeatureState(character.classFeatureState?.sorcerer, character);
}

function getSorcererFeatureDescription(feature: CLASS_FEATURE): string[] {
  return (sorcererFeatureMap[feature]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
}

export function hasActiveInnateSorcery(character: Pick<Character, "statusEntries">): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) => entry.sourceId === sorcererInnateSorcerySourceId
  );
}

function normalizeActionMetamagicSelections(
  value: unknown,
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">,
  maxSelections: number
): SorcererMetamagicOptionKey[] {
  if (!Array.isArray(value) || maxSelections <= 0) {
    return [];
  }

  const knownSelections = new Set(getSorcererMetamagicSelections(character));

  return dedupe(
    value.filter(
      (entry): entry is SorcererMetamagicOptionKey =>
        typeof entry === "string" &&
        sorcererMetamagicDefinitionsByKey.has(entry as SorcererMetamagicOptionKey) &&
        knownSelections.has(entry as SorcererMetamagicOptionKey)
    )
  ).slice(0, maxSelections);
}

function normalizeMetamagicSelections(
  value: unknown,
  maxSelections: number
): SorcererMetamagicOptionKey[] {
  if (!Array.isArray(value) || maxSelections <= 0) {
    return [];
  }

  return dedupe(
    value.filter(
      (entry): entry is SorcererMetamagicOptionKey =>
        typeof entry === "string" &&
        sorcererMetamagicDefinitionsByKey.has(entry as SorcererMetamagicOptionKey)
    )
  ).slice(0, maxSelections);
}

function updateSorceryPointsExpended(
  character: Character,
  updater: (currentExpended: number, totalPoints: number) => number
): Character {
  const totalPoints = getSorceryPointsTotal(character);

  if (totalPoints <= 0) {
    return character;
  }

  const sorcererState = getSorcererFeatureState(character);
  const currentExpended = sorcererState.sorceryPointsExpended ?? 0;
  const nextExpended = Math.max(
    0,
    Math.min(totalPoints, Math.floor(updater(currentExpended, totalPoints)))
  );

  if (nextExpended === currentExpended) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...sorcererState,
        sorceryPointsExpended: nextExpended
      }
    }
  };
}

function formatSorceryPointCostLabel(cost: number): string {
  return `${cost} Sorcery Point${cost === 1 ? "" : "s"}`;
}

export function hasSorcererFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Sorcerer") {
    return false;
  }

  return getUnlockedSorcererFeatures(character.level).has(feature);
}

export function normalizeSorcererFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): CharacterSorcererFeatureState {
  const hasInnateSorcery = hasSorcererFeature(character, CLASS_FEATURE.INNATE_SORCERY);
  const hasFontOfMagic = hasSorcererFeature(character, CLASS_FEATURE.FONT_OF_MAGIC);
  const hasSorcerousRestoration = hasSorcererFeature(
    character,
    CLASS_FEATURE.SORCEROUS_RESTORATION
  );
  const hasArcaneApotheosis = hasSorcererFeature(character, CLASS_FEATURE.ARCANE_APOTHEOSIS);
  const hasDraconicElementalAffinity = hasSorcererDraconicElementalAffinityFeature(character);
  const dragonWingsUsesTotal = getSorcererSubclassDragonWingsUsesTotal(character);
  const metamagicSelectionCount = getSorcererMetamagicSelectionCount(character);
  const clockworkCavalcadeUsesTotal = getSorcererSubclassClockworkCavalcadeUsesTotal(character);
  const crownOfSpellfireUsesTotal = getSorcererSubclassCrownOfSpellfireUsesTotal(character);
  const restoreBalanceUsesTotal = getSorcererSubclassRestoreBalanceUsesTotal(character);
  const tamedSurgeUsesTotal = getSorcererSubclassTamedSurgeUsesTotal(character);
  const tidesOfChaosUsesTotal = getSorcererSubclassTidesOfChaosUsesTotal(character);
  const tranceOfOrderUsesTotal = getSorcererSubclassTranceOfOrderUsesTotal(character);

  if (
    !hasInnateSorcery &&
    !hasFontOfMagic &&
    !hasSorcerousRestoration &&
    !hasArcaneApotheosis &&
    !hasDraconicElementalAffinity &&
    dragonWingsUsesTotal <= 0 &&
    clockworkCavalcadeUsesTotal <= 0 &&
    crownOfSpellfireUsesTotal <= 0 &&
    restoreBalanceUsesTotal <= 0 &&
    tamedSurgeUsesTotal <= 0 &&
    tidesOfChaosUsesTotal <= 0 &&
    tranceOfOrderUsesTotal <= 0 &&
    metamagicSelectionCount <= 0
  ) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterSorcererFeatureState>) : {};
  const totalSorceryPoints = hasFontOfMagic ? getSorceryPointsTotal(character) : 0;
  const sorceryPointsExpended = Number(record.sorceryPointsExpended);
  const innateSorceryUsesExpended = Number(record.innateSorceryUsesExpended);
  const tamedSurgeUsesExpended = Number(record.tamedSurgeUsesExpended);
  const tidesOfChaosUsesExpended = Number(record.tidesOfChaosUsesExpended);
  const crownOfSpellfireUsesExpended = Number(record.crownOfSpellfireUsesExpended);
  const sorcerousRestorationUsesExpended = Number(record.sorcerousRestorationUsesExpended);
  const dragonWingsUsesExpended = Number(record.dragonWingsUsesExpended);
  const clockworkCavalcadeUsesExpended = Number(record.clockworkCavalcadeUsesExpended);
  const restoreBalanceUsesExpended = Number(record.restoreBalanceUsesExpended);
  const tranceOfOrderUsesExpended = Number(record.tranceOfOrderUsesExpended);
  const warpingImplosionUsesExpended = Number(record.warpingImplosionUsesExpended);
  const arcaneApotheosisFreeMetamagicUsedThisTurn =
    record.arcaneApotheosisFreeMetamagicUsedThisTurn === true;

  return {
    sorceryPointsExpended:
      hasFontOfMagic && Number.isFinite(sorceryPointsExpended)
        ? Math.max(0, Math.min(totalSorceryPoints, Math.floor(sorceryPointsExpended)))
        : 0,
    innateSorceryUsesExpended:
      hasInnateSorcery && Number.isFinite(innateSorceryUsesExpended)
        ? Math.max(
            0,
            Math.min(sorcererInnateSorceryUsesTotal, Math.floor(innateSorceryUsesExpended))
          )
        : 0,
    tamedSurgeUsesExpended:
      tamedSurgeUsesTotal > 0 && Number.isFinite(tamedSurgeUsesExpended)
        ? Math.max(0, Math.min(tamedSurgeUsesTotal, Math.floor(tamedSurgeUsesExpended)))
        : 0,
    tidesOfChaosUsesExpended:
      tidesOfChaosUsesTotal > 0 && Number.isFinite(tidesOfChaosUsesExpended)
        ? Math.max(0, Math.min(tidesOfChaosUsesTotal, Math.floor(tidesOfChaosUsesExpended)))
        : 0,
    crownOfSpellfireUsesExpended:
      crownOfSpellfireUsesTotal > 0 && Number.isFinite(crownOfSpellfireUsesExpended)
        ? Math.max(0, Math.min(crownOfSpellfireUsesTotal, Math.floor(crownOfSpellfireUsesExpended)))
        : 0,
    sorcerousRestorationUsesExpended:
      hasSorcerousRestoration && Number.isFinite(sorcerousRestorationUsesExpended)
        ? Math.max(
            0,
            Math.min(sorcerousRestorationUsesTotal, Math.floor(sorcerousRestorationUsesExpended))
          )
        : 0,
    dragonWingsUsesExpended:
      dragonWingsUsesTotal > 0 && Number.isFinite(dragonWingsUsesExpended)
        ? Math.max(0, Math.min(dragonWingsUsesTotal, Math.floor(dragonWingsUsesExpended)))
        : 0,
    clockworkCavalcadeUsesExpended:
      clockworkCavalcadeUsesTotal > 0 && Number.isFinite(clockworkCavalcadeUsesExpended)
        ? Math.max(
            0,
            Math.min(clockworkCavalcadeUsesTotal, Math.floor(clockworkCavalcadeUsesExpended))
          )
        : 0,
    restoreBalanceUsesExpended:
      restoreBalanceUsesTotal > 0 && Number.isFinite(restoreBalanceUsesExpended)
        ? Math.max(0, Math.min(restoreBalanceUsesTotal, Math.floor(restoreBalanceUsesExpended)))
        : 0,
    tranceOfOrderUsesExpended:
      tranceOfOrderUsesTotal > 0 && Number.isFinite(tranceOfOrderUsesExpended)
        ? Math.max(0, Math.min(tranceOfOrderUsesTotal, Math.floor(tranceOfOrderUsesExpended)))
        : 0,
    warpingImplosionUsesExpended: Number.isFinite(warpingImplosionUsesExpended)
      ? Math.max(0, Math.min(1, Math.floor(warpingImplosionUsesExpended)))
      : 0,
    arcaneApotheosisFreeMetamagicUsedThisTurn: hasArcaneApotheosis
      ? arcaneApotheosisFreeMetamagicUsedThisTurn
      : false,
    draconicElementalAffinityDamageType: hasDraconicElementalAffinity
      ? normalizeSorcererDraconicElementalAffinityDamageType(
          record.draconicElementalAffinityDamageType
        )
      : undefined,
    metamagicSelections: normalizeMetamagicSelections(
      record.metamagicSelections,
      metamagicSelectionCount
    )
  };
}

export function getSorceryPointsTotal(character: Pick<Character, "className" | "level">): number {
  if (!hasSorcererFeature(character, CLASS_FEATURE.FONT_OF_MAGIC)) {
    return 0;
  }

  return Math.max(0, getSorcererFeatureRow(character.level)?.sorceryPoints ?? 0);
}

export function getSorceryPointsRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalPoints = getSorceryPointsTotal(character);
  const sorcererState = getSorcererFeatureState(character);
  return Math.max(0, totalPoints - (sorcererState.sorceryPointsExpended ?? 0));
}

export function getInnateSorceryUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  return hasSorcererFeature(character, CLASS_FEATURE.INNATE_SORCERY)
    ? sorcererInnateSorceryUsesTotal
    : 0;
}

export function getInnateSorceryUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getInnateSorceryUsesTotal(character);
  const sorcererState = getSorcererFeatureState(character);
  return Math.max(0, totalUses - (sorcererState.innateSorceryUsesExpended ?? 0));
}

export function getSorcerousRestorationUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  return hasSorcererFeature(character, CLASS_FEATURE.SORCEROUS_RESTORATION)
    ? sorcerousRestorationUsesTotal
    : 0;
}

export function getSorcerousRestorationUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getSorcerousRestorationUsesTotal(character);
  const sorcererState = getSorcererFeatureState(character);

  return Math.max(0, totalUses - (sorcererState.sorcerousRestorationUsesExpended ?? 0));
}

export function getInnateSorceryActivationSorceryPointCost(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): number {
  if (
    !hasSorcererFeature(character, CLASS_FEATURE.SORCERY_INCARNATE) ||
    hasActiveInnateSorcery(character) ||
    getInnateSorceryUsesRemaining(character) > 0
  ) {
    return 0;
  }

  return sorceryIncarnateInnateSorceryCost;
}

export function getSorcererMetamagicSelectionCount(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasSorcererFeature(character, CLASS_FEATURE.METAMAGIC)) {
    return 0;
  }

  if (character.level >= 17) {
    return 6;
  }

  if (character.level >= 10) {
    return 4;
  }

  return 2;
}

export function getSorcererMetamagicSelectionLimitForAction(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): number {
  if (
    hasSorcererFeature(character, CLASS_FEATURE.SORCERY_INCARNATE) &&
    hasActiveInnateSorcery(character)
  ) {
    return 2;
  }

  return 1;
}

export function hasArcaneApotheosisFreeMetamagicAvailable(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): boolean {
  if (
    !hasSorcererFeature(character, CLASS_FEATURE.ARCANE_APOTHEOSIS) ||
    !hasActiveInnateSorcery(character)
  ) {
    return false;
  }

  return getSorcererFeatureState(character).arcaneApotheosisFreeMetamagicUsedThisTurn !== true;
}

export function getSorcererMetamagicActionCost(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">,
  optionKeys: string[]
): number {
  const selectedOptions = normalizeActionMetamagicSelections(
    optionKeys,
    character,
    getSorcererMetamagicSelectionLimitForAction(character)
  )
    .map((optionKey) => sorcererMetamagicDefinitionsByKey.get(optionKey) ?? null)
    .filter((option): option is SorcererMetamagicOptionDefinition => option !== null);

  if (selectedOptions.length <= 0) {
    return 0;
  }

  const baseCost = selectedOptions.reduce((sum, option) => sum + option.cost, 0);
  const freeCostReduction = hasArcaneApotheosisFreeMetamagicAvailable(character)
    ? Math.max(...selectedOptions.map((option) => option.cost))
    : 0;

  return Math.max(0, baseCost - freeCostReduction);
}

export function getSorcererMetamagicDefinitions(): SorcererMetamagicOptionDefinition[] {
  return sorcererMetamagicDefinitions;
}

export function getSorcererMetamagicSelections(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SorcererMetamagicOptionKey[] {
  return normalizeMetamagicSelections(
    getSorcererFeatureState(character).metamagicSelections,
    getSorcererMetamagicSelectionCount(character)
  );
}

export function getSelectedSorcererMetamagicOptions(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SorcererMetamagicOptionDefinition[] {
  return getSorcererMetamagicSelections(character)
    .map((selection) => sorcererMetamagicDefinitionsByKey.get(selection) ?? null)
    .filter((definition): definition is SorcererMetamagicOptionDefinition => definition !== null);
}

export function setSorcererMetamagicSelections(
  character: Character,
  selections: SorcererMetamagicOptionKey[]
): Character {
  const sorcererState = getSorcererFeatureState(character);
  const normalizedSelections = normalizeMetamagicSelections(
    selections,
    getSorcererMetamagicSelectionCount(character)
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...sorcererState,
        metamagicSelections: normalizedSelections
      }
    }
  };
}

export function getSorcererFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (hasSorcererFeature(character, CLASS_FEATURE.INNATE_SORCERY)) {
    const isActive = hasActiveInnateSorcery(character);
    const remainingUses = getInnateSorceryUsesRemaining(character);
    const fallbackSorceryPointCost = getInnateSorceryActivationSorceryPointCost(character);
    const fallbackAvailable =
      fallbackSorceryPointCost > 0 &&
      getSorceryPointsRemaining(character) >= fallbackSorceryPointCost;
    const disabledReason = isActive
      ? "Innate Sorcery is already active."
      : remainingUses > 0
        ? undefined
        : fallbackSorceryPointCost > 0
          ? fallbackAvailable
            ? undefined
            : `You need ${fallbackSorceryPointCost} Sorcery Points.`
          : "No charges remaining.";
    actions.push({
      key: innateSorceryActionKey,
      name: "Innate Sorcery",
      summary: "Unleash inner magic for 10 rounds.",
      detail: "Unleash inner magic for 10 rounds.",
      breakdown: "10-round magic surge",
      description: getSorcererFeatureDescription(CLASS_FEATURE.INNATE_SORCERY),
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      cardUsage:
        fallbackSorceryPointCost > 0
          ? createChargesOrResourceCardUsage(
              remainingUses,
              getInnateSorceryUsesTotal(character),
              createFeatureActionCardCost({
                amountText: String(fallbackSorceryPointCost),
                icon: "sparkles"
              })
            )
          : createChargesCardUsage(remainingUses, getInnateSorceryUsesTotal(character)),
      usesRemaining: remainingUses,
      usesTotal: getInnateSorceryUsesTotal(character),
      usesInlineLabel:
        remainingUses <= 0 && fallbackSorceryPointCost > 0
          ? `| Use ${fallbackSorceryPointCost}`
          : undefined,
      usesInlineIcon: remainingUses <= 0 && fallbackSorceryPointCost > 0 ? "sparkles" : undefined,
      usesInlineSuffix: remainingUses <= 0 && fallbackSorceryPointCost > 0 ? "instead" : undefined,
      headerTags:
        fallbackSorceryPointCost > 0
          ? createChargesAndUsageHeaderTags(
              remainingUses,
              getInnateSorceryUsesTotal(character),
              createFeatureActionCardCost({
                amountText: String(fallbackSorceryPointCost),
                icon: "sparkles"
              }),
              getSorceryPointsRemaining(character),
              getSorceryPointsTotal(character),
              {
                icon: "sparkles"
              }
            )
          : undefined,
      isActive,
      disabled: Boolean(disabledReason),
      disabledReason
    });
  }

  if (hasSorcererFeature(character, CLASS_FEATURE.FONT_OF_MAGIC)) {
    actions.push({
      key: fontOfMagicActionKey,
      name: "Font of Magic",
      summary: "Convert spell slots and Sorcery Points.",
      detail: "Convert spell slots and Sorcery Points.",
      breakdown: "Convert slots and SP",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      valueLabel: "Uses Sorcery Points",
      drawer: {
        kind: "custom-form",
        eyebrow: "Sorcerer",
        formKind: "font-of-magic"
      },
    execute: {
      kind: "custom-form",
      formKind: "font-of-magic"
    },
      ignoreEconomyAvailability: true
    });
  }

  if (hasSorcererFeature(character, CLASS_FEATURE.METAMAGIC)) {
    const remainingPoints = getSorceryPointsRemaining(character);
    const selectedOptions = getSelectedSorcererMetamagicOptions(character);
    const freeMetamagicAvailable = hasArcaneApotheosisFreeMetamagicAvailable(character);
    const disabledReason =
      selectedOptions.length <= 0
        ? "Choose Metamagic options in Class Features & Feats."
        : remainingPoints <= 0 && !freeMetamagicAvailable
          ? "No Sorcery Points remaining."
          : undefined;

    actions.push({
      key: metamagicActionKey,
      name: "Metamagic",
      summary: "Infuse your next spell.",
      detail: "Spend Sorcery Points to infuse your next spell.",
      breakdown: "Empower next spell",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.MAGIC,
      valueLabel: "Uses Sorcery Points",
      drawer: {
        kind: "options",
        eyebrow: "Sorcerer",
        optionSelection: "multi-confirm",
        optionSelectionLimit: getSorcererMetamagicSelectionLimitForAction(character)
      },
    execute: {
      kind: "option"
    },
      disabled: Boolean(disabledReason),
      disabledReason
    });
  }

  return actions;
}

export function getSorcererMetamagicOptionsForAction(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): FeatureActionOptionCard[] {
  const remainingPoints = getSorceryPointsRemaining(character);
  const freeMetamagicAvailable = hasArcaneApotheosisFreeMetamagicAvailable(character);

  return getSelectedSorcererMetamagicOptions(character).map((option) => ({
    key: option.key,
    name: option.name,
    summary: `Cost: ${formatSorceryPointCostLabel(option.cost)}`,
    detail: option.description[0] ?? option.summary,
    breakdown: option.summary,
    usesLabel: String(option.cost),
    usesIcon: "sparkles",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.MAGIC,
    disabled: option.cost > remainingPoints && !freeMetamagicAvailable,
    disabledReason:
      option.cost > remainingPoints && !freeMetamagicAvailable
        ? `You need ${formatSorceryPointCostLabel(option.cost)}.`
        : undefined
  }));
}

export function getSorcererSpellSlotCreationRules(): SpellSlotCreationRule[] {
  return sorcererSpellSlotCreationRules;
}

export function restoreOneSorceryPoint(character: Character): Character {
  return updateSorceryPointsExpended(character, (currentExpended) => currentExpended - 1);
}

export function expendOneSorceryPoint(character: Character): Character {
  return updateSorceryPointsExpended(character, (currentExpended) => currentExpended + 1);
}

export function restoreAllSorceryPoints(character: Character): Character {
  return updateSorceryPointsExpended(character, () => 0);
}

export function spendSorceryPoints(character: Character, cost: number): Character {
  if (!Number.isFinite(cost) || cost <= 0) {
    return character;
  }

  if (getSorceryPointsRemaining(character) < Math.floor(cost)) {
    return character;
  }

  return updateSorceryPointsExpended(character, (currentExpended) => currentExpended + cost);
}

export function activateInnateSorcery(
  character: Character,
  options?: {
    useCrownOfSpellfire?: boolean;
  }
): Character {
  if (
    !hasSorcererFeature(character, CLASS_FEATURE.INNATE_SORCERY) ||
    hasActiveInnateSorcery(character)
  ) {
    return character;
  }

  const useCrownOfSpellfire = options?.useCrownOfSpellfire === true;
  const usesRemaining = getInnateSorceryUsesRemaining(character);
  const fallbackSorceryPointCost = getInnateSorceryActivationSorceryPointCost(character);
  const crownOfSpellfireUsesRemaining = getSorcererSubclassCrownOfSpellfireUsesRemaining(character);
  const crownOfSpellfireFallbackSorceryPointCost =
    getSorcererSubclassCrownOfSpellfireFallbackSorceryPointCost(character);
  const totalSorceryPointCost =
    fallbackSorceryPointCost +
    (useCrownOfSpellfire && crownOfSpellfireUsesRemaining <= 0
      ? crownOfSpellfireFallbackSorceryPointCost
      : 0);

  if (useCrownOfSpellfire && getSorcererSubclassCrownOfSpellfireUsesTotal(character) <= 0) {
    return character;
  }

  if (totalSorceryPointCost > 0 && getSorceryPointsRemaining(character) < totalSorceryPointCost) {
    return character;
  }

  let nextCharacter: Character = character;

  if (usesRemaining > 0) {
    const sorcererState = getSorcererFeatureState(character);
    nextCharacter = {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        sorcerer: {
          ...sorcererState,
          innateSorceryUsesExpended: (sorcererState.innateSorceryUsesExpended ?? 0) + 1
        }
      }
    };
  } else {
    if (fallbackSorceryPointCost <= 0) {
      return character;
    }

    nextCharacter = spendSorceryPoints(character, fallbackSorceryPointCost);

    if (nextCharacter === character) {
      return character;
    }
  }

  nextCharacter = {
    ...nextCharacter,
    statusEntries: [
      ...normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
        (entry) => entry.sourceId !== sorcererInnateSorcerySourceId
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: sorcererInnateSorcerySource,
        source: sorcererInnateSorcerySource,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: sorcererInnateSorceryDurationRounds
        },
        sourceId: sorcererInnateSorcerySourceId
      })
    ]
  };

  return useCrownOfSpellfire
    ? activateSorcererSubclassCrownOfSpellfire(nextCharacter)
    : nextCharacter;
}

export function activateSorcererFeatureAction(
  character: Character,
  actionKey: string
): Character | null {
  if (actionKey === innateSorceryActionKey) {
    return activateInnateSorcery(character);
  }

  return activateSorcererSubclassFeatureAction(character, actionKey);
}

export function activateSorcererFeatureActionOption(
  character: Character,
  actionKey: string,
  optionKey: string
): Character | null {
  return activateSorcererSubclassFeatureActionOption(character, actionKey, optionKey);
}

export function activateSorcererFeatureActionOptions(
  character: Character,
  actionKey: string,
  optionKeys: string[]
): Character | null {
  if (actionKey === metamagicActionKey) {
    return spendMetamagicOptions(character, optionKeys);
  }

  return activateSorcererSubclassFeatureActionOptions(character, actionKey, optionKeys);
}

export function spendMetamagicOption(character: Character, optionKey: string): Character {
  return spendMetamagicOptions(character, [optionKey]);
}

export function spendMetamagicOptions(character: Character, optionKeys: string[]): Character {
  const validSelections = normalizeActionMetamagicSelections(
    optionKeys,
    character,
    Number.MAX_SAFE_INTEGER
  );
  const normalizedSelections = validSelections.slice(
    0,
    getSorcererMetamagicSelectionLimitForAction(character)
  );

  if (normalizedSelections.length <= 0 || normalizedSelections.length !== validSelections.length) {
    return character;
  }

  const sorceryPointCost = getSorcererMetamagicActionCost(character, normalizedSelections);

  if (sorceryPointCost > getSorceryPointsRemaining(character)) {
    return character;
  }

  const nextCharacter =
    sorceryPointCost > 0 ? spendSorceryPoints(character, sorceryPointCost) : character;
  const freeMetamagicAvailable = hasArcaneApotheosisFreeMetamagicAvailable(character);

  if (!freeMetamagicAvailable) {
    return nextCharacter;
  }

  const sorcererState = getSorcererFeatureState(nextCharacter);

  return {
    ...nextCharacter,
    classFeatureState: {
      ...nextCharacter.classFeatureState,
      sorcerer: {
        ...sorcererState,
        arcaneApotheosisFreeMetamagicUsedThisTurn: true
      }
    }
  };
}

export function convertSpellSlotToSorceryPoints(
  character: Character,
  spellSlotLevel: number
): Character {
  if (!hasSorcererFeature(character, CLASS_FEATURE.FONT_OF_MAGIC)) {
    return character;
  }

  const normalizedSpellSlotLevel = Math.max(1, Math.min(9, Math.floor(spellSlotLevel)));
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const slotIndex = normalizedSpellSlotLevel - 1;
  const remainingSpellSlots = Math.max(
    0,
    (spellSlotTotals[slotIndex] ?? 0) - (spellSlotsExpended[slotIndex] ?? 0)
  );
  const remainingSorceryPoints = getSorceryPointsRemaining(character);
  const totalSorceryPoints = getSorceryPointsTotal(character);

  if (
    remainingSpellSlots <= 0 ||
    remainingSorceryPoints + normalizedSpellSlotLevel > totalSorceryPoints
  ) {
    return character;
  }

  const nextSpellSlotsExpended = [...spellSlotsExpended];
  nextSpellSlotsExpended[slotIndex] += 1;
  const nextCharacter = updateSorceryPointsExpended(
    character,
    (currentExpended) => currentExpended - normalizedSpellSlotLevel
  );

  if (nextCharacter === character) {
    return character;
  }

  return {
    ...nextCharacter,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

export function createSpellSlotFromSorceryPoints(
  character: Character,
  spellSlotLevel: number
): Character {
  if (!hasSorcererFeature(character, CLASS_FEATURE.FONT_OF_MAGIC)) {
    return character;
  }

  const rule =
    sorcererSpellSlotCreationRules.find((entry) => entry.spellSlotLevel === spellSlotLevel) ?? null;

  if (!rule || character.level < rule.minimumSorcererLevel) {
    return character;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const slotIndex = spellSlotLevel - 1;

  if (
    (spellSlotsExpended[slotIndex] ?? 0) <= 0 ||
    getSorceryPointsRemaining(character) < rule.sorceryPointCost
  ) {
    return character;
  }

  const nextCharacter = spendSorceryPoints(character, rule.sorceryPointCost);

  if (nextCharacter === character) {
    return character;
  }

  const nextSpellSlotsExpended = normalizeSpellSlotsExpended(
    nextCharacter.spellSlotsExpended,
    spellSlotTotals
  );
  nextSpellSlotsExpended[slotIndex] = Math.max(0, nextSpellSlotsExpended[slotIndex] - 1);

  return {
    ...nextCharacter,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

export function restoreInnateSorceryOnLongRest(character: Character): Character {
  if (!hasSorcererFeature(character, CLASS_FEATURE.INNATE_SORCERY)) {
    return character;
  }

  const sorcererState = getSorcererFeatureState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...sorcererState,
        innateSorceryUsesExpended: 0
      }
    }
  };
}

export function restoreSorcerousRestorationOnLongRest(character: Character): Character {
  if (!hasSorcererFeature(character, CLASS_FEATURE.SORCEROUS_RESTORATION)) {
    return character;
  }

  const sorcererState = getSorcererFeatureState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...sorcererState,
        sorcerousRestorationUsesExpended: 0
      }
    }
  };
}

export function restoreSorceryPointsOnLongRest(character: Character): Character {
  return restoreAllSorceryPoints(character);
}

export function applySorcerousRestorationOnShortRest(character: Character): Character {
  if (!hasSorcererFeature(character, CLASS_FEATURE.SORCEROUS_RESTORATION)) {
    return character;
  }

  if (getSorcerousRestorationUsesRemaining(character) <= 0) {
    return character;
  }

  const sorceryPointsToRestore = Math.max(0, Math.floor(character.level / 2));
  const nextCharacter =
    sorceryPointsToRestore > 0
      ? updateSorceryPointsExpended(
          character,
          (currentExpended) => currentExpended - sorceryPointsToRestore
        )
      : character;
  const sorcererState = getSorcererFeatureState(nextCharacter);

  return {
    ...nextCharacter,
    classFeatureState: {
      ...nextCharacter.classFeatureState,
      sorcerer: {
        ...sorcererState,
        sorcerousRestorationUsesExpended: Math.min(
          sorcerousRestorationUsesTotal,
          (sorcererState.sorcerousRestorationUsesExpended ?? 0) + 1
        )
      }
    }
  };
}

export function applyShortRestToSorcererFeatures(character: Character): Character {
  return character;
}

export function applyLongRestToSorcererFeatures(character: Character): Character {
  return restoreSorcererSubclassFeaturesOnLongRest(
    restoreSorcerousRestorationOnLongRest(
      restoreInnateSorceryOnLongRest(restoreSorceryPointsOnLongRest(character))
    )
  );
}

export function advanceSorcererFeaturesForNewRound(character: Character): Character {
  if (!hasSorcererFeature(character, CLASS_FEATURE.ARCANE_APOTHEOSIS)) {
    return character;
  }

  const sorcererState = getSorcererFeatureState(character);

  if (!sorcererState.arcaneApotheosisFreeMetamagicUsedThisTurn) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      sorcerer: {
        ...sorcererState,
        arcaneApotheosisFreeMetamagicUsedThisTurn: false
      }
    }
  };
}
