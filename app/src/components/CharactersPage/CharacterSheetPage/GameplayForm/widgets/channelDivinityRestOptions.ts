import type { Character } from "../../../../../types";
import {
  getClericChannelDivinityUsesTotal,
  restoreClericChannelDivinityOnShortRest,
  restoreClericChannelDivinityOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/cleric/cleric";
import {
  getPaladinChannelDivinityUsesTotal,
  restorePaladinChannelDivinityOnShortRest,
  restorePaladinChannelDivinityOnLongRest
} from "../../../../../pages/CharactersPage/classFeatures/paladin/paladin";
import type { RestOption } from "./restOptionTypes";

export function createChannelDivinityRestOptions(
  character: Character,
  rest: "short" | "long"
): RestOption[] {
  return [
    {
      name: "Cleric",
      total: getClericChannelDivinityUsesTotal(character),
      apply:
        rest === "short"
          ? restoreClericChannelDivinityOnShortRest
          : restoreClericChannelDivinityOnLongRest
    },
    {
      name: "Paladin",
      total: getPaladinChannelDivinityUsesTotal(character),
      apply:
        rest === "short"
          ? restorePaladinChannelDivinityOnShortRest
          : restorePaladinChannelDivinityOnLongRest
    }
  ]
    .filter((entry) => entry.total > 0)
    .map((entry) => ({
      id: character.multiclass
        ? `restore-${entry.name.toLowerCase()}-channel-divinity`
        : "restore-channel-divinity",
      label: `Restore ${rest === "short" ? "1" : "all"} ${character.multiclass ? `${entry.name} ` : ""}Channel Divinity`,
      apply: entry.apply
    }));
}
