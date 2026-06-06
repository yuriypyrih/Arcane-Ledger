import { FEAT_CATEGORY, FEATS, TRACKER } from "../../../../codex/entries";
import { WEAPON_PROFICIENCY } from "../../../../types";
import type { FeatDefinition, FeatRequirement } from "../types";

type FrhofFeatSeed = Omit<FeatDefinition, "source">;

function createFrhofFeatDefinition(seed: FrhofFeatSeed): FeatDefinition {
  return {
    ...seed,
    source: "FRHoF",
    trackingState: seed.trackingState ?? TRACKER.NOT_TRACKED
  };
}

function minimumLevelRequirement(level: number): FeatRequirement {
  return {
    type: "minimum-level",
    level
  };
}

function featRequirement(feat: FEATS): FeatRequirement {
  return {
    type: "feat",
    feat
  };
}

function spellcastingRequirement(): FeatRequirement {
  return {
    type: "spellcasting-or-pact-magic"
  };
}

function weaponProficiencyRequirement(proficiency: WEAPON_PROFICIENCY): FeatRequirement {
  return {
    type: "proficiency",
    proficiency: {
      kind: "weapon",
      proficiency
    }
  };
}

function anyRequirement(requirements: FeatRequirement[]): FeatRequirement {
  return {
    type: "any",
    requirements
  };
}

const level4Requirement = minimumLevelRequirement(4);
const level19Requirement = minimumLevelRequirement(19);
const martialWeaponRequirement = anyRequirement([
  weaponProficiencyRequirement(WEAPON_PROFICIENCY.MARTIAL),
  weaponProficiencyRequirement(WEAPON_PROFICIENCY.MARTIAL_MELEE),
  weaponProficiencyRequirement(WEAPON_PROFICIENCY.MARTIAL_RANGED)
]);

