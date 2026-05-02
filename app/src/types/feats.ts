import type { CLASS_FEATURE, FEATS, SPELL_LIST_CLASS } from "../codex/entries/enums";
import type { AbilityKey } from "./characters";
import type { TOOL_PROFICIENCY } from "./proficiencies";
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
    };

export type CharacterFeatEntry = {
  id: string;
  feat: FEATS;
  takenAtLevel: number;
  source: CharacterFeatSource;
  abilityScoreImprovement?: AbilityScoreImprovementChoice;
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
