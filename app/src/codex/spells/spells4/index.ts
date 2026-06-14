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

export const arcaneEye: SpellEntry = {
  id: "spell-arcane-eye",
  name: "Arcane Eye",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_arcane-eye", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a bit of bat fur",
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You create an Invisible, invulnerable eye within range that hovers for the duration. You mentally receive visual information from the eye, which can see in every direction. It also has Darkvision with a range of 30 feet. As a Bonus Action, you can move the eye up to 30 feet in any direction. A solid barrier blocks the eye's movement, but the eye can pass through an opening as small as 1 inch in diameter."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const auraOfLife: SpellEntry = {
  id: "spell-aura-of-life",
  name: "Aura of Life",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_aura-of-life", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "An aura radiates from you in a 30-foot Emanation for the duration. While in the aura, you and your allies have Resistance to Necrotic damage, and your Hit Point maximums can't be reduced. If an ally with 0 Hit Points starts its turn in the aura, that ally regains 1 Hit Point."
  ],
  isHealingSpell: true,
  damage: [],
  healing: [1],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 4
};

export const auraOfPurity: SpellEntry = {
  id: "spell-aura-of-purity",
  name: "Aura of Purity",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot radius)",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Purifying energy radiates from you in an aura with a 30-foot radius. Until the spell ends, the aura moves with you, centered on you. Each non-hostile creature in the aura, including you, can't become diseased, has Resistance to Poison damage, and has Advantage on saving throws against effects that cause any of the following conditions: Blinded, Charmed, Deafened, Frightened, Paralyzed, Poisoned, and Stunned."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 4
};

