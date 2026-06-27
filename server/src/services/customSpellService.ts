import { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { CustomSpell, type CustomSpellRecord } from "../models/CustomSpell.js";
import { User } from "../models/User.js";
import type { UserRole } from "../types/auth.js";
import { assertCreatedDmToolWithinLimit, assertDmToolCreationLimit } from "./dmToolLimits.js";

const CUSTOM_SPELL_ID_PREFIX = "custom-spell:";
const CUSTOM_SPELL_NAME_MIN_LENGTH = 2;
const CUSTOM_SPELL_NAME_MAX_LENGTH = 128;
const CUSTOM_SPELL_SHORT_TEXT_MAX_LENGTH = 128;
const CUSTOM_SPELL_MATERIAL_MAX_LENGTH = 500;
const CUSTOM_SPELL_DESCRIPTION_MAX_LENGTH = 10000;
const CUSTOM_SPELL_EFFECT_LIMIT = 5;
const CUSTOM_SPELL_RECORD_MAX_BYTES = 40 * 1024;

const VALID_CASTING_TIMES = new Set([
  "ACTION",
  "BONUS_ACTION",
  "REACTION",
  "MINUTE",
  "TEN_MINUTES",
  "HOUR",
  "EIGHT_HOURS",
  "TWELVE_HOURS",
  "TWENTY_FOUR_HOURS"
]);

const VALID_MAGIC_SCHOOLS = new Set([
  "ABJURATION",
  "CONJURATION",
  "DIVINATION",
  "ENCHANTMENT",
  "EVOCATION",
  "ILLUSION",
  "NECROMANCY",
  "TRANSMUTATION"
]);

const VALID_COMPONENTS = new Set(["V", "S", "M"]);

const VALID_SPELL_LISTS = new Set([
  "ARTIFICER",
  "BARD",
  "CLERIC",
  "DRUID",
  "PALADIN",
  "RANGER",
  "SORCERER",
  "WARLOCK",
  "WIZARD"
]);

export type CustomSpellInput = {
  castingTime: string[];
  components: string[];
  customEffects?: Record<string, unknown>[];
  description: string[];
  duration: string[];
  magicSchool: string;
  materialSpecified?: string;
  name: string;
  public: boolean;
  range: string;
  ritual?: boolean;
  spellLevel: number;
  spellLists: string[];
};

type CustomSpellSource = CustomSpellRecord & {
  _id?: Types.ObjectId | { toString(): string };
  id?: string;
};

type CustomSpellRecordOptions = {
  ownerNickname?: string | null;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canPublishCustomSpells(role: UserRole | null | undefined) {
  return role === "keeper" || role === "admin";
}

function getDocumentId(document: Pick<CustomSpellSource, "_id" | "id">) {
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
      throw new AppError(`${fieldName} is required.`, 400, "INVALID_CUSTOM_SPELL_INPUT", {
        field: fieldName
      });
    }

    return "";
  }

  const normalizedValue = value.trim();

  if (options.required && !normalizedValue) {
    throw new AppError(`${fieldName} is required.`, 400, "INVALID_CUSTOM_SPELL_INPUT", {
      field: fieldName
    });
  }

  if (options.minLength !== undefined && normalizedValue.length < options.minLength) {
    throw new AppError(`${fieldName} is too short.`, 400, "INVALID_CUSTOM_SPELL_INPUT", {
      field: fieldName
    });
  }

  if (normalizedValue.length > options.maxLength) {
    throw new AppError(`${fieldName} is too long.`, 400, "INVALID_CUSTOM_SPELL_INPUT", {
      field: fieldName
    });
  }

  return normalizedValue;
}

