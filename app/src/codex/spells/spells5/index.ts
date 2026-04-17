import {
  ACTION_TYPE,
  DURATION,
  DAMAGE_TYPE,
  DICE,
  ENTRY_CATEGORIES,
  MAGIC_SCHOOL,
  SPELL_COMPONENT,
  SPELL_LIST_CLASS
} from "../../entries/enums";
import type { SpellEntry } from "../../entries/types";

export const animateObjects: SpellEntry = {
  id: "spell-animate-objects",
  name: "Animate Objects",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Objects come to life at your command. Choose up to ten nonmagical objects within range that aren't being worn or carried. Medium targets count as two objects, Large targets count as four objects, and Huge targets count as eight objects. You can't animate any object larger than Huge. Each target animates and becomes a creature under your control until the spell ends or until reduced to 0 Hit Points.",
    "As a Bonus Action, you can mentally command any creature you made with this spell if the creature is within 500 feet of you. If you control multiple creatures, you can command any or all of them at the same time, issuing the same command to each one. You decide what action the creature will take and where it will move during its next turn, or you can issue a general command, such as to guard a particular chamber or corridor. If you issue no commands, the creature only defends itself against hostile creatures. Once given an order, the creature continues to follow it until its task is complete.",
    "<strong>Animated Object Statistics.</strong>",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Tiny.</strong> 20 HP, AC 18, +8 to hit, 1d4 + 4 damage, Str 4, Dex 18.",
        "<strong>Small.</strong> 25 HP, AC 16, +6 to hit, 1d8 + 2 damage, Str 6, Dex 14.",
        "<strong>Medium.</strong> 40 HP, AC 13, +5 to hit, 2d6 + 1 damage, Str 10, Dex 12.",
        "<strong>Large.</strong> 50 HP, AC 10, +6 to hit, 2d10 + 2 damage, Str 14, Dex 10.",
        "<strong>Huge.</strong> 80 HP, AC 10, +8 to hit, 2d12 + 4 damage, Str 18, Dex 6."
      ]
    },
    "An animated object is a Construct with AC, Hit Points, attacks, Strength, and Dexterity determined by its size. Its Constitution is 10, its Intelligence and Wisdom are 3, and its Charisma is 1. Its Speed is 30 feet. If the object lacks legs or other appendages it can use for locomotion, it instead has a flying Speed of 30 feet and can hover. If the object is securely attached to a surface or larger object, such as a chain bolted to a wall, its Speed is 0. It has Blindsight with a range of 30 feet and is blind beyond that distance. When the animated object drops to 0 Hit Points, it reverts to its original object form, and any remaining damage carries over to that form.",
    "If you command an object to attack, it can make a single melee attack against a creature within 5 feet of it. It makes a slam attack with an attack bonus and Bludgeoning damage determined by its size. The DM might rule that a specific object inflicts Slashing or Piercing damage based on its form.",
    "<strong>At Higher Levels.</strong> If you cast this spell using a spell slot of 6th level or higher, you can animate two additional objects for each slot level above 5th."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 5
};

export const antilifeShell: SpellEntry = {
  id: "spell-antilife-shell",
  name: "Antilife Shell",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (10-foot radius)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "A shimmering barrier extends out from you in a 10-foot radius and moves with you, remaining centered on you and hedging out creatures other than Undead and Constructs.",
    "The barrier lasts for the duration. The barrier prevents an affected creature from passing or reaching through. An affected creature can cast spells or make attacks with ranged or reach weapons through the barrier.",
    "If you move so that an affected creature is forced to pass through the barrier, the spell ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 5
};

export const awaken: SpellEntry = {
  id: "spell-awaken",
  name: "Awaken",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.EIGHT_HOURS],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "After spending the casting time tracing magical pathways within a precious gemstone, you touch a Huge or smaller Beast or Plant. The target must have either no Intelligence score or an Intelligence of 3 or less.",
    "The target gains an Intelligence of 10. The target also gains the ability to speak one language you know. If the target is a Plant, it gains the ability to move its limbs, roots, vines, creepers, and so forth, and it gains senses similar to a Human's. Your DM chooses statistics appropriate for the awakened plant, such as the statistics for the Awakened Shrub or the Awakened Tree.",
    "The awakened Beast or Plant is Charmed by you for 30 days or until you and your companions do anything harmful to it. When the Charmed condition ends, the awakened creature chooses whether to remain friendly to you based on how you treated it while it was Charmed."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID],
  spellLevel: 5
};

export const banishingSmite: SpellEntry = {
  id: "spell-banishing-smite",
  name: "Banishing Smite",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "The next time you hit a creature with a weapon attack before this spell ends, your weapon crackles with force, and the attack deals an extra 5d10 Force damage to the target. Additionally, if this attack reduces the target to 50 Hit Points or fewer, you banish it.",
    "If the target is native to a different plane of existence than the one you're on, the target disappears, returning to its home plane. If the target is native to the plane you're on, the creature vanishes into a harmless demiplane. While there, the target is Incapacitated. It remains there until the spell ends, at which point the target reappears in the space it left or in the nearest unoccupied space if that space is occupied."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE]
  ],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 5
};

export const bigbysHand: SpellEntry = {
  id: "spell-bigbys-hand",
  name: "Bigby's Hand",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You create a Large hand of shimmering, translucent force in an unoccupied space that you can see within range. The hand lasts for the spell's duration, and it moves at your command, mimicking the movements of your own hand.",
    "The hand is an object that has AC 20 and Hit Points equal to your Hit Point maximum. If it drops to 0 Hit Points, the spell ends. It has a Strength of 26 (+8) and a Dexterity of 10 (+0). The hand doesn't fill its space.",
    "When you cast the spell and as a Bonus Action on your subsequent turns, you can move the hand up to 60 feet and then cause one of the following effects with it.",
    {
      type: "list",
      style: "number",
      items: [
        "<strong>Clenched Fist.</strong> The hand strikes one creature or object within 5 feet of it. Make a melee spell attack for the hand using your game statistics. On a hit, the target takes 4d8 Force damage.",
        "<strong>Forceful Hand.</strong> The hand attempts to push a creature within 5 feet of it in a direction you choose. Make a check with the hand's Strength contested by the Strength (Athletics) check of the target. If the target is Medium or smaller, you have Advantage on the check. If you succeed, the hand pushes the target up to 5 feet plus a number of feet equal to five times your spellcasting ability modifier. The hand moves with the target to remain within 5 feet of it.",
        "<strong>Grasping Hand.</strong> The hand attempts to grapple a Huge or smaller creature within 5 feet of it. You use the hand's Strength score to resolve the grapple. If the target is Medium or smaller, you have Advantage on the check. While the hand is grappling the target, you can use a Bonus Action to have the hand crush it. When you do so, the target takes Bludgeoning damage equal to 2d6 + your spellcasting ability modifier.",
        "<strong>Interposing Hand.</strong> The hand interposes itself between you and a creature you choose until you give the hand a different command. The hand moves to stay between you and the target, providing you with half cover against the target. The target can't move through the hand's space if its Strength score is less than or equal to the hand's Strength score. If its Strength score is higher than the hand's Strength score, the target can move toward you through the hand's space, but that space is difficult terrain for the target."
      ]
    },
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, the damage from the Clenched Fist option increases by 2d8 and the damage from the Grasping Hand option increases by 2d6 for each slot level above 5th."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const circleOfPower: SpellEntry = {
  id: "spell-circle-of-power",
  name: "Circle of Power",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot radius)",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Divine energy radiates from you, distorting and diffusing magical energy within 30 feet of you. Until the spell ends, the sphere moves with you, centered on you. For the duration, each friendly creature in the area, including you, has Advantage on saving throws against spells and other magical effects.",
    "Additionally, when an affected creature succeeds on a saving throw made against a spell or magical effect that allows it to make a saving throw to take only half damage, it instead takes no damage if it succeeds on the save."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 5
};

