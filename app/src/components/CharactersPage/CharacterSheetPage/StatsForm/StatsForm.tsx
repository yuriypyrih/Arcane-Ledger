import clsx from "clsx";
import { ChevronsUp, Pencil, Pentagon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { createFeatureSourcedDescriptionEntries } from "../../../../pages/CharactersPage/actionModalDescriptions";
import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import type { AbilityKey, Character } from "../../../../types";
import {
  getAbilityModifierBreakdownForCharacter,
  getAbilityScoreBreakdownForCharacter,
  getAbilityScoresForCharacter,
  type AbilityModifierBonusEntry
} from "../../../../pages/CharactersPage/abilities";
import { getKeywordDescription } from "../../../../pages/CharactersPage/keywordDescriptions";
import {
  abilityKeys,
  getPointBuyRemaining,
  normalizePointBuyAbilities
} from "../../../../pages/CharactersPage/constants";
import {
  formatAbilityModifier,
  getMainAbilityForClass,
  getProficiencyBonus
} from "../../../../pages/CharactersPage/gameplay";
import {
  consumeFighterIndomitableUseForCharacter,
  getAbilityCheckIndicatorsForCharacter,
  getFighterIndomitableUsesRemainingForCharacter,
  getFighterIndomitableUsesTotalForCharacter,
  getSavingThrowReferenceDescriptionAdditionsForCharacter,
  getSavingThrowBonusesForCharacter,
  hasActivePaladinAuraOfProtectionForCharacter,
  getSavingThrowIndicatorsForCharacter,
  type FeatureIndicator,
  type FeatureSavingThrowBonus
} from "../../../../pages/CharactersPage/classFeatures";
import { getFeatureDescriptionForCharacter } from "../../../../pages/CharactersPage/classFeatures/featureDescriptions";
import { getBarbarianRageState } from "../../../../pages/CharactersPage/classFeatures/barbarian/barbarian";
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
import { getMonkAbilityDescriptionAdditions } from "../../../../pages/CharactersPage/classFeatures/monk/monkDescriptionSections";
import RollStatePill from "../../../RollStatePill/RollStatePill";
import {
  getRollModeFromIndicators,
  areResolvedRollStatesEquivalent,
  resolveFeatureIndicators,
  type ResolvedRollState
} from "../../../RollStatePill/rollState";
import {
  getSavingThrowLevelFromEntries,
  getSavingThrowProficiencyForAbilityKey
} from "../../../../pages/CharactersPage/proficiency";
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
  getProficiencyMultiplier
} from "../../../../pages/CharactersPage/shared";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import SheetSurface from "../SheetSurface";
import AbilityReferenceFooter from "./AbilityReferenceFooter";
import AbilityScoresModal from "./AbilityScoresModal";
import StatReferenceDrawer, {
  type ReferenceIndicatorSection,
  type SelectedStatReference
} from "./StatReferenceDrawer";
import { buildReferenceIndicatorSections } from "./coreStatModel";
import styles from "./StatsForm.module.css";

type CharacterStatsFormProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type AbilitySavingThrowCard = {
  ability: AbilityKey;
  score: number;
  modifier: string;
  modifierBaseValue: number;
  modifierValue: number;
  modifierBonusEntries: AbilityModifierBonusEntry[];
  isSavingThrowProficient: boolean;
  proficiencyContribution: number;
  proficiencyLabel?: string;
  savingThrowBonusEntries: SavingThrowBonusEntry[];
  totalSavingThrowValue: number;
  totalSavingThrow: string;
  showScoreBoostIcon?: boolean;
  scoreBoostIconLabel?: string;
  showSavingThrowBoostIcon?: boolean;
  savingThrowBoostIconLabel?: string;
  modifierIndicators: FeatureIndicator[];
  modifierRollState: ResolvedRollState | null;
  savingThrowIndicators: FeatureIndicator[];
  savingThrowRollState: ResolvedRollState | null;
  sharedRollState: ResolvedRollState | null;
};

