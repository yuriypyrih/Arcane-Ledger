import { barbarianFeatureMap, barbarianFeatures } from "../../../../codex/classes";
import { barbarianStarterPack } from "../../../../codex/classes/starterPack";
import { CLASS_FEATURE, DAMAGE_TYPE, WEAPON_MASTERY } from "../../../../codex/entries";
import type { BarbarianFeatureClassObj } from "../../../../types";
import {
  CONDITION_NAME,
  EFFECT_NAME,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  WEAPON_PROFICIENCY,
  type Character,
  type CharacterRageFeatureState,
  SKILL,
  getSkillProficiencyForSkillName,
  isSkillName,
  type SkillName,
  type SkillProficiencyEntry,
  type WeaponProficiencyEntry
} from "../../../../types";
import {
  hasStatusCondition,
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../traits";
import { skillGroupsByAbility } from "../../skillDefinitions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../../combat";
import type {
  AbilityCheckIndicatorMap,
  ArmorClassFeatureContext,
  CoreStatIndicatorMap,
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionOptionCard,
  FeatureAbilityScoreBonus,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureDamageBonus,
  FeatureIndicator,
  FeatureSkillBonus,
  FeatureSkillProficiencyEntry,
  FeatureSpeedBonus,
  FeatureSpellcastingState,
  FeatureWeaponProficiencyEntry,
  SavingThrowIndicatorMap,
  SpeedFeatureContext,
  SkillIndicatorMap,
  WeaponFeatureContext
} from "../types";
import { getWeaponMasteryOptions, normalizeWeaponMasterySelections } from "../weaponMastery";
import * as berserkerSubclass from "./subclasses/barbarianPathOfTheBerserker";
import * as wildHeartSubclass from "./subclasses/barbarianPathOfTheWildHeart";
import * as worldTreeSubclass from "./subclasses/barbarianPathOfTheWorldTree";
import * as zealotSubclass from "./subclasses/barbarianPathOfTheZealot";

const rageConditionName = EFFECT_NAME.RAGE;
const rageStatusSourceId = "feature-rage";
const recklessAttackStatusSourceId = "feature-barbarian-reckless-attack";
const recklessAttackDurationRounds = 1;
const brutalStrikeDamageBonusLabel = "Brutal Strike";
const primalKnowledgeSource = "Primal Knowledge";
const instinctivePounceSource = "Instinctive Pounce";
const instinctivePounceStatusSourceId = "feature-barbarian-instinctive-pounce";
const brutalStrikeActionSummary = "Your weapons do more damage";
const relentlessRageActionSummary = "While in Rage you can keep fighting";
const relentlessRageDescription = barbarianFeatureMap[CLASS_FEATURE.RELENTLESS_RAGE]
  ?.description ?? [relentlessRageActionSummary];
const relentlessRageBaseDc = 10;
const relentlessRageDcIncrement = 5;
const persistentRageUsesTotal = 1;
export const barbarianRageActionKey = "barbarian-rage";
export const barbarianRecklessAttackActionKey = "barbarian-reckless-attack";
export const barbarianBrutalStrikeActionKey = "barbarian-brutal-strike";
export const barbarianRelentlessRageActionKey = "barbarian-relentless-rage";
export const barbarianIntimidatingPresenceActionKey =
  berserkerSubclass.barbarianIntimidatingPresenceActionKey;
export const barbarianZealousPresenceActionKey =
  zealotSubclass.barbarianZealousPresenceActionKey;
export const barbarianWarriorOfTheGodsActionKey =
  zealotSubclass.barbarianWarriorOfTheGodsActionKey;
export const barbarianTravelAlongTheTreeActionKey =
  worldTreeSubclass.barbarianTravelAlongTheTreeActionKey;
type BrutalStrikeEffectDefinition = {
  key: string;
  name: string;
  description: string;
};

const brutalStrikeBaseEffectDefinitions = [
  {
    key: "forceful-blow",
    name: "Forceful Blow",
    description:
      "The target is pushed 15 feet straight away from you. You can then move up to half your Speed straight toward the target without provoking Opportunity Attacks."
  },
  {
    key: "hamstring-blow",
    name: "Hamstring Blow",
    description:
      "The target's Speed is reduced by 15 feet until the start of your next turn. A target can be affected by only one Hamstring Blow at a time, the most recent one."
  }
] as const satisfies readonly BrutalStrikeEffectDefinition[];

const brutalStrikeImprovedEffectDefinitions = [
  {
    key: "staggering-blow",
    name: "Staggering Blow",
    description:
      "The target has Disadvantage on the next saving throw it makes, and it can't make Opportunity Attacks until the start of your next turn."
  },
  {
    key: "sundering-blow",
    name: "Sundering Blow",
    description:
      "Before the start of your next turn, the next attack roll made by another creature against the target gains a +5 bonus to the roll. An attack roll can gain only one Sundering Blow bonus."
  }
] as const satisfies readonly BrutalStrikeEffectDefinition[];
const rageAdvantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: "Rage"
};

const dangerSenseAdvantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: "Danger Sense"
};

const primalKnowledgeSkillNames = [
  SKILL.ACROBATICS,
  SKILL.INTIMIDATION,
  SKILL.PERCEPTION,
  SKILL.STEALTH,
  SKILL.SURVIVAL
] as const satisfies readonly SkillName[];
const primalKnowledgeSkillSet = new Set<SkillName>(primalKnowledgeSkillNames);
const barbarianPrimalKnowledgeSkillOptions = barbarianStarterPack.skillProficiencies;

const feralInstinctAdvantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage",
  source: "Feral Instinct"
};

const barbarianWeaponMasteryOptions = getWeaponMasteryOptions({ meleeOnly: true });

function getBarbarianFeatureRow(level: number): BarbarianFeatureClassObj | null {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = barbarianFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);
  const featureRow = matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;

  return featureRow;
}

function getUnlockedBarbarianFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return barbarianFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

function hasBarbarianFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
) {
  if (character.className !== "Barbarian") {
    return false;
  }

  return getUnlockedBarbarianFeatures(character.level).has(feature);
}

