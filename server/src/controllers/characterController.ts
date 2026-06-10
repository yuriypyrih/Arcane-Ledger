import type { Request, Response } from "express";
import { Types } from "mongoose";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type {
  AuthenticatedLocals,
  OptionalAuthenticatedLocals
} from "../middleware/authMiddleware.js";
import {
  CharacterSheet,
  type CharacterAvatarRecord,
  type CharacterBackgroundTextureRecord,
  type CharacterEncounterStatBlockRecord,
  type CharacterSheetDocument,
  type CharacterSheetSummaryRecord
} from "../models/CharacterSheet.js";
import { PartyGroup } from "../models/PartyGroup.js";
import {
  deleteCharacterAvatarFromS3,
  isAllowedCharacterAvatarMimeType,
  saveCharacterAvatarToS3
} from "../services/characterAvatarService.js";
import {
  createBackgroundTextureRecord,
  getUploadedBackgroundTextureObjectKey,
  readBackgroundTextureMutationBody,
  toBackgroundTextureResponse,
  type CharacterBackgroundTextureResponse
} from "./characterBackgroundTextureControllerHelpers.js";
import {
  deleteCharacterBackgroundTextureFromS3,
  saveCharacterBackgroundTextureToS3
} from "../services/characterBackgroundTextureService.js";
import {
  CHARACTER_BACKGROUND_TEXTURE_OUTPUT_SIZE,
  CHARACTER_PORTRAIT_OUTPUT_HEIGHT,
  CHARACTER_PORTRAIT_OUTPUT_WIDTH,
  processCharacterImageUpload
} from "../services/characterImageProcessingService.js";
import { recordCharacterCreatedMetric } from "../services/analyticsService.js";
import { getCharacterLimitForRole } from "../services/characterLimits.js";
import {
  createSharedCharacterSnapshot,
  importSharedCharacter as importSharedCharacterFromLink,
  normalizeSharedCharacterLink
} from "../services/sharedCharacterService.js";

type ObjectRecord = Record<string, unknown>;

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
  schemaVersion: 2;
  revision: number;
  summary: CharacterSheetDocument["summary"];
  sheet: Record<string, unknown>;
  avatar: CharacterAvatarResponse | null;
  backgroundTexture: CharacterBackgroundTextureResponse | null;
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
  avatar?: CharacterAvatarRecord | null;
  backgroundTexture?: CharacterBackgroundTextureRecord | null;
  deletedAt?: Date | string | null;
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

function readIntegerInRange(value: unknown, min: number, max: number): number | null {
  const numberValue = Math.floor(Number(value));

  return Number.isFinite(numberValue) && numberValue >= min && numberValue <= max
    ? numberValue
    : null;
}

function readCharacterSheetId(value: string | undefined) {
  if (!value || !Types.ObjectId.isValid(value)) {
    throw new AppError("Character sheet id is invalid.", 400, "INVALID_CHARACTER_SHEET_ID");
  }

  return value;
}

function assertCharacterSheetIsAvailable<T extends { deletedAt?: Date | string | null }>(
  character: T | null
): asserts character is T {
  if (!character) {
    throw new AppError("Character sheet was not found.", 404, "CHARACTER_SHEET_NOT_FOUND");
  }

  if (character.deletedAt) {
    throw new AppError("Character sheet was deleted.", 410, "CHARACTER_SHEET_DELETED");
  }
}

async function findOwnedCharacterSheet(characterSheetId: string, ownerId: Types.ObjectId) {
  const character = await CharacterSheet.findOne({
    _id: characterSheetId,
    ownerId
  }).exec();

  assertCharacterSheetIsAvailable(character);

  return character;
}

