import clsx from "clsx";
import { CircleHelp, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { useRenderProfiler } from "../../../../lib/useRenderProfiler";
import { createFeatureSourcedDescriptionEntries } from "../../../../pages/CharactersPage/actionModalDescriptions";
import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import type { AbilityKey, Character } from "../../../../types";
import {
  getAbilityScoreBreakdownForCharacter,
  type AbilityModifierBonusEntry
} from "../../../../pages/CharactersPage/abilities";
import { getKeywordDescription } from "../../../../pages/CharactersPage/keywordDescriptions";
import {
  formatCustomTraitBonusFormulaTerm,
  formatCustomTraitBonusRollFormulaTerm
} from "../../../../pages/CharactersPage/customTraitEffects";
import { getCharacterRuntime } from "../../../../pages/CharactersPage/characterRuntime/characterRuntime";
import { abilityDisplayLabels } from "../../../../pages/CharactersPage/characterRuntime/combatSummaryAbilities";
import {
  abilityKeys,
  CUSTOM_ABILITY_SCORE_MAX,
  getPointBuyRemaining,
  normalizePointBuyAbilities
} from "../../../../pages/CharactersPage/constants";
import { formatAbilityModifier } from "../../../../pages/CharactersPage/gameplay";
import {
  consumeFighterIndomitableUseForCharacter,
  getFighterIndomitableUsesRemainingForCharacter,
  getFighterIndomitableUsesTotalForCharacter,
  getSavingThrowReferenceDescriptionAdditionsForCharacter,
  type FeatureIndicator
} from "../../../../pages/CharactersPage/classFeatures";
import { getFeatureDescriptionForCharacter } from "../../../../pages/CharactersPage/classFeatures/featureDescriptions";
import {
  getMageSlayerGuardedMindDescriptionAdditionsForCharacter,
  getMageSlayerGuardedMindStateForCharacter,
  getShieldMasterInterposeShieldDescriptionAdditionsForCharacter,
  getWarCasterConcentrationDescriptionAdditionsForCharacter,
  spendMageSlayerGuardedMindForCharacter
} from "../../../../pages/CharactersPage/feats/runtime";
import {
  consumeMonkDisciplinedSurvivor,
  getMonkDisciplinedSurvivorOptionState
} from "../../../../pages/CharactersPage/classFeatures/monk/monkDisciplinedSurvivor";
import { getMonkFeatureDescriptionAdditions } from "../../../../pages/CharactersPage/classFeatures/monk/contributions";
import {
  getRollModeFromIndicators,
  areResolvedRollStatesEquivalent,
  resolveFeatureIndicators
} from "../../../RollStatePill/rollState";
import { getExhaustionD20TestPenalty } from "../../../../pages/CharactersPage/statusEntries";
import type {
  AbilitiesDraft,
  PersistCharacterUpdater
} from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  clampNumber,
  cloneAbilityScores,
  normalizeCustomAbilityScores
} from "../../../../pages/CharactersPage/CharacterSheetPage/utils";
import {
  formatD20Formula,
  formatFormulaTerms
} from "../../../../pages/CharactersPage/shared";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import AbilitySavingThrowCards, { type SavingThrowBonusEntry } from "./AbilitySavingThrowCards";
import AbilityReferenceFooter from "./AbilityReferenceFooter";
import AbilityScoresModal from "./AbilityScoresModal";
import CharacterStatsGuideModal from "./CharacterStatsGuideModal";
import StatReferenceDrawer, {
  type ReferenceIndicatorSection,
  type SelectedStatReference
} from "./StatReferenceDrawer";
import { buildReferenceIndicatorSections } from "./coreStatModel";
import styles from "./StatsForm.module.css";

