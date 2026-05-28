import mongoose, { Schema, model, type Model } from "mongoose";
import type {
  MonsterFeatureRecord,
  MonsterRecord,
  MonsterSpeedValue
} from "../types/monster.js";

type MonsterSpeedMap = Record<string, MonsterSpeedValue>;
type MonsterSkillsMap = Record<string, number>;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMonsterSpeedMap(value: unknown): value is MonsterSpeedMap {
  if (!isObjectRecord(value)) {
    return false;
  }

  return Object.values(value).every(
    (speedValue) =>
      typeof speedValue === "boolean" ||
      typeof speedValue === "number" ||
      typeof speedValue === "string"
  );
}

function isMonsterSkillsMap(value: unknown): value is MonsterSkillsMap {
  if (!isObjectRecord(value)) {
    return false;
  }

  return Object.values(value).every((skillValue) => typeof skillValue === "number");
}

function isMonsterFeatureRecord(value: unknown): value is MonsterFeatureRecord {
  if (!isObjectRecord(value)) {
    return false;
  }

  if (typeof value.name !== "string") {
    return false;
  }

  if ("desc" in value && value.desc !== undefined && value.desc !== null && typeof value.desc !== "string") {
    return false;
  }

  if ("attack_bonus" in value && value.attack_bonus !== undefined && typeof value.attack_bonus !== "number") {
    return false;
  }

  if ("damage_dice" in value && value.damage_dice !== undefined && typeof value.damage_dice !== "string") {
    return false;
  }

  if ("damage_bonus" in value && value.damage_bonus !== undefined && typeof value.damage_bonus !== "number") {
    return false;
  }

  return true;
}

function isNullableMonsterFeatureList(value: unknown) {
  return value === null || (Array.isArray(value) && value.every(isMonsterFeatureRecord));
}

function defaultObjectField<T>(validator: (value: unknown) => value is T, message: string) {
  return {
    type: Schema.Types.Mixed,
    default: () => ({}),
    validate: {
      validator: (value: unknown) => value === null || value === undefined || validator(value),
      message
    }
  } as const;
}

function nullableStringField(index = false) {
  return {
    type: String,
    default: null,
    index
  } as const;
}

function blankableStringField(index = false) {
  return {
    type: String,
    default: "",
    index
  } as const;
}

function defaultNumberField(defaultValue: number, index = false) {
  return {
    type: Number,
    default: defaultValue,
    index
  } as const;
}

function nullableNumberField(index = false) {
  return {
    type: Number,
    default: null,
    index
  } as const;
}

const monsterSchema = new Schema<MonsterRecord>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    desc: blankableStringField(),
    size: blankableStringField(),
    type: blankableStringField(true),
    subtype: blankableStringField(),
    group: nullableStringField(),
    alignment: blankableStringField(),
    armor_class: defaultNumberField(0),
    armor_desc: nullableStringField(),
    hit_points: defaultNumberField(0),
    hit_dice: blankableStringField(),
    speed: defaultObjectField(
      isMonsterSpeedMap,
      "speed must be an object whose values are booleans, numbers, or strings."
    ),
    strength: defaultNumberField(10),
    dexterity: defaultNumberField(10),
    constitution: defaultNumberField(10),
    intelligence: defaultNumberField(10),
    wisdom: defaultNumberField(10),
    charisma: defaultNumberField(10),
    strength_save: nullableNumberField(),
    dexterity_save: nullableNumberField(),
    constitution_save: nullableNumberField(),
    intelligence_save: nullableNumberField(),
    wisdom_save: nullableNumberField(),
    charisma_save: nullableNumberField(),
    perception: nullableNumberField(),
    skills: defaultObjectField(isMonsterSkillsMap, "skills must be an object whose values are numbers."),
    damage_vulnerabilities: blankableStringField(),
    damage_resistances: blankableStringField(),
    damage_immunities: blankableStringField(),
    condition_immunities: blankableStringField(),
    senses: blankableStringField(),
    languages: blankableStringField(),
    cr: defaultNumberField(0, true),
    challenge_rating: blankableStringField(true),
    actions: {
      type: Schema.Types.Mixed,
      default: null,
      validate: {
        validator: isNullableMonsterFeatureList,
        message: "actions must be null or a list of monster feature objects."
      }
    },
    bonus_actions: {
      type: Schema.Types.Mixed,
      default: null,
      validate: {
        validator: isNullableMonsterFeatureList,
        message: "bonus_actions must be null or a list of monster feature objects."
      }
    },
    reactions: {
      type: Schema.Types.Mixed,
      default: null,
      validate: {
        validator: isNullableMonsterFeatureList,
        message: "reactions must be null or a list of monster feature objects."
      }
    },
    legendary_desc: nullableStringField(),
    legendary_actions: {
      type: Schema.Types.Mixed,
      default: null,
      validate: {
        validator: isNullableMonsterFeatureList,
        message: "legendary_actions must be null or a list of monster feature objects."
      }
    },
    special_abilities: {
      type: Schema.Types.Mixed,
      default: null,
      validate: {
        validator: isNullableMonsterFeatureList,
        message: "special_abilities must be null or a list of monster feature objects."
      }
    },
    spell_list: {
      type: [String],
      default: []
    },
    page_no: nullableNumberField(),
    environments: {
      type: [String],
      default: []
    },
    img_main: nullableStringField(),
    document__slug: blankableStringField(true),
    document__title: blankableStringField(),
    document__license_url: blankableStringField(),
    document__url: blankableStringField(),
    v2_converted_path: blankableStringField()
  },
  {
    collection: "monsters",
    strict: true,
    minimize: false,
    versionKey: false
  }
);

monsterSchema.index({ name: 1 });
monsterSchema.index({ type: 1, cr: 1, name: 1 });
monsterSchema.index({ document__slug: 1, name: 1 });

export const MonsterModel: Model<MonsterRecord> =
  (mongoose.models.Monster as Model<MonsterRecord> | undefined) ??
  model<MonsterRecord>("Monster", monsterSchema);
