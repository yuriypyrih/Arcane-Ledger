import type { Character, CharacterDraft, CoreStats } from "../../types";
import { currencyKeys } from "../../types";
import { loadPreferences } from "../../storage/preferences";
import {
  CHARACTERS_STORAGE_KEY,
  alignmentOptions,
  createDefaultCoreStats,
  createDefaultAbilities,
  createDefaultCurrencies,
  createEmptyCharacter
} from "./constants";
import { normalizeRoundTracker } from "./combat";
import {
  normalizeArmorClassFormulaSelection,
  normalizeCharacterArmorWearState
} from "./armor";
import {
  isBackgroundName,
  normalizeCharacterEquipmentSelections,
  normalizeCharacterProficiencies
} from "./proficiency";
import {
  getAlwaysPreparedSpellIds,
  getCantripLimitForCharacter,
  getCantripSelectionOptionsForCharacter,
  getDefaultCantripIdsForCharacter,
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
  getMagicTemporaryHitPointsFeatureForCharacter,
  normalizeCharacterClassFeatureState
} from "./classFeatures";
import { normalizeLevelAndXp } from "./experience";
import { normalizeCustomEquipmentEntries } from "./customEquipment";
import { normalizeCharacterCompanions } from "./companions";
import { normalizeCharacterFeats } from "./feats";
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

