const characterPortraitDatabaseName = "arcane-ledger.character-portraits";
const characterPortraitDatabaseVersion = 1;
const characterPortraitStoreName = "portraits";

export type CharacterPortraitRecord = {
  characterId: number;
  blob: Blob;
  mimeType: string;
  updatedAt: number;
};

let databasePromise: Promise<IDBDatabase> | null = null;

function getIndexedDbFactory(): IDBFactory {
  if (typeof window === "undefined" || !window.indexedDB) {
    throw new Error("Portrait storage is unavailable in this browser.");
  }

  return window.indexedDB;
}

function normalizeCharacterId(characterId: number): number {
  if (!Number.isFinite(characterId)) {
    throw new Error("Unable to store a portrait for this character.");
  }

  return characterId;
}

function openCharacterPortraitDatabase(): Promise<IDBDatabase> {
  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = new Promise((resolve, reject) => {
    const request = getIndexedDbFactory().open(
      characterPortraitDatabaseName,
      characterPortraitDatabaseVersion
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(characterPortraitStoreName)) {
        database.createObjectStore(characterPortraitStoreName, { keyPath: "characterId" });
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error("Unable to open portrait storage."));
    };
    request.onblocked = () => {
      databasePromise = null;
      reject(new Error("Portrait storage is blocked by another tab."));
    };
  });

  return databasePromise;
}

async function runPortraitStoreRequest<TResult>(
  mode: IDBTransactionMode,
  createRequest: (store: IDBObjectStore) => IDBRequest<TResult>
): Promise<TResult> {
  const database = await openCharacterPortraitDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(characterPortraitStoreName, mode);
    const store = transaction.objectStore(characterPortraitStoreName);
    const request = createRequest(store);
    let result: TResult;

    request.onsuccess = () => {
      result = request.result;
    };
    request.onerror = () => {
      reject(request.error ?? new Error("Unable to update portrait storage."));
    };
    transaction.oncomplete = () => {
      resolve(result);
    };
    transaction.onerror = () => {
      reject(transaction.error ?? new Error("Unable to update portrait storage."));
    };
    transaction.onabort = () => {
      reject(transaction.error ?? new Error("Portrait storage update was cancelled."));
    };
  });
}

export async function loadCharacterPortrait(
  characterId: number
): Promise<CharacterPortraitRecord | null> {
  const normalizedCharacterId = normalizeCharacterId(characterId);
  const record = await runPortraitStoreRequest<CharacterPortraitRecord | undefined>(
    "readonly",
    (store) => store.get(normalizedCharacterId)
  );

  return record ?? null;
}

export function saveCharacterPortrait(characterId: number, blob: Blob, mimeType: string) {
  const normalizedCharacterId = normalizeCharacterId(characterId);
  const record: CharacterPortraitRecord = {
    characterId: normalizedCharacterId,
    blob,
    mimeType,
    updatedAt: Date.now()
  };

  return runPortraitStoreRequest<IDBValidKey>("readwrite", (store) => store.put(record));
}

export function deleteCharacterPortrait(characterId: number) {
  const normalizedCharacterId = normalizeCharacterId(characterId);

  return runPortraitStoreRequest<undefined>("readwrite", (store) =>
    store.delete(normalizedCharacterId)
  );
}
