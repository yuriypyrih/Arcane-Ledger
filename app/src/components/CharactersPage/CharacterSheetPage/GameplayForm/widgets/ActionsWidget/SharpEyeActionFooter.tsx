import { useState } from "react";
import type { EconomyType } from "../../../../../../pages/CharactersPage/actionEconomy";
import { createChargesCardUsage } from "../../../../../../pages/CharactersPage/classFeatures/cardUsage";
import {
  getSharpEyeSkillOptions,
  sharpEyeResource,
  type SharpEyeCheck
} from "../../../../../../pages/CharactersPage/feats/runtime/ravenloftResources";
import { getDiceRollerBehaviorPreference } from "../../../../../../storage/preferences";
import type { Character, SkillName } from "../../../../../../types";
import NumberInput from "../../../../FormInputs/NumberInput";
import SelectInput from "../../../../FormInputs/SelectInput";
import FeatureOptInToggle from "../../../FeatureOptInToggle/FeatureOptInToggle";
import { CommonActionFooter } from "./CommonAction";
import type { CommonActionPathState } from "./commonActionEconomy";
import styles from "./ActionsWidget.module.css";

type Props = {
  character: Character;
  actionKey: string;
  actionName: string;
  confirmLabel: string;
  actionPaths: CommonActionPathState[];
  onConfirmPath: (economyType: EconomyType, check?: SharpEyeCheck) => void;
};

export default function SharpEyeActionFooter({
  character,
  actionKey,
  actionName,
  confirmLabel,
  actionPaths,
  onConfirmPath
}: Props) {
  const [selected, setSelected] = useState(false);
  const [skill, setSkill] = useState<SkillName | undefined>();
  const [dcInput, setDcInput] = useState("");
  const [succeeded, setSucceeded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const total = sharpEyeResource.total(character);
  const remaining = sharpEyeResource.remaining(character);
  const enabled = selected && remaining > 0;
  const roll = enabled && getDiceRollerBehaviorPreference() === "full_auto";
  const dc = Number(dcInput);
  const check = !enabled
    ? undefined
    : roll
      ? skill && dcInput.trim() && Number.isInteger(dc) && dc >= 0
        ? { kind: "roll" as const, skill, dc }
        : undefined
      : { kind: "manual" as const, succeeded };

  return (
    <div className={styles.footerActionStack}>
      <FeatureOptInToggle
        label="Sharp Eye"
        checked={enabled}
        disabled={remaining === 0 || actionPaths.every((path) => path.disabledReason !== null)}
        usage={createChargesCardUsage(remaining, total)}
        onCheckedChange={setSelected}
      />
      {roll ? (
        <>
          <label className={styles.footerOptionField}>
            <span>Skill</span>
            <SelectInput
              compact
              value={skill ?? ""}
              onChange={(event) =>
                setSkill(
                  getSharpEyeSkillOptions(actionKey).find((option) => option === event.target.value)
                )
              }
            >
              <option value="" disabled>
                Choose a skill
              </option>
              {getSharpEyeSkillOptions(actionKey).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </SelectInput>
          </label>
          <label className={styles.footerOptionField}>
            <span>Difficulty Class</span>
            <NumberInput
              min={0}
              step={1}
              value={dcInput}
              onChange={(event) => setDcInput(event.target.value)}
            />
          </label>
        </>
      ) : enabled ? (
        <FeatureOptInToggle
          label="Check succeeded"
          title="Roll the check with Advantage. Mark success to spend one charge."
          checked={succeeded}
          onCheckedChange={setSucceeded}
        />
      ) : null}
      <CommonActionFooter
        confirmLabel={roll ? "Roll Check" : confirmLabel}
        actionPaths={
          enabled && !check
            ? actionPaths.map((path) => ({
                ...path,
                disabledReason: path.disabledReason ?? "Choose a skill and enter the DC."
              }))
            : actionPaths
        }
        onConfirmPath={(economyType) => onConfirmPath(economyType, check)}
        diceSettings={
          roll ? { actionName, isOpen: settingsOpen, onOpenChange: setSettingsOpen } : undefined
        }
      />
    </div>
  );
}
