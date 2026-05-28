import { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";
import {
  EncounterTemplate,
  type EncounterTemplateCreatureRecord,
  type EncounterTemplateRecord
} from "../models/EncounterTemplate.js";

const ENCOUNTER_TEMPLATE_NAME_MIN_LENGTH = 2;
const ENCOUNTER_TEMPLATE_NAME_MAX_LENGTH = 40;
export const ENCOUNTER_TEMPLATE_MAX_CREATURES = 20;

type EncounterTemplateSource = EncounterTemplateRecord & {
  _id?: Types.ObjectId | { toString(): string };
  id?: string;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getDocumentId(document: Pick<EncounterTemplateSource, "_id" | "id">) {
  return document.id ?? document._id?.toString() ?? "";
}

function toIsoTimestamp(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function normalizeText(value: unknown, fieldName: string, options?: { required?: boolean }) {
  if (typeof value !== "string") {
    if (options?.required) {
      throw new AppError(`${fieldName} is required.`, 400, "INVALID_ENCOUNTER_TEMPLATE_INPUT", {
        field: fieldName
      });
    }

    return "";
  }

  const normalizedValue = value.trim();

  if (options?.required && !normalizedValue) {
    throw new AppError(`${fieldName} is required.`, 400, "INVALID_ENCOUNTER_TEMPLATE_INPUT", {
      field: fieldName
    });
  }

  return normalizedValue;
}

function normalizeInteger(
  value: unknown,
  fieldName: string,
  options: {
    max?: number;
    min: number;
  }
) {
  const normalizedValue = Math.floor(Number(value));

  if (
    !Number.isFinite(normalizedValue) ||
    normalizedValue < options.min ||
    (options.max !== undefined && normalizedValue > options.max)
  ) {
    throw new AppError(`${fieldName} is invalid.`, 400, "INVALID_ENCOUNTER_TEMPLATE_CREATURE", {
      field: fieldName
    });
  }

  return normalizedValue;
}

function normalizeOptionalObject(value: unknown, fieldName: string) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!isObjectRecord(value)) {
    throw new AppError(`${fieldName} is invalid.`, 400, "INVALID_ENCOUNTER_TEMPLATE_CREATURE", {
      field: fieldName
    });
  }

  return value;
}

function normalizePrimalBeastKind(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (value === "land" || value === "sea" || value === "sky") {
    return value;
  }

  throw new AppError("primalBeastKind is invalid.", 400, "INVALID_ENCOUNTER_TEMPLATE_CREATURE", {
    field: "primalBeastKind"
  });
}

async function findOwnedEncounterTemplateDocument(options: {
  encounterTemplateId: string;
  ownerId: Types.ObjectId;
}) {
  if (!options.encounterTemplateId || !Types.ObjectId.isValid(options.encounterTemplateId)) {
    throw new AppError("Encounter template id is invalid.", 400, "INVALID_ENCOUNTER_TEMPLATE_ID");
  }

  const encounterTemplate = await EncounterTemplate.findOne({
    _id: options.encounterTemplateId,
    ownerId: options.ownerId
  }).exec();

  if (!encounterTemplate) {
    throw new AppError("Encounter template was not found.", 404, "ENCOUNTER_TEMPLATE_NOT_FOUND");
  }

  return encounterTemplate;
}

export function normalizeEncounterTemplateName(value: unknown) {
  if (typeof value !== "string") {
    throw new AppError("Encounter template name is required.", 400, "INVALID_ENCOUNTER_TEMPLATE_NAME");
  }

  const name = value.trim();

  if (
    name.length < ENCOUNTER_TEMPLATE_NAME_MIN_LENGTH ||
    name.length > ENCOUNTER_TEMPLATE_NAME_MAX_LENGTH
  ) {
    throw new AppError(
      `Encounter template name must be ${ENCOUNTER_TEMPLATE_NAME_MIN_LENGTH}-${ENCOUNTER_TEMPLATE_NAME_MAX_LENGTH} characters.`,
      400,
      "INVALID_ENCOUNTER_TEMPLATE_NAME",
      {
        minLength: ENCOUNTER_TEMPLATE_NAME_MIN_LENGTH,
        maxLength: ENCOUNTER_TEMPLATE_NAME_MAX_LENGTH
      }
    );
  }

  return name;
}

export function normalizeEncounterTemplateCreature(
  creatureId: string,
  value: unknown
): EncounterTemplateCreatureRecord {
  const id = normalizeText(creatureId, "creatureId", { required: true });

  if (!isObjectRecord(value)) {
    throw new AppError("Creature payload must be an object.", 400, "INVALID_ENCOUNTER_TEMPLATE_CREATURE");
  }

  const name = normalizeText(value.name, "name", { required: true });
  const type = normalizeText(value.type, "type");
  const maxHitPoints = normalizeInteger(value.maxHitPoints, "maxHitPoints", { min: 1 });
  const currentHitPoints = normalizeInteger(value.currentHitPoints, "currentHitPoints", {
    max: maxHitPoints,
    min: 0
  });
  const temporaryHitPoints = normalizeInteger(value.temporaryHitPoints ?? 0, "temporaryHitPoints", {
    min: 0
  });
  const duration = normalizeOptionalObject(value.duration, "duration");
  const deathSaves = normalizeOptionalObject(value.deathSaves, "deathSaves");
  const inheritedCreatureEntry = normalizeOptionalObject(
    value.inheritedCreatureEntry,
    "inheritedCreatureEntry"
  );
  const temporaryHitPointsSource = normalizeText(value.temporaryHitPointsSource, "temporaryHitPointsSource");
  const primalBeastKind = normalizePrimalBeastKind(value.primalBeastKind);

  if (!duration) {
    throw new AppError("duration is required.", 400, "INVALID_ENCOUNTER_TEMPLATE_CREATURE", {
      field: "duration"
    });
  }

  return {
    id,
    name,
    description: normalizeText(value.description, "description"),
    type,
    maxHitPoints,
    currentHitPoints,
    temporaryHitPoints,
    duration,
    ...(temporaryHitPointsSource ? { temporaryHitPointsSource } : {}),
    ...(deathSaves ? { deathSaves } : {}),
    ...(primalBeastKind ? { primalBeastKind } : {}),
    ...(inheritedCreatureEntry ? { inheritedCreatureEntry } : {}),
    ...(inheritedCreatureEntry && value.inheritedCreatureEntryModified === true
      ? { inheritedCreatureEntryModified: true }
      : {})
  };
}

export function toEncounterTemplateListRecord(encounterTemplate: EncounterTemplateSource) {
  const creatures = encounterTemplate.creatures ?? [];

  return {
    id: getDocumentId(encounterTemplate),
    name: encounterTemplate.name,
    ownerId: encounterTemplate.ownerId.toString(),
    creatureCount: creatures.length,
    maxCreatures: ENCOUNTER_TEMPLATE_MAX_CREATURES,
    createdAt: toIsoTimestamp(encounterTemplate.createdAt),
    updatedAt: toIsoTimestamp(encounterTemplate.updatedAt)
  };
}

export function toEncounterTemplateDetailRecord(encounterTemplate: EncounterTemplateSource) {
  return {
    ...toEncounterTemplateListRecord(encounterTemplate),
    creatures: encounterTemplate.creatures ?? []
  };
}

export async function listOwnedEncounterTemplates(ownerId: Types.ObjectId) {
  const encounterTemplates = (await EncounterTemplate.find({ ownerId })
    .sort({ updatedAt: -1 })
    .lean()
    .exec()) as EncounterTemplateSource[];

  return encounterTemplates.map(toEncounterTemplateListRecord);
}

export async function createOwnedEncounterTemplate(options: {
  name: string;
  ownerId: Types.ObjectId;
}) {
  const encounterTemplate = await EncounterTemplate.create({
    name: normalizeEncounterTemplateName(options.name),
    ownerId: options.ownerId,
    creatures: []
  });

  return toEncounterTemplateListRecord(encounterTemplate);
}

export async function getOwnedEncounterTemplateDetail(options: {
  encounterTemplateId: string;
  ownerId: Types.ObjectId;
}) {
  const encounterTemplate = await findOwnedEncounterTemplateDocument(options);

  return toEncounterTemplateDetailRecord(encounterTemplate);
}

export async function updateOwnedEncounterTemplateName(options: {
  encounterTemplateId: string;
  name: string;
  ownerId: Types.ObjectId;
}) {
  const encounterTemplate = await findOwnedEncounterTemplateDocument(options);

  encounterTemplate.name = normalizeEncounterTemplateName(options.name);
  await encounterTemplate.save();

  return toEncounterTemplateDetailRecord(encounterTemplate);
}

export async function upsertEncounterTemplateCreature(options: {
  creature: unknown;
  creatureId: string;
  encounterTemplateId: string;
  ownerId: Types.ObjectId;
}) {
  const encounterTemplate = await findOwnedEncounterTemplateDocument(options);
  const creature = normalizeEncounterTemplateCreature(options.creatureId, options.creature);
  const existingCreatureIndex = encounterTemplate.creatures.findIndex(
    (currentCreature) => currentCreature.id === creature.id
  );

  if (
    existingCreatureIndex < 0 &&
    encounterTemplate.creatures.length >= ENCOUNTER_TEMPLATE_MAX_CREATURES
  ) {
    throw new AppError("Encounter template is full.", 409, "ENCOUNTER_TEMPLATE_FULL", {
      maxCreatures: ENCOUNTER_TEMPLATE_MAX_CREATURES
    });
  }

  if (existingCreatureIndex >= 0) {
    encounterTemplate.creatures[existingCreatureIndex] = creature;
  } else {
    encounterTemplate.creatures.push(creature);
  }

  await encounterTemplate.save();

  return toEncounterTemplateDetailRecord(encounterTemplate);
}

export async function removeEncounterTemplateCreature(options: {
  creatureId: string;
  encounterTemplateId: string;
  ownerId: Types.ObjectId;
}) {
  const encounterTemplate = await findOwnedEncounterTemplateDocument(options);
  const creatureId = normalizeText(options.creatureId, "creatureId", { required: true });
  const nextCreatures = encounterTemplate.creatures.filter((creature) => creature.id !== creatureId);

  if (nextCreatures.length === encounterTemplate.creatures.length) {
    throw new AppError("Encounter template creature was not found.", 404, "ENCOUNTER_CREATURE_NOT_FOUND");
  }

  encounterTemplate.creatures = nextCreatures;
  await encounterTemplate.save();

  return toEncounterTemplateDetailRecord(encounterTemplate);
}
