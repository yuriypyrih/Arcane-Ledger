import type { Character, CharacterClassFeatureState, WEAPON_PROFICIENCY } from "../../../types";
import { createDefaultAbilities } from "../constants";
import {
  activateBardicInspiration,
  activateBardCollegeOfTheMoonLunarVitality,
  advanceBardFeaturesForNewRound,
  activateMantleOfInspiration,
  activateUnbreakableMajesty,
  applyLongRestToBardFeatures,
  applyShortRestToBardFeatures,
  getBardArmorProficiencyEntries,
  bardicInspirationActionKey,
  getBardAlwaysPreparedSpellIds,
  getBardFeatureAction,
  getBardLanguageProficiencyEntries,
  getBardReactionEntries,
  getBardSpellEntry,
  getBardSkillBonuses,
  getBardSkillProficiencyEntries,
  getBardicInspirationDie,
  getBardWeaponProficiencyEntries,
  mantleOfInspirationActionKey,
  lunarVitalityActionKey,
  unbreakableMajestyActionKey,
  normalizeBardFeatureState
} from "./bard/bard";
import {
  activateBarbarianIntimidatingPresence,
  activateBarbarianBrutalStrike,
  activateBarbarianRecklessAttack,
  activateBarbarianRelentlessRage,
  activateBarbarianRage,
  activateBarbarianRageOfTheWildsOption,
  activateBarbarianTravelAlongTheTree,
  activateBarbarianZealousPresence,
  advanceBarbarianFeaturesForNewRound,
  applyLongRestToBarbarianFeatures,
  applyShortRestToBarbarianFeatures,
  barbarianBrutalStrikeActionKey,
  barbarianIntimidatingPresenceActionKey,
  barbarianRelentlessRageActionKey,
  barbarianRageActionKey,
  barbarianRecklessAttackActionKey,
  barbarianWarriorOfTheGodsActionKey,
  barbarianTravelAlongTheTreeActionKey,
  barbarianZealousPresenceActionKey,
  getBarbarianAbilityCheckIndicators,
  getBarbarianAbilityScoreBonuses,
  getBarbarianArmorClassBonuses,
  getBarbarianArmorClassModes,
  getBarbarianBrutalStrikeOptions,
  getBarbarianCoreStatIndicators,
  getBarbarianDerivedConditions,
  getBarbarianFeatureActions,
  getBarbarianRageOfTheWildsOptions,
  getBarbarianSavingThrowIndicators,
  getBarbarianSkillBonuses,
  getBarbarianSkillIndicators,
  getBarbarianSkillProficiencyEntries,
  getBarbarianSpeedBonuses,
  getBarbarianSpellcastingState,
  getBarbarianWeaponDamageBonuses,
  getBarbarianWeaponMasteryOptions,
  getBarbarianWeaponMasterySelectionCount,
  getBarbarianWeaponMasterySelections,
  getBarbarianWeaponProficiencyEntries,
  normalizeBarbarianRageState,
  setBarbarianWeaponMasterySelections
} from "./barbarian/barbarian";
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
  getClericArmorProficiencyEntries,
  getClericCantripBonus,
  getClericCantripDamageBonus,
  getClericFeatureActions,
  getClericFeatureActionOptions,
  getClericSkillBonuses,
  getClericSpellEntry,
  getClericWeaponAction,
  getClericWeaponDamageBonuses,
  getClericWeaponProficiencyEntries,
  preserveLifeActionKey,
  radianceOfTheDawnActionKey,
  warPriestActionKey,
  normalizeClericFeatureState
} from "./cleric/cleric";
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
  getDruidAlwaysPreparedSpellIds,
  getDruidArmorProficiencyEntries,
  getDruidCantripBonus,
  getDruidCantripDamageBonus,
  getDruidDerivedStatusEntries,
  getDruidFeatureActions,
  getDruidLanguageProficiencyEntries,
  getDruidSpellEntry,
  getDruidWeaponAction,
  druidNatureMagicianActionKey,
  druidWildResurgenceActionKey,
  getDruidSpellcastingState,
  getDruidSkillBonuses,
  getDruidWeaponDamageBonuses,
  getDruidWeaponProficiencyEntries,
  normalizeDruidFeatureState
} from "./druid/druid";
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
  getFighterFeatureActions,
  getFighterWeaponAction,
  getFighterWeaponMasteryOptions,
  getFighterWeaponMasterySelectionCount,
  getFighterWeaponMasterySelections,
  getFighterWeaponProficiencyEntries,
  normalizeFighterFeatureState,
  setFighterWeaponMasterySelections
} from "./fighter/fighter";
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
  canUseMonkMartialArts,
  getMonkAbilityScoreBonuses,
  getMonkArmorClassModes,
  getMonkCommonAction,
  getMonkDerivedStatusEntries,
  getMonkFeatureActions,
  getMonkMartialArtsDie,
  getMonkReactionEntries,
  getMonkSavingThrowProficiencyEntries,
  getMonkSpeedBonuses,
  getMonkWeaponAction,
  monkHandOfHealingActionKey,
  monkHandOfUltimateJusticeActionKey,
  getMonkUnarmedDamageTypeLabel,
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
import {
  abjureFoesActionKey,
  activateAbjureFoes,
  activateElderChampion,
  activateHolyNimbus,
  activateLivingLegend,
  activateNobleScion,
  activateAvengingAngel,
  activateNaturesWrath,
  activateUndyingSentinel,
  activatePeerlessAthlete,
  activatePaladinFeatureActionOption,
  advancePaladinFeaturesForNewRound,
  applyLongRestToPaladinFeatures,
  applyShortRestToPaladinFeatures,
  elderChampionActionKey,
  faithfulSteedActionKey,
  getPaladinAlwaysPreparedSpellIds,
  getPaladinDerivedStatusEntries,
  getPaladinFeatureActions,
  getPaladinFeatureActionOptions,
  getPaladinWeaponDamageBonuses,
  getPaladinWeaponMasteryOptions,
  getPaladinWeaponMasterySelectionCount,
  getPaladinWeaponMasterySelections,
  getPaladinWeaponProficiencyEntries,
  holyNimbusActionKey,
  livingLegendActionKey,
  nobleScionActionKey,
  avengingAngelActionKey,
  naturesWrathActionKey,
  normalizePaladinFeatureState,
  paladinChannelDivinityActionKey,
  paladinLayOnHandsActionKey,
  paladinsSmiteActionKey,
  peerlessAthleteActionKey,
  undyingSentinelActionKey,
  setPaladinWeaponMasterySelections
} from "./paladin/paladin";
import {
  activateRangerBeastMasterAction,
  activateRangerNaturesVeil,
  advanceRangerFeaturesForNewRound,
  applyLongRestToRangerFeatures,
  applyShortRestToRangerFeatures,
  getRangerAlwaysPreparedSpellIds,
  getRangerDerivedStatusEntries,
  getRangerFeatureActions,
  getRangerLanguageProficiencyEntries,
  getRangerSkillBonuses,
  getRangerSkillProficiencyEntries,
  getRangerSpeedBonuses,
  getRangerSpellDamageFormula,
  getRangerSpellEntry,
  getRangerWeaponMasteryOptions,
  getRangerWeaponMasterySelectionCount,
  getRangerWeaponMasterySelections,
  getRangerWeaponProficiencyEntries,
  fortifyingSoulActionKey,
  naturesVeilActionKey,
  normalizeRangerFeatureState,
  rangerBeastMasterCommandActionKey,
  rangerBeastMasterReviveActionKey,
  setRangerWeaponMasterySelections,
  tirelessActionKey,
  consumeRangerTirelessUse,
  consumeRangerWinterWalkerFortifyingSoulUse
} from "./ranger/ranger";
import {
  activateRogueSneakAttack,
  activateRogueSteadyAim,
  advanceRogueFeaturesForNewRound,
  applyLongRestToRogueFeatures,
  applyShortRestToRogueFeatures,
  consumeRogueStrokeOfLuckUse,
  getRogueCommonAction,
  getRogueDerivedStatusEntries,
  getRogueFeatureActions,
  getRogueLanguageProficiencyEntries,
  getRogueReactionEntries,
  getRogueSavingThrowProficiencyEntries,
  getRogueSkillProficiencyEntries,
  getRogueSneakAttackDiceCount,
  getRogueSneakAttackFormula,
  getRogueSpeedBonuses,
  getRogueWeaponMasteryOptions,
  getRogueWeaponMasterySelectionCount,
  getRogueWeaponMasterySelections,
  getRogueWeaponAction,
  getRogueWeaponProficiencyEntries,
  normalizeRogueFeatureState,
  rogueSneakAttackActionKey,
  rogueSteadyAimActionKey,
  rogueStrokeOfLuckActionKey,
  setRogueWeaponMasterySelections
} from "./rogue/rogue";
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
  getSorcererFeatureActions,
  getSorcererMetamagicOptionsForAction,
  metamagicActionKey,
  normalizeSorcererFeatureState
} from "./sorcerer/sorcerer";
import { getSorcererSpellEntry } from "./sorcerer/innateSorcerySpell";
import {
  activateWarlockFeatureAction,
  advanceWarlockFeaturesForNewRound,
  applyLongRestToWarlockFeatures,
  applyShortRestToWarlockFeatures,
  getWarlockAlwaysPreparedSpellIds,
  getWarlockFeatureActions,
  normalizeWarlockFeatureState
} from "./warlock/warlock";
import {
  activateWizardFeatureAction,
  advanceWizardFeaturesForNewRound,
  applyLongRestToWizardFeatures,
  applyShortRestToWizardFeatures,
  getWizardAlwaysPreparedSpellIds,
  getWizardFeatureActions,
  getWizardSkillProficiencyEntries,
  normalizeWizardFeatureState
} from "./wizard/wizard";
import type {
  ActiveClassFeatureName,
  CollectedClassFeatureCharacter,
  ClassFeatureDerivedState,
  ClassFeatureModule
} from "./types";

