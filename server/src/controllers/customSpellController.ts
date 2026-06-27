import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthenticatedLocals } from "../middleware/authMiddleware.js";
import {
  createOwnedCustomSpell,
  deleteOwnedCustomSpell,
  listCustomSpells as listCustomSpellsForUser,
  normalizeCustomSpellInput,
  updateOwnedCustomSpell
} from "../services/customSpellService.js";

export const listCustomSpells = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const scope = request.query.scope === "public" ? "public" : "mine";

    response.json({
      customSpells: await listCustomSpellsForUser({
        ownerId: response.locals.authUser._id,
        scope
      })
    });
  }
);

export const createCustomSpell = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const customSpell = await createOwnedCustomSpell({
      input: normalizeCustomSpellInput(request.body, {
        ownerRole: response.locals.authUser.role
      }),
      ownerId: response.locals.authUser._id,
      ownerRole: response.locals.authUser.role
    });

    response.status(201).json({ customSpell });
  }
);

export const updateCustomSpell = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      customSpell: await updateOwnedCustomSpell({
        customSpellId: request.params.customSpellId ?? "",
        input: normalizeCustomSpellInput(request.body, {
          ownerRole: response.locals.authUser.role
        }),
        ownerId: response.locals.authUser._id
      })
    });
  }
);

export const deleteCustomSpell = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json(
      await deleteOwnedCustomSpell({
        customSpellId: request.params.customSpellId ?? "",
        ownerId: response.locals.authUser._id
      })
    );
  }
);
