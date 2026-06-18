/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { SpellEntry } from "../../../../../../codex/entries";
import type { AbilityKey, Character, MonsterRecord } from "../../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../../pages/CharactersPage/CharacterSheetPage/types";
import type { EconomyType } from "../../../../../../pages/CharactersPage/actionEconomy";
import type { RoundTrackerResource } from "../../../../../../pages/CharactersPage/combat";
import type {
  FeatureActionCard,
  FeatureActionCardUsage,
  FeatureActionOptionCard
} from "../../../../../../pages/CharactersPage/classFeatures";
import type { GameplayActionDefinition } from "../../../../../../pages/CharactersPage/combatActions";
import type { SpellSlotRuntimeOption } from "../../../../../../pages/CharactersPage/characterRuntime/spellcastingRuntime";
import type {
  SpellImplementationCastSource,
  SpellImplementationOptionValues
} from "../../../../../../pages/CharactersPage/characterRuntime/spellImplementations";
import type { WeaponAction } from "../../../../../../pages/CharactersPage/gameplay";
import type { MysticArcanumLevel } from "../../../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import type {
  DruidNatureMagicianOption,
  DruidStarryFormConstellation
} from "../../../../../../pages/CharactersPage/classFeatures/druid/druid";
import type { LayOnHandsCondition } from "../../../../../../pages/CharactersPage/classFeatures/paladin/paladin";
import type { PaladinOathOfTheNobleGeniesElementalSmiteOptionKey } from "../../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfTheNobleGenies";
import type { ArtificerExperimentalElixirOptionKey } from "../../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import type { WizardDivinerThirdEyeOptionKey } from "../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardDivinerThirdEyeConfig";
import type {
  AasimarCelestialRevelationOptionKey,
  AasimarHealingHandsTarget
} from "../../../../../../pages/CharactersPage/species";
import type { DiceRollerRequest } from "../../../../../DicePage/DiceRollerPopup";
import type { ArcaneWardSpellSlotOption } from "./arcaneWardAction";
import type { CommonActionPathState } from "./commonActionEconomy";

