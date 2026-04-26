import { Flame } from "lucide-react";
import DescriptionContent from "../../../../../../DescriptionContent/DescriptionContent";
import type {
  FeatureActionCard,
  FeatureActionOptionCard
} from "../../../../../../../pages/CharactersPage/classFeatures";
import type { SpellDescriptionEntry } from "../../../../../../../codex/entries";
import RadioContainerOption from "../../../../RadioContainerOption";
import { FeatureActionChoiceRow } from "../ActionCards";
import sharedModalStyles from "../FeatureActionModal.module.css";
import styles from "../ActionsWidget.module.css";

type RageActionBodyProps = {
  action: FeatureActionCard;
  rageOptions: FeatureActionOptionCard[];
  powerOptions: FeatureActionOptionCard[];
  rageOfTheGodsDescription: SpellDescriptionEntry[];
  selectedRageOptionKey: string | null;
  selectedPowerOptionKey: string | null;
  onSelectRageOption: (optionKey: string) => void;
  onSelectPowerOption: (optionKey: string) => void;
  rageOfTheGodsUsesRemaining: number;
  rageOfTheGodsUsesTotal: number;
  isRageOfTheGodsSelected: boolean;
  onToggleRageOfTheGods: (checked: boolean) => void;
};

function RageActionBody({
  action,
  rageOptions,
  powerOptions,
  rageOfTheGodsDescription,
  selectedRageOptionKey,
  selectedPowerOptionKey,
  onSelectRageOption,
  onSelectPowerOption,
  rageOfTheGodsUsesRemaining,
  rageOfTheGodsUsesTotal,
  isRageOfTheGodsSelected,
  onToggleRageOfTheGods
}: RageActionBodyProps) {
  return (
    <>
      {rageOptions.length > 0 ? (
        <section className={sharedModalStyles.wildHeartRageSection}>
          <div className={sharedModalStyles.wildHeartRageSectionHeading}>
            <h4 className={sharedModalStyles.wildHeartRageSectionTitle}>Rage of the Wilds</h4>
            <p className={sharedModalStyles.wildHeartRageSectionDescription}>
              Choose 1 option for this Rage.
            </p>
          </div>
          <div className={sharedModalStyles.wildHeartRageSectionOptions}>
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
      ) : null}

      {powerOptions.length > 0 ? (
        <section className={sharedModalStyles.wildHeartRageSection}>
          <div className={sharedModalStyles.wildHeartRageSectionHeading}>
            <h4 className={sharedModalStyles.wildHeartRageSectionTitle}>Power of the Wilds</h4>
            <p className={sharedModalStyles.wildHeartRageSectionDescription}>
              Choose 1 option for this Rage.
            </p>
          </div>
          <div className={sharedModalStyles.wildHeartRageSectionOptions}>
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

      {rageOfTheGodsUsesTotal > 0 ? (
        <section className={sharedModalStyles.wildHeartRageSection}>
          <div className={sharedModalStyles.wildHeartRageSectionHeading}>
            <h4 className={sharedModalStyles.wildHeartRageSectionTitle}>Rage of the Gods</h4>
            <p className={sharedModalStyles.wildHeartRageSectionDescription}>
              Choose whether to empower this Rage with your divine warrior form.
            </p>
          </div>
          <RadioContainerOption
            header="Use Rage of the Gods"
            breakdown={
              rageOfTheGodsDescription.length > 0 ? (
                <DescriptionContent
                  description={rageOfTheGodsDescription}
                  className={styles.rageEnhancementDescription}
                  entryClassName={styles.rageEnhancementDescriptionLine}
                />
              ) : (
                "You can assume the form of a divine warrior for a minute."
              )
            }
            selected={isRageOfTheGodsSelected}
            onSelect={() => onToggleRageOfTheGods(!isRageOfTheGodsSelected)}
            disabled={rageOfTheGodsUsesRemaining <= 0}
            indicatorType="checkbox"
            aside={
              <span className={styles.rageEnhancementMeta}>
                <span className={styles.rageEnhancementModeBadge}>Opt-in</span>
                <span>{`${rageOfTheGodsUsesRemaining}/${rageOfTheGodsUsesTotal}`}</span>
                <Flame size={14} />
              </span>
            }
          />
        </section>
      ) : null}
    </>
  );
}

export default RageActionBody;
