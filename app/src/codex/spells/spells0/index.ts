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

export const acidSplash: SpellEntry = {
  id: "spell-acid-splash",
  name: "Acid Splash",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You hurl a bubble of acid. Choose one creature you can see within range, or choose two creatures you can see within range that are within 5 feet of each other. A target must succeed on a Dexterity saving throw or take 1d6 Acid damage.",
    "<strong>At Higher Levels.</strong> This spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6)."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.ACID]],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 0
};

export const bladeWard: SpellEntry = {
  id: "spell-blade-ward",
  name: "Blade Ward",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 round"],
  description: [
    "You extend your hand and trace a sigil of warding in the air. Until the end of your next turn, you have resistance against bludgeoning, piercing, and slashing damage dealt by weapon attacks."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const boomingBlade: SpellEntry = {
  id: "spell-booming-blade",
  name: "Booming Blade",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (5-foot radius)",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 round"],
  description: [
    "You brandish the weapon used in the spell's casting and make a melee attack with it against one creature within 5 feet of you. On a hit, the target suffers the weapon attack's normal effects and then becomes sheathed in booming energy until the start of your next turn. If the target willingly moves 5 feet or more before then, the target takes 1d8 Thunder damage, and the spell ends.",
    "<strong>At Higher Levels.</strong> At 5th level, the melee attack deals an extra 1d8 Thunder damage to the target on a hit, and the damage the target takes for moving increases to 2d8. Both damage rolls increase by 1d8 at 11th level (2d8 and 3d8) and again at 17th level (3d8 and 4d8)."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.THUNDER]],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const chillTouch: SpellEntry = {
  id: "spell-chill-touch",
  name: "Chill Touch",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 round"],
  description: [
    "You create a ghostly, skeletal hand in the space of a creature within range. Make a ranged spell attack against the creature to assail it with the chill of the grave. On a hit, the target takes 1d8 Necrotic damage, and it can't regain Hit Points until the start of your next turn. Until then, the hand clings to the target. If you hit an Undead target, it also has Disadvantage on attack rolls against you until the end of your next turn.",
    "<strong>At Higher Levels.</strong> This spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8)."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.NECROTIC]],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 0
};

