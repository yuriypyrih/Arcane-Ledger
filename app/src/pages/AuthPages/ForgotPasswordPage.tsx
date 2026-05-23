import { KeyRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth";
import ActionButton from "../../components/ActionButton";
import TextInput from "../../components/CharactersPage/FormInputs/TextInput";
import { setAuthError, setAuthLoading, useAppDispatch, useAppSelector } from "../../store";
import { getApiErrorMessage } from "./authPageUtils";
import styles from "./AuthPages.module.css";

function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const { error, loading } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setAuthError(null));
  }, [dispatch]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    dispatch(setAuthError(null));
    dispatch(setAuthLoading(true));

    try {
      const response = await forgotPassword(email, { suppressFailureToast: true });
      setMessage(response.message);
      dispatch(setAuthLoading(false));
    } catch (error) {
      dispatch(setAuthError(getApiErrorMessage(error, "Unable to request password reset.")));
      dispatch(setAuthLoading(false));
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Account</p>
          <h2 className={styles.title}>Forgot Password</h2>
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

          {error ? <div className={`${styles.message} ${styles.error}`}>{error}</div> : null}
          {message ? <div className={`${styles.message} ${styles.success}`}>{message}</div> : null}

          <div className={styles.actions}>
            <ActionButton
              icon={<KeyRound size={16} aria-hidden="true" />}
              loading={loading}
              type="submit"
            >
              Send Reset Link
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

export default ForgotPasswordPage;