function normalizeCoreStatValue(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : fallback;
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

function hasExplicitArmorWornState(value: unknown): boolean {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.some((entry) => {
    if (!entry || typeof entry !== "object") {
      return false;
    }

    return "worn" in entry && typeof (entry as { worn?: unknown }).worn === "boolean";
  });
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

  return {
    successes: Math.floor(clampNumber(record.successes, 0, 3, 0)),
    failures: Math.floor(clampNumber(record.failures, 0, 3, 0))
  };
}

export function normalizeCharacter(value: unknown): Character | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<Character> & {
    role?: unknown;
    class?: unknown;
    subclassId?: unknown;
    xp?: unknown;
    experience?: unknown;
    knownSpellIds?: unknown;
    spellbookSpellIds?: unknown;
    cantripIds?: unknown;
    preparedSpellIds?: unknown;
    skills?: unknown;
    skillProficiencies?: unknown;
    skillExpertise?: unknown;
    weaponProficiencies?: unknown;
    armorProficiencies?: unknown;
    toolProficiencies?: unknown;
    languageProficiencies?: unknown;
    coreStats?: unknown;
    armorClassFormulaSelection?: unknown;
    currencies?: unknown;
    backgroundNotes?: unknown;
    savingThrowProficiencies?: unknown;
    hitDiceRemaining?: unknown;
    maxHitPointsMode?: unknown;
    magicTemporaryHitPoints?: unknown;
    magicTemporaryHitPointsSource?: unknown;
    temporaryHitPoints?: unknown;
    temporaryHitPointsSource?: unknown;
    hover?: unknown;
    roundTracker?: unknown;
    conditions?: unknown;
    statusEntries?: unknown;
    deathSaves?: unknown;
    inventoryItems?: unknown;
    customEquipment?: unknown;
    companions?: unknown;
    classFeatureState?: unknown;
    feats?: unknown;
    heroicInspiration?: unknown;
  };
  const id = Number(record.id);

  if (!Number.isFinite(id)) {
    return null;
  }

  const defaults = createEmptyCharacter();
  const normalizedHitPoints = clampNumber(record.hitPoints, 1, 999, defaults.hitPoints);
  const { level: normalizedLevel, xp: normalizedXp } = normalizeLevelAndXp(
    record.level,
    record.xp ?? record.experience
  );
  const normalizedSpecies =
    typeof record.species === "string" ? record.species.trim() : defaults.species;
  const normalizedClassName =
    typeof record.className === "string"
      ? record.className.trim()
      : typeof record.class === "string"
        ? record.class.trim()
        : typeof record.role === "string"
          ? record.role.trim()
          : defaults.className;
  const normalizedBackground =
    typeof record.background === "string" ? record.background.trim() : defaults.background;
  const normalizedBackgroundNotes =
    typeof record.backgroundNotes === "string"
      ? record.backgroundNotes.trim()
      : defaults.backgroundNotes;
  const normalizedSubclassId = normalizeSubclassId(record.subclassId, normalizedClassName);
  const resolvedBackground = isBackgroundName(normalizedBackground)
    ? normalizedBackground
    : defaults.background;
  const rawSkills = Array.isArray(record.skills)
    ? (record.skills as unknown[]).filter((skill): skill is string => typeof skill === "string")
    : defaults.skills;
  const rawEquipment = Array.isArray(record.equipment) ? record.equipment : defaults.equipment;
  const rawSkillExpertise = Array.isArray(record.skillExpertise)
    ? (record.skillExpertise as unknown[]).filter(
        (skill): skill is string => typeof skill === "string"
      )
    : (defaults.skillExpertise ?? []);
  const rawLegacySavingThrowProficiencies = Array.isArray(record.savingThrowProficiencies)
    ? (record.savingThrowProficiencies as unknown[]).filter(
        (ability): ability is string => typeof ability === "string"
      )
    : (defaults.savingThrowProficiencies ?? []);
  const rawLegacyToolProficiencies = Array.isArray(record.toolProficiencies)
    ? (record.toolProficiencies as unknown[]).filter(
        (toolProficiency): toolProficiency is string => typeof toolProficiency === "string"
      )
    : (defaults.toolProficiencies ?? []);
  const hasPersistedArmorWearState =
    hasExplicitArmorWornState(record.equipment) ||
    hasExplicitArmorWornState(record.inventoryItems) ||
    hasExplicitArmorWornState(record.customEquipment);
  const normalizedEquipment = normalizeCharacterEquipmentSelections(rawEquipment);
  const normalizedInventoryItems = normalizeCharacterInventoryItems(record.inventoryItems);
  const normalizedCustomEquipment = normalizeCustomEquipmentEntries(record.customEquipment);
  const normalizedArmorWearState = normalizeCharacterArmorWearState(
    normalizedEquipment,
    normalizedInventoryItems,
    normalizedCustomEquipment,
    {
      autoEquipLegacyArmor: !hasPersistedArmorWearState
    }
  );
  const normalizedAbilities = {
    ...createDefaultAbilities(),
    ...(record.abilities ?? {})
  };
  const normalizedFeats = normalizeCharacterFeats(record.feats, normalizedLevel);
  const rawPersistedCantripIds = Array.isArray(record.cantripIds)
    ? record.cantripIds.filter((spellId): spellId is string => typeof spellId === "string")
    : [];
  const preliminaryClassFeatureState = normalizeCharacterClassFeatureState(
    record.classFeatureState,
    {
      className: normalizedClassName,
      level: normalizedLevel,
      subclassId: normalizedSubclassId,
      abilities: normalizedAbilities,
      cantripIds: rawPersistedCantripIds,
      feats: normalizedFeats
    }
  );
  const rawCantripIds = Array.isArray(record.cantripIds)
    ? rawPersistedCantripIds
    : getDefaultCantripIdsForCharacter(
        normalizedClassName,
        normalizedLevel,
        preliminaryClassFeatureState,
        normalizedSubclassId
      );
  const cantripLimit = getCantripLimitForCharacter(
    normalizedClassName,
    normalizedLevel,
    preliminaryClassFeatureState,
    normalizedSubclassId
  );
  const cantripSelectionOptionIds = new Set(
    getCantripSelectionOptionsForCharacter(
      normalizedClassName,
      normalizedLevel,
      normalizedSubclassId
    ).map((spell) => spell.id)
  );
  const normalizedCantripIds = [...new Set(rawCantripIds)]
    .filter((spellId) => cantripSelectionOptionIds.has(spellId))
    .slice(0, cantripLimit ?? Number.POSITIVE_INFINITY);
  let normalizedClassFeatureState = normalizeCharacterClassFeatureState(record.classFeatureState, {
    className: normalizedClassName,
    level: normalizedLevel,
    subclassId: normalizedSubclassId,
    abilities: normalizedAbilities,
    cantripIds: normalizedCantripIds,
    feats: normalizedFeats
  });
  const hasLegacyArcaneWardMagicTemporaryHitPoints =
    normalizedClassName === "Wizard" &&
    normalizedSubclassId === "wizard-abjurer" &&
    normalizedLevel >= 3 &&
    normalizedClassFeatureState.wizard?.arcaneWardCreatedThisLongRest !== true &&
    clampNumber(record.magicTemporaryHitPoints, 0, 999, 0) > 0;

  if (hasLegacyArcaneWardMagicTemporaryHitPoints) {
    normalizedClassFeatureState = {
      ...normalizedClassFeatureState,
      wizard: {
        ...normalizedClassFeatureState.wizard,
        arcaneWardCreatedThisLongRest: true
      }
    };
  }
  const normalizedProficiencies = normalizeCharacterProficiencies({
    className: normalizedClassName,
    level: normalizedLevel,
    species: normalizedSpecies,
    background: resolvedBackground,
    subclassId: normalizedSubclassId,
    classFeatureState: normalizedClassFeatureState,
    skillProficiencies: record.skillProficiencies,
    savingThrowProficiencies: record.savingThrowProficiencies,
    weaponProficiencies: record.weaponProficiencies,
    armorProficiencies: record.armorProficiencies,
    toolProficiencies: record.toolProficiencies,
    languageProficiencies: record.languageProficiencies,
    legacySkills: rawSkills,
    legacySkillExpertise: rawSkillExpertise,
    legacySavingThrowProficiencies: rawLegacySavingThrowProficiencies,
    legacyToolProficiencies: rawLegacyToolProficiencies
  });
  const normalizedStatusEntries = normalizeCharacterStatusEntries(
    record.statusEntries,
    record.conditions
  );
  const rawKnownSpellIds = Array.isArray(record.knownSpellIds)
    ? record.knownSpellIds.filter((spellId): spellId is string => typeof spellId === "string")
    : [];
  const rawPreparedSpellIds = Array.isArray(record.preparedSpellIds)
    ? record.preparedSpellIds.filter((spellId): spellId is string => typeof spellId === "string")
    : rawKnownSpellIds.length > 0
      ? rawKnownSpellIds
      : (defaults.preparedSpellIds ?? []);
  const preparedSpellLimit = getPreparedSpellLimitForCharacter(
    normalizedClassName,
    normalizedLevel,
    normalizedSubclassId
  );
  const preparedSpellSelectionOptions = getPreparedSpellSelectionOptionsForCharacter(
    normalizedClassName,
    normalizedLevel,
    normalizedSubclassId
  );
  const preparedSpellSelectionOptionIds = new Set(
    preparedSpellSelectionOptions.map((spell) => spell.id)
  );
  const rawSpellbookSpellIds = Array.isArray(record.spellbookSpellIds)
    ? record.spellbookSpellIds.filter((spellId): spellId is string => typeof spellId === "string")
    : usesSpellbookForCharacter(normalizedClassName, normalizedSubclassId)
      ? [...rawKnownSpellIds, ...rawPreparedSpellIds]
      : [];
  const alwaysSpellbookSpellIds = getAlwaysSpellbookSpellIdsForCharacter({
    className: normalizedClassName,
    level: normalizedLevel,
    classFeatureState: normalizedClassFeatureState,
    spellbookSpellIds: rawSpellbookSpellIds,
    subclassId: normalizedSubclassId
  });
  const alwaysSpellbookSpellIdSet = new Set(alwaysSpellbookSpellIds);
  const normalizedSpellbookSpellIds = usesSpellbookForCharacter(
    normalizedClassName,
    normalizedSubclassId
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
        (!usesSpellbookForCharacter(normalizedClassName, normalizedSubclassId) ||
          normalizedSpellbookSpellIdSet.has(spellId))
    ),
    preparedSpellSelectionOptions,
    preparedSpellLimit,
    getAlwaysPreparedSpellIds(
      normalizedClassName,
      normalizedLevel,
      normalizedClassFeatureState,
      undefined,
      normalizedSubclassId,
      normalizedStatusEntries
    )
  );
  const spellSlotTotals = getSpellSlotTotalsForCharacter(
    normalizedClassName,
    normalizedLevel,
    normalizedSubclassId
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
      equipment: normalizedArmorWearState.equipment,
      inventoryItems: normalizedArmorWearState.inventoryItems,
      customEquipment: normalizedArmorWearState.customEquipment
    }
  );
  const normalizedCurrencies = normalizeCharacterCurrencies(record.currencies, defaults.currencies);
  const normalizedMaxHitPointsMode =
    record.maxHitPointsMode === "automatic" || record.maxHitPointsMode === "custom"
      ? record.maxHitPointsMode
      : loadPreferences().defaultMaxHitPointsMode;
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
    hitPoints: normalizedHitPoints,
    statusEntries: normalizedStatusEntries
  });

  return reconcileCharacterStatusConsequences({
    id,
    name: typeof record.name === "string" ? record.name : defaults.name,
    species: normalizedSpecies,
    className: normalizedClassName,
    subclassId: normalizedSubclassId,
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
    equipment: normalizedArmorWearState.equipment,
    inventoryItems: normalizedArmorWearState.inventoryItems,
    customEquipment: normalizedArmorWearState.customEquipment,
    companions: normalizedCompanions,
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
    feats: normalizedFeats
  });
}

