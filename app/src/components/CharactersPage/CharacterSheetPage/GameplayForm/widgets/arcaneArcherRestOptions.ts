import type { Character } from "../../../../../types";
import {
  getArcaneShotUsage,
  restoreArcaneShot
} from "../../../../../pages/CharactersPage/classFeatures/fighter/subclasses/fighterArcaneShot";
import type { RestOption } from "./restOptionTypes";
import {
  getMagicalAmmunitionUsesRemaining,
  hasMagicalAmmunition,
  restoreMagicalAmmunition
} from "../../../../../pages/CharactersPage/classFeatures/fighter/subclasses/fighterMagicalAmmunition";

export function createArcaneArcherRestOptions(character: Character): RestOption[] {
  const { usesTotal, usesRemaining } = getArcaneShotUsage(character);
  const options: RestOption[] =
    usesTotal > 0
      ? [
          {
            id: "restore-arcane-shot",
            label: "Restore all Arcane Shot charges",
            charges: { current: usesRemaining, total: usesTotal },
            apply: restoreArcaneShot
          }
        ]
      : [];
  if (hasMagicalAmmunition(character)) {
    options.push({
      id: "restore-magical-ammunition",
      label: "Restore Magical Ammunition charge",
      charges: { current: getMagicalAmmunitionUsesRemaining(character), total: 1 },
      apply: restoreMagicalAmmunition
    });
  }
  return options;
}
