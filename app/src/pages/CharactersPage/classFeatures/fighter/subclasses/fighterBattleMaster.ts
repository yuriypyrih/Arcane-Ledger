import type { BattleMasterManeuverId } from "../../../../../codex/subclasses/fighterBattleMaster";
import { fighterBattleMasterManeuverDefinitions } from "../../../../../codex/subclasses/fighterBattleMaster";
import type { Character, CharacterFighterFeatureState } from "../../../../../types";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";

export const battleMasterSubclassId = "fighter-battle-master";

type BattleMasterCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "subclassId" | "classFeatureState">>;

const fighterBattleMasterManeuverIds = fighterBattleMasterManeuverDefinitions.map(
  (maneuver) => maneuver.id
);
const fighterBattleMasterManeuverIdSet = new Set<BattleMasterManeuverId>(
  fighterBattleMasterManeuverIds
);

function hasFighterBattleMasterFeature(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  minimumLevel: number
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === battleMasterSubclassId &&
    (character.level ?? 0) >= minimumLevel
  );
}

function getBattleMasterStateRecord(
  value: Partial<CharacterFighterFeatureState> | undefined
): Partial<CharacterFighterFeatureState> {
  return value && typeof value === "object" ? value : {};
}

export function hasFighterBattleMasterCombatSuperiority(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasFighterBattleMasterFeature(character, 3);
}

export function getFighterBattleMasterSuperiorityDiceTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (!hasFighterBattleMasterCombatSuperiority(character)) {
    return 0;
  }

  if ((character.level ?? 0) >= 15) {
    return 6;
  }

  if ((character.level ?? 0) >= 7) {
    return 5;
  }

  return 4;
}

export function getFighterBattleMasterSuperiorityDie(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): "d8" | "d10" | "d12" | null {
  if (!hasFighterBattleMasterCombatSuperiority(character)) {
    return null;
  }

  if ((character.level ?? 0) >= 18) {
    return "d12";
  }

  if ((character.level ?? 0) >= 10) {
    return "d10";
  }

  return "d8";
}

export function getFighterBattleMasterManeuverSelectionCount(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (!hasFighterBattleMasterCombatSuperiority(character)) {
    return 0;
  }

  if ((character.level ?? 0) >= 15) {
    return 9;
  }

  if ((character.level ?? 0) >= 10) {
    return 7;
  }

  if ((character.level ?? 0) >= 7) {
    return 5;
  }

  return 3;
}

function normalizeFighterBattleMasterManeuverSelections(
  value: unknown,
  limit: number
): BattleMasterManeuverId[] {
  if (!Array.isArray(value) || limit <= 0) {
    return [];
  }

  const selectedIds = new Set<BattleMasterManeuverId>();

  value.forEach((entry) => {
    if (
      typeof entry === "string" &&
      fighterBattleMasterManeuverIdSet.has(entry as BattleMasterManeuverId)
    ) {
      selectedIds.add(entry as BattleMasterManeuverId);
    }
  });

  return fighterBattleMasterManeuverIds.filter((maneuverId) => selectedIds.has(maneuverId)).slice(0, limit);
}

export function normalizeFighterBattleMasterFeatureState(
  value: Partial<CharacterFighterFeatureState>,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Pick<
  CharacterFighterFeatureState,
  "battleMasterSuperiorityDiceExpended" | "battleMasterManeuverIds"
> {
  const totalDice = getFighterBattleMasterSuperiorityDiceTotal(character);
  const maneuverSelectionCount = getFighterBattleMasterManeuverSelectionCount(character);

  return {
    battleMasterSuperiorityDiceExpended:
      totalDice > 0
        ? Math.max(
            0,
            Math.min(
              totalDice,
              Number.isFinite(Number(value.battleMasterSuperiorityDiceExpended))
                ? Math.floor(Number(value.battleMasterSuperiorityDiceExpended))
                : 0
            )
          )
        : undefined,
    battleMasterManeuverIds:
      maneuverSelectionCount > 0
        ? normalizeFighterBattleMasterManeuverSelections(
            value.battleMasterManeuverIds,
            maneuverSelectionCount
          )
        : undefined
  };
}

export function getFighterBattleMasterSuperiorityDiceRemaining(
  character: BattleMasterCharacter
): number {
  const totalDice = getFighterBattleMasterSuperiorityDiceTotal(character);
  const diceExpended =
    normalizeFighterBattleMasterFeatureState(character.classFeatureState?.fighter ?? {}, character)
      .battleMasterSuperiorityDiceExpended ?? 0;

  return Math.max(0, totalDice - diceExpended);
}

export function getFighterBattleMasterManeuverSelections(
  character: BattleMasterCharacter
): BattleMasterManeuverId[] {
  const normalizedState = normalizeFighterBattleMasterFeatureState(
    character.classFeatureState?.fighter ?? {},
    character
  );

  return (normalizedState.battleMasterManeuverIds as BattleMasterManeuverId[] | undefined) ?? [];
}

export function setFighterBattleMasterManeuverSelections(
  character: Character,
  selections: string[]
): Character {
  const maneuverSelectionCount = getFighterBattleMasterManeuverSelectionCount(character);

  if (maneuverSelectionCount <= 0) {
    return character;
  }

  const fighterState = getBattleMasterStateRecord(character.classFeatureState?.fighter);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizeFighterBattleMasterFeatureState(fighterState, character),
        battleMasterManeuverIds: normalizeFighterBattleMasterManeuverSelections(
          selections,
          maneuverSelectionCount
        )
      }
    }
  };
}

export function expendFighterBattleMasterSuperiorityDie(character: Character): Character {
  const totalDice = getFighterBattleMasterSuperiorityDiceTotal(character);

  if (totalDice <= 0) {
    return character;
  }

  const fighterState = getBattleMasterStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterBattleMasterFeatureState(fighterState, character);
  const diceExpended = normalizedState.battleMasterSuperiorityDiceExpended ?? 0;

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
        battleMasterSuperiorityDiceExpended: diceExpended + 1
      }
    }
  };
}

export function restoreOneFighterBattleMasterSuperiorityDie(character: Character): Character {
  const totalDice = getFighterBattleMasterSuperiorityDiceTotal(character);

  if (totalDice <= 0) {
    return character;
  }

  const fighterState = getBattleMasterStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterBattleMasterFeatureState(fighterState, character);
  const diceExpended = normalizedState.battleMasterSuperiorityDiceExpended ?? 0;

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
        battleMasterSuperiorityDiceExpended: diceExpended - 1
      }
    }
  };
}

export function restoreAllFighterBattleMasterSuperiorityDice(character: Character): Character {
  const totalDice = getFighterBattleMasterSuperiorityDiceTotal(character);

  if (totalDice <= 0) {
    return character;
  }

  const fighterState = getBattleMasterStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterBattleMasterFeatureState(fighterState, character);

  if ((normalizedState.battleMasterSuperiorityDiceExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        battleMasterSuperiorityDiceExpended: 0
      }
    }
  };
}

export function restoreFighterBattleMasterSuperiorityDiceOnShortRest(
  character: Character
): Character {
  return restoreAllFighterBattleMasterSuperiorityDice(character);
}

export function restoreFighterBattleMasterSuperiorityDiceOnLongRest(
  character: Character
): Character {
  return restoreAllFighterBattleMasterSuperiorityDice(character);
}

export const getFighterBattleMasterDerivedFeatureState: SubclassRuntimeResolver = () => ({});
