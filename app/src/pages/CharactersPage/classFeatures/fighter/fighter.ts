import { fighterFeatures } from "../../../../codex/classes";
import { CLASS_FEATURE } from "../../../../codex/entries";
import type {
  Character,
  CharacterFighterFeatureState,
  WeaponProficiencyEntry
} from "../../../../types";
import {
  PROFICIENCY_OVERRIDE_POLICY,
  PROFICIENCY_SOURCE,
  PROF_LEVEL,
  WEAPON_PROFICIENCY
} from "../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import { consumeRoundTrackerResource, isRoundTrackerResourceAvailable } from "../../combat";
import type { FeatureActionCard, FeatureWeaponProficiencyEntry } from "../types";
import { getWeaponMasteryOptions, normalizeWeaponMasterySelections } from "../weaponMastery";

export const fighterSecondWindActionKey = "fighter-second-wind";
export const fighterActionSurgeActionKey = "fighter-action-surge";
export const fighterTacticalMindActionKey = "fighter-tactical-mind";
export const fighterIndomitableActionKey = "fighter-indomitable";
const weaponMasterySource = "Weapon Mastery";

const fighterWeaponMasteryOptions = getWeaponMasteryOptions();

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

function getFighterAdditionalAttackCount(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasFighterFeature(character, CLASS_FEATURE.EXTRA_ATTACK)) {
    return 0;
  }

  if (hasFighterFeature(character, CLASS_FEATURE.THREE_EXTRA_ATTACKS)) {
    return 3;
  }

  if (hasFighterFeature(character, CLASS_FEATURE.TWO_EXTRA_ATTACKS)) {
    return 2;
  }

  return 1;
}

export function normalizeFighterFeatureState(
  value: unknown,
  character: Pick<Character, "className" | "level">
): CharacterFighterFeatureState {
  const hasSecondWind = hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND);
  const hasActionSurge = hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE);
  const hasIndomitable = hasFighterFeature(character, CLASS_FEATURE.INDOMITABLE);
  const hasWeaponMastery = hasFighterFeature(character, CLASS_FEATURE.WEAPON_MASTERY);
  const additionalAttackCount = getFighterAdditionalAttackCount(character);
  const hasExtraAttack = additionalAttackCount > 0;

  if (
    !hasSecondWind &&
    !hasActionSurge &&
    !hasIndomitable &&
    !hasWeaponMastery &&
    !hasExtraAttack
  ) {
    return {};
  }

  const record =
    value && typeof value === "object" ? (value as Partial<CharacterFighterFeatureState>) : {};
  const secondWindTotal = hasSecondWind
    ? (getFighterFeatureRow(character.level)?.secondWind ?? 0)
    : 0;
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
    actionSurgeUsesExpended: hasActionSurge
      ? Math.max(
          0,
          Math.min(
            character.level >= 17 ? 2 : 1,
            Number.isFinite(Number(record.actionSurgeUsesExpended))
              ? Math.floor(Number(record.actionSurgeUsesExpended))
              : 0
          )
        )
      : undefined,
    actionSurgeUsedThisTurn: hasActionSurge ? Boolean(record.actionSurgeUsedThisTurn) : undefined,
    actionSurgeExtraActionsRemainingThisTurn: hasActionSurge
      ? Math.max(
          0,
          Math.min(
            2,
            Number.isFinite(Number(record.actionSurgeExtraActionsRemainingThisTurn))
              ? Math.floor(Number(record.actionSurgeExtraActionsRemainingThisTurn))
              : 0
          )
        )
      : undefined,
    indomitableUsesExpended: hasIndomitable
      ? Math.max(
          0,
          Math.min(
            character.level >= 17 ? 3 : character.level >= 13 ? 2 : 1,
            Number.isFinite(Number(record.indomitableUsesExpended))
              ? Math.floor(Number(record.indomitableUsesExpended))
              : 0
          )
        )
      : undefined,
    weaponMasteries: hasWeaponMastery
      ? normalizeWeaponMasterySelections(
          record.weaponMasteries,
          fighterWeaponMasteryOptions,
          weaponMasteryTotal
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
      : undefined
  };
}

export function getFighterActionSurgeUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE)) {
    return 0;
  }

  return character.level >= 17 ? 2 : 1;
}

