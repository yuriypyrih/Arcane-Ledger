import {
  CLASS_FEATURE,
  ENTRY_CATEGORIES,
  RARITY_TYPES,
  type WeaponEntry,
  hardcodedCodexEntries
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
  STATUS_ENTRY_GROUP,
  WEAPON_PROFICIENCY
} from "../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../actionEconomy";
import { normalizeCharacterStatusEntries } from "../traits";
import type { FeatureActionCard, FeatureWeaponProficiencyEntry } from "./types";

export const paladinLayOnHandsActionKey = "paladin-lay-on-hands";
const paladinWeaponMasterySource = "Weapon Mastery";
const paladinWeaponMasterySelectionCount = 2;

const layOnHandsPoisonedConditionCost = 5;
const paladinWeaponMasteryOptions = hardcodedCodexEntries
  .filter(
    (entry): entry is WeaponEntry =>
      entry.category === ENTRY_CATEGORIES.WEAPONS &&
      entry.rarity === RARITY_TYPES.COMMON &&
      typeof entry.baseWeapon === "string"
  )
  .sort((left, right) => left.name.localeCompare(right.name))
  .reduce<WEAPON_PROFICIENCY[]>((options, entry) => {
    const proficiency = entry.baseWeapon as unknown as WEAPON_PROFICIENCY;

    if (!options.includes(proficiency)) {
      options.push(proficiency);
    }

    return options;
  }, []);

export type LayOnHandsTarget = "self" | "other";
export type LayOnHandsCondition = "none" | CONDITION_NAME.POISONED;

type LayOnHandsOptions = {
  target: LayOnHandsTarget;
  poolSpendAmount: number;
  condition: LayOnHandsCondition;
};

function dedupe<T>(values: T[]): T[] {
  return [...new Set(values)];
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

export function normalizePaladinFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level">
): CharacterPaladinFeatureState {
  const hasLayOnHands = hasPaladinFeature(character, CLASS_FEATURE.LAY_ON_HANDS);
  const hasWeaponMastery = hasPaladinFeature(character, CLASS_FEATURE.WEAPON_MASTERY);

  if (!hasLayOnHands && !hasWeaponMastery) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterPaladinFeatureState>) : {};
  const layOnHandsExpended = Number(record.layOnHandsExpended);
  const totalPool = hasLayOnHands ? getPaladinHealingPoolTotal(character) : 0;
  const weaponMasteryOptionSet = new Set<WEAPON_PROFICIENCY>(paladinWeaponMasteryOptions);

  return {
    layOnHandsExpended: hasLayOnHands
      ? Number.isFinite(layOnHandsExpended)
        ? Math.max(0, Math.min(totalPool, Math.floor(layOnHandsExpended)))
        : 0
      : undefined,
    weaponMasteries: hasWeaponMastery
      ? dedupe(
          Array.isArray(record.weaponMasteries)
            ? record.weaponMasteries.filter(
                (selection): selection is WEAPON_PROFICIENCY =>
                  typeof selection === "string" &&
                  weaponMasteryOptionSet.has(selection as WEAPON_PROFICIENCY)
              )
            : []
        ).slice(0, paladinWeaponMasterySelectionCount)
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

export function getPaladinFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard[] {
  if (!hasPaladinFeature(character, CLASS_FEATURE.LAY_ON_HANDS)) {
    return [];
  }

  const remainingPool = getPaladinHealingPoolRemaining(character);

  return [
    {
      key: paladinLayOnHandsActionKey,
      name: "Lay on Hands",
      summary: "Uses Pool of Healing",
      detail: "Your blessed touch can heal wounds.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      interaction: "select",
      disabled: remainingPool <= 0,
      disabledReason: remainingPool <= 0 ? "Pool of Healing is empty." : undefined
    }
  ];
}

export function applyLayOnHands(
  character: Character,
  options: LayOnHandsOptions
): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.LAY_ON_HANDS)) {
    return character;
  }

  const paladinState = getPaladinFeatureState(character);
  const remainingPool = getPaladinHealingPoolRemaining(character);
  const spendAmount = Number.isFinite(options.poolSpendAmount)
    ? Math.max(0, Math.floor(options.poolSpendAmount))
    : 0;
  const conditionCost =
    options.condition === CONDITION_NAME.POISONED ? layOnHandsPoisonedConditionCost : 0;
  const totalCost = Math.min(spendAmount, remainingPool);
  const healingAmount = Math.max(0, totalCost - conditionCost);

  if (totalCost <= 0 || totalCost < conditionCost) {
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

  const nextCurrentHitPoints = Math.max(
    0,
    Math.min(character.hitPoints, character.currentHitPoints + healingAmount)
  );
  const nextStatusEntries =
    options.condition === CONDITION_NAME.POISONED
      ? normalizeCharacterStatusEntries(character.statusEntries).filter(
          (entry) =>
            !(
              entry.group === STATUS_ENTRY_GROUP.CONDITIONS &&
              entry.value === CONDITION_NAME.POISONED
            )
        )
      : character.statusEntries;

  return {
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
  };
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
  return normalizePaladinFeatureState(character.classFeatureState?.paladin, character)
    .weaponMasteries ?? [];
}

export function setPaladinWeaponMasterySelections(
  character: Character,
  selections: WEAPON_PROFICIENCY[]
): Character {
  if (!hasPaladinFeature(character, CLASS_FEATURE.WEAPON_MASTERY)) {
    return character;
  }

  const paladinState = getPaladinFeatureState(character);
  const optionSet = new Set<WEAPON_PROFICIENCY>(paladinWeaponMasteryOptions);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      paladin: {
        ...paladinState,
        weaponMasteries: dedupe(
          selections.filter((selection) => optionSet.has(selection))
        ).slice(0, paladinWeaponMasterySelectionCount)
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
