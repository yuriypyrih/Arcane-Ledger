import ActionButton from "../../../ActionButton";
import d20Icon from "../../../../assets/svg/d20.svg";
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
  hasPurpleDragonRookRallyingCry: boolean;
  purpleDragonRookRallyingCryUsesRemaining: number;
  purpleDragonRookRallyingCryUsesTotal: number;
  usePurpleDragonRookRallyingCryOnInitiative: boolean;
  onUsePurpleDragonRookRallyingCryChange: (checked: boolean) => void;
  hasZhentarimRuffianFamilyFirst: boolean;
  zhentarimRuffianFamilyFirstAvailable: boolean;
  useZhentarimRuffianFamilyFirstOnInitiative: boolean;
  onUseZhentarimRuffianFamilyFirstChange: (checked: boolean) => void;
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
  hasPurpleDragonRookRallyingCry,
  purpleDragonRookRallyingCryUsesRemaining,
  purpleDragonRookRallyingCryUsesTotal,
  usePurpleDragonRookRallyingCryOnInitiative,
  onUsePurpleDragonRookRallyingCryChange,
  hasZhentarimRuffianFamilyFirst,
  zhentarimRuffianFamilyFirstAvailable,
  useZhentarimRuffianFamilyFirstOnInitiative,
  onUseZhentarimRuffianFamilyFirstChange,
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
        {hasPurpleDragonRookRallyingCry ? (
          <FeatureOptInToggle
            label="Rallying Cry"
            checked={usePurpleDragonRookRallyingCryOnInitiative}
            disabled={purpleDragonRookRallyingCryUsesRemaining <= 0}
            muted={purpleDragonRookRallyingCryUsesRemaining <= 0}
            onCheckedChange={onUsePurpleDragonRookRallyingCryChange}
            title={
              purpleDragonRookRallyingCryUsesRemaining <= 0
                ? "No Rallying Cry charges remaining."
                : undefined
            }
            usage={createChargesCardUsage(
              purpleDragonRookRallyingCryUsesRemaining,
              purpleDragonRookRallyingCryUsesTotal
            )}
            usageKey="purple-dragon-rook-rallying-cry-initiative"
          />
        ) : null}
        {hasZhentarimRuffianFamilyFirst ? (
          <FeatureOptInToggle
            label="Family First"
            checked={useZhentarimRuffianFamilyFirstOnInitiative}
            disabled={!zhentarimRuffianFamilyFirstAvailable}
            muted={!zhentarimRuffianFamilyFirstAvailable}
            onCheckedChange={onUseZhentarimRuffianFamilyFirstChange}
            title={
              !zhentarimRuffianFamilyFirstAvailable
                ? "Family First requires Heroic Inspiration."
                : undefined
            }
            usage={createNamedResourceCardUsage(
              createFeatureActionCardCost({
                amountText: "1",
                resourceLabel: "Heroic Inspiration",
                icon: "sparkles"
              })
            )}
            usageKey="zhentarim-ruffian-family-first-initiative"
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
        <ActionButton
          className={styles.initiativeRollButton}
          onClick={onRollInitiative}
          icon={<img src={d20Icon} alt="" className={styles.initiativeRollIcon} />}
        >
          Roll Initiative
        </ActionButton>
        <DiceRollerSettingsButton
          actionName="Initiative"
          className={styles.initiativeSettingsButton}
          isOpen={isDiceRollerSettingsOpen}
          onOpenChange={onDiceRollerSettingsOpenChange}
        />
      </div>
    </div>
  );
}

export default InitiativeReferenceFooter;
