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
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.HOUR],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Special"],
  description: [
    "You and up to eight willing creatures within range project your astral bodies into the Astral Plane. The spell fails and the casting is wasted if you are already on that plane. The material body you leave behind is Unconscious and in a state of suspended animation. It doesn't need food or air and doesn't age.",
    "Your astral body resembles your mortal form in almost every way, replicating your game statistics and possessions. The principal difference is the addition of a silvery cord that extends from between your shoulder blades and trails behind you, fading to Invisibility after 1 foot. This cord is your tether to your material body. As long as the tether remains intact, you can find your way home. If the cord is cut, something that can happen only when an effect specifically states that it does, your soul and body are separated, killing you instantly.",
    "Your astral form can freely travel through the Astral Plane and can pass through portals there leading to any other plane. If you enter a new plane or return to the plane you were on when casting this spell, your body and possessions are transported along the silver cord, allowing you to re-enter your body as you enter the new plane. Your astral form is a separate incarnation. Any damage or other effects that apply to it have no effect on your physical body, nor do they persist when you return to it. The spell ends for you and your companions when you use your action to dismiss it. When the spell ends, the affected creature returns to its physical body, and it awakens.",
    "The spell might also end early for you or one of your companions. A successful dispel magic spell used against an astral or physical body ends the spell for that creature. If a creature's original body or its astral form drops to 0 Hit Points, the spell ends for that creature. If the spell ends and the silver cord is intact, the cord pulls the creature's astral form back to its body, ending its state of suspended animation. If you are returned to your body prematurely, your companions remain in their astral forms and must find their own way back to their bodies, usually by dropping to 0 Hit Points."
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
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["8 hours"],
  description: [
    "You touch a willing creature and bestow a limited ability to see into the immediate future. For the duration, the target can't be Surprised and has advantage on attack rolls, Ability Checks, and saving throws.",
    "Additionally, other creatures have disadvantage on attack rolls against the target for the duration. This spell immediately ends if you cast it again before its duration ends."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 9
};

export const gate: SpellEntry = {
  id: "spell-gate",
  name: "Gate",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You conjure a portal linking an unoccupied space you can see within range to a precise location on a different plane of existence. The portal is a circular opening, which you can make 5 to 20 feet in diameter. You can orient the portal in any direction you choose. The portal lasts for the duration.",
    "The portal has a front and a back on each plane where it appears. Travel through the portal is possible only by moving through its front. Anything that does so is instantly transported to the other plane, appearing in the unoccupied space nearest to the portal.",
    "Deities and other planar rulers can prevent portals created by this spell from opening in their presence or anywhere within their domains.",
    "When you cast this spell, you can speak the name of a specific creature. A pseudonym, title, or nickname doesn't work. If that creature is on a plane other than the one you are on, the portal opens in the named creature's immediate vicinity and draws the creature through it to the nearest unoccupied space on your side of the portal. You gain no special power over the creature, and it is free to act as the DM deems appropriate. It might leave, attack you, or help you."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 9
};

export const imprisonment: SpellEntry = {
  id: "spell-imprisonment",
  name: "Imprisonment",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Until dispelled"],
  description: [
    "You create a magical restraint to hold a creature that you can see within range. The target must succeed on a Wisdom saving throw or be bound by the spell. If it succeeds, it is immune to this spell if you cast it again. While affected by this spell, the creature doesn't need to breathe, eat, or drink, and it doesn't age. Divination spells can't locate or perceive the target.",
    "During the casting of the spell, in any of its versions, you can specify a condition that will cause the spell to end and release the target. The condition can be as specific or as elaborate as you choose, but the DM must agree that the condition is reasonable and has a likelihood of coming to pass. The conditions can be based on a creature's name, identity, or deity but otherwise must be based on observable actions or qualities and not based on intangibles such as level, class, or Hit Points.",
    "A dispel magic spell can end the spell only if it is cast as a 9th-level spell, targeting either the prison or the special component used to create it.",
    "You can use a particular special component to create only one prison at a time. If you cast the spell again using the same component, the target of the first casting is immediately freed from its binding.",
    "When you cast the spell, you choose one of the following forms of imprisonment:",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Burial.</strong> The target is entombed far beneath the earth in a sphere of magical force that is just large enough to contain the target. Nothing can pass through the sphere, nor can any creature teleport or use planar travel to get into or out of it. The special component for this version of the spell is a small mithral orb.",
        "<strong>Chaining.</strong> Heavy chains, firmly rooted in the ground, hold the target in place. The target is Restrained until the spell ends, and it can't move or be moved by any means until then. The special component for this version of the spell is a fine chain of precious metal.",
        "<strong>Hedged Prison.</strong> The spell transports the target into a tiny demiplane that is warded against teleportation and planar travel. The demiplane can be a labyrinth, a cage, a tower, or any similar confined structure or area of your choice. The special component for this version of the spell is a miniature representation of the prison made from jade.",
        "<strong>Minimus Containment.</strong> The target shrinks to a height of 1 inch and is imprisoned inside a gemstone or similar object. Light can pass through the gemstone normally, allowing the target to see out and other creatures to see in, but nothing else can pass through, even by means of teleportation or planar travel. The gemstone can't be cut or broken while the spell remains in effect. The special component for this version of the spell is a large, transparent gemstone, such as a corundum, diamond, or ruby.",
        "<strong>Slumber.</strong> The target falls asleep and can't be awoken. The special component for this version of the spell consists of rare soporific herbs."
      ]
    }
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
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: ["You are immune to all damage until the spell ends."],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const massHeal: SpellEntry = {
  id: "spell-mass-heal",
  name: "Mass Heal",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "A flood of healing energy flows from you into injured creatures around you. You restore up to 700 Hit Points, divided as you choose among any number of creatures that you can see within range.",
    "Creatures healed by this spell are also cured of all diseases and any effect making them Blinded or Deafened. This spell has no effect on Undead or Constructs."
  ],
  isHealingSpell: true,
  damage: [],
  healing: [700],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 9
};

