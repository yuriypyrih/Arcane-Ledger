import type { Character, CharacterFighterFeatureState } from "../../../../../types";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";

export const psiWarriorSubclassId = "fighter-psi-warrior";

type PsiWarriorCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>;

function hasFighterPsiWarriorPsionicPower(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === psiWarriorSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function getPsiWarriorStateRecord(
  value: Partial<CharacterFighterFeatureState> | undefined
): Partial<CharacterFighterFeatureState> {
  return value && typeof value === "object" ? value : {};
}

export function getFighterPsiWarriorEnergyDiceTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (!hasFighterPsiWarriorPsionicPower(character)) {
    return 0;
  }

  if ((character.level ?? 0) >= 17) {
    return 12;
  }

  if ((character.level ?? 0) >= 13) {
    return 10;
  }

  if ((character.level ?? 0) >= 9) {
    return 8;
  }

  if ((character.level ?? 0) >= 5) {
    return 6;
  }

  return 4;
}

export function getFighterPsiWarriorEnergyDie(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): "d6" | "d8" | "d10" | "d12" | null {
  if (!hasFighterPsiWarriorPsionicPower(character)) {
    return null;
  }

  if ((character.level ?? 0) >= 17) {
    return "d12";
  }

  if ((character.level ?? 0) >= 11) {
    return "d10";
  }

  if ((character.level ?? 0) >= 5) {
    return "d8";
  }

  return "d6";
}

export function normalizeFighterPsiWarriorFeatureState(
  value: Partial<CharacterFighterFeatureState>,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Pick<CharacterFighterFeatureState, "psiWarriorEnergyDiceExpended"> {
  const totalDice = getFighterPsiWarriorEnergyDiceTotal(character);

  return {
    psiWarriorEnergyDiceExpended:
      totalDice > 0
        ? Math.max(
            0,
            Math.min(
              totalDice,
              Number.isFinite(Number(value.psiWarriorEnergyDiceExpended))
                ? Math.floor(Number(value.psiWarriorEnergyDiceExpended))
                : 0
            )
          )
        : undefined
  };
}

export function getFighterPsiWarriorEnergyDiceRemaining(
  character: PsiWarriorCharacter
): number {
  const totalDice = getFighterPsiWarriorEnergyDiceTotal(character);
  const diceExpended =
    normalizeFighterPsiWarriorFeatureState(
      getPsiWarriorStateRecord(character.classFeatureState?.fighter),
      character
    ).psiWarriorEnergyDiceExpended ?? 0;

  return Math.max(0, totalDice - diceExpended);
}

export function expendFighterPsiWarriorEnergyDie(character: Character): Character {
  const totalDice = getFighterPsiWarriorEnergyDiceTotal(character);

  if (totalDice <= 0) {
    return character;
  }

  const fighterState = getPsiWarriorStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterPsiWarriorFeatureState(fighterState, character);
  const diceExpended = normalizedState.psiWarriorEnergyDiceExpended ?? 0;

  if (diceExpended >= totalDice) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        psiWarriorEnergyDiceExpended: diceExpended + 1
      }
    }
  };
}

export function restoreFighterPsiWarriorEnergyDie(character: Character): Character {
  const totalDice = getFighterPsiWarriorEnergyDiceTotal(character);

  if (totalDice <= 0) {
    return character;
  }

  const fighterState = getPsiWarriorStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterPsiWarriorFeatureState(fighterState, character);
  const diceExpended = normalizedState.psiWarriorEnergyDiceExpended ?? 0;

  if (diceExpended <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        psiWarriorEnergyDiceExpended: diceExpended - 1
      }
    }
  };
}

export function restoreAllFighterPsiWarriorEnergyDice(character: Character): Character {
  const totalDice = getFighterPsiWarriorEnergyDiceTotal(character);

  if (totalDice <= 0) {
    return character;
  }

  const fighterState = getPsiWarriorStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterPsiWarriorFeatureState(fighterState, character);

  if ((normalizedState.psiWarriorEnergyDiceExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        psiWarriorEnergyDiceExpended: 0
      }
    }
  };
}

export function restoreFighterPsiWarriorEnergyDiceOnShortRest(character: Character): Character {
  return restoreFighterPsiWarriorEnergyDie(character);
}

export function restoreFighterPsiWarriorEnergyDiceOnLongRest(character: Character): Character {
  return restoreAllFighterPsiWarriorEnergyDice(character);
}

export const getFighterPsiWarriorDerivedFeatureState: SubclassRuntimeResolver = () => ({});
