import { CLASS_FEATURE } from "../../../../../codex/entries";
import type { SpellDescriptionEntry } from "../../../../../codex/entries";
import type { BattleMasterManeuverId } from "../../../../../codex/subclasses/fighterBattleMaster";
import {
  fighterBattleMasterManeuverDefinitions,
  getFighterBattleMasterManeuverReferenceKey
} from "../../../../../codex/subclasses/fighterBattleMaster";
import type { Character, CharacterFighterFeatureState } from "../../../../../types";
import { createSourcedDescriptionEntries } from "../../../actionModalDescriptions";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { getAbilityModifier, getProficiencyBonus } from "../../../gameplay";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type { FeatureActionCard, FeatureActionFact } from "../../types";

export const battleMasterSubclassId = "fighter-battle-master";

type BattleMasterCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState" | "feats">>;

const fighterBattleMasterManeuverIds = fighterBattleMasterManeuverDefinitions.map(
  (maneuver) => maneuver.id
);
const fighterBattleMasterManeuverIdSet = new Set<BattleMasterManeuverId>(
  fighterBattleMasterManeuverIds
);
const fighterBattleMasterManeuverDefinitionsById = new Map(
  fighterBattleMasterManeuverDefinitions.map((maneuver) => [maneuver.id, maneuver])
);
export const fighterBattleMasterCombatSuperiorityActionKey =
  "fighter-battle-master-combat-superiority";
export const fighterBattleMasterKnowYourEnemyActionKey = "fighter-battle-master-know-your-enemy";
const combatSuperiorityDrawerDescription: SpellDescriptionEntry =
  "Your experience on the battlefield has refined your fighting techniques. You learn maneuvers that are fueled by special dice called Superiority Dice. Many maneuvers enhance an attack in some way, and you can use only one maneuver per attack. If a maneuver requires a saving throw, the DC equals 8 plus your Strength or Dexterity modifier (your choice) and Proficiency Bonus. The functionality of maneuvers are not being Tracked, and so if a maneuver requires you to use an Action you have to adjust your resources manually.";

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

export function hasFighterBattleMasterKnowYourEnemy(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasFighterBattleMasterFeature(character, 7);
}

function hasFighterBattleMasterRelentless(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasFighterBattleMasterFeature(character, 15);
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

  return fighterBattleMasterManeuverIds
    .filter((maneuverId) => selectedIds.has(maneuverId))
    .slice(0, limit);
}

export function normalizeFighterBattleMasterFeatureState(
  value: Partial<CharacterFighterFeatureState>,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Pick<
  CharacterFighterFeatureState,
  | "battleMasterSuperiorityDiceExpended"
  | "battleMasterManeuverIds"
  | "battleMasterCombatSuperiorityUsedThisTurn"
  | "battleMasterKnowYourEnemyUsesExpended"
> {
  const totalDice = getFighterBattleMasterSuperiorityDiceTotal(character);
  const maneuverSelectionCount = getFighterBattleMasterManeuverSelectionCount(character);
  const knowYourEnemyUsesTotal = hasFighterBattleMasterKnowYourEnemy(character) ? 1 : 0;

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
        : undefined,
    battleMasterCombatSuperiorityUsedThisTurn:
      totalDice > 0 ? value.battleMasterCombatSuperiorityUsedThisTurn === true : undefined,
    battleMasterKnowYourEnemyUsesExpended:
      knowYourEnemyUsesTotal > 0
        ? Math.max(
            0,
            Math.min(
              knowYourEnemyUsesTotal,
              Number.isFinite(Number(value.battleMasterKnowYourEnemyUsesExpended))
                ? Math.floor(Number(value.battleMasterKnowYourEnemyUsesExpended))
                : 0
            )
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

export function getFighterBattleMasterCombatSuperiorityUsedThisTurn(
  character: BattleMasterCharacter
): boolean {
  return (
    normalizeFighterBattleMasterFeatureState(character.classFeatureState?.fighter ?? {}, character)
      .battleMasterCombatSuperiorityUsedThisTurn === true
  );
}

export function getFighterBattleMasterKnowYourEnemyUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasFighterBattleMasterKnowYourEnemy(character) ? 1 : 0;
}

export function getFighterBattleMasterKnowYourEnemyUsesRemaining(
  character: BattleMasterCharacter
): number {
  const totalUses = getFighterBattleMasterKnowYourEnemyUsesTotal(character);
  const usesExpended =
    normalizeFighterBattleMasterFeatureState(character.classFeatureState?.fighter ?? {}, character)
      .battleMasterKnowYourEnemyUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
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

export function markFighterBattleMasterCombatSuperiorityUsed(character: Character): Character {
  if (!hasFighterBattleMasterCombatSuperiority(character)) {
    return character;
  }

  const fighterState = getBattleMasterStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterBattleMasterFeatureState(fighterState, character);

  if (normalizedState.battleMasterCombatSuperiorityUsedThisTurn === true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        battleMasterCombatSuperiorityUsedThisTurn: true
      }
    }
  };
}

export function consumeFighterBattleMasterKnowYourEnemy(character: Character): Character {
  if (!hasFighterBattleMasterKnowYourEnemy(character)) {
    return character;
  }

  const fighterState = getBattleMasterStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterBattleMasterFeatureState(fighterState, character);
  const usesRemaining = getFighterBattleMasterKnowYourEnemyUsesRemaining(character);

  if (usesRemaining > 0) {
    const usesExpended = normalizedState.battleMasterKnowYourEnemyUsesExpended ?? 0;

    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        fighter: {
          ...fighterState,
          ...normalizedState,
          battleMasterKnowYourEnemyUsesExpended: usesExpended + 1
        }
      }
    };
  }

  return expendFighterBattleMasterSuperiorityDie(character);
}

