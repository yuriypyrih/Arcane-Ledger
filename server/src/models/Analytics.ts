import mongoose, { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

export type AnalyticsGeoRecord = {
  country: string;
  region: string;
  city: string;
};

export type AnalyticsDeviceRecord = {
  locale?: string;
  platform?: string;
  pwaMode?: string;
  timezone?: string;
  userAgentFamily?: string;
  viewportHeight?: number;
  viewportWidth?: number;
};

export type AnalyticsEventRecord = {
  eventId: string;
  name: string;
  occurredAt: Date;
  receivedAt: Date;
  sessionId: string;
  visitorId: string;
  userId?: Types.ObjectId | null;
  route: string;
  source: "frontend";
  visitorType: "anonymous" | "authenticated";
  geo: AnalyticsGeoRecord;
  device?: AnalyticsDeviceRecord;
  props?: Record<string, unknown>;
  metrics?: Record<string, number>;
  createdAt?: Date;
  updatedAt?: Date;
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

export type AnalyticsEventDocument = HydratedDocument<AnalyticsEventRecord>;
export type AnalyticsRollupDocument = HydratedDocument<AnalyticsRollupRecord>;

const analyticsGeoSchema = new Schema<AnalyticsGeoRecord>(
  {
    country: { type: String, required: true, trim: true, default: "unknown" },
    region: { type: String, required: true, trim: true, default: "unknown" },
    city: { type: String, required: true, trim: true, default: "unknown" }
  },
  {
    _id: false
  }
);

const analyticsDeviceSchema = new Schema<AnalyticsDeviceRecord>(
  {
    locale: { type: String, trim: true },
    platform: { type: String, trim: true },
    pwaMode: { type: String, trim: true },
    timezone: { type: String, trim: true },
    userAgentFamily: { type: String, trim: true },
    viewportHeight: { type: Number, min: 0 },
    viewportWidth: { type: Number, min: 0 }
  },
  {
    _id: false
  }
);

const analyticsEventSchema = new Schema<AnalyticsEventRecord>(
  {
    eventId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true, index: true },
    occurredAt: { type: Date, required: true, index: true },
    receivedAt: { type: Date, required: true, default: () => new Date() },
    sessionId: { type: String, required: true, trim: true, index: true },
    visitorId: { type: String, required: true, trim: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    route: { type: String, required: true, trim: true, default: "unknown", index: true },
    source: { type: String, enum: ["frontend"], required: true, default: "frontend" },
    visitorType: {
      type: String,
      enum: ["anonymous", "authenticated"],
      required: true,
      default: "anonymous",
      index: true
    },
    geo: { type: analyticsGeoSchema, required: true, default: () => ({}) },
    device: { type: analyticsDeviceSchema, default: undefined },
    props: { type: Schema.Types.Mixed, default: undefined },
    metrics: { type: Schema.Types.Mixed, default: undefined }
  },
  {
    minimize: true,
    timestamps: true
  }
);

analyticsEventSchema.index({ occurredAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });
analyticsEventSchema.index({ eventId: 1, visitorId: 1 }, { unique: true });
analyticsEventSchema.index({ name: 1, occurredAt: -1 });

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

export const AnalyticsEvent =
  (mongoose.models.AnalyticsEvent as Model<AnalyticsEventRecord> | undefined) ??
  model<AnalyticsEventRecord>("AnalyticsEvent", analyticsEventSchema);

export const AnalyticsDailyRollup =
  (mongoose.models.AnalyticsDailyRollup as Model<AnalyticsRollupRecord> | undefined) ??
  model<AnalyticsRollupRecord>("AnalyticsDailyRollup", analyticsRollupSchema);