export const cloudkill: SpellEntry = {
  id: "spell-cloudkill",
  name: "Cloudkill",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You create a 20-foot-radius sphere of poisonous, yellow-green fog centered on a point you choose within range. The fog spreads around corners. It lasts for the duration or until strong wind disperses the fog, ending the spell. Its area is heavily obscured.",
    "When a creature enters the spell's area for the first time on a turn or starts its turn there, that creature must make a Constitution saving throw. The creature takes 5d8 Poison damage on a failed save, or half as much damage on a successful one. Creatures are affected even if they hold their breath or don't need to breathe.",
    "The fog moves 10 feet away from you at the start of each of your turns, rolling along the surface of the ground. The vapors, being heavier than air, sink to the lowest level of the land, even pouring down openings.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d8 for each slot level above 5th."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.POISON],
    [DICE.D8, DAMAGE_TYPE.POISON],
    [DICE.D8, DAMAGE_TYPE.POISON],
    [DICE.D8, DAMAGE_TYPE.POISON],
    [DICE.D8, DAMAGE_TYPE.POISON]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const commune: SpellEntry = {
  id: "spell-commune",
  name: "Commune",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 minute"],
  ritual: true,
  description: [
    "You contact your deity or a divine proxy and ask up to three questions that can be answered with a yes or no. You must ask your questions before the spell ends. You receive a correct answer for each question.",
    "Divine beings aren't necessarily omniscient, so you might receive \"unclear\" as an answer if a question pertains to information that lies beyond the deity's knowledge. In a case where a one-word answer could be misleading or contrary to the deity's interests, the DM might offer a short phrase as an answer instead.",
    "If you cast the spell two or more times before finishing your next Long Rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer. The DM makes this roll in secret."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 5
};

export const communeWithCity: SpellEntry = {
  id: "spell-commune-with-city",
  name: "Commune with City",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You briefly become one with the city and gain knowledge of the surrounding area. Aboveground, this spell gives you knowledge of the area within 1 mile of you. In sewers and other underground settings, you gain knowledge of the area within 600 feet of you.",
    "You instantly gain knowledge of up to three facts of your choice about any of the following subjects as they relate to the area:",
    {
      type: "list",
      style: "bullet",
      items: [
        "Terrain and bodies of water.",
        "Prevalent buildings, plants, animals, or intelligent creatures.",
        "Powerful, CR 1 or higher, Celestials, Fey, Fiends, Elementals, or Undead.",
        "Influences from other planes of existence.",
        "Electrical currents, wireless signals, and active transit lines and tracks."
      ]
    },
    "For example, you could determine the location of powerful Undead in the area, the location of major sources of electrical power or interference, and the location of any nearby parks."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const communeWithNature: SpellEntry = {
  id: "spell-commune-with-nature",
  name: "Commune with Nature",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  ritual: true,
  description: [
    "You briefly become one with nature and gain knowledge of the surrounding territory. In the outdoors, the spell gives you knowledge of the land within 3 miles of you. In caves and other natural underground settings, the radius is limited to 300 feet. The spell doesn't function where nature has been replaced by construction, such as in dungeons and towns.",
    "You instantly gain knowledge of up to three facts of your choice about any of the following subjects as they relate to the area:",
    {
      type: "list",
      style: "bullet",
      items: [
        "Terrain and bodies of water.",
        "Prevalent plants, minerals, animals, or peoples.",
        "Powerful Celestials, Fey, Fiends, Elementals, or Undead.",
        "Influence from other planes of existence.",
        "Buildings."
      ]
    },
    "For example, you could determine the location of powerful Undead in the area, the location of major sources of safe drinking water, and the location of any nearby towns."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 5
};

export const coneOfCold: SpellEntry = {
  id: "spell-cone-of-cold",
  name: "Cone of Cold",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (60-foot cone)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "A blast of cold air erupts from your hands. Each creature in a 60-foot cone must make a Constitution saving throw. A creature takes 8d8 Cold damage on a failed save, or half as much damage on a successful one. A creature killed by this spell becomes a frozen statue until it thaws.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d8 for each slot level above 5th."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.COLD],
    [DICE.D8, DAMAGE_TYPE.COLD],
    [DICE.D8, DAMAGE_TYPE.COLD],
    [DICE.D8, DAMAGE_TYPE.COLD],
    [DICE.D8, DAMAGE_TYPE.COLD],
    [DICE.D8, DAMAGE_TYPE.COLD],
    [DICE.D8, DAMAGE_TYPE.COLD],
    [DICE.D8, DAMAGE_TYPE.COLD]
  ],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const conjureElemental: SpellEntry = {
  id: "spell-conjure-elemental",
  name: "Conjure Elemental",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You call forth an elemental servant. Choose an area of air, earth, fire, or water that fills a 10-foot cube within range. An Elemental of Challenge Rating 5 or lower appropriate to the area you chose appears in an unoccupied space within 10 feet of it. For example, a Fire Elemental emerges from a bonfire, and an Earth Elemental rises up from the ground. The elemental disappears when it drops to 0 Hit Points or when the spell ends.",
    "The elemental is friendly to you and your companions for the duration. Roll Initiative for the elemental, which has its own turns. It obeys any verbal commands that you issue to it, no action required by you. If you don't issue any commands to the elemental, it defends itself from hostile creatures but otherwise takes no actions.",
    "If your Concentration is broken, the elemental doesn't disappear. Instead, you lose control of the elemental, it becomes hostile toward you and your companions, and it might attack. An uncontrolled elemental can't be dismissed by you, and it disappears 1 hour after you summoned it. The DM has the elemental's statistics.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, the Challenge Rating increases by 1 for each slot level above 5th."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const conjureVolley: SpellEntry = {
  id: "spell-conjure-volley",
  name: "Conjure Volley",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You fire a piece of nonmagical ammunition from a ranged weapon or throw a nonmagical weapon into the air and choose a point within range. Hundreds of duplicates of the ammunition or weapon fall in a volley from above and then disappear. Each creature in a 40-foot-radius, 20-foot-high cylinder centered on that point must make a Dexterity saving throw. A creature takes 8d8 damage on a failed save, or half as much damage on a successful one. The damage type is the same as that of the ammunition or weapon."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.RANGER],
  spellLevel: 5
};

export const conjureVrock: SpellEntry = {
  id: "spell-conjure-vrock",
  name: "Conjure Vrock",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You summon a vrock that appears in an unoccupied space you can see within range. The vrock disappears when it drops to 0 Hit Points or when the spell ends.",
    "The vrock's attitude depends on the value of the gem used as a material component for this spell. Roll Initiative for the vrock, which has its own turns. At the start of the vrock's turn, the DM makes a secret Charisma check on your behalf, with a bonus equal to the gem's value divided by 20. The check DC starts at 10 and increases by 2 each round. You can issue orders to the vrock and have it obey you as long as you succeed on the Charisma check.",
    "If the check fails, the spell no longer requires Concentration and the vrock is no longer under your control. The vrock takes no actions on its next turn and uses its telepathy to tell any creature it can see that it will fight in exchange for treasure. The creature that gives the vrock the most expensive gem can command it for the next 1d6 rounds. At the end of that time, it offers the bargain again. If no one offers the vrock treasure before its next turn begins, it attacks the nearest creatures for 1d6 rounds before returning to the Abyss.",
    "As part of casting the spell, you can scribe a circle on the ground using the blood of an intelligent Humanoid slain within the past 24 hours. The circle is large enough to encompass your space. The summoned vrock cannot cross the circle or target anyone in it while the spell lasts."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const contactOtherPlane: SpellEntry = {
  id: "spell-contact-other-plane",
  name: "Contact Other Plane",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: ["1 minute"],
  ritual: true,
  description: [
    "You mentally contact a demigod, the spirit of a long-dead sage, or some other mysterious entity from another plane. Contacting this extraplanar intelligence can strain or even break your mind. When you cast this spell, make a DC 15 Intelligence saving throw. On a failure, you take 6d6 Psychic damage and are insane until you finish a Long Rest. While insane, you can't take actions, can't understand what other creatures say, can't read, and speak only in gibberish. A Greater Restoration spell cast on you ends this effect.",
    'On a successful save, you can ask the entity up to five questions. You must ask your questions before the spell ends. The DM answers each question with one word, such as "yes," "no," "maybe," "never," "irrelevant," or "unclear," if the entity doesn\'t know the answer to the question. If a one-word answer would be misleading, the DM might instead offer a short phrase as an answer.'
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const contagion: SpellEntry = {
  id: "spell-contagion",
  name: "Contagion",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["7 days"],
  description: [
    "Your touch inflicts disease. Make a melee spell attack against a creature within your reach. On a hit, the target is Poisoned.",
    "At the end of each of the Poisoned target's turns, the target must make a Constitution saving throw. If the target succeeds on three of these saves, it is no longer Poisoned, and the spell ends. If the target fails three of these saves, the target is no longer Poisoned, but you choose one of the diseases below. The target is subjected to the chosen disease for the spell's duration.",
    "Since this spell induces a natural disease in its target, any effect that removes a disease or otherwise ameliorates a disease's effects applies to it.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Blinding Sickness.</strong> Pain grips the creature's mind, and its eyes turn milky white. The creature has Disadvantage on Wisdom checks and Wisdom saving throws and is Blinded.",
        "<strong>Filth Fever.</strong> A raging fever sweeps through the creature's body. The creature has Disadvantage on Strength checks, Strength saving throws, and attack rolls that use Strength.",
        "<strong>Flesh Rot.</strong> The creature's flesh decays. The creature has Disadvantage on Charisma checks and Vulnerability to all damage.",
        "<strong>Mindfire.</strong> The creature's mind becomes feverish. The creature has Disadvantage on Intelligence checks and Intelligence saving throws, and the creature behaves as if under the effects of the Confusion spell during combat.",
        "<strong>Seizure.</strong> The creature is overcome with shaking. The creature has Disadvantage on Dexterity checks, Dexterity saving throws, and attack rolls that use Dexterity.",
        "<strong>Slimy Doom.</strong> The creature begins to bleed uncontrollably. The creature has Disadvantage on Constitution checks and Constitution saving throws. In addition, whenever the creature takes damage, it is Stunned until the end of its next turn."
      ]
    }
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 5
};

export const controlWinds: SpellEntry = {
  id: "spell-control-winds",
  name: "Control Winds",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "300 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You take control of the air in a 100-foot cube that you can see within range. Choose one of the following effects when you cast the spell. The effect lasts for the spell's duration unless you use your action on a later turn to switch to a different effect. You can also use your action to temporarily halt the effect or to restart one you've halted.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Gusts.</strong> A wind picks up within the cube, continually blowing in a horizontal direction that you choose. You choose the intensity of the wind: calm, moderate, or strong. If the wind is moderate or strong, ranged weapon attacks that pass through it or that are made against targets within the cube have Disadvantage on their attack rolls. If the wind is strong, any creature moving against the wind must spend 1 extra foot of movement for each foot moved.",
        "<strong>Downdraft.</strong> You cause a sustained blast of strong wind to blow downward from the top of the cube. Ranged weapon attacks that pass through the cube or that are made against targets within it have Disadvantage on their attack rolls. A creature must make a Strength saving throw if it flies into the cube for the first time on a turn or starts its turn there flying. On a failed save, the creature is knocked Prone.",
        "<strong>Updraft.</strong> You cause a sustained updraft within the cube, rising upward from the cube's bottom edge. Creatures that end a fall within the cube take only half damage from the fall. When a creature in the cube makes a vertical jump, the creature can jump up to 10 feet higher than normal."
      ]
    }
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const createSpelljammingHelm: SpellEntry = {
  id: "spell-create-spelljamming-helm",
  name: "Create Spelljamming Helm",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "Holding the rod used in the casting of the spell, you touch a Large or smaller chair that is unoccupied. The rod disappears, and the chair is transformed into a Spelljamming Helm."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const creation: SpellEntry = {
  id: "spell-creation",
  name: "Creation",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Special"],
  description: [
    "You pull wisps of shadow material from the Shadowfell to create a nonliving object of vegetable matter within range: soft goods, rope, wood, or something similar. You can also use this spell to create mineral objects such as stone, crystal, or metal. The object created must be no larger than a 5-foot cube, and the object must be of a form and material that you have seen before.",
    "The duration depends on the object's material. If the object is composed of multiple materials, use the shortest duration.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Vegetable matter.</strong> 1 day.",
        "<strong>Stone or crystal.</strong> 12 hours.",
        "<strong>Precious metals.</strong> 1 hour.",
        "<strong>Gems.</strong> 10 minutes.",
        "<strong>Adamantine or Mithral.</strong> 1 minute."
      ]
    },
    "Using any material created by this spell as another spell's material component causes that spell to fail.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, the cube increases by 5 feet for each slot level above 5th."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const danseMacabre: SpellEntry = {
  id: "spell-danse-macabre",
  name: "Danse Macabre",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "Threads of dark power leap from your fingers to pierce up to five Small or Medium corpses you can see within range. Each corpse immediately stands up and becomes Undead. You decide whether it is a zombie or a skeleton, the statistics for zombies and skeletons are in the Monster Manual, and it gains a bonus to its attack and damage rolls equal to your spellcasting ability modifier.",
    "You can use a Bonus Action to mentally command the creatures you make with this spell, issuing the same command to all of them. To receive the command, a creature must be within 60 feet of you. You decide what action the creatures will take and where they will move during their next turn, or you can issue a general command, such as to guard a chamber or passageway against your foes. If you issue no commands, the creatures do nothing except defend themselves against hostile creatures. Once given an order, the creatures continue to follow it until their task is complete.",
    "The creatures are under your control until the spell ends, after which they become inanimate once more.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, you animate up to two additional corpses for each slot level above 5th."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const dawn: SpellEntry = {
  id: "spell-dawn",
  name: "Dawn",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "The light of dawn shines down on a location you specify within range. Until the spell ends, a 30-foot-radius, 40-foot-high cylinder of bright light glimmers there. This light is sunlight. When the cylinder appears, each creature in it must make a Constitution saving throw, taking 4d10 Radiant damage on a failed save, or half as much damage on a successful one.",
    "A creature must also make this saving throw whenever it ends its turn in the cylinder. If you're within 60 feet of the cylinder, you can move it up to 60 feet as a Bonus Action on your turn."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.RADIANT],
    [DICE.D10, DAMAGE_TYPE.RADIANT],
    [DICE.D10, DAMAGE_TYPE.RADIANT],
    [DICE.D10, DAMAGE_TYPE.RADIANT]
  ],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const destructiveWave: SpellEntry = {
  id: "spell-destructive-wave",
  name: "Destructive Wave",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot radius)",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You strike the ground, creating a burst of divine energy that ripples outward from you. Each creature you choose within 30 feet of you must succeed on a Constitution saving throw or take 5d6 Thunder damage, as well as 5d6 Radiant or Necrotic damage, your choice, and be knocked Prone. A creature that succeeds on its saving throw takes half as much damage and isn't knocked Prone."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 5
};

export const dispelEvilAndGood: SpellEntry = {
  id: "spell-dispel-evil-and-good",
  name: "Dispel Evil and Good",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Shimmering energy surrounds and protects you from Fey, Undead, and creatures originating from beyond the Material Plane. For the duration, Celestials, Elementals, Fey, Fiends, and Undead have Disadvantage on attack rolls against you. You can end the spell early by using either of the following special functions.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Break Enchantment.</strong> As your action, you touch a creature you can reach that is Charmed, Frightened, or possessed by a Celestial, an Elemental, a Fey, a Fiend, or an Undead. The creature you touch is no longer Charmed, Frightened, or possessed by such creatures.",
        "<strong>Dismissal.</strong> As your action, make a melee spell attack against a Celestial, an Elemental, a Fey, a Fiend, or an Undead you can reach. On a hit, you attempt to drive the creature back to its home plane. The creature must succeed on a Charisma saving throw or be sent back to its home plane if it isn't there already. If it is already on its home plane, Undead are sent to the Shadowfell, and Fey are sent to the Feywild."
      ]
    }
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 5
};

export const dominatePerson: SpellEntry = {
  id: "spell-dominate-person",
  name: "Dominate Person",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You attempt to beguile a Humanoid that you can see within range. It must succeed on a Wisdom saving throw or be Charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has Advantage on the saving throw.",
    'While the target is Charmed, you have a telepathic link with it as long as the two of you are on the same plane of existence. You can use this telepathic link to issue commands to the creature while you are conscious, no action required, which it does its best to obey. You can specify a simple and general course of action, such as "Attack that creature," "Run over there," or "Fetch that object." If the creature completes the order and doesn\'t receive further direction from you, it defends and preserves itself to the best of its ability.',
    "You can use your action to take total and precise control of the target. Until the end of your next turn, the creature takes only the actions you choose, and doesn't do anything that you don't allow it to do. During this time, you can also cause the creature to use a Reaction, but this requires you to use your own Reaction as well.",
    "Each time the target takes damage, it makes a new Wisdom saving throw against the spell. If the saving throw succeeds, the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a 6th-level spell slot, the duration is Concentration, up to 10 minutes. When you use a 7th-level spell slot, the duration is Concentration, up to 1 hour. When you use a spell slot of 8th level or higher, the duration is Concentration, up to 8 hours."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const dream: SpellEntry = {
  id: "spell-dream",
  name: "Dream",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Special",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["8 hours"],
  description: [
    "This spell shapes a creature's dreams. Choose a creature known to you as the target of this spell. The target must be on the same plane of existence as you. Creatures that don't sleep, such as elves, can't be contacted by this spell. You, or a willing creature you touch, enters a trance state, acting as a messenger. While in the trance, the messenger is aware of their surroundings, but can't take actions or move.",
    "If the target is asleep, the messenger appears in the target's dreams and can converse with the target as long as it remains asleep, through the duration of the spell. The messenger can also shape the environment of the dream, creating landscapes, objects, and other images. The messenger can emerge from the trance at any time, ending the effect of the spell early. The target recalls the dream perfectly upon waking. If the target is awake when you cast the spell, the messenger knows it and can either end the trance and the spell or wait for the target to fall asleep, at which point the messenger appears in the target's dreams.",
    "You can make the messenger appear monstrous and terrifying to the target. If you do, the messenger can deliver a message of no more than ten words and then the target must make a Wisdom saving throw. On a failed save, echoes of the phantasmal monstrosity spawn a nightmare that lasts the duration of the target's sleep and prevents the target from gaining any benefit from that rest. In addition, when the target wakes up, it takes 3d6 Psychic damage.",
    "If you have a body part, lock of hair, clipping from a nail, or similar portion of the target's body, the target makes its saving throw with Disadvantage."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const enervation: SpellEntry = {
  id: "spell-enervation",
  name: "Enervation",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A tendril of inky darkness reaches out from you, touching a creature you can see within range to drain life from it. The target must make a Dexterity saving throw. On a successful save, the target takes 2d8 Necrotic damage, and the spell ends. On a failed save, the target takes 4d8 Necrotic damage, and until the spell ends, you can use your action on each of your turns to automatically deal 4d8 Necrotic damage to the target.",
    "The spell ends if you use your action to do anything else, if the target is ever outside the spell's range, or if the target has Total Cover from you. Whenever the spell deals damage to a target, you regain Hit Points equal to half the amount of Necrotic damage the target takes.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d8 for each slot level above 5th."
  ],
  isHealingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const farStep: SpellEntry = {
  id: "spell-far-step",
  name: "Far Step",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You teleport up to 60 feet to an unoccupied space you can see. On each of your turns before the spell ends, you can use a Bonus Action to teleport in this way again."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const flameStrike: SpellEntry = {
  id: "spell-flame-strike",
  name: "Flame Strike",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "A vertical column of divine fire roars down from the heavens in a location you specify. Each creature in a 10-foot-radius, 40-foot-high cylinder centered on a point within range must make a Dexterity saving throw. A creature takes 4d6 Fire damage and 4d6 Radiant damage on a failed save, or half as much damage on a successful one.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, the Fire damage or the Radiant damage, your choice, increases by 1d6 for each slot level above 5th."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT]
  ],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 5
};

export const geas: SpellEntry = {
  id: "spell-geas",
  name: "Geas",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["30 days"],
  description: [
    "You place a magical command on a creature that you can see within range, forcing it to carry out some service or refrain from some action or course of activity as you decide.",
    "If the creature can understand you, it must succeed on a Wisdom saving throw or become Charmed by you for the duration. While the creature is Charmed by you, it takes 5d10 Psychic damage each time it acts in a manner directly counter to your instructions, but no more than once each day. A creature that can't understand you is unaffected by the spell.",
    "You can issue any command you choose, short of an activity that would result in certain death. Should you issue a suicidal command, the spell ends. You can end the spell early by using an action to dismiss it. A Remove Curse, Greater Restoration, or Wish spell also ends it.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th or 8th level, the duration is 1 year. When you cast this spell using a spell slot of 9th level, the spell lasts until it is ended by one of the spells mentioned above."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC]
  ],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 5
};

export const greaterRestoration: SpellEntry = {
  id: "spell-greater-restoration",
  name: "Greater Restoration",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You imbue a creature you touch with positive energy to undo a debilitating effect. You can reduce the target's Exhaustion level by one, or end one of the following effects on the target:",
    {
      type: "list",
      style: "bullet",
      items: [
        "One effect that Charmed or Petrified the target.",
        "One curse, including the target's Attunement to a cursed magic item.",
        "Any reduction to one of the target's ability scores.",
        "One effect reducing the target's Hit Point maximum."
      ]
    }
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER
  ],
  spellLevel: 5
};

export const hallow: SpellEntry = {
  id: "spell-hallow",
  name: "Hallow",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.TWENTY_FOUR_HOURS],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Until dispelled"],
  description: [
    "You touch a point and infuse an area around it with holy, or unholy, power. The area can have a radius up to 60 feet, and the spell fails if the radius includes an area already under the effect of a Hallow spell. The affected area is subject to the following effects.",
    "First, Celestials, Elementals, Fey, Fiends, and Undead can't enter the area, nor can such creatures Charm, Frighten, or possess creatures within it. Any creature Charmed, Frightened, or possessed by such a creature is no longer Charmed, Frightened, or possessed upon entering the area. You can exclude one or more of those types of creatures from this effect.",
    "Second, you can bind an extra effect to the area. Choose the effect from the following list, or choose an effect offered by the DM. Some of these effects apply to creatures in the area. You can designate whether the effect applies to all creatures, creatures that follow a specific deity or leader, or creatures of a specific sort, such as orcs or trolls. When a creature that would be affected enters the spell's area for the first time on a turn or starts its turn there, it can make a Charisma saving throw. On a success, the creature ignores the extra effect until it leaves the area.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Courage.</strong> Affected creatures can't be Frightened while in the area.",
        "<strong>Darkness.</strong> Darkness fills the area. Normal light, as well as magical light created by spells of a lower level than the slot you used to cast this spell, can't illuminate the area.",
        "<strong>Daylight.</strong> Bright light fills the area. Magical darkness created by spells of a lower level than the slot you used to cast this spell can't extinguish the light.",
        "<strong>Energy Protection.</strong> Affected creatures in the area have Resistance to one damage type of your choice, except for Bludgeoning, Piercing, or Slashing.",
        "<strong>Energy Vulnerability.</strong> Affected creatures in the area have Vulnerability to one damage type of your choice, except for Bludgeoning, Piercing, or Slashing.",
        "<strong>Everlasting Rest.</strong> Dead bodies interred in the area can't be turned into Undead.",
        "<strong>Extradimensional Interference.</strong> Affected creatures can't move or travel using teleportation or by extradimensional or interplanar means.",
        "<strong>Fear.</strong> Affected creatures are Frightened while in the area.",
        "<strong>Silence.</strong> No sound can emanate from within the area, and no sound can reach into it.",
        "<strong>Tongues.</strong> Affected creatures can communicate with any other creature in the area, even if they don't share a common language."
      ]
    }
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 5
};

