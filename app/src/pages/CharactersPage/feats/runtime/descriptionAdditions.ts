import {
  FEATS,
  WEAPON_BASE,
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY,
  type SpellDescriptionEntry
} from "../../../../codex/entries";
import type { AbilityKey, Character } from "../../../../types";
import type { FeatureActionCard } from "../../classFeatures/types";
import { getFeatureDescriptionAdditions } from "../../featureContributions";
import { getFeatLabel } from "..";
import { featDescriptionTargetKeys } from "./descriptionContributions";
import { collectFeatDerivedState, hasFeatForCharacter } from "./state";
import type { FeatRuntimeCharacter } from "./types";

type ChargerWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
};

type ArcheryWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
};

type DuelingWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
};

type EpicBoonWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
};

type ThrownWeaponFightingWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  properties?: WEAPON_PROPERTY[];
};

type TwoWeaponFightingWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  properties?: WEAPON_PROPERTY[];
};

type UnarmedFightingWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
};

type CrusherWeaponActionContext = {
  damageLabel: string;
};

type DamageTypedWeaponActionContext = {
  damageLabel: string;
};

type DualWielderWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  properties?: WEAPON_PROPERTY[];
};

type GreatWeaponMasterWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
  properties?: WEAPON_PROPERTY[];
};

type PolearmMasterWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  baseWeapon?: WEAPON_BASE | null;
  properties?: WEAPON_PROPERTY[];
};

type CrossbowExpertWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  baseWeapon?: WEAPON_BASE | null;
};

type SharpshooterWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
};

type ShieldMasterWeaponActionContext = {
  attackKind: "weapon" | "unarmed";
  combatType?: WEAPON_COMBAT_TYPE | null;
};

const crossbowExpertBaseWeapons = new Set<WEAPON_BASE>([
  WEAPON_BASE.LIGHT_CROSSBOW,
  WEAPON_BASE.HAND_CROSSBOW,
  WEAPON_BASE.HEAVY_CROSSBOW
]);

function isChargerMeleeWeaponAction(action: ChargerWeaponActionContext): boolean {
  return (
    action.attackKind === "unarmed" ||
    (action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.MELEE)
  );
}

function isArcheryWeaponAction(action: ArcheryWeaponActionContext): boolean {
  return action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.RANGED;
}

function isDuelingWeaponAction(action: DuelingWeaponActionContext): boolean {
  return action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.MELEE;
}

function isEpicBoonWeaponAction(action: EpicBoonWeaponActionContext): boolean {
  return action.attackKind === "weapon";
}

function isThrownWeaponFightingWeaponAction(
  action: ThrownWeaponFightingWeaponActionContext
): boolean {
  return (
    action.attackKind === "weapon" && (action.properties ?? []).includes(WEAPON_PROPERTY.THROWN)
  );
}

function isTwoWeaponFightingWeaponAction(action: TwoWeaponFightingWeaponActionContext): boolean {
  return (
    action.attackKind === "weapon" && (action.properties ?? []).includes(WEAPON_PROPERTY.LIGHT)
  );
}

function isUnarmedFightingWeaponAction(action: UnarmedFightingWeaponActionContext): boolean {
  return action.attackKind === "unarmed";
}

function isCrossbowExpertWeaponAction(action: CrossbowExpertWeaponActionContext): boolean {
  return (
    action.attackKind === "weapon" &&
    typeof action.baseWeapon === "string" &&
    crossbowExpertBaseWeapons.has(action.baseWeapon)
  );
}

function isSharpshooterWeaponAction(action: SharpshooterWeaponActionContext): boolean {
  return action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.RANGED;
}

function isShieldMasterWeaponAction(action: ShieldMasterWeaponActionContext): boolean {
  return action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.MELEE;
}

function isCrusherWeaponAction(action: CrusherWeaponActionContext): boolean {
  return /\bbludgeoning\b/i.test(action.damageLabel);
}

function isPiercerWeaponAction(action: DamageTypedWeaponActionContext): boolean {
  return /\bpiercing\b/i.test(action.damageLabel);
}

function isPoisonerWeaponAction(action: DamageTypedWeaponActionContext): boolean {
  return /\bpoison\b/i.test(action.damageLabel);
}

function isSlasherWeaponAction(action: DamageTypedWeaponActionContext): boolean {
  return /\bslashing\b/i.test(action.damageLabel);
}

function isBoonOfIrresistibleOffenseWeaponAction(action: DamageTypedWeaponActionContext): boolean {
  return /\b(?:bludgeoning|piercing|slashing)\b/i.test(action.damageLabel);
}

