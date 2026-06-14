import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthenticatedLocals } from "../middleware/authMiddleware.js";
import {
  createOwnedPartyGroup,
  deleteOwnedPartyGroup,
  getMemberVisiblePartyGroupDetail,
  getMemberVisiblePartyGroupLiveEncounter,
  getOwnedPartyGroupDetail,
  getPartyGroupMasterChest,
  joinPartyGroup,
  leavePartyGroup,
  listCharacterPartyMemberships,
  listOwnedPartyGroups,
  normalizePartyGroupName,
  removePartyGroupCharacter,
  resetOwnedPartyGroupInviteToken,
  updatePartyGroupMasterChest,
  updateOwnedPartyGroupName
} from "../services/partyGroupService.js";
import { updateMemberVisibleCampaignLiveEncounterTrackerTurn } from "../services/liveEncounterPlayerTurnService.js";
import { AppError } from "../errors/AppError.js";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(
      `Request body must include "${fieldName}".`,
      400,
      "INVALID_PARTY_GROUP_INPUT",
      {
        field: fieldName
      }
    );
  }

  return value;
}

export const listPartyGroups = asyncHandler(
  async (_request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      partyGroups: await listOwnedPartyGroups(response.locals.authUser._id)
    });
  }
);

export const createPartyGroup = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    if (!isObjectRecord(request.body)) {
      throw new AppError("Request body must be a JSON object.", 400, "INVALID_PARTY_GROUP_INPUT");
    }

    const partyGroup = await createOwnedPartyGroup({
      name: normalizePartyGroupName(request.body.name),
      ownerId: response.locals.authUser._id,
      ownerRole: response.locals.authUser.role
    });

    response.status(201).json({ partyGroup });
  }
);

export const getPartyGroup = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      partyGroup: await getOwnedPartyGroupDetail({
        ownerId: response.locals.authUser._id,
        partyGroupId: request.params.partyGroupId ?? ""
      })
    });
  }
);

export const getPartyGroupMemberView = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      partyGroup: await getMemberVisiblePartyGroupDetail({
        ownerId: response.locals.authUser._id,
        partyGroupId: request.params.partyGroupId ?? ""
      })
    });
  }
);

export const getPartyGroupLiveEncounter = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json(
      await getMemberVisiblePartyGroupLiveEncounter({
        ownerId: response.locals.authUser._id,
        partyGroupId: request.params.partyGroupId ?? ""
      })
    );
  }
);

export const updatePartyGroupLiveEncounterTurn = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    if (!isObjectRecord(request.body)) {
      throw new AppError(
        "Request body must be a JSON object.",
        400,
        "INVALID_LIVE_ENCOUNTER_INPUT"
      );
    }

    response.json(
      await updateMemberVisibleCampaignLiveEncounterTrackerTurn({
        ownerId: response.locals.authUser._id,
        partyGroupId: request.params.partyGroupId ?? "",
        payload: request.body
      })
    );
  }
);

export const getPartyGroupMasterChestContent = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      masterChest: await getPartyGroupMasterChest({
        ownerId: response.locals.authUser._id,
        partyGroupId: request.params.partyGroupId ?? ""
      })
    });
  }
);

export const updatePartyGroupMasterChestContent = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    if (!isObjectRecord(request.body)) {
      throw new AppError("Request body must be a JSON object.", 400, "INVALID_MASTER_CHEST_INPUT");
    }

    response.json({
      masterChest: await updatePartyGroupMasterChest({
        actorCharacterId: request.body.actorCharacterId,
        actorNickname: response.locals.authUser.nickname,
        baseRevision: request.body.baseRevision,
        currencies: request.body.currencies,
        inventoryItems: request.body.inventoryItems,
        ownerId: response.locals.authUser._id,
        partyGroupId: request.params.partyGroupId ?? "",
        transactionSummary: request.body.transactionSummary
      })
    });
  }
);

export const deletePartyGroup = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json(
      await deleteOwnedPartyGroup({
        ownerId: response.locals.authUser._id,
        partyGroupId: request.params.partyGroupId ?? ""
      })
    );
  }
);

export const updatePartyGroup = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    if (!isObjectRecord(request.body)) {
      throw new AppError("Request body must be a JSON object.", 400, "INVALID_PARTY_GROUP_INPUT");
    }

    response.json({
      partyGroup: await updateOwnedPartyGroupName({
        name: normalizePartyGroupName(request.body.name),
        ownerId: response.locals.authUser._id,
        partyGroupId: request.params.partyGroupId ?? ""
      })
    });
  }
);

export const resetPartyGroupInviteToken = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      partyGroup: await resetOwnedPartyGroupInviteToken({
        ownerId: response.locals.authUser._id,
        partyGroupId: request.params.partyGroupId ?? ""
      })
    });
  }
);

export const removePartyGroupCharacterById = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      partyGroup: await removePartyGroupCharacter({
        characterSheetId: request.params.characterSheetId ?? "",
        ownerId: response.locals.authUser._id,
        partyGroupId: request.params.partyGroupId ?? ""
      })
    });
  }
);

export const leavePartyGroupMembership = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json(
      await leavePartyGroup({
        characterSheetId: request.params.characterSheetId ?? "",
        ownerId: response.locals.authUser._id,
        partyGroupId: request.params.partyGroupId ?? ""
      })
    );
  }
);

export const joinPartyGroupByInvite = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    if (!isObjectRecord(request.body)) {
      throw new AppError("Request body must be a JSON object.", 400, "INVALID_PARTY_JOIN_INPUT");
    }

    const result = await joinPartyGroup({
      invite: readRequiredString(request.body.invite, "invite"),
      characterSheetId: readRequiredString(request.body.characterSheetId, "characterSheetId"),
      ownerId: response.locals.authUser._id
    });

    response.status(201).json(result);
  }
);

export const listMyPartyMemberships = asyncHandler(
  async (_request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    response.json({
      memberships: await listCharacterPartyMemberships(response.locals.authUser._id)
    });
  }
);
