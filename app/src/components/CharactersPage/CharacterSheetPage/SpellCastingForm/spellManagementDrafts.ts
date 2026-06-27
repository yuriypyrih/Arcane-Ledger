import type { CustomSpellRecord } from "../../../../api/customSpells";
import type { SpellEntry } from "../../../../codex/entries";
import type { Character, CharacterCustomSpellSnapshot } from "../../../../types";
import {
  syncWizardSignatureSpellsToSpellbookForCharacter,
  syncWizardSpellMasterySelectionsToSpellbookForCharacter
} from "../../../../pages/CharactersPage/classFeatures";
import {
  createCharacterCustomSpellSnapshotFromRecord,
  createCustomSpellEntryId,
  isCustomSpellEntryId,
  normalizeCharacterCustomSpellSnapshots
} from "../../../../pages/CharactersPage/customSpells";
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

type CustomSpellSnapshotDraftOptions = {
  customSpellRecords?: CustomSpellRecord[];
};

export type SpellManagementDraft = {
  cantripDraftIds: string[];
  preparedSpellDraftIds: string[];
  spellbookDraftIds: string[];
};

type SpellManagementDraftOptions = CantripDraftOptions &
  PreparedSpellDraftOptions &
  CustomSpellSnapshotDraftOptions;

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

function getSelectedCustomSpellIds(character: Character): string[] {
  return [
    ...(character.cantripIds ?? []),
    ...(character.spellbookSpellIds ?? []),
    ...(character.preparedSpellIds ?? [])
  ].filter((spellId, index, spellIds) => isCustomSpellEntryId(spellId) && spellIds.indexOf(spellId) === index);
}

function areCustomSpellSnapshotsEqual(
  left: CharacterCustomSpellSnapshot[],
  right: CharacterCustomSpellSnapshot[]
) {
  return (
    left.length === right.length &&
    left.every((snapshot, index) => snapshot.spell.id === right[index]?.spell.id)
  );
}

function syncCustomSpellSnapshotsToSelectedIds(
  character: Character,
  customSpellRecords: CustomSpellRecord[] = []
): Character {
  const selectedCustomSpellIds = getSelectedCustomSpellIds(character);
  const existingSnapshots = normalizeCharacterCustomSpellSnapshots(character.customSpellSnapshots);
  const existingSnapshotsBySpellId = new Map(
    existingSnapshots.map((snapshot) => [snapshot.spell.id, snapshot])
  );
  const recordsBySpellId = new Map(
    customSpellRecords.map((record) => [createCustomSpellEntryId(record.id), record])
  );
  const nextSnapshots = selectedCustomSpellIds
    .map((spellId) => {
      const existingSnapshot = existingSnapshotsBySpellId.get(spellId);

      if (existingSnapshot) {
        return existingSnapshot;
      }

      const customSpellRecord = recordsBySpellId.get(spellId);

      return customSpellRecord
        ? createCharacterCustomSpellSnapshotFromRecord(customSpellRecord)
        : null;
    })
    .filter((snapshot): snapshot is CharacterCustomSpellSnapshot => snapshot !== null);

  if (areCustomSpellSnapshotsEqual(existingSnapshots, nextSnapshots)) {
    return character;
  }

  return {
    ...character,
    customSpellSnapshots: nextSnapshots
  };
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

export function applySpellManagementDraftToCharacter(
  currentCharacter: Character,
  options: SpellManagementDraftOptions
): Character {
  const characterWithCantrips = applyCantripDraftToCharacter(currentCharacter, options);
  const characterWithPreparedSpells = applyPreparedSpellDraftToCharacter(
    characterWithCantrips,
    options
  );

  return syncCustomSpellSnapshotsToSelectedIds(
    characterWithPreparedSpells,
    options.customSpellRecords
  );
}