function hasActiveCondition(
  character: Pick<Character, "statusEntries">,
  conditionName: CONDITION_NAME
): boolean {
  return hasStatusCondition(character.statusEntries, conditionName);
}

function hasBarbarianInstinctivePounce(character: Pick<Character, "className" | "level">): boolean {
  return hasBarbarianFeature(character, CLASS_FEATURE.INSTINCTIVE_POUNCE);
}

function hasBarbarianBrutalStrike(character: Pick<Character, "className" | "level">): boolean {
  return hasBarbarianFeature(character, CLASS_FEATURE.BRUTAL_STRIKE);
}

function hasBarbarianExtraAttack(character: Pick<Character, "className" | "level">): boolean {
  return hasBarbarianFeature(character, CLASS_FEATURE.EXTRA_ATTACK);
}

function hasBarbarianRelentlessRage(character: Pick<Character, "className" | "level">): boolean {
  return hasBarbarianFeature(character, CLASS_FEATURE.RELENTLESS_RAGE);
}

function hasBarbarianImprovedBrutalStrike(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasBarbarianFeature(character, CLASS_FEATURE.IMPROVED_BRUTAL_STRIKE);
}

function hasBarbarianImprovedBrutalStrikeDamageUpgrade(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasBarbarianImprovedBrutalStrike(character) && character.level >= 17;
}

export function hasBarbarianRelentlessRageFeature(
  character: Pick<Character, "className" | "level">
): boolean {
  return hasBarbarianRelentlessRage(character);
}

function getBarbarianAdditionalAttackCount(
  character: Pick<Character, "className" | "level">
): number {
  return hasBarbarianExtraAttack(character) ? 1 : 0;
}

export function getBarbarianBrutalStrikeEffectDefinitions(
  character: Pick<Character, "className" | "level">
): BrutalStrikeEffectDefinition[] {
  if (!hasBarbarianBrutalStrike(character)) {
    return [];
  }

  return hasBarbarianImprovedBrutalStrike(character)
    ? [...brutalStrikeBaseEffectDefinitions, ...brutalStrikeImprovedEffectDefinitions]
    : [...brutalStrikeBaseEffectDefinitions];
}

export function getBarbarianBrutalStrikeSelectionLimit(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasBarbarianBrutalStrike(character)) {
    return 0;
  }

  return hasBarbarianImprovedBrutalStrikeDamageUpgrade(character) ? 2 : 1;
}

export function getBarbarianBrutalStrikeDamageFormula(
  character: Pick<Character, "className" | "level">
): string {
  return hasBarbarianImprovedBrutalStrikeDamageUpgrade(character) ? "2d10" : "1d10";
}

export function getBarbarianBrutalStrikeOptions(
  character: Pick<Character, "className" | "level">
): FeatureActionOptionCard[] {
  return getBarbarianBrutalStrikeEffectDefinitions(character).map((definition) => ({
    key: definition.key,
    name: definition.name,
    summary: definition.description,
    detail: definition.description,
    breakdown: definition.description,
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE
  }));
}

export function hasBarbarianBatteringRootsBonus(
  character: Pick<Character, "className" | "level" | "roundTracker"> &
    Partial<Pick<Character, "subclassId">>,
  context: worldTreeSubclass.BatteringRootsWeaponContext
): boolean {
  return worldTreeSubclass.hasBarbarianPathOfTheWorldTreeBatteringRootsBonus(character, context);
}

export function getBarbarianAdditionalWeaponMasteries(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  context: worldTreeSubclass.BatteringRootsWeaponContext
): Array<{
  mastery: WEAPON_MASTERY;
  source: string;
}> {
  return worldTreeSubclass.getBarbarianPathOfTheWorldTreeAdditionalWeaponMasteries(
    character,
    context
  );
}

export function getBarbarianRageOfTheWildsOptions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureActionOptionCard[] {
  return wildHeartSubclass.getBarbarianPathOfTheWildHeartRageOptions(character);
}

export function getBarbarianPowerOfTheWildsOptions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureActionOptionCard[] {
  return wildHeartSubclass.getBarbarianPathOfTheWildHeartPowerOptions(character);
}

function normalizeBarbarianPrimalKnowledgeSkill(value: unknown): SkillName | undefined {
  return typeof value === "string" &&
    isSkillName(value) &&
    barbarianPrimalKnowledgeSkillOptions.includes(value)
    ? value
    : undefined;
}

