import clsx from "clsx";
import sheetStyles from "../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import type {
  FeatureActionCardUsage,
  FeatureActionCardUsageCharges,
  FeatureActionCardUsageCost
} from "../../../pages/CharactersPage/classFeatures";
import { renderFeatureUsageIcon, type FeatureUsageIconOptions } from "./featureUsageIcons";

type FeatureUsageLabelProps = FeatureUsageIconOptions & {
  usage: FeatureActionCardUsage;
  usageKey: string;
  className?: string;
  chargesClassName?: string;
  textClassName?: string;
  operatorClassName?: string;
  dotsClassName?: string;
};

function renderFeatureUsageCost(
  usageKey: string,
  cost: FeatureActionCardUsageCost,
  { iconClassName, imageIconClassName, textClassName }: FeatureUsageLabelProps
) {
  const labelParts = ["Use", cost.amountText, cost.resourceLabel].filter(Boolean);

  return (
    <span className={textClassName}>
      {labelParts.map((part, index) => (
        <span key={`${usageKey}-cost-${index}`}>{part}</span>
      ))}
      {cost.icon
        ? renderFeatureUsageIcon(cost.icon, {
            iconClassName,
            imageIconClassName
          })
        : null}
    </span>
  );
}

function renderFeatureUsageCharges(
  usageKey: string,
  charges: FeatureActionCardUsageCharges,
  { chargesClassName, dotsClassName }: FeatureUsageLabelProps
) {
  const total = Math.max(0, Math.floor(charges.total));
  const current = Math.min(total, Math.max(0, Math.floor(charges.current)));

  return (
    <span className={chargesClassName}>
      <span>Charges</span>
      <span className={clsx(sheetStyles.shortRestDots, dotsClassName)}>
        {Array.from({ length: total }, (_, index) => (
          <span
            key={`${usageKey}-charge-${index}`}
            className={clsx(
              sheetStyles.shortRestDot,
              index < current && sheetStyles.shortRestDotActive
            )}
          />
        ))}
      </span>
    </span>
  );
}

function renderFeatureUsageOperator(operator: string, operatorClassName?: string) {
  return <span className={operatorClassName}>{operator}</span>;
}

function FeatureUsageLabel(props: FeatureUsageLabelProps) {
  const { usage, usageKey, className, operatorClassName } = props;

  switch (usage.mode) {
    case "free":
      return (
        <span className={className}>
          <span className={props.textClassName}>Free</span>
        </span>
      );
    case "text":
      return (
        <span className={className}>
          <span className={props.textClassName}>{usage.label}</span>
        </span>
      );
    case "named-resource":
      return (
        <span className={className}>{renderFeatureUsageCost(usageKey, usage.cost, props)}</span>
      );
    case "named-resource-or-resource":
      return (
        <span className={className}>
          {renderFeatureUsageCost(usageKey, usage.cost, props)}
          {renderFeatureUsageOperator("|", operatorClassName)}
          {renderFeatureUsageCost(`${usageKey}-fallback`, usage.fallbackCost, props)}
          {renderFeatureUsageOperator("instead", operatorClassName)}
        </span>
      );
    case "charges":
      return (
        <span className={className}>
          {renderFeatureUsageCharges(usageKey, usage.charges, props)}
        </span>
      );
    case "charges-and-resource":
      return (
        <span className={className}>
          {renderFeatureUsageCharges(usageKey, usage.charges, props)}
          {renderFeatureUsageOperator("&", operatorClassName)}
          {renderFeatureUsageCost(usageKey, usage.cost, props)}
        </span>
      );
    case "charges-or-resource":
      return (
        <span className={className}>
          {renderFeatureUsageCharges(usageKey, usage.charges, props)}
          {renderFeatureUsageOperator("|", operatorClassName)}
          {renderFeatureUsageCost(usageKey, usage.cost, props)}
          {renderFeatureUsageOperator("instead", operatorClassName)}
        </span>
      );
    default:
      return null;
  }
}

export default FeatureUsageLabel;
