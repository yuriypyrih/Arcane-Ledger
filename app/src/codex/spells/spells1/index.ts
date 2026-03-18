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
  cureWounds
];
