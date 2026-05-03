import { FEAT_CATEGORY, FEATS, TRACKER } from "../../../../codex/entries";
import type { FeatDefinition } from "../types";

export const generalFeatDefinitions: FeatDefinition[] = [
  {
    feat: FEATS.ABILITY_SCORE_IMPROVEMENT,
    label: "Ability Score Improvement",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    repeatable: true,
    description: [
      "Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1.",
      "This feat can't increase an ability score above 20.",
      "<strong>Repeatable.</strong> You can take this feat more than once."
    ],
    trackingState: TRACKER.TRACKED
  },
  {
    feat: FEATS.GRAPPLER,
    label: "Grappler",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Strength or Dexterity 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity score by 1, to a maximum of 20.",
      "<strong>Punch and Grab.</strong> When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can use both the Damage and the Grapple option. You can use this benefit only once per turn.",
      "<strong>Attack Advantage.</strong> You have Advantage on attack rolls against a creature Grappled by you.",
      "<strong>Fast Wrestler.</strong> You don't have to spend extra movement to move a creature Grappled by you if the creature is your size or smaller."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.BLESSED_WARRIOR,
    label: "Blessed Warrior",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Paladin Fighting Style Feature",
    description: [
      "You learn two Cleric cantrips of your choice. <spell:Guidance>Guidance</spell> and <spell:Sacred Flame>Sacred Flame</spell> are recommended.",
      "The chosen cantrips count as Paladin spells for you, and <link:CHA>Charisma</link> is your spellcasting ability for them.",
      "Whenever you gain a Paladin level, you can replace one of these cantrips with another Cleric cantrip."
    ],
    trackingState: TRACKER.TRACKED
  },
  {
    feat: FEATS.DRUIDIC_WARRIOR,
    label: "Druidic Warrior",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Ranger Fighting Style Feature",
    description: [
      "You learn two Druid cantrips of your choice. <spell:Guidance>Guidance</spell> and <spell:Starry Wisp>Starry Wisp</spell> are recommended.",
      "The chosen cantrips count as Ranger spells for you, and <link:WIS>Wisdom</link> is your spellcasting ability for them.",
      "Whenever you gain a Ranger level, you can replace one of these cantrips with another Druid cantrip."
    ],
    trackingState: TRACKER.TRACKED
  },
  {
    feat: FEATS.ACTOR,
    label: "Actor",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Charisma 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Charisma score by 1, to a maximum of 20.",
      "<strong>Impersonation.</strong> While you're disguised as a real or fictional person, you have Advantage on Charisma (Deception or Performance) checks to convince others that you are that person.",
      "<strong>Mimicry.</strong> You can mimic the sounds of other creatures, including speech. A creature that hears the mimicry must succeed on a Wisdom (Insight) check to determine the effect is faked (DC 8 plus your Charisma modifier and Proficiency Bonus)."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.ATHLETE,
    label: "Athlete",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Strength or Dexterity 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity by 1, to a maximum of 20.",
      "<strong>Climb Speed.</strong> You gain a Climb Speed equal to your Speed.",
      "<strong>Hop Up.</strong> When you have the Prone condition, you can right yourself with only 5 feet of movement.",
      "<strong>Jumping.</strong> You can make a running Long or High Jump after moving only 5 feet."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.CHARGER,
    label: "Charger",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Strength or Dexterity 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity by 1, to a maximum of 20.",
      "<strong>Improved Dash.</strong> When you take the Dash action, your Speed increases by 10 feet for that action.",
      "<strong>Charge Attack.</strong> If you move at least 10 feet in a straight line toward a target immediately before hitting it with a melee attack roll as part of the Attack action, choose one of the following effects: gain a 1d8 bonus to the attack's damage roll, or push the target up to 10 feet away if it is no more than one size larger than you. You can use this benefit only once on each of your turns."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.CHEF,
    label: "Chef",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Constitution or Wisdom by 1, to a maximum of 20.",
      "<strong>Cook's Utensils.</strong> You gain proficiency with Cook's Utensils if you don't already have it.",
      "<strong>Replenishing Meal.</strong> As part of a Short Rest, you can cook special food if you have ingredients and Cook's Utensils on hand. You can prepare enough of this food for a number of creatures equal to 4 plus your Proficiency Bonus. At the end of the Short Rest, any creature who eats the food and spends one or more Hit Dice to regain Hit Points regains an extra 1d8 Hit Points.",
      "<strong>Bolstering Treats.</strong> With 1 hour of work or when you finish a Long Rest, you can cook a number of treats equal to your Proficiency Bonus if you have ingredients and Cook's Utensils on hand. These special treats last 8 hours after being made. A creature can use a Bonus Action to eat one of those treats to gain a number of Temporary Hit Points equal to your Proficiency Bonus."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.CROSSBOW_EXPERT,
    label: "Crossbow Expert",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Dexterity 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Dexterity score by 1, to a maximum of 20.",
      "<strong>Ignore Loading.</strong> You ignore the Loading property of the Hand Crossbow, Heavy Crossbow, and Light Crossbow. If you're holding one of them, you can load a piece of ammunition into it even if you lack a free hand.",
      "<strong>Firing in Melee.</strong> Being within 5 feet of an enemy doesn't impose Disadvantage on your attack rolls with crossbows.",
      "<strong>Dual Wielding.</strong> When you make the extra attack of the Light property, you can add your ability modifier to the damage of the extra attack if that attack is with a crossbow that has the Light property and you aren't already adding that modifier to the damage."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.CRUSHER,
    label: "Crusher",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Constitution by 1, to a maximum of 20.",
      "<strong>Push.</strong> Once per turn, when you hit a creature with an attack that deals Bludgeoning damage, you can move it 5 feet to an unoccupied space if the target is no more than one size larger than you.",
      "<strong>Enhanced Critical.</strong> When you score a Critical Hit that deals Bludgeoning damage to a creature, attack rolls against that creature have Advantage until the start of your next turn."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.DEFENSIVE_DUELIST,
    label: "Defensive Duelist",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Dexterity 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Dexterity score by 1, to a maximum of 20.",
      "<strong>Parry.</strong> If you're holding a Finesse weapon and another creature hits you with a melee attack, you can take a Reaction to add your Proficiency Bonus to your Armor Class, potentially causing the attack to miss you. You gain this bonus to your AC against melee attacks until the start of your next turn."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.DUAL_WIELDER,
    label: "Dual Wielder",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Strength or Dexterity 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity by 1, to a maximum of 20.",
      "<strong>Enhanced Dual Wielding.</strong> When you take the Attack action on your turn and attack with a weapon that has the Light property, you can make one extra attack as a Bonus Action later on the same turn with a different weapon, which must be a Melee weapon that lacks the Two-Handed property. You don't add your ability modifier to the extra attack's damage unless that modifier is negative.",
      "<strong>Quick Draw.</strong> You can draw or stow two weapons that lack the Two-Handed property when you would normally be able to draw or stow only one."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.DURABLE,
    label: "Durable",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Constitution score by 1, to a maximum of 20.",
      "<strong>Defy Death.</strong> You have Advantage on Death Saving Throws.",
      "<strong>Speedy Recovery.</strong> As a Bonus Action, you can expend one of your Hit Point Dice, roll the die, and regain a number of Hit Points equal to the roll."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.ELEMENTAL_ADEPT,
    label: "Elemental Adept",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
    repeatable: true,
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Energy Mastery.</strong> Choose one of the following damage types: Acid, Cold, Fire, Lightning, or Thunder. Spells you cast ignore Resistance to damage of the chosen type. In addition, when you roll damage for a spell you cast that deals damage of that type, you can treat any 1 on a damage die as a 2.",
      "<strong>Repeatable.</strong> You can take this feat more than once, but you must choose a different damage type each time for Energy Mastery."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.FEY_TOUCHED,
    label: "Fey-Touched",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "Your exposure to the Feywild's magic grants you the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Fey Magic.</strong> Choose one level 1 spell from the Divination or Enchantment school of magic. You always have that spell and the Misty Step spell prepared. You can cast each of these spells without expending a spell slot. Once you cast either spell in this way, you can't cast that spell in this way again until you finish a Long Rest. You can also cast these spells using spell slots you have of the appropriate level. The spells' spellcasting ability is the ability increased by this feat."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.GREAT_WEAPON_MASTER,
    label: "Great Weapon Master",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Strength 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength score by 1, to a maximum of 20.",
      "<strong>Heavy Weapon Mastery.</strong> When you hit a creature with a weapon that has the Heavy property as part of the Attack action on your turn, you can cause the weapon to deal extra damage to the target. The extra damage equals your Proficiency Bonus.",
      "<strong>Hew.</strong> Immediately after you score a Critical Hit with a Melee weapon or reduce a creature to 0 Hit Points with one, you can make one attack with the same weapon as a Bonus Action."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.HEAVILY_ARMORED,
    label: "Heavily Armored",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Medium Armor Training",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Constitution or Strength by 1, to a maximum of 20.",
      "<strong>Armor Training.</strong> You gain training with Heavy armor."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.HEAVY_ARMOR_MASTER,
    label: "Heavy Armor Master",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Heavy Armor Training",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Constitution or Strength by 1, to a maximum of 20.",
      "<strong>Damage Reduction.</strong> When you're hit by an attack while you're wearing Heavy armor, any Bludgeoning, Piercing, and Slashing damage dealt to you by that attack is reduced by an amount equal to your Proficiency Bonus."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.INSPIRING_LEADER,
    label: "Inspiring Leader",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Wisdom or Charisma 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Wisdom or Charisma by 1, to a maximum of 20.",
      "<strong>Bolstering Performance.</strong> When you finish a Short or Long Rest, you can give an inspiring performance: a speech, song, or dance. When you do so, choose up to six allies (which can include yourself) within 30 feet of yourself who witness the performance. The chosen creatures each gain Temporary Hit Points equal to your character level plus the modifier of the ability you increased with this feat."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.KEEN_MIND,
    label: "Keen Mind",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Intelligence 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence score by 1, to a maximum of 20.",
      "<strong>Lore Knowledge.</strong> Choose one of the following skills: Arcana, History, Investigation, Nature, or Religion. If you lack proficiency in the chosen skill, you gain proficiency in it, and if you already have proficiency in it, you gain Expertise in it.",
      "<strong>Quick Study.</strong> You can take the Study action as a Bonus Action."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.LIGHTLY_ARMORED,
    label: "Lightly Armored",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity by 1, to a maximum of 20.",
      "<strong>Armor Training.</strong> You gain training with Light armor and Shields."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.MAGE_SLAYER,
    label: "Mage Slayer",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity by 1, to a maximum of 20.",
      "<strong>Concentration Breaker.</strong> When you damage a creature that is Concentrating, it has Disadvantage on the saving throw it makes to maintain Concentration.",
      "<strong>Guarded Mind.</strong> If you fail an Intelligence, a Wisdom, or a Charisma saving throw, you can cause yourself to succeed instead. Once you use this benefit, you can't use it again until you finish a Short or Long Rest."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.MARTIAL_WEAPON_TRAINING,
    label: "Martial Weapon Training",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity by 1, to a maximum of 20.",
      "<strong>Weapon Proficiency.</strong> You gain proficiency with Martial weapons."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.MEDIUM_ARMOR_MASTER,
    label: "Medium Armor Master",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Medium Armor Training",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity by 1, to a maximum of 20.",
      "<strong>Dexterous Wearer.</strong> While you're wearing Medium armor, you can add 3, rather than 2 to your AC if you have a Dexterity score of 16 or higher."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.MODERATELY_ARMORED,
    label: "Moderately Armored",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Light Armor Training",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity by 1, to a maximum of 20.",
      "<strong>Armor Training.</strong> You gain training with Medium armor."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.MOUNTED_COMBATANT,
    label: "Mounted Combatant",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength, Dexterity, or Wisdom by 1, to a maximum of 20.",
      "<strong>Mounted Strike.</strong> While mounted, you have Advantage on attack rolls against any unmounted creature within 5 feet of your mount that is at least one size smaller than the mount.",
      "<strong>Leap Aside.</strong> If your mount is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it instead takes no damage if it succeeds on the saving throw and only half damage if it fails. For your mount to gain this benefit, you must be riding it, and neither of you can have the Incapacitated condition.",
      "<strong>Veer.</strong> While mounted, you can force an attack that hits your mount to hit you instead if you don't have the Incapacitated condition."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.OBSERVANT,
    label: "Observant",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Intelligence or Wisdom 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence or Wisdom by 1, to a maximum of 20.",
      "<strong>Keen Observer.</strong> Choose one of the following skills: Insight, Investigation, or Perception. If you lack proficiency with the chosen skill, you gain proficiency in it, and if you already have proficiency in it, you gain Expertise in it.",
      "<strong>Quick Search.</strong> You can take the Search action as a Bonus Action."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.PIERCER,
    label: "Piercer",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity by 1, to a maximum of 20.",
      "<strong>Puncture.</strong> Once per turn, when you hit a creature with an attack that deals Piercing damage, you can reroll one of the attack's damage dice, and you must use the new roll.",
      "<strong>Enhanced Critical.</strong> When you score a Critical Hit that deals Piercing damage to a creature, you can roll one additional damage die when determining the extra Piercing damage the target takes."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.POISONER,
    label: "Poisoner",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Dexterity or Intelligence by 1, to a maximum of 20.",
      "<strong>Potent Poison.</strong> When you make a damage roll that deals Poison damage, it ignores Resistance to Poison damage.",
      "<strong>Brew Poison.</strong> You gain proficiency with the Poisoner's Kit. With 1 hour of work using such a kit and expending 50 GP worth of materials, you can create a number of poison doses equal to your Proficiency Bonus. As a Bonus Action, you can apply a poison dose to a weapon or piece of ammunition. Once applied, the poison retains its potency for 1 minute or until you deal damage with the poisoned item, whichever is shorter. When a creature takes damage from the poisoned item, that creature must succeed on a Constitution saving throw (DC 8 plus the modifier of the ability increased by this feat and your Proficiency Bonus) or take 2d8 Poison damage and have the Poisoned condition until the end of your next turn."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.POLEARM_MASTER,
    label: "Polearm Master",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Strength or Dexterity 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Dexterity or Strength by 1, to a maximum of 20.",
      "<strong>Pole Strike.</strong> Immediately after you take the Attack action and attack with a Quarterstaff, a Spear, or a weapon that has the Heavy and Reach properties, you can use a Bonus Action to make a melee attack with the opposite end of the weapon. The weapon deals Bludgeoning damage, and the weapon's damage die for this attack is a d4.",
      "<strong>Reactive Strike.</strong> While you're holding a Quarterstaff, a Spear, or a weapon that has the Heavy and Reach properties, you can take a Reaction to make one melee attack against a creature that enters the reach you have with that weapon."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.RESILIENT,
    label: "Resilient",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Choose one ability in which you lack saving throw proficiency. Increase the chosen ability score by 1, to a maximum of 20.",
      "<strong>Saving Throw Proficiency.</strong> You gain saving throw proficiency with the chosen ability."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.RITUAL_CASTER,
    label: "Ritual Caster",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Intelligence, Wisdom, or Charisma 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Ritual Spells.</strong> Choose a number of level 1 spells equal to your Proficiency Bonus that have the Ritual tag. You always have those spells prepared, and you can cast them with any spell slots you have. The spells' spellcasting ability is the ability increased by this feat. Whenever your Proficiency Bonus increases thereafter, you can add an additional level 1 spell with the Ritual tag to the spells always prepared with this feature.",
      "<strong>Quick Ritual.</strong> With this benefit, you can cast a Ritual spell that you have prepared using its regular casting time rather than the extended time for a Ritual. Doing so doesn't require a spell slot. Once you cast the spell in this way, you can't use this benefit again until you finish a Long Rest."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.SENTINEL,
    label: "Sentinel",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Strength or Dexterity 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity by 1, to a maximum of 20.",
      "<strong>Guardian.</strong> Immediately after a creature within 5 feet of you takes the Disengage action or hits a target other than you with an attack, you can make an Opportunity Attack against that creature.",
      "<strong>Halt.</strong> When you hit a creature with an Opportunity Attack, the creature's Speed becomes 0 for the rest of the current turn."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.SHADOW_TOUCHED,
    label: "Shadow-Touched",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "Your exposure to the Shadowfell's magic grants you the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Shadow Magic.</strong> Choose one level 1 spell from the Illusion or Necromancy school of magic. You always have that spell and the Invisibility spell prepared. You can cast each of these spells without expending a spell slot. Once you cast either spell in this way, you can't cast that spell in this way again until you finish a Long Rest. You can also cast these spells using spell slots you have of the appropriate level. The spells' spellcasting ability is the ability increased by this feat."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.SHARPSHOOTER,
    label: "Sharpshooter",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Dexterity 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Dexterity score by 1, to a maximum of 20.",
      "<strong>Bypass Cover.</strong> Your ranged attacks with weapons ignore Half Cover and Three-Quarters Cover.",
      "<strong>Firing in Melee.</strong> Being within 5 feet of an enemy doesn't impose Disadvantage on your attack rolls with Ranged weapons.",
      "<strong>Long Shots.</strong> Attacking at long range doesn't impose Disadvantage on your attack rolls with Ranged weapons."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.SHIELD_MASTER,
    label: "Shield Master",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Shield Training",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength score by 1, to a maximum of 20.",
      "<strong>Shield Bash.</strong> If you attack a creature within 5 feet of you as part of the Attack action and hit with a Melee weapon, you can immediately bash the target with your Shield if it's equipped, forcing the target to make a Strength saving throw (DC 8 plus your Strength modifier and Proficiency Bonus). On a failed save, you either push the target 5 feet from you or cause it to have the Prone condition (your choice). You can use this benefit only once on each of your turns.",
      "<strong>Interpose Shield.</strong> If you're subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you can take a Reaction to take no damage if you succeed on the saving throw and are holding a Shield."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.SKILL_EXPERT,
    label: "Skill Expert",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 20.",
      "<strong>Skill Proficiency.</strong> You gain proficiency in one skill of your choice.",
      "<strong>Expertise.</strong> Choose one skill in which you have proficiency but lack Expertise. You gain Expertise with that skill."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.SKULKER,
    label: "Skulker",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Dexterity 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Dexterity score by 1, to a maximum of 20.",
      "<strong>Blindsight.</strong> You have Blindsight with a range of 10 feet.",
      "<strong>Fog of War.</strong> You exploit the distractions of battle, gaining Advantage on any Dexterity (Stealth) check you make as part of the Hide action during combat.",
      "<strong>Sniper.</strong> If you make an attack roll while hidden and the roll misses, making the attack roll doesn't reveal your location."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.SLASHER,
    label: "Slasher",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity by 1, to a maximum of 20.",
      "<strong>Hamstring.</strong> Once per turn when you hit a creature with an attack that deals Slashing damage, you can reduce the Speed of that creature by 10 feet until the start of your next turn.",
      "<strong>Enhanced Critical.</strong> When you score a Critical Hit that deals Slashing damage to a creature, it has Disadvantage on attack rolls until the start of your next turn."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.SPEEDY,
    label: "Speedy",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Dexterity or Constitution 13+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Dexterity or Constitution by 1, to a maximum of 20.",
      "<strong>Speed Increase.</strong> Your Speed increases by 10 feet.",
      "<strong>Dash over Difficult Terrain.</strong> When you take the Dash action on your turn, Difficult Terrain doesn't cost you extra movement for the rest of that turn.",
      "<strong>Agile Movement.</strong> Opportunity Attacks have Disadvantage against you."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.SPELL_SNIPER,
    label: "Spell Sniper",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Bypass Cover.</strong> Your attack rolls for spells ignore Half Cover and Three-Quarters Cover.",
      "<strong>Casting in Melee.</strong> Being within 5 feet of an enemy doesn't impose Disadvantage on your attack rolls with spells.",
      "<strong>Increased Range.</strong> When you cast a spell that has a range of at least 10 feet and requires you to make an attack roll, you can increase the spell's range by 60 feet."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.TELEKINETIC,
    label: "Telekinetic",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Minor Telekinesis.</strong> You learn the Mage Hand spell. You can cast it without Verbal or Somatic components, you can make the spectral hand Invisible, and its range and the distance it can be away from you both increase by 30 feet when you cast it. The spell's spellcasting ability is the ability increased by this feat.",
      "<strong>Telekinetic Shove.</strong> As a Bonus Action, you can telekinetically shove one creature you can see within 30 feet of yourself. When you do so, the target must succeed on a Strength saving throw (DC 8 plus the ability modifier of the score increased by this feat and your Proficiency Bonus) or be moved 5 feet toward or away from you."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.TELEPATHIC,
    label: "Telepathic",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Telepathic Utterance.</strong> You can speak telepathically to any creature you can see within 60 feet of yourself. Your telepathic utterances are in a language you know, and the creature understands you only if it knows that language. Your communication doesn't give the creature the ability to respond to you telepathically.",
      "<strong>Detect Thoughts.</strong> You always have the Detect Thoughts spell prepared. You can cast it without a spell slot or spell components, and you must finish a Long Rest before you can cast it in this way again. You can also cast it using spell slots you have of the appropriate level. Your spellcasting ability for the spell is the ability increased by this feat."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.WAR_CASTER,
    label: "War Caster",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.",
      "<strong>Concentration.</strong> You have Advantage on Constitution saving throws that you make to maintain Concentration.",
      "<strong>Reactive Spell.</strong> When a creature provokes an Opportunity Attack from you by leaving your reach, you can take a Reaction to cast a spell at the creature rather than making an Opportunity Attack. The spell must have a casting time of one action and must target only that creature.",
      "<strong>Somatic Components.</strong> You can perform the Somatic components of spells even when you have weapons or a Shield in one or both hands."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.WEAPON_MASTER,
    label: "Weapon Master",
    category: FEAT_CATEGORY.GENERAL,
    prerequisite: "Level 4+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity by 1, to a maximum of 20.",
      "<strong>Mastery Property.</strong> Your training with weapons allows you to use the mastery property of one kind of Simple or Martial weapon of your choice, provided you have proficiency with it. Whenever you finish a Long Rest, you can change the kind of weapon to another eligible kind."
    ],
    trackingState: TRACKER.NOT_TRACKED
  }
];
