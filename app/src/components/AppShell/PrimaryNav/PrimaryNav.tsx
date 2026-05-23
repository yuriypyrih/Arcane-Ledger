import { LogIn, Settings, UserCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../store";
import type { NavigationLink } from "../navigationLinks";
import styles from "./PrimaryNav.module.css";

type PrimaryNavProps = {
  links: NavigationLink[];
  broadLayout: boolean;
  showBroadLayoutSwitch: boolean;
  onToggleBroadLayout: () => void;
};

function PrimaryNav({
  links,
  broadLayout,
  showBroadLayoutSwitch,
  onToggleBroadLayout
}: PrimaryNavProps) {
  const navigate = useNavigate();
  const { status, user } = useAppSelector((state) => state.auth);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const isAuthenticated = status === "authenticated" && Boolean(user);

  useEffect(() => {
    if (!accountMenuOpen) {
      return undefined;
    }

    function handleDocumentPointerDown(event: PointerEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [accountMenuOpen]);

  function handleAccountSettings() {
    setAccountMenuOpen(false);
    navigate("/account");
  }

  return (
    <nav className={styles.nav} aria-label="Primary">
      <div className={styles.leftCluster}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? `${styles.brandLink} ${styles.navLinkActive}` : styles.brandLink
          }
          end
          aria-label="Arcane Ledger home"
        >
          <span>Arcane Ledger</span>
        </NavLink>
        <div className={styles.linkGroup}>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              <Icon size={15} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
      <div className={styles.rightCluster}>
        {showBroadLayoutSwitch ? (
          <button
            type="button"
            role="switch"
            aria-checked={broadLayout}
            className={
              broadLayout
                ? `${styles.broadLayoutSwitch} ${styles.broadLayoutSwitchActive}`
                : styles.broadLayoutSwitch
            }
            onClick={onToggleBroadLayout}
          >
            <span className={styles.broadLayoutLabel}>Broad Layout</span>
            <span className={styles.switchTrack} aria-hidden="true">
              <span className={styles.switchThumb} />
            </span>
          </button>
        ) : null}
        {isAuthenticated ? (
          <div className={styles.accountMenuRoot} ref={accountMenuRef}>
            <button
              type="button"
              className={
                accountMenuOpen
                  ? `${styles.navButton} ${styles.navLinkActive}`
                  : styles.navButton
              }
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
              aria-label="Account"
              onClick={() => setAccountMenuOpen((open) => !open)}
            >
              <UserCircle size={15} aria-hidden="true" />
              <span>Account</span>
            </button>
            {accountMenuOpen ? (
              <div className={styles.accountMenu} role="menu">
                <div className={styles.accountMenuHeader}>
                  <span className={styles.accountMenuKicker}>Signed in</span>
                  <strong>{user?.email}</strong>
                </div>
                <button
                  type="button"
                  className={styles.accountMenuItem}
                  role="menuitem"
                  onClick={handleAccountSettings}
                >
                  <Settings size={15} aria-hidden="true" />
                  <span>Account Settings</span>
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <NavLink
            to="/login"
            aria-label="Log in"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            <LogIn size={15} aria-hidden="true" />
            <span>Log In</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default PrimaryNav;
