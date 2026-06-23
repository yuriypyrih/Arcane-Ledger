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
import BuildSummaryCard from "./BuildSummaryCard";
import { getRepeatableFeatEntrySummary, groupFeatEntriesByFeat } from "./featEditorUtils";
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
          <BuildSummaryCard
            key={featDefinition.feat}
            title={featDefinition.label}
            meta={featMetaLabel}
            summary={isRepeatable ? null : featSummary}
            selectedItems={
              isRepeatable
                ? entries.map((entry) => getRepeatableFeatEntrySummary(entry))
                : undefined
            }
            isRepeatable={isRepeatable}
            onClick={() => onOpenFeatReference(featDefinition.feat)}
            headerActions={renderTrackingButton(
              getFeatureTrackingState(featDefinition),
              featDefinition.trackingMessage
            )}
          />
        );
      })}
    </ul>
  );
}

export default FeatList;
