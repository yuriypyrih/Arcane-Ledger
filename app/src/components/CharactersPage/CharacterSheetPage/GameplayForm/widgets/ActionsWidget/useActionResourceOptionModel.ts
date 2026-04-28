import { useMemo } from "react";
import type { Character } from "../../../../../../types";
import {
  getDruidNatureMagicianOptionsForCharacter,
  getDruidWildResurgenceAvailableSpellSlotLevelsForCharacter
} from "../../../../../../pages/CharactersPage/classFeatures";
import {
  getSpellcastingRuntimeForCharacter,
  type SpellSlotRuntimeOption
} from "../../../../../../pages/CharactersPage/characterRuntime/spellcastingRuntime";

export function useActionResourceOptionModel(character: Character) {
  const spellcastingRuntime = useMemo(
    () => getSpellcastingRuntimeForCharacter(character, { includeSubclassSlots: false }),
    [character]
  );
  const fixedSpellSlotTotals = spellcastingRuntime.spellSlotTotals;
  const fixedSpellSlotsExpended = spellcastingRuntime.spellSlotsExpended;
  const fixedSpellSlotsRemaining = spellcastingRuntime.spellSlotsRemaining;
  const wildCompanionSpellSlotOptions = spellcastingRuntime.spellSlotOptions;
  const bardicInspirationFallbackSpellSlotOptions =
    spellcastingRuntime.availableSpellSlotOptions;
  const beastMasterReviveSpellSlotOptions = spellcastingRuntime.availableSpellSlotOptions;
  const firstAvailableBardicInspirationSpellSlotLevel =
    bardicInspirationFallbackSpellSlotOptions[0]?.level ?? null;
  const firstAvailableBeastMasterReviveSpellSlotLevel =
    beastMasterReviveSpellSlotOptions[0]?.level ?? null;
  const firstAvailableWildCompanionSpellSlotLevel =
    wildCompanionSpellSlotOptions.find((slot) => slot.remaining > 0)?.level ?? null;
  const wildResurgenceAvailableSpellSlotLevels = useMemo(
    () => getDruidWildResurgenceAvailableSpellSlotLevelsForCharacter(character),
    [character]
  );
  const wildResurgenceSpellSlotOptions = useMemo<SpellSlotRuntimeOption[]>(
    () =>
      fixedSpellSlotTotals.flatMap((total, index) =>
        total > 0 && wildResurgenceAvailableSpellSlotLevels.includes(index + 1)
          ? [
              {
                level: index + 1,
                remaining: fixedSpellSlotsRemaining[index] ?? 0,
                total
              }
            ]
          : []
      ),
    [fixedSpellSlotTotals, fixedSpellSlotsRemaining, wildResurgenceAvailableSpellSlotLevels]
  );
  const firstAvailableWildResurgenceSpellSlotLevel =
    wildResurgenceSpellSlotOptions.find((slot) => slot.remaining > 0)?.level ?? null;
  const natureMagicianOptions = useMemo(
    () => getDruidNatureMagicianOptionsForCharacter(character),
    [character]
  );

  return {
    spellcastingRuntime,
    spellcastingState: spellcastingRuntime.spellcastingState,
    beguilingMagicUsesTotal: spellcastingRuntime.beguilingMagicUsesTotal,
    beguilingMagicUsesRemaining: spellcastingRuntime.beguilingMagicUsesRemaining,
    bardicInspirationUsesRemaining: spellcastingRuntime.bardicInspirationUsesRemaining,
    fixedSpellSlotTotals,
    fixedSpellSlotsExpended,
    fixedSpellSlotsRemaining,
    wildCompanionSpellSlotOptions,
    bardicInspirationFallbackSpellSlotOptions,
    beastMasterReviveSpellSlotOptions,
    firstAvailableBardicInspirationSpellSlotLevel,
    firstAvailableBeastMasterReviveSpellSlotLevel,
    firstAvailableWildCompanionSpellSlotLevel,
    wildResurgenceAvailableSpellSlotLevels,
    wildResurgenceSpellSlotOptions,
    firstAvailableWildResurgenceSpellSlotLevel,
    natureMagicianOptions
  };
}
