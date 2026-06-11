import { useEffect, useState } from "react";
import { ApiOfflineError } from "../../api/client";
import { captureAppError } from "../../lib/sentry";
import {
  CHARACTER_ROSTER_CHANGED_EVENT,
  getLocalCharacterRosterSnapshot,
  loadCharacterRosterEntries,
  migrateLegacyCharacterRosterRecords,
  type CharacterRosterEntry
} from "./characterRoster";
import { CHARACTER_STORAGE_CHANGED_EVENT } from "./portableCharacterSheetStorage";
import { refreshCharacterCloudRoster } from "./resolvePortableCharacterSheet";

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

    if (!ownerId) {
      return () => {
        didCancel = true;
      };
    }

    void refreshCharacterCloudRoster(ownerId)
      .then(() => {
        if (!didCancel) {
          setCharacters(loadCharacterRosterEntries(ownerId));
        }
      })
      .catch((error) => {
        if (!didCancel && !(error instanceof ApiOfflineError)) {
          captureAppError(error, {
            area: "characters",
            action: "refresh-roster"
          });
        }
      });

    return () => {
      didCancel = true;
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