export const controlFlames: SpellEntry = {
  id: "spell-control-flames",
  name: "Control Flames",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.S],
  duration: ["Instantaneous or 1 hour"],
  description: [
    "You choose nonmagical flame that you can see within range and that fits within a 5-foot cube. You affect it in one of the following ways:",
    "You instantaneously expand the flame 5 feet in one direction, provided that wood or other fuel is present in the new location.",
    "You instantaneously extinguish the flames within the cube.",
    "You double or halve the area of bright light and dim light cast by the flame, change its color, or both. The change lasts for 1 hour.",
    "You cause simple shapes, such as the vague form of a creature, an inanimate object, or a location, to appear within the flames and animate as you like. The shapes last for 1 hour.",
    "If you cast this spell multiple times, you can have up to three of its non-instantaneous effects active at a time, and you can dismiss such an effect as an action."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const createBonfire: SpellEntry = {
  id: "spell-create-bonfire",
  name: "Create Bonfire",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You create a bonfire on ground that you can see within range. Until the spell ends, the bonfire fills a 5-foot cube. Any creature in the bonfire's space when you cast the spell must succeed on a Dexterity saving throw or take 1d8 Fire damage. A creature must also make the saving throw when it enters the bonfire's space for the first time on a turn or ends its turn there.",
    "<strong>At Higher Levels.</strong> The spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8)."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.FIRE]],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const dancingLights: SpellEntry = {
  id: "spell-dancing-lights",
  name: "Dancing Lights",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You create up to four torch-sized lights within range, making them appear as torches, lanterns, or glowing orbs that hover in the air for the duration. You can also combine the four lights into one glowing vaguely humanoid form of Medium size. Whichever form you choose, each light sheds dim light in a 10-foot radius.",
    "As a Bonus Action on your turn, you can move the lights up to 60 feet to a new spot within range. A light must be within 20 feet of another light created by this spell, and a light winks out if it exceeds the spell's range."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const druidcraft: SpellEntry = {
  id: "spell-druidcraft",
  name: "Druidcraft",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "Whispering to the spirits of nature, you create one of the following effects within range:",
    "You create a tiny, harmless sensory effect that predicts what the weather will be at your location for the next 24 hours. The effect might manifest as a golden orb for clear skies, a cloud for rain, falling snowflakes for snow, and so on. This effect persists for 1 round.",
    "You instantly make a flower blossom, a seed pod open, or a leaf bud bloom.",
    "You create an instantaneous, harmless sensory effect, such as falling leaves, a puff of wind, the sound of a small animal, or the faint odor of skunk. The effect must fit in a 5-foot cube.",
    "You instantly light or snuff out a candle, a torch, or a small campfire."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 0
};

export const elementalism: SpellEntry = {
  id: "spell-elementalism",
  name: "Elementalism",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You exert control over the elements, creating one of the following effects within range.",
    "<strong>Beckon Air.</strong> You create a breeze strong enough to ripple cloth, stir dust, rustle leaves, and close open doors and shutters, all in a 5-foot Cube. Doors and shutters being held open by someone or something aren't affected.",
    "<strong>Beckon Earth.</strong> You create a thin shroud of dust or sand that covers surfaces in a 5-foot-square area, or you cause a single word to appear in your handwriting in a patch of dirt or sand.",
    "<strong>Beckon Fire.</strong> You create a thin cloud of harmless embers and colored, scented smoke in a 5-foot Cube. You choose the color and scent, and the embers can light candles, torches, or lamps in that area. The smoke's scent lingers for 1 minute.",
    "<strong>Beckon Water.</strong> You create a spray of cool mist that lightly dampens creatures and objects in a 5-foot Cube. Alternatively, you create 1 cup of clean water either in an open container or on a surface, and the water evaporates in 1 minute.",
    "<strong>Sculpt Element.</strong> You cause dirt, sand, fire, smoke, mist, or water that can fit in a 1-foot Cube to assume a crude shape (such as that of a creature) for 1 hour."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const eldritchBlast: SpellEntry = {
  id: "spell-eldritch-blast",
  name: "Eldritch Blast",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Force damage.",
    "<strong>At Higher Levels.</strong> The spell creates more than one beam when you reach higher levels: two beams at 5th level, three beams at 11th level, and four beams at 17th level. You can direct the beams at the same target or at different ones. Make a separate attack roll for each beam."
  ],
  damage: [[DICE.D10, DAMAGE_TYPE.FORCE]],
  spellLists: [SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 0
};

export const encodeThoughts: SpellEntry = {
  id: "spell-encode-thoughts",
  name: "Encode Thoughts",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.S],
  duration: ["8 hours"],
  description: [
    "You pull a memory, an idea, or a message from your mind and transform it into a tangible string of glowing energy called a thought strand, which persists for the duration or until you cast this spell again. The thought strand appears in an unoccupied space within 5 feet of you as a Tiny, weightless, semisolid object that can be held and carried like a ribbon. It is otherwise stationary.",
    "If you cast this spell while concentrating on a spell or an ability that allows you to read or manipulate the thoughts of others, such as Detect Thoughts or Modify Memory, you can transform the thoughts or memories you read, rather than your own, into a thought strand.",
    "Casting this spell while holding a thought strand allows you to instantly receive whatever memory, idea, or message the thought strand contains. Casting Detect Thoughts on the strand has the same effect."
  ],
  damage: [],
  spellLists: [],
  spellLevel: 0
};

export const fireBolt: SpellEntry = {
  id: "spell-fire-bolt",
  name: "Fire Bolt",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Fire damage. A flammable object hit by this spell ignites if it isn't being worn or carried.",
    "<strong>At Higher Levels.</strong> This spell's damage increases by 1d10 when you reach 5th level (2d10), 11th level (3d10), and 17th level (4d10)."
  ],
  damage: [[DICE.D10, DAMAGE_TYPE.FIRE]],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 0
};

