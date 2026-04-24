import { CLASS_FEATURE, WEAPON_COMBAT_TYPE, getDivinityEntryById } from "../../../../codex/entries";
import { paladinFeatureMap, paladinFeatures } from "../../../../codex/classes";
import type {
  Character,
  CharacterPaladinFeatureState,
  WeaponProficiencyEntry
} from "../../../../types";
import {
  CONDITION_NAME,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  WEAPON_PROFICIENCY
} from "../../../../types";
import { appendSourcedDescriptionAddition } from "../../actionModalDescriptions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../../combat";
import { hasStatusCondition, normalizeCharacterStatusEntries } from "../../statusEntries";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";
import { createFeatureActionCardCost, createNamedUsageHeaderTags } from "../cardUsage";
import {
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../../traits";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureDamageBonus,
  FeatureWeaponProficiencyEntry
} from "../types";
import { getWeaponMasteryOptions, normalizeWeaponMasterySelections } from "../weaponMastery";
import * as ancientsSubclass from "./subclasses/paladinOathOfTheAncients";
import * as devotionSubclass from "./subclasses/paladinOathOfDevotion";
import * as glorySubclass from "./subclasses/paladinOathOfGlory";
import * as nobleGeniesSubclass from "./subclasses/paladinOathOfTheNobleGenies";
import * as vengeanceSubclass from "./subclasses/paladinOathOfVengeance";

export const paladinLayOnHandsActionKey = "paladin-lay-on-hands";
export const paladinChannelDivinityActionKey = "paladin-channel-divinity";
export const paladinsSmiteActionKey = "paladin-paladins-smite";
export const faithfulSteedActionKey = "paladin-faithful-steed";
export const abjureFoesActionKey = "paladin-abjure-foes";
export const holyNimbusActionKey = "paladin-holy-nimbus";
export const peerlessAthleteActionKey = "paladin-peerless-athlete";
export const livingLegendActionKey = "paladin-living-legend";
export const nobleScionActionKey = "paladin-noble-scion";
export const avengingAngelActionKey = "paladin-avenging-angel";
export const naturesWrathActionKey = "paladin-natures-wrath";
export const undyingSentinelActionKey = "paladin-undying-sentinel";
export const elderChampionActionKey = "paladin-elder-champion";
export const gloriousDefenseReactionId = "reaction-paladin-glorious-defense";
export const elementalRebukeReactionId = "reaction-paladin-elemental-rebuke";
export const paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions =
  nobleGeniesSubclass.paladinOathOfTheNobleGeniesGeniesSplendorSkillOptions;
export const paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions =
  nobleGeniesSubclass.paladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeOptions;
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
const restoringTouchFeatureName = "Restoring Touch";

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

