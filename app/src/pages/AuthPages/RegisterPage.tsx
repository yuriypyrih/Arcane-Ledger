import { MailCheck, UserPlus } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { registerAccount } from "../../api/auth";
import ActionButton from "../../components/ActionButton";
import TextInput from "../../components/CharactersPage/FormInputs/TextInput";
import { setAuthError, setAuthLoading, useAppDispatch, useAppSelector } from "../../store";
import { getApiErrorMessage } from "./authPageUtils";
import styles from "./AuthPages.module.css";

function RegisterPage() {
  const dispatch = useAppDispatch();
  const { error, loading } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const response = await registerAccount({ email, password }, { suppressFailureToast: true });
      setMessage(response.message);
      setPassword("");
      dispatch(setAuthLoading(false));
    } catch (error) {
      dispatch(setAuthError(getApiErrorMessage(error, "Unable to create account.")));
      dispatch(setAuthLoading(false));
    }
  }

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
              onChange={(event) => setEmail(event.target.value)}
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