export const holdMonster: SpellEntry = {
  id: "spell-hold-monster",
  name: "Hold Monster",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Choose a creature that you can see within range. The target must succeed on a Wisdom saving throw or be Paralyzed for the duration. This spell has no effect on Undead. At the end of each of its turns, the target can make another Wisdom saving throw. On a success, the spell ends on the target.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, you can target one additional creature for each slot level above 5th. The creatures must be within 30 feet of each other when you target them."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 5
};

export const holyWeapon: SpellEntry = {
  id: "spell-holy-weapon",
  name: "Holy Weapon",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You imbue a weapon you touch with holy power. Until the spell ends, the weapon emits bright light in a 30-foot radius and dim light for an additional 30 feet. In addition, weapon attacks made with it deal an extra 2d8 Radiant damage on a hit. If the weapon isn't already a magic weapon, it becomes one for the duration.",
    "As a Bonus Action on your turn, you can dismiss this spell and cause the weapon to emit a burst of radiance. Each creature of your choice that you can see within 30 feet of the weapon must make a Constitution saving throw. On a failed save, a creature takes 4d8 Radiant damage and is Blinded for 1 minute. On a successful save, a creature takes half as much damage and isn't Blinded. At the end of each of its turns, a Blinded creature can make a Constitution saving throw, ending the effect on itself on a success."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 5
};

