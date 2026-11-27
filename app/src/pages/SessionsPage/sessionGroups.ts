import type {
  GameSessionAvailabilityState,
  GameSessionRescheduleProposal,
  GameSessionStatus
} from "../../api/gameSessions";

/** One line on the Sessions page, whether the user plays in the campaign or runs it. */
export type SessionRow = {
  availability: { state: GameSessionAvailabilityState; userId: string }[];
  campaignId: string;
  campaignImageUrl: string;
  campaignName: string;
  /** Present for players, so a live session can open their character. */
  characterClientId: string | null;
  durationMinutes: number | null;
  /** Only players can hide sessions. */
  hidden: boolean;
  id: string;
  rescheduleProposal: GameSessionRescheduleProposal | null;
  role: "gm" | "player";
  scheduledAt: string | null;
  status: GameSessionStatus;
  title: string;
};

export type SessionGroupKey = "today" | "upcoming" | "past";

export const SESSION_GROUPS: { description: string; key: SessionGroupKey; title: string }[] = [
  { key: "today", title: "Today", description: "Happening today or live right now" },
  { key: "upcoming", title: "Upcoming", description: "Planned for later" },
  { key: "past", title: "Past", description: "Ended, cancelled or never held" }
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Where a session belongs. Live sessions are today's. Ended and cancelled ones are past. A planned
 * session is today's when it is scheduled for today, upcoming when later or without a time, and past
 * when its day went by without it being held.
 */
export function getSessionGroup(row: SessionRow, now = new Date()): SessionGroupKey {
  if (row.status === "live") {
    return "today";
  }

  if (row.status === "ended" || row.status === "cancelled") {
    return "past";
  }

  if (!row.scheduledAt) {
    return "upcoming";
  }

  const day = startOfDay(new Date(row.scheduledAt)).getTime();
  const today = startOfDay(now).getTime();

  return day === today ? "today" : day > today ? "upcoming" : "past";
}

function getTime(row: SessionRow) {
  return row.scheduledAt ? new Date(row.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
}

/** Today and upcoming run soonest first; past runs most recent first. */
export function groupSessions(rows: SessionRow[], now = new Date()) {
  const groups: Record<SessionGroupKey, SessionRow[]> = { today: [], upcoming: [], past: [] };

  rows.forEach((row) => groups[getSessionGroup(row, now)].push(row));
  groups.today.sort((left, right) => getTime(left) - getTime(right));
  groups.upcoming.sort((left, right) => getTime(left) - getTime(right));
  groups.past.sort((left, right) => {
    const leftTime = Number.isFinite(getTime(left)) ? getTime(left) : 0;
    const rightTime = Number.isFinite(getTime(right)) ? getTime(right) : 0;

    return rightTime - leftTime;
  });

  return groups;
}

export function formatSessionDate(value: string | null) {
  return value
    ? new Date(value).toLocaleString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    : "No time set";
}

/** "tomorrow", "in 3 days", "2 days ago": day-level wording that keeps the list quick to scan. */
export function formatRelativeDay(value: string | null, now = new Date()) {
  if (!value) {
    return null;
  }

  const days = Math.round(
    (startOfDay(new Date(value)).getTime() - startOfDay(now).getTime()) / 86_400_000
  );

  return new Intl.RelativeTimeFormat([], { numeric: "auto" }).format(days, "day");
}
