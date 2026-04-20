import {
  CLASS_FEATURE,
  DAMAGE_TYPE,
  getReactionEntryById,
  getSpellEntryByName,
  type SpellDescriptionEntry,
  type SpellEntry
} from "../../../../../codex/entries";
import {
  psiWarriorBulwarkOfForceDescription,
  psiWarriorPsionicStrikeDescription,
  psiWarriorPsiPoweredLeapDescription,
  psiWarriorTelekineticMovementDescription,
  psiWarriorTelekineticThrustDescription
} from "../../../../../codex/subclasses/fighterPsiWarrior";
import type { Character, CharacterFighterFeatureState } from "../../../../../types";
import {
  EFFECT_NAME,
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import { appendSourcedDescriptionAddition } from "../../../actionModalDescriptions";
import { getFeatureDescriptionForCharacter } from "../../featureDescriptions";
import { getAbilityModifier, getProficiencyBonus } from "../../../gameplay";
import type { WeaponAction } from "../../../gameplay";
import {
  getPsionicDiceTotalForLevel,
  getPsionicDieForLevel,
  type PsionicDie
} from "../../psionicDice";
import { createCharacterStatusEntry, normalizeCharacterStatusEntries } from "../../../traits";
import type { SubclassRuntimeResolver } from "../../subclassRuntime";
import type {
  DerivedFeatureStatusEntry,
  FeatureActionCard,
  FeatureActionFact,
  FeatureSpeedBonus
} from "../../types";
import {
  fighterPsiWarriorBulwarkOfForceEffectName,
  fighterPsiWarriorBulwarkOfForceStatusSourceId,
  fighterPsiWarriorPsiPoweredLeapEffectName,
  fighterPsiWarriorPsiPoweredLeapStatusSourceId,
  fighterPsiWarriorTelekineticMasterEffectName,
  fighterPsiWarriorTelekineticMasterStatusSourceId,
  fighterPsiWarriorSource
} from "./fighterPsiWarriorShared";

export const psiWarriorSubclassId = "fighter-psi-warrior";
export const fighterPsiWarriorTelekineticMovementActionKey =
  "fighter-psi-warrior-telekinetic-movement";
export const fighterPsiWarriorBulwarkOfForceActionKey = "fighter-psi-warrior-bulwark-of-force";
const telekinesisSpellId = getSpellEntryByName("Telekinesis")?.id ?? null;

type PsiWarriorCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "abilities" | "level" | "subclassId" | "classFeatureState">>;

const psiWarriorProtectiveFieldReactionId = "reaction-psi-warrior-protective-field";
export const fighterPsiPoweredLeapActionKey = "fighter-psi-warrior-psi-powered-leap";
const psiWarriorPsionicStrikeSource = "Psionic Strike";
const psiWarriorTelekineticThrustSource = "Telekinetic Thrust";
const fighterPsiWarriorGuardedMindSource = "Guarded Mind";
const fighterPsiWarriorGuardedMindPsychicResistanceSourceId =
  "feature-fighter-psi-warrior-guarded-mind-psychic";

export function hasFighterPsiWarriorPsionicPower(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === psiWarriorSubclassId &&
    (character.level ?? 0) >= 3
  );
}

function hasFighterPsiWarriorTelekineticAdept(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === psiWarriorSubclassId &&
    (character.level ?? 0) >= 7
  );
}

function hasFighterPsiWarriorGuardedMind(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === psiWarriorSubclassId &&
    (character.level ?? 0) >= 10
  );
}

function hasFighterPsiWarriorBulwarkOfForce(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === psiWarriorSubclassId &&
    (character.level ?? 0) >= 15
  );
}

function hasFighterPsiWarriorTelekineticMaster(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return (
    character.className === "Fighter" &&
    character.subclassId === psiWarriorSubclassId &&
    (character.level ?? 0) >= 18
  );
}

function getPsiWarriorStateRecord(
  value: Partial<CharacterFighterFeatureState> | undefined
): Partial<CharacterFighterFeatureState> {
  return value && typeof value === "object" ? value : {};
}

function getPsiWarriorIntelligenceModifier(
  character: Partial<Pick<Character, "abilities">>
): number {
  return getAbilityModifier(character.abilities?.INT ?? 10);
}

function buildPsiWarriorFormula(die: PsionicDie | null, modifier: number): string | null {
  if (!die) {
    return null;
  }

  const dieFormula = `1${die}`;

  if (modifier === 0) {
    return dieFormula;
  }

  return `${dieFormula}${modifier > 0 ? `+${modifier}` : modifier}`;
}

