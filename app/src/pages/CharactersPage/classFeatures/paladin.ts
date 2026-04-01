import {
  CLASS_FEATURE,
  WEAPON_COMBAT_TYPE,
  getDivinityEntryById,
} from "../../../codex/entries";
import { paladinFeatures } from "../../../codex/classes";
import type {
  Character,
  CharacterPaladinFeatureState,
  WeaponProficiencyEntry
} from "../../../types";
import {
  CONDITION_NAME,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  WEAPON_PROFICIENCY
} from "../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../actionEconomy";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../combat";
import {
  getEffectiveHitPointMaximumForCharacter,
  hasStatusCondition,
  normalizeCharacterStatusEntries,
  reconcileCharacterStatusConsequences
} from "../traits";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureDamageBonus,
  FeatureWeaponProficiencyEntry
} from "./types";
import {
  getWeaponMasteryOptions,
  normalizeWeaponMasterySelections
} from "./weaponMastery";

export const paladinLayOnHandsActionKey = "paladin-lay-on-hands";
export const paladinChannelDivinityActionKey = "paladin-channel-divinity";
export const paladinsSmiteActionKey = "paladin-paladins-smite";
export const faithfulSteedActionKey = "paladin-faithful-steed";
export const abjureFoesActionKey = "paladin-abjure-foes";
const paladinWeaponMasterySource = "Weapon Mastery";
const paladinWeaponMasterySelectionCount = 2;
const divineSmiteSpellId = "spell-divine-smite";
const findSteedSpellId = "spell-find-steed";
const paladinsSmiteUsesTotal = 1;
const faithfulSteedUsesTotal = 1;
const paladinDivineSenseOptionKey = "paladin-divine-sense";
const auraOfProtectionStatusSourceId = "feature-paladin-aura-of-protection";
const auraOfCourageStatusSourceId = "feature-paladin-aura-of-courage";
const auraOfCourageImmunitySourceId = "feature-paladin-aura-of-courage-immunity";
const radiantStrikesDamageFormula = "1d8";
const radiantStrikesDamageLabel = "1d8 Radiant";

const layOnHandsPoisonedConditionCost = 5;
const layOnHandsBaseCurableConditions = [CONDITION_NAME.POISONED] as const;
const layOnHandsRestoringTouchConditions = [
  CONDITION_NAME.BLINDED,
  CONDITION_NAME.CHARMED,
  CONDITION_NAME.DEAFENED,
  CONDITION_NAME.FRIGHTENED,
  CONDITION_NAME.PARALYZED,
  CONDITION_NAME.STUNNED
] as const;
const paladinWeaponMasteryOptions = getWeaponMasteryOptions();

export type LayOnHandsTarget = "self" | "other";
export type LayOnHandsCondition =
  | (typeof layOnHandsBaseCurableConditions)[number]
  | (typeof layOnHandsRestoringTouchConditions)[number];

type LayOnHandsOptions = {
  target: LayOnHandsTarget;
  poolSpendAmount: number;
  conditions: LayOnHandsCondition[];
};

function dedupe<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function getDivinityDescriptionLine(index: number): string {
  const divineSense = getDivinityEntryById("divinity-divine-sense");
  const line = divineSense?.description[index];

  return typeof line === "string" ? line : "";
}

function getPaladinFeatureRow(level: number) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = paladinFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;
}

function getUnlockedPaladinFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return paladinFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

export function hasPaladinFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Paladin") {
    return false;
  }

  return getUnlockedPaladinFeatures(character.level).has(feature);
}

function getPaladinAdditionalAttackCount(
  character: Pick<Character, "className" | "level">
): number {
  return hasPaladinFeature(character, CLASS_FEATURE.EXTRA_ATTACK) ? 1 : 0;
}