function getPaladinChannelDivinityDescription(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string[] {
  return getFeatureDescriptionForCharacter(character, CLASS_FEATURE.CHANNEL_DIVINITY)
    .filter((entry): entry is string => typeof entry === "string")
    .slice(0, 3);
}

function getPaladinsSmiteDescription(): string[] {
  return (paladinFeatureMap[CLASS_FEATURE.PALADINS_SMITE]?.description ?? []).filter(
    (entry): entry is string => typeof entry === "string"
  );
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
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): CharacterPaladinFeatureState {
  const hasLayOnHands = hasPaladinFeature(character, CLASS_FEATURE.LAY_ON_HANDS);
  const hasChannelDivinity = hasPaladinFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY);
  const hasPaladinsSmite = hasPaladinFeature(character, CLASS_FEATURE.PALADINS_SMITE);
  const hasFaithfulSteed = hasPaladinFeature(character, CLASS_FEATURE.FAITHFUL_STEED);
  const hasUndyingSentinel =
    ancientsSubclass.hasPaladinOathOfTheAncientsUndyingSentinelFeature(character);
  const hasHolyNimbus =
    devotionSubclass.hasPaladinOathOfDevotionHolyNimbusFeature(character) ||
    (character.className === "Paladin" &&
      (character.level ?? 0) >= 20 &&
      character.subclassId === undefined);
  const hasGloriousDefense = glorySubclass.hasPaladinOathOfGloryGloriousDefenseFeature(character);
  const hasLivingLegend = glorySubclass.hasPaladinOathOfGloryLivingLegendFeature(character);
  const hasElderChampion =
    ancientsSubclass.hasPaladinOathOfTheAncientsElderChampionFeature(character);
  const hasGeniesSplendor =
    nobleGeniesSubclass.hasPaladinOathOfTheNobleGeniesGeniesSplendor(character);
  const hasAuraOfElementalShielding =
    nobleGeniesSubclass.hasPaladinOathOfTheNobleGeniesAuraOfElementalShielding(character);
  const hasElementalRebuke =
    nobleGeniesSubclass.hasPaladinOathOfTheNobleGeniesElementalRebukeFeature(character);
  const hasNobleScion =
    nobleGeniesSubclass.hasPaladinOathOfTheNobleGeniesNobleScionFeature(character);
  const hasAvengingAngel =
    vengeanceSubclass.hasPaladinOathOfVengeanceAvengingAngelFeature(character);
  const hasWeaponMastery = hasPaladinFeature(character, CLASS_FEATURE.WEAPON_MASTERY);
  const additionalAttackCount = getPaladinAdditionalAttackCount(character);
  const hasExtraAttack = additionalAttackCount > 0;

  if (
    !hasLayOnHands &&
    !hasChannelDivinity &&
    !hasPaladinsSmite &&
    !hasFaithfulSteed &&
    !hasUndyingSentinel &&
    !hasHolyNimbus &&
    !hasGloriousDefense &&
    !hasLivingLegend &&
    !hasElderChampion &&
    !hasGeniesSplendor &&
    !hasAuraOfElementalShielding &&
    !hasElementalRebuke &&
    !hasNobleScion &&
    !hasAvengingAngel &&
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
  const undyingSentinelUsesExpended = Number(record.undyingSentinelUsesExpended);
  const holyNimbusUsesExpended = Number(record.holyNimbusUsesExpended);
  const gloriousDefenseUsesExpended = Number(record.gloriousDefenseUsesExpended);
  const livingLegendUsesExpended = Number(record.livingLegendUsesExpended);
  const elderChampionUsesExpended = Number(record.elderChampionUsesExpended);
  const elementalRebukeUsesExpended = Number(record.elementalRebukeUsesExpended);
  const nobleScionUsesExpended = Number(record.nobleScionUsesExpended);
  const avengingAngelUsesExpended = Number(record.avengingAngelUsesExpended);
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
    undyingSentinelUsesExpended: hasUndyingSentinel
      ? Number.isFinite(undyingSentinelUsesExpended)
        ? Math.max(
            0,
            Math.min(
              ancientsSubclass.getPaladinOathOfTheAncientsUndyingSentinelUsesTotal(character),
              Math.floor(undyingSentinelUsesExpended)
            )
          )
        : 0
      : undefined,
    holyNimbusUsesExpended: hasHolyNimbus
      ? Number.isFinite(holyNimbusUsesExpended)
        ? Math.max(
            0,
            Math.min(
              devotionSubclass.getPaladinOathOfDevotionHolyNimbusUsesTotal(character),
              Math.floor(holyNimbusUsesExpended)
            )
          )
        : 0
      : undefined,
    gloriousDefenseUsesExpended: hasGloriousDefense
      ? Number.isFinite(gloriousDefenseUsesExpended)
        ? Math.max(
            0,
            Math.min(
              glorySubclass.getPaladinOathOfGloryGloriousDefenseUsesTotal(character),
              Math.floor(gloriousDefenseUsesExpended)
            )
          )
        : 0
      : undefined,
    livingLegendUsesExpended: hasLivingLegend
      ? Number.isFinite(livingLegendUsesExpended)
        ? Math.max(
            0,
            Math.min(
              glorySubclass.getPaladinOathOfGloryLivingLegendUsesTotal(character),
              Math.floor(livingLegendUsesExpended)
            )
          )
        : 0
      : undefined,
    elderChampionUsesExpended: hasElderChampion
      ? Number.isFinite(elderChampionUsesExpended)
        ? Math.max(
            0,
            Math.min(
              ancientsSubclass.getPaladinOathOfTheAncientsElderChampionUsesTotal(character),
              Math.floor(elderChampionUsesExpended)
            )
          )
        : 0
      : undefined,
    elementalRebukeUsesExpended: hasElementalRebuke
      ? Number.isFinite(elementalRebukeUsesExpended)
        ? Math.max(
            0,
            Math.min(
              nobleGeniesSubclass.getPaladinOathOfTheNobleGeniesElementalRebukeUsesTotal(character),
              Math.floor(elementalRebukeUsesExpended)
            )
          )
        : 0
      : undefined,
    nobleScionUsesExpended: hasNobleScion
      ? Number.isFinite(nobleScionUsesExpended)
        ? Math.max(
            0,
            Math.min(
              nobleGeniesSubclass.getPaladinOathOfTheNobleGeniesNobleScionUsesTotal(character),
              Math.floor(nobleScionUsesExpended)
            )
          )
        : 0
      : undefined,
    avengingAngelUsesExpended: hasAvengingAngel
      ? Number.isFinite(avengingAngelUsesExpended)
        ? Math.max(
            0,
            Math.min(
              vengeanceSubclass.getPaladinOathOfVengeanceAvengingAngelUsesTotal(character),
              Math.floor(avengingAngelUsesExpended)
            )
          )
        : 0
      : undefined,
    nobleGeniesGeniesSplendorSkill: hasGeniesSplendor
      ? nobleGeniesSubclass.normalizePaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(
          record.nobleGeniesGeniesSplendorSkill
        )
      : undefined,
    nobleGeniesAuraOfElementalShieldingDamageType: hasAuraOfElementalShielding
      ? nobleGeniesSubclass.normalizePaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageType(
          record.nobleGeniesAuraOfElementalShieldingDamageType
        )
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
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
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

export function expendPaladinChannelDivinityUse(character: Character): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
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

export function getHolyNimbusUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return devotionSubclass.getPaladinOathOfDevotionHolyNimbusUsesTotal(character);
}

export function getGloriousDefenseUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return glorySubclass.getPaladinOathOfGloryGloriousDefenseUsesTotal(character);
}

