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

export const absorbElements: SpellEntry = {
  id: "spell-absorb-elements",
  name: "Absorb Elements",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.REACTION, "which you take when you take acid, cold, fire, lightning, or thunder damage"],
  range: "Self",
  components: [SPELL_COMPONENT.S],
  duration: ["1 round"],
  description: [
    "The spell captures some of the incoming energy, lessening its effect on you and storing it for your next melee attack. You have Resistance to the triggering damage type until the start of your next turn. Also, the first time you hit with a melee attack on your next turn, the target takes an extra <strong>1d6</strong> damage of the triggering type, and the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the extra damage increases by <strong>1d6</strong> for each slot level above 1st."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D6, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.THUNDER]]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const acidStream: SpellEntry = {
  id: "spell-acid-stream",
  name: "Acid Stream",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot line)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A stream of acid emanates from you in a line 30 feet long and 5 feet wide in a direction you choose. Each creature in the line must succeed on a Dexterity saving throw or be covered in acid for the spell's duration or until a creature uses its action to scrape or wash the acid off itself or another creature. A creature covered in the acid takes <strong>3d4</strong> Acid damage at the start of each of its turns.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by <strong>1d4</strong> for each slot level above 1st."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const alarm: SpellEntry = {
  id: "spell-alarm",
  name: "Alarm",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_alarm", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a bell and silver wire",
  duration: ["8 hours"],
  description: [
    "You set an alarm against intrusion. Choose a door, a window, or an area within range that is no larger than a 20-foot Cube. Until the spell ends, an alarm alerts you whenever a creature touches or enters the warded area. When you cast the spell, you can designate creatures that won't set off the alarm. You also choose whether the alarm is audible or mental:"
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1,
  ritual: true
};

export const animalFriendship: SpellEntry = {
  id: "spell-animal-friendship",
  name: "Animal Friendship",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_animal-friendship", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a morsel of food",
  duration: ["24 hours"],
  description: [
    "Target a Beast that you can see within range. The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration. If you or one of your allies deals damage to the target, the spells ends.",
    "<strong>Using a Higher-Level Spell Slot.</strong> You can target one additional Beast for each spell slot level above 1."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const arcaneWeapon: SpellEntry = {
  id: "spell-arcane-weapon",
  name: "Arcane Weapon",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You channel arcane energy into one Simple or Martial weapon you're holding, and choose one damage type: Acid, Cold, Fire, Lightning, Poison, or Thunder. Until the spell ends, you deal an extra <strong>1d6</strong> damage of the chosen type to any target you hit with the weapon. If the weapon isn't magical, it becomes a magic weapon for the spell's duration.",
    "As a Bonus Action, you can change the damage type, choosing from the options above.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, you can maintain your Concentration on the spell for up to 8 hours."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D6, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.POISON, DAMAGE_TYPE.THUNDER]]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER],
  spellLevel: 1
};

export const armorOfAgathys: SpellEntry = {
  id: "spell-armor-of-agathys",
  name: "Armor of Agathys",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  description: [
    "A protective magical force surrounds you, manifesting as a spectral frost that covers you and your gear. You gain 5 Temporary Hit Points for the duration. If a creature hits you with a melee attack while you have these Hit Points, the creature takes 5 Cold damage.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, both the Temporary Hit Points and the Cold damage increase by 5 for each slot."
  ],
  isDamagingSpell: true,
  damage: [
    [5, DAMAGE_TYPE.COLD]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 1
};

export const armsOfHadar: SpellEntry = {
  id: "spell-arms-of-hadar",
  name: "Arms of Hadar",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (10-foot radius)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You invoke the power of Hadar, the Dark Hunger. Tendrils of dark energy erupt from you and batter all creatures within 10 feet of you. Each creature in that area must make a Strength saving throw. On a failed save, a target takes <strong>2d6</strong> Necrotic damage and can't take reactions until its next turn. On a successful save, the creature takes half damage, but suffers no other effect.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by <strong>1d6</strong> for each slot level above 1st."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.STR,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 1
};

export const bane: SpellEntry = {
  id: "spell-bane",
  name: "Bane",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_bane", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a drop of blood",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Up to three creatures of your choice that you can see within range must each make a Charisma saving throw. Whenever a target that fails this save makes an attack roll or a saving throw before the spell ends, the target must subtract <strong>1d4</strong> from the attack roll or save.",
    "<strong>Using a Higher-Level Spell Slot.</strong> You can target one additional creature for each spell slot level above 1."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CHA,
  isAttackSpell: true,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 1
};

export const beastBond: SpellEntry = {
  id: "spell-beast-bond",
  name: "Beast Bond",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You establish a telepathic link with one Beast you touch that is friendly to you or Charmed by you. The spell fails if the Beast's Intelligence is 4 or higher. Until the spell ends, the link is active while you and the Beast are within line of sight of each other. Through the link, the Beast can understand your telepathic messages to it, and it can telepathically communicate simple emotions and concepts back to you. While the link is active, the Beast gains Advantage on attack rolls against any creature within 5 feet of you that you can see."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const bless: SpellEntry = {
  id: "spell-bless",
  name: "Bless",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_bless", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a Holy Symbol worth 5+ GP",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You bless up to three creatures within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target adds <strong>1d4</strong> to the attack roll or save.",
    "<strong>Using a Higher-Level Spell Slot.</strong> You can target one additional creature for each spell slot level above 1."
  ],
  isAttackSpell: true,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const burningHands: SpellEntry = {
  id: "spell-burning-hands",
  name: "Burning Hands",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_burning-hands", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "A thin sheet of flames shoots forth from you. Each creature in a 15-foot Cone makes a Dexterity saving throw, taking <strong>3d6</strong> Fire damage on a failed save or half as much damage on a successful one. Flammable objects in the Cone that aren't being worn or carried start burning.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d6</strong> for each spell slot level above 1."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const catapult: SpellEntry = {
  id: "spell-catapult",
  name: "Catapult",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "Choose one object weighing 1 to 5 pounds within range that isn't being worn or carried. The object flies in a straight line up to 90 feet in a direction you choose before falling to the ground, stopping early if it impacts against a solid surface. If the object would strike a creature, that creature must make a Dexterity saving throw. On a failed save, the object strikes the target and stops moving. When the object strikes something, the object and what it strikes each take <strong>3d8</strong> Bludgeoning damage.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the maximum weight of objects that you can target with this spell increases by 5 pounds, and the damage increases by <strong>1d8</strong>, for each slot level above 1st."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const causeFear: SpellEntry = {
  id: "spell-cause-fear",
  name: "Cause Fear",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You awaken the sense of mortality in one creature you can see within range. A construct or an Undead is immune to this effect. The target must succeed on a Wisdom saving throw or become Frightened of you until the spell ends. The Frightened target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st. The creatures must be within 30 feet of each other when you target them."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const ceremony: SpellEntry = {
  id: "spell-ceremony",
  name: "Ceremony",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.HOUR],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous (see below)"],
  description: [
    "You perform one of several religious ceremonies. When you cast the spell, choose one of the following ceremonies, the target of which must be within 10 feet of you throughout the casting.",
    "Atonement. You touch one willing creature whose alignment has changed, and you make a DC 20 Wisdom (Insight) check. On a successful check, you restore the target to its original alignment.",
    "Bless Water. You touch one vial of water and cause it to become holy water.",
    "Coming of Age. You touch one Humanoid who is a young adult. For the next 24 hours, whenever the target makes an ability check, it can roll a <strong>d4</strong> and add the number rolled to the ability check. A creature can benefit from this rite only once.",
    "Dedication. You touch one Humanoid who wishes to be dedicated to your god's service. For the next 24 hours, whenever the target makes a saving throw, it can roll a <strong>d4</strong> and add the number rolled to the save. A creature can benefit from this rite only once.",
    "Funeral Rite. You touch one corpse, and for the next 7 days, the target can't become Undead by any means short of a Wish spell.",
    "Wedding. You touch adult Humanoids willing to be bonded together in marriage. For the next 7 days, each target gains a +2 bonus to AC while they are within 30 feet of each other. A creature can benefit from this rite again only if widowed."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1,
  ritual: true
};

export const chaosBolt: SpellEntry = {
  id: "spell-chaos-bolt",
  name: "Chaos Bolt",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You hurl an undulating, warbling mass of chaotic energy at one creature in range. Make a ranged spell attack against the target. On a hit, the target takes <strong>2d8</strong> + <strong>1d6</strong> damage. Choose one of the <strong>d8s</strong>. The number rolled on that die determines the attack's damage type as follows: 1 Acid, 2 Cold, 3 Fire, 4 Force, 5 Lightning, 6 Poison, 7 Psychic, 8 Thunder.",
    "If you roll the same number on both <strong>d8s</strong>, the chaotic energy leaps from the target to a different creature of your choice within 30 feet of it. Make a new attack roll against the new target, and make a new damage roll, which could cause the chaotic energy to leap again.",
    "A creature can be targeted only once by each casting of this spell.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, each target takes <strong>1d6</strong> extra damage of the type rolled for each slot level above 1st."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.FORCE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.POISON, DAMAGE_TYPE.PSYCHIC, DAMAGE_TYPE.THUNDER]],
    [DICE.D8, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.FORCE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.POISON, DAMAGE_TYPE.PSYCHIC, DAMAGE_TYPE.THUNDER]],
    [DICE.D6, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.FORCE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.POISON, DAMAGE_TYPE.PSYCHIC, DAMAGE_TYPE.THUNDER]]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER],
  spellLevel: 1
};

