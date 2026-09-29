import { renderFormBody } from "./uiAdapters";
import { getClassLevel } from "../../../../../../pages/CharactersPage/multiclassState";
import clsx from "clsx";

import CellContainer from "../../../../../CellContainer/CellContainer";

import RollStatePill from "../../../../../RollStatePill/RollStatePill";

import { preserveLifeActionKey } from "../../../../../../pages/CharactersPage/classFeatures/cleric/cleric";

import { barbarianRageActionKey } from "../../../../../../pages/CharactersPage/classFeatures/barbarian/barbarian";
import {
  fighterSecondWindActionKey,
  getFighterSecondWindHealingFormula
} from "../../../../../../pages/CharactersPage/classFeatures/fighter/fighter";

import { metamagicActionKey } from "../../../../../../pages/CharactersPage/classFeatures/sorcerer/sorcerer";

import sheetStyles from "../../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";

import { formatResolvedRollStateDetailText } from "../../../../../RollStatePill/rollState";

import styles from "./ActionsWidget.module.css";

import { ClericPreserveLifeActionBody } from "./ClericPreserveLifeAction";

import ClericChannelDivinityAction from "./ClericChannelDivinityAction";

import { FighterSecondWindActionBody } from "./FighterSecondWindAction";

import { monkHandOfHealingActionKey } from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfMercy";

import {
  hasMonkWarriorOfTheElementsElementalEpitome,
  monkElementalAttunementActionKey
} from "../../../../../../pages/CharactersPage/classFeatures/monk/subclasses/monkWarriorOfTheElements";

import ElementalAttunementResistanceSelector from "../TraitsConditionsWidget/ElementalAttunementResistanceSelector";

import { MonkHandOfHealingActionBody } from "./MonkHandOfHealingAction";

import DivineInterventionActionBody from "./forms/DivineInterventionActionBody";

import FeatureOptionsActionBody from "./forms/FeatureOptionsActionBody";

import MetamagicOptionsActionBody from "./forms/MetamagicOptionsActionBody";

import MysticArcanumActionBody from "./forms/MysticArcanumActionBody";

import RageActionBody from "./forms/RageActionBody";

import type { ActionsWidgetDrawerBodyContext } from "./types";

