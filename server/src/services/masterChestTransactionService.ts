import crypto from "node:crypto";
import mongoose, { Types, type ClientSession } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { CharacterSheet, type CharacterSheetDocument } from "../models/CharacterSheet.js";
import { MasterChestOperation } from "../models/MasterChestOperation.js";
import { PartyGroup, type PartyGroupDocument } from "../models/PartyGroup.js";
import { addServerBreadcrumb, captureServerMessage } from "../sentry.js";
import {
  applyMasterChestOperations,
  isMasterChestCurrencyKey,
  normalizeMasterChestInventory,
  normalizeMasterChestOperationCurrencies,
  type MasterChestInventoryItem,
  type MasterChestOperationInput
} from "./masterChestInventory.js";

const MAX_OPERATION_COUNT = 100;
const MASTER_CHEST_OBJECT_LIMIT = 200;
const INVENTORY_OBJECT_LIMIT = 200;
const CURRENCY_MAX = 999_999_999;
const HISTORY_LIMIT = 20;
const IDEMPOTENCY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type TransactionPartyGroup = PartyGroupDocument & {
  masterChestItems?: unknown[];
  masterChestCurrencies?: Record<string, unknown> | null;
  masterChestHistory?: string[] | null;
  masterChestRevision?: number | null;
};

export type MasterChestTransactionRequest = {
  operationId: string;
  actorCharacterId?: string;
  operations: MasterChestOperationInput[];
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(
      `Master chest transaction ${field} is required.`,
      400,
      "INVALID_MASTER_CHEST_OPERATION_INPUT",
      { field }
    );
  }

  return value.trim();
}

function readPositiveInteger(value: unknown, field: string) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new AppError(
      `Master chest transaction ${field} must be a positive integer.`,
      400,
      "INVALID_MASTER_CHEST_OPERATION_INPUT",
      { field }
    );
  }

  return value;
}

function readInteger(value: unknown, field: string) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new AppError(
      `Master chest transaction ${field} must be an integer.`,
      400,
      "INVALID_MASTER_CHEST_OPERATION_INPUT",
      { field }
    );
  }

  return value;
}

function readOperation(value: unknown): MasterChestOperationInput {
  if (!isObjectRecord(value)) {
    throw new AppError(
      "Master chest transaction operations must be objects.",
      400,
      "INVALID_MASTER_CHEST_OPERATION_INPUT"
    );
  }

  if (value.type === "transfer-item") {
    if (value.direction !== "character-to-chest" && value.direction !== "chest-to-character") {
      throw new AppError(
        "Master chest item transfer direction is invalid.",
        400,
        "INVALID_MASTER_CHEST_OPERATION_INPUT"
      );
    }

    return {
      type: value.type,
      direction: value.direction,
      sourceStackId: readRequiredString(value.sourceStackId, "sourceStackId"),
      quantity: readPositiveInteger(value.quantity, "quantity")
    };
  }

  if (value.type === "transfer-currency") {
    if (value.direction !== "character-to-chest" && value.direction !== "chest-to-character") {
      throw new AppError(
        "Master chest currency transfer direction is invalid.",
        400,
        "INVALID_MASTER_CHEST_OPERATION_INPUT"
      );
    }

    if (!isMasterChestCurrencyKey(value.currency)) {
      throw new AppError(
        "Master chest transaction currency is invalid.",
        400,
        "INVALID_MASTER_CHEST_OPERATION_INPUT"
      );
    }

    return {
      type: value.type,
      direction: value.direction,
      currency: value.currency,
      amount: readPositiveInteger(value.amount, "amount")
    };
  }

  if (value.type === "add-item") {
    const [item] = normalizeMasterChestInventory([value.item]);

    if (!item) {
      throw new AppError(
        "Master chest add-item operation is invalid.",
        400,
        "INVALID_MASTER_CHEST_OPERATION_INPUT"
      );
    }

    return { type: value.type, item };
  }

  if (value.type === "remove-item") {
    return {
      type: value.type,
      sourceStackId: readRequiredString(value.sourceStackId, "sourceStackId"),
      quantity: readPositiveInteger(value.quantity, "quantity")
    };
  }

  if (value.type === "adjust-currency") {
    if (!isMasterChestCurrencyKey(value.currency)) {
      throw new AppError(
        "Master chest transaction currency is invalid.",
        400,
        "INVALID_MASTER_CHEST_OPERATION_INPUT"
      );
    }

    const delta = readInteger(value.delta, "delta");

    if (delta === 0) {
      throw new AppError(
        "Master chest transaction currency delta cannot be zero.",
        400,
        "INVALID_MASTER_CHEST_OPERATION_INPUT"
      );
    }

    return { type: value.type, currency: value.currency, delta };
  }

  throw new AppError(
    "Master chest transaction operation type is invalid.",
    400,
    "INVALID_MASTER_CHEST_OPERATION_INPUT"
  );
}

