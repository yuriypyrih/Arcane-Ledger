import { useEffect, useState } from "react";
import { captureAppError } from "../../lib/sentry";
import {
  CHARACTER_ROSTER_CHANGED_EVENT,
  getLocalCharacterRosterSnapshot,
  loadCharacterRosterEntries,
  migrateLegacyCharacterRosterRecords,
  type CharacterRosterEntry
} from "./characterRoster";
import { CHARACTER_STORAGE_CHANGED_EVENT } from "./portableCharacterSheetStorage";

export function useCharacterRosterEntries(ownerId?: string | null) {
  const [characters, setCharacters] = useState<CharacterRosterEntry[]>(() =>
    loadCharacterRosterEntries(ownerId)
  );

  useEffect(() => {
    function refreshRosterEntries() {
      setCharacters(loadCharacterRosterEntries(ownerId));
    }

    refreshRosterEntries();

    window.addEventListener(CHARACTER_STORAGE_CHANGED_EVENT, refreshRosterEntries);
    window.addEventListener(CHARACTER_ROSTER_CHANGED_EVENT, refreshRosterEntries);

    return () => {
      window.removeEventListener(CHARACTER_STORAGE_CHANGED_EVENT, refreshRosterEntries);
      window.removeEventListener(CHARACTER_ROSTER_CHANGED_EVENT, refreshRosterEntries);
    };
  }, [ownerId]);

  useEffect(() => {
    let didCancel = false;

    if (!getLocalCharacterRosterSnapshot().hasLegacyRecords) {
      return () => {
        didCancel = true;
      };
    }

    void migrateLegacyCharacterRosterRecords()
      .then((didMigrate) => {
        if (!didCancel && didMigrate) {
          setCharacters(loadCharacterRosterEntries(ownerId));
        }
      })
      .catch((error) => {
        captureAppError(error, {
          area: "characters",
          action: "migrate-roster"
        });
      });

    return () => {
      didCancel = true;
    };
  }, [ownerId]);

  return characters;
}
