import clsx from "clsx";
import type { Dispatch, SetStateAction } from "react";
import { FEAT_CATEGORY, FEATS, type SpellEntry } from "../../../../codex/entries";
import {
  getFeatCategoryLabel,
  type FeatDefinition
} from "../../../../pages/CharactersPage/feats";
import type { CharacterFeatEntry } from "../../../../types";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayEyebrow,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  SheetModal
} from "../../../Overlay";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import FeatEditorCard from "./FeatEditorCard";
import styles from "./FeatEditorModal.module.css";
import type {
  FeatEditorContext,
  PendingFeatState,
  TrackingButtonRenderer
} from "./types";

type FeatEditorModalProps = {
  context: FeatEditorContext;
  activeFeatCategory: FEAT_CATEGORY;
  visibleFeatCategories: FEAT_CATEGORY[];
  visibleFeatDefinitionsByCategory: Record<FEAT_CATEGORY, FeatDefinition[]>;
  selectedFeats: CharacterFeatEntry[];
  pendingFeatState: PendingFeatState;
  blessedWarriorCantripOptions: SpellEntry[];
  druidicWarriorCantripOptions: SpellEntry[];
  onClose: () => void;
  onSelectCategory: (category: FEAT_CATEGORY) => void;
  onAddFeat: (feat: FEATS) => void;
  onRemoveFeat: (entry: CharacterFeatEntry) => void;
  onOpenFeatReference: (feat: FEATS) => void;
  onPendingFeatStateChange: Dispatch<SetStateAction<PendingFeatState>>;
  renderTrackingButton: TrackingButtonRenderer;
  onSavePendingAbilityScoreImprovement: () => void;
  onSavePendingBoonOfIrresistibleOffense: () => void;
  onSavePendingBlessedWarriorChoice: () => void;
  onSavePendingDruidicWarriorChoice: () => void;
  onSavePendingEpicBoonAbilityChoice: () => void;
  onSavePendingSkilledChoice: () => void;
};

function FeatEditorModal({
  context,
  activeFeatCategory,
  visibleFeatCategories,
  visibleFeatDefinitionsByCategory,
  selectedFeats,
  pendingFeatState,
  blessedWarriorCantripOptions,
  druidicWarriorCantripOptions,
  onClose,
  onSelectCategory,
  onAddFeat,
  onRemoveFeat,
  onOpenFeatReference,
  onPendingFeatStateChange,
  renderTrackingButton,
  onSavePendingAbilityScoreImprovement,
  onSavePendingBoonOfIrresistibleOffense,
  onSavePendingBlessedWarriorChoice,
  onSavePendingDruidicWarriorChoice,
  onSavePendingEpicBoonAbilityChoice,
  onSavePendingSkilledChoice
}: FeatEditorModalProps) {
  return (
    <SheetModal
      titleId="character-feat-editor-title"
      onClose={onClose}
      panelClassName={styles.modalPanel}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>{context.mode === "class-feature" ? "Class Feature" : "Build"}</OverlayEyebrow>
          <div className={styles.heading}>
            <h3 id="character-feat-editor-title" className={styles.headingTitle}>
              {context.mode === "class-feature" ? "Choose Feat" : "Edit Feats"}
            </h3>
            <OverlaySummary className={shared.helperText}>
              {context.mode === "class-feature"
                ? "Choose one feat for this class feature. Your selection will be applied immediately."
                : "Always choose the appropriate feats based on your class features or your DM's instructions."}
            </OverlaySummary>
          </div>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close feat editor" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.scrollArea}>
        <div className={styles.tabRow} role="tablist" aria-label="Feat categories">
          {visibleFeatCategories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeFeatCategory === category}
              className={clsx(
                styles.tabButton,
                activeFeatCategory === category && styles.tabButtonActive
              )}
              onClick={() => onSelectCategory(category)}
            >
              {getFeatCategoryLabel(category)}
            </button>
          ))}
        </div>

        <div className={styles.optionList}>
          {visibleFeatDefinitionsByCategory[activeFeatCategory].map((featDefinition) => (
            <FeatEditorCard
              key={featDefinition.feat}
              featDefinition={featDefinition}
              selectedEntries={selectedFeats.filter((entry) => entry.feat === featDefinition.feat)}
              pendingFeatState={pendingFeatState}
              blessedWarriorCantripOptions={blessedWarriorCantripOptions}
              druidicWarriorCantripOptions={druidicWarriorCantripOptions}
              renderTrackingButton={renderTrackingButton}
              onOpenFeatReference={onOpenFeatReference}
              onAddFeat={onAddFeat}
              onRemoveFeat={onRemoveFeat}
              onPendingFeatStateChange={onPendingFeatStateChange}
              onSavePendingAbilityScoreImprovement={onSavePendingAbilityScoreImprovement}
              onSavePendingBoonOfIrresistibleOffense={onSavePendingBoonOfIrresistibleOffense}
              onSavePendingBlessedWarriorChoice={onSavePendingBlessedWarriorChoice}
              onSavePendingDruidicWarriorChoice={onSavePendingDruidicWarriorChoice}
              onSavePendingEpicBoonAbilityChoice={onSavePendingEpicBoonAbilityChoice}
              onSavePendingSkilledChoice={onSavePendingSkilledChoice}
            />
          ))}
        </div>
      </OverlayBody>
    </SheetModal>
  );
}

export default FeatEditorModal;
