import clsx from "clsx";
import { ArrowLeft, CircleCheck, CircleHelp, RefreshCw, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PartyMembershipRecord } from "../../../../api/partyGroups";
import { requestImmediateCharacterSync } from "../../../../characterSync/characterSyncRequests";
import { useAppSelector } from "../../../../store";
import type { Character } from "../../../../types";
import { getRestDescriptionInjectionsForCharacter } from "../../../../pages/CharactersPage/classFeatures/restDescriptionInjections";
import { getHumanResourcefulDescriptionEntriesForCharacter } from "../../../../pages/CharactersPage/species";
import { CharacterSheetSectionProfiler } from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetSectionProfiler";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { normalizeRoundTracker } from "../../../../pages/CharactersPage/combat";
import { createSourcedDescriptionEntries } from "../../../../pages/CharactersPage/actionModalDescriptions";
import { crafterFastCraftingRuleText } from "../../../../pages/CharactersPage/feats/crafter";
import {
  characterHasCrafterDiscount,
  getChefLongRestDescriptionAdditionsForCharacter,
  getChefShortRestDescriptionAdditionsForCharacter,
  getInspiringLeaderRestDescriptionAdditionsForCharacter,
  getMusicianEncouragingSongDescriptionEntriesForCharacter,
  getWeaponMasterLongRestDescriptionAdditionsForCharacter
} from "../../../../pages/CharactersPage/feats/runtime";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./GameplayForm.module.css";
import BardicInspirationWidget from "./widgets/BardicInspirationWidget";
import DivinityPointsWidget from "./widgets/DivinityPointsWidget";
import HeroicInspirationWidget from "./widgets/HeroicInspirationWidget";
import FocusPointsWidget from "./widgets/FocusPointsWidget";
import FighterSecondWindWidget from "./widgets/FighterSecondWindWidget";
import PsiEnergyDiceWidget from "./widgets/PsiEnergyDiceWidget";
import RagePointsWidget from "./widgets/RagePointsWidget";
import SoulknifePsionicDiceWidget from "./widgets/SoulknifePsionicDiceWidget";
import SorceryPointsWidget from "./widgets/SorceryPointsWidget";
import SuperiorityDiceWidget from "./widgets/SuperiorityDiceWidget";
import WildShapeWidget from "./widgets/WildShapeWidget";
import RoundTrackerWidget from "./widgets/RoundTrackerWidget";
import CampButton from "./widgets/CampButton";
import ActionsWidget from "./widgets/ActionsWidget";
import TraitsConditionsWidget from "./widgets/TraitsConditionsWidget";
import GameplayGuideModal from "./GameplayGuideModal";
import EncounterTrackerGuideModal from "./EncounterTrackerGuideModal";
import HitPointsCluster from "./widgets/HitPointsCluster";
import type { QueueCharacterSave } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import CharacterPartyGroupModal from "../../CharacterList/CharacterPartyGroupModal";
import characterRowStyles from "../../CharacterRow/CharacterRow.module.css";
import GameplayPartyPanel from "./GameplayPartyPanel";
import { createCharacterRosterEntryForPartyModal } from "./partyCharacterRoster";
import ActionButton from "../../../ActionButton";
import useGameplayPartyEncounter from "./useGameplayPartyEncounter";

type GameplayFormProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
  onQueueHitPointCharacter: QueueCharacterSave;
  partyMembership?: PartyMembershipRecord;
};

