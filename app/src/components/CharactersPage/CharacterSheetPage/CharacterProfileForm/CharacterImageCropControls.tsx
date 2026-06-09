import type { CharacterPortraitCropSettings } from "../../../../pages/CharactersPage/characterPortraits";
import styles from "./CharacterProfileForm.module.css";

type CharacterImageCropControlsProps = {
  cropSettings: CharacterPortraitCropSettings;
  label: string;
  onUpdate: (key: keyof CharacterPortraitCropSettings, value: string) => void;
};

function CharacterImageCropControls({
  cropSettings,
  label,
  onUpdate
}: CharacterImageCropControlsProps) {
  return (
    <div className={styles.portraitCropControls} aria-label={label}>
      <label className={styles.portraitCropField}>
        <span>
          Angle <strong>{cropSettings.rotationDegrees} deg</strong>
        </span>
        <input
          type="range"
          min="-30"
          max="30"
          step="1"
          value={cropSettings.rotationDegrees}
          onChange={(event) => onUpdate("rotationDegrees", event.target.value)}
        />
      </label>
      <label className={styles.portraitCropField}>
        <span>
          Zoom <strong>{cropSettings.zoom.toFixed(2)}x</strong>
        </span>
        <input
          type="range"
          min="1"
          max="2.5"
          step="0.05"
          value={cropSettings.zoom}
          onChange={(event) => onUpdate("zoom", event.target.value)}
        />
      </label>
      <label className={styles.portraitCropField}>
        <span>
          Horizontal <strong>{Math.round(cropSettings.offsetX * 100)}%</strong>
        </span>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.02"
          value={cropSettings.offsetX}
          onChange={(event) => onUpdate("offsetX", event.target.value)}
        />
      </label>
      <label className={styles.portraitCropField}>
        <span>
          Vertical <strong>{Math.round(cropSettings.offsetY * 100)}%</strong>
        </span>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.02"
          value={cropSettings.offsetY}
          onChange={(event) => onUpdate("offsetY", event.target.value)}
        />
      </label>
    </div>
  );
}

export default CharacterImageCropControls;