export function normalizePaladinFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level">
): CharacterPaladinFeatureState {
  const hasLayOnHands = hasPaladinFeature(character, CLASS_FEATURE.LAY_ON_HANDS);
  const hasChannelDivinity = hasPaladinFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY);
  const hasPaladinsSmite = hasPaladinFeature(character, CLASS_FEATURE.PALADINS_SMITE);
  const hasFaithfulSteed = hasPaladinFeature(character, CLASS_FEATURE.FAITHFUL_STEED);
  const hasWeaponMastery = hasPaladinFeature(character, CLASS_FEATURE.WEAPON_MASTERY);
  const additionalAttackCount = getPaladinAdditionalAttackCount(character);
  const hasExtraAttack = additionalAttackCount > 0;

  if (
    !hasLayOnHands &&
    !hasChannelDivinity &&
    !hasPaladinsSmite &&
    !hasFaithfulSteed &&
    !hasWeaponMastery &&
    !hasExtraAttack
  ) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterPaladinFeatureState>) : {};
  const layOnHandsExpended = Number(record.layOnHandsExpended);
  const channelDivinityUsesExpended = Number(record.channelDivinityUsesExpended);
  const paladinsSmiteUsesExpended = Number(record.paladinsSmiteUsesExpended);
  const faithfulSteedUsesExpended = Number(record.faithfulSteedUsesExpended);
  const channelDivinityTotal = hasChannelDivinity
    ? (getPaladinFeatureRow(character.level)?.channelDivinity ?? 0)
    : 0;
  const totalPool = hasLayOnHands ? getPaladinHealingPoolTotal(character) : 0;
  return {
    layOnHandsExpended: hasLayOnHands
      ? Number.isFinite(layOnHandsExpended)
        ? Math.max(0, Math.min(totalPool, Math.floor(layOnHandsExpended)))
        : 0
      : undefined,
    channelDivinityUsesExpended: hasChannelDivinity
      ? Math.max(
          0,
          Math.min(
            channelDivinityTotal,
            Number.isFinite(channelDivinityUsesExpended)
              ? Math.floor(channelDivinityUsesExpended)
              : 0
          )
        )
      : undefined,
    paladinsSmiteUsesExpended: hasPaladinsSmite
      ? Number.isFinite(paladinsSmiteUsesExpended)
        ? Math.max(0, Math.min(paladinsSmiteUsesTotal, Math.floor(paladinsSmiteUsesExpended)))
        : 0
      : undefined,
    faithfulSteedUsesExpended: hasFaithfulSteed
      ? Number.isFinite(faithfulSteedUsesExpended)
        ? Math.max(0, Math.min(faithfulSteedUsesTotal, Math.floor(faithfulSteedUsesExpended)))
        : 0
      : undefined,
    extraAttacksRemainingThisTurn: hasExtraAttack
      ? Math.max(
          0,
          Math.min(
            additionalAttackCount,
            Number.isFinite(Number(record.extraAttacksRemainingThisTurn))
              ? Math.floor(Number(record.extraAttacksRemainingThisTurn))
              : 0
          )
        )
      : undefined,
    weaponMasteries: hasWeaponMastery
      ? normalizeWeaponMasterySelections(
          record.weaponMasteries,
          paladinWeaponMasteryOptions,
          paladinWeaponMasterySelectionCount
        )
      : undefined
  };
}

function getPaladinFeatureState(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): CharacterPaladinFeatureState {
  return normalizePaladinFeatureState(character.classFeatureState?.paladin, character);
}

export function getPaladinHealingPoolTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasPaladinFeature(character, CLASS_FEATURE.LAY_ON_HANDS)) {
    return 0;
  }

  return Math.max(1, Math.floor(character.level)) * 5;
}

export function getPaladinHealingPoolRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalPool = getPaladinHealingPoolTotal(character);
  const layOnHandsExpended = getPaladinFeatureState(character).layOnHandsExpended ?? 0;

  return Math.max(0, totalPool - layOnHandsExpended);
}

export function getLayOnHandsCurableConditions(
  character: Pick<Character, "className" | "level">
): LayOnHandsCondition[] {
  return hasPaladinFeature(character, CLASS_FEATURE.RESTORING_TOUCH)
    ? [...layOnHandsBaseCurableConditions, ...layOnHandsRestoringTouchConditions]
    : [...layOnHandsBaseCurableConditions];
}

export function getPaladinChannelDivinityUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasPaladinFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return 0;
  }

  return getPaladinFeatureRow(character.level)?.channelDivinity ?? 0;
}

export function getPaladinChannelDivinityUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getPaladinChannelDivinityUsesTotal(character);
  const usesExpended = getPaladinFeatureState(character).channelDivinityUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getPaladinsSmiteUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  return hasPaladinFeature(character, CLASS_FEATURE.PALADINS_SMITE) ? paladinsSmiteUsesTotal : 0;
}

export function getPaladinsSmiteUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getPaladinsSmiteUsesTotal(character);
  const usesExpended = getPaladinFeatureState(character).paladinsSmiteUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getFaithfulSteedUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  return hasPaladinFeature(character, CLASS_FEATURE.FAITHFUL_STEED) ? faithfulSteedUsesTotal : 0;
}

