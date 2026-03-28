import clsx from "clsx";
import { Brain } from "lucide-react";
import ActionShape from "../../../../ActionShape";
import type { Character } from "../../../../../types";
import type {
  FeatureActionCard,
  FeatureActionOptionCard
} from "../../../../../pages/CharactersPage/classFeatures";
import { getNonMagicActionEconomyMultiForCharacter } from "../../../../../pages/CharactersPage/classFeatures";
import type { WeaponAction } from "../../../../../pages/CharactersPage/gameplay";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import {
  getActionShapeForEconomyType,
  getDamageRangeLabel,
  getEconomyShapeState,
  getWeaponActionBreakdown
} from "../gameplayWidgetUtils";
import RollStatePill from "../../../../RollStatePill/RollStatePill";
import { resolveFeatureIndicators } from "../../../../RollStatePill/rollState";
import styles from "./ActionsWidget.module.css";

type RoundTrackerAvailability = {
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

type WeaponActionCardProps = {
  action: WeaponAction;
  roundTracker: RoundTrackerAvailability;
  onClick: (action: WeaponAction) => void;
};

export function WeaponActionCard({ action, roundTracker, onClick }: WeaponActionCardProps) {
  const actionShape = getActionShapeForEconomyType(action.economyType);
  const economyShapeState = getEconomyShapeState(
    action.economyType,
    roundTracker,
    action.economyMultiCount ?? 0
  );
  const resolvedRollState = resolveFeatureIndicators(action.indicators);

  return (
    <button
      type="button"
      className={clsx(
        styles.button,
        styles.actionCard,
        economyShapeState.multiCount > 0 && styles.actionCardMulti
      )}
      disabled={!economyShapeState.isUsable}
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
  if (icon === "brain") {
    return <Brain size={14} strokeWidth={2.1} />;
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

  return <span>{action.usesLabel}</span>;
}

export function FeatureActionCardButton({
  action,
  character,
  roundTracker,
  onClick
}: FeatureActionCardButtonProps) {
  const actionShape = getActionShapeForEconomyType(action.economyType);
  const economyShapeState = getEconomyShapeState(
    action.economyType,
    roundTracker,
    (action.economyMultiCount ?? 0) +
      (action.economyType === "action" && action.actionCategory !== "magic"
        ? getNonMagicActionEconomyMultiForCharacter(character)
        : 0)
  );
  const isDisabled = action.disabled === true || !economyShapeState.isUsable;

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
      {action.usesTotal && action.usesTotal > 0 ? (
        <span className={styles.usesRow}>
          <span className={styles.usesLabelText}>Charges</span>
          <span className={clsx(sheetStyles.shortRestDots, styles.usesDots)}>
            {Array.from({ length: action.usesTotal }, (_, index) => (
              <span
                key={`${action.key}-use-${index}`}
                className={clsx(
                  sheetStyles.shortRestDot,
                  index < (action.usesRemaining ?? 0) && sheetStyles.shortRestDotActive
                )}
              />
            ))}
          </span>
        </span>
      ) : null}
      {action.usesTotal && action.usesTotal > 0 ? (
        action.usesSupplementaryLabel ? (
          <span className={clsx(styles.damageRow, styles.featureUsesSupplementary)}>
            {action.usesSupplementaryLabel}
          </span>
        ) : null
      ) : action.usesLabel ? (
        <span
          className={clsx(
            styles.damageRow,
            styles.featureMeta,
            action.usesIcon && styles.featureMetaWithIcon,
            action.usesTone === "danger" && styles.featureMetaDanger
          )}
        >
          {renderFeatureActionUsesLabel(action)}
        </span>
      ) : null}
      {action.valueLabel ? <span className={styles.damageRow}>{action.valueLabel}</span> : null}
      <small className={styles.breakdownRow}>
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
};

export function FeatureActionOptionButton({
  option,
  character,
  roundTracker,
  onClick,
  formatValueLabel
}: FeatureActionOptionButtonProps) {
  const actionShape = getActionShapeForEconomyType(option.economyType);
  const economyShapeState = getEconomyShapeState(
    option.economyType,
    roundTracker,
    (option.economyMultiCount ?? 0) +
      (option.economyType === "action" && option.actionCategory !== "magic"
        ? getNonMagicActionEconomyMultiForCharacter(character)
        : 0)
  );

  return (
    <button
      type="button"
      className={clsx(
        styles.button,
        styles.actionCard,
        economyShapeState.multiCount > 0 && styles.actionCardMulti,
        styles.featureActionOptionButton
      )}
      disabled={!economyShapeState.isUsable}
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
      <span className={styles.damageRow}>{formatValueLabel(option)}</span>
      <small className={styles.breakdownRow}>
        {economyShapeState.disabledReason ?? option.breakdown ?? option.summary}
      </small>
    </button>
  );
}
