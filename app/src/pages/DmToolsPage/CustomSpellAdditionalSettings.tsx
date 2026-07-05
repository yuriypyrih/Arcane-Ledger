import Checkbox from "../../components/CharactersPage/FormInputs/Checkbox";
import type { CustomSpellDraft } from "./customSpellDraft";
import styles from "./DmToolsPage.module.css";

type CustomSpellAdditionalSettingsProps = {
  disabled: boolean;
  ritual: CustomSpellDraft["ritual"];
  summoningSpell: CustomSpellDraft["summoningSpell"];
  onRitualChange: (checked: boolean) => void;
  onSummoningSpellChange: (checked: boolean) => void;
};

function CustomSpellAdditionalSettings({
  disabled,
  ritual,
  summoningSpell,
  onRitualChange,
  onSummoningSpellChange
}: CustomSpellAdditionalSettingsProps) {
  return (
    <section className={styles.customSpellEditorSection}>
      <span className={styles.modalFieldLabel}>Additional Settings</span>
      <div className={styles.checkboxGrid}>
        <Checkbox
          className={styles.checkboxPill}
          checked={ritual}
          disabled={disabled}
          onCheckedChange={onRitualChange}
          label="Ritual"
        />

        <Checkbox
          className={styles.checkboxPill}
          checked={summoningSpell}
          disabled={disabled}
          onCheckedChange={onSummoningSpellChange}
          label="Summoning Spell"
        />
      </div>
    </section>
  );
}

export default CustomSpellAdditionalSettings;
