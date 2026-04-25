import type { ReactNode } from "react";
import ActionButton from "../../../../../ActionButton";
import ActionShape from "../../../../../ActionShape";
import type { ReactionEntry } from "../../../../../../codex/entries";
import type {
  FeatureActionFact,
  FeatureActionHeaderTag
} from "../../../../../../pages/CharactersPage/classFeatures";
import GameplayActionDrawer from "../GameplayActionDrawer";
import styles from "./ReactionEntryDrawer.module.css";

type ReactionEntryDrawerProps = {
  reaction: ReactionEntry;
  actionWarning: string | null;
  actionShapeAvailable?: boolean;
  headerBadges?: string[];
  headerTags?: FeatureActionHeaderTag[];
  facts?: FeatureActionFact[];
  factsSectionTitle?: string | null;
  resourceSummary?: string | null;
  customContent?: ReactNode;
  footerContent?: ReactNode;
  onCast: () => void;
  onClose: () => void;
};

function ReactionEntryDrawer({
  reaction,
  actionWarning,
  actionShapeAvailable = actionWarning === null,
  headerBadges = [],
  headerTags = [],
  facts = [],
  factsSectionTitle = "Details",
  resourceSummary = null,
  customContent = null,
  footerContent = null,
  onCast,
  onClose
}: ReactionEntryDrawerProps) {
  return (
    <GameplayActionDrawer
      title={reaction.name}
      eyebrow="Reaction"
      badges={headerBadges}
      headerTags={headerTags}
      description={reaction.description}
      descriptionAdditions={reaction.descriptionAdditions}
      facts={facts}
      factsSectionTitle={factsSectionTitle}
      warning={actionWarning}
      footer={
        <div className={styles.footerActions}>
          {resourceSummary ? <p className={styles.castActionResource}>{resourceSummary}</p> : null}
          {footerContent ?? (
            <ActionButton
              className={styles.castActionButton}
              onClick={onCast}
              disabled={actionWarning !== null}
              trailingBadge={
                <ActionShape
                  shape="reaction"
                  isSelected={actionShapeAvailable}
                  className={styles.castActionShape}
                  aria-label="Reaction action state"
                />
              }
            >
              Take Reaction
            </ActionButton>
          )}
        </div>
      }
      onClose={onClose}
    >
      {customContent}
    </GameplayActionDrawer>
  );
}

export default ReactionEntryDrawer;