function GameplayForm({
  character,
  className,
  onPersistCharacter,
  onQueueHitPointCharacter,
  partyMembership
}: GameplayFormProps) {
  const [openGuideMode, setOpenGuideMode] = useState<"gameplay" | "encounter" | null>(null);
  const [isPartyMode, setIsPartyMode] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [isRoundStartFlashActive, setIsRoundStartFlashActive] = useState(false);
  const isActiveCharacterPendingSave = useAppSelector(
    (state) =>
      state.activeCharacterSheet.characterId === character.id && state.activeCharacterSheet.dirty
  );
  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const previousTurnStartedRef = useRef(roundTracker.turnStarted);
  const characterSyncStatus = character.storageMetadata?.sync?.syncStatus;
  const syncBeforePartyEncounterRefresh = useCallback(async () => {
    if (
      isActiveCharacterPendingSave ||
      characterSyncStatus === "dirty" ||
      characterSyncStatus === "syncing"
    ) {
      await requestImmediateCharacterSync();
    }
  }, [characterSyncStatus, isActiveCharacterPendingSave]);
  const partyEncounter = useGameplayPartyEncounter({
    beforeRefresh: syncBeforePartyEncounterRefresh,
    isActive: isPartyMode,
    membership: partyMembership
  });
  const isPartyRefreshComplete = partyEncounter.isRefreshCoolingDown;
  const isPartyRefreshBusy = partyEncounter.isRefreshLoading;
  const partyRefreshIcon = isPartyRefreshComplete ? (
    <CircleCheck size={16} aria-hidden="true" />
  ) : (
    <RefreshCw size={16} aria-hidden="true" />
  );
  const partyRefreshLabel = isPartyRefreshBusy
    ? "Refreshing encounter"
    : partyEncounter.refreshLabel;
  const partyModalCharacter = useMemo(
    () => createCharacterRosterEntryForPartyModal(character),
    [character]
  );
  const restDescriptionInjections = useMemo(
    () => getRestDescriptionInjectionsForCharacter(character),
    [character]
  );
  const musicianEncouragingSongDescription = useMemo(
    () => getMusicianEncouragingSongDescriptionEntriesForCharacter(character),
    [character]
  );
  const chefShortRestDescriptionInjections = useMemo(
    () => getChefShortRestDescriptionAdditionsForCharacter(character),
    [character]
  );
  const chefLongRestDescriptionInjections = useMemo(
    () => getChefLongRestDescriptionAdditionsForCharacter(character),
    [character]
  );
  const inspiringLeaderRestDescriptionInjections = useMemo(
    () => getInspiringLeaderRestDescriptionAdditionsForCharacter(character),
    [character]
  );
  const weaponMasterLongRestDescriptionInjections = useMemo(
    () => getWeaponMasterLongRestDescriptionAdditionsForCharacter(character),
    [character]
  );
  const humanResourcefulLongRestDescription = useMemo(
    () => getHumanResourcefulDescriptionEntriesForCharacter(character),
    [character]
  );
  const shortRestDescriptionInjections = useMemo(() => {
    const additions = [
      ...restDescriptionInjections.shortRest,
      ...chefShortRestDescriptionInjections,
      ...inspiringLeaderRestDescriptionInjections
    ];

    if (musicianEncouragingSongDescription.length > 0) {
      additions.push(
        createSourcedDescriptionEntries(
          "Musician: Encouraging Song",
          musicianEncouragingSongDescription
        )
      );
    }

    return additions;
  }, [
    chefShortRestDescriptionInjections,
    inspiringLeaderRestDescriptionInjections,
    musicianEncouragingSongDescription,
    restDescriptionInjections.shortRest
  ]);
  const longRestDescriptionInjections = useMemo(() => {
    const additions = [
      ...restDescriptionInjections.longRest,
      ...chefLongRestDescriptionInjections,
      ...inspiringLeaderRestDescriptionInjections,
      ...weaponMasterLongRestDescriptionInjections
    ];
    const hasCrafterFeat = characterHasCrafterDiscount({
      feats: character.feats,
      level: character.level
    });

    if (musicianEncouragingSongDescription.length > 0) {
      additions.push(
        createSourcedDescriptionEntries(
          "Musician: Encouraging Song",
          musicianEncouragingSongDescription
        )
      );
    }

    if (hasCrafterFeat) {
      additions.push(
        createSourcedDescriptionEntries("Crafter: Fast Crafting", [crafterFastCraftingRuleText])
      );
    }

    if (humanResourcefulLongRestDescription.length > 0) {
      additions.push(humanResourcefulLongRestDescription);
    }

    return additions;
  }, [
    chefLongRestDescriptionInjections,
    character.feats,
    character.level,
    humanResourcefulLongRestDescription,
    inspiringLeaderRestDescriptionInjections,
    musicianEncouragingSongDescription,
    restDescriptionInjections.longRest,
    weaponMasterLongRestDescriptionInjections
  ]);

  useEffect(() => {
    if (partyMembership) {
      return;
    }

    setIsPartyMode(false);
    setIsPartyModalOpen(false);
    setOpenGuideMode(null);
  }, [partyMembership]);

  useEffect(() => {
    const wasTurnStarted = previousTurnStartedRef.current;
    previousTurnStartedRef.current = roundTracker.turnStarted;

    if (!roundTracker.turnStarted) {
      setIsRoundStartFlashActive(false);
      return;
    }

    if (wasTurnStarted) {
      return;
    }

    setIsRoundStartFlashActive(true);

    const timeoutId = window.setTimeout(() => {
      setIsRoundStartFlashActive(false);
    }, 1180);

    return () => window.clearTimeout(timeoutId);
  }, [roundTracker.turnStarted]);

  return (
    <article
      className={clsx(
        shared.sectionCard,
        styles.gameplayCard,
        roundTracker.turnStarted && styles.gameplayCardActive,
        isRoundStartFlashActive && styles.gameplayCardFlash,
        className
      )}
    >
      <div className={clsx(shared.sectionHeader, styles.gameplaySectionHeader)}>
        <div className={styles.gameplayHeaderIdentity}>
          <div className={shared.eyebrowHelpRow}>
            <span className={clsx(shared.eyebrow, shared.eyebrowInHelpRow)}>
              {isPartyMode ? "Encounter Tracker" : "Gameplay"}
            </span>
            <button
              type="button"
              className={shared.helpButton}
              onClick={() => setOpenGuideMode(isPartyMode ? "encounter" : "gameplay")}
              aria-label={isPartyMode ? "Open encounter tracker guide" : "Open gameplay guide"}
              title={isPartyMode ? "Open encounter tracker guide" : "Open gameplay guide"}
            >
              <CircleHelp size={16} />
            </button>
          </div>
          {partyMembership ? (
            <button
              type="button"
              className={clsx(shared.editButton, styles.partyModeButton)}
              onClick={() => setIsPartyMode((currentMode) => !currentMode)}
              aria-label={isPartyMode ? "Return to gameplay" : "View party initiative"}
              title={isPartyMode ? "Return to gameplay" : "View party initiative"}
            >
              {isPartyMode ? (
                <ArrowLeft size={16} aria-hidden="true" />
              ) : (
                <Users size={16} aria-hidden="true" />
              )}
              <span>{isPartyMode ? "Back" : "Party"}</span>
            </button>
          ) : null}
        </div>
        <div
          className={clsx(
            styles.gameplayHeaderControls,
            isPartyMode && styles.gameplayRegionHidden
          )}
          aria-hidden={isPartyMode}
        >
          <CharacterSheetSectionProfiler id="gameplay-header-heroic-inspiration">
            <HeroicInspirationWidget
              character={character}
              onPersistCharacter={onPersistCharacter}
            />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="gameplay-rage">
            <RagePointsWidget character={character} onPersistCharacter={onPersistCharacter} />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="gameplay-focus">
            <FocusPointsWidget character={character} onPersistCharacter={onPersistCharacter} />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="gameplay-fighter-second-wind">
            <FighterSecondWindWidget
              character={character}
              onPersistCharacter={onPersistCharacter}
            />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="gameplay-psi-energy">
            <PsiEnergyDiceWidget character={character} onPersistCharacter={onPersistCharacter} />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="gameplay-soulknife-psionic-dice">
            <SoulknifePsionicDiceWidget
              character={character}
              onPersistCharacter={onPersistCharacter}
            />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="gameplay-superiority-dice">
            <SuperiorityDiceWidget character={character} onPersistCharacter={onPersistCharacter} />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="gameplay-wild-shape">
            <WildShapeWidget character={character} onPersistCharacter={onPersistCharacter} />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="gameplay-bardic-inspiration">
            <BardicInspirationWidget
              character={character}
              onPersistCharacter={onPersistCharacter}
            />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="gameplay-sorcery">
            <SorceryPointsWidget character={character} onPersistCharacter={onPersistCharacter} />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="gameplay-divinity">
            <DivinityPointsWidget character={character} onPersistCharacter={onPersistCharacter} />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="gameplay-round-tracker">
            <RoundTrackerWidget character={character} onPersistCharacter={onPersistCharacter} />
          </CharacterSheetSectionProfiler>
          <CharacterSheetSectionProfiler id="gameplay-camp">
            <CampButton
              character={character}
              onPersistCharacter={onPersistCharacter}
              shortRestAdditionalDescription={shortRestDescriptionInjections}
              longRestAdditionalDescription={longRestDescriptionInjections}
            />
          </CharacterSheetSectionProfiler>
        </div>
        {partyMembership ? (
          <div
            className={clsx(
              styles.gameplayHeaderControls,
              styles.partyHeaderControls,
              !isPartyMode && styles.gameplayRegionHidden
            )}
            aria-hidden={!isPartyMode}
          >
            <button
              type="button"
              className={characterRowStyles.partyPill}
              aria-label={`View ${partyMembership.partyGroupName} party`}
              title={`View ${partyMembership.partyGroupName} party`}
              onClick={() => setIsPartyModalOpen(true)}
            >
              <span className={characterRowStyles.partyPillText}>
                In Party: {partyMembership.partyGroupName}
              </span>
            </button>
            <ActionButton
              actionType={isPartyRefreshComplete ? "SUCCESS" : "INFO"}
              variant="FILL"
              fullWidth={false}
              iconOnly
              icon={partyRefreshIcon}
              className={clsx(
                styles.partyRefreshButton,
                isPartyRefreshBusy && styles.partyRefreshButtonBusy
              )}
              disabled={partyEncounter.isRefreshDisabled}
              aria-label={partyRefreshLabel}
              title={partyRefreshLabel}
              onClick={partyEncounter.refreshEncounter}
            />
          </div>
        ) : null}
      </div>

      <div
        className={clsx(styles.dashboardGrid, isPartyMode && styles.gameplayRegionHidden)}
        aria-hidden={isPartyMode}
      >
        <CharacterSheetSectionProfiler id="gameplay-hit-points">
          <HitPointsCluster character={character} onQueueCharacterSave={onQueueHitPointCharacter} />
        </CharacterSheetSectionProfiler>

        <CharacterSheetSectionProfiler id="gameplay-actions">
          <ActionsWidget character={character} onPersistCharacter={onPersistCharacter} />
        </CharacterSheetSectionProfiler>

        <CharacterSheetSectionProfiler id="gameplay-traits-conditions">
          <TraitsConditionsWidget character={character} onPersistCharacter={onPersistCharacter} />
        </CharacterSheetSectionProfiler>
      </div>

      {partyMembership ? (
        <div
          className={clsx(styles.partyPanel, !isPartyMode && styles.gameplayRegionHidden)}
          aria-hidden={!isPartyMode}
        >
          <GameplayPartyPanel
            error={partyEncounter.error}
            inspectedParticipant={partyEncounter.inspectedParticipant}
            isInitialLoading={partyEncounter.isInitialLoading}
            onCloseInspection={() => partyEncounter.setInspectedParticipant(null)}
            onInspectParticipant={partyEncounter.setInspectedParticipant}
            tracker={partyEncounter.tracker}
          />
        </div>
      ) : null}

      {openGuideMode === "gameplay" ? (
        <GameplayGuideModal onClose={() => setOpenGuideMode(null)} />
      ) : null}
      {openGuideMode === "encounter" ? (
        <EncounterTrackerGuideModal onClose={() => setOpenGuideMode(null)} />
      ) : null}
      {isPartyModalOpen && partyMembership ? (
        <CharacterPartyGroupModal
          character={partyModalCharacter}
          membership={partyMembership}
          onClose={() => setIsPartyModalOpen(false)}
        />
      ) : null}
    </article>
  );
}

export default GameplayForm;