export const banishment: SpellEntry = {
  id: "spell-banishment",
  name: "Banishment",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_banishment", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a pentacle",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "One creature that you can see within range must succeed on a Charisma saving throw or be transported to a harmless demiplane for the duration. While there, the target has the Incapacitated condition. When the spell ends, the target reappears in the space it left or in the nearest unoccupied space if that space is occupied. If the target is an Aberration, a Celestial, an Elemental, a Fey, or a Fiend, the target doesn't return if the spell lasts for 1 minute. The target is instead transported to a random location on a plane (GM's choice) associated with its creature type.",
    "<strong>Using a Higher-Level Spell Slot.</strong> You can target one additional creature for each spell slot level above 4."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CHA,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const blackTentacles: SpellEntry = {
  id: "spell-black-tentacles",
  name: "Black Tentacles",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_black-tentacles", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a tentacle",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Squirming, ebony tentacles fill a 20-foot square on ground that you can see within range. For the duration, these tentacles turn the ground in that area into Difficult Terrain. Each creature in that area makes a Strength saving throw. On a failed save, it takes <strong>3d6</strong> Bludgeoning damage, and it has the Restrained condition until the spell ends. A creature also makes that save if it enters the area or ends it turn there. A creature makes that save only once per turn. A Restrained creature can take an action to make a Strength (Athletics) check against your spell save DC, ending the condition on itself on a success."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.STR,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const blight: SpellEntry = {
  id: "spell-blight",
  name: "Blight",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_blight", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "A creature that you can see within range makes a Constitution saving throw, taking <strong>8d8</strong> Necrotic damage on a failed save or half as much damage on a successful one. A Plant creature automatically fails the save. Alternatively, target a nonmagical plant that isn't a creature, such as a tree or shrub. It doesn't make a save; it simply withers and dies.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d8</strong> for each spell slot level above 4."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const charmMonster: SpellEntry = {
  id: "spell-charm-monster",
  name: "Charm Monster",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_charm-monster", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 hour"],
  description: [
    "One creature you can see within range makes a Wisdom saving throw. It does so with Advantage if you or your allies are fighting it. On a failed save, the target has the Charmed condition until the spell ends or until you or your allies damage it. The Charmed creature is Friendly to you. When the spell ends, the target knows it was Charmed by you.",
    "<strong>Using a Higher-Level Spell Slot.</strong> You can target one additional creature for each spell slot level above 4."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const compulsion: SpellEntry = {
  id: "spell-compulsion",
  name: "Compulsion",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_compulsion", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Each creature of your choice that you can see within range must succeed on a Wisdom saving throw or have the Charmed condition until the spell ends. For the duration, you can take a Bonus Action to designate a direction that is horizontal to you. Each Charmed target must use as much of its movement as possible to move in that direction on its next turn, taking the safest route. After moving in this way, a target repeats the save, ending the spell on itself on a success."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD],
  spellLevel: 4
};

export const confusion: SpellEntry = {
  id: "spell-confusion",
  name: "Confusion",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_confusion", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "three nut shells",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Each creature in a 10-foot-radius Sphere centered on a point you choose within range must succeed on a Wisdom saving throw, or that target can't take Bonus Actions or Reactions and must roll <strong>1d10</strong> at the start of each of its turns to determine its behavior for that turn, consulting the table below. Table: <strong>1d10</strong> Behavior for the Turn | d10 | Behavior for the Turn | |------|----------------------------------------------------------------------------------------------------------------------------------------------| | 1 | The target doesn't take an action, and it uses all its movement to move. Roll <strong>1d4</strong> for the direction: 1, north; 2, east; 3, south; or 4, west.| | 2–6 | The target doesn't move or take actions. | | 7–8 | The target doesn't move, and it takes the Attack action to make one melee attack against a random creature within reach. If none are within reach, the target takes no action. | | 9–10 | The target chooses its behavior. | At the end of each of its turns, an affected target repeats the save, ending the spell on itself on a success.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The Sphere's radius increases by 5 feet for each spell slot level above 4."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const conjureBarlgura: SpellEntry = {
  id: "spell-conjure-barlgura",
  name: "Conjure Barlgura",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Up to 10 minutes"],
  description: [
    "You summon a barlgura that appears in an unoccupied space you can see within range. The barlgura disappears when it drops to 0 Hit Points or when the spell ends.",
    "The barlgura is hostile to all non-demons. Roll Initiative for the barlgura, which has its own turns. At the start of its turn, it moves toward and attacks the nearest non-demon it can perceive. If two or more creatures are equally near, it picks one at random. If it cannot see any potential enemies, the barlgura moves in a random direction in search of foes.",
    "As part of casting the spell, you can scribe a circle on the ground using the blood of an intelligent Humanoid slain within the past 24 hours. The circle is large enough to encompass your space. The summoned barlgura cannot cross the circle or target anyone in it while the spell lasts."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const conjureKnowbot: SpellEntry = {
  id: "spell-conjure-knowbot",
  name: "Conjure Knowbot",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["10 minutes"],
  description: [
    "You touch a single computerized device or computer system to conjure a knowbot, a partially sentient piece of software imprinted with vestiges of your own skills and computer abilities. For the duration of the spell, you can use a Bonus Action to have the knowbot execute a computer-related task that would normally require an action. The knowbot makes Intelligence ability checks using your ability score and proficiency bonuses including your proficiency with hacking tools, if applicable.",
    "You have a limited telepathic bond with the knowbot, out to a range of 500 feet from the device or system where the knowbot was conjured. If you move beyond this range, the knowbot disappears in <strong>2d4</strong> rounds, as if the duration of the spell had expired. Moving within range again immediately reestablishes the bond.",
    "The knowbot is bound to the system in which it was created, and it stays there until it is dismissed or the spell's duration expires.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the spell's duration increases to 1 hour. Additionally, your telepathic bond with the knowbot is effective out to a range of 1,000 feet, and if you leave the range of the bond, the knowbot continues performing its last directed task until the spell expires."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const conjureMinorElementals: SpellEntry = {
  id: "spell-conjure-minor-elementals",
  name: "Conjure Minor Elementals",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_conjure-minor-elementals", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You conjure spirits from the Elemental Planes that flit around you in a 15-foot Emanation for the duration. Until the spell ends, any attack you make deals an extra <strong>2d8</strong> damage when you hit a creature in the Emanation. This damage is Acid, Cold, Fire, or Lightning (your choice when you make the attack). In addition, the ground in the Emanation is Difficult Terrain for your enemies.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d8</strong> for each spell slot level above 4."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const conjureShadowDemon: SpellEntry = {
  id: "spell-conjure-shadow-demon",
  name: "Conjure Shadow Demon",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You summon a shadow demon that appears in an unoccupied space you can see within range. The shadow demon disappears when it drops to 0 Hit Points or when the spell ends.",
    "Roll Initiative for the shadow demon, which has its own turns. You can issue orders to the shadow demon, and it obeys you as long as it can attack a creature on each of its turns and does not start its turn in an area of bright light. If either of these conditions is not met, the shadow demon immediately makes a Charisma check contested by your Charisma check. If you fail the check, the spell no longer requires Concentration and the demon is no longer under your control. The demon automatically succeeds on the check if it is more than 100 feet away from you.",
    "As part of casting the spell, you can scribe a circle on the ground using the blood of an intelligent Humanoid slain within the past 24 hours. The circle is large enough to encompass your space. The summoned shadow demon cannot cross the circle or target anyone in it while the spell lasts."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const conjureWoodlandBeings: SpellEntry = {
  id: "spell-conjure-woodland-beings",
  name: "Conjure Woodland Beings",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_conjure-woodland-beings", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You conjure nature spirits that flit around you in a 10-foot Emanation for the duration. Whenever the Emanation enters the space of a creature you can see and whenever a creature you can see enters the Emanation or ends its turn there, you can force that creature to make a Wisdom saving throw. The creature takes <strong>5d8</strong> Force damage on a failed save or half as much damage on a successful one. A creature makes this save only once per turn. In addition, you can take the Disengage action as a Bonus Action for the spell's duration.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d8</strong> for each spell slot level above 4."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 4
};

export const controlWater: SpellEntry = {
  id: "spell-control-water",
  name: "Control Water",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_control-water", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "300 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a mixture of water and dust",
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Until the spell ends, you control any water inside an area you choose that is a Cube up to 100 feet on a side, using one of the following effects. As a Magic action on your later turns, you can repeat the same effect or choose a different one. The water level remains elevated until the spell ends or you choose a different effect. If this effect produced a wave, the wave repeats on the start of your next turn while the flood effect lasts."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const deathWard: SpellEntry = {
  id: "spell-death-ward",
  name: "Death Ward",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_death-ward", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["8 hours"],
  description: [
    "You touch a creature and grant it a measure of protection from death. The first time the target would drop to 0 Hit Points before the spell ends, the target instead drops to 1 Hit Point, and the spell ends. If the spell is still in effect when the target is subjected to an effect that would kill it instantly without dealing damage, that effect is negated against the target, and the spell ends."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 4
};

export const dimensionDoor: SpellEntry = {
  id: "spell-dimension-door",
  name: "Dimension Door",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_dimension-door", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "500 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You teleport to a location within range. You arrive at exactly the spot desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and direction, such as \"200 feet straight downward\" or \"300 feet upward to the northwest at a 45-degree angle.\" You can also teleport one willing creature. The creature must be within 5 feet of you when you teleport, and it teleports to a space within 5 feet of your destination space. If you, the other creature, or both would arrive in a space occupied by a creature or completely filled by one or more objects, you and any creature traveling with you each take <strong>4d6</strong> Force damage, and the teleportation fails."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const divination: SpellEntry = {
  id: "spell-divination",
  name: "Divination",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_divination", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "incense worth 25+ GP, which the spell consumes",
  duration: ["Instantaneous"],
  description: [
    "This spell puts you in contact with a god or a god's servants. You ask one question about a specific goal, event, or activity to occur within 7 days. The GM offers a truthful reply, which might be a short phrase or cryptic rhyme. The spell doesn't account for circumstances that might change the answer, such as the casting of other spells. If you cast the spell more than once before finishing a Long Rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4,
  ritual: true
};

export const dominateBeast: SpellEntry = {
  id: "spell-dominate-beast",
  name: "Dominate Beast",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_dominate-beast", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "One Beast you can see within range must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target has Advantage on the save if you or your allies are fighting it. Whenever the target takes damage, it repeats the save, ending the spell on itself on a success. You have a telepathic link with the Charmed target while the two of you are on the same plane of existence. On your turn, you can use this link to issue commands to the target (no action required), such as \"Attack that creature,\" \"Move over there,\" or \"Fetch that object.\" The target does its best to obey on its turn. If it completes an order and doesn't receive further direction from you, it acts and moves as it likes, focusing on protecting itself. You can command the target to take a Reaction but must take your own Reaction to do so.",
    "<strong>Using a Higher-Level Spell Slot.</strong> Your Concentration can last longer with a spell slot of level 5 (up to 10 minutes), 6 (up to 1 hour), or 7+ (up to 8 hours)."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.SORCERER],
  spellLevel: 4
};

export const egoWhip: SpellEntry = {
  id: "spell-ego-whip",
  name: "Ego Whip",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You lash the mind of one creature you can see within range, filling it with despair. The target must succeed on an Intelligence saving throw or suffer Disadvantage on attack rolls, ability checks, and saving throws, and it can't cast spells. At the end of each of its turns, the target can make another Intelligence saving throw. On a success, the spell ends on the target."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.INT,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const elementalBane: SpellEntry = {
  id: "spell-elemental-bane",
  name: "Elemental Bane",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Choose one creature you can see within range, and choose one of the following damage types: Acid, Cold, Fire, Lightning, or Thunder. The target must succeed on a Constitution saving throw or be affected by the spell for its duration. The first time each turn the affected target takes damage of the chosen type, the target takes an extra <strong>2d6</strong> damage of that type. Moreover, the target loses any Resistance to that damage type until the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, you can target one additional creature for each slot level above 4th. The creatures must be within 30 feet of each other when you target them."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.THUNDER]],
    [DICE.D6, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.THUNDER]]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD, SPELL_LIST_CLASS.ARTIFICER],
  spellLevel: 4
};

export const fabricate: SpellEntry = {
  id: "spell-fabricate",
  name: "Fabricate",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_fabricate", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You convert raw materials into products of the same material. For example, you can fabricate a wooden bridge from a clump of trees, a rope from a patch of hemp, or clothes from flax or wool. Choose raw materials that you can see within range. You can fabricate a Large or smaller object (contained within a 10-foot Cube or eight connected 5-foot Cubes) given a sufficient quantity of material. If you're working with metal, stone, or another mineral substance, however, the fabricated object can be no larger than Medium (contained within a 5-foot Cube). The quality of any fabricated objects is based on the quality of the raw materials. Creatures and magic items can't be created by this spell. You also can't use it to create items that require a high degree of skill—such as weapons and armor—unless you have proficiency with the type of Artisan's Tools used to craft such objects."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const faithfulHound: SpellEntry = {
  id: "spell-faithful-hound",
  name: "Faithful Hound",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_faithful-hound", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a silver whistle",
  duration: ["8 hours"],
  description: [
    "You conjure a phantom watchdog in an unoccupied space that you can see within range. The hound remains for the duration or until the two of you are more than 300 feet apart from each other. No one but you can see the hound, and it is intangible and invulnerable. When a Small or larger creature comes within 30 feet of it without first speaking the password that you specify when you cast this spell, the hound starts barking loudly. The hound has Truesight with a range of 30 feet. At the start of each of your turns, the hound attempts to bite one enemy within 5 feet of it. That enemy must succeed on a Dexterity saving throw or take <strong>4d8</strong> Force damage. On your later turns, you can take a Magic action to move the hound up to 30 feet."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const findGreaterSteed: SpellEntry = {
  id: "spell-find-greater-steed",
  name: "Find Greater Steed",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You summon a spirit that assumes the form of a loyal, majestic mount. Appearing in an unoccupied space within range, the spirit takes on a form you choose: a griffon, a pegasus, a peryton, a dire wolf, a rhinoceros, or a saber-toothed tiger. The creature has the statistics provided in the Monster Manual for the chosen form, though it is a Celestial, a Fey, or a Fiend, your choice, instead of its normal creature type. Additionally, if it has an Intelligence score of 5 or lower, its Intelligence becomes 6, and it gains the ability to understand one language of your choice that you speak.",
    "You control the mount in combat. While the mount is within 1 mile of you, you can communicate with it telepathically. While mounted on it, you can make any spell you cast that targets only you also target the mount. The mount disappears temporarily when it drops to 0 Hit Points or when you dismiss it as an action. Casting this spell again re-summons the bonded mount, with all its Hit Points restored and any conditions removed. You can't have more than one mount bonded by this spell or Find Steed at the same time. As an action, you can release a mount from its bond, causing it to disappear permanently. Whenever the mount disappears, it leaves behind any objects it was wearing or carrying."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 4
};

export const fireShield: SpellEntry = {
  id: "spell-fire-shield",
  name: "Fire Shield",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_fire-shield", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a bit of phosphorus or a firefly",
  duration: ["10 minutes"],
  description: [
    "Wispy flames wreathe your body for the duration, shedding Bright Light in a 10-foot radius and Dim Light for an additional 10 feet. The flames provide you with a warm shield or a chill shield, as you choose. The warm shield grants you Resistance to Cold damage, and the chill shield grants you Resistance to Fire damage. In addition, whenever a creature within 5 feet of you hits you with a melee attack roll, the shield erupts with flame. The attacker takes <strong>2d8</strong> Fire damage from a warm shield or <strong>2d8</strong> Cold damage from a chill shield."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.COLD],
    [DICE.D8, DAMAGE_TYPE.COLD]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const freedomOfMovement: SpellEntry = {
  id: "spell-freedom-of-movement",
  name: "Freedom of Movement",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_freedom-of-movement", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a leather strap",
  duration: ["1 hour"],
  description: [
    "You touch a willing creature. For the duration, the target's movement is unaffected by Difficult Terrain, and spells and other magical effects can neither reduce the target's Speed nor cause the target to have the Paralyzed or Restrained conditions. The target also has a Swim Speed equal to its Speed.",
    "In addition, the target can spend 5 feet of movement to automatically escape from nonmagical restraints, such as manacles or a creature imposing the Grappled condition on it.",
    "<strong>Using a Higher-Level Spell Slot.</strong> You can target one additional creature for each spell slot level above 4."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 4
};

export const galdersSpeedyCourier: SpellEntry = {
  id: "spell-galders-speedy-courier",
  name: "Galder's Speedy Courier",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["10 minutes"],
  description: [
    "You summon a Small air elemental to a spot within range. The air elemental is formless, nearly transparent, immune to all damage, and cannot interact with other creatures or objects. It carries an open, empty chest whose interior dimensions are 3 feet on each side. While the spell lasts, you can deposit as many items inside the chest as will fit. You can then name a living creature you have met and seen at least once before, or any creature for which you possess a body part, lock of hair, clipping from a nail, or similar portion of the creature's body.",
    "As soon as the lid of the chest is closed, the elemental and the chest disappear, then reappear adjacent to the target creature. If the target creature is on another plane, or if it is proofed against magical detection or location, the contents of the chest reappear on the ground at your feet.",
    "The target creature is made aware of the chest's contents before it chooses whether or not to open it, and knows how much of the spell's duration remains in which it can retrieve them. No other creature can open the chest and retrieve its contents. When the spell expires or when all the contents of the chest have been removed, the elemental and the chest disappear. The elemental also disappears if the target creature orders it to return the items to you. When the elemental disappears, any items not taken from the chest reappear on the ground at your feet.",
    "<strong>At Higher Levels.</strong> When you cast this spell using an 8th-level spell slot, you can send the chest to a creature on a different plane of existence from you."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const gateSeal: SpellEntry = {
  id: "spell-gate-seal",
  name: "Gate Seal",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["24 hours"],
  description: [
    "You fortify the fabric of the planes within a 30-foot cube you can see within range. Within that area, portals close and can't be opened for the duration. Spells and other effects that allow planar travel or open portals, such as Gate or Plane Shift, fail if used to enter or leave the area. The cube is stationary.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, the spell lasts until dispelled."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const giantInsect: SpellEntry = {
  id: "spell-giant-insect",
  name: "Giant Insect",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_giant-insect", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You summon a giant centipede, spider, or wasp (chosen when you cast the spell). It manifests in an unoccupied space you can see within range and uses the Giant Insect stat block. The form you choose determines certain details in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends. The creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger.",
    "<strong>Using a Higher-Level Spell Slot.</strong> Use the spell slot's level for the spell's level in the stat block."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 4
};

export const graspingVine: SpellEntry = {
  id: "spell-grasping-vine",
  name: "Grasping Vine",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You conjure a vine that sprouts from the ground in an unoccupied space of your choice that you can see within range. When you cast this spell, you can direct the vine to lash out at a creature within 30 feet of it that you can see. That creature must succeed on a Dexterity saving throw or be pulled 20 feet directly toward the vine.",
    "Until the spell ends, you can direct the vine to lash out at the same creature or another one as a Bonus Action on each of your turns."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 4
};

export const gravitySinkhole: SpellEntry = {
  id: "spell-gravity-sinkhole",
  name: "Gravity Sinkhole",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "A 20-foot-radius sphere of crushing force forms at a point you can see within range and tugs at the creatures there. Each creature in the sphere must make a Constitution saving throw. On a failed save, the creature takes <strong>5d10</strong> Force damage, and is pulled in a straight line toward the center of the sphere, ending in an unoccupied space as close to the center as possible, even if that space is in the air. On a successful save, the creature takes half as much damage and isn't pulled.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the damage increases by <strong>1d10</strong> for each slot level above 4th."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const greaterInvisibility: SpellEntry = {
  id: "spell-greater-invisibility",
  name: "Greater Invisibility",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_greater-invisibility", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A creature you touch has the Invisible condition until the spell ends."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const guardianOfFaith: SpellEntry = {
  id: "spell-guardian-of-faith",
  name: "Guardian of Faith",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_guardian-of-faith", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["8 hours"],
  description: [
    "A Large spectral guardian appears and hovers for the duration in an unoccupied space that you can see within range. The guardian occupies that space and is invulnerable, and it appears in a form appropriate for your deity or pantheon. Any enemy that moves to a space within 10 feet of the guardian for the first time on a turn or starts its turn there makes a Dexterity saving throw, taking 20 Radiant damage on a failed save or half as much damage on a successful one. The guardian vanishes when it has dealt a total of 60 damage."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 4
};

export const guardianOfNature: SpellEntry = {
  id: "spell-guardian-of-nature",
  name: "Guardian of Nature",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A nature spirit answers your call and transforms you into a powerful guardian. The transformation lasts until the spell ends. You choose one of the following forms to assume: Primal Beast or Great Tree.",
    "<strong>Primal Beast.</strong> Bestial fur covers your body, your facial features become feral, and you gain the following benefits:",
    "Your walking Speed increases by 10 feet.",
    "You gain Darkvision with a range of 120 feet.",
    "You make Strength-based attack rolls with Advantage.",
    "Your melee weapon attacks deal an extra <strong>1d6</strong> Force damage on a hit.",
    "<strong>Great Tree.</strong> Your skin appears barky, leaves sprout from your hair, and you gain the following benefits:",
    "You gain 10 temporary Hit Points.",
    "You make Constitution saving throws with Advantage.",
    "You make Dexterity- and Wisdom-based attack rolls with Advantage.",
    "While you are on the ground, the ground within 15 feet of you is difficult terrain for your enemies."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 4
};

export const hallucinatoryTerrain: SpellEntry = {
  id: "spell-hallucinatory-terrain",
  name: "Hallucinatory Terrain",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_hallucinatory-terrain", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "300 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a mushroom",
  duration: ["24 hours"],
  description: [
    "You make natural terrain in a 150-foot Cube in range look, sound, and smell like another sort of natural terrain. Thus, open fields or a road can be made to resemble a swamp, hill, crevasse, or some other difficult or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road. Manufactured structures, equipment, and creatures within the area aren't changed. The tactile characteristics of the terrain are unchanged, so creatures entering the area are likely to notice the illusion. If the difference isn't obvious by touch, a creature examining the illusion can take the Study action to make an Intelligence (Investigation) check against your spell save DC to disbelieve it. If a creature discerns that the terrain is illusory, the creature sees a vague image superimposed on the real terrain."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const iceStorm: SpellEntry = {
  id: "spell-ice-storm",
  name: "Ice Storm",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_ice-storm", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "300 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a mitten",
  duration: ["Instantaneous"],
  description: [
    "Hail falls in a 20-foot-radius, 40-foot-high Cylinder centered on a point within range. Each creature in the Cylinder makes a Dexterity saving throw. A creature takes <strong>2d10</strong> Bludgeoning damage and <strong>4d6</strong> Cold damage on a failed save or half as much damage on a successful one. Hailstones turn ground in the Cylinder into Difficult Terrain until the end of your next turn.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The Bludgeoning damage increases by <strong>1d10</strong> for each spell slot level above 4."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D10, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const locateCreature: SpellEntry = {
  id: "spell-locate-creature",
  name: "Locate Creature",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_locate-creature", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "fur from a bloodhound",
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "Describe or name a creature that is familiar to you. You sense the direction to the creature's location if that creature is within 1,000 feet of you. If the creature is moving, you know the direction of its movement. The spell can locate a specific creature known to you or the nearest creature of a specific kind (such as a human or a unicorn) if you have seen such a creature up close—within 30 feet—at least once. If the creature you described or named is in a different form, such as under the effects of a Flesh to Stone or Polymorph spell, this spell doesn't locate the creature. This spell can't locate a creature if any thickness of lead blocks a direct path between you and the creature."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.PALADIN, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const phantasmalKiller: SpellEntry = {
  id: "spell-phantasmal-killer",
  name: "Phantasmal Killer",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_phantasmal-killer", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You tap into the nightmares of a creature you can see within range and create an illusion of its deepest fears, visible only to that creature. The target makes a Wisdom saving throw. On a failed save, the target takes <strong>4d10</strong> Psychic damage and has Disadvantage on ability checks and attack rolls for the duration. On a successful save, the target takes half as much damage, and the spell ends. For the duration, the target makes a Wisdom saving throw at the end of each of its turns. On a failed save, it takes the Psychic damage again. On a successful save, the spell ends.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d10</strong> for each spell slot level above 4."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const polymorph: SpellEntry = {
  id: "spell-polymorph",
  name: "Polymorph",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_polymorph", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a caterpillar cocoon",
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You attempt to transform a creature that you can see within range into a Beast. The target must succeed on a Wisdom saving throw or shape-shift into a Beast form for the duration. That form can be any Beast you choose that has a Challenge Rating equal to or less than the target's (or the target's level if it doesn't have a Challenge Rating). The target's game statistics are replaced by the stat block of the chosen Beast, but the target retains its alignment, personality, creature type, Hit Points, and Hit Point Dice. See the \"Animals\" section of \"Monsters\" for a sample of Beast stat blocks. The target gains a number of Temporary Hit Points equal to the Hit Points of the Beast form. These Temporary Hit Points vanish if any remain when the spell ends. The spell ends early on the target if it has no Temporary Hit Points left. The target is limited in the actions it can perform by the anatomy of its new form, and it can't speak or cast spells. The target's gear melds into the new form. The creature can't use or otherwise benefit from any of that equipment."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const privateSanctum: SpellEntry = {
  id: "spell-private-sanctum",
  name: "Private Sanctum",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_private-sanctum", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a thin sheet of lead",
  duration: ["24 hours"],
  description: [
    "You make an area within range magically secure. The area is a Cube that can be as small as 5 feet to as large as 100 feet on each side. The spell lasts for the duration.",
    "When you cast the spell, you decide what sort of security the spell provides, choosing any of the following properties:",
    { type: "list", style: "bullet", items: ["Sound can't pass through the barrier at the edge of the warded area.", "The barrier of the warded area appears dark and foggy, preventing vision (including Darkvision) through it.", "Sensors created by Divination spells can't appear inside the protected area or pass through the barrier at its perimeter. - Creatures in the area can't be targeted by Divination spells.", "Nothing can teleport into or out of the warded area.", "Planar travel is blocked within the warded area. Casting this spell on the same spot every day for 365 days makes the spell last until dispelled."] },
    "<strong>Using a Higher-Level Spell Slot.</strong> You can increase the size of the Cube by 100 feet for each spell slot level above 4."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const raulothimsPsychicLance: SpellEntry = {
  id: "spell-raulothims-psychic-lance",
  name: "Raulothim's Psychic Lance",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You unleash a shimmering lance of Psychic power from your forehead at a creature that you can see within range. Alternatively, you can utter a creature's name. If the named target is within range, it becomes the spell's target even if you can't see it. If the named target isn't within range, the lance dissipates without effect.",
    "The target must make an Intelligence saving throw. On a failed save, the target takes <strong>7d6</strong> Psychic damage and is Incapacitated until the start of your next turn. On a successful save, the creature takes half as much damage and isn't Incapacitated.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the damage increases by <strong>1d6</strong> for each slot level above 4th."
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
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const resilientSphere: SpellEntry = {
  id: "spell-resilient-sphere",
  name: "Resilient Sphere",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_resilient-sphere", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a glass sphere",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A shimmering sphere encloses a Large or smaller creature or object within range. An unwilling creature must succeed on a Dexterity saving throw or be enclosed for the duration. Nothing—not physical objects, energy, or other spell effects—can pass through the barrier, in or out, though a creature in the sphere can breathe there. The sphere is immune to all damage, and a creature or object inside can't be damaged by attacks or effects originating from outside, nor can a creature inside the sphere damage anything outside it. The sphere is weightless and just large enough to contain the creature or object inside. An enclosed creature can take an action to push against the sphere's walls and thus roll the sphere at up to half the creature's Speed. Similarly, the globe can be picked up and moved by other creatures. A Disintegrate spell targeting the globe destroys it without harming anything inside."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const secretChest: SpellEntry = {
  id: "spell-secret-chest",
  name: "Secret Chest",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_secret-chest", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a chest, 3 feet by 2 feet by 2 feet, constructed from rare materials worth 5,000+ GP, and a Tiny replica of the chest made from the same materials worth 50+ GP",
  duration: ["Until dispelled"],
  description: [
    "You hide a chest and all its contents on the Ethereal Plane. You must touch the chest and the miniature replica that serve as Material components for the spell. The chest can contain up to 12 cubic feet of nonliving material (3 feet by 2 feet by 2 feet). While the chest remains on the Ethereal Plane, you can take a Magic action and touch the replica to recall the chest. It appears in an unoccupied space on the ground within 5 feet of you. You can send the chest back to the Ethereal Plane by taking a Magic action to touch the chest and the replica. After 60 days, there is a cumulative 5 percent chance at the end of each day that the spell ends. The spell also ends if you cast this spell again or if the Tiny replica chest is destroyed. If the spell ends and the larger chest is on the Ethereal Plane, the chest remains there for you or someone else to find."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const shadowOfMoil: SpellEntry = {
  id: "spell-shadow-of-moil",
  name: "Shadow Of Moil",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Flame-like shadows wreathe your body until the spell ends, causing you to become heavily obscured to others. The shadows turn dim light within 10 feet of you into darkness, and bright light in the same area into dim light.",
    "Until the spell ends, you have Resistance to Radiant damage. In addition, whenever a creature within 10 feet of you hits you with an attack, the shadows lash out at that creature, dealing it <strong>2d8</strong> Necrotic damage."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 4
};

export const sickeningRadiance: SpellEntry = {
  id: "spell-sickening-radiance",
  name: "Sickening Radiance",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Dim, greenish light spreads within a 30-foot-radius sphere centered on a point you choose within range. The light spreads around corners, and it lasts until the spell ends.",
    "When a creature moves into the spell's area for the first time on a turn or starts its turn there, that creature must succeed on a Constitution saving throw or take <strong>4d10</strong> Radiant damage, and it suffers one level of Exhaustion and emits a dim, greenish light in a 5-foot radius. This light makes it impossible for the creature to benefit from being Invisible. The light and any levels of Exhaustion caused by this spell go away when the spell ends."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.RADIANT],
    [DICE.D10, DAMAGE_TYPE.RADIANT],
    [DICE.D10, DAMAGE_TYPE.RADIANT],
    [DICE.D10, DAMAGE_TYPE.RADIANT]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const spiritOfDeath: SpellEntry = {
  id: "spell-spirit-of-death",
  name: "Spirit Of Death",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You call forth a spirit that embodies death. The spirit manifests in an unoccupied space you can see within range and uses the Reaper Spirit stat block. The spirit disappears when it is reduced to 0 Hit Points or when the spell ends.",
    "The spirit is an ally to you and your companions. In combat, the spirit shares your Initiative count and takes its turn immediately after yours. It obeys your verbal commands, no action required by you. If you don't issue the spirit any commands, it takes the Dodge action and uses its movement to avoid danger.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, use the higher level wherever the spell's level appears in the Reaper Spirit stat block.",
    "<strong>Reaper Spirit.</strong> Medium Undead, Neutral.",
    "<strong>Armor Class.</strong> 11 + the level of the spell, natural armor.",
    "<strong>Hit Points.</strong> 40 + 10 for each level of the spell above 4th.",
    "<strong>Speed.</strong> 30 ft., fly 30 ft., hover.",
    "<strong>Abilities.</strong> STR 16 (+3), DEX 16 (+3), CON 16 (+3), INT 16 (+3), WIS 16 (+3), CHA 16 (+3).",
    "<strong>Damage Immunities.</strong> Necrotic, Poison.",
    "<strong>Condition Immunities.</strong> Charmed, Exhaustion, Frightened, Paralyzed, Poisoned.",
    "<strong>Senses.</strong> Darkvision 60 ft., passive Perception 13.",
    "<strong>Languages.</strong> Understands the languages you speak.",
    "<strong>Proficiency Bonus.</strong> Equals your bonus.",
    "<strong>Incorporeal Movement.</strong> The reaper can move through other creatures and objects as if they were difficult terrain. If it ends its turn inside an object, it is shunted to the nearest unoccupied space and takes <strong>1d10</strong> Force damage for every 5 feet traveled.",
    "<strong>Multiattack.</strong> The spirit makes a number of Reaping Scythe attacks equal to half the level of the spell, rounded down.",
    "<strong>Reaping Scythe.</strong> Melee Weapon Attack: your spell attack modifier to hit, with Advantage, reach 5 ft., one target. Hit: <strong>1d8</strong> + 3 + the spell's level Necrotic damage.",
    "<strong>Haunt Creature.</strong> The spirit targets a creature it can see within 10 feet of itself and begins haunting it. While the target is haunted, you and the spirit sense the direction and distance to the target if it is on the same plane of existence as you. Additionally, if the target starts its turn within 10 feet of the spirit, the target must succeed on a Wisdom saving throw against your spell save DC or have the Frightened condition until the start of the target's next turn. The target remains haunted until it dies, the spirit disappears, or the spirit uses this action again."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.NECROTIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const staggeringSmite: SpellEntry = {
  id: "spell-staggering-smite",
  name: "Staggering Smite",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "The next time you hit a creature with a melee weapon attack during this spell's duration, your weapon pierces both body and mind, and the attack deals an extra <strong>4d6</strong> Psychic damage to the target. The target must make a Wisdom saving throw. On a failed save, it has Disadvantage on attack rolls and ability checks, and can't take Reactions, until the end of its next turn."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 4
};

export const stoneShape: SpellEntry = {
  id: "spell-stone-shape",
  name: "Stone Shape",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_stone-shape", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "soft clay",
  duration: ["Instantaneous"],
  description: [
    "You touch a stone object of Medium size or smaller or a section of stone no more than 5 feet in any dimension and form it into any shape you like. For example, you could shape a large rock into a weapon, statue, or coffer, or you could make a small passage through a wall that is 5 feet thick. You could also shape a stone door or its frame to seal the door shut. The object you create can have up to two hinges and a latch, but finer mechanical detail isn't possible."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const stoneskin: SpellEntry = {
  id: "spell-stoneskin",
  name: "Stoneskin",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_stoneskin", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "diamond dust worth 100+ GP, which the spell consumes",
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "Until the spell ends, one willing creature you touch has Resistance to Bludgeoning, Piercing, and Slashing damage."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const stormSphere: SpellEntry = {
  id: "spell-storm-sphere",
  name: "Storm Sphere",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A 20-foot-radius sphere of whirling air springs into existence centered on a point you choose within range. The sphere remains for the spell's duration. Each creature in the sphere when it appears or that ends its turn there must succeed on a Strength saving throw or take <strong>2d6</strong> Bludgeoning damage. The sphere's space is difficult terrain.",
    "Until the spell ends, you can use a Bonus Action on each of your turns to cause a bolt of Lightning to leap from the center of the sphere toward one creature you choose within 60 feet of the center. Make a ranged spell attack. You have Advantage on the attack roll if the target is in the sphere. On a hit, the target takes <strong>4d6</strong> Lightning damage.",
    "Creatures within 30 feet of the sphere have Disadvantage on Wisdom (Perception) checks made to listen.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the damage increases for each of its effects by <strong>1d6</strong> for each slot level above 4th."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.STR,
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const summonAberration: SpellEntry = {
  id: "spell-summon-aberration",
  name: "Summon Aberration",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You call forth an aberrant spirit. It manifests in an unoccupied space that you can see within range. This corporeal form uses the Aberrant Spirit stat block. When you cast the spell, choose Beholderkin, Slaad, or Star Spawn. The creature resembles an aberration of that kind, which determines certain traits in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.",
    "The creature is an ally to you and your companions. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands, no action required by you. If you don't issue any, it takes the Dodge action and uses its move to avoid danger.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, use the higher level wherever the spell's level appears on the stat block."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const summonConstruct: SpellEntry = {
  id: "spell-summon-construct",
  name: "Summon Construct",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You call forth the spirit of a Construct. It manifests in an unoccupied space that you can see within range. This corporeal form uses the Construct Spirit stat block. When you cast the spell, choose a material: Clay, Metal, or Stone. The creature resembles a golem or a modron, your choice, made of the chosen material, which determines certain traits in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.",
    "The creature is an ally to you and your companions. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands, no action required by you. If you don't issue any, it takes the Dodge action and uses its move to avoid danger.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, use the higher level wherever the spell's level appears in the stat block."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const summonElemental: SpellEntry = {
  id: "spell-summon-elemental",
  name: "Summon Elemental",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You call forth an elemental spirit. It manifests in an unoccupied space that you can see within range. This corporeal form uses the Elemental Spirit stat block. When you cast the spell, choose an element: Air, Earth, Fire, or Water. The creature resembles a bipedal form wreathed in the chosen element, which determines certain traits in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.",
    "The creature is an ally to you and your companions. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands, no action required by you. If you don't issue any, it takes the Dodge action and uses its move to avoid danger.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, use the higher level wherever the spell's level appears in the stat block."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const summonGreaterDemon: SpellEntry = {
  id: "spell-summon-greater-demon",
  name: "Summon Greater Demon",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You utter foul words, summoning one demon from the chaos of the Abyss. You choose the demon's type, which must be one of Challenge Rating 5 or lower, such as a shadow demon or a barlgura. The demon appears in an unoccupied space you can see within range, and the demon disappears when it drops to 0 Hit Points or when the spell ends.",
    "Roll Initiative for the demon, which has its own turns. When you summon it and on each of your turns thereafter, you can issue a verbal command to it, requiring no action on your part, telling it what it must do on its next turn. If you issue no command, it spends its turn attacking any creature within reach that has attacked it.",
    "At the end of each of the demon's turns, it makes a Charisma saving throw. The demon has Disadvantage on this saving throw if you say its true name. On a failed save, the demon continues to obey you. On a successful save, your control of the demon ends for the rest of the duration, and the demon spends its turns pursuing and attacking the nearest non-demons to the best of its ability. If you stop Concentrating on the spell before it reaches its full duration, an uncontrolled demon doesn't disappear for <strong>1d6</strong> rounds if it still has Hit Points.",
    "As part of casting the spell, you can form a circle on the ground with the blood used as a material component. The circle is large enough to encompass your space. While the spell lasts, the summoned demon can't cross the circle or harm it, and it can't target anyone within it. Using the material component in this manner consumes it when the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the Challenge Rating increases by 1 for each slot level above 4th."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const synchronicity: SpellEntry = {
  id: "spell-synchronicity",
  name: "Synchronicity",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "The creature you touch feels reality subtly shifted to its favor while this spell is in effect. The target isn't inconvenienced by mundane delays of any sort. Traffic lights are always green, there's always a waiting elevator, and a taxi is always around the corner. The target can run at full Speed through dense crowds, and Opportunity Attacks provoked by the target's movement are made with Disadvantage.",
    "Synchronicity grants Advantage to Dexterity (Stealth) checks, since the target always finds a handy piece of cover available. Additionally, the target has Advantage on all ability checks made to drive a vehicle.",
    "In the event that two or more creatures under the effect of Synchronicity are attempting to avoid being inconvenienced by each other, the creatures engage in a contest of Charisma each time the effects of the spells would oppose each other."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const systemBackdoor: SpellEntry = {
  id: "spell-system-backdoor",
  name: "System Backdoor",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "This spell allows you to bypass system security in order to create a secure login on a foreign system. The login you create allows you administrator-level privileges in any computer system not enhanced through technomagic. The login defeats any technomagic spells of 3rd level or lower.",
    "Once the duration of the spell expires, the login and all privileges are wiped from the system. System logs still show the activity of the user, but the user identification cannot be found or traced.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, you are able to bypass technomagic spells if the spell's level is equal to or less than the level of the spell slot you used."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const vitriolicSphere: SpellEntry = {
  id: "spell-vitriolic-sphere",
  name: "Vitriolic Sphere",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_vitriolic-sphere", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a drop of bile",
  duration: ["Instantaneous"],
  description: [
    "You point at a location within range, and a glowing, 1-foot-diameter ball of acid streaks there and explodes in a 20-foot-radius Sphere. Each creature in that area makes a Dexterity saving throw. On a failed save, a creature takes <strong>10d4</strong> Acid damage and another <strong>5d4</strong> Acid damage at the end of its next turn. On a successful save, a creature takes half the initial damage only.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The initial damage increases by <strong>2d4</strong> for each spell slot level above 4."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const wallOfFire: SpellEntry = {
  id: "spell-wall-of-fire",
  name: "Wall of Fire",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_wall-of-fire", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a piece of charcoal",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You create a wall of fire on a solid surface within range. You can make the wall up to 60 feet long, 20 feet high, and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall is opaque and lasts for the duration. When the wall appears, each creature in its area makes a Dexterity saving throw, taking <strong>5d8</strong> Fire damage on a failed save or half as much damage on a successful one. One side of the wall, selected by you when you cast this spell, deals <strong>5d8</strong> Fire damage to each creature that ends its turn within 10 feet of that side or inside the wall. A creature takes the same damage when it enters the wall for the first time on a turn or ends its turn there. The other side of the wall deals no damage.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d8</strong> for each spell slot level above 4."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
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
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const waterySphere: SpellEntry = {
  id: "spell-watery-sphere",
  name: "Watery Sphere",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You conjure up a sphere of water with a 5-foot radius on a point you can see within range. The sphere can hover in the air, but no more than 10 feet off the ground. The sphere remains for the spell's duration.",
    "Any creature in the sphere's space must make a Strength saving throw. On a successful save, a creature is ejected from that space to the nearest unoccupied space outside it. A Huge or larger creature succeeds on the saving throw automatically. On a failed save, a creature is Restrained by the sphere and is engulfed by the water. At the end of each of its turns, a Restrained target can repeat the saving throw.",
    "The sphere can restrain a maximum of four Medium or smaller creatures or one Large creature. If the sphere restrains a creature in excess of these numbers, a random creature that was already Restrained by the sphere falls out of it and lands Prone in a space within 5 feet of it.",
    "As an action, you can move the sphere up to 30 feet in a straight line. If it moves over a pit, cliff, or other drop, it safely descends until it is hovering 10 feet over ground. Any creature Restrained by the sphere moves with it. You can ram the sphere into creatures, forcing them to make the saving throw, but no more than once per turn.",
    "When the spell ends, the sphere falls to the ground and extinguishes all normal flames within 30 feet of it. Any creature Restrained by the sphere is knocked Prone in the space where it falls."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.STR,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const spellEntries4: SpellEntry[] = [
  arcaneEye,
  auraOfLife,
  auraOfPurity,
  banishment,
  blackTentacles,
  blight,
  charmMonster,
  compulsion,
  confusion,
  conjureBarlgura,
  conjureKnowbot,
  conjureMinorElementals,
  conjureShadowDemon,
  conjureWoodlandBeings,
  controlWater,
  deathWard,
  dimensionDoor,
  divination,
  dominateBeast,
  egoWhip,
  elementalBane,
  fabricate,
  faithfulHound,
  findGreaterSteed,
  fireShield,
  freedomOfMovement,
  galdersSpeedyCourier,
  gateSeal,
  giantInsect,
  graspingVine,
  gravitySinkhole,
  greaterInvisibility,
  guardianOfFaith,
  guardianOfNature,
  hallucinatoryTerrain,
  iceStorm,
  locateCreature,
  phantasmalKiller,
  polymorph,
  privateSanctum,
  raulothimsPsychicLance,
  resilientSphere,
  secretChest,
  shadowOfMoil,
  sickeningRadiance,
  spiritOfDeath,
  staggeringSmite,
  stoneShape,
  stoneskin,
  stormSphere,
  summonAberration,
  summonConstruct,
  summonElemental,
  summonGreaterDemon,
  synchronicity,
  systemBackdoor,
  vitriolicSphere,
  wallOfFire,
  waterySphere
];
