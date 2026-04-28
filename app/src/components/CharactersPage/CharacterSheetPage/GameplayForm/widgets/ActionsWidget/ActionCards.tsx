import clsx from "clsx";
import type { ReactNode } from "react";
import ActionShape from "../../../../../ActionShape";
import RollStatePill from "../../../../../RollStatePill/RollStatePill";
import FeatureUsageLabel, { renderFeatureUsageIcon } from "../../../FeatureUsageLabel";
import FeatureTrackingBadgeButton from "../../../../../FeatureDisclosure/FeatureTrackingBadgeButton";
import RadioContainerOption from "../../../RadioContainerOption";
import type { Character } from "../../../../../../types";
import type {
  FeatureActionCard,
  FeatureActionOptionCard
} from "../../../../../../pages/CharactersPage/classFeatures";
import {
  createEconomyMultiContextForFeatureAction,
  createEconomyMultiContextForFeatureActionOption,
  getSharedEconomyMultiCountForCharacterAction
} from "../../../../../../pages/CharactersPage/classFeatures";
import type { WeaponAction } from "../../../../../../pages/CharactersPage/gameplay";
import {
  getActionShapeForEconomyType,
  getDamageRangeLabel,
  getEconomyShapeState,
  getWeaponActionBreakdown
} from "../../gameplayWidgetUtils";
import { resolveFeatureIndicators } from "../../../../../RollStatePill/rollState";
import { getWeaponAttackPathStates } from "./weaponActionEconomy";
import styles from "./ActionCards.module.css";
import modalStyles from "./FeatureActionModal.module.css";

