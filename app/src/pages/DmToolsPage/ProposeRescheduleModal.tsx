import { Send, X } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { proposeGameSessionReschedule } from "../../api/gameSessions";
import ActionButton from "../../components/ActionButton";
import TextAreaInput from "../../components/CharactersPage/FormInputs/TextAreaInput";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../components/Overlay";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import styles from "./DmToolsPage.module.css";
import sessionStyles from "./CampaignSessionsSection.module.css";

const MESSAGE_MAX_LENGTH = 500;

type ProposeRescheduleModalProps = {
  sessionId: string;
  sessionTitle: string;
  onClose: () => void;
  /** Called after the proposal was sent, so the caller can reload. */
  onProposed: () => void;
};

/** The GM suggests a new time; players who have not switched these emails off get an email. */
function ProposeRescheduleModal({
  sessionId,
  sessionTitle,
  onClose,
  onProposed
}: ProposeRescheduleModalProps) {
  const titleId = useId();
  const [proposedAt, setProposedAt] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const proposedDate = proposedAt ? new Date(proposedAt) : null;
  const isInFuture = proposedDate !== null && proposedDate.getTime() > Date.now();
  const canSend = isInFuture && !isSending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!proposedDate || !isInFuture) {
      setError("Pick a date and time in the future.");
      return;
    }

    setError(null);
    setIsSending(true);

    try {
      await proposeGameSessionReschedule(
        sessionId,
        { proposedAt: proposedDate.toISOString(), message: message.trim() },
        { suppressFailureToast: true }
      );
      onProposed();
      onClose();
    } catch (sendError) {
      setError(getDmToolsApiErrorMessage(sendError, "Unable to send the proposal."));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <SheetModal
      titleId={titleId}
      onClose={onClose}
      isBusy={isSending}
      busyLabel="Sending proposal"
      size="small"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Propose a new time</OverlayTitle>
          <OverlaySummary>
            {sessionTitle}. Players are emailed unless they turned reschedule emails off in their
            campaign settings.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close proposal" disabled={isSending} onClick={onClose} />
      </OverlayHeader>

      <form onSubmit={handleSubmit}>
        <OverlayBody>
          <label className={styles.modalField}>
            <span className={styles.modalFieldLabel}>Proposed date and time</span>
            <input
              autoFocus
              className={sessionStyles.input}
              disabled={isSending}
              type="datetime-local"
              value={proposedAt}
              onChange={(event) => {
                setProposedAt(event.target.value);
                setError(null);
              }}
            />
          </label>
          <label className={styles.modalField}>
            <span className={styles.modalFieldLabel}>Note to players (optional)</span>
            <TextAreaInput
              disabled={isSending}
              maxLength={MESSAGE_MAX_LENGTH}
              rows={3}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          {error ? <p className={styles.modalError}>{error}</p> : null}
        </OverlayBody>

        <OverlayFooter>
          <div className={styles.modalFooterActions}>
            <ActionButton
              type="button"
              variant="OUTLINE"
              icon={<X size={16} aria-hidden="true" />}
              disabled={isSending}
              fullWidth
              onClick={onClose}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              icon={<Send size={16} aria-hidden="true" />}
              disabled={!canSend}
              loading={isSending}
              loadingLabel="Sending proposal"
              fullWidth
            >
              Send proposal
            </ActionButton>
          </div>
        </OverlayFooter>
      </form>
    </SheetModal>
  );
}

export default ProposeRescheduleModal;
