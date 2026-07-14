import type { UserRole } from "./auth.js";

export const ADMINISTRATION_USER_ORDERINGS = [
  "nickname",
  "-nickname",
  "email",
  "-email",
  "role",
  "-role",
  "createdAt",
  "-createdAt",
  "lastActive",
  "-lastActive"
] as const;

export type AdministrationUserOrdering = (typeof ADMINISTRATION_USER_ORDERINGS)[number];

export type AdministrationUser = {
  id: string;
  nickname: string;
  email: string;
  role: UserRole;
  createdAt: string | null;
  lastActive: string | null;
};

export type AdministrationUserListQuery = {
  page: number;
  search?: string;
  ordering: AdministrationUserOrdering;
};

export type AdministrationUserListQueryLocals = {
  administrationUserListQuery: AdministrationUserListQuery;
};

export type AdministrationAssignableRole = Exclude<UserRole, "admin">;

export type AdministrationUserRoleUpdate = {
  role: AdministrationAssignableRole;
};

export type AdministrationUserEnvelope = {
  user: AdministrationUser;
};
