import {
  DAMAGE_TYPE,
  DICE,
  ENTRY_CATEGORIES,
  MAGIC_SCHOOL,
  SPELL_COMPONENT,
  SPELL_LIST_CLASS
} from "../../entries/enums";
import type { SpellEntry } from "../../entries/types";

export const absorbElements: SpellEntry = {
  id: "spell-absorb-elements",
  name: "Absorb Elements",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime:
    "1 reaction, which you take when you take acid, cold, fire, lightning, or thunder damage",
  range: "Self",
  components: [SPELL_COMPONENT.S],
  duration: "1 round",
  description: [
    "The spell captures some of the incoming energy, lessening its effect on you and storing it for your next melee attack. You have Resistance to the triggering damage type until the start of your next turn. Also, the first time you hit with a melee attack on your next turn, the target takes an extra 1d6 damage of the triggering type, and the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the extra damage increases by 1d6 for each slot level above 1st."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const acidStream: SpellEntry = {
  id: "spell-acid-stream",
  name: "Acid Stream",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 action",
  range: "Self (30-foot line)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "A stream of acid emanates from you in a line 30 feet long and 5 feet wide in a direction you choose. Each creature in the line must succeed on a Dexterity saving throw or be covered in acid for the spell's duration or until a creature uses its action to scrape or wash the acid off itself or another creature. A creature covered in the acid takes 3d4 Acid damage at the start of each of its turns.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d4 for each slot level above 1st."
  ],
  damage: [
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const alarm: SpellEntry = {
  id: "spell-alarm",
  name: "Alarm",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: "1 minute",
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "8 hours",
  description: [
    "You set an alarm against unwanted intrusion. Choose a door, a window, or an area within range that is no larger than a 20-foot cube. Until the spell ends, an alarm alerts you whenever a Tiny or larger creature touches or enters the warded area. When you cast the spell, you can designate creatures that won't set off the alarm. You also choose whether the alarm is mental or audible.",
    "A mental alarm alerts you with a ping in your mind if you are within 1 mile of the warded area. This ping awakens you if you are sleeping. An audible alarm produces the sound of a hand bell for 10 seconds within 60 feet."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const animalFriendship: SpellEntry = {
  id: "spell-animal-friendship",
  name: "Animal Friendship",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: "1 action",
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "24 hours",
  description: [
    "This spell lets you convince a Beast that you mean it no harm. Choose a Beast that you can see within range. It must see and hear you. If the Beast's Intelligence is 4 or higher, the spell fails. Otherwise, the Beast must succeed on a Wisdom saving throw or be Charmed by you for the spell's duration. If you or one of your companions harms the target, the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, you can affect one additional Beast for each slot level above 1st."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const arcaneWeapon: SpellEntry = {
  id: "spell-arcane-weapon",
  name: "Arcane Weapon",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: "1 bonus action",
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 1 hour",
  description: [
    "You channel arcane energy into one Simple or Martial weapon you're holding, and choose one damage type: Acid, Cold, Fire, Lightning, Poison, or Thunder. Until the spell ends, you deal an extra 1d6 damage of the chosen type to any target you hit with the weapon. If the weapon isn't magical, it becomes a magic weapon for the spell's duration.",
    "As a Bonus Action, you can change the damage type, choosing from the options above.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, you can maintain your Concentration on the spell for up to 8 hours."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER],
  spellLevel: 1
};

export const armorOfAgathys: SpellEntry = {
  id: "spell-armor-of-agathys",
  name: "Armor of Agathys",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: "1 action",
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "1 hour",
  description: [
    "A protective magical force surrounds you, manifesting as a spectral frost that covers you and your gear. You gain 5 Temporary Hit Points for the duration. If a creature hits you with a melee attack while you have these Hit Points, the creature takes 5 Cold damage.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, both the Temporary Hit Points and the Cold damage increase by 5 for each slot."
  ],
  damage: [[5, DAMAGE_TYPE.COLD]],
  spellLists: [SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 1
};

export const armsOfHadar: SpellEntry = {
  id: "spell-arms-of-hadar",
  name: "Arms of Hadar",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: "1 action",
  range: "Self (10-foot radius)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "You invoke the power of Hadar, the Dark Hunger. Tendrils of dark energy erupt from you and batter all creatures within 10 feet of you. Each creature in that area must make a Strength saving throw. On a failed save, a target takes 2d6 Necrotic damage and can't take reactions until its next turn. On a successful save, the creature takes half damage, but suffers no other effect.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC]
  ],
  spellLists: [SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 1
};

export const bane: SpellEntry = {
  id: "spell-bane",
  name: "Bane",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: "1 action",
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "Up to three creatures of your choice that you can see within range must make Charisma saving throws. Whenever a target that fails this saving throw makes an attack roll or a saving throw before the spell ends, the target must roll a d4 and subtract the number rolled from the attack roll or saving throw.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC],
  spellLevel: 1
};

export const beastBond: SpellEntry = {
  id: "spell-beast-bond",
  name: "Beast Bond",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: "1 action",
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 10 minutes",
  description: [
    "You establish a telepathic link with one Beast you touch that is friendly to you or Charmed by you. The spell fails if the Beast's Intelligence is 4 or higher. Until the spell ends, the link is active while you and the Beast are within line of sight of each other. Through the link, the Beast can understand your telepathic messages to it, and it can telepathically communicate simple emotions and concepts back to you. While the link is active, the Beast gains Advantage on attack rolls against any creature within 5 feet of you that you can see."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const bless: SpellEntry = {
  id: "spell-bless",
  name: "Bless",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: "1 action",
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "You bless up to three creatures of your choice within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const burningHands: SpellEntry = {
  id: "spell-burning-hands",
  name: "Burning Hands",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 action",
  range: "Self (15-foot cone)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "As you hold your hands with thumbs touching and fingers spread, a thin sheet of flames shoots forth from your outstretched fingertips. Each creature in a 15-foot cone must make a Dexterity saving throw. A creature takes 3d6 Fire damage on a failed save, or half as much damage on a successful one.",
    "The fire ignites any flammable objects in the area that aren't being worn or carried.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const catapult: SpellEntry = {
  id: "spell-catapult",
  name: "Catapult",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: "1 action",
  range: "60 feet",
  components: [SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "Choose one object weighing 1 to 5 pounds within range that isn't being worn or carried. The object flies in a straight line up to 90 feet in a direction you choose before falling to the ground, stopping early if it impacts against a solid surface. If the object would strike a creature, that creature must make a Dexterity saving throw. On a failed save, the object strikes the target and stops moving. When the object strikes something, the object and what it strikes each take 3d8 Bludgeoning damage.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the maximum weight of objects that you can target with this spell increases by 5 pounds, and the damage increases by 1d8, for each slot level above 1st."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING]
  ],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const causeFear: SpellEntry = {
  id: "spell-cause-fear",
  name: "Cause Fear",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: "1 action",
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: "Concentration, up to 1 minute",
  description: [
    "You awaken the sense of mortality in one creature you can see within range. A construct or an Undead is immune to this effect. The target must succeed on a Wisdom saving throw or become Frightened of you until the spell ends. The Frightened target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st. The creatures must be within 30 feet of each other when you target them."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const ceremony: SpellEntry = {
  id: "spell-ceremony",
  name: "Ceremony",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: "1 hour",
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous (see below)",
  description: [
    "You perform one of several religious ceremonies. When you cast the spell, choose one of the following ceremonies, the target of which must be within 10 feet of you throughout the casting.",
    "Atonement. You touch one willing creature whose alignment has changed, and you make a DC 20 Wisdom (Insight) check. On a successful check, you restore the target to its original alignment.",
    "Bless Water. You touch one vial of water and cause it to become holy water.",
    "Coming of Age. You touch one Humanoid who is a young adult. For the next 24 hours, whenever the target makes an ability check, it can roll a d4 and add the number rolled to the ability check. A creature can benefit from this rite only once.",
    "Dedication. You touch one Humanoid who wishes to be dedicated to your god's service. For the next 24 hours, whenever the target makes a saving throw, it can roll a d4 and add the number rolled to the save. A creature can benefit from this rite only once.",
    "Funeral Rite. You touch one corpse, and for the next 7 days, the target can't become Undead by any means short of a Wish spell.",
    "Wedding. You touch adult Humanoids willing to be bonded together in marriage. For the next 7 days, each target gains a +2 bonus to AC while they are within 30 feet of each other. A creature can benefit from this rite again only if widowed."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const chaosBolt: SpellEntry = {
  id: "spell-chaos-bolt",
  name: "Chaos Bolt",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 action",
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "You hurl an undulating, warbling mass of chaotic energy at one creature in range. Make a ranged spell attack against the target. On a hit, the target takes 2d8 + 1d6 damage. Choose one of the d8s. The number rolled on that die determines the attack's damage type as follows: 1 Acid, 2 Cold, 3 Fire, 4 Force, 5 Lightning, 6 Poison, 7 Psychic, 8 Thunder.",
    "If you roll the same number on both d8s, the chaotic energy leaps from the target to a different creature of your choice within 30 feet of it. Make a new attack roll against the new target, and make a new damage roll, which could cause the chaotic energy to leap again.",
    "A creature can be targeted only once by each casting of this spell.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, each target takes 1d6 extra damage of the type rolled for each slot level above 1st."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER],
  spellLevel: 1
};

export const charmPerson: SpellEntry = {
  id: "spell-charm-person",
  name: "Charm Person",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: "1 action",
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "1 hour",
  description: [
    "You attempt to charm a Humanoid you can see within range. It must make a Wisdom saving throw, and does so with Advantage if you or your companions are fighting it. If it fails the saving throw, it is Charmed by you until the spell ends or until you or your companions do anything harmful to it. The Charmed creature regards you as a friendly acquaintance. When the spell ends, the creature knows it was Charmed by you.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st. The creatures must be within 30 feet of each other when you target them."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const chromaticOrb: SpellEntry = {
  id: "spell-chromatic-orb",
  name: "Chromatic Orb",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 action",
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "You hurl a 4-inch-diameter sphere of energy at a creature that you can see within range. You choose Acid, Cold, Fire, Lightning, Poison, or Thunder for the type of orb you create, and then make a ranged spell attack against the target. If the attack hits, the creature takes 3d8 damage of the type you chose.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const colorSpray: SpellEntry = {
  id: "spell-color-spray",
  name: "Color Spray",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: "1 action",
  range: "Self (15-foot cone)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "1 round",
  description: [
    "A dazzling array of flashing, colored light springs from your hand. Roll 6d10; the total is how many Hit Points of creatures this spell can affect. Creatures in a 15-foot cone originating from you are affected in ascending order of their current Hit Points, ignoring Unconscious creatures and creatures that can't see.",
    "Starting with the creature that has the lowest current Hit Points, each creature affected by this spell is Blinded until the end of your next turn. Subtract each creature's Hit Points from the total before moving on to the creature with the next lowest Hit Points. A creature's Hit Points must be equal to or less than the remaining total for the creature to be affected.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d10 for each slot level above 1st."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const command: SpellEntry = {
  id: "spell-command",
  name: "Command",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: "1 action",
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: "1 round",
  description: [
    "You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw or follow the command on its next turn. The spell has no effect if the target is Undead, if it doesn't understand your language, or if your command is directly harmful to it. Some typical commands and their effects follow. You might issue a command other than one described here. If you do so, the DM determines how the target behaves. If the target can't follow your command, the spell ends.",
    "Approach. The target moves toward you by the shortest and most direct route, ending its turn if it moves within 5 feet of you.",
    "Drop. The target drops whatever it is holding and then ends its turn.",
    "Flee. The target spends its turn moving away from you by the fastest available means.",
    "Grovel. The target falls Prone and then ends its turn.",
    "Halt. The target doesn't move and takes no actions. A flying creature stays aloft, provided that it is able to do so. If it must move to stay aloft, it flies the minimum distance needed to remain in the air.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, you can affect one additional creature for each slot level above 1st. The creatures must be within 30 feet of each other when you target them."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const compelledDuel: SpellEntry = {
  id: "spell-compelled-duel",
  name: "Compelled Duel",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: "1 bonus action",
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: "Concentration, up to 1 minute",
  description: [
    "You attempt to compel a creature into a duel. One creature that you can see within range must make a Wisdom saving throw. On a failed save, the creature is drawn to you, compelled by your divine demand. For the duration, it has Disadvantage on attack rolls against creatures other than you, and must make a Wisdom saving throw each time it attempts to move to a space that is more than 30 feet away from you; if it succeeds on this saving throw, this spell doesn't restrict the target's movement for that turn.",
    "The spell ends if you attack any other creature, if you cast a spell that targets a hostile creature other than the target, if a creature friendly to you damages the target or casts a harmful spell on it, or if you end your turn more than 30 feet away from the target."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const comprehendLanguages: SpellEntry = {
  id: "spell-comprehend-languages",
  name: "Comprehend Languages",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: "1 action",
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "1 hour",
  description: [
    "For the duration, you understand the literal meaning of any spoken language that you hear. You also understand any written language that you see, but you must be touching the surface on which the words are written. It takes about 1 minute to read one page of text.",
    "This spell doesn't decode secret messages in a text or glyph, such as an arcane sigil, that isn't part of a written language."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const createOrDestroyWater: SpellEntry = {
  id: "spell-create-or-destroy-water",
  name: "Create or Destroy Water",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: "1 action",
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "You either create or destroy water.",
    "Create Water. You create up to 10 gallons of clean water within range in an open container. Alternatively, the water falls as rain in a 30-foot cube within range, extinguishing exposed flames in the area.",
    "Destroy Water. You destroy up to 10 gallons of water in an open container within range. Alternatively, you destroy fog in a 30-foot cube within range.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, you create or destroy 10 additional gallons of water, or the size of the cube increases by 5 feet, for each slot level above 1st."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 1
};

export const cureWounds: SpellEntry = {
  id: "spell-cure-wounds",
  name: "Cure Wounds",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 action",
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "A creature you touch regains a number of Hit Points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on Undead or constructs.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d8 for each slot level above 1st."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.RANGER
  ],
  spellLevel: 1
};

export const detectMagic: SpellEntry = {
  id: "spell-detect-magic",
  name: "Detect Magic",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: "1 action",
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 10 minutes",
  description: [
    "For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic, and you learn its school of magic, if any.",
    "The spell can penetrate most barriers, but is blocked by 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const detectPoisonAndDisease: SpellEntry = {
  id: "spell-detect-poison-and-disease",
  name: "Detect Poison and Disease",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: "1 action",
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 10 minutes",
  description: [
    "For the duration, you can sense the presence and location of poisons, poisonous creatures, and diseases within 30 feet of you. You also identify the kind of poison, poisonous creature, or disease in each case.",
    "The spell can penetrate most barriers, but is blocked by 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.RANGER
  ],
  spellLevel: 1
};

export const disguiseSelf: SpellEntry = {
  id: "spell-disguise-self",
  name: "Disguise Self",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: "1 action",
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "1 hour",
  description: [
    "You make yourself, including your clothing, armor, weapons, and other belongings on your person, look different until the spell ends or until you use your action to dismiss it. You can seem 1 foot shorter or taller and can appear thin, fat, or in between. You can't change your body type, so you must adopt a form that has the same basic arrangement of limbs. Otherwise, the extent of the illusion is up to you.",
    "The changes wrought by this spell fail to hold up to physical inspection. For example, if you use this spell to add a hat to your outfit, objects pass through the hat, and anyone who touches it would feel nothing or would feel your head and hair. If you use this spell to appear thinner than you are, the hand of someone who reaches out to touch you would bump into you while it was seemingly still in midair. To discern that you are disguised, a creature can use its action to inspect your appearance and must succeed on an Intelligence (Investigation) check against your spell save DC."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const dissonantWhispers: SpellEntry = {
  id: "spell-dissonant-whispers",
  name: "Dissonant Whispers",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: "1 action",
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: "Instantaneous",
  description: [
    "You whisper a discordant melody that only one creature of your choice within range can hear, wracking it with terrible pain. The target must make a Wisdom saving throw. On a failed save, it takes 3d6 Psychic damage and must immediately use its reaction, if available, to move as far as its Speed allows away from you. The creature doesn't move into obviously dangerous ground, such as a fire or a pit. On a successful save, the target takes half as much damage and doesn't have to move away. A Deafened creature automatically succeeds on the save.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  spellLists: [SPELL_LIST_CLASS.BARD],
  spellLevel: 1
};

export const distortValue: SpellEntry = {
  id: "spell-distort-value",
  name: "Distort Value",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: "1 minute",
  range: "Touch",
  components: [SPELL_COMPONENT.V],
  duration: "8 hours",
  description: [
    "You cast this spell on an object no more than 1 foot on a side, doubling the object's perceived value by adding illusionary flourish or reducing its perceived value by half with the help of illusionary dents and scratches. Anyone examining the object must roll an Investigation check against your spell DC.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a higher spell slot, you increase the size of the object by 1 foot per spell slot over 1st."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const divineFavor: SpellEntry = {
  id: "spell-divine-favor",
  name: "Divine Favor",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 bonus action",
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 1 minute",
  description: [
    "Your prayer empowers you with divine radiance. Until the spell ends, your weapon attacks deal an extra 1d4 Radiant damage on a hit."
  ],
  damage: [[DICE.D4, DAMAGE_TYPE.RADIANT]],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const earthTremor: SpellEntry = {
  id: "spell-earth-tremor",
  name: "Earth Tremor",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 action",
  range: "Self (10-foot radius)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "You cause a tremor in the ground in a 10-foot radius. Each creature other than you in that area must make a Dexterity saving throw. On a failed save, a creature takes 1d6 Bludgeoning damage and is knocked Prone. If the ground in that area is loose earth or stone, it becomes difficult terrain until cleared.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.BLUDGEONING]],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const ensnaringStrike: SpellEntry = {
  id: "spell-ensnaring-strike",
  name: "Ensnaring Strike",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: "1 bonus action",
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: "Concentration, up to 1 minute",
  description: [
    "The next time you hit a creature with a weapon attack before this spell ends, a writhing mass of thorny vines appears at the point of impact, and the target must succeed on a Strength saving throw or be Restrained by the magical vines until the spell ends. A Large or larger creature has Advantage on this saving throw. If the target succeeds on the save, the vines shrivel away.",
    "While Restrained by this spell, the target takes 1d6 Piercing damage at the start of each of its turns. A creature Restrained by the vines or one that can touch the creature can use its action to make a Strength check against your spell save DC. On a success, the target is freed.",
    "<strong>At Higher Levels.</strong> If you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.PIERCING]],
  spellLists: [SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const entangle: SpellEntry = {
  id: "spell-entangle",
  name: "Entangle",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: "1 action",
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 1 minute",
  description: [
    "Grasping weeds and vines sprout from the ground in a 20-foot square starting from a point within range. For the duration, these plants turn the ground in the area into difficult terrain.",
    "A creature in the area when you cast the spell must succeed on a Strength saving throw or be Restrained by the entangling plants until the spell ends. A creature Restrained by the plants can use its action to make a Strength check against your spell save DC. On a success, it frees itself.",
    "When the spell ends, the conjured plants wilt away."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const expeditiousRetreat: SpellEntry = {
  id: "spell-expeditious-retreat",
  name: "Expeditious Retreat",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: "1 bonus action",
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 10 minutes",
  description: [
    "This spell allows you to move at an incredible pace. When you cast this spell, and then as a Bonus Action on each of your turns until the spell ends, you can take the Dash action."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const faerieFire: SpellEntry = {
  id: "spell-faerie-fire",
  name: "Faerie Fire",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 action",
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: "Concentration, up to 1 minute",
  description: [
    "Each object in a 20-foot cube within range is outlined in blue, green, or violet light, your choice.",
    "Any creature in the area when the spell is cast is also outlined in light if it fails a Dexterity saving throw. For the duration, objects and affected creatures shed dim light in a 10-foot radius.",
    "Any attack roll against an affected creature or object has Advantage if the attacker can see it, and the affected creature or object can't benefit from being Invisible."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID],
  spellLevel: 1
};

export const falseLife: SpellEntry = {
  id: "spell-false-life",
  name: "False Life",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: "1 action",
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "1 hour",
  description: [
    "Bolstering yourself with a necromantic facsimile of life, you gain 1d4 + 4 Temporary Hit Points for the duration.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, you gain 5 additional Temporary Hit Points for each slot level above 1st."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const featherFall: SpellEntry = {
  id: "spell-feather-fall",
  name: "Feather Fall",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: "1 reaction, which you take when you or a creature within 60 feet of you falls",
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.M],
  duration: "1 minute",
  description: [
    "Choose up to five falling creatures within range. A falling creature's rate of descent slows to 60 feet per round until the spell ends. If the creature lands before the spell ends, it takes no falling damage and can land on its feet, and the spell ends for that creature."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const findFamiliar: SpellEntry = {
  id: "spell-find-familiar",
  name: "Find Familiar",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: "1 hour",
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "You gain the service of a familiar, a spirit that takes an animal form you choose: bat, cat, crab, frog (toad), hawk, lizard, octopus, owl, poisonous snake, fish (quipper), rat, raven, sea horse, spider, or weasel. Appearing in an unoccupied space within range, the familiar has the statistics of the chosen form, though it is a Celestial, Fey, or Fiend, your choice, instead of a Beast.",
    "Your familiar acts independently of you, but it always obeys your commands. In combat, it rolls its own Initiative and acts on its own turn. A familiar can't attack, but it can take other actions as normal.",
    "When the familiar drops to 0 Hit Points, it disappears, leaving behind no physical form. It reappears after you cast this spell again. As an action, you can temporarily dismiss your familiar to a pocket dimension. Alternatively, you can dismiss it forever. As an action while it is temporarily dismissed, you can cause it to reappear in any unoccupied space within 30 feet of you. Whenever the familiar drops to 0 Hit Points or disappears into the pocket dimension, it leaves behind in its space anything it was wearing or carrying.",
    "While your familiar is within 100 feet of you, you can communicate with it telepathically. Additionally, as an action, you can see through your familiar's eyes and hear what it hears until the start of your next turn, gaining the benefits of any special senses that the familiar has. During this time, you are Deaf and Blind with regard to your own senses.",
    "You can't have more than one familiar at a time. If you cast this spell while you already have a familiar, you instead cause it to adopt a new form. Choose one of the forms from the above list. Your familiar transforms into the chosen creature.",
    "Finally, when you cast a spell with a range of Touch, your familiar can deliver the spell as if it had cast the spell. Your familiar must be within 100 feet of you, and it must use its reaction to deliver the spell when you cast it. If the spell requires an attack roll, you use your attack modifier for the roll."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const fogCloud: SpellEntry = {
  id: "spell-fog-cloud",
  name: "Fog Cloud",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: "1 action",
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 1 hour",
  description: [
    "You create a 20-foot-radius sphere of fog centered on a point within range. The sphere spreads around corners, and its area is heavily obscured. It lasts for the duration or until a wind of moderate or greater speed, at least 10 miles per hour, disperses it.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the radius of the fog increases by 20 feet for each slot level above 1st."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const frostFingers: SpellEntry = {
  id: "spell-frost-fingers",
  name: "Frost Fingers",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 action",
  range: "Self (15-foot cone)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "Freezing cold blasts from your fingertips in a 15-foot cone. Each creature in that area must make a Constitution saving throw, taking 2d8 Cold damage on a failed save, or half as much damage on a successful one.",
    "The cold freezes nonmagical liquids in the area that aren't being worn or carried.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.COLD],
    [DICE.D8, DAMAGE_TYPE.COLD]
  ],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const giftOfAlacrity: SpellEntry = {
  id: "spell-gift-of-alacrity",
  name: "Gift of Alacrity",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: "1 minute",
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "8 hours",
  description: [
    "You touch a willing creature. For the duration, the target can add 1d8 to its Initiative rolls."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const goodberry: SpellEntry = {
  id: "spell-goodberry",
  name: "Goodberry",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: "1 action",
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "Up to ten berries appear in your hand and are infused with magic for the duration. A creature can use its action to eat one berry. Eating a berry restores 1 Hit Point, and the berry provides enough nourishment to sustain a creature for one day.",
    "The berries lose their potency if they have not been consumed within 24 hours of the casting of this spell."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const grease: SpellEntry = {
  id: "spell-grease",
  name: "Grease",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: "1 action",
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "1 minute",
  description: [
    "Slick grease covers the ground in a 10-foot square centered on a point within range and turns it into difficult terrain for the duration.",
    "When the grease appears, each creature standing in its area must succeed on a Dexterity saving throw or fall Prone. A creature that enters the area or ends its turn there must also succeed on a Dexterity saving throw or fall Prone."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const guidingBolt: SpellEntry = {
  id: "spell-guiding-bolt",
  name: "Guiding Bolt",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 action",
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "1 round",
  description: [
    "A flash of light streaks toward a creature of your choice within range. Make a ranged spell attack against the target. On a hit, the target takes 4d6 Radiant damage, and the next attack roll made against this target before the end of your next turn has Advantage, thanks to the mystical dim light glittering on the target until then.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT]
  ],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 1
};

export const guidingHand: SpellEntry = {
  id: "spell-guiding-hand",
  name: "Guiding Hand",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: "1 minute",
  range: "5 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 8 hours",
  description: [
    "You create a Tiny incorporeal hand of shimmering light in an unoccupied space you can see within range. The hand exists for the duration, but it disappears if you teleport or you travel to a different plane of existence.",
    "When the hand appears, you name one major landmark, such as a city, mountain, castle, or battlefield on the same plane of existence as you. Someone in history must have visited the site and mapped it. If the landmark appears on no map in existence, the spell fails. Otherwise, whenever you move toward the hand, it moves away from you at the same speed you moved, and it moves in the direction of the landmark, always remaining 5 feet away from you.",
    "If you don't move toward the hand, it remains in place until you do and beckons for you to follow once every 1d4 minutes."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const hailOfThorns: SpellEntry = {
  id: "spell-hail-of-thorns",
  name: "Hail of Thorns",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: "1 bonus action",
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: "Concentration, up to 1 minute",
  description: [
    "The next time you hit a creature with a ranged weapon attack before the spell ends, this spell creates a rain of thorns that sprouts from your ranged weapon or ammunition. In addition to the normal effect of the attack, the target of the attack and each creature within 5 feet of it must make a Dexterity saving throw. A creature takes 1d10 Piercing damage on a failed save, or half as much damage on a successful one.",
    "<strong>At Higher Levels.</strong> If you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d10 for each slot level above 1st, to a maximum of 6d10."
  ],
  damage: [[DICE.D10, DAMAGE_TYPE.PIERCING]],
  spellLists: [SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const healingElixir: SpellEntry = {
  id: "spell-healing-elixir",
  name: "Healing Elixir",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: "1 minute",
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "24 hours",
  description: [
    "You create a healing elixir in a simple vial that appears in your hand. The elixir retains its potency for the duration or until it's consumed, at which point the vial vanishes.",
    "As an action, a creature can drink the elixir or administer it to another creature. The drinker regains 2d4 + 2 Hit Points."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const healingWord: SpellEntry = {
  id: "spell-healing-word",
  name: "Healing Word",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 bonus action",
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: "Instantaneous",
  description: [
    "A creature of your choice that you can see within range regains Hit Points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on Undead or constructs.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d4 for each slot level above 1st."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 1
};

export const hellishRebuke: SpellEntry = {
  id: "spell-hellish-rebuke",
  name: "Hellish Rebuke",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime:
    "1 reaction, which you take when you are damaged by a creature within 60 feet of you that you can see",
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "You point your finger, and the creature that damaged you is momentarily surrounded by hellish flames. The creature must make a Dexterity saving throw. It takes 2d10 Fire damage on a failed save, or half as much damage on a successful one.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d10 for each slot level above 1st."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.FIRE],
    [DICE.D10, DAMAGE_TYPE.FIRE]
  ],
  spellLists: [SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 1
};

export const heroism: SpellEntry = {
  id: "spell-heroism",
  name: "Heroism",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: "1 action",
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 1 minute",
  description: [
    "A willing creature you touch is imbued with bravery. Until the spell ends, the creature is immune to being Frightened and gains Temporary Hit Points equal to your spellcasting ability modifier at the start of each of its turns. When the spell ends, the target loses any remaining Temporary Hit Points from this spell.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const hex: SpellEntry = {
  id: "spell-hex",
  name: "Hex",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: "1 bonus action",
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 hour",
  description: [
    "You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 Necrotic damage to the target whenever you hit it with an attack. Also, choose one ability when you cast the spell. The target has Disadvantage on ability checks made with the chosen ability.",
    "If the target drops to 0 Hit Points before this spell ends, you can use a Bonus Action on a subsequent turn of yours to curse a new creature.",
    "A Remove Curse cast on the target ends this spell early.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd or 4th level, you can maintain your Concentration on the spell for up to 8 hours. When you use a spell slot of 5th level or higher, you can maintain your Concentration on the spell for up to 24 hours."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.NECROTIC]],
  spellLists: [SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 1
};

export const huntersMark: SpellEntry = {
  id: "spell-hunters-mark",
  name: "Hunter's Mark",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: "1 bonus action",
  range: "90 feet",
  components: [SPELL_COMPONENT.V],
  duration: "Concentration, up to 1 hour",
  description: [
    "You choose a creature you can see within range and mystically mark it as your quarry. Until the spell ends, you deal an extra 1d6 damage to the target whenever you hit it with a weapon attack, and you have Advantage on any Wisdom (Perception) or Wisdom (Survival) check you make to find it.",
    "If the target drops to 0 Hit Points before this spell ends, you can use a Bonus Action on a subsequent turn of yours to mark a new creature.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd or 4th level, you can maintain your Concentration on the spell for up to 8 hours. When you use a spell slot of 5th level or higher, you can maintain your Concentration on the spell for up to 24 hours."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const iceKnife: SpellEntry = {
  id: "spell-ice-knife",
  name: "Ice Knife",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: "1 action",
  range: "60 feet",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "You create a shard of ice and fling it at one creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Piercing damage. Hit or miss, the shard then explodes. The target and each creature within 5 feet of the point where the ice exploded must succeed on a Dexterity saving throw or take 2d6 Cold damage.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the Cold damage increases by 1d6 for each slot level above 1st."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.PIERCING],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD]
  ],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const idInsinuation: SpellEntry = {
  id: "spell-id-insinuation",
  name: "Id Insinuation",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: "1 action",
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 1 minute",
  description: [
    "You unleash a torrent of conflicting desires in the mind of one creature you can see within range, impairing its ability to make decisions. The target must succeed on a Wisdom saving throw or be Incapacitated. At the end of each of its turns, it takes 1d12 Psychic damage, and it can then make another Wisdom saving throw. On a success, the spell ends on the target."
  ],
  damage: [[DICE.D12, DAMAGE_TYPE.PSYCHIC]],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const identify: SpellEntry = {
  id: "spell-identify",
  name: "Identify",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: "1 minute",
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "You choose one object that you must touch throughout the casting of the spell. If it is a magic item or some other magic-imbued object, you learn its properties and how to use them, whether it requires Attunement to use, and how many charges it has, if any. You learn whether any spells are affecting the item and what they are. If the item was created by a spell, you learn which spell created it.",
    "If you instead touch a creature throughout the casting, you learn what spells, if any, are currently affecting it."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const illusoryScript: SpellEntry = {
  id: "spell-illusory-script",
  name: "Illusory Script",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: "1 minute",
  range: "Touch",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "10 days",
  description: [
    "You write on parchment, paper, or some other suitable writing material and imbue it with a potent illusion that lasts for the duration.",
    "To you and any creatures you designate when you cast the spell, the writing appears normal, written in your hand, and conveys whatever meaning you intended when you wrote the text. To all others, the writing appears as if it were written in an unknown or magical script that is unintelligible. Alternatively, you can cause the writing to appear to be an entirely different message, written in a different hand and language, though the language must be one you know.",
    "Should the spell be dispelled, the original script and the illusion both disappear. A creature with Truesight can read the hidden message."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const infallibleRelay: SpellEntry = {
  id: "spell-infallible-relay",
  name: "Infallible Relay",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: "1 minute",
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 10 minutes",
  description: [
    "With this spell, you can target any creature with whom you have spoken previously, as long as the two of you are on the same plane of existence. When you cast the spell, the nearest functioning telephone or similar communications device within 100 feet of the target begins to ring. If there is no suitable device close enough to the target, the spell fails.",
    "The target must make a successful Charisma saving throw or be compelled to answer your call. Once the connection is established, the call is crystal clear and cannot be dropped until the conversation has ended or the spell's duration ends. You can end the conversation at any time, but a target must succeed on a Charisma saving throw to end the conversation."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const inflictWounds: SpellEntry = {
  id: "spell-inflict-wounds",
  name: "Inflict Wounds",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: "1 action",
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "Make a melee spell attack against a creature you can reach. On a hit, the target takes 3d10 Necrotic damage.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d10 for each slot level above 1st."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC],
    [DICE.D10, DAMAGE_TYPE.NECROTIC]
  ],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 1
};

export const jimsMagicMissile: SpellEntry = {
  id: "spell-jims-magic-missile",
  name: "Jim's Magic Missile",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 action",
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Instantaneous",
  description: [
    "You create three twisting, whistling, hypoallergenic, gluten-free darts of magical force. Each dart can target a creature of your choice that you can see within range. Make a ranged spell attack for each missile. On a hit, the missile does 2d4 Force damage.",
    "If the attack roll scores a critical, the missile does 5d4 Force damage instead of the 4d4 Force that you would normally get on a critical. If any of the attack rolls is a natural one, all missiles turn around and hit the caster for 1 Force damage per missile.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st. This also increases the tax by 1 GP per spell slot over 1st."
  ],
  damage: [
    [DICE.D4, DAMAGE_TYPE.FORCE],
    [DICE.D4, DAMAGE_TYPE.FORCE]
  ],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const jump: SpellEntry = {
  id: "spell-jump",
  name: "Jump",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: "1 action",
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "1 minute",
  description: [
    "You touch a creature. The creature's jump distance is tripled until the spell ends."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const longstrider: SpellEntry = {
  id: "spell-longstrider",
  name: "Longstrider",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: "1 action",
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "1 hour",
  description: [
    "You touch a creature. The target's Speed increases by 10 feet until the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const mageArmor: SpellEntry = {
  id: "spell-mage-armor",
  name: "Mage Armor",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: "1 action",
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "8 hours",
  description: [
    "You touch a willing creature who isn't wearing armor, and a protective magical force surrounds it until the spell ends. The target's base AC becomes 13 + its Dexterity modifier. The spell ends if the target dons armor or if you dismiss the spell as an action."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const magicMissile: SpellEntry = {
  id: "spell-magic-missile",
  name: "Magic Missile",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 action",
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 Force damage to its target. The darts all strike simultaneously and you can direct them to hit one creature or several.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st."
  ],
  damage: [[DICE.D4, DAMAGE_TYPE.FORCE]],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const magnifyGravity: SpellEntry = {
  id: "spell-magnify-gravity",
  name: "Magnify Gravity",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: "1 action",
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "1 round",
  description: [
    "The gravity in a 10-foot-radius sphere centered on a point you can see within range increases for a moment. Each creature in the sphere on the turn when you cast the spell must make a Constitution saving throw. On a failed save, a creature takes 2d8 Force damage, and its Speed is halved until the end of its next turn. On a successful save, a creature takes half as much damage and suffers no reduction to its Speed.",
    "Until the start of your next turn, any object that isn't being worn or carried in the sphere requires a successful Strength check against your spell save DC to pick up or move.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE]
  ],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const protectionFromEvilAndGood: SpellEntry = {
  id: "spell-protection-from-evil-and-good",
  name: "Protection from Evil and Good",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: "1 action",
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 10 minutes",
  description: [
    "Until the spell ends, one willing creature you touch is protected against certain types of creatures: Aberrations, Celestials, Elementals, Fey, Fiends, and Undead.",
    "The protection grants several benefits. Creatures of those types have Disadvantage on attack rolls against the target. The target also can't be Charmed, Frightened, or possessed by them. If the target is already Charmed, Frightened, or possessed by such a creature, the target has Advantage on any new saving throw against the relevant effect."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const puppet: SpellEntry = {
  id: "spell-puppet",
  name: "Puppet",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: "1 action",
  range: "120 feet",
  components: [SPELL_COMPONENT.V],
  duration: "Instantaneous",
  description: [
    "Your gesture forces one Humanoid you can see within range to make a Constitution saving throw. On a failed save, the target must move up to its Speed in a direction you choose. In addition, you can cause the target to drop whatever it is holding. This spell has no effect on a Humanoid that is immune to being Charmed."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const purifyFoodAndDrink: SpellEntry = {
  id: "spell-purify-food-and-drink",
  name: "Purify Food and Drink",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: "1 action",
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "All nonmagical food and drink within a 5-foot-radius sphere centered on a point of your choice within range is purified and rendered free of poison and disease."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.PALADIN
  ],
  spellLevel: 1
};

export const rayOfSickness: SpellEntry = {
  id: "spell-ray-of-sickness",
  name: "Ray of Sickness",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: "1 action",
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "A ray of sickening greenish energy lashes out toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 2d8 Poison damage and must make a Constitution saving throw. On a failed save, it is also Poisoned until the end of your next turn.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.POISON],
    [DICE.D8, DAMAGE_TYPE.POISON]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const remoteAccess: SpellEntry = {
  id: "spell-remote-access",
  name: "Remote Access",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: "1 action",
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "10 minutes",
  description: [
    "You can use any electronic device within range as if it were in your hands. This is not a telekinesis effect. Rather, this spell allows you to simulate a device's mechanical functions electronically. You are able to access only functions that a person using the device manually would be able to access. You can use Remote Access with only one device at a time."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const sanctuary: SpellEntry = {
  id: "spell-sanctuary",
  name: "Sanctuary",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: "1 bonus action",
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "1 minute",
  description: [
    "You ward a creature within range against attack. Until the spell ends, any creature who targets the warded creature with an attack or a harmful spell must first make a Wisdom saving throw. On a failed save, the creature must choose a new target or lose the attack or spell. This spell doesn't protect the warded creature from area effects, such as the explosion of a Fireball.",
    "If the warded creature makes an attack, casts a spell that affects an enemy, or deals damage to another creature, this spell ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.CLERIC],
  spellLevel: 1
};

export const searingSmite: SpellEntry = {
  id: "spell-searing-smite",
  name: "Searing Smite",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 bonus action",
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: "Concentration, up to 1 minute",
  description: [
    "The next time you hit a creature with a melee weapon attack during the spell's duration, your weapon flares with white-hot intensity, and the attack deals an extra 1d6 Fire damage to the target and causes the target to ignite in flames.",
    "At the start of each of its turns until the spell ends, the target must make a Constitution saving throw. On a failed save, it takes 1d6 Fire damage. On a successful save, the spell ends. If the target or a creature within 5 feet of it uses an action to put out the flames, or if some other effect douses the flames, such as the target being submerged in water, the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the initial extra damage dealt by the attack increases by 1d6 for each slot above 1st."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.FIRE]],
  spellLists: [SPELL_LIST_CLASS.PALADIN, SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const senseEmotion: SpellEntry = {
  id: "spell-sense-emotion",
  name: "Sense Emotion",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: "1 action",
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Concentration, up to 1 minute",
  description: [
    "You attune your senses to pick up the emotions of others for the duration. When you cast the spell, and as your action on each turn until the spell ends, you can focus your senses on one Humanoid you can see within 30 feet of you. You instantly learn the target's prevailing emotion, whether it's love, anger, pain, fear, calm, or something else. If the target isn't actually Humanoid or it is immune to being Charmed, you sense that it is calm."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const shield: SpellEntry = {
  id: "spell-shield",
  name: "Shield",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime:
    "1 reaction, which you take when you are hit by an attack or targeted by the magic missile spell",
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "1 round",
  description: [
    "An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from Magic Missile."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const shieldOfFaith: SpellEntry = {
  id: "spell-shield-of-faith",
  name: "Shield of Faith",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: "1 bonus action",
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 10 minutes",
  description: [
    "A shimmering field appears and surrounds a creature of your choice within range, granting it a +2 bonus to AC for the duration."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const silentImage: SpellEntry = {
  id: "spell-silent-image",
  name: "Silent Image",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: "1 action",
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 10 minutes",
  description: [
    "You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 15-foot cube. The image appears at a spot within range and lasts for the duration. The image is purely visual; it isn't accompanied by sound, smell, or other sensory effects.",
    "You can use your action to cause the image to move to any spot within range. As the image changes location, you can alter its appearance so that its movements appear natural for the image. For example, if you create an image of a creature and move it, you can alter the image so that it appears to be walking.",
    "Physical interaction with the image reveals it to be an illusion, because things can pass through it. A creature that uses its action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const silveryBarbs: SpellEntry = {
  id: "spell-silvery-barbs",
  name: "Silvery Barbs",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime:
    "1 reaction, which you take when a creature you can see within 60 feet of yourself succeeds on an attack roll, an ability check, or a saving throw",
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: "Instantaneous",
  description: [
    "You magically distract the triggering creature and turn its momentary uncertainty into encouragement for another creature. The triggering creature must reroll the d20 and use the lower roll.",
    "You can then choose a different creature you can see within range, and you can choose yourself. The chosen creature has Advantage on the next attack roll, ability check, or saving throw it makes within 1 minute. A creature can be empowered by only one use of this spell at a time."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const sleep: SpellEntry = {
  id: "spell-sleep",
  name: "Sleep",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: "1 action",
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "1 minute",
  description: [
    "This spell sends creatures into a magical slumber. Roll 5d8, the total is how many Hit Points of creatures this spell can affect. Creatures within 20 feet of a point you choose within range are affected in ascending order of their current Hit Points, ignoring Unconscious creatures.",
    "Starting with the creature that has the lowest current Hit Points, each creature affected by this spell falls Unconscious until the spell ends, the sleeper takes damage, or someone uses an action to shake or slap the sleeper awake. Subtract each creature's Hit Points from the total before moving on to the creature with the next lowest Hit Points. A creature's Hit Points must be equal to or less than the remaining total for that creature to be affected. Undead and creatures immune to being Charmed aren't affected by this spell.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d8 for each slot level above 1st."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const snare: SpellEntry = {
  id: "spell-snare",
  name: "Snare",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: "1 minute",
  range: "Touch",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "8 hours",
  description: [
    "As you cast this spell, you use the rope to create a circle with a 5-foot radius on the ground or the floor. When you finish casting, the rope disappears and the circle becomes a magic trap.",
    "This trap is nearly invisible, requiring a successful Intelligence (Investigation) check against your spell save DC to be discerned.",
    "The trap triggers when a Small, Medium, or Large creature moves onto the ground or the floor in the spell's radius. That creature must succeed on a Dexterity saving throw or be magically hoisted into the air, leaving it hanging upside down 3 feet above the ground or the floor. The creature is Restrained there until the spell ends.",
    "A Restrained creature can make a Dexterity saving throw at the end of each of its turns, ending the effect on itself on a success. Alternatively, the creature or someone else who can reach it can use an action to make an Intelligence (Arcana) check against your spell save DC. On a success, the Restrained effect ends.",
    "After the trap is triggered, the spell ends when no creature is Restrained by it."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const speakWithAnimals: SpellEntry = {
  id: "spell-speak-with-animals",
  name: "Speak with Animals",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: "1 action",
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "10 minutes",
  description: [
    "You gain the ability to comprehend and verbally communicate with Beasts for the duration. The knowledge and awareness of many Beasts is limited by their Intelligence, but at minimum, Beasts can give you information about nearby locations and monsters, including whatever they can perceive or have perceived within the past day. You might be able to persuade a Beast to perform a small favor for you, at the DM's discretion."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const suddenAwakening: SpellEntry = {
  id: "spell-sudden-awakening",
  name: "Sudden Awakening",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: "1 bonus action",
  range: "10 feet",
  components: [SPELL_COMPONENT.V],
  duration: "Instantaneous",
  description: [
    "Each sleeping creature you choose within range awakens, and then each Prone creature within range can stand up without expending any movement."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const tashasCausticBrew: SpellEntry = {
  id: "spell-tashas-caustic-brew",
  name: "Tasha's Caustic Brew",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 action",
  range: "Self (30-foot line)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "A stream of acid emanates from you in a line 30 feet long and 5 feet wide in a direction you choose. Each creature in the line must succeed on a Dexterity saving throw or be covered in acid for the spell's duration or until a creature uses its action to scrape or wash the acid off itself or another creature. A creature covered in the acid takes 2d4 Acid damage at the start of each of its turns.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 2d4 for each slot level above 1st."
  ],
  damage: [
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID]
  ],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const tashasHideousLaughter: SpellEntry = {
  id: "spell-tashas-hideous-laughter",
  name: "Tasha's Hideous Laughter",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: "1 action",
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "A creature of your choice that you can see within range perceives everything as hilariously funny and falls into fits of laughter if this spell affects it. The target must succeed on a Wisdom saving throw or fall Prone, becoming Incapacitated and unable to stand up for the duration. A creature with an Intelligence score of 4 or less isn't affected.",
    "At the end of each of its turns, and each time it takes damage, the target can make another Wisdom saving throw. The target has Advantage on the saving throw if it's triggered by damage. On a success, the spell ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const tensersFloatingDisk: SpellEntry = {
  id: "spell-tensers-floating-disk",
  name: "Tenser's Floating Disk",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: "1 action",
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "1 hour",
  description: [
    "This spell creates a circular, horizontal plane of force, 3 feet in diameter and 1 inch thick, that floats 3 feet above the ground in an unoccupied space of your choice that you can see within range. The disk remains for the duration, and can hold up to 500 pounds. If more weight is placed on it, the spell ends, and everything on the disk falls to the ground.",
    "The disk is immobile while you are within 20 feet of it. If you move more than 20 feet away from it, the disk follows you so that it remains within 20 feet of you. It can move across uneven terrain, up or down stairs, slopes, and the like, but it can't cross an elevation change of 10 feet or more. For example, the disk can't move across a 10-foot-deep pit, nor could it leave such a pit if it were created at the bottom.",
    "If you move more than 100 feet from the disk, typically because it can't move around an obstacle to follow you, the spell ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const thunderousSmite: SpellEntry = {
  id: "spell-thunderous-smite",
  name: "Thunderous Smite",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 bonus action",
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: "Concentration, up to 1 minute",
  description: [
    "The first time you hit with a melee weapon attack during this spell's duration, your weapon rings with thunder that is audible within 300 feet of you, and the attack deals an extra 2d6 Thunder damage to the target. Additionally, if the target is a creature, it must succeed on a Strength saving throw or be pushed 10 feet away from you and knocked Prone."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.THUNDER],
    [DICE.D6, DAMAGE_TYPE.THUNDER]
  ],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const thunderwave: SpellEntry = {
  id: "spell-thunderwave",
  name: "Thunderwave",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 action",
  range: "Self (15-foot cube)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
  description: [
    "A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube originating from you must make a Constitution saving throw. On a failed save, a creature takes 2d8 Thunder damage and is pushed 10 feet away from you. On a successful save, the creature takes half as much damage and isn't pushed.",
    "In addition, unsecured objects that are completely within the area of effect are automatically pushed 10 feet away from you by the spell's effect, and the spell emits a thunderous boom audible out to 300 feet.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.THUNDER],
    [DICE.D8, DAMAGE_TYPE.THUNDER]
  ],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 1
};

export const unearthlyChorus: SpellEntry = {
  id: "spell-unearthly-chorus",
  name: "Unearthly Chorus",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: "1 action",
  range: "Self (30-foot radius)",
  components: [SPELL_COMPONENT.V],
  duration: "Concentration, up to 10 minutes",
  description: [
    "Music of a style you choose fills the air around you in a 30-foot radius. The music spreads around corners and can be heard from up to 100 feet away. The music moves with you, centered on you for the duration.",
    "Until the spell ends, you make Charisma (Performance) checks with Advantage. In addition, you can use a Bonus Action on each of your turns to beguile one creature you choose within 30 feet of you that can see you and hear the music. The creature must make a Charisma saving throw. If you or your companions are attacking it, the creature automatically succeeds on the saving throw. On a failure, the creature becomes friendly to you for as long as it can hear the music and for 1 hour thereafter. You make Charisma (Deception) checks and Charisma (Persuasion) checks against creatures made friendly by this spell with Advantage."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD],
  spellLevel: 1
};

export const unseenServant: SpellEntry = {
  id: "spell-unseen-servant",
  name: "Unseen Servant",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: "1 action",
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "1 hour",
  description: [
    "This spell creates an invisible, mindless, shapeless, Medium force that performs simple tasks at your command until the spell ends. The servant springs into existence in an unoccupied space on the ground within range. It has AC 10, 1 Hit Point, and a Strength of 2, and it can't attack. If it drops to 0 Hit Points, the spell ends.",
    "Once on each of your turns as a Bonus Action, you can mentally command the servant to move up to 15 feet and interact with an object. The servant can perform simple tasks that a human servant could do, such as fetching things, cleaning, mending, folding clothes, lighting fires, serving food, and pouring wine. Once you give the command, the servant performs the task to the best of its ability until it completes the task, then waits for your next command.",
    "If you command the servant to perform a task that would move it more than 60 feet away from you, the spell ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const wildCunning: SpellEntry = {
  id: "spell-wild-cunning",
  name: "Wild Cunning",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: "1 action",
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: "Instantaneous",
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
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 1
};

export const witchBolt: SpellEntry = {
  id: "spell-witch-bolt",
  name: "Witch Bolt",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 action",
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: "Concentration, up to 1 minute",
  description: [
    "A beam of crackling, blue energy lances out toward a creature within range, forming a sustained arc of Lightning between you and the target. Make a ranged spell attack against that creature. On a hit, the target takes 1d12 Lightning damage, and on each of your turns for the duration, you can use your action to deal 1d12 Lightning damage to the target automatically. The spell ends if you use your action to do anything else. The spell also ends if the target is ever outside the spell's range or if it has Total Cover from you.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 2nd level or higher, the initial damage increases by 1d12 for each slot level above 1st."
  ],
  damage: [[DICE.D12, DAMAGE_TYPE.LIGHTNING]],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 1
};

export const wrathfulSmite: SpellEntry = {
  id: "spell-wrathful-smite",
  name: "Wrathful Smite",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: "1 bonus action",
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: "Concentration, up to 1 minute",
  description: [
    "The next time you hit with a melee weapon attack during this spell's duration, your attack deals an extra 1d6 Psychic damage. Additionally, if the target is a creature, it must make a Wisdom saving throw or be Frightened of you until the spell ends. As an action, the creature can make a Wisdom check against your spell save DC to steel its resolve and end this spell."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.PSYCHIC]],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 1
};

export const zephyrStrike: SpellEntry = {
  id: "spell-zephyr-strike",
  name: "Zephyr Strike",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: "1 bonus action",
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: "Concentration, up to 1 minute",
  description: [
    "You move like the wind. For the duration, your movement doesn't provoke Opportunity Attacks.",
    "Once before the spell ends, you can give yourself Advantage on one weapon attack roll on your turn. That attack deals an extra 1d8 Force damage on a hit. Whether you hit or miss, your walking Speed increases by 30 feet until the end of that turn."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.FORCE]],
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
  detectMagic,
  detectPoisonAndDisease,
  disguiseSelf,
  dissonantWhispers,
  distortValue,
  divineFavor,
  earthTremor,
  ensnaringStrike,
  entangle,
  expeditiousRetreat,
  faerieFire,
  falseLife,
  featherFall,
  findFamiliar,
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
  tashasHideousLaughter,
  tensersFloatingDisk,
  thunderousSmite,
  thunderwave,
  unearthlyChorus,
  unseenServant,
  wildCunning,
  witchBolt,
  wrathfulSmite,
  zephyrStrike
];
