import { Types } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { Campaign, type CampaignLiveEncounterParticipantRefRecord } from "../models/Campaign.js";
import { CharacterSheet } from "../models/CharacterSheet.js";
import { publishCampaignEvent } from "./campaignEventBus.js";
import {
  createReconciledCampaignLiveEncounterTrackerSnapshot,
  toMemberVisibleCampaignLiveEncounterTrackerDetailRecord
} from "./campaignLiveEncounterTrackerService.js";

const INITIATIVE_MIN = -100;
const INITIATIVE_MAX = 100;

function normalizePayload(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError("Initiative payload is invalid.", 400, "INVALID_LIVE_ENCOUNTER_INPUT");
  }

  const body = value as Record<string, unknown>;

  if (typeof body.characterId !== "string" || !Types.ObjectId.isValid(body.characterId)) {
    throw new AppError("Character sheet id is invalid.", 400, "INVALID_CHARACTER_SHEET_ID");
  }

  if (
    typeof body.initiative !== "number" ||
    !Number.isInteger(body.initiative) ||
    body.initiative < INITIATIVE_MIN ||
    body.initiative > INITIATIVE_MAX
  ) {
    throw new AppError(
      "Initiative must be a whole number from -100 to 100.",
      400,
      "INVALID_LIVE_ENCOUNTER_INPUT",
      { field: "initiative" }
    );
  }

  return { characterId: body.characterId, initiative: body.initiative };
}

/** Highest value first; ties keep their order; participants without a value stay last. */
function sortByInitiative(order: CampaignLiveEncounterParticipantRefRecord[]) {
  return order
    .map((ref, index) => ({ index, ref }))
    .sort((left, right) => {
      const leftValue = left.ref.initiative ?? null;
      const rightValue = right.ref.initiative ?? null;

      if (leftValue === rightValue) {
        return left.index - right.index;
      }

      if (leftValue === null) {
        return 1;
      }

      return rightValue === null ? -1 : rightValue - leftValue;
    })
    .map(({ ref }) => ref);
}

/**
 * A player submits their own character's initiative. The first value applies immediately: the
 * character joins the initiative order and the order is re-sorted. Once a value is set, a new one is
 * only stored as a pending request that the GM approves or denies, so players cannot quietly re-roll.
 */
export async function submitMemberLiveEncounterInitiative(options: {
  ownerId: Types.ObjectId;
  partyGroupId: string;
  payload: unknown;
}) {
  if (!Types.ObjectId.isValid(options.partyGroupId)) {
    throw new AppError("Party group id is invalid.", 400, "INVALID_PARTY_GROUP_ID");
  }

  const payload = normalizePayload(options.payload);
  const partyGroupObjectId = new Types.ObjectId(options.partyGroupId);
  const ownedMember = await CharacterSheet.exists({
    _id: new Types.ObjectId(payload.characterId),
    ownerId: options.ownerId,
    deletedAt: null,
    partyGroupId: partyGroupObjectId
  }).exec();

  if (!ownedMember) {
    throw new AppError("Party member was not found.", 404, "PARTY_MEMBER_NOT_FOUND");
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const campaign = await Campaign.findOne({
      "liveEncounterTracker.partyGroupId": partyGroupObjectId,
      "liveEncounterTracker.preparedEncounterId": { $exists: true }
    })
      .sort({ "liveEncounterTracker.updatedAt": -1, updatedAt: -1, _id: -1 })
      .exec();

    if (!campaign?.liveEncounterTracker) {
      throw new AppError("There is no active encounter.", 409, "LIVE_ENCOUNTER_NOT_FOUND");
    }

    const snapshot = await createReconciledCampaignLiveEncounterTrackerSnapshot(campaign);
    const { creatures, initiativeOrder, partyMembers } = snapshot.reconciledLists;
    const member = [...partyMembers, ...initiativeOrder].find(
      (ref) => ref.kind === "party-member" && String(ref.characterId) === payload.characterId
    );

    if (!member) {
      throw new AppError("Party member was not found.", 404, "PARTY_MEMBER_NOT_FOUND");
    }

    const alreadyRolled = member.initiative !== null && member.initiative !== undefined;

    if (alreadyRolled) {
      // A second roll is only a request: the GM decides whether it replaces the first.
      const withRequest = (ref: CampaignLiveEncounterParticipantRefRecord) =>
        ref.participantId === member.participantId
          ? { ...ref, pendingInitiative: payload.initiative }
          : ref;
      const requested = await Campaign.findOneAndUpdate(
        { _id: campaign._id, "liveEncounterTracker.revision": snapshot.tracker.revision },
        {
          $set: {
            "liveEncounterTracker.partyMembers": partyMembers.map(withRequest),
            "liveEncounterTracker.creatures": creatures,
            "liveEncounterTracker.initiativeOrder": initiativeOrder.map(withRequest),
            "liveEncounterTracker.revision": snapshot.tracker.revision + 1,
            "liveEncounterTracker.updatedAt": new Date()
          }
        },
        { new: true, runValidators: true }
      ).exec();

      if (!requested?.liveEncounterTracker) {
        continue;
      }

      publishCampaignEvent({
        type: "live-encounter.updated",
        campaignId: requested.id as string,
        revision: requested.liveEncounterTracker.revision
      });

      return {
        partyGroupId: options.partyGroupId,
        liveEncounterTracker:
          await toMemberVisibleCampaignLiveEncounterTrackerDetailRecord(requested),
        initiativeUpdated: false,
        requested: true
      };
    }

    const withValue = { ...member, initiative: payload.initiative, pendingInitiative: null };
    const nextInitiativeOrder = sortByInitiative([
      ...initiativeOrder.filter((ref) => ref.participantId !== member.participantId),
      withValue
    ]);
    const updatedCampaign = await Campaign.findOneAndUpdate(
      {
        _id: campaign._id,
        "liveEncounterTracker.revision": snapshot.tracker.revision
      },
      {
        $set: {
          "liveEncounterTracker.partyMembers": partyMembers.filter(
            (ref) => ref.participantId !== member.participantId
          ),
          "liveEncounterTracker.creatures": creatures,
          "liveEncounterTracker.initiativeOrder": nextInitiativeOrder,
          "liveEncounterTracker.revision": snapshot.tracker.revision + 1,
          "liveEncounterTracker.updatedAt": new Date()
        }
      },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedCampaign?.liveEncounterTracker) {
      continue;
    }

    publishCampaignEvent({
      type: "live-encounter.updated",
      campaignId: updatedCampaign.id as string,
      revision: updatedCampaign.liveEncounterTracker.revision
    });

    return {
      partyGroupId: options.partyGroupId,
      liveEncounterTracker:
        await toMemberVisibleCampaignLiveEncounterTrackerDetailRecord(updatedCampaign),
      initiativeUpdated: true,
      requested: false
    };
  }

  throw new AppError(
    "The encounter changed while saving. Try again.",
    409,
    "LIVE_ENCOUNTER_REVISION_CONFLICT"
  );
}
