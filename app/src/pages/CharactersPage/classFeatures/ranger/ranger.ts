import { rangerFeatures } from "../../../../codex/classes";
import {
  CLASS_FEATURE,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../codex/entries";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import {
  appendDescriptionAddition,
  createFeatureSourcedDescriptionEntries
} from "../../actionModalDescriptions";
import type {
  Character,
  CharacterStatusEntry,
  RangerHunterDefensiveTacticsChoice,
  RangerHunterPreyChoice,
  CharacterRangerFeatureState,
  LanguageProficiencyEntry,
  SAVING_THROW_PROFICIENCY,
  SkillName,
  SkillProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../../types";
import {
  CONDITION_NAME,
  EFFECT_NAME,
  LANGUAGE_PROFICIENCY,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SENSE,
  getSkillProficiencyForSkillName,
  isSkillName,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  WEAPON_PROFICIENCY,
  languageEntries
} from "../../../../types";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../../combat";
import {
  formatFormulaCell,
  formatFormulaTerms,
  formatSignedFormulaTerm
} from "../../shared/formulas";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../statusEntries";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionFact,
  FeatureInitiativeBonus,
  FeatureLanguageProficiencyEntry,
  FeatureSkillBonus,
  FeatureSkillProficiencyEntry,
  FeatureSpeedBonus,
  FeatureWeaponProficiencyEntry,
  SpeedFeatureContext
} from "../types";
import { getWeaponMasteryOptions, normalizeWeaponMasterySelections } from "../weaponMastery";
import { getRangerFeatAdjustedWisdomModifier } from "./abilityModifiers";
import * as feyWandererSubclass from "./subclasses/rangerFeyWanderer";
import * as gloomStalkerSubclass from "./subclasses/rangerGloomStalker";
import * as hunterSubclass from "./subclasses/rangerHunter";
import * as beastMasterSubclass from "./subclasses/rangerBeastMaster";
import * as winterWalkerSubclass from "./subclasses/rangerWinterWalker";

export const favoredEnemyActionKey = "ranger-favored-enemy";
export const tirelessActionKey = "ranger-tireless";
export const naturesVeilActionKey = "ranger-natures-veil";
export const fortifyingSoulActionKey = winterWalkerSubclass.fortifyingSoulActionKey;
export const rangerBeastMasterCommandActionKey =
  beastMasterSubclass.rangerBeastMasterCommandActionKey;
export const rangerBeastMasterReviveActionKey =
  beastMasterSubclass.rangerBeastMasterReviveActionKey;
export const chillingRetributionReactionId = winterWalkerSubclass.chillingRetributionReactionId;
const rangerWeaponMasterySource = "Weapon Mastery";
const rangerWeaponMasterySelectionCount = 2;
export const huntersMarkSpellId = "spell-hunters-mark";
const huntersMarkSpellName = "Hunter's Mark";
const rangerRelentlessHunterSource = "Relentless Hunter";
const rangerPreciseHunterSource = "Precise Hunter";
const rangerFoeSlayerSource = "Foe Slayer";
const rangerDeftExplorerSource = "Deft Explorer";
const rangerExpertiseSource = "Level 9: Expertise";
const rangerRovingSpeedBonusValue = 10;
const rangerRovingSpeedBonusLabel = "Roving";
const rangerFeralSensesSource = "Feral Senses";
const rangerNaturesVeilSource = "Nature's Veil";
const rangerNaturesVeilSourceId = "feature-ranger-natures-veil";
const rangerNaturesVeilDurationRounds = 2;

export const rangerFeyWandererGiftOptions = feyWandererSubclass.rangerFeyWandererGiftOptions;
export const rangerOtherworldlyGlamourSkillOptions =
  feyWandererSubclass.rangerOtherworldlyGlamourSkillOptions;
export const rangerHunterSuperiorHuntersDefenseDamageTypeOptions =
  hunterSubclass.rangerHunterSuperiorHuntersDefenseDamageTypeOptions;

const rangerLanguageOptions = languageEntries.map((entry) => entry.proficiency);

const rangerWeaponMasteryOptions = getWeaponMasteryOptions();

function dedupe<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function getRangerFeatureRow(level: number) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = rangerFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;
}

function getUnlockedRangerFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return rangerFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

export function hasRangerFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Ranger") {
    return false;
  }

  return getUnlockedRangerFeatures(character.level).has(feature);
}

function hasRangerDeftExplorerFeature(character: Pick<Character, "className" | "level">): boolean {
  return hasRangerFeature(character, CLASS_FEATURE.DEFT_EXPLORER);
}

function hasRangerLevel9ExpertiseFeature(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasRangerFeature(character, CLASS_FEATURE.EXPERTISE);
}

function hasRangerFeyWandererDreadfulStrikesFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return feyWandererSubclass.hasRangerFeyWandererDreadfulStrikesFeature(character);
}

function hasRangerFeyWandererFeyReinforcementsFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return feyWandererSubclass.hasRangerFeyWandererFeyReinforcementsFeature(character);
}

function hasRangerFeyWandererMistyWandererFeature(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): boolean {
  return feyWandererSubclass.hasRangerFeyWandererMistyWandererFeature(character);
}

function hasRangerGloomStalkerDreadAmbusherFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return gloomStalkerSubclass.hasRangerGloomStalkerDreadAmbusherFeature(character);
}

function hasRangerWinterWalkerFrigidExplorerFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return winterWalkerSubclass.hasRangerWinterWalkerFrigidExplorerFeature(character);
}

function hasRangerWinterWalkerFortifyingSoulFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return winterWalkerSubclass.hasRangerWinterWalkerFortifyingSoulFeature(character);
}

function hasRangerWinterWalkerChillingRetributionFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return winterWalkerSubclass.hasRangerWinterWalkerChillingRetributionFeature(character);
}

function hasRangerWinterWalkerFrozenHauntFeature(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return winterWalkerSubclass.hasRangerWinterWalkerFrozenHauntFeature(character);
}

function getRangerAdditionalAttackCount(character: Pick<Character, "className" | "level">): number {
  return hasRangerFeature(character, CLASS_FEATURE.EXTRA_ATTACK) ? 1 : 0;
}

function getRangerSourcedFeatureDescriptionSection(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  feature: CLASS_FEATURE,
  sourceName: string
): SpellDescriptionEntry[] | null {
  const description = getFeatureDescriptionForCharacter(character, feature);

  return description.length > 0
    ? createFeatureSourcedDescriptionEntries(character, feature, description, sourceName)
    : null;
}

function getRangerHuntersMarkFeatureSourceName(feature: CLASS_FEATURE): string {
  switch (feature) {
    case CLASS_FEATURE.RELENTLESS_HUNTER:
      return rangerRelentlessHunterSource;
    case CLASS_FEATURE.PRECISE_HUNTER:
      return rangerPreciseHunterSource;
    case CLASS_FEATURE.FOE_SLAYER:
      return rangerFoeSlayerSource;
    default:
      return String(feature);
  }
}

