import { cantripChoices } from "../../../../../pages/CharactersPage/feats/cantripChoices";
import {
  singleAbilityChoices,
  getSingleAbilityChoiceSummary
} from "../../../../../pages/CharactersPage/feats/singleAbilityChoices";
import clsx from "clsx";
import { Pencil, Plus, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { getFeatureTrackingState, type SpellEntry } from "../../../../../codex/entries";
import { FEATS } from "../../../../../codex/entries/enums";
import { abilityKeys } from "../../../../../pages/CharactersPage/constants";
import {
  boonOfEnergyResistanceDamageTypeOptions,
  coldCasterAbilityOptions,
  dragonscarredAbilityOptions,
  dragonscarredDamageTypeOptions,
  elementalAdeptAbilityOptions,
  elementalAdeptDamageTypeOptions,
  feyTouchedAbilityOptions,
  keenMindSkillOptions,
  observantAbilityOptions,
  observantSkillOptions,
  ritualCasterAbilityOptions,
  resilientAbilityOptions,
  shadowTouchedAbilityOptions,
  skillExpertAbilityOptions,
  weaponMasterAbilityOptions,
  weaponMasterMasteryOptions,
  getAbilityScoreImprovementSummary,
  coldCasterRayOfFrostSpellId,
  getEpicBoonAbilityChoiceSummary,
  getEpicBoonAbilityOptions,
  getColdCasterCantripOptions,
  getFeatAbilityIncreaseMaxScore,
  getMagicInitiateCantripOptions,
  emeraldEnclaveFledglingSpellcastingAbilityOptions,
  getFeyTouchedSpellOptions,
  getMagicInitiateLevelOneSpellOptions,
  getMagicInitiateSpellListLabel,
  getRitualCasterSpellOptions,
  getShadowTouchedSpellOptions,
  isMagicInitiateSpellList,
  isFeatEntryRemovable,
  magicInitiateSpellListOptions,
  magicInitiateSpellcastingAbilityOptions,
  spellfireSparkSpellcastingAbilityOptions,
  purpleDragonRookSkillOptions,
  type FeatDefinition
} from "../../../../../pages/CharactersPage/feats";
import {
  getToolProficiencyLabel,
  musicalInstrumentToolProficiencies,
  skillsOptions,
  toolProficiencyOptions,
  type ToolProficiency
} from "../../../../../pages/CharactersPage/proficiencyOptions";
import {
  getSavingThrowLevelFromEntries,
  getSavingThrowProficiencyForAbilityKey
} from "../../../../../pages/CharactersPage/proficiency";
import { getWeaponProficiencyLabel } from "../../../../../pages/CharactersPage/proficiencyWeaponLabels";
import { crafterFastCraftingToolProficiencies } from "../../../../../pages/CharactersPage/feats/crafter";
import {
  cultOfDragonInitiateDefaultLanguage,
  cultOfDragonInitiateLanguageOptions,
  getCultOfDragonInitiateLanguageLabel,
  hasDraconicLanguageFromOtherSource
} from "../../../../../pages/CharactersPage/feats/cultOfDragonInitiate";
import {
  PROF_LEVEL,
  type AbilityKey,
  type CharacterFeatEntry,
  type LanguageProficiencyEntry,
  type SavingThrowProficiencyEntry,
  type SkillName,
  type SkillProficiencyEntry,
  type ToolProficiencyEntry,
  type WeaponProficiencyEntry
} from "../../../../../types";
import type { FeatEligibilityResult } from "../../../../../pages/CharactersPage/feats/eligibility";
import { formatCodexLabel } from "../../../../../utils/codex";
import ActionButton from "../../../../ActionButton";
import SelectInput from "../../../FormInputs/SelectInput";
import SheetActionButton from "../../SheetActionButton";
import cardStyles from "../FeatCards.module.css";
import modalStyles from "../FeatEditorModal.module.css";
import {
  CantripChoiceEditor,
  InlineEditorFrame,
  SelectField,
  SingleAbilityEditor
} from "../FeatEditorPrimitives";
import {
  getPendingBoonOfEnergyResistanceChoiceSummary,
  getPendingBoonOfSkillChoiceSummary,
  getPendingColdCasterChoiceSummary,
  getPendingDragonscarredChoiceSummary,
  getPendingElementalAdeptChoiceSummary,
  getPendingFeyTouchedChoiceSummary,
  getPendingKeenMindChoiceSummary,
  getPendingObservantChoiceSummary,
  getPendingRitualCasterChoiceSummary,
  getPendingResilientChoiceSummary,
  getPendingShadowTouchedChoiceSummary,
  getPendingSkillExpertChoiceSummary,
  getPendingWeaponMasterChoiceSummary,
  getPendingCrafterChoiceSummary,
  getPendingEmeraldEnclaveFledglingChoiceSummary,
  getPendingHarperAgentChoiceSummary,
  getPendingPurpleDragonRookChoiceSummary,
  getPendingSpellfireSparkChoiceSummary,
  getPendingMagicInitiateChoiceSummary,
  getPendingCultOfDragonInitiateChoiceSummary,
  getPendingMusicianChoiceSummary,
  getPendingSkilledChoiceSummary,
  getRepeatableFeatEntrySummary,
  isPendingBoonOfEnergyResistanceChoiceValid,
  isPendingBoonOfSkillChoiceValid,
  isPendingColdCasterChoiceValid,
  isPendingCrafterChoiceValid,
  isPendingDragonscarredChoiceValid,
  isPendingEmeraldEnclaveFledglingChoiceValid,
  isPendingHarperAgentChoiceValid,
  isPendingPurpleDragonRookChoiceValid,
  isPendingSpellfireSparkChoiceValid,
  isPendingFeyTouchedChoiceValid,
  isPendingKeenMindChoiceValid,
  isPendingObservantChoiceValid,
  isPendingResilientChoiceValid,
  isPendingRitualCasterChoiceValid,
  isPendingShadowTouchedChoiceValid,
  isPendingSkillExpertChoiceValid,
  isPendingWeaponMasterChoiceValid,
  isPendingMagicInitiateChoiceValid,
  isPendingCultOfDragonInitiateChoiceValid,
  isPendingMusicianChoiceValid,
  isPendingSkilledChoiceValid,
  createPendingFeatStateForFeat,
  crafterNoneOptionValue,
  crafterSelectionIndices,
  feyTouchedNoneOptionValue,
  getRitualCasterSpellCountForLevel,
  magicInitiateCantripSelectionIndices,
  cultOfDragonInitiateNoneOptionValue,
  emeraldEnclaveFledglingNoneOptionValue,
  harperAgentNoneOptionValue,
  purpleDragonRookNoneOptionValue,
  spellfireSparkNoneOptionValue,
  magicInitiateNoneOptionValue,
  musicianNoneOptionValue,
  musicianSelectionIndices,
  keenMindNoneOptionValue,
  boonOfSkillNoneOptionValue,
  observantNoneOptionValue,
  resilientNoneOptionValue,
  ritualCasterNoneOptionValue,
  shadowTouchedNoneOptionValue,
  skillExpertNoneOptionValue,
  skilledNoneOptionValue,
  skilledSelectionIndices,
  weaponMasterNoneOptionValue,
  triggerActionOnEnterOrSpace
} from "../featEditorUtils";
import {
  buildSkillSelectOptions,
  buildToolSelectOptions,
  getEffectiveNonExpertSkillOptions,
  getEffectiveProficientSkillOptions,
  getSourceChoiceSkillOptions,
  getSourceChoiceToolOptions,
  updateSelectionAtIndex
} from "../helpers";
import type {
  PendingAbilityScoreImprovement,
  PendingBoonOfEnergyResistanceChoice,
  PendingBoonOfSkillChoice,
  PendingColdCasterChoice,
  PendingCrafterChoice,
  PendingCultOfDragonInitiateChoice,
  PendingDragonscarredChoice,
  PendingEmeraldEnclaveFledglingChoice,
  PendingElementalAdeptChoice,
  PendingFeyTouchedChoice,
  PendingFeatState,
  PendingHarperAgentChoice,
  PendingPurpleDragonRookChoice,
  PendingSpellfireSparkChoice,
  PendingKeenMindChoice,
  PendingMagicInitiateChoice,
  PendingObservantChoice,
  PendingRitualCasterChoice,
  PendingResilientChoice,
  PendingShadowTouchedChoice,
  PendingSkillExpertChoice,
  PendingWeaponMasterChoice,
  PendingMusicianChoice,
  TrackingButtonRenderer
} from "../types";

type FeatEditorCardProps = {
  featDefinition: FeatDefinition;
  featEligibility?: FeatEligibilityResult;
  characterLevel: number;
  skillProficiencies: SkillProficiencyEntry[];
  savingThrowProficiencies: SavingThrowProficiencyEntry[];
  weaponProficiencies: WeaponProficiencyEntry[];
  toolProficiencies: ToolProficiencyEntry[];
  languageProficiencies: LanguageProficiencyEntry[];
  selectedEntries: CharacterFeatEntry[];
  editingFeatEntryId: string | null;
  pendingFeatState: PendingFeatState;
  blessedWarriorCantripOptions: SpellEntry[];
  coldCasterKnowsRayOfFrost: boolean;
  druidicWarriorCantripOptions: SpellEntry[];
  hideFooter?: boolean;
  renderTrackingButton: TrackingButtonRenderer;
  onOpenFeatReference: (feat: FEATS) => void;
  onAddFeat: (feat: FEATS) => void;
  onEditFeat: (entry: CharacterFeatEntry) => void;
  onRemoveFeat: (entry: CharacterFeatEntry) => void;
  onPendingFeatStateChange: Dispatch<SetStateAction<PendingFeatState>>;
  onSavePendingAbilityScoreImprovement: () => void;
  onSavePendingAthleteChoice: () => void;
  onSavePendingChargerChoice: () => void;
  onSavePendingGrapplerChoice: () => void;
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
  onSavePendingPolearmMasterChoice: () => void;
  onSavePendingRitualCasterChoice: () => void;
  onSavePendingResilientChoice: () => void;
  onSavePendingSentinelChoice: () => void;
  onSavePendingShadowTouchedChoice: () => void;
  onSavePendingSlasherChoice: () => void;
  onSavePendingSpellSniperChoice: () => void;
  onSavePendingTelekineticChoice: () => void;
  onSavePendingTelepathicChoice: () => void;
  onSavePendingWarCasterChoice: () => void;
  onSavePendingSkillExpertChoice: () => void;
  onSavePendingSpeedyChoice: () => void;
  onSavePendingWeaponMasterChoice: () => void;
  onSavePendingBoonOfEnergyResistanceChoice: () => void;
  onSavePendingBoonOfIrresistibleOffense: () => void;
  onSavePendingBoonOfSkillChoice: () => void;
  onSavePendingBlessedWarriorChoice: () => void;
  onSavePendingColdCasterChoice: () => void;
  onSavePendingDragonscarredChoice: () => void;
  onSavePendingCrafterChoice: () => void;
  onSavePendingDruidicWarriorChoice: () => void;
  onSavePendingEpicBoonAbilityChoice: () => void;
  onSavePendingMagicInitiateChoice: () => void;
  onSavePendingCultOfDragonInitiateChoice: () => void;
  onSavePendingEmeraldEnclaveFledglingChoice: () => void;
  onSavePendingHarperAgentChoice: () => void;
  onSavePendingPurpleDragonRookChoice: () => void;
  onSavePendingSpellfireSparkChoice: () => void;
  onSavePendingMusicianChoice: () => void;
  onSavePendingSkilledChoice: () => void;
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

type BoonOfEnergyResistanceChoiceEditorProps = {
  choice: PendingBoonOfEnergyResistanceChoice;
  summary: string | null;
  isValid: boolean;
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingBoonOfEnergyResistanceChoice) => void;
};

type BoonOfSkillChoiceEditorProps = {
  choice: PendingBoonOfSkillChoice;
  summary: string | null;
  isValid: boolean;
  skillProficiencies: SkillProficiencyEntry[];
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingBoonOfSkillChoice) => void;
};

