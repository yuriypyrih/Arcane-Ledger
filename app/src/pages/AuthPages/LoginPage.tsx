import { LogIn, MailCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, resendEmailVerification } from "../../api/auth";
import ActionButton from "../../components/ActionButton";
import TextInput from "../../components/CharactersPage/FormInputs/TextInput";
import {
  setAuthError,
  setAuthLoading,
  setAuthenticatedUser,
  useAppDispatch,
  useAppSelector
} from "../../store";
import { getApiErrorCode, getApiErrorMessage } from "./authPageUtils";
import styles from "./AuthPages.module.css";

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error, loading } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [canResendVerification, setCanResendVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    dispatch(setAuthError(null));
  }, [dispatch]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCanResendVerification(false);
    setResendMessage(null);
    dispatch(setAuthError(null));
    dispatch(setAuthLoading(true));

    try {
      const { user } = await login({ email, password }, { suppressFailureToast: true });
      dispatch(setAuthenticatedUser(user));
      navigate("/");
    } catch (error) {
      setCanResendVerification(getApiErrorCode(error) === "EMAIL_NOT_VERIFIED");
      dispatch(setAuthError(getApiErrorMessage(error, "Unable to log in.")));
      dispatch(setAuthLoading(false));
    }
  }

  async function handleResendVerification() {
    setResending(true);
    setResendMessage(null);

    try {
      const { message } = await resendEmailVerification(email, { suppressFailureToast: true });
      setResendMessage(message);
    } catch (error) {
      setResendMessage(getApiErrorMessage(error, "Unable to send verification email."));
    } finally {
      setResending(false);
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Account</p>
          <h2 className={styles.title}>Log In</h2>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <TextInput
              className={styles.input}
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <TextInput
              className={styles.input}
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <div className={`${styles.message} ${styles.error}`}>{error}</div> : null}
          {resendMessage ? (
            <div className={`${styles.message} ${styles.success}`}>{resendMessage}</div>
          ) : null}

          <div className={styles.actions}>
            <ActionButton
              icon={<LogIn size={16} aria-hidden="true" />}
              loading={loading}
              type="submit"
            >
              Log In
            </ActionButton>
            {canResendVerification ? (
              <ActionButton
                icon={<MailCheck size={16} aria-hidden="true" />}
                loading={resending}
                variant="OUTLINE"
                type="button"
                onClick={handleResendVerification}
              >
                Resend Email
              </ActionButton>
            ) : null}
          </div>
        </form>

        <div className={styles.linkRow}>
          <Link className={styles.link} to="/register">
            Create account
          </Link>
          <Link className={styles.link} to="/forgot-password">
            Forgot password
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
