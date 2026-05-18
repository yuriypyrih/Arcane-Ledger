import type { Character } from "../../../types";
import { createDefaultCurrencies } from "../constants";
import { normalizeArmorClassFormulaSelection, normalizeCharacterArmorWearState } from "../armor";
import { normalizeCustomEquipmentEntries } from "../customEquipment";
import { normalizeCharacterInventoryItems } from "../inventoryItems";
import {
  normalizeCharacterEquipmentSelections,
  normalizeCharacterProficiencies
} from "../proficiency";
import { normalizeCharacter, normalizeCharacterCurrencies } from "../storage";
import { normalizeCharacterStatusEntries } from "../statusEntries";
import {
  getSpeciesAlwaysPreparedSpellIdsForCharacter,
  normalizeCharacterSpeciesFeatureState,
  normalizeSpeciesStatusEntriesForCharacter
} from "../species";
import {
  getAlwaysPreparedSpellIds,
  getCantripLimitForCharacter,
  getCantripSelectionOptionsForCharacter,
  getPreparedSpellLimitForCharacter,
  getPreparedSpellSelectionOptionsForCharacter,
  getSpellSlotTotalsForCharacter,
  normalizePreparedSpellIds,
  normalizeSpellbookSpellIds,
  normalizeSpellSlotsExpended,
  usesSpellbookForCharacter
} from "../spellcasting";
import {
  getAlwaysSpellbookSpellIdsForCharacter,
  clearRoundScopedFeatureStateForCharacter,
  normalizeCharacterClassFeatureState
} from "../classFeatures";
import { shouldTrackRoundScopedResources } from "../combat";
import { reconcileCharacterStatusConsequences } from "../traits";
import { characterSheetDomains, type CharacterSheetDomain } from "./domains";

function hasDomain(domains: readonly CharacterSheetDomain[], domain: CharacterSheetDomain) {
  return domains.includes(domain);
}

function normalizeRuntimeSpellId(value: string): string {
  return value.trim();
}

function normalizeRuntimeSpellIds(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((spellId): spellId is string => typeof spellId === "string")
        .map(normalizeRuntimeSpellId)
        .filter((spellId) => spellId.length > 0)
    : [];
}

function normalizeEquipmentRuntime(character: Character): Character {
  const normalizedEquipment = normalizeCharacterEquipmentSelections(character.equipment);
  const normalizedInventoryItems = normalizeCharacterInventoryItems(character.inventoryItems);
  const normalizedCustomEquipment = normalizeCustomEquipmentEntries(character.customEquipment);
  const normalizedArmorWearState = normalizeCharacterArmorWearState(
    normalizedEquipment,
    normalizedInventoryItems,
    normalizedCustomEquipment
  );

  return {
    ...character,
    currencies: normalizeCharacterCurrencies(character.currencies, createDefaultCurrencies()),
    equipment: normalizedArmorWearState.equipment,
    inventoryItems: normalizedArmorWearState.inventoryItems,
    customEquipment: normalizedArmorWearState.customEquipment,
    armorClassFormulaSelection: normalizeArmorClassFormulaSelection(
      character.armorClassFormulaSelection,
      {
        className: character.className,
        level: character.level,
        subclassId: character.subclassId,
        classFeatureState: character.classFeatureState,
        equipment: normalizedArmorWearState.equipment,
        inventoryItems: normalizedArmorWearState.inventoryItems,
        customEquipment: normalizedArmorWearState.customEquipment,
        statusEntries: character.statusEntries
      }
    )
  };
}

function normalizeStatusRuntime(character: Character): Character {
  return reconcileCharacterStatusConsequences({
    ...character,
    statusEntries: normalizeSpeciesStatusEntriesForCharacter({
      species: character.species,
      level: character.level,
      statusEntries: normalizeCharacterStatusEntries(character.statusEntries)
    })
  });
}

function normalizeFeatureRuntime(character: Character): Character {
  const normalizedCharacter = {
    ...character,
    speciesFeatureState: normalizeCharacterSpeciesFeatureState(
      character.species,
      character.speciesFeatureState
    ),
    classFeatureState: normalizeCharacterClassFeatureState(character.classFeatureState, {
      className: character.className,
      level: character.level,
      subclassId: character.subclassId,
      abilities: character.abilities,
      cantripIds: character.cantripIds,
      feats: character.feats
    })
  };

  return shouldTrackRoundScopedResources(normalizedCharacter.roundTracker)
    ? normalizedCharacter
    : clearRoundScopedFeatureStateForCharacter(normalizedCharacter);
}

