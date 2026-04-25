import type {
  FeatureActionCard,
  FeatureActionOptionCard
} from "../../../../../pages/CharactersPage/classFeatures";
import ActionButton from "../../../../ActionButton";
import { FeatureActionChoiceRow } from "./ActionCards";
import FeatureActionOptionsModal from "./FeatureActionOptionsModal";
import styles from "./FeatureActionModal.module.css";

type WildHeartRageModalProps = {
  action: FeatureActionCard;
  rageOptions: FeatureActionOptionCard[];
  powerOptions: FeatureActionOptionCard[];
  selectedRageOptionKey: string | null;
  selectedPowerOptionKey: string | null;
  onSelectRageOption: (optionKey: string) => void;
  onSelectPowerOption: (optionKey: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

function WildHeartRageModal({
  action,
  rageOptions,
  powerOptions,
  selectedRageOptionKey,
  selectedPowerOptionKey,
  onSelectRageOption,
  onSelectPowerOption,
  onConfirm,
  onClose
}: WildHeartRageModalProps) {
  const requiresPowerChoice = powerOptions.length > 0;
  const canConfirm =
    selectedRageOptionKey !== null && (!requiresPowerChoice || selectedPowerOptionKey !== null);

  return (
    <FeatureActionOptionsModal
      action={action}
      eyebrow="Barbarian"
      helperText={
        requiresPowerChoice
          ? "Choose one Rage of the Wilds option and one Power of the Wilds option before you enter Rage."
          : "Choose one Rage of the Wilds option before you enter Rage."
      }
      onClose={onClose}
      bodyClassName={styles.wildHeartRageOptionList}
      footer={
        <ActionButton disabled={!canConfirm} onClick={onConfirm}>
          Enter Rage
        </ActionButton>
      }
    >
      <section className={styles.wildHeartRageSection}>
        <div className={styles.wildHeartRageSectionHeading}>
          <h4 className={styles.wildHeartRageSectionTitle}>Rage of the Wilds</h4>
          <p className={styles.wildHeartRageSectionDescription}>Choose 1 option for this Rage.</p>
        </div>
        <div className={styles.wildHeartRageSectionOptions}>
          {rageOptions.map((option) => (
            <FeatureActionChoiceRow
              key={option.key}
              option={option}
              groupName={`feature-action-choice-${action.key}-rage`}
              selected={selectedRageOptionKey === option.key}
              onClick={() => onSelectRageOption(option.key)}
            />
          ))}
        </div>
      </section>

      {requiresPowerChoice ? (
        <section className={styles.wildHeartRageSection}>
          <div className={styles.wildHeartRageSectionHeading}>
            <h4 className={styles.wildHeartRageSectionTitle}>Power of the Wilds</h4>
            <p className={styles.wildHeartRageSectionDescription}>Choose 1 option for this Rage.</p>
          </div>
          <div className={styles.wildHeartRageSectionOptions}>
            {powerOptions.map((option) => (
              <FeatureActionChoiceRow
                key={option.key}
                option={option}
                groupName={`feature-action-choice-${action.key}-power`}
                selected={selectedPowerOptionKey === option.key}
                onClick={() => onSelectPowerOption(option.key)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </FeatureActionOptionsModal>
  );
}

export default WildHeartRageModal;
