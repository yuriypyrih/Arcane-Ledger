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
  "For 1 hour, you have <link:Advantage>Advantage</link> on <strong>D20</strong> Tests.",
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
  "As a Bonus Action, you can expend one use of your Channel Divinity to create a perfect visual illusion of yourself in an unoccupied space you can see within 30 feet of yourself.",
  "The illusion is intangible and doesn't occupy its space. It lasts for 1 minute, but it ends early if you dismiss it, no action required, or have the <link:Incapacitated>Incapacitated</link> condition.",
  "The illusion is animated and mimics your expressions and gestures.",
  "While it persists, you gain the following benefits.",
  "<strong>Cast Spells.</strong> You can cast spells as though you were in the illusion's space, but you must use your own senses.",
  "<strong>Distract.</strong> When both you and your illusion are within 5 feet of a creature that can see the illusion, you have <link:Advantage>Advantage</link> on attack rolls against that creature, given how distracting the illusion is to the target.",
  "<strong>Move.</strong> As a Bonus Action, you can move the illusion up to 30 feet to an unoccupied space you can see that is within 120 feet of yourself."
] as const;

export const trickstersTranspositionDescription = [
  "Whenever you take the Bonus Action to create or move the illusion of your Invoke Duplicity, you can teleport, swapping places with the illusion."
] as const;

export const improvedDuplicityDescription = [
  "The illusion of your Invoke Duplicity has grown more powerful in the following ways.",
  "<strong>Shared Distraction.</strong> When you and your allies make attack rolls against a creature within 5 feet of the illusion, the attack rolls have <link:Advantage>Advantage</link>.",
  "<strong>Healing Illusion.</strong> When the illusion ends, you or a creature of your choice within 5 feet of it regains a number of Hit Points equal to your Cleric level."
] as const;

export const radianceOfTheDawnDescription = [
  "As a Magic action, you present your Holy Symbol and expend a use of your Channel Divinity to emit a flash of light in a 30-foot <link:Emanation>Emanation</link> originating from yourself.",
  "Any magical Darkness, such as that created by the <spell:Darkness>Darkness</spell> spell, in that area is dispelled.",
  "Additionally, each creature of your choice in that area must make a <link:Constitution Saving Throw>Constitution saving throw</link>, taking <link:Radiant>Radiant</link> damage equal to <strong>2d10</strong> plus your Cleric level on a failed save or half as much damage on a successful one."
] as const;

export const wardingFlareDescription = [
  "When a creature that you can see within 30 feet of yourself makes an attack roll, you can take a Reaction to impose <link:Disadvantage>Disadvantage</link> on the attack roll, causing light to flare before it hits or misses.",
  "You can use this feature a number of times equal to your <link:WIS>Wisdom</link> modifier, minimum of once.",
  "You regain all expended uses when you finish a <link:long-rest>Long Rest</link>."
] as const;

