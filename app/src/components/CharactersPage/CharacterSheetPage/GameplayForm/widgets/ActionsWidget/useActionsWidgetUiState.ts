import {
  useCallback,
  useMemo,
  useReducer,
  type Dispatch,
  type SetStateAction
} from "react";
import type { AbilityKey } from "../../../../../../types";
import type { SpellEntry } from "../../../../../../codex/entries";
import type { MysticArcanumLevel } from "../../../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import type { DruidStarryFormConstellation } from "../../../../../../pages/CharactersPage/classFeatures/druid/druid";
import type { LayOnHandsCondition } from "../../../../../../pages/CharactersPage/classFeatures/paladin/paladin";
import type { PaladinOathOfTheNobleGeniesElementalSmiteOptionKey } from "../../../../../../pages/CharactersPage/classFeatures/paladin/subclasses/paladinOathOfTheNobleGenies";
import type { WizardDivinerThirdEyeOptionKey } from "../../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardDivinerThirdEyeConfig";
import type { LayOnHandsTarget } from "./LayOnHandsAction";
import type {
  BlessingOfTheTricksterTarget,
  FontOfMagicSelection,
  WildCompanionResourceKind,
  WildResurgenceMode
} from "./types";

type ActionsWidgetUiState = {
  isCommonActionsOpen: boolean;
  selectedActionKey: string | null;
  selectedActionOptionKeys: string[];
  selectedChannelDivinityOptionKey: string | null;
  selectedFontOfMagicSelection: FontOfMagicSelection | null;
  selectedWildShapeMonsterSlug: string | null;
  selectedWildCompanionResource: WildCompanionResourceKind;
  selectedBardicInspirationSpellSlotLevel: number | null;
  selectedBeastMasterReviveSpellSlotLevel: number | null;
  selectedWildCompanionSpellSlotLevel: number;
  selectedWildResurgenceMode: WildResurgenceMode | null;
  selectedWildResurgenceSpellSlotLevel: number;
  selectedNatureMagicianSpellSlotLevel: number | null;
  selectedLayOnHandsTarget: LayOnHandsTarget;
  selectedLayOnHandsPoolSpendInput: string;
  selectedLayOnHandsConditions: LayOnHandsCondition[];
  selectedBlessingOfTheTricksterTarget: BlessingOfTheTricksterTarget;
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
  selectedElementalSmiteOptionOnActionSpell:
    | PaladinOathOfTheNobleGeniesElementalSmiteOptionKey
    | null;
  useFrozenHauntOnActionSpell: boolean;
  selectedFrozenHauntFallbackSlotLevel: number;
  isCrownOfSpellfireSelected: boolean;
  isInspiredEclipseSelected: boolean;
  isGroupRecoverySelected: boolean;
  isClairvoyantCombatantSelected: boolean;
  isPsionicStrikeSelected: boolean;
  isDreadfulStrikeSelected: boolean;
  isColossusSlayerSelected: boolean;
  isPolarStrikesSelected: boolean;
  isHuntersMarkTargetSelected: boolean;
  isSacredWeaponSelected: boolean;
  isVowOfEnmitySelected: boolean;
  isStunningStrikeSelected: boolean;
  isHandOfHarmSelected: boolean;
  isFlurryOfHealingAndHarmSelected: boolean;
  isEmpoweredStrikesSelected: boolean;
  isQuiveringPalmSelected: boolean;
  isImprovedShadowStepSelected: boolean;
};

type FieldSetterMap = {
  [K in keyof ActionsWidgetUiState as `set${Capitalize<string & K>}`]: Dispatch<
    SetStateAction<ActionsWidgetUiState[K]>
  >;
};

type ActionsWidgetUiAction =
  | {
      type: "set";
      key: keyof ActionsWidgetUiState;
      value: unknown;
    }
  | {
      type: "reset-action-drawer";
    }
  | {
      type: "reset-action-selection";
    };

