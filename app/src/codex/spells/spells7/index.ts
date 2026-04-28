import {
  ABILITY_TYPES,
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

export const conjureCelestial: SpellEntry = {
  id: "spell-conjure-celestial",
  name: "Conjure Celestial",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You summon a Celestial of Challenge Rating 4 or lower, which appears in an unoccupied space that you can see within range. The Celestial disappears when it drops to 0 Hit Points or when the spell ends.",
    "The Celestial is friendly to you and your companions for the duration. Roll Initiative for the Celestial, which has its own turns. It obeys any verbal commands that you issue to it, no action required by you, as long as they don't violate its alignment. If you don't issue any commands to the Celestial, it defends itself from hostile creatures but otherwise takes no actions. The DM has the Celestial's statistics.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a 9th-level spell slot, you summon a Celestial of Challenge Rating 5 or lower."
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
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You summon a hezrou that appears in an unoccupied space you can see within range. The hezrou disappears when it drops to 0 Hit Points or when the spell ends.",
    "The hezrou's attitude depends on the value of the food used as a material component for this spell. Roll Initiative for the hezrou, which has its own turns. At the start of the hezrou's turn, the DM makes a secret Charisma check on your behalf, with a bonus equal to the food's value divided by 20. The check DC starts at 10 and increases by 2 each round. You can issue orders to the hezrou and have it obey you as long as you succeed on the Charisma check.",
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
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A beam of yellow light flashes from your pointing finger, then condenses to linger at a chosen point within range as a glowing bead for the duration. When the spell ends, either because your Concentration is broken or because you decide to end it, the bead blossoms with a low roar into an explosion of flame that spreads around corners. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A creature takes Fire damage equal to the total accumulated damage on a failed save, or half as much damage on a successful one.",
    "The spell's base damage is <strong>12d6</strong>. If at the end of your turn the bead has not yet detonated, the damage increases by <strong>1d6</strong>.",
    "If the glowing bead is touched before the interval has expired, the creature touching it must make a Dexterity saving throw. On a failed save, the spell ends immediately, causing the bead to erupt in flame. On a successful save, the creature can throw the bead up to 40 feet. When it strikes a creature or a solid object, the spell ends, and the bead explodes.",
    "The fire damages objects in the area and ignites flammable objects that aren't being worn or carried.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 8th level or higher, the base damage increases by <strong>1d6</strong> for each slot level above 7th."
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
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You utter a divine word, imbued with the power that shaped the world at the dawn of creation. Choose any number of creatures you can see within range. Each creature that can hear you must make a Charisma saving throw. On a failed save, a creature suffers an effect based on its current Hit Points:",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>50 Hit Points or fewer.</strong> Deafened for 1 minute.",
        "<strong>40 Hit Points or fewer.</strong> Deafened and Blinded for 10 minutes.",
        "<strong>30 Hit Points or fewer.</strong> Blinded, Deafened, and Stunned for 1 hour.",
        "<strong>20 Hit Points or fewer.</strong> Killed instantly."
      ]
    },
    "Regardless of its current Hit Points, a Celestial, an Elemental, a Fey, or a Fiend that fails its save is forced back to its plane of origin, if it isn't there already, and can't return to your current plane for 24 hours by any means short of a Wish spell."
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
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Up to 8 hours"],
  description: [
    "You step into the border regions of the Ethereal Plane, in the area where it overlaps with your current plane. You remain in the Border Ethereal for the duration or until you use your action to dismiss the spell. During this time, you can move in any direction. If you move up or down, every foot of movement costs an extra foot. You can see and hear the plane you originated from, but everything there looks gray, and you can't see anything more than 60 feet away.",
    "While on the Ethereal Plane, you can only affect and be affected by other creatures on that plane. Creatures that aren't on the Ethereal Plane can't perceive you and can't interact with you, unless a special ability or magic has given them the ability to do so.",
    "You ignore all objects and effects that aren't on the Ethereal Plane, allowing you to move through objects you perceive on the plane you originated from. When the spell ends, you immediately return to the plane you originated from in the spot you currently occupy. If you occupy the same spot as a solid object or creature when this happens, you are immediately shunted to the nearest unoccupied space that you can occupy and take Force damage equal to twice the number of feet you are moved.",
    "This spell has no effect if you cast it while you are on the Ethereal Plane or a plane that doesn't border it, such as one of the Outer Planes.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 8th level or higher, you can target up to three willing creatures, including you, for each slot level above 7th. The creatures must be within 10 feet of you when you cast the spell."
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
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You send negative energy coursing through a creature that you can see within range, causing it searing pain. The target must make a Constitution saving throw. It takes <strong>7d8</strong> + 30 Necrotic damage on a failed save, or half as much damage on a successful one.",
    "A Humanoid killed by this spell rises at the start of your next turn as a zombie that is permanently under your command, following your verbal orders to the best of its ability."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [30, DAMAGE_TYPE.NECROTIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const fireStorm: SpellEntry = {
  id: "spell-fire-storm",
  name: "Fire Storm",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "A storm made up of sheets of roaring flame appears in a location you choose within range. The area of the storm consists of up to ten 10-foot cubes, which you can arrange as you wish. Each cube must have at least one face adjacent to the face of another cube. Each creature in the area must make a Dexterity saving throw. It takes <strong>7d10</strong> Fire damage on a failed save, or half as much damage on a successful save.",
    "The fire damages objects in the area and ignites flammable objects that aren't being worn or carried. If you choose, plant life in the area is unaffected by this spell."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.FIRE],
    [DICE.D10, DAMAGE_TYPE.FIRE],
    [DICE.D10, DAMAGE_TYPE.FIRE],
    [DICE.D10, DAMAGE_TYPE.FIRE],
    [DICE.D10, DAMAGE_TYPE.FIRE],
    [DICE.D10, DAMAGE_TYPE.FIRE],
    [DICE.D10, DAMAGE_TYPE.FIRE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER],
  spellLevel: 7
};

export const forcecage: SpellEntry = {
  id: "spell-forcecage",
  name: "Forcecage",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "100 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  description: [
    "An immobile, invisible, cube-shaped prison composed of magical force springs into existence around an area you choose within range. The prison can be a cage or a solid box as you choose.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Cage.</strong> A prison in the shape of a cage can be up to 20 feet on a side and is made from 1/2-inch diameter bars spaced 1/2 inch apart.",
        "<strong>Box.</strong> A prison in the shape of a box can be up to 10 feet on a side, creating a solid barrier that prevents any matter from passing through it and blocking any spells cast into or out of the area."
      ]
    },
    "When you cast the spell, any creature that is completely inside the cage's area is trapped. Creatures only partially within the area, or those too large to fit inside the area, are pushed away from the center of the area until they are completely outside the area.",
    "A creature inside the cage can't leave it by nonmagical means. If the creature tries to use teleportation or interplanar travel to leave the cage, it must first make a Charisma saving throw. On a success, the creature can use that magic to exit the cage. On a failure, the creature can't exit the cage and wastes the use of the spell or effect. The cage also extends into the Ethereal Plane, blocking ethereal travel.",
    "This spell can't be dispelled by Dispel Magic."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CHA,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const mirageArcane: SpellEntry = {
  id: "spell-mirage-arcane",
  name: "Mirage Arcane",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "Sight",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["10 days"],
  description: [
    "You make terrain in an area up to 1 mile square look, sound, smell, and even feel like some other sort of terrain. The terrain's general shape remains the same, however. Open fields or a road could be made to resemble a swamp, hill, crevasse, or some other difficult or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road.",
    "Similarly, you can alter the appearance of structures, or add them where none are present. The spell doesn't disguise, conceal, or add creatures.",
    "The illusion includes audible, visual, tactile, and olfactory elements, so it can turn clear ground into difficult terrain, or vice versa, or otherwise impede movement through the area. Any piece of the illusory terrain, such as a rock or stick, that is removed from the spell's area disappears immediately.",
    "Creatures with Truesight can see through the illusion to the terrain's true form. However, all other elements of the illusion remain, so while the creature is aware of the illusion's presence, the creature can still physically interact with the illusion."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const mordenkainensMagnificentMansion: SpellEntry = {
  id: "spell-mordenkainens-magnificent-mansion",
  name: "Mordenkainen's Magnificent Mansion",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "300 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["24 hours"],
  description: [
    "You conjure an extradimensional dwelling in range that lasts for the duration. You choose where its one entrance is located. The entrance shimmers faintly and is 5 feet wide and 10 feet tall. You and any creature you designate when you cast the spell can enter the extradimensional dwelling as long as the portal remains open. You can open or close the portal if you are within 30 feet of it. While closed, the portal is Invisible.",
    "Beyond the portal is a magnificent foyer with numerous chambers beyond. The atmosphere is clean, fresh, and warm.",
    "You can create any floor plan you like, but the space can't exceed 50 cubes, each cube being 10 feet on each side. The place is furnished and decorated as you choose. It contains sufficient food to serve a nine-course banquet for up to 100 people. A staff of 100 near-transparent servants attends all who enter. You decide the visual appearance of these servants and their attire. They are completely obedient to your orders.",
    "Each servant can perform any task a normal Human servant could perform, but they can't attack or take any action that would directly harm another creature. Thus the servants can fetch things, clean, mend, fold clothes, light fires, serve food, pour wine, and so on. The servants can go anywhere in the mansion but can't leave it. Furnishings and other objects created by this spell dissipate into smoke if removed from the mansion. When the spell ends, any creatures or objects inside the extradimensional space are expelled into the open spaces nearest to the entrance."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const mordenkainensSword: SpellEntry = {
  id: "spell-mordenkainens-sword",
  name: "Mordenkainen's Sword",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You create a sword-shaped plane of force that hovers within range. It lasts for the duration.",
    "When the sword appears, you make a melee spell attack against a target of your choice within 5 feet of the sword. On a hit, the target takes <strong>3d10</strong> Force damage. Until the spell ends, you can use a Bonus Action on each of your turns to move the sword up to 20 feet to a spot you can see and repeat this attack against the same target or a different one."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const planeShift: SpellEntry = {
  id: "spell-plane-shift",
  name: "Plane Shift",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You and up to eight willing creatures who link hands in a circle are transported to a different plane of existence. You can specify a target destination in general terms, such as the City of Brass on the Elemental Plane of Fire or the palace of Dispater on the second level of the Nine Hells, and you appear in or near that destination. If you are trying to reach the City of Brass, for example, you might arrive in its Street of Steel, before its Gate of Ashes, or looking at the city from across the Sea of Fire, at the DM's discretion.",
    "Alternatively, if you know the sigil sequence of a Teleportation Circle on another plane of existence, this spell can take you to that circle. If the Teleportation Circle is too small to hold all the creatures you transported, they appear in the closest unoccupied spaces next to the circle.",
    "You can use this spell to banish an unwilling creature to another plane. Choose a creature within your reach and make a melee spell attack against it. On a hit, the creature must make a Charisma saving throw. If the creature fails the save, it is transported to a random location on the plane of existence you specify. A creature so transported must find its own way back to your current plane of existence."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CHA,
  isAttackSpell: true,
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

export const powerWordPain: SpellEntry = {
  id: "spell-power-word-pain",
  name: "Power Word: Pain",
  category: ENTRY_CATEGORIES.SPELLS,
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
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (60-foot cone)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "Eight multicolored rays of light flash from your hand. Each ray is a different color and has a different power and purpose. Each creature in a 60-foot cone must make a Dexterity saving throw. For each target, roll a <strong>d8</strong> to determine which color ray affects it.",
    {
      type: "list",
      style: "number",
      items: [
        "<strong>Red.</strong> The target takes <strong>10d6</strong> Fire damage on a failed save, or half as much damage on a successful one.",
        "<strong>Orange.</strong> The target takes <strong>10d6</strong> Acid damage on a failed save, or half as much damage on a successful one.",
        "<strong>Yellow.</strong> The target takes <strong>10d6</strong> Lightning damage on a failed save, or half as much damage on a successful one.",
        "<strong>Green.</strong> The target takes <strong>10d6</strong> Poison damage on a failed save, or half as much damage on a successful one.",
        "<strong>Blue.</strong> The target takes <strong>10d6</strong> Cold damage on a failed save, or half as much damage on a successful one.",
        "<strong>Indigo.</strong> On a failed save, the target is Restrained. It must then make a Constitution saving throw at the end of each of its turns. If it successfully saves three times, the spell ends. If it fails its save three times, it permanently turns to stone and is subjected to the Petrified condition. The successes and failures don't need to be consecutive; keep track of both until the target collects three of a kind.",
        "<strong>Violet.</strong> On a failed save, the target is Blinded. It must then make a Wisdom saving throw at the start of your next turn. A successful save ends the blindness. If it fails that save, the creature is transported to another plane of existence of the DM's choosing and is no longer Blinded. Typically, a creature that is on a plane that isn't its home plane is banished home, while other creatures are usually cast into the Astral or Ethereal planes.",
        "<strong>Special.</strong> The target is struck by two rays. Roll twice more, rerolling any 8."
      ]
    }
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [
      DICE.D6,
      [
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.POISON,
        DAMAGE_TYPE.COLD
      ]
    ],
    [
      DICE.D6,
      [
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.POISON,
        DAMAGE_TYPE.COLD
      ]
    ],
    [
      DICE.D6,
      [
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.POISON,
        DAMAGE_TYPE.COLD
      ]
    ],
    [
      DICE.D6,
      [
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.POISON,
        DAMAGE_TYPE.COLD
      ]
    ],
    [
      DICE.D6,
      [
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.POISON,
        DAMAGE_TYPE.COLD
      ]
    ],
    [
      DICE.D6,
      [
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.POISON,
        DAMAGE_TYPE.COLD
      ]
    ],
    [
      DICE.D6,
      [
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.POISON,
        DAMAGE_TYPE.COLD
      ]
    ],
    [
      DICE.D6,
      [
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.POISON,
        DAMAGE_TYPE.COLD
      ]
    ],
    [
      DICE.D6,
      [
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.POISON,
        DAMAGE_TYPE.COLD
      ]
    ],
    [
      DICE.D6,
      [
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.POISON,
        DAMAGE_TYPE.COLD
      ]
    ]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
};

export const projectImage: SpellEntry = {
  id: "spell-project-image",
  name: "Project Image",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "500 miles",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 day"],
  description: [
    "You create an illusory copy of yourself that lasts for the duration. The copy can appear at any location within range that you have seen before, regardless of intervening obstacles. The illusion looks and sounds like you but is intangible. If the illusion takes any damage, it disappears, and the spell ends.",
    "You can use your action to move this illusion up to twice your Speed, and make it gesture, speak, and behave in whatever way you choose. It mimics your mannerisms perfectly.",
    "You can see through its eyes and hear through its ears as if you were in its space. On your turn as a Bonus Action, you can switch from using its senses to using your own, or back again. While you are using its senses, you are Blinded and Deafened in regard to your own surroundings.",
    "Physical interaction with the image reveals it to be an illusion, because things can pass through it. A creature that uses its action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature."
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
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  description: [
    "You touch a creature and stimulate its natural healing ability. The target regains <strong>4d8</strong> + 15 Hit Points. For the duration of the spell, the target regains 1 Hit Point at the start of each of its turns, 10 Hit Points each minute.",
    "The target's severed body members, fingers, legs, tails, and so on, if any, are restored after 2 minutes. If you have the severed part and hold it to the stump, the spell instantaneously causes the limb to knit to the stump."
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
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.HOUR],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You touch a dead creature that has been dead for no more than a century, that didn't die of old age, and that isn't Undead. If its soul is free and willing, the target returns to life with all its Hit Points.",
    "This spell neutralizes any poisons and cures normal diseases afflicting the creature when it died. It doesn't, however, remove magical diseases, curses, and the like. If such effects aren't removed prior to casting the spell, they afflict the target on its return to life.",
    "This spell closes all mortal wounds and restores any missing body parts.",
    "Coming back from the dead is an ordeal. The target takes a -4 penalty to all attack rolls, saving throws, and Ability Checks. Every time the target finishes a Long Rest, the penalty is reduced by 1 until it disappears.",
    "Casting this spell to restore life to a creature that has been dead for one year or longer taxes you greatly. Until you finish a Long Rest, you can't cast spells again, and you have disadvantage on all attack rolls, Ability Checks, and saving throws."
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
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "100 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "This spell reverses gravity in a 50-foot-radius, 100-foot-high cylinder centered on a point within range. All creatures and objects that aren't somehow anchored to the ground in the area fall upward and reach the top of the area when you cast this spell. A creature can make a Dexterity saving throw to grab onto a fixed object it can reach, thus avoiding the fall.",
    "If some solid object, such as a ceiling, is encountered in this fall, falling objects and creatures strike it just as they would during a normal downward fall. If an object or creature reaches the top of the area without striking anything, it remains there, oscillating slightly, for the duration.",
    "At the end of the duration, affected objects and creatures fall back down."
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
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Until dispelled"],
  description: [
    "By means of this spell, a willing creature or an object can be hidden away, safe from detection for the duration. When you cast the spell and touch the target, it becomes Invisible and can't be targeted by Divination spells or perceived through scrying sensors created by Divination spells.",
    "If the target is a creature, it falls into a state of suspended animation. Time ceases to flow for it, and it doesn't grow older.",
    'You can set a condition for the spell to end early. The condition can be anything you choose, but it must occur or be visible within 1 mile of the target. Examples include "after 1,000 years" or "when the tarrasque awakes." This spell also ends if the target takes any damage.'
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
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.TWELVE_HOURS],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Until dispelled"],
  description: [
    "You shape an illusory duplicate of one Beast or Humanoid that is within range for the entire casting time of the spell. The duplicate is a creature, partially real and formed from ice or snow, and it can take actions and otherwise be affected as a normal creature. It appears to be the same as the original, but it has half the creature's Hit Point maximum and is formed without any equipment. Otherwise, the illusion uses all the statistics of the creature it duplicates, except that it is a Construct.",
    "The simulacrum is friendly to you and creatures you designate. It obeys your spoken commands, moving and acting in accordance with your wishes and acting on your turn in combat. The simulacrum lacks the ability to learn or become more powerful, so it never increases its level or other abilities, nor can it regain expended spell slots.",
    "If the simulacrum is damaged, you can repair it in an alchemical laboratory, using rare herbs and minerals worth 100 gp per Hit Point it regains. The simulacrum lasts until it drops to 0 Hit Points, at which point it reverts to snow and melts instantly.",
    "If you cast this spell again, any currently active duplicates you created with this spell are instantly destroyed."
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
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Until dispelled or triggered"],
  description: [
    "When you cast this spell, you inscribe a harmful glyph either on a surface, such as a section of floor, a wall, or a table, or within an object that can be closed to conceal the glyph, such as a book, a scroll, or a treasure chest. If you choose a surface, the glyph can cover an area of the surface no larger than 10 feet in diameter. If you choose an object, that object must remain in its place. If the object is moved more than 10 feet from where you cast this spell, the glyph is broken, and the spell ends without being triggered.",
    "The glyph is nearly Invisible, requiring an Intelligence (Investigation) check against your spell save DC to find it.",
    "You decide what triggers the glyph when you cast the spell. For glyphs inscribed on a surface, the most typical triggers include touching or stepping on the glyph, removing another object covering it, approaching within a certain distance of it, or manipulating the object that holds it. For glyphs inscribed within an object, the most common triggers are opening the object, approaching within a certain distance of it, or seeing or reading the glyph.",
    "You can further refine the trigger so the spell is activated only under certain circumstances or according to a creature's physical characteristics, such as height or weight, or physical kind, for example, the ward could be set to affect hags or shapechangers. You can also specify creatures that don't trigger the glyph, such as those who say a certain password.",
    "When you inscribe the glyph, choose one of the options below for its effect. Once triggered, the glyph glows, filling a 60-foot-radius sphere with dim light for 10 minutes, after which time the spell ends. Each creature in the sphere when the glyph activates is targeted by its effect, as is a creature that enters the sphere for the first time on a turn or ends its turn there.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Death.</strong> Each target must make a Constitution saving throw, taking <strong>10d10</strong> Necrotic damage on a failed save, or half as much damage on a successful save.",
        "<strong>Discord.</strong> Each target must make a Constitution saving throw. On a failed save, a target bickers and argues with other creatures for 1 minute. During this time, it is incapable of meaningful communication and has disadvantage on attack rolls and Ability Checks.",
        "<strong>Fear.</strong> Each target must make a Wisdom saving throw and becomes Frightened for 1 minute on a failed save. While Frightened, the target drops whatever it is holding and must move at least 20 feet away from the glyph on each of its turns, if able.",
        "<strong>Hopelessness.</strong> Each target must make a Charisma saving throw. On a failed save, the target is overwhelmed with despair for 1 minute. During this time, it can't attack or target any creature with harmful abilities, spells, or other magical effects.",
        "<strong>Insanity.</strong> Each target must make an Intelligence saving throw. On a failed save, the target is driven insane for 1 minute. An insane creature can't take actions, can't understand what other creatures say, can't read, and speaks only in gibberish. The DM controls its movement, which is erratic.",
        "<strong>Pain.</strong> Each target must make a Constitution saving throw and becomes Incapacitated with excruciating pain for 1 minute on a failed save.",
        "<strong>Sleep.</strong> Each target must make a Wisdom saving throw and falls Unconscious for 10 minutes on a failed save. A creature awakens if it takes damage or if someone uses an action to shake or slap it awake.",
        "<strong>Stunning.</strong> Each target must make a Wisdom saving throw and becomes Stunned for 1 minute on a failed save."
      ]
    }
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: null,
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
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "10 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "This spell instantly transports you and up to eight willing creatures of your choice that you can see within range, or a single object that you can see within range, to a destination you select. If you target an object, it must be able to fit entirely inside a 10-foot cube, and it can't be held or carried by an unwilling creature.",
    "The destination you choose must be known to you, and it must be on the same plane of existence as you. Your familiarity with the destination determines whether you arrive there successfully. The DM rolls <strong>d100</strong> and consults the table.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Permanent circle.</strong> On Target on 01-100.",
        "<strong>Associated object.</strong> On Target on 01-100.",
        "<strong>Very familiar.</strong> Mishap 01-05, Similar Area 06-13, Off Target 14-24, On Target 25-100.",
        "<strong>Seen casually.</strong> Mishap 01-33, Similar Area 34-43, Off Target 44-53, On Target 54-100.",
        "<strong>Viewed once.</strong> Mishap 01-43, Similar Area 44-53, Off Target 54-73, On Target 74-100.",
        "<strong>Description.</strong> Mishap 01-43, Similar Area 44-53, Off Target 54-73, On Target 74-100.",
        "<strong>False destination.</strong> Mishap 01-50, Similar Area 51-100."
      ]
    },
    '"Permanent circle" means a permanent Teleportation Circle whose sigil sequence you know.',
    "\"Associated object\" means that you possess an object taken from the desired destination within the last six months, such as a book from a Wizard's library, bed linen from a royal suite, or a chunk of marble from a lich's secret tomb.",
    '"Very familiar" is a place you have been very often, a place you have carefully studied, or a place you can see when you cast the spell.',
    '"Seen casually" is someplace you have seen more than once but with which you aren\'t very familiar.',
    '"Viewed once" is a place you have seen once, possibly using magic.',
    '"Description" is a place whose location and appearance you know through someone else\'s description, perhaps from a map.',
    "\"False destination\" is a place that doesn't exist. Perhaps you tried to scry an enemy's sanctum but instead viewed an illusion, or you are attempting to teleport to a familiar location that no longer exists.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>On Target.</strong> You and your group, or the target object, appear where you want to.",
        "<strong>Off Target.</strong> You and your group, or the target object, appear a random distance away from the destination in a random direction. Distance off target is <strong>1d10</strong> x <strong>1d10</strong> percent of the distance that was to be traveled.",
        "<strong>Similar Area.</strong> You and your group, or the target object, wind up in a different area that's visually or thematically similar to the target area. Generally, you appear in the closest similar place, but since the spell has no range limit, you could conceivably wind up anywhere on the plane.",
        "<strong>Mishap.</strong> The spell's unpredictable magic results in a difficult journey. Each teleporting creature, or the target object, takes <strong>3d10</strong> Force damage, and the DM rerolls on the table to see where you wind up. Multiple mishaps can occur, dealing damage each time."
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
  mirageArcane,
  mordenkainensMagnificentMansion,
  mordenkainensSword,
  planeShift,
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
