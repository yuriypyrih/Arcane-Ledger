import mongoose, { Schema, model, type Model, type Types } from "mongoose";

export type MasterChestLeaseRecord = {
  partyGroupId: Types.ObjectId;
  ownerToken: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

const masterChestLeaseSchema = new Schema<MasterChestLeaseRecord>(
  {
    partyGroupId: {
      type: Schema.Types.ObjectId,
      ref: "PartyGroup",
      required: true
    },
    ownerToken: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    collection: "masterChestLeases",
    timestamps: true
  }
);

masterChestLeaseSchema.index({ partyGroupId: 1 }, { unique: true });
masterChestLeaseSchema.index({ expiresAt: 1 });

export const MasterChestLease =
  (mongoose.models.MasterChestLease as Model<MasterChestLeaseRecord> | undefined) ??
  model<MasterChestLeaseRecord>("MasterChestLease", masterChestLeaseSchema);