export function getGloriousDefenseUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState">>
): number {
  return glorySubclass.getPaladinOathOfGloryGloriousDefenseUsesRemaining(character);
}

export function getLivingLegendUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return glorySubclass.getPaladinOathOfGloryLivingLegendUsesTotal(character);
}

export function getLivingLegendUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  return glorySubclass.getPaladinOathOfGloryLivingLegendUsesRemaining(character);
}

export function getElementalRebukeUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): number {
  return nobleGeniesSubclass.getPaladinOathOfTheNobleGeniesElementalRebukeUsesTotal(character);
}

export function getElementalRebukeUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState">>
): number {
  return nobleGeniesSubclass.getPaladinOathOfTheNobleGeniesElementalRebukeUsesRemaining(character);
}

export function getNobleScionUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return nobleGeniesSubclass.getPaladinOathOfTheNobleGeniesNobleScionUsesTotal(character);
}

export function getNobleScionUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  return nobleGeniesSubclass.getPaladinOathOfTheNobleGeniesNobleScionUsesRemaining(character);
}

export function getAvengingAngelUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return vengeanceSubclass.getPaladinOathOfVengeanceAvengingAngelUsesTotal(character);
}

export function getAvengingAngelUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
): number {
  return vengeanceSubclass.getPaladinOathOfVengeanceAvengingAngelUsesRemaining(character);
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
    const totalPool = getPaladinHealingPoolTotal(character);
    const remainingPool = getPaladinHealingPoolRemaining(character);
    const layOnHandsAction: FeatureActionCard = {
      key: paladinLayOnHandsActionKey,
      name: "Lay on Hands",
      sourceFeature: CLASS_FEATURE.LAY_ON_HANDS,
      summary: "Uses Pool of Healing",
      detail: "Your blessed touch can heal wounds.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      valueLabel: `Pool of Healing ${remainingPool}/${totalPool}`,
      drawer: {
        kind: "custom-form",
        eyebrow: "Paladin",
        formKind: "lay-on-hands",
        facts: [],
        factsSectionTitle: null,
        confirmLabel: "Heal"
      },
      execute: {
        kind: "custom-form",
        formKind: "lay-on-hands"
      },
      disabled: remainingPool <= 0,
      disabledReason: remainingPool <= 0 ? "Pool of Healing is empty." : undefined
    };

    featureActions.push(
      hasPaladinFeature(character, CLASS_FEATURE.RESTORING_TOUCH)
        ? appendSourcedDescriptionAddition(
            layOnHandsAction,
            restoringTouchFeatureName,
            paladinFeatureMap[CLASS_FEATURE.RESTORING_TOUCH]?.description ?? []
          )
        : layOnHandsAction
    );
  }

  if (hasPaladinFeature(character, CLASS_FEATURE.CHANNEL_DIVINITY)) {
    const totalUses = getPaladinChannelDivinityUsesTotal(character);
    const usesRemaining = getPaladinChannelDivinityUsesRemaining(character);

    featureActions.push({
      key: paladinChannelDivinityActionKey,
      name: "Channel Divinity",
      sourceFeature: CLASS_FEATURE.CHANNEL_DIVINITY,
      summary: "Choose a divine effect.",
      detail: "Open a divine effect and expend 1 Channel Divinity use.",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "pyromancy",
      usesRemaining,
      usesTotal: totalUses,
      description: getPaladinChannelDivinityDescription(character),
      resources: [
        {
          kind: "tracker",
          label: "Uses",
          current: usesRemaining,
          total: totalUses,
          icon: "pyromancy",
          cost: 1
        }
      ],
      drawer: {
        kind: "options",
        eyebrow: "Paladin",
        optionSelection: "single-immediate"
      },
      execute: {
        kind: "option"
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
      breakdown: "Free Divine Smite",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal: paladinsSmiteUsesTotal,
      description: getPaladinsSmiteDescription(),
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
      sourceFeature: CLASS_FEATURE.FAITHFUL_STEED,
      summary: "Cast Find Steed without a spell slot.",
      detail: "Open Find Steed and cast it using your Faithful Steed charge.",
      breakdown: "Free Find Steed",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
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
    const usesRemaining = getPaladinChannelDivinityUsesRemaining(character);
    const usesTotal = getPaladinChannelDivinityUsesTotal(character);

    featureActions.push({
      key: abjureFoesActionKey,
      name: "Abjure Foes",
      sourceFeature: CLASS_FEATURE.ABJURE_FOES,
      summary: "Overwhelm foes with divine awe.",
      detail: "Use a Magic action to force nearby foes to resist your divine presence.",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      consumesEconomyOnActivate: true,
      hideUsesTrackerOnCard: true,
      usesInlineLabel: "Use 1",
      usesInlineIcon: "pyromancy",
      usesRemaining,
      usesTotal,
      headerTags: createNamedUsageHeaderTags(
        createFeatureActionCardCost({
          amountText: "1",
          icon: "pyromancy"
        }),
        usesRemaining,
        usesTotal,
        {
          label: "Channel Divinity"
        }
      ),
      execute: {
        kind: "activate"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Channel Divinity uses remaining." : undefined
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

export function getUndyingSentinelUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return ancientsSubclass.getPaladinOathOfTheAncientsUndyingSentinelUsesTotal(character);
}

export function activateUndyingSentinel(character: Character): Character {
  return ancientsSubclass.activatePaladinOathOfTheAncientsUndyingSentinel(character);
}

export function restoreUndyingSentinelOnLongRest(character: Character): Character {
  return ancientsSubclass.restorePaladinOathOfTheAncientsUndyingSentinelOnLongRest(character);
}

export function activateHolyNimbus(character: Character): Character {
  return devotionSubclass.activatePaladinOathOfDevotionHolyNimbus(character);
}

export function activateAbjureFoes(character: Character): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.ABJURE_FOES)) {
    return character;
  }

  if (getPaladinChannelDivinityUsesRemaining(character) <= 0) {
    return character;
  }

  return expendPaladinChannelDivinityUse(character);
}

export function activateNaturesWrath(character: Character): Character {
  return ancientsSubclass.activatePaladinOathOfTheAncientsNaturesWrath(character);
}

export function getElderChampionUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return ancientsSubclass.getPaladinOathOfTheAncientsElderChampionUsesTotal(character);
}

export function activateElderChampion(character: Character): Character {
  return ancientsSubclass.activatePaladinOathOfTheAncientsElderChampion(character);
}

export function restoreElderChampionOnLongRest(character: Character): Character {
  return ancientsSubclass.restorePaladinOathOfTheAncientsElderChampionOnLongRest(character);
}

export function restoreHolyNimbusOnLongRest(character: Character): Character {
  return devotionSubclass.restorePaladinOathOfDevotionHolyNimbusOnLongRest(character);
}

export function activatePeerlessAthlete(character: Character): Character {
  return glorySubclass.activatePaladinOathOfGloryPeerlessAthlete(character);
}

export function activateLivingLegend(character: Character): Character {
  return glorySubclass.activatePaladinOathOfGloryLivingLegend(character);
}

export function activateNobleScion(character: Character): Character {
  return nobleGeniesSubclass.activatePaladinOathOfTheNobleGeniesNobleScion(character);
}

export function activateAvengingAngel(character: Character): Character {
  return vengeanceSubclass.activatePaladinOathOfVengeanceAvengingAngel(character);
}

export function consumeGloriousDefenseUse(character: Character): Character {
  return glorySubclass.consumePaladinOathOfGloryGloriousDefenseUse(character);
}

export function restoreGloriousDefenseOnLongRest(character: Character): Character {
  return glorySubclass.restorePaladinOathOfGloryGloriousDefenseOnLongRest(character);
}

export function consumeElementalRebukeUse(character: Character): Character {
  return nobleGeniesSubclass.consumePaladinOathOfTheNobleGeniesElementalRebukeUse(character);
}

export function restoreElementalRebukeOnLongRest(character: Character): Character {
  return nobleGeniesSubclass.restorePaladinOathOfTheNobleGeniesElementalRebukeOnLongRest(character);
}

export function restoreNobleScionOnLongRest(character: Character): Character {
  return nobleGeniesSubclass.restorePaladinOathOfTheNobleGeniesNobleScionOnLongRest(character);
}

export function restoreAvengingAngelOnLongRest(character: Character): Character {
  return vengeanceSubclass.restorePaladinOathOfVengeanceAvengingAngelOnLongRest(character);
}

export function restoreLivingLegendOnLongRest(character: Character): Character {
  return glorySubclass.restorePaladinOathOfGloryLivingLegendOnLongRest(character);
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
  const restoredCharacter = restoreElderChampionOnLongRest(
    restoreLivingLegendOnLongRest(
      restoreAvengingAngelOnLongRest(
        restoreNobleScionOnLongRest(
          restoreElementalRebukeOnLongRest(
            restoreGloriousDefenseOnLongRest(
              restoreHolyNimbusOnLongRest(
                restoreUndyingSentinelOnLongRest(
                  restoreFaithfulSteedOnLongRest(
                    restorePaladinsSmiteOnLongRest(
                      restorePaladinLayOnHandsOnLongRest(
                        restorePaladinChannelDivinityOnLongRest(character)
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
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
  let nextCharacter = character;

  if (getPaladinAdditionalAttackCount(character) > 0) {
    const paladinState = getPaladinFeatureState(character);

    if ((paladinState.extraAttacksRemainingThisTurn ?? 0) > 0) {
      nextCharacter = {
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
  }

  return ancientsSubclass.advancePaladinOathOfTheAncientsFeaturesForNewRound(nextCharacter);
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

export function getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelectionForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>
) {
  return nobleGeniesSubclass.getPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(character);
}

export function getPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelectionForCharacter(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState" | "statusEntries">>
) {
  return nobleGeniesSubclass.getPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelection(
    character
  );
}

export function setPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelectionForCharacter(
  character: Character,
  selection: Parameters<
    typeof nobleGeniesSubclass.setPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection
  >[1]
): Character {
  return nobleGeniesSubclass.setPaladinOathOfTheNobleGeniesGeniesSplendorSkillSelection(
    character,
    selection
  );
}

export function setPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelectionForCharacter(
  character: Character,
  selection: Parameters<
    typeof nobleGeniesSubclass.setPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelection
  >[1]
): Character {
  return nobleGeniesSubclass.setPaladinOathOfTheNobleGeniesAuraOfElementalShieldingDamageTypeSelection(
    character,
    selection
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
  character: Pick<Character, "className" | "level" | "statusEntries"> &
    Partial<Pick<Character, "subclassId">>
): DerivedFeatureStatusEntry[] {
  if (!hasActivePaladinAuraOfProtection(character)) {
    return [];
  }

  const auraOfProtectionSourceId = glorySubclass.hasPaladinOathOfGloryAuraOfAlacrity(character)
    ? glorySubclass.paladinOathOfGloryAuraOfAlacrityProtectionStatusSourceId
    : auraOfProtectionStatusSourceId;
  const derivedStatusEntries: DerivedFeatureStatusEntry[] = [
    {
      id: auraOfProtectionSourceId,
      sourceId: auraOfProtectionSourceId,
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