async function findOwnedCharacterSheetLean(characterSheetId: string, ownerId: Types.ObjectId) {
  const character = (await CharacterSheet.findOne({
    _id: characterSheetId,
    ownerId
  })
    .lean()
    .exec()) as CharacterSheetCloudSource | null;

  assertCharacterSheetIsAvailable(character);

  return character;
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
    throw new AppError(
      "Portable character sheet is missing required groups.",
      400,
      "INVALID_SHEET"
    );
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

function readCustomDisplayName(value: unknown) {
  return isObjectRecord(value) ? readString(value.name) : null;
}

function resolveSheetDisplayName(options: {
  customConfig: unknown;
  fallback: string;
  rawValue: unknown;
  summaryValue: unknown;
}) {
  const summaryLabel = readString(options.summaryValue);
  const rawLabel = readString(options.rawValue);
  const customLabel = readCustomDisplayName(options.customConfig);

  if (customLabel && (summaryLabel === "Custom" || rawLabel === "Custom")) {
    return customLabel;
  }

  return summaryLabel ?? rawLabel ?? customLabel ?? options.fallback;
}

const encounterStatBlockAbilityKeys = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
const encounterStatBlockLabelMaxLength = 160;
const encounterStatBlockListMaxLength = 100;
const encounterStatBlockStringMaxLength = 240;
const encounterStatBlockSkillValueMin = -100;
const encounterStatBlockSkillValueMax = 100;

function createEncounterStatBlockError(message: string) {
  return new AppError(message, 400, "INVALID_ENCOUNTER_STAT_BLOCK");
}

function readEncounterRequiredString(
  value: unknown,
  field: string,
  maxLength = encounterStatBlockStringMaxLength
) {
  const stringValue = readString(value);

  if (!stringValue || stringValue.length > maxLength) {
    throw createEncounterStatBlockError(`Encounter stat block ${field} is invalid.`);
  }

  return stringValue;
}

function readEncounterOptionalString(value: unknown, field: string) {
  if (value === undefined || value === null) {
    return undefined;
  }

  return readEncounterRequiredString(value, field);
}

function readEncounterInteger(value: unknown, field: string, min: number, max: number) {
  const integerValue = readIntegerInRange(value, min, max);

  if (integerValue === null) {
    throw createEncounterStatBlockError(`Encounter stat block ${field} is invalid.`);
  }

  return integerValue;
}

function readEncounterOptionalPositiveInteger(value: unknown, field: string) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const integerValue = readPositiveInteger(value);

  if (integerValue === null) {
    throw createEncounterStatBlockError(`Encounter stat block ${field} is invalid.`);
  }

  return integerValue;
}

function readEncounterGeneratedAt(value: unknown) {
  const generatedAt = readEncounterRequiredString(value, "generatedAt", 64);

  if (Number.isNaN(Date.parse(generatedAt))) {
    throw createEncounterStatBlockError("Encounter stat block generatedAt is invalid.");
  }

  return generatedAt;
}

function readEncounterLabelList(value: unknown, field: string) {
  if (!Array.isArray(value) || value.length > encounterStatBlockListMaxLength) {
    throw createEncounterStatBlockError(`Encounter stat block ${field} is invalid.`);
  }

  return [
    ...new Set(
      value.map((entry) => {
        const label = readString(entry);

        if (!label || label.length > encounterStatBlockLabelMaxLength) {
          throw createEncounterStatBlockError(`Encounter stat block ${field} is invalid.`);
        }

        return label;
      })
    )
  ];
}

function readEncounterOptionalLabelList(value: unknown, field: string) {
  return value === undefined || value === null ? [] : readEncounterLabelList(value, field);
}

function readEncounterOptionalSkillRecord(value: unknown, field: string): Record<string, number> {
  if (value === undefined || value === null) {
    return {};
  }

  if (!isObjectRecord(value)) {
    throw createEncounterStatBlockError(`Encounter stat block ${field} is invalid.`);
  }

  const entries = Object.entries(value);

  if (entries.length > encounterStatBlockListMaxLength) {
    throw createEncounterStatBlockError(`Encounter stat block ${field} is invalid.`);
  }

  return entries.reduce<Record<string, number>>((skills, [key, skillValue]) => {
    const label = key.trim();
    const value = readIntegerInRange(
      skillValue,
      encounterStatBlockSkillValueMin,
      encounterStatBlockSkillValueMax
    );

    if (!label || label.length > encounterStatBlockLabelMaxLength || value === null) {
      throw createEncounterStatBlockError(`Encounter stat block ${field} is invalid.`);
    }

    return {
      ...skills,
      [label]: value
    };
  }, {});
}

