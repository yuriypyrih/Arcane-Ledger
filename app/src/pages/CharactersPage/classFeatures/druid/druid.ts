import { druidFeatureMap, druidFeatures } from "../../../../codex/classes";
import { CLASS_FEATURE, type SpellEntry } from "../../../../codex/entries";
import type {
  Character,
  DruidCircleOfTheLandChoice,
  CharacterDruidFeatureState,
  DruidElementalFuryChoice,
  DruidPrimalOrderChoice,
  MonsterRecord
} from "../../../../types";
import {
  ARMOR_PROFICIENCY,
  LANGUAGE_PROFICIENCY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  SKILL,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  WEAPON_PROFICIENCY,
  type ArmorProficiencyEntry,
  type LanguageProficiencyEntry,
  type SkillName,
  type WeaponProficiencyEntry
} from "../../../../types";
import { normalizeCharacterStatusEntries } from "../../statusEntries";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import type { WeaponAction } from "../../gameplay";
import { getSpellSlotTotalsForCharacter, normalizeSpellSlotsExpended } from "../../spellcasting";
import { clampNumber, swapTemporaryHitPointsAssignment } from "../../shared";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureArmorProficiencyEntry,
  FeatureDamageBonus,
  FeatureLanguageProficiencyEntry,
  FeatureSpellcastingState,
  FeatureSkillBonus,
  WeaponFeatureContext,
  FeatureWeaponProficiencyEntry
} from "../types";
import { createHeaderTagsFromResources } from "../cardUsage";
import * as landSubclass from "./subclasses/druidCircleOfTheLand";
import * as moonSubclass from "./subclasses/druidCircleOfTheMoon";
import * as seaSubclass from "./subclasses/druidCircleOfTheSea";
import * as starsSubclass from "./subclasses/druidCircleOfTheStars";
import {
  isDruidPrimalStrikeEligibleAttack,
  getDruidElementalFurySpellEntry,
  getDruidElementalFuryWeaponAction
} from "./druidElementalFuryDescriptions";
import {
  getDruidWildShapeActionDescription,
  getDruidWildShapeActionDescriptionAdditions
} from "./druidWildShapeDescriptions";
import type { DruidStarryFormConstellation as DruidStarryFormConstellationType } from "./subclasses/druidCircleOfTheStars";
import {
  getMonsterChallengeRatingNumber,
  getMonsterKey,
  getMonsterTypeName,
  hasMonsterFlySpeed,
  normalizeMonsterRecord
} from "../../../../utils/monsters";

const primalOrderWardenSource = "Primal Order";
const druidicSource = "Druid";
const primalStrikeSource = "Primal Strike";
const speakWithAnimalsSpellId = "spell-speak-with-animals";
const druidWildShapeSource = "Wild Shape";
const druidWildShapeStatusSourceIdPrefix = "feature-druid-wild-shape:";
export const circleOfTheStarsSubclassId = starsSubclass.circleOfTheStarsSubclassId;

export const druidWildShapeActionKey = "druid-wild-shape";
export const druidWildCompanionActionKey = "druid-wild-companion";
export const druidLandsAidActionKey = "druid-lands-aid";
export const druidNaturesSanctuaryActionKey = "druid-natures-sanctuary";
export const druidWrathOfTheSeaActionKey = "druid-wrath-of-the-sea";
export const druidStarryFormActionKey = "druid-starry-form";
export const druidWildResurgenceActionKey = "druid-wild-resurgence";
export const druidNatureMagicianActionKey = "druid-nature-magician";
export const druidMoonlightStepActionKey = "druid-moonlight-step";
export const druidNaturesSanctuaryStatusSourceId = "feature-druid-natures-sanctuary";
export const druidWrathOfTheSeaStatusSourceId = "feature-druid-wrath-of-the-sea";
export const druidStarryFormStatusSourceId = starsSubclass.druidStarryFormStatusSourceId;
export const druidCosmicOmenReactionId = starsSubclass.druidCosmicOmenReactionId;

export const druidStarryFormConstellations = starsSubclass.druidStarryFormConstellations;
export type DruidStarryFormConstellation = DruidStarryFormConstellationType;

export type DruidWildCompanionActivation =
  | {
      kind: "wild-shape";
    }
  | {
      kind: "spell-slot";
      spellSlotLevel: number;
    };

export type DruidWildShapeRules = {
  knownForms: number;
  maxCr: number;
  maxCrLabel: string;
  allowFlySpeed: boolean;
};

export type DruidNatureMagicianOption = {
  wildShapeCost: number;
  spellSlotLevel: number;
};

function getDruidNatureMagicianWildShapeCost(spellSlotLevel: number): number {
  return Math.ceil(Math.max(1, Math.floor(spellSlotLevel)) / 2);
}

function getDruidFeatureRow(level: number) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = druidFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;
}

function getUnlockedDruidFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return druidFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

export function hasDruidFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Druid") {
    return false;
  }

  return getUnlockedDruidFeatures(character.level).has(feature);
}

function getDruidWisdomModifier(character: Partial<Pick<Character, "abilities">>): number {
  return Math.floor((Math.max(1, Math.floor(character.abilities?.WIS ?? 10)) - 10) / 2);
}

function getWildShapeRulesForLevel(level: number): DruidWildShapeRules | null {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  if (normalizedLevel < 2) {
    return null;
  }

  if (normalizedLevel >= 8) {
    return {
      knownForms: 8,
      maxCr: 1,
      maxCrLabel: "1",
      allowFlySpeed: true
    };
  }

  if (normalizedLevel >= 4) {
    return {
      knownForms: 6,
      maxCr: 0.5,
      maxCrLabel: "1/2",
      allowFlySpeed: false
    };
  }

  return {
    knownForms: 4,
    maxCr: 0.25,
    maxCrLabel: "1/4",
    allowFlySpeed: false
  };
}

function getWildShapeRulesForCharacter(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): DruidWildShapeRules | null {
  if (!hasDruidFeature(character, CLASS_FEATURE.WILD_SHAPE)) {
    return null;
  }

  const baseRules = getWildShapeRulesForLevel(character.level);

  if (!baseRules) {
    return null;
  }

  return moonSubclass.getDruidCircleOfTheMoonWildShapeRules(baseRules, character);
}

function getDruidWildShapeTemporaryHitPoints(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  const normalizedLevel = Math.max(1, Math.floor(character.level));

  return moonSubclass.getDruidCircleOfTheMoonWildShapeTemporaryHitPoints(
    character,
    normalizedLevel
  );
}