export function getFaithfulSteedUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getFaithfulSteedUsesTotal(character);
  const usesExpended = getPaladinFeatureState(character).faithfulSteedUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getPaladinAlwaysPreparedSpellIds(
  character: Pick<Character, "className" | "level">
): string[] {
  const alwaysPreparedSpellIds: string[] = [];

  if (hasPaladinFeature(character, CLASS_FEATURE.PALADINS_SMITE)) {
    alwaysPreparedSpellIds.push(divineSmiteSpellId);
  }

  if (hasPaladinFeature(character, CLASS_FEATURE.FAITHFUL_STEED)) {
    alwaysPreparedSpellIds.push(findSteedSpellId);
  }

  return alwaysPreparedSpellIds;
}

export function getPaladinWeaponAttackMultiCount(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getPaladinFeatureState(character).extraAttacksRemainingThisTurn ?? 0;
}

export function getPaladinFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard[] {
  const featureActions: FeatureActionCard[] = [];

  if (hasPaladinFeature(character, CLASS_FEATURE.LAY_ON_HANDS)) {
    const remainingPool = getPaladinHealingPoolRemaining(character);

    featureActions.push({
      key: paladinLayOnHandsActionKey,
      name: "Lay on Hands",
      summary: "Uses Pool of Healing",
      detail: "Your blessed touch can heal wounds.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      interaction: "select",
      facts: [
        {
          label: "Pool Remaining",
          value: `${remainingPool}`
        }
      ],
      drawer: {
        kind: "custom-form",
        eyebrow: "Paladin",
        formKind: "lay-on-hands"
      },
      execute: {
        kind: "custom-form",
        formKind: "lay-on-hands",
        label: "Heal"
      },
      disabled: remainingPool <= 0,
      disabledReason: remainingPool <= 0 ? "Pool of Healing is empty." : undefined
    });
  }

  if (hasPaladinFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    const totalUses = getPaladinChannelDivinityUsesTotal(character);
    const usesRemaining = getPaladinChannelDivinityUsesRemaining(character);

    featureActions.push({
      key: paladinChannelDivinityActionKey,
      name: "Channel Divinity",
      summary: "Choose a divine effect.",
      detail:
        "Use Divine Sense as a Bonus Action to detect Celestials, Fiends, and Undead within 60 feet.",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      interaction: "select",
      usesLabel: `${usesRemaining}/${totalUses} uses`,
      usesRemaining,
      usesTotal: totalUses,
      drawer: {
        kind: "options",
        eyebrow: "Paladin",
        optionSelection: "single-immediate"
      },
      execute: {
        kind: "option",
        label: "Use Channel Divinity"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Channel Divinity uses remaining." : undefined
    });
  }

  if (hasPaladinFeature(character, CLASS_FEATURE.PALADINS_SMITE)) {
    const usesRemaining = getPaladinsSmiteUsesRemaining(character);

    featureActions.push({
      key: paladinsSmiteActionKey,
      name: "Paladin's Smite",
      summary: "Cast Divine Smite without a spell slot.",
      detail: "Open Divine Smite and cast it using your Paladin's Smite charge.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      interaction: "select",
      usesRemaining,
      usesTotal: paladinsSmiteUsesTotal,
      drawer: {
        kind: "confirm",
        eyebrow: "Paladin",
        confirmLabel: "Open Divine Smite"
      },
      execute: {
        kind: "spell",
        spellSource: "fixed",
        effectKind: "paladins-smite",
        spellId: divineSmiteSpellId,
        spellLevel: 1,
        label: "Open Divine Smite",
        actionContextText: "Using Paladin's Smite",
        actionAvailabilityText: "Cast without expending a spell slot.",
        actionConsumesSpellSlot: false
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "Paladin's Smite recharges on a Long Rest." : undefined
    });
  }

  if (hasPaladinFeature(character, CLASS_FEATURE.FAITHFUL_STEED)) {
    const usesRemaining = getFaithfulSteedUsesRemaining(character);

    featureActions.push({
      key: faithfulSteedActionKey,
      name: "Faithful Steed",
      summary: "Cast Find Steed without a spell slot.",
      detail: "Open Find Steed and cast it using your Faithful Steed charge.",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      interaction: "select",
      usesRemaining,
      usesTotal: faithfulSteedUsesTotal,
      drawer: {
        kind: "confirm",
        eyebrow: "Paladin",
        confirmLabel: "Open Find Steed"
      },
      execute: {
        kind: "spell",
        spellSource: "fixed",
        effectKind: "faithful-steed",
        spellId: findSteedSpellId,
        spellLevel: 2,
        label: "Open Find Steed",
        actionContextText: "Using Faithful Steed",
        actionAvailabilityText: "Cast without expending a spell slot.",
        actionConsumesSpellSlot: false
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "Faithful Steed recharges on a Long Rest." : undefined
    });
  }

  if (hasPaladinFeature(character, CLASS_FEATURE.ABJURE_FOES)) {
    featureActions.push({
      key: abjureFoesActionKey,
      name: "Abjure Foes",
      summary: "Overwhelm foes with divine awe.",
      detail: "Use a Magic action to force nearby foes to resist your divine presence.",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      interaction: "activate",
      consumesEconomyOnActivate: true
    });
  }

  return featureActions;
}

export function getPaladinFeatureActionOptions(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionOptionCard[] {
  if (!hasPaladinFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return [];
  }

  const divineSense = getDivinityEntryById("divinity-divine-sense");

  if (!divineSense) {
    return [];
  }

  return [
    {
      key: paladinDivineSenseOptionKey,
      name: divineSense.name,
      summary: "Specified Effect",
      detail: getDivinityDescriptionLine(1) || getDivinityDescriptionLine(0),
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      resultLabel: "Effect",
      rollFormulaDisplay: "Specified Effect",
      breakdown: "60 ft | 10 minutes"
    }
  ];
}

export function activatePaladinFeatureActionOption(
  character: Character,
  optionKey: string
): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return character;
  }

  if (optionKey !== paladinDivineSenseOptionKey) {
    return character;
  }

  const paladinState = getPaladinFeatureState(character);
  const totalUses = getPaladinChannelDivinityUsesTotal(character);
  const usesExpended = paladinState.channelDivinityUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        channelDivinityUsesExpended: usesExpended + 1
      }
    }
  };
}

