import crypto from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { CharacterSheet, type CharacterSheetDocument } from "../models/CharacterSheet.js";
import { MasterChestLease } from "../models/MasterChestLease.js";
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

const LEASE_DURATION_MS = 2 * 60 * 1000;
const LEASE_WAIT_MS = 5_000;
const LEASE_RETRY_MS = 100;
const HISTORY_LIMIT = 20;
const IDEMPOTENCY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type InventorySnapshot = {
  items: MasterChestInventoryItem[];
  currencies: MasterChestCurrencies;
};

type CharacterSnapshot = InventorySnapshot & {
  id: string;
  revision: number;
};

type ChestSnapshot = InventorySnapshot & {
  history: string[];
  revision: number;
};

type StandaloneJournal = {
  before: {
    chest: ChestSnapshot;
    character: CharacterSnapshot | null;
  };
  after: {
    chest: ChestSnapshot;
    character: CharacterSnapshot | null;
  };
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDuplicateKeyError(error: unknown) {
  return isObjectRecord(error) && error.code === 11000;
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function acquireLease(partyGroupId: Types.ObjectId) {
  await Promise.all([MasterChestLease.init(), MasterChestOperation.init()]);
  const ownerToken = crypto.randomUUID();
  const deadline = Date.now() + LEASE_WAIT_MS;

  while (Date.now() < deadline) {
    const now = new Date();

    try {
      const lease = await MasterChestLease.findOneAndUpdate(
        {
          partyGroupId,
          expiresAt: { $lte: now }
        },
        {
          $set: {
            ownerToken,
            expiresAt: new Date(Date.now() + LEASE_DURATION_MS)
          },
          $setOnInsert: { partyGroupId }
        },
        { upsert: true, new: true }
      ).exec();

      if (lease?.ownerToken === ownerToken) {
        return ownerToken;
      }
    } catch (error) {
      if (!isDuplicateKeyError(error)) {
        throw error;
      }
    }

    await wait(LEASE_RETRY_MS);
  }

  throw new AppError("The Master Chest is busy. Try saving again.", 503, "MASTER_CHEST_BUSY");
}

async function releaseLease(partyGroupId: Types.ObjectId, ownerToken: string) {
  await MasterChestLease.deleteOne({ partyGroupId, ownerToken }).exec();
}

function readJournal(value: unknown): StandaloneJournal | null {
  if (!isObjectRecord(value) || !isObjectRecord(value.before) || !isObjectRecord(value.after)) {
    return null;
  }

  return value as StandaloneJournal;
}

function inventoryMatches(snapshot: InventorySnapshot, current: InventorySnapshot) {
  return (
    isDeepStrictEqual(snapshot.items, current.items) &&
    isDeepStrictEqual(snapshot.currencies, current.currencies)
  );
}

function chestMatches(snapshot: ChestSnapshot, partyGroup: TransactionPartyGroup) {
  const history = Array.isArray(partyGroup.masterChestHistory)
    ? partyGroup.masterChestHistory.filter((entry): entry is string => typeof entry === "string")
    : [];

  return (
    inventoryMatches(snapshot, {
      items: normalizeMasterChestInventory(partyGroup.masterChestItems),
      currencies: normalizeMasterChestOperationCurrencies(partyGroup.masterChestCurrencies)
    }) && isDeepStrictEqual(snapshot.history, history)
  );
}

async function markRecoveryRequired(operationId: string, reason: string): Promise<never> {
  await MasterChestOperation.updateOne(
    { operationId },
    { $set: { status: "recovery-required" } }
  ).exec();
  captureServerMessage("Master Chest standalone transaction requires recovery.", {
    area: "master-chest",
    action: "standalone-recovery",
    level: "error",
    extra: { reason }
  });
  throw new AppError(
    "The Master Chest is temporarily locked because an interrupted save needs recovery.",
    503,
    "MASTER_CHEST_RECOVERY_REQUIRED"
  );
}

async function ensureCharacterAfterSnapshot(
  operationId: string,
  before: CharacterSnapshot,
  after: CharacterSnapshot
) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const character = await CharacterSheet.findById(before.id).exec();

    if (!character) {
      return markRecoveryRequired(operationId, "character_missing");
    }

    const current = getInventoryGroup(character);

    if (inventoryMatches(after, current)) {
      return character;
    }

    if (!inventoryMatches(before, current)) {
      return markRecoveryRequired(operationId, "character_inventory_diverged");
    }

    const updated = await CharacterSheet.findOneAndUpdate(
      { _id: character._id, revision: character.revision },
      {
        $set: {
          "sheet.inventory.items": after.items,
          "sheet.inventory.currencies": after.currencies
        },
        $inc: { revision: 1 }
      },
      { new: true }
    ).exec();

    if (updated) {
      return updated;
    }
  }

  return markRecoveryRequired(operationId, "character_compare_and_swap_failed");
}

