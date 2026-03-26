import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useDiceRollerPopup } from "../../../../DicePage/DiceRollerPopup";
import CharacterSpellDrawer from "../../SpellCastingForm/CharacterSpellDrawer";
import type { Character, AbilityKey } from "../../../../../types";
import { PROF_LEVEL } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { abilityKeys } from "../../../../../pages/CharactersPage/constants";
import {
  activateFeatureActionForCharacter,
  activateFeatureActionOptionForCharacter,
  consumeNonMagicActionForCharacter,
  consumeWeaponAttackActionForCharacter,
  getFeatureActionOptionsForCharacter,
  getSpellcastingStateForCharacter,
  markFeatureWeaponBonusUseForCharacter,
  type FeatureActionCard,
  type FeatureActionOptionCard
} from "../../../../../pages/CharactersPage/classFeatures";
import {
  divineInterventionActionKey,
  getClericDivineInterventionEnabledLevels,
  getClericDivineInterventionSpellEntries
} from "../../../../../pages/CharactersPage/classFeatures/cleric";
import {
  fighterIndomitableActionKey,
  fighterSecondWindActionKey,
  fighterTacticalMindActionKey,
  getFighterSecondWindHealingFormula
} from "../../../../../pages/CharactersPage/classFeatures/fighter";
import { getCombatActionsForCharacter } from "../../../../../pages/CharactersPage/combatActions";
import {
  consumeRoundTrackerResource,
  normalizeRoundTracker
} from "../../../../../pages/CharactersPage/combat";
import {
  getRoundTrackerResourceForEconomyType
} from "../../../../../pages/CharactersPage/actionEconomy";
import { getAbilityScoresForCharacter } from "../../../../../pages/CharactersPage/abilities";
import {
  getAbilityModifier,
  getProficiencyBonus,
  type WeaponAction
} from "../../../../../pages/CharactersPage/gameplay";
import { rollFormulaWithDice } from "../../../../../utils/dice";
import {
  createDefaultDeathSaves,
  normalizeDeathSaves
} from "../gameplayStateUtils";
import {
  getSpellOutcomeSummaryForCharacter
} from "../../../../../pages/CharactersPage/spellOutcome";
import { formatFeatureActionOptionValueLabel } from "../../../../../pages/CharactersPage/actionOutcome";
import {
  getSavingThrowLevelFromEntries,
  getSavingThrowProficiencyForAbilityKey
} from "../../../../../pages/CharactersPage/proficiency";
import { ACTION_TYPE, type SpellEntry } from "../../../../../codex/entries";
import { getSpellLevel } from "../../../../../pages/CharactersPage/spellcasting";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import widgetShellStyles from "../GameplayWidgetShared.module.css";
import {
  getRoundTrackerActionWarning,
  getWeaponActionRollDescription
} from "../gameplayWidgetUtils";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import styles from "./ActionsWidget.module.css";
import DivineInterventionModal from "./DivineInterventionModal";
import IndomitableModal from "./IndomitableModal";
import FeatureActionOptionsModal from "./FeatureActionOptionsModal";
import {
  FeatureActionCardButton,
  FeatureActionOptionButton,
  WeaponActionCard
} from "./ActionCards";

function getDivineInterventionLevelGroups(spells: SpellEntry[]): Record<number, SpellEntry[]> {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce<Record<number, SpellEntry[]>>((groups, level) => {
    groups[level] = spells
      .filter((spell) => getSpellLevel(spell) === level)
      .sort((left, right) => left.name.localeCompare(right.name));

    return groups;
  }, {});
}

function getProficiencyMultiplier(level: PROF_LEVEL): 0 | 1 | 2 {
  if (level === PROF_LEVEL.EXPERT) {
    return 2;
  }

  if (level === PROF_LEVEL.PROFICIENT) {
    return 1;
  }

  return 0;
}

function formatSignedLabel(value: number, label: string): string {
  return `${value >= 0 ? "+" : "-"} ${Math.abs(value)} ${label}`;
}

type ActionsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function ActionsWidget({ character, onPersistCharacter }: ActionsWidgetProps) {
  const [selectedFeatureActionKey, setSelectedFeatureActionKey] = useState<string | null>(null);
  const [selectedIndomitableAbility, setSelectedIndomitableAbility] = useState<AbilityKey | null>(
    null
  );
  const [selectedDivineInterventionSpell, setSelectedDivineInterventionSpell] =
    useState<SpellEntry | null>(null);
  const [activeDivineInterventionLevel, setActiveDivineInterventionLevel] = useState(0);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const combatActions = useMemo(() => getCombatActionsForCharacter(character), [character]);
  const spellcastingState = getSpellcastingStateForCharacter(character);
  const effectiveAbilities = useMemo(() => getAbilityScoresForCharacter(character), [character]);
  const selectedFeatureActionEntry =
    selectedFeatureActionKey !== null
      ? (combatActions.find(
          (combatAction) =>
            combatAction.kind === "feature" && combatAction.action.key === selectedFeatureActionKey
        ) ?? null)
      : null;
  const selectedFeatureAction =
    selectedFeatureActionEntry?.kind === "feature" ? selectedFeatureActionEntry.action : null;
  const selectedFeatureActionOptions =
    selectedFeatureActionKey && selectedFeatureAction
      ? getFeatureActionOptionsForCharacter(character, selectedFeatureActionKey)
      : [];
  const isIndomitableSelected = selectedFeatureAction?.key === fighterIndomitableActionKey;
  const isDivineInterventionSelected = selectedFeatureAction?.key === divineInterventionActionKey;
  const indomitableSavingThrowOptions = useMemo(
    () =>
      abilityKeys.map((ability) => {
        const abilityModifier = getAbilityModifier(effectiveAbilities[ability]);
        const savingThrowProficiency = getSavingThrowProficiencyForAbilityKey(ability);
        const savingThrowLevel = getSavingThrowLevelFromEntries(
          character.savingThrowProficiencies,
          savingThrowProficiency
        );
        const proficiencyContribution =
          getProficiencyBonus(character.level) * getProficiencyMultiplier(savingThrowLevel);
        const total = abilityModifier + proficiencyContribution;

        return {
          ability,
          total,
          formula: `1d10${total >= 0 ? "+" : ""}${total}+${Math.max(1, Math.floor(character.level))}`,
          formulaDisplay: `1d10 ${formatSignedLabel(total, `${ability} Save`)} + ${Math.max(
            1,
            Math.floor(character.level)
          )} Fighter Level`
        };
      }),
    [character.level, character.savingThrowProficiencies, effectiveAbilities]
  );
  const selectedIndomitableSavingThrow =
    selectedIndomitableAbility !== null
      ? (indomitableSavingThrowOptions.find(
          (entry) => entry.ability === selectedIndomitableAbility
        ) ?? null)
      : null;
  const divineInterventionEnabledLevels = useMemo(
    () => getClericDivineInterventionEnabledLevels(character),
    [character]
  );
  const divineInterventionSpellEntries = useMemo(
    () => getClericDivineInterventionSpellEntries(character),
    [character]
  );
  const divineInterventionSpellGroups = useMemo(
    () => getDivineInterventionLevelGroups(divineInterventionSpellEntries),
    [divineInterventionSpellEntries]
  );
  const firstAvailableDivineInterventionLevel = useMemo(
    () =>
      divineInterventionEnabledLevels.find(
        (level) => (divineInterventionSpellGroups[level]?.length ?? 0) > 0
      ) ??
      divineInterventionEnabledLevels[0] ??
      0,
    [divineInterventionEnabledLevels, divineInterventionSpellGroups]
  );
  const activeDivineInterventionSpells = useMemo(
    () => divineInterventionSpellGroups[activeDivineInterventionLevel] ?? [],
    [activeDivineInterventionLevel, divineInterventionSpellGroups]
  );
  const divineInterventionOutcomeSummariesById = useMemo(
    () =>
      new Map(
        divineInterventionSpellEntries.map((spell) => [
          spell.id,
          getSpellOutcomeSummaryForCharacter(character, spell)
        ])
      ),
    [character, divineInterventionSpellEntries]
  );
  const selectedDivineInterventionActionWarning = getRoundTrackerActionWarning(
    selectedFeatureAction
      ? getRoundTrackerResourceForEconomyType(selectedFeatureAction.economyType)
      : null,
    roundTracker
  );
  const selectedDivineInterventionBlockedReason =
    selectedDivineInterventionSpell?.castingTime.includes(ACTION_TYPE.REACTION)
      ? "Divine Intervention can't cast Reaction spells."
      : spellcastingState.blocked
        ? spellcastingState.reason
        : null;
  const hasOverlayOpen =
    selectedFeatureActionKey !== null || selectedDivineInterventionSpell !== null;

  useBodyScrollLock(hasOverlayOpen);

  useEffect(() => {
    if (!hasOverlayOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (selectedDivineInterventionSpell) {
          setSelectedDivineInterventionSpell(null);
          return;
        }

        setSelectedIndomitableAbility(null);
        setSelectedFeatureActionKey(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasOverlayOpen, selectedDivineInterventionSpell]);

  useEffect(() => {
    if (!selectedFeatureActionKey) {
      setSelectedDivineInterventionSpell(null);
      setSelectedIndomitableAbility(null);
      return;
    }

    if (
      selectedFeatureAction &&
      (selectedFeatureActionOptions.length > 0 ||
        isDivineInterventionSelected ||
        isIndomitableSelected)
    ) {
      return;
    }

    setSelectedDivineInterventionSpell(null);
    setSelectedIndomitableAbility(null);
    setSelectedFeatureActionKey(null);
  }, [
    isIndomitableSelected,
    isDivineInterventionSelected,
    selectedFeatureAction,
    selectedFeatureActionKey,
    selectedFeatureActionOptions.length
  ]);

  useEffect(() => {
    if (!isDivineInterventionSelected) {
      setSelectedDivineInterventionSpell(null);
      return;
    }

    setActiveDivineInterventionLevel(1);
  }, [isDivineInterventionSelected]);

  useEffect(() => {
    if (!isDivineInterventionSelected) {
      return;
    }

    setActiveDivineInterventionLevel((currentLevel) => {
      if (
        divineInterventionEnabledLevels.includes(currentLevel) &&
        (divineInterventionSpellGroups[currentLevel]?.length ?? 0) > 0
      ) {
        return currentLevel;
      }

      return firstAvailableDivineInterventionLevel;
    });
  }, [
    divineInterventionEnabledLevels,
    divineInterventionSpellGroups,
    firstAvailableDivineInterventionLevel,
    isDivineInterventionSelected
  ]);

  useEffect(() => {
    if (!isIndomitableSelected) {
      setSelectedIndomitableAbility(null);
    }
  }, [isIndomitableSelected]);

  function activateFeatureAction(
    actionKey: string,
    economyType: FeatureActionCard["economyType"],
    actionCategory?: FeatureActionCard["actionCategory"]
  ) {
    onPersistCharacter((currentCharacter) => {
      const nextCharacter = activateFeatureActionForCharacter(currentCharacter, actionKey);
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(economyType);

      if (nextCharacter === currentCharacter) {
        return currentCharacter;
      }

      if (economyType === "action" && actionCategory && actionCategory !== "magic") {
        return consumeNonMagicActionForCharacter(nextCharacter);
      }

      return roundTrackerResource
        ? {
            ...nextCharacter,
            roundTracker: consumeRoundTrackerResource(
              nextCharacter.roundTracker,
              roundTrackerResource
            )
          }
        : nextCharacter;
    });
  }

  function handleFeatureActionClick(action: FeatureActionCard) {
    if (action.interaction === "select") {
      setSelectedFeatureActionKey(action.key);
      return;
    }

    if (action.key === fighterSecondWindActionKey) {
      onPersistCharacter((currentCharacter) => {
        const nextCharacter = activateFeatureActionForCharacter(currentCharacter, action.key);
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);

        if (nextCharacter === currentCharacter) {
          return currentCharacter;
        }

        const healingFormula = getFighterSecondWindHealingFormula(currentCharacter);
        const healingResult = rollFormulaWithDice(healingFormula, "normal");
        openDiceRoller({
          title: "Second Wind",
          formula: healingFormula,
          formulaDisplay: healingFormula,
          description: action.detail
        });
        const nextCurrentHitPoints = Math.max(
          0,
          Math.min(nextCharacter.hitPoints, nextCharacter.currentHitPoints + healingResult.total)
        );
        const healedCharacter = {
          ...nextCharacter,
          currentHitPoints: nextCurrentHitPoints,
          deathSaves:
            nextCurrentHitPoints > 0
              ? createDefaultDeathSaves()
              : normalizeDeathSaves(nextCharacter.deathSaves)
        };
        return roundTrackerResource
          ? {
              ...healedCharacter,
              roundTracker: consumeRoundTrackerResource(
                healedCharacter.roundTracker,
                roundTrackerResource
              )
            }
          : healedCharacter;
      });
      return;
    }

    if (action.key === fighterTacticalMindActionKey) {
      onPersistCharacter((currentCharacter) =>
        activateFeatureActionForCharacter(currentCharacter, action.key)
      );
      openDiceRoller({
        title: "Tactical Mind",
        formula: "1d10",
        formulaDisplay: "1d10",
        description: "Expend one Second Wind use and add the result to an ability check."
      });
      return;
    }

    activateFeatureAction(action.key, action.economyType, action.actionCategory);
  }

  function handleWeaponActionClick(action: WeaponAction) {
    openDiceRoller({
      title: `${action.name} attack`,
      formula: action.rollFormula,
      formulaDisplay: action.rollFormulaDisplay,
      description: getWeaponActionRollDescription(action)
    });

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = action.damageBonusEntries.reduce(
        (updatedCharacter, entry) =>
          markFeatureWeaponBonusUseForCharacter(updatedCharacter, entry.label),
        currentCharacter
      );
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);

      return roundTrackerResource
        ? consumeWeaponAttackActionForCharacter(nextCharacter, action)
        : nextCharacter;
    });
  }

  function activateFeatureActionOptionSelection(
    actionKey: string,
    option: FeatureActionOptionCard
  ) {
    onPersistCharacter((currentCharacter) => {
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(option.economyType);
      const nextCharacter = activateFeatureActionOptionForCharacter(
        currentCharacter,
        actionKey,
        option.key
      );

      if (nextCharacter === currentCharacter) {
        return currentCharacter;
      }

      if (option.economyType === "action" && option.actionCategory !== "magic") {
        return consumeNonMagicActionForCharacter(nextCharacter);
      }

      return roundTrackerResource
        ? {
            ...nextCharacter,
            roundTracker: consumeRoundTrackerResource(
              nextCharacter.roundTracker,
              roundTrackerResource
            )
          }
        : nextCharacter;
    });

    if (option.rollFormula) {
      openDiceRoller({
        title: option.name,
        formula: option.rollFormula,
        formulaDisplay: option.rollFormulaDisplay,
        description: option.rollDescription ?? option.detail
      });
    }

    setSelectedFeatureActionKey(null);
  }

  function closeIndomitableModal() {
    setSelectedIndomitableAbility(null);
    setSelectedFeatureActionKey(null);
  }

  function rollIndomitableSavingThrow() {
    if (!selectedFeatureAction || !selectedIndomitableSavingThrow) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      activateFeatureActionForCharacter(currentCharacter, selectedFeatureAction.key)
    );

    openDiceRoller({
      title: `Indomitable (${selectedIndomitableSavingThrow.ability} Save)`,
      formula: selectedIndomitableSavingThrow.formula,
      formulaDisplay: selectedIndomitableSavingThrow.formulaDisplay,
      description: selectedFeatureAction.detail
    });

    closeIndomitableModal();
  }

  function closeDivineInterventionModal() {
    setSelectedDivineInterventionSpell(null);
    setSelectedFeatureActionKey(null);
  }

  function useDivineInterventionSpell() {
    if (!selectedDivineInterventionSpell || !selectedFeatureAction) {
      return;
    }

    if (selectedDivineInterventionBlockedReason) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = activateFeatureActionForCharacter(
        currentCharacter,
        selectedFeatureAction.key
      );
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );

      if (nextCharacter === currentCharacter) {
        return currentCharacter;
      }

      return roundTrackerResource
        ? {
            ...nextCharacter,
            roundTracker: consumeRoundTrackerResource(
              nextCharacter.roundTracker,
              roundTrackerResource
            )
          }
        : nextCharacter;
    });

    closeDivineInterventionModal();
  }

  return (
    <>
      <section className={clsx(widgetShellStyles.widgetCard, styles.root)}>
        <header className={widgetShellStyles.widgetHeader}>
          <p className={widgetShellStyles.widgetTitle}>Actions</p>
        </header>
        {combatActions.length === 0 ? (
          <p className={shared.emptyText}>No actions available. Equip a weapon to roll attacks.</p>
        ) : (
          <div className={styles.grid}>
            {combatActions.map((combatAction) =>
              combatAction.kind === "weapon" ? (
                <WeaponActionCard
                  key={combatAction.action.key}
                  action={combatAction.action}
                  roundTracker={roundTracker}
                  onClick={handleWeaponActionClick}
                />
              ) : (
                <FeatureActionCardButton
                  key={combatAction.action.key}
                  action={combatAction.action}
                  character={character}
                  roundTracker={roundTracker}
                  onClick={handleFeatureActionClick}
                />
              )
            )}
          </div>
        )}
      </section>

      {selectedFeatureAction && isDivineInterventionSelected ? (
        <DivineInterventionModal
          action={selectedFeatureAction}
          activeLevel={activeDivineInterventionLevel}
          enabledLevels={divineInterventionEnabledLevels}
          activeSpells={activeDivineInterventionSpells}
          outcomeSummariesById={divineInterventionOutcomeSummariesById}
          onLevelChange={setActiveDivineInterventionLevel}
          onSpellSelect={setSelectedDivineInterventionSpell}
          onClose={closeDivineInterventionModal}
        />
      ) : selectedFeatureAction && isIndomitableSelected ? (
        <IndomitableModal
          action={selectedFeatureAction}
          options={indomitableSavingThrowOptions}
          selectedAbility={selectedIndomitableAbility}
          selectedOption={selectedIndomitableSavingThrow}
          onSelectAbility={setSelectedIndomitableAbility}
          onRoll={rollIndomitableSavingThrow}
          onClose={closeIndomitableModal}
        />
      ) : selectedFeatureAction && selectedFeatureActionOptions.length > 0 ? (
        <FeatureActionOptionsModal
          action={selectedFeatureAction}
          onClose={() => setSelectedFeatureActionKey(null)}
        >
          {selectedFeatureActionOptions.map((option) => (
            <FeatureActionOptionButton
              key={option.key}
              option={option}
              character={character}
              roundTracker={roundTracker}
              onClick={() => activateFeatureActionOptionSelection(selectedFeatureAction.key, option)}
              formatValueLabel={formatFeatureActionOptionValueLabel}
            />
          ))}
        </FeatureActionOptionsModal>
      ) : null}

      {selectedDivineInterventionSpell && selectedFeatureAction && isDivineInterventionSelected ? (
        <CharacterSpellDrawer
          character={character}
          spell={selectedDivineInterventionSpell}
          mode="divine-intervention"
          spellSlotTotals={Array.from({ length: 9 }, () => 0)}
          spellSlotsRemaining={Array.from({ length: 9 }, () => 0)}
          selectedSpellSlotLevel={1}
          onSelectedSpellSlotLevelChange={() => {}}
          onClose={() => setSelectedDivineInterventionSpell(null)}
          onAction={useDivineInterventionSpell}
          actionLabel="Divine Intervention"
          actionWarning={selectedDivineInterventionActionWarning}
          actionDisabled={selectedDivineInterventionActionWarning !== null}
          blockedReason={selectedDivineInterventionBlockedReason}
          actionAvailabilityText={selectedFeatureAction.usesLabel ?? null}
          backdropClassName={styles.divineInterventionDrawerBackdrop}
        />
      ) : null}

      {diceRollerPopup}
    </>
  );
}

export default ActionsWidget;
