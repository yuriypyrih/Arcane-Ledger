import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthenticatedLocals } from "../middleware/authMiddleware.js";
import {
  createOwnedCustomItem,
  deleteOwnedCustomItem,
  listCustomItems as listCustomItemsForUser,
  normalizeCustomItemInput,
  updateOwnedCustomItem
} from "../services/customItemService.js";

export const listCustomItems = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const scope = request.query.scope === "public" ? "public" : "mine";

    response.json({
      customItems: await listCustomItemsForUser({
        ownerId: response.locals.authUser._id,
        scope
      })
    });
  }
);

export const createCustomItem = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const customItem = await createOwnedCustomItem({
      input: normalizeCustomItemInput(request.body, {
        ownerRole: response.locals.authUser.role
      }),
      ownerId: response.locals.authUser._id,
      ownerRole: response.locals.authUser.role
    });

    response.status(201).json({ customItem });
  }
);

export const updateCustomItem = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      customItem: await updateOwnedCustomItem({
        customItemId: request.params.customItemId ?? "",
        input: normalizeCustomItemInput(request.body, {
          ownerRole: response.locals.authUser.role
        }),
        ownerId: response.locals.authUser._id
      })
    });
  }
);

export const deleteCustomItem = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json(
      await deleteOwnedCustomItem({
        customItemId: request.params.customItemId ?? "",
        ownerId: response.locals.authUser._id
      })
    );
  }
);
