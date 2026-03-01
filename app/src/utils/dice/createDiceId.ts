export function createDiceId(sides: number, index: number): string {
  return `${sides}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
