import clsx from "clsx";
import { CircleHelp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Character } from "../../../../types";
import { getRestDescriptionInjectionsForCharacter } from "../../../../pages/CharactersPage/classFeatures/restDescriptionInjections";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import { FEATS } from "../../../../codex/entries";
import { normalizeRoundTracker } from "../../../../pages/CharactersPage/combat";
import { createSourcedDescriptionEntries } from "../../../../pages/CharactersPage/actionModalDescriptions";
import { crafterFastCraftingRuleText } from "../../../../pages/CharactersPage/crafterFeat";
import { normalizeCharacterFeats } from "../../../../pages/CharactersPage/feats";
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
import HitPointsCluster from "./widgets/HitPointsCluster";
import type { QueueCharacterSave } from "../../../../pages/CharactersPage/CharacterSheetPage/types";

type GameplayFormProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
  onQueueHitPointCharacter: QueueCharacterSave;
};

function GameplayForm({
  character,
  className,
  onPersistCharacter,
  onQueueHitPointCharacter
}: GameplayFormProps) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isRoundStartFlashActive, setIsRoundStartFlashActive] = useState(false);
  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const previousTurnStartedRef = useRef(roundTracker.turnStarted);
  const restDescriptionInjections = useMemo(
    () => getRestDescriptionInjectionsForCharacter(character),
    [character]
  );
  const longRestDescriptionInjections = useMemo(() => {
    const additions = [...restDescriptionInjections.longRest];
    const hasCrafterFeat = normalizeCharacterFeats(character.feats, character.level).some(
      (entry) => entry.feat === FEATS.CRAFTER
    );

    if (hasCrafterFeat) {
      additions.push(
        createSourcedDescriptionEntries("Crafter: Fast Crafting", [crafterFastCraftingRuleText])
      );
    }

    return additions;
  }, [character.feats, character.level, restDescriptionInjections.longRest]);

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
          <HeroicInspirationWidget character={character} onPersistCharacter={onPersistCharacter} />
          <RagePointsWidget character={character} onPersistCharacter={onPersistCharacter} />
          <FocusPointsWidget character={character} onPersistCharacter={onPersistCharacter} />
          <FighterSecondWindWidget character={character} onPersistCharacter={onPersistCharacter} />
          <PsiEnergyDiceWidget character={character} onPersistCharacter={onPersistCharacter} />
          <SoulknifePsionicDiceWidget
            character={character}
            onPersistCharacter={onPersistCharacter}
          />
          <SuperiorityDiceWidget character={character} onPersistCharacter={onPersistCharacter} />
          <WildShapeWidget character={character} onPersistCharacter={onPersistCharacter} />
          <BardicInspirationWidget character={character} onPersistCharacter={onPersistCharacter} />
          <SorceryPointsWidget character={character} onPersistCharacter={onPersistCharacter} />
          <DivinityPointsWidget character={character} onPersistCharacter={onPersistCharacter} />
          <RoundTrackerWidget character={character} onPersistCharacter={onPersistCharacter} />
          <CampButton
            character={character}
            onPersistCharacter={onPersistCharacter}
            shortRestAdditionalDescription={restDescriptionInjections.shortRest}
            longRestAdditionalDescription={longRestDescriptionInjections}
          />
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <HitPointsCluster character={character} onQueueCharacterSave={onQueueHitPointCharacter} />

        <ActionsWidget character={character} onPersistCharacter={onPersistCharacter} />

        <TraitsConditionsWidget character={character} onPersistCharacter={onPersistCharacter} />
      </div>

      {isGuideOpen ? <GameplayGuideModal onClose={() => setIsGuideOpen(false)} /> : null}
    </article>
  );
}

export default GameplayForm;
