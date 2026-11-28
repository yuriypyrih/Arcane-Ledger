import { useState } from "react";
import type { EconomyType } from "../../../../../../pages/CharactersPage/actionEconomy";
import { createChargesCardUsage } from "../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import { sharpEyeResource } from "../../../../../../pages/CharactersPage/feats/runtime/ravenloftResources";
import type { Character } from "../../../../../../types";
import FeatureOptInToggle from "../../../FeatureOptInToggle/FeatureOptInToggle";
import { CommonActionFooter } from "./CommonAction";
import type { CommonActionPathState } from "./commonActionEconomy";
import styles from "./ActionsWidget.module.css";

type Props = {
  character: Character;
  confirmLabel: string;
  actionPaths: CommonActionPathState[];
  onConfirmPath: (economyType: EconomyType, useSharpEye: boolean) => void;
};

export default function SharpEyeActionFooter({
  character,
  confirmLabel,
  actionPaths,
  onConfirmPath
}: Props) {
  const [selected, setSelected] = useState(false);
  const total = sharpEyeResource.total(character);
  const remaining = sharpEyeResource.remaining(character);
  const useSharpEye = selected && remaining > 0;

  return (
    <div className={styles.footerActionStack}>
      <FeatureOptInToggle
        label={sharpEyeResource.label}
        checked={useSharpEye}
        disabled={remaining === 0 || actionPaths.every((path) => path.disabledReason !== null)}
        title="Record a charge after a successful check."
        usage={createChargesCardUsage(remaining, total)}
        onCheckedChange={setSelected}
      />
      <CommonActionFooter
        confirmLabel={confirmLabel}
        actionPaths={actionPaths}
        onConfirmPath={(economyType) => onConfirmPath(economyType, useSharpEye)}
      />
    </div>
  );
}
