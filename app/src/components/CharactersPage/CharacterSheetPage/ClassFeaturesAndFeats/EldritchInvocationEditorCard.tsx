import clsx from "clsx";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { TRACKER } from "../../../../codex/entries";
import type { WarlockEldritchInvocationOption } from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import ActionButton from "../../../ActionButton";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import cardStyles from "./FeatCards.module.css";
import modalStyles from "./FeatEditorModal.module.css";
import { InlineEditorFrame, SelectField } from "./FeatEditorPrimitives";
import { triggerActionOnEnterOrSpace } from "./featEditorUtils";
import type { TrackingButtonRenderer } from "./types";

type EldritchInvocationEditorCardProps = {
  options: WarlockEldritchInvocationOption[];
  selectedOptions: WarlockEldritchInvocationOption[];
  isLimitReached: boolean;
  getBlockingSelectionNames: (selectionId: string) => string[];
  onAddInvocation: (selectionId: string) => void;
  onRemoveInvocation: (selectionId: string) => void;
  onOpenInvocationReference: (option: WarlockEldritchInvocationOption) => void;
  renderTrackingButton: TrackingButtonRenderer;
};

function getChoiceLabel(option: WarlockEldritchInvocationOption): string {
  return option.displaySubtitle ?? option.displayName;
}

function getSelectionLabel(option: WarlockEldritchInvocationOption): string {
  switch (option.invocation.selection?.kind) {
    case "origin-feat":
      return "Origin feat";
    case "warlock-cantrip":
      return "Cantrip";
    default:
      return "Choice";
  }
}

