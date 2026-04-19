import {
  ACTION_TYPE,
  DURATION,
  DAMAGE_TYPE,
  DICE,
  ENTRY_CATEGORIES,
  MAGIC_SCHOOL,
  SPELL_COMPONENT,
  SPELL_LIST_CLASS
} from "../../entries/enums";
import type { SpellEntry } from "../../entries/types";

export const aganazzarsScorcher: SpellEntry = {
  id: "spell-aganazzars-scorcher",
  name: "Aganazzar's Scorcher",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "A line of roaring flame 30 feet long and 5 feet wide emanates from you in a direction you choose. Each creature in the line must make a Dexterity saving throw. A creature takes <strong>3d8</strong> Fire damage on a failed save, or half as much damage on a successful one.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage increases by <strong>1d8</strong> for each slot level above 2nd."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const aid: SpellEntry = {
  id: "spell-aid",
  name: "Aid",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["8 hours"],
  description: [
    "Your spell bolsters your allies with toughness and resolve. Choose up to three creatures within range. Each target's Hit Point maximum and current Hit Points increase by 5 for the duration.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, a target's Hit Points increase by an additional 5 for each slot level above 2nd."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.RANGER
  ],
  spellLevel: 2
};

export const airBubble: SpellEntry = {
  id: "spell-air-bubble",
  name: "Air Bubble",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.S],
  duration: ["24 hours"],
  description: [
    "You create a spectral globe around the head of a willing creature you can see within range. The globe is filled with fresh air that lasts until the spell ends. If the creature has more than one head, the globe of air appears around only one of its heads, which is all the creature needs to avoid suffocation, assuming that all its heads share the same respiratory system.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, you can create two additional globes of fresh air for each slot level above 2nd."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const alterSelf: SpellEntry = {
  id: "spell-alter-self",
  name: "Alter Self",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You assume a different form. When you cast the spell, choose one of the following options, the effects of which last for the duration of the spell. While the spell lasts, you can end one option as an action to gain the benefits of a different one.",
    "<strong>Aquatic Adaptation.</strong> You adapt your body to an aquatic environment, sprouting gills, and growing webbing between your fingers. You can breathe underwater and gain a Swimming Speed equal to your walking Speed.",
    "<strong>Change Appearance.</strong> You transform your appearance. You decide what you look like, including your height, weight, facial features, sound of your voice, hair length, coloration, and distinguishing characteristics, if any. You can make yourself appear as a member of another species, though none of your statistics change. You also don't appear as a creature of a different size than you, and your basic shape stays the same; if you're bipedal, you can't use this spell to become quadrupedal, for instance. At any time for the duration of the spell, you can use your action to change your appearance in this way again.",
    "<strong>Natural Weapons.</strong> You grow claws, fangs, spines, horns, or a different natural weapon of your choice. Your Unarmed Strikes deal <strong>1d6</strong> Bludgeoning, Piercing, or Slashing damage, as appropriate to the natural weapon you chose, and you are proficient with your Unarmed Strikes. Finally, the natural weapon is magical and you have a +1 bonus to the attack and damage rolls you make using it."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const animalMessenger: SpellEntry = {
  id: "spell-animal-messenger",
  name: "Animal Messenger",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["24 hours"],
  ritual: true,
  description: [
    'By means of this spell, you use an animal to deliver a message. Choose a Tiny Beast you can see within range, such as a squirrel, a blue jay, or a bat. You specify a location, which you must have visited, and a recipient who matches a general description, such as "a man or woman dressed in the uniform of the town guard" or "a red-haired dwarf wearing a pointed hat." You also speak a message of up to twenty-five words. The target Beast travels for the duration of the spell toward the specified location, covering about 50 miles per 24 hours for a flying messenger, or 25 miles for other animals.',
    "When the messenger arrives, it delivers your message to the creature that you described, replicating the sound of your voice. The messenger speaks only to a creature matching the description you gave. If the messenger doesn't reach its destination before the spell ends, the message is lost, and the Beast makes its way back to where you cast this spell.",
    "<strong>At Higher Levels.</strong> If you cast this spell using a spell slot of 3rd level or higher, the duration of the spell increases by 48 hours for each slot level above 2nd."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 2
};

export const arcaneHacking: SpellEntry = {
  id: "spell-arcane-hacking",
  name: "Arcane Hacking",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You gain Advantage on all Intelligence checks using hacking tools to break software encryption or online security when using a foreign system.",
    "This spell also allows you to break 2nd-level and lower protective spells such as Arcane Lock or Glyph of Warding by making an Intelligence check using hacking tools against the spell save DC of the spell's caster.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, you can attempt to counteract a spell set to secure the foreign system if the spell's level is equal to or less than the level of the spell slot you used."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const arcaneLock: SpellEntry = {
  id: "spell-arcane-lock",
  name: "Arcane Lock",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Until dispelled"],
  description: [
    "You touch a closed door, window, gate, chest, or other entryway, and it becomes locked for the duration.",
    "You and the creatures you designate when you cast this spell can open the object normally. You can also set a password that, when spoken within 5 feet of the object, suppresses this spell for 1 minute. Otherwise, it is impassable until it is broken or the spell is dispelled or suppressed. Casting Knock on the object suppresses Arcane Lock for 10 minutes.",
    "While affected by this spell, the object is more difficult to break or force open; the DC to break it or pick any locks on it increases by 10."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const augury: SpellEntry = {
  id: "spell-augury",
  name: "Augury",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  ritual: true,
  description: [
    "By casting gem-inlaid sticks, rolling dragon bones, laying out ornate cards, or employing some other divining tool, you receive an omen from an otherworldly entity about the results of a specific course of action that you plan to take within the next 30 minutes. The DM chooses from the following possible omens:",
    "Weal, for good results.",
    "Woe, for bad results.",
    "Weal and woe, for both good and bad results.",
    "Nothing, for results that aren't especially good or bad.",
    "The spell doesn't take into account any possible circumstances that might change the outcome, such as the casting of additional spells or the loss or gain of a companion. If you cast the spell two or more times before completing your next Long Rest, there is a cumulative 25 percent chance for each casting after the first that you get a random reading. The DM makes this roll in secret."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const barkskin: SpellEntry = {
  id: "spell-barkskin",
  name: "Barkskin",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You touch a willing creature. Until the spell ends, the target's skin has a rough, bark-like appearance, and the target's AC can't be less than 16, regardless of what kind of armor it is wearing."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 2
};

export const beastSense: SpellEntry = {
  id: "spell-beast-sense",
  name: "Beast Sense",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  ritual: true,
  description: [
    "You touch a willing Beast. For the duration of the spell, you can use your action to see through the Beast's eyes and hear what it hears, and continue to do so until you use your action to return to your normal senses."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 2
};

export const blindnessDeafness: SpellEntry = {
  id: "spell-blindness-deafness",
  name: "Blindness/Deafness",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["1 minute"],
  description: [
    "You can blind or deafen a foe. Choose one creature that you can see within range to make a Constitution saving throw. If it fails, the target is either Blinded or Deafened, your choice, for the duration. At the end of each of its turns, the target can make a Constitution saving throw. On a success, the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const blur: SpellEntry = {
  id: "spell-blur",
  name: "Blur",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Your body becomes blurred, shifting and wavering to all who can see you. For the duration, any creature has Disadvantage on attack rolls against you. An attacker is immune to this effect if it doesn't rely on sight, as with Blindsight, or can see through illusions, as with Truesight."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const borrowedKnowledge: SpellEntry = {
  id: "spell-borrowed-knowledge",
  name: "Borrowed Knowledge",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  description: [
    "You draw on knowledge from spirits of the past. Choose one skill in which you lack proficiency. For the spell's duration, you have proficiency in the chosen skill. The spell ends early if you cast it again."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const brandingSmite: SpellEntry = {
  id: "spell-branding-smite",
  name: "Branding Smite",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "The next time you hit a creature with a weapon attack before this spell ends, the weapon gleams with astral radiance as you strike. The attack deals an extra <strong>2d6</strong> Radiant damage to the target, which becomes visible if it is Invisible, and the target sheds dim light in a 5-foot radius and can't become Invisible until the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the extra damage increases by <strong>1d6</strong> for each slot level above 2nd."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.RADIANT],
    [DICE.D6, DAMAGE_TYPE.RADIANT]
  ],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 2
};

export const calmEmotions: SpellEntry = {
  id: "spell-calm-emotions",
  name: "Calm Emotions",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You attempt to suppress strong emotions in a group of people. Each Humanoid in a 20-foot-radius sphere centered on a point you choose within range must make a Charisma saving throw; a creature can choose to fail this saving throw if it wishes. If a creature fails its saving throw, choose one of the following two effects. You can suppress any effect causing a target to be Charmed or Frightened. When this spell ends, any suppressed effect resumes, provided that its duration has not expired in the meantime.",
    "Alternatively, you can make a target indifferent about creatures of your choice that it is hostile toward. This indifference ends if the target is attacked or harmed by a spell or if it witnesses any of its friends being harmed. When the spell ends, the creature becomes hostile again, unless the DM rules otherwise."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC],
  spellLevel: 2
};

export const cloudOfDaggers: SpellEntry = {
  id: "spell-cloud-of-daggers",
  name: "Cloud of Daggers",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You fill the air with spinning daggers in a cube 5 feet on each side, centered on a point you choose within range. A creature takes <strong>4d4</strong> Slashing damage when it enters the spell's area for the first time on a turn or starts its turn there.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage increases by <strong>2d4</strong> for each slot level above 2nd."
  ],
  damage: [
    [DICE.D4, DAMAGE_TYPE.SLASHING],
    [DICE.D4, DAMAGE_TYPE.SLASHING],
    [DICE.D4, DAMAGE_TYPE.SLASHING],
    [DICE.D4, DAMAGE_TYPE.SLASHING]
  ],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const continualFlame: SpellEntry = {
  id: "spell-continual-flame",
  name: "Continual Flame",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Until dispelled"],
  description: [
    "A flame, equivalent in brightness to a torch, springs forth from an object that you touch. The effect looks like a regular flame, but it creates no heat and doesn't use oxygen. A Continual Flame can be covered or hidden but not smothered or quenched."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const cordonOfArrows: SpellEntry = {
  id: "spell-cordon-of-arrows",
  name: "Cordon of Arrows",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "5 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["8 hours"],
  description: [
    "You plant four pieces of nonmagical ammunition, arrows or crossbow bolts, in the ground within range and lay magic upon them to protect an area. Until the spell ends, whenever a creature other than you comes within 30 feet of the ammunition for the first time on a turn or ends its turn there, one piece of ammunition flies up to strike it. The creature must succeed on a Dexterity saving throw or take <strong>1d6</strong> Piercing damage. The piece of ammunition is then destroyed. The spell ends when no ammunition remains.",
    "When you cast this spell, you can designate any creatures you choose, and the spell ignores them.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the amount of ammunition that can be affected increases by two for each slot level above 2nd."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.PIERCING]],
  spellLists: [SPELL_LIST_CLASS.RANGER],
  spellLevel: 2
};

export const crownOfMadness: SpellEntry = {
  id: "spell-crown-of-madness",
  name: "Crown of Madness",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "One Humanoid of your choice that you can see within range must succeed on a Wisdom saving throw or become Charmed by you for the duration. While the target is Charmed in this way, a twisted crown of jagged iron appears on its head, and a madness glows in its eyes.",
    "The Charmed target must use its action before moving on each of its turns to make a melee attack against a creature other than itself that you mentally choose. The target can act normally on its turn if you choose no creature or if none are within its reach.",
    "On your subsequent turns, you must use your action to maintain control over the target, or the spell ends. Also, the target can make a Wisdom saving throw at the end of each of its turns. On a success, the spell ends."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const darkness: SpellEntry = {
  id: "spell-darkness",
  name: "Darkness",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Magical darkness spreads from a point you choose within range to fill a 15-foot-radius sphere for the duration. The darkness spreads around corners. A creature with Darkvision can't see through this darkness, and nonmagical light can't illuminate it.",
    "If the point you choose is on an object you are holding or one that isn't being worn or carried, the darkness emanates from the object and moves with it. Completely covering the source of the darkness with an opaque object, such as a bowl or a helm, blocks the darkness.",
    "If any of this spell's area overlaps with an area of light created by a spell of 2nd level or lower, the spell that created the light is dispelled."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const darkvision: SpellEntry = {
  id: "spell-darkvision",
  name: "Darkvision",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["8 hours"],
  description: [
    "You touch a willing creature to grant it the ability to see in the dark. For the duration, that creature has Darkvision out to a range of 60 feet."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const detectThoughts: SpellEntry = {
  id: "spell-detect-thoughts",
  name: "Detect Thoughts",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "For the duration, you can read the thoughts of certain creatures. When you cast the spell and as your action on each turn until the spell ends, you can focus your mind on any one creature that you can see within 30 feet of you. If the creature you choose has an Intelligence of 3 or lower or doesn't speak any language, the creature is unaffected.",
    "You initially learn the surface thoughts of the creature, what is most on its mind in that moment. As an action, you can either shift your attention to another creature's thoughts or attempt to probe deeper into the same creature's mind. If you probe deeper, the target must make a Wisdom saving throw. If it fails, you gain insight into its reasoning, if any, its emotional state, and something that looms large in its mind, such as something it worries over, loves, or hates. If it succeeds, the spell ends. Either way, the target knows that you are probing into its mind, and unless you shift your attention to another creature's thoughts, the creature can use its action on its turn to make an Intelligence check contested by your Intelligence check; if it succeeds, the spell ends.",
    "Questions verbally directed at the target creature naturally shape the course of its thoughts, so this spell is particularly effective as part of an interrogation.",
    "You can also use this spell to detect the presence of thinking creatures you can't see. When you cast the spell or as your action during the duration, you can search for thoughts within 30 feet of you. The spell can penetrate barriers, but 2 feet of rock, 2 inches of any metal other than lead, or a thin sheet of lead blocks you. You can't detect a creature with an Intelligence of 3 or lower or one that doesn't speak any language.",
    "Once you detect the presence of a creature in this way, you can read its thoughts for the rest of the duration as described above, even if you can't see it, but it must still be within range."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const digitalPhantom: SpellEntry = {
  id: "spell-digital-phantom",
  name: "Digital Phantom",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "This spell works to actively hide your presence within a computer system. For the spell's duration, you and any other users you choose on your local network gain a +10 bonus to Intelligence checks to avoid detection by administrators, knowbots, tracking software, and the like. Whenever you and your chosen users leave any computer system you are working in while this spell is in effect, all trace of your previous presence in that system is erased."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const dragonsBreath: SpellEntry = {
  id: "spell-dragons-breath",
  name: "Dragon's Breath",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You touch one willing creature and imbue it with the power to spew magical energy from its mouth, provided it has one. Choose Acid, Cold, Fire, Lightning, or Poison. Until the spell ends, the creature can use an action to exhale energy of the chosen type in a 15-foot cone. Each creature in that area must make a Dexterity saving throw, taking <strong>3d6</strong> damage of the chosen type on a failed save, or half as much damage on a successful one.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage increases by <strong>1d6</strong> for each slot level above 2nd."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const dustDevil: SpellEntry = {
  id: "spell-dust-devil",
  name: "Dust Devil",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Choose an unoccupied 5-foot cube of air that you can see within range. An elemental force that resembles a dust devil appears in the cube and lasts for the spell's duration.",
    "Any creature that ends its turn within 5 feet of the dust devil must make a Strength saving throw. On a failed save, the creature takes <strong>1d8</strong> Bludgeoning damage and is pushed 10 feet away. On a successful save, the creature takes half as much damage and isn't pushed.",
    "As a Bonus Action, you can move the dust devil up to 30 feet in any direction. If the dust devil moves over sand, dust, loose dirt, or small gravel, it sucks up the material and forms a 10-foot-radius cloud of debris around itself that lasts until the start of your next turn. The cloud heavily obscures its area.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage increases by <strong>1d8</strong> for each slot level above 2nd."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.BLUDGEONING]],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const earthbind: SpellEntry = {
  id: "spell-earthbind",
  name: "Earthbind",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "300 feet",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Choose one creature you can see within range. Yellow strips of magical energy loop around the creature. The target must succeed on a Strength saving throw or its Flying Speed, if any, is reduced to 0 feet for the spell's duration. An airborne creature affected by this spell descends at 60 feet per round until it reaches the ground or the spell ends."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const enhanceAbility: SpellEntry = {
  id: "spell-enhance-ability",
  name: "Enhance Ability",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You touch a creature and bestow upon it a magical enhancement. Choose one of the following effects; the target gains the effect until the spell ends.",
    "<strong>Bear's Endurance.</strong> The target has Advantage on Constitution checks. It also gains <strong>2d6</strong> Temporary Hit Points, which are lost when the spell ends.",
    "<strong>Bull's Strength.</strong> The target has Advantage on Strength checks, and its carrying capacity doubles.",
    "<strong>Cat's Grace.</strong> The target has Advantage on Dexterity checks. It also doesn't take damage from falling 20 feet or less if it isn't Incapacitated.",
    "<strong>Eagle's Splendor.</strong> The target has Advantage on Charisma checks.",
    "<strong>Fox's Cunning.</strong> The target has Advantage on Intelligence checks.",
    "<strong>Owl's Wisdom.</strong> The target has Advantage on Wisdom checks.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const enlargeReduce: SpellEntry = {
  id: "spell-enlarge-reduce",
  name: "Enlarge/Reduce",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You cause a creature or an object you can see within range to grow larger or smaller for the duration. Choose either a creature or an object that is neither worn nor carried. If the target is unwilling, it can make a Constitution saving throw. On a success, the spell has no effect.",
    "If the target is a creature, everything it is wearing and carrying changes size with it. Any item dropped by an affected creature returns to normal size at once.",
    "<strong>Enlarge.</strong> The target's size doubles in all dimensions, and its weight is multiplied by eight. This growth increases its size by one category, from Medium to Large, for example. If there isn't enough room for the target to double its size, the creature or object attains the maximum possible size in the space available. Until the spell ends, the target also has Advantage on Strength checks and Strength saving throws. The target's weapons also grow to match its new size. While these weapons are enlarged, the target's attacks with them deal <strong>1d4</strong> extra damage.",
    "<strong>Reduce.</strong> The target's size is halved in all dimensions, and its weight is reduced to one-eighth of normal. This reduction decreases its size by one category, from Medium to Small, for example. Until the spell ends, the target also has Disadvantage on Strength checks and Strength saving throws. The target's weapons also shrink to match its new size. While these weapons are reduced, the target's attacks with them deal <strong>1d4</strong> less damage, which can't reduce the damage below 1."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const enthrall: SpellEntry = {
  id: "spell-enthrall",
  name: "Enthrall",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 minute"],
  description: [
    "You weave a distracting string of words, causing creatures of your choice that you can see within range and that can hear you to make a Wisdom saving throw. Any creature that can't be Charmed succeeds on this saving throw automatically, and if you or your companions are fighting a creature, it has Advantage on the save. On a failed save, the target has Disadvantage on Wisdom (Perception) checks made to perceive any creature other than you until the spell ends or until the target can no longer hear you. The spell ends if you are Incapacitated or can no longer speak."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 2
};

export const findSteed: SpellEntry = {
  id: "spell-find-steed",
  name: "Find Steed",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You summon a spirit that assumes the form of an unusually intelligent, strong, and loyal steed, creating a long-lasting bond with it. Appearing in an unoccupied space within range, the steed takes on a form that you choose: a warhorse, a pony, a camel, an elk, or a mastiff. Your DM might allow other animals to be summoned as steeds. The steed has the statistics of the chosen form, though it is a Celestial, Fey, or Fiend, your choice, instead of its normal type. Additionally, if your steed has an Intelligence of 5 or less, its Intelligence becomes 6, and it gains the ability to understand one language of your choice that you speak.",
    "Your steed serves you as a mount, both in combat and out, and you have an instinctive bond with it that allows you to fight as a seamless unit. While mounted on your steed, you can make any spell you cast that targets only you also target your steed.",
    "When the steed drops to 0 Hit Points, it disappears, leaving behind no physical form. You can also dismiss your steed at any time as an action, causing it to disappear. In either case, casting this spell again summons the same steed, restored to its Hit Point maximum.",
    "While your steed is within 1 mile of you, you can communicate with each other telepathically. You can't have more than one steed bonded by this spell at a time. As an action, you can release the steed from its bond at any time, causing it to disappear."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 2
};

export const findTraps: SpellEntry = {
  id: "spell-find-traps",
  name: "Find Traps",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You sense the presence of any trap within range that is within line of sight.",
    "A trap, for the purpose of this spell, includes anything that would inflict a sudden or unexpected effect you consider harmful or undesirable, which was specifically intended as such by its creator. Thus, the spell would sense an area affected by the Alarm spell, a Glyph of Warding, or a mechanical pit trap, but it would not reveal a natural weakness in the floor, an unstable ceiling, or a hidden sinkhole.",
    "This spell merely reveals that a trap is present. You don't learn the location of each trap, but you do learn the general nature of the danger posed by a trap you sense."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 2
};

export const findVehicle: SpellEntry = {
  id: "spell-find-vehicle",
  name: "Find Vehicle",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["8 hours"],
  description: [
    "You summon a spirit that assumes the form of a nonmilitary land vehicle of your choice, appearing in an unoccupied space within range. The vehicle has the statistics of a normal vehicle of its sort, though it is Celestial, Fey, or Fiendish, your choice in origin. The physical characteristics of the vehicle reflect its origin to some degree. For example, a fiendish SUV might be jet black in color, with tinted windows and a sinister-looking front grille.",
    "You have a supernatural bond with the conjured vehicle that allows you to drive beyond your normal ability. While driving the conjured vehicle, you are considered proficient with vehicles of its type, and you add double your Proficiency Bonus to ability checks related to driving the vehicle. While driving the vehicle, you can make any spell you cast that targets only you also target the vehicle.",
    "If the vehicle drops to 0 Hit Points, it disappears, leaving behind no physical form. You can also dismiss the vehicle at any time as an action, causing it to disappear.",
    "You can't have more than one vehicle bonded by this spell at a time. As an action, you can release the vehicle from its bond at any time, causing it to disappear.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, you can conjure a nonmilitary water vehicle large enough to carry six Medium creatures. When you cast this spell using a spell slot of 5th level or higher, you can conjure a nonmilitary air vehicle large enough to carry ten Medium creatures. When you cast this spell using a spell slot of 7th level or higher, you can conjure any type of vehicle, subject to the DM's approval."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const flameBlade: SpellEntry = {
  id: "spell-flame-blade",
  name: "Flame Blade",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You evoke a fiery blade in your free hand. The blade is similar in size and shape to a scimitar, and it lasts for the duration. If you let go of the blade, it disappears, but you can evoke the blade again as a Bonus Action.",
    "You can use your action to make a melee spell attack with the fiery blade. On a hit, the target takes <strong>3d6</strong> Fire damage. The flaming blade sheds bright light in a 10-foot radius and dim light for an additional 10 feet.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the damage increases by <strong>1d6</strong> for every two slot levels above 2nd."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE]
  ],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER],
  spellLevel: 2
};

export const flamingSphere: SpellEntry = {
  id: "spell-flaming-sphere",
  name: "Flaming Sphere",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A 5-foot-diameter sphere of fire appears in an unoccupied space of your choice within range and lasts for the duration. Any creature that ends its turn within 5 feet of the sphere must make a Dexterity saving throw. The creature takes <strong>2d6</strong> Fire damage on a failed save, or half as much damage on a successful one.",
    "As a Bonus Action, you can move the sphere up to 30 feet. If you ram the sphere into a creature, that creature must make the saving throw against the sphere's damage, and the sphere stops moving this turn.",
    "When you move the sphere, you can direct it over barriers up to 5 feet tall and jump it across pits up to 10 feet wide. The sphere ignites flammable objects not being worn or carried, and it sheds bright light in a 20-foot radius and dim light for an additional 20 feet.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage increases by <strong>1d6</strong> for each slot level above 2nd."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE]
  ],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const flockOfFamiliars: SpellEntry = {
  id: "spell-flock-of-familiars",
  name: "Flock of Familiars",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You temporarily summon three familiars, spirits that take animal forms of your choice. Each familiar uses the same rules and options for a familiar conjured by the Find Familiar spell. All the familiars conjured by this spell must be the same type of creature, Celestials, Fey, or Fiends; your choice. If you already have a familiar conjured by the Find Familiar spell or similar means, then one fewer familiar is conjured by this spell.",
    "Familiars summoned by this spell can telepathically communicate with you and share their visual or auditory senses while they are within 1 mile of you.",
    "When you cast a spell with a range of Touch, one of the familiars conjured by this spell can deliver the spell, as normal. However, you can cast a Touch spell through only one familiar per turn.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, you conjure an additional familiar for each slot level above 2nd."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const fortunesFavor: SpellEntry = {
  id: "spell-fortunes-favor",
  name: "Fortune's Favor",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  description: [
    "You impart latent luck to yourself or one willing creature you can see within range. When the chosen creature makes an attack roll, an ability check, or a saving throw before the spell ends, it can dismiss this spell on itself to roll an additional <strong>d20</strong> and choose which of the <strong>d20s</strong> to use. Alternatively, when an attack roll is made against the chosen creature, it can dismiss this spell on itself to roll a <strong>d20</strong> and choose which of the <strong>d20s</strong> to use, the one it rolled or the one the attacker rolled.",
    "If the original <strong>d20</strong> roll has Advantage or Disadvantage, the creature rolls the additional <strong>d20</strong> after Advantage or Disadvantage has been applied to the original roll.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const gentleRepose: SpellEntry = {
  id: "spell-gentle-repose",
  name: "Gentle Repose",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["10 days"],
  description: [
    "You touch a corpse or other remains. For the duration, the target is protected from decay and can't become Undead.",
    "The spell also effectively extends the time limit on raising the target from the dead, since days spent under the influence of this spell don't count against the time limit of spells such as Raise Dead."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const giftOfGab: SpellEntry = {
  id: "spell-gift-of-gab",
  name: "Gift of Gab",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.REACTION, "which you take when you speak to another creature"],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "When you cast this spell, you skillfully reshape the memories of listeners in your immediate area, so that each creature of your choice within 5 feet of you forgets everything you said within the last 6 seconds. Those creatures then remember that you actually said the words you speak as the Verbal component of the spell."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const gustOfWind: SpellEntry = {
  id: "spell-gust-of-wind",
  name: "Gust of Wind",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (60-foot line)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A line of strong wind 60 feet long and 10 feet wide blasts from you in a direction you choose for the spell's duration. Each creature that starts its turn in the line must succeed on a Strength saving throw or be pushed 15 feet away from you in a direction following the line.",
    "Any creature in the line must spend 2 feet of movement for every 1 foot it moves when moving closer to you.",
    "The gust disperses gas or vapor, and it extinguishes candles, torches, and similar unprotected flames in the area. It causes protected flames, such as those of lanterns, to dance wildly and has a 50 percent chance to extinguish them.",
    "As a Bonus Action on each of your turns before the spell ends, you can change the direction in which the line blasts from you."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const healingSpirit: SpellEntry = {
  id: "spell-healing-spirit",
  name: "Healing Spirit",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You call forth a nature spirit to soothe the wounded. The intangible spirit appears in a space that is a 5-foot cube you can see within range. The spirit looks like a transparent Beast or Fey, your choice.",
    "Until the spell ends, whenever you or a creature you can see moves into the spirit's space for the first time on a turn or starts its turn there, you can cause the spirit to restore <strong>1d6</strong> Hit Points to that creature, no action required. The spirit can't heal Constructs or Undead.",
    "As a Bonus Action on your turn, you can move the spirit up to 30 feet to a space you can see. The spirit can heal a number of times equal to 1 + your spellcasting ability modifier, minimum of twice. After healing that number of times, the spirit disappears.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the healing increases by <strong>1d6</strong> for each slot level above 2nd."
  ],
  isHealingSpell: true,
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 2
};

export const heatMetal: SpellEntry = {
  id: "spell-heat-metal",
  name: "Heat Metal",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Choose a manufactured metal object, such as a metal weapon or a suit of Heavy or Medium metal armor, that you can see within range. You cause the object to glow red-hot. Any creature in physical contact with the object takes <strong>2d8</strong> Fire damage when you cast the spell. Until the spell ends, you can use a Bonus Action on each of your subsequent turns to cause this damage again.",
    "If a creature is holding or wearing the object and takes the damage from it, the creature must succeed on a Constitution saving throw or drop the object if it can. If it doesn't drop the object, it has Disadvantage on attack rolls and ability checks until the start of your next turn.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage increases by <strong>1d8</strong> for each slot level above 2nd."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE]
  ],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID],
  spellLevel: 2
};

export const holdPerson: SpellEntry = {
  id: "spell-hold-person",
  name: "Hold Person",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Choose a Humanoid that you can see within range. The target must succeed on a Wisdom saving throw or be Paralyzed for the duration. At the end of each of its turns, the target can make another Wisdom saving throw. On a success, the spell ends on the target.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, you can target one additional Humanoid for each slot level above 2nd. The Humanoids must be within 30 feet of each other when you target them."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const icingdeathsFrost: SpellEntry = {
  id: "spell-icingdeaths-frost",
  name: "Icingdeath's Frost",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (15-foot cone)",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "A burst of icy cold energy emanates from you in a 30-foot cone. Each creature in that area must make a Constitution saving throw. On a failed save, a creature takes <strong>3d8</strong> Cold damage and is covered in ice for 1 minute or until a creature uses its action to break the ice off itself or another creature. A creature covered in ice has its Speed reduced to 0. On a successful save, a creature takes half as much damage with no additional effects.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, increase the cold damage by <strong>1d8</strong> for each slot level above 2nd."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.COLD],
    [DICE.D8, DAMAGE_TYPE.COLD],
    [DICE.D8, DAMAGE_TYPE.COLD]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const immovableObject: SpellEntry = {
  id: "spell-immovable-object",
  name: "Immovable Object",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  description: [
    "You touch an object that weighs no more than 10 pounds and cause it to become magically fixed in place. You and the creatures you designate when you cast this spell can move the object normally. You can also set a password that, when spoken within 5 feet of the object, suppresses this spell for 1 minute.",
    "If the object is fixed in the air, it can hold up to 4,000 pounds of weight. More weight causes the object to fall. Otherwise, a creature can use an action to make a Strength check against your spell save DC. On a success, the creature can move the object up to 10 feet.",
    "<strong>At Higher Levels.</strong> If you cast this spell using a spell slot of 4th or 5th level, the DC to move the object increases by 5, it can carry up to 8,000 pounds of weight, and the duration increases to 24 hours. If you cast this spell using a spell slot of 6th level or higher, the DC to move the object increases by 10, it can carry up to 20,000 pounds of weight, and the effect is permanent until dispelled."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const invisibility: SpellEntry = {
  id: "spell-invisibility",
  name: "Invisibility",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "A creature you touch becomes Invisible until the spell ends. Anything the target is wearing or carrying is Invisible as long as it is on the target's person. The spell ends for a target that attacks or casts a spell.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const jimsGlowingCoin: SpellEntry = {
  id: "spell-jims-glowing-coin",
  name: "Jim's Glowing Coin",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 minute"],
  description: [
    "When you cast the spell, you hurl the coin that is the spell's material component to any spot within range. The coin lights up as if under the effect of a Light spell. Each creature of your choice that you can see within 30 feet of the coin must succeed on a Wisdom saving throw or be distracted for the duration. While distracted, a creature has Disadvantage on Wisdom (Perception) checks and Initiative rolls."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const kineticJaunt: SpellEntry = {
  id: "spell-kinetic-jaunt",
  name: "Kinetic Jaunt",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You magically empower your movement with dancelike steps, giving yourself the following benefits for the duration:",
    "Your walking Speed increases by 10 feet.",
    "You don't provoke Opportunity Attacks.",
    "You can move through the space of another creature, and it doesn't count as difficult terrain. If you end your turn in another creature's space, you are shunted to the last unoccupied space you occupied, and you take <strong>1d8</strong> Force damage."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.FORCE]],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const knock: SpellEntry = {
  id: "spell-knock",
  name: "Knock",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "Choose an object that you can see within range. The object can be a door, a box, a chest, a set of manacles, a padlock, or another object that contains a mundane or magical means that prevents access.",
    "A target that is held shut by a mundane lock or that is stuck or barred becomes unlocked, unstuck, or unbarred. If the object has multiple locks, only one of them is unlocked.",
    "If you choose a target that is held shut with Arcane Lock, that spell is suppressed for 10 minutes, during which time the target can be opened and shut normally.",
    "When you cast the spell, a loud knock, audible from as far away as 300 feet, emanates from the target object."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const lesserRestoration: SpellEntry = {
  id: "spell-lesser-restoration",
  name: "Lesser Restoration",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You touch a creature and can end either one disease or one condition afflicting it. The condition can be Blinded, Deafened, Paralyzed, or Poisoned."
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
  spellLevel: 2
};

export const levitate: SpellEntry = {
  id: "spell-levitate",
  name: "Levitate",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "One creature or loose object of your choice that you can see within range rises vertically, up to 20 feet, and remains suspended there for the duration. The spell can levitate a target that weighs up to 500 pounds. An unwilling creature that succeeds on a Constitution saving throw is unaffected.",
    "The target can move only by pushing or pulling against a fixed object or surface within reach, such as a wall or a ceiling, which allows it to move as if it were climbing. You can change the target's altitude by up to 20 feet in either direction on your turn. If you are the target, you can move up or down as part of your move. Otherwise, you can use your action to move the target, which must remain within the spell's range.",
    "When the spell ends, the target floats gently to the ground if it is still aloft."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const locateAnimalsOrPlants: SpellEntry = {
  id: "spell-locate-animals-or-plants",
  name: "Locate Animals or Plants",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "Describe or name a specific kind of Beast or plant. Concentrating on the voice of nature in your surroundings, you learn the direction and distance to the closest creature or plant of that kind within 5 miles, if any are present."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 2
};

export const locateObject: SpellEntry = {
  id: "spell-locate-object",
  name: "Locate Object",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  ritual: true,
  description: [
    "Describe or name an object that is familiar to you. You sense the direction to the object's location, as long as that object is within 1,000 feet of you. If the object is in motion, you know the direction of its movement.",
    "The spell can locate a specific object known to you, as long as you have seen it up close, within 30 feet, at least once. Alternatively, the spell can locate the nearest object of a particular kind, such as a certain kind of apparel, jewelry, furniture, tool, or weapon.",
    "This spell can't locate an object if any thickness of lead, even a thin sheet, blocks a direct path between you and the object."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const magicMouth: SpellEntry = {
  id: "spell-magic-mouth",
  name: "Magic Mouth",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Until dispelled"],
  ritual: true,
  description: [
    "You implant a message within an object in range, a message that is uttered when a trigger condition is met. Choose an object that you can see and that isn't being worn or carried by another creature. Then speak the message, which must be 25 words or less, though it can be delivered over as long as 10 minutes. Finally, determine the circumstance that will trigger the spell to deliver your message.",
    "When that circumstance occurs, a magical mouth appears on the object and recites the message in your voice and at the same volume you spoke. If the object you chose has a mouth or something that looks like a mouth, for example, the mouth of a statue, the magical mouth appears there so that words appear to come from the object's mouth. When you cast this spell, you can have the spell end after it delivers its message, or it can remain and repeat its message whenever the trigger occurs.",
    "The triggering circumstance can be as general or as detailed as you like, though it must be based on visual or audible conditions that occur within 30 feet of the object. For example, you could instruct the mouth to speak when any creature moves within 30 feet of the object or when a silver bell rings within 30 feet of it."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const magicWeapon: SpellEntry = {
  id: "spell-magic-weapon",
  name: "Magic Weapon",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to attack rolls and damage rolls.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 4th level or higher, the bonus increases to +2. When you use a spell slot of 6th level or higher, the bonus increases to +3."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const maximilliansEarthenGrasp: SpellEntry = {
  id: "spell-maximillians-earthen-grasp",
  name: "Maximillian's Earthen Grasp",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You choose a 5-foot-square unoccupied space on the ground that you can see within range. A Medium hand made from compacted soil rises there and reaches for one creature you can see within 5 feet of it. The target must make a Strength saving throw. On a failed save, the target takes <strong>2d6</strong> Bludgeoning damage and is Restrained for the spell's duration.",
    "As an action, you can cause the hand to crush the Restrained target, who must make a Strength saving throw. It takes <strong>2d6</strong> Bludgeoning damage on a failed save, or half as much damage on a successful one.",
    "To break out, the Restrained target can use its action to make a Strength check against your spell save DC. On a success, the target escapes and is no longer Restrained by the hand.",
    "As an action, you can cause the hand to reach for a different creature or to move to a different unoccupied space within range. The hand releases a Restrained target if you do either."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const melfsAcidArrow: SpellEntry = {
  id: "spell-melfs-acid-arrow",
  name: "Melf's Acid Arrow",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes <strong>4d4</strong> Acid damage immediately and <strong>2d4</strong> Acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage and no damage at the end of its next turn.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage, both initial and later, increases by <strong>1d4</strong> for each slot level above 2nd."
  ],
  damage: [
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID],
    [DICE.D4, DAMAGE_TYPE.ACID]
  ],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const mentalBarrier: SpellEntry = {
  id: "spell-mental-barrier",
  name: "Mental Barrier",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [
    ACTION_TYPE.REACTION,
    "which you take when you are forced to make an Intelligence, a Wisdom, or a Charisma saving throw"
  ],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: ["1 round"],
  description: [
    "You protect your mind with a wall of looping, repetitive thought. Until the start of your next turn, you have Advantage on Intelligence, Wisdom, and Charisma saving throws, and you have Resistance to Psychic damage."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const mindSpike: SpellEntry = {
  id: "spell-mind-spike",
  name: "Mind Spike",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You reach into the mind of one creature you can see within range. The target must make a Wisdom saving throw, taking <strong>3d8</strong> Psychic damage on a failed save, or half as much damage on a successful one. On a failed save, you also always know the target's location until the spell ends, but only while the two of you are on the same plane of existence. While you have this knowledge, the target can't become Hidden from you, and if it's Invisible, it gains no benefit from that condition against you.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage increases by <strong>1d8</strong> for each slot level above 2nd."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.PSYCHIC],
    [DICE.D8, DAMAGE_TYPE.PSYCHIC],
    [DICE.D8, DAMAGE_TYPE.PSYCHIC]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const mindThrust: SpellEntry = {
  id: "spell-mind-thrust",
  name: "Mind Thrust",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 round"],
  description: [
    "You thrust a lance of psychic disruption into the mind of one creature you can see within range. The target must make an Intelligence saving throw. On a failed save, the target takes <strong>3d6</strong> Psychic damage, and it can't take a Reaction until the end of its next turn. Moreover, on its next turn, it must choose whether it gets a move, an action, or a Bonus Action; it gets only one of the three. On a successful save, the target takes half as much damage and suffers none of the spell's other effects.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd. The creatures must be within 30 feet of each other when you target them."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const mirrorImage: SpellEntry = {
  id: "spell-mirror-image",
  name: "Mirror Image",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 minute"],
  description: [
    "Three illusory duplicates of yourself appear in your space. Until the spell ends, the duplicates move with you and mimic your actions, shifting position so it's impossible to track which image is real. You can use your action to dismiss the illusory duplicates.",
    "Each time a creature targets you with an attack during the spell's duration, roll a <strong>d20</strong> to determine whether the attack instead targets one of your duplicates.",
    "If you have three duplicates, you must roll a 6 or higher to change the attack's target to a duplicate. With two duplicates, you must roll an 8 or higher. With one duplicate, you must roll an 11 or higher.",
    "A duplicate's AC equals 10 + your Dexterity modifier. If an attack hits a duplicate, the duplicate is destroyed. A duplicate can be destroyed only by an attack that hits it. It ignores all other damage and effects. The spell ends when all three duplicates are destroyed.",
    "A creature is unaffected by this spell if it can't see, if it relies on senses other than sight, such as Blindsight, or if it can perceive illusions as false, as with Truesight."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const mistyStep: SpellEntry = {
  id: "spell-misty-step",
  name: "Misty Step",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const moonbeam: SpellEntry = {
  id: "spell-moonbeam",
  name: "Moonbeam",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A silvery beam of pale light shines down in a 5-foot radius, 40-foot-high cylinder centered on a point within range. Until the spell ends, dim light fills the cylinder.",
    "When a creature enters the spell's area for the first time on a turn or starts its turn there, it is engulfed in ghostly flames that cause searing pain, and it must make a Constitution saving throw. It takes <strong>2d10</strong> Radiant damage on a failed save, or half as much damage on a successful one.",
    "A shapechanger makes its saving throw with Disadvantage. If it fails, it also instantly reverts to its original form and can't assume a different form until it leaves the spell's light.",
    "On each of your turns after you cast this spell, you can use an action to move the beam up to 60 feet in any direction.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage increases by <strong>1d10</strong> for each slot level above 2nd."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.RADIANT],
    [DICE.D10, DAMAGE_TYPE.RADIANT]
  ],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 2
};

export const nathairsMischief: SpellEntry = {
  id: "spell-nathairs-mischief",
  name: "Nathair's Mischief",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You fill a 20-foot cube you can see within range with fey and draconic magic. Roll on the Mischievous Surge table to determine the magical effect produced, and roll again at the start of each of your turns until the spell ends. You can move the cube up to 10 feet before you roll.",
    "<strong>Mischievous Surge 1.</strong> The smell of apple pie fills the air, and each creature in the cube must succeed on a Wisdom saving throw or become Charmed by you until the start of your next turn.",
    "<strong>Mischievous Surge 2.</strong> Bouquets of flowers appear all around, and each creature in the cube must succeed on a Dexterity saving throw or be Blinded until the start of your next turn as the flowers spray water in their faces.",
    "<strong>Mischievous Surge 3.</strong> Each creature in the cube must succeed on a Wisdom saving throw or begin giggling until the start of your next turn. A giggling creature is Incapacitated and uses all its movement to move in a random direction.",
    "<strong>Mischievous Surge 4.</strong> Drops of molasses appear and hover in the cube, turning it into difficult terrain until the start of your next turn."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const nystulsMagicAura: SpellEntry = {
  id: "spell-nystuls-magic-aura",
  name: "Nystul's Magic Aura",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["24 hours"],
  description: [
    "You place an illusion on a creature or an object you touch so that Divination spells reveal false information about it. The target can be a willing creature or an object that isn't being carried or worn by another creature.",
    "When you cast the spell, choose one or both of the following effects. The effect lasts for the duration. If you cast this spell on the same creature or object every day for 30 days, placing the same effect on it each time, the illusion lasts until it is dispelled.",
    "<strong>False Aura.</strong> You change the way the target appears to spells and magical effects, such as Detect Magic, that detect magical auras. You can make a nonmagical object appear magical, a magical object appear nonmagical, or change the object's magical aura so that it appears to belong to a specific school of magic that you choose. When you use this effect on an object, you can make the false magic apparent to any creature that handles the item.",
    "<strong>Mask.</strong> You change the way the target appears to spells and magical effects that detect creature types, such as a Paladin's Divine Sense or the trigger of a Symbol spell. You choose a creature type, and other spells and magical effects treat the target as if it were a creature of that type or of that alignment."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const passWithoutTrace: SpellEntry = {
  id: "spell-pass-without-trace",
  name: "Pass Without Trace",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "A veil of shadows and silence radiates from you, masking you and your companions from detection. For the duration, each creature you choose within 30 feet of you, including you, has a +10 bonus to Dexterity (Stealth) checks and can't be tracked except by magical means. A creature that receives this bonus leaves behind no tracks or other traces of its passage."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 2
};

export const phantasmalForce: SpellEntry = {
  id: "spell-phantasmal-force",
  name: "Phantasmal Force",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You craft an illusion that takes root in the mind of a creature that you can see within range. The target must make an Intelligence saving throw. On a failed save, you create a phantasmal object, creature, or other visible phenomenon of your choice that is no larger than a 10-foot cube and that is perceivable only to the target for the duration. This spell has no effect on Undead or Constructs.",
    "The phantasm includes sound, temperature, and other stimuli, also evident only to the creature.",
    "The target can use its action to examine the phantasm with an Intelligence (Investigation) check against your spell save DC. If the check succeeds, the target realizes that the phantasm is an illusion, and the spell ends.",
    "While a target is affected by the spell, the target treats the phantasm as if it were real. The target rationalizes any illogical outcomes from interacting with the phantasm. For example, a target attempting to walk across a phantasmal bridge that spans a chasm falls once it steps onto the bridge. If the target survives the fall, it still believes that the bridge exists and comes up with some other explanation for its fall; it was pushed, it slipped, or a strong wind might have knocked it off.",
    "An affected target is so convinced of the phantasm's reality that it can even take damage from the illusion. A phantasm created to appear as a creature can attack the target. Similarly, a phantasm created to appear as fire, a pool of acid, or lava can burn the target. Each round on your turn, the phantasm can deal <strong>1d6</strong> Psychic damage to the target if it is in the phantasm's area or within 5 feet of the phantasm, provided that the illusion is of a creature or hazard that could logically deal damage, such as by attacking. The target perceives the damage as a type appropriate to the illusion."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.PSYCHIC]],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const prayerOfHealing: SpellEntry = {
  id: "spell-prayer-of-healing",
  name: "Prayer of Healing",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "Up to six creatures of your choice that you can see within range each regain Hit Points equal to <strong>2d8</strong> + your spellcasting ability modifier. This spell has no effect on Undead or Constructs.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the healing increases by <strong>1d8</strong> for each slot level above 2nd."
  ],
  isHealingSpell: true,
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 2
};

export const protectionFromPoison: SpellEntry = {
  id: "spell-protection-from-poison",
  name: "Protection from Poison",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 hour"],
  description: [
    "You touch a creature. If it is Poisoned, you neutralize the poison. If more than one poison afflicts the target, you neutralize one poison that you know is present, or you neutralize one at random.",
    "For the duration, the target has Advantage on saving throws against being Poisoned, and it has Resistance to Poison damage."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.RANGER
  ],
  spellLevel: 2
};

export const pyrotechnics: SpellEntry = {
  id: "spell-pyrotechnics",
  name: "Pyrotechnics",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "Choose an area of flame that you can see and that can fit within a 5-foot cube within range. You can extinguish the fire in that area, and you create either fireworks or smoke.",
    "<strong>Fireworks.</strong> The target explodes with a dazzling display of colors. Each creature within 10 feet of the target must succeed on a Constitution saving throw or become Blinded until the end of your next turn.",
    "<strong>Smoke.</strong> Thick black smoke spreads out from the target in a 20-foot radius, moving around corners. The area of the smoke is heavily obscured. The smoke persists for 1 minute or until a strong wind disperses it."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD,
    SPELL_LIST_CLASS.ARTIFICER
  ],
  spellLevel: 2
};

export const rayOfEnfeeblement: SpellEntry = {
  id: "spell-ray-of-enfeeblement",
  name: "Ray of Enfeeblement",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A black beam of enervating energy springs from your finger toward a creature within range. Make a ranged spell attack against the target. On a hit, the target deals only half damage with weapon attacks that use Strength until the spell ends.",
    "At the end of each of the target's turns, it can make a Constitution saving throw against the spell. On a success, the spell ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const rimesBindingIce: SpellEntry = {
  id: "spell-rimes-binding-ice",
  name: "Rime's Binding Ice",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot cone)",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "A burst of cold energy emanates from you in a 30-foot cone. Each creature in that area must make a Constitution saving throw. On a failed save, a creature takes <strong>3d8</strong> Cold damage and is hindered by ice formations for 1 minute, or until it or another creature within reach of it uses an action to break away the ice. A creature hindered by ice has its Speed reduced to 0. On a successful save, a creature takes half as much damage and isn't hindered by ice.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, increase the cold damage by <strong>1d8</strong> for each slot level above 2nd."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.COLD],
    [DICE.D8, DAMAGE_TYPE.COLD],
    [DICE.D8, DAMAGE_TYPE.COLD]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const ropeTrick: SpellEntry = {
  id: "spell-rope-trick",
  name: "Rope Trick",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  description: [
    "You touch a length of rope that is up to 60 feet long. One end of the rope then rises into the air until the whole rope hangs perpendicular to the ground. At the upper end of the rope, an invisible entrance opens to an extradimensional space that lasts until the spell ends.",
    "The extradimensional space can be reached by climbing to the top of the rope. The space can hold as many as eight Medium or smaller creatures. The rope can be pulled into the space, making the rope disappear from view outside the space.",
    "Attacks and spells can't cross through the entrance into or out of the extradimensional space, but those inside can see out of it as if through a 3-foot-by-5-foot window centered on the rope.",
    "Anything inside the extradimensional space drops out when the spell ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const scorchingRay: SpellEntry = {
  id: "spell-scorching-ray",
  name: "Scorching Ray",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You create three rays of fire and hurl them at targets within range. You can hurl them at one target or several. Make a ranged spell attack for each ray. On a hit, the target takes <strong>2d6</strong> Fire damage.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, you create one additional ray for each slot level above 2nd."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.FIRE],
    [DICE.D6, DAMAGE_TYPE.FIRE]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const seeInvisibility: SpellEntry = {
  id: "spell-see-invisibility",
  name: "See Invisibility",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  description: [
    "For the duration, you see Invisible creatures and objects as if they were visible, and you can see into the Ethereal Plane. Ethereal creatures and objects appear ghostly and translucent."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const shadowBlade: SpellEntry = {
  id: "spell-shadow-blade",
  name: "Shadow Blade",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You weave together threads of shadow to create a sword of solidified gloom in your hand. This magic sword lasts until the spell ends. It counts as a Simple Melee weapon with which you are proficient. It deals <strong>2d8</strong> Psychic damage on a hit and has the Finesse, Light, and Thrown properties, range 20/60. In addition, when you use the sword to attack a target that is in dim light or darkness, you make the attack roll with Advantage.",
    "If you drop the weapon or throw it, it dissipates at the end of the turn. Thereafter, while the spell persists, you can use a Bonus Action to cause the sword to reappear in your hand.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a 3rd- or 4th-level spell slot, the damage increases to <strong>3d8</strong>. When you cast it using a 5th- or 6th-level spell slot, the damage increases to <strong>4d8</strong>. When you cast it using a spell slot of 7th level or higher, the damage increases to <strong>5d8</strong>."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.PSYCHIC],
    [DICE.D8, DAMAGE_TYPE.PSYCHIC]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const shatter: SpellEntry = {
  id: "spell-shatter",
  name: "Shatter",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "A sudden loud ringing noise, painfully intense, erupts from a point of your choice within range. Each creature in a 10-foot-radius sphere centered on that point must make a Constitution saving throw. A creature takes <strong>3d8</strong> Thunder damage on a failed save, or half as much damage on a successful one. A creature made of inorganic material such as stone, crystal, or metal has Disadvantage on this saving throw.",
    "A nonmagical object that isn't being worn or carried also takes the damage if it's in the spell's area.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage increases by <strong>1d8</strong> for each slot level above 2nd."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.THUNDER],
    [DICE.D8, DAMAGE_TYPE.THUNDER],
    [DICE.D8, DAMAGE_TYPE.THUNDER]
  ],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const silence: SpellEntry = {
  id: "spell-silence",
  name: "Silence",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  ritual: true,
  description: [
    "For the duration, no sound can be created within or pass through a 20-foot-radius sphere centered on a point you choose within range. Any creature or object entirely inside the sphere is immune to Thunder damage, and creatures are Deafened while entirely inside it. Casting a spell that includes a Verbal component is impossible there."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.RANGER],
  spellLevel: 2
};

export const skywrite: SpellEntry = {
  id: "spell-skywrite",
  name: "Skywrite",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Sight",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 day"],
  ritual: true,
  description: [
    "You cause up to ten words to form in a part of the sky you can see. The words appear to be made of cloud and remain in place for the spell's duration. The words dissipate when the spell ends. A strong wind can disperse the clouds and end the spell early."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.WIZARD,
    SPELL_LIST_CLASS.ARTIFICER
  ],
  spellLevel: 2
};

export const snillocsSnowballSwarm: SpellEntry = {
  id: "spell-snillocs-snowball-swarm",
  name: "Snilloc's Snowball Swarm",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "A flurry of magic snowballs erupts from a point you choose within range. Each creature in a 5-foot-radius sphere centered on that point must make a Dexterity saving throw. A creature takes <strong>3d6</strong> Cold damage on a failed save, or half as much damage on a successful one.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage increases by <strong>1d6</strong> for each slot level above 2nd."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const spiderClimb: SpellEntry = {
  id: "spell-spider-climb",
  name: "Spider Climb",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "Until the spell ends, one willing creature you touch gains the ability to move up, down, and across vertical surfaces and upside down along ceilings, while leaving its hands free. The target also gains a Climbing Speed equal to its walking Speed."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const spikeGrowth: SpellEntry = {
  id: "spell-spike-growth",
  name: "Spike Growth",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "The ground in a 20-foot radius centered on a point within range twists and sprouts hard spikes and thorns. The area becomes difficult terrain for the duration. When a creature moves into or within the area, it takes <strong>2d4</strong> Piercing damage for every 5 feet it travels.",
    "The transformation of the ground is camouflaged to look natural. Any creature that can't see the area at the time the spell is cast must make a Wisdom (Perception) check against your spell save DC to recognize the terrain as hazardous before entering it."
  ],
  damage: [
    [DICE.D4, DAMAGE_TYPE.PIERCING],
    [DICE.D4, DAMAGE_TYPE.PIERCING]
  ],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 2
};

export const spiritualWeapon: SpellEntry = {
  id: "spell-spiritual-weapon",
  name: "Spiritual Weapon",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 minute"],
  description: [
    "You create a floating, spectral weapon within range that lasts for the duration or until you cast this spell again.",
    "When you cast the spell, you can make a melee spell attack against a creature within 5 feet of the weapon. On a hit, the target takes Force damage equal to <strong>1d8</strong> + your spellcasting ability modifier.",
    "As a Bonus Action on your turn, you can move the weapon up to 20 feet and repeat the attack against a creature within 5 feet of it.",
    "The weapon can take whatever form you choose. Clerics of deities who are associated with a particular weapon make this spell's effect resemble that weapon.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage increases by <strong>1d8</strong> for every two slot levels above 2nd."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.FORCE]],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 2
};

export const sprayOfCards: SpellEntry = {
  id: "spell-spray-of-cards",
  name: "Spray of Cards",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (15-foot cone)",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You spray a 15-foot cone of spectral cards. Each creature in that area must make a Dexterity saving throw. On a failed save, a creature takes <strong>2d10</strong> Force damage and has the Blinded condition until the end of its next turn. On a successful save, a creature takes half as much damage only.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage increases by <strong>1d10</strong> for each slot level above 2nd."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE]
  ],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const suggestion: SpellEntry = {
  id: "spell-suggestion",
  name: "Suggestion",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 8 hours"],
  description: [
    "You suggest a course of activity, limited to a sentence or two, and magically influence a creature you can see within range that can hear and understand you. Creatures that can't be Charmed are immune to this effect. The suggestion must be worded in such a manner as to make the course of action sound reasonable. Asking the creature to stab itself, throw itself onto a spear, immolate itself, or do some other obviously harmful act ends the spell.",
    "The target must make a Wisdom saving throw. On a failed save, it pursues the course of action you described to the best of its ability. The suggested course of action can continue for the entire duration. If the suggested activity can be completed in a shorter time, the spell ends when the subject finishes what it was asked to do.",
    "You can also specify conditions that will trigger a special activity during the duration. For example, you might suggest that a knight give her warhorse to the first beggar she meets. If the condition isn't met before the spell expires, the activity isn't performed.",
    "If you or any of your companions damage the target, the spell ends."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const summonBeast: SpellEntry = {
  id: "spell-summon-beast",
  name: "Summon Beast",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You call forth a bestial spirit. It manifests in an unoccupied space that you can see within range. This corporeal form uses the Bestial Spirit stat block. When you cast the spell, choose an environment: Air, Land, or Water. The creature resembles an animal of your choice that is native to the chosen environment, which determines certain traits in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.",
    "The creature is an ally to you and your companions. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands, no action required by you. If you don't issue any, it takes the Dodge action and uses its move to avoid danger.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, use the higher level where the spell's level appears in the stat block.",
    "<strong>Bestial Spirit.</strong> Small Beast.",
    "<strong>Armor Class.</strong> 11 + the level of the spell, natural armor.",
    "<strong>Hit Points.</strong> 20, Air only, or 30, Land and Water only, + 5 for each spell level above 2nd.",
    "<strong>Speed.</strong> 30 ft., climb 30 ft. Land only, fly 60 ft. Air only, swim 30 ft. Water only.",
    "<strong>Abilities.</strong> STR 18 (+4), DEX 11 (+0), CON 16 (+3), INT 4 (-3), WIS 14 (+2), CHA 5 (-3).",
    "<strong>Senses.</strong> Darkvision 60 ft., passive Perception 12.",
    "<strong>Languages.</strong> Understands the languages you speak.",
    "<strong>Proficiency Bonus.</strong> Equals your bonus.",
    "<strong>Flyby.</strong> Air only. The Beast doesn't provoke Opportunity Attacks when it flies out of an enemy's reach.",
    "<strong>Pack Tactics.</strong> Land and Water only. The Beast has Advantage on an attack roll against a creature if at least one of the Beast's allies is within 5 feet of the creature and the ally isn't Incapacitated.",
    "<strong>Water Breathing.</strong> Water only. The Beast can breathe only underwater.",
    "<strong>Multiattack.</strong> The Beast makes a number of attacks equal to half this spell's level, rounded down.",
    "<strong>Maul.</strong> Melee Weapon Attack: your spell attack modifier to hit, reach 5 ft., one target. Hit: <strong>1d8</strong> + 4 + the spell's level Piercing damage."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.PIERCING]],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 2
};

export const tashasMindWhip: SpellEntry = {
  id: "spell-tashas-mind-whip",
  name: "Tasha's Mind Whip",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["1 round"],
  description: [
    "You psychically lash out at one creature you can see within range. The target must make an Intelligence saving throw. On a failed save, the target takes <strong>3d6</strong> Psychic damage, and it can't take a Reaction until the end of its next turn. Moreover, on its next turn, it must choose whether it gets a move, an action, or a Bonus Action; it gets only one of the three. On a successful save, the target takes half as much damage and suffers none of the spell's other effects.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd. The creatures must be within 30 feet of each other when you target them."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const thoughtShield: SpellEntry = {
  id: "spell-thought-shield",
  name: "Thought Shield",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["8 hours"],
  description: [
    "You weave a clouding veil over the mind of one creature you touch. For the duration, the target's mind can't be read or detected, creatures can't telepathically communicate with the target unless the target allows it, and the target has Advantage on saving throws against any effect that would determine whether it is telling the truth."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const vortexWarp: SpellEntry = {
  id: "spell-vortex-warp",
  name: "Vortex Warp",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You magically twist space around another creature you can see within range. The target must succeed on a Constitution saving throw, the target can choose to fail, or the target is teleported to an unoccupied space of your choice that you can see within range. The chosen space must be on a surface or in a liquid that can support the target without the target having to squeeze.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the range of the spell increases by 30 feet for each slot level above 2nd."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const wardingBond: SpellEntry = {
  id: "spell-warding-bond",
  name: "Warding Bond",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  description: [
    "This spell wards a willing creature you touch and creates a mystic connection between you and the target until the spell ends.",
    "While the target is within 60 feet of you, it gains a +1 bonus to AC and saving throws, and it has Resistance to all damage. Also, each time it takes damage, you take the same amount of damage.",
    "The spell ends if you drop to 0 Hit Points or if you and the target become separated by more than 60 feet. It also ends if the spell is cast again on either of the connected creatures. You can also dismiss the spell as an action."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 2
};

export const wardingWind: SpellEntry = {
  id: "spell-warding-wind",
  name: "Warding Wind",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "A strong wind, 20 miles per hour, blows around you in a 10-foot radius and moves with you, remaining centered on you. The wind lasts for the spell's duration.",
    "It Deafens you and other creatures in its area.",
    "It extinguishes unprotected flames in its area that are torch-sized or smaller.",
    "The area is difficult terrain for creatures other than you.",
    "The attack rolls of ranged weapon attacks have Disadvantage if they pass in or out of the wind.",
    "It hedges out vapor, gas, and fog that can be dispersed by strong wind."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 2
};

export const warpSense: SpellEntry = {
  id: "spell-warp-sense",
  name: "Warp Sense",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "For the duration, you sense the presence of portals, even inactive ones, within 30 feet of yourself.",
    "If you detect a portal in this way, you can use your action to study it. Make a DC 15 ability check using your spellcasting ability. On a successful check, you learn the destination plane of the portal and what portal key it requires, then the spell ends. On a failed check, you learn nothing and can't study that portal again using this spell until you cast it again.",
    "The spell can penetrate most barriers but is blocked by 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const web: SpellEntry = {
  id: "spell-web",
  name: "Web",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You conjure a mass of thick, sticky webbing at a point of your choice within range. The webs fill a 20-foot cube from that point for the duration. The webs are difficult terrain and lightly obscure their area.",
    "If the webs aren't anchored between two solid masses, such as walls or trees, or layered across a floor, wall, or ceiling, the conjured web collapses on itself, and the spell ends at the start of your next turn. Webs layered over a flat surface have a depth of 5 feet.",
    "Each creature that starts its turn in the webs or that enters them during its turn must make a Dexterity saving throw. On a failed save, the creature is Restrained as long as it remains in the webs or until it breaks free.",
    "A creature Restrained by the webs can use its action to make a Strength check against your spell save DC. If it succeeds, it is no longer Restrained.",
    "The webs are flammable. Any 5-foot cube of webs exposed to fire burns away in 1 round, dealing <strong>2d4</strong> Fire damage to any creature that starts its turn in the fire."
  ],
  damage: [
    [DICE.D4, DAMAGE_TYPE.FIRE],
    [DICE.D4, DAMAGE_TYPE.FIRE]
  ],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const witherAndBloom: SpellEntry = {
  id: "spell-wither-and-bloom",
  name: "Wither and Bloom",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You invoke both death and life upon a 10-foot-radius sphere centered on a point within range. Each creature of your choice in that area must make a Constitution saving throw, taking <strong>2d6</strong> Necrotic damage on a failed save, or half as much damage on a successful one. Nonmagical vegetation in that area withers.",
    "In addition, one creature of your choice in that area can spend and roll one of its unspent Hit Dice and regain a number of Hit Points equal to the roll plus your spellcasting ability modifier.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage increases by <strong>1d6</strong> for each slot above 2nd, and the number of Hit Dice that can be spent and added to the healing roll increases by one for each slot above 2nd."
  ],
  isHealingSpell: true,
  damage: [
    [DICE.D6, DAMAGE_TYPE.NECROTIC],
    [DICE.D6, DAMAGE_TYPE.NECROTIC]
  ],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const wristpocket: SpellEntry = {
  id: "spell-wristpocket",
  name: "Wristpocket",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  ritual: true,
  description: [
    "You flick your wrist, causing one object in your hand to vanish. The object, which only you can be holding and can weigh no more than 5 pounds, is transported to an extradimensional space, where it remains for the duration.",
    "Until the spell ends, you can use your action to summon the object to your free hand, and you can use your action to return the object to the extradimensional space. An object still in the pocket plane when the spell ends appears in your space, at your feet."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 2
};

export const zoneOfTruth: SpellEntry = {
  id: "spell-zone-of-truth",
  name: "Zone of Truth",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["10 minutes"],
  description: [
    "You create a magical zone that guards against deception in a 15-foot-radius sphere centered on a point of your choice within range. Until the spell ends, a creature that enters the spell's area for the first time on a turn or starts its turn there must make a Charisma saving throw. On a failed save, a creature can't speak a deliberate lie while in the radius. You know whether each creature succeeds or fails on its saving throw.",
    "An affected creature is aware of the spell and can thus avoid answering questions to which it would normally respond with a lie. Such creatures can be evasive in their answers as long as they remain within the boundaries of the truth."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 2
};

export const spellEntries2: SpellEntry[] = [
  aganazzarsScorcher,
  aid,
  airBubble,
  alterSelf,
  animalMessenger,
  arcaneHacking,
  arcaneLock,
  augury,
  barkskin,
  beastSense,
  blindnessDeafness,
  blur,
  borrowedKnowledge,
  brandingSmite,
  calmEmotions,
  cloudOfDaggers,
  continualFlame,
  cordonOfArrows,
  crownOfMadness,
  darkness,
  darkvision,
  detectThoughts,
  digitalPhantom,
  dragonsBreath,
  dustDevil,
  earthbind,
  enhanceAbility,
  enlargeReduce,
  enthrall,
  findSteed,
  findTraps,
  findVehicle,
  flameBlade,
  flamingSphere,
  flockOfFamiliars,
  fortunesFavor,
  gentleRepose,
  giftOfGab,
  gustOfWind,
  healingSpirit,
  heatMetal,
  holdPerson,
  icingdeathsFrost,
  immovableObject,
  invisibility,
  jimsGlowingCoin,
  kineticJaunt,
  knock,
  lesserRestoration,
  levitate,
  locateAnimalsOrPlants,
  locateObject,
  magicMouth,
  magicWeapon,
  maximilliansEarthenGrasp,
  melfsAcidArrow,
  mentalBarrier,
  mindSpike,
  mindThrust,
  mirrorImage,
  mistyStep,
  moonbeam,
  nathairsMischief,
  nystulsMagicAura,
  passWithoutTrace,
  phantasmalForce,
  prayerOfHealing,
  protectionFromPoison,
  pyrotechnics,
  rayOfEnfeeblement,
  rimesBindingIce,
  ropeTrick,
  scorchingRay,
  seeInvisibility,
  shadowBlade,
  shatter,
  silence,
  skywrite,
  snillocsSnowballSwarm,
  spiderClimb,
  spikeGrowth,
  spiritualWeapon,
  sprayOfCards,
  suggestion,
  summonBeast,
  tashasMindWhip,
  thoughtShield,
  vortexWarp,
  wardingBond,
  wardingWind,
  warpSense,
  web,
  witherAndBloom,
  wristpocket,
  zoneOfTruth
];
