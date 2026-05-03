import clsx from "clsx";
import { Pencil, Plus, X } from "lucide-react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { FEATS, getFeatureTrackingState, type SpellEntry } from "../../../../codex/entries";
import { abilityKeys } from "../../../../pages/CharactersPage/constants";
import {
  elementalAdeptAbilityOptions,
  elementalAdeptDamageTypeOptions,
  feyTouchedAbilityOptions,
  heavilyArmoredAbilityOptions,
  heavyArmorMasterAbilityOptions,
  inspiringLeaderAbilityOptions,
  keenMindSkillOptions,
  lightlyArmoredAbilityOptions,
  mageSlayerAbilityOptions,
  martialWeaponTrainingAbilityOptions,
  mediumArmorMasterAbilityOptions,
  moderatelyArmoredAbilityOptions,
  mountedCombatantAbilityOptions,
  observantAbilityOptions,
  observantSkillOptions,
  piercerAbilityOptions,
  poisonerAbilityOptions,
  resilientAbilityOptions,
  speedyAbilityOptions,
  weaponMasterAbilityOptions,
  weaponMasterMasteryOptions,
  getAbilityScoreImprovementSummary,
  getEpicBoonAbilityChoiceSummary,
  getEpicBoonAbilityOptions,
  getMagicInitiateCantripOptions,
  getFeyTouchedSpellOptions,
  getMagicInitiateLevelOneSpellOptions,
  getMagicInitiateSpellListLabel,
  isMagicInitiateSpellList,
  isFeatEntryRemovable,
  magicInitiateSpellListOptions,
  magicInitiateSpellcastingAbilityOptions,
  type FeatDefinition
} from "../../../../pages/CharactersPage/feats";
import {
  getToolProficiencyLabel,
  musicalInstrumentToolProficiencies,
  skillsOptions,
  toolProficiencyOptions,
  type ToolProficiency
} from "../../../../pages/CharactersPage/proficiencyOptions";
import {
  getSavingThrowLevelFromEntries,
  getSavingThrowProficiencyForAbilityKey
} from "../../../../pages/CharactersPage/proficiency";
import { getWeaponProficiencyLabel } from "../../../../pages/CharactersPage/proficiencyWeaponLabels";
import { crafterFastCraftingToolProficiencies } from "../../../../pages/CharactersPage/feats/crafter";
import {
  PROF_LEVEL,
  type AbilityKey,
  type CharacterFeatEntry,
  type SavingThrowProficiencyEntry,
  type SkillName,
  type SkillProficiencyEntry,
  type ToolProficiencyEntry,
  type WeaponProficiencyEntry
} from "../../../../types";
import type { FeatEligibilityResult } from "../../../../pages/CharactersPage/feats/eligibility";
import { formatCodexLabel } from "../../../../utils/codex";
import ActionButton from "../../../ActionButton";
import SelectInput from "../../FormInputs/SelectInput";
import shared from "../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import cardStyles from "./FeatCards.module.css";
import modalStyles from "./FeatEditorModal.module.css";
import {
  getPendingBlessedWarriorChoiceSummary,
  getPendingAthleteChoiceSummary,
  getPendingChargerChoiceSummary,
  getPendingChefChoiceSummary,
  getPendingCrusherChoiceSummary,
  getPendingDualWielderChoiceSummary,
  getPendingElementalAdeptChoiceSummary,
  getPendingFeyTouchedChoiceSummary,
  getPendingHeavilyArmoredChoiceSummary,
  getPendingHeavyArmorMasterChoiceSummary,
  getPendingInspiringLeaderChoiceSummary,
  getPendingKeenMindChoiceSummary,
  getPendingLightlyArmoredChoiceSummary,
  getPendingMageSlayerChoiceSummary,
  getPendingMartialWeaponTrainingChoiceSummary,
  getPendingMediumArmorMasterChoiceSummary,
  getPendingModeratelyArmoredChoiceSummary,
  getPendingMountedCombatantChoiceSummary,
  getPendingObservantChoiceSummary,
  getPendingPiercerChoiceSummary,
  getPendingPoisonerChoiceSummary,
  getPendingResilientChoiceSummary,
  getPendingSpeedyChoiceSummary,
  getPendingWeaponMasterChoiceSummary,
  getPendingCrafterChoiceSummary,
  getPendingDruidicWarriorChoiceSummary,
  getPendingMagicInitiateChoiceSummary,
  getPendingMusicianChoiceSummary,
  getPendingSkilledChoiceSummary,
  getRepeatableFeatEntrySummary,
  isPendingBlessedWarriorChoiceValid,
  isPendingCrafterChoiceValid,
  isPendingDruidicWarriorChoiceValid,
  isPendingFeyTouchedChoiceValid,
  isPendingKeenMindChoiceValid,
  isPendingObservantChoiceValid,
  isPendingResilientChoiceValid,
  isPendingWeaponMasterChoiceValid,
  isPendingMagicInitiateChoiceValid,
  isPendingMusicianChoiceValid,
  isPendingSkilledChoiceValid,
  createPendingFeatStateForFeat,
  crafterNoneOptionValue,
  crafterSelectionIndices,
  feyTouchedNoneOptionValue,
  magicInitiateCantripSelectionIndices,
  magicInitiateNoneOptionValue,
  musicianNoneOptionValue,
  musicianSelectionIndices,
  keenMindNoneOptionValue,
  observantNoneOptionValue,
  resilientNoneOptionValue,
  skilledNoneOptionValue,
  skilledSelectionIndices,
  weaponMasterNoneOptionValue,
  triggerActionOnEnterOrSpace
} from "./featEditorUtils";
import {
  buildSkillSelectOptions,
  buildToolSelectOptions,
  getSelectableNonExpertSkillOptions,
  getSelectableUnproficientToolOptions,
  updateSelectionAtIndex
} from "./helpers";
import type {
  PendingAbilityScoreImprovement,
  PendingBlessedWarriorChoice,
  PendingCrafterChoice,
  PendingDruidicWarriorChoice,
  PendingElementalAdeptChoice,
  PendingFeyTouchedChoice,
  PendingFeatState,
  PendingHeavilyArmoredChoice,
  PendingHeavyArmorMasterChoice,
  PendingInspiringLeaderChoice,
  PendingKeenMindChoice,
  PendingLightlyArmoredChoice,
  PendingMagicInitiateChoice,
  PendingMageSlayerChoice,
  PendingMartialWeaponTrainingChoice,
  PendingMediumArmorMasterChoice,
  PendingModeratelyArmoredChoice,
  PendingMountedCombatantChoice,
  PendingObservantChoice,
  PendingPiercerChoice,
  PendingPoisonerChoice,
  PendingResilientChoice,
  PendingSpeedyChoice,
  PendingWeaponMasterChoice,
  PendingMusicianChoice,
  TrackingButtonRenderer
} from "./types";

