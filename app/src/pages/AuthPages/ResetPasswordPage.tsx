import { KeyRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import ActionButton from "../../components/ActionButton";
import TextInput from "../../components/CharactersPage/FormInputs/TextInput";
import {
  clearAuthSession,
  setAuthError,
  setAuthLoading,
  useAppDispatch,
  useAppSelector
} from "../../store";
import { getApiErrorMessage } from "./authPageUtils";
import styles from "./AuthPages.module.css";

function ResetPasswordPage() {
  const dispatch = useAppDispatch();
  const { token } = useParams();
  const { error, loading } = useAppSelector((state) => state.auth);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setAuthError(null));
  }, [dispatch]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    dispatch(setAuthError(null));

    if (!token) {
      dispatch(setAuthError("Password reset token is missing."));
      return;
    }

    if (password !== confirmPassword) {
      dispatch(setAuthError("Passwords do not match."));
      return;
    }

    dispatch(setAuthLoading(true));

    try {
      const response = await resetPassword(token, password, { suppressFailureToast: true });
      setMessage(response.message);
      setPassword("");
      setConfirmPassword("");
      dispatch(clearAuthSession());
    } catch (error) {
      dispatch(setAuthError(getApiErrorMessage(error, "Unable to reset password.")));
      dispatch(setAuthLoading(false));
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Account</p>
          <h2 className={styles.title}>Reset Password</h2>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>New Password</span>
            <TextInput
              className={styles.input}
              autoComplete="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Confirm Password</span>
            <TextInput
              className={styles.input}
              autoComplete="new-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>

          {error ? <div className={`${styles.message} ${styles.error}`}>{error}</div> : null}
          {message ? <div className={`${styles.message} ${styles.success}`}>{message}</div> : null}

          <div className={styles.actions}>
            <ActionButton
              icon={<KeyRound size={16} aria-hidden="true" />}
              loading={loading}
              type="submit"
            >
              Reset Password
            </ActionButton>
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

export default ResetPasswordPage;
