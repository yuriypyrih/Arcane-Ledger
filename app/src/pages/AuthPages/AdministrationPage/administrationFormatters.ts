import type { UserRole } from "../../../types/auth";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium"
});

export function formatAdministrationDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function formatAdministrationRole(role: UserRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
