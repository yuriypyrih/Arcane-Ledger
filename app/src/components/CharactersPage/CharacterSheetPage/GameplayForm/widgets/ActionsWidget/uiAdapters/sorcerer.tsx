import type { ActionFormKind } from "./types";
import {
  type ActionFormAdapter,
  type ActionFormBodyContext,
  type ActionFormFooterContext
} from "./types";
import {
  SpellfireBurstActionBody,
  SpellfireBurstActionFooter,
  type SpellfireBurstEffect
} from "../SpellfireBurstAction";
import FontOfMagicActionBody from "../forms/FontOfMagicActionBody";
import ActionShape from "../../../../../../ActionShape";
import ActionButton from "../../../../../../ActionButton";
import styles from "../ActionsWidget.module.css";
import {
  activateFeatureActionForCharacter,
  createSpellSlotFromSorceryPointsForCharacter,
  convertSpellSlotToSorceryPointsForCharacter
} from "../../../../../../../pages/CharactersPage/classFeatures";
import {
  getSorcererSpellfireBurstBolsteringFlamesRollFormula,
  getSorcererSpellfireBurstRadiantFireRollFormula,
  sorcererSpellfireBurstActionKey
} from "../../../../../../../pages/CharactersPage/classFeatures/sorcerer/subclasses/sorcererSpellfireSorcery";
import {
  applyRolledTemporaryHitPointsToCharacter,
  consumeRoundTrackerResourceForCharacter,
  prepareCharacterForRoundTrackerResourceConsumption
} from "../../../gameplayStateUtils";
import { type ActionsWidgetSubmissionContext } from "../types";

function renderSpellfireBurstBody(context: ActionFormBodyContext) {
  const { selectedAction, selectedSpellfireBurstTarget, setSelectedSpellfireBurstTarget } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "spellfire-burst") {
    return (
      <SpellfireBurstActionBody
        selectedTarget={selectedSpellfireBurstTarget}
        onSelectTarget={setSelectedSpellfireBurstTarget}
      />
    );
  }
  return undefined;
}

function renderFontOfMagicBody(context: ActionFormBodyContext) {
  const {
    character,
    selectedAction,
    selectedFontOfMagicSelection,
    selectedFontOfMagicWarning,
    setSelectedFontOfMagicSelection
  } = context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "font-of-magic") {
    return (
      <FontOfMagicActionBody
        actionWarning={selectedFontOfMagicWarning}
        character={character}
        selectedSelection={selectedFontOfMagicSelection}
        onSelectSelection={setSelectedFontOfMagicSelection}
      />
    );
  }
  return undefined;
}

function renderSpellfireBurstFooter(context: ActionFormFooterContext) {
  const {
    isDiceRollerSettingsOpen,
    selectedAction,
    selectedFeatureActionPrimaryDisabledReason,
    setIsDiceRollerSettingsOpen,
    submitSorcererSpellfireBurst
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "spellfire-burst"
  ) {
    return (
      <SpellfireBurstActionFooter
        actionName={selectedAction.name}
        disabled={selectedFeatureActionPrimaryDisabledReason !== null}
        isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
        onUseEffect={submitSorcererSpellfireBurst}
        onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
      />
    );
  }
  return undefined;
}

function renderFontOfMagicFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    confirmFontOfMagicSelection,
    selectedAction,
    selectedFeatureActionPrimaryDisabledReason,
    selectedFontOfMagicSelection,
    selectedFontOfMagicWarning,
    confirmSelectedActionToast
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "font-of-magic"
  ) {
    return (
      <ActionButton
        className={styles.footerActionButton}
        onClick={confirmSelectedActionToast(confirmFontOfMagicSelection)}
        disabled={
          selectedFontOfMagicSelection === null ||
          selectedFeatureActionPrimaryDisabledReason !== null ||
          selectedFontOfMagicWarning !== null
        }
        trailingBadge={
          selectedFontOfMagicSelection?.kind === "points-to-slot" ? (
            <ActionShape
              shape="bonusAction"
              isSelected={selectedFontOfMagicWarning === null}
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
export const sorcererFormAdapters = {
  "spellfire-burst": { body: renderSpellfireBurstBody, footer: renderSpellfireBurstFooter },
  "font-of-magic": { body: renderFontOfMagicBody, footer: renderFontOfMagicFooter }
} satisfies Partial<Record<ActionFormKind, ActionFormAdapter>>;
export function createSorcererFormSubmissions(context: ActionsWidgetSubmissionContext) {
  const {
    character,
    onPersistCharacter,
    openDiceRoller,
    closeActionDrawer,
    selectedFeatureAction,
    selectedSpellfireBurstTarget,
    selectedFontOfMagicSelection
  } = context;
  function submitSorcererSpellfireBurst(effect: SpellfireBurstEffect) {
    if (!selectedFeatureAction || selectedFeatureAction.key !== sorcererSpellfireBurstActionKey) {
      return;
    }

    const formula =
      effect === "bolstering-flames"
        ? getSorcererSpellfireBurstBolsteringFlamesRollFormula(character)
        : getSorcererSpellfireBurstRadiantFireRollFormula(character);
    const title = effect === "bolstering-flames" ? "Bolstering Flames" : "Radiant Fire";

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = activateFeatureActionForCharacter(
        currentCharacter,
        selectedFeatureAction.key
      );

      return nextCharacter === currentCharacter ? currentCharacter : nextCharacter;
    });

    openDiceRoller({
      title,
      formula: formula.formula,
      formulaDisplay: formula.formulaDisplay,
      description: formula.fact.value,
      onResolvedResult:
        effect === "bolstering-flames" && selectedSpellfireBurstTarget === "self"
          ? ({ result }) => {
              onPersistCharacter((currentCharacter) =>
                applyRolledTemporaryHitPointsToCharacter(
                  currentCharacter,
                  result.total,
                  "Bolstering Flames"
                )
              );
            }
          : undefined
    });

    closeActionDrawer();
  }

  function confirmFontOfMagicSelection() {
    if (!selectedFontOfMagicSelection) {
      return;
    }

    if (selectedFontOfMagicSelection.kind === "slot-to-points") {
      convertSpellSlotToSorceryPoints(selectedFontOfMagicSelection.spellSlotLevel);
      return;
    }

    createSpellSlotFromSorceryPoints(selectedFontOfMagicSelection.spellSlotLevel);
  }

  function convertSpellSlotToSorceryPoints(spellSlotLevel: number) {
    onPersistCharacter((currentCharacter) =>
      convertSpellSlotToSorceryPointsForCharacter(currentCharacter, spellSlotLevel)
    );
    closeActionDrawer();
  }

  function createSpellSlotFromSorceryPoints(spellSlotLevel: number) {
    onPersistCharacter((currentCharacter) => {
      const preparedCharacter = prepareCharacterForRoundTrackerResourceConsumption(
        currentCharacter,
        "bonusAction"
      );
      const nextCharacter = createSpellSlotFromSorceryPointsForCharacter(
        preparedCharacter,
        spellSlotLevel
      );

      if (nextCharacter === preparedCharacter) {
        return currentCharacter;
      }

      return consumeRoundTrackerResourceForCharacter(nextCharacter, "bonusAction");
    });

    closeActionDrawer();
  }
  return {
    submitSorcererSpellfireBurst,
    confirmFontOfMagicSelection,
    convertSpellSlotToSorceryPoints,
    createSpellSlotFromSorceryPoints
  };
}