export function getDruidStarryFormConstellationLabel(
  constellation: DruidStarryFormConstellation
): string {
  return starsSubclass.getDruidStarryFormConstellationLabel(constellation);
}

export function hasDruidTwinklingConstellationsFeature(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "abilities">>
): boolean {
  return starsSubclass.hasDruidTwinklingConstellationsFeature(character);
}

function getMonsterType(value: MonsterRecord): string {
  return getMonsterTypeName(value)?.trim().toLowerCase() ?? "";
}

function createDruidWildShapeStatusSourceId(monsterKey: string): string {
  return `${druidWildShapeStatusSourceIdPrefix}${monsterKey}`;
}

function pruneDruidWildShapeStatusOverrides(
  statusEntries: Character["statusEntries"]
): ReturnType<typeof normalizeCharacterStatusEntries> {
  return normalizeCharacterStatusEntries(statusEntries).filter(
    (entry) => !isDruidWildShapeStatusSourceId(entry.sourceId)
  );
}

function pruneDruidStarryFormStatusEntries(statusEntries: Character["statusEntries"]) {
  return starsSubclass.pruneDruidStarryFormStatusEntries(statusEntries);
}

function getDruidWildShapeState(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): CharacterDruidFeatureState {
  return normalizeDruidFeatureState(character.classFeatureState?.druid, character);
}

function getDruidWildCompanionDescription() {
  return druidFeatureMap[CLASS_FEATURE.WILD_COMPANION]?.description ?? [];
}

function getDruidWildResurgenceDescription() {
  return druidFeatureMap[CLASS_FEATURE.WILD_RESURGENCE]?.description ?? [];
}

function getDruidSpellSlotsRemaining(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): number[] {
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );

  return spellSlotTotals.map((total, index) =>
    Math.max(0, total - (spellSlotsExpended[index] ?? 0))
  );
}

function getWildShapeKnownFormsForState(
  record: Partial<CharacterDruidFeatureState>,
  knownFormLimit: number
): MonsterRecord[] | undefined {
  return Array.isArray(record.wildShapeKnownForms)
    ? record.wildShapeKnownForms
        .map((monster) => normalizeMonsterRecord(monster))
        .filter((monster): monster is MonsterRecord => monster !== null)
        .filter(
          (monster, index, monsters) =>
            monsters.findIndex((currentMonster) => getMonsterKey(currentMonster) === getMonsterKey(monster)) === index
        )
        .slice(0, knownFormLimit)
    : undefined;
}

function getWildShapeActiveFormForState(
  record: Partial<CharacterDruidFeatureState>
): MonsterRecord | undefined {
  return normalizeMonsterRecord(record.wildShapeActiveForm) ?? undefined;
}

export function normalizeDruidFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): CharacterDruidFeatureState {
  const hasPrimalOrder = hasDruidFeature(character, CLASS_FEATURE.PRIMAL_ORDER);
  const hasStarsSubclassState = starsSubclass.hasDruidStarMapFeature(character);
  const wildShapeRules = getWildShapeRulesForCharacter(character);
  const hasLandSubclassState = landSubclass.hasDruidCircleOfTheLandSpellsFeature(character);
  const hasElementalFury = hasDruidFeature(character, CLASS_FEATURE.ELEMENTAL_FURY);
  const hasWildResurgence = hasDruidFeature(character, CLASS_FEATURE.WILD_RESURGENCE);
  const hasArchdruid = hasDruidFeature(character, CLASS_FEATURE.ARCHDRUID);

  if (
    !hasPrimalOrder &&
    !hasStarsSubclassState &&
    !wildShapeRules &&
    !hasLandSubclassState &&
    !hasElementalFury &&
    !hasWildResurgence &&
    !hasArchdruid
  ) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterDruidFeatureState>) : {};
  const wildShapeUsesTotal = wildShapeRules
    ? Math.max(0, Math.floor(getDruidFeatureRow(character.level)?.wildShape ?? 0))
    : 0;
  const normalizedWildShapeKnownForms = wildShapeRules
    ? getWildShapeKnownFormsForState(record, wildShapeRules.knownForms)
    : undefined;
  const normalizedWildShapeActiveForm = wildShapeRules
    ? getWildShapeActiveFormForState(record)
    : undefined;

  return {
    primalOrderChoice:
      hasPrimalOrder &&
      (record.primalOrderChoice === "magician" || record.primalOrderChoice === "warden")
        ? record.primalOrderChoice
        : undefined,
    elementalFuryChoice:
      hasElementalFury &&
      (record.elementalFuryChoice === "potent-spellcasting" ||
        record.elementalFuryChoice === "primal-strike")
        ? record.elementalFuryChoice
        : undefined,
    wildShapeKnownForms: wildShapeRules ? normalizedWildShapeKnownForms : undefined,
    wildShapeUsesExpended: wildShapeRules
      ? Math.floor(clampNumber(record.wildShapeUsesExpended, 0, wildShapeUsesTotal, 0))
      : undefined,
    ...landSubclass.normalizeDruidCircleOfTheLandFeatureState(record, character),
    ...moonSubclass.normalizeDruidCircleOfTheMoonFeatureState(record, character),
    ...starsSubclass.normalizeDruidCircleOfTheStarsFeatureState(record, character),
    primalStrikeUsedThisTurn: hasElementalFury
      ? record.primalStrikeUsedThisTurn === true
      : undefined,
    wildResurgenceSpellSlotRecoveryUsesExpended: hasWildResurgence
      ? Math.floor(clampNumber(record.wildResurgenceSpellSlotRecoveryUsesExpended, 0, 1, 0))
      : undefined,
    wildResurgenceWildShapeRecoveryUsedThisTurn: hasWildResurgence
      ? record.wildResurgenceWildShapeRecoveryUsedThisTurn === true
      : undefined,
    natureMagicianUsesExpended: hasArchdruid
      ? Math.floor(clampNumber(record.natureMagicianUsesExpended, 0, 1, 0))
      : undefined,
    wildShapeActiveForm: wildShapeRules ? normalizedWildShapeActiveForm : undefined
  };
}

export function getDruidPrimalOrderChoice(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): DruidPrimalOrderChoice | null {
  if (!hasDruidFeature(character, CLASS_FEATURE.PRIMAL_ORDER)) {
    return null;
  }

  return (
    normalizeDruidFeatureState(character.classFeatureState?.druid, character).primalOrderChoice ??
    null
  );
}

export function getDruidCircleOfTheLandChoice(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): DruidCircleOfTheLandChoice | null {
  return landSubclass.getDruidCircleOfTheLandChoice(character);
}

