import { PawPrint } from "lucide-react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendDruidWildShapeUseForCharacter,
  getDruidWildShapeUsesRemainingForCharacter,
  getDruidWildShapeUsesTotalForCharacter,
  restoreAllDruidWildShapeUsesForCharacter,
  restoreDruidWildShapeUseForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import ResourceCountWidget from "./ResourceCountWidget";
import { classResourcePersistOptions } from "./persistOptions";

type WildShapeWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function WildShapeWidget({ character, onPersistCharacter }: WildShapeWidgetProps) {
  const totalUses = getDruidWildShapeUsesTotalForCharacter(character);
  const remainingUses = getDruidWildShapeUsesRemainingForCharacter(character);

  if (totalUses <= 0) {
    return null;
  }

  return (
    <ResourceCountWidget
      icon={{ kind: "lucide", icon: PawPrint }}
      pillLabel={`${remainingUses}/${totalUses} Wild Shape`}
      modalTitle="Wild Shape"
      current={remainingUses}
      total={totalUses}
      onAdd={() =>
        onPersistCharacter(
          (currentCharacter) => restoreDruidWildShapeUseForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onUse={() =>
        onPersistCharacter(
          (currentCharacter) => expendDruidWildShapeUseForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onReset={() =>
        onPersistCharacter(
          (currentCharacter) => restoreAllDruidWildShapeUsesForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
    />
  );
}

export default WildShapeWidget;
