import SelectInput from "../../../../../FormInputs/SelectInput";
import RadioContainerOption from "../../../../RadioContainerOption";
import type { WildResurgenceMode } from "../types";
import styles from "../ActionsWidget.module.css";

type WildResurgenceActionBodyProps = {
  spellSlotOptions: Array<{
    level: number;
    remaining: number;
    total: number;
  }>;
  selectedMode: WildResurgenceMode | null;
  selectedSpellSlotLevel: number;
  wildShapeUsesRemaining: number;
  wildShapeUsesTotal: number;
  levelOneSpellSlotRemaining: number;
  levelOneSpellSlotTotal: number;
  spellSlotRecoveryUsesRemaining: number;
  onSelectMode: (mode: WildResurgenceMode) => void;
  onSelectSpellSlotLevel: (slotLevel: number) => void;
};

function WildResurgenceActionBody({
  spellSlotOptions,
  selectedMode,
  selectedSpellSlotLevel,
  wildShapeUsesRemaining,
  wildShapeUsesTotal,
  levelOneSpellSlotRemaining,
  levelOneSpellSlotTotal,
  spellSlotRecoveryUsesRemaining,
  onSelectMode,
  onSelectSpellSlotLevel
}: WildResurgenceActionBodyProps) {
  const availableSpellSlotOptions = spellSlotOptions.filter((slot) => slot.remaining > 0);
  const canRecoverWildShape = availableSpellSlotOptions.length > 0;
  const canRecoverLevelOneSpellSlot =
    spellSlotRecoveryUsesRemaining > 0 &&
    wildShapeUsesRemaining > 0 &&
    levelOneSpellSlotRemaining < levelOneSpellSlotTotal;

  return (
    <div className={styles.wildCompanionBody}>
      <RadioContainerOption
        name="wild-resurgence-mode"
        header="Recover 1 Wild Shape"
        breakdown={
          canRecoverWildShape
            ? "Expend an available spell slot. This can be done only once on each of your turns."
            : "Requires 0 Wild Shape remaining and an available spell slot"
        }
        selected={selectedMode === "spell-slot-to-wild-shape"}
        onSelect={() => onSelectMode("spell-slot-to-wild-shape")}
        disabled={!canRecoverWildShape}
      />
      {selectedMode === "spell-slot-to-wild-shape" && canRecoverWildShape ? (
        <label className={styles.wildCompanionSelectField}>
          <span className={styles.wildCompanionSelectLabel}>Spell Slot</span>
          <SelectInput
            aria-label="Wild Resurgence spell slot"
            value={selectedSpellSlotLevel}
            className={styles.wildCompanionSelect}
            onChange={(event) => onSelectSpellSlotLevel(Number(event.target.value))}
          >
            {availableSpellSlotOptions.map((slot) => (
              <option key={`wild-resurgence-slot-${slot.level}`} value={slot.level}>
                Level {slot.level} ({slot.remaining}/{slot.total})
              </option>
            ))}
          </SelectInput>
        </label>
      ) : null}
      <RadioContainerOption
        name="wild-resurgence-mode"
        header="Recover 1 Level 1 Spell Slot"
        breakdown={
          canRecoverLevelOneSpellSlot
            ? `${wildShapeUsesRemaining}/${wildShapeUsesTotal} Wild Shape uses remaining, ${spellSlotRecoveryUsesRemaining}/1 charge available`
            : "Requires 1 Wild Shape, an expended level 1 slot, and an unused charge"
        }
        selected={selectedMode === "wild-shape-to-slot"}
        onSelect={() => onSelectMode("wild-shape-to-slot")}
        disabled={!canRecoverLevelOneSpellSlot}
      />
    </div>
  );
}

export default WildResurgenceActionBody;
