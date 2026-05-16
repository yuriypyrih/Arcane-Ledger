import clsx from "clsx";
import { useMemo, type Dispatch, type SetStateAction } from "react";
import { FEAT_CATEGORY, FEATS, type SpellEntry } from "../../../../codex/entries";
import { useRenderProfiler } from "../../../../lib/useRenderProfiler";
import { getFeatCategoryLabel, type FeatDefinition } from "../../../../pages/CharactersPage/feats";
import type {
  CharacterFeatEntry,
  SavingThrowProficiencyEntry,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../../types";
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
  FeatEligibilityByFeat,
  FeatEditorContext,
  PendingFeatState,
  TrackingButtonRenderer
} from "./types";

type FeatEditorModalProps = {
  context: FeatEditorContext;
  activeFeatCategory: FEAT_CATEGORY;
  characterLevel: number;
  visibleFeatCategories: FEAT_CATEGORY[];
  visibleFeatDefinitionsByCategory: Record<FEAT_CATEGORY, FeatDefinition[]>;
  featEligibilityByFeat: FeatEligibilityByFeat;
  skillProficiencies: SkillProficiencyEntry[];
  savingThrowProficiencies: SavingThrowProficiencyEntry[];
  weaponProficiencies: WeaponProficiencyEntry[];
  toolProficiencies: ToolProficiencyEntry[];
  selectedFeats: CharacterFeatEntry[];
  editingFeatEntryId: string | null;
  pendingFeatState: PendingFeatState;
  blessedWarriorCantripOptions: SpellEntry[];
  druidicWarriorCantripOptions: SpellEntry[];
  onClose: () => void;
  onSelectCategory: (category: FEAT_CATEGORY) => void;
  onAddFeat: (feat: FEATS) => void;
  onEditFeat: (entry: CharacterFeatEntry) => void;
  onRemoveFeat: (entry: CharacterFeatEntry) => void;
  onOpenFeatReference: (feat: FEATS) => void;
  onPendingFeatStateChange: Dispatch<SetStateAction<PendingFeatState>>;
  renderTrackingButton: TrackingButtonRenderer;
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
  onSavePendingMusicianChoice: () => void;
  onSavePendingSkilledChoice: () => void;
};

const emptySelectedFeatEntries: CharacterFeatEntry[] = [];

function groupSelectedFeatsByFeat(
  selectedFeats: CharacterFeatEntry[]
): Map<FEATS, CharacterFeatEntry[]> {
  const selectedFeatEntriesByFeat = new Map<FEATS, CharacterFeatEntry[]>();

  selectedFeats.forEach((entry) => {
    const entries = selectedFeatEntriesByFeat.get(entry.feat);

    if (entries) {
      entries.push(entry);
      return;
    }

    selectedFeatEntriesByFeat.set(entry.feat, [entry]);
  });

  return selectedFeatEntriesByFeat;
}

