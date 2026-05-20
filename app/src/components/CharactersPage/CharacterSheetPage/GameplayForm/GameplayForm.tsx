import clsx from "clsx";
import { CircleHelp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import HitPointsCluster from "./widgets/HitPointsCluster";
import type { QueueCharacterSave } from "../../../../pages/CharactersPage/CharacterSheetPage/types";

type GameplayFormProps = {
  character: Character;
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
  onQueueHitPointCharacter: QueueCharacterSave;
  onRequestCreateCompanion?: () => void;
};

function GameplayForm({
  character,
  className,
  onPersistCharacter,
  onQueueHitPointCharacter,
  onRequestCreateCompanion
}: GameplayFormProps) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isRoundStartFlashActive, setIsRoundStartFlashActive] = useState(false);
  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const previousTurnStartedRef = useRef(roundTracker.turnStarted);
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
        <div className={shared.eyebrowHelpRow}>
          <span className={clsx(shared.eyebrow, shared.eyebrowInHelpRow)}>Gameplay</span>
          <button
            type="button"
            className={shared.helpButton}
            onClick={() => setIsGuideOpen(true)}
            aria-label="Open gameplay guide"
            title="Open gameplay guide"
          >
            <CircleHelp size={16} />
          </button>
        </div>
        <div className={styles.gameplayHeaderControls}>
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
      </div>

      <div className={styles.dashboardGrid}>
        <CharacterSheetSectionProfiler id="gameplay-hit-points">
          <HitPointsCluster character={character} onQueueCharacterSave={onQueueHitPointCharacter} />
        </CharacterSheetSectionProfiler>

        <CharacterSheetSectionProfiler id="gameplay-actions">
          <ActionsWidget character={character} onPersistCharacter={onPersistCharacter} />
        </CharacterSheetSectionProfiler>

        <CharacterSheetSectionProfiler id="gameplay-traits-conditions">
          <TraitsConditionsWidget
            character={character}
            onPersistCharacter={onPersistCharacter}
            onRequestCreateCompanion={onRequestCreateCompanion}
          />
        </CharacterSheetSectionProfiler>
      </div>

      {isGuideOpen ? <GameplayGuideModal onClose={() => setIsGuideOpen(false)} /> : null}
    </article>
  );
}

export default GameplayForm;
