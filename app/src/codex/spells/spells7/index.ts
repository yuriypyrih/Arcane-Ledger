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
import { spellDurationOnlyTrackingMessage } from "../trackingMessages";

export const arcaneSword: SpellEntry = {
  id: "spell-arcane-sword",
  name: "Arcane Sword",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_arcane-sword",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a miniature sword worth 250+ GP",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You create a spectral sword that hovers within range. It lasts for the duration. When the sword appears, you make a melee spell attack against a target within 5 feet of the sword. On a hit, the target takes Force damage equal to <strong>4d12</strong> plus your spellcasting ability modifier. On your later turns, you can take a Bonus Action to move the sword up to 30 feet to a spot you can see and repeat the attack against the same target or a different one."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D12, DAMAGE_TYPE.FORCE],
    [DICE.D12, DAMAGE_TYPE.FORCE],
    [DICE.D12, DAMAGE_TYPE.FORCE],
    [DICE.D12, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const conjureCelestial: SpellEntry = {
  id: "spell-conjure-celestial",
  name: "Conjure Celestial",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_conjure-celestial",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You conjure a spirit from the Upper Planes, which manifests as a pillar of light in a 10-foot-radius, 40-foot-high Cylinder centered on a point within range. For each creature you can see in the Cylinder, choose which of these lights shines on it: Until the spell ends, Bright Light fills the Cylinder, and when you move on your turn, you can also move the Cylinder up to 30 feet. Whenever the Cylinder moves into the space of a creature you can see and whenever a creature you can see enters the Cylinder or ends its turn there, you can bathe it in one of the lights. A creature can be affected by this spell only once per turn.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The healing and damage increase by <strong>1d12</strong> for each spell slot level above 7."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 7
};

export const conjureHezrou: SpellEntry = {
  id: "spell-conjure-hezrou",
  name: "Conjure Hezrou",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "legacy-local",
    documentName: "Legacy / Expanded Local",
    ruleset: "legacy-local"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You summon a hezrou that appears in an unoccupied space you can see within range. The hezrou disappears when it drops to 0 Hit Points or when the spell ends.",
    "The hezrou's attitude depends on the value of the food used as a material component for this spell. Roll Initiative for the hezrou, which has its own turns. At the start of the hezrou's turn, the GM makes a secret Charisma check on your behalf, with a bonus equal to the food's value divided by 20. The check DC starts at 10 and increases by 2 each round. You can issue orders to the hezrou and have it obey you as long as you succeed on the Charisma check.",
    "If the check fails, the spell no longer requires Concentration and the demon is no longer under your control. The hezrou then focuses on devouring any corpses it can see. If there are no such meals at hand, it attacks the nearest creatures and eats anything it kills. If its Hit Points are reduced to below half its Hit Point maximum, it returns to the Abyss.",
    "As part of casting the spell, you can scribe a circle on the ground using the blood of an intelligent Humanoid slain within the past 24 hours. The circle is large enough to encompass your space. The summoned hezrou cannot cross the circle or target anyone in it while the spell lasts."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const createMagen: SpellEntry = {
  id: "spell-create-magen",
  name: "Create Magen",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "legacy-local",
    documentName: "Legacy / Expanded Local",
    ruleset: "legacy-local"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.HOUR],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "While casting the spell, you place a vial of quicksilver in the chest of a life-sized Human doll stuffed with ash or dust. You then stitch up the doll and drip your blood on it. At the end of the casting, you tap the doll with a crystal rod, transforming it into a magen clothed in whatever the doll was wearing. The type of magen is chosen by you during the casting of the spell.",
    "When the magen appears, your Hit Point maximum decreases by an amount equal to the magen's Challenge Rating, minimum reduction of 1. Only a Wish spell can undo this reduction to your Hit Point maximum.",
    "Any magen you create with this spell obeys your commands without question."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const crownOfStars: SpellEntry = {
  id: "spell-crown-of-stars",
  name: "Crown of Stars",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "legacy-local",
    documentName: "Legacy / Expanded Local",
    ruleset: "legacy-local"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 hour"],
  description: [
    "Seven star-like motes of light appear and orbit your head until the spell ends. You can use a Bonus Action to send one of the motes streaking toward one creature or object within 120 feet of you. When you do so, make a ranged spell attack. On a hit, the target takes <strong>4d12</strong> Radiant damage. Whether you hit or miss, the mote is expended. The spell ends early if you expend the last mote.",
    "If you have four or more motes remaining, they shed bright light in a 30-foot radius and dim light for an additional 30 feet. If you have one to three motes remaining, they shed dim light in a 30-foot radius.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 8th level or higher, the number of motes created increases by two for each slot level above 7th."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D12, DAMAGE_TYPE.RADIANT],
    [DICE.D12, DAMAGE_TYPE.RADIANT],
    [DICE.D12, DAMAGE_TYPE.RADIANT],
    [DICE.D12, DAMAGE_TYPE.RADIANT]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const delayedBlastFireball: SpellEntry = {
  id: "spell-delayed-blast-fireball",
  name: "Delayed Blast Fireball",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_delayed-blast-fireball",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a ball of bat guano and sulfur",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A beam of yellow light flashes from you, then condenses at a chosen point within range as a glowing bead for the duration. When the spell ends, the bead explodes, and each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw. A creature takes Fire damage equal to the total accumulated damage on a failed save or half as much damage on a successful one. The spell's base damage is <strong>12d6</strong>, and the damage increases by <strong>1d6</strong> whenever your turn ends and the spell hasn't ended. If a creature touches the glowing bead before the spell ends, that creature makes a Dexterity saving throw. On a failed save, the spell ends, causing the bead to explode. On a successful save, the creature can throw the bead up to 40 feet. If the thrown bead enters a creature's space or collides with a solid object, the spell ends, and the bead explodes. When the bead explodes, flammable objects in the explosion that aren't being worn or carried start burning.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The base damage increases by <strong>1d6</strong> for each spell slot level above 7."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const divineWord: SpellEntry = {
  id: "spell-divine-word",
  name: "Divine Word",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_divine-word",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You utter a word imbued with power from the Upper Planes. Each creature of your choice in range makes a Charisma saving throw. On a failed save, a target that has 50 Hit Points or fewer suffers an effect based on its current Hit Points, as shown in the Divine Word Effects table. Regardless of its Hit Points, a Celestial, an Elemental, a Fey, or a Fiend target that fails its save is forced back to its plane of origin (if it isn't there already) and can't return to the current plane for 24 hours by any means short of a Wish spell.",
    "| Hit Points | Effect | |---|---| | 0–20 | The target dies. | | 21–30 | The target has the Blinded, Deafened, and Stunned conditions for 1 hour. | | 31–40 | The target has the Blinded and Deafened conditions for 10 minutes. | | 41–50 | The target has the Deafened condition for 1 minute. |"
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CHA,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 7
};

export const draconicTransformation: SpellEntry = {
  id: "spell-draconic-transformation",
  name: "Draconic Transformation",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "legacy-local",
    documentName: "Legacy / Expanded Local",
    ruleset: "legacy-local"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "With a roar, you draw on the magic of dragons to transform yourself, taking on draconic features. You gain the following benefits until the spell ends:",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Blindsight.</strong> You have Blindsight with a range of 30 feet. Within that range, you can effectively see anything that isn't behind Total Cover, even if you're Blinded or in darkness. Moreover, you can see an Invisible creature, unless the creature successfully hides from you.",
        "<strong>Breath Weapon.</strong> When you cast this spell, and as a Bonus Action on subsequent turns for the duration, you can exhale shimmering energy in a 60-foot cone. Each creature in that area must make a Dexterity saving throw, taking <strong>6d8</strong> Force damage on a failed save, or half as much damage on a successful one.",
        "<strong>Wings.</strong> Incorporeal wings sprout from your back, giving you a flying Speed of 60 feet."
      ]
    }
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const dreamOfTheBlueVeil: SpellEntry = {
  id: "spell-dream-of-the-blue-veil",
  name: "Dream of the Blue Veil",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "legacy-local",
    documentName: "Legacy / Expanded Local",
    ruleset: "legacy-local"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "20 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["6 hours"],
  description: [
    "You and up to eight willing creatures within range fall Unconscious for the spell's duration and experience visions of another world on the Material Plane, such as Oerth, Toril, Krynn, or Eberron. If the spell reaches its full duration, the visions conclude with each of you encountering and pulling back a mysterious blue curtain. The spell then ends with you mentally and physically transported to the world that was in the visions.",
    "To cast this spell, you must have a magic item that originated on the world you wish to reach, and you must be aware of the world's existence, even if you don't know the world's name. Your destination in the other world is a safe location within 1 mile of where the magic item was created. Alternatively, you can cast the spell if one of the affected creatures was born on the other world, which causes your destination to be a safe location within 1 mile of where that creature was born.",
    "The spell ends early on a creature if that creature takes any damage, and the creature isn't transported. If you take any damage, the spell ends for you and all other creatures, with none of you being transported."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 7
};

export const etherealness: SpellEntry = {
  id: "spell-etherealness",
  name: "Etherealness",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_etherealness",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["8 hours"],
  description: [
    "You step into the border regions of the Ethereal Plane, where it overlaps with your current plane. You remain in the Border Ethereal for the duration. During this time, you can move in any direction. If you move up or down, every foot of movement costs an extra foot. You can perceive the plane you left, which looks gray, and you can't see anything there more than 60 feet away. While on the Ethereal Plane, you can affect and be affected only by creatures, objects, and effects on that plane. Creatures that aren't on the Ethereal Plane can't perceive or interact with you unless a feature gives them the ability to do so. When the spell ends, you return to the plane you left in the spot that corresponds to your space in the Border Ethereal. If you appear in an occupied space, you are shunted to the nearest unoccupied space and take Force damage equal to twice the number of feet you are moved. This spell ends instantly if you cast it while you are on the Ethereal Plane or a plane that doesn't border it, such as one of the Outer Planes.",
    "<strong>Using a Higher-Level Spell Slot.</strong> You can target up to three willing creatures (including yourself) for each spell slot level above 7. The creatures must be within 10 feet of you when you cast the spell."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 7
};

export const fingerOfDeath: SpellEntry = {
  id: "spell-finger-of-death",
  name: "Finger of Death",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_finger-of-death",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    'You unleash negative energy toward a creature you can see within range. The target makes a Constitution saving throw, taking <strong>7d8 + 30</strong> Necrotic damage on a failed save or half as much damage on a successful one. A Humanoid killed by this spell rises at the start of your next turn as a Zombie (see "Monsters") that follows your verbal orders.'
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const fireStorm: SpellEntry = {
  id: "spell-fire-storm",
  name: "Fire Storm",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_fire-storm",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "A storm of fire appears within range. The area of the storm consists of up to ten 10-foot Cubes, which you arrange as you like. Each Cube must be contiguous with at least one other Cube. Each creature in the area makes a Dexterity saving throw, taking <strong>7d10</strong> Fire damage on a failed save or half as much damage on a successful one. Flammable objects in the area that aren't being worn or carried start burning."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER],
  spellLevel: 7
};

export const forcecage: SpellEntry = {
  id: "spell-forcecage",
  name: "Forcecage",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_forcecage",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "100 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "ruby dust worth 1,500+ GP, which the spell consumes",
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "An immobile, Invisible, Cube-shaped prison composed of magical force springs into existence around an area you choose within range. The prison can be a cage or a solid box, as you choose.",
    "A prison in the shape of a cage can be up to 20 feet on a side and is made from 1/2-inch diameter bars spaced 1/2 inch apart. A prison in the shape of a box can be up to 10 feet on a side, creating a solid barrier that prevents any matter from passing through it and blocking any spells cast into or out from the area.",
    "When you cast the spell, any creature that is completely inside the cage's area is trapped. Creatures only partially within the area, or those too large to fit inside it, are pushed away from the center of the area until they are completely outside it.",
    "A creature inside the cage can't leave it by nonmagical means. If the creature tries to use teleportation or interplanar travel to leave, it must first make a Charisma saving throw. On a successful save, the creature can use that magic to exit the cage. On a failed save, the creature doesn't exit the cage and wastes the spell or effect. The cage also extends into the Ethereal Plane, blocking ethereal travel.",
    "This spell can't be dispelled by Dispel Magic."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const magnificentMansion: SpellEntry = {
  id: "spell-magnificent-mansion",
  name: "Magnificent Mansion",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_magnificent-mansion",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "300 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a miniature door worth 15+ GP",
  duration: ["24 hours"],
  description: [
    "You conjure a shimmering door in range that lasts for the duration. The door leads to an extradimensional dwelling and is 5 feet wide and 10 feet tall. You and any creature you designate when you cast the spell can enter the extradimensional dwelling as long as the door remains open. You can open or close it (no action required) if you are within 30 feet of it. While closed, the door is imperceptible. Beyond the door is a magnificent foyer with numerous chambers beyond. The dwelling's atmosphere is clean, fresh, and warm. You can create any floor plan you like for the dwelling, but it can't exceed 50 contiguous 10-foot Cubes. The place is furnished and decorated as you choose. It contains sufficient food to serve a ninecourse banquet for up to 100 people. Furnishings and other objects created by this spell dissipate into smoke if removed from it. A staff of 100 near-transparent servants attends all who enter. You determine the appearance of these servants and their attire. They are invulnerable and obey your commands. Each servant can perform tasks that a human could perform, but they can't attack or take any action that would directly harm another creature. Thus the servants can fetch things, clean, mend, fold clothes, light fires, serve food, pour wine, and so on. The servants can't leave the dwelling. When the spell ends, any creatures or objects left inside the extradimensional space are expelled into the unoccupied spaces nearest to the entrance."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const mirageArcane: SpellEntry = {
  id: "spell-mirage-arcane",
  name: "Mirage Arcane",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_mirage-arcane",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "Sight",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["10 day"],
  description: [
    "You make terrain in an area up to 1 mile square look, sound, smell, and even feel like some other sort of terrain. Open fields or a road could be made to resemble a swamp, hill, crevasse, or some other rough or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road. Similarly, you can alter the appearance of structures or add them where none are present. The spell doesn't disguise, conceal, or add creatures. The illusion includes audible, visual, tactile, and olfactory elements, so it can turn clear ground into Difficult Terrain (or vice versa) or otherwise impede movement through the area. Any piece of the illusory terrain (such as a rock or stick) that is removed from the spell's area disappears immediately. Creatures with Truesight can see through the illusion to the terrain's true form; however, all other elements of the illusion remain, so while the creature is aware of the illusion's presence, the creature can still physically interact with the illusion."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const planeShift: SpellEntry = {
  id: "spell-plane-shift",
  name: "Plane Shift",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_plane-shift",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a forked, metal rod worth 250+ GP and attuned to a plane of existence",
  duration: ["Instantaneous"],
  description: [
    "You and up to eight willing creatures who link hands in a circle are transported to a different plane of existence. You can specify a target destination in general terms, such as a specific city on the Elemental Plane of Fire or palace on the second level of the Nine Hells, and you appear in or near that destination, as determined by the GM. Alternatively, if you know the sigil sequence of a teleportation circle on another plane of existence, this spell can take you to that circle. If the teleportation circle is too small to hold all the creatures you transported, they appear in the closest unoccupied spaces next to the circle."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 7
};

export const powerWordFortify: SpellEntry = {
  id: "spell-power-word-fortify",
  name: "Power Word Fortify",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "phb-2024",
    documentName: "Player's Handbook",
    ruleset: "5e-2024",
    publisherKey: "wizards-of-the-coast"
  },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You fortify up to six creatures you can see within range. The spell bestows 120 <link:Temporary Hit Points>Temporary Hit Points</link>, which you divide among the spell's recipients."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC],
  spellLevel: 7
};

export const powerWordPain: SpellEntry = {
  id: "spell-power-word-pain",
  name: "Power Word Pain",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "legacy-local",
    documentName: "Legacy / Expanded Local",
    ruleset: "legacy-local"
  },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You speak a word of power that causes waves of intense pain to assail one creature you can see within range. If the target has 100 Hit Points or fewer, it is subject to crippling pain. Otherwise, the spell has no effect on it. A target is also unaffected if it is immune to being Charmed.",
    "While the target is affected by crippling pain, any Speed it has can be no higher than 10 feet. The target also has disadvantage on attack rolls, Ability Checks, and saving throws, other than Constitution saving throws. Finally, if the target tries to cast a spell, it must first succeed on a Constitution saving throw, or the casting fails and the spell is wasted.",
    "A target suffering this pain can make a Constitution saving throw at the end of each of its turns. On a successful save, the pain ends."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const prismaticSpray: SpellEntry = {
  id: "spell-prismatic-spray",
  name: "Prismatic Spray",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_prismatic-spray",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "Eight rays of light flash from you in a 60-foot Cone. Each creature in the Cone makes a Dexterity saving throw. For each target, roll <strong>1d8</strong> to determine which color ray affects it, consulting the Prismatic Rays table.",
    "| <strong>1d8</strong> | Ray | |---|---| | 1 | <strong>Red.</strong> <em>Failed Save:</em> <strong>12d6</strong> Fire damage. <em>Successful Save:</em> Half as much damage. | | 2 | <strong>Orange.</strong> <em>Failed Save:</em> <strong>12d6</strong> Acid damage. <em>Successful Save:</em> Half as much damage. | | 3 | <strong>Yellow.</strong> <em>Failed Save:</em> <strong>12d6</strong> Lightning damage. <em>Successful Save:</em> Half as much damage. | | 4 | <strong>Green.</strong> <em>Failed Save:</em> <strong>12d6</strong> Poison damage. <em>Successful Save:</em> Half as much damage. | | 5 | <strong>Blue.</strong> <em>Failed Save:</em> <strong>12d6</strong> Cold damage. <em>Successful Save:</em> Half as much damage. | | 6 | <strong>Indigo.</strong> <em>Failed Save:</em> The target has the Restrained condition and makes a Constitution saving throw at the end of each of its turns. If it successfully saves three times, the condition ends. If it fails three times, it has the Petrified condition until it is freed by an effect like the Greater Restoration spell. The successes and failures needn't be consecutive; keep track of both until the target collects three of a kind. | | 7 | <strong>Violet.</strong> <em>Failed Save:</em> The target has the Blinded condition and makes a Wisdom saving throw at the start of your next turn. On a successful save, the condition ends. On a failed save, the condition ends, and the creature teleports to another plane of existence (GM's choice). | | 8 | <strong>Special.</strong> The target is struck by two rays. Roll twice, rerolling any 8. |"
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const projectImage: SpellEntry = {
  id: "spell-project-image",
  name: "Project Image",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_project-image",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "500 miles",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a statuette of yourself worth 5+ GP",
  duration: [DURATION.CONCENTRATION, "up to 1 day"],
  description: [
    "You create an illusory copy of yourself that lasts for the duration. The copy can appear at any location within range that you have seen before, regardless of intervening obstacles. The illusion looks and sounds like you, but it is intangible. If the illusion takes any damage, it disappears, and the spell ends. You can see through the illusion's eyes and hear through its ears as if you were in its space. As a Magic action, you can move it up to 60 feet and make it gesture, speak, and behave in whatever way you choose. It mimics your mannerisms perfectly. Physical interaction with the image reveals it to be illusory, since things can pass through it. A creature that takes the Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const regenerate: SpellEntry = {
  id: "spell-regenerate",
  name: "Regenerate",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_regenerate",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a prayer wheel",
  duration: ["1 hour"],
  description: [
    "A creature you touch regains <strong>4d8 + 15</strong> Hit Points. For the duration, the target regains 1 Hit Point at the start of each of its turns, and any severed body parts regrow after 2 minutes."
  ],
  isHealingSpell: true,
  damage: [],
  healing: [DICE.D8, DICE.D8, DICE.D8, DICE.D8, 15],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 7
};

export const resurrection: SpellEntry = {
  id: "spell-resurrection",
  name: "Resurrection",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_resurrection",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.HOUR],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a diamond worth 1,000+ GP, which the spell consumes",
  duration: ["Instantaneous"],
  description: [
    "With a touch, you revive a dead creature that has been dead for no more than a century, didn't die of old age, and wasn't Undead when it died. The creature returns to life with all its Hit Points. This spell also neutralizes any poisons that affected the creature at the time of death. This spell closes all mortal wounds and restores any missing body parts. Coming back from the dead is an ordeal. The target takes a −4 penalty to D20 Tests. Every time the target finishes a Long Rest, the penalty is reduced by 1 until it becomes 0. Casting this spell to revive a creature that has been dead for 365 days or longer taxes you. Until you finish a Long Rest, you can't cast spells again, and you have Disadvantage on D20 Tests."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC],
  spellLevel: 7
};

export const reverseGravity: SpellEntry = {
  id: "spell-reverse-gravity",
  name: "Reverse Gravity",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_reverse-gravity",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "100 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a lodestone and iron filings",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "This spell reverses gravity in a 50-foot-radius, 100 foot high Cylinder centered on a point within range. All creatures and objects in that area that aren't anchored to the ground fall upward and reach the top of the Cylinder. A creature can make a Dexterity saving throw to grab a fixed object it can reach, thus avoiding the fall upward. If a ceiling or an anchored object is encountered in this upward fall, creatures and objects strike it just as they would during a downward fall. If an affected creature or object reaches the Cylinder's top without striking anything, it hovers there for the duration. When the spell ends, affected objects and creatures fall downward."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const sequester: SpellEntry = {
  id: "spell-sequester",
  name: "Sequester",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_sequester",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "gem dust worth 5,000+ GP, which the spell consumes",
  duration: ["Until dispelled"],
  description: [
    'With a touch, you magically sequester an object or a willing creature. For the duration, the target has the Invisible condition and can\'t be targeted by Divination spells, detected by magic, or viewed remotely with magic. If the target is a creature, it enters a state of suspended animation; it has the Unconscious condition, doesn\'t age, and doesn\'t need food, water, or air. You can set a condition for the spell to end early. The condition can be anything you choose, but it must occur or be visible within 1 mile of the target. Examples include "after 1,000 years" or "when the tarrasque awakens." This spell also ends if the target takes any damage.'
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const simulacrum: SpellEntry = {
  id: "spell-simulacrum",
  name: "Simulacrum",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_simulacrum",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.TWELVE_HOURS],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "powdered ruby worth 1,500+ GP, which the spell consumes",
  duration: ["Until dispelled"],
  description: [
    "You create a simulacrum of one Beast or Humanoid that is within 10 feet of you for the entire casting of the spell. You finish the casting by touching both the creature and a pile of ice or snow that is the same size as that creature, and the pile turns into the simulacrum, which is a creature. It uses the game statistics of the original creature at the time of casting, except it is a Construct, its Hit Point maximum is half as much, and it can't cast this spell. The simulacrum is Friendly to you and creatures you designate. It obeys your commands and acts on your turn in combat. The simulacrum can't gain levels, and it can't take Short or Long Rests. If the simulacrum takes damage, the only way to restore its Hit Points is to repair it as you take a Long Rest, during which you expend components worth 100 GP per Hit Point restored. The simulacrum must stay within 5 feet of you for the repair. The simulacrum lasts until it drops to 0 Hit Points, at which point it reverts to snow and melts away. If you cast this spell again, any simulacrum you created with this spell is instantly destroyed."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const symbol: SpellEntry = {
  id: "spell-symbol",
  name: "Symbol",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_symbol",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "powdered diamond worth 1,000+ GP, which the spell consumes",
  duration: ["Until dispelled or triggered"],
  description: [
    "You inscribe a harmful glyph either on a surface (such as a section of floor or wall) or within an object that can be closed (such as a book or chest). The glyph can cover an area no larger than 10 feet in diameter. If you choose an object, it must remain in place; if it is moved more than 10 feet from where you cast this spell, the glyph is broken, and the spell ends without being triggered.",
    "The glyph is nearly imperceptible and requires a successful Wisdom (Perception) check against your spell save DC to notice.",
    "When you inscribe the glyph, you set its trigger and choose which effect the symbol bears: Death, Discord, Fear, Pain, Sleep, or Stunning. Each one is explained below.",
    "<strong>_Set the Trigger._</strong> You decide what triggers the glyph when you cast the spell. For glyphs inscribed on a surface, common triggers include touching or stepping on the glyph, removing another object covering it, or approaching within a certain distance of it. For glyphs inscribed within an object, common triggers include opening that object or seeing the glyph.",
    "You can refine the trigger so that only creatures of certain types activate it (for example, the glyph could be set to affect Aberrations). You can also set conditions for creatures that don't trigger the glyph, such as those who say a certain password.",
    "Once triggered, the glyph glows, filling a 60-foot-radius Sphere with Dim Light for 10 minutes, after which time the spell ends. Each creature in the Sphere when the glyph activates is targeted by its effect, as is a creature that enters the Sphere for the first time on a turn or ends its turn there. A creature is targeted only once per turn.",
    "<strong>_Death._</strong> Each target makes a Constitution saving throw, taking <strong>10d10</strong> Necrotic damage on a failed save or half as much damage on a successful save.",
    "<strong>_Discord._</strong> Each target makes a Wisdom saving throw. On a failed save, a target argues with other creatures for 1 minute. During this time, it is incapable of meaningful communication and has Disadvantage on attack rolls and ability checks.",
    "<strong>_Fear._</strong> Each target must succeed on a Wisdom saving throw or have the Frightened condition for 1 minute. While Frightened, the target must move at least 30 feet away from the glyph on each of its turns, if able.",
    "<strong>_Pain._</strong> Each target must succeed on a Constitution saving throw or have the Incapacitated condition for 1 minute.",
    "<strong>_Sleep._</strong> Each target must succeed on a Wisdom saving throw or have the Unconscious condition for 10 minutes. A creature awakens if it takes damage or if someone takes an action to shake it awake.",
    "<strong>_Stunning._</strong> Each target must succeed on a Wisdom saving throw or have the Stunned condition for 1 minute."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC]
  ],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 7
};

export const teleport: SpellEntry = {
  id: "spell-teleport",
  name: "Teleport",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "srd-2024",
    documentName: "5e 2024 Rules",
    ruleset: "5e-2024",
    open5eKey: "srd-2024_teleport",
    publisherKey: "wizards-of-the-coast",
    permalink: "https://dnd.wizards.com/resources/systems-reference-document"
  },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "10 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "This spell instantly transports you and up to eight willing creatures that you can see within range, or a single object that you can see within range, to a destination you select. If you target an object, it must be Large or smaller, and it can't be held or carried by an unwilling creature. The destination you choose must be known to you, and it must be on the same plane of existence as you. Your familiarity with the destination determines whether you arrive there successfully. The GM rolls 1d100 and consults the Teleportation Outcome table and the explanations after it.",
    "| Familiarity | Mishap | Similar Area | Off Target | On Target | |---|---|---|---|---| | Permanent circle | — | — | — | 01–00 | | Linked object | — | — | — | 01–00 | | Very familiar | 01–05 | 06–13 | 14–24 | 25–00 | | Seen casually | 01–33 | 34–43 | 44–53 | 54–00 | | Viewed once or described | 01–43 | 44–53 | 54–73 | 74–00 | | False destination | 01–50 | 51–00 | — | — |",
    {
      type: "list",
      style: "bullet",
      items: [
        '"Permanent circle" means a permanent teleportation circle whose sigil sequence you know.',
        '"Linked object" means you possess an object taken from the desired destination within the last six months, such as a book from a wizard\'s library.',
        '"Very familiar" is a place you have visited often, a place you have carefully studied, or a place you can see when you cast the spell.',
        '"Seen casually" is a place you have seen more than once but with which you aren\'t very familiar.',
        '"Viewed once or described" is a place you have seen once, possibly using magic, or a place you know through someone else\'s description, perhaps from a map.',
        "\"False destination\" is a place that doesn't exist. Perhaps you tried to scry an enemy's sanctum but instead viewed an illusion, or you are attempting to teleport to a location that no longer exists."
      ]
    }
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const templeOfTheGods: SpellEntry = {
  id: "spell-temple-of-the-gods",
  name: "Temple of the Gods",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "legacy-local",
    documentName: "Legacy / Expanded Local",
    ruleset: "legacy-local"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.HOUR],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["24 hours"],
  description: [
    "You cause a temple to shimmer into existence on ground you can see within range. The temple must fit within an unoccupied cube of space, up to 120 feet on each side. The temple remains until the spell ends. It is dedicated to whatever god, pantheon, or philosophy is represented by the holy symbol used in the casting.",
    "You make all decisions about the temple's appearance. The interior is enclosed by a floor, walls, and a roof, with one door granting access to the interior and as many windows as you wish. Only you and any creatures you designate when you cast the spell can open or close the door.",
    "The temple's interior is an open space with an idol or altar at one end. You decide whether the temple is illuminated and whether that illumination is bright light or dim light. The smell of burning incense fills the air within, and the temperature is mild.",
    "The temple opposes types of creatures you choose when you cast this spell. Choose one or more of the following: Celestials, Elementals, Fey, Fiends, or Undead. If a creature of the chosen type attempts to enter the temple, that creature must make a Charisma saving throw. On a failed save, it can't enter the temple for 24 hours. Even if the creature can enter the temple, the magic there hinders it. Whenever it makes an attack roll, an Ability Check, or a saving throw inside the temple, it must roll a <strong>d4</strong> and subtract the number rolled from the <strong>d20</strong> roll.",
    "In addition, the sensors created by Divination spells can't appear inside the temple, and creatures within can't be targeted by Divination spells.",
    "Finally, whenever any creature in the temple regains Hit Points from a spell of 1st level or higher, the creature regains additional Hit Points equal to your Wisdom modifier, minimum 1 Hit Point.",
    "The temple is made from opaque magical force that extends into the Ethereal Plane, thus blocking ethereal travel into the temple's interior. Nothing can physically pass through the temple's exterior. It can't be dispelled by Dispel Magic, and Antimagic Field has no effect on it. A Disintegrate spell destroys the temple instantly.",
    "Casting this spell on the same spot every day for a year makes this effect permanent."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CHA,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 7
};

export const tetherEssence: SpellEntry = {
  id: "spell-tether-essence",
  name: "Tether Essence",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "legacy-local",
    documentName: "Legacy / Expanded Local",
    ruleset: "legacy-local"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "Two creatures you can see within range must make a Constitution saving throw, with disadvantage if they are within 30 feet of each other. Either creature can willingly fail the save. If either save succeeds, the spell has no effect.",
    "If both saves fail, the creatures are magically linked for the duration, regardless of the distance between them. When damage is dealt to one of them, the same damage is dealt to the other one. If Hit Points are restored to one of them, the same number of Hit Points are restored to the other one. If either of the tethered creatures is reduced to 0 Hit Points, the spell ends on both. If the spell ends on one creature, it ends on both."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const whirlwind: SpellEntry = {
  id: "spell-whirlwind",
  name: "Whirlwind",
  category: ENTRY_CATEGORIES.SPELLS,
  source: {
    documentKey: "legacy-local",
    documentName: "Legacy / Expanded Local",
    ruleset: "legacy-local"
  },
  trackingState: TRACKER.SEMI_TRACKED,
  trackingMessage: spellDurationOnlyTrackingMessage,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "300 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A whirlwind howls down to a point on the ground you specify. The whirlwind is a 10-foot-radius, 30-foot-high cylinder centered on that point. Until the spell ends, you can use your action to move the whirlwind up to 30 feet in any direction along the ground. The whirlwind sucks up any Medium or smaller objects that aren't secured to anything and that aren't worn or carried by anyone.",
    "A creature must make a Dexterity saving throw the first time on a turn that it enters the whirlwind or that the whirlwind enters its space, including when the whirlwind first appears. A creature takes <strong>10d6</strong> Bludgeoning damage on a failed save, or half as much damage on a successful one. In addition, a Large or smaller creature that fails the save must succeed on a Strength saving throw or become Restrained in the whirlwind until the spell ends.",
    "When a creature starts its turn Restrained by the whirlwind, the creature is pulled 5 feet higher inside it, unless the creature is at the top. A Restrained creature moves with the whirlwind and falls when the spell ends, unless the creature has some means to stay aloft.",
    "A Restrained creature can use an action to make a Strength or Dexterity check against your spell save DC. If successful, the creature is no longer Restrained by the whirlwind and is hurled <strong>3d6</strong> x 10 feet away from it in a random direction."
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
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const spellEntries7: SpellEntry[] = [
  arcaneSword,
  conjureCelestial,
  conjureHezrou,
  createMagen,
  crownOfStars,
  delayedBlastFireball,
  divineWord,
  draconicTransformation,
  dreamOfTheBlueVeil,
  etherealness,
  fingerOfDeath,
  fireStorm,
  forcecage,
  magnificentMansion,
  mirageArcane,
  planeShift,
  powerWordFortify,
  powerWordPain,
  prismaticSpray,
  projectImage,
  regenerate,
  resurrection,
  reverseGravity,
  sequester,
  simulacrum,
  symbol,
  teleport,
  templeOfTheGods,
  tetherEssence,
  whirlwind
];
