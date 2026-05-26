export const USER_ROLES = ["user", "keeper", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type AuthUserResponse = {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  emailVerifiedAt: string | null;
  createdAt: string | null;
  lastFeedback: string | null;
};

export type AuthUserEnvelope = {
  user: AuthUserResponse;
};

export type AuthMessageEnvelope = {
  message: string;
};