export function readMasterChestTransactionRequest(value: unknown): MasterChestTransactionRequest {
  if (!isObjectRecord(value)) {
    throw new AppError(
      "Request body must be a JSON object.",
      400,
      "INVALID_MASTER_CHEST_OPERATION_INPUT"
    );
  }

  const operationId = readRequiredString(value.operationId, "operationId");

  if (!uuidPattern.test(operationId)) {
    throw new AppError(
      "Master chest transaction operationId must be a UUID.",
      400,
      "INVALID_MASTER_CHEST_OPERATION_INPUT",
      { field: "operationId" }
    );
  }

  if (!Array.isArray(value.operations) || value.operations.length === 0) {
    throw new AppError(
      "Master chest transaction must include at least one operation.",
      400,
      "INVALID_MASTER_CHEST_OPERATION_INPUT"
    );
  }

  if (value.operations.length > MAX_OPERATION_COUNT) {
    throw new AppError(
      `Master chest transaction can include up to ${MAX_OPERATION_COUNT} operations.`,
      400,
      "INVALID_MASTER_CHEST_OPERATION_INPUT",
      { operationLimit: MAX_OPERATION_COUNT }
    );
  }

  return {
    operationId,
    ...(typeof value.actorCharacterId === "string"
      ? { actorCharacterId: value.actorCharacterId.trim() }
      : {}),
    operations: value.operations.map(readOperation)
  };
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (!isObjectRecord(value)) {
    return value;
  }

  return Object.keys(value)
    .sort()
    .reduce<Record<string, unknown>>((record, key) => {
      record[key] = canonicalize(value[key]);
      return record;
    }, {});
}

export function createRequestHash(request: MasterChestTransactionRequest) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(canonicalize(request)))
    .digest("hex");
}

function isGmOperation(operation: MasterChestOperationInput) {
  return (
    operation.type === "add-item" ||
    operation.type === "remove-item" ||
    operation.type === "adjust-currency"
  );
}

export function getTransactionMode(operations: MasterChestOperationInput[]) {
  const hasGmOperations = operations.some(isGmOperation);
  const hasPlayerOperations = operations.some((operation) => !isGmOperation(operation));

  if (hasGmOperations && hasPlayerOperations) {
    throw new AppError(
      "Master chest transaction cannot mix GM and player operations.",
      400,
      "INVALID_MASTER_CHEST_OPERATION_INPUT"
    );
  }

  return hasGmOperations ? "gm" : "player";
}

export function getRevision(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 ? value : 1;
}

function countInventoryObjects(items: MasterChestInventoryItem[]): number {
  return items.reduce((count, item) => {
    const contents = Array.isArray(item.containerContents) ? item.containerContents : [];
    const nestedCount = contents.reduce((total, content) => {
      if (!isObjectRecord(content)) {
        throw new AppError(
          "Inventory container content is invalid.",
          400,
          "INVALID_MASTER_CHEST_OPERATION_INPUT"
        );
      }

      const nestedContents = Array.isArray(content.containerContents)
        ? content.containerContents
        : [];
      return total + 1 + countNestedInventoryObjects(nestedContents);
    }, 0);
    return count + 1 + nestedCount;
  }, 0);
}

