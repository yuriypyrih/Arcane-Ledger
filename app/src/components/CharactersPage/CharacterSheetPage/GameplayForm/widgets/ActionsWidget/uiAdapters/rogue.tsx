import type { ActionFormKind } from "./types";
import {
  type ActionFormAdapter,
  type ActionFormBodyContext,
  type ActionFormFooterContext
} from "./types";
import SneakAttackActionBody, { type SneakAttackActionSelection } from "../SneakAttackModal";
import FeatureOptInToggle from "../../../../FeatureOptInToggle/FeatureOptInToggle";
import {
  getRogueSoulknifePsionicDiceRemaining,
  getRogueSoulknifeRendMindUsesRemaining,
  getRogueSoulknifeRendMindUsesTotal,
  hasRogueSoulknifeRendMindFeature,
  consumeRogueSoulknifeRendMindUse,
  getRogueSoulknifeRendMindSavingThrowDc
} from "../../../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/rogueSoulknife";
import { getActionShapeForEconomyType } from "../../../gameplayWidgetUtils";
import styles from "../ActionsWidget.module.css";
import ActionDiceConfirmFooter from "../ActionDiceConfirmFooter";
import { activateFeatureActionForCharacter } from "../../../../../../../pages/CharactersPage/classFeatures";
import {
  getRogueSneakAttackEffectDefinitions,
  getRogueSneakAttackFormula,
  getRogueSneakAttackFormulaDisplay
} from "../../../../../../../pages/CharactersPage/classFeatures/rogue/rogue";
import { type ActionsWidgetSubmissionContext } from "../types";

function renderSneakAttackBody(context: ActionFormBodyContext) {
  const { character, selectedAction, setSneakAttackActionSelection, sneakAttackActionSelection } =
    context;
  if (
    !selectedAction ||
    selectedAction.kind !== "feature" ||
    selectedAction.drawer.kind !== "custom-form"
  )
    return undefined;
  if (selectedAction.drawer.formKind === "sneak-attack") {
    return (
      <SneakAttackActionBody
        action={selectedAction.action}
        character={character}
        selection={sneakAttackActionSelection}
        onSelectionChange={setSneakAttackActionSelection}
      />
    );
  }
  return undefined;
}

function renderSneakAttackFooter(context: ActionFormFooterContext) {
  const { selectedFeaturePrimaryLabel } = context;
  const {
    character,
    isDiceRollerSettingsOpen,
    selectedAction,
    selectedActionEconomyShapeState,
    selectedFeatureActionPrimaryDisabledReason,
    setIsDiceRollerSettingsOpen,
    setSneakAttackActionSelection,
    sneakAttackActionSelection,
    submitSneakAttack
  } = context;
  if (!selectedAction) return undefined;
  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "custom-form" &&
    selectedAction.drawer.formKind === "sneak-attack"
  ) {
    const hasRendMind = hasRogueSoulknifeRendMindFeature(character);
    const rendMindUsesRemaining = getRogueSoulknifeRendMindUsesRemaining(character);
    const rendMindUsesTotal = getRogueSoulknifeRendMindUsesTotal(character);
    const rendMindCanUse =
      rendMindUsesRemaining > 0 || getRogueSoulknifePsionicDiceRemaining(character) > 0;

    return (
      <div className={styles.footerActionStack}>
        {hasRendMind ? (
          <FeatureOptInToggle
            label="Rend Mind"
            checked={sneakAttackActionSelection.useRendMind}
            disabled={!rendMindCanUse}
            muted={!rendMindCanUse}
            title={
              rendMindCanUse ? undefined : "Rend Mind needs a charge or 1 Psionic Die remaining."
            }
            onCheckedChange={(checked) =>
              setSneakAttackActionSelection({
                ...sneakAttackActionSelection,
                useRendMind: checked
              })
            }
            metaItems={[
              {
                kind: "tracker",
                current: rendMindUsesRemaining,
                total: rendMindUsesTotal
              },
              {
                kind: "cost",
                label: "Use 1 Psionic Die instead",
                icon: "psi"
              }
            ]}
            usageKey="rend-mind"
          />
        ) : null}
        <ActionDiceConfirmFooter
          actionName={selectedAction.action.name}
          confirmLabel={selectedFeaturePrimaryLabel}
          actionShape={getActionShapeForEconomyType(selectedAction.economyType)}
          actionShapeAvailable={selectedActionEconomyShapeState?.isAvailable ?? true}
          actionShapeMultiCount={selectedActionEconomyShapeState?.multiCount ?? 0}
          disabled={selectedFeatureActionPrimaryDisabledReason !== null}
          isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
          onConfirm={() => submitSneakAttack(sneakAttackActionSelection)}
          onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
        />
      </div>
    );
  }
  return undefined;
}
export const rogueFormAdapters = {
  "sneak-attack": { body: renderSneakAttackBody, footer: renderSneakAttackFooter }
} satisfies Partial<Record<ActionFormKind, ActionFormAdapter>>;
export function createRogueFormSubmissions(context: ActionsWidgetSubmissionContext) {
  const {
    character,
    onPersistCharacter,
    openDiceRoller,
    closeActionDrawer,
    selectedFeatureAction
  } = context;
  function submitSneakAttack({ effectKeys, useRendMind }: SneakAttackActionSelection) {
    if (!selectedFeatureAction) {
      return;
    }

    const sneakAttackFormula = getRogueSneakAttackFormula(character, effectKeys);

    if (!sneakAttackFormula) {
      return;
    }

    const sneakAttackFormulaDisplay =
      getRogueSneakAttackFormulaDisplay(character, effectKeys) ?? sneakAttackFormula;

    const selectedEffects = getRogueSneakAttackEffectDefinitions(character).filter((effect) =>
      effectKeys.includes(effect.key)
    );
    const hasRendMind = hasRogueSoulknifeRendMindFeature(character);
    const canUseRendMind =
      useRendMind &&
      hasRendMind &&
      (getRogueSoulknifeRendMindUsesRemaining(character) > 0 ||
        getRogueSoulknifePsionicDiceRemaining(character) > 0);
    const rendMindSaveDc = getRogueSoulknifeRendMindSavingThrowDc(character);
    const baseDescription = selectedFeatureAction.detail.endsWith(".")
      ? selectedFeatureAction.detail
      : `${selectedFeatureAction.detail}.`;
    const description = [
      baseDescription,
      selectedEffects.length > 0
        ? `Cunning Strike: ${selectedEffects.map((effect) => effect.name).join(", ")}.`
        : null,
      canUseRendMind && rendMindSaveDc !== null
        ? `Rend Mind: Wisdom save DC ${rendMindSaveDc} or Stunned for 1 minute.`
        : null
    ]
      .filter((entry): entry is string => Boolean(entry))
      .join(" ");

    onPersistCharacter((currentCharacter) => {
      const activatedCharacter = activateFeatureActionForCharacter(
        currentCharacter,
        selectedFeatureAction.key
      );

      if (activatedCharacter === currentCharacter) {
        return currentCharacter;
      }

      return canUseRendMind
        ? consumeRogueSoulknifeRendMindUse(activatedCharacter)
        : activatedCharacter;
    });

    openDiceRoller({
      title: "Sneak Attack",
      formula: sneakAttackFormula,
      formulaDisplay: sneakAttackFormulaDisplay,
      description
    });

    closeActionDrawer();
  }
  return { submitSneakAttack };
}