function appendWeaponDescriptionSection(
  action: WeaponAction,
  sourceName: string,
  descriptionEntries: readonly string[]
): WeaponAction {
  return appendSourcedDescriptionAddition(action, sourceName, descriptionEntries);
}

function getTelekineticMasterDescriptionEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): SpellDescriptionEntry[] {
  const descriptionEntries = getFeatureDescriptionForCharacter(character, CLASS_FEATURE.TELEKINETIC_MASTER);

  return descriptionEntries.length > 0
    ? descriptionEntries
    : [...psiWarriorTelekineticMasterDescription];
}

function appendTelekineticMasterSpellDescription(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>,
  spell: SpellEntry
): SpellEntry {
  if (!hasFighterPsiWarriorTelekineticMaster(character) || spell.id !== telekinesisSpellId) {
    return spell;
  }

  return appendSourcedDescriptionAddition(
    spell,
    fighterPsiWarriorTelekineticMasterEffectName,
    getTelekineticMasterDescriptionEntries(character)
  );
}

function appendWeaponFact(action: WeaponAction, fact: FeatureActionFact): WeaponAction {
  const existingFacts = action.facts ?? [];

  if (existingFacts.some((entry) => entry.label === fact.label)) {
    return action;
  }

  return {
    ...action,
    facts: [...existingFacts, fact]
  };
}

function formatPsiWarriorBreakdownTerm(value: number, label: string): string {
  const absoluteValue = Math.abs(value);

  return `${value >= 0 ? "+" : "-"} ${absoluteValue} ${label}`;
}

function getTelekineticThrustDcFact(character: PsiWarriorCharacter): FeatureActionFact {
  const intelligenceModifier = getPsiWarriorIntelligenceModifier(character);
  const proficiencyBonus = getProficiencyBonus(character.level ?? 1);
  const telekineticThrustDc = 8 + intelligenceModifier + proficiencyBonus;
  const breakdown = [
    "8 Base",
    formatPsiWarriorBreakdownTerm(intelligenceModifier, "INT"),
    formatPsiWarriorBreakdownTerm(proficiencyBonus, "Prof. Bonus")
  ].join(" ");

  return {
    label: "Telekinetic Thrust DC Formula",
    value: `DC ${telekineticThrustDc}`,
    breakdown: `[${breakdown}]`,
    fullWidth: true
  };
}

function applyPsiWarriorWeaponDescriptionAdditions(
  action: WeaponAction,
  character: PsiWarriorCharacter
): WeaponAction {
  if (action.attackKind !== "weapon") {
    return action;
  }

  let nextAction = action;

  if (hasFighterPsiWarriorPsionicPower(character)) {
    nextAction = appendWeaponDescriptionSection(
      nextAction,
      psiWarriorPsionicStrikeSource,
      psiWarriorPsionicStrikeDescription
    );
  }

  if (hasFighterPsiWarriorTelekineticAdept(character)) {
    nextAction = appendWeaponDescriptionSection(
      nextAction,
      psiWarriorTelekineticThrustSource,
      psiWarriorTelekineticThrustDescription
    );
    nextAction = appendWeaponFact(nextAction, getTelekineticThrustDcFact(character));
  }

  return nextAction;
}

function hasFighterPsiWarriorPsiPoweredLeapStatus(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) => entry.sourceId === fighterPsiWarriorPsiPoweredLeapStatusSourceId
  );
}

export function getFighterPsiWarriorEnergyDiceTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasFighterPsiWarriorPsionicPower(character)
    ? getPsionicDiceTotalForLevel(character.level)
    : 0;
}

export function getFighterPsiWarriorEnergyDie(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): PsionicDie | null {
  return hasFighterPsiWarriorPsionicPower(character)
    ? getPsionicDieForLevel(character.level)
    : null;
}

export function getFighterPsiWarriorTelekineticMovementUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasFighterPsiWarriorPsionicPower(character) ? 1 : 0;
}

export function getFighterPsiWarriorPsiPoweredLeapUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasFighterPsiWarriorTelekineticAdept(character) ? 1 : 0;
}

export function getFighterPsiWarriorBulwarkOfForceUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasFighterPsiWarriorBulwarkOfForce(character) ? 1 : 0;
}

export function getFighterPsiWarriorTelekineticMasterUsesTotal(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): number {
  return hasFighterPsiWarriorTelekineticMaster(character) ? 1 : 0;
}

