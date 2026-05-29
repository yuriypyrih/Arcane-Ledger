import type { UserRole } from "../../types/auth";
import {
  ADMIN_MAX_CAMPAIGNS,
  ADMIN_MAX_CHARACTERS,
  GUEST_MAX_CHARACTERS,
  KEEPER_MAX_CAMPAIGNS,
  KEEPER_MAX_CHARACTERS,
  USER_MAX_CAMPAIGNS,
  USER_MAX_CHARACTERS
} from "../../constants/QUOTAS";

export type AccountPrivilegeRole = "guest" | UserRole;

export type AccountPrivilegeCellValue =
  | {
      kind: "boolean";
      included: boolean;
    }
  | {
      kind: "text";
      value: string;
    };

export type AccountPrivilegeRow = {
  adminOnly?: boolean;
  feature: string;
  values: Record<AccountPrivilegeRole, AccountPrivilegeCellValue>;
};

export const accountPrivilegeRoles: AccountPrivilegeRole[] = ["guest", "user", "keeper", "admin"];

function formatQuotaMultiplier(limit: number, baseLimit: number) {
  return `${Math.floor(limit / baseLimit)}x`;
}

export const accountPrivilegeRows: AccountPrivilegeRow[] = [
  {
    feature: "Max Characters",
    values: {
      guest: { kind: "text", value: String(GUEST_MAX_CHARACTERS) },
      user: { kind: "text", value: String(USER_MAX_CHARACTERS) },
      keeper: { kind: "text", value: String(KEEPER_MAX_CHARACTERS) },
      admin: { kind: "text", value: String(ADMIN_MAX_CHARACTERS) }
    }
  },
  {
    feature: "Character Sync",
    values: {
      guest: { kind: "text", value: "Local Only" },
      user: { kind: "text", value: "Cloud" },
      keeper: { kind: "text", value: "Cloud" },
      admin: { kind: "text", value: "Cloud" }
    }
  },
  {
    feature: "GM Tools",
    values: {
      guest: { kind: "boolean", included: false },
      user: { kind: "boolean", included: true },
      keeper: {
        kind: "text",
        value: formatQuotaMultiplier(KEEPER_MAX_CAMPAIGNS, USER_MAX_CAMPAIGNS)
      },
      admin: {
        kind: "text",
        value: formatQuotaMultiplier(ADMIN_MAX_CAMPAIGNS, USER_MAX_CAMPAIGNS)
      }
    }
  },
  {
    feature: "Character Avatars",
    values: {
      guest: { kind: "boolean", included: false },
      user: { kind: "boolean", included: true },
      keeper: { kind: "boolean", included: true },
      admin: { kind: "boolean", included: true }
    }
  },
  {
    feature: "Character Share Links",
    values: {
      guest: { kind: "boolean", included: false },
      user: { kind: "boolean", included: true },
      keeper: { kind: "boolean", included: true },
      admin: { kind: "boolean", included: true }
    }
  },
  {
    feature: "Support Tickets",
    values: {
      guest: { kind: "boolean", included: false },
      user: { kind: "boolean", included: true },
      keeper: { kind: "boolean", included: true },
      admin: { kind: "boolean", included: true }
    }
  },
  {
    adminOnly: true,
    feature: "Analytics Dashboard",
    values: {
      guest: { kind: "boolean", included: false },
      user: { kind: "boolean", included: false },
      keeper: { kind: "boolean", included: false },
      admin: { kind: "boolean", included: true }
    }
  }
];