function readEncounterAbility(value: unknown, field: string) {
  if (!isObjectRecord(value)) {
    throw createEncounterStatBlockError(`Encounter stat block ${field} is invalid.`);
  }

  return {
    score: readEncounterInteger(value.score, `${field}.score`, 0, 100),
    modifier: readEncounterInteger(value.modifier, `${field}.modifier`, -100, 100),
    save: readEncounterInteger(value.save, `${field}.save`, -100, 100)
  };
}

function readEncounterAbilities(value: unknown): CharacterEncounterStatBlockRecord["abilities"] {
  if (!isObjectRecord(value)) {
    throw createEncounterStatBlockError("Encounter stat block abilities are invalid.");
  }

  return encounterStatBlockAbilityKeys.reduce<CharacterEncounterStatBlockRecord["abilities"]>(
    (abilities, ability) => ({
      ...abilities,
      [ability]: readEncounterAbility(value[ability], `abilities.${ability}`)
    }),
    {} as CharacterEncounterStatBlockRecord["abilities"]
  );
}

function readOptionalEncounterStatBlock(
  value: unknown
): CharacterEncounterStatBlockRecord | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!isObjectRecord(value)) {
    throw createEncounterStatBlockError("Encounter stat block must be an object.");
  }

  if (value.version !== 1) {
    throw createEncounterStatBlockError("Encounter stat block version is unsupported.");
  }

  const temporaryHitPointsSource = readEncounterOptionalString(
    value.temporaryHitPointsSource,
    "temporaryHitPointsSource"
  );
  const magicTemporaryHitPointsSource = readEncounterOptionalString(
    value.magicTemporaryHitPointsSource,
    "magicTemporaryHitPointsSource"
  );
  const sourceLocalRevision = readEncounterOptionalPositiveInteger(
    value.sourceLocalRevision,
    "sourceLocalRevision"
  );
  const sourceRemoteRevision = readEncounterOptionalPositiveInteger(
    value.sourceRemoteRevision,
    "sourceRemoteRevision"
  );

  return {
    version: 1,
    name: readEncounterRequiredString(value.name, "name"),
    typeLabel: readEncounterRequiredString(value.typeLabel, "typeLabel"),
    alignment: readEncounterRequiredString(value.alignment, "alignment"),
    level: readEncounterInteger(value.level, "level", 1, 100),
    className: readEncounterRequiredString(value.className, "className"),
    species: readEncounterRequiredString(value.species, "species"),
    armorClass: readEncounterInteger(value.armorClass, "armorClass", 0, 100),
    initiative: readEncounterRequiredString(value.initiative, "initiative", 32),
    speed: readEncounterRequiredString(value.speed, "speed"),
    proficiencyBonus: readEncounterInteger(value.proficiencyBonus, "proficiencyBonus", 0, 20),
    hitPoints: readEncounterInteger(value.hitPoints, "hitPoints", 0, 10000),
    currentHitPoints: readEncounterInteger(value.currentHitPoints, "currentHitPoints", 0, 10000),
    temporaryHitPoints: readEncounterInteger(
      value.temporaryHitPoints,
      "temporaryHitPoints",
      0,
      10000
    ),
    ...(temporaryHitPointsSource ? { temporaryHitPointsSource } : {}),
    magicTemporaryHitPoints: readEncounterInteger(
      value.magicTemporaryHitPoints,
      "magicTemporaryHitPoints",
      0,
      10000
    ),
    ...(magicTemporaryHitPointsSource ? { magicTemporaryHitPointsSource } : {}),
    immunities: readEncounterLabelList(value.immunities, "immunities"),
    conditionImmunities: readEncounterOptionalLabelList(
      value.conditionImmunities,
      "conditionImmunities"
    ),
    resistances: readEncounterLabelList(value.resistances, "resistances"),
    vulnerabilities: readEncounterLabelList(value.vulnerabilities, "vulnerabilities"),
    senses: readEncounterLabelList(value.senses, "senses"),
    passivePerception: readEncounterInteger(value.passivePerception, "passivePerception", 0, 100),
    languages: readEncounterLabelList(value.languages, "languages"),
    skills: readEncounterOptionalSkillRecord(value.skills, "skills"),
    abilities: readEncounterAbilities(value.abilities),
    featureTraits: readEncounterOptionalLabelList(value.featureTraits, "featureTraits"),
    reactions: readEncounterLabelList(value.reactions, "reactions"),
    generatedAt: readEncounterGeneratedAt(value.generatedAt),
    ...(sourceLocalRevision ? { sourceLocalRevision } : {}),
    ...(sourceRemoteRevision ? { sourceRemoteRevision } : {})
  };
}