type RoundTrackerAvailability = {
  isInCombat?: boolean;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

function renderCardSubheader(content: ReactNode) {
  return (
    <span className={styles.subheaderSlot}>
      {content ?? (
        <span className={styles.subheaderPlaceholder} aria-hidden="true">
          &nbsp;
        </span>
      )}
    </span>
  );
}

type WeaponActionCardProps = {
  action: WeaponAction;
  character: Character;
  roundTracker: RoundTrackerAvailability;
  onClick: (action: WeaponAction) => void;
};

export function WeaponActionCard({
  action,
  character,
  roundTracker,
  onClick
}: WeaponActionCardProps) {
  const attackPaths = getWeaponAttackPathStates(character, action, roundTracker);
  const isUnavailable = attackPaths.every((path) => !path.shapeState.isUsable);
  const hasAdditionalPathUses = attackPaths.some((path) => path.additionalUseCount > 0);
  const resolvedRollState = resolveFeatureIndicators(action.indicators);

  return (
    <button
      type="button"
      className={clsx(
        styles.button,
        styles.actionCard,
        isUnavailable && styles.actionCardUnavailable,
        hasAdditionalPathUses && styles.actionCardMulti
      )}
      aria-disabled={isUnavailable}
      onClick={() => onClick(action)}
    >
      {attackPaths.length > 0 ? (
        <span className={styles.shapeBadgeRow} aria-hidden="true">
          {attackPaths.map((path) => {
            const actionShape = getActionShapeForEconomyType(path.economyType);

            if (!actionShape) {
              return null;
            }

            return (
              <span key={`${action.key}-${path.id}`} className={styles.shapeBadgeMeta}>
                <span
                  className={clsx(
                    styles.shapeBadge,
                    path.id === "secondary" && styles.shapeBadgeSecondary
                  )}
                >
                  <ActionShape
                    shape={actionShape}
                    isSelected={path.shapeState.isAvailable}
                    multiCount={path.shapeState.multiCount}
                    showMultiCountLabel={false}
                    size="small"
                  />
                </span>
                {path.additionalUseCount > 0 ? (
                  <span className={styles.shapeBadgeCount}>{`x${path.totalUseCount}`}</span>
                ) : null}
              </span>
            );
          })}
        </span>
      ) : null}
      <span className={styles.cardHeaderRow}>
        <strong className={styles.cardHeaderTitle}>{action.name}</strong>
        {resolvedRollState ? (
          <RollStatePill
            tone={resolvedRollState.tone}
            size="small"
            className={styles.weaponRollStatePill}
          />
        ) : null}
      </span>
      {renderCardSubheader(
        <span className={styles.damageRow}>
          {getDamageRangeLabel(action.damageLabel, action.totalModifier, action.rollFormula)}
        </span>
      )}
      <small className={styles.breakdownRow}>{getWeaponActionBreakdown(action)}</small>
    </button>
  );
}

type FeatureActionCardButtonProps = {
  action: FeatureActionCard;
  character: Character;
  roundTracker: RoundTrackerAvailability;
  onClick: (action: FeatureActionCard) => void;
};

function renderFeatureActionCardUsage(action: FeatureActionCard) {
  if (!action.cardUsage) {
    return null;
  }

  return (
    <FeatureUsageLabel
      usage={action.cardUsage}
      usageKey={action.key}
      className={styles.featureUsage}
      chargesClassName={styles.featureUsageCharges}
      textClassName={styles.featureUsageText}
      operatorClassName={styles.featureUsageOperator}
      dotsClassName={styles.usesDots}
      imageIconClassName={styles.usesAssetIcon}
    />
  );
}

function renderFeatureActionOptionUsesLabel(option: FeatureActionOptionCard) {
  if (!option.usesLabel) {
    return null;
  }

  if (option.usesIcon) {
    const shouldPrefixUses = !/\s/.test(option.usesLabel);

    return (
      <>
        {shouldPrefixUses ? <span>Uses</span> : null}
        <span>{option.usesLabel}</span>
        {renderFeatureUsageIcon(option.usesIcon, {
          imageIconClassName: styles.usesAssetIcon
        })}
      </>
    );
  }

  return <span>{option.usesLabel}</span>;
}

function renderFeatureActionSubheader(action: FeatureActionCard) {
  const usageContent = renderFeatureActionCardUsage(action);

  if (!usageContent && !action.usesSupplementaryLabel && !action.valueLabel) {
    return null;
  }

  return (
    <span className={styles.subheaderStack}>
      {usageContent ? <span className={styles.damageRow}>{usageContent}</span> : null}
      {action.usesSupplementaryLabel ? (
        <span className={clsx(styles.damageRow, styles.featureUsesSupplementary)}>
          {action.usesSupplementaryLabel}
        </span>
      ) : null}
      {action.valueLabel ? <span className={styles.damageRow}>{action.valueLabel}</span> : null}
    </span>
  );
}

export function FeatureActionCardButton({
  action,
  character,
  roundTracker,
  onClick
}: FeatureActionCardButtonProps) {
  const actionShape = getActionShapeForEconomyType(action.economyType);
  const sharedEconomyMultiCount = getSharedEconomyMultiCountForCharacterAction(
    character,
    createEconomyMultiContextForFeatureAction(action)
  );
  const economyShapeState = getEconomyShapeState(
    action.economyType,
    roundTracker,
    (action.economyMultiCount ?? 0) + sharedEconomyMultiCount
  );
  const isUnavailable =
    action.disabled === true || (!action.ignoreEconomyAvailability && !economyShapeState.isUsable);

  return (
    <button
      type="button"
      className={clsx(
        styles.button,
        styles.actionCard,
        isUnavailable && styles.actionCardUnavailable,
        economyShapeState.multiCount > 0 && styles.actionCardMulti,
        styles.featureButton,
        action.isActive && styles.featureButtonActive
      )}
      aria-disabled={isUnavailable}
      onClick={() => onClick(action)}
    >
      {actionShape ? (
        <span className={styles.shapeBadge} aria-hidden="true">
          <ActionShape
            shape={actionShape}
            isSelected={economyShapeState.isAvailable}
            multiCount={economyShapeState.multiCount}
            size="small"
          />
        </span>
      ) : null}
      <strong>{action.name}</strong>
      {renderCardSubheader(renderFeatureActionSubheader(action))}
      <small
        className={clsx(
          styles.breakdownRow,
          action.breakdownTone === "danger" && styles.breakdownRowDanger
        )}
      >
        {action.breakdown ?? (action.isActive ? action.detail : action.summary)}
      </small>
    </button>
  );
}

type FeatureActionOptionButtonProps = {
  option: FeatureActionOptionCard;
  character: Character;
  roundTracker: RoundTrackerAvailability;
  onClick: () => void;
  formatValueLabel: (option: FeatureActionOptionCard) => string;
  selected?: boolean;
  selectionIndicatorType?: "radio" | "checkbox";
  selectionName?: string;
};

export function FeatureActionOptionButton({
  option,
  character,
  roundTracker,
  onClick,
  formatValueLabel,
  selected = false,
  selectionIndicatorType = "radio",
  selectionName
}: FeatureActionOptionButtonProps) {
  const actionShape = getActionShapeForEconomyType(option.economyType);
  const sharedEconomyMultiCount = getSharedEconomyMultiCountForCharacterAction(
    character,
    createEconomyMultiContextForFeatureActionOption(option)
  );
  const economyShapeState = getEconomyShapeState(
    option.economyType,
    roundTracker,
    (option.economyMultiCount ?? 0) + sharedEconomyMultiCount
  );
  const isDisabled = option.disabled === true || !economyShapeState.isUsable;
  const valueLabel = option.usesLabel
    ? renderFeatureActionOptionUsesLabel(option)
    : formatValueLabel(option);
  const breakdownLabel =
    option.disabledReason ?? economyShapeState.disabledReason ?? option.breakdown ?? option.summary;

  return (
    <RadioContainerOption
      header={option.name}
      subheader={
        valueLabel ? (
          <span
            className={clsx(
              styles.optionChoiceValue,
              option.usesLabel && styles.featureMeta,
              option.usesIcon && styles.featureMetaWithIcon
            )}
          >
            {valueLabel}
          </span>
        ) : undefined
      }
      breakdown={
        breakdownLabel ? (
          <span className={styles.optionChoiceBreakdown}>{breakdownLabel}</span>
        ) : undefined
      }
      selected={selected}
      onSelect={onClick}
      name={selectionName}
      disabled={isDisabled}
      indicatorType={selectionIndicatorType}
      className={clsx(
        economyShapeState.multiCount > 0 && styles.actionCardMulti,
        modalStyles.featureActionOptionButton
      )}
      actionBadge={
        actionShape ? (
          <ActionShape
            shape={actionShape}
            isSelected={economyShapeState.isAvailable}
            multiCount={economyShapeState.multiCount}
            size="small"
          />
        ) : undefined
      }
    />
  );
}

type FeatureActionChoiceRowProps = {
  option: FeatureActionOptionCard;
  selected: boolean;
  onClick: () => void;
  groupName: string;
};

export function FeatureActionChoiceRow({
  option,
  selected,
  onClick,
  groupName
}: FeatureActionChoiceRowProps) {
  const isDisabled = option.disabled === true;

  return (
    <RadioContainerOption
      header={option.name}
      breakdown={option.disabledReason ?? option.detail}
      selected={selected}
      onSelect={onClick}
      name={groupName}
      disabled={isDisabled}
      aside={
        option.trackingState ? (
          <FeatureTrackingBadgeButton trackingState={option.trackingState} />
        ) : undefined
      }
    />
  );
}
