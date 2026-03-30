import { spellEntries } from "../spells";
import type { CodexEntry } from "./types";
import { armorEntries } from "./armorData";
import { weaponEntries } from "./weaponData";
import { itemEntries } from "./itemData";
import { backgroundEntries } from "./backgroundData";
import { speciesEntries } from "./speciesData";
import { classEntries } from "./classData";
import { ruleEntries } from "./ruleData";
import { monsterEntries } from "./monsterData";

export const hardcodedCodexEntries: CodexEntry[] = [
  ...spellEntries,
  ...weaponEntries,
  ...armorEntries,
  ...itemEntries,
  ...backgroundEntries,
  ...speciesEntries,
  ...classEntries,
  ...ruleEntries,
  ...monsterEntries
];
