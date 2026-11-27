import { describe, expect, it } from "vitest";
import {
  applyTurnAction,
  applyUndo,
  type LiveEncounterTurnState
} from "../src/services/liveEncounterTurnLogic";

const ref = (id: string, initiative: number | null = null) =>
  ({ participantId: id, kind: "creature", creatureId: id, initiative }) as const;
const order = [ref("a", 20), ref("b", 15), ref("c", 10)];
const state = (activeParticipantId: string | null, roundNumber = 1): LiveEncounterTurnState => ({
  activeParticipantId,
  initiativeOrder: [...order],
  roundNumber
});
const ids = (value: LiveEncounterTurnState) =>
  value.initiativeOrder.map((entry) => entry.participantId);

describe("live encounter turn logic", () => {
  it("starts at the top, advances, and bumps the round when the order wraps", () => {
    expect(applyTurnAction(state(null), "next").state).toMatchObject({
      activeParticipantId: "a",
      roundNumber: 1
    });
    expect(applyTurnAction(state("a"), "next").state.activeParticipantId).toBe("b");
    expect(applyTurnAction(state("c"), "next").state).toMatchObject({
      activeParticipantId: "a",
      roundNumber: 2
    });
  });

  it("skips the next participant and counts the wrap", () => {
    expect(applyTurnAction(state("a"), "skip").state.activeParticipantId).toBe("c");
    expect(applyTurnAction(state("b"), "skip").state).toMatchObject({
      activeParticipantId: "a",
      roundNumber: 2
    });
  });

  it("goes back a turn, drops a round across the start, and refuses to go before round 1", () => {
    expect(applyTurnAction(state("b"), "previous").state.activeParticipantId).toBe("a");
    expect(applyTurnAction(state("a", 3), "previous").state).toMatchObject({
      activeParticipantId: "c",
      roundNumber: 2
    });
    expect(() => applyTurnAction(state("a", 1), "previous")).toThrow(/first turn/);
  });

  it("delays the active participant behind a later one, takes that value, and can be undone", () => {
    const result = applyTurnAction(state("a"), "delay", { afterParticipantId: "b" });

    expect(ids(result.state)).toEqual(["b", "a", "c"]);
    expect(result.state.activeParticipantId).toBe("b");
    expect(result.state.initiativeOrder[1]?.initiative).toBe(15);
    expect(() => applyTurnAction(state("b"), "delay", { afterParticipantId: "a" })).toThrow(
      /later participant/
    );

    const restored = applyUndo(result.state, result.undo);

    expect(ids(restored)).toEqual(["a", "b", "c"]);
    expect(restored.activeParticipantId).toBe("a");
    expect(restored.initiativeOrder[0]?.initiative).toBe(20);
  });

  it("rejects turn actions on an empty order", () => {
    expect(() => applyTurnAction({ ...state(null), initiativeOrder: [] }, "next")).toThrow(
      /Add participants/
    );
  });
});
