import type {
  CampaignLiveEncounterTrackerCreatureRecord,
  CampaignLiveEncounterTrackerParticipantRecord,
  CampaignLiveEncounterTrackerRecord
} from "../../api/campaigns";
import { rollD20 } from "../../utils/dice";
import { getMonsterInitiativeBonus } from "../../utils/monsters/normalizeMonsterRecord";

export const INITIATIVE_MIN = -100;
export const INITIATIVE_MAX = 100;

/** Highest value first; ties keep their current relative order; unrolled participants stay last. */
export function sortInitiativeOrder<T extends CampaignLiveEncounterTrackerParticipantRecord>(
  order: T[]
): T[] {
  return order
    .map((participant, index) => ({ index, participant }))
    .sort((left, right) => {
      const leftValue = left.participant.initiative ?? null;
      const rightValue = right.participant.initiative ?? null;

      if (leftValue === rightValue) {
        return left.index - right.index;
      }

      if (leftValue === null) {
        return 1;
      }

      if (rightValue === null) {
        return -1;
      }

      return rightValue - leftValue;
    })
    .map(({ participant }) => participant);
}

export function clampInitiative(value: number) {
  return Math.min(INITIATIVE_MAX, Math.max(INITIATIVE_MIN, Math.trunc(value)));
}

function withInitiative<T extends CampaignLiveEncounterTrackerParticipantRecord>(
  participant: T,
  initiative: number | null
): T {
  return { ...participant, initiative };
}

/** Sets one participant's initiative wherever it lives, and re-sorts the order if it is in it. */
export function setParticipantInitiative(
  tracker: CampaignLiveEncounterTrackerRecord,
  participantId: string,
  initiative: number | null
): CampaignLiveEncounterTrackerRecord {
  const update = <T extends CampaignLiveEncounterTrackerParticipantRecord>(list: T[]) =>
    list.map((participant) =>
      participant.participantId === participantId
        ? withInitiative(participant, initiative)
        : participant
    );
  const isInOrder = tracker.initiativeOrder.some((entry) => entry.participantId === participantId);
  const initiativeOrder = update(tracker.initiativeOrder);

  return {
    ...tracker,
    partyMembers: update(tracker.partyMembers),
    creatures: update(tracker.creatures),
    initiativeOrder: isInOrder ? sortInitiativeOrder(initiativeOrder) : initiativeOrder
  };
}

export function rollCreatureInitiative(creature: CampaignLiveEncounterTrackerCreatureRecord) {
  const bonus = creature.creature.inheritedCreatureEntry
    ? (getMonsterInitiativeBonus(creature.creature.inheritedCreatureEntry as never) ?? 0)
    : 0;

  return clampInitiative(rollD20("normal").total + bonus);
}

/**
 * Rolls d20 + initiative bonus for every creature without a value (or all of them), moves them into
 * the initiative order and sorts it. Party members are never rolled for; players submit their own.
 */
export function rollCreatureInitiatives(
  tracker: CampaignLiveEncounterTrackerRecord,
  options: { rerollAll?: boolean } = {}
): CampaignLiveEncounterTrackerRecord {
  const creatures = [
    ...tracker.creatures,
    ...tracker.initiativeOrder.filter((p) => p.kind === "creature")
  ];
  const rolledValueById = new Map<string, number>();

  creatures.forEach((participant) => {
    if (participant.kind !== "creature") {
      return;
    }

    if (
      options.rerollAll ||
      participant.initiative === null ||
      participant.initiative === undefined
    ) {
      rolledValueById.set(participant.participantId, rollCreatureInitiative(participant));
    }
  });

  const rolled = <T extends CampaignLiveEncounterTrackerParticipantRecord>(participant: T): T =>
    rolledValueById.has(participant.participantId)
      ? withInitiative(participant, rolledValueById.get(participant.participantId) ?? null)
      : participant;
  const initiativeOrder = sortInitiativeOrder([
    ...tracker.initiativeOrder.map(rolled),
    ...tracker.creatures.map(rolled)
  ]);

  return {
    ...tracker,
    activeParticipantId: tracker.activeParticipantId ?? initiativeOrder[0]?.participantId ?? null,
    creatures: [],
    initiativeOrder
  };
}

