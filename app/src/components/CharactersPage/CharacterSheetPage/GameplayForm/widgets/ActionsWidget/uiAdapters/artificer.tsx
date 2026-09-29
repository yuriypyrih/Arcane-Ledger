import type { ActionFormKind } from "./types";
import {
  type ActionFormAdapter,
  type ActionFormBodyContext,
  type ActionFormFooterContext
} from "./types";
import { getActionShapeForEconomyType } from "../../../gameplayWidgetUtils";
import TinkersMagicActionBody from "../forms/TinkersMagicActionBody";
import {
  getArtificerReplicateMagicItemCreatablePlanKeysForCharacter,
  getArtificerReplicateMagicItemPlanKeysForCharacter
} from "../../../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import ReplicateMagicItemActionBody from "../forms/ReplicateMagicItemActionBody";
import ExperimentalElixirActionBody from "../forms/ExperimentalElixirActionBody";
import ArtificerEldritchCannonActionBody from "../forms/ArtificerEldritchCannonActionBody";
import ArtificerArcaneFirearmActionBody from "../forms/ArtificerArcaneFirearmActionBody";
import MagicItemTinkerActionBody, {
  chargeMagicItemActionFormId,
  drainMagicItemActionFormId
} from "../forms/MagicItemTinkerActionBody";
import ActionShape from "../../../../../../ActionShape";
import ActionButton from "../../../../../../ActionButton";
import styles from "../ActionsWidget.module.css";
import ExperimentalElixirActionFooter from "../forms/ExperimentalElixirActionFooter";
import ArtificerEldritchCannonActionFooter from "../forms/ArtificerEldritchCannonActionFooter";
import ArtificerSteelDefenderActionFooter from "../forms/ArtificerSteelDefenderActionFooter";
import ArtificerArcaneFirearmActionFooter from "../forms/ArtificerArcaneFirearmActionFooter";

function renderTinkersMagicBody(context: ActionFormBodyContext) {
  const {
    isTinkersMagicSubmitting,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    submitArtificerTinkersMagic
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "tinkers-magic") {
    return (
      <TinkersMagicActionBody
        isSubmitting={isTinkersMagicSubmitting}
        disabledReason={selectedFeatureActionPrimaryDisabledReason}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        onUseItem={submitArtificerTinkersMagic}
      />
    );
  }
  return undefined;
}

function renderReplicateMagicItemBody(context: ActionFormBodyContext) {
  const {
    character,
    isReplicateMagicItemSubmitting,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    submitArtificerReplicateMagicItem
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "replicate-magic-item") {
    return (
      <ReplicateMagicItemActionBody
        knownPlanKeys={getArtificerReplicateMagicItemCreatablePlanKeysForCharacter(character)}
        isSubmitting={isReplicateMagicItemSubmitting}
        disabledReason={selectedFeatureActionPrimaryDisabledReason}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        onUseItem={submitArtificerReplicateMagicItem}
      />
    );
  }
  return undefined;
}

function renderArtificerExperimentalElixirBody(context: ActionFormBodyContext) {
  const {
    character,
    selectedAction,
    selectedExperimentalElixirOptionKey,
    setSelectedExperimentalElixirOptionKey
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "artificer-experimental-elixir") {
    return (
      <ExperimentalElixirActionBody
        character={character}
        selectedOptionKey={selectedExperimentalElixirOptionKey}
        onSelectedOptionKeyChange={setSelectedExperimentalElixirOptionKey}
      />
    );
  }
  return undefined;
}

function renderArtificerEldritchCannonBody(context: ActionFormBodyContext) {
  const { selectedAction, selectedActionOptionKeys, setSelectedActionOptionKeys } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "artificer-eldritch-cannon") {
    return (
      <ArtificerEldritchCannonActionBody
        selectedOptionKey={selectedActionOptionKeys[0] ?? null}
        onSelectedOptionKeyChange={(optionKey) =>
          setSelectedActionOptionKeys(optionKey ? [optionKey] : [])
        }
      />
    );
  }
  return undefined;
}

function renderArtificerArcaneFirearmBody(context: ActionFormBodyContext) {
  const { character, selectedAction, selectedActionOptionKeys, setSelectedActionOptionKeys } =
    context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "artificer-arcane-firearm") {
    return (
      <ArtificerArcaneFirearmActionBody
        character={character}
        selectedStackId={selectedActionOptionKeys[0] ?? null}
        onSelectedStackIdChange={(stackId) => setSelectedActionOptionKeys(stackId ? [stackId] : [])}
      />
    );
  }
  return undefined;
}

