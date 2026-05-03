import { FEAT_CATEGORY, FEATS, TRACKER } from "../../../../codex/entries";
import type { FeatDefinition } from "../types";

export const epicBoonFeatDefinitions: FeatDefinition[] = [
  {
    feat: FEATS.BOON_OF_COMBAT_PROWESS,
    label: "Boon of Combat Prowess",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30. <link:tracked>Tracked</link>",
      "<strong>Peerless Aim.</strong> When you miss with an attack roll, you can hit instead. Once you use this benefit, you can't use it again until the start of your next turn. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  {
    feat: FEATS.BOON_OF_DIMENSIONAL_TRAVEL,
    label: "Boon of Dimensional Travel",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30. <link:tracked>Tracked</link>",
      "<strong>Blink Steps.</strong> Immediately after you take the Attack action or the Magic action, you can teleport up to 30 feet to an unoccupied space you can see. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  {
    feat: FEATS.BOON_OF_FATE,
    label: "Boon of Fate",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30. <link:tracked>Tracked</link>",
      "<strong>Improve Fate.</strong> When you or another creature within 60 feet of you succeeds on or fails a D20 Test, you can roll 2d4 and apply the total rolled as a bonus or penalty to the d20 roll. Once you use this benefit, you can't use it again until you roll Initiative or finish a Short Rest or Long Rest. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  {
    feat: FEATS.BOON_OF_IRRESISTIBLE_OFFENSE,
    label: "Boon of Irresistible Offense",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Strength or Dexterity score by 1, to a maximum of 30. <link:tracked>Tracked</link>",
      "<strong>Overcome Defenses.</strong> The Bludgeoning, Piercing, and Slashing damage you deal always ignores Resistance. <link:not-tracked>Not Tracked</link>",
      "<strong>Overwhelming Strike.</strong> When you roll a 20 on the d20 for an attack roll, you can deal extra damage to the target equal to the ability score increased by this feat. The extra damage's type is the same as the attack's type. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  {
    feat: FEATS.BOON_OF_THE_NIGHT_SPIRIT,
    label: "Boon of the Night Spirit",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30. <link:tracked>Tracked</link>",
      "<strong>Merge with Shadows.</strong> While within Dim Light or Darkness, you can give yourself the Invisible condition as a Bonus Action. The condition ends on you immediately after you take an action, a Bonus Action, or a Reaction. <link:not-tracked>Not Tracked</link>",
      "<strong>Shadowy Form.</strong> While within Dim Light or Darkness, you have Resistance to all damage except Psychic and Radiant. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  {
    feat: FEATS.BOON_OF_SPELL_RECALL,
    label: "Boon of Spell Recall",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+, Spellcasting or Pact Magic Feature",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 30. <link:tracked>Tracked</link>",
      "<strong>Free Casting.</strong> Whenever you cast a spell with a level 1-4 spell slot, roll 1d4. If the number you roll is the same as the slot's level, the slot isn't expended. <link:not-tracked>Not Tracked</link>"
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  {
    feat: FEATS.BOON_OF_TRUESIGHT,
    label: "Boon of Truesight",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30.",
      "<strong>Truesight.</strong> You have Truesight with a range of 60 feet."
    ],
    trackingState: TRACKER.TRACKED
  },
  {
    feat: FEATS.BOON_OF_ENERGY_RESISTANCE,
    label: "Boon of Energy Resistance",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30.",
      "<strong>Energy Resistances.</strong> You gain Resistance to two of the following damage types of your choice: Acid, Cold, Fire, Lightning, Necrotic, Poison, Psychic, Radiant, or Thunder. Whenever you finish a Long Rest, you can change your choices.",
      "<strong>Energy Redirection.</strong> When you take damage of one of the types chosen for the Energy Resistances benefit, you can take a Reaction to direct damage of the same type toward another creature you can see within 60 feet of yourself that isn't behind Total Cover. If you do so, that creature must succeed on a Dexterity saving throw (DC 8 plus your Constitution modifier and Proficiency Bonus) or take damage equal to 2d12 plus your Constitution modifier."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.BOON_OF_FORTITUDE,
    label: "Boon of Fortitude",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30.",
      "<strong>Fortified Health.</strong> Your Hit Point maximum increases by 40. In addition, whenever you regain Hit Points, you can regain additional Hit Points equal to your Constitution modifier. Once you've regained these additional Hit Points, you can't do so again until the start of your next turn."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.BOON_OF_RECOVERY,
    label: "Boon of Recovery",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30.",
      "<strong>Last Stand.</strong> When you would be reduced to 0 Hit Points, you can drop to 1 Hit Point instead and regain a number of Hit Points equal to half your Hit Point maximum. Once you use this benefit, you can't use it again until you finish a Long Rest.",
      "<strong>Recover Vitality.</strong> You have a pool of ten d10s. As a Bonus Action, you can expend dice from the pool, roll those dice, and regain a number of Hit Points equal to the roll's total. You regain all the expended dice when you finish a Long Rest."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.BOON_OF_SKILL,
    label: "Boon of Skill",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30.",
      "<strong>All-Around Adept.</strong> You gain proficiency in all skills.",
      "<strong>Expertise.</strong> Choose one skill in which you lack Expertise. You gain Expertise in that skill."
    ],
    trackingState: TRACKER.NOT_TRACKED
  },
  {
    feat: FEATS.BOON_OF_SPEED,
    label: "Boon of Speed",
    category: FEAT_CATEGORY.EPIC_BOON,
    prerequisite: "Level 19+",
    description: [
      "You gain the following benefits.",
      "<strong>Ability Score Increase.</strong> Increase one ability score of your choice by 1, to a maximum of 30.",
      "<strong>Escape Artist.</strong> As a Bonus Action, you can take the Disengage action, which also ends the Grappled condition on you.",
      "<strong>Quickness.</strong> Your Speed increases by 30 feet."
    ],
    trackingState: TRACKER.NOT_TRACKED
  }
];
