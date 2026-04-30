import clsx from "clsx";
import { Plus, X } from "lucide-react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { FEATS, getFeatureTrackingState, type SpellEntry } from "../../../../codex/entries";
import { abilityKeys } from "../../../../pages/CharactersPage/constants";
import {
  getAbilityScoreImprovementSummary,
  getEpicBoonAbilityChoiceSummary,
  getEpicBoonAbilityOptions,
  type FeatDefinition
} from "../../../../pages/CharactersPage/feats";
import {
  getToolProficiencyLabel,
  skillsOptions,
  toolProficiencyOptions,
  type ToolProficiency
} from "../../../../pages/CharactersPage/proficiencyOptions";
import { crafterFastCraftingToolProficiencies } from "../../../../pages/CharactersPage/crafterFeat";
import type { AbilityKey, CharacterFeatEntry, ToolProficiencyEntry } from "../../../../types";
import type { FeatEligibilityResult } from "../../../../pages/CharactersPage/featEligibility";
import ActionButton from "../../../ActionButton";
import SelectInput from "../../FormInputs/SelectInput";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import cardStyles from "./FeatCards.module.css";
import modalStyles from "./FeatEditorModal.module.css";
import {
  getPendingBlessedWarriorChoiceSummary,
  getPendingCrafterChoiceSummary,
  getPendingDruidicWarriorChoiceSummary,
  getPendingSkilledChoiceSummary,
  getRepeatableFeatEntrySummary,
  isPendingBlessedWarriorChoiceValid,
  isPendingCrafterChoiceValid,
  isPendingDruidicWarriorChoiceValid,
  isPendingSkilledChoiceValid,
  crafterNoneOptionValue,
  crafterSelectionIndices,
  skilledNoneOptionValue,
  skilledSelectionIndices,
  triggerActionOnEnterOrSpace
} from "./featEditorUtils";
import {
  buildToolSelectOptions,
  getSelectableUnproficientToolOptions,
  updateSelectionAtIndex
} from "./helpers";
import type {
  PendingAbilityScoreImprovement,
  PendingBlessedWarriorChoice,
  PendingDruidicWarriorChoice,
  PendingCrafterChoice,
  PendingFeatState,
  TrackingButtonRenderer
} from "./types";

type FeatEditorCardProps = {
  featDefinition: FeatDefinition;
  featEligibility?: FeatEligibilityResult;
  toolProficiencies: ToolProficiencyEntry[];
  selectedEntries: CharacterFeatEntry[];
  pendingFeatState: PendingFeatState;
  blessedWarriorCantripOptions: SpellEntry[];
  druidicWarriorCantripOptions: SpellEntry[];
  renderTrackingButton: TrackingButtonRenderer;
  onOpenFeatReference: (feat: FEATS) => void;
  onAddFeat: (feat: FEATS) => void;
  onRemoveFeat: (entry: CharacterFeatEntry) => void;
  onPendingFeatStateChange: Dispatch<SetStateAction<PendingFeatState>>;
  onSavePendingAbilityScoreImprovement: () => void;
  onSavePendingBoonOfIrresistibleOffense: () => void;
  onSavePendingBlessedWarriorChoice: () => void;
  onSavePendingCrafterChoice: () => void;
  onSavePendingDruidicWarriorChoice: () => void;
  onSavePendingEpicBoonAbilityChoice: () => void;
  onSavePendingSkilledChoice: () => void;
};

type InlineEditorFrameProps = {
  title: string;
  cancelLabel: string;
  onCancel: () => void;
  children: ReactNode;
  footer: ReactNode;
};

type SelectFieldProps = {
  label: string;
  value: string;
  options: Array<{
    disabled?: boolean;
    label: string;
    value: string;
  }>;
  onChange: (nextValue: string) => void;
};

type CantripChoiceEditorProps = {
  title: string;
  cancelLabel: string;
  choice: PendingBlessedWarriorChoice | PendingDruidicWarriorChoice;
  options: SpellEntry[];
  summary: string | null;
  isValid: boolean;
  validationMessage: string;
  onCancel: () => void;
  onSave: () => void;
  onChange: (selectionIndex: number, nextValue: string) => void;
};

