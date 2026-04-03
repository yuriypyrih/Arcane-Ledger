import { AppError } from "../errors/AppError.js";

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function formatFetchDate(date: Date): string {
  return `${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}-${date.getFullYear()}`;
}

export function parseFetchDate(value: string): Date {
  const match = /^(?<month>\d{2})-(?<day>\d{2})-(?<year>\d{4})$/.exec(value);

  if (!match?.groups) {
    throw new AppError('Fetch dates must be formatted as "MM-DD-YYYY".', 400, "INVALID_FETCH_DATE");
  }

  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  const year = Number(match.groups.year);
  const parsedDate = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    throw new AppError(`Fetch date "${value}" is not a valid calendar date.`, 400, "INVALID_FETCH_DATE");
  }

  return parsedDate;
}

export function getSnapshotDirectoryName(fetchDate: string) {
  parseFetchDate(fetchDate);
  return `fetch-${fetchDate}`;
}