function buildCharacterSheetSummary(sheet: Record<string, unknown>) {
  const identity = getSheetGroup(sheet, "identity");
  const origin = getSheetGroup(sheet, "origin");
  const progression = getSheetGroup(sheet, "progression");
  const summary = getSheetGroup(sheet, "summary");
  const subclassId = readString(summary.subclassId) ?? readString(progression.subclassId);
  const encounterStatBlock = readOptionalEncounterStatBlock(summary.encounterStatBlock);

  return {
    localId:
      readPositiveInteger(summary.localId) ?? readPositiveInteger(identity.localId) ?? undefined,
    name: readString(summary.name) ?? readString(identity.name) ?? "Unnamed Character",
    species: resolveSheetDisplayName({
      summaryValue: summary.species,
      rawValue: origin.species,
      customConfig: origin.customSpecies,
      fallback: "Unknown"
    }),
    className: resolveSheetDisplayName({
      summaryValue: summary.className,
      rawValue: progression.className,
      customConfig: progression.customClass,
      fallback: "Unknown"
    }),
    ...(subclassId ? { subclassId } : { subclassId: null }),
    level: readSheetLevel(summary.level ?? progression.level),
    background: readString(summary.background) ?? readString(origin.background) ?? "Unknown",
    sheetSizeBytes: readPositiveInteger(summary.sheetSizeBytes) ?? undefined,
    ...(encounterStatBlock ? { encounterStatBlock } : {})
  };
}

function stripLocalSyncMetadata(sheet: Record<string, unknown>) {
  const metadata = getSheetGroup(sheet, "metadata");
  const {
    avatar: _avatar,
    backgroundTexture: _backgroundTexture,
    sync: _sync,
    ...storedMetadata
  } = metadata;

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

function toAvatarResponse(
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
    avatar: toAvatarResponse(document.avatar),
    backgroundTexture: toBackgroundTextureResponse(document.backgroundTexture),
    createdAt: toIsoTimestamp(document.createdAt),
    updatedAt: toIsoTimestamp(document.updatedAt)
  };
}

function toCloudRosterRecord(
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

type CharacterSheetPayload = ReturnType<typeof readSheetPayload>;

function assertCanApplyCharacterSheetPayload(
  character: CharacterSheetDocument,
  payload: CharacterSheetPayload
) {
  if (payload.clientId !== character.clientId) {
    throw new AppError("Character sheet clientId cannot change.", 400, "CLIENT_ID_MISMATCH");
  }

  if (!payload.force && (!payload.baseRevision || payload.baseRevision !== character.revision)) {
    throw new AppError("Character sheet has changed on the server.", 409, "REVISION_CONFLICT", {
      serverRevision: character.revision
    });
  }
}

function applyCharacterSheetPayload(
  character: CharacterSheetDocument,
  payload: CharacterSheetPayload
) {
  character.localId = payload.localId;
  character.summary = payload.summary;
  character.sheet = payload.sheet;
}

function readOptionalCharacterMutationPayload(value: unknown) {
  if (!isObjectRecord(value) || !("character" in value)) {
    return null;
  }

  return readSheetPayload(value.character);
}

export const listCharacterSheets = asyncHandler(
  async (_request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const ownerId = response.locals.authUser._id;
    const characters = (await CharacterSheet.find({
      ownerId,
      deletedAt: null
    })
      .select(
        "_id ownerId clientId localId schemaVersion revision summary avatar backgroundTexture createdAt updatedAt"
      )
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
    const character = await findOwnedCharacterSheetLean(
      characterSheetId,
      response.locals.authUser._id
    );

    response.json({ character: toCloudRecord(character) });
  }
);

export const shareCharacterSheet = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const characterSheetId = readCharacterSheetId(request.params.characterSheetId);

    await findOwnedCharacterSheetLean(characterSheetId, response.locals.authUser._id);

    const { link } = await createSharedCharacterSnapshot({
      characterSheetId,
      ownerId: response.locals.authUser._id
    });

    response.status(201).json({ link });
  }
);

