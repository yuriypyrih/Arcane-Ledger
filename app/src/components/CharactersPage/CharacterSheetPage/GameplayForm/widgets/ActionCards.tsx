import clsx from "clsx";
import { Brain, Flame, Hexagon, Music, PawPrint, Sparkles } from "lucide-react";
import ActionShape from "../../../../ActionShape";
import FeatureTrackingBadgeButton from "../../../../FeatureDisclosure/FeatureTrackingBadgeButton";
import type { Character } from "../../../../../types";
import type {
  FeatureActionCard,
  FeatureActionOptionCard
} from "../../../../../pages/CharactersPage/classFeatures";
import {
  createEconomyMultiContextForFeatureAction,
  createEconomyMultiContextForFeatureActionOption,
  createEconomyMultiContextForWeaponAction,
  getSharedEconomyMultiCountForCharacterAction
} from "../../../../../pages/CharactersPage/classFeatures";
import type { WeaponAction } from "../../../../../pages/CharactersPage/gameplay";
import type { EconomyType } from "../../../../../pages/CharactersPage/actionEconomy";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import {
  getActionShapeForEconomyType,
  getDamageRangeLabel,
  getEconomyShapeState,
  getWeaponActionBreakdown
} from "../gameplayWidgetUtils";
import RollStatePill from "../../../../RollStatePill/RollStatePill";
import animaIcon from "../../../../../assets/svg/anima.svg";
import pyromancyIcon from "../../../../../assets/svg/pyromancy.svg";
import { resolveFeatureIndicators } from "../../../../RollStatePill/rollState";
import styles from "./ActionCards.module.css";
import modalStyles from "./FeatureActionModal.module.css";
import RadioOption from "./RadioOption";

