import { Cross } from "lucide-react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendWarlockHealingLightDieForCharacter,
  getWarlockHealingLightDiceRemainingForCharacter,
  getWarlockHealingLightDiceTotalForCharacter,
  restoreAllWarlockHealingLightDiceForCharacter,
  restoreWarlockHealingLightDieForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import ResourceCountWidget from "./ResourceCountWidget";

type HealingLightDiceWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function HealingLightDiceWidget({ character, onPersistCharacter }: HealingLightDiceWidgetProps) {
  const totalDice = getWarlockHealingLightDiceTotalForCharacter(character);
  const remainingDice = getWarlockHealingLightDiceRemainingForCharacter(character);

  if (totalDice <= 0) {
    return null;
  }

  return (
    <ResourceCountWidget
      icon={{ kind: "lucide", icon: Cross }}
      pillLabel={`${remainingDice}/${totalDice} Healing d6`}
      modalTitle="Healing d6"
      eyebrow="Celestial Patron"
      current={remainingDice}
      total={totalDice}
      onAdd={() =>
        onPersistCharacter((currentCharacter) =>
          restoreWarlockHealingLightDieForCharacter(currentCharacter)
        )
      }
      onUse={() =>
        onPersistCharacter((currentCharacter) =>
          expendWarlockHealingLightDieForCharacter(currentCharacter)
        )
      }
      onReset={() =>
        onPersistCharacter((currentCharacter) =>
          restoreAllWarlockHealingLightDiceForCharacter(currentCharacter)
        )
      }
    />
  );
}

export default HealingLightDiceWidget;