type FeatEditorCardProps = {
  featDefinition: FeatDefinition;
  featEligibility?: FeatEligibilityResult;
  skillProficiencies: SkillProficiencyEntry[];
  savingThrowProficiencies: SavingThrowProficiencyEntry[];
  weaponProficiencies: WeaponProficiencyEntry[];
  toolProficiencies: ToolProficiencyEntry[];
  selectedEntries: CharacterFeatEntry[];
  editingFeatEntryId: string | null;
  pendingFeatState: PendingFeatState;
  blessedWarriorCantripOptions: SpellEntry[];
  druidicWarriorCantripOptions: SpellEntry[];
  renderTrackingButton: TrackingButtonRenderer;
  onOpenFeatReference: (feat: FEATS) => void;
  onAddFeat: (feat: FEATS) => void;
  onEditFeat: (entry: CharacterFeatEntry) => void;
  onRemoveFeat: (entry: CharacterFeatEntry) => void;
  onPendingFeatStateChange: Dispatch<SetStateAction<PendingFeatState>>;
  onSavePendingAbilityScoreImprovement: () => void;
  onSavePendingAthleteChoice: () => void;
  onSavePendingChargerChoice: () => void;
  onSavePendingChefChoice: () => void;
  onSavePendingCrusherChoice: () => void;
  onSavePendingDualWielderChoice: () => void;
  onSavePendingElementalAdeptChoice: () => void;
  onSavePendingFeyTouchedChoice: () => void;
  onSavePendingHeavilyArmoredChoice: () => void;
  onSavePendingHeavyArmorMasterChoice: () => void;
  onSavePendingInspiringLeaderChoice: () => void;
  onSavePendingKeenMindChoice: () => void;
  onSavePendingLightlyArmoredChoice: () => void;
  onSavePendingMageSlayerChoice: () => void;
  onSavePendingMartialWeaponTrainingChoice: () => void;
  onSavePendingMediumArmorMasterChoice: () => void;
  onSavePendingModeratelyArmoredChoice: () => void;
  onSavePendingMountedCombatantChoice: () => void;
  onSavePendingObservantChoice: () => void;
  onSavePendingPiercerChoice: () => void;
  onSavePendingPoisonerChoice: () => void;
  onSavePendingResilientChoice: () => void;
  onSavePendingSpeedyChoice: () => void;
  onSavePendingWeaponMasterChoice: () => void;
  onSavePendingBoonOfIrresistibleOffense: () => void;
  onSavePendingBlessedWarriorChoice: () => void;
  onSavePendingCrafterChoice: () => void;
  onSavePendingDruidicWarriorChoice: () => void;
  onSavePendingEpicBoonAbilityChoice: () => void;
  onSavePendingMagicInitiateChoice: () => void;
  onSavePendingMusicianChoice: () => void;
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
  disabled?: boolean;
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

type ElementalAdeptChoiceEditorProps = {
  choice: PendingElementalAdeptChoice;
  selectedEntries: CharacterFeatEntry[];
  editingFeatEntryId: string | null;
  summary: string | null;
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingElementalAdeptChoice) => void;
};

type FeyTouchedChoiceEditorProps = {
  choice: PendingFeyTouchedChoice;
  summary: string | null;
  isValid: boolean;
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingFeyTouchedChoice) => void;
};

type KeenMindChoiceEditorProps = {
  choice: PendingKeenMindChoice;
  summary: string | null;
  isValid: boolean;
  skillProficiencies: SkillProficiencyEntry[];
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingKeenMindChoice) => void;
};

type ObservantChoiceEditorProps = {
  choice: PendingObservantChoice;
  summary: string | null;
  isValid: boolean;
  skillProficiencies: SkillProficiencyEntry[];
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingObservantChoice) => void;
};

type ResilientChoiceEditorProps = {
  choice: PendingResilientChoice;
  summary: string | null;
  isValid: boolean;
  savingThrowProficiencies: SavingThrowProficiencyEntry[];
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingResilientChoice) => void;
};

type WeaponMasterChoiceEditorProps = {
  choice: PendingWeaponMasterChoice;
  summary: string | null;
  isValid: boolean;
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingWeaponMasterChoice) => void;
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

type MusicianChoiceEditorProps = {
  choice: PendingMusicianChoice;
  summary: string | null;
  isValid: boolean;
  toolProficiencies: ToolProficiencyEntry[];
  onCancel: () => void;
  onSave: () => void;
  onChange: (selectionIndex: number, nextValue: string) => void;
};

type MagicInitiateChoiceEditorProps = {
  choice: PendingMagicInitiateChoice;
  selectedEntries: CharacterFeatEntry[];
  summary: string | null;
  isValid: boolean;
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingMagicInitiateChoice) => void;
};

function SelectField({ label, value, disabled, options, onChange }: SelectFieldProps) {
  return (
    <label className={modalStyles.field}>
      <span>{label}</span>
      <SelectInput
        className={modalStyles.select}
        value={value}
        disabled={disabled}
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

function ElementalAdeptChoiceEditor({
  choice,
  selectedEntries,
  editingFeatEntryId,
  summary,
  onCancel,
  onSave,
  onChange
}: ElementalAdeptChoiceEditorProps) {
  const blockedDamageTypes = new Set(
    selectedEntries
      .filter((entry) => entry.id !== editingFeatEntryId)
      .map((entry) => entry.elementalAdept?.damageType)
      .filter((damageType): damageType is PendingElementalAdeptChoice["damageType"] =>
        Boolean(damageType)
      )
  );
  const isValid = !blockedDamageTypes.has(choice.damageType);

  return (
    <InlineEditorFrame
      title="Elemental Adept"
      cancelLabel="Cancel elemental adept selection"
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
        <SelectField
          label="Ability"
          value={choice.ability}
          options={elementalAdeptAbilityOptions.map((ability) => ({
            label: ability,
            value: ability
          }))}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              ability: nextValue as PendingElementalAdeptChoice["ability"]
            })
          }
        />
        <SelectField
          label="Damage Type"
          value={choice.damageType}
          options={elementalAdeptDamageTypeOptions.map((damageType) => ({
            disabled: blockedDamageTypes.has(damageType),
            label: formatCodexLabel(damageType),
            value: damageType
          }))}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              damageType: nextValue as PendingElementalAdeptChoice["damageType"]
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>Choose a damage type you have not selected.</p>
      ) : null}
    </InlineEditorFrame>
  );
}