type RoundTrackerAvailability = {
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

type WeaponActionCardProps = {
  action: WeaponAction;
  character: Character;
  secondaryEconomyType?: EconomyType | null;
  roundTracker: RoundTrackerAvailability;
  onClick: (action: WeaponAction) => void;
};

export function WeaponActionCard({
  action,
  character,
  secondaryEconomyType = null,
  roundTracker,
  onClick
}: WeaponActionCardProps) {
  const actionShape = getActionShapeForEconomyType(action.economyType);
  const sharedEconomyMultiCount = getSharedEconomyMultiCountForCharacterAction(
    character,
    createEconomyMultiContextForWeaponAction(action)
  );
  const economyShapeState = getEconomyShapeState(
    action.economyType,
    roundTracker,
    (action.economyMultiCount ?? 0) + sharedEconomyMultiCount
  );
  const secondaryActionShape = secondaryEconomyType
    ? getActionShapeForEconomyType(secondaryEconomyType)
    : null;
  const secondaryEconomyShapeState = secondaryEconomyType
    ? getEconomyShapeState(secondaryEconomyType, roundTracker)
    : null;
  const resolvedRollState = resolveFeatureIndicators(action.indicators);
  const isUsable = economyShapeState.isUsable || (secondaryEconomyShapeState?.isUsable ?? false);

  return (
    <button
      type="button"
      className={clsx(
        styles.button,
        styles.actionCard,
        economyShapeState.multiCount > 0 && styles.actionCardMulti
      )}
      disabled={!isUsable}
      onClick={() => onClick(action)}
    >
      {actionShape || secondaryActionShape ? (
        <span className={styles.shapeBadgeRow} aria-hidden="true">
          {actionShape ? (
            <span className={styles.shapeBadge}>
              <ActionShape
                shape={actionShape}
                isSelected={economyShapeState.isAvailable}
                multiCount={economyShapeState.multiCount}
                size="small"
              />
            </span>
          ) : null}
          {secondaryActionShape && secondaryEconomyShapeState ? (
            <span className={clsx(styles.shapeBadge, styles.shapeBadgeSecondary)}>
              <ActionShape
                shape={secondaryActionShape}
                isSelected={secondaryEconomyShapeState.isAvailable}
                multiCount={secondaryEconomyShapeState.multiCount}
                size="small"
              />
            </span>
          ) : null}
        </span>
      ) : null}
      <strong>{action.name}</strong>
      {resolvedRollState ? (
        <span className={styles.actionIndicatorRow}>
          <RollStatePill tone={resolvedRollState.tone} label={resolvedRollState.label} />
        </span>
      ) : null}
      <span className={styles.damageRow}>
        {getDamageRangeLabel(action.damageLabel, action.totalModifier, action.rollFormula)}
      </span>
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

function renderFeatureActionUsesIcon(icon: FeatureActionCard["usesIcon"]) {
  if (icon === "anima") {
    return <img src={animaIcon} alt="" className={styles.usesAssetIcon} />;
  }

  if (icon === "brain") {
    return <Brain size={14} strokeWidth={2.1} />;
  }

  if (icon === "sparkles") {
    return <Sparkles size={14} strokeWidth={2.1} />;
  }

  if (icon === "music") {
    return <Music size={14} strokeWidth={2.1} />;
  }

  if (icon === "flame") {
    return <Flame size={14} strokeWidth={2.1} />;
  }

  if (icon === "paw") {
    return <PawPrint size={14} strokeWidth={2.1} />;
  }

  if (icon === "psi") {
    return <Hexagon size={14} strokeWidth={2.1} />;
  }

  if (icon === "pyromancy") {
    return <img src={pyromancyIcon} alt="" className={styles.usesAssetIcon} />;
  }

  return null;
}

function renderFeatureActionUsesLabel(action: FeatureActionCard) {
  if (!action.usesLabel) {
    return null;
  }

  if (action.usesIcon === "brain") {
    return (
      <>
        <span>Uses</span>
        <span>{action.usesLabel}</span>
        {renderFeatureActionUsesIcon(action.usesIcon)}
      </>
    );
  }

  if (action.usesIcon) {
    const shouldPrefixUses = !/\s/.test(action.usesLabel);

    return (
      <>
        {shouldPrefixUses ? <span>Uses</span> : null}
        <span>{action.usesLabel}</span>
        {renderFeatureActionUsesIcon(action.usesIcon)}
      </>
    );
  }

  return <span>{action.usesLabel}</span>;
}

function renderFeatureActionInlineUses(action: FeatureActionCard) {
  if (!action.usesInlineLabel && !action.usesInlineIcon && !action.usesInlineSuffix) {
    return null;
  }

  return (
    <>
      {action.usesInlineLabel ? <span>{action.usesInlineLabel}</span> : null}
      {action.usesInlineIcon ? renderFeatureActionUsesIcon(action.usesInlineIcon) : null}
      {action.usesInlineSuffix ? <span>{action.usesInlineSuffix}</span> : null}
    </>
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
        {renderFeatureActionUsesIcon(option.usesIcon)}
      </>
    );
  }

  return <span>{option.usesLabel}</span>;
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
  const isDisabled =
    action.disabled === true ||
    (!action.ignoreEconomyAvailability && !economyShapeState.isUsable);
  const showsUsesTracker =
    Boolean(action.usesTotal && action.usesTotal > 0) && !action.hideUsesTrackerOnCard;
  const usesTotal = action.usesTotal ?? 0;
  const inlineUses = renderFeatureActionInlineUses(action);

  return (
    <button
      type="button"
      className={clsx(
        styles.button,
        styles.actionCard,
        economyShapeState.multiCount > 0 && styles.actionCardMulti,
        styles.featureButton,
        action.isActive && styles.featureButtonActive
      )}
      disabled={isDisabled}
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
      {showsUsesTracker ? (
        <span className={styles.usesRow}>
          <span className={styles.usesLabelText}>Charges</span>
          <span className={clsx(sheetStyles.shortRestDots, styles.usesDots)}>
            {Array.from({ length: usesTotal }, (_, index) => (
              <span
                key={`${action.key}-use-${index}`}
                className={clsx(
                  sheetStyles.shortRestDot,
                  index < (action.usesRemaining ?? 0) && sheetStyles.shortRestDotActive
                )}
              />
            ))}
          </span>
          {action.usesInlineLabel || action.usesInlineIcon || action.usesInlineSuffix ? (
            <span
              className={clsx(
                styles.usesInlineSupplementary,
                action.usesInlineIcon && styles.usesInlineSupplementaryWithIcon
              )}
            >
              {inlineUses}
            </span>
          ) : null}
        </span>
      ) : null}
      {showsUsesTracker ? (
        action.usesSupplementaryLabel ? (
          <span className={clsx(styles.damageRow, styles.featureUsesSupplementary)}>
            {action.usesSupplementaryLabel}
          </span>
        ) : null
      ) : action.usesLabel || inlineUses ? (
        <span
          className={clsx(
            styles.damageRow,
            styles.featureMeta,
            (action.usesIcon || action.usesInlineIcon) && styles.featureMetaWithIcon,
            action.usesTone === "danger" && styles.featureMetaDanger
          )}
        >
          {action.usesLabel ? renderFeatureActionUsesLabel(action) : inlineUses}
        </span>
      ) : null}
      {action.valueLabel ? <span className={styles.damageRow}>{action.valueLabel}</span> : null}
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
  selectionIndicatorType?: "radio" | null;
  selectionName?: string;
};

export function FeatureActionOptionButton({
  option,
  character,
  roundTracker,
  onClick,
  formatValueLabel,
  selected = false,
  selectionIndicatorType = null,
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

  if (selectionIndicatorType === "radio") {
    return (
      <RadioOption
        header={option.name}
        description={
          <>
            <span className={styles.optionChoiceDetails}>
              <span
                className={clsx(
                  styles.optionChoiceValue,
                  option.usesLabel && styles.featureMeta,
                  option.usesIcon && styles.featureMetaWithIcon
                )}
              >
                {valueLabel}
              </span>
              {breakdownLabel ? (
                <span className={styles.optionChoiceBreakdown}>{breakdownLabel}</span>
              ) : null}
            </span>
          </>
        }
        isSelected={selected}
        onSelect={onClick}
        name={selectionName}
        disabled={isDisabled}
        aside={
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

  return (
    <button
      type="button"
      className={clsx(
        styles.button,
        styles.actionCard,
        economyShapeState.multiCount > 0 && styles.actionCardMulti,
        modalStyles.featureActionOptionButton,
        selected && modalStyles.featureActionOptionButtonSelected
      )}
      disabled={isDisabled}
      onClick={onClick}
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
      <strong>{option.name}</strong>
      <span
        className={clsx(
          styles.damageRow,
          option.usesLabel && styles.featureMeta,
          option.usesIcon && styles.featureMetaWithIcon
        )}
      >
        {valueLabel}
      </span>
      <small className={styles.breakdownRow}>{breakdownLabel}</small>
    </button>
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
    <RadioOption
      header={option.name}
      description={option.disabledReason ?? option.detail}
      isSelected={selected}
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