function normalizeStringArray(
  value: unknown,
  fieldName: string,
  options: {
    allowEmpty?: boolean;
    maxItems: number;
    maxLength: number;
    validValues?: Set<string>;
  }
) {
  if (!Array.isArray(value)) {
    throw new AppError(`${fieldName} is invalid.`, 400, "INVALID_CUSTOM_SPELL_INPUT", {
      field: fieldName
    });
  }

  const values = value
    .map((entry) => normalizeText(entry, fieldName, { maxLength: options.maxLength }))
    .filter(Boolean);
  const uniqueValues = Array.from(new Set(values));

  if (!options.allowEmpty && uniqueValues.length === 0) {
    throw new AppError(`${fieldName} is required.`, 400, "INVALID_CUSTOM_SPELL_INPUT", {
      field: fieldName
    });
  }

  if (uniqueValues.length > options.maxItems) {
    throw new AppError(`${fieldName} has too many entries.`, 400, "INVALID_CUSTOM_SPELL_INPUT", {
      field: fieldName
    });
  }

  if (options.validValues) {
    const invalidValue = uniqueValues.find((entry) => !options.validValues?.has(entry));

    if (invalidValue) {
      throw new AppError(`${fieldName} is invalid.`, 400, "INVALID_CUSTOM_SPELL_INPUT", {
        field: fieldName,
        value: invalidValue
      });
    }
  }

  return uniqueValues;
}

function normalizeSpellLevel(value: unknown) {
  const spellLevel = Math.floor(Number(value));

  if (!Number.isFinite(spellLevel) || spellLevel < 0 || spellLevel > 9) {
    throw new AppError("spellLevel is invalid.", 400, "INVALID_CUSTOM_SPELL_INPUT", {
      field: "spellLevel"
    });
  }

  return spellLevel;
}

function normalizeMagicSchool(value: unknown) {
  const magicSchool = normalizeText(value, "magicSchool", {
    maxLength: CUSTOM_SPELL_SHORT_TEXT_MAX_LENGTH,
    required: true
  });

  if (!VALID_MAGIC_SCHOOLS.has(magicSchool)) {
    throw new AppError("magicSchool is invalid.", 400, "INVALID_CUSTOM_SPELL_INPUT", {
      field: "magicSchool"
    });
  }

  return magicSchool;
}

function normalizeDescription(value: unknown) {
  const description = normalizeStringArray(value, "description", {
    allowEmpty: true,
    maxItems: 20,
    maxLength: CUSTOM_SPELL_DESCRIPTION_MAX_LENGTH
  });
  const totalLength = description.reduce((sum, entry) => sum + entry.length, 0);

  if (totalLength <= CUSTOM_SPELL_DESCRIPTION_MAX_LENGTH) {
    return description;
  }

  throw new AppError("description is too long.", 400, "INVALID_CUSTOM_SPELL_INPUT", {
    field: "description"
  });
}

function isInstantaneousDuration(duration: readonly string[]) {
  return duration.length === 0 || duration.every((part) => part.toLowerCase() === "instantaneous");
}

function normalizeCustomEffects(value: unknown, duration: readonly string[]) {
  if (isInstantaneousDuration(duration)) {
    return [];
  }

  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new AppError("customEffects is invalid.", 400, "INVALID_CUSTOM_SPELL_INPUT", {
      field: "customEffects"
    });
  }

  if (value.length > CUSTOM_SPELL_EFFECT_LIMIT) {
    throw new AppError(
      `A custom spell can have up to ${CUSTOM_SPELL_EFFECT_LIMIT} effects.`,
      400,
      "INVALID_CUSTOM_SPELL_INPUT",
      { field: "customEffects" }
    );
  }

  return value.filter(isObjectRecord);
}

function assertSerializedSize(value: unknown) {
  const sizeBytes = Buffer.byteLength(JSON.stringify(value), "utf8");

  if (sizeBytes <= CUSTOM_SPELL_RECORD_MAX_BYTES) {
    return;
  }

  throw new AppError(
    "Custom spell is too large. Keep each spell under 40 KB.",
    413,
    "CUSTOM_SPELL_TOO_LARGE",
    {
      maxBytes: CUSTOM_SPELL_RECORD_MAX_BYTES,
      sizeBytes
    }
  );
}

