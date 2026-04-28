import type { DICE } from "../../../../codex/entries";
import type { RollMode } from "../../../../types";
import type { InitiativeBreakdown } from "../../../../pages/CharactersPage/gameplay";
import { formatAbilityModifier } from "../../../../pages/CharactersPage/gameplay";
import { formatD20Formula } from "../../../../pages/CharactersPage/shared";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { applyRolledHealingToCharacter } from "../GameplayForm/gameplayStateUtils";
import type {
  DiceRollerRequest,
  DiceRollerResolvedResult
} from "../../../DicePage/DiceRollerPopup";
import {
  clearRoundScopedFeatureStateForCharacter,
  applyArchdruidOnInitiativeForCharacter,
  applyMonkUncannyMetabolismOnInitiativeForCharacter,
  applyPerfectFocusOnInitiativeForCharacter,
  applyPersistentRageOnInitiativeForCharacter,
  applySuperiorInspirationOnInitiativeForCharacter,
  expendBardicInspirationUseForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import { setRoundTrackerCombatState } from "../../../../pages/CharactersPage/combat";
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
  hasThiefsReflexes: boolean;
  characterLevel: number;
  onPersistCharacter: PersistCharacterUpdater;
  rollMode?: RollMode;
};

const initiativeLabel = "Initiative";
const thiefsReflexesLabel = "Thief's Reflexes";
const uncannyMetabolishLabel = "Uncanny Metabolish:";

function formatInitiativeFormula(initiativeBreakdown: InitiativeBreakdown): string {
  const terms = initiativeBreakdown.entries.map(
    (entry) => `${entry.value >= 0 ? "+" : ""}${entry.value} ${entry.label}`
  );

  return `${formatAbilityModifier(initiativeBreakdown.total)} Initiative = ${terms.join(" ")}`;
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

function appendInitiativeDescription(
  description: string,
  addition: string | null
): string {
  if (!addition) {
    return description;
  }

  return `${description}${description.endsWith(".") ? "" : "."} ${addition}`;
}

export function applyInitiativeRollCharacterEffects(
  currentCharacter: Character,
  options: InitiativeCharacterEffectOptions
): Character {
  let nextCharacter = clearRoundScopedFeatureStateForCharacter(currentCharacter);

  nextCharacter = applySuperiorInspirationOnInitiativeForCharacter(nextCharacter);
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

  return {
    ...nextCharacter,
    roundTracker: setRoundTrackerCombatState(nextCharacter.roundTracker, true)
  };
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
  const describedInitiative = appendInitiativeDescription(
    initiativeDescription,
    options.hasThiefsReflexes
      ? "Thief's Reflexes shows your second first-round turn at Initiative minus 10."
      : null
  );
  const initiativeEntry = {
    label: initiativeLabel,
    formula: initiativeRollFormula,
    formulaDisplay: initiativeRollFormula
  };
  const thiefsReflexesEntry = options.hasThiefsReflexes
    ? {
        label: thiefsReflexesLabel,
        formula: `${initiativeRollFormula} - 10`,
        formulaDisplay: "Initiative - 10",
        derivedResult: {
          sourceEntryIndex: 0,
          totalOffset: -10,
          breakdownLabel: initiativeLabel
        }
      }
    : null;

  if (!options.useUncannyMetabolismOnInitiative || !options.monkMartialArtsDie) {
    if (thiefsReflexesEntry) {
      return {
        title: initiativeLabel,
        description: describedInitiative,
        mode: options.rollMode,
        entries: [initiativeEntry, thiefsReflexesEntry],
        getFullManualToastText: formatDualRollToast
      };
    }

    return {
      title: initiativeLabel,
      formula: initiativeRollFormula,
      formulaDisplay: initiativeRollFormula,
      description: describedInitiative,
      mode: options.rollMode
    };
  }

  const martialArtsFormula = formatDieFormula(options.monkMartialArtsDie);

  return {
    title: initiativeLabel,
    description: appendInitiativeDescription(
      describedInitiative,
      "Uncanny Metabolism restores all Focus Points and heals for your Monk level plus the Martial Arts die result."
    ),
    mode: options.rollMode,
    entries: [
      initiativeEntry,
      ...(thiefsReflexesEntry ? [thiefsReflexesEntry] : []),
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
