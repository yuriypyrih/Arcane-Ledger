import clsx from "clsx";
import d20Icon from "../../../../assets/svg/d20.svg";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import {
  createChargesCardUsage,
  createFeatureActionCardCost,
  createNamedResourceCardUsage
} from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import type { MonkDisciplinedSurvivorOptionState } from "../../../../pages/CharactersPage/classFeatures/monk/monkDisciplinedSurvivor";
import DiceRollerSettingsButton from "../GameplayForm/widgets/DiceRollerSettingsButton";
import FeatureOptInToggle from "../FeatureOptInToggle/FeatureOptInToggle";
import styles from "./StatsForm.module.css";

type AbilityReferenceFooterProps = {
  actionName: string;
  canUseIndomitableOnSave: boolean;
  indomitableUsesRemaining: number;
  indomitableUsesTotal: number;
  isIndomitableSaveSelected: boolean;
  onIndomitableSaveChange: (checked: boolean) => void;
  disciplinedSurvivorState: MonkDisciplinedSurvivorOptionState | null;
  isDisciplinedSurvivorSelected: boolean;
  onDisciplinedSurvivorChange: (checked: boolean) => void;
  isDiceRollerSettingsOpen: boolean;
  onDiceRollerSettingsOpenChange: (open: boolean) => void;
  onRollMod: () => void;
  onRollSave: () => void;
};

function AbilityReferenceFooter({
  actionName,
  canUseIndomitableOnSave,
  indomitableUsesRemaining,
  indomitableUsesTotal,
  isIndomitableSaveSelected,
  onIndomitableSaveChange,
  disciplinedSurvivorState,
  isDisciplinedSurvivorSelected,
  onDisciplinedSurvivorChange,
  isDiceRollerSettingsOpen,
  onDiceRollerSettingsOpenChange,
  onRollMod,
  onRollSave
}: AbilityReferenceFooterProps) {
  const indomitableSaveToggleDisabled = indomitableUsesRemaining <= 0;

  return (
    <div className={styles.referenceFooterStack}>
      {canUseIndomitableOnSave ? (
        <FeatureOptInToggle
          label="Indomitable"
          checked={isIndomitableSaveSelected}
          disabled={indomitableSaveToggleDisabled}
          muted={indomitableSaveToggleDisabled}
          onCheckedChange={onIndomitableSaveChange}
          title={indomitableSaveToggleDisabled ? "No Indomitable uses remaining." : undefined}
          usage={createChargesCardUsage(indomitableUsesRemaining, indomitableUsesTotal)}
          application={{ targetLabel: "Save Roll" }}
          usageKey="indomitable-save-roll"
        />
      ) : null}
      {disciplinedSurvivorState ? (
        <FeatureOptInToggle
          label="Discipline Survivor"
          checked={isDisciplinedSurvivorSelected}
          disabled={disciplinedSurvivorState.disabled}
          muted={disciplinedSurvivorState.disabled}
          onCheckedChange={onDisciplinedSurvivorChange}
          title={disciplinedSurvivorState.disabledReason ?? undefined}
          usage={createNamedResourceCardUsage(
            createFeatureActionCardCost({
              amountText: String(disciplinedSurvivorState.focusPointCost),
              icon: "brain"
            })
          )}
          application={{ targetLabel: "Save Roll" }}
          usageKey="discipline-survivor-save-roll"
        />
      ) : null}
      <div className={styles.referenceRollActions}>
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.referenceRollButton)}
          onClick={onRollMod}
        >
          <img src={d20Icon} alt="" className={styles.referenceRollIcon} />
          <span>Mod Roll</span>
        </button>
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.referenceRollButton)}
          onClick={onRollSave}
        >
          <img src={d20Icon} alt="" className={styles.referenceRollIcon} />
          <span>Save Roll</span>
        </button>
        <DiceRollerSettingsButton
          actionName={actionName}
          className={clsx(sheetStyles.castButton, styles.referenceRollSettingsButton)}
          isOpen={isDiceRollerSettingsOpen}
          onOpenChange={onDiceRollerSettingsOpenChange}
        />
      </div>
    </div>
  );
}

export default AbilityReferenceFooter;