export function getFighterActionSurgeUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getFighterActionSurgeUsesTotal(character);
  const usesExpended =
    normalizeFighterFeatureState(character.classFeatureState?.fighter, character)
      .actionSurgeUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getFighterExtraAttacksRemainingThisTurn(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  if (getFighterAdditionalAttackCount(character) <= 0) {
    return 0;
  }

  return (
    normalizeFighterFeatureState(character.classFeatureState?.fighter, character)
      .extraAttacksRemainingThisTurn ?? 0
  );
}

export function getFighterWeaponAttackMulti(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): boolean {
  return getFighterExtraAttacksRemainingThisTurn(character) > 0;
}

export function getFighterWeaponAttackMultiCount(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  return (
    (fighterState.extraAttacksRemainingThisTurn ?? 0) +
    (fighterState.actionSurgeExtraActionsRemainingThisTurn ?? 0)
  );
}

export function getFighterNonMagicActionMultiCount(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  return (
    normalizeFighterFeatureState(character.classFeatureState?.fighter, character)
      .actionSurgeExtraActionsRemainingThisTurn ?? 0
  );
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

export function getFighterIndomitableUsesTotal(
  character: Pick<Character, "className" | "level">
): number {
  if (!hasFighterFeature(character, CLASS_FEATURE.INDOMITABLE)) {
    return 0;
  }

  if (character.level >= 17) {
    return 3;
  }

  if (character.level >= 13) {
    return 2;
  }

  return 1;
}

export function getFighterIndomitableUsesRemaining(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): number {
  const totalUses = getFighterIndomitableUsesTotal(character);
  const usesExpended =
    normalizeFighterFeatureState(character.classFeatureState?.fighter, character)
      .indomitableUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getFighterFeatureActions(
  character: Pick<Character, "className" | "level" | "classFeatureState">
): FeatureActionCard[] {
  const actions: FeatureActionCard[] = [];

  if (hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE)) {
    const totalUses = getFighterActionSurgeUsesTotal(character);
    const usesRemaining = getFighterActionSurgeUsesRemaining(character);
    const fighterState = normalizeFighterFeatureState(
      character.classFeatureState?.fighter,
      character
    );
    const usedThisTurn = fighterState.actionSurgeUsedThisTurn === true;

    actions.push({
      key: fighterActionSurgeActionKey,
      name: "Action Surge",
      summary: "Gain one additional non-Magic action.",
      detail:
        "Use Action Surge to gain one additional non-Magic action this turn. Starting at level 17, you can use it twice before resting, but only once per turn.",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesLabel: `${usesRemaining}/${totalUses} uses`,
      usesRemaining,
      usesTotal: totalUses,
      disabled: usesRemaining <= 0 || usedThisTurn,
      disabledReason:
        usesRemaining <= 0
          ? "No Action Surge uses remaining."
          : usedThisTurn
            ? "Action Surge has already been used this turn."
            : undefined
    });
  }

  if (hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND)) {
    const totalUses = getFighterSecondWindUsesTotal(character);
    const usesRemaining = getFighterSecondWindUsesRemaining(character);
    const minimumHealing = character.level + 1;
    const maximumHealing = character.level + 10;

    actions.push({
      key: fighterSecondWindActionKey,
      name: "Second Wind",
      summary: `${minimumHealing}~${maximumHealing} Heal`,
      detail: "Use a Bonus Action to regain Hit Points equal to 1d10 plus your Fighter level.",
      economyType: ECONOMY_TYPE.BONUS_ACTION,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesLabel: `${usesRemaining}/${totalUses} uses`,
      usesRemaining,
      usesTotal: totalUses,
      drawer: {
        kind: "confirm",
        eyebrow: "Fighter",
        confirmLabel: "Use Second Wind"
      },
      execute: {
        kind: "activate",
        label: "Use Second Wind",
        effectKind: "second-wind"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Second Wind uses remaining." : undefined
    });
  }

  if (hasFighterFeature(character, CLASS_FEATURE.TACTICAL_MIND)) {
    const usesRemaining = getFighterSecondWindUsesRemaining(character);

    actions.push({
      key: fighterTacticalMindActionKey,
      name: "Tactical Mind",
      summary: "Roll 1d10 for an ability check.",
      detail:
        "Use Tactical Mind to expend one Second Wind use and roll 1d10 to add to an ability check.",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      usesLabel: "Uses Second Wind charges",
      drawer: {
        kind: "confirm",
        eyebrow: "Fighter",
        confirmLabel: "Use Tactical Mind"
      },
      execute: {
        kind: "activate",
        label: "Use Tactical Mind",
        effectKind: "tactical-mind"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Second Wind uses remaining." : undefined
    });
  }

  if (hasFighterFeature(character, CLASS_FEATURE.INDOMITABLE)) {
    const totalUses = getFighterIndomitableUsesTotal(character);
    const usesRemaining = getFighterIndomitableUsesRemaining(character);

    actions.push({
      key: fighterIndomitableActionKey,
      name: "Indomitable",
      summary: "Roll 1d10 + a saving throw + Fighter level.",
      detail:
        "Choose a saving throw, then reroll it with a bonus equal to 1d10 plus that saving throw and your Fighter level.",
      economyType: ECONOMY_TYPE.FREE,
      actionCategory: ACTION_CATEGORY.FEATURE,
      interaction: "select",
      usesLabel: `${usesRemaining}/${totalUses} uses`,
      usesRemaining,
      usesTotal: totalUses,
      drawer: {
        kind: "custom-form",
        eyebrow: "Fighter",
        formKind: "indomitable"
      },
      execute: {
        kind: "custom-form",
        formKind: "indomitable",
        label: "Roll Saving Throw"
      },
      disabled: usesRemaining <= 0,
      disabledReason: usesRemaining <= 0 ? "No Indomitable uses remaining." : undefined
    });
  }

  return actions;
}

export function consumeFighterSecondWindUse(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );
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

export function consumeFighterIndomitableUse(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.INDOMITABLE)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );
  const totalUses = getFighterIndomitableUsesTotal(character);
  const usesExpended = fighterState.indomitableUsesExpended ?? 0;

  if (usesExpended >= totalUses) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        indomitableUsesExpended: usesExpended + 1
      }
    }
  };
}

