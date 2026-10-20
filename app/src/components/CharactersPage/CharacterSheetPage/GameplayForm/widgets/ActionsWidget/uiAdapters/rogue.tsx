import type { ActionFormKind } from "./types";
import {
  type ActionFormAdapter,
  type ActionFormBodyContext,
  type ActionFormFooterContext
} from "./types";
import SneakAttackActionBody, { type SneakAttackActionSelection } from "../SneakAttackModal";
import FeatureOptInToggle from "../../../../FeatureOptInToggle/FeatureOptInToggle";
import {
  createChargesCardUsage,
  createChargesOrResourceCardUsage,
  createFeatureActionCardCost
} from "../../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import {
  getPhantomSoulTrinketsRemaining,
  hasPhantomTokens
} from "../../../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/roguePhantomTokens";
import {
  consumeRoguePhantomWailsUse,
  getRoguePhantomWailsFormula,
  getRoguePhantomWailsUsesRemaining,
  getRoguePhantomWailsUsesTotal
} from "../../../../../../../pages/CharactersPage/classFeatures/rogue/subclasses/roguePhantom";
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
    const wailsUsesTotal = getRoguePhantomWailsUsesTotal(character);
    const wailsUsesRemaining = getRoguePhantomWailsUsesRemaining(character);
    const hasSneakAttackDamage =
      getRogueSneakAttackFormula(character, sneakAttackActionSelection.effectKeys) !== "0";
    const soulTrinkets = getPhantomSoulTrinketsRemaining(character);
    const canUseWails = (wailsUsesRemaining > 0 || soulTrinkets > 0) && hasSneakAttackDamage;

    return (
      <div className={styles.footerActionStack}>
        {wailsUsesTotal > 0 ? (
          <FeatureOptInToggle
            label="Wails from the Grave"
            checked={sneakAttackActionSelection.useWailsFromTheGrave && canUseWails}
            disabled={!canUseWails}
            muted={!canUseWails}
            title={
              !hasSneakAttackDamage
                ? "Wails from the Grave requires Sneak Attack damage."
                : !canUseWails
                  ? "No Wails from the Grave charges or Soul Trinkets remaining."
                  : undefined
            }
            onCheckedChange={(checked) =>
              setSneakAttackActionSelection({
                ...sneakAttackActionSelection,
                useWailsFromTheGrave: checked
              })
            }
            usage={
              hasPhantomTokens(character)
                ? createChargesOrResourceCardUsage(
                    wailsUsesRemaining,
                    wailsUsesTotal,
                    createFeatureActionCardCost({ amountText: "1", icon: "ghost" })
                  )
                : createChargesCardUsage(wailsUsesRemaining, wailsUsesTotal)
            }
            usageKey="wails-from-the-grave"
          />
        ) : null}
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
  function submitSneakAttack({
    effectKeys,
    useRendMind,
    useWailsFromTheGrave
  }: SneakAttackActionSelection) {
    if (!selectedFeatureAction || character.classFeatureState?.rogue?.sneakAttackUsedThisTurn) {
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
    const wailsFormula =
      useWailsFromTheGrave &&
      sneakAttackFormula !== "0" &&
      (getRoguePhantomWailsUsesRemaining(character) > 0 ||
        getPhantomSoulTrinketsRemaining(character) > 0)
        ? getRoguePhantomWailsFormula(character)
        : null;
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
        : null,
      wailsFormula
        ? "Wails from the Grave: Necrotic damage to a second creature within 30 feet of the first."
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

      const nextCharacter = canUseRendMind
        ? consumeRogueSoulknifeRendMindUse(activatedCharacter)
        : activatedCharacter;
      return wailsFormula ? consumeRoguePhantomWailsUse(nextCharacter) : nextCharacter;
    });

    openDiceRoller({
      title: "Sneak Attack",
      formula: sneakAttackFormula,
      formulaDisplay: sneakAttackFormulaDisplay,
      entries: wailsFormula
        ? [
            {
              label: "Sneak Attack",
              formula: sneakAttackFormula,
              formulaDisplay: sneakAttackFormulaDisplay
            },
            { label: "Wails from the Grave (Necrotic)", formula: wailsFormula }
          ]
        : undefined,
      description
    });

    closeActionDrawer();
  }
  return { submitSneakAttack };
}
