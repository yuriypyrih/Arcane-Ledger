import clsx from "clsx";
import { getFeatureTrackingState, type FEATS } from "../../../../codex/entries";
import {
  getCharacterFeatSourceLabel,
  getCharacterFeatSummary,
  getFeatCategoryLabel,
  getFeatDefinition
} from "../../../../pages/CharactersPage/feats";
import type { CharacterFeatEntry } from "../../../../types";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import cardStyles from "./FeatCards.module.css";
import {
  getRepeatableFeatEntrySummary,
  groupFeatEntriesByFeat,
  triggerActionOnEnterOrSpace
} from "./featEditorUtils";
import type { TrackingButtonRenderer } from "./types";

type FeatListProps = {
  feats: CharacterFeatEntry[];
  emptyText?: string;
  onOpenFeatReference: (feat: FEATS) => void;
  renderTrackingButton: TrackingButtonRenderer;
};

function FeatList({
  feats,
  emptyText = "No feats added yet.",
  onOpenFeatReference,
  renderTrackingButton
}: FeatListProps) {
  if (feats.length === 0) {
    return <p className={shared.emptyText}>{emptyText}</p>;
  }

  return (
    <ul className={cardStyles.list}>
      {groupFeatEntriesByFeat(feats).map(({ feat, entries }) => {
        const featDefinition = getFeatDefinition(feat);

        if (!featDefinition) {
          return null;
        }

        const isRepeatable = Boolean(featDefinition.repeatable);
        const firstEntry = entries[0];
        const featSummary = firstEntry ? getCharacterFeatSummary(firstEntry) : null;
        const featMetaLabel = firstEntry
          ? isRepeatable
            ? getFeatCategoryLabel(featDefinition.category)
            : `${getFeatCategoryLabel(featDefinition.category)} • ${getCharacterFeatSourceLabel(firstEntry)}`
          : getFeatCategoryLabel(featDefinition.category);

        return (
          <li
            key={featDefinition.feat}
            className={clsx(cardStyles.card, cardStyles.interactiveCard)}
            role="button"
            tabIndex={0}
            onClick={() => onOpenFeatReference(featDefinition.feat)}
            onKeyDown={(event) =>
              triggerActionOnEnterOrSpace(event, () => onOpenFeatReference(featDefinition.feat))
            }
          >
            <div className={cardStyles.headerRow}>
              <div className={cardStyles.titleBlock}>
                <span className={cardStyles.title}>{featDefinition.label}</span>
                {isRepeatable ? (
                  <>
                    {" "}
                    <span className={cardStyles.repeatable}>(repeatable)</span>
                  </>
                ) : null}
              </div>
              <div className={cardStyles.headerActions}>
                {renderTrackingButton(getFeatureTrackingState(featDefinition))}
              </div>
            </div>
            <p className={cardStyles.meta}>{featMetaLabel}</p>
            {isRepeatable ? (
              <ul className={cardStyles.selectedList}>
                {entries.map((entry) => (
                  <li key={entry.id} className={cardStyles.selectedItem}>
                    <span className={cardStyles.selectedText}>
                      {getRepeatableFeatEntrySummary(entry)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : featSummary ? (
              <p className={cardStyles.summary}>{featSummary}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export default FeatList;
