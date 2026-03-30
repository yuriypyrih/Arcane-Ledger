import clsx from "clsx";
import { CircleHelp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Character } from "../../../../types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { normalizeRoundTracker } from "../../../../pages/CharactersPage/combat";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./GameplayForm.module.css";
import PoolOfHealingWidget from "./widgets/PoolOfHealingWidget";
import FocusPointsWidget from "./widgets/FocusPointsWidget";
import SorceryPointsWidget from "./widgets/SorceryPointsWidget";
import RoundTrackerWidget from "./widgets/RoundTrackerWidget";
import CampButton from "./widgets/CampButton";
import HitPointsWidget from "./widgets/HitPointsWidget";
import ActionsWidget from "./widgets/ActionsWidget";
import TraitsConditionsWidget from "./widgets/TraitsConditionsWidget";
import DeathSavesWidget from "./widgets/DeathSavesWidget";
import GameplayGuideModal from "./GameplayGuideModal";

type GameplayFormProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

function GameplayForm({ character, className, onPersistCharacter }: GameplayFormProps) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isRoundStartFlashActive, setIsRoundStartFlashActive] = useState(false);
  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const previousTurnStartedRef = useRef(roundTracker.turnStarted);

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
        <div className={styles.gameplayHeading}>
          <span className={clsx(shared.eyebrow, styles.gameplayEyebrow)}>Gameplay</span>
          <button
            type="button"
            className={styles.helpButton}
            onClick={() => setIsGuideOpen(true)}
            aria-label="Open gameplay guide"
            title="Open gameplay guide"
          >
            <CircleHelp size={16} />
          </button>
        </div>
        <div className={styles.gameplayHeaderControls}>
          <PoolOfHealingWidget character={character} />
          <FocusPointsWidget character={character} onPersistCharacter={onPersistCharacter} />
          <SorceryPointsWidget character={character} onPersistCharacter={onPersistCharacter} />
          <RoundTrackerWidget character={character} onPersistCharacter={onPersistCharacter} />
          <CampButton character={character} onPersistCharacter={onPersistCharacter} />
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <HitPointsWidget character={character} onPersistCharacter={onPersistCharacter} />

        <ActionsWidget character={character} onPersistCharacter={onPersistCharacter} />

        <TraitsConditionsWidget character={character} onPersistCharacter={onPersistCharacter} />

        <DeathSavesWidget character={character} onPersistCharacter={onPersistCharacter} />
      </div>

      {isGuideOpen ? <GameplayGuideModal onClose={() => setIsGuideOpen(false)} /> : null}
    </article>
  );
}

export default GameplayForm;