export function normalizeFighterPsiWarriorFeatureState(
  value: Partial<CharacterFighterFeatureState>,
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): Pick<
  CharacterFighterFeatureState,
  | "psiWarriorEnergyDiceExpended"
  | "psiWarriorPsionicStrikeUsedThisTurn"
  | "psiWarriorPsiPoweredLeapUsesExpended"
  | "psiWarriorTelekineticMovementUsesExpended"
  | "psiWarriorBulwarkOfForceUsesExpended"
  | "psiWarriorTelekineticMasterUsesExpended"
  | "psiWarriorTelekineticMasterBonusAttackAvailable"
> {
  const totalDice = getFighterPsiWarriorEnergyDiceTotal(character);
  const psiPoweredLeapUsesTotal = getFighterPsiWarriorPsiPoweredLeapUsesTotal(character);
  const telekineticMovementUsesTotal = getFighterPsiWarriorTelekineticMovementUsesTotal(character);
  const bulwarkOfForceUsesTotal = getFighterPsiWarriorBulwarkOfForceUsesTotal(character);
  const telekineticMasterUsesTotal = getFighterPsiWarriorTelekineticMasterUsesTotal(character);

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
        : undefined,
    psiWarriorPsionicStrikeUsedThisTurn:
      totalDice > 0 ? value.psiWarriorPsionicStrikeUsedThisTurn === true : undefined,
    psiWarriorPsiPoweredLeapUsesExpended:
      psiPoweredLeapUsesTotal > 0
        ? Math.max(
            0,
            Math.min(
              psiPoweredLeapUsesTotal,
              Number.isFinite(Number(value.psiWarriorPsiPoweredLeapUsesExpended))
                ? Math.floor(Number(value.psiWarriorPsiPoweredLeapUsesExpended))
                : 0
            )
          )
        : undefined,
    psiWarriorTelekineticMovementUsesExpended:
      telekineticMovementUsesTotal > 0
        ? Math.max(
            0,
            Math.min(
              telekineticMovementUsesTotal,
              Number.isFinite(Number(value.psiWarriorTelekineticMovementUsesExpended))
                ? Math.floor(Number(value.psiWarriorTelekineticMovementUsesExpended))
                : 0
            )
          )
        : undefined,
    psiWarriorBulwarkOfForceUsesExpended:
      bulwarkOfForceUsesTotal > 0
        ? Math.max(
            0,
            Math.min(
              bulwarkOfForceUsesTotal,
              Number.isFinite(Number(value.psiWarriorBulwarkOfForceUsesExpended))
                ? Math.floor(Number(value.psiWarriorBulwarkOfForceUsesExpended))
                : 0
            )
          )
        : undefined,
    psiWarriorTelekineticMasterUsesExpended:
      telekineticMasterUsesTotal > 0
        ? Math.max(
            0,
            Math.min(
              telekineticMasterUsesTotal,
              Number.isFinite(Number(value.psiWarriorTelekineticMasterUsesExpended))
                ? Math.floor(Number(value.psiWarriorTelekineticMasterUsesExpended))
                : 0
            )
          )
        : undefined,
    psiWarriorTelekineticMasterBonusAttackAvailable:
      telekineticMasterUsesTotal > 0
        ? value.psiWarriorTelekineticMasterBonusAttackAvailable === true
        : undefined
  };
}

export function getFighterPsiWarriorEnergyDiceRemaining(character: PsiWarriorCharacter): number {
  const totalDice = getFighterPsiWarriorEnergyDiceTotal(character);
  const diceExpended =
    normalizeFighterPsiWarriorFeatureState(
      getPsiWarriorStateRecord(character.classFeatureState?.fighter),
      character
    ).psiWarriorEnergyDiceExpended ?? 0;

  return Math.max(0, totalDice - diceExpended);
}