function FeatEditorModal({
  context,
  activeFeatCategory,
  characterLevel,
  visibleFeatCategories,
  visibleFeatDefinitionsByCategory,
  featEligibilityByFeat,
  skillProficiencies,
  savingThrowProficiencies,
  weaponProficiencies,
  toolProficiencies,
  selectedFeats,
  editingFeatEntryId,
  pendingFeatState,
  blessedWarriorCantripOptions,
  druidicWarriorCantripOptions,
  onClose,
  onSelectCategory,
  onAddFeat,
  onEditFeat,
  onRemoveFeat,
  onOpenFeatReference,
  onPendingFeatStateChange,
  renderTrackingButton,
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
  onSavePendingMusicianChoice,
  onSavePendingSkilledChoice
}: FeatEditorModalProps) {
  const selectedFeatEntriesByFeat = useMemo(
    () => groupSelectedFeatsByFeat(selectedFeats),
    [selectedFeats]
  );
  const activeFeatDefinitions = visibleFeatDefinitionsByCategory[activeFeatCategory];

  useRenderProfiler("FeatEditorModal", {
    activeFeatCategory,
    selectedFeatCount: selectedFeats.length,
    visibleFeatCount: activeFeatDefinitions.length
  });

  return (
    <SheetModal
      titleId="character-feat-editor-title"
      onClose={onClose}
      size="medium"
      panelClassName={styles.modalPanel}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayEyebrow>
            {context.mode === "class-feature" ? "Class Feature" : "Build"}
          </OverlayEyebrow>
          <div className={styles.heading}>
            <h3 id="character-feat-editor-title" className={styles.headingTitle}>
              {context.mode === "class-feature" ? "Choose Feat" : "Edit Feats"}
            </h3>
            {context.mode === "class-feature" ? (
              <OverlaySummary className={shared.helperText}>
                Choose one feat for this class feature. Your selection will be saved when this
                editor closes.
              </OverlaySummary>
            ) : null}
          </div>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close feat editor" onClick={() => onClose()} />
      </OverlayHeader>

      <OverlayBody className={styles.body}>
        <div className={styles.featTabScroller}>
          <div className={styles.featTabRow} role="tablist" aria-label="Feat categories">
            {visibleFeatCategories.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeFeatCategory === category}
                className={clsx(
                  styles.tabButton,
                  styles.featTabButton,
                  activeFeatCategory === category && styles.tabButtonActive
                )}
                onClick={() => onSelectCategory(category)}
              >
                {getFeatCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.optionScrollArea}>
          <div className={styles.optionList}>
            {activeFeatDefinitions.map((featDefinition) => (
              <FeatEditorCard
                key={featDefinition.feat}
                featDefinition={featDefinition}
                featEligibility={featEligibilityByFeat[featDefinition.feat]}
                characterLevel={characterLevel}
                skillProficiencies={skillProficiencies}
                savingThrowProficiencies={savingThrowProficiencies}
                weaponProficiencies={weaponProficiencies}
                toolProficiencies={toolProficiencies}
                selectedEntries={
                  selectedFeatEntriesByFeat.get(featDefinition.feat) ?? emptySelectedFeatEntries
                }
                editingFeatEntryId={editingFeatEntryId}
                pendingFeatState={pendingFeatState}
                blessedWarriorCantripOptions={blessedWarriorCantripOptions}
                druidicWarriorCantripOptions={druidicWarriorCantripOptions}
                renderTrackingButton={renderTrackingButton}
                onOpenFeatReference={onOpenFeatReference}
                onAddFeat={onAddFeat}
                onEditFeat={onEditFeat}
                onRemoveFeat={onRemoveFeat}
                onPendingFeatStateChange={onPendingFeatStateChange}
                onSavePendingAbilityScoreImprovement={onSavePendingAbilityScoreImprovement}
                onSavePendingAthleteChoice={onSavePendingAthleteChoice}
                onSavePendingChargerChoice={onSavePendingChargerChoice}
                onSavePendingChefChoice={onSavePendingChefChoice}
                onSavePendingCrusherChoice={onSavePendingCrusherChoice}
                onSavePendingDualWielderChoice={onSavePendingDualWielderChoice}
                onSavePendingElementalAdeptChoice={onSavePendingElementalAdeptChoice}
                onSavePendingFeyTouchedChoice={onSavePendingFeyTouchedChoice}
                onSavePendingHeavilyArmoredChoice={onSavePendingHeavilyArmoredChoice}
                onSavePendingHeavyArmorMasterChoice={onSavePendingHeavyArmorMasterChoice}
                onSavePendingInspiringLeaderChoice={onSavePendingInspiringLeaderChoice}
                onSavePendingKeenMindChoice={onSavePendingKeenMindChoice}
                onSavePendingLightlyArmoredChoice={onSavePendingLightlyArmoredChoice}
                onSavePendingMageSlayerChoice={onSavePendingMageSlayerChoice}
                onSavePendingMartialWeaponTrainingChoice={onSavePendingMartialWeaponTrainingChoice}
                onSavePendingMediumArmorMasterChoice={onSavePendingMediumArmorMasterChoice}
                onSavePendingModeratelyArmoredChoice={onSavePendingModeratelyArmoredChoice}
                onSavePendingMountedCombatantChoice={onSavePendingMountedCombatantChoice}
                onSavePendingObservantChoice={onSavePendingObservantChoice}
                onSavePendingPiercerChoice={onSavePendingPiercerChoice}
                onSavePendingPoisonerChoice={onSavePendingPoisonerChoice}
                onSavePendingPolearmMasterChoice={onSavePendingPolearmMasterChoice}
                onSavePendingRitualCasterChoice={onSavePendingRitualCasterChoice}
                onSavePendingResilientChoice={onSavePendingResilientChoice}
                onSavePendingSentinelChoice={onSavePendingSentinelChoice}
                onSavePendingShadowTouchedChoice={onSavePendingShadowTouchedChoice}
                onSavePendingSlasherChoice={onSavePendingSlasherChoice}
                onSavePendingSpellSniperChoice={onSavePendingSpellSniperChoice}
                onSavePendingTelekineticChoice={onSavePendingTelekineticChoice}
                onSavePendingTelepathicChoice={onSavePendingTelepathicChoice}
                onSavePendingWarCasterChoice={onSavePendingWarCasterChoice}
                onSavePendingSkillExpertChoice={onSavePendingSkillExpertChoice}
                onSavePendingSpeedyChoice={onSavePendingSpeedyChoice}
                onSavePendingWeaponMasterChoice={onSavePendingWeaponMasterChoice}
                onSavePendingBoonOfEnergyResistanceChoice={
                  onSavePendingBoonOfEnergyResistanceChoice
                }
                onSavePendingBoonOfIrresistibleOffense={onSavePendingBoonOfIrresistibleOffense}
                onSavePendingBoonOfSkillChoice={onSavePendingBoonOfSkillChoice}
                onSavePendingBlessedWarriorChoice={onSavePendingBlessedWarriorChoice}
                onSavePendingCrafterChoice={onSavePendingCrafterChoice}
                onSavePendingDruidicWarriorChoice={onSavePendingDruidicWarriorChoice}
                onSavePendingEpicBoonAbilityChoice={onSavePendingEpicBoonAbilityChoice}
                onSavePendingMagicInitiateChoice={onSavePendingMagicInitiateChoice}
                onSavePendingMusicianChoice={onSavePendingMusicianChoice}
                onSavePendingSkilledChoice={onSavePendingSkilledChoice}
              />
            ))}
          </div>
        </div>
      </OverlayBody>
    </SheetModal>
  );
}

export default FeatEditorModal;
