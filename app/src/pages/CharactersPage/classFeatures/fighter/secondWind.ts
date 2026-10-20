import { fighterFeatures } from "../../../../codex/classes";
import { getProgressionRow } from "../../../../codex/progression";
import type { Character } from "../../../../types";
import { getClassLevel, hasCharacterClass } from "../../multiclassState";

type SecondWindCharacter = Pick<Character, "className"> &
  Partial<Pick<Character, "level" | "classFeatureState">>;

export function getFighterSecondWindUsesTotal(character: SecondWindCharacter): number {
  if (!hasCharacterClass(character, "Fighter")) return 0;
  const level = Math.max(1, Math.min(20, Math.floor(getClassLevel(character, "Fighter"))));
  return getProgressionRow(fighterFeatures, level)?.secondWind ?? 0;
}

export function getFighterSecondWindUsesRemaining(character: SecondWindCharacter): number {
  const total = getFighterSecondWindUsesTotal(character);
  const expended = Number(character.classFeatureState?.fighter?.secondWindUsesExpended);
  const normalizedExpended = Number.isFinite(expended) ? Math.max(0, Math.floor(expended)) : 0;
  return Math.max(0, total - normalizedExpended);
}