export const friends: SpellEntry = {
  id: "spell-friends",
  name: "Friends",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "For the duration, you have Advantage on all Charisma checks directed at one creature of your choice that isn't hostile toward you. When the spell ends, the creature realizes that you used magic to influence its mood and becomes hostile toward you.",
    "A creature prone to violence might attack you. Another creature might seek retribution in other ways, at the DM's discretion, depending on the nature of your interaction with it."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const frostbite: SpellEntry = {
  id: "spell-frostbite",
  name: "Frostbite",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You cause numbing frost to form on one creature that you can see within range. The target must make a Constitution saving throw. On a failed save, the target takes 1d6 Cold damage, and it has Disadvantage on the next weapon attack roll it makes before the end of its next turn.",
    "<strong>At Higher Levels.</strong> The spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6)."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.COLD]],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const greenFlameBlade: SpellEntry = {
  id: "spell-green-flame-blade",
  name: "Green-Flame Blade",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (5-foot radius)",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You brandish the weapon used in the spell's casting and make a melee attack with it against one creature within 5 feet of you. On a hit, the target suffers the weapon attack's normal effects, and you can cause green fire to leap from the target to a different creature of your choice that you can see within 5 feet of it. The second creature takes Fire damage equal to your spellcasting ability modifier.",
    "<strong>At Higher Levels.</strong> At 5th level, the melee attack deals an extra 1d8 Fire damage to the target on a hit, and the fire damage to the second creature increases to 1d8 + your spellcasting ability modifier. Both damage rolls increase by 1d8 at 11th level (2d8 and 2d8) and 17th level (3d8 and 3d8)."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.FIRE]],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const guidance: SpellEntry = {
  id: "spell-guidance",
  name: "Guidance",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice. It can roll the die before or after making the ability check. The spell then ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 0
};

export const gust: SpellEntry = {
  id: "spell-gust",
  name: "Gust",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You seize the air and compel it to create one of the following effects at a point you can see within range:",
    "One Medium or smaller creature that you choose must succeed on a Strength saving throw or be pushed up to 5 feet away from you.",
    "You create a small blast of air capable of moving one object that is neither held nor carried and that weighs no more than 5 pounds. The object is pushed up to 10 feet away from you. It isn't pushed with enough force to cause damage.",
    "You create a harmless sensory affect using air, such as causing leaves to rustle, wind to slam shutters shut, or your clothing to ripple in a breeze."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 0
};

export const handOfRadiance: SpellEntry = {
  id: "spell-hand-of-radiance",
  name: "Hand of Radiance",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "5 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You raise your hand, and burning radiance erupts from it. Each creature of your choice that you can see within 5 feet of you must succeed on a Constitution saving throw or take 1d6 Radiant damage.",
    "<strong>At Higher Levels.</strong> The spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6)."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.RADIANT]],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 0
};