export function getDruidElementalFuryChoice(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): DruidElementalFuryChoice | null {
  if (!hasDruidFeature(character, CLASS_FEATURE.ELEMENTAL_FURY)) {
    return null;
  }

  return (
    normalizeDruidFeatureState(character.classFeatureState?.druid, character).elementalFuryChoice ??
    null
  );
}

export function setDruidPrimalOrderChoice(
  character: Character,
  primalOrderChoice: DruidPrimalOrderChoice
): Character {
  if (!hasDruidFeature(character, CLASS_FEATURE.PRIMAL_ORDER)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...normalizeDruidFeatureState(character.classFeatureState?.druid, character),
        primalOrderChoice
      }
    }
  };
}

export function setDruidCircleOfTheLandChoice(
  character: Character,
  circleOfTheLandChoice: DruidCircleOfTheLandChoice
): Character {
  return landSubclass.setDruidCircleOfTheLandChoice(
    character,
    getDruidWildShapeState(character),
    circleOfTheLandChoice
  );
}

export function setDruidElementalFuryChoice(
  character: Character,
  elementalFuryChoice: DruidElementalFuryChoice
): Character {
  if (!hasDruidFeature(character, CLASS_FEATURE.ELEMENTAL_FURY)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...normalizeDruidFeatureState(character.classFeatureState?.druid, character),
        elementalFuryChoice
      }
    }
  };
}

export function getDruidWildShapeRules(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): DruidWildShapeRules | null {
  return getWildShapeRulesForCharacter(character);
}

export function getDruidWildShapeUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasDruidFeature(character, CLASS_FEATURE.WILD_SHAPE)) {
    return 0;
  }

  return Math.max(0, Math.floor(getDruidFeatureRow(character.level)?.wildShape ?? 0));
}

export function getDruidWildShapeUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getDruidWildShapeUsesTotal(character);

  if (totalUses <= 0) {
    return 0;
  }

  return Math.max(0, totalUses - (getDruidWildShapeState(character).wildShapeUsesExpended ?? 0));
}

export function getDruidStarMapGuidingBoltUsesTotal(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  return starsSubclass.getDruidStarMapGuidingBoltUsesTotal(character);
}

export function getDruidStarMapGuidingBoltUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  return starsSubclass.getDruidStarMapGuidingBoltUsesRemaining(character);
}

export function getDruidMoonlightStepUsesTotal(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  return moonSubclass.getDruidMoonlightStepUsesTotal(character);
}

export function getDruidMoonlightStepUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  return moonSubclass.getDruidMoonlightStepUsesRemaining(character);
}

export function getDruidMoonlightStepFallbackSlotLevel(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): number | null {
  return moonSubclass.getDruidMoonlightStepFallbackSlotLevel(character);
}

export function getDruidMoonlightStepFallbackSlotSummary(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): { remaining: number; total: number } {
  return moonSubclass.getDruidMoonlightStepFallbackSlotSummary(character);
}

export function getDruidNatureMagicianUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  return hasDruidFeature(character, CLASS_FEATURE.ARCHDRUID) ? 1 : 0;
}

export function getDruidNaturalRecoveryUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return landSubclass.getDruidNaturalRecoveryUsesTotal(character);
}

export function getDruidNaturalRecoveryUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return landSubclass.getDruidNaturalRecoveryUsesRemaining(character);
}

export function getDruidNatureMagicianUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getDruidNatureMagicianUsesTotal(character);

  if (totalUses <= 0) {
    return 0;
  }

  return Math.max(
    0,
    totalUses - (getDruidWildShapeState(character).natureMagicianUsesExpended ?? 0)
  );
}

export function getDruidWildResurgenceSpellSlotRecoveryUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  return hasDruidFeature(character, CLASS_FEATURE.WILD_RESURGENCE) ? 1 : 0;
}

export function getDruidWildResurgenceSpellSlotRecoveryUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getDruidWildResurgenceSpellSlotRecoveryUsesTotal(character);

  if (totalUses <= 0) {
    return 0;
  }

  return Math.max(
    0,
    totalUses - (getDruidWildShapeState(character).wildResurgenceSpellSlotRecoveryUsesExpended ?? 0)
  );
}

export function getDruidWildResurgenceAvailableSpellSlotLevels(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellSlotsExpended">
): number[] {
  if (
    !hasDruidFeature(character, CLASS_FEATURE.WILD_RESURGENCE) ||
    getDruidWildShapeUsesRemaining(character) > 0 ||
    getDruidWildShapeState(character).wildResurgenceWildShapeRecoveryUsedThisTurn === true
  ) {
    return [];
  }

  return getDruidSpellSlotsRemaining(character).flatMap((remainingSlots, index) =>
    remainingSlots > 0 ? [index + 1] : []
  );
}

export function getDruidWildCompanionAvailableSpellSlotLevels(
  character: Pick<Character, "className" | "level" | "spellSlotsExpended">
): number[] {
  if (!hasDruidFeature(character, CLASS_FEATURE.WILD_COMPANION)) {
    return [];
  }

  return getDruidSpellSlotsRemaining(character).flatMap((remainingSlots, index) =>
    remainingSlots > 0 ? [index + 1] : []
  );
}

export function getDruidWildShapeKnownForms(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): MonsterRecord[] {
  return getDruidWildShapeState(character).wildShapeKnownForms ?? [];
}

export function getDruidWildShapeActiveForm(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): MonsterRecord | null {
  return getDruidWildShapeState(character).wildShapeActiveForm ?? null;
}

export function getDruidActiveStarryFormConstellation(
  character: Pick<Character, "statusEntries">
): DruidStarryFormConstellation | null {
  return starsSubclass.getDruidActiveStarryFormConstellation(character);
}

export function setDruidActiveStarryFormConstellation(
  character: Character,
  constellation: DruidStarryFormConstellation
): Character {
  return starsSubclass.setDruidActiveStarryFormConstellation(character, constellation);
}