function getRangerHuntersMarkFeatureDescriptionAdditions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  features: CLASS_FEATURE[]
): SpellDescriptionEntry[][] {
  if (character.className !== "Ranger") {
    return [];
  }

  return features.flatMap((feature) => {
    if (!hasRangerFeature(character, feature)) {
      return [];
    }

    const section = getRangerSourcedFeatureDescriptionSection(
      character,
      feature,
      getRangerHuntersMarkFeatureSourceName(feature)
    );

    return section ? [section] : [];
  });
}

export function isRangerHuntersMarkConcentrationStatusEntry(
  entry: Pick<CharacterStatusEntry, "group" | "value" | "source"> &
    Partial<Pick<CharacterStatusEntry, "sourceSpellId">>
): boolean {
  return (
    entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
    entry.value === EFFECT_NAME.CONCENTRATION &&
    (entry.sourceSpellId === huntersMarkSpellId ||
      entry.source.trim().toLowerCase() === huntersMarkSpellName.toLowerCase())
  );
}

export function getRangerHuntersMarkConcentrationDescriptionAdditions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  entry: Pick<CharacterStatusEntry, "group" | "value" | "source"> &
    Partial<Pick<CharacterStatusEntry, "sourceSpellId">>
): SpellDescriptionEntry[][] {
  if (!isRangerHuntersMarkConcentrationStatusEntry(entry)) {
    return [];
  }

  return getRangerHuntersMarkFeatureDescriptionAdditions(character, [
    CLASS_FEATURE.RELENTLESS_HUNTER,
    CLASS_FEATURE.PRECISE_HUNTER,
    CLASS_FEATURE.FOE_SLAYER
  ]).concat(hunterSubclass.getRangerHunterHuntersMarkDescriptionAdditions(character));
}

export function getRangerPreciseHunterWeaponActionDescriptionAdditions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): SpellDescriptionEntry[][] {
  return getRangerHuntersMarkFeatureDescriptionAdditions(character, [CLASS_FEATURE.PRECISE_HUNTER]);
}

function normalizeRangerWeaponMasteries(selections: unknown): WEAPON_PROFICIENCY[] {
  return normalizeWeaponMasterySelections(
    selections,
    rangerWeaponMasteryOptions,
    rangerWeaponMasterySelectionCount
  );
}

function normalizeRangerExpertiseSelection(value: unknown): SkillName | undefined {
  return typeof value === "string" && isSkillName(value) ? value : undefined;
}

function normalizeRangerExpertiseSelections(value: unknown): SkillName[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return dedupe(
    value.filter((entry): entry is SkillName => typeof entry === "string" && isSkillName(entry))
  ).slice(0, 2);
}

function normalizeRangerLanguageSelections(value: unknown): LANGUAGE_PROFICIENCY[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const optionSet = new Set<LANGUAGE_PROFICIENCY>(rangerLanguageOptions);

  return dedupe(
    value.filter(
      (selection): selection is LANGUAGE_PROFICIENCY =>
        typeof selection === "string" && optionSet.has(selection as LANGUAGE_PROFICIENCY)
    )
  ).slice(0, 2);
}

function createRangerExpertiseEntry(
  skill: SkillName,
  sourceLabel: string
): SkillProficiencyEntry | null {
  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: sourceLabel,
    proficiency: getSkillProficiencyForSkillName(skill),
    proficiencyLevel: PROF_LEVEL.EXPERT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  };
}

function getRangerFeatureState(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "feats" | "subclassId">>
): CharacterRangerFeatureState {
  return normalizeRangerFeatureState(character.classFeatureState?.ranger, character);
}

