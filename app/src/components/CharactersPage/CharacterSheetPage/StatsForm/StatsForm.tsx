import clsx from "clsx";
import { ChevronsUp, Pencil, Pentagon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDiceRollerPopup } from "../../../DicePage/DiceRollerPopup";
import { useBodyScrollLock } from "../../../../lib/useBodyScrollLock";
import { createSourcedDescriptionEntries } from "../../../../pages/CharactersPage/actionModalDescriptions";
import { CLASS_FEATURE, type SpellDescriptionEntry } from "../../../../codex/entries";
import type { AbilityKey, Character, CoreStats } from "../../../../types";
import {
  getAbilityModifierBreakdownForCharacter,
  getAbilityScoreBreakdownForCharacter,
  getAbilityScoresForCharacter,
  type AbilityModifierBonusEntry
} from "../../../../pages/CharactersPage/abilities";
import { getKeywordDescription } from "../../../../pages/CharactersPage/keywordDescriptions";
import {
  abilityKeys,
  createDefaultCoreStats,
  getPointBuyRemaining,
  normalizePointBuyAbilities
} from "../../../../pages/CharactersPage/constants";
import {
  formatAbilityModifier,
  getHitDiceDisplayForCharacter,
  getInitiativeBreakdownForCharacter,
  getInitiativeForCharacter,
  getMainAbilityForClass,
  getPassivePerceptionForCharacter,
  getProficiencyBonus
} from "../../../../pages/CharactersPage/gameplay";
import {
  getArmorClassResolutionForCharacter,
  setArmorClassFormulaSelectionForCharacter
} from "../../../../pages/CharactersPage/armor";
import {
  canCharacterHover,
  getJumpDistanceBreakdownsForCharacter,
  getMovementSpeedBreakdownsForCharacter,
  hasModifiedSpecialMovementForCharacter,
  getSpeedBreakdownForCharacter,
  type JumpDistanceBreakdown,
  getSpeedForCharacter
} from "../../../../pages/CharactersPage/speed";
import {
  consumeFighterIndomitableUseForCharacter,
  getAbilityCheckIndicatorsForCharacter,
  getBarbarianPersistentRageUsesRemainingForCharacter,
  getBarbarianPersistentRageUsesTotalForCharacter,
  getBarbarianRageDamageBonusForCharacter,
  getBardicInspirationDieForCharacter,
  getBardicInspirationUsesRemainingForCharacter,
  getCoreStatIndicatorsForCharacter,
  getFighterIndomitableUsesRemainingForCharacter,
  getFighterIndomitableUsesTotalForCharacter,
  getFighterBattleMasterSuperiorityDiceRemainingForCharacter,
  getFighterBattleMasterSuperiorityDiceTotalForCharacter,
  getFighterBattleMasterSuperiorityDieForCharacter,
  getFighterPsiWarriorEnergyDiceTotalForCharacter,
  getFighterPsiWarriorEnergyDiceRemainingForCharacter,
  getFighterPsiWarriorEnergyDieForCharacter,
  getMonkMartialArtsDieForCharacter,
  getMonkUncannyMetabolismUsesRemainingForCharacter,
  getMonkUncannyMetabolismUsesTotalForCharacter,
  getRogueSoulknifePsionicDiceRemainingForCharacter,
  getRogueSoulknifePsionicDiceTotalForCharacter,
  getRogueSoulknifePsionicDieForCharacter,
  getRogueSneakAttackDiceCountForCharacter,
  getRogueSneakAttackFormulaForCharacter,
  hasRogueThiefThiefsReflexesForCharacter,
  getSavingThrowBonusesForCharacter,
  hasActivePaladinAuraOfProtectionForCharacter,
  getSavingThrowIndicatorsForCharacter,
  type FeatureIndicator,
  type FeatureSavingThrowBonus
} from "../../../../pages/CharactersPage/classFeatures";
import { getFeatureDescriptionForCharacter } from "../../../../pages/CharactersPage/classFeatures/featureDescriptions";
import { getBarbarianRageState } from "../../../../pages/CharactersPage/classFeatures/barbarian/barbarian";
import { getInitiativeReferenceDescriptionAdditions } from "../../../../pages/CharactersPage/classFeatures/initiativeDescriptionSections";
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
import { formatD20Formula, getProficiencyMultiplier } from "../../../../pages/CharactersPage/shared";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import AbilityReferenceFooter from "./AbilityReferenceFooter";
import AbilityScoresModal from "./AbilityScoresModal";
import ArmorClassFormulaFooter from "./ArmorClassFormulaFooter";
import InitiativeReferenceFooter from "./InitiativeReferenceFooter";
import StatReferenceDrawer, {
  type ReferenceDetailCard,
  type ReferenceIndicatorSection,
  type SelectedStatReference
} from "./StatReferenceDrawer";
import { getArmorClassReferenceDetailCards } from "./armorClassReference";
import {
  applyInitiativeRollCharacterEffects,
  createInitiativeRollRequest
} from "./initiativeRoll";
import styles from "./StatsForm.module.css";

type CharacterStatsFormProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

type CoreStatCard = {
  key: string;
  label: string;
  value: string;
  showBoostIcon?: boolean;
  indicators?: FeatureIndicator[];
  summaryText?: string;
  detailCards?: ReferenceDetailCard[];
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

const coreStatFields: Array<{ key: keyof CoreStats; label: string }> = [
  { key: "armorClass", label: "Armor Class" },
  { key: "initiative", label: "Initiative" },
  { key: "speed", label: "Speed" },
  { key: "passivePerception", label: "Passive Perception" },
  { key: "proficiencyBonus", label: "Proficiency Bonus" },
  { key: "hitDice", label: "Hit Dice" }
];

function createAbilitiesDraft(character: Character): AbilitiesDraft {
  return {
    attributeMode: "pointBuy",
    abilities: cloneAbilityScores(character.abilities)
  };
}

function formatMovementBaseFormula(
  baseExpression: ReturnType<
    typeof getMovementSpeedBreakdownsForCharacter
  >["walk"]["baseExpression"]
): string {
  if (baseExpression.kind === "none") {
    return "-";
  }

  if (baseExpression.kind === "fixed") {
    return `${baseExpression.value} ${baseExpression.label}`;
  }

  const sourceSuffix = baseExpression.sourceLabel ? ` (${baseExpression.sourceLabel})` : "";

  if (baseExpression.multiplier === 1) {
    return `${baseExpression.walkValue} (Walk Speed)${sourceSuffix}`;
  }

  if (baseExpression.multiplier === 0.5) {
    const expression = `${baseExpression.walkValue} (Walk Speed) / 2`;

    const formattedExpression =
      baseExpression.walkValue % 2 === 0 ? expression : `floor(${expression})`;

    return `${formattedExpression}${sourceSuffix}`;
  }

  return `${baseExpression.walkValue} (Walk Speed) x ${baseExpression.multiplier}${sourceSuffix}`;
}

function formatMovementFormula(
  movement: ReturnType<typeof getMovementSpeedBreakdownsForCharacter>["walk"]
): string {
  if (movement.total === null) {
    return "-";
  }

  const terms: string[] =
    movement.baseExpression.kind === "none" && movement.entries.length > 0
      ? []
      : [formatMovementBaseFormula(movement.baseExpression)];

  movement.entries.forEach((entry, index) => {
    const isFirstVisibleTerm = terms.length === 0 && index === 0;

    terms.push(
      `${!isFirstVisibleTerm && entry.value >= 0 ? "+" : ""}${entry.value} ${entry.label}`
    );
  });

  return `${movement.total} ft = ${terms.join(" ")}`;
}

function formatJumpDistanceFormula(jump: JumpDistanceBreakdown): string {
  const sourceSuffix = jump.sourceLabel ? ` (${jump.sourceLabel})` : "";

  if (jump.type === "high") {
    return `${jump.total} ft = 3 (Base) ${formatAbilityModifier(jump.abilityValue)} ${jump.ability}${sourceSuffix}`;
  }

  return `${jump.total} ft = ${jump.abilityValue} ${jump.ability} Score${sourceSuffix}`;
}

function formatInitiativeFormula(
  total: number,
  entries: Array<{ label: string; value: number }>
): string {
  const terms = entries.map(
    (entry) => `${entry.value >= 0 ? "+" : ""}${entry.value} ${entry.label}`
  );

  return `${formatAbilityModifier(total)} Initiative = ${terms.join(" ")}`;
}

function formatAbilityModifierFormula(
  ability: AbilityKey,
  score: number,
  baseValue: number,
  bonusEntries: AbilityModifierBonusEntry[] = []
): string {
  const terms = [
    `floor((${score} ${ability} - 10) / 2)`,
    ...bonusEntries.map((entry) => `${entry.value >= 0 ? "+" : "-"} ${Math.abs(entry.value)} ${entry.label}`)
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
  const terms = [`${abilityModifierBaseValue >= 0 ? "+" : ""}${abilityModifierBaseValue} ${ability}`];

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

function getInitiativeDescriptionAdditions(character: Character): SpellDescriptionEntry[][] {
  return getInitiativeReferenceDescriptionAdditions(character);
}

function getStrengthDescriptionAdditions(character: Character): SpellDescriptionEntry[][] {
  const indomitableMightDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.INDOMITABLE_MIGHT
  );

  return indomitableMightDescription.length > 0
    ? [createSourcedDescriptionEntries("Indomitable Might", indomitableMightDescription)]
    : [];
}

function getFanaticalFocusDescriptionAdditions(character: Character): SpellDescriptionEntry[][] {
  const fanaticalFocusDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.FANATICAL_FOCUS
  );

  return fanaticalFocusDescription.length > 0
    ? [createSourcedDescriptionEntries("Fanatical Focus", fanaticalFocusDescription)]
    : [];
}

function getLeadingEvasionDescriptionAdditions(character: Character): SpellDescriptionEntry[][] {
  const leadingEvasionDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.LEADING_EVASION
  );

  return leadingEvasionDescription.length > 0
    ? [createSourcedDescriptionEntries("Leading Evasion", leadingEvasionDescription)]
    : [];
}