function clearFighterBattleMasterCombatSuperiorityUsed(character: Character): Character {
  if (!hasFighterBattleMasterCombatSuperiority(character)) {
    return character;
  }

  const fighterState = getBattleMasterStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterBattleMasterFeatureState(fighterState, character);

  if (normalizedState.battleMasterCombatSuperiorityUsedThisTurn !== true) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        battleMasterCombatSuperiorityUsedThisTurn: false
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
  return clearFighterBattleMasterCombatSuperiorityUsed(
    restoreAllFighterBattleMasterSuperiorityDice(character)
  );
}

export function restoreFighterBattleMasterSuperiorityDiceOnLongRest(
  character: Character
): Character {
  return clearFighterBattleMasterCombatSuperiorityUsed(
    restoreAllFighterBattleMasterSuperiorityDice(character)
  );
}

export function restoreFighterBattleMasterKnowYourEnemyOnLongRest(character: Character): Character {
  if (!hasFighterBattleMasterKnowYourEnemy(character)) {
    return character;
  }

  const fighterState = getBattleMasterStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterBattleMasterFeatureState(fighterState, character);

  if ((normalizedState.battleMasterKnowYourEnemyUsesExpended ?? 0) === 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        battleMasterKnowYourEnemyUsesExpended: 0
      }
    }
  };
}

function getCombatSuperiorityManeuverLinkItems(character: BattleMasterCharacter): string[] {
  const selectedManeuvers = getFighterBattleMasterManeuverSelections(character)
    .map((maneuverId) => fighterBattleMasterManeuverDefinitionsById.get(maneuverId))
    .filter(
      (maneuver): maneuver is (typeof fighterBattleMasterManeuverDefinitions)[number] =>
        maneuver !== undefined
    );

  return selectedManeuvers.map(
    (maneuver) =>
      `<link:${getFighterBattleMasterManeuverReferenceKey(maneuver.id)}>${maneuver.name}</link>`
  );
}

function getCombatSuperiorityDescriptionEntries(
  character: BattleMasterCharacter
): SpellDescriptionEntry[] {
  const maneuverLinkItems = getCombatSuperiorityManeuverLinkItems(character);

  return maneuverLinkItems.length > 0
    ? [
        combatSuperiorityDrawerDescription,
        {
          type: "list",
          style: "bullet",
          items: maneuverLinkItems
        }
      ]
    : [combatSuperiorityDrawerDescription];
}

function getCombatSuperiorityDescriptionAdditions(
  character: BattleMasterCharacter
): SpellDescriptionEntry[][] {
  if (!hasFighterBattleMasterRelentless(character)) {
    return [];
  }

  const relentlessDescription = getFeatureDescriptionForCharacter(
    character,
    CLASS_FEATURE.RELENTLESS
  );

  return relentlessDescription.length > 0
    ? [createSourcedDescriptionEntries("Relentless", relentlessDescription)]
    : [];
}

function getBattleMasterAbilityModifier(score: number | undefined): number {
  return getAbilityModifier(Math.max(1, Math.floor(score ?? 10)));
}

function formatBattleMasterBreakdownTerm(value: number, label: string): string {
  const absoluteValue = Math.abs(value);

  return `${value >= 0 ? "+" : "-"} ${absoluteValue} ${label}`;
}

function getCombatSuperiorityFacts(character: BattleMasterCharacter): FeatureActionFact[] {
  if (!character.abilities) {
    return [];
  }

  const strengthModifier = getBattleMasterAbilityModifier(character.abilities.STR);
  const dexterityModifier = getBattleMasterAbilityModifier(character.abilities.DEX);
  const chosenAbilityModifier = Math.max(strengthModifier, dexterityModifier);
  const chosenAbilityLabel = strengthModifier >= dexterityModifier ? "STR" : "DEX";
  const proficiencyBonus = getProficiencyBonus(character.level ?? 1);
  const maneuverDc = 8 + chosenAbilityModifier + proficiencyBonus;
  const breakdown = [
    "8 Base",
    formatBattleMasterBreakdownTerm(chosenAbilityModifier, chosenAbilityLabel),
    formatBattleMasterBreakdownTerm(proficiencyBonus, "Prof. Bonus")
  ].join(" ");

  return [
    {
      label: "Maneuver DC Formula",
      value: `DC ${maneuverDc}`,
      breakdown: `[= ${breakdown}]`,
      fullWidth: true
    }
  ];
}

