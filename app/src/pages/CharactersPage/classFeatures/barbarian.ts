import { barbarianFeatures } from "../../../codex/classes";
import { barbarianStarterPack } from "../../../codex/classes/starterPack";
import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY
} from "../../../codex/entries";
import type { BarbarianFeatureClassObj } from "../../../types";
import {
  SENSE,
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
  type BarbarianWildHeartAspect,
  type Character,
  type CharacterRageFeatureState,
  SKILL,
  getSkillProficiencyForSkillName,
  isSkillName,
  type SkillName,
  type SkillProficiencyEntry,
  type WeaponProficiencyEntry
} from "../../../types";
import {
  hasStatusCondition,
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries,
  removeCharacterConditionsForImmunities
} from "../traits";
import { skillGroupsByAbility } from "../skillDefinitions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../actionEconomy";
import {
  consumeRoundTrackerResource,
  isRoundTrackerResourceAvailable,
  normalizeRoundTracker
} from "../combat";
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
} from "./types";
import { getWeaponMasteryOptions, normalizeWeaponMasterySelections } from "./weaponMastery";
import { clampNumber, swapTemporaryHitPointsAssignment } from "../shared";

const rageConditionName = EFFECT_NAME.RAGE;
const rageStatusSourceId = "feature-rage";
const recklessAttackStatusSourceId = "feature-barbarian-reckless-attack";
const fanaticalFocusStatusSourceId = "feature-barbarian-fanatical-focus";
const rageOfTheGodsStatusSourceId = "feature-barbarian-rage-of-the-gods";
const recklessAttackDurationRounds = 1;
const pathOfTheBerserkerSubclassId = "barbarian-path-of-the-berserker";
const pathOfTheWildHeartSubclassId = "barbarian-path-of-the-wild-heart";
const pathOfTheWorldTreeSubclassId = "barbarian-path-of-the-world-tree";
const pathOfTheZealotSubclassId = "barbarian-path-of-the-zealot";
const mindlessRageCharmedImmunitySourceId = "feature-barbarian-mindless-rage-charmed-immunity";
const mindlessRageFrightenedImmunitySourceId =
  "feature-barbarian-mindless-rage-frightened-immunity";
const frenzyDamageBonusLabel = "Frenzy";
const divineFuryDamageBonusLabel = "Divine Fury";
const brutalStrikeDamageBonusLabel = "Brutal Strike";
const primalKnowledgeSource = "Primal Knowledge";
const instinctivePounceSource = "Instinctive Pounce";
const instinctivePounceStatusSourceId = "feature-barbarian-instinctive-pounce";
const rageOfTheWildsBearStatusSourceId = "feature-barbarian-rage-of-the-wilds-bear";
const rageOfTheWildsEffectSourceId = "feature-barbarian-rage-of-the-wilds-effect";
const powerOfTheWildsEffectSourceId = "feature-barbarian-power-of-the-wilds-effect";
const brutalStrikeActionSummary = "Your weapons do more damage";
const relentlessRageActionSummary = "While in Rage you can keep fighting";
const relentlessRageBaseDc = 10;
const relentlessRageDcIncrement = 5;
const persistentRageUsesTotal = 1;
const rageOfTheGodsUsesTotal = 1;
const warriorOfTheGodsBaseUses = 4;
export const barbarianRageActionKey = "barbarian-rage";
export const barbarianRecklessAttackActionKey = "barbarian-reckless-attack";
export const barbarianBrutalStrikeActionKey = "barbarian-brutal-strike";
export const barbarianRelentlessRageActionKey = "barbarian-relentless-rage";
export const barbarianIntimidatingPresenceActionKey = "barbarian-intimidating-presence";
export const barbarianZealousPresenceActionKey = "barbarian-zealous-presence";
export const barbarianWarriorOfTheGodsActionKey = "barbarian-warrior-of-the-gods";
export const barbarianTravelAlongTheTreeActionKey = "barbarian-travel-along-the-tree";
const intimidatingPresenceUsesTotal = 1;
const zealousPresenceUsesTotal = 1;
type WildHeartRageOption = "bear" | "eagle" | "wolf";
type WildHeartPowerOption = "falcon" | "lion" | "ram";
type WildHeartAspect = BarbarianWildHeartAspect;
type BrutalStrikeEffectDefinition = {
  key: string;
  name: string;
  description: string;
};

