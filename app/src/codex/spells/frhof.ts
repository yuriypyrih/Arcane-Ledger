import {
  ABILITY_TYPES,
  ACTION_TYPE,
  DAMAGE_TYPE,
  DICE,
  DURATION,
  ENTRY_CATEGORIES,
  MAGIC_SCHOOL,
  SPELL_COMPONENT,
  SPELL_LIST_CLASS,
  TRACKER
} from "../entries/enums";
import type { SpellEntry } from "../entries/types";

const FRHOF_SPELL_SOURCE: SpellEntry["source"] = {
  documentKey: "frhof",
  documentName: "Forgotten Realms: Heroes of Faerun",
  ruleset: "5e-2024",
  publisherKey: "wizards-of-the-coast"
};

function createFrhofSpellEntry(
  entry: Omit<SpellEntry, "category" | "source" | "trackingState">
): SpellEntry {
  return {
    ...entry,
    category: ENTRY_CATEGORIES.SPELLS,
    source: FRHOF_SPELL_SOURCE,
    trackingState: TRACKER.NOT_TRACKED
  };
}

export const alustrielsMooncloak = createFrhofSpellEntry({
  id: "spell-alustriels-mooncloak",
  name: "Alustriel's Mooncloak",
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a moonstone worth 50+ GP",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "For the duration, moonlight fills a 20-foot Emanation originating from you with Dim Light. While in that area, you and your allies have Half Cover and Resistance to Cold, Lightning, and Radiant damage.",
    "While the spell lasts, you can use one of the following options, ending the spell immediately:",
    "<strong>Liberation.</strong> When you fail a saving throw to avoid or end the Frightened, Grappled, or Restrained condition, you can take a Reaction to succeed on the save instead.",
    "<strong>Respite.</strong> As a Magic action, you or an ally within the area regains Hit Points equal to <strong>4d10</strong> plus your spellcasting ability modifier."
  ],
  isHealingSpell: true,
  damage: [],
  healing: [DICE.D10, DICE.D10, DICE.D10, DICE.D10, "spellcastingAbility"],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 5
});

export const backlash = createFrhofSpellEntry({
  id: "spell-backlash",
  name: "Backlash",
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.REACTION, "which you take in response to taking damage"],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You ward yourself against destructive energy, reducing the damage taken by <strong>4d6</strong> plus your spellcasting ability modifier.",
    "If the triggering damage was from a creature within range, you can force the creature to make a Constitution saving throw. The creature takes <strong>4d6</strong> Force damage on a failed save or half as much damage on a successful one.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage reduction and Force damage from this spell both increase by <strong>1d6</strong> for every spell slot level above 4."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 4
});

export const cacophonicShield = createFrhofSpellEntry({
  id: "spell-cacophonic-shield",
  name: "Cacophonic Shield",
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Thunderous reverberations fill a 10-foot Emanation originating from you for the duration. Whenever the Emanation enters a creature's space and whenever a creature enters the Emanation or ends its turn there, the creature makes a Constitution saving throw. On a failed save, the creature takes <strong>3d6</strong> Thunder damage and has the Deafened condition until the start of your next turn. On a successful save, the creature takes half as much damage only. A creature makes this save only once per turn. When you cast this spell, you can designate creatures to be unaffected by it.",
    "In addition, you have Resistance to Thunder damage, and ranged attack rolls against you are made with Disadvantage.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d6</strong> for each spell slot level above 3."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.THUNDER],
    [DICE.D6, DAMAGE_TYPE.THUNDER],
    [DICE.D6, DAMAGE_TYPE.THUNDER]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
});

export const conjureConstructs = createFrhofSpellEntry({
  id: "spell-conjure-constructs",
  name: "Conjure Constructs",
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a brass cog",
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You conjure a group of intangible, orderly spirits that appear as a Medium group of modrons or other Constructs in an unoccupied space you can see within range. The spirits last for the duration. When you cast this spell and as a Magic action on subsequent turns, you can command the spirits to target one creature or object you can see within 5 feet of the spirits and create one of the following effects:",
    "<strong>Clockwork Force.</strong> The target makes a Dexterity saving throw, taking <strong>3d6</strong> Force damage on a failed save or half as much damage on a successful one.",
    "<strong>Orderly Ward.</strong> The target gains Temporary Hit Points equal to <strong>1d6</strong> plus your spellcasting ability modifier.",
    "When you move on your turn, you can also move the spirits up to 30 feet to an unoccupied space you can see.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage and Temporary Hit Points both increase by <strong>1d6</strong> for each spell slot level above 3."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
});

