import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useDiceRollerPopup } from "../../../../DicePage/DiceRollerPopup";
import CharacterSpellDrawer from "../../SpellCastingForm/CharacterSpellDrawer";
import type { Character, AbilityKey } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import { abilityKeys } from "../../../../../pages/CharactersPage/constants";
import {
  activateFeatureActionForCharacter,
  activateFeatureActionOptionForCharacter,
  activateArcaneRecoveryForCharacter,
  applyLayOnHandsForCharacter,
  consumeContactPatronUseForCharacter,
  consumeMysticArcanumUseForCharacter,
  createSpellSlotFromSorceryPointsForCharacter,
  consumeFaithfulSteedUseForCharacter,
  consumePaladinsSmiteUseForCharacter,
  consumeRangerFavoredEnemyUseForCharacter,
  consumeRangerTirelessUseForCharacter,
  convertSpellSlotToSorceryPointsForCharacter,
  consumeNonMagicActionForCharacter,
  consumeWeaponAttackActionForCharacter,
  getFeatureActionOptionsForCharacter,
  getSorcererMetamagicActionCostForCharacter,
  getSorcererMetamagicSelectionLimitForActionForCharacter,
  getSorceryPointsRemainingForCharacter,
  getLayOnHandsCurableConditionsForCharacter,
  getPaladinHealingPoolRemainingForCharacter,
  getSpellEntryForCharacter,
  getSpellcastingStateForCharacter,
  getWarlockMysticArcanumSelectionsForCharacter,
  hasActivePaladinAuraOfProtectionForCharacter,
  hasSorcererArcaneApotheosisFreeMetamagicAvailableForCharacter,
  markFeatureWeaponBonusUseForCharacter,
  spendSorcererMetamagicOptionsForCharacter,
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
import {
  faithfulSteedActionKey,
  type LayOnHandsCondition,
  paladinsSmiteActionKey,
  paladinLayOnHandsActionKey
} from "../../../../../pages/CharactersPage/classFeatures/paladin";
import {
  favoredEnemyActionKey,
  getRangerTirelessTemporaryHitPointsFormula,
  tirelessActionKey
} from "../../../../../pages/CharactersPage/classFeatures/ranger";
import {
  fontOfMagicActionKey,
  metamagicActionKey
} from "../../../../../pages/CharactersPage/classFeatures/sorcerer";
import {
  contactPatronActionKey,
  mysticArcanumActionKey,
  type MysticArcanumLevel
} from "../../../../../pages/CharactersPage/classFeatures/warlock";
import {
  arcaneRecoveryActionKey,
  type ArcaneRecoverySelection
} from "../../../../../pages/CharactersPage/classFeatures/wizard";
import {
  getRogueSneakAttackEffectDefinitions,
  getRogueSneakAttackFormula,
  rogueSneakAttackActionKey,
  type RogueSneakAttackEffectKey
} from "../../../../../pages/CharactersPage/classFeatures/rogue";
import { getCombatActionsForCharacter } from "../../../../../pages/CharactersPage/combatActions";
import {
  consumeRoundTrackerResource,
  normalizeRoundTracker
} from "../../../../../pages/CharactersPage/combat";
import { getRoundTrackerResourceForEconomyType } from "../../../../../pages/CharactersPage/actionEconomy";
import { getAbilityScoresForCharacter } from "../../../../../pages/CharactersPage/abilities";
import {
  getAbilityModifier,
  getProficiencyBonus,
  type WeaponAction
} from "../../../../../pages/CharactersPage/gameplay";
import {
  applySpellConcentrationToStatusEntries,
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "../../../../../pages/CharactersPage/traits";
import { rollFormulaWithDice } from "../../../../../utils/dice";
import {
  createDefaultDeathSaves,
  normalizeDeathSaves,
  normalizeTemporaryHitPoints
} from "../gameplayStateUtils";
import { getSpellOutcomeSummaryForCharacter } from "../../../../../pages/CharactersPage/spellOutcome";
import { formatFeatureActionOptionValueLabel } from "../../../../../pages/CharactersPage/actionOutcome";
import {
  getSavingThrowLevelFromEntries,
  getSavingThrowProficiencyForAbilityKey
} from "../../../../../pages/CharactersPage/proficiency";
import { ACTION_TYPE, getSpellEntryById, type SpellEntry } from "../../../../../codex/entries";
import {
  formatSignedLabel,
  getProficiencyMultiplier,
  getRoundTrackerResourceForSpell
} from "../../../../../pages/CharactersPage/shared";
import { getSpellLevel } from "../../../../../pages/CharactersPage/spellcasting";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import widgetShellStyles from "../GameplayWidgetShared.module.css";
import {
  getRoundTrackerActionWarning,
  getWeaponActionRollDescription
} from "../gameplayWidgetUtils";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import styles from "./ActionsWidget.module.css";
import DivineInterventionModal from "./DivineInterventionModal";
import ArcaneRecoveryModal from "./ArcaneRecoveryModal";
import FontOfMagicModal from "./FontOfMagicModal";
import IndomitableModal from "./IndomitableModal";
import FeatureActionOptionsModal from "./FeatureActionOptionsModal";
import LayOnHandsModal from "./LayOnHandsModal";
import MysticArcanumModal from "./MysticArcanumModal";
import SneakAttackModal from "./SneakAttackModal";
import {
  FeatureActionCardButton,
  FeatureActionOptionButton,
  WeaponActionCard
} from "./ActionCards";

function createContactPatronSpellEntry(spell: SpellEntry): SpellEntry {
  return {
    ...spell,
    description: [
      "<strong>Contact Patron.</strong> You mentally contact your patron directly. This casting doesn't expend a spell slot, and you automatically succeed on the DC 15 Intelligence saving throw.",
      ...spell.description.slice(1)
    ]
  };
}

function getDivineInterventionLevelGroups(spells: SpellEntry[]): Record<number, SpellEntry[]> {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reduce<Record<number, SpellEntry[]>>((groups, level) => {
    groups[level] = spells
      .filter((spell) => getSpellLevel(spell) === level)
      .sort((left, right) => left.name.localeCompare(right.name));

    return groups;
  }, {});
}

type ActionsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function ActionsWidget({ character, onPersistCharacter }: ActionsWidgetProps) {
  const [selectedFeatureActionKey, setSelectedFeatureActionKey] = useState<string | null>(null);
  const [selectedMetamagicOptionKeys, setSelectedMetamagicOptionKeys] = useState<string[]>([]);
  const [selectedIndomitableAbility, setSelectedIndomitableAbility] = useState<AbilityKey | null>(
    null
  );
  const [selectedPaladinsSmiteSpellSlotLevel, setSelectedPaladinsSmiteSpellSlotLevel] = useState(1);
  const [selectedMysticArcanumSpell, setSelectedMysticArcanumSpell] = useState<SpellEntry | null>(
    null
  );
  const [selectedMysticArcanumSpellLevel, setSelectedMysticArcanumSpellLevel] =
    useState<MysticArcanumLevel | null>(null);
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
  const isArcaneRecoverySelected = selectedFeatureAction?.key === arcaneRecoveryActionKey;
  const isLayOnHandsSelected = selectedFeatureAction?.key === paladinLayOnHandsActionKey;
  const isPaladinsSmiteSelected = selectedFeatureAction?.key === paladinsSmiteActionKey;
  const isFaithfulSteedSelected = selectedFeatureAction?.key === faithfulSteedActionKey;
  const isFavoredEnemySelected = selectedFeatureAction?.key === favoredEnemyActionKey;
  const isContactPatronSelected = selectedFeatureAction?.key === contactPatronActionKey;
  const isMysticArcanumSelected = selectedFeatureAction?.key === mysticArcanumActionKey;
  const isFontOfMagicSelected = selectedFeatureAction?.key === fontOfMagicActionKey;
  const isMetamagicSelected = selectedFeatureAction?.key === metamagicActionKey;
  const isSneakAttackSelected = selectedFeatureAction?.key === rogueSneakAttackActionKey;
  const remainingSorceryPoints = useMemo(
    () => getSorceryPointsRemainingForCharacter(character),
    [character]
  );
  const metamagicSelectionLimit = useMemo(
    () =>
      isMetamagicSelected
        ? getSorcererMetamagicSelectionLimitForActionForCharacter(character)
        : 1,
    [character, isMetamagicSelected]
  );
  const metamagicFreeOptionAvailable = useMemo(
    () =>
      isMetamagicSelected
        ? hasSorcererArcaneApotheosisFreeMetamagicAvailableForCharacter(character)
        : false,
    [character, isMetamagicSelected]
  );
  const selectedMetamagicCost = useMemo(
    () =>
      isMetamagicSelected
        ? getSorcererMetamagicActionCostForCharacter(character, selectedMetamagicOptionKeys)
        : 0,
    [character, isMetamagicSelected, selectedMetamagicOptionKeys]
  );
  const paladinsSmiteSpellEntry = useMemo(() => getSpellEntryById("spell-divine-smite"), []);
  const faithfulSteedSpellEntry = useMemo(() => getSpellEntryById("spell-find-steed"), []);
  const favoredEnemySpellEntry = useMemo(() => {
    const spell = getSpellEntryById("spell-hunters-mark");
    return spell ? getSpellEntryForCharacter(character, spell) : null;
  }, [character]);
  const contactPatronSpellEntry = useMemo(() => {
    const spell = getSpellEntryById("spell-contact-other-plane");
    return spell ? createContactPatronSpellEntry(spell) : null;
  }, []);
  const mysticArcanumSelections = useMemo(
    () => getWarlockMysticArcanumSelectionsForCharacter(character),
    [character]
  );
  const mysticArcanumSpells = useMemo(
    () =>
      mysticArcanumSelections.flatMap((selection) =>
        selection.spell
          ? [
              {
                spellLevel: selection.spellLevel,
                spell: selection.spell,
                expended: selection.expended
              }
            ]
          : []
      ),
    [mysticArcanumSelections]
  );
  const selectedMysticArcanumExpended =
    selectedMysticArcanumSpellLevel !== null
      ? (mysticArcanumSelections.find(
          (selection) => selection.spellLevel === selectedMysticArcanumSpellLevel
        )?.expended ?? false)
      : false;
  const paladinAuraOfProtectionBonus = hasActivePaladinAuraOfProtectionForCharacter(character)
    ? Math.max(1, getAbilityModifier(effectiveAbilities.CHA))
    : 0;
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
        const total = abilityModifier + proficiencyContribution + paladinAuraOfProtectionBonus;

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
    [
      character.level,
      character.savingThrowProficiencies,
      effectiveAbilities,
      paladinAuraOfProtectionBonus
    ]
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
  const selectedFeatureActionWarning = getRoundTrackerActionWarning(
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
  const selectedMysticArcanumBlockedReason = spellcastingState.blocked
    ? spellcastingState.reason
    : null;
  const selectedMysticArcanumActionWarning = getRoundTrackerActionWarning(
    selectedMysticArcanumSpell ? getRoundTrackerResourceForSpell(selectedMysticArcanumSpell) : null,
    roundTracker
  );
  const selectedLayOnHandsRemainingPool = useMemo(
    () => getPaladinHealingPoolRemainingForCharacter(character),
    [character]
  );
  const layOnHandsCurableConditions = useMemo(
    () => getLayOnHandsCurableConditionsForCharacter(character),
    [character]
  );
  const hasOverlayOpen =
    selectedFeatureActionKey !== null ||
    selectedDivineInterventionSpell !== null ||
    selectedMysticArcanumSpell !== null;

  useBodyScrollLock(hasOverlayOpen);

  useEffect(() => {
    if (!hasOverlayOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (selectedMysticArcanumSpell) {
          setSelectedMysticArcanumSpell(null);
          setSelectedMysticArcanumSpellLevel(null);
          return;
        }

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
  }, [hasOverlayOpen, selectedDivineInterventionSpell, selectedMysticArcanumSpell]);

  useEffect(() => {
    if (!selectedFeatureActionKey) {
      setSelectedDivineInterventionSpell(null);
      setSelectedMysticArcanumSpell(null);
      setSelectedMysticArcanumSpellLevel(null);
      setSelectedIndomitableAbility(null);
      setSelectedMetamagicOptionKeys([]);
      setSelectedPaladinsSmiteSpellSlotLevel(1);
      return;
    }

    if (
      selectedFeatureAction &&
      (selectedFeatureActionOptions.length > 0 ||
        isDivineInterventionSelected ||
        isIndomitableSelected ||
        isLayOnHandsSelected ||
        isFontOfMagicSelected ||
        isMysticArcanumSelected ||
        isSneakAttackSelected ||
        (isPaladinsSmiteSelected && paladinsSmiteSpellEntry) ||
        (isFavoredEnemySelected && favoredEnemySpellEntry) ||
        (isFaithfulSteedSelected && faithfulSteedSpellEntry) ||
        (isContactPatronSelected && contactPatronSpellEntry))
    ) {
      return;
    }

    setSelectedDivineInterventionSpell(null);
    setSelectedMysticArcanumSpell(null);
    setSelectedMysticArcanumSpellLevel(null);
    setSelectedIndomitableAbility(null);
    setSelectedMetamagicOptionKeys([]);
    setSelectedPaladinsSmiteSpellSlotLevel(1);
    setSelectedFeatureActionKey(null);
  }, [
    faithfulSteedSpellEntry,
    favoredEnemySpellEntry,
    isLayOnHandsSelected,
    isFontOfMagicSelected,
    isMysticArcanumSelected,
    isFaithfulSteedSelected,
    isFavoredEnemySelected,
    isContactPatronSelected,
    isSneakAttackSelected,
    isPaladinsSmiteSelected,
    isIndomitableSelected,
    isDivineInterventionSelected,
    isMetamagicSelected,
    contactPatronSpellEntry,
    paladinsSmiteSpellEntry,
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

  useEffect(() => {
    if (!isMetamagicSelected) {
      setSelectedMetamagicOptionKeys([]);
    }
  }, [isMetamagicSelected]);

  useEffect(() => {
    if (isPaladinsSmiteSelected) {
      setSelectedPaladinsSmiteSpellSlotLevel(1);
    }
  }, [isPaladinsSmiteSelected]);

  function activateFeatureAction(
    actionKey: string,
    economyType: FeatureActionCard["economyType"],
    actionCategory?: FeatureActionCard["actionCategory"],
    consumesEconomyOnActivate = false
  ) {
    onPersistCharacter((currentCharacter) => {
      const nextCharacter = activateFeatureActionForCharacter(currentCharacter, actionKey);
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(economyType);
      const characterToUpdate =
        nextCharacter === currentCharacter && consumesEconomyOnActivate
          ? currentCharacter
          : nextCharacter;

      if (characterToUpdate === currentCharacter && !consumesEconomyOnActivate) {
        return currentCharacter;
      }

      if (economyType === "action" && actionCategory && actionCategory !== "magic") {
        return consumeNonMagicActionForCharacter(characterToUpdate);
      }

      return roundTrackerResource
        ? {
            ...characterToUpdate,
            roundTracker: consumeRoundTrackerResource(
              characterToUpdate.roundTracker,
              roundTrackerResource
            )
          }
        : characterToUpdate;
    });
  }

  function handleFeatureActionClick(action: FeatureActionCard) {
    if (action.interaction === "select") {
      setSelectedFeatureActionKey(action.key);
      return;
    }

    if (action.key === rogueSneakAttackActionKey) {
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
        const nextEffectiveHitPoints = getEffectiveHitPointMaximumForCharacter(nextCharacter);
        const nextCurrentHitPoints = Math.max(
          0,
          Math.min(nextEffectiveHitPoints, nextCharacter.currentHitPoints + healingResult.total)
        );
        const healedCharacter = reconcileCharacterStatusConsequences({
          ...nextCharacter,
          currentHitPoints: nextCurrentHitPoints,
          deathSaves:
            nextCurrentHitPoints > 0
              ? createDefaultDeathSaves()
              : normalizeDeathSaves(nextCharacter.deathSaves)
        });
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

    if (action.key === tirelessActionKey) {
      onPersistCharacter((currentCharacter) => {
        const nextCharacter = consumeRangerTirelessUseForCharacter(currentCharacter);
        const roundTrackerResource = getRoundTrackerResourceForEconomyType(action.economyType);

        if (nextCharacter === currentCharacter) {
          return currentCharacter;
        }

        const temporaryHitPointsFormula =
          getRangerTirelessTemporaryHitPointsFormula(currentCharacter);
        const temporaryHitPointsResult = rollFormulaWithDice(temporaryHitPointsFormula, "normal");
        const grantedTemporaryHitPoints = Math.max(1, temporaryHitPointsResult.total);
        const nextTemporaryHitPoints = Math.max(
          normalizeTemporaryHitPoints(nextCharacter.temporaryHitPoints),
          grantedTemporaryHitPoints
        );

        openDiceRoller({
          title: "Tireless",
          formula: temporaryHitPointsFormula,
          formulaDisplay: temporaryHitPointsFormula,
          description: `${action.detail} Minimum 1 Temporary Hit Points.`
        });

        const updatedCharacter = {
          ...nextCharacter,
          temporaryHitPoints: nextTemporaryHitPoints
        };

        return roundTrackerResource
          ? {
              ...updatedCharacter,
              roundTracker: consumeRoundTrackerResource(
                updatedCharacter.roundTracker,
                roundTrackerResource
              )
            }
          : updatedCharacter;
      });
      return;
    }

    activateFeatureAction(
      action.key,
      action.economyType,
      action.actionCategory,
      action.consumesEconomyOnActivate
    );
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

  function closeSneakAttackModal() {
    setSelectedFeatureActionKey(null);
  }

  function closeLayOnHandsModal() {
    setSelectedFeatureActionKey(null);
  }

  function closePaladinsSmiteDrawer() {
    setSelectedPaladinsSmiteSpellSlotLevel(1);
    setSelectedFeatureActionKey(null);
  }

  function closeFaithfulSteedDrawer() {
    setSelectedFeatureActionKey(null);
  }

  function closeFavoredEnemyDrawer() {
    setSelectedFeatureActionKey(null);
  }

  function closeContactPatronDrawer() {
    setSelectedFeatureActionKey(null);
  }

  function closeFontOfMagicModal() {
    setSelectedFeatureActionKey(null);
  }

  function closeArcaneRecoveryModal() {
    setSelectedFeatureActionKey(null);
  }

  function closeMysticArcanumModal() {
    setSelectedMysticArcanumSpell(null);
    setSelectedMysticArcanumSpellLevel(null);
    setSelectedFeatureActionKey(null);
  }

  function closeMetamagicModal() {
    setSelectedMetamagicOptionKeys([]);
    setSelectedFeatureActionKey(null);
  }

  function toggleMetamagicOptionSelection(optionKey: string) {
    setSelectedMetamagicOptionKeys((currentOptionKeys) => {
      if (currentOptionKeys.includes(optionKey)) {
        return currentOptionKeys.filter((entry) => entry !== optionKey);
      }

      if (currentOptionKeys.length >= metamagicSelectionLimit) {
        return currentOptionKeys;
      }

      return [...currentOptionKeys, optionKey];
    });
  }

  function confirmMetamagicInfusion() {
    if (!isMetamagicSelected || selectedMetamagicOptionKeys.length <= 0) {
      return;
    }

    if (selectedMetamagicCost > remainingSorceryPoints) {
      return;
    }

    onPersistCharacter((currentCharacter) =>
      spendSorcererMetamagicOptionsForCharacter(currentCharacter, selectedMetamagicOptionKeys)
    );

    closeMetamagicModal();
  }

  function submitLayOnHands(options: {
    target: "self" | "other";
    poolSpendAmount: number;
    conditions: LayOnHandsCondition[];
  }) {
    if (!selectedFeatureAction) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = applyLayOnHandsForCharacter(currentCharacter, options);
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

    closeLayOnHandsModal();
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

  function useSneakAttack(effectKeys: RogueSneakAttackEffectKey[]) {
    if (!selectedFeatureAction) {
      return;
    }

    const sneakAttackFormula = getRogueSneakAttackFormula(character, effectKeys);

    if (!sneakAttackFormula) {
      return;
    }

    const selectedEffects = getRogueSneakAttackEffectDefinitions(character).filter((effect) =>
      effectKeys.includes(effect.key)
    );
    const baseDescription = selectedFeatureAction.detail.endsWith(".")
      ? selectedFeatureAction.detail
      : `${selectedFeatureAction.detail}.`;
    const description =
      selectedEffects.length > 0
        ? `${baseDescription} Cunning Strike: ${selectedEffects.map((effect) => effect.name).join(", ")}.`
        : baseDescription;

    onPersistCharacter((currentCharacter) =>
      activateFeatureActionForCharacter(currentCharacter, selectedFeatureAction.key)
    );

    openDiceRoller({
      title: "Sneak Attack",
      formula: sneakAttackFormula,
      formulaDisplay: sneakAttackFormula,
      description
    });

    closeSneakAttackModal();
  }

  function submitArcaneRecovery(selection: ArcaneRecoverySelection) {
    onPersistCharacter((currentCharacter) =>
      activateArcaneRecoveryForCharacter(currentCharacter, selection)
    );
    closeArcaneRecoveryModal();
  }

  function usePaladinsSmite() {
    if (!selectedFeatureAction) {
      return;
    }

    if (spellcastingState.blocked || selectedFeatureActionWarning) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = consumePaladinsSmiteUseForCharacter(currentCharacter);
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const divineSmiteSpell = paladinsSmiteSpellEntry;

      if (nextCharacter === currentCharacter) {
        return currentCharacter;
      }

      const nextCharacterWithConcentration = divineSmiteSpell
        ? {
            ...nextCharacter,
            statusEntries: applySpellConcentrationToStatusEntries(
              nextCharacter.statusEntries,
              divineSmiteSpell
            )
          }
        : nextCharacter;

      return roundTrackerResource
        ? {
            ...nextCharacterWithConcentration,
            roundTracker: consumeRoundTrackerResource(
              nextCharacterWithConcentration.roundTracker,
              roundTrackerResource
            )
          }
        : nextCharacterWithConcentration;
    });

    closePaladinsSmiteDrawer();
  }

  function useFaithfulSteed() {
    if (!selectedFeatureAction) {
      return;
    }

    if (spellcastingState.blocked || selectedFeatureActionWarning) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = consumeFaithfulSteedUseForCharacter(currentCharacter);
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const findSteedSpell = faithfulSteedSpellEntry;

      if (nextCharacter === currentCharacter) {
        return currentCharacter;
      }

      const nextCharacterWithConcentration = findSteedSpell
        ? {
            ...nextCharacter,
            statusEntries: applySpellConcentrationToStatusEntries(
              nextCharacter.statusEntries,
              findSteedSpell
            )
          }
        : nextCharacter;

      return roundTrackerResource
        ? {
            ...nextCharacterWithConcentration,
            roundTracker: consumeRoundTrackerResource(
              nextCharacterWithConcentration.roundTracker,
              roundTrackerResource
            )
          }
        : nextCharacterWithConcentration;
    });

    closeFaithfulSteedDrawer();
  }

  function useFavoredEnemy() {
    if (!selectedFeatureAction) {
      return;
    }

    if (spellcastingState.blocked || selectedFeatureActionWarning) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = consumeRangerFavoredEnemyUseForCharacter(currentCharacter);
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const baseHuntersMarkSpell = getSpellEntryById("spell-hunters-mark");
      const huntersMarkSpell = baseHuntersMarkSpell
        ? getSpellEntryForCharacter(currentCharacter, baseHuntersMarkSpell)
        : null;

      if (nextCharacter === currentCharacter) {
        return currentCharacter;
      }

      const nextCharacterWithConcentration = huntersMarkSpell
        ? {
            ...nextCharacter,
            statusEntries: applySpellConcentrationToStatusEntries(
              nextCharacter.statusEntries,
              huntersMarkSpell
            )
          }
        : nextCharacter;

      return roundTrackerResource
        ? {
            ...nextCharacterWithConcentration,
            roundTracker: consumeRoundTrackerResource(
              nextCharacterWithConcentration.roundTracker,
              roundTrackerResource
            )
          }
        : nextCharacterWithConcentration;
    });

    closeFavoredEnemyDrawer();
  }

  function useContactPatron() {
    if (!selectedFeatureAction) {
      return;
    }

    if (spellcastingState.blocked || selectedFeatureActionWarning) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = consumeContactPatronUseForCharacter(currentCharacter);
      const roundTrackerResource = getRoundTrackerResourceForEconomyType(
        selectedFeatureAction.economyType
      );
      const contactSpell = contactPatronSpellEntry;

      if (nextCharacter === currentCharacter) {
        return currentCharacter;
      }

      const nextCharacterWithConcentration = contactSpell
        ? {
            ...nextCharacter,
            statusEntries: applySpellConcentrationToStatusEntries(
              nextCharacter.statusEntries,
              contactSpell
            )
          }
        : nextCharacter;

      return roundTrackerResource
        ? {
            ...nextCharacterWithConcentration,
            roundTracker: consumeRoundTrackerResource(
              nextCharacterWithConcentration.roundTracker,
              roundTrackerResource
            )
          }
        : nextCharacterWithConcentration;
    });

    closeContactPatronDrawer();
  }

  function openMysticArcanumSpell(spellLevel: number, spell: SpellEntry) {
    if (
      spellLevel !== 6 &&
      spellLevel !== 7 &&
      spellLevel !== 8 &&
      spellLevel !== 9
    ) {
      return;
    }

    setSelectedMysticArcanumSpell(spell);
    setSelectedMysticArcanumSpellLevel(spellLevel);
  }

  function useMysticArcanumSpell() {
    if (!selectedMysticArcanumSpell || !selectedFeatureAction || selectedMysticArcanumSpellLevel === null) {
      return;
    }

    if (
      selectedMysticArcanumBlockedReason ||
      selectedMysticArcanumExpended ||
      selectedMysticArcanumActionWarning
    ) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = consumeMysticArcanumUseForCharacter(
        currentCharacter,
        selectedMysticArcanumSpellLevel
      );
      const roundTrackerResource = getRoundTrackerResourceForSpell(selectedMysticArcanumSpell);

      if (nextCharacter === currentCharacter) {
        return currentCharacter;
      }

      const nextCharacterWithConcentration = {
        ...nextCharacter,
        statusEntries: applySpellConcentrationToStatusEntries(
          nextCharacter.statusEntries,
          selectedMysticArcanumSpell
        )
      };

      return roundTrackerResource
        ? {
            ...nextCharacterWithConcentration,
            roundTracker: consumeRoundTrackerResource(
              nextCharacterWithConcentration.roundTracker,
              roundTrackerResource
            )
          }
        : nextCharacterWithConcentration;
    });

    closeMysticArcanumModal();
  }

  function convertSpellSlotToSorceryPoints(spellSlotLevel: number) {
    onPersistCharacter((currentCharacter) =>
      convertSpellSlotToSorceryPointsForCharacter(currentCharacter, spellSlotLevel)
    );

    closeFontOfMagicModal();
  }

  function createSpellSlotFromSorceryPoints(spellSlotLevel: number) {
    if (!selectedFeatureAction || selectedFeatureActionWarning) {
      return;
    }

    onPersistCharacter((currentCharacter) => {
      const nextCharacter = createSpellSlotFromSorceryPointsForCharacter(
        currentCharacter,
        spellSlotLevel
      );

      if (nextCharacter === currentCharacter) {
        return currentCharacter;
      }

      return {
        ...nextCharacter,
        roundTracker: consumeRoundTrackerResource(nextCharacter.roundTracker, "bonusAction")
      };
    });

    closeFontOfMagicModal();
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

      const nextCharacterWithConcentration = {
        ...nextCharacter,
        statusEntries: applySpellConcentrationToStatusEntries(
          nextCharacter.statusEntries,
          selectedDivineInterventionSpell
        )
      };

      return roundTrackerResource
        ? {
            ...nextCharacterWithConcentration,
            roundTracker: consumeRoundTrackerResource(
              nextCharacterWithConcentration.roundTracker,
              roundTrackerResource
            )
          }
        : nextCharacterWithConcentration;
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
      ) : selectedFeatureAction && isArcaneRecoverySelected ? (
        <ArcaneRecoveryModal
          action={selectedFeatureAction}
          character={character}
          onRecover={submitArcaneRecovery}
          onClose={closeArcaneRecoveryModal}
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
      ) : selectedFeatureAction && isSneakAttackSelected ? (
        <SneakAttackModal
          action={selectedFeatureAction}
          character={character}
          onClose={closeSneakAttackModal}
          onConfirm={useSneakAttack}
        />
      ) : selectedFeatureAction && isLayOnHandsSelected ? (
        <LayOnHandsModal
          action={selectedFeatureAction}
          conditionOptions={layOnHandsCurableConditions}
          remainingPool={selectedLayOnHandsRemainingPool}
          onSubmit={submitLayOnHands}
          onClose={closeLayOnHandsModal}
        />
      ) : selectedFeatureAction && isPaladinsSmiteSelected && paladinsSmiteSpellEntry ? (
        <CharacterSpellDrawer
          character={character}
          spell={paladinsSmiteSpellEntry}
          alwaysPrepared
          mode="standard"
          spellSlotTotals={Array.from({ length: 9 }, () => 0)}
          spellSlotsRemaining={Array.from({ length: 9 }, () => 0)}
          selectedSpellSlotLevel={selectedPaladinsSmiteSpellSlotLevel}
          onSelectedSpellSlotLevelChange={setSelectedPaladinsSmiteSpellSlotLevel}
          onClose={closePaladinsSmiteDrawer}
          onAction={usePaladinsSmite}
          actionConsumesSpellSlot={false}
          actionContextText="Using Paladin's Smite"
          actionAvailabilityText="Cast without expending a spell slot."
          actionWarning={selectedFeatureActionWarning}
          actionDisabled={selectedFeatureActionWarning !== null}
          blockedReason={spellcastingState.blocked ? spellcastingState.reason : null}
        />
      ) : selectedFeatureAction && isFaithfulSteedSelected && faithfulSteedSpellEntry ? (
        <CharacterSpellDrawer
          character={character}
          spell={faithfulSteedSpellEntry}
          alwaysPrepared
          mode="standard"
          spellSlotTotals={Array.from({ length: 9 }, () => 0)}
          spellSlotsRemaining={Array.from({ length: 9 }, () => 0)}
          selectedSpellSlotLevel={2}
          onSelectedSpellSlotLevelChange={() => {}}
          onClose={closeFaithfulSteedDrawer}
          onAction={useFaithfulSteed}
          actionConsumesSpellSlot={false}
          actionContextText="Using Faithful Steed"
          actionAvailabilityText="Cast without expending a spell slot."
          actionWarning={selectedFeatureActionWarning}
          actionDisabled={selectedFeatureActionWarning !== null}
          blockedReason={spellcastingState.blocked ? spellcastingState.reason : null}
        />
      ) : selectedFeatureAction && isFavoredEnemySelected && favoredEnemySpellEntry ? (
        <CharacterSpellDrawer
          character={character}
          spell={favoredEnemySpellEntry}
          alwaysPrepared
          mode="standard"
          spellSlotTotals={Array.from({ length: 9 }, () => 0)}
          spellSlotsRemaining={Array.from({ length: 9 }, () => 0)}
          selectedSpellSlotLevel={1}
          onSelectedSpellSlotLevelChange={() => {}}
          onClose={closeFavoredEnemyDrawer}
          onAction={useFavoredEnemy}
          actionConsumesSpellSlot={false}
          actionContextText="Using Favored Enemy"
          actionAvailabilityText="Cast without expending a spell slot."
          actionWarning={selectedFeatureActionWarning}
          actionDisabled={selectedFeatureActionWarning !== null}
          blockedReason={spellcastingState.blocked ? spellcastingState.reason : null}
        />
      ) : selectedFeatureAction && isContactPatronSelected && contactPatronSpellEntry ? (
        <CharacterSpellDrawer
          character={character}
          spell={contactPatronSpellEntry}
          alwaysPrepared
          mode="standard"
          spellSlotTotals={Array.from({ length: 9 }, () => 0)}
          spellSlotsRemaining={Array.from({ length: 9 }, () => 0)}
          selectedSpellSlotLevel={5}
          onSelectedSpellSlotLevelChange={() => {}}
          onClose={closeContactPatronDrawer}
          onAction={useContactPatron}
          actionConsumesSpellSlot={false}
          actionContextText="Using Contact Patron"
          actionAvailabilityText="Cast without expending a spell slot."
          actionWarning={selectedFeatureActionWarning}
          actionDisabled={selectedFeatureActionWarning !== null}
          blockedReason={spellcastingState.blocked ? spellcastingState.reason : null}
        />
      ) : selectedFeatureAction && isMysticArcanumSelected ? (
        <MysticArcanumModal
          action={selectedFeatureAction}
          spells={mysticArcanumSpells}
          onSpellSelect={openMysticArcanumSpell}
          onClose={closeMysticArcanumModal}
        />
      ) : selectedFeatureAction && isFontOfMagicSelected ? (
        <FontOfMagicModal
          action={selectedFeatureAction}
          character={character}
          actionWarning={selectedFeatureActionWarning}
          onClose={closeFontOfMagicModal}
          onConvertSpellSlot={convertSpellSlotToSorceryPoints}
          onCreateSpellSlot={createSpellSlotFromSorceryPoints}
        />
      ) : selectedFeatureAction && selectedFeatureActionOptions.length > 0 ? (
        <FeatureActionOptionsModal
          action={selectedFeatureAction}
          eyebrow={isMetamagicSelected ? "Sorcerer" : undefined}
          helperText={
            isMetamagicSelected
              ? metamagicSelectionLimit > 1
                ? `Available Sorcery Points: ${remainingSorceryPoints}. Innate Sorcery active: you can select up to 2 Metamagic options${metamagicFreeOptionAvailable ? ". Arcane Apotheosis makes your highest-cost selection free this turn." : "."}`
                : `Available Sorcery Points: ${remainingSorceryPoints}. Choose 1 Metamagic option to infuse your next spell.`
              : undefined
          }
          helperTextTone={
            isMetamagicSelected && metamagicSelectionLimit > 1 ? "accent" : "default"
          }
          onClose={isMetamagicSelected ? closeMetamagicModal : () => setSelectedFeatureActionKey(null)}
          footer={
            isMetamagicSelected ? (
              <button
                type="button"
                className={sheetStyles.castButton}
                disabled={
                  selectedMetamagicOptionKeys.length <= 0 ||
                  selectedMetamagicCost > remainingSorceryPoints
                }
                onClick={confirmMetamagicInfusion}
              >
                Infuse Next Spell
              </button>
            ) : null
          }
        >
          {selectedFeatureActionOptions.map((option) => (
            <FeatureActionOptionButton
              key={option.key}
              option={
                isMetamagicSelected
                  ? {
                      ...option,
                      disabled:
                        !selectedMetamagicOptionKeys.includes(option.key) &&
                        (option.disabled === true ||
                          selectedMetamagicOptionKeys.length >= metamagicSelectionLimit)
                    }
                  : option
              }
              character={character}
              roundTracker={roundTracker}
              selected={
                isMetamagicSelected && selectedMetamagicOptionKeys.includes(option.key)
              }
              onClick={() =>
                isMetamagicSelected
                  ? toggleMetamagicOptionSelection(option.key)
                  : activateFeatureActionOptionSelection(selectedFeatureAction.key, option)
              }
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
          actionWarning={selectedFeatureActionWarning}
          actionDisabled={selectedFeatureActionWarning !== null}
          blockedReason={selectedDivineInterventionBlockedReason}
          actionAvailabilityText={selectedFeatureAction.usesLabel ?? null}
          backdropClassName={styles.divineInterventionDrawerBackdrop}
        />
      ) : null}

      {selectedMysticArcanumSpell && selectedFeatureAction && isMysticArcanumSelected ? (
        <CharacterSpellDrawer
          character={character}
          spell={selectedMysticArcanumSpell}
          alwaysPrepared
          mode="standard"
          spellSlotTotals={Array.from({ length: 9 }, () => 0)}
          spellSlotsRemaining={Array.from({ length: 9 }, () => 0)}
          selectedSpellSlotLevel={selectedMysticArcanumSpellLevel ?? selectedMysticArcanumSpell.spellLevel}
          onSelectedSpellSlotLevelChange={() => {}}
          onClose={() => {
            setSelectedMysticArcanumSpell(null);
            setSelectedMysticArcanumSpellLevel(null);
          }}
          onAction={useMysticArcanumSpell}
          actionConsumesSpellSlot={false}
          actionContextText="Using Mystic Arcanum"
          actionAvailabilityText="Cast without expending a spell slot. Mystic Arcanum spells can't be upcast."
          actionWarning={
            selectedMysticArcanumExpended
              ? "This arcanum recharges on a Long Rest."
              : selectedMysticArcanumActionWarning
          }
          actionDisabled={
            selectedMysticArcanumExpended || selectedMysticArcanumActionWarning !== null
          }
          blockedReason={selectedMysticArcanumBlockedReason}
          backdropClassName={styles.divineInterventionDrawerBackdrop}
        />
      ) : null}

      {diceRollerPopup}
    </>
  );
}

export default ActionsWidget;