type CharacterStatsFormProps = {
  broadLayout?: boolean;
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

function createAbilitiesDraft(character: Character): AbilitiesDraft {
  const attributeMode = character.attributeMode;

  return {
    attributeMode,
    abilities:
      attributeMode === "pointBuy"
        ? normalizePointBuyAbilities(cloneAbilityScores(character.abilities))
        : normalizeCustomAbilityScores(cloneAbilityScores(character.abilities))
  };
}

function formatAbilityModifierFormula(
  ability: AbilityKey,
  score: number,
  baseValue: number,
  bonusEntries: AbilityModifierBonusEntry[] = []
): string {
  const terms = [
    `floor((${score} ${ability} - 10) / 2)`,
    ...bonusEntries.map(
      (entry) =>
        entry.formulaLabel ??
        formatCustomTraitBonusFormulaTerm(entry) ??
        `${entry.value >= 0 ? "+" : "-"} ${Math.abs(entry.value)} ${entry.label}`
    )
  ];

  return `${formatAbilityModifier(baseValue + bonusEntries.reduce((sum, entry) => sum + entry.value, 0))} ${ability} Modifier = ${terms.join(" ")}`;
}

function formatAbilityScoreFormula(
  ability: AbilityKey,
  total: number,
  entries: Array<{ label: string; value: number }>
): string {
  const [baseEntry, ...bonusEntries] = entries;
  const formattedEntries = [
    baseEntry ? `${baseEntry.value} ${ability} (${baseEntry.label})` : `${total} ${ability} (Base)`,
    ...bonusEntries.map((entry) => `${entry.value >= 0 ? "+" : ""}${entry.value} (${entry.label})`)
  ];

  return `${total} ${ability} = ${formattedEntries.join(" ")}`;
}

function formatSavingThrowFormula(
  ability: AbilityKey,
  total: number,
  abilityModifierBaseValue: number,
  abilityModifierBonusEntries: AbilityModifierBonusEntry[],
  proficiencyContribution: number,
  proficiencyLabel?: string,
  bonusEntries: SavingThrowBonusEntry[] = []
): string {
  const terms = [
    `${abilityModifierBaseValue >= 0 ? "+" : ""}${abilityModifierBaseValue} ${ability}`
  ];

  abilityModifierBonusEntries.forEach((entry) => {
    terms.push(
      entry.formulaLabel ??
        formatCustomTraitBonusFormulaTerm(entry) ??
        `${entry.value >= 0 ? "+" : ""}${entry.value} ${entry.label}`
    );
  });

  if (proficiencyContribution !== 0 && proficiencyLabel) {
    terms.push(
      `${proficiencyContribution >= 0 ? "+" : ""}${proficiencyContribution} ${proficiencyLabel}`
    );
  }

  bonusEntries.forEach((entry) => {
    if (entry.formulaLabel) {
      terms.push(entry.formulaLabel);
      return;
    }

    terms.push(`${entry.value >= 0 ? "+" : ""}${entry.value} ${entry.label}`);
  });

  return `${formatAbilityModifier(total)} ${ability} Save = ${terms.join(" ")}`;
}

function stripLeadingLabel(description: string, label: string): string {
  if (description.startsWith(`${label}:`)) {
    return description.slice(label.length + 1).trim();
  }

  return description;
}

function getStrengthDescriptionAdditions(character: Character): SpellDescriptionEntry[][] {
  const indomitableMightDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.INDOMITABLE_MIGHT
  );

  return indomitableMightDescription.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.INDOMITABLE_MIGHT,
          indomitableMightDescription,
          "Indomitable Might"
        )
      ]
    : [];
}

function getFanaticalFocusDescriptionAdditions(character: Character): SpellDescriptionEntry[][] {
  const fanaticalFocusDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.FANATICAL_FOCUS
  );

  return fanaticalFocusDescription.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.FANATICAL_FOCUS,
          fanaticalFocusDescription,
          "Fanatical Focus"
        )
      ]
    : [];
}

function getLeadingEvasionDescriptionAdditions(character: Character): SpellDescriptionEntry[][] {
  const leadingEvasionDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.LEADING_EVASION
  );

  return leadingEvasionDescription.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.LEADING_EVASION,
          leadingEvasionDescription,
          "Leading Evasion"
        )
      ]
    : [];
}

function getEvasionDescriptionAdditions(character: Character): SpellDescriptionEntry[][] {
  const evasionDescription = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.EVASION);

  return evasionDescription.length > 0
    ? [
        createFeatureSourcedDescriptionEntries(
          character,
          CLASS_FEATURE.EVASION,
          evasionDescription,
          "Evasion"
        )
      ]
    : [];
}

