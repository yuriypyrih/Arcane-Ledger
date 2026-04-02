import type {
  FeatureActionCard,
  FeatureActionOptionCard
} from "../../../../../pages/CharactersPage/classFeatures";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import FeatureActionOptionsModal from "./FeatureActionOptionsModal";
import styles from "./FeatureActionModal.module.css";
import RadioOption from "./RadioOption";

type BrutalStrikeModalProps = {
  action: FeatureActionCard;
  options: FeatureActionOptionCard[];
  selectedOptionKeys: string[];
  selectionLimit: number;
  damageFormula: string;
  onSelectOption: (optionKey: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

function BrutalStrikeModal({
  action,
  options,
  selectedOptionKeys,
  selectionLimit,
  damageFormula,
  onSelectOption,
  onConfirm,
  onClose
}: BrutalStrikeModalProps) {
  const allowsMultipleSelections = selectionLimit > 1;
  const helperText = allowsMultipleSelections
    ? `Applying Brutal Strike adds the extra ${damageFormula} damage. You can optionally choose up to ${selectionLimit} different effects below.`
    : `Applying Brutal Strike adds the extra ${damageFormula} damage. You can optionally choose one effect below.`;

  return (
    <FeatureActionOptionsModal
      action={action}
      eyebrow="Barbarian"
      helperText={helperText}
      onClose={onClose}
      bodyClassName={styles.brutalStrikeOptionList}
      footer={
        <button type="button" className={sheetStyles.castButton} onClick={onConfirm}>
          Apply Brutal Strike
        </button>
      }
    >
      {options.map((option) => {
        const isSelected = selectedOptionKeys.includes(option.key);
        const isSelectionLimitReached =
          !isSelected &&
          selectionLimit > 0 &&
          selectedOptionKeys.length >= selectionLimit;

        return (
          <RadioOption
            key={option.key}
            header={option.name}
            description={option.detail}
            isSelected={isSelected}
            indicatorType={allowsMultipleSelections ? "checkbox" : "radio"}
            disabled={isSelectionLimitReached}
            onSelect={() => onSelectOption(option.key)}
          />
        );
      })}
    </FeatureActionOptionsModal>
  );
}

export default BrutalStrikeModal;
