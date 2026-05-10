import { ACTION_CATEGORY, type ActionCategory } from "./actionEconomy";

export enum ACTION_CARD_THEME {
  FEATURE = "feature",
  ATTACK = "attack",
  MAGIC = "magic",
  UTIL = "util",
  HEAL = "heal",
  DEFENSE = "defense",
  WEAPON = "weapon"
}

export const actionCardThemes = Object.values(ACTION_CARD_THEME);

type ThemeCandidateConfig = {
  kind?: string;
  description?: unknown;
  descriptionAdditions?: unknown;
  effectKind?: string;
  formKind?: string;
  label?: string;
  confirmLabel?: string;
  actionLabel?: string;
  actionContextText?: string;
  actionAvailabilityText?: string;
  spellId?: string;
  spellSource?: string;
};

export type ActionCardThemeCandidate = {
  cardTheme?: ACTION_CARD_THEME;
  key?: string;
  name?: string;
  summary?: string;
  detail?: string;
  breakdown?: string;
  valueLabel?: string;
  resultLabel?: string;
  rangeResultLabel?: string;
  description?: unknown;
  descriptionAdditions?: unknown;
  actionCategory?: ActionCategory;
  drawer?: ThemeCandidateConfig;
  execute?: ThemeCandidateConfig;
};

const explicitActionCardThemeByKey: Record<string, ACTION_CARD_THEME> = {
  "common-action-attack": ACTION_CARD_THEME.ATTACK,
  "common-action-dash": ACTION_CARD_THEME.UTIL,
  "common-action-disengage": ACTION_CARD_THEME.UTIL,
  "common-action-dodge": ACTION_CARD_THEME.UTIL,
  "common-action-help": ACTION_CARD_THEME.UTIL,
  "common-action-hide": ACTION_CARD_THEME.UTIL,
  "common-action-influence": ACTION_CARD_THEME.UTIL,
  "common-action-magic": ACTION_CARD_THEME.MAGIC,
  "common-action-ready": ACTION_CARD_THEME.UTIL,
  "common-action-search": ACTION_CARD_THEME.UTIL,
  "common-action-study": ACTION_CARD_THEME.UTIL,
  "common-action-utilize": ACTION_CARD_THEME.UTIL,

  "divine-spark": ACTION_CARD_THEME.MAGIC,
  "turn-undead": ACTION_CARD_THEME.MAGIC,
  "dragonborn-breath-weapon": ACTION_CARD_THEME.ATTACK,
  "dragonborn-draconic-flight": ACTION_CARD_THEME.UTIL,
  "species-goliath-clouds-jaunt": ACTION_CARD_THEME.UTIL,
  "species-goliath-stones-endurance": ACTION_CARD_THEME.DEFENSE,
  "species-goliath-storms-thunder": ACTION_CARD_THEME.ATTACK,
  "species-goliath-large-form": ACTION_CARD_THEME.FEATURE,

  "druid-wild-shape": ACTION_CARD_THEME.FEATURE,
  "druid-wild-companion": ACTION_CARD_THEME.MAGIC,
  "druid-wild-resurgence": ACTION_CARD_THEME.UTIL,
  "druid-nature-magician": ACTION_CARD_THEME.MAGIC,

  "barbarian-rage": ACTION_CARD_THEME.ATTACK,
  "barbarian-brutal-strike": ACTION_CARD_THEME.ATTACK,

  "fighter-action-surge": ACTION_CARD_THEME.UTIL,
  "fighter-second-wind": ACTION_CARD_THEME.HEAL,
  "fighter-tactical-mind": ACTION_CARD_THEME.UTIL,
  "fighter-indomitable": ACTION_CARD_THEME.UTIL,

  "monk-flurry-of-blows": ACTION_CARD_THEME.ATTACK,
  "monk-patient-defense": ACTION_CARD_THEME.UTIL,
  "monk-step-of-the-wind": ACTION_CARD_THEME.UTIL,
  "monk-superior-defense": ACTION_CARD_THEME.DEFENSE,

  "paladin-lay-on-hands": ACTION_CARD_THEME.HEAL,
  "paladin-channel-divinity": ACTION_CARD_THEME.MAGIC,
  "paladin-paladins-smite": ACTION_CARD_THEME.MAGIC,
  "paladin-faithful-steed": ACTION_CARD_THEME.MAGIC,
  "paladin-abjure-foes": ACTION_CARD_THEME.MAGIC,

  "ranger-favored-enemy": ACTION_CARD_THEME.MAGIC,
  "ranger-tireless": ACTION_CARD_THEME.DEFENSE,

  "warlock-magical-cunning": ACTION_CARD_THEME.UTIL,
  "warlock-contact-patron": ACTION_CARD_THEME.MAGIC,

  "rogue-sneak-attack": ACTION_CARD_THEME.ATTACK,
  "rogue-steady-aim": ACTION_CARD_THEME.ATTACK,
  "rogue-stroke-of-luck": ACTION_CARD_THEME.UTIL,

  "sorcerer-innate-sorcery": ACTION_CARD_THEME.MAGIC,
  "sorcerer-font-of-magic": ACTION_CARD_THEME.MAGIC,
  "sorcerer-metamagic": ACTION_CARD_THEME.MAGIC,

  "wizard-arcane-recovery": ACTION_CARD_THEME.MAGIC
};

