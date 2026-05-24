import type { AuthUserResponse } from "./auth.js";

export type SupportFeedbackEnvelope = {
  message: string;
  user: AuthUserResponse;
};