export function getDruidNatureMagicianOptions(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellSlotsExpended">
): DruidNatureMagicianOption[] {
  if (!hasDruidFeature(character, CLASS_FEATURE.ARCHDRUID)) {
    return [];
  }

  const wildShapeUsesRemaining = getDruidWildShapeUsesRemaining(character);

  if (wildShapeUsesRemaining <= 0) {
    return [];
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const maxSpellSlotLevel = Math.min(spellSlotTotals.length, wildShapeUsesRemaining * 2);

  return Array.from({ length: maxSpellSlotLevel }, (_, index) => index + 1)
    .map((spellSlotLevel) => ({
      spellSlotLevel,
      wildShapeCost: getDruidNatureMagicianWildShapeCost(spellSlotLevel)
    }))
    .filter(({ spellSlotLevel }) => {
      const totalSlots = spellSlotTotals[spellSlotLevel - 1] ?? 0;
      const expendedSlots = spellSlotsExpended[spellSlotLevel - 1] ?? 0;

      return totalSlots > 0 && expendedSlots > 0;
    });
}

export function setDruidWildShapeKnownForms(
  character: Character,
  wildShapeKnownForms: MonsterRecord[]
): Character {
  const wildShapeRules = getDruidWildShapeRules(character);

  if (!wildShapeRules) {
    return character;
  }

  const normalizedKnownForms = wildShapeKnownForms
    .filter(
      (monster, index, monsters) =>
        monsters.findIndex((currentMonster) => getMonsterKey(currentMonster) === getMonsterKey(monster)) === index
    )
    .slice(0, wildShapeRules.knownForms);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...getDruidWildShapeState(character),
        wildShapeKnownForms: normalizedKnownForms
      }
    }
  };
}

export function restoreOneDruidWildShapeUse(character: Character): Character {
  const wildShapeState = getDruidWildShapeState(character);
  const wildShapeUsesExpended = wildShapeState.wildShapeUsesExpended ?? 0;

  if (getDruidWildShapeUsesTotal(character) <= 0 || wildShapeUsesExpended <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...wildShapeState,
        wildShapeUsesExpended: wildShapeUsesExpended - 1
      }
    }
  };
}

export function restoreAllDruidWildShapeUses(character: Character): Character {
  const wildShapeState = getDruidWildShapeState(character);

  if (
    getDruidWildShapeUsesTotal(character) <= 0 ||
    (wildShapeState.wildShapeUsesExpended ?? 0) <= 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...wildShapeState,
        wildShapeUsesExpended: 0
      }
    }
  };
}

export function restoreDruidStarMapGuidingBoltOnLongRest(character: Character): Character {
  return starsSubclass.restoreDruidStarMapGuidingBoltOnLongRest(
    character,
    getDruidWildShapeState(character)
  );
}

export function restoreDruidCosmicOmenOnLongRest(character: Character): Character {
  return starsSubclass.restoreDruidCosmicOmenOnLongRest(
    character,
    getDruidWildShapeState(character)
  );
}

export function restoreDruidMoonlightStepOnLongRest(character: Character): Character {
  return moonSubclass.restoreDruidMoonlightStepOnLongRest(
    character,
    getDruidWildShapeState(character)
  );
}

export function restoreDruidNatureMagicianOnLongRest(character: Character): Character {
  const druidState = getDruidWildShapeState(character);

  if (
    getDruidNatureMagicianUsesTotal(character) <= 0 ||
    (druidState.natureMagicianUsesExpended ?? 0) <= 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        natureMagicianUsesExpended: 0
      }
    }
  };
}

export function restoreDruidNaturalRecoveryOnLongRest(character: Character): Character {
  return landSubclass.restoreDruidNaturalRecoveryOnLongRest(
    character,
    getDruidWildShapeState(character)
  );
}

export function restoreDruidWildResurgenceOnLongRest(character: Character): Character {
  const druidState = getDruidWildShapeState(character);

  if (
    getDruidWildResurgenceSpellSlotRecoveryUsesTotal(character) <= 0 &&
    druidState.wildResurgenceWildShapeRecoveryUsedThisTurn !== true
  ) {
    return character;
  }

  if (
    (druidState.wildResurgenceSpellSlotRecoveryUsesExpended ?? 0) <= 0 &&
    druidState.wildResurgenceWildShapeRecoveryUsedThisTurn !== true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        wildResurgenceSpellSlotRecoveryUsesExpended: 0,
        wildResurgenceWildShapeRecoveryUsedThisTurn: false
      }
    }
  };
}

export function consumeDruidStarMapGuidingBoltUse(character: Character): Character {
  return starsSubclass.consumeDruidStarMapGuidingBoltUse(
    character,
    getDruidWildShapeState(character)
  );
}

export function consumeDruidCosmicOmenUse(character: Character): Character {
  return starsSubclass.consumeDruidCosmicOmenUse(character, getDruidWildShapeState(character));
}

export function getDruidCosmicOmenUsesTotal(
  character: Pick<Character, "className" | "level"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  return starsSubclass.getDruidCosmicOmenUsesTotal(character);
}

export function getDruidCosmicOmenUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
): number {
  return starsSubclass.getDruidCosmicOmenUsesRemaining(character);
}

export function getDruidCosmicOmenSelection(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "abilities">>
) {
  return starsSubclass.getDruidCosmicOmenSelection(character);
}

export function setDruidCosmicOmenSelection(
  character: Character,
  selection: Parameters<typeof starsSubclass.setDruidCosmicOmenSelection>[1]
): Character {
  return starsSubclass.setDruidCosmicOmenSelection(character, selection);
}

export function markDruidPrimalStrikeUsed(character: Character): Character {
  if (
    getDruidElementalFuryChoice(character) !== "primal-strike" ||
    getDruidWildShapeState(character).primalStrikeUsedThisTurn === true
  ) {
    return character;
  }

  const druidState = getDruidWildShapeState(character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        primalStrikeUsedThisTurn: true
      }
    }
  };
}

export function consumeDruidNaturalRecoveryUse(character: Character): Character {
  return landSubclass.consumeDruidNaturalRecoveryUse(character, getDruidWildShapeState(character));
}

export function expendOneDruidWildShapeUse(character: Character): Character {
  const totalUses = getDruidWildShapeUsesTotal(character);
  const wildShapeState = getDruidWildShapeState(character);
  const wildShapeUsesExpended = wildShapeState.wildShapeUsesExpended ?? 0;

  if (totalUses <= 0 || wildShapeUsesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...wildShapeState,
        wildShapeUsesExpended: wildShapeUsesExpended + 1
      }
    }
  };
}

export function applyArchdruidOnInitiative(character: Character): Character {
  if (
    !hasDruidFeature(character, CLASS_FEATURE.ARCHDRUID) ||
    getDruidWildShapeUsesRemaining(character) > 0
  ) {
    return character;
  }

  return restoreOneDruidWildShapeUse(character);
}

