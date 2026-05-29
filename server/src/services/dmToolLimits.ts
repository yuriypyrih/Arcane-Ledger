import { AppError } from "../errors/AppError.js";
import type { UserRole } from "../types/auth.js";

type DmToolLimitKind = "campaigns" | "encounterTemplates" | "partyGroups";

type DmToolLimitConfig = {
  code: string;
  label: string;
  regularLimit: number;
  elevatedLimit: number;
};

const DM_TOOL_LIMITS: Record<DmToolLimitKind, DmToolLimitConfig> = {
  campaigns: {
    code: "CAMPAIGN_LIMIT_REACHED",
    label: "campaigns",
    regularLimit: 5,
    elevatedLimit: 20
  },
  encounterTemplates: {
    code: "ENCOUNTER_TEMPLATE_LIMIT_REACHED",
    label: "encounter templates",
    regularLimit: 10,
    elevatedLimit: 40
  },
  partyGroups: {
    code: "PARTY_GROUP_LIMIT_REACHED",
    label: "party groups",
    regularLimit: 5,
    elevatedLimit: 20
  }
};

export function getDmToolLimitForRole(kind: DmToolLimitKind, role: UserRole | null | undefined) {
  const config = DM_TOOL_LIMITS[kind];

  return role === "keeper" || role === "admin" ? config.elevatedLimit : config.regularLimit;
}

export function assertDmToolCreationLimit(options: {
  currentCount: number;
  kind: DmToolLimitKind;
  role: UserRole | null | undefined;
}) {
  const config = DM_TOOL_LIMITS[options.kind];
  const limit = getDmToolLimitForRole(options.kind, options.role);

  if (options.currentCount < limit) {
    return;
  }

  throw new AppError(`You can create up to ${limit} ${config.label}.`, 409, config.code, {
    currentCount: options.currentCount,
    limit
  });
}
