import type { ClassStarterPack } from "./type";
import { barbarianStarterPack } from "./barbarian";

const starterPacksByClassName: Partial<Record<string, ClassStarterPack>> = {
  Barbarian: barbarianStarterPack
};

export function getClassStarterPack(className: string): ClassStarterPack | null {
  return starterPacksByClassName[className] ?? null;
}

export * from "./barbarian";
export * from "./type";