function EldritchInvocationEditorCard({
  options,
  selectedOptions,
  isLimitReached,
  getBlockingSelectionNames,
  onAddInvocation,
  onRemoveInvocation,
  onOpenInvocationReference,
  renderTrackingButton
}: EldritchInvocationEditorCardProps) {
  const option = options[0];
  const [isChoiceEditorOpen, setIsChoiceEditorOpen] = useState(false);
  const [draftSelectionId, setDraftSelectionId] = useState("");
  const selectedSelectionIdSet = useMemo(
    () => new Set(selectedOptions.map((selectedOption) => selectedOption.selectionId)),
    [selectedOptions]
  );

  if (!option) {
    return null;
  }

  const isRepeatable = Boolean(option.invocation.repeatable);
  const isSelected = selectedOptions.length > 0;
  const hasSelection = Boolean(option.invocation.selection);
  const choiceOptions = options.filter((currentOption) => !currentOption.isPlaceholder);
  const selectedOption = selectedOptions[0] ?? null;
  const selectedChoiceOption = hasSelection
    ? options.find((currentOption) => currentOption.selectionId === draftSelectionId) ?? null
    : option;
  const hasAvailableChoiceOptions = choiceOptions.length > 0;
  const isRequirementBlocked = options.every(
    (currentOption) => currentOption.isPlaceholder || !currentOption.isQualified
  );
  const isChoiceSaveDisabled =
    !selectedChoiceOption ||
    selectedChoiceOption.isPlaceholder ||
    !selectedChoiceOption.isQualified ||
    selectedSelectionIdSet.has(selectedChoiceOption.selectionId);
  const isAddButtonDisabled =
    (!isRepeatable && isSelected) ||
    isLimitReached ||
    isRequirementBlocked ||
    (hasSelection && !hasAvailableChoiceOptions);
  const addTitle = isRequirementBlocked
    ? option.requirementLabel
    : hasSelection && !hasAvailableChoiceOptions
      ? (option.displaySubtitle ?? undefined)
      : isLimitReached
        ? "You have selected all available invocations."
        : undefined;
  const nonRepeatableBlockingSelectionNames = selectedOption
    ? getBlockingSelectionNames(selectedOption.selectionId)
    : [];
  const isRemoveDisabled = nonRepeatableBlockingSelectionNames.length > 0;
  const removeTitle = isRemoveDisabled
    ? `Required by ${nonRepeatableBlockingSelectionNames.join(", ")}.`
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
      {hasSelection && !hasAvailableChoiceOptions ? (
        <p className={cardStyles.summary}>{option.displaySubtitle}</p>
      ) : !hasSelection && option.displaySubtitle ? (
        <p className={cardStyles.summary}>{option.displaySubtitle}</p>
      ) : null}
      {isRepeatable && selectedOptions.length > 0 ? (
        <ul className={cardStyles.selectedList}>
          {selectedOptions.map((currentOption) => {
            const blockingSelectionNames = getBlockingSelectionNames(currentOption.selectionId);
            const isSelectedRemoveDisabled = blockingSelectionNames.length > 0;

            return (
              <li key={currentOption.selectionId} className={cardStyles.selectedItem}>
                <span className={cardStyles.selectedText}>{getChoiceLabel(currentOption)}</span>
                <button
                  type="button"
                  className={cardStyles.selectedRemoveButton}
                  disabled={isSelectedRemoveDisabled}
                  title={
                    isSelectedRemoveDisabled
                      ? `Required by ${blockingSelectionNames.join(", ")}.`
                      : undefined
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveInvocation(currentOption.selectionId);
                  }}
                  aria-label={`Remove ${currentOption.displayName}`}
                >
                  <X size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {isChoiceEditorOpen ? (
        <InlineEditorFrame
          title={option.displayName}
          cancelLabel={`Cancel ${option.displayName} selection`}
          onCancel={() => {
            setDraftSelectionId("");
            setIsChoiceEditorOpen(false);
          }}
          footer={
            <div className={modalStyles.editorActions}>
              <ActionButton
                icon={<Plus size={16} />}
                fullWidth={false}
                disabled={isChoiceSaveDisabled}
                onClick={() => {
                  if (!selectedChoiceOption || isChoiceSaveDisabled) {
                    return;
                  }

                  onAddInvocation(selectedChoiceOption.selectionId);
                  setDraftSelectionId("");
                  setIsChoiceEditorOpen(false);
                }}
              >
                Add Invocation
              </ActionButton>
            </div>
          }
        >
          <div className={modalStyles.singleFieldGrid}>
            <SelectField
              label={getSelectionLabel(option)}
              value={draftSelectionId}
              options={[
                {
                  label: "-",
                  value: ""
                },
                ...choiceOptions.map((choiceOption) => {
                  const isChoiceSelected = selectedSelectionIdSet.has(
                    choiceOption.selectionId
                  );

                  return {
                    disabled: isChoiceSelected || !choiceOption.isQualified,
                    label: `${getChoiceLabel(choiceOption)}${
                      isChoiceSelected ? " (selected)" : ""
                    }`,
                    value: choiceOption.selectionId
                  };
                })
              ]}
              onChange={setDraftSelectionId}
            />
          </div>
          {selectedChoiceOption && !selectedChoiceOption.isQualified ? (
            <p className={modalStyles.validation}>{selectedChoiceOption.requirementLabel}</p>
          ) : null}
        </InlineEditorFrame>
      ) : null}
      <div className={modalStyles.footer}>
        {isRepeatable || !isSelected ? (
          <button
            type="button"
            className={clsx(shared.editButton, modalStyles.addButton)}
            disabled={isAddButtonDisabled}
            title={addTitle}
            onClick={(event) => {
              event.stopPropagation();
              if (hasSelection) {
                setIsChoiceEditorOpen(true);
                return;
              }

              if (option) {
                onAddInvocation(option.selectionId);
                setDraftSelectionId("");
              }
            }}
          >
            <Plus size={16} />
            {isRepeatable && isSelected
              ? "Add Another"
              : isAddButtonDisabled && isSelected
                ? "Added"
                : "Add"}
          </button>
        ) : selectedOption ? (
          <button
            type="button"
            className={clsx(shared.editButton, modalStyles.removeActionButton)}
            disabled={isRemoveDisabled}
            title={removeTitle}
            onClick={(event) => {
              event.stopPropagation();
              onRemoveInvocation(selectedOption.selectionId);
            }}
          >
            <X size={16} />
            Remove
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default EldritchInvocationEditorCard;
