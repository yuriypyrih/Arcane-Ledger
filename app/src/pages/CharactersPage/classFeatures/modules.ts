import type { Character, CharacterClassFeatureState } from "../../../types";
import { createDefaultAbilities } from "../constants";
import {
  activateArtificerArmorerArcaneArmorOption,
  activateArtificerArmorerDefensiveField,
  activateArtificerArmorerGiantStature,
  activateArtificerArmorerInfiltratorsFlight,
  advanceArtificerFeaturesForNewRound,
  activateArtificerArmorerArcaneArmor,
  applyLongRestToArtificerFeatures,
  artificerAdventurersAtlasActionKey,
  artificerArcaneJoltActionKey,
  artificerArmorerArcaneArmorActionKey,
  artificerArmorerDefensiveFieldActionKey,
  artificerArmorerGiantStatureActionKey,
  artificerArmorerInfiltratorsFlightActionKey,
  consumeArtificerArcaneJoltUse,
  createArtificerAdventurersAtlasMapsForCharacter,
  normalizeArtificerFeatureState
} from "./artificer/artificer";
import { getArtificerClassFeatureDerivedState } from "./artificer/contributions";
import {
  activateBardicInspiration,
  activateBardCollegeOfTheMoonLunarVitality,
  advanceBardFeaturesForNewRound,
  activateMantleOfInspiration,
  activateUnbreakableMajesty,
  applyLongRestToBardFeatures,
  applyShortRestToBardFeatures,
  bardicInspirationActionKey,
  mantleOfInspirationActionKey,
  lunarVitalityActionKey,
  unbreakableMajestyActionKey,
  normalizeBardFeatureState
} from "./bard/bard";
import { getBardClassFeatureDerivedState } from "./bard/contributions";
import {
  activateBarbarianIntimidatingPresence,
  activateBarbarianBrutalStrike,
  activateBarbarianRecklessAttack,
  activateBarbarianRage,
  activateBarbarianRageOfTheWildsOption,
  activateBarbarianTravelAlongTheTree,
  activateBarbarianZealousPresence,
  advanceBarbarianFeaturesForNewRound,
  applyLongRestToBarbarianFeatures,
  applyShortRestToBarbarianFeatures,
  barbarianBrutalStrikeActionKey,
  barbarianIntimidatingPresenceActionKey,
  barbarianRageActionKey,
  barbarianRecklessAttackActionKey,
  barbarianWarriorOfTheGodsActionKey,
  barbarianTravelAlongTheTreeActionKey,
  barbarianZealousPresenceActionKey,
  normalizeBarbarianRageState
} from "./barbarian/barbarian";
import { getBarbarianClassFeatureDerivedState } from "./barbarian/contributions";
import {
  activateClericBlessingOfTheTrickster,
  activateClericCoronaOfLight,
  activateClericDivineForeknowledge,
  activateClericDivineIntervention,
  activateClericFeatureActionOption,
  activateClericInvokeDuplicity,
  activateClericWarPriest,
  blessingOfTheTricksterActionKey,
  activateClericPreserveLife,
  activateClericRadianceOfTheDawn,
  advanceClericFeaturesForNewRound,
  applyLongRestToClericFeatures,
  applyShortRestToClericFeatures,
  coronaOfLightActionKey,
  divineForeknowledgeActionKey,
  divineInterventionActionKey,
  invokeDuplicityActionKey,
  preserveLifeActionKey,
  radianceOfTheDawnActionKey,
  warPriestActionKey,
  normalizeClericFeatureState
} from "./cleric/cleric";
import { getClericClassFeatureDerivedState } from "./cleric/contributions";
import {
  activateCustomClassFeatureAction,
  advanceCustomClassFeaturesForNewRound,
  getClassNeutralMechanicsDerivedState,
  getCustomClassClassFeatureDerivedState,
  normalizeCustomClassFeatureState
} from "./customClass/customClass";
import {
  activateDruidLandsAid,
  activateDruidMoonlightStep,
  activateDruidNaturesSanctuary,
  activateDruidWrathOfTheSea,
  advanceDruidFeaturesForNewRound,
  applyLongRestToDruidFeatures,
  applyShortRestToDruidFeatures,
  druidLandsAidActionKey,
  druidMoonlightStepActionKey,
  druidNaturesSanctuaryActionKey,
  druidWrathOfTheSeaActionKey,
  druidNatureMagicianActionKey,
  druidWildResurgenceActionKey,
  normalizeDruidFeatureState
} from "./druid/druid";
import { getDruidClassFeatureDerivedState } from "./druid/contributions";
import {
  activateFighterPsiWarriorBulwarkOfForceForCharacter,
  activateFighterPsiWarriorTelekineticMovementForCharacter,
  activateFighterPsiWarriorPsiPoweredLeapForCharacter,
  activateFighterActionSurge,
  advanceFighterFeaturesForNewRound,
  applyLongRestToFighterFeatures,
  applyShortRestToFighterFeatures,
  consumeFighterIndomitableUse,
  consumeFighterSecondWindUse,
  fighterActionSurgeActionKey,
  fighterIndomitableActionKey,
  fighterPsiWarriorBulwarkOfForceActionKey,
  fighterPsiPoweredLeapActionKey,
  fighterPsiWarriorTelekineticMovementActionKey,
  fighterSecondWindActionKey,
  fighterTacticalMindActionKey,
  normalizeFighterFeatureState
} from "./fighter/fighter";
import { getFighterClassFeatureDerivedState } from "./fighter/contributions";
import {
  activateMonkCloakOfShadow,
  activateMonkElementalBurst,
  activateMonkElementalAttunement,
  activateMonkFlurryOfBlows,
  activateMonkPatientDefense,
  activateMonkHandOfHealing,
  activateMonkHandOfUltimateJustice,
  activateMonkShadowStep,
  activateMonkStepOfTheWind,
  activateMonkSuperiorDefense,
  activateMonkWholenessOfBody,
  advanceMonkFeaturesForNewRound,
  applyLongRestToMonkFeatures,
  applyShortRestToMonkFeatures,
  monkHandOfHealingActionKey,
  monkHandOfUltimateJusticeActionKey,
  monkFlurryOfBlowsActionKey,
  monkPatientDefenseActionKey,
  monkCloakOfShadowActionKey,
  monkElementalBurstActionKey,
  monkElementalAttunementActionKey,
  monkShadowStepActionKey,
  monkStepOfTheWindActionKey,
  monkSuperiorDefenseActionKey,
  monkWholenessOfBodyActionKey,
  normalizeMonkFeatureState
} from "./monk/monk";
import { getMonkClassFeatureDerivedState } from "./monk/contributions";
import {
  abjureFoesActionKey,
  activateAbjureFoes,
  activateElderChampion,
  activateHolyNimbus,
  activateLivingLegend,
  activateNobleScion,
  activateAvengingAngel,
  activateNaturesWrath,
  activatePeerlessAthlete,
  activatePaladinFeatureActionOption,
  advancePaladinFeaturesForNewRound,
  applyLongRestToPaladinFeatures,
  applyShortRestToPaladinFeatures,
  elderChampionActionKey,
  faithfulSteedActionKey,
  holyNimbusActionKey,
  livingLegendActionKey,
  nobleScionActionKey,
  avengingAngelActionKey,
  naturesWrathActionKey,
  normalizePaladinFeatureState,
  paladinChannelDivinityActionKey,
  paladinLayOnHandsActionKey,
  paladinsSmiteActionKey,
  peerlessAthleteActionKey
} from "./paladin/paladin";
import { getPaladinClassFeatureDerivedState } from "./paladin/contributions";
import {
  activateRangerBeastMasterAction,
  activateRangerNaturesVeil,
  advanceRangerFeaturesForNewRound,
  applyLongRestToRangerFeatures,
  applyShortRestToRangerFeatures,
  fortifyingSoulActionKey,
  naturesVeilActionKey,
  normalizeRangerFeatureState,
  rangerBeastMasterCommandActionKey,
  rangerBeastMasterReviveActionKey,
  tirelessActionKey,
  consumeRangerTirelessUse,
  consumeRangerWinterWalkerFortifyingSoulUse
} from "./ranger/ranger";
import { getRangerClassFeatureDerivedState } from "./ranger/contributions";
import {
  activateRogueSneakAttack,
  activateRogueSteadyAim,
  advanceRogueFeaturesForNewRound,
  applyLongRestToRogueFeatures,
  applyShortRestToRogueFeatures,
  consumeRogueStrokeOfLuckUse,
  normalizeRogueFeatureState,
  rogueSneakAttackActionKey,
  rogueSteadyAimActionKey,
  rogueStrokeOfLuckActionKey
} from "./rogue/rogue";
import { getRogueClassFeatureDerivedState } from "./rogue/contributions";
import {
  activateRogueSoulknifePsychicTeleportation,
  activateRogueSoulknifePsychicWhispers,
  activateRogueSoulknifePsychicVeil,
  rogueSoulknifePsychicTeleportationActionKey,
  rogueSoulknifePsychicWhispersActionKey,
  rogueSoulknifePsychicVeilActionKey
} from "./rogue/subclasses/rogueSoulknife";
import {
  activateSorcererFeatureAction,
  activateSorcererFeatureActionOption,
  activateSorcererFeatureActionOptions,
  advanceSorcererFeaturesForNewRound,
  applyLongRestToSorcererFeatures,
  applyShortRestToSorcererFeatures,
  normalizeSorcererFeatureState
} from "./sorcerer/sorcerer";
import { getSorcererClassFeatureDerivedState } from "./sorcerer/contributions";
import {
  activateWarlockFeatureAction,
  advanceWarlockFeaturesForNewRound,
  applyLongRestToWarlockFeatures,
  applyShortRestToWarlockFeatures,
  normalizeWarlockFeatureState
} from "./warlock/warlock";
import { getWarlockClassFeatureDerivedState } from "./warlock/contributions";
import {
  activateWizardFeatureAction,
  advanceWizardFeaturesForNewRound,
  applyLongRestToWizardFeatures,
  applyShortRestToWizardFeatures,
  normalizeWizardFeatureState
} from "./wizard/wizard";
import { getWizardClassFeatureDerivedState } from "./wizard/contributions";
import type {
  ActiveClassFeatureName,
  CollectedClassFeatureCharacter,
  ClassFeatureDerivedState,
  ClassFeatureModule
} from "./types";

