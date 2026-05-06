import {
  ELDRITCH_INVOCATION,
  getEldritchInvocationEntryById,
  type SpellDescriptionEntry
} from "../../../../codex/entries";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import {
  falseLifeSpellId,
  mageArmorSpellId
} from "../../characterRuntime/spellImplementations";
import type {
  FeatureActionCard,
  FeatureActionSpellEffectKind
} from "../types";

export const ascendantStepActionKey = "warlock-ascendant-step";
export const armorOfShadowsActionKey = "warlock-armor-of-shadows";
export const fiendishVigorActionKey = "warlock-fiendish-vigor";
export const giftOfTheDepthsActionKey = "warlock-gift-of-the-depths";
export const maskOfManyFacesActionKey = "warlock-mask-of-many-faces";
export const masterOfMyriadFormsActionKey = "warlock-master-of-myriad-forms";
export const mistyVisionsActionKey = "warlock-misty-visions";
export const oneWithShadowsActionKey = "warlock-one-with-shadows";
export const otherworldlyLeapActionKey = "warlock-otherworldly-leap";
export const pactOfTheChainActionKey = "warlock-pact-of-the-chain";
export const visionsOfDistantRealmsActionKey = "warlock-visions-of-distant-realms";
export const whispersOfTheGraveActionKey = "warlock-whispers-of-the-grave";

const alterSelfSpellId = "spell-alter-self";
const arcaneEyeSpellId = "spell-arcane-eye";
const disguiseSelfSpellId = "spell-disguise-self";
export const findFamiliarSpellId = "spell-find-familiar";
const invisibilitySpellId = "spell-invisibility";
const jumpSpellId = "spell-jump";
const levitateSpellId = "spell-levitate";
const silentImageSpellId = "spell-silent-image";
const speakWithDeadSpellId = "spell-speak-with-dead";
const waterBreathingSpellId = "spell-water-breathing";

export type WarlockInvocationSpellActionUsageState = {
  usesRemaining: number;
  usesTotal: number;
  disabledReason?: string;
};

type WarlockInvocationSpellActionDefinition = {
  invocationId: ELDRITCH_INVOCATION;
  actionKey: string;
  effectKind: FeatureActionSpellEffectKind;
  spellId: string;
  spellName: string;
  spellLevel: number;
  fallbackDescription: SpellDescriptionEntry[];
  summary: string;
  detail: string;
  actionAvailabilityText?: string;
};

