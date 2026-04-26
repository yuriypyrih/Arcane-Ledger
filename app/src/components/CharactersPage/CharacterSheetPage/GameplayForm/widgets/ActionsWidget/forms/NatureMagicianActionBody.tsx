import RadioContainerOption from "../../../../RadioContainerOption";
import shared from "../../../../CharacterSheetSectionShared/CharacterSheetSectionShared.module.css";
import styles from "../ActionsWidget.module.css";

type NatureMagicianActionBodyProps = {
  options: Array<{
    wildShapeCost: number;
    spellSlotLevel: number;
  }>;
  selectedSpellSlotLevel: number | null;
  onSelectSpellSlotLevel: (spellSlotLevel: number) => void;
};

function NatureMagicianActionBody({
  options,
  selectedSpellSlotLevel,
  onSelectSpellSlotLevel
}: NatureMagicianActionBodyProps) {
  if (options.length <= 0) {
    return (
      <p className={shared.emptyText}>
        No matching expended spell slots can be restored right now.
      </p>
    );
  }

  return (
    <div className={styles.natureMagicianBody}>
      {options.map((option) => (
        <RadioContainerOption
          key={`nature-magician-${option.spellSlotLevel}`}
          name="nature-magician-option"
          header={`Recover 1 level ${option.spellSlotLevel} spell slot`}
          subheader={`Use ${option.wildShapeCost} Wild Shape`}
          selected={selectedSpellSlotLevel === option.spellSlotLevel}
          onSelect={() => onSelectSpellSlotLevel(option.spellSlotLevel)}
        />
      ))}
    </div>
  );
}

export default NatureMagicianActionBody;
