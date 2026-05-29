import { Save, X } from "lucide-react";
import { useState } from "react";
import type { PlayerVisibilitySettings } from "../../api/campaigns";
import ActionButton from "../../components/ActionButton";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../components/Overlay";
import { getDmToolsApiErrorMessage } from "./dmToolsApiErrors";
import {
  createPlayerVisibilitySettings,
  PLAYER_VISIBILITY_SETTING_GROUPS,
  type PlayerVisibilitySettingKey
} from "./playerVisibilitySettings";
import styles from "./DmToolsPage.module.css";

type PlayerVisibilitySettingsModalProps = {
  initialSettings: PlayerVisibilitySettings | null | undefined;
  isAlwaysOn?: boolean;
  onClose: () => void;
  onSave: (settings: PlayerVisibilitySettings | null) => Promise<void>;
  scope: "campaign" | "encounter" | "creature";
};

const modalTitleId = "player-visibility-settings-title";
const settingKeys = PLAYER_VISIBILITY_SETTING_GROUPS.flatMap((group) =>
  group.settings.map((setting) => setting.key)
);

const modalTitles = {
  campaign: "Campaign Player Visibility Settings",
  encounter: "Encounter Player Visibility Settings",
  creature: "Creature Player Visibility Settings"
} as const;

function PlayerVisibilitySwitchVisual({ checked }: { checked: boolean }) {
  return (
    <span
      className={
        checked
          ? `${styles.visibilitySwitch} ${styles.visibilitySwitchActive}`
          : styles.visibilitySwitch
      }
      aria-hidden="true"
    >
      <span className={styles.visibilitySwitchTrack}>
        <span className={styles.visibilitySwitchThumb} />
      </span>
    </span>
  );
}

function PlayerVisibilitySettingsModal({
  initialSettings,
  isAlwaysOn = false,
  onClose,
  onSave,
  scope
}: PlayerVisibilitySettingsModalProps) {
  const [draftSettings, setDraftSettings] = useState(() =>
    createPlayerVisibilitySettings(initialSettings)
  );
  const [isEnabled, setIsEnabled] = useState(isAlwaysOn || initialSettings !== null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const settingsEnabled = isAlwaysOn || isEnabled;
  const areAllSettingsSelected = settingKeys.every((key) => draftSettings[key]);

  function handleToggleSetting(key: PlayerVisibilitySettingKey) {
    setDraftSettings((currentSettings) => ({
      ...currentSettings,
      [key]: !currentSettings[key]
    }));
  }

  function handleToggleAllSettings() {
    const nextValue = !areAllSettingsSelected;

    setDraftSettings((currentSettings) => {
      const nextSettings = { ...currentSettings };

      settingKeys.forEach((key) => {
        nextSettings[key] = nextValue;
      });

      return nextSettings;
    });
  }

  async function handleSave() {
    if (isSaving) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await onSave(settingsEnabled ? draftSettings : null);
      onClose();
    } catch (saveError) {
      setError(getDmToolsApiErrorMessage(saveError, "Unable to update visibility settings."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SheetModal
      titleId={modalTitleId}
      onClose={onClose}
      isBusy={isSaving}
      busyLabel="Saving visibility settings"
      size="small"
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={modalTitleId}>{modalTitles[scope]}</OverlayTitle>
          <OverlaySummary>
            These settings shape what players can see about creatures during Encounter Tracking
            Module gameplay. Campaign settings guide the whole campaign, encounter settings can step
            in for one encounter, and creature settings can fine-tune one creature.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton
          label="Close visibility settings modal"
          disabled={isSaving}
          onClick={onClose}
        />
      </OverlayHeader>

      <OverlayBody className={styles.visibilityModalBody}>
        <div className={styles.visibilityToggleList}>
          <button
            type="button"
            role="switch"
            aria-checked={settingsEnabled}
            className={styles.visibilityToggleRow}
            disabled={isSaving || isAlwaysOn}
            onClick={() => setIsEnabled((currentValue) => !currentValue)}
          >
            <span className={styles.visibilityToggleMain}>
              <strong>Settings Enabled</strong>
              <small>
                {isAlwaysOn
                  ? "Campaign scope keeps this control locked for campaign-wide play."
                  : "Use this scope when it should take priority over the broader settings."}
              </small>
            </span>
            <PlayerVisibilitySwitchVisual checked={settingsEnabled} />
          </button>

          <button
            type="button"
            className={styles.visibilitySelectAllButton}
            disabled={isSaving || !settingsEnabled}
            onClick={handleToggleAllSettings}
          >
            {areAllSettingsSelected ? "Deselect all" : "Select all"}
          </button>

          {PLAYER_VISIBILITY_SETTING_GROUPS.map((group) => (
            <section key={group.label} className={styles.visibilityGroup}>
              <h3 className={styles.visibilityGroupTitle}>{group.label}</h3>
              <div className={styles.visibilityGroupedToggleList}>
                {group.settings.map((setting) => (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={draftSettings[setting.key]}
                    key={setting.key}
                    className={
                      settingsEnabled
                        ? `${styles.visibilityToggleRow} ${styles.visibilityGroupedToggleRow}`
                        : `${styles.visibilityToggleRow} ${styles.visibilityGroupedToggleRow} ${styles.visibilityToggleRowDisabled}`
                    }
                    disabled={isSaving || !settingsEnabled}
                    onClick={() => handleToggleSetting(setting.key)}
                  >
                    <span className={styles.visibilityToggleMain}>
                      <strong>{setting.label}</strong>
                    </span>
                    <PlayerVisibilitySwitchVisual checked={draftSettings[setting.key]} />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        {error ? <p className={styles.modalError}>{error}</p> : null}
      </OverlayBody>

      <OverlayFooter>
        <div className={styles.visibilityModalFooterActions}>
          <ActionButton
            type="button"
            variant="OUTLINE"
            icon={<X size={16} aria-hidden="true" />}
            disabled={isSaving}
            onClick={onClose}
          >
            Cancel
          </ActionButton>
          <ActionButton
            type="button"
            icon={<Save size={16} aria-hidden="true" />}
            loading={isSaving}
            loadingLabel="Saving visibility settings"
            onClick={() => {
              void handleSave();
            }}
          >
            Save
          </ActionButton>
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

export default PlayerVisibilitySettingsModal;