function isDualWielderWeaponAction(action: DualWielderWeaponActionContext): boolean {
  return (
    action.attackKind === "weapon" && (action.properties ?? []).includes(WEAPON_PROPERTY.LIGHT)
  );
}

function isGreatWeaponMasterHeavyWeaponAction(
  action: GreatWeaponMasterWeaponActionContext
): boolean {
  return (
    action.attackKind === "weapon" && (action.properties ?? []).includes(WEAPON_PROPERTY.HEAVY)
  );
}

function isGreatWeaponMasterMeleeWeaponAction(
  action: GreatWeaponMasterWeaponActionContext
): boolean {
  return action.attackKind === "weapon" && action.combatType === WEAPON_COMBAT_TYPE.MELEE;
}

function isPolearmMasterWeaponAction(action: PolearmMasterWeaponActionContext): boolean {
  if (action.attackKind !== "weapon") {
    return false;
  }

  if (action.baseWeapon === WEAPON_BASE.QUARTERSTAFF || action.baseWeapon === WEAPON_BASE.SPEAR) {
    return true;
  }

  const properties = action.properties ?? [];

  return properties.includes(WEAPON_PROPERTY.HEAVY) && properties.includes(WEAPON_PROPERTY.REACH);
}

function getFeatDescriptionAdditionsForTarget(
  character: FeatRuntimeCharacter,
  target: Parameters<typeof getFeatureDescriptionAdditions>[1],
  targetKey: string
): SpellDescriptionEntry[][] {
  return getFeatureDescriptionAdditions(collectFeatDerivedState(character), target, {
    targetKey
  });
}

function getFeatDescriptionEntriesForTarget(
  character: FeatRuntimeCharacter,
  target: Parameters<typeof getFeatureDescriptionAdditions>[1],
  targetKey: string
): SpellDescriptionEntry[] {
  return getFeatDescriptionAdditionsForTarget(character, target, targetKey).flat();
}

export function getAthleteSpeedDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "stat",
    featDescriptionTargetKeys.speed
  );
}

export function getChargerDashDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "commonAction",
    featDescriptionTargetKeys.commonActionChargerDash
  );
}

export function getSpeedyDashDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "commonAction",
    featDescriptionTargetKeys.commonActionSpeedyDash
  );
}

export function getBoonOfSpeedDisengageDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "commonAction",
    featDescriptionTargetKeys.commonActionBoonOfSpeedDisengage
  );
}

export function hasBoonOfSpeedDisengageBonusActionPath(
  character: FeatRuntimeCharacter,
  actionKey: string
): boolean {
  return (
    actionKey === "common-action-disengage" &&
    getFeatDescriptionAdditionsForTarget(
      character,
      "commonAction",
      featDescriptionTargetKeys.commonActionBoonOfSpeedDisengage
    ).length > 0
  );
}

export function getChargerWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: ChargerWeaponActionContext
): SpellDescriptionEntry[][] {
  return isChargerMeleeWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponChargerChargeAttack
      )
    : [];
}

export function getArcheryWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: ArcheryWeaponActionContext
): SpellDescriptionEntry[][] {
  return isArcheryWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponArchery
      )
    : [];
}

export function getDuelingWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DuelingWeaponActionContext
): SpellDescriptionEntry[][] {
  return isDuelingWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponDueling
      )
    : [];
}

export function getBoonOfCombatProwessWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: EpicBoonWeaponActionContext
): SpellDescriptionEntry[][] {
  return isEpicBoonWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponBoonOfCombatProwess
      )
    : [];
}

export function getBoonOfDimensionalTravelWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: EpicBoonWeaponActionContext
): SpellDescriptionEntry[][] {
  return isEpicBoonWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponBoonOfDimensionalTravel
      )
    : [];
}

export function getBoonOfIrresistibleOffenseWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DamageTypedWeaponActionContext
): SpellDescriptionEntry[][] {
  return isBoonOfIrresistibleOffenseWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponBoonOfIrresistibleOffense
      )
    : [];
}

export function getThrownWeaponFightingWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: ThrownWeaponFightingWeaponActionContext
): SpellDescriptionEntry[][] {
  return isThrownWeaponFightingWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponThrownWeaponFighting
      )
    : [];
}

export function getTwoWeaponFightingWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: TwoWeaponFightingWeaponActionContext
): SpellDescriptionEntry[][] {
  return isTwoWeaponFightingWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponTwoWeaponFighting
      )
    : [];
}

export function getUnarmedFightingWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: UnarmedFightingWeaponActionContext
): SpellDescriptionEntry[][] {
  return isUnarmedFightingWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponUnarmedFighting
      )
    : [];
}