const wildHeartRageOptionDefinitions = [
  {
    key: "bear",
    name: "Bear",
    summary: "Tracked",
    trackingState: "tracked",
    description:
      "While your Rage is active, you have Resistance to every damage type except Force, Necrotic, Psychic, and Radiant."
  },
  {
    key: "eagle",
    name: "Eagle",
    summary: "Not Tracked",
    trackingState: "not-tracked",
    description:
      "When you activate your Rage, you can take the Disengage and Dash actions as part of that Bonus Action. While your Rage is active, you can take a Bonus Action to take both of those actions."
  },
  {
    key: "wolf",
    name: "Wolf",
    summary: "Not Tracked",
    trackingState: "not-tracked",
    description:
      "While your Rage is active, your allies have Advantage on attack rolls against any enemy of yours within 5 feet of you."
  }
] as const satisfies ReadonlyArray<{
  key: WildHeartRageOption;
  name: string;
  summary: string;
  trackingState: "tracked" | "not-tracked";
  description: string;
}>;
const wildHeartPowerOptionDefinitions = [
  {
    key: "falcon",
    name: "Falcon",
    summary: "Tracked",
    trackingState: "tracked",
    description:
      "While your Rage is active, you have a Fly Speed equal to your Speed if you aren't wearing any armor."
  },
  {
    key: "lion",
    name: "Lion",
    summary: "Not Tracked",
    trackingState: "not-tracked",
    description:
      "While your Rage is active, any of your enemies within 5 feet of you have Disadvantage on attack rolls against targets other than you or another Barbarian who has this option active."
  },
  {
    key: "ram",
    name: "Ram",
    summary: "Not Tracked",
    trackingState: "not-tracked",
    description:
      "While your Rage is active, you can cause a Large or smaller creature to have the Prone condition when you hit it with a melee attack."
  }
] as const satisfies ReadonlyArray<{
  key: WildHeartPowerOption;
  name: string;
  summary: string;
  trackingState: "tracked" | "not-tracked";
  description: string;
}>;
const wildHeartAspectDefinitions = [
  {
    key: "owl",
    name: "Owl",
    description:
      "You have <link:Darkvision>Darkvision</link> with a range of 60 feet. If you already have Darkvision, its range increases by 60 feet."
  },
  {
    key: "panther",
    name: "Panther",
    description: "You have a Climb Speed equal to your Speed."
  },
  {
    key: "salmon",
    name: "Salmon",
    description: "You have a Swim Speed equal to your Speed."
  }
] as const satisfies ReadonlyArray<{
  key: WildHeartAspect;
  name: string;
  description: string;
}>;

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

function isPathOfTheBerserker(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Barbarian" &&
    character.subclassId === pathOfTheBerserkerSubclassId &&
    character.level >= 3
  );
}

function isPathOfTheWildHeart(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Barbarian" &&
    character.subclassId === pathOfTheWildHeartSubclassId &&
    character.level >= 3
  );
}

function isPathOfTheWorldTree(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Barbarian" &&
    character.subclassId === pathOfTheWorldTreeSubclassId &&
    character.level >= 3
  );
}

function isPathOfTheZealot(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return (
    character.className === "Barbarian" &&
    character.subclassId === pathOfTheZealotSubclassId &&
    character.level >= 3
  );
}

function hasBerserkerIntimidatingPresence(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return isPathOfTheBerserker(character) && character.level >= 14;
}

function hasBerserkerMindlessRage(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return isPathOfTheBerserker(character) && character.level >= 6;
}

function hasBarbarianInstinctivePounce(character: Pick<Character, "className" | "level">): boolean {
  return hasBarbarianFeature(character, CLASS_FEATURE.INSTINCTIVE_POUNCE);
}

function hasWildHeartRageOfTheWilds(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return isPathOfTheWildHeart(character);
}

function hasWildHeartAspectOfTheWilds(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return isPathOfTheWildHeart(character) && character.level >= 6;
}

function hasWildHeartPowerOfTheWilds(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return isPathOfTheWildHeart(character) && character.level >= 14;
}

function hasWorldTreeVitalityOfTheTree(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return isPathOfTheWorldTree(character);
}

function hasWorldTreeBatteringRoots(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return isPathOfTheWorldTree(character) && character.level >= 10;
}

function hasWorldTreeTravelAlongTheTree(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return isPathOfTheWorldTree(character) && character.level >= 14;
}

function hasZealotDivineFury(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return isPathOfTheZealot(character);
}

function hasZealotWarriorOfTheGods(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return isPathOfTheZealot(character);
}

function hasZealotFanaticalFocus(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return isPathOfTheZealot(character) && character.level >= 6;
}

function hasZealotRageOfTheGods(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return isPathOfTheZealot(character) && character.level >= 14;
}

function hasBarbarianRageOfTheGodsTrait(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) => entry.sourceId === rageOfTheGodsStatusSourceId
  );
}

