import type { FeatureActionOptionCard } from "../../../../../../../pages/CharactersPage/classFeatures";
import RadioContainerOption from "../../../../RadioContainerOption";
import sharedModalStyles from "../FeatureActionModal.module.css";

type TinkersMagicActionBodyProps = {
  options: FeatureActionOptionCard[];
  selectedOptionKeys: string[];
  onSelectOption: (option: FeatureActionOptionCard) => void;
};

function TinkersMagicActionBody({
  options,
  selectedOptionKeys,
  onSelectOption
}: TinkersMagicActionBodyProps) {
  return (
    <div className={sharedModalStyles.featureActionOptionGrid}>
      {options.map((option) => (
        <RadioContainerOption
          key={option.key}
          name="artificer-tinkers-magic-item"
          header={option.name}
          selected={selectedOptionKeys.includes(option.key)}
          onSelect={() => onSelectOption(option)}
        />
      ))}
    </div>
  );
}

export default TinkersMagicActionBody;