type SingleAbilityEditorProps = {
  title: string;
  cancelLabel: string;
  label: string;
  summary: string;
  value: string;
  options: string[];
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextValue: string) => void;
};

type CrafterChoiceEditorProps = {
  choice: PendingCrafterChoice;
  summary: string | null;
  isValid: boolean;
  toolProficiencies: ToolProficiencyEntry[];
  onCancel: () => void;
  onSave: () => void;
  onChange: (selectionIndex: number, nextValue: string) => void;
};

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className={modalStyles.field}>
      <span>{label}</span>
      <SelectInput
        className={modalStyles.select}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </SelectInput>
    </label>
  );
}

function InlineEditorFrame({
  title,
  cancelLabel,
  onCancel,
  children,
  footer
}: InlineEditorFrameProps) {
  return (
    <section
      className={clsx(modalStyles.editorCard, modalStyles.inlineEditor)}
      role="presentation"
      onClick={(event) => event.stopPropagation()}
    >
      <div className={modalStyles.editorHeader}>
        <p className={modalStyles.selectionTitle}>{title}</p>
        <button
          type="button"
          className={modalStyles.removeButton}
          onClick={onCancel}
          aria-label={cancelLabel}
        >
          <X size={16} />
        </button>
      </div>
      {children}
      {footer}
    </section>
  );
}

function CantripChoiceEditor({
  title,
  cancelLabel,
  choice,
  options,
  summary,
  isValid,
  validationMessage,
  onCancel,
  onSave,
  onChange
}: CantripChoiceEditorProps) {
  return (
    <InlineEditorFrame
      title={title}
      cancelLabel={cancelLabel}
      onCancel={onCancel}
      footer={
        <div className={modalStyles.editorActions}>
          <ActionButton
            icon={<Plus size={16} />}
            fullWidth={false}
            disabled={!isValid}
            onClick={onSave}
          >
            Add Feat
          </ActionButton>
        </div>
      }
    >
      <div className={modalStyles.singleFieldGrid}>
        {[0, 1].map((selectionIndex) => (
          <SelectField
            key={`${title}-cantrip-${selectionIndex}`}
            label={`Cantrip ${selectionIndex + 1}`}
            value={choice.cantripIds[selectionIndex]}
            options={options.map((spell) => ({
              label: spell.name,
              value: spell.id
            }))}
            onChange={(nextValue) => onChange(selectionIndex, nextValue)}
          />
        ))}
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? <p className={modalStyles.validation}>{validationMessage}</p> : null}
    </InlineEditorFrame>
  );
}

function SingleAbilityEditor({
  title,
  cancelLabel,
  label,
  summary,
  value,
  options,
  onCancel,
  onSave,
  onChange
}: SingleAbilityEditorProps) {
  return (
    <InlineEditorFrame
      title={title}
      cancelLabel={cancelLabel}
      onCancel={onCancel}
      footer={
        <div className={modalStyles.editorActions}>
          <ActionButton icon={<Plus size={16} />} fullWidth={false} onClick={onSave}>
            Add Feat
          </ActionButton>
        </div>
      }
    >
      <div className={modalStyles.singleFieldGrid}>
        <SelectField
          label={label}
          value={value}
          options={options.map((option) => ({
            label: option,
            value: option
          }))}
          onChange={onChange}
        />
      </div>
      <p className={modalStyles.summary}>{summary}</p>
    </InlineEditorFrame>
  );
}