const warlockInvocationSpellActionDefinitions: WarlockInvocationSpellActionDefinition[] = [
  {
    invocationId: ELDRITCH_INVOCATION.ARMOR_OF_SHADOWS,
    actionKey: armorOfShadowsActionKey,
    effectKind: "armor-of-shadows",
    spellId: mageArmorSpellId,
    spellName: "Mage Armor",
    spellLevel: 1,
    fallbackDescription: ["You can cast Mage Armor on yourself without expending a spell slot."],
    summary: "Cast Mage Armor on yourself without a spell slot.",
    detail: "Open Mage Armor and cast it on yourself without expending a spell slot."
  },
  {
    invocationId: ELDRITCH_INVOCATION.FIENDISH_VIGOR,
    actionKey: fiendishVigorActionKey,
    effectKind: "fiendish-vigor",
    spellId: falseLifeSpellId,
    spellName: "False Life",
    spellLevel: 1,
    fallbackDescription: [
      "You can cast False Life on yourself without expending a spell slot. When you cast the spell with this feature, you don't roll the die for the Temporary Hit Points; you automatically get the highest number on the die."
    ],
    summary: "Cast False Life on yourself without a spell slot.",
    detail: "Open False Life and cast it on yourself without expending a spell slot.",
    actionAvailabilityText:
      "Cast without expending a spell slot. Treat the d4 as a 4 for this casting."
  },
  {
    invocationId: ELDRITCH_INVOCATION.ASCENDANT_STEP,
    actionKey: ascendantStepActionKey,
    effectKind: "ascendant-step",
    spellId: levitateSpellId,
    spellName: "Levitate",
    spellLevel: 2,
    fallbackDescription: ["You can cast Levitate on yourself without expending a spell slot."],
    summary: "Cast Levitate without a spell slot.",
    detail: "Open Levitate and cast it without expending a spell slot."
  },
  {
    invocationId: ELDRITCH_INVOCATION.MASK_OF_MANY_FACES,
    actionKey: maskOfManyFacesActionKey,
    effectKind: "mask-of-many-faces",
    spellId: disguiseSelfSpellId,
    spellName: "Disguise Self",
    spellLevel: 1,
    fallbackDescription: ["You can cast Disguise Self without expending a spell slot."],
    summary: "Cast Disguise Self without a spell slot.",
    detail: "Open Disguise Self and cast it without expending a spell slot."
  },
  {
    invocationId: ELDRITCH_INVOCATION.PACT_OF_THE_CHAIN,
    actionKey: pactOfTheChainActionKey,
    effectKind: "pact-of-the-chain",
    spellId: findFamiliarSpellId,
    spellName: "Find Familiar",
    spellLevel: 1,
    fallbackDescription: [
      "You learn the Find Familiar spell and can cast it as a Magic action without expending a spell slot.",
      "When you cast the spell, you choose one of the normal forms for your familiar or one of the following special forms: Imp, Pseudodragon, Quasit, Skeleton, Slaad Tadpole, Sphinx of Wonder, Sprite, or Venomous Snake.",
      "Additionally, when you take the Attack action, you can forgo one of your own attacks to allow your familiar to make one attack of its own with its Reaction."
    ],
    summary: "Cast Find Familiar without a spell slot.",
    detail: "Open Find Familiar and cast it without expending a spell slot."
  },
  {
    invocationId: ELDRITCH_INVOCATION.GIFT_OF_THE_DEPTHS,
    actionKey: giftOfTheDepthsActionKey,
    effectKind: "gift-of-the-depths",
    spellId: waterBreathingSpellId,
    spellName: "Water Breathing",
    spellLevel: 3,
    fallbackDescription: [
      "You can breathe underwater, and you gain a Swim Speed equal to your Speed.",
      "You can also cast Water Breathing once without expending a spell slot. You regain the ability to cast it in this way again when you finish a Long Rest."
    ],
    summary: "Cast Water Breathing once per Long Rest.",
    detail: "Open Water Breathing and cast it without expending a spell slot.",
    actionAvailabilityText:
      "Cast once without expending a spell slot. Recharges on a Long Rest."
  },
  {
    invocationId: ELDRITCH_INVOCATION.MISTY_VISIONS,
    actionKey: mistyVisionsActionKey,
    effectKind: "misty-visions",
    spellId: silentImageSpellId,
    spellName: "Silent Image",
    spellLevel: 1,
    fallbackDescription: ["You can cast Silent Image without expending a spell slot."],
    summary: "Cast Silent Image without a spell slot.",
    detail: "Open Silent Image and cast it without expending a spell slot."
  },
  {
    invocationId: ELDRITCH_INVOCATION.OTHERWORLDLY_LEAP,
    actionKey: otherworldlyLeapActionKey,
    effectKind: "otherworldly-leap",
    spellId: jumpSpellId,
    spellName: "Jump",
    spellLevel: 1,
    fallbackDescription: ["You can cast Jump on yourself without expending a spell slot."],
    summary: "Cast Jump on yourself without a spell slot.",
    detail: "Open Jump and cast it on yourself without expending a spell slot."
  },
  {
    invocationId: ELDRITCH_INVOCATION.MASTER_OF_MYRIAD_FORMS,
    actionKey: masterOfMyriadFormsActionKey,
    effectKind: "master-of-myriad-forms",
    spellId: alterSelfSpellId,
    spellName: "Alter Self",
    spellLevel: 2,
    fallbackDescription: ["You can cast Alter Self without expending a spell slot."],
    summary: "Cast Alter Self without a spell slot.",
    detail: "Open Alter Self and cast it without expending a spell slot."
  },
  {
    invocationId: ELDRITCH_INVOCATION.ONE_WITH_SHADOWS,
    actionKey: oneWithShadowsActionKey,
    effectKind: "one-with-shadows",
    spellId: invisibilitySpellId,
    spellName: "Invisibility",
    spellLevel: 2,
    fallbackDescription: [
      "While you're in an area of Dim Light or Darkness, you can cast Invisibility on yourself without expending a spell slot."
    ],
    summary: "Cast Invisibility on yourself without a spell slot.",
    detail: "Open Invisibility and cast it on yourself without expending a spell slot."
  },
  {
    invocationId: ELDRITCH_INVOCATION.WHISPERS_OF_THE_GRAVE,
    actionKey: whispersOfTheGraveActionKey,
    effectKind: "whispers-of-the-grave",
    spellId: speakWithDeadSpellId,
    spellName: "Speak with Dead",
    spellLevel: 3,
    fallbackDescription: ["You can cast Speak with Dead without expending a spell slot."],
    summary: "Cast Speak with Dead without a spell slot.",
    detail: "Open Speak with Dead and cast it without expending a spell slot."
  },
  {
    invocationId: ELDRITCH_INVOCATION.VISIONS_OF_DISTANT_REALMS,
    actionKey: visionsOfDistantRealmsActionKey,
    effectKind: "visions-of-distant-realms",
    spellId: arcaneEyeSpellId,
    spellName: "Arcane Eye",
    spellLevel: 4,
    fallbackDescription: ["You can cast Arcane Eye without expending a spell slot."],
    summary: "Cast Arcane Eye without a spell slot.",
    detail: "Open Arcane Eye and cast it without expending a spell slot."
  }
];