export function activateDruidWildResurgenceWildShapeRecovery(
  character: Character,
  spellSlotLevel: number
): Character {
  const normalizedSpellSlotLevel = Math.max(1, Math.floor(spellSlotLevel));
  const availableSpellSlotLevels = getDruidWildResurgenceAvailableSpellSlotLevels(character);

  if (!availableSpellSlotLevels.includes(normalizedSpellSlotLevel)) {
    return character;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const nextSpellSlotsExpended = [...spellSlotsExpended];
  nextSpellSlotsExpended[normalizedSpellSlotLevel - 1] =
    (nextSpellSlotsExpended[normalizedSpellSlotLevel - 1] ?? 0) + 1;
  const nextCharacter = restoreOneDruidWildShapeUse({
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  });
  const nextDruidState = getDruidWildShapeState(nextCharacter);

  return {
    ...nextCharacter,
    classFeatureState: {
      ...nextCharacter.classFeatureState,
      druid: {
        ...nextDruidState,
        wildResurgenceWildShapeRecoveryUsedThisTurn: true
      }
    }
  };
}

export function activateDruidWildResurgenceLevelOneSpellSlotRecovery(
  character: Character
): Character {
  const usesRemaining = getDruidWildResurgenceSpellSlotRecoveryUsesRemaining(character);
  const wildShapeUsesRemaining = getDruidWildShapeUsesRemaining(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );

  if (
    usesRemaining <= 0 ||
    wildShapeUsesRemaining <= 0 ||
    (spellSlotTotals[0] ?? 0) <= 0 ||
    (spellSlotsExpended[0] ?? 0) <= 0
  ) {
    return character;
  }

  const nextCharacter = expendOneDruidWildShapeUse(character);
  const nextDruidState = getDruidWildShapeState(nextCharacter);
  const nextSpellSlotsExpended = normalizeSpellSlotsExpended(
    nextCharacter.spellSlotsExpended,
    spellSlotTotals
  );
  nextSpellSlotsExpended[0] = Math.max(0, (nextSpellSlotsExpended[0] ?? 0) - 1);

  return {
    ...nextCharacter,
    spellSlotsExpended: nextSpellSlotsExpended,
    classFeatureState: {
      ...nextCharacter.classFeatureState,
      druid: {
        ...nextDruidState,
        wildResurgenceSpellSlotRecoveryUsesExpended: Math.min(
          getDruidWildResurgenceSpellSlotRecoveryUsesTotal(nextCharacter),
          (nextDruidState.wildResurgenceSpellSlotRecoveryUsesExpended ?? 0) + 1
        )
      }
    }
  };
}

export function activateDruidWildCompanion(
  character: Character,
  activation: DruidWildCompanionActivation
): Character {
  if (activation.kind === "wild-shape") {
    if (getDruidWildShapeUsesRemaining(character) <= 0) {
      return character;
    }

    return expendOneDruidWildShapeUse(character);
  }

  const availableSpellSlotLevels = getDruidWildCompanionAvailableSpellSlotLevels(character);

  if (!availableSpellSlotLevels.includes(activation.spellSlotLevel)) {
    return character;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const nextSpellSlotsExpended = [...spellSlotsExpended];
  nextSpellSlotsExpended[activation.spellSlotLevel - 1] =
    (nextSpellSlotsExpended[activation.spellSlotLevel - 1] ?? 0) + 1;

  return {
    ...character,
    spellSlotsExpended: nextSpellSlotsExpended
  };
}

export function activateDruidLandsAid(character: Character): Character {
  return landSubclass.activateDruidLandsAid(character);
}

export function activateDruidMoonlightStep(character: Character): Character {
  return moonSubclass.activateDruidMoonlightStep(character, getDruidWildShapeState(character));
}

export function activateDruidNaturesSanctuary(character: Character): Character {
  return landSubclass.activateDruidNaturesSanctuary(character);
}

export function activateDruidWrathOfTheSea(character: Character): Character {
  return seaSubclass.activateDruidWrathOfTheSea(character);
}

export function activateDruidNatureMagician(
  character: Character,
  spellSlotLevel: number
): Character {
  const natureMagicianUsesRemaining = getDruidNatureMagicianUsesRemaining(character);

  if (natureMagicianUsesRemaining <= 0) {
    return character;
  }

  const normalizedSpellSlotLevel = Math.max(1, Math.floor(spellSlotLevel));
  const option = getDruidNatureMagicianOptions(character).find(
    (candidate) => candidate.spellSlotLevel === normalizedSpellSlotLevel
  );

  if (!option || getDruidWildShapeUsesRemaining(character) < option.wildShapeCost) {
    return character;
  }

  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsExpended = normalizeSpellSlotsExpended(
    character.spellSlotsExpended,
    spellSlotTotals
  );
  const targetIndex = option.spellSlotLevel - 1;

  if ((spellSlotsExpended[targetIndex] ?? 0) <= 0) {
    return character;
  }

  let nextCharacter = character;

  for (let spendCount = 0; spendCount < option.wildShapeCost; spendCount += 1) {
    nextCharacter = expendOneDruidWildShapeUse(nextCharacter);
  }

  const nextDruidState = getDruidWildShapeState(nextCharacter);
  const nextSpellSlotsExpended = normalizeSpellSlotsExpended(
    nextCharacter.spellSlotsExpended,
    spellSlotTotals
  );
  nextSpellSlotsExpended[targetIndex] = Math.max(0, (nextSpellSlotsExpended[targetIndex] ?? 0) - 1);

  return {
    ...nextCharacter,
    spellSlotsExpended: nextSpellSlotsExpended,
    classFeatureState: {
      ...nextCharacter.classFeatureState,
      druid: {
        ...nextDruidState,
        natureMagicianUsesExpended: Math.min(
          getDruidNatureMagicianUsesTotal(nextCharacter),
          (nextDruidState.natureMagicianUsesExpended ?? 0) + 1
        )
      }
    }
  };
}

export function activateDruidStarryForm(
  character: Character,
  constellation: DruidStarryFormConstellation
): Character {
  return starsSubclass.activateDruidStarryForm(character, constellation);
}

export function activateDruidWildShape(character: Character, monsterKey: string): Character {
  const wildShapeState = getDruidWildShapeState(character);
  const selectedMonster =
    wildShapeState.wildShapeKnownForms?.find((monster) => getMonsterKey(monster) === monsterKey) ??
    (wildShapeState.wildShapeActiveForm &&
    getMonsterKey(wildShapeState.wildShapeActiveForm) === monsterKey
      ? wildShapeState.wildShapeActiveForm
      : null);
  const totalUses = getDruidWildShapeUsesTotal(character);
  const usesRemaining = getDruidWildShapeUsesRemaining(character);

  if (!selectedMonster || totalUses <= 0 || usesRemaining <= 0) {
    return character;
  }

  const nextTemporaryHitPointsAssignment = swapTemporaryHitPointsAssignment(
    character.temporaryHitPoints,
    character.temporaryHitPointsSource,
    getDruidWildShapeTemporaryHitPoints(character),
    druidWildShapeSource
  );

  return {
    ...character,
    ...nextTemporaryHitPointsAssignment,
    statusEntries: pruneDruidStarryFormStatusEntries(
      pruneDruidWildShapeStatusOverrides(character.statusEntries)
    ),
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...wildShapeState,
        wildShapeUsesExpended: Math.min(totalUses, (wildShapeState.wildShapeUsesExpended ?? 0) + 1),
        wildShapeActiveForm: selectedMonster
      }
    }
  };
}

