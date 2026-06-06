import {
  FEATS,
  WEAPON_BASE,
  WEAPON_COMBAT_TYPE,
  WEAPON_PROPERTY,
  type SpellDescriptionEntry
} from "../../../../codex/entries";
import type { AbilityKey } from "../../../../types";
import { createSourcedDescriptionEntries } from "../../actionModalDescriptions";
import type { FeatureActionCard } from "../../classFeatures/types";
import { getFeatDefinition, getFeatLabel } from "..";
import {
  filterDescriptionEntries,
  isArcheryWeaponActionDescriptionEntry,
  isBoonOfCombatProwessPeerlessAimDescriptionEntry,
  isBoonOfDimensionalTravelBlinkStepsDescriptionEntry,
  isBoonOfIrresistibleOffenseDescriptionEntry,
  isBoonOfSpeedEscapeArtistDescriptionEntry,
  isChargerChargeAttackDescriptionEntry,
  isChargerImprovedDashDescriptionEntry,
  isChefBolsteringTreatsDescriptionEntry,
  isChefReplenishingMealDescriptionEntry,
  isCrossbowExpertDescriptionEntry,
  isCrusherWeaponActionDescriptionEntry,
  isDualWielderEnhancedDualWieldingDescriptionEntry,
  isDuelingWeaponActionDescriptionEntry,
  isEmeraldEnclaveFledglingTagTeamDescriptionEntry,
  isGreatWeaponMasterHeavyWeaponMasteryDescriptionEntry,
  isGreatWeaponMasterHewDescriptionEntry,
  isHarperAgentDistractingMelodyDescriptionEntry,
  isInspiringLeaderBolsteringPerformanceDescriptionEntry,
  isKeenMindQuickStudyDescriptionEntry,
  isMageSlayerGuardedMindDescriptionEntry,
  isMediumArmorMasterDexterousWearerDescriptionEntry,
  isObservantQuickSearchDescriptionEntry,
  isPiercerWeaponActionDescriptionEntry,
  isPoisonerPotentPoisonDescriptionEntry,
  isPolearmMasterPoleStrikeDescriptionEntry,
  isPurpleDragonRookRallyingCryDescriptionEntry,
  isSharpshooterDescriptionEntry,
  isShieldMasterInterposeShieldDescriptionEntry,
  isShieldMasterShieldBashDescriptionEntry,
  isSkulkerHideDescriptionEntry,
  isSlasherWeaponActionDescriptionEntry,
  isSpeedyDashOverDifficultTerrainDescriptionEntry,
  isThrownWeaponFightingWeaponActionDescriptionEntry,
  isTyroOfTheGauntletVigilantDescriptionEntry,
  isTwoWeaponFightingWeaponActionDescriptionEntry,
  isUnarmedFightingWeaponActionDescriptionEntry,
  isWarCasterConcentrationDescriptionEntry,
  isWeaponMasterMasteryPropertyDescriptionEntry,
  isZhentarimRuffianFamilyFirstDescriptionEntry
} from "./descriptionMatchers";
import { collectFeatDerivedState, getFeatDescriptionSlice, hasFeatForCharacter } from "./state";
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

export function getAthleteSpeedDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.ATHLETE)) {
    return [];
  }

  const athleteDescription = getFeatDescriptionSlice(
    FEATS.ATHLETE,
    (descriptionEntry) =>
      descriptionEntry.startsWith("<strong>Hop Up.</strong>") ||
      descriptionEntry.startsWith("<strong>Jumping.</strong>")
  );

  return athleteDescription.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.ATHLETE), athleteDescription)]
    : [];
}

export function getChargerDashDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.CHARGER)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.CHARGER, isChargerImprovedDashDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.CHARGER), description)]
    : [];
}

export function getSpeedyDashDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.SPEEDY)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.SPEEDY,
    isSpeedyDashOverDifficultTerrainDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.SPEEDY), description)]
    : [];
}

export function getBoonOfSpeedDisengageDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.BOON_OF_SPEED)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.BOON_OF_SPEED,
    isBoonOfSpeedEscapeArtistDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.BOON_OF_SPEED), description)]
    : [];
}

export function hasBoonOfSpeedDisengageBonusActionPath(
  character: FeatRuntimeCharacter,
  actionKey: string
): boolean {
  return (
    actionKey === "common-action-disengage" && hasFeatForCharacter(character, FEATS.BOON_OF_SPEED)
  );
}

export function getChargerWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: ChargerWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.CHARGER) || !isChargerMeleeWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.CHARGER, isChargerChargeAttackDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.CHARGER), description)]
    : [];
}

