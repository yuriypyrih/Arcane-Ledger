export type TableViewMode = "classic" | "1" | "2" | "3" | "4";

export const TABLE_VIEW_OPTIONS: { description: string; label: string; mode: TableViewMode }[] = [
  { mode: "classic", label: "Classic", description: "Card grid" },
  { mode: "1", label: "Table 1", description: "Spotlight: who acts now, and who is next" },
  { mode: "2", label: "Table 2", description: "Two sides: party against foes" },
  { mode: "3", label: "Table 3", description: "Arcane circle: the turn wheel" },
  { mode: "4", label: "Table 4", description: "Battle line: classic cards, foes against the party" }
];

const STORAGE_KEY = "arcane-ledger.table-view";

export function parseTableViewMode(value: string | null | undefined): TableViewMode | null {
  return TABLE_VIEW_OPTIONS.some((option) => option.mode === value)
    ? (value as TableViewMode)
    : null;
}

/** The view last picked on this device, so a projector window reopens the way it was left. */
export function readStoredTableViewMode(): TableViewMode | null {
  try {
    return parseTableViewMode(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function storeTableViewMode(mode: TableViewMode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage can be blocked; the choice then lasts only for this page.
  }
}