export const importSharedCharacter = asyncHandler(
  async (request: Request, response: Response<unknown, OptionalAuthenticatedLocals>) => {
    if (!isObjectRecord(request.body)) {
      throw new AppError("Request body must be a JSON object.", 400, "INVALID_SHARED_IMPORT_INPUT");
    }

    const localId = readPositiveInteger(request.body.localId);

    if (!localId) {
      throw new AppError("Import localId is required.", 400, "INVALID_IMPORT_LOCAL_ID");
    }

    const result = await importSharedCharacterFromLink({
      authUser: response.locals.authUser,
      link: normalizeSharedCharacterLink(request.body.link),
      localId
    });

    if (result.mode === "local") {
      response.status(201).json(result);
      return;
    }

    response.status(201).json({
      mode: result.mode,
      character: toCloudRecord(result.character),
      count: result.count,
      limit: result.limit
    });
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
    const deletedExistingCharacter = existingCharacters.find((character) => character.deletedAt);

    if (deletedExistingCharacter) {
      throw new AppError("Character sheet was deleted.", 410, "CHARACTER_SHEET_DELETED");
    }

    const activeCount = await CharacterSheet.countDocuments({ ownerId, deletedAt: null });
    const newCharacterCount = payloads.filter(
      (payload) => !existingByClientId.has(payload.clientId)
    ).length;
    const availableSlots = Math.max(0, limit - activeCount);

    if (newCharacterCount > availableSlots) {
      throw new AppError("Character limit reached.", 409, "CHARACTER_LIMIT_REACHED", {
        limit,
        currentCount: activeCount,
        availableSlots
      });
    }

    const importedCharacters: CharacterSheetDocument[] = [];
    let createdCharacterCount = 0;

    for (const payload of payloads) {
      const existingCharacter = existingByClientId.get(payload.clientId);

      if (existingCharacter) {
        importedCharacters.push(existingCharacter);
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
      createdCharacterCount += 1;
    }

    await recordCharacterCreatedMetric(createdCharacterCount, "characters/import");

    response.status(201).json({
      characters: importedCharacters.map(toCloudRecord),
      count: activeCount + createdCharacterCount,
      limit
    });
  }
);

export const saveCharacterSheet = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const characterSheetId = readCharacterSheetId(request.params.characterSheetId);
    const payload = readSheetPayload(request.body);
    const character = await findOwnedCharacterSheet(characterSheetId, response.locals.authUser._id);

    assertCanApplyCharacterSheetPayload(character, payload);
    applyCharacterSheetPayload(character, payload);
    character.revision += 1;

    response.json({ character: toCloudRecord(await character.save()) });
  }
);

export const deleteCharacterSheet = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const characterSheetId = readCharacterSheetId(request.params.characterSheetId);
    const character = await findOwnedCharacterSheet(characterSheetId, response.locals.authUser._id);

    const characterRecord = toCloudRecord(character);
    const previousObjectKey = character.avatar?.objectKey;
    const previousBackgroundTextureObjectKey = getUploadedBackgroundTextureObjectKey(
      character.backgroundTexture
    );

    await PartyGroup.updateMany(
      {
        characterIds: character._id
      },
      {
        $pull: {
          characterIds: character._id
        }
      }
    ).exec();

    await character.deleteOne();

    if (previousObjectKey) {
      deleteCharacterAvatarFromS3(previousObjectKey).catch((error: unknown) => {
        warnAvatarDeleteFailure(previousObjectKey, error);
      });
    }

    if (previousBackgroundTextureObjectKey) {
      deleteCharacterBackgroundTextureFromS3(previousBackgroundTextureObjectKey).catch(
        (error: unknown) => {
          warnBackgroundTextureDeleteFailure(previousBackgroundTextureObjectKey, error);
        }
      );
    }

    response.json({ character: characterRecord });
  }
);

