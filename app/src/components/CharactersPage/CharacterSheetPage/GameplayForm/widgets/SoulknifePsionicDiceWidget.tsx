import { Hexagon } from "lucide-react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendRogueSoulknifePsionicDieForCharacter,
  getRogueSoulknifePsionicDiceRemainingForCharacter,
  getRogueSoulknifePsionicDiceTotalForCharacter,
  getRogueSoulknifePsionicDieForCharacter,
  restoreAllRogueSoulknifePsionicDiceForCharacter,
  restoreRogueSoulknifePsionicDieForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import ResourceCountWidget from "./ResourceCountWidget";
import { classResourcePersistOptions } from "./persistOptions";

type SoulknifePsionicDiceWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function SoulknifePsionicDiceWidget({
  character,
  onPersistCharacter
}: SoulknifePsionicDiceWidgetProps) {
  const totalDice = getRogueSoulknifePsionicDiceTotalForCharacter(character);
  const remainingDice = getRogueSoulknifePsionicDiceRemainingForCharacter(character);
  const psionicDie = getRogueSoulknifePsionicDieForCharacter(character);

  if (totalDice <= 0 || !psionicDie) {
    return null;
  }

  return (
    <ResourceCountWidget
      icon={{ kind: "lucide", icon: Hexagon }}
      pillLabel={`${remainingDice}/${totalDice} Psionic Dice`}
      modalTitle="Psionic Dice"
      current={remainingDice}
      total={totalDice}
      titleSuffix={psionicDie.toUpperCase()}
      onAdd={() =>
        onPersistCharacter(
          (currentCharacter) => restoreRogueSoulknifePsionicDieForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onUse={() =>
        onPersistCharacter(
          (currentCharacter) => expendRogueSoulknifePsionicDieForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onReset={() =>
        onPersistCharacter(
          (currentCharacter) => restoreAllRogueSoulknifePsionicDiceForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
    />
  );
}

export default SoulknifePsionicDiceWidget;
