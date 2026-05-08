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
import { getInitiativeBreakdownForCharacter } from "../../../../pages/CharactersPage/gameplay";
import {
  getArmorClassResolutionForCharacter,
  setArmorClassFormulaSelectionForCharacter
} from "../../../../pages/CharactersPage/armor";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getRollModeFromIndicators } from "../../../RollStatePill/rollState";
import ArmorClassFormulaFooter from "./ArmorClassFormulaFooter";
import InitiativeReferenceFooter from "./InitiativeReferenceFooter";
import StatReferenceDrawer, { type SelectedStatReference } from "./StatReferenceDrawer";
import { getArmorClassReferenceDetailCards } from "./armorClassReference";
import { applyInitiativeRollCharacterEffects, createInitiativeRollRequest } from "./initiativeRoll";
import { createCoreStatReference, type CoreStatCard } from "./coreStatModel";

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
  const [useUncannyMetabolismOnInitiative, setUseUncannyMetabolismOnInitiative] = useState(false);
  const [usePersistentRageOnInitiative, setUsePersistentRageOnInitiative] = useState(false);
  const [useTandemFootworkOnInitiative, setUseTandemFootworkOnInitiative] = useState(false);
  const [isDiceRollerSettingsOpen, setIsDiceRollerSettingsOpen] = useState(false);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  const armorClassResolution = getArmorClassResolutionForCharacter(character);
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
  const initiativeBreakdown = getInitiativeBreakdownForCharacter(character);
  const monkMartialArtsDie = getMonkMartialArtsDieForCharacter(character);
  const hasThiefsReflexes = hasRogueThiefThiefsReflexesForCharacter(character);
  const resolvedSelectedStatReference =
    selectedStatReference?.keyword === "Armor Class"
      ? {
          ...selectedStatReference,
          detailCards: getArmorClassReferenceDetailCards(armorClassResolution),
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
    setSelectedStatReference(createCoreStatReference(character, card));
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
