import clsx from "clsx";
import { Pencil, Plus, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { FEATS, getFeatureTrackingState, type SpellEntry } from "../../../../codex/entries";
import { abilityKeys } from "../../../../pages/CharactersPage/constants";
import {
  boonOfEnergyResistanceDamageTypeOptions,
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
  polearmMasterAbilityOptions,
  ritualCasterAbilityOptions,
  resilientAbilityOptions,
  sentinelAbilityOptions,
  shadowTouchedAbilityOptions,
  slasherAbilityOptions,
  spellSniperAbilityOptions,
  telekineticAbilityOptions,
  telepathicAbilityOptions,
  warCasterAbilityOptions,
  skillExpertAbilityOptions,
  speedyAbilityOptions,
  weaponMasterAbilityOptions,
  weaponMasterMasteryOptions,
  getAbilityScoreImprovementSummary,
  getEpicBoonAbilityChoiceSummary,
  getEpicBoonAbilityOptions,
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
  cultOfDragonInitiateDefaultLanguage,
  cultOfDragonInitiateLanguageOptions,
  getCultOfDragonInitiateLanguageLabel,
  hasDraconicLanguageFromOtherSource
} from "../../../../pages/CharactersPage/feats/cultOfDragonInitiate";
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
} from "../../../../types";
import type { FeatEligibilityResult } from "../../../../pages/CharactersPage/feats/eligibility";
import { formatCodexLabel } from "../../../../utils/codex";
import ActionButton from "../../../ActionButton";
import SelectInput from "../../FormInputs/SelectInput";
import SheetActionButton from "../SheetActionButton";
import cardStyles from "./FeatCards.module.css";
import modalStyles from "./FeatEditorModal.module.css";
import {
  CantripChoiceEditor,
  InlineEditorFrame,
  SelectField,
  SingleAbilityEditor
} from "./FeatEditorPrimitives";
import {
  getPendingBlessedWarriorChoiceSummary,
  getPendingAthleteChoiceSummary,
  getPendingBoonOfEnergyResistanceChoiceSummary,
  getPendingBoonOfSkillChoiceSummary,
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
  getPendingPolearmMasterChoiceSummary,
  getPendingRitualCasterChoiceSummary,
  getPendingResilientChoiceSummary,
  getPendingSentinelChoiceSummary,
  getPendingShadowTouchedChoiceSummary,
  getPendingSlasherChoiceSummary,
  getPendingSpellSniperChoiceSummary,
  getPendingTelekineticChoiceSummary,
  getPendingTelepathicChoiceSummary,
  getPendingWarCasterChoiceSummary,
  getPendingSkillExpertChoiceSummary,
  getPendingSpeedyChoiceSummary,
  getPendingWeaponMasterChoiceSummary,
  getPendingCrafterChoiceSummary,
  getPendingDruidicWarriorChoiceSummary,
  getPendingEmeraldEnclaveFledglingChoiceSummary,
  getPendingHarperAgentChoiceSummary,
  getPendingPurpleDragonRookChoiceSummary,
  getPendingSpellfireSparkChoiceSummary,
  getPendingMagicInitiateChoiceSummary,
  getPendingCultOfDragonInitiateChoiceSummary,
  getPendingMusicianChoiceSummary,
  getPendingSkilledChoiceSummary,
  getRepeatableFeatEntrySummary,
  isPendingBlessedWarriorChoiceValid,
  isPendingBoonOfEnergyResistanceChoiceValid,
  isPendingBoonOfSkillChoiceValid,
  isPendingCrafterChoiceValid,
  isPendingDruidicWarriorChoiceValid,
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
} from "./featEditorUtils";
import {
  buildSkillSelectOptions,
  buildToolSelectOptions,
  getEffectiveNonExpertSkillOptions,
  getEffectiveProficientSkillOptions,
  getSourceChoiceSkillOptions,
  getSourceChoiceToolOptions,
  updateSelectionAtIndex
} from "./helpers";
import type {
  PendingAbilityScoreImprovement,
  PendingBlessedWarriorChoice,
  PendingBoonOfEnergyResistanceChoice,
  PendingBoonOfSkillChoice,
  PendingCrafterChoice,
  PendingCultOfDragonInitiateChoice,
  PendingDruidicWarriorChoice,
  PendingEmeraldEnclaveFledglingChoice,
  PendingElementalAdeptChoice,
  PendingFeyTouchedChoice,
  PendingFeatState,
  PendingHarperAgentChoice,
  PendingPurpleDragonRookChoice,
  PendingSpellfireSparkChoice,
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
  PendingPolearmMasterChoice,
  PendingRitualCasterChoice,
  PendingResilientChoice,
  PendingSentinelChoice,
  PendingShadowTouchedChoice,
  PendingSlasherChoice,
  PendingSpellSniperChoice,
  PendingTelekineticChoice,
  PendingTelepathicChoice,
  PendingWarCasterChoice,
  PendingSkillExpertChoice,
  PendingSpeedyChoice,
  PendingWeaponMasterChoice,
  PendingMusicianChoice,
  TrackingButtonRenderer
} from "./types";

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
  const selectedSpellIds = Array.from({ length: spellCount }, (_, index) =>
    choice.spellIds[index] ?? ritualCasterNoneOptionValue
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
            (spellId, index) =>
              index !== selectionIndex && spellId !== ritualCasterNoneOptionValue
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
        <p className={modalStyles.validation}>Choose a skill that does not already have Expertise.</p>
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
      {!isValid ? (
        <p className={modalStyles.validation}>Choose one Musical Instrument.</p>
      ) : null}
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
              spellcastingAbility:
                nextValue as PendingSpellfireSparkChoice["spellcastingAbility"]
            })
          }
        />
      </div>
      {summary ? <p className={modalStyles.summary}>{summary}</p> : null}
      {!isValid ? (
        <p className={modalStyles.validation}>Choose a spellcasting ability.</p>
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
                knowsDraconicFromOtherSource &&
                language === cultOfDragonInitiateDefaultLanguage,
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
      {!isValid ? (
        <p className={modalStyles.validation}>Choose a spellcasting ability.</p>
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
  characterLevel,
  skillProficiencies,
  savingThrowProficiencies,
  toolProficiencies,
  languageProficiencies,
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

  if (featDefinition.feat === FEATS.POLEARM_MASTER && pendingFeatState.polearmMasterChoice) {
    return (
      <SingleAbilityEditor
        title="Polearm Master"
        cancelLabel="Cancel polearm master selection"
        label="Ability"
        summary={
          getPendingPolearmMasterChoiceSummary(pendingFeatState.polearmMasterChoice) ?? ""
        }
        value={pendingFeatState.polearmMasterChoice.ability}
        options={[...polearmMasterAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            polearmMasterChoice: null
          }))
        }
        onSave={onSavePendingPolearmMasterChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            polearmMasterChoice: current.polearmMasterChoice
              ? {
                  ability: nextValue as PendingPolearmMasterChoice["ability"]
                }
              : current.polearmMasterChoice
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
            ritualCasterChoice: current.ritualCasterChoice
              ? nextChoice
              : current.ritualCasterChoice
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

  if (featDefinition.feat === FEATS.SENTINEL && pendingFeatState.sentinelChoice) {
    return (
      <SingleAbilityEditor
        title="Sentinel"
        cancelLabel="Cancel sentinel selection"
        label="Ability"
        summary={getPendingSentinelChoiceSummary(pendingFeatState.sentinelChoice) ?? ""}
        value={pendingFeatState.sentinelChoice.ability}
        options={[...sentinelAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            sentinelChoice: null
          }))
        }
        onSave={onSavePendingSentinelChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            sentinelChoice: current.sentinelChoice
              ? {
                  ability: nextValue as PendingSentinelChoice["ability"]
                }
              : current.sentinelChoice
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

  if (featDefinition.feat === FEATS.SLASHER && pendingFeatState.slasherChoice) {
    return (
      <SingleAbilityEditor
        title="Slasher"
        cancelLabel="Cancel slasher selection"
        label="Ability"
        summary={getPendingSlasherChoiceSummary(pendingFeatState.slasherChoice) ?? ""}
        value={pendingFeatState.slasherChoice.ability}
        options={[...slasherAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            slasherChoice: null
          }))
        }
        onSave={onSavePendingSlasherChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            slasherChoice: current.slasherChoice
              ? {
                  ability: nextValue as PendingSlasherChoice["ability"]
                }
              : current.slasherChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.SPELL_SNIPER && pendingFeatState.spellSniperChoice) {
    return (
      <SingleAbilityEditor
        title="Spell Sniper"
        cancelLabel="Cancel spell sniper selection"
        label="Ability"
        summary={getPendingSpellSniperChoiceSummary(pendingFeatState.spellSniperChoice) ?? ""}
        value={pendingFeatState.spellSniperChoice.ability}
        options={[...spellSniperAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            spellSniperChoice: null
          }))
        }
        onSave={onSavePendingSpellSniperChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            spellSniperChoice: current.spellSniperChoice
              ? {
                  ability: nextValue as PendingSpellSniperChoice["ability"]
                }
              : current.spellSniperChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.TELEKINETIC && pendingFeatState.telekineticChoice) {
    return (
      <SingleAbilityEditor
        title="Telekinetic"
        cancelLabel="Cancel telekinetic selection"
        label="Ability"
        summary={getPendingTelekineticChoiceSummary(pendingFeatState.telekineticChoice) ?? ""}
        value={pendingFeatState.telekineticChoice.ability}
        options={[...telekineticAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            telekineticChoice: null
          }))
        }
        onSave={onSavePendingTelekineticChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            telekineticChoice: current.telekineticChoice
              ? {
                  ability: nextValue as PendingTelekineticChoice["ability"]
                }
              : current.telekineticChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.TELEPATHIC && pendingFeatState.telepathicChoice) {
    return (
      <SingleAbilityEditor
        title="Telepathic"
        cancelLabel="Cancel telepathic selection"
        label="Ability"
        summary={getPendingTelepathicChoiceSummary(pendingFeatState.telepathicChoice) ?? ""}
        value={pendingFeatState.telepathicChoice.ability}
        options={[...telepathicAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            telepathicChoice: null
          }))
        }
        onSave={onSavePendingTelepathicChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            telepathicChoice: current.telepathicChoice
              ? {
                  ability: nextValue as PendingTelepathicChoice["ability"]
                }
              : current.telepathicChoice
          }))
        }
      />
    );
  }

  if (featDefinition.feat === FEATS.WAR_CASTER && pendingFeatState.warCasterChoice) {
    return (
      <SingleAbilityEditor
        title="War Caster"
        cancelLabel="Cancel war caster selection"
        label="Ability"
        summary={getPendingWarCasterChoiceSummary(pendingFeatState.warCasterChoice) ?? ""}
        value={pendingFeatState.warCasterChoice.ability}
        options={[...warCasterAbilityOptions]}
        onCancel={() =>
          onPendingFeatStateChange((current) => ({
            ...current,
            warCasterChoice: null
          }))
        }
        onSave={onSavePendingWarCasterChoice}
        onChange={(nextValue) =>
          onPendingFeatStateChange((current) => ({
            ...current,
            warCasterChoice: current.warCasterChoice
              ? {
                  ability: nextValue as PendingWarCasterChoice["ability"]
                }
              : current.warCasterChoice
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
            skillExpertChoice: current.skillExpertChoice
              ? nextChoice
              : current.skillExpertChoice
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
            boonOfSkillChoice: current.boonOfSkillChoice
              ? nextChoice
              : current.boonOfSkillChoice
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
