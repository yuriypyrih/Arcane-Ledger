import {
  WEAPON_BASE,
  WEAPON_MASTERY,
  WEAPON_PROPERTY
} from "../../codex/entries/enums";
import type { AbilityKey, SkillName } from "../../types";

export type KeywordReference = {
  title: string;
  description: string;
};

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
    Initiative:
      "Turn order bonus at combat start. Initiative is usually your DEX modifier, plus any feature or feat bonuses.",
    Speed: "Distance you can move on your turn. Speed is based on species and any active movement bonuses.",
    "Passive Perception": "Always-on awareness score. Passive Perception = 10 + Perception modifier.",
    "Proficiency Bonus":
      "Level progression: levels 1-4 = +2, 5-8 = +3, 9-12 = +4, 13-16 = +5, 17-20 = +6.",
    "Hit Dice":
      "Recovery dice based on class and level. Display shows die type and remaining/total dice."
  },
  combatRules: {
    Advantage:
      "Roll two d20s and use the higher result when a rule gives you an edge on a roll.",
    Disadvantage:
      "Roll two d20s and use the lower result when a rule makes a roll harder.",
    Concentration:
      "Some spells require Concentration to maintain. You can usually concentrate on only one such spell at a time, and taking damage or certain effects can end it.",
    Resistance:
      "Resistance halves damage from a qualifying source unless a rule says otherwise.",
    Vulnerability:
      "Vulnerability doubles damage from a qualifying source unless a rule says otherwise.",
    Immunity:
      "Immunity prevents a damage type or condition from affecting you unless a rule says otherwise.",
    Aura:
      "An aura is a passive area of influence that affects creatures, objects, or spaces around its source."
  },
  traits: {
    Senses:
      "Special forms of perception such as Darkvision or Truesight that change what your character can detect.",
    Darkvision:
      "You can see in darkness out to a listed range as if it were dim light, though color and fine detail may still be limited by the rules source.",
    Blindsight:
      "You can perceive creatures and objects within range without relying on sight, even through darkness or invisibility unless a rule says otherwise.",
    Tremorsense:
      "You can detect vibrations through a surface within range, helping you notice grounded creatures and movement nearby.",
    Truesight:
      "You can perceive things as they really are within range, including many illusions, invisible creatures, and hidden true forms.",
    Rage:
      "A Barbarian's primal battle state. While it lasts, it empowers certain Strength-based actions and other Rage-specific benefits.",
    Resistances:
      "Resistance entries show damage types that deal reduced damage to you.",
    Vulnerabilities:
      "Vulnerability entries show damage types that deal extra damage to you.",
    Immunities:
      "Immunity entries show damage types or conditions that have no effect on you.",
    Auras:
      "Aura entries track passive areas of influence that radiate from your character."
  },
  damageTypes: {
    Acid: "Corrosive damage from caustic substances, dissolving energy, or similar hazards.",
    Bludgeoning:
      "Impact damage from hammers, clubs, falls, and crushing force.",
    Cold: "Freezing damage from ice, bitter chill, or supernatural frost.",
    Fire: "Burning damage from flames, heat, and explosive combustion.",
    Force:
      "Pure magical impact or pressure that strikes with raw arcane energy.",
    Lightning:
      "Electrical damage from shocks, storms, and crackling energy.",
    Necrotic:
      "Life-draining damage tied to decay, deathly magic, and withering force.",
    Piercing:
      "Penetrating damage from arrows, spears, fangs, and pointed weapons.",
    Poison:
      "Toxic damage from venom, disease-like toxins, and harmful substances.",
    Psychic:
      "Mind-affecting damage that assaults thoughts, will, or consciousness.",
    Radiant:
      "Luminous holy or celestial damage often tied to divine power and searing light.",
    Slashing:
      "Cutting damage from blades, claws, and sweeping weapon strikes.",
    Thunder:
      "Concusive sound-wave damage from booming force and violent shockwaves."
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
  conditions: {
    Blinded:
      "You can't see and automatically fail checks that rely on sight. Attack rolls against you have Advantage, and your own attack rolls have Disadvantage.",
    Charmed:
      "You can't attack the charmer or target them with harmful abilities. The charmer has Advantage on social checks against you.",
    Deafened:
      "You can't hear and automatically fail checks that rely on hearing.",
    Frightened:
      "You have Disadvantage on checks and attacks while the source of fear is in sight. You also can't willingly move closer to it.",
    Grappled:
      "Your Speed becomes 0 while the grapple lasts. You also can't benefit from bonuses to Speed.",
    Incapacitated:
      "You can't take actions or reactions. Many other conditions build on top of this one.",
    Invisible:
      "You can't be seen without special senses or magic. You usually have Advantage on attacks, and attacks against you have Disadvantage.",
    Paralyzed:
      "You are Incapacitated and can't move or speak. You automatically fail Strength and Dexterity saving throws, and nearby hits become especially dangerous.",
    Petrified:
      "You are transformed into an inert stone-like state. You are Incapacitated and generally become much harder to affect physically.",
    Poisoned:
      "You have Disadvantage on attack rolls and ability checks.",
    Prone:
      "You are lying on the ground. Melee attacks against you become easier, while ranged attacks against you become harder.",
    Restrained:
      "Your Speed becomes 0. Attack rolls against you have Advantage, your own attacks have Disadvantage, and you have Disadvantage on Dexterity saving throws.",
    Stunned:
      "You are Incapacitated, can't move, and can speak only falteringly. You automatically fail Strength and Dexterity saving throws.",
    Unconscious:
      "You are Incapacitated, can't move or speak, and are unaware of your surroundings. You also drop what you're holding and fall Prone."
  },
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
  },
  weaponMasteries: {
    [WEAPON_MASTERY.CLEAVE]:
      "If you hit a creature with a melee attack roll using this weapon, you can make a melee attack roll with the weapon against a second creature within 5 feet of the first that is also within your reach. On a hit, the second creature takes the weapon's damage, but don't add your ability modifier to that damage unless that modifier is negative. You can make this extra attack only once per turn.",
    [WEAPON_MASTERY.GRAZE]:
      "If your attack roll with this weapon misses a creature, you can deal damage to that creature equal to the ability modifier you used to make the attack roll. This damage is the same type dealt by the weapon, and the damage can be increased only by increasing the ability modifier.",
    [WEAPON_MASTERY.NICK]:
      "When you make the extra attack of the Light property, you can make it as part of the Attack action instead of as a Bonus Action. You can make this extra attack only once per turn.",
    [WEAPON_MASTERY.PUSH]:
      "If you hit a creature with this weapon, you can push the creature up to 10 feet straight away from yourself if it is Large or smaller.",
    [WEAPON_MASTERY.SAP]:
      "If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.",
    [WEAPON_MASTERY.SLOW]:
      "If you hit a creature with this weapon and deal damage to it, you can reduce its Speed by 10 feet until the start of your next turn. If the creature is hit more than once by weapons that have this property, the Speed reduction doesn't exceed 10 feet.",
    [WEAPON_MASTERY.TOPPLE]:
      "If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw (DC 8 plus the ability modifier used to make the attack roll and your Proficiency Bonus). On a failed save, the creature has the Prone condition.",
    [WEAPON_MASTERY.VEX]:
      "If you hit a creature with this weapon and deal damage to the creature, you have Advantage on your next attack roll against that creature before the end of your next turn."
  },
  weaponProperties: {
    [WEAPON_PROPERTY.AMMUNITION]:
      "You can use a weapon that has the Ammunition property to make a ranged attack only if you have ammunition to fire from it. The type of ammunition required is specified with the weapon's range. Each attack expends one piece of ammunition. Drawing the ammunition is part of the attack (you need a free hand to load a one-handed weapon). After a fight, you can spend 1 minute to recover half the ammunition (round down) you used in the fight; the rest is lost.",
    [WEAPON_PROPERTY.FINESSE]:
      "When making an attack with a Finesse weapon, use your choice of your Strength or Dexterity modifier for the attack and damage rolls. You must use the same modifier for both rolls.",
    [WEAPON_PROPERTY.HEAVY]:
      "You have Disadvantage on attack rolls with a Heavy weapon if it's a Melee weapon and your Strength score isn't at least 13 or if it's a Ranged weapon and your Dexterity score isn't at least 13.",
    [WEAPON_PROPERTY.LIGHT]:
      "When you take the Attack action on your turn and attack with a Light weapon, you can make one extra attack as a Bonus Action later on the same turn. That extra attack must be made with a different Light weapon, and you don't add your ability modifier to the extra attack's damage unless that modifier is negative. For example, you can attack with a Shortsword in one hand and a Dagger in the other using the Attack action and a Bonus Action, but you don't add your Strength or Dexterity modifier to the damage roll of the Bonus Action unless that modifier is negative.",
    [WEAPON_PROPERTY.LOADING]:
      "You can fire only one piece of ammunition from a Loading weapon when you use an action, a Bonus Action, or a Reaction to fire it, regardless of the number of attacks you can normally make.",
    [WEAPON_PROPERTY.RANGE]:
      "A Range weapon has a range in parentheses after the Ammunition or Thrown property. The range lists two numbers. The first is the weapon's normal range in feet, and the second is the weapon's long range. When attacking a target beyond normal range, you have Disadvantage on the attack roll. You can't attack a target beyond the long range.",
    [WEAPON_PROPERTY.REACH]:
      "A Reach weapon adds 5 feet to your reach when you attack with it, as well as when determining your reach for Opportunity Attacks with it.",
    [WEAPON_PROPERTY.THROWN]:
      "If a weapon has the Thrown property, you can throw the weapon to make a ranged attack, and you can draw that weapon as part of the attack. If the weapon is a Melee weapon, use the same ability modifier for the attack and damage rolls that you use for a melee attack with that weapon.",
    [WEAPON_PROPERTY.TWO_HANDED]:
      "A Two-Handed weapon requires two hands when you attack with it.",
    [WEAPON_PROPERTY.VERSATILE]:
      "A Versatile weapon can be used with one or two hands. A damage value in parentheses appears with the property. The weapon deals that damage when used with two hands to make a melee attack."
  }
} as const;

