import type { Character } from "../../types";
import { getClassEntries } from "../../codex/selectors";
import {
  areCharacterClassRulesEnforced,
  getCharacterClassRulesHitDie
} from "./customClass";

type HitDiceCharacter = Pick<Character, "level"> &
  Partial<Pick<Character, "className" | "classRules" | "customClass" | "hitDiceRemaining">>;

const codexClassEntriesByName = new Map(
  getClassEntries().map((entry) => [entry.name, entry])
);

function getHitDiceTotalForLevel(level: unknown): number {
  const parsedLevel = Number(level);

  if (!Number.isFinite(parsedLevel)) {
    return 1;
  }

  return Math.max(1, Math.floor(parsedLevel));
}

export function getHitDieFormulaForClass(
  className: string | null | undefined,
  customClass?: HitDiceCharacter["customClass"],
  classRules?: HitDiceCharacter["classRules"]
): string {
  if (!areCharacterClassRulesEnforced({ className, classRules, customClass })) {
    return `1${getCharacterClassRulesHitDie({ className, classRules, customClass })}`;
  }

  const classEntry =
    typeof className === "string" ? codexClassEntriesByName.get(className) : undefined;

  if (!classEntry) {
    return "1d8";
  }

  const rawDie = String(classEntry.hitPointDie).toLowerCase();
  return rawDie.startsWith("d") ? `1${rawDie}` : "1d8";
}

export function getHitDieLabelForClass(
  className: string | null | undefined,
  customClass?: HitDiceCharacter["customClass"],
  classRules?: HitDiceCharacter["classRules"]
): string {
  return getHitDieFormulaForClass(className, customClass, classRules)
    .replace(/^1/i, "")
    .toUpperCase();
}

export function getHitDieLabelForCharacter(character: HitDiceCharacter): string {
  return getHitDieLabelForClass(character.className, character.customClass, character.classRules);
}

export function getHitDieMaximumForClass(
  className: string | null | undefined,
  customClass?: HitDiceCharacter["customClass"],
  classRules?: HitDiceCharacter["classRules"]
): number {
  if (!areCharacterClassRulesEnforced({ className, classRules, customClass })) {
    return Number(
      getCharacterClassRulesHitDie({ className, classRules, customClass }).replace(/\D/g, "")
    );
  }

  const classEntry =
    typeof className === "string" ? codexClassEntriesByName.get(className) : undefined;
  const rawHitDie = classEntry ? String(classEntry.hitPointDie) : "D8";
  const parsedMaximum = Number(rawHitDie.replace(/\D/g, ""));

  if (!Number.isFinite(parsedMaximum) || parsedMaximum <= 0) {
    return 8;
  }

  return parsedMaximum;
}

export function getHitDiceTotalForCharacter(character: HitDiceCharacter): number {
  return getHitDiceTotalForLevel(character.level);
}

export function getHitDiceRemainingForCharacter(character: HitDiceCharacter): number {
  const totalHitDice = getHitDiceTotalForCharacter(character);
  const parsedRemaining = Number(character.hitDiceRemaining);

  if (!Number.isFinite(parsedRemaining)) {
    return totalHitDice;
  }

  return Math.max(0, Math.min(totalHitDice, Math.floor(parsedRemaining)));
}

export function getHitDiceDisplayForCharacter(character: HitDiceCharacter): string {
  const hitDieFormula = getHitDieFormulaForClass(
    character.className,
    character.customClass,
    character.classRules
  );
  const totalHitDice = getHitDiceTotalForCharacter(character);
  const availableHitDice = getHitDiceRemainingForCharacter(character);

  return `${hitDieFormula} (${availableHitDice}/${totalHitDice})`;
}
