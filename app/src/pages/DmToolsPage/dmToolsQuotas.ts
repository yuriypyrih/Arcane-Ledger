import type { UserRole } from "../../types/auth";
import {
  ADMIN_MAX_CAMPAIGNS,
  ADMIN_MAX_ENCOUNTER_TEMPLATES,
  ADMIN_MAX_PARTY_GROUPS,
  KEEPER_MAX_CAMPAIGNS,
  KEEPER_MAX_ENCOUNTER_TEMPLATES,
  KEEPER_MAX_PARTY_GROUPS,
  USER_MAX_CAMPAIGNS,
  USER_MAX_ENCOUNTER_TEMPLATES,
  USER_MAX_PARTY_GROUPS
} from "../../constants/QUOTAS";

type DmToolsQuotaKind = "campaigns" | "encounterTemplates" | "partyGroups";

const DM_TOOLS_QUOTAS: Record<
  DmToolsQuotaKind,
  {
    adminLimit: number;
    keeperLimit: number;
    userLimit: number;
  }
> = {
  campaigns: {
    adminLimit: ADMIN_MAX_CAMPAIGNS,
    keeperLimit: KEEPER_MAX_CAMPAIGNS,
    userLimit: USER_MAX_CAMPAIGNS
  },
  encounterTemplates: {
    adminLimit: ADMIN_MAX_ENCOUNTER_TEMPLATES,
    keeperLimit: KEEPER_MAX_ENCOUNTER_TEMPLATES,
    userLimit: USER_MAX_ENCOUNTER_TEMPLATES
  },
  partyGroups: {
    adminLimit: ADMIN_MAX_PARTY_GROUPS,
    keeperLimit: KEEPER_MAX_PARTY_GROUPS,
    userLimit: USER_MAX_PARTY_GROUPS
  }
};

export function getDmToolsQuotaForRole(
  kind: DmToolsQuotaKind,
  role: UserRole | null | undefined
) {
  const quota = DM_TOOLS_QUOTAS[kind];

  if (role === "keeper") {
    return quota.keeperLimit;
  }

  if (role === "admin") {
    return quota.adminLimit;
  }

  return quota.userLimit;
}