export function applyLayOnHands(character: Character, options: LayOnHandsOptions): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.LAY_ON_HANDS)) {
    return character;
  }

  const paladinState = getPaladinFeatureState(character);
  const remainingPool = getPaladinHealingPoolRemaining(character);
  const curableConditionSet = new Set<LayOnHandsCondition>(
    getLayOnHandsCurableConditions(character)
  );
  const spendAmount = Number.isFinite(options.poolSpendAmount)
    ? Math.max(0, Math.floor(options.poolSpendAmount))
    : 0;
  const selectedConditions = dedupe(
    Array.isArray(options.conditions)
      ? options.conditions.filter((condition): condition is LayOnHandsCondition =>
          curableConditionSet.has(condition)
        )
      : []
  );
  const conditionCost = selectedConditions.length * layOnHandsPoisonedConditionCost;
  const totalCost = spendAmount + conditionCost;
  const healingAmount = spendAmount;

  if (totalCost <= 0 || totalCost > remainingPool) {
    return character;
  }

  const nextBaseCharacter: Character = {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        layOnHandsExpended: (paladinState.layOnHandsExpended ?? 0) + totalCost
      }
    }
  };

  if (options.target === "other") {
    return nextBaseCharacter;
  }

  const nextEffectiveHitPoints = getEffectiveHitPointMaximumForCharacter(character);
  const nextCurrentHitPoints = Math.max(
    0,
    Math.min(nextEffectiveHitPoints, character.currentHitPoints + healingAmount)
  );
  const selectedConditionSet = new Set<LayOnHandsCondition>(selectedConditions);
  const nextStatusEntries =
    selectedConditions.length > 0
      ? normalizeCharacterStatusEntries(character.statusEntries).filter(
          (entry) =>
            !(
              entry.group === STATUS_ENTRY_GROUP.CONDITIONS &&
              selectedConditionSet.has(entry.value as LayOnHandsCondition)
            )
        )
      : character.statusEntries;

  return reconcileCharacterStatusConsequences({
    ...nextBaseCharacter,
    currentHitPoints: nextCurrentHitPoints,
    deathSaves:
      nextCurrentHitPoints > 0
        ? {
            successes: 0,
            failures: 0
          }
        : character.deathSaves,
    statusEntries: nextStatusEntries
  });
}