export type RoundTrackerAvailability = {
  isInCombat?: boolean;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

export type ActionsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

export type LayOnHandsTarget = "self" | "other";

export type MonkHandOfHealingTarget = "self" | "other";

export type FontOfMagicSelection =
  | {
      kind: "slot-to-points";
      spellSlotLevel: number;
    }
  | {
      kind: "points-to-slot";
      spellSlotLevel: number;
    };

export type WildCompanionResourceKind = "wild-shape" | "spell-slot";

export type WildResurgenceMode = "spell-slot-to-wild-shape" | "wild-shape-to-slot";

export type BlessingOfTheTricksterTarget = "self" | "other";

export type ActionsWidgetUiState = {
  isCommonActionsOpen: boolean;
  isCustomActionsOpen: boolean;
  selectedActionKey: string | null;
  selectedActionOptionKeys: string[];
  selectedChannelDivinityOptionKey: string | null;
  selectedFontOfMagicSelection: FontOfMagicSelection | null;
  selectedWildShapeMonsterSlug: string | null;
  selectedWildCompanionResource: WildCompanionResourceKind;
  selectedBardicInspirationSpellSlotLevel: number | null;
  selectedArcaneWardSpellSlotLevel: number | null;
  selectedExperimentalElixirOptionKey: ArtificerExperimentalElixirOptionKey | null;
  selectedExperimentalElixirSpellSlotLevel: number | null;
  selectedArtificerEldritchCannonSpellSlotLevel: number | null;
  selectedArtificerSteelDefenderSpellSlotLevel: number | null;
  selectedBeastMasterReviveSpellSlotLevel: number | null;
  selectedWildCompanionSpellSlotLevel: number;
  selectedWildResurgenceMode: WildResurgenceMode | null;
  selectedWildResurgenceSpellSlotLevel: number;
  selectedNatureMagicianSpellSlotLevel: number | null;
  selectedLayOnHandsTarget: LayOnHandsTarget;
  selectedLayOnHandsPoolSpendInput: string;
  selectedLayOnHandsConditions: LayOnHandsCondition[];
  selectedAasimarHealingHandsTarget: AasimarHealingHandsTarget;
  selectedAasimarCelestialRevelationOptionKey: AasimarCelestialRevelationOptionKey | null;
  selectedBlessingOfTheTricksterTarget: BlessingOfTheTricksterTarget;
  selectedHandOfHealingTarget: MonkHandOfHealingTarget;
  selectedThirdEyeOptionKey: WizardDivinerThirdEyeOptionKey | null;
  selectedStarryFormConstellation: DruidStarryFormConstellation | null;
  selectedWildShapePreviewSlug: string | null;
  selectedRageOptionKey: string | null;
  selectedRagePowerOptionKey: string | null;
  isRageOfTheGodsSelected: boolean;
  selectedIndomitableAbility: AbilityKey | null;
  selectedWarriorOfTheGodsChargeCount: number;
  isFixedSpellDrawerOpen: boolean;
  selectedFixedSpellSlotLevel: number;
  isDiceRollerSettingsOpen: boolean;
  selectedDivineInterventionSpell: SpellEntry | null;
  selectedMysticArcanumSpell: SpellEntry | null;
  selectedMysticArcanumSpellLevel: MysticArcanumLevel | null;
  useBeguilingMagicOnActionSpell: boolean;
  useElementalSmiteOnActionSpell: boolean;
  useGoliathAncestryOnActionSpell: boolean;
  selectedElementalSmiteOptionOnActionSpell: PaladinOathOfTheNobleGeniesElementalSmiteOptionKey | null;
  useFrozenHauntOnActionSpell: boolean;
  selectedFrozenHauntFallbackSlotLevel: number;
  isCrownOfSpellfireSelected: boolean;
  isFortifyingSoulIncludingSelfSelected: boolean;
  isInspiredEclipseSelected: boolean;
  isGroupRecoverySelected: boolean;
  isClairvoyantCombatantSelected: boolean;
  isEldritchSmiteSelected: boolean;
  isLifedrinkerSelected: boolean;
  isPsionicStrikeSelected: boolean;
  isDreadfulStrikeSelected: boolean;
  isColossusSlayerSelected: boolean;
  isPolarStrikesSelected: boolean;
  isGoliathAncestryStrikeSelected: boolean;
  isHuntersMarkTargetSelected: boolean;
  isRecklessAttackSelected: boolean;
  isSacredWeaponSelected: boolean;
  isVowOfEnmitySelected: boolean;
  isStunningStrikeSelected: boolean;
  isHandOfHarmSelected: boolean;
  isFlurryOfHealingAndHarmSelected: boolean;
  isEmpoweredStrikesSelected: boolean;
  isQuiveringPalmSelected: boolean;
  isImprovedShadowStepSelected: boolean;
};

export type ActionsWidgetFieldSetterMap = {
  [K in keyof ActionsWidgetUiState as `set${Capitalize<string & K>}`]: Dispatch<
    SetStateAction<ActionsWidgetUiState[K]>
  >;
};

export type ActionsWidgetUiStateResult = ActionsWidgetUiState &
  ActionsWidgetFieldSetterMap & {
    resetActionDrawerState: () => void;
    resetActionSelectionState: () => void;
  };

export type SpellActionPathState = {
  id: string;
  economyType: EconomyType;
  roundTrackerResource: RoundTrackerResource | null;
  shapeState: {
    isAvailable: boolean;
    multiCount: number;
    disabledReason?: string | null;
  };
  actionLabel?: string;
  disabledReason?: string | null;
  usage?: FeatureActionCardUsage;
  spellImplementationCastSource?: SpellImplementationCastSource;
  forcedSpellImplementationOptions?: SpellImplementationOptionValues;
  spellCastEffectIds?: string[];
};

export type WeaponDrawerDetail = {
  key: string;
  label: ReactNode;
  value: ReactNode;
  referenceTitle?: string;
  referenceKeywords?: string[];
};

type ActionsWidgetContextBag = Record<string, any>;

type ActionsWidgetTypedSharedContext = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
  openDiceRoller: (request: DiceRollerRequest) => void;
  selectedAction: GameplayActionDefinition | null;
  selectedFeatureAction: FeatureActionCard | null;
  selectedWeaponEffectiveAction: WeaponAction | null;
  selectedDrawerOptions: FeatureActionOptionCard[];
  fixedSpellActionPaths: SpellActionPathState[];
  wildShapeKnownForms: MonsterRecord[];
  natureMagicianOptions: DruidNatureMagicianOption[];
  arcaneWardSpellSlotOptions: ArcaneWardSpellSlotOption[];
  bardicInspirationFallbackSpellSlotOptions: SpellSlotRuntimeOption[];
  beastMasterReviveSpellSlotOptions: SpellSlotRuntimeOption[];
};