function normalizeSpellRuntime(character: Character): Character {
  const rawPersistedCantripIds = normalizeRuntimeSpellIds(character.cantripIds);
  const rawCantripIds = rawPersistedCantripIds;
  const cantripSelectionOptionIds = new Set(
    getCantripSelectionOptionsForCharacter(
      character.className,
      character.level,
      character.subclassId
    ).map((spell) => spell.id)
  );
  const cantripLimit = getCantripLimitForCharacter(
    character.className,
    character.level,
    character.classFeatureState,
    character.subclassId
  );
  const normalizedCantripIds = [...new Set(rawCantripIds)]
    .filter((spellId) => cantripSelectionOptionIds.has(spellId))
    .slice(0, cantripLimit ?? Number.POSITIVE_INFINITY);
  const normalizedClassFeatureState = normalizeCharacterClassFeatureState(
    character.classFeatureState,
    {
      className: character.className,
      level: character.level,
      subclassId: character.subclassId,
      abilities: character.abilities,
      cantripIds: normalizedCantripIds,
      feats: character.feats
    }
  );
  const rawPreparedSpellIds = normalizeRuntimeSpellIds(character.preparedSpellIds);
  const preparedSpellSelectionOptions = getPreparedSpellSelectionOptionsForCharacter(
    character.className,
    character.level,
    character.subclassId
  );
  const preparedSpellSelectionOptionIds = new Set(
    preparedSpellSelectionOptions.map((spell) => spell.id)
  );
  const rawSpellbookSpellIds = Array.isArray(character.spellbookSpellIds)
    ? normalizeRuntimeSpellIds(character.spellbookSpellIds)
    : usesSpellbookForCharacter(character.className, character.subclassId)
      ? rawPreparedSpellIds
      : [];
  const alwaysSpellbookSpellIds = getAlwaysSpellbookSpellIdsForCharacter({
    className: character.className,
    level: character.level,
    classFeatureState: normalizedClassFeatureState,
    spellbookSpellIds: rawSpellbookSpellIds,
    subclassId: character.subclassId
  });
  const alwaysSpellbookSpellIdSet = new Set(alwaysSpellbookSpellIds);
  const normalizedSpellbookSpellIds = usesSpellbookForCharacter(
    character.className,
    character.subclassId
  )
    ? normalizeSpellbookSpellIds(
        rawSpellbookSpellIds.filter(
          (spellId) =>
            preparedSpellSelectionOptionIds.has(spellId) && !alwaysSpellbookSpellIdSet.has(spellId)
        ),
        preparedSpellSelectionOptions
      )
    : [];
  const normalizedSpellbookSpellIdSet = new Set([
    ...normalizedSpellbookSpellIds,
    ...alwaysSpellbookSpellIds
  ]);
  const normalizedPreparedSpellIds = normalizePreparedSpellIds(
    rawPreparedSpellIds.filter(
      (spellId) =>
        preparedSpellSelectionOptionIds.has(spellId) &&
        (!usesSpellbookForCharacter(character.className, character.subclassId) ||
          normalizedSpellbookSpellIdSet.has(spellId))
    ),
    preparedSpellSelectionOptions,
    getPreparedSpellLimitForCharacter(character.className, character.level, character.subclassId),
    [
      ...getAlwaysPreparedSpellIds(
        character.className,
        character.level,
        normalizedClassFeatureState,
        undefined,
        character.subclassId,
        character.statusEntries
      ),
      ...getSpeciesAlwaysPreparedSpellIdsForCharacter(character)
    ]
  );
  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    character.className,
    character.level,
    character.subclassId
  );

  return {
    ...character,
    speciesFeatureState: normalizeCharacterSpeciesFeatureState(
      character.species,
      character.speciesFeatureState
    ),
    classFeatureState: normalizedClassFeatureState,
    cantripIds: normalizedCantripIds,
    spellbookSpellIds: normalizedSpellbookSpellIds,
    preparedSpellIds: normalizedPreparedSpellIds,
    spellSlotsExpended: normalizeSpellSlotsExpended(character.spellSlotsExpended, spellSlotTotals)
  };
}

function normalizeProficiencyRuntime(character: Character): Character {
  const normalizedProficiencies = normalizeCharacterProficiencies({
    className: character.className,
    level: character.level,
    species: character.species,
    speciesChoices: character.speciesChoices,
    background: character.background,
    backgroundChoices: character.backgroundChoices,
    subclassId: character.subclassId,
    classFeatureState: character.classFeatureState,
    skillProficiencies: character.skillProficiencies,
    savingThrowProficiencies: character.savingThrowProficiencies,
    weaponProficiencies: character.weaponProficiencies,
    armorProficiencies: character.armorProficiencies,
    toolProficiencies: character.toolProficiencies,
    languageProficiencies: character.languageProficiencies,
    feats: character.feats ?? []
  });

  return {
    ...character,
    skillProficiencies: normalizedProficiencies.skillProficiencies,
    savingThrowProficiencies: normalizedProficiencies.savingThrowProficiencies,
    weaponProficiencies: normalizedProficiencies.weaponProficiencies,
    armorProficiencies: normalizedProficiencies.armorProficiencies,
    toolProficiencies: normalizedProficiencies.toolProficiencies,
    languageProficiencies: normalizedProficiencies.languageProficiencies
  };
}

export function normalizeCharacterRuntimeUpdate(
  character: Character,
  domains: readonly CharacterSheetDomain[] = characterSheetDomains
): Character {
  const shouldUseFullNormalization =
    hasDomain(domains, "profile") || hasDomain(domains, "companions");

  if (shouldUseFullNormalization) {
    return normalizeCharacter(character) ?? character;
  }

  let nextCharacter = character;

  if (hasDomain(domains, "equipment") || hasDomain(domains, "inventory")) {
    nextCharacter = normalizeEquipmentRuntime(nextCharacter);
  }

  if (hasDomain(domains, "features")) {
    nextCharacter = normalizeFeatureRuntime(nextCharacter);
  }

  if (hasDomain(domains, "statuses") || hasDomain(domains, "resources")) {
    nextCharacter = normalizeStatusRuntime(nextCharacter);
  }

  if (hasDomain(domains, "spells")) {
    nextCharacter = normalizeSpellRuntime(nextCharacter);
  }

  if (hasDomain(domains, "proficiencies")) {
    nextCharacter = normalizeProficiencyRuntime(nextCharacter);
  }

  return nextCharacter;
}