export function restorePaladinLayOnHandsOnLongRest(character: Character): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.LAY_ON_HANDS)) {
    return character;
  }

  const paladinState = getPaladinFeatureState(character);

  if ((paladinState.layOnHandsExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        layOnHandsExpended: 0
      }
    }
  };
}

export function consumePaladinsSmiteUse(character: Character): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.PALADINS_SMITE)) {
    return character;
  }

  const paladinState = getPaladinFeatureState(character);

  if ((paladinState.paladinsSmiteUsesExpended ?? 0) >= paladinsSmiteUsesTotal) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        paladinsSmiteUsesExpended: (paladinState.paladinsSmiteUsesExpended ?? 0) + 1
      }
    }
  };
}

export function consumeFaithfulSteedUse(character: Character): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.FAITHFUL_STEED)) {
    return character;
  }

  const paladinState = getPaladinFeatureState(character);

  if ((paladinState.faithfulSteedUsesExpended ?? 0) >= faithfulSteedUsesTotal) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        faithfulSteedUsesExpended: (paladinState.faithfulSteedUsesExpended ?? 0) + 1
      }
    }
  };
}

export function restorePaladinsSmiteOnLongRest(character: Character): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.PALADINS_SMITE)) {
    return character;
  }

  const paladinState = getPaladinFeatureState(character);

  if ((paladinState.paladinsSmiteUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        paladinsSmiteUsesExpended: 0
      }
    }
  };
}

export function restoreFaithfulSteedOnLongRest(character: Character): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.FAITHFUL_STEED)) {
    return character;
  }

  const paladinState = getPaladinFeatureState(character);

  if ((paladinState.faithfulSteedUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        faithfulSteedUsesExpended: 0
      }
    }
  };
}

export function restorePaladinChannelDivinityOnShortRest(character: Character): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return character;
  }

  const paladinState = getPaladinFeatureState(character);
  const usesExpended = paladinState.channelDivinityUsesExpended ?? 0;

  if (usesExpended <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        channelDivinityUsesExpended: Math.max(0, usesExpended - 1)
      }
    }
  };
}

export function restorePaladinChannelDivinityOnLongRest(character: Character): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    return character;
  }

  const paladinState = getPaladinFeatureState(character);

  if ((paladinState.channelDivinityUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        channelDivinityUsesExpended: 0
      }
    }
  };
}

export function applyShortRestToPaladinFeatures(character: Character): Character {
  const restoredCharacter = restorePaladinChannelDivinityOnShortRest(character);
  const paladinState = getPaladinFeatureState(restoredCharacter);

  if (
    !hasPaladinFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY) &&
    (paladinState.extraAttacksRemainingThisTurn ?? 0) === 0
  ) {
    return restoredCharacter;
  }

  if ((paladinState.extraAttacksRemainingThisTurn ?? 0) === 0) {
    return restoredCharacter;
  }

  return {
    ...restoredCharacter,
    classFeatureState: {
      ...restoredCharacter.classFeatureState,
      paladin: {
        ...paladinState,
        extraAttacksRemainingThisTurn: 0
      }
    }
  };
}

export function applyLongRestToPaladinFeatures(character: Character): Character {
  const restoredCharacter = restoreFaithfulSteedOnLongRest(
    restorePaladinsSmiteOnLongRest(
      restorePaladinLayOnHandsOnLongRest(restorePaladinChannelDivinityOnLongRest(character))
    )
  );
  const paladinState = getPaladinFeatureState(restoredCharacter);

  if ((paladinState.extraAttacksRemainingThisTurn ?? 0) === 0) {
    return restoredCharacter;
  }

  return {
    ...restoredCharacter,
    classFeatureState: {
      ...restoredCharacter.classFeatureState,
      paladin: {
        ...paladinState,
        extraAttacksRemainingThisTurn: 0
      }
    }
  };
}

export function advancePaladinFeaturesForNewRound(character: Character): Character {
  if (getPaladinAdditionalAttackCount(character) <= 0) {
    return character;
  }

  const paladinState = getPaladinFeatureState(character);

  if ((paladinState.extraAttacksRemainingThisTurn ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        extraAttacksRemainingThisTurn: 0
      }
    }
  };
}

