import type { DAMAGE_TYPE, SpellDescriptionEntry, WEAPON_COMBAT_TYPE } from "../codex/entries";
import type { AbilityKey } from "./characters";
import type { SkillName } from "./skills";

export enum STATUS_ENTRY_GROUP {
  EFFECTS = "EFFECTS",
  COMPANIONS = "COMPANIONS",
  REACTIONS = "REACTIONS",
  SENSES = "SENSES",
  AURAS = "AURAS",
  RESISTANCES = "RESISTANCES",
  VULNERABILITIES = "VULNERABILITIES",
  IMMUNITIES = "IMMUNITIES",
  CONDITIONS = "CONDITIONS"
}

export enum STATUS_ENTRY_SOURCE_TYPE {
  MANUAL = "MANUAL",
  FEAT = "FEAT",
  FEATURE = "FEATURE",
  SPECIES = "SPECIES"
}

export enum SENSE {
  DARKVISION = "Darkvision",
  BLINDSIGHT = "Blindsight",
  DEVILS_SIGHT = "Devil's Sight",
  TREMORSENSE = "Tremorsense",
  TRUESIGHT = "Truesight"
}

export enum EFFECT_NAME {
  CONCENTRATION = "Concentration",
  RAGE = "Rage"
}

export enum CONDITION_NAME {
  BLINDED = "Blinded",
  CHARMED = "Charmed",
  DEAFENED = "Deafened",
  EXHAUSTION = "Exhaustion",
  FRIGHTENED = "Frightened",
  GRAPPLED = "Grappled",
  INCAPACITATED = "Incapacitated",
  INVISIBLE = "Invisible",
  PARALYZED = "Paralyzed",
  PETRIFIED = "Petrified",
  POISONED = "Poisoned",
  PRONE = "Prone",
  RESTRAINED = "Restrained",
  STUNNED = "Stunned",
  UNCONSCIOUS = "Unconscious"
}

export enum STATUS_DURATION_KIND {
  INFINITE = "INFINITE",
  CONCENTRATION = "CONCENTRATION",
  LINKED = "LINKED",
  SHORT_REST = "SHORT_REST",
  LONG_REST = "LONG_REST",
  MINUTES = "MINUTES",
  HOURS = "HOURS",
  DAYS = "DAYS",
  ROUNDS = "ROUNDS"
}

export enum STATUS_DURATION_ROUND_TICK {
  ROUND_START = "roundStart",
  ROUND_END = "roundEnd"
}

export enum STATUS_DURATION_PRESET {
  INFINITE = "INFINITE",
  CONCENTRATION = "CONCENTRATION",
  SHORT_REST = "SHORT_REST",
  LONG_REST = "LONG_REST",
  ONE_MINUTE = "ONE_MINUTE",
  TEN_MINUTES = "TEN_MINUTES",
  ONE_HOUR = "ONE_HOUR",
  TWO_HOURS = "TWO_HOURS",
  EIGHT_HOURS = "EIGHT_HOURS",
  TWELVE_HOURS = "TWELVE_HOURS",
  TWENTY_FOUR_HOURS = "TWENTY_FOUR_HOURS",
  ONE_ROUND = "ONE_ROUND",
  TWO_ROUNDS = "TWO_ROUNDS",
  THREE_ROUNDS = "THREE_ROUNDS",
  FOUR_ROUNDS = "FOUR_ROUNDS",
  FIVE_ROUNDS = "FIVE_ROUNDS",
  SIX_ROUNDS = "SIX_ROUNDS",
  SEVEN_ROUNDS = "SEVEN_ROUNDS",
  EIGHT_ROUNDS = "EIGHT_ROUNDS",
  NINE_ROUNDS = "NINE_ROUNDS",
  TEN_ROUNDS = "TEN_ROUNDS",
  ELEVEN_ROUNDS = "ELEVEN_ROUNDS",
  TWELVE_ROUNDS = "TWELVE_ROUNDS",
  THIRTEEN_ROUNDS = "THIRTEEN_ROUNDS",
  FOURTEEN_ROUNDS = "FOURTEEN_ROUNDS",
  FIFTEEN_ROUNDS = "FIFTEEN_ROUNDS",
  SIXTEEN_ROUNDS = "SIXTEEN_ROUNDS",
  SEVENTEEN_ROUNDS = "SEVENTEEN_ROUNDS",
  EIGHTEEN_ROUNDS = "EIGHTEEN_ROUNDS",
  NINETEEN_ROUNDS = "NINETEEN_ROUNDS",
  TWENTY_ROUNDS = "TWENTY_ROUNDS"
}

export type ImmunityValue = DAMAGE_TYPE | CONDITION_NAME;

export type CharacterStatusValue = SENSE | EFFECT_NAME | CONDITION_NAME | DAMAGE_TYPE | string;
export type CharacterStatusSpellTarget = "self" | "other";

