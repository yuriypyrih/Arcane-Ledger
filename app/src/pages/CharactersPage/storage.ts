import type { Character, CharacterDraft, PortableCharacterSheet, CoreStats } from "../../types";
import { currencyKeys } from "../../types";
import {
  alignmentOptions,
  createDefaultCoreStats,
  createDefaultAbilities,
  createDefaultCurrencies,
  createEmptyCharacter
} from "./constants";
import { normalizeRoundTracker } from "./combat";
import { normalizeArmorClassFormulaSelection, normalizeCharacterArmorWearState } from "./armor";
import {
  isBackgroundName,
  normalizeCharacterEquipmentSelections,
  normalizeCharacterProficiencies
} from "./proficiency";
import {
  getAlwaysPreparedSpellIds,
  getCantripLimitForCharacter,
  getCantripSelectionOptionsForCharacter,
  getPreparedSpellLimitForCharacter,
  getPreparedSpellSelectionOptionsForCharacter,
  getSpellSlotTotalsForCharacter,
  normalizePreparedSpellIds,
  normalizeSpellbookSpellIds,
  usesSpellbookForCharacter,
  normalizeSpellSlotsExpended
} from "./spellcasting";
import {
  getAlwaysSpellbookSpellIdsForCharacter,
  normalizeCharacterClassFeatureState
} from "./classFeatures";
import { getMagicTemporaryHitPointsFeatureForCharacter } from "./classFeatures/magicTemporaryHitPoints";
import { normalizeLevelAndXp } from "./experience";
import { normalizeCustomEquipmentEntries } from "./customEquipment";
import { normalizeCharacterCustomActions } from "./customActions";
import { normalizeCharacterCompanions } from "./companions";
import { convertLegacyEquipmentToInventoryItems } from "./legacyEquipmentItems";
import { normalizeCharacterFeats } from "./feats";
import { normalizeBackgroundChoices, reconcileBackgroundOriginFeatEntries } from "./backgrounds";
import {
  getSpeciesAlwaysPreparedSpellIdsForCharacter,
  normalizeCharacterSpeciesChoices,
  normalizeCharacterSpeciesFeatureState,
  normalizeSpeciesStatusEntriesForCharacter,
  reconcileHumanOriginFeatEntries
} from "./species";
import { normalizeCharacterInventoryItems } from "./inventoryItems";
import {
  normalizeHeroicInspiration,
  restoreHeroicInspirationForCharacter
} from "./heroicInspiration";
import {
  clampNumber,
  createMagicTemporaryHitPointsAssignment,
  createTemporaryHitPointsAssignment,
  normalizeMagicTemporaryHitPointsSource,
  normalizeTemporaryHitPointsSource
} from "./shared";
import { normalizeSubclassId } from "./subclasses";
import { normalizeCharacterStatusEntries } from "./statusEntries";
import {
  getEffectiveHitPointMaximumForCharacter,
  reconcileCharacterStatusConsequences
} from "./traits";
import {
  isCustomClassName,
  normalizeCharacterClassRulesConfig,
  normalizeCustomClassConfig
} from "./customClass";
import {
  isCustomBackgroundName,
  isCustomSpeciesName,
  normalizeCustomBackgroundConfig,
  normalizeCustomSpeciesConfig,
  normalizeCustomSubclassConfig
} from "./customOrigins";
import {
  createHydratedCharacterInputFromPortableSheet,
  createPortableCharacterSheet,
  ensurePortableCharacterSheetSyncMetadata,
  isPortableCharacterSheet,
  markPortableCharacterSheetDirty,
  normalizeCharacterAvatarMetadata,
  normalizeCharacterSyncMetadata
} from "./portableCharacterSheet";
import {
  clearRawStoredCharacters,
  getRawStoredCharacterId,
  loadRawStoredCharacterRecords,
  replaceRawStoredCharacterRecords,
  CHARACTER_STORAGE_CHANGED_EVENT
} from "./portableCharacterSheetStorage";
import { clearCharacterRosterCache } from "./characterRoster";
import { normalizeSheetSizeBytes } from "./characterSheetSize";

