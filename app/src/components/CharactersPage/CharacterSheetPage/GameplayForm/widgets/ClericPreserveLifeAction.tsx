import CellContainer from "../../../../CellContainer/CellContainer";
import sheetStyles from "../../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import styles from "./ClericPreserveLifeAction.module.css";

type ClericPreserveLifeActionBodyProps = {
  clericLevel: number;
};

function getPreserveLifeHealingPool(clericLevel: number) {
  return Math.max(0, Math.floor(clericLevel)) * 5;
}

export function ClericPreserveLifeActionBody({
  clericLevel
}: ClericPreserveLifeActionBodyProps) {
  return (
    <div className={sheetStyles.spellDrawerDetails}>
      <CellContainer
        className={styles.fullWidthCell}
        label="Healing Pool"
        content={`${getPreserveLifeHealingPool(clericLevel)} Heal`}
        breakdown="[= 5 x Cleric Level]"
      />
    </div>
  );
}
