import type { Request, Response } from "express";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthenticatedLocals } from "../middleware/authMiddleware.js";
import {
  isAllowedCharacterAvatarMimeType,
  saveCharacterAvatarToS3
} from "../services/characterAvatarService.js";

function readLocalCharacterId(value: string | undefined) {
  const characterId = Number(value);

  if (!Number.isInteger(characterId) || characterId <= 0) {
    throw new AppError(
      "Character id must be a positive numeric local id.",
      400,
      "INVALID_CHARACTER_ID"
    );
  }

  return characterId;
}

function readImageContentType(request: Request) {
  const mimeType = String(request.headers["content-type"] ?? "")
    .split(";")[0]
    ?.trim()
    .toLowerCase();

  if (!mimeType || !isAllowedCharacterAvatarMimeType(mimeType)) {
    throw new AppError(
      "Character portrait must be a WebP or JPEG image.",
      415,
      "UNSUPPORTED_AVATAR_TYPE",
      {
        allowedMimeTypes: ["image/webp", "image/jpeg"]
      }
    );
  }

  return mimeType;
}

export const uploadCharacterPortrait = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const characterId = readLocalCharacterId(request.params.characterId);
    const mimeType = readImageContentType(request);
    const imageBuffer = Buffer.isBuffer(request.body) ? request.body : null;

    if (!imageBuffer || imageBuffer.byteLength === 0) {
      throw new AppError("Character portrait image body is required.", 400, "EMPTY_AVATAR_BODY");
    }

    if (imageBuffer.byteLength > getAppConfig().characterAvatarUploadMaxBytes) {
      throw new AppError("Character portrait image is too large.", 413, "AVATAR_TOO_LARGE", {
        maxBytes: getAppConfig().characterAvatarUploadMaxBytes
      });
    }

    response.json(
      await saveCharacterAvatarToS3({
        characterId,
        imageBuffer,
        mimeType,
        userId: response.locals.authUser.id
      })
    );
  }
);
