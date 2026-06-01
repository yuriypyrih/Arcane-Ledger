import { useEffect, useMemo } from "react";
import {
  getArtificerArcaneFirearmItemOptions
} from "../../../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import type { Character } from "../../../../../../../types";
import RadioContainerOption from "../../../../RadioContainerOption";
import shared from "../../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "../ActionsWidget.module.css";

type ArtificerArcaneFirearmActionBodyProps = {
  character: Character;
  selectedStackId: string | null;
  onSelectedStackIdChange: (stackId: string | null) => void;
};

function ArtificerArcaneFirearmActionBody({
  character,
  selectedStackId,
  onSelectedStackIdChange
}: ArtificerArcaneFirearmActionBodyProps) {
  const options = useMemo(() => getArtificerArcaneFirearmItemOptions(character), [character]);

  useEffect(() => {
    if (selectedStackId && !options.some((option) => option.stackId === selectedStackId)) {
      onSelectedStackIdChange(null);
    }
  }, [onSelectedStackIdChange, options, selectedStackId]);

  return (
    <div className={styles.experimentalElixirBody}>
      <div className={styles.experimentalElixirOptionList}>
        {options.length <= 0 ? (
          <p className={shared.emptyText}>No eligible top-level inventory items.</p>
        ) : null}
        {options.map((option) => (
          <RadioContainerOption
            key={option.stackId}
            name="artificer-arcane-firearm-item"
            header={option.label}
            selected={selectedStackId === option.stackId}
            onSelect={() => onSelectedStackIdChange(option.stackId)}
          />
        ))}
      </div>
    </div>
  );
}

export default ArtificerArcaneFirearmActionBody;