function countNestedInventoryObjects(items: unknown[]): number {
  return items.reduce<number>((count, item) => {
    if (!isObjectRecord(item)) {
      throw new AppError(
        "Inventory container content is invalid.",
        400,
        "INVALID_MASTER_CHEST_OPERATION_INPUT"
      );
    }

    const contents = Array.isArray(item.containerContents) ? item.containerContents : [];
    return count + 1 + countNestedInventoryObjects(contents);
  }, 0);
}

export function validateFinalState(options: {
  chestCurrencies: Record<string, number>;
  chestInventoryItems: MasterChestInventoryItem[];
  characterCurrencies: Record<string, number>;
  characterInventoryItems: MasterChestInventoryItem[];
  hasCharacter: boolean;
}) {
  if (countInventoryObjects(options.chestInventoryItems) > MASTER_CHEST_OBJECT_LIMIT) {
    throw new AppError(
      `Master chest can hold up to ${MASTER_CHEST_OBJECT_LIMIT} inventory objects.`,
      409,
      "MASTER_CHEST_OBJECT_LIMIT_EXCEEDED",
      { objectLimit: MASTER_CHEST_OBJECT_LIMIT }
    );
  }

  if (
    options.hasCharacter &&
    countInventoryObjects(options.characterInventoryItems) > INVENTORY_OBJECT_LIMIT
  ) {
    throw new AppError(
      `Character inventory can hold up to ${INVENTORY_OBJECT_LIMIT} inventory objects.`,
      409,
      "CHARACTER_INVENTORY_OBJECT_LIMIT_EXCEEDED",
      { objectLimit: INVENTORY_OBJECT_LIMIT }
    );
  }

  const currencyRecords = options.hasCharacter
    ? [options.chestCurrencies, options.characterCurrencies]
    : [options.chestCurrencies];

  if (
    currencyRecords.some((currencies) =>
      Object.values(currencies).some(
        (amount) => !Number.isInteger(amount) || amount < 0 || amount > CURRENCY_MAX
      )
    )
  ) {
    throw new AppError(
      "Master chest transaction currency result is out of range.",
      409,
      "MASTER_CHEST_CURRENCY_LIMIT_EXCEEDED",
      { currencyMax: CURRENCY_MAX }
    );
  }
}

function padDatePart(value: number) {
  return value.toString().padStart(2, "0");
}

