import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Cloud,
  CloudOff,
  Headset,
  LogIn,
  Maximize2,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  UserCircle,
  X
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useIsLazyLoading } from "../../../lib/lazyLoadTracker";
import { useMediaQuery } from "../../../lib/useMediaQuery";
import { useOnlineStatus } from "../../../lib/useOnlineStatus";
import { useAppSelector } from "../../../store";
import ExternalImage from "../../ExternalImage";
import SessionNotificationsBell from "../../SessionNotificationsBell";
import { navigationLinks } from "../navigationLinks";
import {
  getThemeModePreference,
  PREFERENCES_CHANGED_EVENT,
  updateThemeModePreference
} from "../../../storage/preferences";
import { MEDIA_QUERIES } from "../../../styles/breakpoints";
import type { CharacterSheetSyncStatus } from "../../../types";
import styles from "./SidebarNav.module.css";

type SidebarNavProps = {
  broadLayout: boolean;
  showBroadLayoutSwitch: boolean;
  onToggleBroadLayout: () => void;
};

export function SidebarNav({
  broadLayout,
  showBroadLayoutSwitch,
  onToggleBroadLayout
}: SidebarNavProps) {
  const location = useLocation();
  const isMobile = useMediaQuery(MEDIA_QUERIES.mdDown);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const [collapsedPreference, setCollapsedPreference] = useState(() => {
    try {
      const stored = localStorage.getItem("arcane-ledger.sidebar-collapsed");
      return stored === "true";
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    const newState = !collapsedPreference;
    setCollapsedPreference(newState);
    try {
      localStorage.setItem("arcane-ledger.sidebar-collapsed", String(newState));
    } catch {
      // Silently fail if localStorage unavailable
    }
  };

  const isCollapsed = !isMobile && collapsedPreference;
  const isDrawerOpen = isMobile && isMobileOpen;

  useEffect(() => {
    setIsMobileOpen(false);
    setShowAccountMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile) {
      setIsMobileOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isDrawerOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileCloseRef.current?.focus();

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setShowAccountMenu((open) => {
        if (!open) {
          setIsMobileOpen(false);
          mobileToggleRef.current?.focus();
        }
        return false;
      });
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDrawerOpen]);

  const closeDrawer = () => {
    setIsMobileOpen(false);
    mobileToggleRef.current?.focus();
  };

  const auth = useAppSelector((state) => state.auth);
  const isOnline = useOnlineStatus();
  const isLazyLoading = useIsLazyLoading();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [accountMenuPosition, setAccountMenuPosition] = useState<CSSProperties | undefined>(
    undefined
  );
  const [themeMode, setThemeMode] = useState(() => getThemeModePreference());

  useEffect(() => {
    const sync = () => setThemeMode(getThemeModePreference());
    window.addEventListener(PREFERENCES_CHANGED_EVENT, sync);
    return () => window.removeEventListener(PREFERENCES_CHANGED_EVENT, sync);
  }, []);

  const handleThemeToggle = (mode: "light" | "dark") => {
    updateThemeModePreference(mode);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
      setShowAccountMenu(false);
    }
  };

  useEffect(() => {
    if (showAccountMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showAccountMenu]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowAccountMenu(false);
    }
  };

  const activeCharacter = useAppSelector((state) => state.activeCharacterSheet.activeCharacter);
  const syncStatus = activeCharacter?.storageMetadata?.sync?.syncStatus;
  const isAuthenticated = auth.status === "authenticated" && Boolean(auth.user);
  const isAdmin = auth.user?.role === "admin";

  const getMenuItemClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.menuItem} ${styles.menuItemActive}` : styles.menuItem;

  const navClassName = [
    styles.sidebar,
    isCollapsed ? styles.collapsed : "",
    isMobile ? styles.drawer : "",
    isDrawerOpen ? styles.drawerOpen : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {isMobile && (
        <>
          <button
            ref={mobileToggleRef}
            type="button"
            className={`${styles.mobileToggle} ${isDrawerOpen ? styles.mobileToggleHidden : ""}`}
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={isDrawerOpen}
            aria-controls="primary-navigation"
          >
            <Menu size={24} />
          </button>
          <div
            className={`${styles.backdrop} ${isDrawerOpen ? styles.backdropVisible : ""}`}
            onClick={closeDrawer}
            aria-hidden="true"
          />
        </>
      )}
      <nav
        id="primary-navigation"
        aria-label="Primary"
        className={navClassName}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.sidebarInner}>
          {/* Brand */}
          <div className={styles.brand}>
            <NavLink to="/" aria-label="Arcane Ledger home" className={styles.brandLink}>
              <span className={styles.brandMark}>✦</span>
              {!isCollapsed && <span className={styles.label}>Arcane Ledger</span>}
            </NavLink>
            {isMobile && (
              <button
                ref={mobileCloseRef}
                type="button"
                className={styles.drawerClose}
                onClick={closeDrawer}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className={styles.links}>
            {navigationLinks.map((link) => {
              if (link.requiresAuth && !isAuthenticated) return null;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.linkActive : ""}`
                  }
                  title={isCollapsed ? link.label : undefined}
                >
                  <link.icon size={22} className={styles.linkIcon} />
                  {!isCollapsed && <span className={styles.linkLabel}>{link.label}</span>}
                  {link.to === "/compendium" && isLazyLoading && (
                    <span className={styles.loadingSpinner}>⟳</span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Sync Status Badge */}
          {isAuthenticated && (
            <div className={styles.syncBadge} title={getSyncLabel(syncStatus, isOnline)}>
              {!isOnline ? (
                <CloudOff size={16} />
              ) : syncStatus === "synced" || syncStatus === undefined ? (
                <Cloud size={16} style={{ opacity: 0.5 }} />
              ) : (
                <Cloud size={16} />
              )}
              {!isCollapsed && (
                <span className={styles.syncLabel}>{getSyncLabel(syncStatus, isOnline)}</span>
              )}
            </div>
          )}

          {/* Theme Toggle & Account */}
          <div className={styles.footer}>
            {showBroadLayoutSwitch && (
              <button
                type="button"
                role="switch"
                aria-checked={broadLayout}
                aria-label="Broad Layout"
                title={isCollapsed ? "Broad Layout" : undefined}
                className={`${styles.themeToggle} ${broadLayout ? styles.switchOn : ""}`}
                onClick={onToggleBroadLayout}
              >
                <Maximize2 size={22} />
                {!isCollapsed && <span className={styles.label}>Broad Layout</span>}
                {!isCollapsed && (
                  <span className={styles.switchTrack} aria-hidden="true">
                    <span className={styles.switchThumb} />
                  </span>
                )}
              </button>
            )}
            {isAuthenticated ? (
              <SessionNotificationsBell
                buttonClassName={styles.themeToggle}
                label={isCollapsed ? undefined : "Notifications"}
                placement="side"
              />
            ) : null}
            <button
              type="button"
              className={styles.themeToggle}
              onClick={() => handleThemeToggle(themeMode === "dark" ? "light" : "dark")}
              title={`Switch to ${themeMode === "dark" ? "light" : "dark"} mode`}
              aria-label={`Switch to ${themeMode === "dark" ? "light" : "dark"} mode`}
            >
              {themeMode === "dark" ? <Sun size={22} /> : <Moon size={22} />}
              {!isCollapsed && (
                <span className={styles.label}>
                  {themeMode === "dark" ? "Light mode" : "Dark mode"}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div ref={accountMenuRef} className={styles.accountMenu}>
                <button
                  type="button"
                  className={styles.accountButton}
                  onClick={() => {
                    // The sidebar scrolls and clips what sticks out of it, so the menu is placed on screen.
                    const rect = accountMenuRef.current?.getBoundingClientRect();

                    setAccountMenuPosition(
                      rect
                        ? {
                            left: rect.right + 8,
                            bottom: Math.max(8, window.innerHeight - rect.bottom)
                          }
                        : undefined
                    );
                    setShowAccountMenu(!showAccountMenu);
                  }}
                  aria-label="Account"
                  aria-expanded={showAccountMenu}
                  title={isCollapsed ? "Account" : undefined}
                >
                  <ExternalImage
                    src={auth.user?.avatarUrl}
                    className={styles.accountButtonAvatar}
                    fallback={<Settings size={22} />}
                  />
                  {!isCollapsed && <span className={styles.label}>Account</span>}
                </button>
                {showAccountMenu && (
                  <div
                    className={styles.accountMenuDropdown}
                    style={accountMenuPosition}
                    role="menu"
                    aria-label="Account menu"
                  >
                    <div className={styles.menuProfile}>
                      <span className={styles.menuAvatar} aria-hidden="true">
                        <ExternalImage
                          src={auth.user?.avatarUrl}
                          className={styles.menuAvatarImage}
                          fallback={
                            <span>
                              {(auth.user?.nickname || auth.user?.email || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          }
                        />
                      </span>
                      <span className={styles.menuIdentity}>
                        <strong className={styles.menuName}>
                          {auth.user?.nickname || auth.user?.email}
                        </strong>
                        {auth.user?.nickname ? (
                          <span className={styles.menuEmail}>{auth.user.email}</span>
                        ) : null}
                      </span>
                    </div>
                    <NavLink to="/account" role="menuitem" className={getMenuItemClass}>
                      <UserCircle size={18} aria-hidden="true" />
                      <span>Account Settings</span>
                    </NavLink>
                    {isAdmin && (
                      <>
                        <p className={styles.menuSection}>Admin</p>
                        <NavLink to="/administration" role="menuitem" className={getMenuItemClass}>
                          <ShieldCheck size={18} aria-hidden="true" />
                          <span>Administration</span>
                        </NavLink>
                        <NavLink to="/analytics" role="menuitem" className={getMenuItemClass}>
                          <BarChart3 size={18} aria-hidden="true" />
                          <span>Analytics</span>
                        </NavLink>
                      </>
                    )}
                    <div className={styles.menuDivider} aria-hidden="true" />
                    <NavLink to="/support" role="menuitem" className={getMenuItemClass}>
                      <Headset size={18} aria-hidden="true" />
                      <span>Support &amp; Feedback</span>
                    </NavLink>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to="/login"
                className={styles.loginLink}
                title={isCollapsed ? "Log in" : undefined}
              >
                <LogIn size={22} />
                {!isCollapsed && <span>Log in</span>}
              </NavLink>
            )}
          </div>
        </div>

        {!isMobile && (
          <button
            type="button"
            className={styles.collapseToggle}
            onClick={handleToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </nav>
    </>
  );
}

function getSyncLabel(syncStatus: CharacterSheetSyncStatus | undefined, isOnline: boolean): string {
  if (!isOnline) return "Offline";
  switch (syncStatus) {
    case "synced":
    case undefined:
      return "Synced";
    case "dirty":
      return "Pending";
    case "syncing":
      return "Syncing";
    case "deleting":
      return "Deleting";
    case "conflict":
      return "Conflict";
    case "error":
      return "Error";
    case "local-only":
      return "Local only";
    default:
      return "Unknown";
  }
}