export function getCrusherWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: CrusherWeaponActionContext
): SpellDescriptionEntry[][] {
  return isCrusherWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponCrusher
      )
    : [];
}

export function getPiercerWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DamageTypedWeaponActionContext
): SpellDescriptionEntry[][] {
  return isPiercerWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponPiercer
      )
    : [];
}

export function getSlasherWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DamageTypedWeaponActionContext
): SpellDescriptionEntry[][] {
  return isSlasherWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponSlasher
      )
    : [];
}

export function getPoisonerWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DamageTypedWeaponActionContext
): SpellDescriptionEntry[][] {
  return isPoisonerWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponPoisoner
      )
    : [];
}

export function getDualWielderWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DualWielderWeaponActionContext
): SpellDescriptionEntry[][] {
  return isDualWielderWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponDualWielder
      )
    : [];
}

export function getGreatWeaponMasterWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: GreatWeaponMasterWeaponActionContext
): SpellDescriptionEntry[][] {
  return [
    ...(isGreatWeaponMasterHeavyWeaponAction(action)
      ? getFeatDescriptionAdditionsForTarget(
          character,
          "weaponAction",
          featDescriptionTargetKeys.weaponGreatWeaponMasterHeavy
        )
      : []),
    ...(isGreatWeaponMasterMeleeWeaponAction(action)
      ? getFeatDescriptionAdditionsForTarget(
          character,
          "weaponAction",
          featDescriptionTargetKeys.weaponGreatWeaponMasterHew
        )
      : [])
  ];
}

export function getPolearmMasterWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: PolearmMasterWeaponActionContext
): SpellDescriptionEntry[][] {
  return isPolearmMasterWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponPolearmMaster
      )
    : [];
}

export function getCrossbowExpertWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: CrossbowExpertWeaponActionContext
): SpellDescriptionEntry[][] {
  return isCrossbowExpertWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponCrossbowExpert
      )
    : [];
}

export function getSharpshooterWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: SharpshooterWeaponActionContext
): SpellDescriptionEntry[][] {
  return isSharpshooterWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponSharpshooter
      )
    : [];
}

export function getShieldMasterWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: ShieldMasterWeaponActionContext
): SpellDescriptionEntry[][] {
  return isShieldMasterWeaponAction(action)
    ? getFeatDescriptionAdditionsForTarget(
        character,
        "weaponAction",
        featDescriptionTargetKeys.weaponShieldMaster
      )
    : [];
}

export function getChefShortRestDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "rest",
    featDescriptionTargetKeys.shortRest
  ).filter((section) =>
    section.some((entry) =>
      typeof entry === "string" ? entry.includes("<strong>Chef.") : false
    )
  );
}

export function getChefLongRestDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "rest",
    featDescriptionTargetKeys.longRest
  ).filter((section) =>
    section.some((entry) =>
      typeof entry === "string" ? entry.includes("<strong>Chef.") : false
    )
  );
}

export function getInspiringLeaderRestDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "rest",
    featDescriptionTargetKeys.shortRest
  ).filter((section) =>
    section.some((entry) =>
      typeof entry === "string" ? entry.includes(getFeatLabel(FEATS.INSPIRING_LEADER)) : false
    )
  );
}

export function getWeaponMasterLongRestDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "rest",
    featDescriptionTargetKeys.longRest
  ).filter((section) =>
    section.some((entry) =>
      typeof entry === "string" ? entry.includes(getFeatLabel(FEATS.WEAPON_MASTER)) : false
    )
  );
}

export function getKeenMindStudyDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "commonAction",
    featDescriptionTargetKeys.commonActionKeenMindStudy
  );
}

export function getObservantSearchDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "commonAction",
    featDescriptionTargetKeys.commonActionObservantSearch
  );
}

export function getSkulkerHideDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "commonAction",
    featDescriptionTargetKeys.commonActionSkulkerHide
  );
}

export function getEmeraldEnclaveFledglingTagTeamDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "commonAction",
    featDescriptionTargetKeys.commonActionEmeraldEnclaveHelp
  );
}

export function getHarperAgentDistractingMelodyDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "commonAction",
    featDescriptionTargetKeys.commonActionHarperAgentHelp
  );
}

export function getPurpleDragonRookRallyingCryDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "initiative",
    featDescriptionTargetKeys.initiativeRallyingCry
  );
}

export function getTyroOfTheGauntletVigilantDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "commonAction",
    featDescriptionTargetKeys.commonActionTyroReady
  );
}

export function getZhentarimRuffianFamilyFirstDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "initiative",
    featDescriptionTargetKeys.initiativeFamilyFirst
  );
}

export function getMageSlayerGuardedMindDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  ability: AbilityKey
): SpellDescriptionEntry[][] {
  if (ability !== "INT" && ability !== "WIS" && ability !== "CHA") {
    return [];
  }

  return getFeatDescriptionAdditionsForTarget(character, "stat", `savingThrow:${ability}`);
}

export function getShieldMasterInterposeShieldDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  ability: AbilityKey
): SpellDescriptionEntry[][] {
  if (ability !== "DEX") {
    return [];
  }

  return getFeatDescriptionAdditionsForTarget(
    character,
    "stat",
    featDescriptionTargetKeys.savingThrowDex
  );
}

export function getWarCasterConcentrationDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  ability: AbilityKey
): SpellDescriptionEntry[][] {
  if (ability !== "CON") {
    return [];
  }

  return getFeatDescriptionAdditionsForTarget(
    character,
    "stat",
    featDescriptionTargetKeys.savingThrowConcentration
  );
}

export function getMageSlayerGuardedMindStateForCharacter(character: FeatRuntimeCharacter): {
  available: boolean;
  expended: boolean;
  usesRemaining: number;
  usesTotal: number;
} | null {
  const derivedState = collectFeatDerivedState(character);

  if (!derivedState.hasMageSlayer || derivedState.mageSlayerGuardedMindTotal <= 0) {
    return null;
  }

  return {
    available: derivedState.mageSlayerGuardedMindRemaining > 0,
    expended: derivedState.mageSlayerGuardedMindRemaining <= 0,
    usesRemaining: derivedState.mageSlayerGuardedMindRemaining,
    usesTotal: derivedState.mageSlayerGuardedMindTotal
  };
}

export function getMediumArmorMasterArmorClassDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "stat",
    featDescriptionTargetKeys.armorClass
  );
}

export function hasMediumArmorMasterForCharacter(character: FeatRuntimeCharacter): boolean {
  return hasFeatForCharacter(character, FEATS.MEDIUM_ARMOR_MASTER);
}

export function hasZhentarimRuffianForCharacter(character: FeatRuntimeCharacter): boolean {
  return hasFeatForCharacter(character, FEATS.ZHENTARIM_RUFFIAN);
}

export function hasKeenMindStudyBonusActionPath(
  character: FeatRuntimeCharacter,
  actionKey: string
): boolean {
  return (
    actionKey === "common-action-study" &&
    getFeatDescriptionAdditionsForTarget(
      character,
      "commonAction",
      featDescriptionTargetKeys.commonActionKeenMindStudy
    ).length > 0
  );
}

export function hasObservantSearchBonusActionPath(
  character: FeatRuntimeCharacter,
  actionKey: string
): boolean {
  return (
    actionKey === "common-action-search" &&
    getFeatDescriptionAdditionsForTarget(
      character,
      "commonAction",
      featDescriptionTargetKeys.commonActionObservantSearch
    ).length > 0
  );
}

export function transformFeatWeaponActionForCharacter<
  T extends ArcheryWeaponActionContext & {
    attackBonusEntries?: Array<{
      label: string;
      value: number;
    }>;
  }
>(character: FeatRuntimeCharacter, action: T): T {
  return collectFeatDerivedState(character).weaponActionTransforms.reduce(
    (currentAction, contribution) =>
      contribution.transform(character as Character, currentAction) as T,
    action
  );
}

export function transformFeatCommonActionForCharacter<T extends Pick<FeatureActionCard, "key">>(
  character: FeatRuntimeCharacter,
  action: T & Pick<FeatureActionCard, "descriptionAdditions">
): T & Pick<FeatureActionCard, "descriptionAdditions"> {
  return collectFeatDerivedState(character).commonActionTransforms.reduce(
    (currentAction, contribution) =>
      contribution.transform(character as Character, currentAction) as unknown as T &
        Pick<FeatureActionCard, "descriptionAdditions">,
    action
  );
}

export function getSavageAttackerWeaponActionDescriptionAdditions(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "weaponAction",
    featDescriptionTargetKeys.weaponSavageAttacker
  );
}

export function getTavernBrawlerUnarmedStrikeDescriptionAdditions(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  return getFeatDescriptionAdditionsForTarget(
    character,
    "weaponAction",
    featDescriptionTargetKeys.weaponTavernBrawler
  );
}

export function getMusicianEncouragingSongDescriptionEntriesForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[] {
  return getFeatDescriptionEntriesForTarget(
    character,
    "rest",
    featDescriptionTargetKeys.musicianEncouragingSong
  );
}
