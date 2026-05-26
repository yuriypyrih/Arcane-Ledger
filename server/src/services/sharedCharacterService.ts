import crypto from "node:crypto";
import type { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { CharacterSheet, type CharacterSheetDocument } from "../models/CharacterSheet.js";
import { SharedCharacter } from "../models/SharedCharacter.js";
import type { UserDocument } from "../models/User.js";
import { getCharacterLimitForRole } from "./characterLimits.js";

const SHARED_CHARACTER_LINK_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const SHARED_CHARACTER_LINK_LENGTH = 10;
const SHARED_CHARACTER_EXPIRES_MS = 24 * 60 * 60 * 1000;
const SHARED_CHARACTER_LINK_CREATE_ATTEMPTS = 5;
const SHARED_CHARACTER_IMPORTED_NAME_SUFFIX = " Imported";
const FALLBACK_CHARACTER_NAME = "Unnamed Character";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneObjectRecord(value: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function cloneSummaryRecord<TSummary extends Record<string, unknown>>(value: TSummary): TSummary {
  return JSON.parse(JSON.stringify(value)) as TSummary;
}

function getCharacterName(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : FALLBACK_CHARACTER_NAME;
}

function getSharedSnapshotName(character: CharacterSheetDocument) {
  const sheetSummary = isObjectRecord(character.sheet.summary) ? character.sheet.summary : {};
  const sheetIdentity = isObjectRecord(character.sheet.identity) ? character.sheet.identity : {};

  return `${getCharacterName(
    character.summary.name ?? sheetSummary.name ?? sheetIdentity.name
  )}${SHARED_CHARACTER_IMPORTED_NAME_SUFFIX}`;
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

function createSharedCharacterLink() {
  let link = "";

  for (let index = 0; index < SHARED_CHARACTER_LINK_LENGTH; index += 1) {
    link += SHARED_CHARACTER_LINK_ALPHABET[
      crypto.randomInt(SHARED_CHARACTER_LINK_ALPHABET.length)
    ];
  }

  return link;
}

export function normalizeSharedCharacterLink(value: unknown) {
  if (typeof value !== "string") {
    throw new AppError("Shared character link is required.", 400, "INVALID_SHARED_CHARACTER_LINK");
  }

  const link = value.trim().toUpperCase();

  if (!/^[A-Z0-9]+$/.test(link)) {
    throw new AppError(
      "Shared character link must use capital letters and numbers.",
      400,
      "INVALID_SHARED_CHARACTER_LINK"
    );
  }

  return link;
}

function getImportSheet(snapshotSheet: Record<string, unknown>, localId: number) {
  const sheet = cloneObjectRecord(snapshotSheet);
  const metadata = isObjectRecord(sheet.metadata) ? sheet.metadata : {};
  const { avatar: _avatar, sync: _sync, ...metadataWithoutAvatarAndSync } = metadata;
  const identity = isObjectRecord(sheet.identity) ? sheet.identity : {};
  const summary = isObjectRecord(sheet.summary) ? sheet.summary : {};

  return {
    ...sheet,
    identity: {
      ...identity,
      localId
    },
    summary: {
      ...summary,
      localId
    },
    metadata: metadataWithoutAvatarAndSync
  };
}

function getImportSummary(
  summary: CharacterSheetDocument["summary"],
  sheet: Record<string, unknown>,
  localId: number
) {
  const sheetSummary = isObjectRecord(sheet.summary) ? sheet.summary : {};

  return {
    ...cloneSummaryRecord(summary),
    localId,
    sheetSizeBytes:
      typeof sheetSummary.sheetSizeBytes === "number" ? sheetSummary.sheetSizeBytes : summary.sheetSizeBytes
  };
}

function getSharedSnapshotSummary(summary: CharacterSheetDocument["summary"], name: string) {
  return {
    ...cloneSummaryRecord(summary),
    name
  };
}

function getSharedSnapshotSheet(
  snapshotSheet: Record<string, unknown>,
  localId: number,
  name: string
) {
  const sheet = getImportSheet(snapshotSheet, localId);
  const identity = isObjectRecord(sheet.identity) ? sheet.identity : {};
  const summary = isObjectRecord(sheet.summary) ? sheet.summary : {};

  return {
    ...sheet,
    identity: {
      ...identity,
      name
    },
    summary: {
      ...summary,
      name
    }
  };
}

export async function createSharedCharacterSnapshot(options: {
  characterSheetId: string;
  ownerId: Types.ObjectId;
}) {
  const character = await CharacterSheet.findOne({
    _id: options.characterSheetId,
    ownerId: options.ownerId,
    deletedAt: null
  }).exec();

  if (!character) {
    throw new AppError("Character sheet was not found.", 404, "CHARACTER_SHEET_NOT_FOUND");
  }

  const expiresAt = new Date(Date.now() + SHARED_CHARACTER_EXPIRES_MS);
  const snapshotName = getSharedSnapshotName(character);

  for (let attempt = 0; attempt < SHARED_CHARACTER_LINK_CREATE_ATTEMPTS; attempt += 1) {
    const link = createSharedCharacterLink();

    try {
      const sharedCharacter = await SharedCharacter.create({
        link,
        sourceCharacterSheetId: character._id,
        originalOwnerId: character.ownerId,
        schemaVersion: 2,
        summary: getSharedSnapshotSummary(character.summary, snapshotName),
        sheet: getSharedSnapshotSheet(
          character.sheet,
          character.summary.localId ?? character.localId ?? 1,
          snapshotName
        ),
        expiresAt
      });

      return { link: sharedCharacter.link };
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError("Unable to create a unique shared character link.", 500, "SHARE_LINK_CREATE_FAILED");
}

export async function importSharedCharacter(options: {
  authUser?: UserDocument;
  link: string;
  localId: number;
}) {
  const sharedCharacter = await SharedCharacter.findOne({
    link: normalizeSharedCharacterLink(options.link),
    expiresAt: { $gt: new Date() }
  }).exec();

  if (!sharedCharacter) {
    throw new AppError(
      "Shared character link is invalid or expired.",
      404,
      "SHARED_CHARACTER_NOT_FOUND"
    );
  }

  const sheet = getImportSheet(sharedCharacter.sheet, options.localId);
  const summary = getImportSummary(sharedCharacter.summary, sheet, options.localId);

  if (!options.authUser) {
    return {
      mode: "local" as const,
      sheet
    };
  }

  const ownerId = options.authUser._id;
  const limit = getCharacterLimitForRole(options.authUser.role);
  const activeCount = await CharacterSheet.countDocuments({ ownerId, deletedAt: null });
  const availableSlots = Math.max(0, limit - activeCount);

  if (availableSlots <= 0) {
    throw new AppError("Character limit reached.", 409, "CHARACTER_LIMIT_REACHED", {
      limit,
      currentCount: activeCount,
      availableSlots
    });
  }

  const character = await CharacterSheet.create({
    ownerId,
    clientId: crypto.randomUUID(),
    localId: options.localId,
    schemaVersion: 2,
    revision: 1,
    summary,
    sheet
  });

  return {
    mode: "cloud" as const,
    character,
    count: activeCount + 1,
    limit
  };
}