function getAbilityDescriptionAdditions(
  character: Character,
  ability: AbilityKey
): SpellDescriptionEntry[][] | undefined {
  const descriptionAdditions: SpellDescriptionEntry[][] = [];

  if (ability === "STR") {
    descriptionAdditions.push(...getStrengthDescriptionAdditions(character));
  }

  if (ability === "DEX") {
    descriptionAdditions.push(...getEvasionDescriptionAdditions(character));
    descriptionAdditions.push(...getLeadingEvasionDescriptionAdditions(character));
  }

  descriptionAdditions.push(...getFanaticalFocusDescriptionAdditions(character));
  descriptionAdditions.push(...getMonkFeatureDescriptionAdditions(character, "stat", ability));
  descriptionAdditions.push(
    ...getSavingThrowReferenceDescriptionAdditionsForCharacter(character, ability)
  );
  descriptionAdditions.push(
    ...getMageSlayerGuardedMindDescriptionAdditionsForCharacter(character, ability)
  );
  descriptionAdditions.push(
    ...getShieldMasterInterposeShieldDescriptionAdditionsForCharacter(character, ability)
  );
  descriptionAdditions.push(
    ...getWarCasterConcentrationDescriptionAdditionsForCharacter(character, ability)
  );

  return descriptionAdditions.length > 0 ? descriptionAdditions : undefined;
}

function getAbilityReferenceIndicatorSections(
  modifierIndicators: FeatureIndicator[],
  savingThrowIndicators: FeatureIndicator[]
): ReferenceIndicatorSection[] | undefined {
  const modifierRollState = resolveFeatureIndicators(modifierIndicators);
  const savingThrowRollState = resolveFeatureIndicators(savingThrowIndicators);

  if (!modifierRollState && !savingThrowRollState) {
    return undefined;
  }

  if (areResolvedRollStatesEquivalent(modifierRollState, savingThrowRollState)) {
    return buildReferenceIndicatorSections([
      {
        indicators: [...modifierIndicators, ...savingThrowIndicators]
      }
    ]);
  }

  return buildReferenceIndicatorSections([
    {
      label: "Ability Modifier",
      indicators: modifierIndicators
    },
    {
      label: "Saving Throw",
      indicators: savingThrowIndicators
    }
  ]);
}

