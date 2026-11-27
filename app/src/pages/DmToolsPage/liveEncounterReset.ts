import type {
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerRecord
} from "../../api/campaigns";
import type {
  EncounterCreatureWriteRecord,
  EncounterTemplateCreatureRecord
} from "../../api/encounterTemplates";

function withoutInitiative<T extends CampaignLiveEncounterTrackerParticipantRecord>(
  participant: T
): T {
  return { ...participant, initiative: null, pendingInitiative: null, groupId: null };
}

/**
 * Sends everyone back to the waiting lists with no initiative, no packs and no active turn, and
 * restarts the round count. Hit points, conditions and the prepared encounter stay untouched.
 */
export function resetTrackerOrder(
  tracker: CampaignLiveEncounterTrackerRecord
): CampaignLiveEncounterTrackerRecord {
  const inOrder = tracker.initiativeOrder;

  return {
    ...tracker,
    activeParticipantId: null,
    roundNumber: 1,
    initiativeOrder: [],
    partyMembers: [
      ...tracker.partyMembers,
      ...inOrder.filter(
        (participant): participant is CampaignLiveEncounterTrackerRecord["partyMembers"][number] =>
          participant.kind !== "creature"
      )
    ].map(withoutInitiative),
    creatures: [
      ...tracker.creatures,
      ...inOrder.filter(
        (participant): participant is CampaignLiveEncounterTrackerRecord["creatures"][number] =>
          participant.kind === "creature"
      )
    ].map(withoutInitiative)
  };
}

/** Ids of the encounter's creatures that are hurt, have temporary hit points or death saves. */
export function getCreaturesNeedingRestore(tracker: CampaignLiveEncounterTrackerRecord) {
  return [...tracker.creatures, ...tracker.initiativeOrder]
    .flatMap((participant) => (participant.kind === "creature" ? [participant] : []))
    .filter(({ creature }) => {
      const max = creature.maxHitPoints ?? 0;

      return (
        (creature.currentHitPoints ?? max) !== max ||
        (creature.temporaryHitPoints ?? 0) > 0 ||
        Boolean(creature.deathSaves)
      );
    })
    .map((participant) => participant.creatureId);
}

/** A creature back at full hit points with no temporary hit points or death saves. */
export function restoreCreatureToFullHealth(
  creature: EncounterTemplateCreatureRecord
): EncounterCreatureWriteRecord {
  const {
    deathSaves: _deathSaves,
    temporaryHitPointsSource: _temporaryHitPointsSource,
    ...rest
  } = creature;

  return { ...rest, currentHitPoints: creature.maxHitPoints, temporaryHitPoints: 0 };
}