export function normalizeBarbarianRageState(
  value: unknown,
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): CharacterRageFeatureState {
  const featureRow = getBarbarianFeatureRow(character.level);
  const canRage =
    character.className === "Barbarian" &&
    getUnlockedBarbarianFeatures(character.level).has(CLASS_FEATURE.RAGE) &&
    typeof featureRow?.rages === "number" &&
    featureRow.rages > 0;

  if (!canRage || !value || typeof value !== "object") {
    return {
      usesExpended: 0,
      active: false
    };
  }

  const record = value as Partial<CharacterRageFeatureState>;
  const usesExpended = Number(record.usesExpended);
  const totalRages = featureRow?.rages ?? 0;
  const totalWeaponMasteries = hasBarbarianFeature(character, CLASS_FEATURE.WEAPON_MASTERY)
    ? (featureRow?.weaponMastery ?? 0)
    : 0;
  const additionalAttackCount = getBarbarianAdditionalAttackCount(character);
  const extraAttacksRemainingThisTurn = Number(record.extraAttacksRemainingThisTurn);
  const recklessAttackRoundsRemaining = Number(record.recklessAttackRoundsRemaining);
  const relentlessRageDcBonus = Number(record.relentlessRageDcBonus);
  const persistentRageUsesExpended = Number(record.persistentRageUsesExpended);

  return {
    usesExpended: Number.isFinite(usesExpended)
      ? Math.max(0, Math.min(totalRages, Math.floor(usesExpended)))
      : 0,
    active: Boolean(record.active),
    ...wildHeartSubclass.normalizeBarbarianPathOfTheWildHeartRageState(record, character),
    weaponMasteries: normalizeWeaponMasterySelections(
      record.weaponMasteries,
      barbarianWeaponMasteryOptions,
      totalWeaponMasteries
    ),
    primalKnowledgeSkill: hasBarbarianFeature(character, CLASS_FEATURE.PRIMAL_KNOWLEDGE)
      ? normalizeBarbarianPrimalKnowledgeSkill(record.primalKnowledgeSkill)
      : undefined,
    extraAttacksRemainingThisTurn:
      additionalAttackCount > 0
        ? Number.isFinite(extraAttacksRemainingThisTurn)
          ? Math.max(0, Math.min(additionalAttackCount, Math.floor(extraAttacksRemainingThisTurn)))
          : 0
        : 0,
    ...zealotSubclass.normalizeBarbarianPathOfTheZealotRageState(record, character),
    brutalStrikePending: hasBarbarianBrutalStrike(character)
      ? record.brutalStrikePending === true
      : false,
    brutalStrikeUsedThisTurn: hasBarbarianBrutalStrike(character)
      ? record.brutalStrikeUsedThisTurn === true
      : false,
    recklessAttackRoundsRemaining: hasBarbarianFeature(character, CLASS_FEATURE.RECKLESS_ATTACK)
      ? Number.isFinite(recklessAttackRoundsRemaining)
        ? Math.max(
            0,
            Math.min(recklessAttackDurationRounds, Math.floor(recklessAttackRoundsRemaining))
          )
        : 0
      : 0,
    recklessAttackUsedThisTurn: hasBarbarianFeature(character, CLASS_FEATURE.RECKLESS_ATTACK)
      ? record.recklessAttackUsedThisTurn === true
      : false,
    ...berserkerSubclass.normalizeBarbarianPathOfTheBerserkerRageState(record, character),
    relentlessRageDcBonus: hasBarbarianRelentlessRage(character)
      ? Number.isFinite(relentlessRageDcBonus)
        ? Math.max(0, Math.floor(relentlessRageDcBonus))
        : 0
      : 0,
    persistentRageUsesExpended: hasBarbarianFeature(character, CLASS_FEATURE.PERSISTENT_RAGE)
      ? Number.isFinite(persistentRageUsesExpended)
        ? Math.max(0, Math.min(persistentRageUsesTotal, Math.floor(persistentRageUsesExpended)))
        : 0
      : 0
  };
}

export function getBarbarianRageState(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): CharacterRageFeatureState {
  return normalizeBarbarianRageState(character.classFeatureState?.rage, character);
}

export function getBarbarianRageUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RAGE)) {
    return 0;
  }

  return getBarbarianFeatureRow(character.level)?.rages ?? 0;
}

export function getBarbarianRageUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getBarbarianRageUsesTotal(character);
  const rageState = getBarbarianRageState(character);
  return Math.max(0, totalUses - rageState.usesExpended);
}

export function getBarbarianPersistentRageUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  return hasBarbarianFeature(character, CLASS_FEATURE.PERSISTENT_RAGE)
    ? persistentRageUsesTotal
    : 0;
}

export function getBarbarianPersistentRageUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getBarbarianPersistentRageUsesTotal(character);
  const rageState = getBarbarianRageState(character);

  return Math.max(0, totalUses - (rageState.persistentRageUsesExpended ?? 0));
}

export function getBarbarianRageOfTheGodsUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return zealotSubclass.getBarbarianPathOfTheZealotRageOfTheGodsUsesTotal(character);
}

export function getBarbarianRageOfTheGodsUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return zealotSubclass.getBarbarianPathOfTheZealotRageOfTheGodsUsesRemaining(
    character,
    getBarbarianRageState(character)
  );
}

export function getBarbarianWarriorOfTheGodsUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return zealotSubclass.getBarbarianPathOfTheZealotWarriorOfTheGodsUsesTotal(character);
}

export function getBarbarianWarriorOfTheGodsUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return zealotSubclass.getBarbarianPathOfTheZealotWarriorOfTheGodsUsesRemaining(
    character,
    getBarbarianRageState(character)
  );
}

export function getBarbarianWarriorOfTheGodsHealingFormula(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string {
  return zealotSubclass.getBarbarianPathOfTheZealotWarriorOfTheGodsHealingFormula(character);
}

export function getBarbarianIntimidatingPresenceUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return berserkerSubclass.getBarbarianPathOfTheBerserkerIntimidatingPresenceUsesTotal(character);
}

export function getBarbarianIntimidatingPresenceUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return berserkerSubclass.getBarbarianPathOfTheBerserkerIntimidatingPresenceUsesRemaining(
    character,
    getBarbarianRageState(character)
  );
}

export function getBarbarianZealousPresenceUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return zealotSubclass.getBarbarianPathOfTheZealotZealousPresenceUsesTotal(character);
}

export function getBarbarianZealousPresenceUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  return zealotSubclass.getBarbarianPathOfTheZealotZealousPresenceUsesRemaining(
    character,
    getBarbarianRageState(character)
  );
}

export function getBarbarianWeaponMasterySelectionCount(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.WEAPON_MASTERY)) {
    return 0;
  }

  return getBarbarianFeatureRow(character.level)?.weaponMastery ?? 0;
}

export function getBarbarianWeaponMasteryOptions(): WEAPON_PROFICIENCY[] {
  return barbarianWeaponMasteryOptions;
}

export function getBarbarianWeaponMasterySelections(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): WEAPON_PROFICIENCY[] {
  return getBarbarianRageState(character).weaponMasteries ?? [];
}

export function setBarbarianWeaponMasterySelections(
  character: Character,
  selections: WEAPON_PROFICIENCY[]
): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.WEAPON_MASTERY)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  return {
    ...character,
    statusEntries: normalizeCharacterStatusEntries(character.statusEntries),
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        weaponMasteries: normalizeWeaponMasterySelections(
          selections,
          barbarianWeaponMasteryOptions,
          getBarbarianWeaponMasterySelectionCount(character)
        )
      }
    }
  };
}

export function getBarbarianWeaponProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureWeaponProficiencyEntry[] {
  return getBarbarianWeaponMasterySelections(character).map(
    (proficiency) =>
      ({
        source: PROFICIENCY_SOURCE.CLASS,
        sourceStr: "Weapon Mastery",
        proficiency,
        proficiencyLevel: PROF_LEVEL.PROFICIENT,
        overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
      }) satisfies WeaponProficiencyEntry
  );
}