export const classFeatureKeywordAliases = [
  { matchText: "Senses", keyword: "Senses" },
  { matchText: "Darkvision", keyword: "Darkvision" },
  { matchText: "Blindsight", keyword: "Blindsight" },
  { matchText: "Tremorsense", keyword: "Tremorsense" },
  { matchText: "Truesight", keyword: "Truesight" },
  { matchText: "Rage", keyword: "Rage" },
  { matchText: "Resistance", keyword: "Resistance" },
  { matchText: "Vulnerability", keyword: "Vulnerability" },
  { matchText: "Immunity", keyword: "Immunity" },
  { matchText: "Aura", keyword: "Aura" },
  { matchText: "Armor Class", keyword: "Armor Class" },
  { matchText: "Initiative", keyword: "Initiative" },
  { matchText: "Advantage", keyword: "Advantage" },
  { matchText: "Disadvantage", keyword: "Disadvantage" },
  { matchText: "Concentration", keyword: "Concentration" },
  { matchText: "Strength saving throw", keyword: "Strength Saving Throw" },
  { matchText: "Strength saving throws", keyword: "Strength Saving Throw" },
  { matchText: "Dexterity saving throw", keyword: "Dexterity Saving Throw" },
  { matchText: "Dexterity saving throws", keyword: "Dexterity Saving Throw" },
  { matchText: "Constitution saving throw", keyword: "Constitution Saving Throw" },
  { matchText: "Constitution saving throws", keyword: "Constitution Saving Throw" },
  { matchText: "Intelligence saving throw", keyword: "Intelligence Saving Throw" },
  { matchText: "Intelligence saving throws", keyword: "Intelligence Saving Throw" },
  { matchText: "Wisdom saving throw", keyword: "Wisdom Saving Throw" },
  { matchText: "Wisdom saving throws", keyword: "Wisdom Saving Throw" },
  { matchText: "Charisma saving throw", keyword: "Charisma Saving Throw" },
  { matchText: "Charisma saving throws", keyword: "Charisma Saving Throw" },
  ...Object.keys(keywordDescriptions.damageTypes).map((damageType) => ({
    matchText: damageType,
    keyword: damageType
  })),
  ...Object.keys(keywordDescriptions.skills).map((skill) => ({
    matchText: skill,
    keyword: skill
  })),
  ...Object.keys(keywordDescriptions.conditions).map((condition) => ({
    matchText: condition,
    keyword: condition
  }))
] as const;

