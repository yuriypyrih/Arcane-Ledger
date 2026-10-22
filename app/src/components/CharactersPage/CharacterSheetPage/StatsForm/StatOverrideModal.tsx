import { Save, X } from "lucide-react";
import { useId, useState } from "react";
import ActionButton from "../../../ActionButton";
import NumberInput from "../../FormInputs/NumberInput";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import styles from "./StatOverrideModal.module.css";

export type StatOverrideField = { key: string; label: string; value: number; maximum: number };

type Props = {
  label: string;
  enabled: boolean;
  fields: StatOverrideField[];
  onClose: () => void;
  onSave: (enabled: boolean, values: Record<string, number>) => void;
};

export default function StatOverrideModal({ label, enabled, fields, onClose, onSave }: Props) {
  const titleId = useId();
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.key, String(field.value)]))
  );
  const valid = (field: StatOverrideField) =>
    /^\d+$/.test(draft[field.key] ?? "") && Number(draft[field.key]) <= field.maximum;
  const canSave = !isEnabled || fields.every(valid);

  return (
    <SheetModal titleId={titleId} onClose={onClose}>
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id={titleId}>Overwrite {label}</OverlayTitle>
          <OverlaySummary>
            Overwriting is not recommended because the app calculates stats using built-in rules.
            Use it only as a last resort after checking how to make the change through the normal
            controls.
          </OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close stat overwrite" onClick={onClose} />
      </OverlayHeader>
      <OverlayBody className={styles.body}>
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          className={styles.toggle}
          onClick={() => setIsEnabled((current) => !current)}
        >
          <span>Enable overwrite</span>
          <span className={styles.track} aria-hidden="true">
            <span />
          </span>
        </button>
        <div className={styles.fields}>
          {fields.map((field) => (
            <label key={field.key} className={styles.field}>
              <span>{field.label}</span>
              <NumberInput
                min={0}
                max={field.maximum}
                step={1}
                disabled={!isEnabled}
                value={draft[field.key]}
                invalid={isEnabled && !valid(field)}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [field.key]: event.target.value
                  }))
                }
              />
            </label>
          ))}
        </div>
      </OverlayBody>
      <OverlayFooter className={styles.footer}>
        <ActionButton variant="OUTLINE" icon={<X size={16} aria-hidden="true" />} onClick={onClose}>
          Cancel
        </ActionButton>
        <ActionButton
          icon={<Save size={16} aria-hidden="true" />}
          disabled={!canSave}
          onClick={() => {
            if (!canSave) return;
            onSave(
              isEnabled,
              Object.fromEntries(
                fields.map((field) => [
                  field.key,
                  valid(field) ? Number(draft[field.key]) : field.value
                ])
              )
            );
          }}
        >
          Save
        </ActionButton>
      </OverlayFooter>
    </SheetModal>
  );
}
