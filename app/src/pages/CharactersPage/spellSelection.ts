import type { Character } from "../../types";
import {
  getWarlockEldritchInvocationLimitForCharacter,
  getWarlockInvocationOptionsForCharacter,
  getWarlockInvocationSelectionIdsForCharacter
} from "./classFeatures";
import {
  getAlwaysPreparedSpellIds,
  getCantripLimitForCharacter,
  getCantripSelectionOptionsForCharacter,
  getPreparedSpellLimitForCharacter,
  getPreparedSpellSelectionOptionsForCharacter,
  normalizePreparedSpellIds,
  normalizeSpellbookSpellIds,
  normalizeTrackedSpellIds,
  usesPreparedSpellsForCharacter,
  usesSpellbookForCharacter
} from "./spellcasting";

export type SpellSelectionInputStatus = {
  hasInputRequired: boolean;
  needsCantrips: boolean;
  needsPreparedSpells: boolean;
  needsInvocations: boolean;
  message: string | null;
};

function formatInputRequirementList(items: string[]): string {
  if (items.length <= 1) {
    return items[0] ?? "";
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function getSpellSelectionInputStatusForCharacter(
  character: Pick<
    Character,
    | "className"
    | "level"
    | "subclassId"
    | "classFeatureState"
    | "cantripIds"
    | "preparedSpellIds"
    | "spellbookSpellIds"
    | "feats"
  >
): SpellSelectionInputStatus {
  const cantripLimit = getCantripLimitForCharacter(
    character.className,
    character.level,
    character.classFeatureState
  );
  const cantripOptions = getCantripSelectionOptionsForCharacter(character.className, character.level);
  const selectedCantripIds = normalizeTrackedSpellIds(
    character.cantripIds,
    cantripOptions,
    cantripLimit
  );
  const needsCantrips =
    cantripLimit !== null &&
    selectedCantripIds.length < cantripLimit &&
    cantripOptions.length > selectedCantripIds.length;

  const preparedSpellLimit = getPreparedSpellLimitForCharacter(character.className, character.level);
  const usesPreparedSpells = usesPreparedSpellsForCharacter(character.className, character.level);
  const usesSpellbook = usesSpellbookForCharacter(character.className);
  const spellPreparationOptions = getPreparedSpellSelectionOptionsForCharacter(
    character.className,
    character.level
  );
  const alwaysPreparedSpellIds = getAlwaysPreparedSpellIds(
    character.className,
    character.level,
    character.classFeatureState,
    character.spellbookSpellIds,
    character.subclassId
  );
  const selectedSpellbookSpellIds = usesSpellbook
    ? normalizeSpellbookSpellIds(character.spellbookSpellIds, spellPreparationOptions)
    : [];
  const selectedSpellbookSpellIdSet = new Set(selectedSpellbookSpellIds);
  const selectedPreparedSpellIds = normalizePreparedSpellIds(
    character.preparedSpellIds,
    spellPreparationOptions,
    preparedSpellLimit,
    alwaysPreparedSpellIds
  ).filter((spellId) => !usesSpellbook || selectedSpellbookSpellIdSet.has(spellId));
  const needsPreparedSpells =
    usesPreparedSpells &&
    preparedSpellLimit !== null &&
    selectedPreparedSpellIds.length < preparedSpellLimit &&
    spellPreparationOptions.length > selectedPreparedSpellIds.length;

  const eldritchInvocationLimit = getWarlockEldritchInvocationLimitForCharacter(character);
  const selectedInvocationIds = getWarlockInvocationSelectionIdsForCharacter(character);
  const hasRemainingQualifiedInvocationOption =
    eldritchInvocationLimit > 0 &&
    getWarlockInvocationOptionsForCharacter(character, selectedInvocationIds).some(
      (option) =>
        option.isQualified &&
        !option.isPlaceholder &&
        !selectedInvocationIds.includes(option.selectionId)
    );
  const needsInvocations =
    eldritchInvocationLimit > 0 &&
    selectedInvocationIds.length < eldritchInvocationLimit &&
    hasRemainingQualifiedInvocationOption;

  const missingInputLabels = [
    needsCantrips ? "cantrips" : null,
    needsPreparedSpells ? "spells" : null,
    needsInvocations ? "eldritch invocations" : null
  ].filter((label): label is string => label !== null);

  return {
    hasInputRequired: missingInputLabels.length > 0,
    needsCantrips,
    needsPreparedSpells,
    needsInvocations,
    message:
      missingInputLabels.length > 0
        ? `Input required: choose your remaining ${formatInputRequirementList(missingInputLabels)} in the Spellcasting section.`
        : null
  };
}
