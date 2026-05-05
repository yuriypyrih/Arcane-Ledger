import { Hexagon } from "lucide-react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendFighterPsiWarriorEnergyDieForCharacter,
  getFighterPsiWarriorEnergyDiceRemainingForCharacter,
  getFighterPsiWarriorEnergyDiceTotalForCharacter,
  getFighterPsiWarriorEnergyDieForCharacter,
  restoreAllFighterPsiWarriorEnergyDiceForCharacter,
  restoreFighterPsiWarriorEnergyDieForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import ResourceCountWidget from "./ResourceCountWidget";
import { classResourcePersistOptions } from "./persistOptions";

type PsiEnergyDiceWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function PsiEnergyDiceWidget({ character, onPersistCharacter }: PsiEnergyDiceWidgetProps) {
  const totalDice = getFighterPsiWarriorEnergyDiceTotalForCharacter(character);
  const remainingDice = getFighterPsiWarriorEnergyDiceRemainingForCharacter(character);
  const energyDie = getFighterPsiWarriorEnergyDieForCharacter(character);

  if (totalDice <= 0 || !energyDie) {
    return null;
  }

  return (
    <ResourceCountWidget
      icon={{ kind: "lucide", icon: Hexagon }}
      pillLabel={`${remainingDice}/${totalDice} Psi Energy Dice`}
      modalTitle="Psi Energy Dice"
      current={remainingDice}
      total={totalDice}
      titleSuffix={energyDie.toUpperCase()}
      onAdd={() =>
        onPersistCharacter(
          (currentCharacter) =>
            restoreFighterPsiWarriorEnergyDieForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onUse={() =>
        onPersistCharacter(
          (currentCharacter) => expendFighterPsiWarriorEnergyDieForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onReset={() =>
        onPersistCharacter(
          (currentCharacter) =>
            restoreAllFighterPsiWarriorEnergyDiceForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
    />
  );
}

export default PsiEnergyDiceWidget;