export const frhofOriginFeatDefinitions: FeatDefinition[] = [
  createFrhofFeatDefinition({
    feat: FEATS.CULT_OF_THE_DRAGON_INITIATE,
    label: "Cult of the Dragon Initiate",
    category: FEAT_CATEGORY.ORIGIN,
    trackingState: TRACKER.TRACKED,
    page: 37,
    description: [
      "You gain the following benefits.",
      "<strong>Dragon's Tongue.</strong> You know Draconic. If you already know Draconic when you select this feat, you instead learn one language of your choice from the language tables in the Player's Handbook or Chapter 2 of this book.",
      "<strong>Dragon's Terror.</strong> You can take a Magic action to instill terror in a creature you can see within 30 feet of yourself. The target must succeed on a Wisdom saving throw (DC 8 plus your Wisdom modifier and Proficiency Bonus) or have the Frightened condition until the end of your next turn. If the target succeeds on the save or when the effect ends for a target, the target is immune to this effect for 24 hours.",
      "<strong>Inspired by Fear.</strong> When you cause a creature to have the Frightened condition and you are the source of its fear, you can gain Heroic Inspiration if you lack it. Once you use this benefit, you can't use it again until you finish a Short or Long Rest."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.EMERALD_ENCLAVE_FLEDGLING,
    label: "Emerald Enclave Fledgling",
    category: FEAT_CATEGORY.ORIGIN,
    trackingState: TRACKER.TRACKED,
    page: 37,
    description: [
      "You gain the following benefits.",
      "<strong>Speak with Animals.</strong> You always have the <spell:Speak with Animals>Speak with Animals</spell> spell prepared and can cast it with any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for this spell (choose when you select this feat). When you cast this spell as a Ritual, its duration is 8 hours.",
      "<strong>Tag Team.</strong> When you take the Help action, you can switch places with a willing ally within 5 feet of yourself as part of that same action. This movement doesn't provoke Opportunity Attacks. You can't use this benefit if the ally has the Incapacitated condition."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.HARPER_AGENT,
    label: "Harper Agent",
    category: FEAT_CATEGORY.ORIGIN,
    trackingState: TRACKER.TRACKED,
    page: 37,
    description: [
      "You gain the following benefits.",
      "<strong>Thieves' Cant.</strong> You know Thieves' Cant.",
      "<strong>Instrument Training.</strong> You gain proficiency with a Musical Instrument of your choice.",
      "<strong>Distracting Melody.</strong> When you take the Help action to assist an ally's attack roll, the enemy you're distracting can be within 30 feet of you, rather than within 5 feet of you, provided the enemy can see or hear you."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.LORDS_ALLIANCE_AGENT,
    label: "Lords' Alliance Agent",
    category: FEAT_CATEGORY.ORIGIN,
    trackingState: TRACKER.TRACKED,
    page: 38,
    description: [
      "You gain the following benefits.",
      "<strong>Inspiring Strike.</strong> Once per turn when you score a Critical Hit against a creature, you can choose an ally within 30 feet of yourself who can see or hear you and who lacks Heroic Inspiration. That ally gains Heroic Inspiration.",
      "<strong>Reassert Honor.</strong> When an enemy you can see deals damage to an ally of yours that is within 5 feet of you, you have Advantage on your next attack roll against that enemy before the end of your next turn."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.PURPLE_DRAGON_ROOK,
    label: "Purple Dragon Rook",
    category: FEAT_CATEGORY.ORIGIN,
    trackingState: TRACKER.TRACKED,
    page: 38,
    description: [
      "You gain the following benefits.",
      "<strong>Entreat.</strong> You gain proficiency in one of the following skills: Insight, Performance, or Persuasion.",
      "<strong>Rallying Cry.</strong> When you roll Initiative and don't have the Incapacitated condition, you can choose a number of creatures equal to your Proficiency Bonus that you can see within 30 feet of yourself. Those creatures gain Heroic Inspiration.",
      "Once you use this benefit, you can't do so again until you finish a Long Rest."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.SPELLFIRE_SPARK,
    label: "Spellfire Spark",
    category: FEAT_CATEGORY.ORIGIN,
    trackingState: TRACKER.TRACKED,
    page: 38,
    description: [
      "You gain the following benefits.",
      "<strong>Magic Absorption.</strong> Once per turn, when you take damage from a spell or magical effect, you reduce the total damage taken by 1d4. You can't use this benefit if you have the Incapacitated condition.",
      "<strong>Spellfire Flame.</strong> You learn the <spell:Sacred Flame>Sacred Flame</spell> cantrip. Intelligence, Wisdom, or Charisma is your spellcasting ability for this spell (choose when you select this feat). You can also cast this cantrip as a Bonus Action a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.TYRO_OF_THE_GAUNTLET,
    label: "Tyro of the Gauntlet",
    category: FEAT_CATEGORY.ORIGIN,
    trackingState: TRACKER.TRACKED,
    page: 38,
    description: [
      "You gain the following benefits.",
      "<strong>Stand as One.</strong> When an ally within 5 feet of you is subjected to an effect that would push or pull it, you can take a Reaction to prevent that ally from being pushed or pulled. To receive this benefit, the ally can't have the Incapacitated condition.",
      "<strong>Vigilant.</strong> When you take the Ready action, the next attack roll made against you has Disadvantage before the start of your next turn."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.ZHENTARIM_RUFFIAN,
    label: "Zhentarim Ruffian",
    category: FEAT_CATEGORY.ORIGIN,
    trackingState: TRACKER.TRACKED,
    page: 38,
    description: [
      "You gain the following benefits.",
      "<strong>Exploit Opening.</strong> When you roll damage for an Opportunity Attack, you can roll the damage dice twice and use either roll against the target.",
      "<strong>Family First.</strong> If you have Heroic Inspiration when you roll Initiative, you can expend it to give yourself and your allies Advantage on that Initiative roll."
    ]
  })
];

export const frhofGeneralFeatDefinitions: FeatDefinition[] = [
  createFrhofFeatDefinition({
    feat: FEATS.COLD_CASTER,
    label: "Cold Caster",
    category: FEAT_CATEGORY.GENERAL,
    page: 39,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Cantrip.</strong> You learn the <spell:Ray of Frost>Ray of Frost</spell> cantrip. If you already know it, you learn a different Wizard cantrip of your choice. The spell's spellcasting ability is the ability increased by this feat.",
      "<strong>Frostbite.</strong> Once per turn when you hit a creature with an attack roll and deal Cold damage, you can temporarily negate the creature's defenses. The creature subtracts 1d4 from the next saving throw it makes before the end of your next turn."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.DRAGONSCARRED,
    label: "Dragonscarred",
    category: FEAT_CATEGORY.GENERAL,
    page: 39,
    prerequisite: "Level 4+, Cult of the Dragon Initiate",
    requirements: [level4Requirement, featRequirement(FEATS.CULT_OF_THE_DRAGON_INITIATE)],
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Constitution or Charisma by 1, to a maximum of 20.",
      "<strong>Damage Resistance.</strong> When you gain this feat, choose Acid, Cold, Fire, Lightning, or Poison. You have Resistance to the chosen damage type.",
      "<strong>Fearsome Power.</strong> When you deal damage to a creature as part of the Attack or Magic action on your turn, you can use the Dragon's Terror benefit of the Cult of the Dragon Initiate feat as a Bonus Action this turn."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.ENCLAVE_MAGIC,
    label: "Enclave Magic",
    category: FEAT_CATEGORY.GENERAL,
    page: 39,
    prerequisite: "Level 4+, Emerald Enclave Fledgling",
    requirements: [level4Requirement, featRequirement(FEATS.EMERALD_ENCLAVE_FLEDGLING)],
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Friend to Animals.</strong> You have Advantage on ability checks when taking the Influence action with Beasts.",
      "<strong>Two Hearts, One Mind.</strong> You always have the <spell:Beast Sense>Beast Sense</spell> spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. When you cast it without a spell slot using this feature, it doesn't require Concentration. You can also cast the spell using any spell slots you have of the appropriate level. The spell's spellcasting ability is the ability increased by this feat."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.FAIRY_TRICKSTER,
    label: "Fairy Trickster",
    category: FEAT_CATEGORY.GENERAL,
    page: 39,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Dexterity or Charisma by 1, to a maximum of 20.",
      "<strong>Faerie Trod Trotter.</strong> When you take the Disengage action on your turn, Difficult Terrain doesn't cost you extra movement for the rest of that turn.",
      "<strong>Flustering Strike.</strong> When you hit a creature with an attack roll, you can attempt to fluster the target. The target must succeed on a Wisdom saving throw (DC 8 plus the ability modifier of the score increased by this feat and your Proficiency Bonus) or have Disadvantage on saving throws until the end of your next turn.",
      "You can use this benefit a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.GENIE_MAGIC,
    label: "Genie Magic",
    category: FEAT_CATEGORY.GENERAL,
    page: 39,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Wish Magic.</strong> As a Magic action, you can cast a level 1 spell of your choice from the Sorcerer spell list that has a casting time of an action. Once you use this benefit, you can't do so again until you finish a Long Rest. The spell's spellcasting ability is the ability increased by this feat.",
      "When you reach level 11, the spell you cast with this feat is cast as though using a level 2 spell slot.",
      "When you reach level 17, the spell is cast as though using a level 3 spell slot."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.HARPER_TEAMWORK,
    label: "Harper Teamwork",
    category: FEAT_CATEGORY.GENERAL,
    page: 39,
    prerequisite: "Level 4+, Harper Agent",
    requirements: [level4Requirement, featRequirement(FEATS.HARPER_AGENT)],
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Dexterity or Charisma by 1, to a maximum of 20.",
      "<strong>Withering Wordplay.</strong> When you take the Help action to assist an ally's attack roll against an enemy, that enemy also has Disadvantage on the first saving throw it makes before the start of your next turn.",
      "<strong>Inspiring Willpower.</strong> If you succeed on a saving throw to end the Frightened or Paralyzed condition on yourself, you can choose one ally you can see within 30 feet of yourself that has the same condition. That condition immediately ends for that ally."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.LORDLY_RESOLVE,
    label: "Lordly Resolve",
    category: FEAT_CATEGORY.GENERAL,
    page: 40,
    prerequisite: "Level 4+, Lords' Alliance Agent",
    requirements: [level4Requirement, featRequirement(FEATS.LORDS_ALLIANCE_AGENT)],
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Charisma by 1, to a maximum of 20.",
      "<strong>Standard Bearer.</strong> As a Bonus Action, choose up to three creatures within 60 feet of yourself that can see you. Each target can immediately take a Reaction to right itself and end the Prone condition, provided its Speed isn't 0. Additionally, you bolster the targets' resolve, which lasts for 1 minute or until you have the Incapacitated condition. While bolstered, a target can't be possessed or gain the Charmed or Frightened condition; if a target is already possessed, Charmed, or Frightened, the target has Advantage on any new saving throw against the relevant effect.",
      "Once you use this benefit, you can't do so again until you finish a Long Rest."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.MYTHAL_TOUCHED,
    label: "Mythal Touched",
    category: FEAT_CATEGORY.GENERAL,
    page: 40,
    prerequisite: "Level 4+",
    description: [
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Mythal Ward.</strong> If a spell attack hits you or you fail a saving throw against a spell, you can take a Reaction to roll on the Mythal-Touched Magic table to create a magical effect. If an effect requires a saving throw, the DC equals 8 plus the modifier of the ability increased by this feat and your Proficiency Bonus.",
      "You can use this benefit a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.",
      "<strong>Mythal-Touched Magic.</strong>",
      "<strong>1-2.</strong> You and each creature within 15 feet of you make a Dexterity saving throw, taking Force damage equal to 1d8 times the level of the triggering spell on a failed save or half as much damage on a successful one.",
      "<strong>3-7.</strong> You and the triggering spell's caster form a telepathic link for 1 hour.",
      "<strong>8-10.</strong> Gravity is reversed in a 15-foot-radius, 60-foot-tall Cylinder centered on you for 1 minute, per the <spell:Reverse Gravity>Reverse Gravity</spell> spell.",
      "<strong>11-13.</strong> You and the triggering spell's caster each make a Constitution saving throw. On a failed save, the creature has the Stunned condition until the end of its next turn.",
      "<strong>14-17.</strong> You gain a +2 bonus to AC for 1 minute, potentially turning the triggering spell into a miss if it was a spell attack.",
      "<strong>18-19.</strong> Any flammable, nonmagical object within 10 feet of the triggering spell's caster that isn't being worn or carried by another creature bursts into flame, takes 1d4 Fire damage, and is burning.",
      "<strong>20.</strong> The triggering spell dissipates with no effect, and the action, Bonus Action, or Reaction used to cast it is wasted. If that spell was cast with a spell slot, the slot isn't expended."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.ORDERS_RESILIENCE,
    label: "Order's Resilience",
    category: FEAT_CATEGORY.GENERAL,
    page: 40,
    prerequisite: "Level 4+, Tyro of the Gauntlet",
    requirements: [level4Requirement, featRequirement(FEATS.TYRO_OF_THE_GAUNTLET)],
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Resurge.</strong> When you have the Prone condition, you can right yourself with only 5 feet of movement.",
      "<strong>Stronger Together.</strong> If you are within 5 feet of an ally that doesn't have the Incapacitated condition, you and that ally have Advantage on Strength saving throws. You can't use this benefit while you have the Incapacitated condition."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.PURPLE_DRAGON_COMMANDANT,
    label: "Purple Dragon Commandant",
    category: FEAT_CATEGORY.GENERAL,
    page: 40,
    prerequisite: "Level 4+, Purple Dragon Rook or Martial Weapon Proficiency",
    requirements: [
      level4Requirement,
      anyRequirement([featRequirement(FEATS.PURPLE_DRAGON_ROOK), martialWeaponRequirement])
    ],
    description: [
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity by 1, to a maximum of 20.",
      "<strong>Encourage Ally.</strong> As a Bonus Action, you bolster one ally you can see within 30 feet. The ally gains Temporary Hit Points equal to 2d6 plus the modifier of the ability score increased by this feat. You can take this Bonus Action a number of times equal to your Proficiency Bonus, and you regain all uses when you finish a Long Rest.",
      "<strong>Last Stand.</strong> You have Advantage on attack rolls while Bloodied."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.SPELLFIRE_ADEPT,
    label: "Spellfire Adept",
    category: FEAT_CATEGORY.GENERAL,
    page: 41,
    prerequisite: "Level 4+, Spellfire Spark or Spellcasting or Pact Magic Features",
    requirements: [
      level4Requirement,
      anyRequirement([featRequirement(FEATS.SPELLFIRE_SPARK), spellcastingRequirement()])
    ],
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Fueled Spellfire.</strong> Once per turn, when a spell you cast deals Radiant damage, you can expend up to two Hit Point Dice, roll them, and add the total rolled to one damage roll of the spell.",
      "<strong>Searing Spellfire.</strong> When you make a damage roll that deals Radiant damage, it ignores Resistance to Radiant damage."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.STREET_JUSTICE,
    label: "Street Justice",
    category: FEAT_CATEGORY.GENERAL,
    page: 41,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity by 1, to a maximum of 20.",
      "<strong>Headlock.</strong> Your allies have Advantage on attack rolls against a creature Grappled by you.",
      "<strong>Sturdy Knot.</strong> When you use Chain, Manacles, or Rope to bind a creature, add your Proficiency Bonus to the DC to escape or burst the Chain, Manacles, or Rope.",
      "<strong>Tough Talk.</strong> A creature's Hostile attitude doesn't impose Disadvantage on your Charisma (Intimidation) checks to influence that creature."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.ZHENTARIM_TACTICS,
    label: "Zhentarim Tactics",
    category: FEAT_CATEGORY.GENERAL,
    page: 41,
    prerequisite: "Level 4+, Zhentarim Ruffian",
    requirements: [level4Requirement, featRequirement(FEATS.ZHENTARIM_RUFFIAN)],
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Dexterity or Charisma by 1, to a maximum of 20.",
      "<strong>Retaliate.</strong> Immediately after a creature within 5 feet of you hits you with a melee attack, you can make an Opportunity Attack against that creature.",
      "<strong>Versatile Merc.</strong> When you finish a Long Rest, choose a skill in which you have proficiency. You have Expertise in that skill until you finish your next Long Rest."
    ]
  })
];

export const frhofEpicBoonFeatDefinitions: FeatDefinition[] = [
  createFrhofFeatDefinition({
    feat: FEATS.BOON_OF_BLOODSHED,
    label: "Boon of Bloodshed",
    category: FEAT_CATEGORY.EPIC_BOON,
    page: 42,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30.",
      "<strong>Killer's Fortune.</strong> When an enemy you can see is reduced to 0 Hit Points, you gain Advantage on the next attack roll you make before the end of your next turn.",
      "<strong>Power from Pain.</strong> Once per turn, when you make an attack roll while Bloodied, you can deal extra damage to the target equal to your Proficiency Bonus. The extra damage's type is the same as the attack's type."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.BOON_OF_BOUNTIFUL_HEALTH,
    label: "Boon of Bountiful Health",
    category: FEAT_CATEGORY.EPIC_BOON,
    page: 42,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30.",
      "<strong>Augmented Health.</strong> When you gain Temporary Hit Points, increase the number of Temporary Hit Points you gain by 5.",
      "<strong>Superior Recuperation.</strong> When you spend one or more Hit Point Dice to regain Hit Points, you can instead use the highest number possible for each die."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.BOON_OF_COMMUNICATION,
    label: "Boon of Communication",
    category: FEAT_CATEGORY.EPIC_BOON,
    page: 42,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 30.",
      "<strong>Cunning Speaker.</strong> You don't have Disadvantage on ability checks to influence Hostile creatures.",
      "<strong>Gifted Interpreter.</strong> You understand the literal meaning of any language you hear or see signed, and you can understand the literal meaning of any written language you see.",
      "<strong>Mental Communication.</strong> You gain telepathy with a range of 120 feet."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.BOON_OF_DESPERATE_RESILIENCE,
    label: "Boon of Desperate Resilience",
    category: FEAT_CATEGORY.EPIC_BOON,
    page: 42,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Constitution by 1, to a maximum of 30.",
      "<strong>Defense of Body and Mind.</strong> While you are Bloodied, you have Resistance to every damage type except Force."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.BOON_OF_EXQUISITE_RADIANCE,
    label: "Boon of Exquisite Radiance",
    category: FEAT_CATEGORY.EPIC_BOON,
    page: 42,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30.",
      "<strong>Eternal Rest.</strong> Creatures you reduce to 0 Hit Points can't become Undead.",
      "<strong>Powerful Radiance.</strong> When you make a damage roll that deals Radiant damage, you can instead use the highest number possible for each damage die. Once you use this benefit, you can't do so again until you finish a Long Rest."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.BOON_OF_FLUID_FORMS,
    label: "Boon of Fluid Forms",
    category: FEAT_CATEGORY.EPIC_BOON,
    page: 42,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 30.",
      "<strong>Shapechanger.</strong> You can take a Magic action to shape-shift into a Beast, Humanoid, or Monstrosity with a Challenge Rating no higher than 10. When you shape-shift, you gain a number of Temporary Hit Points equal to the Hit Points of the form. The shape-shifting effect lasts for 1 hour, and it ends early if you have no Temporary Hit Points left or if you take a Magic action to return to your true form.",
      "Your game statistics are replaced by the stat block of the chosen form, but you retain your creature type; alignment; personality; Intelligence, Wisdom, and Charisma scores; Hit Points; Hit Point Dice; proficiencies; and ability to communicate. If you have the Spellcasting or Pact Magic feature, you retain it too. Upon shape-shifting, you determine whether your equipment drops to the ground or changes in size and shape to fit the new form while you're in it.",
      "Once you use this benefit, you can't do so again until you finish a Long Rest.",
      "<strong>Hardy Transformation.</strong> When you gain Temporary Hit Points when you shape-shift, increase that number of Temporary Hit Points by 20."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.BOON_OF_BRIGHT_SUN,
    label: "Boon of the Bright Sun",
    category: FEAT_CATEGORY.EPIC_BOON,
    page: 43,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Constitution, Wisdom, or Charisma by 1, to a maximum of 30.",
      "<strong>Daylight Presence.</strong> As a Bonus Action, you radiate a 30-foot Emanation of Bright Light that is sunlight. If any of the Emanation's area overlaps with an area of Darkness created by a spell, that spell is dispelled. The Emanation lasts until you dismiss it (no action required), die, or have the Incapacitated condition.",
      "<strong>Fortifying Light.</strong> When your Daylight Presence is active, at the start of each of your turns, you and allies you can see in your Daylight Presence gain 10 Temporary Hit Points."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.BOON_OF_FORTUNES_FAVOR,
    label: "Boon of Fortune's Favor",
    category: FEAT_CATEGORY.EPIC_BOON,
    page: 43,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30.",
      "<strong>Saving Throw Reroll.</strong> When you fail a saving throw, you can reroll it and must use the new roll. Once you use this benefit, you can't do so again until the start of your next turn."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.BOON_OF_FURIOUS_STORM,
    label: "Boon of the Furious Storm",
    category: FEAT_CATEGORY.EPIC_BOON,
    page: 43,
    prerequisite: "Level 19+, Spellcasting or Pact Magic Feature",
    requirements: [level19Requirement, spellcastingRequirement()],
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 30.",
      "<strong>Eye of the Storm.</strong> You have Resistance to Lightning and Thunder damage. While you are Bloodied, you have Immunity to Lightning and Thunder damage.",
      "<strong>Storm's Strength.</strong> Creatures have Disadvantage on saving throws against your spells that deal Lightning or Thunder damage."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.BOON_OF_POISON_MASTERY,
    label: "Boon of Poison Mastery",
    category: FEAT_CATEGORY.EPIC_BOON,
    page: 43,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30.",
      "<strong>Antitoxic.</strong> You have Immunity to Poison damage and the Poisoned condition.",
      "<strong>Perfect Poisoner.</strong> Once per turn, when you roll dice to determine Poison damage a creature takes from your attack, spell, or feature, you can instead use the highest number possible for each die."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.BOON_OF_REVELRY,
    label: "Boon of Revelry",
    category: FEAT_CATEGORY.EPIC_BOON,
    page: 43,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 30.",
      "<strong>Inspire Dance.</strong> You always have the <spell:Irresistible Dance>Otto's Irresistible Dance</spell> spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it that way when you finish a Long Rest. You can also cast the spell using any spell slots you have of the appropriate level.",
      "When you cast the spell, it requires no spell components, and taking damage doesn't break your Concentration on it.",
      "<strong>Sing Out.</strong> While a creature that failed its saving throw against your Otto's Irresistible Dance has the Charmed condition from that spell, it can't cast spells with Verbal components, and it sings delightful nonsense if it can sing."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.BOON_OF_SOUL_DRINKER,
    label: "Boon of the Soul Drinker",
    category: FEAT_CATEGORY.EPIC_BOON,
    page: 43,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30.",
      "<strong>Grave Resistance.</strong> You have Resistance to Cold damage and Necrotic damage.",
      "<strong>Siphon Life.</strong> When an enemy within 120 feet of you is reduced to 0 Hit Points, you can take a Reaction to regain 50 Hit Points. Once you use this benefit, you can't use it again until you finish a Short or Long Rest."
    ]
  }),
  createFrhofFeatDefinition({
    feat: FEATS.BOON_OF_TERROR,
    label: "Boon of Terror",
    category: FEAT_CATEGORY.EPIC_BOON,
    page: 43,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Charisma score by 1, to a maximum of 30.",
      "<strong>Fearless.</strong> You have Immunity to the Frightened condition.",
      "<strong>Flee, Fools!</strong> When a creature with the Frightened condition starts its turn within 60 feet of you, you can take a Reaction to stoke its terror, provided you can see the creature and it isn't behind Total Cover. If you do so, the creature must succeed on a Wisdom saving throw (DC 8 plus your Charisma modifier and your Proficiency Bonus) or spend its turn moving away from you by the fastest available means. Once you use this benefit, you can't use it again until you finish a Short or Long Rest.",
      "<strong>Intimidating.</strong> You gain Proficiency in the Intimidation skill if you don't already have it. You also gain Expertise in Intimidation."
    ]
  })
];
