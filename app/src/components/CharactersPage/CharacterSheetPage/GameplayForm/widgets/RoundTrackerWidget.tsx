import { useState } from "react";
import ActionShape from "../../../../ActionShape";
import ResourceManagementModal from "../../ResourceManagementModal";
import type { Character, CharacterStatusEntry } from "../../../../../types";
import { STATUS_DURATION_ROUND_TICK, STATUS_ENTRY_SOURCE_TYPE } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  finishRoundTrackerTurn,
  normalizeRoundTracker,
  setRoundTrackerResourceAvailability,
  type RoundTrackerResource
} from "../../../../../pages/CharactersPage/combat";
import { removeFeatureStatusEntryForCharacter } from "../../../../../pages/CharactersPage/classFeatures";
import {
  advanceCharacterStatusEntries,
  normalizeCharacterStatusEntries
} from "../../../../../pages/CharactersPage/statusEntries";
import { advanceCharacterCompanionDurations } from "../../../../../pages/CharactersPage/companions";
import { getRoundTrackerResourceMeta } from "../gameplayWidgetUtils";
import RoundTrackerControl from "./RoundTrackerControl";
import { consumeRoundTrackerResourceForCharacter, startCharacterTurn } from "../gameplayStateUtils";

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
  const isSelectedResourceAvailable =
    selectedResource === "action"
      ? roundTracker.actionAvailable
      : selectedResource === "bonusAction"
        ? roundTracker.bonusActionAvailable
        : selectedResource === "reaction"
          ? roundTracker.reactionAvailable
          : null;
  const selectedMeta =
    selectedResource && isSelectedResourceAvailable !== null
      ? getRoundTrackerResourceMeta(selectedResource, isSelectedResourceAvailable)
      : null;

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
      statusEntries: nextStatusEntries,
      companions: advanceCharacterCompanionDurations(currentCharacter.companions, tickOn)
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
      roundTracker: setRoundTrackerResourceAvailability(
        currentCharacter.roundTracker,
        resource,
        true
      )
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

      {selectedResource && selectedMeta && isSelectedResourceAvailable !== null ? (
        <ResourceManagementModal
          titleId={`round-tracker-${selectedResource}-title`}
          title={selectedMeta.title}
          closeLabel={`Close ${selectedMeta.title.toLowerCase()} resource management`}
          onClose={() => setSelectedResource(null)}
          titleAccessory={
            <ActionShape
              shape={selectedResource}
              isSelected={isSelectedResourceAvailable}
              size="small"
              aria-label={`${selectedMeta.title} action badge`}
            />
          }
          actions={[
            {
              label: "Use",
              onClick: () => consumeResource(selectedResource),
              disabled: !isSelectedResourceAvailable,
              ariaLabel: `Use ${selectedMeta.title.toLowerCase()}`
            },
            {
              label: "Reset",
              onClick: () => resetResource(selectedResource),
              disabled: isSelectedResourceAvailable,
              ariaLabel: `Reset ${selectedMeta.title.toLowerCase()}`
            }
          ]}
        />
      ) : null}
    </>
  );
}

export default RoundTrackerWidget;
