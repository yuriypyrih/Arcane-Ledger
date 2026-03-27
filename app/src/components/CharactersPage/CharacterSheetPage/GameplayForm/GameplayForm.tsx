import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import type { Character } from "../../../../types";
import type { PersistCharacterUpdater } from "../../../../pages/CharactersPage/CharacterSheetPage/types";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "./GameplayForm.module.css";
import PoolOfHealingWidget from "./widgets/PoolOfHealingWidget";
import FocusPointsWidget from "./widgets/FocusPointsWidget";
import RoundTrackerWidget from "./widgets/RoundTrackerWidget";
import CampButton from "./widgets/CampButton";
import HitPointsWidget from "./widgets/HitPointsWidget";
import ActionsWidget from "./widgets/ActionsWidget";
import TraitsConditionsWidget from "./widgets/TraitsConditionsWidget";
import DeathSavesWidget from "./widgets/DeathSavesWidget";

type GameplayFormProps = {
  className?: string;
  onPersistCharacter: PersistCharacterUpdater;
};

function GameplayForm({ className, onPersistCharacter }: GameplayFormProps) {
  const { watch } = useFormContext<Character>();
  const character = watch() as Character;

  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={clsx(shared.sectionHeader, styles.gameplaySectionHeader)}>
        <div>
          <p className={shared.eyebrow}>Gameplay</p>
        </div>
        <div className={styles.gameplayHeaderControls}>
          <PoolOfHealingWidget character={character} />
          <FocusPointsWidget character={character} onPersistCharacter={onPersistCharacter} />
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
    </article>
  );
}

export default GameplayForm;
