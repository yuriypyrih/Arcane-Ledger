import type { SpellDescriptionEntry } from "../../codex/entries";
import { ACTION_CARD_THEME } from "./actionCardTheme";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "./actionEconomy";
import type { FeatureActionCard } from "./classFeatures";

const attackDescription: SpellDescriptionEntry[] = [
  "When you take the Attack action, you can make one attack roll with a weapon or an Unarmed Strike. Your character already has explicit gameplay Action Cards for weapon attacks and Unarmed Strike, so you can usually use those instead.",
  "<strong>Equipping and Unequipping Weapons</strong>. You can either equip or unequip one weapon when you make an attack as part of this action. You do so either before or after the attack. If you equip a weapon before an attack, you don't need to use it for that attack. Equipping a weapon includes drawing it from a sheath or picking it up. Unequipping a weapon includes sheathing, stowing, or dropping it.",
  "<strong>Moving between Attacks</strong>. If you move on your turn and have a feature, such as Extra Attack, that gives you more than one attack as part of the Attack action, you can use some or all of that movement to move between those attacks."
];

const dashDescription: SpellDescriptionEntry[] = [
  "When you take the Dash action, you gain extra movement for the current turn. The increase equals your Speed after applying any modifiers. With a Speed of 30 feet, for example, you can move up to 60 feet on your turn if you Dash. If your Speed of 30 feet is reduced to 15 feet, you can move up to 30 feet this turn if you Dash.",
  'If you have a special speed, such as a Fly Speed or Swim Speed, you can use that speed instead of your Speed when you take this action. You choose which speed to use each time you take it. See also "Speed."'
];

const disengageDescription: SpellDescriptionEntry[] = [
  "If you take the Disengage action, your movement doesn't provoke Opportunity Attacks for the rest of the current turn."
];

const dodgeDescription: SpellDescriptionEntry[] = [
  "If you take the Dodge action, you gain the following benefits: until the start of your next turn, any attack roll made against you has Disadvantage if you can see the attacker, and you make Dexterity saving throws with Advantage.",
  "You lose these benefits if you have the Incapacitated condition or if your Speed is 0."
];

const helpDescription: SpellDescriptionEntry[] = [
  "When you take the Help action, you do one of the following.",
  {
    type: "list",
    style: "bullet",
    items: [
      "<strong>Assist an Ability Check.</strong> Choose one of your skill or tool proficiencies and one ally who is near enough for you to assist verbally or physically when they make an ability check. That ally has Advantage on the next ability check they make with the chosen skill or tool. This benefit expires if the ally doesn't use it before the start of your next turn. The DM has final say on whether your assistance is possible.",
      "<strong>Assist an Attack Roll.</strong> You momentarily distract an enemy within 5 feet of you, giving Advantage to the next attack roll by one of your allies against that enemy. This benefit expires at the start of your next turn."
    ]
  }
];

const hideDescription: SpellDescriptionEntry[] = [
  "With the Hide action, you try to conceal yourself. To do so, you must succeed on a DC 15 Dexterity (Stealth) check while you're Heavily Obscured or behind Three-Quarters Cover or Total Cover, and you must be out of any enemy's line of sight; if you can see a creature, you can discern whether it can see you.",
  "On a successful check, you have the Invisible condition while hidden. Make note of your check's total, which is the DC for a creature to find you with a Wisdom (Perception) check.",
  "You stop being hidden immediately after any of the following occurs: you make a sound louder than a whisper, an enemy finds you, you make an attack roll, or you cast a spell with a Verbal component."
];

const influenceDescription: SpellDescriptionEntry[] = [
  "With the Influence action, you urge a monster to do something. Describe or roleplay how you're communicating with the monster. Are you trying to deceive, intimidate, amuse, or gently persuade? The DM then determines whether the monster feels willing, unwilling, or hesitant due to your interaction; this determination establishes whether an ability check is necessary, as explained below.",
  {
    type: "list",
    style: "bullet",
    items: [
      "<strong>Willing.</strong> If your urging aligns with the monster's desires, no ability check is necessary; the monster fulfills your request in a way it prefers.",
      "<strong>Unwilling.</strong> If your urging is repugnant to the monster or counter to its alignment, no ability check is necessary; it doesn't comply.",
      "<strong>Hesitant.</strong> If you urge the monster to do something that it is hesitant to do, you must make an ability check, which is affected by the monster's attitude: Indifferent, Friendly, or Hostile, each of which is defined in this glossary. The DM chooses the check, which has a default DC equal to 15 or the monster's Intelligence score, whichever is higher. On a successful check, the monster does as urged. On a failed check, you must wait 24 hours (or a duration set by the DM) before urging it in the same way again."
    ]
  },
  "Influence Checks:",
  {
    type: "list",
    style: "bullet",
    items: [
      "<strong>Charisma (Deception).</strong> Deceiving a monster that understands you.",
      "<strong>Charisma (Intimidation).</strong> Intimidating a monster.",
      "<strong>Charisma (Performance).</strong> Amusing a monster.",
      "<strong>Charisma (Persuasion).</strong> Persuading a monster that understands you.",
      "<strong>Wisdom (Animal Handling).</strong> Gently coaxing a Beast or Monstrosity."
    ]
  }
];