export const deathArmor = createFrhofSpellEntry({
  id: "spell-death-armor",
  name: "Death Armor",
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "an onyx worth 50+ GP, which the spell consumes",
  duration: ["1 hour"],
  description: [
    "For the duration, an inky aura surrounds one creature you touch. The target has Advantage on Death Saving Throws, and once per turn, when a creature within 5 feet of the target hits it with a melee attack roll, the attacker takes <strong>2d4</strong> Necrotic damage."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D4, DAMAGE_TYPE.NECROTIC],
    [DICE.D4, DAMAGE_TYPE.NECROTIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
});

export const deryansHelpfulHomunculi = createFrhofSpellEntry({
  id: "spell-deryans-helpful-homunculi",
  name: "Deryan's Helpful Homunculi",
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified:
    "powdered gemstones worth 100+ GP, which the spell consumes, and one set of Artisan's Tools with which you have proficiency",
  duration: ["8 hours"],
  description: [
    "You summon a group of helpful spirits, which lasts for the duration. The spirits appear as homunculi or as another Construct of your choice but are intangible and invulnerable, and they are considered to have proficiency in the Arcana skill and with the set of Artisan's Tools used in the spell's casting.",
    "If you are crafting an item, the spirits function as a single assistant for your crafting, halving the crafting time."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2,
  ritual: true
});

export const dirge = createFrhofSpellEntry({
  id: "spell-dirge",
  name: "Dirge",
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Deathly power fills a 60-foot Emanation originating from you for the duration.",
    "When you cast this spell, you can designate creatures to be unaffected by it. Any other creature can't regain Hit Points while in the Emanation. Whenever the Emanation enters a creature's space and whenever a creature enters the Emanation or ends its turn there, the creature makes a Constitution saving throw. On a failed save, the creature takes <strong>3d10</strong> Necrotic damage and has the Prone condition. On a successful save, the creature takes half as much damage and its Speed is halved. A creature makes this save only once per turn.",
    "<strong>Casting as a Circle Spell.</strong> Casting this as a Circle spell requires a minimum of two secondary casters. If the spell is cast as a Circle spell, its duration becomes Concentration, up to 10 minutes.",
    "A creature that fails its save against the spell's effect also gains 1 Exhaustion level. While the creature has Exhaustion levels, finishing a Long Rest neither restores lost Hit Points nor reduces the creature's Exhaustion level.",
    "When the spell is cast, each secondary caster must expend a level 4+ spell slot; otherwise, the spell fails."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC],
  spellLevel: 6
});

export const doomtide = createFrhofSpellEntry({
  id: "spell-doomtide",
  name: "Doomtide",
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "soot and a dried eel",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You create a 20-foot-radius Sphere of inky fog within range. The fog is magical Darkness and lasts for the duration or until a strong wind disperses it, ending the spell.",
    "Each creature in the Sphere when it appears makes a Wisdom saving throw. On a failed save, a creature takes <strong>5d6</strong> Psychic damage and subtracts <strong>1d6</strong> from its saving throws until the end of its next turn. On a successful save, a creature takes half as much damage only. A creature also makes this save when the Sphere moves into its space, when it enters the Sphere, or when it ends its turn inside the Sphere. A creature makes this save only once per turn.",
    "The Sphere moves 10 feet away from you at the start of each of your turns.",
    "<strong>Casting as a Circle Spell.</strong> Casting this as a Circle spell requires a minimum of five secondary casters. In addition to the spell's usual components, you must provide a special component, a string of three black pearls from Pandemonium, which the spell consumes. The spell's range increases to 1 mile, and its duration increases to until dispelled, no Concentration required. The spell ends early if any caster who participated in this casting contributes to another casting of Doomtide as a Circle spell.",
    "When the spell is cast, each secondary caster must expend a level 3+ spell slot; otherwise, the spell fails."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 4
});

export const elminstersEffulgentSpheres = createFrhofSpellEntry({
  id: "spell-elminsters-effulgent-spheres",
  name: "Elminster's Effulgent Spheres",
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "an opal worth 1,000+ GP",
  duration: ["1 hour"],
  description: [
    "Six chromatic spheres orbit you for the duration.",
    "While the spheres are present, you can expend spheres to create the following effects:",
    "<strong>Absorb Energy.</strong> When you take Acid, Cold, Fire, Lightning, or Thunder damage, you can take a Reaction to expend one sphere and give yourself Resistance to the triggering damage type until the start of your next turn.",
    "<strong>Energy Blast.</strong> As a Bonus Action, you send one sphere hurtling toward a target within 120 feet of yourself. Make a ranged spell attack. On a hit, the target takes <strong>3d6</strong> Acid, Cold, Fire, Lightning, or Thunder damage (your choice). Regardless of whether you hit, the sphere is expended.",
    "The spell ends early if you have no more spheres remaining.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The number of spheres increases by 1 for every spell slot level above 6."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [
      DICE.D6,
      [
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.COLD,
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.THUNDER
      ]
    ],
    [
      DICE.D6,
      [
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.COLD,
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.THUNDER
      ]
    ],
    [
      DICE.D6,
      [
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.COLD,
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.THUNDER
      ]
    ]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 6
});

export const elminstersElusion = createFrhofSpellEntry({
  id: "spell-elminsters-elusion",
  name: "Elminster's Elusion",
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Arcane wards protect you against magic for the duration. You have Advantage on saving throws against spells and magical effects. Additionally, if you succeed on a saving throw against a spell or magical effect and would normally take half as much damage, you instead take no damage."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
});

export const holyStarOfMystra = createFrhofSpellEntry({
  id: "spell-holy-star-of-mystra",
  name: "Holy Star of Mystra",
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You create a glowing mote of energy that hovers above you for the duration. The mote sheds Bright Light in a 5-foot radius and Dim Light for an additional 5 feet.",
    "When you cast this spell and as a Bonus Action on later turns, you can unleash a shining bolt from the mote, targeting one creature within 120 feet of yourself. Make a ranged spell attack. On a hit, the target takes Force or Radiant damage (your choice) equal to <strong>4d10</strong> plus your spellcasting ability modifier.",
    "In addition, while the mote is present, you have Three-Quarters Cover, and if you succeed on a saving throw against a spell of level 7 or lower that targeted only you and didn't create an area of effect, you can take a Reaction to deflect that spell back at the spell's caster; the caster makes a saving throw against that spell using that caster's own spell save DC."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.RADIANT]],
    [DICE.D10, [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.RADIANT]],
    [DICE.D10, [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.RADIANT]],
    [DICE.D10, [DAMAGE_TYPE.FORCE, DAMAGE_TYPE.RADIANT]]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 8
});