export function getBarbarianPrimalKnowledgeSkillOptions(): SkillName[] {
  return [...barbarianPrimalKnowledgeSkillOptions];
}

export function getBarbarianPrimalKnowledgeSkillSelection(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SkillName | null {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.PRIMAL_KNOWLEDGE)) {
    return null;
  }

  return getBarbarianRageState(character).primalKnowledgeSkill ?? null;
}

export function setBarbarianPrimalKnowledgeSkillSelection(
  character: Character,
  selection: SkillName | null
): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.PRIMAL_KNOWLEDGE)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);
  const normalizedSelection =
    selection && barbarianPrimalKnowledgeSkillOptions.includes(selection) ? selection : undefined;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        primalKnowledgeSkill: normalizedSelection
      }
    }
  };
}

export function getBarbarianWildHeartAspectChoice(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): wildHeartSubclass.WildHeartAspect | null {
  return wildHeartSubclass.getBarbarianPathOfTheWildHeartAspectChoice(
    character,
    getBarbarianRageState(character)
  );
}

export function getBarbarianWildHeartPowerOptionChoice(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): wildHeartSubclass.WildHeartPowerOption | null {
  return wildHeartSubclass.getBarbarianPathOfTheWildHeartPowerOptionChoice(
    character,
    getBarbarianRageState(character)
  );
}

export function setBarbarianWildHeartAspectChoice(
  character: Character,
  selection: wildHeartSubclass.WildHeartAspect
): Character {
  return wildHeartSubclass.setBarbarianPathOfTheWildHeartAspectChoice(
    character,
    getBarbarianRageState(character),
    selection
  );
}

function createBarbarianPrimalKnowledgeEntry(skill: SkillName): SkillProficiencyEntry | null {
  const proficiency = getSkillProficiencyForSkillName(skill);

  if (!proficiency) {
    return null;
  }

  return {
    source: PROFICIENCY_SOURCE.CLASS,
    sourceStr: primalKnowledgeSource,
    proficiency,
    proficiencyLevel: PROF_LEVEL.PROFICIENT,
    overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
  };
}

export function getBarbarianSkillProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSkillProficiencyEntry[] {
  const selectedSkill = getBarbarianPrimalKnowledgeSkillSelection(character);

  if (!selectedSkill) {
    return [];
  }

  const entry = createBarbarianPrimalKnowledgeEntry(selectedSkill);

  return entry ? [entry] : [];
}

export function getBarbarianRageDamageBonus(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RAGE)) {
    return 0;
  }

  return getBarbarianFeatureRow(character.level)?.rageDamage ?? 0;
}

export function getBarbarianRecklessAttackRoundsRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RECKLESS_ATTACK)) {
    return 0;
  }

  return getBarbarianRageState(character).recklessAttackRoundsRemaining ?? 0;
}

export function isBarbarianRaging(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): boolean {
  return (
    hasBarbarianFeature(character, CLASS_FEATURE.RAGE) && getBarbarianRageState(character).active
  );
}

export function getBarbarianFeatureAction(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureActionCard | null {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RAGE)) {
    return null;
  }

  const rageState = getBarbarianRageState(character);
  const totalUses = getBarbarianRageUsesTotal(character);
  const usesRemaining = Math.max(0, totalUses - rageState.usesExpended);
  const rageDescription =
    "You can imbue yourself with a primal power called Rage, a force that grants you extraordinary might and resilience.";
  const rageDrawerResources = [
    {
      kind: "tracker" as const,
      label: "Uses",
      current: usesRemaining,
      total: totalUses,
      icon: "flame" as const,
      cost: 1
    }
  ];
  const rageActionOverride = wildHeartSubclass.getBarbarianPathOfTheWildHeartRageActionOverride(
    character,
    rageState,
    rageDrawerResources
  );

  return {
    key: barbarianRageActionKey,
    name: "Rage",
    summary: rageState.active ? "Rage Active" : "Enter Rage",
    detail: "Enter Rage",
    breakdown: rageState.active ? "Rage Active" : "Enter Rage",
    breakdownTone: rageState.active ? "danger" : "default",
    description: [rageDescription],
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    interaction: rageActionOverride.interaction,
    usesLabel: "Use 1",
    usesIcon: "flame",
    drawer: rageActionOverride.drawer,
    execute: rageActionOverride.execute,
    isActive: rageState.active,
    disabled: rageState.active || usesRemaining <= 0,
    disabledReason: rageState.active
      ? "Rage is already active."
      : usesRemaining <= 0
        ? "No Rage uses remaining."
        : undefined
  };
}

function getBarbarianRecklessAttackAction(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard | null {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RECKLESS_ATTACK)) {
    return null;
  }

  const rageState = getBarbarianRageState(character);
  const roundsRemaining = rageState.recklessAttackRoundsRemaining ?? 0;
  const summary =
    roundsRemaining > 0
      ? `Active for ${roundsRemaining} round${roundsRemaining === 1 ? "" : "s"}.`
      : "Attack with ferocity at the cost of defense.";

  return {
    key: barbarianRecklessAttackActionKey,
    name: "Reckless Attack",
    summary,
    detail: "Gain reckless advantage at a cost.",
    valueLabel: "Once at start of turn",
    breakdown: "Gain reckless advantage at a cost.",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    isActive: roundsRemaining > 0,
    disabled: rageState.recklessAttackUsedThisTurn === true,
    disabledReason:
      rageState.recklessAttackUsedThisTurn === true
        ? "Reckless Attack has already been used this turn."
        : undefined
  };
}

