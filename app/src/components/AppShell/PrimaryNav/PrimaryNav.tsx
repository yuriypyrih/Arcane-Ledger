import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Cloud,
  CloudOff,
  Headset,
  LoaderCircle,
  LogIn,
  Moon,
  RefreshCw,
  Settings,
  Sun,
  UserCircle
} from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { NavLink, useMatch, useNavigate } from "react-router-dom";
import { requestImmediateCharacterSync } from "../../../characterSync/characterSyncRequests";
import { requestImmediateLiveEncounterTrackerSync } from "../../../liveEncounterTracker/liveEncounterTrackerSyncRequests";
import { useIsLazyLoading } from "../../../lib/lazyLoadTracker";
import { useOnlineStatus } from "../../../lib/useOnlineStatus";
import { useAppSelector } from "../../../store";
import type { LiveEncounterTrackerSaveStatus } from "../../../store";
import type { CharacterSheetSyncStatus } from "../../../types";
import type { ThemeModePreference } from "../../../storage/preferences";
import type { NavigationLink } from "../navigationLinks";
import styles from "./PrimaryNav.module.css";

type NavSyncBadgeModel = {
  icon: typeof CheckCircle2;
  isActionable: boolean;
  label: string;
  tone: "green" | "orange" | "red";
};

const syncBadgeToneClasses = {
  green: styles.syncStatusBadgeGreen,
  orange: styles.syncStatusBadgeOrange,
  red: styles.syncStatusBadgeRed
} satisfies Record<NavSyncBadgeModel["tone"], string>;

function getNavSyncBadgeModel(
  syncStatus: CharacterSheetSyncStatus | undefined,
  isOnline: boolean
): NavSyncBadgeModel {
  if (!isOnline) {
    return {
      icon: CloudOff,
      isActionable: false,
      label: "Offline",
      tone: "red"
    };
  }

  switch (syncStatus) {
    case undefined:
    case "synced":
      return {
        icon: CheckCircle2,
        isActionable: false,
        label: "Synced",
        tone: "green"
      };
    case "dirty":
      return {
        icon: Cloud,
        isActionable: true,
        label: "Pending",
        tone: "orange"
      };
    case "syncing":
    case "deleting":
      return {
        icon: RefreshCw,
        isActionable: false,
        label: syncStatus === "deleting" ? "Deleting" : "Syncing",
        tone: "orange"
      };
    case "conflict":
      return {
        icon: AlertCircle,
        isActionable: true,
        label: "Conflict",
        tone: "red"
      };
    case "error":
      return {
        icon: AlertCircle,
        isActionable: true,
        label: "Error",
        tone: "red"
      };
    case "local-only":
    default:
      return {
        icon: Cloud,
        isActionable: false,
        label: "Local only",
        tone: "orange"
      };
  }
}

function getLiveEncounterTrackerSyncBadgeModel(
  syncStatus: LiveEncounterTrackerSaveStatus | undefined,
  isOnline: boolean
): NavSyncBadgeModel {
  if (!isOnline) {
    return {
      icon: CloudOff,
      isActionable: false,
      label: "Offline",
      tone: "red"
    };
  }

  switch (syncStatus) {
    case "synced":
      return {
        icon: CheckCircle2,
        isActionable: false,
        label: "Synced",
        tone: "green"
      };
    case "saving":
      return {
        icon: RefreshCw,
        isActionable: false,
        label: "Saving",
        tone: "orange"
      };
    case "error":
      return {
        icon: AlertCircle,
        isActionable: true,
        label: "Error",
        tone: "red"
      };
    case "dirty":
      return {
        icon: Cloud,
        isActionable: true,
        label: "Pending",
        tone: "orange"
      };
    default:
      return {
        icon: CheckCircle2,
        isActionable: false,
        label: "Synced",
        tone: "green"
      };
  }
}

type PrimaryNavProps = {
  links: NavigationLink[];
  broadLayout: boolean;
  characterSheetId: number | null;
  showBroadLayoutSwitch: boolean;
  themeMode: ThemeModePreference;
  onToggleBroadLayout: () => void;
  onToggleThemeMode: () => void;
};

