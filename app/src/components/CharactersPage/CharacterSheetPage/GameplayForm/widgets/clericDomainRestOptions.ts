import type { Character } from "../../../../../types";
import {
  getKeeperOfSoulsRemaining,
  getSentinelUsesRemaining,
  getSentinelUsesTotal,
  hasGraveDomain,
  restoreKeeperOfSouls,
  restoreSentinelUses
} from "../../../../../pages/CharactersPage/classFeatures/cleric/subclasses/clericGraveDomain";
import {
  getDispellingRecoveryRemaining,
  hasArcanaDomain,
  restoreDispellingRecovery
} from "../../../../../pages/CharactersPage/classFeatures/cleric/subclasses/clericArcanaDomain";
import type { RestOption } from "./restOptionTypes";
export function createClericDomainRestOptions(
  character: Character,
  rest: "short" | "long"
): RestOption[] {
  const options: RestOption[] = [];
  if (hasArcanaDomain(character, 6))
    options.push({
      id: "restore-dispelling-recovery",
      label: "Restore Dispelling Recovery",
      charges: { current: getDispellingRecoveryRemaining(character), total: 1 },
      apply: restoreDispellingRecovery
    });
  if (hasGraveDomain(character, 17))
    options.push({
      id: "restore-keeper-of-souls",
      label: "Restore Keeper of Souls",
      charges: { current: getKeeperOfSoulsRemaining(character), total: 1 },
      apply: restoreKeeperOfSouls
    });
  if (rest === "long" && hasGraveDomain(character, 6))
    options.push({
      id: "restore-sentinel-at-deaths-door",
      label: "Restore Sentinel at Death's Door",
      charges: {
        current: getSentinelUsesRemaining(character),
        total: getSentinelUsesTotal(character)
      },
      apply: restoreSentinelUses
    });
  return options;
}
