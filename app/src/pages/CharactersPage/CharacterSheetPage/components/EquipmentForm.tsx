import clsx from "clsx";
import { Pencil, Save, X } from "lucide-react";
import shared from "./CharacterSheetSectionShared.module.css";

type EquipmentFormProps = {
  className?: string;
  availableEquipmentOptions: string[];
  characterClassName: string;
  currentEquipment: string[];
  equipmentDraft: string[];
  isEditing: boolean;
  onBeginEdit: () => void;
  onCancel: () => void;
  onOpenEquipmentEntry: (item: string) => void;
  onSave: () => void;
  onToggleEquipment: (item: string) => void;
};

function EquipmentForm({
  className,
  availableEquipmentOptions,
  characterClassName,
  currentEquipment,
  equipmentDraft,
  isEditing,
  onBeginEdit,
  onCancel,
  onOpenEquipmentEntry,
  onSave,
  onToggleEquipment
}: EquipmentFormProps) {
  return (
    <article className={clsx(shared.sectionCard, className)}>
      <div className={shared.sectionHeader}>
        <div>
          <p className={shared.eyebrow}>Equipment</p>
          <h3 className={shared.subtitle}>Current loadout</h3>
        </div>
        {isEditing ? null : (
          <button type="button" className={shared.editButton} onClick={onBeginEdit}>
            <Pencil size={16} />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <>
          <p className={shared.helperText}>
            Weapons and armor are filtered by {characterClassName} proficiencies; items come from the codex.
          </p>
          <div className={shared.choiceGrid}>
            {availableEquipmentOptions.map((item) => (
              <label
                key={item}
                className={clsx(shared.choiceChip, equipmentDraft.includes(item) && shared.choiceChipActive)}
              >
                <input
                  type="checkbox"
                  checked={equipmentDraft.includes(item)}
                  onChange={() => onToggleEquipment(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <div className={shared.formActions}>
            <button type="button" className={shared.saveButton} onClick={onSave}>
              <Save size={16} />
              Save
            </button>
            <button type="button" className={shared.cancelButton} onClick={onCancel}>
              <X size={16} />
              Cancel
            </button>
          </div>
        </>
      ) : currentEquipment.length === 0 ? (
        <p className={shared.emptyText}>No equipment selected.</p>
      ) : (
        <ul className={shared.tagList}>
          {currentEquipment.map((item) => (
            <li key={item}>
              <button type="button" className={shared.tagButton} onClick={() => onOpenEquipmentEntry(item)}>
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default EquipmentForm;
