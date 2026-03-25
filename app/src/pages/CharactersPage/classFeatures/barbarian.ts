import { barbarianFeatures } from "../../../codex/classes";
import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  ENTRY_CATEGORIES,
  RARITY_TYPES,
  WEAPON_COMBAT_TYPE,
  type WeaponEntry,
  hardcodedCodexEntries
} from "../../../codex/entries";
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
import { hasStatusCondition } from "../traits";
import { skillGroupsByAbility } from "../skillDefinitions";
import type {
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

const rageConditionName = EFFECT_NAME.RAGE;
const rageStatusSourceId = "feature-rage";
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

const barbarianWeaponMasteryOptions = hardcodedCodexEntries
  .filter(
    (entry): entry is WeaponEntry =>
      entry.category === ENTRY_CATEGORIES.WEAPONS &&
      entry.rarity === RARITY_TYPES.COMMON &&
      typeof entry.baseWeapon === "string" &&
      entry.type.combat === WEAPON_COMBAT_TYPE.MELEE
  )
  .sort((left, right) => left.name.localeCompare(right.name))
  .reduce<WEAPON_PROFICIENCY[]>((options, entry) => {
    const proficiency = entry.baseWeapon as unknown as WEAPON_PROFICIENCY;

    if (!options.includes(proficiency)) {
      options.push(proficiency);
    }

    return options;
  }, []);

function dedupe<T>(values: T[]): T[] {
  return [...new Set(values)];
}

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

function hasBarbarianFeature(character: Pick<Character, "className" | "level">, feature: CLASS_FEATURE) {
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

function normalizeBarbarianWeaponMasteries(
  selections: unknown,
  limit: number
): WEAPON_PROFICIENCY[] {
  if (!Array.isArray(selections) || limit <= 0) {
    return [];
  }

  const optionSet = new Set<WEAPON_PROFICIENCY>(barbarianWeaponMasteryOptions);

  return dedupe(
    selections.filter(
      (selection): selection is WEAPON_PROFICIENCY =>
        typeof selection === "string" && optionSet.has(selection as WEAPON_PROFICIENCY)
    )
  ).slice(0, limit);
}

export function normalizeBarbarianRageState(
  value: unknown,
  character: Pick<Character, "className" | "level">
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

  return {
    usesExpended: Number.isFinite(usesExpended)
      ? Math.max(0, Math.min(totalRages, Math.floor(usesExpended)))
      : 0,
    active: Boolean(record.active),
    weaponMasteries: normalizeBarbarianWeaponMasteries(record.weaponMasteries, totalWeaponMasteries)
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
        weaponMasteries: normalizeBarbarianWeaponMasteries(
          selections,
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
    key: "barbarian-rage",
    name: "Rage",
    summary: rageState.active ? "Active" : "Enter a primal rage.",
    detail: rageState.active
      ? "Strength-based weapon and unarmed damage are empowered, Strength checks and saves show Advantage, and you gain resistance to bludgeoning, piercing, and slashing damage."
      : "Use a Bonus Action to activate Rage and gain your Barbarian Rage bonuses.",
    actionCost: "bonusAction",
    usesLabel: `${usesRemaining}/${totalUses} uses`,
    isActive: rageState.active,
    disabled: rageState.active || usesRemaining <= 0,
    disabledReason: rageState.active
      ? "Rage is already active."
      : usesRemaining <= 0
        ? "No Rage uses remaining."
        : undefined
  };
}

export function getBarbarianWeaponDamageBonuses(
  character: Pick<Character, "className" | "level" | "classFeatureState">,
  context: WeaponFeatureContext
): FeatureDamageBonus[] {
  if (!isBarbarianRaging(character) || context.ability !== "STR") {
    return [];
  }

  const rageDamage = getBarbarianRageDamageBonus(character);

  if (rageDamage <= 0) {
    return [];
  }

  return [
    {
      label: "Rage",
      value: rageDamage
    }
  ];
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

export function getBarbarianSkillIndicators(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SkillIndicatorMap {
  if (!isBarbarianRaging(character)) {
    return {};
  }

  const strengthSkills = skillGroupsByAbility.find((group) => group.ability === "STR")?.skills ?? [];

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
  character: Pick<Character, "className" | "level" | "classFeatureState">
): DerivedFeatureStatusEntry[] {
  if (!isBarbarianRaging(character)) {
    return [];
  }

  return [
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
  ];
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

  return {
    ...character,
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
        active: false
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
        active: false
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
        active: false
      }
    }
  };
}

export function isBarbarianFeatureCondition(conditionName: string): boolean {
  return conditionName.trim() === rageConditionName;
}
