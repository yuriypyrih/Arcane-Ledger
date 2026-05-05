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

export const animateDead: SpellEntry = {
  id: "spell-animate-dead",
  name: "Animate Dead",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "This spell creates an Undead servant. Choose a pile of bones or a corpse of a Medium or Small Humanoid within range. Your spell imbues the target with a foul mimicry of life, raising it as an Undead creature. The target becomes a skeleton if you chose bones or a zombie if you chose a corpse, and the DM has the creature's game statistics.",
    "On each of your turns, you can use a Bonus Action to mentally command any creature you made with this spell if the creature is within 60 feet of you. If you control multiple creatures, you can command any or all of them at the same time, issuing the same command to each one. You decide what action the creature will take and where it will move during its next turn, or you can issue a general command, such as to guard a particular chamber or corridor. If you issue no commands, the creature only defends itself against hostile creatures. Once given an order, the creature continues to follow it until its task is complete.",
    "The creature is under your control for 24 hours, after which it stops obeying any command you've given it. To maintain control of the creature for another 24 hours, you must cast this spell on the creature again before the current 24-hour period ends. This use of the spell reasserts your control over up to four creatures you have animated with this spell, rather than animating a new one.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, you animate or reassert control over two additional Undead creatures for each slot level above 3rd. Each of the creatures must come from a different corpse or pile of bones."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const antagonize: SpellEntry = {
  id: "spell-antagonize",
  name: "Antagonize",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You whisper magical words that antagonize one creature of your choice within range. The target must make a Wisdom saving throw. On a failed save, the target takes <strong>4d4</strong> Psychic damage and must immediately use its Reaction to make a melee attack against another creature of your choice that you can see. If the target can't make this attack, for example, because there is no one within its reach or because its Reaction is unavailable, the target instead has Disadvantage on the next attack roll it makes before the start of your next turn. On a successful save, the target takes half as much damage only.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage increases by <strong>1d4</strong> for each slot level above 3rd."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
  damage: [
    [DICE.D4, DAMAGE_TYPE.PSYCHIC],
    [DICE.D4, DAMAGE_TYPE.PSYCHIC],
    [DICE.D4, DAMAGE_TYPE.PSYCHIC],
    [DICE.D4, DAMAGE_TYPE.PSYCHIC]
  ],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const ashardalonsStride: SpellEntry = {
  id: "spell-ashardalons-stride",
  name: "Ashardalon's Stride",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "The billowing flames of a dragon blast from your feet, granting you explosive speed. For the duration, your Speed increases by 20 feet and moving doesn't provoke Opportunity Attacks.",
    "When you move within 5 feet of a creature or an object that isn't being worn or carried, it takes <strong>1d6</strong> Fire damage from your trail of heat. A creature or object can take this damage only once during a turn.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, increase your Speed by 5 feet for each spell slot level above 3rd. The spell deals an additional <strong>1d6</strong> Fire damage for each slot level above 3rd."
  ],
  isDamagingSpell: true,
  damage: [[DICE.D6, DAMAGE_TYPE.FIRE]],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const auraOfVitality: SpellEntry = {
  id: "spell-aura-of-vitality",
  name: "Aura of Vitality",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot radius)",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Healing energy radiates from you in an aura with a 30-foot radius. Until the spell ends, the aura moves with you, centered on you. You can use a Bonus Action to cause one creature in the aura, including you, to regain <strong>2d6</strong> Hit Points."
  ],
  isHealingSpell: true,
  damage: [],
  healing: [DICE.D6, DICE.D6],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 3
};

export const beaconOfHope: SpellEntry = {
  id: "spell-beacon-of-hope",
  name: "Beacon of Hope",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "This spell bestows hope and vitality. Choose any number of creatures within range. For the duration, each target has Advantage on Wisdom saving throws and Death saving throws, and regains the maximum number of Hit Points possible from any healing."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 3
};

export const bestowCurse: SpellEntry = {
  id: "spell-bestow-curse",
  name: "Bestow Curse",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You touch a creature, and that creature must succeed on a Wisdom saving throw or become cursed for the duration of the spell. When you cast this spell, choose the nature of the curse from the following options:",
    "Choose one ability score. While cursed, the target has Disadvantage on ability checks and saving throws made with that ability score.",
    "While cursed, the target has Disadvantage on attack rolls against you.",
    "While cursed, the target must make a Wisdom saving throw at the start of each of its turns. If it fails, it wastes its action that turn doing nothing.",
    "While the target is cursed, your attacks and spells deal an extra <strong>1d8</strong> Necrotic damage to the target.",
    "A Remove Curse spell ends this effect. At the DM's option, you may choose an alternative curse effect, but it should be no more powerful than those described above. The DM has final say on such a curse's effect.",
    "<strong>At Higher Levels.</strong> If you cast this spell using a spell slot of 4th level or higher, the duration is Concentration, up to 10 minutes. If you use a spell slot of 5th level or higher, the duration is 8 hours. If you use a spell slot of 7th level or higher, the duration is 24 hours. If you use a 9th-level spell slot, the spell lasts until it is dispelled. Using a spell slot of 5th level or higher grants a duration that doesn't require Concentration."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
  damage: [[DICE.D8, DAMAGE_TYPE.NECROTIC]],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const blindingSmite: SpellEntry = {
  id: "spell-blinding-smite",
  name: "Blinding Smite",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "The next time you hit a creature with a melee weapon attack during this spell's duration, your weapon flares with a bright light, and the attack deals an extra <strong>3d8</strong> Radiant damage to the target. Additionally, the target must succeed on a Constitution saving throw or be Blinded until the spell ends.",
    "A creature Blinded by this spell makes another Constitution saving throw at the end of each of its turns. On a successful save, it is no longer Blinded."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT],
    [DICE.D8, DAMAGE_TYPE.RADIANT]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 3
};

