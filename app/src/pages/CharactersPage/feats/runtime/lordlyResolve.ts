import { FEATS, type SpellDescriptionEntry } from "../../../../codex/entries";
import {
  STATUS_DURATION_KIND,
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_GROUP,
  STATUS_ENTRY_SOURCE_TYPE,
  type Character,
  type CharacterStatusEntry
} from "../../../../types";
import { ACTION_CATEGORY, ECONOMY_TYPE } from "../../actionEconomy";
import { createChargesCardUsage, createChargesHeaderTag } from "../../classFeatures/cardUsage";
import type { FeatureActionCard } from "../../classFeatures/types";
import {
  createCharacterStatusEntry,
  normalizeCharacterStatusEntries
} from "../../statusEntries";
import { getFeatDefinition } from "..";
import {
  lordlyResolveStandardBearerActionKey,
  lordlyResolveStandardBearerStatusSourceId
} from "./constants";
import { filterDescriptionEntries } from "./descriptionMatchers";

export const lordlyResolveName = "Lordly Resolve";
export const lordlyResolveStandardBearerName = "Standard Bearer";

export function isLordlyResolveStandardBearerDescriptionEntry(entry: string): boolean {
  return (
    entry.startsWith("<strong>Standard Bearer.</strong>") ||
    entry.startsWith("Once you use this benefit")
  );
}

export function getLordlyResolveStandardBearerDescription(
  description: SpellDescriptionEntry[]
): SpellDescriptionEntry[] {
  return filterDescriptionEntries(description, isLordlyResolveStandardBearerDescriptionEntry);
}

export function hasActiveLordlyResolveStandardBearerStatus(
  statusEntries: Character["statusEntries"]
): boolean {
  return normalizeCharacterStatusEntries(statusEntries).some(
    (entry) =>
      entry.group === STATUS_ENTRY_GROUP.EFFECTS &&
      entry.sourceId === lordlyResolveStandardBearerStatusSourceId &&
      entry.disabled !== true
  );
}

function clearLordlyResolveStandardBearerStatuses(
  statusEntries: Character["statusEntries"]
): CharacterStatusEntry[] {
  return normalizeCharacterStatusEntries(statusEntries).filter(
    (entry) => entry.sourceId !== lordlyResolveStandardBearerStatusSourceId
  );
}

function getDefaultLordlyResolveStandardBearerDescription(): SpellDescriptionEntry[] {
  return getLordlyResolveStandardBearerDescription(
    getFeatDefinition(FEATS.LORDLY_RESOLVE)?.description ?? []
  );
}

function createLordlyResolveStandardBearerStatusEntry(
  description: SpellDescriptionEntry[] = getDefaultLordlyResolveStandardBearerDescription()
): CharacterStatusEntry {
  return createCharacterStatusEntry({
    group: STATUS_ENTRY_GROUP.EFFECTS,
    value: lordlyResolveStandardBearerName,
    source: lordlyResolveName,
    sourceType: STATUS_ENTRY_SOURCE_TYPE.MANUAL,
    duration: {
      kind: STATUS_DURATION_KIND.ROUNDS,
      amount: 10,
      tickOn: STATUS_DURATION_ROUND_TICK.ROUND_END
    },
    sourceId: lordlyResolveStandardBearerStatusSourceId,
    description: description
      .filter((entry): entry is string => typeof entry === "string")
      .join("\n")
  });
}

export function createLordlyResolveStandardBearerAction(
  remaining: number,
  total: number,
  isActive: boolean,
  description: SpellDescriptionEntry[]
): FeatureActionCard {
  const chargesTag = createChargesHeaderTag(remaining, total);
  const disabledReason = isActive
    ? "Standard Bearer is already active."
    : remaining > 0
      ? undefined
      : "Standard Bearer recharges when you finish a Long Rest.";

  return {
    key: lordlyResolveStandardBearerActionKey,
    name: lordlyResolveStandardBearerName,
    actionSource: {
      type: "feat",
      name: lordlyResolveName
    },
    summary: `Charge ${remaining}/${total}`,
    detail: "Bolster nearby allies' resolve.",
    breakdown: isActive ? "Resolve active" : "Bolster nearby allies",
    economyType: ECONOMY_TYPE.BONUS_ACTION,
    actionCategory: ACTION_CATEGORY.FEATURE,
    usesRemaining: remaining,
    usesTotal: total,
    hideUsesTrackerOnCard: true,
    cardUsage: createChargesCardUsage(remaining, total),
    isActive,
    disabled: isActive || remaining <= 0,
    disabledReason,
    description,
    headerTags: [chargesTag],
    drawer: {
      kind: "confirm",
      description,
      confirmLabel: "Use Standard Bearer",
      headerTags: [chargesTag],
      blockedReason: disabledReason
    },
    execute: {
      kind: "activate",
      label: "Use Standard Bearer"
    }
  };
}

export function applyLordlyResolveStandardBearerStatusForCharacter(
  character: Character
): Character {
  return {
    ...character,
    statusEntries: [
      ...clearLordlyResolveStandardBearerStatuses(character.statusEntries),
      createLordlyResolveStandardBearerStatusEntry()
    ]
  };
}
