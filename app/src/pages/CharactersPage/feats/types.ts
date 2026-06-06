import type { FeatureMapEntry } from "../../../codex/entries";
import type {
  AbilityKey,
  ARMOR_PROFICIENCY,
  LanguageProficiency,
  SAVING_THROW_PROFICIENCY,
  SkillName,
  WEAPON_PROFICIENCY
} from "../../../types";
import type { FEAT_CATEGORY, FEATS } from "../../../codex/entries";
import type { TOOL_PROFICIENCY } from "../../../types";
import type { FeatSource } from "./source";

export type FeatDefinition = FeatureMapEntry & {
  feat: FEATS;
  label: string;
  category: FEAT_CATEGORY;
  source?: FeatSource;
  page?: number;
  prerequisite?: string;
  requirements?: FeatRequirement[];
  repeatable?: boolean;
};

export type FeatProficiencyRequirement =
  | {
      kind: "armor";
      proficiency: ARMOR_PROFICIENCY;
    }
  | {
      kind: "language";
      proficiency: LanguageProficiency;
    }
  | {
      kind: "savingThrow";
      proficiency: SAVING_THROW_PROFICIENCY;
    }
  | {
      kind: "skill";
      proficiency: SkillName;
    }
  | {
      kind: "tool";
      proficiency: TOOL_PROFICIENCY;
    }
  | {
      kind: "weapon";
      proficiency: WEAPON_PROFICIENCY;
    };

export type FeatRequirement =
  | {
      type: "minimum-level";
      level: number;
    }
  | {
      type: "minimum-ability-score";
      abilities: AbilityKey[];
      score: number;
    }
  | {
      type: "proficiency";
      proficiency: FeatProficiencyRequirement;
    }
  | {
      type: "spellcasting-or-pact-magic";
    }
  | {
      type: "feat";
      feat: FEATS;
    }
  | {
      type: "any";
      requirements: FeatRequirement[];
    };
