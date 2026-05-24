import { apiPost, type ApiRequestOptions } from "./client";
import type { AuthUser } from "../types/auth";

export type SupportFeedbackEnvelope = {
  message: string;
  user: AuthUser;
};

export function submitSupportFeedback(content: string, options?: ApiRequestOptions) {
  return apiPost<SupportFeedbackEnvelope>("/support/feedback", { content }, options);
}