export function deactivateDruidWildShape(character: Character): Character {
  const wildShapeState = getDruidWildShapeState(character);
  const nextStatusEntries = pruneDruidWildShapeStatusOverrides(character.statusEntries);
  const removedOverrideEntries =
    nextStatusEntries.length !== normalizeCharacterStatusEntries(character.statusEntries).length;

  if (!wildShapeState.wildShapeActiveForm && !removedOverrideEntries) {
    return character;
  }

  return {
    ...character,
    statusEntries: nextStatusEntries,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...wildShapeState,
        wildShapeActiveForm: undefined
      }
    }
  };
}

export function isDruidWildShapeStatusSourceId(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(druidWildShapeStatusSourceIdPrefix);
}

export function getDruidDerivedStatusEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): DerivedFeatureStatusEntry[] {
  const activeForm = getDruidWildShapeActiveForm(character);

  if (!activeForm) {
    return [];
  }

  const sourceId = createDruidWildShapeStatusSourceId(getMonsterKey(activeForm));

  return [
    {
      id: sourceId,
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: activeForm.name,
      source: druidWildShapeSource,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.HOURS,
        amount: Math.max(1, Math.floor(character.level / 2))
      },
      sourceId,
      rangeFeet: null
    }
  ];
}

export function getDruidWildShapeAction(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard | null {
  if (!hasDruidFeature(character, CLASS_FEATURE.WILD_SHAPE)) {
    return null;
  }

  const totalUses = getDruidWildShapeUsesTotal(character);
  const usesRemaining = getDruidWildShapeUsesRemaining(character);
  const knownForms = getDruidWildShapeKnownForms(character);

  return {
    key: druidWildShapeActionKey,
    name: "Wild Shape",
    summary:
      knownForms.length > 0
        ? "Shape-shift into one of your learned beast forms."
        : "Choose beast forms in Class Features.",
    detail:
      knownForms.length > 0
        ? "Choose one of your learned beast forms and shape-shift as a Bonus Action."
        : "Choose beast forms in Class Features before you shape-shift.",
    breakdown: "Shift into beast",
    description: [],
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal: totalUses,
    hideUsesTrackerOnCard: true,
    usesInlineLabel: "Use 1",
    usesInlineIcon: "paw",
    headerTags: createHeaderTagsFromResources([
      {
        kind: "tracker",
        label: "Uses",
        current: usesRemaining,
        total: totalUses,
        icon: "paw",
        cost: 1
      }
    ]),
    drawer: {
      kind: "custom-form",
      eyebrow: "Druid",
      description: getDruidWildShapeActionDescription(character),
      descriptionAdditions: getDruidWildShapeActionDescriptionAdditions(character),
      formKind: "wild-shape"
    },
    execute: {
      kind: "custom-form",
      formKind: "wild-shape"
    },
    disabled: usesRemaining <= 0,
    disabledReason: usesRemaining <= 0 ? "No Wild Shape uses remaining." : undefined
  };
}

export function getDruidWildCompanionAction(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellSlotsExpended">
): FeatureActionCard | null {
  if (!hasDruidFeature(character, CLASS_FEATURE.WILD_COMPANION)) {
    return null;
  }

  const wildShapeUsesRemaining = getDruidWildShapeUsesRemaining(character);
  const wildShapeUsesTotal = getDruidWildShapeUsesTotal(character);
  const availableSpellSlotLevels = getDruidWildCompanionAvailableSpellSlotLevels(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotCount = spellSlotTotals.reduce((sum, value) => sum + value, 0);
  const remainingSpellSlotCount = getDruidSpellSlotsRemaining(character).reduce(
    (sum, value) => sum + value,
    0
  );
  const hasValidResource = wildShapeUsesRemaining > 0 || availableSpellSlotLevels.length > 0;

  return {
    key: druidWildCompanionActionKey,
    name: "Wild Companion",
    summary: "Cast Find Familiar with Wild Shape or a spell slot.",
    detail: "Summon a fey familiar using Wild Shape or a spell slot.",
    breakdown: "Summon familiar",
    description: getDruidWildCompanionDescription(),
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    hideUsesTrackerOnCard: true,
    usesInlineLabel: "Use 1",
    usesInlineIcon: "paw",
    headerTags: createHeaderTagsFromResources([
      {
        kind: "text",
        label: "Wild Shape",
        value: `${wildShapeUsesRemaining}/${wildShapeUsesTotal}`,
        icon: "paw"
      },
      ...(spellSlotCount > 0
        ? [
            {
              kind: "text" as const,
              label: "Spell Slots",
              value: `${remainingSpellSlotCount}/${spellSlotCount}`
            }
          ]
        : [])
    ]),
    drawer: {
      kind: "custom-form",
      eyebrow: "Druid",
      description: getDruidWildCompanionDescription(),
      formKind: "wild-companion",
      headerTags: createHeaderTagsFromResources([
        {
          kind: "text",
          label: "Wild Shape",
          value: `${wildShapeUsesRemaining}/${wildShapeUsesTotal}`,
          icon: "paw"
        },
        ...(spellSlotCount > 0
          ? [
              {
                kind: "text" as const,
                label: "Spell Slots",
                value: `${remainingSpellSlotCount}/${spellSlotCount}`
              }
            ]
          : [])
      ])
    },
    execute: {
      kind: "custom-form",
      formKind: "wild-companion"
    },
    disabled: !hasValidResource,
    disabledReason: !hasValidResource ? "No Wild Shape uses or spell slots available." : undefined
  };
}

function getDruidNatureMagicianDescription() {
  return (druidFeatureMap[CLASS_FEATURE.ARCHDRUID]?.description ?? []).filter((entry) =>
    entry.includes("Nature Magician")
  );
}

export function getDruidWildResurgenceAction(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellSlotsExpended">
): FeatureActionCard | null {
  if (!hasDruidFeature(character, CLASS_FEATURE.WILD_RESURGENCE)) {
    return null;
  }

  const wildShapeUsesRemaining = getDruidWildShapeUsesRemaining(character);
  const wildShapeUsesTotal = getDruidWildShapeUsesTotal(character);
  const spellSlotRecoveryUsesRemaining =
    getDruidWildResurgenceSpellSlotRecoveryUsesRemaining(character);
  const spellSlotRecoveryUsesTotal = getDruidWildResurgenceSpellSlotRecoveryUsesTotal(character);
  const availableSpellSlotLevels = getDruidWildResurgenceAvailableSpellSlotLevels(character);
  const spellSlotTotals = getSpellSlotTotalsForCharacter(character.className, character.level);
  const spellSlotsRemaining = getDruidSpellSlotsRemaining(character);
  const levelOneSlotTotal = spellSlotTotals[0] ?? 0;
  const levelOneSlotRemaining = spellSlotsRemaining[0] ?? 0;
  const canRecoverWildShape = availableSpellSlotLevels.length > 0;
  const canRecoverLevelOneSpellSlot =
    spellSlotRecoveryUsesRemaining > 0 &&
    wildShapeUsesRemaining > 0 &&
    levelOneSlotRemaining < levelOneSlotTotal;
  const wildResurgenceState = getDruidWildShapeState(character);
  const disabledReason =
    canRecoverWildShape || canRecoverLevelOneSpellSlot
      ? undefined
      : wildShapeUsesRemaining <= 0
        ? wildResurgenceState.wildResurgenceWildShapeRecoveryUsedThisTurn === true
          ? "Wild Resurgence can restore Wild Shape only once on each of your turns."
          : "No spell slots available to convert into Wild Shape."
        : spellSlotRecoveryUsesRemaining <= 0
          ? "Wild Resurgence's level 1 spell slot recovery recharges on a Long Rest."
          : levelOneSlotTotal <= 0 || levelOneSlotRemaining >= levelOneSlotTotal
            ? "No expended level 1 spell slot to restore."
            : "Wild Shape must be depleted before you can recover it with a spell slot.";

  return {
    key: druidWildResurgenceActionKey,
    name: "Wild Resurgence",
    summary: "Recover Wild Shape or a level 1 spell slot without using an action.",
    detail: "Recover Wild Shape or a level 1 spell slot without using an action.",
    breakdown: "Recover shape or slot",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining: spellSlotRecoveryUsesRemaining,
    usesTotal: spellSlotRecoveryUsesTotal,
    drawer: {
      kind: "custom-form",
      eyebrow: "Druid",
      description: getDruidWildResurgenceDescription(),
      formKind: "wild-resurgence"
    },
    execute: {
      kind: "custom-form",
      formKind: "wild-resurgence"
    },
    headerTags: createHeaderTagsFromResources([
      {
        kind: "text",
        label: "Wild Shape",
        value: `${wildShapeUsesRemaining}/${wildShapeUsesTotal}`,
        icon: "paw"
      },
      ...(levelOneSlotTotal > 0
        ? [
            {
              kind: "text" as const,
              label: "Level 1 Slots",
              value: `${levelOneSlotRemaining}/${levelOneSlotTotal}`
            }
          ]
        : [])
    ]),
    disabled: disabledReason !== undefined,
    disabledReason
  };
}

export function getDruidNatureMagicianAction(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellSlotsExpended">
): FeatureActionCard | null {
  if (!hasDruidFeature(character, CLASS_FEATURE.ARCHDRUID)) {
    return null;
  }

  const usesRemaining = getDruidNatureMagicianUsesRemaining(character);
  const usesTotal = getDruidNatureMagicianUsesTotal(character);
  const wildShapeUsesRemaining = getDruidWildShapeUsesRemaining(character);
  const wildShapeUsesTotal = getDruidWildShapeUsesTotal(character);
  const natureMagicianOptions = getDruidNatureMagicianOptions(character);
  const disabledReason =
    usesRemaining <= 0
      ? "Nature Magician recharges on a Long Rest."
      : wildShapeUsesRemaining <= 0
        ? "No Wild Shape uses remaining."
        : natureMagicianOptions.length <= 0
          ? "No matching expended spell slots can be restored."
          : undefined;

  return {
    key: druidNatureMagicianActionKey,
    name: "Nature Magician",
    summary: "Convert Wild Shape into an expended spell slot.",
    detail: "Convert Wild Shape into an expended spell slot.",
    breakdown: "Shape for spell slot",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining,
    usesTotal,
    drawer: {
      kind: "custom-form",
      eyebrow: "Druid",
      description: getDruidNatureMagicianDescription(),
      formKind: "nature-magician"
    },
    execute: {
      kind: "custom-form",
      formKind: "nature-magician"
    },
    headerTags: createHeaderTagsFromResources([
      {
        kind: "text",
        label: "Wild Shape",
        value: `${wildShapeUsesRemaining}/${wildShapeUsesTotal}`,
        icon: "paw"
      }
    ]),
    disabled: disabledReason !== undefined,
    disabledReason
  };
}

export function getDruidFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "spellSlotsExpended">
): FeatureActionCard[] {
  return [
    getDruidWildShapeAction(character),
    getDruidWildCompanionAction(character),
    getDruidWildResurgenceAction(character),
    getDruidNatureMagicianAction(character)
  ].filter((action): action is FeatureActionCard => action !== null);
}

export function applyShortRestToDruidFeatures(character: Character): Character {
  const nextCharacter = restoreOneDruidWildShapeUse(character);
  const druidState = getDruidWildShapeState(nextCharacter);

  if (druidState.primalStrikeUsedThisTurn !== true) {
    return nextCharacter;
  }

  return {
    ...nextCharacter,
    classFeatureState: {
      ...nextCharacter.classFeatureState,
      druid: {
        ...druidState,
        primalStrikeUsedThisTurn: false
      }
    }
  };
}

export function applyLongRestToDruidFeatures(character: Character): Character {
  const nextCharacter = restoreDruidNaturalRecoveryOnLongRest(
    restoreDruidNatureMagicianOnLongRest(
      restoreDruidMoonlightStepOnLongRest(
        restoreDruidCosmicOmenOnLongRest(
          restoreDruidStarMapGuidingBoltOnLongRest(
            restoreDruidWildResurgenceOnLongRest(restoreAllDruidWildShapeUses(character))
          )
        )
      )
    )
  );
  const druidState = getDruidWildShapeState(nextCharacter);

  if (druidState.primalStrikeUsedThisTurn !== true) {
    return nextCharacter;
  }

  return {
    ...nextCharacter,
    classFeatureState: {
      ...nextCharacter.classFeatureState,
      druid: {
        ...druidState,
        primalStrikeUsedThisTurn: false
      }
    }
  };
}

export function advanceDruidFeaturesForNewRound(character: Character): Character {
  const druidState = getDruidWildShapeState(character);

  if (
    druidState.wildResurgenceWildShapeRecoveryUsedThisTurn !== true &&
    druidState.primalStrikeUsedThisTurn !== true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      druid: {
        ...druidState,
        primalStrikeUsedThisTurn: false,
        wildResurgenceWildShapeRecoveryUsedThisTurn: false
      }
    }
  };
}