const warlockInvocationSpellActionKeys = new Set(
  warlockInvocationSpellActionDefinitions.map((definition) => definition.actionKey)
);
const warlockInvocationSpellEffectKinds = new Set(
  warlockInvocationSpellActionDefinitions.map((definition) => definition.effectKind)
);

export function getWarlockInvocationSpellActions(
  selectedInvocationIds: ReadonlySet<ELDRITCH_INVOCATION>,
  usageStates: Partial<Record<string, WarlockInvocationSpellActionUsageState>> = {},
  descriptionAdditionsByActionKey: Partial<Record<string, SpellDescriptionEntry[][]>> = {}
): FeatureActionCard[] {
  return warlockInvocationSpellActionDefinitions.flatMap((definition) => {
    if (!selectedInvocationIds.has(definition.invocationId)) {
      return [];
    }

    const invocation = getEldritchInvocationEntryById(definition.invocationId);
    const description = invocation?.description ?? definition.fallbackDescription;
    const name = invocation?.name ?? definition.spellName;
    const usageState = usageStates[definition.actionKey];
    const disabled = usageState ? usageState.usesRemaining <= 0 : false;
    const descriptionAdditions = descriptionAdditionsByActionKey[definition.actionKey] ?? [];

    return [
      {
        key: definition.actionKey,
        name,
        summary: definition.summary,
        detail: definition.detail,
        breakdown: `Open ${definition.spellName}`,
        economyType: ECONOMY_TYPE.ACTION,
        actionCategory: ACTION_CATEGORY.MAGIC,
        usesRemaining: usageState?.usesRemaining,
        usesTotal: usageState?.usesTotal,
        description,
        descriptionAdditions: descriptionAdditions.length > 0 ? descriptionAdditions : undefined,
        drawer: {
          kind: "confirm",
          eyebrow: "Eldritch Invocation",
          description,
          confirmLabel: `Open ${definition.spellName}`
        },
        execute: {
          kind: "spell",
          spellSource: "fixed",
          effectKind: definition.effectKind,
          spellId: definition.spellId,
          spellLevel: definition.spellLevel,
          label: `Open ${definition.spellName}`,
          actionContextText: `${name} is active.`,
          actionAvailabilityText:
            definition.actionAvailabilityText ?? "Cast without expending a spell slot.",
          actionConsumesSpellSlot: false
        },
        disabled,
        disabledReason: disabled ? usageState?.disabledReason : undefined
      }
    ];
  });
}

export function isWarlockInvocationSpellActionKey(actionKey: string): boolean {
  return warlockInvocationSpellActionKeys.has(actionKey);
}

export function isWarlockInvocationSpellEffectKind(
  effectKind: string | null | undefined
): effectKind is FeatureActionSpellEffectKind {
  return Boolean(
    effectKind && warlockInvocationSpellEffectKinds.has(effectKind as FeatureActionSpellEffectKind)
  );
}