export const infestation: SpellEntry = {
  id: "spell-infestation",
  name: "Infestation",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You cause a cloud of mites, fleas, and other parasites to appear momentarily on one creature you can see within range. The target must succeed on a Constitution saving throw, or it takes 1d6 Poison damage and moves 5 feet in a random direction if it can move and its Speed is at least 5 feet. Roll a d4 for the direction: 1, north; 2, south; 3, east; or 4, west. This movement doesn't provoke opportunity attacks, and if the direction rolled is blocked, the target doesn't move.",
    "<strong>At Higher Levels.</strong> The spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6)."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.POISON]],
  spellLists: [
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const light: SpellEntry = {
  id: "spell-light",
  name: "Light",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.M],
  duration: ["1 hour"],
  description: [
    "You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet. The light can be colored as you like. Completely covering the object with something opaque blocks the light. The spell ends if you cast it again or dismiss it as an action.",
    "If you target an object held or worn by a hostile creature, that creature must succeed on a Dexterity saving throw to avoid the spell."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const lightningLure: SpellEntry = {
  id: "spell-lightning-lure",
  name: "Lightning Lure",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (15-foot radius)",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You create a lash of lightning energy that strikes at one creature of your choice that you can see within 15 feet of you. The target must succeed on a Strength saving throw or be pulled up to 10 feet in a straight line toward you and then take 1d8 Lightning damage if it is within 5 feet of you.",
    "<strong>At Higher Levels.</strong> This spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8)."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.LIGHTNING]],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const mageHand: SpellEntry = {
  id: "spell-mage-hand",
  name: "Mage Hand",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 minute"],
  description: [
    "A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it as an action. The hand vanishes if it is ever more than 30 feet away from you or if you cast this spell again.",
    "You can use your action to control the hand. You can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial. You can move the hand up to 30 feet each time you use it.",
    "The hand can't attack, activate magical items, or carry more than 10 pounds."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const magicStone: SpellEntry = {
  id: "spell-magic-stone",
  name: "Magic Stone",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 minute"],
  description: [
    "You touch one to three pebbles and imbue them with magic. You or someone else can make a ranged spell attack with one of the pebbles by throwing it or hurling it with a sling. If thrown, it has a range of 60 feet. If someone else attacks with the pebble, that attacker adds your spellcasting ability modifier, not the attacker's, to the attack roll. On a hit, the target takes Bludgeoning damage equal to 1d6 + your spellcasting ability modifier. Hit or miss, the spell then ends on the stone.",
    "If you cast this spell again, the spell ends early on any pebbles still affected by it."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.BLUDGEONING]],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.WARLOCK],
  spellLevel: 0
};

export const mending: SpellEntry = {
  id: "spell-mending",
  name: "Mending",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.MINUTE],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "This spell repairs a single break or tear in an object you touch, such as a broken chain link, two halves of a broken key, a torn cloak, or a leaking wineskin. As long as the break or tear is no larger than 1 foot in any dimension, you mend it, leaving no trace of the former damage.",
    "This spell can physically repair a magic item or construct, but the spell can't restore magic to such an object."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.CLERIC,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const message: SpellEntry = {
  id: "spell-message",
  name: "Message",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "120 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 round"],
  description: [
    "You point your finger toward a creature within range and whisper a message. The target, and only the target, hears the message and can reply in a whisper that only you can hear.",
    "You can cast this spell through solid objects if you are familiar with the target and know it is beyond the barrier. Magical silence, 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood blocks the spell. The spell doesn't have to follow a straight line and can travel freely around corners or through openings."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const mindSliver: SpellEntry = {
  id: "spell-mind-sliver",
  name: "Mind Sliver",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["1 round"],
  description: [
    "You drive a disorienting spike of psychic energy into the mind of one creature you can see within range. The target must succeed on an Intelligence saving throw or take 1d6 Psychic damage and subtract 1d4 from the next saving throw it makes before the end of your next turn.",
    "<strong>At Higher Levels.</strong> This spell's damage increases by 1d6 when you reach certain levels: 5th level (2d6), 11th level (3d6), and 17th level (4d6)."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.PSYCHIC]],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 0
};

export const minorIllusion: SpellEntry = {
  id: "spell-minor-illusion",
  name: "Minor Illusion",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ILLUSION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 minute"],
  description: [
    "You create a sound or an image of an object within range that lasts for the duration. The illusion also ends if you dismiss it as an action or cast this spell again.",
    "If you create a sound, its volume can range from a whisper to a scream. It can be your voice, someone else's voice, a lion's roar, a beating of drums, or any other sound you choose. The sound continues unabated throughout the duration, or you can make discrete sounds at different times before the spell ends.",
    "If you create an image of an object, such as a chair, muddy footprints, or a small chest, it must be no larger than a 5-foot cube. The image can't create sound, light, smell, or any other sensory effect. Physical interaction with the image reveals it to be an illusion, because things can pass through it.",
    "If a creature uses its action to examine the sound or image, the creature can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the illusion becomes faint to the creature."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const moldEarth: SpellEntry = {
  id: "spell-mold-earth",
  name: "Mold Earth",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.S],
  duration: ["Instantaneous or 1 hour"],
  description: [
    "You choose a portion of dirt or stone that you can see within range and that fits within a 5-foot cube. You manipulate it in one of the following ways:",
    "If you target an area of loose earth, you can instantaneously excavate it, move it along the ground, and deposit it up to 5 feet away. This movement doesn't have enough force to cause damage.",
    "You cause shapes, colors, or both to appear on the dirt or stone, spelling out words, creating images, or shaping patterns. The changes last for 1 hour.",
    "If the dirt or stone you target is on the ground, you cause it to become difficult terrain. Alternatively, you can cause the ground to become normal terrain if it is already difficult terrain. This change lasts for 1 hour.",
    "If you cast this spell multiple times, you can have no more than two of its non-instantaneous effects active at a time, and you can dismiss such an effect as an action."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 0
};

export const onOff: SpellEntry = {
  id: "spell-on-off",
  name: "On/Off",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "This cantrip allows you to activate or deactivate any electronic device within range, as long as the device has a clearly defined on or off function that can be easily accessed from the outside of the device. Any device that requires a software-based shutdown sequence to activate or deactivate cannot be affected by On/Off."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 0
};

export const poisonSpray: SpellEntry = {
  id: "spell-poison-spray",
  name: "Poison Spray",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You extend your hand toward a creature you can see within range and project a puff of noxious gas from your palm. The creature must succeed on a Constitution saving throw or take 1d12 Poison damage.",
    "<strong>At Higher Levels.</strong> This spell's damage increases by 1d12 when you reach 5th level (2d12), 11th level (3d12), and 17th level (4d12)."
  ],
  damage: [[DICE.D12, DAMAGE_TYPE.POISON]],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const prestidigitation: SpellEntry = {
  id: "spell-prestidigitation",
  name: "Prestidigitation",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "10 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Up to 1 hour"],
  description: [
    "This spell is a minor magical trick that novice spellcasters use for practice. You create one of the following magical effects within range:",
    "You create an instantaneous, harmless sensory effect, such as a shower of sparks, a puff of wind, faint musical notes, or an odd odor.",
    "You instantaneously light or snuff out a candle, a torch, or a small campfire.",
    "You instantaneously clean or soil an object no larger than 1 cubic foot.",
    "You chill, warm, or flavor up to 1 cubic foot of nonliving material for 1 hour.",
    "You make a color, a small mark, or a symbol appear on an object or a surface for 1 hour.",
    "You create a nonmagical trinket or an illusory image that can fit in your hand and that lasts until the end of your next turn.",
    "If you cast this spell multiple times, you can have up to three of its non-instantaneous effects active at a time, and you can dismiss such an effect as an action."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const primalSavagery: SpellEntry = {
  id: "spell-primal-savagery",
  name: "Primal Savagery",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You channel primal magic to cause your teeth or fingernails to sharpen, ready to deliver a corrosive attack. Make a melee spell attack against one creature within 5 feet of you. On a hit, the target takes 1d10 Acid damage. After you make the attack, your teeth or fingernails return to normal.",
    "<strong>At Higher Levels.</strong> The spell's damage increases by 1d10 when you reach 5th level (2d10), 11th level (3d10), and 17th level (4d10)."
  ],
  damage: [[DICE.D10, DAMAGE_TYPE.ACID]],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 0
};

export const produceFlame: SpellEntry = {
  id: "spell-produce-flame",
  name: "Produce Flame",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["10 minutes"],
  description: [
    "A flickering flame appears in your hand. The flame remains there for the duration and harms neither you nor your equipment. The flame sheds bright light in a 10-foot radius and dim light for an additional 10 feet. The spell ends if you dismiss it as an action or if you cast it again.",
    "You can also attack with the flame, although doing so ends the spell. When you cast this spell, or as an action on a later turn, you can hurl the flame at a creature within 30 feet of you. Make a ranged spell attack. On a hit, the target takes 1d8 Fire damage.",
    "<strong>At Higher Levels.</strong> This spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8)."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.FIRE]],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 0
};

export const rayOfFrost: SpellEntry = {
  id: "spell-ray-of-frost",
  name: "Ray of Frost",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 1d8 Cold damage, and its Speed is reduced by 10 feet until the start of your next turn.",
    "<strong>At Higher Levels.</strong> The spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8)."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.COLD]],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 0
};