function CrafterChoiceEditor({
  choice,
  summary,
  isValid,
  toolProficiencies,
  onCancel,
  onSave,
  onChange
}: CrafterChoiceEditorProps) {
  return (
    <InlineEditorFrame
      title="Crafter"
      cancelLabel="Cancel crafter tool selection"
      onCancel={onCancel}
      footer={
        <div className={modalStyles.editorActions}>
          <ActionButton
            icon={<Plus size={16} />}
            fullWidth={false}
            disabled={!isValid}
            onClick={onSave}
          >
            Add Feat
          </ActionButton>
        </div>
      }
    >
      <div className={modalStyles.singleFieldGrid}>
        {crafterSelectionIndices.map((selectionIndex) => {
          const currentValue = choice.toolProficiencies[selectionIndex];
          const currentTool =
            currentValue === crafterNoneOptionValue ? null : (currentValue as ToolProficiency);
          const blockedSelections = choice.toolProficiencies.filter(
            (tool, index) => index !== selectionIndex && tool !== crafterNoneOptionValue
          ) as ToolProficiency[];
          const availableTools = getSelectableUnproficientToolOptions(
            { toolProficiencies },
            crafterFastCraftingToolProficiencies,
            currentTool,
            blockedSelections
          );

          return (
            <SelectField
              key={`crafter-tool-${selectionIndex}`}
              label={`Tool ${selectionIndex + 1}`}
              value={currentValue}
              options={[
                {
                  label: "-",
                  value: crafterNoneOptionValue
                },
                ...buildToolSelectOptions(
                  crafterFastCraftingToolProficiencies,
                  availableTools,
                  currentTool
                ).map((option) => ({
                  disabled: option.disabled,
                  label: option.label,
                  value: option.tool
                }))
              ]}
              onChange={(nextValue) => onChange(selectionIndex, nextValue)}
            />
          );
        })}
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>
          Choose three different Artisan&apos;s Tools from the Fast Crafting table.
        </p>
      ) : null}
    </InlineEditorFrame>
  );
}

function AbilityScoreImprovementEditor({
  choice,
  onChange,
  onCancel,
  onSave
}: {
  choice: PendingAbilityScoreImprovement;
  onChange: Dispatch<SetStateAction<PendingFeatState>>;
  onCancel: () => void;
  onSave: () => void;
}) {
  const isInvalidSplitChoice =
    choice.mode === "split" && choice.primaryAbility === choice.secondaryAbility;

  return (
    <InlineEditorFrame
      title="Ability Score Improvement"
      cancelLabel="Cancel ability score improvement selection"
      onCancel={onCancel}
      footer={
        <div className={modalStyles.editorActions}>
          <ActionButton
            icon={<Plus size={16} />}
            fullWidth={false}
            disabled={isInvalidSplitChoice}
            onClick={onSave}
          >
            Add Feat
          </ActionButton>
        </div>
      }
    >
      <div className={modalStyles.modeRow}>
        <button
          type="button"
          className={clsx(
            modalStyles.modeButton,
            choice.mode === "single" && modalStyles.modeButtonActive
          )}
          onClick={() =>
            onChange((current) => ({
              ...current,
              abilityScoreImprovement: current.abilityScoreImprovement
                ? {
                    ...current.abilityScoreImprovement,
                    mode: "single"
                  }
                : current.abilityScoreImprovement
            }))
          }
        >
          +2 to one ability
        </button>
        <button
          type="button"
          className={clsx(
            modalStyles.modeButton,
            choice.mode === "split" && modalStyles.modeButtonActive
          )}
          onClick={() =>
            onChange((current) => ({
              ...current,
              abilityScoreImprovement: current.abilityScoreImprovement
                ? {
                    ...current.abilityScoreImprovement,
                    mode: "split"
                  }
                : current.abilityScoreImprovement
            }))
          }
        >
          +1 and +1
        </button>
      </div>
      <div className={modalStyles.fieldGrid}>
        <SelectField
          label={choice.mode === "single" ? "Ability" : "First ability"}
          value={choice.primaryAbility}
          options={abilityKeys.map((ability) => ({
            label: ability,
            value: ability
          }))}
          onChange={(nextValue) =>
            onChange((current) => ({
              ...current,
              abilityScoreImprovement: current.abilityScoreImprovement
                ? {
                    ...current.abilityScoreImprovement,
                    primaryAbility: nextValue as AbilityKey
                  }
                : current.abilityScoreImprovement
            }))
          }
        />
        {choice.mode === "split" ? (
          <SelectField
            label="Second ability"
            value={choice.secondaryAbility}
            options={abilityKeys.map((ability) => ({
              label: ability,
              value: ability
            }))}
            onChange={(nextValue) =>
              onChange((current) => ({
                ...current,
                abilityScoreImprovement: current.abilityScoreImprovement
                  ? {
                      ...current.abilityScoreImprovement,
                      secondaryAbility: nextValue as AbilityKey
                    }
                  : current.abilityScoreImprovement
              }))
            }
          />
        ) : null}
      </div>
      <p className={modalStyles.summary}>{getAbilityScoreImprovementSummary(choice)}</p>
    </InlineEditorFrame>
  );
}

