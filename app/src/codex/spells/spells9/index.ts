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

export const astralProjection: SpellEntry = {
  id: "spell-astral-projection",
  name: "Astral Projection",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_astral-projection", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.HOUR],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "for each of the spell's targets, one jacinth worth 1,000+ GP and one silver bar worth 100+ GP, all of which the spell consumes",
  duration: ["Until dispelled"],
  description: [
    "You and up to eight willing creatures within range project your astral bodies into the Astral Plane (the spell ends instantly if you are already on that plane). Each target's body is left behind in a state of suspended animation; it has the Unconscious condition, doesn't need food or air, and doesn't age. A target's astral form resembles its body in almost every way, replicating its game statistics and possessions. The principal difference is the addition of a silvery cord that trails from between the shoulder blades of the astral form. The cord fades from view after 1 foot. If the cord is cut—which happens only when an effect states that it does so—the target's body and astral form both die. A target's astral form can travel through the Astral Plane. The moment an astral form leaves that plane, the target's body and possessions travel along the silver cord, causing the target to re-enter its body on the new plane. Any damage or other effects that apply to an astral form have no effect on the target's body and vice versa. If a target's body or astral form drops to 0 Hit Points, the spell ends for that target. The spell ends for all the targets if you take a Magic action to dismiss it. When the spell ends for a target who isn't dead, the target reappears in its body and exits the state of suspended animation."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const bladeOfDisaster: SpellEntry = {
  id: "spell-blade-of-disaster",
  name: "Blade of Disaster",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You create a blade-shaped planar rift about 3 feet long in an unoccupied space you can see within range. The blade lasts for the duration. When you cast this spell, you can make up to two melee spell attacks with the blade, each one against a creature, loose object, or structure within 5 feet of the blade.",
    "On a hit, the target takes <strong>4d12</strong> Force damage. This attack scores a critical hit if the number on the <strong>d20</strong> is 18 or higher. On a critical hit, the blade deals an extra <strong>8d12</strong> Force damage, for a total of <strong>12d12</strong> Force damage.",
    "As a Bonus Action on your turn, you can move the blade up to 30 feet to an unoccupied space you can see and then make up to two melee spell attacks with it again.",
    "The blade can harmlessly pass through any barrier, including a Wall of Force."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D12, DAMAGE_TYPE.FORCE],
    [DICE.D12, DAMAGE_TYPE.FORCE],
    [DICE.D12, DAMAGE_TYPE.FORCE],
    [DICE.D12, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const foresight: SpellEntry = {
  id: "spell-foresight",
  name: "Foresight",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_foresight", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a hummingbird feather",
  duration: ["8 hours"],
  description: [
    "You touch a willing creature and bestow a limited ability to see into the immediate future. For the duration, the target has Advantage on D20 Tests, and other creatures have Disadvantage on attack rolls against it. The spell ends early if you cast it again."
  ],
  isAttackSpell: true,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const gate: SpellEntry = {
  id: "spell-gate",
  name: "Gate",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_gate", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a diamond worth 5,000+ GP",
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You conjure a portal linking an unoccupied space you can see within range to a precise location on a different plane of existence. The portal is a circular opening, which you can make 5 to 20 feet in diameter. You can orient the portal in any direction you choose. The portal lasts for the duration, and the portal's destination is visible through it. The portal has a front and a back on each plane where it appears. Travel through the portal is possible only by moving through its front. Anything that does so is instantly transported to the other plane, appearing in the unoccupied space nearest to the portal. Deities and other planar rulers can prevent portals created by this spell from opening in their presence or anywhere within their domains. When you cast this spell, you can speak the name of a specific creature (a pseudonym, title, or nickname doesn't work). If that creature is on a plane other than the one you are on, the portal opens next to the named creature and transports it to the nearest unoccupied space on your side of the portal. You gain no special power over the creature, and it is free to act as the GM deems appropriate. It might leave, attack you, or help you."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const imprisonment: SpellEntry = {
  id: "spell-imprisonment",
  name: "Imprisonment",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_imprisonment", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a statuette of the target worth 5,000+ GP",
  duration: ["Until dispelled"],
  description: [
    "You create a magical restraint to hold a creature that you can see within range. The target must make a Wisdom saving throw. On a successful save, the target is unaffected, and it is immune to this spell for the next 24 hours. On a failed save, the target is imprisoned. While imprisoned, the target doesn't need to breathe, eat, or drink, and it doesn't age. Divination spells can't locate or perceive the imprisoned target, and the target can't teleport.",
    "Until the spell ends, the target is also affected by one of the following effects of your choice:",
    { type: "list", style: "bullet", items: ["<strong>Burial.</strong> The target is entombed beneath the earth in a hollow globe of magical force that is just large enough to contain the target. Nothing can pass into or out of the globe.", "<strong>Chaining.</strong> Chains firmly rooted in the ground hold the target in place. The target has the Restrained condition and can't be moved by any means.", "<strong>Hedged Prison.</strong> The target is trapped in a demiplane that is warded against teleportation and planar travel. The demiplane is your choice of a labyrinth, a cage, a tower, or the like.", "<strong>Minimus Containment.</strong> The target becomes 1 inch tall and is trapped inside an indestructible gemstone or a similar object. Light can pass through the gemstone (allowing the target to see out and other creatures to see in), but nothing else can pass through by any means.", "<strong>Slumber.</strong> The target has the Unconscious condition and can't be awoken."] },
    "<strong>_Ending the Spell._</strong> When you cast the spell, specify a trigger that will end it. The trigger can be as simple or as elaborate as you choose, but the GM must agree that it has a high likelihood of happening within the next decade. The trigger must be an observable action, such as someone making a particular offering at the temple of your god, saving your true love, or defeating a specific monster.",
    "A Dispel Magic spell can end the spell only if it is cast with a level 9 spell slot, targeting either the prison or the component used to create it."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const invulnerability: SpellEntry = {
  id: "spell-invulnerability",
  name: "Invulnerability",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You are immune to all damage until the spell ends."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const massHeal: SpellEntry = {
  id: "spell-mass-heal",
  name: "Mass Heal",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_mass-heal", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "A flood of healing energy flows from you into creatures around you. You restore up to 700 Hit Points, divided as you choose among any number of creatures that you can see within range. Creatures healed by this spell also have the Blinded, Deafened, and Poisoned conditions removed from them."
  ],
  isHealingSpell: true,
  damage: [],
  healing: { label: "Up to 700 Hit Points" },
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 9
};

export const massPolymorph: SpellEntry = {
  id: "spell-mass-polymorph",
  name: "Mass Polymorph",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You transform up to ten creatures of your choice that you can see within range. An unwilling target must succeed on a Wisdom saving throw to resist the transformation. An unwilling shapechanger automatically succeeds on the save.",
    "Each target assumes a Beast form of your choice, and you can choose the same form or different ones for each target. The new form can be any Beast you have seen whose Challenge Rating is equal to or less than the target's, or half the target's level if the target doesn't have a Challenge Rating. The target's game statistics, including mental ability scores, are replaced by the statistics of the chosen Beast, but the target retains its Hit Points, alignment, and personality.",
    "Each target gains a number of temporary Hit Points equal to the Hit Points of its new form. These temporary Hit Points can't be replaced by temporary Hit Points from another source. A target reverts to its normal form when it has no more temporary Hit Points or it dies. If the spell ends before then, the creature loses all its temporary Hit Points and reverts to its normal form.",
    "The creature is limited in the actions it can perform by the nature of its new form. It can't speak, cast spells, or do anything else that requires hands or speech. The target's gear melds into the new form.",
    "The target can't activate, use, wield, or otherwise benefit from any of its equipment."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const meteorSwarm: SpellEntry = {
  id: "spell-meteor-swarm",
  name: "Meteor Swarm",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_meteor-swarm", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "1 mile",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "Blazing orbs of fire plummet to the ground at four different points you can see within range. Each creature in a 40-foot-radius Sphere centered on each of those points makes a Dexterity saving throw. A creature takes <strong>20d6</strong> Fire damage and <strong>20d6</strong> Bludgeoning damage on a failed save or half as much damage on a successful one. A creature in the area of more than one fiery Sphere is affected only once. A nonmagical object that isn't being worn or carried also takes the damage if it's in the spell's area, and the object starts burning if it's flammable."
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
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
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
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const powerWordHeal: SpellEntry = {
  id: "spell-power-word-heal",
  name: "Power Word Heal",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_power-word-heal", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [],
  duration: ["Instantaneous"],
  description: [
    "A wave of healing energy washes over one creature you can see within range. The target regains all its Hit Points. If the creature has the Charmed, Frightened, Paralyzed, Poisoned, or Stunned condition, the condition ends. If the creature has the Prone condition, it can use its Reaction to stand up."
  ],
  isHealingSpell: true,
  damage: [],
  healing: { label: "All Hit Points" },
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC],
  spellLevel: 9
};

export const powerWordKill: SpellEntry = {
  id: "spell-power-word-kill",
  name: "Power Word Kill",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_power-word-kill", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [],
  duration: ["Instantaneous"],
  description: [
    "You compel one creature you can see within range to die. If the target has 100 Hit Points or fewer, it dies. Otherwise, it takes <strong>12d12</strong> Psychic damage."
  ],
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
    [DICE.D12, DAMAGE_TYPE.PSYCHIC],
    [DICE.D12, DAMAGE_TYPE.PSYCHIC],
    [DICE.D12, DAMAGE_TYPE.PSYCHIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const prismaticWall: SpellEntry = {
  id: "spell-prismatic-wall",
  name: "Prismatic Wall",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_prismatic-wall", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["10 minutes"],
  description: [
    "A shimmering, multicolored plane of light forms a vertical opaque wall—up to 90 feet long, 30 feet high, and 1 inch thick—centered on a point within range. Alternatively, you shape the wall into a globe up to 30 feet in diameter centered on a point within range. The wall lasts for the duration. If you position the wall in a space occupied by a creature, the spell ends instantly without effect.",
    "The wall sheds Bright Light within 100 feet and Dim Light for an additional 100 feet. You and creatures you designate when you cast the spell can pass through and be near the wall without harm. If another creature that can see the wall moves within 20 feet of it or starts its turn there, the creature must succeed on a Constitution saving throw or have the Blinded condition for 1 minute.",
    "The wall consists of seven layers, each with a different color. When a creature reaches into or passes through the wall, it does so one layer at a time through all the layers. Each layer forces the creature to make a Dexterity saving throw or be affected by that layer's properties as described in the Prismatic Layers table.",
    "The wall, which has AC 10, can be destroyed one layer at a time, in order from red to violet, by means specific to each layer. If a layer is destroyed, it is gone for the duration. Antimagic Field has no effect on the wall, and Dispel Magic can affect only the violet layer.",
    "| Order | Effects | |---|---| | 1 | <strong>Red.</strong> <em>Failed Save:</em> <strong>12d6</strong> Fire damage. <em>Successful Save:</em> Half as much damage. Additional Effects: Nonmagical ranged attacks can't pass through this layer, which is destroyed if it takes at least 25 Cold damage. | | 2 | <strong>Orange.</strong> <em>Failed Save:</em> <strong>12d6</strong> Acid damage. <em>Successful Save:</em> Half as much damage. Additional Effects: Magical ranged attacks can't pass through this layer, which is destroyed by a strong wind (such as the one created by Gust of Wind). | | 3 | <strong>Yellow.</strong> <em>Failed Save:</em> <strong>12d6</strong> Lightning damage. <em>Successful Save:</em> Half as much damage. Additional Effects: The layer is destroyed if it takes at least 60 Force damage. | | 4 | <strong>Green.</strong> <em>Failed Save:</em> <strong>12d6</strong> Poison damage. <em>Successful Save:</em> Half as much damage. Additional Effects: A Passwall spell, or another spell of equal or greater level that can open a portal on a solid surface, destroys this layer. | | 5 | <strong>Blue.</strong> <em>Failed Save:</em> <strong>12d6</strong> Cold damage. <em>Successful Save:</em> Half as much damage. Additional Effects: The layer is destroyed if it takes at least 25 Fire damage. | | 6 | <strong>Indigo.</strong> <em>Failed Save:</em> The target has the Restrained condition and makes a Constitution saving throw at the end of each of its turns. If it successfully saves three times, the condition ends. If it fails three times, it has the Petrified condition until it is freed by an effect like the Greater Restoration spell. The successes and failures needn't be consecutive; keep track of both until the target collects three of a kind. Additional Effects: Spells can't be cast through this layer, which is destroyed by Bright Light shed by the Daylight spell. | | 7 | <strong>Violet.</strong> <em>Failed Save:</em> The target has the Blinded condition and makes a Wisdom saving throw at the start of your next turn. On a successful save, the condition ends. On a failed save, the condition ends, and the creature teleports to another plane of existence (GM's choice). Additional Effects: This layer is destroyed by Dispel Magic. |"
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
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
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.POISON],
    [DICE.D6, DAMAGE_TYPE.POISON],
    [DICE.D6, DAMAGE_TYPE.POISON],
    [DICE.D6, DAMAGE_TYPE.POISON],
    [DICE.D6, DAMAGE_TYPE.POISON],
    [DICE.D6, DAMAGE_TYPE.POISON],
    [DICE.D6, DAMAGE_TYPE.POISON],
    [DICE.D6, DAMAGE_TYPE.POISON],
    [DICE.D6, DAMAGE_TYPE.POISON],
    [DICE.D6, DAMAGE_TYPE.POISON],
    [DICE.D6, DAMAGE_TYPE.POISON],
    [DICE.D6, DAMAGE_TYPE.POISON],
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
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const psychicScream: SpellEntry = {
  id: "spell-psychic-scream",
  name: "Psychic Scream",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You unleash the power of your mind to blast the intellect of up to ten creatures of your choice that you can see within range. Creatures that have an Intelligence score of 2 or lower are unaffected.",
    "Each target must make an Intelligence saving throw. On a failed save, a target takes <strong>14d6</strong> Psychic damage and is Stunned. On a successful save, a target takes half as much damage and isn't Stunned. If a target is killed by this damage, its head explodes, assuming it has one.",
    "A Stunned target can make an Intelligence saving throw at the end of each of its turns. On a successful save, the stunning effect ends."
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
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const ravenousVoid: SpellEntry = {
  id: "spell-ravenous-void",
  name: "Ravenous Void",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "1,000 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You create a 20-foot-radius sphere of destructive gravitation force centered on a point you can see within range. For the spell's duration, the sphere and any space within 100 feet of it are difficult terrain, and nonmagical objects fully inside the sphere are destroyed if they aren't being worn or carried.",
    "When the sphere appears and at the start of each of your turns until the spell ends, unsecured objects within 100 feet of the sphere are pulled toward the sphere's center, ending in an unoccupied space as close to the center as possible.",
    "A creature that starts its turn within 100 feet of the sphere must succeed on a Strength saving throw or be pulled straight toward the sphere's center, ending in an unoccupied space as close to the center as possible. A creature that enters the sphere for the first time on a turn or starts its turn there takes <strong>5d10</strong> Force damage and is Restrained until it is no longer in the sphere. If the sphere is in the air, the Restrained creature hovers inside the sphere.",
    "A creature can use its action to make a Strength check against your spell save DC, ending this Restrained condition on itself or another creature in the sphere that it can reach. A creature reduced to 0 Hit Points by this spell is annihilated, along with any nonmagical items it is wearing or carrying."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.STR,
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
  spellLevel: 9
};

export const shapechange: SpellEntry = {
  id: "spell-shapechange",
  name: "Shapechange",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_shapechange", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a jade circlet worth 1,500+ GP",
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You shape-shift into another creature for the duration or until you take a Magic action to shape-shift into a different eligible form. The new form must be of a creature that has a Challenge Rating no higher than your level or Challenge Rating. You must have seen the sort of creature before, and it can't be a Construct or an Undead. When you cast the spell, you gain a number of Temporary Hit Points equal to the Hit Points of the first form into which you shape-shift. These Temporary Hit Points vanish if any remain when the spell ends. Your game statistics are replaced by the stat block of the chosen form, but you retain your creature type; alignment; personality; Intelligence, Wisdom, and Charisma scores; Hit Points; Hit Point Dice; proficiencies; and ability to communicate. If you have the Spellcasting feature, you retain it too. Upon shape-shifting, you determine whether your equipment drops to the ground or changes in size and shape to fit the new form while you're in it."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const stormOfVengeance: SpellEntry = {
  id: "spell-storm-of-vengeance",
  name: "Storm of Vengeance",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_storm-of-vengeance", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "1 mile",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A churning storm cloud forms for the duration, centered on a point within range and spreading to a radius of 300 feet. Each creature under the cloud when it appears must succeed on a Constitution saving throw or take <strong>2d6</strong> Thunder damage and have the Deafened condition for the duration.",
    "At the start of each of your later turns, the storm produces different effects, as detailed below.",
    "<strong>_Turn 2._</strong> Acidic rain falls. Each creature and object under the cloud takes <strong>4d6</strong> Acid damage.",
    "<strong>_Turn 3._</strong> You call six bolts of lightning from the cloud to strike six different creatures or objects beneath it. Each target makes a Dexterity saving throw, taking <strong>10d6</strong> Lightning damage on a failed save or half as much damage on a successful one.",
    "<strong>_Turn 4._</strong> Hailstones rain down. Each creature under the cloud takes <strong>2d6</strong> Bludgeoning damage.",
    "<strong>_Turns 5–10._</strong> Gusts and freezing rain assail the area under the cloud. Each creature there takes <strong>1d6</strong> Cold damage. Until the spell ends, the area is Difficult Terrain and Heavily Obscured, ranged attacks with weapons are impossible there, and strong wind blows through the area."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.THUNDER],
    [DICE.D6, DAMAGE_TYPE.THUNDER],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.COLD]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 9
};

export const timeRavage: SpellEntry = {
  id: "spell-time-ravage",
  name: "Time Ravage",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "legacy-local", documentName: "Legacy / Expanded Local", ruleset: "legacy-local" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You target a creature you can see within range, putting its physical form through the devastation of rapid aging. The target must make a Constitution saving throw, taking <strong>10d12</strong> Necrotic damage on a failed save, or half as much damage on a successful one.",
    "If the save fails, the target also ages to the point where it has only 30 days left before it dies of old age. In this aged state, the target has disadvantage on attack rolls, Ability Checks, and saving throws, and its walking speed is halved. Only the wish spell or the greater restoration spell cast with a 9th-level spell slot can end these effects and restore the target to its previous age."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D12, DAMAGE_TYPE.NECROTIC],
    [DICE.D12, DAMAGE_TYPE.NECROTIC],
    [DICE.D12, DAMAGE_TYPE.NECROTIC],
    [DICE.D12, DAMAGE_TYPE.NECROTIC],
    [DICE.D12, DAMAGE_TYPE.NECROTIC],
    [DICE.D12, DAMAGE_TYPE.NECROTIC],
    [DICE.D12, DAMAGE_TYPE.NECROTIC],
    [DICE.D12, DAMAGE_TYPE.NECROTIC],
    [DICE.D12, DAMAGE_TYPE.NECROTIC],
    [DICE.D12, DAMAGE_TYPE.NECROTIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const timeStop: SpellEntry = {
  id: "spell-time-stop",
  name: "Time Stop",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_time-stop", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You briefly stop the flow of time for everyone but yourself. No time passes for other creatures, while you take <strong>1d4 + 1</strong> turns in a row, during which you can use actions and move as normal. This spell ends if one of the actions you use during this period, or any effects that you create during it, affects a creature other than you or an object being worn or carried by someone other than you. In addition, the spell ends if you move to a place more than 1,000 feet from the location where you cast it."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const truePolymorph: SpellEntry = {
  id: "spell-true-polymorph",
  name: "True Polymorph",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_true-polymorph", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "a drop of mercury, a dollop of gum arabic, and a wisp of smoke",
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "Choose one creature or nonmagical object that you can see within range. The creature shape-shifts into a different creature or a nonmagical object, or the object shape-shifts into a creature (the object must be neither worn nor carried). The transformation lasts for the duration or until the target dies or is destroyed, but if you maintain Concentration on this spell for the full duration, the spell lasts until dispelled.",
    "An unwilling creature can make a Wisdom saving throw, and if it succeeds, it isn't affected by this spell.",
    "<strong>_Creature into Creature._</strong> If you turn a creature into another kind of creature, the new form can be any kind you choose that has a Challenge Rating equal to or less than the target's Challenge Rating or level. The target's game statistics are replaced by the stat block of the new form, but it retains its Hit Points, Hit Point Dice, alignment, and personality.",
    "The target gains a number of Temporary Hit Points equal to the Hit Points of the new form. These Temporary Hit Points vanish if any remain when the spell ends. The target is limited in the actions it can perform by the anatomy of its new form, and it can't speak or cast spells.",
    "The target's gear melds into the new form. The creature can't use or otherwise benefit from any of that equipment.",
    "<strong>_Object into Creature._</strong> You can turn an object into any kind of creature, as long as the creature's size is no larger than the object's size and the creature has a Challenge Rating of 9 or lower. The creature is Friendly to you and your allies. In combat, it takes its turns immediately after yours, and it obeys your commands.",
    "If the spell lasts more than an hour, you no longer control the creature. It might remain Friendly to you, depending on how you have treated it.",
    "<strong>_Creature into Object._</strong> If you turn a creature into an object, it transforms along with whatever it is wearing and carrying into that form, as long as the object's size is no larger than the creature's size. The creature's statistics become those of the object, and the creature has no memory of time spent in this form after the spell ends and it returns to normal."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const trueResurrection: SpellEntry = {
  id: "spell-true-resurrection",
  name: "True Resurrection",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_true-resurrection", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.HOUR],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  materialSpecified: "diamonds worth 25,000+ GP, which the spell consumes",
  duration: ["Instantaneous"],
  description: [
    "You touch a creature that has been dead for no longer than 200 years and that died for any reason except old age. The creature is revived with all its Hit Points. This spell closes all wounds, neutralizes any poison, cures all magical contagions, and lifts any curses affecting the creature when it died. The spell replaces damaged or missing organs and limbs. If the creature was Undead, it is restored to its non-Undead form. The spell can provide a new body if the original no longer exists, in which case you must speak the creature's name. The creature then appears in an unoccupied space you choose within 10 feet of you."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 9
};

export const weird: SpellEntry = {
  id: "spell-weird",
  name: "Weird",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_weird", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You try to create illusory terrors in others' minds. Each creature of your choice in a 30-foot-radius Sphere centered on a point within range makes a Wisdom saving throw. On a failed save, a target takes <strong>10d10</strong> Psychic damage and has the Frightened condition for the duration. On a successful save, a target takes half as much damage only. A Frightened target makes a Wisdom saving throw at the end of each of its turns. On a failed save, it takes <strong>5d10</strong> Psychic damage. On a successful save, the spell ends on that target."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const wish: SpellEntry = {
  id: "spell-wish",
  name: "Wish",
  category: ENTRY_CATEGORIES.SPELLS,
  source: { documentKey: "srd-2024", documentName: "5e 2024 Rules", ruleset: "5e-2024", open5eKey: "srd-2024_wish", publisherKey: "wizards-of-the-coast", permalink: "https://dnd.wizards.com/resources/systems-reference-document" },
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "<em>Wish</em> is the mightiest spell a mortal can cast. By simply speaking aloud, you can alter reality itself.",
    "The basic use of this spell is to duplicate any other spell of level 8 or lower. If you use it this way, you don't need to meet any requirements to cast that spell, including costly components. The spell simply takes effect.",
    "Alternatively, you can create one of the following effects of your choice:",
    "<strong>_Object Creation._</strong> You create one object of up to 25,000 GP in value that isn't a magic item. The object can be no more than 300 feet in any dimension, and it appears in an unoccupied space that you can see on the ground.",
    "<strong>_Instant Health._</strong> You allow yourself and up to twenty creatures that you can see to regain all Hit Points, and you end all effects on them listed in the <em>Greater Restoration</em> spell.",
    "<strong>_Resistance._</strong> You grant up to ten creatures that you can see Resistance to one damage type that you choose. This Resistance is permanent.",
    "<strong>_Spell Immunity._</strong> You grant up to ten creatures you can see immunity to a single spell or other magical effect for 8 hours.",
    "<strong>_Sudden Learning._</strong> You replace one of your feats with another feat for which you are eligible. You lose all the benefits of the old feat and gain the benefits of the new one. You can't replace a feat that is a prerequisite for any of your other feats or features.",
    "<strong>_Roll Redo._</strong> You undo a single recent event by forcing a reroll of any die roll made within the last round (including your last turn). Reality reshapes itself to accommodate the new result. For example, a <em>Wish</em> spell could undo an ally's failed saving throw or a foe's Critical Hit. You can force the reroll to be made with Advantage or Disadvantage, and you choose whether to use the reroll or the original roll.",
    "<strong>_Reshape Reality._</strong> You may wish for something not included in any of the other effects. To do so, state your wish to the GM as precisely as possible. The GM has great latitude in ruling what occurs in such an instance; the greater the wish, the greater the likelihood that something goes wrong. This spell might simply fail, the effect you desire might be achieved only in part, or you might suffer an unforeseen consequence as a result of how you worded the wish. For example, wishing that a villain were dead might propel you forward in time to a period when that villain is no longer alive, effectively removing you from the game.",
    "Similarly, wishing for a Legendary magic item or an Artifact might instantly transport you to the presence of the item's current owner. If your wish is granted and its effects have consequences for a whole community, region, or world, you are likely to attract powerful foes. If your wish would affect a god, the god's divine servants might instantly intervene to prevent it or to encourage you to craft the wish in a particular way. If your wish would undo the multiverse itself, your wish fails.",
    "The stress of casting <em>Wish</em> to produce any effect other than duplicating another spell weakens you. After enduring that stress, each time you cast a spell until you finish a Long Rest, you take <strong>1d10</strong> Necrotic damage per level of that spell. This damage can't be reduced or prevented in any way. In addition, your Strength score becomes 3 for <strong>2d4</strong> days. For each of those days that you spend resting and doing nothing more than light activity, your remaining recovery time decreases by 2 days. Finally, there is a 33 percent chance that you are unable to cast <em>Wish</em> ever again if you suffer this stress."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.NECROTIC]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const spellEntries9: SpellEntry[] = [
  astralProjection,
  bladeOfDisaster,
  foresight,
  gate,
  imprisonment,
  invulnerability,
  massHeal,
  massPolymorph,
  meteorSwarm,
  powerWordHeal,
  powerWordKill,
  prismaticWall,
  psychicScream,
  ravenousVoid,
  shapechange,
  stormOfVengeance,
  timeRavage,
  timeStop,
  truePolymorph,
  trueResurrection,
  weird,
  wish
];
