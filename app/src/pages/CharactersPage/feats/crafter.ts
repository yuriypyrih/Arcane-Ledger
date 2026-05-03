import { TOOL_PROFICIENCY, type CrafterChoice, type ItemRecord } from "../../../types";
import { getToolProficiencyLabel } from "../proficiencyOptions";

export const crafterDiscountRuleText =
  "Whenever you buy a nonmagical item, you receive a 20% discount on it.";
export const crafterDiscountDescription = `<strong>Discount.</strong> ${crafterDiscountRuleText}`;
export const crafterFastCraftingRuleText =
  "When you finish a Long Rest, you can craft one piece of gear from the Fast Crafting table, provided you have the Artisan's Tools associated with that item and have proficiency with those tools. The item lasts until you finish another Long Rest, at which point the item falls apart.";
export const crafterFastCraftingDescription = `<strong>Fast Crafting.</strong> ${crafterFastCraftingRuleText}`;

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

const crafterFastCraftingToolSet = new Set<TOOL_PROFICIENCY>(crafterFastCraftingToolProficiencies);

export function isCrafterFastCraftingTool(tool: unknown): tool is TOOL_PROFICIENCY {
  return typeof tool === "string" && crafterFastCraftingToolSet.has(tool as TOOL_PROFICIENCY);
}

export function isCrafterDiscountEligibleItem(item: Pick<ItemRecord, "is_magic_item">): boolean {
  return item.is_magic_item !== true;
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
