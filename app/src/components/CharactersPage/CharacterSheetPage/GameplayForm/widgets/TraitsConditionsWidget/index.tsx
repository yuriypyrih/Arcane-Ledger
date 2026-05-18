import clsx from "clsx";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useBodyScrollLock } from "../../../../../../lib/useBodyScrollLock";
import { normalizeRoundTracker } from "../../../../../../pages/CharactersPage/combat";
import type { PersistCharacterUpdater } from "../../../../../../pages/CharactersPage/CharacterSheetPage/types";
import type { Character, CharacterStatusEntry } from "../../../../../../types";
import { useDiceRollerPopup } from "../../../../../DicePage/DiceRollerPopup";
import CharacterSpellDrawer from "../../../SpellCastingForm/CharacterSpellDrawer";
import shared from "../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import widgetShellStyles from "../../GameplayWidgetShared.module.css";
import ReactionEntryDrawer from "./ReactionEntryDrawer";
import SelectedStatusEntryDrawer from "./SelectedStatusEntryDrawer";
import TraitEditorModal from "./TraitEditorModal";
import TraitsConditionsSections from "./TraitsConditionsSections";
import styles from "./TraitsConditionsWidget.module.css";
import { useReactionDrawerState } from "./useReactionDrawerState";
import { useStatusDrawerState } from "./useStatusDrawerState";
import { useTraitEditorState } from "./useTraitEditorState";
import { useTraitsConditionsSections } from "./useTraitsConditionsSections";

type TraitsConditionsWidgetProps = {
  character: Character;
  onPersistCharacter: PersistCharacterUpdater;
  onRequestCreateCompanion?: () => void;
};

type EditableCustomTraitEntry = CharacterStatusEntry & {
  customEffects: NonNullable<CharacterStatusEntry["customEffects"]>;
};

