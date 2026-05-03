import { FEAT_CATEGORY, FEATS, TRACKER } from "../../../../codex/entries";
import type { FeatDefinition } from "../types";
import { crafterDiscountDescription, crafterFastCraftingDescription } from "../crafter";

export const originFeatDefinitions: FeatDefinition[] = [
  {
    feat: FEATS.ALERT,
    label: "Alert",
    category: FEAT_CATEGORY.ORIGIN,
    description: [
      "You gain the following benefits.",
      "<strong>Initiative Proficiency.</strong> When you roll Initiative, you can add your Proficiency Bonus to the roll.",
      "<strong>Initiative Swap.</strong> Immediately after you roll Initiative, you can swap your Initiative with the Initiative of one willing ally in the same combat. You can't make this swap if you or the ally has the Incapacitated condition."
    ],
    trackingState: TRACKER.TRACKED
  },
  {
    feat: FEATS.MAGIC_INITIATE,
    label: "Magic Initiate",
    category: FEAT_CATEGORY.ORIGIN,
    repeatable: true,
    description: [
      "You gain the following benefits.",
      "<strong>Two Cantrips.</strong> You learn two cantrips of your choice from the Cleric, Druid, or Wizard spell list. Intelligence, Wisdom, or Charisma is your spellcasting ability for this feat's spells (choose when you select this feat).",
      "<strong>Level 1 Spell.</strong> Choose a level 1 spell from the same list you selected for this feat's cantrips. You always have that spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast the spell using any spell slots you have.",
      "<strong>Spell Change.</strong> Whenever you gain a new level, you can replace one of the spells you chose for this feat with a different spell of the same level from the chosen spell list.",
      "<strong>Repeatable.</strong> You can take this feat more than once, but you must choose a different spell list each time."
    ],
    trackingState: TRACKER.TRACKED
  },
  {
    feat: FEATS.SAVAGE_ATTACKER,
    label: "Savage Attacker",
    category: FEAT_CATEGORY.ORIGIN,
    description: [
      "You've trained to deal particularly damaging strikes. Once per turn when you hit a target with a weapon, you can roll the weapon's damage dice twice and use either roll against the target."
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  {
    feat: FEATS.SKILLED,
    label: "Skilled",
    category: FEAT_CATEGORY.ORIGIN,
    repeatable: true,
    description: [
      "You gain proficiency in any combination of three skills or tools of your choice.",
      "<strong>Repeatable.</strong> You can take this feat more than once."
    ],
    trackingState: TRACKER.TRACKED
  },
  {
    feat: FEATS.CRAFTER,
    label: "Crafter",
    category: FEAT_CATEGORY.ORIGIN,
    description: [
      "You gain the following benefits.",
      "<strong>Tool Proficiency.</strong> You gain proficiency with three different Artisan's Tools of your choice from the Fast Crafting table.",
      crafterDiscountDescription,
      crafterFastCraftingDescription,
      "<strong>Fast Crafting Table.</strong> Carpenter's Tools: Ladder, Torch; Leatherworker's Tools: Crossbow Bolt Case, Map or Scroll Case, Pouch; Mason's Tools: Block and Tackle; Potter's Tools: Jug, Lamp; Smith's Tools: Ball Bearings, Bucket, Caltrops, Grappling Hook, Iron Pot; Tinker's Tools: Bell, Shovel, Tinderbox; Weaver's Tools: Basket, Rope, Net, Tent; Woodcarver's Tools: Club, Greatclub, Quarterstaff."
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  {
    feat: FEATS.HEALER,
    label: "Healer",
    category: FEAT_CATEGORY.ORIGIN,
    description: [
      "You gain the following benefits.",
      "<strong>Battle Medic.</strong> If you have a Healer's Kit, you can expend one use of it and tend to a creature within 5 feet of yourself as a Utilize action. That creature can expend one of its Hit Point Dice, and you then roll that die. The creature regains a number of Hit Points equal to the roll plus your Proficiency Bonus.",
      "<strong>Healing Rerolls.</strong> Whenever you roll a die to determine the number of Hit Points you restore with a spell or with this feat's Battle Medic benefit, you can reroll the die if it rolls a 1, and you must use the new roll."
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  {
    feat: FEATS.LUCKY,
    label: "Lucky",
    category: FEAT_CATEGORY.ORIGIN,
    description: [
      "You gain the following benefits.",
      "<strong>Luck Points.</strong> You have a number of Luck Points equal to your Proficiency Bonus and can spend the points on the benefits below. You regain your expended Luck Points when you finish a Long Rest.",
      "<strong>Advantage.</strong> When you roll a d20 for a D20 Test, you can spend 1 Luck Point to give yourself Advantage on the roll.",
      "<strong>Disadvantage.</strong> When a creature rolls a d20 for an attack roll against you, you can spend 1 Luck Point to impose Disadvantage on that roll."
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  {
    feat: FEATS.MUSICIAN,
    label: "Musician",
    category: FEAT_CATEGORY.ORIGIN,
    description: [
      "You gain the following benefits.",
      "<strong>Instrument Training.</strong> You gain proficiency with three Musical Instruments of your choice.",
      "<strong>Encouraging Song.</strong> As you finish a Short or Long Rest, you can play a song on a Musical Instrument with which you have proficiency and give Heroic Inspiration to allies who hear the song. The number of allies you can affect in this way equals your Proficiency Bonus."
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  {
    feat: FEATS.TAVERN_BRAWLER,
    label: "Tavern Brawler",
    category: FEAT_CATEGORY.ORIGIN,
    description: [
      "You gain the following benefits.",
      "<strong>Enhanced Unarmed Strike.</strong> When you hit with your Unarmed Strike and deal damage, you can deal Bludgeoning damage equal to 1d4 plus your Strength modifier instead of the normal damage of an Unarmed Strike.",
      "<strong>Damage Rerolls.</strong> Whenever you roll a damage die for your Unarmed Strike, you can reroll the die if it rolls a 1, and you must use the new roll.",
      "<strong>Improvised Weaponry.</strong> You have proficiency with improvised weapons.",
      "<strong>Push.</strong> When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can deal damage to the target and also push it 5 feet away from you. You can use this benefit only once per turn."
    ],
    trackingState: TRACKER.SEMI_TRACKED
  },
  {
    feat: FEATS.TOUGH,
    label: "Tough",
    category: FEAT_CATEGORY.ORIGIN,
    description: [
      "Your Hit Point maximum increases by an amount equal to twice your character level when you gain this feat. Whenever you gain a character level thereafter, your Hit Point maximum increases by an additional 2 Hit Points."
    ],
    trackingState: TRACKER.TRACKED
  }
];
