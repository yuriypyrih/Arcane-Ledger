import { applyActionResourceTransition } from "../actionResourceTransition";
import type { ActionFormKind } from "./types";
import {
  type ActionFormAdapter,
  type ActionFormBodyContext,
  type ActionFormFooterContext
} from "./types";
import HealingLightActionBody, { type HealingLightTarget } from "../HealingLightActionBody";
import { getActionShapeForEconomyType } from "../../../gameplayWidgetUtils";
import ActionDiceConfirmFooter from "../ActionDiceConfirmFooter";
import { spendWarlockHealingLightDiceForCharacter } from "../../../../../../../pages/CharactersPage/classFeatures";

import { applyRolledHealingToCharacter } from "../../../gameplayStateUtils";
import { type ActionsWidgetSubmissionContext } from "../types";
import type { CharacterCompanion } from "../../../../../../../types";
import {
  summonWarlockVestigeCompanion,
  vestigeCompanionActionKey
} from "../../../../../../../pages/CharactersPage/classFeatures/warlock/subclasses/warlockVestigePatron";
import ActionButton from "../../../../../../ActionButton";
import ActionShape from "../../../../../../ActionShape";
import ActionFooterButtonRow from "../ActionFooterButtonRow";
import VestigeCompanionActionBody from "../forms/VestigeCompanionActionBody";
import styles from "../ActionsWidget.module.css";
import {
  activateSemblanceOfLife,
  getSemblanceOfLifeDefinitionError,
  semblanceOfLifeActionKey
} from "../../../../../../../pages/CharactersPage/classFeatures/warlock/subclasses/warlockSemblanceOfLife";

function renderHealingLightBody(context: ActionFormBodyContext) {
  const {
    selectedAction,
    selectedHealingLightDiceCount,
    selectedHealingLightDiceRemaining,
    selectedHealingLightMaxDicePerUse,
    selectedHealingLightTarget,
    setSelectedHealingLightDiceCount,
    setSelectedHealingLightTarget
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "healing-light") {
    return (
      <HealingLightActionBody
        remainingDice={selectedHealingLightDiceRemaining}
        maxDicePerUse={selectedHealingLightMaxDicePerUse}
        selectedDiceCount={selectedHealingLightDiceCount}
        selectedTarget={selectedHealingLightTarget}
        onSelectedDiceCountChange={setSelectedHealingLightDiceCount}
        onSelectedTargetChange={setSelectedHealingLightTarget}
      />
    );
  }
  return undefined;
}

function renderHealingLightFooter(context: ActionFormFooterContext) {
  const {
    isDiceRollerSettingsOpen,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    selectedHealingLightDiceCount,
    selectedHealingLightMaxSelectableDice,
    selectedHealingLightTarget,
    setIsDiceRollerSettingsOpen,
    submitHealingLight
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "healing-light"
  ) {
    const selectedDiceCanBeUsed =
      selectedHealingLightDiceCount > 0 &&
      selectedHealingLightDiceCount <= selectedHealingLightMaxSelectableDice;

    return (
      <ActionDiceConfirmFooter
        actionName={selectedAction.action.name}
        confirmLabel="Use Healing Light"
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null || !selectedDiceCanBeUsed}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onConfirm={() =>
          submitHealingLight(selectedHealingLightDiceCount, selectedHealingLightTarget)
        }
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }
  return undefined;
}
const vestigeFormAdapter: ActionFormAdapter = {
  body: (context) => <VestigeCompanionActionBody context={context} />,
  footer: (context) => {
    const {
      selectedAction,
      selectedVestigeCompanionDefinitions,
      selectedFeatureActionPrimaryDisabledReason,
      selectedActionEconomyShapeState,
      selectedFeaturePrimaryLabel,
      confirmSelectedActionToast,
      submitVestigeCompanion
    } = context;
    if (!selectedAction) return undefined;
    const definition = selectedVestigeCompanionDefinitions[0];
    const isForm =
      selectedAction.kind === "feature" && selectedAction.action.key === semblanceOfLifeActionKey;
    const warning =
      selectedFeatureActionPrimaryDisabledReason ??
      (isForm
        ? getSemblanceOfLifeDefinitionError(definition)
        : !definition?.inheritedCreatureEntry
          ? "Define your companion before summoning it."
          : null);
    const shape = getActionShapeForEconomyType(selectedAction.economyType);
    return (
      <>
        {warning ? <p>{warning}</p> : null}
        <ActionFooterButtonRow>
          <ActionButton
            className={styles.weaponFooterButton}
            disabled={warning !== null}
            onClick={confirmSelectedActionToast(() => {
              if (definition && !warning) submitVestigeCompanion(definition);
            })}
            trailingBadge={
              shape ? (
                <ActionShape
                  shape={shape}
                  isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
                  multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
                  className={styles.footerActionShape}
                />
              ) : null
            }
          >
            {selectedFeaturePrimaryLabel}
          </ActionButton>
        </ActionFooterButtonRow>
      </>
    );
  }
};
export const warlockFormAdapters = {
  "warlock-vestige-companion": vestigeFormAdapter,
  "warlock-semblance-of-life": vestigeFormAdapter,
  "healing-light": { body: renderHealingLightBody, footer: renderHealingLightFooter }
} satisfies Partial<Record<ActionFormKind, ActionFormAdapter>>;
export function createWarlockFormSubmissions(context: ActionsWidgetSubmissionContext) {
  const {
    onPersistCharacter,
    openDiceRoller,
    closeActionDrawer,
    prepareCharacterForResourceConsumption,
    selectedFeatureAction
  } = context;
  function submitHealingLight(diceCount: number, target: HealingLightTarget) {
    if (!selectedFeatureAction || diceCount <= 0) {
      return;
    }

    const healingFormula = `${diceCount}d6`;
    const dieLabel = diceCount === 1 ? "Healing d6" : "Healing d6s";

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) =>
          spendWarlockHealingLightDiceForCharacter(preparedCharacter, diceCount)
      )
    );

    openDiceRoller({
      title: selectedFeatureAction.name,
      formula: healingFormula,
      formulaDisplay: healingFormula,
      description: `${selectedFeatureAction.detail} ${diceCount} ${dieLabel} expended.`,
      onResolvedResult:
        target === "self"
          ? ({ result }) => {
              onPersistCharacter((currentCharacter) =>
                applyRolledHealingToCharacter(currentCharacter, result.total)
              );
            }
          : undefined
    });

    closeActionDrawer();
  }
  function submitVestigeCompanion(definition: CharacterCompanion) {
    if (
      !selectedFeatureAction ||
      ![vestigeCompanionActionKey, semblanceOfLifeActionKey].includes(selectedFeatureAction.key)
    )
      return;
    let didApply = false;
    onPersistCharacter(
      (currentCharacter) => {
        const nextCharacter = applyActionResourceTransition(
          currentCharacter,
          selectedFeatureAction.economyType,
          prepareCharacterForResourceConsumption,
          (preparedCharacter) =>
            selectedFeatureAction.key === semblanceOfLifeActionKey
              ? activateSemblanceOfLife(preparedCharacter, definition)
              : summonWarlockVestigeCompanion(preparedCharacter, definition)
        );
        didApply = nextCharacter !== currentCharacter;
        return nextCharacter;
      },
      { domains: ["companions", "resources", "statuses"], normalize: "targeted" }
    );
    if (didApply) closeActionDrawer();
  }
  return { submitHealingLight, submitVestigeCompanion };
}
