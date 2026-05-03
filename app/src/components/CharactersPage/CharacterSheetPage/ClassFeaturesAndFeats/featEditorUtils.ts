import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { DAMAGE_TYPE, FEATS, type SpellEntry } from "../../../../codex/entries";
import {
  elementalAdeptAbilityOptions,
  elementalAdeptDamageTypeOptions,
  feyTouchedAbilityOptions,
  heavilyArmoredAbilityOptions,
  heavyArmorMasterAbilityOptions,
  inspiringLeaderAbilityOptions,
  keenMindSkillOptions,
  lightlyArmoredAbilityOptions,
  mageSlayerAbilityOptions,
  martialWeaponTrainingAbilityOptions,
  mediumArmorMasterAbilityOptions,
  moderatelyArmoredAbilityOptions,
  mountedCombatantAbilityOptions,
  observantAbilityOptions,
  observantSkillOptions,
  piercerAbilityOptions,
  poisonerAbilityOptions,
  resilientAbilityOptions,
  speedyAbilityOptions,
  weaponMasterAbilityOptions,
  weaponMasterMasteryOptions,
  getBlessedWarriorCantripOptions,
  getBlessedWarriorChoiceSummary,
  getAthleteChoiceSummary,
  getChargerChoiceSummary,
  getChefChoiceSummary,
  getCharacterFeatSourceLabel,
  getCharacterFeatSummary,
  getCrusherChoiceSummary,
  getDualWielderChoiceSummary,
  getElementalAdeptChoiceSummary,
  getFeyTouchedChoiceSummary,
  getHeavilyArmoredChoiceSummary,
  getHeavyArmorMasterChoiceSummary,
  getInspiringLeaderChoiceSummary,
  getKeenMindChoiceSummary,
  getLightlyArmoredChoiceSummary,
  getMageSlayerChoiceSummary,
  getMartialWeaponTrainingChoiceSummary,
  getMediumArmorMasterChoiceSummary,
  getModeratelyArmoredChoiceSummary,
  getMountedCombatantChoiceSummary,
  getObservantChoiceSummary,
  getPiercerChoiceSummary,
  getPoisonerChoiceSummary,
  getResilientChoiceSummary,
  getSpeedyChoiceSummary,
  getWeaponMasterChoiceSummary,
  getDruidicWarriorCantripOptions,
  getDruidicWarriorChoiceSummary,
  getEpicBoonAbilityOptions,
  getMagicInitiateCantripOptions,
  getMagicInitiateChoiceSummary,
  getMagicInitiateLevelOneSpellOptions,
  getFeyTouchedSpellOptions,
  getMusicianChoiceSummary,
  isMagicInitiateSpellList,
  magicInitiateSpellcastingAbilityOptions,
  getSkilledChoiceSummary
} from "../../../../pages/CharactersPage/feats";
import {
  getCrafterChoiceSummary,
  isCrafterFastCraftingTool
} from "../../../../pages/CharactersPage/feats/crafter";
import {
  skillsOptions,
  musicalInstrumentToolProficiencies,
  toolProficiencyOptions,
  type ToolProficiency
} from "../../../../pages/CharactersPage/proficiencyOptions";
import type {
  BlessedWarriorChoice,
  CharacterFeatEntry,
  ChargerChoice,
  ChefChoice,
  CrusherChoice,
  DualWielderChoice,
  ElementalAdeptChoice,
  CrafterChoice,
  DruidicWarriorChoice,
  FeyTouchedChoice,
  HeavilyArmoredChoice,
  HeavyArmorMasterChoice,
  InspiringLeaderChoice,
  KeenMindChoice,
  LightlyArmoredChoice,
  MageSlayerChoice,
  MartialWeaponTrainingChoice,
  MediumArmorMasterChoice,
  ModeratelyArmoredChoice,
  MountedCombatantChoice,
  ObservantChoice,
  PiercerChoice,
  PoisonerChoice,
  ResilientChoice,
  SpeedyChoice,
  WeaponMasterChoice,
  MagicInitiateChoice,
  MusicianChoice,
  SkillName,
  SkilledChoice,
  SkilledFeatSelection
} from "../../../../types";
import type {
  PendingAbilityScoreImprovement,
  PendingAthleteChoice,
  PendingBlessedWarriorChoice,
  PendingBoonOfIrresistibleOffense,
  PendingChargerChoice,
  PendingChefChoice,
  PendingCrusherChoice,
  PendingDualWielderChoice,
  PendingElementalAdeptChoice,
  PendingCrafterChoice,
  PendingDruidicWarriorChoice,
  PendingEpicBoonAbilityChoice,
  PendingFeyTouchedChoice,
  PendingFeatState,
  PendingHeavilyArmoredChoice,
  PendingHeavyArmorMasterChoice,
  PendingInspiringLeaderChoice,
  PendingKeenMindChoice,
  PendingLightlyArmoredChoice,
  PendingMageSlayerChoice,
  PendingMartialWeaponTrainingChoice,
  PendingMediumArmorMasterChoice,
  PendingModeratelyArmoredChoice,
  PendingMountedCombatantChoice,
  PendingObservantChoice,
  PendingPiercerChoice,
  PendingPoisonerChoice,
  PendingResilientChoice,
  PendingSpeedyChoice,
  PendingWeaponMasterChoice,
  PendingMagicInitiateChoice,
  PendingMusicianChoice,
  PendingSkilledChoice
} from "./types";

const skilledSkillOptionSet = new Set<string>(skillsOptions);
const skilledToolOptionSet = new Set<string>(toolProficiencyOptions);

export const skilledNoneOptionValue = "none";
export const skilledSelectionIndices = [0, 1, 2] as const;
export const crafterNoneOptionValue = "none";
export const crafterSelectionIndices = [0, 1, 2] as const;
export const musicianNoneOptionValue = "none";
export const musicianSelectionIndices = [0, 1, 2] as const;
export const magicInitiateNoneOptionValue = "none";
export const magicInitiateCantripSelectionIndices = [0, 1] as const;
export const feyTouchedNoneOptionValue = "none";
export const observantNoneOptionValue = "none";
export const keenMindNoneOptionValue = "none";
export const resilientNoneOptionValue = "none";
export const weaponMasterNoneOptionValue = "none";
const musicianToolOptionSet = new Set<ToolProficiency>(musicalInstrumentToolProficiencies);
const keenMindSkillOptionSet = new Set<string>(keenMindSkillOptions);

