import type { Request } from "express";
import { AppError } from "../errors/AppError.js";
import type { CharacterBackgroundTextureRecord } from "../models/CharacterSheet.js";
import { isAllowedCharacterBackgroundTextureMimeType } from "../services/characterBackgroundTextureService.js";

type ObjectRecord = Record<string, unknown>;

export type CharacterBackgroundTextureSource = Omit<
  CharacterBackgroundTextureRecord,
  "updatedAt"
> & {
  updatedAt?: Date | string;
};

export type CharacterBackgroundTextureResponse =
  | {
      source: "none";
    }
  | {
      source: "predefined";
      textureId: string;
    }
  | {
      source: "uploaded";
      objectKey: string;
      imageUrl: string;
      mimeType: string;
      sizeBytes: number;
      updatedAt: string;
    };

const predefinedBackgroundTextureIds = [
  "artificer",
  "barbarian",
  "bard",
  "cleric",
  "druid",
  "fighter",
  "monk",
  "paladin",
  "ranger",
  "rogue",
  "sorcerer",
  "warlock",
  "wizard"
] as const;

const predefinedBackgroundTextureIdSet = new Set<string>(predefinedBackgroundTextureIds);

function isObjectRecord(value: unknown): value is ObjectRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function toIsoTimestamp(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function readOptionalMutationSheetPayloadValue(value: unknown) {
  return isObjectRecord(value) && "character" in value ? value.character : undefined;
}

function readBackgroundTextureImageContentType(request: Request) {
  const mimeType = String(request.headers["content-type"] ?? "")
    .split(";")[0]
    ?.trim()
    .toLowerCase();

  if (!mimeType || !isAllowedCharacterBackgroundTextureMimeType(mimeType)) {
    throw new AppError(
      "Character background texture must be a WebP or JPEG image.",
      415,
      "UNSUPPORTED_BACKGROUND_TEXTURE_TYPE",
      {
        allowedMimeTypes: ["image/webp", "image/jpeg"]
      }
    );
  }

  return mimeType;
}

function readBackgroundTextureUploadedJsonBody(value: ObjectRecord) {
  const mimeType = readString(value.mimeType)?.toLowerCase() ?? "";
  const dataBase64 = readString(value.dataBase64);

  if (!mimeType || !isAllowedCharacterBackgroundTextureMimeType(mimeType)) {
    throw new AppError(
      "Character background texture must be a WebP or JPEG image.",
      415,
      "UNSUPPORTED_BACKGROUND_TEXTURE_TYPE",
      {
        allowedMimeTypes: ["image/webp", "image/jpeg"]
      }
    );
  }

  if (!dataBase64) {
    throw new AppError(
      "Character background texture image body is required.",
      400,
      "EMPTY_BACKGROUND_TEXTURE_BODY"
    );
  }

  return {
    imageBuffer: Buffer.from(dataBase64, "base64"),
    mimeType
  };
}

function readBackgroundTextureJsonBody(value: unknown) {
  if (!isObjectRecord(value) || !isObjectRecord(value.backgroundTexture)) {
    throw new AppError(
      "Character background texture body is required.",
      400,
      "INVALID_BACKGROUND_TEXTURE_INPUT"
    );
  }

  const source = readString(value.backgroundTexture.source);

  if (source === "default") {
    return {
      source: "default" as const
    };
  }

  if (source === "none") {
    return {
      source: "none" as const
    };
  }

  if (source === "predefined") {
    const textureId = readString(value.backgroundTexture.textureId);

    if (!textureId || !predefinedBackgroundTextureIdSet.has(textureId)) {
      throw new AppError(
        "Character background texture id is invalid.",
        400,
        "INVALID_BACKGROUND_TEXTURE_ID"
      );
    }

    return {
      source: "predefined" as const,
      textureId
    };
  }

  if (source === "uploaded") {
    return {
      source: "uploaded" as const,
      ...readBackgroundTextureUploadedJsonBody(value.backgroundTexture)
    };
  }

  throw new AppError(
    "Character background texture source is invalid.",
    400,
    "INVALID_BACKGROUND_TEXTURE_SOURCE"
  );
}

export function readBackgroundTextureMutationBody(request: Request) {
  if (Buffer.isBuffer(request.body)) {
    return {
      source: "uploaded" as const,
      imageBuffer: request.body,
      mimeType: readBackgroundTextureImageContentType(request),
      sheetPayloadValue: undefined
    };
  }

  const backgroundTexture = readBackgroundTextureJsonBody(request.body);

  return {
    ...backgroundTexture,
    sheetPayloadValue: readOptionalMutationSheetPayloadValue(request.body)
  };
}

export function createBackgroundTextureRecord(
  mutation: ReturnType<typeof readBackgroundTextureMutationBody>,
  uploadedTexture: CharacterBackgroundTextureRecord | null
): CharacterBackgroundTextureRecord | null {
  if (mutation.source === "default") {
    return null;
  }

  if (mutation.source === "none") {
    return {
      source: "none"
    };
  }

  if (mutation.source === "predefined") {
    return {
      source: "predefined",
      textureId: mutation.textureId
    };
  }

  return uploadedTexture;
}

export function toBackgroundTextureResponse(
  backgroundTexture: CharacterBackgroundTextureSource | null | undefined
): CharacterBackgroundTextureResponse | null {
  if (!backgroundTexture) {
    return null;
  }

  if (backgroundTexture.source === "none") {
    return {
      source: "none"
    };
  }

  if (backgroundTexture.source === "predefined" && backgroundTexture.textureId) {
    return {
      source: "predefined",
      textureId: backgroundTexture.textureId
    };
  }

  if (
    backgroundTexture.source === "uploaded" &&
    backgroundTexture.objectKey &&
    backgroundTexture.imageUrl &&
    backgroundTexture.mimeType &&
    backgroundTexture.sizeBytes !== undefined
  ) {
    return {
      source: "uploaded",
      objectKey: backgroundTexture.objectKey,
      imageUrl: backgroundTexture.imageUrl,
      mimeType: backgroundTexture.mimeType,
      sizeBytes: backgroundTexture.sizeBytes,
      updatedAt: toIsoTimestamp(backgroundTexture.updatedAt) ?? new Date().toISOString()
    };
  }

  return null;
}

export function getUploadedBackgroundTextureObjectKey(
  backgroundTexture: CharacterBackgroundTextureSource | null | undefined
) {
  return backgroundTexture?.source === "uploaded" && backgroundTexture.objectKey
    ? backgroundTexture.objectKey
    : null;
}
