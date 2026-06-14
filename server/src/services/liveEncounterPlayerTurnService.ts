import { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";
import {
  Campaign,
  type CampaignLiveEncounterParticipantRefRecord
} from "../models/Campaign.js";
import { CharacterSheet } from "../models/CharacterSheet.js";
import {
  createReconciledCampaignLiveEncounterTrackerSnapshot,
  type ReconciledLiveEncounterLists,
  toMemberVisibleCampaignLiveEncounterTrackerDetailRecord
} from "./campaignLiveEncounterTrackerService.js";

type PartyMemberTurnAction = "start" | "end";

function normalizePartyMemberTurnAction(value: unknown): PartyMemberTurnAction {
  if (value === "start" || value === "end") {
    return value;
  }

  throw new AppError("Encounter turn action is invalid.", 400, "INVALID_LIVE_ENCOUNTER_INPUT");
}

function normalizePartyMemberTurnPayload(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError("Encounter turn payload is invalid.", 400, "INVALID_LIVE_ENCOUNTER_INPUT");
  }

  const body = value as Record<string, unknown>;

  if (typeof body.characterId !== "string" || !Types.ObjectId.isValid(body.characterId)) {
    throw new AppError("Character sheet id is invalid.", 400, "INVALID_CHARACTER_SHEET_ID");
  }

  return {
    action: normalizePartyMemberTurnAction(body.action),
    characterId: body.characterId
  };
}

function toStringId(value: unknown) {
  return typeof value === "string"
    ? value
    : value && typeof value === "object" && "toString" in value
      ? value.toString()
      : "";
}

function findCharacterInitiativeParticipantId(options: {
  characterId: string;
  initiativeOrder: CampaignLiveEncounterParticipantRefRecord[];
}) {
  const characterId = options.characterId.trim();
  const participant = options.initiativeOrder.find(
    (initiativeParticipant) =>
      initiativeParticipant.kind === "party-member" &&
      toStringId(initiativeParticipant.characterId) === characterId
  );

  return participant?.participantId ?? null;
}

function createCanonicalParticipantRefMap(reconciledLists: ReconciledLiveEncounterLists) {
  return new Map(
    [
      ...reconciledLists.partyMembers,
      ...reconciledLists.creatures,
      ...reconciledLists.initiativeOrder
    ].map((participant) => [participant.participantId, participant])
  );
}

function createTurnInitiativeOrder(options: {
  rawInitiativeOrder: CampaignLiveEncounterParticipantRefRecord[];
  reconciledLists: ReconciledLiveEncounterLists;
}) {
  const canonicalParticipantById = createCanonicalParticipantRefMap(options.reconciledLists);

  return options.rawInitiativeOrder
    .map((participant) => canonicalParticipantById.get(participant.participantId))
    .filter(
      (participant): participant is CampaignLiveEncounterParticipantRefRecord =>
        Boolean(participant)
    );
}

function createTurnParticipantLists(options: {
  initiativeOrder: CampaignLiveEncounterParticipantRefRecord[];
  reconciledLists: ReconciledLiveEncounterLists;
}) {
  const initiativeParticipantIds = new Set(
    options.initiativeOrder.map((participant) => participant.participantId)
  );

  return {
    partyMembers: options.reconciledLists.partyMembers.filter(
      (participant) => !initiativeParticipantIds.has(participant.participantId)
    ),
    creatures: options.reconciledLists.creatures.filter(
      (participant) => !initiativeParticipantIds.has(participant.participantId)
    ),
    initiativeOrder: options.initiativeOrder
  };
}

function getActiveParticipantIdFromInitiative(options: {
  initiativeOrder: CampaignLiveEncounterParticipantRefRecord[];
  activeParticipantId: string | null | undefined;
}) {
  if (
    options.activeParticipantId &&
    options.initiativeOrder.some(
      (participant) => participant.participantId === options.activeParticipantId
    )
  ) {
    return options.activeParticipantId;
  }

  return null;
}

function createPartyMemberTurnState(options: {
  action: PartyMemberTurnAction;
  characterId: string;
  initiativeOrder: CampaignLiveEncounterParticipantRefRecord[];
  activeParticipantId: string | null;
  roundNumber: number;
}) {
  const characterParticipantId = findCharacterInitiativeParticipantId({
    characterId: options.characterId,
    initiativeOrder: options.initiativeOrder
  });

  if (!characterParticipantId) {
    return null;
  }

  const participantIndex = options.initiativeOrder.findIndex(
    (participant) => participant.participantId === characterParticipantId
  );

  if (participantIndex < 0) {
    return null;
  }

  if (options.action === "start") {
    if (options.activeParticipantId === characterParticipantId) {
      return null;
    }

    return {
      activeParticipantId: characterParticipantId,
      roundNumber: options.roundNumber
    };
  }

  if (options.activeParticipantId !== characterParticipantId) {
    return null;
  }

  const isLastParticipant = participantIndex === options.initiativeOrder.length - 1;
  const nextParticipantIndex = isLastParticipant ? 0 : participantIndex + 1;
  const nextParticipant = options.initiativeOrder[nextParticipantIndex];

  if (!nextParticipant) {
    return null;
  }

  return {
    activeParticipantId: nextParticipant.participantId,
    roundNumber: isLastParticipant ? options.roundNumber + 1 : options.roundNumber
  };
}

