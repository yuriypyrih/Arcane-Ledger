import { useId } from "react";
import type { Character } from "../../../../../../types";
import type { FeatureActionCard } from "../../../../../../pages/CharactersPage/classFeatures";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlayTitle,
  OverlayTitleRow,
  SheetModal
} from "../../../../../Overlay";
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import { CommonActionCard } from "./CommonAction";
import styles from "./CommonActionsModal.module.css";

type RoundTrackerAvailability = {
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
};

type CommonActionsModalProps = {
  character: Character;
  roundTracker: RoundTrackerAvailability;
  actions: readonly FeatureActionCard[];
  isActionDrawerOpen: boolean;
  onActionSelect: (action: FeatureActionCard) => void;
  onClose: () => void;
};

function CommonActionsModal({
  character,
  roundTracker,
  actions,
  isActionDrawerOpen,
  onActionSelect,
  onClose
}: CommonActionsModalProps) {
  const titleId = useId();

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      onEscape={isActionDrawerOpen ? () => undefined : onClose}
      backdropClassName={styles.backdrop}
      panelClassName={styles.panel}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>Gameplay</OverlayEyebrow>
          <OverlayTitleRow>
            <OverlayTitle id={titleId}>Common Actions</OverlayTitle>
          </OverlayTitleRow>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close common actions" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <p className={shared.helperText}>
          This list is here to help new players get familiar with common combat actions.
          Experienced players can skip it and manually adjust the round tracker when needed.
        </p>

        <div className={styles.grid}>
          {actions.map((action) => (
            <CommonActionCard
              key={action.key}
              action={action}
              character={character}
              roundTracker={roundTracker}
              onClick={onActionSelect}
            />
          ))}
        </div>
      </OverlayBody>
    </SheetModal>
  );
}

export default CommonActionsModal;
