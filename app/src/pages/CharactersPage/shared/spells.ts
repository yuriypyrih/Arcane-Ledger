export function areSpellIdListsEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((spellId, index) => spellId === right[index]);
}
