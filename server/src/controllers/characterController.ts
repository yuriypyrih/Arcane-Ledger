import type { Request, Response } from "express";
import { Types } from "mongoose";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthenticatedLocals } from "../middleware/authMiddleware.js";
import {
  CharacterSheet,
  type CharacterSheetDocument,
  type CharacterSheetSummaryRecord
} from "../models/CharacterSheet.js";
import {
  isAllowedCharacterAvatarMimeType,
  saveCharacterAvatarToS3
} from "../services/characterAvatarService.js";
import { getCharacterLimitForRole } from "../services/characterLimits.js";

type ObjectRecord = Record<string, unknown>;

type CharacterSheetCloudDocument = {
  id: string;
  ownerId: string;
  clientId: string;
  localId?: number;
  schemaVersion: 2;
  revision: number;
  summary: CharacterSheetDocument["summary"];
  sheet: Record<string, unknown>;
  createdAt: string | null;
  updatedAt: string | null;
};

type CharacterSheetCloudRosterDocument = Omit<CharacterSheetCloudDocument, "sheet">;

type CharacterSheetCloudSource = {
  _id?: Types.ObjectId | { toString(): string };
  id?: string;
  ownerId: Types.ObjectId | { toString(): string } | string;
  clientId: string;
  localId?: number | null;
  schemaVersion: 2;
  revision: number;
  summary: CharacterSheetSummaryRecord;
  sheet: Record<string, unknown>;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

type CharacterSheetRosterSource = Omit<CharacterSheetCloudSource, "sheet"> & {
  sheet?: unknown;
};

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

function readPositiveInteger(value: unknown): number | null {
  const numberValue = Math.floor(Number(value));

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

function readCharacterSheetId(value: string | undefined) {
  if (!value || !Types.ObjectId.isValid(value)) {
    throw new AppError("Character sheet id is invalid.", 400, "INVALID_CHARACTER_SHEET_ID");
  }

  return value;
}

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

function readPortableCharacterSheet(value: unknown): Record<string, unknown> {
  if (!isObjectRecord(value) || value.schemaVersion !== 2) {
    throw new AppError("Portable character sheet must use schemaVersion 2.", 400, "INVALID_SHEET");
  }

  const requiredGroups = [
    "identity",
    "origin",
    "progression",
    "abilities",
    "vitals",
    "resources",
    "spellcasting",
    "features",
    "proficiencies",
    "inventory",
    "companions",
    "session",
    "preferences",
    "summary"
  ];

  if (!requiredGroups.every((group) => isObjectRecord(value[group]))) {
    throw new AppError("Portable character sheet is missing required groups.", 400, "INVALID_SHEET");
  }

  return value;
}

function getSheetGroup(sheet: Record<string, unknown>, key: string): ObjectRecord {
  return isObjectRecord(sheet[key]) ? sheet[key] : {};
}

function readSheetClientId(payload: ObjectRecord, sheet: Record<string, unknown>) {
  const metadata = getSheetGroup(sheet, "metadata");
  const sync = isObjectRecord(metadata.sync) ? metadata.sync : {};
  const clientId = readString(payload.clientId) ?? readString(sync.clientId);

  if (!clientId) {
    throw new AppError("Character sheet clientId is required.", 400, "INVALID_CLIENT_ID");
  }

  return clientId;
}

function readSheetLocalId(payload: ObjectRecord, sheet: Record<string, unknown>) {
  const identity = getSheetGroup(sheet, "identity");
  const summary = getSheetGroup(sheet, "summary");

  return (
    readPositiveInteger(payload.localId) ??
    readPositiveInteger(identity.localId) ??
    readPositiveInteger(summary.localId) ??
    undefined
  );
}

function readSheetLevel(value: unknown) {
  const level = readPositiveInteger(value);

  if (!level) {
    return 1;
  }

  return Math.min(level, 100);
}

function buildCharacterSheetSummary(sheet: Record<string, unknown>) {
  const identity = getSheetGroup(sheet, "identity");
  const origin = getSheetGroup(sheet, "origin");
  const progression = getSheetGroup(sheet, "progression");
  const summary = getSheetGroup(sheet, "summary");
  const subclassId = readString(summary.subclassId) ?? readString(progression.subclassId);

  return {
    localId:
      readPositiveInteger(summary.localId) ??
      readPositiveInteger(identity.localId) ??
      undefined,
    name: readString(summary.name) ?? readString(identity.name) ?? "Unnamed Character",
    species: readString(summary.species) ?? readString(origin.species) ?? "Unknown",
    className: readString(summary.className) ?? readString(progression.className) ?? "Unknown",
    ...(subclassId ? { subclassId } : { subclassId: null }),
    level: readSheetLevel(summary.level ?? progression.level),
    background: readString(summary.background) ?? readString(origin.background) ?? "Unknown",
    sheetSizeBytes: readPositiveInteger(summary.sheetSizeBytes) ?? undefined
  };
}

function stripLocalSyncMetadata(sheet: Record<string, unknown>) {
  const metadata = getSheetGroup(sheet, "metadata");
  const { sync: _sync, ...storedMetadata } = metadata;

  return {
    ...sheet,
    metadata: storedMetadata
  };
}

function toIsoTimestamp(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function getDocumentId(document: Pick<CharacterSheetCloudSource, "_id" | "id">) {
  return document.id ?? document._id?.toString() ?? "";
}

function toCloudRecord(document: CharacterSheetCloudSource): CharacterSheetCloudDocument {
  return {
    id: getDocumentId(document),
    ownerId: document.ownerId.toString(),
    clientId: document.clientId,
    ...(document.localId ? { localId: document.localId } : {}),
    schemaVersion: document.schemaVersion,
    revision: document.revision,
    summary: document.summary,
    sheet: document.sheet,
    createdAt: toIsoTimestamp(document.createdAt),
    updatedAt: toIsoTimestamp(document.updatedAt)
  };
}

function toCloudRosterRecord(document: CharacterSheetRosterSource): CharacterSheetCloudRosterDocument {
  return {
    id: getDocumentId(document),
    ownerId: document.ownerId.toString(),
    clientId: document.clientId,
    ...(document.localId ? { localId: document.localId } : {}),
    schemaVersion: document.schemaVersion,
    revision: document.revision,
    summary: document.summary,
    createdAt: toIsoTimestamp(document.createdAt),
    updatedAt: toIsoTimestamp(document.updatedAt)
  };
}

function readSheetPayload(value: unknown) {
  if (!isObjectRecord(value)) {
    throw new AppError("Request body must be a JSON object.", 400, "INVALID_SHEET_INPUT");
  }

  const sheet = readPortableCharacterSheet(value.sheet);
  const clientId = readSheetClientId(value, sheet);

  return {
    clientId,
    force: value.force === true,
    localId: readSheetLocalId(value, sheet),
    baseRevision: readPositiveInteger(value.baseRevision) ?? undefined,
    sheet: stripLocalSyncMetadata(sheet),
    summary: buildCharacterSheetSummary(sheet)
  };
}

export const listCharacterSheets = asyncHandler(
  async (_request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const ownerId = response.locals.authUser._id;
    const characters = (await CharacterSheet.find({
      ownerId,
      deletedAt: null
    })
      .select("_id ownerId clientId localId schemaVersion revision summary createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .lean()
      .exec()) as CharacterSheetRosterSource[];
    const limit = getCharacterLimitForRole(response.locals.authUser.role);

    response.json({
      characters: characters.map(toCloudRosterRecord),
      count: characters.length,
      limit
    });
  }
);

export const listFullCharacterSheets = asyncHandler(
  async (_request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const ownerId = response.locals.authUser._id;
    const characters = (await CharacterSheet.find({
      ownerId,
      deletedAt: null
    })
      .sort({ updatedAt: -1 })
      .lean()
      .exec()) as CharacterSheetCloudSource[];
    const limit = getCharacterLimitForRole(response.locals.authUser.role);

    response.json({
      characters: characters.map(toCloudRecord),
      count: characters.length,
      limit
    });
  }
);

export const getCharacterSheet = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const characterSheetId = readCharacterSheetId(request.params.characterSheetId);
    const character = (await CharacterSheet.findOne({
      _id: characterSheetId,
      ownerId: response.locals.authUser._id,
      deletedAt: null
    })
      .lean()
      .exec()) as CharacterSheetCloudSource | null;

    if (!character) {
      throw new AppError("Character sheet was not found.", 404, "CHARACTER_SHEET_NOT_FOUND");
    }

    response.json({ character: toCloudRecord(character) });
  }
);

export const importCharacterSheets = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    if (!isObjectRecord(request.body) || !Array.isArray(request.body.records)) {
      throw new AppError("Request body must include a records array.", 400, "INVALID_IMPORT_INPUT");
    }

    const payloads = request.body.records.map((record) => readSheetPayload(record));
    const clientIds = [...new Set(payloads.map((payload) => payload.clientId))];

    if (clientIds.length !== payloads.length) {
      throw new AppError("Import records must use unique client ids.", 400, "DUPLICATE_CLIENT_ID");
    }

    const ownerId = response.locals.authUser._id;
    const limit = getCharacterLimitForRole(response.locals.authUser.role);
    const existingCharacters = await CharacterSheet.find({
      ownerId,
      clientId: { $in: clientIds }
    }).exec();
    const existingByClientId = new Map(
      existingCharacters.map((character) => [character.clientId, character])
    );
    const activeCount = await CharacterSheet.countDocuments({ ownerId, deletedAt: null });
    const newCharacterCount = payloads.filter((payload) => {
      const existingCharacter = existingByClientId.get(payload.clientId);

      return !existingCharacter || existingCharacter.deletedAt;
    }).length;
    const availableSlots = Math.max(0, limit - activeCount);

    if (newCharacterCount > availableSlots) {
      throw new AppError("Character limit reached.", 409, "CHARACTER_LIMIT_REACHED", {
        limit,
        currentCount: activeCount,
        availableSlots
      });
    }

    const importedCharacters: CharacterSheetDocument[] = [];

    for (const payload of payloads) {
      const existingCharacter = existingByClientId.get(payload.clientId);

      if (existingCharacter && !existingCharacter.deletedAt) {
        importedCharacters.push(existingCharacter);
        continue;
      }

      if (existingCharacter) {
        existingCharacter.localId = payload.localId;
        existingCharacter.schemaVersion = 2;
        existingCharacter.revision += 1;
        existingCharacter.summary = payload.summary;
        existingCharacter.sheet = payload.sheet;
        existingCharacter.deletedAt = null;
        importedCharacters.push(await existingCharacter.save());
        continue;
      }

      importedCharacters.push(
        await CharacterSheet.create({
          ownerId,
          clientId: payload.clientId,
          localId: payload.localId,
          schemaVersion: 2,
          revision: 1,
          summary: payload.summary,
          sheet: payload.sheet
        })
      );
    }

    response.status(201).json({
      characters: importedCharacters.map(toCloudRecord),
      count: activeCount + newCharacterCount,
      limit
    });
  }
);