export function customSpellDocumentIdToSpellEntryId(customSpellId: string) {
  return `${CUSTOM_SPELL_ID_PREFIX}${customSpellId}`;
}

export function normalizeCustomSpellInput(
  value: unknown,
  options: { ownerRole?: UserRole | null } = {}
): CustomSpellInput {
  if (!isObjectRecord(value)) {
    throw new AppError("Request body must be a JSON object.", 400, "INVALID_CUSTOM_SPELL_INPUT");
  }

  const components = normalizeStringArray(value.components, "components", {
    allowEmpty: true,
    maxItems: VALID_COMPONENTS.size,
    maxLength: CUSTOM_SPELL_SHORT_TEXT_MAX_LENGTH,
    validValues: VALID_COMPONENTS
  });
  const duration = normalizeStringArray(value.duration, "duration", {
    maxItems: 4,
    maxLength: CUSTOM_SPELL_SHORT_TEXT_MAX_LENGTH
  });
  const materialSpecified = components.includes("M")
    ? normalizeText(value.materialSpecified, "materialSpecified", {
        maxLength: CUSTOM_SPELL_MATERIAL_MAX_LENGTH
      })
    : "";

  const normalizedInput: CustomSpellInput = {
    castingTime: normalizeStringArray(value.castingTime, "castingTime", {
      maxItems: 1,
      maxLength: CUSTOM_SPELL_SHORT_TEXT_MAX_LENGTH,
      validValues: VALID_CASTING_TIMES
    }),
    components,
    customEffects: normalizeCustomEffects(value.customEffects, duration),
    description: normalizeDescription(value.description),
    duration,
    magicSchool: normalizeMagicSchool(value.magicSchool),
    materialSpecified: materialSpecified || undefined,
    name: normalizeText(value.name, "name", {
      maxLength: CUSTOM_SPELL_NAME_MAX_LENGTH,
      minLength: CUSTOM_SPELL_NAME_MIN_LENGTH,
      required: true
    }),
    public: canPublishCustomSpells(options.ownerRole) ? Boolean(value.public) : false,
    range: normalizeText(value.range, "range", {
      maxLength: CUSTOM_SPELL_SHORT_TEXT_MAX_LENGTH,
      required: true
    }),
    ritual: Boolean(value.ritual),
    spellLevel: normalizeSpellLevel(value.spellLevel),
    spellLists: normalizeStringArray(value.spellLists, "spellLists", {
      allowEmpty: true,
      maxItems: VALID_SPELL_LISTS.size,
      maxLength: CUSTOM_SPELL_SHORT_TEXT_MAX_LENGTH,
      validValues: VALID_SPELL_LISTS
    })
  };

  assertSerializedSize(normalizedInput);

  return normalizedInput;
}

export function toCustomSpellRecord(
  customSpell: CustomSpellSource,
  options: CustomSpellRecordOptions = {}
) {
  const customSpellId = getDocumentId(customSpell);
  const duration = customSpell.duration ?? [];

  return {
    id: customSpellId,
    ownerId: customSpell.ownerId.toString(),
    ownerNickname: options.ownerNickname ?? null,
    public: Boolean(customSpell.public),
    spell: {
      id: customSpellDocumentIdToSpellEntryId(customSpellId),
      name: customSpell.name,
      category: "SPELLS",
      source: {
        documentKey: "custom-spells",
        documentName: "Custom Spells",
        ruleset: "third-party"
      },
      magicSchool: customSpell.magicSchool,
      castingTime: customSpell.castingTime,
      range: customSpell.range,
      components: customSpell.components,
      materialSpecified: customSpell.materialSpecified,
      duration,
      description: customSpell.description,
      trackingState: isInstantaneousDuration(duration) ? "not-tracked" : "semi-tracked",
      damage: [],
      healing: [],
      spellLists: customSpell.spellLists,
      spellLevel: customSpell.spellLevel,
      ritual: customSpell.ritual
    },
    customEffects: customSpell.customEffects ?? [],
    createdAt: toIsoTimestamp(customSpell.createdAt),
    updatedAt: toIsoTimestamp(customSpell.updatedAt)
  };
}

