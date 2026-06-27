import mongoose, { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";
import type { MonsterRecord } from "../types/monster.js";

export type CustomBestiaryRecord = {
  monster: MonsterRecord;
  ownerId: Types.ObjectId;
  public: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CustomBestiaryDocument = HydratedDocument<CustomBestiaryRecord>;

const customBestiarySchema = new Schema<CustomBestiaryRecord>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    public: {
      type: Boolean,
      default: false,
      index: true
    },
    monster: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  {
    collection: "customBestiary",
    minimize: false,
    timestamps: true
  }
);

customBestiarySchema.index({ ownerId: 1, updatedAt: -1 });
customBestiarySchema.index({ public: 1, updatedAt: -1 });

export const CustomBestiary =
  (mongoose.models.CustomBestiary as Model<CustomBestiaryRecord> | undefined) ??
  model<CustomBestiaryRecord>("CustomBestiary", customBestiarySchema);