export const resistance: SpellEntry = {
  id: "spell-resistance",
  name: "Resistance",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: [DURATION.CONCENTRATION, "up to 1 minute"],
  description: [
    "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one saving throw of its choice. It can roll the die before or after the saving throw. The spell then ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.DRUID],
  spellLevel: 0
};

export const sacredFlame: SpellEntry = {
  id: "spell-sacred-flame",
  name: "Sacred Flame",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 Radiant damage. The target gains no benefit from cover for this saving throw.",
    "<strong>At Higher Levels.</strong> The spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8)."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.RADIANT]],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 0
};

export const sappingSting: SpellEntry = {
  id: "spell-sapping-sting",
  name: "Sapping Sting",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You sap the vitality of one creature you can see in range. The target must succeed on a Constitution saving throw or take 1d4 Necrotic damage and fall Prone.",
    "<strong>At Higher Levels.</strong> This spell's damage increases by 1d4 when you reach 5th level (2d4), 11th level (3d4), and 17th level (4d4)."
  ],
  damage: [[DICE.D4, DAMAGE_TYPE.NECROTIC]],
  spellLists: [SPELL_LIST_CLASS.WIZARD],
  spellLevel: 0
};

export const shapeWater: SpellEntry = {
  id: "spell-shape-water",
  name: "Shape Water",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.S],
  duration: ["Instantaneous or 1 hour"],
  description: [
    "You choose an area of water that you can see within range and that fits within a 5-foot cube. You manipulate it in one of the following ways:",
    "You instantaneously move or otherwise change the flow of the water as you direct, up to 5 feet in any direction. This movement doesn't have enough force to cause damage.",
    "You cause the water to form into simple shapes and animate at your direction. This change lasts for 1 hour.",
    "You change the water's color or opacity. The water must be changed in the same way throughout. This change lasts for 1 hour.",
    "You freeze the water, provided that there are no creatures in it. The water unfreezes in 1 hour.",
    "If you cast this spell multiple times, you can have no more than two of its non-instantaneous effects active at a time, and you can dismiss such an effect as an action."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 0
};

