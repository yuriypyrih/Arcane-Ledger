import mongoose, { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

export type PartyGroupRecord = {
  name: string;
  ownerId: Types.ObjectId;
  adminUserIds: Types.ObjectId[];
  inviteToken: string;
  characterIds: Types.ObjectId[];
  masterChestItems: unknown[];
  masterChestCurrencies: Record<string, number>;
  masterChestHistory: string[];
  masterChestRevision: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PartyGroupDocument = HydratedDocument<PartyGroupRecord>;

const partyGroupSchema = new Schema<PartyGroupRecord>(
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
    adminUserIds: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: []
    },
    inviteToken: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    characterIds: {
      type: [Schema.Types.ObjectId],
      ref: "CharacterSheet",
      default: []
    },
    masterChestItems: {
      type: [Schema.Types.Mixed],
      default: [],
      select: false
    },
    masterChestCurrencies: {
      type: Schema.Types.Mixed,
      default: () => ({
        copper: 0,
        silver: 0,
        electrum: 0,
        gold: 0,
        platinum: 0
      }),
      select: false
    },
    masterChestHistory: {
      type: [String],
      default: [],
      select: false
    },
    masterChestRevision: {
      type: Number,
      default: 1,
      min: 1,
      select: false
    }
  },
  {
    collection: "partyGroups",
    timestamps: true
  }
);

partyGroupSchema.index({ inviteToken: 1 }, { unique: true });
partyGroupSchema.index({ ownerId: 1, updatedAt: -1 });
partyGroupSchema.index({ characterIds: 1 });

export const PartyGroup =
  (mongoose.models.PartyGroup as Model<PartyGroupRecord> | undefined) ??
  model<PartyGroupRecord>("PartyGroup", partyGroupSchema);
