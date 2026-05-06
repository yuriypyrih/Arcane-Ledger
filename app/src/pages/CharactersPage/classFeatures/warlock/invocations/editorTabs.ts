import { ELDRITCH_INVOCATION } from "../../../../../codex/entries";

export type WarlockEldritchInvocationEditorTabKey = "general" | "pacts";

type WarlockEldritchInvocationEditorGroupDefinition = {
  key: string;
  label: string | null;
  invocationIds: readonly ELDRITCH_INVOCATION[];
};

type WarlockEldritchInvocationEditorTabDefinition = {
  key: WarlockEldritchInvocationEditorTabKey;
  label: string;
  groups: readonly WarlockEldritchInvocationEditorGroupDefinition[];
};

export const warlockEldritchInvocationEditorTabs = [
  {
    key: "general",
    label: "General",
    groups: [
      {
        key: "general",
        label: null,
        invocationIds: [
          ELDRITCH_INVOCATION.ARMOR_OF_SHADOWS,
          ELDRITCH_INVOCATION.ELDRITCH_MIND,
          ELDRITCH_INVOCATION.AGONIZING_BLAST,
          ELDRITCH_INVOCATION.DEVILS_SIGHT,
          ELDRITCH_INVOCATION.ELDRITCH_SPEAR,
          ELDRITCH_INVOCATION.FIENDISH_VIGOR,
          ELDRITCH_INVOCATION.LESSONS_OF_THE_FIRST_ONES,
          ELDRITCH_INVOCATION.MASK_OF_MANY_FACES,
          ELDRITCH_INVOCATION.MISTY_VISIONS,
          ELDRITCH_INVOCATION.OTHERWORLDLY_LEAP,
          ELDRITCH_INVOCATION.REPELLING_BLAST,
          ELDRITCH_INVOCATION.ASCENDANT_STEP,
          ELDRITCH_INVOCATION.GAZE_OF_TWO_MINDS,
          ELDRITCH_INVOCATION.GIFT_OF_THE_DEPTHS,
          ELDRITCH_INVOCATION.MASTER_OF_MYRIAD_FORMS,
          ELDRITCH_INVOCATION.ONE_WITH_SHADOWS,
          ELDRITCH_INVOCATION.WHISPERS_OF_THE_GRAVE,
          ELDRITCH_INVOCATION.VISIONS_OF_DISTANT_REALMS,
          ELDRITCH_INVOCATION.WITCH_SIGHT
        ]
      }
    ]
  },
  {
    key: "pacts",
    label: "Pacts",
    groups: [
      {
        key: "pact-blade",
        label: "Pact of the Blade",
        invocationIds: [
          ELDRITCH_INVOCATION.PACT_OF_THE_BLADE,
          ELDRITCH_INVOCATION.ELDRITCH_SMITE,
          ELDRITCH_INVOCATION.THIRSTING_BLADE,
          ELDRITCH_INVOCATION.LIFEDRINKER,
          ELDRITCH_INVOCATION.DEVOURING_BLADE
        ]
      },
      {
        key: "pact-chain",
        label: "Pact of the Chain",
        invocationIds: [
          ELDRITCH_INVOCATION.PACT_OF_THE_CHAIN,
          ELDRITCH_INVOCATION.INVESTMENT_OF_THE_CHAIN_MASTER
        ]
      },
      {
        key: "pact-tome",
        label: "Pact of the Tome",
        invocationIds: [
          ELDRITCH_INVOCATION.PACT_OF_THE_TOME,
          ELDRITCH_INVOCATION.GIFT_OF_THE_PROTECTORS
        ]
      }
    ]
  }
] as const satisfies readonly WarlockEldritchInvocationEditorTabDefinition[];

export const orderedWarlockEldritchInvocationIds = warlockEldritchInvocationEditorTabs.flatMap(
  (tab) => tab.groups.flatMap((group) => group.invocationIds)
);
