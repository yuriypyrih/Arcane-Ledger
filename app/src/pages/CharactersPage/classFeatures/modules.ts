import type { Character, CharacterClassFeatureState, WEAPON_PROFICIENCY } from "../../../types";
import { createDefaultAbilities } from "../constants";
import {
  activateBardicInspiration,
  applyLongRestToBardFeatures,
  applyShortRestToBardFeatures,
  bardicInspirationActionKey,
  getBardAlwaysPreparedSpellIds,
  getBardFeatureAction,
  getBardReactionEntries,
  getBardSkillBonuses,
  getBardSkillProficiencyEntries,
  getBardicInspirationDie,
  normalizeBardFeatureState
} from "./bard";
import {
  activateBarbarianIntimidatingPresence,
  activateBarbarianRecklessAttack,
  activateBarbarianRage,
  advanceBarbarianFeaturesForNewRound,
  applyLongRestToBarbarianFeatures,
  applyShortRestToBarbarianFeatures,
  barbarianIntimidatingPresenceActionKey,
  barbarianRageActionKey,
  barbarianRecklessAttackActionKey,
  getBarbarianAbilityCheckIndicators,
  getBarbarianAbilityScoreBonuses,
  getBarbarianArmorClassBonuses,
  getBarbarianArmorClassModes,
  getBarbarianCoreStatIndicators,
  getBarbarianDerivedConditions,
  getBarbarianFeatureActions,
  getBarbarianSavingThrowIndicators,
  getBarbarianSkillIndicators,
  getBarbarianSpeedBonuses,
  getBarbarianSpellcastingState,
  getBarbarianWeaponDamageBonuses,
  getBarbarianWeaponMasteryOptions,
  getBarbarianWeaponMasterySelectionCount,
  getBarbarianWeaponMasterySelections,
  getBarbarianWeaponProficiencyEntries,
  normalizeBarbarianRageState,
  setBarbarianWeaponMasterySelections
} from "./barbarian";
import {
  activateClericDivineIntervention,
  activateClericFeatureActionOption,
  advanceClericFeaturesForNewRound,
  applyLongRestToClericFeatures,
  applyShortRestToClericFeatures,
  divineInterventionActionKey,
  getClericArmorProficiencyEntries,
  getClericCantripBonus,
  getClericCantripDamageBonus,
  getClericFeatureActions,
  getClericFeatureActionOptions,
  getClericSkillBonuses,
  getClericWeaponDamageBonuses,
  getClericWeaponProficiencyEntries,
  normalizeClericFeatureState
} from "./cleric";
import {
  getDruidAlwaysPreparedSpellIds,
  getDruidArmorProficiencyEntries,
  getDruidCantripBonus,
  getDruidLanguageProficiencyEntries,
  getDruidSkillBonuses,
  getDruidWeaponProficiencyEntries,
  normalizeDruidFeatureState
} from "./druid";
import {
  activateFighterActionSurge,
  advanceFighterFeaturesForNewRound,
  applyLongRestToFighterFeatures,
  applyShortRestToFighterFeatures,
  consumeFighterIndomitableUse,
  consumeFighterSecondWindUse,
  fighterActionSurgeActionKey,
  fighterIndomitableActionKey,
  fighterSecondWindActionKey,
  fighterTacticalMindActionKey,
  getFighterFeatureActions,
  getFighterWeaponMasteryOptions,
  getFighterWeaponMasterySelectionCount,
  getFighterWeaponMasterySelections,
  getFighterWeaponProficiencyEntries,
  normalizeFighterFeatureState,
  setFighterWeaponMasterySelections
} from "./fighter";
import {
  activateMonkFlurryOfBlows,
  activateMonkSuperiorDefense,
  activateMonkStunningStrike,
  activateMonkUncannyMetabolism,
  advanceMonkFeaturesForNewRound,
  applyLongRestToMonkFeatures,
  applyShortRestToMonkFeatures,
  canUseMonkMartialArts,
  getMonkAbilityScoreBonuses,
  getMonkArmorClassModes,
  getMonkDerivedStatusEntries,
  getMonkFeatureActions,
  getMonkMartialArtsDie,
  getMonkReactionEntries,
  getMonkSavingThrowProficiencyEntries,
  getMonkSpeedBonuses,
  getMonkUnarmedDamageTypeLabel,
  monkFlurryOfBlowsActionKey,
  monkSuperiorDefenseActionKey,
  monkStunningStrikeActionKey,
  monkUncannyMetabolismActionKey,
  normalizeMonkFeatureState
} from "./monk";
import {
  activatePaladinFeatureActionOption,
  advancePaladinFeaturesForNewRound,
  applyLongRestToPaladinFeatures,
  applyShortRestToPaladinFeatures,
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
  normalizePaladinFeatureState,
  paladinChannelDivinityActionKey,
  paladinLayOnHandsActionKey,
  paladinsSmiteActionKey,
  setPaladinWeaponMasterySelections
} from "./paladin";
import {
  activateRangerNaturesVeil,
  advanceRangerFeaturesForNewRound,
  applyLongRestToRangerFeatures,
  applyShortRestToRangerFeatures,
  getRangerAlwaysPreparedSpellIds,
  getRangerDerivedStatusEntries,
  getRangerFeatureActions,
  getRangerLanguageProficiencyEntries,
  getRangerSkillProficiencyEntries,
  getRangerSpeedBonuses,
  getRangerSpellDamageFormula,
  getRangerSpellEntry,
  getRangerWeaponMasteryOptions,
  getRangerWeaponMasterySelectionCount,
  getRangerWeaponMasterySelections,
  getRangerWeaponProficiencyEntries,
  naturesVeilActionKey,
  normalizeRangerFeatureState,
  setRangerWeaponMasterySelections,
  tirelessActionKey,
  consumeRangerTirelessUse
} from "./ranger";
import {
  activateRogueSneakAttack,
  activateRogueSteadyAim,
  advanceRogueFeaturesForNewRound,
  applyLongRestToRogueFeatures,
  applyShortRestToRogueFeatures,
  consumeRogueStrokeOfLuckUse,
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
  getRogueWeaponProficiencyEntries,
  normalizeRogueFeatureState,
  rogueSneakAttackActionKey,
  rogueSteadyAimActionKey,
  rogueStrokeOfLuckActionKey,
  setRogueWeaponMasterySelections
} from "./rogue";
import {
  activateInnateSorcery,
  advanceSorcererFeaturesForNewRound,
  applyLongRestToSorcererFeatures,
  applyShortRestToSorcererFeatures,
  getSorcererFeatureActions,
  getSorcererMetamagicOptionsForAction,
  metamagicActionKey,
  innateSorceryActionKey,
  normalizeSorcererFeatureState,
  spendMetamagicOption
} from "./sorcerer";
import {
  activateWarlockMagicalCunning,
  contactPatronActionKey,
  getWarlockAlwaysPreparedSpellIds,
  getWarlockFeatureActions,
  magicalCunningActionKey,
  mysticArcanumActionKey,
  normalizeWarlockFeatureState,
  restoreContactPatronOnLongRest,
  restoreMysticArcanumOnLongRest,
  restoreWarlockMagicalCunningOnLongRest
} from "./warlock";
import {
  arcaneRecoveryActionKey,
  applyLongRestToWizardFeatures,
  applyShortRestToWizardFeatures,
  getWizardAlwaysPreparedSpellIds,
  getWizardFeatureActions,
  getWizardSkillProficiencyEntries,
  normalizeWizardFeatureState
} from "./wizard";
import type {
  ActiveClassFeatureName,
  CollectedClassFeatureCharacter,
  ClassFeatureDerivedState,
  ClassFeatureModule
} from "./types";