type ActionsWidgetUiStateResult = ActionsWidgetUiState &
  FieldSetterMap & {
    resetActionDrawerState: () => void;
    resetActionSelectionState: () => void;
  };

function createInitialState(frozenHauntFallbackSpellSlotMinimumLevel: number): ActionsWidgetUiState {
  return {
    isCommonActionsOpen: false,
    selectedActionKey: null,
    selectedActionOptionKeys: [],
    selectedChannelDivinityOptionKey: null,
    selectedFontOfMagicSelection: null,
    selectedWildShapeMonsterSlug: null,
    selectedWildCompanionResource: "wild-shape",
    selectedBardicInspirationSpellSlotLevel: null,
    selectedBeastMasterReviveSpellSlotLevel: null,
    selectedWildCompanionSpellSlotLevel: 1,
    selectedWildResurgenceMode: null,
    selectedWildResurgenceSpellSlotLevel: 1,
    selectedNatureMagicianSpellSlotLevel: null,
    selectedLayOnHandsTarget: "self",
    selectedLayOnHandsPoolSpendInput: "0",
    selectedLayOnHandsConditions: [],
    selectedBlessingOfTheTricksterTarget: "self",
    selectedThirdEyeOptionKey: null,
    selectedStarryFormConstellation: null,
    selectedWildShapePreviewSlug: null,
    selectedRageOptionKey: null,
    selectedRagePowerOptionKey: null,
    isRageOfTheGodsSelected: false,
    selectedIndomitableAbility: null,
    selectedWarriorOfTheGodsChargeCount: 1,
    isFixedSpellDrawerOpen: false,
    selectedFixedSpellSlotLevel: 1,
    isDiceRollerSettingsOpen: false,
    selectedDivineInterventionSpell: null,
    selectedMysticArcanumSpell: null,
    selectedMysticArcanumSpellLevel: null,
    useBeguilingMagicOnActionSpell: false,
    useElementalSmiteOnActionSpell: false,
    selectedElementalSmiteOptionOnActionSpell: null,
    useFrozenHauntOnActionSpell: false,
    selectedFrozenHauntFallbackSlotLevel: frozenHauntFallbackSpellSlotMinimumLevel,
    isCrownOfSpellfireSelected: false,
    isInspiredEclipseSelected: false,
    isGroupRecoverySelected: false,
    isClairvoyantCombatantSelected: false,
    isPsionicStrikeSelected: false,
    isDreadfulStrikeSelected: false,
    isColossusSlayerSelected: false,
    isPolarStrikesSelected: false,
    isHuntersMarkTargetSelected: false,
    isSacredWeaponSelected: false,
    isVowOfEnmitySelected: false,
    isStunningStrikeSelected: false,
    isHandOfHarmSelected: false,
    isFlurryOfHealingAndHarmSelected: false,
    isEmpoweredStrikesSelected: false,
    isQuiveringPalmSelected: false,
    isImprovedShadowStepSelected: false
  };
}