function createDefaultPendingCantripChoice(
  options: SpellEntry[],
  recommendedSpellNames: [string, string]
): [string, string] {
  const optionMap = new Map(options.map((spell) => [spell.name, spell.id] as const));
  const firstRecommendedChoice = optionMap.get(recommendedSpellNames[0]);
  const secondRecommendedChoice = optionMap.get(recommendedSpellNames[1]);
  const allOptionIds = options.map((spell) => spell.id);
  const firstChoice = firstRecommendedChoice ?? allOptionIds[0] ?? "";
  const secondChoice =
    secondRecommendedChoice && secondRecommendedChoice !== firstChoice
      ? secondRecommendedChoice
      : (allOptionIds.find((spellId) => spellId !== firstChoice) ?? "");

  return [firstChoice, secondChoice];
}

function decodeSkilledSelection(value: string): SkilledFeatSelection | null {
  if (value === skilledNoneOptionValue) {
    return null;
  }

  if (value.startsWith("skill:")) {
    const skill = value.slice("skill:".length) as SkillName;

    if (skilledSkillOptionSet.has(skill)) {
      return {
        kind: "skill",
        skill
      };
    }

    return null;
  }

  if (value.startsWith("tool:")) {
    const tool = value.slice("tool:".length) as ToolProficiency;

    if (skilledToolOptionSet.has(tool)) {
      return {
        kind: "tool",
        tool
      };
    }
  }

  return null;
}

function decodePendingCantripChoice<TChoice extends BlessedWarriorChoice | DruidicWarriorChoice>(
  choice: { cantripIds: [string, string] },
  options: SpellEntry[]
): TChoice | null {
  const cantripIds = [...new Set(choice.cantripIds.filter((spellId) => spellId.length > 0))];

  if (cantripIds.length !== 2) {
    return null;
  }

  const optionIds = new Set(options.map((spell) => spell.id));

  if (!cantripIds.every((spellId) => optionIds.has(spellId))) {
    return null;
  }

  return {
    cantripIds: cantripIds as TChoice["cantripIds"]
  } as TChoice;
}

export function createEmptyPendingFeatState(): PendingFeatState {
  return {
    abilityScoreImprovement: null,
    athleteChoice: null,
    chargerChoice: null,
    chefChoice: null,
    crusherChoice: null,
    dualWielderChoice: null,
    elementalAdeptChoice: null,
    feyTouchedChoice: null,
    heavilyArmoredChoice: null,
    heavyArmorMasterChoice: null,
    inspiringLeaderChoice: null,
    keenMindChoice: null,
    lightlyArmoredChoice: null,
    mageSlayerChoice: null,
    martialWeaponTrainingChoice: null,
    mediumArmorMasterChoice: null,
    moderatelyArmoredChoice: null,
    mountedCombatantChoice: null,
    observantChoice: null,
    piercerChoice: null,
    poisonerChoice: null,
    resilientChoice: null,
    speedyChoice: null,
    weaponMasterChoice: null,
    boonOfIrresistibleOffense: null,
    blessedWarriorChoice: null,
    crafterChoice: null,
    druidicWarriorChoice: null,
    magicInitiateChoice: null,
    musicianChoice: null,
    epicBoonAbilityChoice: null,
    skilledChoice: null
  };
}

export function createDefaultPendingAbilityScoreImprovement(): PendingAbilityScoreImprovement {
  return {
    mode: "single",
    primaryAbility: "STR",
    secondaryAbility: "DEX"
  };
}

export function createDefaultPendingBoonOfIrresistibleOffense(): PendingBoonOfIrresistibleOffense {
  return {
    ability: "STR"
  };
}

export function createDefaultPendingAthleteChoice(): PendingAthleteChoice {
  return {
    ability: "STR"
  };
}

export function createDefaultPendingChargerChoice(): PendingChargerChoice {
  return {
    ability: "STR"
  };
}

export function createDefaultPendingChefChoice(): PendingChefChoice {
  return {
    ability: "CON"
  };
}

export function createDefaultPendingCrusherChoice(): PendingCrusherChoice {
  return {
    ability: "STR"
  };
}

export function createDefaultPendingDualWielderChoice(): PendingDualWielderChoice {
  return {
    ability: "STR"
  };
}

export function createDefaultPendingElementalAdeptChoice(): PendingElementalAdeptChoice {
  return {
    ability: "INT",
    damageType: DAMAGE_TYPE.ACID
  };
}

export function createDefaultPendingFeyTouchedChoice(): PendingFeyTouchedChoice {
  return {
    ability: "INT",
    spellId: feyTouchedNoneOptionValue
  };
}

export function createDefaultPendingHeavilyArmoredChoice(): PendingHeavilyArmoredChoice {
  return {
    ability: "CON"
  };
}

export function createDefaultPendingHeavyArmorMasterChoice(): PendingHeavyArmorMasterChoice {
  return {
    ability: "CON"
  };
}

export function createDefaultPendingInspiringLeaderChoice(): PendingInspiringLeaderChoice {
  return {
    ability: "WIS"
  };
}

export function createDefaultPendingKeenMindChoice(): PendingKeenMindChoice {
  return {
    skill: keenMindNoneOptionValue
  };
}

export function createDefaultPendingLightlyArmoredChoice(): PendingLightlyArmoredChoice {
  return {
    ability: "STR"
  };
}

export function createDefaultPendingMageSlayerChoice(): PendingMageSlayerChoice {
  return {
    ability: "STR"
  };
}

export function createDefaultPendingMartialWeaponTrainingChoice(): PendingMartialWeaponTrainingChoice {
  return {
    ability: "STR"
  };
}

export function createDefaultPendingMediumArmorMasterChoice(): PendingMediumArmorMasterChoice {
  return {
    ability: "STR"
  };
}

export function createDefaultPendingModeratelyArmoredChoice(): PendingModeratelyArmoredChoice {
  return {
    ability: "STR"
  };
}

export function createDefaultPendingMountedCombatantChoice(): PendingMountedCombatantChoice {
  return {
    ability: "STR"
  };
}