export function getArcheryWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: ArcheryWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.ARCHERY) || !isArcheryWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.ARCHERY, isArcheryWeaponActionDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.ARCHERY), description)]
    : [];
}

export function getDuelingWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DuelingWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.DUELING) || !isDuelingWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.DUELING, isDuelingWeaponActionDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.DUELING), description)]
    : [];
}

export function getBoonOfCombatProwessWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: EpicBoonWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.BOON_OF_COMBAT_PROWESS) ||
    !isEpicBoonWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.BOON_OF_COMBAT_PROWESS,
    isBoonOfCombatProwessPeerlessAimDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.BOON_OF_COMBAT_PROWESS), description)]
    : [];
}

export function getBoonOfDimensionalTravelWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: EpicBoonWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.BOON_OF_DIMENSIONAL_TRAVEL) ||
    !isEpicBoonWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.BOON_OF_DIMENSIONAL_TRAVEL,
    isBoonOfDimensionalTravelBlinkStepsDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.BOON_OF_DIMENSIONAL_TRAVEL), description)]
    : [];
}

export function getBoonOfIrresistibleOffenseWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DamageTypedWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.BOON_OF_IRRESISTIBLE_OFFENSE) ||
    !isBoonOfIrresistibleOffenseWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.BOON_OF_IRRESISTIBLE_OFFENSE,
    isBoonOfIrresistibleOffenseDescriptionEntry
  );

  return description.length > 0
    ? [
        createSourcedDescriptionEntries(
          getFeatLabel(FEATS.BOON_OF_IRRESISTIBLE_OFFENSE),
          description
        )
      ]
    : [];
}

export function getThrownWeaponFightingWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: ThrownWeaponFightingWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.THROWN_WEAPON_FIGHTING) ||
    !isThrownWeaponFightingWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.THROWN_WEAPON_FIGHTING,
    isThrownWeaponFightingWeaponActionDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.THROWN_WEAPON_FIGHTING), description)]
    : [];
}

export function getTwoWeaponFightingWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: TwoWeaponFightingWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.TWO_WEAPON_FIGHTING) ||
    !isTwoWeaponFightingWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.TWO_WEAPON_FIGHTING,
    isTwoWeaponFightingWeaponActionDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.TWO_WEAPON_FIGHTING), description)]
    : [];
}

export function getUnarmedFightingWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: UnarmedFightingWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.UNARMED_FIGHTING) ||
    !isUnarmedFightingWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.UNARMED_FIGHTING,
    isUnarmedFightingWeaponActionDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.UNARMED_FIGHTING), description)]
    : [];
}

export function getCrusherWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: CrusherWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.CRUSHER) || !isCrusherWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.CRUSHER, isCrusherWeaponActionDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.CRUSHER), description)]
    : [];
}

export function getPiercerWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DamageTypedWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.PIERCER) || !isPiercerWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.PIERCER, isPiercerWeaponActionDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.PIERCER), description)]
    : [];
}

export function getSlasherWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DamageTypedWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.SLASHER) || !isSlasherWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.SLASHER, isSlasherWeaponActionDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.SLASHER), description)]
    : [];
}

export function getPoisonerWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DamageTypedWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.POISONER) || !isPoisonerWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.POISONER,
    isPoisonerPotentPoisonDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries("Poisoner: Potent Poison", description)]
    : [];
}

export function getDualWielderWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: DualWielderWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.DUAL_WIELDER) || !isDualWielderWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.DUAL_WIELDER,
    isDualWielderEnhancedDualWieldingDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.DUAL_WIELDER), description)]
    : [];
}

export function getGreatWeaponMasterWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: GreatWeaponMasterWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.GREAT_WEAPON_MASTER)) {
    return [];
  }

  const description: SpellDescriptionEntry[] = [
    ...(isGreatWeaponMasterHeavyWeaponAction(action)
      ? getFeatDescriptionSlice(
          FEATS.GREAT_WEAPON_MASTER,
          isGreatWeaponMasterHeavyWeaponMasteryDescriptionEntry
        )
      : []),
    ...(isGreatWeaponMasterMeleeWeaponAction(action)
      ? getFeatDescriptionSlice(FEATS.GREAT_WEAPON_MASTER, isGreatWeaponMasterHewDescriptionEntry)
      : [])
  ];

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.GREAT_WEAPON_MASTER), description)]
    : [];
}

export function getPolearmMasterWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: PolearmMasterWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.POLEARM_MASTER) ||
    !isPolearmMasterWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.POLEARM_MASTER,
    isPolearmMasterPoleStrikeDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.POLEARM_MASTER), description)]
    : [];
}

