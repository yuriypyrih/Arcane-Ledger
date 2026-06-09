import { Plus, Upload, Users } from "lucide-react";
import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PartyMembershipRecord } from "../../../api/partyGroups";
import ActionButton from "../../ActionButton";
import { DestructiveConfirmationModal } from "../../Overlay";
import type { CharacterRosterEntry } from "../../../pages/CharactersPage/characterRoster";
import { hasReachedCharacterLimit } from "../../../pages/CharactersPage/characterLimits";
import CharacterEmptyState from "../CharacterEmptyState";
import CharacterRow from "../CharacterRow";
import CharacterImportModal from "./CharacterImportModal";
import CharacterPartyGroupModal from "./CharacterPartyGroupModal";
import styles from "./CharacterList.module.css";
import CharacterShareModal from "./CharacterShareModal";

type CharacterListProps = {
  canShareCharacters: boolean;
  characters: CharacterRosterEntry[];
  characterLimit: number;
  partyMembershipsByCharacterId?: Record<string, PartyMembershipRecord>;
  onDeleteCharacter: (characterId: number) => void;
  onDuplicateCharacter: (character: CharacterRosterEntry) => Promise<number>;
  onImportCharacter: (link: string) => Promise<number>;
  onJoinPartyGroup: () => void;
  onShareCharacter: (character: CharacterRosterEntry) => Promise<string>;
};

type PendingPartyMembership = {
  character: CharacterRosterEntry;
  membership: PartyMembershipRecord;
};

function CharacterList({
  canShareCharacters,
  characters,
  characterLimit,
  partyMembershipsByCharacterId = {},
  onDeleteCharacter,
  onDuplicateCharacter,
  onImportCharacter,
  onJoinPartyGroup,
  onShareCharacter
}: CharacterListProps) {
  const deleteTitleId = useId();
  const navigate = useNavigate();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingDeleteCharacter, setPendingDeleteCharacter] = useState<CharacterRosterEntry | null>(
    null
  );
  const [pendingShareCharacter, setPendingShareCharacter] = useState<CharacterRosterEntry | null>(
    null
  );
  const [pendingPartyMembership, setPendingPartyMembership] =
    useState<PendingPartyMembership | null>(null);
  const isCharacterLimitReached = hasReachedCharacterLimit(characters.length, characterLimit);

  function handleDeleteConfirm() {
    if (!pendingDeleteCharacter) {
      return;
    }

    onDeleteCharacter(pendingDeleteCharacter.id);
    setPendingDeleteCharacter(null);
  }

  async function handleImportLink(link: string) {
    await onImportCharacter(link);

    setIsImportModalOpen(false);
  }

  async function handleDuplicateCharacter(character: CharacterRosterEntry) {
    if (isCharacterLimitReached) {
      return;
    }

    await onDuplicateCharacter(character);
  }

  return (
    <div className={styles.listCard}>
      <div className={styles.listHeader}>
        <div className={styles.listEyebrowRow}>
          <p className={styles.eyebrow}>Characters</p>
          <ActionButton
            icon={<Users size={16} aria-hidden="true" />}
            variant="OUTLINE"
            className={styles.joinPartyButton}
            fullWidth={false}
            onClick={onJoinPartyGroup}
          >
            Join Party Group
          </ActionButton>
        </div>
        <div className={styles.listTitleRow}>
          <h3 className={styles.title}>Your arsenal of Characters</h3>
          <div className={styles.listHeaderActions}>
            <span className={styles.listCount}>
              {characters.length}/{characterLimit} total
            </span>
            <ActionButton
              icon={<Plus size={16} aria-hidden="true" />}
              fullWidth={false}
              disabled={isCharacterLimitReached}
              title={
                isCharacterLimitReached
                  ? `Character limit reached (${characterLimit}).`
                  : "Create a new character"
              }
              onClick={() => navigate("/characters/new")}
            >
              <span className={styles.actionLabelFull}>New Character</span>
              <span className={styles.actionLabelCompact}>New</span>
            </ActionButton>
            <ActionButton
              icon={<Upload size={16} aria-hidden="true" />}
              variant="OUTLINE"
              fullWidth={false}
              disabled={isCharacterLimitReached}
              title={
                isCharacterLimitReached
                  ? `Character limit reached (${characterLimit}).`
                  : "Import a shared character"
              }
              onClick={() => setIsImportModalOpen(true)}
            >
              <span className={styles.actionLabelFull}>Import Character</span>
              <span className={styles.actionLabelCompact}>Import</span>
            </ActionButton>
          </div>
        </div>
      </div>

      {characters.length === 0 ? (
        <CharacterEmptyState />
      ) : (
        <ul className={styles.list}>
          {characters.map((character) => {
            const partyMembership = character.remoteId
              ? partyMembershipsByCharacterId[character.remoteId]
              : undefined;

            return (
              <li key={character.id}>
                <CharacterRow
                  character={character}
                  isDuplicateDisabled={isCharacterLimitReached}
                  partyMembership={partyMembership}
                  onDelete={setPendingDeleteCharacter}
                  onDuplicate={handleDuplicateCharacter}
                  onOpenParty={(selectedCharacter, membership) =>
                    setPendingPartyMembership({
                      character: selectedCharacter,
                      membership
                    })
                  }
                  onShare={canShareCharacters ? setPendingShareCharacter : undefined}
                />
              </li>
            );
          })}
        </ul>
      )}

      {pendingDeleteCharacter ? (
        <DestructiveConfirmationModal
          titleId={deleteTitleId}
          title="Delete character?"
          message={
            <>
              This will permanently remove <strong>{pendingDeleteCharacter.name}</strong> from your
              roster.
            </>
          }
          confirmLabel="Delete"
          closeLabel="Close delete character confirmation"
          onCancel={() => setPendingDeleteCharacter(null)}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
      {pendingShareCharacter ? (
        <CharacterShareModal
          character={pendingShareCharacter}
          onClose={() => setPendingShareCharacter(null)}
          onGenerateLink={onShareCharacter}
        />
      ) : null}
      {pendingPartyMembership ? (
        <CharacterPartyGroupModal
          character={pendingPartyMembership.character}
          membership={pendingPartyMembership.membership}
          onClose={() => setPendingPartyMembership(null)}
        />
      ) : null}
      {isImportModalOpen ? (
        <CharacterImportModal
          onClose={() => setIsImportModalOpen(false)}
          onImportLink={handleImportLink}
        />
      ) : null}
    </div>
  );
}

export default CharacterList;