type SavingThrowBonusEntry = {
  label: string;
  value: number;
  formulaLabel?: string;
};

const abilityDisplayLabels: Record<AbilityKey, string> = {
  STR: "Strength",
  DEX: "Dexterity",
  CON: "Constitution",
  INT: "Intelligence",
  WIS: "Wisdom",
  CHA: "Charisma"
};

function createAbilitiesDraft(character: Character): AbilitiesDraft {
  return {
    attributeMode: "pointBuy",
    abilities: cloneAbilityScores(character.abilities)
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
      (entry) => `${entry.value >= 0 ? "+" : "-"} ${Math.abs(entry.value)} ${entry.label}`
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
    terms.push(`${entry.value >= 0 ? "+" : ""}${entry.value} ${entry.label}`);
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

function resolveFeatureSavingThrowBonusValue(
  bonus: FeatureSavingThrowBonus,
  character: Character
): number {
  if (bonus.abilityModifierSource) {
    const sourceValue = getAbilityModifierBreakdownForCharacter(
      character,
      bonus.abilityModifierSource
    ).total;
    return typeof bonus.minimumValue === "number"
      ? Math.max(bonus.minimumValue, sourceValue)
      : sourceValue;
  }

  return bonus.value ?? 0;
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
  descriptionAdditions.push(...getMonkAbilityDescriptionAdditions(character, ability));
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

function getRollStateValueClassName(rollState: ResolvedRollState | null): string | undefined {
  switch (rollState?.tone) {
    case "advantage":
      return styles.rollStateValueAdvantage;
    case "disadvantage":
      return styles.rollStateValueDisadvantage;
    case "neutralized":
      return styles.rollStateValueNeutralized;
    default:
      return undefined;
  }
}

function CharacterStatsForm({ character, className, onPersistCharacter }: CharacterStatsFormProps) {
  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
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
    Boolean(selectedStatReference) || isAbilityModalOpen || isDiceRollerSettingsOpen
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

  const mainAbility = getMainAbilityForClass(character.className);
  const hasIndomitableMight =
    character.className === "Barbarian" &&
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.INDOMITABLE_MIGHT).length > 0;
  const hasFanaticalFocus =
    character.className === "Barbarian" &&
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.FANATICAL_FOCUS).length > 0;
  const isBarbarianRaging = hasFanaticalFocus && getBarbarianRageState(character).active === true;
  const hasLeadingEvasion =
    character.className === "Bard" &&
    character.subclassId === "bard-college-of-dance" &&
    character.level >= 14;
  const hasEvasion = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.EVASION).length > 0;
  const pointBuyRemaining =
    abilitiesDraft.attributeMode === "pointBuy"
      ? getPointBuyRemaining(abilitiesDraft.abilities)
      : null;
  const proficiencyBonus = getProficiencyBonus(character.level);
  const effectiveAbilities = getAbilityScoresForCharacter(character);
  const paladinAuraOfProtectionBonus = hasActivePaladinAuraOfProtectionForCharacter(character)
    ? Math.max(1, getAbilityModifierBreakdownForCharacter(character, "CHA").total)
    : 0;
  const abilityCheckIndicators = getAbilityCheckIndicatorsForCharacter(character);
  const savingThrowIndicators = getSavingThrowIndicatorsForCharacter(character);
  const fighterIndomitableUsesTotal = getFighterIndomitableUsesTotalForCharacter(character);
  const fighterIndomitableUsesRemaining = getFighterIndomitableUsesRemainingForCharacter(character);
  const abilitySavingThrowCards: AbilitySavingThrowCard[] = abilityKeys.map((ability) => {
    const abilityScore = effectiveAbilities[ability];
    const abilityModifierBreakdown = getAbilityModifierBreakdownForCharacter(character, ability);
    const abilityModifierValue = abilityModifierBreakdown.total;
    const savingThrowProficiency = getSavingThrowProficiencyForAbilityKey(ability);
    const savingThrowLevel = getSavingThrowLevelFromEntries(
      character.savingThrowProficiencies,
      savingThrowProficiency
    );
    const proficiencyMultiplier = getProficiencyMultiplier(savingThrowLevel);
    const proficiencyContribution = proficiencyBonus * proficiencyMultiplier;
    const featureSavingThrowBonusEntries: SavingThrowBonusEntry[] =
      getSavingThrowBonusesForCharacter(character, ability).map((bonus) => ({
        label: bonus.label,
        value: resolveFeatureSavingThrowBonusValue(bonus, character)
      }));
    const savingThrowBonusEntries: SavingThrowBonusEntry[] = [
      ...(paladinAuraOfProtectionBonus > 0
        ? [
            {
              label: "Aura of Protection",
              value: paladinAuraOfProtectionBonus
            }
          ]
        : []),
      ...featureSavingThrowBonusEntries
    ];
    const totalSavingThrowValue =
      abilityModifierValue +
      proficiencyContribution +
      savingThrowBonusEntries.reduce((sum, entry) => sum + entry.value, 0);
    const proficiencyLabel =
      proficiencyMultiplier === 2
        ? "Proficiency Bonus x2"
        : proficiencyMultiplier === 1
          ? "Proficiency Bonus"
          : undefined;
    const modifierIndicators = abilityCheckIndicators[ability] ?? [];
    const saveIndicators = savingThrowIndicators[ability] ?? [];
    const modifierRollState = resolveFeatureIndicators(modifierIndicators);
    const savingThrowRollState = resolveFeatureIndicators(saveIndicators);
    const sharedRollState = areResolvedRollStatesEquivalent(modifierRollState, savingThrowRollState)
      ? (modifierRollState ?? savingThrowRollState)
      : null;

    return {
      ability,
      score: abilityScore,
      modifier: formatAbilityModifier(abilityModifierValue),
      modifierBaseValue: abilityModifierBreakdown.baseValue,
      modifierValue: abilityModifierValue,
      modifierBonusEntries: abilityModifierBreakdown.bonusEntries,
      isSavingThrowProficient: proficiencyMultiplier > 0,
      proficiencyContribution,
      proficiencyLabel,
      savingThrowBonusEntries,
      totalSavingThrowValue,
      totalSavingThrow: formatAbilityModifier(totalSavingThrowValue),
      showScoreBoostIcon:
        (ability === "STR" && hasIndomitableMight) ||
        isBarbarianRaging ||
        (ability === "DEX" && hasLeadingEvasion),
      scoreBoostIconLabel:
        ability === "DEX" && hasLeadingEvasion
          ? "Leading Evasion active"
          : ability === "STR" && hasIndomitableMight
            ? "Indomitable Might active"
            : isBarbarianRaging
              ? "Fanatical Focus active"
              : undefined,
      showSavingThrowBoostIcon: ability === "DEX" && hasEvasion,
      savingThrowBoostIconLabel: ability === "DEX" && hasEvasion ? "Evasion active" : undefined,
      modifierIndicators,
      modifierRollState,
      savingThrowIndicators: saveIndicators,
      savingThrowRollState,
      sharedRollState
    };
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

    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      attributeMode: abilitiesDraft.attributeMode,
      abilities: nextAbilities
    }));

    setIsAbilityModalOpen(false);
  }

  function updateAbilityScore(ability: AbilityKey, value: string) {
    const isPointBuy = abilitiesDraft.attributeMode === "pointBuy";
    const nextValue = clampNumber(
      value,
      isPointBuy ? 8 : 1,
      isPointBuy ? 15 : 99,
      abilitiesDraft.abilities[ability]
    );

    setAbilitiesDraft((current) => ({
      ...current,
      abilities: {
        ...current.abilities,
        [ability]: nextValue
      }
    }));
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
    const rollFormula = formatD20Formula(modifier);
    const mode = getRollModeFromIndicators(indicators);

    openDiceRoller({
      title,
      formula: rollFormula,
      formulaDisplay: rollFormula,
      description,
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
    const rollFormula = formatD20Formula(totalModifier);
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
      formulaDisplay: rollFormula,
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
          indicators: selectedCard.savingThrowIndicators
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

        <div className={styles.abilitySavingThrowGrid}>
          {abilitySavingThrowCards.map((card) => {
            const hasSplitRollStates =
              card.sharedRollState === null &&
              card.modifierRollState !== null &&
              card.savingThrowRollState !== null;
            const leftRollState = hasSplitRollStates ? card.modifierRollState : null;
            const rightRollState =
              card.sharedRollState ?? card.savingThrowRollState ?? card.modifierRollState;

            return (
              <SheetSurface
                as="button"
                key={card.ability}
                type="button"
                borderSize="xl"
                hoverBorder
                className={clsx(styles.modifierCard, styles.modifierCardButton)}
                onClick={() => openAbilityReference(card.ability)}
              >
                <div className={styles.modifierLabelRow}>
                  {leftRollState ? (
                    <RollStatePill tone={leftRollState.tone} label={leftRollState.label} />
                  ) : null}
                  <span className={styles.modifierLabel}>{card.ability}</span>
                  <span
                    className={clsx(
                      styles.scoreBadge,
                      card.ability === mainAbility && styles.scoreBadgePrimary
                    )}
                    aria-label={`${card.ability} score ${card.score}`}
                  >
                    <Pentagon size={28} className={styles.scoreBadgeIcon} aria-hidden="true" />
                    <span className={styles.scoreBadgeValue}>{card.score}</span>
                  </span>
                  {card.showScoreBoostIcon ? (
                    <ChevronsUp
                      size={18}
                      className={styles.scoreBoostIcon}
                      aria-label={card.scoreBoostIconLabel ?? "Feature boost active"}
                    />
                  ) : null}
                  {rightRollState ? (
                    <RollStatePill tone={rightRollState.tone} label={rightRollState.label} />
                  ) : null}
                </div>
                <div className={styles.combinedValueRow}>
                  <div className={styles.combinedValueColumn}>
                    <span className={styles.combinedValueLabel}>MOD</span>
                    <strong className={getRollStateValueClassName(card.modifierRollState)}>
                      {card.modifier}
                    </strong>
                  </div>
                  <span className={styles.combinedValueDivider} aria-hidden="true" />
                  <span className={clsx(styles.savingThrowValueGroup, styles.combinedValueColumn)}>
                    <span className={styles.combinedValueLabel}>SAVE</span>
                    <span className={styles.savingThrowValueRow}>
                      <strong
                        className={clsx(
                          getRollStateValueClassName(card.savingThrowRollState),
                          card.isSavingThrowProficient && styles.savingThrowValueProficient
                        )}
                      >
                        {card.totalSavingThrow}
                      </strong>
                      {card.showSavingThrowBoostIcon ? (
                        <ChevronsUp
                          size={16}
                          className={styles.savingThrowBoostIcon}
                          aria-label={
                            card.savingThrowBoostIconLabel ?? "Saving throw feature boost active"
                          }
                        />
                      ) : null}
                    </span>
                  </span>
                </div>
              </SheetSurface>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Character Stats</p>
        </div>
      </div>

      <div className={styles.fullViewStack}>
        {renderAbilitySavingThrowsSection()}
      </div>

      <AbilityScoresModal
        isOpen={isAbilityModalOpen}
        draft={abilitiesDraft}
        pointBuyRemaining={pointBuyRemaining}
        onClose={cancelAbilityEditing}
        onSave={saveAbilities}
        onSetAttributeMode={(attributeMode) =>
          setAbilitiesDraft((current) => ({
            ...current,
            attributeMode
          }))
        }
        onUpdateAbilityScore={updateAbilityScore}
      />

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
