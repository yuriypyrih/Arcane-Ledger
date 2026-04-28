import {
  CLASS_FEATURE,
  WEAPON_COMBAT_TYPE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY,
  getReactionEntryById
} from "../../../../../codex/entries";
import { getAbilityModifierForCharacter } from "../../../abilities";
import { appendFeatureSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { formatSignedLabel } from "../../../shared/numbers";
import type { Character, CharacterRageFeatureState } from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { normalizeRoundTracker, shouldTrackRoundScopedResources } from "../../../combat";
import type { WeaponAction } from "../../../gameplay";
import { swapTemporaryHitPointsAssignment } from "../../../shared";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { FeatureActionCard } from "../../types";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";

export const pathOfTheWorldTreeSubclassId = "barbarian-path-of-the-world-tree";
export const barbarianTravelAlongTheTreeActionKey = "barbarian-travel-along-the-tree";
export const barbarianWorldTreeBranchesOfTheTreeReactionId =
  "reaction-world-tree-branches-of-the-tree";
export const barbarianWorldTreeVitalitySurgeTemporaryHitPointsSource = "Vitality Surge";
const batteringRootsSource = "Battering Roots";

type BarbarianSubclassCharacter = Pick<Character, "className" | "level"> &
  Partial<Pick<Character, "subclassId">>;
type BarbarianWorldTreeFormulaCharacter = Pick<
  Character,
  "abilities" | "classFeatureState" | "className" | "feats" | "level"
> &
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

export function hasBarbarianPathOfTheWorldTreeBranchesOfTheTree(
  character: BarbarianSubclassCharacter
): boolean {
  return isBarbarianPathOfTheWorldTree(character) && character.level >= 6;
}

function getProficiencyBonusForLevel(level: number | undefined): number {
  return Math.floor((Math.max(1, level ?? 1) - 1) / 4) + 2;
}

export function getBarbarianPathOfTheWorldTreeBranchesOfTheTreeDcFormula(
  character: BarbarianWorldTreeFormulaCharacter
): string | null {
  if (!hasBarbarianPathOfTheWorldTreeBranchesOfTheTree(character)) {
    return null;
  }

  const strengthModifier = getAbilityModifierForCharacter(character, "STR");
  const proficiencyBonus = getProficiencyBonusForLevel(character.level);
  const total = 8 + strengthModifier + proficiencyBonus;

  return `${total} = 8 ${formatSignedLabel(strengthModifier, "STR")} ${formatSignedLabel(
    proficiencyBonus,
    "(Prof. Bonus)"
  )}`;
}

export function hasBarbarianPathOfTheWorldTreeBatteringRootsBonus(
  character: Pick<Character, "className" | "level" | "roundTracker"> &
    Partial<Pick<Character, "subclassId">>,
  context: BatteringRootsWeaponContext
): boolean {
  const roundTracker = normalizeRoundTracker(character.roundTracker);

  return (
    hasBarbarianPathOfTheWorldTreeBatteringRoots(character) &&
    (!shouldTrackRoundScopedResources(roundTracker) || roundTracker.turnStarted) &&
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

function appendBatteringRootsDescription(
  character: Parameters<SubclassRuntimeResolver>[0],
  action: WeaponAction,
  descriptionEntries: ReturnType<typeof getFeatureDescriptionForCharacter>
): WeaponAction {
  if (!action.isBatteringRootsEligible || descriptionEntries.length === 0) {
    return action;
  }

  return appendFeatureSourcedDescriptionAddition(
    action,
    character,
    CLASS_FEATURE.BATTERING_ROOTS,
    descriptionEntries,
    batteringRootsSource
  );
}

export function getBarbarianPathOfTheWorldTreeFeatureAction(
  character: BarbarianSubclassCharacter,
  rageState: CharacterRageFeatureState,
  _rageUsesRemaining: number
): FeatureActionCard | null {
  if (!hasBarbarianPathOfTheWorldTreeTravelAlongTheTree(character)) {
    return null;
  }

  const disabled = rageState.active !== true;

  return {
    key: barbarianTravelAlongTheTreeActionKey,
    name: "Travel Along the Tree",
    sourceFeature: CLASS_FEATURE.TRAVEL_ALONG_THE_TREE,
    summary: "Teleport while in Rage.",
    detail: "Teleport while in Rage.",
    breakdown: "Teleport while in Rage.",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    consumesEconomyOnActivate: true,
    disabled,
    disabledReason:
      rageState.active !== true ? "Travel Along the Tree requires Rage to be active." : undefined
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
    barbarianWorldTreeVitalitySurgeTemporaryHitPointsSource
  );
}

export function activateBarbarianPathOfTheWorldTreeTravelAlongTheTree(
  character: Character,
  rageState: CharacterRageFeatureState,
  _rageUsesRemaining: number
): Character {
  if (!hasBarbarianPathOfTheWorldTreeTravelAlongTheTree(character)) {
    return character;
  }

  if (rageState.active !== true) {
    return character;
  }

  return character;
}

export const getBarbarianPathOfTheWorldTreeDerivedFeatureState: SubclassRuntimeResolver = (
  character
) => {
  const normalizedCharacter = {
    className: character.className,
    subclassId: character.subclassId,
    level: character.level ?? 0
  };

  if (
    normalizedCharacter.className !== "Barbarian" ||
    normalizedCharacter.subclassId !== pathOfTheWorldTreeSubclassId ||
    normalizedCharacter.level < 6
  ) {
    return {};
  }

  const branchesOfTheTree = getReactionEntryById(barbarianWorldTreeBranchesOfTheTreeReactionId);
  const batteringRootsDescription = hasBarbarianPathOfTheWorldTreeBatteringRoots(
    normalizedCharacter
  )
    ? getFeatureDescriptionForCharacter(normalizedCharacter, CLASS_FEATURE.BATTERING_ROOTS)
    : [];

  return {
    ...(branchesOfTheTree ? { reactionEntries: [branchesOfTheTree] } : {}),
    ...(batteringRootsDescription.length > 0
      ? {
          transformWeaponAction: (action: WeaponAction) =>
            appendBatteringRootsDescription(character, action, batteringRootsDescription)
        }
      : {})
  };
};