function loadStoredCharacterRecords(): unknown[] {
  if (typeof window === "undefined") {
    return [];
  }

  const serializedCharacters = window.localStorage.getItem(CHARACTERS_STORAGE_KEY);

  if (!serializedCharacters) {
    return [];
  }

  try {
    const parsedCharacters = JSON.parse(serializedCharacters) as unknown;
    return Array.isArray(parsedCharacters) ? parsedCharacters : [];
  } catch {
    return [];
  }
}

function saveStoredCharacterRecords(characters: unknown[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(characters));
}

function getStoredCharacterId(character: unknown): number | null {
  if (!character || typeof character !== "object") {
    return null;
  }

  const id = Number((character as { id?: unknown }).id);

  return Number.isFinite(id) ? id : null;
}

export function loadCharacters(): Character[] {
  return loadStoredCharacterRecords()
    .map((character) => normalizeCharacter(character))
    .filter((character): character is Character => character !== null);
}

export function saveCharacters(characters: Character[]) {
  saveStoredCharacterRecords(characters);
}

export function upsertTrustedCharacter(character: Character): Character {
  if (!Number.isFinite(character.id)) {
    throw new Error("Unable to save character: invalid character id.");
  }

  const characters = loadStoredCharacterRecords();
  const nextCharacters = characters.some((entry) => getStoredCharacterId(entry) === character.id)
    ? characters.map((entry) => (getStoredCharacterId(entry) === character.id ? character : entry))
    : [character, ...characters];

  saveStoredCharacterRecords(nextCharacters);
  return character;
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
  characterId?: number
): Character {
  const characters = loadStoredCharacterRecords();
  const nextId = characterId ?? Date.now();
  const previousCharacter =
    characterId === undefined
      ? null
      : (() => {
          const previousCharacterRecord =
            characters.find((character) => getStoredCharacterId(character) === characterId) ??
            null;

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

  const nextCharacters =
    characterId === undefined
      ? [nextCharacter, ...characters]
      : characters.some((character) => getStoredCharacterId(character) === characterId)
        ? characters.map((character) =>
            getStoredCharacterId(character) === characterId ? nextCharacter : character
          )
        : [nextCharacter, ...characters];

  saveStoredCharacterRecords(nextCharacters);
  return nextCharacter;
}
