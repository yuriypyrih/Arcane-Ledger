export function normalizeFormula(input: string): string {
  return input.replace(/\s+/g, "").toLowerCase();
}
