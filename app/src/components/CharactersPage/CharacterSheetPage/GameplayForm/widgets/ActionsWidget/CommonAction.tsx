import clsx from "clsx";
import d20Icon from "../../../../../../assets/svg/d20.svg";
import ActionFooterButtonRow from "./ActionFooterButtonRow";
import DiceRollerSettingsButton from "../DiceRollerSettingsButton";
import ActionButton from "../../../../../ActionButton";
import ActionShape from "../../../../../ActionShape";
import FeatureUsageLabel from "../../../FeatureUsageLabel";
import type { Character } from "../../../../../../types";
import type { FeatureActionCard } from "../../../../../../pages/CharactersPage/classFeatures";
import type { EconomyType } from "../../../../../../pages/CharactersPage/actionEconomy";
import { resolveActionCardTheme } from "../../../../../../pages/CharactersPage/actionCardTheme";
import { runWithActionConfirmationToast } from "../../../actionConfirmationToast";
import { getActionShapeForEconomyType } from "../../gameplayWidgetUtils";
import actionCardStyles from "./ActionCards.module.css";
import actionStyles from "./ActionsWidget.module.css";
import {
  ActionCardThemeTexture,
  getActionCardThemeClassNames
} from "./actionCardThemeStyles";
import {
  getCommonActionPathStates,
  type CommonActionPathState
} from "./commonActionEconomy";

type RoundTrackerAvailability = {
  isInCombat?: boolean;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

type CommonActionCardProps = {
  action: FeatureActionCard;
  character: Character;
  roundTracker: RoundTrackerAvailability;
  onClick: (action: FeatureActionCard) => void;
};

type CommonActionFooterProps = {
  confirmLabel: string;
  actionPaths: CommonActionPathState[];
  onConfirmPath: (economyType: EconomyType) => void;
  diceSettings?: { actionName: string; isOpen: boolean; onOpenChange: (open: boolean) => void };
};

function renderFeatureActionCardUsage(action: FeatureActionCard) {
  if (!action.cardUsage) {
    return null;
  }

  return (
    <FeatureUsageLabel
      usage={action.cardUsage}
      usageKey={action.key}
      className={actionCardStyles.featureUsage}
      chargesClassName={actionCardStyles.featureUsageCharges}
      textClassName={actionCardStyles.featureUsageText}
      operatorClassName={actionCardStyles.featureUsageOperator}
      dotsClassName={actionCardStyles.usesDots}
      imageIconClassName={actionCardStyles.usesAssetIcon}
    />
  );
}

function renderFeatureActionSubheader(action: FeatureActionCard) {
  const usageContent = renderFeatureActionCardUsage(action);

  if (!usageContent && !action.usesSupplementaryLabel && !action.valueLabel) {
    return null;
  }

  return (
    <span className={actionCardStyles.subheaderStack}>
      {usageContent ? <span className={actionCardStyles.damageRow}>{usageContent}</span> : null}
      {action.usesSupplementaryLabel ? (
        <span
          className={clsx(actionCardStyles.damageRow, actionCardStyles.featureUsesSupplementary)}
        >
          {action.usesSupplementaryLabel}
        </span>
      ) : null}
      {action.valueLabel ? <span className={actionCardStyles.damageRow}>{action.valueLabel}</span> : null}
    </span>
  );
}

export function CommonActionCard({
  action,
  character,
  roundTracker,
  onClick
}: CommonActionCardProps) {
  const actionPaths = getCommonActionPathStates(character, action, roundTracker);
  const isUnavailable = actionPaths.every((path) => path.disabledReason !== null);
  const hasAdditionalPathUses = actionPaths.some((path) => path.additionalUseCount > 0);
  const cardTheme = resolveActionCardTheme(action);

  return (
    <button
      type="button"
      className={clsx(
        actionCardStyles.button,
        actionCardStyles.actionCard,
        getActionCardThemeClassNames(cardTheme),
        isUnavailable && actionCardStyles.actionCardUnavailable,
        hasAdditionalPathUses && actionCardStyles.actionCardMulti,
        actionCardStyles.featureButton,
        action.isActive && actionCardStyles.featureButtonActive
      )}
      aria-disabled={isUnavailable}
      onClick={() => onClick(action)}
    >
      <ActionCardThemeTexture theme={cardTheme} />
      <span className={actionCardStyles.shapeBadgeRow} aria-hidden="true">
        {actionPaths.map((path) => {
          const actionShape = getActionShapeForEconomyType(path.economyType);

          if (!actionShape) {
            return null;
          }

          return (
            <span key={`${action.key}-${path.id}`} className={actionCardStyles.shapeBadgeMeta}>
              <span
                className={clsx(
                  actionCardStyles.shapeBadge,
                  path.id === "secondary" && actionCardStyles.shapeBadgeSecondary
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
                <span className={actionCardStyles.shapeBadgeCount}>{`x${path.totalUseCount}`}</span>
              ) : null}
            </span>
          );
        })}
      </span>
      <strong>{action.name}</strong>
      <span className={actionCardStyles.subheaderSlot}>
        {renderFeatureActionSubheader(action) ?? (
          <span className={actionCardStyles.subheaderPlaceholder} aria-hidden="true">
            &nbsp;
          </span>
        )}
      </span>
      <small
        className={clsx(
          actionCardStyles.breakdownRow,
          action.breakdownTone === "danger" && actionCardStyles.breakdownRowDanger
        )}
      >
        {action.breakdown ?? (action.isActive ? action.detail : action.summary)}
      </small>
    </button>
  );
}

export function CommonActionFooter({
  confirmLabel,
  actionPaths,
  onConfirmPath,
  diceSettings
}: CommonActionFooterProps) {
  return (
    <ActionFooterButtonRow settings={diceSettings ? (
      <DiceRollerSettingsButton {...diceSettings} className={actionStyles.weaponFooterIconButton} />
    ) : undefined}>
      {actionPaths.map((path) => {
        const actionShape = getActionShapeForEconomyType(path.economyType);

        if (!actionShape) {
          return null;
        }

        return (
          <ActionButton
            key={`common-action-${path.id}`}
            className={actionStyles.weaponFooterButton}
            onClick={() =>
              diceSettings ? onConfirmPath(path.economyType) : runWithActionConfirmationToast(path.economyType, () =>
                onConfirmPath(path.economyType)
              )
            }
            icon={diceSettings ? <img src={d20Icon} alt="" className={actionStyles.weaponFooterIcon} /> : undefined}
            disabled={path.disabledReason !== null}
            title={path.disabledReason ?? undefined}
            trailingBadge={
              <span className={actionStyles.footerActionShapeGroup}>
                <ActionShape
                  shape={actionShape}
                  isSelected={path.shapeState.isAvailable}
                  multiCount={path.shapeState.multiCount}
                  showMultiCountLabel={false}
                  className={actionStyles.footerActionShape}
                />
                {path.additionalUseCount > 0 ? (
                  <span className={actionStyles.footerActionCount}>{`x${path.totalUseCount}`}</span>
                ) : null}
              </span>
            }
          >
            {confirmLabel}
          </ActionButton>
        );
      })}
    </ActionFooterButtonRow>
  );
}
