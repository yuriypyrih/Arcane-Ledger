import type { Types } from "mongoose";
import type {
  CharacterAvatarRecord,
  CharacterBackgroundTextureRecord,
  CharacterSheetDocument,
  CharacterSheetSummaryRecord
} from "../models/CharacterSheet.js";
import {
  toBackgroundTextureResponse,
  type CharacterBackgroundTextureResponse
} from "./characterBackgroundTextureControllerHelpers.js";

type CharacterAvatarSource = {
  objectKey: string;
  imageUrl: string;
  mimeType: string;
  sizeBytes: number;
  updatedAt: Date | string;
};

type CharacterAvatarResponse = {
  objectKey: string;
  imageUrl: string;
  mimeType: string;
  sizeBytes: number;
  updatedAt: string;
};

type CharacterSheetCloudDocument = {
  id: string;
  ownerId: string;
  clientId: string;
  localId?: number;
  schemaVersion: 2 | 3;
  revision: number;
  summary: CharacterSheetDocument["summary"];
  sheet: Record<string, unknown>;
  avatar: CharacterAvatarResponse | null;
  backgroundTexture: CharacterBackgroundTextureResponse | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type CharacterSheetCloudRosterDocument = Omit<CharacterSheetCloudDocument, "sheet">;

export type CharacterSheetCloudSource = {
  _id?: Types.ObjectId | { toString(): string };
  id?: string;
  ownerId: Types.ObjectId | { toString(): string } | string;
  clientId: string;
  localId?: number | null;
  schemaVersion: 2 | 3;
  revision: number;
  summary: CharacterSheetSummaryRecord;
  sheet: Record<string, unknown>;
  avatar?: CharacterAvatarRecord | null;
  backgroundTexture?: CharacterBackgroundTextureRecord | null;
  deletedAt?: Date | string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type CharacterSheetRosterSource = Omit<CharacterSheetCloudSource, "sheet"> & {
  sheet?: unknown;
};

function toIsoTimestamp(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

export function toAvatarResponse(
  avatar: CharacterAvatarSource | null | undefined
): CharacterAvatarResponse | null {
  if (!avatar) {
    return null;
  }

  return {
    objectKey: avatar.objectKey,
    imageUrl: avatar.imageUrl,
    mimeType: avatar.mimeType,
    sizeBytes: avatar.sizeBytes,
    updatedAt: toIsoTimestamp(avatar.updatedAt) ?? new Date().toISOString()
  };
}

function getDocumentId(document: Pick<CharacterSheetCloudSource, "_id" | "id">) {
  return document.id ?? document._id?.toString() ?? "";
}

export function toCloudRecord(document: CharacterSheetCloudSource): CharacterSheetCloudDocument {
  return {
    id: getDocumentId(document),
    ownerId: document.ownerId.toString(),
    clientId: document.clientId,
    ...(document.localId ? { localId: document.localId } : {}),
    schemaVersion: document.schemaVersion,
    revision: document.revision,
    summary: document.summary,
    sheet: document.sheet,
    avatar: toAvatarResponse(document.avatar),
    backgroundTexture: toBackgroundTextureResponse(document.backgroundTexture),
    createdAt: toIsoTimestamp(document.createdAt),
    updatedAt: toIsoTimestamp(document.updatedAt)
  };
}

export function toCloudRosterRecord(
  document: CharacterSheetRosterSource
): CharacterSheetCloudRosterDocument {
  return {
    id: getDocumentId(document),
    ownerId: document.ownerId.toString(),
    clientId: document.clientId,
    ...(document.localId ? { localId: document.localId } : {}),
    schemaVersion: document.schemaVersion,
    revision: document.revision,
    summary: document.summary,
    avatar: toAvatarResponse(document.avatar),
    backgroundTexture: toBackgroundTextureResponse(document.backgroundTexture),
    createdAt: toIsoTimestamp(document.createdAt),
    updatedAt: toIsoTimestamp(document.updatedAt)
  };
}