function hasZealotZealousPresence(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): boolean {
  return isPathOfTheZealot(character) && character.level >= 10;
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

type BatteringRootsWeaponContext = {
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
  properties?: WEAPON_PROPERTY[];
};

function isBatteringRootsEligibleWeapon(context: BatteringRootsWeaponContext): boolean {
  if (context.attackKind !== "weapon" || context.combatType !== WEAPON_COMBAT_TYPE.MELEE) {
    return false;
  }

  const properties = context.properties ?? [];

  return (
    properties.includes(WEAPON_PROPERTY.HEAVY) ||
    properties.includes(WEAPON_PROPERTY.VERSATILE)
  );
}

export function hasBarbarianBatteringRootsBonus(
  character: Pick<Character, "className" | "level" | "roundTracker"> &
    Partial<Pick<Character, "subclassId">>,
  context: BatteringRootsWeaponContext
): boolean {
  return (
    hasWorldTreeBatteringRoots(character) &&
    normalizeRoundTracker(character.roundTracker).turnStarted &&
    isBatteringRootsEligibleWeapon(context)
  );
}

export function getBarbarianAdditionalWeaponMasteries(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>,
  context: BatteringRootsWeaponContext
): Array<{
  mastery: WEAPON_MASTERY;
  source: string;
}> {
  if (!hasWorldTreeBatteringRoots(character) || !isBatteringRootsEligibleWeapon(context)) {
    return [];
  }

  return [
    {
      mastery: WEAPON_MASTERY.PUSH,
      source: "Battering Roots"
    }
  ];
}

function normalizeWildHeartRageOption(value: unknown): WildHeartRageOption | undefined {
  return value === "bear" || value === "eagle" || value === "wolf" ? value : undefined;
}

function normalizeWildHeartAspect(value: unknown): WildHeartAspect | undefined {
  return value === "owl" || value === "panther" || value === "salmon" ? value : undefined;
}

function normalizeWildHeartPowerOption(value: unknown): WildHeartPowerOption | undefined {
  return value === "falcon" || value === "lion" || value === "ram" ? value : undefined;
}

export function getBarbarianRageOfTheWildsOptions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureActionOptionCard[] {
  if (!hasWildHeartRageOfTheWilds(character)) {
    return [];
  }

  return wildHeartRageOptionDefinitions.map((definition) => ({
    key: definition.key,
    name: definition.name,
    summary: definition.summary,
    detail: definition.description,
    breakdown: definition.description,
    trackingState: definition.trackingState,
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE
  }));
}

export function getBarbarianPowerOfTheWildsOptions(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): FeatureActionOptionCard[] {
  if (!hasWildHeartPowerOfTheWilds(character)) {
    return [];
  }

  return wildHeartPowerOptionDefinitions.map((definition) => ({
    key: definition.key,
    name: definition.name,
    summary: definition.summary,
    detail: definition.description,
    breakdown: definition.description,
    trackingState: definition.trackingState,
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE
  }));
}

function getMindlessRageImmunityEntries(): DerivedFeatureStatusEntry[] {
  return [
    {
      id: mindlessRageCharmedImmunitySourceId,
      sourceId: mindlessRageCharmedImmunitySourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: CONDITION_NAME.CHARMED,
      source: "Mindless Rage",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.RAGE
      }
    },
    {
      id: mindlessRageFrightenedImmunitySourceId,
      sourceId: mindlessRageFrightenedImmunitySourceId,
      group: STATUS_ENTRY_GROUP.IMMUNITIES,
      value: CONDITION_NAME.FRIGHTENED,
      source: "Mindless Rage",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.LINKED,
        linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
        linkedValue: EFFECT_NAME.RAGE
      }
    }
  ];
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
  const warriorOfTheGodsUsesExpended = Number(record.warriorOfTheGodsUsesExpended);
  const intimidatingPresenceUsesExpended = Number(record.intimidatingPresenceUsesExpended);
  const zealousPresenceUsesExpended = Number(record.zealousPresenceUsesExpended);
  const rageOfTheGodsUsesExpended = Number(record.rageOfTheGodsUsesExpended);
  const relentlessRageDcBonus = Number(record.relentlessRageDcBonus);
  const persistentRageUsesExpended = Number(record.persistentRageUsesExpended);
  const warriorOfTheGodsUsesTotal = getBarbarianWarriorOfTheGodsUsesTotal(character);

  return {
    usesExpended: Number.isFinite(usesExpended)
      ? Math.max(0, Math.min(totalRages, Math.floor(usesExpended)))
      : 0,
    active: Boolean(record.active),
    wildHeartRageOption: hasWildHeartRageOfTheWilds(character)
      ? normalizeWildHeartRageOption(record.wildHeartRageOption)
      : undefined,
    wildHeartPowerOption: hasWildHeartPowerOfTheWilds(character)
      ? normalizeWildHeartPowerOption(record.wildHeartPowerOption)
      : undefined,
    wildHeartAspect: hasWildHeartAspectOfTheWilds(character)
      ? normalizeWildHeartAspect(record.wildHeartAspect)
      : undefined,
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
    divineFuryUsedThisTurn: hasZealotDivineFury(character)
      ? record.divineFuryUsedThisTurn === true
      : false,
    warriorOfTheGodsUsesExpended: hasZealotWarriorOfTheGods(character)
      ? Number.isFinite(warriorOfTheGodsUsesExpended)
        ? Math.max(
            0,
            Math.min(warriorOfTheGodsUsesTotal, Math.floor(warriorOfTheGodsUsesExpended))
          )
        : 0
      : 0,
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
    frenzyPending:
      hasBarbarianFeature(character, CLASS_FEATURE.RECKLESS_ATTACK) &&
      isPathOfTheBerserker(character) &&
      record.frenzyPending === true
        ? true
        : false,
    intimidatingPresenceUsesExpended: hasBerserkerIntimidatingPresence(character)
      ? Number.isFinite(intimidatingPresenceUsesExpended)
        ? Math.max(
            0,
            Math.min(intimidatingPresenceUsesTotal, Math.floor(intimidatingPresenceUsesExpended))
          )
        : 0
      : 0,
    zealousPresenceUsesExpended: hasZealotZealousPresence(character)
      ? Number.isFinite(zealousPresenceUsesExpended)
        ? Math.max(0, Math.min(zealousPresenceUsesTotal, Math.floor(zealousPresenceUsesExpended)))
        : 0
      : 0,
    rageOfTheGodsUsesExpended: hasZealotRageOfTheGods(character)
      ? Number.isFinite(rageOfTheGodsUsesExpended)
        ? Math.max(0, Math.min(rageOfTheGodsUsesTotal, Math.floor(rageOfTheGodsUsesExpended)))
        : 0
      : 0,
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
  return hasZealotRageOfTheGods(character) ? rageOfTheGodsUsesTotal : 0;
}

export function getBarbarianRageOfTheGodsUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  const totalUses = getBarbarianRageOfTheGodsUsesTotal(character);
  const rageState = getBarbarianRageState(character);

  return Math.max(0, totalUses - (rageState.rageOfTheGodsUsesExpended ?? 0));
}

export function getBarbarianWarriorOfTheGodsUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  if (!hasZealotWarriorOfTheGods(character)) {
    return 0;
  }

  if (character.level >= 17) {
    return 7;
  }

  if (character.level >= 12) {
    return 6;
  }

  if (character.level >= 6) {
    return 5;
  }

  return warriorOfTheGodsBaseUses;
}

export function getBarbarianWarriorOfTheGodsUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  const totalUses = getBarbarianWarriorOfTheGodsUsesTotal(character);
  const rageState = getBarbarianRageState(character);

  return Math.max(0, totalUses - (rageState.warriorOfTheGodsUsesExpended ?? 0));
}

export function getBarbarianWarriorOfTheGodsHealingFormula(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): string {
  const levelBonus = Math.floor(clampNumber(character.level, 0, 20, 0) / 2);

  return levelBonus > 0 ? `1d6 + ${levelBonus}` : "1d6";
}

export function getBarbarianIntimidatingPresenceUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return hasBerserkerIntimidatingPresence(character) ? intimidatingPresenceUsesTotal : 0;
}

export function getBarbarianIntimidatingPresenceUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  const totalUses = getBarbarianIntimidatingPresenceUsesTotal(character);

  return Math.max(
    0,
    totalUses - (getBarbarianRageState(character).intimidatingPresenceUsesExpended ?? 0)
  );
}

export function getBarbarianZealousPresenceUsesTotal(
  character: Pick<Character, "className" | "level"> & Partial<Pick<Character, "subclassId">>
): number {
  return hasZealotZealousPresence(character) ? zealousPresenceUsesTotal : 0;
}

export function getBarbarianZealousPresenceUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): number {
  const totalUses = getBarbarianZealousPresenceUsesTotal(character);

  return Math.max(0, totalUses - (getBarbarianRageState(character).zealousPresenceUsesExpended ?? 0));
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
    statusEntries: normalizeCharacterStatusEntries(character.statusEntries).filter(
      (entry) => entry.sourceId !== fanaticalFocusStatusSourceId
    ),
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
): WildHeartAspect | null {
  if (!hasWildHeartAspectOfTheWilds(character)) {
    return null;
  }

  return getBarbarianRageState(character).wildHeartAspect ?? null;
}

export function getBarbarianWildHeartPowerOptionChoice(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): WildHeartPowerOption | null {
  if (!hasWildHeartPowerOfTheWilds(character)) {
    return null;
  }

  return getBarbarianRageState(character).wildHeartPowerOption ?? null;
}

export function setBarbarianWildHeartAspectChoice(
  character: Character,
  selection: WildHeartAspect
): Character {
  if (!hasWildHeartAspectOfTheWilds(character)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);
  const normalizedSelection =
    wildHeartAspectDefinitions.find((option) => option.key === selection)?.key ?? undefined;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        wildHeartAspect: normalizedSelection
      }
    }
  };
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
    interaction:
      !rageState.active && hasWildHeartRageOfTheWilds(character) ? "select" : undefined,
    usesLabel: "Use 1",
    usesIcon: "flame",
    drawer:
      !rageState.active && hasWildHeartRageOfTheWilds(character)
        ? {
            kind: "custom-form",
            eyebrow: "Barbarian",
            formKind: "wild-heart-rage",
            resources: rageDrawerResources
          }
        : {
            kind: "confirm",
            eyebrow: "Barbarian",
            confirmLabel: "Enter Rage",
            resources: rageDrawerResources
          },
    execute:
      !rageState.active && hasWildHeartRageOfTheWilds(character)
        ? {
            kind: "custom-form",
            formKind: "wild-heart-rage",
            label: "Enter Rage"
          }
        : {
            kind: "activate",
            label: "Enter Rage"
          },
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