const explicitActionCardThemeByName: Record<string, ACTION_CARD_THEME> = {
  "abjure foes": ACTION_CARD_THEME.MAGIC,
  "arcane recovery": ACTION_CARD_THEME.MAGIC,
  "arcane ward": ACTION_CARD_THEME.DEFENSE,
  "awakened mind": ACTION_CARD_THEME.UTIL,
  "bardic inspiration": ACTION_CARD_THEME.UTIL,
  "bastion of law": ACTION_CARD_THEME.DEFENSE,
  "blessing of moonlight": ACTION_CARD_THEME.MAGIC,
  "bladesong": ACTION_CARD_THEME.UTIL,
  "blessing of the trickster": ACTION_CARD_THEME.MAGIC,
  "breath weapon": ACTION_CARD_THEME.ATTACK,
  "brutal strike": ACTION_CARD_THEME.ATTACK,
  "bulwark of force": ACTION_CARD_THEME.DEFENSE,
  "celestial revelation": ACTION_CARD_THEME.FEATURE,
  "channel divinity": ACTION_CARD_THEME.MAGIC,
  "cloak of shadow": ACTION_CARD_THEME.UTIL,
  "command primal companion": ACTION_CARD_THEME.UTIL,
  "cloud's jaunt": ACTION_CARD_THEME.UTIL,
  "combat superiority": ACTION_CARD_THEME.ATTACK,
  "dark one's own luck": ACTION_CARD_THEME.UTIL,
  "divine foreknowledge": ACTION_CARD_THEME.MAGIC,
  "divine intervention": ACTION_CARD_THEME.MAGIC,
  "divine spark": ACTION_CARD_THEME.MAGIC,
  "dragon wings": ACTION_CARD_THEME.UTIL,
  "elemental attunement": ACTION_CARD_THEME.MAGIC,
  "elemental burst": ACTION_CARD_THEME.MAGIC,
  "elder champion": ACTION_CARD_THEME.FEATURE,
  "faithful steed": ACTION_CARD_THEME.MAGIC,
  "favored enemy": ACTION_CARD_THEME.MAGIC,
  "flurry of blows": ACTION_CARD_THEME.ATTACK,
  "font of magic": ACTION_CARD_THEME.MAGIC,
  "fortifying soul": ACTION_CARD_THEME.HEAL,
  "gaze of two minds": ACTION_CARD_THEME.UTIL,
  "gift of the protectors": ACTION_CARD_THEME.MAGIC,
  "hand of healing": ACTION_CARD_THEME.HEAL,
  "hand of ultimate justice": ACTION_CARD_THEME.ATTACK,
  "healing hands": ACTION_CARD_THEME.HEAL,
  "healing light": ACTION_CARD_THEME.HEAL,
  "holy nimbus": ACTION_CARD_THEME.ATTACK,
  "hurl through hell": ACTION_CARD_THEME.ATTACK,
  "improve fate": ACTION_CARD_THEME.UTIL,
  "indomitable": ACTION_CARD_THEME.UTIL,
  "innate sorcery": ACTION_CARD_THEME.MAGIC,
  "intimidating presence": ACTION_CARD_THEME.ATTACK,
  "invoke duplicity": ACTION_CARD_THEME.MAGIC,
  "lay on hands": ACTION_CARD_THEME.HEAL,
  "large form": ACTION_CARD_THEME.FEATURE,
  "lands aid": ACTION_CARD_THEME.HEAL,
  "know your enemy": ACTION_CARD_THEME.UTIL,
  "lucky": ACTION_CARD_THEME.UTIL,
  "lunar vitality": ACTION_CARD_THEME.HEAL,
  "mantle of inspiration": ACTION_CARD_THEME.DEFENSE,
  "mantle of majesty": ACTION_CARD_THEME.MAGIC,
  "magical cunning": ACTION_CARD_THEME.UTIL,
  "moonlight step": ACTION_CARD_THEME.UTIL,
  "metamagic": ACTION_CARD_THEME.MAGIC,
  "mystic arcanum": ACTION_CARD_THEME.MAGIC,
  "nature magician": ACTION_CARD_THEME.MAGIC,
  "nature's sanctuary": ACTION_CARD_THEME.MAGIC,
  "nature's veil": ACTION_CARD_THEME.UTIL,
  "noble scion": ACTION_CARD_THEME.FEATURE,
  "paladin's smite": ACTION_CARD_THEME.MAGIC,
  "patient defense": ACTION_CARD_THEME.UTIL,
  "peerless athlete": ACTION_CARD_THEME.UTIL,
  "portent": ACTION_CARD_THEME.UTIL,
  "psi-powered leap": ACTION_CARD_THEME.UTIL,
  "psychic teleportation": ACTION_CARD_THEME.UTIL,
  "psychic veil": ACTION_CARD_THEME.UTIL,
  "psychic whispers": ACTION_CARD_THEME.UTIL,
  "rage": ACTION_CARD_THEME.ATTACK,
  "recover vitality": ACTION_CARD_THEME.HEAL,
  "relentless rage": ACTION_CARD_THEME.UTIL,
  "revelation in flesh": ACTION_CARD_THEME.MAGIC,
  "revive primal companion": ACTION_CARD_THEME.HEAL,
  "sacred weapon": ACTION_CARD_THEME.ATTACK,
  "second wind": ACTION_CARD_THEME.HEAL,
  "searing vengeance": ACTION_CARD_THEME.HEAL,
  "shadow step": ACTION_CARD_THEME.UTIL,
  "sneak attack": ACTION_CARD_THEME.ATTACK,
  "speedy recovery": ACTION_CARD_THEME.HEAL,
  "starry form": ACTION_CARD_THEME.MAGIC,
  "step of the wind": ACTION_CARD_THEME.UTIL,
  "stone's endurance": ACTION_CARD_THEME.DEFENSE,
  "stonecunning": ACTION_CARD_THEME.UTIL,
  "superior defense": ACTION_CARD_THEME.DEFENSE,
  "tactical mind": ACTION_CARD_THEME.UTIL,
  "telekinetic movement": ACTION_CARD_THEME.UTIL,
  "telekinetic shove": ACTION_CARD_THEME.ATTACK,
  "third eye": ACTION_CARD_THEME.UTIL,
  "tireless": ACTION_CARD_THEME.DEFENSE,
  "travel along the tree": ACTION_CARD_THEME.UTIL,
  "trance of order": ACTION_CARD_THEME.MAGIC,
  "turn undead": ACTION_CARD_THEME.MAGIC,
  "undying sentinel": ACTION_CARD_THEME.HEAL,
  "war priest": ACTION_CARD_THEME.ATTACK,
  "warping implosion": ACTION_CARD_THEME.ATTACK,
  "warrior of the gods": ACTION_CARD_THEME.HEAL,
  "wholeness of body": ACTION_CARD_THEME.HEAL,
  "wild companion": ACTION_CARD_THEME.MAGIC,
  "wild resurgence": ACTION_CARD_THEME.UTIL,
  "wild shape": ACTION_CARD_THEME.FEATURE,
  "wrath of the sea": ACTION_CARD_THEME.ATTACK,
  "vow of enmity": ACTION_CARD_THEME.ATTACK
};