export function normalizeRangerFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "feats" | "savingThrowProficiencies" | "subclassId">>
): CharacterRangerFeatureState {
  const hasFavoredEnemy = hasRangerFeature(character, CLASS_FEATURE.FAVORED_ENEMY);
  const hasTireless = hasRangerFeature(character, CLASS_FEATURE.TIRELESS);
  const hasNaturesVeil = hasRangerFeature(character, CLASS_FEATURE.NATURES_VEIL);
  const hasFortifyingSoul = hasRangerWinterWalkerFortifyingSoulFeature(character);
  const hasChillingRetribution = hasRangerWinterWalkerChillingRetributionFeature(character);
  const hasFrozenHaunt = hasRangerWinterWalkerFrozenHauntFeature(character);
  const hasDreadfulStrikes = hasRangerFeyWandererDreadfulStrikesFeature(character);
  const hasWinterWalkerPolarStrikes = hasRangerWinterWalkerFrigidExplorerFeature(character);
  const hasDreadAmbusher = hasRangerGloomStalkerDreadAmbusherFeature(character);
  const hasIronMind =
    gloomStalkerSubclass.getRangerGloomStalkerIronMindSavingThrowOptions(character).length > 0;
  const hasHuntersPrey = hunterSubclass.hasRangerHunterHuntersPreyFeature(character);
  const hasDefensiveTactics = hunterSubclass.hasRangerHunterDefensiveTacticsFeature(character);
  const hasSuperiorHuntersDefense =
    hunterSubclass.hasRangerHunterSuperiorHuntersDefenseFeature(character);
  const hasFeyReinforcements = hasRangerFeyWandererFeyReinforcementsFeature(character);
  const hasMistyWanderer = hasRangerFeyWandererMistyWandererFeature(character);
  const hasFeyWandererSpells = feyWandererSubclass.hasRangerFeyWandererSpellsFeature(character);
  const hasOtherworldlyGlamour =
    feyWandererSubclass.hasRangerFeyWandererOtherworldlyGlamourFeature(character);
  const hasWeaponMastery = hasRangerFeature(character, CLASS_FEATURE.WEAPON_MASTERY);
  const hasDeftExplorer = hasRangerDeftExplorerFeature(character);
  const hasLevel9Expertise = hasRangerLevel9ExpertiseFeature(character);
  const additionalAttackCount = getRangerAdditionalAttackCount(character);

  if (
    !hasFavoredEnemy &&
    !hasTireless &&
    !hasNaturesVeil &&
    !hasFortifyingSoul &&
    !hasChillingRetribution &&
    !hasFrozenHaunt &&
    !hasDreadfulStrikes &&
    !hasWinterWalkerPolarStrikes &&
    !hasDreadAmbusher &&
    !hasIronMind &&
    !hasHuntersPrey &&
    !hasDefensiveTactics &&
    !hasSuperiorHuntersDefense &&
    !hasFeyReinforcements &&
    !hasMistyWanderer &&
    !hasFeyWandererSpells &&
    !hasOtherworldlyGlamour &&
    !hasWeaponMastery &&
    !hasDeftExplorer &&
    !hasLevel9Expertise &&
    additionalAttackCount <= 0
  ) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterRangerFeatureState>) : {};
  const favoredEnemyTotal = hasFavoredEnemy
    ? (getRangerFeatureRow(character.level)?.favoredEnemy ?? 0)
    : 0;
  const tirelessTotal = hasTireless ? getRangerTirelessUsesTotal(character) : 0;
  const naturesVeilTotal = hasNaturesVeil ? getRangerNaturesVeilUsesTotal(character) : 0;
  const fortifyingSoulTotal = hasFortifyingSoul
    ? getRangerWinterWalkerFortifyingSoulUsesTotal(character)
    : 0;
  const chillingRetributionTotal = hasChillingRetribution
    ? getRangerWinterWalkerChillingRetributionUsesTotal(character)
    : 0;
  const frozenHauntTotal = hasFrozenHaunt
    ? getRangerWinterWalkerFrozenHauntUsesTotal(character)
    : 0;
  const dreadAmbusherTotal = hasDreadAmbusher
    ? getRangerGloomStalkerDreadAmbusherUsesTotal(character)
    : 0;
  const feyReinforcementsTotal = hasFeyReinforcements
    ? getRangerFeyReinforcementsUsesTotal(character)
    : 0;
  const mistyWandererTotal = hasMistyWanderer ? getRangerMistyWandererUsesTotal(character) : 0;
  const deftExplorerExpertise = hasDeftExplorer
    ? normalizeRangerExpertiseSelection(record.deftExplorerExpertise)
    : undefined;
  const level9Expertise = hasLevel9Expertise
    ? normalizeRangerExpertiseSelections(record.expertise).filter(
        (skill) => skill !== deftExplorerExpertise
      )
    : [];

  return {
    favoredEnemyUsesExpended: hasFavoredEnemy
      ? Math.max(
          0,
          Math.min(
            favoredEnemyTotal,
            Number.isFinite(Number(record.favoredEnemyUsesExpended))
              ? Math.floor(Number(record.favoredEnemyUsesExpended))
              : 0
          )
        )
      : undefined,
    tirelessUsesExpended: hasTireless
      ? Math.max(
          0,
          Math.min(
            tirelessTotal,
            Number.isFinite(Number(record.tirelessUsesExpended))
              ? Math.floor(Number(record.tirelessUsesExpended))
              : 0
          )
        )
      : undefined,
    naturesVeilUsesExpended: hasNaturesVeil
      ? Math.max(
          0,
          Math.min(
            naturesVeilTotal,
            Number.isFinite(Number(record.naturesVeilUsesExpended))
              ? Math.floor(Number(record.naturesVeilUsesExpended))
              : 0
          )
        )
      : undefined,
    fortifyingSoulUsesExpended: hasFortifyingSoul
      ? Math.max(
          0,
          Math.min(
            fortifyingSoulTotal,
            Number.isFinite(Number(record.fortifyingSoulUsesExpended))
              ? Math.floor(Number(record.fortifyingSoulUsesExpended))
              : 0
          )
        )
      : undefined,
    chillingRetributionUsesExpended: hasChillingRetribution
      ? Math.max(
          0,
          Math.min(
            chillingRetributionTotal,
            Number.isFinite(Number(record.chillingRetributionUsesExpended))
              ? Math.floor(Number(record.chillingRetributionUsesExpended))
              : 0
          )
        )
      : undefined,
    frozenHauntUsesExpended: hasFrozenHaunt
      ? Math.max(
          0,
          Math.min(
            frozenHauntTotal,
            Number.isFinite(Number(record.frozenHauntUsesExpended))
              ? Math.floor(Number(record.frozenHauntUsesExpended))
              : 0
          )
        )
      : undefined,
    dreadfulStrikesUsedThisTurn: hasDreadfulStrikes
      ? record.dreadfulStrikesUsedThisTurn === true
      : undefined,
    winterWalkerPolarStrikesUsedThisTurn: hasWinterWalkerPolarStrikes
      ? record.winterWalkerPolarStrikesUsedThisTurn === true
      : undefined,
    dreadAmbusherUsesExpended: hasDreadAmbusher
      ? Math.max(
          0,
          Math.min(
            dreadAmbusherTotal,
            Number.isFinite(Number(record.dreadAmbusherUsesExpended))
              ? Math.floor(Number(record.dreadAmbusherUsesExpended))
              : 0
          )
        )
      : undefined,
    dreadAmbusherUsedThisTurn: hasDreadAmbusher
      ? record.dreadAmbusherUsedThisTurn === true
      : undefined,
    hunterColossusSlayerUsedThisTurn: hasHuntersPrey
      ? record.hunterColossusSlayerUsedThisTurn === true
      : undefined,
    hunterHordeBreakerUsedThisTurn: hasHuntersPrey
      ? record.hunterHordeBreakerUsedThisTurn === true
      : undefined,
    hunterHordeBreakerActionKey:
      hasHuntersPrey &&
      typeof record.hunterHordeBreakerActionKey === "string" &&
      record.hunterHordeBreakerActionKey.trim().length > 0
        ? record.hunterHordeBreakerActionKey
        : undefined,
    ironMindSavingThrow: hasIronMind
      ? gloomStalkerSubclass.normalizeRangerGloomStalkerIronMindSavingThrowSelection(
          record.ironMindSavingThrow
        )
      : undefined,
    huntersPreyChoice: hasHuntersPrey
      ? hunterSubclass.normalizeRangerHunterPreyChoice(record.huntersPreyChoice)
      : undefined,
    defensiveTacticsChoice: hasDefensiveTactics
      ? hunterSubclass.normalizeRangerHunterDefensiveTacticsChoice(record.defensiveTacticsChoice)
      : undefined,
    superiorHuntersDefenseDamageType: hasSuperiorHuntersDefense
      ? hunterSubclass.normalizeRangerHunterSuperiorHuntersDefenseDamageType(
          record.superiorHuntersDefenseDamageType
        )
      : undefined,
    feyReinforcementsUsesExpended: hasFeyReinforcements
      ? Math.max(
          0,
          Math.min(
            feyReinforcementsTotal,
            Number.isFinite(Number(record.feyReinforcementsUsesExpended))
              ? Math.floor(Number(record.feyReinforcementsUsesExpended))
              : 0
          )
        )
      : undefined,
    mistyWandererUsesExpended: hasMistyWanderer
      ? Math.max(
          0,
          Math.min(
            mistyWandererTotal,
            Number.isFinite(Number(record.mistyWandererUsesExpended))
              ? Math.floor(Number(record.mistyWandererUsesExpended))
              : 0
          )
        )
      : undefined,
    feyWandererGift: hasFeyWandererSpells
      ? feyWandererSubclass.normalizeRangerFeyWandererGiftSelection(record.feyWandererGift)
      : undefined,
    otherworldlyGlamourSkill: hasOtherworldlyGlamour
      ? feyWandererSubclass.normalizeRangerOtherworldlyGlamourSkillSelection(
          record.otherworldlyGlamourSkill
        )
      : undefined,
    deftExplorerExpertise,
    deftExplorerLanguages: hasDeftExplorer
      ? normalizeRangerLanguageSelections(record.deftExplorerLanguages)
      : undefined,
    expertise: hasLevel9Expertise ? level9Expertise : undefined,
    extraAttacksRemainingThisTurn:
      additionalAttackCount > 0
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
      ? normalizeRangerWeaponMasteries(record.weaponMasteries)
      : undefined
  };
}

