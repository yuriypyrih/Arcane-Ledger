import { readFileSync } from "node:fs";
const fixture = JSON.parse(
  readFileSync(new URL("../../../fixtures/characters/fighter.json", import.meta.url), "utf8")
);
export function portableSheet() {
  return structuredClone(fixture);
}