export const immolation: SpellEntry = {
  id: "spell-immolation",
  name: "Immolation",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Flames wreathe one creature you can see within range. The target must make a Dexterity saving throw. It takes 8d6 Fire damage on a failed save, or half as much damage on a successful one. On a failed save, the target also burns for the spell's duration.",
    "The burning target sheds bright light in a 30-foot radius and dim light for an additional 30 feet. At the end of each of its turns, the target repeats the saving throw. It takes 4d6 Fire damage on a failed save, and the spell ends on a successful one. These magical flames can't be extinguished by nonmagical means.",
    "If damage from this spell kills a target, the target is turned to ash."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const infernalCalling: SpellEntry = {
  id: "spell-infernal-calling",
  name: "Infernal Calling",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "Uttering a dark incantation, you summon a devil from the Nine Hells. You choose the devil's type, which must be one of Challenge Rating 6 or lower, such as a barbed devil or a bearded devil. The devil appears in an unoccupied space that you can see within range. The devil disappears when it drops to 0 Hit Points or when the spell ends.",
    "The devil is unfriendly toward you and your companions. Roll Initiative for the devil, which has its own turns. It is under the DM's control and acts according to its nature on each of its turns, which might result in its attacking you if it thinks it can prevail, or trying to tempt you to undertake an evil act in exchange for limited service. The DM has the creature's statistics.",
    'On each of your turns, you can try to issue a verbal command to the devil, no action required by you. It obeys the command if the likely outcome is in accordance with its desires, especially if the result would draw you toward evil. Otherwise, you must make a Charisma (Deception, Intimidation, or Persuasion) check contested by its Wisdom (Insight) check. You make the check with Advantage if you say the devil\'s true name. If your check fails, the devil becomes immune to your verbal commands for the duration of the spell, though it can still carry out your commands if it chooses. If your check succeeds, the devil carries out your command, such as "attack my enemies," "explore the room ahead," or "bear this message to the queen," until it completes the activity, at which point it returns to you to report having done so.',
    "If your Concentration ends before the spell reaches its full duration, the devil doesn't disappear if it has become immune to your verbal commands. Instead, it acts in whatever manner it chooses for 3d6 minutes, and then it disappears.",
    "If you possess an individual devil's talisman, you can summon that devil if it is of the appropriate Challenge Rating plus 1, and it obeys all your commands, with no Charisma checks required.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, the Challenge Rating increases by 1 for each slot level above 5th."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const insectPlague: SpellEntry = {
  id: "spell-insect-plague",
  name: "Insect Plague",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "300 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Swarming, biting locusts fill a 20-foot-radius sphere centered on a point you choose within range. The sphere spreads around corners. The sphere remains for the duration, and its area is lightly obscured. The sphere's area is difficult terrain.",
    "When the area appears, each creature in it must make a Constitution saving throw. A creature takes 4d10 Piercing damage on a failed save, or half as much damage on a successful one. A creature must also make this saving throw when it enters the spell's area for the first time on a turn or ends its turn there.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d10 for each slot level above 5th."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.PIERCING],
    [DICE.D10, DAMAGE_TYPE.PIERCING],
    [DICE.D10, DAMAGE_TYPE.PIERCING],
    [DICE.D10, DAMAGE_TYPE.PIERCING]
  ],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER],
  spellLevel: 5
};

