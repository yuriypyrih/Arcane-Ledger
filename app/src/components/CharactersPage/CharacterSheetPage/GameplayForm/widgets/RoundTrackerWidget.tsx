import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Character, CharacterStatusEntry } from "../../../../../types";
import {
  STATUS_DURATION_ROUND_TICK,
  STATUS_ENTRY_SOURCE_TYPE
} from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  finishRoundTrackerTurn,
  normalizeRoundTracker,
  setRoundTrackerResourceAvailability,
  type RoundTrackerResource
} from "../../../../../pages/CharactersPage/combat";
import { useBodyScrollLock } from "../../../../../lib/useBodyScrollLock";
import { removeFeatureStatusEntryForCharacter } from "../../../../../pages/CharactersPage/classFeatures";
import {
  advanceCharacterStatusEntries,
  normalizeCharacterStatusEntries
} from "../../../../../pages/CharactersPage/traits";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import {
  getRoundTrackerResourceMeta
} from "../gameplayWidgetUtils";
import RoundTrackerControl from "./RoundTrackerControl";
import styles from "./RoundTrackerWidget.module.css";
import {
  consumeRoundTrackerResourceForCharacter,
  startCharacterTurn
} from "../gameplayStateUtils";

type RoundTrackerWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function getExpiredFeatureOverrideEntries(
  previousEntries: unknown,
  nextEntries: unknown
): CharacterStatusEntry[] {
  const nextOverrideIds = new Set(
    normalizeCharacterStatusEntries(nextEntries).map((entry) => entry.id)
  );

  return normalizeCharacterStatusEntries(previousEntries).filter(
    (entry) =>
      entry.sourceType === STATUS_ENTRY_SOURCE_TYPE.FEATURE &&
      typeof entry.sourceId === "string" &&
      entry.sourceId.length > 0 &&
      !nextOverrideIds.has(entry.id)
  );
}

function RoundTrackerWidget({ character, onPersistCharacter }: RoundTrackerWidgetProps) {
  const [selectedResource, setSelectedResource] = useState<RoundTrackerResource | null>(null);
  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const selectedMeta = useMemo(
    () =>
      selectedResource
        ? getRoundTrackerResourceMeta(
            selectedResource,
            selectedResource === "action"
              ? roundTracker.actionAvailable
              : selectedResource === "bonusAction"
                ? roundTracker.bonusActionAvailable
                : roundTracker.reactionAvailable
          )
        : null,
    [roundTracker.actionAvailable, roundTracker.bonusActionAvailable, roundTracker.reactionAvailable, selectedResource]
  );

  useBodyScrollLock(selectedResource !== null);

  useEffect(() => {
    if (selectedResource === null) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedResource(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedResource]);

  function startTurn() {
    onPersistCharacter((currentCharacter) => startCharacterTurn(currentCharacter));
  }

  function advanceTimedStatuses(
    currentCharacter: Character,
    tickOn: STATUS_DURATION_ROUND_TICK
  ): Character {
    const nextStatusEntries = advanceCharacterStatusEntries(currentCharacter.statusEntries, tickOn);
    const expiredFeatureOverrideEntries = getExpiredFeatureOverrideEntries(
      currentCharacter.statusEntries,
      nextStatusEntries
    );
    let nextCharacter: Character = {
      ...currentCharacter,
      statusEntries: nextStatusEntries
    };

    expiredFeatureOverrideEntries.forEach((entry) => {
      nextCharacter = removeFeatureStatusEntryForCharacter(nextCharacter, entry);
    });

    return nextCharacter;
  }

  function finishRound() {
    onPersistCharacter((currentCharacter) => {
      const nextCharacter = advanceTimedStatuses(
        currentCharacter,
        STATUS_DURATION_ROUND_TICK.ROUND_END
      );

      return {
        ...nextCharacter,
        roundTracker: finishRoundTrackerTurn(nextCharacter.roundTracker)
      };
    });
  }

  function consumeResource(resource: RoundTrackerResource) {
    onPersistCharacter((currentCharacter) =>
      consumeRoundTrackerResourceForCharacter(currentCharacter, resource)
    );
  }

  function resetResource(resource: RoundTrackerResource) {
    onPersistCharacter((currentCharacter) => ({
      ...currentCharacter,
      roundTracker: setRoundTrackerResourceAvailability(currentCharacter.roundTracker, resource, true)
    }));
  }

  return (
    <>
      <RoundTrackerControl
        roundTracker={roundTracker}
        onSelectResource={setSelectedResource}
        onStartTurn={startTurn}
        onFinishRound={finishRound}
      />

      {selectedResource && selectedMeta ? (
        <div
          className={sheetStyles.spellDrawerBackdrop}
          role="presentation"
          onClick={() => setSelectedResource(null)}
        >
          <section
            className={sheetStyles.spellDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="round-tracker-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={sheetStyles.spellDrawerHandle} aria-hidden="true" />
            <div className={sheetStyles.spellDrawerHeader}>
              <div className={sheetStyles.spellDrawerHeaderContent}>
                <p className={sheetStyles.spellDrawerBadge}>Round Tracker</p>
                <div className={sheetStyles.spellDrawerTitleRow}>
                  <h3 id="round-tracker-drawer-title" className={sheetStyles.spellDrawerTitle}>
                    {selectedMeta.title}
                  </h3>
                </div>
                <p className={sheetStyles.spellDrawerSummary}>{selectedMeta.description}</p>
              </div>
              <button
                type="button"
                className={sheetStyles.spellDrawerCloseButton}
                onClick={() => setSelectedResource(null)}
                aria-label="Close round tracker details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.drawerActions}>
              <button
                type="button"
                className={shared.saveButton}
                onClick={() => consumeResource(selectedResource)}
              >
                {selectedMeta.useLabel}
              </button>
              <button
                type="button"
                className={shared.cancelButton}
                onClick={() => resetResource(selectedResource)}
              >
                {selectedMeta.resetLabel}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default RoundTrackerWidget;