function getBarbarianWarriorOfTheGodsAction(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureActionCard | null {
  if (!hasZealotWarriorOfTheGods(character)) {
    return null;
  }

  const totalUses = getBarbarianWarriorOfTheGodsUsesTotal(character);
  const usesRemaining = getBarbarianWarriorOfTheGodsUsesRemaining(character);

  return {
    key: barbarianWarriorOfTheGodsActionKey,
    name: "Warrior of the Gods",
    summary: "Spend divine healing charges.",
    detail: "Spend divine healing charges.",
    breakdown: `Use a ${getBarbarianWarriorOfTheGodsHealingFormula(character)} to heal yourself.`,
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    interaction: "select",
    usesLabel: `${usesRemaining}/${totalUses} charges`,
    usesRemaining,
    usesTotal: totalUses,
    drawer: {
      kind: "custom-form",
      eyebrow: "Barbarian",
      formKind: "warrior-of-the-gods"
    },
    execute: {
      kind: "custom-form",
      formKind: "warrior-of-the-gods",
      label: "Heal"
    },
    disabled: usesRemaining <= 0,
    disabledReason: usesRemaining <= 0 ? "No Warrior of the Gods charges remaining." : undefined
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
      formKind: "brutal-strike"
    },
    execute: {
      kind: "custom-form",
      formKind: "brutal-strike",
      label: "Apply Brutal Strike"
    },
    isActive: rageState.brutalStrikePending === true,
    disabled: !isAvailable,
    disabledReason:
      rageState.brutalStrikePending === true
        ? "Brutal Strike is armed for your next Strength-based attack."
        : rageState.brutalStrikeUsedThisTurn === true
          ? "Brutal Strike is already used for this Reckless Attack."
          : "Use Reckless Attack first."
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
    valueLabel: `Current DC ${currentDc}`,
    breakdown: relentlessRageActionSummary,
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    disabled: !isRaging,
    disabledReason: !isRaging ? "Relentless Rage requires Rage to be active." : undefined
  };
}