export const massPolymorph: SpellEntry = {
  id: "spell-mass-polymorph",
  name: "Mass Polymorph",
  category: ENTRY_CATEGORIES.SPELLS,
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
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "1 mile",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "Blazing orbs of fire plummet to the ground at four different points you can see within range. Each creature in a 40-foot-radius sphere centered on each point you choose must make a Dexterity saving throw. The sphere spreads around corners.",
    "A creature takes <strong>20d6</strong> Fire damage and <strong>20d6</strong> Bludgeoning damage on a failed save, or half as much damage on a successful one. A creature in the area of more than one fiery burst is affected only once.",
    "The spell damages objects in the area and ignites flammable objects that aren't being worn or carried."
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
  name: "Power Word: Heal",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "A wave of healing energy washes over a creature you touch. The target regains all its Hit Points. If the creature is Charmed, Frightened, Paralyzed, or Stunned, the condition ends.",
    "If the creature is Prone, it can use its reaction to stand up. This spell has no effect on Undead or Constructs."
  ],
  isHealingSpell: true,
  damage: [],
  healing: { label: "All HP" },
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC],
  spellLevel: 9
};

export const powerWordKill: SpellEntry = {
  id: "spell-power-word-kill",
  name: "Power Word: Kill",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You utter a word of power that can compel one creature you can see within range to die instantly. If the creature you chose has 100 Hit Points or fewer, it dies. Otherwise, the spell has no effect."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 9
};

