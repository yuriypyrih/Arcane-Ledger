import type { ReactNode } from "react";
import ActionShape from "../../../../ActionShape";
import type { ReactionEntry } from "../../../../../codex/entries";
import type { FeatureActionResource } from "../../../../../pages/CharactersPage/classFeatures";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import GameplayActionDrawer from "./GameplayActionDrawer";
import styles from "./ReactionEntryDrawer.module.css";

type ReactionEntryDrawerProps = {
  reaction: ReactionEntry;
  actionWarning: string | null;
  headerBadges?: string[];
  headerResources?: FeatureActionResource[];
  resourceSummary?: string | null;
  customContent?: ReactNode;
  onCast: () => void;
  onClose: () => void;
};

function ReactionEntryDrawer({
  reaction,
  actionWarning,
  headerBadges = [],
  headerResources = [],
  resourceSummary = null,
  customContent = null,
  onCast,
  onClose
}: ReactionEntryDrawerProps) {
  return (
    <GameplayActionDrawer
      title={reaction.name}
      eyebrow="Reaction"
      badges={headerBadges}
      resources={headerResources}
      description={reaction.description}
      descriptionAdditions={reaction.descriptionAdditions}
      warning={actionWarning}
      footer={
        <div className={styles.footerActions}>
          {resourceSummary ? <p className={styles.castActionResource}>{resourceSummary}</p> : null}
          <button
            type="button"
            className={[sheetStyles.castButton, styles.castActionButton].join(" ")}
            onClick={onCast}
            disabled={actionWarning !== null}
          >
            <span className={styles.castActionButtonContent}>
              <span>Take Reaction</span>
              <ActionShape
                shape="reaction"
                isSelected={actionWarning === null}
                className={styles.castActionShape}
                aria-label="Reaction action state"
              />
            </span>
          </button>
        </div>
      }
      onClose={onClose}
    >
      {customContent}
    </GameplayActionDrawer>
  );
}

export default ReactionEntryDrawer;
