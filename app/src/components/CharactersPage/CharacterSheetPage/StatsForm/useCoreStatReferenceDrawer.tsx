import { useState } from "react";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import type { Character } from "../../../../types";
import {
  getBarbarianPersistentRageUsesRemainingForCharacter,
  getBarbarianPersistentRageUsesTotalForCharacter,
  getBardicInspirationDieForCharacter,
  getBardicInspirationUsesRemainingForCharacter,
  getMonkMartialArtsDieForCharacter,
  getMonkUncannyMetabolismUsesRemainingForCharacter,
  getMonkUncannyMetabolismUsesTotalForCharacter,
  hasRogueThiefThiefsReflexesForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import { setArmorClassFormulaSelectionForCharacter } from "../../../../pages/CharactersPage/armor";
import {
  getHitDiceRemainingForCharacter,
  getHitDiceTotalForCharacter
} from "../../../../pages/CharactersPage/hitDice";
import { getCharacterRuntime } from "../../../../pages/CharactersPage/characterRuntime/characterRuntime";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getRollModeFromIndicators } from "../../../RollStatePill/rollState";
import ResourceManagementModal from "../ResourceManagementModal";
import ArmorClassFormulaFooter from "./ArmorClassFormulaFooter";
import InitiativeReferenceFooter from "./InitiativeReferenceFooter";
import StatReferenceDrawer, { type SelectedStatReference } from "./StatReferenceDrawer";
import { applyInitiativeRollCharacterEffects, createInitiativeRollRequest } from "./initiativeRoll";
import type { CoreStatCard } from "./coreStatModel";

type CoreStatReferenceDrawerResult = {
  coreStatReferenceDrawer: JSX.Element | null;
  openCoreStatReference: (card: CoreStatCard) => void;
};

