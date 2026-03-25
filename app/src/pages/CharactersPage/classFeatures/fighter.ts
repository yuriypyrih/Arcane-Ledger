import { fighterFeatures } from "../../../codex/classes";
import {
  CLASS_FEATURE,
  ENTRY_CATEGORIES,
  RARITY_TYPES,
  type WeaponEntry,
  hardcodedCodexEntries
} from "../../../codex/entries";
import type {
  Character,
  CharacterFighterFeatureState,
  WeaponProficiencyEntry
} from "../../../types";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  WEAPON_PROFICIENCY
} from "../../../types";
import type {
  FeatureActionCard,
  FeatureWeaponProficiencyEntry
} from "./types";

export const fighterSecondWindActionKey = "fighter-second-wind";
const weaponMasterySource = "Weapon Mastery";

const fighterWeaponMasteryOptions = hardcodedCodexEntries
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

function dedupe<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function getFighterFeatureRow(level: number) {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const matchingRows = fighterFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : null;
}

function getUnlockedFighterFeatures(level: number): Set<CLASS_FEATURE> {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));

  return fighterFeatures
    .filter((row) => row.level <= normalizedLevel)
    .reduce((featureSet, row) => {
      row.classFeatures.forEach((feature) => {
        featureSet.add(feature);
      });

      return featureSet;
    }, new Set<CLASS_FEATURE>());
}

function hasFighterFeature(
  character: Pick<Character, "className" | "level">,
  feature: CLASS_FEATURE
): boolean {
  if (character.className !== "Fighter") {
    return false;
  }

  return getUnlockedFighterFeatures(character.level).has(feature);
}

function normalizeFighterWeaponMasteries(
  selections: unknown,
  limit: number
): WEAPON_PROFICIENCY[] {
  if (!Array.isArray(selections) || limit <= 0) {
    return [];
  }

  const optionSet = new Set<WEAPON_PROFICIENCY>(fighterWeaponMasteryOptions);

  return dedupe(
    selections.filter(
      (selection): selection is WEAPON_PROFICIENCY =>
        typeof selection === "string" && optionSet.has(selection as WEAPON_PROFICIENCY)
    )
  ).slice(0, limit);
}

export function normalizeFighterFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level">
): CharacterFighterFeatureState {
  const hasSecondWind = hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND);
  const hasWeaponMastery = hasFighterFeature(character, CLASS_FEATURE.WEAPON_MASTERY);

  if (!hasSecondWind && !hasWeaponMastery) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterFighterFeatureState>) : {};
  const secondWindTotal = hasSecondWind ? (getFighterFeatureRow(character.level)?.secondWind ?? 0) : 0;
  const weaponMasteryTotal = hasWeaponMastery
    ? (getFighterFeatureRow(character.level)?.weaponMastery ?? 0)
    : 0;

  return {
    secondWindUsesExpended: hasSecondWind
      ? Math.max(
          0,
          Math.min(
            secondWindTotal,
            Number.isFinite(Number(record.secondWindUsesExpended))
              ? Math.floor(Number(record.secondWindUsesExpended))
              : 0
          )
        )
      : undefined,
    weaponMasteries: hasWeaponMastery
      ? normalizeFighterWeaponMasteries(record.weaponMasteries, weaponMasteryTotal)
      : undefined
  };
}

export function getFighterSecondWindUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND)) {
    return 0;
  }

  return getFighterFeatureRow(character.level)?.secondWind ?? 0;
}

export function getFighterSecondWindUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getFighterSecondWindUsesTotal(character);
  const usesExpended =
    normalizeFighterFeatureState(character.classFeatureState?.fighter, character)
      .secondWindUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getFighterSecondWindHealingFormula(
  character: Pick<Character, "className" | "level">
): string {
  return `1d10+${Math.max(1, Math.floor(character.level))}`;
}

export function getFighterFeatureAction(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard | null {
  if (!hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND)) {
    return null;
  }

  const totalUses = getFighterSecondWindUsesTotal(character);
  const usesRemaining = getFighterSecondWindUsesRemaining(character);
  const minimumHealing = character.level + 1;
  const maximumHealing = character.level + 10;

  return {
    key: fighterSecondWindActionKey,
    name: "Second Wind",
    summary: `${minimumHealing}~${maximumHealing} Heal`,
    detail: "Use a Bonus Action to regain Hit Points equal to 1d10 plus your Fighter level.",
    actionCost: "bonusAction",
    usesLabel: `${usesRemaining}/${totalUses} uses`,
    disabled: usesRemaining <= 0,
    disabledReason: usesRemaining <= 0 ? "No Second Wind uses remaining." : undefined
  };
}

export function consumeFighterSecondWindUse(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(character.classFeatureState?.fighter, character);
  const totalUses = getFighterSecondWindUsesTotal(character);
  const usesExpended = fighterState.secondWindUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        secondWindUsesExpended: usesExpended + 1
      }
    }
  };
}

export function applyShortRestToFighterFeatures(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(character.classFeatureState?.fighter, character);
  const usesExpended = fighterState.secondWindUsesExpended ?? 0;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        secondWindUsesExpended: Math.max(0, usesExpended - 1)
      }
    }
  };
}

export function applyLongRestToFighterFeatures(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(character.classFeatureState?.fighter, character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        secondWindUsesExpended: 0
      }
    }
  };
}

export function getFighterWeaponMasterySelectionCount(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasFighterFeature(character, CLASS_FEATURE.WEAPON_MASTERY)) {
    return 0;
  }

  return getFighterFeatureRow(character.level)?.weaponMastery ?? 0;
}

export function getFighterWeaponMasteryOptions(): WEAPON_PROFICIENCY[] {
  return fighterWeaponMasteryOptions;
}

export function getFighterWeaponMasterySelections(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): WEAPON_PROFICIENCY[] {
  return normalizeFighterFeatureState(character.classFeatureState?.fighter, character)
    .weaponMasteries ?? [];
}

export function setFighterWeaponMasterySelections(
  character: Character,
  selections: WEAPON_PROFICIENCY[]
): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.WEAPON_MASTERY)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(character.classFeatureState?.fighter, character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        weaponMasteries: normalizeFighterWeaponMasteries(
          selections,
          getFighterWeaponMasterySelectionCount(character)
        )
      }
    }
  };
}

export function getFighterWeaponProficiencyEntries(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureWeaponProficiencyEntry[] {
  return getFighterWeaponMasterySelections(character).map(
    (proficiency) =>
      ({
        source: PROFICIENCY_SOURCE.CLASS,
        sourceStr: weaponMasterySource,
        proficiency,
        proficiencyLevel: PROF_LEVEL.PROFICIENT,
        overridePolicy: PROFICIENCY_OVERRIDE_POLICY.LOCKED
      }) satisfies WeaponProficiencyEntry
  );
}
