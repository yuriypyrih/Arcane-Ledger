import { useCallback, useEffect, useRef, useState } from "react";
import type { Character } from "../../../../../types";
import type {
  PersistCharacterUpdater,
  QueueCharacterSave
} from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import DeathSavesWidget from "./DeathSavesWidget";
import HitPointsWidget from "./HitPointsWidget";

type HitPointsClusterProps = {
  character: Character;
  onQueueCharacterSave: QueueCharacterSave;
};

function HitPointsCluster({ character, onQueueCharacterSave }: HitPointsClusterProps) {
  const [optimisticCharacter, setOptimisticCharacter] = useState(character);
  const optimisticCharacterRef = useRef(character);

  useEffect(() => {
    optimisticCharacterRef.current = character;
    setOptimisticCharacter(character);
  }, [character]);

  const persistOptimisticCharacter = useCallback<PersistCharacterUpdater>(
    (updater) => {
      const currentCharacter = optimisticCharacterRef.current;
      const nextCharacter = updater(currentCharacter);

      if (nextCharacter === currentCharacter) {
        return;
      }

      optimisticCharacterRef.current = nextCharacter;
      setOptimisticCharacter(nextCharacter);
      onQueueCharacterSave(nextCharacter);
    },
    [onQueueCharacterSave]
  );

  return (
    <>
      <HitPointsWidget
        character={optimisticCharacter}
        onPersistCharacter={persistOptimisticCharacter}
      />
      <DeathSavesWidget
        character={optimisticCharacter}
        onPersistCharacter={persistOptimisticCharacter}
      />
    </>
  );
}

export default HitPointsCluster;
