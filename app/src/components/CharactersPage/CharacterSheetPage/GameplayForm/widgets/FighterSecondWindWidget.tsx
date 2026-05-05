import { Wind } from "lucide-react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  consumeFighterSecondWindUseForCharacter,
  getFighterSecondWindUsesRemainingForCharacter,
  getFighterSecondWindUsesTotalForCharacter,
  restoreFighterSecondWindOnLongRestForCharacter,
  restoreFighterSecondWindOnShortRestForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import ResourceCountWidget from "./ResourceCountWidget";
import { classResourcePersistOptions } from "./persistOptions";

type FighterSecondWindWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function FighterSecondWindWidget({
  character,
  onPersistCharacter
}: FighterSecondWindWidgetProps) {
  const totalUses = getFighterSecondWindUsesTotalForCharacter(character);
  const remainingUses = getFighterSecondWindUsesRemainingForCharacter(character);

  if (totalUses <= 0) {
    return null;
  }

  return (
    <ResourceCountWidget
      icon={{ kind: "lucide", icon: Wind }}
      pillLabel={`${remainingUses}/${totalUses} Second Wind`}
      modalTitle="Second Wind"
      current={remainingUses}
      total={totalUses}
      onAdd={() =>
        onPersistCharacter(
          (currentCharacter) => restoreFighterSecondWindOnShortRestForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onUse={() =>
        onPersistCharacter(
          (currentCharacter) => consumeFighterSecondWindUseForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onReset={() =>
        onPersistCharacter(
          (currentCharacter) => restoreFighterSecondWindOnLongRestForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
    />
  );
}

export default FighterSecondWindWidget;
