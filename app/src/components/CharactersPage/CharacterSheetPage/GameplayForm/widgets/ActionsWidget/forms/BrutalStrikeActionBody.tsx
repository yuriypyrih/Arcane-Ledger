import type { FeatureActionOptionCard } from "../../../../../../../pages/CharactersPage/classFeatures";
import shared from "../../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import RadioContainerOption from "../../../../RadioContainerOption";
import sharedModalStyles from "../FeatureActionModal.module.css";

type BrutalStrikeActionBodyProps = {
  options: FeatureActionOptionCard[];
  selectionLimit: number;
  damageFormula: string;
  selectedOptionKeys: string[];
  onToggleOption: (optionKey: string) => void;
};

function BrutalStrikeActionBody({
  options,
  selectionLimit,
  damageFormula,
  selectedOptionKeys,
  onToggleOption
}: BrutalStrikeActionBodyProps) {
  const allowsMultipleSelections = selectionLimit > 1;
  const helperText = allowsMultipleSelections
    ? `Applying Brutal Strike adds the extra ${damageFormula} damage. You can optionally choose up to ${selectionLimit} different effects below.`
    : `Applying Brutal Strike adds the extra ${damageFormula} damage. You can optionally choose one effect below.`;

  return (
    <>
      <p className={shared.helperText}>{helperText}</p>
      <div className={sharedModalStyles.brutalStrikeOptionList}>
        {options.map((option) => {
          const isSelected = selectedOptionKeys.includes(option.key);
          const isSelectionLimitReached =
            !isSelected && selectionLimit > 0 && selectedOptionKeys.length >= selectionLimit;

          return (
            <RadioContainerOption
              key={option.key}
              header={option.name}
              breakdown={option.detail}
              selected={isSelected}
              indicatorType={allowsMultipleSelections ? "checkbox" : "radio"}
              disabled={isSelectionLimitReached}
              onSelect={() => onToggleOption(option.key)}
            />
          );
        })}
      </div>
    </>
  );
}

export default BrutalStrikeActionBody;
