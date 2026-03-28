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

export const arcaneEye: SpellEntry = {
  id: "spell-arcane-eye",
  name: "Arcane Eye",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You create an invisible, magical eye within range that hovers in the air for the duration. You mentally receive visual information from the eye, which has normal vision and Darkvision out to 30 feet. The eye can look in every direction.",
    "As an action, you can move the eye up to 30 feet in any direction. There is no limit to how far away from you the eye can move, but it can't enter another plane of existence. A solid barrier blocks the eye's movement, but the eye can pass through an opening as small as 1 inch in diameter."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const auraOfLife: SpellEntry = {
  id: "spell-aura-of-life",
  name: "Aura of Life",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot radius)",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Life-preserving energy radiates from you in an aura with a 30-foot radius. Until the spell ends, the aura moves with you, centered on you. Each non-hostile creature in the aura, including you, has Resistance to Necrotic damage, and its Hit Point maximum can't be reduced. In addition, a non-hostile, living creature regains 1 Hit Point when it starts its turn in the aura with 0 Hit Points."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 4
};

export const auraOfPurity: SpellEntry = {
  id: "spell-aura-of-purity",
  name: "Aura of Purity",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (30-foot radius)",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Purifying energy radiates from you in an aura with a 30-foot radius. Until the spell ends, the aura moves with you, centered on you. Each non-hostile creature in the aura, including you, can't become diseased, has Resistance to Poison damage, and has Advantage on saving throws against effects that cause any of the following conditions: Blinded, Charmed, Deafened, Frightened, Paralyzed, Poisoned, and Stunned."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 4
};

export const banishment: SpellEntry = {
  id: "spell-banishment",
  name: "Banishment",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You attempt to send one creature that you can see within range to another place of existence. The target must succeed on a Charisma saving throw or be banished.",
    "If the target is native to the plane of existence you're on, you banish the target to a harmless demiplane. While there, the target is Incapacitated. The target remains there until the spell ends, at which point the target reappears in the space it left or in the nearest unoccupied space if that space is occupied.",
    "If the target is native to a different plane of existence than the one you're on, the target is banished with a faint popping noise, returning to its home plane. If the spell ends before 1 minute has passed, the target reappears in the space it left or in the nearest unoccupied space if that space is occupied. Otherwise, the target doesn't return.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, you can target one additional creature for each slot level above 4th."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.PALADIN,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 4
};

export const blight: SpellEntry = {
  id: "spell-blight",
  name: "Blight",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "Necromantic energy washes over a creature of your choice that you can see within range, draining moisture and vitality from it. The target must make a Constitution saving throw. The target takes 8d8 Necrotic damage on a failed save, or half as much damage on a successful one. This spell has no effect on Undead or Constructs.",
    "If you target a plant creature or a magical plant, it makes the saving throw with Disadvantage, and the spell deals maximum damage to it. If you target a nonmagical plant that isn't a creature, such as a tree or shrub, it doesn't make a saving throw; it simply withers and dies.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d8 for each slot level above 4th."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC]
  ],
  spellLists: [
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 4
};

export const charmMonster: SpellEntry = {
  id: "spell-charm-monster",
  name: "Charm Monster",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 hour"],
  description: [
    "You attempt to charm a creature you can see within range. It must make a Wisdom saving throw, and it does so with Advantage if you or your companions are fighting it. If it fails the saving throw, it is Charmed by you until the spell ends or until you or your companions do anything harmful to it. The Charmed creature is friendly to you. When the spell ends, the creature knows it was Charmed by you.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, you can target one additional creature for each slot level above 4th. The creatures must be within 30 feet of each other when you target them."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 4
};

export const compulsion: SpellEntry = {
  id: "spell-compulsion",
  name: "Compulsion",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Creatures of your choice that you can see within range and that can hear you must make a Wisdom saving throw. A target automatically succeeds on this saving throw if it can't be Charmed. On a failed save, a target is affected by this spell. Until the spell ends, you can use a Bonus Action on each of your turns to designate a direction that is horizontal to you. Each affected target must use as much of its movement as possible to move in that direction on its next turn. It can take its action before it moves. After moving in this way, it can make another Wisdom saving throw to try to end the effect.",
    "A target isn't compelled to move into an obviously deadly hazard, such as a fire pit, but it will provoke Opportunity Attacks to move in the designated direction."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD],
  spellLevel: 4
};

export const confusion: SpellEntry = {
  id: "spell-confusion",
  name: "Confusion",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "This spell assaults and twists creatures' minds, spawning delusions and provoking uncontrolled actions. Each creature in a 10-foot-radius sphere centered on a point you choose within range must succeed on a Wisdom saving throw when you cast this spell or be affected by it.",
    "An affected target can't take Reactions and must roll a d10 at the start of each of its turns to determine its behavior for that turn.",
    "<strong>1.</strong> The creature uses all its movement to move in a random direction. To determine the direction, roll a d8 and assign a direction to each die face. The creature doesn't take an action this turn.",
    "<strong>2-6.</strong> The creature doesn't move or take actions this turn.",
    "<strong>7-8.</strong> The creature uses its action to make a melee attack against a randomly determined creature within its reach. If there is no creature within its reach, the creature does nothing this turn.",
    "<strong>9-10.</strong> The creature can act and move normally.",
    "At the end of its turns, an affected target can make a Wisdom saving throw. If it succeeds, this effect ends for that target.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the radius of the sphere increases by 5 feet for each slot level above 4th."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 4
};

