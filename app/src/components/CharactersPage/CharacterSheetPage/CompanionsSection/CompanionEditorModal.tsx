import type { Character, CharacterCompanion } from "../../../../types";
import CreatureEditorModal from "./CreatureEditorModal";

type CompanionEditorModalProps = {
  character: Character;
  companion: CharacterCompanion | null;
  companions: CharacterCompanion[];
  onSaveCompanion: (companion: CharacterCompanion) => void;
  onRemoveCompanion: (companionId: string) => void;
  onClose: () => void;
};

function CompanionEditorModal({
  character,
  companion,
  companions,
  onSaveCompanion,
  onRemoveCompanion,
  onClose
}: CompanionEditorModalProps) {
  return (
    <CreatureEditorModal
      allowPrimalBeasts
      character={character}
      creature={companion}
      creatures={companions}
      labels={{
        browseButton: "Browse Monsters",
        browseSummary: "Choose a stat block to inherit for this companion.",
        browseTitle: "Browse monsters",
        closeLabel: "Close companion editor",
        createButton: "Create Companion",
        createTitle: "Create companion",
        deleteButton: "Delete",
        deleteCloseLabel: "Close delete companion confirmation",
        deleteConfirmLabel: "Delete",
        deleteMessage: (currentCompanion) => (
          <>
            This will permanently remove <strong>{currentCompanion.name}</strong> from this
            character.
          </>
        ),
        deleteTitle: "Delete companion?",
        editTitle: "Edit companion",
        inheritedStatBlockTitle: "Inherited stat block",
        noStatBlockText: "No stat block selected.",
        previewBadgeLabel: "Monster Preview",
        saveButton: "Save Changes",
        summary: "Companions can be created from a stat block or written as a custom NPC.",
        useMonsterButton: "Use Monster"
      }}
      onClose={onClose}
      onRemoveCreature={onRemoveCompanion}
      onSaveCreature={onSaveCompanion}
    />
  );
}

export default CompanionEditorModal;
