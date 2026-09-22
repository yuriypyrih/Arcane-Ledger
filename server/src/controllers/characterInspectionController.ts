import type { Request, Response } from "express";
import { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthenticatedLocals } from "../middleware/authMiddleware.js";
import { CharacterSheet } from "../models/CharacterSheet.js";
import { PartyGroup } from "../models/PartyGroup.js";
import { User } from "../models/User.js";
import { toCloudRecord, toCloudRosterRecord } from "./characterSheetResponses.js";

function readId(value: string | undefined, label: string) {
  if (!value || !Types.ObjectId.isValid(value)) {
    throw new AppError(`${label} id is invalid.`, 400, "INVALID_INSPECTION_ID");
  }
  return new Types.ObjectId(value);
}

function unavailable(): never {
  throw new AppError("Character sheet was not found.", 404, "CHARACTER_SHEET_NOT_FOUND");
}

async function readUserId(value: string | undefined) {
  const userId = readId(value, "User");
  if (!(await User.exists({ _id: userId }))) {
    throw new AppError("User was not found.", 404, "USER_NOT_FOUND");
  }
  return userId;
}

export const inspectPartyCharacter = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const partyGroupId = readId(request.params.partyGroupId, "Party group");
    const characterId = readId(request.params.characterSheetId, "Character sheet");
    const party = await PartyGroup.exists({
      _id: partyGroupId,
      ownerId: response.locals.authUser._id,
      characterIds: characterId
    });
    if (!party) unavailable();
    const character = await CharacterSheet.findOne({
      _id: characterId,
      partyGroupId,
      deletedAt: null
    })
      .lean()
      .exec();
    if (!character) unavailable();
    response.set("Cache-Control", "private, no-store");
    response.json({ character: toCloudRecord(character) });
  }
);

// Both administration handlers are mounted behind requireAuth + requireAdmin.
export const listUserCharactersForInspection = asyncHandler(async (request, response) => {
  const ownerId = await readUserId(request.params.userId);
  const characters = await CharacterSheet.find({ ownerId, deletedAt: null })
    .select("-sheet")
    .sort({ updatedAt: -1, _id: -1 })
    .lean()
    .exec();
  response.set("Cache-Control", "private, no-store");
  response.json({ characters: characters.map(toCloudRosterRecord), count: characters.length });
});

export const inspectUserCharacter = asyncHandler(async (request, response) => {
  const ownerId = await readUserId(request.params.userId);
  const characterId = readId(request.params.characterSheetId, "Character sheet");
  const character = await CharacterSheet.findOne({ _id: characterId, ownerId, deletedAt: null })
    .lean()
    .exec();
  if (!character) unavailable();
  response.set("Cache-Control", "private, no-store");
  response.json({ character: toCloudRecord(character) });
});
