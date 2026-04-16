import { Brain } from "lucide-react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendMonkFocusPointForCharacter,
  getMonkFocusPointsRemainingForCharacter,
  getMonkFocusPointsTotalForCharacter,
  restoreAllMonkFocusPointsForCharacter,
  restoreMonkFocusPointForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import ResourceCountWidget from "./ResourceCountWidget";

type FocusPointsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function FocusPointsWidget({ character, onPersistCharacter }: FocusPointsWidgetProps) {
  const totalFocusPoints = getMonkFocusPointsTotalForCharacter(character);
  const remainingFocusPoints = getMonkFocusPointsRemainingForCharacter(character);

  if (totalFocusPoints <= 0) {
    return null;
  }

  return (
    <ResourceCountWidget
      icon={{ kind: "lucide", icon: Brain }}
      pillLabel={`${remainingFocusPoints}/${totalFocusPoints} Focus Points`}
      modalTitle="Focus Points"
      eyebrow="Monk"
      current={remainingFocusPoints}
      total={totalFocusPoints}
      onAdd={() =>
        onPersistCharacter((currentCharacter) =>
          restoreMonkFocusPointForCharacter(currentCharacter)
        )
      }
      onUse={() =>
        onPersistCharacter((currentCharacter) => expendMonkFocusPointForCharacter(currentCharacter))
      }
      onReset={() =>
        onPersistCharacter((currentCharacter) =>
          restoreAllMonkFocusPointsForCharacter(currentCharacter)
        )
      }
    />
  );
}

export default FocusPointsWidget;
