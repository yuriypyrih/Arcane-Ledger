import { CLASS_FEATURE, TRACKER } from "../entries/enums";
import type {
  FeatureMapEntry,
  SubclassEntry,
  SubclassFeatureClassObj,
  SubclassFeatureLevel
} from "../entries/types";

const SUBCLASS_FEATURE_LEVELS = {
  LEVEL_3: 3,
  LEVEL_6: 6,
  LEVEL_17: 17
} as const;

export const divineForeknowledgeDescription = [
  "As a Bonus Action, you magically expand your mind to the future.",
  "For 1 hour, you have <link:Advantage>Advantage</link> on D20 Tests.",
  "Once you use this feature, you can't use it again until you finish a <link:long-rest>Long Rest</link>.",
  "You can also restore your use of this feature by expending a level 6+ spell slot (no action required)."
] as const;

export const preserveLifeDescription = [
  "As a Magic action, you present your Holy Symbol and expend a use of your Channel Divinity to evoke healing energy that can restore a number of Hit Points equal to five times your Cleric level.",
  "Choose Bloodied creatures within 30 feet of yourself, which can include you, and divide those Hit Points among them.",
  "This feature can restore a creature to no more than half its Hit Point maximum."
] as const;

export const blessingOfTheTricksterDescription = [
  "As a Magic action, you can choose yourself or a willing creature within 30 feet of yourself to have <link:Advantage>Advantage</link> on <link:Stealth>Stealth</link> checks.",
  "This blessing lasts until you finish a <link:long-rest>Long Rest</link> or you use this feature again."
] as const;

export const invokeDuplicityDescription = [
  "As a Bonus Action, you can expend one use of your Channel Divinity to create a perfect visual illusion of yourself in an unoccupied space you can see within 30 feet of yourself. <link:tracked>Tracked</link>",
  "The illusion is intangible and doesn't occupy its space. It lasts for 1 minute, but it ends early if you dismiss it, no action required, or have the <link:Incapacitated>Incapacitated</link> condition.",
  "The illusion is animated and mimics your expressions and gestures.",
  "While it persists, you gain the following benefits.",
  "<strong>Cast Spells.</strong> You can cast spells as though you were in the illusion's space, but you must use your own senses.",
  "<strong>Distract.</strong> When both you and your illusion are within 5 feet of a creature that can see the illusion, you have <link:Advantage>Advantage</link> on attack rolls against that creature, given how distracting the illusion is to the target.",
  "<strong>Move.</strong> As a Bonus Action, you can move the illusion up to 30 feet to an unoccupied space you can see that is within 120 feet of yourself. <link:not-tracked>Not Tracked</link>"
] as const;

export const trickstersTranspositionDescription = [
  "Whenever you take the Bonus Action to create or move the illusion of your Invoke Duplicity, you can teleport, swapping places with the illusion."
] as const;

export const improvedDuplicityDescription = [
  "The illusion of your Invoke Duplicity has grown more powerful in the following ways.",
  "<strong>Shared Distraction.</strong> When you and your allies make attack rolls against a creature within 5 feet of the illusion, the attack rolls have <link:Advantage>Advantage</link>. <link:not-tracked>Not Tracked</link>",
  "<strong>Healing Illusion.</strong> When the illusion ends, you or a creature of your choice within 5 feet of it regains a number of Hit Points equal to your Cleric level. <link:not-tracked>Not Tracked</link>"
] as const;

export const radianceOfTheDawnDescription = [
  "As a Magic action, you present your Holy Symbol and expend a use of your Channel Divinity to emit a flash of light in a 30-foot <link:Emanation>Emanation</link> originating from yourself.",
  "Any magical Darkness, such as that created by the <spell:Darkness>Darkness</spell> spell, in that area is dispelled.",
  "Additionally, each creature of your choice in that area must make a <link:Constitution Saving Throw>Constitution saving throw</link>, taking <link:Radiant>Radiant</link> damage equal to 2d10 plus your Cleric level on a failed save or half as much damage on a successful one."
] as const;

export const wardingFlareDescription = [
  "When a creature that you can see within 30 feet of yourself makes an attack roll, you can take a Reaction to impose <link:Disadvantage>Disadvantage</link> on the attack roll, causing light to flare before it hits or misses.",
  "You can use this feature a number of times equal to your <link:WIS>Wisdom</link> modifier, minimum of once.",
  "You regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
] as const;

export const improvedWardingFlareDescription = [
  "You regain all expended uses of your Warding Flare when you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
  "In addition, whenever you use Warding Flare, you can give the target of the triggering attack a number of <link:Temporary Hit Points>Temporary Hit Points</link> equal to 2d6 plus your <link:WIS>Wisdom</link> modifier."
] as const;

