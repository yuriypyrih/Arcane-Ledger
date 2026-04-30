import { FEATS } from "../../codex/entries";
import { TOOL_PROFICIENCY, type Character, type CrafterChoice, type ItemRecord } from "../../types";
import { getToolProficiencyLabel } from "./proficiencyOptions";

export const crafterFastCraftingToolProficiencies: TOOL_PROFICIENCY[] = [
  TOOL_PROFICIENCY.CARPENTERS_TOOLS,
  TOOL_PROFICIENCY.LEATHERWORKERS_TOOLS,
  TOOL_PROFICIENCY.MASONS_TOOLS,
  TOOL_PROFICIENCY.POTTERS_TOOLS,
  TOOL_PROFICIENCY.SMITHS_TOOLKIT,
  TOOL_PROFICIENCY.TINKERS_TOOLS,
  TOOL_PROFICIENCY.WEAVERS_TOOLS,
  TOOL_PROFICIENCY.WOODCARVERS_TOOLS
];

export const crafterDiscountDescription =
  "<strong>Crafter: Discount.</strong> Whenever you buy a nonmagical item, you receive a 20 percent discount on it.";

const crafterFastCraftingToolSet = new Set<TOOL_PROFICIENCY>(
  crafterFastCraftingToolProficiencies
);

export function isCrafterFastCraftingTool(tool: unknown): tool is TOOL_PROFICIENCY {
  return typeof tool === "string" && crafterFastCraftingToolSet.has(tool as TOOL_PROFICIENCY);
}

export function normalizeCrafterChoice(value: unknown): CrafterChoice | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Partial<CrafterChoice>;

  if (!Array.isArray(record.toolProficiencies) || record.toolProficiencies.length !== 3) {
    return undefined;
  }

  const toolProficiencies = record.toolProficiencies.filter(isCrafterFastCraftingTool);
  const uniqueToolProficiencies = [...new Set(toolProficiencies)];

  if (uniqueToolProficiencies.length !== 3) {
    return undefined;
  }

  return {
    toolProficiencies: uniqueToolProficiencies as CrafterChoice["toolProficiencies"]
  };
}

export function getCrafterChoiceSummary(choice?: CrafterChoice): string | null {
  if (!choice) {
    return null;
  }

  return choice.toolProficiencies.map((tool) => getToolProficiencyLabel(tool)).join(", ");
}

export function characterHasCrafterDiscount(character: Pick<Character, "feats">): boolean {
  return Boolean(character.feats?.some((entry) => entry.feat === FEATS.CRAFTER));
}

export function isCrafterDiscountEligibleItem(item: Pick<ItemRecord, "is_magic_item">): boolean {
  return !item.is_magic_item;
}

export function getCrafterDiscountMultiplier(
  character: Pick<Character, "feats">,
  item: Pick<ItemRecord, "is_magic_item">
): number {
  return characterHasCrafterDiscount(character) && isCrafterDiscountEligibleItem(item) ? 0.8 : 1;
}

export function formatCrafterDiscountCostSuffix(
  character: Pick<Character, "feats">,
  item: Pick<ItemRecord, "is_magic_item">
): string | null {
  return getCrafterDiscountMultiplier(character, item) < 1 ? "(-20% Discount)" : null;
}