export { CHARACTER_STORAGE_CHANGED_EVENT };

export type CharacterSaveOptions = {
  ownerId?: string | null;
};

function normalizeCoreStatValue(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : fallback;
}

function normalizePersistedSpellId(value: string): string {
  return value.trim();
}

function normalizePersistedSpellIds(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((spellId): spellId is string => typeof spellId === "string")
        .map(normalizePersistedSpellId)
        .filter((spellId) => spellId.length > 0)
    : [];
}

function normalizeCoreStats(value: unknown): CoreStats {
  const defaults = createDefaultCoreStats();

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const record = value as Partial<CoreStats>;

  return {
    armorClass: normalizeCoreStatValue(record.armorClass, defaults.armorClass),
    initiative: normalizeCoreStatValue(record.initiative, defaults.initiative),
    speed: normalizeCoreStatValue(record.speed, defaults.speed),
    passivePerception: normalizeCoreStatValue(record.passivePerception, defaults.passivePerception),
    proficiencyBonus: normalizeCoreStatValue(record.proficiencyBonus, defaults.proficiencyBonus),
    hitDice: normalizeCoreStatValue(record.hitDice, defaults.hitDice)
  };
}

export function normalizeCharacterCurrencies(
  value: unknown,
  fallbackCurrencies: Character["currencies"]
): Character["currencies"] {
  const normalizedCurrencies: Character["currencies"] = {
    ...createDefaultCurrencies(),
    ...fallbackCurrencies
  };

  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([currencyKey, currencyValue]) => {
      if (!currencyKey) {
        return;
      }

      normalizedCurrencies[currencyKey] = Math.max(
        0,
        Math.floor(clampNumber(currencyValue, 0, 999999999, 0))
      );
    });
  }

  currencyKeys.forEach((currencyKey) => {
    normalizedCurrencies[currencyKey] = Math.max(
      0,
      Math.floor(
        clampNumber(
          normalizedCurrencies[currencyKey],
          0,
          999999999,
          fallbackCurrencies[currencyKey]
        )
      )
    );
  });

  return normalizedCurrencies;
}

function normalizeDeathSaves(value: unknown): NonNullable<Character["deathSaves"]> {
  if (!value || typeof value !== "object") {
    return {
      successes: 0,
      failures: 0
    };
  }

  const record = value as Partial<NonNullable<Character["deathSaves"]>>;
  const successes = Math.floor(clampNumber(record.successes, 0, 3, 0));
  const failures = Math.floor(clampNumber(record.failures, 0, 3, 0));

  return {
    successes,
    failures,
    ...(record.resolution === "instant-death" && failures >= 3
      ? { resolution: "instant-death" as const }
      : {})
  };
}