export const improvedWardingFlareDescription = [
  "You regain all expended uses of your Warding Flare when you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
  "In addition, whenever you use Warding Flare, you can give the target of the triggering attack a number of <link:Temporary Hit Points>Temporary Hit Points</link> equal to <strong>2d6</strong> plus your <link:WIS>Wisdom</link> modifier."
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
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "The description is shown where it should be shown but the effect is not being tracked."
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.PRESERVE_LIFE, {
        description: [...preserveLifeDescription],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "You can find this magic action inside the Channel Divinity but the effect is not being tracked."
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.BLESSED_HEALER, {
        description: [
          "The healing spells you cast on others heal you as well.",
          "Immediately after you cast a spell with a spell slot that restores Hit Points to one creature other than you, you regain Hit Points equal to 2 plus the spell slot's level."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "The description is shown where it should be shown but the effect is not being tracked."
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.SUPREME_HEALING, {
        description: [
          "When you would normally roll one or more dice to restore Hit Points to a creature with a spell or Channel Divinity, don't roll those dice for the healing; instead use the highest number possible for each die.",
          "For example, instead of restoring <strong>2d6</strong> Hit Points to a creature with a spell, you restore 12."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "The description is shown where it should be shown but the effect is not being tracked."
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
            "Additionally, each creature of your choice in that area must make a <link:Constitution Saving Throw>Constitution saving throw</link>, taking <link:Radiant>Radiant</link> damage equal to <strong>2d10</strong> plus your Cleric level on a failed save or half as much damage on a successful one."
          ],
          trackingState: TRACKER.SEMI_TRACKED,
          trackingMessage:
            "You can find this magic action inside the Channel Divinity but the effect is not being tracked."
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.WARDING_FLARE, {
        description: [...wardingFlareDescription],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.IMPROVED_WARDING_FLARE,
        {
          description: [...improvedWardingFlareDescription],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.CORONA_OF_LIGHT, {
        description: [...coronaOfLightDescription],
        trackingState: TRACKER.TRACKED
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
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.INVOKE_DUPLICITY, {
        description: [...invokeDuplicityDescription],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "You can find this magic action inside the Channel Divinity but the Move/Bonus_Action effect is not being tracked so you have to remember that."
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.TRICKSTERS_TRANSPOSITION,
        {
          description: [...trickstersTranspositionDescription],
          trackingState: TRACKER.TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.IMPROVED_DUPLICITY, {
        description: [...improvedDuplicityDescription],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "The description is being shown where it needs to be but the effects are not being tracked."
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
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.WAR_PRIEST, {
        description: [
          "As a Bonus Action, you can make one attack with a weapon or an Unarmed Strike.",
          "You can use this Bonus Action a number of times equal to your <link:WIS>Wisdom</link> modifier, minimum of once.",
          "You regain all expended uses when you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.GUIDED_STRIKE, {
        description: [
          "When you or a creature within 30 feet of you misses with an attack roll, you can expend one use of your Channel Divinity and give that roll a +10 bonus, potentially causing it to hit.",
          "When you use this feature to benefit another creature's attack roll, you must take a Reaction to do so."
        ],
        trackingState: TRACKER.SEMI_TRACKED,
        trackingMessage:
          "The reaciton works exactly as described. But for the self-ish benefit since it does not use a reaction you have to remove one Channel Divinity yourself."
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.WAR_GODS_BLESSING, {
        description: [
          "You can expend a use of your Channel Divinity to cast <spell:Shield of Faith>Shield of Faith</spell> or <spell:Spiritual Weapon>Spiritual Weapon</spell> rather than expending a spell slot.",
          "When you cast either spell in this way, the spell doesn't require <link:Concentration>Concentration</link>.",
          "Instead the spell lasts for 1 minute, but it ends early if you cast that spell again, have the <link:Incapacitated>Incapacitated</link> condition, or die."
        ],
        trackingState: TRACKER.TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.AVATAR_OF_BATTLE, {
        description: [
          "You gain <link:Resistance>Resistance</link> to <link:Bludgeoning>Bludgeoning</link>, <link:Piercing>Piercing</link>, and <link:Slashing>Slashing</link> damage."
        ],
        trackingState: TRACKER.TRACKED
      })
    ]
  },
  {
    // RHW reference: https://5e.tools/classes.html#cleric_xphb,state:sub_grave_rhw=b1
    id: "cleric-grave-domain",
    name: "Grave Domain",
    className: "Cleric",
    tagline: "Guard the Boundary of Life and Death",
    summary:
      "Grave Domain Clerics guide departed souls, oppose undeath, and delay death when their divine calling demands it.",
    features: [
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.GRAVE_DOMAIN_SPELLS, {
        description: [
          "These spells are always prepared once you reach the listed Cleric level.",
          "<strong>Level 3.</strong> <spell:Detect Evil and Good>Detect Evil and Good</spell>, <spell:False Life>False Life</spell>, <spell:Gentle Repose>Gentle Repose</spell>, <spell:Ray of Enfeeblement>Ray of Enfeeblement</spell>, <spell:Spare the Dying>Spare the Dying</spell>",
          "<strong>Level 5.</strong> <spell:Revivify>Revivify</spell>, <spell:Vampiric Touch>Vampiric Touch</spell>",
          "<strong>Level 7.</strong> <spell:Blight>Blight</spell>, <spell:Death Ward>Death Ward</spell>",
          "<strong>Level 9.</strong> <spell:Dispel Evil and Good>Dispel Evil and Good</spell>, <spell:Raise Dead>Raise Dead</spell>"
        ],
        trackingState: TRACKER.NOT_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.CIRCLE_OF_MORTALITY, {
        description: [
          "<strong>Pull of Death.</strong> Once per turn, when a spell you cast or an attack roll you hit with damages a creature below its Hit Point maximum, deal an extra <strong>1d4</strong> Necrotic damage to it. This becomes <strong>1d6</strong> at Cleric level 11.",
          "<strong>Return to Life.</strong> You can cast <spell:Spare the Dying>Spare the Dying</spell> as a Bonus Action. When a spell or Channel Divinity restores Hit Points to a creature at 0 Hit Points, use the maximum result for each healing die instead of rolling it."
        ],
        trackingState: TRACKER.NOT_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.PATH_TO_THE_GRAVE, {
        description: [
          "As a Bonus Action, present your Holy Symbol and spend one Channel Divinity use to curse a creature you can see within 30 feet. Until your next turn starts, it has <link:Disadvantage>Disadvantage</link> on attack rolls and saving throws.",
          "When you or an ally you can see hits the cursed creature with an attack roll, you can end the curse without an action. That attack deals extra Necrotic or Radiant damage, your choice, equal to your Cleric level."
        ],
        trackingState: TRACKER.NOT_TRACKED
      }),
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_6,
        CLASS_FEATURE.SENTINEL_AT_DEATHS_DOOR,
        {
          description: [
            "When an attack roll hits you, or hits a Bloodied creature you can see within 60 feet, use a Reaction to halve the damage (round down). If the attack was a Critical Hit, cancel its critical-hit effects.",
            "You have uses equal to your <link:Wisdom>Wisdom</link> modifier, with a minimum of one. Recover all uses after a <link:long-rest>Long Rest</link>."
          ],
          trackingState: TRACKER.NOT_TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.DIVINE_REAPER, {
        description: [
          "<strong>Enhanced Necromancy.</strong> When casting a Necromancy spell of level 5 or lower that targets one creature, or any spell from your Grave Domain Spells table, you can spend one Channel Divinity use to include a second creature within range. Supply any costly or consumed Material components separately for each target.",
          "<strong>Keeper of Souls.</strong> When an enemy within 60 feet dies, restore Hit Points equal to twice your Cleric level to yourself or a creature you can see within 60 feet. You cannot use this while <link:Incapacitated>Incapacitated</link>. Recover the use after a Short or <link:long-rest>Long Rest</link>, or spend a level 6+ spell slot without an action to restore it."
        ],
        trackingState: TRACKER.NOT_TRACKED
      })
    ]
  },
  {
    // AU reference: https://5e.tools/classes.html#cleric_xphb,state:sub_arcana_au=b1
    id: "cleric-arcana-domain",
    name: "Arcana Domain",
    className: "Cleric",
    tagline: "Share the Gift of Divine Magic",
    summary:
      "Arcana Domain Clerics treat magical knowledge as a divine gift to be shared. Their gods reveal secrets that strengthen and reshape spellcasting.",
    features: [
      createSubclassFeatureRow(
        SUBCLASS_FEATURE_LEVELS.LEVEL_3,
        CLASS_FEATURE.ARCANA_DOMAIN_SPELLS,
        {
          description: [
            "These spells are always prepared once you reach the listed Cleric level.",
            "<strong>Level 3.</strong> <spell:Detect Magic>Detect Magic</spell>, <spell:Magic Missile>Magic Missile</spell>, <spell:Magic Weapon>Magic Weapon</spell>, <spell:Arcanist's Magic Aura>Nystul's Magic Aura</spell>",
            "<strong>Level 5.</strong> <spell:Counterspell>Counterspell</spell>, <spell:Dispel Magic>Dispel Magic</spell>",
            "<strong>Level 7.</strong> <spell:Arcane Eye>Arcane Eye</spell>, <spell:Secret Chest>Leomund's Secret Chest</spell>",
            "<strong>Level 9.</strong> <spell:Bigby's Hand>Bigby's Hand</spell>, <spell:Teleportation Circle>Teleportation Circle</spell>"
          ],
          trackingState: TRACKER.NOT_TRACKED
        }
      ),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.MODIFY_MAGIC, {
        description: [
          "When casting a spell, you may spend one Channel Divinity use to apply one of these modifications, requiring no action.",
          "<strong>Fortifying Spell.</strong> Give one spell target <link:Temporary Hit Points>Temporary Hit Points</link> equal to <strong>2d8</strong> plus your Cleric level.",
          "<strong>Tenacious Spell.</strong> If a spell you cast requires a saving throw and a creature you can see succeeds, roll <strong>1d6</strong> and subtract it from that target's first saving throw against the spell."
        ],
        trackingState: TRACKER.NOT_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_3, CLASS_FEATURE.STUDENT_OF_ARCANA, {
        description: [
          "<strong>Magical Knowledge.</strong> Gain proficiency in Arcana or another skill available to a level-1 Cleric.",
          "<strong>Cantrips.</strong> Learn two Wizard cantrips of your choice. Each time you gain a Cleric level, you may replace one of them with another Wizard cantrip."
        ],
        trackingState: TRACKER.NOT_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_6, CLASS_FEATURE.DISPELLING_RECOVERY, {
        description: [
          "Immediately after spending a spell slot to cast a spell that restores Hit Points or ends a condition on a creature, you may cast <spell:Dispel Magic>Dispel Magic</spell> without a slot as part of the same action, Bonus Action, or Reaction.",
          "After using this feature, finish a Short or <link:long-rest>Long Rest</link> to recover it. Alternatively, spend one Channel Divinity use to restore it without taking an action."
        ],
        trackingState: TRACKER.NOT_TRACKED
      }),
      createSubclassFeatureRow(SUBCLASS_FEATURE_LEVELS.LEVEL_17, CLASS_FEATURE.MAGICAL_MASTERY, {
        description: [
          "Learn four Wizard spells: one each of levels 6, 7, 8, and 9. They are always prepared. Each time you gain a Cleric level, you may replace one with a Wizard spell of the same spell level."
        ],
        trackingState: TRACKER.NOT_TRACKED
      })
    ]
  }
];
