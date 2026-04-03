import type { SubclassEntry } from "../entries/types";
import { bardSubclassEntries } from "./bard";
import { barbarianSubclassEntries } from "./barbarian";
import { clericSubclassEntries } from "./cleric";
import { druidSubclassEntries } from "./druid";
import { fighterSubclassEntries } from "./fighter";
import { monkSubclassEntries } from "./monk";
import { paladinSubclassEntries } from "./paladin";
import { rangerSubclassEntries } from "./ranger";
import { rogueSubclassEntries } from "./rogue";
import { sorcererSubclassEntries } from "./sorcerer";
import { warlockSubclassEntries } from "./warlock";
import { wizardSubclassEntries } from "./wizard";

export const subclassEntries: SubclassEntry[] = [
  ...barbarianSubclassEntries,
  ...bardSubclassEntries,
  ...clericSubclassEntries,
  ...druidSubclassEntries,
  ...fighterSubclassEntries,
  ...monkSubclassEntries,
  ...paladinSubclassEntries,
  ...rangerSubclassEntries,
  ...rogueSubclassEntries,
  ...sorcererSubclassEntries,
  ...warlockSubclassEntries,
  ...wizardSubclassEntries
];

const subclassEntriesById = new Map(subclassEntries.map((entry) => [entry.id, entry] as const));

function getPaladinSubclassSortName(name: string): string {
  return name.replace(/^Oath of (?:the )?/i, "").trim();
}

export function getSubclassEntryById(subclassId: string): SubclassEntry | undefined {
  return subclassEntriesById.get(subclassId);
}

export function getSubclassEntriesForClass(className: string): SubclassEntry[] {
  return subclassEntries
    .filter((entry) => entry.className === className)
    .sort((left, right) =>
      (className === "Paladin" ? getPaladinSubclassSortName(left.name) : left.name).localeCompare(
        className === "Paladin" ? getPaladinSubclassSortName(right.name) : right.name
      )
    );
}
