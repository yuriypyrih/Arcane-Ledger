import { useCallback, useMemo, useReducer, type Dispatch, type SetStateAction } from "react";
import type {
  ActionsWidgetUiState,
  ActionsWidgetUiStateResult
} from "./types";

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

function createInitialState(
  frozenHauntFallbackSpellSlotMinimumLevel: number
): ActionsWidgetUiState {
  return {
    isCommonActionsOpen: false,
    isCustomActionsOpen: false,
    selectedActionKey: null,
    selectedActionOptionKeys: [],
    selectedChannelDivinityOptionKey: null,
    selectedFontOfMagicSelection: null,
    selectedWildShapeMonsterSlug: null,
    selectedWildCompanionResource: "wild-shape",
    selectedBardicInspirationSpellSlotLevel: null,
    selectedArcaneWardSpellSlotLevel: null,
    selectedExperimentalElixirOptionKey: null,
    selectedExperimentalElixirSpellSlotLevel: null,
    selectedArtificerEldritchCannonSpellSlotLevel: null,
    selectedArtificerSteelDefenderSpellSlotLevel: null,
    selectedBeastMasterReviveSpellSlotLevel: null,
    selectedWildCompanionSpellSlotLevel: 1,
    selectedWildResurgenceMode: null,
    selectedWildResurgenceSpellSlotLevel: 1,
    selectedNatureMagicianSpellSlotLevel: null,
    selectedLayOnHandsTarget: "self",
    selectedLayOnHandsPoolSpendInput: "0",
    selectedLayOnHandsConditions: [],
    selectedAasimarHealingHandsTarget: "other",
    selectedAasimarCelestialRevelationOptionKey: null,
    selectedBlessingOfTheTricksterTarget: "self",
    selectedHandOfHealingTarget: "self",
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
    useGoliathAncestryOnActionSpell: false,
    selectedElementalSmiteOptionOnActionSpell: null,
    useFrozenHauntOnActionSpell: false,
    selectedFrozenHauntFallbackSlotLevel: frozenHauntFallbackSpellSlotMinimumLevel,
    isCrownOfSpellfireSelected: false,
    isFortifyingSoulIncludingSelfSelected: false,
    isInspiredEclipseSelected: false,
    isGroupRecoverySelected: false,
    isClairvoyantCombatantSelected: false,
    isEldritchSmiteSelected: false,
    isLifedrinkerSelected: false,
    isPsionicStrikeSelected: false,
    isDreadfulStrikeSelected: false,
    isColossusSlayerSelected: false,
    isPolarStrikesSelected: false,
    isGoliathAncestryStrikeSelected: false,
    isHuntersMarkTargetSelected: false,
    isRecklessAttackSelected: false,
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
    selectedArcaneWardSpellSlotLevel: null,
    selectedExperimentalElixirOptionKey: null,
    selectedExperimentalElixirSpellSlotLevel: null,
    selectedArtificerEldritchCannonSpellSlotLevel: null,
    selectedArtificerSteelDefenderSpellSlotLevel: null,
    selectedWildCompanionSpellSlotLevel: 1,
    selectedWildResurgenceMode: null,
    selectedWildResurgenceSpellSlotLevel: 1,
    selectedNatureMagicianSpellSlotLevel: null,
    selectedLayOnHandsTarget: "self",
    selectedLayOnHandsPoolSpendInput: "0",
    selectedLayOnHandsConditions: [],
    selectedAasimarHealingHandsTarget: "other",
    selectedAasimarCelestialRevelationOptionKey: null,
    selectedBlessingOfTheTricksterTarget: "self",
    selectedHandOfHealingTarget: "self",
    selectedThirdEyeOptionKey: null,
    selectedStarryFormConstellation: null,
    selectedRageOptionKey: null,
    selectedRagePowerOptionKey: null,
    isRageOfTheGodsSelected: false,
    selectedWarriorOfTheGodsChargeCount: 1,
    useBeguilingMagicOnActionSpell: false,
    useElementalSmiteOnActionSpell: false,
    useGoliathAncestryOnActionSpell: false,
    selectedElementalSmiteOptionOnActionSpell: null,
    isDiceRollerSettingsOpen: false,
    isFixedSpellDrawerOpen: false,
    selectedFixedSpellSlotLevel: 1,
    selectedDivineInterventionSpell: null,
    selectedMysticArcanumSpell: null,
    selectedMysticArcanumSpellLevel: null,
    isCrownOfSpellfireSelected: false,
    isFortifyingSoulIncludingSelfSelected: false,
    isInspiredEclipseSelected: false,
    isGroupRecoverySelected: false,
    isClairvoyantCombatantSelected: false,
    isEldritchSmiteSelected: false,
    isLifedrinkerSelected: false,
    isPsionicStrikeSelected: false,
    isDreadfulStrikeSelected: false,
    isColossusSlayerSelected: false,
    isPolarStrikesSelected: false,
    isGoliathAncestryStrikeSelected: false,
    isHuntersMarkTargetSelected: false,
    isRecklessAttackSelected: false,
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
    selectedArcaneWardSpellSlotLevel: null,
    selectedExperimentalElixirOptionKey: null,
    selectedExperimentalElixirSpellSlotLevel: null,
    selectedArtificerEldritchCannonSpellSlotLevel: null,
    selectedArtificerSteelDefenderSpellSlotLevel: null,
    selectedWildCompanionSpellSlotLevel: 1,
    selectedWildResurgenceMode: null,
    selectedWildResurgenceSpellSlotLevel: 1,
    selectedNatureMagicianSpellSlotLevel: null,
    selectedLayOnHandsTarget: "self",
    selectedLayOnHandsPoolSpendInput: "0",
    selectedLayOnHandsConditions: [],
    selectedAasimarHealingHandsTarget: "other",
    selectedAasimarCelestialRevelationOptionKey: null,
    selectedHandOfHealingTarget: "self",
    selectedThirdEyeOptionKey: null,
    selectedStarryFormConstellation: null,
    selectedRageOptionKey: null,
    selectedRagePowerOptionKey: null,
    isRageOfTheGodsSelected: false,
    selectedIndomitableAbility: null,
    isCrownOfSpellfireSelected: false,
    isFortifyingSoulIncludingSelfSelected: false,
    isGroupRecoverySelected: false,
    isClairvoyantCombatantSelected: false,
    isEldritchSmiteSelected: false,
    isLifedrinkerSelected: false,
    isPsionicStrikeSelected: false,
    isColossusSlayerSelected: false,
    isGoliathAncestryStrikeSelected: false,
    isSacredWeaponSelected: false,
    isVowOfEnmitySelected: false,
    isHuntersMarkTargetSelected: false,
    isRecklessAttackSelected: false,
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
  const reducer = useMemo(() => createActionsWidgetUiReducer(), []);
  const [state, dispatch] = useReducer(
    reducer,
    frozenHauntFallbackSpellSlotMinimumLevel,
    createInitialState
  );
  const setters = useMemo(
    () => ({
      setIsCommonActionsOpen: createFieldSetter(dispatch, "isCommonActionsOpen"),
      setIsCustomActionsOpen: createFieldSetter(dispatch, "isCustomActionsOpen"),
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
      setSelectedArcaneWardSpellSlotLevel: createFieldSetter(
        dispatch,
        "selectedArcaneWardSpellSlotLevel"
      ),
      setSelectedExperimentalElixirOptionKey: createFieldSetter(
        dispatch,
        "selectedExperimentalElixirOptionKey"
      ),
      setSelectedExperimentalElixirSpellSlotLevel: createFieldSetter(
        dispatch,
        "selectedExperimentalElixirSpellSlotLevel"
      ),
      setSelectedArtificerEldritchCannonSpellSlotLevel: createFieldSetter(
        dispatch,
        "selectedArtificerEldritchCannonSpellSlotLevel"
      ),
      setSelectedArtificerSteelDefenderSpellSlotLevel: createFieldSetter(
        dispatch,
        "selectedArtificerSteelDefenderSpellSlotLevel"
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
      setSelectedLayOnHandsConditions: createFieldSetter(dispatch, "selectedLayOnHandsConditions"),
      setSelectedAasimarHealingHandsTarget: createFieldSetter(
        dispatch,
        "selectedAasimarHealingHandsTarget"
      ),
      setSelectedAasimarCelestialRevelationOptionKey: createFieldSetter(
        dispatch,
        "selectedAasimarCelestialRevelationOptionKey"
      ),
      setSelectedBlessingOfTheTricksterTarget: createFieldSetter(
        dispatch,
        "selectedBlessingOfTheTricksterTarget"
      ),
      setSelectedHandOfHealingTarget: createFieldSetter(dispatch, "selectedHandOfHealingTarget"),
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
      setUseGoliathAncestryOnActionSpell: createFieldSetter(
        dispatch,
        "useGoliathAncestryOnActionSpell"
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
      setIsFortifyingSoulIncludingSelfSelected: createFieldSetter(
        dispatch,
        "isFortifyingSoulIncludingSelfSelected"
      ),
      setIsInspiredEclipseSelected: createFieldSetter(dispatch, "isInspiredEclipseSelected"),
      setIsGroupRecoverySelected: createFieldSetter(dispatch, "isGroupRecoverySelected"),
      setIsClairvoyantCombatantSelected: createFieldSetter(
        dispatch,
        "isClairvoyantCombatantSelected"
      ),
      setIsEldritchSmiteSelected: createFieldSetter(dispatch, "isEldritchSmiteSelected"),
      setIsLifedrinkerSelected: createFieldSetter(dispatch, "isLifedrinkerSelected"),
      setIsPsionicStrikeSelected: createFieldSetter(dispatch, "isPsionicStrikeSelected"),
      setIsDreadfulStrikeSelected: createFieldSetter(dispatch, "isDreadfulStrikeSelected"),
      setIsColossusSlayerSelected: createFieldSetter(dispatch, "isColossusSlayerSelected"),
      setIsPolarStrikesSelected: createFieldSetter(dispatch, "isPolarStrikesSelected"),
      setIsGoliathAncestryStrikeSelected: createFieldSetter(
        dispatch,
        "isGoliathAncestryStrikeSelected"
      ),
      setIsHuntersMarkTargetSelected: createFieldSetter(dispatch, "isHuntersMarkTargetSelected"),
      setIsRecklessAttackSelected: createFieldSetter(dispatch, "isRecklessAttackSelected"),
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