function getActionDrawerResetState(): Partial<ActionsWidgetUiState> {
  return {
    selectedActionOptionKeys: [],
    selectedChannelDivinityOptionKey: null,
    selectedFontOfMagicSelection: null,
    selectedWildShapeMonsterSlug: null,
    selectedWildShapePreviewSlug: null,
    selectedWildCompanionResource: "wild-shape",
    selectedBardicInspirationSpellSlotLevel: null,
    selectedWildCompanionSpellSlotLevel: 1,
    selectedWildResurgenceMode: null,
    selectedWildResurgenceSpellSlotLevel: 1,
    selectedNatureMagicianSpellSlotLevel: null,
    selectedLayOnHandsTarget: "self",
    selectedLayOnHandsPoolSpendInput: "0",
    selectedLayOnHandsConditions: [],
    selectedBlessingOfTheTricksterTarget: "self",
    selectedThirdEyeOptionKey: null,
    selectedStarryFormConstellation: null,
    selectedRageOptionKey: null,
    selectedRagePowerOptionKey: null,
    isRageOfTheGodsSelected: false,
    selectedWarriorOfTheGodsChargeCount: 1,
    useBeguilingMagicOnActionSpell: false,
    useElementalSmiteOnActionSpell: false,
    selectedElementalSmiteOptionOnActionSpell: null,
    isDiceRollerSettingsOpen: false,
    isFixedSpellDrawerOpen: false,
    selectedFixedSpellSlotLevel: 1,
    selectedDivineInterventionSpell: null,
    selectedMysticArcanumSpell: null,
    selectedMysticArcanumSpellLevel: null,
    isCrownOfSpellfireSelected: false,
    isInspiredEclipseSelected: false,
    isGroupRecoverySelected: false,
    isClairvoyantCombatantSelected: false,
    isPsionicStrikeSelected: false,
    isDreadfulStrikeSelected: false,
    isColossusSlayerSelected: false,
    isPolarStrikesSelected: false,
    isHuntersMarkTargetSelected: false,
    isSacredWeaponSelected: false,
    isVowOfEnmitySelected: false,
    isStunningStrikeSelected: false,
    isEmpoweredStrikesSelected: false,
    isHandOfHarmSelected: false,
    isFlurryOfHealingAndHarmSelected: false,
    isQuiveringPalmSelected: false,
    isImprovedShadowStepSelected: false,
    selectedActionKey: null
  };
}

function getActionSelectionResetState(): Partial<ActionsWidgetUiState> {
  return {
    selectedActionOptionKeys: [],
    selectedChannelDivinityOptionKey: null,
    selectedFontOfMagicSelection: null,
    selectedWildShapeMonsterSlug: null,
    selectedWildShapePreviewSlug: null,
    selectedWildCompanionResource: "wild-shape",
    selectedBeastMasterReviveSpellSlotLevel: null,
    selectedWildCompanionSpellSlotLevel: 1,
    selectedWildResurgenceMode: null,
    selectedWildResurgenceSpellSlotLevel: 1,
    selectedNatureMagicianSpellSlotLevel: null,
    selectedLayOnHandsTarget: "self",
    selectedLayOnHandsPoolSpendInput: "0",
    selectedLayOnHandsConditions: [],
    selectedThirdEyeOptionKey: null,
    selectedStarryFormConstellation: null,
    selectedRageOptionKey: null,
    selectedRagePowerOptionKey: null,
    isRageOfTheGodsSelected: false,
    selectedIndomitableAbility: null,
    isCrownOfSpellfireSelected: false,
    isGroupRecoverySelected: false,
    isClairvoyantCombatantSelected: false,
    isPsionicStrikeSelected: false,
    isColossusSlayerSelected: false,
    isSacredWeaponSelected: false,
    isVowOfEnmitySelected: false,
    isHuntersMarkTargetSelected: false,
    isStunningStrikeSelected: false,
    isEmpoweredStrikesSelected: false,
    isHandOfHarmSelected: false,
    isQuiveringPalmSelected: false,
    isImprovedShadowStepSelected: false
  };
}

function createActionsWidgetUiReducer(): (
  state: ActionsWidgetUiState,
  action: ActionsWidgetUiAction
) => ActionsWidgetUiState {
  return (state, action) => {
    if (action.type === "reset-action-drawer") {
      return {
        ...state,
        ...getActionDrawerResetState()
      };
    }

    if (action.type === "reset-action-selection") {
      return {
        ...state,
        ...getActionSelectionResetState()
      };
    }

    const currentValue = state[action.key];
    const value = action.value as SetStateAction<typeof currentValue>;
    const nextValue =
      typeof action.value === "function"
        ? (value as (value: typeof currentValue) => typeof currentValue)(currentValue)
        : value;

    if (Object.is(currentValue, nextValue)) {
      return state;
    }

    return {
      ...state,
      [action.key]: nextValue
    };
  };
}

