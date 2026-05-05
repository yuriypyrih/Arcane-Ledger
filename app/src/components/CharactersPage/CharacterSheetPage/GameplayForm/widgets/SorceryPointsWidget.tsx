import { Sparkles } from "lucide-react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendSorceryPointForCharacter,
  getSorceryPointsRemainingForCharacter,
  getSorceryPointsTotalForCharacter,
  restoreAllSorceryPointsForCharacter,
  restoreSorceryPointForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import ResourceCountWidget from "./ResourceCountWidget";
import { classResourcePersistOptions } from "./persistOptions";

type SorceryPointsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function SorceryPointsWidget({ character, onPersistCharacter }: SorceryPointsWidgetProps) {
  const totalSorceryPoints = getSorceryPointsTotalForCharacter(character);
  const remainingSorceryPoints = getSorceryPointsRemainingForCharacter(character);

  if (totalSorceryPoints <= 0) {
    return null;
  }

  return (
    <ResourceCountWidget
      icon={{ kind: "lucide", icon: Sparkles }}
      pillLabel={`${remainingSorceryPoints}/${totalSorceryPoints} Sorcery Points`}
      modalTitle="Sorcery Points"
      current={remainingSorceryPoints}
      total={totalSorceryPoints}
      onAdd={() =>
        onPersistCharacter(
          (currentCharacter) => restoreSorceryPointForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onUse={() =>
        onPersistCharacter(
          (currentCharacter) => expendSorceryPointForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onReset={() =>
        onPersistCharacter(
          (currentCharacter) => restoreAllSorceryPointsForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
    />
  );
}

export default SorceryPointsWidget;
