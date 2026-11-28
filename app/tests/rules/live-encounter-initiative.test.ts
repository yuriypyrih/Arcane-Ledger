import { describe, expect, it } from "vitest";
import type { CampaignLiveEncounterTrackerParticipantRecord } from "../../src/api/campaigns";
import { sortInitiativeOrder } from "../../src/pages/DmToolsPage/liveEncounterInitiative";

const participant = (participantId: string, initiative: number | null) =>
  ({
    participantId,
    kind: "creature",
    initiative
  }) as unknown as CampaignLiveEncounterTrackerParticipantRecord;

describe("sortInitiativeOrder", () => {
  it("orders by value descending, keeps ties in place, and leaves unrolled participants last", () => {
    const sorted = sortInitiativeOrder([
      participant("none", null),
      participant("low", 8),
      participant("tie-first", 15),
      participant("high", 19),
      participant("tie-second", 15)
    ]);

    expect(sorted.map((entry) => entry.participantId)).toEqual([
      "high",
      "tie-first",
      "tie-second",
      "low",
      "none"
    ]);
  });
});
