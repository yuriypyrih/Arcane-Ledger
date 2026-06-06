import type { SpellfireSparkChoice } from "../../../types";

export const spellfireSparkSpellcastingAbilityOptions = ["INT", "WIS", "CHA"] as const;

const spellfireSparkSpellcastingAbilityOptionSet = new Set<string>(
  spellfireSparkSpellcastingAbilityOptions
);

function getProficiencyBonusForLevel(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  return Math.floor((normalizedLevel - 1) / 4) + 2;
}

export function getDefaultSpellfireSparkSpellcastingAbility(): SpellfireSparkChoice["spellcastingAbility"] {
  return "WIS";
}

export function isSpellfireSparkSpellcastingAbility(
  value: unknown
): value is SpellfireSparkChoice["spellcastingAbility"] {
  return typeof value === "string" && spellfireSparkSpellcastingAbilityOptionSet.has(value);
}

export function normalizeSpellfireSparkChoice(
  value: unknown,
  currentLevel = 1
): SpellfireSparkChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<SpellfireSparkChoice>;

  if (!isSpellfireSparkSpellcastingAbility(record.spellcastingAbility)) {
    return undefined;
  }

  const total = getProficiencyBonusForLevel(currentLevel);
  const rawExpended = Number(record.spellfireFlameExpended);
  const expended = Number.isFinite(rawExpended)
    ? Math.max(0, Math.min(total, Math.floor(rawExpended)))
    : 0;

  return {
    spellcastingAbility: record.spellcastingAbility,
    ...(expended > 0 ? { spellfireFlameExpended: expended } : {})
  };
}

export function getSpellfireSparkChoiceSummary(
  choice?: SpellfireSparkChoice
): string | null {
  return choice ? `Spellcasting Ability: ${choice.spellcastingAbility}` : null;
}
