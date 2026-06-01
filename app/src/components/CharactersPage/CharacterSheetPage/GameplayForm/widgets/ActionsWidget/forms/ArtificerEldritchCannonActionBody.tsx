import { useEffect, useMemo } from "react";
import {
  getArtificerEldritchCannonOptions,
  isArtificerEldritchCannonOptionKey,
  type ArtificerEldritchCannonOptionKey
} from "../../../../../../../pages/CharactersPage/classFeatures/artificer/artificer";
import RadioContainerOption from "../../../../RadioContainerOption";
import styles from "../ActionsWidget.module.css";
import sharedModalStyles from "../FeatureActionModal.module.css";

type ArtificerEldritchCannonActionBodyProps = {
  selectedOptionKey: string | null;
  onSelectedOptionKeyChange: (optionKey: ArtificerEldritchCannonOptionKey | null) => void;
};

function ArtificerEldritchCannonActionBody({
  selectedOptionKey,
  onSelectedOptionKeyChange
}: ArtificerEldritchCannonActionBodyProps) {
  const options = useMemo(() => getArtificerEldritchCannonOptions(), []);

  useEffect(() => {
    if (
      selectedOptionKey &&
      (!isArtificerEldritchCannonOptionKey(selectedOptionKey) ||
        !options.some((option) => option.key === selectedOptionKey))
    ) {
      onSelectedOptionKeyChange(null);
    }
  }, [onSelectedOptionKeyChange, options, selectedOptionKey]);

  return (
    <div className={styles.experimentalElixirBody}>
      <div className={sharedModalStyles.featureActionOptionGrid}>
        {options.map((option) => (
          <RadioContainerOption
            key={option.key}
            name="artificer-eldritch-cannon-option"
            header={option.name}
            selected={selectedOptionKey === option.key}
            onSelect={() =>
              onSelectedOptionKeyChange(
                isArtificerEldritchCannonOptionKey(option.key) ? option.key : null
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

export default ArtificerEldritchCannonActionBody;
