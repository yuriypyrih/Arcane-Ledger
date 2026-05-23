import { ELDRITCH_INVOCATION, getEldritchInvocationEntryById } from "../../../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character
} from "../../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../../actionEconomy";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../../statusEntries";
import type { FeatureActionCard } from "../../types";
import { getInvocationDescriptionText } from "./descriptions";

export const gazeOfTwoMindsActionKey = "warlock-gaze-of-two-minds";
export const gazeOfTwoMindsActionName = "Gaze of the Two Minds";

const gazeOfTwoMindsStatusSourceId = "warlock-invocation-gaze-of-two-minds";

export function hasActiveWarlockGazeOfTwoMindsStatus(
  character: Partial<Pick<Character, "statusEntries">>
): boolean {
  return normalizeCharacterStatusEntries(character.statusEntries).some(
    (entry) => entry.sourceId === gazeOfTwoMindsStatusSourceId
  );
}

export function getWarlockGazeOfTwoMindsAction(
  character: Partial<Pick<Character, "statusEntries">>
): FeatureActionCard {
  const invocation = getEldritchInvocationEntryById(ELDRITCH_INVOCATION.GAZE_OF_TWO_MINDS);
  const description = invocation?.description ?? [
    "You can use a Bonus Action to touch a willing creature and perceive through its senses until the end of your next turn."
  ];
  const isActive = hasActiveWarlockGazeOfTwoMindsStatus(character);

  return {
    key: gazeOfTwoMindsActionKey,
    name: gazeOfTwoMindsActionName,
    summary: "Perceive through a willing creature's senses.",
    detail: "Create or refresh the Gaze of the Two Minds trait for 2 turns.",
    breakdown: isActive ? "Refresh duration" : "2 turns",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    isActive,
    description,
    drawer: {
      kind: "confirm",
      eyebrow: "Eldritch Invocation",
      description,
      confirmLabel: isActive ? "Reset Duration" : "Activate"
    }
  };
}

export function activateWarlockGazeOfTwoMindsStatus(character: Character): Character {
  const invocation = getEldritchInvocationEntryById(ELDRITCH_INVOCATION.GAZE_OF_TWO_MINDS);
  const description = invocation?.description ?? [
    "You can use a Bonus Action to touch a willing creature and perceive through its senses until the end of your next turn."
  ];

  return {
    ...character,
    statusEntries: [
      ...normalizeCharacterStatusEntries(character.statusEntries).filter(
        (entry) => entry.sourceId !== gazeOfTwoMindsStatusSourceId
      ),
      createCharacterStatusEntry({
        group: STATUS_ENTRY_GROUP.EFFECTS,
        value: gazeOfTwoMindsActionName,
        source: invocation?.name ?? "Gaze of Two Minds",
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.ROUNDS,
          amount: 2,
          tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
        },
        sourceId: gazeOfTwoMindsStatusSourceId,
        description: getInvocationDescriptionText(description)
      })
    ]
  };
}
