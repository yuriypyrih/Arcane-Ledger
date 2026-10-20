import type { Character } from "../../../types";
import { hasCharacterClass } from "../multiclassState";
import { classCounterResource } from "../resourceManagement";
import {
  getClericChannelDivinityUsesRemaining,
  getClericChannelDivinityUsesTotal
} from "./cleric/clericChannelDivinity";
import {
  getPaladinChannelDivinityUsesRemaining,
  getPaladinChannelDivinityUsesTotal
} from "./paladin/base";

// Rest recovery also clears turn state. Manual management only edits the pool.
export const clericChannelDivinityResource = classCounterResource(
  "cleric",
  "channelDivinityUsesExpended",
  "Channel Divinity",
  getClericChannelDivinityUsesTotal,
  getClericChannelDivinityUsesRemaining
);
export const paladinChannelDivinityResource = classCounterResource(
  "paladin",
  "channelDivinityUsesExpended",
  "Channel Divinity",
  getPaladinChannelDivinityUsesTotal,
  getPaladinChannelDivinityUsesRemaining
);

export function getChannelDivinityResource(character: Character) {
  return (character.className === "Paladin" && hasCharacterClass(character, "Paladin")) ||
    !hasCharacterClass(character, "Cleric")
    ? paladinChannelDivinityResource
    : clericChannelDivinityResource;
}
