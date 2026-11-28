import { Schema, model, type HydratedDocument } from "mongoose";
import { USER_ROLES, type UserRole } from "../types/auth.js";
import { THEME_MODE_PREFERENCES } from "../types/preferences.js";
import type { UserPreferences } from "../types/preferences.js";
import {
  DEFAULT_USER_NICKNAME,
  USER_NICKNAME_MAX_LENGTH,
  USER_NICKNAME_MIN_LENGTH
} from "../services/authNicknameService.js";
import { defaultUserPreferences } from "../services/userPreferencesService.js";

export type UserRecord = {
  email: string;
  nickname: string;
  /** Optional https link to a picture the player picked; shown to the GM and the party. */
  avatarUrl?: string;
  /** Short text the player wrote about themselves. */
  bio?: string;
  role: UserRole;
  passwordHash?: string;
  googleSubject?: string;
  emailVerifiedAt?: Date | null;
  emailVerificationTokenHash?: string;
  emailVerificationTokenExpiresAt?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  passwordChangedAt?: Date | null;
  lastFeedback?: Date | null;
  lastInteractedAt?: Date | null;
  preferences?: UserPreferences;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserDocument = HydratedDocument<UserRecord>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userPreferencesSchema = new Schema<UserPreferences>(
  {
    diceRollerBehavior: {
      type: String,
      enum: ["full_manual", "manual_with_roller", "full_auto"],
      default: defaultUserPreferences.diceRollerBehavior,
      required: true
    },
    broadLayout: {
      type: Boolean,
      default: defaultUserPreferences.broadLayout,
      required: true
    },
    themeMode: {
      type: String,
      enum: [...THEME_MODE_PREFERENCES],
      default: defaultUserPreferences.themeMode,
      required: true
    },
    emailNewSession: {
      type: Boolean,
      default: defaultUserPreferences.emailNewSession,
      required: true
    },
    emailReschedule: {
      type: Boolean,
      default: defaultUserPreferences.emailReschedule,
      required: true
    },
    notificationBadge: {
      type: Boolean,
      default: defaultUserPreferences.notificationBadge,
      required: true
    }
  },
  {
    _id: false
  }
);

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
    nickname: {
      type: String,
      required: true,
      trim: true,
      minlength: USER_NICKNAME_MIN_LENGTH,
      maxlength: USER_NICKNAME_MAX_LENGTH,
      default: DEFAULT_USER_NICKNAME
    },
    avatarUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "user",
      required: true
    },
    passwordHash: {
      type: String,
      select: false
    },
    googleSubject: {
      type: String,
      unique: true,
      sparse: true,
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
    lastFeedback: {
      type: Date,
      default: null
    },
    lastInteractedAt: {
      type: Date,
      default: null,
      index: true
    },
    preferences: {
      type: userPreferencesSchema,
      default: () => ({ ...defaultUserPreferences }),
      required: true
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
