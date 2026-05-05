import type { Character } from "../../../../../types";
import type { PersistCharacterUpdater } from "../../../../../pages/CharactersPage/CharacterSheetPage/types";
import {
  expendChannelDivinityUseForCharacter,
  getChannelDivinityUsesRemainingForCharacter,
  getChannelDivinityUsesTotalForCharacter,
  restoreAllChannelDivinityUsesForCharacter,
  restoreChannelDivinityUseForCharacter
} from "../../../../../pages/CharactersPage/classFeatures";
import pyromancyIcon from "../../../../../assets/svg/pyromancy.svg";
import ResourceCountWidget from "./ResourceCountWidget";
import { classResourcePersistOptions } from "./persistOptions";

type DivinityPointsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
};

function DivinityPointsWidget({ character, onPersistCharacter }: DivinityPointsWidgetProps) {
  const totalUses = getChannelDivinityUsesTotalForCharacter(character);
  const remainingUses = getChannelDivinityUsesRemainingForCharacter(character);

  if (totalUses <= 0) {
    return null;
  }

  return (
    <ResourceCountWidget
      icon={{ kind: "image", src: pyromancyIcon }}
      pillLabel={`${remainingUses}/${totalUses} Channel Divinity`}
      modalTitle="Channel Divinity"
      current={remainingUses}
      total={totalUses}
      onAdd={() =>
        onPersistCharacter(
          (currentCharacter) => restoreChannelDivinityUseForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onUse={() =>
        onPersistCharacter(
          (currentCharacter) => expendChannelDivinityUseForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
      onReset={() =>
        onPersistCharacter(
          (currentCharacter) => restoreAllChannelDivinityUsesForCharacter(currentCharacter),
          classResourcePersistOptions
        )
      }
    />
  );
}

export default DivinityPointsWidget;
