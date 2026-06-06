import { useState } from "react";
import type { SetStateAction } from "react";
import { FEATS } from "../../../../codex/entries";
import { getFeatDefinition } from "../../../../pages/CharactersPage/feats";
import type { WarlockEldritchInvocationOption } from "../../../../pages/CharactersPage/classFeatures/warlock/warlock";
import type {
  CharacterFeatEntry,
  LanguageProficiencyEntry,
  SavingThrowProficiencyEntry,
  SkillProficiencyEntry,
  ToolProficiencyEntry,
  WeaponProficiencyEntry
} from "../../../../types";
import FeatEditorCard from "./FeatEditorCard";
import modalStyles from "./FeatEditorModal.module.css";
import {
  createEmptyPendingFeatState,
  createPendingFeatStateForFeat,
  decodePendingCultOfDragonInitiateChoice,
  decodePendingCrafterChoice,
  decodePendingEmeraldEnclaveFledglingChoice,
  decodePendingHarperAgentChoice,
  decodePendingMagicInitiateChoice,
  decodePendingMusicianChoice,
  decodePendingPurpleDragonRookChoice,
  decodePendingSpellfireSparkChoice,
  decodePendingSkilledChoice
} from "./featEditorUtils";
import {
  createLessonsOfTheFirstOnesFeatEntry,
  doesLessonsOriginFeatNeedInput,
  getLessonsOriginFeatForSelection
} from "./eldritchInvocationLessonsFeatUtils";
import type { PendingFeatState, TrackingButtonRenderer } from "./types";

type CreateFeatEntryOptions = NonNullable<
  Parameters<typeof createLessonsOfTheFirstOnesFeatEntry>[3]
>;

type EldritchInvocationLessonsFeatEditorProps = {
  selectedChoiceOption: WarlockEldritchInvocationOption;
  characterLevel: number;
  skillProficiencies: SkillProficiencyEntry[];
  savingThrowProficiencies: SavingThrowProficiencyEntry[];
  weaponProficiencies: WeaponProficiencyEntry[];
  toolProficiencies: ToolProficiencyEntry[];
  languageProficiencies: LanguageProficiencyEntry[];
  renderTrackingButton: TrackingButtonRenderer;
  onConfiguredFeatEntryChange: (entry: CharacterFeatEntry | null) => void;
};

