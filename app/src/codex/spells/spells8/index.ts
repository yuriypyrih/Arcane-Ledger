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

export const abiDalzimsHorridWilting: SpellEntry = {
  id: "spell-abi-dalzims-horrid-wilting",
  name: "Abi-Dalzim's Horrid Wilting",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "You draw the moisture from every creature in a 30-foot cube centered on a point you choose within range. Each creature in that area must make a Constitution saving throw. Constructs and Undead aren't affected, and plants and water Elementals make this saving throw with disadvantage. A creature takes 12d8 Necrotic damage on a failed save, or half as much damage on a successful one.",
    "Nonmagical plants in the area that aren't creatures, such as trees and shrubs, wither and die instantly."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const animalShapes: SpellEntry = {
  id: "spell-animal-shapes",
  name: "Animal Shapes",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 24 hours",
  description: [
    "Your magic turns others into Beasts. Choose any number of willing creatures that you can see within range. You transform each target into the form of a Large or smaller Beast with a Challenge Rating of 4 or lower. On subsequent turns, you can use your action to transform affected creatures into new forms.",
    "The transformation lasts for the duration for each target, or until the target drops to 0 Hit Points or dies. You can choose a different form for each target. A target's game statistics are replaced by the statistics of the chosen Beast, though the target retains its alignment and Intelligence, Wisdom, and Charisma scores. The target assumes the Hit Points of its new form, and when it reverts to its normal form, it returns to the number of Hit Points it had before it transformed. If it reverts as a result of dropping to 0 Hit Points, any excess damage carries over to its normal form. As long as the excess damage doesn't reduce the creature's normal form to 0 Hit Points, it isn't knocked Unconscious. The creature is limited in the actions it can perform by the nature of its new form, and it can't speak or cast spells.",
    "The target's gear melds into the new form. The target can't activate, wield, or otherwise benefit from any of its equipment."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 8
};

export const antimagicField: SpellEntry = {
  id: "spell-antimagic-field",
  name: "Antimagic Field",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (10-foot-radius sphere)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 hour",
  description: [
    "A 10-foot-radius Invisible sphere of antimagic surrounds you. This area is divorced from the magical energy that suffuses the multiverse. Within the sphere, spells can't be cast, summoned creatures disappear, and even magic items become mundane. Until the spell ends, the sphere moves with you, centered on you.",
    "Spells and other magical effects, except those created by an artifact or a deity, are suppressed in the sphere and can't protrude into it. A slot expended to cast a suppressed spell is consumed. While an effect is suppressed, it doesn't function, but the time it spends suppressed counts against its duration.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Targeted Effects.</strong> Spells and other magical effects, such as magic missile and charm person, that target a creature or an object in the sphere have no effect on that target.",
        "<strong>Areas of Magic.</strong> The area of another spell or magical effect, such as fireball, can't extend into the sphere. If the sphere overlaps an area of magic, the part of the area that is covered by the sphere is suppressed.",
        "<strong>Spells.</strong> Any active spell or other magical effect on a creature or an object in the sphere is suppressed while the creature or object is in it.",
        "<strong>Magic Items.</strong> The properties and powers of magic items are suppressed in the sphere. A magic weapon's properties and powers are suppressed if it is used against a target in the sphere or wielded by an attacker in the sphere. If a magic weapon or piece of magic ammunition fully leaves the sphere, the magic of the item ceases to be suppressed as soon as it exits.",
        "<strong>Magical Travel.</strong> Teleportation and planar travel fail to work in the sphere, whether the sphere is the destination or the departure point for such magical travel. A portal to another location, world, or plane of existence, as well as an opening to an extradimensional space such as that created by the rope trick spell, temporarily closes while in the sphere.",
        "<strong>Creatures and Objects.</strong> A creature or object summoned or created by magic temporarily winks out of existence in the sphere. Such a creature instantly reappears once the space the creature occupied is no longer within the sphere.",
        "<strong>Dispel Magic.</strong> Spells and magical effects such as dispel magic have no effect on the sphere. Likewise, the spheres created by different antimagic field spells don't nullify each other."
      ]
    }
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const antipathySympathy: SpellEntry = {
  id: "spell-antipathy-sympathy",
  name: "Antipathy/Sympathy",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.HOUR],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "10 days",
  description: [
    "This spell attracts or repels creatures of your choice. You target something within range, either a Huge or smaller object or creature or an area that is no larger than a 200-foot cube. Then specify a kind of intelligent creature, such as red dragons, goblins, or vampires. You invest the target with an aura that either attracts or repels the specified creatures for the duration. Choose antipathy or sympathy as the aura's effect.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Antipathy.</strong> The enchantment causes creatures of the kind you designated to feel an intense urge to leave the area and avoid the target. When such a creature can see the target or comes within 60 feet of it, the creature must succeed on a Wisdom saving throw or become Frightened. The creature remains Frightened while it can see the target or is within 60 feet of it. While Frightened by the target, the creature must use its movement to move to the nearest safe spot from which it can't see the target. If the creature moves more than 60 feet from the target and can't see it, the creature is no longer Frightened, but it becomes Frightened again if it regains sight of the target or moves within 60 feet of it.",
        "<strong>Sympathy.</strong> The enchantment causes the specified creatures to feel an intense urge to approach the target while within 60 feet of it or able to see it. When such a creature can see the target or comes within 60 feet of it, the creature must succeed on a Wisdom saving throw or use its movement on each of its turns to enter the area or move within reach of the target. When the creature has done so, it can't willingly move away from the target. If the target damages or otherwise harms an affected creature, the affected creature can make a Wisdom saving throw to end the effect, as described below.",
        "<strong>Ending the Effect.</strong> If an affected creature ends its turn while not within 60 feet of the target or able to see it, the creature makes a Wisdom saving throw. On a successful save, the creature is no longer affected by the target and recognizes the feeling of repugnance or attraction as magical. In addition, a creature affected by the spell is allowed another Wisdom saving throw every 24 hours while the spell persists. A creature that successfully saves against this effect is immune to it for 1 minute, after which time it can be affected again."
      ]
    }
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const clone: SpellEntry = {
  id: "spell-clone",
  name: "Clone",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.HOUR],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "This spell grows an inert duplicate of a living creature as a safeguard against death. This clone forms inside the vessel used in the spell's casting and grows to full size and maturity after 120 days. You can also choose to have the clone be a younger version of the same creature. It remains inert and endures indefinitely, as long as its vessel remains undisturbed.",
    "At any time after the clone matures, if the original creature dies, its soul transfers to the clone, provided that the soul is free and willing to return. The clone is physically identical to the original and has the same personality, memories, and abilities, but none of the original's equipment. The original creature's physical remains, if they still exist, become inert and can't thereafter be restored to life, since the creature's soul is elsewhere."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const controlWeather: SpellEntry = {
  id: "spell-control-weather",
  name: "Control Weather",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "Self (5-mile radius)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 8 hours",
  description: [
    "You take control of the weather within 5 miles of you for the duration. You must be outdoors to cast this spell. Moving to a place where you don't have a clear path to the sky ends the spell early.",
    "When you cast the spell, you change the current weather conditions, which are determined by the DM based on the climate and season. You can change precipitation, temperature, and wind. It takes 1d4 x 10 minutes for the new conditions to take effect. Once they do so, you can change the conditions again. When the spell ends, the weather gradually returns to normal.",
    "When you change the weather conditions, find a current condition on the following tables and change its stage by one, up or down. When changing the wind, you can change its direction.",
    "Precipitation:",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Stage 1.</strong> Clear.",
        "<strong>Stage 2.</strong> Light clouds.",
        "<strong>Stage 3.</strong> Overcast or ground fog.",
        "<strong>Stage 4.</strong> Rain, hail, or snow.",
        "<strong>Stage 5.</strong> Torrential rain, driving hail, or blizzard."
      ]
    },
    "Temperature:",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Stage 1.</strong> Unbearable heat.",
        "<strong>Stage 2.</strong> Hot.",
        "<strong>Stage 3.</strong> Warm.",
        "<strong>Stage 4.</strong> Cool.",
        "<strong>Stage 5.</strong> Cold.",
        "<strong>Stage 6.</strong> Arctic cold."
      ]
    },
    "Wind:",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Stage 1.</strong> Calm.",
        "<strong>Stage 2.</strong> Moderate wind.",
        "<strong>Stage 3.</strong> Strong wind.",
        "<strong>Stage 4.</strong> Gale.",
        "<strong>Stage 5.</strong> Storm."
      ]
    }
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const darkStar: SpellEntry = {
  id: "spell-dark-star",
  name: "Dark Star",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "This spell creates a sphere centered on a point you choose within range. The sphere can have a radius of up to 40 feet. The area within this sphere is filled with magical darkness and crushing gravitational force.",
    "For the duration, the spell's area is difficult terrain. A creature with Darkvision can't see through the magical darkness, and nonmagical light can't illuminate it. No sound can be created within or pass through the area. Any creature or object entirely inside the sphere is immune to Thunder damage, and creatures are Deafened while entirely inside it. Casting a spell that includes a verbal component is impossible there.",
    "Any creature that enters the spell's area for the first time on a turn or starts its turn there must make a Constitution saving throw. The creature takes 8d10 Force damage on a failed save or half as much damage on a successful save. A creature reduced to 0 Hit Points by this damage is disintegrated. A disintegrated creature and everything it is wearing and carrying, except magic items, are reduced to a pile of fine gray dust."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE]
  ],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const demiplane: SpellEntry = {
  id: "spell-demiplane",
  name: "Demiplane",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.S],
  duration: "1 hour",
  description: [
    "You create a shadowy door on a flat solid surface that you can see within range. The door is large enough to allow Medium creatures to pass through unhindered. When opened, the door leads to a demiplane that appears to be an empty room 30 feet in each dimension, made of wood or stone. When the spell ends, the door disappears, and any creatures or objects inside the demiplane remain trapped there, as the door also disappears from the other side.",
    "Each time you cast this spell, you can create a new demiplane, or have the shadowy door connect to a demiplane you created with a previous casting of this spell. Additionally, if you know the nature and contents of a demiplane created by a casting of this spell by another creature, you can have the shadowy door connect to its demiplane instead."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const dominateMonster: SpellEntry = {
  id: "spell-dominate-monster",
  name: "Dominate Monster",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 1 hour",
  description: [
    "You attempt to beguile a creature that you can see within range. It must succeed on a Wisdom saving throw or be Charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw.",
    'While the creature is Charmed, you have a telepathic link with it as long as the two of you are on the same plane of existence. You can use this telepathic link to issue commands to the creature while you are conscious, no action required, which it does its best to obey. You can specify a simple and general course of action, such as "Attack that creature," "Run over there," or "Fetch that object." If the creature completes the order and doesn\'t receive further direction from you, it defends and preserves itself to the best of its ability.',
    "You can use your action to take total and precise control of the target. Until the end of your next turn, the creature takes only the actions you choose, and doesn't do anything that you don't allow it to do. During this time, you can also cause the creature to use a reaction, but this requires you to use your own reaction as well.",
    "Each time the target takes damage, it makes a new Wisdom saving throw against the spell. If the saving throw succeeds, the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell with a 9th-level spell slot, the duration is concentration, up to 8 hours."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 8
};

export const earthquake: SpellEntry = {
  id: "spell-earthquake",
  name: "Earthquake",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "500 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "You create a seismic disturbance at a point on the ground that you can see within range. For the duration, an intense tremor rips through the ground in a 100-foot-radius circle centered on that point and shakes creatures and structures in contact with the ground in that area.",
    "The ground in the area becomes difficult terrain. Each creature on the ground that is concentrating must make a Constitution saving throw. On a failed save, the creature's Concentration is broken.",
    "When you cast this spell and at the end of each turn you spend concentrating on it, each creature on the ground in the area must make a Dexterity saving throw. On a failed save, the creature is knocked Prone.",
    "This spell can have additional effects depending on the terrain in the area, as determined by the DM.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Fissures.</strong> Fissures open throughout the spell's area at the start of your next turn after you cast the spell. A total of 1d6 such fissures open in locations chosen by the DM. Each is 1d10 x 10 feet deep, 10 feet wide, and extends from one edge of the spell's area to the opposite side. A creature standing on a spot where a fissure opens must succeed on a Dexterity saving throw or fall in. A creature that successfully saves moves with the fissure's edge as it opens. A fissure that opens beneath a structure causes it to automatically collapse.",
        "<strong>Structures.</strong> The tremor deals 50 Bludgeoning damage to any structure in contact with the ground in the area when you cast the spell and at the start of each of your turns until the spell ends. If a structure drops to 0 Hit Points, it collapses and potentially damages nearby creatures. A creature within half the distance of a structure's height must make a Dexterity saving throw. On a failed save, the creature takes 5d6 Bludgeoning damage, is knocked Prone, and is buried in the rubble, requiring a DC 20 Strength (Athletics) check as an action to escape. On a successful save, the creature takes half as much damage and doesn't fall Prone or become buried."
      ]
    }
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER],
  spellLevel: 8
};

