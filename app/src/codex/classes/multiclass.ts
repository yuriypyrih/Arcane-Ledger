import type { AbilityKey, CharacterClassEntry } from "../../types";
import {
  ARMOR_PROFICIENCY as Armor,
  TOOL_PROFICIENCY as Tool,
  WEAPON_PROFICIENCY as Weapon
} from "../../types";

export type CastingProgression = "none" | "full" | "half" | "third" | "pact" | "manual";
export type MulticlassRules = {
  /** All groups are required; any ability in a group can satisfy that group. */
  requirements: AbilityKey[][];
  casting: CastingProgression;
  armor?: Armor[];
  weapons?: Weapon[];
  tools?: Tool[];
  skillChoices?: number;
  instrumentChoices?: number;
};

// 2024 PHB: Creating a Character / Multiclassing and each class's
// "As a Multiclass Character" introduction. Artificer uses revised class rules.
export const multiclassRules: Record<string, MulticlassRules> = {
  Artificer: {
    requirements: [["INT"]],
    casting: "half",
    armor: [Armor.LIGHT, Armor.MEDIUM, Armor.SHIELD],
    tools: [Tool.TINKERS_TOOLS],
    skillChoices: 1
  },
  Barbarian: {
    requirements: [["STR"]],
    casting: "none",
    weapons: [Weapon.MARTIAL],
    armor: [Armor.SHIELD]
  },
  Bard: {
    requirements: [["CHA"]],
    casting: "full",
    armor: [Armor.LIGHT],
    skillChoices: 1,
    instrumentChoices: 1
  },
  Cleric: {
    requirements: [["WIS"]],
    casting: "full",
    armor: [Armor.LIGHT, Armor.MEDIUM, Armor.SHIELD]
  },
  Druid: { requirements: [["WIS"]], casting: "full", armor: [Armor.LIGHT, Armor.SHIELD] },
  Fighter: {
    requirements: [["STR", "DEX"]],
    casting: "none",
    weapons: [Weapon.MARTIAL],
    armor: [Armor.LIGHT, Armor.MEDIUM, Armor.SHIELD]
  },
  Monk: { requirements: [["DEX"], ["WIS"]], casting: "none" },
  Paladin: {
    requirements: [["STR"], ["CHA"]],
    casting: "half",
    weapons: [Weapon.MARTIAL],
    armor: [Armor.LIGHT, Armor.MEDIUM, Armor.SHIELD]
  },
  Ranger: {
    requirements: [["DEX"], ["WIS"]],
    casting: "half",
    weapons: [Weapon.MARTIAL],
    armor: [Armor.LIGHT, Armor.MEDIUM, Armor.SHIELD],
    skillChoices: 1
  },
  Rogue: {
    requirements: [["DEX"]],
    casting: "none",
    armor: [Armor.LIGHT],
    tools: [Tool.THIEVES_TOOLKIT],
    skillChoices: 1
  },
  Sorcerer: { requirements: [["CHA"]], casting: "full" },
  Warlock: { requirements: [["CHA"]], casting: "pact", armor: [Armor.LIGHT] },
  Wizard: { requirements: [["INT"]], casting: "full" },
  Custom: { requirements: [], casting: "manual" }
};

export function getCastingProgression(entry: CharacterClassEntry): CastingProgression {
  if (entry.className === "Custom") return entry.customClass?.castingProgression ?? "manual";
  if (
    entry.classRules?.spellcastingRulesEnforced === false ||
    entry.classRules?.mechanics?.spellcasting?.enabled
  )
    return "manual";
  if (
    (entry.className === "Fighter" && entry.subclassId === "fighter-eldritch-knight") ||
    (entry.className === "Rogue" && entry.subclassId === "rogue-arcane-trickster")
  )
    return entry.level >= 3 ? "third" : "none";
  return multiclassRules[entry.className]?.casting ?? "none";
}