export function createHistoryEntry(actorNickname: string, actions: string[]) {
  const date = new Date();
  const timestamp = `${padDatePart(date.getDate())}/${padDatePart(date.getMonth() + 1)}/${padDatePart(
    date.getFullYear() % 100
  )} ${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
  const summary = actions.join(", ").slice(0, 1000);
  return `${timestamp} - ${actorNickname.trim() || "Unknown Player"}: ${summary}`;
}

export function createHistoryActorLabel(options: {
  actorNickname: string;
  characterName?: string;
  mode: "gm" | "player";
}) {
  const nickname = options.actorNickname.trim() || "Unknown Player";

  if (options.mode === "gm") {
    return `GM:${nickname}`;
  }

  return `${options.characterName?.trim() || "Unnamed Character"}:${nickname}`;
}

export function getInventoryGroup(character: CharacterSheetDocument) {
  const inventory = isObjectRecord(character.sheet.inventory) ? character.sheet.inventory : {};
  return {
    inventory,
    items: normalizeMasterChestInventory(inventory.items),
    currencies: normalizeMasterChestOperationCurrencies(inventory.currencies)
  };
}

function toIsoTimestamp(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

export function toCharacterCloudRecord(character: CharacterSheetDocument) {
  const avatar = character.avatar
    ? {
        objectKey: character.avatar.objectKey,
        imageUrl: character.avatar.imageUrl,
        mimeType: character.avatar.mimeType,
        sizeBytes: character.avatar.sizeBytes,
        updatedAt: character.avatar.updatedAt.toISOString()
      }
    : null;
  const backgroundTexture = character.backgroundTexture
    ? {
        source: character.backgroundTexture.source,
        ...(character.backgroundTexture.textureId
          ? { textureId: character.backgroundTexture.textureId }
          : {}),
        ...(character.backgroundTexture.objectKey
          ? { objectKey: character.backgroundTexture.objectKey }
          : {}),
        ...(character.backgroundTexture.imageUrl
          ? { imageUrl: character.backgroundTexture.imageUrl }
          : {}),
        ...(character.backgroundTexture.mimeType
          ? { mimeType: character.backgroundTexture.mimeType }
          : {}),
        ...(character.backgroundTexture.sizeBytes
          ? { sizeBytes: character.backgroundTexture.sizeBytes }
          : {}),
        ...(character.backgroundTexture.updatedAt
          ? { updatedAt: character.backgroundTexture.updatedAt.toISOString() }
          : {})
      }
    : null;

  return {
    id: character.id,
    ownerId: character.ownerId.toString(),
    clientId: character.clientId,
    ...(character.localId ? { localId: character.localId } : {}),
    schemaVersion: character.schemaVersion,
    revision: character.revision,
    summary: character.summary,
    sheet: character.sheet,
    avatar,
    backgroundTexture,
    createdAt: toIsoTimestamp(character.createdAt),
    updatedAt: toIsoTimestamp(character.updatedAt)
  };
}

export function toMasterChestRecord(partyGroup: TransactionPartyGroup) {
  return {
    partyGroupId: partyGroup.id,
    revision: getRevision(partyGroup.masterChestRevision),
    inventoryItems: normalizeMasterChestInventory(partyGroup.masterChestItems),
    currencies: normalizeMasterChestOperationCurrencies(partyGroup.masterChestCurrencies),
    history: Array.isArray(partyGroup.masterChestHistory)
      ? partyGroup.masterChestHistory.filter((entry): entry is string => typeof entry === "string")
      : []
  };
}

function isDuplicateKeyError(error: unknown) {
  return isObjectRecord(error) && error.code === 11000;
}

function isRetryableTransactionError(error: unknown) {
  if (!isObjectRecord(error)) {
    return false;
  }

  const labels = Array.isArray(error.errorLabels) ? error.errorLabels : [];
  return (
    labels.includes("TransientTransactionError") ||
    labels.includes("UnknownTransactionCommitResult")
  );
}

export async function loadReplayResult(options: {
  actorUserId: Types.ObjectId;
  operationId: string;
  partyGroupId: Types.ObjectId;
  requestHash: string;
}) {
  const record = await MasterChestOperation.findOne({ operationId: options.operationId })
    .lean()
    .exec();

  if (!record) {
    return null;
  }

  if (record.status && record.status !== "committed") {
    return null;
  }

  if (
    record.requestHash !== options.requestHash ||
    record.partyGroupId.toString() !== options.partyGroupId.toString() ||
    record.actorUserId.toString() !== options.actorUserId.toString()
  ) {
    throw new AppError(
      "This Master Chest operationId was already used for a different request.",
      409,
      "MASTER_CHEST_IDEMPOTENCY_KEY_REUSED"
    );
  }

  const partyGroup = (await PartyGroup.findById(options.partyGroupId)
    .select("+masterChestItems +masterChestCurrencies +masterChestHistory +masterChestRevision")
    .exec()) as TransactionPartyGroup | null;

  if (!partyGroup) {
    throw new AppError("Party group was not found.", 404, "PARTY_GROUP_NOT_FOUND");
  }

  const actorUserId = options.actorUserId.toString();
  const isGm =
    partyGroup.ownerId.toString() === actorUserId ||
    (partyGroup.adminUserIds ?? []).some((adminId) => adminId.toString() === actorUserId);

  if (!isGm) {
    const stillOwnedMember = record.actorCharacterId
      ? await CharacterSheet.exists({
          _id: record.actorCharacterId,
          ownerId: options.actorUserId,
          partyGroupId: options.partyGroupId,
          deletedAt: null
        }).exec()
      : null;

    if (!stillOwnedMember) {
      throw new AppError("Party group was not found.", 404, "PARTY_GROUP_NOT_FOUND");
    }
  }

  const character = record.actorCharacterId
    ? await CharacterSheet.findById(record.actorCharacterId).exec()
    : null;

  return {
    transaction: { operationId: options.operationId, replayed: true },
    masterChest: toMasterChestRecord(partyGroup),
    ...(character ? { character: toCharacterCloudRecord(character) } : {})
  };
}

async function loadPartyGroupForTransaction(partyGroupId: Types.ObjectId, session: ClientSession) {
  return (await PartyGroup.findById(partyGroupId)
    .select("+masterChestItems +masterChestCurrencies +masterChestHistory +masterChestRevision")
    .session(session)
    .exec()) as TransactionPartyGroup | null;
}

export async function executeAtomicMasterChestTransaction(options: {
  actorNickname: string;
  actorUserId: Types.ObjectId;
  partyGroupId: string;
  request: MasterChestTransactionRequest;
}) {
  if (!Types.ObjectId.isValid(options.partyGroupId)) {
    throw new AppError("Party group id is invalid.", 400, "INVALID_PARTY_GROUP_ID");
  }

  const partyGroupId = new Types.ObjectId(options.partyGroupId);
  const requestHash = createRequestHash(options.request);
  const replay = await loadReplayResult({
    actorUserId: options.actorUserId,
    operationId: options.request.operationId,
    partyGroupId,
    requestHash
  });

  if (replay) {
    addServerBreadcrumb({
      category: "master-chest",
      message: "Replayed Master Chest transaction.",
      data: { operationCount: options.request.operations.length, outcome: "replayed" }
    });
    return replay;
  }

  const mode = getTransactionMode(options.request.operations);
  let committedResult:
    | {
        transaction: { operationId: string; replayed: false };
        masterChest: ReturnType<typeof toMasterChestRecord>;
        character?: ReturnType<typeof toCharacterCloudRecord>;
      }
    | undefined;

  try {
    await mongoose.connection.transaction(async (session) => {
      committedResult = undefined;
      const existingOperation = await MasterChestOperation.findOne({
        operationId: options.request.operationId
      })
        .session(session)
        .lean()
        .exec();

      if (existingOperation) {
        if (existingOperation.requestHash !== requestHash) {
          throw new AppError(
            "This Master Chest operationId was already used for a different request.",
            409,
            "MASTER_CHEST_IDEMPOTENCY_KEY_REUSED"
          );
        }

        return;
      }

      const partyGroup = await loadPartyGroupForTransaction(partyGroupId, session);

      if (!partyGroup) {
        throw new AppError("Party group was not found.", 404, "PARTY_GROUP_NOT_FOUND");
      }

      const actorUserId = options.actorUserId.toString();
      const isGm =
        partyGroup.ownerId.toString() === actorUserId ||
        (partyGroup.adminUserIds ?? []).some((adminId) => adminId.toString() === actorUserId);

      if (mode === "gm" && !isGm) {
        throw new AppError(
          "Only a party owner or administrator can perform GM Master Chest operations.",
          403,
          "MASTER_CHEST_GM_OPERATION_FORBIDDEN"
        );
      }

      let character: CharacterSheetDocument | null = null;

      if (mode === "player") {
        if (
          !options.request.actorCharacterId ||
          !Types.ObjectId.isValid(options.request.actorCharacterId)
        ) {
          throw new AppError("Character sheet id is invalid.", 400, "INVALID_CHARACTER_SHEET_ID");
        }

        character = await CharacterSheet.findOne({
          _id: new Types.ObjectId(options.request.actorCharacterId),
          ownerId: options.actorUserId,
          partyGroupId,
          deletedAt: null
        })
          .session(session)
          .exec();

        if (!character) {
          throw new AppError("Party member was not found.", 404, "PARTY_MEMBER_NOT_FOUND");
        }
      } else if (!isGm) {
        throw new AppError("Party group was not found.", 404, "PARTY_GROUP_NOT_FOUND");
      }

      const characterInventory = character ? getInventoryGroup(character) : null;
      const applied = applyMasterChestOperations({
        chestCurrencies: normalizeMasterChestOperationCurrencies(partyGroup.masterChestCurrencies),
        chestInventoryItems: normalizeMasterChestInventory(partyGroup.masterChestItems),
        ...(characterInventory
          ? {
              characterCurrencies: characterInventory.currencies,
              characterInventoryItems: characterInventory.items
            }
          : {}),
        isGm: mode === "gm",
        operations: options.request.operations
      });

      validateFinalState({
        ...applied,
        hasCharacter: Boolean(character)
      });

      const nextChestRevision = getRevision(partyGroup.masterChestRevision) + 1;
      const currentHistory = Array.isArray(partyGroup.masterChestHistory)
        ? partyGroup.masterChestHistory.filter(
            (entry): entry is string => typeof entry === "string"
          )
        : [];
      partyGroup.masterChestItems = applied.chestInventoryItems;
      partyGroup.masterChestCurrencies = applied.chestCurrencies;
      partyGroup.masterChestRevision = nextChestRevision;
      partyGroup.masterChestHistory = [
        createHistoryEntry(
          createHistoryActorLabel({
            actorNickname: options.actorNickname,
            characterName: character?.summary.name,
            mode
          }),
          applied.historyActions
        ),
        ...currentHistory
      ].slice(0, HISTORY_LIMIT);
      partyGroup.markModified("masterChestItems");
      partyGroup.markModified("masterChestCurrencies");
      partyGroup.markModified("masterChestHistory");
      await partyGroup.save({ session });

      if (character && characterInventory) {
        character.sheet = {
          ...character.sheet,
          inventory: {
            ...characterInventory.inventory,
            items: applied.characterInventoryItems,
            currencies: applied.characterCurrencies
          }
        };
        character.revision += 1;
        character.markModified("sheet");
        await character.save({ session });
      }

      await MasterChestOperation.create(
        [
          {
            operationId: options.request.operationId,
            requestHash,
            partyGroupId,
            actorUserId: options.actorUserId,
            ...(character ? { actorCharacterId: character._id } : {}),
            chestRevision: nextChestRevision,
            ...(character ? { characterRevision: character.revision } : {}),
            executionMode: "atomic",
            status: "committed",
            expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS)
          }
        ],
        { session }
      );

      committedResult = {
        transaction: { operationId: options.request.operationId, replayed: false },
        masterChest: toMasterChestRecord(partyGroup),
        ...(character ? { character: toCharacterCloudRecord(character) } : {})
      };
    });
  } catch (error) {
    if (error instanceof AppError && error.code === "MASTER_CHEST_OPERATION_CONFLICT") {
      addServerBreadcrumb({
        category: "master-chest",
        message: "Rejected conflicting Master Chest transaction.",
        data: {
          operationCount: options.request.operations.length,
          outcome: "conflict",
          ...(isObjectRecord(error.details) && typeof error.details.reason === "string"
            ? { reason: error.details.reason }
            : {})
        }
      });
    }

    if (isDuplicateKeyError(error)) {
      const duplicateReplay = await loadReplayResult({
        actorUserId: options.actorUserId,
        operationId: options.request.operationId,
        partyGroupId,
        requestHash
      });

      if (duplicateReplay) {
        addServerBreadcrumb({
          category: "master-chest",
          message: "Replayed concurrent Master Chest transaction.",
          data: { operationCount: options.request.operations.length, outcome: "replayed" }
        });
        return duplicateReplay;
      }
    }

    if (isRetryableTransactionError(error)) {
      captureServerMessage("Master Chest transaction retries were exhausted.", {
        area: "master-chest",
        action: "transaction-retry",
        level: "warning",
        extra: { operationCount: options.request.operations.length }
      });
      throw new AppError("The Master Chest is busy. Try saving again.", 503, "MASTER_CHEST_BUSY");
    }

    throw error;
  }

  if (!committedResult) {
    const completedReplay = await loadReplayResult({
      actorUserId: options.actorUserId,
      operationId: options.request.operationId,
      partyGroupId,
      requestHash
    });

    if (completedReplay) {
      addServerBreadcrumb({
        category: "master-chest",
        message: "Replayed completed Master Chest transaction.",
        data: { operationCount: options.request.operations.length, outcome: "replayed" }
      });
      return completedReplay;
    }

    throw new AppError("The Master Chest is busy. Try saving again.", 503, "MASTER_CHEST_BUSY");
  }

  addServerBreadcrumb({
    category: "master-chest",
    message: "Committed Master Chest transaction.",
    data: { operationCount: options.request.operations.length, outcome: "committed" }
  });
  return committedResult;
}