export const feeblemind: SpellEntry = {
  id: "spell-feeblemind",
  name: "Feeblemind",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "You blast the mind of a creature that you can see within range, attempting to shatter its intellect and personality. The target takes 4d6 Psychic damage and must make an Intelligence saving throw.",
    "On a failed save, the creature's Intelligence and Charisma scores become 1. The creature can't cast spells, activate magic items, understand language, or communicate in any intelligible way. The creature can, however, identify its friends, follow them, and even protect them.",
    "At the end of every 30 days, the creature can repeat its saving throw against this spell. If it succeeds on its saving throw, the spell ends. The spell can also be ended by Greater Restoration, Heal, or Wish."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 8
};

export const glibness: SpellEntry = {
  id: "spell-glibness",
  name: "Glibness",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: "1 hour",
  description: [
    "Until the spell ends, when you make a Charisma check, you can replace the number you roll with a 15. Additionally, no matter what you say, magic that would determine if you are telling the truth indicates that you are being truthful."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 8
};

export const holyAura: SpellEntry = {
  id: "spell-holy-aura",
  name: "Holy Aura",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "Divine light washes out from you and coalesces in a soft radiance in a 30-foot radius around you. Creatures of your choice in that radius when you cast this spell shed dim light in a 5-foot radius and have advantage on all saving throws, and other creatures have disadvantage on attack rolls against them until the spell ends.",
    "In addition, when a Fiend or an Undead hits an affected creature with a melee attack, the aura flashes with brilliant light. The attacker must succeed on a Constitution saving throw or be Blinded until the spell ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 8
};

export const illusoryDragon: SpellEntry = {
  id: "spell-illusory-dragon",
  name: "Illusory Dragon",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.S],
  duration: "Concentration, up to 1 minute",
  description: [
    "By gathering threads of shadow material from the Shadowfell, you create a Huge shadowy dragon in an unoccupied space that you can see within range. The illusion lasts for the spell's duration and occupies its space, as if it were a creature.",
    "When the illusion appears, any of your enemies that can see it must succeed on a Wisdom saving throw or become Frightened of it for 1 minute. If a Frightened creature ends its turn in a location where it doesn't have line of sight to the illusion, it can repeat the saving throw, ending the effect on itself on a success.",
    "As a Bonus Action on your turn, you can move the illusion up to 60 feet. At any point during its movement, you can cause it to exhale a blast of energy in a 60-foot cone originating from its space.",
    "When you create the dragon, choose a damage type: Acid, Cold, Fire, Lightning, Necrotic, or Poison. Each creature in the cone must make an Intelligence saving throw, taking 7d6 damage of the chosen type on a failed save, or half as much damage on a successful one.",
    "The illusion is tangible because of the shadow stuff used to create it, but attacks miss it automatically. It succeeds on all saving throws, and it is immune to all damage and conditions. A creature that uses an action to examine the dragon can determine that it is an illusion by succeeding on an Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through it and has advantage on saving throws against its breath."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const incendiaryCloud: SpellEntry = {
  id: "spell-incendiary-cloud",
  name: "Incendiary Cloud",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 1 minute",
  description: [
    "A swirling cloud of smoke shot through with white-hot embers appears in a 20-foot-radius sphere centered on a point within range. The cloud spreads around corners and is heavily obscured. It lasts for the duration or until a wind of moderate or greater speed, at least 10 miles per hour, disperses it.",
    "When the cloud appears, each creature in it must make a Dexterity saving throw. A creature takes 10d8 Fire damage on a failed save, or half as much damage on a successful one. A creature must also make this saving throw when it enters the spell's area for the first time on a turn or ends its turn there.",
    "The cloud moves 10 feet directly away from you in a direction that you choose at the start of each of your turns."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE]
  ],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const maddeningDarkness: SpellEntry = {
  id: "spell-maddening-darkness",
  name: "Maddening Darkness",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.M],
  duration: "Concentration, up to 10 minutes",
  description: [
    "Magical darkness spreads from a point you choose within range to fill a 60-foot-radius sphere until the spell ends. The darkness spreads around corners. A creature with Darkvision can't see through this darkness. Nonmagical light, as well as light created by spells of 8th level or lower, can't illuminate the area. Shrieks, gibbering, and mad laughter can be heard within the sphere.",
    "Whenever a creature starts its turn in the sphere, it must make a Wisdom saving throw, taking 8d8 Psychic damage on a failed save, or half as much damage on a successful one."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.PSYCHIC],
    [DICE.D8, DAMAGE_TYPE.PSYCHIC],
    [DICE.D8, DAMAGE_TYPE.PSYCHIC],
    [DICE.D8, DAMAGE_TYPE.PSYCHIC],
    [DICE.D8, DAMAGE_TYPE.PSYCHIC],
    [DICE.D8, DAMAGE_TYPE.PSYCHIC],
    [DICE.D8, DAMAGE_TYPE.PSYCHIC],
    [DICE.D8, DAMAGE_TYPE.PSYCHIC]
  ],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const maze: SpellEntry = {
  id: "spell-maze",
  name: "Maze",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 10 minutes",
  description: [
    "You banish a creature that you can see within range into a labyrinthine demiplane. The target remains there for the duration or until it escapes the maze.",
    "The target can use its action to attempt to escape. When it does so, it makes a DC 20 Intelligence check. If it succeeds, it escapes, and the spell ends. A minotaur or goristro demon automatically succeeds.",
    "When the spell ends, the target reappears in the space it left or, if that space is occupied, in the nearest unoccupied space."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const mightyFortress: SpellEntry = {
  id: "spell-mighty-fortress",
  name: "Mighty Fortress",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "1 mile",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "A fortress of stone erupts from a square area of ground of your choice that you can see within range. The area is 120 feet on each side, and it must not have any buildings or other structures on it. Any creatures in the area are harmlessly lifted up as the fortress rises.",
    "The fortress has four turrets with square bases, each one 20 feet on a side and 30 feet tall, with one turret on each corner. The turrets are connected to each other by stone walls that are each 80 feet long, creating an enclosed area. Each wall is 1 foot thick and is composed of panels that are 10 feet wide and 20 feet tall. Each panel is contiguous with two other panels or one other panel and a turret. You can place up to four stone doors in the fortress's outer wall.",
    "A small keep stands inside the enclosed area. The keep has a square base that is 50 feet on each side, and it has three floors with 10-foot-high ceilings. Each of the floors can be divided into as many rooms as you like, provided each room is at least 5 feet on each side. The floors of the keep are connected by stone staircases, its walls are 6 inches thick, and interior rooms can have stone doors or open archways as you choose. The keep is furnished and decorated however you like, and it contains sufficient food to serve a nine-course banquet for up to 100 people each day. Furnishings, food, and other objects created by this spell crumble to dust if removed from the fortress.",
    "A staff of one hundred Invisible servants obeys any command given to them by creatures you designate when you cast the spell. Each servant functions as if created by the unseen servant spell.",
    "The walls, turrets, and keep are all made of stone that can be damaged. Each 10-foot by 10-foot section of stone has AC 15 and 30 Hit Points per inch of thickness. It is immune to Poison and Psychic damage. Reducing a section of stone to 0 Hit Points destroys it and might cause connected sections to buckle and collapse at the DM's discretion.",
    "After 7 days or when you cast this spell somewhere else, the fortress harmlessly crumbles and sinks back into the ground, leaving any creatures that were inside it safely on the ground.",
    "Casting this spell on the same spot once every 7 days for a year makes the fortress permanent."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const mindBlank: SpellEntry = {
  id: "spell-mind-blank",
  name: "Mind Blank",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "24 hours",
  description: [
    "Until the spell ends, one willing creature you touch is immune to Psychic damage, any effect that would sense its emotions or read its thoughts, Divination spells, and the Charmed condition. The spell even foils Wish spells and spells or effects of similar power used to affect the target's mind or to gain information about the target."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const powerWordStun: SpellEntry = {
  id: "spell-power-word-stun",
  name: "Power Word: Stun",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "You speak a word of power that can overwhelm the mind of one creature you can see within range, leaving it dumbfounded. If the target has 150 Hit Points or fewer, it is Stunned. Otherwise, the spell has no effect.",
    "The Stunned target must make a Constitution saving throw at the end of each of its turns. On a successful save, this stunning effect ends."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 8
};

export const realityBreak: SpellEntry = {
  id: "spell-reality-break",
  name: "Reality Break",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "You shatter the barriers between realities and timelines, thrusting a creature into turmoil and madness. The target must succeed on a Wisdom saving throw, or it can't take reactions until the spell ends. The affected target must also roll a d10 at the start of each of its turns. The number rolled determines what happens to the target.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>1-2. Vision of the Far Realm.</strong> The target takes 6d12 Psychic damage, and it is Stunned until the end of the turn.",
        "<strong>3-5. Rending Rift.</strong> The target must make a Dexterity saving throw, taking 8d12 Force damage on a failed save, or half as much damage on a successful save.",
        "<strong>6-8. Wormhole.</strong> The target is teleported, along with everything it is wearing and carrying, up to 30 feet to an unoccupied space of your choice that you can see. The target also takes 10d12 Force damage and is knocked Prone.",
        "<strong>9-10. Chill of the Dark Void.</strong> The target takes 10d12 Cold damage, and it is Blinded until the end of the turn."
      ]
    },
    "At the end of each of its turns, the affected target can repeat the Wisdom saving throw, ending the spell on itself on a success."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const sunburst: SpellEntry = {
  id: "spell-sunburst",
  name: "Sunburst",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "Brilliant sunlight flashes in a 60-foot radius centered on a point you choose within range. Each creature in that light must make a Constitution saving throw. On a failed save, a creature takes 12d6 Radiant damage and is Blinded for 1 minute. On a successful save, it takes half as much damage and isn't Blinded by this spell. Undead and Oozes have disadvantage on this saving throw.",
    "A creature Blinded by this spell makes another Constitution saving throw at the end of each of its turns. On a successful save, it is no longer Blinded.",
    "This spell dispels any darkness in its area that was created by a spell."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT]
  ],
  spellLists: [
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 8
};

export const telepathy: SpellEntry = {
  id: "spell-telepathy",
  name: "Telepathy",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Unlimited",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "24 hours",
  description: [
    "You create a telepathic link between yourself and a willing creature with which you are familiar. The creature can be anywhere on the same plane of existence as you. The spell ends if you or the target are no longer on the same plane.",
    "Until the spell ends, you and the target can instantaneously share words, images, sounds, and other sensory messages with one another through the link, and the target recognizes you as the creature it is communicating with. The spell enables a creature with an Intelligence score of at least 1 to understand the meaning of your words and take in the scope of any sensory messages you send to it."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const tsunami: SpellEntry = {
  id: "spell-tsunami",
  name: "Tsunami",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Sight",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 6 rounds",
  description: [
    "A wall of water springs into existence at a point you choose within range. You can make the wall up to 300 feet long, 300 feet high, and 50 feet thick. The wall lasts for the duration.",
    "When the wall appears, each creature within its area must make a Strength saving throw. On a failed save, a creature takes 6d10 Bludgeoning damage, or half as much damage on a successful save.",
    "At the start of each of your turns after the wall appears, the wall, along with any creatures in it, moves 50 feet away from you. Any Huge or smaller creature inside the wall or whose space the wall enters when it moves must succeed on a Strength saving throw or take 5d10 Bludgeoning damage. A creature can take this damage only once per round. At the end of the turn, the wall's height is reduced by 50 feet, and the damage creatures take from the spell on subsequent rounds is reduced by 1d10. When the wall reaches 0 feet in height, the spell ends.",
    "A creature caught in the wall can move by swimming. Because of the force of the wave, though, the creature must make a successful Strength (Athletics) check against your spell save DC in order to move at all. If it fails the check, it can't move. A creature that moves out of the area falls to the ground."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING]
  ],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 8
};

export const spellEntries8: SpellEntry[] = [
  abiDalzimsHorridWilting,
  animalShapes,
  antimagicField,
  antipathySympathy,
  clone,
  controlWeather,
  darkStar,
  demiplane,
  dominateMonster,
  earthquake,
  feeblemind,
  glibness,
  holyAura,
  illusoryDragon,
  incendiaryCloud,
  maddeningDarkness,
  maze,
  mightyFortress,
  mindBlank,
  powerWordStun,
  realityBreak,
  sunburst,
  telepathy,
  tsunami
];