export const legendLore: SpellEntry = {
  id: "spell-legend-lore",
  name: "Legend Lore",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "Name or describe a person, place, or object. The spell brings to your mind a brief summary of the significant lore about the thing you named. The lore might consist of current tales, forgotten stories, or even secret lore that has never been widely known. If the thing you named isn't of legendary importance, you gain no information. The more information you already have about the thing, the more precise and detailed the information you receive is.",
    "The information you learn is accurate but might be couched in figurative language. For example, if you have a mysterious magic axe on hand, the spell might yield this information: Woe to the evildoer whose hand touches the axe, for even the haft slices the hand of the evil ones. Only a true Child of Stone, lover and beloved of Moradin, may awaken the true powers of the axe, and only with the sacred word Rudnogg on the lips."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const maelstrom: SpellEntry = {
  id: "spell-maelstrom",
  name: "Maelstrom",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A mass of 5-foot-deep water appears and swirls in a 30-foot radius centered on a point you can see within range. The point must be on ground or in a body of water. Until the spell ends, that area is difficult terrain, and any creature that starts its turn there must succeed on a Strength saving throw or take 6d6 Bludgeoning damage and be pulled 10 feet toward the center."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING]
  ],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 5
};

export const massCureWounds: SpellEntry = {
  id: "spell-mass-cure-wounds",
  name: "Mass Cure Wounds",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "A wave of healing energy washes out from a point of your choice within range. Choose up to six creatures in a 30-foot-radius sphere centered on that point. Each target regains Hit Points equal to 3d8 + your spellcasting ability modifier. This spell has no effect on Undead or Constructs.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, the healing increases by 1d8 for each slot level above 5th."
  ],
  isHealingSpell: true,
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 5
};

