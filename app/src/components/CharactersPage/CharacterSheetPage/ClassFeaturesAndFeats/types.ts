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
  CultOfDragonInitiateChoice,
  EmeraldEnclaveFledglingChoice,
  CrafterChoice,
  DruidicWarriorChoice,
  ElementalAdeptChoice,
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
  PolearmMasterChoice,
  RitualCasterChoice,
  ResilientChoice,
  SentinelChoice,
  ShadowTouchedChoice,
  SlasherChoice,
  SpellSniperChoice,
  TelekineticChoice,
  TelepathicChoice,
  WarCasterChoice,
  SkillExpertChoice,
  SpeedyChoice,
  WeaponMasterChoice,
  MagicInitiateChoice,
  MusicianChoice,
  BoonOfSkillChoice,
  SkilledChoice
} from "../../../../types";
import type { FeatEligibilityResult } from "../../../../pages/CharactersPage/feats/eligibility";

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

export type PendingBoonOfEnergyResistanceChoice = {
  ability: AbilityKey;
  damageTypes: [string, string];
};

export type PendingBoonOfSkillChoice = {
  ability: AbilityKey;
  skillExpertise: BoonOfSkillChoice["skillExpertise"] | "none";
};

export type PendingAthleteChoice = {
  ability: "STR" | "DEX";
};

export type PendingChargerChoice = {
  ability: "STR" | "DEX";
};

export type PendingChefChoice = {
  ability: "CON" | "WIS";
};

export type PendingCrusherChoice = {
  ability: "STR" | "CON";
};

export type PendingDualWielderChoice = {
  ability: "STR" | "DEX";
};

export type PendingElementalAdeptChoice = {
  ability: ElementalAdeptChoice["ability"];
  damageType: ElementalAdeptChoice["damageType"];
};

export type PendingFeyTouchedChoice = {
  ability: FeyTouchedChoice["ability"];
  spellId: string;
};

export type PendingHeavilyArmoredChoice = {
  ability: HeavilyArmoredChoice["ability"];
};

export type PendingHeavyArmorMasterChoice = {
  ability: HeavyArmorMasterChoice["ability"];
};

export type PendingInspiringLeaderChoice = {
  ability: InspiringLeaderChoice["ability"];
};

export type PendingKeenMindChoice = {
  skill: KeenMindChoice["skill"] | "none";
};

export type PendingLightlyArmoredChoice = {
  ability: LightlyArmoredChoice["ability"];
};

export type PendingMageSlayerChoice = {
  ability: MageSlayerChoice["ability"];
};

export type PendingMartialWeaponTrainingChoice = {
  ability: MartialWeaponTrainingChoice["ability"];
};

export type PendingMediumArmorMasterChoice = {
  ability: MediumArmorMasterChoice["ability"];
};

export type PendingModeratelyArmoredChoice = {
  ability: ModeratelyArmoredChoice["ability"];
};

export type PendingMountedCombatantChoice = {
  ability: MountedCombatantChoice["ability"];
};

export type PendingObservantChoice = {
  ability: ObservantChoice["ability"];
  skill: ObservantChoice["skill"] | "none";
};

export type PendingPiercerChoice = {
  ability: PiercerChoice["ability"];
};

export type PendingPoisonerChoice = {
  ability: PoisonerChoice["ability"];
};

export type PendingPolearmMasterChoice = {
  ability: PolearmMasterChoice["ability"];
};

export type PendingRitualCasterChoice = {
  ability: RitualCasterChoice["ability"];
  spellIds: string[];
};

export type PendingResilientChoice = {
  ability: ResilientChoice["ability"] | "none";
};

export type PendingSentinelChoice = {
  ability: SentinelChoice["ability"];
};

export type PendingShadowTouchedChoice = {
  ability: ShadowTouchedChoice["ability"];
  spellId: string;
};

export type PendingSlasherChoice = {
  ability: SlasherChoice["ability"];
};

export type PendingSpellSniperChoice = {
  ability: SpellSniperChoice["ability"];
};

export type PendingTelekineticChoice = {
  ability: TelekineticChoice["ability"];
};

export type PendingTelepathicChoice = {
  ability: TelepathicChoice["ability"];
};

export type PendingWarCasterChoice = {
  ability: WarCasterChoice["ability"];
};

