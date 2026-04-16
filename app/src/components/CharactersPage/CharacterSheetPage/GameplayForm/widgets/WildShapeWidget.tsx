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
      eyebrow="Druid"
      current={remainingUses}
      total={totalUses}
      onAdd={() =>
        onPersistCharacter((currentCharacter) =>
          restoreDruidWildShapeUseForCharacter(currentCharacter)
        )
      }
      onUse={() =>
        onPersistCharacter((currentCharacter) =>
          expendDruidWildShapeUseForCharacter(currentCharacter)
        )
      }
      onReset={() =>
        onPersistCharacter((currentCharacter) =>
          restoreAllDruidWildShapeUsesForCharacter(currentCharacter)
        )
      }
    />
  );
}

export default WildShapeWidget;
