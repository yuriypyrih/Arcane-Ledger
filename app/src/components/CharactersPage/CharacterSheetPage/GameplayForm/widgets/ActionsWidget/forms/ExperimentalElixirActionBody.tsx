import { useEffect, useMemo } from "react";
import {
  getArtificerExperimentalElixirOptionsForCharacter,
  type ArtificerExperimentalElixirOptionKey
} from "../../../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import type { Character } from "../../../../../../../types";
import RadioContainerOption from "../../../../RadioContainerOption";
import styles from "../ActionsWidget.module.css";

type ExperimentalElixirActionBodyProps = {
  character: Character;
  selectedOptionKey: ArtificerExperimentalElixirOptionKey | null;
  onSelectedOptionKeyChange: (optionKey: ArtificerExperimentalElixirOptionKey | null) => void;
};

function ExperimentalElixirActionBody({
  character,
  selectedOptionKey,
  onSelectedOptionKeyChange
}: ExperimentalElixirActionBodyProps) {
  const options = useMemo(
    () => getArtificerExperimentalElixirOptionsForCharacter(character),
    [character]
  );

  useEffect(() => {
    if (selectedOptionKey && !options.some((option) => option.key === selectedOptionKey)) {
      onSelectedOptionKeyChange(null);
    }
  }, [onSelectedOptionKeyChange, options, selectedOptionKey]);

  return (
    <div className={styles.experimentalElixirBody}>
      <div className={styles.experimentalElixirOptionList}>
        {options.map((option) => (
          <RadioContainerOption
            key={option.key}
            name="experimental-elixir-option"
            header={option.name}
            breakdown={option.description}
            selected={selectedOptionKey === option.key}
            onSelect={() => onSelectedOptionKeyChange(option.key)}
          />
        ))}
      </div>
    </div>
  );
}

export default ExperimentalElixirActionBody;