function CharacterStatsForm({
  broadLayout = false,
  character,
  className,
  onPersistCharacter
}: CharacterStatsFormProps) {
  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [abilitiesDraft, setAbilitiesDraft] = useState<AbilitiesDraft>(() =>
    createAbilitiesDraft(character)
  );
  const [selectedStatReference, setSelectedStatReference] = useState<SelectedStatReference | null>(
    null
  );
  const [isDiceRollerSettingsOpen, setIsDiceRollerSettingsOpen] = useState(false);
  const [isIndomitableSaveSelected, setIsIndomitableSaveSelected] = useState(false);
  const [isDisciplinedSurvivorSaveSelected, setIsDisciplinedSurvivorSaveSelected] = useState(false);
  const [isMageSlayerGuardedMindSelected, setIsMageSlayerGuardedMindSelected] = useState(false);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();

  useBodyScrollLock(
    Boolean(selectedStatReference) || isAbilityModalOpen || isDiceRollerSettingsOpen || isGuideOpen
  );

  useEffect(() => {
    if (!selectedStatReference && !isAbilityModalOpen && !isDiceRollerSettingsOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (isDiceRollerSettingsOpen) {
        return;
      }

      if (selectedStatReference) {
        closeSelectedStatReference();
        return;
      }

      if (isAbilityModalOpen) {
        setAbilitiesDraft(createAbilitiesDraft(character));
        setIsAbilityModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [character, isAbilityModalOpen, isDiceRollerSettingsOpen, selectedStatReference]);

  const combatSummary = useMemo(() => getCharacterRuntime(character).combatSummary, [character]);
  const { abilitySavingThrowCards, primaryAbilities } = combatSummary.abilities;
  const pointBuyRemaining =
    abilitiesDraft.attributeMode === "pointBuy"
      ? getPointBuyRemaining(abilitiesDraft.abilities)
      : null;
  const canSaveAbilityDraft =
    abilitiesDraft.attributeMode !== "pointBuy" || pointBuyRemaining === 0;
  const fighterIndomitableUsesTotal = getFighterIndomitableUsesTotalForCharacter(character);
  const fighterIndomitableUsesRemaining = getFighterIndomitableUsesRemainingForCharacter(character);

  useRenderProfiler("CharacterStatsForm", {
    abilityCardCount: abilitySavingThrowCards.length,
    characterClass: character.className,
    level: character.level
  });

  const resolvedSelectedStatReference = selectedStatReference;
  const selectedAbilityReferenceKey =
    abilityKeys.find((ability) => ability === resolvedSelectedStatReference?.keyword) ?? null;
  const indomitableSaveBonus = Math.max(1, Math.floor(character.level));
  const canUseIndomitableOnSelectedSave =
    selectedAbilityReferenceKey !== null && fighterIndomitableUsesTotal > 0;
  const canUseMageSlayerGuardedMindOnSelectedSave =
    selectedAbilityReferenceKey === "INT" ||
    selectedAbilityReferenceKey === "WIS" ||
    selectedAbilityReferenceKey === "CHA";
  const mageSlayerGuardedMindState = useMemo(
    () =>
      canUseMageSlayerGuardedMindOnSelectedSave
        ? getMageSlayerGuardedMindStateForCharacter(character)
        : null,
    [canUseMageSlayerGuardedMindOnSelectedSave, character]
  );
  const disciplinedSurvivorSaveState = useMemo(
    () =>
      selectedAbilityReferenceKey !== null
        ? getMonkDisciplinedSurvivorOptionState(character)
        : null,
    [character, selectedAbilityReferenceKey]
  );

  useEffect(() => {
    setIsIndomitableSaveSelected(false);
    setIsDisciplinedSurvivorSaveSelected(false);
    setIsMageSlayerGuardedMindSelected(false);
  }, [resolvedSelectedStatReference?.keyword]);

  useEffect(() => {
    if (!disciplinedSurvivorSaveState || disciplinedSurvivorSaveState.disabled) {
      setIsDisciplinedSurvivorSaveSelected(false);
    }
  }, [disciplinedSurvivorSaveState]);

  useEffect(() => {
    if (!mageSlayerGuardedMindState) {
      setIsMageSlayerGuardedMindSelected(false);
    }
  }, [mageSlayerGuardedMindState]);

  function syncAbilityDraftFromCharacter() {
    setAbilitiesDraft(createAbilitiesDraft(character));
  }

  function openAbilityEditor() {
    syncAbilityDraftFromCharacter();
    setIsAbilityModalOpen(true);
  }

  function cancelAbilityEditing() {
    syncAbilityDraftFromCharacter();
    setIsAbilityModalOpen(false);
  }

  function saveAbilities() {
    const nextAbilities =
      abilitiesDraft.attributeMode === "pointBuy"
        ? normalizePointBuyAbilities(cloneAbilityScores(abilitiesDraft.abilities))
        : normalizeCustomAbilityScores(cloneAbilityScores(abilitiesDraft.abilities));

    if (
      abilitiesDraft.attributeMode === "pointBuy" &&
      getPointBuyRemaining(nextAbilities) !== 0
    ) {
      return;
    }

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      attributeMode: abilitiesDraft.attributeMode,
      abilities: nextAbilities
    }));

    setIsAbilityModalOpen(false);
  }

  function updateAbilityScore(ability: AbilityKey, value: string) {
    setAbilitiesDraft((current) => ({
      ...current,
      abilities: updateAbilityDraftScore(current, ability, value)
    }));
  }

  function updateAbilityDraftScore(
    current: AbilitiesDraft,
    ability: AbilityKey,
    value: string
  ) {
    const isPointBuy = current.attributeMode === "pointBuy";
    const nextValue = clampNumber(
      value,
      isPointBuy ? 8 : 1,
      isPointBuy ? 15 : CUSTOM_ABILITY_SCORE_MAX,
      current.abilities[ability]
    );
    const nextAbilities = {
      ...current.abilities,
      [ability]: nextValue
    };

    return nextAbilities;
  }

  function setAbilityDraftMode(attributeMode: AbilitiesDraft["attributeMode"]) {
    setAbilitiesDraft((current) => {
      if (attributeMode === current.attributeMode) {
        return current;
      }

      const abilities =
        attributeMode === "pointBuy"
          ? normalizePointBuyAbilities(cloneAbilityScores(current.abilities))
          : normalizeCustomAbilityScores(cloneAbilityScores(current.abilities));

      return {
        attributeMode,
        abilities
      };
    });
  }

  function closeSelectedStatReference() {
    setIsDiceRollerSettingsOpen(false);
    setIsIndomitableSaveSelected(false);
    setIsDisciplinedSurvivorSaveSelected(false);
    setIsMageSlayerGuardedMindSelected(false);
    setSelectedStatReference(null);
  }

  function rollAbilityReference(
    title: string,
    modifier: number,
    description: string,
    indicators?: FeatureIndicator[]
  ) {
    const exhaustionPenalty = getExhaustionD20TestPenalty(character.statusEntries);
    const totalModifier = modifier + exhaustionPenalty;
    const rollFormula = formatD20Formula(totalModifier);
    const mode = getRollModeFromIndicators(indicators);
    const exhaustionDescription = `Exhaustion applies ${formatAbilityModifier(
      exhaustionPenalty
    )} to D20 Tests.`;
    const rollDescription =
      exhaustionPenalty === 0
        ? description
        : `${description}${description.endsWith(".") ? "" : "."} ${exhaustionDescription}`;

    openDiceRoller({
      title,
      formula: rollFormula,
      formulaDisplay: rollFormula,
      description: rollDescription,
      mode
    });
  }

  function changeMageSlayerGuardedMindSelection(checked: boolean) {
    if (!checked) {
      setIsMageSlayerGuardedMindSelected(false);
      return;
    }

    const guardedMindState = getMageSlayerGuardedMindStateForCharacter(character);

    if (!guardedMindState || guardedMindState.usesRemaining <= 0) {
      return;
    }

    onPersistCharacter(spendMageSlayerGuardedMindForCharacter);
    setIsMageSlayerGuardedMindSelected(true);
  }

  function rollSavingThrowReference() {
    const saveRoll = resolvedSelectedStatReference?.rollActions?.save;

    if (!saveRoll) {
      return;
    }

    const usesIndomitable =
      canUseIndomitableOnSelectedSave &&
      isIndomitableSaveSelected &&
      fighterIndomitableUsesRemaining > 0;
    const usesDisciplinedSurvivor =
      isDisciplinedSurvivorSaveSelected &&
      disciplinedSurvivorSaveState !== null &&
      !disciplinedSurvivorSaveState.disabled;
    const usesMageSlayerGuardedMind =
      isMageSlayerGuardedMindSelected &&
      canUseMageSlayerGuardedMindOnSelectedSave &&
      mageSlayerGuardedMindState !== null;
    const totalModifier = saveRoll.modifier + (usesIndomitable ? indomitableSaveBonus : 0);
    const rollFormula = formatFormulaTerms([
      formatD20Formula(totalModifier),
      ...(saveRoll.formulaTerms ?? [])
    ]);
    const rollFormulaDisplay = formatFormulaTerms([
      formatD20Formula(totalModifier),
      ...(saveRoll.formulaDisplayTerms ?? saveRoll.formulaTerms ?? [])
    ]);
    const titleSuffixes = [
      ...(usesIndomitable ? ["Indomitable"] : []),
      ...(usesDisciplinedSurvivor ? ["Discipline Survivor"] : []),
      ...(usesMageSlayerGuardedMind ? ["Guarded Mind"] : [])
    ];
    const title =
      titleSuffixes.length > 0 ? `${saveRoll.title} (${titleSuffixes.join(", ")})` : saveRoll.title;
    const descriptionParts = [
      saveRoll.description,
      ...(usesIndomitable ? [`Indomitable adds +${indomitableSaveBonus} Fighter Level.`] : []),
      ...(usesDisciplinedSurvivor
        ? [
            "Discipline Survivor expends 1 Focus Point to reroll this saving throw; you must use the new roll."
          ]
        : []),
      ...(usesMageSlayerGuardedMind
        ? ["Guarded Mind has been consumed for this saving throw."]
        : [])
    ];

    if (usesIndomitable || usesDisciplinedSurvivor) {
      onPersistCharacter((currentCharacter) => {
        let nextCharacter = currentCharacter;

        if (usesIndomitable) {
          nextCharacter = consumeFighterIndomitableUseForCharacter(nextCharacter);
        }

        if (usesDisciplinedSurvivor) {
          nextCharacter = consumeMonkDisciplinedSurvivor(nextCharacter);
        }

        return nextCharacter;
      });
    }

    if (usesIndomitable) {
      setIsIndomitableSaveSelected(false);
    }

    if (usesDisciplinedSurvivor) {
      setIsDisciplinedSurvivorSaveSelected(false);
    }

    if (usesMageSlayerGuardedMind) {
      setIsMageSlayerGuardedMindSelected(false);
    }

    openDiceRoller({
      title,
      formula: rollFormula,
      formulaDisplay: rollFormulaDisplay,
      description: descriptionParts.join(" "),
      mode: getRollModeFromIndicators(saveRoll.indicators)
    });
  }

  function openAbilityReference(ability: AbilityKey) {
    const abilityBreakdown = getAbilityScoreBreakdownForCharacter(character, ability);
    const abilityDescription = getKeywordDescription(ability);
    const savingThrowKeyword = `${ability} Saving Throw`;
    const savingThrowDescription = getKeywordDescription(savingThrowKeyword);
    const selectedCard = abilitySavingThrowCards.find((card) => card.ability === ability);

    if (!selectedCard) {
      return;
    }

    setIsDiceRollerSettingsOpen(false);

    const abilityScoreFormula = formatAbilityScoreFormula(
      ability,
      abilityBreakdown.total,
      abilityBreakdown.entries
    );
    const abilityModifierFormula = formatAbilityModifierFormula(
      ability,
      selectedCard.score,
      selectedCard.modifierBaseValue,
      selectedCard.modifierBonusEntries
    );
    const savingThrowFormula = formatSavingThrowFormula(
      ability,
      selectedCard.totalSavingThrowValue,
      selectedCard.modifierBaseValue,
      selectedCard.modifierBonusEntries,
      selectedCard.proficiencyContribution,
      selectedCard.proficiencyLabel,
      selectedCard.savingThrowBonusEntries
    );
    const savingThrowFormulaTerms = selectedCard.savingThrowBonusEntries
      .map(formatCustomTraitBonusRollFormulaTerm)
      .filter((entry): entry is string => Boolean(entry));
    const savingThrowFormulaDisplayTerms = selectedCard.savingThrowBonusEntries.flatMap((entry) =>
      formatCustomTraitBonusRollFormulaTerm(entry) ? [entry.formulaLabel ?? entry.formula ?? ""] : []
    );
    const abilityLabel = abilityDisplayLabels[ability];

    const descriptionItems = [
      ...(abilityDescription
        ? [
            {
              label: abilityDisplayLabels[ability],
              text: stripLeadingLabel(abilityDescription, abilityDisplayLabels[ability])
            }
          ]
        : []),
      ...(savingThrowDescription
        ? [
            {
              label: savingThrowKeyword,
              text: stripLeadingLabel(savingThrowDescription, savingThrowKeyword)
            }
          ]
        : [])
    ];
    setSelectedStatReference({
      keyword: ability,
      rollActions: {
        label: abilityLabel,
        actionName: `${abilityLabel} Rolls`,
        mod: {
          title: `${abilityLabel} Ability Modifier`,
          modifier: selectedCard.modifierValue,
          description: abilityModifierFormula,
          indicators: selectedCard.modifierIndicators
        },
        save: {
          title: `${abilityLabel} Saving Throw`,
          modifier: selectedCard.totalSavingThrowValue,
          description: savingThrowFormula,
          indicators: selectedCard.savingThrowIndicators,
          formulaTerms: savingThrowFormulaTerms,
          formulaDisplayTerms: savingThrowFormulaDisplayTerms
        }
      },
      descriptionAdditions: getAbilityDescriptionAdditions(character, ability),
      indicatorSections: getAbilityReferenceIndicatorSections(
        selectedCard.modifierIndicators,
        selectedCard.savingThrowIndicators
      ),
      descriptionItems: descriptionItems.length ? descriptionItems : undefined,
      detailCards: [
        {
          label: "Ability Score Formula",
          value: abilityScoreFormula,
          variant: "formula"
        },
        {
          label: "Ability Modifier Formula",
          value: abilityModifierFormula,
          variant: "formula"
        },
        {
          label: "Saving Throw Formula",
          value: savingThrowFormula,
          variant: "formula"
        }
      ]
    });
  }

  function renderAbilitySavingThrowsSection() {
    return (
      <section className={styles.statsGroup}>
        <div className={styles.statsGroupHeader}>
          <h3 className={clsx(styles.statsGroupTitle, styles.combinedGroupTitle)}>
            <span>Ability Modifier</span>
            <span className={styles.groupTitleDivider} aria-hidden="true" />
            <span>Saving Throws</span>
          </h3>
          <button type="button" className={shared.editButton} onClick={openAbilityEditor}>
            <Pencil size={16} />
            Edit
          </button>
        </div>

        <AbilitySavingThrowCards
          broadLayout={broadLayout}
          cards={abilitySavingThrowCards}
          primaryAbilities={primaryAbilities}
          onOpenAbilityReference={openAbilityReference}
        />
      </section>
    );
  }

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <div className={shared.eyebrowHelpRow}>
            <p className={clsx(shared.eyebrow, shared.eyebrowInHelpRow)}>Character Stats</p>
            <button
              type="button"
              className={shared.helpButton}
              onClick={() => setIsGuideOpen(true)}
              aria-label="Open character stats guide"
              title="Open character stats guide"
            >
              <CircleHelp size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.fullViewStack}>
        {renderAbilitySavingThrowsSection()}
      </div>

      <AbilityScoresModal
        isOpen={isAbilityModalOpen}
        draft={abilitiesDraft}
        pointBuyRemaining={pointBuyRemaining}
        canSave={canSaveAbilityDraft}
        onClose={cancelAbilityEditing}
        onSave={saveAbilities}
        onSetAttributeMode={setAbilityDraftMode}
        onUpdateAbilityScore={updateAbilityScore}
      />

      {isGuideOpen ? <CharacterStatsGuideModal onClose={() => setIsGuideOpen(false)} /> : null}

      {resolvedSelectedStatReference ? (
        <StatReferenceDrawer
          reference={resolvedSelectedStatReference}
          footer={
            resolvedSelectedStatReference.rollActions ? (
              <AbilityReferenceFooter
                actionName={resolvedSelectedStatReference.rollActions.actionName}
                canUseIndomitableOnSave={canUseIndomitableOnSelectedSave}
                indomitableUsesRemaining={fighterIndomitableUsesRemaining}
                indomitableUsesTotal={fighterIndomitableUsesTotal}
                isIndomitableSaveSelected={isIndomitableSaveSelected}
                onIndomitableSaveChange={setIsIndomitableSaveSelected}
                disciplinedSurvivorState={disciplinedSurvivorSaveState}
                isDisciplinedSurvivorSelected={isDisciplinedSurvivorSaveSelected}
                onDisciplinedSurvivorChange={setIsDisciplinedSurvivorSaveSelected}
                mageSlayerGuardedMindState={mageSlayerGuardedMindState}
                isMageSlayerGuardedMindSelected={isMageSlayerGuardedMindSelected}
                onMageSlayerGuardedMindChange={changeMageSlayerGuardedMindSelection}
                isDiceRollerSettingsOpen={isDiceRollerSettingsOpen}
                onDiceRollerSettingsOpenChange={setIsDiceRollerSettingsOpen}
                onRollMod={() =>
                  rollAbilityReference(
                    resolvedSelectedStatReference.rollActions?.mod.title ?? "Ability Modifier",
                    resolvedSelectedStatReference.rollActions?.mod.modifier ?? 0,
                    resolvedSelectedStatReference.rollActions?.mod.description ?? "",
                    resolvedSelectedStatReference.rollActions?.mod.indicators
                  )
                }
                onRollSave={rollSavingThrowReference}
              />
            ) : null
          }
          onClose={closeSelectedStatReference}
        />
      ) : null}
      {diceRollerPopup}
    </article>
  );
}

export default CharacterStatsForm;