function EldritchInvocationLessonsFeatEditor({
  selectedChoiceOption,
  characterLevel,
  skillProficiencies,
  savingThrowProficiencies,
  weaponProficiencies,
  toolProficiencies,
  languageProficiencies,
  renderTrackingButton,
  onConfiguredFeatEntryChange
}: EldritchInvocationLessonsFeatEditorProps) {
  const selectedOriginFeat = getLessonsOriginFeatForSelection(
    selectedChoiceOption.selectionId
  );
  const selectedOriginFeatDefinition = selectedOriginFeat
    ? getFeatDefinition(selectedOriginFeat)
    : null;
  const [pendingFeatState, setPendingFeatState] = useState<PendingFeatState>(() =>
    selectedOriginFeat
      ? (createPendingFeatStateForFeat(selectedOriginFeat, {
          languageProficiencies
        }) ?? createEmptyPendingFeatState())
      : createEmptyPendingFeatState()
  );
  const [configuredFeatEntry, setConfiguredFeatEntry] = useState<CharacterFeatEntry | null>(
    null
  );
  const noopSavePendingChoice = () => undefined;

  if (
    !selectedOriginFeat ||
    !selectedOriginFeatDefinition ||
    !doesLessonsOriginFeatNeedInput(selectedOriginFeat)
  ) {
    return null;
  }

  function createSelectedFeatEntry(
    feat: FEATS,
    options?: CreateFeatEntryOptions
  ): CharacterFeatEntry {
    return createLessonsOfTheFirstOnesFeatEntry(
      feat,
      characterLevel,
      selectedChoiceOption.selectionId,
      options
    );
  }

  function updatePendingFeatState(nextState: SetStateAction<PendingFeatState>) {
    setConfiguredFeatEntry(null);
    onConfiguredFeatEntryChange(null);
    setPendingFeatState(nextState);
  }

  function saveConfiguredFeatEntry(entry: CharacterFeatEntry | null) {
    if (!entry) {
      return;
    }

    setConfiguredFeatEntry(entry);
    onConfiguredFeatEntryChange(entry);
  }

  function savePendingCrafterChoice() {
    const choice = pendingFeatState.crafterChoice;
    const crafter = choice ? decodePendingCrafterChoice(choice) : null;

    if (!crafter) {
      return;
    }

    saveConfiguredFeatEntry(createSelectedFeatEntry(FEATS.CRAFTER, { crafter }));
  }

  function savePendingCultOfDragonInitiateChoice() {
    const choice = pendingFeatState.cultOfDragonInitiateChoice;
    const cultOfDragonInitiate = choice
      ? decodePendingCultOfDragonInitiateChoice(choice, languageProficiencies)
      : null;

    if (!cultOfDragonInitiate) {
      return;
    }

    saveConfiguredFeatEntry(
      createSelectedFeatEntry(FEATS.CULT_OF_THE_DRAGON_INITIATE, {
        cultOfDragonInitiate
      })
    );
  }

  function savePendingEmeraldEnclaveFledglingChoice() {
    const choice = pendingFeatState.emeraldEnclaveFledglingChoice;
    const emeraldEnclaveFledgling = choice
      ? decodePendingEmeraldEnclaveFledglingChoice(choice)
      : null;

    if (!emeraldEnclaveFledgling) {
      return;
    }

    saveConfiguredFeatEntry(
      createSelectedFeatEntry(FEATS.EMERALD_ENCLAVE_FLEDGLING, {
        emeraldEnclaveFledgling
      })
    );
  }

  function savePendingHarperAgentChoice() {
    const choice = pendingFeatState.harperAgentChoice;
    const harperAgent = choice ? decodePendingHarperAgentChoice(choice) : null;

    if (!harperAgent) {
      return;
    }

    saveConfiguredFeatEntry(createSelectedFeatEntry(FEATS.HARPER_AGENT, { harperAgent }));
  }

  function savePendingPurpleDragonRookChoice() {
    const choice = pendingFeatState.purpleDragonRookChoice;
    const purpleDragonRook = choice ? decodePendingPurpleDragonRookChoice(choice) : null;

    if (!purpleDragonRook) {
      return;
    }

    saveConfiguredFeatEntry(
      createSelectedFeatEntry(FEATS.PURPLE_DRAGON_ROOK, { purpleDragonRook })
    );
  }

  function savePendingSpellfireSparkChoice() {
    const choice = pendingFeatState.spellfireSparkChoice;
    const spellfireSpark = choice ? decodePendingSpellfireSparkChoice(choice) : null;

    if (!spellfireSpark) {
      return;
    }

    saveConfiguredFeatEntry(createSelectedFeatEntry(FEATS.SPELLFIRE_SPARK, { spellfireSpark }));
  }

  function savePendingMagicInitiateChoice() {
    const choice = pendingFeatState.magicInitiateChoice;
    const magicInitiate = choice ? decodePendingMagicInitiateChoice(choice) : null;

    if (!magicInitiate) {
      return;
    }

    saveConfiguredFeatEntry(
      createSelectedFeatEntry(FEATS.MAGIC_INITIATE, { magicInitiate })
    );
  }

  function savePendingMusicianChoice() {
    const choice = pendingFeatState.musicianChoice;
    const musician = choice ? decodePendingMusicianChoice(choice) : null;

    if (!musician) {
      return;
    }

    saveConfiguredFeatEntry(createSelectedFeatEntry(FEATS.MUSICIAN, { musician }));
  }

  function savePendingSkilledChoice() {
    const choice = pendingFeatState.skilledChoice;
    const skilled = choice ? decodePendingSkilledChoice(choice) : null;

    if (!skilled) {
      return;
    }

    saveConfiguredFeatEntry(createSelectedFeatEntry(FEATS.SKILLED, { skilled }));
  }

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <FeatEditorCard
        featDefinition={selectedOriginFeatDefinition}
        characterLevel={characterLevel}
        skillProficiencies={skillProficiencies}
        savingThrowProficiencies={savingThrowProficiencies}
        weaponProficiencies={weaponProficiencies}
        toolProficiencies={toolProficiencies}
        languageProficiencies={languageProficiencies}
        selectedEntries={[]}
        editingFeatEntryId={null}
        pendingFeatState={pendingFeatState}
        blessedWarriorCantripOptions={[]}
        druidicWarriorCantripOptions={[]}
        hideFooter
        renderTrackingButton={renderTrackingButton}
        onOpenFeatReference={() => undefined}
        onAddFeat={() => undefined}
        onEditFeat={() => undefined}
        onRemoveFeat={() => {
          setConfiguredFeatEntry(null);
          onConfiguredFeatEntryChange(null);
        }}
        onPendingFeatStateChange={updatePendingFeatState}
        onSavePendingAbilityScoreImprovement={noopSavePendingChoice}
        onSavePendingAthleteChoice={noopSavePendingChoice}
        onSavePendingChargerChoice={noopSavePendingChoice}
        onSavePendingChefChoice={noopSavePendingChoice}
        onSavePendingCrusherChoice={noopSavePendingChoice}
        onSavePendingDualWielderChoice={noopSavePendingChoice}
        onSavePendingElementalAdeptChoice={noopSavePendingChoice}
        onSavePendingFeyTouchedChoice={noopSavePendingChoice}
        onSavePendingHeavilyArmoredChoice={noopSavePendingChoice}
        onSavePendingHeavyArmorMasterChoice={noopSavePendingChoice}
        onSavePendingInspiringLeaderChoice={noopSavePendingChoice}
        onSavePendingKeenMindChoice={noopSavePendingChoice}
        onSavePendingLightlyArmoredChoice={noopSavePendingChoice}
        onSavePendingMageSlayerChoice={noopSavePendingChoice}
        onSavePendingMartialWeaponTrainingChoice={noopSavePendingChoice}
        onSavePendingMediumArmorMasterChoice={noopSavePendingChoice}
        onSavePendingModeratelyArmoredChoice={noopSavePendingChoice}
        onSavePendingMountedCombatantChoice={noopSavePendingChoice}
        onSavePendingObservantChoice={noopSavePendingChoice}
        onSavePendingPiercerChoice={noopSavePendingChoice}
        onSavePendingPoisonerChoice={noopSavePendingChoice}
        onSavePendingPolearmMasterChoice={noopSavePendingChoice}
        onSavePendingRitualCasterChoice={noopSavePendingChoice}
        onSavePendingResilientChoice={noopSavePendingChoice}
        onSavePendingSentinelChoice={noopSavePendingChoice}
        onSavePendingShadowTouchedChoice={noopSavePendingChoice}
        onSavePendingSlasherChoice={noopSavePendingChoice}
        onSavePendingSpellSniperChoice={noopSavePendingChoice}
        onSavePendingTelekineticChoice={noopSavePendingChoice}
        onSavePendingTelepathicChoice={noopSavePendingChoice}
        onSavePendingWarCasterChoice={noopSavePendingChoice}
        onSavePendingSkillExpertChoice={noopSavePendingChoice}
        onSavePendingSpeedyChoice={noopSavePendingChoice}
        onSavePendingWeaponMasterChoice={noopSavePendingChoice}
        onSavePendingBoonOfEnergyResistanceChoice={noopSavePendingChoice}
        onSavePendingBoonOfIrresistibleOffense={noopSavePendingChoice}
        onSavePendingBoonOfSkillChoice={noopSavePendingChoice}
        onSavePendingBlessedWarriorChoice={noopSavePendingChoice}
        onSavePendingCultOfDragonInitiateChoice={
          savePendingCultOfDragonInitiateChoice
        }
        onSavePendingEmeraldEnclaveFledglingChoice={
          savePendingEmeraldEnclaveFledglingChoice
        }
        onSavePendingHarperAgentChoice={savePendingHarperAgentChoice}
        onSavePendingPurpleDragonRookChoice={savePendingPurpleDragonRookChoice}
        onSavePendingSpellfireSparkChoice={savePendingSpellfireSparkChoice}
        onSavePendingCrafterChoice={savePendingCrafterChoice}
        onSavePendingDruidicWarriorChoice={noopSavePendingChoice}
        onSavePendingEpicBoonAbilityChoice={noopSavePendingChoice}
        onSavePendingMagicInitiateChoice={savePendingMagicInitiateChoice}
        onSavePendingMusicianChoice={savePendingMusicianChoice}
        onSavePendingSkilledChoice={savePendingSkilledChoice}
      />
      {configuredFeatEntry ? (
        <p className={modalStyles.summary}>
          Feat configured. Add the invocation to apply it.
        </p>
      ) : null}
    </div>
  );
}

export default EldritchInvocationLessonsFeatEditor;
