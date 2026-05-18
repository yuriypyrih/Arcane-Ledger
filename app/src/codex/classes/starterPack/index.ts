import type { ClassStarterPack } from "./type";
import { artificerStarterPack } from "./artificer";
import { barbarianStarterPack } from "./barbarian";
import { bardStarterPack } from "./bard";
import { clericStarterPack } from "./cleric";
import { druidStarterPack } from "./druid";
import { fighterStarterPack } from "./fighter";
import { monkStarterPack } from "./monk";
import { paladinStarterPack } from "./paladin";
import { rangerStarterPack } from "./ranger";
import { rogueStarterPack } from "./rogue";
import { sorcererStarterPack } from "./sorcerer";
import { warlockStarterPack } from "./warlock";
import { wizardStarterPack } from "./wizard";

const starterPacksByClassName: Partial<Record<string, ClassStarterPack>> = {
  Artificer: artificerStarterPack,
  Barbarian: barbarianStarterPack,
  Bard: bardStarterPack,
  Cleric: clericStarterPack,
  Druid: druidStarterPack,
  Fighter: fighterStarterPack,
  Monk: monkStarterPack,
  Paladin: paladinStarterPack,
  Ranger: rangerStarterPack,
  Rogue: rogueStarterPack,
  Sorcerer: sorcererStarterPack,
  Warlock: warlockStarterPack,
  Wizard: wizardStarterPack
};

export function getClassStarterPack(className: string): ClassStarterPack | null {
  return starterPacksByClassName[className] ?? null;
}

export * from "./artificer";
export * from "./barbarian";
export * from "./bard";
export * from "./cleric";
export * from "./druid";
export * from "./fighter";
export * from "./format";
export * from "./helpers";
export * from "./monk";
export * from "./paladin";
export * from "./ranger";
export * from "./rogue";
export * from "./sorcerer";
export * from "./toolItems";
export * from "./type";
export * from "./warlock";
export * from "./weaponMastery";
export * from "./wizard";
