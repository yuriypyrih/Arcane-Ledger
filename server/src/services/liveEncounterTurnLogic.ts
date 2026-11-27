import { AppError } from "../errors/AppError.js";
import type { CampaignLiveEncounterParticipantRefRecord } from "../models/Campaign.js";

export const LIVE_ENCOUNTER_TURN_ACTIONS = ["next", "previous", "skip", "delay"] as const;
export type LiveEncounterTurnAction = (typeof LIVE_ENCOUNTER_TURN_ACTIONS)[number];

export type LiveEncounterTurnState = {
  activeParticipantId: string | null;
  initiativeOrder: CampaignLiveEncounterParticipantRefRecord[];
  roundNumber: number;
};

/** What `undo` needs to put the encounter back exactly as it was before a turn action. */
export type LiveEncounterTurnUndo = {
  activeParticipantId: string | null;
  delayed?: { groupId?: string | null; initiative: number | null; participantId: string };
  orderIds?: string[];
  roundNumber: number;
};

export type LiveEncounterTurnResult = {
  state: LiveEncounterTurnState;
  undo: LiveEncounterTurnUndo;
};

function invalidTurn(message: string, code = "LIVE_ENCOUNTER_INVALID_TURN") {
  return new AppError(message, 409, code);
}

/** First and last index of the turn slot containing `index`: consecutive creatures sharing a group id act together. */
function getSlotBounds(order: CampaignLiveEncounterParticipantRefRecord[], index: number) {
  const groupId = order[index]?.groupId ?? null;
  let start = index;
  let end = index;

  if (groupId) {
    while (start > 0 && order[start - 1]?.groupId === groupId) {
      start -= 1;
    }

    while (end < order.length - 1 && order[end + 1]?.groupId === groupId) {
      end += 1;
    }
  }

  return { end, start };
}

function countSlots(order: CampaignLiveEncounterParticipantRefRecord[]) {
  let slots = 0;

  for (let index = 0; index < order.length; index = getSlotBounds(order, index).end + 1) {
    slots += 1;
  }

  return slots;
}

/** Moves to the next turn slot (a whole pack counts as one), wrapping into a new round. */
export function stepForward(state: LiveEncounterTurnState): LiveEncounterTurnState {
  const { initiativeOrder, activeParticipantId, roundNumber } = state;
  const activeIndex = initiativeOrder.findIndex((ref) => ref.participantId === activeParticipantId);

  if (activeIndex < 0) {
    return { ...state, activeParticipantId: initiativeOrder[0]?.participantId ?? null };
  }

  const { end } = getSlotBounds(initiativeOrder, activeIndex);
  const isLast = end === initiativeOrder.length - 1;

  return {
    ...state,
    activeParticipantId: initiativeOrder[isLast ? 0 : end + 1]?.participantId ?? null,
    roundNumber: isLast ? roundNumber + 1 : roundNumber
  };
}

function createUndo(state: LiveEncounterTurnState): LiveEncounterTurnUndo {
  return { activeParticipantId: state.activeParticipantId, roundNumber: state.roundNumber };
}

/** Pure turn transition. Throws a 409 `AppError` when the action does not apply to the current state. */
export function applyTurnAction(
  state: LiveEncounterTurnState,
  action: LiveEncounterTurnAction,
  options: { afterParticipantId?: string } = {}
): LiveEncounterTurnResult {
  const { initiativeOrder } = state;

  if (initiativeOrder.length === 0) {
    throw invalidTurn("Add participants to the initiative order first.");
  }

  const activeIndex = initiativeOrder.findIndex(
    (ref) => ref.participantId === state.activeParticipantId
  );

  if (action === "next") {
    return { state: stepForward(state), undo: createUndo(state) };
  }

  if (action === "skip") {
    // Skips the next participant's turn: advance past them. With nobody active it just starts combat.
    const once = stepForward(state);

    return {
      state: activeIndex >= 0 && countSlots(initiativeOrder) > 1 ? stepForward(once) : once,
      undo: createUndo(state)
    };
  }

  if (activeIndex < 0) {
    throw invalidTurn("Start the turn order before using this action.");
  }

  if (action === "previous") {
    const { start } = getSlotBounds(initiativeOrder, activeIndex);

    if (start === 0 && state.roundNumber <= 1) {
      throw invalidTurn("This is already the first turn of the first round.");
    }

    const previousIndex = start === 0 ? initiativeOrder.length - 1 : start - 1;

    return {
      state: {
        ...state,
        activeParticipantId:
          initiativeOrder[getSlotBounds(initiativeOrder, previousIndex).start]?.participantId ??
          null,
        roundNumber: start === 0 ? state.roundNumber - 1 : state.roundNumber
      },
      undo: createUndo(state)
    };
  }

  // delay: the active slot (one participant or a whole pack) waits and re-enters behind a later slot,
  // taking that slot's value.
  const activeSlot = getSlotBounds(initiativeOrder, activeIndex);
  const afterIndex = initiativeOrder.findIndex(
    (ref) => ref.participantId === options.afterParticipantId
  );

  if (afterIndex <= activeSlot.end) {
    throw invalidTurn(
      "Choose a later participant to delay behind.",
      "LIVE_ENCOUNTER_INVALID_DELAY"
    );
  }

  const delayedMembers = initiativeOrder.slice(activeSlot.start, activeSlot.end + 1);
  const after = initiativeOrder[afterIndex]!;
  const afterSlotEnd = getSlotBounds(initiativeOrder, afterIndex).end;
  const nextActive = initiativeOrder[activeSlot.end + 1]!;
  const delayedIds = new Set(delayedMembers.map((ref) => ref.participantId));
  const reordered = initiativeOrder.filter((ref) => !delayedIds.has(ref.participantId));
  const insertAt =
    reordered.findIndex(
      (ref) => ref.participantId === initiativeOrder[afterSlotEnd]!.participantId
    ) + 1;

  reordered.splice(
    insertAt,
    0,
    ...delayedMembers.map((ref) => ({ ...ref, initiative: after.initiative ?? null }))
  );

  const first = delayedMembers[0]!;

  return {
    state: { ...state, activeParticipantId: nextActive.participantId, initiativeOrder: reordered },
    undo: {
      ...createUndo(state),
      delayed: {
        groupId: first.groupId ?? null,
        initiative: first.initiative ?? null,
        participantId: first.participantId
      },
      orderIds: initiativeOrder.map((ref) => ref.participantId)
    }
  };
}

/** Restores the state captured by a turn action's undo record. */
export function applyUndo(
  state: LiveEncounterTurnState,
  undo: LiveEncounterTurnUndo
): LiveEncounterTurnState {
  const byId = new Map(state.initiativeOrder.map((ref) => [ref.participantId, ref]));
  let initiativeOrder = state.initiativeOrder;

  if (undo.orderIds) {
    initiativeOrder = undo.orderIds
      .map((id) => byId.get(id))
      .filter((ref): ref is CampaignLiveEncounterParticipantRefRecord => Boolean(ref));
  }

  if (undo.delayed) {
    const { groupId, initiative, participantId } = undo.delayed;

    initiativeOrder = initiativeOrder.map((ref) =>
      ref.participantId === participantId || (groupId && ref.groupId === groupId)
        ? { ...ref, initiative }
        : ref
    );
  }

  return {
    activeParticipantId: undo.activeParticipantId,
    initiativeOrder,
    roundNumber: undo.roundNumber
  };
}
