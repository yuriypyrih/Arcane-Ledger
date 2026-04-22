import type { DICE } from "../../../../codex/entries";
import type { RollMode } from "../../../../types";
import type { InitiativeBreakdown } from "../../../../pages/CharactersPage/gameplay";
import { formatAbilityModifier } from "../../../../pages/CharactersPage/gameplay";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { applyRolledHealingToCharacter } from "../GameplayForm/gameplayStateUtils";
import type {
  DiceRollerRequest,
  DiceRollerResolvedResult
} from "../../../DicePage/DiceRollerPopup";
import {
  applyArchdruidOnInitiativeForCharacter,
  applyMonkUncannyMetabolismOnInitiativeForCharacter,
  applyPerfectFocusOnInitiativeForCharacter,
  applyPersistentRageOnInitiativeForCharacter,
  applySuperiorInspirationOnInitiativeForCharacter,
  expendBardicInspirationUseForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import type { Character } from "../../../../types";
import { formatRollResultTotal } from "../../../../utils/dice";

type InitiativeCharacterEffectOptions = {
  usePersistentRageOnInitiative: boolean;
  useTandemFootworkOnInitiative: boolean;
  useUncannyMetabolismOnInitiative: boolean;
  tandemFootworkAvailable: boolean;
};

type InitiativeRollRequestOptions = InitiativeCharacterEffectOptions & {
  initiativeBreakdown: InitiativeBreakdown;
  bardicInspirationDie: DICE | null;
  monkMartialArtsDie: DICE | null;
  characterLevel: number;
  onPersistCharacter: PersistCharacterUpdater;
  rollMode?: RollMode;
};

const initiativeLabel = "Initiative";
const uncannyMetabolishLabel = "Uncanny Metabolish:";

function formatInitiativeFormula(initiativeBreakdown: InitiativeBreakdown): string {
  const terms = initiativeBreakdown.entries.map(
    (entry) => `${entry.value >= 0 ? "+" : ""}${entry.value} ${entry.label}`
  );

  return `${formatAbilityModifier(initiativeBreakdown.total)} Initiative = ${terms.join(" ")}`;
}

function formatD20Formula(modifier: number): string {
  if (modifier === 0) {
    return "1d20";
  }

  return `1d20 ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
}

function formatDieFormula(die: DICE): string {
  return `1${String(die).toLowerCase()}`;
}

function formatDualRollToast(resolvedResult: DiceRollerResolvedResult): string {
  const parts = resolvedResult.results.map(
    (entry) => `${entry.label?.trim() || "Roll"} ${formatRollResultTotal(entry.result)}`
  );

  return `Action Used: ${parts.join(" | ")}`;
}

export function applyInitiativeRollCharacterEffects(
  currentCharacter: Character,
  options: InitiativeCharacterEffectOptions
): Character {
  let nextCharacter = applySuperiorInspirationOnInitiativeForCharacter(currentCharacter);
  nextCharacter = applyArchdruidOnInitiativeForCharacter(nextCharacter);

  if (options.useUncannyMetabolismOnInitiative) {
    nextCharacter = applyMonkUncannyMetabolismOnInitiativeForCharacter(nextCharacter);
  } else {
    nextCharacter = applyPerfectFocusOnInitiativeForCharacter(nextCharacter);
  }

  if (options.usePersistentRageOnInitiative) {
    nextCharacter = applyPersistentRageOnInitiativeForCharacter(nextCharacter);
  }

  if (options.useTandemFootworkOnInitiative && options.tandemFootworkAvailable) {
    nextCharacter = expendBardicInspirationUseForCharacter(nextCharacter);
  }

  return nextCharacter;
}

export function createInitiativeRollRequest(
  options: InitiativeRollRequestOptions
): DiceRollerRequest {
  const initiativeFormulaDescription = formatInitiativeFormula(options.initiativeBreakdown);
  const tandemFootworkFormula =
    options.useTandemFootworkOnInitiative && options.bardicInspirationDie
      ? formatDieFormula(options.bardicInspirationDie)
      : null;
  const initiativeRollFormula = tandemFootworkFormula
    ? `${formatD20Formula(options.initiativeBreakdown.total)} + ${tandemFootworkFormula}`
    : formatD20Formula(options.initiativeBreakdown.total);
  const initiativeDescription = tandemFootworkFormula
    ? `${initiativeFormulaDescription}. Tandem Footwork adds ${tandemFootworkFormula}.`
    : initiativeFormulaDescription;

  if (!options.useUncannyMetabolismOnInitiative || !options.monkMartialArtsDie) {
    return {
      title: initiativeLabel,
      formula: initiativeRollFormula,
      formulaDisplay: initiativeRollFormula,
      description: initiativeDescription,
      mode: options.rollMode
    };
  }

  const martialArtsFormula = formatDieFormula(options.monkMartialArtsDie);

  return {
    title: initiativeLabel,
    description: `${initiativeDescription}. Uncanny Metabolism restores all Focus Points and heals for your Monk level plus the Martial Arts die result.`,
    mode: options.rollMode,
    entries: [
      {
        label: initiativeLabel,
        formula: initiativeRollFormula,
        formulaDisplay: initiativeRollFormula
      },
      {
        label: uncannyMetabolishLabel,
        formula: `${martialArtsFormula} + ${options.characterLevel}`,
        formulaDisplay: `${martialArtsFormula} + ${options.characterLevel}`
      }
    ],
    getFullManualToastText: formatDualRollToast,
    onResolvedResult: (resolvedResult) => {
      const martialArtsResult = resolvedResult.results.find(
        (entry) => entry.label === uncannyMetabolishLabel
      );

      if (!martialArtsResult) {
        return;
      }

      options.onPersistCharacter((currentCharacter) =>
        applyRolledHealingToCharacter(currentCharacter, martialArtsResult.result.total)
      );
    }
  };
}