export function normalizeCharacter(value: unknown): Character | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const characterInput = isPortableCharacterSheet(value)
    ? createHydratedCharacterInputFromPortableSheet(value)
    : value;
  const record = characterInput as Partial<Character> & {
    subclassId?: unknown;
    xp?: unknown;
    spellbookSpellIds?: unknown;
    cantripIds?: unknown;
    preparedSpellIds?: unknown;
    skills?: unknown;
    skillProficiencies?: unknown;
    weaponProficiencies?: unknown;
    armorProficiencies?: unknown;
    toolProficiencies?: unknown;
    languageProficiencies?: unknown;
    coreStats?: unknown;
    armorClassFormulaSelection?: unknown;
    currencies?: unknown;
    backgroundNotes?: unknown;
    backgroundChoices?: unknown;
    customBackground?: unknown;
    savingThrowProficiencies?: unknown;
    hitDiceRemaining?: unknown;
    maxHitPointsMode?: unknown;
    magicTemporaryHitPoints?: unknown;
    magicTemporaryHitPointsSource?: unknown;
    temporaryHitPoints?: unknown;
    temporaryHitPointsSource?: unknown;
    hover?: unknown;
    roundTracker?: unknown;
    statusEntries?: unknown;
    deathSaves?: unknown;
    inventoryItems?: unknown;
    customEquipment?: unknown;
    customActions?: unknown;
    companions?: unknown;
    classFeatureState?: unknown;
    classRules?: unknown;
    customClass?: unknown;
    customSpecies?: unknown;
    customSubclass?: unknown;
    feats?: unknown;
    heroicInspiration?: unknown;
    speciesChoices?: unknown;
    speciesFeatureState?: unknown;
    storageMetadata?: unknown;
  };
  const id = Number(record.id);

  if (!Number.isFinite(id)) {
    return null;
  }

  const defaults = createEmptyCharacter();
  const normalizedHitPoints = clampNumber(record.hitPoints, 1, 9999, defaults.hitPoints);
  const { level: normalizedLevel, xp: normalizedXp } = normalizeLevelAndXp(
    record.level,
    record.xp
  );
  const normalizedSpecies =
    typeof record.species === "string" ? record.species.trim() : defaults.species;
  const normalizedCustomSpecies = isCustomSpeciesName(normalizedSpecies)
    ? normalizeCustomSpeciesConfig(record.customSpecies)
    : undefined;
  const normalizedSpeciesChoices = normalizeCharacterSpeciesChoices(
    normalizedSpecies,
    record.speciesChoices
  );
  const normalizedSpeciesFeatureState = normalizeCharacterSpeciesFeatureState(
    normalizedSpecies,
    record.speciesFeatureState
  );
  const normalizedClassName =
    typeof record.className === "string" ? record.className.trim() : defaults.className;
  const hasPersistedCustomClassConfig =
    "customClass" in record && record.customClass !== undefined && record.customClass !== null;
  const normalizedCustomClass = isCustomClassName(normalizedClassName)
    ? normalizeCustomClassConfig(record.customClass, {
        legacySpellcastingEnabled: !hasPersistedCustomClassConfig
      })
    : undefined;
  const normalizedClassRules = normalizeCharacterClassRulesConfig(record.classRules, {
    className: normalizedClassName,
    legacyCustomClass: normalizedCustomClass,
    legacySpellcastingEnabled:
      isCustomClassName(normalizedClassName) && !hasPersistedCustomClassConfig
  });
  const normalizedBackground =
    typeof record.background === "string" ? record.background.trim() : defaults.background;
  const normalizedCustomBackground = isCustomBackgroundName(normalizedBackground)
    ? normalizeCustomBackgroundConfig(record.customBackground)
    : undefined;
  const normalizedBackgroundNotes =
    typeof record.backgroundNotes === "string"
      ? record.backgroundNotes.trim()
      : defaults.backgroundNotes;
  const normalizedCustomSubclass = normalizeCustomSubclassConfig(record.customSubclass, {
    className: normalizedClassName
  });
  const normalizedSubclassId = isCustomClassName(normalizedClassName)
    ? undefined
    : normalizeSubclassId(record.subclassId, normalizedClassName, normalizedCustomSubclass);
  const resolvedBackground = normalizedBackground || defaults.background;
  const normalizedBackgroundChoices = normalizeBackgroundChoices(
    isBackgroundName(resolvedBackground) || isCustomBackgroundName(resolvedBackground)
      ? resolvedBackground
      : "",
    record.backgroundChoices
  );
  const rawEquipment = Array.isArray(record.equipment) ? record.equipment : defaults.equipment;
  const normalizedEquipment = normalizeCharacterEquipmentSelections(rawEquipment);
  const normalizedCustomEquipment = normalizeCustomEquipmentEntries(record.customEquipment);
  const normalizedCustomActions = normalizeCharacterCustomActions(record.customActions);
  const normalizedInventoryItems = normalizeCharacterInventoryItems([
    ...normalizeCharacterInventoryItems(record.inventoryItems),
    ...convertLegacyEquipmentToInventoryItems(normalizedEquipment, normalizedCustomEquipment)
  ]);
  const normalizedArmorWearState = normalizeCharacterArmorWearState(
    [],
    normalizedInventoryItems,
    []
  );
  const normalizedAbilities = {
    ...createDefaultAbilities(),
    ...(record.abilities ?? {})
  };
  const normalizedFeats = reconcileHumanOriginFeatEntries(
    reconcileBackgroundOriginFeatEntries(
      normalizeCharacterFeats(record.feats, normalizedLevel),
      isBackgroundName(resolvedBackground) ? resolvedBackground : "",
      normalizedLevel
    ),
    normalizedSpecies,
    normalizedSpeciesChoices,
    normalizedLevel
  );
  const rawPersistedCantripIds = normalizePersistedSpellIds(record.cantripIds);
  const preliminaryClassFeatureState = normalizeCharacterClassFeatureState(
    record.classFeatureState,
    {
      className: normalizedClassName,
      level: normalizedLevel,
      subclassId: normalizedSubclassId,
      classRules: normalizedClassRules,
      customClass: normalizedCustomClass,
      abilities: normalizedAbilities,
      cantripIds: rawPersistedCantripIds,
      feats: normalizedFeats
    }
  );
  const rawCantripIds = rawPersistedCantripIds;
  const cantripLimit = getCantripLimitForCharacter(
    normalizedClassName,
    normalizedLevel,
    preliminaryClassFeatureState,
    normalizedSubclassId,
    normalizedCustomClass,
    normalizedClassRules
  );
  const cantripSelectionOptionIds = new Set(
    getCantripSelectionOptionsForCharacter(
      normalizedClassName,
      normalizedLevel,
      normalizedSubclassId,
      normalizedCustomClass,
      normalizedClassRules
    ).map((spell) => spell.id)
  );
  const normalizedCantripIds = [...new Set(rawCantripIds)]
    .filter((spellId) => cantripSelectionOptionIds.has(spellId))
    .slice(0, cantripLimit ?? Number.POSITIVE_INFINITY);
  const normalizedClassFeatureState = normalizeCharacterClassFeatureState(record.classFeatureState, {
    className: normalizedClassName,
    level: normalizedLevel,
    subclassId: normalizedSubclassId,
    classRules: normalizedClassRules,
    customClass: normalizedCustomClass,
    abilities: normalizedAbilities,
    cantripIds: normalizedCantripIds,
    feats: normalizedFeats
  });
  const normalizedProficiencies = normalizeCharacterProficiencies({
    className: normalizedClassName,
    level: normalizedLevel,
    species: normalizedSpecies,
    speciesChoices: normalizedSpeciesChoices,
    background: resolvedBackground,
    backgroundChoices: normalizedBackgroundChoices,
    subclassId: normalizedSubclassId,
    classFeatureState: normalizedClassFeatureState,
    skillProficiencies: record.skillProficiencies,
    savingThrowProficiencies: record.savingThrowProficiencies,
    weaponProficiencies: record.weaponProficiencies,
    armorProficiencies: record.armorProficiencies,
    toolProficiencies: record.toolProficiencies,
    languageProficiencies: record.languageProficiencies,
    selectedClassSkills: record.skills,
    selectedClassToolProficiencies: record.toolProficiencies,
    feats: normalizedFeats
  });
  const normalizedStatusEntries = normalizeSpeciesStatusEntriesForCharacter({
    species: normalizedSpecies,
    level: normalizedLevel,
    statusEntries: normalizeCharacterStatusEntries(record.statusEntries)
  });
  const rawPreparedSpellIds = Array.isArray(record.preparedSpellIds)
    ? normalizePersistedSpellIds(record.preparedSpellIds)
    : (defaults.preparedSpellIds ?? []).map(normalizePersistedSpellId);
  const preparedSpellLimit = getPreparedSpellLimitForCharacter(
    normalizedClassName,
    normalizedLevel,
    normalizedSubclassId,
    normalizedCustomClass,
    normalizedClassRules
  );
  const preparedSpellSelectionOptions = getPreparedSpellSelectionOptionsForCharacter(
    normalizedClassName,
    normalizedLevel,
    normalizedSubclassId,
    normalizedCustomClass,
    normalizedClassRules
  );
  const preparedSpellSelectionOptionIds = new Set(
    preparedSpellSelectionOptions.map((spell) => spell.id)
  );
  const rawSpellbookSpellIds = Array.isArray(record.spellbookSpellIds)
    ? normalizePersistedSpellIds(record.spellbookSpellIds)
    : [];
  const alwaysSpellbookSpellIds = getAlwaysSpellbookSpellIdsForCharacter({
    className: normalizedClassName,
    level: normalizedLevel,
    classFeatureState: normalizedClassFeatureState,
    classRules: normalizedClassRules,
    customClass: normalizedCustomClass,
    spellbookSpellIds: rawSpellbookSpellIds,
    subclassId: normalizedSubclassId
  });
  const alwaysSpellbookSpellIdSet = new Set(alwaysSpellbookSpellIds);
  const normalizedSpellbookSpellIds = usesSpellbookForCharacter(
    normalizedClassName,
    normalizedSubclassId,
    normalizedCustomClass,
    normalizedClassRules,
    normalizedLevel
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
          normalizedClassName,
          normalizedSubclassId,
          normalizedCustomClass,
          normalizedClassRules,
          normalizedLevel
        ) ||
          normalizedSpellbookSpellIdSet.has(spellId))
    ),
    preparedSpellSelectionOptions,
    preparedSpellLimit,
    [
      ...getAlwaysPreparedSpellIds(
        normalizedClassName,
        normalizedLevel,
        normalizedClassFeatureState,
        undefined,
        normalizedSubclassId,
        normalizedStatusEntries,
        normalizedCustomClass,
        normalizedClassRules
      ),
      ...getSpeciesAlwaysPreparedSpellIdsForCharacter({
        species: normalizedSpecies,
        level: normalizedLevel,
        speciesChoices: normalizedSpeciesChoices
      })
    ]
  );
  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    normalizedClassName,
    normalizedLevel,
    normalizedSubclassId,
    normalizedCustomClass,
    normalizedClassRules
  );
  const normalizedSpellSlotsExpended = normalizeSpellSlotsExpended(
    record.spellSlotsExpended,
    spellSlotTotals
  );
  const magicTemporaryHitPointsFeature = getMagicTemporaryHitPointsFeatureForCharacter({
    className: normalizedClassName,
    level: normalizedLevel,
    subclassId: normalizedSubclassId,
    abilities: normalizedAbilities,
    classFeatureState: normalizedClassFeatureState
  });
  const normalizedShortRestsUsedToday = clampNumber(
    record.shortRestsUsedToday,
    0,
    2,
    defaults.shortRestsUsedToday ?? 0
  );
  const normalizedHeroicInspiration = normalizeHeroicInspiration(
    record.heroicInspiration,
    defaults.heroicInspiration
  );
  const normalizedHitDiceRemaining = clampNumber(
    record.hitDiceRemaining,
    0,
    normalizedLevel,
    normalizedLevel
  );
  const normalizedCoreStats = normalizeCoreStats(record.coreStats);
  const normalizedArmorClassFormulaSelection = normalizeArmorClassFormulaSelection(
    record.armorClassFormulaSelection,
    {
      className: normalizedClassName,
      level: normalizedLevel,
      subclassId: normalizedSubclassId,
      classFeatureState: normalizedClassFeatureState,
      equipment: [],
      inventoryItems: normalizedArmorWearState.inventoryItems,
      customEquipment: [],
      statusEntries: normalizedStatusEntries
    }
  );
  const normalizedCurrencies = normalizeCharacterCurrencies(record.currencies, defaults.currencies);
  const normalizedMaxHitPointsMode =
    record.maxHitPointsMode === "automatic" || record.maxHitPointsMode === "custom"
      ? record.maxHitPointsMode
      : "automatic";
  const normalizedRoundTracker = normalizeRoundTracker(record.roundTracker);
  const normalizedDeathSaves = normalizeDeathSaves(record.deathSaves);
  const normalizedCompanions = normalizeCharacterCompanions(record.companions);
  const normalizedTemporaryHitPointsAssignment = createTemporaryHitPointsAssignment(
    clampNumber(record.temporaryHitPoints, 0, 999, defaults.temporaryHitPoints),
    normalizeTemporaryHitPointsSource(record.temporaryHitPointsSource)
  );
  const normalizedMagicTemporaryHitPointsAssignment = magicTemporaryHitPointsFeature
    ? createMagicTemporaryHitPointsAssignment(
        clampNumber(
          record.magicTemporaryHitPoints,
          0,
          magicTemporaryHitPointsFeature.maxHitPoints,
          defaults.magicTemporaryHitPoints
        ),
        normalizeMagicTemporaryHitPointsSource(record.magicTemporaryHitPointsSource) ??
          magicTemporaryHitPointsFeature.label
      )
    : createMagicTemporaryHitPointsAssignment(0);
  const normalizedCurrentHitPointMaximum = getEffectiveHitPointMaximumForCharacter({
    className: normalizedClassName,
    subclassId: normalizedSubclassId,
    level: normalizedLevel,
    species: normalizedSpecies,
    customSpecies: normalizedCustomSpecies,
    hitPoints: normalizedHitPoints,
    statusEntries: normalizedStatusEntries
  });

  const normalizedCharacter = reconcileCharacterStatusConsequences({
    id,
    name: typeof record.name === "string" ? record.name : defaults.name,
    species: normalizedSpecies,
    speciesChoices: normalizedSpeciesChoices,
    customSpecies: normalizedCustomSpecies,
    speciesFeatureState: normalizedSpeciesFeatureState,
    className: normalizedClassName,
    subclassId: normalizedSubclassId,
    customSubclass: normalizedCustomSubclass,
    classRules: normalizedClassRules,
    customClass: normalizedCustomClass,
    level: normalizedLevel,
    xp: normalizedXp,
    hitPoints: normalizedHitPoints,
    currentHitPoints: clampNumber(
      record.currentHitPoints,
      0,
      normalizedCurrentHitPointMaximum,
      normalizedCurrentHitPointMaximum
    ),
    magicTemporaryHitPoints: normalizedMagicTemporaryHitPointsAssignment.magicTemporaryHitPoints,
    magicTemporaryHitPointsSource:
      normalizedMagicTemporaryHitPointsAssignment.magicTemporaryHitPointsSource,
    temporaryHitPoints: normalizedTemporaryHitPointsAssignment.temporaryHitPoints,
    temporaryHitPointsSource: normalizedTemporaryHitPointsAssignment.temporaryHitPointsSource,
    hover: record.hover === true,
    maxHitPointsMode: normalizedMaxHitPointsMode,
    attributeMode:
      record.attributeMode === "pointBuy" || record.attributeMode === "custom"
        ? record.attributeMode
        : defaults.attributeMode,
    abilities: normalizedAbilities,
    alignment:
      typeof record.alignment === "string" &&
      alignmentOptions.includes(record.alignment as Character["alignment"])
        ? (record.alignment as Character["alignment"])
        : defaults.alignment,
    background: resolvedBackground,
    customBackground: normalizedCustomBackground,
    backgroundChoices: normalizedBackgroundChoices,
    backgroundNotes: normalizedBackgroundNotes,
    currencies: normalizedCurrencies,
    skillProficiencies: normalizedProficiencies.skillProficiencies,
    savingThrowProficiencies: normalizedProficiencies.savingThrowProficiencies,
    weaponProficiencies: normalizedProficiencies.weaponProficiencies,
    armorProficiencies: normalizedProficiencies.armorProficiencies,
    toolProficiencies: normalizedProficiencies.toolProficiencies,
    languageProficiencies: normalizedProficiencies.languageProficiencies,
    roundTracker: normalizedRoundTracker,
    statusEntries: normalizedStatusEntries,
    deathSaves: normalizedDeathSaves,
    equipment: [],
    inventoryItems: normalizedArmorWearState.inventoryItems,
    customEquipment: [],
    companions: normalizedCompanions,
    customActions: normalizedCustomActions,
    cantripIds: normalizedCantripIds,
    spellbookSpellIds: normalizedSpellbookSpellIds,
    preparedSpellIds: normalizedPreparedSpellIds,
    spellSlotsExpended: normalizedSpellSlotsExpended,
    shortRestsUsedToday: normalizedShortRestsUsedToday,
    heroicInspiration: normalizedHeroicInspiration,
    hitDiceRemaining: normalizedHitDiceRemaining,
    coreStats: normalizedCoreStats,
    armorClassFormulaSelection: normalizedArmorClassFormulaSelection,
    classFeatureState: normalizedClassFeatureState,
    feats: normalizedFeats,
    storageMetadata:
      record.storageMetadata && typeof record.storageMetadata === "object"
        ? {
            sheetSizeBytes: normalizeSheetSizeBytes(
              (record.storageMetadata as { sheetSizeBytes?: unknown }).sheetSizeBytes
            ),
            ...(normalizeCharacterSyncMetadata(
              (record.storageMetadata as { sync?: unknown }).sync
            )
              ? {
                  sync: normalizeCharacterSyncMetadata(
                    (record.storageMetadata as { sync?: unknown }).sync
                  )
                }
              : {}),
            ...(normalizeCharacterAvatarMetadata(
              (record.storageMetadata as { avatar?: unknown }).avatar
            )
              ? {
                  avatar: normalizeCharacterAvatarMetadata(
                    (record.storageMetadata as { avatar?: unknown }).avatar
                  )
                }
              : {})
          }
        : undefined
  });

  if (normalizedCharacter.storageMetadata?.sheetSizeBytes) {
    return normalizedCharacter;
  }

  return {
    ...normalizedCharacter,
    storageMetadata: createPortableCharacterSheet(normalizedCharacter).metadata
  };
}