export function getRangerAlwaysPreparedSpellIds(
  character: Pick<Character, "className" | "level">
): string[] {
  if (!hasRangerFeature(character, CLASS_FEATURE.FAVORED_ENEMY)) {
    return [];
  }

  return [huntersMarkSpellId];
}

export function getRangerFeyWandererGiftSelection(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return feyWandererSubclass.getRangerFeyWandererGiftSelection(character);
}

export function setRangerFeyWandererGiftSelection(
  character: Character,
  selection: Parameters<typeof feyWandererSubclass.setRangerFeyWandererGiftSelection>[1]
): Character {
  return feyWandererSubclass.setRangerFeyWandererGiftSelection(character, selection);
}

export function getRangerOtherworldlyGlamourSkillSelection(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return feyWandererSubclass.getRangerOtherworldlyGlamourSkillSelection(character);
}

export function setRangerOtherworldlyGlamourSkillSelection(
  character: Character,
  selection: Parameters<typeof feyWandererSubclass.setRangerOtherworldlyGlamourSkillSelection>[1]
): Character {
  return feyWandererSubclass.setRangerOtherworldlyGlamourSkillSelection(character, selection);
}

export function getRangerSkillBonuses(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  skill: SkillName
): FeatureSkillBonus[] {
  return feyWandererSubclass.getRangerFeyWandererOtherworldlyGlamourSkillBonuses(character, skill);
}

export function getRangerDerivedStatusEntries(
  character: Pick<Character, "className" | "level">
): DerivedFeatureStatusEntry[] {
  if (!hasRangerFeature(character, CLASS_FEATURE.FERAL_SENSES)) {
    return [];
  }

  return [
    {
      id: "feature-ranger-feral-senses",
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.BLINDSIGHT,
      source: rangerFeralSensesSource,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      sourceId: "feature-ranger-feral-senses",
      rangeFeet: 30
    }
  ];
}

export function getRangerFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "feats">>
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (hasRangerFeature(character, CLASS_FEATURE.FAVORED_ENEMY)) {
    const totalUses = getRangerFavoredEnemyUsesTotal(character);
    const usesRemaining = getRangerFavoredEnemyUsesRemaining(character);

    actions.push({
      key: favoredEnemyActionKey,
      name: "Favored Enemy",
      sourceFeature: CLASS_FEATURE.FAVORED_ENEMY,
      summary: "Cast Hunter's Mark without a spell slot.",
      detail: "Open Hunter's Mark and cast it using your Favored Enemy charge.",
      breakdown: "Free Hunter's Mark",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal: totalUses,
      drawer: {
        kind: "confirm",
        eyebrow: "Ranger",
        confirmLabel: "Open Hunter's Mark"
      },
      execute: {
        kind: "spell",
        spellSource: "fixed",
        effectKind: "favored-enemy",
        spellId: huntersMarkSpellId,
        spellLevel: 1,
        label: "Open Hunter's Mark",
        actionContextText: "Using Favored Enemy",
        actionAvailabilityText: "Cast without expending a spell slot.",
        actionConsumesSpellSlot: false
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "Favored Enemy recharges on a Long Rest." : undefined
    });
  }

  if (hasRangerFeature(character, CLASS_FEATURE.TIRELESS)) {
    const totalUses = getRangerTirelessUsesTotal(character);
    const usesRemaining = getRangerTirelessUsesRemaining(character);
    const wisdomModifier = getRangerTirelessWisdomModifier(character);
    const minimumTemporaryHitPoints = Math.max(1, 1 + wisdomModifier);
    const maximumTemporaryHitPoints = Math.max(1, 8 + wisdomModifier);

    actions.push({
      key: tirelessActionKey,
      name: "Tireless",
      sourceFeature: CLASS_FEATURE.TIRELESS,
      summary: `${minimumTemporaryHitPoints}~${maximumTemporaryHitPoints} Temp HP`,
      detail:
        "Use a Magic action to gain Temporary Hit Points equal to 1d8 plus your Wisdom modifier, minimum of 1.",
      economyType: ECONOMY_TYPE.ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal: totalUses,
      facts: getRangerTirelessTemporaryHitPointsFacts(character),
      drawer: {
        kind: "confirm",
        eyebrow: "Ranger"
      },
      execute: {
        kind: "activate",
        effectKind: "tireless"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "Tireless recharges on a Long Rest." : undefined
    });
  }

  if (hasRangerFeature(character, CLASS_FEATURE.NATURES_VEIL)) {
    const totalUses = getRangerNaturesVeilUsesTotal(character);
    const usesRemaining = getRangerNaturesVeilUsesRemaining(character);

    actions.push({
      key: naturesVeilActionKey,
      name: "Nature's Veil",
      sourceFeature: CLASS_FEATURE.NATURES_VEIL,
      summary: "Invisible for 2 turns",
      detail: "Use a Bonus Action to gain the Invisible condition for 2 turns.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.MAGIC,
      usesRemaining,
      usesTotal: totalUses,
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "Nature's Veil recharges on a Long Rest." : undefined
    });
  }

  return actions;
}

export function getRangerDeftExplorerExpertiseSelection(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SkillName | null {
  return getRangerFeatureState(character).deftExplorerExpertise ?? null;
}

export function setRangerDeftExplorerExpertiseSelection(
  character: Character,
  selection: SkillName | null
): Character {
  if (!hasRangerDeftExplorerFeature(character)) {
    return character;
  }

  const rangerState = getRangerFeatureState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        deftExplorerExpertise: selection ?? undefined
      }
    }
  };
}

export function getRangerDeftExplorerLanguageSelections(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): LANGUAGE_PROFICIENCY[] {
  return (getRangerFeatureState(character).deftExplorerLanguages ?? []).filter(
    (selection): selection is LANGUAGE_PROFICIENCY =>
      rangerLanguageOptions.includes(selection as LANGUAGE_PROFICIENCY)
  );
}

export function setRangerDeftExplorerLanguageSelections(
  character: Character,
  selections: LANGUAGE_PROFICIENCY[]
): Character {
  if (!hasRangerDeftExplorerFeature(character)) {
    return character;
  }

  const rangerState = getRangerFeatureState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        deftExplorerLanguages: normalizeRangerLanguageSelections(selections)
      }
    }
  };
}

