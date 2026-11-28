import { Link2 } from "lucide-react";
import { useState } from "react";
import styles from "./EncounterCreatureTypeLink.module.css";

type CreatureTypeLinkNoticeProps = {
  /** How many creatures in this encounter share the type, this one included. */
  linkedCount: number;
  onMakeIndependent: () => void | Promise<void>;
};

/** GM-only: this creature follows a creature type; edits to its definition apply to the whole type. */
function CreatureTypeLinkNotice({ linkedCount, onMakeIndependent }: CreatureTypeLinkNoticeProps) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleClick() {
    setIsSaving(true);

    try {
      await onMakeIndependent();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.row}>
      <Link2 size={14} aria-hidden="true" />
      <span
        className={styles.chip}
      >{`Linked with ${linkedCount - 1} other creature${linkedCount === 2 ? "" : "s"}`}</span>
      <span className={styles.note}>
        Stat block, resistances, max HP, picture and description are shared.
      </span>
      <button
        type="button"
        className={styles.unlink}
        disabled={isSaving}
        onClick={() => void handleClick()}
      >
        Make independent
      </button>
    </div>
  );
}

export default CreatureTypeLinkNotice;
