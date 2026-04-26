import SelectInput from "../../../../../FormInputs/SelectInput";
import RadioContainerOption from "../../../../RadioContainerOption";
import type { WildCompanionResourceKind } from "../types";
import styles from "../ActionsWidget.module.css";

type WildCompanionActionBodyProps = {
  wildShapeUsesRemaining: number;
  wildShapeUsesTotal: number;
  spellSlotOptions: Array<{
    level: number;
    remaining: number;
    total: number;
  }>;
  selectedResource: WildCompanionResourceKind;
  selectedSpellSlotLevel: number;
  onSelectResource: (resource: WildCompanionResourceKind) => void;
  onSelectSpellSlotLevel: (slotLevel: number) => void;
};

function WildCompanionActionBody({
  wildShapeUsesRemaining,
  wildShapeUsesTotal,
  spellSlotOptions,
  selectedResource,
  selectedSpellSlotLevel,
  onSelectResource,
  onSelectSpellSlotLevel
}: WildCompanionActionBodyProps) {
  const availableSpellSlotOptions = spellSlotOptions.filter((slot) => slot.remaining > 0);
  const hasAvailableSpellSlots = availableSpellSlotOptions.length > 0;

  return (
    <div className={styles.wildCompanionBody}>
      <RadioContainerOption
        name="wild-companion-resource"
        header="Use 1 Wild Shape"
        subheader={`${wildShapeUsesRemaining}/${wildShapeUsesTotal} uses remaining`}
        selected={selectedResource === "wild-shape"}
        onSelect={() => onSelectResource("wild-shape")}
        disabled={wildShapeUsesRemaining <= 0}
      />
      <RadioContainerOption
        name="wild-companion-resource"
        header="Use Spell Slot"
        breakdown={
          hasAvailableSpellSlots
            ? `${availableSpellSlotOptions.reduce((sum, slot) => sum + slot.remaining, 0)} spell slots available`
            : "No spell slots available"
        }
        selected={selectedResource === "spell-slot"}
        onSelect={() => onSelectResource("spell-slot")}
        disabled={!hasAvailableSpellSlots}
      />
      {selectedResource === "spell-slot" && hasAvailableSpellSlots ? (
        <label className={styles.wildCompanionSelectField}>
          <span className={styles.wildCompanionSelectLabel}>Spell Slot</span>
          <SelectInput
            aria-label="Wild Companion spell slot"
            value={selectedSpellSlotLevel}
            className={styles.wildCompanionSelect}
            onChange={(event) => onSelectSpellSlotLevel(Number(event.target.value))}
          >
            {availableSpellSlotOptions.map((slot) => (
              <option key={`wild-companion-slot-${slot.level}`} value={slot.level}>
                Level {slot.level} ({slot.remaining}/{slot.total})
              </option>
            ))}
          </SelectInput>
        </label>
      ) : null}
    </div>
  );
}

export default WildCompanionActionBody;
