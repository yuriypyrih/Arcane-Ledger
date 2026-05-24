import mongoose, { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

export type FeedbackRecord = {
  userId: Types.ObjectId;
  userEmail: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FeedbackDocument = HydratedDocument<FeedbackRecord>;

const feedbackSchema = new Schema<FeedbackRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000
    }
  },
  {
    collection: "feedback",
    timestamps: true
  }
);

feedbackSchema.index({ userId: 1, createdAt: -1 });

export const Feedback =
  (mongoose.models.Feedback as Model<FeedbackRecord> | undefined) ??
  model<FeedbackRecord>("Feedback", feedbackSchema);
