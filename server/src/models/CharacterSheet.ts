import mongoose, { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

export type CharacterSheetSummaryRecord = {
  localId?: number;
  name: string;
  species: string;
  className: string;
  subclassId?: string | null;
  level: number;
  background: string;
  sheetSizeBytes?: number;
};

export type CharacterSheetRecord = {
  ownerId: Types.ObjectId;
  clientId: string;
  localId?: number;
  schemaVersion: 2;
  revision: number;
  summary: CharacterSheetSummaryRecord;
  sheet: Record<string, unknown>;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CharacterSheetDocument = HydratedDocument<CharacterSheetRecord>;

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
      max: 20,
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
