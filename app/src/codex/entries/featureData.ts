import { ClassFeature } from "./enums";
import type { FeatureMapEntry, KeywordTooltipEntry } from "./types";

export const KeywordTooltip: Record<string, KeywordTooltipEntry> = {
  "short-rest": {
    title: "Short Rest",
    description: [
      "A <strong>Short Rest</strong> is a period of downtime, usually about 1 hour long.",
      "Some class resources recharge when you finish one."
    ]
  },
  "long-rest": {
    title: "Long Rest",
    description: [
      "A <strong>Long Rest</strong> is an extended period of downtime, usually around 8 hours.",
      "It commonly restores expended features, Hit Points, and other daily resources."
    ]
  },
  resistance: {
    title: "Resistance",
    description: [
      "<strong>Resistance</strong> halves damage of the listed type after all other modifiers are applied.",
      "If a rule says otherwise, follow that more specific rule."
    ]
  },
  tracked: {
    title: "Tracked",
    description: [
      "<strong>Tracked</strong> means the app is keeping track of this feature or rule interaction for you."
    ]
  },
  "not-tracked": {
    title: "Not Tracked",
    description: [
      "<strong>Not Tracked</strong> means the app is not currently tracking this feature for you, so you need to remember it during play."
    ]
  }
};

export const FeatureMap: Record<ClassFeature, FeatureMapEntry> = {
  [ClassFeature.RAGE]: {
    description: [
      "You can imbue yourself with a primal power called <strong>Rage</strong>, a force that grants you extraordinary might and resilience. You can enter it as a Bonus Action if you aren't wearing Heavy armor.",
      "You can enter your Rage the number of times shown for your Barbarian level in the Rages column of the Barbarian Features table. You regain one expended use when you finish a <link:short-rest>Short Rest</link>, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
      "While active, your Rage follows the rules below.",
      "<strong>Damage Resistance.</strong> You have <link:resistance>Resistance</link> to Bludgeoning, Piercing, and Slashing damage.",
      "<strong>Rage Damage.</strong> When you make an attack using Strength, with either a weapon or an Unarmed Strike, and deal damage to the target, you gain a bonus to the damage that increases as you gain levels as a Barbarian, as shown in the Rage Damage column of the Barbarian Features table.",
      "<strong>Strength Advantage.</strong> You have Advantage on Strength checks and Strength saving throws.",
      "<strong>No Concentration or Spells.</strong> You can't maintain Concentration, and you can't cast spells.",
      "<strong>Duration.</strong> The Rage lasts until the end of your next turn, and it ends early if you don Heavy armor or have the Incapacitated condition.",
      "If your Rage is still active on your next turn, you can extend the Rage for another round by doing one of the following:",
      "Make an attack roll against an enemy.",
      "Force an enemy to make a saving throw.",
      "Take a Bonus Action to extend your Rage.",
      "Each time the Rage is extended, it lasts until the end of your next turn. You can maintain a Rage for up to 10 minutes."
    ],
    isTracked: false
  },
  [ClassFeature.UNARMORED_DEFENSE]: {
    description: [
      "While you aren't wearing any armor, your base Armor Class equals 10 plus your Dexterity and Constitution modifiers. You can use a Shield and still gain this benefit."
    ],
    isTracked: true
  },
  [ClassFeature.WEAPON_MASTERY]: {
    description: [
      "Your training with weapons allows you to use the mastery properties of two kinds of Simple or Martial Melee weapons of your choice, such as Greataxes and Handaxes. Whenever you finish a <link:long-rest>Long Rest</link>, you can practice weapon drills and change one of those weapon choices.",
      "When you reach certain Barbarian levels, you gain the ability to use the mastery properties of more kinds of weapons, as shown in the Weapon Mastery column of the Barbarian Features table."
    ],
    isTracked: false
  },
  [ClassFeature.BARDIC_INSPIRATION]: {
    description: [
      "You can supernaturally inspire others through words, music, or dance. This inspiration is represented by your Bardic Inspiration die, which is a d6.",
      "<strong>Using Bardic Inspiration.</strong> As a Bonus Action, you can inspire another creature within 60 feet of yourself who can see or hear you. That creature gains one of your Bardic Inspiration dice. A creature can have only one Bardic Inspiration die at a time.",
      "Once within the next hour when the creature fails a D20 Test, the creature can roll the Bardic Inspiration die and add the number rolled to the d20, potentially turning the failure into a success. A Bardic Inspiration die is expended when it is rolled.",
      "<strong>Number of Uses.</strong> You can confer a Bardic Inspiration die a number of times equal to your Charisma modifier, minimum of once, and you regain all expended uses when you finish a <link:long-rest>Long Rest</link>.",
      "<strong>At Higher Levels.</strong> Your Bardic Inspiration die changes when you reach certain Bard levels, as shown in the Bardic Die column of the Bard Features table. The die becomes a d8 at level 5, a d10 at level 10, and a d12 at level 15."
    ],
    isTracked: false
  },
  [ClassFeature.SPELLCASTING]: {
    description: [
      "You have learned to cast spells through your bardic arts. See 'Spells' for the rules on spellcasting. The information below details how you use those rules with Bard spells, which appear in the Bard spell list later in the class's description.",
      "<strong>Cantrips.</strong> You know two cantrips of your choice from the Bard spell list. Dancing Lights and Vicious Mockery are recommended.",
      "Whenever you gain a Bard level, you can replace one of your cantrips with another cantrip of your choice from the Bard spell list.",
      "When you reach Bard levels 4 and 10, you learn another cantrip of your choice from the Bard spell list, as shown in the Cantrips column of the Bard Features table.",
      "<strong>Spell Slots.</strong> The Bard Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a <link:long-rest>Long Rest</link>.",
      "<strong>Prepared Spells of Level 1+.</strong> You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose four level 1 spells from the Bard spell list. Charm Person, Color Spray, Dissonant Whispers, and Healing Word are recommended.",
      "The number of spells on your list increases as you gain Bard levels, as shown in the Prepared Spells column of the Bard Features table. Whenever that number increases, choose additional spells from the Bard spell list until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots.",
      "If another Bard feature gives you spells that you always have prepared, those spells do not count against the number of spells you can prepare with this feature, but those spells otherwise count as Bard spells for you.",
      "<strong>Changing Your Prepared Spells.</strong> Whenever you gain a Bard level, you can replace one spell on your list with another Bard spell for which you have spell slots.",
      "<strong>Spellcasting Ability.</strong> Charisma is your spellcasting ability for your Bard spells.",
      "<strong>Spellcasting Focus.</strong> You can use a Musical Instrument as a Spellcasting Focus for your Bard spells."
    ],
    isTracked: false
  },
  [ClassFeature.EXPERTISE]: {
    description: [
      "You gain Expertise in two of your skill proficiencies of your choice. Performance and Persuasion are recommended if you have proficiency in them.",
      "At Bard level 9, you gain Expertise in two more of your skill proficiencies of your choice."
    ],
    isTracked: false
  },
  [ClassFeature.JACK_OF_ALL_TRADES]: {
    description: [
      "You can add half your Proficiency Bonus, round down, to any ability check you make that uses a skill proficiency you lack and that does not otherwise use your Proficiency Bonus.",
      "For example, if you make a Strength (Athletics) check and lack Athletics proficiency, you can add half your Proficiency Bonus to the check."
    ],
    isTracked: false
  },
  [ClassFeature.BARD_SUBCLASS]: {
    description: [
      "You gain a Bard subclass of your choice. The College of Lore subclass is detailed after this class's description.",
      "A subclass is a specialization that grants you features at certain Bard levels.",
      "For the rest of your career, you gain each of your subclass's features that are of your Bard level or lower."
    ],
    isTracked: false
  },
  [ClassFeature.FONT_OF_INSPIRATION]: {
    description: [
      "You now regain all your expended uses of Bardic Inspiration when you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>.",
      "In addition, you can expend a spell slot, no action required, to regain one expended use of Bardic Inspiration."
    ],
    isTracked: false
  },
  [ClassFeature.COUNTERCHARM]: {
    description: [
      "You can use musical notes or words of power to disrupt mind-influencing effects.",
      "If you or a creature within 30 feet of you fails a saving throw against an effect that applies the Charmed or Frightened condition, you can take a Reaction to cause the save to be rerolled, and the new roll has Advantage."
    ],
    isTracked: false
  },
  [ClassFeature.MAGICAL_SECRETS]: {
    description: [
      "You have learned secrets from various magical traditions.",
      "Whenever you reach a Bard level, including this level, and the Prepared Spells number in the Bard Features table increases, you can choose any of your new prepared spells from the Bard, Cleric, Druid, and Wizard spell lists, and the chosen spells count as Bard spells for you.",
      "In addition, whenever you replace a spell prepared for this class, you can replace it with a spell from those lists."
    ],
    isTracked: false
  },
  [ClassFeature.SUPERIOR_INSPIRATION]: {
    description: [
      "When you roll Initiative, you regain expended uses of Bardic Inspiration until you have two if you have fewer than that."
    ],
    isTracked: false
  },
  [ClassFeature.WORDS_OF_CREATION]: {
    description: [
      "You have mastered two of the Words of Creation: the words of life and death.",
      "You therefore always have the Power Word Heal and Power Word Kill spells prepared.",
      "When you cast either spell, you can target a second creature with it if that creature is within 10 feet of the first target."
    ],
    isTracked: false
  },
  [ClassFeature.DANGER_SENSE]: {
    description: [
      "You gain an uncanny sense of when things aren't as they should be, giving you an edge when you dodge perils.",
      "You have Advantage on Dexterity saving throws unless you have the Incapacitated condition."
    ],
    isTracked: false
  },
  [ClassFeature.RECKLESS_ATTACK]: {
    description: [
      "You can throw aside all concern for defense to attack with increased ferocity.",
      "When you make your first attack roll on your turn, you can decide to attack recklessly. Doing so gives you Advantage on attack rolls using Strength until the start of your next turn, but attack rolls against you have Advantage during that time."
    ],
    isTracked: false
  },
  [ClassFeature.BARBARIAN_SUBCLASS]: {
    description: [
      "You gain a Barbarian subclass of your choice. The Path of the Berserker subclass is detailed after this class's description.",
      "A subclass is a specialization that grants you features at certain Barbarian levels.",
      "For the rest of your career, you gain each of your subclass's features that are of your Barbarian level or lower."
    ],
    isTracked: false
  },
  [ClassFeature.PRIMAL_KNOWLEDGE]: {
    description: [
      "You gain proficiency in another skill of your choice from the skill list available to Barbarians at level 1.",
      "In addition, while your Rage is active, you can channel primal power when you attempt certain tasks. Whenever you make an ability check using Acrobatics, Intimidation, Perception, Stealth, or Survival, you can make it as a Strength check even if it normally uses a different ability.",
      "When you use this ability, your Strength represents primal power coursing through you, honing your agility, bearing, and senses."
    ],
    isTracked: false
  },
  [ClassFeature.ABILITY_SCORE_IMPROVEMENT]: {
    description: [
      "You gain the Ability Score Improvement feat, or another feat of your choice for which you qualify.",
      "You gain this feature again at later class levels, as shown in your class's feature table."
    ],
    isTracked: false
  },
  [ClassFeature.EXTRA_ATTACK]: {
    description: [
      "You can attack twice instead of once whenever you take the Attack action on your turn."
    ],
    isTracked: false
  },
  [ClassFeature.FAST_MOVEMENT]: {
    description: ["Your Speed increases by 10 feet while you aren't wearing Heavy armor."],
    isTracked: false
  },
  [ClassFeature.SUBCLASS_FEATURE]: {
    description: ["You gain a feature from your chosen subclass."],
    isTracked: false
  },
  [ClassFeature.FERAL_INSTINCT]: {
    description: ["Your instincts are so honed that you have Advantage on Initiative rolls."],
    isTracked: false
  },
  [ClassFeature.INSTINCTIVE_POUNCE]: {
    description: [
      "As part of the Bonus Action you take to enter your Rage, you can move up to half your Speed."
    ],
    isTracked: false
  },
  [ClassFeature.BRUTAL_STRIKE]: {
    description: [
      "If you use Reckless Attack, you can forgo any Advantage on one Strength-based attack roll of your choice on your turn. The chosen attack roll mustn't have Disadvantage.",
      "If the chosen attack roll hits, the target takes an extra 1d10 damage of the same type dealt by the weapon or Unarmed Strike, and you can cause one Brutal Strike effect of your choice.",
      "<strong>Forceful Blow.</strong> The target is pushed 15 feet straight away from you. You can then move up to half your Speed straight toward the target without provoking Opportunity Attacks.",
      "<strong>Hamstring Blow.</strong> The target's Speed is reduced by 15 feet until the start of your next turn. A target can be affected by only one Hamstring Blow at a time, the most recent one."
    ],
    isTracked: false
  },
  [ClassFeature.RELENTLESS_RAGE]: {
    description: [
      "Your Rage can keep you fighting despite grievous wounds.",
      "If you drop to 0 Hit Points while your Rage is active and don't die outright, you can make a DC 10 Constitution saving throw. If you succeed, your Hit Points instead change to a number equal to twice your Barbarian level.",
      "Each time you use this feature after the first, the DC increases by 5. When you finish a <link:short-rest>Short Rest</link> or <link:long-rest>Long Rest</link>, the DC resets to 10."
    ],
    isTracked: false
  },
  [ClassFeature.IMPROVED_BRUTAL_STRIKE]: {
    description: [
      "You have honed new ways to attack furiously. The following effects are now among your Brutal Strike options.",
      "<strong>Staggering Blow.</strong> The target has Disadvantage on the next saving throw it makes, and it can't make Opportunity Attacks until the start of your next turn.",
      "<strong>Sundering Blow.</strong> Before the start of your next turn, the next attack roll made by another creature against the target gains a +5 bonus to the roll. An attack roll can gain only one Sundering Blow bonus."
    ],
    isTracked: false
  },
  [ClassFeature.PERSISTENT_RAGE]: {
    description: [
      "When you roll Initiative, you can regain all expended uses of Rage. After you regain uses of Rage in this way, you can't do so again until you finish a <link:long-rest>Long Rest</link>.",
      "In addition, your Rage is so fierce that it now lasts for 10 minutes without you needing to do anything to extend it from round to round.",
      "Your Rage ends early if you have the Unconscious condition, not just the Incapacitated condition, or don Heavy armor."
    ],
    isTracked: false
  },
  [ClassFeature.INDOMITABLE_MIGHT]: {
    description: [
      "If your total for a Strength check or Strength saving throw is less than your Strength score, you can use that score in place of the total."
    ],
    isTracked: false
  },
  [ClassFeature.EPIC_BOON]: {
    description: [
      "You gain an Epic Boon feat, or another feat of your choice for which you qualify."
    ],
    isTracked: false
  },
  [ClassFeature.PRIMAL_CHAMPION]: {
    description: [
      "You embody primal power. Your Strength and Constitution scores increase by 4, to a maximum of 25."
    ],
    isTracked: false
  }
};
