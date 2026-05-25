import mongoose, { Schema, model, type HydratedDocument, type Model } from "mongoose";

export const emailDeliveryKinds = [
  "email_verification",
  "password_reset",
  "support_ticket",
  "transactional"
] as const;

export type EmailDeliveryKind = (typeof emailDeliveryKinds)[number];

export type EmailDeliveryRecord = {
  kind: EmailDeliveryKind;
  provider: "resend";
  providerMessageId?: string;
  sentAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type EmailDeliveryDocument = HydratedDocument<EmailDeliveryRecord>;

const emailDeliverySchema = new Schema<EmailDeliveryRecord>(
  {
    kind: {
      type: String,
      enum: emailDeliveryKinds,
      required: true,
      index: true
    },
    provider: {
      type: String,
      enum: ["resend"],
      required: true,
      default: "resend"
    },
    providerMessageId: {
      type: String,
      trim: true
    },
    sentAt: {
      type: Date,
      required: true,
      default: () => new Date(),
      index: true
    }
  },
  {
    timestamps: true
  }
);

emailDeliverySchema.index({ sentAt: -1, kind: 1 });

export const EmailDelivery =
  (mongoose.models.EmailDelivery as Model<EmailDeliveryRecord> | undefined) ??
  model<EmailDeliveryRecord>("EmailDelivery", emailDeliverySchema);