function getSpeedDescriptionAdditions(character: Character): SpellDescriptionEntry[][] {
  const acrobaticMovementDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.ACROBATIC_MOVEMENT
  );

  return acrobaticMovementDescription.length > 0
    ? [createSourcedDescriptionEntries("Acrobatic Movement", acrobaticMovementDescription)]
    : [];
}

function getEvasionDescriptionAdditions(character: Character): SpellDescriptionEntry[][] {
  const evasionDescription = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.EVASION);

  return evasionDescription.length > 0
    ? [createSourcedDescriptionEntries("Evasion", evasionDescription)]
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

  return descriptionAdditions.length > 0 ? descriptionAdditions : undefined;
}

function buildReferenceIndicatorSections(
  sections: Array<{
    label?: string;
    indicators?: FeatureIndicator[];
  }>
): ReferenceIndicatorSection[] | undefined {
  const normalizedSections = sections.flatMap((section) =>
    section.indicators && section.indicators.length > 0
      ? [
          {
            label: section.label,
            indicators: section.indicators
          }
        ]
      : []
  );

  return normalizedSections.length > 0 ? normalizedSections : undefined;
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

function formatDieValue(die: string | null): string | null {
  return die ? String(die).toLowerCase() : null;
}

function CharacterStatsForm({ character, className, onPersistCharacter }: CharacterStatsFormProps) {
  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
  const [abilitiesDraft, setAbilitiesDraft] = useState<AbilitiesDraft>(() =>
    createAbilitiesDraft(character)
  );
  const [selectedStatReference, setSelectedStatReference] = useState<SelectedStatReference | null>(
    null
  );
  const [useUncannyMetabolismOnInitiative, setUseUncannyMetabolismOnInitiative] = useState(false);
  const [usePersistentRageOnInitiative, setUsePersistentRageOnInitiative] = useState(false);
  const [useTandemFootworkOnInitiative, setUseTandemFootworkOnInitiative] = useState(false);
  const [isDiceRollerSettingsOpen, setIsDiceRollerSettingsOpen] = useState(false);
  const [isIndomitableSaveSelected, setIsIndomitableSaveSelected] = useState(false);
  const [isDisciplinedSurvivorSaveSelected, setIsDisciplinedSurvivorSaveSelected] =
    useState(false);
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
  const persistentRageUsesTotal = getBarbarianPersistentRageUsesTotalForCharacter(character);
  const persistentRageUsesRemaining =
    getBarbarianPersistentRageUsesRemainingForCharacter(character);
  const hasPersistentRage = persistentRageUsesTotal > 0;
  const uncannyMetabolismUsesTotal =
    getMonkUncannyMetabolismUsesTotalForCharacter(character);
  const uncannyMetabolismUsesRemaining =
    getMonkUncannyMetabolismUsesRemainingForCharacter(character);
  const hasUncannyMetabolism = uncannyMetabolismUsesTotal > 0;
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
  const hasAcrobaticMovement =
    getFeatureDescriptionForCharacter(character, CLASS_FEATURE.ACROBATIC_MOVEMENT).length > 0;
  const hasEvasion = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.EVASION).length > 0;
  const hasTandemFootwork =
    character.className === "Bard" &&
    character.subclassId === "bard-college-of-dance" &&
    character.level >= 6;
  const bardicInspirationDie = getBardicInspirationDieForCharacter(character);
  const bardicInspirationUsesRemaining = getBardicInspirationUsesRemainingForCharacter(character);
  const tandemFootworkAvailable =
    hasTandemFootwork && bardicInspirationDie !== null && bardicInspirationUsesRemaining > 0;
  const pointBuyRemaining =
    abilitiesDraft.attributeMode === "pointBuy"
      ? getPointBuyRemaining(abilitiesDraft.abilities)
      : null;
  const proficiencyBonus = getProficiencyBonus(character.level);
  const effectiveAbilities = getAbilityScoresForCharacter(character);
  const armorClassResolution = getArmorClassResolutionForCharacter(character);
  const armorClassBreakdown = armorClassResolution.activeFormula.breakdown;
  const paladinAuraOfProtectionBonus = hasActivePaladinAuraOfProtectionForCharacter(character)
    ? Math.max(1, getAbilityModifierBreakdownForCharacter(character, "CHA").total)
    : 0;
  const displayedCoreStats: CoreStats = {
    ...(character.coreStats ?? createDefaultCoreStats()),
    armorClass: String(armorClassBreakdown.total),
    initiative: formatAbilityModifier(getInitiativeForCharacter(character)),
    speed: `${getSpeedForCharacter(character)} ft`,
    passivePerception: String(getPassivePerceptionForCharacter(character)),
    proficiencyBonus: formatAbilityModifier(proficiencyBonus),
    hitDice: getHitDiceDisplayForCharacter(character)
  };
  const coreStatIndicators = getCoreStatIndicatorsForCharacter(character);
  const abilityCheckIndicators = getAbilityCheckIndicatorsForCharacter(character);
  const savingThrowIndicators = getSavingThrowIndicatorsForCharacter(character);
  const speedBreakdown = getSpeedBreakdownForCharacter(character);
  const movementSpeedBreakdowns = getMovementSpeedBreakdownsForCharacter(character);
  const jumpDistanceBreakdowns = getJumpDistanceBreakdownsForCharacter(character);
  const hasModifiedSpecialMovement = hasModifiedSpecialMovementForCharacter(character);
  const characterCanHover = canCharacterHover(character);
  const initiativeBreakdown = getInitiativeBreakdownForCharacter(character);
  const monkMartialArtsDie = getMonkMartialArtsDieForCharacter(character);
  const barbarianRageDamageBonus = getBarbarianRageDamageBonusForCharacter(character);
  const fighterBattleMasterSuperiorityDie =
    getFighterBattleMasterSuperiorityDieForCharacter(character);
  const fighterBattleMasterSuperiorityDiceTotal =
    getFighterBattleMasterSuperiorityDiceTotalForCharacter(character);
  const fighterBattleMasterSuperiorityDiceRemaining =
    getFighterBattleMasterSuperiorityDiceRemainingForCharacter(character);
  const fighterIndomitableUsesTotal = getFighterIndomitableUsesTotalForCharacter(character);
  const fighterIndomitableUsesRemaining = getFighterIndomitableUsesRemainingForCharacter(character);
  const fighterPsiWarriorEnergyDie = getFighterPsiWarriorEnergyDieForCharacter(character);
  const fighterPsiWarriorEnergyDiceTotal =
    getFighterPsiWarriorEnergyDiceTotalForCharacter(character);
  const fighterPsiWarriorEnergyDiceRemaining =
    getFighterPsiWarriorEnergyDiceRemainingForCharacter(character);
  const rogueSoulknifePsionicDie = getRogueSoulknifePsionicDieForCharacter(character);
  const rogueSoulknifePsionicDiceTotal = getRogueSoulknifePsionicDiceTotalForCharacter(character);
  const rogueSoulknifePsionicDiceRemaining =
    getRogueSoulknifePsionicDiceRemainingForCharacter(character);
  const rogueSneakAttackDiceCount = getRogueSneakAttackDiceCountForCharacter(character);
  const rogueSneakAttackFormula = getRogueSneakAttackFormulaForCharacter(character);
  const hasThiefsReflexes = hasRogueThiefThiefsReflexesForCharacter(character);
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
      savingThrowBoostIconLabel:
        ability === "DEX" && hasEvasion ? "Evasion active" : undefined,
      modifierIndicators,
      modifierRollState,
      savingThrowIndicators: saveIndicators,
      savingThrowRollState,
      sharedRollState
    };
  });

  const baseCoreStatCards = coreStatFields.map((field) => {
    let detailValue: string | undefined;

    if (field.label === "Initiative") {
      detailValue = formatInitiativeFormula(initiativeBreakdown.total, initiativeBreakdown.entries);
    } else if (field.label === "Speed") {
      detailValue = formatMovementFormula(speedBreakdown);
    }

    return {
      key: String(field.key),
      label: field.label,
      value: displayedCoreStats[field.key],
      showBoostIcon:
        field.label === "Speed" && (hasModifiedSpecialMovement || hasAcrobaticMovement),
      indicators: coreStatIndicators[field.key],
      summaryText: getKeywordDescription(field.label) ?? undefined,
      detailCards:
        field.label === "Speed"
          ? [
              {
                label: "WALK FORMULA (default)",
                value: formatMovementFormula(movementSpeedBreakdowns.walk),
                variant: "formula"
              },
              {
                label: "CLIMB FORMULA",
                value: formatMovementFormula(movementSpeedBreakdowns.climb),
                variant: "formula"
              },
              {
                label: "SWIM FORMULA",
                value: formatMovementFormula(movementSpeedBreakdowns.swim),
                variant: "formula"
              },
              {
                label: "FLY FORMULA",
                value: formatMovementFormula(movementSpeedBreakdowns.fly),
                variant: "formula"
              },
              {
                label: "BURROW FORMULA",
                value: formatMovementFormula(movementSpeedBreakdowns.burrow),
                variant: "formula"
              },
              {
                label: "LONG JUMP FORMULA",
                value: formatJumpDistanceFormula(jumpDistanceBreakdowns.longJump),
                breakdown: "[requires 10 ft running start]",
                variant: "formula"
              },
              {
                label: "HIGH JUMP FORMULA",
                value: formatJumpDistanceFormula(jumpDistanceBreakdowns.highJump),
                breakdown: "[requires 10 ft running start]",
                variant: "formula"
              },
              {
                label: "Hover",
                value: characterCanHover ? "Yes" : "No"
              }
            ]
          : field.label === "Armor Class"
            ? getArmorClassReferenceDetailCards(armorClassResolution)
            : detailValue
              ? [
                  {
                    label: "Formula",
                    value: detailValue,
                    variant: "formula"
                  }
                ]
              : undefined
    } satisfies CoreStatCard;
  });

  const additionalCoreStatCards: CoreStatCard[] = [];

  if (barbarianRageDamageBonus > 0) {
    additionalCoreStatCards.push({
      key: "barbarian-rage-damage",
      label: "Rage Damage",
      value: formatAbilityModifier(barbarianRageDamageBonus),
      summaryText:
        "Your current Rage Damage bonus. While Rage is active, Strength-based weapon and Unarmed Strike damage rolls gain this bonus. Rage Damage progresses from +2 at levels 1-8 to +3 at levels 9-15 and +4 at levels 16-20.",
      detailCards: [
        {
          label: "Current Bonus",
          value: formatAbilityModifier(barbarianRageDamageBonus)
        }
      ]
    });
  }

  if (monkMartialArtsDie) {
    additionalCoreStatCards.push({
      key: "martial-arts-die",
      label: "Martial Arts Die",
      value: formatDieValue(monkMartialArtsDie) ?? "-",
      summaryText:
        "Your current Martial Arts die. When Martial Arts applies, your Unarmed Strike and Monk weapons can use this die in place of their normal damage die if it is higher.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(monkMartialArtsDie) ?? "-"
        },
        {
          label: "Progression",
          value: "d6 at 1, d8 at 5, d10 at 11, d12 at 17"
        }
      ]
    });
  }

  if (bardicInspirationDie) {
    additionalCoreStatCards.push({
      key: "bardic-inspiration-die",
      label: "Bardic Die",
      value: formatDieValue(bardicInspirationDie) ?? "-",
      summaryText:
        "Your current Bardic Inspiration die. Creatures inspired by you roll this die when they spend a Bardic Inspiration use.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(bardicInspirationDie) ?? "-"
        },
        {
          label: "Progression",
          value: "d6 at 1, d8 at 5, d10 at 10, d12 at 15"
        }
      ]
    });
  }

  if (fighterBattleMasterSuperiorityDie && fighterBattleMasterSuperiorityDiceTotal > 0) {
    additionalCoreStatCards.push({
      key: "fighter-battle-master-superiority-dice",
      label: "Superiority Dice",
      value: formatDieValue(fighterBattleMasterSuperiorityDie) ?? "-",
      summaryText:
        "Your current Battle Master Superiority Dice pool. Maneuvers expend these dice, and you regain all expended Superiority Dice when you finish a Short Rest or Long Rest.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(fighterBattleMasterSuperiorityDie) ?? "-"
        },
        {
          label: "Current Dice",
          value: `${fighterBattleMasterSuperiorityDiceRemaining}/${fighterBattleMasterSuperiorityDiceTotal}`
        },
        {
          label: "Recovery",
          value: "Restore all expended dice on Short Rest or Long Rest"
        },
        {
          label: "Progression",
          value: "4 dice at 3, 5 dice at 7, 6 dice at 15 | d8 at 3, d10 at 10, d12 at 18"
        }
      ]
    });
  }

  if (fighterPsiWarriorEnergyDie && fighterPsiWarriorEnergyDiceTotal > 0) {
    additionalCoreStatCards.push({
      key: "fighter-psi-warrior-energy-dice",
      label: "Psi Energy Dice",
      value: formatDieValue(fighterPsiWarriorEnergyDie) ?? "-",
      summaryText:
        "Your current Psi Warrior Energy Die. Psionic powers expend these dice, and you regain one expended die on a Short Rest and all expended dice on a Long Rest.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(fighterPsiWarriorEnergyDie) ?? "-"
        },
        {
          label: "Current Dice",
          value: `${fighterPsiWarriorEnergyDiceRemaining}/${fighterPsiWarriorEnergyDiceTotal}`
        },
        {
          label: "Recovery",
          value: "Restore 1 die on Short Rest | Restore all dice on Long Rest"
        },
        {
          label: "Progression",
          value: "4d6 at 3, 6d8 at 5, 8d8 at 9, 8d10 at 11, 10d10 at 13, 12d12 at 17"
        }
      ]
    });
  }

  if (rogueSoulknifePsionicDie && rogueSoulknifePsionicDiceTotal > 0) {
    additionalCoreStatCards.push({
      key: "rogue-soulknife-psionic-die",
      label: "Psionic Die",
      value: formatDieValue(rogueSoulknifePsionicDie) ?? "-",
      summaryText:
        "Your current Soulknife Psionic Die. Soulknife powers spend this pool, and you regain one expended die on a Short Rest and all expended dice on a Long Rest.",
      detailCards: [
        {
          label: "Current Die",
          value: formatDieValue(rogueSoulknifePsionicDie) ?? "-"
        },
        {
          label: "Current Dice",
          value: `${rogueSoulknifePsionicDiceRemaining}/${rogueSoulknifePsionicDiceTotal}`
        },
        {
          label: "Recovery",
          value: "Restore 1 die on Short Rest | Restore all dice on Long Rest"
        },
        {
          label: "Progression",
          value: "4d6 at 3, 6d8 at 5, 8d8 at 9, 8d10 at 11, 10d10 at 13, 12d12 at 17"
        }
      ]
    });
  }

  if (rogueSneakAttackDiceCount > 0 && rogueSneakAttackFormula) {
    additionalCoreStatCards.push({
      key: "rogue-sneak-attack",
      label: "Sneak Attack",
      value: rogueSneakAttackFormula,
      summaryText:
        "Your current Sneak Attack damage. You can apply it once per turn after a hit when Sneak Attack's requirements are met.",
      detailCards: [
        {
          label: "Current Dice",
          value: rogueSneakAttackFormula
        },
        {
          label: "Progression",
          value:
            "1d6 at 1, 2d6 at 3, 3d6 at 5, 4d6 at 7, 5d6 at 9, 6d6 at 11, 7d6 at 13, 8d6 at 15, 9d6 at 17, 10d6 at 19"
        }
      ]
    });
  }

  const coreStatCards: CoreStatCard[] = [...additionalCoreStatCards, ...baseCoreStatCards];
  const resolvedSelectedStatReference =
    selectedStatReference?.keyword === "Armor Class"
      ? {
          ...selectedStatReference,
          detailCards: getArmorClassReferenceDetailCards(armorClassResolution),
          warning: armorClassResolution.warning
        }
      : selectedStatReference;
  const selectedAbilityReferenceKey =
    abilityKeys.find((ability) => ability === resolvedSelectedStatReference?.keyword) ?? null;
  const indomitableSaveBonus = Math.max(1, Math.floor(character.level));
  const canUseIndomitableOnSelectedSave =
    selectedAbilityReferenceKey !== null && fighterIndomitableUsesTotal > 0;
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
  }, [resolvedSelectedStatReference?.keyword]);

  useEffect(() => {
    if (!disciplinedSurvivorSaveState || disciplinedSurvivorSaveState.disabled) {
      setIsDisciplinedSurvivorSaveSelected(false);
    }
  }, [disciplinedSurvivorSaveState]);

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
    const totalModifier = saveRoll.modifier + (usesIndomitable ? indomitableSaveBonus : 0);
    const rollFormula = formatD20Formula(totalModifier);
    const titleSuffixes = [
      ...(usesIndomitable ? ["Indomitable"] : []),
      ...(usesDisciplinedSurvivor ? ["Discipline Survivor"] : [])
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

    openDiceRoller({
      title,
      formula: rollFormula,
      formulaDisplay: rollFormula,
      description: descriptionParts.join(" "),
      mode: getRollModeFromIndicators(saveRoll.indicators)
    });
  }

  function selectArmorClassFormula(formulaKey: string) {
    onPersistCharacter((currentCharacter) =>
      setArmorClassFormulaSelectionForCharacter(currentCharacter, formulaKey)
    );
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

    const descriptionAdditions =
      card.label === "Initiative"
        ? (() => {
            const additions = getInitiativeDescriptionAdditions(character);
            return additions.length > 0 ? additions : undefined;
          })()
        : card.label === "Speed"
          ? (() => {
              const additions = getSpeedDescriptionAdditions(character);
              return additions.length > 0 ? additions : undefined;
            })()
        : undefined;

    setSelectedStatReference({
      keyword: card.label,
      rollIndicators: card.indicators,
      summaryText: card.summaryText,
      descriptionAdditions,
      indicatorSections: buildReferenceIndicatorSections([
        {
          indicators: card.indicators
        }
      ]),
      detailCards: card.detailCards
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

  function renderCoreStatsSection() {
    return (
      <section className={styles.statsGroup}>
        <div className={styles.statsGroupHeader}>
          <h3 className={styles.statsGroupTitle}>Core Stats</h3>
        </div>
        <div
          className={clsx(
            styles.modifierGrid,
            coreStatCards.length >= 7 && styles.coreStatGridWide
          )}
        >
          {coreStatCards.map((card) => {
            const rollState = resolveFeatureIndicators(card.indicators);

            return (
              <button
                key={card.key}
                type="button"
                className={clsx(styles.modifierCard, styles.modifierCardButton)}
                onClick={() => openCoreStatReference(card)}
              >
                <div className={styles.modifierLabelRow}>
                  <span className={clsx(styles.modifierLabel, styles.coreStatLabel)}>
                    {card.label}
                  </span>
                  {rollState ? (
                    <RollStatePill tone={rollState.tone} label={rollState.label} />
                  ) : null}
                </div>
                <strong className={styles.coreStatValueRow}>
                  <span>{card.value}</span>
                  {card.showBoostIcon ? (
                    <ChevronsUp size={18} className={styles.coreStatValueIcon} aria-hidden="true" />
                  ) : null}
                </strong>
              </button>
            );
          })}
        </div>
      </section>
    );
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
              <button
                key={card.ability}
                type="button"
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
                          aria-label={card.savingThrowBoostIconLabel ?? "Saving throw feature boost active"}
                        />
                      ) : null}
                    </span>
                  </span>
                </div>
              </button>
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
        {renderCoreStatsSection()}
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
            ) : resolvedSelectedStatReference.keyword === "Armor Class" &&
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
          onClose={closeSelectedStatReference}
        />
      ) : null}
      {diceRollerPopup}
    </article>
  );
}

export default CharacterStatsForm;