export const shillelagh: SpellEntry = {
  id: "spell-shillelagh",
  name: "Shillelagh",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.BONUS_ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["1 minute"],
  description: [
    "The wood of a club or quarterstaff you are holding is imbued with nature's power. For the duration, you can use your spellcasting ability instead of Strength for the attack and damage rolls of melee attacks using that weapon, and the weapon's damage die becomes a d8. The weapon also becomes magical, if it isn't already. The spell ends if you cast it again or if you let go of the weapon."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.DRUID],
  spellLevel: 0
};

export const shockingGrasp: SpellEntry = {
  id: "spell-shocking-grasp",
  name: "Shocking Grasp",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "Lightning springs from your hand to deliver a shock to a creature you try to touch. Make a melee spell attack against the target. You have Advantage on the attack roll if the target is wearing armor made of metal. On a hit, the target takes 1d8 Lightning damage, and it can't take reactions until the start of its next turn.",
    "<strong>At Higher Levels.</strong> The spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8)."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.LIGHTNING]],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.SORCERER, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 0
};

export const spareTheDying: SpellEntry = {
  id: "spell-spare-the-dying",
  name: "Spare the Dying",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You touch a living creature that has 0 Hit Points. The creature becomes stable. This spell has no effect on Undead or constructs."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.CLERIC],
  spellLevel: 0
};

