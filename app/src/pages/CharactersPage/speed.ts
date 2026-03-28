import {
  ENTRY_CATEGORIES,
  hardcodedCodexEntries,
  type CodexEntry,
  type SpeciesEntry
} from "../../codex/entries";
import type { Character } from "../../types";
import { getSpeedBonusesForCharacter } from "./classFeatures";
import { getWornBodyArmorTypeForCharacter } from "./armor";
import { getExhaustionSpeedAdjustment } from "./traits";

export type SpeedBreakdownEntry = {
  label: string;
  value: number;
};

export type SpeedBreakdown = {
  total: number;
  source: string;
  entries: SpeedBreakdownEntry[];
};

const codexSpeciesEntriesByName = new Map<string, SpeciesEntry>(
  hardcodedCodexEntries
    .filter(
      (entry): entry is SpeciesEntry =>
        isSpeciesEntry(entry) && entry.category === ENTRY_CATEGORIES.SPECIES
    )
    .map((entry) => [entry.name, entry])
);

function isSpeciesEntry(entry: CodexEntry): entry is SpeciesEntry {
  return entry.category === ENTRY_CATEGORIES.SPECIES;
}

export function getSpeedBreakdownForCharacter(character: Character): SpeedBreakdown {
  const speciesEntry = codexSpeciesEntriesByName.get(character.species);
  const baseSpeed = speciesEntry?.speed ?? 30;
  const source = speciesEntry?.name ?? "Species";
  const featureBonuses = getSpeedBonusesForCharacter(character, {
    wornBodyArmorType: getWornBodyArmorTypeForCharacter(character)
  });
  const totalOverride = featureBonuses.reduce<number | null>(
    (currentOverride, bonus) => {
      if (typeof bonus.setTotal !== "number") {
        return currentOverride;
      }

      return currentOverride === null ? bonus.setTotal : Math.min(currentOverride, bonus.setTotal);
    },
    null
  );
  const entries: SpeedBreakdownEntry[] = [
    {
      label: "Base",
      value: baseSpeed
    },
    ...featureBonuses
      .filter((bonus) => bonus.value !== 0)
      .map((bonus) => ({
        label: bonus.label,
        value: bonus.value
      }))
  ];
  const baseTotal = entries.reduce((total, entry) => total + entry.value, 0);
  const preExhaustionTotal =
    totalOverride === null ? baseTotal : Math.max(0, Math.min(baseTotal, totalOverride));

  if (totalOverride !== null && preExhaustionTotal !== baseTotal) {
    const overrideBonus = featureBonuses.find((bonus) => bonus.setTotal === totalOverride);

    entries.push({
      label: overrideBonus?.label ?? "Speed Override",
      value: preExhaustionTotal - baseTotal
    });
  }

  const exhaustionAdjustment = getExhaustionSpeedAdjustment(
    preExhaustionTotal,
    character.statusEntries
  );

  if (exhaustionAdjustment && exhaustionAdjustment.value !== 0) {
    entries.push(exhaustionAdjustment);
  }

  return {
    total: Math.max(
      0,
      entries.reduce((total, entry) => total + entry.value, 0)
    ),
    source,
    entries
  };
}

export function getSpeedForCharacter(character: Character): number {
  return getSpeedBreakdownForCharacter(character).total;
}