export type PendingSkillExpertChoice = {
  ability: SkillExpertChoice["ability"];
  skillProficiency: SkillExpertChoice["skillProficiency"] | "none";
  skillExpertise: SkillExpertChoice["skillExpertise"] | "none";
};

export type PendingSpeedyChoice = {
  ability: SpeedyChoice["ability"];
};

export type PendingWeaponMasterChoice = {
  ability: WeaponMasterChoice["ability"];
  weaponMastery: WeaponMasterChoice["weaponMastery"] | "none";
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

export type PendingCultOfDragonInitiateChoice = {
  language: CultOfDragonInitiateChoice["language"] | "none";
};

export type PendingEmeraldEnclaveFledglingChoice = {
  spellcastingAbility: EmeraldEnclaveFledglingChoice["spellcastingAbility"] | "none";
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
  athleteChoice: PendingAthleteChoice | null;
  chargerChoice: PendingChargerChoice | null;
  chefChoice: PendingChefChoice | null;
  crusherChoice: PendingCrusherChoice | null;
  dualWielderChoice: PendingDualWielderChoice | null;
  elementalAdeptChoice: PendingElementalAdeptChoice | null;
  feyTouchedChoice: PendingFeyTouchedChoice | null;
  heavilyArmoredChoice: PendingHeavilyArmoredChoice | null;
  heavyArmorMasterChoice: PendingHeavyArmorMasterChoice | null;
  inspiringLeaderChoice: PendingInspiringLeaderChoice | null;
  keenMindChoice: PendingKeenMindChoice | null;
  lightlyArmoredChoice: PendingLightlyArmoredChoice | null;
  mageSlayerChoice: PendingMageSlayerChoice | null;
  martialWeaponTrainingChoice: PendingMartialWeaponTrainingChoice | null;
  mediumArmorMasterChoice: PendingMediumArmorMasterChoice | null;
  moderatelyArmoredChoice: PendingModeratelyArmoredChoice | null;
  mountedCombatantChoice: PendingMountedCombatantChoice | null;
  observantChoice: PendingObservantChoice | null;
  piercerChoice: PendingPiercerChoice | null;
  poisonerChoice: PendingPoisonerChoice | null;
  polearmMasterChoice: PendingPolearmMasterChoice | null;
  ritualCasterChoice: PendingRitualCasterChoice | null;
  resilientChoice: PendingResilientChoice | null;
  sentinelChoice: PendingSentinelChoice | null;
  shadowTouchedChoice: PendingShadowTouchedChoice | null;
  slasherChoice: PendingSlasherChoice | null;
  spellSniperChoice: PendingSpellSniperChoice | null;
  telekineticChoice: PendingTelekineticChoice | null;
  telepathicChoice: PendingTelepathicChoice | null;
  warCasterChoice: PendingWarCasterChoice | null;
  skillExpertChoice: PendingSkillExpertChoice | null;
  speedyChoice: PendingSpeedyChoice | null;
  weaponMasterChoice: PendingWeaponMasterChoice | null;
  boonOfEnergyResistanceChoice: PendingBoonOfEnergyResistanceChoice | null;
  boonOfIrresistibleOffense: PendingBoonOfIrresistibleOffense | null;
  boonOfSkillChoice: PendingBoonOfSkillChoice | null;
  blessedWarriorChoice: PendingBlessedWarriorChoice | null;
  crafterChoice: PendingCrafterChoice | null;
  druidicWarriorChoice: PendingDruidicWarriorChoice | null;
  magicInitiateChoice: PendingMagicInitiateChoice | null;
  cultOfDragonInitiateChoice: PendingCultOfDragonInitiateChoice | null;
  emeraldEnclaveFledglingChoice: PendingEmeraldEnclaveFledglingChoice | null;
  musicianChoice: PendingMusicianChoice | null;
  epicBoonAbilityChoice: PendingEpicBoonAbilityChoice | null;
  skilledChoice: PendingSkilledChoice | null;
};

export type RepeatableFeatChoice =
  | BlessedWarriorChoice
  | CrafterChoice
  | DruidicWarriorChoice
  | ElementalAdeptChoice
  | FeyTouchedChoice
  | MagicInitiateChoice
  | CultOfDragonInitiateChoice
  | EmeraldEnclaveFledglingChoice
  | MusicianChoice
  | RitualCasterChoice
  | ShadowTouchedChoice
  | SkilledChoice;

export type FeatCategoryTabs = FEAT_CATEGORY[];
