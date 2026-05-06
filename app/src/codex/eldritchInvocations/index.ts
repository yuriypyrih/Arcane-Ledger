import { ELDRITCH_INVOCATION, TRACKER } from "../entries/enums";
import type { EldritchInvocationEntry } from "../entries/types";

export const eldritchInvocationEntries: EldritchInvocationEntry[] = [
  {
    id: ELDRITCH_INVOCATION.AGONIZING_BLAST,
    name: "Agonizing Blast",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 2 }],
    selection: {
      kind: "warlock-cantrip",
      rule: "damaging"
    },
    repeatable: true,
    description: [
      "Choose one of your known Warlock cantrips that deals damage. You can add your Charisma modifier to that spell's damage rolls.",
      "<strong>Repeatable.</strong> You can gain this invocation more than once. Each time you do so, choose a different eligible cantrip."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.ARMOR_OF_SHADOWS,
    name: "Armor of Shadows",
    trackingState: TRACKER.TRACKED,
    description: ["You can cast <spell:Mage Armor>Mage Armor</spell> on yourself without expending a spell slot."]
  },
  {
    id: ELDRITCH_INVOCATION.ASCENDANT_STEP,
    name: "Ascendant Step",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 5 }],
    description: ["You can cast <spell:Levitate>Levitate</spell> on yourself without expending a spell slot."]
  },
  {
    id: ELDRITCH_INVOCATION.DEVILS_SIGHT,
    name: "Devil's Sight",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 2 }],
    description: [
      "You can see normally in Dim Light and Darkness, both magical and nonmagical, within 120 feet of yourself."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.DEVOURING_BLADE,
    name: "Devouring Blade",
    trackingState: TRACKER.TRACKED,
    prerequisites: [
      { type: "warlock-level", minimumLevel: 12 },
      { type: "invocation", invocation: ELDRITCH_INVOCATION.THIRSTING_BLADE }
    ],
    description: [
      "The Extra Attack of your Thirsting Blade invocation confers two extra attacks rather than one."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.ELDRITCH_MIND,
    name: "Eldritch Mind",
    trackingState: TRACKER.TRACKED,
    description: [
      "You have Advantage on Constitution saving throws that you make to maintain <link:Concentration>Concentration</link>."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.ELDRITCH_SMITE,
    name: "Eldritch Smite",
    trackingState: TRACKER.TRACKED,
    prerequisites: [
      { type: "warlock-level", minimumLevel: 5 },
      { type: "invocation", invocation: ELDRITCH_INVOCATION.PACT_OF_THE_BLADE }
    ],
    description: [
      "Once per turn when you hit a creature with your pact weapon, you can expend a Pact Magic spell slot to deal an extra 1d8 Force damage to the target, plus another 1d8 per level of the spell slot, and you can give the target the <link:Prone>Prone</link> condition if it is Huge or smaller."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.ELDRITCH_SPEAR,
    name: "Eldritch Spear",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 2 }],
    selection: {
      kind: "warlock-cantrip",
      rule: "damaging-range-10"
    },
    repeatable: true,
    description: [
      "Choose one of your known Warlock cantrips that deals damage and has a range of 10+ feet. When you cast that spell, its range increases by a number of feet equal to 30 times your Warlock level.",
      "<strong>Repeatable.</strong> You can gain this invocation more than once. Each time you do so, choose a different eligible cantrip."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.FIENDISH_VIGOR,
    name: "Fiendish Vigor",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 2 }],
    description: [
      "You can cast <spell:False Life>False Life</spell> on yourself without expending a spell slot. When you cast the spell with this feature, you don't roll the die for the <link:Temporary Hit Points>Temporary Hit Points</link>; you automatically get the highest number on the die."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.GAZE_OF_TWO_MINDS,
    name: "Gaze of Two Minds",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 5 }],
    description: [
      "You can use a Bonus Action to touch a willing creature and perceive through its senses until the end of your next turn. As long as the creature is on the same plane of existence as you, you can take a Bonus Action on subsequent turns to maintain this connection, extending the duration until the end of your next turn. The connection ends if you don't maintain it in this way.",
      "While perceiving through the other creature's senses, you benefit from any special senses possessed by that creature, and you can cast spells as if you were in your space or the other creature's space if the two of you are within 60 feet of each other."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.GIFT_OF_THE_DEPTHS,
    name: "Gift of the Depths",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 5 }],
    description: [
      "You can breathe underwater, and you gain a Swim Speed equal to your Speed.",
      "You can also cast <spell:Water Breathing>Water Breathing</spell> once without expending a spell slot. You regain the ability to cast it in this way again when you finish a <link:long-rest>Long Rest</link>."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.GIFT_OF_THE_PROTECTORS,
    name: "Gift of the Protectors",
    trackingState: TRACKER.TRACKED,
    prerequisites: [
      { type: "warlock-level", minimumLevel: 9 },
      { type: "invocation", invocation: ELDRITCH_INVOCATION.PACT_OF_THE_TOME }
    ],
    description: [
      "A new page appears in your Book of Shadows when you conjure it. With your permission, a creature can take an action to write its name on that page, which can contain a number of names equal to your Charisma modifier, minimum of one name.",
      "When any creature whose name is on the page is reduced to 0 Hit Points but not killed outright, the creature magically drops to 1 Hit Point instead. Once this magic is triggered, no creature can benefit from it until you finish a <link:long-rest>Long Rest</link>.",
      "As a Magic action, you can erase a name on the page by touching it."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.INVESTMENT_OF_THE_CHAIN_MASTER,
    name: "Investment of the Chain Master",
    trackingState: TRACKER.TRACKED,
    prerequisites: [
      { type: "warlock-level", minimumLevel: 5 },
      { type: "invocation", invocation: ELDRITCH_INVOCATION.PACT_OF_THE_CHAIN }
    ],
    description: [
      "When you cast <spell:Find Familiar>Find Familiar</spell>, you infuse the summoned familiar with a measure of your eldritch power, granting the creature the following benefits.",
      {
        type: "list",
        style: "bullet",
        items: [
          "Aerial or Aquatic. The familiar gains either a Fly Speed or a Swim Speed, your choice, of 40 feet.",
          "Quick Attack. As a Bonus Action, you can command the familiar to take the Attack action.",
          "Necrotic or Radiant Damage. Whenever the familiar deals Bludgeoning, Piercing, or Slashing damage, you can make it deal Necrotic or Radiant damage instead.",
          "Your Save DC. If the familiar forces a creature to make a saving throw, it uses your spell save DC.",
          "Resistance. When the familiar takes damage, you can take a Reaction to grant it <link:resistance>Resistance</link> against that damage."
        ]
      }
    ]
  },
  {
    id: ELDRITCH_INVOCATION.LESSONS_OF_THE_FIRST_ONES,
    name: "Lessons of the First Ones",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 2 }],
    selection: {
      kind: "origin-feat"
    },
    repeatable: true,
    description: [
      "You have received knowledge from an elder entity of the multiverse, allowing you to gain one Origin feat of your choice. See <link:Feats>Feats</link>.",
      "<strong>Repeatable.</strong> You can gain this invocation more than once. Each time you do so, choose a different Origin feat."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.LIFEDRINKER,
    name: "Lifedrinker",
    trackingState: TRACKER.TRACKED,
    prerequisites: [
      { type: "warlock-level", minimumLevel: 9 },
      { type: "invocation", invocation: ELDRITCH_INVOCATION.PACT_OF_THE_BLADE }
    ],
    description: [
      "Once per turn when you hit a creature with your pact weapon, you can deal an extra 1d6 Necrotic, Psychic, or Radiant damage, your choice, to the creature, and you can expend one of your Hit Point Dice to roll it and regain a number of Hit Points equal to the roll plus your Constitution modifier, minimum of 1 Hit Point."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.MASK_OF_MANY_FACES,
    name: "Mask of Many Faces",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 2 }],
    description: ["You can cast <spell:Disguise Self>Disguise Self</spell> without expending a spell slot."]
  },
  {
    id: ELDRITCH_INVOCATION.MASTER_OF_MYRIAD_FORMS,
    name: "Master of Myriad Forms",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 5 }],
    description: ["You can cast <spell:Alter Self>Alter Self</spell> without expending a spell slot."]
  },
  {
    id: ELDRITCH_INVOCATION.MISTY_VISIONS,
    name: "Misty Visions",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 2 }],
    description: ["You can cast <spell:Silent Image>Silent Image</spell> without expending a spell slot."]
  },
  {
    id: ELDRITCH_INVOCATION.ONE_WITH_SHADOWS,
    name: "One with Shadows",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 5 }],
    description: [
      "While you're in an area of Dim Light or Darkness, you can cast <spell:Invisibility>Invisibility</spell> on yourself without expending a spell slot."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.OTHERWORLDLY_LEAP,
    name: "Otherworldly Leap",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 2 }],
    description: ["You can cast <spell:Jump>Jump</spell> on yourself without expending a spell slot."]
  },
  {
    id: ELDRITCH_INVOCATION.PACT_OF_THE_BLADE,
    name: "Pact of the Blade",
    trackingState: TRACKER.TRACKED,
    selection: { kind: "pact-blade" },
    description: [
      "As a Bonus Action, you can conjure a pact weapon in your hand, a Simple or Martial Melee weapon of your choice with which you bond, or create a bond with a magic weapon you touch. You can't bond with a magic weapon if someone else is attuned to it or another Warlock is bonded with it. Until the bond ends, you have proficiency with the weapon, and you can use it as a Spellcasting Focus.",
      "Whenever you attack with the bonded weapon, you can use your Charisma modifier for the attack and damage rolls instead of using Strength or Dexterity, and you can cause the weapon to deal Necrotic, Psychic, or Radiant damage or its normal damage type.",
      "Your bond with the weapon ends if you use this feature's Bonus Action again, if the weapon is more than 5 feet away from you for 1 minute or more, or if you die. A conjured weapon disappears when the bond ends."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.PACT_OF_THE_CHAIN,
    name: "Pact of the Chain",
    trackingState: TRACKER.TRACKED,
    description: [
      "You learn the <spell:Find Familiar>Find Familiar</spell> spell and can cast it as a Magic action without expending a spell slot.",
      "When you cast the spell, you choose one of the normal forms for your familiar or one of the following special forms: Imp, Pseudodragon, Quasit, Skeleton, Slaad Tadpole, Sphinx of Wonder, Sprite, or Venomous Snake.",
      "Additionally, when you take the Attack action, you can forgo one of your own attacks to allow your familiar to make one attack of its own with its Reaction."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.PACT_OF_THE_TOME,
    name: "Pact of the Tome",
    trackingState: TRACKER.TRACKED,
    selection: { kind: "pact-tome" },
    description: [
      "Stitching together strands of shadow, you conjure forth a book in your hand at the end of a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>. This Book of Shadows, whose appearance you determine, contains eldritch magic that only you can access. The book disappears if you conjure another book with this feature or if you die.",
      "When the book appears, choose three cantrips and two level 1 spells that have the Ritual tag. The spells can be from any class's spell list, and they must be spells you don't already have prepared. While the book is on your person, you have the chosen spells prepared, and they function as Warlock spells for you.",
      "You can use the book as a Spellcasting Focus."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.REPELLING_BLAST,
    name: "Repelling Blast",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 2 }],
    selection: {
      kind: "warlock-cantrip",
      rule: "damaging-attack-roll"
    },
    repeatable: true,
    description: [
      "Choose one of your known Warlock cantrips that requires an attack roll. When you hit a Large or smaller creature with that cantrip, you can push the creature up to 10 feet straight away from you.",
      "<strong>Repeatable.</strong> You can gain this invocation more than once. Each time you do so, choose a different eligible cantrip."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.THIRSTING_BLADE,
    name: "Thirsting Blade",
    trackingState: TRACKER.TRACKED,
    prerequisites: [
      { type: "warlock-level", minimumLevel: 5 },
      { type: "invocation", invocation: ELDRITCH_INVOCATION.PACT_OF_THE_BLADE }
    ],
    description: [
      "You gain the Extra Attack feature for your pact weapon only. With that feature, you can attack twice with the weapon instead of once when you take the Attack action on your turn."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.VISIONS_OF_DISTANT_REALMS,
    name: "Visions of Distant Realms",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 9 }],
    description: ["You can cast <spell:Arcane Eye>Arcane Eye</spell> without expending a spell slot."]
  },
  {
    id: ELDRITCH_INVOCATION.WHISPERS_OF_THE_GRAVE,
    name: "Whispers of the Grave",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 7 }],
    description: [
      "You can cast <spell:Speak with Dead>Speak with Dead</spell> without expending a spell slot."
    ]
  },
  {
    id: ELDRITCH_INVOCATION.WITCH_SIGHT,
    name: "Witch Sight",
    trackingState: TRACKER.TRACKED,
    prerequisites: [{ type: "warlock-level", minimumLevel: 15 }],
    description: ["You have Truesight with a range of 30 feet."]
  }
];

const eldritchInvocationEntriesById = new Map(
  eldritchInvocationEntries.map((entry) => [entry.id, entry] as const)
);

export function getEldritchInvocationEntries(): EldritchInvocationEntry[] {
  return eldritchInvocationEntries;
}

export function getEldritchInvocationEntryById(
  invocationId: ELDRITCH_INVOCATION | string
): EldritchInvocationEntry | null {
  return eldritchInvocationEntriesById.get(invocationId as ELDRITCH_INVOCATION) ?? null;
}