const attackActionPattern = /\battack action\b/;
const magicActionPattern = /\bmagic action\b/;
const spellDrivenPattern = /\b(cast|casts|casting|open)\b[\s\S]{0,48}\b(spell|cantrip|smite|mark|steed|familiar|mage armor|false life|darkness)\b/;
const healPattern =
  /\b(heal|healing|heals|regain(?:s|ed|ing)? hit points?|regain(?:s|ed|ing)? hp|restore(?:s|d|ing)? hit points?|revive|vitality|lay on hands|second wind|preserve life|wholeness of body|restoring touch|healing light)\b/;
const defensePattern =
  /\b(temporary hit points?|temp hp|thp|resist|resistance|resistances|resistant|immune|immunity|immunities|reduce(?:s|d|ing)? (?:the |incoming |that )?damage|damage (?:reduction|reduced)|prevent(?:s|ed|ing)? (?:the )?damage|stone's endurance|arcane ward|bastion of law|bulwark of force|superior defense|tireless|mantle of inspiration)\b/;
const attackPattern =
  /\b(attack|attacks|damage|damaging|strike|foe|foes|enemy|enemies|burst|blast|thunder|radiance|wrath|implosion|breath weapon|flurry|brutal|rend|hurl through hell)\b/;
const utilPattern =
  /\b(dash|disengage|hide|search|study|utilize|influence|help|ready|teleport|move|movement|speed|flight|fly|jump|companion|steed|tremorsense|skill|ability check|saving throw|save reroll|d20 test|d20 roll|tool|form|shape|transform|recover spell|spell slot|resource|convert)\b/;
const magicPattern =
  /\b(spell|cantrip|ritual|arcane|sorcery|sorcerer|metamagic|mystic|channel divinity|divine intervention|invocation|psionic|elemental|celestial|illusion)\b/;

function normalizeThemeLookupValue(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function stringifyThemeCandidateValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(stringifyThemeCandidateValue).filter(Boolean).join(" ");
  }

  if (value && typeof value === "object") {
    return Object.values(value).map(stringifyThemeCandidateValue).filter(Boolean).join(" ");
  }

  return "";
}