const emptyFeatureDerivedState: ClassFeatureDerivedState = {};

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
        getWeaponDamageBonuses: (context) => getBarbarianWeaponDamageBonuses(character, context),
        savingThrowIndicators: getBarbarianSavingThrowIndicators(character),
        abilityCheckIndicators: getBarbarianAbilityCheckIndicators(character),
        coreStatIndicators: getBarbarianCoreStatIndicators(character),
        skillIndicators: getBarbarianSkillIndicators(character),
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

      if (actionKey === barbarianIntimidatingPresenceActionKey) {
        return activateBarbarianIntimidatingPresence(character);
      }

      return null;
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
        alwaysPreparedSpellIds: getBardAlwaysPreparedSpellIds(character),
        reactionEntries: getBardReactionEntries(character),
        bardicInspirationDie: getBardicInspirationDie(character)
      };
    },
    handleAction(character, actionKey) {
      return actionKey === bardicInspirationActionKey ? activateBardicInspiration(character) : null;
    },
    applyShortRest: applyShortRestToBardFeatures,
    applyLongRest: applyLongRestToBardFeatures
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
        weaponProficiencyEntries: getClericWeaponProficiencyEntries(character),
        armorProficiencyEntries: getClericArmorProficiencyEntries(character)
      };
    },
    handleAction(character, actionKey) {
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
        getSkillBonuses: (skill) => getDruidSkillBonuses(character, skill),
        cantripLimitBonus: getDruidCantripBonus(character),
        weaponProficiencyEntries: getDruidWeaponProficiencyEntries(character),
        armorProficiencyEntries: getDruidArmorProficiencyEntries(character),
        languageProficiencyEntries: getDruidLanguageProficiencyEntries(character),
        alwaysPreparedSpellIds: getDruidAlwaysPreparedSpellIds(character)
      };
    }
  },
  Fighter: {
    className: "Fighter",
    stateKey: "fighter",
    normalizeState: normalizeFighterFeatureState,
    collectDerived(character) {
      return {
        actions: getFighterFeatureActions(character),
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
        monkMartialArtsDie: getMonkMartialArtsDie(character),
        monkUnarmedDamageTypeLabel: getMonkUnarmedDamageTypeLabel(character),
        canUseMonkMartialArts: (context) => canUseMonkMartialArts(character, context)
      };
    },
    handleAction(character, actionKey) {
      if (actionKey === monkFlurryOfBlowsActionKey) {
        return activateMonkFlurryOfBlows(character);
      }

      if (actionKey === monkUncannyMetabolismActionKey) {
        return activateMonkUncannyMetabolism(character);
      }

      if (actionKey === monkStunningStrikeActionKey) {
        return activateMonkStunningStrike(character);
      }

      if (actionKey === monkSuperiorDefenseActionKey) {
        return activateMonkSuperiorDefense(character);
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

      if (actionKey === naturesVeilActionKey) {
        return activateRangerNaturesVeil(character);
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
        }
      };
    },
    handleAction(character, actionKey) {
      return actionKey === innateSorceryActionKey ? activateInnateSorcery(character) : null;
    },
    handleActionOption(character, actionKey, optionKey) {
      return actionKey === metamagicActionKey ? spendMetamagicOption(character, optionKey) : null;
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
      if (actionKey === magicalCunningActionKey) {
        return activateWarlockMagicalCunning(character);
      }

      if (actionKey === contactPatronActionKey || actionKey === mysticArcanumActionKey) {
        return character;
      }

      return null;
    },
    applyLongRest(character) {
      return restoreMysticArcanumOnLongRest(
        restoreContactPatronOnLongRest(restoreWarlockMagicalCunningOnLongRest(character))
      );
    }
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
      return actionKey === arcaneRecoveryActionKey ? character : null;
    },
    applyShortRest: applyShortRestToWizardFeatures,
    applyLongRest: applyLongRestToWizardFeatures
  }
} as Record<
  ActiveClassFeatureName,
  ClassFeatureModule<keyof CharacterClassFeatureState>
>;

export function getClassFeatureModules(): ClassFeatureModule<
  keyof CharacterClassFeatureState
>[] {
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
        | "abilities"
        | "statusEntries"
        | "equipment"
        | "customEquipment"
        | "spellbookSpellIds"
        | "cantripIds"
        | "feats"
      >
    >
): ClassFeatureDerivedState {
  const activeModule = getActiveClassFeatureModule(character.className);

  if (!activeModule) {
    return emptyFeatureDerivedState;
  }

  const safeCharacter: CollectedClassFeatureCharacter = {
    abilities: createDefaultAbilities(),
    subclassId: undefined,
    classFeatureState: {},
    statusEntries: [],
    equipment: [],
    customEquipment: [],
    spellbookSpellIds: [],
    cantripIds: [],
    feats: [],
    ...character
  };

  return activeModule.collectDerived(safeCharacter);
}
