import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthenticatedLocals } from "../middleware/authMiddleware.js";
import {
  createOwnedCustomBestiary,
  deleteOwnedCustomBestiary,
  listCustomBestiary as listCustomBestiaryForUser,
  normalizeCustomBestiaryInput,
  updateOwnedCustomBestiary
} from "../services/customBestiaryService.js";

export const listCustomBestiary = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const scope = request.query.scope === "public" ? "public" : "mine";

    response.json({
      customBestiary: await listCustomBestiaryForUser({
        ownerId: response.locals.authUser._id,
        scope
      })
    });
  }
);

export const createCustomBestiary = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const customCreature = await createOwnedCustomBestiary({
      input: normalizeCustomBestiaryInput(request.body, {
        ownerRole: response.locals.authUser.role
      }),
      ownerId: response.locals.authUser._id,
      ownerRole: response.locals.authUser.role
    });

    response.status(201).json({ customCreature });
  }
);

export const updateCustomBestiary = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      customCreature: await updateOwnedCustomBestiary({
        customBestiaryId: request.params.customBestiaryId ?? "",
        input: normalizeCustomBestiaryInput(request.body, {
          ownerRole: response.locals.authUser.role
        }),
        ownerId: response.locals.authUser._id
      })
    });
  }
);

export const deleteCustomBestiary = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json(
      await deleteOwnedCustomBestiary({
        customBestiaryId: request.params.customBestiaryId ?? "",
        ownerId: response.locals.authUser._id
      })
    );
  }
);