function PrimaryNav({
  links,
  broadLayout,
  characterSheetId,
  showBroadLayoutSwitch,
  themeMode,
  onToggleBroadLayout,
  onToggleThemeMode
}: PrimaryNavProps) {
  const navigate = useNavigate();
  const liveEncounterTrackerMatch = useMatch({
    path: "/gm-tools/campaign-manager/:campaignId/live-encounter",
    end: true
  });
  const liveEncounterTrackerCampaignId = liveEncounterTrackerMatch?.params.campaignId ?? null;
  const isLazyLoading = useIsLazyLoading();
  const { status, user } = useAppSelector((state) => state.auth);
  const activeCharacter = useAppSelector((state) => state.activeCharacterSheet.activeCharacter);
  const isActiveSheetDirty = useAppSelector((state) => state.activeCharacterSheet.dirty);
  const liveEncounterTrackerSaveStatus = useAppSelector((state) =>
    liveEncounterTrackerCampaignId
      ? state.dmTools.liveEncounterTrackerSaveStatusByCampaignId[liveEncounterTrackerCampaignId]
      : undefined
  );
  const isOnline = useOnlineStatus();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const isAuthenticated = status === "authenticated" && Boolean(user);
  const storedSyncStatus = activeCharacter?.storageMetadata?.sync?.syncStatus;
  const shouldShowActiveDirty =
    isActiveSheetDirty && Boolean(storedSyncStatus) && storedSyncStatus !== "local-only";
  const effectiveSyncStatus = shouldShowActiveDirty ? "dirty" : storedSyncStatus;
  const isViewingActiveCharacter =
    characterSheetId !== null && activeCharacter?.id === characterSheetId;
  const syncBadge =
    liveEncounterTrackerCampaignId && isAuthenticated
      ? getLiveEncounterTrackerSyncBadgeModel(liveEncounterTrackerSaveStatus, isOnline)
      : isViewingActiveCharacter && isAuthenticated && activeCharacter
        ? getNavSyncBadgeModel(effectiveSyncStatus, isOnline)
        : null;
  const SyncBadgeIcon = syncBadge?.icon;
  const syncBadgeAction =
    liveEncounterTrackerCampaignId && isAuthenticated
      ? requestImmediateLiveEncounterTrackerSync
      : requestImmediateCharacterSync;
  const syncBadgeActionLabel =
    liveEncounterTrackerCampaignId && isAuthenticated
      ? "Retry encounter tracker sync"
      : "Retry character sync";
  const visibleLinks = links.filter((link) => !link.requiresAuth || isAuthenticated);
  const isDarkMode = themeMode === "dark";
  const ThemeIcon = isDarkMode ? Sun : Moon;

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

  function handleSupport() {
    setAccountMenuOpen(false);
    navigate("/support");
  }

  function handleAnalytics() {
    setAccountMenuOpen(false);
    navigate("/analytics");
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
          {visibleLinks.map(({ to, label, icon: Icon }) => (
            <Fragment key={to}>
              <NavLink
                to={to}
                aria-label={label}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                <Icon size={15} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
              {to === "/compendium" && isLazyLoading ? (
                <span
                  className={styles.lazyLoadingIndicator}
                  role="status"
                  aria-label="Loading"
                  aria-live="polite"
                >
                  <LoaderCircle
                    className={styles.lazyLoadingIcon}
                    size={15}
                    aria-hidden="true"
                  />
                  <span className={styles.lazyLoadingText}>Loading</span>
                </span>
              ) : null}
            </Fragment>
          ))}
        </div>
      </div>
      <div className={styles.rightCluster}>
        {syncBadge && SyncBadgeIcon ? (
          syncBadge.isActionable ? (
            <button
              type="button"
              className={`${styles.syncStatusBadge} ${syncBadgeToneClasses[syncBadge.tone]}`}
              aria-label={`${syncBadgeActionLabel}. Current status: ${syncBadge.label}`}
              onClick={syncBadgeAction}
            >
              <SyncBadgeIcon size={14} aria-hidden="true" />
              <span>{syncBadge.label}</span>
            </button>
          ) : (
            <span
              className={`${styles.syncStatusBadge} ${syncBadgeToneClasses[syncBadge.tone]}`}
            >
              <SyncBadgeIcon size={14} aria-hidden="true" />
              <span>{syncBadge.label}</span>
            </span>
          )
        ) : null}
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
                  <div className={styles.accountIdentity}>
                    <span className={styles.accountMenuKicker}>Signed in</span>
                    <strong>{user?.email}</strong>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    className={styles.accountThemeToggle}
                    aria-checked={isDarkMode}
                    aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    onClick={onToggleThemeMode}
                  >
                    <ThemeIcon size={15} strokeWidth={2.1} aria-hidden="true" />
                  </button>
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
                <button
                  type="button"
                  className={styles.accountMenuItem}
                  role="menuitem"
                  onClick={handleSupport}
                >
                  <Headset size={15} aria-hidden="true" />
                  <span>Support</span>
                </button>
                {user?.role === "admin" ? (
                  <button
                    type="button"
                    className={styles.accountMenuItem}
                    role="menuitem"
                    onClick={handleAnalytics}
                  >
                    <BarChart3 size={15} aria-hidden="true" />
                    <span>Analytics</span>
                  </button>
                ) : null}
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
