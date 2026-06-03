import type {
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerParticipantRefRecord,
  CampaignLiveEncounterTrackerRecord,
  CampaignLiveEncounterTrackerUpdateInput
} from "../../api/campaigns";

export type LiveEncounterTrackerListKey = "partyMembers" | "creatures" | "initiativeOrder";

export function toLiveEncounterParticipantRef(
  participant: CampaignLiveEncounterTrackerParticipantRecord
): CampaignLiveEncounterTrackerParticipantRefRecord {
  if (participant.kind === "party-member") {
    return {
      participantId: participant.participantId,
      kind: "party-member",
      characterId: participant.characterId
    };
  }

  return {
    participantId: participant.participantId,
    kind: "creature",
    creatureId: participant.creatureId
  };
}

export function toLiveEncounterTrackerUpdateInput(
  tracker: CampaignLiveEncounterTrackerRecord
): CampaignLiveEncounterTrackerUpdateInput {
  return {
    activeParticipantId: tracker.activeParticipantId,
    partyMembers: tracker.partyMembers.map(toLiveEncounterParticipantRef),
    creatures: tracker.creatures.map(toLiveEncounterParticipantRef),
    initiativeOrder: tracker.initiativeOrder.map(toLiveEncounterParticipantRef),
    revision: tracker.revision
  };
}

export function withLiveEncounterTrackerRevision(
  tracker: CampaignLiveEncounterTrackerRecord,
  savedTracker: CampaignLiveEncounterTrackerRecord
): CampaignLiveEncounterTrackerRecord {
  return {
    ...tracker,
    revision: savedTracker.revision,
    updatedAt: savedTracker.updatedAt
  };
}
