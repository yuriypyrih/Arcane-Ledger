import { useState } from "react";
import clsx from "clsx";
import { Swords } from "lucide-react";
import ResourceManagementModal from "../../ResourceManagementModal";
import type { Character, CharacterStatusEntry } from "../../../../../types";
import { STATUS_DURATION_ROUND_TICK, STATUS_ENTRY_SOURCE_TYPE } from "../../../../../types";
import type {
  PersistCharacterOptions,
  PersistCharacterUpdater
} from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  finishRoundTrackerTurn,
  normalizeRoundTracker,
  setRoundTrackerCombatState,
  setRoundTrackerResourceAvailability,
  type RoundTrackerResource
} from "../../../../../pages/CharactersPage/combat";
import { showToast, useAppDispatch } from "../../../../../store";
import {
  clearRoundScopedFeatureStateForCharacter,
  removeFeatureStatusEntryForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import {
  advanceCharacterStatusEntries,
  normalizeCharacterStatusEntries
} from "../../../../../pages/CharactersPage/statusEntries";
import { advanceCharacterCompanionDurations } from "../../../../../pages/CharactersPage/companions";
import RoundTrackerControl from "./RoundTrackerControl";
import { consumeRoundTrackerResourceForCharacter, startCharacterTurn } from "../gameplayStateUtils";
import styles from "./RoundTrackerControl.module.css";

const COMBAT_MANAGEMENT_DESCRIPTION =
  "Here you can manually control the combat state. Some effects and conditions change their behavior based on whether you are in combat or not. When you roll initiative, combat always starts automatically.";

type RoundTrackerWidgetProps = {
  character: Character;
  onAfterRoundChange?: (action: "start" | "end") => Promise<void> | void;
  onPersistCharacter: PersistCharacterUpdater;
};

const partyRoundPersistOptions: PersistCharacterOptions = {
  domains: ["resources", "features", "statuses", "spells"],
  normalize: "targeted",
  flush: true
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

function RoundTrackerWidget({
  character,
  onAfterRoundChange,
  onPersistCharacter
}: RoundTrackerWidgetProps) {
  const dispatch = useAppDispatch();
  const [isCombatManagementOpen, setIsCombatManagementOpen] = useState(false);
  const roundTracker = normalizeRoundTracker(character.roundTracker);

  function startTurn() {
    onPersistCharacter(
      (currentCharacter) => startCharacterTurn(currentCharacter),
      onAfterRoundChange ? partyRoundPersistOptions : undefined
    );
    void onAfterRoundChange?.("start");
    dispatch(
      showToast({
        text: "Your Turn Started.",
        type: "info",
        position: "bottom-middle",
        effect: "default",
        dismissMs: 4_000
      })
    );
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
    onPersistCharacter(
      (currentCharacter) => {
        const nextCharacter = advanceTimedStatuses(
          currentCharacter,
          STATUS_DURATION_ROUND_TICK.ROUND_END
        );

        return {
          ...nextCharacter,
          roundTracker: finishRoundTrackerTurn(nextCharacter.roundTracker)
        };
      },
      onAfterRoundChange ? partyRoundPersistOptions : undefined
    );
    void onAfterRoundChange?.("end");
    dispatch(
      showToast({
        text: "Your Turn Ended.",
        type: "info",
        position: "bottom-middle",
        dismissMs: 4_000
      })
    );
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

  function showRoundTrackerToggleEffect() {
    dispatch(
      showToast({
        type: "success",
        effect: "default"
      })
    );
  }

  function isResourceAvailable(resource: RoundTrackerResource): boolean {
    switch (resource) {
      case "bonusAction":
        return roundTracker.bonusActionAvailable;
      case "reaction":
        return roundTracker.reactionAvailable;
      case "action":
      default:
        return roundTracker.actionAvailable;
    }
  }

  function toggleRoundTrackerResource(resource: RoundTrackerResource) {
    if (!roundTracker.isInCombat) {
      return;
    }

    if (isResourceAvailable(resource)) {
      consumeResource(resource);
      showRoundTrackerToggleEffect();
      return;
    }

    resetResource(resource);
    showRoundTrackerToggleEffect();
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
        onToggleResource={toggleRoundTrackerResource}
        onSelectCombat={() => setIsCombatManagementOpen(true)}
        onStartTurn={startTurn}
        onFinishRound={finishRound}
      />

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
