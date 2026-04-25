import type {
  FeatureActionCard,
  FeatureActionOptionCard
} from "../../../../../pages/CharactersPage/classFeatures";
import ActionButton from "../../../../ActionButton";
import RadioContainerOption from "../../RadioContainerOption";
import FeatureActionOptionsModal from "./FeatureActionOptionsModal";
import styles from "./FeatureActionModal.module.css";

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
        <ActionButton onClick={onConfirm}>
          Apply Brutal Strike
        </ActionButton>
      }
    >
      {options.map((option) => {
        const isSelected = selectedOptionKeys.includes(option.key);
        const isSelectionLimitReached =
          !isSelected &&
          selectionLimit > 0 &&
          selectedOptionKeys.length >= selectionLimit;

        return (
          <RadioContainerOption
            key={option.key}
            header={option.name}
            breakdown={option.detail}
            selected={isSelected}
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