/** Clears group ids that no longer mean anything: a pack needs at least two neighbouring creatures. */
export function normalizeInitiativeGroups<T extends CampaignLiveEncounterTrackerParticipantRecord>(
  order: T[]
): T[] {
  return order.map((participant, index) => {
    const groupId = participant.groupId ?? null;

    if (!groupId) {
      return participant;
    }

    const hasNeighbour =
      order[index - 1]?.groupId === groupId || order[index + 1]?.groupId === groupId;

    return hasNeighbour && participant.kind === "creature"
      ? participant
      : { ...participant, groupId: null };
  });
}

export type InitiativeSlotInfo = {
  groupPosition: "single" | "first" | "middle" | "last";
  isActive: boolean;
  slotNumber: number;
};

/** Per participant: its turn slot number (a pack shares one), its place in the pack, and whether its slot is up. */
export function getInitiativeSlotInfo(
  order: CampaignLiveEncounterTrackerParticipantRecord[],
  activeParticipantId: string | null
): Map<string, InitiativeSlotInfo> {
  const activeGroupId = order.find(
    (participant) => participant.participantId === activeParticipantId
  )?.groupId;
  const info = new Map<string, InitiativeSlotInfo>();
  let slotNumber = 0;

  order.forEach((participant, index) => {
    const groupId = participant.groupId ?? null;
    const startsSlot = !groupId || order[index - 1]?.groupId !== groupId;
    const endsSlot = !groupId || order[index + 1]?.groupId !== groupId;

    if (startsSlot) {
      slotNumber += 1;
    }

    info.set(participant.participantId, {
      groupPosition: !groupId ? "single" : startsSlot ? "first" : endsSlot ? "last" : "middle",
      isActive:
        participant.participantId === activeParticipantId ||
        (Boolean(activeGroupId) && groupId === activeGroupId),
      slotNumber
    });
  });

  return info;
}

function createGroupId() {
  return `pack-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Whether a creature in the order can join the pack of the participant directly above it. */
export function canGroupWithPrevious(
  tracker: CampaignLiveEncounterTrackerRecord,
  participantId: string
) {
  const index = tracker.initiativeOrder.findIndex((entry) => entry.participantId === participantId);
  const current = tracker.initiativeOrder[index];
  const previous = tracker.initiativeOrder[index - 1];

  return (
    index > 0 &&
    current?.kind === "creature" &&
    previous?.kind === "creature" &&
    !(current.groupId && current.groupId === previous.groupId)
  );
}

/** Packs a creature with the creature above it; both take that creature's turn and initiative value. */
export function groupWithPrevious(
  tracker: CampaignLiveEncounterTrackerRecord,
  participantId: string
): CampaignLiveEncounterTrackerRecord {
  if (!canGroupWithPrevious(tracker, participantId)) {
    return tracker;
  }

  const index = tracker.initiativeOrder.findIndex((entry) => entry.participantId === participantId);
  const previous = tracker.initiativeOrder[index - 1]!;
  const groupId = previous.groupId ?? createGroupId();
  const initiative = previous.initiative ?? null;
  const initiativeOrder = tracker.initiativeOrder.map((participant, position) =>
    position === index - 1 || position === index
      ? { ...participant, groupId, initiative }
      : participant
  );

  return { ...tracker, initiativeOrder: normalizeInitiativeGroups(initiativeOrder) };
}

/** Takes a creature out of its pack. A pack left with one creature dissolves. */
export function leaveGroup(
  tracker: CampaignLiveEncounterTrackerRecord,
  participantId: string
): CampaignLiveEncounterTrackerRecord {
  return {
    ...tracker,
    initiativeOrder: normalizeInitiativeGroups(
      tracker.initiativeOrder.map((participant) =>
        participant.participantId === participantId
          ? { ...participant, groupId: null }
          : participant
      )
    )
  };
}