function warnAvatarDeleteFailure(objectKey: string, error: unknown) {
  if (process.env.NODE_ENV !== "test") {
    console.warn("Unable to delete previous character avatar from S3.", {
      objectKey,
      error
    });
  }
}

function warnBackgroundTextureDeleteFailure(objectKey: string, error: unknown) {
  if (process.env.NODE_ENV !== "test") {
    console.warn("Unable to delete previous character background texture from S3.", {
      objectKey,
      error
    });
  }
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

function readPortraitJsonBody(value: unknown) {
  if (!isObjectRecord(value) || !isObjectRecord(value.portrait)) {
    throw new AppError("Character portrait image body is required.", 400, "EMPTY_AVATAR_BODY");
  }

  const mimeType = readString(value.portrait.mimeType)?.toLowerCase() ?? "";
  const dataBase64 = readString(value.portrait.dataBase64);

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

  if (!dataBase64) {
    throw new AppError("Character portrait image body is required.", 400, "EMPTY_AVATAR_BODY");
  }

  return {
    imageBuffer: Buffer.from(dataBase64, "base64"),
    mimeType
  };
}

function readPortraitUploadBody(request: Request) {
  if (Buffer.isBuffer(request.body)) {
    return {
      imageBuffer: request.body,
      mimeType: readImageContentType(request),
      sheetPayload: null
    };
  }

  const portrait = readPortraitJsonBody(request.body);

  return {
    ...portrait,
    sheetPayload: readOptionalCharacterMutationPayload(request.body)
  };
}

export const uploadCharacterPortrait = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const characterSheetId = readCharacterSheetId(request.params.characterSheetId);
    const { imageBuffer, sheetPayload } = readPortraitUploadBody(request);

    if (!imageBuffer || imageBuffer.byteLength === 0) {
      throw new AppError("Character portrait image body is required.", 400, "EMPTY_AVATAR_BODY");
    }

    if (imageBuffer.byteLength > getAppConfig().characterAvatarUploadMaxBytes) {
      throw new AppError("Character portrait image is too large.", 413, "AVATAR_TOO_LARGE", {
        maxBytes: getAppConfig().characterAvatarUploadMaxBytes
      });
    }

    const character = await findOwnedCharacterSheet(characterSheetId, response.locals.authUser._id);

    if (sheetPayload) {
      assertCanApplyCharacterSheetPayload(character, sheetPayload);
    }

    const previousObjectKey = character.avatar?.objectKey;
    const processedAvatar = await processCharacterImageUpload({
      imageBuffer,
      kind: "portrait",
      outputHeight: CHARACTER_PORTRAIT_OUTPUT_HEIGHT,
      outputWidth: CHARACTER_PORTRAIT_OUTPUT_WIDTH
    });
    const nextAvatar = await saveCharacterAvatarToS3({
      characterSheetId,
      imageBuffer: processedAvatar.imageBuffer,
      mimeType: processedAvatar.mimeType
    });

    let savedCharacter: CharacterSheetDocument;

    try {
      if (sheetPayload) {
        applyCharacterSheetPayload(character, sheetPayload);
      }

      character.avatar = nextAvatar;
      character.revision += 1;
      savedCharacter = await character.save();
    } catch (error) {
      await deleteCharacterAvatarFromS3(nextAvatar.objectKey).catch((deleteError: unknown) => {
        warnAvatarDeleteFailure(nextAvatar.objectKey, deleteError);
      });
      throw error;
    }

    if (previousObjectKey && previousObjectKey !== nextAvatar.objectKey) {
      deleteCharacterAvatarFromS3(previousObjectKey).catch((error: unknown) => {
        warnAvatarDeleteFailure(previousObjectKey, error);
      });
    }

    response.json({
      avatar: toAvatarResponse(savedCharacter.avatar),
      character: toCloudRecord(savedCharacter)
    });
  }
);