const emptyFeatureDerivedState: ClassFeatureDerivedState = {};
const activeClassFeatureStateCache = new WeakMap<object, ClassFeatureDerivedState>();
const activeClassFeatureDerivations = new Set<ActiveClassFeatureName>();

function mergeDerivedArrays<T>(base?: T[], addition?: T[]): T[] | undefined {
  if (!base?.length && !addition?.length) {
    return undefined;
  }

  return [...(base ?? []), ...(addition ?? [])];
}

function mergeDerivedRecords<T>(
  base?: Partial<Record<string, T[]>>,
  addition?: Partial<Record<string, T[]>>
): Partial<Record<string, T[]>> | undefined {
  const keys = new Set([...Object.keys(base ?? {}), ...Object.keys(addition ?? {})]);

  if (keys.size === 0) {
    return undefined;
  }

  return [...keys].reduce<Partial<Record<string, T[]>>>((nextRecord, key) => {
    const values = mergeDerivedArrays(base?.[key], addition?.[key]);

    if (values?.length) {
      nextRecord[key] = values;
    }

    return nextRecord;
  }, {});
}

function mergeDerivedMaps<T extends Record<string, unknown>>(
  base?: T,
  addition?: T
): T | undefined {
  if (!base && !addition) {
    return undefined;
  }

  return { ...(base ?? {}), ...(addition ?? {}) } as T;
}