async function findOwnedCustomSpellDocument(options: {
  customSpellId: string;
  ownerId: Types.ObjectId;
}) {
  if (!options.customSpellId || !Types.ObjectId.isValid(options.customSpellId)) {
    throw new AppError("Custom spell id is invalid.", 400, "INVALID_CUSTOM_SPELL_ID");
  }

  const customSpell = await CustomSpell.findOne({
    _id: options.customSpellId,
    ownerId: options.ownerId
  }).exec();

  if (!customSpell) {
    throw new AppError("Custom spell was not found.", 404, "CUSTOM_SPELL_NOT_FOUND");
  }

  return customSpell;
}

async function listPublicCustomSpells() {
  const customSpells = await CustomSpell.find({ public: true })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
  const ownerIds = [...new Set(customSpells.map((customSpell) => customSpell.ownerId.toString()))];
  const owners = await User.find({ _id: { $in: ownerIds } }).select("_id nickname").lean().exec();
  const ownerNicknameById = new Map(
    owners.map((owner) => [owner._id.toString(), owner.nickname] as const)
  );

  return customSpells.map((customSpell) =>
    toCustomSpellRecord(customSpell, {
      ownerNickname: ownerNicknameById.get(customSpell.ownerId.toString()) ?? "Unknown Player"
    })
  );
}

export async function listOwnedCustomSpells(ownerId: Types.ObjectId) {
  const customSpells = await CustomSpell.find({ ownerId }).sort({ updatedAt: -1 }).lean().exec();

  return customSpells.map((customSpell) => toCustomSpellRecord(customSpell));
}

export async function listCustomSpells(options: {
  ownerId: Types.ObjectId;
  scope?: "mine" | "public";
}) {
  return options.scope === "public"
    ? listPublicCustomSpells()
    : listOwnedCustomSpells(options.ownerId);
}

export async function createOwnedCustomSpell(options: {
  input: CustomSpellInput;
  ownerId: Types.ObjectId;
  ownerRole: UserRole;
}) {
  const countOwnedCustomSpells = () =>
    CustomSpell.countDocuments({ ownerId: options.ownerId }).exec();
  const currentCount = await countOwnedCustomSpells();

  assertDmToolCreationLimit({
    currentCount,
    kind: "customSpells",
    role: options.ownerRole
  });

  const customSpell = await CustomSpell.create({
    ...options.input,
    ownerId: options.ownerId
  });

  await assertCreatedDmToolWithinLimit({
    countDocuments: countOwnedCustomSpells,
    isCreatedWithinLimit: async (limit) => {
      const retainedCustomSpells = await CustomSpell.find({ ownerId: options.ownerId })
        .sort({ createdAt: 1, _id: 1 })
        .limit(limit)
        .select("_id")
        .lean()
        .exec();

      return retainedCustomSpells.some(
        (retainedCustomSpell) =>
          retainedCustomSpell._id.toString() === customSpell._id.toString()
      );
    },
    kind: "customSpells",
    removeCreated: () =>
      CustomSpell.deleteOne({
        _id: customSpell._id,
        ownerId: options.ownerId
      }).exec(),
    role: options.ownerRole
  });

  return toCustomSpellRecord(customSpell);
}

export async function updateOwnedCustomSpell(options: {
  customSpellId: string;
  input: CustomSpellInput;
  ownerId: Types.ObjectId;
}) {
  const customSpell = await findOwnedCustomSpellDocument(options);

  customSpell.set(options.input);
  await customSpell.save();

  return toCustomSpellRecord(customSpell);
}

export async function deleteOwnedCustomSpell(options: {
  customSpellId: string;
  ownerId: Types.ObjectId;
}) {
  const customSpell = await findOwnedCustomSpellDocument(options);
  const customSpellId = customSpell.id;

  await customSpell.deleteOne();

  return {
    customSpellId
  };
}
