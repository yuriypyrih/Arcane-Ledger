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

  if (typeof value.name !== "string" || typeof value.desc !== "string") {
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
    desc: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      index: true
    },
    subtype: blankableStringField(),
    group: nullableStringField(),
    alignment: {
      type: String,
      required: true
    },
    armor_class: {
      type: Number,
      required: true
    },
    armor_desc: nullableStringField(),
    hit_points: {
      type: Number,
      required: true
    },
    hit_dice: {
      type: String,
      required: true
    },
    speed: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: isMonsterSpeedMap,
        message: "speed must be an object whose values are booleans, numbers, or strings."
      }
    },
    strength: {
      type: Number,
      required: true
    },
    dexterity: {
      type: Number,
      required: true
    },
    constitution: {
      type: Number,
      required: true
    },
    intelligence: {
      type: Number,
      required: true
    },
    wisdom: {
      type: Number,
      required: true
    },
    charisma: {
      type: Number,
      required: true
    },
    strength_save: nullableNumberField(),
    dexterity_save: nullableNumberField(),
    constitution_save: nullableNumberField(),
    intelligence_save: nullableNumberField(),
    wisdom_save: nullableNumberField(),
    charisma_save: nullableNumberField(),
    perception: nullableNumberField(),
    skills: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: isMonsterSkillsMap,
        message: "skills must be an object whose values are numbers."
      }
    },
    damage_vulnerabilities: blankableStringField(),
    damage_resistances: blankableStringField(),
    damage_immunities: blankableStringField(),
    condition_immunities: blankableStringField(),
    senses: {
      type: String,
      required: true
    },
    languages: {
      type: String,
      required: true
    },
    cr: {
      type: Number,
      required: true,
      index: true
    },
    challenge_rating: {
      type: String,
      required: true,
      index: true
    },
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
      required: true
    },
    page_no: nullableNumberField(),
    environments: {
      type: [String],
      required: true
    },
    img_main: nullableStringField(),
    document__slug: {
      type: String,
      required: true,
      index: true
    },
    document__title: {
      type: String,
      required: true
    },
    document__license_url: {
      type: String,
      required: true
    },
    document__url: {
      type: String,
      required: true
    },
    v2_converted_path: {
      type: String,
      required: true
    }
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
