import type { SpellEntry } from "../../../../codex/entries";
import type { Character } from "../../../../types";
import {
  getWarlockInvocationSelectionIdsForCharacter,
  normalizeWarlockInvocationSelectionIdsForCharacter,
  setWarlockInvocationSelectionIdsForCharacter,
  syncWizardSignatureSpellsToSpellbookForCharacter,
  syncWizardSpellMasterySelectionsToSpellbookForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import {
  normalizePreparedSpellIds,
  normalizeSpellbookSpellIds,
  normalizeTrackedSpellIds
} from "../../../../pages/CharactersPage/spellcasting";
import { areSpellIdListsEqual } from "../../../../pages/CharactersPage/shared";

type CantripDraftOptions = {
  cantripDraftIds: string[];
  cantripLimit: number | null;
  cantripOptions: SpellEntry[];
};

type PreparedSpellDraftOptions = {
  alwaysPreparedSpellIds: string[];
  alwaysSpellbookSpellIds: string[];
  preparedSpellDraftIds: string[];
  preparedSpellLimit: number | null;
  spellPreparationOptions: SpellEntry[];
  spellbookDraftIds: string[];
  usesSpellbook: boolean;
};

type InvocationDraftOptions = {
  invocationDraftIds: string[];
};

export type SpellManagementDraft = {
  cantripDraftIds: string[];
  invocationDraftIds: string[];
  preparedSpellDraftIds: string[];
  spellbookDraftIds: string[];
};

type SpellManagementDraftOptions = CantripDraftOptions &
  PreparedSpellDraftOptions &
  InvocationDraftOptions;

function getManualSpellbookSpellIds(
  spellIds: unknown,
  spellPreparationOptions: SpellEntry[],
  alwaysSpellbookSpellIds: string[]
): string[] {
  const alwaysSpellbookSpellIdSet = new Set(alwaysSpellbookSpellIds);

  return normalizeSpellbookSpellIds(spellIds, spellPreparationOptions).filter(
    (spellId) => !alwaysSpellbookSpellIdSet.has(spellId)
  );
}

function syncWizardSpellbookFeatureSelections(character: Character): Character {
  return character.className === "Wizard"
    ? syncWizardSignatureSpellsToSpellbookForCharacter(
        syncWizardSpellMasterySelectionsToSpellbookForCharacter(character)
      )
    : character;
}

export function applyCantripDraftToCharacter(
  currentCharacter: Character,
  { cantripDraftIds, cantripLimit, cantripOptions }: CantripDraftOptions
): Character {
  const nextCantripIds = normalizeTrackedSpellIds(cantripDraftIds, cantripOptions, cantripLimit);
  const currentCantripIds = normalizeTrackedSpellIds(
    currentCharacter.cantripIds,
    cantripOptions,
    cantripLimit
  );

  return areSpellIdListsEqual(currentCantripIds, nextCantripIds)
    ? currentCharacter
    : {
        ...currentCharacter,
        cantripIds: nextCantripIds
      };
}

export function applyPreparedSpellDraftToCharacter(
  currentCharacter: Character,
  {
    alwaysPreparedSpellIds,
    alwaysSpellbookSpellIds,
    preparedSpellDraftIds,
    preparedSpellLimit,
    spellPreparationOptions,
    spellbookDraftIds,
    usesSpellbook
  }: PreparedSpellDraftOptions
): Character {
  const nextSpellbookIds = usesSpellbook
    ? getManualSpellbookSpellIds(
        spellbookDraftIds,
        spellPreparationOptions,
        alwaysSpellbookSpellIds
      )
    : [];
  const nextAvailableSpellbookIdSet = new Set(
    normalizeSpellbookSpellIds(nextSpellbookIds, spellPreparationOptions, alwaysSpellbookSpellIds)
  );
  const nextPreparedSpellIds = normalizePreparedSpellIds(
    usesSpellbook
      ? preparedSpellDraftIds.filter((spellId) => nextAvailableSpellbookIdSet.has(spellId))
      : preparedSpellDraftIds,
    spellPreparationOptions,
    preparedSpellLimit,
    alwaysPreparedSpellIds
  );
  const currentSpellbookIds = usesSpellbook
    ? getManualSpellbookSpellIds(
        currentCharacter.spellbookSpellIds,
        spellPreparationOptions,
        alwaysSpellbookSpellIds
      )
    : [];
  const currentPreparedSpellIds = normalizePreparedSpellIds(
    currentCharacter.preparedSpellIds,
    spellPreparationOptions,
    preparedSpellLimit,
    alwaysPreparedSpellIds
  );

  if (
    areSpellIdListsEqual(currentSpellbookIds, nextSpellbookIds) &&
    areSpellIdListsEqual(currentPreparedSpellIds, nextPreparedSpellIds)
  ) {
    return currentCharacter;
  }

  return syncWizardSpellbookFeatureSelections({
    ...currentCharacter,
    spellbookSpellIds: nextSpellbookIds,
    preparedSpellIds: nextPreparedSpellIds
  });
}

export function applyInvocationDraftToCharacter(
  currentCharacter: Character,
  { invocationDraftIds }: InvocationDraftOptions
): Character {
  const nextInvocationIds = normalizeWarlockInvocationSelectionIdsForCharacter(
    currentCharacter,
    invocationDraftIds
  );
  const currentInvocationIds = getWarlockInvocationSelectionIdsForCharacter(currentCharacter);

  return areSpellIdListsEqual(currentInvocationIds, nextInvocationIds)
    ? currentCharacter
    : setWarlockInvocationSelectionIdsForCharacter(currentCharacter, nextInvocationIds);
}

export function applySpellManagementDraftToCharacter(
  currentCharacter: Character,
  options: SpellManagementDraftOptions
): Character {
  const characterWithCantrips = applyCantripDraftToCharacter(currentCharacter, options);
  const characterWithPreparedSpells = applyPreparedSpellDraftToCharacter(
    characterWithCantrips,
    options
  );

  return applyInvocationDraftToCharacter(characterWithPreparedSpells, options);
}
