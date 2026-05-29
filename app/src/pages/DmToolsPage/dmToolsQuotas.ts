import type { UserRole } from "../../types/auth";

type DmToolsQuotaKind = "campaigns" | "encounterTemplates" | "partyGroups";

const DM_TOOLS_QUOTAS: Record<
  DmToolsQuotaKind,
  {
    elevatedLimit: number;
    regularLimit: number;
  }
> = {
  campaigns: {
    elevatedLimit: 20,
    regularLimit: 5
  },
  encounterTemplates: {
    elevatedLimit: 40,
    regularLimit: 10
  },
  partyGroups: {
    elevatedLimit: 20,
    regularLimit: 5
  }
};

export function getDmToolsQuotaForRole(
  kind: DmToolsQuotaKind,
  role: UserRole | null | undefined
) {
  const quota = DM_TOOLS_QUOTAS[kind];

  return role === "keeper" || role === "admin" ? quota.elevatedLimit : quota.regularLimit;
}