const emptyFeatureDerivedState: ClassFeatureDerivedState = {};
const activeClassFeatureStateCache = new WeakMap<object, ClassFeatureDerivedState>();

function createWeaponMasteryState(
  selectionCount: number,
  options: WEAPON_PROFICIENCY[],
  selections: WEAPON_PROFICIENCY[],
  setSelections: (character: Character, nextSelections: WEAPON_PROFICIENCY[]) => Character
) {
  return {
    selectionCount,
    options,
    selections,
    setSelections
  };
}

const classFeatureModules = {
  Barbarian: {
    className: "Barbarian",
    stateKey: "rage",
    normalizeState: normalizeBarbarianRageState,
    collectDerived(character) {
      return {
        actions: getBarbarianFeatureActions(character),
        actionOptions: {
          [barbarianRageActionKey]: getBarbarianRageOfTheWildsOptions(character),
          [barbarianBrutalStrikeActionKey]: getBarbarianBrutalStrikeOptions(character)
        },
        getWeaponDamageBonuses: (context) => getBarbarianWeaponDamageBonuses(character, context),
        savingThrowIndicators: getBarbarianSavingThrowIndicators(character),
        abilityCheckIndicators: getBarbarianAbilityCheckIndicators(character),
        coreStatIndicators: getBarbarianCoreStatIndicators(character),
        skillIndicators: getBarbarianSkillIndicators(character),
        getSkillBonuses: (skill) => getBarbarianSkillBonuses(character, skill),
        skillProficiencyEntries: getBarbarianSkillProficiencyEntries(character),
        spellcastingState: getBarbarianSpellcastingState(character),
        getArmorClassModes: (context) => getBarbarianArmorClassModes(character, context),
        getArmorClassBonuses: (context) => getBarbarianArmorClassBonuses(character, context),
        getSpeedBonuses: (context) => getBarbarianSpeedBonuses(character, context),
        abilityScoreBonuses: getBarbarianAbilityScoreBonuses(character),
        weaponProficiencyEntries: getBarbarianWeaponProficiencyEntries(character),
        weaponMastery: createWeaponMasteryState(
          getBarbarianWeaponMasterySelectionCount(character),
          getBarbarianWeaponMasteryOptions(),
          getBarbarianWeaponMasterySelections(character),
          setBarbarianWeaponMasterySelections
        ),
        derivedStatusEntries: getBarbarianDerivedConditions(character)
      };
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

      if (actionKey === barbarianRelentlessRageActionKey) {
        return activateBarbarianRelentlessRage(character);
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
      const bardAction = getBardFeatureAction(character);
      return {
        actions: bardAction ? [bardAction] : [],
        getSkillBonuses: (skill, proficiencyLevel) =>
          skill ? getBardSkillBonuses(character, proficiencyLevel) : [],
        skillProficiencyEntries: getBardSkillProficiencyEntries(character),
        weaponProficiencyEntries: getBardWeaponProficiencyEntries(character),
        armorProficiencyEntries: getBardArmorProficiencyEntries(character),
        languageProficiencyEntries: getBardLanguageProficiencyEntries(character),
        alwaysPreparedSpellIds: getBardAlwaysPreparedSpellIds(character),
        transformSpellEntry: (spell) => getBardSpellEntry(character, spell),
        reactionEntries: getBardReactionEntries(character),
        bardicInspirationDie: getBardicInspirationDie(character)
      };
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
      return {
        actions: getClericFeatureActions(character),
        actionOptions: {
          "cleric-channel-divinity": getClericFeatureActionOptions(character)
        },
        getWeaponDamageBonuses: (context) => getClericWeaponDamageBonuses(character, context),
        getSkillBonuses: (skill) => getClericSkillBonuses(character, skill),
        cantripLimitBonus: getClericCantripBonus(character),
        cantripDamageBonus: getClericCantripDamageBonus(character),
        transformSpellEntry: (spell) => getClericSpellEntry(character, spell),
        transformWeaponAction: (action) => getClericWeaponAction(character, action),
        weaponProficiencyEntries: getClericWeaponProficiencyEntries(character),
        armorProficiencyEntries: getClericArmorProficiencyEntries(character)
      };
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
  Druid: {
    className: "Druid",
    stateKey: "druid",
    normalizeState: normalizeDruidFeatureState,
    collectDerived(character) {
      return {
        actions: getDruidFeatureActions(character),
        getSkillBonuses: (skill) => getDruidSkillBonuses(character, skill),
        cantripLimitBonus: getDruidCantripBonus(character),
        cantripDamageBonus: getDruidCantripDamageBonus(character),
        transformSpellEntry: (spell) => getDruidSpellEntry(character, spell),
        transformWeaponAction: (action) => getDruidWeaponAction(character, action),
        getWeaponDamageBonuses: (context) => getDruidWeaponDamageBonuses(character, context),
        weaponProficiencyEntries: getDruidWeaponProficiencyEntries(character),
        armorProficiencyEntries: getDruidArmorProficiencyEntries(character),
        languageProficiencyEntries: getDruidLanguageProficiencyEntries(character),
        alwaysPreparedSpellIds: getDruidAlwaysPreparedSpellIds(character),
        spellcastingState: getDruidSpellcastingState(character),
        derivedStatusEntries: getDruidDerivedStatusEntries(character)
      };
    },
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
    collectDerived(character) {
      return {
        actions: getFighterFeatureActions(character),
        transformWeaponAction: (action) => getFighterWeaponAction(character, action),
        weaponProficiencyEntries: getFighterWeaponProficiencyEntries(character),
        weaponMastery: createWeaponMasteryState(
          getFighterWeaponMasterySelectionCount(character),
          getFighterWeaponMasteryOptions(),
          getFighterWeaponMasterySelections(character),
          setFighterWeaponMasterySelections
        )
      };
    },
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
    collectDerived(character) {
      return {
        actions: getMonkFeatureActions(character),
        getArmorClassModes: (context) => getMonkArmorClassModes(character, context),
        getSpeedBonuses: (context) => getMonkSpeedBonuses(character, context),
        abilityScoreBonuses: getMonkAbilityScoreBonuses(character),
        savingThrowProficiencyEntries: getMonkSavingThrowProficiencyEntries(character),
        derivedStatusEntries: getMonkDerivedStatusEntries(character),
        reactionEntries: getMonkReactionEntries(character),
        transformCommonAction: (action) => getMonkCommonAction(character, action),
        transformWeaponAction: (action) => getMonkWeaponAction(character, action),
        monkMartialArtsDie: getMonkMartialArtsDie(character),
        monkUnarmedDamageTypeLabel: getMonkUnarmedDamageTypeLabel(character),
        canUseMonkMartialArts: (context) => canUseMonkMartialArts(character, context)
      };
    },
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
    collectDerived(character) {
      return {
        actions: getPaladinFeatureActions(character),
        actionOptions: {
          [paladinChannelDivinityActionKey]: getPaladinFeatureActionOptions(character)
        },
        getWeaponDamageBonuses: (context) => getPaladinWeaponDamageBonuses(character, context),
        alwaysPreparedSpellIds: getPaladinAlwaysPreparedSpellIds(character),
        weaponProficiencyEntries: getPaladinWeaponProficiencyEntries(character),
        weaponMastery: createWeaponMasteryState(
          getPaladinWeaponMasterySelectionCount(character),
          getPaladinWeaponMasteryOptions(),
          getPaladinWeaponMasterySelections(character),
          setPaladinWeaponMasterySelections
        ),
        derivedStatusEntries: getPaladinDerivedStatusEntries(character)
      };
    },
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

      if (actionKey === undyingSentinelActionKey) {
        return activateUndyingSentinel(character);
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
    collectDerived(character) {
      return {
        actions: getRangerFeatureActions(character),
        getSkillBonuses: (skill) => getRangerSkillBonuses(character, skill),
        getSpeedBonuses: (context) => getRangerSpeedBonuses(character, context),
        skillProficiencyEntries: getRangerSkillProficiencyEntries(character),
        languageProficiencyEntries: getRangerLanguageProficiencyEntries(character),
        alwaysPreparedSpellIds: getRangerAlwaysPreparedSpellIds(character),
        weaponProficiencyEntries: getRangerWeaponProficiencyEntries(character),
        weaponMastery: createWeaponMasteryState(
          getRangerWeaponMasterySelectionCount(character),
          getRangerWeaponMasteryOptions(),
          getRangerWeaponMasterySelections(character),
          setRangerWeaponMasterySelections
        ),
        derivedStatusEntries: getRangerDerivedStatusEntries(character),
        transformSpellEntry: (spell) => getRangerSpellEntry(character, spell),
        getSpellDamageFormulaOverride: (spell) => getRangerSpellDamageFormula(character, spell)
      };
    },
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
    collectDerived(character) {
      return {
        actions: getRogueFeatureActions(character),
        getSpeedBonuses: () => getRogueSpeedBonuses(character),
        skillProficiencyEntries: getRogueSkillProficiencyEntries(character),
        savingThrowProficiencyEntries: getRogueSavingThrowProficiencyEntries(character),
        languageProficiencyEntries: getRogueLanguageProficiencyEntries(character),
        reactionEntries: getRogueReactionEntries(character),
        weaponProficiencyEntries: getRogueWeaponProficiencyEntries(character),
        weaponMastery: createWeaponMasteryState(
          getRogueWeaponMasterySelectionCount(character),
          getRogueWeaponMasteryOptions(),
          getRogueWeaponMasterySelections(character),
          setRogueWeaponMasterySelections
        ),
        transformCommonAction: (action) => getRogueCommonAction(character, action),
        transformWeaponAction: (action) => getRogueWeaponAction(character, action),
        derivedStatusEntries: getRogueDerivedStatusEntries(character),
        rogueSneakAttackDiceCount: getRogueSneakAttackDiceCount(character),
        rogueSneakAttackFormula: getRogueSneakAttackFormula(character) ?? "0"
      };
    },
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
    collectDerived(character) {
      return {
        actions: getSorcererFeatureActions(character),
        actionOptions: {
          [metamagicActionKey]: getSorcererMetamagicOptionsForAction(character)
        },
        transformSpellEntry: (spell) => getSorcererSpellEntry(character, spell)
      };
    },
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
    collectDerived(character) {
      return {
        actions: getWarlockFeatureActions(character),
        alwaysPreparedSpellIds: getWarlockAlwaysPreparedSpellIds(character)
      };
    },
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
    collectDerived(character) {
      return {
        actions: getWizardFeatureActions(character),
        skillProficiencyEntries: getWizardSkillProficiencyEntries(character),
        alwaysPreparedSpellIds: getWizardAlwaysPreparedSpellIds(character)
      };
    },
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
  character: Pick<Character, "className" | "level"> &
    Partial<
      Pick<
        Character,
        | "subclassId"
        | "classFeatureState"
        | "spellSlotsExpended"
        | "abilities"
        | "statusEntries"
        | "roundTracker"
        | "equipment"
        | "customEquipment"
        | "spellbookSpellIds"
        | "cantripIds"
        | "feats"
      >
    >
): ClassFeatureDerivedState {
  const cachedState = activeClassFeatureStateCache.get(character);

  if (cachedState) {
    return cachedState;
  }

  const activeModule = getActiveClassFeatureModule(character.className);

  if (!activeModule) {
    return emptyFeatureDerivedState;
  }

  const safeCharacter: CollectedClassFeatureCharacter = {
    abilities: createDefaultAbilities(),
    subclassId: undefined,
    classFeatureState: {},
    skillProficiencies: [],
    toolProficiencies: [],
    savingThrowProficiencies: [],
    spellSlotsExpended: [],
    statusEntries: [],
    roundTracker: undefined,
    equipment: [],
    inventoryItems: [],
    customEquipment: [],
    spellbookSpellIds: [],
    cantripIds: [],
    feats: [],
    ...character
  };

  const derivedState = activeModule.collectDerived(safeCharacter);

  activeClassFeatureStateCache.set(character, derivedState);
  return derivedState;
}
