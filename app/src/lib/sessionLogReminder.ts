export const SESSION_LOG_REMINDER_EVENT = "arcane-ledger:session-log-reminder-changed";

/**
 * Tells the notification bell to look again: a session just ended, or a log was written or
 * dismissed. The bell cannot learn this from the live stream, which only follows known campaigns.
 */
export function notifySessionLogReminderChanged() {
  window.dispatchEvent(new Event(SESSION_LOG_REMINDER_EVENT));
}