export const laeralsSilverLance = createFrhofSpellEntry({
  id: "spell-laerals-silver-lance",
  name: "Laeral's Silver Lance",
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a silver pin worth 250+ GP",
  duration: ["Instantaneous"],
  description: [
    "Silver energy bursts out from you in a 120-foot-long, 5-foot-wide Line. Each creature of your choice in the Line makes a Strength saving throw. On a failed save, a creature takes <strong>3d10</strong> Force damage and has the Prone condition. On a successful save, a creature takes half as much damage only.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d10</strong> for every spell slot level above 3."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.STR,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
});

export const simbulsSynostodweomer = createFrhofSpellEntry({
  id: "spell-simbuls-synostodweomer",
  name: "Simbul's Synostodweomer",
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 hour"],
  description: [
    "You imbue one creature you touch with magical healing energy for the duration. Whenever the target casts a spell using a spell slot, the target can immediately roll a number of unexpended Hit Point Dice equal to the spell slot's level and regain Hit Points equal to the roll's total plus your spellcasting ability modifier; those dice are then expended."
  ],
  isHealingSpell: true,
  damage: [],
  healing: { label: "Hit Point Dice equal to slot level + spellcasting ability modifier" },
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 7
});

export const songalsElementalSuffusion = createFrhofSpellEntry({
  id: "spell-songals-elemental-suffusion",
  name: "Songal's Elemental Suffusion",
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a pearl worth 100+ GP",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You imbue yourself with the elemental power of genies. You gain the following benefits until the spell ends:",
    "<strong>Elemental Immunity.</strong> When you cast this spell, choose one of the following damage types: Acid, Cold, Fire, Lightning, or Thunder. You have Resistance to the chosen damage type.",
    "<strong>Elemental Pulse.</strong> When you cast this spell and at the start of each of your subsequent turns, you release a burst of elemental energy in a 15-foot Emanation originating from yourself. Each creature of your choice in that area makes a Dexterity saving throw. On a failed save, a creature takes <strong>2d6</strong> Acid, Cold, Fire, Lightning, or Thunder damage (your choice) and has the Prone condition. On a successful save, a creature takes half as much damage only.",
    "<strong>Flight.</strong> You gain a Fly Speed of 30 feet and can hover.",
    "<strong>Casting as a Circle Spell.</strong> If the spell is cast as a Circle spell, its casting time increases to 1 minute, and its duration increases to Concentration, up to 10 minutes. For each secondary caster who participates in the casting, you can choose one additional creature, to a maximum of nine additional creatures. The chosen creatures also gain the benefits of the spell for its duration.",
    "When the spell is cast, each secondary caster must expend a level 2+ spell slot; otherwise, the spell fails."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [
      DICE.D6,
      [
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.COLD,
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.THUNDER
      ]
    ],
    [
      DICE.D6,
      [
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.COLD,
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.THUNDER
      ]
    ]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 5
});

export const spellfireFlare = createFrhofSpellEntry({
  id: "spell-spellfire-flare",
  name: "Spellfire Flare",
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You unleash a blast of brilliant fire. Make a ranged spell attack against a target within range; a target gains no benefit from Half Cover or Three-Quarters Cover for this attack roll. On a hit, the target takes <strong>2d10</strong> Radiant damage.",
    "<strong>Using a Higher-Level Spell Slot.</strong> You create an additional blast for each spell slot level above 1. You can direct the blasts at the same target or at different ones. Make a separate attack roll for each blast."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.RADIANT],
    [DICE.D10, DAMAGE_TYPE.RADIANT]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
});