function getBarbarianIntimidatingPresenceAction(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureActionCard | null {
  if (!hasBerserkerIntimidatingPresence(character)) {
    return null;
  }

  const rageState = getBarbarianRageState(character);
  const usesRemaining = Math.max(
    0,
    intimidatingPresenceUsesTotal - (rageState.intimidatingPresenceUsesExpended ?? 0)
  );
  const rageUsesRemaining = getBarbarianRageUsesRemaining(character);
  const isUsingRageCharges = usesRemaining <= 0;
  const disabled = usesRemaining <= 0 && rageUsesRemaining <= 0;

  return {
    key: barbarianIntimidatingPresenceActionKey,
    name: "Intimidating Presence",
    summary: "Frighten nearby creatures.",
    detail: "Project fear nearby.",
    breakdown: "Project fear nearby.",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal: intimidatingPresenceUsesTotal,
    usesInlineLabel: isUsingRageCharges ? "Use 1" : undefined,
    usesInlineIcon: isUsingRageCharges ? "flame" : undefined,
    disabled,
    disabledReason: disabled ? "No Intimidating Presence or Rage uses remaining." : undefined
  };
}

function getBarbarianZealousPresenceAction(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureActionCard | null {
  if (!hasZealotZealousPresence(character)) {
    return null;
  }

  const usesRemaining = getBarbarianZealousPresenceUsesRemaining(character);
  const rageUsesRemaining = getBarbarianRageUsesRemaining(character);
  const isUsingRageCharges = usesRemaining <= 0;
  const disabled = usesRemaining <= 0 && rageUsesRemaining <= 0;

  return {
    key: barbarianZealousPresenceActionKey,
    name: "Zealous Presence",
    summary: "Divine infused Battle Cry",
    detail: "Divine infused Battle Cry",
    breakdown: "Divine infused Battle Cry",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesLabel: `${usesRemaining}/${zealousPresenceUsesTotal} charge`,
    usesRemaining,
    usesTotal: zealousPresenceUsesTotal,
    usesInlineLabel: isUsingRageCharges ? "Use 1" : undefined,
    usesInlineIcon: isUsingRageCharges ? "flame" : undefined,
    disabled,
    disabledReason: disabled ? "No Zealous Presence or Rage uses remaining." : undefined
  };
}

function getBarbarianTravelAlongTheTreeAction(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureActionCard | null {
  if (!hasWorldTreeTravelAlongTheTree(character)) {
    return null;
  }

  const rageState = getBarbarianRageState(character);
  const rageUsesRemaining = getBarbarianRageUsesRemaining(character);
  const disabled = rageState.active !== true || rageUsesRemaining <= 0;

  return {
    key: barbarianTravelAlongTheTreeActionKey,
    name: "Travel Along the Tree",
    summary: "Teleport while in Rage.",
    detail: "Teleport while in Rage.",
    usesLabel: "Use 1",
    usesIcon: "flame",
    breakdown: "Teleport while in Rage.",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    disabled,
    disabledReason:
      rageState.active !== true
        ? "Travel Along the Tree requires Rage to be active."
        : rageUsesRemaining <= 0
          ? "No Rage uses remaining."
          : undefined
  };
}

export function getBarbarianFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>
): FeatureActionCard[] {
  return [
    getBarbarianFeatureAction(character),
    getBarbarianRecklessAttackAction(character),
    getBarbarianWarriorOfTheGodsAction(character),
    getBarbarianBrutalStrikeAction(character),
    getBarbarianRelentlessRageAction(character),
    getBarbarianIntimidatingPresenceAction(character),
    getBarbarianZealousPresenceAction(character),
    getBarbarianTravelAlongTheTreeAction(character)
  ].filter((entry): entry is FeatureActionCard => entry !== null);
}

export function getBarbarianWeaponDamageBonuses(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId" | "roundTracker">>,
  context: WeaponFeatureContext
): FeatureDamageBonus[] {
  const damageBonuses: FeatureDamageBonus[] = [];

  if (isBarbarianRaging(character) && context.ability === "STR") {
    const rageDamage = getBarbarianRageDamageBonus(character);

    if (rageDamage > 0) {
      damageBonuses.push({
        label: "Rage",
        value: rageDamage
      });
    }
  }

  if (
    hasZealotDivineFury(character) &&
    isBarbarianRaging(character) &&
    normalizeRoundTracker(character.roundTracker).turnStarted &&
    (context.attackKind === "weapon" || context.attackKind === "unarmed") &&
    getBarbarianRageState(character).divineFuryUsedThisTurn !== true
  ) {
    const divineFuryLevelBonus = Math.floor(clampNumber(character.level, 0, 20, 0) / 2);
    const divineFuryFormula =
      divineFuryLevelBonus > 0 ? `1d6+${divineFuryLevelBonus}` : "1d6";
    const divineFuryDisplayLabel =
      divineFuryLevelBonus > 0
        ? `1d6 + ${divineFuryLevelBonus} Necrotic/Radiant`
        : "1d6 Necrotic/Radiant";

    damageBonuses.push({
      label: divineFuryDamageBonusLabel,
      formula: divineFuryFormula,
      displayLabel: divineFuryDisplayLabel
    });
  }

  if (
    isPathOfTheBerserker(character) &&
    isBarbarianRaging(character) &&
    context.ability === "STR" &&
    (context.attackKind === "weapon" || context.attackKind === "unarmed") &&
    getBarbarianRageState(character).frenzyPending === true
  ) {
    const rageDamage = getBarbarianRageDamageBonus(character);

    if (rageDamage > 0) {
      damageBonuses.push({
        label: frenzyDamageBonusLabel,
        formula: `${rageDamage}d6`,
        displayLabel: `${rageDamage}d6`
      });
    }
  }

  if (
    hasBarbarianBrutalStrike(character) &&
    getBarbarianRageState(character).brutalStrikePending === true &&
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

  if (
    hasBarbarianFeature(character, CLASS_FEATURE.FAST_MOVEMENT) &&
    context.wornBodyArmorType !== "heavy"
  ) {
    speedBonuses.push({
      label: "Fast Movement",
      value: 10
    });
  }

  const wildHeartAspect = getBarbarianWildHeartAspectChoice(character);

  if (wildHeartAspect === "panther") {
    speedBonuses.push({
      label: "Panther",
      movementType: "climb",
      value: 0,
      setBaseFromWalkMultiplier: 1
    });
  }

  if (wildHeartAspect === "salmon") {
    speedBonuses.push({
      label: "Salmon",
      movementType: "swim",
      value: 0,
      setBaseFromWalkMultiplier: 1
    });
  }

  if (
    isBarbarianRaging(character) &&
    getBarbarianWildHeartPowerOptionChoice(character) === "falcon" &&
    context.wornBodyArmorType === null
  ) {
    speedBonuses.push({
      label: "Falcon",
      movementType: "fly",
      value: 0,
      setBaseFromWalkMultiplier: 1
    });
  }

  if (hasBarbarianRageOfTheGodsTrait(character)) {
    speedBonuses.push({
      label: "Rage of the Gods",
      movementType: "fly",
      value: 0,
      setBaseFromWalkMultiplier: 1
    });
  }

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
  const wildHeartAspect = getBarbarianWildHeartAspectChoice(character);

  if (wildHeartAspect === "owl") {
    derivedEntries.push({
      id: "feature-barbarian-aspect-of-the-wilds-owl",
      sourceId: "feature-barbarian-aspect-of-the-wilds-owl",
      group: STATUS_ENTRY_GROUP.SENSES,
      value: SENSE.DARKVISION,
      source: "Aspect of the Wilds",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      },
      rangeFeet: 60
    });
  }

  if (isBarbarianRaging(character)) {
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

    const selectedRageOption = wildHeartRageOptionDefinitions.find(
      (definition) => definition.key === rageState.wildHeartRageOption
    );

    if (selectedRageOption) {
      derivedEntries.push({
        id: `${rageOfTheWildsEffectSourceId}-${selectedRageOption.key}`,
        sourceId: `${rageOfTheWildsEffectSourceId}-${selectedRageOption.key}`,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: selectedRageOption.name,
        source: "Rage of the Wilds",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.RAGE
        }
      });
    }

    const selectedPowerOption = wildHeartPowerOptionDefinitions.find(
      (definition) => definition.key === rageState.wildHeartPowerOption
    );

    if (selectedPowerOption) {
      derivedEntries.push({
        id: `${powerOfTheWildsEffectSourceId}-${selectedPowerOption.key}`,
        sourceId: `${powerOfTheWildsEffectSourceId}-${selectedPowerOption.key}`,
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: selectedPowerOption.name,
        source: "Power of the Wilds",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.RAGE
        }
      });
    }

    if (hasBerserkerMindlessRage(character)) {
      derivedEntries.push(...getMindlessRageImmunityEntries());
    }

    if (hasWildHeartRageOfTheWilds(character) && rageState.wildHeartRageOption === "bear") {
      derivedEntries.push(
        {
          id: "feature-rage-of-the-wilds-bear-acid",
          sourceId: rageOfTheWildsBearStatusSourceId,
          group: STATUS_ENTRY_GROUP.RESISTANCES,
          value: DAMAGE_TYPE.ACID,
          source: "Rage of the Wilds",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: {
            kind: STATUS_DURATION_KIND.LINKED,
            linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
            linkedValue: EFFECT_NAME.RAGE
          }
        },
        {
          id: "feature-rage-of-the-wilds-bear-cold",
          sourceId: rageOfTheWildsBearStatusSourceId,
          group: STATUS_ENTRY_GROUP.RESISTANCES,
          value: DAMAGE_TYPE.COLD,
          source: "Rage of the Wilds",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: {
            kind: STATUS_DURATION_KIND.LINKED,
            linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
            linkedValue: EFFECT_NAME.RAGE
          }
        },
        {
          id: "feature-rage-of-the-wilds-bear-fire",
          sourceId: rageOfTheWildsBearStatusSourceId,
          group: STATUS_ENTRY_GROUP.RESISTANCES,
          value: DAMAGE_TYPE.FIRE,
          source: "Rage of the Wilds",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: {
            kind: STATUS_DURATION_KIND.LINKED,
            linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
            linkedValue: EFFECT_NAME.RAGE
          }
        },
        {
          id: "feature-rage-of-the-wilds-bear-lightning",
          sourceId: rageOfTheWildsBearStatusSourceId,
          group: STATUS_ENTRY_GROUP.RESISTANCES,
          value: DAMAGE_TYPE.LIGHTNING,
          source: "Rage of the Wilds",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: {
            kind: STATUS_DURATION_KIND.LINKED,
            linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
            linkedValue: EFFECT_NAME.RAGE
          }
        },
        {
          id: "feature-rage-of-the-wilds-bear-poison",
          sourceId: rageOfTheWildsBearStatusSourceId,
          group: STATUS_ENTRY_GROUP.RESISTANCES,
          value: DAMAGE_TYPE.POISON,
          source: "Rage of the Wilds",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: {
            kind: STATUS_DURATION_KIND.LINKED,
            linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
            linkedValue: EFFECT_NAME.RAGE
          }
        },
        {
          id: "feature-rage-of-the-wilds-bear-thunder",
          sourceId: rageOfTheWildsBearStatusSourceId,
          group: STATUS_ENTRY_GROUP.RESISTANCES,
          value: DAMAGE_TYPE.THUNDER,
          source: "Rage of the Wilds",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
          duration: {
            kind: STATUS_DURATION_KIND.LINKED,
            linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
            linkedValue: EFFECT_NAME.RAGE
          }
        }
      );
    }
  }

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

  if (hasBarbarianRageOfTheGodsTrait(character)) {
    derivedEntries.push(
      {
        id: "feature-barbarian-rage-of-the-gods-necrotic",
        sourceId: rageOfTheGodsStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.NECROTIC,
        source: "Rage of the Gods",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: "Rage of the Gods"
        }
      },
      {
        id: "feature-barbarian-rage-of-the-gods-psychic",
        sourceId: rageOfTheGodsStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.PSYCHIC,
        source: "Rage of the Gods",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: "Rage of the Gods"
        }
      },
      {
        id: "feature-barbarian-rage-of-the-gods-radiant",
        sourceId: rageOfTheGodsStatusSourceId,
        group: STATUS_ENTRY_GROUP.RESISTANCES,
        value: DAMAGE_TYPE.RADIANT,
        source: "Rage of the Gods",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: "Rage of the Gods"
        }
      }
    );
  }

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
  const canUseRageOfTheGods =
    options?.useRageOfTheGods === true && getBarbarianRageOfTheGodsUsesRemaining(character) > 0;

  if (rageState.usesExpended >= totalUses) {
    return character;
  }

  const nextStatusEntries = hasBerserkerMindlessRage(character)
    ? removeCharacterConditionsForImmunities(
        character.statusEntries,
        getMindlessRageImmunityEntries()
      )
    : character.statusEntries;
  const nextNormalizedStatusEntries = normalizeCharacterStatusEntries(nextStatusEntries).filter(
    (entry) =>
      entry.sourceId !== instinctivePounceStatusSourceId &&
      entry.sourceId !== fanaticalFocusStatusSourceId &&
      entry.sourceId !== rageOfTheGodsStatusSourceId
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
  const nextRageLinkedStatusEntries = hasZealotFanaticalFocus(character)
    ? [
        ...nextRageStatusEntries,
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: "Fanatical Focus",
          source: "Path of the Zealot",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
          duration: {
            kind: STATUS_DURATION_KIND.LINKED,
            linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
            linkedValue: EFFECT_NAME.RAGE
          },
          sourceId: fanaticalFocusStatusSourceId
        })
      ]
    : nextRageStatusEntries;
  const nextRageOfTheGodsStatusEntries = canUseRageOfTheGods
    ? [
        ...nextRageLinkedStatusEntries,
        createCharacterStatusEntry({
          group: STATUS_ENTRY_GROUP.EFFECTS,
          value: "Rage of the Gods",
          source: "Path of the Zealot",
          sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
          duration: {
            kind: STATUS_DURATION_KIND.MINUTES,
            amount: 1
          },
          sourceId: rageOfTheGodsStatusSourceId
        })
      ]
    : nextRageLinkedStatusEntries;
  const vitalityOfTheTreeTemporaryHitPoints = hasWorldTreeVitalityOfTheTree(character)
    ? Math.floor(clampNumber(character.level, 0, 999, 0))
    : 0;
  const nextTemporaryHitPointsAssignment =
    vitalityOfTheTreeTemporaryHitPoints > 0
      ? swapTemporaryHitPointsAssignment(
          character.temporaryHitPoints,
          character.temporaryHitPointsSource,
          vitalityOfTheTreeTemporaryHitPoints,
          "Vitality Surge"
        )
      : {
          temporaryHitPoints: character.temporaryHitPoints,
          temporaryHitPointsSource: character.temporaryHitPointsSource
        };

  return {
    ...character,
    statusEntries: nextRageOfTheGodsStatusEntries,
    ...nextTemporaryHitPointsAssignment,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        usesExpended: rageState.usesExpended + 1,
        active: true,
        divineFuryUsedThisTurn: false,
        rageOfTheGodsUsesExpended: canUseRageOfTheGods
          ? (rageState.rageOfTheGodsUsesExpended ?? 0) + 1
          : rageState.rageOfTheGodsUsesExpended,
        wildHeartRageOption: hasWildHeartRageOfTheWilds(character)
          ? undefined
          : rageState.wildHeartRageOption,
        wildHeartPowerOption: hasWildHeartPowerOfTheWilds(character)
          ? undefined
          : rageState.wildHeartPowerOption
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
  if (!hasWildHeartRageOfTheWilds(character)) {
    return character;
  }

  const wildHeartOption = normalizeWildHeartRageOption(rageOptionKey);
  const wildHeartPowerOption = hasWildHeartPowerOfTheWilds(character)
    ? normalizeWildHeartPowerOption(powerOptionKey)
    : undefined;

  if (!wildHeartOption || (hasWildHeartPowerOfTheWilds(character) && !wildHeartPowerOption)) {
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
        wildHeartRageOption: wildHeartOption,
        wildHeartPowerOption
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
        frenzyPending: isPathOfTheBerserker(character) && rageState.active === true ? true : false
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
  if (!hasZealotWarriorOfTheGods(character)) {
    return character;
  }

  const normalizedChargeCount = Math.max(0, Math.floor(chargeCount));

  if (normalizedChargeCount <= 0) {
    return character;
  }

  const rageState = getBarbarianRageState(character);
  const usesRemaining = getBarbarianWarriorOfTheGodsUsesRemaining(character);
  const chargesToSpend = Math.min(usesRemaining, normalizedChargeCount);

  if (chargesToSpend <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        warriorOfTheGodsUsesExpended: (rageState.warriorOfTheGodsUsesExpended ?? 0) + chargesToSpend
      }
    }
  };
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
  if (!hasBerserkerIntimidatingPresence(character)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);
  const usesRemaining = Math.max(
    0,
    intimidatingPresenceUsesTotal - (rageState.intimidatingPresenceUsesExpended ?? 0)
  );

  if (usesRemaining > 0) {
    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        rage: {
          ...rageState,
          intimidatingPresenceUsesExpended: (rageState.intimidatingPresenceUsesExpended ?? 0) + 1
        }
      }
    };
  }

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

