import mongoose, { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

export type CustomItemRecord = {
  item: Record<string, unknown>;
  mods: Record<string, unknown>;
  ownerId: Types.ObjectId;
  public: boolean;
  settings: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CustomItemDocument = HydratedDocument<CustomItemRecord>;

const customItemSchema = new Schema<CustomItemRecord>(
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
    item: {
      type: Schema.Types.Mixed,
      required: true
    },
    mods: {
      type: Schema.Types.Mixed,
      required: true
    },
    settings: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  {
    collection: "customItems",
    minimize: false,
    timestamps: true
  }
);

customItemSchema.index({ ownerId: 1, updatedAt: -1 });
customItemSchema.index({ public: 1, updatedAt: -1 });

export const CustomItem =
  (mongoose.models.CustomItem as Model<CustomItemRecord> | undefined) ??
  model<CustomItemRecord>("CustomItem", customItemSchema);