export const spellfireStorm = createFrhofSpellEntry({
  id: "spell-spellfire-storm",
  name: "Spellfire Storm",
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You conjure a pillar of spellfire in a 20-foot-radius, 20-foot-high Cylinder centered on a point within range. The area of the Cylinder is Bright Light, and each creature in it when it appears makes a Constitution saving throw, taking <strong>4d10</strong> Radiant damage on a failed save or half as much damage on a successful one. A creature also makes this save when it enters the spell's area for the first time on a turn or ends its turn there. A creature makes this save only once per turn.",
    "In addition, whenever a creature in the Cylinder casts a spell, that creature makes a Constitution saving throw. On a failed save, the spell dissipates with no effect, and the action, Bonus Action, or Reaction used to cast it is wasted. If that spell was cast with a spell slot, the slot isn't expended.",
    "When you cast this spell, you can designate creatures to be unaffected by it.",
    "<strong>Casting as a Circle Spell.</strong> In addition to the spell's usual components, you must provide a special component, a blue star sapphire worth 25,000+ GP, which the spell consumes. The spell's range increases to 1 mile, and it no longer requires Concentration. When the spell is cast, each secondary caster must expend a level 3+ spell slot; otherwise, the spell fails.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d10</strong> for every spell slot level above 4.",
    "The number of secondary casters determines the spell's area of effect and duration, as shown in the table below. The spell ends early if any caster who participated in this casting contributes to another casting of Spellfire Storm as a Circle spell.",
    "| Secondary Casters | Area of Effect | Duration | |---|---|---| | 1-3 | 40-foot-radius, 40-foot-high Cylinder | 1 hour | | 4-6 | 60-foot-radius, 60-foot-high Cylinder | 8 hours | | 7+ | 100-foot-radius, 100-foot-high Cylinder | 24 hours |"
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
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
});

export const sylunesViper = createFrhofSpellEntry({
  id: "spell-sylunes-viper",
  name: "Syluné's Viper",
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a snake fang",
  duration: ["1 hour"],
  description: [
    "A shimmering, spectral snake encircles your body for the duration. You gain 15 Temporary Hit Points; the spell ends early if you have no Temporary Hit Points left.",
    "While the spell is active, you gain the following benefits:",
    "<strong>Climbing.</strong> You gain a Climb Speed equal to your Speed.",
    "<strong>Venomous Bite.</strong> As a Magic action, you can make a ranged spell attack using the snake against one creature within 50 feet. On a hit, the target takes <strong>1d6</strong> Force damage and has the Poisoned condition until the start of your next turn. While Poisoned, the target has the Incapacitated condition.",
    "<strong>Using a Higher-Level Spell Slot.</strong> For each spell slot level above 3, the number of Temporary Hit Points you gain from this spell increases by 5, and the damage of Venomous Bite increases by <strong>1d6</strong>."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [[DICE.D6, DAMAGE_TYPE.FORCE]],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
});

export const wardaway = createFrhofSpellEntry({
  id: "spell-wardaway",
  name: "Wardaway",
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a miniature clay hand",
  duration: ["Instantaneous"],
  description: [
    "You hurl a disorienting magical force toward one creature within range. The target makes a Constitution saving throw; Constructs and Undead automatically succeed on this save.",
    "On a failed save, the target takes <strong>2d4</strong> Force damage, its Speed is halved until the start of your next turn, and on its next turn, it can take only an action or a Bonus Action, but not both. On a successful save, the target takes half as much damage only.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>2d4</strong> for every spell slot level above 1."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D4, DAMAGE_TYPE.FORCE],
    [DICE.D4, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
});

export const frhofSpellEntries: SpellEntry[] = [
  spellfireFlare,
  wardaway,
  deathArmor,
  deryansHelpfulHomunculi,
  elminstersElusion,
  cacophonicShield,
  conjureConstructs,
  laeralsSilverLance,
  sylunesViper,
  backlash,
  doomtide,
  spellfireStorm,
  alustrielsMooncloak,
  songalsElementalSuffusion,
  dirge,
  elminstersEffulgentSpheres,
  simbulsSynostodweomer,
  holyStarOfMystra
];