export function getCrossbowExpertWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: CrossbowExpertWeaponActionContext
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.CROSSBOW_EXPERT) ||
    !isCrossbowExpertWeaponAction(action)
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.CROSSBOW_EXPERT,
    isCrossbowExpertDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.CROSSBOW_EXPERT), description)]
    : [];
}

export function getSharpshooterWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: SharpshooterWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.SHARPSHOOTER) || !isSharpshooterWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.SHARPSHOOTER, isSharpshooterDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.SHARPSHOOTER), description)]
    : [];
}

export function getShieldMasterWeaponActionDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  action: ShieldMasterWeaponActionContext
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.SHIELD_MASTER) || !isShieldMasterWeaponAction(action)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.SHIELD_MASTER,
    isShieldMasterShieldBashDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.SHIELD_MASTER), description)]
    : [];
}

export function getChefShortRestDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.CHEF)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.CHEF, isChefReplenishingMealDescriptionEntry);

  return description.length > 0 ? [createSourcedDescriptionEntries("Chef", description)] : [];
}

export function getChefLongRestDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.CHEF)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.CHEF, isChefBolsteringTreatsDescriptionEntry);

  return description.length > 0 ? [createSourcedDescriptionEntries("Chef", description)] : [];
}

export function getInspiringLeaderRestDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.INSPIRING_LEADER)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.INSPIRING_LEADER,
    isInspiringLeaderBolsteringPerformanceDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.INSPIRING_LEADER), description)]
    : [];
}

export function getWeaponMasterLongRestDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.WEAPON_MASTER)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.WEAPON_MASTER,
    isWeaponMasterMasteryPropertyDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.WEAPON_MASTER), description)]
    : [];
}

export function getKeenMindStudyDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.KEEN_MIND)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.KEEN_MIND,
    isKeenMindQuickStudyDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.KEEN_MIND), description)]
    : [];
}

export function getObservantSearchDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.OBSERVANT)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.OBSERVANT,
    isObservantQuickSearchDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.OBSERVANT), description)]
    : [];
}

export function getSkulkerHideDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.SKULKER)) {
    return [];
  }

  const description = getFeatDescriptionSlice(FEATS.SKULKER, isSkulkerHideDescriptionEntry);

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.SKULKER), description)]
    : [];
}

export function getEmeraldEnclaveFledglingTagTeamDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.EMERALD_ENCLAVE_FLEDGLING)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.EMERALD_ENCLAVE_FLEDGLING,
    isEmeraldEnclaveFledglingTagTeamDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.EMERALD_ENCLAVE_FLEDGLING), description)]
    : [];
}

export function getHarperAgentDistractingMelodyDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.HARPER_AGENT)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.HARPER_AGENT,
    isHarperAgentDistractingMelodyDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.HARPER_AGENT), description)]
    : [];
}

export function getPurpleDragonRookRallyingCryDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.PURPLE_DRAGON_ROOK)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.PURPLE_DRAGON_ROOK,
    isPurpleDragonRookRallyingCryDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.PURPLE_DRAGON_ROOK), description)]
    : [];
}

export function getTyroOfTheGauntletVigilantDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.TYRO_OF_THE_GAUNTLET)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.TYRO_OF_THE_GAUNTLET,
    isTyroOfTheGauntletVigilantDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.TYRO_OF_THE_GAUNTLET), description)]
    : [];
}

export function getZhentarimRuffianFamilyFirstDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.ZHENTARIM_RUFFIAN)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.ZHENTARIM_RUFFIAN,
    isZhentarimRuffianFamilyFirstDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.ZHENTARIM_RUFFIAN), description)]
    : [];
}

export function getMageSlayerGuardedMindDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  ability: AbilityKey
): SpellDescriptionEntry[][] {
  if (
    !hasFeatForCharacter(character, FEATS.MAGE_SLAYER) ||
    (ability !== "INT" && ability !== "WIS" && ability !== "CHA")
  ) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.MAGE_SLAYER,
    isMageSlayerGuardedMindDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries("Mage Slayer: Guarded Mind", description)]
    : [];
}

export function getShieldMasterInterposeShieldDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  ability: AbilityKey
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.SHIELD_MASTER) || ability !== "DEX") {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.SHIELD_MASTER,
    isShieldMasterInterposeShieldDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.SHIELD_MASTER), description)]
    : [];
}