function getBarbarianBrutalStrikeAction(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard | null {
  if (!hasBarbarianBrutalStrike(character)) {
    return null;
  }

  const rageState = getBarbarianRageState(character);
  const selectionLimit = getBarbarianBrutalStrikeSelectionLimit(character);
  const isAvailable =
    rageState.recklessAttackUsedThisTurn === true &&
    rageState.brutalStrikePending !== true &&
    rageState.brutalStrikeUsedThisTurn !== true;

  return {
    key: barbarianBrutalStrikeActionKey,
    name: "Brutal Strike",
    summary: brutalStrikeActionSummary,
    detail: brutalStrikeActionSummary,
    valueLabel: "Once per Reckless Attack",
    breakdown:
      selectionLimit > 1
        ? `${getBarbarianBrutalStrikeDamageFormula(character)} + up to ${selectionLimit} effects`
        : `${getBarbarianBrutalStrikeDamageFormula(character)} + optional effect`,
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    interaction: "select",
    drawer: {
      kind: "custom-form",
      eyebrow: "Barbarian",
      formKind: "brutal-strike",
      facts: []
    },
    execute: {
      kind: "custom-form",
      formKind: "brutal-strike",
      label: "Apply Brutal Strike"
    },
    isActive: rageState.brutalStrikePending === true,
    disabled: !isAvailable,
    disabledReason: !isAvailable
      ? rageState.brutalStrikePending === true
        ? "Brutal Strike is armed for your next Strength-based attack."
        : rageState.brutalStrikeUsedThisTurn === true
          ? "Brutal Strike is already used for this Reckless Attack."
          : "Use Reckless Attack first."
      : undefined
  };
}

function getBarbarianRelentlessRageAction(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard | null {
  if (!hasBarbarianRelentlessRage(character)) {
    return null;
  }

  const rageState = getBarbarianRageState(character);
  const currentDc = relentlessRageBaseDc + (rageState.relentlessRageDcBonus ?? 0);
  const isRaging = rageState.active === true;

  return {
    key: barbarianRelentlessRageActionKey,
    name: "Relentless Rage",
    summary: relentlessRageActionSummary,
    detail: relentlessRageActionSummary,
    description: [...relentlessRageDescription],
    valueLabel: `Current DC ${currentDc}`,
    breakdown: relentlessRageActionSummary,
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    disabled: !isRaging,
    disabledReason: !isRaging ? "Relentless Rage requires Rage to be active." : undefined
  };
}

export function getBarbarianFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureActionCard[] {
  const rageState = getBarbarianRageState(character);
  const rageUsesRemaining = getBarbarianRageUsesRemaining(character);

  return [
    getBarbarianFeatureAction(character),
    getBarbarianRecklessAttackAction(character),
    zealotSubclass.getBarbarianPathOfTheZealotWarriorOfTheGodsAction(character, rageState),
    getBarbarianBrutalStrikeAction(character),
    getBarbarianRelentlessRageAction(character),
    berserkerSubclass.getBarbarianPathOfTheBerserkerFeatureAction(
      character,
      rageState,
      rageUsesRemaining
    ),
    zealotSubclass.getBarbarianPathOfTheZealotZealousPresenceAction(
      character,
      rageState,
      rageUsesRemaining
    ),
    worldTreeSubclass.getBarbarianPathOfTheWorldTreeFeatureAction(
      character,
      rageState,
      rageUsesRemaining
    )
  ].filter((entry): entry is FeatureActionCard => entry !== null);
}

export function getBarbarianWeaponDamageBonuses(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "roundTracker">>,
  context: WeaponFeatureContext
): FeatureDamageBonus[] {
  const damageBonuses: FeatureDamageBonus[] = [];
  const rageState = getBarbarianRageState(character);
  const isRaging = isBarbarianRaging(character);

  if (isRaging && context.ability === "STR") {
    const rageDamage = getBarbarianRageDamageBonus(character);

    if (rageDamage > 0) {
      damageBonuses.push({
        label: "Rage",
        value: rageDamage
      });
    }
  }
  damageBonuses.push(
    ...zealotSubclass.getBarbarianPathOfTheZealotWeaponDamageBonuses(
      character,
      rageState,
      context,
      isRaging
    ),
    ...berserkerSubclass.getBarbarianPathOfTheBerserkerWeaponDamageBonuses(
      character,
      rageState,
      context,
      getBarbarianRageDamageBonus(character),
      isRaging
    )
  );

  if (
    hasBarbarianBrutalStrike(character) &&
    rageState.brutalStrikePending === true &&
    context.ability === "STR" &&
    (context.attackKind === "weapon" || context.attackKind === "unarmed")
  ) {
    damageBonuses.push({
      label: brutalStrikeDamageBonusLabel,
      formula: getBarbarianBrutalStrikeDamageFormula(character),
      displayLabel: getBarbarianBrutalStrikeDamageFormula(character)
    });
  }

  return damageBonuses;
}

export function getBarbarianSavingThrowIndicators(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "statusEntries">
): SavingThrowIndicatorMap {
  const savingThrowIndicators: SavingThrowIndicatorMap = {};

  if (
    hasBarbarianFeature(character, CLASS_FEATURE.DANGER_SENSE) &&
    !hasActiveCondition(character, CONDITION_NAME.INCAPACITATED)
  ) {
    savingThrowIndicators.DEX = [dangerSenseAdvantageIndicator];
  }

  if (isBarbarianRaging(character)) {
    savingThrowIndicators.STR = [rageAdvantageIndicator];
  }

  return savingThrowIndicators;
}

export function getBarbarianCoreStatIndicators(
  character: Pick<Character, "className" | "level">
): CoreStatIndicatorMap {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.FERAL_INSTINCT)) {
    return {};
  }

  return {
    initiative: [feralInstinctAdvantageIndicator]
  };
}

export function getBarbarianAbilityCheckIndicators(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): AbilityCheckIndicatorMap {
  if (!isBarbarianRaging(character)) {
    return {};
  }

  return {
    STR: [rageAdvantageIndicator]
  };
}