export const saveCharacterSheet = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const characterSheetId = readCharacterSheetId(request.params.characterSheetId);
    const payload = readSheetPayload(request.body);
    const character = await CharacterSheet.findOne({
      _id: characterSheetId,
      ownerId: response.locals.authUser._id,
      deletedAt: null
    }).exec();

    if (!character) {
      throw new AppError("Character sheet was not found.", 404, "CHARACTER_SHEET_NOT_FOUND");
    }

    if (payload.clientId !== character.clientId) {
      throw new AppError("Character sheet clientId cannot change.", 400, "CLIENT_ID_MISMATCH");
    }

    if (!payload.force && (!payload.baseRevision || payload.baseRevision !== character.revision)) {
      throw new AppError("Character sheet has changed on the server.", 409, "REVISION_CONFLICT", {
        serverRevision: character.revision
      });
    }

    character.localId = payload.localId;
    character.summary = payload.summary;
    character.sheet = payload.sheet;
    character.revision += 1;

    response.json({ character: toCloudRecord(await character.save()) });
  }
);

export const deleteCharacterSheet = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const characterSheetId = readCharacterSheetId(request.params.characterSheetId);
    const character = await CharacterSheet.findOne({
      _id: characterSheetId,
      ownerId: response.locals.authUser._id,
      deletedAt: null
    }).exec();

    if (!character) {
      throw new AppError("Character sheet was not found.", 404, "CHARACTER_SHEET_NOT_FOUND");
    }

    character.deletedAt = new Date();
    await character.save();
    response.json({ character: toCloudRecord(character) });
  }
);

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