export const mislead: SpellEntry = {
  id: "spell-mislead",
  name: "Mislead",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You become Invisible at the same time that an illusory double of you appears where you are standing. The double lasts for the duration, but the invisibility ends if you attack or cast a spell.",
    "You can use your action to move your illusory double up to twice your Speed and make it gesture, speak, and behave in whatever way you choose.",
    "You can see through its eyes and hear through its ears as if you were located where it is. On each of your turns as a Bonus Action, you can switch from using its senses to using your own or back again. While you are using its senses, you are Blinded and Deafened in regard to your own surroundings."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const modifyMemory: SpellEntry = {
  id: "spell-modify-memory",
  name: "Modify Memory",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You attempt to reshape another creature's memories. One creature that you can see must make a Wisdom saving throw. If you are fighting the creature, it has Advantage on the saving throw. On a failed save, the target becomes Charmed by you for the duration. The Charmed target is Incapacitated and unaware of its surroundings, though it can still hear you. If it takes any damage or is targeted by another spell, this spell ends, and none of the target's memories are modified.",
    "While this charm lasts, you can affect the target's memory of an event that it experienced within the last 24 hours and that lasted no more than 10 minutes. You can permanently eliminate all memory of the event, allow the target to recall the event with perfect clarity and exacting detail, change its memory of the details of the event, or create a memory of some other event.",
    "You must speak to the target to describe how its memories are affected, and it must be able to understand your language for the modified memories to take root. Its mind fills in any gaps in the details of your description. If the spell ends before you have finished describing the modified memories, the creature's memory isn't altered. Otherwise, the modified memories take hold when the spell ends.",
    "A modified memory doesn't necessarily affect how a creature behaves, particularly if the memory contradicts the creature's natural inclinations, alignment, or beliefs. An illogical modified memory, such as implanting a memory of how much the creature enjoyed dousing itself in acid, is dismissed, perhaps as a bad dream. The DM might deem a modified memory too nonsensical to affect a creature in a significant manner.",
    "A Remove Curse or Greater Restoration spell cast on the target restores the creature's true memory.",
    "<strong>At Higher Levels.</strong> If you cast this spell using a spell slot of 6th level or higher, you can alter the target's memories of an event that took place up to 7 days ago at 6th level, 30 days ago at 7th level, 1 year ago at 8th level, or any time in the creature's past at 9th level."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const negativeEnergyFlood: SpellEntry = {
  id: "spell-negative-energy-flood",
  name: "Negative Energy Flood",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You send ribbons of negative energy at one creature you can see within range. Unless the target is Undead, it must make a Constitution saving throw, taking 5d12 Necrotic damage on a failed save, or half as much damage on a successful one. A target killed by this damage rises up as a zombie at the start of your next turn. The zombie pursues whatever creature it can see that is closest to it. Statistics for the zombie are in the Monster Manual.",
    "If you target an Undead with this spell, the target doesn't make a saving throw. Instead, roll 5d12. The target gains half the total as temporary Hit Points."
  ],
  damage: [
    [DICE.D12, DAMAGE_TYPE.NECROTIC],
    [DICE.D12, DAMAGE_TYPE.NECROTIC],
    [DICE.D12, DAMAGE_TYPE.NECROTIC],
    [DICE.D12, DAMAGE_TYPE.NECROTIC],
    [DICE.D12, DAMAGE_TYPE.NECROTIC]
  ],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const passwall: SpellEntry = {
  id: "spell-passwall",
  name: "Passwall",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  description: [
    "A passage appears at a point of your choice that you can see on a wooden, plaster, or stone surface, such as a wall, a ceiling, or a floor, within range, and lasts for the duration. You choose the opening's dimensions: up to 5 feet wide, 8 feet tall, and 20 feet deep. The passage creates no instability in a structure surrounding it.",
    "When the opening disappears, any creatures or objects still in the passage created by the spell are safely ejected to an unoccupied space nearest to the surface on which you cast the spell."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const planarBinding: SpellEntry = {
  id: "spell-planar-binding",
  name: "Planar Binding",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.HOUR],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["24 hours"],
  description: [
    "With this spell, you attempt to bind a Celestial, an Elemental, a Fey, or a Fiend to your service. The creature must be within range for the entire casting of the spell. Typically, the creature is first summoned into the center of an inverted Magic Circle in order to keep it trapped while this spell is cast. At the completion of the casting, the target must make a Charisma saving throw. On a failed save, it is bound to serve you for the duration. If the creature was summoned or created by another spell, that spell's duration is extended to match the duration of this spell.",
    "A bound creature must follow your instructions to the best of its ability. You might command the creature to accompany you on an adventure, to guard a location, or to deliver a message. The creature obeys the letter of your instructions, but if the creature is hostile to you, it strives to twist your words to achieve its own objectives. If the creature carries out your instructions completely before the spell ends, it travels to you to report this fact if you are on the same plane of existence. If you are on a different plane of existence, it returns to the place where you bound it and remains there until the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of a higher level, the duration increases to 10 days with a 6th-level slot, 30 days with a 7th-level slot, 180 days with an 8th-level slot, or 1 year and 1 day with a 9th-level spell slot."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 5
};

export const raiseDead: SpellEntry = {
  id: "spell-raise-dead",
  name: "Raise Dead",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.HOUR],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You return a dead creature you touch to life, provided that it has been dead no longer than 10 days. If the creature's soul is both willing and at liberty to rejoin the body, the creature returns to life with 1 Hit Point.",
    "This spell also neutralizes any poison and cures nonmagical diseases that affected the creature at the time it died. This spell doesn't, however, remove magical diseases, curses, or similar effects. If these aren't first removed prior to casting the spell, they take effect when the creature returns to life. The spell can't return an Undead creature to life.",
    "This spell closes all mortal wounds, but it doesn't restore missing body parts. If the creature is lacking body parts or organs integral for its survival, its head, for instance, the spell automatically fails.",
    "Coming back from the dead is an ordeal. The target takes a -4 penalty to all attack rolls, saving throws, and ability checks. Every time the target finishes a Long Rest, the penalty is reduced by 1 until it disappears."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 5
};

export const rarysTelepathicBond: SpellEntry = {
  id: "spell-rarys-telepathic-bond",
  name: "Rary's Telepathic Bond",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  ritual: true,
  description: [
    "You forge a telepathic link among up to eight willing creatures of your choice within range, psychically linking each creature to all the others for the duration. Creatures with Intelligence scores of 2 or less aren't affected by this spell.",
    "Until the spell ends, the targets can communicate telepathically through the bond whether or not they have a common language. The communication is possible over any distance, though it can't extend to other planes of existence."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const reincarnate: SpellEntry = {
  id: "spell-reincarnate",
  name: "Reincarnate",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.HOUR],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You touch a dead Humanoid or a piece of a dead Humanoid. Provided that the creature has been dead no longer than 10 days, the spell forms a new adult body for it and then calls the soul to enter that body. If the target's soul isn't free or willing to do so, the spell fails.",
    "The magic fashions a new body for the creature to inhabit, which likely causes the creature's species to change. The DM rolls a d100 and consults the following table to determine what form the creature takes when restored to life, or the DM chooses a form.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>01-04.</strong> Dragonborn.",
        "<strong>05-13.</strong> Dwarf, hill.",
        "<strong>14-21.</strong> Dwarf, mountain.",
        "<strong>22-25.</strong> Elf, dark.",
        "<strong>26-34.</strong> Elf, high.",
        "<strong>35-42.</strong> Elf, wood.",
        "<strong>43-46.</strong> Gnome, forest.",
        "<strong>47-52.</strong> Gnome, rock.",
        "<strong>53-56.</strong> Half-elf.",
        "<strong>57-60.</strong> Half-orc.",
        "<strong>61-68.</strong> Halfling, lightfoot.",
        "<strong>69-76.</strong> Halfling, stout.",
        "<strong>77-96.</strong> Human.",
        "<strong>97-00.</strong> Tiefling."
      ]
    },
    "The reincarnated creature recalls its former life and experiences. It retains the capabilities it had in its original form, except it exchanges its original species for the new one and changes its species traits accordingly."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 5
};

export const scrying: SpellEntry = {
  id: "spell-scrying",
  name: "Scrying",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You can see and hear a particular creature you choose that is on the same plane of existence as you. The target must make a Wisdom saving throw, which is modified by how well you know the target and the sort of physical connection you have to it. If a target knows you're casting this spell, it can fail the saving throw voluntarily if it wants to be observed.",
    "<strong>Knowledge save modifiers.</strong>",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Secondhand.</strong> You have heard of the target, +5.",
        "<strong>Firsthand.</strong> You have met the target, +0.",
        "<strong>Familiar.</strong> You know the target well, -5."
      ]
    },
    "<strong>Connection save modifiers.</strong>",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Likeness or picture.</strong> -2.",
        "<strong>Possession or garment.</strong> -4.",
        "<strong>Body part, lock of hair, bit of nail, or the like.</strong> -10."
      ]
    },
    "On a successful save, the target isn't affected, and you can't use this spell against it again for 24 hours.",
    "On a failed save, the spell creates an invisible sensor within 10 feet of the target. You can see and hear through the sensor as if you were there. The sensor moves with the target, remaining within 10 feet of it for the duration. A creature that can see invisible objects sees the sensor as a luminous orb about the size of your fist.",
    "Instead of targeting a creature, you can choose a location you have seen before as the target of this spell. When you do, the sensor appears at that location and doesn't move."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 5
};