type ColdCasterChoiceEditorProps = {
  choice: PendingColdCasterChoice;
  knowsRayOfFrost: boolean;
  summary: string | null;
  isValid: boolean;
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingColdCasterChoice) => void;
};

type DragonscarredChoiceEditorProps = {
  choice: PendingDragonscarredChoice;
  summary: string | null;
  isValid: boolean;
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingDragonscarredChoice) => void;
};

type FeyTouchedChoiceEditorProps = {
  choice: PendingFeyTouchedChoice;
  summary: string | null;
  isValid: boolean;
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingFeyTouchedChoice) => void;
};

type RitualCasterChoiceEditorProps = {
  choice: PendingRitualCasterChoice;
  characterLevel: number;
  summary: string | null;
  isValid: boolean;
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingRitualCasterChoice) => void;
};

type ShadowTouchedChoiceEditorProps = {
  choice: PendingShadowTouchedChoice;
  summary: string | null;
  isValid: boolean;
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingShadowTouchedChoice) => void;
};

type SkillExpertChoiceEditorProps = {
  choice: PendingSkillExpertChoice;
  summary: string | null;
  isValid: boolean;
  skillProficiencies: SkillProficiencyEntry[];
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingSkillExpertChoice) => void;
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

type HarperAgentChoiceEditorProps = {
  choice: PendingHarperAgentChoice;
  summary: string | null;
  isValid: boolean;
  toolProficiencies: ToolProficiencyEntry[];
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextValue: string) => void;
};

type PurpleDragonRookChoiceEditorProps = {
  choice: PendingPurpleDragonRookChoice;
  summary: string | null;
  isValid: boolean;
  skillProficiencies: SkillProficiencyEntry[];
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextValue: string) => void;
};

type SpellfireSparkChoiceEditorProps = {
  choice: PendingSpellfireSparkChoice;
  summary: string | null;
  isValid: boolean;
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingSpellfireSparkChoice) => void;
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

type CultOfDragonInitiateChoiceEditorProps = {
  choice: PendingCultOfDragonInitiateChoice;
  languageProficiencies: LanguageProficiencyEntry[];
  editingFeatEntryId: string | null;
  summary: string | null;
  isValid: boolean;
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingCultOfDragonInitiateChoice) => void;
};