function loadStoredCharacterRecords(): unknown[] {
  return loadRawStoredCharacterRecords();
}

function saveStoredCharacterRecords(characters: unknown[]) {
  replaceRawStoredCharacterRecords(characters);
}

function getStoredCharacterId(character: unknown): number | null {
  return getRawStoredCharacterId(character);
}

function createStoredPortableCharacterSheet(value: unknown): PortableCharacterSheet | null {
  if (isPortableCharacterSheet(value)) {
    return ensurePortableCharacterSheetSyncMetadata(value);
  }

  const character = normalizeCharacter(value);

  return character
    ? ensurePortableCharacterSheetSyncMetadata(createPortableCharacterSheet(character))
    : null;
}

export function loadStoredPortableCharacterSheets() {
  return loadStoredCharacterRecords()
    .map((record) => createStoredPortableCharacterSheet(record))
    .filter((record): record is PortableCharacterSheet => record !== null);
}

export function replaceStoredPortableCharacterSheets(characters: PortableCharacterSheet[]) {
  saveStoredCharacterRecords(characters);
}

export function clearStoredCharacters() {
  clearRawStoredCharacters();
  clearCharacterRosterCache();
}

export function loadCharacters(): Character[] {
  return loadStoredCharacterRecords()
    .map((character) => normalizeCharacter(character))
    .filter((character): character is Character => character !== null);
}

