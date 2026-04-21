import clsx from "clsx";
import d20Icon from "../../../../assets/svg/d20.svg";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import {
  createChargesCardUsage,
  createFeatureActionCardCost,
  createNamedResourceCardUsage
} from "../../../../pages/CharactersPage/classFeatures/cardUsage";
import DiceRollerSettingsButton from "../GameplayForm/widgets/DiceRollerSettingsButton";
import FeatureOptInToggle from "../FeatureOptInToggle/FeatureOptInToggle";
import styles from "./StatsForm.module.css";

type InitiativeReferenceFooterProps = {
  hasUncannyMetabolism: boolean;
  uncannyMetabolismUsesRemaining: number;
  uncannyMetabolismUsesTotal: number;
  useUncannyMetabolismOnInitiative: boolean;
  onUseUncannyMetabolismChange: (checked: boolean) => void;
  hasPersistentRage: boolean;
  persistentRageUsesRemaining: number;
  persistentRageUsesTotal: number;
  usePersistentRageOnInitiative: boolean;
  onUsePersistentRageChange: (checked: boolean) => void;
  hasTandemFootwork: boolean;
  tandemFootworkAvailable: boolean;
  useTandemFootworkOnInitiative: boolean;
  onUseTandemFootworkChange: (checked: boolean) => void;
  isDiceRollerSettingsOpen: boolean;
  onDiceRollerSettingsOpenChange: (open: boolean) => void;
  onRollInitiative: () => void;
};

function InitiativeReferenceFooter({
  hasUncannyMetabolism,
  uncannyMetabolismUsesRemaining,
  uncannyMetabolismUsesTotal,
  useUncannyMetabolismOnInitiative,
  onUseUncannyMetabolismChange,
  hasPersistentRage,
  persistentRageUsesRemaining,
  persistentRageUsesTotal,
  usePersistentRageOnInitiative,
  onUsePersistentRageChange,
  hasTandemFootwork,
  tandemFootworkAvailable,
  useTandemFootworkOnInitiative,
  onUseTandemFootworkChange,
  isDiceRollerSettingsOpen,
  onDiceRollerSettingsOpenChange,
  onRollInitiative
}: InitiativeReferenceFooterProps) {
  return (
    <div className={styles.initiativeActions}>
      <div className={styles.initiativeActionsStart}>
        {hasUncannyMetabolism ? (
          <FeatureOptInToggle
            label="Uncanny Metabolism"
            checked={useUncannyMetabolismOnInitiative}
            disabled={uncannyMetabolismUsesRemaining <= 0}
            muted={uncannyMetabolismUsesRemaining <= 0}
            onCheckedChange={onUseUncannyMetabolismChange}
            title={
              uncannyMetabolismUsesRemaining <= 0 ? "No Uncanny Metabolism charges remaining." : undefined
            }
            usage={createChargesCardUsage(
              uncannyMetabolismUsesRemaining,
              uncannyMetabolismUsesTotal
            )}
            usageKey="uncanny-metabolism-initiative"
          />
        ) : null}
        {hasPersistentRage ? (
          <FeatureOptInToggle
            label="Persistent Rage"
            checked={usePersistentRageOnInitiative}
            disabled={persistentRageUsesRemaining <= 0}
            muted={persistentRageUsesRemaining <= 0}
            onCheckedChange={onUsePersistentRageChange}
            usage={createChargesCardUsage(persistentRageUsesRemaining, persistentRageUsesTotal)}
            usageKey="persistent-rage-initiative"
          />
        ) : null}
        {hasTandemFootwork ? (
          <FeatureOptInToggle
            label="Tandem Footwork"
            checked={useTandemFootworkOnInitiative}
            disabled={!tandemFootworkAvailable}
            muted={!tandemFootworkAvailable}
            onCheckedChange={onUseTandemFootworkChange}
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: "1",
                icon: "music"
              })
            )}
            usageKey="tandem-footwork-initiative"
          />
        ) : null}
      </div>
      <div className={styles.initiativeActionButtons}>
        <button
          type="button"
          className={clsx(sheetStyles.castButton, styles.initiativeRollButton)}
          onClick={onRollInitiative}
        >
          <img src={d20Icon} alt="" className={styles.initiativeRollIcon} />
          <span>Roll Initiative</span>
        </button>
        <DiceRollerSettingsButton
          actionName="Initiative"
          className={clsx(sheetStyles.castButton, styles.initiativeSettingsButton)}
          isOpen={isDiceRollerSettingsOpen}
          onOpenChange={onDiceRollerSettingsOpenChange}
        />
      </div>
    </div>
  );
}

export default InitiativeReferenceFooter;