export function applyShortRestToFighterFeatures(character: Character): Character {
  if (
    !hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND) &&
    !hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE)
  ) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );
  const usesExpended = fighterState.secondWindUsesExpended ?? 0;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        secondWindUsesExpended: Math.max(0, usesExpended - 1),
        actionSurgeUsesExpended: 0,
        actionSurgeUsedThisTurn: false,
        actionSurgeExtraActionsRemainingThisTurn: 0,
        extraAttacksRemainingThisTurn: 0
      }
    }
  };
}

export function restoreFighterSecondWindOnShortRest(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );
  const usesExpended = fighterState.secondWindUsesExpended ?? 0;

  if (usesExpended <= 0) {
    return character;
  }

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

export function restoreFighterActionSurgeOnShortRest(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  if (
    (fighterState.actionSurgeUsesExpended ?? 0) === 0 &&
    fighterState.actionSurgeUsedThisTurn !== true &&
    (fighterState.actionSurgeExtraActionsRemainingThisTurn ?? 0) === 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        actionSurgeUsesExpended: 0,
        actionSurgeUsedThisTurn: false,
        actionSurgeExtraActionsRemainingThisTurn: 0
      }
    }
  };
}

export function applyLongRestToFighterFeatures(character: Character): Character {
  if (
    !hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND) &&
    !hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE) &&
    !hasFighterFeature(character, CLASS_FEATURE.INDOMITABLE)
  ) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        secondWindUsesExpended: 0,
        actionSurgeUsesExpended: 0,
        actionSurgeUsedThisTurn: false,
        actionSurgeExtraActionsRemainingThisTurn: 0,
        indomitableUsesExpended: 0,
        extraAttacksRemainingThisTurn: 0
      }
    }
  };
}

export function restoreFighterSecondWindOnLongRest(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.SECOND_WIND)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  if ((fighterState.secondWindUsesExpended ?? 0) === 0) {
    return character;
  }

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

export function restoreFighterActionSurgeOnLongRest(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  if (
    (fighterState.actionSurgeUsesExpended ?? 0) === 0 &&
    fighterState.actionSurgeUsedThisTurn !== true &&
    (fighterState.actionSurgeExtraActionsRemainingThisTurn ?? 0) === 0
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        actionSurgeUsesExpended: 0,
        actionSurgeUsedThisTurn: false,
        actionSurgeExtraActionsRemainingThisTurn: 0
      }
    }
  };
}