export const blink: SpellEntry = {
  id: "spell-blink",
  name: "Blink",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 minute"],
  description: [
    "Roll a <strong>d20</strong> at the end of each of your turns for the duration of the spell. On a roll of 11 or higher, you vanish from your current plane of existence and appear in the Ethereal Plane, and the spell fails and the casting is wasted if you were already on that plane.",
    "At the start of your next turn, and when the spell ends if you are on the Ethereal Plane, you return to an unoccupied space of your choice that you can see within 10 feet of the space you vanished from. If no unoccupied space is available within that range, you appear in the nearest unoccupied space, chosen at random if more than one space is equally near. You can dismiss this spell as an action.",
    "While on the Ethereal Plane, you can see and hear the plane you originated from, which is cast in shades of gray, and you can't see anything more than 60 feet away. You can only affect and be affected by other creatures on the Ethereal Plane. Creatures that aren't there can't perceive you or interact with you, unless they have the ability to do so."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const callLightning: SpellEntry = {
  id: "spell-call-lightning",
  name: "Call Lightning",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "A storm cloud appears in the shape of a cylinder that is 10 feet tall with a 60-foot radius, centered on a point you can see within range directly above you. The spell fails if you can't see a point in the air where the storm cloud could appear, for example, if you are in a room that can't accommodate the cloud.",
    "When you cast the spell, choose a point you can see under the cloud. A bolt of Lightning flashes down from the cloud to that point. Each creature within 5 feet of that point must make a Dexterity saving throw. A creature takes <strong>3d10</strong> Lightning damage on a failed save, or half as much damage on a successful one. On each of your turns until the spell ends, you can use your action to call down Lightning in this way again, targeting the same point or a different one.",
    "If you are outdoors in stormy conditions when you cast this spell, the spell gives you control over the existing storm instead of creating a new one. Under such conditions, the spell's damage increases by <strong>1d10</strong>.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage increases by <strong>1d10</strong> for each slot level above 3rd."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.LIGHTNING],
    [DICE.D10, DAMAGE_TYPE.LIGHTNING],
    [DICE.D10, DAMAGE_TYPE.LIGHTNING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 3
};

export const catnap: SpellEntry = {
  id: "spell-catnap",
  name: "Catnap",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["10 minutes"],
  description: [
    "You make a calming gesture, and up to three willing creatures of your choice that you can see within range fall Unconscious for the spell's duration. The spell ends on a target early if it takes damage or someone uses an action to shake or slap it awake. If a target remains Unconscious for the full duration, that target gains the benefit of a Short Rest, and it can't be affected by this spell again until it finishes a Long Rest."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const clairvoyance: SpellEntry = {
  id: "spell-clairvoyance",
  name: "Clairvoyance",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "1 mile",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You create an invisible sensor within range in a location familiar to you, a place you have visited or seen before, or in an obvious location that is unfamiliar to you, such as behind a door, around a corner, or in a grove of trees. The sensor remains in place for the duration, and it can't be attacked or otherwise interacted with.",
    "When you cast the spell, you choose seeing or hearing. You can use the chosen sense through the sensor as if you were in its space. As your action, you can switch between seeing and hearing. A creature that can see the sensor, such as a creature benefiting from See Invisibility or Truesight, sees a luminous, intangible orb about the size of your fist."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const conjureAnimals: SpellEntry = {
  id: "spell-conjure-animals",
  name: "Conjure Animals",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You summon Fey spirits that take the form of Beasts and appear in unoccupied spaces that you can see within range.",
    "Choose one of the following options for what appears:",
    "One Beast of Challenge Rating 2 or lower.",
    "Two Beasts of Challenge Rating 1 or lower.",
    "Four Beasts of Challenge Rating 1/2 or lower.",
    "Eight Beasts of Challenge Rating 1/4 or lower.",
    "Each Beast is also considered Fey, and it disappears when it drops to 0 Hit Points or when the spell ends.",
    "The summoned creatures are friendly to you and your companions. Roll Initiative for the summoned creatures as a group, which has its own turns. They obey any verbal commands that you issue to them, no action required by you. If you don't issue any commands to them, they defend themselves from hostile creatures, but otherwise take no actions. The DM has the creatures' statistics.",
    "<strong>At Higher Levels.</strong> When you cast this spell using certain higher-level spell slots, you choose one of the summoning options above, and more creatures appear: twice as many with a 5th-level slot, three times as many with a 7th-level slot, and four times as many with a 9th-level slot."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 3
};

export const conjureBarrage: SpellEntry = {
  id: "spell-conjure-barrage",
  name: "Conjure Barrage",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (60-foot cone)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You throw a nonmagical weapon or fire a piece of nonmagical ammunition into the air to create a cone of identical weapons that shoot forward and then disappear. Each creature in a 60-foot cone must succeed on a Dexterity saving throw. A creature takes <strong>3d8</strong> damage on a failed save, or half as much damage on a successful one. The damage type is the same as that of the weapon or ammunition used as a component."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, [DAMAGE_TYPE.BLUDGEONING, DAMAGE_TYPE.PIERCING, DAMAGE_TYPE.SLASHING]],
    [DICE.D8, [DAMAGE_TYPE.BLUDGEONING, DAMAGE_TYPE.PIERCING, DAMAGE_TYPE.SLASHING]],
    [DICE.D8, [DAMAGE_TYPE.BLUDGEONING, DAMAGE_TYPE.PIERCING, DAMAGE_TYPE.SLASHING]]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.RANGER],
  spellLevel: 3
};

export const conjureLesserDemon: SpellEntry = {
  id: "spell-conjure-lesser-demon",
  name: "Conjure Lesser Demon",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You summon up to a total of eight manes or dretches that appear in unoccupied spaces you can see within range. A manes or dretch disappears when it drops to 0 Hit Points or when the spell ends.",
    "The demons are hostile to all creatures. Roll Initiative for the summoned demons as a group, which has its own turns. The demons attack the nearest non-demons to the best of their ability.",
    "As part of casting the spell, you can scribe a circle on the ground with the blood used as a material component. The circle is large enough to encompass your space. The summoned demons cannot cross the circle or target anyone in it while the spell lasts. Using the material component in this manner consumes it.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th or 7th level, you summon sixteen demons. If you cast it using a spell slot of 8th or 9th level, you summon thirty-two demons."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const counterspell: SpellEntry = {
  id: "spell-counterspell",
  name: "Counterspell",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [
    ACTION_TYPE.REACTION,
    "which you take when you see a creature within 60 feet of you casting a spell"
  ],
  range: "60 feet",
  components: [SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, its spell fails and has no effect. If it is casting a spell of 4th level or higher, make an ability check using your spellcasting ability. The DC equals 10 + the spell's level. On a success, the creature's spell fails and has no effect.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the interrupted spell has no effect if its level is less than or equal to the level of the spell slot you used."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const createFoodAndWater: SpellEntry = {
  id: "spell-create-food-and-water",
  name: "Create Food and Water",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You create 45 pounds of food and 30 gallons of water on the ground or in containers within range, enough to sustain up to fifteen Humanoids or five steeds for 24 hours. The food is bland but nourishing, and spoils if uneaten after 24 hours. The water is clean and doesn't go bad."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 3
};

export const crusadersMantle: SpellEntry = {
  id: "spell-crusaders-mantle",
  name: "Crusader's Mantle",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Holy power radiates from you in an aura with a 30-foot radius, awakening boldness in friendly creatures. Until the spell ends, the aura moves with you, centered on you. While in the aura, each non-hostile creature in the aura, including you, deals an extra <strong>1d4</strong> Radiant damage when it hits with a weapon attack."
  ],
  isDamagingSpell: true,
  damage: [[DICE.D4, DAMAGE_TYPE.RADIANT]],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 3
};

export const daylight: SpellEntry = {
  id: "spell-daylight",
  name: "Daylight",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 hour"],
  description: [
    "A 60-foot-radius sphere of light spreads out from a point you choose within range. The sphere is bright light and sheds dim light for an additional 60 feet.",
    "If you chose a point on an object you are holding or one that isn't being worn or carried, the light shines from the object and moves with it. Completely covering the affected object with an opaque object, such as a bowl or a helm, blocks the light.",
    "If any of this spell's area overlaps with an area of darkness created by a spell of 3rd level or lower, the spell that created the darkness is dispelled."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER
  ],
  spellLevel: 3
};

export const dispelMagic: SpellEntry = {
  id: "spell-dispel-magic",
  name: "Dispel Magic",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "Choose any creature, object, or magical effect within range. Any spell of 3rd level or lower on the target ends. For each spell of 4th level or higher on the target, make an ability check using your spellcasting ability. The DC equals 10 + the spell's level. On a successful check, the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, you automatically end the effects of a spell on the target if the spell's level is equal to or less than the level of the spell slot you used."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const elementalWeapon: SpellEntry = {
  id: "spell-elemental-weapon",
  name: "Elemental Weapon",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "A nonmagical weapon you touch becomes a magic weapon. Choose one of the following damage types: Acid, Cold, Fire, Lightning, or Thunder. For the duration, the weapon has a +1 bonus to attack rolls and deals an extra <strong>1d4</strong> damage of the chosen type when it hits.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th or 6th level, the bonus to attack rolls increases to +2 and the extra damage increases to <strong>2d4</strong>. When you use a spell slot of 7th level or higher, the bonus increases to +3 and the extra damage increases to <strong>3d4</strong>."
  ],
  isDamagingSpell: true,
  damage: [
    [
      DICE.D4,
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
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.RANGER
  ],
  spellLevel: 3
};

export const enemiesAbound: SpellEntry = {
  id: "spell-enemies-abound",
  name: "Enemies Abound",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You reach into the mind of one creature you can see and force it to make an Intelligence saving throw. A creature automatically succeeds if it is immune to being Frightened. On a failed save, the target loses the ability to distinguish friend from foe, regarding all creatures it can see as enemies until the spell ends. Each time the target takes damage, it can repeat the saving throw, ending the effect on itself on a success.",
    "Whenever the affected creature chooses another creature as a target, it must choose the target at random from among the creatures it can see within range of the attack, spell, or other ability it's using. If an enemy provokes an Opportunity Attack from the affected creature, the creature must make that attack if it is able to."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.INT,
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const eruptingEarth: SpellEntry = {
  id: "spell-erupting-earth",
  name: "Erupting Earth",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "Choose a point you can see on the ground within range. A fountain of churned earth and stone erupts in a 20-foot cube centered on that point. Each creature in that area must make a Dexterity saving throw. A creature takes <strong>3d12</strong> Bludgeoning damage on a failed save, or half as much damage on a successful one. Additionally, the ground in that area becomes difficult terrain until cleared away. Each 5-foot-square portion of the area requires at least 1 minute to clear by hand.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage increases by <strong>1d12</strong> for each slot level above 3rd."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D12, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D12, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D12, DAMAGE_TYPE.BLUDGEONING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const fastFriends: SpellEntry = {
  id: "spell-fast-friends",
  name: "Fast Friends",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "When you cast this spell, choose one Humanoid within range that can see and hear you, and that can understand you. The creature must succeed on a Wisdom saving throw or become Charmed by you for the duration. While the creature is Charmed in this way, it undertakes to perform any services or activities you ask of it in a friendly manner, to the best of its ability.",
    "You can set the creature new tasks when a previous task is completed, or if you decide to end its current task. If the service or activity might cause harm to the creature, or if it conflicts with the creature's normal activities and desires, the creature can make another Wisdom saving throw to try to end the effect. This save is made with Advantage if you or your companions are fighting the creature. If the activity would result in certain death for the creature, the spell ends.",
    "When the spell ends, the creature knows it was Charmed by you.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, you can target one additional creature for each slot level above 3rd."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const fear: SpellEntry = {
  id: "spell-fear",
  name: "Fear",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot cone)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You project a phantasmal image of a creature's worst fears. Each creature in a 30-foot cone must succeed on a Wisdom saving throw or drop whatever it is holding and become Frightened for the duration.",
    "While Frightened by this spell, a creature must take the Dash action and move away from you by the safest available route on each of its turns, unless there is nowhere to move. If the creature ends its turn in a location where it doesn't have line of sight to you, the creature can make a Wisdom saving throw. On a successful save, the spell ends for that creature."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const feignDeath: SpellEntry = {
  id: "spell-feign-death",
  name: "Feign Death",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  ritual: true,
  description: [
    "You touch a willing creature and put it into a cataleptic state that is indistinguishable from death.",
    "For the spell's duration, or until you use an action to touch the target and dismiss the spell, the target appears dead to all outward inspection and to spells used to determine the target's status. The target is Blinded and Incapacitated, and its Speed drops to 0. The target has Resistance to all damage except Psychic damage. If the target is diseased or Poisoned when you cast the spell, or becomes diseased or Poisoned while under the spell's effect, the disease and poison have no effect until the spell ends."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const fireball: SpellEntry = {
  id: "spell-fireball",
  name: "Fireball",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "A bright streak flashes from your pointing finger to a point you choose within range then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot radius must make a Dexterity saving throw. A target takes <strong>8d6</strong> Fire damage on a failed save, or half as much damage on a successful one. The fire spreads around corners. It ignites flammable objects in the area that aren't being worn or carried.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage increases by <strong>1d6</strong> for each slot level above 3rd."
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
    [DICE.D6, DAMAGE_TYPE.FIRE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const flameArrows: SpellEntry = {
  id: "spell-flame-arrows",
  name: "Flame Arrows",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You touch a quiver containing arrows or bolts. When a target is hit by a ranged weapon attack using a piece of ammunition drawn from the quiver, the target takes an extra <strong>1d6</strong> Fire damage. The spell's magic ends on the piece of ammunition when it hits or misses, and the spell ends when twelve pieces of ammunition have been drawn from the quiver.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the number of pieces of ammunition you can affect with this spell increases by two for each slot level above 3rd."
  ],
  isDamagingSpell: true,
  damage: [[DICE.D6, DAMAGE_TYPE.FIRE]],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD,
    SPELL_LIST_CLASS.ARTIFICER
  ],
  spellLevel: 3
};

export const flameStride: SpellEntry = {
  id: "spell-flame-stride",
  name: "Flame Stride",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "The billowing flames of a dragon cover your feet, granting you explosive speed. For the duration, your Speed increases by 20 feet and moving doesn't provoke Opportunity Attacks. When you move within 5 feet of a creature or object that isn't being worn or carried, it takes <strong>1d6</strong> Fire damage from your trail of heat. A creature or object can take this damage only once during a turn.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, increase your Speed by 5 feet for each slot level above 3rd. Additionally, the spell deals an additional <strong>1d6</strong> Fire damage for each slot level above 3rd."
  ],
  isDamagingSpell: true,
  damage: [[DICE.D6, DAMAGE_TYPE.FIRE]],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const fly: SpellEntry = {
  id: "spell-fly",
  name: "Fly",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You touch a willing creature. The target gains a Flying Speed of 60 feet for the duration. When the spell ends, the target falls if it is still aloft, unless it can stop the fall.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, you can target one additional creature for each slot level above 3rd."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const galdersTower: SpellEntry = {
  id: "spell-galders-tower",
  name: "Galder's Tower",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["24 hours"],
  description: [
    "You conjure a two-story tower made of stone, wood, or similar suitably sturdy materials. The tower can be round or square in shape. Each level of the tower is 10 feet tall and has an area of up to 100 square feet. Access between levels consists of a simple ladder and hatch. Each level takes one of the following forms, chosen by you when you cast the spell:",
    "A bedroom with a bed, chairs, chest, and magical fireplace.",
    "A study with desks, books, bookshelves, parchments, ink, and ink pens.",
    "A dining space with a table, chairs, magical fireplace, containers, and cooking utensils.",
    "A lounge with couches, armchairs, side tables, and footstools.",
    "A washroom with toilets, washtubs, a magical brazier, and sauna benches.",
    "An observatory with a telescope and maps of the night sky.",
    "An unfurnished, empty room.",
    "The interior of the tower is warm and dry, regardless of conditions outside. Any equipment or furnishings conjured with the tower dissipate into smoke if removed from it. At the end of the spell's duration, all creatures and objects within the tower that were not created by the spell appear safely outside on the ground, and all traces of the tower and its furnishings disappear.",
    "You can cast this spell again while it is active to maintain the tower's existence for another 24 hours. You can create a permanent tower by casting this spell in the same location and with the same configuration every day for one year.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the tower can have one additional story for each slot level beyond 3rd."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const gaseousForm: SpellEntry = {
  id: "spell-gaseous-form",
  name: "Gaseous Form",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You transform a willing creature you touch, along with everything it's wearing and carrying, into a misty cloud for the duration. The spell ends if the creature drops to 0 Hit Points. An Incorporeal creature isn't affected.",
    "While in this form, the target's only method of movement is a Flying Speed of 10 feet. The target can enter and occupy the space of another creature. The target has Resistance to nonmagical damage, and it has Advantage on Strength, Dexterity, and Constitution saving throws. The target can pass through small holes, narrow openings, and even mere cracks, though it treats liquids as though they were solid surfaces. The target can't fall and remains hovering in the air even when Stunned or otherwise Incapacitated.",
    "While in the form of a misty cloud, the target can't talk or manipulate objects, and any objects it was carrying or holding can't be dropped, used, or otherwise interacted with. The target can't attack or cast spells."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const glyphOfWarding: SpellEntry = {
  id: "spell-glyph-of-warding",
  name: "Glyph of Warding",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.HOUR],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Until dispelled or triggered"],
  description: [
    "When you cast this spell, you inscribe a glyph that creates a magical effect triggered by other creatures, either upon a surface, such as a table or a section of floor or wall, or within an object that can be closed, such as a book, a scroll, or a treasure chest, to conceal the glyph. The glyph can cover an area no larger than 10 feet in diameter. If the surface or object is moved more than 10 feet from where you cast this spell, the glyph is broken, and the spell ends without being triggered.",
    "The glyph is nearly invisible and requires a successful Intelligence (Investigation) check against your spell save DC to be found.",
    "You decide what triggers the glyph when you cast the spell. For glyphs inscribed on a surface, the most typical triggers include touching or standing on the glyph, removing another object covering the glyph, approaching within a certain distance of the glyph, or manipulating the object on which the glyph is inscribed. For glyphs inscribed within an object, the most common triggers include opening that object, approaching within a certain distance of the object, or seeing or reading the glyph. Once a glyph is triggered, this spell ends.",
    "You can further refine the trigger so the spell activates only under certain circumstances or according to physical characteristics, such as height or weight, creature kind, for example, the ward could be set to affect Aberrations or drow, or alignment. You can also set conditions for creatures that don't trigger the glyph, such as those who say a certain password.",
    "When you inscribe the glyph, choose Explosive Runes or a Spell Glyph.",
    "<strong>Explosive Runes.</strong> When triggered, the glyph erupts with magical energy in a 20-foot-radius sphere centered on the glyph. The sphere spreads around corners. Each creature in the area must make a Dexterity saving throw. A creature takes <strong>5d8</strong> Acid, Cold, Fire, Lightning, or Thunder damage on a failed saving throw, your choice when you create the glyph, or half as much damage on a successful one.",
    "<strong>Spell Glyph.</strong> You can store a prepared spell of 3rd level or lower in the glyph by casting it as part of creating the glyph. The spell must target a single creature or an area. The spell being stored has no immediate effect when cast in this way. When the glyph is triggered, the stored spell is cast. If the spell has a target, it targets the creature that triggered the glyph. If the spell affects an area, the area is centered on that creature. If the spell summons hostile creatures or creates harmful objects or traps, they appear as close as possible to the intruder and attack it. If the spell requires Concentration, it lasts until the end of its full duration.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage of an Explosive Runes glyph increases by <strong>1d8</strong> for each slot level above 3rd. If you create a Spell Glyph, you can store any spell of up to the same level as the slot you use for the Glyph of Warding."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [
      DICE.D8,
      [
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.COLD,
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.THUNDER
      ]
    ],
    [
      DICE.D8,
      [
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.COLD,
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.THUNDER
      ]
    ],
    [
      DICE.D8,
      [
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.COLD,
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.THUNDER
      ]
    ],
    [
      DICE.D8,
      [
        DAMAGE_TYPE.ACID,
        DAMAGE_TYPE.COLD,
        DAMAGE_TYPE.FIRE,
        DAMAGE_TYPE.LIGHTNING,
        DAMAGE_TYPE.THUNDER
      ]
    ],
    [
      DICE.D8,
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
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const haste: SpellEntry = {
  id: "spell-haste",
  name: "Haste",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Choose a willing creature that you can see within range. Until the spell ends, the target's Speed is doubled, it gains a +2 bonus to AC, it has Advantage on Dexterity saving throws, and it gains an additional action on each of its turns. That action can be used only to take the Attack action with one weapon attack only, Dash, Disengage, Hide, or Use an Object action.",
    "When the spell ends, the target can't move or take actions until after its next turn, as a wave of lethargy sweeps over it."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const haywire: SpellEntry = {
  id: "spell-haywire",
  name: "Haywire",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "This spell plays havoc with electronic devices, making the use of such devices all but impossible. Each electronic device in a 10-foot-radius sphere centered on a point you choose within range is subject to random behavior while it remains within the area. A device not held by a creature is automatically affected. If an electronic device is held by a creature, that creature must succeed on a Wisdom saving throw or have the device affected by the spell.",
    "At the start of each of your turns, roll a <strong>d6</strong> for each affected device to determine its behavior. Except where otherwise indicated, that behavior lasts until the start of your next turn while this spell is in effect.",
    "<strong>1.</strong> The device shuts down and must be restarted. Do not roll again for this device until it is restarted.",
    "<strong>2-4.</strong> The device does not function.",
    "<strong>5.</strong> The device experiences a power surge, causing an electric shock to the wielder if any and one random creature within 5 feet of the device. Each affected creature must make a Dexterity saving throw against your spell save DC, taking <strong>6d6</strong> Lightning damage on a failed save, or half as much damage on a successful one.",
    "<strong>6.</strong> The device is usable as normal.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the radius of the sphere affected by the spell increases by 5 feet for each slot level above 3rd."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const houseOfCards: SpellEntry = {
  id: "spell-house-of-cards",
  name: "House of Cards",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["24 hours"],
  description: [
    "You touch the ground and conjure forth a defensive structure made of enormous playing cards. The structure rises with you at its center, harmlessly lifting you and any creatures in the area. The house of cards has a square base that is 30 feet on each side, and it has three floors with 10-foot-high ceilings. The second floor is 20 feet on each side, and the top floor is 10 feet on each side, both centered above the bottom floor. Ramps connect the interior of each floor, and empty doorframes connect the interior and exterior of each level. Creatures inside or on top of the structure have half cover.",
    "Each card that comprises the house is 5 feet wide and 10 feet tall and is very fragile. A card has AC 10 and 1 Hit Point. The cards are immune to Poison and Psychic damage. Reducing a card to 0 Hit Points destroys it. Every time a card is destroyed, roll <strong>1d6</strong>. If you roll a 5 or a 6, the house collapses, ending the spell.",
    "The house and all its cards vanish when the spell ends."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const hungerOfHadar: SpellEntry = {
  id: "spell-hunger-of-hadar",
  name: "Hunger of Hadar",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You open a gateway to the dark between the stars, a region infested with unknown horrors. A 20-foot-radius sphere of blackness and bitter cold appears, centered on a point within range and lasting for the duration. This void is filled with a cacophony of soft whispers and slurping noises that can be heard up to 30 feet away. No light, magical or otherwise, can illuminate the area, and creatures fully within the area are Blinded.",
    "The void creates a warp in the fabric of space, and the area is difficult terrain. Any creature that starts its turn in the area takes <strong>2d6</strong> Cold damage. Any creature that ends its turn in the area must succeed on a Dexterity saving throw or take <strong>2d6</strong> Acid damage as milky, otherworldly tentacles rub against it."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.ACID],
    [DICE.D6, DAMAGE_TYPE.ACID]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 3
};

export const hypnoticPattern: SpellEntry = {
  id: "spell-hypnotic-pattern",
  name: "Hypnotic Pattern",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You create a twisting pattern of colors that weaves through the air inside a 30-foot cube within range. The pattern appears for a moment and vanishes. Each creature in the area who sees the pattern must make a Wisdom saving throw. On a failed save, the creature becomes Charmed for the duration. While Charmed by this spell, the creature is Incapacitated and has a Speed of 0.",
    "The spell ends for an affected creature if it takes any damage or if someone else uses an action to shake the creature out of its stupor."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const inciteGreed: SpellEntry = {
  id: "spell-incite-greed",
  name: "Incite Greed",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "When you cast this spell, you present the gem used as the material component and choose any number of creatures within range that can see you. Each target must succeed on a Wisdom saving throw or be Charmed by you until the spell ends, or until you or your companions do anything harmful to it. While Charmed in this way, a creature can do nothing but use its movement to approach you in a safe manner. While an affected creature is within 5 feet of you, it cannot move, but simply stares greedily at the gem you present.",
    "At the end of each of its turns, an affected target can make a Wisdom saving throw. If it succeeds, this effect ends for that target."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const intellectFortress: SpellEntry = {
  id: "spell-intellect-fortress",
  name: "Intellect Fortress",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "For the duration, you or one willing creature you can see within range has Resistance to Psychic damage, as well as Advantage on Intelligence, Wisdom, and Charisma saving throws.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, you can target one additional creature for each slot level above 3rd. The creatures must be within 30 feet of each other when you target them."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const invisibilityToCameras: SpellEntry = {
  id: "spell-invisibility-to-cameras",
  name: "Invisibility To Cameras",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Four creatures of your choice within range become undetectable to electronic sensors and cameras for the duration of the spell. Anything a target is wearing or carrying is likewise undetectable as long as it is on the target's person. The targets remain visible to vision."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const leomundsTinyHut: SpellEntry = {
  id: "spell-leomunds-tiny-hut",
  name: "Leomund's Tiny Hut",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Self (10-foot-radius hemisphere)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["8 hours"],
  ritual: true,
  description: [
    "A 10-foot-radius immobile dome of force springs into existence around and above you and remains stationary for the duration. The spell ends if you leave its area.",
    "Nine creatures of Medium size or smaller can fit inside the dome with you. The spell fails if its area includes a larger creature or more than nine creatures. Creatures and objects within the dome when you cast the spell can move through it freely. All other creatures and objects are barred from passing through it. Spells and other magical effects can't extend through the dome or be cast through it. The atmosphere inside the space is comfortable and dry, regardless of the weather outside.",
    "Until the spell ends, you can command the interior to become dimly lit or dark. The dome is opaque from the outside, of any color you choose, but it is transparent from the inside."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const lifeTransference: SpellEntry = {
  id: "spell-life-transference",
  name: "Life Transference",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You sacrifice some of your health to mend another creature's injuries. You take <strong>4d8</strong> Necrotic damage, which can't be reduced in any way, and one creature of your choice that you can see within range regains a number of Hit Points equal to twice the Necrotic damage you take.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage increases by <strong>1d8</strong> for each slot level above 3rd."
  ],
  isHealingSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC]
  ],
  healing: { label: "2x damage taken" },
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const lightningArrow: SpellEntry = {
  id: "spell-lightning-arrow",
  name: "Lightning Arrow",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "The next time you make a ranged weapon attack during the spell's duration, the weapon's ammunition, or the weapon itself if it's a thrown weapon, transforms into a bolt of Lightning. Make the attack roll as normal. The target takes <strong>4d8</strong> Lightning damage on a hit, or half as much damage on a miss, instead of the weapon's normal damage.",
    "Whether you hit or miss, each creature within 10 feet of the target must make a Dexterity saving throw. Each of these creatures takes <strong>2d8</strong> Lightning damage on a failed save, or half as much damage on a successful one.",
    "The piece of ammunition or weapon then returns to its normal form.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage for both effects of the spell increases by <strong>1d8</strong> for each slot level above 3rd."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.LIGHTNING],
    [DICE.D8, DAMAGE_TYPE.LIGHTNING],
    [DICE.D8, DAMAGE_TYPE.LIGHTNING],
    [DICE.D8, DAMAGE_TYPE.LIGHTNING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.RANGER],
  spellLevel: 3
};

export const lightningBolt: SpellEntry = {
  id: "spell-lightning-bolt",
  name: "Lightning Bolt",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (100-foot line)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "A stroke of Lightning forming a line 100 feet long and 5 feet wide blasts out from you in a direction you choose. Each creature in the line must make a Dexterity saving throw. A creature takes <strong>8d6</strong> Lightning damage on a failed save, or half as much damage on a successful one.",
    "The Lightning ignites flammable objects in the area that aren't being worn or carried.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage increases by <strong>1d6</strong> for each slot level above 3rd."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING],
    [DICE.D6, DAMAGE_TYPE.LIGHTNING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const magicCircle: SpellEntry = {
  id: "spell-magic-circle",
  name: "Magic Circle",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  description: [
    "You create a 10-foot-radius, 20-foot-tall cylinder of magical energy centered on a point on the ground that you can see within range. Glowing runes appear wherever the cylinder intersects with the floor or other surface.",
    "Choose one or more of the following types of creatures: Celestials, Elementals, Fey, Fiends, or Undead. The circle affects a creature of the chosen type in the following ways:",
    "The creature can't willingly enter the cylinder by nonmagical means. If the creature tries to use teleportation or interplanar travel to do so, it must first succeed on a Charisma saving throw.",
    "The creature has Disadvantage on attack rolls against targets within the cylinder.",
    "Targets within the cylinder can't be Charmed, Frightened, or possessed by the creature.",
    "When you cast this spell, you can elect to cause its magic to operate in the reverse direction, preventing a creature of the specified type from leaving the cylinder and protecting targets outside it.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the duration increases by 1 hour for each slot level above 3rd."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CHA,
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const majorImage: SpellEntry = {
  id: "spell-major-image",
  name: "Major Image",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 20-foot cube. The image appears at a spot that you can see within range and lasts for the duration. It seems completely real, including sounds, smells, and temperature appropriate to the thing depicted. You can't create sufficient heat or cold to cause damage, a sound loud enough to deal Thunder damage or deafen a creature, or a smell that might sicken a creature.",
    "As long as you are within range of the illusion, you can use your action to cause the image to move to any other spot within range. As the image changes location, you can alter its appearance so that its movements appear natural for the image. For example, if you create an image of a creature and move it, you can alter the image so that it appears to be walking. Similarly, you can cause the illusion to make different sounds at different times, even making it carry on a conversation.",
    "Physical interaction with the image reveals it to be an illusion, because things can pass through it. A creature that uses its action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and its other sensory qualities become faint to the creature.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th level or higher, the spell lasts until dispelled, without requiring your Concentration. In this form it is sometimes considered a different spell, known as Permanent Image."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const massHealingWord: SpellEntry = {
  id: "spell-mass-healing-word",
  name: "Mass Healing Word",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "As you call out words of restoration, up to six creatures of your choice that you can see within range regain Hit Points equal to <strong>1d4</strong> + your spellcasting ability modifier. This spell has no effect on Undead or Constructs.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the healing increases by <strong>1d4</strong> for each slot level above 3rd."
  ],
  isHealingSpell: true,
  damage: [],
  healing: [DICE.D4, "spellcastingAbility"],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC],
  spellLevel: 3
};

export const meldIntoStone: SpellEntry = {
  id: "spell-meld-into-stone",
  name: "Meld into Stone",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["8 hours"],
  ritual: true,
  description: [
    "You step into a stone object or surface large enough to fully contain your body, melding yourself and all the equipment you carry with the stone for the duration. Using your movement, you step into the stone at a point you can touch. Nothing of your presence remains visible or otherwise detectable by nonmagical senses.",
    "While merged with the stone, you can't see what occurs outside it, and any Wisdom (Perception) checks you make to hear sounds outside it are made with Disadvantage. You remain aware of the passage of time and can cast spells on yourself while merged in the stone. You can use your movement to leave the stone where you entered it, which ends the spell. You otherwise can't move.",
    "Minor physical damage to the stone doesn't harm you, but its partial destruction or a change in its shape to the extent that you no longer fit within it expels you and deals <strong>6d6</strong> Bludgeoning damage to you. The stone's complete destruction, or transmutation into a different substance, expels you and deals 50 Bludgeoning damage to you. If expelled, you fall Prone in an unoccupied space closest to where you first entered."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 3
};

export const melfsMinuteMeteors: SpellEntry = {
  id: "spell-melfs-minute-meteors",
  name: "Melf's Minute Meteors",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You create six tiny meteors in your space. They float in the air and orbit you for the spell's duration. When you cast the spell, and as a Bonus Action on each of your turns thereafter, you can expend one or two of the meteors, sending them streaking toward a point or points you choose within 120 feet of you. Once a meteor reaches its destination or impacts against a solid surface, the meteor explodes. Each creature within 5 feet of the point where the meteor explodes must make a Dexterity saving throw. A creature takes <strong>2d6</strong> Fire damage on a failed save, or half as much damage on a successful one.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the number of meteors created increases by two for each slot level above 3rd."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const motivationalSpeech: SpellEntry = {
  id: "spell-motivational-speech",
  name: "Motivational Speech",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["1 hour"],
  description: [
    "Choose up to five creatures within range that can hear you. For the duration, each affected creature gains 5 temporary Hit Points and has Advantage on Wisdom saving throws. If an affected creature is hit by an attack, it has Advantage on the next attack roll it makes. Once an affected creature loses the temporary Hit Points granted by this spell, the spell ends for that creature.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the temporary Hit Points increase by 5 for each slot level above 3rd."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC],
  spellLevel: 3
};

export const nondetection: SpellEntry = {
  id: "spell-nondetection",
  name: "Nondetection",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["8 hours"],
  description: [
    "For the duration, you hide a target that you touch from Divination magic. The target can be a willing creature or a place or an object no larger than 10 feet in any dimension. The target can't be targeted by any Divination magic or perceived through magical scrying sensors."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const phantomSteed: SpellEntry = {
  id: "spell-phantom-steed",
  name: "Phantom Steed",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 hour"],
  ritual: true,
  description: [
    "A Large quasi-real, horselike creature appears on the ground in an unoccupied space of your choice within range. You decide the creature's appearance, but it is equipped with a saddle, bit, and bridle. Any of the equipment created by the spell vanishes in a puff of smoke if it is carried more than 10 feet away from the steed.",
    "For the duration, you or a creature you choose can ride the steed. The creature uses the statistics for a riding horse, except it has a Speed of 100 feet and can travel 10 miles in an hour, or 13 miles at a fast pace. When the spell ends, the steed gradually fades, giving the rider 1 minute to dismount. The spell ends if you use an action to dismiss it or if the steed takes any damage."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const plantGrowth: SpellEntry = {
  id: "spell-plant-growth",
  name: "Plant Growth",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION, "or", ACTION_TYPE.EIGHT_HOURS],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "This spell channels vitality into plants within a specific area. There are two possible uses for the spell, granting either immediate or long-term benefits.",
    "If you cast this spell using 1 action, choose a point within range. All normal plants in a 100-foot radius centered on that point become thick and overgrown. A creature moving through the area must spend 4 feet of movement for every 1 foot it moves.",
    "You can exclude one or more areas of any size within the spell's area from being affected.",
    "If you cast this spell over 8 hours, you enrich the land. All plants in a half-mile radius centered on a point within range become enriched for 1 year. The plants yield twice the normal amount of food when harvested."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 3
};

export const protectionFromBallistics: SpellEntry = {
  id: "spell-protection-from-ballistics",
  name: "Protection from Ballistics",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "This spell enchants the flesh of the target against the impact of bullets. Until the spell ends, the target has Resistance to nonmagical ballistic damage."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const protectionFromEnergy: SpellEntry = {
  id: "spell-protection-from-energy",
  name: "Protection from Energy",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "For the duration, the willing creature you touch has Resistance to one damage type of your choice: Acid, Cold, Fire, Lightning, or Thunder."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const psionicBlast: SpellEntry = {
  id: "spell-psionic-blast",
  name: "Psionic Blast",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot cone)",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You unleash a destructive wave of mental power in a 30-foot cone. Each creature in the area must make a Dexterity saving throw. On a failed save, a target takes <strong>5d8</strong> Force damage, is pushed 20 feet directly away from you, and is knocked Prone. On a successful save, a target takes half as much damage and isn't pushed or knocked Prone.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage increases by <strong>1d8</strong> for each slot level above 3rd."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE],
    [DICE.D8, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const pulseWave: SpellEntry = {
  id: "spell-pulse-wave",
  name: "Pulse Wave",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot cone)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You create intense pressure, unleash it in a 30-foot cone, and decide whether the pressure pulls or pushes creatures and objects. Each creature in that cone must make a Constitution saving throw. A creature takes <strong>6d6</strong> Force damage on a failed save, or half as much damage on a successful one. And every creature that fails the save is either pulled 15 feet toward you or pushed 15 feet away from you, depending on the choice you made for the spell.",
    "In addition, unsecured objects that are completely within the cone are likewise pulled or pushed 15 feet.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage increases by <strong>1d6</strong> and the distance pulled or pushed increases by 5 feet for each slot level above 3rd."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE],
    [DICE.D6, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const removeCurse: SpellEntry = {
  id: "spell-remove-curse",
  name: "Remove Curse",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "At your touch, all curses affecting one creature or object end. If the object is a cursed magic item, its curse remains, but the spell breaks its owner's attunement to the object so it can be removed or discarded."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const revivify: SpellEntry = {
  id: "spell-revivify",
  name: "Revivify",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You touch a creature that has died within the last minute. That creature returns to life with 1 Hit Point. This spell can't return to life a creature that has died of old age, nor can it restore any missing body parts."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.RANGER
  ],
  spellLevel: 3
};

export const sending: SpellEntry = {
  id: "spell-sending",
  name: "Sending",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Unlimited",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 round"],
  description: [
    "You send a short message of twenty-five words or less to a creature with which you are familiar. The creature hears the message in its mind, recognizes you as the sender if it knows you, and can answer in a like manner immediately. The spell enables creatures with Intelligence scores of at least 1 to understand the meaning of your message.",
    "You can send the message across any distance and even to other planes of existence, but if the target is on a different plane than you, there is a 5 percent chance that the message doesn't arrive."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const sleetStorm: SpellEntry = {
  id: "spell-sleet-storm",
  name: "Sleet Storm",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Until the spell ends, freezing rain and sleet fall in a 20-foot-tall cylinder with a 40-foot radius centered on a point you choose within range. The area is heavily obscured, and exposed flames in the area are doused.",
    "The ground in the area is covered with slick ice, making it difficult terrain. When a creature enters the spell's area for the first time on a turn or starts its turn there, it must make a Dexterity saving throw. On a failed save, it falls Prone.",
    "If a creature starts its turn in the spell's area and is Concentrating on a spell, the creature must make a successful Constitution saving throw against your spell save DC or lose Concentration."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const slow: SpellEntry = {
  id: "spell-slow",
  name: "Slow",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You alter time around up to six creatures of your choice in a 40-foot cube within range. Each target must succeed on a Wisdom saving throw or be affected by this spell for the duration.",
    "An affected target's Speed is halved, it takes a -2 penalty to AC and Dexterity saving throws, and it can't use Reactions. On its turn, it can use either an action or a Bonus Action, not both. Regardless of the creature's abilities or magic items, it can't make more than one melee or ranged attack during its turn.",
    "If the creature attempts to cast a spell with a casting time of 1 action, roll a <strong>d20</strong>. On an 11 or higher, the spell doesn't take effect until the creature's next turn, and the creature must use its action on that turn to complete the spell. If it can't, the spell is wasted.",
    "A creature affected by this spell makes another Wisdom saving throw at the end of each of its turns. On a successful save, the effect ends for it."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const speakWithDead: SpellEntry = {
  id: "spell-speak-with-dead",
  name: "Speak with Dead",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["10 minutes"],
  description: [
    "You grant the semblance of life and intelligence to a corpse of your choice within range, allowing it to answer the questions you pose. The corpse must still have a mouth and can't be Undead. The spell fails if the corpse was the target of this spell within the last 10 days.",
    "Until the spell ends, you can ask the corpse up to five questions. The corpse knows only what it knew in life, including the languages it knew. Answers are usually brief, cryptic, or repetitive, and the corpse is under no compulsion to offer a truthful answer if you are hostile to it or it recognizes you as an enemy. This spell doesn't return the creature's soul to its body, only its animating spirit. Thus, the corpse can't learn new information, doesn't comprehend anything that has happened since it died, and can't speculate about future events."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const speakWithPlants: SpellEntry = {
  id: "spell-speak-with-plants",
  name: "Speak with Plants",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot radius)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["10 minutes"],
  description: [
    "You imbue plants within 30 feet of you with limited sentience and animation, giving them the ability to communicate with you and follow your simple commands. You can question plants about events in the spell's area within the past day, gaining information about creatures that have passed, weather, and other circumstances.",
    "You can also turn difficult terrain caused by plant growth, such as thickets and undergrowth, into ordinary terrain that lasts for the duration. Or you can turn ordinary terrain where plants are present into difficult terrain that lasts for the duration, causing vines and branches to hinder pursuers, for example.",
    "Plants might be able to perform other tasks on your behalf, at the DM's discretion. The spell doesn't enable plants to uproot themselves and move about, but they can freely move branches, tendrils, and stalks.",
    "If a plant creature is in the area, you can communicate with it as if you share a common language, but you gain no magical ability to influence it.",
    "This spell can cause the plants created by the Entangle spell to release a Restrained creature."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 3
};

export const spiritGuardians: SpellEntry = {
  id: "spell-spirit-guardians",
  name: "Spirit Guardians",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (15-foot radius)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You call forth spirits to protect you. They flit around you to a distance of 15 feet for the duration. If you are good or neutral, their spectral form appears angelic or Fey, your choice. If you are evil, they appear fiendish.",
    "When you cast this spell, you can designate any number of creatures you can see to be unaffected by it. An affected creature's Speed is halved in the area, and when the creature enters the area for the first time on a turn or starts its turn there, it must make a Wisdom saving throw. On a failed save, the creature takes <strong>3d8</strong> Radiant damage if you are good or neutral or <strong>3d8</strong> Necrotic damage if you are evil. On a successful save, the creature takes half as much damage.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage increases by <strong>1d8</strong> for each slot level above 3rd."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.WIS,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, [DAMAGE_TYPE.RADIANT, DAMAGE_TYPE.NECROTIC]],
    [DICE.D8, [DAMAGE_TYPE.RADIANT, DAMAGE_TYPE.NECROTIC]],
    [DICE.D8, [DAMAGE_TYPE.RADIANT, DAMAGE_TYPE.NECROTIC]]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 3
};

export const spiritShroud: SpellEntry = {
  id: "spell-spirit-shroud",
  name: "Spirit Shroud",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You call forth spirits of the dead, which flit around you for the spell's duration. The spirits are intangible and invulnerable.",
    "Until the spell ends, any attack you make deals <strong>1d8</strong> extra damage when you hit a creature within 10 feet of you. This damage is Radiant, Necrotic, or Cold, your choice when you cast the spell. Any creature that takes this damage can't regain Hit Points until the start of your next turn.",
    "In addition, any creature of your choice that you can see that starts its turn within 10 feet of you has its Speed reduced by 10 feet until the start of your next turn.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage increases by <strong>1d8</strong> for every two slot levels above 3rd."
  ],
  isDamagingSpell: true,
  damage: [[DICE.D8, [DAMAGE_TYPE.RADIANT, DAMAGE_TYPE.NECROTIC, DAMAGE_TYPE.COLD]]],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const stinkingCloud: SpellEntry = {
  id: "spell-stinking-cloud",
  name: "Stinking Cloud",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You create a 20-foot-radius sphere of yellow, nauseating gas centered on a point within range. The cloud spreads around corners, and its area is heavily obscured. The cloud lingers in the air for the duration.",
    "Each creature that is completely within the cloud at the start of its turn must make a Constitution saving throw against poison. On a failed save, the creature spends its action that turn retching and reeling. Creatures that don't need to breathe or are immune to poison automatically succeed on this saving throw.",
    "A moderate wind, at least 10 miles per hour, disperses the cloud after 4 rounds. A strong wind, at least 20 miles per hour, disperses it after 1 round."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const summonFey: SpellEntry = {
  id: "spell-summon-fey",
  name: "Summon Fey",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You call forth a Fey spirit. It manifests in an unoccupied space that you can see within range. This corporeal form uses the Fey Spirit stat block. When you cast the spell, choose a mood: Fuming, Mirthful, or Tricksy. The creature resembles a Fey creature of your choice marked by the chosen mood, which determines one of the traits in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.",
    "The creature is an ally to you and your companions. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands, no action required by you. If you don't issue any, it takes the Dodge action and uses its move to avoid danger.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, use the higher level wherever the spell's level appears in the stat block.",
    "<strong>Fey Spirit.</strong> Small Fey.",
    "<strong>Armor Class.</strong> 12 + the level of the spell, natural armor.",
    "<strong>Hit Points.</strong> 30 + 10 for each spell level above 3rd.",
    "<strong>Speed.</strong> 40 ft.",
    "<strong>Abilities.</strong> STR 13 (+1), DEX 16 (+3), CON 14 (+2), INT 14 (+2), WIS 11 (+0), CHA 16 (+3).",
    "<strong>Condition Immunities.</strong> Charmed.",
    "<strong>Senses.</strong> Darkvision 60 ft., passive Perception 10.",
    "<strong>Languages.</strong> Sylvan, understands the languages you speak.",
    "<strong>Proficiency Bonus.</strong> Equals your bonus.",
    "<strong>Multiattack.</strong> The Fey makes a number of attacks equal to half this spell's level, rounded down.",
    "<strong>Shortsword.</strong> Melee Weapon Attack: your spell attack modifier to hit, reach 5 ft., one target. Hit: <strong>1d6</strong> + 3 + the spell's level Piercing damage + <strong>1d6</strong> Force damage.",
    "<strong>Fey Step.</strong> The Fey magically teleports up to 30 feet to an unoccupied space it can see. Then one of the following effects occurs, based on the Fey's chosen mood.",
    "<strong>Fuming.</strong> The Fey has Advantage on the next attack roll it makes before the end of this turn.",
    "<strong>Mirthful.</strong> The Fey can force one creature it can see within 10 feet of it to make a Wisdom saving throw against your spell save DC. Unless the save succeeds, the target is Charmed by you and the Fey for 1 minute or until the target takes any damage.",
    "<strong>Tricksy.</strong> The Fey can fill a 5-foot cube within 5 feet of it with magical darkness, which lasts until the end of its next turn."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.PIERCING],
    [DICE.D6, DAMAGE_TYPE.FORCE]
  ],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const summonLesserDemons: SpellEntry = {
  id: "spell-summon-lesser-demons",
  name: "Summon Lesser Demons",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You utter foul words, summoning demons from the chaos of the Abyss. Roll on the following table to determine what appears.",
    "<strong>1-2.</strong> Two demons of Challenge Rating 1 or lower.",
    "<strong>3-4.</strong> Four demons of Challenge Rating 1/2 or lower.",
    "<strong>5-6.</strong> Eight demons of Challenge Rating 1/4 or lower.",
    "The DM chooses the demons, such as manes or dretches, and you choose the unoccupied spaces you can see within range where they appear. A summoned demon disappears when it drops to 0 Hit Points or when the spell ends.",
    "The demons are hostile to all creatures, including you. Roll Initiative for the summoned demons as a group, which has its own turns. The demons pursue and attack the nearest non-demons to the best of their ability.",
    "As part of casting the spell, you can form a circle on the ground with the blood used as a material component. The circle is large enough to encompass your space. While the spell lasts, the summoned demons can't cross the circle or harm it, and they can't target anyone within it. Using the material component in this manner consumes it when the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 6th or 7th level, you summon twice as many demons. If you cast it using a spell slot of 8th or 9th level, you summon three times as many demons."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const summonShadowspawn: SpellEntry = {
  id: "spell-summon-shadowspawn",
  name: "Summon Shadowspawn",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You call forth a shadowy spirit. It manifests in an unoccupied space that you can see within range. This corporeal form uses the Shadow Spirit stat block. When you cast the spell, choose an emotion: Fury, Despair, or Fear. The creature resembles a misshapen biped marked by the chosen emotion, which determines certain traits in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.",
    "The creature is an ally to you and your companions. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands, no action required by you. If you don't issue any, it takes the Dodge action and uses its move to avoid danger.",
    "<strong>At Higher Levels.</strong> When you cast the spell using a spell slot of 4th level or higher, use the higher level wherever the spell's level appears in the stat block.",
    "<strong>Shadow Spirit.</strong> Medium Monstrosity.",
    "<strong>Armor Class.</strong> 11 + the level of the spell, natural armor.",
    "<strong>Hit Points.</strong> 35 + 15 for each level of the spell above 3rd.",
    "<strong>Speed.</strong> 40 ft.",
    "<strong>Abilities.</strong> STR 13 (+1), DEX 16 (+3), CON 15 (+2), INT 4 (-3), WIS 10 (+0), CHA 16 (+3).",
    "<strong>Damage Resistances.</strong> Necrotic.",
    "<strong>Condition Immunities.</strong> Frightened.",
    "<strong>Senses.</strong> Darkvision 120 ft., passive Perception 10.",
    "<strong>Languages.</strong> Understands the languages you speak.",
    "<strong>Proficiency Bonus.</strong> Equals your bonus.",
    "<strong>Terror Frenzy.</strong> Fury only. The spirit has Advantage on attack rolls against Frightened creatures.",
    "<strong>Weight of Sorrow.</strong> Despair only. Any creature, other than you, that starts its turn within 5 feet of the spirit has its Speed reduced by 20 feet until the start of that creature's next turn.",
    "<strong>Multiattack.</strong> The spirit makes a number of attacks equal to half this spell's level, rounded down.",
    "<strong>Chilling Hand.</strong> Melee Weapon Attack: your spell attack modifier to hit, reach 5 ft., one target. Hit: <strong>1d12</strong> + 3 + the spell's level Cold damage.",
    "<strong>Dreadful Scream.</strong> 1/Day. The spirit screams. Each creature within 30 feet of it must succeed on a Wisdom saving throw against your spell save DC or be Frightened of the spirit for 1 minute. The Frightened creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.",
    "<strong>Shadow Stealth.</strong> Fear only. While in dim light or darkness, the spirit takes the Hide action."
  ],
  isDamagingSpell: true,
  damage: [[DICE.D12, DAMAGE_TYPE.COLD]],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const summonUndead: SpellEntry = {
  id: "spell-summon-undead",
  name: "Summon Undead",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You call forth an Undead spirit. It manifests in an unoccupied space that you can see within range. This corporeal form uses the Undead Spirit stat block. When you cast the spell, choose the creature's form: Ghostly, Putrid, or Skeletal. The spirit resembles an Undead creature with the chosen form, which determines certain traits in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.",
    "The creature is an ally to you and your companions. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands, no action required by you. If you don't issue any, it takes the Dodge action and uses its move to avoid danger.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, use the higher level wherever the spell's level appears in the stat block.",
    "<strong>Undead Spirit.</strong> Medium Undead.",
    "<strong>Armor Class.</strong> 11 + the level of the spell, natural armor.",
    "<strong>Hit Points.</strong> 30, Ghostly and Putrid only, or 20, Skeletal only, + 10 for each level of the spell above 3rd.",
    "<strong>Speed.</strong> 30 ft., fly 40 ft., hover, Ghostly only.",
    "<strong>Abilities.</strong> STR 12 (+1), DEX 16 (+3), CON 15 (+2), INT 4 (-3), WIS 10 (+0), CHA 9 (-1).",
    "<strong>Damage Immunities.</strong> Necrotic, Poison.",
    "<strong>Condition Immunities.</strong> Exhaustion, Frightened, Paralyzed, Poisoned.",
    "<strong>Senses.</strong> Darkvision 60 ft., passive Perception 10.",
    "<strong>Languages.</strong> Understands the languages you speak.",
    "<strong>Proficiency Bonus.</strong> Equals your bonus.",
    "<strong>Festering Aura.</strong> Putrid only. Any creature, other than you, that starts its turn within 5 feet of the spirit must succeed on a Constitution saving throw against your spell save DC or be Poisoned until the start of its next turn.",
    "<strong>Incorporeal Passage.</strong> Ghostly only. The spirit can move through other creatures and objects as if they were difficult terrain. If it ends its turn inside an object, it is shunted to the nearest unoccupied space and takes <strong>1d10</strong> Force damage for every 5 feet traveled.",
    "<strong>Multiattack.</strong> The spirit makes a number of attacks equal to half this spell's level, rounded down.",
    "<strong>Deathly Touch.</strong> Ghostly only. Melee Weapon Attack: your spell attack modifier to hit, reach 5 ft., one creature. Hit: <strong>1d8</strong> + 3 + the spell's level Necrotic damage, and the creature must succeed on a Wisdom saving throw against your spell save DC or be Frightened of the Undead until the end of the target's next turn.",
    "<strong>Grave Bolt.</strong> Skeletal only. Ranged Spell Attack: your spell attack modifier to hit, range 150 ft., one target. Hit: <strong>2d4</strong> + 3 + the spell's level Necrotic damage.",
    "<strong>Rotting Claw.</strong> Putrid only. Melee Weapon Attack: your spell attack modifier to hit, reach 5 ft., one target. Hit: <strong>1d6</strong> + 3 + the spell's level Slashing damage. If the target is Poisoned, it must succeed on a Constitution saving throw against your spell save DC or be Paralyzed until the end of its next turn."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D8, [DAMAGE_TYPE.NECROTIC, DAMAGE_TYPE.SLASHING]],
    [6, [DAMAGE_TYPE.NECROTIC, DAMAGE_TYPE.SLASHING]]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const summonWarriorSpirit: SpellEntry = {
  id: "spell-summon-warrior-spirit",
  name: "Summon Warrior Spirit",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You call forth a warrior spirit from the legendary Deck of Many Things. It manifests in an unoccupied space that you can see within range. This corporeal form uses the Warrior Spirit stat block. When you cast the spell, choose a type of warrior: Barbarian, Fighter, or Monk. The warrior resembles a Humanoid armed appropriately to the chosen class, which determines certain traits in its stat block. The warrior disappears when it drops to 0 Hit Points or when the spell ends.",
    "The warrior is an ally to you and your companions. In combat, the warrior shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands, no action required by you. If you don't issue any, it takes the Dodge action and uses its move to avoid danger.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the creature assumes the higher level for that casting wherever it uses the spell's level in its stat block.",
    "<strong>Warrior Spirit.</strong> Medium Undead.",
    "<strong>Armor Class.</strong> 13 + the level of the spell + 2, Fighter only.",
    "<strong>Hit Points.</strong> 30, Barbarian and Fighter only, or 20, Monk only, + 10 for each spell level above 3rd.",
    "<strong>Speed.</strong> 30 ft., 40 ft., Monk only.",
    "<strong>Abilities.</strong> STR 16 (+3), DEX 16 (+3), CON 14 (+2), INT 10 (+0), WIS 16 (+3), CHA 9 (-1).",
    "<strong>Saving Throws.</strong> STR +3, DEX +3.",
    "<strong>Damage Resistances.</strong> Poison.",
    "<strong>Condition Immunities.</strong> Charmed, Poisoned.",
    "<strong>Senses.</strong> Passive Perception 13.",
    "<strong>Languages.</strong> Common, understands the languages you speak.",
    "<strong>Proficiency Bonus.</strong> Equals your bonus.",
    "<strong>Multiattack.</strong> The warrior makes a number of attacks equal to half this spell's level, rounded down.",
    "<strong>Reckless Strike.</strong> Barbarian only. Melee Weapon Attack: your spell attack modifier to hit, with Advantage, reach 5 ft., one target. Hit: <strong>1d12</strong> + 3 + the spell's level Slashing damage, and attacks made against the warrior until the start of its next turn are made with Advantage.",
    "<strong>Rallying Strike.</strong> Fighter only. Melee or Ranged Weapon Attack: your spell attack modifier to hit, reach 5 ft., or range 20/60 ft., one target. Hit: <strong>1d6</strong> + 3 + the spell's level Piercing damage, and the warrior can choose another creature it can see within 20 feet of itself. The chosen creature gains <strong>1d6</strong> temporary Hit Points.",
    "<strong>Unarmed Strike.</strong> Monk only. Melee Weapon Attack: your spell attack modifier to hit, reach 5 ft., one target. Hit: <strong>1d4</strong> + 3 + the spell's level Bludgeoning damage, and the target must succeed on a Strength saving throw against your spell save DC or be knocked Prone.",
    "<strong>Flurry of Blows.</strong> Monk only. The monk makes one Unarmed Strike attack."
  ],
  isDamagingSpell: true,
  damage: [
    [DICE.D12, [DAMAGE_TYPE.SLASHING, DAMAGE_TYPE.PIERCING, DAMAGE_TYPE.BLUDGEONING]],
    [6, [DAMAGE_TYPE.SLASHING, DAMAGE_TYPE.PIERCING, DAMAGE_TYPE.BLUDGEONING]]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const thunderStep: SpellEntry = {
  id: "spell-thunder-step",
  name: "Thunder Step",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You teleport yourself to an unoccupied space you can see within range. Immediately after you disappear, a thunderous boom sounds, and each creature within 10 feet of the space you left must make a Constitution saving throw, taking <strong>3d10</strong> Thunder damage on a failed save, or half as much damage on a successful one. The thunder can be heard from up to 300 feet away.",
    "You can bring along objects as long as their weight doesn't exceed what you can carry. You can also teleport one willing creature of your size or smaller who is carrying gear up to its carrying capacity. The creature must be within 5 feet of you when you cast this spell, and there must be an unoccupied space within 5 feet of your destination space for the creature to appear in; otherwise, the creature is left behind.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage increases by <strong>1d10</strong> for each slot level above 3rd."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.CON,
  isDamagingSpell: true,
  damage: [
    [DICE.D10, DAMAGE_TYPE.THUNDER],
    [DICE.D10, DAMAGE_TYPE.THUNDER],
    [DICE.D10, DAMAGE_TYPE.THUNDER]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const tidalWave: SpellEntry = {
  id: "spell-tidal-wave",
  name: "Tidal Wave",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You conjure up a wave of water that crashes down on an area within range. The area can be up to 30 feet long, up to 10 feet wide, and up to 10 feet tall. Each creature in that area must make a Dexterity saving throw. On a failure, a creature takes <strong>4d8</strong> Bludgeoning damage and is knocked Prone. On a success, a creature takes half as much damage and isn't knocked Prone. The water then spreads out across the ground in all directions, extinguishing unprotected flames in its area and within 30 feet of it."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.DEX,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const tinyServant: SpellEntry = {
  id: "spell-tiny-servant",
  name: "Tiny Servant",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["8 hours"],
  description: [
    "You touch one Tiny, nonmagical object that isn't attached to another object or a surface and isn't being carried by another creature. The target animates and sprouts little arms and legs, becoming a creature under your control until the spell ends or the creature drops to 0 Hit Points. See the stat block for its statistics.",
    "As a Bonus Action, you can mentally command the creature if it is within 120 feet of you. If you control multiple creatures with this spell, you can command any or all of them at the same time, issuing the same command to each one. You decide what action the creature will take and where it will move during its next turn, or you can issue a simple, general command, such as to fetch a key, stand watch, or stack some books. If you issue no commands, the servant does nothing other than defend itself against hostile creatures. Once given an order, the servant continues to follow that order until its task is complete.",
    "When the creature drops to 0 Hit Points, it reverts to its original form, and any remaining damage carries over to that form.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, you can animate two additional objects for each slot level above 3rd.",
    "<strong>Tiny Servant.</strong> Tiny Construct.",
    "<strong>Armor Class.</strong> 15, natural armor.",
    "<strong>Hit Points.</strong> 10, <strong>4d4</strong>.",
    "<strong>Speed.</strong> 30 ft., climb 30 ft.",
    "<strong>Abilities.</strong> STR 4 (-3), DEX 16 (+3), CON 10 (+0), INT 2 (-4), WIS 10 (+0), CHA 1 (-5).",
    "<strong>Damage Immunities.</strong> Poison, Psychic.",
    "<strong>Condition Immunities.</strong> Blinded, Charmed, Deafened, Exhaustion, Frightened, Paralyzed, Petrified, Poisoned.",
    "<strong>Senses.</strong> Blindsight 60 ft., blind beyond this radius, passive Perception 10.",
    "<strong>Slam.</strong> Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: <strong>1d4</strong> + 3 Bludgeoning damage."
  ],
  isDamagingSpell: true,
  damage: [[DICE.D4, DAMAGE_TYPE.BLUDGEONING]],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD, SPELL_LIST_CLASS.ARTIFICER],
  spellLevel: 3
};

export const tongues: SpellEntry = {
  id: "spell-tongues",
  name: "Tongues",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  description: [
    "This spell grants the creature you touch the ability to understand any spoken language it hears. Moreover, when the target speaks, any creature that knows at least one language and can hear the target understands what it says."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const vampiricTouch: SpellEntry = {
  id: "spell-vampiric-touch",
  name: "Vampiric Touch",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "The touch of your shadow-wreathed hand can siphon force from others to heal your wounds. Make a melee spell attack against a creature within your reach. On a hit, the target takes <strong>3d6</strong> Necrotic damage, and you regain Hit Points equal to half the amount of Necrotic damage dealt. Until the spell ends, you can make the attack again on each of your turns as an action.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage increases by <strong>1d6</strong> for each slot level above 3rd."
  ],
  isHealingSpell: true,
  isAttackSpell: true,
  isDamagingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC]
  ],
  healing: { label: "Half damage dealt" },
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const wallOfSand: SpellEntry = {
  id: "spell-wall-of-sand",
  name: "Wall of Sand",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You conjure up a wall of swirling sand on the ground at a point you can see within range. You can make the wall up to 30 feet long, 10 feet high, and 10 feet thick, and it vanishes when the spell ends. It blocks line of sight but not movement. A creature is Blinded while in the wall's space and must spend 3 feet of movement for every 1 foot it moves there."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const wallOfWater: SpellEntry = {
  id: "spell-wall-of-water",
  name: "Wall of Water",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You conjure up a wall of water on the ground at a point you can see within range. You can make the wall up to 30 feet long, 10 feet high, and 1 foot thick, or you can make a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall vanishes when the spell ends. The wall's space is difficult terrain.",
    "Any ranged weapon attack that enters the wall's space has Disadvantage on the attack roll, and Fire damage is halved if the fire effect passes through the wall to reach its target. Spells that deal Cold damage that pass through the wall cause the area of the wall they pass through to freeze solid, at least a 5-foot square section is frozen. Each 5-foot-square frozen section has AC 5 and 15 Hit Points. Reducing a frozen section to 0 Hit Points destroys it. When a section is destroyed, the wall's water doesn't fill it."
  ],
  damage: [],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 3
};

export const waterBreathing: SpellEntry = {
  id: "spell-water-breathing",
  name: "Water Breathing",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["24 hours"],
  ritual: true,
  description: [
    "This spell grants up to ten willing creatures you can see within range the ability to breathe underwater until the spell ends. Affected creatures also retain their normal mode of respiration."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 3
};

export const waterWalk: SpellEntry = {
  id: "spell-water-walk",
  name: "Water Walk",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  ritual: true,
  description: [
    "This spell grants the ability to move across any liquid surface, such as water, acid, mud, snow, quicksand, or lava, as if it were harmless solid ground, though creatures crossing molten lava can still take damage from the heat. Up to ten willing creatures you can see within range gain this ability for the duration.",
    "If you target a creature submerged in a liquid, the spell carries the target to the surface of the liquid at a rate of 60 feet per round."
  ],
  damage: [],
  healing: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER
  ],
  spellLevel: 3
};

export const windWall: SpellEntry = {
  id: "spell-wind-wall",
  name: "Wind Wall",
  category: ENTRY_CATEGORIES.SPELLS,
  trackingState: TRACKER.NOT_TRACKED,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A wall of strong wind rises from the ground at a point you choose within range. You can make the wall up to 50 feet long, 15 feet high, and 1 foot thick. You can shape the wall in any way you choose so long as it makes one continuous path along the ground. The wall lasts for the duration.",
    "When the wall appears, each creature within its area must make a Strength saving throw. A creature takes <strong>3d8</strong> Bludgeoning damage on a failed save, or half as much damage on a successful one.",
    "The strong wind keeps fog, smoke, and other gases at bay. Small or smaller flying creatures or objects can't pass through the wall. Loose, lightweight materials brought into the wall fly upward. Arrows, bolts, and other ordinary projectiles launched at targets behind the wall are deflected upward and automatically miss. Boulders hurled by giants or siege engines, and similar projectiles, are unaffected. Creatures in gaseous form can't pass through it."
  ],
  isSavingThrowSpell: true,
  savingThrowAbility: ABILITY_TYPES.STR,
  isDamagingSpell: true,
  damage: [
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING]
  ],
  healing: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 3
};

export const spellEntries3: SpellEntry[] = [
  animateDead,
  antagonize,
  ashardalonsStride,
  auraOfVitality,
  beaconOfHope,
  bestowCurse,
  blindingSmite,
  blink,
  callLightning,
  catnap,
  clairvoyance,
  conjureAnimals,
  conjureBarrage,
  conjureLesserDemon,
  counterspell,
  createFoodAndWater,
  crusadersMantle,
  daylight,
  dispelMagic,
  elementalWeapon,
  enemiesAbound,
  eruptingEarth,
  fastFriends,
  fear,
  feignDeath,
  fireball,
  flameArrows,
  flameStride,
  fly,
  galdersTower,
  gaseousForm,
  glyphOfWarding,
  haste,
  haywire,
  houseOfCards,
  hungerOfHadar,
  hypnoticPattern,
  inciteGreed,
  intellectFortress,
  invisibilityToCameras,
  leomundsTinyHut,
  lifeTransference,
  lightningArrow,
  lightningBolt,
  magicCircle,
  majorImage,
  massHealingWord,
  meldIntoStone,
  melfsMinuteMeteors,
  motivationalSpeech,
  nondetection,
  phantomSteed,
  plantGrowth,
  protectionFromBallistics,
  protectionFromEnergy,
  psionicBlast,
  pulseWave,
  removeCurse,
  revivify,
  sending,
  sleetStorm,
  slow,
  speakWithDead,
  speakWithPlants,
  spiritGuardians,
  spiritShroud,
  stinkingCloud,
  summonFey,
  summonLesserDemons,
  summonShadowspawn,
  summonUndead,
  summonWarriorSpirit,
  thunderStep,
  tidalWave,
  tinyServant,
  tongues,
  vampiricTouch,
  wallOfSand,
  wallOfWater,
  waterBreathing,
  waterWalk,
  windWall
];