export const prismaticWall: SpellEntry = {
  id: "spell-prismatic-wall",
  name: "Prismatic Wall",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["10 minutes"],
  description: [
    "A shimmering, multicolored plane of light forms a vertical opaque wall, up to 90 feet long, 30 feet high, and 1 inch thick, centered on a point you can see within range. Alternatively, you can shape the wall into a sphere up to 30 feet in diameter centered on a point you choose within range. The wall remains in place for the duration. If you position the wall so that it passes through a space occupied by a creature, the spell fails, and your action and the spell slot are wasted.",
    "The wall sheds bright light out to a range of 100 feet and dim light for an additional 100 feet. You and creatures you designate at the time you cast the spell can pass through and remain near the wall without harm. If another creature that can see the wall moves to within 20 feet of it or starts its turn there, the creature must succeed on a Constitution saving throw or become Blinded for 1 minute.",
    "The wall consists of seven layers, each with a different color. When a creature attempts to reach into or pass through the wall, it does so one layer at a time through all the wall's layers. As it passes or reaches through each layer, the creature must make a Dexterity saving throw or be affected by that layer's properties as described below.",
    "The wall can be destroyed, also one layer at a time, in order from red to violet, by means specific to each layer. Once a layer is destroyed, it remains so for the duration of the spell. An Antimagic Field has no effect on it.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Red.</strong> The creature takes <strong>10d6</strong> Fire damage on a failed save, or half as much damage on a successful one. While this layer is in place, nonmagical ranged attacks can't pass through the wall. The layer can be destroyed by dealing at least 25 Cold damage to it.",
        "<strong>Orange.</strong> The creature takes <strong>10d6</strong> Acid damage on a failed save, or half as much damage on a successful one. While this layer is in place, magical ranged attacks can't pass through the wall. The layer is destroyed by a strong wind.",
        "<strong>Yellow.</strong> The creature takes <strong>10d6</strong> Lightning damage on a failed save, or half as much damage on a successful one. This layer can be destroyed by dealing at least 60 Force damage to it.",
        "<strong>Green.</strong> The creature takes <strong>10d6</strong> Poison damage on a failed save, or half as much damage on a successful one. A passwall spell, or another spell of equal or greater level that can open a portal on a solid surface, destroys this layer.",
        "<strong>Blue.</strong> The creature takes <strong>10d6</strong> Cold damage on a failed save, or half as much damage on a successful one. This layer can be destroyed by dealing at least 25 Fire damage to it.",
        "<strong>Indigo.</strong> On a failed save, the creature is Restrained. It must then make a Constitution saving throw at the end of each of its turns. If it successfully saves three times, the spell ends. If it fails its save three times, it permanently turns to stone and is subjected to the Petrified condition. The successes and failures don't need to be consecutive; keep track of both until the creature collects three of a kind. While this layer is in place, spells can't be cast through the wall. The layer is destroyed by bright light shed by a daylight spell or a similar spell of equal or higher level.",
        "<strong>Violet.</strong> On a failed save, the creature is Blinded. It must then make a Wisdom saving throw at the start of your next turn. A successful save ends the blindness. If it fails that save, the creature is transported to another plane of the DM's choosing and is no longer Blinded. Typically, a creature that is on a plane that isn't its home plane is banished home, while other creatures are usually cast into the Astral or Ethereal planes. This layer is destroyed by a dispel magic spell or similar spell of equal or higher level that can end spells and magical effects."
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
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 9
};

export const psychicScream: SpellEntry = {
  id: "spell-psychic-scream",
  name: "Psychic Scream",
  category: ENTRY_CATEGORIES.SPELLS,
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
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 9
};

export const ravenousVoid: SpellEntry = {
  id: "spell-ravenous-void",
  name: "Ravenous Void",
  category: ENTRY_CATEGORIES.SPELLS,
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
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You assume the form of a different creature for the duration. The new form can be any creature with a Challenge Rating equal to your level or lower. The creature can't be a Construct or an Undead, and you must have seen the sort of creature at least once. You transform into an average example of that creature, one without any class levels or the Spellcasting trait.",
    "Your game statistics are replaced by the statistics of the chosen creature, though you retain your alignment and Intelligence, Wisdom, and Charisma scores. You also retain all of your skill and saving throw proficiencies, in addition to gaining those of the creature. If the creature has the same proficiency as you, and the bonus listed in its statistics is higher than yours, use the creature's bonus in place of yours. You can't use any legendary actions or lair actions of the new form.",
    "You assume the Hit Points and Hit Dice of the new form. When you revert to your normal form, you return to the number of Hit Points you had before you transformed. If you revert as a result of dropping to 0 Hit Points, any excess damage carries over to your normal form. As long as the excess damage doesn't reduce your normal form to 0 Hit Points, you aren't knocked Unconscious.",
    "You retain the benefit of any features from your class, race, or other source and can use them, provided that your new form is physically capable of doing so. You can't use any special senses you have unless your new form also has that sense. You can only speak if the creature can normally speak.",
    "When you transform, you choose whether your equipment falls to the ground, merges into the new form, or is worn by it. Worn equipment functions as normal. The DM determines whether it is practical for the new form to wear a piece of equipment, based on the creature's shape and size. Your equipment doesn't change shape or size to match the new form, and any equipment that the new form can't wear must either fall to the ground or merge into your new form. Equipment that merges has no effect in that state.",
    "During this spell's duration, you can use your action to assume a different form following the same restrictions and rules for the original form, with one exception: if your new form has more Hit Points than your current one, your Hit Points remain at their current value."
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
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Sight",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A churning storm cloud forms, centered on a point you can see and spreading to a radius of 360 feet. Lightning flashes in the area, thunder booms, and strong winds roar. Each creature under the cloud, no more than 5,000 feet beneath the cloud, when it appears must make a Constitution saving throw. On a failed save, a creature takes <strong>2d6</strong> Thunder damage and becomes Deafened for 5 minutes.",
    "Each round you maintain concentration on this spell, the storm produces different effects on your turn:",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Round 2.</strong> Acidic rain falls from the cloud. Each creature and object under the cloud takes <strong>1d6</strong> Acid damage.",
        "<strong>Round 3.</strong> You call six bolts of lightning from the cloud to strike six creatures or objects of your choice beneath the cloud. A given creature or object can't be struck by more than one bolt. A struck creature must make a Dexterity saving throw. The creature takes <strong>10d6</strong> Lightning damage on a failed save, or half as much damage on a successful one.",
        "<strong>Round 4.</strong> Hailstones rain down from the cloud. Each creature under the cloud takes <strong>2d6</strong> Bludgeoning damage.",
        "<strong>Rounds 5-10.</strong> Gusts and freezing rain assail the area under the cloud. The area becomes difficult terrain and is heavily obscured. Each creature there takes <strong>1d6</strong> Cold damage. Ranged weapon attacks in the area are impossible. The wind and rain count as a severe distraction for the purposes of maintaining Concentration on spells. Finally, gusts of strong wind, ranging from 20 to 50 miles per hour, automatically disperse fog, mists, and similar phenomena in the area whether mundane or magical."
      ]
    }
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.THUNDER],
    [DICE.D6, DAMAGE_TYPE.THUNDER],
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
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You briefly stop the flow of time for everyone but yourself. No time passes for other creatures, while you take <strong>1d4</strong> + 1 turns in a row, during which you can use actions and move as normal.",
    "This spell ends if one of the actions you use during this period, or any effects that you create during this period, affects a creature other than you or an object being worn or carried by someone other than you. In addition, the spell ends if you move to a place more than 1,000 feet from the location where you cast it."
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
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "Choose one creature or nonmagical object that you can see within range. You transform the creature into a different creature, the creature into a nonmagical object, or the object into a creature. The object must be neither worn nor carried by another creature. The transformation lasts for the duration, or until the target drops to 0 Hit Points or dies. If you concentrate on this spell for the full duration, the transformation becomes permanent.",
    "Shapechangers aren't affected by this spell. An unwilling creature can make a Wisdom saving throw, and if it succeeds, it isn't affected by this spell.",
    "This spell can't affect a target that has 0 Hit Points.",
    {
      type: "list",
      style: "bullet",
      items: [
        "<strong>Creature into Creature.</strong> If you turn a creature into another kind of creature, the new form can be any kind you choose whose Challenge Rating is equal to or less than the target's, or its level if it doesn't have a Challenge Rating. The target's game statistics, including mental ability scores, are replaced by the statistics of the new form. It retains its alignment and personality. The target assumes the Hit Points of its new form, and when it reverts to its normal form, the creature returns to the number of Hit Points it had before it transformed. If it reverts as a result of dropping to 0 Hit Points, any excess damage carries over to its normal form. As long as the excess damage doesn't reduce the creature's normal form to 0 Hit Points, it isn't knocked Unconscious. The creature is limited in the actions it can perform by the nature of its new form, and it can't speak, cast spells, or take any other action that requires hands or speech unless its new form is capable of such actions. The target's gear melds into the new form. The creature can't activate, use, wield, or otherwise benefit from any of its equipment.",
        "<strong>Object into Creature.</strong> You can turn an object into any kind of creature, as long as the creature's size is no larger than the object's size and the creature's Challenge Rating is 9 or lower. The creature is friendly to you and your companions. It acts on each of your turns. You decide what action it takes and how it moves. The DM has the creature's statistics and resolves all of its actions and movement. If the spell becomes permanent, you no longer control the creature. It might remain friendly to you, depending on how you have treated it.",
        "<strong>Creature into Object.</strong> If you turn a creature into an object, it transforms along with whatever it is wearing and carrying into that form, as long as the object's size is no larger than the creature's size. The creature's statistics become those of the object, and the creature has no memory of time spent in this form after the spell ends and it returns to its normal form."
      ]
    }
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
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.HOUR],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You touch a creature that has been dead for no longer than 200 years and that died for any reason except old age. If the creature's soul is free and willing, the creature is restored to life with all its Hit Points.",
    "This spell closes all wounds, neutralizes any poison, cures all diseases, and lifts any curses affecting the creature when it died. The spell replaces damaged or missing organs or limbs. If the creature was Undead, it is restored to its non-Undead form.",
    "The spell can even provide a new body if the original no longer exists, in which case you must speak the creature's name. The creature then appears in an unoccupied space you choose within 10 feet of you."
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
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Drawing on the deepest fears of a group of creatures, you create illusory creatures in their minds, visible only to them.",
    "Each creature in a 30-foot-radius sphere centered on a point of your choice within range must make a Wisdom saving throw. On a failed save, a creature becomes Frightened for the duration.",
    "The illusion calls on the creature's deepest fears, manifesting its worst nightmares as an implacable threat. At the end of each of the Frightened creature's turns, it must succeed on a Wisdom saving throw or take <strong>4d10</strong> Psychic damage. On a successful save, the spell ends for that creature."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
  damage: [
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
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "Wish is the mightiest spell a mortal creature can cast. By simply speaking aloud, you can alter the very foundations of reality in accord with your desires.",
    "The basic use of this spell is to duplicate any other spell of 8th level or lower. You don't need to meet any requirements in that spell, including costly components. The spell simply takes effect.",
    "Alternatively, you can create one of the following effects of your choice:",
    {
      type: "list",
      style: "bullet",
      items: [
        "You create one object of up to 25,000 gp in value that isn't a magic item. The object can be no more than 300 feet in any dimension, and it appears in an unoccupied space you can see on the ground.",
        "You allow up to twenty creatures that you can see to regain all Hit Points, and you end all effects on them described in the greater restoration spell.",
        "You grant up to ten creatures that you can see resistance to a damage type you choose.",
        "You grant up to ten creatures you can see immunity to a single spell or other magical effect for 8 hours.",
        "You undo a single recent event by forcing a reroll of any roll made within the last round, including your last turn. Reality reshapes itself to accommodate the new result. You can force the reroll to be made with advantage or disadvantage, and you can choose whether to use the reroll or the original roll."
      ]
    },
    "You might be able to achieve something beyond the scope of the above examples. State your wish to the DM as precisely as possible. The DM has great latitude in ruling what occurs in such an instance. The greater the wish, the greater the likelihood that something goes wrong. This spell might simply fail, the effect you desire might only be partly achieved, or you might suffer some unforeseen consequence as a result of how you worded the wish.",
    "The stress of casting this spell to produce any effect other than duplicating another spell weakens you. After enduring that stress, each time you cast a spell until you finish a Long Rest, you take <strong>1d10</strong> Necrotic damage per level of that spell. This damage can't be reduced or prevented in any way. In addition, your Strength drops to 3, if it isn't 3 or lower already, for <strong>2d4</strong> days. For each of those days that you spend resting and doing nothing more than light activity, your remaining recovery time decreases by 2 days. Finally, there is a 33 percent chance that you are unable to cast wish ever again if you suffer this stress."
  ],
  damage: [],
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