export function getFighterPsiWarriorPsiPoweredLeapUsesRemaining(
  character: PsiWarriorCharacter
): number {
  const totalUses = getFighterPsiWarriorPsiPoweredLeapUsesTotal(character);
  const usesExpended =
    normalizeFighterPsiWarriorFeatureState(
      getPsiWarriorStateRecord(character.classFeatureState?.fighter),
      character
    ).psiWarriorPsiPoweredLeapUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getFighterPsiWarriorTelekineticMovementUsesRemaining(
  character: PsiWarriorCharacter
): number {
  const totalUses = getFighterPsiWarriorTelekineticMovementUsesTotal(character);
  const usesExpended =
    normalizeFighterPsiWarriorFeatureState(
      getPsiWarriorStateRecord(character.classFeatureState?.fighter),
      character
    ).psiWarriorTelekineticMovementUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getFighterPsiWarriorBulwarkOfForceUsesRemaining(
  character: PsiWarriorCharacter
): number {
  const totalUses = getFighterPsiWarriorBulwarkOfForceUsesTotal(character);
  const usesExpended =
    normalizeFighterPsiWarriorFeatureState(
      getPsiWarriorStateRecord(character.classFeatureState?.fighter),
      character
    ).psiWarriorBulwarkOfForceUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getFighterPsiWarriorTelekineticMasterUsesRemaining(
  character: PsiWarriorCharacter
): number {
  const totalUses = getFighterPsiWarriorTelekineticMasterUsesTotal(character);
  const usesExpended =
    normalizeFighterPsiWarriorFeatureState(
      getPsiWarriorStateRecord(character.classFeatureState?.fighter),
      character
    ).psiWarriorTelekineticMasterUsesExpended ?? 0;

  return Math.max(0, totalUses - usesExpended);
}

export function getFighterPsiWarriorProtectiveFieldFormula(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): string | null {
  return buildPsiWarriorFormula(
    getFighterPsiWarriorEnergyDie(character),
    getPsiWarriorIntelligenceModifier(character)
  );
}

export function getFighterPsiWarriorPsionicStrikeFormula(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "abilities" | "level" | "subclassId">>
): string | null {
  return buildPsiWarriorFormula(
    getFighterPsiWarriorEnergyDie(character),
    getPsiWarriorIntelligenceModifier(character)
  );
}

export function hasFighterPsiWarriorPsionicStrikeAvailable(
  character: PsiWarriorCharacter
): boolean {
  if (!hasFighterPsiWarriorPsionicPower(character)) {
    return false;
  }

  const fighterState = normalizeFighterPsiWarriorFeatureState(
    getPsiWarriorStateRecord(character.classFeatureState?.fighter),
    character
  );

  return (
    getFighterPsiWarriorEnergyDiceRemaining(character) > 0 &&
    fighterState.psiWarriorPsionicStrikeUsedThisTurn !== true
  );
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

export function consumeFighterPsiWarriorPsionicStrike(character: Character): Character {
  if (!hasFighterPsiWarriorPsionicStrikeAvailable(character)) {
    return character;
  }

  const fighterState = getPsiWarriorStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterPsiWarriorFeatureState(fighterState, character);
  const nextCharacter = expendFighterPsiWarriorEnergyDie(character);

  if (nextCharacter === character) {
    return character;
  }

  return {
    ...nextCharacter,
    classFeatureState: {
      ...nextCharacter.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        ...nextCharacter.classFeatureState?.fighter,
        psiWarriorPsionicStrikeUsedThisTurn: true
      }
    }
  };
}

export function applyFighterPsiWarriorPsiPoweredLeapStatus(character: Character): Character {
  if (!hasFighterPsiWarriorTelekineticAdept(character)) {
    return character;
  }

  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== fighterPsiWarriorPsiPoweredLeapStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: fighterPsiWarriorPsiPoweredLeapEffectName,
        source: fighterPsiWarriorSource,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 1,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        },
        sourceId: fighterPsiWarriorPsiPoweredLeapStatusSourceId
      })
    ]
  };
}

export function applyFighterPsiWarriorBulwarkOfForceStatus(character: Character): Character {
  if (!hasFighterPsiWarriorBulwarkOfForce(character)) {
    return character;
  }

  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== fighterPsiWarriorBulwarkOfForceStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: fighterPsiWarriorBulwarkOfForceEffectName,
        source: fighterPsiWarriorSource,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 10,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        },
        sourceId: fighterPsiWarriorBulwarkOfForceStatusSourceId
      })
    ]
  };
}

function hasFighterPsiWarriorTelekineticMasterStatus(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) => entry.sourceId === fighterPsiWarriorTelekineticMasterStatusSourceId
  );
}

export function hasFighterPsiWarriorTelekineticMasterBonusAttackAvailable(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId" | "classFeatureState" | "statusEntries">>
): boolean {
  if (!hasFighterPsiWarriorTelekineticMaster(character)) {
    return false;
  }

  const fighterState = normalizeFighterPsiWarriorFeatureState(
    getPsiWarriorStateRecord(character.classFeatureState?.fighter),
    character
  );

  return (
    fighterState.psiWarriorTelekineticMasterBonusAttackAvailable === true &&
    hasFighterPsiWarriorTelekineticMasterStatus(character)
  );
}

