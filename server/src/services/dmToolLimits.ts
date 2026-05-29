import { AppError } from "../errors/AppError.js";
import type { UserRole } from "../types/auth.js";
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
} from "../constants/QUOTAS.js";

type DmToolLimitKind = "campaigns" | "encounterTemplates" | "partyGroups";

type DmToolLimitConfig = {
  adminLimit: number;
  code: string;
  keeperLimit: number;
  label: string;
  userLimit: number;
};

const DM_TOOL_LIMITS: Record<DmToolLimitKind, DmToolLimitConfig> = {
  campaigns: {
    adminLimit: ADMIN_MAX_CAMPAIGNS,
    code: "CAMPAIGN_LIMIT_REACHED",
    keeperLimit: KEEPER_MAX_CAMPAIGNS,
    label: "campaigns",
    userLimit: USER_MAX_CAMPAIGNS
  },
  encounterTemplates: {
    adminLimit: ADMIN_MAX_ENCOUNTER_TEMPLATES,
    code: "ENCOUNTER_TEMPLATE_LIMIT_REACHED",
    keeperLimit: KEEPER_MAX_ENCOUNTER_TEMPLATES,
    label: "encounter templates",
    userLimit: USER_MAX_ENCOUNTER_TEMPLATES
  },
  partyGroups: {
    adminLimit: ADMIN_MAX_PARTY_GROUPS,
    code: "PARTY_GROUP_LIMIT_REACHED",
    keeperLimit: KEEPER_MAX_PARTY_GROUPS,
    label: "party groups",
    userLimit: USER_MAX_PARTY_GROUPS
  }
};

export function getDmToolLimitForRole(kind: DmToolLimitKind, role: UserRole | null | undefined) {
  const config = DM_TOOL_LIMITS[kind];

  if (role === "admin") {
    return config.adminLimit;
  }

  if (role === "keeper") {
    return config.keeperLimit;
  }

  return config.userLimit;
}

function createDmToolCreationLimitError(options: {
  currentCount: number;
  kind: DmToolLimitKind;
  role: UserRole | null | undefined;
}) {
  const config = DM_TOOL_LIMITS[options.kind];
  const limit = getDmToolLimitForRole(options.kind, options.role);

  return new AppError(`You can create up to ${limit} ${config.label}.`, 409, config.code, {
    currentCount: options.currentCount,
    limit
  });
}

export function assertDmToolCreationLimit(options: {
  currentCount: number;
  kind: DmToolLimitKind;
  role: UserRole | null | undefined;
}) {
  const limit = getDmToolLimitForRole(options.kind, options.role);

  if (options.currentCount < limit) {
    return;
  }

  throw createDmToolCreationLimitError(options);
}

export async function assertCreatedDmToolWithinLimit(options: {
  countDocuments: () => Promise<number>;
  isCreatedWithinLimit: (limit: number) => Promise<boolean>;
  kind: DmToolLimitKind;
  removeCreated: () => Promise<unknown>;
  role: UserRole | null | undefined;
}) {
  const currentCount = await options.countDocuments();
  const limit = getDmToolLimitForRole(options.kind, options.role);

  if (currentCount <= limit) {
    return;
  }

  if (await options.isCreatedWithinLimit(limit)) {
    return;
  }

  await options.removeCreated();

  throw createDmToolCreationLimitError({
    currentCount: await options.countDocuments(),
    kind: options.kind,
    role: options.role
  });
}