function getFighterBattleMasterCombatSuperiorityAction(
  character: BattleMasterCharacter
): FeatureActionCard | null {
  if (!hasFighterBattleMasterCombatSuperiority(character)) {
    return null;
  }

  const totalDice = getFighterBattleMasterSuperiorityDiceTotal(character);
  const remainingDice = getFighterBattleMasterSuperiorityDiceRemaining(character);
  const usedThisTurn = getFighterBattleMasterCombatSuperiorityUsedThisTurn(character);

  return {
    key: fighterBattleMasterCombatSuperiorityActionKey,
    name: "Combat Superiority",
    sourceFeature: CLASS_FEATURE.COMBAT_SUPERIORITY,
    summary: "Spend 1 Superiority Die to fuel a maneuver.",
    detail:
      "Use Combat Superiority to expend one Superiority Die. Once used, it can't be used again until the start of your next turn.",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    hideUsesTrackerOnCard: true,
    usesInlineLabel: "Use 1",
    usesInlineIcon: "superiority",
    usesRemaining: remainingDice,
    usesTotal: totalDice,
    description: getCombatSuperiorityDescriptionEntries(character),
    descriptionAdditions: getCombatSuperiorityDescriptionAdditions(character),
    facts: getCombatSuperiorityFacts(character),
    resources: [
      {
        kind: "text",
        label: "Superiority Dice",
        value: `${remainingDice}/${totalDice}`,
        icon: "superiority"
      }
    ],
    drawer: {
      kind: "confirm",
      eyebrow: "Fighter",
      confirmLabel: "Use Combat Superiority"
    },
    execute: {
      kind: "activate",
      label: "Use Combat Superiority",
      effectKind: "combat-superiority"
    },
    disabled: remainingDice <= 0 || usedThisTurn,
    disabledReason:
      remainingDice <= 0
        ? "No Superiority Dice remaining."
        : usedThisTurn
          ? "Combat Superiority has already been used this turn."
          : undefined
  };
}

function getFighterBattleMasterKnowYourEnemyAction(
  character: BattleMasterCharacter
): FeatureActionCard | null {
  if (!hasFighterBattleMasterKnowYourEnemy(character)) {
    return null;
  }

  const usesTotal = getFighterBattleMasterKnowYourEnemyUsesTotal(character);
  const usesRemaining = getFighterBattleMasterKnowYourEnemyUsesRemaining(character);
  const superiorityDiceRemaining = getFighterBattleMasterSuperiorityDiceRemaining(character);
  const canUseFallback = usesRemaining <= 0 && superiorityDiceRemaining > 0;
  const disabledReason =
    usesRemaining > 0 || canUseFallback
      ? undefined
      : "No Know Your Enemy charge or Superiority Die remaining.";

  return {
    key: fighterBattleMasterKnowYourEnemyActionKey,
    name: "Know Your Enemy",
    sourceFeature: CLASS_FEATURE.KNOW_YOUR_ENEMY,
    summary: "Discern a creature's Immunities, Resistances, and Vulnerabilities.",
    detail:
      "Use Know Your Enemy to discern a visible creature's Immunities, Resistances, and Vulnerabilities within 30 feet.",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal,
    usesInlineLabel: canUseFallback ? "| Use 1" : undefined,
    usesInlineIcon: canUseFallback ? "superiority" : undefined,
    usesInlineSuffix: canUseFallback ? "instead" : undefined,
    resources: [
      {
        kind: "tracker",
        label: "Charge",
        current: usesRemaining,
        total: usesTotal,
        supplementary: "Long Rest"
      },
      ...(canUseFallback
        ? [
            {
              kind: "text" as const,
              label: "Fallback",
              value: "Use 1",
              icon: "superiority" as const
            }
          ]
        : [])
    ],
    drawer: {
      kind: "confirm",
      eyebrow: "Fighter",
      confirmLabel: "Use Know Your Enemy",
      helperText: canUseFallback
        ? "Your normal use is depleted, so this activation will spend 1 Superiority Die instead."
        : undefined
    },
    execute: {
      kind: "activate",
      label: "Use Know Your Enemy",
      effectKind: "know-your-enemy"
    },
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

export const getFighterBattleMasterDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  const combatSuperiorityAction = getFighterBattleMasterCombatSuperiorityAction(character);
  const knowYourEnemyAction = getFighterBattleMasterKnowYourEnemyAction(character);
  const featureActions = [combatSuperiorityAction, knowYourEnemyAction].filter(
    (action): action is FeatureActionCard => action !== null
  );

  return featureActions.length > 0
    ? {
        featureActions
      }
    : {};
};

export function advanceFighterBattleMasterFeaturesForNewRound(character: Character): Character {
  return clearFighterBattleMasterCombatSuperiorityUsed(character);
}
