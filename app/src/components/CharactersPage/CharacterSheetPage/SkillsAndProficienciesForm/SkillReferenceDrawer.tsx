import clsx from "clsx";
import type { ReactNode } from "react";
import ActionButton from "../../../ActionButton";
import d20Icon from "../../../../assets/svg/d20.svg";
import type { SpellDescriptionEntry } from "../../../../codex/entries";
import DescriptionContent from "../../../DescriptionContent/DescriptionContent";
import CellContainer from "../../../CellContainer/CellContainer";
import DiceRollerSettingsButton from "../GameplayForm/widgets/DiceRollerSettingsButton";
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
import styles from "./SkillReferenceDrawer.module.css";

export type SkillReferenceDetailCard = {
  label: string;
  value: ReactNode;
  breakdown?: ReactNode;
  variant?: "default" | "formula";
};

export type SelectedSkillReference = {
  name: string;
  description: string;
  additionalDescription?: SpellDescriptionEntry[];
  descriptionAdditions?: SpellDescriptionEntry[][];
  indicators?: FeatureIndicator[];
  detailCards?: SkillReferenceDetailCard[];
  rollModifier?: number;
  rollDescription?: string;
  rollFormula?: string;
  rollFormulaDisplay?: string;
};

type SkillReferenceDrawerProps = {
  reference: SelectedSkillReference;
  rollAction?: {
    onRoll: () => void;
    isDiceRollerSettingsOpen: boolean;
    onDiceRollerSettingsOpenChange: (isOpen: boolean) => void;
  };
  onClose: () => void;
};

function SkillReferenceDrawer({ reference, rollAction, onClose }: SkillReferenceDrawerProps) {
  const rollState = resolveFeatureIndicators(reference.indicators);
  const descriptionSections =
    reference.descriptionAdditions?.filter((section) => section.length > 0) ?? [];
  const additionalDescription = reference.additionalDescription?.filter(Boolean) ?? [];
  const injectedDescriptionSections = [
    ...(additionalDescription.length > 0 ? [additionalDescription] : []),
    ...descriptionSections
  ];

  return (
    <SheetDrawer titleId="character-skill-reference-title" onClose={onClose} onEscape={onClose}>
      <OverlayHeader className={styles.header}>
        <OverlayHeaderContent>
          <OverlayEyebrow>Reference</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id="character-skill-reference-title">{reference.name}</OverlayTitle>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        {rollState ? (
          <div className={styles.indicatorStack}>
            <RollStatePill
              tone={rollState.tone}
              label={rollState.label}
              detailText={formatResolvedRollStateDetailText(rollState)}
            />
          </div>
        ) : null}
        <OverlayCloseButton label="Close skill details" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <div className={sheetStyles.spellDrawerDescriptionSection}>
          <div className={sheetStyles.spellDrawerDescriptionStack}>
            <DescriptionContent
              description={[reference.description]}
              className={clsx(
                sheetStyles.spellDrawerDescriptionList,
                sheetStyles.spellDrawerDescriptionSection
              )}
              entryClassName={sheetStyles.spellDrawerDescriptionLine}
              strongClassName={sheetStyles.spellDrawerDescriptionStrong}
            />
            {injectedDescriptionSections.map((section, index) => (
              <div
                key={`${reference.name}-description-addition-${index}`}
                className={sheetStyles.spellDrawerDescriptionAdditionSection}
              >
                <hr className={sheetStyles.spellDrawerDescriptionDivider} aria-hidden="true" />
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
        {reference.detailCards?.length ? (
          <OverlayDetailsGrid className={styles.detailStack}>
            {reference.detailCards.map((detailCard) => (
              <CellContainer
                key={`${reference.name}-${detailCard.label}`}
                label={detailCard.label}
                content={detailCard.value}
                breakdown={detailCard.breakdown}
                className={detailCard.variant === "formula" ? styles.formulaCard : undefined}
                contentRowClassName={
                  detailCard.variant === "formula" ? styles.formulaContentRow : undefined
                }
                contentClassName={
                  detailCard.variant === "formula" ? styles.formulaValue : undefined
                }
                breakdownClassName={
                  detailCard.variant === "formula" ? styles.formulaBreakdown : undefined
                }
              />
            ))}
          </OverlayDetailsGrid>
        ) : null}
      </OverlayBody>

      {rollAction ? (
        <OverlayFooter className={styles.footer}>
          <div className={styles.footerActions}>
            <ActionButton
              className={styles.rollButton}
              onClick={rollAction.onRoll}
              icon={<img src={d20Icon} alt="" className={styles.rollButtonIcon} />}
            >
              Roll
            </ActionButton>
            <DiceRollerSettingsButton
              actionName={reference.name}
              className={styles.settingsButton}
              isOpen={rollAction.isDiceRollerSettingsOpen}
              onOpenChange={rollAction.onDiceRollerSettingsOpenChange}
            />
          </div>
        </OverlayFooter>
      ) : null}
    </SheetDrawer>
  );
}

export default SkillReferenceDrawer;
