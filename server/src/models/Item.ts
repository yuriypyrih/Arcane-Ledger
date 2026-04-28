import mongoose, { Schema, model, type Model } from "mongoose";
import type {
  Open5eItemArmorRecord,
  Open5eItemRecord,
  Open5eItemWeaponPropertyRecord,
  Open5eItemWeaponRecord,
  Open5eWeaponPropertyReference
} from "../types/item.js";
import type { Open5eDocumentReference, Open5eKeyedReference } from "../types/open5e.js";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOpen5eKeyedReference(value: unknown): value is Open5eKeyedReference {
  return (
    isObjectRecord(value) &&
    typeof value.name === "string" &&
    typeof value.key === "string" &&
    typeof value.url === "string"
  );
}

function isNullableOpen5eKeyedReference(value: unknown) {
  return value === null || isOpen5eKeyedReference(value);
}

function isOpen5eDocumentReference(value: unknown): value is Open5eDocumentReference {
  if (!isObjectRecord(value) || typeof value.name !== "string" || typeof value.key !== "string") {
    return false;
  }

  if ("publisher" in value && value.publisher !== undefined && value.publisher !== null && !isOpen5eKeyedReference(value.publisher)) {
    return false;
  }

  if (
    "gamesystem" in value &&
    value.gamesystem !== undefined &&
    value.gamesystem !== null &&
    !isOpen5eKeyedReference(value.gamesystem)
  ) {
    return false;
  }

  return true;
}

function isOpen5eWeaponPropertyReference(value: unknown): value is Open5eWeaponPropertyReference {
  return (
    isObjectRecord(value) &&
    typeof value.name === "string" &&
    typeof value.url === "string" &&
    (!("type" in value) || value.type === null || typeof value.type === "string") &&
    (!("desc" in value) || value.desc === null || typeof value.desc === "string")
  );
}

function isOpen5eItemWeaponPropertyRecord(value: unknown): value is Open5eItemWeaponPropertyRecord {
  return (
    isObjectRecord(value) &&
    isOpen5eWeaponPropertyReference(value.property) &&
    (value.detail === null || typeof value.detail === "string")
  );
}

function isOpen5eItemWeaponPropertyRecordList(value: unknown) {
  return Array.isArray(value) && value.every(isOpen5eItemWeaponPropertyRecord);
}

function isOpen5eItemWeaponRecord(value: unknown): value is Open5eItemWeaponRecord {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    typeof value.name === "string" &&
    typeof value.key === "string" &&
    typeof value.url === "string" &&
    typeof value.damage_dice === "string" &&
    isOpen5eKeyedReference(value.damage_type) &&
    typeof value.distance_unit === "string" &&
    typeof value.is_improvised === "boolean" &&
    typeof value.is_martial === "boolean" &&
    typeof value.is_simple === "boolean" &&
    isOpen5eItemWeaponPropertyRecordList(value.properties)
  );
}

function isNullableOpen5eItemWeaponRecord(value: unknown) {
  return value === null || isOpen5eItemWeaponRecord(value);
}

function isOpen5eItemArmorRecord(value: unknown): value is Open5eItemArmorRecord {
  if (!isObjectRecord(value)) {
    return false;
  }

  const acCapDexMod = value.ac_cap_dexmod;
  const strengthScoreRequired = value.strength_score_required;

  return (
    typeof value.name === "string" &&
    typeof value.key === "string" &&
    typeof value.url === "string" &&
    typeof value.category === "string" &&
    typeof value.ac_base === "number" &&
    typeof value.ac_display === "string" &&
    typeof value.ac_add_dexmod === "boolean" &&
    (acCapDexMod === null || typeof acCapDexMod === "number") &&
    typeof value.grants_stealth_disadvantage === "boolean" &&
    (strengthScoreRequired === null || typeof strengthScoreRequired === "number")
  );
}

function isNullableOpen5eItemArmorRecord(value: unknown) {
  return value === null || isOpen5eItemArmorRecord(value);
}

const itemSchema = new Schema<Open5eItemRecord>(
  {
    url: {
      type: String,
      required: true
    },
    key: {
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
    category: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: isOpen5eKeyedReference,
        message: "category must be an Open5e keyed reference."
      }
    },
    rarity: {
      type: Schema.Types.Mixed,
      default: null,
      validate: {
        validator: isNullableOpen5eKeyedReference,
        message: "rarity must be null or an Open5e keyed reference."
      }
    },
    is_magic_item: {
      type: Boolean,
      required: true
    },
    weapon: {
      type: Schema.Types.Mixed,
      default: null,
      validate: {
        validator: isNullableOpen5eItemWeaponRecord,
        message: "weapon must be null or a valid Open5e weapon object."
      }
    },
    armor: {
      type: Schema.Types.Mixed,
      default: null,
      validate: {
        validator: isNullableOpen5eItemArmorRecord,
        message: "armor must be null or a valid Open5e armor object."
      }
    },
    size: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: isOpen5eKeyedReference,
        message: "size must be an Open5e keyed reference."
      }
    },
    weight: {
      type: String,
      required: true
    },
    weight_unit: {
      type: String,
      required: true
    },
    cost: {
      type: String,
      default: null
    },
    requires_attunement: {
      type: Boolean,
      required: true
    },
    attunement_detail: {
      type: String,
      default: null
    },
    document: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: isOpen5eDocumentReference,
        message: "document must be a valid Open5e document reference."
      }
    }
  }
);

export const ItemModel: Model<Open5eItemRecord> =
  mongoose.models.Item || model<Open5eItemRecord>("Item", itemSchema);
