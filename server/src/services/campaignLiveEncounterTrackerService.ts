import { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";
import {
  Campaign,
  type CampaignDocument,
  type CampaignLiveEncounterParticipantRefRecord,
  type CampaignLiveEncounterTrackerRecord,
  type CampaignPreparedEncounterRecord,
  type CampaignRecord
} from "../models/Campaign.js";
import {
  CharacterSheet,
  type CharacterAvatarRecord,
  type CharacterEncounterCompanionSummaryRecord,
  type CharacterEncounterStatBlockRecord,
  type CharacterSheetSummaryRecord
} from "../models/CharacterSheet.js";
import { PartyGroup, type PartyGroupRecord } from "../models/PartyGroup.js";
import { User } from "../models/User.js";
import {
  CHARACTER_COMPANION_LIMIT,
  ENCOUNTER_MAX_CREATURES,
  PARTY_GROUP_MAX_MEMBERS
} from "../constants/QUOTAS.js";
import {
  createLiveEncounterCreatureWithEffectivePlayerVisibility,
  createPlayerVisibleLiveEncounterCreature,
  type LiveEncounterCreatureWithEffectiveVisibility,
  type PlayerVisibleLiveEncounterCreatureRecord
} from "./liveEncounterPlayerVisibility.js";

const LIVE_ENCOUNTER_TRACKER_MAX_PARTICIPANTS =
  PARTY_GROUP_MAX_MEMBERS * (CHARACTER_COMPANION_LIMIT + 1) + ENCOUNTER_MAX_CREATURES;

type DocumentIdSource = {
  _id?: Types.ObjectId | { toString(): string };
  id?: string;
};

type CampaignSource = CampaignRecord & DocumentIdSource;

type CampaignPatchRecord = Partial<{
  liveEncounterTracker: CampaignLiveEncounterTrackerDetailRecord | null;
  updatedAt: string | null;
}>;

type PartyGroupSource = PartyGroupRecord & DocumentIdSource;

type CharacterSheetMemberSource = DocumentIdSource & {
  ownerId: Types.ObjectId | { toString(): string } | string;
  summary: CharacterSheetSummaryRecord;
  avatar?: CharacterAvatarRecord | null;
  updatedAt?: Date | string | null;
};

type PartyGroupMemberUser = {
  id: string;
  nickname: string;
};

type LiveEncounterTrackerStatusRecord =
  | {
      state: "valid";
    }
  | {
      state: "invalid";
      code: string;
      message: string;
    };

export type CampaignLiveEncounterTrackerPartyMemberRecord =
  CampaignLiveEncounterParticipantRefRecord & {
    kind: "party-member";
    characterId: string;
    ownerId: string;
    user: PartyGroupMemberUser;
    summary: CharacterSheetSummaryRecord;
    statBlock?: CharacterEncounterStatBlockRecord;
    companions: CharacterEncounterCompanionSummaryRecord[];
    avatar: ReturnType<typeof toAvatarResponse>;
    updatedAt: string | null;
  };

export type CampaignLiveEncounterTrackerPartyCompanionRecord =
  CampaignLiveEncounterParticipantRefRecord & {
    kind: "party-companion";
    characterId: string;
    companionId: string;
    ownerId: string;
    user: PartyGroupMemberUser;
    summary: CharacterSheetSummaryRecord;
    companion: CharacterEncounterCompanionSummaryRecord;
    avatar: ReturnType<typeof toAvatarResponse>;
    updatedAt: string | null;
  };

export type CampaignLiveEncounterTrackerPartyParticipantRecord =
  | CampaignLiveEncounterTrackerPartyMemberRecord
  | CampaignLiveEncounterTrackerPartyCompanionRecord;

export type CampaignLiveEncounterTrackerCreatureRecord =
  CampaignLiveEncounterParticipantRefRecord & {
    kind: "creature";
    creatureId: string;
    creature:
      | LiveEncounterCreatureWithEffectiveVisibility
      | PlayerVisibleLiveEncounterCreatureRecord;
  };

export type CampaignLiveEncounterTrackerParticipantRecord =
  | CampaignLiveEncounterTrackerPartyCompanionRecord
  | CampaignLiveEncounterTrackerPartyMemberRecord
  | CampaignLiveEncounterTrackerCreatureRecord;

export type CampaignLiveEncounterTrackerDetailRecord = {
  preparedEncounterId: string;
  preparedEncounterName: string;
  partyGroupId: string;
  activeParticipantId: string | null;
  roundNumber: number;
  status: LiveEncounterTrackerStatusRecord;
  partyMembers: CampaignLiveEncounterTrackerPartyParticipantRecord[];
  creatures: CampaignLiveEncounterTrackerCreatureRecord[];
  initiativeOrder: CampaignLiveEncounterTrackerParticipantRecord[];
  revision: number;
  createdAt: string | null;
  updatedAt: string | null;
};

type LiveEncounterSourceContext = {
  allowedRefsByParticipantId: Map<string, CampaignLiveEncounterParticipantRefRecord>;
  creaturesByParticipantId: Map<string, CampaignLiveEncounterTrackerCreatureRecord>;
  partyMembersByParticipantId: Map<string, CampaignLiveEncounterTrackerPartyParticipantRecord>;
  preparedEncounter: CampaignPreparedEncounterRecord;
};

export type ReconciledLiveEncounterLists = {
  activeParticipantId: string | null;
  partyMembers: CampaignLiveEncounterParticipantRefRecord[];
  creatures: CampaignLiveEncounterParticipantRefRecord[];
  initiativeOrder: CampaignLiveEncounterParticipantRefRecord[];
};

type PartyMemberParticipantRefRecord = CampaignLiveEncounterParticipantRefRecord & {
  kind: "party-member";
  characterId: string;
};

type PartyCompanionParticipantRefRecord = CampaignLiveEncounterParticipantRefRecord & {
  kind: "party-companion";
  characterId: string;
  companionId: string;
};

type CreatureParticipantRefRecord = CampaignLiveEncounterParticipantRefRecord & {
  kind: "creature";
  creatureId: string;
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
  return value ? value.toString() : "";
}

export function createPartyMemberParticipantId(characterId: string) {
  return `member:${characterId}`;
}

function createPartyCompanionParticipantId(characterId: string, companionId: string) {
  return `companion:${characterId}:${companionId}`;
}

function createCreatureParticipantId(creatureId: string) {
  return `creature:${creatureId}`;
}

function createPartyMemberParticipantRef(
  characterId: string
): PartyMemberParticipantRefRecord {
  return {
    participantId: createPartyMemberParticipantId(characterId),
    kind: "party-member",
    characterId
  };
}

function createPartyCompanionParticipantRef(
  characterId: string,
  companionId: string
): PartyCompanionParticipantRefRecord {
  return {
    participantId: createPartyCompanionParticipantId(characterId, companionId),
    kind: "party-companion",
    characterId,
    companionId
  };
}

function createCreatureParticipantRef(
  creatureId: string
): CreatureParticipantRefRecord {
  return {
    participantId: createCreatureParticipantId(creatureId),
    kind: "creature",
    creatureId
  };
}

function toAvatarResponse(avatar: CharacterAvatarRecord | null | undefined) {
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

function createInvalidLiveEncounterTrackerRecord(
  tracker: CampaignLiveEncounterTrackerRecord,
  status: Extract<LiveEncounterTrackerStatusRecord, { state: "invalid" }>,
  preparedEncounter?: CampaignPreparedEncounterRecord
): CampaignLiveEncounterTrackerDetailRecord {
  return {
    preparedEncounterId: tracker.preparedEncounterId,
    preparedEncounterName: preparedEncounter?.name ?? "Missing encounter",
    partyGroupId: toStringId(tracker.partyGroupId),
    activeParticipantId: tracker.activeParticipantId ?? null,
    roundNumber: normalizeRoundNumber(tracker.roundNumber),
    status,
    partyMembers: [],
    creatures: [],
    initiativeOrder: [],
    revision: tracker.revision,
    createdAt: toIsoTimestamp(tracker.createdAt),
    updatedAt: toIsoTimestamp(tracker.updatedAt)
  };
}

function createCampaignOwnedObjectId(value: string, errorMessage: string, errorCode: string) {
  if (!value || !Types.ObjectId.isValid(value)) {
    throw new AppError(errorMessage, 400, errorCode);
  }

  return new Types.ObjectId(value);
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

function findPreparedEncounter(
  campaign: Pick<CampaignRecord, "preparedEncounters">,
  preparedEncounterId: string
) {
  return campaign.preparedEncounters.find(
    (preparedEncounter) => preparedEncounter.id === preparedEncounterId
  );
}

async function loadPartyMemberRecords(partyGroup: PartyGroupSource) {
  const characters = (await CharacterSheet.find({
    _id: { $in: partyGroup.characterIds },
    deletedAt: null
  })
    .select("_id ownerId summary avatar updatedAt")
    .lean()
    .exec()) as CharacterSheetMemberSource[];
  const charactersById = new Map(characters.map((character) => [getDocumentId(character), character]));
  const orderedCharacters = partyGroup.characterIds
    .map((characterId) => charactersById.get(characterId.toString()))
    .filter((character): character is CharacterSheetMemberSource => Boolean(character));

  if (orderedCharacters.length !== partyGroup.characterIds.length) {
    throw new AppError(
      "One or more party members could not be fetched.",
      409,
      "LIVE_ENCOUNTER_PARTY_MEMBERS_INVALID"
    );
  }

  const ownerIds = [...new Set(orderedCharacters.map((character) => character.ownerId.toString()))];
  const users = await User.find({
    _id: { $in: ownerIds }
  })
    .select("_id nickname")
    .lean()
    .exec();
  const userById = new Map(
    users.map((user) => [
      user._id.toString(),
      {
        id: user._id.toString(),
        nickname: user.nickname
      }
    ])
  );

  return orderedCharacters.flatMap((character) => {
    const characterId = getDocumentId(character);
    const statBlock = character.summary.encounterStatBlock;
    const companionSummaries = (character.summary.companions ?? []).slice(
      0,
      CHARACTER_COMPANION_LIMIT
    );
    const ownerId = character.ownerId.toString();
    const user = userById.get(ownerId) ?? {
      id: ownerId,
      nickname: "Unknown Player"
    };
    const avatar = toAvatarResponse(character.avatar);
    const updatedAt = toIsoTimestamp(character.updatedAt);
    const memberRecord = {
      ...createPartyMemberParticipantRef(characterId),
      ownerId,
      user,
      summary: character.summary,
      ...(statBlock ? { statBlock } : {}),
      companions: companionSummaries.filter((companion) => companion.separateInitiative !== true),
      avatar,
      updatedAt
    } satisfies CampaignLiveEncounterTrackerPartyMemberRecord;
    const companionRecords = companionSummaries
      .filter((companion) => companion.separateInitiative === true)
      .map(
        (companion): CampaignLiveEncounterTrackerPartyCompanionRecord => ({
          ...createPartyCompanionParticipantRef(characterId, companion.id),
          ownerId,
          user,
          summary: character.summary,
          companion,
          avatar,
          updatedAt
        })
      );

    return [memberRecord, ...companionRecords];
  });
}

async function loadLiveEncounterSourceContext(options: {
  campaign: CampaignSource;
  ownerId: Types.ObjectId;
}): Promise<LiveEncounterSourceContext> {
  const tracker = options.campaign.liveEncounterTracker;

  if (!tracker) {
    throw new AppError("There is no live encounter tracker.", 404, "LIVE_ENCOUNTER_NOT_FOUND");
  }

  const preparedEncounter = findPreparedEncounter(options.campaign, tracker.preparedEncounterId);

  if (!preparedEncounter) {
    throw new AppError(
      "The prepared encounter for this live tracker was deleted.",
      409,
      "LIVE_ENCOUNTER_PREPARED_ENCOUNTER_MISSING"
    );
  }

  const selectedPartyId = toStringId(options.campaign.selectedPartyId);
  const trackerPartyGroupId = toStringId(tracker.partyGroupId);

  if (selectedPartyId !== trackerPartyGroupId) {
    throw new AppError(
      "The selected party changed after this encounter started.",
      409,
      "LIVE_ENCOUNTER_PARTY_CHANGED"
    );
  }

  const partyGroup = (await PartyGroup.findOne({
    _id: tracker.partyGroupId,
    ownerId: options.ownerId
  })
    .lean()
    .exec()) as PartyGroupSource | null;

  if (!partyGroup) {
    throw new AppError(
      "The party for this live tracker could not be fetched.",
      409,
      "LIVE_ENCOUNTER_PARTY_MISSING"
    );
  }

  const partyMembers = await loadPartyMemberRecords(partyGroup);
  const creatures = preparedEncounter.creatures.map(
    (creature): CampaignLiveEncounterTrackerCreatureRecord => ({
      ...createCreatureParticipantRef(creature.id),
      creature: createLiveEncounterCreatureWithEffectivePlayerVisibility({
        campaignVisibilitySettings: options.campaign.visibilitySettings,
        creature,
        preparedEncounter
      })
    })
  );
  const partyMembersByParticipantId = new Map(
    partyMembers.map((member) => [member.participantId, member])
  );
  const creaturesByParticipantId = new Map(
    creatures.map((creature) => [creature.participantId, creature])
  );
  const allowedRefsByParticipantId = new Map<string, CampaignLiveEncounterParticipantRefRecord>();

  partyMembers.forEach((member) => {
    allowedRefsByParticipantId.set(
      member.participantId,
      member.kind === "party-companion"
        ? createPartyCompanionParticipantRef(member.characterId, member.companionId)
        : createPartyMemberParticipantRef(member.characterId)
    );
  });
  creatures.forEach((creature) => {
    allowedRefsByParticipantId.set(creature.participantId, createCreatureParticipantRef(creature.creatureId));
  });

  return {
    allowedRefsByParticipantId,
    creaturesByParticipantId,
    partyMembersByParticipantId,
    preparedEncounter
  };
}

function addCanonicalRefsFromList(options: {
  allowedRefsByParticipantId: Map<string, CampaignLiveEncounterParticipantRefRecord>;
  destination: CampaignLiveEncounterParticipantRefRecord[];
  refs: CampaignLiveEncounterParticipantRefRecord[];
  seenParticipantIds: Set<string>;
}) {
  options.refs.forEach((ref) => {
    const canonicalRef = options.allowedRefsByParticipantId.get(ref.participantId);

    if (!canonicalRef || options.seenParticipantIds.has(canonicalRef.participantId)) {
      return;
    }

    options.destination.push(canonicalRef);
    options.seenParticipantIds.add(canonicalRef.participantId);
  });
}

function reconcileLiveEncounterLists(
  tracker: Pick<
    CampaignLiveEncounterTrackerRecord,
    "activeParticipantId" | "creatures" | "initiativeOrder" | "partyMembers"
  >,
  sourceContext: LiveEncounterSourceContext
): ReconciledLiveEncounterLists {
  const seenParticipantIds = new Set<string>();
  const partyMembers: CampaignLiveEncounterParticipantRefRecord[] = [];
  const creatures: CampaignLiveEncounterParticipantRefRecord[] = [];
  const initiativeOrder: CampaignLiveEncounterParticipantRefRecord[] = [];

  addCanonicalRefsFromList({
    allowedRefsByParticipantId: sourceContext.allowedRefsByParticipantId,
    destination: partyMembers,
    refs: tracker.partyMembers,
    seenParticipantIds
  });
  addCanonicalRefsFromList({
    allowedRefsByParticipantId: sourceContext.allowedRefsByParticipantId,
    destination: creatures,
    refs: tracker.creatures,
    seenParticipantIds
  });
  addCanonicalRefsFromList({
    allowedRefsByParticipantId: sourceContext.allowedRefsByParticipantId,
    destination: initiativeOrder,
    refs: tracker.initiativeOrder,
    seenParticipantIds
  });

  sourceContext.allowedRefsByParticipantId.forEach((ref) => {
    if (seenParticipantIds.has(ref.participantId)) {
      return;
    }

    if (ref.kind === "party-member" || ref.kind === "party-companion") {
      partyMembers.push(ref);
    } else {
      creatures.push(ref);
    }

    seenParticipantIds.add(ref.participantId);
  });

  const activeParticipantId: string | null =
    tracker.activeParticipantId &&
    initiativeOrder.some((ref) => ref.participantId === tracker.activeParticipantId)
      ? tracker.activeParticipantId
      : null;

  return {
    activeParticipantId,
    partyMembers,
    creatures,
    initiativeOrder
  };
}

function hydrateParticipantRef(
  ref: CampaignLiveEncounterParticipantRefRecord,
  sourceContext: LiveEncounterSourceContext
): CampaignLiveEncounterTrackerParticipantRecord | null {
  if (ref.kind === "party-member" || ref.kind === "party-companion") {
    return sourceContext.partyMembersByParticipantId.get(ref.participantId) ?? null;
  }

  return sourceContext.creaturesByParticipantId.get(ref.participantId) ?? null;
}

function hydrateParticipantList<T extends CampaignLiveEncounterTrackerParticipantRecord>(
  refs: CampaignLiveEncounterParticipantRefRecord[],
  sourceContext: LiveEncounterSourceContext
) {
  return refs
    .map((ref) => hydrateParticipantRef(ref, sourceContext))
    .filter((participant): participant is T => Boolean(participant));
}

function toCampaignLiveEncounterTrackerDetailRecordFromContext(options: {
  sourceContext: LiveEncounterSourceContext;
  tracker: CampaignLiveEncounterTrackerRecord;
}): CampaignLiveEncounterTrackerDetailRecord {
  const reconciledLists = reconcileLiveEncounterLists(options.tracker, options.sourceContext);

  return {
    preparedEncounterId: options.tracker.preparedEncounterId,
    preparedEncounterName: options.sourceContext.preparedEncounter.name,
    partyGroupId: toStringId(options.tracker.partyGroupId),
    activeParticipantId: reconciledLists.activeParticipantId,
    roundNumber: normalizeRoundNumber(options.tracker.roundNumber),
    status: {
      state: "valid"
    },
    partyMembers: hydrateParticipantList<CampaignLiveEncounterTrackerPartyParticipantRecord>(
      reconciledLists.partyMembers,
      options.sourceContext
    ),
    creatures: hydrateParticipantList<CampaignLiveEncounterTrackerCreatureRecord>(
      reconciledLists.creatures,
      options.sourceContext
    ),
    initiativeOrder: hydrateParticipantList<CampaignLiveEncounterTrackerParticipantRecord>(
      reconciledLists.initiativeOrder,
      options.sourceContext
    ),
    revision: options.tracker.revision,
    createdAt: toIsoTimestamp(options.tracker.createdAt),
    updatedAt: toIsoTimestamp(options.tracker.updatedAt)
  };
}

export async function toCampaignLiveEncounterTrackerDetailRecord(
  campaign: CampaignSource
): Promise<CampaignLiveEncounterTrackerDetailRecord | null> {
  const tracker = campaign.liveEncounterTracker;

  if (!tracker) {
    return null;
  }

  try {
    const sourceContext = await loadLiveEncounterSourceContext({
      campaign,
      ownerId: campaign.ownerId
    });

    return toCampaignLiveEncounterTrackerDetailRecordFromContext({
      sourceContext,
      tracker
    });
  } catch (error) {
    if (error instanceof AppError) {
      return createInvalidLiveEncounterTrackerRecord(
        tracker,
        {
          state: "invalid",
          code: error.code,
          message: error.message
        },
        findPreparedEncounter(campaign, tracker.preparedEncounterId)
      );
    }

    throw error;
  }
}

function toPlayerVisibleLiveEncounterCreatureParticipant(
  participant: CampaignLiveEncounterTrackerCreatureRecord
): CampaignLiveEncounterTrackerCreatureRecord {
  return {
    ...participant,
    creature: createPlayerVisibleLiveEncounterCreature(
      participant.creature as LiveEncounterCreatureWithEffectiveVisibility
    )
  };
}

function toPlayerVisibleLiveEncounterParticipant(
  participant: CampaignLiveEncounterTrackerParticipantRecord
): CampaignLiveEncounterTrackerParticipantRecord {
  return participant.kind === "creature"
    ? toPlayerVisibleLiveEncounterCreatureParticipant(participant)
    : participant;
}

function toPlayerVisibleLiveEncounterTrackerDetailRecord(
  tracker: CampaignLiveEncounterTrackerDetailRecord
): CampaignLiveEncounterTrackerDetailRecord {
  if (tracker.status.state !== "valid") {
    return tracker;
  }

  return {
    ...tracker,
    creatures: tracker.creatures.map(toPlayerVisibleLiveEncounterCreatureParticipant),
    initiativeOrder: tracker.initiativeOrder.map(toPlayerVisibleLiveEncounterParticipant)
  };
}

export async function toMemberVisibleCampaignLiveEncounterTrackerDetailRecord(
  campaign: CampaignSource
): Promise<CampaignLiveEncounterTrackerDetailRecord | null> {
  const tracker = await toCampaignLiveEncounterTrackerDetailRecord(campaign);

  return tracker ? toPlayerVisibleLiveEncounterTrackerDetailRecord(tracker) : null;
}

export async function createReconciledCampaignLiveEncounterTrackerSnapshot(
  campaign: CampaignSource
) {
  const tracker = campaign.liveEncounterTracker;

  if (!tracker) {
    throw new AppError("There is no live encounter tracker.", 404, "LIVE_ENCOUNTER_NOT_FOUND");
  }

  const sourceContext = await loadLiveEncounterSourceContext({
    campaign,
    ownerId: campaign.ownerId
  });

  return {
    tracker,
    reconciledLists: reconcileLiveEncounterLists(tracker, sourceContext),
    roundNumber: normalizeRoundNumber(tracker.roundNumber)
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

function normalizeStartPayload(value: unknown) {
  if (!isObjectRecord(value) || typeof value.preparedEncounterId !== "string") {
    throw new AppError(
      "Prepared encounter id is required.",
      400,
      "INVALID_LIVE_ENCOUNTER_INPUT"
    );
  }

  const preparedEncounterId = value.preparedEncounterId.trim();

  if (!preparedEncounterId) {
    throw new AppError(
      "Prepared encounter id is required.",
      400,
      "INVALID_LIVE_ENCOUNTER_INPUT"
    );
  }

  return {
    preparedEncounterId
  };
}

function normalizeRevision(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new AppError("Encounter tracker revision is invalid.", 400, "INVALID_LIVE_ENCOUNTER_INPUT");
  }

  return value;
}

function normalizeRoundNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    return 1;
  }

  return value;
}

function normalizeParticipantRef(value: unknown): CampaignLiveEncounterParticipantRefRecord {
  if (!isObjectRecord(value)) {
    throw new AppError("Encounter participant is invalid.", 400, "INVALID_LIVE_ENCOUNTER_INPUT");
  }

  if (value.kind === "party-member") {
    const characterId = typeof value.characterId === "string" ? value.characterId.trim() : "";
    const participantId = typeof value.participantId === "string" ? value.participantId.trim() : "";

    if (!characterId || participantId !== createPartyMemberParticipantId(characterId)) {
      throw new AppError("Party member participant is invalid.", 400, "INVALID_LIVE_ENCOUNTER_INPUT");
    }

    return createPartyMemberParticipantRef(characterId);
  }

  if (value.kind === "party-companion") {
    const characterId = typeof value.characterId === "string" ? value.characterId.trim() : "";
    const companionId = typeof value.companionId === "string" ? value.companionId.trim() : "";
    const participantId = typeof value.participantId === "string" ? value.participantId.trim() : "";

    if (
      !characterId ||
      !companionId ||
      participantId !== createPartyCompanionParticipantId(characterId, companionId)
    ) {
      throw new AppError("Party companion participant is invalid.", 400, "INVALID_LIVE_ENCOUNTER_INPUT");
    }

    return createPartyCompanionParticipantRef(characterId, companionId);
  }

  if (value.kind === "creature") {
    const creatureId = typeof value.creatureId === "string" ? value.creatureId.trim() : "";
    const participantId = typeof value.participantId === "string" ? value.participantId.trim() : "";

    if (!creatureId || participantId !== createCreatureParticipantId(creatureId)) {
      throw new AppError("Creature participant is invalid.", 400, "INVALID_LIVE_ENCOUNTER_INPUT");
    }

    return createCreatureParticipantRef(creatureId);
  }

  throw new AppError("Encounter participant is invalid.", 400, "INVALID_LIVE_ENCOUNTER_INPUT");
}

function normalizeParticipantRefList(value: unknown, fieldName: string) {
  if (!Array.isArray(value) || value.length > LIVE_ENCOUNTER_TRACKER_MAX_PARTICIPANTS) {
    throw new AppError(`${fieldName} is invalid.`, 400, "INVALID_LIVE_ENCOUNTER_INPUT");
  }

  return value.map(normalizeParticipantRef);
}

function normalizeTrackerUpdatePayload(value: unknown) {
  if (!isObjectRecord(value)) {
    throw new AppError("Encounter tracker payload is invalid.", 400, "INVALID_LIVE_ENCOUNTER_INPUT");
  }

  const activeParticipantId =
    typeof value.activeParticipantId === "string" && value.activeParticipantId.trim()
      ? value.activeParticipantId.trim()
      : null;

  return {
    activeParticipantId,
    creatures: normalizeParticipantRefList(value.creatures, "creatures"),
    initiativeOrder: normalizeParticipantRefList(value.initiativeOrder, "initiativeOrder"),
    partyMembers: normalizeParticipantRefList(value.partyMembers, "partyMembers"),
    roundNumber: normalizeRoundNumber(value.roundNumber),
    revision: normalizeRevision(value.revision)
  };
}

export async function startCampaignLiveEncounterTracker(options: {
  campaignId: string;
  ownerId: Types.ObjectId;
  payload: unknown;
}) {
  const campaign = await findOwnedCampaignDocument(options);
  const payload = normalizeStartPayload(options.payload);

  if (campaign.liveEncounterTracker) {
    throw new AppError(
      "A live encounter is already active.",
      409,
      "LIVE_ENCOUNTER_ALREADY_ACTIVE"
    );
  }

  if (!campaign.selectedPartyId) {
    throw new AppError(
      "Select a party before starting an encounter.",
      409,
      "LIVE_ENCOUNTER_PARTY_REQUIRED"
    );
  }

  const preparedEncounter = findPreparedEncounter(campaign, payload.preparedEncounterId);

  if (!preparedEncounter) {
    throw new AppError("Prepared encounter was not found.", 404, "PREPARED_ENCOUNTER_NOT_FOUND");
  }

  const now = new Date();
  campaign.liveEncounterTracker = {
    preparedEncounterId: preparedEncounter.id,
    partyGroupId: campaign.selectedPartyId,
    activeParticipantId: null,
    roundNumber: 1,
    partyMembers: [],
    creatures: [],
    initiativeOrder: [],
    revision: 1,
    createdAt: now,
    updatedAt: now
  };

  const sourceContext = await loadLiveEncounterSourceContext({
    campaign,
    ownerId: options.ownerId
  });

  campaign.liveEncounterTracker.partyMembers = [...sourceContext.partyMembersByParticipantId.values()].map(
    (member) =>
      member.kind === "party-companion"
        ? createPartyCompanionParticipantRef(member.characterId, member.companionId)
        : createPartyMemberParticipantRef(member.characterId)
  );
  campaign.liveEncounterTracker.creatures = [...sourceContext.creaturesByParticipantId.values()].map(
    (creature) => createCreatureParticipantRef(creature.creatureId)
  );
  campaign.markModified("liveEncounterTracker");
  await campaign.save();

  return toCampaignPatchEnvelope(campaign, {
    liveEncounterTracker: await toCampaignLiveEncounterTrackerDetailRecord(campaign)
  });
}

export async function updateCampaignLiveEncounterTracker(options: {
  campaignId: string;
  ownerId: Types.ObjectId;
  payload: unknown;
}) {
  const campaign = await findOwnedCampaignDocument(options);
  const payload = normalizeTrackerUpdatePayload(options.payload);
  const tracker = campaign.liveEncounterTracker;

  if (!tracker) {
    throw new AppError("There is no live encounter tracker.", 404, "LIVE_ENCOUNTER_NOT_FOUND");
  }

  const sourceContext = await loadLiveEncounterSourceContext({
    campaign,
    ownerId: options.ownerId
  });
  const reconciledLists = reconcileLiveEncounterLists(
    {
      activeParticipantId: payload.activeParticipantId,
      creatures: payload.creatures,
      initiativeOrder: payload.initiativeOrder,
      partyMembers: payload.partyMembers
    },
    sourceContext
  );

  campaign.liveEncounterTracker = {
    ...tracker,
    ...reconciledLists,
    roundNumber: payload.roundNumber,
    revision: tracker.revision + 1,
    updatedAt: new Date()
  };
  campaign.markModified("liveEncounterTracker");
  await campaign.save();

  return toCampaignPatchEnvelope(campaign, {
    liveEncounterTracker: await toCampaignLiveEncounterTrackerDetailRecord(campaign)
  });
}

export async function removeCampaignLiveEncounterTracker(options: {
  campaignId: string;
  ownerId: Types.ObjectId;
}) {
  const campaign = await findOwnedCampaignDocument(options);

  campaign.liveEncounterTracker = null;
  campaign.markModified("liveEncounterTracker");
  await campaign.save();

  return toCampaignPatchEnvelope(campaign, {
    liveEncounterTracker: null
  });
}
