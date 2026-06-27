import { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { CustomBestiary, type CustomBestiaryRecord } from "../models/CustomBestiary.js";
import { User } from "../models/User.js";
import type { UserRole } from "../types/auth.js";
import type { MonsterRecord } from "../types/monster.js";
import { assertCreatedDmToolWithinLimit, assertDmToolCreationLimit } from "./dmToolLimits.js";

const CUSTOM_BESTIARY_ID_PREFIX = "custom-bestiary:";
const CUSTOM_BESTIARY_NAME_MIN_LENGTH = 1;
const CUSTOM_BESTIARY_NAME_MAX_LENGTH = 160;
const CUSTOM_BESTIARY_RECORD_MAX_BYTES = 80 * 1024;

export type CustomBestiaryInput = {
  monster: MonsterRecord;
  public: boolean;
};

type CustomBestiarySource = CustomBestiaryRecord & {
  _id?: Types.ObjectId | { toString(): string };
  id?: string;
};

type CustomBestiaryRecordOptions = {
  ownerNickname?: string | null;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canPublishCustomBestiary(role: UserRole | null | undefined) {
  return role === "keeper" || role === "admin";
}

function getDocumentId(document: Pick<CustomBestiarySource, "_id" | "id">) {
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
      throw new AppError(`${fieldName} is required.`, 400, "INVALID_CUSTOM_BESTIARY_INPUT", {
        field: fieldName
      });
    }

    return "";
  }

  const normalizedValue = value.trim();

  if (options.required && !normalizedValue) {
    throw new AppError(`${fieldName} is required.`, 400, "INVALID_CUSTOM_BESTIARY_INPUT", {
      field: fieldName
    });
  }

  if (options.minLength !== undefined && normalizedValue.length < options.minLength) {
    throw new AppError(`${fieldName} is too short.`, 400, "INVALID_CUSTOM_BESTIARY_INPUT", {
      field: fieldName
    });
  }

  if (normalizedValue.length > options.maxLength) {
    throw new AppError(`${fieldName} is too long.`, 400, "INVALID_CUSTOM_BESTIARY_INPUT", {
      field: fieldName
    });
  }

  return normalizedValue;
}

function normalizeMonster(value: unknown) {
  if (!isObjectRecord(value)) {
    throw new AppError("monster is invalid.", 400, "INVALID_CUSTOM_BESTIARY_INPUT", {
      field: "monster"
    });
  }

  const name = normalizeText(value.name, "name", {
    maxLength: CUSTOM_BESTIARY_NAME_MAX_LENGTH,
    minLength: CUSTOM_BESTIARY_NAME_MIN_LENGTH,
    required: true
  });

  return {
    ...value,
    name
  } as MonsterRecord;
}

function assertSerializedSize(value: unknown) {
  const sizeBytes = Buffer.byteLength(JSON.stringify(value), "utf8");

  if (sizeBytes <= CUSTOM_BESTIARY_RECORD_MAX_BYTES) {
    return;
  }

  throw new AppError(
    "Custom creature is too large. Keep each creature under 80 KB.",
    413,
    "CUSTOM_BESTIARY_TOO_LARGE",
    {
      maxBytes: CUSTOM_BESTIARY_RECORD_MAX_BYTES,
      sizeBytes
    }
  );
}

export function customBestiaryDocumentIdToMonsterKey(customBestiaryId: string) {
  return `${CUSTOM_BESTIARY_ID_PREFIX}${customBestiaryId}`;
}

function createCustomBestiaryMonster(customBestiaryId: string, monster: MonsterRecord) {
  const monsterKey = customBestiaryDocumentIdToMonsterKey(customBestiaryId);

  return {
    ...monster,
    id: monsterKey,
    key: monsterKey,
    document: {
      display_name: "Custom Bestiary",
      key: "custom-bestiary",
      name: "Custom Bestiary"
    }
  } as MonsterRecord;
}

export function normalizeCustomBestiaryInput(
  value: unknown,
  options: { ownerRole?: UserRole | null } = {}
): CustomBestiaryInput {
  if (!isObjectRecord(value)) {
    throw new AppError("Request body must be a JSON object.", 400, "INVALID_CUSTOM_BESTIARY_INPUT");
  }

  const normalizedInput: CustomBestiaryInput = {
    monster: normalizeMonster(value.monster),
    public: canPublishCustomBestiary(options.ownerRole) ? Boolean(value.public) : false
  };

  assertSerializedSize(normalizedInput);

  return normalizedInput;
}

