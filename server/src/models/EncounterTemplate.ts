import mongoose, { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

export type EncounterTemplateCreatureRecord = {
  id: string;
  name: string;
  description: string;
  type: string;
  primalBeastKind?: "land" | "sea" | "sky";
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  temporaryHitPointsSource?: string;
  deathSaves?: Record<string, unknown>;
  duration: Record<string, unknown>;
  inheritedCreatureEntry?: Record<string, unknown>;
  inheritedCreatureEntryModified?: boolean;
};

export type EncounterTemplateRecord = {
  name: string;
  ownerId: Types.ObjectId;
  creatures: EncounterTemplateCreatureRecord[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type EncounterTemplateDocument = HydratedDocument<EncounterTemplateRecord>;

export const encounterTemplateCreatureSchema = new Schema<EncounterTemplateCreatureRecord>(
  {
    id: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    type: {
      type: String,
      default: "",
      trim: true
    },
    primalBeastKind: {
      type: String,
      enum: ["land", "sea", "sky"]
    },
    maxHitPoints: {
      type: Number,
      required: true,
      min: 1
    },
    currentHitPoints: {
      type: Number,
      required: true,
      min: 0
    },
    temporaryHitPoints: {
      type: Number,
      default: 0,
      min: 0
    },
    temporaryHitPointsSource: {
      type: String,
      trim: true
    },
    deathSaves: {
      type: Schema.Types.Mixed
    },
    duration: {
      type: Schema.Types.Mixed,
      required: true
    },
    inheritedCreatureEntry: {
      type: Schema.Types.Mixed
    },
    inheritedCreatureEntryModified: {
      type: Boolean
    }
  },
  {
    _id: false,
    minimize: false
  }
);

const encounterTemplateSchema = new Schema<EncounterTemplateRecord>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 128
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    creatures: {
      type: [encounterTemplateCreatureSchema],
      default: []
    }
  },
  {
    collection: "encounterTemplates",
    minimize: false,
    timestamps: true
  }
);

encounterTemplateSchema.index({ ownerId: 1, updatedAt: -1 });

export const EncounterTemplate =
  (mongoose.models.EncounterTemplate as Model<EncounterTemplateRecord> | undefined) ??
  model<EncounterTemplateRecord>("EncounterTemplate", encounterTemplateSchema);
