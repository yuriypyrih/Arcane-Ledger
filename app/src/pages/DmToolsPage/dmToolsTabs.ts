import type { LucideIcon } from "lucide-react";
import { ScrollText, Swords, Users } from "lucide-react";

export const DM_TOOLS_TAB_PARAM = "tab";

export type DmToolsTabId = "campaign-manager" | "party-manager" | "encounter-templates";

export type DmToolsTabConfig = {
  homeLabel: string;
  icon: LucideIcon;
  id: DmToolsTabId;
  label: string;
};

export const DEFAULT_DM_TOOLS_TAB_ID: DmToolsTabId = "campaign-manager";

export const DM_TOOLS_TABS: DmToolsTabConfig[] = [
  {
    homeLabel: "Campaign Manager",
    icon: ScrollText,
    id: "campaign-manager",
    label: "Campaign Manager"
  },
  {
    homeLabel: "Party Manager",
    icon: Users,
    id: "party-manager",
    label: "Party Manager"
  },
  {
    homeLabel: "Encounter Templates",
    icon: Swords,
    id: "encounter-templates",
    label: "Encounter Templates"
  }
];

const DM_TOOLS_TAB_IDS = new Set<DmToolsTabId>(DM_TOOLS_TABS.map((tab) => tab.id));

export function parseDmToolsTabId(value: string | null): DmToolsTabId {
  return value && DM_TOOLS_TAB_IDS.has(value as DmToolsTabId)
    ? (value as DmToolsTabId)
    : DEFAULT_DM_TOOLS_TAB_ID;
}

export function createDmToolsPath(tabId: DmToolsTabId) {
  return `/gm-tools?${DM_TOOLS_TAB_PARAM}=${tabId}`;
}
