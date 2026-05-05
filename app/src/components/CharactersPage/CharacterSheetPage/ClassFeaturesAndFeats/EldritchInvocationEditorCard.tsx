import clsx from "clsx";
import { Plus, X } from "lucide-react";
import { TRACKER } from "../../../../codex/entries";
import type { WarlockEldritchInvocationOption } from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import cardStyles from "./FeatCards.module.css";
import modalStyles from "./FeatEditorModal.module.css";
import { triggerActionOnEnterOrSpace } from "./featEditorUtils";
import type { TrackingButtonRenderer } from "./types";

type EldritchInvocationEditorCardProps = {
  option: WarlockEldritchInvocationOption;
  isSelected: boolean;
  isLimitReached: boolean;
  blockingSelectionNames: string[];
  onAddInvocation: (selectionId: string) => void;
  onRemoveInvocation: (selectionId: string) => void;
  onOpenInvocationReference: (option: WarlockEldritchInvocationOption) => void;
  renderTrackingButton: TrackingButtonRenderer;
};

function EldritchInvocationEditorCard({
  option,
  isSelected,
  isLimitReached,
  blockingSelectionNames,
  onAddInvocation,
  onRemoveInvocation,
  onOpenInvocationReference,
  renderTrackingButton
}: EldritchInvocationEditorCardProps) {
  const isRepeatable = Boolean(option.invocation.repeatable);
  const isRequirementBlocked = option.isPlaceholder || !option.isQualified;
  const isAddDisabled = isSelected || isRequirementBlocked || isLimitReached;
  const isRemoveDisabled = blockingSelectionNames.length > 0;
  const addTitle = option.isPlaceholder
    ? (option.displaySubtitle ?? undefined)
    : !option.isQualified
      ? option.requirementLabel
      : isLimitReached
        ? "You have selected all available invocations."
        : undefined;
  const removeTitle = isRemoveDisabled
    ? `Required by ${blockingSelectionNames.join(", ")}.`
    : undefined;

  return (
    <article
      className={clsx(
        cardStyles.card,
        cardStyles.interactiveCard,
        isSelected && cardStyles.selectedCard,
        isRequirementBlocked && cardStyles.unavailableCard
      )}
      role="button"
      tabIndex={0}
      onClick={() => onOpenInvocationReference(option)}
      onKeyDown={(event) =>
        triggerActionOnEnterOrSpace(event, () => onOpenInvocationReference(option))
      }
    >
      <div className={cardStyles.headerRow}>
        <div className={modalStyles.optionTitleBlock}>
          <span className={cardStyles.title}>{option.displayName}</span>
          {isRepeatable ? <span className={cardStyles.repeatable}>(repeatable)</span> : null}
        </div>
        <div className={cardStyles.headerActions}>
          {renderTrackingButton(TRACKER.NOT_TRACKED)}
        </div>
      </div>
      <p
        className={clsx(cardStyles.meta, isRequirementBlocked && cardStyles.metaUnavailable)}
      >{`Prerequisite: ${option.requirementLabel}`}</p>
      {option.displaySubtitle ? <p className={cardStyles.summary}>{option.displaySubtitle}</p> : null}
      <div className={modalStyles.footer}>
        {!isSelected ? (
          <button
            type="button"
            className={clsx(shared.editButton, modalStyles.addButton)}
            disabled={isAddDisabled}
            title={addTitle}
            onClick={(event) => {
              event.stopPropagation();
              onAddInvocation(option.selectionId);
            }}
          >
            <Plus size={16} />
            {isAddDisabled && isSelected ? "Added" : "Add"}
          </button>
        ) : (
          <button
            type="button"
            className={clsx(shared.editButton, modalStyles.removeActionButton)}
            disabled={isRemoveDisabled}
            title={removeTitle}
            onClick={(event) => {
              event.stopPropagation();
              onRemoveInvocation(option.selectionId);
            }}
          >
            <X size={16} />
            Remove
          </button>
        )}
      </div>
    </article>
  );
}

export default EldritchInvocationEditorCard;
