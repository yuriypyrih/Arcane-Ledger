export const analyticsActivityEvents = [
  "app_boot",
  "session_start",
  "page_view",
  "character_sheet_opened",
  "character_created",
  "codex_search_submitted",
  "support_feedback_submitted"
] as const;

export function isAnalyticsActivityEvent(name: string) {
  return analyticsActivityEvents.some((event) => event === name);
}