async function loadPartyGroup(partyGroupId: Types.ObjectId) {
  return (await PartyGroup.findById(partyGroupId)
    .select("+masterChestItems +masterChestCurrencies +masterChestHistory +masterChestRevision")
    .exec()) as TransactionPartyGroup | null;
}

async function ensureChestAfterSnapshot(
  operationId: string,
  partyGroupId: Types.ObjectId,
  before: ChestSnapshot,
  after: ChestSnapshot
) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const partyGroup = await loadPartyGroup(partyGroupId);

    if (!partyGroup) {
      return markRecoveryRequired(operationId, "party_group_missing");
    }

    if (chestMatches(after, partyGroup)) {
      return partyGroup;
    }

    if (!chestMatches(before, partyGroup)) {
      return markRecoveryRequired(operationId, "master_chest_diverged");
    }

    const updated = (await PartyGroup.findOneAndUpdate(
      { _id: partyGroupId, masterChestRevision: getRevision(partyGroup.masterChestRevision) },
      {
        $set: {
          masterChestItems: after.items,
          masterChestCurrencies: after.currencies,
          masterChestHistory: after.history,
          masterChestRevision: getRevision(partyGroup.masterChestRevision) + 1
        }
      },
      { new: true }
    )
      .select("+masterChestItems +masterChestCurrencies +masterChestHistory +masterChestRevision")
      .exec()) as TransactionPartyGroup | null;

    if (updated) {
      return updated;
    }
  }

  return markRecoveryRequired(operationId, "master_chest_compare_and_swap_failed");
}

async function recoverPendingOperations(partyGroupId: Types.ObjectId) {
  const blocked = await MasterChestOperation.exists({
    partyGroupId,
    status: "recovery-required"
  }).exec();

  if (blocked) {
    throw new AppError(
      "The Master Chest is temporarily locked because an interrupted save needs recovery.",
      503,
      "MASTER_CHEST_RECOVERY_REQUIRED"
    );
  }

  const pendingOperations = await MasterChestOperation.find({
    partyGroupId,
    status: { $in: ["prepared", "character-applied"] }
  })
    .select("+journal")
    .sort({ createdAt: 1 })
    .exec();

  for (const operation of pendingOperations) {
    const journal = readJournal(operation.journal);

    if (!journal) {
      return markRecoveryRequired(operation.operationId, "journal_missing");
    }

    const character =
      journal.after.character && journal.before.character
        ? await ensureCharacterAfterSnapshot(
            operation.operationId,
            journal.before.character,
            journal.after.character
          )
        : null;
    const partyGroup = await ensureChestAfterSnapshot(
      operation.operationId,
      partyGroupId,
      journal.before.chest,
      journal.after.chest
    );

    await MasterChestOperation.updateOne(
      { _id: operation._id },
      {
        $set: {
          status: "committed",
          chestRevision: getRevision(partyGroup.masterChestRevision),
          ...(character ? { characterRevision: character.revision } : {}),
          expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS)
        },
        $unset: { journal: 1 }
      }
    ).exec();
  }
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
    id: character.id,
    items: inventory.items,
    currencies: inventory.currencies,
    revision: character.revision
  };
}

export async function hasPendingStandaloneMasterChestOperations(partyGroupId: string) {
  if (!Types.ObjectId.isValid(partyGroupId)) {
    return false;
  }

  return Boolean(
    await MasterChestOperation.exists({
      partyGroupId: new Types.ObjectId(partyGroupId),
      status: { $in: ["prepared", "character-applied", "recovery-required"] }
    }).exec()
  );
}

