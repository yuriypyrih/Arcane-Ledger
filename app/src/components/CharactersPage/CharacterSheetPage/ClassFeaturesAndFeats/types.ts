import type { ReactNode } from "react";
import type {
  CLASS_FEATURE,
  FEAT_CATEGORY,
  FEATS,
  DivinityEntry,
  FeatureMapEntry,
  TRACKER,
  SpellEntry
} from "../../../../codex/entries";
import type {
  AbilityKey,
  BlessedWarriorChoice,
  CharacterFeatEntry,
  CharacterFeatSource,
  DruidicWarriorChoice,
  SkilledChoice
} from "../../../../types";

export type FeatureRow = {
  key: string;
  level: number;
  feature: CLASS_FEATURE;
  details: FeatureMapEntry;
  isSubclass: boolean;
};

export type TrackingButtonRenderer = (trackingState: TRACKER) => ReactNode;

export type SelectedKeyword = {
  key: string;
  title: string;
  description: string[];
};

export type SelectedFeatReference = {
  entry?: CharacterFeatEntry;
  feat: FEATS;
};

export type SelectedSpellReference = SpellEntry;
export type SelectedDivinityReference = DivinityEntry;

export type PendingAbilityScoreImprovement = {
  mode: "single" | "split";
  primaryAbility: AbilityKey;
  secondaryAbility: AbilityKey;
};

export type PendingBoonOfIrresistibleOffense = {
  ability: "STR" | "DEX";
};

export type PendingBlessedWarriorChoice = {
  cantripIds: [string, string];
};

export type PendingDruidicWarriorChoice = {
  cantripIds: [string, string];
};

export type PendingEpicBoonAbilityChoice = {
  feat: FEATS;
  ability: AbilityKey;
};

export type PendingSkilledChoice = {
  selections: [string, string, string];
};

export type FeatEditorContext =
  | {
      mode: "general";
    }
  | {
      mode: "class-feature";
      source: CharacterFeatSource & {
        type: "class-feature";
      };
    };

export type PendingFeatState = {
  abilityScoreImprovement: PendingAbilityScoreImprovement | null;
  boonOfIrresistibleOffense: PendingBoonOfIrresistibleOffense | null;
  blessedWarriorChoice: PendingBlessedWarriorChoice | null;
  druidicWarriorChoice: PendingDruidicWarriorChoice | null;
  epicBoonAbilityChoice: PendingEpicBoonAbilityChoice | null;
  skilledChoice: PendingSkilledChoice | null;
};

export type RepeatableFeatChoice = BlessedWarriorChoice | DruidicWarriorChoice | SkilledChoice;

export type FeatCategoryTabs = FEAT_CATEGORY[];
