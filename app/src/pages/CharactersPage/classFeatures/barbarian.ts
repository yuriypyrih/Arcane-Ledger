import { barbarianFeatures } from "../../../codex/classes";
import { CLASS_FEATURE } from "../../../codex/entries";
import type { BarbarianFeatureClassObj } from "../../../types";
import type { Character, CharacterRageFeatureState } from "../../../types";
import { INDEFINITE_CONDITION_ROUNDS } from "../combat";
import { skillGroupsByAbility } from "../skillDefinitions";
import type {
  ArmorClassFeatureContext,
  DerivedFeatureCondition,
  FeatureActionCard,
  FeatureArmorClassBonus,
  FeatureArmorClassMode,
  FeatureDamageBonus,
  FeatureIndicator,
  FeatureSpellcastingState,
  SavingThrowIndicatorMap,
  SkillIndicatorMap,
  WeaponFeatureContext
} from "./types";

const rageConditionName = "Rage";
const advantageIndicator: FeatureIndicator = {
  label: "Advantage",
  tone: "advantage"
};

function getBarbarianFeatureRow(level: number): BarbarianFeatureClassObj | null {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = barbarianFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);
  const featureRow = matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;

  return featureRow;
}

function hasBarbarianFeature(character: Pick<Character, "className" | "level">, feature: CLASS_FEATURE) {
  if (character.className !== "Barbarian") {
    return false;
  }

  const featureRow = getBarbarianFeatureRow(character.level);
  return featureRow?.classFeatures.includes(feature) ?? false;
}

export function normalizeBarbarianRageState(
  value: unknown,
  character: Pick<Character, "className" | "level">
): CharacterRageFeatureState {
  const featureRow = getBarbarianFeatureRow(character.level);
  const canRage =
    character.className === "Barbarian" &&
    featureRow?.classFeatures.includes(CLASS_FEATURE.RAGE) &&
    typeof featureRow.rages === "number" &&
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

  return {
    usesExpended: Number.isFinite(usesExpended)
      ? Math.max(0, Math.min(totalRages, Math.floor(usesExpended)))
      : 0,
    active: Boolean(record.active)
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
      ? "Strength-based weapon and unarmed damage are empowered, and Strength checks and saves show Advantage."
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
  character: Pick<Character, "className" | "level" | "classFeatureState">
): SavingThrowIndicatorMap {
  if (!isBarbarianRaging(character)) {
    return {};
  }

  return {
    STR: [advantageIndicator]
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
    strengthSkills.map((skill) => [skill, [advantageIndicator]])
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

export function getBarbarianDerivedConditions(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): DerivedFeatureCondition[] {
  if (!isBarbarianRaging(character)) {
    return [];
  }

  return [
    {
      name: rageConditionName,
      roundsRemaining: INDEFINITE_CONDITION_ROUNDS,
      source: "feature"
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
        usesExpended: 0,
        active: false
      }
    }
  };
}

export function isBarbarianFeatureCondition(conditionName: string): boolean {
  return conditionName.trim() === rageConditionName;
}