function FeyTouchedChoiceEditor({
  choice,
  summary,
  isValid,
  onCancel,
  onSave,
  onChange
}: FeyTouchedChoiceEditorProps) {
  const spellOptions = getFeyTouchedSpellOptions();

  return (
    <InlineEditorFrame
      title="Fey-Touched"
      cancelLabel="Cancel fey-touched selection"
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
        <SelectField
          label="Ability"
          value={choice.ability}
          options={feyTouchedAbilityOptions.map((ability) => ({
            label: ability,
            value: ability
          }))}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              ability: nextValue as PendingFeyTouchedChoice["ability"]
            })
          }
        />
        <SelectField
          label="Level 1 Spell"
          value={choice.spellId}
          options={[
            {
              label: "-",
              value: feyTouchedNoneOptionValue
            },
            ...spellOptions.map((spell) => ({
              label: `${spell.name} (${formatCodexLabel(spell.magicSchool)})`,
              value: spell.id
            }))
          ]}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              spellId: nextValue
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>
          Choose a level 1 Divination or Enchantment spell.
        </p>
      ) : null}
    </InlineEditorFrame>
  );
}

function KeenMindChoiceEditor({
  choice,
  summary,
  isValid,
  skillProficiencies,
  onCancel,
  onSave,
  onChange
}: KeenMindChoiceEditorProps) {
  const currentSkill =
    choice.skill === keenMindNoneOptionValue ? null : (choice.skill as SkillName);
  const availableSkills = getSelectableNonExpertSkillOptions(
    { skillProficiencies },
    keenMindSkillOptions,
    currentSkill
  );

  return (
    <InlineEditorFrame
      title="Keen Mind"
      cancelLabel="Cancel keen mind skill selection"
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
        <SelectField
          label="Skill"
          value={choice.skill}
          options={[
            {
              label: "-",
              value: keenMindNoneOptionValue
            },
            ...buildSkillSelectOptions(keenMindSkillOptions, availableSkills, currentSkill).map(
              (option) => ({
                disabled: option.disabled,
                label: option.label,
                value: option.skill
              })
            )
          ]}
          onChange={(nextValue) =>
            onChange({
              skill: nextValue as PendingKeenMindChoice["skill"]
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>
          Choose Arcana, History, Investigation, Nature, or Religion.
        </p>
      ) : null}
    </InlineEditorFrame>
  );
}

function ObservantChoiceEditor({
  choice,
  summary,
  isValid,
  skillProficiencies,
  onCancel,
  onSave,
  onChange
}: ObservantChoiceEditorProps) {
  const currentSkill =
    choice.skill === observantNoneOptionValue ? null : (choice.skill as SkillName);
  const availableSkills = getSelectableNonExpertSkillOptions(
    { skillProficiencies },
    observantSkillOptions,
    currentSkill
  );

  return (
    <InlineEditorFrame
      title="Observant"
      cancelLabel="Cancel observant selection"
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
        <SelectField
          label="Ability"
          value={choice.ability}
          options={observantAbilityOptions.map((ability) => ({
            label: ability,
            value: ability
          }))}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              ability: nextValue as PendingObservantChoice["ability"]
            })
          }
        />
        <SelectField
          label="Skill"
          value={choice.skill}
          options={[
            {
              label: "-",
              value: observantNoneOptionValue
            },
            ...buildSkillSelectOptions(observantSkillOptions, availableSkills, currentSkill).map(
              (option) => ({
                disabled: option.disabled,
                label: option.label,
                value: option.skill
              })
            )
          ]}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              skill: nextValue as PendingObservantChoice["skill"]
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>
          Choose Intelligence or Wisdom and Insight, Investigation, or Perception.
        </p>
      ) : null}
    </InlineEditorFrame>
  );
}

function ResilientChoiceEditor({
  choice,
  summary,
  isValid,
  savingThrowProficiencies,
  onCancel,
  onSave,
  onChange
}: ResilientChoiceEditorProps) {
  const currentAbility = choice.ability === resilientNoneOptionValue ? null : choice.ability;

  return (
    <InlineEditorFrame
      title="Resilient"
      cancelLabel="Cancel resilient selection"
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
        <SelectField
          label="Ability"
          value={choice.ability}
          options={[
            {
              label: "-",
              value: resilientNoneOptionValue
            },
            ...resilientAbilityOptions.map((ability) => {
              const savingThrow = getSavingThrowProficiencyForAbilityKey(ability);
              const hasSavingThrowProficiency =
                getSavingThrowLevelFromEntries(savingThrowProficiencies, savingThrow) !==
                PROF_LEVEL.NONE;

              return {
                disabled: hasSavingThrowProficiency && ability !== currentAbility,
                label: `${ability} Saving Throw`,
                value: ability
              };
            })
          ]}
          onChange={(nextValue) =>
            onChange({
              ability: nextValue as PendingResilientChoice["ability"]
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>
          Choose an ability where you lack saving throw proficiency.
        </p>
      ) : null}
    </InlineEditorFrame>
  );
}

function WeaponMasterChoiceEditor({
  choice,
  summary,
  isValid,
  onCancel,
  onSave,
  onChange
}: WeaponMasterChoiceEditorProps) {
  return (
    <InlineEditorFrame
      title="Weapon Master"
      cancelLabel="Cancel weapon master selection"
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
        <SelectField
          label="Ability"
          value={choice.ability}
          options={weaponMasterAbilityOptions.map((ability) => ({
            label: ability,
            value: ability
          }))}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              ability: nextValue as PendingWeaponMasterChoice["ability"]
            })
          }
        />
        <SelectField
          label="Weapon Mastery"
          value={choice.weaponMastery}
          options={[
            {
              label: "-",
              value: weaponMasterNoneOptionValue
            },
            ...weaponMasterMasteryOptions.map((weaponMastery) => ({
              label: getWeaponProficiencyLabel(weaponMastery),
              value: weaponMastery
            }))
          ]}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              weaponMastery: nextValue as PendingWeaponMasterChoice["weaponMastery"]
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? <p className={modalStyles.validation}>Choose one weapon mastery.</p> : null}
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

