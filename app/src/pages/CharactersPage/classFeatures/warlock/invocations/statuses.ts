import {
  ELDRITCH_INVOCATION,
  getEldritchInvocationEntryById,
  type SpellDescriptionEntry
} from "../../../../../codex/entries";
import {
  SENSE,
  STATUS_DURATION_KIND,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import type { DerivedFeatureStatusEntry } from "../../types";
import { getInvocationDescriptionText } from "./descriptions";

export const devilsSightStatusSourceId = "warlock-invocation-devils-sight";
export const witchSightStatusSourceId = "warlock-invocation-witch-sight";

type WarlockInvocationSenseStatusDefinition = {
  invocationId: ELDRITCH_INVOCATION;
  fallbackSourceName: string;
  fallbackDescription: SpellDescriptionEntry[];
  sourceId: string;
  sense: SENSE;
  rangeFeet: number;
};

const warlockInvocationSenseStatusDefinitions: WarlockInvocationSenseStatusDefinition[] = [
  {
    invocationId: ELDRITCH_INVOCATION.DEVILS_SIGHT,
    fallbackSourceName: "Devil's Sight",
    fallbackDescription: [
      "You can see normally in Dim Light and Darkness, both magical and nonmagical, within 120 feet of yourself."
    ],
    sourceId: devilsSightStatusSourceId,
    sense: SENSE.DEVILS_SIGHT,
    rangeFeet: 120
  },
  {
    invocationId: ELDRITCH_INVOCATION.WITCH_SIGHT,
    fallbackSourceName: "Witch Sight",
    fallbackDescription: ["You have Truesight with a range of 30 feet."],
    sourceId: witchSightStatusSourceId,
    sense: SENSE.TRUESIGHT,
    rangeFeet: 30
  }
];

export function getWarlockInvocationDerivedStatusEntries(
  selectedInvocationIds: ReadonlySet<ELDRITCH_INVOCATION>
): DerivedFeatureStatusEntry[] {
  return warlockInvocationSenseStatusDefinitions.flatMap((definition) => {
    if (!selectedInvocationIds.has(definition.invocationId)) {
      return [];
    }

    const invocation = getEldritchInvocationEntryById(definition.invocationId);
    const description = invocation?.description ?? definition.fallbackDescription;

    return [
      {
        id: definition.sourceId,
        group: STATUS_ENTRY_GROUP.SENSES,
        value: definition.sense,
        source: invocation?.name ?? definition.fallbackSourceName,
        sourceType: STATUS_ENTRY_SOURCE_TYPE.FEATURE,
        duration: {
          kind: STATUS_DURATION_KIND.INFINITE
        },
        sourceId: definition.sourceId,
        rangeFeet: definition.rangeFeet,
        description: getInvocationDescriptionText(description)
      }
    ];
  });
}
