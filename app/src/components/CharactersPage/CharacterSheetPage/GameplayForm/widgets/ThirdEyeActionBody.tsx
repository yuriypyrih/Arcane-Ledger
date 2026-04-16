import {
  type WizardDivinerThirdEyeOptionKey,
  wizardDivinerThirdEyeOptionDefinitions
} from "../../../../../pages/CharactersPage/classFeatures/wizard/subclasses/wizardDivinerThirdEyeConfig";
import shared from "../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import RadioContainerOption from "../../RadioContainerOption";
import styles from "./ThirdEyeActionBody.module.css";

type ThirdEyeActionBodyProps = {
  selectedOptionKey: WizardDivinerThirdEyeOptionKey | null;
  onSelectOption: (optionKey: WizardDivinerThirdEyeOptionKey) => void;
};

function ThirdEyeActionBody({ selectedOptionKey, onSelectOption }: ThirdEyeActionBodyProps) {
  return (
    <>
      <div className={styles.thirdEyeOptionList}>
        {wizardDivinerThirdEyeOptionDefinitions.map((option) => (
          <RadioContainerOption
            key={option.key}
            name="wizard-diviner-third-eye"
            header={option.name}
            breakdown={option.textDescription}
            selected={selectedOptionKey === option.key}
            onSelect={() => onSelectOption(option.key)}
          />
        ))}
      </div>

      <p className={shared.helperText}>
        No option is selected by default. Choose the benefit you want to activate for this rest.
      </p>
    </>
  );
}

export default ThirdEyeActionBody;
