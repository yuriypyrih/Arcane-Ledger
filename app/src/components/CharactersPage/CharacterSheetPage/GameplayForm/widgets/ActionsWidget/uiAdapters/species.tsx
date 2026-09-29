import { applyActionResourceTransition } from "../actionResourceTransition";
import type { ActionFormKind } from "./types";
import {
  type ActionFormAdapter,
  type ActionFormBodyContext,
  type ActionFormFooterContext
} from "./types";
import {
  AasimarHealingHandsActionBody,
  AasimarCelestialRevelationActionBody
} from "../AasimarActionBody";
import { getActionShapeForEconomyType } from "../../../gameplayWidgetUtils";
import ActionDiceConfirmFooter from "../ActionDiceConfirmFooter";
import ActionShape from "../../../../../../ActionShape";
import ActionButton from "../../../../../../ActionButton";
import styles from "../ActionsWidget.module.css";
import {
  activateAasimarCelestialRevelationForCharacter,
  activateDragonbornDraconicFlightForCharacter,
  activateDwarfStonecunningForCharacter,
  activateGoliathLargeFormForCharacter,
  consumeGoliathGiantAncestryUseForCharacter,
  getAasimarHealingHandsFormula,
  getDragonbornBreathWeaponDamageFormula,
  getDragonbornBreathWeaponDamageTypeLabelForCharacter,
  getGoliathStoneEnduranceDamageReductionFormula,
  getGoliathStoneEnduranceDamageReductionFormulaDisplay,
  getGoliathStormThunderDamageFormula,
  spendAasimarHealingHandsForCharacter,
  spendDragonbornBreathWeaponForCharacter
} from "../../../../../../../pages/CharactersPage/species";

import { applyRolledHealingToCharacter } from "../../../gameplayStateUtils";
import { type ActionsWidgetSubmissionContext } from "../types";

function renderAasimarHealingHandsBody(context: ActionFormBodyContext) {
  const {
    selectedAction,
    selectedAasimarHealingHandsTarget,
    setSelectedAasimarHealingHandsTarget
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "aasimar-healing-hands") {
    return (
      <AasimarHealingHandsActionBody
        selectedTarget={selectedAasimarHealingHandsTarget}
        onSelectedTargetChange={setSelectedAasimarHealingHandsTarget}
      />
    );
  }
  return undefined;
}

function renderAasimarCelestialRevelationBody(context: ActionFormBodyContext) {
  const {
    selectedAction,
    selectedAasimarCelestialRevelationOptionKey,
    setSelectedAasimarCelestialRevelationOptionKey
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "aasimar-celestial-revelation") {
    return (
      <AasimarCelestialRevelationActionBody
        selectedOptionKey={selectedAasimarCelestialRevelationOptionKey}
        onSelectOption={setSelectedAasimarCelestialRevelationOptionKey}
      />
    );
  }
  return undefined;
}

function renderAasimarHealingHandsFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    isDiceRollerSettingsOpen,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    setIsDiceRollerSettingsOpen,
    submitAasimarHealingHands
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "aasimar-healing-hands"
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitAasimarHealingHands}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }
  return undefined;
}

function renderDragonbornBreathWeaponFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    isDiceRollerSettingsOpen,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    setIsDiceRollerSettingsOpen,
    submitDragonbornBreathWeapon
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "dragonborn-breath-weapon"
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitDragonbornBreathWeapon}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }
  return undefined;
}

function renderAasimarCelestialRevelationFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    selectedAction,
    selectedActionEconomyShapeState,
    selectedAasimarCelestialRevelationOptionKey,
    selectedFeatureActionPrimaryDisabledReason,
    submitAasimarCelestialRevelation,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "aasimar-celestial-revelation"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitAasimarCelestialRevelation)}
        disabled={
          selectedFeatureActionPrimaryDisabledReason !== null ||
          selectedAasimarCelestialRevelationOptionKey === null
        }
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }
  return undefined;
}

function renderDragonbornDraconicFlightFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    submitDragonbornDraconicFlight,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.execute.kind === "custom-form" &&
    selectedAction.execute.formKind === "dragonborn-draconic-flight"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitDragonbornDraconicFlight)}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }
  return undefined;
}

function renderDwarfStonecunningFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    submitDwarfStonecunning,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.execute.kind === "custom-form" &&
    selectedAction.execute.formKind === "dwarf-stonecunning"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitDwarfStonecunning)}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }
  return undefined;
}

function renderGoliathCloudsJauntFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    submitGoliathCloudsJaunt,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.execute.kind === "custom-form" &&
    selectedAction.execute.formKind === "goliath-clouds-jaunt"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitGoliathCloudsJaunt)}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }
  return undefined;
}

function renderGoliathLargeFormFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    submitGoliathLargeForm,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.execute.kind === "custom-form" &&
    selectedAction.execute.formKind === "goliath-large-form"
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);

    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitGoliathLargeForm)}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          actionShape ? (
            <ActionShape
              shape={actionShape}
              isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
              multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
              className={styles.footerActionShape}
            />
          ) : null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }
  return undefined;
}

function renderGoliathStonesEnduranceFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    isDiceRollerSettingsOpen,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    setIsDiceRollerSettingsOpen,
    submitGoliathStonesEndurance
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.execute.kind === "custom-form" &&
    selectedAction.execute.formKind === "goliath-stones-endurance"
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitGoliathStonesEndurance}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }
  return undefined;
}

function renderGoliathStormsThunderFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    isDiceRollerSettingsOpen,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    setIsDiceRollerSettingsOpen,
    submitGoliathStormsThunder
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.execute.kind === "custom-form" &&
    selectedAction.execute.formKind === "goliath-storms-thunder"
  ) {
    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel={selectedFeaturePrimaryLabel}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={submitGoliathStormsThunder}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }
  return undefined;
}
export const speciesFormAdapters = {
  "aasimar-healing-hands": {
    body: renderAasimarHealingHandsBody,
    footer: renderAasimarHealingHandsFooter
  },
  "aasimar-celestial-revelation": {
    body: renderAasimarCelestialRevelationBody,
    footer: renderAasimarCelestialRevelationFooter
  },
  "dragonborn-breath-weapon": { footer: renderDragonbornBreathWeaponFooter },
  "dragonborn-draconic-flight": { footer: renderDragonbornDraconicFlightFooter },
  "dwarf-stonecunning": { footer: renderDwarfStonecunningFooter },
  "goliath-clouds-jaunt": { footer: renderGoliathCloudsJauntFooter },
  "goliath-large-form": { footer: renderGoliathLargeFormFooter },
  "goliath-stones-endurance": { footer: renderGoliathStonesEnduranceFooter },
  "goliath-storms-thunder": { footer: renderGoliathStormsThunderFooter }
} satisfies Partial<Record<ActionFormKind, ActionFormAdapter>>;
export function createSpeciesFormSubmissions(context: ActionsWidgetSubmissionContext) {
  const {
    character,
    onPersistCharacter,
    openDiceRoller,
    closeActionDrawer,
    prepareCharacterForResourceConsumption,
    selectedFeatureAction,
    selectedAasimarCelestialRevelationOptionKey,
    selectedAasimarHealingHandsTarget
  } = context;
  function submitAasimarHealingHands() {
    if (!selectedFeatureAction) {
      return;
    }

    const healingFormula = getAasimarHealingHandsFormula(character);

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) => spendAasimarHealingHandsForCharacter(preparedCharacter)
      )
    );

    openDiceRoller({
      title: selectedFeatureAction.name,
      formula: healingFormula,
      formulaDisplay: healingFormula,
      description: selectedFeatureAction.detail,
      getFullManualToastText: ({ result }) => `Rolled ${result.total} Healing Hands healing.`,
      onResolvedResult:
        selectedAasimarHealingHandsTarget === "self"
          ? ({ result }) => {
              onPersistCharacter((currentCharacter) =>
                applyRolledHealingToCharacter(currentCharacter, result.total)
              );
            }
          : undefined
    });

    closeActionDrawer();
  }

  function submitAasimarCelestialRevelation() {
    if (!selectedFeatureAction || !selectedAasimarCelestialRevelationOptionKey) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) =>
          activateAasimarCelestialRevelationForCharacter(
            preparedCharacter,
            selectedAasimarCelestialRevelationOptionKey
          )
      )
    );

    closeActionDrawer();
  }

  function submitDragonbornBreathWeapon() {
    if (!selectedFeatureAction) {
      return;
    }

    const damageFormula = getDragonbornBreathWeaponDamageFormula(character);
    const damageTypeLabel =
      getDragonbornBreathWeaponDamageTypeLabelForCharacter(character) ?? "Draconic Ancestry";

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) => spendDragonbornBreathWeaponForCharacter(preparedCharacter)
      )
    );

    openDiceRoller({
      title: selectedFeatureAction.name,
      formula: damageFormula,
      formulaDisplay: damageFormula,
      description: `${selectedFeatureAction.detail} Damage type: ${damageTypeLabel}.`,
      getFullManualToastText: ({ result }) =>
        `Rolled ${result.total} ${damageTypeLabel} Breath Weapon damage.`
    });

    closeActionDrawer();
  }

  function submitDragonbornDraconicFlight() {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) => activateDragonbornDraconicFlightForCharacter(preparedCharacter)
      )
    );

    closeActionDrawer();
  }

  function submitDwarfStonecunning() {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) => activateDwarfStonecunningForCharacter(preparedCharacter)
      )
    );

    closeActionDrawer();
  }

  function submitGoliathCloudsJaunt() {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) => consumeGoliathGiantAncestryUseForCharacter(preparedCharacter)
      )
    );

    closeActionDrawer();
  }

  function submitGoliathLargeForm() {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) => activateGoliathLargeFormForCharacter(preparedCharacter)
      )
    );

    closeActionDrawer();
  }

  function submitGoliathStonesEndurance() {
    if (!selectedFeatureAction) {
      return;
    }

    const damageReductionFormula = getGoliathStoneEnduranceDamageReductionFormula(character);
    const damageReductionFormulaDisplay =
      getGoliathStoneEnduranceDamageReductionFormulaDisplay(character);

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) => consumeGoliathGiantAncestryUseForCharacter(preparedCharacter)
      )
    );

    openDiceRoller({
      title: selectedFeatureAction.name,
      formula: damageReductionFormula,
      formulaDisplay: damageReductionFormulaDisplay,
      description: "Stone's Endurance damage reduction roll.",
      getFullManualToastText: ({ result }) =>
        `Reduced incoming damage by ${result.total} with Stone's Endurance.`
    });

    closeActionDrawer();
  }

  function submitGoliathStormsThunder() {
    if (!selectedFeatureAction) {
      return;
    }

    const damageFormula = getGoliathStormThunderDamageFormula();

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) => consumeGoliathGiantAncestryUseForCharacter(preparedCharacter)
      )
    );

    openDiceRoller({
      title: selectedFeatureAction.name,
      formula: damageFormula,
      formulaDisplay: "1d8 Thunder",
      description: "Storm's Thunder damage roll.",
      getFullManualToastText: ({ result }) =>
        `Rolled ${result.total} Thunder damage for Storm's Thunder.`
    });

    closeActionDrawer();
  }
  return {
    submitAasimarHealingHands,
    submitAasimarCelestialRevelation,
    submitDragonbornBreathWeapon,
    submitDragonbornDraconicFlight,
    submitDwarfStonecunning,
    submitGoliathCloudsJaunt,
    submitGoliathLargeForm,
    submitGoliathStonesEndurance,
    submitGoliathStormsThunder
  };
}
