import ActionButton from "../../../../../../ActionButton";
import RadioContainerOption from "../../../../RadioContainerOption";
import MonsterStatBlockPickerModal from "../../../../ClassFeaturesAndFeats/MonsterStatBlockPickerModal";
import type { MonsterRecord } from "../../../../../../../types";
import { formatWildShapeMonsterMeta } from "../actionsWidgetPresentation";
import styles from "../ActionsWidget.module.css";

type FluidFormsShapechangerActionBodyProps = {
  selectedMonster: MonsterRecord | null;
  isPickerOpen: boolean;
  onPickerOpenChange: (isOpen: boolean) => void;
  onSelectMonster: (monster: MonsterRecord) => void;
};

const fluidFormsEligibleTypes = ["Beast", "Humanoid", "Monstrosity"];

function FluidFormsShapechangerActionBody({
  selectedMonster,
  isPickerOpen,
  onPickerOpenChange,
  onSelectMonster
}: FluidFormsShapechangerActionBodyProps) {
  return (
    <div className={styles.wildShapeBody}>
      {selectedMonster ? (
        <RadioContainerOption
          name="fluid-forms-monster"
          header={selectedMonster.name}
          breakdown={
            <span className={styles.wildShapeOptionDescription}>
              {formatWildShapeMonsterMeta(selectedMonster)}
            </span>
          }
          selected
          onSelect={() => onPickerOpenChange(true)}
          className={styles.wildShapeOption}
        />
      ) : null}

      <ActionButton
        className={styles.fluidFormsPickerButton}
        onClick={() => onPickerOpenChange(true)}
      >
        Define Shape-shift Stat Block
      </ActionButton>

      {isPickerOpen ? (
        <MonsterStatBlockPickerModal
          titleId="fluid-forms-shapechanger-stat-block-picker-title"
          eyebrow="Shapechanger"
          title="Define Shape-shift Stat Block"
          summary="Choose one stat block for this Shapechanger activation."
          selectedMonster={selectedMonster}
          eligibleOnlyLabel="Eligible Forms"
          eligibleTypes={fluidFormsEligibleTypes}
          eligibleMaxCr={10}
          onSelectMonster={onSelectMonster}
          onClose={() => onPickerOpenChange(false)}
        />
      ) : null}
    </div>
  );
}

export default FluidFormsShapechangerActionBody;
