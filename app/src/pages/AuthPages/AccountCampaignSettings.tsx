import { BellRing, MailWarning } from "lucide-react";
import { useEffect, useState } from "react";
import {
  loadPreferences,
  PREFERENCES_CHANGED_EVENT,
  updatePreferences,
  type Preferences
} from "../../storage/preferences";
import { useAppSelector } from "../../store";
import styles from "./AuthPages.module.css";

type SettingKey = "emailNewSession" | "emailReschedule" | "notificationBadge";

const SETTINGS: { description: string; key: SettingKey; label: string }[] = [
  {
    key: "emailNewSession",
    label: "New session emails",
    description:
      "Email me when a GM schedules a new session for a campaign I play in, or moves its time."
  },
  {
    key: "emailReschedule",
    label: "Reschedule proposal emails",
    description: "Email me when a GM proposes a new time for a session."
  },
  {
    key: "notificationBadge",
    label: "Red badge on the notification bell",
    description:
      "Show a count on the bell when a session needs you. Turn it off if it nags; the bell still lists sessions."
  }
];

/** Campaign settings: which campaign emails reach this account, and whether the bell nags. */
function AccountCampaignSettings() {
  const isVerified = useAppSelector((state) => Boolean(state.auth.user?.emailVerifiedAt));
  const [preferences, setPreferences] = useState<Preferences>(() => loadPreferences());

  useEffect(() => {
    const sync = () => setPreferences(loadPreferences());

    window.addEventListener(PREFERENCES_CHANGED_EVENT, sync);

    return () => window.removeEventListener(PREFERENCES_CHANGED_EVENT, sync);
  }, []);

  return (
    <section className={styles.accountSection} aria-labelledby="campaign-settings-title">
      <div className={styles.accountSectionTopline}>
        <div className={styles.accountSectionHeader}>
          <span className={styles.accountSectionIcon}>
            <BellRing size={20} aria-hidden="true" />
          </span>
          <div>
            <p className={styles.eyebrow}>Campaigns</p>
            <h2 id="campaign-settings-title" className={styles.accountSectionTitle}>
              Campaign Settings
            </h2>
          </div>
        </div>
      </div>

      {isVerified ? null : (
        <p className={styles.profileError}>
          <MailWarning size={16} aria-hidden="true" /> Your email is not verified, so no campaign
          emails are sent to you whatever you choose here.
        </p>
      )}

      <ul className={styles.settingList}>
        {SETTINGS.map((setting) => (
          <li key={setting.key} className={styles.settingRow}>
            <div className={styles.settingText}>
              <span className={styles.settingLabel}>{setting.label}</span>
              <span className={styles.settingDescription}>{setting.description}</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences[setting.key]}
              aria-label={setting.label}
              className={styles.switch}
              onClick={() =>
                setPreferences(updatePreferences({ [setting.key]: !preferences[setting.key] }))
              }
            >
              <span className={styles.switchThumb} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AccountCampaignSettings;
