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
  CrafterChoice,
  DruidicWarriorChoice,
  MagicInitiateChoice,
  MusicianChoice,
  SkilledChoice
} from "../../../../types";
import type { FeatEligibilityResult } from "../../../../pages/CharactersPage/featEligibility";

export type FeatureRow = {
  key: string;
  level: number;
  feature: CLASS_FEATURE;
  details: FeatureMapEntry;
  isSubclass: boolean;
};

export type TrackingButtonRenderer = (trackingState: TRACKER) => ReactNode;

export type FeatEligibilityByFeat = Partial<Record<FEATS, FeatEligibilityResult>>;

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

export type PendingMagicInitiateChoice = {
  spellList: string;
  lockedSpellList?: MagicInitiateChoice["spellList"];
  cantripIds: [string, string];
  levelOneSpellId: string;
  spellcastingAbility: string;
};

export type PendingMusicianChoice = {
  toolProficiencies: [string, string, string];
};

export type PendingCrafterChoice = {
  toolProficiencies: [string, string, string];
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
  crafterChoice: PendingCrafterChoice | null;
  druidicWarriorChoice: PendingDruidicWarriorChoice | null;
  magicInitiateChoice: PendingMagicInitiateChoice | null;
  musicianChoice: PendingMusicianChoice | null;
  epicBoonAbilityChoice: PendingEpicBoonAbilityChoice | null;
  skilledChoice: PendingSkilledChoice | null;
};

export type RepeatableFeatChoice =
  | BlessedWarriorChoice
  | CrafterChoice
  | DruidicWarriorChoice
  | MagicInitiateChoice
  | MusicianChoice
  | SkilledChoice;

export type FeatCategoryTabs = FEAT_CATEGORY[];