export function getRangerLevel9ExpertiseSelections(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SkillName[] {
  return getRangerFeatureState(character).expertise ?? [];
}

export function setRangerLevel9ExpertiseSelections(
  character: Character,
  selections: SkillName[]
): Character {
  if (!hasRangerLevel9ExpertiseFeature(character)) {
    return character;
  }

  const rangerState = getRangerFeatureState(character);
  const deftExplorerExpertise = rangerState.deftExplorerExpertise;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        expertise: normalizeRangerExpertiseSelections(selections).filter(
          (skill) => skill !== deftExplorerExpertise
        )
      }
    }
  };
}

export function getRangerFavoredEnemyUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasRangerFeature(character, CLASS_FEATURE.FAVORED_ENEMY)) {
    return 0;
  }

  return getRangerFeatureRow(character.level)?.favoredEnemy ?? 0;
}

export function getRangerFavoredEnemyUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "feats">>
): number {
  const totalUses = getRangerFavoredEnemyUsesTotal(character);
  const usesExpended =
    normalizeRangerFeatureState(character.classFeatureState?.ranger, character)
      .favoredEnemyUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

function getRangerTirelessWisdomModifier(
  character: Partial<Pick<Character, "abilities" | "feats" | "level">>
): number {
  return getRangerFeatAdjustedWisdomModifier(character);
}

export function getRangerTirelessUsesTotal(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "feats">>
): number {
  if (!hasRangerFeature(character, CLASS_FEATURE.TIRELESS)) {
    return 0;
  }

  return Math.max(1, getRangerTirelessWisdomModifier(character));
}

export function getRangerNaturesVeilUsesTotal(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "feats">>
): number {
  if (!hasRangerFeature(character, CLASS_FEATURE.NATURES_VEIL)) {
    return 0;
  }

  return Math.max(1, getRangerTirelessWisdomModifier(character));
}

export function getRangerWinterWalkerFortifyingSoulUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return winterWalkerSubclass.getRangerWinterWalkerFortifyingSoulUsesTotal(character);
}

export function getRangerWinterWalkerChillingRetributionUsesTotal(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "feats" | "subclassId">>
): number {
  return winterWalkerSubclass.getRangerWinterWalkerChillingRetributionUsesTotal(character);
}

export function getRangerWinterWalkerFrozenHauntUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return winterWalkerSubclass.getRangerWinterWalkerFrozenHauntUsesTotal(character);
}

export function getRangerTirelessTemporaryHitPointsFormula(
  character: Partial<Pick<Character, "abilities" | "feats" | "level">>
): string {
  const wisdomModifier = getRangerTirelessWisdomModifier(character);

  if (wisdomModifier === 0) {
    return "1d8";
  }

  return `1d8${wisdomModifier >= 0 ? "+" : ""}${wisdomModifier}`;
}

export function getRangerTirelessTemporaryHitPointsFormulaDisplay(
  character: Partial<Pick<Character, "abilities" | "feats" | "level">>
): string {
  const wisdomModifier = getRangerTirelessWisdomModifier(character);

  return formatFormulaTerms(["1d8", formatSignedFormulaTerm(wisdomModifier, "WIS")]);
}

function getRangerTirelessTemporaryHitPointsFacts(
  character: Partial<Pick<Character, "abilities" | "feats" | "level">>
): FeatureActionFact[] {
  const formula = getRangerTirelessTemporaryHitPointsFormula(character);
  const formulaDisplay = getRangerTirelessTemporaryHitPointsFormulaDisplay(character);
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
      fullWidth: true
    }
  ];
}

export function getRangerSpellDamageFormula(
  character: Pick<Character, "className" | "level">,
  spell: Pick<SpellEntry, "id">
): string | null {
  if (
    spell.id !== huntersMarkSpellId ||
    !hasRangerFeature(character, CLASS_FEATURE.FAVORED_ENEMY)
  ) {
    return null;
  }

  return "1d6";
}

export function getRangerSpellEntry(
  character: Pick<Character, "className" | "level">,
  spell: SpellEntry
): SpellEntry {
  if (spell.id !== huntersMarkSpellId) {
    return spell;
  }

  const spellWithHunterDescriptionAdditions = getRangerHuntersMarkFeatureDescriptionAdditions(
    character,
    [CLASS_FEATURE.RELENTLESS_HUNTER, CLASS_FEATURE.PRECISE_HUNTER, CLASS_FEATURE.FOE_SLAYER]
  ).reduce<SpellEntry>(
    (nextSpell, descriptionAddition) => appendDescriptionAddition(nextSpell, descriptionAddition),
    spell
  );

  return spellWithHunterDescriptionAdditions;
}

export function getRangerTirelessUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities">>
): number {
  const totalUses = getRangerTirelessUsesTotal(character);
  const usesExpended =
    normalizeRangerFeatureState(character.classFeatureState?.ranger, character)
      .tirelessUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getRangerNaturesVeilUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities">>
): number {
  const totalUses = getRangerNaturesVeilUsesTotal(character);
  const usesExpended =
    normalizeRangerFeatureState(character.classFeatureState?.ranger, character)
      .naturesVeilUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getRangerWinterWalkerFortifyingSoulUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return winterWalkerSubclass.getRangerWinterWalkerFortifyingSoulUsesRemaining(character);
}

export function getRangerWinterWalkerChillingRetributionUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): number {
  return winterWalkerSubclass.getRangerWinterWalkerChillingRetributionUsesRemaining(character);
}

export function getRangerWinterWalkerFrozenHauntUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return winterWalkerSubclass.getRangerWinterWalkerFrozenHauntUsesRemaining(character);
}