export const deleteCharacterPortrait = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const characterSheetId = readCharacterSheetId(request.params.characterSheetId);
    const sheetPayload = readOptionalCharacterMutationPayload(request.body);
    const character = await findOwnedCharacterSheet(characterSheetId, response.locals.authUser._id);

    if (sheetPayload) {
      assertCanApplyCharacterSheetPayload(character, sheetPayload);
      applyCharacterSheetPayload(character, sheetPayload);
    }

    const previousObjectKey = character.avatar?.objectKey;

    character.avatar = null;
    character.revision += 1;
    const savedCharacter = await character.save();

    if (previousObjectKey) {
      deleteCharacterAvatarFromS3(previousObjectKey).catch((error: unknown) => {
        warnAvatarDeleteFailure(previousObjectKey, error);
      });
    }

    response.json({
      avatar: null,
      character: toCloudRecord(savedCharacter)
    });
  }
);

export const updateCharacterBackgroundTexture = asyncHandler(
  async (request: Request, response: Response<unknown, AuthenticatedLocals>) => {
    const characterSheetId = readCharacterSheetId(request.params.characterSheetId);
    const mutation = readBackgroundTextureMutationBody(request);
    const sheetPayload =
      mutation.sheetPayloadValue === undefined
        ? null
        : readSheetPayload(mutation.sheetPayloadValue);

    if (mutation.source === "uploaded") {
      if (!mutation.imageBuffer || mutation.imageBuffer.byteLength === 0) {
        throw new AppError(
          "Character background texture image body is required.",
          400,
          "EMPTY_BACKGROUND_TEXTURE_BODY"
        );
      }

      if (
        mutation.imageBuffer.byteLength > getAppConfig().characterBackgroundTextureUploadMaxBytes
      ) {
        throw new AppError(
          "Character background texture image is too large.",
          413,
          "BACKGROUND_TEXTURE_TOO_LARGE",
          {
            maxBytes: getAppConfig().characterBackgroundTextureUploadMaxBytes
          }
        );
      }
    }

    const character = await findOwnedCharacterSheet(characterSheetId, response.locals.authUser._id);

    if (sheetPayload) {
      assertCanApplyCharacterSheetPayload(character, sheetPayload);
    }

    const previousObjectKey = getUploadedBackgroundTextureObjectKey(character.backgroundTexture);
    const processedBackgroundTexture =
      mutation.source === "uploaded"
        ? await processCharacterImageUpload({
            imageBuffer: mutation.imageBuffer,
            kind: "background_texture",
            outputHeight: CHARACTER_BACKGROUND_TEXTURE_OUTPUT_SIZE,
            outputWidth: CHARACTER_BACKGROUND_TEXTURE_OUTPUT_SIZE
          })
        : null;
    const uploadedTexture = processedBackgroundTexture
      ? await saveCharacterBackgroundTextureToS3({
          characterSheetId,
          imageBuffer: processedBackgroundTexture.imageBuffer,
          mimeType: processedBackgroundTexture.mimeType
        })
      : null;
    const nextBackgroundTexture = createBackgroundTextureRecord(mutation, uploadedTexture);
    const nextObjectKey = getUploadedBackgroundTextureObjectKey(nextBackgroundTexture);

    let savedCharacter: CharacterSheetDocument;

    try {
      if (sheetPayload) {
        applyCharacterSheetPayload(character, sheetPayload);
      }

      character.backgroundTexture = nextBackgroundTexture;
      character.revision += 1;
      savedCharacter = await character.save();
    } catch (error) {
      if (uploadedTexture?.objectKey) {
        await deleteCharacterBackgroundTextureFromS3(uploadedTexture.objectKey).catch(
          (deleteError: unknown) => {
            warnBackgroundTextureDeleteFailure(uploadedTexture.objectKey ?? "", deleteError);
          }
        );
      }

      throw error;
    }

    if (previousObjectKey && previousObjectKey !== nextObjectKey) {
      deleteCharacterBackgroundTextureFromS3(previousObjectKey).catch((error: unknown) => {
        warnBackgroundTextureDeleteFailure(previousObjectKey, error);
      });
    }

    response.json({
      backgroundTexture: toBackgroundTextureResponse(savedCharacter.backgroundTexture),
      character: toCloudRecord(savedCharacter)
    });
  }
);
