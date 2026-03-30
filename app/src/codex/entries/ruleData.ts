import { ENTRY_CATEGORIES, RULE_TYPES } from "./enums";
import type { RuleEntry } from "./types";

export const ruleEntries: RuleEntry[] = [
  {
    id: "rule-advantage",
    name: "Advantage",
    category: ENTRY_CATEGORIES.RULES,
    tags: [RULE_TYPES.CORE, RULE_TYPES.COMBAT],
    summary: "Roll two d20s and keep the higher result when conditions favor you."
  }
];