function mergeClassFeatureDerivedStates(
  base: ClassFeatureDerivedState,
  addition: ClassFeatureDerivedState
): ClassFeatureDerivedState {
  if (addition === emptyFeatureDerivedState || Object.keys(addition).length === 0) {
    return base;
  }

  return {
    ...base,
    ...addition,
    actions: mergeDerivedArrays(base.actions, addition.actions),
    actionOptions: mergeDerivedRecords(base.actionOptions, addition.actionOptions),
    equipmentEntries: mergeDerivedArrays(base.equipmentEntries, addition.equipmentEntries),
    weaponActions: mergeDerivedArrays(base.weaponActions, addition.weaponActions),
    getWeaponDamageBonuses:
      base.getWeaponDamageBonuses || addition.getWeaponDamageBonuses
        ? (context) => [
            ...(base.getWeaponDamageBonuses?.(context) ?? []),
            ...(addition.getWeaponDamageBonuses?.(context) ?? [])
          ]
        : undefined,
    getSpellDamageBonuses:
      base.getSpellDamageBonuses || addition.getSpellDamageBonuses
        ? (context) => [
            ...(base.getSpellDamageBonuses?.(context) ?? []),
            ...(addition.getSpellDamageBonuses?.(context) ?? [])
          ]
        : undefined,
    getInitiativeBonuses:
      base.getInitiativeBonuses || addition.getInitiativeBonuses
        ? () => [
            ...(base.getInitiativeBonuses?.() ?? []),
            ...(addition.getInitiativeBonuses?.() ?? [])
          ]
        : undefined,
    getSavingThrowBonuses:
      base.getSavingThrowBonuses || addition.getSavingThrowBonuses
        ? (ability) => [
            ...(base.getSavingThrowBonuses?.(ability) ?? []),
            ...(addition.getSavingThrowBonuses?.(ability) ?? [])
          ]
        : undefined,
    savingThrowIndicators: mergeDerivedMaps(
      base.savingThrowIndicators,
      addition.savingThrowIndicators
    ),
    abilityCheckIndicators: mergeDerivedMaps(
      base.abilityCheckIndicators,
      addition.abilityCheckIndicators
    ),
    coreStatIndicators: mergeDerivedMaps(base.coreStatIndicators, addition.coreStatIndicators),
    skillIndicators: mergeDerivedMaps(base.skillIndicators, addition.skillIndicators),
    getSkillBonuses:
      base.getSkillBonuses || addition.getSkillBonuses
        ? (skill, proficiencyLevel) => [
            ...(base.getSkillBonuses?.(skill, proficiencyLevel) ?? []),
            ...(addition.getSkillBonuses?.(skill, proficiencyLevel) ?? [])
          ]
        : undefined,
    getArmorClassModes:
      base.getArmorClassModes || addition.getArmorClassModes
        ? (context) => [
            ...(base.getArmorClassModes?.(context) ?? []),
            ...(addition.getArmorClassModes?.(context) ?? [])
          ]
        : undefined,
    getArmorClassBonuses:
      base.getArmorClassBonuses || addition.getArmorClassBonuses
        ? (context) => [
            ...(base.getArmorClassBonuses?.(context) ?? []),
            ...(addition.getArmorClassBonuses?.(context) ?? [])
          ]
        : undefined,
    getSpeedBonuses:
      base.getSpeedBonuses || addition.getSpeedBonuses
        ? (context) => [
            ...(base.getSpeedBonuses?.(context) ?? []),
            ...(addition.getSpeedBonuses?.(context) ?? [])
          ]
        : undefined,
    abilityScoreBonuses: mergeDerivedArrays(
      base.abilityScoreBonuses,
      addition.abilityScoreBonuses
    ),
    weaponProficiencyEntries: mergeDerivedArrays(
      base.weaponProficiencyEntries,
      addition.weaponProficiencyEntries
    ),
    skillProficiencyEntries: mergeDerivedArrays(
      base.skillProficiencyEntries,
      addition.skillProficiencyEntries
    ),
    savingThrowProficiencyEntries: mergeDerivedArrays(
      base.savingThrowProficiencyEntries,
      addition.savingThrowProficiencyEntries
    ),
    armorProficiencyEntries: mergeDerivedArrays(
      base.armorProficiencyEntries,
      addition.armorProficiencyEntries
    ),
    toolProficiencyEntries: mergeDerivedArrays(
      base.toolProficiencyEntries,
      addition.toolProficiencyEntries
    ),
    languageProficiencyEntries: mergeDerivedArrays(
      base.languageProficiencyEntries,
      addition.languageProficiencyEntries
    ),
    alwaysPreparedSpellIds: mergeDerivedArrays(
      base.alwaysPreparedSpellIds,
      addition.alwaysPreparedSpellIds
    ),
    alwaysPreparedSpellSources: mergeDerivedMaps(
      base.alwaysPreparedSpellSources,
      addition.alwaysPreparedSpellSources
    ),
    alwaysSpellbookSpellIds: mergeDerivedArrays(
      base.alwaysSpellbookSpellIds,
      addition.alwaysSpellbookSpellIds
    ),
    ritualOnlySpellIds: mergeDerivedArrays(base.ritualOnlySpellIds, addition.ritualOnlySpellIds),
    derivedStatusEntries: mergeDerivedArrays(
      base.derivedStatusEntries,
      addition.derivedStatusEntries
    ),
    reactionEntries: mergeDerivedArrays(base.reactionEntries, addition.reactionEntries),
    transformSpellEntry:
      base.transformSpellEntry || addition.transformSpellEntry
        ? (spell) =>
            addition.transformSpellEntry?.(base.transformSpellEntry?.(spell) ?? spell) ??
            base.transformSpellEntry?.(spell) ??
            spell
        : undefined,
    transformCommonAction:
      base.transformCommonAction || addition.transformCommonAction
        ? (action) =>
            addition.transformCommonAction?.(base.transformCommonAction?.(action) ?? action) ??
            base.transformCommonAction?.(action) ??
            action
        : undefined,
    transformFeatureAction:
      base.transformFeatureAction || addition.transformFeatureAction
        ? (action) =>
            addition.transformFeatureAction?.(base.transformFeatureAction?.(action) ?? action) ??
            base.transformFeatureAction?.(action) ??
            action
        : undefined,
    transformWeaponAction:
      base.transformWeaponAction || addition.transformWeaponAction
        ? (action) =>
            addition.transformWeaponAction?.(base.transformWeaponAction?.(action) ?? action) ??
            base.transformWeaponAction?.(action) ??
            action
        : undefined,
    getSpellDamageFormulaOverride:
      base.getSpellDamageFormulaOverride || addition.getSpellDamageFormulaOverride
        ? (spell) =>
            addition.getSpellDamageFormulaOverride?.(spell) ??
            base.getSpellDamageFormulaOverride?.(spell) ??
            null
        : undefined,
    cantripLimitBonus: (base.cantripLimitBonus ?? 0) + (addition.cantripLimitBonus ?? 0),
    cantripDamageBonus: (base.cantripDamageBonus ?? 0) + (addition.cantripDamageBonus ?? 0),
    getInventoryAttunementLimit:
      base.getInventoryAttunementLimit || addition.getInventoryAttunementLimit
        ? (defaultLimit) => {
            const baseLimit = base.getInventoryAttunementLimit?.(defaultLimit) ?? defaultLimit;
            return addition.getInventoryAttunementLimit?.(baseLimit) ?? baseLimit;
          }
        : undefined,
    canUseMonkMartialArts:
      base.canUseMonkMartialArts || addition.canUseMonkMartialArts
        ? (context) =>
            (base.canUseMonkMartialArts?.(context) ?? true) &&
            (addition.canUseMonkMartialArts?.(context) ?? true)
        : undefined
  };
}