export function applyFighterPsiWarriorTelekineticMasterStatus(character: Character): Character {
  if (!hasFighterPsiWarriorTelekineticMaster(character)) {
    return character;
  }

  const nextStatusEntries = normalizeCharacterStatusEntries(character.statusEntries).filter(
    (entry) => entry.sourceId !== fighterPsiWarriorTelekineticMasterStatusSourceId
  );

  return {
    ...character,
    statusEntries: [
      ...nextStatusEntries,
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: fighterPsiWarriorTelekineticMasterEffectName,
        source: fighterPsiWarriorSource,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.LINKED,
          linkedGroup: STATUS_ENTRY_GROUP.EFFECTS,
          linkedValue: EFFECT_NAME.CONCENTRATION
        },
        sourceId: fighterPsiWarriorTelekineticMasterStatusSourceId
      })
    ]
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

export function activateFighterPsiWarriorTelekineticMovement(character: Character): Character {
  if (!hasFighterPsiWarriorPsionicPower(character)) {
    return character;
  }

  const usesRemaining = getFighterPsiWarriorTelekineticMovementUsesRemaining(character);

  if (usesRemaining > 0) {
    const fighterState = getPsiWarriorStateRecord(character.classFeatureState?.fighter);
    const normalizedState = normalizeFighterPsiWarriorFeatureState(fighterState, character);

    return {
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        fighter: {
          ...fighterState,
          ...normalizedState,
          psiWarriorTelekineticMovementUsesExpended: 1
        }
      }
    };
  }

  return getFighterPsiWarriorEnergyDiceRemaining(character) > 0
    ? expendFighterPsiWarriorEnergyDie(character)
    : character;
}

export function activateFighterPsiWarriorPsiPoweredLeap(character: Character): Character {
  if (!hasFighterPsiWarriorTelekineticAdept(character)) {
    return character;
  }

  const usesRemaining = getFighterPsiWarriorPsiPoweredLeapUsesRemaining(character);

  if (usesRemaining > 0) {
    const fighterState = getPsiWarriorStateRecord(character.classFeatureState?.fighter);
    const normalizedState = normalizeFighterPsiWarriorFeatureState(fighterState, character);

    return applyFighterPsiWarriorPsiPoweredLeapStatus({
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        fighter: {
          ...fighterState,
          ...normalizedState,
          psiWarriorPsiPoweredLeapUsesExpended: 1
        }
      }
    });
  }

  if (getFighterPsiWarriorEnergyDiceRemaining(character) <= 0) {
    return character;
  }

  return applyFighterPsiWarriorPsiPoweredLeapStatus(expendFighterPsiWarriorEnergyDie(character));
}

export function activateFighterPsiWarriorBulwarkOfForce(character: Character): Character {
  if (!hasFighterPsiWarriorBulwarkOfForce(character)) {
    return character;
  }

  const usesRemaining = getFighterPsiWarriorBulwarkOfForceUsesRemaining(character);

  if (usesRemaining > 0) {
    const fighterState = getPsiWarriorStateRecord(character.classFeatureState?.fighter);
    const normalizedState = normalizeFighterPsiWarriorFeatureState(fighterState, character);

    return applyFighterPsiWarriorBulwarkOfForceStatus({
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        fighter: {
          ...fighterState,
          ...normalizedState,
          psiWarriorBulwarkOfForceUsesExpended: 1
        }
      }
    });
  }

  if (getFighterPsiWarriorEnergyDiceRemaining(character) <= 0) {
    return character;
  }

  return applyFighterPsiWarriorBulwarkOfForceStatus(expendFighterPsiWarriorEnergyDie(character));
}

export function activateFighterPsiWarriorTelekineticMasterSpellCast(
  character: Character
): Character {
  if (!hasFighterPsiWarriorTelekineticMaster(character)) {
    return character;
  }

  const usesRemaining = getFighterPsiWarriorTelekineticMasterUsesRemaining(character);
  const fighterState = getPsiWarriorStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterPsiWarriorFeatureState(fighterState, character);

  if (usesRemaining > 0) {
    return applyFighterPsiWarriorTelekineticMasterStatus({
      ...character,
      classFeatureState: {
        ...character.classFeatureState,
        fighter: {
          ...fighterState,
          ...normalizedState,
          psiWarriorTelekineticMasterUsesExpended: 1,
          psiWarriorTelekineticMasterBonusAttackAvailable: true
        }
      }
    });
  }

  if (getFighterPsiWarriorEnergyDiceRemaining(character) <= 0) {
    return character;
  }

  const nextCharacter = expendFighterPsiWarriorEnergyDie(character);
  const nextFighterState = getPsiWarriorStateRecord(nextCharacter.classFeatureState?.fighter);
  const nextNormalizedState = normalizeFighterPsiWarriorFeatureState(
    nextFighterState,
    nextCharacter
  );

  return applyFighterPsiWarriorTelekineticMasterStatus({
    ...nextCharacter,
    classFeatureState: {
      ...nextCharacter.classFeatureState,
      fighter: {
        ...nextFighterState,
        ...nextNormalizedState,
        psiWarriorTelekineticMasterBonusAttackAvailable: true
      }
    }
  });
}

