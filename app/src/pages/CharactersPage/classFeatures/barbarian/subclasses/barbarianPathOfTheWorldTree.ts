import {
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  getReactionEntryById
} from "../../../../../codex/entries";
import type { Character, CharacterRageFeatureState } from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { normalizeRoundTracker } from "../../../combat";
import { swapTemporaryHitPointsAssignment } from "../../../shared";
import type { FeatureActionCard } from "../../types";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";

export const pathOfTheWorldTreeSubclassId = "barbarian-path-of-the-world-tree";
export const barbarianTravelAlongTheTreeActionKey = "barbarian-travel-along-the-tree";

type BarbarianSubclassCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;

export type BatteringRootsWeaponContext = {
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
    properties.includes(WEAPON_PROPERTY.HEAVY) || properties.includes(WEAPON_PROPERTY.VERSATILE)
  );
}

export function isBarbarianPathOfTheWorldTree(character: BarbarianSubclassCharacter): boolean {
  return (
    character.className === "Barbarian" &&
    character.subclassId === pathOfTheWorldTreeSubclassId &&
    character.level >= 3
  );
}

export function hasBarbarianPathOfTheWorldTreeVitalityOfTheTree(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheWorldTree(character);
}

export function hasBarbarianPathOfTheWorldTreeBatteringRoots(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheWorldTree(character) && character.level >= 10;
}

export function hasBarbarianPathOfTheWorldTreeTravelAlongTheTree(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheWorldTree(character) && character.level >= 14;
}

export function hasBarbarianPathOfTheWorldTreeBatteringRootsBonus(
  character: Pick<Character, "className" | "level" | "roundTracker"> &
    Partial<Pick<Character, "subclassId">>,
  context: BatteringRootsWeaponContext
): boolean {
  return (
    hasBarbarianPathOfTheWorldTreeBatteringRoots(character) &&
    normalizeRoundTracker(character.roundTracker).turnStarted &&
    isBatteringRootsEligibleWeapon(context)
  );
}

export function getBarbarianPathOfTheWorldTreeAdditionalWeaponMasteries(
  character: BarbarianSubclassCharacter,
  context: BatteringRootsWeaponContext
): Array<{
  mastery: WEAPON_MASTERY;
  source: string;
}> {
  if (
    !hasBarbarianPathOfTheWorldTreeBatteringRoots(character) ||
    !isBatteringRootsEligibleWeapon(context)
  ) {
    return [];
  }

  return [
    {
      mastery: WEAPON_MASTERY.PUSH,
      source: "Battering Roots"
    }
  ];
}

export function getBarbarianPathOfTheWorldTreeFeatureAction(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState,
  rageUsesRemaining: number
): FeatureActionCard | null {
  if (!hasBarbarianPathOfTheWorldTreeTravelAlongTheTree(character)) {
    return null;
  }

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

export function getBarbarianPathOfTheWorldTreeRageTemporaryHitPointsAssignment(
  character: Pick<
    Character,
    "className" | "level" | "temporaryHitPoints" | "temporaryHitPointsSource"
  > &
    Partial<Pick<Character, "subclassId">>
): Pick<Character, "temporaryHitPoints" | "temporaryHitPointsSource"> {
  const vitalityOfTheTreeTemporaryHitPoints = hasBarbarianPathOfTheWorldTreeVitalityOfTheTree(
    character
  )
    ? Math.floor(Math.max(0, character.level))
    : 0;

  if (vitalityOfTheTreeTemporaryHitPoints <= 0) {
    return {
      temporaryHitPoints: character.temporaryHitPoints,
      temporaryHitPointsSource: character.temporaryHitPointsSource
    };
  }

  return swapTemporaryHitPointsAssignment(
    character.temporaryHitPoints,
    character.temporaryHitPointsSource,
    vitalityOfTheTreeTemporaryHitPoints,
    "Vitality Surge"
  );
}

export function activateBarbarianPathOfTheWorldTreeTravelAlongTheTree(
  character: Character,
  rageState: CharacterRageFeatureState,
  rageUsesRemaining: number
): Character {
  if (!hasBarbarianPathOfTheWorldTreeTravelAlongTheTree(character)) {
    return character;
  }

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

export const getBarbarianPathOfTheWorldTreeDerivedFeatureState: SubclassRuntimeResolver = (
  character
) => {
  if (
    character.className !== "Barbarian" ||
    character.subclassId !== pathOfTheWorldTreeSubclassId ||
    (character.level ?? 0) < 6
  ) {
    return {};
  }

  const branchesOfTheTree = getReactionEntryById("reaction-world-tree-branches-of-the-tree");

  return branchesOfTheTree ? { reactionEntries: [branchesOfTheTree] } : {};
};