export function consumePaladinWeaponAttack(character: Character): Character {
  if (character.className !== "Paladin") {
    return isRoundTrackerResourceAvailable(character.roundTracker, "action")
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, "action")
        }
      : character;
  }

  const paladinState = getPaladinFeatureState(character);
  const extraAttacksRemaining = paladinState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        paladin: {
          ...paladinState,
          extraAttacksRemainingThisTurn: getPaladinAdditionalAttackCount(character)
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
      paladin: {
        ...paladinState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
      }
    }
  };
}

export function getPaladinWeaponMasterySelectionCount(
  character: Pick<Character, "className" | "level">
): number {
  return hasPaladinFeature(character, CLASS_FEATURE.WEAPON_MASTERY)
    ? paladinWeaponMasterySelectionCount
    : 0;
}

export function getPaladinWeaponMasteryOptions(): WEAPON_PROFICIENCY[] {
  return paladinWeaponMasteryOptions;
}

export function getPaladinWeaponMasterySelections(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): WEAPON_PROFICIENCY[] {
  return (
    normalizePaladinFeatureState(character.classFeatureState?.paladin, character).weaponMasteries ??
    []
  );
}

export function setPaladinWeaponMasterySelections(
  character: Character,
  selections: WEAPON_PROFICIENCY[]
): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.WEAPON_MASTERY)) {
    return character;
  }

  const paladinState = getPaladinFeatureState(character);
  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        weaponMasteries: normalizeWeaponMasterySelections(
          selections,
          paladinWeaponMasteryOptions,
          paladinWeaponMasterySelectionCount
        )
      }
    }
  };
}

export function getPaladinWeaponProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureWeaponProficiencyEntry[] {
  return getPaladinWeaponMasterySelections(character).map(
    (proficiency) =>
      ({
        source: PROFICIENCY_SOURCE.CLASS,
        sourceStr: paladinWeaponMasterySource,
        proficiency,
        proficiencyLevel: PROF_LEVEL.PROFICIENT,
        overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
      }) satisfies WeaponProficiencyEntry
  );
}

export function getPaladinWeaponDamageBonuses(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: {
    attackKind: "weapon" | "unarmed";
    combatType?: WEAPON_COMBAT_TYPE | null;
  }
): FeatureDamageBonus[] {
  if (!hasPaladinFeature(character, CLASS_FEATURE.RADIANT_STRIKES)) {
    return [];
  }

  if (context.attackKind !== "unarmed" && context.combatType !== WEAPON_COMBAT_TYPE.MELEE) {
    return [];
  }

  return [
    {
      label: "Radiant Strikes",
      formula: radiantStrikesDamageFormula,
      displayLabel: radiantStrikesDamageLabel
    }
  ];
}

function getPaladinAuraRangeFeet(character: Pick<Character, "className" | "level">): number {
  return hasPaladinFeature(character, CLASS_FEATURE.AURA_EXPANSION) ? 30 : 10;
}

export function hasActivePaladinAuraOfProtection(
  character: Pick<Character, "className" | "level" | "statusEntries">
): boolean {
  return (
    hasPaladinFeature(character, CLASS_FEATURE.AURA_OF_PROTECTION) &&
    !hasStatusCondition(character.statusEntries, CONDITION_NAME.INCAPACITATED)
  );
}

export function getPaladinDerivedStatusEntries(
  character: Pick<Character, "className" | "level" | "statusEntries">
): DerivedFeatureStatusEntry[] {
  if (!hasActivePaladinAuraOfProtection(character)) {
    return [];
  }

  const derivedStatusEntries: DerivedFeatureStatusEntry[] = [
    {
      id: auraOfProtectionStatusSourceId,
      sourceId: auraOfProtectionStatusSourceId,
      group: STATUS_ENTRY_GROUP.AURAS,
      value: "Aura of Protection",
      source: "Aura of Protection",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      rangeFeet: getPaladinAuraRangeFeet(character)
    }
  ];

  if (!hasPaladinFeature(character, CLASS_FEATURE.AURA_OF_COURAGE)) {
    return derivedStatusEntries;
  }

  return [
    ...derivedStatusEntries,
    {
      id: auraOfCourageStatusSourceId,
      sourceId: auraOfCourageStatusSourceId,
      group: STATUS_ENTRY_GROUP.AURAS,
      value: "Aura of Courage",
      source: "Aura of Courage",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      rangeFeet: getPaladinAuraRangeFeet(character)
    },
    {
      id: auraOfCourageImmunitySourceId,
      sourceId: auraOfCourageImmunitySourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: CONDITION_NAME.FRIGHTENED,
      source: "Aura of Courage",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}
