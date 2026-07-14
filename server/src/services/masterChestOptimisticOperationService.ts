import { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { CharacterSheet, type CharacterSheetDocument } from "../models/CharacterSheet.js";
import { MasterChestOperation } from "../models/MasterChestOperation.js";
import { PartyGroup } from "../models/PartyGroup.js";
import { addServerBreadcrumb, captureServerMessage } from "../sentry.js";
import {
  applyMasterChestOperations,
  normalizeMasterChestInventory,
  normalizeMasterChestOperationCurrencies,
  type MasterChestCurrencies,
  type MasterChestInventoryItem
} from "./masterChestInventory.js";
import { createMasterChestRevisionFilter } from "./masterChestRevision.js";
import { runQueuedMasterChestSave } from "./masterChestSaveQueue.js";
import {
  createHistoryActorLabel,
  createHistoryEntry,
  createRequestHash,
  getInventoryGroup,
  getRevision,
  getTransactionMode,
  loadReplayResult,
  toCharacterCloudRecord,
  toMasterChestRecord,
  validateFinalState,
  type MasterChestTransactionRequest,
  type TransactionPartyGroup
} from "./masterChestTransactionService.js";

const MAX_SAVE_ATTEMPTS = 5;
const HISTORY_LIMIT = 20;
const IDEMPOTENCY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type InventorySnapshot = {
  items: MasterChestInventoryItem[];
  currencies: MasterChestCurrencies;
};

type CharacterSnapshot = InventorySnapshot & {
  revision: number;
};

type ChestSnapshot = InventorySnapshot & {
  history: string[];
  revision: number;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDuplicateKeyError(error: unknown) {
  return isObjectRecord(error) && error.code === 11000;
}

async function loadPartyGroup(partyGroupId: Types.ObjectId) {
  return (await PartyGroup.findById(partyGroupId)
    .select("+masterChestItems +masterChestCurrencies +masterChestHistory +masterChestRevision")
    .exec()) as TransactionPartyGroup | null;
}

function createChestSnapshot(partyGroup: TransactionPartyGroup): ChestSnapshot {
  return {
    items: normalizeMasterChestInventory(partyGroup.masterChestItems),
    currencies: normalizeMasterChestOperationCurrencies(partyGroup.masterChestCurrencies),
    history: Array.isArray(partyGroup.masterChestHistory)
      ? partyGroup.masterChestHistory.filter((entry): entry is string => typeof entry === "string")
      : [],
    revision: getRevision(partyGroup.masterChestRevision)
  };
}

function createCharacterSnapshot(character: CharacterSheetDocument): CharacterSnapshot {
  const inventory = getInventoryGroup(character);

  return {
    items: inventory.items,
    currencies: inventory.currencies,
    revision: character.revision
  };
}

async function rejectIncompletePreviousAttempt(options: {
  actorUserId: Types.ObjectId;
  operationId: string;
  partyGroupId: Types.ObjectId;
  requestHash: string;
}) {
  const existingOperation = await MasterChestOperation.findOne({
    operationId: options.operationId
  })
    .lean()
    .exec();

  if (!existingOperation) {
    return;
  }

  if (
    existingOperation.requestHash !== options.requestHash ||
    existingOperation.partyGroupId.toString() !== options.partyGroupId.toString() ||
    existingOperation.actorUserId.toString() !== options.actorUserId.toString()
  ) {
    throw new AppError(
      "This Master Chest operationId was already used for a different request.",
      409,
      "MASTER_CHEST_IDEMPOTENCY_KEY_REUSED"
    );
  }

  await MasterChestOperation.updateOne(
    { _id: existingOperation._id },
    { $set: { expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS) } }
  ).exec();

  throw new AppError(
    "A previous save did not finish. The latest Master Chest contents have been reloaded; review your changes and try again.",
    409,
    "MASTER_CHEST_OPERATION_CONFLICT",
    { reason: "incomplete_previous_save" }
  );
}

async function recordCommittedOperation(options: {
  actorCharacterId?: Types.ObjectId;
  actorUserId: Types.ObjectId;
  characterRevision?: number;
  chestRevision: number;
  operationId: string;
  partyGroupId: Types.ObjectId;
  requestHash: string;
}) {
  try {
    await MasterChestOperation.create({
      operationId: options.operationId,
      requestHash: options.requestHash,
      partyGroupId: options.partyGroupId,
      actorUserId: options.actorUserId,
      ...(options.actorCharacterId ? { actorCharacterId: options.actorCharacterId } : {}),
      chestRevision: options.chestRevision,
      ...(options.characterRevision ? { characterRevision: options.characterRevision } : {}),
      executionMode: "standalone",
      status: "committed",
      expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS)
    });
  } catch (error) {
    captureServerMessage("Master Chest save committed without an idempotency record.", {
      area: "master-chest",
      action: "optimistic-idempotency-record",
      level: "warning",
      extra: {
        duplicateOperationId: isDuplicateKeyError(error),
        errorName: error instanceof Error ? error.name : "UnknownError"
      }
    });
  }
}

