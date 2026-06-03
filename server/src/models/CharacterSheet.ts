import mongoose, { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

export type CharacterEncounterStatBlockAbilityRecord = {
  score: number;
  modifier: number;
  save: number;
};

export type CharacterEncounterStatBlockRecord = {
  version: 1;
  name: string;
  typeLabel: string;
  alignment: string;
  level: number;
  className: string;
  species: string;
  armorClass: number;
  initiative: string;
  speed: string;
  proficiencyBonus: number;
  hitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  temporaryHitPointsSource?: string;
  magicTemporaryHitPoints: number;
  magicTemporaryHitPointsSource?: string;
  immunities: string[];
  resistances: string[];
  vulnerabilities: string[];
  senses: string[];
  passivePerception: number;
  languages: string[];
  abilities: Record<"STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA", CharacterEncounterStatBlockAbilityRecord>;
  featureTraits: string[];
  reactions: string[];
  generatedAt: string;
  sourceLocalRevision?: number;
  sourceRemoteRevision?: number;
};

export type CharacterSheetSummaryRecord = {
  localId?: number;
  name: string;
  species: string;
  className: string;
  subclassId?: string | null;
  level: number;
  background: string;
  sheetSizeBytes?: number;
  encounterStatBlock?: CharacterEncounterStatBlockRecord;
};

export type CharacterAvatarRecord = {
  objectKey: string;
  imageUrl: string;
  mimeType: string;
  sizeBytes: number;
  updatedAt: Date;
};

export type CharacterSheetRecord = {
  ownerId: Types.ObjectId;
  clientId: string;
  localId?: number;
  partyGroupId?: Types.ObjectId | null;
  schemaVersion: 2;
  revision: number;
  summary: CharacterSheetSummaryRecord;
  sheet: Record<string, unknown>;
  avatar?: CharacterAvatarRecord | null;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CharacterSheetDocument = HydratedDocument<CharacterSheetRecord>;

const encounterStatBlockLabelMaxLength = 160;
const encounterStatBlockListMaxLength = 100;
const encounterStatBlockStringMaxLength = 240;

function validateEncounterStatBlockLabelList(values: unknown[]) {
  return (
    Array.isArray(values) &&
    values.length <= encounterStatBlockListMaxLength &&
    values.every(
      (value) =>
        typeof value === "string" &&
        value.trim().length > 0 &&
        value.length <= encounterStatBlockLabelMaxLength
    )
  );
}

const characterEncounterStatBlockAbilitySchema =
  new Schema<CharacterEncounterStatBlockAbilityRecord>(
    {
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      modifier: {
        type: Number,
        required: true,
        min: -100,
        max: 100
      },
      save: {
        type: Number,
        required: true,
        min: -100,
        max: 100
      }
    },
    {
      _id: false
    }
  );

function createEncounterStatBlockLabelListField() {
  return {
    type: [String],
    default: undefined,
    validate: {
      validator: validateEncounterStatBlockLabelList,
      message: "Encounter stat block labels are too large."
    }
  };
}

export const characterEncounterStatBlockSchema = new Schema<CharacterEncounterStatBlockRecord>(
  {
    version: {
      type: Number,
      enum: [1],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: encounterStatBlockStringMaxLength
    },
    typeLabel: {
      type: String,
      required: true,
      trim: true,
      maxlength: encounterStatBlockStringMaxLength
    },
    alignment: {
      type: String,
      required: true,
      trim: true,
      maxlength: encounterStatBlockStringMaxLength
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    className: {
      type: String,
      required: true,
      trim: true,
      maxlength: encounterStatBlockStringMaxLength
    },
    species: {
      type: String,
      required: true,
      trim: true,
      maxlength: encounterStatBlockStringMaxLength
    },
    armorClass: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    initiative: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32
    },
    speed: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64
    },
    proficiencyBonus: {
      type: Number,
      required: true,
      min: 0,
      max: 20
    },
    hitPoints: {
      type: Number,
      required: true,
      min: 0,
      max: 10000
    },
    currentHitPoints: {
      type: Number,
      required: true,
      min: 0,
      max: 10000
    },
    temporaryHitPoints: {
      type: Number,
      required: true,
      min: 0,
      max: 10000
    },
    temporaryHitPointsSource: {
      type: String,
      trim: true,
      maxlength: encounterStatBlockStringMaxLength
    },
    magicTemporaryHitPoints: {
      type: Number,
      required: true,
      min: 0,
      max: 10000
    },
    magicTemporaryHitPointsSource: {
      type: String,
      trim: true,
      maxlength: encounterStatBlockStringMaxLength
    },
    immunities: createEncounterStatBlockLabelListField(),
    resistances: createEncounterStatBlockLabelListField(),
    vulnerabilities: createEncounterStatBlockLabelListField(),
    senses: createEncounterStatBlockLabelListField(),
    passivePerception: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    languages: createEncounterStatBlockLabelListField(),
    abilities: {
      STR: {
        type: characterEncounterStatBlockAbilitySchema,
        required: true
      },
      DEX: {
        type: characterEncounterStatBlockAbilitySchema,
        required: true
      },
      CON: {
        type: characterEncounterStatBlockAbilitySchema,
        required: true
      },
      INT: {
        type: characterEncounterStatBlockAbilitySchema,
        required: true
      },
      WIS: {
        type: characterEncounterStatBlockAbilitySchema,
        required: true
      },
      CHA: {
        type: characterEncounterStatBlockAbilitySchema,
        required: true
      }
    },
    featureTraits: createEncounterStatBlockLabelListField(),
    reactions: createEncounterStatBlockLabelListField(),
    generatedAt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64
    },
    sourceLocalRevision: {
      type: Number,
      min: 1
    },
    sourceRemoteRevision: {
      type: Number,
      min: 1
    }
  },
  {
    _id: false,
    minimize: false
  }
);