function getCandidateText(action: ActionCardThemeCandidate): string {
  return [
    action.key,
    action.name,
    action.summary,
    action.detail,
    action.breakdown,
    action.valueLabel,
    action.resultLabel,
    action.rangeResultLabel,
    stringifyThemeCandidateValue(action.description),
    stringifyThemeCandidateValue(action.descriptionAdditions),
    action.drawer?.kind,
    action.drawer?.formKind,
    stringifyThemeCandidateValue(action.drawer?.description),
    stringifyThemeCandidateValue(action.drawer?.descriptionAdditions),
    action.drawer?.confirmLabel,
    action.execute?.kind,
    action.execute?.label,
    action.execute?.actionLabel,
    action.execute?.actionContextText,
    action.execute?.actionAvailabilityText,
    action.execute?.formKind,
    action.execute?.effectKind,
    action.execute?.spellId,
    action.execute?.spellSource
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isSpellDrivenAction(action: ActionCardThemeCandidate, candidateText: string): boolean {
  return (
    action.drawer?.kind === "spell-list" ||
    action.execute?.kind === "spell" ||
    Boolean(action.execute?.spellId) ||
    spellDrivenPattern.test(candidateText)
  );
}

export function resolveActionCardTheme(
  action: ActionCardThemeCandidate,
  fallbackTheme: ACTION_CARD_THEME = ACTION_CARD_THEME.FEATURE
): ACTION_CARD_THEME {
  if (action.cardTheme) {
    return action.cardTheme;
  }

  const keyTheme = explicitActionCardThemeByKey[normalizeThemeLookupValue(action.key)];

  if (keyTheme) {
    return keyTheme;
  }

  const nameTheme = explicitActionCardThemeByName[normalizeThemeLookupValue(action.name)];

  if (nameTheme) {
    return nameTheme;
  }

  const candidateText = getCandidateText(action);
  const isAttackAction = attackActionPattern.test(candidateText);
  const isMagicAction = magicActionPattern.test(candidateText);
  const isSpellDriven = isSpellDrivenAction(action, candidateText);

  if (isSpellDriven) {
    return ACTION_CARD_THEME.MAGIC;
  }

  if (healPattern.test(candidateText)) {
    return ACTION_CARD_THEME.HEAL;
  }

  if (defensePattern.test(candidateText)) {
    return ACTION_CARD_THEME.DEFENSE;
  }

  if (isAttackAction || action.actionCategory === ACTION_CATEGORY.ATTACK) {
    return ACTION_CARD_THEME.ATTACK;
  }

  if (isMagicAction || action.actionCategory === ACTION_CATEGORY.MAGIC) {
    return ACTION_CARD_THEME.MAGIC;
  }

  if (attackPattern.test(candidateText)) {
    return ACTION_CARD_THEME.ATTACK;
  }

  if (magicPattern.test(candidateText)) {
    return ACTION_CARD_THEME.MAGIC;
  }

  if (
    utilPattern.test(candidateText) ||
    action.actionCategory === ACTION_CATEGORY.UTILITY ||
    action.actionCategory === ACTION_CATEGORY.INTERACTION
  ) {
    return ACTION_CARD_THEME.UTIL;
  }

  return fallbackTheme;
}