type EmeraldEnclaveFledglingChoiceEditorProps = {
  choice: PendingEmeraldEnclaveFledglingChoice;
  summary: string | null;
  isValid: boolean;
  onCancel: () => void;
  onSave: () => void;
  onChange: (nextChoice: PendingEmeraldEnclaveFledglingChoice) => void;
};

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

function BoonOfEnergyResistanceChoiceEditor({
  choice,
  summary,
  isValid,
  onCancel,
  onSave,
  onChange
}: BoonOfEnergyResistanceChoiceEditorProps) {
  return (
    <InlineEditorFrame
      title="Boon of Energy Resistance"
      cancelLabel="Cancel boon of energy resistance selection"
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
          options={abilityKeys.map((ability) => ({
            label: ability,
            value: ability
          }))}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              ability: nextValue as AbilityKey
            })
          }
        />
        {[0, 1].map((selectionIndex) => {
          const otherSelection = choice.damageTypes[selectionIndex === 0 ? 1 : 0];

          return (
            <SelectField
              key={`boon-energy-resistance-${selectionIndex}`}
              label={`Resistance ${selectionIndex + 1}`}
              value={choice.damageTypes[selectionIndex]}
              options={boonOfEnergyResistanceDamageTypeOptions.map((damageType) => ({
                disabled: damageType === otherSelection,
                label: formatCodexLabel(damageType),
                value: damageType
              }))}
              onChange={(nextValue) =>
                onChange({
                  ...choice,
                  damageTypes: updateSelectionAtIndex(
                    choice.damageTypes,
                    2,
                    selectionIndex,
                    nextValue
                  ) as PendingBoonOfEnergyResistanceChoice["damageTypes"]
                })
              }
            />
          );
        })}
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>Choose two different energy damage types.</p>
      ) : null}
    </InlineEditorFrame>
  );
}

function ColdCasterChoiceEditor({
  choice,
  knowsRayOfFrost,
  summary,
  isValid,
  onCancel,
  onSave,
  onChange
}: ColdCasterChoiceEditorProps) {
  const cantripOptions = knowsRayOfFrost
    ? getColdCasterCantripOptions().filter((spell) => spell.id !== coldCasterRayOfFrostSpellId)
    : getColdCasterCantripOptions().filter((spell) => spell.id === coldCasterRayOfFrostSpellId);

  return (
    <InlineEditorFrame
      title="Cold Caster"
      cancelLabel="Cancel cold caster selection"
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
          options={coldCasterAbilityOptions.map((ability) => ({
            label: ability,
            value: ability
          }))}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              ability: nextValue as PendingColdCasterChoice["ability"]
            })
          }
        />
        <SelectField
          label="Wizard Cantrip"
          value={choice.cantripId}
          disabled={!knowsRayOfFrost}
          options={cantripOptions.map((spell) => ({
            label: spell.name,
            value: spell.id
          }))}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              cantripId: nextValue
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>
          {knowsRayOfFrost
            ? "Choose a Wizard cantrip other than Ray of Frost."
            : "Ray of Frost is selected because you do not already know it."}
        </p>
      ) : null}
    </InlineEditorFrame>
  );
}

function DragonscarredChoiceEditor({
  choice,
  summary,
  isValid,
  onCancel,
  onSave,
  onChange
}: DragonscarredChoiceEditorProps) {
  return (
    <InlineEditorFrame
      title="Dragonscarred"
      cancelLabel="Cancel dragonscarred selection"
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
          options={dragonscarredAbilityOptions.map((ability) => ({
            label: ability,
            value: ability
          }))}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              ability: nextValue as PendingDragonscarredChoice["ability"]
            })
          }
        />
        <SelectField
          label="Damage Type"
          value={choice.damageType}
          options={dragonscarredDamageTypeOptions.map((damageType) => ({
            label: formatCodexLabel(damageType),
            value: damageType
          }))}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              damageType: nextValue as PendingDragonscarredChoice["damageType"]
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>Choose a Dragonscarred damage type.</p>
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
        <p className={modalStyles.validation}>Choose a level 1 Divination or Enchantment spell.</p>
      ) : null}
    </InlineEditorFrame>
  );
}

function RitualCasterChoiceEditor({
  choice,
  characterLevel,
  summary,
  isValid,
  onCancel,
  onSave,
  onChange
}: RitualCasterChoiceEditorProps) {
  const spellOptions = getRitualCasterSpellOptions();
  const spellCount = getRitualCasterSpellCountForLevel(characterLevel);
  const selectedSpellIds = Array.from(
    { length: spellCount },
    (_, index) => choice.spellIds[index] ?? ritualCasterNoneOptionValue
  );

  return (
    <InlineEditorFrame
      title="Ritual Caster"
      cancelLabel="Cancel ritual caster selection"
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
          options={ritualCasterAbilityOptions.map((ability) => ({
            label: ability,
            value: ability
          }))}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              ability: nextValue as PendingRitualCasterChoice["ability"]
            })
          }
        />
        {selectedSpellIds.map((selectedSpellId, selectionIndex) => {
          const blockedSpellIds = selectedSpellIds.filter(
            (spellId, index) => index !== selectionIndex && spellId !== ritualCasterNoneOptionValue
          );

          return (
            <SelectField
              key={`ritual-caster-spell-${selectionIndex}`}
              label={`Ritual Spell ${selectionIndex + 1}`}
              value={selectedSpellId}
              options={[
                {
                  label: "-",
                  value: ritualCasterNoneOptionValue
                },
                ...spellOptions.map((spell) => ({
                  disabled: blockedSpellIds.includes(spell.id),
                  label: spell.name,
                  value: spell.id
                }))
              ]}
              onChange={(nextValue) =>
                onChange({
                  ...choice,
                  spellIds: updateSelectionAtIndex(
                    selectedSpellIds,
                    spellCount,
                    selectionIndex,
                    nextValue
                  )
                })
              }
            />
          );
        })}
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>
          Choose {spellCount} different level 1 Ritual spells.
        </p>
      ) : null}
    </InlineEditorFrame>
  );
}

function ShadowTouchedChoiceEditor({
  choice,
  summary,
  isValid,
  onCancel,
  onSave,
  onChange
}: ShadowTouchedChoiceEditorProps) {
  const spellOptions = getShadowTouchedSpellOptions();

  return (
    <InlineEditorFrame
      title="Shadow-Touched"
      cancelLabel="Cancel shadow-touched selection"
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
          options={shadowTouchedAbilityOptions.map((ability) => ({
            label: ability,
            value: ability
          }))}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              ability: nextValue as PendingShadowTouchedChoice["ability"]
            })
          }
        />
        <SelectField
          label="Level 1 Spell"
          value={choice.spellId}
          options={[
            {
              label: "-",
              value: shadowTouchedNoneOptionValue
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
        <p className={modalStyles.validation}>Choose a level 1 Illusion or Necromancy spell.</p>
      ) : null}
    </InlineEditorFrame>
  );
}

