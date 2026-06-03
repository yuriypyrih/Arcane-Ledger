import { useMemo } from "react";
import type { ReactionEntry, SpellEntry } from "../../../../../../codex/entries";
import { getCharacterRuntime } from "../../../../../../pages/CharactersPage/characterRuntime/characterRuntime";
import type { StatusRuntimeSection } from "../../../../../../pages/CharactersPage/characterRuntime/statusRuntime";
import type { Character, CharacterStatusEntry } from "../../../../../../types";

export type StatusSection = StatusRuntimeSection;

type UseTraitsConditionsSectionsOptions = {
  character: Character;
  selectedStatusEntryId: string | null;
};

export type TraitsConditionsSectionsState = {
  classSpellEntriesById: Map<string, SpellEntry>;
  featureReactionEntries: ReactionEntry[];
  selectedReactionEntry: ReactionEntry | null;
  selectedStatusEntry: CharacterStatusEntry | null;
  spellSlotTotals: number[];
  spellSlotsExpended: number[];
  spellSlotsRemaining: number[];
  statusEntries: CharacterStatusEntry[];
  statusSections: StatusSection[];
};

export function useTraitsConditionsSections({
  character,
  selectedStatusEntryId
}: UseTraitsConditionsSectionsOptions): TraitsConditionsSectionsState {
  const statusRuntime = useMemo(() => getCharacterRuntime(character).status, [character]);
  const selectedStatusEntry = statusRuntime.getStatusEntryById(selectedStatusEntryId);
  const selectedReactionEntry = statusRuntime.getReactionEntryForStatus(selectedStatusEntry);

  return {
    classSpellEntriesById: statusRuntime.spellEntriesById,
    featureReactionEntries: statusRuntime.featureReactionEntries,
    selectedReactionEntry,
    selectedStatusEntry,
    spellSlotTotals: statusRuntime.spellSlotTotals,
    spellSlotsExpended: statusRuntime.spellSlotsExpended,
    spellSlotsRemaining: statusRuntime.spellSlotsRemaining,
    statusEntries: statusRuntime.statusEntries,
    statusSections: statusRuntime.statusSections
  };
}