export function createDefaultPendingObservantChoice(): PendingObservantChoice {
  return {
    ability: "INT",
    skill: observantNoneOptionValue
  };
}

export function createDefaultPendingPiercerChoice(): PendingPiercerChoice {
  return {
    ability: "STR"
  };
}

export function createDefaultPendingPoisonerChoice(): PendingPoisonerChoice {
  return {
    ability: "DEX"
  };
}

export function createDefaultPendingResilientChoice(): PendingResilientChoice {
  return {
    ability: resilientNoneOptionValue
  };
}

export function createDefaultPendingSpeedyChoice(): PendingSpeedyChoice {
  return {
    ability: "DEX"
  };
}

export function createDefaultPendingWeaponMasterChoice(): PendingWeaponMasterChoice {
  return {
    ability: "STR",
    weaponMastery: weaponMasterNoneOptionValue
  };
}

export function createDefaultPendingBlessedWarriorChoice(): PendingBlessedWarriorChoice {
  return {
    cantripIds: createDefaultPendingCantripChoice(getBlessedWarriorCantripOptions(), [
      "Guidance",
      "Sacred Flame"
    ])
  };
}

export function createDefaultPendingDruidicWarriorChoice(): PendingDruidicWarriorChoice {
  return {
    cantripIds: createDefaultPendingCantripChoice(getDruidicWarriorCantripOptions(), [
      "Guidance",
      "Starry Wisp"
    ])
  };
}

export function createDefaultPendingCrafterChoice(): PendingCrafterChoice {
  return {
    toolProficiencies: [
      crafterNoneOptionValue,
      crafterNoneOptionValue,
      crafterNoneOptionValue
    ]
  };
}

export function createDefaultPendingMagicInitiateChoice(): PendingMagicInitiateChoice {
  return {
    spellList: magicInitiateNoneOptionValue,
    cantripIds: ["", ""],
    levelOneSpellId: "",
    spellcastingAbility: magicInitiateNoneOptionValue
  };
}

export function createDefaultPendingMusicianChoice(): PendingMusicianChoice {
  return {
    toolProficiencies: [
      musicianNoneOptionValue,
      musicianNoneOptionValue,
      musicianNoneOptionValue
    ]
  };
}

export function createDefaultPendingEpicBoonAbilityChoice(
  feat: FEATS
): PendingEpicBoonAbilityChoice | null {
  const abilityOptions = getEpicBoonAbilityOptions(feat);

  if (!abilityOptions || abilityOptions.length === 0) {
    return null;
  }

  return {
    feat,
    ability: abilityOptions[0]
  };
}

export function createDefaultPendingSkilledChoice(): PendingSkilledChoice {
  return {
    selections: [skilledNoneOptionValue, skilledNoneOptionValue, skilledNoneOptionValue]
  };
}

export function createPendingFeatStateForFeat(feat: FEATS): PendingFeatState | null {
  if (feat === FEATS.ABILITY_SCORE_IMPROVEMENT) {
    return {
      ...createEmptyPendingFeatState(),
      abilityScoreImprovement: createDefaultPendingAbilityScoreImprovement()
    };
  }

  if (feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE) {
    return {
      ...createEmptyPendingFeatState(),
      boonOfIrresistibleOffense: createDefaultPendingBoonOfIrresistibleOffense()
    };
  }

  if (feat === FEATS.ATHLETE) {
    return {
      ...createEmptyPendingFeatState(),
      athleteChoice: createDefaultPendingAthleteChoice()
    };
  }

  if (feat === FEATS.CHARGER) {
    return {
      ...createEmptyPendingFeatState(),
      chargerChoice: createDefaultPendingChargerChoice()
    };
  }

  if (feat === FEATS.CHEF) {
    return {
      ...createEmptyPendingFeatState(),
      chefChoice: createDefaultPendingChefChoice()
    };
  }

  if (feat === FEATS.CRUSHER) {
    return {
      ...createEmptyPendingFeatState(),
      crusherChoice: createDefaultPendingCrusherChoice()
    };
  }

  if (feat === FEATS.DUAL_WIELDER) {
    return {
      ...createEmptyPendingFeatState(),
      dualWielderChoice: createDefaultPendingDualWielderChoice()
    };
  }

  if (feat === FEATS.ELEMENTAL_ADEPT) {
    return {
      ...createEmptyPendingFeatState(),
      elementalAdeptChoice: createDefaultPendingElementalAdeptChoice()
    };
  }

  if (feat === FEATS.FEY_TOUCHED) {
    return {
      ...createEmptyPendingFeatState(),
      feyTouchedChoice: createDefaultPendingFeyTouchedChoice()
    };
  }

  if (feat === FEATS.HEAVILY_ARMORED) {
    return {
      ...createEmptyPendingFeatState(),
      heavilyArmoredChoice: createDefaultPendingHeavilyArmoredChoice()
    };
  }

  if (feat === FEATS.HEAVY_ARMOR_MASTER) {
    return {
      ...createEmptyPendingFeatState(),
      heavyArmorMasterChoice: createDefaultPendingHeavyArmorMasterChoice()
    };
  }

  if (feat === FEATS.INSPIRING_LEADER) {
    return {
      ...createEmptyPendingFeatState(),
      inspiringLeaderChoice: createDefaultPendingInspiringLeaderChoice()
    };
  }

  if (feat === FEATS.KEEN_MIND) {
    return {
      ...createEmptyPendingFeatState(),
      keenMindChoice: createDefaultPendingKeenMindChoice()
    };
  }

  if (feat === FEATS.LIGHTLY_ARMORED) {
    return {
      ...createEmptyPendingFeatState(),
      lightlyArmoredChoice: createDefaultPendingLightlyArmoredChoice()
    };
  }

  if (feat === FEATS.MAGE_SLAYER) {
    return {
      ...createEmptyPendingFeatState(),
      mageSlayerChoice: createDefaultPendingMageSlayerChoice()
    };
  }

  if (feat === FEATS.MARTIAL_WEAPON_TRAINING) {
    return {
      ...createEmptyPendingFeatState(),
      martialWeaponTrainingChoice: createDefaultPendingMartialWeaponTrainingChoice()
    };
  }

  if (feat === FEATS.MEDIUM_ARMOR_MASTER) {
    return {
      ...createEmptyPendingFeatState(),
      mediumArmorMasterChoice: createDefaultPendingMediumArmorMasterChoice()
    };
  }

  if (feat === FEATS.MODERATELY_ARMORED) {
    return {
      ...createEmptyPendingFeatState(),
      moderatelyArmoredChoice: createDefaultPendingModeratelyArmoredChoice()
    };
  }

  if (feat === FEATS.MOUNTED_COMBATANT) {
    return {
      ...createEmptyPendingFeatState(),
      mountedCombatantChoice: createDefaultPendingMountedCombatantChoice()
    };
  }

  if (feat === FEATS.OBSERVANT) {
    return {
      ...createEmptyPendingFeatState(),
      observantChoice: createDefaultPendingObservantChoice()
    };
  }

  if (feat === FEATS.PIERCER) {
    return {
      ...createEmptyPendingFeatState(),
      piercerChoice: createDefaultPendingPiercerChoice()
    };
  }

  if (feat === FEATS.POISONER) {
    return {
      ...createEmptyPendingFeatState(),
      poisonerChoice: createDefaultPendingPoisonerChoice()
    };
  }

  if (feat === FEATS.RESILIENT) {
    return {
      ...createEmptyPendingFeatState(),
      resilientChoice: createDefaultPendingResilientChoice()
    };
  }

  if (feat === FEATS.SPEEDY) {
    return {
      ...createEmptyPendingFeatState(),
      speedyChoice: createDefaultPendingSpeedyChoice()
    };
  }

  if (feat === FEATS.WEAPON_MASTER) {
    return {
      ...createEmptyPendingFeatState(),
      weaponMasterChoice: createDefaultPendingWeaponMasterChoice()
    };
  }

  if (feat === FEATS.BLESSED_WARRIOR) {
    return {
      ...createEmptyPendingFeatState(),
      blessedWarriorChoice: createDefaultPendingBlessedWarriorChoice()
    };
  }

  if (feat === FEATS.DRUIDIC_WARRIOR) {
    return {
      ...createEmptyPendingFeatState(),
      druidicWarriorChoice: createDefaultPendingDruidicWarriorChoice()
    };
  }

  if (feat === FEATS.CRAFTER) {
    return {
      ...createEmptyPendingFeatState(),
      crafterChoice: createDefaultPendingCrafterChoice()
    };
  }

  if (feat === FEATS.MAGIC_INITIATE) {
    return {
      ...createEmptyPendingFeatState(),
      magicInitiateChoice: createDefaultPendingMagicInitiateChoice()
    };
  }

  if (feat === FEATS.MUSICIAN) {
    return {
      ...createEmptyPendingFeatState(),
      musicianChoice: createDefaultPendingMusicianChoice()
    };
  }

  const epicBoonAbilityChoice = createDefaultPendingEpicBoonAbilityChoice(feat);

  if (epicBoonAbilityChoice) {
    return {
      ...createEmptyPendingFeatState(),
      epicBoonAbilityChoice
    };
  }

  if (feat === FEATS.SKILLED) {
    return {
      ...createEmptyPendingFeatState(),
      skilledChoice: createDefaultPendingSkilledChoice()
    };
  }

  return null;
}

