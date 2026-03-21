import {
  ACTION_TYPE,
  DAMAGE_TYPE,
  DICE,
  ENTRY_CATEGORIES,
  MAGIC_SCHOOL,
  SPELL_COMPONENT,
  SPELL_LIST_CLASS
} from "../../entries/enums";
import type { SpellEntry } from "../../entries/types";

export const arcaneGate: SpellEntry = {
  id: "spell-arcane-gate",
  name: "Arcane Gate",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "500 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 10 minutes",
  description: [
    "You create linked teleportation portals that remain open for the duration. Choose two points on the ground that you can see, one point within 10 feet of you and one point within 500 feet of you. A circular portal, 10 feet in diameter, opens over each point. If the portal would open in the space occupied by a creature, the spell fails, and the casting is lost.",
    "The portals are two-dimensional glowing rings filled with mist, hovering inches from the ground and perpendicular to it at the points you choose. A ring is visible only from one side, your choice, which is the side that functions as a portal.",
    "Any creature or object entering the portal exits from the other portal as if the two were adjacent to each other. Passing through a portal from the nonportal side has no effect. The mist that fills each portal is opaque and blocks vision through it. On your turn, you can rotate the rings as a Bonus Action so that the active side faces in a different direction."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const bladeBarrier: SpellEntry = {
  id: "spell-blade-barrier",
  name: "Blade Barrier",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 10 minutes",
  description: [
    "You create a vertical wall of whirling, razor-sharp blades made of magical energy. The wall appears within range and lasts for the duration. You can make a straight wall up to 100 feet long, 20 feet high, and 5 feet thick, or a ringed wall up to 60 feet in diameter, 20 feet high, and 5 feet thick. The wall provides three-quarters cover to creatures behind it, and its space is difficult terrain.",
    "When a creature enters the wall's area for the first time on a turn or starts its turn there, the creature must make a Dexterity saving throw. On a failed save, the creature takes 6d10 Slashing damage. On a successful save, the creature takes half as much damage."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.SLASHING],
    [DICE.D10, DAMAGE_TYPE.SLASHING],
    [DICE.D10, DAMAGE_TYPE.SLASHING],
    [DICE.D10, DAMAGE_TYPE.SLASHING],
    [DICE.D10, DAMAGE_TYPE.SLASHING],
    [DICE.D10, DAMAGE_TYPE.SLASHING]
  ],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 6
};

export const bonesOfTheEarth: SpellEntry = {
  id: "spell-bones-of-the-earth",
  name: "Bones of the Earth",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "You cause up to six pillars of stone to burst from places on the ground that you can see within range. Each pillar is a cylinder that has a diameter of 5 feet and a height of up to 30 feet. The ground where a pillar appears must be wide enough for its diameter, and you can target ground under a creature if that creature is Medium or smaller. Each pillar has AC 5 and 30 Hit Points. When reduced to 0 Hit Points, a pillar crumbles into rubble, which creates an area of difficult terrain with a 10-foot radius. The rubble lasts until cleared.",
    "If a pillar is created under a creature, that creature must succeed on a Dexterity saving throw or be lifted by the pillar. A creature can choose to fail the save.",
    "If a pillar is prevented from reaching its full height because of a ceiling or other obstacle, a creature on the pillar takes 6d6 Bludgeoning damage and is Restrained, pinched between the pillar and the obstacle. The Restrained creature can use an action to make a Strength or Dexterity check, the creature's choice, against the spell save DC. On a success, the creature is no longer Restrained and must either move off the pillar or fall off it.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, you can create two additional pillars for each slot level above 6th."
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
  spellLevel: 6
};

export const chainLightning: SpellEntry = {
  id: "spell-chain-lightning",
  name: "Chain Lightning",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "You create a bolt of Lightning that arcs toward a target of your choice that you can see within range. Three bolts then leap from that target to as many as three other targets, each of which must be within 30 feet of the first target. A target can be a creature or an object and can be targeted by only one of the bolts.",
    "A target must make a Dexterity saving throw. The target takes 10d8 Lightning damage on a failed save, or half as much on a successful one.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, one additional bolt leaps from the first target to another target for each slot level above 6th."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.LIGHTNING],
    [DICE.D8, DAMAGE_TYPE.LIGHTNING],
    [DICE.D8, DAMAGE_TYPE.LIGHTNING],
    [DICE.D8, DAMAGE_TYPE.LIGHTNING],
    [DICE.D8, DAMAGE_TYPE.LIGHTNING],
    [DICE.D8, DAMAGE_TYPE.LIGHTNING],
    [DICE.D8, DAMAGE_TYPE.LIGHTNING],
    [DICE.D8, DAMAGE_TYPE.LIGHTNING],
    [DICE.D8, DAMAGE_TYPE.LIGHTNING],
    [DICE.D8, DAMAGE_TYPE.LIGHTNING]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const circleOfDeath: SpellEntry = {
  id: "spell-circle-of-death",
  name: "Circle of Death",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "A sphere of negative energy ripples out in a 60-foot-radius sphere from a point within range. Each creature in that area must make a Constitution saving throw. A target takes 8d6 Necrotic damage on a failed save, or half as much damage on a successful one.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, the damage increases by 2d6 for each slot level above 6th."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const conjureFey: SpellEntry = {
  id: "spell-conjure-fey",
  name: "Conjure Fey",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 1 hour",
  description: [
    "You summon a Fey creature of Challenge Rating 6 or lower, or a Fey spirit that takes the form of a Beast of Challenge Rating 6 or lower. It appears in an unoccupied space that you can see within range. The Fey creature disappears when it drops to 0 Hit Points or when the spell ends.",
    "The Fey creature is friendly to you and your companions for the duration. Roll Initiative for the creature, which has its own turns. It obeys any verbal commands that you issue to it, no action required by you, as long as they don't violate its alignment. If you don't issue any commands to the Fey creature, it defends itself from hostile creatures but otherwise takes no actions.",
    "If your Concentration is broken, the Fey creature doesn't disappear. Instead, you lose control of the Fey creature, it becomes hostile toward you and your companions, and it might attack. An uncontrolled Fey creature can't be dismissed by you, and it disappears 1 hour after you summoned it. The DM has the Fey creature's statistics.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, the Challenge Rating increases by 1 for each slot level above 6th."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 6
};

export const contingency: SpellEntry = {
  id: "spell-contingency",
  name: "Contingency",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "10 days",
  description: [
    "Choose a spell of 5th level or lower that you can cast, that has a casting time of 1 action, and that can target you. You cast that spell, called the contingent spell, as part of casting Contingency, expending spell slots for both, but the contingent spell doesn't come into effect. Instead, it takes effect when a certain circumstance occurs. You describe that circumstance when you cast the two spells. For example, a Contingency cast with Water Breathing might stipulate that Water Breathing comes into effect when you are engulfed in water or a similar liquid.",
    "The contingent spell takes effect immediately after the circumstance is met for the first time, whether or not you want it to, and then Contingency ends.",
    "The contingent spell takes effect only on you, even if it can normally target others. You can use only one Contingency spell at a time. If you cast this spell again, the effect of another Contingency spell on you ends. Also, Contingency ends on you if its material component is ever not on your person."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const createHomunculus: SpellEntry = {
  id: "spell-create-homunculus",
  name: "Create Homunculus",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.HOUR],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "While speaking an intricate incantation, you cut yourself with a jewel-encrusted dagger, taking 2d4 Piercing damage that can't be reduced in any way. You then drip your blood on the spell's other components and touch them, transforming them into a special Construct called a homunculus. The statistics of the homunculus are in the Monster Manual. It is your faithful companion, and it dies if you die.",
    "Whenever you finish a Long Rest, you can spend up to half your Hit Dice if the homunculus is on the same plane of existence as you. When you do so, roll each die and add your Constitution modifier to it. Your Hit Point maximum is reduced by the total, and the homunculus's Hit Point maximum and current Hit Points are both increased by it. This process can reduce you to no lower than 1 Hit Point, and the change to your and the homunculus's Hit Points ends when you finish your next Long Rest. The reduction to your Hit Point maximum can't be removed by any means before then, except by the homunculus's death.",
    "You can have only one homunculus at a time. If you cast this spell while your homunculus lives, the spell fails."
  ],
  damage: [
    [DICE.D4, DAMAGE_TYPE.PIERCING],
    [DICE.D4, DAMAGE_TYPE.PIERCING]
  ],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const createUndead: SpellEntry = {
  id: "spell-create-undead",
  name: "Create Undead",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "You can cast this spell only at night. Choose up to three corpses of Medium or Small Humanoids within range. Each corpse becomes a ghoul under your control. The DM has game statistics for these creatures.",
    "As a Bonus Action on each of your turns, you can mentally command any creature you animated with this spell if the creature is within 120 feet of you. If you control multiple creatures, you can command any or all of them at the same time, issuing the same command to each one. You decide what action the creature will take and where it will move during its next turn, or you can issue a general command, such as to guard a particular chamber or corridor. If you issue no commands, the creature only defends itself against hostile creatures. Once given an order, the creature continues to follow it until its task is complete.",
    "The creature is under your control for 24 hours, after which it stops obeying any command you have given it. To maintain control of the creature for another 24 hours, you must cast this spell on the creature before the current 24-hour period ends. This use of the spell reasserts your control over up to three creatures you have animated with this spell, rather than animating new ones.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>At 7th level.</strong> You can animate or reassert control over four ghouls.",
        "<strong>At 8th level.</strong> You can animate or reassert control over five ghouls or two ghasts or wights.",
        "<strong>At 9th level.</strong> You can animate or reassert control over six ghouls, three ghasts or wights, or two mummies."
      ]
    }
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const disintegrate: SpellEntry = {
  id: "spell-disintegrate",
  name: "Disintegrate",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "A thin green ray springs from your pointing finger to a target that you can see within range. The target can be a creature, an object, or a creation of magical force, such as the wall created by Wall of Force.",
    "A creature targeted by this spell must make a Dexterity saving throw. On a failed save, the target takes 10d6 + 40 Force damage. The target is disintegrated if this damage leaves it with 0 Hit Points.",
    "A disintegrated creature and everything it is wearing and carrying, except magic items, are reduced to a pile of fine gray dust. The creature can be restored to life only by means of a True Resurrection or a Wish spell.",
    "This spell automatically disintegrates a Large or smaller nonmagical object or a creation of magical force. If the target is a Huge or larger object or creation of force, this spell disintegrates a 10-foot-cube portion of it. A magic item is unaffected by this spell.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, the damage increases by 3d6 for each slot level above 6th."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const drawmijsInstantSummons: SpellEntry = {
  id: "spell-drawmijs-instant-summons",
  name: "Drawmij's Instant Summons",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Until dispelled",
  description: [
    "You touch an object weighing 10 pounds or less whose longest dimension is 6 feet or less. The spell leaves an invisible mark on its surface and invisibly inscribes the name of the item on the sapphire you use as the material component. Each time you cast this spell, you must use a different sapphire.",
    "At any time thereafter, you can use your action to speak the item's name and crush the sapphire. The item instantly appears in your hand regardless of physical or planar distances, and the spell ends. If another creature is holding or carrying the item, crushing the sapphire doesn't transport the item to you, but instead you learn who the creature possessing the object is and roughly where that creature is located at that moment.",
    "Dispel Magic or a similar effect successfully applied to the sapphire ends this spell's effect."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const druidGrove: SpellEntry = {
  id: "spell-druid-grove",
  name: "Druid Grove",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "24 hours",
  description: [
    "You invoke the spirits of nature to protect an area outdoors or underground. The area can be as small as a 30-foot cube or as large as a 90-foot cube. Buildings and other structures are excluded from the affected area. If you cast this spell in the same area every day for a year, the spell lasts until dispelled.",
    "The spell creates the following effects within the area. When you cast this spell, you can specify creatures as friends who are immune to the effects. You can also specify a password that, when spoken aloud, makes the speaker immune to these effects. The entire warded area radiates magic. A Dispel Magic cast on the area, if successful, removes only one of the following effects, not the entire area. That spell's caster chooses which effect to end. Only when all its effects are gone is this spell dispelled.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Solid Fog.</strong> You can fill any number of 5-foot squares on the ground with thick fog, making them heavily obscured. The fog reaches 10 feet high. In addition, every foot of movement through the fog costs 2 extra feet. To a creature immune to this effect, the fog obscures nothing and looks like soft mist, with motes of green light floating in the air.",
        "<strong>Grasping Undergrowth.</strong> You can fill any number of 5-foot squares on the ground that aren't filled with fog with grasping weeds and vines, as if they were affected by an Entangle spell. To a creature immune to this effect, the weeds and vines feel soft and reshape themselves to serve as temporary seats or beds.",
        "<strong>Grove Guardians.</strong> You can animate up to four trees in the area, causing them to uproot themselves from the ground. These trees have the same statistics as an awakened tree, except they can't speak, and their bark is covered with druidic symbols. If any creature not immune to this effect enters the warded area, the grove guardians fight until they have driven off or slain the intruders. The grove guardians also obey your spoken commands, no action required by you, that you issue while in the area. If you don't give them commands and no intruders are present, the grove guardians do nothing. The grove guardians can't leave the warded area. When the spell ends, the magic animating them disappears, and the trees take root again if possible."
      ]
    },
    "<strong>Additional Spell Effect.</strong> You can place your choice of one of the following magical effects within the warded area:",
    {
      type: "list",
      style: "bullet",
      items: [
        "A constant Gust of Wind in two locations of your choice.",
        "Spike Growth in one location of your choice.",
        "Wind Wall in two locations of your choice."
      ]
    },
    "To a creature immune to this effect, the winds are a fragrant, gentle breeze, and the area of Spike Growth is harmless."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const eyebite: SpellEntry = {
  id: "spell-eyebite",
  name: "Eyebite",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 1 minute",
  description: [
    "For the spell's duration, your eyes become an inky void imbued with dread power. One creature of your choice within 60 feet of you that you can see must succeed on a Wisdom saving throw or be affected by one of the following effects of your choice for the duration. On each of your turns until the spell ends, you can use your action to target another creature but can't target a creature again if it has succeeded on a saving throw against this casting of Eyebite.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Asleep.</strong> The target falls Unconscious. It wakes up if it takes any damage or if another creature uses its action to shake the sleeper awake.",
        "<strong>Panicked.</strong> The target is Frightened of you. On each of its turns, the Frightened creature must take the Dash action and move away from you by the safest and shortest available route, unless there is nowhere to move. If the target moves to a place at least 60 feet away from you where it can no longer see you, this effect ends.",
        "<strong>Sickened.</strong> The target has Disadvantage on attack rolls and ability checks. At the end of each of its turns, it can make another Wisdom saving throw. If it succeeds, the effect ends."
      ]
    }
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 6
};

export const findThePath: SpellEntry = {
  id: "spell-find-the-path",
  name: "Find the Path",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 day",
  description: [
    "This spell allows you to find the shortest, most direct physical route to a specific fixed location that you are familiar with on the same plane of existence. If you name a destination on another plane of existence, a destination that moves, such as a mobile fortress, or a destination that isn't specific, such as a green dragon's lair, the spell fails.",
    "For the duration, as long as you are on the same plane of existence as the destination, you know how far it is and in what direction it lies. While you are traveling there, whenever you are presented with a choice of paths along the way, you automatically determine which path is the shortest and most direct route, but not necessarily the safest route, to the destination."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const fizbansPlatinumShield: SpellEntry = {
  id: "spell-fizbans-platinum-shield",
  name: "Fizban's Platinum Shield",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "You create a field of silvery light that surrounds a creature of your choice within range, you can choose yourself. The field sheds dim light out to 5 feet. While surrounded by the field, a creature gains the following benefits:",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Cover.</strong> The creature has half cover.",
        "<strong>Damage Resistance.</strong> The creature has Resistance to Acid, Cold, Fire, Lightning, and Poison damage.",
        "<strong>Evasion.</strong> If the creature is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, the creature instead takes no damage if it succeeds on the saving throw, and only half damage if it fails."
      ]
    },
    "As a Bonus Action on subsequent turns, you can move the field to another creature within 60 feet of the field."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const fleshToStone: SpellEntry = {
  id: "spell-flesh-to-stone",
  name: "Flesh to Stone",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "You attempt to turn one creature that you can see within range into stone. If the target's body is made of flesh, the creature must make a Constitution saving throw. On a failed save, it is Restrained as its flesh begins to harden. On a successful save, the creature isn't affected.",
    "A creature Restrained by this spell must make another Constitution saving throw at the end of each of its turns. If it successfully saves against this spell three times, the spell ends. If it fails saves three times, it is turned to stone and subjected to the Petrified condition for the duration. The successes and failures don't need to be consecutive. Keep track of both until the target collects three of a kind.",
    "If the creature is physically broken while Petrified, it suffers from similar deformities if it reverts to its original state. If you maintain your Concentration on this spell for the entire possible duration, the creature is turned to stone until the effect is removed."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 6
};

export const forbiddance: SpellEntry = {
  id: "spell-forbiddance",
  name: "Forbiddance",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "1 day",
  description: [
    "You create a ward against magical travel that protects up to 40,000 square feet of floor space to a height of 30 feet above the floor. For the duration, creatures can't teleport into the area or use portals, such as those created by the Gate spell, to enter the area. The spell proofs the area against planar travel, and therefore prevents creatures from accessing the area by way of the Astral Plane, Ethereal Plane, Feywild, Shadowfell, or the Plane Shift spell.",
    "In addition, the spell damages types of creatures that you choose when you cast it. Choose one or more of the following: Celestials, Elementals, Fey, Fiends, and Undead. When a chosen creature enters the spell's area for the first time on a turn or starts its turn there, the creature takes 5d10 Radiant or Necrotic damage, your choice when you cast this spell.",
    "When you cast this spell, you can designate a password. A creature that speaks the password as it enters the area takes no damage from the spell.",
    "This spell's area can't overlap with the area of another Forbiddance spell. If you cast Forbiddance every day for 30 days in the same location, the spell lasts until it is dispelled, and the material components are consumed on the last casting."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 6
};

export const globeOfInvulnerability: SpellEntry = {
  id: "spell-globe-of-invulnerability",
  name: "Globe of Invulnerability",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (10-foot radius)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "An immobile, faintly shimmering barrier springs into existence in a 10-foot radius around you and remains for the duration.",
    "Any spell of 5th level or lower cast from outside the barrier can't affect creatures or objects within it, even if the spell is cast using a higher level spell slot. Such a spell can target creatures and objects within the barrier, but the spell has no effect on them. Similarly, the area within the barrier is excluded from the areas affected by such spells.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, the barrier blocks spells of one level higher for each slot level above 6th."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const gravityFissure: SpellEntry = {
  id: "spell-gravity-fissure",
  name: "Gravity Fissure",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (100-foot line)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "You manifest a ravine of gravitational energy in a line originating from you that is 100 feet long and 5 feet wide. Each creature in that line must make a Constitution saving throw, taking 8d8 Force damage on a failed save, or half as much damage on a successful one.",
    "Each creature within 10 feet of the line but not in it must succeed on a Constitution saving throw or take 8d8 Force damage and be pulled toward the line until the creature is in its area.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, the damage increases by 1d8 for each slot level above 6th."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE]
  ],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const guardsAndWards: SpellEntry = {
  id: "spell-guards-and-wards",
  name: "Guards and Wards",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "24 hours",
  description: [
    "You create a ward that protects up to 2,500 square feet of floor space. The warded area can be up to 20 feet tall and shaped as you desire. You can ward several stories of a stronghold by dividing the area among them, as long as you can walk into each contiguous area while you are casting the spell.",
    "When you cast this spell, you can specify individuals that are unaffected by any or all of the effects that you choose. You can also specify a password that, when spoken aloud, makes the speaker immune to these effects.",
    "Guards and Wards creates the following effects within the warded area:",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Corridors.</strong> Fog fills all the warded corridors, making them heavily obscured. In addition, at each intersection or branching passage offering a choice of direction, there is a 50 percent chance that a creature other than you will believe it is going in the opposite direction from the one it chooses.",
        "<strong>Doors.</strong> All doors in the warded area are magically locked, as if sealed by an Arcane Lock spell. In addition, you can cover up to ten doors with an illusion, equivalent to the illusory object function of Minor Illusion, to make them appear as plain sections of wall.",
        "<strong>Stairs.</strong> Webs fill all stairs in the warded area from top to bottom, as the Web spell. These strands regrow in 10 minutes if they are burned or torn away while Guards and Wards lasts."
      ]
    },
    "<strong>Other Spell Effect.</strong> You can place your choice of one of the following magical effects within the warded area of the stronghold:",
    {
      type: "list",
      style: "bullet",
      items: [
        "Place Dancing Lights in four corridors. You can designate a simple program that the lights repeat as long as Guards and Wards lasts.",
        "Place Magic Mouth in two locations.",
        "Place Stinking Cloud in two locations. The vapors appear in the places you designate. They return within 10 minutes if dispersed by wind while Guards and Wards lasts.",
        "Place a constant Gust of Wind in one corridor or room.",
        "Place a Suggestion in one location. You select an area of up to 5 feet square, and any creature that enters or passes through the area receives the Suggestion mentally."
      ]
    },
    "The whole warded area radiates magic. A Dispel Magic cast on a specific effect, if successful, removes only that effect. You can create a permanently Guarded and Warded structure by casting this spell there every day for one year."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const harm: SpellEntry = {
  id: "spell-harm",
  name: "Harm",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "You unleash a virulent disease on a creature that you can see within range. The target must make a Constitution saving throw. On a failed save, it takes 14d6 Necrotic damage, or half as much damage on a successful save. The damage can't reduce the target's Hit Points below 1. If the target fails the saving throw, its Hit Point maximum is reduced for 1 hour by an amount equal to the Necrotic damage it took. Any effect that removes a disease allows a creature's Hit Point maximum to return to normal before that time passes."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC]
  ],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 6
};

export const heal: SpellEntry = {
  id: "spell-heal",
  name: "Heal",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "Choose a creature that you can see within range. A surge of positive energy washes through the creature, causing it to regain 70 Hit Points. The spell also ends blindness, deafness, and any diseases affecting the target. This spell has no effect on Constructs or Undead.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, the amount of healing increases by 10 for each slot level above 6th."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const heroesFeast: SpellEntry = {
  id: "spell-heroes-feast",
  name: "Heroes' Feast",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "You bring forth a great feast, including magnificent food and drink. The feast takes 1 hour to consume and disappears at the end of that time, and the beneficial effects don't set in until this hour is over. Up to twelve creatures can partake of the feast.",
    "A creature that partakes of the feast gains several benefits. The creature is cured of all diseases and poison, becomes immune to poison and being Frightened, and makes all Wisdom saving throws with Advantage. Its Hit Point maximum also increases by 2d10, and it gains the same number of Hit Points. These benefits last for 24 hours."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const investitureOfFlame: SpellEntry = {
  id: "spell-investiture-of-flame",
  name: "Investiture of Flame",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 10 minutes",
  description: [
    "Flames race across your body, shedding bright light in a 30-foot radius and dim light for an additional 30 feet for the spell's duration. The flames don't harm you. Until the spell ends, you gain the following benefits:",
    {
      type: "list",
      style: "bullet",
      items: [
        "You are immune to Fire damage and have Resistance to Cold damage.",
        "Any creature that moves within 5 feet of you for the first time on a turn or ends its turn there takes 1d10 Fire damage.",
        "You can use your action to create a line of fire 15 feet long and 5 feet wide extending from you in a direction you choose. Each creature in the line must make a Dexterity saving throw. A creature takes 4d8 Fire damage on a failed save, or half as much damage on a successful one."
      ]
    }
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 6
};

export const investitureOfIce: SpellEntry = {
  id: "spell-investiture-of-ice",
  name: "Investiture of Ice",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 10 minutes",
  description: [
    "Until the spell ends, ice rimes your body, and you gain the following benefits:",
    {
      type: "list",
      style: "bullet",
      items: [
        "You are immune to Cold damage and have Resistance to Fire damage.",
        "You can move across difficult terrain created by ice or snow without spending extra movement.",
        "The ground in a 10-foot radius around you is icy and is difficult terrain for creatures other than you. The radius moves with you.",
        "You can use your action to create a 15-foot cone of freezing wind extending from your outstretched hand in a direction you choose. Each creature in the cone must make a Constitution saving throw. A creature takes 4d6 Cold damage on a failed save, or half as much damage on a successful one. A creature that fails its save against this effect has its Speed halved until the start of your next turn."
      ]
    }
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 6
};

export const investitureOfStone: SpellEntry = {
  id: "spell-investiture-of-stone",
  name: "Investiture of Stone",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 10 minutes",
  description: [
    "Until the spell ends, bits of rock spread across your body, and you gain the following benefits:",
    {
      type: "list",
      style: "bullet",
      items: [
        "You have Resistance to Bludgeoning, Piercing, and Slashing damage from nonmagical weapons.",
        "You can use your action to create a small earthquake on the ground in a 15-foot radius centered on you. Other creatures on that ground must succeed on a Dexterity saving throw or be knocked Prone.",
        "You can move across difficult terrain made of earth or stone without spending extra movement. You can move through solid earth or stone as if it was air and without destabilizing it, but you can't end your movement there. If you do so, you are ejected to the nearest unoccupied space, this spell ends, and you are Stunned until the end of your next turn."
      ]
    }
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 6
};

export const investitureOfWind: SpellEntry = {
  id: "spell-investiture-of-wind",
  name: "Investiture of Wind",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 10 minutes",
  description: [
    "Until the spell ends, wind whirls around you, and you gain the following benefits:",
    {
      type: "list",
      style: "bullet",
      items: [
        "Ranged weapon attacks made against you have Disadvantage on the attack roll.",
        "You gain a flying Speed of 60 feet. If you are still flying when the spell ends, you fall, unless you can somehow prevent it.",
        "You can use your action to create a 15-foot cube of swirling wind centered on a point you can see within 60 feet of you. Each creature in that area must make a Constitution saving throw. A creature takes 2d10 Bludgeoning damage on a failed save, or half as much damage on a successful one. If a Large or smaller creature fails the save, that creature is also pushed up to 10 feet away from the center of the cube."
      ]
    }
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 6
};

export const magicJar: SpellEntry = {
  id: "spell-magic-jar",
  name: "Magic Jar",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Until dispelled",
  description: [
    "Your body falls into a catatonic state as your soul leaves it and enters the container you used for the spell's material component. While your soul inhabits the container, you are aware of your surroundings as if you were in the container's space. You can't move or use Reactions. The only action you can take is to project your soul up to 100 feet out of the container, either returning to your living body, and ending the spell, or attempting to possess a Humanoid's body.",
    "You can attempt to possess any Humanoid within 100 feet of you that you can see. Creatures warded by Protection from Evil and Good or Magic Circle can't be possessed. The target must make a Charisma saving throw. On a failure, your soul moves into the target's body, and the target's soul becomes trapped in the container. On a success, the target resists your efforts to possess it, and you can't attempt to possess it again for 24 hours.",
    "Once you possess a creature's body, you control it. Your game statistics are replaced by the statistics of the creature, though you retain your alignment and your Intelligence, Wisdom, and Charisma scores. You retain the benefit of your own class features. If the target has any class levels, you can't use any of its class features.",
    "Meanwhile, the possessed creature's soul can perceive from the container using its own senses, but it can't move or take actions at all.",
    "While possessing a body, you can use your action to return from the host body to the container if it is within 100 feet of you, returning the host creature's soul to its body. If the host body dies while you're in it, the creature dies, and you must make a Charisma saving throw against your own spell save DC. On a success, you return to the container if it is within 100 feet of you. Otherwise, you die.",
    "If the container is destroyed or the spell ends, your soul immediately returns to your body. If your body is more than 100 feet away from you, or if your body is dead when you attempt to return to it, you die. If another creature's soul is in the container when it is destroyed, the creature's soul returns to its body if the body is alive and within 100 feet. Otherwise, that creature dies.",
    "When the spell ends, the container is destroyed."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const massSuggestion: SpellEntry = {
  id: "spell-mass-suggestion",
  name: "Mass Suggestion",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.M],
  duration: "24 hours",
  description: [
    "You suggest a course of activity, limited to a sentence or two, and magically influence up to twelve creatures of your choice that you can see within range and that can hear and understand you. Creatures that can't be Charmed are immune to this effect. The suggestion must be worded in such a manner as to make the course of action sound reasonable. Asking the creature to stab itself, throw itself onto a spear, immolate itself, or do some other obviously harmful act automatically negates the effect of the spell.",
    "Each target must make a Wisdom saving throw. On a failed save, it pursues the course of action you described to the best of its ability. The suggested course of action can continue for the entire duration. If the suggested activity can be completed in a shorter time, the spell ends when the subject finishes what it was asked to do.",
    "You can also specify conditions that will trigger a special activity during the duration. For example, you might suggest that a group of soldiers give all their money to the first beggar they meet. If the condition isn't met before the spell ends, the activity isn't performed.",
    "If you or any of your companions damage a creature affected by this spell, the spell ends for that creature.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a 7th-level spell slot, the duration is 10 days. When you use an 8th-level spell slot, the duration is 30 days. When you use a 9th-level spell slot, the duration is a year and a day."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 6
};

export const mentalPrison: SpellEntry = {
  id: "spell-mental-prison",
  name: "Mental Prison",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.S],
  duration: "Concentration, up to 1 minute",
  description: [
    "You attempt to bind a creature within an illusory cell that only it perceives. One creature you can see within range must make an Intelligence saving throw. The target succeeds automatically if it is immune to being Charmed. On a successful save, the target takes 5d10 Psychic damage, and the spell ends.",
    "On a failed save, the target takes 5d10 Psychic damage, and you make the area immediately around the target's space appear dangerous to it in some way. You might cause the target to perceive itself as being surrounded by fire, floating razors, or hideous maws filled with dripping teeth. Whatever form the illusion takes, the target can't see or hear anything beyond it and is Restrained for the spell's duration.",
    "If the target is moved out of the illusion, makes a melee attack through it, or reaches any part of its body through it, the target takes 10d10 Psychic damage, and the spell ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const moveEarth: SpellEntry = {
  id: "spell-move-earth",
  name: "Move Earth",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 2 hours",
  description: [
    "Choose an area of terrain no larger than 40 feet on a side within range. You can reshape dirt, sand, or clay in the area in any manner you choose for the duration. You can raise or lower the area's elevation, create or fill in a trench, erect or flatten a wall, or form a pillar. The extent of any such changes can't exceed half the area's largest dimension. So, if you affect a 40-foot square, you can create a pillar up to 20 feet high, raise or lower the square's elevation by up to 20 feet, dig a trench up to 20 feet deep, and so on. It takes 10 minutes for these changes to complete.",
    "At the end of every 10 minutes you spend concentrating on the spell, you can choose a new area of terrain to affect.",
    "Because the terrain's transformation occurs slowly, creatures in the area can't usually be trapped or injured by the ground's movement.",
    "This spell can't manipulate natural stone or stone construction. Rocks and structures shift to accommodate the new terrain. If the way you shape the terrain would make a structure unstable, it might collapse.",
    "Similarly, this spell doesn't directly affect plant growth. The moved earth carries any plants along with it."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const otherworldlyForm: SpellEntry = {
  id: "spell-otherworldly-form",
  name: "Otherworldly Form",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "Uttering an incantation, you draw on the magic of the Lower Planes or Upper Planes, your choice, to transform yourself. You gain the following benefits until the spell ends:",
    {
      type: "list",
      style: "bullet",
      items: [
        "You are immune to Fire and Poison damage, Lower Planes, or Radiant and Necrotic damage, Upper Planes.",
        "You are immune to the Poisoned condition, Lower Planes, or the Charmed condition, Upper Planes.",
        "Spectral wings appear on your back, giving you a flying Speed of 40 feet.",
        "You have a +2 bonus to AC.",
        "All your weapon attacks are magical, and when you make a weapon attack, you can use your spellcasting ability modifier, instead of Strength or Dexterity, for the attack and damage rolls.",
        "You can attack twice, instead of once, when you take the Attack action on your turn. You ignore this benefit if you already have a feature, like Extra Attack, that gives you extra attacks."
      ]
    }
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 6
};

export const otilukesFreezingSphere: SpellEntry = {
  id: "spell-otilukes-freezing-sphere",
  name: "Otiluke's Freezing Sphere",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "300 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "A frigid globe of Cold energy streaks from your fingertips to a point of your choice within range, where it explodes in a 60-foot-radius sphere. Each creature within the area must make a Constitution saving throw. On a failed save, a creature takes 10d6 Cold damage. On a successful save, it takes half as much damage.",
    "If the globe strikes a body of water or a liquid that is principally water, not including water-based creatures, it freezes the liquid to a depth of 6 inches over an area 30 feet square. This ice lasts for 1 minute. Creatures that were swimming on the surface of frozen water are trapped in the ice. A trapped creature can use an action to make a Strength check against your spell save DC to break free.",
    "You can refrain from firing the globe after completing the spell, if you wish. A small globe about the size of a sling stone, cool to the touch, appears in your hand. At any time, you or a creature you give the globe to can throw the globe, to a range of 40 feet, or hurl it with a sling, to the sling's normal range. It shatters on impact, with the same effect as the normal casting of the spell. You can also set the globe down without shattering it. After 1 minute, if the globe hasn't already shattered, it explodes.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, the damage increases by 1d6 for each slot level above 6th."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const ottosIrresistibleDance: SpellEntry = {
  id: "spell-ottos-irresistible-dance",
  name: "Otto's Irresistible Dance",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: "Concentration, up to 1 minute",
  description: [
    "Choose one creature that you can see within range. The target begins a comic dance in place: shuffling, tapping its feet, and capering for the duration. Creatures that can't be Charmed are immune to this spell.",
    "A dancing creature must use all its movement to dance without leaving its space and has Disadvantage on Dexterity saving throws and attack rolls. While the target is affected by this spell, other creatures have Advantage on attack rolls against it. As an action, a dancing creature makes a Wisdom saving throw to regain control of itself. On a successful save, the spell ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const planarAlly: SpellEntry = {
  id: "spell-planar-ally",
  name: "Planar Ally",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "You beseech an otherworldly entity for aid. The being must be known to you: a god, a primordial, a demon prince, or some other being of cosmic power. That entity sends a Celestial, an Elemental, or a Fiend loyal to it to aid you, making the creature appear in an unoccupied space within range. If you know a specific creature's name, you can speak that name when you cast this spell to request that creature, though you might get a different creature anyway, the DM's choice.",
    "When the creature appears, it is under no compulsion to behave in any particular way. You can ask the creature to perform a service in exchange for payment, but it isn't obliged to do so. The requested task could range from simple, fly us across the chasm, or help us fight a battle, to complex, spy on our enemies, or protect us during our foray into the dungeon. You must be able to communicate with the creature to bargain for its services.",
    "Payment can take a variety of forms. A Celestial might require a sizable donation of gold or magic items to an allied temple, while a Fiend might demand a living sacrifice or a gift of treasure. Some creatures might exchange their service for a quest undertaken by you.",
    {
      type: "list",
      style: "bullet",
      items: [
        "A task that can be measured in minutes requires a payment worth 100 gp per minute.",
        "A task measured in hours requires 1,000 gp per hour.",
        "A task measured in days, up to 10 days, requires 10,000 gp per day."
      ]
    },
    "The DM can adjust these payments based on the circumstances under which you cast the spell. If the task is aligned with the creature's ethos, the payment might be halved or even waived. Nonhazardous tasks typically require only half the suggested payment, while especially dangerous tasks might require a greater gift. Creatures rarely accept tasks that seem suicidal.",
    "After the creature completes the task, or when the agreed-upon duration of service expires, the creature returns to its home plane after reporting back to you, if appropriate to the task and if possible. If you are unable to agree on a price for the creature's service, the creature immediately returns to its home plane.",
    "A creature enlisted to join your group counts as a member of it, receiving a full share of experience points awarded."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 6
};

export const primordialWard: SpellEntry = {
  id: "spell-primordial-ward",
  name: "Primordial Ward",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 1 minute",
  description: [
    "You have Resistance to Acid, Cold, Fire, Lightning, and Thunder damage for the spell's duration.",
    "When you take damage of one of those types, you can use your Reaction to gain immunity to that type of damage, including against the triggering damage. If you do so, the resistances end, and you have the immunity until the end of your next turn, at which time the spell ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const programmedIllusion: SpellEntry = {
  id: "spell-programmed-illusion",
  name: "Programmed Illusion",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Until dispelled",
  description: [
    "You create an illusion of an object, a creature, or some other visible phenomenon within range that activates when a specific condition occurs. The illusion is imperceptible until then. It must be no larger than a 30-foot cube, and you decide when you cast the spell how the illusion behaves and what sounds it makes. This scripted performance can last up to 5 minutes.",
    "When the condition you specify occurs, the illusion springs into existence and performs in the manner you described. Once the illusion finishes performing, it disappears and remains dormant for 10 minutes. After this time, the illusion can be activated again.",
    "The triggering condition can be as general or as detailed as you like, though it must be based on visual or audible conditions that occur within 30 feet of the area. For example, you could create an illusion of yourself to appear and warn off others who attempt to open a trapped door, or you could set the illusion to trigger only when a creature says the correct word or phrase.",
    "Physical interaction with the image reveals it to be an illusion, because things can pass through it. A creature that uses its action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const psychicCrush: SpellEntry = {
  id: "spell-psychic-crush",
  name: "Psychic Crush",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "1 minute",
  description: [
    "You overload the mind of one creature you can see within range, filling its psyche with discordant emotions. The target must make an Intelligence saving throw. On a failed save, the target takes 12d6 Psychic damage and is Stunned for 1 minute. On a successful save, the target takes half as much damage and isn't Stunned.",
    "The Stunned target can make an Intelligence saving throw at the end of each of its turns. On a successful save, the spell ends on the target."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const scatter: SpellEntry = {
  id: "spell-scatter",
  name: "Scatter",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: "Instantaneous",
  description: [
    "The air quivers around up to five creatures of your choice that you can see within range. An unwilling creature must succeed on a Wisdom saving throw to resist this spell. You teleport each affected target to an unoccupied space that you can see within 120 feet of you. That space must be on the ground or on a floor."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const soulCage: SpellEntry = {
  id: "spell-soul-cage",
  name: "Soul Cage",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.REACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "8 hours",
  description: [
    "This spell snatches the soul of a Humanoid as it dies and traps it inside the tiny cage you use for the material component. A stolen soul remains inside the cage until the spell ends or until you destroy the cage, which ends the spell. While you have a soul inside the cage, you can exploit it in any of the ways described below. You can use a trapped soul up to six times. Once you exploit a soul for the sixth time, it is released, and the spell ends. While a soul is trapped, the dead Humanoid it came from can't be revived.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Steal Life.</strong> You can use a Bonus Action to drain vigor from the soul and regain 2d8 Hit Points.",
        "<strong>Query Soul.</strong> You ask the soul a question, no action required, and receive a brief telepathic answer, which you can understand regardless of the language used. The soul knows only what it knew in life, but it must answer you truthfully and to the best of its ability. The answer is no more than a sentence or two and might be cryptic.",
        "<strong>Borrow Experience.</strong> You can use a Bonus Action to bolster yourself with the soul's life experience, making your next attack roll, ability check, or saving throw with Advantage. If you don't use this benefit before the start of your next turn, it is lost.",
        "<strong>Eyes of the Dead.</strong> You can use an action to name a place the Humanoid saw in life, which creates an invisible sensor somewhere in that place if it is on the plane of existence you're currently on. The sensor remains for as long as you concentrate, up to 10 minutes, as if you were concentrating on a spell. You receive visual and auditory information from the sensor as if you were in its space using your senses."
      ]
    },
    "A creature that can see the sensor, such as one using See Invisibility or Truesight, sees a translucent image of the tormented Humanoid whose soul you caged."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const summonFiend: SpellEntry = {
  id: "spell-summon-fiend",
  name: "Summon Fiend",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 hour",
  description: [
    "You call forth a fiendish spirit. It manifests in an unoccupied space that you can see within range. This corporeal form uses the Fiendish Spirit stat block. When you cast the spell, choose Demon, Devil, or Yugoloth. The creature resembles a Fiend of the chosen type, which determines certain traits in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.",
    "The creature is an ally to you and your companions. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands, no action required by you. If you don't issue any, it takes the Dodge action and uses its move to avoid danger.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, use the higher level wherever the spell's level appears in the stat block."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const sunbeam: SpellEntry = {
  id: "spell-sunbeam",
  name: "Sunbeam",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (60-foot line)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "A beam of brilliant light flashes out from your hand in a 5-foot-wide, 60-foot line. Each creature in the line must make a Constitution saving throw. On a failed save, a creature takes 6d8 Radiant damage and is Blinded until your next turn. On a successful save, it takes half as much damage and isn't Blinded by this spell. Undead and Oozes have Disadvantage on this saving throw.",
    "You can create a new line of radiance as your action on any turn until the spell ends.",
    "For the duration, a mote of brilliant radiance shines in your hand. It sheds bright light in a 30-foot radius and dim light for an additional 30 feet. The light is sunlight."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT]
  ],
  spellLists: [
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 6
};

export const tashasOtherworldlyGuise: SpellEntry = {
  id: "spell-tashas-otherworldly-guise",
  name: "Tasha's Otherworldly Guise",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "Uttering an incantation, you draw on the magic of the Lower Planes or Upper Planes, your choice, to transform yourself. You gain the following benefits until the spell ends:",
    {
      type: "list",
      style: "bullet",
      items: [
        "You are immune to Fire and Poison damage, Lower Planes, or Radiant and Necrotic damage, Upper Planes.",
        "You are immune to the Poisoned condition, Lower Planes, or the Charmed condition, Upper Planes.",
        "Spectral wings appear on your back, giving you a flying Speed of 40 feet.",
        "You have a +2 bonus to AC.",
        "All your weapon attacks are magical, and when you make a weapon attack, you can use your spellcasting ability modifier instead of Strength or Dexterity for the attack and damage rolls.",
        "You can attack twice, instead of once, when you take the Attack action on your turn. You ignore this benefit if you already have a feature, like Extra Attack, that lets you attack more than once when you take the Attack action on your turn."
      ]
    }
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const tensersTransformation: SpellEntry = {
  id: "spell-tensers-transformation",
  name: "Tenser's Transformation",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 10 minutes",
  description: [
    "You endow yourself with endurance and martial prowess fueled by magic. Until the spell ends, you can't cast spells, and you gain the following benefits:",
    {
      type: "list",
      style: "bullet",
      items: [
        "You gain 50 temporary Hit Points. If any of these remain when the spell ends, they are lost.",
        "You have Advantage on attack rolls that you make with simple and martial weapons.",
        "When you hit a target with a weapon attack, that target takes an extra 2d12 Force damage.",
        "You have Proficiency with all armor, shields, simple weapons, and martial weapons.",
        "You have Proficiency in Strength and Constitution saving throws.",
        "You can attack twice, instead of once, when you take the Attack action on your turn. You ignore this benefit if you already have a feature, like Extra Attack, that gives you extra attacks."
      ]
    },
    "Immediately after the spell ends, you must succeed on a DC 15 Constitution saving throw or suffer one level of Exhaustion."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const transportViaPlants: SpellEntry = {
  id: "spell-transport-via-plants",
  name: "Transport via Plants",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "1 round",
  description: [
    "This spell creates a magical link between a Large or larger inanimate plant within range and another plant, at any distance, on the same plane of existence. You must have seen or touched the destination plant at least once before. For the duration, any creature can step into the target plant and exit from the destination plant by using 5 feet of movement."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const trueSeeing: SpellEntry = {
  id: "spell-true-seeing",
  name: "True Seeing",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "1 hour",
  description: [
    "This spell gives the willing creature you touch the ability to see things as they actually are. For the duration, the creature has Truesight, notices secret doors hidden by magic, and can see into the Ethereal Plane, all out to a range of 120 feet."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 6
};

export const wallOfIce: SpellEntry = {
  id: "spell-wall-of-ice",
  name: "Wall of Ice",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 10 minutes",
  description: [
    "You create a wall of ice on a solid surface within range. You can form it into a hemispherical dome or a sphere with a radius of up to 10 feet, or you can shape a flat surface made up of ten 10-foot-square panels. Each panel must be contiguous with another panel. In any form, the wall is 1 foot thick and lasts for the duration.",
    "If the wall cuts through a creature's space when it appears, the creature within its area is pushed to one side of the wall and must make a Dexterity saving throw. On a failed save, the creature takes 10d6 Cold damage, or half as much damage on a successful save.",
    "The wall is an object that can be damaged and thus breached. It has AC 12 and 30 Hit Points per 10-foot section, and it is Vulnerable to Fire damage. Reducing a 10-foot section of wall to 0 Hit Points destroys it and leaves behind a sheet of frigid air in the space the wall occupied. A creature moving through the sheet of frigid air for the first time on a turn must make a Constitution saving throw. The creature takes 5d6 Cold damage on a failed save, or half as much damage on a successful one.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, the damage the wall deals when it appears increases by 2d6, and the damage from passing through the sheet of frigid air increases by 1d6 for each slot level above 6th."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const wallOfThorns: SpellEntry = {
  id: "spell-wall-of-thorns",
  name: "Wall of Thorns",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 10 minutes",
  description: [
    "You create a wall of tough, pliable, tangled brush bristling with needle-sharp thorns. The wall appears within range on a solid surface and lasts for the duration. You choose to make the wall up to 60 feet long, 10 feet high, and 5 feet thick or a circle that has a 20-foot diameter and is up to 20 feet high and 5 feet thick. The wall blocks line of sight.",
    "When the wall appears, each creature within its area must make a Dexterity saving throw. On a failed save, a creature takes 7d8 Piercing damage, or half as much damage on a successful save.",
    "A creature can move through the wall, albeit slowly and painfully. For every 1 foot a creature moves through the wall, it must spend 4 feet of movement. Furthermore, the first time a creature enters the wall on a turn or ends its turn there, the creature must make a Dexterity saving throw. It takes 7d8 Slashing damage on a failed save, or half as much on a successful save.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, both types of damage increase by 1d8 for each slot level above 6th."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const windWalk: SpellEntry = {
  id: "spell-wind-walk",
  name: "Wind Walk",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "8 hours",
  description: [
    "You and up to ten willing creatures you can see within range assume a gaseous form for the duration, appearing as wisps of cloud. While in this cloud form, a creature has a flying Speed of 300 feet and has Resistance to damage from nonmagical weapons. The only actions a creature can take in this form are the Dash action or to revert to its normal form.",
    "Reverting takes 1 minute, during which time a creature is Incapacitated and can't move. Until the spell ends, a creature can revert to cloud form, which also requires the 1-minute transformation.",
    "If a creature is in cloud form and flying when the effect ends, the creature descends 60 feet per round for 1 minute until it lands, which it does safely. If it can't land after 1 minute, the creature falls the remaining distance."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const wordOfRecall: SpellEntry = {
  id: "spell-word-of-recall",
  name: "Word of Recall",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "5 feet",
  components: [SPELL_COMPONENT.V],
  duration: "Instantaneous",
  description: [
    "You and up to five willing creatures within 5 feet of you instantly teleport to a previously designated sanctuary. You and any creatures that teleport with you appear in the nearest unoccupied space to the spot you designated when you prepared your sanctuary. If you cast this spell without first preparing a sanctuary, the spell has no effect.",
    "You must designate a sanctuary by casting this spell within a location, such as a temple, dedicated to or strongly linked to your deity. If you attempt to cast the spell in this manner in an area that isn't dedicated to your deity, the spell has no effect."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 6
};

export const spellEntries6: SpellEntry[] = [
  arcaneGate,
  bladeBarrier,
  bonesOfTheEarth,
  chainLightning,
  circleOfDeath,
  conjureFey,
  contingency,
  createHomunculus,
  createUndead,
  disintegrate,
  drawmijsInstantSummons,
  druidGrove,
  eyebite,
  findThePath,
  fizbansPlatinumShield,
  fleshToStone,
  forbiddance,
  globeOfInvulnerability,
  gravityFissure,
  guardsAndWards,
  harm,
  heal,
  heroesFeast,
  investitureOfFlame,
  investitureOfIce,
  investitureOfStone,
  investitureOfWind,
  magicJar,
  massSuggestion,
  mentalPrison,
  moveEarth,
  otherworldlyForm,
  otilukesFreezingSphere,
  ottosIrresistibleDance,
  planarAlly,
  primordialWard,
  programmedIllusion,
  psychicCrush,
  scatter,
  soulCage,
  summonFiend,
  sunbeam,
  tashasOtherworldlyGuise,
  tensersTransformation,
  transportViaPlants,
  trueSeeing,
  wallOfIce,
  wallOfThorns,
  windWalk,
  wordOfRecall
];
