import { useState } from "react";
import styles from "./CreatureResistanceVisibilityToggle.module.css";

type CreatureResistanceVisibilityToggleProps = {
  isVisible: boolean;
  onChange: (show: boolean) => void | Promise<void>;
};

/** GM-only: lets players see this creature's damage and status resistances, immunities and vulnerabilities. */
function CreatureResistanceVisibilityToggle({
  isVisible,
  onChange
}: CreatureResistanceVisibilityToggleProps) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange(show: boolean) {
    setIsSaving(true);

    try {
      await onChange(show);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <label className={styles.toggle}>
      <input
        type="checkbox"
        checked={isVisible}
        disabled={isSaving}
        onChange={(event) => void handleChange(event.target.checked)}
      />
      <span>
        Show resistances &amp; immunities to players
        <span className={styles.hint}> (damage and status)</span>
      </span>
    </label>
  );
}

export default CreatureResistanceVisibilityToggle;
