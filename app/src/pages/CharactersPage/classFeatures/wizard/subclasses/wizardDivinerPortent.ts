import { CLASS_FEATURE } from "../../../../../codex/entries";
import type {
  Character,
  CharacterWizardPortentRoll
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import type { FeatureActionCard } from "../../types";
import {
  getWizardDivinerFeatureDescriptionEntries,
  hasWizardDivinerFeature
} from "./wizardDivinerShared";

export const wizardDivinerPortentActionKey = "wizard-diviner-portent";

const wizardDivinerPortentRollMinimum = 1;
const wizardDivinerPortentRollMaximum = 20;
const wizardDivinerPortentBaseCount = 2;
const wizardDivinerGreaterPortentCount = 3;

function hasWizardDivinerGreaterPortent(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId">>
): boolean {
  return hasWizardDivinerFeature(character, 14);
}

function normalizeWizardDivinerPortentRollValue(value: unknown): number | undefined {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return undefined;
  }

  return Math.max(
    wizardDivinerPortentRollMinimum,
    Math.min(wizardDivinerPortentRollMaximum, Math.floor(numericValue))
  );
}

function areWizardDivinerPortentRollsEqual(
  left: CharacterWizardPortentRoll[],
  right: CharacterWizardPortentRoll[]
): boolean {
  return (
    left.length === right.length &&
    left.every(
      (entry, index) =>
        (entry.value ?? null) === (right[index]?.value ?? null) &&
        Boolean(entry.used) === Boolean(right[index]?.used)
    )
  );
}

function createWizardDivinerEmptyPortentRolls(count: number): CharacterWizardPortentRoll[] {
  return Array.from({ length: count }, () => ({ used: false }));
}

function getWizardDivinerPortentRollSummary(portentRolls: CharacterWizardPortentRoll[]): string {
  return portentRolls.map((roll) => roll.value ?? "--").join(" / ");
}

export function getWizardDivinerPortentUsesTotal(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId">>
): number {
  if (!hasWizardDivinerFeature(character, 3)) {
    return 0;
  }

  return hasWizardDivinerGreaterPortent(character)
    ? wizardDivinerGreaterPortentCount
    : wizardDivinerPortentBaseCount;
}

export function normalizeWizardDivinerPortentRolls(
  value: unknown,
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "level" | "subclassId">>
): CharacterWizardPortentRoll[] | undefined {
  const usesTotal = getWizardDivinerPortentUsesTotal(character);

  if (usesTotal <= 0) {
    return undefined;
  }

  const rawRolls = Array.isArray(value) ? value : [];

  return Array.from({ length: usesTotal }, (_, index) => {
    const rawRoll = rawRolls[index];
    const rollRecord =
      rawRoll && typeof rawRoll === "object"
        ? (rawRoll as Partial<Record<keyof CharacterWizardPortentRoll, unknown>>)
        : undefined;

    return {
      value: normalizeWizardDivinerPortentRollValue(rollRecord?.value),
      used: rollRecord?.used === true
    };
  });
}

export function getWizardDivinerPortentRolls(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): CharacterWizardPortentRoll[] {
  return (
    normalizeWizardDivinerPortentRolls(character.classFeatureState?.wizard?.portentRolls, character) ??
    []
  );
}

export function getWizardDivinerPortentUsesRemaining(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): number {
  return getWizardDivinerPortentRolls(character).filter((roll) => roll.used !== true).length;
}

export function getWizardDivinerPortentFeatureAction(
  character: Pick<Character, "className"> &
    Partial<Pick<Character, "classFeatureState" | "level" | "subclassId">>
): FeatureActionCard | null {
  const usesTotal = getWizardDivinerPortentUsesTotal(character);

  if (usesTotal <= 0) {
    return null;
  }

  const portentRolls = getWizardDivinerPortentRolls(character);
  const usesRemaining = getWizardDivinerPortentUsesRemaining(character);
  const portentDescription = getWizardDivinerFeatureDescriptionEntries(CLASS_FEATURE.PORTENT);

  return {
    key: wizardDivinerPortentActionKey,
    name: "Portent",
    summary: "Replace a d20 test with a foretelling roll.",
    detail:
      "Track the foretelling rolls from your last Long Rest and mark each one off after it is spent.",
    breakdown: "Use portent rolls",
    breakdownTone: usesRemaining > 0 ? "default" : "danger",
    economyType: ECONOMY_TYPE.FREE,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining,
    usesTotal,
    usesSupplementaryLabel: `Rolls ${getWizardDivinerPortentRollSummary(portentRolls)}`,
    description: portentDescription.length > 0 ? portentDescription : undefined,
    drawer: {
      kind: "custom-form",
      formKind: "portent",
      eyebrow: "Diviner",
      helperText:
        "Enter the d20 results you rolled after your last Long Rest and mark a roll used once it replaces a d20 test."
    }
  };
}

export function setWizardDivinerPortentRolls(
  character: Character,
  portentRolls: CharacterWizardPortentRoll[]
): Character {
  const nextPortentRolls = normalizeWizardDivinerPortentRolls(portentRolls, character);

  if (!nextPortentRolls) {
    return character;
  }

  const currentPortentRolls = getWizardDivinerPortentRolls(character);

  if (areWizardDivinerPortentRollsEqual(currentPortentRolls, nextPortentRolls)) {
    return character;
  }

  const wizardState = character.classFeatureState?.wizard ?? {};

  return {
    ...character,
    classFeatureState: {
      ...character.classFeatureState,
      wizard: {
        ...wizardState,
        portentRolls: nextPortentRolls
      }
    }
  };
}

export function restoreWizardDivinerPortentOnLongRest(character: Character): Character {
  const usesTotal = getWizardDivinerPortentUsesTotal(character);

  if (usesTotal <= 0) {
    return character;
  }

  return setWizardDivinerPortentRolls(
    character,
    createWizardDivinerEmptyPortentRolls(usesTotal)
  );
}
