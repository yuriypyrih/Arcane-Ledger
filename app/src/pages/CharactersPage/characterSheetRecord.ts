import type { Character, CharacterSheetRecordV2 } from "../../types";
import { CHARACTER_SHEET_RECORD_SCHEMA_VERSION } from "../../types";
import { getSerializedJsonSizeBytes, normalizeSheetSizeBytes } from "./characterSheetSize";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown): number | null {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function getRecordSheetSizeBytes(record: CharacterSheetRecordV2): number | undefined {
  const metadata = isObjectRecord(record.metadata)
    ? (record.metadata as { sheetSizeBytes?: unknown })
    : {};

  return (
    normalizeSheetSizeBytes(metadata.sheetSizeBytes) ??
    normalizeSheetSizeBytes(record.summary.sheetSizeBytes)
  );
}

function withSheetSizeMetadata(record: CharacterSheetRecordV2): CharacterSheetRecordV2 {
  let sizedRecord: CharacterSheetRecordV2 = {
    ...record,
    summary: {
      ...record.summary,
      sheetSizeBytes: normalizeSheetSizeBytes(record.summary.sheetSizeBytes) ?? 0
    },
    metadata: {
      ...(record.metadata ?? {}),
      sheetSizeBytes: normalizeSheetSizeBytes(record.metadata?.sheetSizeBytes) ?? 0
    }
  };

  for (let iteration = 0; iteration < 4; iteration += 1) {
    const nextSizeBytes = getSerializedJsonSizeBytes(sizedRecord);

    if (nextSizeBytes === sizedRecord.metadata?.sheetSizeBytes) {
      return sizedRecord;
    }

    sizedRecord = {
      ...sizedRecord,
      summary: {
        ...sizedRecord.summary,
        sheetSizeBytes: nextSizeBytes
      },
      metadata: {
        ...(sizedRecord.metadata ?? {}),
        sheetSizeBytes: nextSizeBytes
      }
    };
  }

  return sizedRecord;
}

export function isCharacterSheetRecordV2(value: unknown): value is CharacterSheetRecordV2 {
  return (
    isObjectRecord(value) &&
    value.schemaVersion === CHARACTER_SHEET_RECORD_SCHEMA_VERSION &&
    isObjectRecord(value.identity) &&
    isObjectRecord(value.origin) &&
    isObjectRecord(value.progression) &&
    isObjectRecord(value.abilities) &&
    isObjectRecord(value.vitals) &&
    isObjectRecord(value.resources) &&
    isObjectRecord(value.spellcasting) &&
    isObjectRecord(value.features) &&
    isObjectRecord(value.proficiencies) &&
    isObjectRecord(value.inventory) &&
    isObjectRecord(value.companions) &&
    isObjectRecord(value.session) &&
    isObjectRecord(value.preferences) &&
    isObjectRecord(value.summary)
  );
}

export function getCharacterSheetRecordLocalId(value: unknown): number | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  if (isCharacterSheetRecordV2(value)) {
    return (
      readNumber(value.identity.localId) ??
      (isObjectRecord(value.summary) ? readNumber(value.summary.localId) : null)
    );
  }

  return readNumber(value.id);
}

export function createCharacterSheetRecordV2(character: Character): CharacterSheetRecordV2 {
  return withSheetSizeMetadata({
    schemaVersion: CHARACTER_SHEET_RECORD_SCHEMA_VERSION,
    identity: {
      localId: character.id,
      name: character.name,
      alignment: character.alignment
    },
    origin: {
      species: character.species,
      speciesChoices: character.speciesChoices,
      background: character.background,
      backgroundChoices: character.backgroundChoices,
      backgroundNotes: character.backgroundNotes
    },
    progression: {
      className: character.className,
      subclassId: character.subclassId,
      customClass: character.customClass,
      level: character.level,
      xp: character.xp
    },
    abilities: {
      attributeMode: character.attributeMode,
      scores: character.abilities
    },
    vitals: {
      maxHitPointsMode: character.maxHitPointsMode,
      hitPoints: character.hitPoints,
      currentHitPoints: character.currentHitPoints,
      magicTemporaryHitPoints: character.magicTemporaryHitPoints,
      magicTemporaryHitPointsSource: character.magicTemporaryHitPointsSource,
      temporaryHitPoints: character.temporaryHitPoints,
      temporaryHitPointsSource: character.temporaryHitPointsSource,
      hitDiceRemaining: character.hitDiceRemaining,
      deathSaves: character.deathSaves
    },
    resources: {
      heroicInspiration: character.heroicInspiration,
      shortRestsUsedToday: character.shortRestsUsedToday
    },
    spellcasting: {
      cantripIds: character.cantripIds,
      spellbookSpellIds: character.spellbookSpellIds,
      preparedSpellIds: character.preparedSpellIds,
      spellSlotsExpended: character.spellSlotsExpended
    },
    features: {
      speciesFeatureState: character.speciesFeatureState,
      classFeatureState: character.classFeatureState,
      feats: character.feats
    },
    proficiencies: {
      skillProficiencies: character.skillProficiencies,
      savingThrowProficiencies: character.savingThrowProficiencies,
      weaponProficiencies: character.weaponProficiencies,
      armorProficiencies: character.armorProficiencies,
      toolProficiencies: character.toolProficiencies,
      languageProficiencies: character.languageProficiencies
    },
    inventory: {
      currencies: character.currencies,
      items: character.inventoryItems
    },
    companions: {
      entries: character.companions
    },
    session: {
      roundTracker: character.roundTracker,
      statusEntries: character.statusEntries
    },
    preferences: {
      armorClassFormulaSelection: character.armorClassFormulaSelection,
      hover: character.hover
    },
    summary: {
      localId: character.id,
      name: character.name,
      species: character.species,
      className: character.className,
      subclassId: character.subclassId,
      level: character.level,
      background: character.background,
      sheetSizeBytes: normalizeSheetSizeBytes(character.storageMetadata?.sheetSizeBytes)
    },
    metadata: {
      sheetSizeBytes: normalizeSheetSizeBytes(character.storageMetadata?.sheetSizeBytes) ?? 0
    }
  });
}