const magicDescription: SpellDescriptionEntry[] = [
  "When you take the Magic action, you cast a spell that has a casting time of an action or use a feature or magic item that requires a Magic action to be activated. If your character has spellcasting, those spells already track these Magic actions in the Spellcasting section, so you can usually use those entries instead.",
  'If you cast a spell that has a casting time of 1 minute or longer, you must take the Magic action on each turn of that casting, and you must maintain Concentration while you do so. If your Concentration is broken, the spell fails, but you don\'t expend a spell slot. See also "Concentration."'
];

const readyDescription: SpellDescriptionEntry[] = [
  "You take the Ready action to wait for a particular circumstance before you act. To do so, you take this action on your turn, which lets you act by taking a Reaction before the start of your next turn.",
  'First, you decide what perceivable circumstance will trigger your Reaction. Then, you choose the action you will take in response to that trigger, or you choose to move up to your Speed in response to it. Examples include "If the cultist steps on the trapdoor, I\'ll pull the lever that opens it," and "If the zombie steps next to me, I move away."',
  "When the trigger occurs, you can either take your Reaction right after the trigger finishes or ignore the trigger.",
  "When you Ready a spell, you cast it as normal (expending any resources used to cast it) but hold its energy, which you release with your Reaction when the trigger occurs. To be readied, a spell must have a casting time of an action, and holding on to the spell's magic requires Concentration, which you can maintain up to the start of your next turn. If your Concentration is broken, the spell dissipates without taking effect."
];

const searchDescription: SpellDescriptionEntry[] = [
  "When you take the Search action, you make a Wisdom check to discern something that isn't obvious. The Search list suggests which skills are applicable when you take this action, depending on what you're trying to detect.",
  {
    type: "list",
    style: "bullet",
    items: [
      "<strong>Insight.</strong> Creature's state of mind.",
      "<strong>Medicine.</strong> Creature's ailment or cause of death.",
      "<strong>Perception.</strong> Concealed creature or object.",
      "<strong>Survival.</strong> Tracks or food."
    ]
  }
];

const studyDescription: SpellDescriptionEntry[] = [
  "When you take the Study action, you make an Intelligence check to study your memory, a book, a clue, or another source of knowledge and call to mind an important piece of information about it.",
  "The Areas of Knowledge list suggests which skills are applicable to various areas of knowledge.",
  {
    type: "list",
    style: "bullet",
    items: [
      "<strong>Arcana.</strong> Spells, magic items, eldritch symbols, magical traditions, planes of existence, and certain creatures (Aberrations, Constructs, Elementals, Fey, and Monstrosities).",
      "<strong>History.</strong> Historic events and people, ancient civilizations, wars, and certain creatures (Giants and Humanoids).",
      "<strong>Investigation.</strong> Traps, ciphers, riddles, and gadgetry.",
      "<strong>Nature.</strong> Terrain, flora, weather, and certain creatures (Beasts, Dragons, Oozes, and Plants).",
      "<strong>Religion.</strong> Deities, religious hierarchies and rites, holy symbols, cults, and certain creatures (Celestials, Fiends, and Undead)."
    ]
  }
];

const utilizeDescription: SpellDescriptionEntry[] = [
  "You normally interact with an object while doing something else, such as when you draw a sword as part of the Attack action. When an object requires an action for its use, you take the Utilize action."
];