export function getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormula(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string | null {
  return winterWalkerSubclass.getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormula(character);
}

export function getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplay(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string | null {
  return winterWalkerSubclass.getRangerWinterWalkerHuntersRimeTemporaryHitPointsFormulaDisplay(
    character
  );
}

export function getRangerWinterWalkerHuntersRimeTemporaryHitPointsFacts(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureActionFact[] {
  return winterWalkerSubclass.getRangerWinterWalkerHuntersRimeTemporaryHitPointsFacts(character);
}

export function getRangerWinterWalkerFortifyingSoulHealingFormula(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string | null {
  return winterWalkerSubclass.getRangerWinterWalkerFortifyingSoulHealingFormula(character);
}

export function getRangerWinterWalkerFortifyingSoulHealingFormulaDisplay(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string | null {
  return winterWalkerSubclass.getRangerWinterWalkerFortifyingSoulHealingFormulaDisplay(character);
}

export function getRangerWinterWalkerFortifyingSoulHealingFacts(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureActionFact[] {
  return winterWalkerSubclass.getRangerWinterWalkerFortifyingSoulHealingFacts(character);
}

export function getRangerWinterWalkerFrozenHauntSpellOptionState(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "subclassId">>,
  spell: Pick<SpellEntry, "id"> | null,
  spellSlotTotals: readonly number[],
  spellSlotsExpended: readonly number[]
) {
  return winterWalkerSubclass.getRangerWinterWalkerFrozenHauntSpellOptionState(
    character,
    spell,
    spellSlotTotals,
    spellSlotsExpended
  );
}

export function applyRangerWinterWalkerFrozenHauntStatusEntries(value: unknown) {
  return winterWalkerSubclass.applyRangerWinterWalkerFrozenHauntStatusEntries(value);
}

export function getRangerFeyReinforcementsUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return feyWandererSubclass.getRangerFeyWandererFeyReinforcementsUsesTotal(character);
}

export function getRangerFeyReinforcementsUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return feyWandererSubclass.getRangerFeyWandererFeyReinforcementsUsesRemaining(character);
}

export function getRangerMistyWandererUsesTotal(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "feats" | "subclassId">>
): number {
  return feyWandererSubclass.getRangerFeyWandererMistyWandererUsesTotal(character);
}

export function getRangerMistyWandererUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "feats" | "subclassId">>
): number {
  return feyWandererSubclass.getRangerFeyWandererMistyWandererUsesRemaining(character);
}

export function getRangerGloomStalkerDreadAmbusherUsesTotal(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "feats" | "subclassId">>
): number {
  return gloomStalkerSubclass.getRangerGloomStalkerDreadAmbusherUsesTotal(character);
}

export function getRangerGloomStalkerDreadAmbusherUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "abilities" | "feats" | "subclassId">>
): number {
  return gloomStalkerSubclass.getRangerGloomStalkerDreadAmbusherUsesRemaining(character);
}

export function getRangerGloomStalkerIronMindSavingThrowSelection(
  character: Pick<
    Character,
    "className" | "classFeatureState" | "level" | "savingThrowProficiencies"
  > &
    Partial<Pick<Character, "subclassId">>
): SAVING_THROW_PROFICIENCY | null {
  return gloomStalkerSubclass.getRangerGloomStalkerIronMindSavingThrowSelection(character);
}

export function getRangerGloomStalkerIronMindSavingThrowOptions(
  character: Pick<Character, "className" | "level" | "savingThrowProficiencies"> &
    Partial<Pick<Character, "classFeatureState" | "subclassId">>
): SAVING_THROW_PROFICIENCY[] {
  return gloomStalkerSubclass.getRangerGloomStalkerIronMindSavingThrowOptions(character);
}

export function getRangerHunterPreyChoice(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): RangerHunterPreyChoice | null {
  return hunterSubclass.getRangerHunterPreyChoice(character);
}

export function setRangerHunterPreyChoice(
  character: Character,
  choice: RangerHunterPreyChoice | null
): Character {
  return hunterSubclass.setRangerHunterPreyChoice(character, choice);
}

export function getRangerHunterDefensiveTacticsChoice(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): RangerHunterDefensiveTacticsChoice | null {
  return hunterSubclass.getRangerHunterDefensiveTacticsChoice(character);
}

export function setRangerHunterDefensiveTacticsChoice(
  character: Character,
  choice: RangerHunterDefensiveTacticsChoice | null
): Character {
  return hunterSubclass.setRangerHunterDefensiveTacticsChoice(character, choice);
}

export function getRangerHunterSuperiorHuntersDefenseDamageTypeSelection(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
) {
  return hunterSubclass.getRangerHunterSuperiorHuntersDefenseDamageTypeSelection(character);
}

export function setRangerHunterSuperiorHuntersDefenseDamageTypeSelection(
  character: Character,
  selection: Parameters<
    typeof hunterSubclass.setRangerHunterSuperiorHuntersDefenseDamageTypeSelection
  >[1]
): Character {
  return hunterSubclass.setRangerHunterSuperiorHuntersDefenseDamageTypeSelection(
    character,
    selection
  );
}

export function activateRangerHunterSuperiorHuntersDefense(character: Character): Character {
  return hunterSubclass.activateRangerHunterSuperiorHuntersDefense(character);
}

export function isRangerGloomStalkerIronMindLockedToWis(
  character: Pick<Character, "className" | "level" | "savingThrowProficiencies"> &
    Partial<Pick<Character, "classFeatureState" | "subclassId">>
): boolean {
  return gloomStalkerSubclass.isRangerGloomStalkerIronMindLockedToWis(character);
}

export function setRangerGloomStalkerIronMindSavingThrowSelection(
  character: Character,
  proficiency: SAVING_THROW_PROFICIENCY | null
): Character {
  return gloomStalkerSubclass.setRangerGloomStalkerIronMindSavingThrowSelection(
    character,
    proficiency
  );
}

export function consumeRangerFavoredEnemyUse(character: Character): Character {
  if (!hasRangerFeature(character, CLASS_FEATURE.FAVORED_ENEMY)) {
    return character;
  }

  const rangerState = normalizeRangerFeatureState(character.classFeatureState?.ranger, character);
  const totalUses = getRangerFavoredEnemyUsesTotal(character);
  const usesExpended = rangerState.favoredEnemyUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        favoredEnemyUsesExpended: usesExpended + 1
      }
    }
  };
}

export function consumeRangerTirelessUse(character: Character): Character {
  if (!hasRangerFeature(character, CLASS_FEATURE.TIRELESS)) {
    return character;
  }

  const rangerState = normalizeRangerFeatureState(character.classFeatureState?.ranger, character);
  const totalUses = getRangerTirelessUsesTotal(character);
  const usesExpended = rangerState.tirelessUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        tirelessUsesExpended: usesExpended + 1
      }
    }
  };
}

export function consumeRangerNaturesVeilUse(character: Character): Character {
  if (!hasRangerFeature(character, CLASS_FEATURE.NATURES_VEIL)) {
    return character;
  }

  const rangerState = normalizeRangerFeatureState(character.classFeatureState?.ranger, character);
  const totalUses = getRangerNaturesVeilUsesTotal(character);
  const usesExpended = rangerState.naturesVeilUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        naturesVeilUsesExpended: usesExpended + 1
      }
    }
  };
}

export function consumeRangerFeyReinforcementsUse(character: Character): Character {
  return feyWandererSubclass.consumeRangerFeyWandererFeyReinforcementsUse(character);
}

export function consumeRangerMistyWandererUse(character: Character): Character {
  return feyWandererSubclass.consumeRangerFeyWandererMistyWandererUse(character);
}

export function activateRangerBeastMasterAction(
  character: Character,
  actionKey: string
): Character {
  return beastMasterSubclass.activateRangerBeastMasterAction(character, actionKey);
}

export function consumeRangerGloomStalkerDreadAmbusherUse(character: Character): Character {
  return gloomStalkerSubclass.consumeRangerGloomStalkerDreadAmbusherUse(character);
}

