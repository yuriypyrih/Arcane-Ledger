import type { UserRole } from "../../types/auth";

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

export const accountPrivilegeRows: AccountPrivilegeRow[] = [
  {
    feature: "Max Characters",
    values: {
      guest: { kind: "text", value: "5" },
      user: { kind: "text", value: "20" },
      keeper: { kind: "text", value: "40" },
      admin: { kind: "text", value: "40" }
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
