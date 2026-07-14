import type {
  AdministrationUserEnvelope,
  AdministrationUserListQuery,
  AdministrationUserListResponse,
  AdministrationUserRoleUpdate
} from "../types/administration";
import { apiGet, apiPatch, type ApiRequestOptions } from "./client";

export function fetchAdministrationUsers(
  { page = 1, search, ordering = "-createdAt" }: AdministrationUserListQuery = {},
  options?: ApiRequestOptions
) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("ordering", ordering);

  if (search) {
    searchParams.set("search", search);
  }

  return apiGet<AdministrationUserListResponse>(
    `administration/users?${searchParams.toString()}`,
    options
  );
}

export function updateAdministrationUserRole(
  userId: string,
  update: AdministrationUserRoleUpdate,
  options?: ApiRequestOptions
) {
  return apiPatch<AdministrationUserEnvelope>(
    `administration/users/${encodeURIComponent(userId)}/role`,
    update,
    options
  );
}
