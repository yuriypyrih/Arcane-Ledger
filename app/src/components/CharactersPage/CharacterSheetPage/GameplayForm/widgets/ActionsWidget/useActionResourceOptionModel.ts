import { useMemo } from "react";
import type { Character } from "../../../../../../types";
import {
  getDruidNatureMagicianOptionsForCharacter,
  getDruidWildResurgenceAvailableSpellSlotLevelsForCharacter
} from "../../../../../../pages/CharactersPage/classFeatures";
import { getCharacterRuntime } from "../../../../../../pages/CharactersPage/characterRuntime/characterRuntime";
import type { SpellSlotRuntimeOption } from "../../../../../../pages/CharactersPage/characterRuntime/spellcastingRuntime";

export function useActionResourceOptionModel(character: Character) {
  const { classFeatureState, className, level, spellSlotsExpended, subclassId } = character;
  const druidFeatureState = classFeatureState?.druid;
  const characterRuntime = useMemo(() => getCharacterRuntime(character), [character]);
  const spellcastingRuntime = characterRuntime.spellcastingWithoutSubclassSlots;
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
    () =>
      getDruidWildResurgenceAvailableSpellSlotLevelsForCharacter({
        classFeatureState: { druid: druidFeatureState },
        className,
        level,
        spellSlotsExpended,
        subclassId
      }),
    [className, druidFeatureState, level, spellSlotsExpended, subclassId]
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
    () =>
      getDruidNatureMagicianOptionsForCharacter({
        classFeatureState: { druid: druidFeatureState },
        className,
        level,
        spellSlotsExpended,
        subclassId
      }),
    [className, druidFeatureState, level, spellSlotsExpended, subclassId]
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