export function getDruidWildShapeIneligibilityReason(
  monster: MonsterRecord,
  character: Pick<Character, "className" | "level">
): string | null {
  const rules = getDruidWildShapeRules(character);

  if (!rules) {
    return "Wild Shape is not unlocked yet.";
  }

  if (getMonsterType(monster) !== "beast") {
    return "Wild Shape forms must be Beasts.";
  }

  const challengeRating = getMonsterChallengeRatingNumber(monster);

  if (challengeRating !== null && challengeRating > rules.maxCr) {
    return `This form exceeds the current CR ${rules.maxCrLabel} limit.`;
  }

  if (!rules.allowFlySpeed && hasMonsterFlySpeed(monster)) {
    return "Fly Speed forms are not available yet.";
  }

  return null;
}

export function getDruidSpellcastingState(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureSpellcastingState {
  const moonSpellcastingState = moonSubclass.getDruidCircleOfTheMoonSpellcastingState(
    character,
    getDruidWildShapeActiveForm(character) !== null,
    hasDruidFeature(character, CLASS_FEATURE.BEAST_SPELLS)
  );

  if (moonSpellcastingState) {
    return moonSpellcastingState;
  }

  if (!getDruidWildShapeActiveForm(character)) {
    return {
      blocked: false,
      reason: null
    };
  }

  return {
    blocked: true,
    reason: "Cannot use it while in Wild Shape."
  };
}

export function getDruidCantripBonus(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getDruidPrimalOrderChoice(character) === "magician" ? 1 : 0;
}

export function getDruidCantripDamageBonus(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities">
): number {
  if (getDruidElementalFuryChoice(character) !== "potent-spellcasting") {
    return 0;
  }

  return getDruidWisdomModifier(character);
}

export function getDruidSpellEntry(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  spell: SpellEntry
): SpellEntry {
  return getDruidElementalFurySpellEntry(character, getDruidElementalFuryChoice(character), spell);
}

export function getDruidWeaponDamageBonuses(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: WeaponFeatureContext
): FeatureDamageBonus[] {
  const druidState = getDruidWildShapeState(character);

  if (
    getDruidElementalFuryChoice(character) !== "primal-strike" ||
    druidState.primalStrikeUsedThisTurn === true ||
    !isDruidPrimalStrikeEligibleAttack(context)
  ) {
    return [];
  }

  const primalStrikeFormula = hasDruidFeature(character, CLASS_FEATURE.IMPROVED_ELEMENTAL_FURY)
    ? "2d8"
    : "1d8";

  return [
    {
      label: primalStrikeSource,
      formula: primalStrikeFormula,
      displayLabel: `${primalStrikeFormula} Cold/Fire/Lightning/Thunder`
    }
  ];
}

export function getDruidWeaponAction(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  action: WeaponAction
): WeaponAction {
  return getDruidElementalFuryWeaponAction(
    character,
    getDruidElementalFuryChoice(character),
    action
  );
}

export function getDruidSkillBonuses(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  skill: SkillName
): FeatureSkillBonus[] {
  if (getDruidPrimalOrderChoice(character) !== "magician") {
    return [];
  }

  if (skill !== SKILL.ARCANA && skill !== SKILL.NATURE) {
    return [];
  }

  return [
    {
      label: "WIS (Primal Order)",
      abilityModifierSource: "WIS",
      minimumValue: 1
    }
  ];
}

export function getDruidWeaponProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureWeaponProficiencyEntry[] {
  if (getDruidPrimalOrderChoice(character) !== "warden") {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: primalOrderWardenSource,
      proficiency: WEAPON_PROFICIENCY.MARTIAL,
      proficiencyLevel: PROF_LEVEL.PROFICIENT
    } satisfies WeaponProficiencyEntry
  ];
}

