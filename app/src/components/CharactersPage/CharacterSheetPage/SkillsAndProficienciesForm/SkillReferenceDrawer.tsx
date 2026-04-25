import ActionButton from "../../../ActionButton";
import d20Icon from "../../../../assets/svg/d20.svg";
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
  SheetDrawer,
  overlayClassNames
} from "../../../Overlay";
import type { FeatureIndicator } from "../../../../pages/CharactersPage/classFeatures";
import styles from "./SkillReferenceDrawer.module.css";

export type SkillReferenceDetailCard = {
  label: string;
  value: string;
};

export type SelectedSkillReference = {
  name: string;
  description: string;
  indicators?: FeatureIndicator[];
  detailCards?: SkillReferenceDetailCard[];
  rollModifier?: number;
  rollDescription?: string;
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
        <DescriptionContent
          description={[reference.description]}
          className={overlayClassNames.descriptionList}
          entryClassName={overlayClassNames.descriptionLine}
          strongClassName={overlayClassNames.descriptionStrong}
        />
        {reference.detailCards?.length ? (
          <OverlayDetailsGrid>
            {reference.detailCards.map((detailCard) => (
              <CellContainer
                key={`${reference.name}-${detailCard.label}`}
                label={detailCard.label}
                content={detailCard.value}
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
