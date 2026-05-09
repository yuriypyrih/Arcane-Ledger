import type { Character } from "../../../../../../types";
import {
  createEconomyMultiContextForWeaponAction,
  getBonusActionWeaponAttackMultiCountForCharacter,
  getMonkUnarmedStrikeMultiCountForCharacter,
  getSharedEconomyMultiCountForCharacterAction,
  hasBattleMagicBonusWeaponAttackForCharacter
} from "../../../../../../pages/CharactersPage/classFeatures";
import { ECONOMY_TYPE, type EconomyType } from "../../../../../../pages/CharactersPage/actionEconomy";
import { shouldTrackRoundScopedResources } from "../../../../../../pages/CharactersPage/combat";
import type { WeaponAction } from "../../../../../../pages/CharactersPage/gameplay";
import {
  getLightWeaponFollowUpKind,
  type LightWeaponFollowUpKind
} from "../../../../../../pages/CharactersPage/weaponLightProperty";
import { getEconomyShapeState } from "../../gameplayWidgetUtils";

type RoundTrackerAvailability = {
  isInCombat?: boolean;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

type WeaponActionSecondaryEconomyCharacter = Pick<
  Character,
  "className" | "level" | "classFeatureState"
> &
  Partial<
    Pick<
      Character,
      "subclassId" | "statusEntries" | "equipment" | "inventoryItems" | "customEquipment"
    >
  >;

export type WeaponAttackPathState = {
  id: "primary" | "secondary";
  economyType: EconomyType;
  shapeState: ReturnType<typeof getEconomyShapeState>;
  additionalUseCount: number;
  totalUseCount: number;
  lightFollowUpKind?: LightWeaponFollowUpKind;
  usesLightFollowUp: boolean;
};

function isMonkMartialArtsUnarmedStrikeAction(
  character: Pick<Character, "className">,
  action: Pick<WeaponAction, "key" | "attackKind" | "hasMartialArtsDamageDie">
): boolean {
  return (
    character.className === "Monk" &&
    action.key === "unarmed-strike" &&
    action.attackKind === "unarmed" &&
    action.hasMartialArtsDamageDie
  );
}

export function hasSecondaryBonusWeaponAttackForCharacter(
  character: WeaponActionSecondaryEconomyCharacter,
  action: Pick<WeaponAction, "key" | "attackKind" | "hasMartialArtsDamageDie">
): boolean {
  return (
    hasBattleMagicBonusWeaponAttackForCharacter(character, action.attackKind) ||
    isMonkMartialArtsUnarmedStrikeAction(character, action)
  );
}

export function getSecondaryBonusWeaponAttackMultiCountForCharacter(
  character: WeaponActionSecondaryEconomyCharacter,
  action: Pick<WeaponAction, "key" | "attackKind" | "hasMartialArtsDamageDie">
): number {
  return (
    getBonusActionWeaponAttackMultiCountForCharacter(character, action.attackKind) +
    (isMonkMartialArtsUnarmedStrikeAction(character, action)
      ? getMonkUnarmedStrikeMultiCountForCharacter(character)
      : 0)
  );
}

function getTotalUseCount(
  shapeState: ReturnType<typeof getEconomyShapeState>,
  additionalUseCount: number
): number {
  return (shapeState.isAvailable ? 1 : 0) + additionalUseCount;
}

function getPrimaryWeaponAttackAdditionalUseCount(
  character: Character,
  action: WeaponAction,
  roundTracker: RoundTrackerAvailability,
  lightFollowUpKind: LightWeaponFollowUpKind | null
): number {
  if (!shouldTrackRoundScopedResources(roundTracker)) {
    return 0;
  }

  return (
    (action.economyMultiCount ?? 0) +
    getSharedEconomyMultiCountForCharacterAction(
      character,
      createEconomyMultiContextForWeaponAction(action)
    ) +
    (lightFollowUpKind === "nick" ? 1 : 0)
  );
}

export function getPrimaryWeaponAttackPathState(
  character: Character,
  action: WeaponAction,
  roundTracker: RoundTrackerAvailability
): WeaponAttackPathState {
  const lightFollowUpKind = getLightWeaponFollowUpKind(roundTracker, action);
  const additionalUseCount = getPrimaryWeaponAttackAdditionalUseCount(
    character,
    action,
    roundTracker,
    lightFollowUpKind
  );
  const shapeState = getEconomyShapeState(
    action.economyType,
    roundTracker,
    additionalUseCount
  );

  return {
    id: "primary",
    economyType: action.economyType,
    shapeState,
    additionalUseCount,
    totalUseCount: getTotalUseCount(shapeState, additionalUseCount),
    lightFollowUpKind: lightFollowUpKind === "nick" ? lightFollowUpKind : undefined,
    usesLightFollowUp:
      lightFollowUpKind === "nick" && !shapeState.isAvailable && shapeState.isUsable
  };
}

export function getSecondaryWeaponAttackPathState(
  character: Character,
  action: WeaponAction,
  roundTracker: RoundTrackerAvailability
): WeaponAttackPathState | null {
  if (!shouldTrackRoundScopedResources(roundTracker)) {
    return null;
  }

  const lightFollowUpKind = getLightWeaponFollowUpKind(roundTracker, action);
  const hasFeatureSecondaryPath = hasSecondaryBonusWeaponAttackForCharacter(character, action);

  if (!hasFeatureSecondaryPath && lightFollowUpKind !== "bonus") {
    return null;
  }

  const additionalUseCount = hasFeatureSecondaryPath
    ? getSecondaryBonusWeaponAttackMultiCountForCharacter(character, action)
    : 0;
  const shapeState = getEconomyShapeState(
    ECONOMY_TYPE.BONUS_ACTION,
    roundTracker,
    additionalUseCount
  );

  return {
    id: "secondary",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    shapeState,
    additionalUseCount,
    totalUseCount: getTotalUseCount(shapeState, additionalUseCount),
    lightFollowUpKind: lightFollowUpKind === "bonus" ? lightFollowUpKind : undefined,
    usesLightFollowUp: lightFollowUpKind === "bonus" && shapeState.isAvailable
  };
}

export function getWeaponAttackPathStates(
  character: Character,
  action: WeaponAction,
  roundTracker: RoundTrackerAvailability
): WeaponAttackPathState[] {
  const primaryPath = getPrimaryWeaponAttackPathState(character, action, roundTracker);
  const secondaryPath = getSecondaryWeaponAttackPathState(character, action, roundTracker);

  return secondaryPath ? [primaryPath, secondaryPath] : [primaryPath];
}
