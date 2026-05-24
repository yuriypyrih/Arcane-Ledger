import { Send } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { submitSupportFeedback } from "../../api/support";
import { ApiRequestFailedError } from "../../api/client";
import ActionButton from "../../components/ActionButton";
import TextAreaInput from "../../components/CharactersPage/FormInputs/TextAreaInput";
import { trackAnalyticsEvent } from "../../lib/analytics";
import { setAuthenticatedUser, showToast, useAppDispatch, useAppSelector } from "../../store";
import { getApiErrorMessage } from "./authPageUtils";
import styles from "./AuthPages.module.css";

const FEEDBACK_COOLDOWN_MS = 60 * 60 * 1000;
const FEEDBACK_MAX_LENGTH = 4000;

function getRetryAt(lastFeedback: string | null): Date | null {
  if (!lastFeedback) {
    return null;
  }

  const submittedAt = new Date(lastFeedback);
  const submittedAtTime = submittedAt.getTime();

  if (Number.isNaN(submittedAtTime)) {
    return null;
  }

  return new Date(submittedAtTime + FEEDBACK_COOLDOWN_MS);
}

function formatCooldown(value: Date, now: number): string {
  const remainingMs = Math.max(0, value.getTime() - now);
  const totalMinutes = Math.ceil(remainingMs / 60000);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${Math.max(1, minutes)}m`;
}

function getServerRetryAt(error: unknown): string | null {
  if (!(error instanceof ApiRequestFailedError)) {
    return null;
  }

  if (
    typeof error.details === "object" &&
    error.details !== null &&
    "retryAt" in error.details &&
    typeof error.details.retryAt === "string"
  ) {
    return error.details.retryAt;
  }

  return null;
}

function SupportPage() {
  const dispatch = useAppDispatch();
  const { status, user } = useAppSelector((state) => state.auth);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const trimmedContent = content.trim();
  const retryAt = useMemo(() => getRetryAt(user?.lastFeedback ?? null), [user?.lastFeedback]);
  const cooldownActive = retryAt ? retryAt.getTime() > now : false;
  const cooldownLabel = retryAt && cooldownActive ? formatCooldown(retryAt, now) : null;
  const remainingCharacters = FEEDBACK_MAX_LENGTH - content.length;
  const submitDisabled = !trimmedContent || cooldownActive || submitting;

  useEffect(() => {
    if (!retryAt || retryAt.getTime() <= Date.now()) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [retryAt]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitDisabled) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await submitSupportFeedback(trimmedContent, { suppressFailureToast: true });
      dispatch(setAuthenticatedUser(response.user));
      dispatch(
        showToast({
          text: "Support ticket sent.",
          type: "success"
        })
      );
      trackAnalyticsEvent("support_feedback_submitted");
      setContent("");
      setMessage(response.message);
      setNow(Date.now());
    } catch (error) {
      const retryAt = getServerRetryAt(error);
      const fallback = retryAt
        ? `You can submit another ticket after ${new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          }).format(new Date(retryAt))}.`
        : "Unable to submit your support ticket.";

      setError(retryAt ? fallback : getApiErrorMessage(error, fallback));
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "unknown") {
    return (
      <section className={styles.page}>
        <div className={styles.panel}>
          <div className={styles.header}>
            <p className={styles.eyebrow}>Support</p>
            <h2 className={styles.title}>Loading</h2>
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return (
    <section className={styles.page}>
      <div className={`${styles.panel} ${styles.supportPanel}`}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Support</p>
          <h2 className={styles.title}>How can we help?</h2>
          <p className={styles.text}>
            Hi! Send a ticket with any issues, feedback, or ideas for improving Arcane Ledger.
            Your note will reach the Admin, and if a reply is needed, the Admin will reach back
            through your account email.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Ticket</span>
            <TextAreaInput
              className={styles.supportTextarea}
              maxLength={FEEDBACK_MAX_LENGTH}
              placeholder="Write your issue, feedback, or idea here..."
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                setError(null);
                setMessage(null);
              }}
            />
          </label>

          <div className={styles.supportMetaRow}>
            <span>{remainingCharacters} characters remaining</span>
            {cooldownLabel ? <span>Next ticket available in {cooldownLabel}</span> : null}
          </div>

          {cooldownLabel ? (
            <div className={`${styles.message} ${styles.info}`}>
              Support tickets can be submitted once per hour.
            </div>
          ) : null}

          {message ? <div className={`${styles.message} ${styles.success}`}>{message}</div> : null}
          {error ? <div className={`${styles.message} ${styles.error}`}>{error}</div> : null}

          <div className={styles.actions}>
            <ActionButton
              icon={<Send size={16} aria-hidden="true" />}
              loading={submitting}
              type="submit"
              disabled={submitDisabled}
            >
              Send Ticket
            </ActionButton>
          </div>
        </form>
      </div>
    </section>
  );
}

export default SupportPage;