function createFieldSetter<K extends keyof ActionsWidgetUiState>(
  dispatch: Dispatch<ActionsWidgetUiAction>,
  key: K
): Dispatch<SetStateAction<ActionsWidgetUiState[K]>> {
  return (value) =>
    dispatch({
      type: "set",
      key,
      value
    });
}

export function useActionsWidgetUiState(
  frozenHauntFallbackSpellSlotMinimumLevel: number
): ActionsWidgetUiStateResult {
  const reducer = useMemo(
    () => createActionsWidgetUiReducer(),
    []
  );
  const [state, dispatch] = useReducer(
    reducer,
    frozenHauntFallbackSpellSlotMinimumLevel,
    createInitialState
  );
  const setters = useMemo(
    () => ({
      setIsCommonActionsOpen: createFieldSetter(dispatch, "isCommonActionsOpen"),
      setSelectedActionKey: createFieldSetter(dispatch, "selectedActionKey"),
      setSelectedActionOptionKeys: createFieldSetter(dispatch, "selectedActionOptionKeys"),
      setSelectedChannelDivinityOptionKey: createFieldSetter(
        dispatch,
        "selectedChannelDivinityOptionKey"
      ),
      setSelectedFontOfMagicSelection: createFieldSetter(dispatch, "selectedFontOfMagicSelection"),
      setSelectedWildShapeMonsterSlug: createFieldSetter(dispatch, "selectedWildShapeMonsterSlug"),
      setSelectedWildCompanionResource: createFieldSetter(
        dispatch,
        "selectedWildCompanionResource"
      ),
      setSelectedBardicInspirationSpellSlotLevel: createFieldSetter(
        dispatch,
        "selectedBardicInspirationSpellSlotLevel"
      ),
      setSelectedBeastMasterReviveSpellSlotLevel: createFieldSetter(
        dispatch,
        "selectedBeastMasterReviveSpellSlotLevel"
      ),
      setSelectedWildCompanionSpellSlotLevel: createFieldSetter(
        dispatch,
        "selectedWildCompanionSpellSlotLevel"
      ),
      setSelectedWildResurgenceMode: createFieldSetter(dispatch, "selectedWildResurgenceMode"),
      setSelectedWildResurgenceSpellSlotLevel: createFieldSetter(
        dispatch,
        "selectedWildResurgenceSpellSlotLevel"
      ),
      setSelectedNatureMagicianSpellSlotLevel: createFieldSetter(
        dispatch,
        "selectedNatureMagicianSpellSlotLevel"
      ),
      setSelectedLayOnHandsTarget: createFieldSetter(dispatch, "selectedLayOnHandsTarget"),
      setSelectedLayOnHandsPoolSpendInput: createFieldSetter(
        dispatch,
        "selectedLayOnHandsPoolSpendInput"
      ),
      setSelectedLayOnHandsConditions: createFieldSetter(
        dispatch,
        "selectedLayOnHandsConditions"
      ),
      setSelectedBlessingOfTheTricksterTarget: createFieldSetter(
        dispatch,
        "selectedBlessingOfTheTricksterTarget"
      ),
      setSelectedThirdEyeOptionKey: createFieldSetter(dispatch, "selectedThirdEyeOptionKey"),
      setSelectedStarryFormConstellation: createFieldSetter(
        dispatch,
        "selectedStarryFormConstellation"
      ),
      setSelectedWildShapePreviewSlug: createFieldSetter(dispatch, "selectedWildShapePreviewSlug"),
      setSelectedRageOptionKey: createFieldSetter(dispatch, "selectedRageOptionKey"),
      setSelectedRagePowerOptionKey: createFieldSetter(dispatch, "selectedRagePowerOptionKey"),
      setIsRageOfTheGodsSelected: createFieldSetter(dispatch, "isRageOfTheGodsSelected"),
      setSelectedIndomitableAbility: createFieldSetter(dispatch, "selectedIndomitableAbility"),
      setSelectedWarriorOfTheGodsChargeCount: createFieldSetter(
        dispatch,
        "selectedWarriorOfTheGodsChargeCount"
      ),
      setIsFixedSpellDrawerOpen: createFieldSetter(dispatch, "isFixedSpellDrawerOpen"),
      setSelectedFixedSpellSlotLevel: createFieldSetter(dispatch, "selectedFixedSpellSlotLevel"),
      setIsDiceRollerSettingsOpen: createFieldSetter(dispatch, "isDiceRollerSettingsOpen"),
      setSelectedDivineInterventionSpell: createFieldSetter(
        dispatch,
        "selectedDivineInterventionSpell"
      ),
      setSelectedMysticArcanumSpell: createFieldSetter(dispatch, "selectedMysticArcanumSpell"),
      setSelectedMysticArcanumSpellLevel: createFieldSetter(
        dispatch,
        "selectedMysticArcanumSpellLevel"
      ),
      setUseBeguilingMagicOnActionSpell: createFieldSetter(
        dispatch,
        "useBeguilingMagicOnActionSpell"
      ),
      setUseElementalSmiteOnActionSpell: createFieldSetter(
        dispatch,
        "useElementalSmiteOnActionSpell"
      ),
      setSelectedElementalSmiteOptionOnActionSpell: createFieldSetter(
        dispatch,
        "selectedElementalSmiteOptionOnActionSpell"
      ),
      setUseFrozenHauntOnActionSpell: createFieldSetter(dispatch, "useFrozenHauntOnActionSpell"),
      setSelectedFrozenHauntFallbackSlotLevel: createFieldSetter(
        dispatch,
        "selectedFrozenHauntFallbackSlotLevel"
      ),
      setIsCrownOfSpellfireSelected: createFieldSetter(dispatch, "isCrownOfSpellfireSelected"),
      setIsInspiredEclipseSelected: createFieldSetter(dispatch, "isInspiredEclipseSelected"),
      setIsGroupRecoverySelected: createFieldSetter(dispatch, "isGroupRecoverySelected"),
      setIsClairvoyantCombatantSelected: createFieldSetter(
        dispatch,
        "isClairvoyantCombatantSelected"
      ),
      setIsPsionicStrikeSelected: createFieldSetter(dispatch, "isPsionicStrikeSelected"),
      setIsDreadfulStrikeSelected: createFieldSetter(dispatch, "isDreadfulStrikeSelected"),
      setIsColossusSlayerSelected: createFieldSetter(dispatch, "isColossusSlayerSelected"),
      setIsPolarStrikesSelected: createFieldSetter(dispatch, "isPolarStrikesSelected"),
      setIsHuntersMarkTargetSelected: createFieldSetter(dispatch, "isHuntersMarkTargetSelected"),
      setIsSacredWeaponSelected: createFieldSetter(dispatch, "isSacredWeaponSelected"),
      setIsVowOfEnmitySelected: createFieldSetter(dispatch, "isVowOfEnmitySelected"),
      setIsStunningStrikeSelected: createFieldSetter(dispatch, "isStunningStrikeSelected"),
      setIsHandOfHarmSelected: createFieldSetter(dispatch, "isHandOfHarmSelected"),
      setIsFlurryOfHealingAndHarmSelected: createFieldSetter(
        dispatch,
        "isFlurryOfHealingAndHarmSelected"
      ),
      setIsEmpoweredStrikesSelected: createFieldSetter(dispatch, "isEmpoweredStrikesSelected"),
      setIsQuiveringPalmSelected: createFieldSetter(dispatch, "isQuiveringPalmSelected"),
      setIsImprovedShadowStepSelected: createFieldSetter(dispatch, "isImprovedShadowStepSelected")
    }),
    [dispatch]
  );
  const resetActionDrawerState = useCallback(
    () => dispatch({ type: "reset-action-drawer" }),
    [dispatch]
  );
  const resetActionSelectionState = useCallback(
    () => dispatch({ type: "reset-action-selection" }),
    [dispatch]
  );

  return {
    ...state,
    ...setters,
    resetActionDrawerState,
    resetActionSelectionState
  };
}