function createConcurrentSaveConflict(): AppError {
  return new AppError(
    "The Master Chest kept changing while this save was being applied. Its latest contents have been reloaded; review your changes and try again.",
    409,
    "MASTER_CHEST_OPERATION_CONFLICT",
    { reason: "concurrent_update", attempts: MAX_SAVE_ATTEMPTS }
  );
}

async function executeQueuedMasterChestSave(options: {
  actorNickname: string;
  actorUserId: Types.ObjectId;
  partyGroupId: Types.ObjectId;
  request: MasterChestTransactionRequest;
}) {
  const requestHash = createRequestHash(options.request);
  const replay = await loadReplayResult({
    actorUserId: options.actorUserId,
    operationId: options.request.operationId,
    partyGroupId: options.partyGroupId,
    requestHash
  });

  if (replay) {
    addServerBreadcrumb({
      category: "master-chest",
      message: "Replayed optimistic Master Chest save.",
      data: { operationCount: options.request.operations.length, outcome: "replayed" }
    });
    return replay;
  }

  await rejectIncompletePreviousAttempt({
    actorUserId: options.actorUserId,
    operationId: options.request.operationId,
    partyGroupId: options.partyGroupId,
    requestHash
  });

  const mode = getTransactionMode(options.request.operations);

  for (let attempt = 1; attempt <= MAX_SAVE_ATTEMPTS; attempt += 1) {
    const partyGroup = await loadPartyGroup(options.partyGroupId);

    if (!partyGroup) {
      throw new AppError("Party group was not found.", 404, "PARTY_GROUP_NOT_FOUND");
    }

    const actorUserId = options.actorUserId.toString();
    const isGm =
      partyGroup.ownerId.toString() === actorUserId ||
      (partyGroup.adminUserIds ?? []).some((adminId) => adminId.toString() === actorUserId);
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
        partyGroupId: options.partyGroupId,
        deletedAt: null
      }).exec();

      if (!character) {
        throw new AppError("Party member was not found.", 404, "PARTY_MEMBER_NOT_FOUND");
      }
    } else if (!isGm) {
      throw new AppError("Party group was not found.", 404, "PARTY_GROUP_NOT_FOUND");
    }

    if (mode === "gm" && !isGm) {
      throw new AppError(
        "Only a party owner or administrator can perform GM Master Chest operations.",
        403,
        "MASTER_CHEST_GM_OPERATION_FORBIDDEN"
      );
    }

    const beforeChest = createChestSnapshot(partyGroup);
    const beforeCharacter = character ? createCharacterSnapshot(character) : null;
    const applied = applyMasterChestOperations({
      chestCurrencies: beforeChest.currencies,
      chestInventoryItems: beforeChest.items,
      ...(beforeCharacter
        ? {
            characterCurrencies: beforeCharacter.currencies,
            characterInventoryItems: beforeCharacter.items
          }
        : {}),
      isGm: mode === "gm",
      operations: options.request.operations
    });

    validateFinalState({ ...applied, hasCharacter: Boolean(character) });

    const afterChest: ChestSnapshot = {
      items: applied.chestInventoryItems,
      currencies: applied.chestCurrencies,
      history: [
        createHistoryEntry(
          createHistoryActorLabel({
            actorNickname: options.actorNickname,
            characterName: character?.summary.name,
            mode
          }),
          applied.historyActions
        ),
        ...beforeChest.history
      ].slice(0, HISTORY_LIMIT),
      revision: beforeChest.revision + 1
    };
    let savedCharacter: CharacterSheetDocument | null = character;

    if (character && beforeCharacter) {
      savedCharacter = await CharacterSheet.findOneAndUpdate(
        { _id: character._id, revision: beforeCharacter.revision },
        {
          $set: {
            "sheet.inventory.items": applied.characterInventoryItems,
            "sheet.inventory.currencies": applied.characterCurrencies
          },
          $inc: { revision: 1 }
        },
        { new: true }
      ).exec();

      if (!savedCharacter) {
        continue;
      }
    }

    const savedPartyGroup = (await PartyGroup.findOneAndUpdate(
      {
        _id: options.partyGroupId,
        ...createMasterChestRevisionFilter(beforeChest.revision)
      },
      {
        $set: {
          masterChestItems: afterChest.items,
          masterChestCurrencies: afterChest.currencies,
          masterChestHistory: afterChest.history,
          masterChestRevision: afterChest.revision
        }
      },
      { new: true }
    )
      .select("+masterChestItems +masterChestCurrencies +masterChestHistory +masterChestRevision")
      .exec()) as TransactionPartyGroup | null;

    if (!savedPartyGroup) {
      if (savedCharacter && beforeCharacter) {
        const compensatedCharacter = await CharacterSheet.findOneAndUpdate(
          { _id: savedCharacter._id, revision: savedCharacter.revision },
          {
            $set: {
              "sheet.inventory.items": beforeCharacter.items,
              "sheet.inventory.currencies": beforeCharacter.currencies
            },
            $inc: { revision: 1 }
          },
          { new: true }
        ).exec();

        if (!compensatedCharacter) {
          captureServerMessage("Master Chest optimistic save compensation failed.", {
            area: "master-chest",
            action: "optimistic-compensation",
            level: "error",
            extra: { attempt, operationCount: options.request.operations.length }
          });
          throw new AppError(
            "The character inventory changed during this save and could not be restored automatically. Reload the character and Master Chest before trying again.",
            409,
            "MASTER_CHEST_OPERATION_CONFLICT",
            { reason: "character_compensation_failed" }
          );
        }
      }

      continue;
    }

    await recordCommittedOperation({
      actorCharacterId: character?._id,
      actorUserId: options.actorUserId,
      characterRevision: savedCharacter?.revision,
      chestRevision: getRevision(savedPartyGroup.masterChestRevision),
      operationId: options.request.operationId,
      partyGroupId: options.partyGroupId,
      requestHash
    });

    addServerBreadcrumb({
      category: "master-chest",
      message: "Committed optimistic Master Chest save.",
      data: { attempt, operationCount: options.request.operations.length, outcome: "committed" }
    });

    return {
      transaction: { operationId: options.request.operationId, replayed: false },
      masterChest: toMasterChestRecord(savedPartyGroup),
      ...(savedCharacter ? { character: toCharacterCloudRecord(savedCharacter) } : {})
    };
  }

  throw createConcurrentSaveConflict();
}

export async function executeOptimisticMasterChestOperations(options: {
  actorNickname: string;
  actorUserId: Types.ObjectId;
  partyGroupId: string;
  request: MasterChestTransactionRequest;
}) {
  if (!Types.ObjectId.isValid(options.partyGroupId)) {
    throw new AppError("Party group id is invalid.", 400, "INVALID_PARTY_GROUP_ID");
  }

  const partyGroupId = new Types.ObjectId(options.partyGroupId);

  return runQueuedMasterChestSave(partyGroupId.toString(), () =>
    executeQueuedMasterChestSave({ ...options, partyGroupId })
  );
}