export function getBarbarianSkillIndicators(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SkillIndicatorMap {
  if (!isBarbarianRaging(character)) {
    return {};
  }

  const strengthSkills =
    skillGroupsByAbility.find((group) => group.ability === "STR")?.skills ?? [];
  const primalKnowledgeSkills = hasBarbarianFeature(character, CLASS_FEATURE.PRIMAL_KNOWLEDGE)
    ? [...primalKnowledgeSkillNames]
    : [];
  const trackedSkills = Array.from(new Set([...strengthSkills, ...primalKnowledgeSkills]));

  return Object.fromEntries(
    trackedSkills.map((skill) => [skill, [rageAdvantageIndicator]])
  ) as SkillIndicatorMap;
}

export function getBarbarianSkillBonuses(
  character: Pick<Character, "className" | "level" | "classFeatureState" | "abilities">,
  skill: SkillName
): FeatureSkillBonus[] {
  if (
    !isBarbarianRaging(character) ||
    !hasBarbarianFeature(character, CLASS_FEATURE.PRIMAL_KNOWLEDGE) ||
    !primalKnowledgeSkillSet.has(skill)
  ) {
    return [];
  }

  const baseAbility =
    skillGroupsByAbility.find((group) => group.skills.includes(skill))?.ability ?? null;

  if (!baseAbility || baseAbility === "STR") {
    return [];
  }

  return [
    {
      label: "STR (Primal Knowledge)",
      abilityModifierSource: "STR",
      replacesBaseAbility: true
    }
  ];
}

export function getBarbarianSpellcastingState(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSpellcastingState {
  if (isBarbarianRaging(character)) {
    return {
      blocked: true,
      reason: "You can't cast spells while Rage is active."
    };
  }

  return {
    blocked: false,
    reason: null
  };
}

export function getBarbarianArmorClassModes(
  character: Pick<Character, "className" | "level">,
  context: ArmorClassFeatureContext
): FeatureArmorClassMode[] {
  if (
    !hasBarbarianFeature(character, CLASS_FEATURE.UNARMORED_DEFENSE) ||
    context.hasWornBodyArmor
  ) {
    return [];
  }

  return [
    {
      key: "barbarian-unarmored-defense",
      label: "Unarmored Defense",
      baseValue: 10,
      abilityModifiers: ["DEX", "CON"],
      shieldAllowed: true,
      detail: "Barbarian feature"
    }
  ];
}

export function getBarbarianArmorClassBonuses(
  _character: Pick<Character, "className" | "level" | "classFeatureState">,
  _context: ArmorClassFeatureContext
): FeatureArmorClassBonus[] {
  return [];
}

export function getBarbarianSpeedBonuses(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "statusEntries">>,
  context: SpeedFeatureContext
): FeatureSpeedBonus[] {
  const speedBonuses: FeatureSpeedBonus[] = [];
  const rageState = getBarbarianRageState(character);
  const isRaging = isBarbarianRaging(character);

  if (
    hasBarbarianFeature(character, CLASS_FEATURE.FAST_MOVEMENT) &&
    context.wornBodyArmorType !== "heavy"
  ) {
    speedBonuses.push({
      label: "Fast Movement",
      value: 10
    });
  }

  speedBonuses.push(
    ...wildHeartSubclass.getBarbarianPathOfTheWildHeartSpeedBonuses(
      character,
      rageState,
      context,
      isRaging
    ),
    ...zealotSubclass.getBarbarianPathOfTheZealotSpeedBonuses(character)
  );

  return speedBonuses;
}

export function getBarbarianAbilityScoreBonuses(
  character: Pick<Character, "className" | "level">
): FeatureAbilityScoreBonus[] {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.PRIMAL_CHAMPION)) {
    return [];
  }

  return [
    {
      ability: "STR",
      label: "Primal Champion",
      value: 4,
      maxScore: 25,
      order: 20
    },
    {
      ability: "CON",
      label: "Primal Champion",
      value: 4,
      maxScore: 25,
      order: 20
    }
  ];
}

export function getBarbarianDerivedConditions(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "statusEntries">>
): DerivedFeatureStatusEntry[] {
  const derivedEntries: DerivedFeatureStatusEntry[] = [];
  const rageState = getBarbarianRageState(character);
  const isRaging = isBarbarianRaging(character);

  if (isRaging) {
    derivedEntries.push(
      {
        id: "feature-rage-effect",
        sourceId: rageStatusSourceId,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: rageConditionName,
        source: "Barbarian",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.MINUTES,
          amount: 10
        }
      },
      {
        id: "feature-rage-resistance-bludgeoning",
        sourceId: rageStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.BLUDGEONING,
        source: "Rage",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.RAGE
        }
      },
      {
        id: "feature-rage-resistance-piercing",
        sourceId: rageStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.PIERCING,
        source: "Rage",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.RAGE
        }
      },
      {
        id: "feature-rage-resistance-slashing",
        sourceId: rageStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.SLASHING,
        source: "Rage",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.RAGE
        }
      }
    );
  }

  derivedEntries.push(
    ...wildHeartSubclass.getBarbarianPathOfTheWildHeartDerivedConditions(
      character,
      rageState,
      isRaging
    ),
    ...berserkerSubclass.getBarbarianPathOfTheBerserkerDerivedConditions(character, isRaging)
  );

  const recklessAttackRoundsRemaining = getBarbarianRecklessAttackRoundsRemaining(character);

  if (recklessAttackRoundsRemaining > 0) {
    derivedEntries.push({
      id: recklessAttackStatusSourceId,
      sourceId: recklessAttackStatusSourceId,
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: "Reckless Attack",
      source: "Barbarian",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: recklessAttackRoundsRemaining,
        tickOn: STATUS_DURATION_ROUND_TICK.ROUND_START
      }
    });
  }
  derivedEntries.push(...zealotSubclass.getBarbarianPathOfTheZealotDerivedConditions(character));

  return derivedEntries;
}

export function activateBarbarianRage(
  character: Character,
  options?: {
    useRageOfTheGods?: boolean;
  }
): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RAGE)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if (rageState.active) {
    return character;
  }

  const totalUses = getBarbarianRageUsesTotal(character);

  if (rageState.usesExpended >= totalUses) {
    return character;
  }

  const nextStatusEntries = berserkerSubclass.getBarbarianPathOfTheBerserkerRageStatusEntries(
    character,
    character.statusEntries
  );
  const nextNormalizedStatusEntries = normalizeCharacterStatusEntries(nextStatusEntries).filter(
    (entry) =>
      entry.sourceId !== instinctivePounceStatusSourceId
  );
  const nextRageStatusEntries = hasBarbarianInstinctivePounce(character)
    ? [
        ...nextNormalizedStatusEntries,
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: instinctivePounceSource,
          source: instinctivePounceSource,
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: {
            kind: STATUS_DURATION_KIND.ROUNDS,
            amount: 1,
            tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
          },
          sourceId: instinctivePounceStatusSourceId
        })
      ]
    : nextNormalizedStatusEntries;
  const zealotRageActivation = zealotSubclass.getBarbarianPathOfTheZealotRageStatusEntries(
    character,
    nextRageStatusEntries,
    rageState,
    options?.useRageOfTheGods === true
  );
  const nextTemporaryHitPointsAssignment =
    worldTreeSubclass.getBarbarianPathOfTheWorldTreeRageTemporaryHitPointsAssignment(character);

  return {
    ...character,
    statusEntries: zealotRageActivation.statusEntries,
    ...nextTemporaryHitPointsAssignment,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        usesExpended: rageState.usesExpended + 1,
        active: true,
        divineFuryUsedThisTurn: false,
        ...zealotRageActivation.rageStatePatch,
        ...wildHeartSubclass.getBarbarianPathOfTheWildHeartActivationPatch(character, rageState)
      }
    }
  };
}