export function activateRangerNaturesVeil(character: Character): Character {
  const nextCharacter = consumeRangerNaturesVeilUse(character);

  if (nextCharacter === character) {
    return character;
  }

  const nextStatusEntries = [
    ...normalizeCharacterStatusEntries(nextCharacter.statusEntries).filter(
      (entry) => entry.sourceId !== rangerNaturesVeilSourceId
    ),
    createCharacterStatusEntry({
      group: STATUS_ENTRY_GROUP.CONDITIONS,
      value: CONDITION_NAME.INVISIBLE,
      source: rangerNaturesVeilSource,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
      duration: {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: rangerNaturesVeilDurationRounds,
        tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
      },
      sourceId: rangerNaturesVeilSourceId
    })
  ];

  return {
    ...nextCharacter,
    statusEntries: nextStatusEntries
  };
}

export function restoreRangerFavoredEnemyOnLongRest(character: Character): Character {
  if (!hasRangerFeature(character, CLASS_FEATURE.FAVORED_ENEMY)) {
    return character;
  }

  const rangerState = normalizeRangerFeatureState(character.classFeatureState?.ranger, character);

  if ((rangerState.favoredEnemyUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        favoredEnemyUsesExpended: 0
      }
    }
  };
}

export function restoreRangerTirelessOnLongRest(character: Character): Character {
  if (!hasRangerFeature(character, CLASS_FEATURE.TIRELESS)) {
    return character;
  }

  const rangerState = normalizeRangerFeatureState(character.classFeatureState?.ranger, character);

  if ((rangerState.tirelessUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        tirelessUsesExpended: 0
      }
    }
  };
}

export function restoreRangerNaturesVeilOnLongRest(character: Character): Character {
  if (!hasRangerFeature(character, CLASS_FEATURE.NATURES_VEIL)) {
    return character;
  }

  const rangerState = normalizeRangerFeatureState(character.classFeatureState?.ranger, character);

  if ((rangerState.naturesVeilUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        naturesVeilUsesExpended: 0
      }
    }
  };
}

export function restoreRangerWinterWalkerFortifyingSoulOnLongRest(character: Character): Character {
  return winterWalkerSubclass.restoreRangerWinterWalkerFortifyingSoulOnLongRest(character);
}

export function applyRangerWinterWalkerFortifyingSoulSelfStatus(character: Character): Character {
  return winterWalkerSubclass.applyRangerWinterWalkerFortifyingSoulSelfStatus(character);
}

export function restoreRangerWinterWalkerChillingRetributionOnLongRest(
  character: Character
): Character {
  return winterWalkerSubclass.restoreRangerWinterWalkerChillingRetributionOnLongRest(character);
}

export function restoreRangerWinterWalkerFrozenHauntOnLongRest(character: Character): Character {
  return winterWalkerSubclass.restoreRangerWinterWalkerFrozenHauntOnLongRest(character);
}

export function restoreRangerFeyReinforcementsOnLongRest(character: Character): Character {
  return feyWandererSubclass.restoreRangerFeyWandererFeyReinforcementsOnLongRest(character);
}

export function restoreRangerMistyWandererOnLongRest(character: Character): Character {
  return feyWandererSubclass.restoreRangerFeyWandererMistyWandererOnLongRest(character);
}

export function restoreRangerGloomStalkerDreadAmbusherOnLongRest(character: Character): Character {
  return gloomStalkerSubclass.restoreRangerGloomStalkerDreadAmbusherOnLongRest(character);
}

export function consumeRangerWinterWalkerPolarStrikesUse(character: Character): Character {
  return winterWalkerSubclass.consumeRangerWinterWalkerPolarStrikesUse(character);
}

export function consumeRangerWinterWalkerFortifyingSoulUse(character: Character): Character {
  return winterWalkerSubclass.consumeRangerWinterWalkerFortifyingSoulUse(character);
}

export function consumeRangerWinterWalkerChillingRetributionUse(character: Character): Character {
  return winterWalkerSubclass.consumeRangerWinterWalkerChillingRetributionUse(character);
}

export function consumeRangerWinterWalkerFrozenHauntUse(character: Character): Character {
  return winterWalkerSubclass.consumeRangerWinterWalkerFrozenHauntUse(character);
}

export function applyLongRestToRangerFeatures(character: Character): Character {
  const restoredCharacter = restoreRangerGloomStalkerDreadAmbusherOnLongRest(
    restoreRangerMistyWandererOnLongRest(
      restoreRangerFeyReinforcementsOnLongRest(
        restoreRangerWinterWalkerFortifyingSoulOnLongRest(
          restoreRangerWinterWalkerChillingRetributionOnLongRest(
            restoreRangerWinterWalkerFrozenHauntOnLongRest(
              restoreRangerNaturesVeilOnLongRest(
                restoreRangerTirelessOnLongRest(restoreRangerFavoredEnemyOnLongRest(character))
              )
            )
          )
        )
      )
    )
  );
  const rangerState = getRangerFeatureState(restoredCharacter);

  if (
    (rangerState.extraAttacksRemainingThisTurn ?? 0) === 0 &&
    rangerState.dreadfulStrikesUsedThisTurn !== true &&
    rangerState.winterWalkerPolarStrikesUsedThisTurn !== true &&
    rangerState.dreadAmbusherUsedThisTurn !== true &&
    rangerState.hunterColossusSlayerUsedThisTurn !== true &&
    rangerState.hunterHordeBreakerUsedThisTurn !== true
  ) {
    return restoredCharacter;
  }

  return {
    ...restoredCharacter,
    classFeatureState: {
      ...restoredCharacter.classFeatureState,
      ranger: {
        ...rangerState,
        extraAttacksRemainingThisTurn: 0,
        dreadfulStrikesUsedThisTurn: false,
        winterWalkerPolarStrikesUsedThisTurn: false,
        dreadAmbusherUsedThisTurn: false,
        hunterColossusSlayerUsedThisTurn: false,
        hunterHordeBreakerUsedThisTurn: false
      }
    }
  };
}

export function applyShortRestToRangerFeatures(character: Character): Character {
  const rangerState = getRangerFeatureState(character);

  if (
    (rangerState.extraAttacksRemainingThisTurn ?? 0) === 0 &&
    rangerState.dreadfulStrikesUsedThisTurn !== true &&
    rangerState.winterWalkerPolarStrikesUsedThisTurn !== true &&
    rangerState.dreadAmbusherUsedThisTurn !== true &&
    rangerState.hunterColossusSlayerUsedThisTurn !== true &&
    rangerState.hunterHordeBreakerUsedThisTurn !== true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        extraAttacksRemainingThisTurn: 0,
        dreadfulStrikesUsedThisTurn: false,
        winterWalkerPolarStrikesUsedThisTurn: false,
        dreadAmbusherUsedThisTurn: false,
        hunterColossusSlayerUsedThisTurn: false,
        hunterHordeBreakerUsedThisTurn: false
      }
    }
  };
}