const commonActionCards = [
  {
    key: "common-action-attack",
    name: "Attack",
    summary: "Make a weapon or unarmed attack.",
    detail: "Make one attack roll or review attack rules.",
    breakdown: "Make one weapon or unarmed attack",
    cardTheme: ACTION_CARD_THEME.ATTACK,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.ATTACK,
    consumesEconomyOnActivate: true,
    description: attackDescription
  },
  {
    key: "common-action-dash",
    name: "Dash",
    summary: "Gain extra movement this turn.",
    detail: "Gain extra movement equal to your chosen speed for the turn.",
    breakdown: "Move up to twice speed",
    cardTheme: ACTION_CARD_THEME.UTIL,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.UTILITY,
    consumesEconomyOnActivate: true,
    description: dashDescription
  },
  {
    key: "common-action-disengage",
    name: "Disengage",
    summary: "Avoid opportunity attacks while moving.",
    detail: "Your movement doesn't provoke Opportunity Attacks for the rest of the turn.",
    breakdown: "Move without provoking attacks",
    cardTheme: ACTION_CARD_THEME.UTIL,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.UTILITY,
    consumesEconomyOnActivate: true,
    description: disengageDescription
  },
  {
    key: "common-action-dodge",
    name: "Dodge",
    summary: "Defend yourself until your next turn.",
    detail: "Attack rolls against you become harder, and Dexterity saves improve.",
    breakdown: "Make attacks against you harder",
    cardTheme: ACTION_CARD_THEME.DEFENSE,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.UTILITY,
    consumesEconomyOnActivate: true,
    description: dodgeDescription
  },
  {
    key: "common-action-help",
    name: "Help",
    summary: "Aid an ally's check or attack.",
    detail: "Give an ally Advantage on a timely check or attack.",
    breakdown: "Grant an ally advantage",
    cardTheme: ACTION_CARD_THEME.UTIL,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.INTERACTION,
    consumesEconomyOnActivate: true,
    description: helpDescription
  },
  {
    key: "common-action-hide",
    name: "Hide",
    summary: "Attempt to become hidden.",
    detail: "Make a Stealth check to gain the Invisible condition while hidden.",
    breakdown: "Try to stay unseen",
    cardTheme: ACTION_CARD_THEME.UTIL,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.UTILITY,
    consumesEconomyOnActivate: true,
    description: hideDescription
  },
  {
    key: "common-action-influence",
    name: "Influence",
    summary: "Urge a creature to act.",
    detail: "Try to sway a monster through words, presence, or handling.",
    breakdown: "Urge a monster to comply",
    cardTheme: ACTION_CARD_THEME.UTIL,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.INTERACTION,
    consumesEconomyOnActivate: true,
    description: influenceDescription
  },
  {
    key: "common-action-magic",
    name: "Magic",
    summary: "Cast a spell or activate magic.",
    detail: "Use an action-timed spell, magical feature, or magic item.",
    breakdown: "Cast spells or activate magic",
    cardTheme: ACTION_CARD_THEME.MAGIC,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.MAGIC,
    consumesEconomyOnActivate: true,
    description: magicDescription
  },
  {
    key: "common-action-ready",
    name: "Ready",
    summary: "Prepare a reaction for later.",
    detail: "Set a trigger and respond with an action, movement, or spell.",
    breakdown: "Set a trigger and react",
    cardTheme: ACTION_CARD_THEME.UTIL,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.UTILITY,
    consumesEconomyOnActivate: true,
    description: readyDescription
  },
  {
    key: "common-action-search",
    name: "Search",
    summary: "Look for something hidden.",
    detail: "Make a Wisdom-based check to notice something not obvious.",
    breakdown: "Spot hidden clues or threats",
    cardTheme: ACTION_CARD_THEME.UTIL,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.UTILITY,
    consumesEconomyOnActivate: true,
    description: searchDescription
  },
  {
    key: "common-action-study",
    name: "Study",
    summary: "Examine a source of knowledge.",
    detail: "Make an Intelligence-based check to recall or analyze information.",
    breakdown: "Recall or analyze knowledge",
    cardTheme: ACTION_CARD_THEME.UTIL,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.UTILITY,
    consumesEconomyOnActivate: true,
    description: studyDescription
  },
  {
    key: "common-action-utilize",
    name: "Utilize",
    summary: "Use an object that needs action.",
    detail: "Spend your action to use an object that requires it.",
    breakdown: "Use an object needing action",
    cardTheme: ACTION_CARD_THEME.UTIL,
    economyType: ECONOMY_TYPE.ACTION,
    actionCategory: ACTION_CATEGORY.UTILITY,
    consumesEconomyOnActivate: true,
    description: utilizeDescription
  }
] satisfies FeatureActionCard[];

const commonActionKeys = new Set(commonActionCards.map((action) => action.key));

export function getCommonActionCards(): readonly FeatureActionCard[] {
  return commonActionCards;
}

export function isCommonActionKey(actionKey: string): boolean {
  return commonActionKeys.has(actionKey);
}