export function restoreFighterIndomitableOnLongRest(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.INDOMITABLE)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  if ((fighterState.indomitableUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        indomitableUsesExpended: 0
      }
    }
  };
}

export function advanceFighterFeaturesForNewRound(character: Character): Character {
  const hasExtraAttack = getFighterAdditionalAttackCount(character) > 0;
  const hasActionSurge = hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE);

  if (!hasExtraAttack && !hasActionSurge) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  if (
    (fighterState.extraAttacksRemainingThisTurn ?? 0) === 0 &&
    (fighterState.actionSurgeExtraActionsRemainingThisTurn ?? 0) === 0 &&
    fighterState.actionSurgeUsedThisTurn !== true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        actionSurgeUsedThisTurn: false,
        actionSurgeExtraActionsRemainingThisTurn: 0,
        extraAttacksRemainingThisTurn: 0
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
  return (
    normalizeFighterFeatureState(character.classFeatureState?.fighter, character).weaponMasteries ??
    []
  );
}

export function setFighterWeaponMasterySelections(
  character: Character,
  selections: WEAPON_PROFICIENCY[]
): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.WEAPON_MASTERY)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        weaponMasteries: normalizeWeaponMasterySelections(
          selections,
          fighterWeaponMasteryOptions,
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

export function consumeFighterWeaponAttack(character: Character): Character {
  if (character.className !== "Fighter") {
    return isRoundTrackerResourceAvailable(character.roundTracker, "action")
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, "action")
        }
      : character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );
  const extraAttacksRemaining = fighterState.extraAttacksRemainingThisTurn ?? 0;
  const surgedActionsRemaining = fighterState.actionSurgeExtraActionsRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");

  if (actionAvailable) {
    const additionalAttackCount = getFighterAdditionalAttackCount(character);

    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action"),
      classFeatureState: {
        ...character.classFeatureState,
        fighter: {
          ...fighterState,
          extraAttacksRemainingThisTurn: additionalAttackCount
        }
      }
    };
  }

  if (extraAttacksRemaining <= 0) {
    if (surgedActionsRemaining <= 0) {
      return character;
    }

    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        fighter: {
          ...fighterState,
          actionSurgeExtraActionsRemainingThisTurn: surgedActionsRemaining - 1
        }
      }
    };
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        extraAttacksRemainingThisTurn: extraAttacksRemaining - 1
      }
    }
  };
}

export function consumeFighterNonMagicAction(character: Character): Character {
  if (character.className !== "Fighter") {
    return isRoundTrackerResourceAvailable(character.roundTracker, "action")
      ? {
          ...character,
          roundTracker: consumeRoundTrackerResource(character.roundTracker, "action")
        }
      : character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );
  const surgedActionsRemaining = fighterState.actionSurgeExtraActionsRemainingThisTurn ?? 0;
  const actionAvailable = isRoundTrackerResourceAvailable(character.roundTracker, "action");

  if (actionAvailable) {
    return {
      ...character,
      roundTracker: consumeRoundTrackerResource(character.roundTracker, "action")
    };
  }

  if (surgedActionsRemaining <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        actionSurgeExtraActionsRemainingThisTurn: surgedActionsRemaining - 1
      }
    }
  };
}

export function activateFighterActionSurge(character: Character): Character {
  if (!hasFighterFeature(character, CLASS_FEATURE.ACTION_SURGE)) {
    return character;
  }

  const fighterState = normalizeFighterFeatureState(
    character.classFeatureState?.fighter,
    character
  );
  const usesRemaining = getFighterActionSurgeUsesRemaining(character);

  if (usesRemaining <= 0 || fighterState.actionSurgeUsedThisTurn) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        actionSurgeUsesExpended: (fighterState.actionSurgeUsesExpended ?? 0) + 1,
        actionSurgeUsedThisTurn: true,
        actionSurgeExtraActionsRemainingThisTurn:
          (fighterState.actionSurgeExtraActionsRemainingThisTurn ?? 0) + 1
      }
    }
  };
}