type ClassFeatureDerivationCharacter = Pick<Character, "className"> &
  Partial<
    Pick<
      Character,
      | "level"
      | "subclassId"
      | "classFeatureState"
      | "classRules"
      | "customClass"
      | "spellSlotsExpended"
      | "abilities"
      | "statusEntries"
      | "roundTracker"
      | "equipment"
      | "inventoryItems"
      | "customEquipment"
      | "spellbookSpellIds"
      | "cantripIds"
      | "feats"
      | "skillProficiencies"
      | "toolProficiencies"
      | "savingThrowProficiencies"
    >
  >;

function withClassFeatureDerivationDefaults(
  character: ClassFeatureDerivationCharacter
): CollectedClassFeatureCharacter {
  return {
    ...character,
    level: character.level ?? 1,
    abilities: character.abilities ?? createDefaultAbilities(),
    subclassId: character.subclassId,
    classFeatureState: character.classFeatureState ?? {},
    classRules: character.classRules,
    customClass: character.customClass,
    skillProficiencies: character.skillProficiencies ?? [],
    toolProficiencies: character.toolProficiencies ?? [],
    savingThrowProficiencies: character.savingThrowProficiencies ?? [],
    spellSlotsExpended: character.spellSlotsExpended ?? [],
    statusEntries: character.statusEntries ?? [],
    roundTracker: character.roundTracker,
    equipment: character.equipment ?? [],
    inventoryItems: character.inventoryItems ?? [],
    customEquipment: character.customEquipment ?? [],
    spellbookSpellIds: character.spellbookSpellIds ?? [],
    cantripIds: character.cantripIds ?? [],
    feats: character.feats ?? []
  };
}