function findLatestPartyLiveEncounterCampaign(partyGroupObjectId: Types.ObjectId) {
  return Campaign.findOne({
    "liveEncounterTracker.partyGroupId": partyGroupObjectId,
    "liveEncounterTracker.preparedEncounterId": { $exists: true }
  })
    .sort({
      "liveEncounterTracker.updatedAt": -1,
      updatedAt: -1,
      _id: -1
    })
    .exec();
}

export async function updateMemberVisibleCampaignLiveEncounterTrackerTurn(options: {
  ownerId: Types.ObjectId;
  partyGroupId: string;
  payload: unknown;
}) {
  if (!options.partyGroupId || !Types.ObjectId.isValid(options.partyGroupId)) {
    throw new AppError("Party group id is invalid.", 400, "INVALID_PARTY_GROUP_ID");
  }

  const payload = normalizePartyMemberTurnPayload(options.payload);
  const partyGroupObjectId = new Types.ObjectId(options.partyGroupId);
  const characterObjectId = new Types.ObjectId(payload.characterId);
  const ownedMember = await CharacterSheet.exists({
    _id: characterObjectId,
    ownerId: options.ownerId,
    deletedAt: null,
    partyGroupId: partyGroupObjectId
  }).exec();

  if (!ownedMember) {
    throw new AppError("Party member was not found.", 404, "PARTY_MEMBER_NOT_FOUND");
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const campaign = await findLatestPartyLiveEncounterCampaign(partyGroupObjectId);

    if (!campaign?.liveEncounterTracker) {
      return {
        partyGroupId: options.partyGroupId,
        liveEncounterTracker: null,
        turnUpdated: false
      };
    }

    let snapshot: Awaited<ReturnType<typeof createReconciledCampaignLiveEncounterTrackerSnapshot>>;

    try {
      snapshot = await createReconciledCampaignLiveEncounterTrackerSnapshot(campaign);
    } catch (error) {
      if (error instanceof AppError) {
        return {
          partyGroupId: options.partyGroupId,
          liveEncounterTracker: await toMemberVisibleCampaignLiveEncounterTrackerDetailRecord(campaign),
          turnUpdated: false
        };
      }

      throw error;
    }

    const turnInitiativeOrder = createTurnInitiativeOrder({
      rawInitiativeOrder: snapshot.tracker.initiativeOrder,
      reconciledLists: snapshot.reconciledLists
    });
    const activeParticipantId = getActiveParticipantIdFromInitiative({
      initiativeOrder: turnInitiativeOrder,
      activeParticipantId: snapshot.tracker.activeParticipantId
    });
    const nextTurnState = createPartyMemberTurnState({
      action: payload.action,
      characterId: payload.characterId,
      initiativeOrder: turnInitiativeOrder,
      activeParticipantId,
      roundNumber: snapshot.roundNumber
    });

    if (!nextTurnState) {
      return {
        partyGroupId: options.partyGroupId,
        liveEncounterTracker: await toMemberVisibleCampaignLiveEncounterTrackerDetailRecord(campaign),
        turnUpdated: false
      };
    }

    const now = new Date();
    const turnParticipantLists = createTurnParticipantLists({
      initiativeOrder: turnInitiativeOrder,
      reconciledLists: snapshot.reconciledLists
    });
    const updatedCampaign = await Campaign.findOneAndUpdate(
      {
        _id: campaign._id,
        "liveEncounterTracker.partyGroupId": partyGroupObjectId,
        "liveEncounterTracker.revision": snapshot.tracker.revision
      },
      {
        $set: {
          "liveEncounterTracker.activeParticipantId": nextTurnState.activeParticipantId,
          "liveEncounterTracker.roundNumber": nextTurnState.roundNumber,
          "liveEncounterTracker.partyMembers": turnParticipantLists.partyMembers,
          "liveEncounterTracker.creatures": turnParticipantLists.creatures,
          "liveEncounterTracker.initiativeOrder": turnParticipantLists.initiativeOrder,
          "liveEncounterTracker.revision": snapshot.tracker.revision + 1,
          "liveEncounterTracker.updatedAt": now
        }
      },
      {
        new: true,
        returnDocument: "after",
        runValidators: true
      }
    ).exec();

    if (!updatedCampaign?.liveEncounterTracker) {
      continue;
    }

    return {
      partyGroupId: options.partyGroupId,
      liveEncounterTracker:
        await toMemberVisibleCampaignLiveEncounterTrackerDetailRecord(updatedCampaign),
      turnUpdated: true
    };
  }

  const latestCampaign = await findLatestPartyLiveEncounterCampaign(partyGroupObjectId);

  return {
    partyGroupId: options.partyGroupId,
    liveEncounterTracker: latestCampaign
      ? await toMemberVisibleCampaignLiveEncounterTrackerDetailRecord(latestCampaign)
      : null,
    turnUpdated: false
  };
}