function encodeSkilledSelection(selection: SkilledFeatSelection): string {
  return selection.kind === "skill" ? `skill:${selection.skill}` : `tool:${selection.tool}`;
}

export function createPendingFeatStateForEntry(entry: CharacterFeatEntry): PendingFeatState | null {
  const fallbackState = createPendingFeatStateForFeat(entry.feat);

  if (entry.feat === FEATS.ABILITY_SCORE_IMPROVEMENT && entry.abilityScoreImprovement) {
    return {
      ...createEmptyPendingFeatState(),
      abilityScoreImprovement:
        entry.abilityScoreImprovement.mode === "single"
          ? {
              mode: "single",
              primaryAbility: entry.abilityScoreImprovement.primaryAbility,
              secondaryAbility: "DEX"
            }
          : {
              mode: "split",
              primaryAbility: entry.abilityScoreImprovement.primaryAbility,
              secondaryAbility: entry.abilityScoreImprovement.secondaryAbility
            }
    };
  }

  if (entry.feat === FEATS.BLESSED_WARRIOR && entry.blessedWarrior) {
    return {
      ...createEmptyPendingFeatState(),
      blessedWarriorChoice: {
        cantripIds: entry.blessedWarrior.cantripIds
      }
    };
  }

  if (entry.feat === FEATS.ATHLETE && entry.athlete) {
    return {
      ...createEmptyPendingFeatState(),
      athleteChoice: {
        ability: entry.athlete.ability
      }
    };
  }

  if (entry.feat === FEATS.CHARGER && entry.charger) {
    return {
      ...createEmptyPendingFeatState(),
      chargerChoice: {
        ability: entry.charger.ability
      }
    };
  }

  if (entry.feat === FEATS.CHEF && entry.chef) {
    return {
      ...createEmptyPendingFeatState(),
      chefChoice: {
        ability: entry.chef.ability
      }
    };
  }

  if (entry.feat === FEATS.CRUSHER && entry.crusher) {
    return {
      ...createEmptyPendingFeatState(),
      crusherChoice: {
        ability: entry.crusher.ability
      }
    };
  }

  if (entry.feat === FEATS.DUAL_WIELDER && entry.dualWielder) {
    return {
      ...createEmptyPendingFeatState(),
      dualWielderChoice: {
        ability: entry.dualWielder.ability
      }
    };
  }

  if (entry.feat === FEATS.ELEMENTAL_ADEPT && entry.elementalAdept) {
    return {
      ...createEmptyPendingFeatState(),
      elementalAdeptChoice: {
        ability: entry.elementalAdept.ability,
        damageType: entry.elementalAdept.damageType
      }
    };
  }

  if (entry.feat === FEATS.FEY_TOUCHED && entry.feyTouched) {
    return {
      ...createEmptyPendingFeatState(),
      feyTouchedChoice: {
        ability: entry.feyTouched.ability,
        spellId: entry.feyTouched.spellId
      }
    };
  }

  if (entry.feat === FEATS.HEAVILY_ARMORED && entry.heavilyArmored) {
    return {
      ...createEmptyPendingFeatState(),
      heavilyArmoredChoice: {
        ability: entry.heavilyArmored.ability
      }
    };
  }

  if (entry.feat === FEATS.HEAVY_ARMOR_MASTER && entry.heavyArmorMaster) {
    return {
      ...createEmptyPendingFeatState(),
      heavyArmorMasterChoice: {
        ability: entry.heavyArmorMaster.ability
      }
    };
  }

  if (entry.feat === FEATS.INSPIRING_LEADER && entry.inspiringLeader) {
    return {
      ...createEmptyPendingFeatState(),
      inspiringLeaderChoice: {
        ability: entry.inspiringLeader.ability
      }
    };
  }

  if (entry.feat === FEATS.KEEN_MIND && entry.keenMind) {
    return {
      ...createEmptyPendingFeatState(),
      keenMindChoice: {
        skill: entry.keenMind.skill
      }
    };
  }

  if (entry.feat === FEATS.LIGHTLY_ARMORED && entry.lightlyArmored) {
    return {
      ...createEmptyPendingFeatState(),
      lightlyArmoredChoice: {
        ability: entry.lightlyArmored.ability
      }
    };
  }

  if (entry.feat === FEATS.MAGE_SLAYER && entry.mageSlayer) {
    return {
      ...createEmptyPendingFeatState(),
      mageSlayerChoice: {
        ability: entry.mageSlayer.ability
      }
    };
  }

  if (entry.feat === FEATS.MARTIAL_WEAPON_TRAINING && entry.martialWeaponTraining) {
    return {
      ...createEmptyPendingFeatState(),
      martialWeaponTrainingChoice: {
        ability: entry.martialWeaponTraining.ability
      }
    };
  }

  if (entry.feat === FEATS.MEDIUM_ARMOR_MASTER && entry.mediumArmorMaster) {
    return {
      ...createEmptyPendingFeatState(),
      mediumArmorMasterChoice: {
        ability: entry.mediumArmorMaster.ability
      }
    };
  }

  if (entry.feat === FEATS.MODERATELY_ARMORED && entry.moderatelyArmored) {
    return {
      ...createEmptyPendingFeatState(),
      moderatelyArmoredChoice: {
        ability: entry.moderatelyArmored.ability
      }
    };
  }

  if (entry.feat === FEATS.MOUNTED_COMBATANT && entry.mountedCombatant) {
    return {
      ...createEmptyPendingFeatState(),
      mountedCombatantChoice: {
        ability: entry.mountedCombatant.ability
      }
    };
  }

  if (entry.feat === FEATS.OBSERVANT && entry.observant) {
    return {
      ...createEmptyPendingFeatState(),
      observantChoice: {
        ability: entry.observant.ability,
        skill: entry.observant.skill
      }
    };
  }

  if (entry.feat === FEATS.PIERCER && entry.piercer) {
    return {
      ...createEmptyPendingFeatState(),
      piercerChoice: {
        ability: entry.piercer.ability
      }
    };
  }

  if (entry.feat === FEATS.POISONER && entry.poisoner) {
    return {
      ...createEmptyPendingFeatState(),
      poisonerChoice: {
        ability: entry.poisoner.ability
      }
    };
  }

  if (entry.feat === FEATS.RESILIENT && entry.resilient) {
    return {
      ...createEmptyPendingFeatState(),
      resilientChoice: {
        ability: entry.resilient.ability
      }
    };
  }

  if (entry.feat === FEATS.SPEEDY && entry.speedy) {
    return {
      ...createEmptyPendingFeatState(),
      speedyChoice: {
        ability: entry.speedy.ability
      }
    };
  }

  if (entry.feat === FEATS.WEAPON_MASTER && entry.weaponMaster) {
    return {
      ...createEmptyPendingFeatState(),
      weaponMasterChoice: {
        ability: entry.weaponMaster.ability,
        weaponMastery: entry.weaponMaster.weaponMastery
      }
    };
  }

  if (entry.feat === FEATS.DRUIDIC_WARRIOR && entry.druidicWarrior) {
    return {
      ...createEmptyPendingFeatState(),
      druidicWarriorChoice: {
        cantripIds: entry.druidicWarrior.cantripIds
      }
    };
  }

  if (entry.feat === FEATS.CRAFTER && entry.crafter) {
    return {
      ...createEmptyPendingFeatState(),
      crafterChoice: {
        toolProficiencies: entry.crafter.toolProficiencies
      }
    };
  }

  if (entry.feat === FEATS.MAGIC_INITIATE && entry.magicInitiate) {
    return {
      ...createEmptyPendingFeatState(),
      magicInitiateChoice: {
        spellList: entry.magicInitiate.spellList,
        lockedSpellList:
          entry.source.type === "background" ? entry.magicInitiate.spellList : undefined,
        cantripIds: entry.magicInitiate.cantripIds,
        levelOneSpellId: entry.magicInitiate.levelOneSpellId,
        spellcastingAbility: entry.magicInitiate.spellcastingAbility
      }
    };
  }

  if (entry.feat === FEATS.MUSICIAN && entry.musician) {
    return {
      ...createEmptyPendingFeatState(),
      musicianChoice: {
        toolProficiencies: entry.musician.toolProficiencies
      }
    };
  }

  if (entry.feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE && entry.boonOfIrresistibleOffense) {
    return {
      ...createEmptyPendingFeatState(),
      boonOfIrresistibleOffense: {
        ability: entry.boonOfIrresistibleOffense.ability
      }
    };
  }

  if (entry.epicBoonAbilityChoice) {
    return {
      ...createEmptyPendingFeatState(),
      epicBoonAbilityChoice: {
        feat: entry.feat,
        ability: entry.epicBoonAbilityChoice.ability
      }
    };
  }

  if (entry.feat === FEATS.SKILLED && entry.skilled) {
    return {
      ...createEmptyPendingFeatState(),
      skilledChoice: {
        selections: entry.skilled.selections.map(encodeSkilledSelection) as [
          string,
          string,
          string
        ]
      }
    };
  }

  return fallbackState;
}