export const seeming: SpellEntry = {
  id: "spell-seeming",
  name: "Seeming",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["8 hours"],
  description: [
    "This spell allows you to change the appearance of any number of creatures that you can see within range. You give each target you choose a new, illusory appearance. An unwilling target can make a Charisma saving throw, and if it succeeds, it is unaffected by this spell.",
    "The spell disguises physical appearances as well as clothing, armor, weapons, and equipment. You can make each creature seem 1 foot shorter or taller and appear thin, fat, or in-between. You can't change a target's body type, so you must choose a form that has the same basic arrangement of limbs. Otherwise, the extent of the illusion is up to you. The spell lasts for the duration, unless you use your action to dismiss it sooner.",
    "The changes wrought by this spell fail to hold up to physical inspections. For example, if you use this spell to add a hat to a creature's outfit, objects pass through the hat, and anyone who touches it would feel nothing or would feel the creature's head and hair. If you use this spell to appear thinner than you are, the hand of someone who reaches out to touch you would bump into you while it was seemingly still in midair.",
    "A creature can use its action to inspect a target and make an Intelligence (Investigation) check against your spell save DC. If it succeeds, it becomes aware that the target is disguised."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const shutdown: SpellEntry = {
  id: "spell-shutdown",
  name: "Shutdown",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "This spell shuts down all electronic devices within range that are not wielded by or under the direct control of a creature. If an electronic device within range is used by a creature, that creature must succeed on a Constitution saving throw to prevent the device from being shut down. While the spell remains active, no electronic device within range can be started or restarted."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const skillEmpowerment: SpellEntry = {
  id: "spell-skill-empowerment",
  name: "Skill Empowerment",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "Your magic deepens a creature's understanding of its own talent. You touch one willing creature and give it Expertise in one skill of your choice. Until the spell ends, the creature doubles its Proficiency Bonus for ability checks it makes that use the chosen skill.",
    "You must choose a skill in which the target is proficient and that isn't already benefiting from an effect, such as Expertise, that doubles its Proficiency Bonus."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD,
    SPELL_LIST_CLASS.ARTIFICER
  ],
  spellLevel: 5
};

export const steelWindStrike: SpellEntry = {
  id: "spell-steel-wind-strike",
  name: "Steel Wind Strike",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You flourish the weapon used in the casting and then vanish to strike like the wind. Choose up to five creatures you can see within range. Make a melee spell attack against each target. On a hit, a target takes 6d10 Force damage.",
    "You can then teleport to an unoccupied space you can see within 5 feet of one of the targets you hit or missed."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE]
  ],
  spellLists: [SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const summonCelestial: SpellEntry = {
  id: "spell-summon-celestial",
  name: "Summon Celestial",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You call forth a Celestial spirit. It manifests in an angelic form in an unoccupied space that you can see within range. This corporeal form uses the Celestial Spirit stat block. When you cast the spell, choose Avenger or Defender. Your choice determines the creature's attack in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.",
    "The creature is an ally to you and your companions. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands, no action required by you. If you don't issue any, it takes the Dodge action and uses its move to avoid danger.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, use the higher level whenever the spell's level appears in the stat block."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 5
};

export const summonDraconicSpirit: SpellEntry = {
  id: "spell-summon-draconic-spirit",
  name: "Summon Draconic Spirit",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You call forth a draconic spirit. It manifests in an unoccupied space that you can see within range. This corporeal form uses the Draconic Spirit stat block. When you cast this spell, choose a family of dragon: Chromatic, Gem, or Metallic. The creature resembles a dragon of the chosen family, which determines certain traits in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.",
    "The creature is an ally to you and your companions. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands, no action required by you. If you don't issue any, it takes the Dodge action and uses its move to avoid danger.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, use the higher level wherever the spell's level appears in the stat block.",
    "<strong>Draconic Spirit.</strong> Large Dragon, Neutral.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Armor Class.</strong> 14 + the level of the spell, natural armor.",
        "<strong>Hit Points.</strong> 50 + 10 for each spell level above 5th. The dragon has a number of Hit Dice, d10s, equal to the level of the spell.",
        "<strong>Speed.</strong> 30 ft., fly 60 ft., swim 30 ft.",
        "<strong>Abilities.</strong> STR 19 (+4), DEX 14 (+2), CON 17 (+3), INT 10 (+0), WIS 14 (+2), CHA 14 (+2).",
        "<strong>Damage Resistances.</strong> Chromatic and Metallic only: Acid, Cold, Fire, Lightning, Poison.",
        "<strong>Damage Resistances.</strong> Gem only: Force, Necrotic, Psychic, Radiant, Thunder.",
        "<strong>Condition Immunities.</strong> Charmed, Frightened, Poisoned.",
        "<strong>Senses.</strong> Blindsight 30 ft., Darkvision 60 ft., passive Perception 12.",
        "<strong>Languages.</strong> Draconic, understands the languages you speak.",
        "<strong>Proficiency Bonus.</strong> Equals your bonus."
      ]
    },
    "<strong>Shared Resistances.</strong> When you summon the dragon, choose one of its damage resistances. You have Resistance to the chosen damage type until the spell ends.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Multiattack.</strong> The dragon makes a number of Rend attacks equal to half the spell's level, rounded down, and it uses Breath Weapon.",
        "<strong>Rend.</strong> Melee Weapon Attack: your spell attack modifier to hit, reach 10 ft., one target. Hit: 1d6 + 4 + the spell's level Piercing damage.",
        "<strong>Breath Weapon.</strong> The dragon exhales destructive energy in a 30-foot cone. Each creature in that area must make a Dexterity saving throw against your spell save DC. A creature takes 2d6 damage of a type this dragon has Resistance to, your choice, on a failed save, or half as much damage on a successful one."
      ]
    }
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.PIERCING]],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const swiftQuiver: SpellEntry = {
  id: "spell-swift-quiver",
  name: "Swift Quiver",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You transmute your quiver so it produces an endless supply of nonmagical ammunition, which seems to leap into your hand when you reach for it.",
    "On each of your turns until the spell ends, you can use a Bonus Action to make two attacks with a weapon that uses ammunition from the quiver. Each time you make such a ranged attack, your quiver magically replaces the piece of ammunition you used with a similar piece of nonmagical ammunition. Any pieces of ammunition created by this spell disintegrate when the spell ends. If the quiver leaves your possession, the spell ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.RANGER],
  spellLevel: 5
};

export const synapticStatic: SpellEntry = {
  id: "spell-synaptic-static",
  name: "Synaptic Static",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You choose a point within range and cause psychic energy to explode there. Each creature in a 20-foot-radius sphere centered on that point must make an Intelligence saving throw. A creature with an Intelligence score of 2 or lower can't be affected by this spell. A target takes 8d6 Psychic damage on a failed save, or half as much damage on a successful one.",
    "After a failed save, a target has muddled thoughts for 1 minute. During that time, it rolls a d6 and subtracts the number rolled from all its attack rolls and ability checks, as well as its Constitution saving throws to maintain Concentration. The target can make an Intelligence saving throw at the end of each of its turns, ending the effect on itself on a success."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 5
};

export const telekinesis: SpellEntry = {
  id: "spell-telekinesis",
  name: "Telekinesis",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You gain the ability to move or manipulate creatures or objects by thought. When you cast the spell, and as your action each round for the duration, you can exert your will on one creature or object that you can see within range, causing the appropriate effect below. You can affect the same target round after round, or choose a new one at any time. If you switch targets, the prior target is no longer affected by the spell.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Creature.</strong> You can try to move a Huge or smaller creature. Make an ability check with your spellcasting ability contested by the creature's Strength check. If you win the contest, you move the creature up to 30 feet in any direction, including upward but not beyond the range of this spell. Until the end of your next turn, the creature is Restrained in your telekinetic grip. A creature lifted upward is suspended in midair. On subsequent rounds, you can use your action to attempt to maintain your telekinetic grip on the creature by repeating the contest.",
        "<strong>Object.</strong> You can try to move an object that weighs up to 1,000 pounds. If the object isn't being worn or carried, you automatically move it up to 30 feet in any direction, but not beyond the range of this spell. If the object is worn or carried by a creature, you must make an ability check with your spellcasting ability contested by that creature's Strength check. If you succeed, you pull the object away from that creature and can move it up to 30 feet in any direction but not beyond the range of this spell. You can exert fine control on objects with your telekinetic grip, such as manipulating a simple tool, opening a door or a container, stowing or retrieving an item from an open container, or pouring the contents from a vial."
      ]
    }
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const teleportationCircle: SpellEntry = {
  id: "spell-teleportation-circle",
  name: "Teleportation Circle",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.M],
  duration: ["1 round"],
  description: [
    "As you cast the spell, you draw a 10-foot-diameter circle on the ground inscribed with sigils that link your location to a permanent teleportation circle of your choice whose sigil sequence you know and that is on the same plane of existence as you.",
    "A shimmering portal opens within the circle you drew and remains open until the end of your next turn. Any creature that enters the portal instantly appears within 5 feet of the destination circle or in the nearest unoccupied space if that space is occupied.",
    "Many major temples, guilds, and other important places have permanent teleportation circles inscribed somewhere within their confines. Each such circle includes a unique sigil sequence, a string of magical runes arranged in a particular pattern. When you first gain the ability to cast this spell, you learn the sigil sequences for two destinations on the Material Plane, determined by the DM. You can learn additional sigil sequences during your adventures. You can commit a new sigil sequence to memory after studying it for 1 minute.",
    "You can create a permanent teleportation circle by casting this spell in the same location every day for one year. You need not use the circle to teleport when you cast the spell in this way."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 5
};

