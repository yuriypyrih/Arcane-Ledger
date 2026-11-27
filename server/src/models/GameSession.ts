import mongoose, { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

export const GAME_SESSION_STATUSES = ["planned", "live", "ended", "cancelled"] as const;
export type GameSessionStatus = (typeof GAME_SESSION_STATUSES)[number];

export const GAME_SESSION_AVAILABILITY_STATES = ["yes", "maybe", "no"] as const;
export type GameSessionAvailabilityState = (typeof GAME_SESSION_AVAILABILITY_STATES)[number];

export type GameSessionAvailabilityRecord = {
  userId: Types.ObjectId;
  state: GameSessionAvailabilityState;
  updatedAt: Date;
};

export type GameSessionRescheduleProposalRecord = {
  proposedAt: Date;
  message: string;
  createdAt: Date;
};

export type GameSessionRecord = {
  campaignId: Types.ObjectId;
  ownerId: Types.ObjectId;
  title: string;
  scheduledAt?: Date | null;
  durationMinutes?: number | null;
  status: GameSessionStatus;
  recap: string;
  linkedPreparedEncounterIds: string[];
  availability: GameSessionAvailabilityRecord[];
  attendedUserIds: Types.ObjectId[];
  /** Players who hid this session from their own lists. */
  hiddenByUserIds: Types.ObjectId[];
  /** A new time the GM suggested; cleared when the session time changes or the GM withdraws it. */
  rescheduleProposal?: GameSessionRescheduleProposalRecord | null;
  /** The GM waved off the reminder to write this session's log. */
  logReminderDismissed?: boolean;
  /** When reschedule emails last went out; withdrawing a proposal does not reset the cooldown. */
  rescheduleEmailedAt?: Date | null;
  /** The scheduledAt value invites were last sent for; prevents duplicate emails. */
  invitedScheduledAt?: Date | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  revision: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type GameSessionDocument = HydratedDocument<GameSessionRecord>;

const gameSessionAvailabilitySchema = new Schema<GameSessionAvailabilityRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    state: {
      type: String,
      enum: GAME_SESSION_AVAILABILITY_STATES,
      required: true
    },
    updatedAt: {
      type: Date,
      required: true
    }
  },
  { _id: false }
);

const gameSessionRescheduleProposalSchema = new Schema<GameSessionRescheduleProposalRecord>(
  {
    proposedAt: { type: Date, required: true },
    message: { type: String, default: "", trim: true, maxlength: 500 },
    createdAt: { type: Date, required: true }
  },
  { _id: false }
);

const gameSessionSchema = new Schema<GameSessionRecord>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 128
    },
    scheduledAt: {
      type: Date,
      default: null
    },
    durationMinutes: {
      type: Number,
      min: 15,
      max: 1440,
      default: null
    },
    status: {
      type: String,
      enum: GAME_SESSION_STATUSES,
      default: "planned"
    },
    recap: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20000
    },
    linkedPreparedEncounterIds: {
      type: [String],
      default: []
    },
    availability: {
      type: [gameSessionAvailabilitySchema],
      default: []
    },
    attendedUserIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: []
    },
    hiddenByUserIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: []
    },
    rescheduleProposal: {
      type: gameSessionRescheduleProposalSchema,
      default: null
    },
    rescheduleEmailedAt: {
      type: Date,
      default: null
    },
    logReminderDismissed: {
      type: Boolean,
      default: false
    },
    invitedScheduledAt: {
      type: Date,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    endedAt: {
      type: Date,
      default: null
    },
    revision: {
      type: Number,
      default: 0
    }
  },
  {
    collection: "gameSessions",
    minimize: false,
    timestamps: true
  }
);

gameSessionSchema.index({ campaignId: 1, scheduledAt: 1 });
// At most one live session per campaign.
gameSessionSchema.index(
  { campaignId: 1 },
  { unique: true, partialFilterExpression: { status: "live" }, name: "campaignId_live_unique" }
);

export const GameSession =
  (mongoose.models.GameSession as Model<GameSessionRecord> | undefined) ??
  model<GameSessionRecord>("GameSession", gameSessionSchema);
