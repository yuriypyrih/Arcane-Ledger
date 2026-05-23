import { KeyRound, LogOut, UserCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword, logout } from "../../api/auth";
import ActionButton from "../../components/ActionButton";
import TextInput from "../../components/CharactersPage/FormInputs/TextInput";
import {
  clearAuthSession,
  setAuthError,
  showToast,
  useAppDispatch,
  useAppSelector
} from "../../store";
import { formatAuthDate, getApiErrorMessage } from "./authPageUtils";
import styles from "./AuthPages.module.css";

function AccountPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error, status, user } = useAppSelector((state) => state.auth);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout({ suppressFailureToast: true });
    } finally {
      dispatch(clearAuthSession());
      setLoggingOut(false);
      navigate("/");
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(setAuthError(null));

    if (password !== confirmPassword) {
      dispatch(setAuthError("Passwords do not match."));
      return;
    }

    setChangingPassword(true);

    try {
      await changePassword(
        {
          currentPassword,
          password
        },
        { suppressFailureToast: true }
      );
      dispatch(clearAuthSession());
      dispatch(
        showToast({
          text: "Password changed. Please log in again.",
          type: "success"
        })
      );
      navigate("/login");
    } catch (error) {
      dispatch(setAuthError(getApiErrorMessage(error, "Unable to change password.")));
    } finally {
      setChangingPassword(false);
    }
  }

  if (status === "unknown") {
    return (
      <section className={styles.page}>
        <div className={styles.panel}>
          <div className={styles.header}>
            <p className={styles.eyebrow}>Account</p>
            <h2 className={styles.title}>Loading</h2>
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className={styles.page}>
        <div className={styles.panel}>
          <div className={styles.header}>
            <p className={styles.eyebrow}>Account</p>
            <h2 className={styles.title}>Guest Session</h2>
          </div>
          <div className={styles.actions}>
            <ActionButton
              icon={<UserCircle size={16} aria-hidden="true" />}
              type="button"
              onClick={() => navigate("/login")}
            >
              Log In
            </ActionButton>
            <ActionButton variant="OUTLINE" type="button" onClick={() => navigate("/register")}>
              Register
            </ActionButton>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={`${styles.panel} ${styles.widePanel}`}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Account</p>
          <h2 className={styles.title}>Your Account</h2>
        </div>

        <div className={styles.accountGrid}>
          <section className={styles.accountSection} aria-labelledby="account-details-title">
            <h3 id="account-details-title" className={styles.eyebrow}>
              Details
            </h3>
            <dl className={styles.detailList}>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>Email</dt>
                <dd className={styles.detailValue}>{user.email}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>Role</dt>
                <dd className={styles.detailValue}>
                  <span className={styles.rolePill}>{user.role}</span>
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>Verified</dt>
                <dd className={styles.detailValue}>{formatAuthDate(user.emailVerifiedAt)}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>Created</dt>
                <dd className={styles.detailValue}>{formatAuthDate(user.createdAt)}</dd>
              </div>
            </dl>
            <div className={styles.actions}>
              <ActionButton
                actionType="WARNING"
                icon={<LogOut size={16} aria-hidden="true" />}
                loading={loggingOut}
                type="button"
                onClick={handleLogout}
              >
                Log Out
              </ActionButton>
            </div>
          </section>

          <section className={styles.accountSection} aria-labelledby="password-title">
            <h3 id="password-title" className={styles.eyebrow}>
              Password
            </h3>
            <form className={styles.form} onSubmit={handleChangePassword}>
              <label className={styles.field}>
                <span className={styles.label}>Current Password</span>
                <TextInput
                  className={styles.input}
                  autoComplete="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </label>
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

              <div className={styles.actions}>
                <ActionButton
                  icon={<KeyRound size={16} aria-hidden="true" />}
                  loading={changingPassword}
                  type="submit"
                >
                  Change Password
                </ActionButton>
              </div>
            </form>
          </section>
        </div>
      </div>
    </section>
  );
}

export default AccountPage;