export function getDruidArmorProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureArmorProficiencyEntry[] {
  if (getDruidPrimalOrderChoice(character) !== "warden") {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: primalOrderWardenSource,
      proficiency: ARMOR_PROFICIENCY.MEDIUM,
      proficiencyLevel: PROF_LEVEL.PROFICIENT
    } satisfies ArmorProficiencyEntry
  ];
}

export function getDruidLanguageProficiencyEntries(
  character: Pick<Character, "className" | "level">
): FeatureLanguageProficiencyEntry[] {
  if (!hasDruidFeature(character, CLASS_FEATURE.DRUIDIC)) {
    return [];
  }

  return [
    {
      source: PROFICIENCY_SOURCE.CLASS,
      sourceStr: druidicSource,
      proficiency: LANGUAGE_PROFICIENCY.DRUIDIC,
      proficiencyLevel: PROF_LEVEL.PROFICIENT
    } satisfies LanguageProficiencyEntry
  ];
}

export function getDruidAlwaysPreparedSpellIds(
  character: Pick<Character, "className" | "level">
): string[] {
  if (!hasDruidFeature(character, CLASS_FEATURE.DRUIDIC)) {
    return [];
  }

  return [speakWithAnimalsSpellId];
}

export function hasDruidSpellcastingFeature(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasDruidFeature(character, CLASS_FEATURE.SPELLCASTING);
}

export function getDruidCantripCountForLevel(level: number): number | null {
  const cantripCount = getDruidFeatureRow(level)?.cantrips;
  return typeof cantripCount === "number" ? Math.max(0, Math.floor(cantripCount)) : null;
}

export function getDruidSpellPreparationCountForLevel(level: number): number | null {
  const preparedSpells = getDruidFeatureRow(level)?.preparedSpells;
  return typeof preparedSpells === "number" ? Math.max(0, Math.floor(preparedSpells)) : null;
}

export function getDruidPrimalOrderWisdomModifier(character: Pick<Character, "abilities">): number {
  return getDruidWisdomModifier(character);
}
