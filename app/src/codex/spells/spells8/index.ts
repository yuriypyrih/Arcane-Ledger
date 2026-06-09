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

export const abiDalzimsHorridWilting: SpellEntry = {
  id: "spell-abi-dalzims-horrid-wilting",
  name: "Abi-Dalzim's Horrid Wilting",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You draw the moisture from every creature in a 30-foot cube centered on a point you choose within range. Each creature in that area must make a Constitution saving throw. Constructs and Undead aren't affected, and plants and water Elementals make this saving throw with disadvantage. A creature takes <strong>12d8</strong> Necrotic damage on a failed save, or half as much damage on a successful one.",
    "Nonmagical plants in the area that aren't creatures, such as trees and shrubs, wither and die instantly."
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
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const animalShapes: SpellEntry = {
  id: "spell-animal-shapes",
  name: "Animal Shapes",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_animal-shapes", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["24 hours"],
  description: [
    "Choose any number of willing creatures that you can see within range. Each target shape-shifts into a Large or smaller Beast of your choice that has a Challenge Rating of 4 or lower. You can choose a different form for each target. On later turns, you can take a Magic action to transform the targets again. A target's game statistics are replaced by the chosen Beast's statistics, but the target retains its creature type; Hit Points; Hit Point Dice; alignment; ability to communicate; and Intelligence, Wisdom, and Charisma scores. The target's actions are limited by the Beast form's anatomy, and it can't cast spells. The target's equipment melds into the new form, and the target can't use any of that equipment while in that form. The target gains a number of Temporary Hit Points equal to the Hit Points of the first form into which it shape-shifts. These Temporary Hit Points vanish if any remain when the spell ends. The transformation lasts for the duration or until the target ends it as a Bonus Action."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 8
};

export const antimagicField: SpellEntry = {
  id: "spell-antimagic-field",
  name: "Antimagic Field",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_antimagic-field", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "iron filings",
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "An aura of antimagic surrounds you in 10-foot Emanation. No one can cast spells, take Magic actions, or create other magical effects inside the aura, and those things can't target or otherwise affect anything inside it. Magical properties of magic items don't work inside the aura or on anything inside it. Areas of effect created by spells or other magic can't extend into the aura, and no one can teleport into or out of it or use planar travel there. Portals close temporarily while in the aura. Ongoing spells, except those cast by an Artifact or a deity, are suppressed in the area. While an effect is suppressed, it doesn't function, but the time it spends suppressed counts against its duration."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const antipathySympathy: SpellEntry = {
  id: "spell-antipathy-sympathy",
  name: "Antipathy/Sympathy",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_antipathysympathy", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.HOUR],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a mix of vinegar and honey",
  duration: ["10 day"],
  description: [
    "As you cast the spell, choose whether it creates antipathy or sympathy, and target one creature or object that is Huge or smaller. Then specify a kind of creature, such as red dragons, goblins, or vampires. A creature of the chosen kind makes a Wisdom saving throw when it comes within 120 feet of the target. Your choice of antipathy or sympathy determines what happens to a creature when it fails that save:",
    "<strong>Antipathy</strong>. The creature has the Frightened condition. The Frightened creature must use its movement on its turns to get as far away as possible from the target, moving by the safest route.",
    "<strong>Sympathy</strong>. The creature has the Charmed condition. The Charmed creature must use its movement on its turns to get as close as possible to the target, moving by the safest route. If the creature is within 5 feet of the target, the creature can't willingly move away. If the target damages the Charmed creature, that creature can make a Wisdom saving throw to end the effect, as described below.",
    "<strong>Ending the Effect</strong>. If the Frightened or Charmed creature ends its turn more than 120 feet away from the target, the creature makes a Wisdom saving throw. On a successful save, the creature is no longer affected by the target. A creature that successfully saves against this effect is immune to it for 1 minute, after which it can be affected again."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const befuddlement: SpellEntry = {
  id: "spell-befuddlement",
  name: "Befuddlement",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_befuddlement", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a key ring with no keys",
  duration: ["Instantaneous"],
  description: [
    "You blast the mind of a creature that you can see within range. The target makes an Intelligence saving throw. On a failed save, the target takes <strong>10d12</strong> Psychic damage and can't cast spells or take the Magic action. At the end of every 30 days, the target repeats the save, ending the effect on a success. The effect can also be ended by the Greater Restoration, Heal, or Wish spell. On a successful save, the target takes half as much damage only."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.INT,
  isDamagingSpell: true,
  damage: [
    [DICE.D12, DAMAGE_TYPE.PSYCHIC],
    [DICE.D12, DAMAGE_TYPE.PSYCHIC],
    [DICE.D12, DAMAGE_TYPE.PSYCHIC],
    [DICE.D12, DAMAGE_TYPE.PSYCHIC],
    [DICE.D12, DAMAGE_TYPE.PSYCHIC],
    [DICE.D12, DAMAGE_TYPE.PSYCHIC],
    [DICE.D12, DAMAGE_TYPE.PSYCHIC],
    [DICE.D12, DAMAGE_TYPE.PSYCHIC],
    [DICE.D12, DAMAGE_TYPE.PSYCHIC],
    [DICE.D12, DAMAGE_TYPE.PSYCHIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const clone: SpellEntry = {
  id: "spell-clone",
  name: "Clone",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_clone", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.HOUR],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a diamond worth 1,000+ GP, which the spell consumes, and a sealable vessel worth 2,000+ GP that is large enough to hold the creature being cloned",
  duration: ["Instantaneous"],
  description: [
    "You touch a creature or at least 1 cubic inch of its flesh. An inert duplicate of that creature forms inside the vessel used in the spell's casting and finishes growing after 120 days; you choose whether the finished clone is the same age as the creature or younger. The clone remains inert and endures indefinitely while its vessel remains undisturbed. If the original creature dies after the clone finishes forming, the creature's soul transfers to the clone if the soul is free and willing to return. The clone is physically identical to the original and has the same personality, memories, and abilities, but none of the original's equipment. The creature's original remains, if any, become inert and can't be revived, since the creature's soul is elsewhere."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const controlWeather: SpellEntry = {
  id: "spell-control-weather",
  name: "Control Weather",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_control-weather", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "burning incense",
  duration: [DURATION.CONCENTRATION, "up to 8 hours"],
  description: [
    "You take control of the weather within 5 miles of you for the duration. You must be outdoors to cast this spell, and it ends early if you go indoors. When you cast the spell, you change the current weather conditions, which are determined by the GM. You can change precipitation, temperature, and wind. It takes <strong>1d4</strong> × 10 minutes for the new conditions to take effect. Once they do so, you can change the conditions again. When the spell ends, the weather gradually returns to normal. When you change the weather conditions, find a current condition on the following tables and change its stage by one, up or down. When changing the wind, you can change its direction. Table: Precipitation | Stage | Condition | |-------|--------------------------------------------| | 1 | Clear | | 2 | Light clouds | | 3 | Overcast or ground fog | | 4 | Rain, hail, or snow | | 5 | Torrential rain, driving hail, or blizzard | Table: Temperature | Stage | Condition | |-------------|-----------| | 1 | Heat wave | | 2 | Hot | | 3 | Warm | | 4 | Cool | | 5 | Cold | | 6 | Freezing | Table: Wind | Stage | Condition | |-------|---------------| | 1 | Calm | | 2 | Moderate wind | | 3 | Strong wind | | 4 | Gale | | 5 | Storm |"
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const darkStar: SpellEntry = {
  id: "spell-dark-star",
  name: "Dark Star",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "This spell creates a sphere centered on a point you choose within range. The sphere can have a radius of up to 40 feet. The area within this sphere is filled with magical darkness and crushing gravitational force.",
    "For the duration, the spell's area is difficult terrain. A creature with Darkvision can't see through the magical darkness, and nonmagical light can't illuminate it. No sound can be created within or pass through the area. Any creature or object entirely inside the sphere is immune to Thunder damage, and creatures are Deafened while entirely inside it. Casting a spell that includes a verbal component is impossible there.",
    "Any creature that enters the spell's area for the first time on a turn or starts its turn there must make a Constitution saving throw. The creature takes <strong>8d10</strong> Force damage on a failed save or half as much damage on a successful save. A creature reduced to 0 Hit Points by this damage is disintegrated. A disintegrated creature and everything it is wearing and carrying, except magic items, are reduced to a pile of fine gray dust."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
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
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const demiplane: SpellEntry = {
  id: "spell-demiplane",
  name: "Demiplane",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_demiplane", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.S],
  duration: ["1 hour"],
  description: [
    "You create a shadowy Medium door on a flat solid surface that you can see within range. This door can be opened and closed, and it leads to a demiplane that is an empty room 30 feet in each dimension, made of wood or stone (your choice). When the spell ends, the door vanishes, and any objects inside the demiplane remain there. Any creatures inside also remain unless they opt to be shunted through the door as it vanishes, landing with the Prone condition in the unoccupied spaces closest to the door's former space. Each time you cast this spell, you can create a new demiplane or connect the shadowy door to a demiplane you created with a previous casting of this spell. Additionally, if you know the nature and contents of a demiplane created by a casting of this spell by another creature, you can connect the shadowy door to that demiplane instead."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const dominateMonster: SpellEntry = {
  id: "spell-dominate-monster",
  name: "Dominate Monster",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_dominate-monster", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "One creature you can see within range must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target has Advantage on the save if you or your allies are fighting it. Whenever the target takes damage, it repeats the save, ending the spell on itself on a success. You have a telepathic link with the Charmed target while the two of you are on the same plane of existence. On your turn, you can use this link to issue commands to the target (no action required), such as \"Attack that creature,\" \"Move over there,\" or \"Fetch that object.\" The target does its best to obey on its turn. If it completes an order and doesn't receive further direction from you, it acts and moves as it likes, focusing on protecting itself. You can command the target to take a Reaction but must take your own Reaction to do so.",
    "<strong>Using a Higher-Level Spell Slot.</strong> Your Concentration can last longer with a level 9 spell slot (up to 8 hours)."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const earthquake: SpellEntry = {
  id: "spell-earthquake",
  name: "Earthquake",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_earthquake", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "500 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a fractured rock",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Choose a point on the ground that you can see within range. For the duration, an intense tremor rips through the ground in a 100-foot-radius circle centered on that point. The ground there is Difficult Terrain.",
    "When you cast this spell and at the end of each of your turns for the duration, each creature on the ground in the area makes a Dexterity saving throw. On a failed save, a creature has the Prone condition, and its Concentration is broken.",
    "You can also cause the effects below.",
    "<em><strong>Fissures.</strong></em> A total of <strong>1d6</strong> fissures open in the spell's area at the end of the turn you cast it. You choose the fissures' locations, which can't be under structures. Each fissure is <strong>1d10</strong> × 10 feet deep and 10 feet wide, and it extends from one edge of the spell's area to another edge. A creature in the same space as a fissure must succeed on a Dexterity saving throw or fall in. A creature that successfully saves moves with the fissure's edge as it opens.",
    "<em><strong>Structures.</strong></em> The tremor deals 50 Bludgeoning damage to any structure in contact with the ground in the area when you cast the spell and at the end of each of your turns until the spell ends. If a structure drops to 0 Hit Points, it collapses.",
    "A creature within a distance from a collapsing structure equal to half the structure's height makes a Dexterity saving throw. On a failed save, the creature takes <strong>12d6</strong> Bludgeoning damage, has the Prone condition, and is buried in the rubble, requiring a DC 20 Strength (Athletics) check as an action to escape. On a successful save, the creature takes half as much damage only."
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
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER],
  spellLevel: 8
};

export const glibness: SpellEntry = {
  id: "spell-glibness",
  name: "Glibness",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_glibness", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: ["1 hour"],
  description: [
    "Until the spell ends, when you make a Charisma check, you can replace the number you roll with a 15. Additionally, no matter what you say, magic that would determine if you are telling the truth indicates that you are being truthful."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 8
};

export const holyAura: SpellEntry = {
  id: "spell-holy-aura",
  name: "Holy Aura",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_holy-aura", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a reliquary worth 1,000+ GP",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "For the duration, you emit an aura in a 30-foot Emanation. While in the aura, creatures of your choice have Advantage on all saving throws, and other creatures have Disadvantage on attack rolls against them. In addition, when a Fiend or an Undead hits an affected creature with a melee attack roll, the attacker must succeed on a Constitution saving throw or have the Blinded condition until the end of its next turn."
  ],
  isAttackSpell: true,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 8
};

export const illusoryDragon: SpellEntry = {
  id: "spell-illusory-dragon",
  name: "Illusory Dragon",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "By gathering threads of shadow material from the Shadowfell, you create a Huge shadowy dragon in an unoccupied space that you can see within range. The illusion lasts for the spell's duration and occupies its space, as if it were a creature.",
    "When the illusion appears, any of your enemies that can see it must succeed on a Wisdom saving throw or become Frightened of it for 1 minute. If a Frightened creature ends its turn in a location where it doesn't have line of sight to the illusion, it can repeat the saving throw, ending the effect on itself on a success.",
    "As a Bonus Action on your turn, you can move the illusion up to 60 feet. At any point during its movement, you can cause it to exhale a blast of energy in a 60-foot cone originating from its space.",
    "When you create the dragon, choose a damage type: Acid, Cold, Fire, Lightning, Necrotic, or Poison. Each creature in the cone must make an Intelligence saving throw, taking <strong>7d6</strong> damage of the chosen type on a failed save, or half as much damage on a successful one.",
    "The illusion is tangible because of the shadow stuff used to create it, but attacks miss it automatically. It succeeds on all saving throws, and it is immune to all damage and conditions. A creature that uses an action to examine the dragon can determine that it is an illusion by succeeding on an Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through it and has advantage on saving throws against its breath."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.NECROTIC, DAMAGE_TYPE.POISON]],
    [DICE.D6, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.NECROTIC, DAMAGE_TYPE.POISON]],
    [DICE.D6, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.NECROTIC, DAMAGE_TYPE.POISON]],
    [DICE.D6, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.NECROTIC, DAMAGE_TYPE.POISON]],
    [DICE.D6, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.NECROTIC, DAMAGE_TYPE.POISON]],
    [DICE.D6, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.NECROTIC, DAMAGE_TYPE.POISON]],
    [DICE.D6, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.NECROTIC, DAMAGE_TYPE.POISON]]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const incendiaryCloud: SpellEntry = {
  id: "spell-incendiary-cloud",
  name: "Incendiary Cloud",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_incendiary-cloud", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A swirling cloud of embers and smoke fills a 20-foot-radius Sphere centered on a point within range. The cloud's area is Heavily Obscured. It lasts for the duration or until a strong wind (like that created by Gust of Wind) disperses it. When the cloud appears, each creature in it makes a Dexterity saving throw, taking <strong>10d8</strong> Fire damage on a failed save or half as much damage on a successful one. A creature must also make this save when the Sphere moves into its space and when it enters the Sphere or ends its turn there. A creature makes this save only once per turn. The cloud moves 10 feet away from you in a direction you choose at the start of each of your turns."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const maddeningDarkness: SpellEntry = {
  id: "spell-maddening-darkness",
  name: "Maddening Darkness",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Magical darkness spreads from a point you choose within range to fill a 60-foot-radius sphere until the spell ends. The darkness spreads around corners. A creature with Darkvision can't see through this darkness. Nonmagical light, as well as light created by spells of 8th level or lower, can't illuminate the area. Shrieks, gibbering, and mad laughter can be heard within the sphere.",
    "Whenever a creature starts its turn in the sphere, it must make a Wisdom saving throw, taking <strong>8d8</strong> Psychic damage on a failed save, or half as much damage on a successful one."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
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
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const maze: SpellEntry = {
  id: "spell-maze",
  name: "Maze",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_maze", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You banish a creature that you can see within range into a labyrinthine demiplane. The target remains there for the duration or until it escapes the maze. The target can take a Study action to try to escape. When it does so, it makes a DC 20 Intelligence (Investigation) check. If it succeeds, it escapes, and the spell ends. When the spell ends, the target reappears in the space it left or, if that space is occupied, in the nearest unoccupied space."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const mightyFortress: SpellEntry = {
  id: "spell-mighty-fortress",
  name: "Mighty Fortress",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "1 mile",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "A fortress of stone erupts from a square area of ground of your choice that you can see within range. The area is 120 feet on each side, and it must not have any buildings or other structures on it. Any creatures in the area are harmlessly lifted up as the fortress rises.",
    "The fortress has four turrets with square bases, each one 20 feet on a side and 30 feet tall, with one turret on each corner. The turrets are connected to each other by stone walls that are each 80 feet long, creating an enclosed area. Each wall is 1 foot thick and is composed of panels that are 10 feet wide and 20 feet tall. Each panel is contiguous with two other panels or one other panel and a turret. You can place up to four stone doors in the fortress's outer wall.",
    "A small keep stands inside the enclosed area. The keep has a square base that is 50 feet on each side, and it has three floors with 10-foot-high ceilings. Each of the floors can be divided into as many rooms as you like, provided each room is at least 5 feet on each side. The floors of the keep are connected by stone staircases, its walls are 6 inches thick, and interior rooms can have stone doors or open archways as you choose. The keep is furnished and decorated however you like, and it contains sufficient food to serve a nine-course banquet for up to 100 people each day. Furnishings, food, and other objects created by this spell crumble to dust if removed from the fortress.",
    "A staff of one hundred Invisible servants obeys any command given to them by creatures you designate when you cast the spell. Each servant functions as if created by the unseen servant spell.",
    "The walls, turrets, and keep are all made of stone that can be damaged. Each 10-foot by 10-foot section of stone has AC 15 and 30 Hit Points per inch of thickness. It is immune to Poison and Psychic damage. Reducing a section of stone to 0 Hit Points destroys it and might cause connected sections to buckle and collapse at the GM's discretion.",
    "After 7 days or when you cast this spell somewhere else, the fortress harmlessly crumbles and sinks back into the ground, leaving any creatures that were inside it safely on the ground.",
    "Casting this spell on the same spot once every 7 days for a year makes the fortress permanent."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const mindBlank: SpellEntry = {
  id: "spell-mind-blank",
  name: "Mind Blank",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_mind-blank", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["24 hours"],
  description: [
    "Until the spell ends, one willing creature you touch has Immunity to Psychic damage and the Charmed condition. The target is also unaffected by anything that would sense its emotions or alignment, read its thoughts, or magically detect its location, and no spell—not even Wish—can gather information about the target, observe it remotely, or control its mind."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const powerWordStun: SpellEntry = {
  id: "spell-power-word-stun",
  name: "Power Word Stun",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_power-word-stun", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You overwhelm the mind of one creature you can see within range. If the target has 150 Hit Points or fewer, it has the Stunned condition. Otherwise, its Speed is 0 until the start of your next turn. The Stunned target makes a Constitution saving throw at the end of each of its turns, ending the condition on itself on a success."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const realityBreak: SpellEntry = {
  id: "spell-reality-break",
  name: "Reality Break",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You shatter the barriers between realities and timelines, thrusting a creature into turmoil and madness. The target must succeed on a Wisdom saving throw, or it can't take reactions until the spell ends. The affected target must also roll a <strong>d10</strong> at the start of each of its turns. The number rolled determines what happens to the target.",
    { type: "list", style: "bullet", items: ["<strong>1-2. Vision of the Far Realm.</strong> The target takes <strong>6d12</strong> Psychic damage, and it is Stunned until the end of the turn.", "<strong>3-5. Rending Rift.</strong> The target must make a Dexterity saving throw, taking <strong>8d12</strong> Force damage on a failed save, or half as much damage on a successful save.", "<strong>6-8. Wormhole.</strong> The target is teleported, along with everything it is wearing and carrying, up to 30 feet to an unoccupied space of your choice that you can see. The target also takes <strong>10d12</strong> Force damage and is knocked Prone.", "<strong>9-10. Chill of the Dark Void.</strong> The target takes <strong>10d12</strong> Cold damage, and it is Blinded until the end of the turn."] },
    "At the end of each of its turns, the affected target can repeat the Wisdom saving throw, ending the spell on itself on a success."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
  damage: [
    [DICE.D12, [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.COLD, DAMAGE_TYPE.PSYCHIC]],
    [DICE.D12, [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.COLD, DAMAGE_TYPE.PSYCHIC]],
    [DICE.D12, [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.COLD, DAMAGE_TYPE.PSYCHIC]],
    [DICE.D12, [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.COLD, DAMAGE_TYPE.PSYCHIC]],
    [DICE.D12, [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.COLD, DAMAGE_TYPE.PSYCHIC]],
    [DICE.D12, [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.COLD, DAMAGE_TYPE.PSYCHIC]],
    [DICE.D12, [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.COLD, DAMAGE_TYPE.PSYCHIC]],
    [DICE.D12, [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.COLD, DAMAGE_TYPE.PSYCHIC]],
    [DICE.D12, [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.COLD, DAMAGE_TYPE.PSYCHIC]],
    [DICE.D12, [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.COLD, DAMAGE_TYPE.PSYCHIC]]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const sunburst: SpellEntry = {
  id: "spell-sunburst",
  name: "Sunburst",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_sunburst", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a piece of sunstone",
  duration: ["Instantaneous"],
  description: [
    "Brilliant sunlight flashes in a 60-foot-radius Sphere centered on a point you choose within range. Each creature in the Sphere makes a Constitution saving throw. On a failed save, a creature takes <strong>12d6</strong> Radiant damage and has the Blinded condition for 1 minute. On a successful save, it takes half as much damage only. A creature Blinded by this spell makes another Constitution saving throw at the end of each of its turns, ending the effect on itself on a success. This spell dispels Darkness in its area that was created by any spell."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
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
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const telepathy: SpellEntry = {
  id: "spell-telepathy",
  name: "Telepathy",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Unlimited",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["24 hours"],
  description: [
    "You create a telepathic link between yourself and a willing creature with which you are familiar. The creature can be anywhere on the same plane of existence as you. The spell ends if you or the target are no longer on the same plane.",
    "Until the spell ends, you and the target can instantaneously share words, images, sounds, and other sensory messages with one another through the link, and the target recognizes you as the creature it is communicating with. The spell enables a creature with an Intelligence score of at least 1 to understand the meaning of your words and take in the scope of any sensory messages you send to it."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
};

export const tsunami: SpellEntry = {
  id: "spell-tsunami",
  name: "Tsunami",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_tsunami", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "1 mile",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 6 round"],
  description: [
    "A wall of water springs into existence at a point you choose within range. You can make the wall up to 300 feet long, 300 feet high, and 50 feet thick. The wall lasts for the duration. When the wall appears, each creature in its area makes a Strength saving throw, taking <strong>6d10</strong> Bludgeoning damage on a failed save or half as much damage on a successful one. At the start of each of your turns after the wall appears, the wall, along with any creatures in it, moves 50 feet away from you. Any Huge or smaller creature inside the wall or whose space the wall enters when it moves must succeed on a Strength saving throw or take <strong>5d10</strong> Bludgeoning damage. A creature can take this damage only once per round. At the end of the turn, the wall's height is reduced by 50 feet, and the damage the wall deals on later rounds is reduced by <strong>1d10</strong>. When the wall reaches 0 feet in height, the spell ends. A creature caught in the wall can move by swimming. Because of the wave's force, though, the creature must succeed on a Strength (Athletics) check against your spell save DC to move at all. If it fails the check, it can't move. A creature that moves out of the wall falls to the ground. ### U-Z Spells"
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.STR,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 8
};

export const spellEntries8: SpellEntry[] = [
  abiDalzimsHorridWilting,
  animalShapes,
  antimagicField,
  antipathySympathy,
  befuddlement,
  clone,
  controlWeather,
  darkStar,
  demiplane,
  dominateMonster,
  earthquake,
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