function BoonOfSkillChoiceEditor({
  choice,
  summary,
  isValid,
  skillProficiencies,
  onCancel,
  onSave,
  onChange
}: BoonOfSkillChoiceEditorProps) {
  const currentSkill =
    choice.skillExpertise === boonOfSkillNoneOptionValue
      ? null
      : (choice.skillExpertise as SkillName);
  const availableSkills = getEffectiveNonExpertSkillOptions(
    { skillProficiencies },
    skillsOptions,
    currentSkill
  );

  return (
    <InlineEditorFrame
      title="Boon of Skill"
      cancelLabel="Cancel boon of skill selection"
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
          options={abilityKeys.map((ability) => ({
            label: ability,
            value: ability
          }))}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              ability: nextValue as AbilityKey
            })
          }
        />
        <SelectField
          label="Expertise"
          value={choice.skillExpertise}
          options={[
            {
              label: "-",
              value: boonOfSkillNoneOptionValue
            },
            ...buildSkillSelectOptions(skillsOptions, availableSkills, currentSkill).map(
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
              skillExpertise: nextValue as PendingBoonOfSkillChoice["skillExpertise"]
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>
          Choose a skill that does not already have Expertise.
        </p>
      ) : null}
    </InlineEditorFrame>
  );
}

function SkillExpertChoiceEditor({
  choice,
  summary,
  isValid,
  skillProficiencies,
  onCancel,
  onSave,
  onChange
}: SkillExpertChoiceEditorProps) {
  const currentSkillProficiency =
    choice.skillProficiency === skillExpertNoneOptionValue
      ? null
      : (choice.skillProficiency as SkillName);
  const currentSkillExpertise =
    choice.skillExpertise === skillExpertNoneOptionValue
      ? null
      : (choice.skillExpertise as SkillName);
  const availableProficiencySkills = getSourceChoiceSkillOptions(
    { skillProficiencies },
    skillsOptions,
    currentSkillProficiency
  );
  const availableExpertiseSkills = [
    ...new Set([
      ...getEffectiveProficientSkillOptions(
        { skillProficiencies },
        skillsOptions,
        currentSkillExpertise
      ),
      ...(currentSkillProficiency ? [currentSkillProficiency] : [])
    ])
  ];

  return (
    <InlineEditorFrame
      title="Skill Expert"
      cancelLabel="Cancel skill expert selection"
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
          options={skillExpertAbilityOptions.map((ability) => ({
            label: ability,
            value: ability
          }))}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              ability: nextValue as PendingSkillExpertChoice["ability"]
            })
          }
        />
        <SelectField
          label="Skill Proficiency"
          value={choice.skillProficiency}
          options={[
            {
              label: "-",
              value: skillExpertNoneOptionValue
            },
            ...buildSkillSelectOptions(
              skillsOptions,
              availableProficiencySkills,
              currentSkillProficiency
            ).map((option) => ({
              disabled: option.disabled,
              label: option.label,
              value: option.skill
            }))
          ]}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              skillProficiency: nextValue as PendingSkillExpertChoice["skillProficiency"],
              skillExpertise:
                choice.skillExpertise === choice.skillProficiency
                  ? skillExpertNoneOptionValue
                  : choice.skillExpertise
            })
          }
        />
        <SelectField
          label="Expertise"
          value={choice.skillExpertise}
          options={[
            {
              label: "-",
              value: skillExpertNoneOptionValue
            },
            ...buildSkillSelectOptions(
              skillsOptions,
              availableExpertiseSkills,
              currentSkillExpertise
            ).map((option) => ({
              disabled: option.disabled,
              label: option.label,
              value: option.skill
            }))
          ]}
          onChange={(nextValue) =>
            onChange({
              ...choice,
              skillExpertise: nextValue as PendingSkillExpertChoice["skillExpertise"]
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>
          Choose an ability, one new skill proficiency, and one proficient skill for Expertise.
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
  const availableSkills = getEffectiveNonExpertSkillOptions(
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
  const availableSkills = getEffectiveNonExpertSkillOptions(
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
          const availableTools = getSourceChoiceToolOptions(
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
          const availableTools = getSourceChoiceToolOptions(
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

function HarperAgentChoiceEditor({
  choice,
  summary,
  isValid,
  toolProficiencies,
  onCancel,
  onSave,
  onChange
}: HarperAgentChoiceEditorProps) {
  const currentValue = choice.toolProficiency;
  const currentTool =
    currentValue === harperAgentNoneOptionValue ? null : (currentValue as ToolProficiency);
  const availableTools = getSourceChoiceToolOptions(
    { toolProficiencies },
    musicalInstrumentToolProficiencies,
    currentTool,
    []
  );

  return (
    <InlineEditorFrame
      title="Harper Agent"
      cancelLabel="Cancel Harper Agent instrument selection"
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
          label="Instrument"
          value={currentValue}
          options={[
            {
              label: "-",
              value: harperAgentNoneOptionValue
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
          onChange={onChange}
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? <p className={modalStyles.validation}>Choose one Musical Instrument.</p> : null}
    </InlineEditorFrame>
  );
}

function PurpleDragonRookChoiceEditor({
  choice,
  summary,
  isValid,
  skillProficiencies,
  onCancel,
  onSave,
  onChange
}: PurpleDragonRookChoiceEditorProps) {
  const currentSkill =
    choice.skill === purpleDragonRookNoneOptionValue ? null : (choice.skill as SkillName);
  const availableSkills = getSourceChoiceSkillOptions(
    { skillProficiencies },
    purpleDragonRookSkillOptions,
    currentSkill,
    []
  );

  return (
    <InlineEditorFrame
      title="Purple Dragon Rook"
      cancelLabel="Cancel Purple Dragon Rook skill selection"
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
              value: purpleDragonRookNoneOptionValue
            },
            ...buildSkillSelectOptions(
              purpleDragonRookSkillOptions,
              availableSkills,
              currentSkill
            ).map((option) => ({
              disabled: option.disabled,
              label: option.label,
              value: option.skill
            }))
          ]}
          onChange={onChange}
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>Choose Insight, Performance, or Persuasion.</p>
      ) : null}
    </InlineEditorFrame>
  );
}

function SpellfireSparkChoiceEditor({
  choice,
  summary,
  isValid,
  onCancel,
  onSave,
  onChange
}: SpellfireSparkChoiceEditorProps) {
  return (
    <InlineEditorFrame
      title="Spellfire Spark"
      cancelLabel="Cancel Spellfire Spark spellcasting ability selection"
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
          label="Spellcasting Ability"
          value={choice.spellcastingAbility}
          options={[
            {
              label: "-",
              value: spellfireSparkNoneOptionValue
            },
            ...spellfireSparkSpellcastingAbilityOptions.map((ability) => ({
              label: ability,
              value: ability
            }))
          ]}
          onChange={(nextValue) =>
            onChange({
              spellcastingAbility: nextValue as PendingSpellfireSparkChoice["spellcastingAbility"]
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? <p className={modalStyles.validation}>Choose a spellcasting ability.</p> : null}
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

function CultOfDragonInitiateChoiceEditor({
  choice,
  languageProficiencies,
  editingFeatEntryId,
  summary,
  isValid,
  onCancel,
  onSave,
  onChange
}: CultOfDragonInitiateChoiceEditorProps) {
  const knowsDraconicFromOtherSource = hasDraconicLanguageFromOtherSource(
    languageProficiencies,
    editingFeatEntryId
  );
  const isLanguageLocked = !knowsDraconicFromOtherSource;

  return (
    <InlineEditorFrame
      title="Cult of the Dragon Initiate"
      cancelLabel="Cancel Cult of the Dragon Initiate language selection"
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
          label="Language"
          value={isLanguageLocked ? cultOfDragonInitiateDefaultLanguage : choice.language}
          disabled={isLanguageLocked}
          options={[
            ...(isLanguageLocked
              ? []
              : [
                  {
                    label: "-",
                    value: cultOfDragonInitiateNoneOptionValue
                  }
                ]),
            ...cultOfDragonInitiateLanguageOptions.map((language) => ({
              disabled:
                knowsDraconicFromOtherSource && language === cultOfDragonInitiateDefaultLanguage,
              label: getCultOfDragonInitiateLanguageLabel(language),
              value: language
            }))
          ]}
          onChange={(nextValue) =>
            onChange({
              language: nextValue as PendingCultOfDragonInitiateChoice["language"]
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? <p className={modalStyles.validation}>Choose a non-Draconic language.</p> : null}
    </InlineEditorFrame>
  );
}

function EmeraldEnclaveFledglingChoiceEditor({
  choice,
  summary,
  isValid,
  onCancel,
  onSave,
  onChange
}: EmeraldEnclaveFledglingChoiceEditorProps) {
  return (
    <InlineEditorFrame
      title="Emerald Enclave Fledgling"
      cancelLabel="Cancel Emerald Enclave Fledgling spellcasting ability selection"
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
          label="Spellcasting Ability"
          value={choice.spellcastingAbility}
          options={[
            {
              label: "-",
              value: emeraldEnclaveFledglingNoneOptionValue
            },
            ...emeraldEnclaveFledglingSpellcastingAbilityOptions.map((ability) => ({
              label: ability,
              value: ability
            }))
          ]}
          onChange={(nextValue) =>
            onChange({
              spellcastingAbility:
                nextValue as PendingEmeraldEnclaveFledglingChoice["spellcastingAbility"]
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? <p className={modalStyles.validation}>Choose a spellcasting ability.</p> : null}
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

const singleAbilityEditors = {
  [FEATS.ATHLETE]: {
    feat: FEATS.ATHLETE,
    pending: "athleteChoice",
    cancelLabel: "Cancel athlete selection",
    save: "onSavePendingAthleteChoice"
  },
  [FEATS.CHARGER]: {
    feat: FEATS.CHARGER,
    pending: "chargerChoice",
    cancelLabel: "Cancel charger selection",
    save: "onSavePendingChargerChoice"
  },
  [FEATS.GRAPPLER]: {
    feat: FEATS.GRAPPLER,
    pending: "grapplerChoice",
    cancelLabel: "Cancel grappler selection",
    save: "onSavePendingGrapplerChoice"
  },
  [FEATS.CHEF]: {
    feat: FEATS.CHEF,
    pending: "chefChoice",
    cancelLabel: "Cancel chef selection",
    save: "onSavePendingChefChoice"
  },
  [FEATS.CRUSHER]: {
    feat: FEATS.CRUSHER,
    pending: "crusherChoice",
    cancelLabel: "Cancel crusher selection",
    save: "onSavePendingCrusherChoice"
  },
  [FEATS.DUAL_WIELDER]: {
    feat: FEATS.DUAL_WIELDER,
    pending: "dualWielderChoice",
    cancelLabel: "Cancel dual wielder selection",
    save: "onSavePendingDualWielderChoice"
  },
  [FEATS.HEAVILY_ARMORED]: {
    feat: FEATS.HEAVILY_ARMORED,
    pending: "heavilyArmoredChoice",
    cancelLabel: "Cancel heavily armored selection",
    save: "onSavePendingHeavilyArmoredChoice"
  },
  [FEATS.HEAVY_ARMOR_MASTER]: {
    feat: FEATS.HEAVY_ARMOR_MASTER,
    pending: "heavyArmorMasterChoice",
    cancelLabel: "Cancel heavy armor master selection",
    save: "onSavePendingHeavyArmorMasterChoice"
  },
  [FEATS.INSPIRING_LEADER]: {
    feat: FEATS.INSPIRING_LEADER,
    pending: "inspiringLeaderChoice",
    cancelLabel: "Cancel inspiring leader selection",
    save: "onSavePendingInspiringLeaderChoice"
  },
  [FEATS.LIGHTLY_ARMORED]: {
    feat: FEATS.LIGHTLY_ARMORED,
    pending: "lightlyArmoredChoice",
    cancelLabel: "Cancel lightly armored selection",
    save: "onSavePendingLightlyArmoredChoice"
  },
  [FEATS.MAGE_SLAYER]: {
    feat: FEATS.MAGE_SLAYER,
    pending: "mageSlayerChoice",
    cancelLabel: "Cancel mage slayer selection",
    save: "onSavePendingMageSlayerChoice"
  },
  [FEATS.MARTIAL_WEAPON_TRAINING]: {
    feat: FEATS.MARTIAL_WEAPON_TRAINING,
    pending: "martialWeaponTrainingChoice",
    cancelLabel: "Cancel martial weapon training selection",
    save: "onSavePendingMartialWeaponTrainingChoice"
  },
  [FEATS.MEDIUM_ARMOR_MASTER]: {
    feat: FEATS.MEDIUM_ARMOR_MASTER,
    pending: "mediumArmorMasterChoice",
    cancelLabel: "Cancel medium armor master selection",
    save: "onSavePendingMediumArmorMasterChoice"
  },
  [FEATS.MODERATELY_ARMORED]: {
    feat: FEATS.MODERATELY_ARMORED,
    pending: "moderatelyArmoredChoice",
    cancelLabel: "Cancel moderately armored selection",
    save: "onSavePendingModeratelyArmoredChoice"
  },
  [FEATS.MOUNTED_COMBATANT]: {
    feat: FEATS.MOUNTED_COMBATANT,
    pending: "mountedCombatantChoice",
    cancelLabel: "Cancel mounted combatant selection",
    save: "onSavePendingMountedCombatantChoice"
  },
  [FEATS.PIERCER]: {
    feat: FEATS.PIERCER,
    pending: "piercerChoice",
    cancelLabel: "Cancel piercer selection",
    save: "onSavePendingPiercerChoice"
  },
  [FEATS.POISONER]: {
    feat: FEATS.POISONER,
    pending: "poisonerChoice",
    cancelLabel: "Cancel poisoner selection",
    save: "onSavePendingPoisonerChoice"
  },
  [FEATS.POLEARM_MASTER]: {
    feat: FEATS.POLEARM_MASTER,
    pending: "polearmMasterChoice",
    cancelLabel: "Cancel polearm master selection",
    save: "onSavePendingPolearmMasterChoice"
  },
  [FEATS.SENTINEL]: {
    feat: FEATS.SENTINEL,
    pending: "sentinelChoice",
    cancelLabel: "Cancel sentinel selection",
    save: "onSavePendingSentinelChoice"
  },
  [FEATS.SLASHER]: {
    feat: FEATS.SLASHER,
    pending: "slasherChoice",
    cancelLabel: "Cancel slasher selection",
    save: "onSavePendingSlasherChoice"
  },
  [FEATS.SPELL_SNIPER]: {
    feat: FEATS.SPELL_SNIPER,
    pending: "spellSniperChoice",
    cancelLabel: "Cancel spell sniper selection",
    save: "onSavePendingSpellSniperChoice"
  },
  [FEATS.TELEKINETIC]: {
    feat: FEATS.TELEKINETIC,
    pending: "telekineticChoice",
    cancelLabel: "Cancel telekinetic selection",
    save: "onSavePendingTelekineticChoice"
  },
  [FEATS.TELEPATHIC]: {
    feat: FEATS.TELEPATHIC,
    pending: "telepathicChoice",
    cancelLabel: "Cancel telepathic selection",
    save: "onSavePendingTelepathicChoice"
  },
  [FEATS.WAR_CASTER]: {
    feat: FEATS.WAR_CASTER,
    pending: "warCasterChoice",
    cancelLabel: "Cancel war caster selection",
    save: "onSavePendingWarCasterChoice"
  },
  [FEATS.SPEEDY]: {
    feat: FEATS.SPEEDY,
    pending: "speedyChoice",
    cancelLabel: "Cancel speedy selection",
    save: "onSavePendingSpeedyChoice"
  },
  [FEATS.BOON_OF_IRRESISTIBLE_OFFENSE]: {
    feat: FEATS.BOON_OF_IRRESISTIBLE_OFFENSE,
    pending: "boonOfIrresistibleOffense",
    cancelLabel: "Cancel boon of irresistible offense selection",
    save: "onSavePendingBoonOfIrresistibleOffense"
  }
} as const;

function renderInlineEditor(
  props: Omit<
    FeatEditorCardProps,
    "renderTrackingButton" | "onOpenFeatReference" | "onAddFeat" | "onEditFeat" | "onRemoveFeat"
  >
) {
  const {
    featDefinition,
    featEligibility,
    characterLevel,
    skillProficiencies,
    savingThrowProficiencies,
    toolProficiencies,
    languageProficiencies,
    selectedEntries,
    editingFeatEntryId,
    pendingFeatState,
    blessedWarriorCantripOptions,
    coldCasterKnowsRayOfFrost,
    druidicWarriorCantripOptions,
    onPendingFeatStateChange,
    onSavePendingAbilityScoreImprovement,
    onSavePendingElementalAdeptChoice,
    onSavePendingFeyTouchedChoice,
    onSavePendingKeenMindChoice,
    onSavePendingObservantChoice,
    onSavePendingRitualCasterChoice,
    onSavePendingResilientChoice,
    onSavePendingShadowTouchedChoice,
    onSavePendingSkillExpertChoice,
    onSavePendingWeaponMasterChoice,
    onSavePendingBoonOfEnergyResistanceChoice,
    onSavePendingBoonOfSkillChoice,
    onSavePendingBlessedWarriorChoice,
    onSavePendingColdCasterChoice,
    onSavePendingDragonscarredChoice,
    onSavePendingCrafterChoice,
    onSavePendingDruidicWarriorChoice,
    onSavePendingEpicBoonAbilityChoice,
    onSavePendingMagicInitiateChoice,
    onSavePendingCultOfDragonInitiateChoice,
    onSavePendingEmeraldEnclaveFledglingChoice,
    onSavePendingHarperAgentChoice,
    onSavePendingPurpleDragonRookChoice,
    onSavePendingSpellfireSparkChoice,
    onSavePendingMusicianChoice,
    onSavePendingSkilledChoice
  } = props;

  if (featEligibility && !featEligibility.isEligible) {
    return null;
  }
  const abilityEditor =
    singleAbilityEditors[featDefinition.feat as keyof typeof singleAbilityEditors];
  const abilityChoice = abilityEditor ? pendingFeatState[abilityEditor.pending] : null;
  if (abilityEditor && abilityChoice) {
    const definition = singleAbilityChoices[abilityEditor.feat];
    return (
      <SingleAbilityEditor
        title={definition.label}
        cancelLabel={abilityEditor.cancelLabel}
        label="Ability"
        summary={getSingleAbilityChoiceSummary(abilityChoice) ?? ""}
        value={abilityChoice.ability}
        options={[...definition.abilities]}
        onSave={props[abilityEditor.save]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({ ...current, [abilityEditor.pending]: null }))
        }
        onChange={(ability) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            [abilityEditor.pending]: current[abilityEditor.pending]
              ? (definition.normalize({ ability }) ?? current[abilityEditor.pending])
              : current[abilityEditor.pending]
          }))
        }
      />
    );
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

  if (featDefinition.feat === FEATS.COLD_CASTER && pendingFeatState.coldCasterChoice) {
    const coldCasterChoice = pendingFeatState.coldCasterChoice;

    return (
      <ColdCasterChoiceEditor
        choice={coldCasterChoice}
        knowsRayOfFrost={coldCasterKnowsRayOfFrost}
        summary={getPendingColdCasterChoiceSummary(coldCasterChoice, coldCasterKnowsRayOfFrost)}
        isValid={isPendingColdCasterChoiceValid(coldCasterChoice, coldCasterKnowsRayOfFrost)}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            coldCasterChoice: null
          }))
        }
        onSave={onSavePendingColdCasterChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            coldCasterChoice: current.coldCasterChoice ? nextChoice : current.coldCasterChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.DRAGONSCARRED && pendingFeatState.dragonscarredChoice) {
    const dragonscarredChoice = pendingFeatState.dragonscarredChoice;

    return (
      <DragonscarredChoiceEditor
        choice={dragonscarredChoice}
        summary={getPendingDragonscarredChoiceSummary(dragonscarredChoice)}
        isValid={isPendingDragonscarredChoiceValid(dragonscarredChoice)}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            dragonscarredChoice: null
          }))
        }
        onSave={onSavePendingDragonscarredChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            dragonscarredChoice: current.dragonscarredChoice
              ? nextChoice
              : current.dragonscarredChoice
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

  if (featDefinition.feat === FEATS.RITUAL_CASTER && pendingFeatState.ritualCasterChoice) {
    const ritualCasterChoice = pendingFeatState.ritualCasterChoice;

    return (
      <RitualCasterChoiceEditor
        choice={ritualCasterChoice}
        characterLevel={characterLevel}
        summary={getPendingRitualCasterChoiceSummary(ritualCasterChoice, characterLevel)}
        isValid={isPendingRitualCasterChoiceValid(ritualCasterChoice, characterLevel)}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            ritualCasterChoice: null
          }))
        }
        onSave={onSavePendingRitualCasterChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            ritualCasterChoice: current.ritualCasterChoice ? nextChoice : current.ritualCasterChoice
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

  if (featDefinition.feat === FEATS.SHADOW_TOUCHED && pendingFeatState.shadowTouchedChoice) {
    const shadowTouchedChoice = pendingFeatState.shadowTouchedChoice;

    return (
      <ShadowTouchedChoiceEditor
        choice={shadowTouchedChoice}
        summary={getPendingShadowTouchedChoiceSummary(shadowTouchedChoice)}
        isValid={isPendingShadowTouchedChoiceValid(shadowTouchedChoice)}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            shadowTouchedChoice: null
          }))
        }
        onSave={onSavePendingShadowTouchedChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            shadowTouchedChoice: current.shadowTouchedChoice
              ? nextChoice
              : current.shadowTouchedChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.SKILL_EXPERT && pendingFeatState.skillExpertChoice) {
    const skillExpertChoice = pendingFeatState.skillExpertChoice;

    return (
      <SkillExpertChoiceEditor
        choice={skillExpertChoice}
        summary={getPendingSkillExpertChoiceSummary(skillExpertChoice)}
        isValid={isPendingSkillExpertChoiceValid(skillExpertChoice)}
        skillProficiencies={skillProficiencies}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            skillExpertChoice: null
          }))
        }
        onSave={onSavePendingSkillExpertChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            skillExpertChoice: current.skillExpertChoice ? nextChoice : current.skillExpertChoice
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
            weaponMasterChoice: current.weaponMasterChoice ? nextChoice : current.weaponMasterChoice
          }))
        }
      />
    );
  }

  if (
    featDefinition.feat === FEATS.BOON_OF_ENERGY_RESISTANCE &&
    pendingFeatState.boonOfEnergyResistanceChoice
  ) {
    const choice = pendingFeatState.boonOfEnergyResistanceChoice;

    return (
      <BoonOfEnergyResistanceChoiceEditor
        choice={choice}
        summary={getPendingBoonOfEnergyResistanceChoiceSummary(choice)}
        isValid={isPendingBoonOfEnergyResistanceChoiceValid(choice)}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            boonOfEnergyResistanceChoice: null
          }))
        }
        onSave={onSavePendingBoonOfEnergyResistanceChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            boonOfEnergyResistanceChoice: current.boonOfEnergyResistanceChoice
              ? nextChoice
              : current.boonOfEnergyResistanceChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.BOON_OF_SKILL && pendingFeatState.boonOfSkillChoice) {
    const choice = pendingFeatState.boonOfSkillChoice;

    return (
      <BoonOfSkillChoiceEditor
        choice={choice}
        summary={getPendingBoonOfSkillChoiceSummary(choice)}
        isValid={isPendingBoonOfSkillChoiceValid(choice)}
        skillProficiencies={skillProficiencies}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            boonOfSkillChoice: null
          }))
        }
        onSave={onSavePendingBoonOfSkillChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            boonOfSkillChoice: current.boonOfSkillChoice ? nextChoice : current.boonOfSkillChoice
          }))
        }
      />
    );
  }

  if (
    featDefinition.feat === FEATS.BLESSED_WARRIOR ||
    featDefinition.feat === FEATS.DRUIDIC_WARRIOR
  ) {
    const feat = featDefinition.feat;
    const definition = cantripChoices[feat];
    const config =
      feat === FEATS.BLESSED_WARRIOR
        ? {
            field: "blessedWarriorChoice" as const,
            options: blessedWarriorCantripOptions,
            onSave: onSavePendingBlessedWarriorChoice
          }
        : {
            field: "druidicWarriorChoice" as const,
            options: druidicWarriorCantripOptions,
            onSave: onSavePendingDruidicWarriorChoice
          };
    const choice = pendingFeatState[config.field];
    if (choice)
      return (
        <CantripChoiceEditor
          title={definition.label}
          cancelLabel={definition.cancelLabel}
          choice={choice}
          options={config.options}
          summary={definition.getSummary(definition.decodeDraft(choice))}
          isValid={definition.decodeDraft(choice) !== null}
          validationMessage={definition.validationMessage}
          onCancel={() =>
            onPendingFeatStateChange((current) => ({ ...current, [config.field]: null }))
          }
          onSave={config.onSave}
          onChange={(selectionIndex, nextValue) =>
            onPendingFeatStateChange((current) => {
              const currentChoice = current[config.field];
              return {
                ...current,
                [config.field]: currentChoice
                  ? {
                      cantripIds: updateSelectionAtIndex(
                        currentChoice.cantripIds,
                        2,
                        selectionIndex,
                        nextValue
                      ) as [string, string]
                    }
                  : currentChoice
              };
            })
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
            magicInitiateChoice: current.magicInitiateChoice
              ? nextChoice
              : current.magicInitiateChoice
          }))
        }
      />
    );
  }

  if (
    featDefinition.feat === FEATS.CULT_OF_THE_DRAGON_INITIATE &&
    pendingFeatState.cultOfDragonInitiateChoice
  ) {
    const choice = pendingFeatState.cultOfDragonInitiateChoice;

    return (
      <CultOfDragonInitiateChoiceEditor
        choice={choice}
        languageProficiencies={languageProficiencies}
        editingFeatEntryId={editingFeatEntryId}
        summary={getPendingCultOfDragonInitiateChoiceSummary(
          choice,
          languageProficiencies,
          editingFeatEntryId
        )}
        isValid={isPendingCultOfDragonInitiateChoiceValid(
          choice,
          languageProficiencies,
          editingFeatEntryId
        )}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            cultOfDragonInitiateChoice: null
          }))
        }
        onSave={onSavePendingCultOfDragonInitiateChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            cultOfDragonInitiateChoice: current.cultOfDragonInitiateChoice
              ? nextChoice
              : current.cultOfDragonInitiateChoice
          }))
        }
      />
    );
  }

  if (
    featDefinition.feat === FEATS.EMERALD_ENCLAVE_FLEDGLING &&
    pendingFeatState.emeraldEnclaveFledglingChoice
  ) {
    const choice = pendingFeatState.emeraldEnclaveFledglingChoice;

    return (
      <EmeraldEnclaveFledglingChoiceEditor
        choice={choice}
        summary={getPendingEmeraldEnclaveFledglingChoiceSummary(choice)}
        isValid={isPendingEmeraldEnclaveFledglingChoiceValid(choice)}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            emeraldEnclaveFledglingChoice: null
          }))
        }
        onSave={onSavePendingEmeraldEnclaveFledglingChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            emeraldEnclaveFledglingChoice: current.emeraldEnclaveFledglingChoice
              ? nextChoice
              : current.emeraldEnclaveFledglingChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.HARPER_AGENT && pendingFeatState.harperAgentChoice) {
    const choice = pendingFeatState.harperAgentChoice;

    return (
      <HarperAgentChoiceEditor
        choice={choice}
        summary={getPendingHarperAgentChoiceSummary(choice)}
        isValid={isPendingHarperAgentChoiceValid(choice)}
        toolProficiencies={toolProficiencies}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            harperAgentChoice: null
          }))
        }
        onSave={onSavePendingHarperAgentChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            harperAgentChoice: current.harperAgentChoice
              ? {
                  toolProficiency: nextValue
                }
              : current.harperAgentChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.PURPLE_DRAGON_ROOK && pendingFeatState.purpleDragonRookChoice) {
    const choice = pendingFeatState.purpleDragonRookChoice;

    return (
      <PurpleDragonRookChoiceEditor
        choice={choice}
        summary={getPendingPurpleDragonRookChoiceSummary(choice)}
        isValid={isPendingPurpleDragonRookChoiceValid(choice)}
        skillProficiencies={skillProficiencies}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            purpleDragonRookChoice: null
          }))
        }
        onSave={onSavePendingPurpleDragonRookChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            purpleDragonRookChoice: current.purpleDragonRookChoice
              ? {
                  skill: nextValue as PendingPurpleDragonRookChoice["skill"]
                }
              : current.purpleDragonRookChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.SPELLFIRE_SPARK && pendingFeatState.spellfireSparkChoice) {
    const choice = pendingFeatState.spellfireSparkChoice;

    return (
      <SpellfireSparkChoiceEditor
        choice={choice}
        summary={getPendingSpellfireSparkChoiceSummary(choice)}
        isValid={isPendingSpellfireSparkChoiceValid(choice)}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            spellfireSparkChoice: null
          }))
        }
        onSave={onSavePendingSpellfireSparkChoice}
        onChange={(nextChoice) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            spellfireSparkChoice: current.spellfireSparkChoice
              ? nextChoice
              : current.spellfireSparkChoice
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
        })} (max ${getFeatAbilityIncreaseMaxScore(featDefinition.feat) ?? 30})`}
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
              <SelectInput
                compact
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
              </SelectInput>
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
  characterLevel,
  skillProficiencies,
  savingThrowProficiencies,
  weaponProficiencies,
  toolProficiencies,
  languageProficiencies,
  selectedEntries,
  editingFeatEntryId,
  pendingFeatState,
  blessedWarriorCantripOptions,
  coldCasterKnowsRayOfFrost,
  druidicWarriorCantripOptions,
  hideFooter = false,
  renderTrackingButton,
  onOpenFeatReference,
  onAddFeat,
  onEditFeat,
  onRemoveFeat,
  onPendingFeatStateChange,
  onSavePendingAbilityScoreImprovement,
  onSavePendingAthleteChoice,
  onSavePendingChargerChoice,
  onSavePendingGrapplerChoice,
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
  onSavePendingPolearmMasterChoice,
  onSavePendingRitualCasterChoice,
  onSavePendingResilientChoice,
  onSavePendingSentinelChoice,
  onSavePendingShadowTouchedChoice,
  onSavePendingSlasherChoice,
  onSavePendingSpellSniperChoice,
  onSavePendingTelekineticChoice,
  onSavePendingTelepathicChoice,
  onSavePendingWarCasterChoice,
  onSavePendingSkillExpertChoice,
  onSavePendingSpeedyChoice,
  onSavePendingWeaponMasterChoice,
  onSavePendingBoonOfEnergyResistanceChoice,
  onSavePendingBoonOfIrresistibleOffense,
  onSavePendingBoonOfSkillChoice,
  onSavePendingBlessedWarriorChoice,
  onSavePendingColdCasterChoice,
  onSavePendingDragonscarredChoice,
  onSavePendingCrafterChoice,
  onSavePendingDruidicWarriorChoice,
  onSavePendingEpicBoonAbilityChoice,
  onSavePendingMagicInitiateChoice,
  onSavePendingCultOfDragonInitiateChoice,
  onSavePendingEmeraldEnclaveFledglingChoice,
  onSavePendingHarperAgentChoice,
  onSavePendingPurpleDragonRookChoice,
  onSavePendingSpellfireSparkChoice,
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
          {renderTrackingButton(
            getFeatureTrackingState(featDefinition),
            featDefinition.trackingMessage
          )}
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
              <div className={cardStyles.selectedItemActions}>
                {canEditFeat ? (
                  <button
                    type="button"
                    className={clsx(
                      cardStyles.selectedRemoveButton,
                      cardStyles.selectedInlineActionButton
                    )}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditFeat(entry);
                    }}
                    aria-label={`Edit ${featDefinition.label}`}
                  >
                    <Pencil size={14} />
                    <span className={cardStyles.selectedActionLabel}>Edit</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  className={clsx(
                    cardStyles.selectedRemoveButton,
                    cardStyles.selectedInlineActionButton
                  )}
                  disabled={!isFeatEntryRemovable(entry)}
                  title={!isFeatEntryRemovable(entry) ? lockedRemoveTitle : undefined}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveFeat(entry);
                  }}
                  aria-label={`Remove ${featDefinition.label}`}
                >
                  <X size={14} />
                  <span className={cardStyles.selectedActionLabel}>Remove</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {renderInlineEditor({
        featDefinition,
        featEligibility,
        characterLevel,
        skillProficiencies,
        savingThrowProficiencies,
        weaponProficiencies,
        toolProficiencies,
        languageProficiencies,
        selectedEntries,
        editingFeatEntryId,
        pendingFeatState,
        blessedWarriorCantripOptions,
        coldCasterKnowsRayOfFrost,
        druidicWarriorCantripOptions,
        onPendingFeatStateChange,
        onSavePendingAbilityScoreImprovement,
        onSavePendingAthleteChoice,
        onSavePendingChargerChoice,
        onSavePendingGrapplerChoice,
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
        onSavePendingPolearmMasterChoice,
        onSavePendingRitualCasterChoice,
        onSavePendingResilientChoice,
        onSavePendingSentinelChoice,
        onSavePendingShadowTouchedChoice,
        onSavePendingSlasherChoice,
        onSavePendingSpellSniperChoice,
        onSavePendingTelekineticChoice,
        onSavePendingTelepathicChoice,
        onSavePendingWarCasterChoice,
        onSavePendingSkillExpertChoice,
        onSavePendingSpeedyChoice,
        onSavePendingWeaponMasterChoice,
        onSavePendingBoonOfEnergyResistanceChoice,
        onSavePendingBoonOfIrresistibleOffense,
        onSavePendingBoonOfSkillChoice,
        onSavePendingBlessedWarriorChoice,
        onSavePendingColdCasterChoice,
        onSavePendingDragonscarredChoice,
        onSavePendingCrafterChoice,
        onSavePendingDruidicWarriorChoice,
        onSavePendingEpicBoonAbilityChoice,
        onSavePendingMagicInitiateChoice,
        onSavePendingCultOfDragonInitiateChoice,
        onSavePendingEmeraldEnclaveFledglingChoice,
        onSavePendingHarperAgentChoice,
        onSavePendingPurpleDragonRookChoice,
        onSavePendingSpellfireSparkChoice,
        onSavePendingMusicianChoice,
        onSavePendingSkilledChoice
      })}
      {hideFooter ? null : (
        <div className={modalStyles.footer}>
          {isRepeatable || !isSelected ? (
            <SheetActionButton
              className={modalStyles.addButton}
              disabled={isAddDisabled}
              title={unmetRequirementText || undefined}
              onClick={(event) => {
                event.stopPropagation();
                onAddFeat(featDefinition.feat);
              }}
            >
              <Plus size={16} />
              {isRepeatable && isSelected ? "Add Another" : isSelected ? "Added" : "Add"}
            </SheetActionButton>
          ) : selectedEntry ? (
            <>
              {canEditFeat ? (
                <SheetActionButton
                  className={modalStyles.addButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEditFeat(selectedEntry);
                  }}
                >
                  <Pencil size={16} />
                  Edit
                </SheetActionButton>
              ) : null}
              <SheetActionButton
                className={modalStyles.removeActionButton}
                disabled={!isSelectedEntryRemovable}
                title={!isSelectedEntryRemovable ? lockedRemoveTitle : undefined}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemoveFeat(selectedEntry);
                }}
              >
                <X size={16} />
                Remove
              </SheetActionButton>
            </>
          ) : null}
        </div>
      )}
    </article>
  );
}

export default FeatEditorCard;