function renderArtificerChargeMagicItemBody(context: ActionFormBodyContext) {
  const {
    character,
    isArtificerMagicItemTinkerSubmitting,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    submitArtificerChargeMagicItem,
    submitArtificerDrainMagicItem,
    submitArtificerTransmuteMagicItem
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (
    selectedAction.drawer.formKind === "artificer-charge-magic-item" ||
    selectedAction.drawer.formKind === "artificer-drain-magic-item" ||
    selectedAction.drawer.formKind === "artificer-transmute-magic-item"
  ) {
    return (
      <MagicItemTinkerActionBody
        actionKey={selectedAction.action.key}
        character={character}
        knownPlanKeys={getArtificerReplicateMagicItemPlanKeysForCharacter(character)}
        isSubmitting={isArtificerMagicItemTinkerSubmitting}
        disabledReason={selectedFeatureActionPrimaryDisabledReason}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        confirmationTrigger={selectedAction.economyType}
        onChargeMagicItem={submitArtificerChargeMagicItem}
        onDrainMagicItem={submitArtificerDrainMagicItem}
        onTransmuteMagicItem={submitArtificerTransmuteMagicItem}
      />
    );
  }
  return undefined;
}

function renderArtificerChargeMagicItemFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    isArtificerMagicItemTinkerSubmitting,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    (selectedAction.drawer.formKind === "artificer-charge-magic-item" ||
      selectedAction.drawer.formKind === "artificer-drain-magic-item")
  ) {
    const actionShape = getActionShapeForEconomyType(selectedAction.economyType);
    const formId =
      selectedAction.drawer.formKind === "artificer-charge-magic-item"
        ? chargeMagicItemActionFormId
        : drainMagicItemActionFormId;

    return (
      <ActionButton
        className={styles.footerActionButton}
        type="submit"
        form={formId}
        loading={isArtificerMagicItemTinkerSubmitting}
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

function renderArtificerExperimentalElixirFooter(context: ActionFormFooterContext) {
  const {
    character,
    isExperimentalElixirSubmitting,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedExperimentalElixirOptionKey,
    selectedExperimentalElixirSpellSlotLevel,
    selectedFeatureActionPrimaryDisabledReason,
    setSelectedExperimentalElixirSpellSlotLevel,
    submitArtificerExperimentalElixir
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "artificer-experimental-elixir"
  ) {
    return (
      <ExperimentalElixirActionFooter
        character={character}
        selectedOptionKey={selectedExperimentalElixirOptionKey}
        selectedSpellSlotLevel={selectedExperimentalElixirSpellSlotLevel}
        isSubmitting={isExperimentalElixirSubmitting}
        disabledReason={selectedFeatureActionPrimaryDisabledReason}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        onSelectedSpellSlotLevelChange={setSelectedExperimentalElixirSpellSlotLevel}
        onUseElixir={submitArtificerExperimentalElixir}
      />
    );
  }
  return undefined;
}

function renderArtificerEldritchCannonFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    character,
    isEldritchCannonSubmitting,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedActionOptionKeys,
    selectedArtificerEldritchCannonSpellSlotLevel,
    selectedFeatureActionPrimaryDisabledReason,
    setSelectedArtificerEldritchCannonSpellSlotLevel,
    submitArtificerEldritchCannon
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "artificer-eldritch-cannon"
  ) {
    return (
      <ArtificerEldritchCannonActionFooter
        character={character}
        selectedOptionKey={selectedActionOptionKeys[0] ?? null}
        selectedSpellSlotLevel={selectedArtificerEldritchCannonSpellSlotLevel}
        isSubmitting={isEldritchCannonSubmitting}
        disabledReason={selectedFeatureActionPrimaryDisabledReason}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        confirmLabel={selectedFeaturePrimaryLabel}
        onSelectedSpellSlotLevelChange={setSelectedArtificerEldritchCannonSpellSlotLevel}
        onUseCannon={submitArtificerEldritchCannon}
      />
    );
  }
  return undefined;
}

function renderArtificerSteelDefenderFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    character,
    isSteelDefenderSubmitting,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedArtificerSteelDefenderSpellSlotLevel,
    selectedFeatureActionPrimaryDisabledReason,
    setSelectedArtificerSteelDefenderSpellSlotLevel,
    submitArtificerSteelDefender
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "artificer-steel-defender"
  ) {
    return (
      <ArtificerSteelDefenderActionFooter
        character={character}
        selectedSpellSlotLevel={selectedArtificerSteelDefenderSpellSlotLevel}
        isSubmitting={isSteelDefenderSubmitting}
        disabledReason={selectedFeatureActionPrimaryDisabledReason}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        confirmLabel={selectedFeaturePrimaryLabel}
        onSelectedSpellSlotLevelChange={setSelectedArtificerSteelDefenderSpellSlotLevel}
        onUseSteelDefender={submitArtificerSteelDefender}
      />
    );
  }
  return undefined;
}

function renderArtificerArcaneFirearmFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    isArcaneFirearmSubmitting,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedActionOptionKeys,
    selectedFeatureActionPrimaryDisabledReason,
    submitArtificerArcaneFirearm
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "artificer-arcane-firearm"
  ) {
    return (
      <ArtificerArcaneFirearmActionFooter
        selectedStackId={selectedActionOptionKeys[0] ?? null}
        isSubmitting={isArcaneFirearmSubmitting}
        disabledReason={selectedFeatureActionPrimaryDisabledReason}
        actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
        actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
        actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
        confirmLabel={selectedFeaturePrimaryLabel}
        onUseArcaneFirearm={submitArtificerArcaneFirearm}
      />
    );
  }
  return undefined;
}
export const artificerFormAdapters = {
  "tinkers-magic": { body: renderTinkersMagicBody },
  "replicate-magic-item": { body: renderReplicateMagicItemBody },
  "artificer-experimental-elixir": {
    body: renderArtificerExperimentalElixirBody,
    footer: renderArtificerExperimentalElixirFooter
  },
  "artificer-eldritch-cannon": {
    body: renderArtificerEldritchCannonBody,
    footer: renderArtificerEldritchCannonFooter
  },
  "artificer-arcane-firearm": {
    body: renderArtificerArcaneFirearmBody,
    footer: renderArtificerArcaneFirearmFooter
  },
  "artificer-charge-magic-item": {
    body: renderArtificerChargeMagicItemBody,
    footer: renderArtificerChargeMagicItemFooter
  },
  "artificer-drain-magic-item": {
    body: renderArtificerChargeMagicItemBody,
    footer: renderArtificerChargeMagicItemFooter
  },
  "artificer-transmute-magic-item": { body: renderArtificerChargeMagicItemBody },
  "artificer-steel-defender": { footer: renderArtificerSteelDefenderFooter }
} satisfies Partial<Record<ActionFormKind, ActionFormAdapter>>;