const characterSheetSummarySchema = new Schema<CharacterSheetSummaryRecord>(
  {
    localId: {
      type: Number,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    species: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    className: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    subclassId: {
      type: String,
      default: null,
      index: true
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      index: true
    },
    background: {
      type: String,
      required: true,
      trim: true
    },
    sheetSizeBytes: {
      type: Number,
      min: 0
    },
    encounterStatBlock: {
      type: characterEncounterStatBlockSchema,
      default: undefined
    }
  },
  {
    _id: false
  }
);

const characterAvatarSchema = new Schema<CharacterAvatarRecord>(
  {
    objectKey: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      required: true,
      trim: true
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 0
    },
    updatedAt: {
      type: Date,
      required: true
    }
  },
  {
    _id: false
  }
);

const characterSheetSchema = new Schema<CharacterSheetRecord>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    clientId: {
      type: String,
      required: true,
      trim: true
    },
    localId: {
      type: Number,
      index: true
    },
    partyGroupId: {
      type: Schema.Types.ObjectId,
      ref: "PartyGroup",
      default: null,
      index: true
    },
    schemaVersion: {
      type: Number,
      enum: [2],
      default: 2,
      required: true
    },
    revision: {
      type: Number,
      default: 1,
      min: 1,
      required: true
    },
    summary: {
      type: characterSheetSummarySchema,
      required: true
    },
    sheet: {
      type: Schema.Types.Mixed,
      required: true
    },
    avatar: {
      type: characterAvatarSchema,
      default: null
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    minimize: false,
    timestamps: true
  }
);

characterSheetSchema.index({ ownerId: 1, clientId: 1 }, { unique: true });
characterSheetSchema.index({ ownerId: 1, deletedAt: 1, updatedAt: -1 });
characterSheetSchema.index({ ownerId: 1, "summary.name": 1 });
characterSheetSchema.index({ ownerId: 1, "summary.className": 1, "summary.level": -1 });

export const CharacterSheet =
  (mongoose.models.CharacterSheet as Model<CharacterSheetRecord> | undefined) ??
  model<CharacterSheetRecord>("CharacterSheet", characterSheetSchema);