export const starryWisp: SpellEntry = {
  id: "spell-starry-wisp",
  name: "Starry Wisp",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You launch a mote of light at one creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d8 Radiant damage, and until the end of your next turn, it emits Dim Light in a 10-foot radius and can't benefit from the Invisible condition.",
    "<strong>At Higher Levels.</strong> The spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8)."
  ],
  damage: [[DICE.D8, DAMAGE_TYPE.RADIANT]],
  spellLists: [SPELL_LIST_CLASS.BARD, SPELL_LIST_CLASS.DRUID],
  spellLevel: 0
};

export const swordBurst: SpellEntry = {
  id: "spell-sword-burst",
  name: "Sword Burst",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.CONJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (5-foot radius)",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You create a momentary circle of spectral blades that sweep around you. All other creatures within 5 feet of you must succeed on a Dexterity saving throw or take 1d6 Force damage.",
    "<strong>At Higher Levels.</strong> This spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6)."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.FORCE]],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const thaumaturgy: SpellEntry = {
  id: "spell-thaumaturgy",
  name: "Thaumaturgy",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Up to 1 minute"],
  description: [
    "You manifest a minor wonder, a sign of supernatural power, within range. You create one of the following magical effects within range:",
    "Your voice booms up to three times as loud as normal for 1 minute.",
    "You cause flames to flicker, brighten, dim, or change color for 1 minute.",
    "You cause harmless tremors in the ground for 1 minute.",
    "You create an instantaneous sound that originates from a point of your choice within range, such as a rumble of thunder, the cry of a raven, or ominous whispers.",
    "You instantaneously cause an unlocked door or window to fly open or slam shut.",
    "You alter the appearance of your eyes for 1 minute.",
    "If you cast this spell multiple times, you can have up to three of its 1-minute effects active at a time, and you can dismiss such an effect as an action."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 0
};

export const thornWhip: SpellEntry = {
  id: "spell-thorn-whip",
  name: "Thorn Whip",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.TRANSMUTATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You create a long, vine-like whip covered in thorns that lashes out at your command toward a creature in range. Make a melee spell attack against the target. If the attack hits, the creature takes 1d6 Piercing damage, and if the creature is Large or smaller, you pull the creature up to 10 feet closer to you.",
    "<strong>At Higher Levels.</strong> This spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6)."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.PIERCING]],
  spellLists: [SPELL_LIST_CLASS.ARTIFICER, SPELL_LIST_CLASS.DRUID],
  spellLevel: 0
};

