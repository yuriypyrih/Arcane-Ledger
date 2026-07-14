import type { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  ADMINISTRATION_USERS_PER_PAGE,
  listAdministrationUsers,
  updateAdministrationUserRole
} from "../services/administrationService.js";
import type {
  AdministrationAssignableRole,
  AdministrationUserEnvelope,
  AdministrationUserListQueryLocals
} from "../types/administration.js";
import { createPaginationEnvelope } from "../utils/pagination.js";

function readAssignableRole(body: unknown): AdministrationAssignableRole {
  if (typeof body !== "object" || body === null || !("role" in body)) {
    throw new AppError("Request body must include a role.", 400, "INVALID_USER_ROLE");
  }

  const role = body.role;

  if (role !== "user" && role !== "keeper") {
    throw new AppError("Role must be either user or keeper.", 400, "INVALID_USER_ROLE");
  }

  return role;
}

export const getAdministrationUsers = asyncHandler(
  async (request: Request, response: Response<unknown, AdministrationUserListQueryLocals>) => {
    const { count, page, results } = await listAdministrationUsers(
      response.locals.administrationUserListQuery
    );

    response.json(
      createPaginationEnvelope({
        request,
        count,
        page,
        limit: ADMINISTRATION_USERS_PER_PAGE,
        results
      })
    );
  }
);

export const patchAdministrationUserRole = asyncHandler(
  async (request: Request, response: Response<AdministrationUserEnvelope>) => {
    response.json({
      user: await updateAdministrationUserRole(
        request.params.userId ?? "",
        readAssignableRole(request.body)
      )
    });
  }
);