function MusicianChoiceEditor({
  choice,
  summary,
  isValid,
  toolProficiencies,
  onCancel,
  onSave,
  onChange
}: MusicianChoiceEditorProps) {
  return (
    <InlineEditorFrame
      title="Musician"
      cancelLabel="Cancel musician instrument selection"
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
        {musicianSelectionIndices.map((selectionIndex) => {
          const currentValue = choice.toolProficiencies[selectionIndex];
          const currentTool =
            currentValue === musicianNoneOptionValue ? null : (currentValue as ToolProficiency);
          const blockedSelections = choice.toolProficiencies.filter(
            (tool, index) => index !== selectionIndex && tool !== musicianNoneOptionValue
          ) as ToolProficiency[];
          const availableTools = getSelectableUnproficientToolOptions(
            { toolProficiencies },
            musicalInstrumentToolProficiencies,
            currentTool,
            blockedSelections
          );

          return (
            <SelectField
              key={`musician-instrument-${selectionIndex}`}
              label={`Instrument ${selectionIndex + 1}`}
              value={currentValue}
              options={[
                {
                  label: "-",
                  value: musicianNoneOptionValue
                },
                ...buildToolSelectOptions(
                  musicalInstrumentToolProficiencies,
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
        <p className={modalStyles.validation}>Choose three different Musical Instruments.</p>
      ) : null}
    </InlineEditorFrame>
  );
}

function MagicInitiateChoiceEditor({
  choice,
  selectedEntries,
  summary,
  isValid,
  onCancel,
  onSave,
  onChange
}: MagicInitiateChoiceEditorProps) {
  const selectedSpellList = isMagicInitiateSpellList(choice.spellList) ? choice.spellList : null;
  const lockedSpellList = isMagicInitiateSpellList(choice.lockedSpellList)
    ? choice.lockedSpellList
    : null;
  const usedSpellLists = new Set(
    selectedEntries
      .map((entry) => entry.magicInitiate?.spellList)
      .filter((spellList): spellList is NonNullable<typeof spellList> => Boolean(spellList))
  );
  const cantripOptions = selectedSpellList ? getMagicInitiateCantripOptions(selectedSpellList) : [];
  const levelOneSpellOptions = selectedSpellList
    ? getMagicInitiateLevelOneSpellOptions(selectedSpellList)
    : [];

  return (
    <InlineEditorFrame
      title="Magic Initiate"
      cancelLabel="Cancel magic initiate spell selection"
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
        <SelectField
          label="Spell List"
          value={choice.spellList}
          disabled={Boolean(lockedSpellList)}
          options={[
            ...(lockedSpellList
              ? []
              : [
                  {
                    label: "-",
                    value: magicInitiateNoneOptionValue
                  }
                ]),
            ...magicInitiateSpellListOptions.map((spellList) => ({
              disabled: lockedSpellList
                ? spellList !== lockedSpellList
                : usedSpellLists.has(spellList),
              label: getMagicInitiateSpellListLabel(spellList),
              value: spellList
            }))
          ]}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              spellList: nextValue,
              cantripIds: ["", ""],
              levelOneSpellId: ""
            })
          }
        />
        {magicInitiateCantripSelectionIndices.map((selectionIndex) => {
          const selectedCantripIds = choice.cantripIds.filter(
            (spellId, index) => index !== selectionIndex && spellId.length > 0
          );

          return (
            <SelectField
              key={`magic-initiate-cantrip-${selectionIndex}`}
              label={`Cantrip ${selectionIndex + 1}`}
              value={choice.cantripIds[selectionIndex]}
              options={[
                {
                  label: "-",
                  value: ""
                },
                ...cantripOptions.map((spell) => ({
                  disabled: selectedCantripIds.includes(spell.id),
                  label: spell.name,
                  value: spell.id
                }))
              ]}
              onChange={(nextValue) =>
                onChange({
                  ...choice,
                  cantripIds: updateSelectionAtIndex(
                    choice.cantripIds,
                    2,
                    selectionIndex,
                    nextValue
                  ) as PendingMagicInitiateChoice["cantripIds"]
                })
              }
            />
          );
        })}
        <SelectField
          label="Level 1 Spell"
          value={choice.levelOneSpellId}
          options={[
            {
              label: "-",
              value: ""
            },
            ...levelOneSpellOptions.map((spell) => ({
              label: spell.name,
              value: spell.id
            }))
          ]}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              levelOneSpellId: nextValue
            })
          }
        />
        <SelectField
          label="Spellcasting Ability"
          value={choice.spellcastingAbility}
          options={[
            {
              label: "-",
              value: magicInitiateNoneOptionValue
            },
            ...magicInitiateSpellcastingAbilityOptions.map((ability) => ({
              label: ability,
              value: ability
            }))
          ]}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              spellcastingAbility: nextValue
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>
          Choose a spell list, two different cantrips, one level 1 spell, and a spellcasting
          ability.
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
  skillProficiencies,
  savingThrowProficiencies,
  toolProficiencies,
  selectedEntries,
  editingFeatEntryId,
  pendingFeatState,
  blessedWarriorCantripOptions,
  druidicWarriorCantripOptions,
  onPendingFeatStateChange,
  onSavePendingAbilityScoreImprovement,
  onSavePendingAthleteChoice,
  onSavePendingChargerChoice,
  onSavePendingChefChoice,
  onSavePendingCrusherChoice,
  onSavePendingDualWielderChoice,
  onSavePendingElementalAdeptChoice,
  onSavePendingFeyTouchedChoice,
  onSavePendingHeavilyArmoredChoice,
  onSavePendingHeavyArmorMasterChoice,
  onSavePendingInspiringLeaderChoice,
  onSavePendingKeenMindChoice,
  onSavePendingLightlyArmoredChoice,
  onSavePendingMageSlayerChoice,
  onSavePendingMartialWeaponTrainingChoice,
  onSavePendingMediumArmorMasterChoice,
  onSavePendingModeratelyArmoredChoice,
  onSavePendingMountedCombatantChoice,
  onSavePendingObservantChoice,
  onSavePendingPiercerChoice,
  onSavePendingPoisonerChoice,
  onSavePendingResilientChoice,
  onSavePendingSpeedyChoice,
  onSavePendingWeaponMasterChoice,
  onSavePendingBoonOfIrresistibleOffense,
  onSavePendingBlessedWarriorChoice,
  onSavePendingCrafterChoice,
  onSavePendingDruidicWarriorChoice,
  onSavePendingEpicBoonAbilityChoice,
  onSavePendingMagicInitiateChoice,
  onSavePendingMusicianChoice,
  onSavePendingSkilledChoice
}: Omit<
  FeatEditorCardProps,
  "renderTrackingButton" | "onOpenFeatReference" | "onAddFeat" | "onEditFeat" | "onRemoveFeat"
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

  if (featDefinition.feat === FEATS.ATHLETE && pendingFeatState.athleteChoice) {
    return (
      <SingleAbilityEditor
        title="Athlete"
        cancelLabel="Cancel athlete selection"
        label="Ability"
        summary={getPendingAthleteChoiceSummary(pendingFeatState.athleteChoice) ?? ""}
        value={pendingFeatState.athleteChoice.ability}
        options={["STR", "DEX"]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            athleteChoice: null
          }))
        }
        onSave={onSavePendingAthleteChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            athleteChoice: current.athleteChoice
              ? {
                  ability: nextValue as "STR" | "DEX"
                }
              : current.athleteChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.CHARGER && pendingFeatState.chargerChoice) {
    return (
      <SingleAbilityEditor
        title="Charger"
        cancelLabel="Cancel charger selection"
        label="Ability"
        summary={getPendingChargerChoiceSummary(pendingFeatState.chargerChoice) ?? ""}
        value={pendingFeatState.chargerChoice.ability}
        options={["STR", "DEX"]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            chargerChoice: null
          }))
        }
        onSave={onSavePendingChargerChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            chargerChoice: current.chargerChoice
              ? {
                  ability: nextValue as "STR" | "DEX"
                }
              : current.chargerChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.CHEF && pendingFeatState.chefChoice) {
    return (
      <SingleAbilityEditor
        title="Chef"
        cancelLabel="Cancel chef selection"
        label="Ability"
        summary={getPendingChefChoiceSummary(pendingFeatState.chefChoice) ?? ""}
        value={pendingFeatState.chefChoice.ability}
        options={["CON", "WIS"]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            chefChoice: null
          }))
        }
        onSave={onSavePendingChefChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            chefChoice: current.chefChoice
              ? {
                  ability: nextValue as "CON" | "WIS"
                }
              : current.chefChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.CRUSHER && pendingFeatState.crusherChoice) {
    return (
      <SingleAbilityEditor
        title="Crusher"
        cancelLabel="Cancel crusher selection"
        label="Ability"
        summary={getPendingCrusherChoiceSummary(pendingFeatState.crusherChoice) ?? ""}
        value={pendingFeatState.crusherChoice.ability}
        options={["STR", "CON"]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            crusherChoice: null
          }))
        }
        onSave={onSavePendingCrusherChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            crusherChoice: current.crusherChoice
              ? {
                  ability: nextValue as "STR" | "CON"
                }
              : current.crusherChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.DUAL_WIELDER && pendingFeatState.dualWielderChoice) {
    return (
      <SingleAbilityEditor
        title="Dual Wielder"
        cancelLabel="Cancel dual wielder selection"
        label="Ability"
        summary={getPendingDualWielderChoiceSummary(pendingFeatState.dualWielderChoice) ?? ""}
        value={pendingFeatState.dualWielderChoice.ability}
        options={["STR", "DEX"]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            dualWielderChoice: null
          }))
        }
        onSave={onSavePendingDualWielderChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            dualWielderChoice: current.dualWielderChoice
              ? {
                  ability: nextValue as "STR" | "DEX"
                }
              : current.dualWielderChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.ELEMENTAL_ADEPT && pendingFeatState.elementalAdeptChoice) {
    const elementalAdeptChoice = pendingFeatState.elementalAdeptChoice;

    return (
      <ElementalAdeptChoiceEditor
        choice={elementalAdeptChoice}
        selectedEntries={selectedEntries}
        editingFeatEntryId={editingFeatEntryId}
        summary={getPendingElementalAdeptChoiceSummary(elementalAdeptChoice)}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            elementalAdeptChoice: null
          }))
        }
        onSave={onSavePendingElementalAdeptChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            elementalAdeptChoice: current.elementalAdeptChoice
              ? nextChoice
              : current.elementalAdeptChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.FEY_TOUCHED && pendingFeatState.feyTouchedChoice) {
    const feyTouchedChoice = pendingFeatState.feyTouchedChoice;

    return (
      <FeyTouchedChoiceEditor
        choice={feyTouchedChoice}
        summary={getPendingFeyTouchedChoiceSummary(feyTouchedChoice)}
        isValid={isPendingFeyTouchedChoiceValid(feyTouchedChoice)}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            feyTouchedChoice: null
          }))
        }
        onSave={onSavePendingFeyTouchedChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            feyTouchedChoice: current.feyTouchedChoice ? nextChoice : current.feyTouchedChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.HEAVILY_ARMORED && pendingFeatState.heavilyArmoredChoice) {
    return (
      <SingleAbilityEditor
        title="Heavily Armored"
        cancelLabel="Cancel heavily armored selection"
        label="Ability"
        summary={
          getPendingHeavilyArmoredChoiceSummary(pendingFeatState.heavilyArmoredChoice) ?? ""
        }
        value={pendingFeatState.heavilyArmoredChoice.ability}
        options={[...heavilyArmoredAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            heavilyArmoredChoice: null
          }))
        }
        onSave={onSavePendingHeavilyArmoredChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            heavilyArmoredChoice: current.heavilyArmoredChoice
              ? {
                  ability: nextValue as PendingHeavilyArmoredChoice["ability"]
                }
              : current.heavilyArmoredChoice
          }))
        }
      />
    );
  }

  if (
    featDefinition.feat === FEATS.HEAVY_ARMOR_MASTER &&
    pendingFeatState.heavyArmorMasterChoice
  ) {
    return (
      <SingleAbilityEditor
        title="Heavy Armor Master"
        cancelLabel="Cancel heavy armor master selection"
        label="Ability"
        summary={
          getPendingHeavyArmorMasterChoiceSummary(pendingFeatState.heavyArmorMasterChoice) ?? ""
        }
        value={pendingFeatState.heavyArmorMasterChoice.ability}
        options={[...heavyArmorMasterAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            heavyArmorMasterChoice: null
          }))
        }
        onSave={onSavePendingHeavyArmorMasterChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            heavyArmorMasterChoice: current.heavyArmorMasterChoice
              ? {
                  ability: nextValue as PendingHeavyArmorMasterChoice["ability"]
                }
              : current.heavyArmorMasterChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.INSPIRING_LEADER && pendingFeatState.inspiringLeaderChoice) {
    return (
      <SingleAbilityEditor
        title="Inspiring Leader"
        cancelLabel="Cancel inspiring leader selection"
        label="Ability"
        summary={
          getPendingInspiringLeaderChoiceSummary(pendingFeatState.inspiringLeaderChoice) ?? ""
        }
        value={pendingFeatState.inspiringLeaderChoice.ability}
        options={[...inspiringLeaderAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            inspiringLeaderChoice: null
          }))
        }
        onSave={onSavePendingInspiringLeaderChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            inspiringLeaderChoice: current.inspiringLeaderChoice
              ? {
                  ability: nextValue as PendingInspiringLeaderChoice["ability"]
                }
              : current.inspiringLeaderChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.KEEN_MIND && pendingFeatState.keenMindChoice) {
    const keenMindChoice = pendingFeatState.keenMindChoice;

    return (
      <KeenMindChoiceEditor
        choice={keenMindChoice}
        summary={getPendingKeenMindChoiceSummary(keenMindChoice)}
        isValid={isPendingKeenMindChoiceValid(keenMindChoice)}
        skillProficiencies={skillProficiencies}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            keenMindChoice: null
          }))
        }
        onSave={onSavePendingKeenMindChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            keenMindChoice: current.keenMindChoice ? nextChoice : current.keenMindChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.LIGHTLY_ARMORED && pendingFeatState.lightlyArmoredChoice) {
    return (
      <SingleAbilityEditor
        title="Lightly Armored"
        cancelLabel="Cancel lightly armored selection"
        label="Ability"
        summary={
          getPendingLightlyArmoredChoiceSummary(pendingFeatState.lightlyArmoredChoice) ?? ""
        }
        value={pendingFeatState.lightlyArmoredChoice.ability}
        options={[...lightlyArmoredAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            lightlyArmoredChoice: null
          }))
        }
        onSave={onSavePendingLightlyArmoredChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            lightlyArmoredChoice: current.lightlyArmoredChoice
              ? {
                  ability: nextValue as PendingLightlyArmoredChoice["ability"]
                }
              : current.lightlyArmoredChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.MAGE_SLAYER && pendingFeatState.mageSlayerChoice) {
    return (
      <SingleAbilityEditor
        title="Mage Slayer"
        cancelLabel="Cancel mage slayer selection"
        label="Ability"
        summary={getPendingMageSlayerChoiceSummary(pendingFeatState.mageSlayerChoice) ?? ""}
        value={pendingFeatState.mageSlayerChoice.ability}
        options={[...mageSlayerAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            mageSlayerChoice: null
          }))
        }
        onSave={onSavePendingMageSlayerChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            mageSlayerChoice: current.mageSlayerChoice
              ? {
                  ability: nextValue as PendingMageSlayerChoice["ability"]
                }
              : current.mageSlayerChoice
          }))
        }
      />
    );
  }

  if (
    featDefinition.feat === FEATS.MARTIAL_WEAPON_TRAINING &&
    pendingFeatState.martialWeaponTrainingChoice
  ) {
    return (
      <SingleAbilityEditor
        title="Martial Weapon Training"
        cancelLabel="Cancel martial weapon training selection"
        label="Ability"
        summary={
          getPendingMartialWeaponTrainingChoiceSummary(
            pendingFeatState.martialWeaponTrainingChoice
          ) ?? ""
        }
        value={pendingFeatState.martialWeaponTrainingChoice.ability}
        options={[...martialWeaponTrainingAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            martialWeaponTrainingChoice: null
          }))
        }
        onSave={onSavePendingMartialWeaponTrainingChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            martialWeaponTrainingChoice: current.martialWeaponTrainingChoice
              ? {
                  ability: nextValue as PendingMartialWeaponTrainingChoice["ability"]
                }
              : current.martialWeaponTrainingChoice
          }))
        }
      />
    );
  }

  if (
    featDefinition.feat === FEATS.MEDIUM_ARMOR_MASTER &&
    pendingFeatState.mediumArmorMasterChoice
  ) {
    return (
      <SingleAbilityEditor
        title="Medium Armor Master"
        cancelLabel="Cancel medium armor master selection"
        label="Ability"
        summary={
          getPendingMediumArmorMasterChoiceSummary(pendingFeatState.mediumArmorMasterChoice) ?? ""
        }
        value={pendingFeatState.mediumArmorMasterChoice.ability}
        options={[...mediumArmorMasterAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            mediumArmorMasterChoice: null
          }))
        }
        onSave={onSavePendingMediumArmorMasterChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            mediumArmorMasterChoice: current.mediumArmorMasterChoice
              ? {
                  ability: nextValue as PendingMediumArmorMasterChoice["ability"]
                }
              : current.mediumArmorMasterChoice
          }))
        }
      />
    );
  }

  if (
    featDefinition.feat === FEATS.MODERATELY_ARMORED &&
    pendingFeatState.moderatelyArmoredChoice
  ) {
    return (
      <SingleAbilityEditor
        title="Moderately Armored"
        cancelLabel="Cancel moderately armored selection"
        label="Ability"
        summary={
          getPendingModeratelyArmoredChoiceSummary(pendingFeatState.moderatelyArmoredChoice) ?? ""
        }
        value={pendingFeatState.moderatelyArmoredChoice.ability}
        options={[...moderatelyArmoredAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            moderatelyArmoredChoice: null
          }))
        }
        onSave={onSavePendingModeratelyArmoredChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            moderatelyArmoredChoice: current.moderatelyArmoredChoice
              ? {
                  ability: nextValue as PendingModeratelyArmoredChoice["ability"]
                }
              : current.moderatelyArmoredChoice
          }))
        }
      />
    );
  }

  if (
    featDefinition.feat === FEATS.MOUNTED_COMBATANT &&
    pendingFeatState.mountedCombatantChoice
  ) {
    return (
      <SingleAbilityEditor
        title="Mounted Combatant"
        cancelLabel="Cancel mounted combatant selection"
        label="Ability"
        summary={
          getPendingMountedCombatantChoiceSummary(pendingFeatState.mountedCombatantChoice) ?? ""
        }
        value={pendingFeatState.mountedCombatantChoice.ability}
        options={[...mountedCombatantAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            mountedCombatantChoice: null
          }))
        }
        onSave={onSavePendingMountedCombatantChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            mountedCombatantChoice: current.mountedCombatantChoice
              ? {
                  ability: nextValue as PendingMountedCombatantChoice["ability"]
                }
              : current.mountedCombatantChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.OBSERVANT && pendingFeatState.observantChoice) {
    const observantChoice = pendingFeatState.observantChoice;

    return (
      <ObservantChoiceEditor
        choice={observantChoice}
        summary={getPendingObservantChoiceSummary(observantChoice)}
        isValid={isPendingObservantChoiceValid(observantChoice)}
        skillProficiencies={skillProficiencies}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            observantChoice: null
          }))
        }
        onSave={onSavePendingObservantChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            observantChoice: current.observantChoice ? nextChoice : current.observantChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.PIERCER && pendingFeatState.piercerChoice) {
    return (
      <SingleAbilityEditor
        title="Piercer"
        cancelLabel="Cancel piercer selection"
        label="Ability"
        summary={getPendingPiercerChoiceSummary(pendingFeatState.piercerChoice) ?? ""}
        value={pendingFeatState.piercerChoice.ability}
        options={[...piercerAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            piercerChoice: null
          }))
        }
        onSave={onSavePendingPiercerChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            piercerChoice: current.piercerChoice
              ? {
                  ability: nextValue as PendingPiercerChoice["ability"]
                }
              : current.piercerChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.POISONER && pendingFeatState.poisonerChoice) {
    return (
      <SingleAbilityEditor
        title="Poisoner"
        cancelLabel="Cancel poisoner selection"
        label="Ability"
        summary={getPendingPoisonerChoiceSummary(pendingFeatState.poisonerChoice) ?? ""}
        value={pendingFeatState.poisonerChoice.ability}
        options={[...poisonerAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            poisonerChoice: null
          }))
        }
        onSave={onSavePendingPoisonerChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            poisonerChoice: current.poisonerChoice
              ? {
                  ability: nextValue as PendingPoisonerChoice["ability"]
                }
              : current.poisonerChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.RESILIENT && pendingFeatState.resilientChoice) {
    const resilientChoice = pendingFeatState.resilientChoice;

    return (
      <ResilientChoiceEditor
        choice={resilientChoice}
        summary={getPendingResilientChoiceSummary(resilientChoice)}
        isValid={isPendingResilientChoiceValid(resilientChoice)}
        savingThrowProficiencies={savingThrowProficiencies}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            resilientChoice: null
          }))
        }
        onSave={onSavePendingResilientChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            resilientChoice: current.resilientChoice ? nextChoice : current.resilientChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.SPEEDY && pendingFeatState.speedyChoice) {
    return (
      <SingleAbilityEditor
        title="Speedy"
        cancelLabel="Cancel speedy selection"
        label="Ability"
        summary={getPendingSpeedyChoiceSummary(pendingFeatState.speedyChoice) ?? ""}
        value={pendingFeatState.speedyChoice.ability}
        options={[...speedyAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            speedyChoice: null
          }))
        }
        onSave={onSavePendingSpeedyChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            speedyChoice: current.speedyChoice
              ? {
                  ability: nextValue as PendingSpeedyChoice["ability"]
                }
              : current.speedyChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.WEAPON_MASTER && pendingFeatState.weaponMasterChoice) {
    const weaponMasterChoice = pendingFeatState.weaponMasterChoice;

    return (
      <WeaponMasterChoiceEditor
        choice={weaponMasterChoice}
        summary={getPendingWeaponMasterChoiceSummary(weaponMasterChoice)}
        isValid={isPendingWeaponMasterChoiceValid(weaponMasterChoice)}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            weaponMasterChoice: null
          }))
        }
        onSave={onSavePendingWeaponMasterChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            weaponMasterChoice: current.weaponMasterChoice
              ? nextChoice
              : current.weaponMasterChoice
          }))
        }
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

  if (featDefinition.feat === FEATS.MAGIC_INITIATE && pendingFeatState.magicInitiateChoice) {
    const magicInitiateChoice = pendingFeatState.magicInitiateChoice;

    return (
      <MagicInitiateChoiceEditor
        choice={magicInitiateChoice}
        selectedEntries={selectedEntries}
        summary={getPendingMagicInitiateChoiceSummary(magicInitiateChoice)}
        isValid={isPendingMagicInitiateChoiceValid(magicInitiateChoice)}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            magicInitiateChoice: null
          }))
        }
        onSave={onSavePendingMagicInitiateChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            magicInitiateChoice: current.magicInitiateChoice ? nextChoice : current.magicInitiateChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.MUSICIAN && pendingFeatState.musicianChoice) {
    const musicianChoice = pendingFeatState.musicianChoice;

    return (
      <MusicianChoiceEditor
        choice={musicianChoice}
        summary={getPendingMusicianChoiceSummary(musicianChoice)}
        isValid={isPendingMusicianChoiceValid(musicianChoice)}
        toolProficiencies={toolProficiencies}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            musicianChoice: null
          }))
        }
        onSave={onSavePendingMusicianChoice}
        onChange={(selectionIndex, nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            musicianChoice: current.musicianChoice
              ? {
                  toolProficiencies: updateSelectionAtIndex(
                    current.musicianChoice.toolProficiencies,
                    3,
                    selectionIndex,
                    nextValue
                  ) as PendingMusicianChoice["toolProficiencies"]
                }
              : current.musicianChoice
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
  skillProficiencies,
  savingThrowProficiencies,
  weaponProficiencies,
  toolProficiencies,
  selectedEntries,
  editingFeatEntryId,
  pendingFeatState,
  blessedWarriorCantripOptions,
  druidicWarriorCantripOptions,
  renderTrackingButton,
  onOpenFeatReference,
  onAddFeat,
  onEditFeat,
  onRemoveFeat,
  onPendingFeatStateChange,
  onSavePendingAbilityScoreImprovement,
  onSavePendingAthleteChoice,
  onSavePendingChargerChoice,
  onSavePendingChefChoice,
  onSavePendingCrusherChoice,
  onSavePendingDualWielderChoice,
  onSavePendingElementalAdeptChoice,
  onSavePendingFeyTouchedChoice,
  onSavePendingHeavilyArmoredChoice,
  onSavePendingHeavyArmorMasterChoice,
  onSavePendingInspiringLeaderChoice,
  onSavePendingKeenMindChoice,
  onSavePendingLightlyArmoredChoice,
  onSavePendingMageSlayerChoice,
  onSavePendingMartialWeaponTrainingChoice,
  onSavePendingMediumArmorMasterChoice,
  onSavePendingModeratelyArmoredChoice,
  onSavePendingMountedCombatantChoice,
  onSavePendingObservantChoice,
  onSavePendingPiercerChoice,
  onSavePendingPoisonerChoice,
  onSavePendingResilientChoice,
  onSavePendingSpeedyChoice,
  onSavePendingWeaponMasterChoice,
  onSavePendingBoonOfIrresistibleOffense,
  onSavePendingBlessedWarriorChoice,
  onSavePendingCrafterChoice,
  onSavePendingDruidicWarriorChoice,
  onSavePendingEpicBoonAbilityChoice,
  onSavePendingMagicInitiateChoice,
  onSavePendingMusicianChoice,
  onSavePendingSkilledChoice
}: FeatEditorCardProps) {
  const isRepeatable = Boolean(featDefinition.repeatable);
  const isSelected = selectedEntries.length > 0;
  const canEditFeat = createPendingFeatStateForFeat(featDefinition.feat) !== null;
  const unmetRequirementText = featEligibility?.unmetRequirements.join(" ") ?? "";
  const isRequirementBlocked = featEligibility ? !featEligibility.isEligible : false;
  const isAddDisabled = (!isRepeatable && isSelected) || isRequirementBlocked;
  const selectedEntry = selectedEntries[0];
  const isSelectedEntryRemovable = selectedEntry ? isFeatEntryRemovable(selectedEntry) : false;
  const lockedRemoveTitle = "This feat is locked to its source.";

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
              {canEditFeat ? (
                <button
                  type="button"
                  className={cardStyles.selectedRemoveButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEditFeat(entry);
                  }}
                  aria-label={`Edit ${featDefinition.label}`}
                >
                  <Pencil size={14} />
                </button>
              ) : null}
              <button
                type="button"
                className={cardStyles.selectedRemoveButton}
                disabled={!isFeatEntryRemovable(entry)}
                title={!isFeatEntryRemovable(entry) ? lockedRemoveTitle : undefined}
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
        skillProficiencies,
        savingThrowProficiencies,
        weaponProficiencies,
        toolProficiencies,
        selectedEntries,
        editingFeatEntryId,
        pendingFeatState,
        blessedWarriorCantripOptions,
        druidicWarriorCantripOptions,
        onPendingFeatStateChange,
        onSavePendingAbilityScoreImprovement,
        onSavePendingAthleteChoice,
        onSavePendingChargerChoice,
        onSavePendingChefChoice,
        onSavePendingCrusherChoice,
        onSavePendingDualWielderChoice,
        onSavePendingElementalAdeptChoice,
        onSavePendingFeyTouchedChoice,
        onSavePendingHeavilyArmoredChoice,
        onSavePendingHeavyArmorMasterChoice,
        onSavePendingInspiringLeaderChoice,
        onSavePendingKeenMindChoice,
        onSavePendingLightlyArmoredChoice,
        onSavePendingMageSlayerChoice,
        onSavePendingMartialWeaponTrainingChoice,
        onSavePendingMediumArmorMasterChoice,
        onSavePendingModeratelyArmoredChoice,
        onSavePendingMountedCombatantChoice,
        onSavePendingObservantChoice,
        onSavePendingPiercerChoice,
        onSavePendingPoisonerChoice,
        onSavePendingResilientChoice,
        onSavePendingSpeedyChoice,
        onSavePendingWeaponMasterChoice,
        onSavePendingBoonOfIrresistibleOffense,
        onSavePendingBlessedWarriorChoice,
        onSavePendingCrafterChoice,
        onSavePendingDruidicWarriorChoice,
        onSavePendingEpicBoonAbilityChoice,
        onSavePendingMagicInitiateChoice,
        onSavePendingMusicianChoice,
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
        ) : selectedEntry ? (
          <>
            {canEditFeat ? (
              <button
                type="button"
                className={clsx(shared.editButton, modalStyles.addButton)}
                onClick={(event) => {
                  event.stopPropagation();
                  onEditFeat(selectedEntry);
                }}
              >
                <Pencil size={16} />
                Edit
              </button>
            ) : null}
            <button
              type="button"
              className={clsx(shared.editButton, modalStyles.removeActionButton)}
              disabled={!isSelectedEntryRemovable}
              title={!isSelectedEntryRemovable ? lockedRemoveTitle : undefined}
              onClick={(event) => {
                event.stopPropagation();
                onRemoveFeat(selectedEntry);
              }}
            >
              <X size={16} />
              Remove
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
}

export default FeatEditorCard;
