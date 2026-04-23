import { monkFeatures, type MonkFeatureClassObj } from "../../../../codex/classes";
import {
  CLASS_FEATURE,
  type WEAPON_COMBAT_TYPE,
  type WEAPON_PROPERTY,
  type WEAPON_TRAINING
} from "../../../../codex/entries";
import type { Character } from "../../../../types";
import { isMonkWeapon } from "../../monkWeapons";
import { getFeatureDescriptionForCharacter } from "../featureDescriptions";
import type { WeaponAction } from "../../gameplay";

const stunningStrikeFocusCost = 1;

type MonkStunningStrikeCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>;

type MonkStunningStrikeWeaponAction = Pick<
  WeaponAction,
  "attackKind" | "key" | "combatType" | "weaponTraining" | "properties"
>;

export type MonkStunningStrikeOptionState = {
  focusPointCost: number;
  disabled: boolean;
  disabledReason?: string;
};

function getMonkFeatureRow(level: number | undefined): MonkFeatureClassObj | null {
  if (!Number.isFinite(level)) {
    return null;
  }

  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level ?? 0)));
  const matchingRows = monkFeatures
    .filter((row) => row.level <= normalizedLevel)
    .sort((left, right) => left.level - right.level);

  return matchingRows.length > 0 ? (matchingRows[matchingRows.length - 1] ?? null) : null;
}

function hasMonkStunningStrikeFeature(character: MonkStunningStrikeCharacter): boolean {
  return (
    character.className === "Monk" &&
    getFeatureDescriptionForCharacter(
      {
        className: character.className,
        level: character.level ?? 0,
        subclassId: character.subclassId
      },
      CLASS_FEATURE.STUNNING_STRIKE
    ).length > 0
  );
}

function getMonkFocusPointsTotal(character: MonkStunningStrikeCharacter): number {
  return getMonkFeatureRow(character.level)?.focusPoints ?? 0;
}

function getMonkFocusPointsRemaining(character: MonkStunningStrikeCharacter): number {
  const totalFocusPoints = getMonkFocusPointsTotal(character);
  const rawFocusPointsExpended = Number(character.classFeatureState?.monk?.focusPointsExpended);
  const focusPointsExpended = Number.isFinite(rawFocusPointsExpended)
    ? Math.max(0, Math.floor(rawFocusPointsExpended))
    : 0;

  return Math.max(0, totalFocusPoints - focusPointsExpended);
}

function isMonkUnarmedStrikeAction(action: MonkStunningStrikeWeaponAction | null): boolean {
  return Boolean(action && action.key === "unarmed-strike" && action.attackKind === "unarmed");
}

function isMonkWeaponAction(action: MonkStunningStrikeWeaponAction | null): boolean {
  if (
    !action ||
    action.attackKind !== "weapon" ||
    !action.weaponTraining ||
    !action.combatType
  ) {
    return false;
  }

  return isMonkWeapon({
    type: {
      training: action.weaponTraining as WEAPON_TRAINING,
      combat: action.combatType as WEAPON_COMBAT_TYPE
    },
    properties: (action.properties ?? []) as WEAPON_PROPERTY[]
  });
}

export function canUseMonkStunningStrikeWithAction(
  action: MonkStunningStrikeWeaponAction | null
): boolean {
  return isMonkUnarmedStrikeAction(action) || isMonkWeaponAction(action);
}

export function getMonkStunningStrikeOptionState(
  character: MonkStunningStrikeCharacter,
  action: MonkStunningStrikeWeaponAction | null
): MonkStunningStrikeOptionState | null {
  if (!hasMonkStunningStrikeFeature(character) || !canUseMonkStunningStrikeWithAction(action)) {
    return null;
  }

  const focusPointsRemaining = getMonkFocusPointsRemaining(character);
  const disabledReason =
    character.classFeatureState?.monk?.stunningStrikeUsedThisTurn === true
      ? "Stunning Strike has already been used this turn."
      : focusPointsRemaining < stunningStrikeFocusCost
        ? "No Focus Points remaining."
        : undefined;

  return {
    focusPointCost: stunningStrikeFocusCost,
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

export function consumeMonkStunningStrike(character: Character): Character {
  const optionState = getMonkStunningStrikeOptionState(character, {
    key: "unarmed-strike",
    attackKind: "unarmed",
    combatType: null,
    weaponTraining: null,
    properties: []
  });

  if (!optionState || optionState.disabled) {
    return character;
  }

  const totalFocusPoints = getMonkFocusPointsTotal(character);
  const monkState = character.classFeatureState?.monk ?? {};
  const rawFocusPointsExpended = Number(monkState.focusPointsExpended);
  const focusPointsExpended = Number.isFinite(rawFocusPointsExpended)
    ? Math.max(0, Math.floor(rawFocusPointsExpended))
    : 0;

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      monk: {
        ...monkState,
        focusPointsExpended: Math.min(totalFocusPoints, focusPointsExpended + stunningStrikeFocusCost),
        stunningStrikeUsedThisTurn: true
      }
    }
  };
}