export function activateBarbarianWildHeartRage(
  character: Character,
  rageOptionKey: string,
  powerOptionKey?: string,
  options?: {
    useRageOfTheGods?: boolean;
  }
): Character {
  const selection = wildHeartSubclass.getBarbarianPathOfTheWildHeartActivationSelection(
    character,
    rageOptionKey,
    powerOptionKey
  );

  if (!selection) {
    return character;
  }

  const ragingCharacter = activateBarbarianRage(character, options);

  if (ragingCharacter === character) {
    return character;
  }

  return {
    ...ragingCharacter,
    classFeatureState: {
      ...ragingCharacter.classFeatureState,
      rage: {
        ...getBarbarianRageState(ragingCharacter),
        wildHeartRageOption: selection.rageOption,
        wildHeartPowerOption: selection.powerOption
      }
    }
  };
}

export function activateBarbarianRageOfTheWildsOption(
  character: Character,
  optionKey: string
): Character {
  return activateBarbarianWildHeartRage(character, optionKey);
}

export function activateBarbarianRecklessAttack(character: Character): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RECKLESS_ATTACK)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if (rageState.recklessAttackUsedThisTurn === true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        recklessAttackRoundsRemaining: recklessAttackDurationRounds,
        recklessAttackUsedThisTurn: true,
        brutalStrikePending: false,
        brutalStrikeUsedThisTurn: false,
        ...berserkerSubclass.getBarbarianPathOfTheBerserkerRecklessAttackPatch(
          character,
          rageState
        )
      }
    }
  };
}

export function activateBarbarianBrutalStrike(character: Character): Character {
  if (!hasBarbarianBrutalStrike(character)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if (
    rageState.recklessAttackUsedThisTurn !== true ||
    rageState.brutalStrikePending === true ||
    rageState.brutalStrikeUsedThisTurn === true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        brutalStrikePending: true,
        brutalStrikeUsedThisTurn: true
      }
    }
  };
}

export function activateBarbarianRelentlessRage(character: Character): Character {
  if (!hasBarbarianRelentlessRage(character)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if (rageState.active !== true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        relentlessRageDcBonus: (rageState.relentlessRageDcBonus ?? 0) + relentlessRageDcIncrement
      }
    }
  };
}

export function consumeBarbarianWarriorOfTheGodsCharges(
  character: Character,
  chargeCount: number
): Character {
  return zealotSubclass.consumeBarbarianPathOfTheZealotWarriorOfTheGodsCharges(
    character,
    getBarbarianRageState(character),
    chargeCount
  );
}

export function applyPersistentRageOnInitiative(character: Character): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.PERSISTENT_RAGE)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);
  const usesRemaining = getBarbarianPersistentRageUsesRemaining(character);

  if (usesRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        usesExpended: 0,
        persistentRageUsesExpended: (rageState.persistentRageUsesExpended ?? 0) + 1
      }
    }
  };
}

export function activateBarbarianIntimidatingPresence(character: Character): Character {
  return berserkerSubclass.activateBarbarianPathOfTheBerserkerIntimidatingPresence(
    character,
    getBarbarianRageState(character),
    getBarbarianRageUsesRemaining(character)
  );
}

export function activateBarbarianZealousPresence(character: Character): Character {
  return zealotSubclass.activateBarbarianPathOfTheZealotZealousPresence(
    character,
    getBarbarianRageState(character),
    getBarbarianRageUsesRemaining(character)
  );
}

export function activateBarbarianTravelAlongTheTree(character: Character): Character {
  return worldTreeSubclass.activateBarbarianPathOfTheWorldTreeTravelAlongTheTree(
    character,
    getBarbarianRageState(character),
    getBarbarianRageUsesRemaining(character)
  );
}

export function expendBarbarianRageUse(character: Character): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RAGE)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);
  const rageUsesRemaining = getBarbarianRageUsesRemaining(character);

  if (rageUsesRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        usesExpended: rageState.usesExpended + 1
      }
    }
  };
}

export function restoreBarbarianRageUse(character: Character): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RAGE)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if (rageState.usesExpended <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        usesExpended: rageState.usesExpended - 1
      }
    }
  };
}

export function restoreAllBarbarianRageUses(character: Character): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RAGE)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if (rageState.usesExpended === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        usesExpended: 0
      }
    }
  };
}

export function deactivateBarbarianRage(character: Character): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RAGE)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if (!rageState.active) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        active: false,
        divineFuryUsedThisTurn: false,
        frenzyPending: false,
        wildHeartRageOption: undefined,
        wildHeartPowerOption: undefined
      }
    }
  };
}

export function deactivateBarbarianRecklessAttack(character: Character): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RECKLESS_ATTACK)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if (
    (rageState.recklessAttackRoundsRemaining ?? 0) === 0 &&
    rageState.recklessAttackUsedThisTurn !== true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        recklessAttackRoundsRemaining: 0,
        recklessAttackUsedThisTurn: false,
        brutalStrikePending: false,
        brutalStrikeUsedThisTurn: false,
        frenzyPending: false
      }
    }
  };
}

export function consumeBarbarianBrutalStrikeBonus(character: Character): Character {
  const rageState = getBarbarianRageState(character);

  if (rageState.brutalStrikePending !== true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        brutalStrikePending: false
      }
    }
  };
}