export function toCustomBestiaryRecord(
  customBestiary: CustomBestiarySource,
  options: CustomBestiaryRecordOptions = {}
) {
  const customBestiaryId = getDocumentId(customBestiary);

  return {
    id: customBestiaryId,
    ownerId: customBestiary.ownerId.toString(),
    ownerNickname: options.ownerNickname ?? null,
    public: Boolean(customBestiary.public),
    monster: createCustomBestiaryMonster(customBestiaryId, customBestiary.monster),
    createdAt: toIsoTimestamp(customBestiary.createdAt),
    updatedAt: toIsoTimestamp(customBestiary.updatedAt)
  };
}

async function findOwnedCustomBestiaryDocument(options: {
  customBestiaryId: string;
  ownerId: Types.ObjectId;
}) {
  if (!options.customBestiaryId || !Types.ObjectId.isValid(options.customBestiaryId)) {
    throw new AppError("Custom creature id is invalid.", 400, "INVALID_CUSTOM_BESTIARY_ID");
  }

  const customBestiary = await CustomBestiary.findOne({
    _id: options.customBestiaryId,
    ownerId: options.ownerId
  }).exec();

  if (!customBestiary) {
    throw new AppError("Custom creature was not found.", 404, "CUSTOM_BESTIARY_NOT_FOUND");
  }

  return customBestiary;
}

async function listPublicCustomBestiary() {
  const customBestiary = await CustomBestiary.find({ public: true })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
  const ownerIds = [
    ...new Set(customBestiary.map((customCreature) => customCreature.ownerId.toString()))
  ];
  const owners = await User.find({ _id: { $in: ownerIds } }).select("_id nickname").lean().exec();
  const ownerNicknameById = new Map(
    owners.map((owner) => [owner._id.toString(), owner.nickname] as const)
  );

  return customBestiary.map((customCreature) =>
    toCustomBestiaryRecord(customCreature, {
      ownerNickname:
        ownerNicknameById.get(customCreature.ownerId.toString()) ?? "Unknown Player"
    })
  );
}

export async function listOwnedCustomBestiary(ownerId: Types.ObjectId) {
  const customBestiary = await CustomBestiary.find({ ownerId })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();

  return customBestiary.map((customCreature) => toCustomBestiaryRecord(customCreature));
}

export async function listCustomBestiary(options: {
  ownerId: Types.ObjectId;
  scope?: "mine" | "public";
}) {
  return options.scope === "public"
    ? listPublicCustomBestiary()
    : listOwnedCustomBestiary(options.ownerId);
}

export async function createOwnedCustomBestiary(options: {
  input: CustomBestiaryInput;
  ownerId: Types.ObjectId;
  ownerRole: UserRole;
}) {
  const countOwnedCustomBestiary = () =>
    CustomBestiary.countDocuments({ ownerId: options.ownerId }).exec();
  const currentCount = await countOwnedCustomBestiary();

  assertDmToolCreationLimit({
    currentCount,
    kind: "customBestiary",
    role: options.ownerRole
  });

  const customBestiary = await CustomBestiary.create({
    ...options.input,
    ownerId: options.ownerId
  });

  customBestiary.set({
    monster: createCustomBestiaryMonster(customBestiary.id, options.input.monster)
  });
  await customBestiary.save();

  await assertCreatedDmToolWithinLimit({
    countDocuments: countOwnedCustomBestiary,
    isCreatedWithinLimit: async (limit) => {
      const retainedCustomBestiary = await CustomBestiary.find({ ownerId: options.ownerId })
        .sort({ createdAt: 1, _id: 1 })
        .limit(limit)
        .select("_id")
        .lean()
        .exec();

      return retainedCustomBestiary.some(
        (retainedCustomCreature) =>
          retainedCustomCreature._id.toString() === customBestiary._id.toString()
      );
    },
    kind: "customBestiary",
    removeCreated: () =>
      CustomBestiary.deleteOne({
        _id: customBestiary._id,
        ownerId: options.ownerId
      }).exec(),
    role: options.ownerRole
  });

  return toCustomBestiaryRecord(customBestiary);
}

export async function updateOwnedCustomBestiary(options: {
  customBestiaryId: string;
  input: CustomBestiaryInput;
  ownerId: Types.ObjectId;
}) {
  const customBestiary = await findOwnedCustomBestiaryDocument(options);

  customBestiary.set({
    monster: createCustomBestiaryMonster(customBestiary.id, options.input.monster),
    public: options.input.public
  });
  await customBestiary.save();

  return toCustomBestiaryRecord(customBestiary);
}

export async function deleteOwnedCustomBestiary(options: {
  customBestiaryId: string;
  ownerId: Types.ObjectId;
}) {
  const customBestiary = await findOwnedCustomBestiaryDocument(options);
  const customBestiaryId = customBestiary.id;

  await customBestiary.deleteOne();

  return {
    customBestiaryId
  };
}