export type ActionsWidgetExecutionContext = ActionsWidgetContextBag &
  Pick<
    ActionsWidgetUiStateResult,
    | "setSelectedActionOptionKeys"
    | "setSelectedWildShapeMonsterSlug"
    | "setSelectedWildCompanionResource"
    | "setSelectedBardicInspirationSpellSlotLevel"
    | "setSelectedArcaneWardSpellSlotLevel"
    | "setSelectedBeastMasterReviveSpellSlotLevel"
    | "setSelectedWildCompanionSpellSlotLevel"
    | "setSelectedNatureMagicianSpellSlotLevel"
    | "setSelectedWildResurgenceMode"
    | "setSelectedWildResurgenceSpellSlotLevel"
  > &
  ActionsWidgetTypedSharedContext;

export type ActionsWidgetSubmissionContext = ActionsWidgetExecutionContext & {
  closeActionDrawer: () => void;
  prepareCharacterForResourceConsumption: (
    currentCharacter: Character,
    roundTrackerResource: RoundTrackerResource | null
  ) => Character;
  activateFeatureAction: (action: FeatureActionCard) => void;
};

export type ActionsWidgetDrawerBodyContext = ActionsWidgetContextBag &
  Pick<
    ActionsWidgetUiStateResult,
    | "selectedActionOptionKeys"
    | "setSelectedActionOptionKeys"
    | "setSelectedWildShapeMonsterSlug"
    | "setSelectedWildShapePreviewSlug"
    | "setSelectedStarryFormConstellation"
    | "setSelectedWildCompanionResource"
    | "setSelectedWildCompanionSpellSlotLevel"
    | "setSelectedExperimentalElixirOptionKey"
    | "setSelectedExperimentalElixirSpellSlotLevel"
    | "setSelectedArtificerEldritchCannonSpellSlotLevel"
    | "setSelectedArtificerSteelDefenderSpellSlotLevel"
    | "setSelectedNatureMagicianSpellSlotLevel"
    | "setSelectedWildResurgenceMode"
    | "setSelectedWildResurgenceSpellSlotLevel"
    | "setSelectedRageOptionKey"
    | "setSelectedRagePowerOptionKey"
    | "setIsRageOfTheGodsSelected"
    | "setSelectedIndomitableAbility"
    | "setSelectedLayOnHandsTarget"
    | "setSelectedLayOnHandsPoolSpendInput"
    | "setSelectedLayOnHandsConditions"
    | "setSelectedAasimarHealingHandsTarget"
    | "setSelectedAasimarCelestialRevelationOptionKey"
    | "setSelectedHandOfHealingTarget"
    | "setSelectedFontOfMagicSelection"
    | "setIsDiceRollerSettingsOpen"
  > & {
    character: Character;
    selectedAction: GameplayActionDefinition | null;
    selectedFeatureAction: FeatureActionCard | null;
    selectedWeaponDetails: WeaponDrawerDetail[];
    wildShapeKnownForms: MonsterRecord[];
    natureMagicianOptions: DruidNatureMagicianOption[];
    selectedWeaponEffectiveAction: WeaponAction | null;
    arcaneWardSpellSlotOptions: ArcaneWardSpellSlotOption[];
    bardicInspirationFallbackSpellSlotOptions: SpellSlotRuntimeOption[];
    beastMasterReviveSpellSlotOptions: SpellSlotRuntimeOption[];
  };

export type ActionsWidgetDrawerFooterContext = ActionsWidgetDrawerBodyContext & {
  onPersistCharacter: PersistCharacterUpdater;
  selectedCommonActionPathStates: CommonActionPathState[];
};