function normalizeKeyword(keyword: string): string {
  return keyword.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

const keywordDescriptionLookup = new Map<string, string>();

Object.values(keywordDescriptions).forEach((group) => {
  Object.entries(group).forEach(([keyword, description]) => {
    keywordDescriptionLookup.set(normalizeKeyword(keyword), description);
  });
});

Object.values(WEAPON_BASE).forEach((weaponBase) => {
  const label = weaponBase
    .toLowerCase()
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");

  if (keywordDescriptionLookup.has(normalizeKeyword(label))) {
    return;
  }

  keywordDescriptionLookup.set(
    normalizeKeyword(label),
    `Weapon mastery with the ${label} weapon type. This applies to variants built on that same weapon base.`
  );
});

export function getKeywordDescription(keyword: string): string | null {
  return keywordDescriptionLookup.get(normalizeKeyword(keyword)) ?? null;
}

export function getKeywordReferences(keywords: string[]): KeywordReference[] {
  const seenKeywords = new Set<string>();

  return keywords.flatMap((keyword) => {
    const title = keyword.trim();
    const normalizedKeyword = normalizeKeyword(title);

    if (!title || seenKeywords.has(normalizedKeyword)) {
      return [];
    }

    const description = keywordDescriptionLookup.get(normalizedKeyword);

    if (!description) {
      return [];
    }

    seenKeywords.add(normalizedKeyword);

    return [
      {
        title,
        description
      }
    ];
  });
}
