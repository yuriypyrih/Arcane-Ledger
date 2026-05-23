import { Schema, model, type HydratedDocument } from "mongoose";
import { USER_ROLES, type UserRole } from "../types/auth.js";

export type UserRecord = {
  email: string;
  role: UserRole;
  passwordHash: string;
  emailVerifiedAt?: Date | null;
  emailVerificationTokenHash?: string;
  emailVerificationTokenExpiresAt?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  passwordChangedAt?: Date | null;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserDocument = HydratedDocument<UserRecord>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new Schema<UserRecord>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator(value: string) {
          return EMAIL_PATTERN.test(value);
        },
        message: "Please provide a valid email address."
      }
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "user",
      required: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    emailVerifiedAt: {
      type: Date,
      default: null
    },
    emailVerificationTokenHash: {
      type: String,
      select: false
    },
    emailVerificationTokenExpiresAt: {
      type: Date,
      select: false
    },
    passwordResetTokenHash: {
      type: String,
      select: false
    },
    passwordResetExpiresAt: {
      type: Date,
      select: false
    },
    passwordChangedAt: {
      type: Date,
      default: null
    },
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    timestamps: true
  }
);

export const User = model<UserRecord>("User", userSchema);