const classFeatureModules = {
  Artificer: {
    className: "Artificer",
    stateKey: "artificer",
    normalizeState: normalizeArtificerFeatureState,
    collectDerived(character) {
      return getArtificerClassFeatureDerivedState(character);
    },
    handleAction(character, actionKey) {
      if (actionKey === artificerArmorerArcaneArmorActionKey) {
        return activateArtificerArmorerArcaneArmor(character);
      }

      if (actionKey === artificerArmorerGiantStatureActionKey) {
        return activateArtificerArmorerGiantStature(character);
      }

      if (actionKey === artificerArmorerDefensiveFieldActionKey) {
        return activateArtificerArmorerDefensiveField(character);
      }

      if (actionKey === artificerArmorerInfiltratorsFlightActionKey) {
        return activateArtificerArmorerInfiltratorsFlight(character);
      }

      if (actionKey === artificerArcaneJoltActionKey) {
        return consumeArtificerArcaneJoltUse(character);
      }

      if (actionKey === artificerAdventurersAtlasActionKey) {
        return createArtificerAdventurersAtlasMapsForCharacter(character);
      }

      return null;
    },
    handleActionOption(character, actionKey, optionKey) {
      return actionKey === artificerArmorerArcaneArmorActionKey
        ? activateArtificerArmorerArcaneArmorOption(character, optionKey)
        : null;
    },
    advanceRound: advanceArtificerFeaturesForNewRound,
    applyLongRest: applyLongRestToArtificerFeatures
  },
  Barbarian: {
    className: "Barbarian",
    stateKey: "rage",
    normalizeState: normalizeBarbarianRageState,
    collectDerived(character) {
      return getBarbarianClassFeatureDerivedState(character);
    },
    handleAction(character, actionKey) {
      if (actionKey === barbarianRageActionKey) {
        return activateBarbarianRage(character);
      }

      if (actionKey === barbarianRecklessAttackActionKey) {
        return activateBarbarianRecklessAttack(character);
      }

      if (actionKey === barbarianBrutalStrikeActionKey) {
        return activateBarbarianBrutalStrike(character);
      }

      if (actionKey === barbarianWarriorOfTheGodsActionKey) {
        return character;
      }

      if (actionKey === barbarianIntimidatingPresenceActionKey) {
        return activateBarbarianIntimidatingPresence(character);
      }

      if (actionKey === barbarianZealousPresenceActionKey) {
        return activateBarbarianZealousPresence(character);
      }

      if (actionKey === barbarianTravelAlongTheTreeActionKey) {
        return activateBarbarianTravelAlongTheTree(character);
      }

      return null;
    },
    handleActionOption(character, actionKey, optionKey) {
      return actionKey === barbarianRageActionKey
        ? activateBarbarianRageOfTheWildsOption(character, optionKey)
        : null;
    },
    applyShortRest: applyShortRestToBarbarianFeatures,
    applyLongRest: applyLongRestToBarbarianFeatures,
    advanceRound: advanceBarbarianFeaturesForNewRound
  },
  Bard: {
    className: "Bard",
    stateKey: "bard",
    normalizeState: normalizeBardFeatureState,
    collectDerived(character) {
      return getBardClassFeatureDerivedState(character);
    },
    handleAction(character, actionKey) {
      if (actionKey === bardicInspirationActionKey) {
        return activateBardicInspiration(character);
      }

      if (actionKey === mantleOfInspirationActionKey) {
        return activateMantleOfInspiration(character);
      }

      if (actionKey === lunarVitalityActionKey) {
        return activateBardCollegeOfTheMoonLunarVitality(character);
      }

      if (actionKey === unbreakableMajestyActionKey) {
        return activateUnbreakableMajesty(character);
      }

      return null;
    },
    applyShortRest: applyShortRestToBardFeatures,
    applyLongRest: applyLongRestToBardFeatures,
    advanceRound: advanceBardFeaturesForNewRound
  },
  Cleric: {
    className: "Cleric",
    stateKey: "cleric",
    normalizeState: normalizeClericFeatureState,
    collectDerived(character) {
      return getClericClassFeatureDerivedState(character);
    },
    handleAction(character, actionKey) {
      if (actionKey === blessingOfTheTricksterActionKey) {
        return activateClericBlessingOfTheTrickster(character);
      }

      if (actionKey === invokeDuplicityActionKey) {
        return activateClericInvokeDuplicity(character);
      }

      if (actionKey === divineForeknowledgeActionKey) {
        return activateClericDivineForeknowledge(character);
      }

      if (actionKey === preserveLifeActionKey) {
        return activateClericPreserveLife(character);
      }

      if (actionKey === radianceOfTheDawnActionKey) {
        return activateClericRadianceOfTheDawn(character);
      }

      if (actionKey === coronaOfLightActionKey) {
        return activateClericCoronaOfLight(character);
      }

      if (actionKey === warPriestActionKey) {
        return activateClericWarPriest(character);
      }

      return actionKey === divineInterventionActionKey
        ? activateClericDivineIntervention(character)
        : null;
    },
    handleActionOption(character, actionKey, optionKey) {
      return actionKey === "cleric-channel-divinity"
        ? activateClericFeatureActionOption(character, optionKey)
        : null;
    },
    applyShortRest: applyShortRestToClericFeatures,
    applyLongRest: applyLongRestToClericFeatures,
    advanceRound: advanceClericFeaturesForNewRound
  },
  Custom: {
    className: "Custom",
    stateKey: "customClass",
    normalizeState: normalizeCustomClassFeatureState,
    collectDerived: getCustomClassClassFeatureDerivedState,
    handleAction(character, actionKey) {
      return activateCustomClassFeatureAction(character, actionKey);
    },
    advanceRound: advanceCustomClassFeaturesForNewRound
  },
  Druid: {
    className: "Druid",
    stateKey: "druid",
    normalizeState: normalizeDruidFeatureState,
    collectDerived: getDruidClassFeatureDerivedState,
    handleAction(character, actionKey) {
      if (actionKey === druidLandsAidActionKey) {
        return activateDruidLandsAid(character);
      }

      if (actionKey === druidMoonlightStepActionKey) {
        return activateDruidMoonlightStep(character);
      }

      if (actionKey === druidNaturesSanctuaryActionKey) {
        return activateDruidNaturesSanctuary(character);
      }

      if (actionKey === druidWrathOfTheSeaActionKey) {
        return activateDruidWrathOfTheSea(character);
      }

      if (actionKey === druidNatureMagicianActionKey) {
        return character;
      }

      if (actionKey === druidWildResurgenceActionKey) {
        return character;
      }

      return null;
    },
    applyShortRest: applyShortRestToDruidFeatures,
    applyLongRest: applyLongRestToDruidFeatures,
    advanceRound: advanceDruidFeaturesForNewRound
  },
  Fighter: {
    className: "Fighter",
    stateKey: "fighter",
    normalizeState: normalizeFighterFeatureState,
    collectDerived: getFighterClassFeatureDerivedState,
    handleAction(character, actionKey) {
      if (actionKey === fighterActionSurgeActionKey) {
        return activateFighterActionSurge(character);
      }

      if (actionKey === fighterSecondWindActionKey || actionKey === fighterTacticalMindActionKey) {
        return consumeFighterSecondWindUse(character);
      }

      if (actionKey === fighterIndomitableActionKey) {
        return consumeFighterIndomitableUse(character);
      }

      if (actionKey === fighterPsiWarriorTelekineticMovementActionKey) {
        return activateFighterPsiWarriorTelekineticMovementForCharacter(character);
      }

      if (actionKey === fighterPsiPoweredLeapActionKey) {
        return activateFighterPsiWarriorPsiPoweredLeapForCharacter(character);
      }

      if (actionKey === fighterPsiWarriorBulwarkOfForceActionKey) {
        return activateFighterPsiWarriorBulwarkOfForceForCharacter(character);
      }

      return null;
    },
    applyShortRest: applyShortRestToFighterFeatures,
    applyLongRest: applyLongRestToFighterFeatures,
    advanceRound: advanceFighterFeaturesForNewRound
  },
  Monk: {
    className: "Monk",
    stateKey: "monk",
    normalizeState: normalizeMonkFeatureState,
    collectDerived: getMonkClassFeatureDerivedState,
    handleAction(character, actionKey) {
      if (actionKey === monkFlurryOfBlowsActionKey) {
        return activateMonkFlurryOfBlows(character);
      }

      if (actionKey === monkPatientDefenseActionKey) {
        return activateMonkPatientDefense(character);
      }

      if (actionKey === monkStepOfTheWindActionKey) {
        return activateMonkStepOfTheWind(character);
      }

      if (actionKey === monkSuperiorDefenseActionKey) {
        return activateMonkSuperiorDefense(character);
      }

      if (actionKey === monkHandOfHealingActionKey) {
        return activateMonkHandOfHealing(character);
      }

      if (actionKey === monkHandOfUltimateJusticeActionKey) {
        return activateMonkHandOfUltimateJustice(character);
      }

      if (actionKey === monkShadowStepActionKey) {
        return activateMonkShadowStep(character);
      }

      if (actionKey === monkWholenessOfBodyActionKey) {
        return activateMonkWholenessOfBody(character);
      }

      if (actionKey === monkCloakOfShadowActionKey) {
        return activateMonkCloakOfShadow(character);
      }

      if (actionKey === monkElementalAttunementActionKey) {
        return activateMonkElementalAttunement(character);
      }

      if (actionKey === monkElementalBurstActionKey) {
        return activateMonkElementalBurst(character);
      }

      return null;
    },
    applyShortRest: applyShortRestToMonkFeatures,
    applyLongRest: applyLongRestToMonkFeatures,
    advanceRound: advanceMonkFeaturesForNewRound
  },
  Paladin: {
    className: "Paladin",
    stateKey: "paladin",
    normalizeState: normalizePaladinFeatureState,
    collectDerived: getPaladinClassFeatureDerivedState,
    handleAction(character, actionKey) {
      if (
        actionKey === paladinLayOnHandsActionKey ||
        actionKey === paladinsSmiteActionKey ||
        actionKey === faithfulSteedActionKey
      ) {
        return character;
      }

      if (actionKey === holyNimbusActionKey) {
        return activateHolyNimbus(character);
      }

      if (actionKey === abjureFoesActionKey) {
        return activateAbjureFoes(character);
      }

      if (actionKey === naturesWrathActionKey) {
        return activateNaturesWrath(character);
      }

      if (actionKey === livingLegendActionKey) {
        return activateLivingLegend(character);
      }

      if (actionKey === nobleScionActionKey) {
        return activateNobleScion(character);
      }

      if (actionKey === avengingAngelActionKey) {
        return activateAvengingAngel(character);
      }

      if (actionKey === elderChampionActionKey) {
        return activateElderChampion(character);
      }

      if (actionKey === peerlessAthleteActionKey) {
        return activatePeerlessAthlete(character);
      }

      return null;
    },
    handleActionOption(character, actionKey, optionKey) {
      return actionKey === paladinChannelDivinityActionKey
        ? activatePaladinFeatureActionOption(character, optionKey)
        : null;
    },
    applyShortRest: applyShortRestToPaladinFeatures,
    applyLongRest: applyLongRestToPaladinFeatures,
    advanceRound: advancePaladinFeaturesForNewRound
  },
  Ranger: {
    className: "Ranger",
    stateKey: "ranger",
    normalizeState: normalizeRangerFeatureState,
    collectDerived: getRangerClassFeatureDerivedState,
    handleAction(character, actionKey) {
      if (actionKey === tirelessActionKey) {
        return consumeRangerTirelessUse(character);
      }

      if (actionKey === fortifyingSoulActionKey) {
        return consumeRangerWinterWalkerFortifyingSoulUse(character);
      }

      if (actionKey === naturesVeilActionKey) {
        return activateRangerNaturesVeil(character);
      }

      if (
        actionKey === rangerBeastMasterCommandActionKey ||
        actionKey === rangerBeastMasterReviveActionKey
      ) {
        return activateRangerBeastMasterAction(character, actionKey);
      }

      return null;
    },
    applyShortRest: applyShortRestToRangerFeatures,
    applyLongRest: applyLongRestToRangerFeatures,
    advanceRound: advanceRangerFeaturesForNewRound
  },
  Rogue: {
    className: "Rogue",
    stateKey: "rogue",
    normalizeState: normalizeRogueFeatureState,
    collectDerived: getRogueClassFeatureDerivedState,
    handleAction(character, actionKey) {
      if (actionKey === rogueSneakAttackActionKey) {
        return activateRogueSneakAttack(character);
      }

      if (actionKey === rogueSteadyAimActionKey) {
        return activateRogueSteadyAim(character);
      }

      if (actionKey === rogueSoulknifePsychicVeilActionKey) {
        return activateRogueSoulknifePsychicVeil(character);
      }

      if (actionKey === rogueSoulknifePsychicWhispersActionKey) {
        return activateRogueSoulknifePsychicWhispers(character);
      }

      if (actionKey === rogueSoulknifePsychicTeleportationActionKey) {
        return activateRogueSoulknifePsychicTeleportation(character);
      }

      if (actionKey === rogueStrokeOfLuckActionKey) {
        return consumeRogueStrokeOfLuckUse(character);
      }

      return null;
    },
    applyShortRest: applyShortRestToRogueFeatures,
    applyLongRest: applyLongRestToRogueFeatures,
    advanceRound: advanceRogueFeaturesForNewRound
  },
  Sorcerer: {
    className: "Sorcerer",
    stateKey: "sorcerer",
    normalizeState: normalizeSorcererFeatureState,
    collectDerived: getSorcererClassFeatureDerivedState,
    handleAction(character, actionKey) {
      return activateSorcererFeatureAction(character, actionKey);
    },
    handleActionOption(character, actionKey, optionKey) {
      return activateSorcererFeatureActionOption(character, actionKey, optionKey);
    },
    handleActionOptions(character, actionKey, optionKeys) {
      return activateSorcererFeatureActionOptions(character, actionKey, optionKeys);
    },
    applyShortRest: applyShortRestToSorcererFeatures,
    applyLongRest: applyLongRestToSorcererFeatures,
    advanceRound: advanceSorcererFeaturesForNewRound
  },
  Warlock: {
    className: "Warlock",
    stateKey: "warlock",
    normalizeState: normalizeWarlockFeatureState,
    collectDerived: getWarlockClassFeatureDerivedState,
    handleAction(character, actionKey) {
      return activateWarlockFeatureAction(character, actionKey);
    },
    applyShortRest: applyShortRestToWarlockFeatures,
    advanceRound: advanceWarlockFeaturesForNewRound,
    applyLongRest: applyLongRestToWarlockFeatures
  },
  Wizard: {
    className: "Wizard",
    stateKey: "wizard",
    normalizeState: normalizeWizardFeatureState,
    collectDerived: getWizardClassFeatureDerivedState,
    handleAction(character, actionKey) {
      return activateWizardFeatureAction(character, actionKey);
    },
    advanceRound: advanceWizardFeaturesForNewRound,
    applyShortRest: applyShortRestToWizardFeatures,
    applyLongRest: applyLongRestToWizardFeatures
  }
} as Record<ActiveClassFeatureName, ClassFeatureModule<keyof CharacterClassFeatureState>>;

