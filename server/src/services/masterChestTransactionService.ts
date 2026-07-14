import crypto from "node:crypto";
import { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { CharacterSheet, type CharacterSheetDocument } from "../models/CharacterSheet.js";
import { MasterChestOperation } from "../models/MasterChestOperation.js";
import { PartyGroup, type PartyGroupDocument } from "../models/PartyGroup.js";
import {
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
