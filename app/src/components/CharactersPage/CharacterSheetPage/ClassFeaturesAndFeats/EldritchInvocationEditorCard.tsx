import clsx from "clsx";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { WarlockEldritchInvocationOption } from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import type {
  Character,
  CharacterFeatEntry,
  SavingThrowProficiencyEntry,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../../types";
import ActionButton from "../../../ActionButton";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import cardStyles from "./FeatCards.module.css";
import modalStyles from "./FeatEditorModal.module.css";
import { InlineEditorFrame, SelectField } from "./FeatEditorPrimitives";
import {
  triggerActionOnEnterOrSpace
} from "./featEditorUtils";
import {
  createLessonsOfTheFirstOnesFeatEntry,
  doesLessonsOriginFeatNeedInput,
  getLessonsOriginFeatForSelection
} from "./eldritchInvocationLessonsFeatUtils";
import EldritchInvocationLessonsFeatEditor from "./EldritchInvocationLessonsFeatEditor";
import EldritchInvocationPactTomeEditor from "./EldritchInvocationPactTomeEditor";
import type { TrackingButtonRenderer } from "./types";

type EldritchInvocationEditorCardProps = {
  options: WarlockEldritchInvocationOption[];
  selectedOptions: WarlockEldritchInvocationOption[];
  character: Character;
  characterLevel: number;
  skillProficiencies: SkillProficiencyEntry[];
  savingThrowProficiencies: SavingThrowProficiencyEntry[];
  weaponProficiencies: WeaponProficiencyEntry[];
  toolProficiencies: ToolProficiencyEntry[];
  isLimitReached: boolean;
  getBlockingSelectionNames: (selectionId: string) => string[];
  onAddInvocation: (selectionId: string, featEntry?: CharacterFeatEntry) => void;
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
    case "pact-blade":
      return "Pact weapon";
    case "pact-tome":
      return "Book spells";
    default:
      return "Choice";
  }
}

function EldritchInvocationEditorCard({
  options,
  selectedOptions,
  character,
  characterLevel,
  skillProficiencies,
  savingThrowProficiencies,
  weaponProficiencies,
  toolProficiencies,
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
  const [configuredFeatEntry, setConfiguredFeatEntry] = useState<CharacterFeatEntry | null>(null);
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
  const isPactTomeSelection = option.invocation.selection?.kind === "pact-tome";
  const choiceOptions = options.filter((currentOption) => !currentOption.isPlaceholder);
  const selectedOption = selectedOptions[0] ?? null;
  const selectedChoiceOption = hasSelection
    ? options.find((currentOption) => currentOption.selectionId === draftSelectionId) ?? null
    : option;
  const selectedOriginFeat =
    selectedChoiceOption?.invocation.selection?.kind === "origin-feat"
      ? getLessonsOriginFeatForSelection(selectedChoiceOption.selectionId)
      : null;
  const selectedOriginFeatNeedsInput = doesLessonsOriginFeatNeedInput(selectedOriginFeat);
  const hasAvailableChoiceOptions = choiceOptions.length > 0;
  const isRequirementBlocked = options.every(
    (currentOption) => currentOption.isPlaceholder || !currentOption.isQualified
  );
  const isChoiceSaveDisabled =
    !selectedChoiceOption ||
    selectedChoiceOption.isPlaceholder ||
    !selectedChoiceOption.isQualified ||
    selectedChoiceOption.isChoiceDisabled === true ||
    selectedSelectionIdSet.has(selectedChoiceOption.selectionId) ||
    (selectedOriginFeatNeedsInput && configuredFeatEntry === null);
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
  const shouldShowPrerequisite = option.requirementLabel !== "No prerequisite";

  function resetLessonsFeatChoice(nextSelectionId: string) {
    setDraftSelectionId(nextSelectionId);
    setConfiguredFeatEntry(null);
  }

  function createFeatEntryForSelectedChoice(): CharacterFeatEntry | undefined {
    if (!selectedOriginFeat || !selectedChoiceOption) {
      return undefined;
    }

    const choiceOption = selectedChoiceOption;

    if (selectedOriginFeatNeedsInput) {
      return configuredFeatEntry ?? undefined;
    }

    return createLessonsOfTheFirstOnesFeatEntry(
      selectedOriginFeat,
      characterLevel,
      choiceOption.selectionId
    );
  }

  function closeChoiceEditor() {
    setDraftSelectionId("");
    setConfiguredFeatEntry(null);
    setIsChoiceEditorOpen(false);
  }

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
          {renderTrackingButton(option.invocation.trackingState)}
        </div>
      </div>
      {shouldShowPrerequisite ? (
        <p
          className={clsx(cardStyles.meta, isRequirementBlocked && cardStyles.metaUnavailable)}
        >{`Prerequisite: ${option.requirementLabel}`}</p>
      ) : null}
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
      {isChoiceEditorOpen && isPactTomeSelection ? (
        <EldritchInvocationPactTomeEditor
          character={character}
          option={option}
          selectedOptions={selectedOptions}
          onAddInvocation={onAddInvocation}
          onCancel={closeChoiceEditor}
        />
      ) : null}
      {isChoiceEditorOpen && !isPactTomeSelection ? (
        <InlineEditorFrame
          title={option.displayName}
          cancelLabel={`Cancel ${option.displayName} selection`}
          onCancel={closeChoiceEditor}
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

                  onAddInvocation(
                    selectedChoiceOption.selectionId,
                    createFeatEntryForSelectedChoice()
                  );
                  closeChoiceEditor();
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
                  const choiceDisabledReason = choiceOption.isChoiceDisabled
                    ? ` (${choiceOption.choiceDisabledReason ?? "unavailable"})`
                    : "";

                  return {
                    disabled:
                      isChoiceSelected ||
                      !choiceOption.isQualified ||
                      choiceOption.isChoiceDisabled === true,
                    group: choiceOption.selectionGroup,
                    label: `${getChoiceLabel(choiceOption)}${
                      isChoiceSelected ? " (selected)" : ""
                    }${choiceDisabledReason}`,
                    value: choiceOption.selectionId
                  };
                })
              ]}
              onChange={resetLessonsFeatChoice}
            />
          </div>
          {selectedChoiceOption && selectedOriginFeatNeedsInput ? (
            <EldritchInvocationLessonsFeatEditor
              key={selectedChoiceOption.selectionId}
              selectedChoiceOption={selectedChoiceOption}
              characterLevel={characterLevel}
              skillProficiencies={skillProficiencies}
              savingThrowProficiencies={savingThrowProficiencies}
              weaponProficiencies={weaponProficiencies}
              toolProficiencies={toolProficiencies}
              renderTrackingButton={renderTrackingButton}
              onConfiguredFeatEntryChange={setConfiguredFeatEntry}
            />
          ) : null}
          {selectedChoiceOption && !selectedChoiceOption.isQualified ? (
            <p className={modalStyles.validation}>{selectedChoiceOption.requirementLabel}</p>
          ) : null}
          {selectedChoiceOption?.isChoiceDisabled ? (
            <p className={modalStyles.validation}>
              {selectedChoiceOption.choiceDisabledReason ?? "This choice is unavailable."}
            </p>
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
              : isSelected
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
