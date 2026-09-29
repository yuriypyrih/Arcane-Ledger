import { CLASS_FEATURE, FEAT_CATEGORY, FEATS, TRACKER } from "../../../../codex/entries";
import type { FeatDefinition } from "../types";

// Arcana Unleashed. Only ability-score choices have runtime support.
export const auFeatDefinitions: FeatDefinition[] = [
  {
    feat: FEATS.ABJURATION_ADEPT,
    label: "Abjuration Adept",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 28,
    prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
    requirements: [{ type: "minimum-level", level: 4 }, { type: "spellcasting-or-pact-magic" }],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Additional Spells.</strong> Once you have spell slots of a listed level, the spells at that level and all lower levels on this table are thereafter always prepared.",
      "<strong>Protective Ward.</strong> Casting an Abjuration spell with a spell slot gives you, or one creature you can see within 30 feet, <link:Temporary Hit Points>Temporary Hit Points</link> equal to twice the expended slot level.",
      "<strong>Abjuration Adept Spells.</strong>",
      "<strong>Slot level 1.</strong> Shield.",
      "<strong>Slot level 2.</strong> <spell:Lesser Restoration>Lesser Restoration</spell>.",
      "<strong>Slot level 3.</strong> <spell:Protection from Energy>Protection from Energy</spell>.",
      "<strong>Slot level 4.</strong> <spell:Banishment>Banishment</spell>.",
      "<strong>Slot level 5.</strong> <spell:Mass Cure Wounds>Mass Cure Wounds</spell>."
    ]
  },
  {
    feat: FEATS.ARCANE_ARTIST,
    label: "Arcane Artist",
    category: FEAT_CATEGORY.ORIGIN,
    source: "AU",
    page: 26,
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "<strong>Cantrip.</strong> Learn <spell:Minor Illusion>Minor Illusion</spell>. Choose Intelligence, Wisdom, or Charisma as its spellcasting ability when taking this feat.",
      "<strong>Inspiring Magic.</strong> When you cast an Illusion spell, one ally within 30 feet who can see you may gain Heroic Inspiration. This benefit is usable once per <link:long-rest>Long Rest</link>."
    ]
  },
  {
    feat: FEATS.ARCANE_ELOQUENCE,
    label: "Arcane Eloquence",
    category: FEAT_CATEGORY.ORIGIN,
    source: "AU",
    page: 26,
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "<strong>Cantrip.</strong> Learn <spell:Vicious Mockery>Vicious Mockery</spell>. Choose Intelligence, Wisdom, or Charisma as its spellcasting ability when taking this feat.",
      "<strong>Smooth Talker.</strong> You may add 1d4 to a Charisma check using Deception, Intimidation, or Persuasion."
    ]
  },
  {
    feat: FEATS.ARCANE_INFILTRATOR,
    label: "Arcane Infiltrator",
    category: FEAT_CATEGORY.ORIGIN,
    source: "AU",
    page: 26,
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "<strong>Cantrip.</strong> Learn <spell:Friends>Friends</spell>. Choose Intelligence, Wisdom, or Charisma as its spellcasting ability when taking this feat.",
      "<strong>Cunning Diversion.</strong> You may Dodge as a Bonus Action. You have uses equal to your <link:Proficiency Bonus>Proficiency Bonus</link>, all restored by a <link:long-rest>Long Rest</link>."
    ]
  },
  {
    feat: FEATS.ARCANE_OMENS,
    label: "Arcane Omens",
    category: FEAT_CATEGORY.ORIGIN,
    source: "AU",
    page: 27,
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "<strong>Cantrip.</strong> Learn <spell:Guidance>Guidance</spell>. Choose Intelligence, Wisdom, or Charisma as its spellcasting ability when taking this feat.",
      "<strong>Helpful Premonition.</strong> When you or a creature you can see within 30 feet fails a saving throw, a Reaction lets you add 1d4 to that save, possibly making it succeed. Uses equal your <link:Proficiency Bonus>Proficiency Bonus</link>; a <link:long-rest>Long Rest</link> restores all uses."
    ]
  },
  {
    feat: FEATS.ARCANE_OVERLOAD,
    label: "Arcane Overload",
    category: FEAT_CATEGORY.ORIGIN,
    source: "AU",
    page: 27,
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "<strong>Cantrip.</strong> Learn <spell:Fire Bolt>Fire Bolt</spell>. Choose Intelligence, Wisdom, or Charisma as its spellcasting ability when taking this feat.",
      "<strong>Power Surge.</strong> When you cast an Evocation spell and deal damage with it, you may add your <link:Proficiency Bonus>Proficiency Bonus</link> to one of its damage rolls. This benefit is usable once per <link:long-rest>Long Rest</link>."
    ]
  },
  {
    feat: FEATS.ARCANE_SAFEGUARD,
    label: "Arcane Safeguard",
    category: FEAT_CATEGORY.ORIGIN,
    source: "AU",
    page: 27,
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "<strong>Cantrip.</strong> Learn <spell:Resistance>Resistance</spell>. Choose Intelligence, Wisdom, or Charisma as its spellcasting ability when taking this feat. You may cast this cantrip as a Bonus Action a number of times equal to your <link:Proficiency Bonus>Proficiency Bonus</link>, regaining all uses after a <link:long-rest>Long Rest</link>.",
      "<strong>Sheltering Aid.</strong> When you Help an ally with an ability check, that ally also gains <link:Temporary Hit Points>Temporary Hit Points</link> equal to your <link:Proficiency Bonus>Proficiency Bonus</link>."
    ]
  },
  {
    feat: FEATS.ARCANE_UNDERTAKER,
    label: "Arcane Undertaker",
    category: FEAT_CATEGORY.ORIGIN,
    source: "AU",
    page: 27,
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "<strong>Cantrip.</strong> Learn one Necromancy cantrip from the Cleric or Wizard list. Choose Intelligence, Wisdom, or Charisma as its spellcasting ability when taking this feat.",
      "<strong>Knowledge from the Dead.</strong> You may add 1d4 to Intelligence (History) and Wisdom (Medicine) checks.",
      "<strong>Understanding of Death.</strong> Taking the Help action to stabilize a creature at 0 Hit Points gives you Heroic Inspiration. This benefit is usable once per <link:long-rest>Long Rest</link>."
    ]
  },
  {
    feat: FEATS.ARCANE_WARRIOR,
    label: "Arcane Warrior",
    category: FEAT_CATEGORY.FIGHTING_STYLE,
    source: "AU",
    page: 33,
    prerequisite: "Fighting Style Feature",
    requirements: [{ type: "class-feature", feature: CLASS_FEATURE.FIGHTING_STYLE }],
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "<strong>Cantrips.</strong> Learn two Wizard cantrips; <spell:Mage Hand>Mage Hand</spell> and <spell:Ray of Frost>Ray of Frost</spell> are suggested. When taking this feat, choose Intelligence, Wisdom, or Charisma as their spellcasting ability.",
      "<strong>Spell Change.</strong> Each time you gain a level, you may replace one of these cantrips with a different Wizard cantrip."
    ]
  },
  {
    feat: FEATS.BOON_OF_ERUPTING_SPELLPOWER,
    label: "Boon of Erupting Spellpower",
    category: FEAT_CATEGORY.EPIC_BOON,
    source: "AU",
    page: 33,
    prerequisite: "Level 19+, Spellcasting or Pact Magic Feature",
    requirements: [{ type: "minimum-level", level: 19 }, { type: "spellcasting-or-pact-magic" }],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase Intelligence, Wisdom, or Charisma by 1, to a maximum of 30.",
      "<strong>Spell Overload.</strong> When you cast a damaging spell with a spell slot, you may treat damage dice showing 1 or 2 as 3. Creatures damaged by that spell also become <link:Prone>Prone</link>. After using this benefit, regain it by rolling Initiative or finishing a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>."
    ]
  },
  {
    feat: FEATS.BOON_OF_MAGIC_SCHOOL_MASTERY,
    label: "Boon of Magic School Mastery",
    category: FEAT_CATEGORY.EPIC_BOON,
    source: "AU",
    page: 33,
    prerequisite: "Level 19+, Spellcasting or Pact Magic Feature",
    requirements: [{ type: "minimum-level", level: 19 }, { type: "spellcasting-or-pact-magic" }],
    repeatable: true,
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase Intelligence, Wisdom, or Charisma by 1, to a maximum of 30.",
      "<strong>Mastered School.</strong> Choose Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, or Transmutation. That school grants both benefits below.",
      "<strong>Rote Casting.</strong> Choose a level 1 spell of that school from your class spell list. It is always prepared and you may cast it without spending a slot or using spell components.",
      "<strong>Signature Arcanum.</strong> Choose a spell of that school of level 7 or lower. It is always prepared, and you may cast it without a slot once per <link:long-rest>Long Rest</link>.",
      "<strong>Spell Slots.</strong> Both chosen spells can also be cast with your available slots of an appropriate level.",
      "<strong>Repeatable.</strong> You may take this feat again, choosing a different school each time."
    ]
  },
  {
    feat: FEATS.BOON_OF_THE_IRON_MIND,
    label: "Boon of the Iron Mind",
    category: FEAT_CATEGORY.EPIC_BOON,
    source: "AU",
    page: 33,
    prerequisite: "Level 19+",
    requirements: [{ type: "minimum-level", level: 19 }],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase one ability of your choice by 1, to a maximum of 30.",
      "<strong>Unshakable Focus.</strong> While concentrating on an effect, the only things that end your <link:Concentration>Concentration</link> are casting a spell or activating another effect requiring <link:Concentration>Concentration</link>, becoming <link:Petrified>Petrified</link> or <link:Unconscious>Unconscious</link>, or dying."
    ]
  },
  {
    feat: FEATS.CONJURATION_ADEPT,
    label: "Conjuration Adept",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 28,
    prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
    requirements: [{ type: "minimum-level", level: 4 }, { type: "spellcasting-or-pact-magic" }],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Additional Spells.</strong> Once you have spell slots of a listed level, the spells at that level and all lower levels on this table are thereafter always prepared.",
      "<strong>Persistent Conjuration.</strong> While concentrating on a Conjuration spell, add the modifier of the ability increased by this feat to Constitution saves to maintain that <link:Concentration>Concentration</link>.",
      "<strong>Conjuration Adept Spells.</strong>",
      "<strong>Slot level 1.</strong> <spell:Entangle>Entangle</spell>.",
      "<strong>Slot level 2.</strong> <spell:Misty Step>Misty Step</spell>.",
      "<strong>Slot level 3.</strong> <spell:Conjure Animals>Conjure Animals</spell>.",
      "<strong>Slot level 4.</strong> <spell:Dimension Door>Dimension Door</spell>.",
      "<strong>Slot level 5.</strong> <spell:Conjure Elemental>Conjure Elemental</spell>."
    ]
  },
  {
    feat: FEATS.DIVINATION_ADEPT,
    label: "Divination Adept",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 29,
    prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
    requirements: [{ type: "minimum-level", level: 4 }, { type: "spellcasting-or-pact-magic" }],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Additional Spells.</strong> Once you have spell slots of a listed level, the spells at that level and all lower levels on this table are thereafter always prepared.",
      "<strong>Prescient Intervention.</strong> When a creature you can see within 60 feet makes a D20 Test, you can use a Reaction to give that roll <link:Advantage>Advantage</link> or <link:Disadvantage>Disadvantage</link>. After using this benefit, regain its use by finishing a <link:long-rest>Long Rest</link> or casting a Divination spell with a spell slot.",
      "<strong>Divination Adept Spells.</strong>",
      "<strong>Slot level 1.</strong> <spell:Detect Evil and Good>Detect Evil and Good</spell>.",
      "<strong>Slot level 2.</strong> <spell:Mind Spike>Mind Spike</spell>.",
      "<strong>Slot level 3.</strong> <spell:Clairvoyance>Clairvoyance</spell>.",
      "<strong>Slot level 4.</strong> <spell:Divination>Divination</spell>.",
      "<strong>Slot level 5.</strong> <spell:Scrying>Scrying</spell>."
    ]
  },
  {
    feat: FEATS.ELEMENTAL_FAMILIAR,
    label: "Elemental Familiar",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 29,
    prerequisite: "Level 4+, Familiar Friend",
    requirements: [
      { type: "minimum-level", level: 4 },
      { type: "feat", feat: FEATS.FAMILIAR_FRIEND }
    ],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase one ability of your choice by 1, to a maximum of 20.",
      "<strong>Elemental Energy.</strong> When casting <spell:Find Familiar>Find Familiar</spell>, choose Acid, Cold, Fire, Lightning, or Thunder. The familiar keeps the following benefits for that type until you cast <spell:Find Familiar>Find Familiar</spell> again.",
      "<strong>Elemental Resistance.</strong> The familiar has Resistance to the chosen damage type.",
      "<strong>Energy Pulse.</strong> As a Bonus Action, command your familiar within 120 feet to use its Reaction to release energy in a 5-foot Emanation centered on it. Each creature in that area makes a Dexterity save against DC 8 + your Find Familiar spellcasting ability modifier + your <link:Proficiency Bonus>Proficiency Bonus</link>. A failure deals 2d4 of the chosen damage type and makes a Medium or smaller target <link:Prone>Prone</link>. A success has no effect."
    ]
  },
  {
    feat: FEATS.ENCHANTMENT_ADEPT,
    label: "Enchantment Adept",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 30,
    prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
    requirements: [{ type: "minimum-level", level: 4 }, { type: "spellcasting-or-pact-magic" }],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Additional Spells.</strong> Once you have spell slots of a listed level, the spells at that level and all lower levels on this table are thereafter always prepared.",
      "<strong>Subtle Enchantments.</strong> An Enchantment spell you cast with a spell slot needs no Verbal, Somatic, or Material components, except Material components with a specified cost or ones the spell consumes.",
      "<strong>Enchantment Adept Spells.</strong>",
      "<strong>Slot level 1.</strong> <spell:Dissonant Whispers>Dissonant Whispers</spell>.",
      "<strong>Slot level 2.</strong> <spell:Enthrall>Enthrall</spell>.",
      "<strong>Slot level 3.</strong> <spell:Hold Person>Hold Person</spell>.",
      "<strong>Slot level 4.</strong> <spell:Dominate Beast>Dominate Beast</spell>.",
      "<strong>Slot level 5.</strong> <spell:Modify Memory>Modify Memory</spell>."
    ]
  },
  {
    feat: FEATS.EVOCATION_ADEPT,
    label: "Evocation Adept",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 30,
    prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
    requirements: [{ type: "minimum-level", level: 4 }, { type: "spellcasting-or-pact-magic" }],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Additional Spells.</strong> Once you have spell slots of a listed level, the spells at that level and all lower levels on this table are thereafter always prepared.",
      "<strong>Fueled Evocation.</strong> Once per turn when you cast an Evocation spell and deal damage, you may spend up to two available Hit Dice. Roll them and add their total to one damage roll of that spell.",
      "<strong>Evocation Adept Spells.</strong>",
      "<strong>Slot level 1.</strong> <spell:Chromatic Orb>Chromatic Orb</spell>.",
      "<strong>Slot level 2.</strong> <spell:Shatter>Shatter</spell>.",
      "<strong>Slot level 3.</strong> <spell:Fireball>Fireball</spell>.",
      "<strong>Slot level 4.</strong> <spell:Vitriolic Sphere>Vitriolic Sphere</spell>.",
      "<strong>Slot level 5.</strong> <spell:Wall of Force>Wall of Force</spell>."
    ]
  },
  {
    feat: FEATS.FAMILIAR_FRIEND,
    label: "Familiar Friend",
    category: FEAT_CATEGORY.ORIGIN,
    source: "AU",
    page: 27,
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "<strong>Faithful Companion.</strong> <spell:Find Familiar>Find Familiar</spell> is always prepared. Choose Intelligence, Wisdom, or Charisma as its spellcasting ability when taking this feat. Once per <link:long-rest>Long Rest</link>, you may cast it without a spell slot or Material components. You may also cast it with your available spell slots.",
      "<strong>Fortified Familiar.</strong> Each time you cast <spell:Find Familiar>Find Familiar</spell>, increase the familiar's current and maximum Hit Points by twice your character level.",
      "<strong>Helpful Friend.</strong> When your familiar is within 5 feet of you, you may gain <link:Advantage>Advantage</link> on an ability check using a skill in which you are proficient. Uses equal your <link:Proficiency Bonus>Proficiency Bonus</link>, all restored by a <link:long-rest>Long Rest</link>."
    ]
  },
  {
    feat: FEATS.ILLUSION_ADEPT,
    label: "Illusion Adept",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 30,
    prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
    requirements: [{ type: "minimum-level", level: 4 }, { type: "spellcasting-or-pact-magic" }],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Additional Spells.</strong> Once you have spell slots of a listed level, the spells at that level and all lower levels on this table are thereafter always prepared.",
      "<strong>Masterful Illusions.</strong> An Illusion spell you cast with a spell slot needs no Verbal, Somatic, or Material components, except Material components with a specified cost or ones the spell consumes. Intelligence (Investigation) checks to discern the true nature of your spell-created illusions have <link:Disadvantage>Disadvantage</link>.",
      "<strong>Illusion Adept Spells.</strong>",
      "<strong>Slot level 1.</strong> <spell:Silent Image>Silent Image</spell>.",
      "<strong>Slot level 2.</strong> <spell:Phantasmal Force>Phantasmal Force</spell>.",
      "<strong>Slot level 3.</strong> <spell:Major Image>Major Image</spell>.",
      "<strong>Slot level 4.</strong> <spell:Hallucinatory Terrain>Hallucinatory Terrain</spell>.",
      "<strong>Slot level 5.</strong> <spell:Seeming>Seeming</spell>."
    ]
  },
  {
    feat: FEATS.MAGIC_CONNOISSEUR,
    label: "Magic Connoisseur",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 31,
    prerequisite: "Level 4+, Magic Initiate",
    requirements: [
      { type: "minimum-level", level: 4 },
      { type: "feat", feat: FEATS.MAGIC_INITIATE }
    ],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Additional Spells.</strong> Choose one level 1 spell and one level 2 spell from the list used for your <feat:MAGIC_INITIATE>Magic Initiate</feat> cantrips. Both are always prepared and use the spellcasting ability chosen for Magic Initiate. Each can be cast without a slot once per <link:long-rest>Long Rest</link>, or with your available slots of an appropriate level.",
      "<strong>Spell Change.</strong> Each time you gain a level, you may replace one of these spells with another of the same level from the same list."
    ]
  },
  {
    feat: FEATS.NECROMANCY_ADEPT,
    label: "Necromancy Adept",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 31,
    prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
    requirements: [{ type: "minimum-level", level: 4 }, { type: "spellcasting-or-pact-magic" }],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Additional Spells.</strong> Once you have spell slots of a listed level, the spells at that level and all lower levels on this table are thereafter always prepared.",
      "<strong>Life Manipulation.</strong> Immediately after casting a Necromancy spell with a spell slot, you may spend and roll up to two available Hit Dice. Recover Hit Points equal to their total plus the expended slot level.",
      "<strong>Necromancy Adept Spells.</strong>",
      "<strong>Slot level 1.</strong> <spell:Inflict Wounds>Inflict Wounds</spell>.",
      "<strong>Slot level 2.</strong> <spell:Ray of Enfeeblement>Ray of Enfeeblement</spell>.",
      "<strong>Slot level 3.</strong> <spell:Vampiric Touch>Vampiric Touch</spell>.",
      "<strong>Slot level 4.</strong> <spell:Blight>Blight</spell>.",
      "<strong>Slot level 5.</strong> <spell:Raise Dead>Raise Dead</spell>."
    ]
  },
  {
    feat: FEATS.OTHERWORLDLY_FAMILIAR,
    label: "Otherworldly Familiar",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 31,
    prerequisite: "Level 4+, Familiar Friend",
    requirements: [
      { type: "minimum-level", level: 4 },
      { type: "feat", feat: FEATS.FAMILIAR_FRIEND }
    ],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase one ability of your choice by 1, to a maximum of 20.",
      "<strong>Otherworldly Power.</strong> Casting <spell:Find Familiar>Find Familiar</spell> lets you empower the familiar with the following benefits until you cast that spell again.",
      "<strong>Energy Resistance.</strong> Choose Necrotic, Poison, Psychic, Radiant, or Thunder. The familiar has Resistance to that damage type.",
      "<strong>Phase Walk.</strong> The familiar may move through creatures and objects as Difficult Terrain. Ending its turn inside an object shunts it to the last unoccupied space it occupied."
    ]
  },
  {
    feat: FEATS.PORTAL_JUMPER,
    label: "Portal Jumper",
    category: FEAT_CATEGORY.ORIGIN,
    source: "AU",
    page: 27,
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "<strong>Otherworldly Resilience.</strong> When taking this feat, choose Necrotic, Psychic, or Radiant damage; you have Resistance to it.",
      "<strong>Portal Step.</strong> Spend 15 feet of movement to teleport up to 15 feet to a visible, unoccupied space. This is usable once per turn, with total uses equal to your <link:Proficiency Bonus>Proficiency Bonus</link>. A <link:long-rest>Long Rest</link> restores all uses."
    ]
  },
  {
    feat: FEATS.SOOTHING_FAMILIAR,
    label: "Soothing Familiar",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 31,
    prerequisite: "Level 4+, Familiar Friend",
    requirements: [
      { type: "minimum-level", level: 4 },
      { type: "feat", feat: FEATS.FAMILIAR_FRIEND }
    ],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase one ability of your choice by 1, to a maximum of 20.",
      "<strong>Healing Beacon.</strong> While your familiar is within 120 feet of you, it projects positive energy in a 5-foot Emanation. An ally inside that area who rolls a die to restore a creature's Hit Points may treat a 1 or 2 as a 3."
    ]
  },
  {
    feat: FEATS.SPELL_RESISTANT,
    label: "Spell Resistant",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 31,
    prerequisite: "Level 4+",
    requirements: [{ type: "minimum-level", level: 4 }],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase Dexterity or Constitution by 1, to a maximum of 20.",
      "<strong>Magical Resilience.</strong> When taking this feat, choose Necrotic, Psychic, Radiant, or Thunder damage; you have Resistance to it.",
      "<strong>Magic Resistant.</strong> When you would fail a save against a spell or magical effect, you may add 1d6 to the total, possibly making it succeed. Uses equal your <link:Proficiency Bonus>Proficiency Bonus</link>, all restored by a <link:long-rest>Long Rest</link>."
    ]
  },
  {
    feat: FEATS.SPELL_SUBTERFUGE,
    label: "Spell Subterfuge",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 32,
    prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
    requirements: [{ type: "minimum-level", level: 4 }, { type: "spellcasting-or-pact-magic" }],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Shrouding Spells.</strong> After casting a spell with a casting time of an action using a spell slot, you may use a Bonus Action to both Dash and Hide. Uses equal the modifier of the ability increased by this feat; a <link:long-rest>Long Rest</link> restores all uses.",
      "<strong>Sneaky Casting.</strong> While <link:Invisible>Invisible</link> from the Hide action, casting a spell with a Verbal component or making a spell attack does not end that condition if you finish the turn behind Three-Quarters Cover or Total Cover."
    ]
  },
  {
    feat: FEATS.TRANSMUTATION_ADEPT,
    label: "Transmutation Adept",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 32,
    prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
    requirements: [{ type: "minimum-level", level: 4 }, { type: "spellcasting-or-pact-magic" }],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Additional Spells.</strong> Once you have spell slots of a listed level, the spells at that level and all lower levels on this table are thereafter always prepared.",
      "<strong>Magical Augmentation.</strong> Casting a Transmutation spell with a spell slot on your turn increases your Speed by 5 feet per slot level until that turn ends.",
      "<strong>Transmutation Adept Spells.</strong>",
      "<strong>Slot level 1.</strong> <spell:Jump>Jump</spell>.",
      "<strong>Slot level 2.</strong> <spell:Spider Climb>Spider Climb</spell>.",
      "<strong>Slot level 3.</strong> <spell:Slow>Slow</spell>.",
      "<strong>Slot level 4.</strong> <spell:Polymorph>Polymorph</spell>.",
      "<strong>Slot level 5.</strong> <spell:Animate Objects>Animate Objects</spell>."
    ]
  },
  {
    feat: FEATS.TRANSMUTED_ANATOMY,
    label: "Transmuted Anatomy",
    category: FEAT_CATEGORY.ORIGIN,
    source: "AU",
    page: 28,
    trackingState: TRACKER.NOT_TRACKED,
    description: [
      "<strong>Lengthened Stride.</strong> Increase your Speed by 5 feet.",
      "<strong>Resilient Anatomy.</strong> You have <link:Advantage>Advantage</link> on saves against forced shape-shifting. When you fail a Constitution save, you may use a Reaction to add 1d4, possibly making it succeed. Uses of this Reaction equal your <link:Proficiency Bonus>Proficiency Bonus</link>; a <link:long-rest>Long Rest</link> restores them all."
    ]
  },
  {
    feat: FEATS.WARLIKE_FAMILIAR,
    label: "Warlike Familiar",
    category: FEAT_CATEGORY.GENERAL,
    source: "AU",
    page: 33,
    prerequisite: "Level 4+, Familiar Friend",
    requirements: [
      { type: "minimum-level", level: 4 },
      { type: "feat", feat: FEATS.FAMILIAR_FRIEND }
    ],
    trackingState: TRACKER.SEMI_TRACKED,
    trackingMessage:
      "Only the ability score increase is implemented. All other benefits are reference-only.",
    description: [
      "<strong>Ability Score Increase.</strong> Increase one ability of your choice by 1, to a maximum of 20.",
      "<strong>Battle Familiar.</strong> Battle Familiar (Arcana Unleashed, chapter 2) is always prepared. You may cast it without a slot once per <link:long-rest>Long Rest</link>, or with available slots of an appropriate level. It uses the spellcasting ability chosen for the Faithful Companion benefit of <feat:FAMILIAR_FRIEND>Familiar Friend</feat>.",
      "<strong>Intercept Attack.</strong> When an attack roll hits a creature within 5 feet of your familiar, the familiar may use its Reaction to increase that creature's Armor Class against the triggering attack by your <link:Proficiency Bonus>Proficiency Bonus</link>, possibly making it miss."
    ]
  }
];