export function advanceRangerFeaturesForNewRound(character: Character): Character {
  if (
    getRangerAdditionalAttackCount(character) <= 0 &&
    !hasRangerFeyWandererDreadfulStrikesFeature(character) &&
    !hasRangerWinterWalkerFrigidExplorerFeature(character) &&
    !hasRangerGloomStalkerDreadAmbusherFeature(character) &&
    !hunterSubclass.hasRangerHunterHuntersPreyFeature(character)
  ) {
    return character;
  }

  const rangerState = getRangerFeatureState(character);

  if (
    (rangerState.extraAttacksRemainingThisTurn ?? 0) === 0 &&
    rangerState.dreadfulStrikesUsedThisTurn !== true &&
    rangerState.winterWalkerPolarStrikesUsedThisTurn !== true &&
    rangerState.dreadAmbusherUsedThisTurn !== true &&
    rangerState.hunterColossusSlayerUsedThisTurn !== true &&
    rangerState.hunterHordeBreakerUsedThisTurn !== true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        extraAttacksRemainingThisTurn: 0,
        dreadfulStrikesUsedThisTurn: false,
        winterWalkerPolarStrikesUsedThisTurn: false,
        dreadAmbusherUsedThisTurn: false,
        hunterColossusSlayerUsedThisTurn: false,
        hunterHordeBreakerUsedThisTurn: false
      }
    }
  };
}

export function markRangerDreadfulStrikesUsed(character: Character): Character {
  if (!hasRangerFeyWandererDreadfulStrikesFeature(character)) {
    return character;
  }

  const rangerState = getRangerFeatureState(character);

  if (rangerState.dreadfulStrikesUsedThisTurn === true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        dreadfulStrikesUsedThisTurn: true
      }
    }
  };
}

export function markRangerHunterColossusSlayerUsed(character: Character): Character {
  return hunterSubclass.markRangerHunterColossusSlayerUsed(character);
}

export function markRangerHunterHordeBreakerUsed(character: Character): Character {
  return hunterSubclass.markRangerHunterHordeBreakerUsed(character);
}

export function setRangerHunterHordeBreakerActionKey(
  character: Character,
  actionKey: string | null
): Character {
  return hunterSubclass.setRangerHunterHordeBreakerActionKey(character, actionKey);
}

export function getRangerInitiativeBonuses(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "abilities" | "subclassId">>
): FeatureInitiativeBonus[] {
  if (hasRangerGloomStalkerDreadAmbusherFeature(character)) {
    return [
      {
        label: "Dread Ambusher",
        abilityModifierSource: "WIS"
      }
    ];
  }

  return [];
}

export function getRangerWeaponMasterySelectionCount(
  character: Pick<Character, "className" | "level">
): number {
  return hasRangerFeature(character, CLASS_FEATURE.WEAPON_MASTERY)
    ? rangerWeaponMasterySelectionCount
    : 0;
}

export function getRangerWeaponMasteryOptions(): WEAPON_PROFICIENCY[] {
  return rangerWeaponMasteryOptions;
}

export function getRangerWeaponAttackMultiCount(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getRangerFeatureState(character).extraAttacksRemainingThisTurn ?? 0;
}

export function getRangerWeaponMasterySelections(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): WEAPON_PROFICIENCY[] {
  return (
    normalizeRangerFeatureState(character.classFeatureState?.ranger, character).weaponMasteries ??
    []
  );
}

export function setRangerWeaponMasterySelections(
  character: Character,
  selections: WEAPON_PROFICIENCY[]
): Character {
  if (!hasRangerFeature(character, CLASS_FEATURE.WEAPON_MASTERY)) {
    return character;
  }

  const rangerState = normalizeRangerFeatureState(character.classFeatureState?.ranger, character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      ranger: {
        ...rangerState,
        weaponMasteries: normalizeRangerWeaponMasteries(selections)
      }
    }
  };
}

export function getRangerWeaponProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureWeaponProficiencyEntry[] {
  return getRangerWeaponMasterySelections(character).map(
    (proficiency) =>
      ({
        source: PROFICIENCY_SOURCE.CLASS,
        sourceStr: rangerWeaponMasterySource,
        proficiency,
        proficiencyLevel: PROF_LEVEL.PROFICIENT,
        overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
      }) satisfies WeaponProficiencyEntry
  );
}

export function getRangerSkillProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSkillProficiencyEntry[] {
  const entries: FeatureSkillProficiencyEntry[] = [];
  const deftExplorerExpertise = getRangerDeftExplorerExpertiseSelection(character);

  if (deftExplorerExpertise) {
    const entry = createRangerExpertiseEntry(deftExplorerExpertise, rangerDeftExplorerSource);

    if (entry) {
      entries.push(entry);
    }
  }

  getRangerLevel9ExpertiseSelections(character).forEach((skill) => {
    const entry = createRangerExpertiseEntry(skill, rangerExpertiseSource);

    if (entry) {
      entries.push(entry);
    }
  });

  entries.push(
    ...feyWandererSubclass.getRangerFeyWandererOtherworldlyGlamourSkillProficiencyEntries(character)
  );

  return entries;
}

export function getRangerLanguageProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureLanguageProficiencyEntry[] {
  if (!hasRangerDeftExplorerFeature(character)) {
    return [];
  }

  return getRangerDeftExplorerLanguageSelections(character).map(
    (proficiency) =>
      ({
        source: PROFICIENCY_SOURCE.CLASS,
        sourceStr: rangerDeftExplorerSource,
        proficiency,
        proficiencyLevel: PROF_LEVEL.PROFICIENT
      }) satisfies LanguageProficiencyEntry
  );
}

export function getRangerSpeedBonuses(
  character: Pick<Character, "className" | "level">,
  context: SpeedFeatureContext
): FeatureSpeedBonus[] {
  if (!hasRangerFeature(character, CLASS_FEATURE.ROVING) || context.wornBodyArmorType === "heavy") {
    return [];
  }

  return [
    {
      label: rangerRovingSpeedBonusLabel,
      value: rangerRovingSpeedBonusValue
    },
    {
      label: rangerRovingSpeedBonusLabel,
      movementType: "climb",
      value: 0,
      setBaseFromWalkMultiplier: 1
    },
    {
      label: rangerRovingSpeedBonusLabel,
      movementType: "swim",
      value: 0,
      setBaseFromWalkMultiplier: 1
    }
  ];
}

export function consumeRangerWeaponAttack(character: Character): Character {
  if (character.className !== "Ranger") {
    return isRoundTrackerResourceAvailable(character.roundTracker, "action")
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, "action")
        }
      : character;
  }

  const rangerState = getRangerFeatureState(character);
  const extraAttacksRemaining = rangerState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        ranger: {
          ...rangerState,
          extraAttacksRemainingThisTurn: getRangerAdditionalAttackCount(character)
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
      ranger: {
        ...rangerState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
      }
    }
  };
}
