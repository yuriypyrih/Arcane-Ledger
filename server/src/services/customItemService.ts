import { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { CustomItem, type CustomItemRecord } from "../models/CustomItem.js";
import { User } from "../models/User.js";
import type { UserRole } from "../types/auth.js";
import { assertCreatedDmToolWithinLimit, assertDmToolCreationLimit } from "./dmToolLimits.js";

const CUSTOM_ITEM_ID_PREFIX = "custom-item:";
const CUSTOM_ITEM_NAME_MIN_LENGTH = 2;
const CUSTOM_ITEM_NAME_MAX_LENGTH = 128;
const CUSTOM_ITEM_RECORD_MAX_BYTES = 60 * 1024;

export type CustomItemInput = {
  item: Record<string, unknown>;
  mods: Record<string, unknown>;
  public: boolean;
  settings: Record<string, unknown>;
};

type CustomItemSource = CustomItemRecord & {
  _id?: Types.ObjectId | { toString(): string };
  id?: string;
};

type CustomItemRecordOptions = {
  ownerNickname?: string | null;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canPublishCustomItems(role: UserRole | null | undefined) {
  return role === "keeper" || role === "admin";
}

function getDocumentId(document: Pick<CustomItemSource, "_id" | "id">) {
  return document.id ?? document._id?.toString() ?? "";
}

function toIsoTimestamp(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function normalizeText(
  value: unknown,
  fieldName: string,
  options: {
    maxLength: number;
    minLength?: number;
    required?: boolean;
  }
) {
  if (typeof value !== "string") {
    if (options.required) {
      throw new AppError(`${fieldName} is required.`, 400, "INVALID_CUSTOM_ITEM_INPUT", {
        field: fieldName
      });
    }

    return "";
  }

  const normalizedValue = value.trim();

  if (options.required && !normalizedValue) {
    throw new AppError(`${fieldName} is required.`, 400, "INVALID_CUSTOM_ITEM_INPUT", {
      field: fieldName
    });
  }

  if (options.minLength !== undefined && normalizedValue.length < options.minLength) {
    throw new AppError(`${fieldName} is too short.`, 400, "INVALID_CUSTOM_ITEM_INPUT", {
      field: fieldName
    });
  }

  if (normalizedValue.length > options.maxLength) {
    throw new AppError(`${fieldName} is too long.`, 400, "INVALID_CUSTOM_ITEM_INPUT", {
      field: fieldName
    });
  }

  return normalizedValue;
}

function normalizeObject(value: unknown, fieldName: string) {
  if (!isObjectRecord(value)) {
    throw new AppError(`${fieldName} is invalid.`, 400, "INVALID_CUSTOM_ITEM_INPUT", {
      field: fieldName
    });
  }

  return value;
}

function getCustomItemName(input: Pick<CustomItemInput, "item" | "mods">) {
  return normalizeText(input.item.name ?? input.mods.name, "name", {
    maxLength: CUSTOM_ITEM_NAME_MAX_LENGTH,
    minLength: CUSTOM_ITEM_NAME_MIN_LENGTH,
    required: true
  });
}

function assertSerializedSize(value: unknown) {
  const sizeBytes = Buffer.byteLength(JSON.stringify(value), "utf8");

  if (sizeBytes <= CUSTOM_ITEM_RECORD_MAX_BYTES) {
    return;
  }

  throw new AppError(
    "Custom item is too large. Keep each item under 60 KB.",
    413,
    "CUSTOM_ITEM_TOO_LARGE",
    {
      maxBytes: CUSTOM_ITEM_RECORD_MAX_BYTES,
      sizeBytes
    }
  );
}

export function customItemDocumentIdToItemKey(customItemId: string) {
  return `${CUSTOM_ITEM_ID_PREFIX}${customItemId}`;
}

export function normalizeCustomItemInput(
  value: unknown,
  options: { ownerRole?: UserRole | null } = {}
): CustomItemInput {
  if (!isObjectRecord(value)) {
    throw new AppError("Request body must be a JSON object.", 400, "INVALID_CUSTOM_ITEM_INPUT");
  }

  const normalizedInput: CustomItemInput = {
    item: normalizeObject(value.item, "item"),
    mods: normalizeObject(value.mods, "mods"),
    public: canPublishCustomItems(options.ownerRole) ? Boolean(value.public) : false,
    settings: normalizeObject(value.settings, "settings")
  };

  getCustomItemName(normalizedInput);
  assertSerializedSize(normalizedInput);

  return normalizedInput;
}

export function toCustomItemRecord(
  customItem: CustomItemSource,
  options: CustomItemRecordOptions = {}
) {
  const customItemId = getDocumentId(customItem);
  const itemKey = customItemDocumentIdToItemKey(customItemId);
  const item = {
    ...customItem.item,
    id: itemKey,
    key: itemKey,
    document: {
      display_name: "Custom Items",
      key: "custom-items",
      name: "Custom Items"
    }
  };

  return {
    id: customItemId,
    ownerId: customItem.ownerId.toString(),
    ownerNickname: options.ownerNickname ?? null,
    public: Boolean(customItem.public),
    item,
    mods: customItem.mods,
    settings: customItem.settings,
    createdAt: toIsoTimestamp(customItem.createdAt),
    updatedAt: toIsoTimestamp(customItem.updatedAt)
  };
}

async function findOwnedCustomItemDocument(options: {
  customItemId: string;
  ownerId: Types.ObjectId;
}) {
  if (!options.customItemId || !Types.ObjectId.isValid(options.customItemId)) {
    throw new AppError("Custom item id is invalid.", 400, "INVALID_CUSTOM_ITEM_ID");
  }

  const customItem = await CustomItem.findOne({
    _id: options.customItemId,
    ownerId: options.ownerId
  }).exec();

  if (!customItem) {
    throw new AppError("Custom item was not found.", 404, "CUSTOM_ITEM_NOT_FOUND");
  }

  return customItem;
}

async function listPublicCustomItems() {
  const customItems = await CustomItem.find({ public: true })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
  const ownerIds = [...new Set(customItems.map((customItem) => customItem.ownerId.toString()))];
  const owners = await User.find({ _id: { $in: ownerIds } }).select("_id nickname").lean().exec();
  const ownerNicknameById = new Map(
    owners.map((owner) => [owner._id.toString(), owner.nickname] as const)
  );

  return customItems.map((customItem) =>
    toCustomItemRecord(customItem, {
      ownerNickname: ownerNicknameById.get(customItem.ownerId.toString()) ?? "Unknown Player"
    })
  );
}

export async function listOwnedCustomItems(ownerId: Types.ObjectId) {
  const customItems = await CustomItem.find({ ownerId }).sort({ updatedAt: -1 }).lean().exec();

  return customItems.map((customItem) => toCustomItemRecord(customItem));
}

export async function listCustomItems(options: {
  ownerId: Types.ObjectId;
  scope?: "mine" | "public";
}) {
  return options.scope === "public"
    ? listPublicCustomItems()
    : listOwnedCustomItems(options.ownerId);
}

export async function createOwnedCustomItem(options: {
  input: CustomItemInput;
  ownerId: Types.ObjectId;
  ownerRole: UserRole;
}) {
  const countOwnedCustomItems = () => CustomItem.countDocuments({ ownerId: options.ownerId }).exec();
  const currentCount = await countOwnedCustomItems();

  assertDmToolCreationLimit({
    currentCount,
    kind: "customItems",
    role: options.ownerRole
  });

  const customItem = await CustomItem.create({
    ...options.input,
    ownerId: options.ownerId
  });

  await assertCreatedDmToolWithinLimit({
    countDocuments: countOwnedCustomItems,
    isCreatedWithinLimit: async (limit) => {
      const retainedCustomItems = await CustomItem.find({ ownerId: options.ownerId })
        .sort({ createdAt: 1, _id: 1 })
        .limit(limit)
        .select("_id")
        .lean()
        .exec();

      return retainedCustomItems.some(
        (retainedCustomItem) => retainedCustomItem._id.toString() === customItem._id.toString()
      );
    },
    kind: "customItems",
    removeCreated: () =>
      CustomItem.deleteOne({
        _id: customItem._id,
        ownerId: options.ownerId
      }).exec(),
    role: options.ownerRole
  });

  return toCustomItemRecord(customItem);
}

export async function updateOwnedCustomItem(options: {
  customItemId: string;
  input: CustomItemInput;
  ownerId: Types.ObjectId;
}) {
  const customItem = await findOwnedCustomItemDocument(options);

  customItem.set(options.input);
  await customItem.save();

  return toCustomItemRecord(customItem);
}

export async function deleteOwnedCustomItem(options: {
  customItemId: string;
  ownerId: Types.ObjectId;
}) {
  const customItem = await findOwnedCustomItemDocument(options);
  const customItemId = customItem.id;

  await customItem.deleteOne();

  return {
    customItemId
  };
}