export type CharacterCustomTraitRollMode = "normal" | "advantage" | "disadvantage";
export type CharacterCustomTraitValueMode = "buff" | "debuff";
export type CharacterCustomTraitSkillGroupAbility = Exclude<AbilityKey, "CON">;
export const characterCustomTraitDiceValues = [
  "1d4",
  "1d6",
  "1d8",
  "1d10",
  "1d12",
  "1d20"
] as const;
export type CharacterCustomTraitDiceValue = (typeof characterCustomTraitDiceValues)[number];
export type CharacterCustomTraitEffectValue = number | AbilityKey | CharacterCustomTraitDiceValue;

type CharacterCustomTraitEffectRoll = {
  rollMode?: CharacterCustomTraitRollMode;
};

type CharacterCustomTraitNumericValue = {
  value: number;
  valueMode?: CharacterCustomTraitValueMode;
};

type CharacterCustomTraitFlexibleValue = {
  value: CharacterCustomTraitEffectValue;
  valueMode?: CharacterCustomTraitValueMode;
};

export type CharacterCustomTraitEffect =
  | {
      type: "actualMaxHitPoints";
    } & CharacterCustomTraitNumericValue &
      CharacterCustomTraitEffectRoll
  | {
      type: "armorClass";
    } & CharacterCustomTraitFlexibleValue &
      CharacterCustomTraitEffectRoll
  | {
      type: "initiative";
    } & CharacterCustomTraitFlexibleValue &
      CharacterCustomTraitEffectRoll
  | {
      type: "passivePerception";
    } & CharacterCustomTraitFlexibleValue &
      CharacterCustomTraitEffectRoll
  | {
      type: "speed";
    } & CharacterCustomTraitFlexibleValue &
      CharacterCustomTraitEffectRoll
  | {
      type: "spellAttack";
    } & CharacterCustomTraitFlexibleValue &
      CharacterCustomTraitEffectRoll
  | {
      type: "spellDc";
    } & CharacterCustomTraitFlexibleValue &
      CharacterCustomTraitEffectRoll
  | {
      type: "abilityScore";
      ability: AbilityKey;
    } & CharacterCustomTraitNumericValue &
      CharacterCustomTraitEffectRoll
  | {
      type: "abilityModifier";
      ability: AbilityKey;
    } & CharacterCustomTraitNumericValue &
      CharacterCustomTraitEffectRoll
  | {
      type: "savingThrow";
      ability: AbilityKey;
    } & CharacterCustomTraitFlexibleValue &
      CharacterCustomTraitEffectRoll
  | {
      type: "savingThrows";
    } & CharacterCustomTraitFlexibleValue &
      CharacterCustomTraitEffectRoll
  | {
      type: "skill";
      skill: SkillName;
    } & CharacterCustomTraitFlexibleValue &
      CharacterCustomTraitEffectRoll
  | {
      type: "skillGroup";
      ability: CharacterCustomTraitSkillGroupAbility;
    } & CharacterCustomTraitFlexibleValue &
      CharacterCustomTraitEffectRoll
  | {
      type: "weaponDamage";
      attackKind: "unarmed" | WEAPON_COMBAT_TYPE.MELEE | WEAPON_COMBAT_TYPE.RANGED;
    } & CharacterCustomTraitFlexibleValue &
      CharacterCustomTraitEffectRoll;

export type CharacterStatusDuration =
  | {
      kind: STATUS_DURATION_KIND.INFINITE;
    }
  | {
      kind: STATUS_DURATION_KIND.CONCENTRATION;
    }
  | {
      kind: STATUS_DURATION_KIND.LINKED;
      linkedGroup: STATUS_ENTRY_GROUP;
      linkedValue: CharacterStatusValue;
    }
  | {
      kind: STATUS_DURATION_KIND.SHORT_REST;
    }
  | {
      kind: STATUS_DURATION_KIND.LONG_REST;
    }
  | {
      kind: STATUS_DURATION_KIND.MINUTES;
      amount: number;
    }
  | {
      kind: STATUS_DURATION_KIND.HOURS;
      amount: number;
    }
  | {
      kind: STATUS_DURATION_KIND.DAYS;
      amount: number;
    }
  | {
      kind: STATUS_DURATION_KIND.ROUNDS;
      amount: number;
      tickOn?: STATUS_DURATION_ROUND_TICK;
    };

export type CharacterStatusEntry = {
  id: string;
  group: STATUS_ENTRY_GROUP;
  value: CharacterStatusValue;
  conditionLevel?: number | null;
  disabled?: boolean;
  disabledReason?: string;
  source: string;
  sourceType: STATUS_ENTRY_SOURCE_TYPE;
  duration: CharacterStatusDuration;
  sourceId?: string;
  sourceSpellId?: string;
  sourceSpellSlotLevel?: number | null;
  sourceSpellTarget?: CharacterStatusSpellTarget | null;
  sourceSpellSkill?: SkillName | null;
  rangeFeet?: number | null;
  description?: string;
  descriptionAdditions?: SpellDescriptionEntry[][];
  customEffects?: CharacterCustomTraitEffect[];
  notes?: string;
  runtimeOverride?: boolean;
  runtimeOverrideKey?: string;
};
