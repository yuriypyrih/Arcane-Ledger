import {
  ABILITY_TYPES,
  ACTION_TYPE,
  DURATION,
  DAMAGE_TYPE,
  DICE,
  ENTRY_CATEGORIES,
  MAGIC_SCHOOL,
  SPELL_COMPONENT,
  SPELL_LIST_CLASS,
  TRACKER
} from "../../entries/enums";
import type { SpellEntry } from "../../entries/types";

export const arcaneGate: SpellEntry = {
  id: "spell-arcane-gate",
  name: "Arcane Gate",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "500 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You create linked teleportation portals that remain open for the duration. Choose two points on the ground that you can see, one point within 10 feet of you and one point within 500 feet of you. A circular portal, 10 feet in diameter, opens over each point. If the portal would open in the space occupied by a creature, the spell fails, and the casting is lost.",
    "The portals are two-dimensional glowing rings filled with mist, hovering inches from the ground and perpendicular to it at the points you choose. A ring is visible only from one side, your choice, which is the side that functions as a portal.",
    "Any creature or object entering the portal exits from the other portal as if the two were adjacent to each other. Passing through a portal from the nonportal side has no effect. The mist that fills each portal is opaque and blocks vision through it. On your turn, you can rotate the rings as a Bonus Action so that the active side faces in a different direction."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const bladeBarrier: SpellEntry = {
  id: "spell-blade-barrier",
  name: "Blade Barrier",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_blade-barrier", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You create a wall of whirling blades made of magical energy. The wall appears within range and lasts for the duration. You make a straight wall up to 100 feet long, 20 feet high, and 5 feet thick, or a ringed wall up to 60 feet in diameter, 20 feet high, and 5 feet thick. The wall provides Three-Quarters Cover, and its space is Difficult Terrain. Any creature in the wall's space makes a Dexterity saving throw, taking <strong>6d10</strong> Force damage on a failed save or half as much damage on a successful one. A creature also makes that save if it enters the wall's space or ends it turn there. A creature makes that save only once per turn."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 6
};

export const bonesOfTheEarth: SpellEntry = {
  id: "spell-bones-of-the-earth",
  name: "Bones of the Earth",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You cause up to six pillars of stone to burst from places on the ground that you can see within range. Each pillar is a cylinder that has a diameter of 5 feet and a height of up to 30 feet. The ground where a pillar appears must be wide enough for its diameter, and you can target ground under a creature if that creature is Medium or smaller. Each pillar has AC 5 and 30 Hit Points. When reduced to 0 Hit Points, a pillar crumbles into rubble, which creates an area of difficult terrain with a 10-foot radius. The rubble lasts until cleared.",
    "If a pillar is created under a creature, that creature must succeed on a Dexterity saving throw or be lifted by the pillar. A creature can choose to fail the save.",
    "If a pillar is prevented from reaching its full height because of a ceiling or other obstacle, a creature on the pillar takes <strong>6d6</strong> Bludgeoning damage and is Restrained, pinched between the pillar and the obstacle. The Restrained creature can use an action to make a Strength or Dexterity check, the creature's choice, against the spell save DC. On a success, the creature is no longer Restrained and must either move off the pillar or fall off it.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, you can create two additional pillars for each slot level above 6th."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const chainLightning: SpellEntry = {
  id: "spell-chain-lightning",
  name: "Chain Lightning",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_chain-lightning", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "three silver pins",
  duration: ["Instantaneous"],
  description: [
    "You launch a lightning bolt toward a target you can see within range. Three bolts then leap from that target to as many as three other targets of your choice, each of which must be within 30 feet of the first target. A target can be a creature or an object and can be targeted by only one of the bolts. Each target makes a Dexterity saving throw, taking <strong>10d8</strong> Lightning damage on a failed save or half as much damage on a successful one."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const circleOfDeath: SpellEntry = {
  id: "spell-circle-of-death",
  name: "Circle of Death",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_circle-of-death", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "the powder of a crushed black pearl worth 500+ GP",
  duration: ["Instantaneous"],
  description: [
    "Negative energy ripples out in a 60-foot-radius Sphere from a point you choose within range. Each creature in that area makes a Constitution saving throw, taking <strong>8d8</strong> Necrotic damage on a failed save or half as much damage on a successful one.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>2d8</strong> for each spell slot level above 6."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const conjureFey: SpellEntry = {
  id: "spell-conjure-fey",
  name: "Conjure Fey",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_conjure-fey", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You conjure a Medium spirit from the Feywild in an unoccupied space you can see within range. The spirit lasts for the duration, and it looks like a Fey creature of your choice. When the spirit appears, you can make one melee spell attack against a creature within 5 feet of it. On a hit, the target takes Psychic damage equal to <strong>3d12</strong> plus your spellcasting ability modifier, and the target has the Frightened condition until the start of your next turn, with both you and the spirit as the source of the fear. As a Bonus Action on your later turns, you can teleport the spirit to an unoccupied space you can see within 30 feet of the space it left and make the attack against a creature within 5 feet of it.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d12</strong> for each spell slot level above 6."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D12, DAMAGE_TYPE.PSYCHIC],
    [DICE.D12, DAMAGE_TYPE.PSYCHIC],
    [DICE.D12, DAMAGE_TYPE.PSYCHIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const contingency: SpellEntry = {
  id: "spell-contingency",
  name: "Contingency",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_contingency", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a gem-encrusted statuette of yourself worth 1,500+ GP",
  duration: ["10 day"],
  description: [
    "Choose a spell of level 5 or lower that you can cast, that has a casting time of an action, and that can target you. You cast that spell—called the contingent spell—as part of casting Contingency, expending spell slots for both, but the contingent spell doesn't come into effect. Instead, it takes effect when a certain trigger occurs. You describe that trigger when you cast the two spells. For example, a Contingency cast with Water Breathing might stipulate that Water Breathing comes into effect when you are engulfed in water or a similar liquid. The contingent spell takes effect immediately after the trigger occurs for the first time, whether or not you want it to, and then Contingency ends. The contingent spell takes effect only on you, even if it can normally target others. You can use only one Contingency spell at a time. If you cast this spell again, the effect of another Contingency spell on you ends. Also, Contingency ends on you if its material component is ever not on your person."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const createHomunculus: SpellEntry = {
  id: "spell-create-homunculus",
  name: "Create Homunculus",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.HOUR],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "While speaking an intricate incantation, you cut yourself with a jewel-encrusted dagger, taking <strong>2d4</strong> Piercing damage that can't be reduced in any way. You then drip your blood on the spell's other components and touch them, transforming them into a special Construct called a homunculus. The statistics of the homunculus are in the Monster Manual. It is your faithful companion, and it dies if you die.",
    "Whenever you finish a Long Rest, you can spend up to half your Hit Dice if the homunculus is on the same plane of existence as you. When you do so, roll each die and add your Constitution modifier to it. Your Hit Point maximum is reduced by the total, and the homunculus's Hit Point maximum and current Hit Points are both increased by it. This process can reduce you to no lower than 1 Hit Point, and the change to your and the homunculus's Hit Points ends when you finish your next Long Rest. The reduction to your Hit Point maximum can't be removed by any means before then, except by the homunculus's death.",
    "You can have only one homunculus at a time. If you cast this spell while your homunculus lives, the spell fails."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D4, DAMAGE_TYPE.PIERCING],
    [DICE.D4, DAMAGE_TYPE.PIERCING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const createUndead: SpellEntry = {
  id: "spell-create-undead",
  name: "Create Undead",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_create-undead", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "one 150+ GP black onyx stone for each corpse",
  duration: ["Instantaneous"],
  description: [
    "You can cast this spell only at night. Choose up to three corpses of Medium or Small Humanoids within range. Each one becomes a Ghoul under your control (see \"Monsters\" for its stat block). As a Bonus Action on each of your turns, you can mentally command any creature you animated with this spell if the creature is within 120 feet of you (if you control multiple creatures, you can command any of them at the same time, issuing the same command to them). You decide what action the creature will take and where it will move on its next turn, or you can issue a general command, such as to guard a particular place. If you issue no commands, the creature takes the Dodge action and moves only to avoid harm. Once given an order, the creature continues to follow the order until its task is complete. The creature is under your control for 24 hours, after which it stops obeying any command you've given it. To maintain control of the creature for another 24 hours, you must cast this spell on the creature before the current 24-hour period ends. This use of the spell reasserts your control over up to three creatures you have animated with this spell rather than animating new ones.",
    "<strong>Using a Higher-Level Spell Slot.</strong> If you use a level 7 spell slot, you can animate or reassert control over four Ghouls. If you use a level 8 spell slot, you can animate or reassert control over five Ghouls or two Ghasts or Wights. If you use a level 9 spell slot, you can animate or reassert control over six Ghouls, three Ghasts or Wights, or two Mummies. See \"Monsters\" for these stat blocks."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const disintegrate: SpellEntry = {
  id: "spell-disintegrate",
  name: "Disintegrate",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_disintegrate", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a lodestone and dust",
  duration: ["Instantaneous"],
  description: [
    "You launch a green ray at a target you can see within range. The target can be a creature, a nonmagical object, or a creation of magical force, such as the wall created by Wall of Force. A creature targeted by this spell makes a Dexterity saving throw. On a failed save, the target takes <strong>10d6 + 40</strong> Force damage. If this damage reduces it to 0 Hit Points, it and everything nonmagical it is wearing and carrying are disintegrated into gray dust. The target can be revived only by a True Resurrection or a Wish spell. This spell automatically disintegrates a Large or smaller nonmagical object or a creation of magical force. If such a target is Huge or larger, this spell disintegrates a 10-foot-Cube portion of it.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>3d6</strong> for each spell slot level above 6."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [40, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const druidGrove: SpellEntry = {
  id: "spell-druid-grove",
  name: "Druid Grove",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["24 hours"],
  description: [
    "You invoke the spirits of nature to protect an area outdoors or underground. The area can be as small as a 30-foot cube or as large as a 90-foot cube. Buildings and other structures are excluded from the affected area. If you cast this spell in the same area every day for a year, the spell lasts until dispelled.",
    "The spell creates the following effects within the area. When you cast this spell, you can specify creatures as friends who are immune to the effects. You can also specify a password that, when spoken aloud, makes the speaker immune to these effects. The entire warded area radiates magic. A Dispel Magic cast on the area, if successful, removes only one of the following effects, not the entire area. That spell's caster chooses which effect to end. Only when all its effects are gone is this spell dispelled.",
    { type: "list", style: "bullet", items: ["<strong>Solid Fog.</strong> You can fill any number of 5-foot squares on the ground with thick fog, making them heavily obscured. The fog reaches 10 feet high. In addition, every foot of movement through the fog costs 2 extra feet. To a creature immune to this effect, the fog obscures nothing and looks like soft mist, with motes of green light floating in the air.", "<strong>Grasping Undergrowth.</strong> You can fill any number of 5-foot squares on the ground that aren't filled with fog with grasping weeds and vines, as if they were affected by an Entangle spell. To a creature immune to this effect, the weeds and vines feel soft and reshape themselves to serve as temporary seats or beds.", "<strong>Grove Guardians.</strong> You can animate up to four trees in the area, causing them to uproot themselves from the ground. These trees have the same statistics as an awakened tree, except they can't speak, and their bark is covered with druidic symbols. If any creature not immune to this effect enters the warded area, the grove guardians fight until they have driven off or slain the intruders. The grove guardians also obey your spoken commands, no action required by you, that you issue while in the area. If you don't give them commands and no intruders are present, the grove guardians do nothing. The grove guardians can't leave the warded area. When the spell ends, the magic animating them disappears, and the trees take root again if possible."] },
    "<strong>Additional Spell Effect.</strong> You can place your choice of one of the following magical effects within the warded area:",
    { type: "list", style: "bullet", items: ["A constant Gust of Wind in two locations of your choice.", "Spike Growth in one location of your choice.", "Wind Wall in two locations of your choice."] },
    "To a creature immune to this effect, the winds are a fragrant, gentle breeze, and the area of Spike Growth is harmless."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const eyebite: SpellEntry = {
  id: "spell-eyebite",
  name: "Eyebite",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_eyebite", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "For the duration, your eyes become an inky void. One creature of your choice within 60 feet of you that you can see must succeed on a Wisdom saving throw or be affected by one of the following effects of your choice for the duration. On each of your turns until the spell ends, you can take a Magic action to target another creature but can't target a creature again if it has succeeded on a save against this casting of the spell.",
    "<strong>_Asleep._</strong> The target has the Unconscious condition. It wakes up if it takes any damage or if another creature takes an action to shake it awake.",
    "<strong>_Panicked._</strong> The target has the Frightened condition. On each of its turns, the Frightened target must take the Dash action and move away from you by the safest and shortest route available. If the target moves to a space at least 60 feet away from you where it can't see you, this effect ends.",
    "<strong>_Sickened._</strong> The target has the Poisoned condition."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const findThePath: SpellEntry = {
  id: "spell-find-the-path",
  name: "Find the Path",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_find-the-path", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a set of divination tools—such as cards or runes—worth 100+ GP",
  duration: [DURATION.CONCENTRATION, "up to 1 day"],
  description: [
    "You magically sense the most direct physical route to a location you name. You must be familiar with the location, and the spell fails if you name a destination on another plane of existence, a moving destination (such as a mobile fortress), or an unspecific destination (such as \"a green dragon's lair\"). For the duration, as long as you are on the same plane of existence as the destination, you know how far it is and in what direction it lies. Whenever you face a choice of paths along the way there, you know which path is the most direct."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const fizbansPlatinumShield: SpellEntry = {
  id: "spell-fizbans-platinum-shield",
  name: "Fizban's Platinum Shield",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You create a field of silvery light that surrounds a creature of your choice within range, you can choose yourself. The field sheds dim light out to 5 feet. While surrounded by the field, a creature gains the following benefits:",
    { type: "list", style: "bullet", items: ["<strong>Cover.</strong> The creature has half cover.", "<strong>Damage Resistance.</strong> The creature has Resistance to Acid, Cold, Fire, Lightning, and Poison damage.", "<strong>Evasion.</strong> If the creature is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, the creature instead takes no damage if it succeeds on the saving throw, and only half damage if it fails."] },
    "As a Bonus Action on subsequent turns, you can move the field to another creature within 60 feet of the field."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const fleshToStone: SpellEntry = {
  id: "spell-flesh-to-stone",
  name: "Flesh to Stone",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_flesh-to-stone", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a cockatrice feather",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You attempt to turn one creature that you can see within range into stone. The target makes a Constitution saving throw. On a failed save, it has the Restrained condition for the duration. On a successful save, its Speed is 0 until the start of your next turn. Constructs automatically succeed on the save. A Restrained target makes another Constitution saving throw at the end of each of its turns. If it successfully saves against this spell three times, the spell ends. If it fails its saves three times, it is turned to stone and has the Petrified condition for the duration. The successes and failures needn't be consecutive; keep track of both until the target collects three of a kind. If you maintain your Concentration on this spell for the entire possible duration, the target is Petrified until the condition is ended by Greater Restoration or similar magic."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const forbiddance: SpellEntry = {
  id: "spell-forbiddance",
  name: "Forbiddance",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_forbiddance", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "ruby dust worth 1,000+ GP",
  duration: ["1 day"],
  description: [
    "You create a ward against magical travel that protects up to 40,000 square feet of floor space to a height of 30 feet above the floor. For the duration, creatures can't teleport into the area or use portals, such as those created by the Gate spell, to enter the area. The spell proofs the area against planar travel, and therefore prevents creatures from accessing the area by way of the Astral Plane, the Ethereal Plane, the Feywild, the Shadowfell, or the Plane Shift spell. In addition, the spell damages types of creatures that you choose when you cast it. Choose one or more of the following: Aberrations, Celestials, Elementals, Fey, Fiends, and Undead. When a creature of a chosen type enters the spell's area for the first time on a turn or ends its turn there, the creature takes <strong>5d10</strong> Radiant or Necrotic damage (your choice when you cast this spell). You can designate a password when you cast the spell. A creature that speaks the password as it enters the area takes no damage from the spell. The spell's area can't overlap with the area of another Forbiddance spell. If you cast Forbiddance every day for 30 days in the same location, the spell lasts until it is dispelled, and the Material components are consumed on the last casting."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 6,
  ritual: true
};

export const freezingSphere: SpellEntry = {
  id: "spell-freezing-sphere",
  name: "Freezing Sphere",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_freezing-sphere", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "300 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a miniature crystal sphere",
  duration: ["Instantaneous"],
  description: [
    "A frigid globe streaks from you to a point of your choice within range, where it explodes in a 60-foot-radius Sphere. Each creature in that area makes a Constitution saving throw, taking <strong>10d6</strong> Cold damage on failed save or half as much damage on a successful one.",
    "If the globe strikes a body of water, it freezes the water to a depth of 6 inches over an area 30 feet square. This ice lasts for 1 minute. Creatures that were swimming on the surface of frozen water are trapped in the ice and have the Restrained condition. A trapped creature can take an action to make a Strength (Athletics) check against your spell save DC to break free.",
    "You can refrain from firing the globe after completing the spell's casting. If you do so, a globe about the size of a sling bullet, cool to the touch, appears in your hand. At any time, you or a creature you give the globe to can throw the globe (to a range of 40 feet) or hurl it with a sling (to the sling's normal range). It shatters on impact, with the same effect as a normal casting of the spell. You can also set the globe down without shattering it. After 1 minute, if the globe hasn't already shattered, it explodes.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d6</strong> for each spell slot level above 6."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const globeOfInvulnerability: SpellEntry = {
  id: "spell-globe-of-invulnerability",
  name: "Globe of Invulnerability",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_globe-of-invulnerability", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a glass bead",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "An immobile, shimmering barrier appears in a 10 foot Emanation around you and remains for the duration. Any spell of level 5 or lower cast from outside the barrier can't affect anything within it. Such a spell can target creatures and objects within the barrier, but the spell has no effect on them. Similarly, the area within the barrier is excluded from areas of effect created by such spells.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The barrier blocks spells of 1 level higher for each spell slot level above 6."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const gravityFissure: SpellEntry = {
  id: "spell-gravity-fissure",
  name: "Gravity Fissure",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (100-foot line)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You manifest a ravine of gravitational energy in a line originating from you that is 100 feet long and 5 feet wide. Each creature in that line must make a Constitution saving throw, taking <strong>8d8</strong> Force damage on a failed save, or half as much damage on a successful one.",
    "Each creature within 10 feet of the line but not in it must succeed on a Constitution saving throw or take <strong>8d8</strong> Force damage and be pulled toward the line until the creature is in its area.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, the damage increases by <strong>1d8</strong> for each slot level above 6th."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
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
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const guardsAndWards: SpellEntry = {
  id: "spell-guards-and-wards",
  name: "Guards and Wards",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_guards-and-wards", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.HOUR],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a silver rod worth 10+ GP",
  duration: ["24 hours"],
  description: [
    "You create a ward that protects up to 2,500 square feet of floor space. The warded area can be up to 20 feet tall, and you shape it as one 50-foot square, one hundred 5-foot squares that are contiguous, or twenty-five 10-foot squares that are contiguous.",
    "When you cast this spell, you can specify individuals that are unaffected by the spell's effects. You can also specify a password that, when spoken aloud within 5 feet of the warded area, makes the speaker immune to its effects.",
    "The spell creates the effects below within the warded area. Dispel Magic has no effect on Guards and Wards itself, but each of the following effects can be dispelled. If all four are dispelled, Guards and Wards ends. If you cast the spell every day for 365 days on the same area, the spell thereafter lasts until all its effects are dispelled.",
    "<strong>_Corridors._</strong> Fog fills all the warded corridors, making them Heavily Obscured. In addition, at each intersection or branching passage offering a choice of direction, there is a 50 percent chance that a creature other than you believes it is going in the opposite direction from the one it chooses.",
    "<strong>_Doors._</strong> All doors in the warded area are magically locked, as if sealed by the <em>Arcane Lock</em> spell. In addition, you can cover up to ten doors with an illusion to make them appear as plain sections of wall.",
    "<strong>_Stairs._</strong> Webs fill all stairs in the warded area from top to bottom, as in the <em>Web</em> spell. These strands regrow in 10 minutes if they are destroyed while <em>Guards and Wards</em> lasts.",
    "<strong>_Other Spell Effect._</strong> Place one of the following magical effects within the warded area:",
    { type: "list", style: "bullet", items: ["<em>Dancing Lights</em> in four corridors, with a simple program that the lights repeat as long as Guards and Wards lasts", "<em>Magic Mouth</em> in two locations", "<em>Stinking Cloud</em> in two locations (the vapors return within 10 minutes if dispersed while Guards and Wards lasts) - Gust of Wind in one corridor or room (the wind blows continuously while the spell lasts)", "<em>Suggestion</em> in one 5-foot square; any creature that enters that square receives the suggestion mentally"] }
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const harm: SpellEntry = {
  id: "spell-harm",
  name: "Harm",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_harm", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You unleash virulent magic on a creature you can see within range. The target makes a Constitution saving throw. On a failed save, it takes <strong>14d6</strong> Necrotic damage, and its Hit Point maximum is reduced by an amount equal to the Necrotic damage it took. On a successful save, it takes half as much damage only. This spell can't reduce a target's Hit Point maximum below 1."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
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
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 6
};

export const heal: SpellEntry = {
  id: "spell-heal",
  name: "Heal",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_heal", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "Choose a creature that you can see within range. Positive energy washes through the target, restoring 70 Hit Points. This spell also ends the Blinded, Deafened, and Poisoned conditions on the target.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The healing increases by 10 for each spell slot level above 6."
  ],
  isHealingSpell: true,
  damage: [],
  healing: [70],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const heroesFeast: SpellEntry = {
  id: "spell-heroes-feast",
  name: "Heroes' Feast",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_heroes-feast", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a gem-encrusted bowl worth 1,000+ GP, which the spell consumes",
  duration: ["Instantaneous"],
  description: [
    "You conjure a feast that appears on a surface in an unoccupied 10-foot Cube next to you. The feast takes 1 hour to consume and disappears at the end of that time, and the beneficial effects don't set in until this hour is over. Up to twelve creatures can partake of the feast. A creature that partakes gains several benefits, which last for 24 hours. The creature has Resistance to Poison damage, and it has Immunity to the Frightened and Poisoned conditions. Its Hit Point maximum also increases by <strong>2d10</strong>, and it gains the same number of Hit Points."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const instantSummons: SpellEntry = {
  id: "spell-instant-summons",
  name: "Instant Summons",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_instant-summons", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a sapphire worth 1,000+ GP",
  duration: ["Until dispelled"],
  description: [
    "You touch the sapphire used in the casting and an object weighing 10 pounds or less whose longest dimension is 6 feet or less. The spell leaves an Invisible mark on that object and invisibly inscribes the object's name on the sapphire. Each time you cast this spell, you must use a different sapphire. Thereafter, you can take a Magic action to speak the object's name and crush the sapphire. The object instantly appears in your hand regardless of physical or planar distances, and the spell ends. If another creature is holding or carrying the object, crushing the sapphire doesn't transport it, but instead you learn who that creature is and where that creature is currently located."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6,
  ritual: true
};

export const investitureOfFlame: SpellEntry = {
  id: "spell-investiture-of-flame",
  name: "Investiture of Flame",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Flames race across your body, shedding bright light in a 30-foot radius and dim light for an additional 30 feet for the spell's duration. The flames don't harm you. Until the spell ends, you gain the following benefits:",
    { type: "list", style: "bullet", items: ["You are immune to Fire damage and have Resistance to Cold damage.", "Any creature that moves within 5 feet of you for the first time on a turn or ends its turn there takes <strong>1d10</strong> Fire damage.", "You can use your action to create a line of fire 15 feet long and 5 feet wide extending from you in a direction you choose. Each creature in the line must make a Dexterity saving throw. A creature takes <strong>4d8</strong> Fire damage on a failed save, or half as much damage on a successful one."] }
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const investitureOfIce: SpellEntry = {
  id: "spell-investiture-of-ice",
  name: "Investiture of Ice",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Until the spell ends, ice rimes your body, and you gain the following benefits:",
    { type: "list", style: "bullet", items: ["You are immune to Cold damage and have Resistance to Fire damage.", "You can move across difficult terrain created by ice or snow without spending extra movement.", "The ground in a 10-foot radius around you is icy and is difficult terrain for creatures other than you. The radius moves with you.", "You can use your action to create a 15-foot cone of freezing wind extending from your outstretched hand in a direction you choose. Each creature in the cone must make a Constitution saving throw. A creature takes <strong>4d6</strong> Cold damage on a failed save, or half as much damage on a successful one. A creature that fails its save against this effect has its Speed halved until the start of your next turn."] }
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const investitureOfStone: SpellEntry = {
  id: "spell-investiture-of-stone",
  name: "Investiture of Stone",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Until the spell ends, bits of rock spread across your body, and you gain the following benefits:",
    { type: "list", style: "bullet", items: ["You have Resistance to Bludgeoning, Piercing, and Slashing damage from nonmagical weapons.", "You can use your action to create a small earthquake on the ground in a 15-foot radius centered on you. Other creatures on that ground must succeed on a Dexterity saving throw or be knocked Prone.", "You can move across difficult terrain made of earth or stone without spending extra movement. You can move through solid earth or stone as if it was air and without destabilizing it, but you can't end your movement there. If you do so, you are ejected to the nearest unoccupied space, this spell ends, and you are Stunned until the end of your next turn."] }
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const investitureOfWind: SpellEntry = {
  id: "spell-investiture-of-wind",
  name: "Investiture of Wind",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Until the spell ends, wind whirls around you, and you gain the following benefits:",
    { type: "list", style: "bullet", items: ["Ranged weapon attacks made against you have Disadvantage on the attack roll.", "You gain a flying Speed of 60 feet. If you are still flying when the spell ends, you fall, unless you can somehow prevent it.", "You can use your action to create a 15-foot cube of swirling wind centered on a point you can see within 60 feet of you. Each creature in that area must make a Constitution saving throw. A creature takes <strong>2d10</strong> Bludgeoning damage on a failed save, or half as much damage on a successful one. If a Large or smaller creature fails the save, that creature is also pushed up to 10 feet away from the center of the cube."] }
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const irresistibleDance: SpellEntry = {
  id: "spell-irresistible-dance",
  name: "Irresistible Dance",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_irresistible-dance", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "One creature that you can see within range must make a Wisdom saving throw. On a successful save, the target dances comically until the end of its next turn, during which it must spend all its movement to dance in place. On a failed save, the target has the Charmed condition for the duration. While Charmed, the target dances comically, must use all its movement to dance in place, and has Disadvantage on Dexterity saving throws and attack rolls, and other creatures have Advantage on attack rolls against it. On each of its turns, the target can take an action to collect itself and repeat the save, ending the spell on itself on a success."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isAttackSpell: true,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const magicJar: SpellEntry = {
  id: "spell-magic-jar",
  name: "Magic Jar",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_magic-jar", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a gem, crystal, or reliquary worth 500+ GP",
  duration: ["Until dispelled"],
  description: [
    "Your body falls into a catatonic state as your soul leaves it and enters the container you used for the spell's Material component. While your soul inhabits the container, you are aware of your surroundings as if you were in the container's space. You can't move or take Reactions. The only action you can take is to project your soul up to 100 feet out of the container, either returning to your living body (and ending the spell) or attempting to possess a Humanoid's body. You can attempt to possess any Humanoid within 100 feet of you that you can see (creatures warded by a Protection from Evil and Good or Magic Circle spell can't be possessed). The target makes a Charisma saving throw. On a failed save, your soul enters the target's body, and the target's soul becomes trapped in the container. On a successful save, the target resists your efforts to possess it, and you can't attempt to possess it again for 24 hours. Once you possess a creature's body, you control it. Your Hit Points, Hit Point Dice, Strength, Dexterity, Constitution, Speed, and senses are replaced by the creature's. You otherwise keep your game statistics. Meanwhile, the possessed creature's soul can perceive from the container using its own senses, but it can't move and it is Incapacitated. While possessing a body, you can take a Magic action to return from the host body to the container if it is within 100 feet of you, returning the host creature's soul to its body. If the host body dies while you're in it, the creature dies, and you make a Charisma saving throw against your own spellcasting DC. On a success, you return to the container if it is within 100 feet of you. Otherwise, you die. If the container is destroyed or the spell ends, your soul returns to your body. If your body is more than 100 feet away from you or if your body is dead, you die. If another creature's soul is in the container when it is destroyed, the creature's soul returns to its body if the body is alive and within 100 feet. Otherwise, that creature dies. When the spell ends, the container is destroyed."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CHA,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const massSuggestion: SpellEntry = {
  id: "spell-mass-suggestion",
  name: "Mass Suggestion",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_mass-suggestion", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.M],
  materialSpecified: "a snake's tongue",
  duration: ["24 hours"],
  description: [
    "You suggest a course of activity—described in no more than 25 words—to twelve or fewer creatures you can see within range that can hear and understand you. The suggestion must sound achievable and not involve anything that would obviously deal damage to any of the targets or their allies. For example, you could say, \"Walk to the village down that road, and help the villagers there harvest crops until sunset.\" Or you could say, \"Now is not the time for violence. Drop your weapons, and dance! Stop in an hour.\" Each target must succeed on a Wisdom saving throw or have the Charmed condition for the duration or until you or your allies deal damage to the target. Each Charmed target pursues the suggestion to the best of its ability. The suggested activity can continue for the entire duration, but if the suggested activity can be completed in a shorter time, the spell ends for a target upon completing it.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The duration is longer with a spell slot of level 7 (10 days), 8 (30 days), or 9 (366 days)."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const mentalPrison: SpellEntry = {
  id: "spell-mental-prison",
  name: "Mental Prison",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You attempt to bind a creature within an illusory cell that only it perceives. One creature you can see within range must make an Intelligence saving throw. The target succeeds automatically if it is immune to being Charmed. On a successful save, the target takes <strong>5d10</strong> Psychic damage, and the spell ends.",
    "On a failed save, the target takes <strong>5d10</strong> Psychic damage, and you make the area immediately around the target's space appear dangerous to it in some way. You might cause the target to perceive itself as being surrounded by fire, floating razors, or hideous maws filled with dripping teeth. Whatever form the illusion takes, the target can't see or hear anything beyond it and is Restrained for the spell's duration.",
    "If the target is moved out of the illusion, makes a melee attack through it, or reaches any part of its body through it, the target takes <strong>10d10</strong> Psychic damage, and the spell ends."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.INT,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const moveEarth: SpellEntry = {
  id: "spell-move-earth",
  name: "Move Earth",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_move-earth", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a miniature shovel",
  duration: [DURATION.CONCENTRATION, "up to 2 hours"],
  description: [
    "Choose an area of terrain no larger than 40 feet on a side within range. You can reshape dirt, sand, or clay in the area in any manner you choose for the duration. You can raise or lower the area's elevation, create or fill in a trench, erect or flatten a wall, or form a pillar. The extent of any such changes can't exceed half the area's largest dimension. For example, if you affect a 40-foot square, you can create a pillar up to 20 feet high, raise or lower the square's elevation by up to 20 feet, dig a trench up to 20 feet deep, and so on. It takes 10 minutes for these changes to complete. Because the terrain's transformation occurs slowly, creatures in the area can't usually be trapped or injured by the ground's movement. At the end of every 10 minutes you spend concentrating on the spell, you can choose a new area of terrain to affect within range. This spell can't manipulate natural stone or stone construction. Rocks and structures shift to accommodate the new terrain. If the way you shape the terrain would make a structure unstable, it might collapse. Similarly, this spell doesn't directly affect plant growth. The moved earth carries any plants along with it."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const otherworldlyForm: SpellEntry = {
  id: "spell-otherworldly-form",
  name: "Otherworldly Form",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Uttering an incantation, you draw on the magic of the Lower Planes or Upper Planes, your choice, to transform yourself. You gain the following benefits until the spell ends:",
    { type: "list", style: "bullet", items: ["You are immune to Fire and Poison damage, Lower Planes, or Radiant and Necrotic damage, Upper Planes.", "You are immune to the Poisoned condition, Lower Planes, or the Charmed condition, Upper Planes.", "Spectral wings appear on your back, giving you a flying Speed of 40 feet.", "You have a +2 bonus to AC.", "All your weapon attacks are magical, and when you make a weapon attack, you can use your spellcasting ability modifier, instead of Strength or Dexterity, for the attack and damage rolls.", "You can attack twice, instead of once, when you take the Attack action on your turn. You ignore this benefit if you already have a feature, like Extra Attack, that gives you extra attacks."] }
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const planarAlly: SpellEntry = {
  id: "spell-planar-ally",
  name: "Planar Ally",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_planar-ally", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You beseech an otherworldly entity for aid. The being must be known to you: a god, a demon prince, or some other being of cosmic power. That entity sends a Celestial, an Elemental, or a Fiend loyal to it to aid you, making the creature appear in an unoccupied space within range. If you know a specific creature's name, you can speak that name when you cast this spell to request that creature, though you might get a different creature anyway (GM's choice). When the creature appears, it is under no compulsion to behave a particular way. You can ask it to perform a service in exchange for payment, but it isn't obliged to do so. The requested task could range from simple (fly us across the chasm, or help us fight a battle) to complex (spy on our enemies, or protect us during our foray into the dungeon). You must be able to communicate with the creature to bargain for its services. Payment can take a variety of forms. A Celestial might require a sizable donation of gold or magic items to an allied temple, while a Fiend might demand a living sacrifice or a gift of treasure. Some creatures might exchange their service for a quest undertaken by you. A task that can be measured in minutes requires a payment worth 100 GP per minute. A task measured in hours requires 1,000 GP per hour. And a task measured in days (up to 10 days) requires 10,000 GP per day. The GM can adjust these payments based on the circumstances under which you cast the spell. If the task is aligned with the creature's ethos, the payment might be halved or even waived. Nonhazardous tasks typically require only half the suggested payment, while especially dangerous tasks might require a greater gift. Creatures rarely accept tasks that seem suicidal. After the creature completes the task, or when the agreed-upon duration of service expires, the creature returns to its home plane after reporting back to you if possible. If you are unable to agree on a price for the creature's service, the creature immediately returns to its home plane."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 6
};

export const primordialWard: SpellEntry = {
  id: "spell-primordial-ward",
  name: "Primordial Ward",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You have Resistance to Acid, Cold, Fire, Lightning, and Thunder damage for the spell's duration.",
    "When you take damage of one of those types, you can use your Reaction to gain immunity to that type of damage, including against the triggering damage. If you do so, the resistances end, and you have the immunity until the end of your next turn, at which time the spell ends."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const programmedIllusion: SpellEntry = {
  id: "spell-programmed-illusion",
  name: "Programmed Illusion",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_programmed-illusion", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "jade dust worth 25+ GP",
  duration: ["Until dispelled"],
  description: [
    "You create an illusion of an object, a creature, or some other visible phenomenon within range that activates when a specific trigger occurs. The illusion is imperceptible until then. It must be no larger than a 30-foot Cube, and you decide when you cast the spell how the illusion behaves and what sounds it makes. This scripted performance can last up to 5 minutes. When the trigger you specify occurs, the illusion springs into existence and performs in the manner you described. Once the illusion finishes performing, it disappears and remains dormant for 10 minutes, after which the illusion can be activated again. The trigger can be as general or as detailed as you like, though it must be based on visual or audible phenomena that occur within 30 feet of the area. For example, you could create an illusion of yourself to appear and warn off others who attempt to open a trapped door. Physical interaction with the image reveals it to be illusory, since things can pass through it. A creature that takes the Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const psychicCrush: SpellEntry = {
  id: "spell-psychic-crush",
  name: "Psychic Crush",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 minute"],
  description: [
    "You overload the mind of one creature you can see within range, filling its psyche with discordant emotions. The target must make an Intelligence saving throw. On a failed save, the target takes <strong>12d6</strong> Psychic damage and is Stunned for 1 minute. On a successful save, the target takes half as much damage and isn't Stunned.",
    "The Stunned target can make an Intelligence saving throw at the end of each of its turns. On a successful save, the spell ends on the target."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.INT,
  isDamagingSpell: true,
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
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const scatter: SpellEntry = {
  id: "spell-scatter",
  name: "Scatter",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "The air quivers around up to five creatures of your choice that you can see within range. An unwilling creature must succeed on a Wisdom saving throw to resist this spell. You teleport each affected target to an unoccupied space that you can see within 120 feet of you. That space must be on the ground or on a floor."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const soulCage: SpellEntry = {
  id: "spell-soul-cage",
  name: "Soul Cage",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.REACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["8 hours"],
  description: [
    "This spell snatches the soul of a Humanoid as it dies and traps it inside the tiny cage you use for the material component. A stolen soul remains inside the cage until the spell ends or until you destroy the cage, which ends the spell. While you have a soul inside the cage, you can exploit it in any of the ways described below. You can use a trapped soul up to six times. Once you exploit a soul for the sixth time, it is released, and the spell ends. While a soul is trapped, the dead Humanoid it came from can't be revived.",
    { type: "list", style: "bullet", items: ["<strong>Steal Life.</strong> You can use a Bonus Action to drain vigor from the soul and regain <strong>2d8</strong> Hit Points.", "<strong>Query Soul.</strong> You ask the soul a question, no action required, and receive a brief telepathic answer, which you can understand regardless of the language used. The soul knows only what it knew in life, but it must answer you truthfully and to the best of its ability. The answer is no more than a sentence or two and might be cryptic.", "<strong>Borrow Experience.</strong> You can use a Bonus Action to bolster yourself with the soul's life experience, making your next attack roll, ability check, or saving throw with Advantage. If you don't use this benefit before the start of your next turn, it is lost.", "<strong>Eyes of the Dead.</strong> You can use an action to name a place the Humanoid saw in life, which creates an invisible sensor somewhere in that place if it is on the plane of existence you're currently on. The sensor remains for as long as you concentrate, up to 10 minutes, as if you were concentrating on a spell. You receive visual and auditory information from the sensor as if you were in its space using your senses."] },
    "A creature that can see the sensor, such as one using See Invisibility or Truesight, sees a translucent image of the tormented Humanoid whose soul you caged."
  ],
  isHealingSpell: true,
  damage: [],
  healing: [DICE.D8, DICE.D8],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const summonFiend: SpellEntry = {
  id: "spell-summon-fiend",
  name: "Summon Fiend",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You call forth a fiendish spirit. It manifests in an unoccupied space that you can see within range. This corporeal form uses the Fiendish Spirit stat block. When you cast the spell, choose Demon, Devil, or Yugoloth. The creature resembles a Fiend of the chosen type, which determines certain traits in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.",
    "The creature is an ally to you and your companions. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands, no action required by you. If you don't issue any, it takes the Dodge action and uses its move to avoid danger.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 7th level or higher, use the higher level wherever the spell's level appears in the stat block."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const sunbeam: SpellEntry = {
  id: "spell-sunbeam",
  name: "Sunbeam",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_sunbeam", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a magnifying glass",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You launch a sunbeam in a 5-foot-wide, 60-foot-long Line. Each creature in the Line makes a Constitution saving throw. On a failed save, a creature takes <strong>6d8</strong> Radiant damage and has the Blinded condition until the start of your next turn. On a successful save, it takes half as much damage only. Until the spell ends, you can take a Magic action to create a new Line of radiance. For the duration, a mote of brilliant radiance shines above you. It sheds Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. This light is sunlight."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const tashasBubblingCauldron: SpellEntry = {
  id: "spell-tashas-bubbling-cauldron",
  name: "Tasha's Bubbling Cauldron",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "phb-2024", documentName: "Player's Handbook", ruleset: "5e-2024", publisherKey: "wizards-of-the-coast" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "5 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["10 minutes"],
  description: [
    "You conjure a claw-footed cauldron filled with bubbling liquid. The cauldron appears in an unoccupied space on the ground within 5 feet of you and lasts for the duration. The cauldron can't be moved and disappears when the spell ends, along with the bubbling liquid inside it.",
    "The liquid in the cauldron duplicates the properties of a Common or an Uncommon potion of your choice, such as a Potion of Healing. As a Bonus Action, you or an ally can reach into the cauldron and withdraw one potion of that kind. The potion is contained in a vial that disappears when the potion is consumed. The cauldron can produce a number of these potions equal to your spellcasting ability modifier, minimum 1. When the last of these potions is withdrawn from the cauldron, the cauldron disappears, and the spell ends.",
    "Potions obtained from the cauldron that aren't consumed disappear when you cast this spell again."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const tashasOtherworldlyGuise: SpellEntry = {
  id: "spell-tashas-otherworldly-guise",
  name: "Tasha's Otherworldly Guise",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Uttering an incantation, you draw on the magic of the Lower Planes or Upper Planes, your choice, to transform yourself. You gain the following benefits until the spell ends:",
    { type: "list", style: "bullet", items: ["You are immune to Fire and Poison damage, Lower Planes, or Radiant and Necrotic damage, Upper Planes.", "You are immune to the Poisoned condition, Lower Planes, or the Charmed condition, Upper Planes.", "Spectral wings appear on your back, giving you a flying Speed of 40 feet.", "You have a +2 bonus to AC.", "All your weapon attacks are magical, and when you make a weapon attack, you can use your spellcasting ability modifier instead of Strength or Dexterity for the attack and damage rolls.", "You can attack twice, instead of once, when you take the Attack action on your turn. You ignore this benefit if you already have a feature, like Extra Attack, that lets you attack more than once when you take the Attack action on your turn."] }
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const tensersTransformation: SpellEntry = {
  id: "spell-tensers-transformation",
  name: "Tenser's Transformation",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You endow yourself with endurance and martial prowess fueled by magic. Until the spell ends, you can't cast spells, and you gain the following benefits:",
    { type: "list", style: "bullet", items: ["You gain 50 temporary Hit Points. If any of these remain when the spell ends, they are lost.", "You have Advantage on attack rolls that you make with simple and martial weapons.", "When you hit a target with a weapon attack, that target takes an extra <strong>2d12</strong> Force damage.", "You have Proficiency with all armor, shields, simple weapons, and martial weapons.", "You have Proficiency in Strength and Constitution saving throws.", "You can attack twice, instead of once, when you take the Attack action on your turn. You ignore this benefit if you already have a feature, like Extra Attack, that gives you extra attacks."] },
    "Immediately after the spell ends, you must succeed on a DC 15 Constitution saving throw or suffer one level of Exhaustion."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D12, DAMAGE_TYPE.FORCE],
    [DICE.D12, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const transportViaPlants: SpellEntry = {
  id: "spell-transport-via-plants",
  name: "Transport via Plants",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_transport-via-plants", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 minute"],
  description: [
    "This spell creates a magical link between a Large or larger inanimate plant within range and another plant, at any distance, on the same plane of existence. You must have seen or touched the destination plant at least once before. For the duration, any creature can step into the target plant and exit from the destination plant by using 5 feet of movement."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const trueSeeing: SpellEntry = {
  id: "spell-true-seeing",
  name: "True Seeing",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_true-seeing", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "mushroom powder worth 25+ GP, which the spell consumes",
  duration: ["1 hour"],
  description: [
    "For the duration, the willing creature you touch has Truesight with a range of 120 feet."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const wallOfIce: SpellEntry = {
  id: "spell-wall-of-ice",
  name: "Wall of Ice",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_wall-of-ice", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a piece of quartz",
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You create a wall of ice on a solid surface within range. You can form it into a hemispherical dome or a globe with a radius of up to 10 feet, or you can shape a flat surface made up of ten 10-foot-square panels. Each panel must be contiguous with another panel. In any form, the wall is 1 foot thick and lasts for the duration. If the wall cuts through a creature's space when it appears, the creature is pushed to one side of the wall (you choose which side) and makes a Dexterity saving throw, taking <strong>10d6</strong> Cold damage on a failed save or half as much damage on a successful one. The wall is an object that can be damaged and thus breached. It has AC 12 and 30 Hit Points per 10-foot section, and it has Immunity to Cold, Poison, and Psychic damage and Vulnerability to Fire damage. Reducing a 10-foot section of wall to 0 Hit Points destroys it and leaves behind a sheet of frigid air in the space the wall occupied. A creature moving through the sheet of frigid air for the first time on a turn makes a Constitution saving throw, taking <strong>5d6</strong> Cold damage on a failed save or half as much damage on a successful one.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage the wall deals when it appears increases by <strong>2d6</strong> and the damage from passing through the sheet of frigid air increases by <strong>1d6</strong> for each spell slot level above 6."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
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
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
};

export const wallOfThorns: SpellEntry = {
  id: "spell-wall-of-thorns",
  name: "Wall of Thorns",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_wall-of-thorns", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a handful of thorns",
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You create a wall of tangled brush bristling with needle-sharp thorns. The wall appears within range on a solid surface and lasts for the duration. You choose to make the wall up to 60 feet long, 10 feet high, and 5 feet thick or a circle that has a 20-foot diameter and is up to 20 feet high and 5 feet thick. The wall blocks line of sight. When the wall appears, each creature in its area makes a Dexterity saving throw, taking <strong>7d8</strong> Piercing damage on a failed save or half as much damage on a successful one. A creature can move through the wall, albeit slowly and painfully. For every 1 foot a creature moves through the wall, it must spend 4 feet of movement. Furthermore, the first time a creature enters a space in the wall on a turn or ends its turn there, the creature makes a Dexterity saving throw, taking <strong>7d8</strong> Slashing damage on a failed save or half as much damage on a successful one. A creature makes this save only once per turn.",
    "<strong>Using a Higher-Level Spell Slot.</strong> Both types of damage increase by <strong>1d8</strong> for each spell slot level above 6."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const windWalk: SpellEntry = {
  id: "spell-wind-walk",
  name: "Wind Walk",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_wind-walk", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a candle",
  duration: ["8 hours"],
  description: [
    "You and up to ten willing creatures of your choice within range assume gaseous forms for the duration, appearing as wisps of cloud. While in this cloud form, a target has a Fly Speed of 300 feet and can hover; it has Immunity to the Prone condition; and it has Resistance to Bludgeoning, Piercing, and Slashing damage. The only actions a target can take in this form are the Dash action or a Magic action to begin reverting to its normal form. Reverting takes 1 minute, during which the target has the Stunned condition. Until the spell ends, the target can revert to cloud form, which also requires a Magic action followed by a 1-minute transformation. If a target is in cloud form and flying when the effect ends, the target descends 60 feet per round for 1 minute until it lands, which it does safely. If it can't land after 1 minute, it falls the remaining distance."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 6
};

export const wordOfRecall: SpellEntry = {
  id: "spell-word-of-recall",
  name: "Word of Recall",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_word-of-recall", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "5 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You and up to five willing creatures within 5 feet of you instantly teleport to a previously designated sanctuary. You and any creatures that teleport with you appear in the nearest unoccupied space to the spot you designated when you prepared your sanctuary (see below). If you cast this spell without first preparing a sanctuary, the spell has no effect. You must designate a location, such as a temple, as a sanctuary by casting this spell there."
  ],
  damage: [],
  healing: [],
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
  druidGrove,
  eyebite,
  findThePath,
  fizbansPlatinumShield,
  fleshToStone,
  forbiddance,
  freezingSphere,
  globeOfInvulnerability,
  gravityFissure,
  guardsAndWards,
  harm,
  heal,
  heroesFeast,
  instantSummons,
  investitureOfFlame,
  investitureOfIce,
  investitureOfStone,
  investitureOfWind,
  irresistibleDance,
  magicJar,
  massSuggestion,
  mentalPrison,
  moveEarth,
  otherworldlyForm,
  planarAlly,
  primordialWard,
  programmedIllusion,
  psychicCrush,
  scatter,
  soulCage,
  summonFiend,
  sunbeam,
  tashasBubblingCauldron,
  tashasOtherworldlyGuise,
  tensersTransformation,
  transportViaPlants,
  trueSeeing,
  wallOfIce,
  wallOfThorns,
  windWalk,
  wordOfRecall
];
