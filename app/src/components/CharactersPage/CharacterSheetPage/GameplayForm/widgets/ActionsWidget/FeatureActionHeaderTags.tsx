import clsx from "clsx";
import type { FeatureActionFact, FeatureActionHeaderTag } from "../../../../../../pages/CharactersPage/classFeatures";
import { renderFeatureUsageIcon } from "../../../featureUsageIcons";
import sheetStyles from "../../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./GameplayActionDrawer.module.css";

type FeatureActionHeaderTagsProps = {
  tags: FeatureActionHeaderTag[];
  tagKeyPrefix: string;
};

function getToneClassName(tone: FeatureActionFact["tone"]) {
  if (tone === "danger") {
    return styles.resourceBadgeValueDanger;
  }

  if (tone === "accent") {
    return styles.resourceBadgeValueAccent;
  }

  return "";
}

function FeatureActionHeaderTags({ tags, tagKeyPrefix }: FeatureActionHeaderTagsProps) {
  return tags.map((tag, index) => {
    const key = `${tagKeyPrefix}-${tag.kind}-${index}`;

    if (tag.kind === "charges") {
      const total = Math.max(0, Math.floor(tag.charges.total));
      const current = Math.min(total, Math.max(0, Math.floor(tag.charges.current)));

      return (
        <span key={key} className={styles.resourceBadge}>
          <span>Charges</span>
          <span className={sheetStyles.shortRestDots}>
            {Array.from({ length: total }, (_, dotIndex) => (
              <span
                key={`${key}-dot-${dotIndex}`}
                className={clsx(
                  sheetStyles.shortRestDot,
                  dotIndex < current && sheetStyles.shortRestDotActive
                )}
              />
            ))}
          </span>
          {tag.supplementaryText ? (
            <span className={styles.resourceBadgeSupplementary}>{tag.supplementaryText}</span>
          ) : null}
        </span>
      );
    }

    if (tag.kind === "usage") {
      const usageParts = ["Use", tag.cost.amountText, tag.cost.resourceLabel].filter(Boolean);

      return (
        <span key={key} className={styles.resourceBadge}>
          <span className={styles.resourceBadgeValue}>
            {usageParts.map((part, partIndex) => (
              <span key={`${key}-usage-${partIndex}`}>{part}</span>
            ))}
            {renderFeatureUsageIcon(tag.cost.icon, {
              iconClassName: styles.resourceBadgeIcon,
              imageIconClassName: styles.resourceAssetIcon
            })}
            <span>out of</span>
            <span>{`${tag.pool.current}/${tag.pool.total}`}</span>
            {tag.pool.label ? <span>{tag.pool.label}</span> : null}
            {renderFeatureUsageIcon(tag.pool.icon, {
              iconClassName: styles.resourceBadgeIcon,
              imageIconClassName: styles.resourceAssetIcon
            })}
            {tag.isFallback ? <span>instead</span> : null}
          </span>
        </span>
      );
    }

    return (
      <span key={key} className={styles.resourceBadge}>
        <span className={styles.resourceBadgeLabel}>{tag.label}</span>
        <span
          className={clsx(styles.resourceBadgeValue, getToneClassName(tag.tone))}
        >
          <span>{tag.value}</span>
          {renderFeatureUsageIcon(tag.icon, {
            iconClassName: styles.resourceBadgeIcon,
            imageIconClassName: styles.resourceAssetIcon
          })}
        </span>
      </span>
    );
  });
}

export default FeatureActionHeaderTags;
