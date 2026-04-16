import { Music } from "lucide-react";
import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendBardicInspirationUseForCharacter,
  getBardicInspirationUsesRemainingForCharacter,
  getBardicInspirationUsesTotalForCharacter,
  restoreAllBardicInspirationUsesForCharacter,
  restoreBardicInspirationUseForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import ResourceCountWidget from "./ResourceCountWidget";

type BardicInspirationWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function BardicInspirationWidget({ character, onPersistCharacter }: BardicInspirationWidgetProps) {
  const totalUses = getBardicInspirationUsesTotalForCharacter(character);
  const remainingUses = getBardicInspirationUsesRemainingForCharacter(character);

  if (totalUses <= 0) {
    return null;
  }

  return (
    <ResourceCountWidget
      icon={{ kind: "lucide", icon: Music }}
      pillLabel={`${remainingUses}/${totalUses} Bardic Inspiration`}
      modalTitle="Bardic Inspiration"
      eyebrow="Bard"
      current={remainingUses}
      total={totalUses}
      onAdd={() =>
        onPersistCharacter((currentCharacter) =>
          restoreBardicInspirationUseForCharacter(currentCharacter)
        )
      }
      onUse={() =>
        onPersistCharacter((currentCharacter) =>
          expendBardicInspirationUseForCharacter(currentCharacter)
        )
      }
      onReset={() =>
        onPersistCharacter((currentCharacter) =>
          restoreAllBardicInspirationUsesForCharacter(currentCharacter)
        )
      }
    />
  );
}

export default BardicInspirationWidget;
