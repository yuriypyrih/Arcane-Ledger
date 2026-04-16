import { Flame } from "lucide-react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendBarbarianRageUseForCharacter,
  getBarbarianRageUsesRemainingForCharacter,
  getBarbarianRageUsesTotalForCharacter,
  restoreAllBarbarianRageUsesForCharacter,
  restoreBarbarianRageUseForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import ResourceCountWidget from "./ResourceCountWidget";

type RagePointsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function RagePointsWidget({ character, onPersistCharacter }: RagePointsWidgetProps) {
  const totalRageUses = getBarbarianRageUsesTotalForCharacter(character);
  const remainingRageUses = getBarbarianRageUsesRemainingForCharacter(character);

  if (totalRageUses <= 0) {
    return null;
  }

  return (
    <ResourceCountWidget
      icon={{ kind: "lucide", icon: Flame }}
      pillLabel={`${remainingRageUses}/${totalRageUses} Rage`}
      modalTitle="Rage"
      eyebrow="Barbarian"
      current={remainingRageUses}
      total={totalRageUses}
      onAdd={() =>
        onPersistCharacter((currentCharacter) =>
          restoreBarbarianRageUseForCharacter(currentCharacter)
        )
      }
      onUse={() =>
        onPersistCharacter((currentCharacter) =>
          expendBarbarianRageUseForCharacter(currentCharacter)
        )
      }
      onReset={() =>
        onPersistCharacter((currentCharacter) =>
          restoreAllBarbarianRageUsesForCharacter(currentCharacter)
        )
      }
    />
  );
}

export default RagePointsWidget;
