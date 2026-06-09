import type {
  CharacterAvatarMetadata,
  HydratedCharacter,
  PortableCharacterSheet,
  CharacterSheetSyncStatus,
  CharacterSyncMetadata
} from "../../types";
import { PORTABLE_CHARACTER_SHEET_SCHEMA_VERSION } from "../../types";
import { getSerializedJsonSizeBytes, normalizeSheetSizeBytes } from "./characterSheetSize";
import {
  getCharacterBackgroundDisplayName,
  getCharacterClassDisplayName,
  getCharacterSpeciesDisplayName
} from "./customOrigins";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown): number | null {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function readPositiveInteger(value: unknown): number | null {
  const numberValue = Math.floor(Number(value));

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

const characterSheetSyncStatuses = new Set<CharacterSheetSyncStatus>([
  "local-only",
  "dirty",
  "syncing",
  "synced",
  "deleting",
  "conflict",
  "error"
]);

function createCharacterSyncClientId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `character-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function normalizeCharacterSheetSyncStatus(value: unknown): CharacterSheetSyncStatus {
  return typeof value === "string" && characterSheetSyncStatuses.has(value as CharacterSheetSyncStatus)
    ? (value as CharacterSheetSyncStatus)
    : "local-only";
}

function normalizeIsoTimestamp(value: unknown): string | undefined {
  const timestamp = readString(value);

  if (!timestamp) {
    return undefined;
  }

  return Number.isNaN(Date.parse(timestamp)) ? undefined : timestamp;
}

export function normalizeCharacterSyncMetadata(
  value: unknown
): CharacterSyncMetadata | undefined {
  if (!isObjectRecord(value)) {
    return undefined;
  }

  const clientId = readString(value.clientId);

  if (!clientId) {
    return undefined;
  }

  const ownerId = readString(value.ownerId);
  const remoteId = readString(value.remoteId);
  const remoteRevision = readPositiveInteger(value.remoteRevision) ?? undefined;
  const lastLocalChangeAt = normalizeIsoTimestamp(value.lastLocalChangeAt);
  const lastSyncedAt = normalizeIsoTimestamp(value.lastSyncedAt);
  const lastSyncError = readString(value.lastSyncError);

  return {
    clientId,
    ...(ownerId ? { ownerId } : {}),
    ...(remoteId ? { remoteId } : {}),
    localRevision: readPositiveInteger(value.localRevision) ?? 1,
    ...(remoteRevision ? { remoteRevision } : {}),
    syncStatus: normalizeCharacterSheetSyncStatus(value.syncStatus),
    ...(lastLocalChangeAt ? { lastLocalChangeAt } : {}),
    ...(lastSyncedAt ? { lastSyncedAt } : {}),
    ...(lastSyncError ? { lastSyncError } : {})
  };
}

export function normalizeCharacterAvatarMetadata(
  value: unknown
): CharacterAvatarMetadata | undefined {
  if (!isObjectRecord(value)) {
    return undefined;
  }

  const objectKey = readString(value.objectKey);
  const imageUrl = readString(value.imageUrl);
  const mimeType = readString(value.mimeType);
  const sizeBytes = readPositiveInteger(value.sizeBytes);
  const updatedAt = normalizeIsoTimestamp(value.updatedAt);

  if (!objectKey || !imageUrl || !mimeType || !sizeBytes || !updatedAt) {
    return undefined;
  }

  return {
    objectKey,
    imageUrl,
    mimeType,
    sizeBytes,
    updatedAt
  };
}

export function createCharacterSyncMetadata(
  options: {
    ownerId?: string | null;
    remoteId?: string | null;
    remoteRevision?: number | null;
    syncStatus?: CharacterSheetSyncStatus;
  } = {}
): CharacterSyncMetadata {
  const now = new Date().toISOString();
  const ownerId = readString(options.ownerId);
  const remoteId = readString(options.remoteId);
  const remoteRevision = readPositiveInteger(options.remoteRevision);
  const syncStatus = options.syncStatus ?? (ownerId ? "dirty" : "local-only");

  return {
    clientId: createCharacterSyncClientId(),
    ...(ownerId ? { ownerId } : {}),
    ...(remoteId ? { remoteId } : {}),
    localRevision: 1,
    ...(remoteRevision ? { remoteRevision } : {}),
    syncStatus,
    lastLocalChangeAt: now,
    ...(syncStatus === "synced" ? { lastSyncedAt: now } : {})
  };
}

export function ensurePortableCharacterSheetSyncMetadata(
  record: PortableCharacterSheet,
  options: {
    ownerId?: string | null;
    syncStatus?: CharacterSheetSyncStatus;
  } = {}
): PortableCharacterSheet {
  const existingSync = normalizeCharacterSyncMetadata(record.metadata?.sync);
  const ownerId = readString(options.ownerId) ?? existingSync?.ownerId;
  const syncStatus = options.syncStatus ?? existingSync?.syncStatus ?? (ownerId ? "dirty" : "local-only");

  return {
    ...record,
    metadata: {
      ...(record.metadata ?? {}),
      sheetSizeBytes: getRecordSheetSizeBytes(record) ?? 0,
      sync: existingSync
        ? {
            ...existingSync,
            ...(ownerId ? { ownerId } : {}),
            syncStatus
          }
        : createCharacterSyncMetadata({ ownerId, syncStatus })
    }
  };
}

export function markPortableCharacterSheetDirty(
  record: PortableCharacterSheet,
  ownerId?: string | null
): PortableCharacterSheet {
  const syncedRecord = ensurePortableCharacterSheetSyncMetadata(record, { ownerId });
  const sync = syncedRecord.metadata?.sync;

  if (!sync || !sync.ownerId) {
    return syncedRecord;
  }

  const { lastSyncError: _lastSyncError, ...syncWithoutError } = sync;

  return {
    ...syncedRecord,
    metadata: {
      ...(syncedRecord.metadata ?? {}),
      sheetSizeBytes: getRecordSheetSizeBytes(syncedRecord) ?? 0,
      sync: {
        ...syncWithoutError,
        localRevision: sync.localRevision + 1,
        syncStatus: "dirty",
        lastLocalChangeAt: new Date().toISOString()
      }
    }
  };
}

export function markPortableCharacterSheetDeleting(
  record: PortableCharacterSheet,
  ownerId?: string | null
): PortableCharacterSheet {
  const syncedRecord = ensurePortableCharacterSheetSyncMetadata(record, { ownerId });
  const sync = syncedRecord.metadata?.sync;

  if (!sync || !sync.ownerId) {
    return syncedRecord;
  }

  const { lastSyncError: _lastSyncError, ...syncWithoutError } = sync;

  return {
    ...syncedRecord,
    metadata: {
      ...(syncedRecord.metadata ?? {}),
      sheetSizeBytes: getRecordSheetSizeBytes(syncedRecord) ?? 0,
      sync: {
        ...syncWithoutError,
        localRevision: sync.localRevision + 1,
        syncStatus: "deleting",
        lastLocalChangeAt: new Date().toISOString()
      }
    }
  };
}

export function markPortableCharacterSheetDeletingError(
  record: PortableCharacterSheet,
  message: string
): PortableCharacterSheet {
  const syncedRecord = ensurePortableCharacterSheetSyncMetadata(record);
  const sync = syncedRecord.metadata?.sync;

  if (!sync) {
    return syncedRecord;
  }

  return {
    ...syncedRecord,
    metadata: {
      ...(syncedRecord.metadata ?? {}),
      sheetSizeBytes: getRecordSheetSizeBytes(syncedRecord) ?? 0,
      sync: {
        ...sync,
        syncStatus: "deleting",
        lastSyncError: message
      }
    }
  };
}

export function applyCloudSyncMetadataToPortableCharacterSheet(
  record: PortableCharacterSheet,
  options: {
    ownerId: string;
    remoteId: string;
    remoteRevision: number;
    clientId?: string;
    syncedAt?: string;
  }
): PortableCharacterSheet {
  const existingSync = normalizeCharacterSyncMetadata(record.metadata?.sync);
  const syncedAt = normalizeIsoTimestamp(options.syncedAt) ?? new Date().toISOString();

  return {
    ...record,
    metadata: {
      ...(record.metadata ?? {}),
      sheetSizeBytes: getRecordSheetSizeBytes(record) ?? 0,
      sync: {
        clientId: readString(options.clientId) ?? existingSync?.clientId ?? createCharacterSyncClientId(),
        ownerId: options.ownerId,
        remoteId: options.remoteId,
        localRevision: existingSync?.localRevision ?? 1,
        remoteRevision: options.remoteRevision,
        syncStatus: "synced",
        ...(existingSync?.lastLocalChangeAt
          ? { lastLocalChangeAt: existingSync.lastLocalChangeAt }
          : {}),
        lastSyncedAt: syncedAt
      }
    }
  };
}

export function markPortableCharacterSheetSyncError(
  record: PortableCharacterSheet,
  message: string,
  syncStatus: Extract<CharacterSheetSyncStatus, "conflict" | "error"> = "error"
): PortableCharacterSheet {
  const syncedRecord = ensurePortableCharacterSheetSyncMetadata(record);
  const sync = syncedRecord.metadata?.sync;

  if (!sync) {
    return syncedRecord;
  }

  return {
    ...syncedRecord,
    metadata: {
      ...(syncedRecord.metadata ?? {}),
      sheetSizeBytes: getRecordSheetSizeBytes(syncedRecord) ?? 0,
      sync: {
        ...sync,
        syncStatus,
        lastSyncError: message
      }
    }
  };
}

export function detachPortableCharacterSheetCloudSync(
  record: PortableCharacterSheet,
  message: string
): PortableCharacterSheet {
  const syncedRecord = ensurePortableCharacterSheetSyncMetadata(record);
  const sync = syncedRecord.metadata?.sync;

  if (!sync) {
    return syncedRecord;
  }

  return {
    ...syncedRecord,
    metadata: {
      ...(syncedRecord.metadata ?? {}),
      sheetSizeBytes: getRecordSheetSizeBytes(syncedRecord) ?? 0,
      sync: {
        clientId: sync.clientId,
        ...(sync.ownerId ? { ownerId: sync.ownerId } : {}),
        localRevision: sync.localRevision,
        syncStatus: "local-only",
        ...(sync.lastLocalChangeAt ? { lastLocalChangeAt: sync.lastLocalChangeAt } : {}),
        lastSyncError: message
      }
    }
  };
}

export function stripPortableCharacterSheetLocalSyncMetadata(
  record: PortableCharacterSheet
): PortableCharacterSheet {
  if (!record.metadata?.sync && !record.metadata?.avatar) {
    return record;
  }
  const { avatar: _avatar, sync: _sync, ...storedMetadata } = record.metadata ?? {
    sheetSizeBytes: 0
  };

  return {
    ...record,
    metadata: {
      ...storedMetadata,
      sheetSizeBytes: getRecordSheetSizeBytes(record) ?? 0
    }
  };
}

function getRecordSheetSizeBytes(record: PortableCharacterSheet): number | undefined {
  const metadata = isObjectRecord(record.metadata)
    ? (record.metadata as { sheetSizeBytes?: unknown })
    : {};

  return (
    normalizeSheetSizeBytes(metadata.sheetSizeBytes) ??
    normalizeSheetSizeBytes(record.summary.sheetSizeBytes)
  );
}

function withSheetSizeMetadata(record: PortableCharacterSheet): PortableCharacterSheet {
  let sizedRecord: PortableCharacterSheet = {
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

export function isPortableCharacterSheet(value: unknown): value is PortableCharacterSheet {
  return (
    isObjectRecord(value) &&
    value.schemaVersion === PORTABLE_CHARACTER_SHEET_SCHEMA_VERSION &&
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

export function getPortableCharacterSheetLocalId(value: unknown): number | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  if (isPortableCharacterSheet(value)) {
    return (
      readNumber(value.identity.localId) ??
      (isObjectRecord(value.summary) ? readNumber(value.summary.localId) : null)
    );
  }

  return readNumber(value.id);
}

export function withPortableCharacterSheetLocalId(
  record: PortableCharacterSheet,
  localId: number
): PortableCharacterSheet {
  return withSheetSizeMetadata({
    ...record,
    identity: {
      ...record.identity,
      localId
    },
    summary: {
      ...record.summary,
      localId
    }
  });
}

export function createPortableCharacterSheet(character: HydratedCharacter): PortableCharacterSheet {
  return withSheetSizeMetadata({
    schemaVersion: PORTABLE_CHARACTER_SHEET_SCHEMA_VERSION,
    identity: {
      localId: character.id,
      name: character.name,
      alignment: character.alignment
    },
    origin: {
      species: character.species,
      speciesChoices: character.speciesChoices,
      customSpecies: character.customSpecies,
      background: character.background,
      backgroundChoices: character.backgroundChoices,
      customBackground: character.customBackground,
      backgroundNotes: character.backgroundNotes
    },
    progression: {
      className: character.className,
      subclassId: character.subclassId,
      customSubclass: character.customSubclass,
      classRules: character.classRules,
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
      customActions: character.customActions,
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
      species: getCharacterSpeciesDisplayName(character),
      className: getCharacterClassDisplayName(character),
      subclassId: character.subclassId,
      level: character.level,
      background: getCharacterBackgroundDisplayName(character),
      sheetSizeBytes: normalizeSheetSizeBytes(character.storageMetadata?.sheetSizeBytes)
    },
    metadata: {
      sheetSizeBytes: normalizeSheetSizeBytes(character.storageMetadata?.sheetSizeBytes) ?? 0,
      ...(normalizeCharacterSyncMetadata(character.storageMetadata?.sync)
        ? { sync: normalizeCharacterSyncMetadata(character.storageMetadata?.sync) }
        : {}),
      ...(normalizeCharacterAvatarMetadata(character.storageMetadata?.avatar)
        ? { avatar: normalizeCharacterAvatarMetadata(character.storageMetadata?.avatar) }
        : {})
    }
  });
}

export function createHydratedCharacterInputFromPortableSheet(
  record: PortableCharacterSheet
): Partial<HydratedCharacter> & { id: number } {
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
    customSpecies: record.origin.customSpecies,
    speciesFeatureState: record.features.speciesFeatureState,
    className: record.progression.className ?? record.summary.className,
    subclassId: record.progression.subclassId ?? record.summary.subclassId ?? undefined,
    customSubclass: record.progression.customSubclass,
    classRules: record.progression.classRules,
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
    customBackground: record.origin.customBackground,
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
    customActions: record.features.customActions,
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
      sheetSizeBytes,
      ...(normalizeCharacterSyncMetadata(record.metadata?.sync)
        ? { sync: normalizeCharacterSyncMetadata(record.metadata?.sync) }
        : {}),
      ...(normalizeCharacterAvatarMetadata(record.metadata?.avatar)
        ? { avatar: normalizeCharacterAvatarMetadata(record.metadata?.avatar) }
        : {})
    }
  };
}
