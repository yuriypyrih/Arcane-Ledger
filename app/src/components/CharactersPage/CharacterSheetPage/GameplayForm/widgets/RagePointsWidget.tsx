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
import { classResourcePersistOptions } from "./persistOptions";

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
      current={remainingRageUses}
      total={totalRageUses}
      onAdd={() =>
        onPersistCharacter(
          (currentCharacter) => restoreBarbarianRageUseForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onUse={() =>
        onPersistCharacter(
          (currentCharacter) => expendBarbarianRageUseForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onReset={() =>
        onPersistCharacter(
          (currentCharacter) => restoreAllBarbarianRageUsesForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
    />
  );
}

export default RagePointsWidget;
