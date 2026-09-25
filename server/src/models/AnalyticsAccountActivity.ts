import mongoose, { Schema, model, type Model } from "mongoose";

export type AnalyticsAccountActivityRecord = {
  date: Date;
  accountKey: string;
  firstRecordedAt: Date;
};

const schema = new Schema<AnalyticsAccountActivityRecord>({
  date: { type: Date, required: true },
  accountKey: { type: String, required: true },
  firstRecordedAt: { type: Date, required: true, index: true }
});

schema.index({ date: 1, accountKey: 1 }, { unique: true });

export const AnalyticsAccountActivity =
  (mongoose.models.AnalyticsAccountActivity as Model<AnalyticsAccountActivityRecord> | undefined) ??
  model<AnalyticsAccountActivityRecord>("AnalyticsAccountActivity", schema);