export function getWarCasterConcentrationDescriptionAdditionsForCharacter(
  character: FeatRuntimeCharacter,
  ability: AbilityKey
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.WAR_CASTER) || ability !== "CON") {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.WAR_CASTER,
    isWarCasterConcentrationDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries("War Caster: Concentration", description)]
    : [];
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
  if (!hasFeatForCharacter(character, FEATS.MEDIUM_ARMOR_MASTER)) {
    return [];
  }

  const description = getFeatDescriptionSlice(
    FEATS.MEDIUM_ARMOR_MASTER,
    isMediumArmorMasterDexterousWearerDescriptionEntry
  );

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.MEDIUM_ARMOR_MASTER), description)]
    : [];
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
  return actionKey === "common-action-study" && hasFeatForCharacter(character, FEATS.KEEN_MIND);
}

export function hasObservantSearchBonusActionPath(
  character: FeatRuntimeCharacter,
  actionKey: string
): boolean {
  return actionKey === "common-action-search" && hasFeatForCharacter(character, FEATS.OBSERVANT);
}

export function transformFeatWeaponActionForCharacter<
  T extends ArcheryWeaponActionContext & {
    attackBonusEntries?: Array<{
      label: string;
      value: number;
    }>;
  }
>(character: FeatRuntimeCharacter, action: T): T {
  if (!hasFeatForCharacter(character, FEATS.ARCHERY) || !isArcheryWeaponAction(action)) {
    return action;
  }

  return {
    ...action,
    attackBonusEntries: [
      ...(action.attackBonusEntries ?? []),
      {
        label: getFeatLabel(FEATS.ARCHERY),
        value: 2
      }
    ]
  };
}

export function transformFeatCommonActionForCharacter<T extends Pick<FeatureActionCard, "key">>(
  character: FeatRuntimeCharacter,
  action: T & Pick<FeatureActionCard, "descriptionAdditions">
): T & Pick<FeatureActionCard, "descriptionAdditions"> {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];

  if (action.key === "common-action-dash") {
    descriptionAdditions.push(...getChargerDashDescriptionAdditionsForCharacter(character));
    descriptionAdditions.push(...getSpeedyDashDescriptionAdditionsForCharacter(character));
  }

  if (action.key === "common-action-disengage") {
    descriptionAdditions.push(
      ...getBoonOfSpeedDisengageDescriptionAdditionsForCharacter(character)
    );
  }

  if (action.key === "common-action-study") {
    descriptionAdditions.push(...getKeenMindStudyDescriptionAdditionsForCharacter(character));
  }

  if (action.key === "common-action-search") {
    descriptionAdditions.push(...getObservantSearchDescriptionAdditionsForCharacter(character));
  }

  if (action.key === "common-action-hide") {
    descriptionAdditions.push(...getSkulkerHideDescriptionAdditionsForCharacter(character));
  }

  if (action.key === "common-action-help") {
    descriptionAdditions.push(
      ...getEmeraldEnclaveFledglingTagTeamDescriptionAdditionsForCharacter(character)
    );
    descriptionAdditions.push(
      ...getHarperAgentDistractingMelodyDescriptionAdditionsForCharacter(character)
    );
  }

  if (action.key === "common-action-ready") {
    descriptionAdditions.push(
      ...getTyroOfTheGauntletVigilantDescriptionAdditionsForCharacter(character)
    );
  }

  if (descriptionAdditions.length === 0) {
    return action;
  }

  return {
    ...action,
    descriptionAdditions: [...(action.descriptionAdditions ?? []), ...descriptionAdditions]
  };
}

export function getSavageAttackerWeaponActionDescriptionAdditions(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.SAVAGE_ATTACKER)) {
    return [];
  }

  const description = getFeatDefinition(FEATS.SAVAGE_ATTACKER)?.description ?? [];

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.SAVAGE_ATTACKER), description)]
    : [];
}

export function getTavernBrawlerUnarmedStrikeDescriptionAdditions(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[][] {
  if (!hasFeatForCharacter(character, FEATS.TAVERN_BRAWLER)) {
    return [];
  }

  const description = getFeatDefinition(FEATS.TAVERN_BRAWLER)?.description ?? [];

  return description.length > 0
    ? [createSourcedDescriptionEntries(getFeatLabel(FEATS.TAVERN_BRAWLER), description)]
    : [];
}

export function getMusicianEncouragingSongDescriptionEntriesForCharacter(
  character: FeatRuntimeCharacter
): SpellDescriptionEntry[] {
  if (!hasFeatForCharacter(character, FEATS.MUSICIAN)) {
    return [];
  }

  return filterDescriptionEntries(getFeatDefinition(FEATS.MUSICIAN)?.description ?? [], (entry) =>
    entry.includes("Encouraging Song")
  );
}