function renderInlineEditor({
  featDefinition,
  featEligibility,
  toolProficiencies,
  pendingFeatState,
  blessedWarriorCantripOptions,
  druidicWarriorCantripOptions,
  onPendingFeatStateChange,
  onSavePendingAbilityScoreImprovement,
  onSavePendingBoonOfIrresistibleOffense,
  onSavePendingBlessedWarriorChoice,
  onSavePendingCrafterChoice,
  onSavePendingDruidicWarriorChoice,
  onSavePendingEpicBoonAbilityChoice,
  onSavePendingSkilledChoice
}: Omit<
  FeatEditorCardProps,
  "selectedEntries" | "renderTrackingButton" | "onOpenFeatReference" | "onAddFeat" | "onRemoveFeat"
>) {
  if (featEligibility && !featEligibility.isEligible) {
    return null;
  }

  if (
    featDefinition.feat === FEATS.ABILITY_SCORE_IMPROVEMENT &&
    pendingFeatState.abilityScoreImprovement
  ) {
    return (
      <AbilityScoreImprovementEditor
        choice={pendingFeatState.abilityScoreImprovement}
        onChange={onPendingFeatStateChange}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            abilityScoreImprovement: null
          }))
        }
        onSave={onSavePendingAbilityScoreImprovement}
      />
    );
  }

  if (
    featDefinition.feat === FEATS.BOON_OF_IRRESISTIBLE_OFFENSE &&
    pendingFeatState.boonOfIrresistibleOffense
  ) {
    return (
      <SingleAbilityEditor
        title="Boon of Irresistible Offense"
        cancelLabel="Cancel boon of irresistible offense selection"
        label="Ability"
        summary={`${pendingFeatState.boonOfIrresistibleOffense.ability} +1 (max 30)`}
        value={pendingFeatState.boonOfIrresistibleOffense.ability}
        options={["STR", "DEX"]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            boonOfIrresistibleOffense: null
          }))
        }
        onSave={onSavePendingBoonOfIrresistibleOffense}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            boonOfIrresistibleOffense: current.boonOfIrresistibleOffense
              ? {
                  ability: nextValue as "STR" | "DEX"
                }
              : current.boonOfIrresistibleOffense
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.BLESSED_WARRIOR && pendingFeatState.blessedWarriorChoice) {
    return (
      <CantripChoiceEditor
        title="Blessed Warrior"
        cancelLabel="Cancel blessed warrior selection"
        choice={pendingFeatState.blessedWarriorChoice}
        options={blessedWarriorCantripOptions}
        summary={getPendingBlessedWarriorChoiceSummary(pendingFeatState.blessedWarriorChoice)}
        isValid={isPendingBlessedWarriorChoiceValid(pendingFeatState.blessedWarriorChoice)}
        validationMessage="Choose two different Cleric cantrips."
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            blessedWarriorChoice: null
          }))
        }
        onSave={onSavePendingBlessedWarriorChoice}
        onChange={(selectionIndex, nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            blessedWarriorChoice: current.blessedWarriorChoice
              ? {
                  cantripIds: updateSelectionAtIndex(
                    current.blessedWarriorChoice.cantripIds,
                    2,
                    selectionIndex,
                    nextValue
                  ) as PendingBlessedWarriorChoice["cantripIds"]
                }
              : current.blessedWarriorChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.DRUIDIC_WARRIOR && pendingFeatState.druidicWarriorChoice) {
    return (
      <CantripChoiceEditor
        title="Druidic Warrior"
        cancelLabel="Cancel druidic warrior selection"
        choice={pendingFeatState.druidicWarriorChoice}
        options={druidicWarriorCantripOptions}
        summary={getPendingDruidicWarriorChoiceSummary(pendingFeatState.druidicWarriorChoice)}
        isValid={isPendingDruidicWarriorChoiceValid(pendingFeatState.druidicWarriorChoice)}
        validationMessage="Choose two different Druid cantrips."
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            druidicWarriorChoice: null
          }))
        }
        onSave={onSavePendingDruidicWarriorChoice}
        onChange={(selectionIndex, nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            druidicWarriorChoice: current.druidicWarriorChoice
              ? {
                  cantripIds: updateSelectionAtIndex(
                    current.druidicWarriorChoice.cantripIds,
                    2,
                    selectionIndex,
                    nextValue
                  ) as PendingDruidicWarriorChoice["cantripIds"]
                }
              : current.druidicWarriorChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.CRAFTER && pendingFeatState.crafterChoice) {
    const crafterChoice = pendingFeatState.crafterChoice;

    return (
      <CrafterChoiceEditor
        choice={crafterChoice}
        summary={getPendingCrafterChoiceSummary(crafterChoice)}
        isValid={isPendingCrafterChoiceValid(crafterChoice)}
        toolProficiencies={toolProficiencies}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            crafterChoice: null
          }))
        }
        onSave={onSavePendingCrafterChoice}
        onChange={(selectionIndex, nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            crafterChoice: current.crafterChoice
              ? {
                  toolProficiencies: updateSelectionAtIndex(
                    current.crafterChoice.toolProficiencies,
                    3,
                    selectionIndex,
                    nextValue
                  ) as PendingCrafterChoice["toolProficiencies"]
                }
              : current.crafterChoice
          }))
        }
      />
    );
  }

  if (
    pendingFeatState.epicBoonAbilityChoice &&
    pendingFeatState.epicBoonAbilityChoice.feat === featDefinition.feat
  ) {
    return (
      <SingleAbilityEditor
        title={featDefinition.label}
        cancelLabel={`Cancel ${featDefinition.label} selection`}
        label="Ability"
        summary={`${getEpicBoonAbilityChoiceSummary({
          ability: pendingFeatState.epicBoonAbilityChoice.ability
        })} (max 30)`}
        value={pendingFeatState.epicBoonAbilityChoice.ability}
        options={getEpicBoonAbilityOptions(featDefinition.feat) ?? []}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            epicBoonAbilityChoice: null
          }))
        }
        onSave={onSavePendingEpicBoonAbilityChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            epicBoonAbilityChoice: current.epicBoonAbilityChoice
              ? {
                  ...current.epicBoonAbilityChoice,
                  ability: nextValue as AbilityKey
                }
              : current.epicBoonAbilityChoice
          }))
        }
      />
    );
  }

  const skilledChoice = pendingFeatState.skilledChoice;

  if (featDefinition.feat === FEATS.SKILLED && skilledChoice) {
    return (
      <InlineEditorFrame
        title="Skilled"
        cancelLabel="Cancel skilled selection"
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            skilledChoice: null
          }))
        }
        footer={
          <div className={modalStyles.editorActions}>
            <ActionButton
              icon={<Plus size={16} />}
              fullWidth={false}
              disabled={!isPendingSkilledChoiceValid(skilledChoice)}
              onClick={onSavePendingSkilledChoice}
            >
              Add Feat
            </ActionButton>
          </div>
        }
      >
        <div className={modalStyles.singleFieldGrid}>
          {skilledSelectionIndices.map((selectionIndex) => (
            <label
              key={`${featDefinition.feat}-selection-${selectionIndex}`}
              className={modalStyles.field}
            >
              <span>{`Choice ${selectionIndex + 1}`}</span>
              <select
                className={modalStyles.select}
                value={skilledChoice.selections[selectionIndex]}
                onChange={(event) =>
                  onPendingFeatStateChange((current) => ({
                    ...current,
                    skilledChoice: current.skilledChoice
                      ? {
                          selections: updateSelectionAtIndex(
                            current.skilledChoice.selections,
                            3,
                            selectionIndex,
                            event.target.value
                          ) as NonNullable<PendingFeatState["skilledChoice"]>["selections"]
                        }
                      : current.skilledChoice
                  }))
                }
              >
                <option value={skilledNoneOptionValue}>None</option>
                <optgroup label="Skills">
                  {skillsOptions.map((skill) => (
                    <option key={skill} value={`skill:${skill}`}>
                      {skill}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Tools">
                  {toolProficiencyOptions.map((tool) => (
                    <option key={tool} value={`tool:${tool}`}>
                      {getToolProficiencyLabel(tool)}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
          ))}
        </div>
        {getPendingSkilledChoiceSummary(skilledChoice) ? (
          <p className={modalStyles.summary}>{getPendingSkilledChoiceSummary(skilledChoice)}</p>
        ) : null}
        {!isPendingSkilledChoiceValid(skilledChoice) ? (
          <p className={modalStyles.validation}>Choose three different skills or tools.</p>
        ) : null}
      </InlineEditorFrame>
    );
  }

  return null;
}

function FeatEditorCard({
  featDefinition,
  featEligibility,
  toolProficiencies,
  selectedEntries,
  pendingFeatState,
  blessedWarriorCantripOptions,
  druidicWarriorCantripOptions,
  renderTrackingButton,
  onOpenFeatReference,
  onAddFeat,
  onRemoveFeat,
  onPendingFeatStateChange,
  onSavePendingAbilityScoreImprovement,
  onSavePendingBoonOfIrresistibleOffense,
  onSavePendingBlessedWarriorChoice,
  onSavePendingCrafterChoice,
  onSavePendingDruidicWarriorChoice,
  onSavePendingEpicBoonAbilityChoice,
  onSavePendingSkilledChoice
}: FeatEditorCardProps) {
  const isRepeatable = Boolean(featDefinition.repeatable);
  const isSelected = selectedEntries.length > 0;
  const unmetRequirementText = featEligibility?.unmetRequirements.join(" ") ?? "";
  const isRequirementBlocked = featEligibility ? !featEligibility.isEligible : false;
  const isAddDisabled = (!isRepeatable && isSelected) || isRequirementBlocked;

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
      onClick={() => onOpenFeatReference(featDefinition.feat)}
      onKeyDown={(event) =>
        triggerActionOnEnterOrSpace(event, () => onOpenFeatReference(featDefinition.feat))
      }
    >
      <div className={cardStyles.headerRow}>
        <div className={modalStyles.optionTitleBlock}>
          <span className={cardStyles.title}>{featDefinition.label}</span>
          {isRepeatable ? <span className={cardStyles.repeatable}>(repeatable)</span> : null}
        </div>
        <div className={cardStyles.headerActions}>
          {renderTrackingButton(getFeatureTrackingState(featDefinition))}
        </div>
      </div>
      {featDefinition.prerequisite ? (
        <p
          className={clsx(cardStyles.meta, isRequirementBlocked && cardStyles.metaUnavailable)}
        >{`Prerequisite: ${featDefinition.prerequisite}`}</p>
      ) : null}
      {isRepeatable && selectedEntries.length > 0 ? (
        <ul className={cardStyles.selectedList}>
          {selectedEntries.map((entry) => (
            <li key={entry.id} className={cardStyles.selectedItem}>
              <span className={cardStyles.selectedText}>
                {getRepeatableFeatEntrySummary(entry)}
              </span>
              <button
                type="button"
                className={cardStyles.selectedRemoveButton}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveFeat(entry);
                }}
                aria-label={`Remove ${featDefinition.label}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {renderInlineEditor({
        featDefinition,
        featEligibility,
        toolProficiencies,
        pendingFeatState,
        blessedWarriorCantripOptions,
        druidicWarriorCantripOptions,
        onPendingFeatStateChange,
        onSavePendingAbilityScoreImprovement,
        onSavePendingBoonOfIrresistibleOffense,
        onSavePendingBlessedWarriorChoice,
        onSavePendingCrafterChoice,
        onSavePendingDruidicWarriorChoice,
        onSavePendingEpicBoonAbilityChoice,
        onSavePendingSkilledChoice
      })}
      <div className={modalStyles.footer}>
        {isRepeatable || !isSelected ? (
          <button
            type="button"
            className={clsx(shared.editButton, modalStyles.addButton)}
            disabled={isAddDisabled}
            title={unmetRequirementText || undefined}
            onClick={(event) => {
              event.stopPropagation();
              onAddFeat(featDefinition.feat);
            }}
          >
            <Plus size={16} />
            {isRepeatable && isSelected ? "Add Another" : isAddDisabled ? "Added" : "Add"}
          </button>
        ) : (
          <button
            type="button"
            className={clsx(shared.editButton, modalStyles.removeActionButton)}
            onClick={(event) => {
              event.stopPropagation();

              if (selectedEntries[0]) {
                onRemoveFeat(selectedEntries[0]);
              }
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

export default FeatEditorCard;
