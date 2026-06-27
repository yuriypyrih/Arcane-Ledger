import type { Character } from "../../../types";
import { createDefaultCurrencies } from "../constants";
import { normalizeArmorClassFormulaSelection, normalizeCharacterArmorWearState } from "../armor";
import { normalizeCustomEquipmentEntries } from "../customEquipment";
import { convertLegacyEquipmentToInventoryItems } from "../legacyEquipmentItems";
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
  getCustomCantripSelectionOptionsForCharacter,
  getCustomPreparedSpellSelectionOptionsForCharacter,
  mergeSpellEntriesById,
  normalizeCharacterCustomSpellSnapshots,
  pruneCharacterCustomSpellSnapshotsForSelectedIds
} from "../customSpells";
import {
  getAlwaysSpellbookSpellIdsForCharacter,
  clearRoundScopedFeatureStateForCharacter,
  normalizeCharacterClassFeatureState
} from "../classFeatures";
import { shouldTrackRoundScopedResources } from "../combat";
import {
  isCustomClassName,
  normalizeCharacterClassRulesConfig,
  normalizeCustomClassConfig
} from "../customClass";
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
  const normalizedCustomEquipment = normalizeCustomEquipmentEntries(character.customEquipment);
  const normalizedInventoryItems = normalizeCharacterInventoryItems([
    ...normalizeCharacterInventoryItems(character.inventoryItems),
    ...convertLegacyEquipmentToInventoryItems(normalizedEquipment, normalizedCustomEquipment)
  ]);
  const normalizedArmorWearState = normalizeCharacterArmorWearState(
    [],
    normalizedInventoryItems,
    []
  );

  return {
    ...character,
    currencies: normalizeCharacterCurrencies(character.currencies, createDefaultCurrencies()),
    equipment: [],
    inventoryItems: normalizedArmorWearState.inventoryItems,
    customEquipment: [],
    armorClassFormulaSelection: normalizeArmorClassFormulaSelection(
      character.armorClassFormulaSelection,
      {
        className: character.className,
        level: character.level,
        subclassId: character.subclassId,
        classFeatureState: character.classFeatureState,
        equipment: [],
        inventoryItems: normalizedArmorWearState.inventoryItems,
        customEquipment: [],
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
  const normalizedCustomClass = isCustomClassName(character.className)
    ? normalizeCustomClassConfig(character.customClass, {
        legacySpellcastingEnabled: character.customClass === undefined
      })
    : undefined;
  const normalizedClassRules = normalizeCharacterClassRulesConfig(character.classRules, {
    className: character.className,
    legacyCustomClass: normalizedCustomClass,
    legacySpellcastingEnabled:
      isCustomClassName(character.className) && character.customClass === undefined
  });
  const normalizedCharacter = {
    ...character,
    classRules: normalizedClassRules,
    customClass: normalizedCustomClass,
    speciesFeatureState: normalizeCharacterSpeciesFeatureState(
      character.species,
      character.speciesFeatureState
    ),
    classFeatureState: normalizeCharacterClassFeatureState(character.classFeatureState, {
      className: character.className,
      level: character.level,
      subclassId: character.subclassId,
      classRules: normalizedClassRules,
      customClass: normalizedCustomClass,
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
  const normalizedCustomClass = isCustomClassName(character.className)
    ? normalizeCustomClassConfig(character.customClass, {
        legacySpellcastingEnabled: character.customClass === undefined
      })
    : undefined;
  const normalizedClassRules = normalizeCharacterClassRulesConfig(character.classRules, {
    className: character.className,
    legacyCustomClass: normalizedCustomClass,
    legacySpellcastingEnabled:
      isCustomClassName(character.className) && character.customClass === undefined
  });
  const normalizedCustomSpellSnapshots = normalizeCharacterCustomSpellSnapshots(
    character.customSpellSnapshots
  );
  const normalizedCustomSpellEntries = normalizedCustomSpellSnapshots.map(
    (snapshot) => snapshot.spell
  );
  const rawPersistedCantripIds = normalizeRuntimeSpellIds(character.cantripIds);
  const rawCantripIds = rawPersistedCantripIds;
  const defaultCantripSelectionOptions = getCantripSelectionOptionsForCharacter(
    character.className,
    character.level,
    character.subclassId,
    normalizedCustomClass,
    normalizedClassRules
  );
  const customCantripSelectionOptions = getCustomCantripSelectionOptionsForCharacter(
    normalizedCustomSpellEntries,
    {
      classFeatureState: character.classFeatureState,
      className: character.className,
      classRules: normalizedClassRules,
      customClass: normalizedCustomClass,
      level: character.level,
      subclassId: character.subclassId
    }
  );
  const cantripSelectionOptions = mergeSpellEntriesById(
    defaultCantripSelectionOptions,
    customCantripSelectionOptions
  );
  const cantripSelectionOptionIds = new Set(cantripSelectionOptions.map((spell) => spell.id));
  const cantripLimit = getCantripLimitForCharacter(
    character.className,
    character.level,
    character.classFeatureState,
    character.subclassId,
    normalizedCustomClass,
    normalizedClassRules
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
      classRules: normalizedClassRules,
      customClass: normalizedCustomClass,
      abilities: character.abilities,
      cantripIds: normalizedCantripIds,
      feats: character.feats
    }
  );
  const rawPreparedSpellIds = normalizeRuntimeSpellIds(character.preparedSpellIds);
  const defaultPreparedSpellSelectionOptions = getPreparedSpellSelectionOptionsForCharacter(
    character.className,
    character.level,
    character.subclassId,
    normalizedCustomClass,
    normalizedClassRules
  );
  const customPreparedSpellSelectionOptions = getCustomPreparedSpellSelectionOptionsForCharacter(
    normalizedCustomSpellEntries,
    {
      classFeatureState: normalizedClassFeatureState,
      className: character.className,
      classRules: normalizedClassRules,
      customClass: normalizedCustomClass,
      level: character.level,
      subclassId: character.subclassId
    }
  );
  const preparedSpellSelectionOptions = mergeSpellEntriesById(
    defaultPreparedSpellSelectionOptions,
    customPreparedSpellSelectionOptions
  );
  const preparedSpellSelectionOptionIds = new Set(
    preparedSpellSelectionOptions.map((spell) => spell.id)
  );
  const rawSpellbookSpellIds = Array.isArray(character.spellbookSpellIds)
    ? normalizeRuntimeSpellIds(character.spellbookSpellIds)
    : usesSpellbookForCharacter(
          character.className,
          character.subclassId,
          normalizedCustomClass,
          normalizedClassRules,
          character.level
        )
      ? rawPreparedSpellIds
      : [];
  const alwaysSpellbookSpellIds = getAlwaysSpellbookSpellIdsForCharacter({
    className: character.className,
    level: character.level,
    classFeatureState: normalizedClassFeatureState,
    classRules: normalizedClassRules,
    customClass: normalizedCustomClass,
    spellbookSpellIds: rawSpellbookSpellIds,
    subclassId: character.subclassId
  });
  const alwaysSpellbookSpellIdSet = new Set(alwaysSpellbookSpellIds);
  const normalizedSpellbookSpellIds = usesSpellbookForCharacter(
    character.className,
    character.subclassId,
    normalizedCustomClass,
    normalizedClassRules,
    character.level
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
        (!usesSpellbookForCharacter(
          character.className,
          character.subclassId,
          normalizedCustomClass,
          normalizedClassRules,
          character.level
        ) ||
          normalizedSpellbookSpellIdSet.has(spellId))
    ),
    preparedSpellSelectionOptions,
    getPreparedSpellLimitForCharacter(
      character.className,
      character.level,
      character.subclassId,
      normalizedCustomClass,
      normalizedClassRules
    ),
    [
      ...getAlwaysPreparedSpellIds(
        character.className,
        character.level,
        normalizedClassFeatureState,
        undefined,
        character.subclassId,
        character.statusEntries,
        normalizedCustomClass,
        normalizedClassRules
      ),
      ...getSpeciesAlwaysPreparedSpellIdsForCharacter(character)
    ]
  );
  const normalizedCustomSpellSnapshotsForSelectedIds = pruneCharacterCustomSpellSnapshotsForSelectedIds(
    normalizedCustomSpellSnapshots,
    [...normalizedCantripIds, ...normalizedSpellbookSpellIds, ...normalizedPreparedSpellIds]
  );
  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    character.className,
    character.level,
    character.subclassId,
    normalizedCustomClass,
    normalizedClassRules
  );

  return {
    ...character,
    classRules: normalizedClassRules,
    customClass: normalizedCustomClass,
    speciesFeatureState: normalizeCharacterSpeciesFeatureState(
      character.species,
      character.speciesFeatureState
    ),
    classFeatureState: normalizedClassFeatureState,
    customSpellSnapshots: normalizedCustomSpellSnapshotsForSelectedIds,
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
    nextCharacter = reconcileCharacterStatusConsequences(normalizeEquipmentRuntime(nextCharacter));
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
