import type { AbilityKey, SkillName } from "../../types";

export const keywordDescriptions = {
  abilityModifiers: {
    "Ability Modifier":
      "Derived bonus or penalty from an ability score that affects attacks, checks, and saves.",
    STR:
      "Strength: raw physical power for lifting, pushing, grappling, and many melee attacks.",
    DEX:
      "Dexterity: agility, reflexes, finesse or ranged accuracy, and initiative.",
    CON:
      "Constitution: stamina, durability, and bodily resilience.",
    INT:
      "Intelligence: memory, logic, study, and technical arcane knowledge.",
    WIS:
      "Wisdom: awareness, intuition, perception, and practical judgment.",
    CHA:
      "Charisma: force of personality, social influence, leadership, and presence.",
    Strength: "Strength: physical might and forceful actions.",
    Dexterity: "Dexterity: precision, agility, and reaction speed.",
    Constitution: "Constitution: endurance and toughness.",
    Intelligence: "Intelligence: reasoning and learned knowledge.",
    Wisdom: "Wisdom: situational awareness and instincts.",
    Charisma: "Charisma: confidence and personal impact."
  } as Record<
    | AbilityKey
    | "Ability Modifier"
    | "Strength"
    | "Dexterity"
    | "Constitution"
    | "Intelligence"
    | "Wisdom"
    | "Charisma",
    string
  >,
  coreStats: {
    "Character Stats":
      "Overview of derived combat and utility values from your build, class, species, proficiencies, and equipment.",
    "Core Stats": "Primary derived values used constantly during play.",
    "Ability Modifiers": "Per-ability bonuses used across attacks, checks, and saves.",
    "Saving Throws":
      "Defensive rolls against harmful effects. Saving throw = ability modifier + proficiency bonus if proficient.",
    "Armor Class":
      "How hard you are to hit. AC = armor base + allowed DEX modifier + shield bonus. Base is 10 with no armor.",
    Initiative: "Turn order bonus at combat start. Initiative = DEX modifier.",
    Speed: "Distance you can move on your turn. Speed is based on species.",
    "Passive Perception": "Always-on awareness score. Passive Perception = 10 + Perception modifier.",
    "Proficiency Bonus":
      "Level progression: levels 1-4 = +2, 5-8 = +3, 9-12 = +4, 13-16 = +5, 17-20 = +6.",
    "Hit Dice":
      "Recovery dice based on class and level. Display shows die type and remaining/total dice."
  },
  savingThrows: {
    "STR Saving Throw": "Resists forced movement, grapples, and brute-force effects.",
    "DEX Saving Throw": "Resists blasts, traps, and rapid hazards.",
    "CON Saving Throw": "Resists poison, exhaustion, and concentration-breaking strain.",
    "INT Saving Throw": "Resists mental logic or memory disruption effects.",
    "WIS Saving Throw": "Resists fear, charm, and perception or awareness effects.",
    "CHA Saving Throw": "Resists banishment, possession pressure, and identity-targeting effects.",
    "Strength Saving Throw": "Resists force and overpowering effects.",
    "Dexterity Saving Throw": "Resists area damage and quick hazards.",
    "Constitution Saving Throw": "Resists body-focused threats and concentration loss.",
    "Intelligence Saving Throw": "Resists cognition-targeting effects.",
    "Wisdom Saving Throw": "Resists will-targeting effects.",
    "Charisma Saving Throw": "Resists soul or identity displacement effects."
  },
  skills: {
    Acrobatics: "Balance, tumble, and control your movement in unstable or tight situations.",
    "Animal Handling": "Calm, guide, or direct animals and mounts through trained handling.",
    Arcana: "Recall magical lore, spell theory, and arcane traditions.",
    Athletics: "Climb, jump, swim, grapple, and perform other feats of physical exertion.",
    Deception: "Mislead others with lies, disguises, or misleading behavior.",
    History: "Remember historical events, factions, cultures, and notable figures.",
    Insight: "Read body language and tone to judge motives, honesty, and intent.",
    Intimidation: "Pressure others through threats, dominance, or fear.",
    Investigation: "Analyze clues and details to draw conclusions and solve problems.",
    Medicine: "Provide first aid, stabilize injuries, and identify medical conditions.",
    Nature: "Understand terrain, wildlife, weather, and natural phenomena.",
    Perception: "Notice hidden movement, sounds, details, and immediate danger.",
    Performance: "Entertain through music, acting, storytelling, or other showmanship.",
    Persuasion: "Influence others with reason, diplomacy, or personal charm.",
    Religion: "Know deities, doctrines, rites, and divine traditions.",
    "Sleight of Hand": "Use precise hand control for palming objects, tricks, or pickpocketing.",
    Stealth: "Move quietly and remain unseen while sneaking or hiding.",
    Survival: "Track creatures, navigate wilds, forage, and endure harsh conditions."
  } as Record<SkillName, string>,
  proficiencies: {
    "Simple weapons":
      "Training with basic, accessible weapons. You can use them effectively without penalties.",
    "Martial weapons":
      "Training with advanced weapons designed for dedicated combatants.",
    "Light armor":
      "Armor training with minimal mobility penalty; allows full Dexterity contribution to defense.",
    "Medium armor":
      "Armor training with balanced protection; limits Dexterity contribution to defense.",
    "Heavy armor":
      "Armor training with maximum protection and no Dexterity contribution to base defense.",
    Shield: "Training to equip shields and apply their armor bonus in combat.",
    "Thieve's Toolkit":
      "Tool proficiency for lockpicking, trap manipulation, and covert entry tasks.",
    "Thieves' Toolkit":
      "Tool proficiency for lockpicking, trap manipulation, and covert entry tasks.",
    "Smith's Toolkit":
      "Tool proficiency for metalworking tasks such as repair, shaping, and forging.",
    "Disguide Kit":
      "Tool proficiency for building disguises and altering your visible identity.",
    "Disguise Kit":
      "Tool proficiency for building disguises and altering your visible identity.",
    "Disarm Kit":
      "Tool proficiency for handling, disabling, or rendering traps and mechanisms safe."
  }
} as const;

function normalizeKeyword(keyword: string): string {
  return keyword.trim().toLowerCase();
}

const keywordDescriptionLookup = new Map<string, string>();

Object.values(keywordDescriptions).forEach((group) => {
  Object.entries(group).forEach(([keyword, description]) => {
    keywordDescriptionLookup.set(normalizeKeyword(keyword), description);
  });
});

export function getKeywordDescription(keyword: string): string | null {
  return keywordDescriptionLookup.get(normalizeKeyword(keyword)) ?? null;
}
