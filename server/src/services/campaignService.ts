import { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";
import {
  Campaign,
  type CampaignDocument,
  type CampaignPreparedEncounterCreatureRecord,
  type CampaignPreparedEncounterRecord,
  type CampaignRecord,
  type CampaignSessionNoteRecord,
  type PlayerVisibilitySettingsRecord
} from "../models/Campaign.js";
import { EncounterTemplate, type EncounterTemplateCreatureRecord } from "../models/EncounterTemplate.js";
import { PartyGroup, type PartyGroupRecord } from "../models/PartyGroup.js";
import type { UserRole } from "../types/auth.js";
import {
  CAMPAIGN_MAX_PREPARED_ENCOUNTERS as CAMPAIGN_MAX_PREPARED_ENCOUNTERS_QUOTA,
  CAMPAIGN_MAX_SESSION_NOTES as CAMPAIGN_MAX_SESSION_NOTES_QUOTA
} from "../constants/QUOTAS.js";
import { assertCreatedDmToolWithinLimit, assertDmToolCreationLimit } from "./dmToolLimits.js";
import {
  ENCOUNTER_TEMPLATE_MAX_CREATURES,
  assertEncounterCreatureListSize,
  assertEncounterCreatureRecordSize,
  assertEncounterInheritedCreatureEntrySize,
  normalizeEncounterTemplateCreature,
  normalizeEncounterTemplateName
} from "./encounterTemplateService.js";

const CAMPAIGN_NAME_MIN_LENGTH = 2;
const CAMPAIGN_NAME_MAX_LENGTH = 128;
export const CAMPAIGN_MAX_SESSION_NOTES = CAMPAIGN_MAX_SESSION_NOTES_QUOTA;
export const CAMPAIGN_SESSION_NOTE_DESCRIPTION_MAX_LENGTH = 10000;
export const CAMPAIGN_MAX_PREPARED_ENCOUNTERS = CAMPAIGN_MAX_PREPARED_ENCOUNTERS_QUOTA;

const DEFAULT_PLAYER_VISIBILITY_SETTINGS: PlayerVisibilitySettingsRecord = {
  showVitalityStatus: true,
  showHpBar: false,
  showMonsterType: false,
  showBaseStatBlockDescription: false,
  showDmDescription: false,
  showArmorClass: false,
  showChallengeRating: false,
  showAbilityScoresAndSavingThrows: false,
  showResistancesAndImmunities: false,
  showSkills: false,
  showSenses: false,
  showLanguages: false,
  showActionsAndReactions: false
};

const PLAYER_VISIBILITY_SETTING_KEYS = Object.keys(
  DEFAULT_PLAYER_VISIBILITY_SETTINGS
) as (keyof PlayerVisibilitySettingsRecord)[];

type DocumentIdSource = {
  _id?: Types.ObjectId | { toString(): string };
  id?: string;
};

type CampaignSource = CampaignRecord & DocumentIdSource;

type CampaignListSource = DocumentIdSource & {
  name: string;
  ownerId: Types.ObjectId | string | { toString(): string };
  selectedPartyId?: Types.ObjectId | string | { toString(): string } | null;
  sessionNoteCount?: number;
  sessionNotes?: CampaignSessionNoteRecord[];
  preparedEncounterCount?: number;
  preparedEncounters?: CampaignPreparedEncounterRecord[];
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

type CampaignSelectedPartySummary = {
  id: string;
  name: string;
  memberCount: number;
} | null;

type CampaignPatchRecord = Partial<{
  name: string;
  selectedPartyId: string | null;
  visibilitySettings: PlayerVisibilitySettingsRecord;
  selectedParty: CampaignSelectedPartySummary;
  sessionNotes: CampaignSessionNoteRecord[];
  sessionNoteCount: number;
  preparedEncounters: CampaignPreparedEncounterRecord[];
  preparedEncounterCount: number;
  updatedAt: string | null;
}>;

type PartyGroupSource = PartyGroupRecord & DocumentIdSource;

type EncounterTemplateSource = {
  _id?: Types.ObjectId | { toString(): string };
  id?: string;
  name: string;
  creatures?: EncounterTemplateCreatureRecord[];
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getDocumentId(document: DocumentIdSource) {
  return document.id ?? document._id?.toString() ?? "";
}

function toIsoTimestamp(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function toStringId(value: Types.ObjectId | string | { toString(): string } | null | undefined) {
  return value ? value.toString() : null;
}

function normalizeText(
  value: unknown,
  fieldName: string,
  options?: { maxLength?: number; required?: boolean }
) {
  if (typeof value !== "string") {
    if (options?.required) {
      throw new AppError(`${fieldName} is required.`, 400, "INVALID_CAMPAIGN_INPUT", {
        field: fieldName
      });
    }

    return "";
  }

  const normalizedValue = value.trim();

  if (options?.required && !normalizedValue) {
    throw new AppError(`${fieldName} is required.`, 400, "INVALID_CAMPAIGN_INPUT", {
      field: fieldName
    });
  }

  if (options?.maxLength !== undefined && normalizedValue.length > options.maxLength) {
    throw new AppError(
      `${fieldName} must be at most ${options.maxLength} characters.`,
      400,
      "INVALID_CAMPAIGN_INPUT",
      {
        field: fieldName,
        maxLength: options.maxLength
      }
    );
  }

  return normalizedValue;
}

function createCampaignOwnedObjectId(value: unknown, errorMessage: string, errorCode: string) {
  if (typeof value !== "string" || !Types.ObjectId.isValid(value)) {
    throw new AppError(errorMessage, 400, errorCode);
  }

  return new Types.ObjectId(value);
}

function createCampaignEntryId() {
  return new Types.ObjectId().toString();
}

async function findOwnedCampaignDocument(options: {
  campaignId: string;
  ownerId: Types.ObjectId;
}): Promise<CampaignDocument> {
  const campaignId = createCampaignOwnedObjectId(
    options.campaignId,
    "Campaign id is invalid.",
    "INVALID_CAMPAIGN_ID"
  );

  const campaign = await Campaign.findOne({
    _id: campaignId,
    ownerId: options.ownerId
  }).exec();

  if (!campaign) {
    throw new AppError("Campaign was not found.", 404, "CAMPAIGN_NOT_FOUND");
  }

  return campaign;
}

function normalizeCampaignSessionNote(value: unknown): Omit<CampaignSessionNoteRecord, "id"> {
  if (!isObjectRecord(value)) {
    throw new AppError("Session note payload must be an object.", 400, "INVALID_CAMPAIGN_INPUT");
  }

  const name = normalizeText(value.name, "name");
  const description = normalizeText(value.description, "description", {
    maxLength: CAMPAIGN_SESSION_NOTE_DESCRIPTION_MAX_LENGTH,
    required: true
  });

  return {
    ...(name ? { name } : {}),
    description
  };
}

function normalizePlayerVisibilitySettings(
  value: unknown,
  options?: { allowNull?: boolean }
): PlayerVisibilitySettingsRecord | null {
  if (value === null || value === undefined) {
    if (options?.allowNull) {
      return null;
    }

    throw new AppError("Visibility settings are invalid.", 400, "INVALID_CAMPAIGN_VISIBILITY");
  }

  if (!isObjectRecord(value)) {
    throw new AppError("Visibility settings are invalid.", 400, "INVALID_CAMPAIGN_VISIBILITY");
  }

  const legacyShowHpBar =
    typeof value.showHpBar === "boolean"
      ? value.showHpBar
      : typeof value.showHp === "boolean"
        ? value.showHp
        : DEFAULT_PLAYER_VISIBILITY_SETTINGS.showHpBar;

  const settings = { ...DEFAULT_PLAYER_VISIBILITY_SETTINGS };

  PLAYER_VISIBILITY_SETTING_KEYS.forEach((key) => {
    settings[key] =
      key === "showHpBar"
        ? legacyShowHpBar
        : typeof value[key] === "boolean"
          ? value[key]
          : DEFAULT_PLAYER_VISIBILITY_SETTINGS[key];
  });

  return settings;
}

function normalizeCampaignVisibilitySettings(value: unknown): PlayerVisibilitySettingsRecord {
  const settings = normalizePlayerVisibilitySettings(value);

  if (!settings) {
    throw new AppError("Visibility settings are invalid.", 400, "INVALID_CAMPAIGN_VISIBILITY");
  }

  return settings;
}

function normalizeSelectedPartyId(value: unknown): Types.ObjectId | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return createCampaignOwnedObjectId(
    value,
    "Party group id is invalid.",
    "INVALID_PARTY_GROUP_ID"
  );
}

function cloneEncounterCreature(creature: EncounterTemplateCreatureRecord) {
  const clonedCreature = {
    ...(JSON.parse(JSON.stringify(creature)) as EncounterTemplateCreatureRecord),
    visibilitySettings: null
  } satisfies CampaignPreparedEncounterCreatureRecord;

  if (clonedCreature.inheritedCreatureEntry) {
    assertEncounterInheritedCreatureEntrySize(clonedCreature.inheritedCreatureEntry);
  }

  assertEncounterCreatureRecordSize(clonedCreature);

  return clonedCreature;
}

function normalizePreparedEncounterVisibilitySettings(value: unknown) {
  return normalizePlayerVisibilitySettings(value, { allowNull: true });
}

function toPlayerVisibilitySettingsRecord(
  value: unknown,
  options?: { allowNull?: boolean }
): PlayerVisibilitySettingsRecord | null {
  if (value === null || value === undefined) {
    return options?.allowNull ? null : { ...DEFAULT_PLAYER_VISIBILITY_SETTINGS };
  }

  return normalizePlayerVisibilitySettings(value, options);
}

function toPreparedEncounterCreatureRecord(
  creature: CampaignPreparedEncounterCreatureRecord
): CampaignPreparedEncounterCreatureRecord {
  return {
    ...clonePlainObject(creature),
    visibilitySettings: toPlayerVisibilitySettingsRecord(creature.visibilitySettings, {
      allowNull: true
    })
  };
}

function toPreparedEncounterRecord(
  preparedEncounter: CampaignPreparedEncounterRecord
): CampaignPreparedEncounterRecord {
  return {
    id: preparedEncounter.id,
    name: preparedEncounter.name,
    visibilitySettings: toPlayerVisibilitySettingsRecord(preparedEncounter.visibilitySettings, {
      allowNull: true
    }),
    creatures: (preparedEncounter.creatures ?? []).map(toPreparedEncounterCreatureRecord)
  };
}

function clonePlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizePreparedEncounterId(value: string) {
  return normalizeText(value, "preparedEncounterId", { required: true });
}

function findPreparedEncounter(
  campaign: CampaignDocument,
  preparedEncounterId: string
): { index: number; preparedEncounter: CampaignPreparedEncounterRecord } {
  const normalizedPreparedEncounterId = normalizePreparedEncounterId(preparedEncounterId);
  const index = campaign.preparedEncounters.findIndex(
    (preparedEncounter) => preparedEncounter.id === normalizedPreparedEncounterId
  );

  if (index < 0) {
    throw new AppError("Prepared encounter was not found.", 404, "PREPARED_ENCOUNTER_NOT_FOUND");
  }

  return {
    index,
    preparedEncounter: campaign.preparedEncounters[index]!
  };
}

export function normalizeCampaignName(value: unknown) {
  if (typeof value !== "string") {
    throw new AppError("Campaign name is required.", 400, "INVALID_CAMPAIGN_NAME");
  }

  const name = value.trim();

  if (name.length < CAMPAIGN_NAME_MIN_LENGTH || name.length > CAMPAIGN_NAME_MAX_LENGTH) {
    throw new AppError(
      `Campaign name must be ${CAMPAIGN_NAME_MIN_LENGTH}-${CAMPAIGN_NAME_MAX_LENGTH} characters.`,
      400,
      "INVALID_CAMPAIGN_NAME",
      {
        minLength: CAMPAIGN_NAME_MIN_LENGTH,
        maxLength: CAMPAIGN_NAME_MAX_LENGTH
      }
    );
  }

  return name;
}

async function getOwnedPartySummary(options: {
  ownerId: Types.ObjectId;
  partyGroupId: Types.ObjectId | string | null | undefined;
}) {
  if (!options.partyGroupId) {
    return null;
  }

  const partyGroup = (await PartyGroup.findOne({
    _id: options.partyGroupId,
    ownerId: options.ownerId
  })
    .select("_id name characterIds")
    .lean()
    .exec()) as PartyGroupSource | null;

  if (!partyGroup) {
    return null;
  }

  return {
    id: getDocumentId(partyGroup),
    name: partyGroup.name,
    memberCount: partyGroup.characterIds.length
  };
}

function getCampaignSessionNoteCount(campaign: CampaignListSource) {
  return campaign.sessionNoteCount ?? campaign.sessionNotes?.length ?? 0;
}

function getCampaignPreparedEncounterCount(campaign: CampaignListSource) {
  return campaign.preparedEncounterCount ?? campaign.preparedEncounters?.length ?? 0;
}

function toSessionNoteRecords(sessionNotes: CampaignSessionNoteRecord[] | undefined) {
  return (sessionNotes ?? []).map((sessionNote) => ({
    id: sessionNote.id,
    ...(sessionNote.name ? { name: sessionNote.name } : {}),
    description: sessionNote.description
  }));
}

function toCampaignListRecord(campaign: CampaignListSource) {
  return {
    id: getDocumentId(campaign),
    name: campaign.name,
    ownerId: campaign.ownerId.toString(),
    selectedPartyId: toStringId(campaign.selectedPartyId),
    sessionNoteCount: getCampaignSessionNoteCount(campaign),
    preparedEncounterCount: getCampaignPreparedEncounterCount(campaign),
    createdAt: toIsoTimestamp(campaign.createdAt),
    updatedAt: toIsoTimestamp(campaign.updatedAt)
  };
}

async function toCampaignDetailRecord(campaign: CampaignSource) {
  return {
    ...toCampaignListRecord(campaign),
    maxSessionNotes: CAMPAIGN_MAX_SESSION_NOTES,
    visibilitySettings: toPlayerVisibilitySettingsRecord(campaign.visibilitySettings),
    selectedParty: await getOwnedPartySummary({
      ownerId: campaign.ownerId,
      partyGroupId: campaign.selectedPartyId
    }),
    maxPreparedEncounters: CAMPAIGN_MAX_PREPARED_ENCOUNTERS,
    sessionNotes: toSessionNoteRecords(campaign.sessionNotes),
    preparedEncounters: (campaign.preparedEncounters ?? []).map(toPreparedEncounterRecord)
  };
}

function toCampaignPatchEnvelope(campaign: CampaignSource, patch: CampaignPatchRecord) {
  return {
    campaignId: getDocumentId(campaign),
    patch: {
      ...patch,
      updatedAt: toIsoTimestamp(campaign.updatedAt)
    }
  };
}

export async function listOwnedCampaigns(ownerId: Types.ObjectId) {
  const campaigns = (await Campaign.aggregate<CampaignListSource>([
    { $match: { ownerId } },
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        name: 1,
        ownerId: 1,
        selectedPartyId: 1,
        sessionNoteCount: { $size: { $ifNull: ["$sessionNotes", []] } },
        preparedEncounterCount: { $size: { $ifNull: ["$preparedEncounters", []] } },
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]).exec()) as CampaignListSource[];

  return campaigns.map(toCampaignListRecord);
}

export async function createOwnedCampaign(options: {
  name: string;
  ownerId: Types.ObjectId;
  ownerRole: UserRole;
}) {
  const countOwnedCampaigns = () => Campaign.countDocuments({ ownerId: options.ownerId }).exec();
  const currentCount = await countOwnedCampaigns();

  assertDmToolCreationLimit({
    currentCount,
    kind: "campaigns",
    role: options.ownerRole
  });

  const campaign = await Campaign.create({
    name: normalizeCampaignName(options.name),
    ownerId: options.ownerId,
    sessionNotes: [],
    visibilitySettings: { ...DEFAULT_PLAYER_VISIBILITY_SETTINGS },
    selectedPartyId: null,
    preparedEncounters: []
  });

  await assertCreatedDmToolWithinLimit({
    countDocuments: countOwnedCampaigns,
    isCreatedWithinLimit: async (limit) => {
      const retainedCampaigns = await Campaign.find({ ownerId: options.ownerId })
        .sort({ createdAt: 1, _id: 1 })
        .limit(limit)
        .select("_id")
        .lean()
        .exec();

      return retainedCampaigns.some(
        (retainedCampaign) => retainedCampaign._id.toString() === campaign._id.toString()
      );
    },
    kind: "campaigns",
    removeCreated: () =>
      Campaign.deleteOne({
        _id: campaign._id,
        ownerId: options.ownerId
      }).exec(),
    role: options.ownerRole
  });

  return toCampaignListRecord(campaign);
}

export async function getOwnedCampaignDetail(options: {
  campaignId: string;
  ownerId: Types.ObjectId;
}) {
  const campaign = await findOwnedCampaignDocument(options);

  return toCampaignDetailRecord(campaign);
}

export async function updateOwnedCampaignName(options: {
  campaignId: string;
  name: string;
  ownerId: Types.ObjectId;
}) {
  const campaign = await findOwnedCampaignDocument(options);

  campaign.name = normalizeCampaignName(options.name);
  await campaign.save();

  return toCampaignPatchEnvelope(campaign, {
    name: campaign.name
  });
}

export async function updateCampaignVisibilitySettings(options: {
  campaignId: string;
  ownerId: Types.ObjectId;
  visibilitySettings: unknown;
}) {
  const campaign = await findOwnedCampaignDocument(options);

  campaign.visibilitySettings = normalizeCampaignVisibilitySettings(options.visibilitySettings);
  await campaign.save();

  return toCampaignPatchEnvelope(campaign, {
    visibilitySettings: toPlayerVisibilitySettingsRecord(campaign.visibilitySettings) ?? {
      ...DEFAULT_PLAYER_VISIBILITY_SETTINGS
    }
  });
}

export async function updateCampaignSelectedParty(options: {
  campaignId: string;
  ownerId: Types.ObjectId;
  partyGroupId: unknown;
}) {
  const campaign = await findOwnedCampaignDocument(options);
  const selectedPartyId = normalizeSelectedPartyId(options.partyGroupId);

  if (selectedPartyId) {
    const partyGroup = await PartyGroup.findOne({
      _id: selectedPartyId,
      ownerId: options.ownerId
    }).exec();

    if (!partyGroup) {
      throw new AppError("Party group was not found.", 404, "PARTY_GROUP_NOT_FOUND");
    }
  }

  campaign.selectedPartyId = selectedPartyId;
  await campaign.save();

  return toCampaignPatchEnvelope(campaign, {
    selectedPartyId: toStringId(campaign.selectedPartyId),
    selectedParty: await getOwnedPartySummary({
      ownerId: options.ownerId,
      partyGroupId: campaign.selectedPartyId
    })
  });
}

export async function createCampaignSessionNote(options: {
  campaignId: string;
  ownerId: Types.ObjectId;
  sessionNote: unknown;
}) {
  const campaignId = createCampaignOwnedObjectId(
    options.campaignId,
    "Campaign id is invalid.",
    "INVALID_CAMPAIGN_ID"
  );
  const sessionNote = {
    id: createCampaignEntryId(),
    ...normalizeCampaignSessionNote(options.sessionNote)
  };

  const campaign = await Campaign.findOneAndUpdate(
    {
      _id: campaignId,
      ownerId: options.ownerId,
      [`sessionNotes.${CAMPAIGN_MAX_SESSION_NOTES - 1}`]: { $exists: false }
    },
    {
      $push: {
        sessionNotes: sessionNote
      }
    },
    {
      new: true,
      runValidators: true
    }
  ).exec();

  if (!campaign) {
    const existingCampaign = await findOwnedCampaignDocument(options);

    if (existingCampaign.sessionNotes.length >= CAMPAIGN_MAX_SESSION_NOTES) {
      throw new AppError("Campaign session note limit reached.", 409, "CAMPAIGN_SESSION_NOTES_FULL", {
        maxSessionNotes: CAMPAIGN_MAX_SESSION_NOTES
      });
    }

    throw new AppError("Unable to create session note.", 409, "CAMPAIGN_UPDATE_CONFLICT");
  }

  return toCampaignPatchEnvelope(campaign, {
    sessionNotes: toSessionNoteRecords(campaign.sessionNotes),
    sessionNoteCount: campaign.sessionNotes.length
  });
}

export async function updateCampaignSessionNote(options: {
  campaignId: string;
  ownerId: Types.ObjectId;
  sessionNote: unknown;
  sessionNoteId: string;
}) {
  const campaign = await findOwnedCampaignDocument(options);
  const sessionNoteId = normalizeText(options.sessionNoteId, "sessionNoteId", { required: true });
  const sessionNoteIndex = campaign.sessionNotes.findIndex(
    (sessionNote) => sessionNote.id === sessionNoteId
  );

  if (sessionNoteIndex < 0) {
    throw new AppError("Session note was not found.", 404, "SESSION_NOTE_NOT_FOUND");
  }

  campaign.sessionNotes[sessionNoteIndex] = {
    id: sessionNoteId,
    ...normalizeCampaignSessionNote(options.sessionNote)
  };
  await campaign.save();

  return toCampaignPatchEnvelope(campaign, {
    sessionNotes: toSessionNoteRecords(campaign.sessionNotes),
    sessionNoteCount: campaign.sessionNotes.length
  });
}

export async function removeCampaignSessionNote(options: {
  campaignId: string;
  ownerId: Types.ObjectId;
  sessionNoteId: string;
}) {
  const campaign = await findOwnedCampaignDocument(options);
  const sessionNoteId = normalizeText(options.sessionNoteId, "sessionNoteId", { required: true });
  const nextSessionNotes = campaign.sessionNotes.filter(
    (sessionNote) => sessionNote.id !== sessionNoteId
  );

  if (nextSessionNotes.length === campaign.sessionNotes.length) {
    throw new AppError("Session note was not found.", 404, "SESSION_NOTE_NOT_FOUND");
  }

  campaign.sessionNotes = nextSessionNotes;
  await campaign.save();

  return toCampaignPatchEnvelope(campaign, {
    sessionNotes: toSessionNoteRecords(campaign.sessionNotes),
    sessionNoteCount: campaign.sessionNotes.length
  });
}

export async function createCampaignPreparedEncounter(options: {
  campaignId: string;
  name: unknown;
  ownerId: Types.ObjectId;
}) {
  const campaignId = createCampaignOwnedObjectId(
    options.campaignId,
    "Campaign id is invalid.",
    "INVALID_CAMPAIGN_ID"
  );
  const preparedEncounter = {
    id: createCampaignEntryId(),
    name: normalizeEncounterTemplateName(options.name),
    visibilitySettings: null,
    creatures: []
  };

  const campaign = await Campaign.findOneAndUpdate(
    {
      _id: campaignId,
      ownerId: options.ownerId,
      [`preparedEncounters.${CAMPAIGN_MAX_PREPARED_ENCOUNTERS - 1}`]: { $exists: false }
    },
    {
      $push: {
        preparedEncounters: preparedEncounter
      }
    },
    {
      new: true,
      runValidators: true
    }
  ).exec();

  if (!campaign) {
    const existingCampaign = await findOwnedCampaignDocument(options);

    if (existingCampaign.preparedEncounters.length >= CAMPAIGN_MAX_PREPARED_ENCOUNTERS) {
      throw new AppError(
        "Campaign prepared encounter limit reached.",
        409,
        "CAMPAIGN_PREPARED_ENCOUNTERS_FULL",
        {
          maxPreparedEncounters: CAMPAIGN_MAX_PREPARED_ENCOUNTERS
        }
      );
    }

    throw new AppError("Unable to create prepared encounter.", 409, "CAMPAIGN_UPDATE_CONFLICT");
  }

  return toCampaignPatchEnvelope(campaign, {
    preparedEncounters: campaign.preparedEncounters.map(toPreparedEncounterRecord),
    preparedEncounterCount: campaign.preparedEncounters.length
  });
}

export async function copyEncounterTemplateToCampaign(options: {
  campaignId: string;
  encounterTemplateId: string;
  ownerId: Types.ObjectId;
}) {
  const campaignId = createCampaignOwnedObjectId(
    options.campaignId,
    "Campaign id is invalid.",
    "INVALID_CAMPAIGN_ID"
  );
  const encounterTemplateId = createCampaignOwnedObjectId(
    options.encounterTemplateId,
    "Encounter template id is invalid.",
    "INVALID_ENCOUNTER_TEMPLATE_ID"
  );
  const encounterTemplate = (await EncounterTemplate.findOne({
    _id: encounterTemplateId,
    ownerId: options.ownerId
  })
    .lean()
    .exec()) as EncounterTemplateSource | null;

  if (!encounterTemplate) {
    throw new AppError("Encounter template was not found.", 404, "ENCOUNTER_TEMPLATE_NOT_FOUND");
  }

  const preparedEncounter = {
    id: createCampaignEntryId(),
    name: encounterTemplate.name,
    visibilitySettings: null,
    creatures: (encounterTemplate.creatures ?? []).map(cloneEncounterCreature)
  };

  assertEncounterCreatureListSize(preparedEncounter.creatures);

  const campaign = await Campaign.findOneAndUpdate(
    {
      _id: campaignId,
      ownerId: options.ownerId,
      [`preparedEncounters.${CAMPAIGN_MAX_PREPARED_ENCOUNTERS - 1}`]: { $exists: false }
    },
    {
      $push: {
        preparedEncounters: preparedEncounter
      }
    },
    {
      new: true,
      runValidators: true
    }
  ).exec();

  if (!campaign) {
    const existingCampaign = await findOwnedCampaignDocument(options);

    if (existingCampaign.preparedEncounters.length >= CAMPAIGN_MAX_PREPARED_ENCOUNTERS) {
      throw new AppError(
        "Campaign prepared encounter limit reached.",
        409,
        "CAMPAIGN_PREPARED_ENCOUNTERS_FULL",
        {
          maxPreparedEncounters: CAMPAIGN_MAX_PREPARED_ENCOUNTERS
        }
      );
    }

    throw new AppError("Unable to import encounter template.", 409, "CAMPAIGN_UPDATE_CONFLICT");
  }

  return toCampaignPatchEnvelope(campaign, {
    preparedEncounters: campaign.preparedEncounters.map(toPreparedEncounterRecord),
    preparedEncounterCount: campaign.preparedEncounters.length
  });
}

export async function updateCampaignPreparedEncounterName(options: {
  campaignId: string;
  name: unknown;
  ownerId: Types.ObjectId;
  preparedEncounterId: string;
}) {
  const campaign = await findOwnedCampaignDocument(options);
  const { index, preparedEncounter } = findPreparedEncounter(campaign, options.preparedEncounterId);

  campaign.preparedEncounters[index] = {
    id: preparedEncounter.id,
    name: normalizeEncounterTemplateName(options.name),
    visibilitySettings: preparedEncounter.visibilitySettings ?? null,
    creatures: preparedEncounter.creatures ?? []
  };
  campaign.markModified("preparedEncounters");
  await campaign.save();

  return toCampaignPatchEnvelope(campaign, {
    preparedEncounters: campaign.preparedEncounters.map(toPreparedEncounterRecord),
    preparedEncounterCount: campaign.preparedEncounters.length
  });
}

export async function updateCampaignPreparedEncounterVisibilitySettings(options: {
  campaignId: string;
  ownerId: Types.ObjectId;
  preparedEncounterId: string;
  visibilitySettings: unknown;
}) {
  const campaign = await findOwnedCampaignDocument(options);
  const { index, preparedEncounter } = findPreparedEncounter(campaign, options.preparedEncounterId);

  campaign.preparedEncounters[index] = {
    id: preparedEncounter.id,
    name: preparedEncounter.name,
    visibilitySettings: normalizePreparedEncounterVisibilitySettings(options.visibilitySettings),
    creatures: preparedEncounter.creatures ?? []
  };
  campaign.markModified("preparedEncounters");
  await campaign.save();

  return toCampaignPatchEnvelope(campaign, {
    preparedEncounters: campaign.preparedEncounters.map(toPreparedEncounterRecord),
    preparedEncounterCount: campaign.preparedEncounters.length
  });
}

export async function removeCampaignPreparedEncounter(options: {
  campaignId: string;
  ownerId: Types.ObjectId;
  preparedEncounterId: string;
}) {
  const campaign = await findOwnedCampaignDocument(options);
  const preparedEncounterId = normalizePreparedEncounterId(options.preparedEncounterId);
  const nextPreparedEncounters = campaign.preparedEncounters.filter(
    (preparedEncounter) => preparedEncounter.id !== preparedEncounterId
  );

  if (nextPreparedEncounters.length === campaign.preparedEncounters.length) {
    throw new AppError("Prepared encounter was not found.", 404, "PREPARED_ENCOUNTER_NOT_FOUND");
  }

  campaign.preparedEncounters = nextPreparedEncounters;
  await campaign.save();

  return toCampaignPatchEnvelope(campaign, {
    preparedEncounters: campaign.preparedEncounters.map(toPreparedEncounterRecord),
    preparedEncounterCount: campaign.preparedEncounters.length
  });
}

export async function updateCampaignPreparedEncounterCreatureVisibilitySettings(options: {
  campaignId: string;
  creatureId: string;
  ownerId: Types.ObjectId;
  preparedEncounterId: string;
  visibilitySettings: unknown;
}) {
  const campaign = await findOwnedCampaignDocument(options);
  const { index, preparedEncounter } = findPreparedEncounter(campaign, options.preparedEncounterId);
  const creatureId = normalizeText(options.creatureId, "creatureId", { required: true });
  const creatureIndex = preparedEncounter.creatures.findIndex((creature) => creature.id === creatureId);

  if (creatureIndex < 0) {
    throw new AppError(
      "Prepared encounter creature was not found.",
      404,
      "ENCOUNTER_CREATURE_NOT_FOUND"
    );
  }

  const nextCreatures = [...preparedEncounter.creatures];
  const creature = nextCreatures[creatureIndex]!;
  nextCreatures[creatureIndex] = {
    ...creature,
    visibilitySettings: normalizePreparedEncounterVisibilitySettings(options.visibilitySettings)
  };

  campaign.preparedEncounters[index] = {
    id: preparedEncounter.id,
    name: preparedEncounter.name,
    visibilitySettings: preparedEncounter.visibilitySettings ?? null,
    creatures: nextCreatures
  };
  campaign.markModified("preparedEncounters");
  await campaign.save();

  return toCampaignPatchEnvelope(campaign, {
    preparedEncounters: campaign.preparedEncounters.map(toPreparedEncounterRecord),
    preparedEncounterCount: campaign.preparedEncounters.length
  });
}

export async function upsertCampaignPreparedEncounterCreature(options: {
  campaignId: string;
  creature: unknown;
  creatureId: string;
  ownerId: Types.ObjectId;
  preparedEncounterId: string;
}) {
  const campaign = await findOwnedCampaignDocument(options);
  const { index, preparedEncounter } = findPreparedEncounter(campaign, options.preparedEncounterId);
  const creature = normalizeEncounterTemplateCreature(options.creatureId, options.creature);
  const existingCreatureIndex = preparedEncounter.creatures.findIndex(
    (currentCreature) => currentCreature.id === creature.id
  );

  if (
    existingCreatureIndex < 0 &&
    preparedEncounter.creatures.length >= ENCOUNTER_TEMPLATE_MAX_CREATURES
  ) {
    throw new AppError("Prepared encounter is full.", 409, "PREPARED_ENCOUNTER_FULL", {
      maxCreatures: ENCOUNTER_TEMPLATE_MAX_CREATURES
    });
  }

  const nextCreatures = [...preparedEncounter.creatures];

  if (existingCreatureIndex >= 0) {
    nextCreatures[existingCreatureIndex] = {
      ...creature,
      visibilitySettings: nextCreatures[existingCreatureIndex]?.visibilitySettings ?? null
    };
  } else {
    nextCreatures.push({
      ...creature,
      visibilitySettings: null
    });
  }

  const nextCreatureIndex = existingCreatureIndex >= 0 ? existingCreatureIndex : nextCreatures.length - 1;
  const nextCreature = nextCreatures[nextCreatureIndex]!;

  assertEncounterCreatureRecordSize(nextCreature);
  assertEncounterCreatureListSize(nextCreatures);

  campaign.preparedEncounters[index] = {
    id: preparedEncounter.id,
    name: preparedEncounter.name,
    visibilitySettings: preparedEncounter.visibilitySettings ?? null,
    creatures: nextCreatures
  };
  campaign.markModified("preparedEncounters");
  await campaign.save();

  return toCampaignPatchEnvelope(campaign, {
    preparedEncounters: campaign.preparedEncounters.map(toPreparedEncounterRecord),
    preparedEncounterCount: campaign.preparedEncounters.length
  });
}

export async function removeCampaignPreparedEncounterCreature(options: {
  campaignId: string;
  creatureId: string;
  ownerId: Types.ObjectId;
  preparedEncounterId: string;
}) {
  const campaign = await findOwnedCampaignDocument(options);
  const { index, preparedEncounter } = findPreparedEncounter(campaign, options.preparedEncounterId);
  const creatureId = normalizeText(options.creatureId, "creatureId", { required: true });
  const nextCreatures = preparedEncounter.creatures.filter((creature) => creature.id !== creatureId);

  if (nextCreatures.length === preparedEncounter.creatures.length) {
    throw new AppError("Prepared encounter creature was not found.", 404, "ENCOUNTER_CREATURE_NOT_FOUND");
  }

  campaign.preparedEncounters[index] = {
    id: preparedEncounter.id,
    name: preparedEncounter.name,
    visibilitySettings: preparedEncounter.visibilitySettings ?? null,
    creatures: nextCreatures
  };
  campaign.markModified("preparedEncounters");
  await campaign.save();

  return toCampaignPatchEnvelope(campaign, {
    preparedEncounters: campaign.preparedEncounters.map(toPreparedEncounterRecord),
    preparedEncounterCount: campaign.preparedEncounters.length
  });
}
