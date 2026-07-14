import mongoose, { Schema, model, type Model, type Types } from "mongoose";

export type MasterChestOperationRecord = {
  operationId: string;
  requestHash: string;
  partyGroupId: Types.ObjectId;
  actorUserId: Types.ObjectId;
  actorCharacterId?: Types.ObjectId;
  chestRevision: number;
  characterRevision?: number;
  executionMode?: "atomic" | "standalone";
  status?: "prepared" | "character-applied" | "committed" | "recovery-required";
  journal?: Record<string, unknown>;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

const masterChestOperationSchema = new Schema<MasterChestOperationRecord>(
  {
    operationId: {
      type: String,
      required: true,
      trim: true
    },
    requestHash: {
      type: String,
      required: true
    },
    partyGroupId: {
      type: Schema.Types.ObjectId,
      ref: "PartyGroup",
      required: true,
      index: true
    },
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    actorCharacterId: {
      type: Schema.Types.ObjectId,
      ref: "CharacterSheet",
      default: undefined
    },
    chestRevision: {
      type: Number,
      required: true,
      min: 1
    },
    characterRevision: {
      type: Number,
      min: 1,
      default: undefined
    },
    executionMode: {
      type: String,
      enum: ["atomic", "standalone"],
      default: "atomic"
    },
    status: {
      type: String,
      enum: ["prepared", "character-applied", "committed", "recovery-required"],
      default: "committed"
    },
    journal: {
      type: Schema.Types.Mixed,
      default: undefined,
      select: false
    },
    expiresAt: {
      type: Date,
      default: undefined
    }
  },
  {
    collection: "masterChestOperations",
    timestamps: true
  }
);

masterChestOperationSchema.index({ operationId: 1 }, { unique: true });
masterChestOperationSchema.index({ partyGroupId: 1, status: 1, createdAt: 1 });
masterChestOperationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const MasterChestOperation =
  (mongoose.models.MasterChestOperation as Model<MasterChestOperationRecord> | undefined) ??
  model<MasterChestOperationRecord>("MasterChestOperation", masterChestOperationSchema);