export const charmPerson: SpellEntry = {
  id: "spell-charm-person",
  name: "Charm Person",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_charm-person", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 hour"],
  description: [
    "One Humanoid you can see within range makes a Wisdom saving throw. It does so with Advantage if you or your allies are fighting it. On a failed save, the target has the Charmed condition until the spell ends or until you or your allies damage it. The Charmed creature is Friendly to you. When the spell ends, the target knows it was Charmed by you.",
    "<strong>Using a Higher-Level Spell Slot.</strong> You can target one additional creature for each spell slot level above 1."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const chromaticOrb: SpellEntry = {
  id: "spell-chromatic-orb",
  name: "Chromatic Orb",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_chromatic-orb", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a diamond worth 50+ GP",
  duration: ["Instantaneous"],
  description: [
    "You hurl an orb of energy at a target within range. Choose Acid, Cold, Fire, Lightning, Poison, or Thunder for the type of orb you create, and then make a ranged spell attack against the target. On a hit, the target takes <strong>3d8</strong> damage of the chosen type. If you roll the same number on two or more of the d8s, the orb leaps to a different target of your choice within 30 feet of the target. Make an attack roll against the new target, and make a new damage roll. The orb can't leap again unless you cast the spell with a level 2+ spell slot.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d8</strong> for each spell slot level above 1. The orb can leap a maximum number of times equal to the level of the slot expended, and a creature can be targeted only once by each casting of this spell."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.POISON, DAMAGE_TYPE.THUNDER]],
    [DICE.D8, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.POISON, DAMAGE_TYPE.THUNDER]],
    [DICE.D8, [DAMAGE_TYPE.ACID, DAMAGE_TYPE.COLD, DAMAGE_TYPE.FIRE, DAMAGE_TYPE.LIGHTNING, DAMAGE_TYPE.POISON, DAMAGE_TYPE.THUNDER]]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const colorSpray: SpellEntry = {
  id: "spell-color-spray",
  name: "Color Spray",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_color-spray", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a pinch of colorful sand",
  duration: ["Instantaneous"],
  description: [
    "You launch a dazzling array of flashing, colorful light. Each creature in a 15-foot Cone originating from you must succeed on a Constitution saving throw or have the Blinded condition until the end of your next turn."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const command: SpellEntry = {
  id: "spell-command",
  name: "Command",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_command", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw or follow the command on its next turn. Choose the command from these options:",
    { type: "list", style: "bullet", items: ["<strong>Drop.</strong> The target drops whatever it is holding and then ends its turn.", "<strong>Flee.</strong> The target spends its turn moving away from you by the fastest available means.", "<strong>Grovel.</strong> The target has the Prone condition and then ends its turn.", "<strong>Halt.</strong> On its turn, the target doesn't move and takes no action or Bonus Action."] },
    "<strong>Using a Higher-Level Spell Slot.</strong> You can affect one additional creature for each spell slot level above 1."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const compelledDuel: SpellEntry = {
  id: "spell-compelled-duel",
  name: "Compelled Duel",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You attempt to compel a creature into a duel. One creature that you can see within range must make a Wisdom saving throw. On a failed save, the creature is drawn to you, compelled by your divine demand. For the duration, it has Disadvantage on attack rolls against creatures other than you, and must make a Wisdom saving throw each time it attempts to move to a space that is more than 30 feet away from you; if it succeeds on this saving throw, this spell doesn't restrict the target's movement for that turn.",
    "The spell ends if you attack any other creature, if you cast a spell that targets a hostile creature other than the target, if a creature friendly to you damages the target or casts a harmful spell on it, or if you end your turn more than 30 feet away from the target."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const comprehendLanguages: SpellEntry = {
  id: "spell-comprehend-languages",
  name: "Comprehend Languages",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_comprehend-languages", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a pinch of soot and salt",
  duration: ["1 hour"],
  description: [
    "For the duration, you understand the literal meaning of any language that you hear or see signed. You also understand any written language that you see, but you must be touching the surface on which the words are written. It takes about 1 minute to read one page of text. This spell doesn't decode symbols or secret messages."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1,
  ritual: true
};

export const createOrDestroyWater: SpellEntry = {
  id: "spell-create-or-destroy-water",
  name: "Create or Destroy Water",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_create-or-destroy-water", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a mix of water and sand",
  duration: ["Instantaneous"],
  description: [
    "You do one of the following:",
    "<strong>Using a Higher-Level Spell Slot.</strong> You create or destroy 10 additional gallons of water, or the size of the Cube increases by 5 feet, for each spell slot level above 1."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 1
};

export const cureWounds: SpellEntry = {
  id: "spell-cure-wounds",
  name: "Cure Wounds",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_cure-wounds", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "A creature you touch regains a number of Hit Points equal to <strong>2d8</strong> plus your spellcasting ability modifier.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The healing increases by <strong>2d8</strong> for each spell slot level above 1."
  ],
  isHealingSpell: true,
  damage: [],
  healing: [DICE.D8, DICE.D8, "spellcastingAbility"],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.PALADIN, SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const detectEvilAndGood: SpellEntry = {
  id: "spell-detect-evil-and-good",
  name: "Detect Evil and Good",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_detect-evil-and-good", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "For the duration, you sense the location of any Aberration, Celestial, Elemental, Fey, Fiend, or Undead within 30 feet of yourself. You also sense whether the Hallow spell is active there and, if so, where. The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const detectMagic: SpellEntry = {
  id: "spell-detect-magic",
  name: "Detect Magic",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_detect-magic", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "For the duration, you sense the presence of magical effects within 30 feet of yourself. If you sense such effects, you can take the Magic action to see a faint aura around any visible creature or object in the area that bears the magic, and if an effect was created by a spell, you learn the spell's school of magic. The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.PALADIN, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1,
  ritual: true
};

export const detectPoisonAndDisease: SpellEntry = {
  id: "spell-detect-poison-and-disease",
  name: "Detect Poison and Disease",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_detect-poison-and-disease", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a yew leaf",
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "For the duration, you sense the location of poisons, poisonous or venomous creatures, and magical contagions within 30 feet of yourself. You sense the kind of poison, creature, or contagion in each case. The spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.PALADIN, SPELL_LIST_CLASS.RANGER],
  spellLevel: 1,
  ritual: true
};

export const disguiseSelf: SpellEntry = {
  id: "spell-disguise-self",
  name: "Disguise Self",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_disguise-self", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 hour"],
  description: [
    "You make yourself—including your clothing, armor, weapons, and other belongings on your person look different until the spell ends. You can seem 1 foot shorter or taller and can appear heavier or lighter. You must adopt a form that has the same basic arrangement of limbs as you have. Otherwise, the extent of the illusion is up to you. The changes wrought by this spell fail to hold up to physical inspection. For example, if you use this spell to add a hat to your outfit, objects pass through the hat, and anyone who touches it would feel nothing. To discern that you are disguised, a creature must take the Study action to inspect your appearance and succeed on an Intelligence (Investigation) check against your spell save DC."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const dissonantWhispers: SpellEntry = {
  id: "spell-dissonant-whispers",
  name: "Dissonant Whispers",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_dissonant-whispers", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "One creature of your choice that you can see within range hears a discordant melody in its mind. The target makes a Wisdom saving throw. On a failed save, it takes <strong>3d6</strong> Psychic damage and must immediately use its Reaction, if available, to move as far away from you as it can, using the safest route. On a successful save, the target takes half as much damage only."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD],
  spellLevel: 1
};

export const distortValue: SpellEntry = {
  id: "spell-distort-value",
  name: "Distort Value",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V],
  duration: ["8 hours"],
  description: [
    "You cast this spell on an object no more than 1 foot on a side, doubling the object's perceived value by adding illusionary flourish or reducing its perceived value by half with the help of illusionary dents and scratches. Anyone examining the object must roll an Investigation check against your spell DC.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a higher spell slot, you increase the size of the object by 1 foot per spell slot over 1st."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const divineFavor: SpellEntry = {
  id: "spell-divine-favor",
  name: "Divine Favor",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_divine-favor", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 minute"],
  description: [
    "Until the spell ends, your attacks with weapons deal an extra <strong>1d4</strong> Radiant damage on a hit."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D4, DAMAGE_TYPE.RADIANT]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const divineSmite: SpellEntry = {
  id: "spell-divine-smite",
  name: "Divine Smite",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_divine-smite", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [],
  duration: ["Instantaneous"],
  description: [
    "The target takes an extra <strong>2d8</strong> Radiant damage from the attack. The damage increases by <strong>1d8</strong> if the target is a Fiend or an Undead.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d8</strong> for each spell slot level above 1."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const earthTremor: SpellEntry = {
  id: "spell-earth-tremor",
  name: "Earth Tremor",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (10-foot radius)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You cause a tremor in the ground in a 10-foot radius. Each creature other than you in that area must make a Dexterity saving throw. On a failed save, a creature takes <strong>1d6</strong> Bludgeoning damage and is knocked Prone. If the ground in that area is loose earth or stone, it becomes difficult terrain until cleared.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by <strong>1d6</strong> for each slot level above 1st."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const ensnaringStrike: SpellEntry = {
  id: "spell-ensnaring-strike",
  name: "Ensnaring Strike",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_ensnaring-strike", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "As you hit the target, grasping vines appear on it, and it makes a Strength saving throw. A Large or larger creature has Advantage on this save. On a failed save, the target has the Restrained condition until the spell ends. On a successful save, the vines shrivel away, and the spell ends. While Restrained, the target takes <strong>1d6</strong> Piercing damage at the start of each of its turns. The target or a creature within reach of it can take an action to make a Strength (Athletics) check against your spell save DC. On a success, the spell ends.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d6</strong> for each spell slot level above 1."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.STR,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.PIERCING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const entangle: SpellEntry = {
  id: "spell-entangle",
  name: "Entangle",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_entangle", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Grasping plants sprout from the ground in a 20-foot square within range. For the duration, these plants turn the ground in the area into Difficult Terrain. They disappear when the spell ends. Each creature (other than you) in the area when you cast the spell must succeed on a Strength saving throw or have the Restrained condition until the spell ends. A Restrained creature can take an action to make a Strength (Athletics) check against your spell save DC. On a success, it frees itself from the grasping plants and is no longer Restrained by them."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.STR,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const expeditiousRetreat: SpellEntry = {
  id: "spell-expeditious-retreat",
  name: "Expeditious Retreat",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_expeditious-retreat", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You take the Dash action, and until the spell ends, you can take that action again as a Bonus Action."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const faerieFire: SpellEntry = {
  id: "spell-faerie-fire",
  name: "Faerie Fire",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_faerie-fire", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Objects in a 20-foot Cube within range are outlined in blue, green, or violet light (your choice). Each creature in the Cube is also outlined if it fails a Dexterity saving throw. For the duration, objects and affected creatures shed Dim Light in a 10-foot radius and can't benefit from the Invisible condition. Attack rolls against an affected creature or object have Advantage if the attacker can see it."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isAttackSpell: true,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID],
  spellLevel: 1
};

export const falseLife: SpellEntry = {
  id: "spell-false-life",
  name: "False Life",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_false-life", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a drop of alcohol",
  duration: ["Instantaneous"],
  description: [
    "You gain <strong>2d4 + 4</strong> Temporary Hit Points.",
    "<strong>Using a Higher-Level Spell Slot.</strong> You gain 5 additional Temporary Hit Points for each spell slot level above 1."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const featherFall: SpellEntry = {
  id: "spell-feather-fall",
  name: "Feather Fall",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_feather-fall", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.REACTION, "which you take when you or a creature you can see within 60 feet of you falls"],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.M],
  materialSpecified: "a small feather or piece of down",
  duration: ["1 minute"],
  description: [
    "Choose up to five falling creatures within range. A falling creature's rate of descent slows to 60 feet per round until the spell ends. If a creature lands before the spell ends, the creature takes no damage from the fall, and the spell ends for that creature."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const findFamiliar: SpellEntry = {
  id: "spell-find-familiar",
  name: "Find Familiar",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_find-familiar", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "burning incense worth 10+ GP, which the spell consumes",
  duration: ["Instantaneous"],
  description: [
    "You gain the service of a familiar, a spirit that takes an animal form you choose: Bat, Cat, Frog, Hawk, Lizard, Octopus, Owl, Rat, Raven, Spider, Weasel, or another Beast that has a Challenge Rating of 0. Appearing in an unoccupied space within range, the familiar has the statistics of the chosen form (see \"Monsters\"), though it is a Celestial, Fey, or Fiend (your choice) instead of a Beast. Your familiar acts independently of you, but it obeys your commands.",
    "<strong>_Telepathic Connection._</strong> While your familiar is within 100 feet of you, you can communicate with it telepathically. Additionally, as a Bonus Action, you can see through the familiar's eyes and hear what it hears until the start of your next turn, gaining the benefits of any special senses it has.",
    "Finally, when you cast a spell with a range of touch, your familiar can deliver the touch. Your familiar must be within 100 feet of you, and it must take a Reaction to deliver the touch when you cast the spell.",
    "<strong>_Combat._</strong> The familiar is an ally to you and your allies. It rolls its own Initiative and acts on its own turn. A familiar can't attack, but it can take other actions as normal.",
    "<strong>_Disappearance of the Familiar._</strong> When the familiar drops to 0 Hit Points, it disappears. It reappears after you cast this spell again. As a Magic action, you can temporarily dismiss the familiar to a pocket dimension. Alternatively, you can dismiss it forever. As a Magic action while it is temporarily dismissed, you can cause it to reappear in an unoccupied space within 30 feet of you. Whenever the familiar drops to 0 Hit Points or disappears into the pocket dimension, it leaves behind in its space anything it was wearing or carrying.",
    "<strong>_One Familiar Only._</strong> You can't have more than one familiar at a time. If you cast this spell while you have a familiar, you instead cause it to adopt a new eligible form."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1,
  ritual: true
};

export const floatingDisk: SpellEntry = {
  id: "spell-floating-disk",
  name: "Floating Disk",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_floating-disk", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a drop of mercury",
  duration: ["1 hour"],
  description: [
    "This spell creates a circular, horizontal plane of force, 3 feet in diameter and 1 inch thick, that floats 3 feet above the ground in an unoccupied space of your choice that you can see within range. The disk remains for the duration and can hold up to 500 pounds. If more weight is placed on it, the spell ends, and everything on the disk falls to the ground. The disk is immobile while you are within 20 feet of it. If you move more than 20 feet away from it, the disk follows you so that it remains within 20 feet of you. It can move across uneven terrain, up or down stairs, slopes and the like, but it can't cross an elevation change of 10 feet or more. For example, the disk can't move across a 10-foot-deep pit, nor could it leave such a pit if it was created at the bottom. If you move more than 100 feet from the disk (typically because it can't move around an obstacle to follow you), the spell ends."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1,
  ritual: true
};

export const fogCloud: SpellEntry = {
  id: "spell-fog-cloud",
  name: "Fog Cloud",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_fog-cloud", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You create a 20-foot-radius Sphere of fog centered on a point within range. The Sphere is Heavily Obscured. It lasts for the duration or until a strong wind (such as one created by Gust of Wind) disperses it.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The fog's radius increases by 20 feet for each spell slot level above 1."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const frostFingers: SpellEntry = {
  id: "spell-frost-fingers",
  name: "Frost Fingers",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (15-foot cone)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "Freezing cold blasts from your fingertips in a 15-foot cone. Each creature in that area must make a Constitution saving throw, taking <strong>2d8</strong> Cold damage on a failed save, or half as much damage on a successful one.",
    "The cold freezes nonmagical liquids in the area that aren't being worn or carried.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by <strong>1d8</strong> for each slot level above 1st."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.COLD],
    [DICE.D8, DAMAGE_TYPE.COLD]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const giftOfAlacrity: SpellEntry = {
  id: "spell-gift-of-alacrity",
  name: "Gift of Alacrity",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["8 hours"],
  description: [
    "You touch a willing creature. For the duration, the target can add <strong>1d8</strong> to its Initiative rolls."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const goodberry: SpellEntry = {
  id: "spell-goodberry",
  name: "Goodberry",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_goodberry", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a sprig of mistletoe",
  duration: ["24 hours"],
  description: [
    "Ten berries appear in your hand and are infused with magic for the duration. A creature can take a Bonus Action to eat one berry. Eating a berry restores 1 Hit Point, and the berry provides enough nourishment to sustain a creature for one day. Uneaten berries disappear when the spell ends."
  ],
  isHealingSpell: true,
  damage: [],
  healing: [1],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const grease: SpellEntry = {
  id: "spell-grease",
  name: "Grease",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_grease", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a bit of pork rind or butter",
  duration: ["1 minute"],
  description: [
    "Nonflammable grease covers the ground in a 10 foot square centered on a point within range and turns it into Difficult Terrain for the duration. When the grease appears, each creature standing in its area must succeed on a Dexterity saving throw or have the Prone condition. A creature that enters the area or ends its turn there must also succeed on that save or fall Prone."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const guidingBolt: SpellEntry = {
  id: "spell-guiding-bolt",
  name: "Guiding Bolt",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_guiding-bolt", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 round"],
  description: [
    "You hurl a bolt of light toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes <strong>4d6</strong> Radiant damage, and the next attack roll made against it before the end of your next turn has Advantage.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d6</strong> for each spell slot level above 1."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 1
};

export const guidingHand: SpellEntry = {
  id: "spell-guiding-hand",
  name: "Guiding Hand",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "5 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 8 hours"],
  description: [
    "You create a Tiny incorporeal hand of shimmering light in an unoccupied space you can see within range. The hand exists for the duration, but it disappears if you teleport or you travel to a different plane of existence.",
    "When the hand appears, you name one major landmark, such as a city, mountain, castle, or battlefield on the same plane of existence as you. Someone in history must have visited the site and mapped it. If the landmark appears on no map in existence, the spell fails. Otherwise, whenever you move toward the hand, it moves away from you at the same speed you moved, and it moves in the direction of the landmark, always remaining 5 feet away from you.",
    "If you don't move toward the hand, it remains in place until you do and beckons for you to follow once every <strong>1d4</strong> minutes."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const hailOfThorns: SpellEntry = {
  id: "spell-hail-of-thorns",
  name: "Hail of Thorns",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "The next time you hit a creature with a ranged weapon attack before the spell ends, this spell creates a rain of thorns that sprouts from your ranged weapon or ammunition. In addition to the normal effect of the attack, the target of the attack and each creature within 5 feet of it must make a Dexterity saving throw. A creature takes <strong>1d10</strong> Piercing damage on a failed save, or half as much damage on a successful one.",
    "<strong>At Higher Levels.</strong> If you cast this spell using a spell slot of 2nd level or higher, the damage increases by <strong>1d10</strong> for each slot level above 1st, to a maximum of <strong>6d10</strong>."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.PIERCING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const healingElixir: SpellEntry = {
  id: "spell-healing-elixir",
  name: "Healing Elixir",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["24 hours"],
  description: [
    "You create a healing elixir in a simple vial that appears in your hand. The elixir retains its potency for the duration or until it's consumed, at which point the vial vanishes.",
    "As an action, a creature can drink the elixir or administer it to another creature. The drinker regains <strong>2d4</strong> + 2 Hit Points."
  ],
  isHealingSpell: true,
  damage: [],
  healing: [DICE.D4, DICE.D4, 2],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const healingWord: SpellEntry = {
  id: "spell-healing-word",
  name: "Healing Word",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_healing-word", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "A creature of your choice that you can see within range regains Hit Points equal to <strong>2d4</strong> plus your spellcasting ability modifier.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The healing increases by <strong>2d4</strong> for each spell slot level above 1."
  ],
  isHealingSpell: true,
  damage: [],
  healing: [DICE.D4, DICE.D4, "spellcastingAbility"],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 1
};

export const hellishRebuke: SpellEntry = {
  id: "spell-hellish-rebuke",
  name: "Hellish Rebuke",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_hellish-rebuke", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.REACTION, "which you take in response to taking damage from a creature that you can see within 60 feet of yourself"],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "The creature that damaged you is momentarily surrounded by green flames. It makes a Dexterity saving throw, taking <strong>2d10</strong> Fire damage on a failed save or half as much damage on a successful one.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d10</strong> for each spell slot level above 1."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 1
};

export const heroism: SpellEntry = {
  id: "spell-heroism",
  name: "Heroism",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_heroism", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A willing creature you touch is imbued with bravery. Until the spell ends, the creature is immune to the Frightened condition and gains Temporary Hit Points equal to your spellcasting ability modifier at the start of each of its turns.",
    "<strong>Using a Higher-Level Spell Slot.</strong> You can target one additional creature for each spell slot level above 1."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const hex: SpellEntry = {
  id: "spell-hex",
  name: "Hex",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_hex", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "the petrified eye of a newt",
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra <strong>1d6</strong> Necrotic damage to the target whenever you hit it with an attack roll. Also, choose one ability when you cast the spell. The target has Disadvantage on ability checks made with the chosen ability. If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action on a later turn to curse a new creature.",
    "<strong>Using a Higher-Level Spell Slot.</strong> Your Concentration can last longer with a spell slot of level 2 (up to 4 hours), 3–4 (up to 8 hours), or 5+ (24 hours)."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.NECROTIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 1
};

export const hideousLaughter: SpellEntry = {
  id: "spell-hideous-laughter",
  name: "Hideous Laughter",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_hideous-laughter", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a tart and a feather",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "One creature of your choice that you can see within range makes a Wisdom saving throw. On a failed save, it has the Prone and Incapacitated conditions for the duration. During that time, it laughs uncontrollably if it's capable of laughter, and it can't end the Prone condition on itself. At the end of each of its turns and each time it takes damage, it makes another Wisdom saving throw. The target has Advantage on the save if the save is triggered by damage. On a successful save, the spell ends.",
    "<strong>Using a Higher-Level Spell Slot.</strong> You can target one additional creature for each spell slot level above 1."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const huntersMark: SpellEntry = {
  id: "spell-hunters-mark",
  name: "Hunter's Mark",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_hunters-mark", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You magically mark one creature you can see within range as your quarry. Until the spell ends, you deal an extra <strong>1d6</strong> Force damage to the target whenever you hit it with an attack roll. You also have Advantage on any Wisdom (Perception or Survival) check you make to find it. If the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action to move the mark to a new creature you can see within range.",
    "<strong>Using a Higher-Level Spell Slot.</strong> Your Concentration can last longer with a spell slot of level 3–4 (up to 8 hours) or 5+ (up to 24 hours)."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const iceKnife: SpellEntry = {
  id: "spell-ice-knife",
  name: "Ice Knife",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_ice-knife", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a drop of water or a piece of ice",
  duration: ["Instantaneous"],
  description: [
    "You create a shard of ice and fling it at one creature within range. Make a ranged spell attack against the target. On a hit, the target takes <strong>1d10</strong> Piercing damage. Hit or miss, the shard then explodes. The target and each creature within 5 feet of it must succeed on a Dexterity saving throw or take <strong>2d6</strong> Cold damage.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The Cold damage increases by <strong>1d6</strong> for each spell slot level above 1."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.PIERCING],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const idInsinuation: SpellEntry = {
  id: "spell-id-insinuation",
  name: "Id Insinuation",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You unleash a torrent of conflicting desires in the mind of one creature you can see within range, impairing its ability to make decisions. The target must succeed on a Wisdom saving throw or be Incapacitated. At the end of each of its turns, it takes <strong>1d12</strong> Psychic damage, and it can then make another Wisdom saving throw. On a success, the spell ends on the target."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
  damage: [
    [DICE.D12, DAMAGE_TYPE.PSYCHIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const identify: SpellEntry = {
  id: "spell-identify",
  name: "Identify",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_identify", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a pearl worth 100+ GP",
  duration: ["Instantaneous"],
  description: [
    "You touch an object throughout the spell's casting. If the object is a magic item or some other magical object, you learn its properties and how to use them, whether it requires Attunement, and how many charges it has, if any. You learn whether any ongoing spells are affecting the item and what they are. If the item was created by a spell, you learn that spell's name. If you instead touch a creature throughout the casting, you learn which ongoing spells, if any, are currently affecting it."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1,
  ritual: true
};

export const illusoryScript: SpellEntry = {
  id: "spell-illusory-script",
  name: "Illusory Script",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_illusory-script", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "ink worth 10+ GP, which the spell consumes",
  duration: ["10 day"],
  description: [
    "You write on parchment, paper, or another suitable material and imbue it with an illusion that lasts for the duration. To you and any creatures you designate when you cast the spell, the writing appears normal, seems to be written in your hand, and conveys whatever meaning you intended when you wrote the text. To all others, the writing appears as if it were written in an unknown or magical script that is unintelligible. Alternatively, the illusion can alter the meaning, handwriting, and language of the text, though the language must be one you know. If the spell is dispelled, the original script and the illusion both disappear. A creature that has Truesight can read the hidden message."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1,
  ritual: true
};

export const infallibleRelay: SpellEntry = {
  id: "spell-infallible-relay",
  name: "Infallible Relay",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "With this spell, you can target any creature with whom you have spoken previously, as long as the two of you are on the same plane of existence. When you cast the spell, the nearest functioning telephone or similar communications device within 100 feet of the target begins to ring. If there is no suitable device close enough to the target, the spell fails.",
    "The target must make a successful Charisma saving throw or be compelled to answer your call. Once the connection is established, the call is crystal clear and cannot be dropped until the conversation has ended or the spell's duration ends. You can end the conversation at any time, but a target must succeed on a Charisma saving throw to end the conversation."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CHA,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const inflictWounds: SpellEntry = {
  id: "spell-inflict-wounds",
  name: "Inflict Wounds",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_inflict-wounds", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "A creature you touch makes a Constitution saving throw, taking <strong>2d10</strong> Necrotic damage on a failed save or half as much damage on a successful one.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d10</strong> for each spell slot level above 1."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 1
};

export const jimsMagicMissile: SpellEntry = {
  id: "spell-jims-magic-missile",
  name: "Jim's Magic Missile",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You create three twisting, whistling, hypoallergenic, gluten-free darts of magical force. Each dart can target a creature of your choice that you can see within range. Make a ranged spell attack for each missile. On a hit, the missile does <strong>2d4</strong> Force damage.",
    "If the attack roll scores a critical, the missile does <strong>5d4</strong> Force damage instead of the <strong>4d4</strong> Force that you would normally get on a critical. If any of the attack rolls is a natural one, all missiles turn around and hit the caster for 1 Force damage per missile.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st. This also increases the tax by 1 GP per spell slot over 1st."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D4, DAMAGE_TYPE.FORCE],
    [DICE.D4, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const jump: SpellEntry = {
  id: "spell-jump",
  name: "Jump",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_jump", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Touch",
  components: [],
  duration: ["1 minute"],
  description: [
    "You touch a willing creature. Once on each of its turns until the spell ends, that creature can jump up to 30 feet by spending 10 feet of movement.",
    "<strong>Using a Higher-Level Spell Slot.</strong> You can target one additional creature for each spell slot level above 1."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const longstrider: SpellEntry = {
  id: "spell-longstrider",
  name: "Longstrider",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_longstrider", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a pinch of dirt",
  duration: ["1 hour"],
  description: [
    "You touch a creature. The target's Speed increases by 10 feet until the spell ends.",
    "<strong>Using a Higher-Level Spell Slot.</strong> You can target one additional creature for each spell slot level above 1."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const mageArmor: SpellEntry = {
  id: "spell-mage-armor",
  name: "Mage Armor",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_mage-armor", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a piece of cured leather",
  duration: ["8 hours"],
  description: [
    "You touch a willing creature who isn't wearing armor. Until the spell ends, the target's base AC becomes 13 plus its Dexterity modifier. The spell ends early if the target dons armor."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const magicMissile: SpellEntry = {
  id: "spell-magic-missile",
  name: "Magic Missile",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_magic-missile", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You create three glowing darts of magical force. Each dart strikes a creature of your choice that you can see within range. A dart deals <strong>1d4 + 1</strong> Force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The spell creates one more dart for each spell slot level above 1."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D4, DAMAGE_TYPE.FORCE],
    [1, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const magnifyGravity: SpellEntry = {
  id: "spell-magnify-gravity",
  name: "Magnify Gravity",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 round"],
  description: [
    "The gravity in a 10-foot-radius sphere centered on a point you can see within range increases for a moment. Each creature in the sphere on the turn when you cast the spell must make a Constitution saving throw. On a failed save, a creature takes <strong>2d8</strong> Force damage, and its Speed is halved until the end of its next turn. On a successful save, a creature takes half as much damage and suffers no reduction to its Speed.",
    "Until the start of your next turn, any object that isn't being worn or carried in the sphere requires a successful Strength check against your spell save DC to pick up or move.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by <strong>1d8</strong> for each slot level above 1st."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const protectionFromEvilAndGood: SpellEntry = {
  id: "spell-protection-from-evil-and-good",
  name: "Protection from Evil and Good",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_protection-from-evil-and-good", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a flask of Holy Water worth 25+ GP, which the spell consumes",
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Until the spell ends, one willing creature you touch is protected against creatures that are Aberrations, Celestials, Elementals, Fey, Fiends, or Undead. The protection grants several benefits. Creatures of those types have Disadvantage on attack rolls against the target. The target also can't be possessed by or gain the Charmed or Frightened conditions from them. If the target is already possessed, Charmed, or Frightened by such a creature, the target has Advantage on any new saving throw against the relevant effect."
  ],
  isAttackSpell: true,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.PALADIN, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const puppet: SpellEntry = {
  id: "spell-puppet",
  name: "Puppet",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "Your gesture forces one Humanoid you can see within range to make a Constitution saving throw. On a failed save, the target must move up to its Speed in a direction you choose. In addition, you can cause the target to drop whatever it is holding. This spell has no effect on a Humanoid that is immune to being Charmed."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const purifyFoodAndDrink: SpellEntry = {
  id: "spell-purify-food-and-drink",
  name: "Purify Food and Drink",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_purify-food-and-drink", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You remove poison and rot from nonmagical food and drink in a 5-foot-radius Sphere centered on a point within range."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1,
  ritual: true
};

export const rayOfSickness: SpellEntry = {
  id: "spell-ray-of-sickness",
  name: "Ray of Sickness",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_ray-of-sickness", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You shoot a greenish ray at a creature within range. Make a ranged spell attack against the target. On a hit, the target takes <strong>2d8</strong> Poison damage and has the Poisoned condition until the end of your next turn.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d8</strong> for each spell slot level above 1."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.POISON],
    [DICE.D8, DAMAGE_TYPE.POISON]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const remoteAccess: SpellEntry = {
  id: "spell-remote-access",
  name: "Remote Access",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["10 minutes"],
  description: [
    "You can use any electronic device within range as if it were in your hands. This is not a telekinesis effect. Rather, this spell allows you to simulate a device's mechanical functions electronically. You are able to access only functions that a person using the device manually would be able to access. You can use Remote Access with only one device at a time."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const sanctuary: SpellEntry = {
  id: "spell-sanctuary",
  name: "Sanctuary",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_sanctuary", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a shard of glass from a mirror",
  duration: ["1 minute"],
  description: [
    "You ward a creature within range. Until the spell ends, any creature who targets the warded creature with an attack roll or a damaging spell must succeed on a Wisdom saving throw or either choose a new target or lose the attack or spell. This spell doesn't protect the warded creature from areas of effect. The spell ends if the warded creature makes an attack roll, casts a spell, or deals damage."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isAttackSpell: true,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.CLERIC],
  spellLevel: 1
};

export const searingSmite: SpellEntry = {
  id: "spell-searing-smite",
  name: "Searing Smite",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_searing-smite", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [],
  duration: ["1 minute"],
  description: [
    "As you hit the target, it takes an extra <strong>1d6</strong> Fire damage from the attack. At the start of each of its turns until the spell ends, the target takes <strong>1d6</strong> Fire damage and then makes a Constitution saving throw. On a failed save, the spell continues. On a successful save, the spell ends.",
    "<strong>Using a Higher-Level Spell Slot.</strong> All the damage increases by <strong>1d6</strong> for each spell slot level above 1."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const senseEmotion: SpellEntry = {
  id: "spell-sense-emotion",
  name: "Sense Emotion",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You attune your senses to pick up the emotions of others for the duration. When you cast the spell, and as your action on each turn until the spell ends, you can focus your senses on one Humanoid you can see within 30 feet of you. You instantly learn the target's prevailing emotion, whether it's love, anger, pain, fear, calm, or something else. If the target isn't actually Humanoid or it is immune to being Charmed, you sense that it is calm."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const shield: SpellEntry = {
  id: "spell-shield",
  name: "Shield",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_shield", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.REACTION, "which you take when you are hit by an attack roll or targeted by the Magic Missile spell"],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 round"],
  description: [
    "An imperceptible barrier of magical force protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from Magic Missile."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const shieldOfFaith: SpellEntry = {
  id: "spell-shield-of-faith",
  name: "Shield of Faith",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_shield-of-faith", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a prayer scroll",
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "A shimmering field surrounds a creature of your choice within range, granting it a +2 bonus to AC for the duration."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const silentImage: SpellEntry = {
  id: "spell-silent-image",
  name: "Silent Image",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_silent-image", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a bit of fleece",
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 15-foot Cube. The image appears at a spot within range and lasts for the duration. The image is purely visual; it isn't accompanied by sound, smell, or other sensory effects. As a Magic action, you can cause the image to move to any spot within range. As the image changes location, you can alter its appearance so that its movements appear natural for the image. For example, if you create an image of a creature and move it, you can alter the image so that it appears to be walking. Physical interaction with the image reveals it to be an illusion, since things can pass through it. A creature that takes a Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const silveryBarbs: SpellEntry = {
  id: "spell-silvery-barbs",
  name: "Silvery Barbs",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.REACTION, "which you take when a creature you can see within 60 feet of yourself succeeds on an attack roll, an ability check, or a saving throw"],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You magically distract the triggering creature and turn its momentary uncertainty into encouragement for another creature. The triggering creature must reroll the <strong>d20</strong> and use the lower roll.",
    "You can then choose a different creature you can see within range, and you can choose yourself. The chosen creature has Advantage on the next attack roll, ability check, or saving throw it makes within 1 minute. A creature can be empowered by only one use of this spell at a time."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const sleep: SpellEntry = {
  id: "spell-sleep",
  name: "Sleep",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_sleep", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a pinch of sand or rose petals",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Each creature of your choice in a 5-foot-radius Sphere centered on a point within range must succeed on a Wisdom saving throw or have the Incapacitated condition until the end of its next turn, at which point it must repeat the save. If the target fails the second save, the target has the Unconscious condition for the duration. The spell ends on a target if it takes damage or someone within 5 feet of it takes an action to shake it out of the spell's effect. Creatures that don't sleep, such as elves, or that have Immunity to the Exhaustion condition automatically succeed on saves against this spell."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const snare: SpellEntry = {
  id: "spell-snare",
  name: "Snare",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["8 hours"],
  description: [
    "As you cast this spell, you use the rope to create a circle with a 5-foot radius on the ground or the floor. When you finish casting, the rope disappears and the circle becomes a magic trap.",
    "This trap is nearly invisible, requiring a successful Intelligence (Investigation) check against your spell save DC to be discerned.",
    "The trap triggers when a Small, Medium, or Large creature moves onto the ground or the floor in the spell's radius. That creature must succeed on a Dexterity saving throw or be magically hoisted into the air, leaving it hanging upside down 3 feet above the ground or the floor. The creature is Restrained there until the spell ends.",
    "A Restrained creature can make a Dexterity saving throw at the end of each of its turns, ending the effect on itself on a success. Alternatively, the creature or someone else who can reach it can use an action to make an Intelligence (Arcana) check against your spell save DC. On a success, the Restrained effect ends.",
    "After the trap is triggered, the spell ends when no creature is Restrained by it."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const speakWithAnimals: SpellEntry = {
  id: "spell-speak-with-animals",
  name: "Speak with Animals",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_speak-with-animals", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["10 minutes"],
  description: [
    "For the duration, you can comprehend and verbally communicate with Beasts, and you can use any of the Influence action's skill options with them. Most Beasts have little to say about topics that don't pertain to survival or companionship, but at minimum, a Beast can give you information about nearby locations and monsters, including whatever it has perceived within the past day."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 1,
  ritual: true
};

export const suddenAwakening: SpellEntry = {
  id: "spell-sudden-awakening",
  name: "Sudden Awakening",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "10 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "Each sleeping creature you choose within range awakens, and then each Prone creature within range can stand up without expending any movement."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const tashasCausticBrew: SpellEntry = {
  id: "spell-tashas-caustic-brew",
  name: "Tasha's Caustic Brew",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot line)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A stream of acid emanates from you in a line 30 feet long and 5 feet wide in a direction you choose. Each creature in the line must succeed on a Dexterity saving throw or be covered in acid for the spell's duration or until a creature uses its action to scrape or wash the acid off itself or another creature. A creature covered in the acid takes <strong>2d4</strong> Acid damage at the start of each of its turns.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by <strong>2d4</strong> for each slot level above 1st."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const thunderousSmite: SpellEntry = {
  id: "spell-thunderous-smite",
  name: "Thunderous Smite",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "The first time you hit with a melee weapon attack during this spell's duration, your weapon rings with thunder that is audible within 300 feet of you, and the attack deals an extra <strong>2d6</strong> Thunder damage to the target. Additionally, if the target is a creature, it must succeed on a Strength saving throw or be pushed 10 feet away from you and knocked Prone."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.STR,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.THUNDER],
    [DICE.D6, DAMAGE_TYPE.THUNDER]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const thunderwave: SpellEntry = {
  id: "spell-thunderwave",
  name: "Thunderwave",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_thunderwave", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You unleash a wave of thunderous energy. Each creature in a 15-foot Cube originating from you makes a Constitution saving throw. On a failed save, a creature takes <strong>2d8</strong> Thunder damage and is pushed 10 feet away from you. On a successful save, a creature takes half as much damage only.",
    "In addition, unsecured objects that are entirely within the Cube are pushed 10 feet away from you, and a thunderous boom is audible within 300 feet.",
    "<strong>Using a Higher-Level Spell Slot.</strong> The damage increases by <strong>1d8</strong> for each spell slot level above 1."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.THUNDER],
    [DICE.D8, DAMAGE_TYPE.THUNDER]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const unearthlyChorus: SpellEntry = {
  id: "spell-unearthly-chorus",
  name: "Unearthly Chorus",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot radius)",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Music of a style you choose fills the air around you in a 30-foot radius. The music spreads around corners and can be heard from up to 100 feet away. The music moves with you, centered on you for the duration.",
    "Until the spell ends, you make Charisma (Performance) checks with Advantage. In addition, you can use a Bonus Action on each of your turns to beguile one creature you choose within 30 feet of you that can see you and hear the music. The creature must make a Charisma saving throw. If you or your companions are attacking it, the creature automatically succeeds on the saving throw. On a failure, the creature becomes friendly to you for as long as it can hear the music and for 1 hour thereafter. You make Charisma (Deception) checks and Charisma (Persuasion) checks against creatures made friendly by this spell with Advantage."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CHA,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD],
  spellLevel: 1
};

export const unseenServant: SpellEntry = {
  id: "spell-unseen-servant",
  name: "Unseen Servant",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_unseen-servant", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a bit of string and of wood",
  duration: ["1 hour"],
  description: [
    "This spell creates an Invisible, mindless, shapeless, Medium force that performs simple tasks at your command until the spell ends. The servant springs into existence in an unoccupied space on the ground within range. It has AC 10, 1 Hit Point, and a Strength of 2, and it can't attack. If it drops to 0 Hit Points, the spell ends. Once on each of your turns as a Bonus Action, you can mentally command the servant to move up to 15 feet and interact with an object. The servant can perform simple tasks that a human could do, such as fetching things, cleaning, mending, folding clothes, lighting fires, serving food, and pouring drinks. Once you give the command, the servant performs the task to the best of its ability until it completes the task, then waits for your next command. If you command the servant to perform a task that would move it more than 60 feet away from you, the spell ends."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1,
  ritual: true
};

export const wildCunning: SpellEntry = {
  id: "spell-wild-cunning",
  name: "Wild Cunning",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You call out to the spirits of nature to aid you. When you cast this spell, choose one of the following effects:",
    "If there are any tracks on the ground within range, you know where they are, and you make Wisdom (Survival) checks to follow these tracks with Advantage for 1 hour or until you cast this spell again.",
    "If there is edible forage within range, you know it and where to find it.",
    "If there is clean drinking water within range, you know it and where to find it.",
    "If there is suitable shelter for you and your companions within range, you know it and where to find it.",
    "Send the spirits to bring back wood for a fire and to set up a campsite in the area using your supplies. The spirits build the fire in a circle of stones, put up tents, unroll bedrolls, and put out any rations and water for consumption.",
    "Have the spirits instantly break down a campsite, which includes putting out a fire, taking down tents, packing up bags, and burying any rubbish."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const witchBolt: SpellEntry = {
  id: "spell-witch-bolt",
  name: "Witch Bolt",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A beam of crackling, blue energy lances out toward a creature within range, forming a sustained arc of Lightning between you and the target. Make a ranged spell attack against that creature. On a hit, the target takes <strong>1d12</strong> Lightning damage, and on each of your turns for the duration, you can use your action to deal <strong>1d12</strong> Lightning damage to the target automatically. The spell ends if you use your action to do anything else. The spell also ends if the target is ever outside the spell's range or if it has Total Cover from you.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the initial damage increases by <strong>1d12</strong> for each slot level above 1st."
  ],
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D12, DAMAGE_TYPE.LIGHTNING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const wrathfulSmite: SpellEntry = {
  id: "spell-wrathful-smite",
  name: "Wrathful Smite",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "The next time you hit with a melee weapon attack during this spell's duration, your attack deals an extra <strong>1d6</strong> Psychic damage. Additionally, if the target is a creature, it must make a Wisdom saving throw or be Frightened of you until the spell ends. As an action, the creature can make a Wisdom check against your spell save DC to steel its resolve and end this spell."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const zephyrStrike: SpellEntry = {
  id: "spell-zephyr-strike",
  name: "Zephyr Strike",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You move like the wind. For the duration, your movement doesn't provoke Opportunity Attacks.",
    "Once before the spell ends, you can give yourself Advantage on one weapon attack roll on your turn. That attack deals an extra <strong>1d8</strong> Force damage on a hit. Whether you hit or miss, your walking Speed increases by 30 feet until the end of that turn."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const spellEntries1: SpellEntry[] = [
  absorbElements,
  acidStream,
  alarm,
  animalFriendship,
  arcaneWeapon,
  armorOfAgathys,
  armsOfHadar,
  bane,
  beastBond,
  bless,
  burningHands,
  catapult,
  causeFear,
  ceremony,
  chaosBolt,
  charmPerson,
  chromaticOrb,
  colorSpray,
  command,
  compelledDuel,
  comprehendLanguages,
  createOrDestroyWater,
  cureWounds,
  detectEvilAndGood,
  detectMagic,
  detectPoisonAndDisease,
  disguiseSelf,
  dissonantWhispers,
  distortValue,
  divineFavor,
  divineSmite,
  earthTremor,
  ensnaringStrike,
  entangle,
  expeditiousRetreat,
  faerieFire,
  falseLife,
  featherFall,
  findFamiliar,
  floatingDisk,
  fogCloud,
  frostFingers,
  giftOfAlacrity,
  goodberry,
  grease,
  guidingBolt,
  guidingHand,
  hailOfThorns,
  healingElixir,
  healingWord,
  hellishRebuke,
  heroism,
  hex,
  hideousLaughter,
  huntersMark,
  iceKnife,
  idInsinuation,
  identify,
  illusoryScript,
  infallibleRelay,
  inflictWounds,
  jimsMagicMissile,
  jump,
  longstrider,
  mageArmor,
  magicMissile,
  magnifyGravity,
  protectionFromEvilAndGood,
  puppet,
  purifyFoodAndDrink,
  rayOfSickness,
  remoteAccess,
  sanctuary,
  searingSmite,
  senseEmotion,
  shield,
  shieldOfFaith,
  silentImage,
  silveryBarbs,
  sleep,
  snare,
  speakWithAnimals,
  suddenAwakening,
  tashasCausticBrew,
  thunderousSmite,
  thunderwave,
  unearthlyChorus,
  unseenServant,
  wildCunning,
  witchBolt,
  wrathfulSmite,
  zephyrStrike
];