export function decodePendingBlessedWarriorChoice(
  choice: PendingBlessedWarriorChoice
): BlessedWarriorChoice | null {
  return decodePendingCantripChoice<BlessedWarriorChoice>(
    choice,
    getBlessedWarriorCantripOptions()
  );
}

export function isPendingBlessedWarriorChoiceValid(choice: PendingBlessedWarriorChoice): boolean {
  return decodePendingBlessedWarriorChoice(choice) !== null;
}

export function getPendingBlessedWarriorChoiceSummary(
  choice: PendingBlessedWarriorChoice
): string | null {
  return getBlessedWarriorChoiceSummary(decodePendingBlessedWarriorChoice(choice) ?? undefined);
}

export function getPendingAthleteChoiceSummary(choice: PendingAthleteChoice): string | null {
  return getAthleteChoiceSummary(choice);
}

export function decodePendingChargerChoice(choice: PendingChargerChoice): ChargerChoice | null {
  return choice.ability === "STR" || choice.ability === "DEX"
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingChargerChoiceSummary(choice: PendingChargerChoice): string | null {
  return getChargerChoiceSummary(decodePendingChargerChoice(choice) ?? undefined);
}

export function decodePendingChefChoice(choice: PendingChefChoice): ChefChoice | null {
  return choice.ability === "CON" || choice.ability === "WIS"
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingChefChoiceSummary(choice: PendingChefChoice): string | null {
  return getChefChoiceSummary(decodePendingChefChoice(choice) ?? undefined);
}

export function decodePendingCrusherChoice(choice: PendingCrusherChoice): CrusherChoice | null {
  return choice.ability === "STR" || choice.ability === "CON"
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingCrusherChoiceSummary(choice: PendingCrusherChoice): string | null {
  return getCrusherChoiceSummary(decodePendingCrusherChoice(choice) ?? undefined);
}

export function decodePendingDualWielderChoice(
  choice: PendingDualWielderChoice
): DualWielderChoice | null {
  return choice.ability === "STR" || choice.ability === "DEX"
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingDualWielderChoiceSummary(
  choice: PendingDualWielderChoice
): string | null {
  return getDualWielderChoiceSummary(decodePendingDualWielderChoice(choice) ?? undefined);
}

export function decodePendingElementalAdeptChoice(
  choice: PendingElementalAdeptChoice
): ElementalAdeptChoice | null {
  if (
    !elementalAdeptAbilityOptions.includes(choice.ability) ||
    !elementalAdeptDamageTypeOptions.includes(choice.damageType)
  ) {
    return null;
  }

  return {
    ability: choice.ability,
    damageType: choice.damageType
  };
}

export function getPendingElementalAdeptChoiceSummary(
  choice: PendingElementalAdeptChoice
): string | null {
  return getElementalAdeptChoiceSummary(decodePendingElementalAdeptChoice(choice) ?? undefined);
}

export function decodePendingFeyTouchedChoice(
  choice: PendingFeyTouchedChoice
): FeyTouchedChoice | null {
  if (
    !feyTouchedAbilityOptions.includes(choice.ability) ||
    !getFeyTouchedSpellOptions().some((spell) => spell.id === choice.spellId)
  ) {
    return null;
  }

  return {
    ability: choice.ability,
    spellId: choice.spellId
  };
}

export function isPendingFeyTouchedChoiceValid(choice: PendingFeyTouchedChoice): boolean {
  return decodePendingFeyTouchedChoice(choice) !== null;
}

export function getPendingFeyTouchedChoiceSummary(
  choice: PendingFeyTouchedChoice
): string | null {
  return getFeyTouchedChoiceSummary(decodePendingFeyTouchedChoice(choice) ?? undefined);
}

export function decodePendingHeavilyArmoredChoice(
  choice: PendingHeavilyArmoredChoice
): HeavilyArmoredChoice | null {
  return heavilyArmoredAbilityOptions.includes(choice.ability)
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingHeavilyArmoredChoiceSummary(
  choice: PendingHeavilyArmoredChoice
): string | null {
  return getHeavilyArmoredChoiceSummary(decodePendingHeavilyArmoredChoice(choice) ?? undefined);
}

export function decodePendingHeavyArmorMasterChoice(
  choice: PendingHeavyArmorMasterChoice
): HeavyArmorMasterChoice | null {
  return heavyArmorMasterAbilityOptions.includes(choice.ability)
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingHeavyArmorMasterChoiceSummary(
  choice: PendingHeavyArmorMasterChoice
): string | null {
  return getHeavyArmorMasterChoiceSummary(
    decodePendingHeavyArmorMasterChoice(choice) ?? undefined
  );
}

export function decodePendingInspiringLeaderChoice(
  choice: PendingInspiringLeaderChoice
): InspiringLeaderChoice | null {
  return inspiringLeaderAbilityOptions.includes(choice.ability)
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingInspiringLeaderChoiceSummary(
  choice: PendingInspiringLeaderChoice
): string | null {
  return getInspiringLeaderChoiceSummary(decodePendingInspiringLeaderChoice(choice) ?? undefined);
}

export function decodePendingKeenMindChoice(choice: PendingKeenMindChoice): KeenMindChoice | null {
  if (!keenMindSkillOptionSet.has(choice.skill)) {
    return null;
  }

  return {
    skill: choice.skill as KeenMindChoice["skill"]
  };
}

export function isPendingKeenMindChoiceValid(choice: PendingKeenMindChoice): boolean {
  return decodePendingKeenMindChoice(choice) !== null;
}

export function getPendingKeenMindChoiceSummary(choice: PendingKeenMindChoice): string | null {
  return getKeenMindChoiceSummary(decodePendingKeenMindChoice(choice) ?? undefined);
}

export function decodePendingLightlyArmoredChoice(
  choice: PendingLightlyArmoredChoice
): LightlyArmoredChoice | null {
  return lightlyArmoredAbilityOptions.includes(choice.ability)
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingLightlyArmoredChoiceSummary(
  choice: PendingLightlyArmoredChoice
): string | null {
  return getLightlyArmoredChoiceSummary(decodePendingLightlyArmoredChoice(choice) ?? undefined);
}

export function decodePendingMageSlayerChoice(
  choice: PendingMageSlayerChoice
): MageSlayerChoice | null {
  return mageSlayerAbilityOptions.includes(choice.ability)
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingMageSlayerChoiceSummary(
  choice: PendingMageSlayerChoice
): string | null {
  return getMageSlayerChoiceSummary(decodePendingMageSlayerChoice(choice) ?? undefined);
}

export function decodePendingMartialWeaponTrainingChoice(
  choice: PendingMartialWeaponTrainingChoice
): MartialWeaponTrainingChoice | null {
  return martialWeaponTrainingAbilityOptions.includes(choice.ability)
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingMartialWeaponTrainingChoiceSummary(
  choice: PendingMartialWeaponTrainingChoice
): string | null {
  return getMartialWeaponTrainingChoiceSummary(
    decodePendingMartialWeaponTrainingChoice(choice) ?? undefined
  );
}

export function decodePendingMediumArmorMasterChoice(
  choice: PendingMediumArmorMasterChoice
): MediumArmorMasterChoice | null {
  return mediumArmorMasterAbilityOptions.includes(choice.ability)
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingMediumArmorMasterChoiceSummary(
  choice: PendingMediumArmorMasterChoice
): string | null {
  return getMediumArmorMasterChoiceSummary(
    decodePendingMediumArmorMasterChoice(choice) ?? undefined
  );
}

export function decodePendingModeratelyArmoredChoice(
  choice: PendingModeratelyArmoredChoice
): ModeratelyArmoredChoice | null {
  return moderatelyArmoredAbilityOptions.includes(choice.ability)
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingModeratelyArmoredChoiceSummary(
  choice: PendingModeratelyArmoredChoice
): string | null {
  return getModeratelyArmoredChoiceSummary(
    decodePendingModeratelyArmoredChoice(choice) ?? undefined
  );
}

export function decodePendingMountedCombatantChoice(
  choice: PendingMountedCombatantChoice
): MountedCombatantChoice | null {
  return mountedCombatantAbilityOptions.includes(choice.ability)
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingMountedCombatantChoiceSummary(
  choice: PendingMountedCombatantChoice
): string | null {
  return getMountedCombatantChoiceSummary(
    decodePendingMountedCombatantChoice(choice) ?? undefined
  );
}

export function decodePendingObservantChoice(
  choice: PendingObservantChoice
): ObservantChoice | null {
  return observantAbilityOptions.includes(choice.ability) &&
    (observantSkillOptions as readonly string[]).includes(choice.skill)
    ? {
        ability: choice.ability,
        skill: choice.skill as ObservantChoice["skill"]
      }
    : null;
}

export function getPendingObservantChoiceSummary(
  choice: PendingObservantChoice
): string | null {
  return getObservantChoiceSummary(decodePendingObservantChoice(choice) ?? undefined);
}

export function isPendingObservantChoiceValid(choice: PendingObservantChoice): boolean {
  return decodePendingObservantChoice(choice) !== null;
}

export function decodePendingPiercerChoice(choice: PendingPiercerChoice): PiercerChoice | null {
  return piercerAbilityOptions.includes(choice.ability)
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingPiercerChoiceSummary(choice: PendingPiercerChoice): string | null {
  return getPiercerChoiceSummary(decodePendingPiercerChoice(choice) ?? undefined);
}

export function decodePendingPoisonerChoice(
  choice: PendingPoisonerChoice
): PoisonerChoice | null {
  return poisonerAbilityOptions.includes(choice.ability)
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingPoisonerChoiceSummary(choice: PendingPoisonerChoice): string | null {
  return getPoisonerChoiceSummary(decodePendingPoisonerChoice(choice) ?? undefined);
}

export function decodePendingResilientChoice(
  choice: PendingResilientChoice
): ResilientChoice | null {
  return resilientAbilityOptions.includes(choice.ability as ResilientChoice["ability"])
    ? {
        ability: choice.ability as ResilientChoice["ability"]
      }
    : null;
}

export function getPendingResilientChoiceSummary(
  choice: PendingResilientChoice
): string | null {
  return getResilientChoiceSummary(decodePendingResilientChoice(choice) ?? undefined);
}

export function isPendingResilientChoiceValid(choice: PendingResilientChoice): boolean {
  return decodePendingResilientChoice(choice) !== null;
}

export function decodePendingSpeedyChoice(choice: PendingSpeedyChoice): SpeedyChoice | null {
  return speedyAbilityOptions.includes(choice.ability)
    ? {
        ability: choice.ability
      }
    : null;
}

export function getPendingSpeedyChoiceSummary(choice: PendingSpeedyChoice): string | null {
  return getSpeedyChoiceSummary(decodePendingSpeedyChoice(choice) ?? undefined);
}

export function decodePendingWeaponMasterChoice(
  choice: PendingWeaponMasterChoice
): WeaponMasterChoice | null {
  return weaponMasterAbilityOptions.includes(choice.ability) &&
    weaponMasterMasteryOptions.includes(choice.weaponMastery as WeaponMasterChoice["weaponMastery"])
    ? {
        ability: choice.ability,
        weaponMastery: choice.weaponMastery as WeaponMasterChoice["weaponMastery"]
      }
    : null;
}

export function getPendingWeaponMasterChoiceSummary(
  choice: PendingWeaponMasterChoice
): string | null {
  return getWeaponMasterChoiceSummary(decodePendingWeaponMasterChoice(choice) ?? undefined);
}

export function isPendingWeaponMasterChoiceValid(choice: PendingWeaponMasterChoice): boolean {
  return decodePendingWeaponMasterChoice(choice) !== null;
}

export function decodePendingDruidicWarriorChoice(
  choice: PendingDruidicWarriorChoice
): DruidicWarriorChoice | null {
  return decodePendingCantripChoice<DruidicWarriorChoice>(choice, getDruidicWarriorCantripOptions());
}

export function decodePendingMagicInitiateChoice(
  choice: PendingMagicInitiateChoice
): MagicInitiateChoice | null {
  if (!isMagicInitiateSpellList(choice.spellList)) {
    return null;
  }

  const cantripIds = [...new Set(choice.cantripIds.filter((spellId) => spellId.length > 0))];
  const cantripOptionIds = new Set(
    getMagicInitiateCantripOptions(choice.spellList).map((spell) => spell.id)
  );

  if (cantripIds.length !== 2 || !cantripIds.every((spellId) => cantripOptionIds.has(spellId))) {
    return null;
  }

  const levelOneSpellOptionIds = new Set(
    getMagicInitiateLevelOneSpellOptions(choice.spellList).map((spell) => spell.id)
  );

  if (!levelOneSpellOptionIds.has(choice.levelOneSpellId)) {
    return null;
  }

  if (
    !magicInitiateSpellcastingAbilityOptions.includes(
      choice.spellcastingAbility as MagicInitiateChoice["spellcastingAbility"]
    )
  ) {
    return null;
  }

  return {
    spellList: choice.spellList,
    cantripIds: cantripIds as MagicInitiateChoice["cantripIds"],
    levelOneSpellId: choice.levelOneSpellId,
    spellcastingAbility: choice.spellcastingAbility as MagicInitiateChoice["spellcastingAbility"]
  };
}

export function decodePendingCrafterChoice(choice: PendingCrafterChoice): CrafterChoice | null {
  const toolProficiencies = choice.toolProficiencies.filter(isCrafterFastCraftingTool);
  const uniqueToolProficiencies = [...new Set(toolProficiencies)];

  if (uniqueToolProficiencies.length !== 3) {
    return null;
  }

  return {
    toolProficiencies: uniqueToolProficiencies as CrafterChoice["toolProficiencies"]
  };
}

export function isPendingCrafterChoiceValid(choice: PendingCrafterChoice): boolean {
  return (
    new Set(choice.toolProficiencies).size === choice.toolProficiencies.length &&
    decodePendingCrafterChoice(choice) !== null
  );
}

export function getPendingCrafterChoiceSummary(choice: PendingCrafterChoice): string | null {
  return getCrafterChoiceSummary(decodePendingCrafterChoice(choice) ?? undefined);
}

export function decodePendingMusicianChoice(choice: PendingMusicianChoice): MusicianChoice | null {
  const toolProficiencies = choice.toolProficiencies.filter(
    (tool): tool is ToolProficiency => musicianToolOptionSet.has(tool as ToolProficiency)
  );
  const uniqueToolProficiencies = [...new Set(toolProficiencies)];

  if (uniqueToolProficiencies.length !== 3) {
    return null;
  }

  return {
    toolProficiencies: uniqueToolProficiencies as MusicianChoice["toolProficiencies"]
  };
}

export function isPendingMusicianChoiceValid(choice: PendingMusicianChoice): boolean {
  return (
    new Set(choice.toolProficiencies).size === choice.toolProficiencies.length &&
    decodePendingMusicianChoice(choice) !== null
  );
}

export function getPendingMusicianChoiceSummary(choice: PendingMusicianChoice): string | null {
  return getMusicianChoiceSummary(decodePendingMusicianChoice(choice) ?? undefined);
}

export function isPendingDruidicWarriorChoiceValid(choice: PendingDruidicWarriorChoice): boolean {
  return decodePendingDruidicWarriorChoice(choice) !== null;
}

export function getPendingDruidicWarriorChoiceSummary(
  choice: PendingDruidicWarriorChoice
): string | null {
  return getDruidicWarriorChoiceSummary(decodePendingDruidicWarriorChoice(choice) ?? undefined);
}

export function isPendingMagicInitiateChoiceValid(choice: PendingMagicInitiateChoice): boolean {
  return decodePendingMagicInitiateChoice(choice) !== null;
}

export function getPendingMagicInitiateChoiceSummary(
  choice: PendingMagicInitiateChoice
): string | null {
  return getMagicInitiateChoiceSummary(decodePendingMagicInitiateChoice(choice) ?? undefined);
}

export function decodePendingSkilledChoice(choice: PendingSkilledChoice): SkilledChoice | null {
  const selections = choice.selections
    .map((selection) => decodeSkilledSelection(selection))
    .filter((selection): selection is SkilledFeatSelection => selection !== null);

  if (selections.length !== 3) {
    return null;
  }

  return {
    selections: selections as SkilledChoice["selections"]
  };
}

export function isPendingSkilledChoiceValid(choice: PendingSkilledChoice): boolean {
  return (
    new Set(choice.selections).size === choice.selections.length &&
    decodePendingSkilledChoice(choice) !== null
  );
}

export function getPendingSkilledChoiceSummary(choice: PendingSkilledChoice): string | null {
  return getSkilledChoiceSummary(decodePendingSkilledChoice(choice) ?? undefined);
}

export function splitSkilledSelections(choice?: SkilledChoice): {
  skills: SkillName[];
  tools: ToolProficiency[];
} {
  return (choice?.selections ?? []).reduce<{
    skills: SkillName[];
    tools: ToolProficiency[];
  }>(
    (result, selection) => {
      if (selection.kind === "skill") {
        result.skills.push(selection.skill);
      } else {
        result.tools.push(selection.tool);
      }

      return result;
    },
    {
      skills: [],
      tools: []
    }
  );
}

export function getCrafterToolSelections(choice?: CrafterChoice): ToolProficiency[] {
  return choice?.toolProficiencies ? [...choice.toolProficiencies] : [];
}

export function getMusicianToolSelections(choice?: MusicianChoice): ToolProficiency[] {
  return choice?.toolProficiencies ? [...choice.toolProficiencies] : [];
}

export function groupFeatEntriesByFeat(feats: CharacterFeatEntry[]): Array<{
  feat: FEATS;
  entries: CharacterFeatEntry[];
}> {
  return feats.reduce<Array<{ feat: FEATS; entries: CharacterFeatEntry[] }>>((groups, entry) => {
    const existingGroup = groups.find((group) => group.feat === entry.feat);

    if (existingGroup) {
      existingGroup.entries.push(entry);
      return groups;
    }

    groups.push({
      feat: entry.feat,
      entries: [entry]
    });
    return groups;
  }, []);
}

export function getRepeatableFeatEntrySummary(entry: CharacterFeatEntry): string {
  const summary = getCharacterFeatSummary(entry);

  return summary
    ? `Picked: ${summary} • ${getCharacterFeatSourceLabel(entry)}`
    : `Picked • ${getCharacterFeatSourceLabel(entry)}`;
}

export function triggerActionOnEnterOrSpace(
  event: ReactKeyboardEvent<HTMLElement>,
  action: () => void
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}
