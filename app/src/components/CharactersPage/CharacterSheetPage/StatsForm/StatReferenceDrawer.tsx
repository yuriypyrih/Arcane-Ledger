import clsx from "clsx";
import type { ReactNode } from "react";
import type { SpellDescriptionEntry } from "../../../../codex/entries";
import CellContainer from "../../../CellContainer/CellContainer";
import DescriptionContent from "../../../DescriptionContent/DescriptionContent";
import RollStatePill from "../../../RollStatePill/RollStatePill";
import {
  formatResolvedRollStateDetailText,
  resolveFeatureIndicators
} from "../../../RollStatePill/rollState";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayDetailsGrid,
  OverlayEyebrow,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetDrawer
} from "../../../Overlay";
import type { FeatureIndicator } from "../../../../pages/CharactersPage/classFeatures";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./StatsForm.module.css";

export type ReferenceIndicatorSection = {
  label?: string;
  indicators: FeatureIndicator[];
};

export type ReferenceDetailCard = {
  label: string;
  value: string;
  breakdown?: ReactNode;
  variant?: "default" | "formula";
};

export type SelectedStatReference = {
  keyword: string;
  summaryText?: string;
  warning?: string | null;
  rollIndicators?: FeatureIndicator[];
  rollActions?: {
    label: string;
    actionName: string;
    mod: {
      title: string;
      modifier: number;
      description: string;
      indicators?: FeatureIndicator[];
    };
    save: {
      title: string;
      modifier: number;
      description: string;
      indicators?: FeatureIndicator[];
    };
  };
  descriptionAdditions?: SpellDescriptionEntry[][];
  descriptionItems?: Array<{
    label: string;
    text: string;
  }>;
  detailCards?: ReferenceDetailCard[];
  indicatorSections?: ReferenceIndicatorSection[];
};

type StatReferenceDrawerProps = {
  reference: SelectedStatReference;
  footer?: ReactNode;
  onClose: () => void;
};

function StatReferenceDrawer({ reference, footer = null, onClose }: StatReferenceDrawerProps) {
  const descriptionSections =
    reference.descriptionAdditions?.filter((section) => section.length > 0) ?? [];
  const hasBaseDescriptionContent =
    Boolean(reference.summaryText) || Boolean(reference.descriptionItems?.length);
  const hasDescriptionContent = hasBaseDescriptionContent || descriptionSections.length > 0;
  const hasDetails = Boolean(reference.detailCards?.length);

  return (
    <SheetDrawer titleId="character-stats-reference-title" onClose={onClose} onEscape={onClose}>
      <OverlayHeader className={styles.referenceDrawerHeader}>
        <OverlayHeaderContent>
          <OverlayEyebrow>Reference</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id="character-stats-reference-title">{reference.keyword}</OverlayTitle>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        {reference.indicatorSections?.length ? (
          <div className={styles.referenceIndicatorStack}>
            {reference.indicatorSections.map((section, index) => {
              const rollState = resolveFeatureIndicators(section.indicators);

              if (!rollState) {
                return null;
              }

              return (
                <div
                  key={`${reference.keyword}-${section.label ?? "shared"}-${index}`}
                  className={styles.referenceIndicatorSection}
                >
                  {section.label ? (
                    <span className={styles.referenceIndicatorSectionLabel}>{section.label}</span>
                  ) : null}
                  <RollStatePill
                    tone={rollState.tone}
                    label={rollState.label}
                    detailText={formatResolvedRollStateDetailText(rollState)}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
        <OverlayCloseButton label="Close stats details" onClick={onClose} />
      </OverlayHeader>

      {hasDescriptionContent || hasDetails ? (
        <OverlayBody>
          {hasDescriptionContent ? (
            <div className={sheetStyles.spellDrawerDescriptionSection}>
              <div className={sheetStyles.spellDrawerDescriptionStack}>
                {reference.summaryText ? (
                  <DescriptionContent
                    description={[reference.summaryText]}
                    className={clsx(
                      sheetStyles.spellDrawerDescriptionList,
                      sheetStyles.spellDrawerDescriptionSection
                    )}
                    entryClassName={sheetStyles.spellDrawerDescriptionLine}
                    strongClassName={sheetStyles.spellDrawerDescriptionStrong}
                  />
                ) : null}
                {reference.descriptionItems?.length ? (
                  <ul className={styles.referenceDescriptionList}>
                    {reference.descriptionItems.map((item) => (
                      <li
                        key={`${reference.keyword}-${item.label}`}
                        className={styles.referenceDescriptionItem}
                      >
                        <strong>{item.label}</strong>: {item.text}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {descriptionSections.map((section, index) => (
                  <div
                    key={`${reference.keyword}-description-addition-${index}`}
                    className={sheetStyles.spellDrawerDescriptionAdditionSection}
                  >
                    {hasBaseDescriptionContent || index > 0 ? (
                      <hr
                        className={sheetStyles.spellDrawerDescriptionDivider}
                        aria-hidden="true"
                      />
                    ) : null}
                    <DescriptionContent
                      description={section}
                      className={clsx(
                        sheetStyles.spellDrawerDescriptionList,
                        sheetStyles.spellDrawerDescriptionSection
                      )}
                      entryClassName={sheetStyles.spellDrawerDescriptionLine}
                      strongClassName={sheetStyles.spellDrawerDescriptionStrong}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {hasDetails ? (
            <OverlayDetailsGrid className={styles.referenceDetailStack}>
              {reference.detailCards?.map((detailCard) => (
                <CellContainer
                  key={`${reference.keyword}-${detailCard.label}`}
                  label={detailCard.label}
                  content={detailCard.value}
                  breakdown={detailCard.breakdown}
                  className={
                    detailCard.variant === "formula" ? styles.referenceFormulaCard : undefined
                  }
                  contentRowClassName={
                    detailCard.variant === "formula" ? styles.referenceFormulaContentRow : undefined
                  }
                  contentClassName={
                    detailCard.variant === "formula" ? styles.referenceFormulaValue : undefined
                  }
                  breakdownClassName={
                    detailCard.variant === "formula"
                      ? styles.referenceFormulaBreakdown
                      : undefined
                  }
                />
              ))}
            </OverlayDetailsGrid>
          ) : null}
        </OverlayBody>
      ) : null}

      {reference.warning || footer ? (
        <OverlayFooter className={styles.referenceFooter}>
          {reference.warning ? (
            <div className={styles.referenceWarningBlock}>
              <p className={styles.referenceWarningCard}>{reference.warning}</p>
            </div>
          ) : null}
          {footer}
        </OverlayFooter>
      ) : null}
    </SheetDrawer>
  );
}

export default StatReferenceDrawer;
