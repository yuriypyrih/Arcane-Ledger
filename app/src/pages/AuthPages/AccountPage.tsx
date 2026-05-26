import { BadgeCheck, CalendarDays, KeyRound, LogOut, Mail, Pencil, UserCircle } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { changeNickname, changePassword, logout } from "../../api/auth";
import ActionButton from "../../components/ActionButton";
import { clearStoredCharacters } from "../CharactersPage/storage";
import {
  clearAuthSession,
  setAuthError,
  setAuthenticatedUser,
  showToast,
  useAppDispatch,
  useAppSelector
} from "../../store";
import { formatAuthDate, getApiErrorMessage } from "./authPageUtils";
import AccountNicknameModal from "./AccountNicknameModal";
import AccountPasswordModal from "./AccountPasswordModal";
import AccountPrivilegesSection from "./AccountPrivilegesSection";
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
  const [changingNickname, setChangingNickname] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
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

  function openPasswordModal() {
    dispatch(setAuthError(null));
    setIsPasswordModalOpen(true);
  }

  function openNicknameModal() {
    dispatch(setAuthError(null));
    setIsNicknameModalOpen(true);
  }

  function closePasswordModal() {
    if (changingPassword) {
      return;
    }

    dispatch(setAuthError(null));
    setIsPasswordModalOpen(false);
  }

  function closeNicknameModal() {
    if (changingNickname) {
      return;
    }

    dispatch(setAuthError(null));
    setIsNicknameModalOpen(false);
  }

  async function handleChangePassword(currentPassword: string, password: string) {
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

  async function handleChangeNickname(nickname: string) {
    setChangingNickname(true);

    try {
      const response = await changeNickname({ nickname }, { suppressFailureToast: true });
      dispatch(setAuthenticatedUser(response.user));
      setIsNicknameModalOpen(false);
      dispatch(
        showToast({
          text: "Nickname changed.",
          type: "success"
        })
      );
    } catch (error) {
      dispatch(setAuthError(getApiErrorMessage(error, "Unable to change nickname.")));
    } finally {
      setChangingNickname(false);
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
          <div className={styles.accountSectionTopline}>
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
          </div>

          <div className={styles.accountDetailGrid}>
            <AccountDetailCard
              icon={<Mail size={18} aria-hidden="true" />}
              label="Email"
              value={user.email}
            />
            <AccountDetailCard
              icon={<UserCircle size={18} aria-hidden="true" />}
              label="Nickname"
              value={user.nickname}
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

          <div className={styles.accountActionRows}>
            <ActionButton
              icon={<KeyRound size={16} aria-hidden="true" />}
              type="button"
              onClick={openPasswordModal}
            >
              Change Password
            </ActionButton>
            <ActionButton
              icon={<Pencil size={16} aria-hidden="true" />}
              variant="OUTLINE"
              type="button"
              onClick={openNicknameModal}
            >
              Change Nickname
            </ActionButton>
          </div>
        </section>

        <AccountPrivilegesSection role={user.role} />
      </div>

      {isPasswordModalOpen ? (
        <AccountPasswordModal
          error={error}
          isBusy={changingPassword}
          onChangePassword={handleChangePassword}
          onClearError={() => dispatch(setAuthError(null))}
          onClose={closePasswordModal}
        />
      ) : null}
      {isNicknameModalOpen ? (
        <AccountNicknameModal
          error={error}
          initialNickname={user.nickname}
          isBusy={changingNickname}
          onChangeNickname={handleChangeNickname}
          onClearError={() => dispatch(setAuthError(null))}
          onClose={closeNicknameModal}
        />
      ) : null}
    </section>
  );
}

export default AccountPage;
