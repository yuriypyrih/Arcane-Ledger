import { FEAT_CATEGORY, FEATS, TRACKER } from "../../../../codex/entries";
import type { FeatDefinition } from "../types";

// Ravenloft: The Horrors Within. All benefits remain reference-only.
export const rhwFeatDefinitions: FeatDefinition[] = [
  {
    feat: FEATS.ABERRANT_ANATOMY,
    label: "Aberrant Anatomy",
    category: FEAT_CATEGORY.ORIGIN,
    source: "RHW",
    page: 32,
    tags: ["dark-gift"],
    prerequisite: "Ravenloft Campaign",
    requirements: [],
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "Alien influence has reshaped your body.",
      "<strong>Breathless.</strong> You can hold your breath for up to 1 hour.",
      "<strong>Extrasensory Perception.</strong> Gain proficiency and <link:Expertise>Expertise</link> in Perception, plus <link:Blindsight>Blindsight</link> out to 15 feet.",
      "<strong>Warping Flesh.</strong> Immediately after rolling a natural 1 on a D20 Test, make a Constitution save against DC 13 + your <link:Proficiency Bonus>Proficiency Bonus</link>. Failure leaves you <link:Stunned>Stunned</link> until the end of your next turn."
    ]
  },
  {
    feat: FEATS.ECHOING_SOUL,
    label: "Echoing Soul",
    category: FEAT_CATEGORY.ORIGIN,
    source: "RHW",
    page: 33,
    tags: ["dark-gift"],
    prerequisite: "Ravenloft Campaign",
    requirements: [],
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "Memories of another life echo through your soul.",
      "<strong>Channeled Prowess.</strong> Gain two skill proficiencies of your choice. Choose one proficient skill to gain <link:Expertise>Expertise</link>; you may change this <link:Expertise>Expertise</link> choice after each <link:long-rest>Long Rest</link>.",
      "<strong>Inherent Tongues.</strong> Learn one language of your choice from the Player's Handbook language tables.",
      "<strong>Intrusive Echoes.</strong> Immediately after rolling a natural 1 on a D20 Test, make a Constitution save against DC 13 + your <link:Proficiency Bonus>Proficiency Bonus</link>. Failure leaves you <link:Incapacitated>Incapacitated</link> until the end of your next turn, with your Speed halved while this condition lasts."
    ]
  },
  {
    feat: FEATS.GATHERED_WHISPERS,
    label: "Gathered Whispers",
    category: FEAT_CATEGORY.ORIGIN,
    source: "RHW",
    page: 33,
    tags: ["dark-gift"],
    prerequisite: "Ravenloft Campaign",
    requirements: [],
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "Whispering spirits haunt you, inaudible to others.",
      "<strong>Spirit Whispers.</strong> Learn <spell:Message>Message</spell>, which you may cast without Material components. <spell:Augury>Augury</spell> is always prepared and can be cast without a slot or any components once per <link:long-rest>Long Rest</link>, or using your available spell slots. Choose Intelligence, Wisdom, or Charisma as the spellcasting ability for both spells when taking this feat.",
      "<strong>Unearthly Scream.</strong> When an attack roll hits you, a Reaction lets you add your <link:Proficiency Bonus>Proficiency Bonus</link> to your AC against that attack, possibly making it miss. Uses equal your <link:Proficiency Bonus>Proficiency Bonus</link>; a <link:long-rest>Long Rest</link> restores them all.",
      "<strong>Voices from Beyond.</strong> Immediately after rolling a natural 1 on a D20 Test, make a Wisdom save against DC 13 + your <link:Proficiency Bonus>Proficiency Bonus</link>. Failure leaves you <link:Deafened>Deafened</link> until the end of your next turn, with <link:Disadvantage>Disadvantage</link> on ability checks and attack rolls while <link:Deafened>Deafened</link> this way."
    ]
  },
  {
    feat: FEATS.LIVING_SHADOW,
    label: "Living Shadow",
    category: FEAT_CATEGORY.ORIGIN,
    source: "RHW",
    page: 33,
    tags: ["dark-gift"],
    prerequisite: "Ravenloft Campaign",
    requirements: [],
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "Your ever-present shadow moves independently and sometimes imposes its own will.",
      "<strong>Grasping Shadow.</strong> Learn <spell:Mage Hand>Mage Hand</spell>, which you may cast without components. Choose Intelligence, Wisdom, or Charisma as its spellcasting ability when taking this feat.",
      "<strong>Lengthened Strike.</strong> On your turn, when making a melee attack roll as part of the Attack or Magic action, you may extend that attack's reach by 10 feet. Uses equal your <link:Proficiency Bonus>Proficiency Bonus</link>; a <link:long-rest>Long Rest</link> restores them all.",
      "<strong>Ominous Will.</strong> Immediately after rolling a natural 1 on a D20 Test, make a Wisdom save against DC 13 + your <link:Proficiency Bonus>Proficiency Bonus</link>. Failure leaves you <link:Incapacitated>Incapacitated</link> until your next turn starts. At that point, roll 1d8 on Shadow's Will to determine your behavior for that turn.",
      "<strong>Shadow's Will (1d8).</strong>",
      "<strong>1.</strong> Take no action or Bonus Action and spend all movement moving in a random direction: 1d4 determines north (1), east (2), south (3), or west (4).",
      "<strong>2–6.</strong> Do not move or take a Bonus Action. Use the Attack action to make one melee attack against a random creature in reach, or take no action if none is in reach.",
      "<strong>7–8.</strong> Become <link:Prone>Prone</link> and end your turn."
    ]
  },
  {
    feat: FEATS.MIST_WALKER,
    label: "Mist Walker",
    category: FEAT_CATEGORY.ORIGIN,
    source: "RHW",
    page: 34,
    tags: ["dark-gift"],
    prerequisite: "Ravenloft Campaign",
    requirements: [],
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "You can navigate the Mists, but remaining in one place lets them drain your vitality.",
      "<strong>Domain Traveler.</strong> Entering the Mists with a specific domain in mind counts as possessing its keyed Mist talisman. You must know the domain's name but need not have visited it. Borders closed by a Darklord still block you.",
      "<strong>Mist Walk.</strong> When you take damage or fail a save to avoid or end being <link:Grappled>Grappled</link> or <link:Restrained>Restrained</link>, you may use a Reaction to teleport up to 15 feet to a visible, unoccupied space. Uses equal your <link:Proficiency Bonus>Proficiency Bonus</link>; a <link:long-rest>Long Rest</link> restores them all.",
      "<strong>Poisoned Roots.</strong> Completing a <link:long-rest>Long Rest</link> turns the surrounding 10-mile radius into a drain on your vitality. Every <link:short-rest>Short Rest</link> you finish in that area requires a Constitution save against DC 13 + your <link:Proficiency Bonus>Proficiency Bonus</link>. Failure prevents all benefits from that rest."
    ]
  },
  {
    feat: FEATS.SECOND_SKIN,
    label: "Second Skin",
    category: FEAT_CATEGORY.ORIGIN,
    source: "RHW",
    page: 34,
    tags: ["dark-gift"],
    prerequisite: "Ravenloft Campaign",
    requirements: [],
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "A hidden, monstrous aspect of you can emerge in another form.",
      "<strong>Alternate Form.</strong> <spell:Alter Self>Alter Self</spell> is always prepared. Choose Intelligence, Wisdom, or Charisma as its spellcasting ability when taking this feat. Once per <link:long-rest>Long Rest</link>, you may cast it without a slot or components, and that casting needs no <link:Concentration>Concentration</link>. You may also cast it with available slots of an appropriate level.",
      "<strong>Involuntary Change.</strong> When taking this feat, roll 1d6 on Change Catalyst. After experiencing that trigger, make a Charisma save at the start of your next turn against DC 13 + your <link:Proficiency Bonus>Proficiency Bonus</link>. On failure, immediately use Alternate Form to cast <spell:Alter Self>Alter Self</spell> without a slot. If that use is already spent, you are instead <link:Stunned>Stunned</link> until the start of your next turn.",
      "<strong>Change Catalyst (1d6).</strong>",
      "<strong>1.</strong> Seeing a specific phase of the moon.",
      "<strong>2.</strong> Smelling a particular flower.",
      "<strong>3.</strong> Hearing the ringing of temple bells.",
      "<strong>4.</strong> Hearing a certain melody.",
      "<strong>5.</strong> Bare skin touching pure silver.",
      "<strong>6.</strong> Seeing someone who resembles a particular person."
    ]
  },
  {
    feat: FEATS.SHARP_EYE,
    label: "Sharp Eye",
    category: FEAT_CATEGORY.ORIGIN,
    source: "RHW",
    page: 32,
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "<strong>Sharp Eye.</strong> When using the Search or Study action, you may gain <link:Advantage>Advantage</link> on any ability check made as part of it. Uses equal your <link:Proficiency Bonus>Proficiency Bonus</link>, all restored by a <link:long-rest>Long Rest</link>. A failed check does not spend the use."
    ]
  },
  {
    feat: FEATS.SURVIVOR,
    label: "Survivor",
    category: FEAT_CATEGORY.ORIGIN,
    source: "RHW",
    page: 32,
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "<strong>Hypervigilance.</strong> When your Initiative d20 shows 9 or lower, you may reroll it and must keep the new result.",
      "<strong>Steel Yourself.</strong> After failing a save to avoid or end being <link:Charmed>Charmed</link> or <link:Frightened>Frightened</link>, you may use a Reaction to add your <link:Proficiency Bonus>Proficiency Bonus</link> to the roll, possibly making it succeed. This Reaction is usable once per <link:long-rest>Long Rest</link>."
    ]
  },
  {
    feat: FEATS.SYMBIOTIC_BEING,
    label: "Symbiotic Being",
    category: FEAT_CATEGORY.ORIGIN,
    source: "RHW",
    page: 34,
    tags: ["dark-gift"],
    prerequisite: "Ravenloft Campaign",
    requirements: [],
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "Another being shares your body, lending knowledge and help while pursuing its own goals.",
      "<strong>Entwined Existence.</strong> The symbiote cannot be targeted separately. Your death kills it, and restoring you to life revives it too.",
      "<strong>Second Mind.</strong> Gain proficiency in Arcana, Deception, History, Intimidation, Insight, Investigation, Nature, Religion, Perception, or Persuasion. Learn one additional language from the Player's Handbook language tables.",
      "<strong>Sustained Symbiosis.</strong> After failing a saving throw, you may use a Reaction to spend and roll one Hit Die, adding the result to the save and possibly making it succeed. Uses equal your <link:Proficiency Bonus>Proficiency Bonus</link>; a <link:long-rest>Long Rest</link> restores them all.",
      "<strong>Symbiotic Agenda.</strong> Immediately after rolling a natural 1 on a D20 Test, make a Charisma save against DC 13 + your <link:Proficiency Bonus>Proficiency Bonus</link>. Failure leaves you <link:Charmed>Charmed</link> for 1d12 hours; during that time you must try to obey the symbiote and advance its goals as the DM determines. Taking damage allows another save, ending the effect on success. The DM may also call for this save when you act against the symbiote's agenda."
    ]
  },
  {
    feat: FEATS.TOUCH_OF_DEATH,
    label: "Touch of Death",
    category: FEAT_CATEGORY.ORIGIN,
    source: "RHW",
    page: 35,
    tags: ["dark-gift"],
    prerequisite: "Ravenloft Campaign",
    requirements: [],
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "Destructive deathly energy responds to the slightest provocation.",
      "<strong>Death Touch.</strong> Learn <spell:Chill Touch>Chill Touch</spell>, which you may cast without components. Its Necrotic damage ignores Resistance. Choose Intelligence, Wisdom, or Charisma as its spellcasting ability when taking this feat.",
      "<strong>Pull of the Grave.</strong> Your Death Saving Throws have <link:Disadvantage>Disadvantage</link>."
    ]
  },
  {
    feat: FEATS.WATCHERS,
    label: "Watchers",
    category: FEAT_CATEGORY.ORIGIN,
    source: "RHW",
    page: 35,
    tags: ["dark-gift"],
    prerequisite: "Ravenloft Campaign",
    requirements: [],
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "Unnatural watchers follow you in the guise of vermin and other unsettling creatures.",
      "<strong>Borrowed Eyes.</strong> <spell:Beast Sense>Beast Sense</spell> and <spell:Speak with Animals>Speak with Animals</spell> are always prepared. Each can be cast without a slot once per <link:long-rest>Long Rest</link>, or with available slots of an appropriate level.",
      "<strong>Heightened Suspicion.</strong> When you Search, you may add 1d4 to any ability check made as part of that action.",
      "<strong>Incessant Watchers.</strong> You have <link:Disadvantage>Disadvantage</link> on saves against <spell:Scrying>Scrying</spell>. Immediately after rolling a natural 1 on a D20 Test, make a Wisdom save against DC 13 + your <link:Proficiency Bonus>Proficiency Bonus</link>. Failure gives you <link:Disadvantage>Disadvantage</link> on D20 Tests for 1 minute. Repeat the save at the end of each of your turns to end the effect on success."
    ]
  }
];