export function consumeBarbarianDivineFuryBonus(character: Character): Character {
  return zealotSubclass.consumeBarbarianPathOfTheZealotDivineFuryBonus(
    character,
    getBarbarianRageState(character)
  );
}

export function consumeBarbarianFrenzyBonus(character: Character): Character {
  return berserkerSubclass.consumeBarbarianPathOfTheBerserkerFrenzyBonus(
    character,
    getBarbarianRageState(character)
  );
}

export function getBarbarianWeaponAttackMultiCount(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return getBarbarianRageState(character).extraAttacksRemainingThisTurn ?? 0;
}

export function consumeBarbarianWeaponAttack(character: Character): Character {
  if (character.className !== "Barbarian") {
    return isRoundTrackerResourceAvailable(character.roundTracker, "action")
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, "action")
        }
      : character;
  }

  const rageState = getBarbarianRageState(character);
  const extraAttacksRemaining = rageState.extraAttacksRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        rage: {
          ...rageState,
          extraAttacksRemainingThisTurn: getBarbarianAdditionalAttackCount(character)
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
      rage: {
        ...rageState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
      }
    }
  };
}

export function restoreBarbarianRageOnShortRest(character: Character): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RAGE)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  return {
    ...deactivateBarbarianRage(character),
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        usesExpended: Math.max(0, rageState.usesExpended - 1),
        active: false,
        extraAttacksRemainingThisTurn: 0,
        divineFuryUsedThisTurn: false,
        brutalStrikePending: false,
        brutalStrikeUsedThisTurn: false,
        recklessAttackRoundsRemaining: 0,
        recklessAttackUsedThisTurn: false,
        frenzyPending: false
      }
    }
  };
}

export function restoreBarbarianRageOnLongRest(character: Character): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RAGE)) {
    return character;
  }

  return {
    ...deactivateBarbarianRage(character),
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...getBarbarianRageState(character),
        usesExpended: 0,
        active: false,
        extraAttacksRemainingThisTurn: 0,
        divineFuryUsedThisTurn: false,
        brutalStrikePending: false,
        brutalStrikeUsedThisTurn: false,
        recklessAttackRoundsRemaining: 0,
        recklessAttackUsedThisTurn: false,
        frenzyPending: false
      }
    }
  };
}

export function restoreBarbarianRelentlessRageOnShortRest(character: Character): Character {
  if (!hasBarbarianRelentlessRage(character)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if ((rageState.relentlessRageDcBonus ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        relentlessRageDcBonus: 0
      }
    }
  };
}

export function restoreBarbarianRelentlessRageOnLongRest(character: Character): Character {
  return restoreBarbarianRelentlessRageOnShortRest(character);
}

export function restoreBarbarianWarriorOfTheGodsOnLongRest(character: Character): Character {
  return zealotSubclass.restoreBarbarianPathOfTheZealotWarriorOfTheGodsOnLongRest(
    character,
    getBarbarianRageState(character)
  );
}

export function restoreBarbarianIntimidatingPresenceOnLongRest(character: Character): Character {
  return berserkerSubclass.restoreBarbarianPathOfTheBerserkerIntimidatingPresenceOnLongRest(
    character,
    getBarbarianRageState(character)
  );
}

export function restoreBarbarianZealousPresenceOnLongRest(character: Character): Character {
  return zealotSubclass.restoreBarbarianPathOfTheZealotZealousPresenceOnLongRest(
    character,
    getBarbarianRageState(character)
  );
}

export function restoreBarbarianPersistentRageOnLongRest(character: Character): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.PERSISTENT_RAGE)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if ((rageState.persistentRageUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        persistentRageUsesExpended: 0
      }
    }
  };
}

export function restoreBarbarianRageOfTheGodsOnLongRest(character: Character): Character {
  return zealotSubclass.restoreBarbarianPathOfTheZealotRageOfTheGodsOnLongRest(
    character,
    getBarbarianRageState(character)
  );
}

export function applyShortRestToBarbarianFeatures(character: Character): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RAGE)) {
    return character;
  }

  return restoreBarbarianRelentlessRageOnShortRest(restoreBarbarianRageOnShortRest(character));
}

export function applyLongRestToBarbarianFeatures(character: Character): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RAGE)) {
    return character;
  }

  return restoreBarbarianPersistentRageOnLongRest(
    restoreBarbarianZealousPresenceOnLongRest(
      restoreBarbarianIntimidatingPresenceOnLongRest(
        restoreBarbarianWarriorOfTheGodsOnLongRest(
          restoreBarbarianRageOfTheGodsOnLongRest(
            restoreBarbarianRelentlessRageOnLongRest(restoreBarbarianRageOnLongRest(character))
          )
        )
      )
    )
  );
}

export function advanceBarbarianFeaturesForNewRound(character: Character): Character {
  if (
    !hasBarbarianFeature(character, CLASS_FEATURE.RAGE) &&
    !hasBarbarianFeature(character, CLASS_FEATURE.RECKLESS_ATTACK)
  ) {
    return character;
  }

  const rageState = getBarbarianRageState(character);
  const recklessAttackRoundsRemaining = rageState.recklessAttackRoundsRemaining ?? 0;

  if (
    (rageState.extraAttacksRemainingThisTurn ?? 0) === 0 &&
    recklessAttackRoundsRemaining === 0 &&
    rageState.divineFuryUsedThisTurn !== true &&
    rageState.recklessAttackUsedThisTurn !== true &&
    rageState.brutalStrikePending !== true &&
    rageState.brutalStrikeUsedThisTurn !== true &&
    rageState.frenzyPending !== true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        extraAttacksRemainingThisTurn: 0,
        recklessAttackRoundsRemaining: Math.max(0, recklessAttackRoundsRemaining - 1),
        divineFuryUsedThisTurn: false,
        recklessAttackUsedThisTurn: false,
        brutalStrikePending: false,
        brutalStrikeUsedThisTurn: false,
        frenzyPending: false
      }
    }
  };
}

export function isBarbarianFeatureCondition(conditionName: string): boolean {
  const normalizedCondition = conditionName.trim();
  return normalizedCondition === rageConditionName || normalizedCondition === "Reckless Attack";
}