export const thunderclap: SpellEntry = {
  id: "spell-thunderclap",
  name: "Thunderclap",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Self (5-foot radius)",
  components: [SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You create a burst of thunderous sound, which can be heard 100 feet away. Each creature other than you within 5 feet of you must make a Constitution saving throw. On a failed save, the creature takes 1d6 Thunder damage.",
    "<strong>At Higher Levels.</strong> The spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6)."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.THUNDER]],
  spellLists: [
    SPELL_LIST_CLASS.ARTIFICER,
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.DRUID,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const tollTheDead: SpellEntry = {
  id: "spell-toll-the-dead",
  name: "Toll the Dead",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.NECROMANCY,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["Instantaneous"],
  description: [
    "You point at one creature you can see within range, and the sound of a dolorous bell fills the air around it for a moment. The target must succeed on a Wisdom saving throw or take 1d8 Necrotic damage. If the target is missing any of its Hit Points, it instead takes 1d12 Necrotic damage.",
    "<strong>At Higher Levels.</strong> The spell's damage increases by one die when you reach 5th level (2d8 or 2d12), 11th level (3d8 or 3d12), and 17th level (4d8 or 4d12)."
  ],
  damage: [
    [DICE.D8, DAMAGE_TYPE.NECROTIC],
    [DICE.D12, DAMAGE_TYPE.NECROTIC]
  ],
  spellLists: [SPELL_LIST_CLASS.CLERIC, SPELL_LIST_CLASS.WARLOCK, SPELL_LIST_CLASS.WIZARD],
  spellLevel: 0
};

export const trueStrike: SpellEntry = {
  id: "spell-true-strike",
  name: "True Strike",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.DIVINATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "30 feet",
  components: [SPELL_COMPONENT.S],
  duration: [DURATION.CONCENTRATION, "up to 1 round"],
  description: [
    "You extend your hand and point a finger at a target in range. Your magic grants you a brief insight into the target's defenses. On your next turn, you gain Advantage on your first attack roll against the target, provided that this spell hasn't ended."
  ],
  damage: [],
  spellLists: [
    SPELL_LIST_CLASS.BARD,
    SPELL_LIST_CLASS.SORCERER,
    SPELL_LIST_CLASS.WARLOCK,
    SPELL_LIST_CLASS.WIZARD
  ],
  spellLevel: 0
};

export const viciousMockery: SpellEntry = {
  id: "spell-vicious-mockery",
  name: "Vicious Mockery",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ENCHANTMENT,
  castingTime: [ACTION_TYPE.ACTION],
  range: "60 feet",
  components: [SPELL_COMPONENT.V],
  duration: ["Instantaneous"],
  description: [
    "You unleash a string of insults laced with subtle enchantments at a creature you can see within range. If the target can hear you, though it need not understand you, it must succeed on a Wisdom saving throw or take 1d4 Psychic damage and have Disadvantage on the next attack roll it makes before the end of its next turn.",
    "<strong>At Higher Levels.</strong> This spell's damage increases by 1d4 when you reach 5th level (2d4), 11th level (3d4), and 17th level (4d4)."
  ],
  damage: [[DICE.D4, DAMAGE_TYPE.PSYCHIC]],
  spellLists: [SPELL_LIST_CLASS.BARD],
  spellLevel: 0
};

export const virtue: SpellEntry = {
  id: "spell-virtue",
  name: "Virtue",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.ABJURATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "Touch",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.S],
  duration: ["1 round"],
  description: [
    "You touch one creature, imbuing it with vitality. If the target has at least 1 Hit Point, it gains a number of Temporary Hit Points equal to 1d4 + your spellcasting ability modifier. The Temporary Hit Points are lost when the spell ends."
  ],
  damage: [],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 0
};

export const wordOfRadiance: SpellEntry = {
  id: "spell-word-of-radiance",
  name: "Word of Radiance",
  category: ENTRY_CATEGORIES.SPELLS,
  magicSchool: MAGIC_SCHOOL.EVOCATION,
  castingTime: [ACTION_TYPE.ACTION],
  range: "5 feet",
  components: [SPELL_COMPONENT.V, SPELL_COMPONENT.M],
  duration: ["Instantaneous"],
  description: [
    "You utter a divine word, and burning radiance erupts from you. Each creature of your choice that you can see within range must succeed on a Constitution saving throw or take 1d6 Radiant damage.",
    "<strong>At Higher Levels.</strong> The spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6)."
  ],
  damage: [[DICE.D6, DAMAGE_TYPE.RADIANT]],
  spellLists: [SPELL_LIST_CLASS.CLERIC],
  spellLevel: 0
};

export const spellEntries0: SpellEntry[] = [
  acidSplash,
  bladeWard,
  boomingBlade,
  chillTouch,
  controlFlames,
  createBonfire,
  dancingLights,
  druidcraft,
  elementalism,
  eldritchBlast,
  encodeThoughts,
  fireBolt,
  friends,
  frostbite,
  greenFlameBlade,
  guidance,
  gust,
  handOfRadiance,
  infestation,
  light,
  lightningLure,
  mageHand,
  magicStone,
  mending,
  message,
  mindSliver,
  minorIllusion,
  moldEarth,
  onOff,
  poisonSpray,
  prestidigitation,
  primalSavagery,
  produceFlame,
  rayOfFrost,
  resistance,
  sacredFlame,
  sappingSting,
  shapeWater,
  shillelagh,
  shockingGrasp,
  spareTheDying,
  starryWisp,
  swordBurst,
  thaumaturgy,
  thornWhip,
  thunderclap,
  tollTheDead,
  trueStrike,
  viciousMockery,
  virtue,
  wordOfRadiance
];