export function consumeFighterPsiWarriorTelekineticMasterBonusAttack(
  character: Character
): Character {
  if (!hasFighterPsiWarriorTelekineticMasterBonusAttackAvailable(character)) {
    return character;
  }

  const fighterState = getPsiWarriorStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterPsiWarriorFeatureState(fighterState, character);

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        psiWarriorTelekineticMasterBonusAttackAvailable: false
      }
    }
  };
}

export function restoreFighterPsiWarriorTelekineticMasterOnLongRest(
  character: Character
): Character {
  const totalUses = getFighterPsiWarriorTelekineticMasterUsesTotal(character);

  if (totalUses <= 0) {
    return character;
  }

  const fighterState = getPsiWarriorStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterPsiWarriorFeatureState(fighterState, character);

  if (
    (normalizedState.psiWarriorTelekineticMasterUsesExpended ?? 0) <= 0 &&
    normalizedState.psiWarriorTelekineticMasterBonusAttackAvailable !== true
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        psiWarriorTelekineticMasterUsesExpended: 0,
        psiWarriorTelekineticMasterBonusAttackAvailable: false
      }
    }
  };
}

export function restoreFighterPsiWarriorTelekineticMovementOnShortRest(
  character: Character
): Character {
  const totalUses = getFighterPsiWarriorTelekineticMovementUsesTotal(character);

  if (totalUses <= 0) {
    return character;
  }

  const fighterState = getPsiWarriorStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterPsiWarriorFeatureState(fighterState, character);

  if ((normalizedState.psiWarriorTelekineticMovementUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        psiWarriorTelekineticMovementUsesExpended: 0
      }
    }
  };
}

export function restoreFighterPsiWarriorPsiPoweredLeapOnShortRest(character: Character): Character {
  const totalUses = getFighterPsiWarriorPsiPoweredLeapUsesTotal(character);

  if (totalUses <= 0) {
    return character;
  }

  const fighterState = getPsiWarriorStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterPsiWarriorFeatureState(fighterState, character);

  if ((normalizedState.psiWarriorPsiPoweredLeapUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        psiWarriorPsiPoweredLeapUsesExpended: 0
      }
    }
  };
}

export function restoreFighterPsiWarriorTelekineticMovementOnLongRest(
  character: Character
): Character {
  return restoreFighterPsiWarriorTelekineticMovementOnShortRest(character);
}

export function restoreFighterPsiWarriorPsiPoweredLeapOnLongRest(character: Character): Character {
  return restoreFighterPsiWarriorPsiPoweredLeapOnShortRest(character);
}

export function restoreFighterPsiWarriorBulwarkOfForceOnLongRest(character: Character): Character {
  const totalUses = getFighterPsiWarriorBulwarkOfForceUsesTotal(character);

  if (totalUses <= 0) {
    return character;
  }

  const fighterState = getPsiWarriorStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterPsiWarriorFeatureState(fighterState, character);

  if ((normalizedState.psiWarriorBulwarkOfForceUsesExpended ?? 0) <= 0) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        psiWarriorBulwarkOfForceUsesExpended: 0
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

export function advanceFighterPsiWarriorFeaturesForNewRound(character: Character): Character {
  if (!hasFighterPsiWarriorPsionicPower(character)) {
    return character;
  }

  const fighterState = getPsiWarriorStateRecord(character.classFeatureState?.fighter);
  const normalizedState = normalizeFighterPsiWarriorFeatureState(fighterState, character);
  const telekineticMasterBonusAttackAvailable =
    hasFighterPsiWarriorTelekineticMasterStatus(character) &&
    hasFighterPsiWarriorTelekineticMaster(character);

  if (
    normalizedState.psiWarriorPsionicStrikeUsedThisTurn !== true &&
    (normalizedState.psiWarriorTelekineticMasterBonusAttackAvailable ?? false) ===
      telekineticMasterBonusAttackAvailable
  ) {
    return character;
  }

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      fighter: {
        ...fighterState,
        ...normalizedState,
        psiWarriorPsionicStrikeUsedThisTurn: false,
        psiWarriorTelekineticMasterBonusAttackAvailable: telekineticMasterBonusAttackAvailable
      }
    }
  };
}