export const coronaOfLightDescription = [
  "As a Magic action, you cause yourself to emit an aura of sunlight that lasts for 1 minute or until you dismiss it, no action required.",
  "You emit Bright Light in a 60-foot radius and Dim Light for an additional 30 feet.",
  "Your enemies in the Bright Light have <link:Disadvantage>Disadvantage</link> on saving throws against your Radiance of the Dawn and any spell that deals <link:Fire>Fire</link> or <link:Radiant>Radiant</link> damage.",
  "You can use this feature a number of times equal to your <link:WIS>Wisdom</link> modifier, minimum of once, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
] as const;

function createSubclassFeatureRow(
  level: SubclassFeatureLevel,
  feature: CLASS_FEATURE,
  details: FeatureMapEntry
): SubclassFeatureClassObj {
  return {
    level,
    classFeatures: [feature],
    featureOverrides: {
      [feature]: details
    }
  };
}

const notTracked = { trackingState: TRACKER.NOT_TRACKED } as const;

export const clericSubclassEntries: SubclassEntry[] = [
  {
    id: "cleric-knowledge-domain",
    name: "Knowledge Domain",
    className: "Cleric",
    tagline: "Unearth Secrets and Master the Mind",
    summary:
      "The Knowledge Domain values learning and understanding above all. Clerics who tap into this domain study esoteric lore, collect old tomes, delve into secret places, and examine the processes of the mind. To them, knowledge is more valuable than material wealth, and learning is an act of worship. Libraries, universities, and other educational institutions also draw on the power of the Knowledge Domain.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.BLESSINGS_OF_KNOWLEDGE,
        {
          description: [
            "You gain proficiency with one type of Artisan's Tools of your choice and in two of the following skills of your choice: <link:Arcana>Arcana</link>, <link:History>History</link>, <link:Nature>Nature</link>, or <link:Religion>Religion</link>.",
            "You have Expertise in those two skills."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.KNOWLEDGE_DOMAIN_SPELLS,
        {
          description: [
            "When you reach a Cleric level specified in the Knowledge Domain Spells table, you thereafter always have the listed spells prepared.",
            "<strong>Level 3.</strong> <spell:Command>Command</spell>, <spell:Comprehend Languages>Comprehend Languages</spell>, <spell:Detect Magic>Detect Magic</spell>, <spell:Detect Thoughts>Detect Thoughts</spell>, <spell:Identify>Identify</spell>, <spell:Mind Spike>Mind Spike</spell>",
            "<strong>Level 5.</strong> <spell:Dispel Magic>Dispel Magic</spell>, <spell:Nondetection>Nondetection</spell>, <spell:Tongues>Tongues</spell>",
            "<strong>Level 7.</strong> <spell:Arcane Eye>Arcane Eye</spell>, <spell:Banishment>Banishment</spell>, <spell:Confusion>Confusion</spell>",
            "<strong>Level 9.</strong> <spell:Legend Lore>Legend Lore</spell>, <spell:Scrying>Scrying</spell>, <spell:Synaptic Static>Synaptic Static</spell>",
            "<spell:Comprehend Languages>Comprehend Languages</spell>, <spell:Detect Magic>Detect Magic</spell>, <spell:Detect Thoughts>Detect Thoughts</spell>, <spell:Identify>Identify</spell>, <spell:Mind Spike>Mind Spike</spell>, <spell:Tongues>Tongues</spell>, <spell:Arcane Eye>Arcane Eye</spell>, <spell:Legend Lore>Legend Lore</spell>, and <spell:Scrying>Scrying</spell> are spells of the Divination school."
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.MIND_MAGIC, {
        description: [
          "As a Magic action, you can expend one use of your Channel Divinity to manifest your magical knowledge.",
          "Choose one spell from the Divination school on the Knowledge Domain Spells table that you have prepared.",
          "As part of that action, you cast that spell without expending a spell slot or needing Material components."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.UNFETTERED_MIND, {
        description: [
          "You gain telepathy out to 60 feet. When you use this telepathy, you can simultaneously contact a number of creatures equal to your <link:WIS>Wisdom</link> modifier (minimum of one).",
          "Additionally, you gain proficiency in <link:Intelligence Saving Throw>Intelligence saving throws</link>.",
          "If you already have this proficiency, you instead gain saving throw proficiency with one ability in which you lack it."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_17,
        CLASS_FEATURE.DIVINE_FOREKNOWLEDGE,
        {
          description: [...divineForeknowledgeDescription],
          trackingState: TRACKER.TRACKED
        }
      )
    ]
  },
  {
    id: "cleric-life-domain",
    name: "Life Domain",
    className: "Cleric",
    tagline: "Soothe the Hurts of the World",
    summary:
      "The Life Domain focuses on the positive energy that helps sustain all life in the multiverse. Clerics who tap into this domain are masters of healing, using that life force to cure many hurts.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.LIFE_DOMAIN_SPELLS, {
        description: [
          "When you reach a Cleric level specified in the Life Domain Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Aid>Aid</spell>, <spell:Bless>Bless</spell>, <spell:Cure Wounds>Cure Wounds</spell>, <spell:Lesser Restoration>Lesser Restoration</spell>",
          "<strong>Level 5.</strong> <spell:Mass Healing Word>Mass Healing Word</spell>, <spell:Revivify>Revivify</spell>",
          "<strong>Level 7.</strong> <spell:Aura of Life>Aura of Life</spell>, <spell:Death Ward>Death Ward</spell>",
          "<strong>Level 9.</strong> <spell:Greater Restoration>Greater Restoration</spell>, <spell:Mass Cure Wounds>Mass Cure Wounds</spell>"
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.DISCIPLE_OF_LIFE, {
        description: [
          "When a spell you cast with a spell slot restores Hit Points to a creature, that creature regains additional Hit Points on the turn you cast the spell.",
          "The additional Hit Points equal 2 plus the spell slot's level."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.PRESERVE_LIFE, {
        description: [...preserveLifeDescription],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.BLESSED_HEALER, {
        description: [
          "The healing spells you cast on others heal you as well.",
          "Immediately after you cast a spell with a spell slot that restores Hit Points to one creature other than you, you regain Hit Points equal to 2 plus the spell slot's level."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.SUPREME_HEALING, {
        description: [
          "When you would normally roll one or more dice to restore Hit Points to a creature with a spell or Channel Divinity, don't roll those dice for the healing; instead use the highest number possible for each die.",
          "For example, instead of restoring 2d6 Hit Points to a creature with a spell, you restore 12."
        ],
        trackingState: TRACKER.SEMI_TRACKED
      })
    ]
  },
  {
    id: "cleric-light-domain",
    name: "Light Domain",
    className: "Cleric",
    tagline: "Bring Light to Banish Darkness",
    summary:
      "The Light Domain emphasizes the divine power to bring about blazing fire and revelation. Clerics who wield this power are enlightened souls infused with radiance and the power of their deities' discerning vision, charged with chasing away lies and burning away darkness.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.LIGHT_DOMAIN_SPELLS, {
        description: [
          "When you reach a Cleric level specified in the Light Domain Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Burning Hands>Burning Hands</spell>, <spell:Faerie Fire>Faerie Fire</spell>, <spell:Scorching Ray>Scorching Ray</spell>, <spell:See Invisibility>See Invisibility</spell>",
          "<strong>Level 5.</strong> <spell:Daylight>Daylight</spell>, <spell:Fireball>Fireball</spell>",
          "<strong>Level 7.</strong> <spell:Arcane Eye>Arcane Eye</spell>, <spell:Wall of Fire>Wall of Fire</spell>",
          "<strong>Level 9.</strong> <spell:Flame Strike>Flame Strike</spell>, <spell:Scrying>Scrying</spell>"
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.RADIANCE_OF_THE_DAWN,
        {
          description: [
            "As a Magic action, you present your Holy Symbol and expend a use of your Channel Divinity to emit a flash of light in a 30-foot <link:Emanation>Emanation</link> originating from yourself.",
            "Any magical Darkness, such as that created by the <spell:Darkness>Darkness</spell> spell, in that area is dispelled.",
            "Additionally, each creature of your choice in that area must make a <link:Constitution Saving Throw>Constitution saving throw</link>, taking <link:Radiant>Radiant</link> damage equal to 2d10 plus your Cleric level on a failed save or half as much damage on a successful one."
          ],
          trackingState: TRACKER.SEMI_TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.WARDING_FLARE, {
        description: [...wardingFlareDescription],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.IMPROVED_WARDING_FLARE,
        {
          description: [...improvedWardingFlareDescription],
          trackingState: TRACKER.SEMI_TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.CORONA_OF_LIGHT, {
        description: [...coronaOfLightDescription],
        trackingState: TRACKER.SEMI_TRACKED
      })
    ]
  },
  {
    id: "cleric-trickery-domain",
    name: "Trickery Domain",
    className: "Cleric",
    tagline: "Make Mischief and Challenge Authority",
    summary:
      "The Trickery Domain offers magic of deception, illusion, and stealth. Clerics who wield this magic are a disruptive force in the world, puncturing pride, mocking tyrants, freeing captives, and flouting hollow traditions. They prefer subterfuge and pranks to direct confrontation.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.TRICKERY_DOMAIN_SPELLS,
        {
          description: [
            "When you reach a Cleric level specified in the Trickery Domain Spells table, you thereafter always have the listed spells prepared.",
            "<strong>Level 3.</strong> <spell:Charm Person>Charm Person</spell>, <spell:Disguise Self>Disguise Self</spell>, <spell:Invisibility>Invisibility</spell>, <spell:Pass without Trace>Pass without Trace</spell>",
            "<strong>Level 5.</strong> <spell:Hypnotic Pattern>Hypnotic Pattern</spell>, <spell:Nondetection>Nondetection</spell>",
            "<strong>Level 7.</strong> <spell:Confusion>Confusion</spell>, <spell:Dimension Door>Dimension Door</spell>",
            "<strong>Level 9.</strong> <spell:Dominate Person>Dominate Person</spell>, <spell:Modify Memory>Modify Memory</spell>"
          ],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.BLESSING_OF_THE_TRICKSTER,
        {
          description: [...blessingOfTheTricksterDescription],
          trackingState: TRACKER.SEMI_TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.INVOKE_DUPLICITY, {
        description: [...invokeDuplicityDescription],
        trackingState: TRACKER.SEMI_TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.TRICKSTERS_TRANSPOSITION,
        {
          description: [...trickstersTranspositionDescription],
          trackingState: TRACKER.SEMI_TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.IMPROVED_DUPLICITY, {
        description: [...improvedDuplicityDescription],
        trackingState: TRACKER.SEMI_TRACKED
      })
    ]
  },
  {
    id: "cleric-war-domain",
    name: "War Domain",
    className: "Cleric",
    tagline: "Inspire Valor and Smite Foes",
    summary:
      "War has many manifestations. It can make heroes of ordinary people. It can be desperate and horrific, with acts of cruelty and cowardice eclipsing instances of excellence and courage. Clerics who tap into the magic of the War Domain excel in battle, inspiring others to fight the good fight or offering acts of violence as prayers.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.WAR_DOMAIN_SPELLS, {
        description: [
          "When you reach a Cleric level specified in the War Domain Spells table, you thereafter always have the listed spells prepared.",
          "<strong>Level 3.</strong> <spell:Guiding Bolt>Guiding Bolt</spell>, <spell:Magic Weapon>Magic Weapon</spell>, <spell:Shield of Faith>Shield of Faith</spell>, <spell:Spiritual Weapon>Spiritual Weapon</spell>",
          "<strong>Level 5.</strong> <spell:Crusader's Mantle>Crusader's Mantle</spell>, <spell:Spirit Guardians>Spirit Guardians</spell>",
          "<strong>Level 7.</strong> <spell:Fire Shield>Fire Shield</spell>, <spell:Freedom of Movement>Freedom of Movement</spell>",
          "<strong>Level 9.</strong> <spell:Hold Monster>Hold Monster</spell>, <spell:Steel Wind Strike>Steel Wind Strike</spell>"
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.WAR_PRIEST, {
        description: [
          "As a Bonus Action, you can make one attack with a weapon or an Unarmed Strike.",
          "You can use this Bonus Action a number of times equal to your <link:WIS>Wisdom</link> modifier, minimum of once.",
          "You regain all expended uses when you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.GUIDED_STRIKE, {
        description: [
          "When you or a creature within 30 feet of you misses with an attack roll, you can expend one use of your Channel Divinity and give that roll a +10 bonus, potentially causing it to hit.",
          "When you use this feature to benefit another creature's attack roll, you must take a Reaction to do so."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.WAR_GODS_BLESSING, {
        description: [
          "You can expend a use of your Channel Divinity to cast <spell:Shield of Faith>Shield of Faith</spell> or <spell:Spiritual Weapon>Spiritual Weapon</spell> rather than expending a spell slot.",
          "When you cast either spell in this way, the spell doesn't require <link:Concentration>Concentration</link>.",
          "Instead the spell lasts for 1 minute, but it ends early if you cast that spell again, have the <link:Incapacitated>Incapacitated</link> condition, or die."
        ],
        ...notTracked
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.AVATAR_OF_BATTLE, {
        description: [
          "You gain <link:Resistance>Resistance</link> to <link:Bludgeoning>Bludgeoning</link>, <link:Piercing>Piercing</link>, and <link:Slashing>Slashing</link> damage."
        ],
        ...notTracked
      })
    ]
  }
];
