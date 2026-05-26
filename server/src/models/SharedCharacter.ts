import mongoose, { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";
import type { CharacterSheetSummaryRecord } from "./CharacterSheet.js";

export type SharedCharacterRecord = {
  link: string;
  sourceCharacterSheetId: Types.ObjectId;
  originalOwnerId: Types.ObjectId;
  schemaVersion: 2;
  summary: CharacterSheetSummaryRecord;
  sheet: Record<string, unknown>;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SharedCharacterDocument = HydratedDocument<SharedCharacterRecord>;

const sharedCharacterSummarySchema = new Schema<CharacterSheetSummaryRecord>(
  {
    localId: {
      type: Number
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    species: {
      type: String,
      required: true,
      trim: true
    },
    className: {
      type: String,
      required: true,
      trim: true
    },
    subclassId: {
      type: String,
      default: null
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 100
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

const sharedCharacterSchema = new Schema<SharedCharacterRecord>(
  {
    link: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    sourceCharacterSheetId: {
      type: Schema.Types.ObjectId,
      ref: "CharacterSheet",
      required: true,
      index: true
    },
    originalOwnerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    schemaVersion: {
      type: Number,
      enum: [2],
      default: 2,
      required: true
    },
    summary: {
      type: sharedCharacterSummarySchema,
      required: true
    },
    sheet: {
      type: Schema.Types.Mixed,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    collection: "sharedCharacters",
    minimize: false,
    timestamps: true
  }
);

sharedCharacterSchema.index({ link: 1 }, { unique: true });
sharedCharacterSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sharedCharacterSchema.index({ originalOwnerId: 1, createdAt: -1 });

export const SharedCharacter =
  (mongoose.models.SharedCharacter as Model<SharedCharacterRecord> | undefined) ??
  model<SharedCharacterRecord>("SharedCharacter", sharedCharacterSchema);
