import DescriptionContent from "../../../DescriptionContent/DescriptionContent";
import CellContainer from "../../../CellContainer/CellContainer";
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
};

type SkillReferenceDrawerProps = {
  reference: SelectedSkillReference;
  onClose: () => void;
};

function SkillReferenceDrawer({ reference, onClose }: SkillReferenceDrawerProps) {
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
    </SheetDrawer>
  );
}

export default SkillReferenceDrawer;
