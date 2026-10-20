import { vestigeCompanionReferenceStatBlock } from "./subclasses/warlockVestigeCompanion";
import type { MonsterRecord } from "../types";

const monsterReferences = new Map(
  [vestigeCompanionReferenceStatBlock].map((monster) => [monster.name.toLowerCase(), monster])
);

export function getLocalMonsterReference(name: string): MonsterRecord | null {
  return monsterReferences.get(name.trim().toLowerCase()) ?? null;
}