export function renderActionDrawerBody(context: ActionsWidgetDrawerBodyContext) {
  const {
    character,
    isRageOfTheGodsSelected,
    openMysticArcanumSpell,
    openWeaponDetailReference,
    roundTracker,
    selectedAction,
    selectedActionOptionKeys,
    selectedChannelDivinityRows,
    selectedHandOfHealingTarget,
    selectedMonkElementalAttunementResistanceDamageType,
    selectedRageOfTheGodsDescription,
    selectedRageOfTheGodsUsesRemaining,
    selectedRageOfTheGodsUsesTotal,
    selectedRageOptionKey,
    selectedRageOptions,
    selectedRagePowerOptionKey,
    selectedRagePowerOptions,
    selectedSecondWindGroupRecoveryFormula,
    selectedSecondWindHealingFormula,
    selectedWeaponAttackFormula,
    selectedWeaponDamageFormula,
    selectedWeaponDetails,
    selectedWeaponLifedrinkerState,
    setIsRageOfTheGodsSelected,
    setSelectedChannelDivinityOptionKey,
    setSelectedDivineInterventionSpell,
    setSelectedHandOfHealingTarget,
    setSelectedRageOptionKey,
    setSelectedRagePowerOptionKey,
    toggleFeatureOptionSelection,
    updateMonkElementalAttunementResistanceDamageType
  } = context;
  if (!selectedAction) {
    return null;
  }

  if (selectedAction.kind === "weapon") {
    return (
      <div className={styles.weaponDrawerBody}>
        <div className={sheetStyles.spellDrawerDetails}>
          {selectedWeaponDetails.map((detail) => {
            const detailKey = `${selectedAction.key}-${detail.key}`;

            if (detail.referenceKeywords?.length) {
              return (
                <CellContainer
                  key={detailKey}
                  as="button"
                  type="button"
                  className={styles.weaponDetailButton}
                  label={detail.label}
                  content={detail.value}
                  onClick={() =>
                    openWeaponDetailReference(
                      detail.referenceTitle ?? String(detail.label),
                      detail.referenceKeywords
                    )
                  }
                />
              );
            }

            return <CellContainer key={detailKey} label={detail.label} content={detail.value} />;
          })}
        </div>

        <div className={clsx(sheetStyles.spellDrawerDetails, styles.weaponFormulaList)}>
          {selectedWeaponAttackFormula ? (
            <CellContainer
              label={selectedWeaponAttackFormula.label}
              content={selectedWeaponAttackFormula.value}
              breakdown={selectedWeaponAttackFormula.breakdown}
              contentClassName={styles.weaponFormulaValue}
              breakdownClassName={styles.weaponFormulaBreakdown}
            />
          ) : null}

          {selectedWeaponDamageFormula ? (
            <CellContainer
              label={selectedWeaponDamageFormula.label}
              content={selectedWeaponDamageFormula.value}
              breakdown={selectedWeaponDamageFormula.breakdown}
              contentClassName={styles.weaponFormulaValue}
              breakdownClassName={styles.weaponFormulaBreakdown}
            />
          ) : null}

          {selectedWeaponLifedrinkerState ? (
            <CellContainer
              label={selectedWeaponLifedrinkerState.healFormulaPresentation.label}
              content={selectedWeaponLifedrinkerState.healFormulaPresentation.value}
              breakdown={selectedWeaponLifedrinkerState.healFormulaPresentation.breakdown}
              contentClassName={styles.weaponFormulaValue}
              breakdownClassName={styles.weaponFormulaBreakdown}
            />
          ) : null}
        </div>
      </div>
    );
  }

  if (selectedAction.action.key === barbarianRageActionKey) {
    return (
      <RageActionBody
        action={selectedAction.action}
        rageOptions={selectedRageOptions}
        powerOptions={selectedRagePowerOptions}
        rageOfTheGodsDescription={selectedRageOfTheGodsDescription}
        selectedRageOptionKey={selectedRageOptionKey}
        selectedPowerOptionKey={selectedRagePowerOptionKey}
        onSelectRageOption={setSelectedRageOptionKey}
        onSelectPowerOption={setSelectedRagePowerOptionKey}
        rageOfTheGodsUsesRemaining={selectedRageOfTheGodsUsesRemaining}
        rageOfTheGodsUsesTotal={selectedRageOfTheGodsUsesTotal}
        isRageOfTheGodsSelected={isRageOfTheGodsSelected}
        onToggleRageOfTheGods={setIsRageOfTheGodsSelected}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.action.key === fighterSecondWindActionKey
  ) {
    return (
      <FighterSecondWindActionBody
        healingFormula={
          selectedSecondWindHealingFormula ?? getFighterSecondWindHealingFormula(character)
        }
        groupRecoveryFormula={selectedSecondWindGroupRecoveryFormula}
      />
    );
  }

  if (selectedAction.kind === "feature" && selectedAction.action.key === preserveLifeActionKey) {
    return <ClericPreserveLifeActionBody clericLevel={getClassLevel(character, "Cleric")} />;
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.action.key === monkHandOfHealingActionKey
  ) {
    return (
      <MonkHandOfHealingActionBody
        selectedTarget={selectedHandOfHealingTarget}
        onSelectedTargetChange={setSelectedHandOfHealingTarget}
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.action.key === monkElementalAttunementActionKey &&
    hasMonkWarriorOfTheElementsElementalEpitome(character)
  ) {
    return (
      <ElementalAttunementResistanceSelector
        selectedDamageType={selectedMonkElementalAttunementResistanceDamageType}
        onSelectDamageType={updateMonkElementalAttunementResistanceDamageType}
        name="monk-elemental-attunement-resistance"
      />
    );
  }

  if (
    selectedAction.kind === "feature" &&
    selectedAction.drawer.kind === "options" &&
    selectedChannelDivinityRows.length > 0
  ) {
    return (
      <ClericChannelDivinityAction
        rows={selectedChannelDivinityRows}
        character={character}
        roundTracker={roundTracker}
        onOpenDivinity={(row) => setSelectedChannelDivinityOptionKey(row.option.key)}
      />
    );
  }

  if (selectedAction.drawer.kind === "options") {
    if (selectedAction.action.key === metamagicActionKey) {
      return (
        <MetamagicOptionsActionBody
          options={selectedAction.drawer.options}
          selectedOptionKeys={selectedActionOptionKeys}
          selectionLimit={
            selectedAction.drawer.selectionLimit ?? selectedAction.drawer.options.length
          }
          onToggleOption={toggleFeatureOptionSelection}
        />
      );
    }

    return (
      <FeatureOptionsActionBody
        action={selectedAction}
        character={character}
        roundTracker={roundTracker}
        selectedOptionKeys={selectedActionOptionKeys}
        onToggleOption={toggleFeatureOptionSelection}
      />
    );
  }
  if (selectedAction.drawer.kind === "custom-form") {
    const result = renderFormBody(context);
    if (result !== undefined) return result;
  }

  if (selectedAction.drawer.kind === "spell-list") {
    if (
      selectedAction.execute.kind === "spell" &&
      selectedAction.execute.spellSource === "divine-intervention"
    ) {
      return (
        <DivineInterventionActionBody
          character={character}
          onSpellSelect={setSelectedDivineInterventionSpell}
        />
      );
    }

    return <MysticArcanumActionBody character={character} onSpellSelect={openMysticArcanumSpell} />;
  }

  return null;
}

export function renderActionHeaderAside(context: ActionsWidgetDrawerBodyContext) {
  const { selectedAction, selectedWeaponRollState } = context;
  if (!selectedAction || !selectedWeaponRollState) {
    return null;
  }

  return (
    <RollStatePill
      tone={selectedWeaponRollState.tone}
      label={selectedWeaponRollState.label}
      detailText={formatResolvedRollStateDetailText(selectedWeaponRollState)}
    />
  );
}
