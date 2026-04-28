import { Sparkles } from "lucide-react";
import type { FeatureActionOptionCard } from "../../../../../../../pages/CharactersPage/classFeatures";
import SpellDescriptionContent from "../../../../../../SpellDescriptionContent";
import RadioContainerOption from "../../../../RadioContainerOption";
import styles from "../FeatureActionModal.module.css";

type MetamagicOptionsActionBodyProps = {
  options: FeatureActionOptionCard[];
  selectedOptionKeys: string[];
  selectionLimit: number;
  onToggleOption: (option: FeatureActionOptionCard) => void;
};

function MetamagicCost({ cost }: { cost?: string }) {
  if (!cost) {
    return null;
  }

  return (
    <span className={styles.metamagicOptionCost}>
      Cost: {cost}
      <Sparkles size={14} aria-hidden="true" />
    </span>
  );
}

function MetamagicOptionsActionBody({
  options,
  selectedOptionKeys,
  selectionLimit,
  onToggleOption
}: MetamagicOptionsActionBodyProps) {
  return (
    <div className={styles.metamagicOptionList}>
      {options.map((option) => {
        const isSelected = selectedOptionKeys.includes(option.key);
        const selectionLimitReached =
          !isSelected && selectedOptionKeys.length >= Math.max(1, selectionLimit);
        const disabledReason = selectionLimitReached
          ? `Choose up to ${selectionLimit} Metamagic option${
              selectionLimit === 1 ? "" : "s"
            }.`
          : option.disabledReason;
        const isDisabled = option.disabled === true || selectionLimitReached;
        const description =
          option.description && option.description.length > 0 ? option.description : [option.detail];

        return (
          <RadioContainerOption
            key={option.key}
            className={styles.metamagicOptionCard}
            indicatorType="checkbox"
            header={option.name}
            subheader={
              <>
                <MetamagicCost cost={option.usesLabel} />
                {disabledReason ? <span>{disabledReason}</span> : null}
              </>
            }
            breakdown={
              <SpellDescriptionContent
                description={description}
                className={styles.metamagicOptionDescription}
                entryClassName={styles.metamagicOptionDescriptionLine}
                strongClassName={styles.metamagicOptionDescriptionStrong}
              />
            }
            selected={isSelected}
            disabled={isDisabled}
            onSelect={() => onToggleOption(option)}
          />
        );
      })}
    </div>
  );
}

export default MetamagicOptionsActionBody;
