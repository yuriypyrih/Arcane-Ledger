import mongoose, { Schema, model, type Model } from "mongoose";
import type {
  MonsterActionRecord,
  MonsterAttackRecord,
  MonsterRecord,
  MonsterSpeedMap,
  MonsterTraitRecord,
  MonsterV2Reference
} from "../types/monster.js";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumberOrNull(value: unknown) {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isStringOrNull(value: unknown) {
  return value === null || typeof value === "string";
}

function isNullableObjectRecord(value: unknown) {
  return value === null || value === undefined || isObjectRecord(value);
}

function isV2Reference(value: unknown): value is MonsterV2Reference {
  if (!isObjectRecord(value)) {
    return false;
  }

  if (
    "name" in value &&
    value.name !== null &&
    value.name !== undefined &&
    typeof value.name !== "string"
  ) {
    return false;
  }

  if (
    "key" in value &&
    value.key !== null &&
    value.key !== undefined &&
    typeof value.key !== "string"
  ) {
    return false;
  }

  return true;
}

function isRequiredV2Reference(value: unknown) {
  return isV2Reference(value) && typeof value.name === "string" && typeof value.key === "string";
}

function isV2ReferenceList(value: unknown) {
  return Array.isArray(value) && value.every(isV2Reference);
}

function isStringList(value: unknown) {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isNumberMap(value: unknown) {
  if (!isObjectRecord(value)) {
    return false;
  }

  return Object.values(value).every(
    (entry) => entry === null || entry === undefined || typeof entry === "number"
  );
}

function isSpeedMap(value: unknown): value is MonsterSpeedMap {
  if (!isObjectRecord(value)) {
    return false;
  }

  return Object.values(value).every(
    (entry) =>
      entry === null ||
      entry === undefined ||
      typeof entry === "boolean" ||
      typeof entry === "number" ||
      typeof entry === "string"
  );
}

function isLanguagesRecord(value: unknown) {
  if (!isObjectRecord(value)) {
    return false;
  }

  if ("as_string" in value && !isStringOrNull(value.as_string)) {
    return false;
  }

  if ("data" in value && value.data !== undefined && !isV2ReferenceList(value.data)) {
    return false;
  }

  return true;
}

function isResistancesAndImmunitiesRecord(value: unknown) {
  if (!isObjectRecord(value)) {
    return false;
  }

  return Object.entries(value).every(([key, entry]) => {
    if (key.endsWith("_display")) {
      return isStringOrNull(entry);
    }

    return entry === undefined || isV2ReferenceList(entry);
  });
}

function isUsageLimitsRecord(value: unknown) {
  if (value === null || value === undefined) {
    return true;
  }

  if (!isObjectRecord(value)) {
    return false;
  }

  if ("type" in value && !isStringOrNull(value.type)) {
    return false;
  }

  if (
    "param" in value &&
    value.param !== null &&
    value.param !== undefined &&
    typeof value.param !== "number" &&
    typeof value.param !== "string"
  ) {
    return false;
  }

  return true;
}

function isAttackRecord(value: unknown): value is MonsterAttackRecord {
  if (!isObjectRecord(value)) {
    return false;
  }

  const nullableNumberFields = [
    "to_hit_mod",
    "reach",
    "range",
    "long_range",
    "damage_die_count",
    "damage_bonus",
    "extra_damage_die_count",
    "extra_damage_bonus"
  ];

  if ("name" in value && !isStringOrNull(value.name)) {
    return false;
  }

  if ("attack_type" in value && !isStringOrNull(value.attack_type)) {
    return false;
  }

  if ("damage_die_type" in value && !isStringOrNull(value.damage_die_type)) {
    return false;
  }

  if ("extra_damage_die_type" in value && !isStringOrNull(value.extra_damage_die_type)) {
    return false;
  }

  if ("distance_unit" in value && !isStringOrNull(value.distance_unit)) {
    return false;
  }

  if (
    "target_creature_only" in value &&
    value.target_creature_only !== null &&
    typeof value.target_creature_only !== "boolean"
  ) {
    return false;
  }

  if (
    "damage_type" in value &&
    value.damage_type !== null &&
    value.damage_type !== undefined &&
    !isV2Reference(value.damage_type)
  ) {
    return false;
  }

  if (
    "extra_damage_type" in value &&
    value.extra_damage_type !== null &&
    value.extra_damage_type !== undefined &&
    !isV2Reference(value.extra_damage_type)
  ) {
    return false;
  }

  return nullableNumberFields.every((field) => !(field in value) || isNumberOrNull(value[field]));
}

function isActionRecord(value: unknown): value is MonsterActionRecord {
  if (!isObjectRecord(value)) {
    return false;
  }

  if ("name" in value && !isStringOrNull(value.name)) {
    return false;
  }

  if ("desc" in value && !isStringOrNull(value.desc)) {
    return false;
  }

  if (
    "attacks" in value &&
    value.attacks !== undefined &&
    (!Array.isArray(value.attacks) || !value.attacks.every(isAttackRecord))
  ) {
    return false;
  }

  if ("action_type" in value && !isStringOrNull(value.action_type)) {
    return false;
  }

  if ("order_in_statblock" in value && !isNumberOrNull(value.order_in_statblock)) {
    return false;
  }

  if ("legendary_action_cost" in value && !isNumberOrNull(value.legendary_action_cost)) {
    return false;
  }

  if ("limited_to_form" in value && !isStringOrNull(value.limited_to_form)) {
    return false;
  }

  return isUsageLimitsRecord(value.usage_limits);
}

function isTraitRecord(value: unknown): value is MonsterTraitRecord {
  if (!isObjectRecord(value)) {
    return false;
  }

  if ("name" in value && !isStringOrNull(value.name)) {
    return false;
  }

  return !("desc" in value) || isStringOrNull(value.desc);
}

function isNullableActionList(value: unknown) {
  return value === null || value === undefined || (Array.isArray(value) && value.every(isActionRecord));
}

function isNullableTraitList(value: unknown) {
  return value === null || value === undefined || (Array.isArray(value) && value.every(isTraitRecord));
}

function optionalMixedField(validator: (value: unknown) => boolean, message: string) {
  return {
    type: Schema.Types.Mixed,
    default: undefined,
    validate: {
      validator: (value: unknown) => value === null || value === undefined || validator(value),
      message
    }
  } as const;
}

const monsterSchema = new Schema<MonsterRecord>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      index: true
    },
    ability_scores: optionalMixedField(
      isNumberMap,
      "ability_scores must be an object whose values are numbers or null."
    ),
    actions: optionalMixedField(isNullableActionList, "actions must be a list of V2 monster action objects."),
    alignment: {
      type: String,
      default: null
    },
    armor_class: {
      type: Number,
      default: null
    },
    armor_detail: {
      type: String,
      default: null
    },
    blindsight_range: {
      type: Number,
      default: null
    },
    category: {
      type: String,
      default: null,
      index: true
    },
    challenge_rating: {
      type: Schema.Types.Mixed,
      default: null,
      index: true,
      validate: {
        validator: (value: unknown) =>
          value === null || value === undefined || typeof value === "number" || typeof value === "string",
        message: "challenge_rating must be a number, string, null, or undefined."
      }
    },
    creaturesets: optionalMixedField(isStringList, "creaturesets must be a list of strings."),
    darkvision_range: {
      type: Number,
      default: null
    },
    document: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: isRequiredV2Reference,
        message: "document must be a V2 reference with name and key."
      }
    },
    environments: optionalMixedField(isV2ReferenceList, "environments must be a list of V2 references."),
    experience_points: {
      type: Number,
      default: null
    },
    hit_dice: {
      type: String,
      default: null
    },
    hit_points: {
      type: Number,
      default: null
    },
    illustration: optionalMixedField(isNullableObjectRecord, "illustration must be an object or null."),
    initiative_bonus: {
      type: Number,
      default: null
    },
    languages: optionalMixedField(isLanguagesRecord, "languages must be a V2 languages object."),
    modifiers: optionalMixedField(isNumberMap, "modifiers must be an object whose values are numbers or null."),
    normal_sight_range: {
      type: Number,
      default: null
    },
    passive_perception: {
      type: Number,
      default: null
    },
    proficiency_bonus: {
      type: Number,
      default: null
    },
    resistances_and_immunities: optionalMixedField(
      isResistancesAndImmunitiesRecord,
      "resistances_and_immunities must be a V2 resistance/immunity object."
    ),
    saving_throws: optionalMixedField(isNumberMap, "saving_throws must be an object whose values are numbers or null."),
    saving_throws_all: optionalMixedField(
      isNumberMap,
      "saving_throws_all must be an object whose values are numbers or null."
    ),
    size: {
      type: Schema.Types.Mixed,
      default: null,
      validate: {
        validator: (value: unknown) => value === null || value === undefined || isV2Reference(value),
        message: "size must be a V2 reference or null."
      }
    },
    skill_bonuses: optionalMixedField(isNumberMap, "skill_bonuses must be an object whose values are numbers or null."),
    skill_bonuses_all: optionalMixedField(
      isNumberMap,
      "skill_bonuses_all must be an object whose values are numbers or null."
    ),
    speed: optionalMixedField(isSpeedMap, "speed must be an object whose values are booleans, numbers, strings, or null."),
    speed_all: optionalMixedField(
      isSpeedMap,
      "speed_all must be an object whose values are booleans, numbers, strings, or null."
    ),
    subcategory: {
      type: String,
      default: null
    },
    traits: optionalMixedField(isNullableTraitList, "traits must be a list of V2 trait objects."),
    tremorsense_range: {
      type: Number,
      default: null
    },
    truesight_range: {
      type: Number,
      default: null
    },
    type: {
      type: Schema.Types.Mixed,
      default: null,
      validate: {
        validator: (value: unknown) => value === null || value === undefined || isV2Reference(value),
        message: "type must be a V2 reference or null."
      }
    }
  },
  {
    collection: "monsters",
    strict: false,
    minimize: false,
    versionKey: false
  }
);

monsterSchema.index({ "document.key": 1, name: 1 });
monsterSchema.index({ "type.key": 1, challenge_rating: 1, name: 1 });

export const MonsterModel: Model<MonsterRecord> =
  (mongoose.models.Monster as Model<MonsterRecord> | undefined) ??
  model<MonsterRecord>("Monster", monsterSchema);