export function getClassFeatureModules(): ClassFeatureModule<keyof CharacterClassFeatureState>[] {
  return Object.values(classFeatureModules);
}

export function getActiveClassFeatureModule(className: string) {
  return classFeatureModules[className as ActiveClassFeatureName] ?? null;
}

export function collectActiveClassFeatureState(
  character: ClassFeatureDerivationCharacter
): ClassFeatureDerivedState {
  const cachedState = activeClassFeatureStateCache.get(character);

  if (cachedState) {
    return cachedState;
  }

  const activeModule = getActiveClassFeatureModule(character.className);

  if (!activeModule) {
    return emptyFeatureDerivedState;
  }

  if (activeClassFeatureDerivations.has(activeModule.className)) {
    return emptyFeatureDerivedState;
  }

  const safeCharacter = withClassFeatureDerivationDefaults(character);

  activeClassFeatureDerivations.add(activeModule.className);

  try {
    const classDerivedState = activeModule.collectDerived(safeCharacter);
    const neutralMechanicsDerivedState =
      activeModule.className === "Custom"
        ? emptyFeatureDerivedState
        : getClassNeutralMechanicsDerivedState(safeCharacter);
    const derivedState = mergeClassFeatureDerivedStates(
      classDerivedState,
      neutralMechanicsDerivedState
    );

    activeClassFeatureStateCache.set(character, derivedState);
    activeClassFeatureStateCache.set(safeCharacter, derivedState);
    return derivedState;
  } finally {
    activeClassFeatureDerivations.delete(activeModule.className);
  }
}
