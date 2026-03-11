import { ABILITY_TYPES, DICE_TYPES, TOOL_PROFICIENCIES } from "../../codex/entries";

const ALWAYS_UPPERCASE_LABELS = new Set<string>([
  ...Object.values(ABILITY_TYPES),
  ...Object.values(DICE_TYPES)
]);

const SPECIAL_LABELS: Record<string, string> = {
  [TOOL_PROFICIENCIES.THIEVES_TOOLKIT]: "Thieve's Toolkit",
  [TOOL_PROFICIENCIES.SMITHS_TOOLKIT]: "Smith's Toolkit",
  [TOOL_PROFICIENCIES.DISGUIDE_KIT]: "Disguide Kit",
  [TOOL_PROFICIENCIES.DISARM_KIT]: "Disarm Kit"
};

export function formatCodexLabel(value: string): string {
  if (value in SPECIAL_LABELS) {
    return SPECIAL_LABELS[value];
  }

  if (ALWAYS_UPPERCASE_LABELS.has(value)) {
    return value;
  }

  return value
    .toLowerCase()
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function formatCodexList(values: string[]): string {
  return values.map((value) => formatCodexLabel(value)).join(", ");
}

export function formatDamageDice(dice: string[]): string {
  if (dice.length === 0) {
    return "None";
  }

  const countByDie = new Map<string, number>();
  const diceOrder: string[] = [];

  dice.forEach((die) => {
    if (!countByDie.has(die)) {
      diceOrder.push(die);
      countByDie.set(die, 0);
    }

    countByDie.set(die, (countByDie.get(die) ?? 0) + 1);
  });

  return diceOrder
    .map((die) => `${countByDie.get(die)}${die.toLowerCase()}`)
    .join(" + ");
}

export function truncateCodexText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}
