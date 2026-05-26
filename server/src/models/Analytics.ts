import mongoose, { Schema, model, type HydratedDocument, type Model } from "mongoose";

export type AnalyticsGeoRecord = {
  country: string;
  region: string;
  city: string;
};

export type AnalyticsRollupRecord = {
  date: Date;
  eventName: string;
  source: "frontend" | "backend";
  route: string;
  method: string;
  statusFamily: string;
  latencyBucket: string;
  country: string;
  region: string;
  city: string;
  visitorType: "anonymous" | "authenticated" | "server";
  count: number;
  uniqueVisitorKeys: string[];
  uniqueSessionKeys: string[];
  uniqueVisitors: number;
  uniqueSessions: number;
  approximateUniques: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type AnalyticsRollupDocument = HydratedDocument<AnalyticsRollupRecord>;

const analyticsRollupSchema = new Schema<AnalyticsRollupRecord>(
  {
    date: { type: Date, required: true, index: true },
    eventName: { type: String, required: true, trim: true, index: true },
    source: { type: String, enum: ["frontend", "backend"], required: true, index: true },
    route: { type: String, required: true, trim: true, default: "all", index: true },
    method: { type: String, required: true, trim: true, default: "all" },
    statusFamily: { type: String, required: true, trim: true, default: "all" },
    latencyBucket: { type: String, required: true, trim: true, default: "all" },
    country: { type: String, required: true, trim: true, default: "unknown", index: true },
    region: { type: String, required: true, trim: true, default: "unknown" },
    city: { type: String, required: true, trim: true, default: "unknown" },
    visitorType: {
      type: String,
      enum: ["anonymous", "authenticated", "server"],
      required: true,
      default: "anonymous",
      index: true
    },
    count: { type: Number, required: true, min: 0, default: 0 },
    uniqueVisitorKeys: { type: [String], required: true, default: [] },
    uniqueSessionKeys: { type: [String], required: true, default: [] },
    uniqueVisitors: { type: Number, required: true, min: 0, default: 0 },
    uniqueSessions: { type: Number, required: true, min: 0, default: 0 },
    approximateUniques: { type: Boolean, required: true, default: false }
  },
  {
    minimize: true,
    timestamps: true
  }
);

analyticsRollupSchema.index(
  {
    date: 1,
    eventName: 1,
    source: 1,
    route: 1,
    method: 1,
    statusFamily: 1,
    latencyBucket: 1,
    country: 1,
    region: 1,
    city: 1,
    visitorType: 1
  },
  { unique: true }
);

export const AnalyticsDailyRollup =
  (mongoose.models.AnalyticsDailyRollup as Model<AnalyticsRollupRecord> | undefined) ??
  model<AnalyticsRollupRecord>("AnalyticsDailyRollup", analyticsRollupSchema);
