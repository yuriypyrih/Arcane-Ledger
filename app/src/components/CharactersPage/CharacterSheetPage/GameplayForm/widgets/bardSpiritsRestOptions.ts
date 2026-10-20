import type { Character } from "../../../../../types";
import {
  clearBardSpiritsOnRest,
  getBardSpiritsState,
  hasBardSpirits
} from "../../../../../pages/CharactersPage/classFeatures/bard/subclasses/bardCollegeOfSpiritsState";
import {
  getSpiritualManifestationRemaining,
  restoreSpiritualManifestation
} from "../../../../../pages/CharactersPage/classFeatures/bard/subclasses/bardCollegeOfSpiritsEmpowered";
import type { RestOption } from "./restOptionTypes";

export function createBardSpiritsRestOptions(
  character: Character,
  rest: "short" | "long"
): RestOption[] {
  if (!hasBardSpirits(character)) return [];
  const state = getBardSpiritsState(character);
  const options: RestOption[] = [];
  if (state.channeledSpirits?.length || state.pendingSpiritRolls?.length)
    options.push({
      id: "release-channeled-spirits",
      label: "Release channeled spirits",
      detail: "Channeled spirits and pending spirit rolls end on a Short or Long Rest.",
      apply: clearBardSpiritsOnRest
    });
  if (hasBardSpirits(character, 6)) {
    options.push({
      id: "restore-spiritual-manifestation-cover",
      label: "Restore Spiritual Manifestation Half Cover",
      charges: { current: getSpiritualManifestationRemaining(character, true), total: 1 },
      apply: (current) => restoreSpiritualManifestation(current, true)
    });
    if (rest === "long")
      options.push({
        id: "restore-spiritual-manifestation",
        label: "Restore Spiritual Manifestation free casting",
        charges: { current: getSpiritualManifestationRemaining(character), total: 1 },
        apply: (current) => restoreSpiritualManifestation(current)
      });
  }
  return options;
}
