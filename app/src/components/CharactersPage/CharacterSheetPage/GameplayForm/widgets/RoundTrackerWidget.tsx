import { useState } from "react";
import clsx from "clsx";
import { Swords } from "lucide-react";
import ActionShape from "../../../../ActionShape";
import ResourceManagementModal from "../../ResourceManagementModal";
import type { Character, CharacterStatusEntry } from "../../../../../types";
import { STATUS_DURATION_ROUND_TICK, STATUS_ENTRY_SOURCE_TYPE } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  finishRoundTrackerTurn,
  normalizeRoundTracker,
  setRoundTrackerCombatState,
  setRoundTrackerResourceAvailability,
  type RoundTrackerResource
} from "../../../../../pages/CharactersPage/combat";
import {
  clearRoundScopedFeatureStateForCharacter,
  removeFeatureStatusEntryForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import {
  advanceCharacterStatusEntries,
  normalizeCharacterStatusEntries
} from "../../../../../pages/CharactersPage/statusEntries";
import { advanceCharacterCompanionDurations } from "../../../../../pages/CharactersPage/companions";
import { getRoundTrackerResourceMeta } from "../gameplayWidgetUtils";
import RoundTrackerControl from "./RoundTrackerControl";
import { consumeRoundTrackerResourceForCharacter, startCharacterTurn } from "../gameplayStateUtils";
import styles from "./RoundTrackerControl.module.css";

const COMBAT_MANAGEMENT_DESCRIPTION =
  "Here you can manually control the combat state. Some effects and conditions change their behavior based on whether you are in combat or not. When you roll initiative, combat always starts automatically.";

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
  const [isCombatManagementOpen, setIsCombatManagementOpen] = useState(false);
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

  function setCombatState(isInCombat: boolean) {
    onPersistCharacter((currentCharacter) => {
      const nextCharacter = clearRoundScopedFeatureStateForCharacter(currentCharacter);

      return {
        ...nextCharacter,
        roundTracker: setRoundTrackerCombatState(nextCharacter.roundTracker, isInCombat)
      };
    });
  }

  const combatTitle = roundTracker.isInCombat
    ? `In Combat (Round ${roundTracker.combatRound})`
    : "Out of Combat";

  return (
    <>
      <RoundTrackerControl
        roundTracker={roundTracker}
        onSelectResource={(resource) => {
          if (roundTracker.isInCombat) {
            setSelectedResource(resource);
          }
        }}
        onSelectCombat={() => setIsCombatManagementOpen(true)}
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

      {isCombatManagementOpen ? (
        <ResourceManagementModal
          titleId="round-tracker-combat-title"
          title={combatTitle}
          closeLabel="Close combat resource management"
          onClose={() => setIsCombatManagementOpen(false)}
          description={COMBAT_MANAGEMENT_DESCRIPTION}
          titleAccessory={
            <span
              className={clsx(
                styles.button,
                styles.combatButton,
                styles.combatTitleButton,
                roundTracker.isInCombat && styles.combatButtonActive
              )}
              aria-hidden="true"
            >
              <Swords size={17} aria-hidden="true" />
            </span>
          }
          actions={[
            {
              label: "Start Combat",
              onClick: () => setCombatState(true),
              disabled: roundTracker.isInCombat,
              ariaLabel: "Start combat"
            },
            {
              label: "End Combat",
              onClick: () => setCombatState(false),
              disabled: !roundTracker.isInCombat,
              ariaLabel: "End combat"
            }
          ]}
        />
      ) : null}
    </>
  );
}

export default RoundTrackerWidget;