export function activateBarbarianZealousPresence(character: Character): Character {
  if (!hasZealotZealousPresence(character)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);
  const usesRemaining = getBarbarianZealousPresenceUsesRemaining(character);

  if (usesRemaining > 0) {
    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        rage: {
          ...rageState,
          zealousPresenceUsesExpended: (rageState.zealousPresenceUsesExpended ?? 0) + 1
        }
      }
    };
  }

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

export function activateBarbarianTravelAlongTheTree(character: Character): Character {
  if (!hasWorldTreeTravelAlongTheTree(character)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);
  const rageUsesRemaining = getBarbarianRageUsesRemaining(character);

  if (rageState.active !== true || rageUsesRemaining <= 0) {
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
  if (!hasZealotDivineFury(character)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if (rageState.divineFuryUsedThisTurn === true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        divineFuryUsedThisTurn: true
      }
    }
  };
}

export function consumeBarbarianFrenzyBonus(character: Character): Character {
  const rageState = getBarbarianRageState(character);

  if (rageState.frenzyPending !== true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        frenzyPending: false
      }
    }
  };
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
  if (!hasZealotWarriorOfTheGods(character)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if ((rageState.warriorOfTheGodsUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        warriorOfTheGodsUsesExpended: 0
      }
    }
  };
}

export function restoreBarbarianIntimidatingPresenceOnLongRest(character: Character): Character {
  if (!hasBerserkerIntimidatingPresence(character)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if ((rageState.intimidatingPresenceUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        intimidatingPresenceUsesExpended: 0
      }
    }
  };
}

export function restoreBarbarianZealousPresenceOnLongRest(character: Character): Character {
  if (!hasZealotZealousPresence(character)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if ((rageState.zealousPresenceUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        zealousPresenceUsesExpended: 0
      }
    }
  };
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
  if (!hasZealotRageOfTheGods(character)) {
    return character;
  }

  const rageState = getBarbarianRageState(character);

  if ((rageState.rageOfTheGodsUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        rageOfTheGodsUsesExpended: 0
      }
    }
  };
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
