import { useState } from "react";
import type { EconomyType } from "../../../../../../pages/CharactersPage/actionEconomy";
import { createChargesCardUsage } from "../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import { understandingOfDeathResource } from "../../../../../../pages/CharactersPage/feats/runtime/arcaneUndertaker";
import type { Character } from "../../../../../../types";
import FeatureOptInToggle from "../../../FeatureOptInToggle/FeatureOptInToggle";
import { CommonActionFooter } from "./CommonAction";
import type { CommonActionPathState } from "./commonActionEconomy";
import styles from "./ActionsWidget.module.css";

type HelpActionFooterProps = {
  character: Character;
  confirmLabel: string;
  actionPaths: CommonActionPathState[];
  onConfirmPath: (economyType: EconomyType, useUnderstandingOfDeath: boolean) => void;
};

export default function HelpActionFooter({
  character,
  confirmLabel,
  actionPaths,
  onConfirmPath
}: HelpActionFooterProps) {
  const [isSelected, setIsSelected] = useState(false);
  const total = understandingOfDeathResource.total(character);
  const remaining = understandingOfDeathResource.remaining(character);
  const canUseUnderstandingOfDeath = remaining > 0;
  const footer = (
    <CommonActionFooter
      confirmLabel={confirmLabel}
      actionPaths={actionPaths}
      onConfirmPath={(economyType) =>
        onConfirmPath(economyType, canUseUnderstandingOfDeath && isSelected)
      }
    />
  );

  if (total === 0) return footer;

  return (
    <div className={styles.footerActionStack}>
      <FeatureOptInToggle
        label={understandingOfDeathResource.label}
        checked={canUseUnderstandingOfDeath && isSelected}
        disabled={
          !canUseUnderstandingOfDeath || actionPaths.every((path) => path.disabledReason !== null)
        }
        title={
          canUseUnderstandingOfDeath
            ? "Help stabilize a creature at 0 Hit Points."
            : "Recharges on a Long Rest."
        }
        usage={createChargesCardUsage(remaining, total)}
        onCheckedChange={setIsSelected}
      />
      {footer}
    </div>
  );
}