function getFighterPsiWarriorTelekineticMovementAction(
  character: PsiWarriorCharacter
): FeatureActionCard | null {
  if (!hasFighterPsiWarriorPsionicPower(character)) {
    return null;
  }

  const usesTotal = getFighterPsiWarriorTelekineticMovementUsesTotal(character);
  const usesRemaining = getFighterPsiWarriorTelekineticMovementUsesRemaining(character);
  const psiEnergyDiceRemaining = getFighterPsiWarriorEnergyDiceRemaining(character);
  const canUseFallback = usesRemaining <= 0 && psiEnergyDiceRemaining > 0;
  const disabledReason =
    usesRemaining > 0 || canUseFallback
      ? undefined
      : "No Telekinetic Movement charge or Psi Energy Dice remaining.";

  return {
    key: fighterPsiWarriorTelekineticMovementActionKey,
    name: "Telekinetic Movement",
    summary: "Move a willing creature or loose object 30 feet.",
    detail: "Use telekinesis to transport a willing creature or loose object within 30 feet.",
    breakdown: "Move target 30 ft",
    description: [...psiWarriorTelekineticMovementDescription],
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    usesRemaining,
    usesTotal,
    usesInlineLabel: canUseFallback ? "| Use 1" : undefined,
    usesInlineIcon: canUseFallback ? "psi" : undefined,
    resources: [
      {
        kind: "tracker",
        label: "Charge",
        current: usesRemaining,
        total: usesTotal
      },
      ...(canUseFallback
        ? [
            {
              kind: "text" as const,
              label: "Fallback",
              value: "Use 1",
              icon: "psi" as const
            }
          ]
        : [])
    ],
    drawer: {
      kind: "confirm",
      eyebrow: fighterPsiWarriorSource,
      confirmLabel: "Use Telekinetic Movement"
    },
    execute: {
      kind: "activate",
      label: "Use Telekinetic Movement"
    },
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

function getFighterPsiWarriorPsiPoweredLeapAction(
  character: PsiWarriorCharacter
): FeatureActionCard | null {
  if (!hasFighterPsiWarriorTelekineticAdept(character)) {
    return null;
  }

  const usesTotal = getFighterPsiWarriorPsiPoweredLeapUsesTotal(character);
  const usesRemaining = getFighterPsiWarriorPsiPoweredLeapUsesRemaining(character);
  const psiEnergyDiceRemaining = getFighterPsiWarriorEnergyDiceRemaining(character);
  const canUseFallback = usesRemaining <= 0 && psiEnergyDiceRemaining > 0;
  const disabledReason =
    usesRemaining > 0 || canUseFallback
      ? undefined
      : "No Psi-Powered Leap charge or Psi Energy Dice remaining.";

  return {
    key: fighterPsiPoweredLeapActionKey,
    name: "Psi-Powered Leap",
    summary: "Gain a Fly Speed equal to twice your Speed for this turn.",
    detail: "Use telekinetic power to leap into the air until the end of the current turn.",
    breakdown: "Fly speed x2",
    description: [...psiWarriorPsiPoweredLeapDescription],
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal,
    usesInlineLabel: canUseFallback ? "| Use 1" : undefined,
    usesInlineIcon: canUseFallback ? "psi" : undefined,
    resources: [
      {
        kind: "tracker",
        label: "Charge",
        current: usesRemaining,
        total: usesTotal
      },
      ...(canUseFallback
        ? [
            {
              kind: "text" as const,
              label: "Fallback",
              value: "Use 1",
              icon: "psi" as const
            }
          ]
        : [])
    ],
    drawer: {
      kind: "confirm",
      eyebrow: fighterPsiWarriorSource,
      confirmLabel: "Use Psi-Powered Leap"
    },
    execute: {
      kind: "activate",
      label: "Use Psi-Powered Leap"
    },
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

function getFighterPsiWarriorBulwarkOfForceAction(
  character: PsiWarriorCharacter
): FeatureActionCard | null {
  if (!hasFighterPsiWarriorBulwarkOfForce(character)) {
    return null;
  }

  const usesTotal = getFighterPsiWarriorBulwarkOfForceUsesTotal(character);
  const usesRemaining = getFighterPsiWarriorBulwarkOfForceUsesRemaining(character);
  const psiEnergyDiceRemaining = getFighterPsiWarriorEnergyDiceRemaining(character);
  const canUseFallback = usesRemaining <= 0 && psiEnergyDiceRemaining > 0;
  const disabledReason =
    usesRemaining > 0 || canUseFallback
      ? undefined
      : "No Bulwark of Force charge or Psi Energy Dice remaining.";

  return {
    key: fighterPsiWarriorBulwarkOfForceActionKey,
    name: fighterPsiWarriorBulwarkOfForceEffectName,
    summary: "Grant Half Cover to nearby creatures for 1 minute.",
    detail: "Project a telekinetic bulwark around yourself and nearby creatures.",
    breakdown: "Half Cover aura",
    description: [...psiWarriorBulwarkOfForceDescription],
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal,
    usesInlineLabel: canUseFallback ? "| Use 1" : undefined,
    usesInlineIcon: canUseFallback ? "psi" : undefined,
    resources: [
      {
        kind: "tracker",
        label: "Charge",
        current: usesRemaining,
        total: usesTotal
      },
      ...(canUseFallback
        ? [
            {
              kind: "text" as const,
              label: "Fallback",
              value: "Use 1",
              icon: "psi" as const
            }
          ]
        : [])
    ],
    drawer: {
      kind: "confirm",
      eyebrow: fighterPsiWarriorSource,
      confirmLabel: "Use Bulwark of Force"
    },
    execute: {
      kind: "activate",
      label: "Use Bulwark of Force"
    },
    disabled: Boolean(disabledReason),
    disabledReason
  };
}

function getFighterPsiWarriorDerivedStatusEntries(
  character: Pick<Character, "className"> & Partial<Pick<Character, "level" | "subclassId">>
): DerivedFeatureStatusEntry[] {
  if (!hasFighterPsiWarriorGuardedMind(character)) {
    return [];
  }

  return [
    {
      id: fighterPsiWarriorGuardedMindPsychicResistanceSourceId,
      sourceId: fighterPsiWarriorGuardedMindPsychicResistanceSourceId,
      group: STATUS_ENTRY_GROUP.RESISTANCES,
      value: DAMAGE_TYPE.PSYCHIC,
      source: fighterPsiWarriorGuardedMindSource,
      sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
      duration: {
        kind: STATUS_DURATION_KIND.INFINITE
      }
    }
  ];
}

export const getFighterPsiWarriorDerivedFeatureState: SubclassRuntimeResolver = (character) => {
  if (!hasFighterPsiWarriorPsionicPower(character)) {
    return {};
  }

  const psiPoweredLeapAction = getFighterPsiWarriorPsiPoweredLeapAction(character);
  const telekineticMovementAction = getFighterPsiWarriorTelekineticMovementAction(character);
  const bulwarkOfForceAction = getFighterPsiWarriorBulwarkOfForceAction(character);
  const protectiveFieldReaction = getReactionEntryById(psiWarriorProtectiveFieldReactionId);
  const speedBonuses: FeatureSpeedBonus[] = hasFighterPsiWarriorPsiPoweredLeapStatus(character)
    ? [
        {
          label: fighterPsiWarriorPsiPoweredLeapEffectName,
          movementType: "fly",
          value: 0,
          setBaseFromWalkMultiplier: 2
        }
      ]
    : [];

  return {
    featureActions: [psiPoweredLeapAction, telekineticMovementAction, bulwarkOfForceAction].filter(
      (action): action is FeatureActionCard => action !== null
    ),
    alwaysPreparedSpellIds:
      hasFighterPsiWarriorTelekineticMaster(character) && telekinesisSpellId
        ? [telekinesisSpellId]
        : [],
    transformSpellEntry: hasFighterPsiWarriorTelekineticMaster(character)
      ? (spell) => appendTelekineticMasterSpellDescription(character, spell)
      : undefined,
    reactionEntries: protectiveFieldReaction ? [protectiveFieldReaction] : [],
    derivedStatusEntries: getFighterPsiWarriorDerivedStatusEntries(character),
    speedBonuses,
    transformWeaponAction:
      hasFighterPsiWarriorPsionicPower(character) || hasFighterPsiWarriorTelekineticAdept(character)
        ? (action) => applyPsiWarriorWeaponDescriptionAdditions(action, character)
        : undefined
  };
};