export function saveCharacters(characters: Character[]) {
  saveStoredCharacterRecords(
    characters.map((character) => ensurePortableCharacterSheetSyncMetadata(createPortableCharacterSheet(character)))
  );
}

export function upsertTrustedCharacter(character: Character): Character {
  if (!Number.isFinite(character.id)) {
    throw new Error("Unable to save character: invalid character id.");
  }

  const characters = loadStoredCharacterRecords();
  const existingCharacterRecord = characters.find(
    (entry) => getStoredCharacterId(entry) === character.id
  );
  const existingCharacter =
    existingCharacterRecord === undefined ? null : normalizeCharacter(existingCharacterRecord);
  const characterInput =
    existingCharacter?.storageMetadata?.sync
      ? {
          ...character,
          storageMetadata: {
            ...(character.storageMetadata ?? {}),
            sync: existingCharacter.storageMetadata.sync
          }
        }
      : character;
  const characterRecord = markPortableCharacterSheetDirty(createPortableCharacterSheet(characterInput));
  let didReplaceCharacter = false;
  const nextCharacters = characters.map((entry) => {
    if (getStoredCharacterId(entry) !== character.id) {
      return entry;
    }

    didReplaceCharacter = true;
    return characterRecord;
  });

  saveStoredCharacterRecords(didReplaceCharacter ? nextCharacters : [characterRecord, ...characters]);
  return {
    ...character,
    storageMetadata: characterRecord.metadata
  };
}

