import { BadgeCheck, CalendarDays, KeyRound, LogOut, Mail, UserCircle } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword, logout } from "../../api/auth";
import ActionButton from "../../components/ActionButton";
import TextInput from "../../components/CharactersPage/FormInputs/TextInput";
import { clearStoredCharacters } from "../CharactersPage/storage";
import {
  clearAuthSession,
  setAuthError,
  showToast,
  useAppDispatch,
  useAppSelector
} from "../../store";
import { formatAuthDate, getApiErrorMessage } from "./authPageUtils";
import styles from "./AuthPages.module.css";

type AccountDetailCardProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

function AccountDetailCard({ icon, label, value }: AccountDetailCardProps) {
  return (
    <div className={styles.accountDetailCard}>
      <span className={styles.accountDetailIcon}>{icon}</span>
      <div className={styles.accountDetailContent}>
        <span className={styles.accountDetailLabel}>{label}</span>
        <span className={styles.accountDetailValue}>{value}</span>
      </div>
    </div>
  );
}

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
      clearStoredCharacters();
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
      clearStoredCharacters();
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
      <section className={styles.accountPage}>
        <div className={styles.accountHeaderCard}>
          <div className={styles.accountHeaderCopy}>
            <p className={styles.eyebrow}>Account</p>
            <h1 className={styles.accountTitle}>Loading Account</h1>
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className={styles.accountPage}>
        <div className={styles.accountGuestGrid}>
          <section className={styles.accountHeaderCard}>
            <div className={styles.accountHeaderCopy}>
              <p className={styles.eyebrow}>Account</p>
              <h1 className={styles.accountTitle}>Guest Session</h1>
              <p className={styles.accountIntro}>Sign in to manage account settings.</p>
            </div>
          </section>

          <section className={styles.accountSection} aria-labelledby="guest-account-title">
            <div className={styles.accountSectionHeader}>
              <span className={styles.accountSectionIcon}>
                <UserCircle size={20} aria-hidden="true" />
              </span>
              <div>
                <p className={styles.eyebrow}>Session</p>
                <h2 id="guest-account-title" className={styles.accountSectionTitle}>
                  Account Access
                </h2>
              </div>
            </div>

            <div className={styles.accountButtonRow}>
              <ActionButton
                icon={<UserCircle size={16} aria-hidden="true" />}
                type="button"
                fullWidth={false}
                onClick={() => navigate("/login")}
              >
                Log In
              </ActionButton>
              <ActionButton
                variant="OUTLINE"
                type="button"
                fullWidth={false}
                onClick={() => navigate("/register")}
              >
                Register
              </ActionButton>
            </div>
          </section>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.accountPage}>
      <div className={styles.accountHeaderCard}>
        <div className={styles.accountHeaderCopy}>
          <p className={styles.eyebrow}>Account</p>
          <h1 className={styles.accountTitle}>Your Account</h1>
        </div>

        <aside className={styles.accountIdentityCard} aria-label="Signed in account">
          <span className={styles.accountAvatar}>
            <UserCircle size={30} aria-hidden="true" />
          </span>
          <div className={styles.accountIdentityText}>
            <span className={styles.accountIdentityLabel}>Signed in as</span>
            <strong>{user.email}</strong>
          </div>
          <ActionButton
            actionType="WARNING"
            icon={<LogOut size={16} aria-hidden="true" />}
            loading={loggingOut}
            type="button"
            fullWidth={false}
            onClick={handleLogout}
          >
            Log Out
          </ActionButton>
        </aside>
      </div>

      <div className={styles.accountLayout}>
        <section className={styles.accountSection} aria-labelledby="account-details-title">
          <div className={styles.accountSectionHeader}>
            <span className={styles.accountSectionIcon}>
              <BadgeCheck size={20} aria-hidden="true" />
            </span>
            <div>
              <p className={styles.eyebrow}>Profile</p>
              <h2 id="account-details-title" className={styles.accountSectionTitle}>
                Account Details
              </h2>
            </div>
          </div>

          <div className={styles.accountDetailGrid}>
            <AccountDetailCard
              icon={<Mail size={18} aria-hidden="true" />}
              label="Email"
              value={user.email}
            />
            <AccountDetailCard
              icon={<BadgeCheck size={18} aria-hidden="true" />}
              label="Role"
              value={<span className={styles.rolePill}>{user.role}</span>}
            />
            <AccountDetailCard
              icon={<CalendarDays size={18} aria-hidden="true" />}
              label="Created"
              value={formatAuthDate(user.createdAt)}
            />
          </div>
        </section>

        <section
          className={`${styles.accountSection} ${styles.accountPasswordSection}`}
          aria-labelledby="password-title"
        >
          <div className={styles.accountSectionHeader}>
            <span className={styles.accountSectionIcon}>
              <KeyRound size={20} aria-hidden="true" />
            </span>
            <div>
              <p className={styles.eyebrow}>Security</p>
              <h2 id="password-title" className={styles.accountSectionTitle}>
                Change Password
              </h2>
              <p className={styles.accountSectionText}>You will log in again after it changes.</p>
            </div>
          </div>

          <form className={styles.accountPasswordForm} onSubmit={handleChangePassword}>
            <div className={styles.accountPasswordFields}>
              <label className={`${styles.field} ${styles.accountFieldWide}`}>
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
            </div>

            {error ? <div className={`${styles.message} ${styles.error}`}>{error}</div> : null}

            <div className={styles.accountPasswordFooter}>
              <ActionButton
                className={styles.accountPasswordButton}
                icon={<KeyRound size={16} aria-hidden="true" />}
                loading={changingPassword}
                type="submit"
                fullWidth={false}
              >
                Change Password
              </ActionButton>
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}

export default AccountPage;
