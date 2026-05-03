import type { CLASS_FEATURE, DAMAGE_TYPE, FEATS, SPELL_LIST_CLASS } from "../codex/entries/enums";
import type { AbilityKey } from "./characters";
import type { TOOL_PROFICIENCY, WEAPON_PROFICIENCY } from "./proficiencies";
import type { SkillName } from "./skills";

export type AbilityScoreImprovementChoice =
  | {
      mode: "single";
      primaryAbility: AbilityKey;
    }
  | {
      mode: "split";
      primaryAbility: AbilityKey;
      secondaryAbility: AbilityKey;
    };

export type BoonOfIrresistibleOffenseChoice = {
  ability: "STR" | "DEX";
};

export type AthleteChoice = {
  ability: "STR" | "DEX";
};

export type ChargerChoice = {
  ability: "STR" | "DEX";
};

export type ChefChoice = {
  ability: "CON" | "WIS";
};

export type CrusherChoice = {
  ability: "STR" | "CON";
};

export type DualWielderChoice = {
  ability: "STR" | "DEX";
};

export type ElementalAdeptChoice = {
  ability: "INT" | "WIS" | "CHA";
  damageType:
    | DAMAGE_TYPE.ACID
    | DAMAGE_TYPE.COLD
    | DAMAGE_TYPE.FIRE
    | DAMAGE_TYPE.LIGHTNING
    | DAMAGE_TYPE.THUNDER;
};

export type FeyTouchedChoice = {
  ability: "INT" | "WIS" | "CHA";
  spellId: string;
  freeCastExpendedSpellIds?: string[];
};

export type HeavilyArmoredChoice = {
  ability: "CON" | "STR";
};

export type HeavyArmorMasterChoice = {
  ability: "CON" | "STR";
};

export type InspiringLeaderChoice = {
  ability: "WIS" | "CHA";
};

export type KeenMindChoice = {
  skill: SkillName;
};

export type LightlyArmoredChoice = {
  ability: "STR" | "DEX";
};

export type MageSlayerChoice = {
  ability: "STR" | "DEX";
  guardedMindExpended?: boolean;
};

export type MartialWeaponTrainingChoice = {
  ability: "STR" | "DEX";
};

export type MediumArmorMasterChoice = {
  ability: "STR" | "DEX";
};

export type ModeratelyArmoredChoice = {
  ability: "STR" | "DEX";
};

export type MountedCombatantChoice = {
  ability: "STR" | "DEX" | "WIS";
};

export type ObservantChoice = {
  ability: "INT" | "WIS";
  skill: SkillName;
};

export type PiercerChoice = {
  ability: "STR" | "DEX";
};

export type PoisonerChoice = {
  ability: "DEX" | "INT";
};

export type ResilientChoice = {
  ability: AbilityKey;
};

export type SpeedyChoice = {
  ability: "DEX" | "CON";
};

export type WeaponMasterChoice = {
  ability: "STR" | "DEX";
  weaponMastery: WEAPON_PROFICIENCY;
};

export type EpicBoonAbilityChoice = {
  ability: AbilityKey;
};

export type BlessedWarriorChoice = {
  cantripIds: [string, string];
};

export type DruidicWarriorChoice = {
  cantripIds: [string, string];
};

export type MagicInitiateChoice = {
  spellList: SPELL_LIST_CLASS.CLERIC | SPELL_LIST_CLASS.DRUID | SPELL_LIST_CLASS.WIZARD;
  cantripIds: [string, string];
  levelOneSpellId: string;
  spellcastingAbility: "INT" | "WIS" | "CHA";
  freeCastExpended?: boolean;
};

export type MusicianChoice = {
  toolProficiencies: [TOOL_PROFICIENCY, TOOL_PROFICIENCY, TOOL_PROFICIENCY];
};

export type CrafterChoice = {
  toolProficiencies: [TOOL_PROFICIENCY, TOOL_PROFICIENCY, TOOL_PROFICIENCY];
};

export type SkilledFeatSelection =
  | {
      kind: "skill";
      skill: SkillName;
    }
  | {
      kind: "tool";
      tool: TOOL_PROFICIENCY;
    };

export type SkilledChoice = {
  selections: [SkilledFeatSelection, SkilledFeatSelection, SkilledFeatSelection];
};

export type LuckyChoice = {
  pointsExpended: number;
};

export type CharacterFeatSource =
  | {
      type: "manual";
    }
  | {
      type: "class-feature";
      feature: CLASS_FEATURE;
      level: number;
    }
  | {
      type: "background";
      background: string;
    };

export type CharacterFeatEntry = {
  id: string;
  feat: FEATS;
  takenAtLevel: number;
  source: CharacterFeatSource;
  abilityScoreImprovement?: AbilityScoreImprovementChoice;
  athlete?: AthleteChoice;
  charger?: ChargerChoice;
  chef?: ChefChoice;
  crusher?: CrusherChoice;
  dualWielder?: DualWielderChoice;
  elementalAdept?: ElementalAdeptChoice;
  feyTouched?: FeyTouchedChoice;
  heavilyArmored?: HeavilyArmoredChoice;
  heavyArmorMaster?: HeavyArmorMasterChoice;
  inspiringLeader?: InspiringLeaderChoice;
  keenMind?: KeenMindChoice;
  lightlyArmored?: LightlyArmoredChoice;
  mageSlayer?: MageSlayerChoice;
  martialWeaponTraining?: MartialWeaponTrainingChoice;
  mediumArmorMaster?: MediumArmorMasterChoice;
  moderatelyArmored?: ModeratelyArmoredChoice;
  mountedCombatant?: MountedCombatantChoice;
  observant?: ObservantChoice;
  piercer?: PiercerChoice;
  poisoner?: PoisonerChoice;
  resilient?: ResilientChoice;
  speedy?: SpeedyChoice;
  weaponMaster?: WeaponMasterChoice;
  blessedWarrior?: BlessedWarriorChoice;
  druidicWarrior?: DruidicWarriorChoice;
  magicInitiate?: MagicInitiateChoice;
  musician?: MusicianChoice;
  crafter?: CrafterChoice;
  boonOfIrresistibleOffense?: BoonOfIrresistibleOffenseChoice;
  epicBoonAbilityChoice?: EpicBoonAbilityChoice;
  skilled?: SkilledChoice;
  lucky?: LuckyChoice;
};