export const temporalShunt: SpellEntry = {
  id: "spell-temporal-shunt",
  name: "Temporal Shunt",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.REACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 round"],
  description: [
    "You target the triggering creature, which must succeed on a Wisdom saving throw or vanish, being thrown to another point in time and causing the attack to miss or the spell to be wasted. At the start of its next turn, the target reappears where it was or in the closest unoccupied space. The target doesn't remember you casting the spell or being affected by it.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, you can target one additional creature for each slot level above 5th. All targets must be within 30 feet of each other."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const transmuteRock: SpellEntry = {
  id: "spell-transmute-rock",
  name: "Transmute Rock",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Until dispelled"],
  description: [
    "You choose an area of stone or mud that you can see that fits within a 40-foot cube and that is within range, and choose one of the following effects.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Transmute Rock to Mud.</strong> Nonmagical rock of any sort in the area becomes an equal volume of thick and flowing mud that remains for the spell's duration. If you cast the spell on an area of ground, it becomes muddy enough that creatures can sink into it. Each foot that a creature moves through the mud costs 4 feet of movement, and any creature on the ground when you cast the spell must make a Strength saving throw. A creature must also make this save the first time it enters the area on a turn or ends its turn there. On a failed save, a creature sinks into the mud and is Restrained, though it can use an action to end the Restrained condition on itself by pulling itself free of the mud. If you cast the spell on a ceiling, the mud falls. Any creature under the mud when it falls must make a Dexterity saving throw. A creature takes 4d8 Bludgeoning damage on a failed save, or half as much damage on a successful one.",
        "<strong>Transmute Mud to Rock.</strong> Nonmagical mud or quicksand in the area no more than 10 feet deep transforms into soft stone for the spell's duration. Any creature in the mud when it transforms must make a Dexterity saving throw. On a failed save, a creature becomes Restrained by the rock. The Restrained creature can use an action to try to break free by succeeding on a Strength check, DC 20, or by dealing 25 damage to the rock around it. On a successful save, a creature is shunted safely to the surface to an unoccupied space."
      ]
    }
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD, SPELL_LIST_CLASS.ARTIFICER],
  spellLevel: 5
};

export const treeStride: SpellEntry = {
  id: "spell-tree-stride",
  name: "Tree Stride",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You gain the ability to enter a tree and move from inside it to inside another tree of the same kind within 500 feet.",
    "Both trees must be living and at least the same size as you. You must use 5 feet of movement to enter a tree. You instantly know the location of all other trees of the same kind within 500 feet and, as part of the move used to enter the tree, can either pass into one of those trees or step out of the tree you're in. You appear in a spot of your choice within 5 feet of the destination tree, using another 5 feet of movement. If you have no movement left, you appear within 5 feet of the tree you entered.",
    "You can use this transportation ability once per round for the duration. You must end each turn outside a tree."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 5
};

export const wallOfForce: SpellEntry = {
  id: "spell-wall-of-force",
  name: "Wall of Force",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "An invisible wall of force springs into existence at a point you choose within range.",
    "The wall appears in any orientation you choose, as a horizontal or vertical barrier or at an angle. It can be free-floating or resting on a solid surface. You can form it into a hemispherical dome or a sphere with a radius of up to 10 feet, or you can shape a flat surface made up of ten 10-foot-by-10-foot panels. Each panel must be contiguous with another panel. In any form, the wall is 1/4 inch thick. It lasts for the duration. If the wall cuts through a creature's space when it appears, the creature is pushed to one side of the wall, your choice which side.",
    "Nothing can physically pass through the wall. It is immune to all damage and can't be dispelled by Dispel Magic. A Disintegrate spell destroys the wall instantly, however. The wall also extends into the Ethereal Plane, blocking ethereal travel through the wall."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const wallOfLight: SpellEntry = {
  id: "spell-wall-of-light",
  name: "Wall of Light",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "A shimmering wall of bright light appears at a point you choose within range. The wall appears in any orientation you choose: horizontally, vertically, or diagonally. It can be free-floating, or it can rest on a solid surface. The wall can be up to 60 feet long, 10 feet high, and 5 feet thick. The wall blocks line of sight, but creatures and objects can pass through it. It emits bright light out to 120 feet and dim light for an additional 120 feet.",
    "When the wall appears, each creature in its area must make a Constitution saving throw. On a failed save, a creature takes 4d8 Radiant damage, and it is Blinded for 1 minute. On a successful save, it takes half as much damage and isn't Blinded. A Blinded creature can make a Constitution saving throw at the end of each of its turns, ending the effect on itself on a success.",
    "A creature that ends its turn in the wall's area takes 4d8 Radiant damage.",
    "Until the spell ends, you can use an action to launch a beam of radiance from the wall at one creature you can see within 60 feet of it. Make a ranged spell attack. On a hit, the target takes 4d8 Radiant damage. Whether you hit or miss, reduce the length of the wall by 10 feet. If the wall's length drops to 0 feet, the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d8 for each slot level above 5th."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
};

export const wallOfStone: SpellEntry = {
  id: "spell-wall-of-stone",
  name: "Wall of Stone",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "A nonmagical wall of solid stone springs into existence at a point you choose within range. The wall is 6 inches thick and is composed of ten 10-foot-by-10-foot panels. Each panel must be contiguous with at least one other panel. Alternatively, you can create 10-foot-by-20-foot panels that are only 3 inches thick.",
    "If the wall cuts through a creature's space when it appears, the creature is pushed to one side of the wall, your choice. If a creature would be surrounded on all sides by the wall, or the wall and another solid surface, that creature can make a Dexterity saving throw. On a success, it can use its Reaction to move up to its Speed so that it is no longer enclosed by the wall.",
    "The wall can have any shape you desire, though it can't occupy the same space as a creature or object. The wall doesn't need to be vertical or resting on any firm foundation. It must, however, merge with and be solidly supported by existing stone. Thus, you can use this spell to bridge a chasm or create a ramp.",
    "If you create a span greater than 20 feet in length, you must halve the size of each panel to create supports. You can crudely shape the wall to create crenellations, battlements, and so on.",
    "The wall is an object made of stone that can be damaged and thus breached. Each panel has AC 15 and 30 Hit Points per inch of thickness. Reducing a panel to 0 Hit Points destroys it and might cause connected panels to collapse at the DM's discretion.",
    "If you maintain your Concentration on this spell for its whole duration, the wall becomes permanent and can't be dispelled. Otherwise, the wall disappears when the spell ends."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 5
};

export const wrathOfNature: SpellEntry = {
  id: "spell-wrath-of-nature",
  name: "Wrath of Nature",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You call out to the spirits of nature to rouse them against your enemies. Choose a point you can see within range. The spirits cause trees, rocks, and grasses in a 60-foot cube centered on that point to become animated until the spell ends.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Grasses and Undergrowth.</strong> Any area of ground in the cube that is covered by grass or undergrowth is difficult terrain for your enemies.",
        "<strong>Trees.</strong> At the start of each of your turns, each of your enemies within 10 feet of any tree in the cube must succeed on a Dexterity saving throw or take 4d6 Slashing damage from whipping branches.",
        "<strong>Roots and Vines.</strong> At the end of each of your turns, one creature of your choice that is on the ground in the cube must succeed on a Strength saving throw or become Restrained until the spell ends. A Restrained creature can use an action to make a Strength (Athletics) check against your spell save DC, ending the effect on itself on a success.",
        "<strong>Rocks.</strong> As a Bonus Action on your turn, you can cause a loose rock in the cube to launch at a creature you can see in the cube. Make a ranged spell attack against the target. On a hit, the target takes 3d8 nonmagical Bludgeoning damage, and it must succeed on a Strength saving throw or fall Prone."
      ]
    }
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 5
};

export const spellEntries5: SpellEntry[] = [
  animateObjects,
  antilifeShell,
  awaken,
  banishingSmite,
  bigbysHand,
  circleOfPower,
  cloudkill,
  commune,
  communeWithCity,
  communeWithNature,
  coneOfCold,
  conjureElemental,
  conjureVolley,
  conjureVrock,
  contactOtherPlane,
  contagion,
  controlWinds,
  createSpelljammingHelm,
  creation,
  danseMacabre,
  dawn,
  destructiveWave,
  dispelEvilAndGood,
  dominatePerson,
  dream,
  enervation,
  farStep,
  flameStrike,
  geas,
  greaterRestoration,
  hallow,
  holdMonster,
  holyWeapon,
  immolation,
  infernalCalling,
  insectPlague,
  legendLore,
  maelstrom,
  massCureWounds,
  mislead,
  modifyMemory,
  negativeEnergyFlood,
  passwall,
  planarBinding,
  raiseDead,
  rarysTelepathicBond,
  reincarnate,
  scrying,
  seeming,
  shutdown,
  skillEmpowerment,
  steelWindStrike,
  summonCelestial,
  summonDraconicSpirit,
  swiftQuiver,
  synapticStatic,
  telekinesis,
  teleportationCircle,
  temporalShunt,
  transmuteRock,
  treeStride,
  wallOfForce,
  wallOfLight,
  wallOfStone,
  wrathOfNature
];