export function createCharacterInputFromSheetRecordV2(
  record: CharacterSheetRecordV2
): Partial<Character> & { id: number } {
  const localId =
    readNumber(record.identity.localId) ??
    readNumber(record.summary.localId) ??
    Number.NaN;
  const sheetSizeBytes = getRecordSheetSizeBytes(record) ?? getSerializedJsonSizeBytes(record);

  return {
    id: localId,
    name: record.identity.name ?? record.summary.name,
    alignment: record.identity.alignment,
    species: record.origin.species ?? record.summary.species,
    speciesChoices: record.origin.speciesChoices,
    speciesFeatureState: record.features.speciesFeatureState,
    className: record.progression.className ?? record.summary.className,
    subclassId: record.progression.subclassId ?? record.summary.subclassId,
    customClass: record.progression.customClass,
    level: record.progression.level ?? record.summary.level,
    xp: record.progression.xp,
    hitPoints: record.vitals.hitPoints,
    currentHitPoints: record.vitals.currentHitPoints,
    magicTemporaryHitPoints: record.vitals.magicTemporaryHitPoints,
    magicTemporaryHitPointsSource: record.vitals.magicTemporaryHitPointsSource,
    temporaryHitPoints: record.vitals.temporaryHitPoints,
    temporaryHitPointsSource: record.vitals.temporaryHitPointsSource,
    maxHitPointsMode: record.vitals.maxHitPointsMode,
    hitDiceRemaining: record.vitals.hitDiceRemaining,
    deathSaves: record.vitals.deathSaves,
    attributeMode: record.abilities.attributeMode,
    abilities: record.abilities.scores,
    background: record.origin.background ?? record.summary.background,
    backgroundChoices: record.origin.backgroundChoices,
    backgroundNotes: record.origin.backgroundNotes,
    currencies: record.inventory.currencies,
    skillProficiencies: record.proficiencies.skillProficiencies ?? [],
    savingThrowProficiencies: record.proficiencies.savingThrowProficiencies ?? [],
    weaponProficiencies: record.proficiencies.weaponProficiencies ?? [],
    armorProficiencies: record.proficiencies.armorProficiencies ?? [],
    toolProficiencies: record.proficiencies.toolProficiencies ?? [],
    languageProficiencies: record.proficiencies.languageProficiencies ?? [],
    equipment: [],
    inventoryItems: record.inventory.items,
    customEquipment: [],
    companions: record.companions.entries,
    cantripIds: record.spellcasting.cantripIds,
    spellbookSpellIds: record.spellcasting.spellbookSpellIds,
    preparedSpellIds: record.spellcasting.preparedSpellIds,
    spellSlotsExpended: record.spellcasting.spellSlotsExpended,
    shortRestsUsedToday: record.resources.shortRestsUsedToday,
    heroicInspiration: record.resources.heroicInspiration,
    roundTracker: record.session.roundTracker,
    statusEntries: record.session.statusEntries,
    armorClassFormulaSelection: record.preferences.armorClassFormulaSelection,
    hover: record.preferences.hover,
    classFeatureState: record.features.classFeatureState,
    feats: record.features.feats,
    storageMetadata: {
      sheetSizeBytes
    }
  };
}