export async function executeStandaloneMasterChestTransaction(options: {
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
  const ownerToken = await acquireLease(partyGroupId);

  try {
    await recoverPendingOperations(partyGroupId);
    const replay = await loadReplayResult({
      actorUserId: options.actorUserId,
      operationId: options.request.operationId,
      partyGroupId,
      requestHash
    });

    if (replay) {
      return replay;
    }

    const mode = getTransactionMode(options.request.operations);
    const partyGroup = await loadPartyGroup(partyGroupId);

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
      }).exec();

      if (!character) {
        throw new AppError("Party member was not found.", 404, "PARTY_MEMBER_NOT_FOUND");
      }
    } else if (!isGm) {
      throw new AppError("Party group was not found.", 404, "PARTY_GROUP_NOT_FOUND");
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
    const afterCharacter: CharacterSnapshot | null = beforeCharacter
      ? {
          id: beforeCharacter.id,
          items: applied.characterInventoryItems,
          currencies: applied.characterCurrencies,
          revision: beforeCharacter.revision + 1
        }
      : null;
    const journal: StandaloneJournal = {
      before: { chest: beforeChest, character: beforeCharacter },
      after: { chest: afterChest, character: afterCharacter }
    };

    try {
      await MasterChestOperation.create({
        operationId: options.request.operationId,
        requestHash,
        partyGroupId,
        actorUserId: options.actorUserId,
        ...(character ? { actorCharacterId: character._id } : {}),
        chestRevision: afterChest.revision,
        ...(afterCharacter ? { characterRevision: afterCharacter.revision } : {}),
        executionMode: "standalone",
        status: "prepared",
        journal
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const duplicateReplay = await loadReplayResult({
          actorUserId: options.actorUserId,
          operationId: options.request.operationId,
          partyGroupId,
          requestHash
        });

        if (duplicateReplay) {
          return duplicateReplay;
        }
      }

      throw error;
    }

    let savedCharacter: CharacterSheetDocument | null = character;

    if (character && afterCharacter && beforeCharacter) {
      savedCharacter = await CharacterSheet.findOneAndUpdate(
        { _id: character._id, revision: beforeCharacter.revision },
        {
          $set: {
            "sheet.inventory.items": afterCharacter.items,
            "sheet.inventory.currencies": afterCharacter.currencies
          },
          $inc: { revision: 1 }
        },
        { new: true }
      ).exec();

      if (!savedCharacter) {
        await MasterChestOperation.deleteOne({ operationId: options.request.operationId }).exec();
        throw new AppError("The Master Chest is busy. Try saving again.", 503, "MASTER_CHEST_BUSY");
      }

      await MasterChestOperation.updateOne(
        { operationId: options.request.operationId },
        { $set: { status: "character-applied" } }
      ).exec();
    }

    const savedPartyGroup = (await PartyGroup.findOneAndUpdate(
      { _id: partyGroupId, masterChestRevision: beforeChest.revision },
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
      if (savedCharacter && beforeCharacter && afterCharacter) {
        const compensated = await CharacterSheet.findOneAndUpdate(
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

        if (!compensated) {
          await markRecoveryRequired(options.request.operationId, "compensation_failed");
        }
      }

      await MasterChestOperation.deleteOne({ operationId: options.request.operationId }).exec();
      throw new AppError("The Master Chest is busy. Try saving again.", 503, "MASTER_CHEST_BUSY");
    }

    await MasterChestOperation.updateOne(
      { operationId: options.request.operationId },
      {
        $set: {
          status: "committed",
          chestRevision: getRevision(savedPartyGroup.masterChestRevision),
          ...(savedCharacter ? { characterRevision: savedCharacter.revision } : {}),
          expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS)
        },
        $unset: { journal: 1 }
      }
    ).exec();

    addServerBreadcrumb({
      category: "master-chest",
      message: "Committed Master Chest standalone fallback transaction.",
      data: { operationCount: options.request.operations.length, outcome: "committed" }
    });

    return {
      transaction: { operationId: options.request.operationId, replayed: false },
      masterChest: toMasterChestRecord(savedPartyGroup),
      ...(savedCharacter ? { character: toCharacterCloudRecord(savedCharacter) } : {})
    };
  } finally {
    try {
      await releaseLease(partyGroupId, ownerToken);
    } catch (error) {
      captureServerMessage("Master Chest standalone lease release failed.", {
        area: "master-chest",
        action: "standalone-lease-release",
        level: "warning",
        extra: { errorName: error instanceof Error ? error.name : "UnknownError" }
      });
    }
  }
}
