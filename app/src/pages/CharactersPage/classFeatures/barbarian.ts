import { barbarianFeatures } from "../../../codex/classes";
import { CLASS_FEATURE, DAMAGE_TYPE } from "../../../codex/entries";
import type { BarbarianFeatureClassObj } from "../../../types";
import {
  CONDITION_NAME,
  EFFECT_NAME,
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  WEAPON_PROFICIENCY,
  type Character,
  type CharacterRageFeatureState,
  type WeaponProficiencyEntry
} from "../../../types";
import {
  hasStatusCondition,
  removeCharacterConditionsForImmunities
} from "../traits";
import { skillGroupsByAbility } from "../skillDefinitions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../actionEconomy";
import type {
  AbilityCheckIndicatorMap,
  ArmorClassFeatureContext,
  CoreStatIndicatorMap,
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureAbilityScoreBonus,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureDamageBonus,
  FeatureIndicator,
  FeatureSpeedBonus,
  FeatureSpellcastingState,
  FeatureWeaponProficiencyEntry,
  SavingThrowIndicatorMap,
  SpeedFeatureContext,
  SkillIndicatorMap,
  WeaponFeatureContext
} from "./types";
import { getWeaponMasteryOptions, normalizeWeaponMasterySelections } from "./weaponMastery";

const rageConditionName = EFFECT_NAME.RAGE;
const rageStatusSourceId = "feature-rage";
const recklessAttackStatusSourceId = "feature-barbarian-reckless-attack";
const recklessAttackDurationRounds = 2;
const pathOfTheBerserkerSubclassId = "barbarian-path-of-the-berserker";
const mindlessRageCharmedImmunitySourceId = "feature-barbarian-mindless-rage-charmed-immunity";
const mindlessRageFrightenedImmunitySourceId =
  "feature-barbarian-mindless-rage-frightened-immunity";
const frenzyDamageBonusLabel = "Frenzy";
export const barbarianRageActionKey = "barbarian-rage";
export const barbarianRecklessAttackActionKey = "barbarian-reckless-attack";
export const barbarianIntimidatingPresenceActionKey = "barbarian-intimidating-presence";
const intimidatingPresenceUsesTotal = 1;
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
  const recklessAttackRoundsRemaining = Number(record.recklessAttackRoundsRemaining);
  const intimidatingPresenceUsesExpended = Number(record.intimidatingPresenceUsesExpended);

  return {
    usesExpended: Number.isFinite(usesExpended)
      ? Math.max(0, Math.min(totalRages, Math.floor(usesExpended)))
      : 0,
    active: Boolean(record.active),
    weaponMasteries: normalizeWeaponMasterySelections(
      record.weaponMasteries,
      barbarianWeaponMasteryOptions,
      totalWeaponMasteries
    ),
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
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard | null {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RAGE)) {
    return null;
  }

  const rageState = getBarbarianRageState(character);
  const totalUses = getBarbarianRageUsesTotal(character);
  const usesRemaining = Math.max(0, totalUses - rageState.usesExpended);

  return {
    key: barbarianRageActionKey,
    name: "Rage",
    summary: rageState.active ? "Active" : "Enter a primal rage.",
    detail: "Enter into Rage state.",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesLabel: `${usesRemaining}/${totalUses} uses`,
    usesRemaining,
    usesTotal: totalUses,
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
    usesInlineLabel: isUsingRageCharges ? "| Uses Rage Charges" : undefined,
    disabled,
    disabledReason: disabled
      ? "No Intimidating Presence or Rage uses remaining."
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
    getBarbarianIntimidatingPresenceAction(character)
  ].filter((entry): entry is FeatureActionCard => entry !== null);
}

export function getBarbarianWeaponDamageBonuses(
  character: Pick<Character, "className" | "level" | "classFeatureState"> &
    Partial<Pick<Character, "subclassId">>,
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

  return Object.fromEntries(
    strengthSkills.map((skill) => [skill, [rageAdvantageIndicator]])
  ) as SkillIndicatorMap;
}

export function getBarbarianSpellcastingState(
  _character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureSpellcastingState {
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
  character: Pick<Character, "className" | "level">,
  context: SpeedFeatureContext
): FeatureSpeedBonus[] {
  if (
    !hasBarbarianFeature(character, CLASS_FEATURE.FAST_MOVEMENT) ||
    context.wornBodyArmorType === "heavy"
  ) {
    return [];
  }

  return [
    {
      label: "Fast Movement",
      value: 10
    }
  ];
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
    Partial<Pick<Character, "subclassId">>
): DerivedFeatureStatusEntry[] {
  const derivedEntries: DerivedFeatureStatusEntry[] = [];

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
        source: "Barbarian",
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
        source: "Barbarian",
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
        source: "Barbarian",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.RAGE
        }
      }
    );

    if (hasBerserkerMindlessRage(character)) {
      derivedEntries.push(...getMindlessRageImmunityEntries());
    }
  }

  const recklessAttackRoundsRemaining = getBarbarianRecklessAttackRoundsRemaining(character);

  if (recklessAttackRoundsRemaining > 0) {
    derivedEntries.push({
      id: recklessAttackStatusSourceId,
      sourceId: recklessAttackStatusSourceId,
      group: STATUS_ENTRY_GROUP.EFFECTS,
      value: "Reckless Attack",
      source: "Reckless Attack",
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.ROUNDS,
        amount: recklessAttackRoundsRemaining
      }
    });
  }

  return derivedEntries;
}

export function activateBarbarianRage(character: Character): Character {
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

  const nextStatusEntries = hasBerserkerMindlessRage(character)
    ? removeCharacterConditionsForImmunities(
        character.statusEntries,
        getMindlessRageImmunityEntries()
      )
    : character.statusEntries;

  return {
    ...character,
    statusEntries: nextStatusEntries,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        usesExpended: rageState.usesExpended + 1,
        active: true
      }
    }
  };
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
        frenzyPending:
          isPathOfTheBerserker(character) && rageState.active === true ? true : false
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
        frenzyPending: false
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
        frenzyPending: false
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

export function applyShortRestToBarbarianFeatures(character: Character): Character {
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
        recklessAttackRoundsRemaining: 0,
        recklessAttackUsedThisTurn: false,
        frenzyPending: false,
        intimidatingPresenceUsesExpended: rageState.intimidatingPresenceUsesExpended ?? 0
      }
    }
  };
}

export function applyLongRestToBarbarianFeatures(character: Character): Character {
  if (!hasBarbarianFeature(character, CLASS_FEATURE.RAGE)) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...getBarbarianRageState(character),
        usesExpended: 0,
        active: false,
        recklessAttackRoundsRemaining: 0,
        recklessAttackUsedThisTurn: false,
        frenzyPending: false,
        intimidatingPresenceUsesExpended: 0
      }
    }
  };
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

  if (recklessAttackRoundsRemaining === 0 && rageState.recklessAttackUsedThisTurn !== true && rageState.frenzyPending !== true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      rage: {
        ...rageState,
        recklessAttackRoundsRemaining: Math.max(0, recklessAttackRoundsRemaining - 1),
        recklessAttackUsedThisTurn: false,
        frenzyPending: false
      }
    }
  };
}

export function isBarbarianFeatureCondition(conditionName: string): boolean {
  const normalizedCondition = conditionName.trim();
  return normalizedCondition === rageConditionName || normalizedCondition === "Reckless Attack";
}
