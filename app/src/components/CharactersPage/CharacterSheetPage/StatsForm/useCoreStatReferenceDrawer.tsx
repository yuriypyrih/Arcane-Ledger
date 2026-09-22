import { getClassLevel, getClassSubclassId } from "../../../../pages/CharactersPage/multiclass";
import { useState } from "react";
import { useReadOnlySheet } from "../readOnlySheetContext";
import { getClassHitDicePools } from "../../../../pages/CharactersPage/hitDice";
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
import { getCharacterRuntime } from "../../../../pages/CharactersPage/characterRuntime/characterRuntime";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { getRollModeFromIndicators } from "../../../RollStatePill/rollState";
import {
  getPurpleDragonRookRallyingCryStateForCharacter,
  hasZhentarimRuffianForCharacter
} from "../../../../pages/CharactersPage/feats/runtime";
import HitDiceManagementModal from "./HitDiceManagementModal";
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
  const readOnly = useReadOnlySheet();
  const [selectedStatReference, setSelectedStatReference] = useState<SelectedStatReference | null>(
    null
  );
  const [isHitDiceManagementOpen, setIsHitDiceManagementOpen] = useState(false);
  const [useUncannyMetabolismOnInitiative, setUseUncannyMetabolismOnInitiative] = useState(false);
  const [usePersistentRageOnInitiative, setUsePersistentRageOnInitiative] = useState(false);
  const [
    usePurpleDragonRookRallyingCryOnInitiative,
    setUsePurpleDragonRookRallyingCryOnInitiative
  ] = useState(false);
  const [
    useZhentarimRuffianFamilyFirstOnInitiative,
    setUseZhentarimRuffianFamilyFirstOnInitiative
  ] = useState(false);
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
  const purpleDragonRookRallyingCryState =
    getPurpleDragonRookRallyingCryStateForCharacter(character);
  const hasPurpleDragonRookRallyingCry = purpleDragonRookRallyingCryState !== null;
  const hasZhentarimRuffianFamilyFirst = hasZhentarimRuffianForCharacter(character);
  const zhentarimRuffianFamilyFirstAvailable =
    hasZhentarimRuffianFamilyFirst && character.heroicInspiration;
  const hasTandemFootwork =
    getClassSubclassId(character, "Bard") === "bard-college-of-dance" &&
    getClassLevel(character, "Bard") >= 6;
  const bardicInspirationDie = getBardicInspirationDieForCharacter(character);
  const bardicInspirationUsesRemaining = getBardicInspirationUsesRemainingForCharacter(character);
  const tandemFootworkAvailable =
    hasTandemFootwork && bardicInspirationDie !== null && bardicInspirationUsesRemaining > 0;
  const initiativeBreakdown = coreStats.initiativeBreakdown;
  const monkMartialArtsDie = getMonkMartialArtsDieForCharacter(character);
  const hasThiefsReflexes = hasRogueThiefThiefsReflexesForCharacter(character);
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
    setUsePurpleDragonRookRallyingCryOnInitiative(false);
    setUseZhentarimRuffianFamilyFirstOnInitiative(false);
    setUseTandemFootworkOnInitiative(false);
    setUseUncannyMetabolismOnInitiative(false);
    setSelectedStatReference(null);
  }

  function openCoreStatReference(card: CoreStatCard) {
    if (card.key === "hitDice") {
      closeCoreStatReference();
      if (readOnly) {
        setSelectedStatReference({
          ...coreStats.getReferenceForCard(card),
          detailCards: getClassHitDicePools(character).map((pool) => ({
            label: `${pool.className} ${pool.die.toUpperCase()}`,
            value: `${pool.remaining}/${pool.total} remaining`
          }))
        });
      } else {
        setIsHitDiceManagementOpen(true);
      }
      return;
    }

    if (card.label === "Initiative" && hasPersistentRage) {
      setUsePersistentRageOnInitiative(false);
    }

    if (card.label === "Initiative" && hasPurpleDragonRookRallyingCry) {
      setUsePurpleDragonRookRallyingCryOnInitiative(false);
    }

    if (card.label === "Initiative" && hasZhentarimRuffianFamilyFirst) {
      setUseZhentarimRuffianFamilyFirstOnInitiative(false);
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

  function selectArmorClassFormula(formulaKey: string) {
    if (readOnly) return;
    onPersistCharacter((currentCharacter) =>
      setArmorClassFormulaSelectionForCharacter(currentCharacter, formulaKey)
    );
  }

  function rollInitiative() {
    if (readOnly) return;
    onPersistCharacter((currentCharacter) => {
      return applyInitiativeRollCharacterEffects(currentCharacter, {
        usePersistentRageOnInitiative,
        usePurpleDragonRookRallyingCryOnInitiative,
        useZhentarimRuffianFamilyFirstOnInitiative,
        useTandemFootworkOnInitiative,
        useUncannyMetabolismOnInitiative,
        zhentarimRuffianFamilyFirstAvailable,
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
        usePurpleDragonRookRallyingCryOnInitiative,
        useZhentarimRuffianFamilyFirstOnInitiative,
        useTandemFootworkOnInitiative,
        useUncannyMetabolismOnInitiative,
        zhentarimRuffianFamilyFirstAvailable,
        tandemFootworkAvailable,
        characterLevel: character.level,
        onPersistCharacter,
        rollMode: getRollModeFromIndicators(selectedStatReference?.rollIndicators)
      })
    );

    if (useUncannyMetabolismOnInitiative) {
      setUseUncannyMetabolismOnInitiative(false);
    }

    if (usePurpleDragonRookRallyingCryOnInitiative) {
      setUsePurpleDragonRookRallyingCryOnInitiative(false);
    }

    if (useZhentarimRuffianFamilyFirstOnInitiative) {
      setUseZhentarimRuffianFamilyFirstOnInitiative(false);
    }
  }

  const coreStatReferenceDrawer = (
    <>
      {!readOnly && isHitDiceManagementOpen ? (
        <HitDiceManagementModal
          character={character}
          onPersistCharacter={onPersistCharacter}
          onClose={() => setIsHitDiceManagementOpen(false)}
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
                hasPurpleDragonRookRallyingCry={hasPurpleDragonRookRallyingCry}
                purpleDragonRookRallyingCryUsesRemaining={
                  purpleDragonRookRallyingCryState?.usesRemaining ?? 0
                }
                purpleDragonRookRallyingCryUsesTotal={
                  purpleDragonRookRallyingCryState?.usesTotal ?? 0
                }
                usePurpleDragonRookRallyingCryOnInitiative={
                  usePurpleDragonRookRallyingCryOnInitiative
                }
                onUsePurpleDragonRookRallyingCryChange={
                  setUsePurpleDragonRookRallyingCryOnInitiative
                }
                hasZhentarimRuffianFamilyFirst={hasZhentarimRuffianFamilyFirst}
                zhentarimRuffianFamilyFirstAvailable={zhentarimRuffianFamilyFirstAvailable}
                useZhentarimRuffianFamilyFirstOnInitiative={
                  useZhentarimRuffianFamilyFirstOnInitiative
                }
                onUseZhentarimRuffianFamilyFirstChange={
                  setUseZhentarimRuffianFamilyFirstOnInitiative
                }
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
      {!readOnly && diceRollerPopup}
    </>
  );

  return {
    coreStatReferenceDrawer,
    openCoreStatReference
  };
}
