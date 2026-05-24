import { MailCheck, UserPlus } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { registerAccount, resendEmailVerification } from "../../api/auth";
import ActionButton from "../../components/ActionButton";
import TextInput from "../../components/CharactersPage/FormInputs/TextInput";
import { setAuthError, setAuthLoading, useAppDispatch, useAppSelector } from "../../store";
import { getApiErrorMessage } from "./authPageUtils";
import styles from "./AuthPages.module.css";

const RESEND_VERIFICATION_DELAY_SECONDS = 30;

function RegisterPage() {
  const dispatch = useAppDispatch();
  const { error, loading } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
  const [resendUsed, setResendUsed] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    dispatch(setAuthError(null));
  }, [dispatch]);

  useEffect(() => {
    if (!registeredEmail || resendUsed || resendCooldownSeconds <= 0) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setResendCooldownSeconds((currentSeconds) => Math.max(0, currentSeconds - 1));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [registeredEmail, resendCooldownSeconds, resendUsed]);

  function resetVerificationResendState() {
    setMessage(null);
    setRegisteredEmail(null);
    setResendCooldownSeconds(0);
    setResendUsed(false);
    setResending(false);
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
    resetVerificationResendState();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetVerificationResendState();
    dispatch(setAuthError(null));
    dispatch(setAuthLoading(true));

    try {
      const response = await registerAccount({ email, password }, { suppressFailureToast: true });
      setMessage(response.message);
      setRegisteredEmail(email.trim().toLowerCase());
      setResendCooldownSeconds(RESEND_VERIFICATION_DELAY_SECONDS);
      setPassword("");
      dispatch(setAuthLoading(false));
    } catch (error) {
      dispatch(setAuthError(getApiErrorMessage(error, "Unable to create account.")));
      dispatch(setAuthLoading(false));
    }
  }

  async function handleResendVerification() {
    if (!registeredEmail || resendUsed || resendCooldownSeconds > 0) {
      return;
    }

    setResending(true);
    setResendUsed(true);

    try {
      const response = await resendEmailVerification(registeredEmail, {
        suppressFailureToast: true
      });
      setMessage(response.message);
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Unable to send verification email."));
    } finally {
      setResending(false);
    }
  }

  const resendButtonLabel =
    resendCooldownSeconds > 0 ? `Resend Email (${resendCooldownSeconds})` : "Resend Email";
  const canShowResendVerification = Boolean(message && registeredEmail);
  const resendDisabled = resendCooldownSeconds > 0 || resendUsed;

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Account</p>
          <h2 className={styles.title}>Register</h2>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <TextInput
              className={styles.input}
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={handleEmailChange}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <TextInput
              className={styles.input}
              autoComplete="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <div className={`${styles.message} ${styles.error}`}>{error}</div> : null}
          {message ? (
            <div className={`${styles.message} ${styles.success}`}>
              <MailCheck size={15} aria-hidden="true" />
              <span>{message}</span>
            </div>
          ) : null}

          <div className={styles.actions}>
            <ActionButton
              icon={<UserPlus size={16} aria-hidden="true" />}
              loading={loading}
              type="submit"
            >
              Register
            </ActionButton>
            {canShowResendVerification ? (
              <ActionButton
                icon={<MailCheck size={16} aria-hidden="true" />}
                loading={resending}
                variant="OUTLINE"
                type="button"
                disabled={resendDisabled}
                onClick={handleResendVerification}
              >
                {resendUsed ? "Verification Email Sent" : resendButtonLabel}
              </ActionButton>
            ) : null}
          </div>
        </form>

        <div className={styles.linkRow}>
          <Link className={styles.link} to="/login">
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