export const conjureBarlgura: SpellEntry = {
  id: "spell-conjure-barlgura",
  name: "Conjure Barlgura",
  category: ENTRY_CATEGORIES.SPELLS,
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
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const conjureKnowbot: SpellEntry = {
  id: "spell-conjure-knowbot",
  name: "Conjure Knowbot",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["10 minutes"],
  description: [
    "You touch a single computerized device or computer system to conjure a knowbot, a partially sentient piece of software imprinted with vestiges of your own skills and computer abilities. For the duration of the spell, you can use a Bonus Action to have the knowbot execute a computer-related task that would normally require an action. The knowbot makes Intelligence ability checks using your ability score and proficiency bonuses including your proficiency with hacking tools, if applicable.",
    "You have a limited telepathic bond with the knowbot, out to a range of 500 feet from the device or system where the knowbot was conjured. If you move beyond this range, the knowbot disappears in 2d4 rounds, as if the duration of the spell had expired. Moving within range again immediately reestablishes the bond.",
    "The knowbot is bound to the system in which it was created, and it stays there until it is dismissed or the spell's duration expires.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the spell's duration increases to 1 hour. Additionally, your telepathic bond with the knowbot is effective out to a range of 1,000 feet, and if you leave the range of the bond, the knowbot continues performing its last directed task until the spell expires."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const conjureMinorElementals: SpellEntry = {
  id: "spell-conjure-minor-elementals",
  name: "Conjure Minor Elementals",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You summon elementals that appear in unoccupied spaces that you can see within range. You choose one of the following options for what appears:",
    "One elemental of Challenge Rating 2 or lower.",
    "Two elementals of Challenge Rating 1 or lower.",
    "Four elementals of Challenge Rating 1/2 or lower.",
    "Eight elementals of Challenge Rating 1/4 or lower.",
    "An elemental summoned by this spell disappears when it drops to 0 Hit Points or when the spell ends.",
    "The summoned creatures are friendly to you and your companions. Roll Initiative for the summoned creatures as a group, which has its own turns. They obey any verbal commands that you issue to them, no action required by you. If you don't issue any commands to them, they defend themselves from hostile creatures, but otherwise take no actions. The DM has the creatures' statistics.",
    "<strong>At Higher Levels.</strong> When you cast this spell using certain higher-level spell slots, you choose one of the summoning options above, and more creatures appear: twice as many with a 6th-level slot and three times as many with an 8th-level slot."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const conjureShadowDemon: SpellEntry = {
  id: "spell-conjure-shadow-demon",
  name: "Conjure Shadow Demon",
  category: ENTRY_CATEGORIES.SPELLS,
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
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const conjureWoodlandBeings: SpellEntry = {
  id: "spell-conjure-woodland-beings",
  name: "Conjure Woodland Beings",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You summon Fey creatures that appear in unoccupied spaces that you can see within range. Choose one of the following options for what appears:",
    "One Fey creature of Challenge Rating 2 or lower.",
    "Two Fey creatures of Challenge Rating 1 or lower.",
    "Four Fey creatures of Challenge Rating 1/2 or lower.",
    "Eight Fey creatures of Challenge Rating 1/4 or lower.",
    "A summoned creature disappears when it drops to 0 Hit Points or when the spell ends.",
    "The summoned creatures are friendly to you and your companions. Roll Initiative for the summoned creatures as a group, which have their own turns. They obey any verbal commands that you issue to them, no action required by you. If you don't issue any commands to them, they defend themselves from hostile creatures, but otherwise take no actions. The DM has the creatures' statistics.",
    "<strong>At Higher Levels.</strong> When you cast this spell using certain higher-level spell slots, you choose one of the summoning options above, and more creatures appear: twice as many with a 6th-level slot and three times as many with an 8th-level slot."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 4
};

export const controlWater: SpellEntry = {
  id: "spell-control-water",
  name: "Control Water",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "300 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Until the spell ends, you control any freestanding water inside an area you choose that is a cube up to 100 feet on a side. You can choose from any of the following effects when you cast this spell. As an action on your turn, you can repeat the same effect or choose a different one.",
    "<strong>Flood.</strong> You cause the water level of all standing water in the area to rise by as much as 20 feet. If the area includes a shore, the flooding water spills over onto dry land. If you choose an area in a large body of water, you instead create a 20-foot-tall wave that travels from one side of the area to the other and then crashes down. Any Huge or smaller vehicles in the wave's path are carried with it to the other side. Any Huge or smaller vehicles struck by the wave have a 25 percent chance of capsizing. The water level remains elevated until the spell ends or you choose a different effect. If this effect produced a wave, the wave repeats at the start of your next turn while the flood effect lasts.",
    "<strong>Part Water.</strong> You cause water in the area to move apart and create a trench. The trench extends across the spell's area, and the separated water forms a wall to either side. The trench remains until the spell ends or you choose a different effect. The water then slowly fills in the trench over the course of the next round until the normal water level is restored.",
    "<strong>Redirect Flow.</strong> You cause flowing water in the area to move in a direction you choose, even if the water has to flow over obstacles, up walls, or in other unlikely directions. The water in the area moves as you direct it, but once it moves beyond the spell's area, it resumes its flow based on the terrain conditions. The water continues to move in the direction you chose until the spell ends or you choose a different effect.",
    "<strong>Whirlpool.</strong> This effect requires a body of water at least 50 feet square and 25 feet deep. You cause a whirlpool to form in the center of the area. The whirlpool forms a vortex that is 5 feet wide at the base, up to 50 feet wide at the top, and 25 feet tall. Any creature or object in the water and within 25 feet of the vortex is pulled 10 feet toward it. A creature can swim away from the vortex by making a Strength (Athletics) check against your spell save DC.",
    "When a creature enters the vortex for the first time on a turn or starts its turn there, it must make a Strength saving throw. On a failed save, the creature takes 2d8 Bludgeoning damage and is caught in the vortex until the spell ends. On a successful save, the creature takes half damage and isn't caught in the vortex. A creature caught in the vortex can use its action to try to swim away from the vortex as described above, but has Disadvantage on the Strength (Athletics) check to do so.",
    "The first time each turn that an object enters the vortex, the object takes 2d8 Bludgeoning damage, and this damage occurs each round it remains in the vortex."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const deathWard: SpellEntry = {
  id: "spell-death-ward",
  name: "Death Ward",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["8 hours"],
  description: [
    "You touch a creature and grant it a measure of protection from death. The first time the target would drop to 0 Hit Points as a result of taking damage, the target instead drops to 1 Hit Point, and the spell ends. If the spell is still in effect when the target is subjected to an effect that would kill it instantaneously without dealing damage, that effect is instead negated against the target, and the spell ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.PALADIN],
  spellLevel: 4
};

export const dimensionDoor: SpellEntry = {
  id: "spell-dimension-door",
  name: "Dimension Door",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "500 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    'You teleport yourself from your current location to any other spot within range. You arrive at exactly the spot desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and direction, such as "200 feet straight downward" or "upward to the northwest at a 45-degree angle, 300 feet."',
    "You can bring along objects as long as their weight doesn't exceed what you can carry. You can also bring one willing creature of your size or smaller who is carrying gear up to its carrying capacity. The creature must be within 5 feet of you when you cast this spell.",
    "If you would arrive in a place already occupied by an object or a creature, you and any creature traveling with you each take 4d6 Force damage, and the spell fails to teleport you."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 4
};

export const divination: SpellEntry = {
  id: "spell-divination",
  name: "Divination",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "Your magic and an offering put you in contact with a god or a god's servants. You ask a single question concerning a specific goal, event, or activity to occur within 7 days. The DM offers a truthful reply. The reply might be a short phrase, a cryptic rhyme, or an omen.",
    "The spell doesn't take into account any possible circumstances that might change the outcome, such as the casting of additional spells or the loss or gain of a companion.",
    "If you cast this spell two or more times before finishing your next Long Rest, there is a cumulative 25 percent chance for each casting after the first that you get a random reading. The DM makes this roll in secret."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const dominateBeast: SpellEntry = {
  id: "spell-dominate-beast",
  name: "Dominate Beast",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You attempt to beguile a Beast that you can see within range. It must succeed on a Wisdom saving throw or be Charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has Advantage on the saving throw.",
    'While the Beast is Charmed, you have a telepathic link with it as long as the two of you are on the same plane of existence. You can use this telepathic link to issue commands to the creature while you are conscious, no action required, which it does its best to obey. You can specify a simple and general course of action, such as "Attack that creature," "Run over there," or "Fetch that object." If the creature completes the order and doesn\'t receive further direction from you, it defends and preserves itself to the best of its ability.',
    "You can use your action to take total and precise control of the target. Until the end of your next turn, the creature takes only the actions you choose, and doesn't do anything that you don't allow it to do. During this time, you can also cause the creature to use a Reaction, but this requires you to use your own Reaction as well.",
    "Each time the target takes damage, it makes a new Wisdom saving throw against the spell. If the saving throw succeeds, the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell with a 5th-level spell slot, the duration is Concentration, up to 10 minutes. When you use a 6th-level spell slot, the duration is Concentration, up to 1 hour. When you use a spell slot of 7th level or higher, the duration is Concentration, up to 8 hours."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.SORCERER],
  spellLevel: 4
};

export const egoWhip: SpellEntry = {
  id: "spell-ego-whip",
  name: "Ego Whip",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You lash the mind of one creature you can see within range, filling it with despair. The target must succeed on an Intelligence saving throw or suffer Disadvantage on attack rolls, ability checks, and saving throws, and it can't cast spells. At the end of each of its turns, the target can make another Intelligence saving throw. On a success, the spell ends on the target."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 4
};

export const elementalBane: SpellEntry = {
  id: "spell-elemental-bane",
  name: "Elemental Bane",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Choose one creature you can see within range, and choose one of the following damage types: Acid, Cold, Fire, Lightning, or Thunder. The target must succeed on a Constitution saving throw or be affected by the spell for its duration. The first time each turn the affected target takes damage of the chosen type, the target takes an extra 2d6 damage of that type. Moreover, the target loses any Resistance to that damage type until the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, you can target one additional creature for each slot level above 4th. The creatures must be within 30 feet of each other when you target them."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD,
    SPELL_LIST_CLASS.ARTIFICER
  ],
  spellLevel: 4
};

export const evardsBlackTentacles: SpellEntry = {
  id: "spell-evards-black-tentacles",
  name: "Evard's Black Tentacles",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "90 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Squirming, ebony tentacles fill a 20-foot square on ground that you can see within range. For the duration, these tentacles turn the ground in the area into difficult terrain.",
    "When a creature enters the affected area for the first time on a turn or starts its turn there, the creature must succeed on a Dexterity saving throw or take 3d6 Bludgeoning damage and be Restrained by the tentacles until the spell ends. A creature that starts its turn in the area and is already Restrained by the tentacles takes 3d6 Bludgeoning damage.",
    "A creature Restrained by the tentacles can use its action to make a Strength or Dexterity check, its choice, against your spell save DC. On a success, it frees itself."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.BLUDGEONING]
  ],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const fabricate: SpellEntry = {
  id: "spell-fabricate",
  name: "Fabricate",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You convert raw materials into products of the same material. For example, you can fabricate a wooden bridge from a clump of trees, a rope from a patch of hemp, and clothes from flax or wool.",
    "Choose raw materials that you can see within range. You can fabricate a Large or smaller object, contained within a 10-foot cube, or eight connected 5-foot cubes, given a sufficient quantity of raw material. If you are working with metal, stone, or another mineral substance, however, the fabricated object can be no larger than Medium, contained within a single 5-foot cube. The quality of objects made by the spell is commensurate with the quality of the raw materials.",
    "Creatures or magic items can't be created or transmuted by this spell. You also can't use it to create items that ordinarily require a high degree of craftsmanship, such as jewelry, weapons, glass, or armor, unless you have proficiency with the type of artisan's tools used to craft such objects."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const findGreaterSteed: SpellEntry = {
  id: "spell-find-greater-steed",
  name: "Find Greater Steed",
  category: ENTRY_CATEGORIES.SPELLS,
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
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 4
};

export const fireShield: SpellEntry = {
  id: "spell-fire-shield",
  name: "Fire Shield",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["10 minutes"],
  description: [
    "Thin and wispy flames wreathe your body for the duration, shedding bright light in a 10-foot radius and dim light for an additional 10 feet. You can end the spell early by using an action to dismiss it.",
    "The flames provide you with a warm shield or a chill shield, as you choose. The warm shield grants you Resistance to Cold damage, and the chill shield grants you Resistance to Fire damage.",
    "In addition, whenever a creature within 5 feet of you hits you with a melee attack, the shield erupts with flame. The attacker takes 2d8 Fire damage from a warm shield, or 2d8 Cold damage from a cold shield."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const freedomOfMovement: SpellEntry = {
  id: "spell-freedom-of-movement",
  name: "Freedom of Movement",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  description: [
    "You touch a willing creature. For the duration, the target's movement is unaffected by difficult terrain, and spells and other magical effects can neither reduce the target's Speed nor cause the target to be Paralyzed or Restrained.",
    "The target can also spend 5 feet of movement to automatically escape from nonmagical restraints, such as manacles or a creature that has it Grappled. Finally, being underwater imposes no penalties on the target's movement or attacks."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER
  ],
  spellLevel: 4
};

export const galdersSpeedyCourier: SpellEntry = {
  id: "spell-galders-speedy-courier",
  name: "Galder's Speedy Courier",
  category: ENTRY_CATEGORIES.SPELLS,
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
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const gateSeal: SpellEntry = {
  id: "spell-gate-seal",
  name: "Gate Seal",
  category: ENTRY_CATEGORIES.SPELLS,
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
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const giantInsect: SpellEntry = {
  id: "spell-giant-insect",
  name: "Giant Insect",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "You transform up to ten centipedes, three spiders, five wasps, or one scorpion within range into giant versions of their natural forms for the duration. A centipede becomes a giant centipede, a spider becomes a giant spider, a wasp becomes a giant wasp, and a scorpion becomes a giant scorpion.",
    "Each creature obeys your verbal commands, and in combat, they act on your turn each round. The DM has the statistics for these creatures and resolves their actions and movement.",
    "A creature remains in its giant size for the duration, until it drops to 0 Hit Points, or until you use an action to dismiss the effect on it.",
    "The DM might allow you to choose different targets. For example, if you transform a bee, its giant version might have the same statistics as a giant wasp."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 4
};

export const graspingVine: SpellEntry = {
  id: "spell-grasping-vine",
  name: "Grasping Vine",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You conjure a vine that sprouts from the ground in an unoccupied space of your choice that you can see within range. When you cast this spell, you can direct the vine to lash out at a creature within 30 feet of it that you can see. That creature must succeed on a Dexterity saving throw or be pulled 20 feet directly toward the vine.",
    "Until the spell ends, you can direct the vine to lash out at the same creature or another one as a Bonus Action on each of your turns."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 4
};

export const gravitySinkhole: SpellEntry = {
  id: "spell-gravity-sinkhole",
  name: "Gravity Sinkhole",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "A 20-foot-radius sphere of crushing force forms at a point you can see within range and tugs at the creatures there. Each creature in the sphere must make a Constitution saving throw. On a failed save, the creature takes 5d10 Force damage, and is pulled in a straight line toward the center of the sphere, ending in an unoccupied space as close to the center as possible, even if that space is in the air. On a successful save, the creature takes half as much damage and isn't pulled.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d10 for each slot level above 4th."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE],
    [DICE.D10, DAMAGE_TYPE.FORCE]
  ],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const greaterInvisibility: SpellEntry = {
  id: "spell-greater-invisibility",
  name: "Greater Invisibility",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You or a creature you touch becomes Invisible until the spell ends. Anything the target is wearing or carrying is Invisible as long as it is on the target's person."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const guardianOfFaith: SpellEntry = {
  id: "spell-guardian-of-faith",
  name: "Guardian of Faith",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["8 hours"],
  description: [
    "A Large spectral guardian appears and hovers for the duration in an unoccupied space of your choice that you can see within range. The guardian occupies that space and is indistinct except for a gleaming sword and shield emblazoned with the symbol of your deity.",
    "Any creature hostile to you that moves to a space within 10 feet of the guardian for the first time on a turn must succeed on a Dexterity saving throw. The creature takes 20 Radiant damage on a failed save, or half as much damage on a successful one. The guardian vanishes when it has dealt a total of 60 damage."
  ],
  damage: [[20, DAMAGE_TYPE.RADIANT]],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 4
};

export const guardianOfNature: SpellEntry = {
  id: "spell-guardian-of-nature",
  name: "Guardian of Nature",
  category: ENTRY_CATEGORIES.SPELLS,
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
    "Your melee weapon attacks deal an extra 1d6 Force damage on a hit.",
    "<strong>Great Tree.</strong> Your skin appears barky, leaves sprout from your hair, and you gain the following benefits:",
    "You gain 10 temporary Hit Points.",
    "You make Constitution saving throws with Advantage.",
    "You make Dexterity- and Wisdom-based attack rolls with Advantage.",
    "While you are on the ground, the ground within 15 feet of you is difficult terrain for your enemies."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER],
  spellLevel: 4
};

export const hallucinatoryTerrain: SpellEntry = {
  id: "spell-hallucinatory-terrain",
  name: "Hallucinatory Terrain",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "300 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["24 hours"],
  description: [
    "You make natural terrain in a 150-foot cube in range look, sound, and smell like some other sort of natural terrain. Thus, open fields or a road can be made to resemble a swamp, hill, crevasse, or some other difficult or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road. Manufactured structures, equipment, and creatures within the area aren't changed in appearance.",
    "The tactile characteristics of the terrain are unchanged, so creatures entering the area are likely to see through the illusion. If the difference isn't obvious by touch, a creature carefully examining the illusion can attempt an Intelligence (Investigation) check against your spell save DC to disbelieve it. A creature who discerns the illusion for what it is sees it as a vague image superimposed on the terrain."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 4
};

export const iceStorm: SpellEntry = {
  id: "spell-ice-storm",
  name: "Ice Storm",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "300 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "A hail of rock-hard ice pounds to the ground in a 20-foot-radius, 40-foot-high cylinder centered on a point within range. Each creature in the cylinder must make a Dexterity saving throw. A creature takes 2d8 Bludgeoning damage and 4d6 Cold damage on a failed save, or half as much damage on a successful one.",
    "Hailstones turn the storm's area of effect into difficult terrain until the end of your next turn.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the Bludgeoning damage increases by 1d8 for each slot level above 4th."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D8, DAMAGE_TYPE.BLUDGEONING],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD],
    [DICE.D6, DAMAGE_TYPE.COLD]
  ],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const leomundsSecretChest: SpellEntry = {
  id: "spell-leomunds-secret-chest",
  name: "Leomund's Secret Chest",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You hide a chest, and all its contents, on the Ethereal Plane. You must touch the chest and the miniature replica that serves as a material component for the spell. The chest can contain up to 12 cubic feet of nonliving material, 3 feet by 2 feet by 2 feet.",
    "While the chest remains on the Ethereal Plane, you can use an action and touch the replica to recall the chest. It appears in an unoccupied space on the ground within 5 feet of you. You can send the chest back to the Ethereal Plane by using an action and touching both the chest and the replica.",
    "After 60 days, there is a cumulative 5 percent chance per day that the spell's effect ends. This effect ends if you cast this spell again, if the smaller replica chest is destroyed, or if you choose to end the spell as an action. If the spell ends and the larger chest is on the Ethereal Plane, it is irretrievably lost."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const locateCreature: SpellEntry = {
  id: "spell-locate-creature",
  name: "Locate Creature",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "Describe or name a creature that is familiar to you. You sense the direction to the creature's location, as long as that creature is within 1,000 feet of you. If the creature is moving, you know the direction of its movement.",
    "The spell can locate a specific creature known to you, or the nearest creature of a specific kind, such as a Human or a unicorn, so long as you have seen such a creature up close, within 30 feet, at least once. If the creature you described or named is in a different form, such as being under the effects of a Polymorph spell, this spell doesn't locate the creature.",
    "This spell can't locate a creature if running water at least 10 feet wide blocks a direct path between you and the creature."
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
  spellLevel: 4
};

export const mordenkainensFaithfulHound: SpellEntry = {
  id: "spell-mordenkainens-faithful-hound",
  name: "Mordenkainen's Faithful Hound",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["8 hours"],
  description: [
    "You conjure a phantom watchdog in an unoccupied space that you can see within range, where it remains for the duration, until you dismiss it as an action, or until you move more than 100 feet away from it.",
    "The hound is Invisible to all creatures except you and can't be harmed. When a Small or larger creature comes within 30 feet of it without first speaking the password that you specify when you cast this spell, the hound starts barking loudly. The hound sees Invisible creatures and can see into the Ethereal Plane. It ignores illusions.",
    "At the start of each of your turns, the hound attempts to bite one creature within 5 feet of it that is hostile to you. The hound's attack bonus is equal to your spellcasting ability modifier + your proficiency bonus. On a hit, it deals 4d8 Piercing damage."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.PIERCING],
    [DICE.D8, DAMAGE_TYPE.PIERCING],
    [DICE.D8, DAMAGE_TYPE.PIERCING],
    [DICE.D8, DAMAGE_TYPE.PIERCING]
  ],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const mordenkainensPrivateSanctum: SpellEntry = {
  id: "spell-mordenkainens-private-sanctum",
  name: "Mordenkainen's Private Sanctum",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.TEN_MINUTES],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["24 hours"],
  description: [
    "You make an area within range magically secure. The area is a cube that can be as small as 5 feet to as large as 100 feet on each side. The spell lasts for the duration or until you use an action to dismiss it.",
    "When you cast the spell, you decide what sort of security the spell provides, choosing any or all of the following properties:",
    "Sound can't pass through the barrier at the edge of the warded area.",
    "The barrier of the warded area appears dark and foggy, preventing vision, including Darkvision, through it.",
    "Sensors created by Divination spells can't appear inside the protected area or pass through the barrier at its perimeter.",
    "Creatures in the area can't be targeted by Divination spells.",
    "Nothing can teleport into or out of the warded area.",
    "Planar travel is blocked within the warded area.",
    "Casting this spell on the same spot every day for a year makes this effect permanent.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, you can increase the size of the cube by 100 feet for each slot level beyond 4th. Thus you could protect a cube that can be up to 200 feet on one side by using a spell slot of 5th level."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const otilukesResilientSphere: SpellEntry = {
  id: "spell-otilukes-resilient-sphere",
  name: "Otiluke's Resilient Sphere",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A sphere of shimmering force encloses a creature or object of Large size or smaller within range. An unwilling creature must make a Dexterity saving throw. On a failed save, the creature is enclosed for the duration.",
    "Nothing, not physical objects, energy, or other spell effects, can pass through the barrier, in or out, though a creature in the sphere can breathe there. The sphere is immune to all damage, and a creature or object inside can't be damaged by attacks or effects originating from outside, nor can a creature inside the sphere damage anything outside it.",
    "The sphere is weightless and just large enough to contain the creature or object inside. An enclosed creature can use its action to push against the sphere's walls and thus roll the sphere at up to half the creature's Speed. Similarly, the globe can be picked up and moved by other creatures.",
    "A Disintegrate spell targeting the globe destroys it without harming anything inside it."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const phantasmalKiller: SpellEntry = {
  id: "spell-phantasmal-killer",
  name: "Phantasmal Killer",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You tap into the nightmares of a creature you can see within range and create an illusory manifestation of its deepest fears, visible only to that creature.",
    "The target must make a Wisdom saving throw. On a failed save, the target becomes Frightened for the duration. At the end of each of the target's turns before the spell ends, the target must succeed on a Wisdom saving throw or take 4d10 Psychic damage. On a successful save, the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d10 for each slot level above 4th."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC],
    [DICE.D10, DAMAGE_TYPE.PSYCHIC]
  ],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const polymorph: SpellEntry = {
  id: "spell-polymorph",
  name: "Polymorph",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "This spell transforms a creature that you can see within range into a new form. An unwilling creature must make a Wisdom saving throw to avoid the effect. A Shapechanger automatically succeeds on this saving throw.",
    "The transformation lasts for the duration, or until the target drops to 0 Hit Points or dies. The new form can be any Beast whose Challenge Rating is equal to or less than the target's, or the target's level, if it doesn't have a Challenge Rating. The target's game statistics, including mental ability scores, are replaced by the statistics of the chosen Beast. It retains its alignment and personality.",
    "The target assumes the Hit Points of its new form. When it reverts to its normal form, the creature returns to the number of Hit Points it had before it transformed. If it reverts as a result of dropping to 0 Hit Points, any excess damage carries over to its normal form. As long as the excess damage doesn't reduce the creature's normal form to 0 Hit Points, it isn't knocked Unconscious.",
    "The creature is limited in the actions it can perform by the nature of its new form, and it can't speak, cast spells, or take any other action that requires hands or speech.",
    "The target's gear melds into the new form. The creature can't activate, use, wield, or otherwise benefit from any of its equipment. This spell can't affect a target that has 0 Hit Points."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 4
};

export const raulothimsPsychicLance: SpellEntry = {
  id: "spell-raulothims-psychic-lance",
  name: "Raulothim's Psychic Lance",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You unleash a shimmering lance of Psychic power from your forehead at a creature that you can see within range. Alternatively, you can utter a creature's name. If the named target is within range, it becomes the spell's target even if you can't see it. If the named target isn't within range, the lance dissipates without effect.",
    "The target must make an Intelligence saving throw. On a failed save, the target takes 7d6 Psychic damage and is Incapacitated until the start of your next turn. On a successful save, the creature takes half as much damage and isn't Incapacitated.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d6 for each slot level above 4th."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 4
};

export const shadowOfMoil: SpellEntry = {
  id: "spell-shadow-of-moil",
  name: "Shadow Of Moil",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "Flame-like shadows wreathe your body until the spell ends, causing you to become heavily obscured to others. The shadows turn dim light within 10 feet of you into darkness, and bright light in the same area into dim light.",
    "Until the spell ends, you have Resistance to Radiant damage. In addition, whenever a creature within 10 feet of you hits you with an attack, the shadows lash out at that creature, dealing it 2d8 Necrotic damage."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D8, DAMAGE_TYPE.NECROTIC]
  ],
  spellLists: [SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 4
};

export const sickeningRadiance: SpellEntry = {
  id: "spell-sickening-radiance",
  name: "Sickening Radiance",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 10 minutes"],
  description: [
    "Dim, greenish light spreads within a 30-foot-radius sphere centered on a point you choose within range. The light spreads around corners, and it lasts until the spell ends.",
    "When a creature moves into the spell's area for the first time on a turn or starts its turn there, that creature must succeed on a Constitution saving throw or take 4d10 Radiant damage, and it suffers one level of Exhaustion and emits a dim, greenish light in a 5-foot radius. This light makes it impossible for the creature to benefit from being Invisible. The light and any levels of Exhaustion caused by this spell go away when the spell ends."
  ],
  damage: [
    [DICE.D10, DAMAGE_TYPE.RADIANT],
    [DICE.D10, DAMAGE_TYPE.RADIANT],
    [DICE.D10, DAMAGE_TYPE.RADIANT],
    [DICE.D10, DAMAGE_TYPE.RADIANT]
  ],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const spiritOfDeath: SpellEntry = {
  id: "spell-spirit-of-death",
  name: "Spirit Of Death",
  category: ENTRY_CATEGORIES.SPELLS,
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
    "<strong>Incorporeal Movement.</strong> The reaper can move through other creatures and objects as if they were difficult terrain. If it ends its turn inside an object, it is shunted to the nearest unoccupied space and takes 1d10 Force damage for every 5 feet traveled.",
    "<strong>Multiattack.</strong> The spirit makes a number of Reaping Scythe attacks equal to half the level of the spell, rounded down.",
    "<strong>Reaping Scythe.</strong> Melee Weapon Attack: your spell attack modifier to hit, with Advantage, reach 5 ft., one target. Hit: 1d8 + 3 + the spell's level Necrotic damage.",
    "<strong>Haunt Creature.</strong> The spirit targets a creature it can see within 10 feet of itself and begins haunting it. While the target is haunted, you and the spirit sense the direction and distance to the target if it is on the same plane of existence as you. Additionally, if the target starts its turn within 10 feet of the spirit, the target must succeed on a Wisdom saving throw against your spell save DC or have the Frightened condition until the start of the target's next turn. The target remains haunted until it dies, the spirit disappears, or the spirit uses this action again."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.NECROTIC]],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const staggeringSmite: SpellEntry = {
  id: "spell-staggering-smite",
  name: "Staggering Smite",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "The next time you hit a creature with a melee weapon attack during this spell's duration, your weapon pierces both body and mind, and the attack deals an extra 4d6 Psychic damage to the target. The target must make a Wisdom saving throw. On a failed save, it has Disadvantage on attack rolls and ability checks, and can't take Reactions, until the end of its next turn."
  ],
  damage: [
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC],
    [DICE.D6, DAMAGE_TYPE.PSYCHIC]
  ],
  spellLists: [SPELL_LIST_CLASS.PALADIN],
  spellLevel: 4
};

export const stoneShape: SpellEntry = {
  id: "spell-stone-shape",
  name: "Stone Shape",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You touch a stone object of Medium size or smaller or a section of stone no more than 5 feet in any dimension and form it into any shape that suits your purpose. So, for example, you could shape a large rock into a weapon, idol, or coffer, or make a small passage through a wall, as long as the wall is less than 5 feet thick. You could also shape a stone door or its frame to seal the door shut. The object you create can have up to two hinges and a latch, but finer mechanical detail isn't possible."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 4
};

export const stoneskin: SpellEntry = {
  id: "spell-stoneskin",
  name: "Stoneskin",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "This spell turns the flesh of a willing creature you touch as hard as stone. Until the spell ends, the target has Resistance to nonmagical Bludgeoning, Piercing, and Slashing damage."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.RANGER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 4
};

export const stormSphere: SpellEntry = {
  id: "spell-storm-sphere",
  name: "Storm Sphere",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "A 20-foot-radius sphere of whirling air springs into existence centered on a point you choose within range. The sphere remains for the spell's duration. Each creature in the sphere when it appears or that ends its turn there must succeed on a Strength saving throw or take 2d6 Bludgeoning damage. The sphere's space is difficult terrain.",
    "Until the spell ends, you can use a Bonus Action on each of your turns to cause a bolt of Lightning to leap from the center of the sphere toward one creature you choose within 60 feet of the center. Make a ranged spell attack. You have Advantage on the attack roll if the target is in the sphere. On a hit, the target takes 4d6 Lightning damage.",
    "Creatures within 30 feet of the sphere have Disadvantage on Wisdom (Perception) checks made to listen.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the damage increases for each of its effects by 1d6 for each slot level above 4th."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const summonAberration: SpellEntry = {
  id: "spell-summon-aberration",
  name: "Summon Aberration",
  category: ENTRY_CATEGORIES.SPELLS,
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
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const summonConstruct: SpellEntry = {
  id: "spell-summon-construct",
  name: "Summon Construct",
  category: ENTRY_CATEGORIES.SPELLS,
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
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const summonElemental: SpellEntry = {
  id: "spell-summon-elemental",
  name: "Summon Elemental",
  category: ENTRY_CATEGORIES.SPELLS,
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
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.RANGER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const summonGreaterDemon: SpellEntry = {
  id: "spell-summon-greater-demon",
  name: "Summon Greater Demon",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 hour"],
  description: [
    "You utter foul words, summoning one demon from the chaos of the Abyss. You choose the demon's type, which must be one of Challenge Rating 5 or lower, such as a shadow demon or a barlgura. The demon appears in an unoccupied space you can see within range, and the demon disappears when it drops to 0 Hit Points or when the spell ends.",
    "Roll Initiative for the demon, which has its own turns. When you summon it and on each of your turns thereafter, you can issue a verbal command to it, requiring no action on your part, telling it what it must do on its next turn. If you issue no command, it spends its turn attacking any creature within reach that has attacked it.",
    "At the end of each of the demon's turns, it makes a Charisma saving throw. The demon has Disadvantage on this saving throw if you say its true name. On a failed save, the demon continues to obey you. On a successful save, your control of the demon ends for the rest of the duration, and the demon spends its turns pursuing and attacking the nearest non-demons to the best of its ability. If you stop Concentrating on the spell before it reaches its full duration, an uncontrolled demon doesn't disappear for 1d6 rounds if it still has Hit Points.",
    "As part of casting the spell, you can form a circle on the ground with the blood used as a material component. The circle is large enough to encompass your space. While the spell lasts, the summoned demon can't cross the circle or harm it, and it can't target anyone within it. Using the material component in this manner consumes it when the spell ends.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the Challenge Rating increases by 1 for each slot level above 4th."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const synchronicity: SpellEntry = {
  id: "spell-synchronicity",
  name: "Synchronicity",
  category: ENTRY_CATEGORIES.SPELLS,
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
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const systemBackdoor: SpellEntry = {
  id: "spell-system-backdoor",
  name: "System Backdoor",
  category: ENTRY_CATEGORIES.SPELLS,
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
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const vitriolicSphere: SpellEntry = {
  id: "spell-vitriolic-sphere",
  name: "Vitriolic Sphere",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "150 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You point at a place within range, and a glowing 1-foot ball of emerald acid streaks there and explodes in a 20-foot radius. Each creature in that area must make a Dexterity saving throw. On a failed save, a creature takes 10d4 Acid damage and 5d4 Acid damage at the end of its next turn. On a successful save, a creature takes half the initial damage and no damage at the end of its next turn.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the initial damage increases by 2d4 for each slot level above 4th."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const wallOfFire: SpellEntry = {
  id: "spell-wall-of-fire",
  name: "Wall of Fire",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You create a wall of fire on a solid surface within range. You can make the wall up to 60 feet long, 20 feet high, and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall is opaque and lasts for the duration.",
    "When the wall appears, each creature within its area must make a Dexterity saving throw. On a failed save, a creature takes 5d8 Fire damage, or half as much damage on a successful save.",
    "One side of the wall, selected by you when you cast this spell, deals 5d8 Fire damage to each creature that ends its turn within 10 feet of that side or inside the wall. A creature takes the same damage when it enters the wall for the first time on a turn or ends its turn there. The other side of the wall deals no damage.",
    "<strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d8 for each slot level above 4th."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE],
    [DICE.D8, DAMAGE_TYPE.FIRE]
  ],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const waterySphere: SpellEntry = {
  id: "spell-watery-sphere",
  name: "Watery Sphere",
  category: ENTRY_CATEGORIES.SPELLS,
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
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 4
};

export const spellEntries4: SpellEntry[] = [
  arcaneEye,
  auraOfLife,
  auraOfPurity,
  banishment,
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
  evardsBlackTentacles,
  fabricate,
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
  leomundsSecretChest,
  locateCreature,
  mordenkainensFaithfulHound,
  mordenkainensPrivateSanctum,
  otilukesResilientSphere,
  phantasmalKiller,
  polymorph,
  raulothimsPsychicLance,
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