export function findCharacter(characterId: number): Character | undefined {
  const matchingCharacterRecord = loadStoredCharacterRecords().find(
    (character) => getStoredCharacterId(character) === characterId
  );

  if (!matchingCharacterRecord) {
    return undefined;
  }

  return normalizeCharacter(matchingCharacterRecord) ?? undefined;
}

export function deleteCharacter(characterId: number): Character[] {
  const characters = loadStoredCharacterRecords();
  const nextCharacters = characters.filter(
    (character) => getStoredCharacterId(character) !== characterId
  );

  if (nextCharacters.length !== characters.length) {
    saveStoredCharacterRecords(nextCharacters);
  }

  return nextCharacters
    .map((character) => normalizeCharacter(character))
    .filter((character): character is Character => character !== null);
}

export function upsertCharacter(
  draft: CharacterDraft | Omit<Character, "id">,
  characterId?: number,
  options?: CharacterSaveOptions
): Character {
  const characters = loadStoredCharacterRecords();
  const nextId = characterId ?? Date.now();
  const previousCharacter =
    characterId === undefined
      ? null
      : (() => {
          const previousCharacterRecord =
            characters.find((character) => getStoredCharacterId(character) === characterId) ?? null;

          return previousCharacterRecord ? normalizeCharacter(previousCharacterRecord) : null;
        })();
  let nextCharacter = normalizeCharacter({
    id: nextId,
    ...draft
  });

  if (!nextCharacter) {
    throw new Error("Unable to save character: invalid character data.");
  }

  if (
    previousCharacter &&
    nextCharacter.level > previousCharacter.level &&
    !nextCharacter.heroicInspiration
  ) {
    nextCharacter = restoreHeroicInspirationForCharacter(nextCharacter);
  }

  if (previousCharacter?.storageMetadata) {
    nextCharacter = {
      ...nextCharacter,
      storageMetadata: {
        ...(nextCharacter.storageMetadata ?? {}),
        ...(previousCharacter.storageMetadata.sync
          ? { sync: previousCharacter.storageMetadata.sync }
          : {})
      }
    };
  }

  const baseCharacterRecord = ensurePortableCharacterSheetSyncMetadata(
    createPortableCharacterSheet(nextCharacter),
    {
      ownerId: options?.ownerId ?? nextCharacter.storageMetadata?.sync?.ownerId
    }
  );
  const nextCharacterRecord =
    characterId === undefined
      ? baseCharacterRecord
      : markPortableCharacterSheetDirty(baseCharacterRecord, options?.ownerId);
  const nextCharacters =
    characterId === undefined
      ? [nextCharacterRecord, ...characters]
      : characters.some((character) => getStoredCharacterId(character) === characterId)
        ? characters.map((character) =>
            getStoredCharacterId(character) === characterId ? nextCharacterRecord : character
          )
        : [nextCharacterRecord, ...characters];

  saveStoredCharacterRecords(nextCharacters);
  return {
    ...nextCharacter,
    storageMetadata: nextCharacterRecord.metadata
  };
}
