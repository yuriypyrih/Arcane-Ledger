export { clampInteger, clampNumber } from "../../../utils/numbers";

export function formatSignedLabel(value: number, label: string): string {
  return `${value >= 0 ? "+" : "-"} ${Math.abs(value)} ${label}`;
}