function TraitsConditionsWidget({
  character,
  onPersistCharacter,
  onRequestCreateCompanion
}: TraitsConditionsWidgetProps) {
  const [selectedStatusEntryId, setSelectedStatusEntryId] = useState<string | null>(null);
  const { openDiceRoller, diceRollerPopup } = useDiceRollerPopup();
  const roundTracker = normalizeRoundTracker(character.roundTracker);
  const {
    classSpellEntriesById,
    selectedReactionEntry,
    selectedStatusEntry,
    spellSlotTotals,
    spellSlotsRemaining,
    statusSections
  } = useTraitsConditionsSections({
    character,
    selectedStatusEntryId
  });
  const {
    closeTraitEditor,
    isTraitModalOpen,
    openCustomTraitEditor,
    openTraitEditor,
    traitEditorModalProps
  } = useTraitEditorState({
    onPersistCharacter
  });
  const statusDrawerState = useStatusDrawerState({
    onPersistCharacter,
    selectedStatusEntry,
    selectedStatusEntryId,
    setSelectedStatusEntryId
  });
  const reactionDrawerState = useReactionDrawerState({
    character,
    classSpellEntriesById,
    onPersistCharacter,
    openDiceRoller,
    roundTracker,
    selectedReactionEntry,
    selectedStatusEntry,
    setSelectedStatusEntryId,
    spellSlotTotals,
    spellSlotsRemaining
  });
  const hasOverlayOpen = isTraitModalOpen || selectedStatusEntryId !== null;

  function editCustomTrait(entry: EditableCustomTraitEntry) {
    setSelectedStatusEntryId(null);
    openCustomTraitEditor(entry);
  }

  function handleRequestCreateCompanion() {
    closeTraitEditor();
    onRequestCreateCompanion?.();
  }

  useBodyScrollLock(hasOverlayOpen);

  useEffect(() => {
    if (!hasOverlayOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedStatusEntryId(null);
        closeTraitEditor();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeTraitEditor, hasOverlayOpen]);

  return (
    <>
      <section className={clsx(widgetShellStyles.widgetCard, styles.root)}>
        <header className={widgetShellStyles.widgetHeader}>
          <p className={widgetShellStyles.widgetTitle}>Traits &amp; Conditions</p>
          <button type="button" className={shared.editButton} onClick={openTraitEditor}>
            <Pencil size={16} />
            Edit
          </button>
        </header>

        {statusSections.length === 0 ? (
          <p className={shared.emptyText}>No traits or conditions.</p>
        ) : (
          <TraitsConditionsSections
            sections={statusSections}
            reactionAvailable={roundTracker.reactionAvailable}
            onSelectEntry={setSelectedStatusEntryId}
          />
        )}
      </section>

      {isTraitModalOpen ? (
        <TraitEditorModal
          {...traitEditorModalProps}
          onCreateCompanion={onRequestCreateCompanion ? handleRequestCreateCompanion : undefined}
        />
      ) : null}

      {reactionDrawerState.selectedReactionSpell ? (
        <CharacterSpellDrawer
          character={character}
          spell={reactionDrawerState.selectedReactionSpell}
          mode="standard"
          spellSlotTotals={spellSlotTotals}
          spellSlotsRemaining={spellSlotsRemaining}
          selectedSpellSlotLevel={reactionDrawerState.selectedReactionSpellSlotLevel}
          onSelectedSpellSlotLevelChange={reactionDrawerState.setSelectedReactionSpellSlotLevel}
          onClose={reactionDrawerState.closeSelectedReaction}
          onAction={(options) =>
            reactionDrawerState.castSelectedReactionSpell({
              ...options,
              useBeguilingMagic: reactionDrawerState.useBeguilingMagicOnReactionSpell,
              useStepsOfTheFey: reactionDrawerState.useStepsOfTheFeyOnReactionSpell
            })
          }
          actionConsumesSpellSlot={
            !(
              reactionDrawerState.selectedReactionSpellSupportsStepsOfTheFey &&
              reactionDrawerState.useStepsOfTheFeyOnReactionSpell
            )
          }
          actionAvailabilityText={
            reactionDrawerState.selectedReactionSpellSupportsStepsOfTheFey &&
            reactionDrawerState.useStepsOfTheFeyOnReactionSpell
              ? "Steps of the Fey lets you cast this spell without expending a spell slot. This use recharges on a Long Rest."
              : null
          }
          actionWarning={reactionDrawerState.selectedReactionActionWarning}
          actionDisabled={reactionDrawerState.selectedReactionActionWarning !== null}
          blockedReason={reactionDrawerState.selectedReactionBlockedReason}
          actionShape="reaction"
          actionShapeAvailable={reactionDrawerState.selectedReactionActionWarning === null}
          actionOptions={reactionDrawerState.reactionSpellActionOptions}
        />
      ) : null}

      {selectedReactionEntry &&
      selectedStatusEntry &&
      !reactionDrawerState.selectedReactionSpell ? (
        <ReactionEntryDrawer
          reaction={selectedReactionEntry}
          actionWarning={reactionDrawerState.selectedReactionActionWarning}
          actionShapeAvailable={reactionDrawerState.selectedReactionShapeAvailable}
          headerTags={reactionDrawerState.selectedReactionHeaderTags}
          facts={reactionDrawerState.selectedReactionFacts}
          factsSectionTitle={reactionDrawerState.selectedReactionFactsSectionTitle}
          headerBadges={[]}
          resourceSummary={reactionDrawerState.selectedReactionResourceSummary}
          footerContent={reactionDrawerState.selectedReactionFooterContent}
          actionLabel={reactionDrawerState.selectedReactionActionLabel}
          actionDisabled={reactionDrawerState.selectedReactionActionDisabled}
          customContent={reactionDrawerState.selectedReactionCustomContent}
          onCast={reactionDrawerState.castSelectedReactionEntry}
          onClose={reactionDrawerState.closeSelectedReaction}
        />
      ) : null}

      <SelectedStatusEntryDrawer
        character={character}
        onPersistCharacter={onPersistCharacter}
        onEditCustomTrait={editCustomTrait}
        openDiceRoller={openDiceRoller}
        roundTracker={roundTracker}
        selectedReactionEntry={selectedReactionEntry}
        selectedReactionSpell={reactionDrawerState.selectedReactionSpell}
        selectedStatusEntry={selectedStatusEntry}
        setSelectedStatusEntryId={setSelectedStatusEntryId}
        {...statusDrawerState}
      />

      {diceRollerPopup}
    </>
  );
}

export default TraitsConditionsWidget;
