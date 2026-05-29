import { BookOpen, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import {
  createCampaignSessionNote,
  removeCampaignSessionNote,
  updateCampaignSessionNote,
  type CampaignDetailRecord,
  type CampaignSessionNoteInput,
  type CampaignSessionNoteRecord
} from "../../api/campaigns";
import ActionButton from "../../components/ActionButton";
import { DestructiveConfirmationModal } from "../../components/Overlay";
import { CAMPAIGN_MAX_SESSION_NOTES } from "../../constants/QUOTAS";
import { patchSelectedCampaign, useAppDispatch } from "../../store";
import CampaignSessionNoteDrawer from "./CampaignSessionNoteDrawer";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import DmToolsEmptyState from "./DmToolsEmptyState";
import DmToolsListCard from "./DmToolsListCard";
import styles from "./DmToolsPage.module.css";

type CampaignSessionNotesSectionProps = {
  campaign: CampaignDetailRecord;
};

function getDeleteSessionNoteMessage(note: CampaignSessionNoteRecord): ReactNode {
  return (
    <>
      Delete <strong>{note.name || "this session note"}</strong> from this campaign.
    </>
  );
}

function CampaignSessionNotesSection({ campaign }: CampaignSessionNotesSectionProps) {
  const deleteTitleId = useId();
  const dispatch = useAppDispatch();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [pendingDeleteNote, setPendingDeleteNote] = useState<CampaignSessionNoteRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const isAtSessionNoteLimit = campaign.sessionNotes.length >= CAMPAIGN_MAX_SESSION_NOTES;
  const selectedNoteIndex = selectedNoteId
    ? campaign.sessionNotes.findIndex((note) => note.id === selectedNoteId)
    : -1;
  const selectedNote = selectedNoteIndex >= 0 ? campaign.sessionNotes[selectedNoteIndex] : null;

  function getSessionDisplayName(note: CampaignSessionNoteRecord, index: number) {
    return note.name ? `Session ${index} - ${note.name}` : `Session ${index}`;
  }

  async function handleCreateSessionNote(sessionNote: CampaignSessionNoteInput) {
    const campaignPatch = await createCampaignSessionNote(campaign.id, sessionNote, {
      suppressFailureToast: true
    });

    dispatch(patchSelectedCampaign(campaignPatch));
    setActionError(null);
  }

  async function handleUpdateSessionNote(sessionNote: CampaignSessionNoteInput) {
    if (!selectedNote) {
      return;
    }

    const campaignPatch = await updateCampaignSessionNote(
      campaign.id,
      selectedNote.id,
      sessionNote,
      { suppressFailureToast: true }
    );

    dispatch(patchSelectedCampaign(campaignPatch));
    setActionError(null);
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteNote || isDeleting) {
      return;
    }

    setActionError(null);
    setIsDeleting(true);

    try {
      const campaignPatch = await removeCampaignSessionNote(campaign.id, pendingDeleteNote.id, {
        suppressFailureToast: true
      });

      dispatch(patchSelectedCampaign(campaignPatch));
      setPendingDeleteNote(null);
    } catch (deleteError) {
      setActionError(getDmToolsApiErrorMessage(deleteError, "Unable to delete session note."));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className={styles.membersPanel} aria-labelledby="campaign-session-notes-title">
      <div className={styles.memberPanelHeader}>
        <div>
          <h3 id="campaign-session-notes-title" className={styles.bodyTitle}>
            Session Notes
          </h3>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.memberCount}>
            {campaign.sessionNotes.length}/{CAMPAIGN_MAX_SESSION_NOTES} notes
          </span>
          <ActionButton
            icon={<Plus size={16} aria-hidden="true" />}
            disabled={isAtSessionNoteLimit}
            fullWidth={false}
            title={
              isAtSessionNoteLimit
                ? `Campaigns can hold up to ${CAMPAIGN_MAX_SESSION_NOTES} session notes.`
                : undefined
            }
            onClick={() => {
              setActionError(null);
              setIsCreatingNote(true);
            }}
          >
            Add Note
          </ActionButton>
        </div>
      </div>

      {actionError ? <p className={styles.modalError}>{actionError}</p> : null}

      {campaign.sessionNotes.length > 0 ? (
        <div className={`${styles.dmToolsList} ${styles.sessionNotesList}`}>
          {campaign.sessionNotes.map((note, index) => (
            <DmToolsListCard
              key={note.id}
              icon={<BookOpen size={18} aria-hidden="true" />}
              title={getSessionDisplayName(note, index)}
              onClick={() => {
                setActionError(null);
                setSelectedNoteId(note.id);
              }}
              actions={[
                {
                  icon: <Trash2 size={18} aria-hidden="true" />,
                  label: `Delete Session ${index}`,
                  onClick: () => setPendingDeleteNote(note),
                  title: `Delete Session ${index}`
                }
              ]}
            />
          ))}
        </div>
      ) : (
        <DmToolsEmptyState icon={<BookOpen size={18} aria-hidden="true" />}>
          No session notes yet.
        </DmToolsEmptyState>
      )}

      {isCreatingNote ? (
        <CampaignSessionNoteDrawer
          sessionIndex={campaign.sessionNotes.length}
          onClose={() => setIsCreatingNote(false)}
          onSave={handleCreateSessionNote}
        />
      ) : null}
      {selectedNote ? (
        <CampaignSessionNoteDrawer
          note={selectedNote}
          sessionIndex={selectedNoteIndex}
          onClose={() => setSelectedNoteId(null)}
          onSave={handleUpdateSessionNote}
        />
      ) : null}
      {pendingDeleteNote ? (
        <DestructiveConfirmationModal
          titleId={deleteTitleId}
          title="Delete session note?"
          message={getDeleteSessionNoteMessage(pendingDeleteNote)}
          confirmLabel={isDeleting ? "Deleting..." : "Delete"}
          closeLabel="Close delete session note confirmation"
          onCancel={() => setPendingDeleteNote(null)}
          onConfirm={() => {
            void handleConfirmDelete();
          }}
        />
      ) : null}
    </section>
  );
}

export default CampaignSessionNotesSection;
