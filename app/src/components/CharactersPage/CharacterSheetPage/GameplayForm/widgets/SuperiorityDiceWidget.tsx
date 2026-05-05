import { Pentagon } from "lucide-react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendFighterBattleMasterSuperiorityDieForCharacter,
  getFighterBattleMasterSuperiorityDiceRemainingForCharacter,
  getFighterBattleMasterSuperiorityDiceTotalForCharacter,
  getFighterBattleMasterSuperiorityDieForCharacter,
  restoreAllFighterBattleMasterSuperiorityDiceForCharacter,
  restoreFighterBattleMasterSuperiorityDieForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import ResourceCountWidget from "./ResourceCountWidget";
import { classResourcePersistOptions } from "./persistOptions";

type SuperiorityDiceWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function SuperiorityDiceWidget({ character, onPersistCharacter }: SuperiorityDiceWidgetProps) {
  const totalDice = getFighterBattleMasterSuperiorityDiceTotalForCharacter(character);
  const remainingDice = getFighterBattleMasterSuperiorityDiceRemainingForCharacter(character);
  const superiorityDie = getFighterBattleMasterSuperiorityDieForCharacter(character);

  if (totalDice <= 0 || !superiorityDie) {
    return null;
  }

  return (
    <ResourceCountWidget
      icon={{ kind: "lucide", icon: Pentagon }}
      pillLabel={`${remainingDice}/${totalDice} Superiority Dice`}
      modalTitle="Superiority Dice"
      current={remainingDice}
      total={totalDice}
      titleSuffix={superiorityDie.toUpperCase()}
      onAdd={() =>
        onPersistCharacter(
          (currentCharacter) =>
            restoreFighterBattleMasterSuperiorityDieForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onUse={() =>
        onPersistCharacter(
          (currentCharacter) =>
            expendFighterBattleMasterSuperiorityDieForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onReset={() =>
        onPersistCharacter(
          (currentCharacter) =>
            restoreAllFighterBattleMasterSuperiorityDiceForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
    />
  );
}

export default SuperiorityDiceWidget;
