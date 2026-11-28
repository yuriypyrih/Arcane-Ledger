export const USER_ROLES = ["user", "keeper", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type AuthStatus = "unknown" | "guest" | "authenticated";

export type AuthUser = {
  id: string;
  email: string;
  nickname: string;
  /** Optional https picture link the player picked. */
  avatarUrl: string;
  /** Short text the player wrote about themselves. */
  bio: string;
  role: UserRole;
  emailVerifiedAt: string | null;
  createdAt: string | null;
  lastFeedback: string | null;
};

export type AuthUserEnvelope = {
  user: AuthUser;
};

export type AuthMessageEnvelope = {
  message: string;
};
