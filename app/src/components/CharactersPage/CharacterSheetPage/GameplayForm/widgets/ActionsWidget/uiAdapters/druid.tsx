import { applyActionResourceTransition } from "../actionResourceTransition";
import type { ActionFormKind } from "./types";
import {
  type ActionFormAdapter,
  type ActionFormBodyContext,
  type ActionFormFooterContext
} from "./types";
import WildShapeActionBody from "../forms/WildShapeActionBody";
import {
  hasDruidTwinklingConstellationsFeatureForCharacter,
  activateDruidNatureMagicianForCharacter,
  activateDruidStarryFormForCharacter,
  activateDruidWildResurgenceLevelOneSpellSlotRecoveryForCharacter,
  activateDruidWildResurgenceWildShapeRecoveryForCharacter,
  activateDruidWildShapeForCharacter,
  activateDruidWildCompanionForCharacter
} from "../../../../../../../pages/CharactersPage/classFeatures";
import DruidStarryFormActionBody from "../../TraitsConditionsWidget/DruidStarryFormActionBody";
import WildCompanionActionBody from "../forms/WildCompanionActionBody";
import NatureMagicianActionBody from "../forms/NatureMagicianActionBody";
import WildResurgenceActionBody from "../forms/WildResurgenceActionBody";
import ActionShape from "../../../../../../ActionShape";
import ActionButton from "../../../../../../ActionButton";
import styles from "../ActionsWidget.module.css";

import { type ActionsWidgetSubmissionContext } from "../types";

function renderWildShapeBody(context: ActionFormBodyContext) {
  const {
    selectedAction,
    selectedWildShapeMonsterSlug,
    setSelectedWildShapeMonsterSlug,
    setSelectedWildShapePreviewSlug,
    wildShapeKnownForms
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "wild-shape") {
    return (
      <WildShapeActionBody
        monsters={wildShapeKnownForms}
        selectedMonsterKey={selectedWildShapeMonsterSlug}
        onSelectMonster={setSelectedWildShapeMonsterSlug}
        onPreviewMonster={setSelectedWildShapePreviewSlug}
      />
    );
  }
  return undefined;
}

function renderStarryFormBody(context: ActionFormBodyContext) {
  const {
    character,
    selectedAction,
    selectedStarryFormConstellation,
    setSelectedStarryFormConstellation
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "starry-form") {
    return (
      <DruidStarryFormActionBody
        selectedConstellation={selectedStarryFormConstellation}
        hasTwinklingConstellations={hasDruidTwinklingConstellationsFeatureForCharacter(character)}
        onSelectConstellation={setSelectedStarryFormConstellation}
      />
    );
  }
  return undefined;
}

function renderWildCompanionBody(context: ActionFormBodyContext) {
  const {
    selectedAction,
    selectedWildCompanionResource,
    selectedWildCompanionSpellSlotLevel,
    setSelectedWildCompanionResource,
    setSelectedWildCompanionSpellSlotLevel,
    wildCompanionSpellSlotOptions,
    wildShapeUsesRemaining,
    wildShapeUsesTotal
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "wild-companion") {
    return (
      <WildCompanionActionBody
        wildShapeUsesRemaining={wildShapeUsesRemaining}
        wildShapeUsesTotal={wildShapeUsesTotal}
        spellSlotOptions={wildCompanionSpellSlotOptions}
        selectedResource={selectedWildCompanionResource}
        selectedSpellSlotLevel={selectedWildCompanionSpellSlotLevel}
        onSelectResource={setSelectedWildCompanionResource}
        onSelectSpellSlotLevel={setSelectedWildCompanionSpellSlotLevel}
      />
    );
  }
  return undefined;
}

function renderNatureMagicianBody(context: ActionFormBodyContext) {
  const {
    natureMagicianOptions,
    selectedAction,
    selectedNatureMagicianSpellSlotLevel,
    setSelectedNatureMagicianSpellSlotLevel
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "nature-magician") {
    return (
      <NatureMagicianActionBody
        options={natureMagicianOptions}
        selectedSpellSlotLevel={selectedNatureMagicianSpellSlotLevel}
        onSelectSpellSlotLevel={setSelectedNatureMagicianSpellSlotLevel}
      />
    );
  }
  return undefined;
}

function renderWildResurgenceBody(context: ActionFormBodyContext) {
  const {
    fixedSpellSlotTotals,
    fixedSpellSlotsRemaining,
    selectedAction,
    selectedWildResurgenceMode,
    selectedWildResurgenceSpellSlotLevel,
    setSelectedWildResurgenceMode,
    setSelectedWildResurgenceSpellSlotLevel,
    wildResurgenceSpellSlotOptions,
    wildResurgenceSpellSlotRecoveryUsesRemaining,
    wildShapeUsesRemaining,
    wildShapeUsesTotal
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "wild-resurgence") {
    return (
      <WildResurgenceActionBody
        spellSlotOptions={wildResurgenceSpellSlotOptions}
        selectedMode={selectedWildResurgenceMode}
        selectedSpellSlotLevel={selectedWildResurgenceSpellSlotLevel}
        wildShapeUsesRemaining={wildShapeUsesRemaining}
        wildShapeUsesTotal={wildShapeUsesTotal}
        levelOneSpellSlotRemaining={fixedSpellSlotsRemaining[0] ?? 0}
        levelOneSpellSlotTotal={fixedSpellSlotTotals[0] ?? 0}
        spellSlotRecoveryUsesRemaining={wildResurgenceSpellSlotRecoveryUsesRemaining}
        onSelectMode={setSelectedWildResurgenceMode}
        onSelectSpellSlotLevel={setSelectedWildResurgenceSpellSlotLevel}
      />
    );
  }
  return undefined;
}

function renderWildShapeFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    selectedWildShapeMonster,
    submitWildShape,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "wild-shape"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitWildShape)}
        disabled={!selectedWildShapeMonster || selectedFeatureActionPrimaryDisabledReason !== null}
        trailingBadge={
          <ActionShape
            shape="bonusAction"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            className={styles.footerActionShape}
          />
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }
  return undefined;
}

function renderStarryFormFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    selectedStarryFormConstellation,
    submitStarryForm,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "starry-form"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitStarryForm)}
        disabled={
          selectedFeatureActionPrimaryDisabledReason !== null ||
          selectedStarryFormConstellation === null
        }
        trailingBadge={
          <ActionShape
            shape="bonusAction"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            className={styles.footerActionShape}
          />
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }
  return undefined;
}

function renderWildCompanionFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    canUseSelectedWildCompanionResource,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    submitWildCompanion,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "wild-companion"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitWildCompanion)}
        disabled={
          selectedFeatureActionPrimaryDisabledReason !== null ||
          !canUseSelectedWildCompanionResource
        }
        trailingBadge={
          <ActionShape
            shape="action"
            isSelected={selectedActionEconomyShapeState?.isAvailable ?? true}
            multiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
            className={styles.footerActionShape}
          />
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }
  return undefined;
}

function renderNatureMagicianFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    selectedAction,
    selectedFeatureActionPrimaryDisabledReason,
    selectedNatureMagicianOption,
    submitNatureMagician,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "nature-magician"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitNatureMagician)}
        disabled={
          selectedFeatureActionPrimaryDisabledReason !== null || !selectedNatureMagicianOption
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }
  return undefined;
}

function renderWildResurgenceFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    canUseSelectedWildResurgenceMode,
    selectedAction,
    selectedFeatureActionPrimaryDisabledReason,
    submitWildResurgence,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "wild-resurgence"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(submitWildResurgence)}
        disabled={
          !canUseSelectedWildResurgenceMode || selectedFeatureActionPrimaryDisabledReason !== null
        }
      >
        {selectedFeaturePrimaryLabel}
      </ActionButton>
    );
  }
  return undefined;
}
export const druidFormAdapters = {
  "wild-shape": { body: renderWildShapeBody, footer: renderWildShapeFooter },
  "starry-form": { body: renderStarryFormBody, footer: renderStarryFormFooter },
  "wild-companion": { body: renderWildCompanionBody, footer: renderWildCompanionFooter },
  "nature-magician": { body: renderNatureMagicianBody, footer: renderNatureMagicianFooter },
  "wild-resurgence": { body: renderWildResurgenceBody, footer: renderWildResurgenceFooter }
} satisfies Partial<Record<ActionFormKind, ActionFormAdapter>>;
export function createDruidFormSubmissions(context: ActionsWidgetSubmissionContext) {
  const {
    onPersistCharacter,
    closeActionDrawer,
    prepareCharacterForResourceConsumption,
    selectedFeatureAction,
    selectedWildShapeMonsterSlug,
    selectedStarryFormConstellation,
    selectedWildCompanionResource,
    selectedWildCompanionSpellSlotRemaining,
    selectedWildCompanionSpellSlotLevel,
    selectedNatureMagicianOption,
    selectedWildResurgenceMode,
    selectedWildResurgenceSpellSlotLevel,
    wildShapeUsesRemaining
  } = context;
  function submitWildShape() {
    if (!selectedFeatureAction || !selectedWildShapeMonsterSlug) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) =>
          activateDruidWildShapeForCharacter(preparedCharacter, selectedWildShapeMonsterSlug)
      )
    );

    closeActionDrawer();
  }

  function submitStarryForm() {
    if (!selectedFeatureAction || !selectedStarryFormConstellation) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) =>
          activateDruidStarryFormForCharacter(preparedCharacter, selectedStarryFormConstellation)
      )
    );

    closeActionDrawer();
  }

  function submitWildCompanion() {
    if (!selectedFeatureAction) {
      return;
    }

    if (
      selectedWildCompanionResource === "spell-slot" &&
      selectedWildCompanionSpellSlotRemaining <= 0
    ) {
      return;
    }

    if (selectedWildCompanionResource === "wild-shape" && wildShapeUsesRemaining <= 0) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      applyActionResourceTransition(
        currentCharacter,
        selectedFeatureAction.economyType,
        prepareCharacterForResourceConsumption,
        (preparedCharacter) =>
          activateDruidWildCompanionForCharacter(
            preparedCharacter,
            selectedWildCompanionResource === "spell-slot"
              ? {
                  kind: "spell-slot",
                  spellSlotLevel: selectedWildCompanionSpellSlotLevel
                }
              : {
                  kind: "wild-shape"
                }
          )
      )
    );

    closeActionDrawer();
  }

  function submitNatureMagician() {
    if (!selectedNatureMagicianOption) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      activateDruidNatureMagicianForCharacter(
        currentCharacter,
        selectedNatureMagicianOption.spellSlotLevel
      )
    );

    closeActionDrawer();
  }

  function submitWildResurgence() {
    if (!selectedWildResurgenceMode) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      if (selectedWildResurgenceMode === "spell-slot-to-wild-shape") {
        return activateDruidWildResurgenceWildShapeRecoveryForCharacter(
          currentCharacter,
          selectedWildResurgenceSpellSlotLevel
        );
      }

      return activateDruidWildResurgenceLevelOneSpellSlotRecoveryForCharacter(currentCharacter);
    });

    closeActionDrawer();
  }
  return {
    submitWildShape,
    submitStarryForm,
    submitWildCompanion,
    submitNatureMagician,
    submitWildResurgence
  };
}