export function useCoreStatReferenceDrawer(
  character: Character,
  onPersistCharacter: PersistCharacterUpdater
): CoreStatReferenceDrawerResult {
  const [selectedStatReference, setSelectedStatReference] = useState<SelectedStatReference | null>(
    null
  );
  const [isHitDiceManagementOpen, setIsHitDiceManagementOpen] = useState(false);
  const [useUncannyMetabolismOnInitiative, setUseUncannyMetabolismOnInitiative] = useState(false);
  const [usePersistentRageOnInitiative, setUsePersistentRageOnInitiative] = useState(false);
  const [useTandemFootworkOnInitiative, setUseTandemFootworkOnInitiative] = useState(false);
  const [isDiceRollerSettingsOpen, setIsDiceRollerSettingsOpen] = useState(false);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  const combatSummary = getCharacterRuntime(character).combatSummary;
  const { coreStats } = combatSummary;
  const armorClassResolution = coreStats.armorClassResolution;
  const persistentRageUsesTotal = getBarbarianPersistentRageUsesTotalForCharacter(character);
  const persistentRageUsesRemaining =
    getBarbarianPersistentRageUsesRemainingForCharacter(character);
  const hasPersistentRage = persistentRageUsesTotal > 0;
  const uncannyMetabolismUsesTotal = getMonkUncannyMetabolismUsesTotalForCharacter(character);
  const uncannyMetabolismUsesRemaining =
    getMonkUncannyMetabolismUsesRemainingForCharacter(character);
  const hasUncannyMetabolism = uncannyMetabolismUsesTotal > 0;
  const hasTandemFootwork =
    character.className === "Bard" &&
    character.subclassId === "bard-college-of-dance" &&
    character.level >= 6;
  const bardicInspirationDie = getBardicInspirationDieForCharacter(character);
  const bardicInspirationUsesRemaining = getBardicInspirationUsesRemainingForCharacter(character);
  const tandemFootworkAvailable =
    hasTandemFootwork && bardicInspirationDie !== null && bardicInspirationUsesRemaining > 0;
  const initiativeBreakdown = coreStats.initiativeBreakdown;
  const monkMartialArtsDie = getMonkMartialArtsDieForCharacter(character);
  const hasThiefsReflexes = hasRogueThiefThiefsReflexesForCharacter(character);
  const hitDiceRemaining = coreStats.hitDiceSummary.remaining;
  const hitDiceTotal = coreStats.hitDiceSummary.total;
  const hitDieLabel = coreStats.hitDiceSummary.label;
  const resolvedSelectedStatReference =
    selectedStatReference?.keyword === "Armor Class"
      ? {
          ...selectedStatReference,
          detailCards: coreStats.armorClassDetailCards,
          warning: armorClassResolution.warning
        }
      : selectedStatReference;

  function closeCoreStatReference() {
    setIsDiceRollerSettingsOpen(false);
    setUsePersistentRageOnInitiative(false);
    setUseTandemFootworkOnInitiative(false);
    setUseUncannyMetabolismOnInitiative(false);
    setSelectedStatReference(null);
  }

  function openCoreStatReference(card: CoreStatCard) {
    if (card.key === "hitDice") {
      closeCoreStatReference();
      setIsHitDiceManagementOpen(true);
      return;
    }

    if (card.label === "Initiative" && hasPersistentRage) {
      setUsePersistentRageOnInitiative(false);
    }

    if (card.label === "Initiative" && hasUncannyMetabolism) {
      setUseUncannyMetabolismOnInitiative(false);
    }

    if (card.label === "Initiative" && hasTandemFootwork) {
      setUseTandemFootworkOnInitiative(false);
    }

    setIsDiceRollerSettingsOpen(false);
    setSelectedStatReference(coreStats.getReferenceForCard(card));
  }

  function updateHitDiceRemaining(getNextRemaining: (remaining: number, total: number) => number) {
    onPersistCharacter((currentCharacter) => {
      const total = getHitDiceTotalForCharacter(currentCharacter);
      const remaining = getHitDiceRemainingForCharacter(currentCharacter);
      const nextRemaining = Math.max(
        0,
        Math.min(total, Math.floor(getNextRemaining(remaining, total)))
      );

      return {
        ...currentCharacter,
        hitDiceRemaining: nextRemaining
      };
    });
  }

  function useHitDie() {
    updateHitDiceRemaining((remaining) => remaining - 1);
  }

  function resetHitDie() {
    updateHitDiceRemaining((remaining) => remaining + 1);
  }

  function resetAllHitDice() {
    updateHitDiceRemaining((_remaining, total) => total);
  }

  function selectArmorClassFormula(formulaKey: string) {
    onPersistCharacter((currentCharacter) =>
      setArmorClassFormulaSelectionForCharacter(currentCharacter, formulaKey)
    );
  }

  function rollInitiative() {
    onPersistCharacter((currentCharacter) => {
      return applyInitiativeRollCharacterEffects(currentCharacter, {
        usePersistentRageOnInitiative,
        useTandemFootworkOnInitiative,
        useUncannyMetabolismOnInitiative,
        tandemFootworkAvailable
      });
    });

    openDiceRoller(
      createInitiativeRollRequest({
        initiativeBreakdown,
        bardicInspirationDie,
        monkMartialArtsDie,
        hasThiefsReflexes,
        usePersistentRageOnInitiative,
        useTandemFootworkOnInitiative,
        useUncannyMetabolismOnInitiative,
        tandemFootworkAvailable,
        characterLevel: character.level,
        onPersistCharacter,
        rollMode: getRollModeFromIndicators(selectedStatReference?.rollIndicators)
      })
    );

    if (useUncannyMetabolismOnInitiative) {
      setUseUncannyMetabolismOnInitiative(false);
    }
  }

  const coreStatReferenceDrawer = (
    <>
      {isHitDiceManagementOpen ? (
        <ResourceManagementModal
          titleId="hit-dice-resource-management-title"
          title={`Hit Dice ${hitDiceRemaining}/${hitDiceTotal}`}
          closeLabel="Close hit dice resource management"
          onClose={() => setIsHitDiceManagementOpen(false)}
          description="Manually spend or restore Hit Dice outside of a rest."
          titleAccessory={hitDieLabel}
          actions={[
            {
              label: "Use 1",
              onClick: useHitDie,
              disabled: hitDiceRemaining <= 0,
              ariaLabel: "Use 1 Hit Die"
            },
            {
              label: "Reset 1",
              onClick: resetHitDie,
              disabled: hitDiceRemaining >= hitDiceTotal,
              ariaLabel: "Reset 1 Hit Die"
            },
            {
              label: "Reset All",
              onClick: resetAllHitDice,
              disabled: hitDiceRemaining >= hitDiceTotal,
              ariaLabel: "Reset all Hit Dice"
            }
          ]}
        />
      ) : null}
      {resolvedSelectedStatReference ? (
        <StatReferenceDrawer
          reference={resolvedSelectedStatReference}
          footer={
            resolvedSelectedStatReference.keyword === "Armor Class" &&
            armorClassResolution.formulas.length >= 2 ? (
              <ArmorClassFormulaFooter
                formulas={armorClassResolution.formulas}
                selectedFormulaKey={armorClassResolution.selectedFormula.key}
                onFormulaChange={selectArmorClassFormula}
              />
            ) : resolvedSelectedStatReference.keyword === "Initiative" ? (
              <InitiativeReferenceFooter
                hasUncannyMetabolism={hasUncannyMetabolism}
                uncannyMetabolismUsesRemaining={uncannyMetabolismUsesRemaining}
                uncannyMetabolismUsesTotal={uncannyMetabolismUsesTotal}
                useUncannyMetabolismOnInitiative={useUncannyMetabolismOnInitiative}
                onUseUncannyMetabolismChange={setUseUncannyMetabolismOnInitiative}
                hasPersistentRage={hasPersistentRage}
                persistentRageUsesRemaining={persistentRageUsesRemaining}
                persistentRageUsesTotal={persistentRageUsesTotal}
                usePersistentRageOnInitiative={usePersistentRageOnInitiative}
                onUsePersistentRageChange={setUsePersistentRageOnInitiative}
                hasTandemFootwork={hasTandemFootwork}
                tandemFootworkAvailable={tandemFootworkAvailable}
                useTandemFootworkOnInitiative={useTandemFootworkOnInitiative}
                onUseTandemFootworkChange={setUseTandemFootworkOnInitiative}
                isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
                onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
                onRollInitiative={rollInitiative}
              />
            ) : null
          }
          onClose={closeCoreStatReference}
        />
      ) : null}
      {diceRollerPopup}
    </>
  );

  return {
    coreStatReferenceDrawer,
    openCoreStatReference
  };
}
